'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  velocityX: number;
  velocityY: number;
  rotationSpeed: number;
}

interface ConfettiProps {
  trigger: boolean;
  onComplete?: () => void;
  duration?: number;
  pieceCount?: number;
}

const Confetti: React.FC<ConfettiProps> = ({ 
  trigger, 
  onComplete, 
  duration = 3000, 
  pieceCount = 150 
}) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [isActive, setIsActive] = useState(false);

  const createConfettiPiece = useCallback((): ConfettiPiece => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
      '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
      '#10AC84', '#EE5A24', '#0984E3', '#6C5CE7', '#A29BFE'
    ];
    
    return {
      id: Math.random(),
      x: Math.random() * window.innerWidth,
      y: -20,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      rotation: Math.random() * 360,
      velocityX: (Math.random() - 0.5) * 8,
      velocityY: Math.random() * 3 + 2,
      rotationSpeed: (Math.random() - 0.5) * 10
    };
  }, []);

  const animate = useCallback(() => {
    setPieces(prevPieces => {
      const updatedPieces = prevPieces.map(piece => ({
        ...piece,
        x: piece.x + piece.velocityX,
        y: piece.y + piece.velocityY,
        rotation: piece.rotation + piece.rotationSpeed,
        velocityY: piece.velocityY + 0.1 // gravity
      }));

      // Remove pieces that are off screen
      return updatedPieces.filter(piece => piece.y < window.innerHeight + 50);
    });
  }, []);

  useEffect(() => {
    if (trigger && !isActive) {
      setIsActive(true);
      
      // Create initial confetti pieces
      const initialPieces = Array.from({ length: pieceCount }, createConfettiPiece);
      setPieces(initialPieces);

      // Start animation
      const animationInterval = setInterval(animate, 16); // ~60fps

      // Stop animation after duration
      const timeout = setTimeout(() => {
        clearInterval(animationInterval);
        setIsActive(false);
        setPieces([]);
        onComplete?.();
      }, duration);

      return () => {
        clearInterval(animationInterval);
        clearTimeout(timeout);
      };
    }
  }, [trigger, isActive, animate, createConfettiPiece, duration, onComplete, pieceCount]);

  if (!isActive && pieces.length === 0) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 pointer-events-none z-50">
      {pieces.map(piece => (
        <div
          key={piece.id}
          className="absolute"
          style={{
            left: piece.x,
            top: piece.y,
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotation}deg)`,
            opacity: 0.8,
          }}
        />
      ))}
    </div>,
    document.body
  );
};

export default Confetti;