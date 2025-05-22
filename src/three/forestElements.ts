import * as THREE from 'three';

export const createTrees = (scene: THREE.Scene) => {
  const trees: THREE.Mesh[] = [];
  
  // Create ground
  const groundGeometry = new THREE.CircleGeometry(50, 64);
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x150a2e,
    roughness: 0.8,
    metalness: 0.2,
    emissive: 0x100a20,
    emissiveIntensity: 0.2
  });
  
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -2;
  ground.receiveShadow = true;
  scene.add(ground);
  
  // Create crystalline ground details
  const crystalGeometry = new THREE.DodecahedronGeometry(0.8, 0);
  
  for (let i = 0; i < 50; i++) {
    const scale = 0.1 + Math.random() * 0.4;
    const crystal = new THREE.Mesh(
      crystalGeometry,
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(
          0.3 + Math.random() * 0.3,
          0.5 + Math.random() * 0.5,
          0.7 + Math.random() * 0.3
        ),
        roughness: 0.2,
        metalness: 0.8,
        transmission: 0.5,
        transparent: true,
        opacity: 0.8,
        emissive: new THREE.Color(
          0.1 + Math.random() * 0.2,
          0.3 + Math.random() * 0.3,
          0.5 + Math.random() * 0.5
        ),
        emissiveIntensity: 0.5
      })
    );
    
    crystal.scale.set(scale, scale, scale);
    crystal.position.set(
      (Math.random() - 0.5) * 40,
      -1.8 + Math.random() * 0.3,
      (Math.random() - 0.5) * 40
    );
    crystal.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    crystal.castShadow = true;
    crystal.receiveShadow = true;
    scene.add(crystal);
  }
  
  // Create bioluminescent trees
  const createTree = (x: number, z: number, height: number, color: THREE.Color) => {
    // Tree trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.4, height, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({
      color: 0x3a2121,
      roughness: 0.9,
      metalness: 0.1,
      emissive: color,
      emissiveIntensity: 0.2
    });
    
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.set(x, height / 2 - 2, z);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    scene.add(trunk);
    trees.push(trunk);
    
    // Tree branches
    const branchCount = Math.floor(3 + Math.random() * 4);
    
    for (let i = 0; i < branchCount; i++) {
      const branchHeight = 1 + Math.random() * (height - 2);
      const branchAngle = Math.random() * Math.PI * 2;
      const branchLength = 0.8 + Math.random() * 2;
      
      const branchGeometry = new THREE.CylinderGeometry(0.05, 0.15, branchLength, 5);
      const branchMaterial = new THREE.MeshStandardMaterial({
        color: 0x3a2121,
        roughness: 0.9,
        metalness: 0.1,
        emissive: color,
        emissiveIntensity: 0.3
      });
      
      const branch = new THREE.Mesh(branchGeometry, branchMaterial);
      branch.rotation.z = Math.PI / 2 + (Math.random() - 0.5) * 0.5;
      branch.rotation.y = branchAngle;
      
      branch.position.set(
        x,
        branchHeight - 2,
        z
      );
      
      const branchTip = new THREE.Vector3(
        Math.cos(branchAngle) * branchLength * 0.5,
        0,
        Math.sin(branchAngle) * branchLength * 0.5
      );
      branch.position.add(branchTip.multiplyScalar(0.6));
      
      branch.castShadow = true;
      branch.receiveShadow = true;
      scene.add(branch);
      trees.push(branch);
      
      // Glowing foliage
      const foliageGeometry = new THREE.SphereGeometry(0.3 + Math.random() * 0.5, 8, 8);
      const foliageMaterial = new THREE.MeshPhysicalMaterial({
        color: color,
        roughness: 0.4,
        metalness: 0.3,
        emissive: color,
        emissiveIntensity: 1.5,
        transparent: true,
        opacity: 0.9
      });
      
      const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
      foliage.position.set(
        branch.position.x + Math.cos(branchAngle) * branchLength * 0.5,
        branch.position.y,
        branch.position.z + Math.sin(branchAngle) * branchLength * 0.5
      );
      foliage.castShadow = true;
      scene.add(foliage);
      trees.push(foliage);
    }
    
    // Create canopy
    const canopyGeometry = new THREE.SphereGeometry(1 + Math.random() * 1.5, 8, 8);
    const canopyMaterial = new THREE.MeshPhysicalMaterial({
      color: color,
      roughness: 0.7,
      metalness: 0.2,
      emissive: color,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.9
    });
    
    const canopy = new THREE.Mesh(canopyGeometry, canopyMaterial);
    canopy.position.set(x, height - 1, z);
    canopy.castShadow = true;
    scene.add(canopy);
    trees.push(canopy);
  };
  
  // Generate random trees
  for (let i = 0; i < 15; i++) {
    const x = (Math.random() - 0.5) * 40;
    const z = (Math.random() - 0.5) * 40;
    const height = 3 + Math.random() * 5;
    
    // Create color with primary aqua/violet tones
    const hue = Math.random() > 0.5 ? 0.5 + Math.random() * 0.1 : 0.7 + Math.random() * 0.1;
    const color = new THREE.Color().setHSL(hue, 0.8, 0.5);
    
    createTree(x, z, height, color);
  }
  
  // Create glowing mushrooms
  const createMushroom = (x: number, z: number) => {
    // Stem
    const stemGeometry = new THREE.CylinderGeometry(0.05, 0.1, 0.3, 8);
    const stemMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.7,
      metalness: 0.2
    });
    
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.position.set(x, -1.85, z);
    stem.castShadow = true;
    stem.receiveShadow = true;
    scene.add(stem);
    
    // Cap
    const capGeometry = new THREE.SphereGeometry(0.15, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    
    // Random color with psychedelic hue
    const hue = Math.random();
    const color = new THREE.Color().setHSL(hue, 0.9, 0.6);
    
    const capMaterial = new THREE.MeshPhysicalMaterial({
      color: color,
      roughness: 0.3,
      metalness: 0.5,
      emissive: color,
      emissiveIntensity: 1.0,
      transparent: true,
      opacity: 0.9
    });
    
    const cap = new THREE.Mesh(capGeometry, capMaterial);
    cap.scale.set(1, 0.5, 1);
    cap.position.set(x, -1.7, z);
    cap.castShadow = true;
    scene.add(cap);
    
    // Glow effect
    const glowGeometry = new THREE.SphereGeometry(0.2, 16, 8);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.4,
      side: THREE.BackSide
    });
    
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.set(x, -1.7, z);
    scene.add(glow);
  };
  
  // Generate random mushrooms
  for (let i = 0; i < 40; i++) {
    const x = (Math.random() - 0.5) * 35;
    const z = (Math.random() - 0.5) * 35;
    createMushroom(x, z);
  }
  
  return { trees, ground };
};