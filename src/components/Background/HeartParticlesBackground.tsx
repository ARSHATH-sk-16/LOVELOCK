/**
 * LOVELOCK Heart Particles Background Component
 *
 * Floating heart particles with varying sizes, opacity, and movement patterns.
 */

import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Canvas, Group, useFrameCallback } from '@shopify/react-native-skia';
import { LinearGradient } from 'react-native-linear-gradient';
import { useWindowDimensions } from 'react-native';
import Svg, { Heart as SvgHeart } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import type { HeartParticle } from '@/types';
import { HEART_PARTICLES_ANIMATION_CONFIG } from '@/utils';

interface HeartParticlesBackgroundProps {
  particleCount?: number;
  floatSpeed?: 'slow' | 'normal' | 'fast';
  colorPalette?: 'pink' | 'red' | 'mixed';
  intensity?: number;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const HeartParticlesBackground: React.FC<HeartParticlesBackgroundProps> = ({
  particleCount = HEART_PARTICLES_ANIMATION_CONFIG.heartCount,
  floatSpeed = 'normal',
  colorPalette = 'mixed',
  intensity = 0.8,
}) => {
  const { width, height } = useWindowDimensions();
  const time = useSharedValue(0);
  const heartParticles = useSharedValue<HeartParticle[]>([]);

  // Color palettes
  const colorPalettes = useMemo(() => ({
    pink: ['#FFB6C1', '#FFC0CB', '#FF69B4', '#FF1493'],
    red: ['#FF6347', '#FF4500', '#DC143C', '#B22222'],
    mixed: ['#FF69B4', '#FF1493', '#FFB6C1', '#FFC0CB', '#FF6347', '#FFA500'],
  }), []);

  const selectedColors = colorPalettes[colorPalette];

  // Float speed multipliers
  const speedMultipliers = useMemo(() => ({
    slow: 0.6,
    normal: 1.0,
    fast: 1.5,
  }), []);

  // Generate heart particles
  useEffect(() => {
    const particles: HeartParticle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const sizeRange = HEART_PARTICLES_ANIMATION_CONFIG.sizeRange;
      const speedRange = HEART_PARTICLES_ANIMATION_CONFIG.floatSpeedRange;

      particles.push({
        id: `heart_${i}`,
        x: Math.random() * width,
        y: height + Math.random() * 100, // Start below screen
        size: sizeRange.min + Math.random() * (sizeRange.max - sizeRange.min),
        opacity: HEART_PARTICLES_ANIMATION_CONFIG.opacityRange.min +
                 Math.random() * (HEART_PARTICLES_ANIMATION_CONFIG.opacityRange.max - HEART_PARTICLES_ANIMATION_CONFIG.opacityRange.min),
        rotation: Math.random() * Math.PI * 2,
        floatSpeed: speedRange.min + Math.random() * (speedRange.max - speedRange.min),
        floatPhase: Math.random() * Math.PI * 2,
        color: selectedColors[Math.floor(Math.random() * selectedColors.length)],
      });
    }

    heartParticles.value = particles;
  }, [particleCount, width, height, selectedColors, heartParticles]);

  // Animation frame callback
  useFrameCallback((frameInfo) => {
    const { timeMs } = frameInfo;
    time.value = timeMs * 0.001; // Convert to seconds

    const currentParticles = heartParticles.value;
    const deltaTime = 0.016; // ~60fps
    const speedMultiplier = speedMultipliers[floatSpeed];

    const updatedParticles = currentParticles
      .map(particle => {
        const newY = particle.y - particle.floatSpeed * speedMultiplier * deltaTime / 1000;
        const newX = particle.x + Math.sin(particle.floatPhase + time.value * 0.001) * 30;
        const newRotation = particle.rotation + time.value * HEART_PARTICLES_ANIMATION_CONFIG.rotationSpeed;

        // Reset heart if it goes off screen
        if (newY < -50) {
          return {
            ...particle,
            x: Math.random() * width,
            y: height + Math.random() * 100,
            rotation: Math.random() * Math.PI * 2,
            floatPhase: Math.random() * Math.PI * 2,
          };
        }

        return {
          ...particle,
          x: newX,
          y: newY,
          rotation: newRotation,
        };
      })
      .filter(particle => particle.y > -50); // Remove hearts that went way off screen

    heartParticles.value = updatedParticles;
  });

  // Animated gradient background
  const gradientColors = useMemo(() => {
    switch (colorPalette) {
      case 'pink':
        return ['#FFE4E1', '#FFF0F5', '#FFE4E1'];
      case 'red':
        return ['#2C0A0A', '#4A1616', '#2C0A0A'];
      case 'mixed':
        return ['#2D1B69', '#402980', '#2D1B69'];
      default:
        return ['#2D1B69', '#402980', '#2D1B69'];
    }
  }, [colorPalette]);

  // Background animation
  const backgroundAnimation = useSharedValue(0);
  useEffect(() => {
    backgroundAnimation.value = withRepeat(
      withTiming(1, { duration: 3000 }),
      -1,
      true
    );
  }, [backgroundAnimation]);

  const backgroundAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        backgroundAnimation.value,
        [0, 0.5, 1],
        [0.3, 0.5, 0.3],
        Extrapolate.CLAMP
      ),
    };
  });

  // Render heart path (simplified heart shape)
  const renderHeartPath = (x: number, y: number, size: number) => {
    const scale = size / 20; // Base size is 20
    return `
      M ${x} ${y + 5 * scale}
      C ${x - 10 * scale} ${y - 5 * scale}, ${x - 15 * scale} ${y + 3 * scale}, ${x} ${y + 15 * scale}
      C ${x + 15 * scale} ${y + 3 * scale}, ${x + 10 * scale} ${y - 5 * scale}, ${x} ${y + 5 * scale}
    `;
  };

  // Render individual heart particle
  const renderHeartParticle = (particle: HeartParticle) => {
    const scale = particle.size / 20;
    const opacity = particle.opacity * intensity;

    return (
      <Animated.View
        key={particle.id}
        style={[
          styles.heartParticle,
          {
            left: particle.x - particle.size / 2,
            top: particle.y - particle.size / 2,
            width: particle.size,
            height: particle.size,
            opacity,
            transform: [
              { rotate: `${particle.rotation}rad` },
              { scale },
            ],
          },
        ]}
      >
        <Svg
          width={particle.size}
          height={particle.size}
          viewBox="0 0 24 24"
        >
          <SvgHeart
            x="0"
            y="0"
            width="24"
            height="24"
            fill={particle.color}
            opacity={opacity}
          />
        </Svg>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Animated background gradient */}
      <Animated.View style={[StyleSheet.absoluteFill, backgroundAnimatedStyle]}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Static background gradient */}
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Heart particles */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {heartParticles.value.map(renderHeartParticle)}
      </View>

      {/* Soft overlay for depth */}
      <View style={styles.overlay} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: screenWidth,
    height: screenHeight,
  },
  heartParticle: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
});