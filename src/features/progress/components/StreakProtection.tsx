'use client';

import React, { useState, useEffect } from 'react';
import { useProgress } from '../hooks/useProgress';

interface StreakNotificationProps {
  isVisible: boolean;
  onClose: () => void;
  hoursUntilBreak: number;
}

const StreakNotification: React.FC<StreakNotificationProps> = ({ 
  isVisible, 
  onClose, 
  hoursUntilBreak 
}) => {
  const [timeLeft, setTimeLeft] = useState(hoursUntilBreak);

  useEffect(() => {
    if (!isVisible) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 0.1;
      });
    }, 100); // Update every 100ms for smooth countdown

    return () => clearInterval(timer);
  }, [isVisible]);

  useEffect(() => {
    if (isVisible) {
      // Auto-close after 10 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const isUrgent = timeLeft <= 6;
  const isCritical = timeLeft <= 1;

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div 
        className={`bg-white rounded-lg shadow-lg p-4 max-w-sm transform transition-all duration-300 ${
          isCritical ? 'animate-pulse' : ''
        }`}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <span className={`text-2xl ${isCritical ? 'text-red-500' : isUrgent ? 'text-orange-500' : 'text-yellow-500'}`}>
              {isCritical ? '🚨' : isUrgent ? '⚠️' : '⏰'}
            </span>
          </div>
          
          <div className="flex-1">
            <h4 className={`font-semibold ${isCritical ? 'text-red-800' : isUrgent ? 'text-orange-800' : 'text-yellow-800'}`}>
              {isCritical ? '连续学习即将中断！' : isUrgent ? '保护你的连续学习' : '保持学习势头'}
            </h4>
            
            <p className="text-sm text-gray-600 mt-1">
              {isCritical 
                ? `再过 ${Math.floor(timeLeft * 60)} 分钟你的连续学习就会中断！`
                : isUrgent
                ? `还有 ${Math.floor(timeLeft)} 小时 ${Math.floor((timeLeft % 1) * 60)} 分钟`
                : `还有 ${Math.floor(timeLeft)} 小时保持你的连续学习`
              }
            </p>
            
            <div className="mt-3">
              <button
                onClick={onClose}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  isCritical
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : isUrgent
                    ? 'bg-orange-600 hover:bg-orange-700 text-white'
                    : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                } transition-colors duration-200`}
              >
                知道了
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const StreakProtection: React.FC = () => {
  const { getStreakInfo } = useProgress();
  const [showNotification, setShowNotification] = useState(false);
  const streakInfo = getStreakInfo();

  useEffect(() => {
    // Show notification when streak is at risk (6 hours or less)
    const checkStreakRisk = () => {
      if (streakInfo.hoursUntilBreak <= 6 && streakInfo.current > 0) {
        setShowNotification(true);
      }
    };
    
    checkStreakRisk();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streakInfo.hoursUntilBreak, streakInfo.current]);

  const handleClose = () => {
    setShowNotification(false);
  };

  return (
    <StreakNotification
      isVisible={showNotification}
      onClose={handleClose}
      hoursUntilBreak={streakInfo.hoursUntilBreak}
    />
  );
};