import { RouterProvider } from 'react-router';
import { AppProvider } from './contexts/AppContext';
import { ModalProvider } from './contexts/ModalContext';
import { UserProvider } from './contexts/UserContext';
import { StockProvider } from './contexts/StockContext';
import { CaisseProvider } from './contexts/CaisseContext';
import { BackOfficeProvider } from './contexts/BackOfficeContext';
import { TicketsProvider } from './contexts/TicketsContext';
import { SupportConfigProvider } from './contexts/SupportConfigContext';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <ModalProvider>
        <AppProvider>
          <UserProvider>
            <BackOfficeProvider>
              <SupportConfigProvider>
                <TicketsProvider>
                  <StockProvider>
                    <CaisseProvider>
                      <RouterProvider router={router} />
                      <Toaster />
                    </CaisseProvider>
                  </StockProvider>
                </TicketsProvider>
              </SupportConfigProvider>
            </BackOfficeProvider>
          </UserProvider>
        </AppProvider>
      </ModalProvider>
    </ErrorBoundary>
  );
}