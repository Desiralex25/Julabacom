import { RouterProvider } from 'react-router';
import { AppProvider } from './contexts/AppContext';
import { ModalProvider } from './contexts/ModalContext';
import { CaisseProvider } from './contexts/CaisseContext';
import { UserProvider } from './contexts/UserContext';
import { StockProvider } from './contexts/StockContext';
import { WalletProvider } from './contexts/WalletContext';
import { CommandeProvider } from './contexts/CommandeContext';
import { RecolteProvider } from './contexts/RecolteContext';
import { ScoreProvider } from './contexts/ScoreContext';
import { AuditProvider } from './contexts/AuditContext';
import { CooperativeProvider } from './contexts/CooperativeContext';
import { InstitutionProvider } from './contexts/InstitutionContext';
import { ZoneProvider } from './contexts/ZoneContext';
import { IdentificateurProvider } from './contexts/IdentificateurContext';
import { ProducteurProvider } from './contexts/ProducteurContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import { InstitutionAccessProvider } from './contexts/InstitutionAccessContext';
import { BackOfficeProvider } from './contexts/BackOfficeContext';
import { SupportConfigProvider } from './contexts/SupportConfigContext';
import { TicketsProvider } from './contexts/TicketsContext';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';
import { TantieSagesseTest } from './components/TantieSagesseTest';

export default function App() {
  return (
    <ModalProvider>
      <AppProvider>
        <UserProvider>
          <NotificationsProvider>
            <ZoneProvider>
              <AuditProvider>
                <WalletProvider>
                  <ScoreProvider>
                    <RecolteProvider>
                      <CommandeProvider>
                        <StockProvider>
                          <CaisseProvider>
                            <CooperativeProvider>
                              <InstitutionProvider>
                                <BackOfficeProvider>
                                  <SupportConfigProvider>
                                    <TicketsProvider>
                                      <InstitutionAccessProvider>
                                        <IdentificateurProvider>
                                          <ProducteurProvider>
                                            <RouterProvider router={router} />
                                            <Toaster />
                                            <TantieSagesseTest />
                                          </ProducteurProvider>
                                        </IdentificateurProvider>
                                      </InstitutionAccessProvider>
                                    </TicketsProvider>
                                  </SupportConfigProvider>
                                </BackOfficeProvider>
                              </InstitutionProvider>
                            </CooperativeProvider>
                          </CaisseProvider>
                        </StockProvider>
                      </CommandeProvider>
                    </RecolteProvider>
                  </ScoreProvider>
                </WalletProvider>
              </AuditProvider>
            </ZoneProvider>
          </NotificationsProvider>
        </UserProvider>
      </AppProvider>
    </ModalProvider>
  );
}