import * as THREE from 'three';

export const handleCameraMovement = (
  camera: THREE.Camera,
  mousePosition: { x: number; y: number },
  time: number
) => {
  // Subtle breathing effect
  const breathingAmplitude = 0.05;
  const breathingFrequency = 0.5;
  camera.position.y += Math.sin(time * breathingFrequency) * breathingAmplitude * 0.01;
  
  // Subtle rotation effect based on mouse position
  const rotationAmplitude = 0.1;
  if (camera instanceof THREE.PerspectiveCamera) {
    // Look slightly towards mouse position
    camera.rotation.y += (mousePosition.x * rotationAmplitude - camera.rotation.y) * 0.01;
    camera.rotation.x += (mousePosition.y * rotationAmplitude * 0.5 - camera.rotation.x) * 0.01;
  }
};