import { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  LearningProgress, 
  KanaStatus, 
  KanaItem, 
  UserProfile, 
  UseProgressReturn,
  ProgressAction,
  LearningStats,
  StreakInfo
} from '../types/progress';
import { SpacedRepetition } from '../utils/spaced-repetition';
import { LocalStorageRepository } from '../services/storage/progress-repository';
import { createDefaultProgress } from '../utils/default-progress';
import { GOJUON_ROWS, GOJUON_DATA } from '@/data/gojuon';

export function useProgress(): UseProgressReturn {
  const [progress, setProgress] = useState<LearningProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const repository = useMemo(() => new LocalStorageRepository(), []);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        let loadedProgress = await repository.load();
        
        // 如果没有找到进度数据，创建默认数据
        if (!loadedProgress) {
          loadedProgress = createDefaultProgress();
          await repository.save(loadedProgress);
        }
        
        setProgress(loadedProgress);
      } catch (err) {
        setError(err as Error);
        
        // 如果加载失败，也创建默认数据
        try {
          const defaultProgress = createDefaultProgress();
          await repository.save(defaultProgress);
          setProgress(defaultProgress);
        } catch (fallbackErr) {
          console.error('Failed to create default progress:', fallbackErr);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, [repository]);

  const updateKanaProgress = useCallback(async (kanaKey: string, action: ProgressAction) => {
    if (!progress) return;

    const now = new Date();
    const srs = new SpacedRepetition();
    let currentItem = progress.kanaProgress[kanaKey];

    // Initialize item if it's new
    if (!currentItem) {
      currentItem = {
        exposures: 0,
        interactions: 0,
        confidence: 0,
        retention: 0,
        firstSeen: now.toISOString(),
        lastSeen: now.toISOString(),
        status: 'new',
        difficulty: 0.5, // Start with medium difficulty
        interval: 0,
        easeFactor: 2.5, // Default ease factor
      };
    }

    // Handle different action types
    switch (action.type) {
      case 'expose':
        currentItem.exposures += 1;
        currentItem.lastSeen = now.toISOString();
        break;
        
      case 'interact':
        currentItem.exposures += 1;
        currentItem.interactions += 1;
        currentItem.lastSeen = now.toISOString();
        
        // Update SRS data based on quality
        const quality = action.quality;
        const { interval, easeFactor } = srs.calculateNextReview(currentItem, quality);
        currentItem.interval = interval;
        currentItem.easeFactor = easeFactor;
        
        const nextReviewDate = new Date(now);
        nextReviewDate.setDate(now.getDate() + interval);
        currentItem.nextReview = nextReviewDate.toISOString();

        // Update confidence and status based on quality
        if (quality >= 3) {
          currentItem.confidence = Math.min(1, currentItem.confidence + 0.1);
          if (currentItem.confidence >= 0.8 && currentItem.interval > 30) {
            currentItem.status = 'mastered';
            currentItem.lastMastered = now.toISOString();
          } else {
            currentItem.status = 'reviewing';
          }
        } else {
          currentItem.confidence = Math.max(0, currentItem.confidence - 0.2);
          currentItem.status = 'learning';
        }
        break;
        
      case 'reset':
        currentItem = {
          exposures: 0,
          interactions: 0,
          confidence: 0,
          retention: 0,
          firstSeen: now.toISOString(),
          lastSeen: now.toISOString(),
          status: 'new',
          difficulty: 0.5,
          interval: 0,
          easeFactor: 2.5,
        };
        break;
        
      case 'suspend':
        currentItem.status = 'suspended';
        break;
        
      case 'resume':
        if (currentItem.status === 'suspended') {
          currentItem.status = currentItem.confidence > 0.5 ? 'reviewing' : 'learning';
        }
        break;
        
      default:
        break;
    }

    // Create new progress object
    const newProgress: LearningProgress = {
      ...progress,
      kanaProgress: {
        ...progress.kanaProgress,
        [kanaKey]: currentItem,
      },
      metadata: {
        ...progress.metadata,
        lastSync: now.toISOString(), // Using lastSync to track last update
      }
    };

    // Save and update state
    try {
      await repository.save(newProgress);
      setProgress(newProgress);
    } catch (err) {
      setError(err as Error);
    }
  }, [progress, repository]);

  const getKanaStatus = useCallback((kanaKey: string): KanaStatus => {
    return progress?.kanaProgress[kanaKey]?.status || 'new';
  }, [progress]);

  const calculatePriority = useCallback((item: KanaItem | undefined, now: Date): number => {
    if (!item) return 100; // 新项目优先级最高
    
    let score = 0;
    
    // 基于状态的基础分
    switch (item.status) {
      case 'new': score = 90; break;
      case 'learning': score = 70; break;
      case 'reviewing': score = 50; break;
      case 'mastered': score = 10; break;
      case 'suspended': score = 0; break;
    }
    
    // 基于时间的调整
    if (item.nextReview) {
      const dueDate = new Date(item.nextReview);
      const overdueDays = (now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24);
      if (overdueDays > 0) {
        score += Math.min(overdueDays * 10, 50);
      }
    }
    
    // 基于难度的调整
    score += (item.difficulty || 0) * 20;
    
    // 基于置信度的调整
    score += (1 - (item.confidence || 0)) * 15;
    
    return score;
  }, []);

  const getRecommendations = useCallback((rowKeys: string[]) => {
    if (!progress) return [];
    
    const candidates = rowKeys.flatMap(row => GOJUON_ROWS[row as keyof typeof GOJUON_ROWS]);
    const now = new Date();
    
    return candidates
      .map(kana => ({
        kana,
        item: progress.kanaProgress[kana],
        score: calculatePriority(progress.kanaProgress[kana], now)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(item => item.kana);
  }, [progress, calculatePriority]);

  const getStats = useCallback((): LearningStats => {
    if (!progress) {
      return {
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
    }
    return progress.statistics;
  }, [progress]);

  const getStreakInfo = useCallback((): StreakInfo => {
    const stats = getStats();
    const now = new Date();
    const lastSession = stats.sessions.lastSessionDate ? new Date(stats.sessions.lastSessionDate) : null;
    
    let hoursUntilBreak = 24;
    let willBreakToday = false;
    
    if (lastSession) {
      const timeDiff = now.getTime() - lastSession.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      hoursUntilBreak = Math.max(0, 24 - hoursDiff);
      willBreakToday = hoursDiff > 24;
    }
    
    return {
      current: stats.sessions.currentStreak,
      longest: stats.sessions.longestStreak,
      hoursUntilBreak,
      willBreakToday,
    };
  }, [getStats]);

  const updatePreferences = useCallback(async (prefs: Partial<UserProfile['preferences']>) => {
    if (!progress) return;
    
    const newProgress: LearningProgress = {
      ...progress,
      profile: {
        ...progress.profile,
        preferences: {
          ...progress.profile.preferences,
          ...prefs,
        },
      },
    };
    
    try {
      await repository.save(newProgress);
      setProgress(newProgress);
    } catch (err) {
      setError(err as Error);
    }
  }, [progress, repository]);

  const resetProgress = useCallback(async (kanaKeys?: string[]) => {
    if (!progress) return;
    
    const newKanaProgress = { ...progress.kanaProgress };
    const keysToReset = kanaKeys || Object.keys(newKanaProgress);
    
    keysToReset.forEach(key => {
      delete newKanaProgress[key];
    });
    
    const newProgress: LearningProgress = {
      ...progress,
      kanaProgress: newKanaProgress,
    };
    
    try {
      await repository.save(newProgress);
      setProgress(newProgress);
    } catch (err) {
      setError(err as Error);
    }
  }, [progress, repository]);
  
  return {
    progress,
    isLoading,
    error,
    updateKanaProgress,
    getKanaStatus,
    getRecommendations,
    getStats,
    getStreakInfo,
    updatePreferences,
    resetProgress
  };
}
