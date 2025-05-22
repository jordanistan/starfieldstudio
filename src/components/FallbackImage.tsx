import React from 'react';

const FallbackImage: React.FC = () => {
  return (
    <div 
      className="fallback-container h-full w-full"
      style={{
        backgroundImage: "url('https://images.pexels.com/photos/1169754/pexels-photo-1169754.jpeg?auto=compress&cs=tinysrgb&w=1920')"
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 to-background/40 flex items-center justify-center">
        <div className="text-center p-4">
          <h2 className="font-display text-3xl md:text-4xl mb-4 glow-text">
            Cosmic Forest
          </h2>
          <p className="max-w-md mx-auto text-white/80">
            Your device doesn't support our interactive experience, 
            but you can still explore the static cosmic forest.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FallbackImage;