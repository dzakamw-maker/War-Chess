import { create } from 'zustand';
import {
  createChessGame,
  applyMove,
  type BoardPiece,
  type ChessGame,
  type Color,
  type MoveEvent,
  type MoveInput,
  type PendingPromotionMove,
  type PieceType,
} from '@war-chess/core';

interface GameState {
  game: ChessGame;
  fen: string;
  turn: Color;
  boardPieces: BoardPiece[];
  selectedSquare: string | null;
  legalMovesForSelected: string[];
  history: MoveEvent[];
  lastEvent: MoveEvent | null;
  preMoveQueue: MoveInput[];
  isCheck: boolean;
  isCheckmate: boolean;
  isDraw: boolean;
  isGameOver: boolean;
  kingInCheckSquare: string | null;
  pendingPromotion: PendingPromotionMove | null;
  isDraggingPiece: boolean;
  tacticalSnapTrigger: number;

  // Actions
  selectSquare: (square: string | null) => void;
  handlePieceDrop: (from: string, to: string) => void;
  confirmPromotion: (promotion: PieceType) => void;
  cancelPromotion: () => void;
  setIsDraggingPiece: (isDragging: boolean) => void;
  executeMove: (from: string, to: string, promotion?: PieceType) => boolean;
  enqueuePreMove: (move: MoveInput) => void;
  triggerTacticalSnap: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set, get) => {
  const initialGame = createChessGame();

  return {
    game: initialGame,
    fen: initialGame.getFen(),
    turn: initialGame.getTurn(),
    boardPieces: initialGame.getBoardPieces(),
    selectedSquare: null,
    legalMovesForSelected: [],
    history: [],
    lastEvent: null,
    preMoveQueue: [],
    isCheck: false,
    isCheckmate: false,
    isDraw: false,
    isGameOver: false,
    kingInCheckSquare: null,
    pendingPromotion: null,
    isDraggingPiece: false,
    tacticalSnapTrigger: 0,

    selectSquare: (square: string | null) => {
      const { selectedSquare, legalMovesForSelected, executeMove, game } = get();

      if (!square) {
        set({ selectedSquare: null, legalMovesForSelected: [] });
        return;
      }

      // If already selected and clicked a legal target square
      if (selectedSquare && legalMovesForSelected.includes(square)) {
        // Check if move requires pawn promotion selection
        if (game.isPromotionMove(selectedSquare, square)) {
          set({
            pendingPromotion: { from: selectedSquare, to: square },
            selectedSquare: null,
            legalMovesForSelected: [],
          });
          return;
        }

        executeMove(selectedSquare, square);
        return;
      }

      // If clicking the already selected square, deselect
      if (selectedSquare === square) {
        set({ selectedSquare: null, legalMovesForSelected: [] });
        return;
      }

      // Query legal moves for the clicked square if it holds a piece of current turn
      const piece = game.chess.get(square as any);
      if (piece && piece.color === game.getTurn()) {
        const legalMoves = game.getLegalMoves(square);
        set({ selectedSquare: square, legalMovesForSelected: legalMoves });
      } else {
        set({ selectedSquare: null, legalMovesForSelected: [] });
      }
    },

    handlePieceDrop: (from: string, to: string) => {
      const { game, executeMove } = get();
      const legalMoves = game.getLegalMoves(from);

      if (legalMoves.includes(to)) {
        if (game.isPromotionMove(from, to)) {
          set({
            pendingPromotion: { from, to },
            selectedSquare: null,
            legalMovesForSelected: [],
          });
          return;
        }
        executeMove(from, to);
      } else {
        // Drop on illegal square - deselect
        set({ selectedSquare: null, legalMovesForSelected: [] });
      }
    },

    confirmPromotion: (promotion: PieceType) => {
      const { pendingPromotion, executeMove } = get();
      if (!pendingPromotion) return;

      executeMove(pendingPromotion.from, pendingPromotion.to, promotion);
      set({ pendingPromotion: null });
    },

    cancelPromotion: () => {
      set({ pendingPromotion: null });
    },

    setIsDraggingPiece: (isDragging: boolean) => {
      set({ isDraggingPiece: isDragging });
    },

    executeMove: (from: string, to: string, promotion?: PieceType) => {
      const { game, history } = get();
      const result = applyMove(game, { from, to, promotion });

      if (result.success && result.event) {
        const event = result.event;
        const nextTurn = game.getTurn();
        const kingSquare = event.isCheck ? game.getKingSquare(nextTurn) : null;

        set({
          fen: event.fenAfter,
          turn: nextTurn,
          boardPieces: game.getBoardPieces(),
          selectedSquare: null,
          legalMovesForSelected: [],
          history: [...history, event],
          lastEvent: event,
          isCheck: event.isCheck,
          isCheckmate: event.isCheckmate,
          isDraw: event.isDraw,
          isGameOver: game.isGameOver(),
          kingInCheckSquare: kingSquare,
        });
        return true;
      }

      return false;
    },

    enqueuePreMove: (move: MoveInput) => {
      set((state) => ({ preMoveQueue: [...state.preMoveQueue, move] }));
    },

    triggerTacticalSnap: () => {
      set((state) => ({ tacticalSnapTrigger: state.tacticalSnapTrigger + 1 }));
    },

    resetGame: () => {
      const newGame = createChessGame();
      set({
        game: newGame,
        fen: newGame.getFen(),
        turn: newGame.getTurn(),
        boardPieces: newGame.getBoardPieces(),
        selectedSquare: null,
        legalMovesForSelected: [],
        history: [],
        lastEvent: null,
        preMoveQueue: [],
        isCheck: false,
        isCheckmate: false,
        isDraw: false,
        isGameOver: false,
        kingInCheckSquare: null,
        pendingPromotion: null,
        isDraggingPiece: false,
      });
    },
  };
});
