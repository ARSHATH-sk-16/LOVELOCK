/**
 * LOVELOCK Touching Hearts Unlock Component
 *
 * Two separated hearts that user brings together with multi-touch gestures.
 */

import React, { useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, PanGestureHandler, State } from 'react-native';
import { useGestureDetection } from '@/hooks';
import { useLockStore } from '@/store';
import { Svg, Heart as SvgHeart, Line, Circle, G } from 'react-native-svg';
import { calculateDistance } from '@/utils';

interface TouchingHeartsUnlockProps {
  onUnlockSuccess?: () => void;
  onUnlockFailure?: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const UNLOCK_DISTANCE = 50; // pixels between hearts to unlock
const INITIAL_SEPARATION = 300;

export const TouchingHeartsUnlock: React.FC<TouchingHeartsUnlockProps> = ({
  onUnlockSuccess,
  onUnlockFailure,
}) => {
  const {
    touchingHeartsState,
    updateTouchingHeartsState,
    settings,
  } = useLockStore();

  const [leftHeartPosition, setLeftHeartPosition] = useState({ x: screenWidth/2 - 150, y: screenHeight/2 });
  const [rightHeartPosition, setRightHeartPosition] = useState({ x: screenWidth/2 + 150, y: screenHeight/2 });
  const [isLeftHeartDragging, setIsLeftHeartDragging] = useState(false);
  const [isRightHeartDragging, setIsRightHeartDragging] = useState(false);
  const [connectionStrength, setConnectionStrength] = useState(0);

  const leftHeartGlow = useRef(0);
  const rightHeartGlow = useRef(0);

  // Setup gesture detection (simplified for multi-touch)
  const handleLeftHeartPan = (event: any) => {
    const { nativeEvent } = event;
    const { translationY, translationX, state } = nativeEvent;

    if (state === State.ACTIVE) {
      const newX = screenWidth/2 - 150 + translationX;
      const newY = screenHeight/2 + translationY;

      setLeftHeartPosition({ x: newX, y: newY });
      setIsLeftHeartDragging(true);

      updateTouchingHeartsState({
        leftHeartPosition: { x: newX, y: newY },
        isLeftHeartDragging: true,
      });
    }

    if (state === State.END || state === State.FAILED || state === State.CANCELLED) {
      setIsLeftHeartDragging(false);
      updateTouchingHeartsState({ isLeftHeartDragging: false });
    }
  };

  const handleRightHeartPan = (event: any) => {
    const { nativeEvent } = event;
    const { translationY, translationX, state } = nativeEvent;

    if (state === State.ACTIVE) {
      const newX = screenWidth/2 + 150 + translationX;
      const newY = screenHeight/2 + translationY;

      setRightHeartPosition({ x: newX, y: newY });
      setIsRightHeartDragging(true);

      updateTouchingHeartsState({
        rightHeartPosition: { x: newX, y: newY },
        isRightHeartDragging: true,
      });
    }

    if (state === State.END || state === State.FAILED || state === State.CANCELLED) {
      setIsRightHeartDragging(false);
      updateTouchingHeartsState({ isRightHeartDragging: false });
    }
  };

  // Calculate distance and connection strength
  const currentDistance = calculateDistance(leftHeartPosition, rightHeartPosition);
  const newConnectionStrength = Math.max(0, 1 - (currentDistance / INITIAL_SEPARATION));

  React.useEffect(() => {
    setConnectionStrength(newConnectionStrength);

    const distance = currentDistance;
    updateTouchingHeartsState({ distance, connectionStrength: newConnectionStrength });

    // Check for unlock
    if (distance <= UNLOCK_DISTANCE && (isLeftHeartDragging || isRightHeartDragging)) {
      onUnlockSuccess?.();
    }

    // Update glow intensity based on proximity
    leftHeartGlow.current = newConnectionStrength;
    rightHeartGlow.current = newConnectionStrength;

  }, [currentDistance, newConnectionStrength, isLeftHeartDragging, isRightHeartDragging]);

  // Render connection line between hearts
  const renderConnectionLine = () => {
    if (connectionStrength <= 0.1) return null;

    const opacity = connectionStrength * 0.6;
    const lineWidth = 2 + connectionStrength * 4;

    return (
      <Svg
        width={screenWidth}
        height={screenHeight}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      >
        {/* Connection line with gradient effect */}
        <Defs>
          <LinearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#FF69B4" stopOpacity={opacity} />
            <Stop offset="50%" stopColor="#FFD700" stopOpacity={opacity} />
            <Stop offset="100%" stopColor="#FF69B4" stopOpacity={opacity} />
          </LinearGradient>
        </Defs>

        <Line
          x1={leftHeartPosition.x}
          y1={leftHeartPosition.y}
          x2={rightHeartPosition.x}
          y2={rightHeartPosition.y}
          stroke="url(#connectionGradient)"
          strokeWidth={lineWidth}
          strokeLinecap="round"
        />

        {/* Connection particles along the line */}
        {Array.from({ length: Math.floor(connectionStrength * 8) }).map((_, index) => {
          const progress = (index + 1) / (Math.floor(connectionStrength * 8) + 1);
          const x = leftHeartPosition.x + (rightHeartPosition.x - leftHeartPosition.x) * progress;
          const y = leftHeartPosition.y + (rightHeartPosition.y - leftHeartPosition.y) * progress;

          return (
            <Circle
              key={`particle-${index}`}
              cx={x}
              cy={y}
              r={2 + connectionStrength * 3}
              fill="#FFD700"
              opacity={opacity * (0.5 + Math.sin(Date.now() * 0.003 + index) * 0.5)}
            />
          );
        })}
      </Svg>
    );
  };

  // Render individual heart
  const renderHeart = (position: { x: number; y: number }, isLeft: boolean, isDragging: boolean) => {
    const glowIntensity = isLeft ? leftHeartGlow.current : rightHeartGlow.current;
    const heartSize = 60 + glowIntensity * 20;

    return (
      <View
        style={[
          styles.heartContainer,
          {
            left: position.x - heartSize / 2,
            top: position.y - heartSize / 2,
            width: heartSize,
            height: heartSize,
            transform: [
              { scale: isDragging ? 1.1 : 1 },
            ],
          },
        ]}
      >
        {/* Heart glow effect */}
        {glowIntensity > 0.1 && (
          <View
            style={[
              styles.heartGlow,
              {
                opacity: glowIntensity * 0.3,
                width: heartSize * 2,
                height: heartSize * 2,
                left: -heartSize / 2,
                top: -heartSize / 2,
              },
            ]}
          />
        )}

        {/* Heart shape */}
        <Svg
          width={heartSize}
          height={heartSize}
          viewBox="0 0 24 24"
          style={styles.heartSvg}
        >
          <SvgHeart
            x="0"
            y="0"
            width="24"
            height="24"
            fill={isLeft ? '#FF69B4' : '#FF1493'}
            stroke={isLeft ? '#FF1493' : '#C71585'}
            strokeWidth="1"
            opacity={0.9 + glowIntensity * 0.1}
          />

          {/* Heart shine effect */}
          <SvgHeart
            x="2"
            y="2"
            width="8"
            height="8"
            fill="rgba(255, 255, 255, 0.3)"
            opacity={0.5 + glowIntensity * 0.3}
          />

          {/* Dragging indicator */}
          {isDragging && (
            <Circle
              cx="12"
              cy="12"
              r="14"
              fill="none"
              stroke="#FFD700"
              strokeWidth="2"
              opacity={0.6}
            />
          )}
        </Svg>
      </View>
    );
  };

  // Render progress indicator
  const renderProgressIndicator = () => {
    const progress = connectionStrength;
    const showIndicator = progress > 0.1;

    if (!showIndicator) return null;

    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progress * 100}%`,
                backgroundColor: progress >= 0.9 ? '#4CAF50' : '#FF69B4',
              },
            ]}
          />
        </View>
        <Animated.Text
          style={[
            styles.progressText,
            {
              color: progress >= 0.9 ? '#4CAF50' : '#FF69B4',
              opacity: progress,
            },
          ]}
        >
          {progress >= 0.9 ? 'Hearts Connected!' : `Bring hearts together...`}
        </Animated.Text>
      </View>
    );
  };

  // Render visual feedback
  const renderVisualFeedback = () => {
    if (!isLeftHeartDragging && !isRightHeartDragging && connectionStrength < 0.1) {
      return (
        <View style={styles.instructionContainer}>
          <Animated.Text style={styles.instructionText}>
            Touch and drag the hearts together to unlock
          </Animated.Text>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      {/* Connection line */}
      {renderConnectionLine()}

      {/* Left heart */}
      <PanGestureHandler onGestureEvent={handleLeftHeartPan} onHandlerStateChange={handleLeftHeartPan}>
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          {renderHeart(leftHeartPosition, true, isLeftHeartDragging)}
        </View>
      </PanGestureHandler>

      {/* Right heart */}
      <PanGestureHandler onGestureEvent={handleRightHeartPan} onHandlerStateChange={handleRightHeartPan}>
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          {renderHeart(rightHeartPosition, false, isRightHeartDragging)}
        </View>
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
    backgroundColor: 'transparent',
  },
  heartContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  heartSvg: {
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 8,
  },
  heartGlow: {
    position: 'absolute',
    borderRadius: 100,
    backgroundColor: '#FF69B4',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 100,
    left: 40,
    right: 40,
    alignItems: 'center',
    zIndex: 10,
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
    zIndex: 10,
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