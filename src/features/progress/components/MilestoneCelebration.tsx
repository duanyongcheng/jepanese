'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Confetti from './Confetti';
import { Milestone } from '../types/progress';

interface MilestoneCelebrationProps {
  milestone: Milestone;
  onClose: () => void;
}

const MilestoneCelebration: React.FC<MilestoneCelebrationProps> = ({ 
  milestone, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [showConfetti] = useState(true);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // Wait for fade out animation
  }, [onClose]);

  useEffect(() => {
    // Auto-close after 4 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, [handleClose]);

  const getMilestoneTitle = (type: Milestone['type']) => {
    switch (type) {
      case 'kana_mastered':
        return '假名掌握里程碑';
      case 'streak':
        return '连续学习里程碑';
      case 'total_reviews':
        return '复习次数里程碑';
      case 'perfect_week':
        return '完美一周里程碑';
      default:
        return '学习里程碑';
    }
  };

  const getMilestoneDescription = (type: Milestone['type'], value: number) => {
    switch (type) {
      case 'kana_mastered':
        return `恭喜！你已经掌握了 ${value} 个假名！`;
      case 'streak':
        return `太棒了！连续学习 ${value} 天！`;
      case 'total_reviews':
        return `出色！完成了 ${value} 次复习！`;
      case 'perfect_week':
        return `完美！连续 ${value} 天完成每日目标！`;
      default:
        return `恭喜达成学习里程碑！`;
    }
  };

  const getMilestoneIcon = (type: Milestone['type']) => {
    switch (type) {
      case 'kana_mastered':
        return '🎯';
      case 'streak':
        return '🔥';
      case 'total_reviews':
        return '📚';
      case 'perfect_week':
        return '⭐';
      default:
        return '🏆';
    }
  };

  if (!isVisible) return null;

  return (
    <>
      <Confetti trigger={showConfetti} duration={4000} />
      
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
        <div 
          className={`bg-white rounded-2xl p-8 max-w-md mx-4 text-center transform transition-all duration-300 ${
            isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
        >
          <div className="text-6xl mb-4 animate-bounce">
            {getMilestoneIcon(milestone.type)}
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {getMilestoneTitle(milestone.type)}
          </h2>
          
          <p className="text-lg text-gray-600 mb-6">
            {getMilestoneDescription(milestone.type, milestone.value)}
          </p>
          
          <div className="flex justify-center space-x-2 mb-6">
            <span className="text-4xl">🎉</span>
            <span className="text-4xl">✨</span>
            <span className="text-4xl">🎊</span>
          </div>
          
          <button
            onClick={handleClose}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-full transition-colors duration-200 transform hover:scale-105"
          >
            继续学习
          </button>
        </div>
      </div>
    </>
  );
};

export default MilestoneCelebration;