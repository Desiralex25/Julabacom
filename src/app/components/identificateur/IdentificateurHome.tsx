import React, { useState, useMemo, useCallback } from 'react';
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
import { TantieSagesseCard } from '../shared/TantieSagesseCard';
const tantieSagesseImg = '/images/tantie-sagesse-identificateur.png';
import { ACTEURS_DATA } from '../../data/acteursData';

const PRIMARY_COLOR = '#9F8170';

export function IdentificateurHome() {
  const navigate = useNavigate();
  const { user, speak, setIsModalOpen } = useApp();
  const { getMesIdentifications, getStatsIdentificateur } = useIdentificateur();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showNouveauDossierModal, setShowNouveauDossierModal] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

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
    ? ACTEURS_DATA.filter(acteur => acteur.numero.includes(searchQuery))
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
      <div className="pb-32 lg:pb-8 pt-16 lg:pt-10 px-4 lg:pl-[320px] max-w-2xl lg:max-w-7xl mx-auto min-h-screen bg-gradient-to-b from-[#9F8170]/5 via-white to-gray-50">
        
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
            <Card className="flex-1 px-5 py-5 rounded-3xl border-2 shadow-lg relative overflow-hidden" style={{ borderColor: PRIMARY_COLOR }}>
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
              
              <div className="relative z-10 flex flex-col justify-between h-full">
                {/* Textes */}
                <div className="flex-1 flex flex-col justify-center">
                  <motion.h3 
                    className="font-black text-gray-900 mb-1 leading-tight"
                    style={{ fontSize: 'clamp(1.4rem, 4.5vw, 2.2rem)' }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Tantie Sagesse
                  </motion.h3>
                  <motion.p 
                    className="text-gray-600 leading-snug"
                    style={{ fontSize: 'clamp(0.8rem, 2.5vw, 1rem)' }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    Bonjour {user?.firstName} ! Votre zone {zoneAttribuee} compte {stats.totalIdentifications} acteurs enrôlés
                  </motion.p>
                </div>

                {/* Bouton aligné à droite, dans le flux */}
                <div className="flex justify-end mt-2">
                  <motion.button
                    onClick={handleListenMessage}
                    className="w-11 h-11 rounded-full flex items-center justify-center text-white shadow-md flex-shrink-0"
                    style={{ backgroundColor: PRIMARY_COLOR }}
                    whileHover={{ scale: 1.1, boxShadow: `0 8px 20px ${PRIMARY_COLOR}33` }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Volume2 className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>

        {/* Grande barre de recherche */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <motion.div 
            className="relative"
            animate={isSearchFocused ? { scale: 1.02 } : { scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            {/* Icône loupe animée */}
            <div className="absolute left-4 top-5 z-10">
              <motion.div
                className="w-11 h-11 rounded-full flex items-center justify-center relative"
                style={{ background: `linear-gradient(135deg, ${PRIMARY_COLOR}25 0%, ${PRIMARY_COLOR}45 100%)` }}
                animate={
                  searchQuery.length > 0
                    ? { rotate: [0, -15, 15, -10, 10, 0], scale: [1, 1.15, 1] }
                    : isSearchFocused
                    ? { scale: [1, 1.08, 1] }
                    : { scale: 1, rotate: 0 }
                }
                transition={
                  searchQuery.length > 0
                    ? { duration: 0.5, repeat: Infinity, repeatDelay: 1.5 }
                    : isSearchFocused
                    ? { duration: 1.2, repeat: Infinity }
                    : {}
                }
              >
                <Search className="w-5 h-5" style={{ color: PRIMARY_COLOR }} />
                {searchQuery.length > 0 && (
                  <>
                    <motion.div
                      className="absolute inset-0 rounded-full border-2"
                      style={{ borderColor: PRIMARY_COLOR }}
                      animate={{ scale: [1, 2], opacity: [0.6, 0] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-full border-2"
                      style={{ borderColor: PRIMARY_COLOR }}
                      animate={{ scale: [1, 2], opacity: [0.4, 0] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
                    />
                  </>
                )}
                {isSearchFocused && searchQuery.length === 0 && (
                  <motion.div
                    className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white"
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
              </motion.div>
            </div>

            {/* Input */}
            <input
              type="tel"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => {
                setIsSearchFocused(true);
                if (searchQuery.length > 0) setShowSearchResults(true);
              }}
              onBlur={() => {
                setIsSearchFocused(false);
                // Délai pour permettre le clic sur un résultat
                setTimeout(() => setShowSearchResults(false), 200);
              }}
              placeholder="Tape un numéro pour rechercher..."
              className="w-full pl-20 pr-14 py-5 rounded-3xl border-2 focus:outline-none text-base font-medium bg-white shadow-lg transition-all"
              style={{
                borderColor: searchQuery.length > 0
                  ? PRIMARY_COLOR
                  : isSearchFocused
                  ? `${PRIMARY_COLOR}88`
                  : '#e5e7eb',
                boxShadow: isSearchFocused
                  ? `0 8px 30px ${PRIMARY_COLOR}20`
                  : '0 4px 16px rgba(0,0,0,0.06)',
                borderBottomLeftRadius: showSearchResults && filteredActeurs.length > 0 ? '0' : undefined,
                borderBottomRightRadius: showSearchResults && filteredActeurs.length > 0 ? '0' : undefined,
              }}
            />

            {/* Compteur résultats */}
            {searchQuery.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-14 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: filteredActeurs.length > 0 ? PRIMARY_COLOR : '#9ca3af' }}
              >
                {filteredActeurs.length}
              </motion.div>
            )}

            {/* Bouton clear */}
            <AnimatePresence>
              {searchQuery.length > 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0, rotate: -90 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0 }}
                  onClick={() => {
                    setSearchQuery('');
                    setShowSearchResults(false);
                    setIsModalOpen(false);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-red-100 transition-colors"
                  whileHover={{ scale: 1.15, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <XCircle className="w-5 h-5 text-gray-500" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Shimmer idle */}
            {!isSearchFocused && searchQuery.length === 0 && (
              <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                <motion.div
                  className="absolute inset-0"
                  style={{ background: `linear-gradient(90deg, transparent 0%, ${PRIMARY_COLOR}08 50%, transparent 100%)` }}
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
                />
              </div>
            )}
          </motion.div>

          {/* ---- Accordéon résultats inline (sous la barre, sans overlay) ---- */}
          <AnimatePresence>
            {showSearchResults && searchQuery.length > 0 && (
              <motion.div
                key="search-results"
                initial={{ opacity: 0, scaleY: 0.85, y: -8 }}
                animate={{ opacity: 1, scaleY: 1, y: 0 }}
                exit={{ opacity: 0, scaleY: 0.85, y: -8 }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                style={{
                  transformOrigin: 'top center',
                  borderColor: `${PRIMARY_COLOR}50`,
                }}
                className="bg-white border-2 border-t-0 rounded-b-3xl shadow-2xl overflow-hidden"
              >
                {/* Header avec compteur */}
                <div
                  className="px-5 py-3 flex items-center gap-2 border-b border-gray-100"
                  style={{ background: `${PRIMARY_COLOR}08` }}
                >
                  <motion.div
                    animate={{ rotate: filteredActeurs.length > 0 ? [0, 360] : 0 }}
                    transition={{ duration: 1.5, repeat: filteredActeurs.length > 0 ? Infinity : 0, ease: 'linear' }}
                  >
                    <Search className="w-4 h-4" style={{ color: PRIMARY_COLOR }} />
                  </motion.div>
                  <span className="text-sm font-semibold text-gray-500">
                    {filteredActeurs.length > 0
                      ? `${filteredActeurs.length} résultat${filteredActeurs.length > 1 ? 's' : ''} pour "${searchQuery}"`
                      : `Aucun acteur trouvé pour "${searchQuery}"`
                    }
                  </span>
                </div>

                {/* Liste des résultats */}
                {filteredActeurs.length > 0 ? (
                  <div className="max-h-80 overflow-y-auto overscroll-contain">
                    {filteredActeurs.map((acteur, index) => (
                      <motion.button
                        key={acteur.numero}
                        onMouseDown={() => handleActeurClick(acteur.numero)}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05, type: 'spring', stiffness: 350, damping: 28 }}
                        className="w-full px-5 py-4 flex items-center gap-3 border-b border-gray-50 last:border-b-0 text-left transition-colors"
                        style={{ background: 'white' }}
                        whileHover={{ backgroundColor: `${PRIMARY_COLOR}0D`, x: 3 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {/* Avatar */}
                        <motion.div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black shadow-md flex-shrink-0 text-lg"
                          style={{ background: `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, #7a6558 100%)` }}
                          whileHover={{ scale: 1.08, rotate: 4 }}
                        >
                          {acteur.nom.charAt(0)}
                        </motion.div>

                        {/* Infos */}
                        <div className="flex-1 min-w-0">
                          {/* Numéro avec surlignage de la séquence tapée */}
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <Phone className="w-3.5 h-3.5 flex-shrink-0" style={{ color: PRIMARY_COLOR }} />
                            <p className="font-bold text-gray-900 text-sm tracking-wide">
                              {(() => {
                                const idx = acteur.numero.indexOf(searchQuery);
                                if (idx < 0) return <span className="text-gray-600">{acteur.numero}</span>;
                                return (
                                  <>
                                    <span className="text-gray-500">{acteur.numero.slice(0, idx)}</span>
                                    <span
                                      className="font-black rounded px-0.5"
                                      style={{ color: PRIMARY_COLOR, background: `${PRIMARY_COLOR}22` }}
                                    >
                                      {acteur.numero.slice(idx, idx + searchQuery.length)}
                                    </span>
                                    <span className="text-gray-500">{acteur.numero.slice(idx + searchQuery.length)}</span>
                                  </>
                                );
                              })()}
                            </p>
                          </div>
                          <p className="font-black text-gray-900 text-sm truncate">{acteur.nom} {acteur.prenoms}</p>
                          <p className="text-xs text-gray-500 truncate capitalize">{acteur.role} · {acteur.marche}</p>
                        </div>

                        {/* Badge statut */}
                        <div
                          className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 flex-shrink-0 ${
                            acteur.statut === 'approved' ? 'bg-green-50 text-green-700 border-green-300' :
                            acteur.statut === 'soumis' ? 'bg-orange-50 text-orange-700 border-orange-300' :
                            acteur.statut === 'rejected' ? 'bg-red-50 text-red-700 border-red-300' :
                            'bg-gray-50 text-gray-600 border-gray-200'
                          }`}
                        >
                          {acteur.statut === 'approved' ? 'Validé' :
                           acteur.statut === 'soumis' ? 'En cours' :
                           acteur.statut === 'rejected' ? 'Rejeté' : 'Brouillon'}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="px-5 py-8 flex flex-col items-center gap-3"
                  >
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center"
                    >
                      <Search className="w-7 h-7 text-gray-400" />
                    </motion.div>
                    <p className="text-gray-500 font-semibold text-sm text-center">
                      Numéro "{searchQuery}" non enrôlé
                    </p>
                    <p className="text-gray-400 text-xs text-center">
                      Crée un nouveau dossier pour cet acteur
                    </p>
                  </motion.div>
                )}
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
              className="fixed inset-0 z-10"
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
              className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm"
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
              className="fixed inset-0 z-[200] overflow-y-auto lg:pl-[320px]"
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