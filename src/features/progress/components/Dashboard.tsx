import React from 'react';
import { useProgress } from '../hooks/useProgress';
import { GOJUON_DATA } from '@/data/gojuon';
import { LearningProgress, KanaStatus, Milestone } from '../types/progress';
import AchievementPanel from './AchievementPanel';
import MilestoneCelebration from './MilestoneCelebration';
import { useState, useEffect } from 'react';

// Daily Progress Component
const DailyProgress = ({ completed, goal, timeSpent }: { completed: number, goal: number, timeSpent: number }) => {
  const percentage = Math.min(100, (completed / goal) * 100);
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">今日进度</h3>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl font-bold text-blue-600">{completed}</span>
        <span className="text-gray-600">/ {goal} 假名</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div 
          className="bg-blue-500 h-3 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-sm text-gray-600 mt-2">
        学习时间: {Math.floor(timeSpent / 60)}分{timeSpent % 60}秒
      </div>
    </div>
  );
};

// Streak Card Component
const StreakCard = ({ current, longest, willBreakIn }: { current: number, longest: number, willBreakIn: number }) => {
  const isUrgent = willBreakIn < 6;
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">连续学习</h3>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🔥</span>
          <span className="text-2xl font-bold text-orange-600">{current}</span>
          <span className="text-gray-600">天</span>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">最长</div>
          <div className="font-semibold">{longest}天</div>
        </div>
      </div>
      <div className={`text-sm ${isUrgent ? 'text-red-600' : 'text-gray-600'}`}>
        {isUrgent ? '⚠️ ' : ''}{willBreakIn}小时后中断
      </div>
    </div>
  );
};

// Mastery Ring Component
const MasteryRing = ({ total, mastered, learning, reviewing }: { total: number, mastered: number, learning: number, reviewing: number }) => {
  const masteredPercentage = (mastered / total) * 100;
  const circumference = 2 * Math.PI * 40; // radius = 40
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (masteredPercentage / 100) * circumference;
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">掌握进度</h3>
      <div className="flex items-center justify-center mb-4">
        <div className="relative">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="#10b981"
              strokeWidth="8"
              fill="none"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-300"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold text-gray-800">{Math.round(masteredPercentage)}%</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div className="text-center">
          <div className="font-semibold text-green-600">{mastered}</div>
          <div className="text-gray-600">已掌握</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-blue-600">{learning}</div>
          <div className="text-gray-600">学习中</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-orange-600">{reviewing}</div>
          <div className="text-gray-600">复习中</div>
        </div>
      </div>
    </div>
  );
};

// Detailed Stats Component
const DetailedStats = ({ progress }: { progress: LearningProgress | null }) => {
  if (!progress) return null;
  
  const stats = progress.statistics;
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">详细统计</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.sessions.total}</div>
          <div className="text-sm text-gray-600">总学习次数</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.achievements.totalKanaMastered}</div>
          <div className="text-sm text-gray-600">已掌握假名</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.achievements.totalReviews}</div>
          <div className="text-sm text-gray-600">总复习次数</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.achievements.perfectDays}</div>
          <div className="text-sm text-gray-600">完美天数</div>
        </div>
      </div>
    </div>
  );
};

const countByStatus = (progress: LearningProgress | null, status: KanaStatus): number => {
  if (!progress) return 0;
  return Object.values(progress.kanaProgress).filter(item => item.status === status).length;
}

export const ProgressDashboard: React.FC = () => {
  const { progress, getStats, getStreakInfo } = useProgress();
  const stats = getStats();
  const streak = getStreakInfo();
  const [activeMilestone, setActiveMilestone] = useState<Milestone | null>(null);
  
  // Check for uncelebrated milestones
  useEffect(() => {
    if (progress) {
      const uncelebratedMilestone = progress.statistics.achievements.milestones.find(
        m => !m.celebrated
      );
      
      if (uncelebratedMilestone) {
        setActiveMilestone(uncelebratedMilestone);
        
        // Note: In a real app, you'd save this back to storage
        // For now, we'll just update the state
      }
    }
  }, [progress]);
  
  const handleMilestoneClose = () => {
    setActiveMilestone(null);
  };
  
  return (
    <>
      {activeMilestone && (
        <MilestoneCelebration 
          milestone={activeMilestone} 
          onClose={handleMilestoneClose}
        />
      )}
      
      <div className="space-y-6 p-4">
        {/* Achievement Panel */}
        {progress && <AchievementPanel progress={progress} />}
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DailyProgress 
            completed={stats.achievements.totalKanaMastered}
            goal={progress?.profile.preferences.dailyGoal || 10}
            timeSpent={stats.timeSpent.today}
          />
          
          <StreakCard 
            current={streak.current}
            longest={streak.longest}
            willBreakIn={streak.hoursUntilBreak}
          />
          
          <MasteryRing 
            total={Object.keys(GOJUON_DATA).length}
            mastered={stats.achievements.totalKanaMastered}
            learning={countByStatus(progress, 'learning')}
            reviewing={countByStatus(progress, 'reviewing')}
          />
        </div>
        
        {/* Detailed Stats */}
        <DetailedStats progress={progress} />
      </div>
    </>
  );
};
