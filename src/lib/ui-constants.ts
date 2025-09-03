// Global UI Constants and Styling Patterns
// This file ensures consistent styling across all components

export const UI_CONSTANTS = {
  // Color Scheme - Matching the main homepage
  colors: {
    primary: {
      blue: 'text-blue-600',
      blueBg: 'bg-blue-600',
      blueBorder: 'border-blue-500',
      blueRing: 'focus:ring-blue-500',
      blueFocus: 'focus:border-blue-500',
    },
    status: {
      green: 'text-green-600',
      greenBg: 'bg-green-600',
      greenBorder: 'border-green-500',
      amber: 'text-amber-600',
      amberBg: 'bg-amber-600',
      amberBorder: 'border-amber-500',
      red: 'text-red-600',
      redBg: 'bg-red-600',
      redBorder: 'border-red-500',
    },
    priority: {
      critical: 'bg-red-600 text-white border-red-700 shadow-sm',
      high: 'bg-orange-500 text-white border-orange-600 shadow-sm',
      medium: 'bg-yellow-500 text-white border-yellow-600 shadow-sm',
      low: 'bg-green-500 text-white border-green-600 shadow-sm',
    },
    text: {
      primary: 'text-gray-900',
      secondary: 'text-gray-700',
      muted: 'text-gray-600',
      mutedForeground: 'text-muted-foreground',
    },
    background: {
      primary: 'bg-white',
      secondary: 'bg-gray-50',
      tertiary: 'bg-gray-100',
    },
    border: {
      primary: 'border-gray-300',
      secondary: 'border-gray-200',
      focus: 'focus:border-blue-500',
    }
  },

  // Spacing - Consistent spacing scale
  spacing: {
    card: {
      header: 'pb-4',
      content: 'space-y-6',
      grid: 'gap-6',
      field: 'space-y-2',
    },
    section: 'space-y-6',
    element: 'gap-2',
    icon: 'mr-3',
  },

  // Typography - Consistent text styles
  typography: {
    title: 'text-lg font-semibold text-gray-900',
    subtitle: 'text-sm font-medium text-gray-700',
    body: 'text-gray-900 font-medium',
    bodyMuted: 'text-gray-600',
    caption: 'text-xs text-gray-500',
  },

  // Card Styling - Consistent card appearance
  card: {
    base: 'shadow-md hover:shadow-lg transition-shadow duration-200',
    header: 'pb-4',
    content: 'space-y-6',
  },

  // Form Elements - Consistent input styling
  form: {
    input: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
    select: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
    textarea: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
  },

  // Button Styling - Consistent button appearance
  button: {
    outline: 'border-gray-300 hover:bg-gray-50',
    primary: 'bg-blue-600 hover:bg-blue-700',
    secondary: 'bg-gray-600 hover:bg-gray-700',
  },

  // Icon Styling - Consistent icon colors and sizes
  icons: {
    size: {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
    },
    colors: {
      primary: 'text-blue-600',
      success: 'text-green-600',
      warning: 'text-amber-600',
      error: 'text-red-600',
      muted: 'text-gray-600',
    }
  },

  // Badge Styling - Consistent badge appearance
  badge: {
    base: 'text-white shadow-sm',
    status: {
      green: 'bg-green-500 text-white shadow-sm',
      amber: 'bg-amber-500 text-white shadow-sm',
      red: 'bg-red-500 text-white shadow-sm',
    }
  },

  // Layout - Consistent layout patterns
  layout: {
    grid: {
      responsive: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      twoCol: 'grid grid-cols-1 md:grid-cols-2',
      threeCol: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    },
    container: 'container mx-auto py-6',
    sidebar: 'space-y-6',
  }
};

// Helper function to apply consistent card styling
export const getCardClasses = (variant: 'default' | 'hover' = 'default') => {
  const base = 'shadow-md transition-shadow duration-200';
  const hover = variant === 'hover' ? 'hover:shadow-lg' : '';
  return `${base} ${hover}`;
};

// Helper function to apply consistent form element styling
export const getFormClasses = (element: 'input' | 'select' | 'textarea') => {
  return UI_CONSTANTS.form[element];
};

// Helper function to apply consistent button styling
export const getButtonClasses = (variant: 'outline' | 'primary' | 'secondary') => {
  return UI_CONSTANTS.button[variant];
};

// Helper function to apply consistent icon styling
export const getIconClasses = (size: 'sm' | 'md' | 'lg', color: keyof typeof UI_CONSTANTS.icons.colors) => {
  return `${UI_CONSTANTS.icons.size[size]} ${UI_CONSTANTS.icons.colors[color]}`;
};

// Helper function to apply consistent badge styling
export const getBadgeClasses = (type: 'status' | 'priority', value: string) => {
  if (type === 'status') {
    return UI_CONSTANTS.badge.status[value as keyof typeof UI_CONSTANTS.badge.status] || UI_CONSTANTS.badge.base;
  }
  if (type === 'priority') {
    return UI_CONSTANTS.colors.priority[value.toLowerCase() as keyof typeof UI_CONSTANTS.colors.priority] || UI_CONSTANTS.badge.base;
  }
  return UI_CONSTANTS.badge.base;
};
