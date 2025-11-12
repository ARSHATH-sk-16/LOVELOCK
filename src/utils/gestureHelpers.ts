/**
 * LOVELOCK Gesture Helper Utilities
 *
 * Utility functions for gesture detection and interaction calculations.
 */

import type { Coordinate, Dimension, GestureMetrics } from '@/types';

/**
 * Calculate distance between two points
 */
export const calculateDistance = (point1: Coordinate, point2: Coordinate): number => {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Calculate angle between two points in degrees
 */
export const calculateAngle = (point1: Coordinate, point2: Coordinate): number => {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return (Math.atan2(dy, dx) * 180) / Math.PI;
};

/**
 * Calculate velocity from two points and time delta
 */
export const calculateVelocity = (
  point1: Coordinate,
  point2: Coordinate,
  deltaTime: number
): number => {
  if (deltaTime <= 0) return 0;
  const distance = calculateDistance(point1, point2);
  return (distance / deltaTime) * 1000; // pixels per second
};

/**
 * Check if a point is within a circular area
 */
export const isPointInCircle = (
  point: Coordinate,
  center: Coordinate,
  radius: number
): boolean => {
  return calculateDistance(point, center) <= radius;
};

/**
 * Check if a point is within a rectangular area
 */
export const isPointInRect = (
  point: Coordinate,
  rect: { x: number; y: number; width: number; height: number }
): boolean => {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
};

/**
 * Clamp a value between min and max
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Linear interpolation between two values
 */
export const lerp = (start: number, end: number, progress: number): number => {
  return start + (end - start) * clamp(progress, 0, 1);
};

/**
 * Ease-in-out cubic function for smooth animations
 */
export const easeInOutCubic = (t: number): number => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

/**
 * Calculate gesture quality score (0-1)
 */
export const calculateGestureQuality = (metrics: GestureMetrics): number => {
  let score = 1.0;

  // Velocity scoring (optimal range: 300-800 px/s)
  if (metrics.averageVelocity < 100) {
    score *= 0.5; // Too slow
  } else if (metrics.averageVelocity > 1200) {
    score *= 0.7; // Too fast
  } else if (metrics.averageVelocity >= 300 && metrics.averageVelocity <= 800) {
    score *= 1.0; // Optimal
  } else {
    score *= 0.8; // Acceptable
  }

  // Duration scoring (optimal range: 2-5 seconds)
  if (metrics.touchDuration < 1000) {
    score *= 0.6; // Too quick
  } else if (metrics.touchDuration > 8000) {
    score *= 0.5; // Too slow
  } else if (metrics.touchDuration >= 2000 && metrics.touchDuration <= 5000) {
    score *= 1.0; // Optimal
  } else {
    score *= 0.8; // Acceptable
  }

  // Distance/rotation scoring for specific mechanisms
  if (metrics.pullDistance > 0) {
    // Lamp cord mechanism
    if (metrics.pullDistance >= 150) {
      score *= 1.0; // Full pull
    } else {
      score *= metrics.pullDistance / 150; // Partial pull
    }
  }

  if (metrics.rotationDegrees > 0) {
    // Key turn mechanism
    if (metrics.rotationDegrees >= 270) {
      score *= 1.0; // Full rotation
    } else {
      score *= metrics.rotationDegrees / 270; // Partial rotation
    }
  }

  return Math.max(0, Math.min(1, score));
};

/**
 * Detect if gesture is smooth (consistent velocity)
 */
export const isSmoothGesture = (velocityHistory: number[]): boolean => {
  if (velocityHistory.length < 3) return true;

  const avg = velocityHistory.reduce((sum, v) => sum + v, 0) / velocityHistory.length;
  const variance = velocityHistory.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / velocityHistory.length;
  const standardDeviation = Math.sqrt(variance);

  // Gesture is smooth if standard deviation is less than 30% of average velocity
  return standardDeviation < (avg * 0.3);
};

/**
 * Calculate gesture acceleration
 */
export const calculateAcceleration = (
  velocities: number[],
  deltaTime: number
): number => {
  if (velocities.length < 2) return 0;

  const latest = velocities[velocities.length - 1];
  const previous = velocities[velocities.length - 2];

  return (latest - previous) / deltaTime;
};

/**
 * Determine if gesture is decelerating (user is slowing down)
 */
export const isDecelerating = (velocities: number[]): boolean => {
  if (velocities.length < 3) return false;

  const recent = velocities.slice(-3);
  return recent[2] < recent[1] && recent[1] < recent[0];
};

/**
 * Map gesture angle to compass direction
 */
export const angleToDirection = (angle: number): 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW' => {
  const normalizedAngle = ((angle % 360) + 360) % 360;

  if (normalizedAngle >= 337.5 || normalizedAngle < 22.5) return 'N';
  if (normalizedAngle >= 22.5 && normalizedAngle < 67.5) return 'NE';
  if (normalizedAngle >= 67.5 && normalizedAngle < 112.5) return 'E';
  if (normalizedAngle >= 112.5 && normalizedAngle < 157.5) return 'SE';
  if (normalizedAngle >= 157.5 && normalizedAngle < 202.5) return 'S';
  if (normalizedAngle >= 202.5 && normalizedAngle < 247.5) return 'SW';
  if (normalizedAngle >= 247.5 && normalizedAngle < 292.5) return 'W';
  return 'NW';
};

/**
 * Calculate gesture path complexity (measure of how much the path curves)
 */
export const calculatePathComplexity = (points: Coordinate[]): number => {
  if (points.length < 3) return 0;

  let totalAngleChange = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const angle1 = calculateAngle(points[i - 1], points[i]);
    const angle2 = calculateAngle(points[i], points[i + 1]);
    totalAngleChange += Math.abs(angle2 - angle1);
  }

  // Normalize by number of segments
  return totalAngleChange / (points.length - 1);
};

/**
 * Detect circular gesture
 */
export const isCircularGesture = (points: Coordinate[]): boolean => {
  if (points.length < 8) return false;

  const start = points[0];
  const end = points[points.length - 1];

  // Check if start and end are close (closed loop)
  if (calculateDistance(start, end) > 50) return false;

  // Calculate center and average radius
  const centerX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
  const centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length;

  const radii = points.map(p => calculateDistance(p, { x: centerX, y: centerY }));
  const avgRadius = radii.reduce((sum, r) => sum + r, 0) / radii.length;

  // Check if all points are roughly the same distance from center
  const radiusVariance = radii.reduce((sum, r) => sum + Math.pow(r - avgRadius, 2), 0) / radii.length;
  const radiusStdDev = Math.sqrt(radiusVariance);

  // Consider circular if radius variation is less than 20% of average radius
  return radiusStdDev < (avgRadius * 0.2);
};

/**
 * Filter and smooth gesture data
 */
export const smoothGestureData = (
  points: Coordinate[],
  windowSize: number = 3
): Coordinate[] => {
  if (points.length < windowSize) return points;

  const smoothed: Coordinate[] = [];

  for (let i = 0; i < points.length; i++) {
    const start = Math.max(0, i - Math.floor(windowSize / 2));
    const end = Math.min(points.length, i + Math.floor(windowSize / 2) + 1);
    const window = points.slice(start, end);

    const smoothedPoint = {
      x: window.reduce((sum, p) => sum + p.x, 0) / window.length,
      y: window.reduce((sum, p) => sum + p.y, 0) / window.length,
    };

    smoothed.push(smoothedPoint);
  }

  return smoothed;
};

/**
 * Get touch pressure (if supported by device)
 */
export const getTouchPressure = (event: any): number => {
  // Android and iOS handle pressure differently
  if (event.nativeEvent?.force !== undefined) {
    // iOS 3D Touch
    return event.nativeEvent.force;
  }

  if (event.nativeEvent?.pressure !== undefined) {
    // Android pressure
    return event.nativeEvent.pressure;
  }

  // Fallback: estimate pressure from velocity
  return 0.5; // Default medium pressure
};