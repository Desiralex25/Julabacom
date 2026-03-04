import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, AlertCircle, Volume2, Zap, Code2, Crown, Globe, MapPin, BarChart3 } from 'lucide-react';
import { useBackOffice, MOCK_BO_USERS, BORoleType } from '../../contexts/BackOfficeContext';

const BO_PRIMARY = '#E6A817';
const BO_DARK = '#3B3C36';

const ROLE_LABELS: Record<BORoleType, string> = {
  super_admin: 'Super Administrateur',
  admin_national: 'Admin National',
  gestionnaire_zone: 'Gestionnaire de Zone',
  analyste: 'Analyste / Observateur',
};

const ROLE_ICONS: Record<BORoleType, any> = {
  super_admin: Crown,
  admin_national: Globe,
  gestionnaire_zone: MapPin,
  analyste: BarChart3,
};

const ROLE_COLORS: Record<BORoleType, string> = {
  super_admin: '#E6A817',
  admin_national: '#3B82F6',
  gestionnaire_zone: '#10B981',
  analyste: '#8B5CF6',
};

const DEMO_ACCOUNTS: { email: string; role: BORoleType; password: string }[] = [
  { email: 'superadmin@julaba.ci', role: 'super_admin', password: 'admin123' },
  { email: 'admin.national@julaba.ci', role: 'admin_national', password: 'admin123' },
  { email: 'gestionnaire.abidjan@julaba.ci', role: 'gestionnaire_zone', password: 'admin123' },
  { email: 'analyste@julaba.ci', role: 'analyste', password: 'admin123' },
];

export function BOLogin() {
  const navigate = useNavigate();
  const { setBOUser } = useBackOffice();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDevMode, setShowDevMode] = useState(false);
  const [devLoading, setDevLoading] = useState<BORoleType | null>(null);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'fr-FR'; u.rate = 0.9;
      window.speechSynthesis.speak(u);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    const user = MOCK_BO_USERS.find(u => u.email === email && u.actif);
    const demoAccount = DEMO_ACCOUNTS.find(d => d.email === email);
    if (user && demoAccount && password === demoAccount.password) {
      setBOUser(user);
      speak(`Bienvenue ${user.prenom}. Vous êtes connecté en tant que ${ROLE_LABELS[user.role]}.`);
      navigate('/backoffice/dashboard');
    } else {
      setError('Email ou mot de passe incorrect.');
      speak('Identifiants incorrects. Veuillez réessayer.');
    }
    setLoading(false);
  };

  // MODE DÉVELOPPEUR — connexion instantanée sans mot de passe
  const handleDevAccess = async (role: BORoleType) => {
    setDevLoading(role);
    await new Promise(r => setTimeout(r, 400));
    const user = MOCK_BO_USERS.find(u => u.role === role);
    if (user) {
      setBOUser(user);
      speak(`Mode développeur. Connecté en tant que ${ROLE_LABELS[role]}.`);
      navigate('/backoffice/dashboard');
    }
    setDevLoading(null);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${BO_DARK} 0%, #2a2b26 50%, #1a1b17 100%)` }}
    >
      {/* Animated BG */}
      {[...Array(6)].map((_, i) => (
        <motion.div key={i} className="absolute rounded-full opacity-10"
          style={{ width: 80 + i * 40, height: 80 + i * 40, backgroundColor: BO_PRIMARY, left: `${10 + i * 15}%`, top: `${10 + i * 12}%` }}
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 8 + i * 2, repeat: Infinity, ease: 'linear' }} />
      ))}

      <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="w-full max-w-md relative z-10">

        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-4 shadow-2xl"
            style={{ backgroundColor: BO_PRIMARY }}
            animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }}>
            <ShieldCheck className="w-10 h-10 text-white" strokeWidth={2.5} />
          </motion.div>
          <h1 className="text-3xl font-black text-white mb-1" style={{ fontFamily: "'Calisga', serif" }}>JÙLABA</h1>
          <p className="text-sm font-semibold" style={{ color: BO_PRIMARY }}>Back-Office Central</p>
          <p className="text-xs text-white/50 mt-1">Accès réservé aux administrateurs</p>
        </div>

        {/* Card principale */}
        <motion.div className="rounded-3xl p-8 shadow-2xl border-2"
          style={{ backgroundColor: 'rgba(255,255,255,0.97)', borderColor: `${BO_PRIMARY}40` }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>

          {/* Tantie Sagesse */}
          <motion.div className="flex items-center gap-3 p-4 rounded-2xl mb-6 border-2"
            style={{ backgroundColor: `${BO_PRIMARY}15`, borderColor: `${BO_PRIMARY}30` }}>
            <motion.div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: BO_PRIMARY }}
              animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
              <ShieldCheck className="w-5 h-5 text-white" />
            </motion.div>
            <div className="flex-1">
              <p className="font-bold text-sm" style={{ color: BO_DARK }}>Tantie Sagesse</p>
              <p className="text-xs text-gray-600">Bienvenue sur le Back-Office Jùlaba. Connectez-vous pour accéder au tableau de bord.</p>
            </div>
            <motion.button onClick={() => speak('Bienvenue sur le Back-Office Julaba. Connectez-vous avec vos identifiants administrateur.')}
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: BO_PRIMARY }} whileTap={{ scale: 0.9 }}>
              <Volume2 className="w-4 h-4 text-white" />
            </motion.button>
          </motion.div>

          {/* Formulaire */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Adresse email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="admin@julaba.ci"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:outline-none transition-colors bg-gray-50 text-base"
                  style={{ borderColor: email ? BO_PRIMARY : undefined }} required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 border-gray-200 focus:outline-none transition-colors bg-gray-50 text-base"
                  style={{ borderColor: password ? BO_PRIMARY : undefined }} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2">
                  {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-2 p-3 rounded-2xl bg-red-50 border-2 border-red-200">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button type="submit" disabled={loading}
              className="w-full py-4 rounded-2xl text-white font-bold text-base shadow-lg flex items-center justify-center gap-2"
              style={{ backgroundColor: loading ? `${BO_PRIMARY}80` : BO_PRIMARY }}
              whileHover={!loading ? { scale: 1.02, y: -2 } : {}} whileTap={!loading ? { scale: 0.98 } : {}}>
              {loading
                ? <motion.div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
                : <><ShieldCheck className="w-5 h-5" /> Se connecter</>
              }
            </motion.button>
          </form>

          {/* Comptes démo */}
          <div className="mt-5 pt-5 border-t-2 border-gray-100">
            <p className="text-xs font-bold text-gray-500 text-center mb-3">COMPTES DÉMO (mot de passe : admin123)</p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map(acc => (
                <motion.button key={acc.email} onClick={() => { setEmail(acc.email); setPassword(acc.password); }}
                  className="p-2 rounded-xl border-2 border-gray-200 text-left hover:border-[#E6A817] transition-colors"
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <p className="text-xs font-bold text-gray-700 truncate">{ROLE_LABELS[acc.role]}</p>
                  <p className="text-[10px] text-gray-500 truncate">{acc.email}</p>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── MODE DÉVELOPPEUR ───────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="mt-4">
          <motion.button onClick={() => setShowDevMode(!showDevMode)}
            className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-2xl border-2 border-dashed font-bold text-sm transition-all"
            style={{
              borderColor: showDevMode ? BO_PRIMARY : 'rgba(255,255,255,0.2)',
              backgroundColor: showDevMode ? `${BO_PRIMARY}15` : 'transparent',
              color: showDevMode ? BO_PRIMARY : 'rgba(255,255,255,0.5)',
            }}
            whileHover={{ borderColor: BO_PRIMARY, color: BO_PRIMARY, backgroundColor: `${BO_PRIMARY}10` }}
            whileTap={{ scale: 0.97 }}>
            <Code2 className="w-4 h-4" />
            Mode Développeur — Accès sans connexion
            <motion.div animate={{ rotate: showDevMode ? 180 : 0 }} transition={{ duration: 0.3 }}>
              <Zap className="w-4 h-4" />
            </motion.div>
          </motion.button>

          <AnimatePresence>
            {showDevMode && (
              <motion.div initial={{ opacity: 0, y: -10, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="mt-3 rounded-3xl p-5 border-2 shadow-2xl"
                style={{ backgroundColor: '#1a1b17', borderColor: `${BO_PRIMARY}50` }}>

                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <p className="text-xs font-bold text-green-400">ENVIRONNEMENT DEV — Connexion instantanée</p>
                </div>
                <p className="text-xs text-white/50 mb-4">Choisissez un rôle pour accéder directement au Back-Office sans authentification.</p>

                <div className="space-y-2">
                  {(Object.keys(ROLE_LABELS) as BORoleType[]).map(role => {
                    const Icon = ROLE_ICONS[role];
                    const color = ROLE_COLORS[role];
                    const isLoading = devLoading === role;
                    return (
                      <motion.button key={role} onClick={() => handleDevAccess(role)} disabled={devLoading !== null}
                        className="w-full flex items-center gap-3 p-3 rounded-2xl border-2 text-left transition-all"
                        style={{ borderColor: `${color}40`, backgroundColor: `${color}10` }}
                        whileHover={{ borderColor: color, scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${color}25` }}>
                          {isLoading
                            ? <motion.div className="w-4 h-4 border-2 border-t-transparent rounded-full"
                                style={{ borderColor: `${color}60`, borderTopColor: color }}
                                animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
                            : <Icon className="w-4 h-4" style={{ color }} />
                          }
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-sm" style={{ color }}>{ROLE_LABELS[role]}</p>
                          <p className="text-[10px] text-white/40">
                            {role === 'super_admin' ? 'Accès total — toutes permissions' :
                              role === 'admin_national' ? 'Gestion nationale complète' :
                              role === 'gestionnaire_zone' ? 'Gestion zone Abidjan' :
                              'Lecture seule — statistiques'}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <Zap className="w-4 h-4" style={{ color: `${color}60` }} />
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                <div className="mt-4 pt-3 border-t border-white/10">
                  <p className="text-[10px] text-white/30 text-center">Ce panneau n'apparaît pas en production</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

      </motion.div>
    </div>
  );
}