import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Volume2, VolumeX } from 'lucide-react';
import CosmicForest from '../components/CosmicForest';
import LoadingScreen from '../components/LoadingScreen';
import CustomCursor from '../components/CustomCursor';
import FallbackImage from '../components/FallbackImage';
import EnterButton from '../components/EnterButton';
import AudioToggle from '../components/AudioToggle';
import { useWebGLSupport } from '../hooks/useWebGLSupport';

function Home() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [entered, setEntered] = useState(false);
  const { supportsWebGL, checkingSupport } = useWebGLSupport();
  const navigate = useNavigate();

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
    setTimeout(() => {
      navigate('/gallery');
    }, 1000);
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
  };

  if (loading || checkingSupport) {
    return <LoadingScreen progress={progress} />;
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      <CustomCursor />

      <main className="relative h-full w-full">
        {supportsWebGL ? (
          <CosmicForest audioEnabled={audioEnabled} />
        ) : (
          <FallbackImage />
        )}

        <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-1000 ${entered ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <EnterButton onClick={handleEnter} />
        </div>

        <AudioToggle 
          audioEnabled={audioEnabled} 
          toggleAudio={toggleAudio} 
        />
      </main>
    </div>
  );
}

export default Home;