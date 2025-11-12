/**
 * LOVELOCK AI Personalization Types
 *
 * Type definitions for AI-powered personalization and mood detection.
 */

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export type UserMood = 'energetic' | 'calm' | 'romantic' | 'playful';

export type ColorScheme = 'warm' | 'cool' | 'neutral';

export type AnimationSpeed = 'slow' | 'normal' | 'fast';

export type AIIntensity = 'subtle' | 'moderate' | 'aggressive' | 'custom';

export interface PersonalizationProfile {
  timeOfDay: TimeOfDay;
  userMood: UserMood;
  preferredBackground: BackgroundTheme;
  animationSpeed: AnimationSpeed;
  colorScheme: ColorScheme;
  soundLevel: number;
  hapticIntensity: number;
}

export interface UserInteractionData {
  timestamp: Date;
  mechanism: UnlockMechanism;
  duration: number;
  velocity: number;
  pressure: number;
  gestureType: string;
  success: boolean;
}

export interface MoodDetectionModel {
  inputs: UserInteractionData[];
  prediction: UserMood;
  confidence: number;
  timestamp: Date;
}

export interface AIPersonalizationSettings {
  enabled: boolean;
  intensity: AIIntensity;
  features: {
    timeBased: boolean;
    moodDetection: boolean;
    interactionPatterns: boolean;
    predictiveSelection: boolean;
    batteryOptimization: boolean;
  };
  adaptationFrequency: 'slow' | 'normal' | 'fast';
  userOverrides: boolean;
  learningRate: number;
}

export interface TimeBasedProfile {
  hour: number;
  background: BackgroundTheme;
  colorScheme: ColorScheme;
  animationSpeed: AnimationSpeed;
  soundLevel: number;
  moodBias: UserMood;
}

export interface InteractionPattern {
  averageUnlockDuration: number;
  averageVelocity: number;
  commonMechanism: UnlockMechanism;
  timeOfDayPreferences: Record<TimeOfDay, number>;
  moodFrequency: Record<UserMood, number>;
}

export interface AIRecommendation {
  type: 'background' | 'animationSpeed' | 'colorScheme' | 'soundLevel' | 'hapticIntensity';
  currentValue: any;
  recommendedValue: any;
  reason: string;
  confidence: number;
  timestamp: Date;
}

export interface LearningModel {
  version: string;
  lastTrained: Date;
  accuracy: number;
  sampleSize: number;
  modelData?: any; // TensorFlow Lite model data
}

export interface PersonalizationInsight {
  pattern: string;
  recommendation: string;
  impact: 'low' | 'medium' | 'high';
  category: 'behavioral' | 'temporal' | 'environmental';
}

export interface DeviceContext {
  batteryLevel: number;
  isCharging: boolean;
  deviceOrientation: 'portrait' | 'landscape';
  ambientLight?: number; // if available
  timeOfDay: TimeOfDay;
  dayOfWeek: number; // 0-6, Sunday = 0
  isConnected: boolean;
}

// Import BackgroundTheme and UnlockMechanism from lockTypes
import type { BackgroundTheme, UnlockMechanism } from './lockTypes';