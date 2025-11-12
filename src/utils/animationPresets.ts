/**
 * LOVELOCK Animation Presets
 *
 * Predefined animation configurations for consistent animations throughout the app.
 */

import type {
  AnimationTimeline,
  Keyframe,
  TransitionConfig,
  UnlockAnimationConfig,
} from '@/types';

// Common animation keyframes
export const FADE_IN_KEYFRAMES: Keyframe[] = [
  { time: 0, properties: { opacity: 0 } },
  { time: 1, properties: { opacity: 1 } },
];

export const FADE_OUT_KEYFRAMES: Keyframe[] = [
  { time: 0, properties: { opacity: 1 } },
  { time: 1, properties: { opacity: 0 } },
];

export const SCALE_IN_KEYFRAMES: Keyframe[] = [
  { time: 0, properties: { scale: 0.8, opacity: 0 } },
  { time: 0.5, properties: { scale: 1.05, opacity: 0.8 } },
  { time: 1, properties: { scale: 1, opacity: 1 } },
];

export const SCALE_OUT_KEYFRAMES: Keyframe[] = [
  { time: 0, properties: { scale: 1, opacity: 1 } },
  { time: 0.5, properties: { scale: 1.1, opacity: 0.5 } },
  { time: 1, properties: { scale: 0.9, opacity: 0 } },
];

export const SLIDE_UP_KEYFRAMES: Keyframe[] = [
  { time: 0, properties: { y: 100, opacity: 0 } },
  { time: 1, properties: { y: 0, opacity: 1 } },
];

export const SLIDE_DOWN_KEYFRAMES: Keyframe[] = [
  { time: 0, properties: { y: -100, opacity: 0 } },
  { time: 1, properties: { y: 0, opacity: 1 } },
];

export const ROTATE_KEYFRAMES: Keyframe[] = [
  { time: 0, properties: { rotation: 0 } },
  { time: 1, properties: { rotation: 360 } },
];

export const PULSE_KEYFRAMES: Keyframe[] = [
  { time: 0, properties: { scale: 1, opacity: 1 } },
  { time: 0.5, properties: { scale: 1.2, opacity: 0.8 } },
  { time: 1, properties: { scale: 1, opacity: 1 } },
];

export const GLOW_KEYFRAMES: Keyframe[] = [
  { time: 0, properties: { opacity: 0.6, scale: 0.95 } },
  { time: 0.5, properties: { opacity: 1, scale: 1.05 } },
  { time: 1, properties: { opacity: 0.6, scale: 0.95 } },
];

// Common animation timelines
export const createFadeInTimeline = (duration: number = 300): AnimationTimeline => ({
  id: `fade_in_${Date.now()}`,
  duration,
  keyframes: FADE_IN_KEYFRAMES,
  easing: 'ease-in-out',
  loop: false,
});

export const createFadeOutTimeline = (duration: number = 300): AnimationTimeline => ({
  id: `fade_out_${Date.now()}`,
  duration,
  keyframes: FADE_OUT_KEYFRAMES,
  easing: 'ease-in-out',
  loop: false,
});

export const createScaleInTimeline = (duration: number = 400): AnimationTimeline => ({
  id: `scale_in_${Date.now()}`,
  duration,
  keyframes: SCALE_IN_KEYFRAMES,
  easing: 'ease-out-back',
  loop: false,
});

export const createScaleOutTimeline = (duration: number = 300): AnimationTimeline => ({
  id: `scale_out_${Date.now()}`,
  duration,
  keyframes: SCALE_OUT_KEYFRAMES,
  easing: 'ease-in-back',
  loop: false,
});

export const createSlideUpTimeline = (duration: number = 350): AnimationTimeline => ({
  id: `slide_up_${Date.now()}`,
  duration,
  keyframes: SLIDE_UP_KEYFRAMES,
  easing: 'ease-out-cubic',
  loop: false,
});

export const createSlideDownTimeline = (duration: number = 350): AnimationTimeline => ({
  id: `slide_down_${Date.now()}`,
  duration,
  keyframes: SLIDE_DOWN_KEYFRAMES,
  easing: 'ease-out-cubic',
  loop: false,
});

export const createPulseTimeline = (duration: number = 2000): AnimationTimeline => ({
  id: `pulse_${Date.now()}`,
  duration,
  keyframes: PULSE_KEYFRAMES,
  easing: 'ease-in-out-sine',
  loop: true,
});

export const createGlowTimeline = (duration: number = 2500): AnimationTimeline => ({
  id: `glow_${Date.now()}`,
  duration,
  keyframes: GLOW_KEYFRAMES,
  easing: 'ease-in-out-sine',
  loop: true,
});

export const createRotateTimeline = (duration: number = 1000): AnimationTimeline => ({
  id: `rotate_${Date.now()}`,
  duration,
  keyframes: ROTATE_KEYFRAMES,
  easing: 'linear',
  loop: true,
});

// Lock screen specific animations
export const LAMP_PULL_GLOW_KEYFRAMES: Keyframe[] = [
  { time: 0, properties: { opacity: 0.3, scale: 0.9 } },
  { time: 0.5, properties: { opacity: 0.8, scale: 1.1 } },
  { time: 1, properties: { opacity: 1, scale: 1.2 } },
];

export const HEART_KEY_ROTATION_KEYFRAMES: Keyframe[] = [
  { time: 0, properties: { rotation: 0, scale: 1 } },
  { time: 0.33, properties: { rotation: 120, scale: 1.05 } },
  { time: 0.66, properties: { rotation: 240, scale: 1.1 } },
  { time: 1, properties: { rotation: 360, scale: 1.15 } },
];

export const HEARTS_MERGE_KEYFRAMES: Keyframe[] = [
  { time: 0, properties: { scale: 1, opacity: 1, x: 0 } },
  { time: 0.3, properties: { scale: 1.2, opacity: 1, x: 50 } },
  { time: 0.6, properties: { scale: 1.1, opacity: 0.8, x: 100 } },
  { time: 1, properties: { scale: 1.5, opacity: 0, x: 150 } },
];

// Unlock transition configurations
export const UNLOCK_TRANSITIONS: TransitionConfig[] = [
  {
    type: 'glow',
    duration: 300,
    delay: 0,
    properties: { intensity: 1 },
  },
  {
    type: 'fade',
    duration: 500,
    delay: 400,
    properties: { opacity: 0 },
  },
  {
    type: 'blur',
    duration: 400,
    delay: 600,
    properties: { radius: 10 },
  },
];

// Particle animation presets
export const PARTICLE_EXPLOSION_CONFIG = {
  count: 30,
  spawnRadius: 80,
  speedRange: { min: 200, max: 600 },
  sizeRange: { min: 4, max: 16 },
  colors: ['#FF69B4', '#FF1493', '#FFD700', '#FFA500', '#FF6347'],
  lifetimeRange: { min: 1000, max: 3000 },
};

export const PARTICLE_GENTLE_FLOAT_CONFIG = {
  count: 20,
  spawnRadius: 50,
  speedRange: { min: 50, max: 150 },
  sizeRange: { min: 6, max: 14 },
  colors: ['#FFB6C1', '#FFC0CB', '#FF69B4'],
  lifetimeRange: { min: 2000, max: 4000 },
};

export const PARTICLE_ROMANTIC_BURST_CONFIG = {
  count: 40,
  spawnRadius: 100,
  speedRange: { min: 300, max: 800 },
  sizeRange: { min: 8, max: 24 },
  colors: ['#FF69B4', '#FF1493', '#DC143C', '#FFB6C1', '#FFC0CB'],
  lifetimeRange: { min: 1500, max: 3500 },
};

// Easing functions
export const EASING_PRESETS = {
  'ease-in': 'cubic-bezier(0.42, 0, 1.0, 1.0)',
  'ease-out': 'cubic-bezier(0.0, 0, 0.58, 1.0)',
  'ease-in-out': 'cubic-bezier(0.42, 0, 0.58, 1.0)',
  'ease-in-sine': 'cubic-bezier(0.12, 0, 0.39, 0)',
  'ease-out-sine': 'cubic-bezier(0.61, 1, 0.88, 1)',
  'ease-in-out-sine': 'cubic-bezier(0.37, 0, 0.63, 1)',
  'ease-in-quad': 'cubic-bezier(0.11, 0, 0.5, 0)',
  'ease-out-quad': 'cubic-bezier(0.5, 1, 0.89, 1)',
  'ease-in-out-quad': 'cubic-bezier(0.45, 0, 0.55, 1)',
  'ease-in-cubic': 'cubic-bezier(0.32, 0, 0.67, 0)',
  'ease-out-cubic': 'cubic-bezier(0.33, 1, 0.68, 1)',
  'ease-in-out-cubic': 'cubic-bezier(0.65, 0, 0.35, 1)',
  'ease-in-back': 'cubic-bezier(0.36, 0, 0.66, -0.56)',
  'ease-out-back': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  'ease-in-out-back': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  'linear': 'cubic-bezier(0, 0, 1, 1)',
};

// Animation speed multipliers
export const ANIMATION_SPEEDS = {
  slow: 1.5,
  normal: 1.0,
  fast: 0.7,
};

// Create preset unlock animations
export const createLampPullUnlockAnimation = (): UnlockAnimationConfig => ({
  type: 'lampPull',
  duration: 1800,
  particles: [PARTICLE_EXPLOSION_CONFIG],
  transitions: UNLOCK_TRANSITIONS,
  soundEffect: 'lamp_glow',
  hapticPattern: [0, 100, 50],
});

export const createHeartKeyUnlockAnimation = (): UnlockAnimationConfig => ({
  type: 'keyTurn',
  duration: 2000,
  particles: [PARTICLE_ROMANTIC_BURST_CONFIG],
  transitions: [
    ...UNLOCK_TRANSITIONS,
    {
      type: 'rotate',
      duration: 600,
      delay: 200,
      properties: { rotation: 720 },
    },
  ],
  soundEffect: 'heart_key_turn',
  hapticPattern: [50, 50, 50, 50],
});

export const createHeartsMergeUnlockAnimation = (): UnlockAnimationConfig => ({
  type: 'heartsMerge',
  duration: 2200,
  particles: [
    PARTICLE_ROMANTIC_BURST_CONFIG,
    { ...PARTICLE_GENTLE_FLOAT_CONFIG, count: 15 },
  ],
  transitions: [
    ...UNLOCK_TRANSITIONS,
    {
      type: 'merge',
      duration: 800,
      delay: 100,
      properties: { mergePoint: { x: 0.5, y: 0.5 } },
    },
  ],
  soundEffect: 'hearts_touch',
  hapticPattern: [30, 30, 30, 30, 30],
});

// Background animation presets
export const NIGHT_SKY_ANIMATION_CONFIG = {
  starCount: 120,
  shootingStarFrequency: 4000, // milliseconds
  twinkleSpeed: 0.002,
  parallaxStrength: 0.3,
};

export const GLOWING_LAMP_ANIMATION_CONFIG = {
  rayCount: 16,
  rayRotationSpeed: 0.001,
  pulseFrequency: 2000,
  particleCount: 15,
  particleLifetime: 3000,
};

export const HEART_PARTICLES_ANIMATION_CONFIG = {
  heartCount: 25,
  spawnInterval: 800,
  floatSpeedRange: { min: 30, max: 80 },
  rotationSpeed: 0.003,
  sizeRange: { min: 10, max: 25 },
  opacityRange: { min: 0.3, max: 0.8 },
};

// UI animation presets
export const UI_ANIMATION_PRESETS = {
  buttonPress: {
    duration: 150,
    keyframes: [
      { time: 0, properties: { scale: 1 } },
      { time: 0.5, properties: { scale: 0.95 } },
      { time: 1, properties: { scale: 1 } },
    ],
    easing: 'ease-in-out-back',
  },
  buttonHover: {
    duration: 200,
    keyframes: [
      { time: 0, properties: { scale: 1, opacity: 1 } },
      { time: 1, properties: { scale: 1.05, opacity: 0.9 } },
    ],
    easing: 'ease-out',
  },
  modalAppear: {
    duration: 400,
    keyframes: [
      { time: 0, properties: { scale: 0.8, opacity: 0, y: 50 } },
      { time: 1, properties: { scale: 1, opacity: 1, y: 0 } },
    ],
    easing: 'ease-out-back',
  },
  modalDisappear: {
    duration: 300,
    keyframes: [
      { time: 0, properties: { scale: 1, opacity: 1, y: 0 } },
      { time: 1, properties: { scale: 0.9, opacity: 0, y: -30 } },
    ],
    easing: 'ease-in-back',
  },
  notificationSlideIn: {
    duration: 350,
    keyframes: [
      { time: 0, properties: { y: -100, opacity: 0 } },
      { time: 1, properties: { y: 0, opacity: 1 } },
    ],
    easing: 'ease-out-cubic',
  },
  notificationSlideOut: {
    duration: 300,
    keyframes: [
      { time: 0, properties: { y: 0, opacity: 1 } },
      { time: 1, properties: { y: -100, opacity: 0 } },
    ],
    easing: 'ease-in-cubic',
  },
};