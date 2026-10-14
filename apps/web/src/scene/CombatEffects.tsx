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
        const pieceType = fx.attackerPieceType || 'p';

        if (pieceType === 'b') {
          // Battle Mage: Arcane Glyph & Mystical Orbs
          return (
            <group key={fx.id} position={fx.position}>
              {/* Concentric Arcane Rings */}
              <mesh rotation={[-Math.PI / 2, 0, fx.progress * Math.PI]} position={[0, 0.02, 0]}>
                <ringGeometry args={[ringRadius * 0.8, ringRadius, 24]} />
                <meshBasicMaterial color="#a855f7" transparent opacity={opacity * 0.9} />
              </mesh>
              <mesh rotation={[-Math.PI / 2, 0, -fx.progress * Math.PI * 1.5]} position={[0, 0.025, 0]}>
                <ringGeometry args={[ringRadius * 0.45, ringRadius * 0.55, 16]} />
                <meshBasicMaterial color="#38bdf8" transparent opacity={opacity * 0.8} />
              </mesh>
              {/* Mystical Floating Orbs */}
              {Array.from({ length: 6 }).map((_, i) => {
                const angle = (i * Math.PI * 2) / 6 + fx.progress * 3;
                const dist = ringRadius * 0.75;
                const px = Math.cos(angle) * dist;
                const pz = Math.sin(angle) * dist;
                const py = fx.progress * 0.8;
                return (
                  <mesh key={i} position={[px, py + 0.05, pz]}>
                    <sphereGeometry args={[0.045 * opacity, 8, 8]} />
                    <meshBasicMaterial color="#c084fc" transparent opacity={opacity} />
                  </mesh>
                );
              })}
            </group>
          );
        }

        if (pieceType === 'r') {
          // Rook Juggernaut: Heavy Ground Fracture & Seismic Dust
          return (
            <group key={fx.id} position={fx.position}>
              {/* Heavy Outer Shockwave */}
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
                <ringGeometry args={[ringRadius * 0.6, ringRadius * 1.15, 24]} />
                <meshBasicMaterial color="#d97706" transparent opacity={opacity * 0.9} />
              </mesh>
              {/* Radial Ground Fissures (4 cross cracks) */}
              {Array.from({ length: 4 }).map((_, i) => {
                const angle = (i * Math.PI) / 2;
                return (
                  <mesh
                    key={i}
                    position={[Math.cos(angle) * ringRadius * 0.5, 0.015, Math.sin(angle) * ringRadius * 0.5]}
                    rotation={[-Math.PI / 2, 0, angle]}
                  >
                    <planeGeometry args={[0.08, ringRadius * 0.9]} />
                    <meshBasicMaterial color="#451a03" transparent opacity={opacity * 0.85} />
                  </mesh>
                );
              })}
              {/* Dust / Debris Spikes */}
              {Array.from({ length: 6 }).map((_, i) => {
                const angle = (i * Math.PI * 2) / 6;
                const dist = fx.progress * 0.8;
                return (
                  <mesh key={i} position={[Math.cos(angle) * dist, fx.progress * 0.5, Math.sin(angle) * dist]}>
                    <boxGeometry args={[0.05 * opacity, 0.05 * opacity, 0.05 * opacity]} />
                    <meshBasicMaterial color="#b45309" transparent opacity={opacity} />
                  </mesh>
                );
              })}
            </group>
          );
        }

        if (pieceType === 'q' || pieceType === 'k') {
          // Queen/King: Radiant Solar Flare & Divine Burst
          return (
            <group key={fx.id} position={fx.position}>
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
                <ringGeometry args={[ringRadius * 0.85, ringRadius * 1.2, 32]} />
                <meshBasicMaterial color="#fbbf24" transparent opacity={opacity} />
              </mesh>
              {/* Brilliant Center Flash */}
              {fx.progress < 0.45 && (
                <mesh position={[0, 0.25, 0]}>
                  <sphereGeometry args={[0.35 * (1 - fx.progress * 2.2), 16, 16]} />
                  <meshBasicMaterial color="#ffffff" transparent opacity={1 - fx.progress * 2.2} />
                </mesh>
              )}
              {/* Radiant Light Beams */}
              {Array.from({ length: 8 }).map((_, i) => {
                const angle = (i * Math.PI * 2) / 8;
                const dist = fx.progress * 1.1;
                return (
                  <mesh key={i} position={[Math.cos(angle) * dist, 0.1 + fx.progress * 0.3, Math.sin(angle) * dist]}>
                    <sphereGeometry args={[0.05 * opacity, 8, 8]} />
                    <meshBasicMaterial color="#fef08a" transparent opacity={opacity} />
                  </mesh>
                );
              })}
            </group>
          );
        }

        // Default (Pawn / Knight): Sharp Slash Sparks & Kinetic Shockwave
        return (
          <group key={fx.id} position={fx.position}>
            {/* Horizontal Expanding Shockwave Ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
              <ringGeometry args={[ringRadius * 0.75, ringRadius, 32]} />
              <meshBasicMaterial color={fx.color} transparent opacity={opacity * 0.85} />
            </mesh>

            {/* Core Flash Sphere */}
            {fx.progress < 0.4 && (
              <mesh position={[0, 0.15, 0]}>
                <sphereGeometry args={[0.25 * (1 - fx.progress * 2.5), 16, 16]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={1 - fx.progress * 2.5} />
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
