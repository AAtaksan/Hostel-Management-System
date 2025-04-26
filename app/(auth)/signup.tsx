import React from 'react';
import { View, StyleSheet, Image, SafeAreaView, ScrollView, Platform } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { Redirect } from 'expo-router';
import SignupForm from '@/components/auth/SignupForm';
import Colors from '@/constants/Colors';

export default function SignupScreen() {
  const { user } = useAuth();

  // If already logged in, redirect to the appropriate dashboard
  if (user) {
    return <Redirect href="/(tabs)/" />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.container}>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: 'https://images.pexels.com/photos/1438072/pexels-photo-1438072.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.overlay} />
          </View>
          <View style={styles.formContainer}>
            <SignupForm />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollView: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
  },
  imageContainer: {
    height: 200,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  formContainer: {
    flex: 1,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    paddingTop: 20,
    ...Platform.select({
      web: {
        maxWidth: 480,
        alignSelf: 'center',
        width: '100%',
      },
    }),
  },
});