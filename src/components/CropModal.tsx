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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SlotImageState, SlotLayout } from '../types';

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
}

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
}) => {
  const [scale, setScale] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [fitMode, setFitMode] = useState<'contain' | 'cover'>('contain');

  // Compute exact slot aspect ratio from layout & canvas dimensions
  const actualSlotW = slotLayout ? ((canvasWidth || 360) * slotLayout.width) / 100 : 180;
  const actualSlotH = slotLayout ? ((canvasHeight || 360) * slotLayout.height) / 100 : 180;
  const slotAspect = actualSlotH > 0 ? actualSlotW / actualSlotH : 1;

  // Compute preview frame dimensions inside modal with exact same aspect ratio
  const MAX_W = 280;
  const MAX_H = 290;
  let frameWidth: number;
  let frameHeight: number;

  if (slotAspect >= 1) {
    frameWidth = MAX_W;
    frameHeight = Math.round(MAX_W / slotAspect);
    if (frameHeight > MAX_H) {
      frameHeight = MAX_H;
      frameWidth = Math.round(MAX_H * slotAspect);
    }
  } else {
    frameHeight = MAX_H;
    frameWidth = Math.round(MAX_H * slotAspect);
    if (frameWidth > MAX_W) {
      frameWidth = MAX_W;
      frameHeight = Math.round(MAX_W / slotAspect);
    }
  }

  // Mutable ref storing coordinates so PanResponder never gets stale or recreated mid-drag
  const stateRef = useRef({
    x: 0,
    y: 0,
    scale: 1,
    startX: 0,
    startY: 0,
    startScale: 1,
    initialDistance: 0,
  });

  // Sync state only when the modal opens, scaling offsets proportionally to frameWidth / frameHeight
  useEffect(() => {
    if (visible && slotData) {
      const initScale = slotData.scale || 1;
      const initRot = slotData.rotation || 0;
      const initFlipH = slotData.flipH || false;
      const initFlipV = slotData.flipV || false;
      const initFit = slotData.fitMode || 'contain';

      let initX = 0;
      let initY = 0;
      if (slotData.normX !== undefined && slotData.normY !== undefined) {
        initX = Math.round(slotData.normX * frameWidth);
        initY = Math.round(slotData.normY * frameHeight);
      } else if (actualSlotW > 0 && actualSlotH > 0 && (slotData.offsetX || slotData.offsetY)) {
        initX = Math.round((slotData.offsetX / actualSlotW) * frameWidth);
        initY = Math.round((slotData.offsetY / actualSlotH) * frameHeight);
      }

      setScale(initScale);
      setOffsetX(initX);
      setOffsetY(initY);
      setRotation(initRot);
      setFlipH(initFlipH);
      setFlipV(initFlipV);
      setFitMode(initFit);

      stateRef.current = {
        x: initX,
        y: initY,
        scale: initScale,
        startX: initX,
        startY: initY,
        startScale: initScale,
        initialDistance: 0,
      };
    }
  }, [visible, slotData, frameWidth, frameHeight]);

  // Distance helper for 2-finger pinch
  const getDistance = (touches: any[]) => {
    const [t1, t2] = touches;
    const dx = t1.pageX - t2.pageX;
    const dy = t1.pageY - t2.pageY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // PanResponder initialized ONCE with useRef to guarantee ZERO snap-back or recreation glitches
  const panResponderRef = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const touches = evt.nativeEvent.touches;
        stateRef.current.startX = stateRef.current.x;
        stateRef.current.startY = stateRef.current.y;
        stateRef.current.startScale = stateRef.current.scale;
        stateRef.current.initialDistance =
          touches.length >= 2 ? getDistance(touches) : 0;
      },
      onPanResponderMove: (evt, gesture) => {
        const touches = evt.nativeEvent.touches;
        if (touches.length >= 2) {
          // 2-finger Pinch-to-zoom
          const currentDist = getDistance(touches);
          if (stateRef.current.initialDistance > 0) {
            const factor = currentDist / stateRef.current.initialDistance;
            const newScale = Math.min(
              4.0,
              Math.max(0.6, stateRef.current.startScale * factor)
            );
            const roundedScale = +newScale.toFixed(2);
            setScale(roundedScale);
            stateRef.current.scale = roundedScale;
          }
        } else {
          // 1-finger Smooth Swipe/Drag
          const newX = Math.round(stateRef.current.startX + gesture.dx);
          const newY = Math.round(stateRef.current.startY + gesture.dy);
          setOffsetX(newX);
          setOffsetY(newY);
          stateRef.current.x = newX;
          stateRef.current.y = newY;
        }
      },
      onPanResponderRelease: () => {
        // Position is safely stored in stateRef.current, preventing any snap back!
      },
      onPanResponderTerminate: () => {
        // Also keep position on terminate
      },
    })
  );

  if (!slotData || !slotData.uri) return null;

  const handleApply = () => {
    const curX = stateRef.current.x;
    const curY = stateRef.current.y;
    const curScale = stateRef.current.scale;
    const normX = frameWidth > 0 ? curX / frameWidth : 0;
    const normY = frameHeight > 0 ? curY / frameHeight : 0;

    onSave({
      ...slotData,
      scale: curScale,
      normX,
      normY,
      offsetX: Math.round(normX * actualSlotW),
      offsetY: Math.round(normY * actualSlotH),
      rotation,
      flipH,
      flipV,
      fitMode,
    });
    onClose();
  };

  const handleReset = () => {
    setScale(1);
    setOffsetX(0);
    setOffsetY(0);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setFitMode('contain');
    stateRef.current.x = 0;
    stateRef.current.y = 0;
    stateRef.current.scale = 1;
  };

  const transform = [
    { scale },
    { translateX: offsetX },
    { translateY: offsetY },
    { rotate: `${rotation}deg` },
    { scaleX: flipH ? -1 : 1 },
    { scaleY: flipV ? -1 : 1 },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.iconButton}>
              <Ionicons name="close" size={24} color="#A1A1AA" />
            </TouchableOpacity>
            <View style={styles.headerTitleWrap}>
              <Text style={styles.title}>Cắt & Căn chỉnh ảnh</Text>
              <Text style={styles.subtitle}>Ô số {(slotIndex ?? 0) + 1}</Text>
            </View>
            <TouchableOpacity onPress={handleApply} style={styles.saveHeaderBtn}>
              <Text style={styles.saveHeaderText}>Áp dụng</Text>
            </TouchableOpacity>
          </View>

          {/* Fit Mode Switch Bar */}
          <View style={styles.fitModeBar}>
            <TouchableOpacity
              style={[styles.fitModeBtn, fitMode === 'contain' && styles.activeFitModeBtn]}
              onPress={() => setFitMode('contain')}
            >
              <Ionicons
                name="scan-outline"
                size={14}
                color={fitMode === 'contain' ? '#FFFFFF' : '#A1A1AA'}
              />
              <Text
                style={[styles.fitModeText, fitMode === 'contain' && styles.activeFitModeText]}
                numberOfLines={1}
              >
                Giữ nguyên ảnh
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.fitModeBtn, fitMode === 'cover' && styles.activeFitModeBtn]}
              onPress={() => setFitMode('cover')}
            >
              <Ionicons
                name="crop-outline"
                size={14}
                color={fitMode === 'cover' ? '#FFFFFF' : '#A1A1AA'}
              />
              <Text
                style={[styles.fitModeText, fitMode === 'cover' && styles.activeFitModeText]}
                numberOfLines={1}
              >
                Lấp đầy ô
              </Text>
            </TouchableOpacity>
          </View>

          {/* Interactive Gesture Canvas */}
          <View style={styles.previewContainer}>
            <View
              style={[
                styles.previewFrame,
                {
                  width: frameWidth,
                  height: frameHeight,
                  borderRadius: borderRadius ?? 0,
                },
              ]}
              {...panResponderRef.current.panHandlers}
            >
              <Image
                source={{ uri: slotData.uri }}
                style={[styles.previewImage, { transform }]}
                resizeMode={fitMode}
              />
              {/* Grid guide lines for aesthetic cropping */}
              <View style={styles.ruleOfThirdsH1} pointerEvents="none" />
              <View style={styles.ruleOfThirdsH2} pointerEvents="none" />
              <View style={styles.ruleOfThirdsV1} pointerEvents="none" />
              <View style={styles.ruleOfThirdsV2} pointerEvents="none" />
            </View>
          </View>

          <ScrollView style={styles.controlsScroll} showsVerticalScrollIndicator={false}>
            {/* Rotate and Flip Controls */}
            <View style={styles.controlGroup}>
              <View style={styles.groupHeader}>
                <Ionicons name="sync-outline" size={18} color="#FBBF24" />
                <Text style={styles.groupTitle}>Xoay & Lật ảnh</Text>
              </View>
              <View style={styles.actionButtonsRow}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => setRotation((r) => (r + 90) % 360)}
                >
                  <Ionicons name="reload-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.actionBtnText}>Xoay 90°</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, flipH && styles.activeActionBtn]}
                  onPress={() => setFlipH((f) => !f)}
                >
                  <Ionicons
                    name="swap-horizontal"
                    size={20}
                    color={flipH ? '#3B82F6' : '#FFFFFF'}
                  />
                  <Text style={[styles.actionBtnText, flipH && styles.activeActionBtnText]}>
                    Lật ngang
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, flipV && styles.activeActionBtn]}
                  onPress={() => setFlipV((f) => !f)}
                >
                  <Ionicons
                    name="swap-vertical"
                    size={20}
                    color={flipV ? '#3B82F6' : '#FFFFFF'}
                  />
                  <Text style={[styles.actionBtnText, flipV && styles.activeActionBtnText]}>
                    Lật dọc
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Bottom Actions: Replace, Reset, Remove */}
            <View style={styles.dangerRow}>
              <TouchableOpacity
                style={styles.replaceBtn}
                onPress={() => {
                  onClose();
                  onReplaceImage();
                }}
              >
                <Ionicons name="images-outline" size={18} color="#60A5FA" />
                <Text style={styles.replaceText}>Chọn ảnh khác</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
                <Ionicons name="refresh-outline" size={18} color="#A1A1AA" />
                <Text style={styles.resetText}>Về giữa</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => {
                  onClose();
                  onRemoveImage();
                }}
              >
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
                <Text style={styles.removeText}>Xóa</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#1C1C22',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D36',
  },
  iconButton: {
    padding: 6,
  },
  headerTitleWrap: {
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    color: '#A1A1AA',
    fontSize: 12,
    marginTop: 1,
  },
  saveHeaderBtn: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 18,
  },
  saveHeaderText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  fitModeBar: {
    flexDirection: 'row',
    backgroundColor: '#25252D',
    borderRadius: 12,
    padding: 3,
    marginTop: 12,
    marginBottom: 4,
    gap: 4,
  },
  fitModeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 9,
    gap: 5,
  },
  activeFitModeBtn: {
    backgroundColor: '#3B82F6',
  },
  fitModeText: {
    color: '#A1A1AA',
    fontSize: 11,
    fontWeight: '600',
  },
  activeFitModeText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  previewContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  previewFrame: {
    borderRadius: 0,
    overflow: 'hidden',
    backgroundColor: '#16161B',
    borderWidth: 2,
    borderColor: '#3B82F6',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  ruleOfThirdsH1: {
    position: 'absolute',
    top: '33.33%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  ruleOfThirdsH2: {
    position: 'absolute',
    top: '66.66%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  ruleOfThirdsV1: {
    position: 'absolute',
    left: '33.33%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  ruleOfThirdsV2: {
    position: 'absolute',
    left: '66.66%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  controlsScroll: {
    maxHeight: 220,
  },
  controlGroup: {
    backgroundColor: '#25252D',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  groupTitle: {
    color: '#F4F4F5',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
    flex: 1,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#32323D',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeActionBtn: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  activeActionBtnText: {
    color: '#60A5FA',
  },
  dangerRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    marginBottom: 8,
  },
  replaceBtn: {
    flex: 1.5,
    flexDirection: 'row',
    backgroundColor: '#25252D',
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  replaceText: {
    color: '#60A5FA',
    fontSize: 12,
    fontWeight: '700',
  },
  resetBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#25252D',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  resetText: {
    color: '#A1A1AA',
    fontSize: 12,
    fontWeight: '600',
  },
  removeBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  removeText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
  },
});
