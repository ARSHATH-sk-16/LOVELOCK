/**
 * LOVELOCK AI Personalization Service Tests
 *
 * Unit tests for AI personalization functionality.
 */

import aiPersonalizationService from '@/services/aiPersonalizationService';
import type { UserInteractionData } from '@/types';

describe('AI Personalization Service', () => {
  beforeEach(() => {
    // Reset service state before each test
    aiPersonalizationService.resetLearning();
  });

  it('initializes successfully', async () => {
    await expect(aiPersonalizationService.initialize()).resolves.not.toThrow();
    expect(aiPersonalizationService.isReady()).toBe(true);
  });

  it('analyzes mood correctly from interactions', () => {
    // Create test interactions
    const interactions: UserInteractionData[] = [
      {
        timestamp: new Date(),
        mechanism: 'lampCord',
        duration: 3000,
        velocity: 400,
        pressure: 0.7,
        gestureType: 'pull',
        success: true,
      },
      {
        timestamp: new Date(),
        mechanism: 'lampCord',
        duration: 2500,
        velocity: 350,
        pressure: 0.6,
        gestureType: 'pull',
        success: true,
      },
    ];

    const moodDetection = aiPersonalizationService.analyzeMood(interactions, {
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
    });

    expect(moodDetection.prediction).toBeDefined();
    expect(moodDetection.confidence).toBeGreaterThan(0);
  });

  it('generates appropriate recommendations', async () => {
    const deviceContext = {
      batteryLevel: 50,
      isCharging: false,
      deviceOrientation: 'portrait',
      timeOfDay: 'evening',
      dayOfWeek: 2,
      isConnected: true,
    };

    const recommendations = aiPersonalizationService.generateRecommendations(
      {
        timeOfDay: 'morning',
        userMood: 'calm',
        preferredBackground: 'nightSky',
        animationSpeed: 'slow',
        colorScheme: 'warm',
        soundLevel: 0.7,
        hapticIntensity: 0.8,
      },
      deviceContext,
      null
    );

    expect(Array.isArray(recommendations)).toBe(true);
  });

  it('adds learning data correctly', () => {
    const interactionData: UserInteractionData = {
      timestamp: new Date(),
      mechanism: 'heartKey',
      duration: 4000,
      velocity: 200,
      pressure: 0.5,
      gestureType: 'rotate',
      success: true,
    };

    aiPersonalizationService.addLearningData(interactionData);

    const insights = aiPersonalizationService.getLearningInsights();
    expect(insights.interactionCount).toBe(1);
  });
});