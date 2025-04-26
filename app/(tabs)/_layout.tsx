import React from 'react';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Chrome as Home, User, FileText, Bell, SquareDot as HotelSquare, Wrench, Users } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import Colors from '@/constants/Colors';

export default function TabLayout() {
  const { user, isAdmin } = useAuth();
  
  // If there's no user, the root layout will handle redirect
  if (!user) return null;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary[600],
        tabBarInactiveTintColor: Colors.gray[400],
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: Colors.gray[200],
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter-Medium',
          fontSize: 12,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      
      {isAdmin ? (
        // Admin-only tabs
        <>
          <Tabs.Screen
            name="students"
            options={{
              title: 'Students',
              tabBarIcon: ({ color, size }) => (
                <Users size={size} color={color} />
              ),
            }}
          />
          
          <Tabs.Screen
            name="rooms"
            options={{
              title: 'Rooms',
              tabBarIcon: ({ color, size }) => (
                <HotelSquare size={size} color={color} />
              ),
            }}
          />
        </>
      ) : (
        // Student-only tabs
        <>
          <Tabs.Screen
            name="notices"
            options={{
              title: 'Notices',
              tabBarIcon: ({ color, size }) => (
                <Bell size={size} color={color} />
              ),
            }}
          />
          
          <Tabs.Screen
            name="rules"
            options={{
              title: 'Rules',
              tabBarIcon: ({ color, size }) => (
                <FileText size={size} color={color} />
              ),
            }}
          />
        </>
      )}
      
      <Tabs.Screen
        name="requests"
        options={{
          title: 'Requests',
          tabBarIcon: ({ color, size }) => (
            <Wrench size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <User size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}