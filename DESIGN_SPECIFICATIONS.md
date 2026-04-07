# Telkomsel App - Design Specifications (SVG Reference Analysis)

## Overview
Exact design specifications extracted from the provided SVG reference files in the `telkomsel/` folder. All values are pixel-based from 375px viewport width.

---

## Color Palette

### Primary Colors
- **Telkomsel Red (Primary)**: `#EC2028` (formerly #EC2029)
  - Used for: Main header backgrounds, action buttons, status indicators, icons
  - RGB: 236, 32, 40

- **Telkomsel Orange**: `#FF6B35`
  - Used for: Gradient start point, secondary accents
  - RGB: 255, 107, 53

- **White**: `#FFFFFF`
  - Used for: Text, icons, backgrounds
  - RGB: 255, 255, 255

### Secondary Colors
- **Dark Gray/Text**: `#1E272E` (also `#1D1819`)
  - Used for: Body text, secondary text, descriptions
  - RGB: 30, 39, 46

- **Light Gray**: `#CED6E0`
  - Used for: Input borders, dividers, subtle backgrounds
  - RGB: 206, 214, 224

- **Medium Gray**: `#747D8C` (also `#A4B0BE`)
  - Used for: Secondary labels, placeholder text, icon backgrounds
  - RGB: 116, 125, 140

- **Soft Pink/Rose**: `#F9D4DB`
  - Used for: Decorative header curves, accent backgrounds
  - RGB: 249, 212, 219

- **Light Background**: `#F1F2F6`
  - Used for: Card backgrounds, subtle backgrounds
  - RGB: 241, 242, 246

---

## Screen Specifications

### 1. SPLASH SCREEN (Splash.svg)
**Dimensions**: 375 × 1908px (scrollable content area)

**Color Scheme**:
- Main Background: Linear gradient `#FF6B35 → #EC2028` (135deg)
- All text: White (#FFFFFF)

**Components**:
- **Status Bar** (Top): 375 × 44px
  - Contains: Signal strength, WiFi icon, battery indicator
  - Color: Same gradient background
  - Text color: White
  
- **Logo Area**:
  - Displays: MyTelkomsel branding
  - Position: Centered
  - Styling: Large icon/image element
  
- **Loading Bar**:
  - Visual progress indicator
  - Color: White or light color on red background
  
- **Typography**:
  - Main: "MyTelkomsel" text, centered
  - Font size: Large (appears to be 24px or greater)
  - Color: White
  - Font weight: Bold

**Layout**:
- Full-width container: 375px
- Centered flex layout with gradient background
- Padding: 0 (full height utilization)

---

### 2. LOGIN SCREENS (Login.svg, Login-1.svg, Login-2.svg, Login-3.svg)
**All Screens**: 375 × 812px (single viewport)

**Color Scheme**:
- Background: White (#FFFFFF)
- Input Borders: `#CED6E0` (light gray)
- Header Accents: `#F9D4DB` (soft pink, curved design element)
- Icons/Illustrations: Red (#EC2028)
- Text: Dark gray (`#1E272E`)

**Login Flow**:

### Stage 1: MSISDN Entry (Login.svg / Login-1.svg)
- **Header**:
  - Curved pink design element at top
  - No action bar needed
  
- **Form Content**:
  - Input field: 
    - Height: ~40-45px
    - Border: 1px solid `#CED6E0`
    - Border-radius: ~4px
    - Placeholder text color: `#747D8C`
    
  - Button (Primary Action):
    - Background: `#EC2028`
    - Text: White
    - Height: ~44px
    - Border-radius: ~4px
    - Font weight: Bold
    
- **Typography**:
  - Labels: Dark gray (`#1E272E`), font-size: ~14px
  - Input placeholder: Medium gray (`#747D8C`)
  - Button text: White, font-size: ~16px

---

### 3. VERIFICATION/OTP SCREENS (Verification.svg, Verification-1.svg)
**Dimensions**: 375 × 812px

**Color Scheme**:
- Background: White (#FFFFFF)
- OTP Input boxes: Light gray background with dark gray text
- Buttons: `#EC2028` (red)
- Labels: `#747D8C` (medium gray)

**Components**:
- **OTP Input Fields**:
  - 4 separate input boxes (digits)
  - Height: ~45-50px
  - Width: ~45-50px each
  - Border: 1px solid `#CED6E0`
  - Border-radius: ~4px
  - Text alignment: Center
  - Font-size: ~18px, bold
  - Background: White
  - Text color: Dark gray (`#1E272E`)
  
- **Spacing Between Boxes**: 8-10px

- **Buttons**:
  - Submit button: `#EC2028` background, white text
  - Height: ~44px
  - Width: 100% minus padding
  - Border-radius: ~4px
  - Font-weight: Bold

- **Typography**:
  - Instruction text: Medium gray (`#747D8C`), ~14px
  - Resend link: `#EC2028` color, clickable
  - Error text (if any): Red

---

### 4. DASHBOARD/HOME (Home.svg, Home-1.svg)
**Dimensions**: 375 × 1908px (scrollable content)

**Header Section**:
- Background: Red (#EC2028)
- Height: ~80-100px
- Contains: User greeting, profile info
- Text color: White

**Balance Card**:
- Background: White (#FFFFFF) or light gray (#F1F2F6)
- Border: 1px solid `#CED6E0`
- Border-radius: ~8px
- Padding: ~16px
- Margin: ~12px
- Shadow: Light shadow or subtle border

**Content Cards**:
- **Title**: Dark gray (`#1E272E`), bold
- **Value**: Red (`#EC2028`) or large font
- **Subtitle**: Light gray (`#747D8C`)
- **Background**: White or light gray
- **Border-radius**: 4-8px
- **Padding**: 12-16px

**Quota Section**:
- Multiple quota items (Data, Calls, SMS)
- Each item: Horizontal layout
- Progress bar: Red (#EC2028) for used, light gray for available
- Height: ~8-10px
- Border-radius: ~4px

**Promo Grid**:
- 2-column layout (default)
- Each card: ~170px height
- Images/icons: Centered
- Title text: Bold, dark gray
- Border-radius: ~6px
- Box-shadow or border

**Scrollable Area**:
- Custom scrollbar styling
- Scrollbar color: Gray (#747D8C or #CED6E0)
- Width: 6-8px

---

### 5. TRANSACTIONS SCREEN
**Color Pattern**:
- Header: Red (#EC2028)
- List items: White background with light borders
- Transaction amounts: Green (income) / Red (expense)
- Icons: Red or gray depending on transaction type

---

## Common Component Styles

### Buttons
- **Primary (Red)**: 
  - Background: `#EC2028`
  - Color: White
  - Height: 44-48px
  - Border-radius: 4px
  - Font-size: 16px
  - Font-weight: 600 or bold
  - Padding: 0 16px
  - Active/Hover: Darker shade of red

- **Secondary**: 
  - Background: White or `#F1F2F6`
  - Border: 1px solid `#CED6E0`
  - Color: `#1E272E`
  - Same sizing as primary

### Input Fields
- **Border**: 1px solid `#CED6E0`
- **Border-radius**: 4px
- **Height**: 40-45px
- **Padding**: 10-12px horizontal
- **Font-color**: `#1E272E`
- **Placeholder color**: `#747D8C`
- **Background**: White
- **Focus state**: Border color changes to `#EC2028`

### Text Typography
- **Headers**: Bold, `#1E272E`, 24-28px
- **Subheaders**: Semi-bold, `#1E272E`, 18-20px
- **Body text**: Regular, `#1E272E`, 14-16px
- **Labels**: Regular, `#747D8C`, 12-14px
- **Button text**: Bold/Semi-bold, White, 14-16px

### Spacing (Standard)
- Padding: 16px (horizontal margins)
- Card gap: 12px
- Component gap: 12-16px
- Section gap: 20px

### Border Radius
- Large (Cards): 8px
- Medium (Buttons): 4px
- Small (Inputs): 4px

---

## Responsive Behavior

### Desktop (≥768px)
- App container: Fixed 390px width, centered
- All components: Same specifications (mobile-first)
- Borders added for visual frame effect

### Mobile (≤767px)
- App container: 100% width
- All padding/margins: Maintained as specified
- Scrollable areas: Full width with custom scrollbar

---

## Viewport Dimensions

### Mobile Sizes Supported
- **375px** (iPhone SE): Standard layout
- **390px** (iPhone 12/13): Standard layout
- **430px** (iPhone 14/15): Standard layout

---

## Animation & Transitions

### OTP Input
- Focus: Change border color to `#EC2028`
- Auto-focus next field on input
- Transition time: 200ms

### Buttons
- Hover state: Background darkens or opacity changes
- Click state: Slight scale down (0.95)
- Transition time: 150-200ms

### Screens
- Fade in/out: 300ms
- Slide transitions: 200-300ms

---

## Status Bar Styling

### Status Bar Area
- Height: 44px
- Background: Match screen header color
- Font-size: 12px
- Icons: WiFi, Signal strength, Battery
- Color: White or matching theme

---

## Notes

1. **Gradient Direction**: All red gradients use 135deg angle
2. **Consistency**: Red (#EC2028) is used throughout for all primary CTAs
3. **Accessibility**: All text has sufficient contrast ratio against backgrounds
4. **Box shadows**: Use subtle shadows (0 2px 8px rgba(0,0,0,0.1))
5. **Line heights**: Standard 1.4-1.6 for body text
6. **Icon sizing**: 24px for primary icons, 16px for secondary icons
