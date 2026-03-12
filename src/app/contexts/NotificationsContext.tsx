/**
 * JULABA — Système de Notifications Unifié v3
 * Intégré avec Supabase
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { useApp } from './AppContext';
import * as notificationsApi from '../../imports/notifications-api';
import { DEV_MODE, devLog } from '../config/devMode';
import { NOT_AUTHENTICATED } from '../../imports/api-client';

export type NotifRole =
  | 'marchand'
  | 'producteur'
  | 'cooperative'
  | 'identificateur'
  | 'institution'
  | 'admin';

export type NotifPriority = 'low' | 'medium' | 'high' | 'critical';

export type NotifType =
  | 'commande_recue'
  | 'paiement_valide'
  | 'paiement_echoue'
  | 'stock_faible'
  | 'document_valide'
  | 'suspension'
  | 'reactivation'
  | 'nouvelle_commande'
  | 'paiement_recu'
  | 'offre_expiree'
  | 'recolte_proche'
  | 'evaluation_recue'
  | 'membre_ajoute'
  | 'contribution_recue'
  | 'paiement_collectif'
  | 'commande_groupee_validee'
  | 'distribution_prete'
  | 'dossier_valide'
  | 'dossier_rejete'
  | 'objectif_atteint'
  | 'dossier_assigne'
  | 'pic_transaction'
  | 'baisse_activite'
  | 'nouveau_identificateur'
  | 'dossier_en_attente'
  | 'alerte_fraude'
  | 'creation_acteur'
  | 'modification_critique'
  | 'tentative_acces'
  | 'anomalie_systeme'
  | 'info'
  | 'systeme';

export interface JulabaNotification {
  id: string;
  userId: string;
  role: NotifRole;
  type: NotifType;
  title: string;
  message: string;
  entityId?: string;
  entityType?: string;
  isRead: boolean;
  createdAt: string;
  priority: NotifPriority;
  actionLink?: string;
  metadata?: Record<string, any>;
}

export const PRIORITY_CONFIG: Record<NotifPriority, {
  label: string;
  bgUnread: string;
  bgRead: string;
  border: string;
  badge: string;
  dot: string;
}> = {
  critical: {
    label: 'Critique',
    bgUnread: 'bg-red-50',
    bgRead: 'bg-gray-50',
    border: 'border-red-300',
    badge: 'bg-red-600 text-white',
    dot: 'bg-red-500',
  },
  high: {
    label: 'Important',
    bgUnread: 'bg-orange-50',
    bgRead: 'bg-gray-50',
    border: 'border-orange-300',
    badge: 'bg-orange-500 text-white',
    dot: 'bg-orange-500',
  },
  medium: {
    label: 'Normal',
    bgUnread: 'bg-amber-50',
    bgRead: 'bg-gray-50',
    border: 'border-amber-200',
    badge: 'bg-amber-500 text-white',
    dot: 'bg-amber-500',
  },
  low: {
    label: 'Info',
    bgUnread: 'bg-blue-50',
    bgRead: 'bg-gray-50',
    border: 'border-blue-200',
    badge: 'bg-blue-500 text-white',
    dot: 'bg-blue-500',
  },
};

interface NotificationsContextType {
  notifications: JulabaNotification[];
  loading: boolean;
  unreadCount: number;
  
  addNotification: (notif: Omit<JulabaNotification, 'id' | 'userId' | 'isRead' | 'createdAt'>) => Promise<void>;
  markAsRead: (notifId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notifId: string) => Promise<void>;
  deleteNotif: (notifId: string) => Promise<void>;
  clearAll: () => Promise<void>;
  
  getUnreadNotifications: () => JulabaNotification[];
  getNotificationsByType: (type: NotifType) => JulabaNotification[];
  getNotificationsByPriority: (priority: NotifPriority) => JulabaNotification[];
  getNotificationsForUser: (userId: string) => JulabaNotification[];
  getUnreadCount: (userId: string) => number;
  
  refreshNotifications: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useApp();
  const [notifications, setNotifications] = useState<JulabaNotification[]>([]);
  const [loading, setLoading] = useState(false);

  // Charger les notifications depuis Supabase
  const loadNotifications = async () => {
    if (DEV_MODE) {
      devLog('NotificationsContext', 'Mode dev - skip API call');
      return;
    }
    if (!user?.id) {
      setNotifications([]);
      return;
    }

    try {
      setLoading(true);
      const { notifications: data } = await notificationsApi.fetchNotifications();
      
      const notifList: JulabaNotification[] = data.map((n: any) => ({
        id: n.id,
        userId: n.user_id,
        role: n.role as NotifRole,
        type: n.type as NotifType,
        title: n.titre,
        message: n.message,
        entityId: n.entity_id,
        entityType: n.entity_type,
        isRead: n.lu,
        createdAt: n.created_at,
        priority: (n.priorite || 'medium') as NotifPriority,
        actionLink: n.action_link,
        metadata: n.metadata,
      }));

      setNotifications(notifList);
    } catch (error: any) {
      if (error?.message === NOT_AUTHENTICATED) return;
      if (error?.message === 'Invalid JWT' || error?.message === 'SESSION_EXPIRED' || error?.message === 'AUCUNE_SESSION_BO') {
        // Erreurs d'auth silencieuses - ne pas polluer la console
        setNotifications([]);
        return;
      }
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [user?.id]);

  const refreshNotifications = async () => {
    await loadNotifications();
  };

  const addNotification = async (notif: Omit<JulabaNotification, 'id' | 'userId' | 'isRead' | 'createdAt'>) => {
    if (!user?.id) return;

    try {
      await notificationsApi.createNotification({
        titre: notif.title,
        message: notif.message,
        type: notif.type,
        priorite: notif.priority,
        entity_id: notif.entityId,
        entity_type: notif.entityType,
        action_link: notif.actionLink,
        metadata: notif.metadata,
      });

      await loadNotifications();
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  };

  const markAsRead = async (notifId: string) => {
    try {
      await notificationsApi.markNotificationAsRead(notifId);
      
      setNotifications(prev =>
        prev.map(n => (n.id === notifId ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await Promise.all(
        notifications.filter(n => !n.isRead).map(n => notificationsApi.markNotificationAsRead(n.id))
      );
      
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notifId: string) => {
    try {
      await notificationsApi.deleteNotification(notifId);
      setNotifications(prev => prev.filter(n => n.id !== notifId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const clearAll = async () => {
    try {
      await Promise.all(
        notifications.map(n => notificationsApi.deleteNotification(n.id))
      );
      setNotifications([]);
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  };

  const getUnreadNotifications = () => {
    return notifications.filter(n => !n.isRead);
  };

  const getNotificationsByType = (type: NotifType) => {
    return notifications.filter(n => n.type === type);
  };

  const getNotificationsByPriority = (priority: NotifPriority) => {
    return notifications.filter(n => n.priority === priority);
  };

  const getNotificationsForUser = (userId: string): JulabaNotification[] => {
    if (!userId) return notifications;
    return notifications.filter(n => n.userId === userId || !n.userId);
  };

  const getUnreadCount = (userId: string): number => {
    return getNotificationsForUser(userId).filter(n => !n.isRead).length;
  };

  const unreadCount = getUnreadNotifications().length;

  const value: NotificationsContextType = {
    notifications,
    loading,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteNotif: deleteNotification,
    clearAll,
    getUnreadNotifications,
    getNotificationsByType,
    getNotificationsByPriority,
    getNotificationsForUser,
    getUnreadCount,
    refreshNotifications,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}