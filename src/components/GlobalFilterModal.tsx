import React, { useState, useRef, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  PanResponder,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  ImageFilters,
  DEFAULT_IMAGE_FILTERS,
  COLOR_PRESETS,
  ColorPresetId,
} from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDER_W = SCREEN_WIDTH - 80;
const THUMB = 22;

// ─── Mini Slider ────────────────────────────────────────────────────────────
interface SliderProps {
  value: number;
  min: number;
  max: number;
  color: string;
  onChange: (v: number) => void;
}

const Slider: React.FC<SliderProps> = ({ value, min, max, color, onChange }) => {
  const range = max - min;
  const ratio = (value - min) / range;
  const thumbPos = ratio * SLIDER_W;
  const startRef = useRef({ ratio: 0, startX: 0 });

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        startRef.current = { ratio: (value - min) / range, startX: evt.nativeEvent.pageX };
      },
      onPanResponderMove: (evt) => {
        const dx = evt.nativeEvent.pageX - startRef.current.startX;
        const newRatio = Math.min(1, Math.max(0, startRef.current.ratio + dx / SLIDER_W));
        onChange(Math.round(min + newRatio * range));
      },
    })
  ).current;

  const hasCenter = min < 0 && max > 0;
  return (
    <View style={sStyle.track} {...pan.panHandlers}>
      <View style={sStyle.rail} />
      {hasCenter ? (
        thumbPos >= SLIDER_W / 2 ? (
          <View style={[sStyle.fillC, { backgroundColor: color, left: SLIDER_W / 2 + THUMB / 2, width: thumbPos - SLIDER_W / 2 }]} />
        ) : (
          <View style={[sStyle.fillC, { backgroundColor: color, left: thumbPos + THUMB / 2, width: SLIDER_W / 2 - thumbPos }]} />
        )
      ) : (
        <View style={[sStyle.fill, { backgroundColor: color, width: thumbPos }]} />
      )}
      {hasCenter && <View style={sStyle.centerTick} />}
      <View style={[sStyle.thumb, { left: thumbPos, borderColor: color }]} />
    </View>
  );
};

const sStyle = StyleSheet.create({
  track: { width: SLIDER_W, height: THUMB + 16, justifyContent: 'center', position: 'relative' },
  rail: { position: 'absolute', left: THUMB / 2, right: THUMB / 2, height: 3, borderRadius: 2, backgroundColor: '#3F3F46' },
  fill: { position: 'absolute', left: THUMB / 2, height: 3, borderRadius: 2, top: (THUMB + 16) / 2 - 1.5 },
  fillC: { position: 'absolute', height: 3, borderRadius: 2, top: (THUMB + 16) / 2 - 1.5 },
  centerTick: { position: 'absolute', left: SLIDER_W / 2 + THUMB / 2 - 1, width: 2, height: 8, borderRadius: 1, backgroundColor: '#71717A', top: (THUMB + 16) / 2 - 4 },
  thumb: { position: 'absolute', width: THUMB, height: THUMB, borderRadius: THUMB / 2, backgroundColor: '#FFF', borderWidth: 2.5, top: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 4, elevation: 4 },
});

const FILTER_ITEMS = [
  { key: 'brightness'  as keyof ImageFilters, label: 'Độ sáng',       icon: 'sunny-outline',            min: -100, max: 100, color: '#FBBF24' },
  { key: 'exposure'    as keyof ImageFilters, label: 'Độ phơi sáng',   icon: 'aperture-outline',         min: -100, max: 100, color: '#60A5FA' },
  { key: 'highlights'  as keyof ImageFilters, label: 'Vùng sáng',      icon: 'radio-button-off-outline', min: -100, max: 100, color: '#FCD34D' },
  { key: 'shadows'     as keyof ImageFilters, label: 'Vùng tối',       icon: 'moon-outline',             min: -100, max: 100, color: '#818CF8' },
  { key: 'contrast'    as keyof ImageFilters, label: 'Tương phản',     icon: 'contrast-outline',         min: -100, max: 100, color: '#A78BFA' },
  { key: 'saturation'  as keyof ImageFilters, label: 'Độ bão hoà',     icon: 'water-outline',            min: -100, max: 100, color: '#34D399' },
  { key: 'warmth'      as keyof ImageFilters, label: 'Nhiệt độ màu',   icon: 'thermometer-outline',      min: -100, max: 100, color: '#F97316' },
  { key: 'sharpness'   as keyof ImageFilters, label: 'Làm sắc nét',    icon: 'options-outline',          min:    0, max: 100, color: '#E879F9' },
];

// ─── GlobalFilterModal ───────────────────────────────────────────────────────
interface GlobalFilterModalProps {
  visible: boolean;
  globalFilters: ImageFilters;
  globalPreset: ColorPresetId;
  onClose: () => void;
  onApply: (filters: ImageFilters, preset: ColorPresetId) => void;
}

export const GlobalFilterModal: React.FC<GlobalFilterModalProps> = ({
  visible,
  globalFilters,
  globalPreset,
  onClose,
  onApply,
}) => {
  const [filters, setFilters] = useState<ImageFilters>({ ...globalFilters });
  const [selectedPreset, setSelectedPreset] = useState<ColorPresetId>(globalPreset);
  const [activeKey, setActiveKey] = useState<keyof ImageFilters>('brightness');

  React.useEffect(() => {
    if (visible) {
      setFilters({ ...globalFilters });
      setSelectedPreset(globalPreset);
      setActiveKey('brightness');
    }
  }, [visible]);

  const handleSelectPreset = (preset: typeof COLOR_PRESETS[0]) => {
    setSelectedPreset(preset.id);
    if (preset.id === 'none') {
      setFilters({ ...DEFAULT_IMAGE_FILTERS });
    } else {
      setFilters({ ...DEFAULT_IMAGE_FILTERS, ...preset.filters });
    }
  };

  const handleChange = useCallback((key: keyof ImageFilters, val: number) => {
    setFilters((prev) => ({ ...prev, [key]: val }));
    setSelectedPreset('none');
  }, []);

  const handleReset = () => {
    setFilters({ ...DEFAULT_IMAGE_FILTERS });
    setSelectedPreset('none');
  };

  const handleApply = () => {
    onApply(filters, selectedPreset);
    onClose();
  };

  const activeItem = FILTER_ITEMS.find((f) => f.key === activeKey)!;
  const isModified = Object.keys(filters).some((k) => filters[k as keyof ImageFilters] !== 0);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
              <Ionicons name="close" size={22} color="#A1A1AA" />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.title}>Bộ lọc toàn bộ ảnh</Text>
              <Text style={styles.subtitle}>Áp dụng cho tất cả ô ảnh</Text>
            </View>
            <TouchableOpacity onPress={handleApply} style={styles.applyBtn}>
              <Text style={styles.applyText}>Áp dụng</Text>
            </TouchableOpacity>
          </View>

          {/* Preset chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.presetsRow}
          >
            {COLOR_PRESETS.map((preset) => {
              const isActive = selectedPreset === preset.id;
              return (
                <TouchableOpacity
                  key={preset.id}
                  style={[styles.presetChip, isActive && { borderColor: preset.iconColor }]}
                  onPress={() => handleSelectPreset(preset)}
                  activeOpacity={0.75}
                >
                  <View style={[
                    styles.presetIconWrap,
                    { backgroundColor: isActive ? preset.iconColor + '30' : '#32323D' },
                  ]}>
                    <Ionicons
                      name={preset.iconName as any}
                      size={22}
                      color={isActive ? preset.iconColor : '#71717A'}
                    />
                  </View>
                  <Text style={[styles.presetLabel, isActive && { color: preset.iconColor }]}>
                    {preset.label}
                  </Text>
                  {isActive && <View style={[styles.presetActiveDot, { backgroundColor: preset.iconColor }]} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Active value */}
          <View style={styles.activeValueRow}>
            <Ionicons name={activeItem.icon as any} size={18} color={activeItem.color} />
            <Text style={[styles.activeLabel, { color: activeItem.color }]}>{activeItem.label}</Text>
            <Text style={styles.activeValue}>
              {filters[activeKey] > 0 ? `+${filters[activeKey]}` : filters[activeKey]}
            </Text>
          </View>

          {/* Slider */}
          <View style={styles.sliderRow}>
            <Slider
              value={filters[activeKey]}
              min={activeItem.min}
              max={activeItem.max}
              color={activeItem.color}
              onChange={(v) => handleChange(activeKey, v)}
            />
          </View>

          {/* Filter pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillsContainer}
          >
            {FILTER_ITEMS.map((item) => {
              const isActive = activeKey === item.key;
              const isDirty  = filters[item.key] !== 0;
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[styles.pill, isActive && { borderColor: item.color }]}
                  onPress={() => setActiveKey(item.key)}
                  activeOpacity={0.75}
                >
                  <View style={[styles.pillIconWrap, isActive && { backgroundColor: item.color + '22' }]}>
                    <Ionicons name={item.icon as any} size={20} color={isActive ? item.color : '#71717A'} />
                    {isDirty && <View style={[styles.dirtyDot, { backgroundColor: item.color }]} />}
                  </View>
                  <Text style={[styles.pillLabel, isActive && { color: '#FFFFFF' }]}>{item.label}</Text>
                  <Text style={[styles.pillValue, isActive && { color: item.color }]}>
                    {filters[item.key] > 0 ? `+${filters[item.key]}` : filters[item.key]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Reset */}
          <TouchableOpacity
            style={[styles.resetBtn, !isModified && styles.resetBtnDisabled]}
            onPress={handleReset}
            disabled={!isModified}
          >
            <Ionicons name="refresh-outline" size={16} color={isModified ? '#A1A1AA' : '#3F3F46'} />
            <Text style={[styles.resetText, !isModified && styles.resetTextDisabled]}>Đặt lại tất cả</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#1C1C22', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 16, paddingBottom: 36, paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 14 },
  iconBtn: { padding: 6 },
  headerCenter: { alignItems: 'center' },
  title: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  subtitle: { color: '#71717A', fontSize: 11, marginTop: 2 },
  applyBtn: { backgroundColor: '#3B82F6', paddingHorizontal: 16, paddingVertical: 7, borderRadius: 18 },
  applyText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },

  // Presets
  presetsRow: { paddingBottom: 14, gap: 8 },
  presetChip: {
    alignItems: 'center',
    backgroundColor: '#25252D',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#2D2D36',
    paddingHorizontal: 10,
    paddingVertical: 10,
    minWidth: 72,
    position: 'relative',
    gap: 6,
  },
  presetIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  presetLabel: { color: '#71717A', fontSize: 10, fontWeight: '600', textAlign: 'center' },
  presetActiveDot: { position: 'absolute', top: 5, right: 5, width: 6, height: 6, borderRadius: 3 },

  // Slider
  activeValueRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, paddingLeft: 4 },
  activeLabel: { fontSize: 14, fontWeight: '700', flex: 1 },
  activeValue: { color: '#FFFFFF', fontSize: 20, fontWeight: '800', minWidth: 48, textAlign: 'right' },
  sliderRow: { alignItems: 'flex-start', paddingLeft: 20, marginBottom: 20 },

  // Pills
  pillsContainer: { gap: 10, paddingBottom: 12 },
  pill: { alignItems: 'center', backgroundColor: '#202026', borderRadius: 14, borderWidth: 1.5, borderColor: '#2D2D36', paddingHorizontal: 12, paddingVertical: 10, minWidth: 80, gap: 4 },
  pillIconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#2D2D36', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  dirtyDot: { position: 'absolute', top: 2, right: 2, width: 7, height: 7, borderRadius: 4, borderWidth: 1.5, borderColor: '#1C1C22' },
  pillLabel: { color: '#71717A', fontSize: 10, fontWeight: '600', textAlign: 'center' },
  pillValue: { color: '#52525B', fontSize: 11, fontWeight: '700' },

  // Reset
  resetBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 4, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#2D2D36', backgroundColor: '#202026' },
  resetBtnDisabled: { opacity: 0.4 },
  resetText: { color: '#A1A1AA', fontSize: 13, fontWeight: '600' },
  resetTextDisabled: { color: '#3F3F46' },
});
