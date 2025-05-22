import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

export const createPostProcessing = (
  scene: THREE.Scene,
  camera: THREE.Camera,
  renderer: THREE.WebGLRenderer
) => {
  // Create effect composer
  const composer = new EffectComposer(renderer);
  
  // Add render pass
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);
  
  // Add bloom pass
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.7,  // Strength
    0.4,  // Radius
    0.85   // Threshold
  );
  composer.addPass(bloomPass);
  
  // Custom gamma correction and color enhancement
  const finalPass = new ShaderPass({
    uniforms: {
      tDiffuse: { value: null },
      exposure: { value: 1.3 },
      vignette: { value: 0.6 },
      saturation: { value: 1.2 }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform float exposure;
      uniform float vignette;
      uniform float saturation;
      varying vec2 vUv;
      
      vec3 adjustSaturation(vec3 color, float adjustment) {
        vec3 luminance = vec3(0.2126, 0.7152, 0.0722);
        float intensity = dot(color, luminance);
        return mix(vec3(intensity), color, adjustment);
      }
      
      void main() {
        vec4 color = texture2D(tDiffuse, vUv);
        
        // Exposure adjustment
        color.rgb *= exposure;
        
        // Saturation adjustment
        color.rgb = adjustSaturation(color.rgb, saturation);
        
        // Vignette effect
        vec2 uv = vUv - 0.5;
        float vignetteStrength = 1.0 - dot(uv, uv) * vignette;
        color.rgb *= vignetteStrength;
        
        gl_FragColor = color;
      }
    `
  });
  
  finalPass.renderToScreen = true;
  composer.addPass(finalPass);
  
  return { composer, bloomPass };
};