/**
 * JULABA — Bouton Notifications Marchand
 * Utilise le système unifié NotificationsContext via useApp pour le userId réel.
 */
import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useNotifications } from '../../contexts/NotificationsContext';
import { NotificationsPanel } from '../shared/NotificationsPanel';
import { NotifBellButton } from '../shared/NotificationsPanel';

export function NotificationButton() {
  const { user, speak } = useApp();
  const { getUnreadCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);

  const userId = user?.id || '';
  const unreadCount = getUnreadCount(userId);

  const handleClick = () => {
    setShowNotifications(true);
    if (unreadCount > 0) {
      speak(`Tu as ${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`);
    }
  };

  return (
    <>
      <NotifBellButton
        userId={userId}
        accentColor="#C46210"
        onOpen={handleClick}
      />
      <NotificationsPanel
        userId={userId}
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        accentColor="#C46210"
      />
    </>
  );
}
