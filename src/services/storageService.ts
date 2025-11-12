/**
 * LOVELOCK Storage Service
 *
 * Manages local storage for offline functionality and user preferences.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StorageKey, StorageValue } from '@/types';

class StorageService {
  private readonly prefix = 'lovelock_';

  /**
   * Store data with a key
   */
  async set<T extends StorageValue>(key: string, value: T): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      await AsyncStorage.setItem(this.prefix + key, serializedValue);
    } catch (error) {
      console.error(`Failed to store data for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Retrieve data by key
   */
  async get<T extends StorageValue>(key: string, defaultValue?: T): Promise<T | undefined> {
    try {
      const serializedValue = await AsyncStorage.getItem(this.prefix + key);
      if (serializedValue === null) {
        return defaultValue;
      }
      return JSON.parse(serializedValue) as T;
    } catch (error) {
      console.error(`Failed to retrieve data for key ${key}:`, error);
      return defaultValue;
    }
  }

  /**
   * Remove data by key
   */
  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.error(`Failed to remove data for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(this.prefix + key);
      return value !== null;
    } catch (error) {
      console.error(`Failed to check if key exists ${key}:`, error);
      return false;
    }
  }

  /**
   * Get all keys with the app prefix
   */
  async getAllKeys(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return keys
        .filter((key) => key.startsWith(this.prefix))
        .map((key) => key.substring(this.prefix.length));
    } catch (error) {
      console.error('Failed to get all keys:', error);
      return [];
    }
  }

  /**
   * Clear all app data
   */
  async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const appKeys = keys.filter((key) => key.startsWith(this.prefix));
      await AsyncStorage.multiRemove(appKeys);
    } catch (error) {
      console.error('Failed to clear storage:', error);
      throw error;
    }
  }

  /**
   * Store multiple key-value pairs
   */
  async multiSet<T extends StorageValue>(
    pairs: Array<[string, T]>
  ): Promise<void> {
    try {
      const serializedPairs = pairs.map(([key, value]) => [
        this.prefix + key,
        JSON.stringify(value),
      ]);
      await AsyncStorage.multiSet(serializedPairs);
    } catch (error) {
      console.error('Failed to store multiple key-value pairs:', error);
      throw error;
    }
  }

  /**
   * Retrieve multiple values by keys
   */
  async multiGet<T extends StorageValue>(
    keys: string[]
  ): Promise<Array<[string, T | undefined]>> {
    try {
      const prefixedKeys = keys.map((key) => this.prefix + key);
      const result = await AsyncStorage.multiGet(prefixedKeys);
      return result.map(([key, value]) => [
        key.substring(this.prefix.length),
        value ? (JSON.parse(value) as T) : undefined,
      ]);
    } catch (error) {
      console.error('Failed to retrieve multiple values:', error);
      return keys.map((key) => [key, undefined]);
    }
  }

  /**
   * Remove multiple keys
   */
  async multiRemove(keys: string[]): Promise<void> {
    try {
      const prefixedKeys = keys.map((key) => this.prefix + key);
      await AsyncStorage.multiRemove(prefixedKeys);
    } catch (error) {
      console.error('Failed to remove multiple keys:', error);
      throw error;
    }
  }

  /**
   * Get storage size estimation
   */
  async getStorageSize(): Promise<number> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const appKeys = keys.filter((key) => key.startsWith(this.prefix));
      let totalSize = 0;

      for (const key of appKeys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += key.length + value.length;
        }
      }

      return totalSize; // Size in bytes (rough estimate)
    } catch (error) {
      console.error('Failed to get storage size:', error);
      return 0;
    }
  }

  /**
   * Export all data as JSON string
   */
  async exportData(): Promise<string> {
    try {
      const keys = await this.getAllKeys();
      const pairs = await this.multiGet(keys);

      const exportData: Record<string, StorageValue> = {};
      pairs.forEach(([key, value]) => {
        if (value !== undefined) {
          exportData[key] = value;
        }
      });

      return JSON.stringify({
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        data: exportData,
      });
    } catch (error) {
      console.error('Failed to export data:', error);
      throw error;
    }
  }

  /**
   * Import data from JSON string
   */
  async importData(jsonData: string): Promise<boolean> {
    try {
      const importData = JSON.parse(jsonData);

      if (!importData.data || typeof importData.data !== 'object') {
        throw new Error('Invalid import data format');
      }

      const pairs: Array<[string, StorageValue]> = Object.entries(
        importData.data
      ) as Array<[string, StorageValue]>;

      await this.multiSet(pairs);
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }

  /**
   * Cache management - get cache info
   */
  async getCacheInfo(): Promise<{
    size: number;
    itemCount: number;
    lastModified?: Date;
  }> {
    try {
      const keys = await this.getAllKeys();
      const size = await this.getStorageSize();

      // Get last modified time by checking metadata key
      const lastModifiedStr = await this.get<string>('metadata_lastModified');
      const lastModified = lastModifiedStr ? new Date(lastModifiedStr) : undefined;

      return {
        size,
        itemCount: keys.length,
        lastModified,
      };
    } catch (error) {
      console.error('Failed to get cache info:', error);
      return {
        size: 0,
        itemCount: 0,
      };
    }
  }

  /**
   * Update metadata
   */
  async updateMetadata(): Promise<void> {
    try {
      await this.set('metadata_lastModified', new Date().toISOString());
    } catch (error) {
      console.error('Failed to update metadata:', error);
    }
  }

  /**
   * Clear expired data
   */
  async clearExpiredData(maxAge: number = 30 * 24 * 60 * 60 * 1000): Promise<void> {
    try {
      const keys = await this.getAllKeys();
      const now = Date.now();
      const keysToRemove: string[] = [];

      for (const key of keys) {
        // Check for timestamp in stored data
        const value = await this.get(key);
        if (value && typeof value === 'object' && 'timestamp' in value) {
          const timestamp = new Date((value as any).timestamp).getTime();
          if (now - timestamp > maxAge) {
            keysToRemove.push(key);
          }
        }
      }

      if (keysToRemove.length > 0) {
        await this.multiRemove(keysToRemove);
        console.log(`Cleared ${keysToRemove.length} expired items`);
      }
    } catch (error) {
      console.error('Failed to clear expired data:', error);
    }
  }

  /**
   * Initialize storage service
   */
  async initialize(): Promise<void> {
    try {
      // Test AsyncStorage availability
      await AsyncStorage.getItem('test');
      await this.updateMetadata();
      console.log('Storage service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize storage service:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const storageService = new StorageService();

// Export for use in components
export default storageService;