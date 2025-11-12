/**
 * LOVELOCK Glowing Lamp Background Component
 *
 * Soft, warm glowing effect with animated light rays and gentle pulsing.
 */

import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Canvas, Group, Circle, Rect, useSharedValue, useFrameCallback } from '@shopify/react-native-skia';
import { LinearGradient } from 'react-native-linear-gradient';
import { useWindowDimensions } from 'react-native';
import type { LightRay } from '@/types';
import { GRADIENTS, GLOWING_LAMP_ANIMATION_CONFIG } from '@/utils';

interface GlowingLampBackgroundProps {
  intensity?: number;
  pulseEnabled?: boolean;
  particleCount?: number;
  colorTemperature?: 'warm' | 'neutral' | 'cool';
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const GlowingLampBackground: React.FC<GlowingLampBackgroundProps> = ({
  intensity = 0.8,
  pulseEnabled = true,
  particleCount = GLOWING_LAMP_ANIMATION_CONFIG.particleCount,
  colorTemperature = 'warm',
}) => {
  const { width, height } = useWindowDimensions();
  const time = useSharedValue(0);
  const particles = useSharedValue<Array<{
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
    life: number;
  }>>([]);

  // Light rays configuration
  const lightRays = useMemo<LightRay[]>(() => {
    const rays: LightRay[] = [];
    const rayCount = GLOWING_LAMP_ANIMATION_CONFIG.rayCount;

    for (let i = 0; i < rayCount; i++) {
      rays.push({
        id: `ray_${i}`,
        angle: (Math.PI * 2 * i) / rayCount,
        length: 100 + Math.random() * 80,
        width: 2 + Math.random() * 4,
        opacity: 0.3 + Math.random() * 0.4,
        rotationSpeed: (Math.random() - 0.5) * GLOWING_LAMP_ANIMATION_CONFIG.rayRotationSpeed,
      });
    }
    return rays;
  }, []);

  // Color configuration based on temperature
  const colors = useMemo(() => {
    switch (colorTemperature) {
      case 'warm':
        return {
          primary: '#FFD700',
          secondary: '#FFA500',
          ambient: '#FF8C00',
          particles: '#FFB347',
          background: ['#2C1810', '#3D2817', '#4A2C1A'],
        };
      case 'neutral':
        return {
          primary: '#F0E68C',
          secondary: '#DAA520',
          ambient: '#B8860B',
          particles: '#FFD700',
          background: ['#2A2A2A', '#3A3A3A', '#4A4A4A'],
        };
      case 'cool':
        return {
          primary: '#87CEEB',
          secondary: '#4682B4',
          ambient: '#1E90FF',
          particles: '#B0E0E6',
          background: ['#1A2332', '#243447', '#2E455C'],
        };
      default:
        return {
          primary: '#FFD700',
          secondary: '#FFA500',
          ambient: '#FF8C00',
          particles: '#FFB347',
          background: ['#2C1810', '#3D2817', '#4A2C1A'],
        };
    }
  }, [colorTemperature]);

  // Initialize particles
  useEffect(() => {
    const initialParticles: any[] = [];
    for (let i = 0; i < particleCount; i++) {
      initialParticles.push({
        id: i,
        x: width / 2 + (Math.random() - 0.5) * 100,
        y: height / 2 + (Math.random() - 0.5) * 100,
        vx: (Math.random() - 0.5) * 20,
        vy: (Math.random() - 0.5) * 20,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.3,
        life: Math.random() * 2 + 1, // 1-3 seconds
      });
    }
    particles.value = initialParticles;
  }, [particleCount, width, height, particles]);

  // Animation frame callback
  useFrameCallback((frameInfo) => {
    const { timeMs } = frameInfo;
    time.value = timeMs * 0.001; // Convert to seconds

    // Update particles
    const currentParticles = particles.value;
    const deltaTime = 0.016; // ~60fps

    const updatedParticles = currentParticles.map(particle => {
      let newX = particle.x + particle.vx * deltaTime;
      let newY = particle.y + particle.vy * deltaTime;
      let newVx = particle.vx;
      let newVy = particle.vy;

      // Add some floating movement
      newVx += Math.sin(time.value * 0.001 + particle.id) * 0.5;
      newVy += Math.cos(time.value * 0.001 + particle.id) * 0.5;

      // Apply some damping
      newVx *= 0.98;
      newVy *= 0.98;

      // Keep particles near center
      const centerX = width / 2;
      const centerY = height / 2;
      const maxDistance = 150;

      const dx = newX - centerX;
      const dy = newY - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > maxDistance) {
        const angle = Math.atan2(dy, dx);
        newVx -= Math.cos(angle) * 5;
        newVy -= Math.sin(angle) * 5;
      }

      return {
        ...particle,
        x: newX,
        y: newY,
        vx: newVx,
        vy: newVy,
        life: particle.life - deltaTime * 0.3, // Fade over time
      };
    });

    particles.value = updatedParticles;
  });

  // Calculate pulsing intensity
  const getPulseIntensity = () => {
    if (!pulseEnabled) return intensity;
    const pulse = Math.sin(time.value * 0.002) * 0.2 + 0.8; // 0.6 to 1.0
    return intensity * pulse;
  };

  // Render light ray
  const renderLightRay = (ray: LightRay) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const currentAngle = ray.angle + time.value * ray.rotationSpeed;
    const pulseIntensity = getPulseIntensity();

    return (
      <Group key={ray.id} transform={[
        { translateX: centerX },
        { translateY: centerY },
        { rotate: currentAngle },
      ]}>
        <Rect
          x={0}
          y={-ray.width / 2}
          width={ray.length * pulseIntensity}
          height={ray.width}
          color={colors.primary}
          opacity={ray.opacity * pulseIntensity}
        />
      </Group>
    );
  };

  // Render floating particle
  const renderParticle = (particle: any, index: number) => {
    const pulseIntensity = getPulseIntensity();

    return (
      <Circle
        key={particle.id}
        cx={particle.x}
        cy={particle.y}
        r={particle.size * pulseIntensity}
        color={colors.particles}
        opacity={particle.opacity * pulseIntensity * Math.max(0, particle.life)}
      />
    );
  };

  // Render central lamp glow
  const renderLampGlow = () => {
    const centerX = width / 2;
    const centerY = height / 2;
    const pulseIntensity = getPulseIntensity();

    return (
      <Group>
        {/* Outer glow */}
        <Circle
          cx={centerX}
          cy={centerY}
          r={200 * pulseIntensity}
          color={colors.primary}
          opacity={0.1}
        />
        <Circle
          cx={centerX}
          cy={centerY}
          r={150 * pulseIntensity}
          color={colors.secondary}
          opacity={0.15}
        />
        <Circle
          cx={centerX}
          cy={centerY}
          r={100 * pulseIntensity}
          color={colors.ambient}
          opacity={0.2}
        />

        {/* Core glow */}
        <Circle
          cx={centerX}
          cy={centerY}
          r={60 * pulseIntensity}
          color={colors.primary}
          opacity={0.3}
        />
        <Circle
          cx={centerX}
          cy={centerY}
          r={40 * pulseIntensity}
          color={colors.secondary}
          opacity={0.5}
        />
        <Circle
          cx={centerX}
          cy={centerY}
          r={25 * pulseIntensity}
          color={colors.primary}
          opacity={0.8}
        />

        {/* Bright center */}
        <Circle
          cx={centerX}
          cy={centerY}
          r={15 * pulseIntensity}
          color="#FFFFFF"
          opacity={0.9}
        />
      </Group>
    );
  };

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={colors.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Animated light effects */}
      <Canvas style={StyleSheet.absoluteFill}>
        <Group blendMode="screen">
          {/* Render light rays */}
          {lightRays.map(renderLightRay)}

          {/* Render central lamp glow */}
          {renderLampGlow()}

          {/* Render floating particles */}
          {particles.value.map(renderParticle)}
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
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
});