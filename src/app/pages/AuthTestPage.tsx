/**
 * ═══════════════════════════════════════════════════════════════════
 * JÙLABA — PAGE DE TEST AUTHENTIFICATION SUPABASE
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Page de test pour valider l'intégration Supabase Auth.
 * MIGRATION PROGRESSIVE - SEMAINE 1
 */

import React, { useState } from 'react';
import { Check, X, Loader2, UserPlus, LogIn, User, LogOut } from 'lucide-react';
import * as authService from '../services/authService';

const TEST_USERS = [
  {
    phone: '0701020304',
    password: 'julaba2026',
    firstName: 'Aminata',
    lastName: 'Kouassi',
    role: 'marchand' as const,
    region: 'Abidjan',
    commune: 'Yopougon',
    activity: 'Vente de riz',
    market: 'Marché de Yopougon'
  },
  {
    phone: '0709080706',
    password: 'julaba2026',
    firstName: 'Konan',
    lastName: 'Yao',
    role: 'producteur' as const,
    region: 'Bouaké',
    commune: 'Bouaké Centre',
    activity: 'Production de maïs'
  },
  {
    phone: '0705040302',
    password: 'julaba2026',
    firstName: 'Marie',
    lastName: 'Bamba',
    role: 'cooperative' as const,
    region: 'San Pedro',
    commune: 'San Pedro',
    activity: 'Coopérative agricole',
    cooperativeName: 'COOP IVOIRE VIVRIER'
  },
  {
    phone: '0707070707',
    password: 'julaba2026',
    firstName: 'Jean',
    lastName: 'Kouadio',
    role: 'institution' as const,
    region: 'Abidjan',
    commune: 'Plateau',
    activity: 'Direction Générale de l\'Économie',
    institutionName: 'DGE Côte d\'Ivoire'
  },
  {
    phone: '0708080808',
    password: 'julaba2026',
    firstName: 'Sophie',
    lastName: 'Diarra',
    role: 'identificateur' as const,
    region: 'Abidjan',
    commune: 'Marcory',
    activity: 'Agent terrain',
    market: 'Marché de Yopougon'
  }
];

export default function AuthTestPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loginPhone, setLoginPhone] = useState('0701020304');
  const [loginPassword, setLoginPassword] = useState('julaba2026');

  const handleCreateAllUsers = async () => {
    setLoading(true);
    setResults([]);
    
    for (const user of TEST_USERS) {
      const result = await authService.signup(user);
      setResults(prev => [...prev, {
        user: `${user.firstName} ${user.lastName}`,
        phone: user.phone,
        success: result.success,
        error: result.error
      }]);
      
      // Petite pause entre chaque création
      await new Promise(r => setTimeout(r, 500));
    }
    
    setLoading(false);
  };

  const handleLogin = async () => {
    setLoading(true);
    const result = await authService.login({
      phone: loginPhone,
      password: loginPassword
    });
    
    if (result.success && result.user) {
      setCurrentUser(result.user);
    } else {
      alert(result.error || 'Erreur de connexion');
    }
    setLoading(false);
  };

  const handleGetCurrentUser = async () => {
    setLoading(true);
    const result = await authService.getCurrentUser();
    
    if (result.success && result.user) {
      setCurrentUser(result.user);
    } else {
      alert(result.error || 'Aucun utilisateur connecté');
      setCurrentUser(null);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await authService.logout();
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-purple-200">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Test Authentification Supabase
          </h1>
          <p className="text-gray-600">
            Migration Progressive - Semaine 1 : Authentification + Profils utilisateurs
          </p>
        </div>

        {/* Créer les utilisateurs de test */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-blue-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <UserPlus className="w-7 h-7 text-blue-600" />
            Créer les 5 utilisateurs de test
          </h2>
          
          <button
            onClick={handleCreateAllUsers}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 px-6 rounded-2xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Création en cours...
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                Créer tous les utilisateurs
              </>
            )}
          </button>

          {/* Résultats de création */}
          {results.length > 0 && (
            <div className="mt-6 space-y-3">
              {results.map((result, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-2xl border-2 flex items-center justify-between ${
                    result.success
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div>
                    <p className="font-semibold text-gray-900">{result.user}</p>
                    <p className="text-sm text-gray-600">{result.phone}</p>
                    {result.error && (
                      <p className="text-sm text-red-600 mt-1">{result.error}</p>
                    )}
                  </div>
                  {result.success ? (
                    <Check className="w-6 h-6 text-green-600" />
                  ) : (
                    <X className="w-6 h-6 text-red-600" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Connexion */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-green-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <LogIn className="w-7 h-7 text-green-600" />
            Connexion
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Téléphone
              </label>
              <input
                type="tel"
                value={loginPhone}
                onChange={(e) => setLoginPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-green-500 focus:outline-none"
                placeholder="0701020304"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-green-500 focus:outline-none"
                placeholder="julaba2026"
              />
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-green-600 text-white py-4 px-6 rounded-2xl font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Connexion...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Se connecter
                </>
              )}
            </button>
          </div>
        </div>

        {/* Utilisateur connecté */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-purple-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <User className="w-7 h-7 text-purple-600" />
            Utilisateur connecté
          </h2>

          <div className="space-y-4">
            <button
              onClick={handleGetCurrentUser}
              disabled={loading}
              className="w-full bg-purple-600 text-white py-4 px-6 rounded-2xl font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Chargement...
                </>
              ) : (
                <>
                  <User className="w-5 h-5" />
                  Récupérer profil actuel
                </>
              )}
            </button>

            {currentUser && (
              <div className="p-6 rounded-2xl bg-purple-50 border-2 border-purple-200">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Nom complet</p>
                    <p className="font-semibold text-gray-900">
                      {currentUser.firstName} {currentUser.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Téléphone</p>
                    <p className="font-semibold text-gray-900">{currentUser.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Rôle</p>
                    <p className="font-semibold text-gray-900 capitalize">{currentUser.role}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Score</p>
                    <p className="font-semibold text-gray-900">{currentUser.score}/100</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Région</p>
                    <p className="font-semibold text-gray-900">{currentUser.region}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Validé</p>
                    <p className="font-semibold text-gray-900">
                      {currentUser.validated ? 'Oui' : 'Non'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full bg-red-600 text-white py-3 px-6 rounded-2xl font-semibold hover:bg-red-700 flex items-center justify-center gap-3"
                >
                  <LogOut className="w-5 h-5" />
                  Se déconnecter
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Liste des utilisateurs de test */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Utilisateurs de test disponibles
          </h2>
          
          <div className="space-y-3">
            {TEST_USERS.map((user, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl border-2 border-gray-200 hover:border-purple-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {user.phone} • {user.role} • {user.region}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 font-mono">
                    {user.password}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
