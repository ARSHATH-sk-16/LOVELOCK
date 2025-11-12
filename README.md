# LOVELOCK

A romantic lock screen mobile app with beautiful animated backgrounds and gesture-based unlock mechanisms.

## Features

### 🔐 Romantic Unlock Mechanisms
- **Lamp Cord Pull**: Pull down on a glowing lamp cord to unlock
- **Heart Key Turn**: Rotate a heart-shaped key in a matching lock
- **Touching Hearts**: Bring two hearts together with multi-touch gestures

### 🌌 Beautiful Backgrounds
- **Night Sky**: Twinkling stars, moon phases, and shooting stars
- **Glowing Lamp**: Warm, soft light rays with gentle pulsing
- **Heart Particles**: Floating romantic heart particles

### 🤖 AI Personalization
- Time-based background and mood adaptation
- User interaction pattern learning
- Customizable AI intensity levels
- Battery-optimized on-device processing

### 💫 Smooth Animations
- 60fps particle effects and transitions
- Haptic feedback integration
- Romantic sound effects
- Progressive unlock animations

### 📱 Features
- Offline functionality
- Daily romantic quotes
- Mood tracking
- Settings customization
- Accessibility support

## Technology Stack

- **React Native** (0.72.0) - Cross-platform mobile development
- **TypeScript** - Type-safe development
- **React Native Reanimated 3** - Smooth 60fps animations
- **React Native Gesture Handler** - Advanced gesture detection
- **React Native Skia** - High-performance graphics
- **Zustand** - Lightweight state management
- **TensorFlow Lite** - On-device AI processing

## Installation

```bash
# Clone the repository
git clone https://github.com/your-username/lovelock.git
cd lovelock

# Install dependencies
npm install

# For iOS
cd ios && pod install && cd ..

# Run the app
npm run android
# or
npm run ios
```

## Usage

1. **Choose Your Unlock Method**: Select your preferred romantic unlock mechanism in Settings
2. **Personalize Your Experience**: Enable AI personalization for adaptive backgrounds and moods
3. **Enjoy Romantic Moments**: Experience smooth animations, romantic quotes, and beautiful visuals

## Unlock Mechanisms

### Lamp Cord Pull
- Pull down on the lamp cord until it glows brightly
- Release when the progress bar reaches 100%
- Minimum pull distance: 150px
- Required velocity: 500px/s

### Heart Key Turn
- Rotate the heart-shaped key in the lock
- Complete a 270-degree rotation to unlock
- Visual feedback with glowing lock tumblers
- Haptic feedback at 90°, 180°, and 270°

### Touching Hearts
- Touch and drag both hearts simultaneously
- Bring them within 50px of each other
- Connection line appears when both are touched
- Hearts merge with romantic particle effects

## AI Personalization

### Intensity Levels
- **Subtle**: Time-based changes only
- **Moderate**: Basic mood and pattern analysis (default)
- **Aggressive**: Full adaptive experience
- **Custom**: Manual feature selection

### Features
- Time of day background adaptation
- Mood detection from interaction patterns
- Battery optimization
- Learning from user behavior

## Configuration

### Settings
- Unlock mechanism selection
- Background theme choice
- Sound effects volume
- Haptic feedback intensity
- Love quotes toggle
- Animation speed

### AI Settings
- Enable/disable AI features
- Intensity level selection
- Battery optimization toggle
- Feature-specific controls

## Performance

- **Target**: 60fps animations
- **Battery Impact**: <2% per hour of use
- **Memory Usage**: <100MB peak
- **Startup Time**: <2 seconds
- **Offline**: Full functionality

## Testing

```bash
# Run unit tests
npm test

# Run linting
npm run lint

# Type checking
npm run typecheck
```

## File Structure

```
src/
├── components/          # React components
│   ├── Background/      # Background animations
│   ├── LockScreen/      # Unlock mechanisms
│   ├── Home/           # Home screen widgets
│   └── UI/             # UI components
├── hooks/              # Custom React hooks
├── services/           # Business logic services
├── store/              # Zustand state management
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Built with ❤️ for romantic moments
- Inspired by the beauty of human connection
- Created to make every unlock special

---

Made with 💕 for your romantic moments