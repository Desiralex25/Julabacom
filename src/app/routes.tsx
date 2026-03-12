import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router';

// Layout
import { RootLayout } from './components/layout/RootLayout';
import { AppLayout } from './components/layout/AppLayout';

// Auth & Entry
import { EntryGate } from './components/auth/EntryGate';
import { LoginPassword } from './components/auth/LoginPassword';
import { Onboarding } from './components/auth/Onboarding';
import { Welcome } from './components/auth/Welcome';

// Diagnostic / Utilitaires
import SupabaseTestPage from './pages/SupabaseTestPage';
import AuthTestPage from './pages/AuthTestPage';
import TestTantie from './pages/TestTantie';
import TestElevenLabs from './pages/TestElevenLabs';
import DatabaseViewer from './pages/DatabaseViewer';
import CreateSuperAdmin from './pages/CreateSuperAdmin';
import DiagnosticDB from './pages/DiagnosticDB';
import AdminRecovery from './pages/AdminRecovery';
import { DevModeHome } from './pages/DevModeHome';
import SetupMarchand from './pages/SetupMarchand';

// ── MARCHAND ─────────────────────────────────────────────────────────────────
import { MarchandHome } from './components/marchand/MarchandHome';
import { POSCaisse } from './components/marchand/POSCaisse';
import { MarchandDepenses } from './components/marchand/MarchandDepenses';
import { GestionStock } from './components/marchand/GestionStock';
import { MarcheVirtuel } from './components/marchand/MarcheVirtuel';
import { MarchandProfil } from './components/marchand/MarchandProfil';
import { VentesPassees } from './components/marchand/VentesPassees';
import { ResumeCaisse } from './components/marchand/ResumeCaisse';
import { MesCommandes } from './components/marchand/MesCommandes';
import { Parametres } from './components/marchand/Parametres';
import { MarchandAlertes } from './components/marchand/MarchandAlertes';

// ── PRODUCTEUR ────────────────────────────────────────────────────────────────
import { ProducteurHome } from './components/producteur/ProducteurHome';
import { ProducteurProduction } from './components/producteur/ProducteurProduction';
import { ProducteurMoi } from './components/producteur/ProducteurMoi';
import { RecolteForm } from './components/producteur/RecolteForm';
import { MesRecoltesPage } from './components/producteur/MesRecoltesPage';
import { StocksWrapper } from './components/producteur/StocksWrapper';
import { PublierRecolte } from './components/producteur/PublierRecolte';
import { ProducteurParametres } from './components/producteur/ProducteurParametres';
import { ProducteurAlertes } from './components/producteur/ProducteurAlertes';
import { ProducteurCommandes } from './components/producteur/CommandesProducteurPage';

// ── COOPERATIVE ───────────────────────────────────────────────────────────────
import { CooperativeHome } from './components/cooperative/CooperativeHome';
import { Membres } from './components/cooperative/Membres';
import { FinancesCooperative } from './components/cooperative/FinancesCooperative';
import { CooperativeProfil } from './components/cooperative/CooperativeProfil';
import { Stock } from './components/cooperative/Stock';
import { TresorerieCooperative } from './components/cooperative/TresorerieCooperative';
import { GestionMembres } from './components/cooperative/GestionMembres';
import { MarcheHub } from './components/cooperative/MarcheHub';
import { Commandes } from './components/cooperative/Commandes';
import { CooperativeParametres } from './components/cooperative/CooperativeParametres';

// ── INSTITUTION ───────────────────────────────────────────────────────────────
import { InstitutionLayout } from './components/institution/InstitutionLayout';
import { InstitutionHome } from './components/institution/InstitutionHome';
import { Analytics } from './components/institution/Analytics';
import { InstitutionActeurs } from './components/institution/InstitutionActeurs';
import { InstitutionSupervision } from './components/institution/InstitutionSupervision';
import { InstitutionParametres } from './components/institution/InstitutionParametres';
import { InstitutionProfil } from './components/institution/InstitutionProfil';
import { Dashboard } from './components/institution/Dashboard';
import { DashboardAnalytics } from './components/institution/DashboardAnalytics';
import { AuditTrail } from './components/institution/AuditTrail';

// ── MARKETPLACE ───────────────────────────────────────────────────────────────
import { Marketplace } from './components/marketplace/Marketplace';

// ── IDENTIFICATEUR ────────────────────────────────────────────────────────────
import { IdentificateurLayout } from './components/identificateur/IdentificateurLayout';
import { IdentificateurHome } from './components/identificateur/IdentificateurHome';
import { IdentificationPage } from './components/identificateur/IdentificationPage';
import { SuiviIdentifications } from './components/identificateur/SuiviIdentifications';
import { IdentificateurProfil } from './components/identificateur/IdentificateurProfil';
import { ActeurDetails } from './components/identificateur/ActeurDetails';
import { DemandeMutation } from './components/identificateur/DemandeMutation';
import { Identifications } from './components/identificateur/Identifications';
import { IdentificateurStats } from './components/identificateur/IdentificateurStats';
import { RapportsIdentificateur } from './components/identificateur/RapportsIdentificateur';
import { NouveauMarchand } from './components/identificateur/NouveauMarchand';
import { FormulaireIdentificationMarchand } from './components/identificateur/FormulaireIdentificationMarchand';
import { FicheMarchand } from './components/identificateur/FicheMarchand';
import { IdentificateurDashboard } from './components/identificateur/IdentificateurDashboard';
import { NouvelleIdentification } from './components/identificateur/NouvelleIdentification';
import { FicheIdentificationDynamique } from './components/identificateur/FicheIdentificationDynamique';
import { IdentificateurParametres } from './components/identificateur/IdentificateurParametres';

// ── PARTAGÉS ──────────────────────────────────────────────────────────────────
import { UniversalAcademy } from './components/academy/UniversalAcademy';
import { WalletPage } from './components/wallet/WalletPage';
import { SupportPage } from './components/shared/SupportPage';

// ── BACK-OFFICE ───────────────────────────────────────────────────────────────
import { BORoot } from './components/backoffice/BORoot';
import { BOLogin } from './components/backoffice/BOLogin';
// Lazy load des composants BackOffice pour optimiser la performance
import { lazy } from 'react';
const BODashboard = lazy(() => import('./components/backoffice/BODashboard').then(m => ({ default: m.BODashboard })));
const BOActeurs = lazy(() => import('./components/backoffice/BOActeurs').then(m => ({ default: m.BOActeurs })));
const BOActeurDetail = lazy(() => import('./components/backoffice/BOActeurDetail').then(m => ({ default: m.BOActeurDetail })));
const BOEnrolement = lazy(() => import('./components/backoffice/BOEnrolement').then(m => ({ default: m.BOEnrolement })));
const BOSupervision = lazy(() => import('./components/backoffice/BOSupervision').then(m => ({ default: m.BOSupervision })));
const BOZones = lazy(() => import('./components/backoffice/BOZones').then(m => ({ default: m.BOZones })));
const BOAcademy = lazy(() => import('./components/backoffice/BOAcademy').then(m => ({ default: m.BOAcademy })));
const BOMissions = lazy(() => import('./components/backoffice/BOMissions').then(m => ({ default: m.BOMissions })));
const BOParametres = lazy(() => import('./components/backoffice/BOParametres').then(m => ({ default: m.BOParametres })));
const BOAudit = lazy(() => import('./components/backoffice/BOAudit').then(m => ({ default: m.BOAudit })));
const BOUtilisateurs = lazy(() => import('./components/backoffice/BOUtilisateurs').then(m => ({ default: m.BOUtilisateurs })));
const BOInstitutions = lazy(() => import('./components/backoffice/BOInstitutions').then(m => ({ default: m.BOInstitutions })));
const BOProfil = lazy(() => import('./components/backoffice/BOProfil').then(m => ({ default: m.BOProfil })));
const BORapports = lazy(() => import('./components/backoffice/BORapports').then(m => ({ default: m.BORapports })));
const BONotifications = lazy(() => import('./components/backoffice/BONotifications').then(m => ({ default: m.BONotifications })));
const BOSupport = lazy(() => import('./components/backoffice/BOSupport').then(m => ({ default: m.BOSupport })));

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <EntryGate /> },
      { path: '/onboarding', element: <Onboarding /> },
      { path: '/welcome', element: <Welcome /> },
      { path: '/login', element: <LoginPassword /> },
      { path: '/dev-mode', element: <DevModeHome /> },

      // Diagnostic / Utilitaires
      { path: '/supabase-test', element: <SupabaseTestPage /> },
      { path: '/auth-test', element: <AuthTestPage /> },
      { path: '/test-tantie', element: <TestTantie /> },
      { path: '/test-elevenlabs', element: <TestElevenLabs /> },
      { path: '/database', element: <DatabaseViewer /> },
      { path: '/create-super-admin', element: <CreateSuperAdmin /> },
      { path: '/diagnostic-db', element: <DiagnosticDB /> },
      { path: '/admin-recovery', element: <AdminRecovery /> },
      { path: '/setup-marchand', element: <SetupMarchand /> },

      // ── MARCHAND ────────────────────────────────────────────────────────────
      {
        path: '/marchand',
        element: <AppLayout />,
        children: [
          { index: true, element: <MarchandHome /> },
          { path: 'caisse', element: <POSCaisse /> },
          { path: 'depenses', element: <MarchandDepenses /> },
          { path: 'stock', element: <GestionStock /> },
          { path: 'marche', element: <MarcheVirtuel /> },
          { path: 'profil', element: <MarchandProfil /> },
          { path: 'ventes-passees', element: <VentesPassees /> },
          { path: 'resume-caisse', element: <ResumeCaisse /> },
          { path: 'commandes', element: <MesCommandes /> },
          { path: 'parametres', element: <Parametres /> },
          { path: 'academy', element: <UniversalAcademy /> },
          { path: 'wallet', element: <WalletPage /> },
          { path: 'alertes', element: <MarchandAlertes /> },
          { path: 'support', element: <SupportPage /> },
        ],
      },

      // ── PRODUCTEUR ──────────────────────────────────────────────────────────
      {
        path: '/producteur',
        element: <AppLayout />,
        children: [
          { index: true, element: <ProducteurHome /> },
          { path: 'production', element: <ProducteurProduction /> },
          { path: 'commandes', element: <ProducteurCommandes /> },
          { path: 'profil', element: <ProducteurMoi /> },
          { path: 'declarer-recolte', element: <RecolteForm /> },
          { path: 'recoltes', element: <MesRecoltesPage /> },
          { path: 'stocks', element: <StocksWrapper /> },
          { path: 'publier-recolte', element: <PublierRecolte /> },
          { path: 'academy', element: <UniversalAcademy /> },
          { path: 'wallet', element: <WalletPage /> },
          { path: 'parametres', element: <ProducteurParametres /> },
          { path: 'alertes', element: <ProducteurAlertes /> },
          { path: 'support', element: <SupportPage /> },
        ],
      },

      // ── COOPERATIVE ─────────────────────────────────────────────────────────
      {
        path: '/cooperative',
        element: <AppLayout />,
        children: [
          { index: true, element: <CooperativeHome /> },
          { path: 'membres', element: <Membres /> },
          { path: 'finances', element: <FinancesCooperative /> },
          { path: 'profil', element: <CooperativeProfil /> },
          { path: 'stock', element: <Stock /> },
          { path: 'tresorerie', element: <TresorerieCooperative /> },
          { path: 'gestion-membres', element: <GestionMembres /> },
          { path: 'marche', element: <MarcheHub /> },
          { path: 'commandes', element: <Commandes /> },
          { path: 'academy', element: <UniversalAcademy /> },
          { path: 'wallet', element: <WalletPage /> },
          { path: 'parametres', element: <CooperativeParametres /> },
          { path: 'support', element: <SupportPage /> },
        ],
      },

      // ── INSTITUTION ─────────────────────────────────────────────────────────
      {
        path: '/institution',
        element: <InstitutionLayout />,
        children: [
          { index: true, element: <InstitutionHome /> },
          { path: 'analytics', element: <Analytics /> },
          { path: 'acteurs', element: <InstitutionActeurs /> },
          { path: 'supervision', element: <InstitutionSupervision /> },
          { path: 'parametres', element: <InstitutionParametres /> },
          { path: 'profil', element: <InstitutionProfil /> },
          { path: 'dashboard', element: <Dashboard /> },
          { path: 'dashboard-analytics', element: <DashboardAnalytics /> },
          { path: 'audit-trail', element: <AuditTrail /> },
          { path: 'academy', element: <UniversalAcademy /> },
          { path: 'wallet', element: <WalletPage /> },
          { path: 'support', element: <SupportPage /> },
        ],
      },

      // ── MARKETPLACE ─────────────────────────────────────────────────────────
      {
        path: '/marketplace',
        element: <AppLayout />,
        children: [
          { index: true, element: <Marketplace /> },
        ],
      },

      // ── IDENTIFICATEUR ──────────────────────────────────────────────────────
      {
        path: '/identificateur',
        element: <IdentificateurLayout />,
        children: [
          { index: true, element: <IdentificateurHome /> },
          { path: 'identification', element: <IdentificationPage /> },
          { path: 'suivi', element: <SuiviIdentifications /> },
          { path: 'profil', element: <IdentificateurProfil /> },
          { path: 'acteur/:numero', element: <ActeurDetails /> },
          { path: 'demande-mutation', element: <DemandeMutation /> },
          { path: 'identifications', element: <Identifications /> },
          { path: 'statistiques', element: <IdentificateurStats /> },
          { path: 'rapports', element: <RapportsIdentificateur /> },
          { path: 'nouveau-marchand', element: <NouveauMarchand /> },
          { path: 'formulaire-identification-marchand', element: <FormulaireIdentificationMarchand /> },
          { path: 'fiche-marchand', element: <FicheMarchand /> },
          { path: 'dashboard', element: <IdentificateurDashboard /> },
          { path: 'nouvelle-identification', element: <NouvelleIdentification /> },
          { path: 'fiche-identification', element: <FicheIdentificationDynamique /> },
          { path: 'academy', element: <UniversalAcademy /> },
          { path: 'wallet', element: <WalletPage /> },
          { path: 'parametres', element: <IdentificateurParametres /> },
          { path: 'support', element: <SupportPage /> },
        ],
      },

      // ── BACK-OFFICE CENTRAL ─────────────────────────────────────────────────
      { path: '/backoffice/login', element: <BOLogin /> },
      {
        path: '/backoffice',
        element: <BORoot />,
        children: [
          { index: true, element: <Navigate to="/backoffice/dashboard" replace /> },
          { path: 'dashboard', element: <BODashboard /> },
          { path: 'acteurs', element: <BOActeurs /> },
          { path: 'acteurs/:id', element: <BOActeurDetail /> },
          { path: 'enrolement', element: <BOEnrolement /> },
          { path: 'supervision', element: <BOSupervision /> },
          { path: 'zones', element: <BOZones /> },
          { path: 'academy', element: <BOAcademy /> },
          { path: 'missions', element: <BOMissions /> },
          { path: 'parametres', element: <BOParametres /> },
          { path: 'audit', element: <BOAudit /> },
          { path: 'utilisateurs', element: <BOUtilisateurs /> },
          { path: 'institutions', element: <BOInstitutions /> },
          { path: 'profil', element: <BOProfil /> },
          { path: 'rapports', element: <BORapports /> },
          { path: 'notifications', element: <BONotifications /> },
          { path: 'support', element: <BOSupport /> },
        ],
      },

      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);