/**
 * Theme System - Centralized Color Management
 * 
 * All colors for the application are defined here in one place.
 * Each theme contains:
 * - Logo colors: For logo images and text
 * - Backgrounds: Primary, secondary, card, and gradient colors
 * - Text colors: Primary, secondary, and muted text (all in one place)
 * - Interactive: Buttons, accents, and links
 * - Borders: Border colors for boxes and dividers
 * 
 * To change colors: Update the values in the theme objects below.
 * All components use CSS variables that are automatically set from these themes.
 */

import logoOrange from '@/assets/logo-chordconnect-orange.png'
import logoBrown from '@/assets/logo-chordconnect_brown.png'
import logoCream from '@/assets/logo-chordconnect-cream.png'

export type ThemeName = 'orange-primary' | 'dark-brown-primary' | 'red-primary'

export interface Theme {
  name: ThemeName
  displayName: string
  logoImage: string
  colors: {
    // Logo colors
    logo: string
    logoText: string
    
    // Backgrounds
    bgPrimary: string
    bgSecondary: string
    bgCard: string
    bgGradient: {
      top: string
      mid: string
      bottom: string
    }
    
    // Text
    textPrimary: string
    textSecondary: string
    textMuted: string
    
    // Interactive
    button: string
    buttonHover: string
    buttonText: string
    accent: string
    link: string
    
    // Borders & dividers
    border: string
    borderLight: string
    
    // Input fields
    inputBg: string
    inputBorder: string
    inputText: string
    inputFocus: string
    
    // Status colors
    success: string
    successBg: string
    successBorder: string
    error: string
    errorBg: string
    errorBorder: string
    
    // Focus/outline
    focusOutline: string
    
    // Shadows
    shadow: string
    shadowStrong: string
    
    // Button/Error opacity variations (for hover states, backgrounds, etc.)
    buttonBgLight: string
    buttonBgMedium: string
    buttonBorderLight: string
    errorBgLight: string
    errorBorderLight: string

    // Auth page overlay (for login/register backgrounds)
    authOverlay: string
  }
}

export const themes: Record<ThemeName, Theme> = {
  'orange-primary': {
    name: 'orange-primary',
    displayName: 'Orange Primary',
    logoImage: logoOrange,
    colors: {
      logo: 'rgb(245, 128, 48)', // F58030
      logoText: 'rgb(245, 128, 48)',
      bgPrimary: 'rgb(44, 33, 31)', // Rich red-brown - reduced green, more vibrant
      bgSecondary: 'rgb(62, 43, 35)', // Warm red-brown - less greenish
      bgCard: 'rgb(50, 36, 32)', // Rich red-brown - reduced green to eliminate greenish tint
      bgGradient: {
        top: 'rgb(62, 43, 35)',
        mid: 'rgb(44, 33, 31)',
        bottom: 'rgb(34, 24, 22)'
      },
      // Text colors - light colors for dark background
      textPrimary: 'rgb(238, 232, 219)', // EEE8DB
      textSecondary: 'rgb(201, 179, 157)', // C9B39D
      textMuted: 'rgb(150, 135, 120)',
      button: 'rgb(245, 128, 48)', // F58030
      buttonHover: 'rgb(255, 150, 80)',
      buttonText: 'rgb(255, 255, 255)',
      accent: 'rgb(245, 128, 48)',
      link: 'rgb(255, 150, 80)',
      // Borders - light borders for dark background
      border: 'rgba(238, 232, 219, 0.2)',
      borderLight: 'rgba(201, 179, 157, 0.1)',
      // Input fields
      inputBg: 'rgb(62, 43, 35)',
      inputBorder: 'rgba(238, 232, 219, 0.1)',
      inputText: 'rgb(249, 250, 251)',
      inputFocus: 'rgb(245, 128, 48)',
      // Status colors
      success: 'rgb(110, 231, 183)', // 6ee7b7
      successBg: 'rgba(16, 185, 129, 0.15)',
      successBorder: 'rgba(16, 185, 129, 0.35)',
      error: 'rgb(254, 202, 202)', // fecaca
      errorBg: 'rgba(248, 113, 113, 0.15)',
      errorBorder: 'rgba(248, 113, 113, 0.35)',
      // Focus/outline
      focusOutline: 'rgb(245, 128, 48)',
      // Shadows
      shadow: 'rgba(0, 0, 0, 0.3)',
      shadowStrong: 'rgba(0, 0, 0, 0.45)',
      // Button/Error opacity variations
      buttonBgLight: 'rgba(245, 128, 48, 0.1)',
      buttonBgMedium: 'rgba(245, 128, 48, 0.2)',
      buttonBorderLight: 'rgba(245, 128, 48, 0.25)',
      errorBgLight: 'rgba(239, 68, 68, 0.1)',
      errorBorderLight: 'rgba(239, 68, 68, 0.3)',
      // Auth page overlay - warm orange/peach tint
      authOverlay: 'rgba(255, 200, 150, 0.12)'
    }
  },
  'dark-brown-primary': {
    name: 'dark-brown-primary',
    displayName: 'Dark Brown Primary',
    logoImage: logoBrown,
    colors: {
      logo: 'rgb(59, 46, 37)', // 3B2E25
      logoText: 'rgb(59, 46, 37)',
      bgPrimary: 'rgb(238, 232, 219)', // EEE8DB - light bg
      bgSecondary: 'rgb(230, 222, 208)', // Pure beige - more yellow/warm, less brown/grey, slightly lighter
      bgCard: 'rgb(240, 235, 225)', // Closer to background - subtle contrast like dark theme
      bgGradient: {
        top: 'rgb(238, 232, 219)',
        mid: 'rgb(230, 222, 208)',
        bottom: 'rgb(220, 210, 195)'
      },
      // Text colors - dark brown (like logo) instead of black, slightly darker than logo
      textPrimary: 'rgb(45, 35, 30)', // Dark brown - slightly darker than logo (3B2E25 = 59,46,37), almost black but warm brown
      textSecondary: 'rgb(65, 52, 45)', // Darker medium brown for better readability
      textMuted: 'rgb(95, 80, 70)', // Darker muted brown for sufficient contrast
      button: 'rgb(245, 128, 48)', // F58030
      buttonHover: 'rgb(255, 150, 80)',
      buttonText: 'rgb(250, 245, 235)', // Lighter cream/beige - looks better on vibrant orange than dark brown
      accent: 'rgb(245, 128, 48)',
      link: 'rgb(59, 46, 37)', // 3B2E25 - warm brown for links
      // Borders - using darker warm browns for better visibility on light background
      border: 'rgba(59, 46, 37, 0.3)', // More visible borders
      borderLight: 'rgba(75, 62, 53, 0.2)', // More visible light borders
      // Input fields
      inputBg: 'rgb(240, 235, 225)',
      inputBorder: 'rgba(59, 46, 37, 0.2)',
      inputText: 'rgb(45, 35, 30)', // Dark brown to match textPrimary
      inputFocus: 'rgb(245, 128, 48)',
      // Status colors - darker versions for light background
      success: 'rgb(4, 120, 87)', // Much darker green for better readability on light bg
      successBg: 'rgba(16, 185, 129, 0.1)',
      successBorder: 'rgba(16, 185, 129, 0.3)',
      error: 'rgb(185, 28, 28)', // Much darker red for better readability on light bg
      errorBg: 'rgba(248, 113, 113, 0.1)',
      errorBorder: 'rgba(248, 113, 113, 0.3)',
      // Focus/outline
      focusOutline: 'rgb(245, 128, 48)',
      // Shadows
      shadow: 'rgba(0, 0, 0, 0.2)',
      shadowStrong: 'rgba(0, 0, 0, 0.3)',
      // Button/Error opacity variations
      buttonBgLight: 'rgba(245, 128, 48, 0.1)',
      buttonBgMedium: 'rgba(245, 128, 48, 0.2)',
      buttonBorderLight: 'rgba(245, 128, 48, 0.25)',
      errorBgLight: 'rgba(239, 68, 68, 0.1)',
      errorBorderLight: 'rgba(239, 68, 68, 0.3)',
      // Auth page overlay - subtle warm beige/cream tint
      authOverlay: 'rgba(250, 240, 220, 0.1)'
    }
  },
  'red-primary': {
    name: 'red-primary',
    displayName: 'Red Primary',
    logoImage: logoCream,
    colors: {
      logo: 'rgb(241, 225, 189)', // F1E1BD - cream
      logoText: 'rgb(241, 225, 189)', // F1E1BD - cream
      // Original red-brown backgrounds - matching deployed version
      bgPrimary: 'rgb(46, 1, 0)', // --main: Very dark red-brown
      bgSecondary: 'rgb(77, 7, 6)', // --main-top: Dark red-brown (for gradient)
      bgCard: 'rgb(46, 1, 0)', // --card: Same as main
      bgGradient: {
        top: 'rgb(77, 7, 6)', // --main-top
        mid: 'rgb(46, 1, 0)', // --main-mid (same as --main)
        bottom: 'rgb(31, 1, 0)' // --main-bottom
      },
      // Text colors - matching deployed contrast colors
      textPrimary: 'rgb(247, 233, 205)', // --contrast-top: Cream (for main titles)
      textSecondary: 'rgb(230, 215, 185)', // Darker, less yellow cream for secondary text
      textMuted: 'rgb(200, 185, 160)', // Even darker, less yellow for muted text
      // Original vibrant red buttons - matching deployed version
      button: 'rgb(217, 70, 52)', // --button: #d94634 - vibrant red
      buttonHover: 'rgb(219, 106, 91)', // --accent: #db6a5b - lighter red
      buttonText: 'rgb(253, 209, 204)', // --btn-text: #fdd1cc - light pink
      accent: 'rgb(219, 106, 91)', // --accent: #db6a5b
      link: 'rgb(219, 106, 91)', // --accent: #db6a5b
      // Borders - light borders for dark background
      border: 'rgba(247, 233, 205, 0.2)', // Use textPrimary with opacity
      borderLight: 'rgba(230, 215, 185, 0.1)', // Use textSecondary with opacity
      // Input fields
      inputBg: 'rgb(46, 1, 0)', // Match bgCard
      inputBorder: 'rgba(247, 233, 205, 0.1)', // Use textPrimary with opacity
      inputText: 'rgb(247, 233, 205)', // Use textPrimary
      inputFocus: 'rgb(217, 70, 52)', // Original vibrant red button
      // Status colors
      success: 'rgb(110, 231, 183)', // 6ee7b7
      successBg: 'rgba(16, 185, 129, 0.15)',
      successBorder: 'rgba(16, 185, 129, 0.35)',
      error: 'rgb(254, 202, 202)', // fecaca
      errorBg: 'rgba(248, 113, 113, 0.15)',
      errorBorder: 'rgba(248, 113, 113, 0.35)',
      // Focus/outline
      focusOutline: 'rgb(217, 70, 52)', // --button: vibrant red
      // Shadows
      shadow: 'rgba(0, 0, 0, 0.3)',
      shadowStrong: 'rgba(0, 0, 0, 0.45)',
      // Button/Error opacity variations
      buttonBgLight: 'rgba(217, 70, 52, 0.1)', // --button with opacity
      buttonBgMedium: 'rgba(217, 70, 52, 0.2)', // --button with opacity
      buttonBorderLight: 'rgba(217, 70, 52, 0.25)', // --button with opacity
      errorBgLight: 'rgba(239, 68, 68, 0.1)',
      errorBorderLight: 'rgba(239, 68, 68, 0.3)',
      // Auth page overlay - yellowish/amber tint (default theme)
      authOverlay: 'rgba(255, 240, 200, 0.15)'
    }
  }
}

