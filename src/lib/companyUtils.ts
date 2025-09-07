import { CompanySettings } from '@/types/company';

// Load company logo from localStorage
export const getCompanyLogo = (): string | null => {
  try {
    return localStorage.getItem('companyLogo');
  } catch (error) {
    console.error('Error loading company logo:', error);
    return null;
  }
};

// Load company settings from localStorage
export const getCompanySettings = (): CompanySettings | null => {
  try {
    const settings = localStorage.getItem('companySettings');
    return settings ? JSON.parse(settings) : null;
  } catch (error) {
    console.error('Error loading company settings:', error);
    return null;
  }
};

// Import showNotification
import { showNotification } from '@/components/ui/toast-notification';

// Save company settings to localStorage
export const saveCompanySettings = (settings: CompanySettings): void => {
  try {
    localStorage.setItem('companySettings', JSON.stringify(settings));
    
    // Also save logo separately for easy access
    if (settings.logo) {
      localStorage.setItem('companyLogo', settings.logo);
    }
    
    // Dispatch an event to update UI components
    window.dispatchEvent(new Event('company-settings-changed'));
    
    // Also dispatch a storage event to ensure cross-tab updates
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'companySettings',
      newValue: JSON.stringify(settings),
      storageArea: localStorage
    }));
    
    // Show notification about changes
    showNotification({
      type: 'success',
      title: 'Company Settings Updated',
      message: 'You may need to refresh the page to see all changes applied.',
      duration: 10000
    });
  } catch (error) {
    console.error('Error saving company settings:', error);
  }
};

// Get company name
export const getCompanyName = (): string => {
  const settings = getCompanySettings();
  return settings?.name || 'Customer Service Portal';
};

// Get company business hours
export const getCompanyBusinessHours = () => {
  const settings = getCompanySettings();
  return settings?.businessHours || null;
};

// Check if company is currently open based on business hours
export const isCompanyOpen = (): boolean => {
  const businessHours = getCompanyBusinessHours();
  if (!businessHours) return true; // Default to open if no hours set
  
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
  
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = dayNames[dayOfWeek];
  const todaySchedule = businessHours[today as keyof typeof businessHours];
  
  if (!todaySchedule || !todaySchedule.open) return false;
  
  return currentTime >= todaySchedule.openTime && currentTime <= todaySchedule.closeTime;
};

// Get next opening time
export const getNextOpeningTime = (): string | null => {
  const businessHours = getCompanyBusinessHours();
  if (!businessHours) return null;
  
  const now = new Date();
  const dayOfWeek = now.getDay();
  const currentTime = now.toTimeString().slice(0, 5);
  
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  
  // Check today first
  const today = dayNames[dayOfWeek];
  const todaySchedule = businessHours[today as keyof typeof businessHours];
  
  if (todaySchedule?.open && currentTime < todaySchedule.openTime) {
    return `Today at ${todaySchedule.openTime}`;
  }
  
  // Check next few days
  for (let i = 1; i <= 7; i++) {
    const nextDayIndex = (dayOfWeek + i) % 7;
    const nextDay = dayNames[nextDayIndex];
    const nextDaySchedule = businessHours[nextDay as keyof typeof businessHours];
    
    if (nextDaySchedule?.open) {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return `${dayNames[nextDayIndex]} at ${nextDaySchedule.openTime}`;
    }
  }
  
  return null;
};

// Format business hours for display
export const formatBusinessHours = (): string => {
  const businessHours = getCompanyBusinessHours();
  if (!businessHours) return 'Hours not set';
  
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  const formattedHours = dayKeys.map((day, index) => {
    const schedule = businessHours[day as keyof typeof businessHours];
    if (!schedule?.open) return `${dayNames[index]}: Closed`;
    return `${dayNames[index]}: ${schedule.openTime} - ${schedule.closeTime}`;
  });
  
  return formattedHours.join('\n');
};
