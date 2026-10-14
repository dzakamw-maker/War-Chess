import React from 'react';
import { useGameStore } from '../store/gameStore';
import { Trophy, RotateCcw, Swords } from 'lucide-react';

export const GameOverModal: React.FC = () => {
  const isGameOver = useGameStore((s) => s.isGameOver);
  const isCheckmate = useGameStore((s) => s.isCheckmate);
  const isDraw = useGameStore((s) => s.isDraw);
  const turn = useGameStore((s) => s.turn);
  const history = useGameStore((s) => s.history);
  const resetGame = useGameStore((s) => s.resetGame);

  if (!isGameOver) return null;

  // The one whose turn it was when checkmated is the loser
  const winner = isCheckmate ? (turn === 'w' ? 'Black' : 'White') : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl p-6 max-w-sm w-full shadow-2xl mx-4 text-center">
        <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
          {winner ? <Trophy className="w-7 h-7" /> : <Swords className="w-7 h-7" />}
        </div>

        <h2 className="text-2xl font-extrabold text-zinc-100">
          {winner ? `${winner === 'White' ? 'Putih' : 'Hitam'} Menang!` : 'Permainan Remis!'}
        </h2>

        <p className="text-sm text-zinc-400 mt-1 mb-4">
          {isCheckmate
            ? 'Skakmat! Raja tidak dapat melarikan diri.'
            : isDraw
            ? 'Hasil imbang (Remis).'
            : 'Permainan telah berakhir.'}
        </p>

        <div className="bg-zinc-950/60 rounded-xl p-3 mb-6 border border-zinc-800 text-xs text-zinc-400 flex justify-around">
          <div>
            <div className="text-zinc-500">Total Langkah</div>
            <div className="text-base font-bold text-zinc-200 mt-0.5">{history.length}</div>
          </div>
          <div className="border-r border-zinc-800" />
          <div>
            <div className="text-zinc-500">Status Akhir</div>
            <div className="text-base font-bold text-amber-400 mt-0.5">
              {isCheckmate ? 'Skakmat' : 'Remis'}
            </div>
          </div>
        </div>

        <button
          onClick={resetGame}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm transition active:scale-95 shadow-lg shadow-amber-500/20"
        >
          <RotateCcw className="w-4 h-4" />
          Main Lagi (Reset Board)
        </button>
      </div>
    </div>
  );
};
