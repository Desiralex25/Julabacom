import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Calendar,
  Star,
  BarChart3,
  Award,
  CheckCircle,
  Edit3,
  Lock,
  Download,
  GraduationCap,
  Shield,
  Settings,
  CreditCard,
  ChevronRight,
  Globe,
  FileText,
  Camera,
} from 'lucide-react';
import { UniversalPageWrapper } from './UniversalPageWrapper';
import { useApp } from '../../contexts/AppContext';
import { useUser } from '../../contexts/UserContext';
import { getRoleColor } from '../../config/roleConfig';
import QRCode from 'qrcode';

interface UniversalProfilProps {
  role: 'marchand' | 'producteur' | 'cooperative' | 'institution' | 'identificateur';
  onNavigateToAcademy?: () => void;
}

// Labels par rôle
const ROLE_LABELS: Record<UniversalProfilProps['role'], string> = {
  marchand: 'MARCHAND AGRÉÉ',
  producteur: 'PRODUCTEUR AGRÉÉ',
  cooperative: 'COOPÉRATIVE AGRÉÉE',
  institution: 'INSTITUTION PARTENAIRE',
  identificateur: 'IDENTIFICATEUR AGRÉÉ',
};

// Composant InfoField
function InfoField({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="p-3 rounded-xl bg-white/50 border border-gray-200">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4 text-gray-500" />
        <p className="text-xs font-semibold text-gray-600 truncate">{label}</p>
      </div>
      <p className="text-sm font-bold text-gray-900 truncate">{value}</p>
    </div>
  );
}

export function UniversalProfil({ role, onNavigateToAcademy }: UniversalProfilProps) {
  const { speak } = useApp();
  const { user, updateUser } = useUser();
  const [showProfessionalCard, setShowProfessionalCard] = useState(false);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const activeColor = getRoleColor(role);

  // Générer le QR Code
  useEffect(() => {
    const generateQR = async () => {
      if (!user) return;
      try {
        const qrData = JSON.stringify({
          id: user.numeroMarchand,
          nom: `${user.prenoms} ${user.nom}`,
          role: role,
          telephone: user.telephone,
        });
        const url = await QRCode.toDataURL(qrData, {
          width: 200,
          margin: 2,
          color: { dark: activeColor, light: '#FFFFFF' },
        });
        setQrCodeUrl(url);
      } catch (err) {
        console.error('Erreur génération QR Code:', err);
      }
    };
    generateQR();
  }, [user, role, activeColor]);

  if (!user) return null;

  return (
    <UniversalPageWrapper role={role}>
      {/* 🎴 MA CARTE PROFESSIONNELLE - Style Moderne avec Flip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="mb-4"
      >
        {/* Header avec bouton action */}
        <div className="flex items-center justify-center mb-3">
          <motion.button
            onClick={() => {
              setShowProfessionalCard(!showProfessionalCard);
              speak(showProfessionalCard ? 'Carte masquée' : 'Carte affichée');
            }}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm shadow-lg text-white"
            style={{ backgroundColor: activeColor }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <CreditCard className="w-4 h-4" />
            {showProfessionalCard ? 'Masquer ma carte professionnelle' : 'Afficher ma carte professionnelle'}
          </motion.button>
        </div>

        <AnimatePresence mode="wait">
          {showProfessionalCard && (
            <motion.div
              key="card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              style={{ perspective: '1000px' }}
            >
              {/* Conteneur 3D pour le flip */}
              <motion.div
                animate={{ rotateY: isCardFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
                style={{ transformStyle: 'preserve-3d', position: 'relative' }}
                className="w-full"
              >
                {/* RECTO - Infos Personnelles */}
                <motion.div
                  style={{
                    backfaceVisibility: 'hidden',
                    position: isCardFlipped ? 'absolute' : 'relative',
                    width: '100%',
                  }}
                  className="rounded-[32px] p-6 border-[3px] shadow-2xl relative overflow-hidden bg-gradient-to-br from-orange-50/80 via-white to-orange-50/80 cursor-pointer"
                  onClick={() => {
                    setIsCardFlipped(!isCardFlipped);
                    speak('Retourner la carte');
                  }}
                >
                  {/* Effet de brillance animé */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
                    style={{ width: '50%' }}
                  />

                  <div className="relative z-10">
                    {/* En-tête avec logo */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-full bg-white border-[3px] flex items-center justify-center shadow-lg"
                          style={{ borderColor: activeColor }}
                        >
                          <Shield className="w-6 h-6" style={{ color: activeColor }} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-600 tracking-widest">RÉPUBLIQUE DE CÔTE D'IVOIRE</p>
                          <p className="text-lg font-black" style={{ color: activeColor }}>
                            JULABA
                          </p>
                        </div>
                      </div>
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowSettings(true);
                          speak('Ouverture des paramètres');
                        }}
                        className="w-12 h-12 rounded-xl bg-white shadow-lg border-[3px] flex items-center justify-center"
                        style={{ borderColor: activeColor }}
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Settings className="w-5 h-5" style={{ color: activeColor }} />
                      </motion.button>
                    </div>

                    {/* Photo + Nom */}
                    <div className="flex items-start gap-4 mb-6">
                      <motion.div className="relative flex-shrink-0" whileHover={{ scale: 1.05 }} onClick={(e) => e.stopPropagation()}>
                        <div
                          className="w-28 h-28 rounded-[20px] border-[4px] shadow-xl flex items-center justify-center overflow-hidden"
                          style={{ borderColor: activeColor, backgroundColor: '#FFF5E6' }}
                        >
                          {user.photo ? (
                            <img src={user.photo} alt={`${user.prenoms} ${user.nom}`} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-14 h-14" style={{ color: activeColor }} strokeWidth={2.5} />
                          )}
                        </div>
                        <motion.button
                          className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg border-[3px]"
                          style={{ borderColor: activeColor }}
                          onClick={(e) => {
                            e.stopPropagation();
                            speak('Modifier la photo');
                          }}
                          whileHover={{ scale: 1.15, rotate: 15 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Camera className="w-5 h-5" style={{ color: activeColor }} />
                        </motion.button>
                      </motion.div>

                      <div className="flex-1">
                        <p className="text-xs font-bold text-gray-500 mb-1">{ROLE_LABELS[role]}</p>
                        <h1 className="text-2xl font-black text-gray-900 leading-tight mb-2">
                          {user.prenoms}
                          <br />
                          {user.nom}
                        </h1>
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="w-4 h-4" style={{ color: activeColor }} />
                          <p className="text-sm font-bold text-gray-700">{user.numeroMarchand}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 border-2 border-green-300">
                            <CheckCircle className="w-3 h-3 text-green-600" />
                            <span className="text-xs font-bold text-green-700">{user.statut}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Infos personnelles - Grid 2 colonnes */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <InfoField icon={Calendar} label="Date de naissance" value={user.dateNaissance || '01/01/1990'} />
                      <InfoField icon={Globe} label="Nationalité" value={user.nationalite || 'Ivoirienne'} />
                      <InfoField icon={FileText} label="N° CNI" value={user.cni || 'CI2024******'} />
                      <InfoField icon={Shield} label="N° CMU" value={user.cmu || 'CMU2024******'} />
                    </div>

                    {/* RSTI */}
                    <div className="p-4 rounded-[20px] bg-gradient-to-r from-orange-100/50 to-yellow-100/50 border-2 border-orange-200">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-4 h-4" style={{ color: activeColor }} />
                        <p className="text-xs font-bold text-gray-600">N° RSTI</p>
                      </div>
                      <p className="text-sm font-black text-gray-900">{user.rsti || 'RSTI2024******'}</p>
                    </div>

                    {/* Indication flip */}
                    <motion.div
                      className="mt-4 text-center"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <p className="text-xs font-bold text-gray-500">👆 Cliquez pour voir le verso</p>
                    </motion.div>
                  </div>
                </motion.div>

                {/* VERSO - QR Code */}
                <motion.div
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    position: isCardFlipped ? 'relative' : 'absolute',
                    width: '100%',
                    top: 0,
                  }}
                  className="rounded-[32px] p-6 border-[3px] shadow-2xl relative overflow-hidden bg-gradient-to-br from-orange-50/80 via-white to-orange-50/80 cursor-pointer"
                  onClick={() => {
                    setIsCardFlipped(!isCardFlipped);
                    speak('Retourner la carte');
                  }}
                >
                  {/* Effet de brillance */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
                    style={{ width: '50%' }}
                  />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-black text-gray-900">Informations professionnelles</h3>
                    </div>

                    {/* QR Code */}
                    <div className="flex justify-center mb-6">
                      <div className="p-4 bg-white rounded-[20px] shadow-lg border-[3px]" style={{ borderColor: activeColor }}>
                        {qrCodeUrl ? (
                          <img src={qrCodeUrl} alt="QR Code" className="w-40 h-40" />
                        ) : (
                          <div className="w-40 h-40 flex items-center justify-center">
                            <p className="text-sm text-gray-500">Génération...</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Infos professionnelles */}
                    <div className="space-y-3">
                      <InfoField icon={Phone} label="Téléphone" value={user.telephone} />
                      <InfoField icon={Mail} label="Email" value={user.email || 'Non renseigné'} />
                      <InfoField icon={MapPin} label="Localisation" value={user.localisation} />
                      <InfoField icon={Briefcase} label="Activité" value={user.typeActivite} />
                      <InfoField icon={Calendar} label="Inscription" value={user.dateInscription} />
                    </div>

                    {/* Score de crédit */}
                    <div
                      className="mt-4 p-4 rounded-[20px] border-2"
                      style={{ borderColor: activeColor, backgroundColor: `${activeColor}10` }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-gray-600">Score de crédit</p>
                          <p className="text-2xl font-black" style={{ color: activeColor }}>
                            {user.scoreCredit}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="w-6 h-6" style={{ color: activeColor }} fill={activeColor} />
                          <span className="text-sm font-bold text-gray-700">{user.niveauMembre}</span>
                        </div>
                      </div>
                    </div>

                    {/* Indication flip */}
                    <motion.div
                      className="mt-4 text-center"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <p className="text-xs font-bold text-gray-500">👆 Cliquez pour voir le recto</p>
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={BarChart3} label="Transactions" value="142" color={activeColor} />
        <StatCard icon={Award} label="Score" value={user.scoreCredit.toString()} color={activeColor} />
        <StatCard icon={Star} label="Niveau" value={user.niveauMembre} color={activeColor} />
        <StatCard icon={CheckCircle} label="Statut" value={user.statut} color={activeColor} />
      </div>

      {/* Actions rapides */}
      <div className="space-y-3">
        <ActionButton
          icon={Edit3}
          label="Modifier mes informations"
          color={activeColor}
          onClick={() => speak('Modification des informations')}
        />
        <ActionButton
          icon={Lock}
          label="Modifier mon code de sécurité"
          color={activeColor}
          onClick={() => speak('Modification du code')}
        />
        <ActionButton
          icon={GraduationCap}
          label="Academy"
          color={activeColor}
          onClick={() => {
            speak('Ouverture de JÙLABA Academy');
            if (onNavigateToAcademy) {
              onNavigateToAcademy();
            }
          }}
        />
        <ActionButton
          icon={Download}
          label="Télécharger ma carte"
          color={activeColor}
          onClick={() => speak('Téléchargement de la carte')}
        />
      </div>
    </UniversalPageWrapper>
  );
}

// Composant StatCard
function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <motion.div
      className="p-4 rounded-2xl bg-white shadow-md border-2"
      style={{ borderColor: `${color}30` }}
      whileHover={{ scale: 1.05, y: -4 }}
    >
      <Icon className="w-6 h-6 mb-2" style={{ color }} />
      <p className="text-xs font-semibold text-gray-600 mb-1">{label}</p>
      <p className="text-lg font-black text-gray-900">{value}</p>
    </motion.div>
  );
}

// Composant ActionButton
function ActionButton({ icon: Icon, label, color, onClick }: { icon: any; label: string; color: string; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 rounded-2xl bg-white shadow-md border-2 transition-all"
      style={{ borderColor: `${color}30` }}
      whileHover={{ scale: 1.02, x: 8 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <span className="font-bold text-gray-900">{label}</span>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400" />
    </motion.button>
  );
}