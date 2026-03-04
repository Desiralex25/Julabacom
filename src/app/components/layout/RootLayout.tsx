import React from 'react';
import { Outlet } from 'react-router';
import { BackOfficeProvider } from '../../contexts/BackOfficeContext';
import { SupportConfigProvider } from '../../contexts/SupportConfigContext';
import { TicketsProvider } from '../../contexts/TicketsContext';

export function RootLayout() {
  return (
    <BackOfficeProvider>
      <SupportConfigProvider>
        <TicketsProvider>
          <Outlet />
        </TicketsProvider>
      </SupportConfigProvider>
    </BackOfficeProvider>
  );
}