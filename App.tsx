import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Pressable,
  ScrollView,
  StatusBar,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ViewShot from 'react-native-view-shot';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library/legacy';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';

import { LAYOUT_PRESETS } from './src/constants/layouts';
import {
  DEFAULT_CANVAS_STYLE,
  DEFAULT_TEXT_CONFIG,
  ASPECT_RATIOS,
} from './src/constants/themes';
import {
  AspectRatioType,
  CanvasStyleConfig,
  DraftItem,
  LayoutPreset,
  SlotImageState,
  TextOverlayConfig,
} from './src/types';

import { CollageCanvas } from './src/components/CollageCanvas';
import { LayoutSelector } from './src/components/LayoutSelector';
import { RatioSelector } from './src/components/RatioSelector';
import { CropModal } from './src/components/CropModal';
import { TextConfigModal } from './src/components/TextConfigModal';
import { StyleModal } from './src/components/StyleModal';
import { ExportSuccessModal } from './src/components/ExportSuccessModal';
import { DraftsModal } from './src/components/DraftsModal';
import { draftService } from './src/services/draftService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function App() {
  const viewShotRef = useRef<any>(null);

  // Layout & Aspect Ratio States
  const [currentLayout, setCurrentLayout] = useState<LayoutPreset>(LAYOUT_PRESETS[0]);
  const [currentRatioId, setCurrentRatioId] = useState<AspectRatioType>('9:16');
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Slots State: All slots start completely empty (NO sample images)
  const [slots, setSlots] = useState<SlotImageState[]>(() => {
    return Array.from({ length: 9 }, (_, index) => ({
      id: index,
      uri: null,
      scale: 1,
      offsetX: 0,
      offsetY: 0,
      rotation: 0,
      flipH: false,
      flipV: false,
      fitMode: 'contain',
    }));
  });

  // Center Text Overlay State
  const [textConfig, setTextConfig] = useState<TextOverlayConfig>(DEFAULT_TEXT_CONFIG);

  // Border & Canvas Style State (borderRadius 0)
  const [canvasStyle, setCanvasStyle] = useState<CanvasStyleConfig>({
    ...DEFAULT_CANVAS_STYLE,
    borderRadius: 0,
  });

  // Modals & Selection States
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [cropModalVisible, setCropModalVisible] = useState(false);
  const [textModalVisible, setTextModalVisible] = useState(false);
  const [styleModalVisible, setStyleModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [exportedImageUri, setExportedImageUri] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [draftsModalVisible, setDraftsModalVisible] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const hasContent = slots.some((s) => !!s.uri);

  // Calculate Canvas Dimensions dynamically based on selected CapCut aspect ratio
  const selectedRatioConfig =
    ASPECT_RATIOS.find((r) => r.id === currentRatioId) || ASPECT_RATIOS[1];
  const targetRatio = selectedRatioConfig.ratio; // width / height

  let canvasDisplayWidth: number;
  let canvasDisplayHeight: number;

  const MAX_CANVAS_W = Math.min(SCREEN_WIDTH - 28, 360);
  const MAX_CANVAS_H = 460;

  if (!isFullScreen) {
    // Chế độ Ảnh vuông -> Canvas vuông 1:1, ảnh xuất ra chuẩn vuông, không có dải đen trên dưới
    const size = Math.min(MAX_CANVAS_W, 350);
    canvasDisplayWidth = size;
    canvasDisplayHeight = size;
  } else {
    // Chế độ Full chiều dài -> Canvas theo tỷ lệ khung hình đã chọn
    if (targetRatio === 1) {
      // 1:1 Square
      const size = Math.min(MAX_CANVAS_W, 350);
      canvasDisplayWidth = size;
      canvasDisplayHeight = size;
    } else if (targetRatio < 1) {
      // Portrait (9:16, 3:4, 5.8")
      canvasDisplayHeight = MAX_CANVAS_H;
      canvasDisplayWidth = Math.round(canvasDisplayHeight * targetRatio);
      if (canvasDisplayWidth > MAX_CANVAS_W) {
        canvasDisplayWidth = MAX_CANVAS_W;
        canvasDisplayHeight = Math.round(canvasDisplayWidth / targetRatio);
      }
    } else {
      // Landscape (16:9, 4:3, 2:1, 2.35:1, 1.85:1)
      canvasDisplayWidth = MAX_CANVAS_W;
      canvasDisplayHeight = Math.round(canvasDisplayWidth / targetRatio);
      if (canvasDisplayHeight > 340) {
        canvasDisplayHeight = 340;
        canvasDisplayWidth = Math.round(canvasDisplayHeight * targetRatio);
      }
    }
  }

  // --- Image Pickers & Crop Handlers ---

  const handlePickImageForSlot = async (slotIndex: number) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Quyền truy cập ảnh',
          'Ứng dụng cần quyền xem thư viện ảnh để ghép ảnh của bạn.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const pickedUri = result.assets[0].uri;
        setSlots((prev) => {
          const next = [...prev];
          next[slotIndex] = {
            id: slotIndex,
            uri: pickedUri,
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
    setSelectedSlotIndex(index);
    if (slots[index]?.uri) {
      setCropModalVisible(true);
    } else {
      // Pick image for this empty slot immediately
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
      };
      return next;
    });
  };

  // --- Export HD Collage Handler ---

  const handleExportCollage = async () => {
    try {
      setIsExporting(true);

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Quyền lưu ảnh',
          'Vui lòng cấp quyền lưu ảnh để lưu layout vào máy của bạn.'
        );
        setIsExporting(false);
        return;
      }

      if (!viewShotRef.current) {
        Alert.alert('Lỗi', 'Khung ảnh chưa sẵn sàng để xuất');
        setIsExporting(false);
        return;
      }

      // Capture at ultra-crisp resolution
      const uri = await viewShotRef.current.capture({
        format: 'png',
        quality: 1.0,
        result: 'tmpfile',
      });

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
      let thumb: string | null = null;
      if (viewShotRef.current) {
        try {
          thumb = await viewShotRef.current.capture({
            format: 'jpg',
            quality: 0.6,
            result: 'tmpfile',
          });
        } catch (e) {
          console.log('Thumbnail capture skipped:', e);
        }
      }

      const title =
        textConfig.enabled && textConfig.text
          ? textConfig.text
          : `Bản nháp ${currentLayout.name} • ${currentRatioId}`;

      await draftService.saveDraft({
        title,
        thumbnailUri: thumb,
        layoutId: currentLayout.id,
        ratioId: currentRatioId,
        slots,
        textConfig,
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
    const layout =
      LAYOUT_PRESETS.find((l) => l.id === draft.layoutId) || LAYOUT_PRESETS[0];
    setCurrentLayout(layout);
    setCurrentRatioId(draft.ratioId);
    setSlots(draft.slots);
    setTextConfig(draft.textConfig);
    setCanvasStyle(draft.canvasStyle);
  };

  return (
    <SafeAreaView style={styles.safeContainer} edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#16161B" />

      {/* Main Header */}
      <View style={styles.appHeader}>
        <View style={styles.logoRow}>
          <Image
            source={require('./assets/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.logoTitle}>PicMorph</Text>
            <Text style={styles.logoSub}>Ghép ảnh nghệ thuật</Text>
          </View>
        </View>

        <View style={styles.headerRightActions}>
          {/* Nút lưu bản nháp: icon only, disabled khi chưa có ảnh */}
          <TouchableOpacity
            style={[
              styles.headerActionBtn,
              (!hasContent || isSavingDraft) && styles.disabledHeaderBtn,
            ]}
            onPress={handleSaveCurrentDraft}
            disabled={!hasContent || isSavingDraft}
            activeOpacity={0.7}
          >
            {isSavingDraft ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons
                name="bookmark-outline"
                size={20}
                color={hasContent ? '#FFFFFF' : '#52525B'}
              />
            )}
          </TouchableOpacity>

          {/* Nút xem danh sách bản nháp */}
          <TouchableOpacity
            style={styles.headerActionBtn}
            onPress={() => setDraftsModalVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="folder-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Nút xuất ảnh HD: icon only, disabled khi chưa có ảnh */}
          <TouchableOpacity
            style={[
              styles.exportIconButton,
              (!hasContent || isExporting) && styles.disabledExportBtn,
            ]}
            onPress={handleExportCollage}
            disabled={!hasContent || isExporting}
            activeOpacity={0.7}
          >
            {isExporting ? (
              <ActivityIndicator size="small" color="#16161B" />
            ) : (
              <Ionicons
                name="download-outline"
                size={22}
                color={hasContent ? '#16161B' : '#52525B'}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.mainScroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Canvas Display Viewport with buffer padding - tap empty space to dismiss active selection */}
        <Pressable
          style={styles.canvasCenterContainer}
          onPress={() => setSelectedSlotIndex(null)}
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
              textConfig={textConfig}
              selectedSlotIndex={selectedSlotIndex}
              isFullScreen={isFullScreen}
              onSelectSlot={handleSelectSlot}
              onQuickPickSlot={handlePickImageForSlot}
              onPressText={() => setTextModalVisible(true)}
              onUpdateTextPosition={(x, y) => {
                setTextConfig((prev) => ({
                  ...prev,
                  positionX: x,
                  positionY: y,
                }));
              }}
            />
          </View>
        </Pressable>

        {/* Quick Mode Toggle: Ảnh vuông vs Full chiều dài */}
        <View style={styles.screenToggleBar}>
          <TouchableOpacity
            style={[
              styles.screenToggleBtn,
              !isFullScreen && styles.activeScreenToggleBtn,
            ]}
            onPress={() => {
              setIsFullScreen(false);
              setCurrentRatioId('1:1');
            }}
          >
            <Text
              style={[
                styles.screenToggleText,
                !isFullScreen && styles.activeScreenToggleText,
              ]}
            >
              Ảnh vuông
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.screenToggleBtn,
              isFullScreen && styles.activeScreenToggleBtn,
            ]}
            onPress={() => {
              setIsFullScreen(true);
              if (currentRatioId === '1:1') {
                setCurrentRatioId('9:16');
              }
            }}
          >
            <Text
              style={[
                styles.screenToggleText,
                isFullScreen && styles.activeScreenToggleText,
              ]}
            >
              Full chiều dài
            </Text>
          </TouchableOpacity>
        </View>

        {/* CapCut-style Aspect Ratio Selector */}
        <RatioSelector
          currentRatioId={currentRatioId}
          onSelectRatio={(newRatio) => {
            setCurrentRatioId(newRatio);
            if (newRatio === '1:1') {
              setIsFullScreen(false);
            } else {
              setIsFullScreen(true);
            }
          }}
        />

        {/* Layout Presets (Horizontal Scroller) */}
        <LayoutSelector
          currentLayoutId={currentLayout.id}
          onSelectLayout={(newLayout) => {
            setCurrentLayout(newLayout);
            if (selectedSlotIndex !== null && selectedSlotIndex >= newLayout.slotsCount) {
              setSelectedSlotIndex(0);
            }
          }}
        />

        {/* Feature Tool Buttons */}
        <View style={styles.toolsSection}>
          <Text style={styles.toolsTitle}>Tùy chỉnh & Hiệu ứng</Text>

          {/* Border & Styling Modal Trigger */}
          <TouchableOpacity
            style={styles.singleToolCard}
            onPress={() => setStyleModalVisible(true)}
          >
            <View style={styles.toolCardLeft}>
              <View style={[styles.toolIconWrap, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
                <Ionicons name="grid-outline" size={20} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.toolCardTitle}>Viền & Màu nền khung</Text>
                <Text style={styles.toolCardSub}>{canvasStyle.gap}px • Bảng màu đa dạng</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#71717A" />
          </TouchableOpacity>

          {/* Drafts Manager Card */}
          <TouchableOpacity
            style={[styles.singleToolCard, { marginTop: 10 }]}
            onPress={() => setDraftsModalVisible(true)}
          >
            <View style={styles.toolCardLeft}>
              <View style={[styles.toolIconWrap, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
                <Ionicons name="folder-open-outline" size={20} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.toolCardTitle}>Quản lý bản nháp</Text>
                <Text style={styles.toolCardSub}>Lưu & Mở lại thiết kế đang làm dở</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#71717A" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Popups and Modals */}
      <CropModal
        visible={cropModalVisible}
        slotIndex={selectedSlotIndex}
        slotData={selectedSlotIndex !== null ? slots[selectedSlotIndex] : null}
        slotLayout={
          selectedSlotIndex !== null && currentLayout?.slots
            ? currentLayout.slots[selectedSlotIndex]
            : null
        }
        canvasWidth={
          !isFullScreen
            ? Math.min(canvasDisplayWidth, canvasDisplayHeight)
            : canvasDisplayWidth
        }
        canvasHeight={
          !isFullScreen
            ? Math.min(canvasDisplayWidth, canvasDisplayHeight)
            : canvasDisplayHeight
        }
        borderRadius={canvasStyle.borderRadius}
        onClose={() => setCropModalVisible(false)}
        onSave={handleSaveCrop}
        onReplaceImage={() => {
          if (selectedSlotIndex !== null) handlePickImageForSlot(selectedSlotIndex);
        }}
        onRemoveImage={() => {
          if (selectedSlotIndex !== null) handleRemoveSlotImage(selectedSlotIndex);
        }}
      />

      <TextConfigModal
        visible={textModalVisible}
        config={textConfig}
        onClose={() => setTextModalVisible(false)}
        onSave={(newCfg) => setTextConfig(newCfg)}
      />

      <StyleModal
        visible={styleModalVisible}
        styleConfig={canvasStyle}
        onClose={() => setStyleModalVisible(false)}
        onChangeStyle={(newStyle) => setCanvasStyle(newStyle)}
      />

      <ExportSuccessModal
        visible={successModalVisible}
        imageUri={exportedImageUri}
        onClose={() => setSuccessModalVisible(false)}
        onShare={handleShareExportedImage}
      />

      <DraftsModal
        visible={draftsModalVisible}
        onClose={() => setDraftsModalVisible(false)}
        onSelectDraft={handleSelectDraft}
        onSaveCurrentAsDraft={handleSaveCurrentDraft}
        isSavingCurrent={isSavingDraft}
        hasContent={hasContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#16161B',
  },
  appHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoImage: {
    width: 34,
    height: 34,
    borderRadius: 8,
  },
  logoTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  logoSub: {
    color: '#71717A',
    fontSize: 10,
    fontWeight: '500',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#202026',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledHeaderBtn: {
    opacity: 0.35,
  },
  exportIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledExportBtn: {
    backgroundColor: '#202026',
    opacity: 0.35,
  },
  mainScroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  screenToggleBar: {
    flexDirection: 'row',
    backgroundColor: '#202026',
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 6,
    borderRadius: 12,
    padding: 4,
    gap: 6,
  },
  screenToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 8,
    gap: 6,
  },
  activeScreenToggleBtn: {
    backgroundColor: '#FFFFFF',
  },
  screenToggleText: {
    color: '#A1A1AA',
    fontSize: 12,
    fontWeight: '600',
  },
  activeScreenToggleText: {
    color: '#16161B',
    fontWeight: '700',
  },

  canvasCenterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24, // Generous buffer padding to tap empty space
    width: '100%',
  },
  canvasShadowBox: {
    borderRadius: 0,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },

  toolsSection: {
    paddingHorizontal: 16,
    marginTop: 14,
  },
  toolsTitle: {
    color: '#F4F4F5',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },
  singleToolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#202026',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2D2D36',
  },
  toolCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toolIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolCardTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  toolCardSub: {
    color: '#71717A',
    fontSize: 11,
    marginTop: 3,
  },
});
