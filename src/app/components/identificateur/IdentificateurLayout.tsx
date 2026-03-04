import React, { useState } from 'react';
import { Outlet } from 'react-router';
import { useUser } from '../../contexts/UserContext';
import { Sidebar } from '../layout/Sidebar';
import { BottomBar } from '../layout/BottomBar';
import { ProfileSwitcher } from '../dev/ProfileSwitcher';
import { NotifBellButton, NotificationsPanel } from '../shared/NotificationsPanel';

const PRIMARY_COLOR = '#9F8170';

export function IdentificateurLayout() {
  const { user } = useUser();
  const [showNotifications, setShowNotifications] = useState(false);

  const identificateurId = user?.id || 'identificateur-001';

  return (
    <div className="min-h-screen bg-gray-50">
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

      {/* Navigation mobile */}
      <BottomBar role="identificateur" />

      {/* Dev only */}
      <ProfileSwitcher />
    </div>
  );
}