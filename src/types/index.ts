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

export interface CanvasStyleConfig {
  gap: number;           // Spacing between photos in px
  padding: number;       // Outer canvas padding in px
  borderRadius: number;  // Corner radius in px
  bgColor: string;       // Canvas background color
}
