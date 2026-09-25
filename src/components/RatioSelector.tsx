import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ASPECT_RATIOS } from '../constants/themes';
import { AspectRatioType } from '../types';

interface RatioSelectorProps {
  currentRatioId: AspectRatioType;
  onSelectRatio: (ratioId: AspectRatioType) => void;
}

export const RatioSelector: React.FC<RatioSelectorProps> = ({
  currentRatioId,
  onSelectRatio,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Ionicons name="expand-outline" size={15} color="#60A5FA" />
          <Text style={styles.title}>Tỷ lệ khung hình</Text>
        </View>
        <Text style={styles.currentTag}>{currentRatioId}</Text>
      </View>

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
                    size={20}
                    color={isSelected ? '#FFFFFF' : '#A1A1AA'}
                  />
                )}
                {item.iconType === 'instagram' && (
                  <Ionicons
                    name="logo-instagram"
                    size={20}
                    color={isSelected ? '#FFFFFF' : '#A1A1AA'}
                  />
                )}
                {item.iconType === 'youtube' && (
                  <Ionicons
                    name="logo-youtube"
                    size={20}
                    color={isSelected ? '#FFFFFF' : '#A1A1AA'}
                  />
                )}
                {item.iconType === 'frame' && (
                  <View
                    style={[
                      styles.ratioFrame,
                      {
                        width: item.frameWidth || 20,
                        height: item.frameHeight || 20,
                        borderColor: isSelected ? '#FFFFFF' : '#A1A1AA',
                      },
                    ]}
                  />
                )}
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
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 6,
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    color: '#F4F4F5',
    fontSize: 13,
    fontWeight: '700',
  },
  currentTag: {
    color: '#60A5FA',
    fontSize: 11,
    fontWeight: '700',
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  scrollList: {
    paddingHorizontal: 14,
    gap: 10,
  },
  itemWrapper: {
    alignItems: 'center',
    width: 58,
  },
  iconBox: {
    width: 54,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#202026',
    borderWidth: 1.5,
    borderColor: '#2D2D36',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconBox: {
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.18)',
  },
  ratioFrame: {
    borderWidth: 1.5,
    borderRadius: 3,
  },
  ratioLabel: {
    marginTop: 6,
    color: '#71717A',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  activeRatioLabel: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
