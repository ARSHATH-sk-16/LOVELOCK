/**
 * LOVELOCK Home Background Component
 *
 * Dynamic background that continues from lock screen and adapts to time and mood.
 */

import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useLockStore } from '@/store';
import { useAIPersonalization } from '@/hooks';
import { NightSkyBackground } from './NightSkyBackground';
import { GlowingLampBackground } from './GlowingLampBackground';
import { HeartParticlesBackground } from './HeartParticlesBackground';
import type { BackgroundTheme } from '@/types';

interface HomeBackgroundProps {
  children?: React.ReactNode;
  customTheme?: BackgroundTheme;
  animateTransition?: boolean;
}

export const HomeBackground: React.FC<HomeBackgroundProps> = ({
  children,
  customTheme,
  animateTransition = true,
}) => {
  const { currentBackground } = useLockStore();
  const { profile, deviceContext } = useAIPersonalization();

  // Determine which background to use
  const backgroundTheme = useMemo(() => {
    if (customTheme) return customTheme;

    // Use AI-suggested background if available, otherwise use current background
    return profile.preferredBackground || currentBackground;
  }, [customTheme, profile.preferredBackground, currentBackground]);

  // Get time-specific configuration for night sky
  const nightSkyTime = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 20 || hour < 4) return 'late';
    if (hour >= 4 && hour < 7) return 'twilight';
    return 'early';
  }, []);

  // Get color temperature for lamp background
  const lampColorTemperature = useMemo(() => {
    const timeOfDay = deviceContext.timeOfDay;
    if (timeOfDay === 'morning') return 'warm';
    if (timeOfDay === 'afternoon') return 'neutral';
    if (timeOfDay === 'evening') return 'warm';
    return 'cool';
  }, [deviceContext.timeOfDay]);

  // Get heart particle configuration based on mood
  const heartParticleConfig = useMemo(() => {
    const mood = profile.userMood;
    const intensity = profile.soundLevel || 0.7;

    let colorPalette: 'pink' | 'red' | 'mixed' = 'mixed';
    let floatSpeed: 'slow' | 'normal' | 'fast' = 'normal';

    switch (mood) {
      case 'romantic':
        colorPalette = 'pink';
        floatSpeed = 'slow';
        break;
      case 'energetic':
        colorPalette = 'red';
        floatSpeed = 'fast';
        break;
      case 'playful':
        colorPalette = 'mixed';
        floatSpeed = 'normal';
        break;
      case 'calm':
        colorPalette = 'pink';
        floatSpeed = 'slow';
        break;
    }

    return { colorPalette, floatSpeed, intensity };
  }, [profile.userMood, profile.soundLevel]);

  // Render the appropriate background
  const renderBackground = () => {
    switch (backgroundTheme) {
      case 'nightSky':
        return (
          <NightSkyBackground
            parallaxEnabled={true}
            starCount={120}
            timeOfDay={nightSkyTime}
          />
        );

      case 'glowingLamp':
        return (
          <GlowingLampBackground
            intensity={profile.soundLevel || 0.8}
            pulseEnabled={true}
            colorTemperature={lampColorTemperature}
          />
        );

      case 'heartParticles':
        return (
          <HeartParticlesBackground
            particleCount={30}
            floatSpeed={heartParticleConfig.floatSpeed}
            colorPalette={heartParticleConfig.colorPalette}
            intensity={heartParticleConfig.intensity}
          />
        );

      default:
        return (
          <NightSkyBackground
            parallaxEnabled={true}
            starCount={100}
            timeOfDay="early"
          />
        );
    }
  };

  return (
    <View style={styles.container}>
      {renderBackground()}
      {children && <View style={styles.contentOverlay}>{children}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  contentOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
});