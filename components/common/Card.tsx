import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Colors from '@/constants/Colors';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  variant?: 'default' | 'elevated' | 'outlined' | 'flat';
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  style,
  contentStyle,
  variant = 'default',
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'default':
        return {
          backgroundColor: Colors.white,
          borderRadius: 8,
          shadowColor: Colors.black,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        };
      case 'elevated':
        return {
          backgroundColor: Colors.white,
          borderRadius: 8,
          shadowColor: Colors.black,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 4,
        };
      case 'outlined':
        return {
          backgroundColor: Colors.white,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: Colors.gray[200],
        };
      case 'flat':
        return {
          backgroundColor: Colors.gray[50],
          borderRadius: 8,
        };
    }
  };

  return (
    <View style={[styles.card, getVariantStyle(), style]}>
      {title && (
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
        </View>
      )}
      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    marginVertical: 8,
  },
  titleContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[800],
  },
  content: {
    padding: 16,
  },
});

export default Card;