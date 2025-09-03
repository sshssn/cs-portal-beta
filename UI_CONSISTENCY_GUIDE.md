# UI Consistency Guide

This guide explains how to maintain consistent UI styling across the entire Mock Portal application using the centralized UI constants.

## Overview

The UI constants system ensures that all components follow the same design patterns, colors, spacing, and typography as the main homepage. This creates a cohesive user experience and makes maintenance easier.

## File Structure

- `src/lib/ui-constants.ts` - Contains all UI constants and helper functions
- `UI_CONSISTENCY_GUIDE.md` - This guide

## How to Use

### 1. Import the Constants

```typescript
import { UI_CONSTANTS, getCardClasses, getFormClasses, getButtonClasses } from '@/lib/ui-constants';
```

### 2. Apply Consistent Styling

#### Cards
```typescript
// Use the helper function for consistent card styling
<Card className={getCardClasses('hover')}>
  <CardHeader className={UI_CONSTANTS.card.header}>
    <CardTitle className={UI_CONSTANTS.typography.title}>
      Card Title
    </CardTitle>
  </CardHeader>
  <CardContent className={UI_CONSTANTS.card.content}>
    Content here
  </CardContent>
</Card>
```

#### Form Elements
```typescript
// Consistent input styling
<Input 
  className={getFormClasses('input')}
  placeholder="Enter text..."
/>

// Consistent select styling
<Select>
  <SelectTrigger className={getFormClasses('select')}>
    <SelectValue />
  </SelectTrigger>
</Select>

// Consistent textarea styling
<Textarea 
  className={getFormClasses('textarea')}
  rows={3}
/>
```

#### Buttons
```typescript
// Consistent button styling
<Button className={getButtonClasses('outline')}>
  Cancel
</Button>

<Button className={getButtonClasses('primary')}>
  Save
</Button>
```

#### Icons
```typescript
// Consistent icon styling
<User className={getIconClasses('md', 'primary')} />
<AlertTriangle className={getIconClasses('sm', 'error')} />
<CheckCircle className={getIconClasses('lg', 'success')} />
```

#### Badges
```typescript
// Consistent badge styling
<Badge className={getBadgeClasses('status', 'green')}>
  Completed
</Badge>

<Badge className={getBadgeClasses('priority', 'Critical')}>
  Critical
</Badge>
```

### 3. Layout Patterns

```typescript
// Consistent grid layouts
<div className={UI_CONSTANTS.layout.grid.twoCol}>
  {/* Two column layout */}
</div>

<div className={UI_CONSTANTS.layout.grid.threeCol}>
  {/* Three column layout */}
</div>

// Consistent spacing
<div className={UI_CONSTANTS.spacing.section}>
  {/* Section with consistent spacing */}
</div>

<div className={UI_CONSTANTS.spacing.card.field}>
  {/* Form field with consistent spacing */}
</div>
```

## Color Scheme

The application uses a consistent color palette:

- **Primary Blue**: `text-blue-600`, `bg-blue-600` - Main actions and links
- **Status Colors**:
  - Green: `text-green-600` - Success, completed
  - Amber: `text-amber-600` - Warning, in progress
  - Red: `text-red-600` - Error, issues
- **Text Colors**:
  - Primary: `text-gray-900` - Main text
  - Secondary: `text-gray-700` - Labels
  - Muted: `text-gray-600` - Secondary text
- **Backgrounds**:
  - Primary: `bg-white` - Main content areas
  - Secondary: `bg-gray-50` - Subtle backgrounds
  - Tertiary: `bg-gray-100` - Accent backgrounds

## Spacing Scale

Consistent spacing using Tailwind's scale:

- **Card Header**: `pb-4` (16px)
- **Card Content**: `space-y-6` (24px between elements)
- **Grid Gaps**: `gap-6` (24px)
- **Field Spacing**: `space-y-2` (8px)
- **Section Spacing**: `space-y-6` (24px)
- **Element Spacing**: `gap-2` (8px)
- **Icon Margins**: `mr-3` (12px)

## Typography

Consistent text styles:

- **Title**: `text-lg font-semibold text-gray-900` - Card headers
- **Subtitle**: `text-sm font-medium text-gray-700` - Field labels
- **Body**: `text-gray-900 font-medium` - Main content
- **Body Muted**: `text-gray-600` - Secondary content
- **Caption**: `text-xs text-gray-500` - Small text, timestamps

## Card Styling

All cards follow the same pattern:

- **Base**: `shadow-md hover:shadow-lg transition-shadow duration-200`
- **Header**: `pb-4` with consistent title styling
- **Content**: `space-y-6` for consistent spacing

## Form Elements

All form elements use consistent styling:

- **Border**: `border-gray-300`
- **Focus**: `focus:border-blue-500 focus:ring-blue-500`
- **Hover**: Subtle hover effects

## Migration Guide

When updating existing components to use the UI constants:

1. **Replace hardcoded classes** with constants
2. **Use helper functions** for complex styling combinations
3. **Maintain the same visual hierarchy** and spacing
4. **Test the component** to ensure it looks consistent

### Before (Inconsistent)
```typescript
<Card className="shadow-lg border-2">
  <CardHeader className="pb-2">
    <CardTitle className="text-xl font-bold text-black">
      Title
    </CardTitle>
  </CardHeader>
</Card>
```

### After (Consistent)
```typescript
<Card className={getCardClasses('hover')}>
  <CardHeader className={UI_CONSTANTS.card.header}>
    <CardTitle className={UI_CONSTANTS.typography.title}>
      Title
    </CardTitle>
  </CardHeader>
</Card>
```

## Benefits

1. **Consistency**: All components look and feel the same
2. **Maintainability**: Changes to styling can be made in one place
3. **Developer Experience**: Clear patterns and helper functions
4. **Accessibility**: Consistent focus states and color contrast
5. **Performance**: Optimized class combinations

## Best Practices

1. **Always use constants** instead of hardcoded classes
2. **Use helper functions** for complex styling combinations
3. **Follow the spacing scale** for consistent layouts
4. **Maintain color consistency** across all components
5. **Test visual consistency** when making changes

## Examples

See the updated `JobDetailPage.tsx` for a complete example of how to apply these constants throughout a component.
