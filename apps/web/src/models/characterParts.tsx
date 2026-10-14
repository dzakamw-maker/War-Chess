import React from 'react';
import type { Color } from '@war-chess/core';

interface PartProps {
  color: Color;
}

// Kite Shield with faction heraldry
export const KiteShield: React.FC<PartProps> = ({ color }) => {
  const isWhite = color === 'w';
  const rimColor = isWhite ? '#f59e0b' : '#dc2626'; // Gold vs Crimson
  const faceColor = isWhite ? '#f8fafc' : '#1e293b'; // Ivory vs Dark Slate

  return (
    <group rotation={[0, -Math.PI / 2, 0]}>
      {/* Shield Face */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.04, 0.45, 0.3]} />
        <meshStandardMaterial color={faceColor} roughness={0.3} metalness={0.2} />
      </mesh>
      {/* Golden/Crimson Shield Rim */}
      <mesh position={[0.015, 0, 0]} castShadow>
        <boxGeometry args={[0.02, 0.47, 0.32]} />
        <meshStandardMaterial color={rimColor} roughness={0.2} metalness={0.8} />
      </mesh>
      {/* Shield Boss / Central Cross Emblem */}
      <mesh position={[0.026, 0.05, 0]}>
        <sphereGeometry args={[0.05, 12, 12]} />
        <meshStandardMaterial color={rimColor} roughness={0.2} metalness={0.9} />
      </mesh>
    </group>
  );
};

// Broadsword with crossguard and pommel
export const Broadsword: React.FC<PartProps> = ({ color }) => {
  const isWhite = color === 'w';
  const hiltColor = isWhite ? '#f59e0b' : '#991b1b';

  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      {/* Blade */}
      <mesh position={[0, 0.28, 0]} castShadow>
        <boxGeometry args={[0.04, 0.45, 0.015]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.15} metalness={0.95} />
      </mesh>
      {/* Blade Point */}
      <mesh position={[0, 0.53, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <boxGeometry args={[0.028, 0.028, 0.015]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.15} metalness={0.95} />
      </mesh>
      {/* Crossguard */}
      <mesh position={[0, 0.06, 0]} castShadow>
        <boxGeometry args={[0.16, 0.025, 0.03]} />
        <meshStandardMaterial color={hiltColor} roughness={0.25} metalness={0.85} />
      </mesh>
      {/* Handle Grip */}
      <mesh position={[0, -0.02, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 0.12, 12]} />
        <meshStandardMaterial color="#27272a" roughness={0.7} />
      </mesh>
      {/* Pommel */}
      <mesh position={[0, -0.09, 0]}>
        <sphereGeometry args={[0.03, 12, 12]} />
        <meshStandardMaterial color={hiltColor} roughness={0.25} metalness={0.85} />
      </mesh>
    </group>
  );
};

// Arcane Staff for Battle Mage (Bishop)
export const ArcaneStaff: React.FC<PartProps> = ({ color }) => {
  const isWhite = color === 'w';
  const crystalColor = isWhite ? '#38bdf8' : '#a855f7'; // Divine Blue vs Shadow Purple

  return (
    <group rotation={[0, 0, 0]}>
      {/* Staff Shaft */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.025, 0.85, 12]} />
        <meshStandardMaterial color="#451a03" roughness={0.7} />
      </mesh>
      {/* Head Ornament Ring */}
      <mesh position={[0, 0.83, 0]} castShadow>
        <torusGeometry args={[0.08, 0.015, 12, 24]} />
        <meshStandardMaterial color={isWhite ? '#f59e0b' : '#64748b'} roughness={0.25} metalness={0.8} />
      </mesh>
      {/* Floating Magic Crystal */}
      <mesh position={[0, 0.83, 0]}>
        <octahedronGeometry args={[0.06]} />
        <meshStandardMaterial
          color={crystalColor}
          emissive={crystalColor}
          emissiveIntensity={1.2}
          roughness={0.1}
        />
      </mesh>
      {/* Staff Light Flare */}
      <pointLight position={[0, 0.83, 0]} color={crystalColor} intensity={0.8} distance={2.5} />
    </group>
  );
};

// Heavy Lance for Cavalry (Knight)
export const CavalryLance: React.FC<PartProps> = ({ color }) => {
  const isWhite = color === 'w';
  const lanceColor = isWhite ? '#f8fafc' : '#1e293b';

  return (
    <group rotation={[Math.PI / 3.5, 0, 0]}>
      {/* Shaft */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.03, 0.7, 12]} />
        <meshStandardMaterial color={lanceColor} roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Hand Guard Vamplate */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <coneGeometry args={[0.09, 0.08, 16]} />
        <meshStandardMaterial color={isWhite ? '#f59e0b' : '#dc2626'} roughness={0.2} metalness={0.8} />
      </mesh>
      {/* Spearhead */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <coneGeometry args={[0.045, 0.22, 12]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.15} metalness={0.95} />
      </mesh>
    </group>
  );
};

// Valkyrie Bladed Wings for Queen
export const ValkyrieWings: React.FC<PartProps> = ({ color }) => {
  const isWhite = color === 'w';
  const wingColor = isWhite ? '#fef08a' : '#7c3aed';

  return (
    <group position={[0, 0.65, -0.1]}>
      {/* Left Wing */}
      <mesh position={[-0.22, 0.15, 0]} rotation={[0, 0.3, 0.4]} castShadow>
        <boxGeometry args={[0.35, 0.1, 0.02]} />
        <meshStandardMaterial
          color={wingColor}
          emissive={wingColor}
          emissiveIntensity={0.35}
          roughness={0.2}
          metalness={0.5}
        />
      </mesh>
      {/* Right Wing */}
      <mesh position={[0.22, 0.15, 0]} rotation={[0, -0.3, -0.4]} castShadow>
        <boxGeometry args={[0.35, 0.1, 0.02]} />
        <meshStandardMaterial
          color={wingColor}
          emissive={wingColor}
          emissiveIntensity={0.35}
          roughness={0.2}
          metalness={0.5}
        />
      </mesh>
    </group>
  );
};
