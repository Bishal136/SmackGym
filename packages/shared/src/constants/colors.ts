/**
 * SMACKGYM Canonical Design System Color Tokens
 * Aligned with docs/design.md and WCAG 2.2 AA accessibility standards.
 */
export const BRAND_COLORS = {
  // Primary Action Accent (Electric Lime)
  primary: '#C7FF00',
  primaryHover: '#B2E600',
  primaryMuted: 'rgba(199, 255, 0, 0.15)',

  // Deep Neutral / Text Inks
  black: '#101212',
  charcoal: '#1A1D1D',
  surfaceDark: '#222626',
  borderDark: '#2E3434',

  // Canvas / Light Theme (80-85% Canvas)
  canvasWhite: '#FFFFFF',
  canvasOffWhite: '#F6F7F3',
  surfaceLight: '#FFFFFF',
  borderLight: '#E5E7EB',
  textSecondary: '#6B7280',

  // System & Clinical Safety Accents
  alertRed: '#FF4B4B',        // Sharp pain / Something hurts / Emergency hold
  alertRedMuted: 'rgba(255, 75, 75, 0.12)',
  successGreen: '#22C55E',    // Completed set / Personal Best / Ready
  warningAmber: '#EAB308',    // Deload suggested / Moderate fatigue
  infoBlue: '#3B82F6',        // Recovery tips / Research cards
  purpleCoach: '#8B5CF6',     // Professional Mode badge
} as const;

export type BrandColorKey = keyof typeof BRAND_COLORS;
