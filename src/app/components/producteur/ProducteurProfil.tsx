import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Phone,
  MapPin,
  Award,
  TrendingUp,
  Calendar,
  FileText,
  Settings,
  Bell,
  Lock,
  LogOut,
  Edit3,
  Camera,
  ChevronRight,
  Shield,
  Sprout,
  Tractor,
  BarChart3,
  History,
  Star,
  CheckCircle,
  Globe,
  Mic,
  Volume2,
  Moon,
  Mail,
  Building2,
  Leaf,
  Target,
  Package,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { useApp } from '../../contexts/AppContext';
import { useUser } from '../../contexts/UserContext';
import { Navigation } from '../layout/Navigation';
import { Button } from '../ui/button';
import { Counter } from '../ui/counter';
import { InfoPersonnellesModalUniversal } from '../shared/InfoPersonnellesModalUniversal';
import { DocumentsCertificationsModalUniversal } from '../shared/DocumentsCertificationsModalUniversal';
import { DocumentModal } from '../marchand/DocumentModal';
import { IdentificationInfoBadge } from '../shared/IdentificationInfoBadge';
import { NotificationsPanel, NotifBellButton } from '../shared/NotificationsPanel';
import { DocumentData, DocumentStatus } from '../../types/document';
import { PartenairesLogos } from '../shared/PartenairesLogos';

export function ProducteurProfil() {
  const navigate = useNavigate();
  const { speak, setIsModalOpen } = useApp();
  const { user: contextUser, updateUser, logout: userLogout } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showInfoPersonnelles, setShowInfoPersonnelles] = useState(false);
  const [showDocumentsCertifications, setShowDocumentsCertifications] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);

  // 🎨 Couleur du rôle Producteur
  const roleColor = '#2E8B57';

  // État des documents avec données complètes
  const [documents, setDocuments] = useState<{ [key: string]: DocumentData }>({
    'carte-identite': {
      id: 'doc-prod-001',
      type: 'carte-identite',
      title: 'Carte d\'identité',
      status: 'verified' as DocumentStatus,
      imageUrl: 'https://images.unsplash.com/photo-1635231152740-dcfba853f33d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpZGVudGl0eSUyMGNhcmQlMjBkb2N1bWVudHxlbnwxfHx8fDE3NzIzNzQ1NjV8MA&ixlib=rb-4.1.0&q=80&w=1080',
      uploadedAt: '2024-01-15T10:00:00Z',
      verifiedAt: '2024-01-15T14:30:00Z',
      verifiedBy: 'Jean Koffi - Bureau Bouaké',
      rejectionReason: null,
      expirationDate: '2029-01-15',
      isLocked: true,
      details: {
        'Numéro': 'CI-2024-PROD-001',
        'Date d\'émission': '15 Jan 2024',
        'Date d\'expiration': '15 Jan 2029',
        'Lieu d\'émission': 'Bouaké, Côte d\'Ivoire',
        'Type': 'Carte Nationale d\'Identité',
      },
    },
    'certification-julaba': {
      id: 'doc-prod-002',
      type: 'certification-julaba',
      title: 'Certification JULABA Producteur',
      status: 'verified' as DocumentStatus,
      imageUrl: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjZXJ0aWZpY2F0ZSUyMGRvY3VtZW50fGVufDF8fHx8MTczOTIwMzYyNnww&ixlib=rb-4.1.0&q=80&w=1080',
      uploadedAt: '2024-01-15T12:00:00Z',
      verifiedAt: '2024-01-16T09:00:00Z',
      verifiedBy: 'Aminata Touré - JULABA Certification',
      rejectionReason: null,
      expirationDate: '2025-01-15',
      isLocked: false,
      details: {
        'Numéro de certification': 'JULABA-PROD-2024-001234',
        'Date de délivrance': '16 Jan 2024',
        'Validité': '1 an',
        'Type': 'Certification Producteur',
      },
    },
    'attestation-activite': {
      id: 'doc-prod-003',
      type: 'attestation-activite',
      title: 'Titre foncier',
      status: 'pending' as DocumentStatus,
      imageUrl: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2N1bWVudCUyMHBhcGVyfGVufDF8fHx8MTczOTIwMzY0MXww&ixlib=rb-4.1.0&q=80&w=1080',
      uploadedAt: '2024-02-20T15:30:00Z',
      verifiedAt: null,
      verifiedBy: null,
      rejectionReason: null,
      expirationDate: null,
      isLocked: false,
      details: {
        'Numéro de dossier': 'TF-2024-0567',
        'Date de soumission': '20 Fév 2024',
        'Statut': 'En cours de vérification',
      },
    },
  });

  const user = contextUser || {
    nom: 'KONÉ',
    prenoms: 'Yao Serge',
    telephone: '+225 05 98 76 54 32',
    email: 'yao.kone@julaba.ci',
    localisation: 'Bouaké, Région du Gbêkê',
    typeActivite: 'Maraîchage et cultures vivrières',
    superficie: '2.5 hectares',
    numeroProducteur: 'PROD-CI-2024-1234',
    dateInscription: '2024-01-15',
    statut: 'Actif',
    niveauMembre: 'Expert',
    scoreCredit: 88,
  };

  // Stats fictives
  const stats = {
    recoltes: 1250,
    ventes: 850000,
    stocks: 420,
  };

  const totalRecoltes = 45;
  const totalVentes = 38;

  // Calcul des documents complétés
  const totalDocuments = Object.keys(documents).length;
  const completedDocuments = Object.values(documents).filter(
    (doc) => doc.status === 'verified'
  ).length;

  const handleLogout = () => {
    speak('Déconnexion en cours');
    if (userLogout) {
      userLogout();
    }
    setTimeout(() => {
      navigate('/login');
    }, 1000);
  };

  const handleSaveInfoPersonnelles = (updatedData: any) => {
    if (updateUser) {
      updateUser(updatedData);
    }
  };

  const handleDocumentClick = (documentType: string) => {
    setShowDocumentModal(documentType);
    setShowDocumentsCertifications(false);
  };

  // Gérer l'ouverture/fermeture des modals et masquer la bottom bar
  const openInfoPersonnelles = () => {
    setShowInfoPersonnelles(true);
    setIsModalOpen(true);
    speak('Ouverture des informations personnelles');
  };

  const closeInfoPersonnelles = () => {
    setShowInfoPersonnelles(false);
    setIsModalOpen(false);
  };

  const openDocumentsCertifications = () => {
    setShowDocumentsCertifications(true);
    setIsModalOpen(true);
    speak('Ouverture des documents et certifications');
  };

  const closeDocumentsCertifications = () => {
    setShowDocumentsCertifications(false);
    setIsModalOpen(false);
  };

  const closeDocumentModal = () => {
    setShowDocumentModal(null);
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="pb-32 lg:pb-8 pt-24 lg:pt-16 px-4 lg:pl-[320px] max-w-2xl lg:max-w-7xl mx-auto min-h-screen bg-gradient-to-b from-green-50 to-white">
        
        {/* Card Profil Principal - Style Dashboard */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="mb-4"
        >
          <div 
            className="rounded-3xl p-6 border-2 shadow-lg relative overflow-hidden"
            style={{ borderColor: '#00563B' }}
          >
            {/* Fond animé */}
            <motion.div
              className="absolute inset-0 opacity-5"
              style={{ background: 'linear-gradient(135deg, #00563B 0%, #16A34A 100%)' }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            />

            <div className="relative z-10">
              {/* Photo + Nom */}
              <div className="flex items-center gap-4 mb-6">
                <motion.div
                  className="relative"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div 
                    className="w-20 h-20 rounded-full flex items-center justify-center border-4 shadow-xl"
                    style={{ 
                      backgroundColor: 'rgba(0, 86, 59, 0.13)',
                      borderColor: '#00563B'
                    }}
                  >
                    <Sprout className="w-10 h-10" style={{ color: '#00563B' }} strokeWidth={2} />
                  </div>
                  <button
                    className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-lg border-2"
                    style={{ borderColor: '#00563B' }}
                    onClick={() => speak('Modifier la photo de profil')}
                  >
                    <Camera className="w-4 h-4" style={{ color: '#00563B' }} />
                  </button>
                </motion.div>

                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {user.prenoms} {user.nom}
                  </h2>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Shield className="w-4 h-4" style={{ color: '#00563B' }} />
                    {user.numeroProducteur}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 border border-green-300">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      <span className="text-xs font-bold text-green-700">{user.statut}</span>
                    </div>
                    <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 border border-yellow-300">
                      <Star className="w-3 h-3 text-yellow-600" />
                      <span className="text-xs font-bold text-yellow-700">{user.niveauMembre}</span>
                    </div>
                  </div>
                </div>

                {/* Bouton Settings + Cloche Notifications */}
                <div className="flex items-center gap-2">
                  {/* Cloche Notifications */}
                  <NotifBellButton
                    userId={(contextUser as any)?.id || 'user-prod-001'}
                    accentColor="#2E8B57"
                    onOpen={() => setShowNotifications(true)}
                  />
                  <motion.button
                    onClick={() => setShowSettings(true)}
                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Settings className="w-5 h-5 text-gray-700" />
                  </motion.button>
                </div>
              </div>

              {/* Score JULABA - Grand et visible */}
              <div 
                className="flex items-center justify-between p-4 rounded-2xl border-2 border-green-200"
                style={{ background: 'linear-gradient(to right, #dcfce7, #d1fae5)' }}
              >
                <div>
                  <p className="text-sm text-gray-600 font-semibold mb-1">Score JULABA</p>
                  <p className="text-4xl font-black" style={{ color: '#00563B' }}>
                    <Counter value={user.scoreCredit} duration={1500} />
                  </p>
                </div>
                <motion.div
                  className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                >
                  <Award className="w-8 h-8" style={{ color: '#00563B' }} />
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats KPIs - Style Dashboard en 2 colonnes */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="mb-4"
        >
          <div className="grid grid-cols-2 gap-3">
            {/* Total Récoltes */}
            <motion.div
              className="p-3 rounded-3xl border-2 bg-gradient-to-br from-green-50 via-white to-green-50 shadow-md"
              style={{ borderColor: '#16A34A' }}
              whileHover={{ scale: 1.05, y: -4, boxShadow: '0 10px 30px rgba(22, 163, 74, 0.15)' }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-medium mb-0.5 font-bold text-[16px] text-gray-600">
                    Récoltes
                  </p>
                  <p className="text-xs text-gray-600">Total enregistrées</p>
                </div>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-green-100"
                >
                  <Leaf className="w-5 h-5 text-green-600" />
                </motion.div>
              </div>
              <p className="text-3xl font-bold text-green-600">{totalRecoltes}</p>
            </motion.div>

            {/* Total Ventes */}
            <motion.div
              className="p-3 rounded-3xl border-2 bg-gradient-to-br from-blue-50 via-white to-blue-50 shadow-md"
              style={{ borderColor: '#2563EB' }}
              whileHover={{ scale: 1.05, y: -4, boxShadow: '0 10px 30px rgba(37, 99, 235, 0.15)' }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-medium mb-0.5 font-bold text-[16px] text-gray-600">
                    Ventes
                  </p>
                  <p className="text-xs text-gray-600">Total effectuées</p>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-100"
                >
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </motion.div>
              </div>
              <p className="text-3xl font-bold text-blue-600">{totalVentes}</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Fiche d'identification JULABA - Badge synchronisé */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
          className="mb-4"
        >
          <IdentificationInfoBadge
            numeroFiche={(user as any).numeroProducteur || 'PROD-2026-0001'}
            nomAgent={(user as any).nomAgent || 'BAMBA'}
            prenomAgent={(user as any).prenomAgent || 'Issa'}
            dateIdentification={(user as any).dateIdentification || '2026-02-28T08:15:00Z'}
            statut={(user as any).statutIdentification || 'soumis'}
            raisonsRejet={(user as any).raisonsRejetIdentification}
            accentColor="#2E8B57"
          />
        </motion.div>

        {/* Informations Personnelles - Style Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mb-4"
        >
          <motion.button
            onClick={openInfoPersonnelles}
            className="w-full p-5 rounded-3xl bg-gradient-to-br from-green-50 via-white to-green-50 border-2 shadow-md flex items-center justify-between"
            style={{ borderColor: roleColor }}
            whileHover={{ scale: 1.02, y: -2, boxShadow: '0 10px 30px rgba(46, 139, 87, 0.15)' }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-4">
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center shadow-md"
                style={{ backgroundColor: `${roleColor}20` }}
              >
                <User className="w-7 h-7" style={{ color: roleColor }} />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-gray-900">Informations personnelles</h3>
                <p className="text-sm text-gray-600">Gérer tes coordonnées</p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-gray-400" />
          </motion.button>
        </motion.div>

        {/* Activité du jour - Style Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          className="mb-4"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-3">Activité du jour</h3>
          <div className="grid grid-cols-2 gap-3">
            {/* Récoltes du jour */}
            <ActivityCard
              icon={Leaf}
              label="Récoltes"
              value={`${stats.recoltes.toLocaleString()} kg`}
              color="#16A34A"
              bgColor="from-green-50 via-white to-green-50"
              borderColor="#16A34A"
            />

            {/* Ventes du jour */}
            <ActivityCard
              icon={TrendingUp}
              label="Ventes"
              value={`${stats.ventes.toLocaleString('fr-FR')} FCFA`}
              color="#2563EB"
              bgColor="from-blue-50 via-white to-blue-50"
              borderColor="border-blue-200"
              delay={0.2}
            />

            {/* Stocks */}
            <ActivityCard
              icon={Package}
              label="Stocks"
              value={`${stats.stocks.toLocaleString()} kg`}
              color="#00563B"
              bgColor="from-green-50 via-white to-green-50"
              borderColor="#00563B"
            />

            {/* Score */}
            <ActivityCard
              icon={Award}
              label="Score"
              value={`${user.scoreCredit}/100`}
              color="#F59E0B"
              bgColor="from-orange-50 via-white to-orange-50"
              borderColor="#F59E0B"
            />
          </div>
        </motion.div>

        {/* Documents & Certifications - Style Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
          className="mb-4"
        >
          <motion.button
            onClick={openDocumentsCertifications}
            className="w-full p-5 rounded-3xl bg-gradient-to-br from-gray-50 via-white to-gray-50 border-2 shadow-md flex items-center justify-between"
            style={{ borderColor: roleColor }}
            whileHover={{ scale: 1.02, y: -2, boxShadow: '0 10px 30px rgba(46, 139, 87, 0.15)' }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-4">
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center shadow-md"
                style={{ backgroundColor: `${roleColor}20` }}
              >
                <FileText className="w-7 h-7" style={{ color: roleColor }} />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-gray-900">Documents & Certifications</h3>
                <p className="text-sm text-gray-600">{completedDocuments}/{totalDocuments} documents vérifiés</p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-gray-400" />
          </motion.button>
        </motion.div>

        {/* Actions rapides - Style Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
          className="mb-4"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-3">Actions rapides</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              onClick={() => speak('Paramètres de notification')}
              className="p-4 rounded-2xl bg-white border-2 border-gray-200 flex flex-col items-start gap-2 shadow-sm hover:border-[#00563B]"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Bell className="w-6 h-6" style={{ color: '#00563B' }} />
              <p className="font-bold text-sm text-gray-900">Notifications</p>
            </motion.button>

            <motion.button
              onClick={() => speak('Sécurité et confidentialité')}
              className="p-4 rounded-2xl bg-white border-2 border-gray-200 flex flex-col items-start gap-2 shadow-sm hover:border-[#00563B]"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Lock className="w-6 h-6" style={{ color: '#00563B' }} />
              <p className="font-bold text-sm text-gray-900">Sécurité</p>
            </motion.button>

            <motion.button
              onClick={() => speak('Assistance vocale')}
              className="p-4 rounded-2xl bg-white border-2 border-gray-200 flex flex-col items-start gap-2 shadow-sm hover:border-[#00563B]"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Volume2 className="w-6 h-6" style={{ color: '#00563B' }} />
              <p className="font-bold text-sm text-gray-900">Assistance</p>
            </motion.button>

            <motion.button
              onClick={() => speak('Langue et région')}
              className="p-4 rounded-2xl bg-white border-2 border-gray-200 flex flex-col items-start gap-2 shadow-sm hover:border-[#00563B]"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Globe className="w-6 h-6" style={{ color: '#00563B' }} />
              <p className="font-bold text-sm text-gray-900">Langue</p>
            </motion.button>
          </div>
        </motion.div>

        {/* Bouton Déconnexion - Style Dashboard */}
        <motion.button
          onClick={handleLogout}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
          className="w-full py-4 rounded-2xl bg-red-500 text-white font-bold shadow-lg flex items-center justify-center gap-2 hover:bg-red-600"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <LogOut className="w-6 h-6" />
          Se déconnecter
        </motion.button>

        <PartenairesLogos />

      </div>

      <Navigation role="producteur" />

      {/* Modal Settings */}
      <AnimatePresence>
        {showSettings && (
          <SettingsModal onClose={() => setShowSettings(false)} speak={speak} />
        )}
      </AnimatePresence>

      {/* Modal Info Personnelles */}
      <AnimatePresence>
        {showInfoPersonnelles && (
          <InfoPersonnellesModalUniversal
            onClose={closeInfoPersonnelles}
            speak={speak}
            roleColor={roleColor}
            user={user}
            onSave={handleSaveInfoPersonnelles}
          />
        )}
      </AnimatePresence>

      {/* Modal Documents & Certifications */}
      <AnimatePresence>
        {showDocumentsCertifications && (
          <DocumentsCertificationsModalUniversal
            onClose={closeDocumentsCertifications}
            speak={speak}
            documents={documents}
            onDocumentClick={handleDocumentClick}
            totalDocuments={totalDocuments}
            completedDocuments={completedDocuments}
            roleColor={roleColor}
          />
        )}
      </AnimatePresence>

      {/* Modal Document */}
      <AnimatePresence>
        {showDocumentModal && (
          <DocumentModal
            onClose={closeDocumentModal}
            speak={speak}
            document={documents[showDocumentModal]}
          />
        )}
      </AnimatePresence>

      {/* Panel Notifications */}
      <NotificationsPanel
        userId={(contextUser as any)?.id || 'user-prod-001'}
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        accentColor="#2E8B57"
      />
    </>
  );
}

// ========== COMPONENTS ==========

interface InfoCardProps {
  icon: any;
  label: string;
  value: string;
  isEditing: boolean;
  onChange: (value: string) => void;
  color: string;
}

function InfoCard({ icon: Icon, label, value, isEditing, onChange, color }: InfoCardProps) {
  return (
    <motion.div
      className="p-4 rounded-3xl bg-gradient-to-br from-green-50 via-white to-green-50 border-2 border-gray-200 shadow-md"
      whileHover={{ scale: 1.02, y: -2, boxShadow: '0 10px 30px rgba(0, 86, 59, 0.15)' }}
    >
      <div className="flex items-center gap-3 mb-2">
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <p className="text-sm font-semibold text-gray-600">{label}</p>
      </div>
      {isEditing ? (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-[#00563B] focus:outline-none font-bold text-gray-900"
        />
      ) : (
        <p className="text-lg font-bold text-gray-900 ml-[52px]">{value}</p>
      )}
    </motion.div>
  );
}

interface ActivityCardProps {
  icon: any;
  label: string;
  value: string;
  color: string;
  bgColor: string;
  borderColor: string;
  delay?: number;
}

function ActivityCard({ icon: Icon, label, value, color, bgColor, borderColor, delay }: ActivityCardProps) {
  return (
    <motion.div
      className={`p-4 rounded-3xl bg-gradient-to-br ${bgColor} border-2 shadow-md`}
      style={{ borderColor }}
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.95 }}
      transition={{ delay }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
      <p className="text-xs text-gray-600 mb-1">{label}</p>
      <p className="text-xl font-bold" style={{ color }}>{value}</p>
    </motion.div>
  );
}

interface DocumentCardProps {
  icon: any;
  label: string;
  status: string;
  statusColor: 'green' | 'blue' | 'orange' | 'red';
  date: string;
}

function DocumentCard({ icon: Icon, label, status, statusColor, date }: DocumentCardProps) {
  const statusColors = {
    green: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
    red: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
  };

  const colors = statusColors[statusColor];

  return (
    <motion.div
      className="p-4 rounded-3xl bg-gradient-to-br from-gray-50 via-white to-gray-50 border-2 border-gray-200 shadow-md flex items-center justify-between"
      whileHover={{ scale: 1.02, y: -2, boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)' }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
          <Icon className="w-6 h-6" style={{ color: '#00563B' }} />
        </div>
        <div>
          <p className="font-bold text-gray-900 text-sm">{label}</p>
          <p className="text-xs text-gray-500">{date}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${colors.bg} ${colors.text} border ${colors.border}`}>
          {status}
        </span>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>
    </motion.div>
  );
}

// ========== SETTINGS MODAL ==========
interface SettingsModalProps {
  onClose: () => void;
  speak: (text: string) => void;
}

function SettingsModal({ onClose, speak }: SettingsModalProps) {
  const [notifications, setNotifications] = useState(true);
  const [voice, setVoice] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end px-4 pb-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl w-full max-h-[85vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
          <h2 className="text-xl font-bold text-gray-900">Paramètres</h2>
          <motion.button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
            whileHover={{ rotate: 90, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </motion.button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Notifications */}
          <SettingToggle
            icon={Bell}
            label="Notifications"
            value={notifications}
            onChange={(val) => {
              setNotifications(val);
              speak(val ? 'Notifications activées' : 'Notifications désactivées');
            }}
          />

          {/* Voice */}
          <SettingToggle
            icon={Volume2}
            label="Assistant vocal"
            value={voice}
            onChange={(val) => {
              setVoice(val);
              speak(val ? 'Assistant vocal activé' : 'Assistant vocal désactivé');
            }}
          />

          {/* Dark Mode */}
          <SettingToggle
            icon={Moon}
            label="Mode sombre"
            value={darkMode}
            onChange={(val) => {
              setDarkMode(val);
              speak(val ? 'Mode sombre activé' : 'Mode clair activé');
            }}
          />

          {/* Langue */}
          <SettingButton
            icon={Globe}
            label="Langue"
            value="Français"
            onClick={() => speak('Sélection de la langue')}
          />

          {/* Sécurité */}
          <SettingButton
            icon={Lock}
            label="Changer le code PIN"
            onClick={() => speak('Modification du code PIN')}
          />

          {/* Confidentialité */}
          <SettingButton
            icon={Shield}
            label="Confidentialité"
            onClick={() => speak('Paramètres de confidentialité')}
          />
        </div>

        {/* Version */}
        <div className="px-6 pb-6 text-center text-sm text-gray-500">
          <p>JULABA v1.0.0</p>
          <p className="text-xs mt-1">Plateforme nationale d'inclusion économique 🇨🇮</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

interface SettingToggleProps {
  icon: any;
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

function SettingToggle({ icon: Icon, label, value, onChange }: SettingToggleProps) {
  return (
    <motion.div
      className="flex items-center justify-between p-4 rounded-2xl bg-white border-2 border-gray-200"
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
          <Icon className="w-5 h-5" style={{ color: '#00563B' }} />
        </div>
        <p className="font-semibold text-gray-900">{label}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`w-12 h-7 rounded-full transition-colors ${
          value ? 'bg-[#00563B]' : 'bg-gray-300'
        }`}
      >
        <motion.div
          className="w-5 h-5 bg-white rounded-full shadow-md"
          animate={{ x: value ? 26 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
    </motion.div>
  );
}

interface SettingButtonProps {
  icon: any;
  label: string;
  value?: string;
  onClick: () => void;
}

function SettingButton({ icon: Icon, label, value, onClick }: SettingButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 rounded-2xl bg-white border-2 border-gray-200"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
          <Icon className="w-5 h-5" style={{ color: '#00563B' }} />
        </div>
        <p className="font-semibold text-gray-900">{label}</p>
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="text-sm text-gray-500">{value}</span>}
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>
    </motion.button>
  );
}