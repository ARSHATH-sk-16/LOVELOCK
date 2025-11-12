/**
 * LOVELOCK Animation Service
 *
 * Manages animations, transitions, and visual effects throughout the app.
 */

import { runOnJS, runOnUI, useSharedValue, withTiming, withSpring, withSequence, withRepeat } from 'react-native-reanimated';
import type {
  Particle,
  AnimationTimeline,
  UnlockAnimationConfig,
  Keyframe,
  TransitionConfig,
  Star,
  LightRay,
  HeartParticle,
} from '@/types';

class AnimationService {
  private static instance: AnimationService;
  private activeAnimations: Map<string, any> = new Map();
  private particlePool: Particle[] = [];
  private maxParticles = 50;

  private constructor() {}

  static getInstance(): AnimationService {
    if (!AnimationService.instance) {
      AnimationService.instance = new AnimationService();
    }
    return AnimationService.instance;
  }

  /**
   * Create unlock animation based on mechanism
   */
  createUnlockAnimation(mechanism: 'lampPull' | 'keyTurn' | 'heartsMerge'): UnlockAnimationConfig {
    const baseConfig = {
      duration: 1500,
      particles: [],
      transitions: [],
      hapticPattern: [0, 50, 100],
    };

    switch (mechanism) {
      case 'lampPull':
        return {
          ...baseConfig,
          type: mechanism,
          soundEffect: 'lamp_glow',
          particles: [
            {
              type: 'light',
              count: 20,
              spawnRadius: 50,
              speedRange: { min: 100, max: 300 },
              sizeRange: { min: 4, max: 12 },
              colors: ['#FFD700', '#FFA500', '#FF6347'],
              lifetimeRange: { min: 1000, max: 2000 },
            },
          ],
          transitions: [
            {
              type: 'glow',
              duration: 300,
              delay: 0,
              properties: { intensity: 1 },
            },
            {
              type: 'fade',
              duration: 400,
              delay: 500,
              properties: { opacity: 0 },
            },
          ],
        };

      case 'keyTurn':
        return {
          ...baseConfig,
          type: mechanism,
          soundEffect: 'heart_key_turn',
          particles: [
            {
              type: 'heart',
              count: 15,
              spawnRadius: 40,
              speedRange: { min: 80, max: 250 },
              sizeRange: { min: 6, max: 16 },
              colors: ['#FF69B4', '#FF1493', '#FFB6C1'],
              lifetimeRange: { min: 1200, max: 2200 },
            },
          ],
          transitions: [
            {
              type: 'rotate',
              duration: 400,
              delay: 0,
              properties: { rotation: 360 },
            },
            {
              type: 'scale',
              duration: 300,
              delay: 600,
              properties: { scale: 1.2 },
            },
          ],
        };

      case 'heartsMerge':
        return {
          ...baseConfig,
          type: mechanism,
          soundEffect: 'hearts_touch',
          particles: [
            {
              type: 'heart',
              count: 25,
              spawnRadius: 60,
              speedRange: { min: 150, max: 400 },
              sizeRange: { min: 8, max: 20 },
              colors: ['#FF69B4', '#FFC0CB', '#FFD700', '#FFA500'],
              lifetimeRange: { min: 1500, max: 3000 },
            },
          ],
          transitions: [
            {
              type: 'merge',
              duration: 500,
              delay: 0,
              properties: { mergePoint: { x: 0.5, y: 0.5 } },
            },
            {
              type: 'explode',
              duration: 600,
              delay: 800,
              properties: { radius: 200 },
            },
          ],
        };

      default:
        return baseConfig as UnlockAnimationConfig;
    }
  }

  /**
   * Generate particles for animation
   */
  generateParticles(config: UnlockAnimationConfig['particles'][0], centerX: number, centerY: number): Particle[] {
    const particles: Particle[] = [];
    const { count, spawnRadius, speedRange, sizeRange, colors, lifetimeRange } = config;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const distance = Math.random() * spawnRadius;

      particles.push({
        id: `particle_${Date.now()}_${i}`,
        type: config.type,
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance,
        vx: Math.cos(angle) * (speedRange.min + Math.random() * (speedRange.max - speedRange.min)),
        vy: Math.sin(angle) * (speedRange.min + Math.random() * (speedRange.max - speedRange.min)),
        size: sizeRange.min + Math.random() * (sizeRange.max - sizeRange.min),
        opacity: 1,
        rotation: Math.random() * Math.PI * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        lifetime: 0,
        maxLifetime: lifetimeRange.min + Math.random() * (lifetimeRange.max - lifetimeRange.min),
      });
    }

    return particles;
  }

  /**
   * Update particle positions and properties
   */
  updateParticles(particles: Particle[], deltaTime: number): Particle[] {
    return particles
      .map((particle) => ({
        ...particle,
        x: particle.x + particle.vx * deltaTime / 1000,
        y: particle.vy + particle.vy * deltaTime / 1000,
        vy: particle.vy + 200 * deltaTime / 1000, // Gravity
        lifetime: particle.lifetime + deltaTime,
        opacity: Math.max(0, 1 - particle.lifetime / particle.maxLifetime),
        rotation: particle.rotation + deltaTime * 0.002,
      }))
      .filter((particle) => particle.lifetime < particle.maxLifetime);
  }

  /**
   * Generate stars for night sky background
   */
  generateStars(width: number, height: number, count: number = 100): Star[] {
    const stars: Star[] = [];

    for (let i = 0; i < count; i++) {
      stars.push({
        id: `star_${i}`,
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 3 + 1,
        brightness: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.002 + 0.001,
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }

    return stars;
  }

  /**
   * Update star twinkle animation
   */
  updateStars(stars: Star[], time: number): Star[] {
    return stars.map((star) => ({
      ...star,
      brightness: 0.5 + Math.sin(time * star.twinkleSpeed + star.twinklePhase) * 0.5,
    }));
  }

  /**
   * Generate light rays for glowing lamp effect
   */
  generateLightRays(count: number = 12): LightRay[] {
    const rays: LightRay[] = [];

    for (let i = 0; i < count; i++) {
      rays.push({
        id: `ray_${i}`,
        angle: (Math.PI * 2 * i) / count,
        length: 100 + Math.random() * 50,
        width: 2 + Math.random() * 3,
        opacity: Math.random() * 0.5 + 0.3,
        rotationSpeed: (Math.random() - 0.5) * 0.001,
      });
    }

    return rays;
  }

  /**
   * Update light ray rotation
   */
  updateLightRays(rays: LightRay[], deltaTime: number): LightRay[] {
    return rays.map((ray) => ({
      ...ray,
      angle: ray.angle + ray.rotationSpeed * deltaTime,
    }));
  }

  /**
   * Generate floating heart particles
   */
  generateHeartParticles(width: number, height: number, count: number = 20): HeartParticle[] {
    const hearts: HeartParticle[] = [];
    const colors = ['#FF69B4', '#FF1493', '#FFB6C1', '#FFC0CB'];

    for (let i = 0; i < count; i++) {
      hearts.push({
        id: `heart_${i}`,
        x: Math.random() * width,
        y: height + Math.random() * 100, // Start below screen
        size: 10 + Math.random() * 20,
        opacity: Math.random() * 0.6 + 0.4,
        rotation: Math.random() * Math.PI * 2,
        floatSpeed: 20 + Math.random() * 40,
        floatPhase: Math.random() * Math.PI * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    return hearts;
  }

  /**
   * Update floating heart particles
   */
  updateHeartParticles(hearts: HeartParticle[], deltaTime: number, width: number): HeartParticle[] {
    return hearts
      .map((heart) => ({
        ...heart,
        y: heart.y - heart.floatSpeed * deltaTime / 1000,
        x: heart.x + Math.sin(heart.floatPhase + deltaTime * 0.001) * 30,
        rotation: heart.rotation + deltaTime * 0.001,
      }))
      .filter((heart) => heart.y > -50); // Remove hearts that went off screen
  }

  /**
   * Create animation timeline
   */
  createTimeline(keyframes: Keyframe[]): AnimationTimeline {
    return {
      id: `timeline_${Date.now()}`,
      duration: Math.max(...keyframes.map((kf) => kf.time)) * 1000,
      keyframes,
      easing: 'ease-in-out',
      loop: false,
    };
  }

  /**
   * Get value at specific time in animation timeline
   */
  getTimelineValue(timeline: AnimationTimeline, time: number, property: string): number {
    const normalizedTime = Math.min(time / timeline.duration, 1);

    // Find surrounding keyframes
    const keyframes = timeline.keyframes
      .filter((kf) => property in kf.properties)
      .sort((a, b) => a.time - b.time);

    if (keyframes.length === 0) return 0;
    if (normalizedTime <= keyframes[0].time) return keyframes[0].properties[property] as number;
    if (normalizedTime >= keyframes[keyframes.length - 1].time) {
      return keyframes[keyframes.length - 1].properties[property] as number;
    }

    // Interpolate between keyframes
    for (let i = 0; i < keyframes.length - 1; i++) {
      const current = keyframes[i];
      const next = keyframes[i + 1];

      if (normalizedTime >= current.time && normalizedTime <= next.time) {
        const progress = (normalizedTime - current.time) / (next.time - current.time);
        const currentValue = current.properties[property] as number;
        const nextValue = next.properties[property] as number;
        return currentValue + (nextValue - currentValue) * progress;
      }
    }

    return 0;
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.activeAnimations.clear();
    this.particlePool = [];
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): {
    activeAnimationsCount: number;
    particlesInPool: number;
    maxParticlesReached: boolean;
  } {
    return {
      activeAnimationsCount: this.activeAnimations.size,
      particlesInPool: this.particlePool.length,
      maxParticlesReached: this.particlePool.length >= this.maxParticles,
    };
  }
}

// Create and export singleton instance
export const animationService = AnimationService.getInstance();
export default animationService;