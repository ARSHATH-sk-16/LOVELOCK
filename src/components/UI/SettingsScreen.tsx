/**
 * LOVELOCK Settings Screen Component
 *
 * Comprehensive settings for personalization and customization.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Dimensions,
  Alert,
} from 'react-native';
import { useLockStore, useSettingsStore } from '@/store';
import type { UnlockMechanism, BackgroundTheme } from '@/types';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface SettingsScreenProps {
  isVisible: boolean;
  onClose: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  isVisible,
  onClose,
}) => {
  const { settings, setMechanism, setBackground, updateSettings } = useLockStore();
  const { aiSettings, updateAISettings } = useSettingsStore();

  const [localSettings, setLocalSettings] = useState(settings);
  const [localAISettings, setLocalAISettings] = useState(aiSettings);

  const mechanisms: { value: UnlockMechanism; label: string; description: string }[] = [
    {
      value: 'lampCord',
      label: 'Lamp Cord Pull',
      description: 'Pull down on a glowing lamp cord to unlock',
    },
    {
      value: 'heartKey',
      label: 'Heart Key Turn',
      description: 'Rotate a heart-shaped key in a lock',
    },
    {
      value: 'touchingHearts',
      label: 'Touching Hearts',
      description: 'Bring two hearts together to unlock',
    },
  ];

  const backgrounds: { value: BackgroundTheme; label: string; description: string }[] = [
    {
      value: 'nightSky',
      label: 'Night Sky',
      description: 'Twinkling stars and moonlit atmosphere',
    },
    {
      value: 'glowingLamp',
      label: 'Glowing Lamp',
      description: 'Warm, soft glowing light rays',
    },
    {
      value: 'heartParticles',
      label: 'Heart Particles',
      description: 'Floating romantic heart particles',
    },
  ];

  const aiIntensities: { value: string; label: string; description: string }[] = [
    {
      value: 'subtle',
      label: 'Subtle',
      description: 'Minimal changes, mainly time-based',
    },
    {
      value: 'moderate',
      label: 'Moderate',
      description: 'Balanced personalization',
    },
    {
      value: 'aggressive',
      label: 'Aggressive',
      description: 'Dynamic, responsive experience',
    },
    {
      value: 'custom',
      label: 'Custom',
      description: 'Manual control of AI features',
    },
  ];

  const handleSaveSettings = () => {
    // Update lock settings
    updateSettings(localSettings);
    setMechanism(localSettings.mechanism);
    setBackground(localSettings.background);

    // Update AI settings
    updateAISettings(localAISettings);

    onClose();
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to defaults?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            // Reset to defaults would be handled here
            Alert.alert('Settings Reset', 'All settings have been reset to defaults');
          },
        },
      ]
    );
  };

  if (!isVisible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Settings content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Unlock Mechanism Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Unlock Mechanism</Text>
            <Text style={styles.sectionDescription}>Choose your preferred way to unlock</Text>

            {mechanisms.map((mechanism) => (
              <TouchableOpacity
                key={mechanism.value}
                style={[
                  styles.option,
                  localSettings.mechanism === mechanism.value && styles.selectedOption,
                ]}
                onPress={() => setLocalSettings({ ...localSettings, mechanism: mechanism.value })}
              >
                <View style={styles.optionContent}>
                  <Text style={[
                    styles.optionTitle,
                    localSettings.mechanism === mechanism.value && styles.selectedOptionText,
                  ]}>
                    {mechanism.label}
                  </Text>
                  <Text style={styles.optionDescription}>
                    {mechanism.description}
                  </Text>
                </View>
                {localSettings.mechanism === mechanism.value && (
                  <View style={styles.selectedIndicator} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Background Theme Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Background Theme</Text>
            <Text style={styles.sectionDescription}>Choose your romantic background</Text>

            {backgrounds.map((background) => (
              <TouchableOpacity
                key={background.value}
                style={[
                  styles.option,
                  localSettings.background === background.value && styles.selectedOption,
                ]}
                onPress={() => setLocalSettings({ ...localSettings, background: background.value })}
              >
                <View style={styles.optionContent}>
                  <Text style={[
                    styles.optionTitle,
                    localSettings.background === background.value && styles.selectedOptionText,
                  ]}>
                    {background.label}
                  </Text>
                  <Text style={styles.optionDescription}>
                    {background.description}
                  </Text>
                </View>
                {localSettings.background === background.value && (
                  <View style={styles.selectedIndicator} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* AI Personalization Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AI Personalization</Text>
            <Text style={styles.sectionDescription}>Customize your adaptive experience</Text>

            <View style={styles.switchOption}>
              <View style={styles.switchContent}>
                <Text style={styles.switchTitle}>Enable AI</Text>
                <Text style={styles.switchDescription}>Allow AI to personalize your experience</Text>
              </View>
              <Switch
                value={localAISettings.enabled}
                onValueChange={(value) => setLocalAISettings({ ...localAISettings, enabled: value })}
                trackColor={{ false: '#767577', true: '#FF69B4' }}
                thumbColor={localAISettings.enabled ? '#FFFFFF' : '#F4F3F4'}
              />
            </View>

            {localAISettings.enabled && (
              <>
                <Text style={styles.subsectionTitle}>AI Intensity</Text>
                {aiIntensities.map((intensity) => (
                  <TouchableOpacity
                    key={intensity.value}
                    style={[
                      styles.option,
                      localAISettings.intensity === intensity.value && styles.selectedOption,
                    ]}
                    onPress={() => setLocalAISettings({ ...localAISettings, intensity: intensity.value as any })}
                  >
                    <View style={styles.optionContent}>
                      <Text style={[
                        styles.optionTitle,
                        localAISettings.intensity === intensity.value && styles.selectedOptionText,
                      ]}>
                        {intensity.label}
                      </Text>
                      <Text style={styles.optionDescription}>
                        {intensity.description}
                      </Text>
                    </View>
                    {localAISettings.intensity === intensity.value && (
                      <View style={styles.selectedIndicator} />
                    )}
                  </TouchableOpacity>
                ))}
              </>
            )}
          </View>

          {/* General Settings Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>General Settings</Text>

            <View style={styles.switchOption}>
              <View style={styles.switchContent}>
                <Text style={styles.switchTitle}>Sound Effects</Text>
                <Text style={styles.switchDescription}>Romantic audio feedback</Text>
              </View>
              <Switch
                value={localSettings.soundEnabled}
                onValueChange={(value) => setLocalSettings({ ...localSettings, soundEnabled: value })}
                trackColor={{ false: '#767577', true: '#FF69B4' }}
                thumbColor={localSettings.soundEnabled ? '#FFFFFF' : '#F4F3F4'}
              />
            </View>

            <View style={styles.switchOption}>
              <View style={styles.switchContent}>
                <Text style={styles.switchTitle}>Haptic Feedback</Text>
                <Text style={styles.switchDescription}>Vibration on interactions</Text>
              </View>
              <Switch
                value={localSettings.hapticFeedback}
                onValueChange={(value) => setLocalSettings({ ...localSettings, hapticFeedback: value })}
                trackColor={{ false: '#767577', true: '#FF69B4' }}
                thumbColor={localSettings.hapticFeedback ? '#FFFFFF' : '#F4F3F4'}
              />
            </View>

            <View style={styles.switchOption}>
              <View style={styles.switchContent}>
                <Text style={styles.switchTitle}>Love Quotes</Text>
                <Text style={styles.switchDescription}>Show romantic quotes after unlock</Text>
              </View>
              <Switch
                value={localSettings.loveQuotesEnabled}
                onValueChange={(value) => setLocalSettings({ ...localSettings, loveQuotesEnabled: value })}
                trackColor={{ false: '#767577', true: '#FF69B4' }}
                thumbColor={localSettings.loveQuotesEnabled ? '#FFFFFF' : '#F4F3F4'}
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.button, styles.resetButton]}
              onPress={handleResetSettings}
            >
              <Text style={styles.resetButtonText}>Reset to Defaults</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSaveSettings}
            >
              <Text style={styles.saveButtonText}>Save Settings</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  container: {
    width: screenWidth * 0.9,
    maxHeight: screenHeight * 0.85,
    backgroundColor: '#2D1B69',
    borderRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 24,
    color: '#FFFFFF',
    fontFamily: 'romantic',
    fontWeight: '600',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'romantic',
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#B8D4FF',
    marginBottom: 15,
  },
  subsectionTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'romantic',
    fontWeight: '500',
    marginTop: 15,
    marginBottom: 10,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    backgroundColor: 'rgba(255, 105, 180, 0.1)',
    borderColor: '#FF69B4',
  },
  optionContent: {
    flex: 1,
    marginRight: 15,
  },
  optionTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'romantic',
    fontWeight: '500',
    marginBottom: 4,
  },
  selectedOptionText: {
    color: '#FF69B4',
  },
  optionDescription: {
    fontSize: 14,
    color: '#B8D4FF',
    lineHeight: 18,
  },
  selectedIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF69B4',
  },
  switchOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  switchContent: {
    flex: 1,
    marginRight: 15,
  },
  switchTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'romantic',
    fontWeight: '500',
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 14,
    color: '#B8D4FF',
    lineHeight: 18,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 40,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  saveButton: {
    backgroundColor: '#FF69B4',
  },
  resetButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#FF69B4',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'romantic',
    fontWeight: '600',
  },
  resetButtonText: {
    fontSize: 16,
    color: '#FF69B4',
    fontFamily: 'romantic',
    fontWeight: '600',
  },
});