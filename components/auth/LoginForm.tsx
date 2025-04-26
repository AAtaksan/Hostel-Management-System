import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import ErrorMessage from '@/components/common/ErrorMessage';
import { useAuth } from '@/context/AuthContext';
import Colors from '@/constants/Colors';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const { login, isLoading, error } = useAuth();

  const validateForm = () => {
    let isValid = true;
    
    // Validate email
    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    } else {
      setEmailError('');
    }
    
    // Validate password
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    } else {
      setPasswordError('');
    }
    
    return isValid;
  };

  const handleLogin = async () => {
    if (validateForm()) {
      try {
        await login(email, password);
        // The auth context will redirect after login
      } catch (err) {
        // Error is handled in the auth context
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <Text style={styles.subtitle}>
        Welcome back! Please login to continue.
      </Text>
      
      {error && <ErrorMessage message={error} />}
      
      <Input
        label="Email"
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        error={emailError}
        keyboardType="email-address"
        autoCapitalize="none"
        required
      />
      
      <Input
        label="Password"
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        error={passwordError}
        required
      />
      
      <View style={styles.forgotContainer}>
        <TouchableOpacity>
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>
      
      <Button
        title="Login"
        onPress={handleLogin}
        loading={isLoading}
        fullWidth
      />
      
      <View style={styles.signupContainer}>
        <Text style={styles.signupText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/signup')}>
          <Text style={styles.signupLink}>Sign Up</Text>
        </TouchableOpacity>
      </View>

      {/* Demo login shortcuts */}
      <View style={styles.demoContainer}>
        <Text style={styles.demoTitle}>Demo Logins:</Text>
        <View style={styles.demoButtons}>
          <TouchableOpacity 
            style={styles.demoButton} 
            onPress={() => {
              setEmail('john.doe@example.com');
              setPassword('password123');
            }}
          >
            <Text style={styles.demoButtonText}>Student</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.demoButton} 
            onPress={() => {
              setEmail('robert.a@example.com');
              setPassword('password123');
            }}
          >
            <Text style={styles.demoButtonText}>Admin</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.gray[900],
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray[600],
    marginBottom: 24,
  },
  forgotContainer: {
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  forgotText: {
    color: Colors.primary[600],
    fontSize: 14,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  signupText: {
    color: Colors.gray[600],
    fontSize: 14,
  },
  signupLink: {
    color: Colors.primary[600],
    fontSize: 14,
    fontWeight: '600',
  },
  demoContainer: {
    marginTop: 40,
    padding: 16,
    backgroundColor: Colors.gray[50],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray[800],
    marginBottom: 8,
  },
  demoButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  demoButton: {
    backgroundColor: Colors.primary[100],
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  demoButtonText: {
    color: Colors.primary[700],
    fontWeight: '500',
    fontSize: 12,
  },
});

export default LoginForm;