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
import { TextItem } from '../types';
import { FONT_OPTIONS, COLOR_CATEGORIES, COLOR_PALETTE } from '../constants/themes';

interface TextConfigModalProps {
  visible: boolean;
  item?: TextItem | null;
  onClose: () => void;
  onSave: (item: TextItem) => void;
  onDelete?: (id: string) => void;
}

export const TextConfigModal: React.FC<TextConfigModalProps> = ({
  visible,
  item,
  onClose,
  onSave,
  onDelete,
}) => {
  const isEditing = !!item && !!item.id;

  const [text, setText] = useState('');
  const [fontSize, setFontSize] = useState(24);
  const [color, setColor] = useState('#FFFFFF');
  const [letterSpacing, setLetterSpacing] = useState(0.5);
  const [uppercase, setUppercase] = useState(false);
  const [hasBackground, setHasBackground] = useState(false);
  const [hasShadow, setHasShadow] = useState(true);
  const [selectedFontId, setSelectedFontId] = useState('heavy-sans');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customHex, setCustomHex] = useState<string>('');

  const displayColors =
    selectedCategory === 'all'
      ? COLOR_PALETTE
      : (COLOR_CATEGORIES.find((c) => c.id === selectedCategory)?.colors || COLOR_PALETTE);

  useEffect(() => {
    if (visible) {
      if (item) {
        setText(item.text || '');
        setFontSize(item.fontSize || 24);
        setColor(item.color || '#FFFFFF');
        setLetterSpacing(item.letterSpacing ?? 0.5);
        setUppercase(!!item.uppercase);
        setHasBackground(!!item.hasBackground);
        setHasShadow(item.hasShadow !== false);
        setSelectedFontId(item.fontId || 'heavy-sans');
      } else {
        setText('');
        setFontSize(24);
        setColor('#FFFFFF');
        setLetterSpacing(0.5);
        setUppercase(false);
        setHasBackground(false);
        setHasShadow(true);
        setSelectedFontId('heavy-sans');
      }
      setCustomHex('');
    }
  }, [item, visible]);

  const handleApplyCustomHex = () => {
    let hex = customHex.trim();
    if (!hex) return;
    if (!hex.startsWith('#')) hex = `#${hex}`;
    if (/^#[0-9A-Fa-f]{3,8}$/.test(hex)) {
      setColor(hex);
      setCustomHex('');
    }
  };

  const handleApply = () => {
    const trimmed = text.trim();
    if (!trimmed) {
      onClose();
      return;
    }
    const activeFont = FONT_OPTIONS.find((f) => f.id === selectedFontId) || FONT_OPTIONS[0];

    onSave({
      id: item?.id || `text-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      text: trimmed,
      fontSize,
      color,
      letterSpacing,
      uppercase,
      hasBackground,
      bgColor: 'rgba(0,0,0,0.7)',
      hasShadow,
      shadowColor: 'rgba(0,0,0,0.85)',
      fontId: activeFont.id,
      fontFamily: activeFont.fontFamily,
      fontWeight: activeFont.fontWeight,
      fontStyle: activeFont.fontStyle,
      x: item?.x ?? 0,
      y: item?.y ?? 0,
    });
    onClose();
  };

  const activeFont = FONT_OPTIONS.find((f) => f.id === selectedFontId) || FONT_OPTIONS[0];

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
            <Text style={styles.title}>
              {isEditing ? 'Chỉnh sửa chữ' : 'Thêm chữ nghệ thuật'}
            </Text>
            <TouchableOpacity onPress={handleApply} style={styles.saveHeaderBtn}>
              <Text style={styles.saveHeaderText}>Áp dụng</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.bodyScroll} showsVerticalScrollIndicator={false}>
            {/* Live Text Preview Box */}
            <View style={styles.previewBox}>
              <View
                style={[
                  styles.previewInner,
                  hasBackground && {
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 8,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.previewText,
                    {
                      fontSize,
                      color,
                      letterSpacing,
                      textTransform: uppercase ? 'uppercase' : 'none',
                      fontFamily: activeFont.fontFamily,
                      fontWeight: activeFont.fontWeight,
                      fontStyle: activeFont.fontStyle,
                    },
                    hasShadow && {
                      textShadowColor: 'rgba(0, 0, 0, 0.9)',
                      textShadowOffset: { width: 1.5, height: 1.5 },
                      textShadowRadius: 3,
                    },
                  ]}
                >
                  {text || 'Nhập câu chữ của bạn...'}
                </Text>
              </View>
            </View>

            {/* Multiline Text Input */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Nội dung câu chữ (hỗ trợ nhiều dòng)</Text>
              <TextInput
                style={styles.multilineInput}
                value={text}
                onChangeText={setText}
                placeholder="Nhập nội dung chữ, câu nói hoặc trích dẫn..."
                placeholderTextColor="#71717A"
                multiline
                numberOfLines={3}
                autoFocus={!isEditing}
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
                        {text.slice(0, 10) || f.samplePreview}
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

            {/* Font Size Adjuster */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionLabel}>Cỡ chữ</Text>
                <Text style={styles.sizeBadge}>{fontSize}px</Text>
              </View>
              <View style={styles.sizeButtonsRow}>
                {[14, 18, 22, 26, 32, 40].map((sz) => (
                  <TouchableOpacity
                    key={sz}
                    style={[styles.sizeBtn, fontSize === sz && styles.activeSizeBtn]}
                    onPress={() => setFontSize(sz)}
                  >
                    <Text style={[styles.sizeBtnText, fontSize === sz && styles.activeSizeBtnText]}>
                      {sz}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Color Palette */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Màu chữ</Text>
              {/* Category Pills */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryScroll}
              >
                <TouchableOpacity
                  style={[styles.catPill, selectedCategory === 'all' && styles.activeCatPill]}
                  onPress={() => setSelectedCategory('all')}
                >
                  <Text style={[styles.catPillText, selectedCategory === 'all' && styles.activeCatPillText]}>
                    Tất cả
                  </Text>
                </TouchableOpacity>
                {COLOR_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.catPill, selectedCategory === cat.id && styles.activeCatPill]}
                    onPress={() => setSelectedCategory(cat.id)}
                  >
                    <Text style={[styles.catPillText, selectedCategory === cat.id && styles.activeCatPillText]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Color Swatches */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.colorSwatchesScroll}
              >
                {displayColors.map((opt) => {
                  const isSelected = color.toLowerCase() === opt.value.toLowerCase();
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      style={[
                        styles.colorSwatch,
                        { backgroundColor: opt.value },
                        isSelected && styles.activeColorSwatch,
                      ]}
                      onPress={() => setColor(opt.value)}
                    />
                  );
                })}
              </ScrollView>

              {/* Custom Hex input */}
              <View style={styles.hexInputRow}>
                <TextInput
                  style={styles.hexInput}
                  value={customHex}
                  onChangeText={setCustomHex}
                  placeholder="Mã màu #HEX (vd: #FF5722)"
                  placeholderTextColor="#71717A"
                  autoCapitalize="characters"
                />
                <TouchableOpacity style={styles.hexApplyBtn} onPress={handleApplyCustomHex}>
                  <Text style={styles.hexApplyText}>Dùng</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Toggles: Shadow, Background, Uppercase */}
            <View style={styles.section}>
              <View style={styles.optionRow}>
                <Text style={styles.optionLabel}>Đổ bóng chữ nghệ thuật</Text>
                <Switch
                  value={hasShadow}
                  onValueChange={setHasShadow}
                  trackColor={{ false: '#3F3F46', true: '#3B82F6' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={styles.optionRow}>
                <Text style={styles.optionLabel}>Nền tối làm nổi bật chữ</Text>
                <Switch
                  value={hasBackground}
                  onValueChange={setHasBackground}
                  trackColor={{ false: '#3F3F46', true: '#3B82F6' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={styles.optionRow}>
                <Text style={styles.optionLabel}>IN HOA TOÀN BỘ</Text>
                <Switch
                  value={uppercase}
                  onValueChange={setUppercase}
                  trackColor={{ false: '#3F3F46', true: '#3B82F6' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            {/* Delete button if editing */}
            {isEditing && onDelete && (
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => {
                  onDelete(item!.id);
                  onClose();
                }}
              >
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
                <Text style={styles.deleteBtnText}>Xóa dòng chữ này</Text>
              </TouchableOpacity>
            )}
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
    backgroundColor: '#1F2021',
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
    paddingTop: 14,
  },
  previewBox: {
    minHeight: 80,
    backgroundColor: '#16161B',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2D2D36',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginBottom: 16,
  },
  previewInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewText: {
    textAlign: 'center',
  },
  section: {
    marginBottom: 18,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionLabel: {
    color: '#E4E4E7',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  sizeBadge: {
    color: '#60A5FA',
    fontSize: 12,
    fontWeight: '700',
  },
  multilineInput: {
    backgroundColor: '#25252D',
    color: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#3F3F46',
    minHeight: 70,
    textAlignVertical: 'top',
  },
  fontListScroll: {
    gap: 8,
  },
  fontCard: {
    backgroundColor: '#25252D',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#2D2D36',
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    minWidth: 86,
  },
  activeFontCard: {
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59,130,246,0.12)',
  },
  fontPreviewText: {
    color: '#E4E4E7',
    fontSize: 18,
    marginBottom: 4,
  },
  activeFontPreviewText: {
    color: '#60A5FA',
  },
  fontCardName: {
    color: '#71717A',
    fontSize: 10,
    fontWeight: '600',
  },
  activeFontCardName: {
    color: '#FFFFFF',
  },
  sizeButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sizeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#25252D',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2D2D36',
  },
  activeSizeBtn: {
    borderColor: '#3B82F6',
    backgroundColor: '#3B82F6',
  },
  sizeBtnText: {
    color: '#A1A1AA',
    fontSize: 12,
    fontWeight: '600',
  },
  activeSizeBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  categoryScroll: {
    gap: 6,
    marginBottom: 10,
  },
  catPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#25252D',
  },
  activeCatPill: {
    backgroundColor: '#3B82F6',
  },
  catPillText: {
    color: '#A1A1AA',
    fontSize: 11,
    fontWeight: '600',
  },
  activeCatPillText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  colorSwatchesScroll: {
    gap: 8,
    paddingVertical: 4,
    marginBottom: 10,
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeColorSwatch: {
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.15 }],
  },
  hexInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  hexInput: {
    flex: 1,
    backgroundColor: '#25252D',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#FFFFFF',
    fontSize: 12,
    borderWidth: 1,
    borderColor: '#2D2D36',
  },
  hexApplyBtn: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hexApplyText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  optionLabel: {
    color: '#F4F4F5',
    fontSize: 13,
    fontWeight: '600',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  deleteBtnText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '700',
  },
});
