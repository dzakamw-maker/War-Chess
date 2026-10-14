import React, { useMemo } from 'react';
import type { Color, PieceType } from '@war-chess/core';

interface PieceGeometryProps {
  type: PieceType;
  color: Color;
  isSelected?: boolean;
}

export const PieceGeometry: React.FC<PieceGeometryProps> = ({
  type,
  color,
  isSelected,
}) => {
  // Material properties based on piece faction color
  const materialProps = useMemo(() => {
    const isWhite = color === 'w';
    return {
      color: isWhite ? '#f8fafc' : '#1e293b',
      roughness: isWhite ? 0.3 : 0.4,
      metalness: isWhite ? 0.15 : 0.3,
      emissive: isSelected ? (isWhite ? '#f59e0b' : '#d97706') : '#000000',
      emissiveIntensity: isSelected ? 0.45 : 0,
    };
  }, [color, isSelected]);

  switch (type) {
    case 'p': // Pawn (Foot soldier)
      return (
        <group>
          {/* Base */}
          <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.26, 0.3, 0.16, 24]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          {/* Stem */}
          <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.13, 0.22, 0.32, 24]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          {/* Collar ring */}
          <mesh position={[0, 0.46, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.16, 0.16, 0.04, 24]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          {/* Head sphere */}
          <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
            <sphereGeometry args={[0.15, 24, 24]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
        </group>
      );

    case 'r': // Rook (Fortress / Juggernaut)
      return (
        <group>
          {/* Base */}
          <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.3, 0.34, 0.2, 24]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          {/* Pillar body */}
          <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.23, 0.27, 0.48, 24]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          {/* Crown platform */}
          <mesh position={[0, 0.68, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.3, 0.24, 0.08, 24]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          {/* Crenellations (4 battlements) */}
          {[-0.18, 0.18].map((x) =>
            [-0.18, 0.18].map((z) => (
              <mesh key={`${x}_${z}`} position={[x, 0.77, z]} castShadow receiveShadow>
                <boxGeometry args={[0.1, 0.12, 0.1]} />
                <meshStandardMaterial {...materialProps} />
              </mesh>
            ))
          )}
        </group>
      );

    case 'n': // Knight (Cavalry)
      return (
        <group rotation={[0, color === 'w' ? 0 : Math.PI, 0]}>
          {/* Base */}
          <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.3, 0.34, 0.2, 24]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          {/* Arching Neck */}
          <mesh position={[0, 0.38, -0.04]} rotation={[0.25, 0, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.18, 0.24, 0.4, 20]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          {/* Head & Snout */}
          <mesh position={[0, 0.65, 0.1]} rotation={[-0.3, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.22, 0.24, 0.34]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          {/* Pointed Ears */}
          <mesh position={[-0.08, 0.8, -0.03]} rotation={[0.2, 0, -0.2]} castShadow>
            <coneGeometry args={[0.05, 0.14, 12]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          <mesh position={[0.08, 0.8, -0.03]} rotation={[0.2, 0, 0.2]} castShadow>
            <coneGeometry args={[0.05, 0.14, 12]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
        </group>
      );

    case 'b': // Bishop (Archer / Cleric)
      return (
        <group>
          {/* Base */}
          <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.29, 0.33, 0.2, 24]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          {/* Slender Body */}
          <mesh position={[0, 0.44, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.16, 0.24, 0.52, 24]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          {/* Mitre Crown */}
          <mesh position={[0, 0.77, 0]} castShadow receiveShadow>
            <coneGeometry args={[0.18, 0.32, 24]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          {/* Mitre Top finial */}
          <mesh position={[0, 0.95, 0]} castShadow receiveShadow>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
        </group>
      );

    case 'q': // Queen (Valkyrie)
      return (
        <group>
          {/* Base */}
          <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.33, 0.38, 0.24, 24]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          {/* Regal Stem */}
          <mesh position={[0, 0.52, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.18, 0.28, 0.62, 24]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          {/* Crown Rim */}
          <mesh position={[0, 0.86, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.28, 0.18, 0.12, 24]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          {/* Crown Coronet Spikes */}
          {Array.from({ length: 6 }).map((_, i) => {
            const angle = (i * Math.PI * 2) / 6;
            const x = Math.cos(angle) * 0.24;
            const z = Math.sin(angle) * 0.24;
            return (
              <mesh key={i} position={[x, 0.94, z]} castShadow>
                <coneGeometry args={[0.04, 0.1, 12]} />
                <meshStandardMaterial {...materialProps} />
              </mesh>
            );
          })}
          {/* Crown Orb */}
          <mesh position={[0, 0.97, 0]} castShadow>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
        </group>
      );

    case 'k': // King (Monarch)
      return (
        <group>
          {/* Base */}
          <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.35, 0.4, 0.24, 24]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          {/* Majestic Body */}
          <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.2, 0.3, 0.68, 24]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          {/* Royal Cap */}
          <mesh position={[0, 0.92, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.27, 0.2, 0.16, 24]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          {/* Cross on top: Vertical bar */}
          <mesh position={[0, 1.09, 0]} castShadow>
            <boxGeometry args={[0.05, 0.2, 0.05]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          {/* Cross on top: Horizontal bar */}
          <mesh position={[0, 1.13, 0]} castShadow>
            <boxGeometry args={[0.15, 0.05, 0.05]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
        </group>
      );

    default:
      return null;
  }
};
