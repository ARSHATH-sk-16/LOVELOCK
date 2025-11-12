/**
 * LOVELOCK LampCordUnlock Component Tests
 *
 * Unit tests for the lamp cord unlock mechanism.
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { LampCordUnlock } from '@/components/LockScreen';

describe('LampCordUnlock', () => {
  it('renders correctly', () => {
    const { getByTestId } = render(
      <LampCordUnlock />
    );

    // Test that the component renders without crashing
    expect(getByTestId('lamp-cord-container')).toBeTruthy();
  });

  it('calls onUnlockSuccess when pulled past threshold', () => {
    const mockOnUnlockSuccess = jest.fn();
    const { getByTestId } = render(
      <LampCordUnlock onUnlockSuccess={mockOnUnlockSuccess} />
    );

    // Simulate pulling gesture past threshold
    const gestureArea = getByTestId('gesture-area');
    fireEvent(gestureArea, 'onGestureEvent', {
      nativeEvent: {
        translationY: 200, // Past 150px threshold
        velocityY: 600, // Above 500px/s
      },
    });

    fireEvent(gestureArea, 'onHandlerStateChange', {
      nativeEvent: { state: 'end' },
    });

    expect(mockOnUnlockSuccess).toHaveBeenCalled();
  });

  it('calls onUnlockFailure when not pulled past threshold', () => {
    const mockOnUnlockFailure = jest.fn();
    const { getByTestId } = render(
      <LampCordUnlock onUnlockFailure={mockOnUnlockFailure} />
    );

    // Simulate pulling gesture below threshold
    const gestureArea = getByTestId('gesture-area');
    fireEvent(gestureArea, 'onGestureEvent', {
      nativeEvent: {
        translationY: 100, // Below 150px threshold
        velocityY: 300,
      },
    });

    fireEvent(gestureArea, 'onHandlerStateChange', {
      nativeEvent: { state: 'end' },
    });

    expect(mockOnUnlockFailure).toHaveBeenCalled();
  });
});