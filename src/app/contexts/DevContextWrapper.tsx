/**
 * ═══════════════════════════════════════════════════════════════════
 * JÙLABA — DevContextWrapper
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Wrapper qui désactive les appels API pour tous les contextes en mode dev
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { DEV_MODE, devLog } from '../config/devMode';
import { DEV_USER, DEV_EMPTY_DATA } from '../data/devMockData';
import type { User } from './AppContext';

interface DevContextWrapperType {
  user: User | null;
  isLoading: false;
  error: null;
}

const DevContext = createContext<DevContextWrapperType | undefined>(undefined);

export function DevContextWrapper({ children }: { children: ReactNode }) {
  if (!DEV_MODE) {
    return <>{children}</>;
  }

  devLog('DevContextWrapper', 'Mode dev activé - Tous les contextes utilisent des données vides');

  const value: DevContextWrapperType = {
    user: DEV_USER,
    isLoading: false,
    error: null,
  };

  return (
    <DevContext.Provider value={value}>
      {children}
    </DevContext.Provider>
  );
}

export function useDevContext() {
  return useContext(DevContext);
}

// Helper pour wrapper les appels API en mode dev
export async function devApiCall<T>(
  apiCall: () => Promise<T>,
  mockData: T,
  endpoint: string
): Promise<T> {
  if (DEV_MODE) {
    devLog('API', `Appel ignoré : ${endpoint} - Retour données mock`);
    // Simuler un délai réseau minimal
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockData;
  }
  return apiCall();
}

// Helper pour les mutations en mode dev (ne fait rien)
export async function devMutation<T>(
  mutation: () => Promise<T>,
  endpoint: string
): Promise<T | null> {
  if (DEV_MODE) {
    devLog('MUTATION', `Mutation ignorée : ${endpoint}`);
    await new Promise(resolve => setTimeout(resolve, 100));
    return null as any;
  }
  return mutation();
}
