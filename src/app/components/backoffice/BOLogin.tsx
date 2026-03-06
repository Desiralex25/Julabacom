import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Eye, EyeOff, Lock, Phone, Shield, AlertCircle,
  ChevronRight, Activity, Users, BarChart3, Settings,
  ArrowRight, CheckCircle2, Loader2
} from 'lucide-react';
import { useBackOffice } from '../../contexts/BackOfficeContext';
import { useApp } from '../../contexts/AppContext';
import { projectId } from '/utils/supabase/info';

import logoJulabaBlanc from '/logo-julaba.svg';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-488793d3`;

const BO_ROLES = [
  { key: 'super_admin',       label: 'Super Admin',         color: '#7C3AED', icon: Shield },
  { key: 'admin_national',    label: 'Admin National',      color: '#0EA5E9', icon: Activity },
  { key: 'gestionnaire_zone', label: 'Gestionnaire Zone',   color: '#10B981', icon: Users },
  { key: 'analyste',          label: 'Analyste',            color: '#F59E0B', icon: BarChart3 },
];

const STATS = [
  { label: 'Acteurs enrôlés',   value: '12 847', icon: Users },
  { label: 'Zones actives',     value: '38',      icon: Activity },
  { label: 'Transactions/jour', value: '4 290',   icon: BarChart3 },
  { label: 'Modules actifs',    value: '14',      icon: Settings },
];

// Rate limiting simple
const loginAttempts: Record<string, { count: number; ts: number }> = {};

export function BOLogin() {
  const navigate = useNavigate();
  const { setBOUser } = useBackOffice();
  const { setUser: setAppUser } = useApp();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [currentStat, setCurrentStat] = useState(0);
  const [time, setTime] = useState(new Date());

  // Rotation des stats
  useEffect(() => {
    const t = setInterval(() => setCurrentStat(s => (s + 1) % STATS.length), 3000);
    return () => clearInterval(t);
  }, []);

  // Horloge temps réel
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const formatTime = (d: Date) =>
    d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formatDate = (d: Date) =>
    d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanPhone = phone.replace(/\s/g, '');
    if (!cleanPhone || !password) {
      setError('Veuillez renseigner votre numero et votre mot de passe.');
      return;
    }

    // Rate limiting
    const now = Date.now();
    const attempts = loginAttempts[cleanPhone];
    if (attempts && attempts.count >= 5 && now - attempts.ts < 15 * 60 * 1000) {
      const remaining = Math.ceil((15 * 60 * 1000 - (now - attempts.ts)) / 60000);
      setError(`Trop de tentatives. Reessayez dans ${remaining} minute(s).`);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        loginAttempts[cleanPhone] = {
          count: (loginAttempts[cleanPhone]?.count || 0) + 1,
          ts: now,
        };
        setError(data.error || 'Identifiants incorrects.');
        return;
      }

      // Verifier que c'est bien un role Back-Office
      const boRoles = ['super_admin', 'admin_national', 'gestionnaire_zone', 'analyste'];
      if (!boRoles.includes(data.user?.role)) {
        setError('Acces refuse. Ce portail est reserve aux administrateurs Back-Office.');
        return;
      }

      // Stocker les tokens
      localStorage.setItem('julaba_access_token', data.accessToken);
      localStorage.setItem('julaba_refresh_token', data.refreshToken);
      localStorage.setItem('julaba_user', JSON.stringify(data.user));

      // Mettre a jour les contextes
      setAppUser(data.user);
      setBOUser(data.user);

      // Reset tentatives
      delete loginAttempts[cleanPhone];

      setSuccess(true);
      setTimeout(() => navigate('/backoffice/dashboard'), 1200);
    } catch (err) {
      console.error('BO Login error:', err);
      setError('Erreur reseau. Verifiez votre connexion et reessayez.');
    } finally {
      setIsLoading(false);
    }
  };

  const roleInfo = BO_ROLES.find(r => r.key === 'super_admin');
  const StatIcon = STATS[currentStat].icon;

  return (
    <div className="min-h-screen flex bg-[#0B1120] overflow-hidden relative">

      {/* Fond avec grille */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(124,58,237,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(124,58,237,0.3) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Orbes lumineux */}
      <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] rounded-full bg-violet-700/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-150px] right-[200px] w-[500px] h-[500px] rounded-full bg-blue-600/15 blur-[100px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-100px] w-[400px] h-[400px] rounded-full bg-emerald-600/10 blur-[80px] pointer-events-none" />

      {/* ═══ PANNEAU GAUCHE ════════════════════════════════════════════════ */}
      <div className="hidden lg:flex flex-col justify-between w-[55%] p-12 relative z-10">

        {/* Header gauche */}
        <div className="flex items-center gap-4">
          <img src={logoJulabaBlanc} alt="Julaba" className="h-10 brightness-0 invert" />
          <div className="h-8 w-px bg-white/20" />
          <div>
            <p className="text-white/50 text-xs uppercase tracking-widest font-medium">Back-Office Central</p>
            <p className="text-white/80 text-sm font-semibold">Administration nationale</p>
          </div>
        </div>

        {/* Contenu central gauche */}
        <div className="space-y-10">

          {/* Titre principal */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              <p className="text-violet-400 text-sm font-medium uppercase tracking-widest mb-2">
                Plateforme nationale
              </p>
              <h1 className="text-5xl font-black text-white leading-tight">
                Inclusion<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
                  economique
                </span><br />
                des vivriers
              </h1>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-white/50 text-lg leading-relaxed max-w-md"
            >
              Pilotez l'ensemble de l'ecosysteme Julaba depuis ce centre de commande national.
            </motion.p>
          </div>

          {/* Stats en rotation */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStat}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-6 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
            >
              <div className="w-14 h-14 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
                <StatIcon className="w-7 h-7 text-violet-400" />
              </div>
              <div>
                <p className="text-4xl font-black text-white">{STATS[currentStat].value}</p>
                <p className="text-white/50 text-sm mt-1">{STATS[currentStat].label}</p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Roles disponibles */}
          <div className="space-y-3">
            <p className="text-white/30 text-xs uppercase tracking-widest font-medium">
              Roles d'administration
            </p>
            <div className="grid grid-cols-2 gap-3">
              {BO_ROLES.map((role, i) => {
                const Icon = role.icon;
                return (
                  <motion.div
                    key={role.key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: role.color + '25', border: `1px solid ${role.color}50` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: role.color }} />
                    </div>
                    <span className="text-white/70 text-sm font-medium">{role.label}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer gauche */}
        <div className="flex items-center justify-between">
          <p className="text-white/20 text-xs">
            Julaba Back-Office v2.0 — Cote d'Ivoire
          </p>
          <div className="text-right">
            <p className="text-white/60 text-sm font-mono font-bold">{formatTime(time)}</p>
            <p className="text-white/20 text-xs capitalize">{formatDate(time)}</p>
          </div>
        </div>
      </div>

      {/* ═══ PANNEAU DROIT (FORMULAIRE) ════════════════════════════════════ */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12 relative z-10">

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          {/* Logo mobile uniquement */}
          <div className="lg:hidden flex justify-center mb-8">
            <img src={logoJulabaBlanc} alt="Julaba" className="h-10 brightness-0 invert" />
          </div>

          {/* Carte principale */}
          <div className="bg-[#111827] border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/40 relative overflow-hidden">

            {/* Accent violet en haut */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 via-violet-400 to-cyan-400 rounded-t-3xl" />

            {/* Icone shield */}
            <div className="flex justify-center mb-6">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="w-16 h-16 rounded-2xl bg-violet-500/15 border-2 border-violet-500/30 flex items-center justify-center"
              >
                <Shield className="w-8 h-8 text-violet-400" />
              </motion.div>
            </div>

            {/* Titre */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-white">Administration</h2>
              <p className="text-white/40 text-sm mt-1">Acces reserve aux agents Back-Office</p>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleLogin} className="space-y-5">

              {/* Champ telephone */}
              <div className="space-y-2">
                <label className="text-white/60 text-xs font-medium uppercase tracking-wider">
                  Numero de telephone
                </label>
                <div className="flex items-center gap-0 bg-white/5 border border-white/10 rounded-2xl overflow-hidden focus-within:border-violet-500/50 focus-within:bg-violet-500/5 transition-all">
                  <div className="flex items-center gap-2 px-4 py-4 border-r border-white/10 bg-white/5">
                    <Phone className="w-4 h-4 text-violet-400" />
                    <span className="text-white/60 text-sm font-mono">+225</span>
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="07 09 22 00 09"
                    className="flex-1 bg-transparent px-4 py-4 text-white placeholder-white/20 text-sm font-mono focus:outline-none"
                    autoComplete="tel"
                    disabled={isLoading || success}
                  />
                  {phone.length >= 8 && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mr-4" />
                  )}
                </div>
              </div>

              {/* Champ mot de passe */}
              <div className="space-y-2">
                <label className="text-white/60 text-xs font-medium uppercase tracking-wider">
                  Mot de passe
                </label>
                <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl overflow-hidden focus-within:border-violet-500/50 focus-within:bg-violet-500/5 transition-all">
                  <div className="flex items-center px-4 py-4 border-r border-white/10 bg-white/5">
                    <Lock className="w-4 h-4 text-violet-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Mot de passe administrateur"
                    className="flex-1 bg-transparent px-4 py-4 text-white placeholder-white/20 text-sm focus:outline-none"
                    autoComplete="current-password"
                    disabled={isLoading || success}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="px-4 py-4 text-white/30 hover:text-white/70 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Message d'erreur */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-2xl p-4"
                  >
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-red-300 text-sm">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bouton connexion */}
              <motion.button
                type="submit"
                disabled={isLoading || success}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 rounded-2xl font-bold text-white text-base relative overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                style={{
                  background: success
                    ? 'linear-gradient(135deg, #10B981, #059669)'
                    : 'linear-gradient(135deg, #7C3AED, #6D28D9)',
                  boxShadow: success
                    ? '0 0 30px rgba(16,185,129,0.4)'
                    : '0 0 30px rgba(124,58,237,0.4)',
                }}
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {success ? (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Connexion reussie
                    </>
                  ) : isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Authentification...
                    </>
                  ) : (
                    <>
                      Acceder au Back-Office
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </span>
                {/* Shimmer */}
                {!isLoading && !success && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  />
                )}
              </motion.button>

              {/* Lien probleme */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/admin-recovery')}
                  className="text-white/30 hover:text-violet-400 text-xs flex items-center gap-1 transition-colors"
                >
                  <Shield className="w-3 h-3" />
                  Probleme de connexion admin
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="text-white/30 hover:text-white/60 text-xs flex items-center gap-1 transition-colors"
                >
                  Portail terrain
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </form>
          </div>

          {/* Badge securite */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-white/25 text-xs">
              Connexion chiffree HTTPS — Julaba Back-Office Central
            </p>
          </div>

          {/* Stats mobile */}
          <div className="lg:hidden mt-6 grid grid-cols-2 gap-3">
            {STATS.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                  <p className="text-2xl font-black text-white">{stat.value}</p>
                  <p className="text-white/40 text-xs mt-1">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
