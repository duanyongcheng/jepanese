# 日语假名学习应用 - 学习进度系统开发文档 v3.0

## 项目现状与规划

### 当前实现状态评估
经过深入分析，当前实现**大幅超越**了原始规划，已具备：
- ✅ 完整的学习进度追踪系统（高级间隔重复算法）
- ✅ 智能推荐系统（基于状态、时间、难度、置信度）
- ✅ 专业UI界面（响应式设计，进度可视化）
- ✅ 健壮数据持久化（压缩存储，备份/回滚）
- ⚠️ 基础统计功能（高级分析待完善）
- ❌ 成就系统UI（待实现）
- ❌ 音频功能（待实现）
- ❌ 书写练习（待实现）

## 架构设计理念

### 核心原则
1. **渐进增强** - 从简单的本地存储开始，逐步扩展到云端同步
2. **数据一致性** - 统一的数据模型，便于未来迁移
3. **性能优先** - 轻量级实现，确保流畅体验
4. **用户中心** - 直观的视觉反馈，有意义的进度展示

### 系统架构
```
┌─────────────────────────────────────────────────────────┐
│                     应用层 (React)                       │
├─────────────────────────────────────────────────────────┤
│                  进度管理层 (Hooks)                      │
├─────────────────────────────────────────────────────────┤
│              数据访问层 (Repository Pattern)             │
├─────────────────────────────────────────────────────────┤
│  本地存储 (localStorage)  │  云端存储 (Future API)      │
└─────────────────────────────────────────────────────────┘
```

## 数据模型设计

### 核心数据结构
```typescript
// src/types/progress.ts
interface LearningProgress {
  version: string;              // 数据结构版本，便于迁移
  userId: string;               // 用户标识（本地生成UUID）
  profile: UserProfile;         // 用户配置文件
  kanaProgress: KanaProgress;   // 假名学习进度
  statistics: LearningStats;    // 学习统计
  metadata: Metadata;           // 元数据
}

interface UserProfile {
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

interface KanaProgress {
  [kanaKey: string]: KanaItem;
}

interface KanaItem {
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

type KanaStatus = 'new' | 'learning' | 'reviewing' | 'mastered' | 'suspended';

interface LearningStats {
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

interface Milestone {
  type: 'kana_mastered' | 'streak' | 'total_reviews' | 'perfect_week';
  value: number;
  achievedAt: string;
  celebrated: boolean;         // 是否已展示祝贺
}

interface Metadata {
  appVersion: string;
  lastSync?: string;           // 最后同步时间（预留）
  deviceId: string;            // 设备标识
  checksum?: string;           // 数据校验和
}
```

### 间隔重复算法实现
```typescript
// src/utils/spaced-repetition.ts
class SpacedRepetition {
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
```

## 功能模块设计

### 1. 数据持久化层
```typescript
// src/services/storage/progress-repository.ts
interface IProgressRepository {
  save(progress: LearningProgress): Promise<void>;
  load(): Promise<LearningProgress | null>;
  migrate(oldVersion: string, data: any): LearningProgress;
  export(): Promise<string>;
  import(data: string): Promise<boolean>;
}

class LocalStorageRepository implements IProgressRepository {
  private readonly STORAGE_KEY = 'kana-learning-progress-v2';
  private readonly BACKUP_KEY = 'kana-learning-backup';
  
  async save(progress: LearningProgress): Promise<void> {
    try {
      // 创建备份
      const current = localStorage.getItem(this.STORAGE_KEY);
      if (current) {
        localStorage.setItem(this.BACKUP_KEY, current);
      }
      
      // 保存新数据
      const compressed = this.compress(progress);
      localStorage.setItem(this.STORAGE_KEY, compressed);
      
      // 验证保存
      await this.verify(progress);
    } catch (error) {
      // 恢复备份
      this.rollback();
      throw error;
    }
  }
  
  private compress(data: LearningProgress): string {
    // 实现数据压缩以节省存储空间
    return LZString.compressToUTF16(JSON.stringify(data));
  }
  
  private decompress(data: string): LearningProgress {
    return JSON.parse(LZString.decompressFromUTF16(data));
  }
}
```

### 2. 进度管理Hook
```typescript
// src/hooks/useProgress.ts
interface UseProgressReturn {
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

function useProgress(): UseProgressReturn {
  const [progress, setProgress] = useState<LearningProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const repository = useMemo(() => new LocalStorageRepository(), []);
  
  // 智能推荐算法
  const getRecommendations = useCallback((rowKeys: string[]) => {
    if (!progress) return [];
    
    const candidates = rowKeys.flatMap(row => GOJUON_ROWS[row]);
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
  }, [progress]);
  
  // 优先级计算
  const calculatePriority = (item: KanaItem | undefined, now: Date): number => {
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
      score += Math.min(overdueDays * 10, 50);
    }
    
    // 基于难度的调整
    score += item.difficulty * 20;
    
    // 基于置信度的调整
    score += (1 - item.confidence) * 15;
    
    return score;
  };
  
  return {
    progress,
    isLoading,
    error,
    updateKanaProgress,
    getKanaStatus,
    getRecommendations,
    // ... 其他方法
  };
}
```

### 3. 视觉组件系统
```typescript
// src/components/progress/KanaCard.tsx
interface KanaCardProps {
  kana: string;
  progress: KanaItem | undefined;
  onClick: () => void;
  revealed: boolean;
  showProgressIndicator: boolean;
}

const KanaCard: React.FC<KanaCardProps> = ({ 
  kana, 
  progress, 
  onClick, 
  revealed,
  showProgressIndicator 
}) => {
  const { status, confidence } = progress || { status: 'new', confidence: 0 };
  
  const getCardStyle = () => {
    const baseStyle = "aspect-square border-2 rounded-lg transition-all duration-200";
    
    if (!showProgressIndicator) return baseStyle;
    
    const statusStyles = {
      new: "border-gray-300 hover:border-gray-400",
      learning: "border-amber-400 bg-amber-50 hover:border-amber-500",
      reviewing: "border-blue-400 bg-blue-50 hover:border-blue-500",
      mastered: "border-green-400 bg-green-50 hover:border-green-500",
      suspended: "border-gray-200 bg-gray-100 opacity-50"
    };
    
    return `${baseStyle} ${statusStyles[status]}`;
  };
  
  const renderProgressBadge = () => {
    if (!showProgressIndicator || !progress) return null;
    
    return (
      <div className="absolute top-1 right-1">
        <ConfidenceIndicator value={confidence} />
        {progress.nextReview && <DueIndicator date={progress.nextReview} />}
      </div>
    );
  };
  
  return (
    <div 
      className={getCardStyle()}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      {renderProgressBadge()}
      <div className="flex items-center justify-center h-full">
        {revealed ? (
          <RevealedContent kana={kana} />
        ) : (
          <HiddenContent kana={kana} />
        )}
      </div>
    </div>
  );
};
```

### 4. 统计仪表板
```typescript
// src/components/progress/Dashboard.tsx
const ProgressDashboard: React.FC = () => {
  const { getStats, getStreakInfo, progress } = useProgress();
  const stats = getStats();
  const streak = getStreakInfo();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
      {/* 今日进度 */}
      <DailyProgress 
        completed={stats.achievements.totalKanaMastered}
        goal={progress?.profile.preferences.dailyGoal || 10}
        timeSpent={stats.timeSpent.today}
      />
      
      {/* 连续学习 */}
      <StreakCard 
        current={streak.current}
        longest={streak.longest}
        willBreakIn={streak.hoursUntilBreak}
      />
      
      {/* 掌握进度环 */}
      <MasteryRing 
        total={Object.keys(GOJUON_DATA).length}
        mastered={stats.achievements.totalKanaMastered}
        learning={countByStatus(progress, 'learning')}
        reviewing={countByStatus(progress, 'reviewing')}
      />
      
      {/* 详细统计 */}
      <div className="md:col-span-3">
        <DetailedStats progress={progress} />
      </div>
    </div>
  );
};
```

## 实施路线图

### 第一阶段：基础设施（2天）
1. **数据模型实现**
   - 类型定义
   - 数据验证
   - 迁移框架

2. **存储层实现**
   - Repository接口
   - LocalStorage实现
   - 数据压缩/解压

### 第二阶段：核心功能（3天）
1. **进度追踪**
   - useProgress Hook
   - 状态更新逻辑
   - 间隔重复算法

2. **智能推荐**
   - 优先级计算
   - 推荐算法
   - 批量处理优化

### 第三阶段：用户界面（3天）
1. **视觉反馈**
   - 进度卡片样式
   - 动画过渡
   - 响应式适配

2. **统计仪表板**
   - 数据可视化
   - 图表组件
   - 导出功能

### 第四阶段：高级功能（2天）
1. **数据分析**
   - 学习曲线
   - 难点识别
   - 个性化建议

2. **用户体验优化**
   - 成就系统
   - 激励机制
   - 辅助功能

## 性能优化策略

### 渲染优化
```typescript
// 使用React.memo和useMemo优化渲染
const KanaGrid = React.memo(({ kanas, progress }) => {
  const sortedKanas = useMemo(() => {
    return sortKanasByPriority(kanas, progress);
  }, [kanas, progress]);
  
  return (
    <VirtualizedGrid
      items={sortedKanas}
      renderItem={(kana) => <KanaCard key={kana} kana={kana} />}
    />
  );
});
```

### 数据存储优化
- 增量更新而非全量保存
- 批量操作合并
- 防抖保存策略
- IndexedDB作为大数据量备选方案

## 测试策略

### 单元测试
```typescript
describe('SpacedRepetition', () => {
  it('should reset interval on poor performance', () => {
    const item: KanaItem = {
      interval: 10,
      easeFactor: 2.5,
      // ...
    };
    
    const result = spacedRepetition.calculateNextReview(item, 2);
    expect(result.interval).toBe(1);
  });
});
```

### 集成测试
- 数据持久化完整性
- 跨浏览器兼容性
- 大数据量性能测试
- 数据迁移测试

## 未来扩展考虑

### 云端同步准备
```typescript
interface CloudSyncAdapter {
  push(progress: LearningProgress): Promise<void>;
  pull(userId: string): Promise<LearningProgress>;
  merge(local: LearningProgress, remote: LearningProgress): LearningProgress;
  resolveConflicts(conflicts: Conflict[]): Resolution;
}
```

### API设计预留
```typescript
// 预留的API端点设计
interface ProgressAPI {
  '/api/progress/:userId': {
    GET: () => Promise<LearningProgress>;
    PUT: (data: LearningProgress) => Promise<void>;
  };
  '/api/progress/:userId/sync': {
    POST: (lastSync: string) => Promise<SyncResult>;
  };
}
```

## 开发规范

### 代码组织
```
src/
├── features/
│   └── progress/
│       ├── components/     # UI组件
│       ├── hooks/         # 自定义Hooks
│       ├── services/      # 业务逻辑
│       ├── types/         # 类型定义
│       └── utils/         # 工具函数
├── shared/
│   ├── components/        # 通用组件
│   └── utils/            # 通用工具
```

### 命名规范
- 组件：PascalCase
- Hook：camelCase，以use开头
- 类型：PascalCase，接口以I开头
- 常量：UPPER_SNAKE_CASE

这份文档提供了一个完整的、可扩展的学习进度系统设计，从本地存储开始，为未来的云端用户系统做好了充分准备。

---

## v3.0 综合开发计划

### 第一阶段：用户体验增强（高优先级）

#### 1. 成就系统UI实现
```
[成就系统架构]
┌─────────────────────────────────┐
│        成就管理器              │
├─────────────────────────────────┤
│  ├── 里程碑追踪                │
│  ├── 等级系统                  │
│  ├── 徽章收集                  │
│  └── 庆祝动画                  │
└─────────────────────────────────┘
```

**核心组件：**
- 里程碑庆祝弹窗（带五彩纸屑动画）
- 成就徽章展示面板
- 等级进度条和升级提示
- 连续学习保护提醒

#### 2. 增强仪表板
```
[仪表板功能矩阵]
┌─────────────────┬─────────────────┬─────────────────┐
│  基础统计        │  学习分析        │  个性化建议      │
├─────────────────┼─────────────────┼─────────────────┤
│ • 今日进度      │ • 难度热图      │ • 学习建议      │
│ • 连续天数      │ • 学习曲线      │ • 复习提醒      │
│ • 掌握进度      │ • 保留率分析    │ • 优化建议      │
│ • 时间统计      │ • 习惯分析      │ • 目标设定      │
└─────────────────┴─────────────────┴─────────────────┘
```

#### 3. 数据导出/导入界面
```
[数据管理流程]
用户请求 → 格式选择 → 数据验证 → 执行操作 → 结果反馈
    ↓         ↓         ↓         ↓         ↓
  模态窗口   JSON/CSV   完整性检查   进度显示   成功/失败
```

### 第二阶段：学习功能扩展（中优先级）

#### 1. 音频发音系统
- 高质量音频文件集成
- 自动播放和速度控制
- 录音对比功能
- 多种发音选择

#### 2. 书写练习系统
- 笔画顺序动画
- 绘图画布集成
- 笔迹识别算法
- 正确性反馈系统

#### 3. 词汇集成
- 例词展示和练习
- 常用短语学习
- 语境应用练习
- 进度追踪

### 第三阶段：高级功能（低优先级）

#### 1. 数据可视化
- 学习曲线图表
- 保留率可视化
- 学习习惯分析
- 进度报告导出

#### 2. 移动端优化
- 触摸交互改进
- 手势导航
- 离线模式支持
- 性能优化

#### 3. 技术债务清理
- 完整测试套件
- 性能监控
- 无障碍改进
- 文档更新

### 实施策略
- 保持现有架构和代码模式
- 渐进式功能添加
- 确保向后兼容性
- 性能优先原则

### 成功指标
- 用户参与度提升30%
- 学习效率提高20%
- 保持轻量级高性能
- 用户体验显著改善