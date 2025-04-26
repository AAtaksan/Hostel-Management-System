import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { ChevronRight, TriangleAlert as AlertTriangle, Bell, Info } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { Notice } from '@/types';

interface NoticeItemProps {
  notice: Notice;
  onPress?: () => void;
}

const NoticeItem: React.FC<NoticeItemProps> = ({ notice, onPress }) => {
  const getPriorityColor = () => {
    switch (notice.priority) {
      case 'high':
        return Colors.error[500];
      case 'medium':
        return Colors.warning[500];
      case 'low':
        return Colors.primary[500];
      default:
        return Colors.gray[500];
    }
  };

  const getPriorityIcon = () => {
    switch (notice.priority) {
      case 'high':
        return <AlertTriangle size={20} color={getPriorityColor()} />;
      case 'medium':
        return <Bell size={20} color={getPriorityColor()} />;
      case 'low':
        return <Info size={20} color={getPriorityColor()} />;
      default:
        return <Info size={20} color={getPriorityColor()} />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor() }]} />
      
      <View style={styles.iconContainer}>
        {getPriorityIcon()}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>{notice.title}</Text>
        <Text style={styles.date}>Posted on {formatDate(notice.date)}</Text>
        <Text 
          style={styles.preview}
          numberOfLines={2}
        >
          {notice.content}
        </Text>
        
        {notice.tags && notice.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {notice.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
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
  priorityIndicator: {
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
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[800],
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: Colors.gray[500],
    marginBottom: 4,
  },
  preview: {
    fontSize: 14,
    color: Colors.gray[600],
    marginBottom: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  tag: {
    backgroundColor: Colors.gray[100],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: Colors.gray[600],
  },
  chevronContainer: {
    justifyContent: 'center',
    paddingRight: 12,
  },
});

export default NoticeItem;