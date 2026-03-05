import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuditEvent, AuditAction, AuditEntityType } from '../types/julaba.types';

interface AuditContextType {
  events: AuditEvent[];
  
  // Logger événements
  logEvent: (
    userId: string,
    userRole: 'marchand' | 'producteur' | 'cooperative' | 'identificateur' | 'institution',
    userName: string,
    action: AuditAction,
    entityType: AuditEntityType,
    entityId: string,
    metadata?: Record<string, any>,
    geolocation?: { latitude: number; longitude: number }
  ) => void;
  
  // Récupération logs
  getEventsByUser: (userId: string) => AuditEvent[];
  getEventsByEntity: (entityType: AuditEntityType, entityId: string) => AuditEvent[];
  getEventsByAction: (action: AuditAction) => AuditEvent[];
  getRecentEvents: (limit?: number) => AuditEvent[];
  
  // Exports
  exportAuditTrail: (userId?: string, startDate?: string, endDate?: string) => AuditEvent[];
}

const AuditContext = createContext<AuditContextType | undefined>(undefined);

export function AuditProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<AuditEvent[]>([]);

  // TODO: Charger depuis Supabase
  // ✅ localStorage SUPPRIMÉ
  // useEffect(() => {
  //   const loadData = async () => {
  //     const { data } = await supabase.from('audit_trail').select('*').limit(1000);
  //     setEvents(data || []);
  //   };
  //   loadData();
  // }, []);

  // 📝 Logger un événement
  const logEvent = (
    userId: string,
    userRole: 'marchand' | 'producteur' | 'cooperative' | 'identificateur' | 'institution',
    userName: string,
    action: AuditAction,
    entityType: AuditEntityType,
    entityId: string,
    metadata: Record<string, any> = {},
    geolocation?: { latitude: number; longitude: number }
  ) => {
    const event: AuditEvent = {
      id: `AUD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      
      userId,
      userRole,
      userName,
      
      action,
      
      entityType,
      entityId,
      
      metadata,
      
      geolocation,
      deviceInfo: navigator.userAgent,
    };

    setEvents([event, ...events]);
    

  };

  // Récupération par utilisateur
  const getEventsByUser = (userId: string): AuditEvent[] => {
    return events.filter(e => e.userId === userId);
  };

  // Récupération par entité
  const getEventsByEntity = (entityType: AuditEntityType, entityId: string): AuditEvent[] => {
    return events.filter(e => e.entityType === entityType && e.entityId === entityId);
  };

  // Récupération par action
  const getEventsByAction = (action: AuditAction): AuditEvent[] => {
    return events.filter(e => e.action === action);
  };

  // Événements récents
  const getRecentEvents = (limit: number = 50): AuditEvent[] => {
    return events.slice(0, limit);
  };

  // Export audit trail (avec filtres)
  const exportAuditTrail = (
    userId?: string,
    startDate?: string,
    endDate?: string
  ): AuditEvent[] => {
    let filtered = events;

    if (userId) {
      filtered = filtered.filter(e => e.userId === userId);
    }

    if (startDate) {
      filtered = filtered.filter(e => new Date(e.timestamp) >= new Date(startDate));
    }

    if (endDate) {
      filtered = filtered.filter(e => new Date(e.timestamp) <= new Date(endDate));
    }

    return filtered;
  };

  const value: AuditContextType = {
    events,
    logEvent,
    getEventsByUser,
    getEventsByEntity,
    getEventsByAction,
    getRecentEvents,
    exportAuditTrail,
  };

  return <AuditContext.Provider value={value}>{children}</AuditContext.Provider>;
}

export function useAudit() {
  const context = useContext(AuditContext);
  if (context === undefined) {
    throw new Error('useAudit doit être utilisé dans un AuditProvider');
  }
  return context;
}
