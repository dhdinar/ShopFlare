import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { COLORS, CATEGORIES } from '@/constants/fashionData';

interface CategoryTabsProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({ selectedCategory, onSelectCategory }) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {CATEGORIES.map((category) => (
        <TouchableOpacity
          key={category}
          onPress={() => onSelectCategory(category)}
          style={[
            styles.tab,
            selectedCategory === category && styles.tabActive,
          ]}
        >
          <Text
            style={[
              styles.tabText,
              selectedCategory === category && styles.tabTextActive,
            ]}
          >
            {category}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    paddingVertical: 8,
  },
  content: {
    paddingHorizontal: 16,
    gap: 12,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.gray,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  tabTextActive: {
    color: COLORS.white,
  },
});
