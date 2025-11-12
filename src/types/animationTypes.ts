/**
 * LOVELOCK Animation Types
 *
 * Type definitions for animations, transitions, and visual effects.
 */

export interface Particle {
  id: string;
  type: 'heart' | 'star' | 'light';
  x: number;
  y: number;
  vx: number; // velocity x
  vy: number; // velocity y
  size: number;
  opacity: number;
  rotation: number;
  color: string;
  lifetime: number;
  maxLifetime: number;
}

export interface AnimationTimeline {
  id: string;
  duration: number;
  keyframes: Keyframe[];
  easing: string;
  loop: boolean;
}

export interface Keyframe {
  time: number; // 0-1 progress
  properties: {
    x?: number;
    y?: number;
    opacity?: number;
    scale?: number;
    rotation?: number;
    color?: string;
  };
}

export interface BackgroundAnimation {
  type: 'stars' | 'lightRays' | 'hearts' | 'particles';
  isPlaying: boolean;
  speed: number;
  intensity: number;
}

export interface Star {
  id: string;
  x: number;
  y: number;
  size: number;
  brightness: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

export interface LightRay {
  id: string;
  angle: number;
  length: number;
  width: number;
  opacity: number;
  rotationSpeed: number;
}

export interface HeartParticle {
  id: string;
  x: number;
  y: number;
  size: number;
  opacity: number;
  rotation: number;
  floatSpeed: number;
  floatPhase: number;
  color: string;
}

export interface UnlockAnimationConfig {
  type: 'lampPull' | 'keyTurn' | 'heartsMerge';
  duration: number;
  particles: ParticleConfig[];
  transitions: TransitionConfig[];
  soundEffect?: string;
  hapticPattern?: number[];
}

export interface ParticleConfig {
  type: 'heart' | 'star' | 'light';
  count: number;
  spawnRadius: number;
  speedRange: { min: number; max: number };
  sizeRange: { min: number; max: number };
  colors: string[];
  lifetimeRange: { min: number; max: number };
}

export interface TransitionConfig {
  type: 'fade' | 'blur' | 'scale' | 'slide';
  duration: number;
  delay: number;
  properties: any;
}

export interface LottieAnimation {
  name: string;
  source: any;
  autoPlay: boolean;
  loop: boolean;
  speed: number;
}

export interface SkiaAnimation {
  type: 'canvas' | 'particles' | 'effects';
  width: number;
  height: number;
  fps: number;
}