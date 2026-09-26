import React, { forwardRef, useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import ViewShot from 'react-native-view-shot';
import { Ionicons } from '@expo/vector-icons';
import { CellItem } from './CellItem';
import {
  CanvasStyleConfig,
  LayoutPreset,
  SlotImageState,
  TextItem,
  TextOverlayConfig,
} from '../types';

interface CollageCanvasProps {
  layout: LayoutPreset;
  slots: SlotImageState[];
  canvasStyle: CanvasStyleConfig;
  textConfig?: TextOverlayConfig;
  texts?: TextItem[];
  selectedTextId?: string | null;
  selectedSlotIndex: number | null;
  isExporting?: boolean;
  isFullScreen?: boolean;
  onSelectSlot: (index: number) => void;
  onQuickPickSlot: (index: number) => void;
  onSelectText?: (id: string | null) => void;
  onUpdateTextPosition?: (id: string, x: number, y: number) => void;
  onEditText?: (item: TextItem) => void;
  onDeleteText?: (id: string) => void;
}

// ─── Single Draggable Text Item ──────────────────────────────────────────────
interface DraggableTextProps {
  item: TextItem;
  isSelected: boolean;
  onSelect: () => void;
  onUpdatePosition: (x: number, y: number) => void;
  onEdit: () => void;
  onDelete: () => void;
}

const DraggableTextItem: React.FC<DraggableTextProps> = ({
  item,
  isSelected,
  onSelect,
  onUpdatePosition,
  onEdit,
  onDelete,
}) => {
  const pan = useRef(new Animated.ValueXY({ x: item.x, y: item.y })).current;
  const lastPosRef = useRef({ x: item.x, y: item.y });

  useEffect(() => {
    lastPosRef.current = { x: item.x, y: item.y };
    pan.setValue({ x: item.x, y: item.y });
  }, [item.x, item.y]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 2 || Math.abs(g.dy) > 2,
      onPanResponderGrant: () => {
        pan.setOffset({ x: lastPosRef.current.x, y: lastPosRef.current.y });
        pan.setValue({ x: 0, y: 0 });
        onSelect();
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, g) => {
        pan.flattenOffset();
        const dist = Math.hypot(g.dx, g.dy);
        if (dist < 5) {
          // Tap: if already selected, open edit modal
          if (isSelected) {
            onEdit();
          } else {
            onSelect();
          }
        } else {
          // Dragged: update final position
          const newX = Math.round(lastPosRef.current.x + g.dx);
          const newY = Math.round(lastPosRef.current.y + g.dy);
          lastPosRef.current = { x: newX, y: newY };
          onUpdatePosition(newX, newY);
        }
      },
    })
  ).current;

  return (
    <Animated.View
      style={[
        styles.draggableTextWrapper,
        {
          transform: [{ translateX: pan.x }, { translateY: pan.y }],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <View
        style={[
          styles.textContainerBox,
          isSelected && styles.selectedTextBox,
          item.hasBackground && {
            backgroundColor: item.bgColor || 'rgba(0,0,0,0.7)',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 8,
          },
        ]}
      >
        <Text
          style={[
            styles.customTextContent,
            {
              fontSize: item.fontSize,
              color: item.color,
              letterSpacing: item.letterSpacing ?? 0.5,
              textTransform: item.uppercase ? 'uppercase' : 'none',
              fontFamily: item.fontFamily,
              fontWeight: item.fontWeight || '700',
              fontStyle: item.fontStyle || 'normal',
            },
            item.hasShadow && {
              textShadowColor: item.shadowColor || 'rgba(0, 0, 0, 0.85)',
              textShadowOffset: { width: 1.5, height: 1.5 },
              textShadowRadius: 3,
            },
          ]}
        >
          {item.text}
        </Text>

        {/* Delete badge on top-right when selected */}
        {isSelected && (
          <TouchableOpacity
            style={styles.textDeleteBadge}
            onPress={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close-circle" size={20} color="#EF4444" />
          </TouchableOpacity>
        )}

        {/* Edit badge on bottom-right when selected */}
        {isSelected && (
          <TouchableOpacity
            style={styles.textEditBadge}
            onPress={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="pencil" size={12} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

// ─── Main CollageCanvas ──────────────────────────────────────────────────────
export const CollageCanvas = forwardRef<any, CollageCanvasProps>(
  (
    {
      layout,
      slots,
      canvasStyle,
      textConfig,
      texts = [],
      selectedTextId,
      selectedSlotIndex,
      isExporting = false,
      isFullScreen = false,
      onSelectSlot,
      onQuickPickSlot,
      onSelectText,
      onUpdateTextPosition,
      onEditText,
      onDeleteText,
    },
    ref
  ) => {
    return (
      <ViewShot
        ref={ref}
        options={{ format: 'png', quality: 1.0, result: 'tmpfile', useRenderInContext: true }}
        style={[
          styles.canvasContainer,
          {
            backgroundColor: canvasStyle.bgColor,
            padding: (canvasStyle.padding || 0) + (canvasStyle.gap || 0) / 2,
          },
        ]}
      >
        {/* Grid Cells Layer */}
        <View style={styles.gridLayer}>
          {layout.slots.map((slotLayout, index) => {
            const slotData = slots[index] || {
              id: index,
              uri: null,
              scale: 1,
              offsetX: 0,
              offsetY: 0,
              rotation: 0,
              flipH: false,
              flipV: false,
            };

            // Khi đang xuất ảnh, tuyệt đối KHÔNG hiển thị viền active trắng
            const isSelected = !isExporting && selectedSlotIndex === index;
            const halfGap = (canvasStyle.gap || 0) / 2;
            const isKhit = (canvasStyle.gap || 0) === 0;

            return (
              <View
                key={`slot-${index}-${layout.id}`}
                style={[
                  styles.slotWrapper,
                  {
                    left: `${slotLayout.left}%`,
                    top: `${slotLayout.top}%`,
                    width: `${slotLayout.width}%`,
                    height: `${slotLayout.height}%`,
                    padding: halfGap,
                    margin: isKhit ? -0.5 : 0,
                  },
                ]}
              >
                <CellItem
                  slot={slotData}
                  slotIndex={index}
                  isSelected={isSelected}
                  borderRadius={canvasStyle.borderRadius}
                  onPress={() => onSelectSlot(index)}
                  onQuickPick={() => onQuickPickSlot(index)}
                />
              </View>
            );
          })}
        </View>

        {/* Multiple Draggable Texts Layer */}
        {texts && texts.length > 0 && (
          <View style={styles.textsOverlayLayer} pointerEvents="box-none">
            {texts.map((item) => (
              <DraggableTextItem
                key={item.id}
                item={item}
                isSelected={!isExporting && selectedTextId === item.id}
                onSelect={() => onSelectText?.(item.id)}
                onUpdatePosition={(x, y) => onUpdateTextPosition?.(item.id, x, y)}
                onEdit={() => onEditText?.(item)}
                onDelete={() => onDeleteText?.(item.id)}
              />
            ))}
          </View>
        )}
      </ViewShot>
    );
  }
);

const styles = StyleSheet.create({
  canvasContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridLayer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  slotWrapper: {
    position: 'absolute',
  },
  textsOverlayLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  draggableTextWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainerBox: {
    position: 'relative',
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedTextBox: {
    borderWidth: 1.5,
    borderColor: '#3B82F6',
    borderStyle: 'dashed',
    borderRadius: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
  },
  customTextContent: {
    textAlign: 'center',
  },
  textDeleteBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#1C1C22',
    borderRadius: 10,
    elevation: 3,
  },
  textEditBadge: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
});
