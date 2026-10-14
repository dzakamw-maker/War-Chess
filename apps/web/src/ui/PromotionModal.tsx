import React from 'react';
import { useGameStore } from '../store/gameStore';
import type { PieceType } from '@war-chess/core';
import { Crown, Shield, Castle, Crosshair } from 'lucide-react';

interface Option {
  type: PieceType;
  label: string;
  icon: React.ReactNode;
  desc: string;
}

export const PromotionModal: React.FC = () => {
  const pendingPromotion = useGameStore((s) => s.pendingPromotion);
  const turn = useGameStore((s) => s.turn);
  const confirmPromotion = useGameStore((s) => s.confirmPromotion);
  const cancelPromotion = useGameStore((s) => s.cancelPromotion);

  if (!pendingPromotion) return null;

  const options: Option[] = [
    {
      type: 'q',
      label: 'Ratu (Queen)',
      icon: <Crown className="w-6 h-6 text-amber-400" />,
      desc: 'Unit terkuat, serangan multi-arah',
    },
    {
      type: 'n',
      label: 'Kuda (Knight)',
      icon: <Shield className="w-6 h-6 text-sky-400" />,
      desc: 'Melompati unit lain, pola L',
    },
    {
      type: 'r',
      label: 'Benteng (Rook)',
      icon: <Castle className="w-6 h-6 text-emerald-400" />,
      desc: 'Jangkauan lurus horizontal & vertikal',
    },
    {
      type: 'b',
      label: 'Gajah (Bishop)',
      icon: <Crosshair className="w-6 h-6 text-purple-400" />,
      desc: 'Jangkauan diagonal cepat',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl p-6 max-w-md w-full shadow-2xl mx-4 text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 text-2xl font-bold">
          ⭐
        </div>
        <h2 className="text-xl font-bold text-zinc-100">Promosi Pion</h2>
        <p className="text-xs text-zinc-400 mt-1 mb-5">
          Pion {turn === 'w' ? 'Putih' : 'Hitam'} telah mencapai baris akhir. Pilih unit tempur baru:
        </p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {options.map((opt) => (
            <button
              key={opt.type}
              onClick={() => confirmPromotion(opt.type)}
              className="flex flex-col items-center justify-center p-4 rounded-xl bg-zinc-800/80 hover:bg-zinc-750 border border-zinc-700 hover:border-amber-500/50 transition active:scale-95 text-left group"
            >
              <div className="p-2 rounded-lg bg-zinc-900/60 mb-2 group-hover:scale-110 transition-transform">
                {opt.icon}
              </div>
              <span className="text-sm font-semibold text-zinc-200 group-hover:text-amber-300">
                {opt.label}
              </span>
              <span className="text-[10px] text-zinc-400 mt-0.5 text-center leading-tight">
                {opt.desc}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={cancelPromotion}
          className="text-xs text-zinc-500 hover:text-zinc-300 transition"
        >
          Batalkan Langkah
        </button>
      </div>
    </div>
  );
};
