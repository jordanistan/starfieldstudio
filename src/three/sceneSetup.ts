import * as THREE from 'three';

export const initScene = (container: HTMLElement) => {
  // Create scene
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x060314, 0.035);
  
  // Create camera
  const camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0, 5, 15);
  camera.lookAt(0, 0, 0);
  
  // Create renderer
  const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  
  // Clear any existing canvas
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
  
  // Append new canvas
  container.appendChild(renderer.domElement);
  
  // Create clock for animations
  const clock = new THREE.Clock();
  
  // Add skybox/background
  const skyboxGeometry = new THREE.SphereGeometry(500, 60, 40);
  const skyboxMaterial = new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load(
      'https://images.pexels.com/photos/998641/pexels-photo-998641.jpeg?auto=compress&cs=tinysrgb&w=2048',
      // Set texture to inside of sphere
      texture => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        texture.colorSpace = THREE.SRGBColorSpace;
      }
    ),
    side: THREE.BackSide
  });
  
  const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
  scene.add(skybox);
  
  return { scene, camera, renderer, clock, controls: null };
};