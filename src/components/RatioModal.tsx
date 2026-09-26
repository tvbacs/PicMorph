import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ASPECT_RATIOS } from '../constants/themes';
import { AspectRatioType } from '../types';

interface RatioModalProps {
  visible: boolean;
  currentRatioId: AspectRatioType;
  onClose: () => void;
  onSelectRatio: (ratioId: AspectRatioType) => void;
}

export const RatioModal: React.FC<RatioModalProps> = ({
  visible,
  currentRatioId,
  onClose,
  onSelectRatio,
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
            <View style={styles.headerLeft}>
              <Ionicons name="expand-outline" size={18} color="#60A5FA" />
              <Text style={styles.title}>Tỷ lệ khung hình</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.doneBtn}>
              <Ionicons name="checkmark" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Ratios Horizontal Scroll */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollList}
          >
            {ASPECT_RATIOS.map((item) => {
              const isSelected = item.id === currentRatioId;

              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.8}
                  style={styles.itemWrapper}
                  onPress={() => onSelectRatio(item.id)}
                >
                  <View style={[styles.iconBox, isSelected && styles.activeIconBox]}>
                    {item.iconType === 'tiktok' && (
                      <Ionicons
                        name="logo-tiktok"
                        size={22}
                        color={isSelected ? '#3B82F6' : '#A1A1AA'}
                      />
                    )}
                    {item.iconType === 'instagram' && (
                      <Ionicons
                        name="logo-instagram"
                        size={22}
                        color={isSelected ? '#3B82F6' : '#A1A1AA'}
                      />
                    )}
                    {item.iconType === 'youtube' && (
                      <Ionicons
                        name="logo-youtube"
                        size={22}
                        color={isSelected ? '#3B82F6' : '#A1A1AA'}
                      />
                    )}
                    {item.iconType === 'frame' && (
                      <View
                        style={[
                          styles.ratioFrame,
                          {
                            width: item.frameWidth || 22,
                            height: item.frameHeight || 22,
                            borderColor: isSelected ? '#3B82F6' : '#A1A1AA',
                          },
                        ]}
                      />
                    )}
                    {isSelected && <View style={styles.activeDot} />}
                  </View>
                  <Text
                    style={[styles.ratioLabel, isSelected && styles.activeRatioLabel]}
                    numberOfLines={1}
                  >
                    {item.label}
                  </Text>
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
    marginBottom: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
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
  scrollList: {
    gap: 12,
    paddingVertical: 4,
  },
  itemWrapper: {
    alignItems: 'center',
    width: 64,
  },
  iconBox: {
    width: 60,
    height: 54,
    borderRadius: 14,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#383842',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeIconBox: {
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
  },
  activeDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3B82F6',
  },
  ratioFrame: {
    borderWidth: 1.5,
    borderRadius: 3,
  },
  ratioLabel: {
    marginTop: 8,
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  activeRatioLabel: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
