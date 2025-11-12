/**
 * LOVELOCK Love Quote Display Component
 *
 * Displays romantic quotes or daily affirmations after successful unlock.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import { useLockStore, useSettingsStore } from '@/store';
import type { LoveQuote } from '@/types';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface LoveQuoteDisplayProps {
  isVisible: boolean;
  onComplete?: () => void;
}

const DEFAULT_QUOTES: LoveQuote[] = [
  {
    id: '1',
    text: "Love is not finding someone to live with, it's finding someone you can't live without.",
    author: "Rafael Ortiz",
    category: 'morning',
    language: 'en',
  },
  {
    id: '2',
    text: "You are my today and all of my tomorrows.",
    author: "Leo Christopher",
    category: 'evening',
    language: 'en',
  },
  {
    id: '3',
    text: "In all the world, there is no heart for me like yours. In all the world, there is no love for you like mine.",
    author: "Maya Angelou",
    category: 'night',
    language: 'en',
  },
  {
    id: '4',
    text: "Being deeply loved by someone gives you strength, while loving someone deeply gives you courage.",
    author: "Lao Tzu",
    category: 'afternoon',
    language: 'en',
  },
  {
    id: '5',
    text: "Where there is love there is life.",
    author: "Mahatma Gandhi",
    category: 'morning',
    language: 'en',
  },
  {
    id: '6',
    text: "The best thing to hold onto in life is each other.",
    author: "Audrey Hepburn",
    category: 'evening',
    language: 'en',
  },
  {
    id: '7',
    text: "You know you're in love when you can't fall asleep because reality is finally better than your dreams.",
    author: "Dr. Seuss",
    category: 'night',
    language: 'en',
  },
  {
    id: '8',
    text: "Love is composed of a single soul inhabiting two bodies.",
    author: "Aristotle",
    category: 'afternoon',
    language: 'en',
  },
  {
    id: '9',
    text: "The course of true love never did run smooth.",
    author: "William Shakespeare",
    category: 'morning',
    language: 'en',
  },
  {
    id: '10',
    text: "To love and be loved is to feel the sun from both sides.",
    author: "David Viscott",
    category: 'evening',
    language: 'en',
  },
];

export const LoveQuoteDisplay: React.FC<LoveQuoteDisplayProps> = ({
  isVisible,
  onComplete,
}) => {
  const { settings } = useLockStore();
  const { customQuotes, favoriteQuotes } = useSettingsStore();

  const [currentQuote, setCurrentQuote] = useState<LoveQuote | null>(null);
  const [fadeOpacity] = useState(new Animated.Value(0));
  const [slideY] = useState(new Animated.Value(50));
  const [displayTime, setDisplayTime] = useState(0);

  // Get current time of day for quote selection
  const getTimeOfDay = (): 'morning' | 'afternoon' | 'evening' | 'night' => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  };

  // Select appropriate quote
  const selectQuote = (): LoveQuote | null => {
    if (!settings.loveQuotesEnabled) return null;

    const timeOfDay = getTimeOfDay();
    const allQuotes = [...DEFAULT_QUOTES, ...customQuotes];

    // Filter quotes by time of day
    const timeRelevantQuotes = allQuotes.filter(quote =>
      quote.category === timeOfDay || quote.category === 'afternoon' // Use afternoon as general fallback
    );

    // Prioritize favorite quotes
    const favoriteTimeQuotes = timeRelevantQuotes.filter(quote =>
      favoriteQuotes.includes(quote.id)
    );

    const quotesToUse = favoriteTimeQuotes.length > 0 ? favoriteTimeQuotes : timeRelevantQuotes;

    if (quotesToUse.length === 0) return null;

    // Random selection from available quotes
    const randomIndex = Math.floor(Math.random() * quotesToUse.length);
    return quotesToUse[randomIndex];
  };

  // Start quote display animation
  const startQuoteDisplay = () => {
    const quote = selectQuote();
    if (!quote) {
      onComplete?.();
      return;
    }

    setCurrentQuote(quote);
    setDisplayTime(0);

    // Fade in and slide up animation
    Animated.parallel([
      Animated.timing(fadeOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideY, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-hide after 3 seconds
    setTimeout(() => {
      hideQuoteDisplay();
    }, 3000);
  };

  // Hide quote display
  const hideQuoteDisplay = () => {
    Animated.parallel([
      Animated.timing(fadeOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideY, {
        toValue: -30,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onComplete?.();
    });
  };

  // Handle visibility changes
  useEffect(() => {
    if (isVisible && settings.loveQuotesEnabled) {
      startQuoteDisplay();
    } else if (!isVisible) {
      setCurrentQuote(null);
    }
  }, [isVisible, settings.loveQuotesEnabled]);

  // Update display time counter
  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible || !currentQuote) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View
        style={[
          styles.quoteContainer,
          {
            opacity: fadeOpacity,
            transform: [{ translateY: slideY }],
          },
        ]}
      >
        {/* Quote text */}
        <Text style={styles.quoteText}>
          "{currentQuote.text}"
        </Text>

        {/* Author attribution */}
        {currentQuote.author && (
          <Text style={styles.authorText}>
            — {currentQuote.author}
          </Text>
        )}

        {/* Category indicator */}
        <View style={styles.categoryContainer}>
          <View style={[
            styles.categoryDot,
            {
              backgroundColor: getCategoryColor(currentQuote.category),
            },
          ]} />
          <Text style={styles.categoryText}>
            {formatCategory(currentQuote.category)}
          </Text>
        </View>
      </Animated.View>

      {/* Progress bar for auto-hide */}
      <View style={styles.progressBar}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: `${Math.min(100, (displayTime / 3) * 100)}%`,
            },
          ]}
        />
      </View>
    </View>
  );
};

// Helper functions
const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'morning': return '#FFD700';
    case 'afternoon': return '#87CEEB';
    case 'evening': return '#FF6B6B';
    case 'night': return '#9370DB';
    default: return '#FF69B4';
  }
};

const formatCategory = (category: string): string => {
  switch (category) {
    case 'morning': return 'Morning Motivation';
    case 'afternoon': return 'Afternoon Romance';
    case 'evening': return 'Evening Reflection';
    case 'night': return 'Night Intimacy';
    default: return 'Love Quote';
  }
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: screenHeight * 0.2,
    left: screenWidth * 0.1,
    right: screenWidth * 0.1,
    alignItems: 'center',
    zIndex: 50,
  },
  quoteContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  quoteText: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'romantic',
    lineHeight: 28,
    marginBottom: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  authorText: {
    fontSize: 14,
    color: '#FFB6C1',
    textAlign: 'center',
    fontFamily: 'romantic',
    fontStyle: 'italic',
    marginBottom: 15,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'romantic',
    fontWeight: '500',
  },
  progressBar: {
    width: '80%',
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 1,
    marginTop: 15,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF69B4',
    borderRadius: 1,
  },
});