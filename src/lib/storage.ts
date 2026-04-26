import { get, set } from 'idb-keyval';

/**
 * Enhanced storage utility using IndexedDB via idb-keyval.
 * IndexedDB has much larger storage limits (typically hundreds of MBs or more)
 * compared to localStorage (5MB).
 */

export const saveToStorage = async (key: string, data: any) => {
  try {
    // Also save to localStorage as a fallback for small data/redundancy
    // but don't fail if localStorage is full
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      // localStorage might be full, that's okay because we use idb
    }
    
    // Save to IndexedDB (the real "save more" solution)
    await set(key, data);
  } catch (error) {
    console.error('Failed to save to storage:', error);
    throw error;
  }
};

export const loadFromStorage = async <T>(key: string): Promise<T | null> => {
  try {
    // Try IndexedDB first
    const idbData = await get(key);
    if (idbData) return idbData as T;

    // Fallback to localStorage if idb is empty (e.g., migration phase)
    const localData = localStorage.getItem(key);
    if (localData) {
      try {
        const parsed = JSON.parse(localData);
        // Migrating from localStorage to IndexedDB automatically
        await set(key, parsed);
        return parsed as T;
      } catch (e) {
        return null;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Failed to load from storage:', error);
    return null;
  }
};
