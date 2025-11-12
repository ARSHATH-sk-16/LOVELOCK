/**
 * LOVELOCK AI Personalization Store
 *
 * Zustand store for managing AI personalization, mood detection, and learning.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  PersonalizationProfile,
  UserInteractionData,
  MoodDetectionModel,
  AIRecommendation,
  InteractionPattern,
  LearningModel,
  DeviceContext,
  TimeOfDay,
  UserMood,
  BackgroundTheme,
} from '@/types';

interface AIStore {
  // Current state
  currentProfile: PersonalizationProfile;
  deviceContext: DeviceContext;
  lastMoodDetection: MoodDetectionModel | null;
  currentRecommendations: AIRecommendation[];

  // Learning data
  interactionHistory: UserInteractionData[];
  interactionPattern: InteractionPattern | null;
  learningModel: LearningModel;

  // AI processing
  updateDeviceContext: (context: Partial<DeviceContext>) => void;
  addInteractionData: (data: UserInteractionData) => void;
  analyzeMood: () => UserMood;
  generateRecommendations: () => AIRecommendation[];
  updatePersonalizationProfile: (profile: Partial<PersonalizationProfile>) => void;

  // Pattern analysis
  analyzeInteractionPattern: () => InteractionPattern;
  detectMoodFromInteractions: (interactions: UserInteractionData[]) => UserMood;
  predictOptimalBackground: (timeOfDay: TimeOfDay, mood: UserMood) => BackgroundTheme;

  // Learning
  trainModel: () => Promise<boolean>;
  saveLearningProgress: () => Promise<void>;
  loadLearningProgress: () => Promise<void>;

  // AI feedback
  acceptRecommendation: (recommendationId: string) => void;
  rejectRecommendation: (recommendationId: string) => void;

  // Analytics
  getAIInsights: () => {
    moodAccuracy: number;
    recommendationAcceptanceRate: number;
    learningProgress: number;
    batteryImpact: number;
  };

  // Reset
  reset: () => void;
}

const getCurrentTimeOfDay = (): TimeOfDay => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
};

const getCurrentDeviceContext = (): DeviceContext => ({
  batteryLevel: 100, // Would be detected from device
  isCharging: false,
  deviceOrientation: 'portrait',
  timeOfDay: getCurrentTimeOfDay(),
  dayOfWeek: new Date().getDay(),
  isConnected: true,
});

const defaultLearningModel: LearningModel = {
  version: '1.0.0',
  lastTrained: new Date(),
  accuracy: 0.8,
  sampleSize: 0,
};

const defaultPersonalizationProfile: PersonalizationProfile = {
  timeOfDay: getCurrentTimeOfDay(),
  userMood: 'calm',
  preferredBackground: 'nightSky',
  animationSpeed: 'normal',
  colorScheme: 'warm',
  soundLevel: 0.7,
  hapticIntensity: 0.8,
};

export const useAIStore = create<AIStore>()(
  persist(
    (set, get) => ({
      currentProfile: defaultPersonalizationProfile,
      deviceContext: getCurrentDeviceContext(),
      lastMoodDetection: null,
      currentRecommendations: [],
      interactionHistory: [],
      interactionPattern: null,
      learningModel: defaultLearningModel,

      updateDeviceContext: (context) =>
        set((state) => ({
          deviceContext: { ...state.deviceContext, ...context },
        })),

      addInteractionData: (data) =>
        set((state) => {
          const newHistory = [...state.interactionHistory.slice(-49), data]; // Keep last 50
          return {
            interactionHistory: newHistory,
            currentProfile: {
              ...state.currentProfile,
              timeOfDay: getCurrentTimeOfDay(),
            },
          };
        }),

      analyzeMood: () => {
        const { interactionHistory, deviceContext } = get();
        if (interactionHistory.length < 3) {
          return 'calm'; // Default mood for new users
        }

        // Simple mood detection based on interaction patterns
        const recentInteractions = interactionHistory.slice(-10);
        const avgVelocity = recentInteractions.reduce((sum, i) => sum + i.velocity, 0) / recentInteractions.length;
        const avgDuration = recentInteractions.reduce((sum, i) => sum + i.duration, 0) / recentInteractions.length;

        let detectedMood: UserMood = 'calm';

        if (avgVelocity > 800 || avgDuration < 2000) {
          detectedMood = 'energetic';
        } else if (avgVelocity < 300 && avgDuration > 5000) {
          detectedMood = 'romantic';
        } else if (deviceContext.timeOfDay === 'afternoon' && avgVelocity > 500) {
          detectedMood = 'playful';
        }

        // Store mood detection
        const moodDetection: MoodDetectionModel = {
          inputs: recentInteractions,
          prediction: detectedMood,
          confidence: Math.min(0.9, interactionHistory.length / 20), // Confidence increases with data
          timestamp: new Date(),
        };

        set((state) => ({
          lastMoodDetection: moodDetection,
          currentProfile: { ...state.currentProfile, userMood: detectedMood },
        }));

        return detectedMood;
      },

      generateRecommendations: () => {
        const { currentProfile, deviceContext, interactionHistory } = get();
        const recommendations: AIRecommendation[] = [];

        // Time-based background recommendation
        if (currentProfile.preferredBackground !== 'nightSky' && deviceContext.timeOfDay === 'night') {
          recommendations.push({
            type: 'background',
            currentValue: currentProfile.preferredBackground,
            recommendedValue: 'nightSky',
            reason: 'Night time detected - starry background would be more atmospheric',
            confidence: 0.85,
            timestamp: new Date(),
          });
        }

        // Mood-based animation speed
        if (currentProfile.userMood === 'calm' && currentProfile.animationSpeed === 'fast') {
          recommendations.push({
            type: 'animationSpeed',
            currentValue: currentProfile.animationSpeed,
            recommendedValue: 'slow',
            reason: 'Your mood seems calm - slower animations might feel more relaxing',
            confidence: 0.75,
            timestamp: new Date(),
          });
        }

        // Battery optimization
        if (deviceContext.batteryLevel < 20 && currentProfile.soundLevel > 0.5) {
          recommendations.push({
            type: 'soundLevel',
            currentValue: currentProfile.soundLevel,
            recommendedValue: 0.3,
            reason: 'Low battery detected - reducing sound level can help save power',
            confidence: 0.9,
            timestamp: new Date(),
          });
        }

        set(() => ({ currentRecommendations: recommendations }));
        return recommendations;
      },

      updatePersonalizationProfile: (profile) =>
        set((state) => ({
          currentProfile: { ...state.currentProfile, ...profile },
        })),

      analyzeInteractionPattern: () => {
        const { interactionHistory } = get();
        if (interactionHistory.length === 0) {
          return {
            averageUnlockDuration: 0,
            averageVelocity: 0,
            commonMechanism: 'lampCord',
            timeOfDayPreferences: { morning: 0, afternoon: 0, evening: 0, night: 0 },
            moodFrequency: { energetic: 0, calm: 0, romantic: 0, playful: 0 },
          };
        }

        const averageUnlockDuration = interactionHistory.reduce((sum, i) => sum + i.duration, 0) / interactionHistory.length;
        const averageVelocity = interactionHistory.reduce((sum, i) => sum + i.velocity, 0) / interactionHistory.length;

        const mechanismCounts = interactionHistory.reduce((acc, i) => {
          acc[i.mechanism] = (acc[i.mechanism] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const commonMechanism = Object.entries(mechanismCounts).reduce((a, b) => (a[1] > b[1] ? a : b))[0] as any;

        const timeOfDayPreferences = { morning: 0, afternoon: 0, evening: 0, night: 0 };
        const moodFrequency = { energetic: 0, calm: 0, romantic: 0, playful: 0 };

        interactionHistory.forEach((interaction) => {
          const hour = new Date(interaction.timestamp).getHours();
          if (hour >= 6 && hour < 12) timeOfDayPreferences.morning++;
          else if (hour >= 12 && hour < 18) timeOfDayPreferences.afternoon++;
          else if (hour >= 18 && hour < 22) timeOfDayPreferences.evening++;
          else timeOfDayPreferences.night++;

          if (interaction.mood) moodFrequency[interaction.mood]++;
        });

        const pattern = {
          averageUnlockDuration,
          averageVelocity,
          commonMechanism,
          timeOfDayPreferences,
          moodFrequency,
        };

        set(() => ({ interactionPattern: pattern }));
        return pattern;
      },

      detectMoodFromInteractions: (interactions) => {
        if (interactions.length === 0) return 'calm';

        const avgVelocity = interactions.reduce((sum, i) => sum + i.velocity, 0) / interactions.length;
        const avgDuration = interactions.reduce((sum, i) => sum + i.duration, 0) / interactions.length;

        if (avgVelocity > 800) return 'energetic';
        if (avgVelocity < 300 && avgDuration > 5000) return 'romantic';
        return 'calm';
      },

      predictOptimalBackground: (timeOfDay, mood) => {
        // Simple prediction based on time and mood
        if (timeOfDay === 'night') return 'nightSky';
        if (mood === 'romantic') return 'heartParticles';
        if (timeOfDay === 'morning') return 'glowingLamp';
        return 'nightSky'; // default
      },

      trainModel: async () => {
        const { interactionHistory } = get();
        if (interactionHistory.length < 10) return false;

        // Simulate model training
        const newModel: LearningModel = {
          version: '1.0.1',
          lastTrained: new Date(),
          accuracy: Math.min(0.95, 0.8 + interactionHistory.length / 100),
          sampleSize: interactionHistory.length,
        };

        set(() => ({ learningModel: newModel }));
        return true;
      },

      saveLearningProgress: async () => {
        // Data is automatically persisted via Zustand persist middleware
      },

      loadLearningProgress: async () => {
        // Data is automatically loaded via Zustand persist middleware
      },

      acceptRecommendation: (recommendationId) => {
        const { currentRecommendations } = get();
        const recommendation = currentRecommendations.find((r) => r.type === recommendationId);
        if (!recommendation) return;

        // Apply the recommendation
        set((state) => ({
          currentRecommendations: state.currentRecommendations.filter((r) => r.type !== recommendationId),
          currentProfile: {
            ...state.currentProfile,
            [recommendation.type]: recommendation.recommendedValue,
          },
        }));
      },

      rejectRecommendation: (recommendationId) => {
        set((state) => ({
          currentRecommendations: state.currentRecommendations.filter((r) => r.type !== recommendationId),
        }));
      },

      getAIInsights: () => {
        const { learningModel, currentRecommendations, interactionHistory } = get();

        return {
          moodAccuracy: learningModel.accuracy || 0,
          recommendationAcceptanceRate: 0.75, // This would be tracked over time
          learningProgress: Math.min(1, interactionHistory.length / 50), // 50 interactions for full learning
          batteryImpact: 0.5, // Estimated battery impact percentage per hour
        };
      },

      reset: () =>
        set(() => ({
          currentProfile: defaultPersonalizationProfile,
          deviceContext: getCurrentDeviceContext(),
          lastMoodDetection: null,
          currentRecommendations: [],
          interactionHistory: [],
          interactionPattern: null,
          learningModel: defaultLearningModel,
        })),
    }),
    {
      name: 'lovelock-ai-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        interactionHistory: state.interactionHistory,
        learningModel: state.learningModel,
        interactionPattern: state.interactionPattern,
      }),
    },
  ),
);