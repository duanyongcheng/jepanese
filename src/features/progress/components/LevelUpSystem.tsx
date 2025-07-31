'use client';

import React, { useState, useEffect } from 'react';
import Confetti from './Confetti';
import { useProgress } from '../hooks/useProgress';

interface LevelUpCelebrationProps {
  isVisible: boolean;
  onClose: () => void;
  newLevel: number;
  masteredCount: number;
}

const LevelUpCelebration: React.FC<LevelUpCelebrationProps> = ({ 
  isVisible, 
  onClose, 
  newLevel,
  masteredCount 
}) => {
  const [showConfetti] = useState(true);

  useEffect(() => {
    if (isVisible) {
      // Auto-close after 4 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const getLevelTitle = (level: number): string => {
    if (level <= 2) return '初学者';
    if (level <= 5) return '学习者';
    if (level <= 8) return '进阶者';
    if (level <= 10) return '熟练者';
    return '大师';
  };

  const levelTitle = getLevelTitle(newLevel);

  return (
    <>
      <Confetti trigger={showConfetti} duration={4000} />
      
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
        <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center transform transition-all duration-300 scale-100">
          <div className="text-6xl mb-4 animate-bounce">🎉</div>
          
          <h2 className="text-3xl font-bold text-yellow-600 mb-2">
            等级提升！
          </h2>
          
          <div className="text-5xl font-bold text-gray-800 mb-2">
            Level {newLevel}
          </div>
          
          <p className="text-lg text-gray-600 mb-4">
            {levelTitle}
          </p>
          
          <div className="bg-yellow-50 rounded-lg p-4 mb-6">
            <p className="text-yellow-800">
              恭喜！你已经掌握了 {masteredCount} 个假名
            </p>
          </div>
          
          <div className="flex justify-center space-x-2 mb-6">
            <span className="text-4xl">⭐</span>
            <span className="text-4xl">🌟</span>
            <span className="text-4xl">✨</span>
          </div>
          
          <button
            onClick={onClose}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-8 rounded-full transition-colors duration-200 transform hover:scale-105"
          >
            继续学习
          </button>
        </div>
      </div>
    </>
  );
};

export const LevelUpSystem: React.FC = () => {
  const { progress } = useProgress();
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [masteredCount, setMasteredCount] = useState(0);

  useEffect(() => {
    if (!progress) return;

    const calculateLevel = (count: number): number => {
      return Math.floor(count / 5) + 1; // Level up every 5 kana
    };

    const currentMastered = progress.statistics.achievements.totalKanaMastered;
    const newLevel = calculateLevel(currentMastered);
    const previousLevel = calculateLevel(currentMastered - 1);

    // Check if user just leveled up
    if (newLevel > previousLevel && currentMastered > 0) {
      setCurrentLevel(newLevel);
      setMasteredCount(currentMastered);
      setShowLevelUp(true);
    }
  }, [progress]);

  const handleClose = () => {
    setShowLevelUp(false);
  };

  return (
    <LevelUpCelebration
      isVisible={showLevelUp}
      onClose={handleClose}
      newLevel={currentLevel}
      masteredCount={masteredCount}
    />
  );
};