/**
 * LOVELOCK Unlock Animation Hook
 *
 * Hook for managing unlock animations and particle effects.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { runOnJS } from 'react-native-reanimated';
import { useLockStore } from '@/store';
import { animationService } from '@/services';
import type {
  UnlockAnimationConfig,
  Particle,
  Star,
  LightRay,
  HeartParticle,
  UnlockMechanism,
} from '@/types';

interface UseUnlockAnimationReturn {
  isAnimating: boolean;
  animationProgress: number;
  particles: Particle[];
  showUnlockEffect: boolean;
  startUnlockAnimation: (mechanism: UnlockMechanism) => void;
  resetAnimation: () => void;
  getBackgroundElements: () => {
    stars: Star[];
    lightRays: LightRay[];
    heartParticles: HeartParticle[];
  };
}

export const useUnlockAnimation = (): UseUnlockAnimationReturn => {
  const {
    currentMechanism,
    currentBackground,
    updateAnimationState,
    lampCordState,
    heartKeyState,
    touchingHeartsState,
  } = useLockStore();

  const [isAnimating, setIsAnimating] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showUnlockEffect, setShowUnlockEffect] = useState(false);

  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const animationConfigRef = useRef<UnlockAnimationConfig | null>(null);

  // Generate background elements
  const getBackgroundElements = useCallback(() => {
    const stars = animationService.generateStars(400, 800, 100);
    const lightRays = currentBackground === 'glowingLamp' ?
                     animationService.generateLightRays(12) : [];
    const heartParticles = currentBackground === 'heartParticles' ?
                          animationService.generateHeartParticles(400, 800, 20) : [];

    return { stars, lightRays, heartParticles };
  }, [currentBackground]);

  // Start unlock animation
  const startUnlockAnimation = useCallback((mechanism: UnlockMechanism) => {
    if (isAnimating) return;

    setIsAnimating(true);
    setAnimationProgress(0);
    setShowUnlockEffect(true);
    startTimeRef.current = Date.now();

    // Get animation configuration
    const config = animationService.createUnlockAnimation(mechanism);
    animationConfigRef.current = config;

    // Generate initial particles
    const centerX = 200; // Screen center x
    const centerY = 400; // Screen center y
    const initialParticles = config.particles.flatMap(particleConfig =>
      animationService.generateParticles(particleConfig, centerX, centerY)
    );

    setParticles(initialParticles);

    // Update animation state
    updateAnimationState({
      isAnimating: true,
      animationType: 'success',
      progress: 0,
      particlesVisible: true,
    });

    // Start animation loop
    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTimeRef.current;
      const config = animationConfigRef.current;

      if (!config) return;

      const progress = Math.min(elapsed / config.duration, 1);
      setAnimationProgress(progress);

      // Update particles
      if (particles.length > 0) {
        const deltaTime = 16; // ~60fps
        const updatedParticles = animationService.updateParticles(particles, deltaTime);
        setParticles(updatedParticles);
      }

      // Continue animation or complete
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Animation complete
        completeAnimation();
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [isAnimating, particles, updateAnimationState]);

  // Complete animation
  const completeAnimation = useCallback(() => {
    setIsAnimating(false);
    setShowUnlockEffect(false);
    setParticles([]);

    updateAnimationState({
      isAnimating: false,
      animationType: null,
      progress: 1,
      particlesVisible: false,
    });

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, [updateAnimationState]);

  // Reset animation state
  const resetAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    setIsAnimating(false);
    setAnimationProgress(0);
    setParticles([]);
    setShowUnlockEffect(false);

    updateAnimationState({
      isAnimating: false,
      animationType: null,
      progress: 0,
      particlesVisible: false,
    });
  }, [updateAnimationState]);

  // Auto-start animation based on mechanism state
  useEffect(() => {
    switch (currentMechanism) {
      case 'lampCord':
        if (lampCordState.pullDistance >= 150 && lampCordState.velocity > 500) {
          startUnlockAnimation('lampPull');
        }
        break;

      case 'heartKey':
        if (heartKeyState.rotation >= 270) {
          startUnlockAnimation('keyTurn');
        }
        break;

      case 'touchingHearts':
        if (touchingHeartsState.distance <= 50) {
          startUnlockAnimation('heartsMerge');
        }
        break;
    }
  }, [
    currentMechanism,
    lampCordState.pullDistance,
    lampCordState.velocity,
    heartKeyState.rotation,
    touchingHeartsState.distance,
    startUnlockAnimation,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return {
    isAnimating,
    animationProgress,
    particles,
    showUnlockEffect,
    startUnlockAnimation,
    resetAnimation,
    getBackgroundElements,
  };
};