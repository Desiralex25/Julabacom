/**
 * DevContextWrapper — stub production.
 * Le mode dev est définitivement désactivé. Ce fichier ne fait que passer les enfants.
 */
import React, { createContext, useContext, ReactNode } from 'react';

interface DevContextWrapperType {
  user: null;
  isLoading: false;
  error: null;
}

const DevContext = createContext<DevContextWrapperType | undefined>(undefined);

export function DevContextWrapper({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useDevContext() {
  return useContext(DevContext);
}

export async function devApiCall<T>(apiCall: () => Promise<T>, _mockData: T, _endpoint: string): Promise<T> {
  return apiCall();
}

export async function devMutation<T>(mutation: () => Promise<T>, _endpoint: string): Promise<T | null> {
  return mutation();
}
