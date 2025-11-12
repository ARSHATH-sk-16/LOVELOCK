/**
 * LOVELOCK Gesture Detection Hook
 *
 * Advanced gesture detection for all lock interactions with haptic feedback.
 */

import { useState, useCallback, useRef } from 'react';
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  RotationGestureHandler,
  RotationGestureHandlerGestureEvent,
  TapGestureHandler,
  TapGestureHandlerGestureEvent,
  State,
} from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import HapticFeedback from 'react-native-haptic-feedback';
import type {
  UnlockGestureState,
  GestureMetrics,
  UnlockMechanism,
  Coordinate,
} from '@/types';
import { useLockStore } from '@/store';
import { soundService } from '@/services';

interface GestureDetectionOptions {
  mechanism: UnlockMechanism;
  onGestureStart?: () => void;
  onGestureUpdate?: (metrics: GestureMetrics) => void;
  onGestureComplete?: (success: boolean, metrics: GestureMetrics) => void;
  hapticFeedback?: boolean;
  soundFeedback?: boolean;
}

interface GestureHandlers {
  onPanGestureEvent: (event: PanGestureHandlerGestureEvent) => void;
  onPanHandlerStateChange: (event: PanGestureHandlerGestureEvent) => void;
  onRotationGestureEvent: (event: RotationGestureHandlerGestureEvent) => void;
  onRotationHandlerStateChange: (event: RotationGestureHandlerGestureEvent) => void;
  onTapGestureEvent: (event: TapGestureHandlerGestureEvent) => void;
  onTapHandlerStateChange: (event: TapGestureHandlerGestureEvent) => void;
}

const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

const triggerHaptic = (type: 'light' | 'medium' | 'heavy') => {
  HapticFeedback.trigger(type === 'light' ? 'impactLight' :
                         type === 'medium' ? 'impactMedium' : 'impactHeavy',
                         hapticOptions);
};

export const useGestureDetection = (options: GestureDetectionOptions): [GestureHandlers, GestureMetrics, boolean] => {
  const { mechanism, onGestureStart, onGestureUpdate, onGestureComplete, hapticFeedback = true, soundFeedback = true } = options;

  const {
    updateGestureState,
    updateLampCordState,
    updateHeartKeyState,
    updateTouchingHeartsState,
    settings
  } = useLockStore();

  const [isGestureActive, setIsGestureActive] = useState(false);
  const [metrics, setMetrics] = useState<GestureMetrics>({
    pullDistance: 0,
    rotationDegrees: 0,
    touchDuration: 0,
    averageVelocity: 0,
    pressure: 0,
  });

  const gestureStartTime = useRef<number>(0);
  const lastPosition = useRef<Coordinate>({ x: 0, y: 0 });
  const velocityHistory = useRef<number[]>([]);
  const gestureType = useRef<'pull' | 'rotate' | 'drag' | null>(null);

  const startGesture = useCallback((type: 'pull' | 'rotate' | 'drag', x: number, y: number) => {
    gestureType.current = type;
    gestureStartTime.current = Date.now();
    lastPosition.current = { x, y };
    velocityHistory.current = [];
    setIsGestureActive(true);

    updateGestureState({
      activeGesture: type,
      startX: x,
      startY: y,
      currentX: x,
      currentY: y,
      velocity: 0,
      timestamp: Date.now(),
    });

    if (hapticFeedback && settings.hapticFeedback) {
      triggerHaptic('light');
    }

    if (soundFeedback && settings.soundEnabled) {
      soundService.playInteractionSound(
        mechanism === 'lampCord' ? 'lamp_pull' :
        mechanism === 'heartKey' ? 'key_turn' : 'hearts_touch',
        0.3
      );
    }

    onGestureStart?.();
  }, [hapticFeedback, soundFeedback, mechanism, onGestureStart, updateGestureState, settings]);

  const updateGesture = useCallback((x: number, y: number, rotation: number = 0) => {
    const now = Date.now();
    const deltaTime = now - gestureStartTime.current;
    const deltaX = x - lastPosition.current.x;
    const deltaY = y - lastPosition.current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const velocity = deltaTime > 0 ? distance / deltaTime * 1000 : 0;

    // Update velocity history (keep last 10 values)
    velocityHistory.current.push(velocity);
    if (velocityHistory.current.length > 10) {
      velocityHistory.current.shift();
    }

    const averageVelocity = velocityHistory.current.reduce((sum, v) => sum + v, 0) / velocityHistory.current.length;

    const newMetrics: GestureMetrics = {
      pullDistance: gestureType.current === 'pull' ? distance : metrics.pullDistance,
      rotationDegrees: gestureType.current === 'rotate' ? rotation : metrics.rotationDegrees,
      touchDuration: deltaTime,
      averageVelocity,
      pressure: 1, // Would be detected from device if supported
    };

    setMetrics(newMetrics);
    lastPosition.current = { x, y };

    updateGestureState({
      currentX: x,
      currentY: y,
      velocity,
      timestamp: now,
    });

    // Update mechanism-specific state
    if (mechanism === 'lampCord' && gestureType.current === 'pull') {
      const pullDistance = Math.max(0, y - 300); // Assuming lamp at y=300
      const brightness = Math.min(1, pullDistance / 200); // 200px = full brightness

      updateLampCordState({
        pullDistance,
        brightness: brightness * 100,
        velocity,
        isPulling: true,
      });

      // Adaptive sound feedback based on pull distance
      if (soundFeedback && settings.soundEnabled && pullDistance > 0) {
        const intensity = Math.min(1, pullDistance / 150);
        soundService.playInteractionSound('lamp_pull', intensity);
      }
    }

    if (mechanism === 'heartKey' && gestureType.current === 'rotate') {
      updateHeartKeyState({
        rotation,
        isRotating: true,
        unlockProgress: Math.min(1, rotation / 270), // 270 degrees to unlock
      });
    }

    onGestureUpdate?.(newMetrics);
  }, [mechanism, metrics, onGestureUpdate, updateGestureState, updateLampCordState, updateHeartKeyState, soundFeedback, settings]);

  const completeGesture = useCallback((success: boolean) => {
    const totalTime = Date.now() - gestureStartTime.current;

    if (hapticFeedback && settings.hapticFeedback) {
      triggerHaptic(success ? 'heavy' : 'medium');
    }

    if (soundFeedback && settings.soundEnabled) {
      if (success) {
        soundService.playSuccessSound('romantic');
      } else {
        // Play failure sound
        soundService.playInteractionSound('lamp_pull', 0.2);
      }
    }

    // Update final state
    if (mechanism === 'lampCord') {
      updateLampCordState({ isPulling: false, velocity: 0 });
    }

    if (mechanism === 'heartKey') {
      updateHeartKeyState({ isRotating: false });
    }

    updateGestureState({
      activeGesture: null,
      velocity: 0,
      timestamp: Date.now(),
    });

    setIsGestureActive(false);
    gestureType.current = null;

    const finalMetrics = {
      ...metrics,
      touchDuration: totalTime,
    };

    onGestureComplete?.(success, finalMetrics);
  }, [hapticFeedback, soundFeedback, mechanism, metrics, onGestureComplete, updateGestureState, updateLampCordState, updateHeartKeyState, settings]);

  // Pan gesture handlers
  const onPanGestureEvent = useCallback((event: PanGestureHandlerGestureEvent) => {
    if (mechanism !== 'lampCord' && mechanism !== 'touchingHearts') return;

    const { x, y } = event.nativeEvent;

    if (isGestureActive || event.nativeEvent.state === State.BEGAN) {
      if (!isGestureActive) {
        startGesture('pull', x, y);
      } else {
        updateGesture(x, y);
      }
    }
  }, [mechanism, isGestureActive, startGesture, updateGesture]);

  const onPanHandlerStateChange = useCallback((event: PanGestureHandlerGestureEvent) => {
    const { state, y } = event.nativeEvent;

    if (state === State.END || state === State.FAILED || state === State.CANCELLED) {
      let success = false;

      if (mechanism === 'lampCord') {
        const pullDistance = Math.max(0, y - 300);
        success = pullDistance >= 150 && metrics.averageVelocity > 500;
      }

      completeGesture(success);
    }
  }, [mechanism, metrics.averageVelocity, completeGesture]);

  // Rotation gesture handlers
  const onRotationGestureEvent = useCallback((event: RotationGestureHandlerGestureEvent) => {
    if (mechanism !== 'heartKey') return;

    const { rotation } = event.nativeEvent;
    const degrees = (rotation * 180) / Math.PI;

    if (isGestureActive || event.nativeEvent.state === State.BEGAN) {
      if (!isGestureActive) {
        startGesture('rotate', 0, 0);
      }
      updateGesture(0, 0, Math.abs(degrees));
    }
  }, [mechanism, isGestureActive, startGesture, updateGesture]);

  const onRotationHandlerStateChange = useCallback((event: RotationGestureHandlerGestureEvent) => {
    const { state } = event.nativeEvent;

    if (state === State.END || state === State.FAILED || state === State.CANCELLED) {
      const success = metrics.rotationDegrees >= 270;
      completeGesture(success);
    }
  }, [metrics.rotationDegrees, completeGesture]);

  // Tap gesture handlers (for accessibility/alternative unlock)
  const onTapGestureEvent = useCallback((event: TapGestureHandlerGestureEvent) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      // Triple tap detection for accessibility
      const now = Date.now();
      const timeSinceLastTap = now - (gestureStartTime.current || 0);

      if (timeSinceLastTap < 500) {
        // Rapid tap detected
        if (hapticFeedback && settings.hapticFeedback) {
          triggerHaptic('medium');
        }
      }

      gestureStartTime.current = now;
    }
  }, [hapticFeedback, settings]);

  const onTapHandlerStateChange = useCallback((event: TapGestureHandlerGestureEvent) => {
    // Handle tap states for accessibility features
  }, []);

  const gestureHandlers: GestureHandlers = {
    onPanGestureEvent,
    onPanHandlerStateChange,
    onRotationGestureEvent,
    onRotationHandlerStateChange,
    onTapGestureEvent,
    onTapHandlerStateChange,
  };

  return [gestureHandlers, metrics, isGestureActive];
};