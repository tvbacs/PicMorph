import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LAYOUT_PRESETS } from '../constants/layouts';
import { LayoutPreset } from '../types';

interface LayoutModalProps {
  visible: boolean;
  currentLayoutId: string;
  onClose: () => void;
  onSelectLayout: (layout: LayoutPreset) => void;
}

export const LayoutModal: React.FC<LayoutModalProps> = ({
  visible,
  currentLayoutId,
  onClose,
  onSelectLayout,
}) => {
  const [filterSlotCount, setFilterSlotCount] = useState<number | 'all'>('all');

  const filteredLayouts =
    filterSlotCount === 'all'
      ? LAYOUT_PRESETS
      : LAYOUT_PRESETS.filter((l) => l.slotsCount === filterSlotCount);

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
            <View style={styles.headerLeft}>
              <Ionicons name="grid-outline" size={18} color="#60A5FA" />
              <Text style={styles.title}>Bố cục khung ảnh</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.doneBtn}>
              <Ionicons name="checkmark" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Filter Pills for Slot Counts (Tất cả, 2 ô, 3 ô, 4 ô...) */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterPillsScroll}
          >
            {(['all', 2, 3, 4, 5, 6, 7, 8, 9] as const).map((count) => {
              const isActive = filterSlotCount === count;
              const label = count === 'all' ? 'Tất cả' : `${count} ô`;

              return (
                <TouchableOpacity
                  key={`filter-${count}`}
                  style={[styles.pill, isActive && styles.activePill]}
                  onPress={() => setFilterSlotCount(count)}
                >
                  <Text style={[styles.pillText, isActive && styles.activePillText]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Layout Cards Horizontal Scroll */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollList}
          >
            {filteredLayouts.map((layout) => {
              const isSelected = layout.id === currentLayoutId;

              return (
                <TouchableOpacity
                  key={layout.id}
                  activeOpacity={0.8}
                  style={[styles.card, isSelected && styles.activeCard]}
                  onPress={() => onSelectLayout(layout)}
                >
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
                  <Text style={styles.slotCountText}>{layout.slotsCount} ô</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#1F2021',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  doneBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterPillsScroll: {
    gap: 8,
    paddingBottom: 14,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#25252D',
  },
  activePill: {
    backgroundColor: '#3B82F6',
  },
  pillText: {
    color: '#A1A1AA',
    fontSize: 12,
    fontWeight: '600',
  },
  activePillText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollList: {
    gap: 12,
    paddingVertical: 4,
  },
  card: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 14,
    backgroundColor: '#25252D',
    borderWidth: 1.5,
    borderColor: '#2D2D36',
    width: 76,
  },
  activeCard: {
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
  },
  miniGridFrame: {
    width: 54,
    height: 54,
    backgroundColor: '#16161B',
    borderRadius: 6,
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
    color: '#A1A1AA',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  activeCardName: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  slotCountText: {
    color: '#71717A',
    fontSize: 9,
    marginTop: 2,
  },
});
