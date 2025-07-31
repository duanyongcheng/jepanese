'use client';

import React, { useState, useEffect } from 'react';
import { useProgress } from '../hooks/useProgress';

interface DailyReminderProps {
  isVisible: boolean;
  onClose: () => void;
  onPractice: () => void;
}

const DailyReminder: React.FC<DailyReminderProps> = ({ 
  isVisible, 
  onClose, 
  onPractice 
}) => {
  useEffect(() => {
    if (!isVisible) return;

    // Auto-close after 5 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg p-4 max-w-sm transform transition-all duration-300">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <span className="text-2xl text-blue-500">📚</span>
          </div>
          
          <div className="flex-1">
            <h4 className="font-semibold text-blue-800">
              今日学习提醒
            </h4>
            
            <p className="text-sm text-gray-600 mt-1">
              是时候继续你的日语学习之旅了！每天一点进步，掌握更多假名。
            </p>
            
            <div className="mt-3 flex space-x-2">
              <button
                onClick={onPractice}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors duration-200"
              >
                开始练习
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 text-sm font-medium rounded-md transition-colors duration-200"
              >
                稍后提醒
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ReminderSystem: React.FC = () => {
  const { progress } = useProgress();
  const [showReminder, setShowReminder] = useState(false);

  useEffect(() => {
    if (!progress) return;

    const checkDailyReminder = () => {
      const now = new Date();
      const lastActive = new Date(progress.profile.lastActiveAt);
      
      // Show reminder if user hasn't been active today and it's after 9 AM
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const lastActiveDay = new Date(lastActive);
      lastActiveDay.setHours(0, 0, 0, 0);
      
      const isSameDay = today.getTime() === lastActiveDay.getTime();
      const isAfter9AM = now.getHours() >= 9;
      
      if (!isSameDay && isAfter9AM && progress.profile.preferences.reminderEnabled) {
        setShowReminder(true);
      }
    };

    // Check every hour
    const interval = setInterval(checkDailyReminder, 60 * 60 * 1000);
    checkDailyReminder(); // Check immediately

    return () => clearInterval(interval);
  }, [progress]);

  const handleClose = () => {
    setShowReminder(false);
  };

  const handlePractice = () => {
    setShowReminder(false);
    // Scroll to practice section or navigate to practice page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <DailyReminder
      isVisible={showReminder}
      onClose={handleClose}
      onPractice={handlePractice}
    />
  );
};