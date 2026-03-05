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
import { DevModeProvider } from './contexts/DevModeContext';
import { DevContextWrapper } from './contexts/DevContextWrapper';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';
import { TantieSagesseTest } from './components/TantieSagesseTest';
import { DevModeBadge } from './components/DevModeBadge';
import { DevModeToggle } from './components/DevModeToggle';
import { DEV_MODE } from './config/devMode';

// ✅ Cache version UI (acceptable - préférence cosmétique)
const CACHE_VERSION = 'v3-clean';
if (localStorage.getItem('julaba_cache_version') !== CACHE_VERSION) {
  localStorage.setItem('julaba_cache_version', CACHE_VERSION);
}

// Panneau de test Tantie Sagesse (désactivé en mode dev pour simplicité)
const SHOW_TANTIE_TEST = !DEV_MODE;

export default function App() {
  return (
    <DevModeProvider>
      <DevContextWrapper>
        <ModalProvider>
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
                                    <BackOfficeProvider>
                                      <SupportConfigProvider>
                                        <TicketsProvider>
                                          <InstitutionAccessProvider>
                                            <IdentificateurProvider>
                                              <ProducteurProvider>
                                                <RouterProvider router={router} />
                                                <Toaster />
                                                {SHOW_TANTIE_TEST && <TantieSagesseTest />}
                                                <DevModeBadge />
                                                <DevModeToggle />
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
      </DevContextWrapper>
    </DevModeProvider>
  );
}