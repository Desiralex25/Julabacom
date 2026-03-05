import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Users, Clock, CheckCircle, XCircle, MapPin, TrendingUp, Target, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useUser } from '../../contexts/UserContext';
import { useIdentificateur } from '../../contexts/IdentificateurContext';
import { useZones } from '../../contexts/ZoneContext';
import { useApp } from '../../contexts/AppContext';
import { SearchBar } from '../shared/SearchBar';
import { filterBySearch } from '../../utils/searchUtils';
import { ACTEURS_DATA } from '../../data/acteursData';

const PRIMARY_COLOR = '#9F8170';

export function IdentificateurAccueil() {
  const navigate = useNavigate();
  const { user, speak } = useApp();
  const { getMesIdentifications, getStatsIdentificateur } = useIdentificateur();
  const { getZoneById } = useZones();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Zone attribuée
  const zoneAttribuee = user?.market || 'Marché de Cocody';
  const stats = getStatsIdentificateur(user?.telephone || 'ID001');
  const mesIdentifications = getMesIdentifications();

  // Calcul des compteurs
  const countDraft = mesIdentifications.filter(i => i.statut === 'draft').length;
  const countSubmitted = mesIdentifications.filter(i => i.statut === 'en_cours').length;
  const countApproved = mesIdentifications.filter(i => i.statut === 'valide').length;
  const countRejected = mesIdentifications.filter(i => i.statut === 'rejete').length;

  // Filtrer via la fonction unifiée — recherche sur numero, nom, prenoms, marche, commune
  const filteredActeurs = filterBySearch(searchQuery, ACTEURS_DATA, (a) => [
    a.numero, a.nom, a.prenoms, a.marche, a.commune, a.telephone,
  ]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setShowSearchResults(val.length > 0);
  };

  const handleActeurClick = (numero: string) => {
    navigate(`/identificateur/acteur/${numero}`);
    setShowSearchResults(false);
    setSearchQuery('');
  };

  const handleCounterClick = (filter: string) => {
    navigate('/identificateur/suivi', { state: { filter } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#9F8170]/5 via-white to-gray-50 pb-24 lg:pl-[320px]">
      <div className="p-6">
        {/* Grande barre de recherche */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6 relative"
        >
          <SearchBar
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Rechercher par nom, numéro, marché..."
            primaryColor={PRIMARY_COLOR}
            onVoiceResult={(t) => { speak(`Recherche pour ${t}`); setShowSearchResults(true); }}
          />

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
                      {acteur.prenoms.charAt(0)}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-[#9F8170]" />
                        <p className="font-bold text-gray-900">{acteur.telephone}</p>
                      </div>
                      <p className="text-sm text-gray-900 font-semibold mt-0.5">{acteur.prenoms} {acteur.nom}</p>
                      <p className="text-xs text-gray-600 capitalize">{acteur.role} — {acteur.marche}</p>
                    </div>
                    <div className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 ${
                      acteur.statut === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                      acteur.statut === 'soumis' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                      acteur.statut === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                      'bg-gray-50 text-gray-700 border-gray-200'
                    }`}>
                      {acteur.statut === 'approved' ? 'Validé' :
                       acteur.statut === 'soumis' ? 'En cours' :
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

        {/* Compteurs cliquables */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
        >
          <motion.button
            onClick={() => handleCounterClick('draft')}
            className="bg-white rounded-3xl p-5 shadow-lg border-2 border-gray-100 text-left hover:shadow-xl transition-all"
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between mb-3">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center"
              >
                <Clock className="w-6 h-6 text-gray-600" />
              </motion.div>
              <span className="text-xs text-gray-500 font-semibold">Brouillons</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{countDraft}</p>
            <p className="text-xs text-gray-600 mt-1">En attente d'envoi</p>
          </motion.button>

          <motion.button
            onClick={() => handleCounterClick('submitted')}
            className="bg-white rounded-3xl p-5 shadow-lg border-2 border-orange-100 text-left hover:shadow-xl transition-all"
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between mb-3">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center"
              >
                <Clock className="w-6 h-6 text-orange-600" />
              </motion.div>
              <span className="text-xs text-gray-500 font-semibold">En attente</span>
            </div>
            <p className="text-3xl font-bold text-orange-600">{countSubmitted}</p>
            <p className="text-xs text-gray-600 mt-1">En validation</p>
          </motion.button>

          <motion.button
            onClick={() => handleCounterClick('approved')}
            className="bg-white rounded-3xl p-5 shadow-lg border-2 border-green-100 text-left hover:shadow-xl transition-all"
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between mb-3">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center"
              >
                <CheckCircle className="w-6 h-6 text-green-600" />
              </motion.div>
              <span className="text-xs text-gray-500 font-semibold">Validés</span>
            </div>
            <p className="text-3xl font-bold text-green-600">{countApproved}</p>
            <p className="text-xs text-gray-600 mt-1">Acteurs validés</p>
          </motion.button>

          <motion.button
            onClick={() => handleCounterClick('rejected')}
            className="bg-white rounded-3xl p-5 shadow-lg border-2 border-red-100 text-left hover:shadow-xl transition-all"
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between mb-3">
              <motion.div
                animate={{ x: [-2, 2, -2] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center"
              >
                <XCircle className="w-6 h-6 text-red-600" />
              </motion.div>
              <span className="text-xs text-gray-500 font-semibold">Rejetés</span>
            </div>
            <p className="text-3xl font-bold text-red-600">{countRejected}</p>
            <p className="text-xs text-gray-600 mt-1">À corriger</p>
          </motion.button>
        </motion.div>

        {/* Section Mon Territoire */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
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
            transition={{ delay: 0.3 }}
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
      </div>

      {/* Click outside to close search results */}
      <AnimatePresence>
        {showSearchResults && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-10 bg-black/10 backdrop-blur-sm"
            onClick={() => setShowSearchResults(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}