import React from 'react';
import { Navigate } from 'react-router';
import { useBackOffice } from '../../contexts/BackOfficeContext';
import { BOLayout } from './BOLayout';

/**
 * BORoot — Orchestrateur unique du Back-Office.
 *
 * Logique :
 * - NON connecté => redirect vers /backoffice/login
 * - Connecté => affiche BOLayout (avec Outlet pour le module)
 */
export function BORoot() {
  const { boUser } = useBackOffice();

  // ── Non connecté → Redirection vers login ──────────────────────
  if (!boUser) {
    return <Navigate to="/backoffice/login" replace />;
  }

  // ── Connecté → Affiche le layout avec modules ─────────────────
  return <BOLayout />;
}
