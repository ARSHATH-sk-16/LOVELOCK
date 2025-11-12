/**
 * LOVELOCK Main App Component
 *
 * Root component that orchestrates the entire romantic lock screen experience.
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar, Dimensions, Alert } from 'react-native';
import { useLockStore, useSettingsStore } from '@/store';
import { useSoundEffects, useAIPersonalization } from '@/hooks';
import { soundService, aiPersonalizationService } from '@/services';

// Import components
import { HomeBackground } from '@/components/Background';
import { LampCordUnlock, HeartKeyUnlock, TouchingHeartsUnlock, UnlockAnimation } from '@/components/LockScreen';
import { LoveQuoteDisplay } from '@/components/UI/LoveQuoteDisplay';
import { SettingsScreen } from '@/components/UI/SettingsScreen';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const App: React.FC = () => {
  const {
    isLocked,
    currentMechanism,
    currentBackground,
    unlockInProgress,
    lock,
    unlock,
    addUnlockEvent,
  } = useLockStore();

  const { preferences, updatePreferences } = useSettingsStore();
  const { playUnlockSound, playHapticFeedback } = useSoundEffects();
  const { profile, refreshPersonalization } = useAIPersonalization();

  // UI state
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);
  const [showLoveQuote, setShowLoveQuote] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize app
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize services
      await soundService.initialize();
      await aiPersonalizationService.initialize();

      // Initialize AI personalization
      await refreshPersonalization();

      // Mark first launch as complete
      if (preferences.firstLaunch) {
        updatePreferences({ firstLaunch: false });
      }

      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize app:', error);
      Alert.alert('Initialization Error', 'Failed to initialize LOVELOCK. Please restart the app.');
    }
  };

  // Handle successful unlock
  const handleUnlockSuccess = () => {
    if (unlockInProgress) return;

    // Record unlock event
    addUnlockEvent({
      mechanism: currentMechanism,
      duration: 2000, // Would be calculated from actual interaction
      success: true,
    });

    // Play success feedback
    playUnlockSound(profile.userMood);
    playHapticFeedback('heavy');

    // Start unlock sequence
    setUnlockInProgress(true);
    setShowUnlockAnimation(true);
  };

  // Handle unlock failure
  const handleUnlockFailure = () => {
    // Play failure feedback
    playHapticFeedback('medium');
  };

  // Complete unlock animation
  const handleUnlockAnimationComplete = () => {
    setShowUnlockAnimation(false);
    unlock(); // Update state to unlocked

    // Show love quote if enabled
    setTimeout(() => {
      setShowLoveQuote(true);
    }, 500);
  };

  // Complete love quote display
  const handleLoveQuoteComplete = () => {
    setShowLoveQuote(false);
  };

  // Long press to show settings (when unlocked)
  const handleLongPress = () => {
    if (!isLocked) {
      setShowSettings(true);
    }
  };

  // Render current unlock mechanism
  const renderUnlockMechanism = () => {
    switch (currentMechanism) {
      case 'lampCord':
        return (
          <LampCordUnlock
            onUnlockSuccess={handleUnlockSuccess}
            onUnlockFailure={handleUnlockFailure}
          />
        );

      case 'heartKey':
        return (
          <HeartKeyUnlock
            onUnlockSuccess={handleUnlockSuccess}
            onUnlockFailure={handleUnlockFailure}
          />
        );

      case 'touchingHearts':
        return (
          <TouchingHeartsUnlock
            onUnlockSuccess={handleUnlockSuccess}
            onUnlockFailure={handleUnlockFailure}
          />
        );

      default:
        return (
          <LampCordUnlock
            onUnlockSuccess={handleUnlockSuccess}
            onUnlockFailure={handleUnlockFailure}
          />
        );
    }
  };

  // Render unlocked home screen
  const renderHomeScreen = () => (
    <View style={styles.homeScreen}>
      {/* Clock display would go here */}
      <View style={styles.clockContainer}>
        <Text style={styles.timeText}>
          {new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          })}
        </Text>
        <Text style={styles.dateText}>
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
      </View>

      {/* Romantic message */}
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>
          Welcome to your romantic experience
        </Text>
        <Text style={styles.subMessageText}>
          Long press anywhere to open settings
        </Text>
      </View>

      {/* Current mood indicator */}
      <View style={styles.moodContainer}>
        <Text style={styles.moodText}>
          Mood: {profile.userMood.charAt(0).toUpperCase() + profile.userMood.slice(1)}
        </Text>
        <Text style={styles.backgroundText}>
          Background: {currentBackground.replace(/([A-Z])/g, ' $1').trim()}
        </Text>
      </View>
    </View>
  );

  if (!isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Initializing LOVELOCK...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container} onLongPress={handleLongPress}>
      {/* Status bar */}
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
        hidden={isLocked}
      />

      {/* Background */}
      <HomeBackground />

      {/* Main content */}
      <View style={styles.content}>
        {isLocked ? (
          // Lock screen
          <View style={styles.lockScreen}>
            {renderUnlockMechanism()}
          </View>
        ) : (
          // Home screen
          renderHomeScreen()
        )}
      </View>

      {/* Unlock animation overlay */}
      <UnlockAnimation
        isVisible={showUnlockAnimation}
        onComplete={handleUnlockAnimationComplete}
        mechanism={currentMechanism}
      />

      {/* Love quote display */}
      <LoveQuoteDisplay
        isVisible={showLoveQuote}
        onComplete={handleLoveQuoteComplete}
      />

      {/* Settings modal */}
      <SettingsScreen
        isVisible={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: screenWidth,
    height: screenHeight,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0E27',
  },
  loadingText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'romantic',
  },
  content: {
    flex: 1,
    position: 'relative',
  },
  lockScreen: {
    flex: 1,
    position: 'relative',
  },
  homeScreen: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 100,
    paddingBottom: 100,
    paddingHorizontal: 40,
  },
  clockContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  timeText: {
    fontSize: 48,
    color: '#FFFFFF',
    fontFamily: 'romantic',
    fontWeight: '300',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  dateText: {
    fontSize: 18,
    color: '#FFB6C1',
    fontFamily: 'romantic',
    marginTop: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  messageContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  messageText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontFamily: 'romantic',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subMessageText: {
    fontSize: 16,
    color: '#FFB6C1',
    fontFamily: 'romantic',
    textAlign: 'center',
    opacity: 0.8,
  },
  moodContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 20,
  },
  moodText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'romantic',
    marginBottom: 5,
  },
  backgroundText: {
    fontSize: 14,
    color: '#FFB6C1',
    fontFamily: 'romantic',
    opacity: 0.8,
  },
});

export default App;