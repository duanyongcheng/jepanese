import { LearningProgress, IProgressRepository } from '../../types/progress';
import * as LZString from 'lz-string';

export class LocalStorageRepository implements IProgressRepository {
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
      
      // 验证保存 (This is a simplified verification)
      const savedData = localStorage.getItem(this.STORAGE_KEY);
      if (savedData !== compressed) {
        throw new Error("Failed to save progress to localStorage.");
      }

    } catch (error) {
      // 恢复备份
      this.rollback();
      console.error("Error saving progress, rolled back to previous state.", error);
      throw error;
    }
  }

  async load(): Promise<LearningProgress | null> {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) {
      return null;
    }
    try {
      return this.decompress(data);
    } catch (error) {
      console.error("Error decompressing progress data.", error);
      // Attempt to load from backup
      const backupData = localStorage.getItem(this.BACKUP_KEY);
      if (backupData) {
        try {
          const decompressedBackup = this.decompress(backupData);
          // Restore backup
          localStorage.setItem(this.STORAGE_KEY, backupData);
          return decompressedBackup;
        } catch (backupError) {
          console.error("Error decompressing backup data.", backupError);
        }
      }
      return null;
    }
  }

  // This is a placeholder for a future, more robust migration system.
  migrate(oldVersion: string, data: Record<string, unknown>): LearningProgress {
    console.log(`Migrating data from version ${oldVersion}...`);
    // For now, we'll just assume the data is compatible.
    // In a real-world scenario, you would have specific logic for each version.
    return data as unknown as LearningProgress;
  }

  async export(): Promise<string> {
    const progress = await this.load();
    if (!progress) {
      throw new Error("No progress data to export.");
    }
    return JSON.stringify(progress, null, 2);
  }

  async import(data: string): Promise<boolean> {
    try {
      const progress = JSON.parse(data) as LearningProgress;
      // Basic validation
      if (!progress.version || !progress.userId || !progress.kanaProgress) {
        throw new Error("Invalid import data format.");
      }
      await this.save(progress);
      return true;
    } catch (error) {
      console.error("Failed to import progress data.", error);
      return false;
    }
  }
  
  private compress(data: LearningProgress): string {
    return LZString.compressToUTF16(JSON.stringify(data));
  }
  
  private decompress(data: string): LearningProgress {
    const decompressed = LZString.decompressFromUTF16(data);
    if (!decompressed) {
      throw new Error("Decompression failed.");
    }
    return JSON.parse(decompressed);
  }

  private rollback(): void {
    const backup = localStorage.getItem(this.BACKUP_KEY);
    if (backup) {
      localStorage.setItem(this.STORAGE_KEY, backup);
    } else {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }
}
