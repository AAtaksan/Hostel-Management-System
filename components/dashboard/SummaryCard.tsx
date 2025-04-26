import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import Colors from '@/constants/Colors';

interface SummaryCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  backgroundColor?: string;
  iconBackgroundColor?: string;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  icon,
  title,
  value,
  backgroundColor = Colors.primary[50],
  iconBackgroundColor = Colors.primary[100],
  style,
  onPress,
}) => {
  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent 
      style={[
        styles.container, 
        { backgroundColor },
        style
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: iconBackgroundColor }]}>
        {icon}
      </View>
      <Text style={styles.value}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </Text>
      <Text style={styles.title}>{title}</Text>
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    width: '48%',
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.gray[900],
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    color: Colors.gray[600],
  },
});

export default SummaryCard; 