import type { MoveEvent, PieceType } from '@war-chess/core';
import type {
  ActiveAnimation,
  AnimationType,
  CaptureSubPhase,
  CastleSubPhase,
  ImpactEffect,
  PieceTransform,
} from './animationTypes';
import { squareToCoords } from '../scene/Piece';

function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export class AnimationDirector {
  private queue: MoveEvent[] = [];
  private activeAnimation: ActiveAnimation | null = null;
  private isFastMode = false;
  private transforms = new Map<string, PieceTransform>();
  private dyingPieces = new Map<string, { type: PieceType; color: 'w' | 'b'; transform: PieceTransform }>();
  private impactEffects: ImpactEffect[] = [];
  private listeners = new Set<() => void>();
  private onCompleteCallback?: () => void;

  public setFastMode(fast: boolean): void {
    this.isFastMode = fast;
    this.notify();
  }

  public getIsFastMode(): boolean {
    return this.isFastMode;
  }

  public getIsAnimating(): boolean {
    return this.activeAnimation !== null || this.queue.length > 0;
  }

  public getPieceTransform(squareOrId: string): PieceTransform | undefined {
    return this.transforms.get(squareOrId);
  }

  public getDyingPieces(): Array<{ id: string; type: PieceType; color: 'w' | 'b'; transform: PieceTransform }> {
    const list: Array<{ id: string; type: PieceType; color: 'w' | 'b'; transform: PieceTransform }> = [];
    this.dyingPieces.forEach((val, key) => {
      list.push({ id: key, ...val });
    });
    return list;
  }

  public getImpactEffects(): ImpactEffect[] {
    return this.impactEffects;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((l) => l());
  }

  public enqueue(event: MoveEvent, onComplete?: () => void): void {
    this.queue.push(event);
    if (onComplete) {
      this.onCompleteCallback = onComplete;
    }
    if (!this.activeAnimation) {
      this.startNext();
    }
  }

  public skipAll(): void {
    this.queue = [];
    this.activeAnimation = null;
    this.transforms.clear();
    this.dyingPieces.clear();
    this.impactEffects = [];
    this.notify();
    if (this.onCompleteCallback) {
      this.onCompleteCallback();
      this.onCompleteCallback = undefined;
    }
  }

  private startNext(): void {
    if (this.queue.length === 0) {
      this.activeAnimation = null;
      this.transforms.clear();
      this.dyingPieces.clear();
      this.notify();
      if (this.onCompleteCallback) {
        this.onCompleteCallback();
        this.onCompleteCallback = undefined;
      }
      return;
    }

    const event = this.queue.shift()!;
    let animType: AnimationType = 'QUIET_MOVE';

    if (event.castle) {
      animType = 'CASTLE';
    } else if (event.isEnPassant) {
      animType = 'EN_PASSANT';
    } else if (event.captured) {
      animType = 'CAPTURE';
    } else if (event.promotion) {
      animType = 'PROMOTION';
    } else if (event.piece === 'n') {
      animType = 'KNIGHT_JUMP';
    }

    // Determine durations (theatrical normal mode or fast mode, plus dynamic catch-up)
    const speedMultiplier = this.isFastMode ? 0.5 : this.queue.length > 0 ? 0.65 : 1.0;

    let totalDurationMs = 800 * speedMultiplier;
    let initialSubPhase: CaptureSubPhase | CastleSubPhase | undefined;
    let subPhaseDurationMs = totalDurationMs;

    const fromCoords = squareToCoords(event.from);
    const toCoords = squareToCoords(event.to);
    let victimCoords: [number, number, number] | undefined;
    let victimPieceId: string | undefined;

    if (event.captured) {
      totalDurationMs = 1500 * speedMultiplier;
      initialSubPhase = 'APPROACH';
      subPhaseDurationMs = 600 * speedMultiplier;
      victimCoords = squareToCoords(event.captured.square);
      victimPieceId = `victim_${event.captured.square}`;

      // Register dying piece
      this.dyingPieces.set(victimPieceId, {
        type: event.captured.piece,
        color: event.color === 'w' ? 'b' : 'w',
        transform: {
          position: victimCoords,
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          opacity: 1,
        },
      });
    } else if (event.castle) {
      totalDurationMs = 1100 * speedMultiplier;
      initialSubPhase = 'KING_MOVE';
      subPhaseDurationMs = 600 * speedMultiplier;
    }

    // Rook coords for castling
    let rookFromCoords: [number, number, number] | undefined;
    let rookToCoords: [number, number, number] | undefined;
    if (event.castle) {
      const rank = event.from[1];
      if (event.castle === 'k') {
        rookFromCoords = squareToCoords(`h${rank}`);
        rookToCoords = squareToCoords(`f${rank}`);
      } else {
        rookFromCoords = squareToCoords(`a${rank}`);
        rookToCoords = squareToCoords(`d${rank}`);
      }
    }

    this.activeAnimation = {
      event,
      type: animType,
      totalDurationMs,
      elapsedMs: 0,
      subPhase: initialSubPhase,
      subPhaseElapsedMs: 0,
      subPhaseDurationMs,
      attackerPieceType: event.piece,
      fromCoords,
      toCoords,
      victimCoords,
      victimPieceId,
      rookFromCoords,
      rookToCoords,
    };

    this.notify();
  }

  public tick(deltaSec: number): void {
    const deltaMs = deltaSec * 1000;

    // Tick impact effects
    if (this.impactEffects.length > 0) {
      this.impactEffects = this.impactEffects
        .map((fx) => ({ ...fx, progress: fx.progress + deltaSec * 2.5 }))
        .filter((fx) => fx.progress < 1);
    }

    if (!this.activeAnimation) {
      if (this.impactEffects.length > 0) this.notify();
      return;
    }

    const anim = this.activeAnimation;
    anim.elapsedMs += deltaMs;
    anim.subPhaseElapsedMs += deltaMs;

    const progress = Math.min(1, anim.elapsedMs / anim.totalDurationMs);
    const subProgress = Math.min(1, anim.subPhaseElapsedMs / anim.subPhaseDurationMs);

    // Compute transformations based on animation type
    switch (anim.type) {
      case 'QUIET_MOVE':
      case 'PROMOTION': {
        const t = easeInOutQuad(progress);
        const curX = anim.fromCoords[0] + (anim.toCoords[0] - anim.fromCoords[0]) * t;
        const curZ = anim.fromCoords[2] + (anim.toCoords[2] - anim.fromCoords[2]) * t;
        this.transforms.set(anim.event.to, {
          position: [curX, anim.fromCoords[1], curZ],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          opacity: 1,
        });
        break;
      }

      case 'KNIGHT_JUMP': {
        const t = easeInOutQuad(progress);
        const curX = anim.fromCoords[0] + (anim.toCoords[0] - anim.fromCoords[0]) * t;
        const curZ = anim.fromCoords[2] + (anim.toCoords[2] - anim.fromCoords[2]) * t;
        // Parabolic arc: peak elevation 1.25 units
        const peakHeight = 1.25;
        const arcY = anim.fromCoords[1] + 4 * peakHeight * t * (1 - t);
        // Tilt forward slightly while in flight, leveling upon landing
        const tiltX = Math.sin(t * Math.PI) * 0.25 * (anim.toCoords[2] > anim.fromCoords[2] ? 1 : -1);

        this.transforms.set(anim.event.to, {
          position: [curX, arcY, curZ],
          rotation: [tiltX, 0, 0],
          scale: [1, 1, 1],
          opacity: 1,
        });
        break;
      }

      case 'CASTLE': {
        if (anim.subPhase === 'KING_MOVE') {
          const t = easeInOutQuad(subProgress);
          const curX = anim.fromCoords[0] + (anim.toCoords[0] - anim.fromCoords[0]) * t;
          const curZ = anim.fromCoords[2] + (anim.toCoords[2] - anim.fromCoords[2]) * t;
          this.transforms.set(anim.event.to, {
            position: [curX, anim.fromCoords[1], curZ],
            rotation: [0, 0, 0],
            scale: [1, 1, 1],
            opacity: 1,
          });

          if (subProgress >= 1) {
            anim.subPhase = 'ROOK_MOVE';
            anim.subPhaseElapsedMs = 0;
            anim.subPhaseDurationMs = 500 * (this.isFastMode ? 0.5 : 1);
          }
        } else if (anim.subPhase === 'ROOK_MOVE' && anim.rookFromCoords && anim.rookToCoords) {
          const t = easeInOutQuad(subProgress);
          const curX = anim.rookFromCoords[0] + (anim.rookToCoords[0] - anim.rookFromCoords[0]) * t;
          const curZ = anim.rookFromCoords[2] + (anim.rookToCoords[2] - anim.rookFromCoords[2]) * t;
          const rookSquare = anim.event.castle === 'k' ? `f${anim.event.from[1]}` : `d${anim.event.from[1]}`;

          this.transforms.set(rookSquare, {
            position: [curX, anim.rookFromCoords[1], curZ],
            rotation: [0, 0, 0],
            scale: [1, 1, 1],
            opacity: 1,
          });
        }
        break;
      }

      case 'CAPTURE':
      case 'EN_PASSANT': {
        const victimPos = anim.victimCoords || anim.toCoords;

        if (anim.subPhase === 'APPROACH') {
          // Approach victim: glide to 80% distance
          const t = easeInOutQuad(subProgress);
          const targetApproachX = anim.fromCoords[0] + (anim.toCoords[0] - anim.fromCoords[0]) * 0.8;
          const targetApproachZ = anim.fromCoords[2] + (anim.toCoords[2] - anim.fromCoords[2]) * 0.8;
          const curX = anim.fromCoords[0] + (targetApproachX - anim.fromCoords[0]) * t;
          const curZ = anim.fromCoords[2] + (targetApproachZ - anim.fromCoords[2]) * t;

          this.transforms.set(anim.event.to, {
            position: [curX, anim.fromCoords[1], curZ],
            rotation: [0, 0, 0],
            scale: [1, 1, 1],
            opacity: 1,
          });

          if (subProgress >= 1) {
            anim.subPhase = 'LUNGE_HIT';
            anim.subPhaseElapsedMs = 0;
            anim.subPhaseDurationMs = 300 * (this.isFastMode ? 0.5 : 1);

            // Trigger impact shockwave effect at victim position
            this.impactEffects.push({
              id: `hit_${Date.now()}`,
              position: [victimPos[0], 0.08, victimPos[2]],
              progress: 0,
              color: anim.event.color === 'w' ? '#f59e0b' : '#38bdf8',
            });
          }
        } else if (anim.subPhase === 'LUNGE_HIT') {
          // Lunge into the target square
          const t = easeOutCubic(subProgress);
          const curX = anim.fromCoords[0] * 0.2 + anim.toCoords[0] * 0.8 + (anim.toCoords[0] - anim.fromCoords[0]) * 0.2 * t;
          const curZ = anim.fromCoords[2] * 0.2 + anim.toCoords[2] * 0.8 + (anim.toCoords[2] - anim.fromCoords[2]) * 0.2 * t;

          this.transforms.set(anim.event.to, {
            position: [curX, anim.fromCoords[1], curZ],
            rotation: [0, 0, 0],
            scale: [1, 1, 1],
            opacity: 1,
          });

          if (subProgress >= 1) {
            anim.subPhase = 'VICTIM_DEATH';
            anim.subPhaseElapsedMs = 0;
            anim.subPhaseDurationMs = 600 * (this.isFastMode ? 0.5 : 1);
          }
        } else if (anim.subPhase === 'VICTIM_DEATH') {
          // Attacker rests on destination square
          this.transforms.set(anim.event.to, {
            position: anim.toCoords,
            rotation: [0, 0, 0],
            scale: [1, 1, 1],
            opacity: 1,
          });

          // Victim topples over (rotates 75°) and sinks into floor (y descends, opacity fades to 0)
          if (anim.victimPieceId && this.dyingPieces.has(anim.victimPieceId)) {
            const deathProgress = easeInOutQuad(subProgress);
            const toppleAngle = deathProgress * 1.35; // ~77 degrees
            const sinkY = victimPos[1] - deathProgress * 0.55;
            const fadeOpacity = Math.max(0, 1 - deathProgress);

            this.dyingPieces.set(anim.victimPieceId, {
              ...this.dyingPieces.get(anim.victimPieceId)!,
              transform: {
                position: [victimPos[0], sinkY, victimPos[2]],
                rotation: [toppleAngle, 0, toppleAngle * 0.5],
                scale: [1 - deathProgress * 0.2, 1 - deathProgress * 0.2, 1 - deathProgress * 0.2],
                opacity: fadeOpacity,
              },
            });
          }
        }
        break;
      }
    }

    this.notify();

    if (progress >= 1) {
      this.startNext();
    }
  }
}

// Global Singleton Instance
export const animationDirector = new AnimationDirector();
