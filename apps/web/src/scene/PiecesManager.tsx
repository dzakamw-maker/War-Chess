import React from 'react';
import { useGameStore } from '../store/gameStore';
import { Piece } from './Piece';

export const PiecesManager: React.FC = () => {
  const boardPieces = useGameStore((s) => s.boardPieces);

  return (
    <group>
      {boardPieces.map((piece) => (
        <Piece key={piece.id} piece={piece} />
      ))}
    </group>
  );
};
