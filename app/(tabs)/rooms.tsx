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
  Alert
} from 'react-native';
import { Filter, ArrowLeft, CircleCheck as CheckCircle2 } from 'lucide-react-native';
import { useData } from '@/context/DataContext';
import Colors from '@/constants/Colors';
import RoomCard from '@/components/dashboard/RoomCard';
import Button from '@/components/common/Button';
import { Room, Student } from '@/types';

export default function RoomsScreen() {
  const { rooms, students, allocateRoom, isLoading } = useData();
  
  const [refreshing, setRefreshing] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [allocateModalVisible, setAllocateModalVisible] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [roomTypeFilter, setRoomTypeFilter] = useState<string | null>(null);
  const [blockFilter, setBlockFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  
  // Get unique values for filters
  const roomTypes = Array.from(new Set(rooms.map(r => r.type)));
  const blocks = Array.from(new Set(rooms.map(r => r.block)));
  const statuses = Array.from(new Set(rooms.map(r => r.status)));
  
  // Filter rooms
  const filteredRooms = rooms.filter(room => {
    if (roomTypeFilter && room.type !== roomTypeFilter) return false;
    if (blockFilter && room.block !== blockFilter) return false;
    if (statusFilter && room.status !== statusFilter) return false;
    return true;
  });
  
  // Get available students (not assigned to a room)
  const availableStudents = students.filter(student => !student.roomId);
  
  const refreshData = useCallback(async () => {
    // The actual refresh happens in the DataContext
    // We just need to show the loading state here
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);
  
  const openFilterModal = () => {
    setFilterModalVisible(true);
  };
  
  const closeFilterModal = () => {
    setFilterModalVisible(false);
  };
  
  const clearFilters = () => {
    setRoomTypeFilter(null);
    setBlockFilter(null);
    setStatusFilter(null);
    closeFilterModal();
  };
  
  const handleRoomPress = (room: Room) => {
    setSelectedRoom(room);
    setAllocateModalVisible(true);
  };
  
  const closeAllocateModal = () => {
    setAllocateModalVisible(false);
    setSelectedRoom(null);
    setSelectedStudent(null);
  };
  
  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
  };
  
  const handleAllocateRoom = async () => {
    if (!selectedRoom || !selectedStudent) {
      Alert.alert('Error', 'Please select both a room and a student');
      return;
    }
    
    if (selectedRoom.status === 'full') {
      Alert.alert('Error', 'This room is already full');
      return;
    }
    
    if (selectedRoom.status === 'maintenance') {
      Alert.alert('Error', 'This room is under maintenance');
      return;
    }
    
    try {
      await allocateRoom(selectedStudent.id, selectedRoom.id);
      Alert.alert(
        'Success', 
        `Room ${selectedRoom.number} has been allocated to ${selectedStudent.name}`,
        [{ text: 'OK', onPress: closeAllocateModal }]
      );
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to allocate room');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Room Management</Text>
        <TouchableOpacity style={styles.filterButton} onPress={openFilterModal}>
          <Filter size={20} color={Colors.gray[700]} />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={filteredRooms}
        renderItem={({ item }) => (
          <RoomCard 
            room={item} 
            onPress={() => handleRoomPress(item)}
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
            <Text style={styles.emptyText}>No rooms available with the selected filters</Text>
            <Button
              title="Clear Filters"
              onPress={clearFilters}
              variant="primary"
              size="small"
              style={{ marginTop: 16 }}
            />
          </View>
        }
      />
      
      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeFilterModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={closeFilterModal} style={styles.closeButton}>
                <ArrowLeft size={24} color={Colors.gray[700]} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Filter Rooms</Text>
            </View>
            
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Room Type</Text>
              <View style={styles.filterOptions}>
                {roomTypes.map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.filterOption,
                      roomTypeFilter === type && styles.filterOptionSelected,
                    ]}
                    onPress={() => setRoomTypeFilter(type === roomTypeFilter ? null : type)}
                  >
                    <Text 
                      style={[
                        styles.filterOptionText,
                        roomTypeFilter === type && styles.filterOptionTextSelected,
                      ]}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Block</Text>
              <View style={styles.filterOptions}>
                {blocks.map(block => (
                  <TouchableOpacity
                    key={block}
                    style={[
                      styles.filterOption,
                      blockFilter === block && styles.filterOptionSelected,
                    ]}
                    onPress={() => setBlockFilter(block === blockFilter ? null : block)}
                  >
                    <Text 
                      style={[
                        styles.filterOptionText,
                        blockFilter === block && styles.filterOptionTextSelected,
                      ]}
                    >
                      Block {block}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Status</Text>
              <View style={styles.filterOptions}>
                {statuses.map(status => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.filterOption,
                      statusFilter === status && styles.filterOptionSelected,
                    ]}
                    onPress={() => setStatusFilter(status === statusFilter ? null : status)}
                  >
                    <Text 
                      style={[
                        styles.filterOptionText,
                        statusFilter === status && styles.filterOptionTextSelected,
                      ]}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.filterActions}>
              <Button
                title="Clear All"
                onPress={clearFilters}
                variant="outline"
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title="Apply Filters"
                onPress={closeFilterModal}
                variant="primary"
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Allocate Room Modal */}
      <Modal
        visible={allocateModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeAllocateModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={closeAllocateModal} style={styles.closeButton}>
                <ArrowLeft size={24} color={Colors.gray[700]} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Allocate Room</Text>
            </View>
            
            {selectedRoom && (
              <View style={styles.selectedRoomContainer}>
                <Text style={styles.selectedRoomTitle}>
                  Room {selectedRoom.number}, Block {selectedRoom.block}
                </Text>
                <View style={styles.roomDetailRow}>
                  <Text style={styles.roomDetailLabel}>Type:</Text>
                  <Text style={styles.roomDetailValue}>{selectedRoom.type}</Text>
                </View>
                <View style={styles.roomDetailRow}>
                  <Text style={styles.roomDetailLabel}>Floor:</Text>
                  <Text style={styles.roomDetailValue}>{selectedRoom.floor}</Text>
                </View>
                <View style={styles.roomDetailRow}>
                  <Text style={styles.roomDetailLabel}>Capacity:</Text>
                  <Text style={styles.roomDetailValue}>
                    {selectedRoom.occupants.length}/{selectedRoom.capacity}
                  </Text>
                </View>
                <View style={styles.roomDetailRow}>
                  <Text style={styles.roomDetailLabel}>Status:</Text>
                  <Text 
                    style={[
                      styles.roomDetailValue, 
                      { 
                        color: 
                          selectedRoom.status === 'available' ? Colors.success[600] : 
                          selectedRoom.status === 'full' ? Colors.error[600] : 
                          Colors.warning[600]
                      }
                    ]}
                  >
                    {selectedRoom.status.charAt(0).toUpperCase() + selectedRoom.status.slice(1)}
                  </Text>
                </View>
              </View>
            )}
            
            <View style={styles.studentSelectionContainer}>
              <Text style={styles.studentSelectionTitle}>Select a Student</Text>
              
              {availableStudents.length > 0 ? (
                <FlatList
                  data={availableStudents}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.studentItem,
                        selectedStudent?.id === item.id && styles.studentItemSelected,
                      ]}
                      onPress={() => handleStudentSelect(item)}
                    >
                      <View style={styles.studentInfo}>
                        <Text style={styles.studentName}>{item.name}</Text>
                        <Text style={styles.studentId}>{item.admissionNumber}</Text>
                      </View>
                      {selectedStudent?.id === item.id && (
                        <CheckCircle2 size={20} color={Colors.primary[600]} />
                      )}
                    </TouchableOpacity>
                  )}
                  keyExtractor={item => item.id}
                  style={styles.studentList}
                />
              ) : (
                <View style={styles.noStudentsContainer}>
                  <Text style={styles.noStudentsText}>
                    All students have been assigned rooms
                  </Text>
                </View>
              )}
            </View>
            
            <View style={styles.allocateActions}>
              <Button
                title="Cancel"
                onPress={closeAllocateModal}
                variant="outline"
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title="Allocate Room"
                onPress={handleAllocateRoom}
                variant="primary"
                style={{ flex: 1 }}
                disabled={!selectedStudent || !selectedRoom || selectedRoom.status !== 'available' && selectedRoom.status !== 'full'}
              />
            </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.gray[900],
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
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
    ...Platform.select({
      ios: {
        maxHeight: '80%',
      },
      android: {
        maxHeight: '80%',
      },
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
  
  // Filter Modal Styles
  filterSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[800],
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: Colors.gray[100],
    marginRight: 8,
    marginBottom: 8,
  },
  filterOptionSelected: {
    backgroundColor: Colors.primary[100],
  },
  filterOptionText: {
    fontSize: 14,
    color: Colors.gray[700],
  },
  filterOptionTextSelected: {
    color: Colors.primary[700],
    fontWeight: '500',
  },
  filterActions: {
    flexDirection: 'row',
    padding: 16,
  },
  
  // Allocate Room Modal Styles
  selectedRoomContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  selectedRoomTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.gray[800],
    marginBottom: 12,
  },
  roomDetailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  roomDetailLabel: {
    width: 80,
    fontSize: 14,
    color: Colors.gray[600],
    fontWeight: '500',
  },
  roomDetailValue: {
    fontSize: 14,
    color: Colors.gray[800],
  },
  studentSelectionContainer: {
    padding: 16,
    flex: 1,
  },
  studentSelectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[800],
    marginBottom: 12,
  },
  studentList: {
    maxHeight: 250,
  },
  studentItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    backgroundColor: Colors.white,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  studentItemSelected: {
    borderColor: Colors.primary[500],
    backgroundColor: Colors.primary[50],
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.gray[800],
  },
  studentId: {
    fontSize: 12,
    color: Colors.gray[500],
  },
  noStudentsContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noStudentsText: {
    fontSize: 16,
    color: Colors.gray[500],
    textAlign: 'center',
  },
  allocateActions: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
});