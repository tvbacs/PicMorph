import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SAMPLE_PRESETS, SamplePreset } from '../constants/samples';

interface SamplePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectPreset: (preset: SamplePreset) => void;
}

export const SamplePickerModal: React.FC<SamplePickerModalProps> = ({
  visible,
  onClose,
  onSelectPreset,
}) => {
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
            <View style={styles.titleWrap}>
              <Text style={styles.title}>Nạp ảnh mẫu nhanh</Text>
              <Text style={styles.subtitle}>Test tức thì không cần chuẩn bị ảnh</Text>
            </View>
            <View style={{ width: 32 }} />
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {SAMPLE_PRESETS.map((preset) => (
              <TouchableOpacity
                key={preset.id}
                activeOpacity={0.85}
                style={styles.presetCard}
                onPress={() => {
                  onSelectPreset(preset);
                  onClose();
                }}
              >
                <View style={styles.presetInfo}>
                  <View style={styles.nameRow}>
                    <Ionicons name="sparkles" size={16} color="#FBBF24" />
                    <Text style={styles.presetTitle}>{preset.title}</Text>
                  </View>
                  <Text style={styles.presetTag}>Chữ ở giữa: &quot;{preset.overlayText}&quot;</Text>
                </View>

                {/* 4 Mini Thumbnails */}
                <View style={styles.thumbnailsRow}>
                  {preset.images.map((imgUrl, i) => (
                    <Image
                      key={`${preset.id}-thumb-${i}`}
                      source={{ uri: imgUrl }}
                      style={styles.thumbImage}
                      resizeMode="cover"
                    />
                  ))}
                </View>

                <View style={styles.applyBtn}>
                  <Text style={styles.applyBtnText}>Dùng bộ ảnh này</Text>
                  <Ionicons name="arrow-forward" size={14} color="#3B82F6" />
                </View>
              </TouchableOpacity>
            ))}
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
    backgroundColor: '#18181B',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
  },
  iconButton: {
    padding: 6,
  },
  titleWrap: {
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    color: '#A1A1AA',
    fontSize: 11,
    marginTop: 2,
  },
  scrollContent: {
    marginTop: 14,
  },
  presetCard: {
    backgroundColor: '#27272A',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  presetInfo: {
    marginBottom: 10,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  presetTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  presetTag: {
    color: '#60A5FA',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 3,
  },
  thumbnailsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  thumbImage: {
    flex: 1,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#09090B',
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  applyBtnText: {
    color: '#60A5FA',
    fontSize: 12,
    fontWeight: '700',
  },
});
