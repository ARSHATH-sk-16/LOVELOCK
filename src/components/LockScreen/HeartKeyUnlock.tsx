/**
 * LOVELOCK Heart Key Unlock Component
 *
 * User rotates a heart-shaped key in a heart-shaped lock to unlock the screen.
 */

import React, { useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';
import { RotationGestureHandler, State } from 'react-native-gesture-handler';
import { useGestureDetection } from '@/hooks';
import { useLockStore } from '@/store';
import { Svg, Path, Circle, G } from 'react-native-svg';

interface HeartKeyUnlockProps {
  onUnlockSuccess?: () => void;
  onUnlockFailure?: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const UNLOCK_ROTATION = 270; // degrees to unlock

export const HeartKeyUnlock: React.FC<HeartKeyUnlockProps> = ({
  onUnlockSuccess,
  onUnlockFailure,
}) => {
  const {
    heartKeyState,
    updateHeartKeyState,
    settings,
  } = useLockStore();

  const lockGlow = useRef(new Animated.Value(0)).current;
  const keyRotation = useRef(new Animated.Value(0)).current;
  const heartbeatScale = useRef(new Animated.Value(1)).current;

  // Setup gesture detection
  const [gestureHandlers, metrics, isGestureActive] = useGestureDetection({
    mechanism: 'heartKey',
    onGestureStart: () => {
      updateHeartKeyState({ isRotating: true });
      startHeartbeat();
    },
    onGestureUpdate: (gestureMetrics) => {
      // Animate key rotation visually
      const rotationAngle = Math.min(360, gestureMetrics.rotationDegrees);
      Animated.timing(keyRotation, {
        toValue: rotationAngle,
        duration: 50,
        useNativeDriver: true,
      }).start();

      // Animate lock glow based on rotation progress
      const progress = Math.min(1, rotationAngle / UNLOCK_ROTATION);
      Animated.timing(lockGlow, {
        toValue: progress,
        duration: 100,
        useNativeDriver: true,
      }).start();
    },
    onGestureComplete: (success, gestureMetrics) => {
      updateHeartKeyState({ isRotating: false });
      stopHeartbeat();

      if (success) {
        // Success animation
        Animated.sequence([
          Animated.timing(lockGlow, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(keyRotation, {
            toValue: 360,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();

        onUnlockSuccess?.();
      } else {
        // Failure animation - spring back
        Animated.spring(keyRotation, {
          toValue: 0,
          friction: 6,
          tension: 100,
          useNativeDriver: true,
        }).start();

        Animated.timing(lockGlow, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();

        onUnlockFailure?.();
      }
    },
  });

  // Heartbeat animation
  const heartbeatAnimation = useRef<Animated.CompositeAnimation | null>(null);

  const startHeartbeat = () => {
    heartbeatAnimation.current = Animated.loop(
      Animated.sequence([
        Animated.timing(heartbeatScale, {
          toValue: 1.1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(heartbeatScale, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ])
    );
    heartbeatAnimation.current.start();
  };

  const stopHeartbeat = () => {
    if (heartbeatAnimation.current) {
      heartbeatAnimation.current.stop();
      heartbeatAnimation.current = null;
    }
    Animated.timing(heartbeatScale, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  // Generate heart shape path
  const generateHeartPath = (centerX: number, centerY: number, size: number) => {
    return `
      M ${centerX} ${centerY + size * 0.3}
      C ${centerX - size * 0.5} ${centerY - size * 0.3}, ${centerX - size * 0.5} ${centerY + size * 0.1},
        ${centerX} ${centerY + size * 0.6}
      C ${centerX + size * 0.5} ${centerY + size * 0.1}, ${centerX + size * 0.5} ${centerY - size * 0.3},
        ${centerX} ${centerY + size * 0.3}
    `;
  };

  // Generate key shape
  const generateKeyPath = (centerX: number, centerY: number, size: number) => {
    const heartSize = size * 0.4;
    return `
      M ${centerX} ${centerY - heartSize}
      C ${centerX - heartSize * 0.5} ${centerY - heartSize * 1.3}, ${centerX - heartSize * 0.5} ${centerY - heartSize * 0.7},
        ${centerX} ${centerY}
      C ${centerX + heartSize * 0.5} ${centerY - heartSize * 0.7}, ${centerX + heartSize * 0.5} ${centerY - heartSize * 1.3},
        ${centerX} ${centerY - heartSize}
      L ${centerX} ${centerY + size * 0.2}
      L ${centerX - size * 0.1} ${centerY + size * 0.2}
      L ${centerX - size * 0.1} ${centerY + size * 0.3}
      L ${centerX + size * 0.1} ${centerY + size * 0.3}
      L ${centerX + size * 0.1} ${centerY + size * 0.2}
    `;
  };

  // Render heart lock
  const renderHeartLock = () => {
    const centerX = screenWidth / 2;
    const centerY = screenHeight / 2 - 50;
    const lockSize = 80;

    return (
      <Animated.View style={[
        styles.lockContainer,
        {
          transform: [
            { scale: heartbeatScale },
          ],
        },
      ]}>
        {/* Lock glow effect */}
        <Animated.View
          style={[
            styles.lockGlow,
            {
              opacity: lockGlow.value * 0.4,
              transform: [
                { scale: 1 + lockGlow.value * 0.3 },
              ],
            },
          ]}
        />

        <Svg
          width={lockSize * 2}
          height={lockSize * 2}
          viewBox="0 0 160 160"
          style={styles.lockSvg}
        >
          {/* Outer lock ring */}
          <Circle
            cx="80"
            cy="80"
            r="75"
            fill="none"
            stroke="#CD853F"
            strokeWidth="8"
          />

          {/* Inner decorative ring */}
          <Circle
            cx="80"
            cy="80"
            r="65"
            fill="none"
            stroke="#DEB887"
            strokeWidth="2"
            opacity={0.6}
          />

          {/* Heart lock shape */}
          <Path
            d={generateHeartPath(80, 80, 50)}
            fill="none"
            stroke="#CD853F"
            strokeWidth="6"
          />

          {/* Lock tumblers/teeth */}
          {[0, 90, 180, 270].map((angle, index) => (
            <G
              key={`tumbler-${index}`}
              transform={`rotate(${angle} 80 80)`}
            >
              <Circle
                cx="80"
                cy="25"
                r="4"
                fill="#8B4513"
                opacity={0.8}
              />
              {heartKeyState.rotation > angle * 0.8 && (
                <Circle
                  cx="80"
                  cy="25"
                  r="6"
                  fill="#FFD700"
                  opacity={0.6 + lockGlow.value * 0.4}
                />
              )}
            </G>
          ))}

          {/* Center decoration */}
          <Circle
            cx="80"
            cy="80"
            r="12"
            fill="#DEB887"
            stroke="#CD853F"
            strokeWidth="2"
          />

          {/* Glow effect for success */}
          <Animated.Circle
            cx="80"
            cy="80"
            r="20"
            fill="none"
            stroke="#FFD700"
            strokeWidth="2"
            opacity={lockGlow.value}
          />
        </Svg>
      </Animated.View>
    );
  };

  // Render heart key
  const renderHeartKey = () => {
    const centerX = screenWidth / 2;
    const centerY = screenHeight / 2 + 100;
    const keySize = 60;

    return (
      <Animated.View
        style={[
          styles.keyContainer,
          {
            transform: [
              { rotate: `${keyRotation.value}deg` },
              { scale: heartbeatScale },
            ],
          },
        ]}
      >
        {/* Key shadow */}
        <View style={[styles.keyShadow, { top: 4, left: 4 }]} />

        <Svg
          width={keySize * 2}
          height={keySize * 3}
          viewBox="0 0 120 180"
          style={styles.keySvg}
        >
          {/* Key body */}
          <Path
            d={generateKeyPath(60, 60, 40)}
            fill="#FFD700"
            stroke="#B8860B"
            strokeWidth="3"
          />

          {/* Key details */}
          <Path
            d={generateKeyPath(60, 60, 40)}
            fill="none"
            stroke="#FFA500"
            strokeWidth="1"
            opacity={0.6}
          />

          {/* Heart shine effect */}
          <Path
            d={generateHeartPath(60, 50, 20)}
            fill="none"
            stroke="#FFFFE0"
            strokeWidth="2"
            opacity={0.4 + lockGlow.value * 0.3}
          />

          {/* Key teeth details */}
          {[0, 1, 2].map((index) => (
            <Rect
              key={`tooth-${index}`}
              x={60 - 10}
              y={100 + index * 15}
              width={20}
              height={8}
              fill="#FFD700"
              stroke="#B8860B"
              strokeWidth="1"
              rx={2}
            />
          ))}
        </Svg>

        {/* Rotation indicator when active */}
        {isGestureActive && (
          <View style={styles.rotationIndicator}>
            <View style={styles.rotationArc} />
          </View>
        )}
      </Animated.View>
    );
  };

  // Render progress indicator
  const renderProgressIndicator = () => {
    const progress = Math.min(1, heartKeyState.rotation / UNLOCK_ROTATION);
    const showIndicator = progress > 0.1;

    if (!showIndicator) return null;

    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: `${progress * 100}%`,
                backgroundColor: progress >= 1 ? '#4CAF50' : '#FFD700',
              },
            ]}
          />
        </View>
        <Animated.Text
          style={[
            styles.progressText,
            {
              color: progress >= 1 ? '#4CAF50' : '#FFD700',
              opacity: progress,
            },
          ]}
        >
          {progress >= 1 ? 'Release to Unlock!' : `${Math.round(progress * 100)}°`}
        </Animated.Text>
      </View>
    );
  };

  // Render visual feedback
  const renderVisualFeedback = () => {
    if (!heartKeyState.isRotating && heartKeyState.rotation === 0) {
      return (
        <View style={styles.instructionContainer}>
          <Animated.Text style={styles.instructionText}>
            Rotate the heart key to unlock
          </Animated.Text>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      {/* Heart lock */}
      {renderHeartLock()}

      {/* Heart key */}
      {renderHeartKey()}

      {/* Gesture handler */}
      <RotationGestureHandler
        onGestureEvent={gestureHandlers.onRotationGestureEvent}
        onHandlerStateChange={gestureHandlers.onRotationHandlerStateChange}
      >
        <Animated.View style={styles.gestureArea} />
      </RotationGestureHandler>

      {/* UI elements */}
      {renderProgressIndicator()}
      {renderVisualFeedback()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: screenWidth,
    height: screenHeight,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  lockContainer: {
    position: 'absolute',
    top: screenHeight / 2 - 130,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockSvg: {
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 8,
  },
  lockGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#FFD700',
    top: -60,
    left: -40,
  },
  keyContainer: {
    position: 'absolute',
    top: screenHeight / 2 + 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keySvg: {
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 12,
  },
  keyShadow: {
    position: 'absolute',
    width: 100,
    height: 150,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
  },
  rotationIndicator: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: '#FFD700',
    opacity: 0.3,
    borderStyle: 'dashed',
  },
  rotationArc: {
    position: 'absolute',
    top: -5,
    left: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFD700',
    opacity: 0.6,
  },
  gestureArea: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 100,
    left: 40,
    right: 40,
    alignItems: 'center',
    zIndex: 5,
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 16,
    fontFamily: 'romantic',
    textAlign: 'center',
    fontWeight: '600',
  },
  instructionContainer: {
    position: 'absolute',
    bottom: 120,
    left: 40,
    right: 40,
    alignItems: 'center',
    zIndex: 5,
  },
  instructionText: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'romantic',
    fontWeight: '400',
    opacity: 0.8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});