/**
 * LOVELOCK AI Personalization Service
 *
 * On-device AI that analyzes user interaction patterns and provides personalized experience.
 */

import DeviceInfo from 'react-native-device-info';
import type {
  PersonalizationProfile,
  UserInteractionData,
  MoodDetectionModel,
  AIRecommendation,
  DeviceContext,
  TimeOfDay,
  UserMood,
  BackgroundTheme,
  ColorScheme,
  AnimationSpeed,
  AIPersonalizationSettings,
} from '@/types';

class AIPersonalizationService {
  private isInitialized = false;
  private learningData: UserInteractionData[] = [];
  private moodWeights = {
    energetic: { velocity: 0.6, duration: -0.3, pressure: 0.1 },
    calm: { velocity: -0.5, duration: 0.4, pressure: -0.2 },
    romantic: { velocity: -0.3, duration: 0.6, pressure: 0.2 },
    playful: { velocity: 0.4, duration: -0.2, pressure: 0.3 },
  };

  private timeBasedProfiles = {
    morning: {
      mood: 'energetic' as UserMood,
      background: 'glowingLamp' as BackgroundTheme,
      colorScheme: 'warm' as ColorScheme,
      animationSpeed: 'normal' as AnimationSpeed,
      soundLevel: 0.7,
    },
    afternoon: {
      mood: 'energetic' as UserMood,
      background: 'heartParticles' as BackgroundTheme,
      colorScheme: 'warm' as ColorScheme,
      animationSpeed: 'normal' as AnimationSpeed,
      soundLevel: 0.8,
    },
    evening: {
      mood: 'romantic' as UserMood,
      background: 'nightSky' as BackgroundTheme,
      colorScheme: 'warm' as ColorScheme,
      animationSpeed: 'slow' as AnimationSpeed,
      soundLevel: 0.5,
    },
    night: {
      mood: 'calm' as UserMood,
      background: 'nightSky' as BackgroundTheme,
      colorScheme: 'cool' as ColorScheme,
      animationSpeed: 'slow' as AnimationSpeed,
      soundLevel: 0.3,
    },
  };

  async initialize(): Promise<void> {
    try {
      // Initialize device context
      await this.updateDeviceContext();
      this.isInitialized = true;
      console.log('AI Personalization service initialized');
    } catch (error) {
      console.error('Failed to initialize AI service:', error);
      throw error;
    }
  }

  /**
   * Get current device context
   */
  async updateDeviceContext(): Promise<DeviceContext> {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();

    const timeOfDay = this.getTimeOfDay(hour);

    try {
      const batteryLevel = await DeviceInfo.getBatteryLevel();
      const isCharging = await DeviceInfo.isCharging();

      const context: DeviceContext = {
        batteryLevel: Math.round((batteryLevel || 0) * 100),
        isCharging: isCharging || false,
        deviceOrientation: 'portrait', // Would be detected from device orientation
        timeOfDay,
        dayOfWeek,
        isConnected: true, // Would be detected from network info
      };

      return context;
    } catch (error) {
      console.warn('Failed to get full device context:', error);
      return {
        batteryLevel: 100,
        isCharging: false,
        deviceOrientation: 'portrait',
        timeOfDay,
        dayOfWeek,
        isConnected: true,
      };
    }
  }

  /**
   * Convert hour to time of day
   */
  private getTimeOfDay(hour: number): TimeOfDay {
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  }

  /**
   * Analyze user interaction to detect mood
   */
  analyzeMood(
    interactions: UserInteractionData[],
    aiSettings: AIPersonalizationSettings,
  ): MoodDetectionModel {
    if (interactions.length < 3) {
      return {
        inputs: interactions,
        prediction: 'calm',
        confidence: 0.3,
        timestamp: new Date(),
      };
    }

    // Normalize interaction data
    const avgVelocity = this.calculateAverage(interactions, 'velocity');
    const avgDuration = this.calculateAverage(interactions, 'duration');
    const avgPressure = this.calculateAverage(interactions, 'pressure');

    // Calculate mood scores based on weights
    const moodScores: Record<UserMood, number> = {
      energetic: 0,
      calm: 0,
      romantic: 0,
      playful: 0,
    };

    Object.entries(this.moodWeights).forEach(([mood, weights]) => {
      moodScores[mood as UserMood] =
        weights.velocity * avgVelocity +
        weights.duration * avgDuration +
        weights.pressure * avgPressure;
    });

    // Find mood with highest score
    const detectedMood = (Object.entries(moodScores).reduce((a, b) =>
      a[1] > b[1] ? a : b
    )[0] as UserMood);

    // Calculate confidence based on data quality and quantity
    const confidence = Math.min(0.95, interactions.length / 20) *
      (1 - Math.abs(this.calculateStandardDeviation(interactions, 'velocity')) / avgVelocity);

    return {
      inputs: interactions,
      prediction: detectedMood,
      confidence: Math.max(0.3, confidence),
      timestamp: new Date(),
    };
  }

  /**
   * Generate personalized profile based on context and AI settings
   */
  async generatePersonalizationProfile(
    deviceContext: DeviceContext,
    recentMood: UserMood | null,
    aiSettings: AIPersonalizationSettings,
  ): Promise<PersonalizationProfile> {
    const timeBased = this.timeBasedProfiles[deviceContext.timeOfDay];

    // Base profile on time of day
    let profile: PersonalizationProfile = {
      timeOfDay: deviceContext.timeOfDay,
      userMood: timeBased.mood,
      preferredBackground: timeBased.background,
      animationSpeed: timeBased.animationSpeed,
      colorScheme: timeBased.colorScheme,
      soundLevel: timeBased.soundLevel,
      hapticIntensity: 0.8,
    };

    // Apply AI personalization based on intensity
    if (aiSettings.enabled && aiSettings.intensity !== 'subtle') {
      // Adjust for battery level
      if (deviceContext.batteryLevel < 20 && aiSettings.features.batteryOptimization) {
        profile.soundLevel *= 0.5;
        profile.hapticIntensity *= 0.7;
        profile.animationSpeed = 'slow';
      }

      // Adjust for detected mood if feature is enabled
      if (aiSettings.features.moodDetection && recentMood) {
        profile.userMood = recentMood;
        profile = this.adjustProfileForMood(profile, recentMood);
      }

      // Apply interaction pattern analysis if feature is enabled
      if (aiSettings.features.interactionPatterns && this.learningData.length > 5) {
        profile = this.adjustProfileForPatterns(profile);
      }

      // Apply intensity-specific adjustments
      profile = this.applyIntensityAdjustments(profile, aiSettings.intensity);
    }

    return profile;
  }

  /**
   * Adjust profile based on detected mood
   */
  private adjustProfileForMood(
    profile: PersonalizationProfile,
    mood: UserMood,
  ): PersonalizationProfile {
    const moodAdjustments = {
      energetic: {
        animationSpeed: 'fast' as AnimationSpeed,
        soundLevel: Math.min(1, profile.soundLevel * 1.2),
        hapticIntensity: Math.min(1, profile.hapticIntensity * 1.1),
      },
      calm: {
        animationSpeed: 'slow' as AnimationSpeed,
        soundLevel: profile.soundLevel * 0.7,
        hapticIntensity: profile.hapticIntensity * 0.8,
      },
      romantic: {
        preferredBackground: 'heartParticles' as BackgroundTheme,
        animationSpeed: 'slow' as AnimationSpeed,
        colorScheme: 'warm' as ColorScheme,
        soundLevel: profile.soundLevel * 0.9,
      },
      playful: {
        preferredBackground: 'heartParticles' as BackgroundTheme,
        animationSpeed: 'normal' as AnimationSpeed,
        colorScheme: 'warm' as ColorScheme,
        soundLevel: Math.min(1, profile.soundLevel * 1.1),
      },
    };

    const adjustments = moodAdjustments[mood] || moodAdjustments.calm;
    return { ...profile, ...adjustments };
  }

  /**
   * Adjust profile based on interaction patterns
   */
  private adjustProfileForPatterns(profile: PersonalizationProfile): PersonalizationProfile {
    if (this.learningData.length < 5) return profile;

    const avgVelocity = this.calculateAverage(this.learningData, 'velocity');
    const avgDuration = this.calculateAverage(this.learningData, 'duration');

    // Adjust based on interaction patterns
    if (avgVelocity > 800) {
      // User prefers fast interactions
      profile.animationSpeed = 'fast';
      profile.hapticIntensity = Math.min(1, profile.hapticIntensity * 1.2);
    } else if (avgVelocity < 300) {
      // User prefers gentle interactions
      profile.animationSpeed = 'slow';
      profile.hapticIntensity *= 0.7;
    }

    return profile;
  }

  /**
   * Apply AI intensity-specific adjustments
   */
  private applyIntensityAdjustments(
    profile: PersonalizationProfile,
    intensity: AIPersonalizationSettings['intensity'],
  ): PersonalizationProfile {
    switch (intensity) {
      case 'subtle':
        // Minimal changes - only time-based
        return profile;

      case 'moderate':
        // Standard adjustments
        return profile;

      case 'aggressive':
        // More dramatic changes
        return {
          ...profile,
          soundLevel: Math.min(1, profile.soundLevel * 1.3),
          hapticIntensity: Math.min(1, profile.hapticIntensity * 1.2),
        };

      case 'custom':
        // User-defined adjustments would be applied here
        return profile;

      default:
        return profile;
    }
  }

  /**
   * Generate AI recommendations
   */
  generateRecommendations(
    currentProfile: PersonalizationProfile,
    deviceContext: DeviceContext,
    moodDetection: MoodDetectionModel | null,
  ): AIRecommendation[] {
    const recommendations: AIRecommendation[] = [];

    // Time-based recommendations
    if (currentProfile.preferredBackground !== this.timeBasedProfiles[deviceContext.timeOfDay].background) {
      recommendations.push({
        type: 'background',
        currentValue: currentProfile.preferredBackground,
        recommendedValue: this.timeBasedProfiles[deviceContext.timeOfDay].background,
        reason: `Based on current time (${deviceContext.timeOfDay}), this background might be more suitable`,
        confidence: 0.8,
        timestamp: new Date(),
      });
    }

    // Mood-based recommendations
    if (moodDetection && moodDetection.confidence > 0.7) {
      const moodProfile = this.adjustProfileForMood(currentProfile, moodDetection.prediction);

      if (moodProfile.animationSpeed !== currentProfile.animationSpeed) {
        recommendations.push({
          type: 'animationSpeed',
          currentValue: currentProfile.animationSpeed,
          recommendedValue: moodProfile.animationSpeed,
          reason: `Your mood seems to be ${moodDetection.prediction} - this animation speed might feel better`,
          confidence: moodDetection.confidence,
          timestamp: new Date(),
        });
      }
    }

    // Battery optimization recommendations
    if (deviceContext.batteryLevel < 20) {
      if (currentProfile.soundLevel > 0.4) {
        recommendations.push({
          type: 'soundLevel',
          currentValue: currentProfile.soundLevel,
          recommendedValue: 0.3,
          reason: 'Low battery detected - reducing sound level can help save power',
          confidence: 0.9,
          timestamp: new Date(),
        });
      }
    }

    return recommendations;
  }

  /**
   * Add interaction data for learning
   */
  addLearningData(data: UserInteractionData): void {
    this.learningData.push(data);

    // Keep only recent data (last 100 interactions)
    if (this.learningData.length > 100) {
      this.learningData = this.learningData.slice(-100);
    }
  }

  /**
   * Calculate average of a property in interaction data
   */
  private calculateAverage(data: UserInteractionData[], property: keyof UserInteractionData): number {
    if (data.length === 0) return 0;

    const sum = data.reduce((acc, item) => {
      const value = item[property];
      return acc + (typeof value === 'number' ? value : 0);
    }, 0);

    return sum / data.length;
  }

  /**
   * Calculate standard deviation
   */
  private calculateStandardDeviation(data: UserInteractionData[], property: keyof UserInteractionData): number {
    if (data.length === 0) return 0;

    const avg = this.calculateAverage(data, property);
    const squaredDiffs = data.reduce((acc, item) => {
      const value = item[property] as number;
      return acc + Math.pow(value - avg, 2);
    }, 0);

    return Math.sqrt(squaredDiffs / data.length);
  }

  /**
   * Get learning insights
   */
  getLearningInsights(): {
    interactionCount: number;
    averageUnlockDuration: number;
    averageVelocity: number;
    mostFrequentMood: UserMood;
    learningAccuracy: number;
  } {
    if (this.learningData.length === 0) {
      return {
        interactionCount: 0,
        averageUnlockDuration: 0,
        averageVelocity: 0,
        mostFrequentMood: 'calm',
        learningAccuracy: 0,
      };
    }

    return {
      interactionCount: this.learningData.length,
      averageUnlockDuration: this.calculateAverage(this.learningData, 'duration'),
      averageVelocity: this.calculateAverage(this.learningData, 'velocity'),
      mostFrequentMood: 'calm', // Would be calculated from mood history
      learningAccuracy: Math.min(0.95, this.learningData.length / 50),
    };
  }

  /**
   * Check if service is ready
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Reset learning data
   */
  resetLearning(): void {
    this.learningData = [];
  }

  /**
   * Export learning data
   */
  exportLearningData(): string {
    return JSON.stringify({
      learningData: this.learningData,
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    });
  }

  /**
   * Import learning data
   */
  importLearningData(jsonData: string): boolean {
    try {
      const imported = JSON.parse(jsonData);
      if (imported.learningData && Array.isArray(imported.learningData)) {
        this.learningData = imported.learningData;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to import learning data:', error);
      return false;
    }
  }
}

// Create singleton instance
export const aiPersonalizationService = new AIPersonalizationService();

// Export for use in components
export default aiPersonalizationService;