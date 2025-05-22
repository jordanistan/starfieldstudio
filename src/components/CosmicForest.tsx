import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { initScene } from '../three/sceneSetup';
import { createTrees } from '../three/forestElements';
import { createLighting } from '../three/lighting';
import { createParticles } from '../three/particles';
import { createPostProcessing } from '../three/postProcessing';
import { handleCameraMovement } from '../three/cameraEffects';

interface CosmicForestProps {
  audioEnabled: boolean;
}

const CosmicForest: React.FC<CosmicForestProps> = ({ audioEnabled }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mousePosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    // Set up the scene, camera, and renderer
    const { scene, camera, renderer, controls, clock } = initScene(containerRef.current);
    
    // Add forest elements
    const { trees, ground } = createTrees(scene);
    
    // Add lighting
    const { ambientLight, pointLights } = createLighting(scene);
    
    // Add particles
    const particles = createParticles(scene);
    
    // Add post-processing effects
    const { composer, bloomPass } = createPostProcessing(scene, camera, renderer);

    // Mouse move handler for interactive lighting
    const handleMouseMove = (event: MouseEvent) => {
      mousePosition.current = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1
      };
    };

    // Window resize handler
    const handleResize = () => {
      const width = containerRef.current?.clientWidth || window.innerWidth;
      const height = containerRef.current?.clientHeight || window.innerHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      
      renderer.setSize(width, height);
      composer.setSize(width, height);
    };

    // Animation loop
    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      
      // Update particles
      if (particles) {
        const positions = particles.geometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
          const i3 = i * 3;
          positions.array[i3 + 1] += Math.sin(elapsedTime + i) * 0.005;
        }
        positions.needsUpdate = true;
      }
      
      // Update point lights based on mouse position
      pointLights.forEach((light, index) => {
        const angle = elapsedTime * 0.3 + index * Math.PI / 3;
        light.position.x += Math.sin(angle) * 0.02;
        light.position.z += Math.cos(angle) * 0.02;
        
        // Make the last light follow the mouse
        if (index === pointLights.length - 1) {
          light.position.x = mousePosition.current.x * 5;
          light.position.z = -mousePosition.current.y * 5;
        }
      });
      
      // Update camera
      handleCameraMovement(camera, mousePosition.current, elapsedTime);
      
      // Update controls if any
      if (controls) controls.update();
      
      // Render
      composer.render();
      
      requestAnimationFrame(animate);
    };

    // Start animation loop
    animate();
    
    // Add event listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);
    
    // Initial resize
    handleResize();

    // Audio setup (placeholder)
    if (audioEnabled) {
      // Audio would be initialized here in the future
      console.log('Audio enabled');
    }

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      
      // Dispose of Three.js resources
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          if (object.geometry) object.geometry.dispose();
          
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        }
      });
      
      renderer.dispose();
      if (composer) composer.dispose();
    };
  }, [audioEnabled]);

  return <div ref={containerRef} className="h-full w-full" />;
};

export default CosmicForest;