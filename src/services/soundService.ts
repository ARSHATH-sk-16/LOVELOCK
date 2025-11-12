/**
 * LOVELOCK Sound Service
 *
 * Manages romantic sound effects and audio feedback for enhanced user experience.
 */

import Sound from 'react-native-sound';
import { Platform } from 'react-native';
import type { SoundEffect, HapticPattern } from '@/types';

class SoundService {
  private sounds: Map<string, Sound> = new Map();
  private isInitialized = false;
  private masterVolume = 0.8;

  constructor() {
    // Set the audio category for iOS
    if (Platform.OS === 'ios') {
      Sound.setCategory('Ambient');
    }
  }

  /**
   * Initialize the sound service and preload sounds
   */
  async initialize(): Promise<void> {
    try {
      await this.preloadSounds();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize sound service:', error);
    }
  }

  /**
   * Preload all sound effects
   */
  private async preloadSounds(): Promise<void> {
    const soundFiles: SoundEffect[] = [
      {
        name: 'lamp_pull',
        file: 'lamp_pull.mp3',
        volume: 0.3,
        loop: false,
        category: 'interaction',
      },
      {
        name: 'lamp_glow',
        file: 'lamp_glow.mp3',
        volume: 0.2,
        loop: true,
        category: 'ambient',
      },
      {
        name: 'heart_key_turn',
        file: 'heart_key_turn.mp3',
        volume: 0.4,
        loop: false,
        category: 'interaction',
      },
      {
        name: 'heart_beat',
        file: 'heart_beat.mp3',
        volume: 0.3,
        loop: true,
        category: 'ambient',
      },
      {
        name: 'hearts_touch',
        file: 'hearts_touch.mp3',
        volume: 0.3,
        loop: false,
        category: 'interaction',
      },
      {
        name: 'unlock_success',
        file: 'unlock_chime.mp3',
        volume: 0.5,
        loop: false,
        category: 'success',
      },
      {
        name: 'unlock_romantic',
        file: 'unlock_romantic.mp3',
        volume: 0.6,
        loop: false,
        category: 'success',
      },
      {
        name: 'ambient_night',
        file: 'ambient_night.mp3',
        volume: 0.1,
        loop: true,
        category: 'ambient',
      },
    ];

    const loadPromises = soundFiles.map((soundEffect) => this.loadSound(soundEffect));
    await Promise.all(loadPromises);
  }

  /**
   * Load a single sound file
   */
  private loadSound(soundEffect: SoundEffect): Promise<void> {
    return new Promise((resolve, reject) => {
      const sound = new Sound(soundEffect.file, Sound.MAIN_BUNDLE, (error) => {
        if (error) {
          console.warn(`Failed to load sound ${soundEffect.name}:`, error);
          reject(error);
          return;
        }

        sound.setNumberOfLoops(soundEffect.loop ? -1 : 0);
        sound.setVolume(soundEffect.volume * this.masterVolume);
        this.sounds.set(soundEffect.name, sound);
        resolve();
      });
    });
  }

  /**
   * Play a sound effect
   */
  playSound(soundName: string, volume?: number): void {
    if (!this.isInitialized) {
      console.warn('Sound service not initialized');
      return;
    }

    const sound = this.sounds.get(soundName);
    if (!sound) {
      console.warn(`Sound not found: ${soundName}`);
      return;
    }

    const finalVolume = volume !== undefined ? volume * this.masterVolume : this.masterVolume;
    sound.setVolume(finalVolume);

    sound.play((success) => {
      if (!success) {
        console.warn(`Failed to play sound: ${soundName}`);
      }
    });
  }

  /**
   * Stop a playing sound
   */
  stopSound(soundName: string): void {
    const sound = this.sounds.get(soundName);
    if (sound) {
      sound.stop();
    }
  }

  /**
   * Play ambient background sounds
   */
  playAmbientSound(ambientType: 'night' | 'romantic' | 'calm'): void {
    // Stop any existing ambient sounds
    this.sounds.forEach((sound, name) => {
      if (name.includes('ambient')) {
        sound.stop();
      }
    });

    let soundToPlay = '';
    switch (ambientType) {
      case 'night':
        soundToPlay = 'ambient_night';
        break;
      case 'romantic':
        soundToPlay = 'heart_beat';
        break;
      case 'calm':
        soundToPlay = 'lamp_glow';
        break;
    }

    if (soundToPlay) {
      this.playSound(soundToPlay, 0.2);
    }
  }

  /**
   * Stop all ambient sounds
   */
  stopAmbientSounds(): void {
    this.sounds.forEach((sound, name) => {
      if (name.includes('ambient') || name.includes('glow') || name.includes('beat')) {
        sound.stop();
      }
    });
  }

  /**
   * Play sound with time-based adaptation
   */
  playAdaptiveSound(soundName: string, timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'): void {
    const timeVolumeMap = {
      morning: 0.6,  // Brighter sounds in morning
      afternoon: 0.7, // Full volume in afternoon
      evening: 0.5,  // Softer in evening
      night: 0.3,    // Quietest at night
    };

    const volume = timeVolumeMap[timeOfDay];
    this.playSound(soundName, volume);
  }

  /**
   * Update master volume
   */
  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));

    // Update volume for all loaded sounds
    this.sounds.forEach((sound, name) => {
      const soundEffect = this.getDefaultSoundEffect(name);
      if (soundEffect) {
        sound.setVolume(soundEffect.volume * this.masterVolume);
      }
    });
  }

  /**
   * Get default sound effect settings
   */
  private getDefaultSoundEffect(name: string): SoundEffect | null {
    const soundEffects: SoundEffect[] = [
      { name: 'lamp_pull', file: '', volume: 0.3, loop: false, category: 'interaction' },
      { name: 'lamp_glow', file: '', volume: 0.2, loop: true, category: 'ambient' },
      { name: 'heart_key_turn', file: '', volume: 0.4, loop: false, category: 'interaction' },
      { name: 'heart_beat', file: '', volume: 0.3, loop: true, category: 'ambient' },
      { name: 'hearts_touch', file: '', volume: 0.3, loop: false, category: 'interaction' },
      { name: 'unlock_success', file: '', volume: 0.5, loop: false, category: 'success' },
      { name: 'unlock_romantic', file: '', volume: 0.6, loop: false, category: 'success' },
      { name: 'ambient_night', file: '', volume: 0.1, loop: true, category: 'ambient' },
    ];

    return soundEffects.find((effect) => effect.name === name) || null;
  }

  /**
   * Create dynamic sound based on interaction intensity
   */
  playInteractionSound(
    interactionType: 'lamp_pull' | 'key_turn' | 'hearts_touch',
    intensity: number, // 0-1
  ): void {
    const soundName = interactionType === 'lamp_pull' ? 'lamp_pull' :
                      interactionType === 'key_turn' ? 'heart_key_turn' : 'hearts_touch';

    const volume = 0.2 + (intensity * 0.6); // Volume scales with intensity
    this.playSound(soundName, volume);
  }

  /**
   * Play success sound with romantic variation
   */
  playSuccessSound(mood: 'energetic' | 'calm' | 'romantic' | 'playful'): void {
    const soundMap = {
      energetic: 'unlock_success',
      calm: 'unlock_success',
      romantic: 'unlock_romantic',
      playful: 'unlock_success',
    };

    const soundName = soundMap[mood] || 'unlock_success';
    this.playSound(soundName);
  }

  /**
   * Create haptic-style sound feedback
   */
  playHapticFeedback(type: 'light' | 'medium' | 'heavy'): void {
    const hapticSounds = {
      light: 'lamp_pull',
      medium: 'heart_key_turn',
      heavy: 'unlock_success',
    };

    const soundName = hapticSounds[type] || 'lamp_pull';
    this.playSound(soundName, 0.3);
  }

  /**
   * Get current service status
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.stopAmbientSounds();

    this.sounds.forEach((sound) => {
      sound.release();
    });

    this.sounds.clear();
    this.isInitialized = false;
  }

  /**
   * Get list of available sounds
   */
  getAvailableSounds(): string[] {
    return Array.from(this.sounds.keys());
  }

  /**
   * Check if sound is currently playing
   */
  isSoundPlaying(soundName: string): boolean {
    const sound = this.sounds.get(soundName);
    return sound ? sound.isPlaying() : false;
  }
}

// Create singleton instance
export const soundService = new SoundService();

// Export for use in components
export default soundService;