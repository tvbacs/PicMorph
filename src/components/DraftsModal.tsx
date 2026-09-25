import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DraftItem } from '../types';
import { draftService } from '../services/draftService';

interface DraftsModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectDraft: (draft: DraftItem) => void;
  onSaveCurrentAsDraft: () => Promise<void>;
  isSavingCurrent?: boolean;
  hasContent?: boolean;
}

export const DraftsModal: React.FC<DraftsModalProps> = ({
  visible,
  onClose,
  onSelectDraft,
  onSaveCurrentAsDraft,
  isSavingCurrent = false,
  hasContent = false,
}) => {
  const [drafts, setDrafts] = useState<DraftItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadDrafts = async () => {
    try {
      setIsLoading(true);
      const data = await draftService.getDrafts();
      setDrafts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      loadDrafts();
    }
  }, [visible]);

  const handleDeleteDraft = (id: string, title: string) => {
    Alert.alert(
      'Xóa bản nháp',
      `Bạn có chắc muốn xóa bản nháp "${title}" không?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            await draftService.deleteDraft(id);
            loadDrafts();
          },
        },
      ]
    );
  };

  const handleSaveAndRefresh = async () => {
    await onSaveCurrentAsDraft();
    await loadDrafts();
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const hour = String(d.getHours()).padStart(2, '0');
    const minute = String(d.getMinutes()).padStart(2, '0');
    return `${hour}:${minute} • ${day}/${month}/${d.getFullYear()}`;
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
            <View style={styles.headerTitleWrap}>
              <Text style={styles.title}>Bản nháp đã lưu</Text>
              <Text style={styles.subtitle}>{drafts.length} bản nháp trong máy</Text>
            </View>
            <TouchableOpacity
              onPress={handleSaveAndRefresh}
              style={[
                styles.saveHeaderBtn,
                (!hasContent || isSavingCurrent) && styles.disabledSaveBtn,
              ]}
              disabled={!hasContent || isSavingCurrent}
              activeOpacity={0.7}
            >
              {isSavingCurrent ? (
                <ActivityIndicator size="small" color="#16161B" />
              ) : (
                <Ionicons
                  name="bookmark-outline"
                  size={18}
                  color={hasContent ? '#16161B' : '#71717A'}
                />
              )}
            </TouchableOpacity>
          </View>

          {/* Body Content */}
          {isLoading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color="#FFFFFF" />
            </View>
          ) : drafts.length === 0 ? (
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="folder-open-outline" size={36} color="#71717A" />
              </View>
              <Text style={styles.emptyTitle}>Chưa có bản nháp nào</Text>
              <Text style={styles.emptySub}>
                Nhấn nút bookmark ở góc trên để lưu lại bố cục, ảnh và nội dung chữ bạn đang làm dở.
              </Text>
              <TouchableOpacity
                style={[
                  styles.emptyActionBtn,
                  (!hasContent || isSavingCurrent) && styles.disabledEmptyActionBtn,
                ]}
                onPress={handleSaveAndRefresh}
                disabled={!hasContent || isSavingCurrent}
              >
                <Ionicons
                  name="bookmark-outline"
                  size={16}
                  color={hasContent ? '#FFFFFF' : '#71717A'}
                />
                <Text
                  style={[
                    styles.emptyActionText,
                    !hasContent && { color: '#71717A' },
                  ]}
                >
                  Lưu thiết kế hiện tại
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView
              style={styles.draftListScroll}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={styles.draftListContent}
            >
              {drafts.map((item) => {
                const filledSlots = item.slots.filter((s) => !!s.uri).length;
                const previewUri =
                  item.thumbnailUri || item.slots.find((s) => !!s.uri)?.uri;

                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.85}
                    style={styles.draftCard}
                    onPress={() => {
                      onSelectDraft(item);
                      onClose();
                    }}
                  >
                    {/* Thumbnail preview */}
                    <View style={styles.thumbWrap}>
                      {previewUri ? (
                        <Image
                          source={{ uri: previewUri }}
                          style={styles.thumbImg}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.thumbPlaceholder}>
                          <Ionicons name="images-outline" size={24} color="#71717A" />
                        </View>
                      )}
                    </View>

                    {/* Metadata */}
                    <View style={styles.draftInfo}>
                      <Text style={styles.draftTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <View style={styles.tagsRow}>
                        <View style={styles.tagBadge}>
                          <Text style={styles.tagText}>{item.ratioId}</Text>
                        </View>
                        <View style={styles.tagBadge}>
                          <Text style={styles.tagText}>{filledSlots} ảnh</Text>
                        </View>
                        {item.textConfig.enabled && item.textConfig.text ? (
                          <View style={[styles.tagBadge, styles.textTagBadge]}>
                            <Text style={styles.textTagText} numberOfLines={1}>
                              {item.textConfig.text}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                      <Text style={styles.draftDate}>{formatDate(item.updatedAt)}</Text>
                    </View>

                    {/* Actions */}
                    <View style={styles.cardActions}>
                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => handleDeleteDraft(item.id, item.title)}
                      >
                        <Ionicons name="trash-outline" size={18} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
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
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 24,
    height: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D36',
  },
  iconButton: {
    padding: 6,
  },
  headerTitleWrap: {
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
    marginTop: 1,
  },
  saveHeaderBtn: {
    backgroundColor: '#FFFFFF',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledSaveBtn: {
    backgroundColor: '#272730',
    opacity: 0.45,
  },
  disabledEmptyActionBtn: {
    opacity: 0.45,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#25252D',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#32323D',
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySub: {
    color: '#71717A',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#25252D',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  emptyActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  draftListScroll: {
    flex: 1,
    marginTop: 12,
  },
  draftListContent: {
    gap: 10,
    paddingBottom: 30,
  },
  draftCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#202026',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#2D2D36',
    gap: 12,
  },
  thumbWrap: {
    width: 68,
    height: 68,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#16161B',
    borderWidth: 1,
    borderColor: '#2D2D36',
  },
  thumbImg: {
    width: '100%',
    height: '100%',
  },
  thumbPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#18181D',
  },
  draftInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  draftTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  tagBadge: {
    backgroundColor: '#2A2A33',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: '#383844',
  },
  tagText: {
    color: '#D4D4D8',
    fontSize: 10,
    fontWeight: '600',
  },
  textTagBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderColor: '#3B82F6',
    maxWidth: 90,
  },
  textTagText: {
    color: '#60A5FA',
    fontSize: 10,
    fontWeight: '700',
  },
  draftDate: {
    color: '#71717A',
    fontSize: 10,
    fontWeight: '500',
  },
  cardActions: {
    paddingLeft: 4,
  },
  deleteBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
});
