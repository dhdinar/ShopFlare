export const COLORS = {
  primary: '#FF6B00', // Orange
  white: '#FFFFFF',
  black: '#000000',
  gray: '#F5F5F5',
  lightGray: '#E8E8E8',
  darkGray: '#666666',
};

// Main fashion categories
export const FASHION_CATEGORIES = [
  { id: 'men', name: 'Men', icon: 'man-outline' },
  { id: 'women', name: 'Women', icon: 'woman-outline' },
  { id: 'children', name: 'Children', icon: 'happy-outline' },
] as const;

// Subcategories per main category
export const FASHION_SUBCATEGORIES: Record<string, string[]> = {
  Men: [
    'T-Shirts',
    'Shirts',
    'Jeans',
    'Trousers',
    'Panjabi',
    'Jackets',
    'Suits',
    'Shorts',
    'Innerwear',
    'Sportswear',
    'Ethnic Wear',
    'Accessories',
  ],
  Women: [
    'Saree',
    'Kurti',
    'Salwar Suit',
    'Lehenga',
    'Dresses',
    'Tops',
    'Jeans',
    'Skirts',
    'Blouses',
    'Ethnic Wear',
    'Western Wear',
    'Activewear',
    'Lingerie',
    'Accessories',
  ],
  Children: [
    'T-Shirts',
    'Dresses',
    'Jeans',
    'Shorts',
    'Ethnic Wear',
    'School Uniform',
    'Sleepwear',
    'Winterwear',
    'Innerwear',
    'Accessories',
  ],
};

// Flat list of all category options for filter tabs
export const FILTER_CATEGORIES = ['All', 'Men', 'Women', 'Children'];

// Combined category + subcategory label (e.g. "Women > Saree")
export const getAllSubcategories = (): { category: string; subcategory: string; label: string }[] => {
  const result: { category: string; subcategory: string; label: string }[] = [];
  for (const [category, subs] of Object.entries(FASHION_SUBCATEGORIES)) {
    for (const sub of subs) {
      result.push({ category, subcategory: sub, label: `${category} > ${sub}` });
    }
  }
  return result;
};

export const CATEGORIES = ['All', 'Men', 'Women', 'Children'];
