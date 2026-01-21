import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { JobProvider } from './context/JobContext';

createRoot(document.getElementById('root')!).render(
    <JobProvider>
        <App />
    </JobProvider>
);
