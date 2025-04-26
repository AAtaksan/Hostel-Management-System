import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView 
} from 'react-native';
import Colors from '@/constants/Colors';

// SelectOption interface
interface SelectOption {
  value: string;
  label: string;
}

// SelectProps interface
interface SelectProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

// Select component
export const Select: React.FC<SelectProps> = ({
  label,
  value,
  options,
  onChange,
  error,
  required = false,
}) => {
  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
      )}
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.selectContainer}
      >
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.selectOption,
              value === option.value && styles.selectOptionSelected,
            ]}
            onPress={() => onChange(option.value)}
          >
            <Text
              style={[
                styles.selectOptionText,
                value === option.value && styles.selectOptionTextSelected,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

// RadioButtonGroupProps interface
interface RadioButtonGroupProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  direction?: 'row' | 'column';
}

// Radio Button Group component
export const RadioButtonGroup: React.FC<RadioButtonGroupProps> = ({
  label,
  value,
  options,
  onChange,
  error,
  required = false,
  direction = 'row',
}) => {
  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
      )}
      
      <View
        style={[
          styles.radioContainer,
          direction === 'column' && styles.radioContainerColumn,
        ]}
      >
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.radioOption,
              direction === 'column' && styles.radioOptionColumn,
            ]}
            onPress={() => onChange(option.value)}
          >
            <View style={styles.radioCircle}>
              {value === option.value && <View style={styles.radioCircleFilled} />}
            </View>
            <Text style={styles.radioText}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

// CheckboxProps interface
interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
}

// Checkbox component
export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onChange,
  error,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.checkboxContainer} 
        onPress={() => onChange(!checked)}
      >
        <View style={[
          styles.checkbox,
          checked && styles.checkboxChecked,
        ]}>
          {checked && <View style={styles.checkboxInner} />}
        </View>
        <Text style={styles.checkboxLabel}>{label}</Text>
      </TouchableOpacity>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

// FormGroup component
interface FormGroupProps {
  children: React.ReactNode;
  style?: any;
}

export const FormGroup: React.FC<FormGroupProps> = ({ children, style }) => {
  return (
    <View style={[styles.formGroup, style]}>
      {children}
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    color: Colors.gray[700],
    fontWeight: '500',
  },
  required: {
    color: Colors.error[500],
  },
  errorText: {
    color: Colors.error[500],
    fontSize: 12,
    marginTop: 4,
  },
  selectContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  selectOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    backgroundColor: Colors.white,
  },
  selectOptionSelected: {
    backgroundColor: Colors.primary[50],
    borderColor: Colors.primary[600],
  },
  selectOptionText: {
    color: Colors.gray[700],
    fontWeight: '500',
  },
  selectOptionTextSelected: {
    color: Colors.primary[700],
    fontWeight: '600',
  },
  radioContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  radioContainerColumn: {
    flexDirection: 'column',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  radioOptionColumn: {
    marginBottom: 12,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.gray[400],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  radioCircleFilled: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary[600],
  },
  radioText: {
    color: Colors.gray[700],
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.gray[400],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    borderColor: Colors.primary[600],
    backgroundColor: Colors.primary[50],
  },
  checkboxInner: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: Colors.primary[600],
  },
  checkboxLabel: {
    color: Colors.gray[700],
  },
  formGroup: {
    marginBottom: 20,
  },
}); 