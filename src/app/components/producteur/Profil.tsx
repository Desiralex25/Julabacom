import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  User,
  MapPin,
  Phone,
  Mail,
  Edit,
  Camera,
  Award,
  TrendingUp,
  Package,
  DollarSign,
  CheckCircle,
  Settings,
  Bell,
  Shield,
  LogOut,
  ChevronRight,
} from 'lucide-react';

export function Profil() {
  const [modeEdition, setModeEdition] = useState(false);

  // Données mock utilisateur
  const utilisateur = {
    nom: 'Kouamé',
    prenom: 'Adjoua',
    nomComplet: 'Adjoua Kouamé',
    photo: '👨🏾‍🌾',
    telephone: '+225 07 XX XX XX XX',
    email: 'adjoua.kouame@producteur.ci',
    localisation: 'Yamoussoukro, Côte d\'Ivoire',
    zone: 'Région du Centre',
    score: 87,
    niveau: 'Expert',
    dateInscription: 'Janvier 2025',
    specialites: ['Maraîchage', 'Tubercules', 'Légumes'],
  };

  const statistiques = {
    commandesLivrees: 145,
    tauxSatisfaction: 96,
    revenus: 15750000,
    produitsActifs: 8,
  };

  const parametres = [
    { 
      icone: Bell, 
      titre: 'Notifications', 
      description: 'Gérer les alertes', 
      badge: '3 nouveaux',
      couleur: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    { 
      icone: Shield, 
      titre: 'Sécurité & Confidentialité', 
      description: 'Protéger votre compte',
      couleur: 'text-green-600',
      bg: 'bg-green-100',
    },
    { 
      icone: Settings, 
      titre: 'Paramètres généraux', 
      description: 'Langue, devise, etc.',
      couleur: 'text-gray-600',
      bg: 'bg-gray-100',
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Mon Profil</h1>

      {/* Carte profil principal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[#00563B] to-[#16A34A] rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden"
      >
        {/* Motif décoratif */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex items-start gap-6">
          {/* Photo de profil */}
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-5xl border-4 border-white/40">
              {utilisateur.photo}
            </div>
            <motion.button
              className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-white text-[#00563B] flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Camera className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Informations */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="text-2xl font-bold mb-1">{utilisateur.nomComplet}</h2>
                <p className="text-white/80">Producteur certifié</p>
              </div>
              <motion.button
                onClick={() => setModeEdition(!modeEdition)}
                className="px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm text-white font-semibold flex items-center gap-2 border-2 border-white/40 hover:bg-white/30"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Edit className="w-4 h-4" />
                Modifier
              </motion.button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-white/70" />
                <span className="text-sm">{utilisateur.localisation}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-white/70" />
                <span className="text-sm">{utilisateur.telephone}</span>
              </div>
            </div>

            {/* Badge niveau */}
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-xl bg-yellow-400/90 text-yellow-900 font-bold flex items-center gap-2">
                <Award className="w-5 h-5" />
                <span>{utilisateur.niveau} - {utilisateur.score} pts</span>
              </div>
              <div className="flex gap-1">
                {utilisateur.specialites.map((spec, i) => (
                  <span key={i} className="px-3 py-1 rounded-lg bg-white/20 text-xs font-semibold">
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-5 shadow-md border-2 border-gray-100"
          whileHover={{ scale: 1.05, y: -4 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-[#00563B]" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Livraisons</p>
              <p className="text-2xl font-bold text-gray-900">{statistiques.commandesLivrees}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl p-5 shadow-md border-2 border-gray-100"
          whileHover={{ scale: 1.05, y: -4 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Satisfaction</p>
              <p className="text-2xl font-bold text-gray-900">{statistiques.tauxSatisfaction}%</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-5 shadow-md border-2 border-gray-100"
          whileHover={{ scale: 1.05, y: -4 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-[#00563B]" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Revenus total</p>
              <p className="text-lg font-bold text-gray-900">{(statistiques.revenus / 1000000).toFixed(1)}M F</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl p-5 shadow-md border-2 border-gray-100"
          whileHover={{ scale: 1.05, y: -4 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
              <Package className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Produits</p>
              <p className="text-2xl font-bold text-gray-900">{statistiques.produitsActifs}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Informations détaillées */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl p-6 shadow-md border-2 border-gray-100"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-4">Informations personnelles</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <User className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Nom complet</p>
              <p className="font-semibold text-gray-900">{utilisateur.nomComplet}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <Phone className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Téléphone</p>
              <p className="font-semibold text-gray-900">{utilisateur.telephone}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <Mail className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="font-semibold text-gray-900">{utilisateur.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <MapPin className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Zone de production</p>
              <p className="font-semibold text-gray-900">{utilisateur.zone}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Paramètres */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-lg font-bold text-gray-900 mb-4">Paramètres du compte</h3>
        
        <div className="space-y-3">
          {parametres.map((param, index) => (
            <motion.button
              key={index}
              className="w-full bg-white rounded-2xl p-5 shadow-md border-2 border-gray-100 flex items-center gap-4 text-left"
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`w-12 h-12 rounded-xl ${param.bg} flex items-center justify-center`}>
                <param.icone className={`w-6 h-6 ${param.couleur}`} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900">{param.titre}</h4>
                <p className="text-sm text-gray-500">{param.description}</p>
              </div>
              {param.badge && (
                <span className="px-3 py-1 rounded-full bg-red-100 text-red-600 text-xs font-bold">
                  {param.badge}
                </span>
              )}
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </motion.button>
          ))}

          {/* Bouton déconnexion */}
          <motion.button
            className="w-full bg-red-50 rounded-2xl p-5 border-2 border-red-200 flex items-center gap-4 text-left"
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <LogOut className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-red-600">Se déconnecter</h4>
              <p className="text-sm text-red-500">Quitter votre session</p>
            </div>
            <ChevronRight className="w-5 h-5 text-red-400" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
