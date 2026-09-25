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

  // Compute image transform
  const transform = [
    { scale: slot.scale || 1 },
    { translateX },
    { translateY },
    { rotate: `${slot.rotation || 0}deg` },
    { scaleX: slot.flipH ? -1 : 1 },
    { scaleY: slot.flipV ? -1 : 1 },
  ];

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
            style={[styles.image, { transform }]}
            resizeMode={slot.fitMode || 'contain'}
          />
        </View>
      ) : (
        <View style={[styles.placeholder, { borderRadius }]}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="image-outline" size={28} color="#71717A" />
            <View style={styles.emptyPlusBadge}>
              <Ionicons name="add" size={12} color="#FFFFFF" />
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
    backgroundColor: '#16161B',
  },
  selectedBorder: {
    borderColor: '#3B82F6',
    borderWidth: 2.5,
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#16161B',
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
    backgroundColor: '#1C1C22',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#2D2D36',
  },
  emptyIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#25252D',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#32323D',
  },
  emptyPlusBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 17,
    height: 17,
    borderRadius: 8.5,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
