import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { ChevronRight, CreditCard, Clock, CircleCheck as CheckCircle, CircleAlert as AlertCircle } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { Payment } from '@/types';

interface PaymentItemProps {
  payment: Payment;
  onPress?: () => void;
}

const PaymentItem: React.FC<PaymentItemProps> = ({ payment, onPress }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = () => {
    switch (payment.status) {
      case 'paid':
        return Colors.success[500];
      case 'pending':
        return Colors.warning[500];
      case 'overdue':
        return Colors.error[500];
      default:
        return Colors.gray[500];
    }
  };

  const getStatusIcon = () => {
    switch (payment.status) {
      case 'paid':
        return <CheckCircle size={20} color={getStatusColor()} />;
      case 'pending':
        return <Clock size={20} color={getStatusColor()} />;
      case 'overdue':
        return <AlertCircle size={20} color={getStatusColor()} />;
      default:
        return <CreditCard size={20} color={getStatusColor()} />;
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
      
      <View style={styles.iconContainer}>
        {getStatusIcon()}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.type}>{payment.type.charAt(0).toUpperCase() + payment.type.slice(1)} Fee</Text>
        <Text style={styles.amount}>{formatCurrency(payment.amount)}</Text>
        
        <View style={styles.dates}>
          <Text style={styles.date}>
            <Text style={styles.dateLabel}>Due: </Text>
            {formatDate(payment.dueDate)}
          </Text>
          
          {payment.status === 'paid' && (
            <Text style={styles.date}>
              <Text style={styles.dateLabel}>Paid: </Text>
              {formatDate(payment.date)}
            </Text>
          )}
        </View>
        
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {payment.status.toUpperCase()}
          </Text>
        </View>
      </View>
      
      <View style={styles.chevronContainer}>
        <ChevronRight size={20} color={Colors.gray[400]} />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 8,
    marginVertical: 6,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.7,
  },
  statusIndicator: {
    width: 4,
    height: '100%',
  },
  iconContainer: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 12,
  },
  type: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[800],
    marginBottom: 4,
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.gray[900],
    marginBottom: 8,
  },
  dates: {
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: Colors.gray[600],
  },
  dateLabel: {
    fontWeight: '600',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  chevronContainer: {
    justifyContent: 'center',
    paddingRight: 12,
  },
});

export default PaymentItem;