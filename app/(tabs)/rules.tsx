import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  SectionList,
  TouchableOpacity,
  Platform,
  RefreshControl
} from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { useData } from '@/context/DataContext';
import Colors from '@/constants/Colors';
import { HostelRule } from '@/types';

type Section = {
  title: string;
  data: HostelRule[];
};

export default function RulesScreen() {
  const { hostelRules, isLoading } = useData();
  const [refreshing, setRefreshing] = useState(false);
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({
    general: true,
    security: false,
    mess: false,
    visitors: false,
    timing: false,
    other: false,
  });
  
  // Group rules by category
  const groupedRules = React.useMemo(() => {
    const grouped: Record<string, HostelRule[]> = {};
    
    hostelRules.forEach(rule => {
      const category = rule.category.toLowerCase();
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(rule);
    });
    
    return grouped;
  }, [hostelRules]);
  
  // Create sections for SectionList
  const sections: Section[] = React.useMemo(() => {
    return Object.keys(groupedRules).map(category => ({
      title: category.charAt(0).toUpperCase() + category.slice(1),
      data: expandedSections[category] ? groupedRules[category] : [],
    }));
  }, [groupedRules, expandedSections]);
  
  const toggleSection = (category: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };
  
  const refreshData = useCallback(async () => {
    // The actual refresh happens in the DataContext
    // We just need to show the loading state here
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);
  
  const renderSectionHeader = ({ section }: { section: Section }) => {
    const category = section.title.toLowerCase();
    const isExpanded = expandedSections[category];
    
    return (
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => toggleSection(category)}
      >
        <Text style={styles.sectionTitle}>{section.title} Rules</Text>
        {isExpanded ? (
          <ChevronUp size={20} color={Colors.gray[600]} />
        ) : (
          <ChevronDown size={20} color={Colors.gray[600]} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hostel Rules & Guidelines</Text>
      </View>
      
      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        renderSectionHeader={renderSectionHeader}
        renderItem={({ item }) => (
          <View style={styles.ruleContainer}>
            <Text style={styles.ruleTitle}>{item.title}</Text>
            <Text style={styles.ruleDescription}>{item.description}</Text>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled
        refreshControl={
          <RefreshControl
            refreshing={refreshing || isLoading}
            onRefresh={refreshData}
            colors={[Colors.primary[600]]}
            tintColor={Colors.primary[600]}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  header: {
    backgroundColor: Colors.white,
    paddingTop: Platform.OS === 'ios' ? 0 : 40,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.gray[900],
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionHeader: {
    backgroundColor: Colors.white,
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.gray[800],
  },
  ruleContainer: {
    backgroundColor: Colors.white,
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    marginLeft: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary[500],
  },
  ruleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[800],
    marginBottom: 8,
  },
  ruleDescription: {
    fontSize: 14,
    color: Colors.gray[600],
    lineHeight: 20,
  },
});