import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CanvasStyleConfig } from '../types';
import { COLOR_CATEGORIES, COLOR_PALETTE } from '../constants/themes';

interface StyleModalProps {
  visible: boolean;
  styleConfig: CanvasStyleConfig;
  onClose: () => void;
  onChangeStyle: (newStyle: CanvasStyleConfig) => void;
}

export const StyleModal: React.FC<StyleModalProps> = ({
  visible,
  styleConfig,
  onClose,
  onChangeStyle,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customHex, setCustomHex] = useState<string>('');

  const displayColors =
    selectedCategory === 'all'
      ? COLOR_PALETTE
      : (COLOR_CATEGORIES.find((c) => c.id === selectedCategory)?.colors || COLOR_PALETTE);

  const handleApplyCustomHex = () => {
    let hex = customHex.trim();
    if (!hex) return;
    if (!hex.startsWith('#')) {
      hex = `#${hex}`;
    }
    // Simple 6-char or 3-char hex check
    if (/^#[0-9A-Fa-f]{3,8}$/.test(hex)) {
      onChangeStyle({ ...styleConfig, bgColor: hex });
      setCustomHex('');
    }
  };

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
            <Text style={styles.title}>Viền & Màu nền khung</Text>
            <TouchableOpacity onPress={onClose} style={styles.saveHeaderBtn}>
              <Text style={styles.saveHeaderText}>Xong</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Gap / Spacing */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="grid-outline" size={18} color="#60A5FA" />
                <Text style={styles.sectionTitle}>Khoảng cách giữa các ảnh</Text>
                <Text style={styles.sectionValue}>{styleConfig.gap}px</Text>
              </View>
              <View style={styles.optionsRow}>
                {[0, 2, 4, 8, 12, 16].map((gapVal) => (
                  <TouchableOpacity
                    key={gapVal}
                    style={[
                      styles.optionChip,
                      gapVal === 0 && styles.firstOptionChip,
                      styleConfig.gap === gapVal && styles.activeChip,
                    ]}
                    onPress={() => onChangeStyle({ ...styleConfig, gap: gapVal })}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        styleConfig.gap === gapVal && styles.activeChipText,
                      ]}
                      numberOfLines={1}
                    >
                      {gapVal === 0 ? 'Khít 0px' : `${gapVal}px`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Custom Hex Color Input */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="color-filter-outline" size={18} color="#EC4899" />
                <Text style={styles.sectionTitle}>Mã màu tự chọn HEX</Text>
              </View>
              <View style={styles.customHexRow}>
                <View
                  style={[
                    styles.currentPreviewBox,
                    { backgroundColor: styleConfig.bgColor },
                    styleConfig.bgColor.toLowerCase() === '#ffffff' && {
                      borderWidth: 1,
                      borderColor: '#71717A',
                    },
                  ]}
                />
                <TextInput
                  style={styles.hexInput}
                  value={customHex}
                  onChangeText={setCustomHex}
                  placeholder="Nhập mã hex VD: #1E293B, #FFE4E1..."
                  placeholderTextColor="#71717A"
                  autoCapitalize="characters"
                />
                <TouchableOpacity
                  style={styles.applyHexBtn}
                  onPress={handleApplyCustomHex}
                >
                  <Text style={styles.applyHexText}>Áp dụng</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Diverse Background Colors with Category Filter */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="color-palette-outline" size={18} color="#FBBF24" />
                <Text style={styles.sectionTitle}>Bảng màu đa dạng</Text>
                <Text style={styles.sectionValue}>{displayColors.length} màu</Text>
              </View>

              {/* Category Pills */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryPillsRow}
              >
                <TouchableOpacity
                  style={[
                    styles.categoryPill,
                    selectedCategory === 'all' && styles.activeCategoryPill,
                  ]}
                  onPress={() => setSelectedCategory('all')}
                >
                  <Text
                    style={[
                      styles.categoryPillText,
                      selectedCategory === 'all' && styles.activeCategoryPillText,
                    ]}
                  >
                    Tất cả
                  </Text>
                </TouchableOpacity>
                {COLOR_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryPill,
                      selectedCategory === cat.id && styles.activeCategoryPill,
                    ]}
                    onPress={() => setSelectedCategory(cat.id)}
                  >
                    <Text
                      style={[
                        styles.categoryPillText,
                        selectedCategory === cat.id && styles.activeCategoryPillText,
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Colors Grid */}
              <View style={styles.colorGrid}>
                {displayColors.map((item) => {
                  const isSelected =
                    styleConfig.bgColor.toLowerCase() === item.value.toLowerCase();
                  return (
                    <TouchableOpacity
                      key={`${item.value}-${item.label}`}
                      style={[
                        styles.colorCard,
                        isSelected && styles.activeColorCard,
                      ]}
                      onPress={() => onChangeStyle({ ...styleConfig, bgColor: item.value })}
                    >
                      <View
                        style={[
                          styles.colorCircle,
                          { backgroundColor: item.value },
                          (item.value.toLowerCase() === '#ffffff' ||
                            item.value.toLowerCase() === '#faf7f2' ||
                            item.value.toLowerCase() === '#f5f5dc') && {
                            borderWidth: 1,
                            borderColor: '#52525B',
                          },
                        ]}
                      >
                        {isSelected && (
                          <Ionicons
                            name="checkmark"
                            size={16}
                            color={
                              item.value.toLowerCase() === '#ffffff' ||
                              item.value.toLowerCase() === '#faf7f2' ||
                              item.value.toLowerCase() === '#f5f5dc' ||
                              item.value.toLowerCase() === '#fef08a' ||
                              item.value.toLowerCase() === '#d9f99d'
                                ? '#000000'
                                : '#FFFFFF'
                            }
                          />
                        )}
                      </View>
                      <Text
                        style={[
                          styles.colorName,
                          isSelected && styles.activeColorName,
                        ]}
                        numberOfLines={1}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
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
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
  },
  iconButton: {
    padding: 6,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
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
  scrollContent: {
    marginTop: 14,
  },
  section: {
    backgroundColor: '#25252D',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#F4F4F5',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
    flex: 1,
  },
  sectionValue: {
    color: '#60A5FA',
    fontSize: 13,
    fontWeight: '700',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  optionChip: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#3F3F46',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  firstOptionChip: {
    flex: 1.35,
  },
  activeChip: {
    backgroundColor: '#3B82F6',
  },
  chipText: {
    color: '#D4D4D8',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  activeChipText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  customHexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currentPreviewBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  hexInput: {
    flex: 1,
    backgroundColor: '#1E1E24',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  applyHexBtn: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
  },
  applyHexText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  categoryPillsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  categoryPill: {
    backgroundColor: '#1E1E24',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  activeCategoryPill: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  categoryPillText: {
    color: '#A1A1AA',
    fontSize: 11,
    fontWeight: '600',
  },
  activeCategoryPillText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorCard: {
    width: '23%',
    alignItems: 'center',
    backgroundColor: '#3F3F46',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  activeColorCard: {
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
  },
  colorCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  colorName: {
    color: '#D4D4D8',
    fontSize: 9,
    fontWeight: '600',
    textAlign: 'center',
  },
  activeColorName: {
    color: '#60A5FA',
    fontWeight: '700',
  },
});
