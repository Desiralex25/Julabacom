import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, Clock, CheckCircle, XCircle, MapPin, TrendingUp, Target, Phone, Volume2, Users, UserPlus, Sparkles, ArrowRight, Award, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useUser } from '../../contexts/UserContext';
import { useIdentificateur } from '../../contexts/IdentificateurContext';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../ui/card';
import { Navigation } from '../layout/Navigation';
import { FormulaireNouveauDossier } from './FormulaireNouveauDossier';
import { ScoreResumeCard } from '../shared/ScoreResumeCard';
import tantieSagesseImg from 'figma:asset/82c93653bb1eda722d8188565757dfef53e2f469.png';

const PRIMARY_COLOR = '#9F8170';

// Mock data pour les acteurs identifiés (à remplacer par vraies données)
const MOCK_ACTEURS = [
  { numero: '0722456789', nom: 'KOUASSI Jean', type: 'Marchand', zone: 'Marché de Cocody', statut: 'approved' },
  { numero: '0722334455', nom: 'KOFFI Marie', type: 'Producteur', zone: 'Marché de Cocody', statut: 'submitted' },
  { numero: '0722112233', nom: 'YAO Pierre', type: 'Marchand', zone: 'Marché de Cocody', statut: 'draft' },
  { numero: '0555123456', nom: 'TOURE Awa', type: 'Producteur', zone: 'Village Adzopé', statut: 'approved' },
  { numero: '0777889900', nom: 'BAMBA Koffi', type: 'Marchand', zone: 'Marché de Cocody', statut: 'rejected' },
];

export function IdentificateurHome() {
  const navigate = useNavigate();
  const { user, speak, setIsModalOpen } = useApp();
  const { getMesIdentifications, getStatsIdentificateur } = useIdentificateur();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showNouveauDossierModal, setShowNouveauDossierModal] = useState(false);

  // Zone attribuée
  const zoneAttribuee = user?.market || 'Marché de Cocody';
  const stats = getStatsIdentificateur(user?.telephone || 'ID001');
  const mesIdentifications = getMesIdentifications();

  // Calcul des compteurs
  const countDraft = mesIdentifications.filter(i => i.statut === 'draft').length;
  const countSubmitted = mesIdentifications.filter(i => i.statut === 'en_cours').length;
  const countApproved = mesIdentifications.filter(i => i.statut === 'valide').length;
  const countRejected = mesIdentifications.filter(i => i.statut === 'rejete').length;

  // Filtrer les résultats de recherche
  const filteredActeurs = searchQuery.length > 0 
    ? MOCK_ACTEURS.filter(acteur => acteur.numero.startsWith(searchQuery))
    : [];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    const shouldShow = value.length > 0;
    setShowSearchResults(shouldShow);
    setIsModalOpen(shouldShow);
  };

  const handleActeurClick = (numero: string) => {
    navigate(`/identificateur/acteur/${numero}`);
    setShowSearchResults(false);
    setIsModalOpen(false);
    setSearchQuery('');
  };

  const handleCounterClick = (filter: string) => {
    navigate('/identificateur/suivi', { state: { filter } });
  };

  const handleListenMessage = () => {
    const message = `Bonjour ${user?.firstName} ! Vous avez ${stats.totalIdentifications} acteurs enrôlés dans votre zone ${zoneAttribuee}. ${countSubmitted > 0 ? `${countSubmitted} identifications sont en cours de validation.` : ''}`;
    speak(message);
    setIsSpeaking(true);
    setTimeout(() => setIsSpeaking(false), 3000);
  };

  const handleTantieSagesseClick = () => {
    speak('Bonjour ! Je suis Tantie Sagesse. Comment puis-je vous aider avec les identifications aujourd\'hui ?');
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="pb-32 lg:pb-8 pt-24 lg:pt-16 px-4 lg:pl-[320px] max-w-2xl lg:max-w-7xl mx-auto min-h-screen bg-gradient-to-b from-[#9F8170]/5 via-white to-gray-50">
        
        {/* Card Tantie Sagesse - EXACTEMENT comme Marchand */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="mb-8"
        >
          <div className="flex items-stretch gap-2">
            {/* Image Tantie Sagesse à gauche */}
            <motion.div
              className="flex-shrink-0 flex items-center"
              animate={isSpeaking ? { y: [0, -8, 0] } : {}}
              transition={{ duration: 0.6, repeat: isSpeaking ? Infinity : 0 }}
            >
              <motion.img
                src={tantieSagesseImg}
                alt="Tantie Sagesse"
                className="w-36 h-auto object-contain"
                whileHover={{ scale: 1.05, rotate: 2 }}
                whileTap={{ scale: 0.95 }}
              />
            </motion.div>

            {/* Card contenu à droite */}
            <Card className="flex-1 px-8 py-6 rounded-3xl border-2 shadow-lg relative overflow-hidden" style={{ borderColor: PRIMARY_COLOR }}>
              {/* Fond animé */}
              <motion.div
                className="absolute inset-0 opacity-5"
                style={{ 
                  background: `linear-gradient(135deg, ${PRIMARY_COLOR}FF 0%, ${PRIMARY_COLOR}99 100%)`,
                  willChange: 'transform'
                }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              
              <div className="relative z-10 w-full h-full">
                <motion.h3 
                  className="font-bold text-2xl text-gray-900 mb-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Tantie Sagesse
                </motion.h3>
                <motion.p 
                  className="text-gray-600 leading-relaxed pr-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Bonjour {user?.firstName} ! Votre zone {zoneAttribuee} compte {stats.totalIdentifications} acteurs enrôlés
                </motion.p>
              </div>
              
              <motion.button
                onClick={handleListenMessage}
                className="flex items-center gap-2 px-6 py-3 rounded-full text-base font-semibold text-white shadow-md absolute bottom-5 left-8 z-20"
                style={{ backgroundColor: PRIMARY_COLOR }}
                whileHover={{ scale: 1.05, boxShadow: `0 8px 20px ${PRIMARY_COLOR}33` }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Volume2 className="w-5 h-5" />
                Écouter
              </motion.button>
            </Card>
          </div>
        </motion.div>

        {/* Grande barre de recherche - Style unifié */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 relative"
        >
          <motion.div 
            className="relative"
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <motion.div
              className="absolute left-5 top-1/2 -translate-y-1/2"
              animate={{ 
                scale: searchQuery.length > 0 ? [1, 1.2, 1] : 1,
                rotate: searchQuery.length > 0 ? [0, 10, -10, 0] : 0
              }}
              transition={{ duration: 0.5, repeat: searchQuery.length > 0 ? Infinity : 0, repeatDelay: 2 }}
            >
              <div 
                className="w-11 h-11 rounded-full flex items-center justify-center"
                style={{ 
                  background: `linear-gradient(135deg, ${PRIMARY_COLOR}20 0%, ${PRIMARY_COLOR}40 100%)`,
                }}
              >
                <Search className="w-5 h-5" style={{ color: PRIMARY_COLOR }} />
              </div>
            </motion.div>

            <motion.input
              type="tel"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchQuery.length > 0 && setShowSearchResults(true)}
              placeholder="Rechercher par numéro..."
              className="w-full pl-20 pr-6 py-5 rounded-3xl border-2 focus:outline-none text-base font-medium bg-white shadow-lg transition-all"
              style={{
                borderColor: searchQuery.length > 0 ? PRIMARY_COLOR : '#e5e7eb',
              }}
              whileFocus={{ 
                scale: 1.01,
                boxShadow: `0 10px 30px ${PRIMARY_COLOR}20`
              }}
            />

            {searchQuery.length > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                onClick={() => {
                  setSearchQuery('');
                  setShowSearchResults(false);
                  setIsModalOpen(false);
                }}
                className="absolute right-5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <XCircle className="w-5 h-5 text-gray-600" />
              </motion.button>
            )}

            {/* Effet de brillance animé */}
            {searchQuery.length === 0 && (
              <motion.div
                className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(90deg, transparent 0%, ${PRIMARY_COLOR}10 50%, transparent 100%)`,
                  }}
                  animate={{
                    x: ['-100%', '200%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 2,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>
            )}
          </motion.div>

          {/* Résultats de recherche */}
          <AnimatePresence>
            {showSearchResults && filteredActeurs.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl shadow-2xl border-2 border-gray-200 overflow-hidden z-20"
              >
                {filteredActeurs.map((acteur, index) => (
                  <motion.button
                    key={acteur.numero}
                    onClick={() => handleActeurClick(acteur.numero)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="w-full px-5 py-4 flex items-center gap-3 hover:bg-gradient-to-r hover:from-[#9F8170]/10 hover:to-transparent transition-all border-b-2 border-gray-100 last:border-b-0"
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#9F8170] to-[#7a6558] flex items-center justify-center text-white font-bold shadow-md">
                      {acteur.nom.charAt(0)}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-[#9F8170]" />
                        <p className="font-bold text-gray-900">{acteur.numero}</p>
                      </div>
                      <p className="text-sm text-gray-900 font-semibold mt-0.5">{acteur.nom}</p>
                      <p className="text-xs text-gray-600">{acteur.type} - {acteur.zone}</p>
                    </div>
                    <div className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 ${
                      acteur.statut === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                      acteur.statut === 'submitted' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                      acteur.statut === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                      'bg-gray-50 text-gray-700 border-gray-200'
                    }`}>
                      {acteur.statut === 'approved' ? 'Validé' :
                       acteur.statut === 'submitted' ? 'En cours' :
                       acteur.statut === 'rejected' ? 'Rejeté' : 'Brouillon'}
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            )}

            {showSearchResults && filteredActeurs.length === 0 && searchQuery.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl shadow-2xl border-2 border-gray-200 p-6 z-20"
              >
                <p className="text-gray-600 text-center font-medium">Aucun résultat pour "{searchQuery}"</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* CTA Principal - Nouveau dossier */}
        <motion.div
          onClick={() => {
            navigate('/identificateur/fiche-identification');
            speak('Nouvelle identification. Choisis le type d\'acteur');
          }}
          className="mb-6 bg-gradient-to-r from-[#9F8170] via-[#B39485] to-[#9F8170] rounded-3xl p-6 shadow-2xl border-2 border-[#9F8170] cursor-pointer overflow-hidden relative"
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          {/* Background animation */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            }}
          />

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl border-2 border-white/30"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                <UserPlus className="w-8 h-8 text-white" strokeWidth={2.5} />
              </motion.div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                  Nouveau dossier
                </h3>
                <p className="text-sm text-white/90 font-medium">
                  Identifier un nouvel acteur vivrier
                </p>
              </div>
            </div>
            <motion.div
              className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30"
              animate={{
                x: [0, 10, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            >
              <ArrowRight className="w-6 h-6 text-white" strokeWidth={2.5} />
            </motion.div>
          </div>
        </motion.div>

        {/* Compteurs cliquables - 4 cartes */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
        >
          <motion.button
            onClick={() => handleCounterClick('draft')}
            className="bg-white rounded-3xl p-3 shadow-lg border-2 border-gray-100 text-left hover:shadow-xl transition-all relative"
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-xs text-gray-500 font-semibold block mb-1">Brouillons</span>
            <p className="text-2xl font-black text-gray-900">{countDraft}</p>
            
            <motion.div
              animate={{ rotate: [0, 10, -10, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
            >
              <Clock className="w-6 h-6 text-gray-600" />
            </motion.div>
          </motion.button>

          <motion.button
            onClick={() => handleCounterClick('submitted')}
            className="bg-white rounded-3xl p-3 shadow-lg border-2 border-orange-100 text-left hover:shadow-xl transition-all relative"
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-xs text-gray-500 font-semibold block mb-1">En attente</span>
            <p className="text-2xl font-black text-orange-600">{countSubmitted}</p>
            
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 0.5 }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center"
            >
              <Clock className="w-6 h-6 text-orange-600" />
            </motion.div>
          </motion.button>

          <motion.button
            onClick={() => handleCounterClick('approved')}
            className="bg-white rounded-3xl p-3 shadow-lg border-2 border-green-100 text-left hover:shadow-xl transition-all relative"
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-xs text-gray-500 font-semibold block mb-1">Validés</span>
            <p className="text-2xl font-black text-green-600">{countApproved}</p>
            
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center"
            >
              <CheckCircle className="w-6 h-6 text-green-600" />
            </motion.div>
          </motion.button>

          <motion.button
            onClick={() => handleCounterClick('rejected')}
            className="bg-white rounded-3xl p-3 shadow-lg border-2 border-red-100 text-left hover:shadow-xl transition-all relative"
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-xs text-gray-500 font-semibold block mb-1">Rejetés</span>
            <p className="text-2xl font-black text-red-600">{countRejected}</p>
            
            <motion.div
              animate={{ 
                x: [-3, 3, -3],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 0.8 }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center"
            >
              <XCircle className="w-6 h-6 text-red-600" />
            </motion.div>
          </motion.button>
        </motion.div>

        {/* Résumé du jour - Score JULABA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-6"
        >
          <ScoreResumeCard
            score={user?.scoreCredit || 78}
            role="identificateur"
            primaryColor={PRIMARY_COLOR}
            dailySummary={{
              ventes: countApproved,
              depenses: countRejected,
              caisse: stats.totalIdentifications,
            }}
            speak={speak}
            onNavigateToAcademy={() => navigate('/identificateur/academy')}
          />
        </motion.div>

        {/* Section Mon Territoire */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-[#9F8170]/10 via-white to-[#9F8170]/5 rounded-3xl p-6 shadow-lg border-2 border-[#9F8170]/20"
        >
          <div className="flex items-center gap-3 mb-6">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-[#9F8170] to-[#7a6558] flex items-center justify-center shadow-lg"
            >
              <MapPin className="w-6 h-6 text-white" />
            </motion.div>
            <h2 className="text-xl font-bold text-gray-900">Mon Territoire</h2>
          </div>

          {/* Badge Zone */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-3xl p-4 mb-5 inline-block shadow-md border-2 border-[#9F8170]/20"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#9F8170] to-[#7a6558] flex items-center justify-center shadow-md">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold">Zone assignée</p>
                <p className="font-bold text-gray-900 text-lg">{zoneAttribuee}</p>
              </div>
            </div>
          </motion.div>

          {/* Stats locales */}
          <div className="grid grid-cols-3 gap-4 mt-5">
            <motion.div 
              whileHover={{ y: -4 }}
              className="bg-white rounded-3xl p-5 text-center shadow-md border-2 border-blue-100"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              </motion.div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalIdentifications}</p>
              <p className="text-xs text-gray-600 mt-1 font-semibold">Acteurs enrôlés</p>
            </motion.div>
            <motion.div 
              whileHover={{ y: -4 }}
              className="bg-white rounded-3xl p-5 text-center shadow-md border-2 border-green-100"
            >
              <motion.div
                animate={{ y: [-2, 2, -2] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
              </motion.div>
              <p className="text-2xl font-bold text-gray-900">{stats.tauxValidation.toFixed(0)}%</p>
              <p className="text-xs text-gray-600 mt-1 font-semibold">Taux validation</p>
            </motion.div>
            <motion.div 
              whileHover={{ y: -4 }}
              className="bg-white rounded-3xl p-5 text-center shadow-md border-2 border-orange-100"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Target className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              </motion.div>
              <p className="text-2xl font-bold text-gray-900">{stats.identificationsEnCours}</p>
              <p className="text-xs text-gray-600 mt-1 font-semibold">En cours</p>
            </motion.div>
          </div>

          {/* Missions en cours */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-orange-600" />
              <h3 className="text-sm font-bold text-gray-900">Missions en cours</h3>
            </div>
            <motion.div 
              whileHover={{ scale: 1.01 }}
              className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 rounded-3xl p-5 border-2 border-orange-200 shadow-md"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-base">Objectif mensuel</p>
                  <p className="text-sm text-gray-600 mt-1">Identifier 50 nouveaux acteurs ce mois</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-orange-600">5,000 F</p>
                  <p className="text-xs text-gray-600 font-semibold">Prime</p>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-4">
                <div className="flex-1 h-3 bg-orange-200 rounded-full overflow-hidden border-2 border-orange-300">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((stats.totalIdentifications / 50) * 100, 100)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"
                  />
                </div>
                <span className="text-sm font-bold text-gray-900 min-w-[60px] text-right">
                  {stats.totalIdentifications}/50
                </span>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Click outside to close search results */}
        <AnimatePresence>
          {showSearchResults && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-10 bg-black/10 backdrop-blur-sm"
              onClick={() => {
                setShowSearchResults(false);
                setIsModalOpen(false);
              }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Navigation - Identique au Marchand */}
      <Navigation role="identificateur" onMicClick={handleTantieSagesseClick} />

      {/* Modal Full Screen - Nouveau Dossier */}
      <AnimatePresence>
        {showNouveauDossierModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={() => {
                setShowNouveauDossierModal(false);
                setIsModalOpen(false);
              }}
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="fixed inset-0 z-50 overflow-y-auto lg:pl-[320px]"
              style={{ pointerEvents: 'none' }}
            >
              <div className="min-h-screen flex items-start justify-center p-0 lg:p-4" style={{ pointerEvents: 'auto' }}>
                <div className="bg-white w-full lg:max-w-4xl lg:rounded-3xl shadow-2xl lg:my-8 min-h-screen lg:min-h-0 relative">
                  {/* Bouton de fermeture */}
                  <motion.button
                    onClick={() => {
                      setShowNouveauDossierModal(false);
                      setIsModalOpen(false);
                    }}
                    className="absolute top-4 right-4 z-10 w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center shadow-lg transition-colors"
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-6 h-6 text-gray-700" />
                  </motion.button>

                  {/* Formulaire */}
                  <div className="p-4 lg:p-6">
                    <FormulaireNouveauDossier />
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}