import React, { useRef, useState } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import type { BoardPiece } from '@war-chess/core';
import { PieceGeometry } from './PieceGeometry';
import { useGameStore } from '../store/gameStore';

export function squareToCoords(square: string): [number, number, number] {
  const fileIdx = square.charCodeAt(0) - 'a'.charCodeAt(0);
  const rankIdx = parseInt(square[1], 10) - 1;
  const x = fileIdx - 3.5;
  const z = 3.5 - rankIdx;
  return [x, 0.075, z];
}

export function coordsToSquare(x: number, z: number): string | null {
  const fileIdx = Math.round(x + 3.5);
  const rankIdx = Math.round(3.5 - z);
  if (fileIdx < 0 || fileIdx > 7 || rankIdx < 0 || rankIdx > 7) {
    return null;
  }
  const file = String.fromCharCode('a'.charCodeAt(0) + fileIdx);
  const rank = (rankIdx + 1).toString();
  return `${file}${rank}`;
}

interface PieceProps {
  piece: BoardPiece;
}

export const Piece: React.FC<PieceProps> = ({ piece }) => {
  const groupRef = useRef<THREE.Group>(null);
  const selectedSquare = useGameStore((s) => s.selectedSquare);
  const legalMoves = useGameStore((s) => s.legalMovesForSelected);
  const turn = useGameStore((s) => s.turn);
  const selectSquare = useGameStore((s) => s.selectSquare);
  const handlePieceDrop = useGameStore((s) => s.handlePieceDrop);
  const setIsDraggingPiece = useGameStore((s) => s.setIsDraggingPiece);

  const isSelected = selectedSquare === piece.square;
  const isTurn = turn === piece.color;

  const [isDragging, setIsDragging] = useState(false);
  const dragPlaneIntersect = useRef<[number, number]>([0, 0]);

  // Current interpolated 3D position
  const targetCoords = squareToCoords(piece.square);
  const currentPos = useRef(new THREE.Vector3(...targetCoords));

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    if (isDragging) {
      // Follow drag cursor slightly elevated
      const [dx, dz] = dragPlaneIntersect.current;
      groupRef.current.position.set(dx, 0.45, dz);
    } else {
      // Smooth lerp to target square position (~200ms)
      const targetVec = new THREE.Vector3(...targetCoords);
      // Exponential smoothing independent of frame rate
      const alpha = 1 - Math.exp(-18 * delta);
      currentPos.current.lerp(targetVec, alpha);
      groupRef.current.position.copy(currentPos.current);
    }
  });

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();

    // If opponent piece and it's in our legal moves, click = capture
    if (!isTurn) {
      if (selectedSquare && legalMoves.includes(piece.square)) {
        selectSquare(piece.square);
      }
      return;
    }

    // Select this piece
    selectSquare(piece.square);

    // Initiate drag
    setIsDragging(true);
    setIsDraggingPiece(true);
    dragPlaneIntersect.current = [e.point.x, e.point.z];

    // Capture pointer on the mesh
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!isDragging) return;
    e.stopPropagation();
    dragPlaneIntersect.current = [e.point.x, e.point.z];
  };

  const onPointerUp = (e: ThreeEvent<PointerEvent>) => {
    if (!isDragging) return;
    e.stopPropagation();

    setIsDragging(false);
    setIsDraggingPiece(false);
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);

    // Compute destination square
    const [finalX, finalZ] = dragPlaneIntersect.current;
    const destSquare = coordsToSquare(finalX, finalZ);

    if (destSquare && destSquare !== piece.square) {
      handlePieceDrop(piece.square, destSquare);
    }
  };

  return (
    <group
      ref={groupRef}
      position={targetCoords}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <PieceGeometry
        type={piece.type}
        color={piece.color}
        isSelected={isSelected}
      />
    </group>
  );
};
