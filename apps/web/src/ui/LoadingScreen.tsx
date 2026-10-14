import React, { useEffect, useState } from 'react';
import { Shield, Sparkles, Swords } from 'lucide-react';

export const LoadingScreen: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsLoaded(true), 250);
          setTimeout(() => setShouldRender(false), 800);
          return 100;
        }
        // Smooth logarithmic easing progress
        const remaining = 100 - prev;
        const jump = Math.max(2, Math.floor(remaining * 0.18 + Math.random() * 8));
        return Math.min(100, prev + jump);
      });
    }, 60);

    return () => clearInterval(interval);
  }, []);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#080a10] text-zinc-100 transition-opacity duration-500 ease-out select-none ${
        isLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
      }`}
    >
      {/* Ambient War Room Glow Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-amber-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-purple-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-sm w-full px-6 text-center">
        {/* Heraldic Shield Sigil */}
        <div className="relative w-20 h-20 mb-6 flex items-center justify-center rounded-2xl bg-zinc-900/90 border border-amber-500/40 shadow-2xl shadow-amber-500/20">
          <Swords className="w-10 h-10 text-amber-400 animate-pulse" />
          <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
            <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
          </div>
        </div>

        {/* Title & Subtitle */}
        <h1 className="text-2xl font-black tracking-widest text-zinc-100 mb-1 flex items-center gap-2">
          WAR CHESS
        </h1>
        <p className="text-xs font-medium tracking-wider uppercase text-amber-400/90 mb-8">
          The Grand Tactician's Chamber
        </p>

        {/* Progress Bar Container */}
        <div className="w-full bg-zinc-900/90 border border-zinc-800 rounded-full h-3 p-0.5 overflow-hidden shadow-inner mb-3">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 rounded-full transition-all duration-150 ease-out shadow-[0_0_12px_#f59e0b]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Status Text & Percentage */}
        <div className="w-full flex items-center justify-between text-xs text-zinc-400 font-mono">
          <span className="flex items-center gap-1.5 text-zinc-400">
            <Shield className="w-3.5 h-3.5 text-amber-500/70" />
            {progress < 40
              ? 'Menyiapkan Medan Pertempuran...'
              : progress < 80
              ? 'Mempersenjatai Bidak Karakter...'
              : 'Menyalakan Obor War Room...'}
          </span>
          <span className="font-semibold text-amber-400">{progress}%</span>
        </div>
      </div>
    </div>
  );
};
