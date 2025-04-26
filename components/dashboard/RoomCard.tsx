import React from 'react';
import { View, Text, StyleSheet, Pressable, ImageBackground } from 'react-native';
import { DoorOpen, Users, Wifi, Wind, Droplet, Zap } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { Room } from '@/types';

interface RoomCardProps {
  room: Room;
  onPress?: () => void;
  isSelected?: boolean;
}

const RoomCard: React.FC<RoomCardProps> = ({ 
  room, 
  onPress,
  isSelected = false
}) => {
  const getStatusColor = () => {
    switch (room.status) {
      case 'available':
        return Colors.success[500];
      case 'full':
        return Colors.error[500];
      case 'maintenance':
        return Colors.warning[500];
      default:
        return Colors.gray[500];
    }
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity) {
      case 'wifi':
        return <Wifi size={16} color={Colors.gray[600]} />;
      case 'air conditioner':
        return <Wind size={16} color={Colors.gray[600]} />;
      case 'water heater':
        return <Droplet size={16} color={Colors.gray[600]} />;
      case 'fan':
        return <Wind size={16} color={Colors.gray[600]} />;
      default:
        return <Zap size={16} color={Colors.gray[600]} />;
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        isSelected && styles.selectedContainer,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <ImageBackground
        source={{ uri: 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg' }}
        style={styles.imageBackground}
        imageStyle={styles.image}
      >
        <View style={styles.overlay} />
        <View style={styles.header}>
          <View style={styles.roomInfo}>
            <Text style={styles.roomNumber}>Room {room.number}</Text>
            <Text style={styles.blockInfo}>Block {room.block}, Floor {room.floor}</Text>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.statusText}>
              {room.status.toUpperCase()}
            </Text>
          </View>
        </View>
      </ImageBackground>
      
      <View style={styles.content}>
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <DoorOpen size={16} color={Colors.primary[600]} />
            <Text style={styles.statText}>{room.type}</Text>
          </View>
          
          <View style={styles.stat}>
            <Users size={16} color={Colors.primary[600]} />
            <Text style={styles.statText}>
              {room.occupants.length}/{room.capacity}
            </Text>
          </View>
        </View>
        
        {room.amenities && room.amenities.length > 0 && (
          <View style={styles.amenitiesContainer}>
            <Text style={styles.amenitiesTitle}>Amenities</Text>
            <View style={styles.amenitiesList}>
              {room.amenities.slice(0, 4).map((amenity, index) => (
                <View key={index} style={styles.amenity}>
                  {getAmenityIcon(amenity)}
                  <Text style={styles.amenityText}>
                    {amenity.charAt(0).toUpperCase() + amenity.slice(1)}
                  </Text>
                </View>
              ))}
              {room.amenities.length > 4 && (
                <View style={styles.amenity}>
                  <Text style={styles.amenityText}>
                    +{room.amenities.length - 4} more
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  selectedContainer: {
    borderWidth: 2,
    borderColor: Colors.primary[500],
  },
  pressed: {
    opacity: 0.9,
  },
  imageBackground: {
    height: 120,
    justifyContent: 'flex-end',
  },
  image: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: 12,
  },
  roomInfo: {
    flex: 1,
  },
  roomNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.white,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  blockInfo: {
    fontSize: 14,
    color: Colors.white,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.white,
  },
  content: {
    padding: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    marginLeft: 4,
    fontSize: 14,
    color: Colors.gray[700],
  },
  amenitiesContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
    paddingTop: 12,
  },
  amenitiesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray[700],
    marginBottom: 8,
  },
  amenitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenity: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[100],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  amenityText: {
    marginLeft: 4,
    fontSize: 12,
    color: Colors.gray[700],
  },
});

export default RoomCard;