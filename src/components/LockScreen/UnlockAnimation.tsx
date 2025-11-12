/**
 * LOVELOCK Unlock Animation Component
 *
 * Smooth screen transition with particle effects and blur effects.
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';
import { BlurView } from 'react-native-blur';
import { useUnlockAnimation } from '@/hooks';
import { Canvas, Group, Circle, useSharedValue, useFrameCallback } from '@shopify/react-native-skia';
import type { Particle } from '@/types';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface UnlockAnimationProps {
  isVisible: boolean;
  onComplete?: () => void;
  mechanism: 'lampPull' | 'keyTurn' | 'heartsMerge';
}

export const UnlockAnimation: React.FC<UnlockAnimationProps> = ({
  isVisible,
  onComplete,
  mechanism,
}) => {
  const {
    isAnimating,
    animationProgress,
    particles,
    showUnlockEffect,
    startUnlockAnimation,
  } = useUnlockAnimation();

  const fadeOpacity = useRef(new Animated.Value(0)).current;
  const blurRadius = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;
  const time = useSharedValue(0);

  // Start animation when visible
  useEffect(() => {
    if (isVisible && !isAnimating) {
      startUnlockAnimation(mechanism);
    }
  }, [isVisible, isAnimating, mechanism, startUnlockAnimation]);

  // Run animation sequence
  useEffect(() => {
    if (showUnlockEffect) {
      Animated.sequence([
        // Stage 1: Success feedback (300ms)
        Animated.parallel([
          Animated.timing(fadeOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(scaleValue, {
            toValue: 1.1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        // Stage 2: Blur transition (400ms)
        Animated.parallel([
          Animated.timing(blurRadius, {
            toValue: 15,
            duration: 400,
            useNativeDriver: false, // Blur doesn't support native driver
          }),
          Animated.timing(fadeOpacity, {
            toValue: 0.5,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        // Stage 3: Final transition (300ms)
        Animated.parallel([
          Animated.timing(scaleValue, {
            toValue: 1.5,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(fadeOpacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        onComplete?.();
      });
    }
  }, [showUnlockEffect, fadeOpacity, blurRadius, scaleValue, onComplete]);

  // Animation frame callback for particles
  useFrameCallback((frameInfo) => {
    time.value = frameInfo.timeMs * 0.001; // Convert to seconds
  });

  // Render individual particle
  const renderParticle = (particle: Particle) => {
    const opacity = particle.opacity * (1 - animationProgress); // Fade out over time
    const scale = 1 + animationProgress * 0.5; // Slight scale increase

    return (
      <Circle
        key={particle.id}
        cx={particle.x + particle.vx * time.value}
        cy={particle.y + particle.vy * time.value + 100 * time.value * time.value} // Add gravity
        r={particle.size * scale}
        color={particle.color}
        opacity={opacity}
      />
    );
  };

  // Render mechanism-specific effects
  const renderMechanismEffects = () => {
    switch (mechanism) {
      case 'lampPull':
        return (
          <Group>
            {/* Light rays from center */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
              <Group key={`ray-${angle}`} transform={[
                { translateX: screenWidth / 2 },
                { translateY: screenHeight / 2 },
                { rotate: (angle + time.value * 60) * Math.PI / 180 },
              ]}>
                <Circle
                  cx={0}
                  cy={0}
                  r={4}
                  color="#FFD700"
                  opacity={0.6 * (1 - animationProgress)}
                />
              </Group>
            ))}
          </Group>
        );

      case 'keyTurn':
        return (
          <Group>
            {/* Rotating hearts */}
            {[0, 120, 240].map((angle, index) => (
              <Group key={`heart-${index}`} transform={[
                { translateX: screenWidth / 2 },
                { translateY: screenHeight / 2 },
                { rotate: (angle + time.value * 120) * Math.PI / 180 },
                { translateX: 100 * animationProgress },
              ]}>
                <Circle
                  cx={0}
                  cy={0}
                  r={8}
                  color="#FF69B4"
                  opacity={0.7 * (1 - animationProgress)}
                />
              </Group>
            ))}
          </Group>
        );

      case 'heartsMerge':
        return (
          <Group>
            {/* Heart burst from center */}
            {Array.from({ length: 12 }).map((_, index) => {
              const angle = (index * 30) * Math.PI / 180;
              const distance = 50 + animationProgress * 200;
              return (
                <Group key={`burst-${index}`} transform={[
                  { translateX: screenWidth / 2 + Math.cos(angle) * distance },
                  { translateY: screenHeight / 2 + Math.sin(angle) * distance },
                ]}>
                  <Circle
                    cx={0}
                    cy={0}
                    r={6 + animationProgress * 4}
                    color="#FF1493"
                    opacity={(1 - animationProgress) * 0.8}
                  />
                </Group>
              );
            })}
          </Group>
        );

      default:
        return null;
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Animated particles overlay */}
      <View style={StyleSheet.absoluteFill}>
        <Canvas style={StyleSheet.absoluteFill}>
          <Group>
            {/* Render particles */}
            {particles.map(renderParticle)}

            {/* Render mechanism-specific effects */}
            {renderMechanismEffects()}
          </Group>
        </Canvas>
      </View>

      {/* Blur and fade effect */}
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: fadeOpacity,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.blurContainer,
            {
              transform: [{ scale: scaleValue }],
            },
          ]}
        >
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="light"
            blurAmount={blurRadius.value}
            reducedTransparencyFallbackColor="rgba(255, 255, 255, 0.1)"
          />
        </Animated.View>
      </Animated.View>

      {/* Success flash effect */}
      {showUnlockEffect && (
        <Animated.View
          style={[
            styles.flashEffect,
            {
              opacity: Animated.multiply(
                fadeOpacity,
                new Animated.Value(0.3)
              ),
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  blurContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  flashEffect: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFD700',
  },
});