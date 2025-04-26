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
  Platform,
  Alert,
  TextInput
} from 'react-native';
import { Plus, ArrowLeft, Clock, CircleCheck as CheckCircle, Circle as XCircle, CircleAlert as AlertCircle, Wrench, Send } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import Colors from '@/constants/Colors';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { Select, FormGroup } from '@/components/common/FormElements';
import { ServiceRequest } from '@/types';

export default function RequestsScreen() {
  const { user, isAdmin } = useAuth();
  const { serviceRequests, addServiceRequest, updateServiceRequest, getStudentRoom, isLoading } = useData();
  
  const [refreshing, setRefreshing] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  
  // Form state for creating a new request
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('maintenance');
  const [priority, setPriority] = useState<string>('medium');
  
  // Update request status
  const [statusUpdateComment, setStatusUpdateComment] = useState('');
  
  // Filter requests based on user role
  const filteredRequests = isAdmin
    ? serviceRequests // Admin sees all requests
    : serviceRequests.filter(request => request.studentId === user?.id); // Students see only their requests
  
  const refreshData = useCallback(async () => {
    // The actual refresh happens in the DataContext
    // We just need to show the loading state here
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);
  
  const openCreateModal = () => {
    setCreateModalVisible(true);
  };
  
  const closeCreateModal = () => {
    setCreateModalVisible(false);
    // Reset form
    setTitle('');
    setDescription('');
    setCategory('maintenance');
    setPriority('medium');
  };
  
  const handleCreateRequest = async () => {
    // Validate form
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }
    
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }
    
    if (!user) return;
    
    // Get student's room
    const studentRoom = getStudentRoom(user.id);
    
    if (!studentRoom) {
      Alert.alert('Error', 'You need to be assigned to a room to create a service request');
      return;
    }
    
    // Create new request
    const newRequest: Omit<ServiceRequest, 'id' | 'date'> = {
      title,
      description,
      category: category as any,
      priority: priority as any,
      status: 'pending',
      studentId: user.id,
      roomId: studentRoom.id,
    };
    
    try {
      await addServiceRequest(newRequest);
      Alert.alert(
        'Success', 
        'Service request created successfully',
        [{ text: 'OK', onPress: closeCreateModal }]
      );
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create service request');
    }
  };
  
  const openDetailModal = (request: ServiceRequest) => {
    setSelectedRequest(request);
    setDetailModalVisible(true);
  };
  
  const closeDetailModal = () => {
    setDetailModalVisible(false);
    setSelectedRequest(null);
    setStatusUpdateComment('');
  };
  
  const handleStatusUpdate = async (newStatus: 'pending' | 'in-progress' | 'resolved' | 'rejected') => {
    if (!selectedRequest) return;
    
    const updatedRequest: Partial<ServiceRequest> = {
      status: newStatus,
    };
    
    // If a comment was provided, add it to the request
    if (statusUpdateComment.trim()) {
      updatedRequest.comments = [
        ...(selectedRequest.comments || []),
        {
          id: `c${Date.now()}`,
          userId: user?.id || '',
          userName: user?.name || 'Admin',
          text: statusUpdateComment,
          date: new Date().toISOString().split('T')[0],
        },
      ];
    }
    
    try {
      await updateServiceRequest(selectedRequest.id, updatedRequest);
      Alert.alert(
        'Success', 
        'Request status updated successfully',
        [{ text: 'OK', onPress: closeDetailModal }]
      );
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update request status');
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return Colors.warning[500];
      case 'in-progress':
        return Colors.primary[500];
      case 'resolved':
        return Colors.success[500];
      case 'rejected':
        return Colors.error[500];
      default:
        return Colors.gray[500];
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={20} color={getStatusColor(status)} />;
      case 'in-progress':
        return <Wrench size={20} color={getStatusColor(status)} />;
      case 'resolved':
        return <CheckCircle size={20} color={getStatusColor(status)} />;
      case 'rejected':
        return <XCircle size={20} color={getStatusColor(status)} />;
      default:
        return <AlertCircle size={20} color={getStatusColor(status)} />;
    }
  };
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'maintenance':
        return <Wrench size={20} color={Colors.gray[600]} />;
      default:
        return <Wrench size={20} color={Colors.gray[600]} />;
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderRequestItem = ({ item }: { item: ServiceRequest }) => (
    <TouchableOpacity 
      style={styles.requestCard}
      onPress={() => openDetailModal(item)}
    >
      <View style={styles.requestHeader}>
        <View style={styles.requestHeaderLeft}>
          <Wrench size={20} color={Colors.gray[600]} />
          <Text style={styles.requestTitle}>{item.title}</Text>
        </View>
        <View 
          style={[
            styles.statusBadge, 
            { backgroundColor: getStatusColor(item.status) + '20' }
          ]}
        >
          {getStatusIcon(item.status)}
          <Text 
            style={[
              styles.statusText, 
              { color: getStatusColor(item.status) }
            ]}
          >
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>
      <Text style={styles.requestDescription} numberOfLines={2}>
        {item.description}
      </Text>
      <View style={styles.requestFooter}>
        <View style={[
          styles.categoryBadge,
          { backgroundColor: Colors.primary[50] }
        ]}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
        <View style={[
          styles.priorityBadge,
          { 
            backgroundColor: 
              item.priority === 'high' ? Colors.error[50] :
              item.priority === 'medium' ? Colors.warning[50] :
              Colors.success[50]
          }
        ]}>
          <Text style={[
            styles.priorityText,
            {
              color: 
                item.priority === 'high' ? Colors.error[600] :
                item.priority === 'medium' ? Colors.warning[600] :
                Colors.success[600]
            }
          ]}>
            {item.priority.toUpperCase()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Service Requests</Text>
        <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
          <Plus size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={filteredRequests}
        renderItem={renderRequestItem}
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
            <Text style={styles.emptyText}>
              {isAdmin 
                ? "No service requests have been submitted yet."
                : "You haven't submitted any service requests yet."
              }
            </Text>
            <Button
              title="Create New Request"
              onPress={openCreateModal}
              variant="primary"
              size="medium"
              style={{ marginTop: 16 }}
            />
          </View>
        }
      />
      
      {/* Create Request Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={createModalVisible}
        onRequestClose={closeCreateModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Request</Text>
              <TouchableOpacity onPress={closeCreateModal}>
                <ArrowLeft size={24} color={Colors.gray[700]} />
              </TouchableOpacity>
            </View>
            
            <FormGroup>
              <Input
                label="Title"
                placeholder="Enter request title"
                value={title}
                onChangeText={setTitle}
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Input
                label="Description"
                placeholder="Describe your request in detail"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Select
                label="Category"
                value={category}
                onChange={setCategory}
                options={[
                  { value: 'maintenance', label: 'Maintenance' },
                  { value: 'cleaning', label: 'Cleaning' },
                  { value: 'security', label: 'Security' },
                  { value: 'other', label: 'Other' },
                ]}
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Select
                label="Priority"
                value={priority}
                onChange={setPriority}
                options={[
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' },
                ]}
                required
              />
            </FormGroup>
            
            <Button
              title="Submit Request"
              onPress={handleCreateRequest}
              style={{ marginTop: 16 }}
            />
          </View>
        </View>
      </Modal>
      
      {/* Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={detailModalVisible}
        onRequestClose={closeDetailModal}
      >
        {selectedRequest && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Request Details</Text>
                <TouchableOpacity onPress={closeDetailModal}>
                  <ArrowLeft size={24} color={Colors.gray[700]} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Title</Text>
                <Text style={styles.detailText}>{selectedRequest.title}</Text>
              </View>
              
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Description</Text>
                <Text style={styles.detailText}>{selectedRequest.description}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <View style={styles.detailColumn}>
                  <Text style={styles.detailLabel}>Category</Text>
                  <View style={[
                    styles.categoryBadge,
                    { backgroundColor: Colors.primary[50] }
                  ]}>
                    <Text style={styles.categoryText}>{selectedRequest.category}</Text>
                  </View>
                </View>
                
                <View style={styles.detailColumn}>
                  <Text style={styles.detailLabel}>Priority</Text>
                  <View style={[
                    styles.priorityBadge,
                    { 
                      backgroundColor: 
                        selectedRequest.priority === 'high' ? Colors.error[50] :
                        selectedRequest.priority === 'medium' ? Colors.warning[50] :
                        Colors.success[50]
                    }
                  ]}>
                    <Text style={[
                      styles.priorityText,
                      {
                        color: 
                          selectedRequest.priority === 'high' ? Colors.error[600] :
                          selectedRequest.priority === 'medium' ? Colors.warning[600] :
                          Colors.success[600]
                      }
                    ]}>
                      {selectedRequest.priority.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.detailRow}>
                <View style={styles.detailColumn}>
                  <Text style={styles.detailLabel}>Status</Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(selectedRequest.status) + '20' }
                  ]}>
                    <View style={styles.statusIconContainer}>
                      {getStatusIcon(selectedRequest.status)}
                    </View>
                    <Text style={[
                      styles.statusText,
                      { color: getStatusColor(selectedRequest.status) }
                    ]}>
                      {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1).replace(/-/g, ' ')}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.detailColumn}>
                  <Text style={styles.detailLabel}>Date</Text>
                  <Text style={styles.detailText}>{selectedRequest.date}</Text>
                </View>
              </View>
              
              {isAdmin && (
                <View style={styles.adminControls}>
                  <Text style={styles.detailLabel}>Update Status</Text>
                  
                  <View style={styles.buttonGroup}>
                    {(['pending', 'in-progress', 'resolved', 'rejected'] as const).map((status) => (
                      <TouchableOpacity
                        key={status}
                        style={[
                          styles.statusButton,
                          { backgroundColor: getStatusColor(status) + '20' },
                          selectedRequest.status === status && {
                            borderColor: getStatusColor(status),
                            borderWidth: 1,
                          }
                        ]}
                        onPress={() => handleStatusUpdate(status)}
                      >
                        <Text
                          style={[
                            styles.statusButtonText,
                            { color: getStatusColor(status) },
                          ]}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1).replace(/-/g, ' ')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Add Comment</Text>
                    <View style={styles.commentInputContainer}>
                      <TextInput
                        placeholder="Leave a comment about the status update"
                        value={statusUpdateComment}
                        onChangeText={setStatusUpdateComment}
                        multiline
                        numberOfLines={2}
                        style={{ flex: 1, borderWidth: 1, borderColor: Colors.gray[300], borderRadius: 4, padding: 8 }}
                      />
                      <TouchableOpacity 
                        style={styles.sendButton}
                        onPress={() => {
                          if (statusUpdateComment.trim()) {
                            handleStatusUpdate(selectedRequest.status);
                          }
                        }}
                      >
                        <Send size={20} color={Colors.white} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
              
              {/* Comments section */}
              {selectedRequest.comments && selectedRequest.comments.length > 0 && (
                <View style={styles.commentsSection}>
                  <Text style={styles.detailLabel}>Comments</Text>
                  {selectedRequest.comments.map((comment) => (
                    <View key={comment.id} style={styles.commentItem}>
                      <View style={styles.commentHeader}>
                        <Text style={styles.commentAuthor}>{comment.userName}</Text>
                        <Text style={styles.commentDate}>{comment.date}</Text>
                      </View>
                      <Text style={styles.commentText}>{comment.text}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
    backgroundColor: Colors.white,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.gray[900],
  },
  addButton: {
    backgroundColor: Colors.primary[600],
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 120,
  },
  requestCard: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  requestHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[900],
    marginLeft: 8,
    flex: 1,
  },
  requestDate: {
    fontSize: 12,
    color: Colors.gray[500],
  },
  requestDescription: {
    fontSize: 14,
    color: Colors.gray[700],
    marginBottom: 12,
  },
  requestFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 12,
    color: Colors.primary[700],
    textTransform: 'capitalize',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.gray[900],
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.gray[700],
    marginBottom: 6,
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  selectButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    backgroundColor: Colors.gray[100],
    marginHorizontal: 4,
    marginBottom: 8,
  },
  selectedButton: {
    backgroundColor: Colors.primary[500],
  },
  selectButtonText: {
    fontSize: 14,
    color: Colors.gray[700],
  },
  selectedButtonText: {
    color: Colors.white,
  },
  detailSection: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.gray[700],
    marginBottom: 4,
  },
  detailText: {
    fontSize: 16,
    color: Colors.gray[900],
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  detailColumn: {
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statusIconContainer: {
    marginRight: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  adminControls: {
    marginTop: 16,
    padding: 16,
    backgroundColor: Colors.gray[50],
    borderRadius: 8,
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  commentsSection: {
    marginTop: 16,
  },
  commentItem: {
    backgroundColor: Colors.gray[50],
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.gray[900],
  },
  commentDate: {
    fontSize: 12,
    color: Colors.gray[500],
  },
  commentText: {
    fontSize: 14,
    color: Colors.gray[800],
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sendButton: {
    backgroundColor: Colors.primary[600],
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    height: 300,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.gray[600],
    textAlign: 'center',
  },
});