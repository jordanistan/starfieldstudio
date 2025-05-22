import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import CosmicForest from './components/CosmicForest';
import LoadingScreen from './components/LoadingScreen';
import CustomCursor from './components/CustomCursor';
import FallbackImage from './components/FallbackImage';
import EnterButton from './components/EnterButton';
import AudioToggle from './components/AudioToggle';
import { useWebGLSupport } from './hooks/useWebGLSupport';

function App() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [entered, setEntered] = useState(false);
  const { supportsWebGL, checkingSupport } = useWebGLSupport();

  // Simulate loading process
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        const newProgress = prevProgress + (1 + Math.random() * 4);
        if (newProgress >= 100) {
          clearInterval(timer);
          setTimeout(() => setLoading(false), 500);
          return 100;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(timer);
  }, []);

  const handleEnter = () => {
    setEntered(true);
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
  };

  // Show loading screen while checking WebGL support or loading assets
  if (loading || checkingSupport) {
    return <LoadingScreen progress={progress} />;
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Custom cursor effect */}
      <CustomCursor />

      {/* Main content */}
      <main className="relative h-full w-full">
        {supportsWebGL ? (
          <CosmicForest audioEnabled={audioEnabled} />
        ) : (
          <FallbackImage />
        )}

        {/* UI Elements */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-1000 ${entered ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <EnterButton onClick={handleEnter} />
        </div>

        {/* Audio toggle */}
        <AudioToggle 
          audioEnabled={audioEnabled} 
          toggleAudio={toggleAudio} 
        />
      </main>
    </div>
  );
}

export default App;