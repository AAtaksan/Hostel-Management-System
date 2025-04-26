import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  FlatList, 
  TouchableOpacity,
  RefreshControl,
  Modal,
  Platform
} from 'react-native';
import { ArrowLeft, TriangleAlert as AlertTriangle, Bell, Info } from 'lucide-react-native';
import { useData } from '@/context/DataContext';
import Colors from '@/constants/Colors';
import NoticeItem from '@/components/dashboard/NoticeItem';
import { Notice } from '@/types';

export default function NoticesScreen() {
  const { notices, isLoading } = useData();
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  const refreshData = useCallback(async () => {
    // The actual refresh happens in the DataContext
    // We just need to show the loading state here
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);
  
  const handleNoticePress = (notice: Notice) => {
    setSelectedNotice(notice);
    setModalVisible(true);
  };
  
  const closeModal = () => {
    setModalVisible(false);
    setSelectedNotice(null);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return Colors.error[500];
      case 'medium':
        return Colors.warning[500];
      case 'low':
        return Colors.primary[500];
      default:
        return Colors.gray[500];
    }
  };
  
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle size={24} color={getPriorityColor(priority)} />;
      case 'medium':
        return <Bell size={24} color={getPriorityColor(priority)} />;
      case 'low':
        return <Info size={24} color={getPriorityColor(priority)} />;
      default:
        return <Info size={24} color={getPriorityColor(priority)} />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notices & Announcements</Text>
      </View>
      
      <FlatList
        data={notices}
        renderItem={({ item }) => (
          <NoticeItem 
            notice={item} 
            onPress={() => handleNoticePress(item)}
          />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || isLoading}
            onRefresh={refreshData}
            colors={[Colors.primary[600]]}
            tintColor={Colors.primary[600]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No notices available</Text>
          </View>
        }
      />
      
      {/* Notice Detail Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <ArrowLeft size={24} color={Colors.gray[700]} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Notice Details</Text>
            </View>
            
            {selectedNotice && (
              <View style={styles.noticeDetail}>
                <View style={styles.noticeDetailHeader}>
                  <View style={styles.priorityIconContainer}>
                    {getPriorityIcon(selectedNotice.priority)}
                  </View>
                  
                  <View style={styles.noticeHeaderInfo}>
                    <Text style={styles.noticeTitle}>{selectedNotice.title}</Text>
                    <Text style={styles.noticeDate}>
                      Posted on {formatDate(selectedNotice.date)}
                    </Text>
                  </View>
                  
                  <View 
                    style={[
                      styles.priorityBadge, 
                      { backgroundColor: getPriorityColor(selectedNotice.priority) + '20' }
                    ]}
                  >
                    <Text 
                      style={[
                        styles.priorityText, 
                        { color: getPriorityColor(selectedNotice.priority) }
                      ]}
                    >
                      {selectedNotice.priority.toUpperCase()}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.noticeContentContainer}>
                  <Text style={styles.noticeContent}>{selectedNotice.content}</Text>
                </View>
                
                <View style={styles.noticeFooter}>
                  <Text style={styles.noticeAuthor}>
                    Posted by: {selectedNotice.author}
                  </Text>
                  
                  {selectedNotice.tags && selectedNotice.tags.length > 0 && (
                    <View style={styles.tagsContainer}>
                      <Text style={styles.tagsLabel}>Tags:</Text>
                      <View style={styles.tagsList}>
                        {selectedNotice.tags.map((tag, index) => (
                          <View key={index} style={styles.tag}>
                            <Text style={styles.tagText}>{tag}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  header: {
    backgroundColor: Colors.white,
    paddingTop: Platform.OS === 'ios' ? 0 : 40,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.gray[900],
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.gray[500],
    textAlign: 'center',
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    height: '80%',
    ...Platform.select({
      web: {
        maxWidth: 600,
        alignSelf: 'center',
        width: '100%',
        borderRadius: 12,
        maxHeight: 600,
        marginBottom: 40,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  closeButton: {
    marginRight: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.gray[800],
  },
  noticeDetail: {
    flex: 1,
  },
  noticeDetailHeader: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  priorityIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  noticeHeaderInfo: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.gray[900],
    marginBottom: 4,
  },
  noticeDate: {
    fontSize: 14,
    color: Colors.gray[500],
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
  },
  noticeContentContainer: {
    padding: 16,
    flex: 1,
  },
  noticeContent: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.gray[800],
  },
  noticeFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  noticeAuthor: {
    fontSize: 14,
    color: Colors.gray[600],
    marginBottom: 8,
  },
  tagsContainer: {
    marginTop: 8,
  },
  tagsLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.gray[700],
    marginBottom: 4,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: Colors.gray[100],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: Colors.gray[600],
  },
});