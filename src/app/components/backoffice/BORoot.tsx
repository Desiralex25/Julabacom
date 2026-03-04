import React from 'react';
import { Navigate, useLocation } from 'react-router';
import { useBackOffice } from '../../contexts/BackOfficeContext';
import { BOLogin } from './BOLogin';
import { BOLayout } from './BOLayout';

/**
 * BORoot — Orchestrateur unique du Back-Office.
 *
 * Logique :
 * - NON connecté + /backoffice (index)  => affiche BOLogin
 * - NON connecté + /backoffice/xxx      => redirect vers /backoffice (login)
 * - Connecté + /backoffice (index)      => redirect vers /backoffice/dashboard
 * - Connecté + /backoffice/xxx          => BOLayout (avec Outlet pour le module)
 */
export function BORoot() {
  const { boUser } = useBackOffice();
  const location = useLocation();

  const isIndex =
    location.pathname === '/backoffice' || location.pathname === '/backoffice/';

  // ── Non connecté ──────────────────────────────────────────────
  if (!boUser) {
    if (isIndex) return <BOLogin />;
    return <Navigate to="/backoffice" replace />;
  }

  // ── Connecté ──────────────────────────────────────────────────
  if (isIndex) return <Navigate to="/backoffice/dashboard" replace />;

  // Rend BOLayout qui contient <Outlet /> pour les modules enfants
  return <BOLayout />;
}
