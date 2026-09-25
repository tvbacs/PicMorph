import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LAYOUT_PRESETS } from '../constants/layouts';
import { LayoutPreset } from '../types';

interface LayoutSelectorProps {
  currentLayoutId: string;
  onSelectLayout: (layout: LayoutPreset) => void;
}

export const LayoutSelector: React.FC<LayoutSelectorProps> = ({
  currentLayoutId,
  onSelectLayout,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Chọn Layout ảnh</Text>
        <Text style={styles.countText}>{LAYOUT_PRESETS.length} kiểu</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollList}
      >
        {LAYOUT_PRESETS.map((layout) => {
          const isSelected = layout.id === currentLayoutId;

          return (
            <TouchableOpacity
              key={layout.id}
              activeOpacity={0.8}
              style={[styles.card, isSelected && styles.activeCard]}
              onPress={() => onSelectLayout(layout)}
            >
              {layout.isFeatured && (
                <View style={styles.hotBadge}>
                  <Text style={styles.hotText}>HOT</Text>
                </View>
              )}

              {/* Mini visual representation of the grid */}
              <View style={styles.miniGridFrame}>
                {layout.slots.map((slot, idx) => (
                  <View
                    key={`mini-${layout.id}-${idx}`}
                    style={[
                      styles.miniSlot,
                      {
                        left: `${slot.left}%`,
                        top: `${slot.top}%`,
                        width: `${slot.width}%`,
                        height: `${slot.height}%`,
                        backgroundColor: isSelected ? '#3B82F6' : '#52525B',
                      },
                    ]}
                  />
                ))}
              </View>

              <Text
                style={[styles.cardName, isSelected && styles.activeCardName]}
                numberOfLines={1}
              >
                {layout.name}
              </Text>
              <Text style={styles.cardSubtitle} numberOfLines={1}>
                {layout.subtitle}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  title: {
    color: '#F4F4F5',
    fontSize: 13,
    fontWeight: '700',
  },
  countText: {
    color: '#71717A',
    fontSize: 11,
    fontWeight: '600',
  },
  scrollList: {
    paddingHorizontal: 14,
    gap: 8,
  },
  card: {
    width: 96,
    backgroundColor: '#202026',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#2D2D36',
    position: 'relative',
  },
  activeCard: {
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
  },
  hotBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
    zIndex: 10,
  },
  hotText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
  },
  miniGridFrame: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: '#16161B',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 6,
  },
  miniSlot: {
    position: 'absolute',
    borderWidth: 0.5,
    borderColor: '#16161B',
  },
  cardName: {
    color: '#D4D4D8',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  activeCardName: {
    color: '#60A5FA',
  },
  cardSubtitle: {
    color: '#71717A',
    fontSize: 9,
    textAlign: 'center',
    marginTop: 1,
  },
});
