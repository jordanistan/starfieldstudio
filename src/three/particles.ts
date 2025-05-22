import * as THREE from 'three';

export const createParticles = (scene: THREE.Scene) => {
  // Create particles for cosmic dust and spores
  const particleCount = 2000;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  
  // Create geometry
  const particleGeometry = new THREE.BufferGeometry();
  
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    
    // Position
    const radius = 25;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI - Math.PI / 2;
    
    positions[i3] = radius * Math.cos(theta) * Math.cos(phi);
    positions[i3 + 1] = (Math.random() - 0.25) * 15; // Height
    positions[i3 + 2] = radius * Math.sin(theta) * Math.cos(phi);
    
    // Color - use different color palettes for magic effect
    if (Math.random() > 0.6) {
      // Aqua/cyan particles
      colors[i3] = 0.1 + Math.random() * 0.2;
      colors[i3 + 1] = 0.7 + Math.random() * 0.3;
      colors[i3 + 2] = 0.8 + Math.random() * 0.2;
    } else if (Math.random() > 0.3) {
      // Purple/violet particles
      colors[i3] = 0.5 + Math.random() * 0.3;
      colors[i3 + 1] = 0.1 + Math.random() * 0.2;
      colors[i3 + 2] = 0.8 + Math.random() * 0.2;
    } else {
      // Pink/magenta particles
      colors[i3] = 0.8 + Math.random() * 0.2;
      colors[i3 + 1] = 0.1 + Math.random() * 0.3;
      colors[i3 + 2] = 0.7 + Math.random() * 0.3;
    }
    
    // Size variation
    sizes[i] = Math.random() * 5;
  }
  
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  
  // Create particle material
  const particleMaterial = new THREE.PointsMaterial({
    size: 0.1,
    transparent: true,
    opacity: 0.6,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
    depthWrite: false
  });
  
  // Create texture for particles
  const textureLoader = new THREE.TextureLoader();
  textureLoader.load(
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAFFmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOCAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMTgtMDctMjVUMTM6NDA6NTgrMDI6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDE4LTA3LTI1VDEzOjQxOjQwKzAyOjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDE4LTA3LTI1VDEzOjQxOjQwKzAyOjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9InNSR0IgSUVDNjE5NjYtMi4xIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOmIzMzBlMWI0LTk5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',
    (texture) => {
      particleMaterial.map = texture;
      particleMaterial.needsUpdate = true;
    }
  );
  
  // Create particles system
  const particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);
  
  return particles;
};