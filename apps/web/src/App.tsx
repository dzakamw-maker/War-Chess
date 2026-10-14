import React from 'react';
import { BoardCanvas } from './scene/BoardCanvas';
import { useGameStore } from './store/gameStore';
import { RotateCcw, Target, ShieldAlert, Sparkles } from 'lucide-react';
import { PromotionModal } from './ui/PromotionModal';
import { GameOverModal } from './ui/GameOverModal';
import { CameraToolbar } from './ui/CameraToolbar';

export const App: React.FC = () => {
  const turn = useGameStore((s) => s.turn);
  const fen = useGameStore((s) => s.fen);
  const isCheck = useGameStore((s) => s.isCheck);
  const isCheckmate = useGameStore((s) => s.isCheckmate);
  const isDraw = useGameStore((s) => s.isDraw);
  const isTacticalView = useGameStore((s) => s.isTacticalView);
  const lastEvent = useGameStore((s) => s.lastEvent);
  const toggleTacticalView = useGameStore((s) => s.toggleTacticalView);
  const resetGame = useGameStore((s) => s.resetGame);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#080a10] font-sans select-none">
      {/* 3D Scene Viewport */}
      <BoardCanvas />

      {/* Promotion Modal Overlay */}
      <PromotionModal />

      {/* Game Over Modal Overlay */}
      <GameOverModal />

      {/* Floating Camera Controls Toolbar */}
      <CameraToolbar />

      {/* Top Header / HUD */}
      <header className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        {/* Brand / Game Title */}
        <div className="flex items-center gap-3 bg-zinc-900/80 backdrop-blur-md px-4 py-2.5 rounded-xl border border-zinc-800 shadow-xl pointer-events-auto">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-lg">
            ⚔
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wider text-zinc-100 flex items-center gap-2">
              WAR CHESS <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">M3</span>
            </h1>
            <p className="text-xs text-zinc-400">Cinematic 3D Chess</p>
          </div>
        </div>

        {/* Turn & Status Indicator */}
        <div className="flex items-center gap-2 bg-zinc-900/80 backdrop-blur-md px-4 py-2 rounded-xl border border-zinc-800 shadow-xl pointer-events-auto">
          <div
            className={`w-3 h-3 rounded-full ${
              turn === 'w' ? 'bg-zinc-100 shadow-[0_0_8px_#ffffff]' : 'bg-zinc-600 shadow-[0_0_8px_#3f3f46]'
            }`}
          />
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            {turn === 'w' ? 'White Turn' : 'Black Turn'}
          </span>

          {isCheck && !isCheckmate && (
            <span className="ml-2 flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
              <ShieldAlert className="w-3 h-3" /> CHECK
            </span>
          )}

          {isCheckmate && (
            <span className="ml-2 flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Sparkles className="w-3 h-3" /> CHECKMATE
            </span>
          )}

          {isDraw && (
            <span className="ml-2 text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
              DRAW
            </span>
          )}
        </div>

        {/* Quick Action Toolbar */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={toggleTacticalView}
            title="Tactical Snap Toggle (Space)"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs transition active:scale-95 shadow-xl border ${
              isTacticalView
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-500/10'
                : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 border-zinc-800'
            }`}
          >
            <Target className={`w-4 h-4 ${isTacticalView ? 'text-emerald-400 animate-pulse' : 'text-emerald-400'}`} />
            <span className="hidden sm:inline">{isTacticalView ? 'Top-Down Active' : 'Tactical Snap'}</span>
            <kbd className="hidden sm:inline text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400 border border-zinc-700">
              Space
            </kbd>
          </button>

          <button
            onClick={resetGame}
            title="Reset Board"
            className="p-2 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 rounded-xl border border-zinc-800 transition active:scale-95 shadow-xl"
          >
            <RotateCcw className="w-4 h-4 text-zinc-400 hover:text-zinc-100" />
          </button>
        </div>
      </header>

      {/* Bottom Footer / Info HUD */}
      <footer className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row items-center justify-between gap-2 pointer-events-none text-xs text-zinc-400">
        <div className="bg-zinc-900/75 backdrop-blur-md px-3 py-1.5 rounded-lg border border-zinc-800/80 font-mono text-[11px] text-zinc-400 truncate max-w-xl pointer-events-auto shadow-lg">
          <span className="text-zinc-500 mr-2">FEN:</span>{fen}
        </div>

        <div className="bg-zinc-900/75 backdrop-blur-md px-3 py-1.5 rounded-lg border border-zinc-800/80 text-[11px] text-zinc-400 pointer-events-auto shadow-lg flex items-center gap-2">
          <span>🎮 Drone: <span className="text-zinc-300">Drag to Orbit</span> • <span className="text-zinc-300">WASD to Fly</span> • <span className="text-zinc-300">Space (Snap)</span> • <span className="text-zinc-300">F (Flip)</span></span>
          {lastEvent && (
            <span className="border-l border-zinc-700 pl-2 text-amber-300 font-mono font-semibold">
              Last: {lastEvent.san}
            </span>
          )}
        </div>
      </footer>
    </div>
  );
};
export default App;
