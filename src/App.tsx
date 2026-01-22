import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { TicketProvider } from '@/contexts/TicketContext';
import { ReminderProvider } from '@/contexts/ReminderContext';
import ScrollToTop from '@/components/ScrollToTop';
import Index from './pages/Index';
import WizardPage from './pages/WizardPage';
import TicketManagerPage from './pages/TicketManagerPage';
import NewServiceTicketPage from './pages/NewServiceTicketPage';
import TicketDetailPage from './pages/TicketDetailPage';
import ServiceProvidersPage from './pages/ServiceProvidersPage';

const queryClient = new QueryClient();

const App = () => {
  console.log('App component rendering...');
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TicketProvider>
          <ReminderProvider>
            <SidebarProvider>
              <TooltipProvider>
                <Toaster />
                <BrowserRouter>
                  <ScrollToTop />
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/job/:jobId" element={<Index />} />
                    <Route path="/wizard" element={<WizardPage />} />
                    <Route path="/tickets" element={<Index />} />
                    <Route path="/tickets/new" element={<Index />} />
                    <Route path="/tickets/:ticketId" element={<Index />} />
                    <Route path="/ticket/:ticketId" element={<Index />} />
                    <Route path="/ticket/:ticketId/create-job" element={<Index />} />
                    <Route path="/service-providers" element={<Index />} />
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </SidebarProvider>
          </ReminderProvider>
        </TicketProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
