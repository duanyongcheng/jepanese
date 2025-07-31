// 学习进度系统类型定义
// Learning Progress System Type Definitions

// 假名学习状态
export type KanaStatus = 'new' | 'learning' | 'reviewing' | 'mastered' | 'suspended';

// 进度操作类型
export type ProgressAction = 
  | { type: 'expose'; quality?: number }
  | { type: 'interact'; quality: number }
  | { type: 'reset' }
  | { type: 'suspend' }
  | { type: 'resume' };

// 单个假名学习项目
export interface KanaItem {
  // 核心数据
  exposures: number;           // 曝光次数（看到的次数）
  interactions: number;        // 交互次数（点击次数）
  
  // 学习质量指标
  confidence: number;          // 置信度 (0-1)
  retention: number;           // 记忆保持度 (0-1)
  
  // 时间追踪
  firstSeen: string;          // 首次学习
  lastSeen: string;           // 最后学习
  lastMastered?: string;      // 掌握时间
  
  // 学习状态
  status: KanaStatus;         // 当前状态
  difficulty: number;         // 难度系数 (0-1)
  
  // 间隔重复算法数据
  interval: number;           // 复习间隔（天）
  easeFactor: number;         // 简易度因子
  nextReview?: string;        // 下次复习时间
}

// 假名进度映射
export interface KanaProgress {
  [kanaKey: string]: KanaItem;
}

// 里程碑类型
export interface Milestone {
  type: 'kana_mastered' | 'streak' | 'total_reviews' | 'perfect_week';
  value: number;
  achievedAt: string;
  celebrated: boolean;         // 是否已展示祝贺
}

// 学习统计
export interface LearningStats {
  // 会话统计
  sessions: {
    total: number;
    currentStreak: number;     // 连续天数
    longestStreak: number;     // 最长连续
    lastSessionDate: string;
  };
  
  // 时间统计
  timeSpent: {
    total: number;             // 总时长（秒）
    today: number;            // 今日时长
    thisWeek: number;         // 本周时长
    average: number;          // 平均每日
  };
  
  // 成就统计
  achievements: {
    totalKanaMastered: number;
    totalReviews: number;
    perfectDays: number;       // 完成每日目标的天数
    milestones: Milestone[];   // 里程碑
  };
}

// 用户配置文件
export interface UserProfile {
  displayName?: string;         // 显示名称（可选）
  preferences: {
    dailyGoal: number;          // 每日目标（假名数）
    reminderEnabled: boolean;   // 提醒开关
    displayMode: 'card' | 'list'; // 显示模式
    progressIndicator: 'color' | 'badge' | 'both'; // 进度指示器类型
  };
  createdAt: string;           // 创建时间
  lastActiveAt: string;        // 最后活跃时间
}

// 元数据
export interface Metadata {
  appVersion: string;
  lastSync?: string;           // 最后同步时间（预留）
  deviceId: string;            // 设备标识
  checksum?: string;           // 数据校验和
}

// 主要学习进度数据结构
export interface LearningProgress {
  version: string;              // 数据结构版本，便于迁移
  userId: string;               // 用户标识（本地生成UUID）
  profile: UserProfile;         // 用户配置文件
  kanaProgress: KanaProgress;   // 假名学习进度
  statistics: LearningStats;    // 学习统计
  metadata: Metadata;           // 元数据
}

// 连续学习信息
export interface StreakInfo {
  current: number;
  longest: number;
  hoursUntilBreak: number;
  willBreakToday: boolean;
}

// 使用进度Hook的返回类型
export interface UseProgressReturn {
  // 数据
  progress: LearningProgress | null;
  isLoading: boolean;
  error: Error | null;
  
  // 操作
  updateKanaProgress: (kanaKey: string, action: ProgressAction) => void;
  getKanaStatus: (kanaKey: string) => KanaStatus;
  getRecommendations: (rowKeys: string[]) => string[];
  
  // 统计
  getStats: () => LearningStats;
  getStreakInfo: () => StreakInfo;
  
  // 设置
  updatePreferences: (prefs: Partial<UserProfile['preferences']>) => void;
  resetProgress: (kanaKeys?: string[]) => void;
}

// 存储仓库接口
export interface IProgressRepository {
  save(progress: LearningProgress): Promise<void>;
  load(): Promise<LearningProgress | null>;
  migrate(oldVersion: string, data: Record<string, unknown>): LearningProgress;
  export(): Promise<string>;
  import(data: string): Promise<boolean>;
}

// 间隔重复结果
export interface SpacedRepetitionResult {
  interval: number;
  easeFactor: number;
  nextReview: Date;
}

// 推荐算法候选项
export interface RecommendationCandidate {
  kana: string;
  item: KanaItem | undefined;
  score: number;
}