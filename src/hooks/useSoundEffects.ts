/**
 * LOVELOCK Sound Effects Hook
 *
 * Hook for managing romantic sound effects and audio feedback.
 */

import { useEffect, useCallback } from 'react';
import { useLockStore, useSettingsStore } from '@/store';
import { soundService } from '@/services';
import type { TimeOfDay, UserMood } from '@/types';

interface UseSoundEffectsReturn {
  playUnlockSound: (mood?: UserMood) => void;
  playInteractionSound: (type: 'lamp_pull' | 'key_turn' | 'hearts_touch', intensity?: number) => void;
  playHapticFeedback: (type: 'light' | 'medium' | 'heavy') => void;
  playAmbientSound: (ambientType: 'night' | 'romantic' | 'calm', timeOfDay?: TimeOfDay) => void;
  stopAmbientSounds: () => void;
  setVolume: (volume: number) => void;
  isServiceReady: () => boolean;
}

export const useSoundEffects = (): UseSoundEffectsReturn => {
  const { settings, currentBackground } = useLockStore();
  const { soundEnabled, masterVolume } = useSettingsStore();

  // Initialize sound service
  useEffect(() => {
    if (!soundService.isReady()) {
      soundService.initialize();
    }

    return () => {
      soundService.cleanup();
    };
  }, []);

  // Play unlock sound based on mood
  const playUnlockSound = useCallback((mood: UserMood = 'romantic') => {
    if (!soundEnabled || !settings.soundEnabled) return;

    soundService.playSuccessSound(mood);
  }, [soundEnabled, settings.soundEnabled]);

  // Play interaction sound with intensity
  const playInteractionSound = useCallback((
    type: 'lamp_pull' | 'key_turn' | 'hearts_touch',
    intensity: number = 0.5
  ) => {
    if (!soundEnabled || !settings.soundEnabled) return;

    soundService.playInteractionSound(type, intensity);
  }, [soundEnabled, settings.soundEnabled]);

  // Play haptic feedback
  const playHapticFeedback = useCallback((type: 'light' | 'medium' | 'heavy') => {
    if (!settings.hapticFeedback) return;

    soundService.playHapticFeedback(type);
  }, [settings.hapticFeedback]);

  // Play ambient background sound
  const playAmbientSound = useCallback((
    ambientType: 'night' | 'romantic' | 'calm',
    timeOfDay?: TimeOfDay
  ) => {
    if (!soundEnabled || !settings.soundEnabled) return;

    if (timeOfDay) {
      soundService.playAdaptiveSound('ambient_night', timeOfDay);
    } else {
      soundService.playAmbientSound(ambientType);
    }
  }, [soundEnabled, settings.soundEnabled]);

  // Stop ambient sounds
  const stopAmbientSounds = useCallback(() => {
    soundService.stopAmbientSounds();
  }, []);

  // Set volume
  const setVolume = useCallback((volume: number) => {
    soundService.setMasterVolume(volume);
  }, []);

  // Check if service is ready
  const isServiceReady = useCallback(() => {
    return soundService.isReady();
  }, []);

  // Auto-play ambient sounds based on background
  useEffect(() => {
    if (!soundEnabled || !settings.soundEnabled) {
      stopAmbientSounds();
      return;
    }

    const hour = new Date().getHours();
    const timeOfDay = hour >= 6 && hour < 12 ? 'morning' :
                     hour >= 12 && hour < 18 ? 'afternoon' :
                     hour >= 18 && hour < 22 ? 'evening' : 'night';

    switch (currentBackground) {
      case 'nightSky':
        playAmbientSound('night', timeOfDay);
        break;
      case 'heartParticles':
        playAmbientSound('romantic', timeOfDay);
        break;
      case 'glowingLamp':
        playAmbientSound('calm', timeOfDay);
        break;
      default:
        stopAmbientSounds();
    }

    return () => stopAmbientSounds();
  }, [currentBackground, soundEnabled, settings.soundEnabled, playAmbientSound, stopAmbientSounds]);

  // Update master volume when settings change
  useEffect(() => {
    soundService.setMasterVolume(masterVolume);
  }, [masterVolume]);

  return {
    playUnlockSound,
    playInteractionSound,
    playHapticFeedback,
    playAmbientSound,
    stopAmbientSounds,
    setVolume,
    isServiceReady,
  };
};