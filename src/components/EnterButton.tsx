import React from 'react';

interface EnterButtonProps {
  onClick: () => void;
}

const EnterButton: React.FC<EnterButtonProps> = ({ onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="magic-button font-display text-lg md:text-xl py-3 px-8 md:py-4 md:px-10 
                 bg-transparent border border-secondary text-white rounded-full
                 hover:bg-secondary/10 hover:scale-105 transition-all duration-500
                 animate-pulse-glow outline-none focus:ring-2 focus:ring-secondary/50"
    >
      <span className="relative z-10 glow-text">Enter the Magic</span>
    </button>
  );
};

export default EnterButton;