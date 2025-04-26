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
import {
  Plus,
  ArrowLeft,
  Search,
  User,
  Trash2
} from 'lucide-react-native';
import { useData } from '@/context/DataContext';
import Colors from '@/constants/Colors';
import StudentItem from '@/components/dashboard/StudentItem';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { Student } from '@/types';

export default function StudentsScreen() {
  const { students, addStudent, removeStudent, isLoading } = useData();
  
  const [refreshing, setRefreshing] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [removeModalVisible, setRemoveModalVisible] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form state for adding a new student
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('');
  
  // Filter students based on search query
  const filteredStudents = students.filter(student => {
    const query = searchQuery.toLowerCase();
    return (
      student.name.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query) ||
      student.admissionNumber.toLowerCase().includes(query) ||
      (student.department && student.department.toLowerCase().includes(query))
    );
  });
  
  const refreshData = useCallback(async () => {
    // The actual refresh happens in the DataContext
    // We just need to show the loading state here
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);
  
  const openAddModal = () => {
    setAddModalVisible(true);
  };
  
  const closeAddModal = () => {
    setAddModalVisible(false);
    // Reset form
    setName('');
    setEmail('');
    setAdmissionNumber('');
    setDepartment('');
    setYearOfStudy('');
  };
  
  const handleAddStudent = async () => {
    // Validate form
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter student name');
      return;
    }
    
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    
    if (!admissionNumber.trim()) {
      Alert.alert('Error', 'Please enter admission number');
      return;
    }
    
    // Create new student
    const newStudent: Omit<Student, 'id'> = {
      name,
      email,
      role: 'student',
      admissionNumber,
      department,
      yearOfStudy: yearOfStudy ? parseInt(yearOfStudy, 10) : undefined,
      roomId: null,
      paymentStatus: 'pending',
      paymentHistory: [],
    };
    
    try {
      await addStudent(newStudent);
      Alert.alert(
        'Success', 
        'Student added successfully',
        [{ text: 'OK', onPress: closeAddModal }]
      );
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to add student');
    }
  };
  
  const openRemoveModal = (student: Student) => {
    setStudentToRemove(student);
    setRemoveModalVisible(true);
  };
  
  const closeRemoveModal = () => {
    setRemoveModalVisible(false);
    setStudentToRemove(null);
  };
  
  const handleRemoveStudent = async () => {
    if (!studentToRemove) return;
    
    try {
      await removeStudent(studentToRemove.id);
      Alert.alert(
        'Success', 
        'Student removed successfully',
        [{ text: 'OK', onPress: closeRemoveModal }]
      );
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to remove student');
      closeRemoveModal();
    }
  };
  
  const handleStudentPress = (student: Student) => {
    // Show options: View details, Edit, Remove
    Alert.alert(
      student.name,
      'Select an action',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove Student', onPress: () => openRemoveModal(student), style: 'destructive' },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Student Management</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Plus size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchContainer}>
        <Search size={20} color={Colors.gray[500]} />
        <TextInput
          placeholder="Search students..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
      </View>
      
      <FlatList
        data={filteredStudents}
        renderItem={({ item }) => (
          <StudentItem 
            student={item} 
            onPress={() => handleStudentPress(item)}
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
            <Text style={styles.emptyText}>
              {searchQuery ? 'No students found matching your search' : 'No students available'}
            </Text>
            <Button
              title="Add Student"
              onPress={openAddModal}
              variant="primary"
              size="small"
              style={{ marginTop: 16 }}
            />
          </View>
        }
      />
      
      {/* Add Student Modal */}
      <Modal
        visible={addModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeAddModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={closeAddModal} style={styles.closeButton}>
                <ArrowLeft size={24} color={Colors.gray[700]} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Add New Student</Text>
            </View>
            
            <ScrollView style={styles.formContainer}>
              <Input
                label="Full Name"
                placeholder="Enter student's full name"
                value={name}
                onChangeText={setName}
                required
              />
              
              <Input
                label="Email"
                placeholder="Enter student's email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                required
              />
              
              <Input
                label="Admission Number"
                placeholder="Enter admission/ID number"
                value={admissionNumber}
                onChangeText={setAdmissionNumber}
                required
              />
              
              <Input
                label="Department"
                placeholder="Enter department"
                value={department}
                onChangeText={setDepartment}
              />
              
              <Input
                label="Year of Study"
                placeholder="Enter year of study"
                value={yearOfStudy}
                onChangeText={text => setYearOfStudy(text.replace(/[^0-9]/g, ''))}
                keyboardType="numeric"
              />
            </ScrollView>
            
            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                onPress={closeAddModal}
                variant="outline"
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title="Add Student"
                onPress={handleAddStudent}
                variant="primary"
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Remove Student Modal */}
      <Modal
        visible={removeModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeRemoveModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.confirmModalContent}>
            <View style={styles.confirmIconContainer}>
              <View style={styles.confirmIcon}>
                <Trash2 size={36} color={Colors.error[500]} />
              </View>
            </View>
            
            <Text style={styles.confirmTitle}>Remove Student</Text>
            <Text style={styles.confirmText}>
              Are you sure you want to remove <Text style={styles.studentName}>{studentToRemove?.name}</Text>? 
              This action cannot be undone.
            </Text>
            
            <View style={styles.confirmActions}>
              <Button
                title="Cancel"
                onPress={closeRemoveModal}
                variant="outline"
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title="Remove"
                onPress={handleRemoveStudent}
                variant="danger"
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Adding ScrollView component to fix the error
import { ScrollView } from 'react-native';

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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  searchInput: {
    flex: 1,
    marginBottom: 0,
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
  formContainer: {
    padding: 16,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  
  // Confirm Modal Styles
  confirmModalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    ...Platform.select({
      web: {
        maxWidth: 500,
        alignSelf: 'center',
        width: '100%',
        borderRadius: 12,
        maxHeight: 400,
        marginBottom: 40,
      },
    }),
  },
  confirmIconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  confirmIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.error[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.gray[900],
    textAlign: 'center',
    marginBottom: 8,
  },
  confirmText: {
    fontSize: 16,
    color: Colors.gray[600],
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  studentName: {
    fontWeight: '600',
    color: Colors.gray[800],
  },
  confirmActions: {
    flexDirection: 'row',
  },
});