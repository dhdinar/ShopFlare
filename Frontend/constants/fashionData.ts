export const COLORS = {
  primary: '#FF6B00', // Orange
  white: '#FFFFFF',
  black: '#000000',
  gray: '#F5F5F5',
  lightGray: '#E8E8E8',
  darkGray: '#666666',
};

export const CATEGORIES = ['All', 'Men', 'Women', 'Girls'];

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  colors: string[];
  sizes: string[];
  description: string;
  rating: number;
}

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Classic White T-Shirt',
    category: 'Men',
    price: 29.99,
    originalPrice: 49.99,
    image: 'https://via.placeholder.com/300x400/ffffff/FF6B00?text=T-Shirt+White',
    colors: ['#FFFFFF', '#000000', '#FF6B00'],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Premium quality white t-shirt made from 100% organic cotton. Comfortable fit perfect for everyday wear.',
    rating: 4.5,
  },
  {
    id: '2',
    name: 'Elegant Black Dress',
    category: 'Women',
    price: 89.99,
    originalPrice: 149.99,
    image: 'https://via.placeholder.com/300x400/000000/FF6B00?text=Black+Dress',
    colors: ['#000000', '#FF6B00', '#8B0000'],
    sizes: ['XS', 'S', 'M', 'L'],
    description: 'Sophisticated black dress perfect for any occasion. Made with premium fabric blend.',
    rating: 4.8,
  },
  {
    id: '3',
    name: 'Casual Jeans',
    category: 'Men',
    price: 59.99,
    originalPrice: 99.99,
    image: 'https://via.placeholder.com/300x400/4A5568/FF6B00?text=Jeans',
    colors: ['#4A5568', '#1a3a52', '#5a6a78'],
    sizes: ['28', '30', '32', '34', '36'],
    description: 'Classic denim jeans with perfect fit and durability. Great for casual styling.',
    rating: 4.6,
  },
  {
    id: '4',
    name: 'Summer Floral Dress',
    category: 'Girls',
    price: 39.99,
    originalPrice: 69.99,
    image: 'https://via.placeholder.com/300x400/FFB6C1/FF6B00?text=Floral+Dress',
    colors: ['#FFB6C1', '#FFE4E1', '#FFC0CB'],
    sizes: ['XS', 'S', 'M'],
    description: 'Adorable floral dress perfect for sunny days. Lightweight and breathable.',
    rating: 4.7,
  },
  {
    id: '5',
    name: 'Polo Shirt',
    category: 'Men',
    price: 44.99,
    originalPrice: 74.99,
    image: 'https://via.placeholder.com/300x400/87CEEB/FF6B00?text=Polo+Shirt',
    colors: ['#87CEEB', '#FFFFFF', '#FF6B00'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    description: 'Classic polo shirt with embroidered logo. Perfect for casual office wear.',
    rating: 4.4,
  },
  {
    id: '6',
    name: 'Athletic Leggings',
    category: 'Women',
    price: 49.99,
    originalPrice: 79.99,
    image: 'https://via.placeholder.com/300x400/1a1a1a/FF6B00?text=Leggings',
    colors: ['#1a1a1a', '#330033', '#1a3a1a'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description: 'High-waisted leggings with great stretch and support. Perfect for workouts.',
    rating: 4.9,
  },
];
