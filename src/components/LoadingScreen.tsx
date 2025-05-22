import React from 'react';

interface LoadingScreenProps {
  progress: number;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ progress }) => {
  return (
    <div className="loading-screen fixed inset-0 flex flex-col items-center justify-center">
      <h1 className="font-display text-4xl md:text-6xl mb-8 text-white glow-text">
        Starfield Studio
      </h1>
      
      <div className="w-64 md:w-80 h-2 bg-gray-800 rounded-full overflow-hidden">
        <div 
          className="loading-bar h-full rounded-full"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      <p className="mt-4 text-secondary text-sm md:text-base">
        {progress < 100 ? 'Entering the cosmic realm...' : 'Ready to explore'}
      </p>
    </div>
  );
};

export default LoadingScreen;