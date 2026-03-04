import { RouterProvider } from 'react-router';
import { AppProvider } from './contexts/AppContext';
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
import { router } from './routes';
import { Toaster } from './components/ui/sonner';

// Reset localStorage pour forcer le chargement des mocks de négociation
const CACHE_VERSION = 'v2-nego';
if (localStorage.getItem('julaba_cache_version') !== CACHE_VERSION) {
  localStorage.removeItem('julaba_commandes');
  localStorage.setItem('julaba_cache_version', CACHE_VERSION);
}

export default function App() {
  return (
    <AppProvider>
      <UserProvider>
        {/* NotificationsProvider remonté ici — accessible par tous les contextes enfants */}
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
                              <InstitutionAccessProvider>
                                <IdentificateurProvider>
                                  <ProducteurProvider>
                                    <RouterProvider router={router} />
                                    <Toaster />
                                  </ProducteurProvider>
                                </IdentificateurProvider>
                              </InstitutionAccessProvider>
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
  );
}