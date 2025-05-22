import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface AudioToggleProps {
  audioEnabled: boolean;
  toggleAudio: () => void;
}

const AudioToggle: React.FC<AudioToggleProps> = ({ audioEnabled, toggleAudio }) => {
  return (
    <button 
      onClick={toggleAudio}
      className="audio-toggle fixed bottom-6 right-6 z-50 p-3 
                 bg-black/20 border border-white/20 rounded-full
                 hover:bg-black/30 transition-all duration-300"
      aria-label={audioEnabled ? 'Mute audio' : 'Enable audio'}
    >
      {audioEnabled ? (
        <Volume2 size={20} className="text-white" />
      ) : (
        <VolumeX size={20} className="text-white/70" />
      )}
    </button>
  );
};

export default AudioToggle;