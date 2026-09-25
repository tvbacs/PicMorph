import AsyncStorage from '@react-native-async-storage/async-storage';
import { DraftItem } from '../types';

const DRAFTS_STORAGE_KEY = '@picmorph_drafts';

export const draftService = {
  async getDrafts(): Promise<DraftItem[]> {
    try {
      const data = await AsyncStorage.getItem(DRAFTS_STORAGE_KEY);
      if (!data) return [];
      const parsed: DraftItem[] = JSON.parse(data);
      // Sort newest first
      return parsed.sort((a, b) => b.updatedAt - a.updatedAt);
    } catch (error) {
      console.error('Error reading drafts from storage:', error);
      return [];
    }
  },

  async saveDraft(
    draftData: Omit<DraftItem, 'id' | 'createdAt' | 'updatedAt'>,
    existingId?: string
  ): Promise<DraftItem> {
    try {
      const drafts = await this.getDrafts();
      const now = Date.now();

      if (existingId) {
        // Update existing draft
        const index = drafts.findIndex((d) => d.id === existingId);
        if (index !== -1) {
          const updatedDraft: DraftItem = {
            ...drafts[index],
            ...draftData,
            updatedAt: now,
          };
          drafts[index] = updatedDraft;
          await AsyncStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
          return updatedDraft;
        }
      }

      // Create new draft
      const newDraft: DraftItem = {
        id: `draft_${now}_${Math.random().toString(36).substring(2, 7)}`,
        ...draftData,
        createdAt: now,
        updatedAt: now,
      };

      const updatedDrafts = [newDraft, ...drafts];
      await AsyncStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(updatedDrafts));
      return newDraft;
    } catch (error) {
      console.error('Error saving draft to storage:', error);
      throw error;
    }
  },

  async deleteDraft(id: string): Promise<void> {
    try {
      const drafts = await this.getDrafts();
      const filtered = drafts.filter((d) => d.id !== id);
      await AsyncStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting draft from storage:', error);
      throw error;
    }
  },

  async getDraftById(id: string): Promise<DraftItem | null> {
    try {
      const drafts = await this.getDrafts();
      return drafts.find((d) => d.id === id) || null;
    } catch (error) {
      console.error('Error getting draft by id:', error);
      return null;
    }
  },
};
