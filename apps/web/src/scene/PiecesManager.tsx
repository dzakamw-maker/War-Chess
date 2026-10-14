import React, { useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../store/gameStore';
import { Piece } from './Piece';
import { PieceGeometry } from './PieceGeometry';
import { animationDirector } from '../director/AnimationDirector';

export const PiecesManager: React.FC = () => {
  const boardPieces = useGameStore((s) => s.boardPieces);
  const [dyingPieces, setDyingPieces] = useState(animationDirector.getDyingPieces());

  useEffect(() => {
    return animationDirector.subscribe(() => {
      setDyingPieces([...animationDirector.getDyingPieces()]);
    });
  }, []);

  // Step the AnimationDirector on every frame in sync with Three.js
  useFrame((_, delta) => {
    animationDirector.tick(delta);
  });

  return (
    <group>
      {/* Active board pieces */}
      {boardPieces.map((piece) => (
        <Piece key={piece.id} piece={piece} />
      ))}

      {/* Dying pieces currently in combat death animation */}
      {dyingPieces.map((dying) => (
        <group
          key={dying.id}
          position={dying.transform.position}
          rotation={dying.transform.rotation}
          scale={dying.transform.scale}
        >
          <PieceGeometry type={dying.type} color={dying.color} />
        </group>
      ))}
    </group>
  );
};
