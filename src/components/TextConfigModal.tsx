import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TextOverlayConfig } from '../types';
import { FONT_OPTIONS, COLOR_CATEGORIES, COLOR_PALETTE } from '../constants/themes';

interface TextConfigModalProps {
  visible: boolean;
  config: TextOverlayConfig;
  onClose: () => void;
  onSave: (newConfig: TextOverlayConfig) => void;
}

export const TextConfigModal: React.FC<TextConfigModalProps> = ({
  visible,
  config,
  onClose,
  onSave,
}) => {
  const [enabled, setEnabled] = useState(config.enabled);
  const [text, setText] = useState(config.text);
  const [subtitle, setSubtitle] = useState(config.subtitle || '');
  const [fontSize, setFontSize] = useState(config.fontSize);
  const [color, setColor] = useState(config.color);
  const [letterSpacing, setLetterSpacing] = useState(config.letterSpacing);
  const [hasBackground, setHasBackground] = useState(config.hasBackground);
  const [hasShadow, setHasShadow] = useState(config.hasShadow);
  const [positionX, setPositionX] = useState(config.positionX ?? 0);
  const [positionY, setPositionY] = useState(config.positionY ?? 0);
  const [selectedFontId, setSelectedFontId] = useState(config.fontId || 'heavy-sans');
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
    if (/^#[0-9A-Fa-f]{3,8}$/.test(hex)) {
      setColor(hex);
      setCustomHex('');
    }
  };

  useEffect(() => {
    setEnabled(config.enabled);
    setText(config.text);
    setSubtitle(config.subtitle || '');
    setFontSize(config.fontSize);
    setColor(config.color);
    setLetterSpacing(config.letterSpacing);
    setHasBackground(config.hasBackground);
    setHasShadow(config.hasShadow);
    setPositionX(config.positionX ?? 0);
    setPositionY(config.positionY ?? 0);
    setSelectedFontId(config.fontId || 'heavy-sans');
  }, [config, visible]);

  const handleApply = () => {
    const activeFont = FONT_OPTIONS.find((f) => f.id === selectedFontId) || FONT_OPTIONS[0];

    onSave({
      ...config,
      enabled,
      text,
      subtitle,
      fontSize,
      color,
      letterSpacing,
      hasBackground,
      hasShadow,
      positionX,
      positionY,
      fontId: activeFont.id,
      fontFamily: activeFont.fontFamily,
      fontWeight: activeFont.fontWeight,
      fontStyle: activeFont.fontStyle,
    });
    onClose();
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
            <Text style={styles.title}>Chữ nghệ thuật</Text>
            <TouchableOpacity onPress={handleApply} style={styles.saveHeaderBtn}>
              <Text style={styles.saveHeaderText}>Áp dụng</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.bodyScroll} showsVerticalScrollIndicator={false}>
            {/* Toggle Enable */}
            <View style={styles.toggleRow}>
              <View style={styles.toggleLeft}>
                <Ionicons name="text-outline" size={20} color="#60A5FA" />
                <Text style={styles.toggleLabel}>Hiển thị chữ trên layout</Text>
              </View>
              <Switch
                value={enabled}
                onValueChange={setEnabled}
                trackColor={{ false: '#3F3F46', true: '#3B82F6' }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Main Text Input (no suggestions) */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Nội dung chữ chính</Text>
              <TextInput
                style={styles.input}
                value={text}
                onChangeText={setText}
                placeholder="Nhập nội dung chữ..."
                placeholderTextColor="#71717A"
                autoCapitalize="characters"
              />
            </View>

            {/* Font Family Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Kiểu Font chữ</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.fontListScroll}
              >
                {FONT_OPTIONS.map((f) => {
                  const isSelected = f.id === selectedFontId;
                  return (
                    <TouchableOpacity
                      key={f.id}
                      style={[styles.fontCard, isSelected && styles.activeFontCard]}
                      onPress={() => setSelectedFontId(f.id)}
                    >
                      <Text
                        style={[
                          styles.fontPreviewText,
                          {
                            fontFamily: f.fontFamily,
                            fontWeight: f.fontWeight,
                            fontStyle: f.fontStyle,
                          },
                          isSelected && styles.activeFontPreviewText,
                        ]}
                        numberOfLines={1}
                      >
                        {text || f.samplePreview}
                      </Text>
                      <Text
                        style={[
                          styles.fontCardName,
                          isSelected && styles.activeFontCardName,
                        ]}
                      >
                        {f.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Subtitle Input */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Dòng phụ Subtitle</Text>
              <TextInput
                style={styles.input}
                value={subtitle}
                onChangeText={setSubtitle}
                placeholder="Nhập dòng phụ hoặc để trống..."
                placeholderTextColor="#71717A"
              />
            </View>

            {/* Free-form Drag Position Info & Reset */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionLabel}>Vị trí chữ</Text>
                <TouchableOpacity
                  style={styles.resetPosBtn}
                  onPress={() => {
                    setPositionX(0);
                    setPositionY(0);
                  }}
                >
                  <Ionicons name="refresh-outline" size={14} color="#60A5FA" />
                  <Text style={styles.resetPosText}>Đặt lại về giữa</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.dragTipRow}>
                <Ionicons name="hand-left-outline" size={16} color="#60A5FA" />
                <Text style={styles.dragTipText}>
                  Chạm và kéo trực tiếp chữ trên khung ảnh để di chuyển tự do đến bất kỳ vị trí nào bạn muốn
                </Text>
              </View>
            </View>

            {/* Font Size */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionLabel}>Kích thước chữ</Text>
                <Text style={styles.sectionValue}>{fontSize}px</Text>
              </View>
              <View style={styles.buttonOptionsRow}>
                {[12, 16, 20, 26, 34, 42, 50].map((size) => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.sizeOption,
                      fontSize === size && styles.activeSizeOption,
                    ]}
                    onPress={() => setFontSize(size)}
                  >
                    <Text
                      style={[
                        styles.sizeText,
                        fontSize === size && styles.activeSizeText,
                      ]}
                    >
                      {size}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Letter Spacing */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionLabel}>Khoảng cách chữ</Text>
                <Text style={styles.sectionValue}>{letterSpacing}px</Text>
              </View>
              <View style={styles.buttonOptionsRow}>
                {[2, 4, 8, 12, 16].map((space) => (
                  <TouchableOpacity
                    key={space}
                    style={[
                      styles.sizeOption,
                      letterSpacing === space && styles.activeSizeOption,
                    ]}
                    onPress={() => setLetterSpacing(space)}
                  >
                    <Text
                      style={[
                        styles.sizeText,
                        letterSpacing === space && styles.activeSizeText,
                      ]}
                    >
                      +{space}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Color Palette with Category Filter & Custom HEX */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionLabel}>Màu sắc chữ</Text>
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

              {/* Color Grid */}
              <View style={styles.colorGrid}>
                {displayColors.map((c) => {
                  const isSelected = color.toLowerCase() === c.value.toLowerCase();
                  return (
                    <TouchableOpacity
                      key={`${c.value}-${c.label}`}
                      style={[
                        styles.colorCard,
                        isSelected && styles.activeColorCard,
                      ]}
                      onPress={() => setColor(c.value)}
                    >
                      <View style={[styles.colorCircle, { backgroundColor: c.value }]}>
                        {isSelected && (
                          <Ionicons
                            name="checkmark"
                            size={14}
                            color={
                              c.value === '#FFFFFF' ||
                              c.value === '#FAF7F2' ||
                              c.value === '#F5F5DC' ||
                              c.value === '#FEF08A'
                                ? '#000000'
                                : '#FFFFFF'
                            }
                          />
                        )}
                      </View>
                      <Text style={styles.colorName} numberOfLines={1}>
                        {c.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Custom Hex Row */}
              <View style={styles.customHexRow}>
                <View
                  style={[
                    styles.currentPreviewBox,
                    { backgroundColor: color },
                    color.toLowerCase() === '#ffffff' && {
                      borderWidth: 1,
                      borderColor: '#71717A',
                    },
                  ]}
                />
                <TextInput
                  style={styles.hexInput}
                  value={customHex}
                  onChangeText={setCustomHex}
                  placeholder="Nhập mã hex VD: #FFE4E1, #FF6B6B..."
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

            {/* Effect Toggles */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Hiệu ứng phụ</Text>
              <View style={styles.effectRow}>
                <TouchableOpacity
                  style={[
                    styles.effectCard,
                    hasBackground && styles.activeEffectCard,
                  ]}
                  onPress={() => setHasBackground((b) => !b)}
                >
                  <Ionicons
                    name="albums-outline"
                    size={20}
                    color={hasBackground ? '#FFFFFF' : '#71717A'}
                  />
                  <Text
                    style={[
                      styles.effectText,
                      hasBackground && styles.activeEffectText,
                    ]}
                  >
                    Khung mờ phía sau
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.effectCard,
                    hasShadow && styles.activeEffectCard,
                  ]}
                  onPress={() => setHasShadow((s) => !s)}
                >
                  <Ionicons
                    name="sparkles-outline"
                    size={20}
                    color={hasShadow ? '#FFFFFF' : '#71717A'}
                  />
                  <Text
                    style={[
                      styles.effectText,
                      hasShadow && styles.activeEffectText,
                    ]}
                  >
                    Đổ bóng nổi bật
                  </Text>
                </TouchableOpacity>
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
  bodyScroll: {
    marginTop: 14,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#25252D',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  toggleLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#25252D',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionLabel: {
    color: '#F4F4F5',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionValue: {
    color: '#60A5FA',
    fontSize: 13,
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#202026',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: '#2D2D36',
  },
  fontListScroll: {
    paddingVertical: 4,
    gap: 8,
  },
  fontCard: {
    width: 130,
    backgroundColor: '#202026',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2D2D36',
  },
  activeFontCard: {
    borderColor: '#D4D4D8',
    borderWidth: 1,
    backgroundColor: '#262630',
  },
  fontPreviewText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 6,
    textAlign: 'center',
  },
  activeFontPreviewText: {
    color: '#FFFFFF',
  },
  fontCardName: {
    color: '#A1A1AA',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  activeFontCardName: {
    color: '#E4E4E7',
    fontWeight: '700',
  },
  resetPosBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#202026',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2D2D36',
  },
  resetPosText: {
    color: '#E4E4E7',
    fontSize: 11,
    fontWeight: '700',
  },
  dragTipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#202026',
    padding: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  dragTipText: {
    flex: 1,
    color: '#A1A1AA',
    fontSize: 11,
    lineHeight: 16,
  },
  buttonOptionsRow: {
    flexDirection: 'row',
    gap: 5,
  },
  sizeOption: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#202026',
    borderWidth: 1,
    borderColor: '#2D2D36',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeSizeOption: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
    borderWidth: 1,
  },
  sizeText: {
    color: '#A1A1AA',
    fontSize: 11,
    fontWeight: '700',
  },
  activeSizeText: {
    color: '#16161B',
    fontWeight: '700',
  },
  categoryPillsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  categoryPill: {
    backgroundColor: '#202026',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2D2D36',
  },
  activeCategoryPill: {
    borderColor: '#D4D4D8',
    borderWidth: 1,
    backgroundColor: '#262630',
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
    backgroundColor: '#202026',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2D2D36',
  },
  activeColorCard: {
    borderColor: '#D4D4D8',
    borderWidth: 1,
    backgroundColor: '#262630',
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
    textAlign: 'center',
  },
  customHexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  currentPreviewBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
  },
  hexInput: {
    flex: 1,
    height: 38,
    backgroundColor: '#202026',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2D2D36',
    paddingHorizontal: 10,
    color: '#FFFFFF',
    fontSize: 12,
  },
  applyHexBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyHexText: {
    color: '#16161B',
    fontSize: 12,
    fontWeight: '700',
  },
  effectRow: {
    flexDirection: 'row',
    gap: 10,
  },
  effectCard: {
    flex: 1,
    backgroundColor: '#202026',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2D2D36',
    gap: 6,
  },
  activeEffectCard: {
    borderColor: '#D4D4D8',
    borderWidth: 1,
    backgroundColor: '#262630',
  },
  effectText: {
    color: '#A1A1AA',
    fontSize: 12,
    fontWeight: '600',
  },
  activeEffectText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
