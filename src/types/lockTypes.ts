/**
 * LOVELOCK Lock Screen Types
 *
 * Type definitions for lock screen mechanisms, unlock states, and interactions.
 */

export type UnlockMechanism = 'lampCord' | 'heartKey' | 'touchingHearts';

export type BackgroundTheme = 'nightSky' | 'glowingLamp' | 'heartParticles';

export interface LockScreenState {
  isLocked: boolean;
  currentMechanism: UnlockMechanism;
  currentBackground: BackgroundTheme;
  unlockInProgress: boolean;
  lastUnlockTime: Date | null;
}

export interface LampCordState {
  pullDistance: number;
  isPulling: boolean;
  brightness: number;
  velocity: number;
}

export interface HeartKeyState {
  rotation: number;
  isRotating: boolean;
  unlockProgress: number;
}

export interface TouchingHeartsState {
  leftHeartPosition: { x: number; y: number };
  rightHeartPosition: { x: number; y: number };
  isLeftHeartDragging: boolean;
  isRightHeartDragging: boolean;
  distance: number;
  connectionStrength: number;
}

export interface UnlockGestureState {
  activeGesture: 'pull' | 'rotate' | 'drag' | null;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  velocity: number;
  timestamp: number;
}

export interface UnlockAnimationState {
  isAnimating: boolean;
  animationType: 'success' | 'failure' | null;
  progress: number;
  particlesVisible: boolean;
}

export interface LockSettings {
  mechanism: UnlockMechanism;
  background: BackgroundTheme;
  soundEnabled: boolean;
  hapticFeedback: boolean;
  animationSpeed: 'slow' | 'normal' | 'fast';
  loveQuotesEnabled: boolean;
  autoLockTimeout: number; // seconds
}

export interface UnlockEvent {
  timestamp: Date;
  mechanism: UnlockMechanism;
  duration: number; // milliseconds
  success: boolean;
  mood?: 'gentle' | 'energetic' | 'romantic' | 'playful';
}

export interface GestureMetrics {
  pullDistance: number;
  rotationDegrees: number;
  touchDuration: number;
  averageVelocity: number;
  pressure: number; // if supported by device
}