import React, { useState, useCallback, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  Image,
  Platform,
  RefreshControl
} from 'react-native';
import { Bell, Settings, Chrome as Home, Wallet, SquareDot as HotelSquare, Users, ChartBar as BarChart4, Wrench, BookCopy, CalendarDays, HelpCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import Colors from '@/constants/Colors';
import Card from '@/components/common/Card';
import NoticeItem from '@/components/dashboard/NoticeItem';
import PaymentItem from '@/components/dashboard/PaymentItem';
import SummaryCard from '@/components/dashboard/SummaryCard';
import ActionLink from '@/components/common/ActionLink';
import { Student, Payment } from '@/types';

export default function DashboardScreen() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const { notices, students, rooms, serviceRequests, getStudentRoom, getStudentPayments, isLoading, error } = useData();
  
  const [refreshing, setRefreshing] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);

  // Get student-specific data if the user is a student
  const studentData = isAdmin ? null : students.find(s => s.id === user?.id) as Student | undefined;
  const studentRoom = studentData ? getStudentRoom(studentData.id) : undefined;
  
  // Fetch payments data
  useEffect(() => {
    const fetchPayments = async () => {
      if (studentData) {
        try {
          const paymentData = await getStudentPayments(studentData.id);
          setPayments(paymentData);
        } catch (error) {
          console.error('Failed to fetch payments:', error);
          setPayments([]);
        }
      }
    };
    
    fetchPayments();
  }, [studentData, getStudentPayments]);
  
  // Admin statistics
  const totalStudents = students.length;
  const availableRooms = rooms.filter(r => r.status === 'available').length;
  const occupiedRooms = rooms.filter(r => r.status === 'full').length;
  const pendingRequests = serviceRequests.filter(r => r.status === 'pending').length;
  
  // Define the refresh function
  const refreshData = useCallback(async () => {
    setRefreshing(true);
    try {
      // Reload all data from the DataContext
      if (studentData) {
        const paymentData = await getStudentPayments(studentData.id);
        setPayments(paymentData);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [studentData, getStudentPayments]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>
            Hello, {user?.name?.split(' ')[0] || 'User'}
          </Text>
          <Text style={styles.role}>
            {isAdmin ? 'Admin Dashboard' : 'Student Dashboard'}
          </Text>
        </View>
        
        <TouchableOpacity style={styles.settingsButton}>
          <Settings size={24} color={Colors.gray[700]} />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || isLoading}
            onRefresh={refreshData}
            colors={[Colors.primary[600]]}
            tintColor={Colors.primary[600]}
          />
        }
      >
        {isAdmin ? (
          // Admin Dashboard Content
          <>
            <Text style={styles.sectionTitle}>Overview</Text>
            
            <View style={styles.statsContainer}>
              <SummaryCard
                icon={<Users size={24} color={Colors.primary[600]} />}
                title="Students"
                value={totalStudents}
                backgroundColor={Colors.primary[50]}
                iconBackgroundColor={Colors.primary[100]}
              />
              
              <SummaryCard
                icon={<HotelSquare size={24} color={Colors.success[600]} />}
                title="Available Rooms"
                value={availableRooms}
                backgroundColor={Colors.success[50]}
                iconBackgroundColor={Colors.success[100]}
              />
              
              <SummaryCard
                icon={<BarChart4 size={24} color={Colors.accent[600]} />}
                title="Occupied Rooms"
                value={occupiedRooms}
                backgroundColor={Colors.accent[50]}
                iconBackgroundColor={Colors.accent[100]}
              />
              
              <SummaryCard
                icon={<Wrench size={24} color={Colors.warning[600]} />}
                title="Pending Requests"
                value={pendingRequests}
                backgroundColor={Colors.warning[50]}
                iconBackgroundColor={Colors.warning[100]}
              />
            </View>
            
            <Text style={styles.sectionTitle}>Recent Notices</Text>
            <View style={styles.noticesContainer}>
              {notices.slice(0, 3).map(notice => (
                <NoticeItem key={notice.id} notice={notice} />
              ))}
            </View>
            
            <Text style={styles.sectionTitle}>Recent Service Requests</Text>
            <View style={styles.requestsContainer}>
              {serviceRequests.slice(0, 3).map(request => (
                <View key={request.id} style={styles.requestCard}>
                  <View style={styles.requestHeader}>
                    <Text style={styles.requestTitle}>{request.title}</Text>
                    <View 
                      style={[
                        styles.statusBadge, 
                        { 
                          backgroundColor: 
                            request.status === 'pending' ? Colors.warning[100] : 
                            request.status === 'in-progress' ? Colors.primary[100] : 
                            request.status === 'resolved' ? Colors.success[100] : 
                            Colors.error[100]
                        }
                      ]}
                    >
                      <Text 
                        style={[
                          styles.statusText,
                          {
                            color: 
                              request.status === 'pending' ? Colors.warning[700] : 
                              request.status === 'in-progress' ? Colors.primary[700] : 
                              request.status === 'resolved' ? Colors.success[700] : 
                              Colors.error[700]
                          }
                        ]}
                      >
                        {request.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.requestDescription}>{request.description}</Text>
                  <View style={styles.requestFooter}>
                    <Text style={styles.requestCategory}>{request.category}</Text>
                    <Text style={styles.requestDate}>
                      {new Date(request.date).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        ) : (
          // Student Dashboard Content
          <>
            <View style={styles.bannerContainer}>
              <Image
                source={{ uri: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' }}
                style={styles.bannerImage}
              />
              <View style={styles.bannerOverlay} />
              <View style={styles.bannerContent}>
                <Text style={styles.bannerTitle}>Welcome to Campus Living</Text>
                <Text style={styles.bannerSubtitle}>Manage your hostel experience</Text>
              </View>
            </View>
            
            <Text style={styles.sectionTitle}>Quick Access</Text>
            <View>
              <ActionLink
                icon={<HotelSquare size={20} color={Colors.primary[600]} />}
                title="My Room"
                subtitle="View your room details and roommates"
                onPress={() => router.push('/rooms')}
              />
              
              <ActionLink
                icon={<Wrench size={20} color={Colors.success[600]} />}
                title="Service Requests"
                subtitle="Submit and track maintenance requests"
                badge={serviceRequests.filter(req => req.studentId === user?.id && req.status === 'pending').length || undefined}
                onPress={() => router.push('/requests')}
              />
              
              <ActionLink
                icon={<Wallet size={20} color={Colors.warning[600]} />}
                title="Payments"
                subtitle="View your payment history and status"
                onPress={() => router.push('/profile')}
              />
              
              <ActionLink
                icon={<Bell size={20} color={Colors.accent[600]} />}
                title="Notices"
                subtitle="Check important announcements"
                badge={notices.filter(n => new Date(n.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length || undefined}
                onPress={() => router.push('/notices')}
              />
              
              <ActionLink
                icon={<BookCopy size={20} color={Colors.error[600]} />}
                title="Hostel Rules"
                subtitle="Review dormitory policies and guidelines"
                onPress={() => router.push('/rules')}
              />
            </View>
            
            <Card title="Room Information" variant="outlined">
              {studentRoom ? (
                <View>
                  <View style={styles.roomInfoRow}>
                    <Text style={styles.roomInfoLabel}>Room Number:</Text>
                    <Text style={styles.roomInfoValue}>{studentRoom.number}</Text>
                  </View>
                  <View style={styles.roomInfoRow}>
                    <Text style={styles.roomInfoLabel}>Block:</Text>
                    <Text style={styles.roomInfoValue}>{studentRoom.block}</Text>
                  </View>
                  <View style={styles.roomInfoRow}>
                    <Text style={styles.roomInfoLabel}>Floor:</Text>
                    <Text style={styles.roomInfoValue}>{studentRoom.floor}</Text>
                  </View>
                  <View style={styles.roomInfoRow}>
                    <Text style={styles.roomInfoLabel}>Type:</Text>
                    <Text style={styles.roomInfoValue}>{studentRoom.type}</Text>
                  </View>
                  <View style={styles.roomInfoRow}>
                    <Text style={styles.roomInfoLabel}>Occupancy:</Text>
                    <Text style={styles.roomInfoValue}>
                      {studentRoom.occupants.length}/{studentRoom.capacity}
                    </Text>
                  </View>
                </View>
              ) : (
                <Text style={styles.noRoomText}>No room assigned yet</Text>
              )}
            </Card>
            
            <Text style={styles.sectionTitle}>Payment Status</Text>
            <View style={styles.paymentContainer}>
              {payments.length > 0 ? (
                payments.map(payment => (
                  <PaymentItem key={payment.id} payment={payment} />
                ))
              ) : (
                <Text style={styles.emptyText}>No payment records found</Text>
              )}
            </View>
            
            <Text style={styles.sectionTitle}>Recent Notices</Text>
            <View style={styles.noticesContainer}>
              {notices.slice(0, 3).map(notice => (
                <NoticeItem key={notice.id} notice={notice} />
              ))}
            </View>
          </>
        )}
      </ScrollView>
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
  headerContent: {
    flex: 1,
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
    color: Colors.gray[900],
  },
  role: {
    fontSize: 14,
    color: Colors.gray[600],
    fontFamily: 'Inter-Regular',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    color: Colors.gray[800],
    marginTop: 16,
    marginBottom: 12,
  },
  
  // Admin Dashboard Styles
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  noticesContainer: {
    marginBottom: 16,
  },
  requestsContainer: {
    marginBottom: 16,
  },
  requestCard: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    color: Colors.gray[800],
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
  },
  requestDescription: {
    fontSize: 14,
    color: Colors.gray[600],
    fontFamily: 'Inter-Regular',
    marginBottom: 12,
  },
  requestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  requestCategory: {
    fontSize: 12,
    color: Colors.primary[600],
    fontFamily: 'Inter-Medium',
    textTransform: 'capitalize',
  },
  requestDate: {
    fontSize: 12,
    color: Colors.gray[500],
    fontFamily: 'Inter-Regular',
  },
  
  // Student Dashboard Styles
  bannerContainer: {
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  bannerContent: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
    color: Colors.white,
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: Colors.white,
    fontFamily: 'Inter-Regular',
  },
  roomInfoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  roomInfoLabel: {
    width: 100,
    fontSize: 14,
    color: Colors.gray[600],
    fontFamily: 'Inter-Medium',
  },
  roomInfoValue: {
    flex: 1,
    fontSize: 14,
    color: Colors.gray[800],
    fontFamily: 'Inter-Regular',
  },
  noRoomText: {
    fontSize: 14,
    color: Colors.gray[600],
    fontFamily: 'Inter-Regular',
    fontStyle: 'italic',
  },
  paymentContainer: {
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.gray[600],
    fontFamily: 'Inter-Regular',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 16,
  },
});