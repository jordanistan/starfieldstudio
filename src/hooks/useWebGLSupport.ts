import { useState, useEffect } from 'react';

export const useWebGLSupport = () => {
  const [supportsWebGL, setSupportsWebGL] = useState<boolean>(false);
  const [checkingSupport, setCheckingSupport] = useState<boolean>(true);

  useEffect(() => {
    const checkWebGLSupport = () => {
      try {
        // Try to create a WebGL context
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        // If we got a context, then WebGL is supported
        setSupportsWebGL(gl !== null);
      } catch (e) {
        // An error occurred, WebGL is not supported
        setSupportsWebGL(false);
        console.warn('WebGL not supported:', e);
      } finally {
        setCheckingSupport(false);
      }
    };

    // Add a small delay to simulate a more complex check
    setTimeout(() => {
      checkWebGLSupport();
    }, 500);
  }, []);

  return { supportsWebGL, checkingSupport };
};