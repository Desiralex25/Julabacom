/**
 * ═══════════════════════════════════════════════════════════════════
 * JÙLABA — Page de connexion Back-Office (Production)
 * ═══════════════════════════════════════════════════════════════════
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { LogIn, Crown, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useBackOffice, MOCK_BO_USERS } from '../../contexts/BackOfficeContext';
import { toast } from 'sonner';

const BO_PRIMARY = '#E6A817';
const BO_DARK = '#3B3C36';

export function BOLogin() {
  const navigate = useNavigate();
  const { setBOUser } = useBackOffice();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulation délai réseau
    await new Promise(r => setTimeout(r, 800));

    // Vérification contre les utilisateurs BO
    const user = MOCK_BO_USERS.find(u => u.email === email);

    if (!user) {
      setError('Email non reconnu');
      setIsLoading(false);
      return;
    }

    if (!user.actif) {
      setError('Compte désactivé. Contactez l\'administrateur.');
      setIsLoading(false);
      return;
    }

    // TODO: En production, vérifier le vrai mot de passe
    // Pour l'instant, on accepte n'importe quel mot de passe si l'email existe
    if (password.length < 4) {
      setError('Mot de passe trop court');
      setIsLoading(false);
      return;
    }

    // Connexion réussie
    console.log(`✅ Connexion BO réussie: ${user.prenom} ${user.nom} (${user.role})`);
    setBOUser(user);
    toast.success(`Bienvenue ${user.prenom} !`, {
      description: `Connecté en tant que ${getRoleLabel(user.role)}`,
    });
    
    setIsLoading(false);
    navigate('/backoffice/dashboard');
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      'super_admin': 'Super Administrateur',
      'admin_national': 'Administrateur National',
      'gestionnaire_zone': 'Gestionnaire de Zone',
      'analyste': 'Analyste',
    };
    return labels[role] || role;
  };

  // Comptes de démonstration
  const demoAccounts = [
    { email: 'superadmin@julaba.ci', label: 'Super Admin', role: 'super_admin' },
    { email: 'admin.national@julaba.ci', label: 'Admin National', role: 'admin_national' },
    { email: 'gestionnaire.abidjan@julaba.ci', label: 'Gestionnaire Zone', role: 'gestionnaire_zone' },
    { email: 'analyste@julaba.ci', label: 'Analyste', role: 'analyste' },
  ];

  const fillDemoAccount = (email: string) => {
    setEmail(email);
    setPassword('demo1234');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
            style={{ background: `linear-gradient(135deg, ${BO_PRIMARY}, #FFD700)` }}
          >
            <Crown className="w-10 h-10 text-white" />
          </motion.div>
          
          <h1 
            className="text-3xl font-bold mb-2"
            style={{ 
              fontFamily: 'Calisga Bold, system-ui, sans-serif',
              color: BO_PRIMARY 
            }}
          >
            Jùlaba
          </h1>
          <p className="text-gray-400 text-lg">Back-Office Central</p>
        </div>

        {/* Formulaire */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-2xl p-8"
        >
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email professionnel
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nom@julaba.ci"
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-amber-500 focus:ring-0 transition-colors"
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-amber-500 focus:ring-0 transition-colors pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Erreur */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-4 bg-red-50 border-2 border-red-200 rounded-2xl text-red-700"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </motion.div>
            )}

            {/* Bouton */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-2xl text-white font-semibold text-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              style={{ background: `linear-gradient(135deg, ${BO_PRIMARY}, #FFD700)` }}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Connexion...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Se connecter
                </>
              )}
            </button>
          </form>

          {/* Comptes de démonstration */}
          <div className="mt-8 pt-6 border-t-2 border-gray-100">
            <p className="text-sm text-gray-500 mb-3 text-center">
              Comptes de démonstration
            </p>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map((account) => (
                <button
                  key={account.email}
                  onClick={() => fillDemoAccount(account.email)}
                  className="px-3 py-2 text-xs bg-gray-50 hover:bg-gray-100 border-2 border-gray-200 rounded-xl transition-colors"
                >
                  {account.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3 text-center">
              Mot de passe : <code className="bg-gray-100 px-2 py-1 rounded">demo1234</code>
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Plateforme nationale d'inclusion économique
        </p>
      </motion.div>
    </div>
  );
}
