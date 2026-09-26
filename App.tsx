import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Pressable,
  StatusBar,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import ViewShot from 'react-native-view-shot';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';

import { LAYOUT_PRESETS } from './src/constants/layouts';
import {
  DEFAULT_CANVAS_STYLE,
  ASPECT_RATIOS,
} from './src/constants/themes';
import {
  AspectRatioType,
  CanvasStyleConfig,
  ColorPresetId,
  DraftItem,
  ImageFilters,
  LayoutPreset,
  SlotImageState,
  TextItem,
} from './src/types';

import { CollageCanvas } from './src/components/CollageCanvas';
import { RatioModal } from './src/components/RatioModal';
import { LayoutModal } from './src/components/LayoutModal';
import { CropModal } from './src/components/CropModal';
import { TextConfigModal } from './src/components/TextConfigModal';
import { StyleModal } from './src/components/StyleModal';
import { ExportSuccessModal } from './src/components/ExportSuccessModal';
import { DraftsModal } from './src/components/DraftsModal';
import * as SplashScreen from 'expo-splash-screen';
import { draftService } from './src/services/draftService';

// Giữ splash screen hiển thị cho đến khi React mount thành công
SplashScreen.preventAutoHideAsync().catch(() => {});

// ─── Inner component — dùng useSafeAreaInsets bên trong SafeAreaProvider ────
function AppContent() {
  const insets = useSafeAreaInsets();
  const viewShotRef = useRef<any>(null);
  const exportViewShotRef = useRef<any>(null);

  useEffect(() => {
    // Ẩn splash screen mượt mà khi app đã mount xong
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  // Layout & Aspect Ratio States
  const [currentLayout, setCurrentLayout] = useState<LayoutPreset>(LAYOUT_PRESETS[0]);
  const [currentRatioId, setCurrentRatioId] = useState<AspectRatioType>('9:16');

  // Slots State
  const [slots, setSlots] = useState<SlotImageState[]>(() =>
    Array.from({ length: 9 }, (_, index) => ({
      id: index,
      uri: null,
      scale: 1,
      offsetX: 0,
      offsetY: 0,
      rotation: 0,
      flipH: false,
      flipV: false,
      fitMode: 'contain' as const,
    }))
  );

  // Multiple Text Overlays State
  const [texts, setTexts] = useState<TextItem[]>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [editingTextItem, setEditingTextItem] = useState<TextItem | null>(null);

  // Canvas Style State
  const [canvasStyle, setCanvasStyle] = useState<CanvasStyleConfig>({
    ...DEFAULT_CANVAS_STYLE,
    borderRadius: 0,
  });

  // Toolbar Mode: 'main' | 'text' (phong cách CapCut)
  const [toolbarMode, setToolbarMode] = useState<'main' | 'text'>('main');

  // Modal States
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [cropModalVisible, setCropModalVisible] = useState(false);
  const [ratioModalVisible, setRatioModalVisible] = useState(false);
  const [layoutModalVisible, setLayoutModalVisible] = useState(false);
  const [styleModalVisible, setStyleModalVisible] = useState(false);
  const [textModalVisible, setTextModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [exportedImageUri, setExportedImageUri] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [draftsModalVisible, setDraftsModalVisible] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const hasContent = slots.some((s) => !!s.uri);

  // ─── Fixed-Height Screen Preview Dimensions (Khung cố định, không đẩy thanh công cụ) ───
  const { width: windowW, height: windowH } = Dimensions.get('window');
  const SCREEN_WIDTH = windowW > 0 ? windowW : 375;
  const SCREEN_HEIGHT = windowH > 0 ? windowH : 812;
  const headerHeight = 52 + (insets.top || 0);
  const toolbarHeight = 64 + (insets.bottom || 0);
  // Chiều cao khung preview luôn được cố định chính xác giữa header và toolbar
  const previewContainerHeight = Math.max(200, SCREEN_HEIGHT - headerHeight - toolbarHeight);
  const availW = Math.max(100, SCREEN_WIDTH - 24);
  const availH = Math.max(100, previewContainerHeight - 20);

  const selectedRatioConfig =
    ASPECT_RATIOS.find((r) => r.id === currentRatioId) || ASPECT_RATIOS[0];
  const targetRatio = selectedRatioConfig.ratio > 0 ? selectedRatioConfig.ratio : 1; // width / height

  let canvasDisplayWidth: number;
  let canvasDisplayHeight: number;

  if (availW / targetRatio <= availH) {
    // Giới hạn bởi bề ngang (ví dụ ảnh vuông 1:1, ảnh ngang 16:9, 4:3)
    canvasDisplayWidth = Math.max(50, Math.round(availW));
    canvasDisplayHeight = Math.max(50, Math.round(availW / targetRatio));
  } else {
    // Giới hạn bởi chiều dọc (ví dụ ảnh dọc 9:16, 3:4, 2:3)
    canvasDisplayHeight = Math.max(50, Math.round(availH));
    canvasDisplayWidth = Math.max(50, Math.round(availH * targetRatio));
  }

  // ─── High-Resolution Export Calculations (Chất lượng gốc của ảnh) ────────
  const getExportDimensions = () => {
    // Giới hạn an toàn cạnh dài tối đa 2160px (Ultra HD) để tránh lỗi bộ nhớ CALayer iOS
    const maxLongEdge = 2160;

    if (currentRatioId === '1:1') {
      return { width: 1800, height: 1800 };
    }
    if (targetRatio < 1) {
      // Dọc (9:16, 3:4, ...) -> Cạnh dài là height
      const h = maxLongEdge;
      const w = Math.round(h * targetRatio);
      return { width: w, height: h }; // 9:16 -> 1215 x 2160 (Full HD / 2K)
    } else {
      // Ngang (16:9, 4:3, ...) -> Cạnh dài là width
      const w = maxLongEdge;
      const h = Math.round(w / targetRatio);
      return { width: w, height: h }; // 16:9 -> 2160 x 1215
    }
  };

  const exportDimensions = getExportDimensions();
  const exportScale = canvasDisplayWidth > 0 ? exportDimensions.width / canvasDisplayWidth : 3.0;

  // ─── Slot & Crop Handlers ──────────────────────────────────────────────────

  const handlePickImageForSlot = async (slotIndex: number) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Quyền truy cập ảnh', 'Ứng dụng cần quyền xem thư viện ảnh để ghép ảnh của bạn.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 1,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSlots((prev) => {
          const next = [...prev];
          next[slotIndex] = {
            id: slotIndex,
            uri: asset.uri,
            origWidth: asset.width,
            origHeight: asset.height,
            scale: 1,
            offsetX: 0,
            offsetY: 0,
            rotation: 0,
            flipH: false,
            flipV: false,
            fitMode: 'contain',
          };
          return next;
        });
        setSelectedSlotIndex(slotIndex);
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Lỗi', 'Không thể mở thư viện ảnh');
    }
  };

  const handleSelectSlot = (index: number) => {
    setSelectedTextId(null);
    setSelectedSlotIndex(index);
    if (slots[index]?.uri) {
      setCropModalVisible(true);
    } else {
      handlePickImageForSlot(index);
    }
  };

  const handleSaveCrop = (updated: SlotImageState) => {
    setSlots((prev) => {
      const next = [...prev];
      next[updated.id] = { ...updated };
      return next;
    });
  };

  const handleRemoveSlotImage = (index: number) => {
    setSlots((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        uri: null,
        scale: 1,
        offsetX: 0,
        offsetY: 0,
        rotation: 0,
        flipH: false,
        flipV: false,
        fitMode: 'contain',
        filters: undefined,
        colorPreset: undefined,
      };
      return next;
    });
  };

  // Áp dụng bộ lọc màu cho TẤT CẢ các ảnh trong layout
  const handleApplyFilterToAll = (appliedFilters: ImageFilters, preset: ColorPresetId) => {
    setSlots((prev) =>
      prev.map((slot) => {
        if (!slot.uri) return slot;
        return {
          ...slot,
          filters: { ...appliedFilters },
          colorPreset: preset,
        };
      })
    );
  };

  // ─── Multiple Text Overlays Handlers ───────────────────────────────────────

  const handleSaveTextItem = (newItem: TextItem) => {
    setTexts((prev) => {
      const existingIdx = prev.findIndex((t) => t.id === newItem.id);
      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = newItem;
        return next;
      }
      return [...prev, newItem];
    });
    setSelectedTextId(newItem.id);
    setToolbarMode('text');
  };

  const handleDeleteTextItem = (id: string) => {
    setTexts((prev) => prev.filter((t) => t.id !== id));
    if (selectedTextId === id) {
      setSelectedTextId(null);
    }
  };

  const handleDuplicateTextItem = (id: string) => {
    const item = texts.find((t) => t.id === id);
    if (!item) return;
    const duplicated: TextItem = {
      ...item,
      id: `text-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      x: (item.x || 0) + 15,
      y: (item.y || 0) + 15,
    };
    setTexts((prev) => [...prev, duplicated]);
    setSelectedTextId(duplicated.id);
  };

  const handleUpdateTextPosition = (id: string, x: number, y: number) => {
    setTexts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, x, y } : t))
    );
  };

  // ─── True HD Export Handler ────────────────────────────────────────────────

  const handleExportCollage = async () => {
    try {
      setIsExporting(true);
      setSelectedTextId(null);
      setSelectedSlotIndex(null);

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Quyền lưu ảnh', 'Vui lòng cấp quyền lưu ảnh để lưu layout vào máy của bạn.');
        setIsExporting(false);
        return;
      }

      // Đợi render layout độ phân giải cao
      await new Promise((r) => setTimeout(r, 250));

      let uri: string;
      try {
        if (exportViewShotRef.current) {
          uri = await exportViewShotRef.current.capture({
            format: 'png',
            quality: 1.0,
            result: 'tmpfile',
            useRenderInContext: true,
          });
        } else {
          throw new Error('exportViewShotRef is null');
        }
      } catch (masterErr) {
        console.warn('Master export failed, using viewport canvas fallback:', masterErr);
        uri = await viewShotRef.current.capture({
          format: 'png',
          quality: 1.0,
          result: 'tmpfile',
          useRenderInContext: true,
        });
      }

      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync('PicMorph', asset, false);
      setExportedImageUri(uri);
      setSuccessModalVisible(true);
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Lỗi xuất ảnh', 'Không thể lưu ảnh layout. Vui lòng thử lại.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleShareExportedImage = async () => {
    if (exportedImageUri && (await Sharing.isAvailableAsync())) {
      await Sharing.shareAsync(exportedImageUri);
    }
  };

  const handleSaveCurrentDraft = async () => {
    try {
      setIsSavingDraft(true);
      setSelectedTextId(null);
      setSelectedSlotIndex(null);

      let thumb: string | null = null;
      if (viewShotRef.current) {
        try {
          thumb = await viewShotRef.current.capture({
            format: 'jpg',
            quality: 0.6,
            result: 'tmpfile',
            useRenderInContext: true,
          });
        } catch (e) {
          console.log('Thumbnail capture skipped:', e);
        }
      }
      const title =
        texts.length > 0
          ? texts[0].text.slice(0, 30)
          : `Bản nháp ${currentLayout.name} • ${currentRatioId}`;

      await draftService.saveDraft({
        title,
        thumbnailUri: thumb,
        layoutId: currentLayout.id,
        ratioId: currentRatioId,
        slots,
        texts,
        canvasStyle,
      });
      Alert.alert('Thành công', 'Đã lưu bản nháp thiết kế vào máy của bạn.');
    } catch (error) {
      console.error('Save draft error:', error);
      Alert.alert('Lỗi', 'Không thể lưu bản nháp. Vui lòng thử lại.');
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSelectDraft = (draft: DraftItem) => {
    const layout = LAYOUT_PRESETS.find((l) => l.id === draft.layoutId) || LAYOUT_PRESETS[0];
    setCurrentLayout(layout);
    setCurrentRatioId(draft.ratioId);
    setSlots(draft.slots);
    if (draft.texts && draft.texts.length > 0) {
      setTexts(draft.texts);
    } else if (draft.textConfig && draft.textConfig.enabled && draft.textConfig.text) {
      setTexts([
        {
          id: `migrated-${Date.now()}`,
          text: draft.textConfig.text,
          fontSize: draft.textConfig.fontSize,
          color: draft.textConfig.color,
          letterSpacing: draft.textConfig.letterSpacing,
          uppercase: draft.textConfig.uppercase,
          hasBackground: draft.textConfig.hasBackground,
          hasShadow: draft.textConfig.hasShadow,
          x: draft.textConfig.positionX ?? 0,
          y: draft.textConfig.positionY ?? 0,
          fontId: draft.textConfig.fontId,
          fontFamily: draft.textConfig.fontFamily,
          fontWeight: draft.textConfig.fontWeight,
          fontStyle: draft.textConfig.fontStyle,
        },
      ]);
    } else {
      setTexts([]);
    }
    setCanvasStyle(draft.canvasStyle);
  };

  const selectedTextItem = texts.find((t) => t.id === selectedTextId);

  return (
    <View style={styles.safeContainer}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── 1. Top Header (Fixed, CapCut style) ── */}
      <View style={[styles.appHeader, { paddingTop: insets.top + 6 }]}>
        <View style={styles.logoRow}>
          <Image source={require('./assets/logo.png')} style={styles.logoImage} resizeMode="contain" />
          <View>
            <Text style={styles.logoTitle}>PicMorph</Text>
            <Text style={styles.logoSub}>Ghép ảnh nghệ thuật</Text>
          </View>
        </View>

        <View style={styles.headerRightActions}>
          {/* Danh sách bản nháp */}
          <TouchableOpacity
            style={styles.headerActionBtn}
            onPress={() => setDraftsModalVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="folder-outline" size={19} color="#D4D4D8" />
          </TouchableOpacity>

          {/* Lưu bản nháp */}
          <TouchableOpacity
            style={[styles.headerActionBtn, (!hasContent || isSavingDraft) && styles.disabledHeaderBtn]}
            onPress={handleSaveCurrentDraft}
            disabled={!hasContent || isSavingDraft}
            activeOpacity={0.7}
          >
            {isSavingDraft ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="bookmark-outline" size={19} color={hasContent ? '#D4D4D8' : '#52525B'} />
            )}
          </TouchableOpacity>


          {/* Nút Xuất ảnh phong cách CapCut */}
          <TouchableOpacity
            style={[styles.exportBtn, (!hasContent || isExporting) && styles.disabledExportBtn]}
            onPress={handleExportCollage}
            disabled={!hasContent || isExporting}
            activeOpacity={0.8}
          >
            {isExporting ? (
              <ActivityIndicator size="small" color="#16161B" />
            ) : (
              <Text style={styles.exportBtnText}>Xuất</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── 2. Canvas Center Viewport (Flex: 1, Cố định height, không scroll app!) ── */}
      <Pressable
        style={styles.canvasCenterContainer}
        onPress={() => {
          setSelectedSlotIndex(null);
          setSelectedTextId(null);
        }}
      >
        <View
          style={[
            styles.canvasShadowBox,
            {
              width: canvasDisplayWidth,
              height: canvasDisplayHeight,
            },
          ]}
        >
          <CollageCanvas
            ref={viewShotRef}
            layout={currentLayout}
            slots={slots}
            canvasStyle={canvasStyle}
            texts={texts}
            selectedTextId={isExporting ? null : selectedTextId}
            selectedSlotIndex={isExporting ? null : selectedSlotIndex}
            isExporting={isExporting}
            onSelectSlot={handleSelectSlot}
            onQuickPickSlot={handlePickImageForSlot}
            onSelectText={(id) => {
              setSelectedTextId(id);
              setSelectedSlotIndex(null);
              setToolbarMode('text');
            }}
            onUpdateTextPosition={handleUpdateTextPosition}
            onEditText={(item) => {
              setEditingTextItem(item);
              setTextModalVisible(true);
            }}
            onDeleteText={handleDeleteTextItem}
          />
        </View>
      </Pressable>

      {/* ── 3. Bottom CapCut-Style Toolbar Container (Cố định ở đáy màn hình) ── */}
      <View style={[styles.bottomToolbarContainer, { paddingBottom: insets.bottom + 10 }]}>
        {toolbarMode === 'main' ? (
          // ── Main Toolbar: Tỷ lệ, Bố cục, Văn bản, Viền & Nền ──
          <View style={styles.mainToolbarRow}>
            {/* Tỷ lệ */}
            <TouchableOpacity
              style={styles.toolBtn}
              onPress={() => setRatioModalVisible(true)}
              activeOpacity={0.7}
            >
              <View style={styles.toolBtnIconWrap}>
                <Ionicons name="expand-outline" size={22} color="#E4E4E7" />
              </View>
              <Text style={styles.toolBtnLabel}>Tỷ lệ ({currentRatioId})</Text>
            </TouchableOpacity>

            {/* Bố cục */}
            <TouchableOpacity
              style={styles.toolBtn}
              onPress={() => setLayoutModalVisible(true)}
              activeOpacity={0.7}
            >
              <View style={styles.toolBtnIconWrap}>
                <Ionicons name="grid-outline" size={22} color="#E4E4E7" />
              </View>
              <Text style={styles.toolBtnLabel}>Bố cục</Text>
            </TouchableOpacity>

            {/* Văn bản */}
            <TouchableOpacity
              style={styles.toolBtn}
              onPress={() => setToolbarMode('text')}
              activeOpacity={0.7}
            >
              <View style={styles.toolBtnIconWrap}>
                <Ionicons name="text-outline" size={22} color="#E4E4E7" />
              </View>
              <Text style={styles.toolBtnLabel}>
                Văn bản{texts.length > 0 ? ` (${texts.length})` : ''}
              </Text>
            </TouchableOpacity>

            {/* Viền & Nền */}
            <TouchableOpacity
              style={styles.toolBtn}
              onPress={() => setStyleModalVisible(true)}
              activeOpacity={0.7}
            >
              <View style={styles.toolBtnIconWrap}>
                <Ionicons name="color-palette-outline" size={22} color="#E4E4E7" />
              </View>
              <Text style={styles.toolBtnLabel}>Viền & Nền</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // ── Text Mode Toolbar (Phong cách CapCut Submenu) ──
          <View style={styles.textToolbarRow}>
            {/* Nút Quay lại */}
            <TouchableOpacity
              style={styles.backToolBtn}
              onPress={() => {
                setToolbarMode('main');
                setSelectedTextId(null);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Thêm chữ mới (A+ icon like CapCut) */}
            <TouchableOpacity
              style={styles.toolBtn}
              onPress={() => {
                setEditingTextItem(null);
                setTextModalVisible(true);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.toolBtnIconWrap}>
                <Ionicons name="add-circle" size={24} color="#3B82F6" />
              </View>
              <Text style={[styles.toolBtnLabel, { color: '#3B82F6', fontWeight: '700' }]}>
                Thêm chữ
              </Text>
            </TouchableOpacity>

            {/* Chỉnh sửa chữ đã chọn */}
            {selectedTextItem && (
              <TouchableOpacity
                style={styles.toolBtn}
                onPress={() => {
                  setEditingTextItem(selectedTextItem);
                  setTextModalVisible(true);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.toolBtnIconWrap}>
                  <Ionicons name="pencil-outline" size={22} color="#60A5FA" />
                </View>
                <Text style={styles.toolBtnLabel}>Chỉnh sửa</Text>
              </TouchableOpacity>
            )}

            {/* Nhân đôi chữ đã chọn */}
            {selectedTextItem && (
              <TouchableOpacity
                style={styles.toolBtn}
                onPress={() => handleDuplicateTextItem(selectedTextItem.id)}
                activeOpacity={0.7}
              >
                <View style={styles.toolBtnIconWrap}>
                  <Ionicons name="copy-outline" size={22} color="#A78BFA" />
                </View>
                <Text style={styles.toolBtnLabel}>Nhân đôi</Text>
              </TouchableOpacity>
            )}

            {/* Xóa chữ đã chọn */}
            {selectedTextItem && (
              <TouchableOpacity
                style={styles.toolBtn}
                onPress={() => handleDeleteTextItem(selectedTextItem.id)}
                activeOpacity={0.7}
              >
                <View style={styles.toolBtnIconWrap}>
                  <Ionicons name="trash-outline" size={22} color="#EF4444" />
                </View>
                <Text style={[styles.toolBtnLabel, { color: '#EF4444' }]}>Xóa</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* ── 4. Hidden Master High-Res Canvas for True HD/4K Export (Chỉ render khi xuất ảnh) ── */}
      {isExporting && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: -99999,
            width: exportDimensions.width,
            height: exportDimensions.height,
            opacity: 1,
          }}
          pointerEvents="none"
        >
          <CollageCanvas
            ref={exportViewShotRef}
            layout={currentLayout}
            slots={slots}
            canvasStyle={{
              ...canvasStyle,
              gap: Math.round(canvasStyle.gap * exportScale),
              padding: Math.round(canvasStyle.padding * exportScale),
              borderRadius: Math.round(canvasStyle.borderRadius * exportScale),
            }}
            texts={texts.map((t) => ({
              ...t,
              fontSize: Math.round(t.fontSize * exportScale),
              letterSpacing: (t.letterSpacing ?? 0.5) * exportScale,
              x: Math.round((t.x || 0) * exportScale),
              y: Math.round((t.y || 0) * exportScale),
            }))}
            selectedTextId={null}
            selectedSlotIndex={null}
            isExporting={true}
            onSelectSlot={() => {}}
            onQuickPickSlot={() => {}}
          />
        </View>
      )}

      {/* ── 5. Modals (Bottom Sheets & Dialogs) ── */}

      {/* Crop & Live Filter Modal */}
      <CropModal
        visible={cropModalVisible}
        slotIndex={selectedSlotIndex}
        slotData={selectedSlotIndex !== null ? slots[selectedSlotIndex] : null}
        slotLayout={
          selectedSlotIndex !== null && currentLayout?.slots
            ? currentLayout.slots[selectedSlotIndex]
            : null
        }
        canvasWidth={canvasDisplayWidth}
        canvasHeight={canvasDisplayHeight}
        borderRadius={canvasStyle.borderRadius}
        onClose={() => setCropModalVisible(false)}
        onSave={handleSaveCrop}
        onReplaceImage={() => {
          if (selectedSlotIndex !== null) handlePickImageForSlot(selectedSlotIndex);
        }}
        onRemoveImage={() => {
          if (selectedSlotIndex !== null) handleRemoveSlotImage(selectedSlotIndex);
        }}
        onApplyFilterToAll={handleApplyFilterToAll}
      />

      {/* Tỷ lệ Modal (CapCut style bottom sheet) */}
      <RatioModal
        visible={ratioModalVisible}
        currentRatioId={currentRatioId}
        onClose={() => setRatioModalVisible(false)}
        onSelectRatio={(newRatio) => {
          setCurrentRatioId(newRatio);
        }}
      />

      {/* Bố cục Modal (CapCut style bottom sheet) */}
      <LayoutModal
        visible={layoutModalVisible}
        currentLayoutId={currentLayout.id}
        onClose={() => setLayoutModalVisible(false)}
        onSelectLayout={(newLayout) => {
          setCurrentLayout(newLayout);
          if (selectedSlotIndex !== null && selectedSlotIndex >= newLayout.slotsCount) {
            setSelectedSlotIndex(0);
          }
        }}
      />

      {/* Viền & Nền Modal */}
      <StyleModal
        visible={styleModalVisible}
        styleConfig={canvasStyle}
        onClose={() => setStyleModalVisible(false)}
        onChangeStyle={(newStyle) => setCanvasStyle(newStyle)}
      />

      {/* Thêm / Chỉnh sửa Chữ nghệ thuật Modal */}
      <TextConfigModal
        visible={textModalVisible}
        item={editingTextItem}
        onClose={() => setTextModalVisible(false)}
        onSave={handleSaveTextItem}
        onDelete={handleDeleteTextItem}
      />


      {/* Xuất ảnh thành công */}
      <ExportSuccessModal
        visible={successModalVisible}
        imageUri={exportedImageUri}
        onClose={() => setSuccessModalVisible(false)}
        onShare={handleShareExportedImage}
      />

      {/* Bản nháp đã lưu */}
      <DraftsModal
        visible={draftsModalVisible}
        onClose={() => setDraftsModalVisible(false)}
        onSelectDraft={handleSelectDraft}
        onSaveCurrentAsDraft={handleSaveCurrentDraft}
        isSavingCurrent={isSavingDraft}
        hasContent={hasContent}
      />
    </View>
  );
}

// ─── Error Boundary để bắt lỗi hiển thị, tránh văng ra màn hình trắng ────────
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state: { hasError: boolean; error: Error | null } = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('PicMorph App Error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={48} color="#FF6B6B" style={{ marginBottom: 16 }} />
          <Text style={styles.errorTitle}>Đã xảy ra lỗi tải ứng dụng</Text>
          <Text style={styles.errorMsg}>
            {this.state.error?.message || 'Vui lòng nhấn tải lại hoặc khởi động lại ứng dụng.'}
          </Text>
          <TouchableOpacity onPress={this.handleReload} style={styles.reloadBtn}>
            <Text style={styles.reloadBtnText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

// ─── Root export — SafeAreaProvider bao ngoài AppContent ────────────────────
export default function App() {
  return (
    <SafeAreaProvider style={styles.rootSafeProvider}>
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  rootSafeProvider: {
    flex: 1,
    backgroundColor: '#1F2021',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#1F2021',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMsg: {
    color: '#A1A1AA',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  reloadBtn: {
    backgroundColor: '#00B4D8',
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 14,
  },
  reloadBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  safeContainer: {
    flex: 1,
    backgroundColor: '#1F2021',
  },
  appHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: '#1F2021',
    zIndex: 10,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoImage: {
    width: 28,
    height: 28,
    borderRadius: 7,
  },
  logoTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  logoSub: {
    color: '#71717A',
    fontSize: 9,
    fontWeight: '500',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  headerActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledHeaderBtn: {
    opacity: 0.3,
  },


  // CapCut style Cyan/Blue Export button
  exportBtn: {
    backgroundColor: '#00B4D8',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledExportBtn: {
    backgroundColor: '#2A2B2E',
    opacity: 0.4,
  },
  exportBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  // ── Canvas Area: Flex 1, căn giữa, khung cố định không đẩy xuống ──
  canvasCenterContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    overflow: 'hidden',
  },
  canvasShadowBox: {
    borderRadius: 0,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },

  // ── Bottom CapCut-Style Toolbar (Cố định ở đáy, 1 hàng duy nhất) ──
  bottomToolbarContainer: {
    backgroundColor: '#121214', // Tone màu đen sâu riêng biệt với vùng canvas phía trên (#1F2021)
    borderTopWidth: 0,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingTop: 12,
    paddingHorizontal: 12,
  },
  mainToolbarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 2,
  },
  textToolbarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 16,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  backToolBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 2,
  },
  toolBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 62,
  },
  toolBtnIconWrap: {
    width: 32,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    marginBottom: 4,
  },
  toolBtnLabel: {
    color: '#A1A1AA',
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
});
