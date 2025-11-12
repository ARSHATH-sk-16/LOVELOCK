/**
 * LOVELOCK AI Personalization Hook
 *
 * Hook for using AI personalization features in components.
 */

import { useState, useEffect, useCallback } from 'react';
import { useLockStore, useSettingsStore, useAIStore } from '@/store';
import { aiPersonalizationService } from '@/services';
import type {
  PersonalizationProfile,
  AIRecommendation,
  DeviceContext,
  UserMood,
} from '@/types';

interface UseAIPersonalizationReturn {
  profile: PersonalizationProfile;
  recommendations: AIRecommendation[];
  isAnalyzing: boolean;
  deviceContext: DeviceContext;
  updateProfile: (updates: Partial<PersonalizationProfile>) => void;
  acceptRecommendation: (recommendationId: string) => void;
  rejectRecommendation: (recommendationId: string) => void;
  refreshPersonalization: () => Promise<void>;
  getInsights: () => {
    moodAccuracy: number;
    recommendationAcceptanceRate: number;
    learningProgress: number;
    batteryImpact: number;
  };
}

export const useAIPersonalization = (): UseAIPersonalizationReturn => {
  const { aiSettings, personalizationProfile, updatePersonalizationProfile } = useSettingsStore();
  const {
    currentProfile,
    deviceContext,
    currentRecommendations,
    lastMoodDetection,
    updateDeviceContext,
    analyzeMood,
    generateRecommendations,
    acceptRecommendation: acceptAIRecommendation,
    rejectRecommendation: rejectAIRecommendation,
  } = useAIStore();
  const { addInteractionData } = useAIStore();

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Refresh device context and personalization
  const refreshPersonalization = useCallback(async () => {
    if (!aiSettings.enabled) return;

    setIsAnalyzing(true);

    try {
      // Update device context
      const newContext = await aiPersonalizationService.updateDeviceContext();
      updateDeviceContext(newContext);

      // Analyze mood if we have enough interaction data
      const recentMood = analyzeMood();

      // Generate new personalization profile
      const newProfile = await aiPersonalizationService.generatePersonalizationProfile(
        newContext,
        recentMood,
        aiSettings,
      );

      updatePersonalizationProfile(newProfile);

      // Generate recommendations
      generateRecommendations();

    } catch (error) {
      console.error('Failed to refresh personalization:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [aiSettings, updateDeviceContext, analyzeMood, updatePersonalizationProfile, generateRecommendations]);

  // Update profile locally
  const updateProfile = useCallback((updates: Partial<PersonalizationProfile>) => {
    updatePersonalizationProfile(updates);
  }, [updatePersonalizationProfile]);

  // Accept recommendation
  const acceptRecommendation = useCallback((recommendationId: string) => {
    acceptAIRecommendation(recommendationId);
  }, [acceptAIRecommendation]);

  // Reject recommendation
  const rejectRecommendation = useCallback((recommendationId: string) => {
    rejectAIRecommendation(recommendationId);
  }, [rejectAIRecommendation]);

  // Get insights
  const getInsights = useCallback(() => {
    return aiPersonalizationService.getLearningInsights();
  }, []);

  // Initialize and set up periodic updates
  useEffect(() => {
    if (aiSettings.enabled && aiPersonalizationService.isReady()) {
      refreshPersonalization();

      // Set up periodic updates based on adaptation frequency
      const intervalMs = aiSettings.adaptationFrequency === 'slow' ? 60000 :  // 1 minute
                        aiSettings.adaptationFrequency === 'normal' ? 30000 : // 30 seconds
                        15000; // 15 seconds for fast

      const interval = setInterval(refreshPersonalization, intervalMs);

      return () => clearInterval(interval);
    }
  }, [aiSettings.enabled, aiSettings.adaptationFrequency, refreshPersonalization]);

  // Update when AI settings change
  useEffect(() => {
    if (aiSettings.enabled && aiSettings.intensity === 'subtle') {
      // In subtle mode, only apply time-based personalization
      const timeBasedProfile = aiPersonalizationService.generatePersonalizationProfile(
        deviceContext,
        null,
        { ...aiSettings, intensity: 'subtle' }
      );
      updatePersonalizationProfile(timeBasedProfile);
    }
  }, [aiSettings.intensity, deviceContext, updatePersonalizationProfile]);

  return {
    profile: currentProfile,
    recommendations: currentRecommendations,
    isAnalyzing,
    deviceContext,
    updateProfile,
    acceptRecommendation,
    rejectRecommendation,
    refreshPersonalization,
    getInsights,
  };
};