/**
 * LOVELOCK Lock Screen Store
 *
 * Zustand store for managing lock screen state, unlock mechanisms, and interactions.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  LockScreenState,
  LockSettings,
  LampCordState,
  HeartKeyState,
  TouchingHeartsState,
  UnlockGestureState,
  UnlockAnimationState,
  UnlockEvent,
  UnlockMechanism,
  BackgroundTheme,
} from '@/types';

interface LockStore extends LockScreenState {
  // Settings
  settings: LockSettings;
  updateSettings: (settings: Partial<LockSettings>) => void;

  // Lock state management
  lock: () => void;
  unlock: () => void;
  setUnlockInProgress: (inProgress: boolean) => void;

  // Mechanism selection
  setMechanism: (mechanism: UnlockMechanism) => void;
  setBackground: (background: BackgroundTheme) => void;

  // Lamp cord state
  lampCordState: LampCordState;
  updateLampCordState: (state: Partial<LampCordState>) => void;

  // Heart key state
  heartKeyState: HeartKeyState;
  updateHeartKeyState: (state: Partial<HeartKeyState>) => void;

  // Touching hearts state
  touchingHeartsState: TouchingHeartsState;
  updateTouchingHeartsState: (state: Partial<TouchingHeartsState>) => void;

  // Gesture state
  gestureState: UnlockGestureState;
  updateGestureState: (state: Partial<UnlockGestureState>) => void;

  // Animation state
  animationState: UnlockAnimationState;
  updateAnimationState: (state: Partial<UnlockAnimationState>) => void;

  // Unlock history
  unlockHistory: UnlockEvent[];
  addUnlockEvent: (event: Omit<UnlockEvent, 'timestamp'>) => void;
  getUnlockStats: () => {
    totalUnlocks: number;
    averageUnlockTime: number;
    mostUsedMechanism: UnlockMechanism;
    successRate: number;
  };

  // Reset
  reset: () => void;
}

const initialState: LockScreenState = {
  isLocked: true,
  currentMechanism: 'lampCord',
  currentBackground: 'nightSky',
  unlockInProgress: false,
  lastUnlockTime: null,
};

const defaultSettings: LockSettings = {
  mechanism: 'lampCord',
  background: 'nightSky',
  soundEnabled: true,
  hapticFeedback: true,
  animationSpeed: 'normal',
  loveQuotesEnabled: true,
  autoLockTimeout: 30, // 30 seconds
};

const defaultLampCordState: LampCordState = {
  pullDistance: 0,
  isPulling: false,
  brightness: 0,
  velocity: 0,
};

const defaultHeartKeyState: HeartKeyState = {
  rotation: 0,
  isRotating: false,
  unlockProgress: 0,
};

const defaultTouchingHeartsState: TouchingHeartsState = {
  leftHeartPosition: { x: 100, y: 400 },
  rightHeartPosition: { x: 300, y: 400 },
  isLeftHeartDragging: false,
  isRightHeartDragging: false,
  distance: 200,
  connectionStrength: 0,
};

const defaultGestureState: UnlockGestureState = {
  activeGesture: null,
  startX: 0,
  startY: 0,
  currentX: 0,
  currentY: 0,
  velocity: 0,
  timestamp: Date.now(),
};

const defaultAnimationState: UnlockAnimationState = {
  isAnimating: false,
  animationType: null,
  progress: 0,
  particlesVisible: false,
};

export const useLockStore = create<LockStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      settings: defaultSettings,
      lampCordState: defaultLampCordState,
      heartKeyState: defaultHeartKeyState,
      touchingHeartsState: defaultTouchingHeartsState,
      gestureState: defaultGestureState,
      animationState: defaultAnimationState,
      unlockHistory: [],

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      lock: () =>
        set(() => ({
          isLocked: true,
          unlockInProgress: false,
          lampCordState: defaultLampCordState,
          heartKeyState: defaultHeartKeyState,
          touchingHeartsState: defaultTouchingHeartsState,
          gestureState: defaultGestureState,
          animationState: defaultAnimationState,
        })),

      unlock: () =>
        set((state) => ({
          isLocked: false,
          lastUnlockTime: new Date(),
          unlockInProgress: false,
        })),

      setUnlockInProgress: (inProgress) =>
        set(() => ({
          unlockInProgress: inProgress,
        })),

      setMechanism: (mechanism) =>
        set((state) => ({
          currentMechanism: mechanism,
          settings: { ...state.settings, mechanism },
        })),

      setBackground: (background) =>
        set((state) => ({
          currentBackground: background,
          settings: { ...state.settings, background },
        })),

      updateLampCordState: (newState) =>
        set((state) => ({
          lampCordState: { ...state.lampCordState, ...newState },
        })),

      updateHeartKeyState: (newState) =>
        set((state) => ({
          heartKeyState: { ...state.heartKeyState, ...newState },
        })),

      updateTouchingHeartsState: (newState) =>
        set((state) => ({
          touchingHeartsState: { ...state.touchingHeartsState, ...newState },
        })),

      updateGestureState: (newState) =>
        set((state) => ({
          gestureState: { ...state.gestureState, ...newState },
        })),

      updateAnimationState: (newState) =>
        set((state) => ({
          animationState: { ...state.animationState, ...newState },
        })),

      addUnlockEvent: (event) =>
        set((state) => ({
          unlockHistory: [
            ...state.unlockHistory.slice(-99), // Keep last 100 events
            { ...event, timestamp: new Date() },
          ],
        })),

      getUnlockStats: () => {
        const { unlockHistory } = get();
        if (unlockHistory.length === 0) {
          return {
            totalUnlocks: 0,
            averageUnlockTime: 0,
            mostUsedMechanism: 'lampCord',
            successRate: 0,
          };
        }

        const successfulUnlocks = unlockHistory.filter((event) => event.success);
        const mechanismCounts = unlockHistory.reduce((acc, event) => {
          acc[event.mechanism] = (acc[event.mechanism] || 0) + 1;
          return acc;
        }, {} as Record<UnlockMechanism, number>);

        const mostUsedMechanism = Object.entries(mechanismCounts).reduce(
          (a, b) => (a[1] > b[1] ? a : b),
        )[0] as UnlockMechanism;

        return {
          totalUnlocks: unlockHistory.length,
          averageUnlockTime:
            successfulUnlocks.reduce((sum, event) => sum + event.duration, 0) /
            successfulUnlocks.length,
          mostUsedMechanism,
          successRate: (successfulUnlocks.length / unlockHistory.length) * 100,
        };
      },

      reset: () =>
        set(() => ({
          ...initialState,
          settings: defaultSettings,
          lampCordState: defaultLampCordState,
          heartKeyState: defaultHeartKeyState,
          touchingHeartsState: defaultTouchingHeartsState,
          gestureState: defaultGestureState,
          animationState: defaultAnimationState,
          unlockHistory: [],
        })),
    }),
    {
      name: 'lovelock-lock-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        settings: state.settings,
        unlockHistory: state.unlockHistory,
        lastUnlockTime: state.lastUnlockTime,
      }),
    },
  ),
);