import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Color, PieceType } from '@war-chess/core';
import {
  KiteShield,
  Broadsword,
  ArcaneStaff,
  CavalryLance,
  ValkyrieWings,
} from './characterParts';

export type CharacterAnimState = 'idle' | 'walk' | 'attack' | 'defensive' | 'victory' | 'kneel';

interface CharacterModelProps {
  type: PieceType;
  color: Color;
  animState?: CharacterAnimState;
  isSelected?: boolean;
}

export const CharacterModel: React.FC<CharacterModelProps> = ({
  type,
  color,
  animState = 'idle',
  isSelected = false,
}) => {
  const rootRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);

  const isWhite = color === 'w';

  // Faction Materials
  const armorColor = isWhite ? '#f8fafc' : '#0f172a'; // Ivory vs Dark Iron
  const trimColor = isWhite ? '#f59e0b' : '#dc2626'; // Imperial Gold vs Blood Crimson
  const metalProps = useMemo(() => ({
    color: armorColor,
    roughness: isWhite ? 0.35 : 0.45,
    metalness: isWhite ? 0.4 : 0.65,
    emissive: isSelected ? (isWhite ? '#f59e0b' : '#ef4444') : '#000000',
    emissiveIntensity: isSelected ? 0.4 : 0,
  }), [isWhite, isSelected, armorColor]);

  const trimProps = useMemo(() => ({
    color: trimColor,
    roughness: 0.25,
    metalness: 0.85,
  }), [trimColor]);

  // Articulated Skeletal Animation Cycle in useFrame
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 3.5;
    if (!torsoRef.current || !rightArmRef.current || !leftArmRef.current || !headRef.current) return;

    switch (animState) {
      case 'idle':
        // Breathing sway
        torsoRef.current.position.y = 0.38 + Math.sin(t) * 0.015;
        headRef.current.rotation.x = Math.sin(t * 0.5) * 0.03;
        rightArmRef.current.rotation.x = Math.sin(t * 0.8) * 0.04;
        leftArmRef.current.rotation.x = -Math.sin(t * 0.8) * 0.04;
        break;

      case 'walk':
        // Marching stride
        torsoRef.current.position.y = 0.38 + Math.abs(Math.sin(t * 2)) * 0.04;
        rightArmRef.current.rotation.x = Math.sin(t * 2) * 0.4;
        leftArmRef.current.rotation.x = -Math.sin(t * 2) * 0.4;
        headRef.current.rotation.x = 0.05;
        break;

      case 'attack':
        // Lunge and weapon strike
        torsoRef.current.position.y = 0.36;
        torsoRef.current.position.z = 0.12;
        rightArmRef.current.rotation.x = -Math.PI / 2.5;
        leftArmRef.current.rotation.x = 0.2;
        break;

      case 'defensive':
        // Guarded posture (King in check)
        torsoRef.current.position.y = 0.35;
        rightArmRef.current.rotation.x = -0.3;
        leftArmRef.current.rotation.x = -0.6; // Raise shield
        headRef.current.rotation.x = -0.15;
        break;

      case 'kneel':
        // Defeated King on knees
        torsoRef.current.position.y = 0.18;
        torsoRef.current.rotation.x = 0.35;
        headRef.current.rotation.x = 0.5; // Bowed head
        rightArmRef.current.rotation.x = 0.6; // Lower weapon
        leftArmRef.current.rotation.x = 0.6;
        break;

      case 'victory':
        // Triumphant salute
        torsoRef.current.position.y = 0.42;
        torsoRef.current.rotation.x = -0.1;
        rightArmRef.current.rotation.x = -Math.PI / 1.5; // Raise weapon high
        leftArmRef.current.rotation.x = -Math.PI / 2;
        headRef.current.rotation.x = -0.25; // Look up proudly
        break;
    }
  });

  return (
    <group ref={rootRef}>
      {/* Stone Pedestal Base */}
      <mesh position={[0, 0.04, 0]} receiveShadow>
        <cylinderGeometry args={[0.34, 0.38, 0.08, 24]} />
        <meshStandardMaterial {...trimProps} />
      </mesh>
      <mesh position={[0, 0.08, 0]} receiveShadow>
        <cylinderGeometry args={[0.3, 0.34, 0.04, 24]} />
        <meshStandardMaterial {...metalProps} />
      </mesh>

      {/* Armored Legs / Greaves */}
      <mesh position={[-0.1, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.07, 0.26, 12]} />
        <meshStandardMaterial {...metalProps} />
      </mesh>
      <mesh position={[0.1, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.07, 0.26, 12]} />
        <meshStandardMaterial {...metalProps} />
      </mesh>

      {/* Main Articulated Torso */}
      <group ref={torsoRef} position={[0, 0.38, 0]}>
        {/* Armored Cuirass Chest */}
        <mesh position={[0, 0.12, 0]} castShadow>
          <boxGeometry args={[type === 'r' ? 0.34 : 0.26, 0.28, 0.18]} />
          <meshStandardMaterial {...metalProps} />
        </mesh>
        {/* Faction Chest Trim / Heraldic Crest */}
        <mesh position={[0, 0.14, 0.095]}>
          <boxGeometry args={[0.12, 0.16, 0.01]} />
          <meshStandardMaterial {...trimProps} />
        </mesh>

        {/* Pauldrons (Shoulder Armor) */}
        <mesh position={[-0.18, 0.22, 0]} rotation={[0, 0, 0.3]} castShadow>
          <sphereGeometry args={[type === 'r' ? 0.12 : 0.08, 12, 12]} />
          <meshStandardMaterial {...trimProps} />
        </mesh>
        <mesh position={[0.18, 0.22, 0]} rotation={[0, 0, -0.3]} castShadow>
          <sphereGeometry args={[type === 'r' ? 0.12 : 0.08, 12, 12]} />
          <meshStandardMaterial {...trimProps} />
        </mesh>

        {/* Head & Helmets */}
        <group ref={headRef} position={[0, 0.32, 0]}>
          {type === 'b' ? (
            // Battle Mage Cowl Hood
            <group>
              <mesh position={[0, 0.04, 0]} castShadow>
                <sphereGeometry args={[0.11, 16, 16]} />
                <meshStandardMaterial color={isWhite ? '#f8fafc' : '#475569'} roughness={0.7} />
              </mesh>
              <mesh position={[0, 0.08, -0.04]} rotation={[-0.3, 0, 0]} castShadow>
                <coneGeometry args={[0.1, 0.16, 12]} />
                <meshStandardMaterial color={isWhite ? '#f8fafc' : '#475569'} roughness={0.7} />
              </mesh>
            </group>
          ) : type === 'k' ? (
            // High King Royal Crown & Visor
            <group>
              <mesh position={[0, 0.04, 0]} castShadow>
                <sphereGeometry args={[0.11, 16, 16]} />
                <meshStandardMaterial {...metalProps} />
              </mesh>
              {/* Royal Crown */}
              <mesh position={[0, 0.13, 0]}>
                <cylinderGeometry args={[0.12, 0.1, 0.08, 8]} />
                <meshStandardMaterial {...trimProps} />
              </mesh>
              {/* Crown Cross */}
              <mesh position={[0, 0.21, 0]}>
                <boxGeometry args={[0.03, 0.09, 0.02]} />
                <meshStandardMaterial {...trimProps} />
              </mesh>
              <mesh position={[0, 0.22, 0]}>
                <boxGeometry args={[0.07, 0.025, 0.02]} />
                <meshStandardMaterial {...trimProps} />
              </mesh>
            </group>
          ) : type === 'q' ? (
            // Valkyrie Crown
            <group>
              <mesh position={[0, 0.04, 0]} castShadow>
                <sphereGeometry args={[0.1, 16, 16]} />
                <meshStandardMaterial {...metalProps} />
              </mesh>
              <mesh position={[0, 0.13, 0]}>
                <coneGeometry args={[0.11, 0.12, 6]} />
                <meshStandardMaterial {...trimProps} />
              </mesh>
            </group>
          ) : (
            // Soldier / Knight Helmet
            <group>
              <mesh position={[0, 0.04, 0]} castShadow>
                <sphereGeometry args={[0.11, 16, 16]} />
                <meshStandardMaterial {...metalProps} />
              </mesh>
              {/* Helmet Plume / Crest */}
              <mesh position={[0, 0.15, -0.02]} rotation={[0.2, 0, 0]} castShadow>
                <boxGeometry args={[0.03, 0.12, 0.16]} />
                <meshStandardMaterial {...trimProps} />
              </mesh>
            </group>
          )}
        </group>

        {/* Right Arm & Weapons */}
        <group ref={rightArmRef} position={[0.2, 0.2, 0]}>
          <mesh position={[0, -0.1, 0]} castShadow>
            <cylinderGeometry args={[0.045, 0.04, 0.22, 10]} />
            <meshStandardMaterial {...metalProps} />
          </mesh>

          {/* Unit-specific Weapon */}
          <group position={[0.02, -0.18, 0.08]}>
            {type === 'b' ? (
              <ArcaneStaff color={color} />
            ) : type === 'n' ? (
              <CavalryLance color={color} />
            ) : type === 'r' ? (
              // Juggernaut Heavy Warhammer
              <group position={[0, 0.2, 0]}>
                <mesh position={[0, 0.1, 0]} castShadow>
                  <cylinderGeometry args={[0.03, 0.03, 0.6, 10]} />
                  <meshStandardMaterial color="#475569" roughness={0.6} />
                </mesh>
                <mesh position={[0, 0.4, 0]} castShadow>
                  <boxGeometry args={[0.16, 0.14, 0.2]} />
                  <meshStandardMaterial {...metalProps} />
                </mesh>
              </group>
            ) : (
              <Broadsword color={color} />
            )}
          </group>
        </group>

        {/* Left Arm & Shield / Accessories */}
        <group ref={leftArmRef} position={[-0.2, 0.2, 0]}>
          <mesh position={[0, -0.1, 0]} castShadow>
            <cylinderGeometry args={[0.045, 0.04, 0.22, 10]} />
            <meshStandardMaterial {...metalProps} />
          </mesh>

          {/* Shield for Footman (Pawn), Knight, and King */}
          {['p', 'n', 'k'].includes(type) && (
            <group position={[-0.04, -0.1, 0.08]}>
              <KiteShield color={color} />
            </group>
          )}
        </group>

        {/* Valkyrie Wings for Queen */}
        {type === 'q' && <ValkyrieWings color={color} />}

        {/* Royal Mantle Cape for King */}
        {type === 'k' && (
          <mesh position={[0, 0.05, -0.12]} rotation={[0.15, 0, 0]} castShadow>
            <boxGeometry args={[0.26, 0.48, 0.02]} />
            <meshStandardMaterial color={isWhite ? '#b91c1c' : '#4c1d95'} roughness={0.8} />
          </mesh>
        )}
      </group>
    </group>
  );
};
