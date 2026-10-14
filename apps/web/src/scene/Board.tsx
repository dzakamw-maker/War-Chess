import React, { useMemo } from 'react';
import { useGameStore } from '../store/gameStore';

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['1', '2', '3', '4', '5', '6', '7', '8'];

interface TileProps {
  file: string;
  rank: string;
  x: number;
  z: number;
  isLight: boolean;
  isSelected: boolean;
  isLegalTarget: boolean;
  isLastMove: boolean;
  onClick: (square: string) => void;
}

const Tile: React.FC<TileProps> = ({
  file,
  rank,
  x,
  z,
  isLight,
  isSelected,
  isLegalTarget,
  isLastMove,
  onClick,
}) => {
  const square = `${file}${rank}`;

  // Color selection
  let tileColor = isLight ? '#e2e8f0' : '#334155';
  if (isSelected) {
    tileColor = '#f59e0b'; // Amber / Gold highlight
  } else if (isLastMove) {
    tileColor = isLight ? '#fef08a' : '#854d0e'; // Last move highlight
  }

  return (
    <group position={[x, 0, z]}>
      {/* Base square mesh */}
      <mesh
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          onClick(square);
        }}
      >
        <boxGeometry args={[0.98, 0.15, 0.98]} />
        <meshStandardMaterial
          color={tileColor}
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>

      {/* Target marker indicator for legal moves */}
      {isLegalTarget && (
        <mesh position={[0, 0.085, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.2, 0.35, 32]} />
          <meshBasicMaterial color="#10b981" transparent opacity={0.85} />
        </mesh>
      )}
    </group>
  );
};

export const Board: React.FC = () => {
  const selectedSquare = useGameStore((s) => s.selectedSquare);
  const legalMovesForSelected = useGameStore((s) => s.legalMovesForSelected);
  const lastEvent = useGameStore((s) => s.lastEvent);
  const selectSquare = useGameStore((s) => s.selectSquare);

  const tiles = useMemo(() => {
    const list = [];
    for (let rankIdx = 0; rankIdx < 8; rankIdx++) {
      for (let fileIdx = 0; fileIdx < 8; fileIdx++) {
        const file = FILES[fileIdx];
        const rank = RANKS[rankIdx];
        const square = `${file}${rank}`;

        // Coordinates:
        // x: -3.5 (file a) to +3.5 (file h)
        // z: +3.5 (rank 1, white) to -3.5 (rank 8, black)
        const x = fileIdx - 3.5;
        const z = 3.5 - rankIdx;
        const isLight = (fileIdx + rankIdx) % 2 !== 0;

        list.push({
          key: square,
          file,
          rank,
          x,
          z,
          isLight,
        });
      }
    }
    return list;
  }, []);

  return (
    <group position={[0, 0, 0]}>
      {/* Wooden / Slate Border Base */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <boxGeometry args={[8.6, 0.3, 8.6]} />
        <meshStandardMaterial color="#0f172a" roughness={0.7} metalness={0.2} />
      </mesh>

      {/* 64 Board Squares */}
      {tiles.map((tile) => {
        const square = `${tile.file}${tile.rank}`;
        const isSelected = selectedSquare === square;
        const isLegalTarget = legalMovesForSelected.includes(square);
        const isLastMove = lastEvent
          ? lastEvent.from === square || lastEvent.to === square
          : false;

        return (
          <Tile
            key={tile.key}
            file={tile.file}
            rank={tile.rank}
            x={tile.x}
            z={tile.z}
            isLight={tile.isLight}
            isSelected={isSelected}
            isLegalTarget={isLegalTarget}
            isLastMove={isLastMove}
            onClick={selectSquare}
          />
        );
      })}
    </group>
  );
};
