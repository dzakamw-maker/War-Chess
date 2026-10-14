import React from 'react';

export const WarRoomEnvironment: React.FC = () => {
  return (
    <group>
      {/* Atmospheric Medieval Depth Fog */}
      <fogExp2 attach="fog" args={['#080a10', 0.038]} />

      {/* Medieval Castle Chamber Floor / Dark Stone War Table Base */}
      <mesh position={[0, -0.3, 0]} receiveShadow>
        <cylinderGeometry args={[16, 17, 0.4, 48]} />
        <meshStandardMaterial
          color="#0f172a"
          roughness={0.85}
          metalness={0.15}
        />
      </mesh>

      {/* Outer Chamber Stone Floor (Darker Vignette) */}
      <mesh position={[0, -0.55, 0]} receiveShadow>
        <cylinderGeometry args={[32, 34, 0.3, 48]} />
        <meshStandardMaterial
          color="#06080e"
          roughness={0.95}
          metalness={0.05}
        />
      </mesh>

      {/* Left Wall Torch / Braziers (Warm Amber Glow) */}
      <pointLight
        position={[-7.5, 4.5, -6]}
        color="#f59e0b"
        intensity={2.2}
        distance={22}
        decay={2}
      />

      {/* Right Wall Torch / Braziers (Warm Crimson-Amber Glow) */}
      <pointLight
        position={[7.5, 4.5, 6]}
        color="#ea580c"
        intensity={2.0}
        distance={22}
        decay={2}
      />

      {/* Subtle Blue Moonlight Rim Light from Above */}
      <directionalLight
        position={[-8, 14, -10]}
        color="#38bdf8"
        intensity={0.35}
      />
    </group>
  );
};
