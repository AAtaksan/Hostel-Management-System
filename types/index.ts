export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  profilePic?: string;
  phone?: string;
  address?: string;
  department?: string;
  yearOfStudy?: number;
}

export interface Student extends User {
  role: 'student';
  roomId: string | null;
  roomNumber?: string;
  hostelBlock?: string;
  admissionNumber: string;
  paymentStatus: 'paid' | 'pending' | 'partial' | 'overdue';
  paymentHistory?: Payment[];
}

export interface Admin extends User {
  role: 'admin';
  position?: string;
  department: string;
}

export interface Room {
  id: string;
  number: string;
  block: string;
  floor: number;
  capacity: number;
  occupants: string[]; // Student IDs
  type: string;
  features: any[]; // Changed from amenities to features to match DB schema
  status: 'available' | 'full' | 'maintenance';
  price: number;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  priority: 'low' | 'medium' | 'high';
  tags?: string[];
}

export interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  category: 'maintenance' | 'cleaning' | 'security' | 'other';
  status: 'pending' | 'in-progress' | 'resolved' | 'rejected';
  date: string;
  studentId: string;
  roomId: string;
  roomNumber?: string;
  hostelBlock?: string;
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
  comments?: Comment[];
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  date: string;
}

export interface Payment {
  id: string;
  studentId: string;
  amount: number;
  date: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  description?: string;
  receiptNumber?: string;
  paymentMethod: string;
  dueDate?: string;
  type?: string;
}

export interface HostelRule {
  id: string;
  title: string;
  description: string;
  category: string;
}