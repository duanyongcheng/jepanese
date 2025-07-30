import React from 'react';
import { useProgress } from '../hooks/useProgress';
import { GOJUON_DATA } from '@/data/gojuon';
import { LearningProgress, KanaStatus } from '../types/progress';

// Placeholder Components
const DailyProgress = ({ completed, goal, timeSpent }: { completed: number, goal: number, timeSpent: number }) => (
  <div className="p-4 border rounded-lg">Daily Progress: {completed}/{goal} | Time: {timeSpent}s</div>
);
const StreakCard = ({ current, longest, willBreakIn }: { current: number, longest: number, willBreakIn: number }) => (
  <div className="p-4 border rounded-lg">Streak: {current} (longest: {longest}) | Breaks in: {willBreakIn}h</div>
);
const MasteryRing = ({ total, mastered, learning, reviewing }: { total: number, mastered: number, learning: number, reviewing: number }) => (
  <div className="p-4 border rounded-lg">Mastery: {mastered}/{total} (L: {learning}, R: {reviewing})</div>
);
const DetailedStats = ({ progress }: { progress: LearningProgress | null }) => (
  <div className="p-4 border rounded-lg">Detailed Stats</div>
);

const countByStatus = (progress: LearningProgress | null, status: KanaStatus): number => {
  if (!progress) return 0;
  return Object.values(progress.kanaProgress).filter(item => item.status === status).length;
}

export const ProgressDashboard: React.FC = () => {
  const { progress } = useProgress();
  
  // The getStats and getStreakInfo functions are not yet implemented in the hook,
  // so we'll use some placeholder data for now.
  const stats = {
    achievements: {
      totalKanaMastered: progress ? countByStatus(progress, 'mastered') : 0,
    },
    timeSpent: {
      today: 0,
    }
  };

  const streak = {
    current: 0,
    longest: 0,
    hoursUntilBreak: 24,
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
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
      
      <div className="md:col-span-3">
        <DetailedStats progress={progress} />
      </div>
    </div>
  );
};
