# 🎨 Fashion E-Commerce - Visual Design Reference

## Color Palette

```
┌─────────────────────────────────┐
│ Primary Orange     #FF6B00      │  ← Action buttons, highlights
│ ███████████████████████████     │
├─────────────────────────────────┤
│ White             #FFFFFF       │  ← Main backgrounds
│ ███████████████████████████     │
├─────────────────────────────────┤
│ Light Gray        #F5F5F5       │  ← Card backgrounds
│ ███████████████████████████     │
├─────────────────────────────────┤
│ Border Gray       #E8E8E8       │  ← Borders, dividers
│ ███████████████████████████     │
├─────────────────────────────────┤
│ Dark Gray         #666666       │  ← Secondary text
│ ███████████████████████████     │
├─────────────────────────────────┤
│ Black             #000000       │  ← Primary text
│ ███████████████████████████     │
└─────────────────────────────────┘
```

---

## Typography

```
HEADLINES:
  Font Size: 24px | Weight: 700 | Color: Black
  Example: "Fashion E-Commerce"

SUBHEADINGS:
  Font Size: 18-20px | Weight: 700 | Color: Black
  Example: "Product Name"

BODY TEXT:
  Font Size: 14px | Weight: 500 | Color: Dark Gray
  Example: "Product description text"

SMALL TEXT:
  Font Size: 12px | Weight: 400 | Color: Dark Gray
  Example: "Category label"

ACCENT TEXT (Buttons):
  Font Size: 16px | Weight: 700 | Color: White
  Example: "Add To Cart"
```

---

## Component Spacing

```
Card Padding:      16px (horizontal), 12px (vertical)
Component Gap:     12px standard
Border Radius:     12-16px (cards), 8px (buttons)
Button Height:     48-56px
Touch Target:      44pt minimum
Shadows:          Subtle (0.1 opacity)
```

---

## Header Design

```
┌────────────────────────────────────────┐
│  👤 Sarah          🔔    🛍️(3)         │
│  avatar  username  notif  cart+badge   │
│  greeting                              │
│  "Good Morning"                        │
└────────────────────────────────────────┘

Avatar:        44x44px, circular, gray background
Notification:  24x24px icon
Cart Icon:     24x24px icon + red badge (top-right)
Badge:         20x20px circle, orange background
```

---

## Product Card Layout

```
┌────────────────────────┐
│                        │
│    [Product Image]     │  Aspect Ratio: 3:4
│                        │
│  ❤️ (top-right corner) │
├────────────────────────┤
│ Category Label         │  12px, gray
│ Product Name...        │  14px bold, 2 lines max
│ $29.99  $49.99         │  Price + strikethrough
│                        │
└────────────────────────┘

Shadow:  Subtle elevation
Corner:  12px border radius
Card:    White background
```

---

## Category Tab Design

```
Inactive Tab:           Active Tab:
┌──────────────┐        ┌──────────────┐
│   Category   │        │   Category   │
├──────────────┤        ├──────────────┤
│ Background:  │        │ Background:  │
│ Light Gray   │        │ Orange       │
│ Text:        │        │ Text:        │
│ Dark Gray    │        │ White        │
└──────────────┘        └──────────────┘

Padding:       16px horizontal, 8px vertical
Border Radius: 20px (full rounded)
Border:        1px light gray / orange
```

---

## Button Designs

```
PRIMARY (Orange Filled):
┌──────────────────────────┐
│   Add To Cart Button     │  Background: Orange (#FF6B00)
│        🟠               │  Text: White, 16px bold
└──────────────────────────┘  Padding: 14px vertical
  Padding: 24px horizontal
  Border Radius: 12px

SECONDARY (Orange Outline):
┌──────────────────────────┐
│   Add To Cart Button     │  Background: Transparent
│                         │  Border: 2px Orange
│                         │  Text: Orange, 16px bold
└──────────────────────────┘  Padding: 14px vertical
  Padding: 24px horizontal
  Border Radius: 12px

TERTIARY (Gray):
┌──────────────────────────┐
│      Browse Button       │  Background: Light Gray
└──────────────────────────┘  Text: Dark Gray
  Padding: 12px vertical
  Padding: 24px horizontal
  Border Radius: 8px
```

---

## Promo Banner Design

```
┌─────────────────────────────────────────┐
│ 40% Sale             🎉                 │
│ On All Items                            │
│                                         │
│ [Shop Now →] (optional CTA)             │
├─────────────────────────────────────────┤
│ Background:  Orange (#FF6B00)           │
│ Text:        White, bold                │
│ Emoji:       Large decorative           │
│ Shadow:      Orange glow                │
│ Radius:      12px                       │
│ Padding:     20px                       │
│ Height:      120px                      │
└─────────────────────────────────────────┘
```

---

## Size/Color Selector Design

```
SIZE SELECTOR:
┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
│  S  │ │  M  │ │  L  │ │ XL  │
├─────┤ ├─────┤ ├─────┤ ├─────┤
│ All │ │ All │ │Orange│ │ All │
│Gray │ │Gray │ │Back  │ │Gray │
│Text │ │Text │ │White │ │Text │
└─────┘ └─────┘ └─────┘ └─────┘
         Active   (Selected)

Inactive: Light gray background, dark gray text, 1px border
Active:   Orange background, white text, orange border

WIDTH:    50px | HEIGHT: 50px | RADIUS: 8px


COLOR SELECTOR:
⭕ ⭕ ⭕
All circular, 50x50px, border indicators

Inactive: 2px light gray border
Active:   3px orange border + checkmark

SPACING: 12px gap
```

---

## Quantity Control Design

```
┌──────┬──────┬──────┐
│  −   │  1   │  +   │
├──────┼──────┼──────┤
│ Tap  │ Show │ Tap  │
│ −1   │count │ +1   │
└──────┴──────┴──────┘

Background:   White
Border:       1px light gray
Each section: 40px height
Font:         Bold, 16px
Buttons:      White background on press
```

---

## Search Bar Design

```
┌─────────────────────────────────────┐
│ 🔍  Search products...  🔽          │
├─────────────────────────────────────┤
│ Background:  Light Gray (#F5F5F5)   │
│ Icon Left:   Search icon, 20px      │
│ Input:       14px, no border        │
│ Icon Right:  Filter/funnel, 20px    │
│ Padding:     12px horizontal        │
│ Height:      44px                   │
│ Radius:      12px                   │
└─────────────────────────────────────┘
```

---

## Grid Layout

```
2-COLUMN PRODUCT GRID:

┌──────────┬──────────┐
│ Product1 │ Product2 │
├──────────┼──────────┤
│ Product3 │ Product4 │
├──────────┼──────────┤
│ Product5 │ Product6 │
└──────────┴──────────┘

Columns:      2 equal width
Margin:       8px (card margin)
Padding:      16px horizontal (container)
Row Gap:      16px
Column Gap:   16px
```

---

## Bottom Navigation

```
┌────────────┬────────────┬────────────┬────────────┐
│   🏠 Home  │  🛍️ Shop   │   ❤️ Wish  │  👤 Acct   │
├────────────┼────────────┼────────────┼────────────┤
│ Active:    │ Inactive:  │ Active:    │ Inactive:  │
│ Orange     │ Gray       │ Orange     │ Gray       │
│ Text       │ Text       │ Text       │ Text       │
└────────────┴────────────┴────────────┴────────────┘

Height:       60px
Icon Size:    24px
Font:         12px, 600 weight
Active Color: Orange (#FF6B00)
Inactive:     Dark Gray (#666666)
Background:   White
Border Top:   1px light gray separator
Padding:      8px vertical
```

---

## Product Details Layout

```
┌─────────────────────────────────────┐
│ ← Back                   Share ↗️    │
├─────────────────────────────────────┤
│                                     │
│        [Large Product Image]        │
│                                     │
├─────────────────────────────────────┤
│ ⭕ ⭕ ⭕ (Color variants)            │
├─────────────────────────────────────┤
│ Category Badge                      │
│ Product Name                        │
│ $29.99  $49.99 ⭐ 4.5              │
├─────────────────────────────────────┤
│ Size: [S] [M] [L] [XL]            │
├─────────────────────────────────────┤
│ Quantity: [-] 1 [+]                │
├─────────────────────────────────────┤
│ Description                         │
│ Premium quality product...          │
│ Learn More →                        │
├─────────────────────────────────────┤
│ [Add To Cart]  [Buy Now 🟠]        │
└─────────────────────────────────────┘

Scrollable content
Sticky buttons at bottom (optional)
40px side padding
16px gap between sections
```

---

## Responsive Breakpoints

```
Mobile (All devices):
- Width: 320px - 428px
- No horizontal scroll (except categories)
- Full-width layouts
- Touch-optimized spacing

Tablet (Optional future):
- 3+ column grids
- Larger cards
- Side panels
```

---

## Icon System

Using: **Expo Vector Icons (Ionicons)**

```
Common Icons Used:
🏠 home            - Home tab
🛍️  bag             - Shopping/cart
❤️  heart/outline   - Wishlist
👤 person           - Account
🔔 notifications    - Alerts
🔍 search           - Search
🔽 funnel           - Filter
←  chevron-back     - Back button
↗️  share-social     - Share
+ checkmark         - Selection indicator
```

---

## Shadows & Elevation

```
CARD SHADOW:
Color:    Black
Offset:   X: 0, Y: 2px
Opacity:  0.1
Radius:   3px
Elevation: 3 (Android)

BANNER SHADOW:
Color:    Orange (#FF6B00)
Offset:   X: 0, Y: 4px
Opacity:  0.3
Radius:   4px
Elevation: 4 (Android)
```

---

## Animation Guidelines

```
Tab Transitions:  None (instant)
Screen Push:      Smooth slide
Modal Present:    Fade in
Button Press:     Scale 0.98
Wishlist Toggle:  Instant + scale
```

---

## Accessibility

```
Minimum Touch Target:  44px (iOS guideline)
Color Contrast:        7:1 for text
Icon Size Minimum:     24px
Font Size Minimum:     14px for body
Button Labels:         Descriptive text
```

---

## Implementation Notes

1. All measurements in density-independent pixels (dp)
2. Use `StyleSheet.create()` for performance
3. Test on iPhone 14/15 and Android devices
4. Ensure safe area insets on notched devices
5. Use `showsVerticalScrollIndicator={false}` for clean look
6. Implement haptic feedback on button taps (optional)

---

**This visual guide ensures pixel-perfect implementation across the entire app!**
