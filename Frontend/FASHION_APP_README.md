# Fashion E-Commerce Mobile App

A modern, feature-rich fashion e-commerce mobile application built with React Native and Expo.

## 🎨 Design Features

### Primary Colors & Styling
- **Primary Orange**: `#FF6B00` - All action buttons and highlights
- **White Backgrounds**: Clean, minimal design
- **Rounded Corners**: 12-16px border radius throughout
- **Modern Typography**: Clean sans-serif fonts with iOS-style design
- **Subtle Shadows**: Depth through light shadows on cards

### UI Components
- Product cards with wishlist hearts
- Orange promotional banners (40% off)
- Category filtering tabs
- Size and color selectors
- Quantity controls (+/- buttons)
- Clean navigation with icons

## 📱 Main Screens

### 1. **Home Screen**
Located at: `/fashion/home.tsx`

Features:
- User avatar with greeting message
- Notification and cart icons (with badge count)
- Search bar with filter icon
- Horizontal category tabs (All, Men, Women, Girls)
- Orange promotional banner
- 2-column product grid with wishlist hearts
- Bottom navigation: Home, Shopping, Wishlist, Account

### 2. **Shopping Screen**
Located at: `/fashion/shopping.tsx`

Features:
- Identical header and navigation as Home
- Complete product grid with all products
- Current price and strikethrough original prices
- Orange "Add to Cart" buttons (on product details)
- Promotional banners interspersed in grid
- Category filtering capabilities

### 3. **Product Details Screen**
Located at: `/fashion/productDetails.tsx`

Features:
- Back button and share icon
- Large product image
- Color variant thumbnails with selection
- Product name, category, and pricing
- Size selector (S, M, L, XL)
- Quantity +/- buttons
- Detailed product description
- "Learn More" link
- Dual action buttons:
  - "Add To Cart" (outlined orange)
  - "Buy Now" (filled orange)

## 🛒 Shopping Features

### Category Tabs
- Horizontal scrolling navigation
- Active state highlighted in orange
- Quick filtering: All, Men, Women, Girls

### Product Cards
- High-quality image display
- Product name and category
- Price with discount visualization
- Wishlist toggle (heart icon)
- Clean card layout with shadows

### Wishlist System
- Toggle wishlist status on any product
- Persistent wishlist tracking
- Visual heart indicator
- Dedicated wishlist screen

### Cart Management
- Add products with size/color selection
- Quantity adjustment
- Real-time cart count badge
- Cart context for state management

## 📂 Project Structure

```
/auth
  /app
    /fashion/
      _layout.tsx           # Bottom tab navigation
      home.tsx              # Home screen with products
      shopping.tsx          # Shopping screen
      productDetails.tsx    # Product detail view
      wishlist.tsx          # Wishlist screen
      account.tsx           # Account screen
      cart.tsx              # Shopping cart
      checkout.tsx          # Checkout flow
    fashionStore.tsx        # Landing page
    _layout.tsx             # Main app layout with routing
  /components/fashion/
    FashionHeader.tsx       # Top header with avatar & icons
    CategoryTabs.tsx        # Category filtering
    ProductCard.tsx         # Product card component
    PromobannBanner.tsx     # Promotional banner
  /context/
    FashionContext.tsx      # Cart & wishlist state management
  /constants/
    fashionData.ts          # Products, categories, colors
```

## 🎯 Key Functionality

### Navigation
- Bottom tab navigation (Home, Shopping, Wishlist, Account)
- Stack navigation for product details
- Deep linking support
- Smooth transitions

### State Management
- **FashionContext**: Manages cart items and wishlist
- Add to cart with size/color/quantity
- Toggle wishlist items
- Cart count badge updates

### Product Data
- 6 pre-loaded products across categories
- Product variants (colors, sizes)
- Price information with discounts
- Product ratings and descriptions

## 🚀 Getting Started

### Installation
1. Navigate to the auth folder:
   ```bash
   cd auth
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the app:
   ```bash
   npm start
   ```

### Running on Device
- **iOS**: Press `i` in terminal
- **Android**: Press `a` in terminal
- **Web**: Press `w` in terminal

## 🎨 Color Palette

| Color | Hex Value | Usage |
|-------|-----------|-------|
| Primary Orange | #FF6B00 | Buttons, active states, highlights |
| White | #FFFFFF | Backgrounds |
| Black | #000000 | Text |
| Light Gray | #E8E8E8 | Borders, inactive states |
| Dark Gray | #666666 | Secondary text |
| Background Gray | #F5F5F5 | Card backgrounds |

## 📦 Dependencies

- `expo-router`: Navigation
- `@react-navigation/native`: Navigation core
- `@react-navigation/bottom-tabs`: Tab navigation
- `expo-icons`: Icon library
- `react-native`: Core framework
- `typescript`: Type safety

## 🔄 Data Flow

1. **Product Display**:
   - Products stored in `fashionData.ts`
   - Filtered by category in screens
   - Displayed in 2-column grid

2. **Wishlist Management**:
   - Toggle via ProductCard heart icon
   - State stored in FashionContext
   - Persisted across screens

3. **Cart Operations**:
   - Add products with size/color/quantity
   - Real-time count badge
   - Context-based state management

## ✨ Features Implemented

- ✅ 3 main shopping screens
- ✅ Product filtering by category
- ✅ Wishlist functionality
- ✅ Size and color selection
- ✅ Quantity adjustment
- ✅ Cart management
- ✅ Responsive design
- ✅ Bottom navigation
- ✅ Product details view
- ✅ Promotional banners
- ✅ Search bar UI
- ✅ Filter icon

## 🎯 Next Steps (Optional Enhancements)

- [ ] Integrate actual search functionality
- [ ] Backend API integration
- [ ] User authentication
- [ ] Payment processing
- [ ] Order history
- [ ] Product reviews
- [ ] Real-time inventory
- [ ] Push notifications

## 📝 Notes

- Placeholder images are used via placeholder.com
- Product data is hardcoded for demo purposes
- This is a client-side implementation without backend
- All styling follows iOS design guidelines
- Responsive design works on all screen sizes

---

Built with ❤️ using React Native & Expo
