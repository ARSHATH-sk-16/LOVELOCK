/**
 * LOVELOCK Settings Store
 *
 * Zustand store for managing app settings, preferences, and customization.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  AIPersonalizationSettings,
  PersonalizationProfile,
  LoveQuote,
  SoundEffect,
  HomeWidget,
  Anniversary,
  TimeOfDay,
  UserMood,
  ColorScheme,
  AnimationSpeed,
} from '@/types';

interface SettingsStore {
  // AI Settings
  aiSettings: AIPersonalizationSettings;
  updateAISettings: (settings: Partial<AIPersonalizationSettings>) => void;

  // Personalization Profile
  personalizationProfile: PersonalizationProfile;
  updatePersonalizationProfile: (profile: Partial<PersonalizationProfile>) => void;

  // Love Quotes
  customQuotes: LoveQuote[];
  favoriteQuotes: string[]; // quote IDs
  addCustomQuote: (quote: Omit<LoveQuote, 'id' | 'userSubmitted' | 'timestamp'>) => void;
  toggleFavoriteQuote: (quoteId: string) => void;
  removeCustomQuote: (quoteId: string) => void;

  // Sound Settings
  soundEnabled: boolean;
  masterVolume: number; // 0-1
  soundEffects: SoundEffect[];
  updateSoundSettings: (enabled: boolean, volume: number) => void;
  updateSoundEffect: (name: string, updates: Partial<SoundEffect>) => void;

  // Home Screen Layout
  homeWidgets: HomeWidget[];
  updateHomeWidget: (widgetId: string, updates: Partial<HomeWidget>) => void;
  addHomeWidget: (widget: Omit<HomeWidget, 'id'>) => void;
  removeHomeWidget: (widgetId: string) => void;

  // Anniversaries & Special Dates
  anniversaries: Anniversary[];
  addAnniversary: (anniversary: Omit<Anniversary, 'id'>) => void;
  updateAnniversary: (anniversaryId: string, updates: Partial<Anniversary>) => void;
  removeAnniversary: (anniversaryId: string) => void;

  // Accessibility
  accessibilitySettings: {
    largeText: boolean;
    highContrast: boolean;
    reducedMotion: boolean;
    hapticFeedback: boolean;
    soundAccessibility: boolean;
  };
  updateAccessibilitySettings: (settings: Partial<SettingsStore['accessibilitySettings']>) => void;

  // Display Settings
  displaySettings: {
    colorScheme: ColorScheme;
    animationSpeed: AnimationSpeed;
    brightness: number; // 0-1
    autoBrightness: boolean;
  };
  updateDisplaySettings: (settings: Partial<SettingsStore['displaySettings']>) => void;

  // Privacy & Data
  privacySettings: {
    analyticsEnabled: boolean;
    crashReporting: boolean;
    learningDataCollection: boolean;
    cloudBackup: boolean;
  };
  updatePrivacySettings: (settings: Partial<SettingsStore['privacySettings']>) => void;

  // App Preferences
  preferences: {
    firstLaunch: boolean;
    onboardingCompleted: boolean;
    theme: 'auto' | 'light' | 'dark';
    language: string;
  };
  updatePreferences: (preferences: Partial<SettingsStore['preferences']>) => void;

  // Export/Import
  exportSettings: () => Promise<string>;
  importSettings: (settingsJson: string) => Promise<boolean>;

  // Reset
  reset: () => void;
}

const defaultAISettings: AIPersonalizationSettings = {
  enabled: true,
  intensity: 'moderate',
  features: {
    timeBased: true,
    moodDetection: true,
    interactionPatterns: true,
    predictiveSelection: false,
    batteryOptimization: true,
  },
  adaptationFrequency: 'normal',
  userOverrides: true,
  learningRate: 0.1,
};

const defaultPersonalizationProfile: PersonalizationProfile = {
  timeOfDay: 'morning',
  userMood: 'calm',
  preferredBackground: 'nightSky',
  animationSpeed: 'normal',
  colorScheme: 'warm',
  soundLevel: 0.7,
  hapticIntensity: 0.8,
};

const defaultAccessibilitySettings = {
  largeText: false,
  highContrast: false,
  reducedMotion: false,
  hapticFeedback: true,
  soundAccessibility: true,
};

const defaultDisplaySettings = {
  colorScheme: 'warm' as ColorScheme,
  animationSpeed: 'normal' as AnimationSpeed,
  brightness: 0.8,
  autoBrightness: true,
};

const defaultPrivacySettings = {
  analyticsEnabled: false,
  crashReporting: true,
  learningDataCollection: true,
  cloudBackup: false,
};

const defaultPreferences = {
  firstLaunch: true,
  onboardingCompleted: false,
  theme: 'auto' as 'auto' | 'light' | 'dark',
  language: 'en',
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      aiSettings: defaultAISettings,
      personalizationProfile: defaultPersonalizationProfile,
      customQuotes: [],
      favoriteQuotes: [],
      soundEnabled: true,
      masterVolume: 0.8,
      soundEffects: [],
      homeWidgets: [],
      anniversaries: [],
      accessibilitySettings: defaultAccessibilitySettings,
      displaySettings: defaultDisplaySettings,
      privacySettings: defaultPrivacySettings,
      preferences: defaultPreferences,

      updateAISettings: (newSettings) =>
        set((state) => ({
          aiSettings: { ...state.aiSettings, ...newSettings },
        })),

      updatePersonalizationProfile: (newProfile) =>
        set((state) => ({
          personalizationProfile: { ...state.personalizationProfile, ...newProfile },
        })),

      addCustomQuote: (quote) =>
        set((state) => ({
          customQuotes: [
            ...state.customQuotes,
            {
              ...quote,
              id: `custom_${Date.now()}`,
              userSubmitted: true,
              timestamp: new Date(),
            },
          ],
        })),

      toggleFavoriteQuote: (quoteId) =>
        set((state) => ({
          favoriteQuotes: state.favoriteQuotes.includes(quoteId)
            ? state.favoriteQuotes.filter((id) => id !== quoteId)
            : [...state.favoriteQuotes, quoteId],
        })),

      removeCustomQuote: (quoteId) =>
        set((state) => ({
          customQuotes: state.customQuotes.filter((quote) => quote.id !== quoteId),
          favoriteQuotes: state.favoriteQuotes.filter((id) => id !== quoteId),
        })),

      updateSoundSettings: (enabled, volume) =>
        set(() => ({
          soundEnabled: enabled,
          masterVolume: volume,
        })),

      updateSoundEffect: (name, updates) =>
        set((state) => ({
          soundEffects: state.soundEffects.map((effect) =>
            effect.name === name ? { ...effect, ...updates } : effect,
          ),
        })),

      updateHomeWidget: (widgetId, updates) =>
        set((state) => ({
          homeWidgets: state.homeWidgets.map((widget) =>
            widget.id === widgetId ? { ...widget, ...updates } : widget,
          ),
        })),

      addHomeWidget: (widget) =>
        set((state) => ({
          homeWidgets: [
            ...state.homeWidgets,
            { ...widget, id: `widget_${Date.now()}` },
          ],
        })),

      removeHomeWidget: (widgetId) =>
        set((state) => ({
          homeWidgets: state.homeWidgets.filter((widget) => widget.id !== widgetId),
        })),

      addAnniversary: (anniversary) =>
        set((state) => ({
          anniversaries: [
            ...state.anniversaries,
            { ...anniversary, id: `anniversary_${Date.now()}` },
          ],
        })),

      updateAnniversary: (anniversaryId, updates) =>
        set((state) => ({
          anniversaries: state.anniversaries.map((anniversary) =>
            anniversary.id === anniversaryId ? { ...anniversary, ...updates } : anniversary,
          ),
        })),

      removeAnniversary: (anniversaryId) =>
        set((state) => ({
          anniversaries: state.anniversaries.filter(
            (anniversary) => anniversary.id !== anniversaryId,
          ),
        })),

      updateAccessibilitySettings: (settings) =>
        set((state) => ({
          accessibilitySettings: { ...state.accessibilitySettings, ...settings },
        })),

      updateDisplaySettings: (settings) =>
        set((state) => ({
          displaySettings: { ...state.displaySettings, ...settings },
        })),

      updatePrivacySettings: (settings) =>
        set((state) => ({
          privacySettings: { ...state.privacySettings, ...settings },
        })),

      updatePreferences: (preferences) =>
        set((state) => ({
          preferences: { ...state.preferences, ...preferences },
        })),

      exportSettings: async () => {
        const state = get();
        const exportData = {
          aiSettings: state.aiSettings,
          personalizationProfile: state.personalizationProfile,
          customQuotes: state.customQuotes,
          favoriteQuotes: state.favoriteQuotes,
          soundEffects: state.soundEffects,
          homeWidgets: state.homeWidgets,
          anniversaries: state.anniversaries,
          accessibilitySettings: state.accessibilitySettings,
          displaySettings: state.displaySettings,
          privacySettings: state.privacySettings,
          preferences: state.preferences,
          exportedAt: new Date().toISOString(),
          version: '1.0.0',
        };
        return JSON.stringify(exportData, null, 2);
      },

      importSettings: async (settingsJson) => {
        try {
          const importedData = JSON.parse(settingsJson);

          // Validate import data structure
          if (!importedData.version) {
            throw new Error('Invalid settings file');
          }

          // Only import supported settings
          const importableSettings = [
            'aiSettings',
            'personalizationProfile',
            'customQuotes',
            'favoriteQuotes',
            'soundEffects',
            'homeWidgets',
            'anniversaries',
            'accessibilitySettings',
            'displaySettings',
            'privacySettings',
          ];

          const updates: Partial<SettingsStore> = {};
          importableSettings.forEach((key) => {
            if (importedData[key]) {
              updates[key] = importedData[key];
            }
          });

          set((state) => ({ ...state, ...updates }));
          return true;
        } catch (error) {
          console.error('Failed to import settings:', error);
          return false;
        }
      },

      reset: () =>
        set(() => ({
          aiSettings: defaultAISettings,
          personalizationProfile: defaultPersonalizationProfile,
          customQuotes: [],
          favoriteQuotes: [],
          soundEnabled: true,
          masterVolume: 0.8,
          soundEffects: [],
          homeWidgets: [],
          anniversaries: [],
          accessibilitySettings: defaultAccessibilitySettings,
          displaySettings: defaultDisplaySettings,
          privacySettings: defaultPrivacySettings,
          preferences: { ...defaultPreferences, firstLaunch: false }, // Keep firstLaunch false after reset
        })),
    }),
    {
      name: 'lovelock-settings-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);