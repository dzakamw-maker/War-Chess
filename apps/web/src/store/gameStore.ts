import { create } from 'zustand';
import {
  createChessGame,
  applyMove,
  type ChessGame,
  type Color,
  type MoveEvent,
  type MoveInput,
  type PieceType,
} from '@war-chess/core';

interface GameState {
  game: ChessGame;
  fen: string;
  turn: Color;
  selectedSquare: string | null;
  legalMovesForSelected: string[];
  history: MoveEvent[];
  lastEvent: MoveEvent | null;
  preMoveQueue: MoveInput[];
  isCheck: boolean;
  isCheckmate: boolean;
  isDraw: boolean;
  tacticalSnapTrigger: number;

  // Actions
  selectSquare: (square: string | null) => void;
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
    selectedSquare: null,
    legalMovesForSelected: [],
    history: [],
    lastEvent: null,
    preMoveQueue: [],
    isCheck: false,
    isCheckmate: false,
    isDraw: false,
    tacticalSnapTrigger: 0,

    selectSquare: (square: string | null) => {
      const { selectedSquare, legalMovesForSelected, executeMove, game } = get();

      if (!square) {
        set({ selectedSquare: null, legalMovesForSelected: [] });
        return;
      }

      // If already selected and clicked a legal target square, execute move
      if (selectedSquare && legalMovesForSelected.includes(square)) {
        executeMove(selectedSquare, square);
        return;
      }

      // If clicking the already selected square, deselect
      if (selectedSquare === square) {
        set({ selectedSquare: null, legalMovesForSelected: [] });
        return;
      }

      // Query legal moves for the clicked square
      const legalMoves = game.getLegalMoves(square);
      if (legalMoves.length > 0) {
        set({ selectedSquare: square, legalMovesForSelected: legalMoves });
      } else {
        set({ selectedSquare: null, legalMovesForSelected: [] });
      }
    },

    executeMove: (from: string, to: string, promotion?: PieceType) => {
      const { game, history } = get();
      const result = applyMove(game, { from, to, promotion });

      if (result.success && result.event) {
        const event = result.event;
        set({
          fen: event.fenAfter,
          turn: game.getTurn(),
          selectedSquare: null,
          legalMovesForSelected: [],
          history: [...history, event],
          lastEvent: event,
          isCheck: event.isCheck,
          isCheckmate: event.isCheckmate,
          isDraw: event.isDraw,
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
        selectedSquare: null,
        legalMovesForSelected: [],
        history: [],
        lastEvent: null,
        preMoveQueue: [],
        isCheck: false,
        isCheckmate: false,
        isDraw: false,
      });
    },
  };
});
