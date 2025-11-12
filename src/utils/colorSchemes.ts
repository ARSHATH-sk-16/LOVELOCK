/**
 * LOVELOCK Color Schemes
 *
 * Color palettes and gradient definitions for romantic themes.
 */

export type ColorScheme = 'warm' | 'cool' | 'neutral' | 'romantic' | 'night' | 'daylight';

// Base color palettes
export const COLOR_PALETTES = {
  warm: {
    primary: '#FF6B6B',
    secondary: '#FFD93D',
    accent: '#FFB347',
    background: '#2C1810',
    surface: '#3D2817',
    text: '#FFF8F0',
    textSecondary: '#FFE4CC',
    glow: '#FFA500',
    shadow: '#8B4513',
  },
  cool: {
    primary: '#6B9EFF',
    secondary: '#9BB6FF',
    accent: '#B8D4FF',
    background: '#0F1419',
    surface: '#1A2332',
    text: '#E8F0FF',
    textSecondary: '#B8D4FF',
    glow: '#6495ED',
    shadow: '#2C3E50',
  },
  neutral: {
    primary: '#9CA3AF',
    secondary: '#D1D5DB',
    accent: '#F3F4F6',
    background: '#1F2937',
    surface: '#374151',
    text: '#F9FAFB',
    textSecondary: '#D1D5DB',
    glow: '#E5E7EB',
    shadow: '#4B5563',
  },
  romantic: {
    primary: '#FF69B4',
    secondary: '#FF1493',
    accent: '#FFB6C1',
    background: '#2D1B69',
    surface: '#402980',
    text: '#FFF0F5',
    textSecondary: '#FFE4E1',
    glow: '#FF69B4',
    shadow: '#8B008B',
  },
  night: {
    primary: '#191970',
    secondary: '#4B0082',
    accent: '#483D8B',
    background: '#0A0E27',
    surface: '#1A1F3A',
    text: '#FFFACD',
    textSecondary: '#F0E68C',
    glow: '#9370DB',
    shadow: '#191970',
  },
  daylight: {
    primary: '#87CEEB',
    secondary: '#98D8E8',
    accent: '#B0E0E6',
    background: '#87CEEB',
    surface: '#F0F8FF',
    text: '#191970',
    textSecondary: '#4169E1',
    glow: '#FFD700',
    shadow: '#4682B4',
  },
};

// Romantic color variations
export const ROMANTIC_COLORS = {
  pinks: {
    light: '#FFB6C1',
    medium: '#FF69B4',
    hot: '#FF1493',
    deep: '#C71585',
    blush: '#FFE4E1',
    rose: '#FF007F',
  },
  reds: {
    light: '#FFA07A',
    medium: '#FF6347',
    deep: '#DC143C',
    crimson: '#DC143C',
    fire: '#B22222',
    love: '#FF0000',
  },
  purples: {
    lavender: '#E6E6FA',
    lilac: '#C8A2C8',
    orchid: '#DA70D6',
    violet: '#EE82EE',
    magenta: '#FF00FF',
    royal: '#7851A9',
  },
  golds: {
    light: '#FFFACD',
    medium: '#FFD700',
    deep: '#DAA520',
    antique: '#FAEBD7',
    rose: '#B76E79',
    shimmer: '#FFEB99',
  },
};

// Gradient definitions
export const GRADIENTS = {
  // Night sky gradients
  nightSkyEarly: {
    type: 'linear' as const,
    angle: 180,
    colors: [
      { position: 0, color: '#0A0E27' },
      { position: 0.3, color: '#1A1F3A' },
      { position: 0.7, color: '#2C3E50' },
      { position: 1, color: '#34495E' },
    ],
  },
  nightSkyLate: {
    type: 'linear' as const,
    angle: 180,
    colors: [
      { position: 0, color: '#000428' },
      { position: 0.5, color: '#004e92' },
      { position: 1, color: '#1A237E' },
    ],
  },
  nightSkyTwilight: {
    type: 'linear' as const,
    angle: 135,
    colors: [
      { position: 0, color: '#0F0C29' },
      { position: 0.5, color: '#302B63' },
      { position: 1, color: '#24243E' },
    ],
  },

  // Glowing lamp gradients
  lampWarmGlow: {
    type: 'radial' as const,
    colors: [
      { position: 0, color: '#FFD700' },
      { position: 0.3, color: '#FFA500' },
      { position: 0.6, color: '#FF6347' },
      { position: 1, color: 'rgba(255, 99, 71, 0)' },
    ],
  },
  lampSoftGlow: {
    type: 'radial' as const,
    colors: [
      { position: 0, color: '#FFEB99' },
      { position: 0.4, color: '#FFD700' },
      { position: 0.8, color: '#FFA500' },
      { position: 1, color: 'rgba(255, 165, 0, 0)' },
    ],
  },

  // Heart particle gradients
  heartsRomantic: {
    type: 'radial' as const,
    colors: [
      { position: 0, color: '#FF69B4' },
      { position: 0.5, color: '#FF1493' },
      { position: 1, color: 'rgba(255, 20, 147, 0)' },
    ],
  },
  heartsBlush: {
    type: 'radial' as const,
    colors: [
      { position: 0, color: '#FFB6C1' },
      { position: 0.6, color: '#FFC0CB' },
      { position: 1, color: 'rgba(255, 192, 203, 0)' },
    ],
  },

  // Time-based gradients
  morningDawn: {
    type: 'linear' as const,
    angle: 45,
    colors: [
      { position: 0, color: '#FF6B6B' },
      { position: 0.5, color: '#FFD93D' },
      { position: 1, color: '#6BCF7F' },
    ],
  },
  afternoonGlow: {
    type: 'linear' as const,
    angle: 90,
    colors: [
      { position: 0, color: '#87CEEB' },
      { position: 0.7, color: '#FFD700' },
      { position: 1, color: '#FFA500' },
    ],
  },
  eveningSunset: {
    type: 'linear' as const,
    angle: 135,
    colors: [
      { position: 0, color: '#FF6B6B' },
      { position: 0.4, color: '#FF8E53' },
      { position: 1, color: '#FF2E63' },
    ],
  },
  midnightMagic: {
    type: 'linear' as const,
    angle: 180,
    colors: [
      { position: 0, color: '#0F0C29' },
      { position: 0.3, color: '#302B63' },
      { position: 0.7, color: '#24243E' },
      { position: 1, color: '#141E30' },
    ],
  },

  // UI element gradients
  buttonPrimary: {
    type: 'linear' as const,
    angle: 45,
    colors: [
      { position: 0, color: '#FF69B4' },
      { position: 1, color: '#FF1493' },
    ],
  },
  buttonSecondary: {
    type: 'linear' as const,
    angle: 45,
    colors: [
      { position: 0, color: '#FFB6C1' },
      { position: 1, color: '#FFC0CB' },
    ],
  },
  cardSurface: {
    type: 'linear' as const,
    angle: 180,
    colors: [
      { position: 0, color: 'rgba(255, 255, 255, 0.1)' },
      { position: 1, color: 'rgba(255, 255, 255, 0.05)' },
    ],
  },
  modalOverlay: {
    type: 'radial' as const,
    colors: [
      { position: 0, color: 'rgba(0, 0, 0, 0.7)' },
      { position: 1, color: 'rgba(0, 0, 0, 0.9)' },
    ],
  },
};

// Semantic color definitions
export const SEMANTIC_COLORS = {
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  love: '#FF69B4',
  romance: '#E91E63',
  passion: '#FF5722',
  gentle: '#9C27B0',
  calm: '#00BCD4',
  energetic: '#FFEB3B',
};

// Accessibility color adjustments
export const ACCESSIBILITY_COLORS = {
  highContrast: {
    background: '#000000',
    surface: '#FFFFFF',
    text: '#FFFFFF',
    textSecondary: '#CCCCCC',
    primary: '#FFFFFF',
    accent: '#FFFF00',
  },
  colorBlindFriendly: {
    // Blue-yellow palette for red-green color blindness
    primary: '#2196F3',
    secondary: '#FFEB3B',
    accent: '#00BCD4',
    background: '#263238',
    surface: '#37474F',
    text: '#FFFFFF',
    textSecondary: '#B0BEC5',
  },
  reducedMotion: {
    // Subtler colors for reduced motion preferences
    primary: '#607D8B',
    secondary: '#90A4AE',
    accent: '#78909C',
    background: '#263238',
    surface: '#37474F',
    text: '#FFFFFF',
    textSecondary: '#B0BEC5',
  },
};

// Utility functions
export const getColorScheme = (scheme: ColorScheme) => COLOR_PALETTES[scheme];

export const getGradient = (name: keyof typeof GRADIENTS) => GRADIENTS[name];

export const interpolateColor = (color1: string, color2: string, factor: number): string => {
  // Simple color interpolation (would need proper hex/rgb conversion in production)
  return factor > 0.5 ? color2 : color1;
};

export const adjustColorOpacity = (color: string, opacity: number): string => {
  // Add alpha channel to hex color
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0');
    return `#${hex}${alpha}`;
  }
  return color;
};

export const getColorForMood = (mood: 'energetic' | 'calm' | 'romantic' | 'playful'): string => {
  switch (mood) {
    case 'energetic':
      return '#FFD700'; // Gold
    case 'calm':
      return '#87CEEB'; // Sky blue
    case 'romantic':
      return '#FF69B4'; // Hot pink
    case 'playful':
      return '#FF6347'; // Tomato
    default:
      return '#FF69B4';
  }
};

export const getColorForTimeOfDay = (timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'): string => {
  switch (timeOfDay) {
    case 'morning':
      return '#FFD700'; // Golden sunrise
    case 'afternoon':
      return '#87CEEB'; // Bright sky
    case 'evening':
      return '#FF6B6B'; // Sunset red
    case 'night':
      return '#4B0082'; // Deep purple
    default:
      return '#FFD700';
  }
};

export const createGlowEffect = (baseColor: string, intensity: number = 0.6): string => {
  // Create a glowing version of the base color
  return adjustColorOpacity(baseColor, intensity);
};