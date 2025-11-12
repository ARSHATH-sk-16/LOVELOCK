/**
 * LOVELOCK Night Sky Background Component
 *
 * Animated starry night with twinkling stars, moon phases, and shooting stars.
 */

import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Canvas, Group, Rect, Circle, useSharedValue, useFrameCallback } from '@shopify/react-native-skia';
import { LinearGradient } from 'react-native-linear-gradient';
import { useWindowDimensions } from 'react-native';
import type { Star } from '@/types';
import { GRADIENTS, NIGHT_SKY_ANIMATION_CONFIG } from '@/utils';

interface NightSkyBackgroundProps {
  parallaxEnabled?: boolean;
  shootingStarFrequency?: number;
  starCount?: number;
  timeOfDay?: 'early' | 'late' | 'twilight';
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const NightSkyBackground: React.FC<NightSkyBackgroundProps> = ({
  parallaxEnabled = true,
  shootingStarFrequency = NIGHT_SKY_ANIMATION_CONFIG.shootingStarFrequency,
  starCount = NIGHT_SKY_ANIMATION_CONFIG.starCount,
  timeOfDay = 'early',
}) => {
  const { width, height } = useWindowDimensions();
  const time = useSharedValue(0);
  const shootingStars = useSharedValue<Array<{ id: number; x: number; y: number; vx: number; vy: number; life: number }>>([]);

  // Generate stars on mount
  const stars = useMemo<Star[]>(() => {
    const generatedStars: Star[] = [];
    for (let i = 0; i < starCount; i++) {
      generatedStars.push({
        id: `star_${i}`,
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 3 + 1,
        brightness: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.002 + NIGHT_SKY_ANIMATION_CONFIG.twinkleSpeed,
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }
    return generatedStars;
  }, [starCount, width, height]);

  // Create shooting stars periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const currentShootingStars = shootingStars.value;

      // Add new shooting star
      if (Math.random() < 0.3) { // 30% chance per interval
        const newStar = {
          id: Date.now(),
          x: Math.random() * width,
          y: Math.random() * height * 0.5, // Upper half of screen
          vx: (Math.random() - 0.5) * 400,
          vy: Math.random() * 200 + 100,
          life: 1.0,
        };

        shootingStars.value = [...currentShootingStars.slice(-5), newStar]; // Keep max 6 shooting stars
      }
    }, shootingStarFrequency);

    return () => clearInterval(interval);
  }, [shootingStarFrequency, shootingStars, width]);

  // Animation frame callback
  useFrameCallback((frameInfo) => {
    const { timeMs } = frameInfo;

    // Update time for animations
    time.value = timeMs * 0.001; // Convert to seconds

    // Update shooting stars
    const currentShootingStars = shootingStars.value;
    const deltaTime = 0.016; // ~60fps

    const updatedShootingStars = currentShootingStars
      .map(star => ({
        ...star,
        x: star.x + star.vx * deltaTime,
        y: star.y + star.vy * deltaTime,
        life: star.life - deltaTime * 0.5, // Fade over 2 seconds
      }))
      .filter(star => star.life > 0 && star.x > -50 && star.x < width + 50 && star.y > -50 && star.y < height + 50);

    shootingStars.value = updatedShootingStars;
  });

  // Select gradient based on time of day
  const gradient = useMemo(() => {
    switch (timeOfDay) {
      case 'early':
        return GRADIENTS.nightSkyEarly;
      case 'late':
        return GRADIENTS.nightSkyLate;
      case 'twilight':
        return GRADIENTS.nightSkyTwilight;
      default:
        return GRADIENTS.nightSkyEarly;
    }
  }, [timeOfDay]);

  // Render individual star
  const renderStar = (star: Star) => {
    const twinkle = Math.sin(time.value * star.twinkleSpeed + star.twinklePhase) * 0.5 + 0.5;
    const opacity = star.brightness * twinkle;

    return (
      <Circle
        key={star.id}
        cx={star.x}
        cy={star.y}
        r={star.size}
        color={`rgba(255, 250, 205, ${opacity})`}
      />
    );
  };

  // Render shooting star
  const renderShootingStar = (shootingStar: any, index: number) => {
    const trailLength = 3;
    const points = [];

    for (let i = 0; i < trailLength; i++) {
      points.push({
        x: shootingStar.x - shootingStar.vx * i * 0.01,
        y: shootingStar.y - shootingStar.vy * i * 0.01,
        size: (trailLength - i) / trailLength * 2,
      });
    }

    return (
      <Group key={shootingStar.id}>
        {points.map((point, i) => (
          <Circle
            key={i}
            cx={point.x}
            cy={point.y}
            r={point.size}
            color={`rgba(255, 255, 255, ${shootingStar.life * (1 - i / trailLength) * 0.8})`}
          />
        ))}
      </Group>
    );
  };

  // Render moon
  const renderMoon = () => {
    const moonX = width * 0.8;
    const moonY = height * 0.2;
    const moonRadius = 30;

    return (
      <Group>
        {/* Moon glow */}
        <Circle
          cx={moonX}
          cy={moonY}
          r={moonRadius * 2}
          color="rgba(255, 250, 205, 0.1)"
        />
        <Circle
          cx={moonX}
          cy={moonY}
          r={moonRadius * 1.5}
          color="rgba(255, 250, 205, 0.15)"
        />

        {/* Moon surface */}
        <Circle
          cx={moonX}
          cy={moonY}
          r={moonRadius}
          color="#FFFACD"
        />

        {/* Moon craters */}
        <Circle cx={moonX - 8} cy={moonY - 5} r={3} color="rgba(255, 250, 205, 0.3)" />
        <Circle cx={moonX + 6} cy={moonY + 8} r={2} color="rgba(255, 250, 205, 0.25)" />
        <Circle cx={moonX - 3} cy={moonY + 10} r={1.5} color="rgba(255, 250, 205, 0.2)" />
      </Group>
    );
  };

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={gradient.colors.map(c => c.color)}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Animated stars and celestial objects */}
      <Canvas style={StyleSheet.absoluteFill}>
        <Group>
          {/* Render all stars */}
          {stars.map(renderStar)}

          {/* Render shooting stars */}
          {shootingStars.value.map(renderShootingStar)}

          {/* Render moon */}
          {renderMoon()}
        </Group>
      </Canvas>

      {/* Subtle overlay for depth */}
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 20, 0.1)',
  },
});