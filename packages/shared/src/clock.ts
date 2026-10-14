import type {
  ClockState,
  Color,
  TimeControlConfig,
  TimeControlName,
} from './types.js';

export const TIME_CONTROL_PRESETS: Record<TimeControlName, TimeControlConfig> = {
  bullet_1_0: { initialSeconds: 60, incrementSeconds: 0 },
  blitz_3_2: { initialSeconds: 180, incrementSeconds: 2 },
  rapid_10_0: { initialSeconds: 600, incrementSeconds: 0 },
  unlimited: { initialSeconds: 0, incrementSeconds: 0 },
};

export class ChessClock {
  private whiteTimeMs: number;
  private blackTimeMs: number;
  private incrementMs: number;
  private activeColor: Color | null = null;
  private lastTickTimestamp: number | null = null;
  private isRunning = false;
  private isFlagFallen = false;
  private loser?: Color;

  constructor(preset: TimeControlName = 'blitz_3_2') {
    const config = TIME_CONTROL_PRESETS[preset];
    this.whiteTimeMs = config.initialSeconds * 1000;
    this.blackTimeMs = config.initialSeconds * 1000;
    this.incrementMs = config.incrementSeconds * 1000;
  }

  public start(color: Color = 'w', timestamp: number = Date.now()): void {
    if (this.isFlagFallen) return;
    this.activeColor = color;
    this.isRunning = true;
    this.lastTickTimestamp = timestamp;
  }

  public pause(timestamp: number = Date.now()): void {
    this.tick(timestamp);
    this.isRunning = false;
    this.lastTickTimestamp = null;
  }

  public tick(currentTimestamp: number = Date.now()): ClockState {
    if (!this.isRunning || !this.activeColor || this.isFlagFallen) {
      return this.getState();
    }

    if (this.lastTickTimestamp !== null) {
      const elapsed = Math.max(0, currentTimestamp - this.lastTickTimestamp);
      if (this.activeColor === 'w') {
        this.whiteTimeMs = Math.max(0, this.whiteTimeMs - elapsed);
        if (this.whiteTimeMs === 0) {
          this.isFlagFallen = true;
          this.loser = 'w';
          this.isRunning = false;
        }
      } else {
        this.blackTimeMs = Math.max(0, this.blackTimeMs - elapsed);
        if (this.blackTimeMs === 0) {
          this.isFlagFallen = true;
          this.loser = 'b';
          this.isRunning = false;
        }
      }
    }

    this.lastTickTimestamp = currentTimestamp;
    return this.getState();
  }

  public switchTurn(nextColor: Color, timestamp: number = Date.now()): ClockState {
    this.tick(timestamp);

    if (this.isFlagFallen) {
      return this.getState();
    }

    // Add increment to the player who just finished their turn
    if (this.activeColor === 'w') {
      this.whiteTimeMs += this.incrementMs;
    } else if (this.activeColor === 'b') {
      this.blackTimeMs += this.incrementMs;
    }

    this.activeColor = nextColor;
    this.lastTickTimestamp = timestamp;
    return this.getState();
  }

  public getState(): ClockState {
    return {
      whiteTimeMs: this.whiteTimeMs,
      blackTimeMs: this.blackTimeMs,
      activeColor: this.activeColor,
      isRunning: this.isRunning,
      isFlagFallen: this.isFlagFallen,
      loser: this.loser,
    };
  }
}
