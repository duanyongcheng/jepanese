import { LearningProgress, UserProfile, LearningStats, Metadata } from '../types/progress';

// 创建默认的学习进度数据
export function createDefaultProgress(): LearningProgress {
  const now = new Date().toISOString();
  const userId = generateUserId();
  
  const defaultProfile: UserProfile = {
    preferences: {
      dailyGoal: 10,
      reminderEnabled: false,
      displayMode: 'card',
      progressIndicator: 'both',
    },
    createdAt: now,
    lastActiveAt: now,
  };

  const defaultStats: LearningStats = {
    sessions: {
      total: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastSessionDate: '',
    },
    timeSpent: {
      total: 0,
      today: 0,
      thisWeek: 0,
      average: 0,
    },
    achievements: {
      totalKanaMastered: 0,
      totalReviews: 0,
      perfectDays: 0,
      milestones: [],
    },
  };

  const defaultMetadata: Metadata = {
    appVersion: '2.0.0',
    deviceId: generateDeviceId(),
  };

  return {
    version: '2.0.0',
    userId,
    profile: defaultProfile,
    kanaProgress: {},
    statistics: defaultStats,
    metadata: defaultMetadata,
  };
}

// 生成用户ID
function generateUserId(): string {
  return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// 生成设备ID
function generateDeviceId(): string {
  return 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}