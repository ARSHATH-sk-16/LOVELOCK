/**
 * LOVELOCK Romantic Home Screen Component
 *
 * Beautiful home screen with clock, date, romantic widgets and mood tracking.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLockStore } from '@/store';
import { useAIPersonalization } from '@/hooks';
import type { HomeWidget } from '@/types';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface RomanticHomeScreenProps {
  onSettingsPress?: () => void;
  onAppDrawerPress?: () => void;
}

export const RomanticHomeScreen: React.FC<RomanticHomeScreenProps> = ({
  onSettingsPress,
  onAppDrawerPress,
}) => {
  const { currentBackground, lastUnlockTime } = useLockStore();
  const { profile, deviceContext } = useAIPersonalization();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDate] = useState(new Date());
  const [mood, setMood] = useState<'loving' | 'happy' | 'romantic' | 'playful'>('romantic');

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format time display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Format date display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Get romantic greeting based on time
  const getRomanticGreeting = () => {
    const hour = currentTime.getHours();

    if (hour >= 5 && hour < 12) {
      return 'Good morning, my love';
    } else if (hour >= 12 && hour < 17) {
      return 'Beautiful afternoon, sweetheart';
    } else if (hour >= 17 && hour < 22) {
      return 'Evening romance awaits';
    } else {
      return 'Dreamy night, darling';
    }
  };

  // Get romantic quote based on mood
  const getMoodQuote = () => {
    const quotes = {
      loving: 'Every love story is beautiful, but ours is my favorite.',
      happy: 'Your smile is my favorite sight.',
      romantic: 'In your arms is my favorite place.',
      playful: 'Life is better when we\'re laughing together.',
    };
    return quotes[mood];
  };

  // Calculate days together (example: since first install)
  const getDaysTogether = () => {
    const firstDay = new Date(); // Would be actual anniversary date
    const diffTime = Math.abs(selectedDate.getTime() - firstDay.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Render clock widget
  const renderClockWidget = () => (
    <View style={styles.clockWidget}>
      <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
      <Text style={styles.dateText}>{formatDate(currentTime)}</Text>
      <Text style={styles.greetingText}>{getRomanticGreeting()}</Text>
    </View>
  );

  // Render mood widget
  const renderMoodWidget = () => (
    <TouchableOpacity style={styles.moodWidget} onPress={() => {
      const moods: Array<'loving' | 'happy' | 'romantic' | 'playful'> = ['loving', 'happy', 'romantic', 'playful'];
      const currentIndex = moods.indexOf(mood);
      const nextMood = moods[(currentIndex + 1) % moods.length];
      setMood(nextMood);
    }}>
      <Text style={styles.widgetTitle}>My Mood Today</Text>
      <View style={styles.moodIndicator}>
        <Text style={styles.moodEmoji}>
          {mood === 'loving' ? '💕' : mood === 'happy' ? '😊' : mood === 'romantic' ? '💑' : '🌟'}
        </Text>
        <Text style={styles.moodText}>{mood.charAt(0).toUpperCase() + mood.slice(1)}</Text>
      </View>
      <Text style={styles.moodQuote}>"{getMoodQuote()}"</Text>
    </TouchableOpacity>
  );

  // Render anniversary widget
  const renderAnniversaryWidget = () => (
    <View style={styles.anniversaryWidget}>
      <Text style={styles.widgetTitle}>Days Together</Text>
      <Text style={styles.daysNumber}>{getDaysTogether()}</Text>
      <Text style={styles.daysLabel}>days of love</Text>
      <View style={styles.heartContainer}>
        <Text style={styles.heartText}>❤️</Text>
      </View>
    </View>
  );

  // Render photo memory widget
  const renderPhotoMemoryWidget = () => (
    <TouchableOpacity
      style={styles.photoMemoryWidget}
      onPress={() => Alert.alert('Photo Memory', 'Your romantic memories would appear here')}
    >
      <Text style={styles.widgetTitle}>Memory Lane</Text>
      <View style={styles.photoPlaceholder}>
        <Text style={styles.photoPlaceholderText}>📷</Text>
        <Text style={styles.photoPlaceholderSubtext}>Your moments together</Text>
      </View>
    </TouchableOpacity>
  );

  // Render quick actions widget
  const renderQuickActionsWidget = () => (
    <View style={styles.quickActionsWidget}>
      <Text style={styles.widgetTitle}>Quick Actions</Text>
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={onSettingsPress}>
          <Text style={styles.actionButtonText}>⚙️ Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onAppDrawerPress}>
          <Text style={styles.actionButtonText}>📱 Apps</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => {
          Alert.alert('Lock Screen', 'Returning to lock screen...');
        }}>
          <Text style={styles.actionButtonText}>🔒 Lock</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render relationship insights widget
  const renderInsightsWidget = () => (
    <View style={styles.insightsWidget}>
      <Text style={styles.widgetTitle}>Your Vibe</Text>
      <View style={styles.insightsContainer}>
        <View style={styles.insightItem}>
          <Text style={styles.insightLabel}>Mood</Text>
          <Text style={styles.insightValue}>{profile.userMood}</Text>
        </View>
        <View style={styles.insightItem}>
          <Text style={styles.insightLabel}>Background</Text>
          <Text style={styles.insightValue}>{currentBackground}</Text>
        </View>
        <View style={styles.insightItem}>
          <Text style={styles.insightLabel}>Energy</Text>
          <Text style={styles.insightValue}>{deviceContext.batteryLevel}%</Text>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with greeting */}
      <View style={styles.header}>
        <Text style={styles.headerGreeting}>{getRomanticGreeting()}</Text>
        {lastUnlockTime && (
          <Text style={styles.lastUnlockText}>
            Last unlocked at {formatTime(lastUnlockTime)}
          </Text>
        )}
      </View>

      {/* Main clock widget */}
      {renderClockWidget()}

      {/* Widget grid */}
      <View style={styles.widgetGrid}>
        {renderMoodWidget()}
        {renderAnniversaryWidget()}
        {renderPhotoMemoryWidget()}
        {renderInsightsWidget()}
        {renderQuickActionsWidget()}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Made with 💕 for your romantic moments
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
  },
  headerGreeting: {
    fontSize: 28,
    color: '#FFFFFF',
    fontFamily: 'romantic',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  lastUnlockText: {
    fontSize: 14,
    color: '#FFB6C1',
    opacity: 0.8,
  },
  clockWidget: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
    backdropFilter: 'blur(10px)',
  },
  timeText: {
    fontSize: 56,
    color: '#FFFFFF',
    fontFamily: 'romantic',
    fontWeight: '200',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  dateText: {
    fontSize: 18,
    color: '#FFB6C1',
    fontFamily: 'romantic',
    marginTop: 8,
    textAlign: 'center',
  },
  greetingText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontFamily: 'romantic',
    marginTop: 15,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  widgetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  widgetTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'romantic',
    fontWeight: '600',
    marginBottom: 12,
  },
  moodWidget: {
    width: (screenWidth - 60) / 2,
    backgroundColor: 'rgba(255, 105, 180, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 105, 180, 0.3)',
  },
  moodIndicator: {
    alignItems: 'center',
    marginBottom: 10,
  },
  moodEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  moodText: {
    fontSize: 18,
    color: '#FF69B4',
    fontFamily: 'romantic',
    fontWeight: '600',
  },
  moodQuote: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'romantic',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  anniversaryWidget: {
    width: (screenWidth - 60) / 2,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  daysNumber: {
    fontSize: 36,
    color: '#FFD700',
    fontFamily: 'romantic',
    fontWeight: '600',
  },
  daysLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'romantic',
    textAlign: 'center',
  },
  heartContainer: {
    marginTop: 10,
  },
  heartText: {
    fontSize: 24,
  },
  photoMemoryWidget: {
    width: (screenWidth - 60) / 2,
    backgroundColor: 'rgba(135, 206, 235, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(135, 206, 235, 0.3)',
  },
  photoPlaceholder: {
    aspectRatio: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderText: {
    fontSize: 40,
    marginBottom: 8,
  },
  photoPlaceholderSubtext: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'romantic',
  },
  insightsWidget: {
    width: (screenWidth - 60) / 2,
    backgroundColor: 'rgba(147, 112, 219, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(147, 112, 219, 0.3)',
  },
  insightsContainer: {
    gap: 8,
  },
  insightItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  insightLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'romantic',
  },
  insightValue: {
    fontSize: 14,
    color: '#9370DB',
    fontFamily: 'romantic',
    fontWeight: '600',
  },
  quickActionsWidget: {
    width: screenWidth - 40,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    backgroundColor: 'rgba(255, 105, 180, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 105, 180, 0.4)',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'romantic',
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  footerText: {
    fontSize: 14,
    color: '#FFB6C1',
    fontFamily: 'romantic',
    fontStyle: 'italic',
  },
});