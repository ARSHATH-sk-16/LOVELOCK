/**
 * LOVELOCK Type Definitions
 *
 * Central export for all type definitions used throughout the LOVELOCK app.
 */

export * from './lockTypes';
export * from './animationTypes';
export * from './aiTypes';

// Common utility types
export interface Coordinate {
  x: number;
  y: number;
}

export interface Dimension {
  width: number;
  height: number;
}

export interface Range {
  min: number;
  max: number;
}

export interface ColorStop {
  position: number; // 0-1
  color: string;
}

export interface GradientColors {
  type: 'linear' | 'radial';
  colors: ColorStop[];
  angle?: number; // for linear gradients
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface StorageKey {
  SETTINGS: 'lovelock_settings';
  AI_PROFILE: 'lovelock_ai_profile';
  USER_DATA: 'lovelock_user_data';
  LEARNING_MODEL: 'lovelock_learning_model';
}

export type StorageValue = string | number | boolean | object;

export interface LoveQuote {
  id: string;
  text: string;
  author?: string;
  category: 'morning' | 'afternoon' | 'evening' | 'night';
  language: string;
  userSubmitted?: boolean;
  timestamp?: Date;
}

export interface SoundEffect {
  name: string;
  file: string;
  volume: number;
  loop: boolean;
  category: 'interaction' | 'success' | 'ambient' | 'notification';
}

export interface HapticPattern {
  pattern: number[];
  intensity: 'light' | 'medium' | 'heavy';
  sharpness: 'soft' | 'medium' | 'sharp';
}

export interface HomeWidget {
  id: string;
  type: 'clock' | 'calendar' | 'quote' | 'mood' | 'photo' | 'tasks';
  position: { x: number; y: number };
  size: { width: number; height: number };
  visible: boolean;
  config: Record<string, any>;
}

export interface Anniversary {
  id: string;
  title: string;
  date: Date;
  type: 'wedding' | 'dating' | 'first_kiss' | 'custom';
  recurring: boolean;
  countdown: boolean;
  notification: boolean;
}