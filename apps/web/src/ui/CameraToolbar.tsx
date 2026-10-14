import React from 'react';
import { useGameStore } from '../store/gameStore';
import { Target, RefreshCw, Compass } from 'lucide-react';

export const CameraToolbar: React.FC = () => {
  const isTacticalView = useGameStore((s) => s.isTacticalView);
  const viewPerspective = useGameStore((s) => s.viewPerspective);
  const toggleTacticalView = useGameStore((s) => s.toggleTacticalView);
  const flipPerspective = useGameStore((s) => s.flipPerspective);
  const resetCamera = useGameStore((s) => s.resetCamera);

  return (
    <div className="absolute bottom-16 right-4 sm:bottom-4 sm:right-4 z-40 flex items-center gap-1.5 bg-zinc-900/85 backdrop-blur-md p-1.5 rounded-2xl border border-zinc-800 shadow-2xl pointer-events-auto">
      {/* Tactical Snap Button */}
      <button
        onClick={toggleTacticalView}
        title="Toggle Tactical Snap (Space)"
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition active:scale-95 ${
          isTacticalView
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/10'
            : 'hover:bg-zinc-800 text-zinc-300 border border-transparent'
        }`}
      >
        <Target className={`w-4 h-4 ${isTacticalView ? 'text-emerald-400 animate-pulse' : 'text-zinc-400'}`} />
        <span className="hidden sm:inline">
          {isTacticalView ? 'Top-Down' : 'Tactical Snap'}
        </span>
        <kbd className="hidden sm:inline text-[9px] bg-zinc-800/80 px-1.5 py-0.5 rounded text-zinc-400 border border-zinc-700">
          Space
        </kbd>
      </button>

      {/* Flip View Button */}
      <button
        onClick={flipPerspective}
        title="Flip Perspective 180° (F)"
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-zinc-800 text-zinc-300 transition active:scale-95"
      >
        <RefreshCw className="w-4 h-4 text-sky-400" />
        <span className="hidden sm:inline">
          {viewPerspective === 'white' ? 'White' : 'Black'}
        </span>
        <kbd className="hidden sm:inline text-[9px] bg-zinc-800/80 px-1.5 py-0.5 rounded text-zinc-400 border border-zinc-700">
          F
        </kbd>
      </button>

      {/* Reset Center View Button */}
      <button
        onClick={resetCamera}
        title="Reset Camera View (R)"
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-zinc-800 text-zinc-300 transition active:scale-95"
      >
        <Compass className="w-4 h-4 text-amber-400" />
        <span className="hidden sm:inline">Reset</span>
        <kbd className="hidden sm:inline text-[9px] bg-zinc-800/80 px-1.5 py-0.5 rounded text-zinc-400 border border-zinc-700">
          R
        </kbd>
      </button>
    </div>
  );
};
