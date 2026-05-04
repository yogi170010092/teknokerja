import { ReactNode, useEffect, useState } from "react";

interface FloatingElementProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  distance?: number;
}

const FloatingElement = ({ 
  children, 
  className = "", 
  delay = 0, 
  duration = 3,
  distance = 10 
}: FloatingElementProps) => {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let animationId: number;
    let startTime: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = (timestamp - startTime) / 1000;
      
      // Smooth floating animation using sine wave
      const newOffset = Math.sin((elapsed + delay) * (2 * Math.PI / duration)) * distance;
      setOffset(newOffset);
      
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(animationId);
  }, [delay, duration, distance]);

  return (
    <div 
      className={`transition-transform will-change-transform ${className}`}
      style={{ 
        transform: `translateY(${offset}px)`,
      }}
    >
      {children}
    </div>
  );
};

export default FloatingElement;
