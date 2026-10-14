import { Chess, type Square } from 'chess.js';
import type {
  BoardPiece,
  Color,
  DrawReason,
  MoveEvent,
  MoveInput,
  MoveResult,
  PieceType,
} from './types.js';

export interface ChessGame {
  chess: Chess;
  getFen(): string;
  getTurn(): Color;
  isGameOver(): boolean;
  getLegalMoves(square?: string): string[];
  getBoardPieces(): BoardPiece[];
  getKingSquare(color: Color): string | null;
  isPromotionMove(from: string, to: string): boolean;
}

export function createChessGame(initialFen?: string): ChessGame {
  const chess = new Chess(initialFen);

  const game: ChessGame = {
    chess,
    getFen() {
      return chess.fen();
    },
    getTurn() {
      return chess.turn() as Color;
    },
    isGameOver() {
      return chess.isGameOver();
    },
    getLegalMoves(square?: string) {
      if (square) {
        const moves = chess.moves({ square: square as Square, verbose: true });
        return moves.map((m) => m.to);
      }
      return chess.moves();
    },
    getBoardPieces() {
      const board = chess.board();
      const pieces: BoardPiece[] = [];
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const cell = board[r][c];
          if (cell) {
            pieces.push({
              id: `${cell.color}_${cell.type}_${cell.square}`,
              square: cell.square,
              type: cell.type as PieceType,
              color: cell.color as Color,
            });
          }
        }
      }
      return pieces;
    },
    getKingSquare(color: Color) {
      const board = chess.board();
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const cell = board[r][c];
          if (cell && cell.type === 'k' && cell.color === color) {
            return cell.square;
          }
        }
      }
      return null;
    },
    isPromotionMove(from: string, to: string) {
      const piece = chess.get(from as Square);
      if (!piece || piece.type !== 'p') return false;

      const targetRank = to[1];
      const isLegal = game.getLegalMoves(from).includes(to);
      if (!isLegal) return false;

      if (piece.color === 'w' && targetRank === '8') return true;
      if (piece.color === 'b' && targetRank === '1') return true;

      return false;
    },
  };

  return game;
}

/**
 * applyMove — Single point of entry for all game state mutations.
 * LG-01: Validates legal moves via chess.js (castling, en passant, promotion, check, checkmate, draws)
 * LG-02: Pure chess logic without any 3D/DOM imports
 * LG-03: Emits structured MoveEvent for the visual presentation layer
 */
export function applyMove(game: ChessGame, moveInput: MoveInput): MoveResult {
  const { chess } = game;

  try {
    const move = chess.move({
      from: moveInput.from as Square,
      to: moveInput.to as Square,
      promotion: moveInput.promotion,
    });

    if (!move) {
      return { success: false, error: 'Illegal move' };
    }

    const isCheck = chess.inCheck();
    const isCheckmate = chess.isCheckmate();
    const isDraw = chess.isDraw();

    let drawReason: DrawReason | undefined;
    if (isDraw) {
      if (chess.isStalemate()) {
        drawReason = 'stalemate';
      } else if (chess.isThreefoldRepetition()) {
        drawReason = 'threefold';
      } else if (chess.isInsufficientMaterial()) {
        drawReason = 'insufficient_material';
      } else {
        drawReason = '50_move';
      }
    }

    const isEnPassant = move.flags.includes('e');
    let capturedSquare: string = move.to;
    if (isEnPassant) {
      // In en passant, captured pawn is on the same file as `to`, but on the rank of `from`
      capturedSquare = `${move.to[0]}${move.from[1]}`;
    }

    let castle: 'k' | 'q' | undefined;
    if (move.flags.includes('k')) {
      castle = 'k';
    } else if (move.flags.includes('q')) {
      castle = 'q';
    }

    const event: MoveEvent = {
      from: move.from,
      to: move.to,
      piece: move.piece as PieceType,
      color: move.color as Color,
      captured: move.captured
        ? {
            piece: move.captured as PieceType,
            square: capturedSquare,
          }
        : undefined,
      promotion: move.promotion ? (move.promotion as PieceType) : undefined,
      castle,
      isEnPassant,
      isCheck,
      isCheckmate,
      isDraw,
      drawReason,
      san: move.san,
      fenAfter: chess.fen(),
    };

    return {
      success: true,
      event,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid move';
    return { success: false, error: message };
  }
}
