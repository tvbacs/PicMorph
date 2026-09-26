export type AspectRatioType =
  | '9:16'
  | '1:1'
  | '16:9'
  | '4:3'
  | '3:4'
  | '5.8"'
  | '2:1'
  | '2.35:1'
  | '1.85:1';

export interface AspectRatioOption {
  id: AspectRatioType;
  label: string;
  sublabel: string;
  ratio: number; // width / height
  iconType: 'tiktok' | 'instagram' | 'youtube' | 'frame';
  frameWidth?: number;
  frameHeight?: number;
}

export interface SlotLayout {
  id: number;
  // Normalized percentage coordinates (0 - 100)
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface LayoutPreset {
  id: string;
  name: string;
  subtitle: string;
  slotsCount: number;
  slots: SlotLayout[];
  isFeatured?: boolean;
}

export interface ImageFilters {
  brightness: number;   // -100 to 100, default 0
  contrast: number;     // -100 to 100, default 0
  saturation: number;   // -100 to 100, default 0
  exposure: number;     // -100 to 100, default 0
  sharpness: number;    // 0 to 100, default 0
  warmth: number;       // -100 to 100, default 0
  highlights: number;   // -100 to 100, default 0
  shadows: number;      // -100 to 100, default 0
}

export const DEFAULT_IMAGE_FILTERS: ImageFilters = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  exposure: 0,
  sharpness: 0,
  warmth: 0,
  highlights: 0,
  shadows: 0,
};

export type ColorPresetId =
  | 'none'
  | 'grayscale'
  | 'warm'
  | 'cool'
  | 'vintage'
  | 'fade'
  | 'vivid'
  | 'drama';

export interface ColorPreset {
  id: ColorPresetId;
  label: string;
  iconName: string;   // Ionicons name
  iconColor: string;  // icon tint color
  filters: Partial<ImageFilters>;
}

export const COLOR_PRESETS: ColorPreset[] = [
  {
    id: 'none',
    label: 'Gốc',
    iconName: 'image-outline',
    iconColor: '#A1A1AA',
    filters: {},
  },
  {
    id: 'grayscale',
    label: 'Xám',
    iconName: 'contrast-outline',
    iconColor: '#D4D4D8',
    filters: { saturation: -100, contrast: 10 },
  },
  {
    id: 'warm',
    label: 'Ấm',
    iconName: 'sunny-outline',
    iconColor: '#FB923C',
    filters: { warmth: 50, brightness: 5, saturation: 15 },
  },
  {
    id: 'cool',
    label: 'Lạnh',
    iconName: 'snow-outline',
    iconColor: '#60A5FA',
    filters: { warmth: -50, brightness: 5, saturation: 10 },
  },
  {
    id: 'vintage',
    label: 'Cổ điển',
    iconName: 'film-outline',
    iconColor: '#D97706',
    filters: { warmth: 30, saturation: -30, contrast: 20, brightness: -10 },
  },
  {
    id: 'fade',
    label: 'Mờ nhạt',
    iconName: 'partly-sunny-outline',
    iconColor: '#94A3B8',
    filters: { brightness: 20, saturation: -40, contrast: -20 },
  },
  {
    id: 'vivid',
    label: 'Rực rỡ',
    iconName: 'color-palette-outline',
    iconColor: '#A78BFA',
    filters: { saturation: 60, contrast: 20, brightness: 5 },
  },
  {
    id: 'drama',
    label: 'Kịch tính',
    iconName: 'thunderstorm-outline',
    iconColor: '#F43F5E',
    filters: { contrast: 50, brightness: -15, saturation: 20 },
  },
];

export interface SlotImageState {
  id: number;
  uri: string | null;
  scale: number;        // 1.0 to 3.0
  offsetX: number;      // px offset
  offsetY: number;      // px offset
  normX?: number;       // relative normalized offset X (-1 to 1)
  normY?: number;       // relative normalized offset Y (-1 to 1)
  rotation: number;     // 0, 90, 180, 270
  flipH: boolean;
  flipV: boolean;
  fitMode?: 'contain' | 'cover';
  filters?: ImageFilters;
  colorPreset?: ColorPresetId;  // selected color preset ID
  origWidth?: number;           // original image width from gallery
  origHeight?: number;          // original image height from gallery
}

export interface TextOverlayConfig {
  enabled: boolean;
  text: string;
  fontSize: number;
  color: string;
  letterSpacing: number;
  uppercase: boolean;
  hasBackground: boolean;
  bgColor: string;
  bgOpacity: number;
  hasShadow: boolean;
  shadowColor: string;
  hasStroke: boolean;
  strokeColor: string;
  position?: 'center' | 'top' | 'bottom';
  positionX?: number; // drag offset X in px
  positionY?: number; // drag offset Y in px
  subtitle?: string;
  fontId?: string;
  fontFamily?: string;
  fontStyle?: 'normal' | 'italic';
  fontWeight?: '900' | '800' | '700' | '600' | 'bold' | 'normal';
}

export interface TextItem {
  id: string;
  text: string;
  fontSize: number;
  color: string;
  x: number; // px offset from center of canvas
  y: number; // px offset from center of canvas
  letterSpacing?: number;
  uppercase?: boolean;
  hasBackground?: boolean;
  bgColor?: string;
  bgOpacity?: number;
  hasShadow?: boolean;
  shadowColor?: string;
  fontId?: string;
  fontFamily?: string;
  fontStyle?: 'normal' | 'italic';
  fontWeight?: '900' | '800' | '700' | '600' | 'bold' | 'normal';
}

export interface CanvasStyleConfig {
  gap: number;           // Spacing between photos in px
  padding: number;       // Outer canvas padding in px
  borderRadius: number;  // Corner radius in px
  bgColor: string;       // Canvas background color
}

export interface DraftItem {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  thumbnailUri?: string | null;
  layoutId: string;
  ratioId: AspectRatioType;
  slots: SlotImageState[];
  textConfig?: TextOverlayConfig;
  texts?: TextItem[];
  canvasStyle: CanvasStyleConfig;
}

