import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { CameraControls } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../store/gameStore';
import { animationDirector } from '../director/AnimationDirector';
import { squareToCoords } from './Piece';

interface Pose {
  eye: [number, number, number];
  target: [number, number, number];
}

export const CameraRig: React.FC = () => {
  const controlsRef = useRef<CameraControls | null>(null);

  // Zustand State & Triggers
  const isDraggingPiece = useGameStore((s) => s.isDraggingPiece);
  const isTacticalView = useGameStore((s) => s.isTacticalView);
  const viewPerspective = useGameStore((s) => s.viewPerspective);
  const isActionCamEnabled = useGameStore((s) => s.isActionCamEnabled);
  const isVictoryCamActive = useGameStore((s) => s.isVictoryCamActive);
  const setVictoryCamActive = useGameStore((s) => s.setVictoryCamActive);
  const kingInCheckSquare = useGameStore((s) => s.kingInCheckSquare);

  const tacticalSnapTrigger = useGameStore((s) => s.tacticalSnapTrigger);
  const flipPerspectiveTrigger = useGameStore((s) => s.flipPerspectiveTrigger);
  const resetCameraTrigger = useGameStore((s) => s.resetCameraTrigger);

  const toggleTacticalView = useGameStore((s) => s.toggleTacticalView);
  const flipPerspective = useGameStore((s) => s.flipPerspective);
  const resetCamera = useGameStore((s) => s.resetCamera);

  // Saved Drone Pose for Tactical Snap 2-way toggle
  const savedDronePose = useRef<Pose>({
    eye: [0, 8, 8],
    target: [0, 0, 0],
  });

  // Action Cam state & saved pre-capture pose
  const isActionCamActive = useRef(false);
  const preActionCamPose = useRef<Pose>({
    eye: [0, 8, 8],
    target: [0, 0, 0],
  });

  // Victory Cam elapsed tracker
  const victoryCamElapsed = useRef(0);

  // Track active keyboard flight keys (WASD / Arrows)
  const activeKeys = useRef<Set<string>>(new Set());

  // Setup initial camera pose and damping
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.setLookAt(0, 8, 8, 0, 0, 0, false);
      controlsRef.current.smoothTime = 0.24;
      controlsRef.current.draggingSmoothTime = 0.06;
    }
  }, []);

  // Tactical Snap 2-way toggle (Space / HUD button)
  useEffect(() => {
    if (tacticalSnapTrigger === 0 || !controlsRef.current) return;
    const controls = controlsRef.current;

    if (isTacticalView) {
      // Save current drone pose before switching to top-down
      const eyeVec = new THREE.Vector3();
      const targetVec = new THREE.Vector3();
      controls.getPosition(eyeVec);
      controls.getTarget(targetVec);

      savedDronePose.current = {
        eye: [eyeVec.x, eyeVec.y, eyeVec.z],
        target: [targetVec.x, targetVec.y, targetVec.z],
      };

      // Transition to 90-degree tactical top-down view (≤ 300ms)
      controls.setLookAt(0, 10.5, 0.001, 0, 0, 0, true);
    } else {
      // Return to saved drone view
      const { eye, target } = savedDronePose.current;
      controls.setLookAt(eye[0], eye[1], eye[2], target[0], target[1], target[2], true);
    }
  }, [tacticalSnapTrigger, isTacticalView]);

  // Flip Perspective 180° (F / HUD button)
  useEffect(() => {
    if (flipPerspectiveTrigger === 0 || !controlsRef.current) return;
    const controls = controlsRef.current;

    const eyeVec = new THREE.Vector3();
    const targetVec = new THREE.Vector3();
    controls.getPosition(eyeVec);
    controls.getTarget(targetVec);

    if (viewPerspective === 'black') {
      // Rotate 180 to black perspective
      controls.setLookAt(0, 8, -8, 0, 0, 0, true);
    } else {
      // Rotate to white perspective
      controls.setLookAt(0, 8, 8, 0, 0, 0, true);
    }
  }, [flipPerspectiveTrigger, viewPerspective]);

  // Reset Camera View (R / HUD button)
  useEffect(() => {
    if (resetCameraTrigger === 0 || !controlsRef.current) return;
    controlsRef.current.setLookAt(0, 8, 8, 0, 0, 0, true);
  }, [resetCameraTrigger]);

  // Keyboard Event Listeners for Shortcuts & Drone Flight
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is in an input or modal
      if ((e.target as HTMLElement).tagName === 'INPUT') return;

      if (e.code === 'Space') {
        e.preventDefault();
        toggleTacticalView();
        return;
      }

      if (e.code === 'KeyF') {
        e.preventDefault();
        flipPerspective();
        return;
      }

      if (e.code === 'KeyR') {
        e.preventDefault();
        resetCamera();
        return;
      }

      // Track WASD & Arrow keys
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        activeKeys.current.add(e.code);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      activeKeys.current.delete(e.code);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [toggleTacticalView, flipPerspective, resetCamera]);

  // Continuous Drone Pan, Action Cam, and Victory Cam in useFrame
  useFrame((_, delta) => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;

    // 1. Victory Cam Sequence on Checkmate (VS-07)
    if (isVictoryCamActive) {
      victoryCamElapsed.current += delta;
      const kingPos = kingInCheckSquare ? squareToCoords(kingInCheckSquare) : [0, 0, 0];
      const angle = victoryCamElapsed.current * 1.3;
      const radius = 2.8;
      const camX = kingPos[0] + Math.cos(angle) * radius;
      const camZ = kingPos[2] + Math.sin(angle) * radius;
      const camY = 1.6 + Math.sin(victoryCamElapsed.current * 0.8) * 0.25;

      controls.setLookAt(camX, camY, camZ, kingPos[0], 0.35, kingPos[2], false);

      if (victoryCamElapsed.current >= 2.2) {
        victoryCamElapsed.current = 0;
        setVictoryCamActive(false);
        // Smoothly return to standard perspective
        controls.setLookAt(0, 8, 8, 0, 0, 0, true);
      }
      return;
    }

    // 2. Action Cam Close-up during Capture (CM-04)
    const captureInfo = animationDirector.getActiveCaptureInfo();
    const canUseActionCam =
      isActionCamEnabled &&
      !animationDirector.getIsFastMode() &&
      !isTacticalView &&
      !isDraggingPiece;

    if (canUseActionCam && captureInfo) {
      if (!isActionCamActive.current) {
        // Save drone pose before entering action cam
        const eyeVec = new THREE.Vector3();
        const targetVec = new THREE.Vector3();
        controls.getPosition(eyeVec);
        controls.getTarget(targetVec);
        preActionCamPose.current = {
          eye: [eyeVec.x, eyeVec.y, eyeVec.z],
          target: [targetVec.x, targetVec.y, targetVec.z],
        };
        isActionCamActive.current = true;
      }

      const { victimPos, attackerPos } = captureInfo;
      const midX = (victimPos[0] + attackerPos[0]) / 2;
      const midZ = (victimPos[2] + attackerPos[2]) / 2;

      // Compute perpendicular camera offset
      const dx = victimPos[0] - attackerPos[0];
      const dz = victimPos[2] - attackerPos[2];
      const dist = Math.sqrt(dx * dx + dz * dz) || 1;
      const nx = -dz / dist;
      const nz = dx / dist;

      // Position camera at a dramatic side profile close-up (~2.5 units away, elevation 1.25)
      const camDist = 2.5;
      const eyeX = midX + nx * camDist - (dx / dist) * 0.6;
      const eyeZ = midZ + nz * camDist - (dz / dist) * 0.6;
      const eyeY = 1.25;

      controls.setLookAt(eyeX, eyeY, eyeZ, midX, 0.4, midZ, true);
      return;
    } else if (isActionCamActive.current) {
      // Restore pre-capture pose when capture concludes
      isActionCamActive.current = false;
      const { eye, target } = preActionCamPose.current;
      controls.setLookAt(eye[0], eye[1], eye[2], target[0], target[1], target[2], true);
    }

    if (isDraggingPiece || isTacticalView) return;

    // 3. Continuous Drone Pan / Flight (CM-02)
    const keys = activeKeys.current;
    if (keys.size === 0) return;

    const flightSpeed = 8.0 * delta;
    let moveForward = 0;
    let moveSide = 0;

    if (keys.has('KeyW') || keys.has('ArrowUp')) moveForward += flightSpeed;
    if (keys.has('KeyS') || keys.has('ArrowDown')) moveForward -= flightSpeed;
    if (keys.has('KeyD') || keys.has('ArrowRight')) moveSide += flightSpeed;
    if (keys.has('KeyA') || keys.has('ArrowLeft')) moveSide -= flightSpeed;

    if (moveForward !== 0) {
      controls.forward(moveForward, false);
    }
    if (moveSide !== 0) {
      controls.truck(moveSide, 0, false);
    }

    // Boundary check: keep camera target within 6.5 radius from center
    const targetVec = new THREE.Vector3();
    controls.getTarget(targetVec);
    const horizontalDist = Math.sqrt(targetVec.x * targetVec.x + targetVec.z * targetVec.z);
    const maxRadius = 6.5;

    if (horizontalDist > maxRadius) {
      const scale = maxRadius / horizontalDist;
      const clampedTarget = new THREE.Vector3(targetVec.x * scale, targetVec.y, targetVec.z * scale);
      const eyeVec = new THREE.Vector3();
      controls.getPosition(eyeVec);
      const offset = eyeVec.clone().sub(targetVec);
      controls.setLookAt(
        clampedTarget.x + offset.x,
        clampedTarget.y + offset.y,
        clampedTarget.z + offset.z,
        clampedTarget.x,
        clampedTarget.y,
        clampedTarget.z,
        false
      );
    }
  });

  return (
    <CameraControls
      ref={controlsRef}
      enabled={!isDraggingPiece && !isVictoryCamActive}
      minDistance={3.5}
      maxDistance={20}
      maxPolarAngle={Math.PI / 2.15} // Prevents camera from going under the board floor
      minPolarAngle={0.05}
      makeDefault
    />
  );
};
