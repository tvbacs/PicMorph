import { ImageStyle, StyleProp } from 'react-native';
import { ColorPresetId, ImageFilters } from '../types';

export interface FilterOverlay {
  key: string;
  backgroundColor: string;
  opacity: number;
}

/**
 * Computes React Native & Web compatible filter style object.
 * Supported by React Native 0.76+ (including RN 0.86) and React Native Web.
 */
export function computeImageFilterStyle(
  filters?: ImageFilters,
  colorPreset?: ColorPresetId
): any {
  if (!filters && (!colorPreset || colorPreset === 'none')) {
    return {};
  }

  const brightness = (filters?.brightness || 0) + (filters?.exposure || 0) * 0.6;
  const contrast = (filters?.contrast || 0) + (filters?.sharpness || 0) * 0.25;
  const saturation = filters?.saturation || 0;
  const isGrayscale = colorPreset === 'grayscale' || saturation <= -95;

  // Multipliers (1.0 = normal 100%)
  const bMultiplier = Math.max(0.05, Math.min(2.5, 1 + brightness / 100));
  const cMultiplier = Math.max(0.1, Math.min(2.5, 1 + contrast / 100));
  const sMultiplier = isGrayscale ? 0 : Math.max(0, Math.min(2.5, 1 + saturation / 100));

  const sepiaMultiplier =
    colorPreset === 'vintage'
      ? 0.45
      : filters?.warmth && filters.warmth > 0
      ? (filters.warmth / 100) * 0.35
      : 0;

  const hueDeg =
    filters?.warmth && filters.warmth < 0
      ? Math.round((filters.warmth / 100) * 35)
      : 0;

  // Build filter array for React Native 0.86 StyleSheet processFilter
  const filterArray: any[] = [
    { brightness: +bMultiplier.toFixed(2) },
    { contrast: +cMultiplier.toFixed(2) },
    { saturate: +sMultiplier.toFixed(2) },
  ];

  if (isGrayscale) {
    filterArray.push({ grayscale: 1 });
  }

  if (sepiaMultiplier > 0) {
    filterArray.push({ sepia: +sepiaMultiplier.toFixed(2) });
  }

  if (hueDeg !== 0) {
    filterArray.push({ hueRotate: hueDeg });
  }

  // Also build string for Web CSS filter compatibility
  const filterString = [
    `brightness(${Math.round(bMultiplier * 100)}%)`,
    `contrast(${Math.round(cMultiplier * 100)}%)`,
    `saturate(${Math.round(sMultiplier * 100)}%)`,
    isGrayscale ? 'grayscale(100%)' : '',
    sepiaMultiplier > 0 ? `sepia(${Math.round(sepiaMultiplier * 100)}%)` : '',
    hueDeg !== 0 ? `hue-rotate(${hueDeg}deg)` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return {
    // React Native parses filterArray; React Native Web uses filterString or filterArray
    filter: filterString as any,
  };
}

/**
 * Returns overlay layers for Warmth, Highlights, Shadows and special preset tones.
 * These are rendered as absolutely positioned Views over the image, ensuring
 * 100% visible, vibrant, beautiful visual feedback on ALL devices and in ViewShot export.
 */
export function getFilterOverlays(
  filters?: ImageFilters,
  colorPreset?: ColorPresetId
): FilterOverlay[] {
  const overlays: FilterOverlay[] = [];

  if (!filters && (!colorPreset || colorPreset === 'none')) {
    return overlays;
  }

  // 1. Warmth (Nhiệt độ màu)
  const warmth = filters?.warmth || 0;
  if (warmth > 5) {
    // Warm golden amber tint
    overlays.push({
      key: 'warmth-warm',
      backgroundColor: '#F59E0B',
      opacity: Math.min(0.42, (warmth / 100) * 0.42),
    });
  } else if (warmth < -5) {
    // Cool icy blue tint
    overlays.push({
      key: 'warmth-cool',
      backgroundColor: '#2563EB',
      opacity: Math.min(0.42, (Math.abs(warmth) / 100) * 0.42),
    });
  }

  // 2. Net Brightness & Exposure overlay assistance
  const netBrightness = (filters?.brightness || 0) + (filters?.exposure || 0) * 0.7;
  if (netBrightness > 5) {
    overlays.push({
      key: 'bright-lighten',
      backgroundColor: '#FFFFFF',
      opacity: Math.min(0.4, (netBrightness / 100) * 0.4),
    });
  } else if (netBrightness < -5) {
    overlays.push({
      key: 'bright-darken',
      backgroundColor: '#000000',
      opacity: Math.min(0.55, (Math.abs(netBrightness) / 100) * 0.55),
    });
  }

  // 3. Highlights (Vùng sáng)
  const highlights = filters?.highlights || 0;
  if (highlights > 5) {
    overlays.push({
      key: 'hl-brighten',
      backgroundColor: '#FFFBEB',
      opacity: Math.min(0.3, (highlights / 100) * 0.3),
    });
  } else if (highlights < -5) {
    overlays.push({
      key: 'hl-dim',
      backgroundColor: '#1C1917',
      opacity: Math.min(0.32, (Math.abs(highlights) / 100) * 0.32),
    });
  }

  // 4. Shadows (Vùng tối)
  const shadows = filters?.shadows || 0;
  if (shadows > 5) {
    overlays.push({
      key: 'shadow-lift',
      backgroundColor: '#E2E8F0',
      opacity: Math.min(0.26, (shadows / 100) * 0.26),
    });
  } else if (shadows < -5) {
    overlays.push({
      key: 'shadow-deepen',
      backgroundColor: '#09090B',
      opacity: Math.min(0.4, (Math.abs(shadows) / 100) * 0.4),
    });
  }

  // 5. Preset specific aesthetic overlays
  if (colorPreset === 'vintage') {
    overlays.push({
      key: 'preset-vintage',
      backgroundColor: '#78350F',
      opacity: 0.18,
    });
  } else if (colorPreset === 'fade') {
    overlays.push({
      key: 'preset-fade',
      backgroundColor: '#64748B',
      opacity: 0.22,
    });
  } else if (colorPreset === 'drama') {
    overlays.push({
      key: 'preset-drama',
      backgroundColor: '#0F172A',
      opacity: 0.25,
    });
  }

  return overlays;
}
