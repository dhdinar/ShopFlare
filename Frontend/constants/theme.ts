/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#1A1A1A';
const tintColorDark = '#1A1A1A';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

// ShopFlare Brand Colors
export const ShopFlareColors = {
  primary: '#1A1A1A',
  primaryLight: '#444444',
  primaryDark: '#0D0D0D',
  secondary: '#FFFFFF',
  accent: '#FF6B35',       // Warm orange — the "flare" in ShopFlare
  accentLight: '#FFF4EE',  // Accent tint for backgrounds / badges
  accentDark: '#E55A2B',   // Pressed state
  background: '#F8F9FA',
  cardBackground: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  textLight: '#999999',
  border: '#E8E8E8',
  borderLight: '#F0F0F0',
  success: '#4CAF50',
  successLight: '#E8F5E9',
  warning: '#FFC107',
  warningLight: '#FFF8E1',
  error: '#F44336',
  errorLight: '#FFEBEE',
  info: '#2196F3',
  infoLight: '#E3F2FD',
  skeleton: '#E8E8E8',
  statusPending: '#FFA726',
  statusPendingLight: '#FFF3E0',
  statusConfirmed: '#42A5F5',
  statusConfirmedLight: '#E3F2FD',
  statusProcessing: '#AB47BC',
  statusProcessingLight: '#F3E5F5',
  statusShipped: '#7E57C2',
  statusShippedLight: '#EDE7F6',
  statusDelivered: '#66BB6A',
  statusDeliveredLight: '#E8F5E9',
  statusCancelled: '#EF5350',
  statusCancelledLight: '#FFEBEE',
  statusRefunded: '#78909C',
  statusRefundedLight: '#ECEFF1',
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
