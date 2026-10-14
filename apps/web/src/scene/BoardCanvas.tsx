import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Board } from './Board';
import { PiecesManager } from './PiecesManager';
import { CameraRig } from './CameraRig';
import { WarRoomEnvironment } from './WarRoomEnvironment';

export const BoardCanvas: React.FC = () => {
  return (
    <div className="w-full h-full relative">
      <Canvas
        shadows
        camera={{ position: [0, 8, 8], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
        className="w-full h-full bg-[#080a10]"
      >
        <color attach="background" args={['#080a10']} />

        {/* Ambient & Soft Fill Lighting */}
        <ambientLight intensity={0.5} />
        <hemisphereLight
          args={['#cbd5e1', '#0f172a', 0.35]}
          position={[0, 20, 0]}
        />

        {/* Key Directional Light for PBR & Shadows */}
        <directionalLight
          position={[6, 14, 6]}
          intensity={1.35}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={1}
          shadow-camera-far={35}
          shadow-camera-left={-7}
          shadow-camera-right={7}
          shadow-camera-top={7}
          shadow-camera-bottom={-7}
          shadow-bias={-0.0004}
        />

        {/* Medieval War Room Environment: Stone floor, torchlights, depth fog */}
        <WarRoomEnvironment />

        {/* 3D Chess Board & Active Pieces */}
        <Board />
        <PiecesManager />

        {/* Interactive Camera Rig: Continuous WASD, Tactical Snap Toggle, 180° Flip */}
        <CameraRig />
      </Canvas>
    </div>
  );
};
