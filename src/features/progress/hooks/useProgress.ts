import { useState, useMemo, useCallback, useEffect } from 'react';
import { LearningProgress, KanaStatus, KanaItem, UserProfile } from '../types/progress';
import { SpacedRepetition } from '../utils/spaced-repetition';
import { LocalStorageRepository } from '../services/storage/progress-repository';
import { GOJUON_ROWS, GOJUON_DATA } from '@/data/gojuon';

// A placeholder for a more robust action type definition in the future
export type ProgressAction = { type: 'correct' | 'incorrect' };

export interface UseProgressReturn {
  // 数据
  progress: LearningProgress | null;
  isLoading: boolean;
  error: Error | null;
  
  // 操作
  updateKanaProgress: (kanaKey: string, action: ProgressAction) => void;
  getKanaStatus: (kanaKey: string) => KanaStatus;
  getRecommendations: (rowKeys: string[]) => string[];
  
  // 统计 (placeholders for now)
  // getStats: () => LearningStats;
  // getStreakInfo: () => StreakInfo;
  
  // 设置
  updatePreferences: (prefs: Partial<UserProfile['preferences']>) => void;
  resetProgress: (kanaKeys?: string[]) => void;
}

export function useProgress(): UseProgressReturn {
  const [progress, setProgress] = useState<LearningProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const repository = useMemo(() => new LocalStorageRepository(), []);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const loadedProgress = await repository.load();
        setProgress(loadedProgress);
      } catch (err) {
        setError(err as Error);
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

    // Update general stats
    currentItem.exposures += 1;
    currentItem.interactions += 1;
    currentItem.lastSeen = now.toISOString();

    // Determine quality of review (0-5)
    const quality = action.type === 'correct' ? 4 : 1; // Simplified: 4 for correct, 1 for incorrect

    // Update SRS data
    const { interval, easeFactor } = srs.calculateNextReview(currentItem, quality);
    currentItem.interval = interval;
    currentItem.easeFactor = easeFactor;
    
    const nextReviewDate = new Date(now);
    nextReviewDate.setDate(now.getDate() + interval);
    currentItem.nextReview = nextReviewDate.toISOString();

    // Update confidence and status
    if (action.type === 'correct') {
      currentItem.confidence = Math.min(1, currentItem.confidence + 0.1);
      if (currentItem.confidence >= 0.8 && currentItem.interval > 30) { // Example threshold for 'mastered'
        currentItem.status = 'mastered';
        currentItem.lastMastered = now.toISOString();
      } else {
        currentItem.status = 'reviewing';
      }
    } else {
      currentItem.confidence = Math.max(0, currentItem.confidence - 0.2);
      currentItem.status = 'learning';
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

  const updatePreferences = useCallback((prefs: Partial<UserProfile['preferences']>) => {
    // This will be implemented later
    console.log("Updating preferences with", prefs);
  }, []);

  const resetProgress = useCallback((kanaKeys?: string[]) => {
    // This will be implemented later
    console.log("Resetting progress for", kanaKeys);
  }, []);
  
  return {
    progress,
    isLoading,
    error,
    updateKanaProgress,
    getKanaStatus,
    getRecommendations,
    updatePreferences,
    resetProgress
  };
}
