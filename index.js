/**
 * LOVELOCK - Romantic Lock Screen App
 *
 * A romantic lock screen mobile app with beautiful animated backgrounds
 * and gesture-based unlock mechanisms.
 *
 * Main entry point for the React Native application.
 */

import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);