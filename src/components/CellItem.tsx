import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SlotImageState } from '../types';
import { computeImageFilterStyle, getFilterOverlays } from '../utils/filterUtils';

interface CellItemProps {
  slot: SlotImageState;
  slotIndex: number;
  isSelected: boolean;
  borderRadius: number;
  onPress: () => void;
  onLongPress?: () => void;
  onQuickPick: () => void;
}

export const CellItem: React.FC<CellItemProps> = ({
  slot,
  slotIndex,
  isSelected,
  borderRadius,
  onPress,
  onLongPress,
  onQuickPick,
}) => {
  const [cellSize, setCellSize] = React.useState({ width: 0, height: 0 });
  const hasImage = !!slot.uri;

  const handleLayout = (e: any) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setCellSize({ width, height });
    }
  };

  const translateX =
    slot.normX !== undefined && cellSize.width > 0
      ? slot.normX * cellSize.width
      : slot.offsetX || 0;

  const translateY =
    slot.normY !== undefined && cellSize.height > 0
      ? slot.normY * cellSize.height
      : slot.offsetY || 0;

  const imgW = slot.origWidth || cellSize.width || 1;
  const imgH = slot.origHeight || cellSize.height || 1;
  const isRotated90 = Math.abs((slot.rotation || 0) % 180) === 90;
  const effImgW = isRotated90 ? imgH : imgW;
  const effImgH = isRotated90 ? imgW : imgH;
  const imgAspect = effImgH > 0 ? effImgW / effImgH : 1;
  const cellAspect = cellSize.height > 0 ? cellSize.width / cellSize.height : 1;
  const autoCoverScale = Math.max(1.0, imgAspect >= cellAspect ? imgAspect / cellAspect : cellAspect / imgAspect);

  const appliedScale = slot.scale && slot.scale !== 1
    ? slot.scale
    : (slot.fitMode === 'cover' ? autoCoverScale : 1);

  // Compute image transform
  const transform = [
    { scale: appliedScale },
    { translateX },
    { translateY },
    { rotate: `${slot.rotation || 0}deg` },
    { scaleX: slot.flipH ? -1 : 1 },
    { scaleY: slot.flipV ? -1 : 1 },
  ];

  const filterStyle = computeImageFilterStyle(slot.filters, slot.colorPreset);
  const overlays = getFilterOverlays(slot.filters, slot.colorPreset);

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={hasImage ? onPress : onQuickPick}
      onLongPress={onLongPress || onPress}
      onLayout={handleLayout}
      style={[
        styles.container,
        { borderRadius },
        isSelected && styles.selectedBorder,
      ]}
    >
      {hasImage ? (
        <View style={[styles.imageWrapper, { borderRadius }]}>
          <Image
            source={{ uri: slot.uri! }}
            style={[styles.image, { transform }, filterStyle as any]}
            resizeMode="contain"
          />
          {overlays.map((ov) => (
            <View
              key={ov.key}
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: ov.backgroundColor, opacity: ov.opacity, borderRadius },
              ]}
            />
          ))}
        </View>
      ) : (
        <View style={[styles.placeholder, { borderRadius }]}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="image-outline" size={28} color="#71717A" />
            <View style={styles.emptyPlusBadge}>
              <Ionicons name="add" size={12} color="#16161B" />
            </View>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
  selectedBorder: {
    borderColor: '#FFFFFF',
    borderWidth: 2,
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000000',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111111',
  },
  emptyIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#25252D',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  emptyPlusBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 17,
    height: 17,
    borderRadius: 8.5,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
