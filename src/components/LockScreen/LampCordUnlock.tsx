/**
 * LOVELOCK Lamp Cord Unlock Component
 *
 * User pulls down on a lamp cord, lamp glows brighter as cord extends,
 * then screen unlocks with smooth transition.
 */

import React, { useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { useGestureDetection } from '@/hooks';
import { useLockStore } from '@/store';
import { Svg, Path, Circle, G } from 'react-native-svg';

interface LampCordUnlockProps {
  onUnlockSuccess?: () => void;
  onUnlockFailure?: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const UNLOCK_THRESHOLD = 150; // pixels to pull
const LAMP_Y = 200; // Lamp position
const CORD_START_Y = LAMP_Y + 80; // Where cord starts

export const LampCordUnlock: React.FC<LampCordUnlockProps> = ({
  onUnlockSuccess,
  onUnlockFailure,
}) => {
  const {
    lampCordState,
    updateLampCordState,
    settings,
  } = useLockStore();

  const lampGlow = useRef(new Animated.Value(0.3)).current;
  const cordTension = useRef(new Animated.Value(0)).current;

  // Setup gesture detection
  const [gestureHandlers, metrics, isGestureActive] = useGestureDetection({
    mechanism: 'lampCord',
    onGestureStart: () => {
      updateLampCordState({ isPulling: true });
    },
    onGestureUpdate: (gestureMetrics) => {
      // Animate lamp glow based on pull distance
      const brightness = Math.min(1, gestureMetrics.pullDistance / 200);
      Animated.timing(lampGlow, {
        toValue: 0.3 + (brightness * 0.7),
        duration: 100,
        useNativeDriver: true,
      }).start();

      // Animate cord tension
      const tension = Math.min(1, gestureMetrics.pullDistance / UNLOCK_THRESHOLD);
      Animated.spring(cordTension, {
        toValue: tension,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
    },
    onGestureComplete: (success, gestureMetrics) => {
      updateLampCordState({ isPulling: false, velocity: 0 });

      if (success) {
        // Success animation
        Animated.sequence([
          Animated.timing(lampGlow, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(lampGlow, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start();

        onUnlockSuccess?.();
      } else {
        // Failure animation - spring back
        Animated.spring(cordTension, {
          toValue: 0,
          friction: 6,
          tension: 100,
          useNativeDriver: true,
        }).start();

        Animated.timing(lampGlow, {
          toValue: 0.3,
          duration: 300,
          useNativeDriver: true,
        }).start();

        onUnlockFailure?.();
      }
    },
  });

  // Calculate cord path based on pull distance
  const generateCordPath = (pullDistance: number) => {
    const cordY = CORD_START_Y + pullDistance;
    const sagAmount = Math.min(20, pullDistance * 0.1); // Natural sag
    const swayAmount = Math.sin(Date.now() * 0.001) * 5; // Gentle sway

    // Create curved cord path
    const path = `
      M ${screenWidth/2 + swayAmount} ${LAMP_Y + 80}
      Q ${screenWidth/2 + swayAmount + sagAmount} ${(LAMP_Y + 80 + cordY) / 2}
        ${screenWidth/2 + swayAmount * 0.5} ${cordY}
    `;

    return path.trim();
  };

  // Render lamp body
  const renderLamp = () => {
    const glowOpacity = lampGlow.value;
    const lampSize = 60;

    return (
      <Animated.View style={[styles.lampContainer, { opacity: glowOpacity }]}>
        {/* Lamp glow effect */}
        <Animated.View
          style={[
            styles.lampGlow,
            {
              opacity: glowOpacity * 0.3,
              transform: [
                { scale: 1 + glowOpacity * 0.5 },
              ],
            },
          ]}
        />

        {/* Lamp shade */}
        <Svg
          width={lampSize}
          height={lampSize}
          viewBox="0 0 60 60"
          style={styles.lampShade}
        >
          {/* Lamp shade shape */}
          <Path
            d="M 15 20 Q 30 10 45 20 L 40 40 Q 30 45 20 40 Z"
            fill="#FFD700"
            stroke="#FFA500"
            strokeWidth="2"
            opacity={0.9}
          />

          {/* Lamp bulb */}
          <Circle
            cx="30"
            cy="35"
            r="8"
            fill="#FFFFE0"
            opacity={0.95 + glowOpacity * 0.05}
          />

          {/* Bulb glow */}
          <Circle
            cx="30"
            cy="35"
            r="12"
            fill="none"
            stroke="#FFD700"
            strokeWidth="1"
            opacity={glowOpacity * 0.5}
          />
        </Svg>

        {/* Cord attachment point */}
        <View style={styles.cordAttachment} />
      </Animated.View>
    );
  };

  // Render cord
  const renderCord = () => {
    const pullDistance = lampCordState.pullDistance;
    const cordY = CORD_START_Y + pullDistance;
    const tension = cordTension.value;

    return (
      <Svg
        width={screenWidth}
        height={screenHeight}
        style={StyleSheet.absoluteFill}
      >
        {/* Cord shadow for depth */}
        <Path
          d={generateCordPath(pullDistance + 2)}
          stroke="rgba(0, 0, 0, 0.2)"
          strokeWidth="3"
          fill="none"
        />

        {/* Main cord */}
        <Path
          d={generateCordPath(pullDistance)}
          stroke="#8B4513"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />

        {/* Cord highlight */}
        <Path
          d={generateCordPath(pullDistance - 1)}
          stroke="#D2691E"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          opacity={0.6}
        />

        {/* Cord pull handle */}
        <G transform={`translate(${screenWidth/2}, ${cordY})`}>
          {/* Handle shadow */}
          <Circle
            cx="1"
            cy="1"
            r="12"
            fill="rgba(0, 0, 0, 0.3)"
          />

          {/* Handle body */}
          <Circle
            cx="0"
            cy="0"
            r="12"
            fill="#CD853F"
            stroke="#8B4513"
            strokeWidth="2"
          />

          {/* Handle highlight */}
          <Circle
            cx="-3"
            cy="-3"
            r="4"
            fill="#DEB887"
            opacity={0.7}
          />

          {/* Pull indicator */}
          {isGestureActive && (
            <Circle
              cx="0"
              cy="0"
              r="16"
              fill="none"
              stroke="#FFD700"
              strokeWidth="2"
              opacity={0.6}
            />
          )}
        </G>
      </Svg>
    );
  };

  // Render progress indicator
  const renderProgressIndicator = () => {
    const progress = Math.min(1, lampCordState.pullDistance / UNLOCK_THRESHOLD);
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
          {progress >= 1 ? 'Release to Unlock!' : 'Pull Down...'}
        </Animated.Text>
      </View>
    );
  };

  // Render visual feedback
  const renderVisualFeedback = () => {
    if (!lampCordState.isPulling && lampCordState.pullDistance === 0) {
      return (
        <View style={styles.instructionContainer}>
          <Animated.Text style={styles.instructionText}>
            Pull the lamp cord to unlock
          </Animated.Text>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      {/* Lamp and cord */}
      <View style={styles.lampAndCordContainer}>
        {renderLamp()}
        {renderCord()}
      </View>

      {/* Gesture handler */}
      <PanGestureHandler
        onGestureEvent={gestureHandlers.onPanGestureEvent}
        onHandlerStateChange={gestureHandlers.onPanHandlerStateChange}
      >
        <Animated.View style={styles.gestureArea} />
      </PanGestureHandler>

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
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  lampAndCordContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
  lampContainer: {
    position: 'absolute',
    top: LAMP_Y,
    left: screenWidth / 2 - 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lampShade: {
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  lampGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#FFD700',
    top: -70,
    left: -70,
  },
  cordAttachment: {
    position: 'absolute',
    bottom: -5,
    width: 20,
    height: 10,
    backgroundColor: '#8B4513',
    borderRadius: 5,
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