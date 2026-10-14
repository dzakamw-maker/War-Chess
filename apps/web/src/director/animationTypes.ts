import type { MoveEvent, PieceType } from '@war-chess/core';

export type AnimationType =
  | 'QUIET_MOVE'
  | 'KNIGHT_JUMP'
  | 'CAPTURE'
  | 'CASTLE'
  | 'EN_PASSANT'
  | 'PROMOTION';

export type CaptureSubPhase = 'APPROACH' | 'LUNGE_HIT' | 'VICTIM_DEATH';
export type CastleSubPhase = 'KING_MOVE' | 'ROOK_MOVE';

export interface PieceTransform {
  position: [number, number, number];
  rotation: [number, number, number]; // Euler angles [rx, ry, rz]
  scale: [number, number, number];
  opacity: number;
}

export interface ImpactEffect {
  id: string;
  position: [number, number, number];
  progress: number; // 0 to 1
  color: string;
  attackerPieceType?: PieceType;
}

export interface ActiveAnimation {
  event: MoveEvent;
  type: AnimationType;
  totalDurationMs: number;
  elapsedMs: number;
  subPhase?: CaptureSubPhase | CastleSubPhase;
  subPhaseElapsedMs: number;
  subPhaseDurationMs: number;
  // Dynamic piece references
  attackerPieceType: PieceType;
  fromCoords: [number, number, number];
  toCoords: [number, number, number];
  // For capture
  victimCoords?: [number, number, number];
  victimPieceId?: string;
  // For castle
  rookFromCoords?: [number, number, number];
  rookToCoords?: [number, number, number];
}
