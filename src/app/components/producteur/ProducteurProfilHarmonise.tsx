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
  CreditCard,
  Download,
  Clock,
  TrendingDown,
  Truck,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { useApp } from '../../contexts/AppContext';
import { useUser } from '../../contexts/UserContext';
import { useProducteur } from '../../contexts/ProducteurContext';
import { Navigation } from '../layout/Navigation';
import { Button } from '../ui/button';
import { Counter } from '../ui/counter';
import QRCode from 'qrcode';
import { PartenairesLogos } from '../shared/PartenairesLogos';

const PRIMARY_COLOR = '#2E8B57';
const SECONDARY_COLOR = '#16A34A';

export function ProducteurProfilHarmonise() {
  const navigate = useNavigate();
  const { speak } = useApp();
  const { user: authUser, logout: userLogout } = useUser();
  const { stats } = useProducteur();
  const [isEditing, setIsEditing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfessionalCard, setShowProfessionalCard] = useState(false);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  const [user, setUser] = useState({
    nom: 'KONÉ',
    prenoms: 'Yao Serge',
    telephone: '+225 05 98 76 54 32',
    email: 'yao.kone@julaba.ci',
    localisation: 'Bouaké, Région du Gbêkê',
    typeActivite: 'Maraîchage et cultures vivrières',
    superficie: '2.5 hectares',
    numeroProducteur: 'PROD-CI-2024-1234',
    dateInscription: '15 Jan 2024',
    dateNaissance: '15/03/1985',
    nationalite: 'Ivoirienne',
    cni: 'CI2024789456',
    cmu: 'CMU2024123456',
    recepisse: 'N01234/AGRI/CI',
    categorie: 'Expert',
    statut: 'Actif',
    niveauMembre: 'Expert',
    scoreCredit: 88,
    photo: null,
  });

  const totalRecoltes = 45;
  const totalVentes = 38;

  // Générer le QR Code
  React.useEffect(() => {
    const generateQR = async () => {
      try {
        const qrData = JSON.stringify({
          id: user.numeroProducteur,
          nom: `${user.prenoms} ${user.nom}`,
          role: 'producteur',
          telephone: user.telephone,
        });
        const url = await QRCode.toDataURL(qrData, {
          width: 200,
          margin: 2,
          color: { dark: PRIMARY_COLOR, light: '#FFFFFF' },
        });
        setQrCodeUrl(url);
      } catch (err) {
        console.error('Erreur génération QR Code:', err);
      }
    };
    generateQR();
  }, [user]);

  const handleLogout = () => {
    speak('Déconnexion en cours');
    userLogout();
    setTimeout(() => {
      navigate('/login');
    }, 1000);
  };

  return (
    <>
      <div className="pb-32 lg:pb-8 pt-24 lg:pt-16 px-4 lg:pl-[320px] max-w-2xl lg:max-w-7xl mx-auto min-h-screen bg-gradient-to-b from-green-50 to-white">
        
        {/* 📊 SECTION PERFORMANCE - NOUVELLE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-6 h-6" style={{ color: PRIMARY_COLOR }} />
            Performance
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Score Producteur */}
            <motion.div
              className="bg-white rounded-2xl p-4 border-2"
              style={{ borderColor: `${PRIMARY_COLOR}30` }}
              whileTap={{ scale: 0.98 }}
              onClick={() => speak(`Score producteur : ${stats.scoreProducteur} sur 100`)}
            >
              <div className="flex items-center gap-2 mb-2">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${PRIMARY_COLOR}20` }}
                >
                  <Target className="w-5 h-5" style={{ color: PRIMARY_COLOR }} strokeWidth={2.5} />
                </div>
              </div>
              <p className="text-xs text-gray-600 font-medium mb-1">Score producteur</p>
              <p className="text-3xl font-black text-gray-900">{stats.scoreProducteur}</p>
              <p className="text-xs font-bold" style={{ color: PRIMARY_COLOR }}>/100</p>
              
              {/* Barre de progression */}
              <div className="w-full bg-gray-100 rounded-full h-2 mt-3">
                <div 
                  className="h-full rounded-full transition-all"
                  style={{ 
                    width: `${stats.scoreProducteur}%`,
                    backgroundColor: PRIMARY_COLOR 
                  }}
                />
              </div>
            </motion.div>

            {/* Taux Respect Délais */}
            <motion.div
              className="bg-white rounded-2xl p-4 border-2 border-green-100"
              whileTap={{ scale: 0.98 }}
              onClick={() => speak(`Taux de respect des délais : ${stats.tauxRespectDelais} pourcent`)}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-green-600" strokeWidth={2.5} />
                </div>
              </div>
              <p className="text-xs text-gray-600 font-medium mb-1">Respect délais</p>
              <p className="text-3xl font-black text-green-600">{stats.tauxRespectDelais}%</p>
              
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-3 h-3 text-green-600" />
                <p className="text-xs font-bold text-green-600">Excellent</p>
              </div>
            </motion.div>

            {/* Documents Validés */}
            <motion.div
              className="bg-white rounded-2xl p-4 border-2 border-blue-100"
              whileTap={{ scale: 0.98 }}
              onClick={() => speak('Documents validés : 4 sur 5')}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" strokeWidth={2.5} />
                </div>
              </div>
              <p className="text-xs text-gray-600 font-medium mb-1">Documents</p>
              <p className="text-3xl font-black text-gray-900">4<span className="text-lg text-gray-500">/5</span></p>
              
              <div className="flex items-center gap-1 mt-2">
                <CheckCircle className="w-3 h-3 text-blue-600" />
                <p className="text-xs font-bold text-blue-600">Validés</p>
              </div>
            </motion.div>

            {/* Statut Conformité */}
            <motion.div
              className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 border-2 border-green-400 text-white"
              whileTap={{ scale: 0.98 }}
              onClick={() => speak('Statut conformité : Conforme')}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <p className="text-xs text-white/80 font-medium mb-1">Conformité</p>
              <p className="text-2xl font-black text-white mb-1">Conforme</p>
              
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-white" />
                <p className="text-xs font-bold text-white">Vérifié ✓</p>
              </div>
            </motion.div>
          </div>

          {/* Indicateurs secondaires */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-white rounded-xl p-3 border border-gray-100">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-gray-600 font-medium">Note moyenne</p>
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              </div>
              <p className="text-xl font-black text-gray-900">{stats.noteMoyenne}/5</p>
            </div>

            <div className="bg-white rounded-xl p-3 border border-gray-100">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-gray-600 font-medium">Délai livraison</p>
                <Truck className="w-4 h-4 text-gray-500" />
              </div>
              <p className="text-xl font-black text-gray-900">{stats.delaiMoyenLivraison}j</p>
            </div>
          </div>
        </motion.div>

        {/* 🎴 MA CARTE PROFESSIONNELLE - Style Marchand harmonisé */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="mb-4"
        >
          {/* Header avec boutons actions */}
          <div className="flex items-center justify-center mb-3">
            {/* Bouton Afficher/Masquer */}
            <motion.button
              onClick={() => {
                setShowProfessionalCard(!showProfessionalCard);
                speak(showProfessionalCard ? 'Carte masquée' : 'Carte affichée');
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm shadow-lg text-white"
              style={{ backgroundColor: PRIMARY_COLOR }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <CreditCard className="w-4 h-4" />
              {showProfessionalCard ? 'Masquer ma carte professionnelle' : 'Afficher ma carte professionnelle'}
            </motion.button>
          </div>

          <AnimatePresence mode="wait">
            {showProfessionalCard ? (
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
                    className="rounded-[32px] p-6 border-[3px] shadow-2xl relative overflow-hidden bg-gradient-to-br from-green-50/80 via-white to-green-50/80"
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
                      style={{ width: '50%', borderColor: PRIMARY_COLOR }}
                    />

                    <div className="relative z-10">
                      {/* En-tête avec logo et bouton paramètres */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-white border-[3px] flex items-center justify-center shadow-lg" style={{ borderColor: PRIMARY_COLOR }}>
                            <Shield className="w-6 h-6" style={{ color: PRIMARY_COLOR }} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-600 tracking-widest">RÉPUBLIQUE DE CÔTE D'IVOIRE</p>
                            <p className="text-lg font-black" style={{ color: PRIMARY_COLOR }}>JULABA</p>
                          </div>
                        </div>
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowSettings(true);
                            speak('Ouverture des paramètres');
                          }}
                          className="w-12 h-12 rounded-xl bg-white shadow-lg border-[3px] flex items-center justify-center"
                          style={{ borderColor: PRIMARY_COLOR }}
                          whileHover={{ scale: 1.1, rotate: 90 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Settings className="w-5 h-5" style={{ color: PRIMARY_COLOR }} />
                        </motion.button>
                      </div>

                      {/* Photo + Nom */}
                      <div className="flex items-start gap-4 mb-6">
                        <motion.div
                          className="relative flex-shrink-0"
                          whileHover={{ scale: 1.05 }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div 
                            className="w-28 h-28 rounded-[20px] border-[4px] shadow-xl flex items-center justify-center overflow-hidden"
                            style={{ borderColor: PRIMARY_COLOR, backgroundColor: '#E8F5E9' }}
                          >
                            {user.photo ? (
                              <img src={user.photo} alt={`${user.prenoms} ${user.nom}`} className="w-full h-full object-cover" />
                            ) : (
                              <Sprout className="w-14 h-14" style={{ color: PRIMARY_COLOR }} strokeWidth={2.5} />
                            )}
                          </div>
                          <motion.button
                            className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg border-[3px]"
                            style={{ borderColor: PRIMARY_COLOR }}
                            onClick={(e) => {
                              e.stopPropagation();
                              speak('Modifier la photo');
                            }}
                            whileHover={{ scale: 1.15, rotate: 15 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Camera className="w-5 h-5" style={{ color: PRIMARY_COLOR }} />
                          </motion.button>
                        </motion.div>

                        <div className="flex-1">
                          <p className="text-xs font-bold text-gray-500 mb-1">PRODUCTEUR AGRÉÉ</p>
                          <h1 className="text-2xl font-black text-gray-900 leading-tight mb-2">
                            {user.prenoms}
                            <br />
                            {user.nom}
                          </h1>
                          <div className="flex items-center gap-2 mb-2">
                            <Shield className="w-4 h-4" style={{ color: PRIMARY_COLOR }} />
                            <p className="text-sm font-bold text-gray-700">{user.numeroProducteur}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 border-2 border-green-300">
                              <CheckCircle className="w-3 h-3 text-green-600" />
                              <span className="text-xs font-bold text-green-700">{user.statut}</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-100 border-2 border-yellow-300">
                              <Star className="w-3 h-3 text-yellow-600" />
                              <span className="text-xs font-bold text-yellow-700">{user.niveauMembre}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Infos personnelles - Grid 2 colonnes */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <InfoField icon={Calendar} label="Date de naissance" value={user.dateNaissance} />
                        <InfoField icon={Globe} label="Nationalité" value={user.nationalite} />
                        <InfoField icon={FileText} label="N° CNI" value={user.cni} />
                        <InfoField icon={Shield} label="N° CMU" value={user.cmu} />
                      </div>

                      {/* Type d'activité */}
                      <div className="p-4 rounded-[20px] bg-gradient-to-r from-green-100/50 to-emerald-100/50 border-2 border-green-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Tractor className="w-4 h-4" style={{ color: PRIMARY_COLOR }} />
                          <p className="text-xs font-bold text-gray-600">Type d'activité</p>
                        </div>
                        <p className="text-sm font-black text-gray-900">{user.typeActivite}</p>
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

                  {/* VERSO - Infos Professionnelles */}
                  <motion.div
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                      position: isCardFlipped ? 'relative' : 'absolute',
                      width: '100%',
                      top: 0,
                    }}
                    className="rounded-[32px] p-6 border-[3px] shadow-2xl relative overflow-hidden bg-gradient-to-br from-green-50/80 via-white to-green-50/80"
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
                      style={{ width: '50%', borderColor: PRIMARY_COLOR }}
                    />

                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-black text-gray-900">Informations professionnelles</h3>
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            speak('Télécharger la carte');
                          }}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl font-bold text-xs shadow-md text-white"
                          style={{ backgroundColor: '#00563B' }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Download className="w-4 h-4" />
                          Télécharger
                        </motion.button>
                      </div>

                      {/* QR Code + Score */}
                      <div className="flex items-center gap-4 mb-6">
                        {qrCodeUrl && (
                          <div className="w-28 h-28 rounded-[16px] border-[3px] p-2 bg-white shadow-lg" style={{ borderColor: PRIMARY_COLOR }}>
                            <img src={qrCodeUrl} alt="QR Code" className="w-full h-full" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-600 mb-2">Score JULABA</p>
                          <motion.p
                            className="text-5xl font-black"
                            style={{ color: PRIMARY_COLOR }}
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Counter value={user.scoreCredit} duration={1500} />
                          </motion.p>
                        </div>
                      </div>

                      {/* Infos pro - Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <InfoField icon={MapPin} label="Localisation" value={user.localisation} />
                        <InfoField icon={Target} label="Superficie" value={user.superficie} />
                        <InfoField icon={Phone} label="Téléphone" value={user.telephone} />
                        <InfoField icon={Mail} label="Email" value={user.email} />
                      </div>

                      {/* Récépissé */}
                      <div className="p-4 rounded-[20px] bg-gradient-to-r from-blue-100/50 to-indigo-100/50 border-2 border-blue-200 mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <p className="text-xs font-bold text-gray-600">Récépissé</p>
                        </div>
                        <p className="text-sm font-black text-gray-900">{user.recepisse}</p>
                      </div>

                      {/* Catégorie + Date inscription */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-[16px] bg-purple-100/50 border-2 border-purple-200">
                          <p className="text-xs font-bold text-gray-600 mb-1">Catégorie</p>
                          <p className="text-lg font-black" style={{ color: '#702963' }}>{user.categorie}</p>
                        </div>
                        <div className="p-3 rounded-[16px] bg-gray-100 border-2 border-gray-200">
                          <p className="text-xs font-bold text-gray-600 mb-1">Inscription</p>
                          <p className="text-xs font-bold text-gray-900">{user.dateInscription}</p>
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
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-8 rounded-[32px] bg-gradient-to-br from-green-50 via-white to-green-50 border-[3px] shadow-lg text-center"
                style={{ borderColor: PRIMARY_COLOR }}
              >
                <motion.div
                  className="flex flex-col items-center gap-4"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center shadow-lg border-[3px]" style={{ borderColor: PRIMARY_COLOR }}>
                    <CreditCard className="w-10 h-10" style={{ color: PRIMARY_COLOR }} />
                  </div>
                  <div>
                    <p className="text-xl font-black text-gray-900 mb-2">Carte professionnelle JULABA</p>
                    <p className="text-sm text-gray-600">Cliquez sur "Afficher" pour voir votre carte digitale</p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
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
              style={{ borderColor: SECONDARY_COLOR }}
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

        {/* Informations Personnelles - Style Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mb-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-gray-900">Informations personnelles</h3>
            <motion.button
              onClick={() => {
                setIsEditing(!isEditing);
                speak(isEditing ? 'Mode édition désactivé' : 'Mode édition activé');
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm shadow-md"
              style={{ 
                backgroundColor: isEditing ? '#E5E7EB' : PRIMARY_COLOR,
                color: isEditing ? '#374151' : 'white'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Edit3 className="w-4 h-4" />
              {isEditing ? 'Annuler' : 'Modifier'}
            </motion.button>
          </div>

          <div className="space-y-3">
            {/* Téléphone */}
            <InfoCard
              icon={Phone}
              label="Téléphone"
              value={user.telephone}
              isEditing={isEditing}
              onChange={(val) => setUser({ ...user, telephone: val })}
              color="#2072AF"
            />

            {/* Email */}
            <InfoCard
              icon={Mail}
              label="Email"
              value={user.email}
              isEditing={isEditing}
              onChange={(val) => setUser({ ...user, email: val })}
              color={SECONDARY_COLOR}
            />

            {/* Localisation */}
            <InfoCard
              icon={MapPin}
              label="Localisation"
              value={user.localisation}
              isEditing={isEditing}
              onChange={(val) => setUser({ ...user, localisation: val })}
              color={PRIMARY_COLOR}
            />

            {/* Type d'activité */}
            <InfoCard
              icon={Tractor}
              label="Type d'activité"
              value={user.typeActivite}
              isEditing={isEditing}
              onChange={(val) => setUser({ ...user, typeActivite: val })}
              color="#702963"
            />

            {/* Superficie */}
            <InfoCard
              icon={Target}
              label="Superficie cultivée"
              value={user.superficie}
              isEditing={isEditing}
              onChange={(val) => setUser({ ...user, superficie: val })}
              color="#F59E0B"
            />
          </div>

          {/* Bouton Enregistrer */}
          {isEditing && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => {
                setIsEditing(false);
                speak('Informations enregistrées avec succès');
              }}
              className="w-full mt-4 py-4 rounded-2xl text-lg font-bold text-white shadow-lg flex items-center justify-center gap-2"
              style={{ backgroundColor: PRIMARY_COLOR }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <CheckCircle className="w-6 h-6" />
              Enregistrer les modifications
            </motion.button>
          )}
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
              value={`${(stats?.productionTotale || 0).toLocaleString()} kg`}
              color={SECONDARY_COLOR}
              bgColor="from-green-50 via-white to-green-50"
              borderColor={SECONDARY_COLOR}
            />

            {/* Ventes du jour */}
            <ActivityCard
              icon={TrendingUp}
              label="Ventes"
              value={`${(stats?.revenusTotaux || 0).toLocaleString('fr-FR')} FCFA`}
              color="#2563EB"
              bgColor="from-blue-50 via-white to-blue-50"
              borderColor="#2563EB"
            />

            {/* Stocks */}
            <ActivityCard
              icon={Package}
              label="Stocks"
              value={`${(stats?.volumeVendu || 0).toLocaleString()} kg`}
              color={PRIMARY_COLOR}
              bgColor="from-green-50 via-white to-green-50"
              borderColor={PRIMARY_COLOR}
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
              className="p-4 rounded-2xl bg-white border-2 border-gray-200 flex flex-col items-start gap-2 shadow-sm"
              style={{ borderColor: isEditing ? PRIMARY_COLOR : '#E5E7EB' }}
              whileHover={{ scale: 1.02, y: -2, borderColor: PRIMARY_COLOR }}
              whileTap={{ scale: 0.98 }}
            >
              <Bell className="w-6 h-6" style={{ color: PRIMARY_COLOR }} />
              <p className="font-bold text-sm text-gray-900">Notifications</p>
            </motion.button>

            <motion.button
              onClick={() => speak('Sécurité et confidentialité')}
              className="p-4 rounded-2xl bg-white border-2 border-gray-200 flex flex-col items-start gap-2 shadow-sm"
              whileHover={{ scale: 1.02, y: -2, borderColor: PRIMARY_COLOR }}
              whileTap={{ scale: 0.98 }}
            >
              <Lock className="w-6 h-6" style={{ color: PRIMARY_COLOR }} />
              <p className="font-bold text-sm text-gray-900">Sécurité</p>
            </motion.button>

            <motion.button
              onClick={() => speak('Assistance vocale')}
              className="p-4 rounded-2xl bg-white border-2 border-gray-200 flex flex-col items-start gap-2 shadow-sm"
              whileHover={{ scale: 1.02, y: -2, borderColor: PRIMARY_COLOR }}
              whileTap={{ scale: 0.98 }}
            >
              <Volume2 className="w-6 h-6" style={{ color: PRIMARY_COLOR }} />
              <p className="font-bold text-sm text-gray-900">Assistance</p>
            </motion.button>

            <motion.button
              onClick={() => speak('Langue et région')}
              className="p-4 rounded-2xl bg-white border-2 border-gray-200 flex flex-col items-start gap-2 shadow-sm"
              whileHover={{ scale: 1.02, y: -2, borderColor: PRIMARY_COLOR }}
              whileTap={{ scale: 0.98 }}
            >
              <Globe className="w-6 h-6" style={{ color: PRIMARY_COLOR }} />
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
    </>
  );
}

// ========== COMPONENTS ==========

// InfoField pour la carte
interface InfoFieldProps {
  icon: any;
  label: string;
  value: string;
}

function InfoField({ icon: Icon, label, value }: InfoFieldProps) {
  return (
    <div className="p-3 rounded-[16px] bg-white/60 border-2 border-gray-200">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-3 h-3 text-gray-500" />
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">{label}</p>
      </div>
      <p className="text-sm font-black text-gray-900 truncate">{value}</p>
    </div>
  );
}

// InfoCard pour les informations éditables
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

// ActivityCard
interface ActivityCardProps {
  icon: any;
  label: string;
  value: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

function ActivityCard({ icon: Icon, label, value, color, bgColor, borderColor }: ActivityCardProps) {
  return (
    <motion.div
      className={`p-4 rounded-3xl bg-gradient-to-br ${bgColor} border-2 shadow-md`}
      style={{ borderColor }}
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.95 }}
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

// Settings Modal
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
          <Icon className="w-5 h-5" style={{ color: PRIMARY_COLOR }} />
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
          animate={{ x: value ? 24 : 4 }}
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
          <Icon className="w-5 h-5" style={{ color: PRIMARY_COLOR }} />
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