'use client';

import React from 'react';
import AchievementBadge from './AchievementBadge';
import { LearningProgress, KanaItem } from '../types/progress';

interface AchievementPanelProps {
  progress: LearningProgress;
}

const AchievementPanel: React.FC<AchievementPanelProps> = ({ progress }) => {
  // Calculate user level based on mastered kana
  const calculateLevel = (masteredCount: number): number => {
    return Math.floor(masteredCount / 5) + 1; // Level up every 5 kana
  };

  // Calculate mastery percentage
  const calculateMastery = (kanaProgress: Record<string, KanaItem>): number => {
    const totalKana = Object.keys(kanaProgress).length;
    if (totalKana === 0) return 0;
    
    const masteredCount = Object.values(kanaProgress).filter(
      (item: KanaItem) => item.status === 'mastered'
    ).length;
    
    return Math.round((masteredCount / totalKana) * 100);
  };

  const level = calculateLevel(progress.statistics.achievements.totalKanaMastered);
  const masteryPercentage = calculateMastery(progress.kanaProgress);
  const currentStreak = progress.statistics.sessions.currentStreak;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">成就徽章</h3>
      
      <div className="grid grid-cols-4 gap-4">
        {/* Level Badge */}
        <div className="flex flex-col items-center">
          <AchievementBadge 
            type="level" 
            level={level} 
            isActive={level > 1}
            size="md"
          />
          <span className="text-xs text-gray-600 mt-1">等级</span>
        </div>
        
        {/* Streak Badge */}
        <div className="flex flex-col items-center">
          <AchievementBadge 
            type="streak" 
            value={currentStreak} 
            isActive={currentStreak > 0}
            size="md"
          />
          <span className="text-xs text-gray-600 mt-1">连续</span>
        </div>
        
        {/* Mastery Badge */}
        <div className="flex flex-col items-center">
          <AchievementBadge 
            type="mastery" 
            value={masteryPercentage} 
            isActive={masteryPercentage > 0}
            size="md"
          />
          <span className="text-xs text-gray-600 mt-1">掌握</span>
        </div>
        
        {/* Consistency Badge */}
        <div className="flex flex-col items-center">
          <AchievementBadge 
            type="consistency" 
            isActive={progress.statistics.sessions.total > 0}
            size="md"
          />
          <span className="text-xs text-gray-600 mt-1">坚持</span>
        </div>
      </div>
      
      {/* Progress to Next Level */}
      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">下一等级进度</span>
          <span className="text-sm font-semibold text-gray-800">
            {progress.statistics.achievements.totalKanaMastered % 5}/5
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${(progress.statistics.achievements.totalKanaMastered % 5) * 20}%` 
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default AchievementPanel;