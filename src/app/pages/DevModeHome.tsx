/**
 * ═══════════════════════════════════════════════════════════════════
 * JÙLABA — Page Accueil Mode Développement
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Guide de navigation pour le mode dev
 */

import React from 'react';
import { useNavigate } from 'react-router';
import { 
  ShoppingBag, 
  Sprout, 
  Users, 
  Building2, 
  UserCheck,
  Shield,
  Code2,
  Eye,
  Zap,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { DEV_USER } from '../data/devMockData';

export function DevModeHome() {
  const navigate = useNavigate();

  const profiles = [
    {
      icon: ShoppingBag,
      name: 'Marchand',
      color: 'from-orange-500 to-amber-600',
      path: '/marchand',
      description: 'Interface commerçant',
    },
    {
      icon: Sprout,
      name: 'Producteur',
      color: 'from-green-600 to-emerald-700',
      path: '/producteur',
      description: 'Interface agriculteur',
    },
    {
      icon: Users,
      name: 'Coopérative',
      color: 'from-blue-500 to-cyan-600',
      path: '/cooperative',
      description: 'Gestion coopérative',
    },
    {
      icon: Building2,
      name: 'Institution',
      color: 'from-purple-600 to-violet-700',
      path: '/institution',
      description: 'Suivi institutionnel',
    },
    {
      icon: UserCheck,
      name: 'Identificateur',
      color: 'from-stone-500 to-zinc-600',
      path: '/identificateur',
      description: 'Enregistrement acteurs',
    },
    {
      icon: Shield,
      name: 'Back-Office',
      color: 'from-slate-700 to-gray-800',
      path: '/backoffice',
      description: 'Administration',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 mt-8"
        >
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-3xl shadow-xl mb-6">
            <Code2 className="w-8 h-8" />
            <h1 className="text-3xl font-bold">MODE DÉVELOPPEMENT</h1>
            <Zap className="w-8 h-8" />
          </div>
          
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Navigation libre sans données backend - Toutes les interfaces sont accessibles
          </p>
        </motion.div>

        {/* Info utilisateur mock */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl border-2 border-orange-300 p-6 mb-8 shadow-lg"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
              <Eye className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Utilisateur actif</h2>
              <p className="text-gray-600">
                {DEV_USER.firstName} {DEV_USER.lastName} - {DEV_USER.role}
              </p>
              <p className="text-sm text-gray-500">Région: {DEV_USER.region}</p>
            </div>
          </div>
        </motion.div>

        {/* Profils disponibles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((profile, index) => (
            <motion.button
              key={profile.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => navigate(profile.path)}
              className="group relative bg-white rounded-3xl border-2 border-gray-200 p-6 hover:border-orange-400 hover:shadow-xl transition-all duration-300"
            >
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${profile.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <profile.icon className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {profile.name}
              </h3>
              
              <p className="text-gray-600 text-sm mb-4">
                {profile.description}
              </p>
              
              <div className="flex items-center text-orange-500 font-semibold group-hover:gap-3 gap-2 transition-all">
                <span>Explorer</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>
          ))}
        </div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-3xl border-2 border-blue-200 p-6"
        >
          <h3 className="text-lg font-bold text-blue-900 mb-4">
            Instructions Mode Dev
          </h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</div>
              <span>Toutes les interfaces sont accessibles sans authentification</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</div>
              <span>Aucun appel API n'est effectué - Navigation pure UI</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</div>
              <span>Les données affichées sont des données mock minimales</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">4</div>
              <span>Pour désactiver le mode dev : ouvrir /src/app/config/devMode.ts et passer DEV_MODE à false</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
