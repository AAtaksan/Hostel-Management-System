import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  Image, 
  TouchableOpacity,
  Platform,
  Alert
} from 'react-native';
import { CreditCard as Edit3, LogOut, Mail, Phone, MapPin, School, BookOpen, Calendar } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { router } from 'expo-router';
import Colors from '@/constants/Colors';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { Student, Admin } from '@/types';

export default function ProfileScreen() {
  const { user, logout, isAdmin } = useAuth();
  const { updateProfile, students } = useData();
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [department, setDepartment] = useState(user?.department || '');
  
  // Update state when user data changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
      setDepartment(user.department || '');
    }
  }, [user]);
  
  // Find full user data
  const userDetails = isAdmin 
    ? undefined // Admin data doesn't need special lookup
    : students.find(s => s.id === user?.id) as Student | undefined;
  
  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      Alert.alert('Logout Failed', 'There was a problem signing out. Please try again.');
    }
  };
  
  const confirmLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: handleLogout, style: 'destructive' }
      ]
    );
  };
  
  const handleEditToggle = () => {
    if (isEditing) {
      // Save changes
      if (user) {
        updateProfile(user.id, {
          name,
          email,
          phone,
          address,
          department,
        });
        
        Alert.alert('Success', 'Profile updated successfully');
      }
    }
    
    setIsEditing(!isEditing);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.profileImageContainer}>
            {user?.profilePic ? (
              <Image source={{ uri: user.profilePic }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.profileImagePlaceholderText}>
                  {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                </Text>
              </View>
            )}
            
            <TouchableOpacity style={styles.editImageButton}>
              <Edit3 size={16} color={Colors.white} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.nameText}>{user?.name}</Text>
          <Text style={styles.roleText}>
            {isAdmin ? 'Administrator' : 'Student'}
          </Text>
          
          <View style={styles.actionsContainer}>
            <Button
              title={isEditing ? "Save Profile" : "Edit Profile"}
              onPress={handleEditToggle}
              variant="primary"
              size="medium"
              style={{ flex: 1, marginRight: 8 }}
            />
            
            <Button
              title="Logout"
              onPress={confirmLogout}
              variant="outline"
              size="medium"
              style={{ flex: 1 }}
            />
          </View>
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          {isEditing ? (
            // Edit mode
            <>
              <Input
                label="Full Name"
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
              />
              
              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
              />
              
              <Input
                label="Phone"
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
              />
              
              <Input
                label="Address"
                value={address}
                onChangeText={setAddress}
                placeholder="Enter your address"
                multiline
                numberOfLines={3}
              />
              
              <Input
                label="Department"
                value={department}
                onChangeText={setDepartment}
                placeholder="Enter your department"
              />
            </>
          ) : (
            // View mode
            <>
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Mail size={20} color={Colors.primary[600]} />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{user?.email}</Text>
                </View>
              </View>
              
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Phone size={20} color={Colors.primary[600]} />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Phone</Text>
                  <Text style={styles.infoValue}>{user?.phone || 'Not provided'}</Text>
                </View>
              </View>
              
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <MapPin size={20} color={Colors.primary[600]} />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Address</Text>
                  <Text style={styles.infoValue}>{user?.address || 'Not provided'}</Text>
                </View>
              </View>
              
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <School size={20} color={Colors.primary[600]} />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Department</Text>
                  <Text style={styles.infoValue}>{user?.department || 'Not provided'}</Text>
                </View>
              </View>
              
              {!isAdmin && userDetails && (
                <>
                  <View style={styles.infoRow}>
                    <View style={styles.infoIconContainer}>
                      <BookOpen size={20} color={Colors.primary[600]} />
                    </View>
                    <View style={styles.infoTextContainer}>
                      <Text style={styles.infoLabel}>Admission Number</Text>
                      <Text style={styles.infoValue}>{userDetails.admissionNumber}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <View style={styles.infoIconContainer}>
                      <Calendar size={20} color={Colors.primary[600]} />
                    </View>
                    <View style={styles.infoTextContainer}>
                      <Text style={styles.infoLabel}>Year of Study</Text>
                      <Text style={styles.infoValue}>{userDetails.yearOfStudy || 'Not provided'}</Text>
                    </View>
                  </View>
                </>
              )}
              
              {isAdmin && (user as Admin)?.position && (
                <View style={styles.infoRow}>
                  <View style={styles.infoIconContainer}>
                    <BookOpen size={20} color={Colors.primary[600]} />
                  </View>
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Position</Text>
                    <Text style={styles.infoValue}>{(user as Admin).position}</Text>
                  </View>
                </View>
              )}
            </>
          )}
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.versionText}>Hostel Management System v1.0</Text>
          <Text style={styles.copyrightText}>© 2023 Campus Living. All rights reserved.</Text>
        </View>
        
        <View style={styles.logoutContainer}>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={confirmLogout}
          >
            <LogOut size={20} color={Colors.error[500]} style={styles.logoutIcon} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: Colors.primary[600],
    paddingTop: Platform.OS === 'ios' ? 0 : 40,
    paddingBottom: 24,
    alignItems: 'center',
  },
  profileImageContainer: {
    marginTop: 20,
    marginBottom: 16,
    position: 'relative',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: Colors.white,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary[300],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.white,
  },
  profileImagePlaceholderText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.white,
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary[500],
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 4,
  },
  roleText: {
    fontSize: 16,
    color: Colors.primary[100],
    marginBottom: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    width: '100%',
    maxWidth: 400,
  },
  infoContainer: {
    padding: 16,
    backgroundColor: Colors.white,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    ...Platform.select({
      web: {
        maxWidth: 600,
        alignSelf: 'center',
        width: '100%',
      },
    }),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.gray[800],
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.gray[500],
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: Colors.gray[800],
  },
  footer: {
    padding: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  versionText: {
    fontSize: 14,
    color: Colors.gray[500],
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 12,
    color: Colors.gray[400],
  },
  logoutContainer: {
    marginTop: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
    alignItems: 'center'
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: Colors.error[50],
  },
  logoutIcon: {
    marginRight: 10,
  },
  logoutText: {
    color: Colors.error[600],
    fontSize: 16,
    fontWeight: '600',
  },
});