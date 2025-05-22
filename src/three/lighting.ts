import * as THREE from 'three';

export const createLighting = (scene: THREE.Scene) => {
  // Ambient light
  const ambientLight = new THREE.AmbientLight(0x332244, 0.3);
  scene.add(ambientLight);
  
  // Directional light (moonlight)
  const moonLight = new THREE.DirectionalLight(0x8888ff, 0.7);
  moonLight.position.set(10, 20, 10);
  moonLight.castShadow = true;
  moonLight.shadow.mapSize.width = 1024;
  moonLight.shadow.mapSize.height = 1024;
  moonLight.shadow.camera.near = 0.5;
  moonLight.shadow.camera.far = 50;
  moonLight.shadow.camera.left = -20;
  moonLight.shadow.camera.right = 20;
  moonLight.shadow.camera.top = 20;
  moonLight.shadow.camera.bottom = -20;
  scene.add(moonLight);
  
  // Point lights for local illumination
  const pointLights: THREE.PointLight[] = [];
  const pointLightColors = [
    0x6a4c93, // Purple
    0x26d0ce, // Aqua
    0xff6bef, // Pink
    0x9d4edd, // Violet
  ];
  
  pointLightColors.forEach((color, index) => {
    const light = new THREE.PointLight(color, 1, 10);
    const angle = (index / pointLightColors.length) * Math.PI * 2;
    const radius = 5 + Math.random() * 5;
    
    light.position.set(
      Math.cos(angle) * radius,
      1 + Math.random() * 3,
      Math.sin(angle) * radius
    );
    
    light.castShadow = true;
    light.shadow.mapSize.width = 512;
    light.shadow.mapSize.height = 512;
    
    scene.add(light);
    pointLights.push(light);
    
    // Add visible light source
    const lightSourceGeometry = new THREE.SphereGeometry(0.1, 16, 8);
    const lightSourceMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.8
    });
    
    const lightSource = new THREE.Mesh(lightSourceGeometry, lightSourceMaterial);
    lightSource.position.copy(light.position);
    scene.add(lightSource);
    
    // Add glow effect
    const glowGeometry = new THREE.SphereGeometry(0.3, 16, 8);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.2,
      side: THREE.BackSide
    });
    
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.copy(light.position);
    scene.add(glow);
  });
  
  // Add one more light that will follow the mouse
  const mouseLight = new THREE.PointLight(0xffffff, 1, 8);
  mouseLight.position.set(0, 2, 5);
  mouseLight.castShadow = true;
  scene.add(mouseLight);
  pointLights.push(mouseLight);
  
  return { ambientLight, pointLights };
};