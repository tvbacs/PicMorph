import { Platform } from 'react-native';
import { AspectRatioOption, CanvasStyleConfig, TextOverlayConfig } from '../types';

export interface FontOption {
  id: string;
  name: string;
  fontFamily?: string;
  fontWeight?: '900' | '800' | '700' | '600' | 'bold' | 'normal';
  fontStyle?: 'normal' | 'italic';
  samplePreview: string;
}

export const FONT_OPTIONS: FontOption[] = [
  {
    id: 'heavy-sans',
    name: 'Đậm nét TikTok Mặc định',
    fontFamily: Platform.select({ ios: 'HelveticaNeue-Bold', android: 'sans-serif-black', default: 'sans-serif' }),
    fontWeight: '900',
    fontStyle: 'normal',
    samplePreview: 'CAILIN',
  },
  {
    id: 'serif-royal',
    name: 'Cổ điển Nữ Vương',
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
    fontWeight: '700',
    fontStyle: 'normal',
    samplePreview: 'CAILIN',
  },
  {
    id: 'condensed-fashion',
    name: 'Thon cao Tạp chí',
    fontFamily: Platform.select({ ios: 'Arial-BoldMT', android: 'sans-serif-condensed', default: 'sans-serif-condensed' }),
    fontWeight: '800',
    fontStyle: 'normal',
    samplePreview: 'CAILIN',
  },
  {
    id: 'modern-clean',
    name: 'Thanh lịch Minimal',
    fontFamily: Platform.select({ ios: 'HelveticaNeue-Medium', android: 'sans-serif-medium', default: 'sans-serif' }),
    fontWeight: '600',
    fontStyle: 'normal',
    samplePreview: 'CAILIN',
  },
  {
    id: 'monospace-cyber',
    name: 'Cyberpunk Game',
    fontFamily: Platform.select({ ios: 'CourierNewPS-BoldMT', android: 'monospace', default: 'monospace' }),
    fontWeight: '700',
    fontStyle: 'normal',
    samplePreview: 'CAILIN',
  },
  {
    id: 'italic-art',
    name: 'Nghệ thuật Italic',
    fontFamily: Platform.select({ ios: 'Georgia-Italic', android: 'serif', default: 'serif' }),
    fontWeight: '700',
    fontStyle: 'italic',
    samplePreview: 'CAILIN',
  },
];

export const ASPECT_RATIOS: AspectRatioOption[] = [
  {
    id: '9:16',
    label: '9:16',
    sublabel: 'TikTok Reels',
    ratio: 9 / 16,
    iconType: 'tiktok',
  },
  {
    id: '1:1',
    label: '1:1',
    sublabel: 'Instagram Feed',
    ratio: 1 / 1,
    iconType: 'instagram',
  },
  {
    id: '16:9',
    label: '16:9',
    sublabel: 'YouTube Ngang',
    ratio: 16 / 9,
    iconType: 'youtube',
  },
  {
    id: '4:3',
    label: '4:3',
    sublabel: 'Tiêu chuẩn TV',
    ratio: 4 / 3,
    iconType: 'youtube',
  },
  {
    id: '3:4',
    label: '3:4',
    sublabel: 'Khổ dọc',
    ratio: 3 / 4,
    iconType: 'frame',
    frameWidth: 16,
    frameHeight: 22,
  },
  {
    id: '5.8"',
    label: '5.8"',
    sublabel: 'Dọc điện thoại',
    ratio: 9 / 19.5,
    iconType: 'frame',
    frameWidth: 12,
    frameHeight: 25,
  },
  {
    id: '2:1',
    label: '2:1',
    sublabel: 'Toàn cảnh',
    ratio: 2 / 1,
    iconType: 'frame',
    frameWidth: 26,
    frameHeight: 13,
  },
  {
    id: '2.35:1',
    label: '2.35:1',
    sublabel: 'Cinemascope',
    ratio: 2.35 / 1,
    iconType: 'frame',
    frameWidth: 30,
    frameHeight: 12,
  },
  {
    id: '1.85:1',
    label: '1.85:1',
    sublabel: 'Điện ảnh',
    ratio: 1.85 / 1,
    iconType: 'frame',
    frameWidth: 25,
    frameHeight: 13,
  },
];

export interface ColorOption {
  label: string;
  value: string;
}

export interface ColorCategory {
  id: string;
  name: string;
  colors: ColorOption[];
}

export const COLOR_CATEGORIES: ColorCategory[] = [
  {
    id: 'minimal',
    name: 'Tối giản & Đen Trắng',
    colors: [
      { label: 'Đen nhung', value: '#000000' },
      { label: 'Đen than', value: '#121212' },
      { label: 'Đen xám', value: '#1E1E24' },
      { label: 'Xám đậm', value: '#27272A' },
      { label: 'Xám than chì', value: '#3F3F46' },
      { label: 'Xám ghi', value: '#71717A' },
      { label: 'Xám xi măng', value: '#A1A1AA' },
      { label: 'Trắng xám', value: '#E4E4E7' },
      { label: 'Trắng sứ', value: '#FFFFFF' },
      { label: 'Trắng ngà', value: '#F5F5DC' },
      { label: 'Kem vani', value: '#FAF7F2' },
      { label: 'Be cát', value: '#E7E5E4' },
    ],
  },
  {
    id: 'pastel',
    name: 'Hàn Quốc & Pastel Trend',
    colors: [
      { label: 'Hồng baby', value: '#FCE7F3' },
      { label: 'Hồng đào', value: '#FBCFE8' },
      { label: 'Tím hoa cà', value: '#EDE9FE' },
      { label: 'Tím lavender', value: '#DDD6FE' },
      { label: 'Xanh baby blue', value: '#E0F2FE' },
      { label: 'Xanh mây trời', value: '#BAE6FD' },
      { label: 'Xanh ngọc nhạt', value: '#CCFBF1' },
      { label: 'Xanh bạc hà', value: '#D1FAE5' },
      { label: 'Xanh matcha', value: '#D9F99D' },
      { label: 'Vàng bơ', value: '#FEF08A' },
      { label: 'Cam đào pastel', value: '#FED7AA' },
      { label: 'Cam sữa', value: '#FFEDD5' },
    ],
  },
  {
    id: 'vintage',
    name: 'Tông Ấm & Vintage Film',
    colors: [
      { label: 'Nâu espresso', value: '#271B17' },
      { label: 'Nâu socola', value: '#3E2723' },
      { label: 'Nâu caramel', value: '#5D4037' },
      { label: 'Nâu gỗ ấm', value: '#795548' },
      { label: 'Nâu đất nung', value: '#9A3412' },
      { label: 'Cam đất cháy', value: '#C2410C' },
      { label: 'Đỏ mận', value: '#4C0519' },
      { label: 'Đỏ rượu vang', value: '#881337' },
      { label: 'Đỏ nhung', value: '#BE123C' },
      { label: 'Vàng mù tạt', value: '#B45309' },
      { label: 'Xanh ô liu', value: '#3F6212' },
      { label: 'Xanh rêu retro', value: '#1C3D2B' },
    ],
  },
  {
    id: 'vibrant',
    name: 'Rực Rỡ & Cá Tính',
    colors: [
      { label: 'Xanh cobalt', value: '#1D4ED8' },
      { label: 'Xanh hoàng gia', value: '#2563EB' },
      { label: 'Xanh cyan', value: '#06B6D4' },
      { label: 'Xanh lục bảo', value: '#059669' },
      { label: 'Tím neon', value: '#7C3AED' },
      { label: 'Tím violet', value: '#9333EA' },
      { label: 'Hồng cánh sen', value: '#DB2777' },
      { label: 'Hồng neon', value: '#EC4899' },
      { label: 'Đỏ cherry', value: '#DC2626' },
      { label: 'Cam san hô', value: '#EA580C' },
      { label: 'Vàng rực rỡ', value: '#FACC15' },
      { label: 'Vàng nghệ', value: '#EAB308' },
    ],
  },
];

// Flat list for easy reference
export const COLOR_PALETTE: ColorOption[] = COLOR_CATEGORIES.flatMap((c) => c.colors);

export const DEFAULT_CANVAS_STYLE: CanvasStyleConfig = {
  gap: 2,               // 2px sleek border between photos
  padding: 0,           // 0px outer margin
  borderRadius: 0,      // sharp clean edges
  bgColor: '#000000',   // TikTok black background
};

export const DEFAULT_TEXT_CONFIG: TextOverlayConfig = {
  enabled: true,
  text: 'CAILIN',
  fontSize: 34,
  color: '#FFFFFF',
  letterSpacing: 6,
  uppercase: true,
  hasBackground: false,
  bgColor: 'rgba(0,0,0,0.4)',
  bgOpacity: 0.4,
  hasShadow: true,
  shadowColor: 'rgba(0, 0, 0, 0.75)',
  hasStroke: true,
  strokeColor: 'rgba(0, 0, 0, 0.8)',
  position: 'center',
  positionX: 0,
  positionY: 0,
  subtitle: '',
  fontId: 'heavy-sans',
  fontFamily: Platform.select({ ios: 'HelveticaNeue-Bold', android: 'sans-serif-black', default: 'sans-serif' }),
  fontWeight: '900',
  fontStyle: 'normal',
};
