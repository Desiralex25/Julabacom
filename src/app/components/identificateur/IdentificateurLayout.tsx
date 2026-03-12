import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import { ProfileSwitcher } from '../dev/ProfileSwitcher';
import { IS_DEV } from '../../utils/env';
import { Sidebar } from '../layout/Sidebar';
import { BottomBar } from '../layout/BottomBar';
import { NotifBellButton, NotificationsPanel } from '../shared/NotificationsPanel';
import { ScrollToTop } from '../layout/ScrollToTop';

const PRIMARY_COLOR = '#9F8170';

export function IdentificateurLayout() {
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);

  const identificateurId = 'identificateur-001';
  
  // Masquer la Bottom bar sur les pages de formulaires (pour maximiser l'espace)
  const hideBottomBar = location.pathname.includes('/nouvelle-identification') || 
                        location.pathname.includes('/fiche-identification') ||
                        location.pathname.includes('/identification') ||
                        location.pathname.includes('/nouveau-marchand') ||
                        location.pathname.includes('/formulaire-identification-marchand') ||
                        location.pathname.includes('/fiche-marchand');

  return (
    <div className="min-h-screen bg-gray-50">
      <ScrollToTop />
      {/* Sidebar Desktop */}
      <Sidebar role="identificateur" />

      {/* Boutons flottants : Notifications */}
      <div className="fixed top-4 right-4 z-50 lg:top-6 lg:right-6 flex items-center gap-2">
        {/* Cloche Notifications */}
        <NotifBellButton
          userId={identificateurId}
          accentColor={PRIMARY_COLOR}
          onOpen={() => setShowNotifications(true)}
        />
      </div>

      {/* Panel Notifications */}
      <NotificationsPanel
        userId={identificateurId}
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        accentColor={PRIMARY_COLOR}
      />

      {/* Contenu principal */}
      <main>
        <Outlet />
      </main>

      {/* Navigation mobile - Masquée sur les pages de formulaire */}
      {!hideBottomBar && <BottomBar role="identificateur" />}

      {/* Dev only */}
      {IS_DEV && <ProfileSwitcher />}
    </div>
  );
}