import React, { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { CameraControls } from '@react-three/drei';
import { Board } from './Board';
import { PiecesManager } from './PiecesManager';
import { useGameStore } from '../store/gameStore';

const CameraController: React.FC = () => {
  const controlsRef = useRef<CameraControls | null>(null);
  const tacticalSnapTrigger = useGameStore((s) => s.tacticalSnapTrigger);
  const isDraggingPiece = useGameStore((s) => s.isDraggingPiece);

  // Initial Camera Setup: Drone / Bird-view at ~45 degrees
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.setLookAt(0, 8, 8, 0, 0, 0, false);
      // Configure transition duration (≤ 300ms as per CM-03)
      controlsRef.current.smoothTime = 0.25;
    }
  }, []);

  // Tactical Snap listener (triggered by Space or HUD button)
  useEffect(() => {
    if (tacticalSnapTrigger > 0 && controlsRef.current) {
      // Top-down tactical overview (90 degrees top down)
      controlsRef.current.setLookAt(0, 10, 0.001, 0, 0, 0, true);
    }
  }, [tacticalSnapTrigger]);

  // Keyboard shortcut: Space for Tactical Snap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        controlsRef.current?.setLookAt(0, 10, 0.001, 0, 0, 0, true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <CameraControls
      ref={controlsRef}
      enabled={!isDraggingPiece}
      minDistance={3}
      maxDistance={20}
      maxPolarAngle={Math.PI / 2.15} // Prevents camera going below the board floor
      minPolarAngle={0.05}
      makeDefault
    />
  );
};

export const BoardCanvas: React.FC = () => {
  return (
    <div className="w-full h-full relative">
      <Canvas
        shadows
        camera={{ position: [0, 8, 8], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
        className="w-full h-full bg-zinc-950"
      >
        <color attach="background" args={['#09090b']} />
        
        {/* Ambient & Soft Fill Lighting */}
        <ambientLight intensity={0.6} />
        <hemisphereLight
          args={['#cbd5e1', '#0f172a', 0.4]}
          position={[0, 20, 0]}
        />

        {/* Key Directional Light for PBR & Shadows */}
        <directionalLight
          position={[6, 12, 6]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={1}
          shadow-camera-far={30}
          shadow-camera-left={-6}
          shadow-camera-right={6}
          shadow-camera-top={6}
          shadow-camera-bottom={-6}
          shadow-bias={-0.0005}
        />

        {/* 3D Board, Pieces, and Camera Rig */}
        <Board />
        <PiecesManager />
        <CameraController />
      </Canvas>
    </div>
  );
};
