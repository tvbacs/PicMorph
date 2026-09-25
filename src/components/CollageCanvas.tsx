import React, { forwardRef, useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
} from 'react-native';
import ViewShot from 'react-native-view-shot';
import { CellItem } from './CellItem';
import {
  CanvasStyleConfig,
  LayoutPreset,
  SlotImageState,
  TextOverlayConfig,
} from '../types';

interface CollageCanvasProps {
  layout: LayoutPreset;
  slots: SlotImageState[];
  canvasStyle: CanvasStyleConfig;
  textConfig: TextOverlayConfig;
  selectedSlotIndex: number | null;
  isFullScreen?: boolean;
  onSelectSlot: (index: number) => void;
  onQuickPickSlot: (index: number) => void;
  onPressText?: () => void;
  onUpdateTextPosition?: (x: number, y: number) => void;
}

export const CollageCanvas = forwardRef<any, CollageCanvasProps>(
  (
    {
      layout,
      slots,
      canvasStyle,
      textConfig,
      selectedSlotIndex,
      isFullScreen = false,
      onSelectSlot,
      onQuickPickSlot,
      onPressText,
      onUpdateTextPosition,
    },
    ref
  ) => {
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

    const handleContainerLayout = (e: any) => {
      const { width, height } = e.nativeEvent.layout;
      if (width > 0 && height > 0) {
        setContainerSize({ width, height });
      }
    };

    const isSquareFit = !isFullScreen;
    const squareDimension =
      containerSize.width > 0 && containerSize.height > 0
        ? Math.min(containerSize.width, containerSize.height)
        : undefined;

    const gridStyle =
      isSquareFit && squareDimension
        ? {
            width: squareDimension,
            height: squareDimension,
            position: 'relative' as const,
          }
        : styles.gridLayer;

    const initialX = textConfig.positionX ?? 0;
    const initialY = textConfig.positionY ?? 0;

    const pan = useRef(new Animated.ValueXY({ x: initialX, y: initialY })).current;
    const lastPosRef = useRef({ x: initialX, y: initialY });

    useEffect(() => {
      const curX = textConfig.positionX ?? 0;
      const curY = textConfig.positionY ?? 0;
      lastPosRef.current = { x: curX, y: curY };
      pan.setValue({ x: curX, y: curY });
    }, [textConfig.positionX, textConfig.positionY]);

    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2;
        },
        onPanResponderGrant: () => {
          pan.setOffset({
            x: lastPosRef.current.x,
            y: lastPosRef.current.y,
          });
          pan.setValue({ x: 0, y: 0 });
        },
        onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
          useNativeDriver: false,
        }),
        onPanResponderRelease: (_, gestureState) => {
          pan.flattenOffset();
          const dist = Math.hypot(gestureState.dx, gestureState.dy);
          if (dist < 4) {
            // Tap -> Open text settings modal
            onPressText?.();
          } else {
            // Dragged -> Save final position
            const newX = lastPosRef.current.x + gestureState.dx;
            const newY = lastPosRef.current.y + gestureState.dy;
            lastPosRef.current = { x: newX, y: newY };
            onUpdateTextPosition?.(Math.round(newX), Math.round(newY));
          }
        },
      })
    ).current;

    return (
      <ViewShot
        ref={ref}
        options={{ format: 'png', quality: 1.0, result: 'tmpfile' }}
        onLayout={handleContainerLayout}
        style={[
          styles.canvasContainer,
          {
            backgroundColor: canvasStyle.bgColor,
            padding: canvasStyle.padding,
          },
        ]}
      >
        {/* Grid Cells */}
        <View style={gridStyle}>
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

            const isSelected = selectedSlotIndex === index;

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
                    padding: canvasStyle.gap / 2,
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

        {/* Free-form Draggable Text Overlay */}
        {textConfig.enabled && textConfig.text.trim().length > 0 && (
          <View pointerEvents="box-none" style={styles.textOverlayLayer}>
            <Animated.View
              {...panResponder.panHandlers}
              style={[
                styles.textBox,
                {
                  transform: pan.getTranslateTransform(),
                },
                textConfig.hasBackground && {
                  backgroundColor: textConfig.bgColor,
                  paddingHorizontal: 18,
                  paddingVertical: 8,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.25)',
                },
              ]}
            >
              <Text
                style={[
                  styles.mainText,
                  {
                    fontSize: textConfig.fontSize,
                    color: textConfig.color,
                    letterSpacing: textConfig.letterSpacing,
                    textTransform: textConfig.uppercase ? 'uppercase' : 'none',
                    fontFamily: textConfig.fontFamily,
                    fontWeight: textConfig.fontWeight || '900',
                    fontStyle: textConfig.fontStyle || 'normal',
                  },
                  textConfig.hasShadow && {
                    textShadowColor: 'rgba(0, 0, 0, 0.75)',
                    textShadowOffset: { width: 1, height: 1.5 },
                    textShadowRadius: 2,
                  },
                ]}
              >
                {textConfig.text}
              </Text>

              {textConfig.subtitle && textConfig.subtitle.trim().length > 0 && (
                <Text
                  style={[
                    styles.subtitleText,
                    {
                      color: textConfig.color,
                      opacity: 0.85,
                      letterSpacing: textConfig.letterSpacing / 2,
                    },
                  ]}
                >
                  {textConfig.subtitle}
                </Text>
              )}
            </Animated.View>
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
  textOverlayLayer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  textBox: {
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '90%',
  },
  mainText: {
    color: '#FFFFFF',
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
    textAlign: 'center',
  },
});
