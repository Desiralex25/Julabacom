import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { router } from './app/routes';
import { AppProvider } from './app/contexts/AppContext';
import { BackOfficeProvider } from './app/contexts/BackOfficeContext';
import { TicketsProvider } from './app/contexts/TicketsContext';
import { Toaster } from 'sonner';
import './styles/index.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <AppProvider>
      <BackOfficeProvider>
        <TicketsProvider>
          <RouterProvider router={router} />
          <Toaster 
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#000',
                border: '2px solid #16a34a',
                borderRadius: '24px',
                padding: '16px',
                fontFamily: 'system-ui, sans-serif',
              },
            }}
          />
        </TicketsProvider>
      </BackOfficeProvider>
    </AppProvider>
  </React.StrictMode>
);
