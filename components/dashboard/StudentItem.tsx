import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { Student } from '@/types';

interface StudentItemProps {
  student: Student;
  onPress?: () => void;
}

const StudentItem: React.FC<StudentItemProps> = ({ student, onPress }) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.imageContainer}>
        {student.profilePic ? (
          <Image source={{ uri: student.profilePic }} style={styles.image} />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>
              {student.name.split(' ').map(n => n[0]).join('')}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{student.name}</Text>
        <Text style={styles.id}>ID: {student.admissionNumber}</Text>
        
        <View style={styles.detailsContainer}>
          <View style={styles.detail}>
            <Text style={styles.detailLabel}>Room:</Text>
            <Text style={styles.detailValue}>
              {student.roomNumber ? `${student.roomNumber} (Block ${student.hostelBlock})` : 'Not Assigned'}
            </Text>
          </View>
          
          <View style={styles.detail}>
            <Text style={styles.detailLabel}>Department:</Text>
            <Text style={styles.detailValue}>{student.department || 'N/A'}</Text>
          </View>
          
          <View style={styles.detail}>
            <Text style={styles.detailLabel}>Year:</Text>
            <Text style={styles.detailValue}>{student.yearOfStudy || 'N/A'}</Text>
          </View>
        </View>
        
        <View 
          style={[
            styles.paymentStatusBadge, 
            {
              backgroundColor: 
                student.paymentStatus === 'paid' 
                  ? Colors.success[100]
                  : student.paymentStatus === 'pending'
                  ? Colors.warning[100]
                  : Colors.error[100]
            }
          ]}
        >
          <Text 
            style={[
              styles.paymentStatusText,
              {
                color: 
                  student.paymentStatus === 'paid' 
                    ? Colors.success[700]
                    : student.paymentStatus === 'pending'
                    ? Colors.warning[700]
                    : Colors.error[700]
              }
            ]}
          >
            {student.paymentStatus.toUpperCase()}
          </Text>
        </View>
      </View>
      
      <View style={styles.chevronContainer}>
        <ChevronRight size={20} color={Colors.gray[400]} />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 8,
    marginVertical: 6,
    padding: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  pressed: {
    opacity: 0.7,
  },
  imageContainer: {
    marginRight: 12,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary[600],
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[800],
    marginBottom: 2,
  },
  id: {
    fontSize: 12,
    color: Colors.gray[500],
    marginBottom: 8,
  },
  detailsContainer: {
    marginBottom: 8,
  },
  detail: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.gray[600],
    marginRight: 4,
    width: 80,
  },
  detailValue: {
    fontSize: 12,
    color: Colors.gray[700],
    flex: 1,
  },
  paymentStatusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  paymentStatusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  chevronContainer: {
    justifyContent: 'center',
    paddingLeft: 8,
  },
});

export default StudentItem;