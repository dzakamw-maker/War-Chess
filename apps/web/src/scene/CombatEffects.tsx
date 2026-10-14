import React, { useEffect, useState } from 'react';
import { animationDirector } from '../director/AnimationDirector';
import type { ImpactEffect } from '../director/animationTypes';

export const CombatEffects: React.FC = () => {
  const [effects, setEffects] = useState<ImpactEffect[]>([]);

  useEffect(() => {
    return animationDirector.subscribe(() => {
      setEffects([...animationDirector.getImpactEffects()]);
    });
  }, []);

  if (effects.length === 0) return null;

  return (
    <group>
      {effects.map((fx) => {
        const ringRadius = 0.2 + fx.progress * 0.95;
        const opacity = Math.max(0, 1 - fx.progress);

        return (
          <group key={fx.id} position={fx.position}>
            {/* Horizontal Expanding Shockwave Ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
              <ringGeometry args={[ringRadius * 0.75, ringRadius, 32]} />
              <meshBasicMaterial
                color={fx.color}
                transparent
                opacity={opacity * 0.85}
              />
            </mesh>

            {/* Core Flash Sphere */}
            {fx.progress < 0.4 && (
              <mesh position={[0, 0.15, 0]}>
                <sphereGeometry args={[0.25 * (1 - fx.progress * 2.5), 16, 16]} />
                <meshBasicMaterial
                  color="#ffffff"
                  transparent
                  opacity={1 - fx.progress * 2.5}
                />
              </mesh>
            )}

            {/* Spark Burst (8 radial particles) */}
            {Array.from({ length: 8 }).map((_, i) => {
              const angle = (i * Math.PI * 2) / 8;
              const dist = fx.progress * 0.9;
              const px = Math.cos(angle) * dist;
              const pz = Math.sin(angle) * dist;
              const py = Math.sin(fx.progress * Math.PI) * 0.4;

              return (
                <mesh key={i} position={[px, py + 0.1, pz]}>
                  <sphereGeometry args={[0.04 * opacity, 8, 8]} />
                  <meshBasicMaterial color={fx.color} transparent opacity={opacity} />
                </mesh>
              );
            })}
          </group>
        );
      })}
    </group>
  );
};
