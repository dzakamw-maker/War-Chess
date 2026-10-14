export type Color = 'w' | 'b';
export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';

export interface MoveInput {
  from: string;
  to: string;
  promotion?: PieceType;
}

export interface CapturedPiece {
  piece: PieceType;
  square: string;
}

export type DrawReason = 'stalemate' | 'threefold' | 'insufficient_material' | '50_move';

export interface MoveEvent {
  from: string;
  to: string;
  piece: PieceType;
  color: Color;
  captured?: CapturedPiece;
  promotion?: PieceType;
  castle?: 'k' | 'q';
  isEnPassant?: boolean;
  isCheck: boolean;
  isCheckmate: boolean;
  isDraw: boolean;
  drawReason?: DrawReason;
  san: string;
  fenAfter: string;
}

export interface MoveResult {
  success: boolean;
  event?: MoveEvent;
  error?: string;
}

export type TimeControlName = 'bullet_1_0' | 'blitz_3_2' | 'rapid_10_0' | 'unlimited';

export interface TimeControlConfig {
  initialSeconds: number; // 0 for unlimited
  incrementSeconds: number;
}

export interface ClockState {
  whiteTimeMs: number;
  blackTimeMs: number;
  activeColor: Color | null;
  isRunning: boolean;
  isFlagFallen: boolean;
  loser?: Color;
}
