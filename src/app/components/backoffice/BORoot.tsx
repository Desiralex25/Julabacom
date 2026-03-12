import React, { Suspense } from 'react';
import { Navigate } from 'react-router';
import { useBackOfficeOptional } from '../../contexts/BackOfficeContext';
import { BOLayout } from './BOLayout';
import { Loader2 } from 'lucide-react';

/**
 * BORoot — Orchestrateur unique du Back-Office.
 *
 * Logique :
 * - NON connecté => redirect vers /backoffice/login
 * - Connecté => affiche BOLayout (avec Outlet pour le module)
 */
export function BORoot() {
  const context = useBackOfficeOptional();
  
  // ── Context non disponible → Afficher un loader ────────────────
  if (!context) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-amber-600" />
          <p className="text-sm font-bold text-gray-600">Initialisation du BackOffice...</p>
        </div>
      </div>
    );
  }

  const { boUser } = context;

  // ── Non connecté → Redirection vers login ──────────────────────
  if (!boUser) {
    return <Navigate to="/backoffice/login" replace />;
  }

  // ── Connecté → Affiche le layout avec modules ─────────────────
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-amber-600" />
          <p className="text-sm font-bold text-gray-600">Chargement du module...</p>
        </div>
      </div>
    }>
      <BOLayout />
    </Suspense>
  );
}