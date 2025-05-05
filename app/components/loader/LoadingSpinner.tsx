import { LoadingSpinnerProps } from '@/app/types/QuizType';
import React from 'react';



const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  color = '#DC3414' 
}) => {
  const getSize = () => {
    switch (size) {
      case 'small': return 'w-6 h-6';
      case 'large': return 'w-16 h-16';
      default: return 'w-10 h-10';
    }
  };

  return (
    <div className="flex justify-center items-center">
      <div className={`${getSize()} border-4 border-t-transparent rounded-full animate-spin`} 
        style={{ borderColor: `transparent ${color} ${color} ${color}` }}
      ></div>
    </div>
  );
};

export default LoadingSpinner; 