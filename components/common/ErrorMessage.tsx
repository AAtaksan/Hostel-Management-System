import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { CircleAlert as AlertCircle, X } from 'lucide-react-native';
import Colors from '@/constants/Colors';

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
  showIcon?: boolean;
  style?: any;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onDismiss,
  showIcon = true,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {showIcon && (
        <AlertCircle size={20} color={Colors.error[500]} style={styles.icon} />
      )}
      <Text style={styles.message}>{message}</Text>
      {onDismiss && (
        <Pressable onPress={onDismiss} style={styles.dismissButton}>
          <X size={16} color={Colors.error[500]} />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.error[50],
    borderLeftWidth: 4,
    borderLeftColor: Colors.error[500],
    padding: 12,
    marginVertical: 8,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  message: {
    flex: 1,
    fontSize: 14,
    color: Colors.error[700],
  },
  dismissButton: {
    padding: 4,
  },
});

export default ErrorMessage;