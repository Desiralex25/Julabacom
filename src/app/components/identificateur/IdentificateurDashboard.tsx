import React from 'react';
import { useNavigate } from 'react-router';
import { MapPin, Users, TrendingUp, Award, Calendar, UserPlus, Eye, Clock, Target, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useUser } from '../../contexts/UserContext';
import { useIdentificateur } from '../../contexts/IdentificateurContext';
import { useZones } from '../../contexts/ZoneContext';
import { useApp } from '../../contexts/AppContext';

const PRIMARY_COLOR = '#9F8170';

export function IdentificateurDashboard() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { getMesIdentifications, getStatsIdentificateur, getTotalCommissions, getMissionsActives } = useIdentificateur();
  const { getZoneById } = useZones();
  const { setAppTitle, speak } = useApp();

  // Zone attribuée (mock - à enrichir dans UserContext)
  const zoneAttribuee = user?.market || 'Marché de Cocody';
  const zoneId = '1'; // TODO: Récupérer depuis user.zoneAttribueeId
  const zone = getZoneById(zoneId);

  const mesIdentifications = getMesIdentifications();
  const stats = getStatsIdentificateur(user?.telephone || 'ID001');
  const missionsActives = getMissionsActives();

  const moisActuel = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  setAppTitle('Tableau de bord');

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#9F8170]/5 via-white to-gray-50 pb-24 lg:pl-[320px]">
      {/* Header avec Zone */}
      <div className="p-6 bg-white/80 backdrop-blur-sm border-b-2 border-gray-100">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-600 font-semibold">Bienvenue,</p>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">
              {user?.prenoms} {user?.nom}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <MapPin className="w-4 h-4" style={{ color: PRIMARY_COLOR }} />
              <span className="text-sm font-bold" style={{ color: PRIMARY_COLOR }}>
                {zoneAttribuee}
              </span>
            </div>
          </div>
          <motion.button
            onClick={() => navigate('/identificateur/identification')}
            className="px-5 py-3 rounded-3xl text-white font-bold shadow-lg flex items-center gap-2 border-2"
            style={{ backgroundColor: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
          >
            <UserPlus className="w-5 h-5" />
            <span className="hidden sm:inline">Nouveau</span>
          </motion.button>
        </div>
      </div>

      {/* Mon Territoire - Stats rapides */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Mon Territoire</h2>
          <span className="text-xs text-gray-500 font-semibold">{moisActuel}</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <motion.div
            className="bg-white rounded-3xl p-5 shadow-lg border-2 border-blue-100"
            whileHover={{ y: -4, scale: 1.02 }}
          >
            <div className="flex items-center justify-between mb-3">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center"
              >
                <Users className="w-6 h-6 text-blue-600" />
              </motion.div>
              <span className="text-xs text-gray-500 font-semibold">Total</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalIdentifications}</p>
            <p className="text-xs text-gray-600 mt-1 font-semibold">Identifications</p>
          </motion.div>

          <motion.div
            className="bg-white rounded-3xl p-5 shadow-lg border-2 border-green-100"
            whileHover={{ y: -4, scale: 1.02 }}
          >
            <div className="flex items-center justify-between mb-3">
              <motion.div
                animate={{ y: [-2, 2, -2] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center"
              >
                <TrendingUp className="w-6 h-6 text-green-600" />
              </motion.div>
              <span className="text-xs text-gray-500 font-semibold">Ce mois</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats.identificationsValidees}
            </p>
            <p className="text-xs text-gray-600 mt-1 font-semibold">Validées</p>
          </motion.div>

          <motion.div
            className="bg-white rounded-3xl p-5 shadow-lg border-2 border-[#9F8170]/20"
            whileHover={{ y: -4, scale: 1.02 }}
          >
            <div className="flex items-center justify-between mb-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-[#9F8170]/20 to-[#9F8170]/30 flex items-center justify-center"
              >
                <Award className="w-6 h-6" style={{ color: PRIMARY_COLOR }} />
              </motion.div>
              <span className="text-xs text-gray-500 font-semibold">Taux</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats.tauxValidation.toFixed(0)}%
            </p>
            <p className="text-xs text-gray-600 mt-1 font-semibold">Validation</p>
          </motion.div>

          <motion.div
            className="bg-white rounded-3xl p-5 shadow-lg border-2 border-orange-100"
            whileHover={{ y: -4, scale: 1.02 }}
          >
            <div className="flex items-center justify-between mb-3">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center"
              >
                <Clock className="w-6 h-6 text-orange-600" />
              </motion.div>
              <span className="text-xs text-gray-500 font-semibold">En cours</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats.identificationsEnCours}
            </p>
            <p className="text-xs text-gray-600 mt-1 font-semibold">À valider</p>
          </motion.div>
        </div>

        {/* CTA Principal - Nouveau dossier */}
        <motion.div
          onClick={() => {
            speak('Nouveau dossier');
            navigate('/identificateur/identification');
          }}
          className="mb-6 bg-gradient-to-r from-[#9F8170] via-[#B39485] to-[#9F8170] rounded-3xl p-6 shadow-2xl border-2 border-[#9F8170] cursor-pointer overflow-hidden relative"
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
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

        {/* Missions actives */}
        {missionsActives.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-orange-600" />
              <h3 className="text-sm font-bold text-gray-900">Missions en cours</h3>
            </div>
            {missionsActives.slice(0, 2).map((mission) => (
              <motion.div
                key={mission.id}
                className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 rounded-3xl p-5 mb-3 border-2 border-orange-200 shadow-md"
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-base">{mission.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4 text-gray-600" />
                      <p className="text-sm text-gray-600">
                        Jusqu'au {new Date(mission.dateFin).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-orange-600">
                      {mission.recompense.toLocaleString()} F
                    </p>
                    <p className="text-xs text-gray-600 font-semibold">Prime</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-4">
                  <div className="flex-1 h-3 bg-orange-200 rounded-full overflow-hidden border-2 border-orange-300">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((stats.totalIdentifications / mission.objectif) * 100, 100)}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-900 min-w-[60px] text-right">
                    {stats.totalIdentifications}/{mission.objectif}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Dernières identifications */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900">Dernières identifications</h3>
            <button
              onClick={() => navigate('/identificateur/suivi')}
              className="text-xs font-bold"
              style={{ color: PRIMARY_COLOR }}
            >
              Voir tout →
            </button>
          </div>

          <div className="space-y-3">
            {mesIdentifications.slice(0, 5).map((ident) => (
              <motion.div
                key={ident.id}
                className="bg-white rounded-3xl p-5 shadow-lg border-2 border-gray-100"
                whileHover={{ x: 4, scale: 1.01 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-md"
                      style={{ backgroundColor: ident.typeActeur === 'marchand' ? '#C66A2C' : '#2E8B57' }}
                    >
                      {ident.prenoms.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">
                        {ident.prenoms} {ident.nom}
                      </p>
                      <p className="text-xs text-gray-600 font-semibold">{ident.activite}</p>
                      <p className="text-xs text-gray-500 mt-1 font-medium">
                        {ident.typeActeur}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 ${
                        ident.statut === 'valide'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : ident.statut === 'en_cours'
                          ? 'bg-orange-50 text-orange-700 border-orange-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      {ident.statut === 'valide' ? 'Validé' : ident.statut === 'en_cours' ? 'En cours' : 'Rejeté'}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 font-medium">
                      {new Date(ident.dateIdentification).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}

            {mesIdentifications.length === 0 && (
              <div className="text-center py-16">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Eye className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                </motion.div>
                <p className="text-gray-600 font-bold text-lg">Aucune identification</p>
                <p className="text-sm text-gray-500 mt-2 mb-6">Commencez par identifier un nouveau membre</p>
                <motion.button
                  onClick={() => navigate('/identificateur/identification')}
                  className="px-6 py-3 rounded-3xl text-white font-bold shadow-lg border-2"
                  style={{ backgroundColor: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Identifier un membre
                </motion.button>
              </div>
            )}
          </div>
        </div>

        {/* Infos zone */}
        {zone && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 bg-gradient-to-br from-purple-50 via-blue-50 to-purple-50 rounded-3xl p-6 border-2 border-purple-200 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-4">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md"
              >
                <MapPin className="w-5 h-5 text-white" />
              </motion.div>
              <h3 className="font-bold text-gray-900 text-base">Informations de ma zone</h3>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <motion.div whileHover={{ y: -4 }} className="bg-white rounded-3xl p-4 border-2 border-purple-100 shadow-md">
                <p className="text-2xl font-bold text-gray-900">{zone.nombreMarchands}</p>
                <p className="text-xs text-gray-600 mt-1 font-semibold">Marchands</p>
              </motion.div>
              <motion.div whileHover={{ y: -4 }} className="bg-white rounded-3xl p-4 border-2 border-purple-100 shadow-md">
                <p className="text-2xl font-bold text-gray-900">{zone.nombreProducteurs}</p>
                <p className="text-xs text-gray-600 mt-1 font-semibold">Producteurs</p>
              </motion.div>
              <motion.div whileHover={{ y: -4 }} className="bg-white rounded-3xl p-4 border-2 border-purple-100 shadow-md">
                <p className="text-2xl font-bold text-gray-900">{zone.nombreIdentificateurs}</p>
                <p className="text-xs text-gray-600 mt-1 font-semibold">Identificateurs</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}