'use client';

import React from 'react';

interface AchievementBadgeProps {
  type: 'level' | 'streak' | 'mastery' | 'consistency';
  level?: number;
  value?: number;
  isActive?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  type,
  level,
  value,
  isActive = true,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-lg'
  };

  const getBadgeContent = () => {
    switch (type) {
      case 'level':
        return {
          icon: '⭐',
          label: `等级 ${level || 1}`,
          color: isActive ? 'bg-yellow-100 border-yellow-400' : 'bg-gray-100 border-gray-300'
        };
      case 'streak':
        return {
          icon: '🔥',
          label: `${value || 0} 天`,
          color: isActive ? 'bg-orange-100 border-orange-400' : 'bg-gray-100 border-gray-300'
        };
      case 'mastery':
        return {
          icon: '🎯',
          label: `${value || 0}%`,
          color: isActive ? 'bg-green-100 border-green-400' : 'bg-gray-100 border-gray-300'
        };
      case 'consistency':
        return {
          icon: '📈',
          label: '坚持',
          color: isActive ? 'bg-blue-100 border-blue-400' : 'bg-gray-100 border-gray-300'
        };
      default:
        return {
          icon: '🏆',
          label: '成就',
          color: isActive ? 'bg-purple-100 border-purple-400' : 'bg-gray-100 border-gray-300'
        };
    }
  };

  const badgeContent = getBadgeContent();

  return (
    <div 
      className={`${sizeClasses[size]} ${badgeContent.color} border-2 rounded-full flex flex-col items-center justify-center transition-all duration-200 ${
        isActive ? 'hover:scale-110' : 'opacity-50'
      }`}
      title={badgeContent.label}
    >
      <span className="text-lg">{badgeContent.icon}</span>
      {size !== 'sm' && (
        <span className="text-xs font-semibold text-gray-700 mt-1">
          {type === 'level' ? `L${level || 1}` : value || 0}
        </span>
      )}
    </div>
  );
};

export default AchievementBadge;