import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import Loading from '@/components/common/Loading';

export default function Index() {
  const { user, isLoading } = useAuth();

  // Show loading indicator while checking authentication status
  if (isLoading) {
    return <Loading fullScreen text="Loading..." />;
  }

  // Redirect based on authentication status
  if (user) {
    return <Redirect href="/(tabs)/" />;
  } else {
    return <Redirect href="/login" />;
  }
}