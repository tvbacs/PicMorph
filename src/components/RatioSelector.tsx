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
              style={[styles.chip, isSelected && styles.activeChip]}
              onPress={() => onSelectRatio(item.id)}
            >
              <Ionicons
                name={(item.iconName as any) || 'phone-portrait-outline'}
                size={14}
                color={isSelected ? '#3B82F6' : '#A1A1AA'}
              />
              <Text style={[styles.ratioLabel, isSelected && styles.activeLabel]}>
                {item.label}
              </Text>
              <Text style={styles.ratioSub}>{item.sublabel.split('/')[0].trim()}</Text>
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
  scrollList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E24',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 18,
    gap: 5,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  activeChip: {
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
  },
  ratioLabel: {
    color: '#D4D4D8',
    fontSize: 12,
    fontWeight: '700',
  },
  activeLabel: {
    color: '#60A5FA',
  },
  ratioSub: {
    color: '#71717A',
    fontSize: 10,
    fontWeight: '500',
  },
});
