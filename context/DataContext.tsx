import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  Student, Room, Notice, ServiceRequest, Payment, HostelRule 
} from '@/types';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';

interface DataContextType {
  students: Student[];
  rooms: Room[];
  notices: Notice[];
  serviceRequests: ServiceRequest[];
  hostelRules: HostelRule[];
  isLoading: boolean;
  error: string | null;
  
  // Student methods
  addStudent: (student: Omit<Student, 'id'>) => Promise<void>;
  updateStudent: (id: string, updatedData: Partial<Student>) => Promise<void>;
  removeStudent: (id: string) => Promise<void>;
  
  // Room methods
  allocateRoom: (studentId: string, roomId: string) => Promise<void>;
  deallocateRoom: (studentId: string, roomId: string) => Promise<void>;
  
  // Service request methods
  addServiceRequest: (request: Omit<ServiceRequest, 'id' | 'date'>) => Promise<void>;
  updateServiceRequest: (id: string, updatedData: Partial<ServiceRequest>) => Promise<void>;
  
  // Profile methods
  updateProfile: (userId: string, updatedData: Partial<Student>) => Promise<void>;
  
  // Student specific data
  getStudentRoom: (studentId: string) => Room | undefined;
  getStudentPayments: (studentId: string) => Promise<Payment[]>;
  getStudentServiceRequests: (studentId: string) => Promise<ServiceRequest[]>;
}

const DataContext = createContext<DataContextType>({
  students: [],
  rooms: [],
  notices: [],
  serviceRequests: [],
  hostelRules: [],
  isLoading: false,
  error: null,
  
  // Placeholder functions
  addStudent: async () => {},
  updateStudent: async () => {},
  removeStudent: async () => {},
  allocateRoom: async () => {},
  deallocateRoom: async () => {},
  addServiceRequest: async () => {},
  updateServiceRequest: async () => {},
  updateProfile: async () => {},
  getStudentRoom: () => undefined,
  getStudentPayments: async () => [],
  getStudentServiceRequests: async () => [],
});

export const useData = () => useContext(DataContext);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const { user, session } = useAuth();
  
  // State for each entity
  const [students, setStudents] = useState<Student[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [hostelRules, setHostelRules] = useState<HostelRule[]>([]);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Load data from Supabase
  useEffect(() => {
    if (!user || !session) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        await fetchProfiles();
        await fetchRooms();
        await fetchNotices();
        await fetchServiceRequests();
        await fetchHostelRules();
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Error loading data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
    
    // Set up realtime subscriptions for data updates
    const roomsSubscription = supabase
      .channel('public:rooms')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, () => {
        fetchRooms();
      })
      .subscribe();
      
    const profilesSubscription = supabase
      .channel('public:profiles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchProfiles();
      })
      .subscribe();
      
    const noticesSubscription = supabase
      .channel('public:notices')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notices' }, () => {
        fetchNotices();
      })
      .subscribe();
      
    const serviceRequestsSubscription = supabase
      .channel('public:service_requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_requests' }, () => {
        fetchServiceRequests();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(roomsSubscription);
      supabase.removeChannel(profilesSubscription);
      supabase.removeChannel(noticesSubscription);
      supabase.removeChannel(serviceRequestsSubscription);
    };
  }, [user, session]);

  // Fetch profiles (students and admins)
  const fetchProfiles = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');
    
    if (error) {
      throw error;
    }
    
    if (data) {
      // Convert profiles to Student type
      const studentProfiles = data.map(profile => ({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        admissionNumber: profile.admission_number || '',
        department: profile.department || '',
        yearOfStudy: profile.year_of_study,
        paymentStatus: profile.payment_status || 'pending',
        roomId: null, // Will be populated when fetching room allocations
        phone: profile.phone || '',
        address: profile.address || '',
        profilePic: profile.profile_pic
      }));
      
      setStudents(studentProfiles);
      
      // Now fetch room allocations to link students to rooms
      const { data: allocations, error: allocationsError } = await supabase
        .from('room_allocations')
        .select('*')
        .eq('status', 'active')
        .eq('is_current', true);
        
      if (allocationsError) {
        throw allocationsError;
      }
      
      if (allocations && allocations.length > 0) {
        // Update student records with room assignments
        const updatedStudents = studentProfiles.map(student => {
          const allocation = allocations.find(a => a.profile_id === student.id);
          if (allocation) {
            return {
              ...student,
              roomId: allocation.room_id
            };
          }
          return student;
        });
        
        setStudents(updatedStudents);
      }
    }
  };
  
  // Fetch rooms
  const fetchRooms = async () => {
    const { data, error } = await supabase
      .from('rooms')
      .select('*');
    
    if (error) {
      throw error;
    }
    
    if (data) {
      // Convert to Room type and fetch occupants
      const roomData = await Promise.all(data.map(async room => {
        // Get active allocations for this room
        const { data: allocations } = await supabase
          .from('room_allocations')
          .select('profile_id')
          .eq('room_id', room.id)
          .eq('status', 'active')
          .eq('is_current', true);
          
        const occupants = allocations ? allocations.map(a => a.profile_id) : [];
        
        return {
          id: room.id,
          number: room.number,
          type: room.type,
          block: room.block,
          floor: room.floor,
          capacity: room.capacity,
          price: room.price,
          status: room.status,
          features: room.features || [],
          occupants
        };
      }));
      
      setRooms(roomData);
    }
  };
  
  // Fetch notices
  const fetchNotices = async () => {
    const { data, error } = await supabase
      .from('notices')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    if (data) {
      // Convert to Notice type
      const noticeData = data.map(notice => ({
        id: notice.id,
        title: notice.title,
        content: notice.content,
        date: new Date(notice.created_at).toISOString().split('T')[0],
        priority: notice.priority,
        author: notice.author_name,
        tags: notice.tags || []
      }));
      
      setNotices(noticeData);
    }
  };
  
  // Fetch service requests
  const fetchServiceRequests = async () => {
    let query = supabase
      .from('service_requests')
      .select('*, rooms(number, block)')
      .order('created_at', { ascending: false });
    
    // If user is not admin, filter by their ID
    if (user && user.user_metadata?.role !== 'admin') {
      query = query.eq('profile_id', user.id);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    if (data) {
      // Convert to ServiceRequest type
      const requestData = data.map(request => ({
        id: request.id,
        title: request.title,
        description: request.description,
        date: new Date(request.created_at).toISOString().split('T')[0],
        category: request.category,
        priority: request.priority,
        status: request.status,
        studentId: request.profile_id,
        roomId: request.room_id,
        roomNumber: request.rooms?.number,
        hostelBlock: request.rooms?.block,
        comments: request.comments || []
      }));
      
      setServiceRequests(requestData);
    }
  };
  
  // Fetch hostel rules
  const fetchHostelRules = async () => {
    const { data, error } = await supabase
      .from('hostel_rules')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    if (data) {
      // Convert to HostelRule type
      const ruleData = data.map(rule => ({
        id: rule.id,
        title: rule.title,
        description: rule.description,
        category: rule.category
      }));
      
      setHostelRules(ruleData);
    }
  };
  
  // Student methods
  const addStudent = async (student: Omit<Student, 'id'>) => {
    setIsLoading(true);
    try {
      // Create the auth user first
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: student.email,
        password: 'defaultPassword123', // Should be changed by the user
        email_confirm: true,
        user_metadata: {
          name: student.name,
          role: 'student'
        }
      });
      
      if (authError) throw authError;
      
      if (authData.user) {
        // Update the profile with student details
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            admission_number: student.admissionNumber,
            department: student.department,
            year_of_study: student.yearOfStudy,
            payment_status: 'pending'
          })
          .eq('id', authData.user.id);
          
        if (profileError) throw profileError;
        
        // Refresh profiles data
        await fetchProfiles();
      }
    } catch (err: any) {
      setError(err.message || 'Error adding student');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateStudent = async (id: string, updatedData: Partial<Student>) => {
    setIsLoading(true);
    try {
      // Update the profile
      const updateObj: any = {};
      
      if (updatedData.name) updateObj.name = updatedData.name;
      if (updatedData.admissionNumber) updateObj.admission_number = updatedData.admissionNumber;
      if (updatedData.department) updateObj.department = updatedData.department;
      if (updatedData.yearOfStudy) updateObj.year_of_study = updatedData.yearOfStudy;
      if (updatedData.paymentStatus) updateObj.payment_status = updatedData.paymentStatus;
      
      const { error } = await supabase
        .from('profiles')
        .update(updateObj)
        .eq('id', id);
        
      if (error) throw error;
      
      // Refresh profiles data
      await fetchProfiles();
    } catch (err: any) {
      setError(err.message || 'Error updating student');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  const removeStudent = async (id: string) => {
    setIsLoading(true);
    try {
      // First, deallocate any room
      const student = students.find(s => s.id === id);
      if (student && student.roomId) {
        await deallocateRoom(id, student.roomId);
      }
      
      // Then, delete the user
      const { error } = await supabase.auth.admin.deleteUser(id);
      if (error) throw error;
      
      // Refresh profiles
      await fetchProfiles();
    } catch (err: any) {
      setError(err.message || 'Error removing student');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Room methods
  const allocateRoom = async (studentId: string, roomId: string) => {
    setIsLoading(true);
    try {
      // Check if the room is available
      const room = rooms.find(r => r.id === roomId);
      if (!room) throw new Error('Room not found');
      
      if (room.status === 'maintenance') {
        throw new Error('Room is under maintenance');
      }
      
      if (room.occupants.length >= room.capacity) {
        throw new Error('Room is already full');
      }
      
      // Check if student is already allocated
      const { data: existingAllocations } = await supabase
        .from('room_allocations')
        .select('*')
        .eq('profile_id', studentId)
        .eq('is_current', true);
        
      // If allocation exists, end it
      if (existingAllocations && existingAllocations.length > 0) {
        const { error: deallocError } = await supabase
          .from('room_allocations')
          .update({
            is_current: false,
            status: 'completed',
            end_date: new Date().toISOString().split('T')[0]
          })
          .eq('profile_id', studentId)
          .eq('is_current', true);
          
        if (deallocError) throw deallocError;
      }
      
      // Create new allocation
      const { error } = await supabase
        .from('room_allocations')
        .insert({
          profile_id: studentId,
          room_id: roomId,
          start_date: new Date().toISOString().split('T')[0],
          status: 'active',
          is_current: true
        });
        
      if (error) throw error;
      
      // Check if room status needs updating
      const { data: currentAllocations } = await supabase
        .from('room_allocations')
        .select('profile_id')
        .eq('room_id', roomId)
        .eq('is_current', true)
        .eq('status', 'active');
        
      let newStatus = 'available';
      if (currentAllocations && currentAllocations.length >= room.capacity) {
        newStatus = 'full';
      }
      
      // Update room status if needed
      if (newStatus !== room.status) {
        const { error: roomError } = await supabase
          .from('rooms')
          .update({ status: newStatus })
          .eq('id', roomId);
          
        if (roomError) throw roomError;
      }
      
      // Refresh data
      await fetchRooms();
      await fetchProfiles();
    } catch (err: any) {
      setError(err.message || 'Error allocating room');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  const deallocateRoom = async (studentId: string, roomId: string) => {
    setIsLoading(true);
    try {
      // Update allocation
      const { error } = await supabase
        .from('room_allocations')
        .update({
          is_current: false,
          status: 'completed',
          end_date: new Date().toISOString().split('T')[0]
        })
        .eq('profile_id', studentId)
        .eq('room_id', roomId)
        .eq('is_current', true);
        
      if (error) throw error;
      
      // Update room status
      const room = rooms.find(r => r.id === roomId);
      if (room && room.status === 'full') {
        const { error: roomError } = await supabase
          .from('rooms')
          .update({ status: 'available' })
          .eq('id', roomId);
          
        if (roomError) throw roomError;
      }
      
      // Refresh data
      await fetchRooms();
      await fetchProfiles();
    } catch (err: any) {
      setError(err.message || 'Error deallocating room');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Service request methods
  const addServiceRequest = async (request: Omit<ServiceRequest, 'id' | 'date'>) => {
    setIsLoading(true);
    try {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('service_requests')
        .insert({
          title: request.title,
          description: request.description,
          category: request.category,
          priority: request.priority,
          status: 'pending',
          profile_id: user.id,
          room_id: request.roomId
        });
        
      if (error) throw error;
      
      // Refresh service requests
      await fetchServiceRequests();
    } catch (err: any) {
      setError(err.message || 'Error creating service request');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateServiceRequest = async (id: string, updatedData: Partial<ServiceRequest>) => {
    setIsLoading(true);
    try {
      const updateObj: any = {};
      
      if (updatedData.status) updateObj.status = updatedData.status;
      if (updatedData.comments) updateObj.comments = updatedData.comments;
      
      const { error } = await supabase
        .from('service_requests')
        .update(updateObj)
        .eq('id', id);
        
      if (error) throw error;
      
      // Refresh service requests
      await fetchServiceRequests();
    } catch (err: any) {
      setError(err.message || 'Error updating service request');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Profile methods
  const updateProfile = async (userId: string, updatedData: Partial<Student>) => {
    setIsLoading(true);
    try {
      const updateObj: any = {};
      
      if (updatedData.name) updateObj.name = updatedData.name;
      if (updatedData.department) updateObj.department = updatedData.department;
      if (updatedData.yearOfStudy) updateObj.year_of_study = updatedData.yearOfStudy;
      if (updatedData.phone) updateObj.phone = updatedData.phone;
      if (updatedData.address) updateObj.address = updatedData.address;
      
      const { error } = await supabase
        .from('profiles')
        .update(updateObj)
        .eq('id', userId);
        
      if (error) throw error;
      
      // Refresh profiles
      await fetchProfiles();
    } catch (err: any) {
      setError(err.message || 'Error updating profile');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Student specific data
  const getStudentRoom = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student || !student.roomId) return undefined;
    
    return rooms.find(r => r.id === student.roomId);
  };
  
  const getStudentPayments = async (studentId: string) => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('profile_id', studentId)
        .order('payment_date', { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        return data.map(payment => ({
          id: payment.id,
          studentId: payment.profile_id,
          amount: payment.amount,
          date: payment.payment_date,
          receiptNumber: payment.receipt_number,
          description: payment.description,
          paymentMethod: payment.payment_method,
          status: payment.status
        }));
      }
      
      return [];
    } catch (err) {
      console.error('Error fetching student payments:', err);
      return [];
    }
  };
  
  const getStudentServiceRequests = async (studentId: string) => {
    try {
      const { data, error } = await supabase
        .from('service_requests')
        .select('*, rooms(number, block)')
        .eq('profile_id', studentId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        return data.map(request => ({
          id: request.id,
          title: request.title,
          description: request.description,
          date: new Date(request.created_at).toISOString().split('T')[0],
          category: request.category,
          priority: request.priority,
          status: request.status,
          studentId: request.profile_id,
          roomId: request.room_id,
          roomNumber: request.rooms?.number,
          hostelBlock: request.rooms?.block,
          comments: request.comments || []
        }));
      }
      
      return [];
    } catch (err) {
      console.error('Error fetching student service requests:', err);
      return [];
    }
  };

  return (
    <DataContext.Provider
      value={{
        students,
        rooms,
        notices,
        serviceRequests,
        hostelRules,
        isLoading,
        error,
        addStudent,
        updateStudent,
        removeStudent,
        allocateRoom,
        deallocateRoom,
        addServiceRequest,
        updateServiceRequest,
        updateProfile,
        getStudentRoom,
        getStudentPayments,
        getStudentServiceRequests
      }}
    >
      {children}
    </DataContext.Provider>
  );
};