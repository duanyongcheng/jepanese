import { KanaItem } from '../types/progress';

// src/utils/spaced-repetition.ts
export class SpacedRepetition {
  // SuperMemo 2算法变体
  calculateNextReview(item: KanaItem, quality: number): {
    interval: number;
    easeFactor: number;
  } {
    // quality: 0-5 (0=完全忘记, 5=非常容易)
    let { interval, easeFactor } = item;
    
    if (quality < 3) {
      // 重置间隔
      interval = 1;
    } else {
      if (interval === 0) {
        interval = 1;
      } else if (interval === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
    }
    
    // 调整简易度因子
    easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
    
    return { interval, easeFactor };
  }
}
