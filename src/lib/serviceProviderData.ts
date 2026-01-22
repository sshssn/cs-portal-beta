// Shared OOH Service Providers data - used across the application
export const oohServiceProviders = [
  {
    id: 'sp-1',
    name: 'Manchester Facilities Services',
    location: 'Manchester',
    address: '123 Oxford Road, Manchester, M1 5QA',
    phone: '+44 161 234 5678',
    email: 'contact@manchesterfacilities.co.uk',
    specialty: 'General Maintenance',
    status: 'active' as const
  },
  {
    id: 'sp-2',
    name: 'Birmingham Building Solutions',
    location: 'Birmingham',
    address: '45 Corporation Street, Birmingham, B2 4TE',
    phone: '+44 121 456 7890',
    email: 'info@birminghambuilding.co.uk',
    specialty: 'Electrical & HVAC',
    status: 'active' as const
  },
  {
    id: 'sp-3',
    name: 'London Property Care',
    location: 'London',
    address: '200 Thames Path, London, SE1 9PP',
    phone: '+44 20 7890 1234',
    email: 'support@londonpropertycare.co.uk',
    specialty: 'Fire Safety & Security',
    status: 'active' as const
  },
  {
    id: 'sp-4',
    name: 'Leeds Maintenance Group',
    location: 'Leeds',
    address: '78 Call Lane, Leeds, LS1 6DT',
    phone: '+44 113 567 8901',
    email: 'hello@leedsmaintenance.co.uk',
    specialty: 'Plumbing & Electrical',
    status: 'inactive' as const
  }
];

// Get unique locations from service providers
export const oohLocations = [...new Set(oohServiceProviders.map(sp => sp.location))];

// Helper to get service provider by name
export const getServiceProviderByName = (name: string) => {
  return oohServiceProviders.find(sp => sp.name === name);
};

// Helper to get service providers by location
export const getServiceProvidersByLocation = (location: string) => {
  return oohServiceProviders.filter(sp => sp.location === location);
};

export type OOHServiceProvider = typeof oohServiceProviders[number];
