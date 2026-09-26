import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  PanResponder,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  SlotImageState,
  SlotLayout,
  ImageFilters,
  DEFAULT_IMAGE_FILTERS,
  COLOR_PRESETS,
  ColorPresetId,
} from '../types';
import { computeImageFilterStyle, getFilterOverlays } from '../utils/filterUtils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDER_W = SCREEN_WIDTH - 80;
const THUMB = 22;

interface CropModalProps {
  visible: boolean;
  slotIndex: number | null;
  slotData: SlotImageState | null;
  slotLayout?: SlotLayout | null;
  canvasWidth?: number;
  canvasHeight?: number;
  borderRadius?: number;
  onClose: () => void;
  onSave: (updatedSlot: SlotImageState) => void;
  onReplaceImage: () => void;
  onRemoveImage: () => void;
  onApplyFilterToAll?: (filters: ImageFilters, preset: ColorPresetId) => void;
}

// ─── Mini Slider ────────────────────────────────────────────────────────────
interface SliderProps {
  value: number;
  min: number;
  max: number;
  color: string;
  onChange: (v: number) => void;
}

const MiniSlider: React.FC<SliderProps> = ({ value, min, max, color, onChange }) => {
  const range = max - min;
  const ratio = (value - min) / range;
  const thumbPos = ratio * SLIDER_W;
  const startRef = useRef({ ratio: 0, startX: 0 });

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const curRatio = (value - min) / range;
        startRef.current = { ratio: curRatio, startX: evt.nativeEvent.pageX };
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
          <View
            style={[sStyle.fillC, {
              backgroundColor: color,
              left: SLIDER_W / 2 + THUMB / 2,
              width: thumbPos - SLIDER_W / 2,
            }]}
          />
        ) : (
          <View
            style={[sStyle.fillC, {
              backgroundColor: color,
              left: thumbPos + THUMB / 2,
              width: SLIDER_W / 2 - thumbPos,
            }]}
          />
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
  { key: 'brightness'  as keyof ImageFilters, label: 'Độ sáng',       icon: 'sunny-outline',       min: -100, max: 100, color: '#FBBF24' },
  { key: 'exposure'    as keyof ImageFilters, label: 'Độ phơi sáng',   icon: 'aperture-outline',    min: -100, max: 100, color: '#60A5FA' },
  { key: 'highlights'  as keyof ImageFilters, label: 'Vùng sáng',      icon: 'radio-button-off-outline', min: -100, max: 100, color: '#FCD34D' },
  { key: 'shadows'     as keyof ImageFilters, label: 'Vùng tối',       icon: 'moon-outline',        min: -100, max: 100, color: '#818CF8' },
  { key: 'contrast'    as keyof ImageFilters, label: 'Tương phản',     icon: 'contrast-outline',    min: -100, max: 100, color: '#A78BFA' },
  { key: 'saturation'  as keyof ImageFilters, label: 'Độ bão hoà',     icon: 'water-outline',       min: -100, max: 100, color: '#34D399' },
  { key: 'warmth'      as keyof ImageFilters, label: 'Nhiệt độ màu',   icon: 'thermometer-outline', min: -100, max: 100, color: '#F97316' },
  { key: 'sharpness'   as keyof ImageFilters, label: 'Làm sắc nét',    icon: 'options-outline',     min:    0, max: 100, color: '#E879F9' },
];

// ─── Main CropModal ─────────────────────────────────────────────────────────
type TabId = 'crop' | 'filter';

export const CropModal: React.FC<CropModalProps> = ({
  visible,
  slotIndex,
  slotData,
  slotLayout,
  canvasWidth,
  canvasHeight,
  borderRadius,
  onClose,
  onSave,
  onReplaceImage,
  onRemoveImage,
  onApplyFilterToAll,
}) => {
  // ── crop states ──
  const [scale, setScale] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [fitMode, setFitMode] = useState<'contain' | 'cover'>('contain');

  // ── filter states ──
  const [activeTab, setActiveTab] = useState<TabId>('crop');
  const [selectedPreset, setSelectedPreset] = useState<ColorPresetId>('none');
  const [filters, setFilters] = useState<ImageFilters>({ ...DEFAULT_IMAGE_FILTERS });
  const [activeKey, setActiveKey] = useState<keyof ImageFilters>('brightness');
  const [appliedAllSuccess, setAppliedAllSuccess] = useState(false);

  // ── slot geometry ──
  const actualSlotW = slotLayout ? ((canvasWidth || 360) * slotLayout.width) / 100 : 180;
  const actualSlotH = slotLayout ? ((canvasHeight || 360) * slotLayout.height) / 100 : 180;
  const slotAspect = actualSlotH > 0 ? actualSlotW / actualSlotH : 1;

  const MAX_W = 280;
  const MAX_H = 290;
  let frameWidth: number;
  let frameHeight: number;
  if (slotAspect >= 1) {
    frameWidth = MAX_W;
    frameHeight = Math.round(MAX_W / slotAspect);
    if (frameHeight > MAX_H) { frameHeight = MAX_H; frameWidth = Math.round(MAX_H * slotAspect); }
  } else {
    frameHeight = MAX_H;
    frameWidth = Math.round(MAX_H * slotAspect);
    if (frameWidth > MAX_W) { frameWidth = MAX_W; frameHeight = Math.round(MAX_W / slotAspect); }
  }

  const stateRef = useRef({
    x: 0,
    y: 0,
    scale: 1,
    // 1-finger drag tracking
    lastTouchX: 0,
    lastTouchY: 0,
    // 2-finger pinch & dual-drag tracking
    isPinching: false,
    initialDistance: 0,
    startScale: 1,
    lastMidX: 0,
    lastMidY: 0,
  });

  useEffect(() => {
    if (visible && slotData) {
      const initScale = slotData.scale || 1;
      const initRot   = slotData.rotation || 0;
      const initFlipH = slotData.flipH || false;
      const initFlipV = slotData.flipV || false;
      const initFit   = slotData.fitMode || 'contain';

      let initX = 0, initY = 0;
      if (slotData.normX !== undefined && slotData.normY !== undefined) {
        initX = Math.round(slotData.normX * frameWidth);
        initY = Math.round(slotData.normY * frameHeight);
      } else if (actualSlotW > 0 && actualSlotH > 0 && (slotData.offsetX || slotData.offsetY)) {
        initX = Math.round((slotData.offsetX / actualSlotW) * frameWidth);
        initY = Math.round((slotData.offsetY / actualSlotH) * frameHeight);
      }

      setScale(initScale); setOffsetX(initX); setOffsetY(initY);
      setRotation(initRot); setFlipH(initFlipH); setFlipV(initFlipV); setFitMode(initFit);
      stateRef.current = {
        x: initX,
        y: initY,
        scale: initScale,
        lastTouchX: 0,
        lastTouchY: 0,
        isPinching: false,
        initialDistance: 0,
        startScale: initScale,
        lastMidX: 0,
        lastMidY: 0,
      };

      // init filter states
      const initFilters = slotData.filters ? { ...DEFAULT_IMAGE_FILTERS, ...slotData.filters } : { ...DEFAULT_IMAGE_FILTERS };
      setFilters(initFilters);
      setSelectedPreset(slotData.colorPreset || 'none');
      setActiveKey('brightness');
      setActiveTab('crop');
    }
  }, [visible, slotData, frameWidth, frameHeight]);

  const getDistance = (touches: any[]) => {
    if (!touches || touches.length < 2) return 0;
    const [t1, t2] = touches;
    const dx = t1.pageX - t2.pageX;
    const dy = t1.pageY - t2.pageY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getMidpoint = (touches: any[]) => {
    if (!touches || touches.length < 2) return { x: 0, y: 0 };
    const [t1, t2] = touches;
    return {
      x: (t1.pageX + t2.pageX) / 2,
      y: (t1.pageY + t2.pageY) / 2,
    };
  };

  const panResponderRef = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const touches = evt.nativeEvent.touches;
        if (touches && touches.length >= 2) {
          stateRef.current.isPinching = true;
          stateRef.current.initialDistance = getDistance(touches);
          stateRef.current.startScale = stateRef.current.scale;
          const mid = getMidpoint(touches);
          stateRef.current.lastMidX = mid.x;
          stateRef.current.lastMidY = mid.y;
        } else if (touches && touches.length === 1) {
          stateRef.current.isPinching = false;
          stateRef.current.initialDistance = 0;
          stateRef.current.lastTouchX = touches[0].pageX;
          stateRef.current.lastTouchY = touches[0].pageY;
        }
      },
      onPanResponderMove: (evt) => {
        const touches = evt.nativeEvent.touches;
        if (!touches) return;

        if (touches.length >= 2) {
          const currentDist = getDistance(touches);
          const mid = getMidpoint(touches);

          if (!stateRef.current.isPinching || stateRef.current.initialDistance <= 0) {
            // Ngón thứ 2 vừa chạm vào màn hình trong lúc đang thao tác
            stateRef.current.isPinching = true;
            stateRef.current.initialDistance = currentDist > 0 ? currentDist : 1;
            stateRef.current.startScale = stateRef.current.scale;
            stateRef.current.lastMidX = mid.x;
            stateRef.current.lastMidY = mid.y;
          } else {
            // Đang zoom 2 ngón tay
            const factor = currentDist / stateRef.current.initialDistance;
            const newScale = Math.min(5.0, Math.max(0.4, stateRef.current.startScale * factor));
            const roundedScale = Math.round(newScale * 100) / 100;
            setScale(roundedScale);
            stateRef.current.scale = roundedScale;

            // Đồng thời di chuyển theo tâm giữa 2 ngón tay
            const dMidX = mid.x - stateRef.current.lastMidX;
            const dMidY = mid.y - stateRef.current.lastMidY;
            const newX = Math.round(stateRef.current.x + dMidX);
            const newY = Math.round(stateRef.current.y + dMidY);
            setOffsetX(newX);
            setOffsetY(newY);
            stateRef.current.x = newX;
            stateRef.current.y = newY;
            stateRef.current.lastMidX = mid.x;
            stateRef.current.lastMidY = mid.y;
          }
        } else if (touches.length === 1) {
          if (stateRef.current.isPinching) {
            // Vừa nhấc 1 ngón tay ra, chuyển mượt mà về chế độ 1 ngón
            stateRef.current.isPinching = false;
            stateRef.current.initialDistance = 0;
            stateRef.current.lastTouchX = touches[0].pageX;
            stateRef.current.lastTouchY = touches[0].pageY;
          } else {
            // Di chuyển 1 ngón
            const dx = touches[0].pageX - stateRef.current.lastTouchX;
            const dy = touches[0].pageY - stateRef.current.lastTouchY;
            const newX = Math.round(stateRef.current.x + dx);
            const newY = Math.round(stateRef.current.y + dy);
            setOffsetX(newX);
            setOffsetY(newY);
            stateRef.current.x = newX;
            stateRef.current.y = newY;
            stateRef.current.lastTouchX = touches[0].pageX;
            stateRef.current.lastTouchY = touches[0].pageY;
          }
        }
      },
      onPanResponderRelease: () => {
        stateRef.current.isPinching = false;
        stateRef.current.initialDistance = 0;
      },
      onPanResponderTerminate: () => {
        stateRef.current.isPinching = false;
        stateRef.current.initialDistance = 0;
      },
    })
  );

  if (!slotData || !slotData.uri) return null;

  // ── apply preset ──
  const handleSelectPreset = (preset: typeof COLOR_PRESETS[0]) => {
    setSelectedPreset(preset.id);
    if (preset.id === 'none') {
      setFilters({ ...DEFAULT_IMAGE_FILTERS });
    } else {
      setFilters({ ...DEFAULT_IMAGE_FILTERS, ...preset.filters });
    }
  };

  const handleApply = () => {
    const curX = stateRef.current.x;
    const curY = stateRef.current.y;
    const curScale = stateRef.current.scale;
    const normX = frameWidth > 0 ? curX / frameWidth : 0;
    const normY = frameHeight > 0 ? curY / frameHeight : 0;

    const isFilterDirty = Object.keys(filters).some(
      (k) => filters[k as keyof ImageFilters] !== 0
    );

    onSave({
      ...slotData,
      scale: curScale,
      normX, normY,
      offsetX: Math.round(normX * actualSlotW),
      offsetY: Math.round(normY * actualSlotH),
      rotation, flipH, flipV, fitMode,
      filters: isFilterDirty ? { ...filters } : undefined,
      colorPreset: selectedPreset,
    });
    onClose();
  };

  const handleReset = () => {
    if (activeTab === 'crop') {
      setScale(1); setOffsetX(0); setOffsetY(0); setRotation(0); setFlipH(false); setFlipV(false); setFitMode('contain');
      stateRef.current.x = 0; stateRef.current.y = 0; stateRef.current.scale = 1;
    } else {
      setFilters({ ...DEFAULT_IMAGE_FILTERS });
      setSelectedPreset('none');
    }
  };

  const transform = [
    { scale },
    { translateX: offsetX },
    { translateY: offsetY },
    { rotate: `${rotation}deg` },
    { scaleX: flipH ? -1 : 1 },
    { scaleY: flipV ? -1 : 1 },
  ];

  const activeItem = FILTER_ITEMS.find((f) => f.key === activeKey)!;
  const isFilterModified = Object.keys(filters).some((k) => filters[k as keyof ImageFilters] !== 0);

  const previewFilterStyle = computeImageFilterStyle(filters, selectedPreset);
  const previewOverlays = getFilterOverlays(filters, selectedPreset);
  const isFilterActive = isFilterModified || selectedPreset !== 'none';

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* ── Header ── */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.iconButton}>
              <Ionicons name="close" size={24} color="#A1A1AA" />
            </TouchableOpacity>
            <View style={styles.headerTitleWrap}>
              <Text style={styles.title}>Cắt &amp; Chỉnh sửa ảnh</Text>
              <Text style={styles.subtitle}>Ô số {(slotIndex ?? 0) + 1}</Text>
            </View>
            <TouchableOpacity onPress={handleApply} style={styles.saveHeaderBtn}>
              <Text style={styles.saveHeaderText}>Áp dụng</Text>
            </TouchableOpacity>
          </View>

          {/* ── Tab bar ── */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'crop' && styles.activeTabBtn]}
              onPress={() => setActiveTab('crop')}
            >
              <Ionicons name="crop-outline" size={15} color={activeTab === 'crop' ? '#FFFFFF' : '#71717A'} />
              <Text style={[styles.tabText, activeTab === 'crop' && styles.activeTabText]}>Cắt & Căn chỉnh</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'filter' && styles.activeTabBtn]}
              onPress={() => setActiveTab('filter')}
            >
              <Ionicons name="color-palette-outline" size={15} color={activeTab === 'filter' ? '#FFFFFF' : '#71717A'} />
              <Text style={[styles.tabText, activeTab === 'filter' && styles.activeTabText]}>Bộ lọc màu</Text>
              {isFilterActive && <View style={styles.tabDot} />}
            </TouchableOpacity>
          </View>

          {/* ── Preview ── */}
          <View style={styles.previewContainer}>
            <View
              style={[styles.previewFrame, { width: frameWidth, height: frameHeight, borderRadius: borderRadius ?? 0 }]}
              {...(activeTab === 'crop' ? panResponderRef.current.panHandlers : {})}
            >
              <Image
                source={{ uri: slotData.uri }}
                style={[styles.previewImage, { transform }, previewFilterStyle as any]}
                resizeMode={fitMode}
              />
              {/* Overlays for live Warmth, Highlights, Shadows and Presets */}
              {previewOverlays.map((ov) => (
                <View
                  key={ov.key}
                  pointerEvents="none"
                  style={[
                    StyleSheet.absoluteFill,
                    {
                      backgroundColor: ov.backgroundColor,
                      opacity: ov.opacity,
                      borderRadius: borderRadius ?? 0,
                    },
                  ]}
                />
              ))}
              {activeTab === 'crop' && (
                <>
                  <View style={styles.ruleOfThirdsH1} pointerEvents="none" />
                  <View style={styles.ruleOfThirdsH2} pointerEvents="none" />
                  <View style={styles.ruleOfThirdsV1} pointerEvents="none" />
                  <View style={styles.ruleOfThirdsV2} pointerEvents="none" />
                </>
              )}
            </View>
          </View>

          <ScrollView style={styles.controlsScroll} showsVerticalScrollIndicator={false}>
            {/* ─── CẮT & CĂN CHỈNH TAB ─── */}
            {activeTab === 'crop' && (
              <>
                {/* Fit Mode */}
                <View style={styles.fitModeBar}>
                  <TouchableOpacity
                    style={[styles.fitModeBtn, fitMode === 'contain' && styles.activeFitModeBtn]}
                    onPress={() => setFitMode('contain')}
                  >
                    <Ionicons name="scan-outline" size={14} color={fitMode === 'contain' ? '#FFFFFF' : '#A1A1AA'} />
                    <Text style={[styles.fitModeText, fitMode === 'contain' && styles.activeFitModeText]} numberOfLines={1}>Giữ nguyên ảnh</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.fitModeBtn, fitMode === 'cover' && styles.activeFitModeBtn]}
                    onPress={() => setFitMode('cover')}
                  >
                    <Ionicons name="expand-outline" size={14} color={fitMode === 'cover' ? '#FFFFFF' : '#A1A1AA'} />
                    <Text style={[styles.fitModeText, fitMode === 'cover' && styles.activeFitModeText]} numberOfLines={1}>Lấp đầy ô</Text>
                  </TouchableOpacity>
                </View>

                {/* Rotate & Flip */}
                <View style={styles.controlGroup}>
                  <View style={styles.groupHeader}>
                    <Ionicons name="sync-outline" size={18} color="#FBBF24" />
                    <Text style={styles.groupTitle}>Xoay & Lật ảnh</Text>
                  </View>
                  <View style={styles.actionButtonsRow}>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => setRotation((r) => (r + 90) % 360)}>
                      <Ionicons name="reload-outline" size={20} color="#FFFFFF" />
                      <Text style={styles.actionBtnText}>Xoay 90°</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, flipH && styles.activeActionBtn]}
                      onPress={() => setFlipH((f) => !f)}
                    >
                      <Ionicons name="swap-horizontal" size={20} color={flipH ? '#3B82F6' : '#FFFFFF'} />
                      <Text style={[styles.actionBtnText, flipH && styles.activeActionBtnText]}>Lật ngang</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, flipV && styles.activeActionBtn]}
                      onPress={() => setFlipV((f) => !f)}
                    >
                      <Ionicons name="swap-vertical" size={20} color={flipV ? '#3B82F6' : '#FFFFFF'} />
                      <Text style={[styles.actionBtnText, flipV && styles.activeActionBtnText]}>Lật dọc</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Danger Row */}
                <View style={styles.dangerRow}>
                  <TouchableOpacity style={styles.replaceBtn} onPress={() => { onClose(); onReplaceImage(); }}>
                    <Ionicons name="images-outline" size={18} color="#60A5FA" />
                    <Text style={styles.replaceText}>Chọn ảnh khác</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
                    <Ionicons name="refresh-outline" size={18} color="#A1A1AA" />
                    <Text style={styles.resetText}>Về giữa</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.removeBtn} onPress={() => { onClose(); onRemoveImage(); }}>
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    <Text style={styles.removeText}>Xóa</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* ─── BỘ LỌC MÀU TAB ─── */}
            {activeTab === 'filter' && (
              <>
                {/* Preset row */}
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

                {/* Fine-tune slider */}
                <View style={styles.controlGroup}>
                  <View style={styles.groupHeader}>
                    <Ionicons name="color-filter-outline" size={18} color="#60A5FA" />
                    <Text style={styles.groupTitle}>Chỉnh chi tiết</Text>
                    <TouchableOpacity
                      onPress={handleReset}
                      disabled={!isFilterModified}
                      style={{ opacity: isFilterModified ? 1 : 0.35 }}
                    >
                      <Text style={styles.resetMiniText}>Đặt lại</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Active value display */}
                  <View style={styles.activeValueRow}>
                    <Ionicons name={activeItem.icon as any} size={16} color={activeItem.color} />
                    <Text style={[styles.activeLabel, { color: activeItem.color }]}>{activeItem.label}</Text>
                    <Text style={styles.activeValue}>
                      {filters[activeKey] > 0 ? `+${filters[activeKey]}` : filters[activeKey]}
                    </Text>
                  </View>
                  <View style={{ paddingLeft: 4, marginBottom: 14 }}>
                    <MiniSlider
                      value={filters[activeKey]}
                      min={activeItem.min}
                      max={activeItem.max}
                      color={activeItem.color}
                      onChange={(v) => {
                        setFilters((prev) => ({ ...prev, [activeKey]: v }));
                        setSelectedPreset('none');
                      }}
                    />
                  </View>

                  {/* Filter pills */}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterPillsRow}>
                    {FILTER_ITEMS.map((item) => {
                      const isActive = activeKey === item.key;
                      const isDirty  = filters[item.key] !== 0;
                      return (
                        <TouchableOpacity
                          key={item.key}
                          style={[styles.filterPill, isActive && { borderColor: item.color }]}
                          onPress={() => setActiveKey(item.key)}
                          activeOpacity={0.75}
                        >
                          <View style={[styles.pillIconWrap, isActive && { backgroundColor: item.color + '22' }]}>
                            <Ionicons name={item.icon as any} size={18} color={isActive ? item.color : '#71717A'} />
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
                </View>

                {/* ── Nút áp dụng cho tất cả ── */}
                {onApplyFilterToAll && (
                  <TouchableOpacity
                    style={[
                      styles.applyAllBtn,
                      !isFilterModified && styles.applyAllBtnDisabled,
                    ]}
                    onPress={() => {
                      onApplyFilterToAll(filters, selectedPreset);
                    }}
                    disabled={!isFilterModified}
                    activeOpacity={0.75}
                  >
                    <Ionicons
                      name="images-outline"
                      size={17}
                      color={isFilterModified ? '#FFFFFF' : '#52525B'}
                    />
                    <Text style={[styles.applyAllText, !isFilterModified && styles.applyAllTextDisabled]}>
                      Áp dụng cho tất cả ảnh
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  sheetContainer: {
    backgroundColor: '#1F2021',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    maxHeight: '92%',
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 10 },
  iconButton: { padding: 6 },
  headerTitleWrap: { alignItems: 'center' },
  title: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  subtitle: { color: '#A1A1AA', fontSize: 12, marginTop: 1 },
  saveHeaderBtn: { backgroundColor: '#3B82F6', paddingHorizontal: 16, paddingVertical: 7, borderRadius: 18 },
  saveHeaderText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },

  // Tabs
  tabBar: { flexDirection: 'row', backgroundColor: '#25252D', borderRadius: 12, padding: 3, marginBottom: 10, gap: 4 },
  tabBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 9, gap: 5, position: 'relative' },
  activeTabBtn: { backgroundColor: '#3B82F6' },
  tabText: { color: '#71717A', fontSize: 12, fontWeight: '600' },
  activeTabText: { color: '#FFFFFF', fontWeight: '700' },
  tabDot: { position: 'absolute', top: 6, right: 10, width: 7, height: 7, borderRadius: 4, backgroundColor: '#FBBF24', borderWidth: 1.5, borderColor: '#25252D' },

  // Preview
  previewContainer: { alignItems: 'center', marginBottom: 10 },
  previewFrame: { overflow: 'hidden', backgroundColor: '#16161B', borderWidth: 2, borderColor: '#3B82F6', position: 'relative' },
  previewImage: { width: '100%', height: '100%' },
  ruleOfThirdsH1: { position: 'absolute', top: '33.33%', left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.25)' },
  ruleOfThirdsH2: { position: 'absolute', top: '66.66%', left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.25)' },
  ruleOfThirdsV1: { position: 'absolute', left: '33.33%', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(255,255,255,0.25)' },
  ruleOfThirdsV2: { position: 'absolute', left: '66.66%', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(255,255,255,0.25)' },

  // Controls
  controlsScroll: { maxHeight: 280 },
  controlGroup: { backgroundColor: '#25252D', borderRadius: 14, padding: 12, marginBottom: 10 },
  groupHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 6 },
  groupTitle: { color: '#F4F4F5', fontSize: 13, fontWeight: '600', flex: 1 },
  resetMiniText: { color: '#60A5FA', fontSize: 12, fontWeight: '600' },

  // Fit mode bar
  fitModeBar: { flexDirection: 'row', backgroundColor: '#25252D', borderRadius: 12, padding: 3, marginBottom: 8, gap: 4 },
  fitModeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 9, gap: 5 },
  activeFitModeBtn: { backgroundColor: '#3B82F6' },
  fitModeText: { color: '#A1A1AA', fontSize: 11, fontWeight: '600' },
  activeFitModeText: { color: '#FFFFFF', fontWeight: '700' },

  // Actions row
  actionButtonsRow: { flexDirection: 'row', gap: 8 },
  actionBtn: { flex: 1, backgroundColor: '#32323D', borderRadius: 10, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
  activeActionBtn: { backgroundColor: 'rgba(59,130,246,0.2)', borderWidth: 1, borderColor: '#3B82F6' },
  actionBtnText: { color: '#FFFFFF', fontSize: 11, fontWeight: '600', marginTop: 4 },
  activeActionBtnText: { color: '#60A5FA' },

  // Danger row
  dangerRow: { flexDirection: 'row', gap: 8, marginTop: 4, marginBottom: 8 },
  replaceBtn: { flex: 1.5, flexDirection: 'row', backgroundColor: '#25252D', borderWidth: 1, borderColor: '#3B82F6', borderRadius: 12, paddingVertical: 12, alignItems: 'center', justifyContent: 'center', gap: 6 },
  replaceText: { color: '#60A5FA', fontSize: 12, fontWeight: '700' },
  resetBtn: { flex: 1, flexDirection: 'row', backgroundColor: '#25252D', borderRadius: 12, paddingVertical: 12, alignItems: 'center', justifyContent: 'center', gap: 4 },
  resetText: { color: '#A1A1AA', fontSize: 12, fontWeight: '600' },
  removeBtn: { flex: 1, flexDirection: 'row', backgroundColor: 'rgba(239,68,68,0.12)', borderRadius: 12, paddingVertical: 12, alignItems: 'center', justifyContent: 'center', gap: 4 },
  removeText: { color: '#EF4444', fontSize: 12, fontWeight: '700' },

  // Presets
  presetsRow: { paddingBottom: 8, gap: 8 },
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

  // Filter sliders
  activeValueRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  activeLabel: { fontSize: 13, fontWeight: '700', flex: 1 },
  activeValue: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', minWidth: 44, textAlign: 'right' },
  filterPillsRow: { gap: 8, paddingBottom: 2 },
  filterPill: { alignItems: 'center', backgroundColor: '#202026', borderRadius: 12, borderWidth: 1.5, borderColor: '#2D2D36', paddingHorizontal: 10, paddingVertical: 8, minWidth: 72, gap: 3 },
  pillIconWrap: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#2D2D36', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  dirtyDot: { position: 'absolute', top: 2, right: 2, width: 7, height: 7, borderRadius: 4, borderWidth: 1.5, borderColor: '#1C1C22' },
  pillLabel: { color: '#71717A', fontSize: 10, fontWeight: '600', textAlign: 'center' },
  pillValue: { color: '#52525B', fontSize: 10, fontWeight: '700' },

  // Apply to all
  applyAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    marginBottom: 4,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: '#3B82F6',
  },
  applyAllBtnDisabled: {
    backgroundColor: '#25252D',
  },
  applyAllText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  applyAllTextDisabled: {
    color: '#52525B',
  },
});
