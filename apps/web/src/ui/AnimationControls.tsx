import React, { useEffect, useState } from 'react';
import { animationDirector } from '../director/AnimationDirector';
import { Zap, FastForward } from 'lucide-react';

export const AnimationControls: React.FC = () => {
  const [isAnimating, setIsAnimating] = useState(animationDirector.getIsAnimating());
  const [isFastMode, setIsFastMode] = useState(animationDirector.getIsFastMode());

  useEffect(() => {
    return animationDirector.subscribe(() => {
      setIsAnimating(animationDirector.getIsAnimating());
      setIsFastMode(animationDirector.getIsFastMode());
    });
  }, []);

  // Keyboard shortcut: Escape to skip animation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        if (animationDirector.getIsAnimating()) {
          e.preventDefault();
          animationDirector.skipAll();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleFastMode = () => {
    animationDirector.setFastMode(!isFastMode);
  };

  const handleSkip = () => {
    animationDirector.skipAll();
  };

  return (
    <div className="flex items-center gap-1.5">
      {/* Fast Animation Toggle Button */}
      <button
        onClick={toggleFastMode}
        title="Toggle Fast Animation (CM-05)"
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition active:scale-95 border ${
          isFastMode
            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-lg shadow-amber-500/10'
            : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border-zinc-800 shadow-xl'
        }`}
      >
        <Zap className={`w-4 h-4 ${isFastMode ? 'text-amber-400 fill-amber-400' : 'text-zinc-400'}`} />
        <span className="hidden md:inline">{isFastMode ? 'Fast Anim (2x)' : 'Fast Anim'}</span>
      </button>

      {/* Skip Animation Button (Appears during animation) */}
      {isAnimating && (
        <button
          onClick={handleSkip}
          title="Skip Animation (Escape / Click anywhere) (CM-06)"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-500 text-zinc-950 hover:bg-amber-400 transition active:scale-95 shadow-xl shadow-amber-500/20 animate-pulse border border-amber-400"
        >
          <FastForward className="w-4 h-4 fill-zinc-950" />
          <span>Skip</span>
          <kbd className="hidden sm:inline text-[9px] bg-zinc-900/20 px-1 py-0.5 rounded text-zinc-950 font-mono">
            Esc
          </kbd>
        </button>
      )}
    </div>
  );
};
