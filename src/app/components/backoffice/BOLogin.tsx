import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Eye, EyeOff, Lock, Phone, Shield, AlertCircle,
  ChevronRight, Activity, Users, BarChart3, Settings,
  ArrowRight, CheckCircle2, Loader2, Search, RefreshCw,
  XCircle, Wrench, KeyRound, UserPlus, CheckCheck, User
} from 'lucide-react';
import { useBackOffice } from '../../contexts/BackOfficeContext';
import { useApp } from '../../contexts/AppContext';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { supabase } from '../../services/supabaseClient';

import logoJulabaBlanc from '/logo-julaba.svg';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-488793d3`;

const baseHeaders = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${publicAnonKey}`,
};

// ── Normalise n'importe quelle réponse serveur en BOUser valide ───────────────
function normalizeToBoUser(raw: any) {
  return {
    id:        raw.id        || 'sa-' + Date.now(),
    // Compatibilité camelCase (backend /auth/profile) et snake_case (ancienne API)
    nom:       raw.nom       || raw.lastName   || raw.last_name   || 'Admin',
    prenom:    raw.prenom    || raw.firstName  || raw.first_name  || 'Super',
    email:     raw.email     || `${raw.phone || 'admin'}@julaba.local`,
    role:      raw.role      || 'super_admin',
    region:    raw.region    || 'National',
    lastLogin: new Date().toISOString(),
    actif:     true,
  };
}


const BO_ROLES = [
  { key: 'super_admin',       label: 'Super Admin',       color: '#7C3AED', icon: Shield    },
  { key: 'admin_national',    label: 'Admin National',    color: '#0EA5E9', icon: Activity  },
  { key: 'gestionnaire_zone', label: 'Gestionnaire Zone', color: '#10B981', icon: Users     },
  { key: 'analyste',          label: 'Analyste',          color: '#F59E0B', icon: BarChart3 },
];

const STATS = [
  { label: 'Acteurs enrolles',  value: '12 847', icon: Users     },
  { label: 'Zones actives',     value: '38',     icon: Activity  },
  { label: 'Transactions/jour', value: '4 290',  icon: BarChart3 },
  { label: 'Modules actifs',    value: '14',     icon: Settings  },
];

const loginAttempts: Record<string, { count: number; ts: number }> = {};

type ToolStep = 'idle' | 'diag' | 'reset' | 'recreate';
type View = 'login' | 'create-admin';

export function BOLogin() {
  const navigate  = useNavigate();
  const { setBOUser }     = useBackOffice();
  const { setUser: setAppUser } = useApp();

  // ── Horloge + stats rotatives
  const [currentStat, setCurrentStat] = useState(0);
  const [time, setTime]               = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setCurrentStat(s => (s + 1) % STATS.length), 3000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const formatTime = (d: Date) =>
    d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formatDate = (d: Date) =>
    d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  // ── Vue active : connexion ou création premier admin
  const [view, setView] = useState<View>('login');

  // ── Champs connexion
  const [phone,        setPhone]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error,        setError]        = useState('');
  const [isLoading,    setIsLoading]    = useState(false);
  const [success,      setSuccess]      = useState(false);

  // ── Champs création Super Admin
  const [caPhone,       setCaPhone]       = useState('');
  const [caPrenom,      setCaPrenom]      = useState('');
  const [caNom,         setCaNom]         = useState('');
  const [caPassword,    setCaPassword]    = useState('');
  const [caShowPwd,     setCaShowPwd]     = useState(false);
  const [caLoading,     setCaLoading]     = useState(false);
  const [caError,       setCaError]       = useState('');
  const [caSuccess,     setCaSuccess]     = useState(false);

  // ── Panneau outils de secours
  const [showPanel, setShowPanel] = useState(false);
  const [toolStep,  setToolStep]  = useState<ToolStep>('idle');

  // Diagnostic
  const [diagLoading, setDiagLoading] = useState(false);
  const [diagResult,  setDiagResult]  = useState<any>(null);
  const [diagError,   setDiagError]   = useState('');

  // Reset mot de passe
  const [resetPhone,      setResetPhone]      = useState('');
  const [resetNewPwd,     setResetNewPwd]     = useState('');
  const [resetShowPwd,    setResetShowPwd]    = useState(false);
  const [resetKey,        setResetKey]        = useState('');
  const [resetLoading,    setResetLoading]    = useState(false);
  const [resetResult,     setResetResult]     = useState<any>(null);

  // Recreation complète
  const [recPhone,    setRecPhone]    = useState('');
  const [recPassword, setRecPassword] = useState('');
  const [recPrenom,   setRecPrenom]   = useState('');
  const [recNom,      setRecNom]      = useState('');
  const [recKey,      setRecKey]      = useState('');
  const [recLoading,  setRecLoading]  = useState(false);
  const [recResult,   setRecResult]   = useState<any>(null);

  // ── CONNEXION — SDK Supabase direct (session native, jamais de token invalide) ─
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const cleanPhone = phone.replace(/\s/g, '');
    if (!cleanPhone || !password) {
      setError('Veuillez renseigner votre numero et votre mot de passe.');
      return;
    }
    const now = Date.now();
    const att = loginAttempts[cleanPhone];
    if (att && att.count >= 5 && now - att.ts < 15 * 60 * 1000) {
      const rem = Math.ceil((15 * 60 * 1000 - (now - att.ts)) / 60000);
      setError(`Trop de tentatives. Reessayez dans ${rem} minute(s).`);
      return;
    }
    setIsLoading(true);
    try {
      // ── Étape 1 : Login via backend ────────────────────────────────────────
      // Le SDK navigateur retourne 400 (bloqué par Supabase selon le contexte).
      // Le backend contourne : signInWithPassword avec supabaseAnon côté serveur
      // + lecture profil via service role (bypass RLS complet, évite 406).
      const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: baseHeaders,
        body: JSON.stringify({ phone: cleanPhone, password }),
      });
      const loginData = await loginRes.json();

      if (!loginRes.ok || !loginData.accessToken) {
        loginAttempts[cleanPhone] = { count: (loginAttempts[cleanPhone]?.count || 0) + 1, ts: now };
        const msg = loginData.error || loginData.details || 'Identifiants incorrects.';
        setError(
          msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('incorrect')
            ? 'Identifiants incorrects. Verifiez votre numero et mot de passe.'
            : msg
        );
        return;
      }

      // ── Étape 2 : Vérifier le rôle BO ─────────────────────────────────────
      const boRoles = ['super_admin', 'admin_national', 'gestionnaire_zone', 'analyste'];
      if (!boRoles.includes(loginData.user?.role)) {
        setError('Acces refuse. Ce portail est reserve aux administrateurs Back-Office.');
        return;
      }

      // ── Étape 3 : Persister en localStorage AVANT setSession ──────────────
      // CRITIQUE : stocker d'abord les tokens bruts du backend — c'est la source
      // de vérité pour backoffice-api.ts/getValidToken(), indépendamment du SDK.
      const boUser = normalizeToBoUser(loginData.user);
      localStorage.setItem('julaba_access_token', loginData.accessToken);
      localStorage.setItem('julaba_refresh_token', loginData.refreshToken || '');
      localStorage.setItem('julaba_user', JSON.stringify(boUser));
      localStorage.setItem('julaba_bo_user', JSON.stringify(boUser));

      // ── Étape 4 : Injecter dans le SDK (best effort, non-bloquant) ─────────
      supabase.auth.setSession({
        access_token: loginData.accessToken,
        refresh_token: loginData.refreshToken || '',
      }).catch(e => console.warn('[BOLogin] setSession warning (non-bloquant):', e?.message));
      setAppUser(boUser);
      setBOUser(boUser);
      delete loginAttempts[cleanPhone];
      setSuccess(true);
      setTimeout(() => navigate('/backoffice/dashboard'), 1200);
    } catch (err) {
      console.error('[BOLogin] Erreur reseau:', err);
      setError('Erreur reseau. Verifiez votre connexion.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── CREATION PREMIER SUPER ADMIN ─────────────────────────────────────────────
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCaError('');
    const cleanPhone = caPhone.replace(/\s/g, '');
    if (!cleanPhone || !caPrenom || !caNom || !caPassword) {
      setCaError('Tous les champs sont obligatoires.');
      return;
    }
    if (caPassword.length < 8) {
      setCaError('Le mot de passe doit contenir au moins 8 caracteres.');
      return;
    }
    setCaLoading(true);
    try {
      const res  = await fetch(`${API_URL}/auth/create-super-admin`, {
        method: 'POST',
        headers: baseHeaders,
        body: JSON.stringify({
          phone:     cleanPhone,
          password:  caPassword,
          firstName: caPrenom,
          lastName:  caNom,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCaError(data.error || 'Erreur lors de la creation du compte.');
        return;
      }
      setCaSuccess(true);
      // Connexion automatique apres creation — via SDK (session native)
      setTimeout(async () => {
        try {
          const authEmail = `${cleanPhone}@julaba.local`;
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: authEmail,
            password: caPassword,
          });
          if (authError || !authData.session) throw authError;

          // Récupérer le profil via backend (bypass RLS)
          const profileRes = await fetch(`${API_URL}/auth/profile`, {
            headers: { 'Authorization': `Bearer ${authData.session.access_token}` },
          });
          const profileData = await profileRes.json();
          if (!profileRes.ok || !profileData.user) throw new Error(profileData.error);

          const boUser = normalizeToBoUser(profileData.user);
          localStorage.setItem('julaba_access_token', authData.session.access_token);
          localStorage.setItem('julaba_refresh_token', authData.session.refresh_token);
          localStorage.setItem('julaba_user', JSON.stringify(boUser));
          localStorage.setItem('julaba_bo_user', JSON.stringify(boUser));
          setAppUser(boUser);
          setBOUser(boUser);
          navigate('/backoffice/dashboard');
        } catch {
          // Connexion manuelle si auto-login echoue
          setPhone(cleanPhone);
          setPassword(caPassword);
          setView('login');
          setCaSuccess(false);
        }
      }, 1500);
    } catch {
      setCaError('Erreur reseau. Verifiez votre connexion.');
    } finally {
      setCaLoading(false);
    }
  };

  // ── DIAGNOSTIC ───────────────────────────────────────────────────────────────
  const runDiag = async () => {
    setDiagLoading(true);
    setDiagResult(null);
    setDiagError('');
    try {
      const [statusRes, testRes] = await Promise.all([
        fetch(`${API_URL}/auth/super-admin-status`, { headers: baseHeaders }),
        fetch(`${API_URL}/auth/test-login`, {
          method: 'POST',
          headers: baseHeaders,
          body: JSON.stringify({ phone: phone.replace(/\s/g, '') || '0000000000', password: password || '___' }),
        }),
      ]);
      const [statusData, testData] = await Promise.all([statusRes.json(), testRes.json()]);
      setDiagResult({ status: statusData, test: testData });
    } catch {
      setDiagError('Erreur reseau lors du diagnostic.');
    } finally {
      setDiagLoading(false);
    }
  };

  // ── RESET MOT DE PASSE ───────────────────────────────────────────────────────
  const runReset = async () => {
    if (!resetPhone || !resetNewPwd || !resetKey) {
      setResetResult({ error: 'Tous les champs sont obligatoires.' });
      return;
    }
    if (resetNewPwd.length < 6) {
      setResetResult({ error: 'Le mot de passe doit avoir au moins 6 caracteres.' });
      return;
    }
    setResetLoading(true);
    setResetResult(null);
    try {
      const res  = await fetch(`${API_URL}/auth/emergency-reset`, {
        method: 'POST',
        headers: baseHeaders,
        body: JSON.stringify({
          phone:       resetPhone.replace(/\s/g, ''),
          newPassword: resetNewPwd,
          secretKey:   resetKey,
        }),
      });
      const data = await res.json();
      setResetResult(data);
      // Après reset réussi → rediriger vers la page login pour une connexion propre
      if (data.success) {
        setPhone(resetPhone.replace(/\s/g, ''));
        setPassword(resetNewPwd);
        setShowPanel(false);
        setToolStep('idle');
      }
    } catch {
      setResetResult({ error: 'Erreur reseau. Verifiez votre connexion.' });
    } finally {
      setResetLoading(false);
    }
  };

  // ── RECREATION COMPLETE ──────────────────────────────────────────────────────
  const runRecreate = async () => {
    if (!recPhone || !recPassword || !recPrenom || !recNom || !recKey) {
      setRecResult({ error: 'Tous les champs sont requis.' });
      return;
    }
    setRecLoading(true);
    setRecResult(null);
    try {
      const res  = await fetch(`${API_URL}/auth/recover-super-admin`, {
        method: 'POST',
        headers: baseHeaders,
        body: JSON.stringify({
          phone:     recPhone.replace(/\s/g, ''),
          password:  recPassword,
          firstName: recPrenom,
          lastName:  recNom,
          secretKey: recKey,
        }),
      });
      const data = await res.json();
      setRecResult(data);
      // Après récréation réussie → rediriger vers login pour une connexion propre via SDK
      if (data.success) {
        setPhone(recPhone.replace(/\s/g, ''));
        setPassword(recPassword);
        setShowPanel(false);
        setToolStep('idle');
      }
    } catch {
      setRecResult({ error: 'Erreur reseau.' });
    } finally {
      setRecLoading(false);
    }
  };

  const StatIcon = STATS[currentStat].icon;

  return (
    <div className="min-h-screen flex bg-[#0B1120] overflow-hidden relative">
      {/* Grille de fond */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(rgba(124,58,237,0.3) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(124,58,237,0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
      <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] rounded-full bg-violet-700/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-150px] right-[100px] w-[500px] h-[500px] rounded-full bg-blue-600/15 blur-[100px] pointer-events-none" />

      {/* ══ PANNEAU GAUCHE ════════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex flex-col justify-between w-[55%] p-12 relative z-10">
        <div className="flex items-center gap-4">
          <img src={logoJulabaBlanc} alt="Julaba" className="h-10 brightness-0 invert" />
          <div className="h-8 w-px bg-white/20" />
          <div>
            <p className="text-white/50 text-xs uppercase tracking-widest font-medium">Back-Office Central</p>
            <p className="text-white/80 text-sm font-semibold">Administration nationale</p>
          </div>
        </div>

        <div className="space-y-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-violet-400 text-sm font-medium uppercase tracking-widest mb-3">
              Plateforme nationale
            </p>
            <h1 className="text-5xl font-black text-white leading-tight">
              Inclusion<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
                economique
              </span><br />
              des vivriers
            </h1>
            <p className="text-white/50 text-lg leading-relaxed max-w-md mt-4">
              Pilotez l'ensemble de l'ecosysteme Julaba depuis ce centre de commande national.
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStat}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-center gap-6 bg-white/5 border border-white/10 rounded-2xl p-6"
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

          <div className="grid grid-cols-2 gap-3">
            {BO_ROLES.map((role, i) => {
              const Icon = role.icon;
              return (
                <motion.div
                  key={role.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
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

        <div className="flex items-center justify-between">
          <p className="text-white/20 text-xs">Julaba Back-Office v2.0 — Cote d'Ivoire</p>
          <div className="text-right">
            <p className="text-white/60 text-sm font-mono font-bold">{formatTime(time)}</p>
            <p className="text-white/20 text-xs capitalize">{formatDate(time)}</p>
          </div>
        </div>
      </div>

      {/* ══ PANNEAU DROIT ═════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12 relative z-10 overflow-y-auto py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-4"
        >
          {/* Logo mobile */}
          <div className="lg:hidden flex justify-center mb-6">
            <img src={logoJulabaBlanc} alt="Julaba" className="h-10 brightness-0 invert" />
          </div>

          {/* ── Onglets Login / Creer Admin ────────────────────────────── */}
          <div className="flex rounded-2xl overflow-hidden border border-white/10 bg-white/5">
            {[
              { key: 'login',        label: 'Se connecter',         icon: Shield   },
              { key: 'create-admin', label: 'Creer Super Admin',    icon: UserPlus },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = view === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => { setView(tab.key as View); setError(''); setCaError(''); }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-all"
                  style={{
                    backgroundColor: isActive ? 'rgba(124,58,237,0.3)' : 'transparent',
                    color:           isActive ? '#A78BFA' : 'rgba(255,255,255,0.35)',
                    borderBottom:    isActive ? '2px solid #7C3AED' : '2px solid transparent',
                  }}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {/* ══ VUE : CONNEXION ══════════════════════════════════════════ */}
            {view === 'login' && (
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-[#111827] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 via-violet-400 to-cyan-400 rounded-t-3xl" />

                <div className="flex justify-center mb-6">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    className="w-16 h-16 rounded-2xl bg-violet-500/15 border-2 border-violet-500/30 flex items-center justify-center"
                  >
                    <Shield className="w-8 h-8 text-violet-400" />
                  </motion.div>
                </div>

                <div className="text-center mb-7">
                  <h2 className="text-2xl font-black text-white">Administration</h2>
                  <p className="text-white/40 text-sm mt-1">Acces reserve aux agents Back-Office</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  {/* Telephone */}
                  <div className="space-y-2">
                    <label className="text-white/50 text-xs font-semibold uppercase tracking-wider">
                      Numero de telephone
                    </label>
                    <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl overflow-hidden focus-within:border-violet-500/60 transition-all">
                      <div className="flex items-center gap-2 px-4 py-4 border-r border-white/10 bg-white/5 flex-shrink-0">
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
                      {phone.replace(/\s/g, '').length >= 8 && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mr-4 flex-shrink-0" />
                      )}
                    </div>
                  </div>

                  {/* Mot de passe */}
                  <div className="space-y-2">
                    <label className="text-white/50 text-xs font-semibold uppercase tracking-wider">
                      Mot de passe
                    </label>
                    <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl overflow-hidden focus-within:border-violet-500/60 transition-all">
                      <div className="flex items-center px-4 py-4 border-r border-white/10 bg-white/5 flex-shrink-0">
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
                        className="px-4 py-4 text-white/30 hover:text-white/70 transition-colors flex-shrink-0"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Erreur */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-2xl p-4"
                      >
                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-red-300 text-sm">{error}</p>
                          <button
                            type="button"
                            onClick={() => {
                              setShowPanel(true);
                              setToolStep('reset');
                              setResetPhone(phone.replace(/\s/g, ''));
                              setError('');
                            }}
                            className="text-violet-400 hover:text-violet-300 text-xs mt-1.5 flex items-center gap-1 transition-colors"
                          >
                            <KeyRound className="w-3 h-3" />
                            Reinitialiser mon mot de passe
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Bouton connexion */}
                  <motion.button
                    type="submit"
                    disabled={isLoading || success}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 rounded-2xl font-bold text-white text-base relative overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      background:  success
                        ? 'linear-gradient(135deg,#10B981,#059669)'
                        : 'linear-gradient(135deg,#7C3AED,#6D28D9)',
                      boxShadow: success
                        ? '0 0 30px rgba(16,185,129,0.4)'
                        : '0 0 30px rgba(124,58,237,0.4)',
                    }}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      {success ? (
                        <><CheckCheck className="w-5 h-5" />Connexion reussie</>
                      ) : isLoading ? (
                        <><Loader2 className="w-5 h-5 animate-spin" />Authentification...</>
                      ) : (
                        <>Acceder au Back-Office<ArrowRight className="w-5 h-5" /></>
                      )}
                    </span>
                    {!isLoading && !success && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5 }}
                      />
                    )}
                  </motion.button>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => { setShowPanel(v => !v); setToolStep('idle'); }}
                      className="text-white/30 hover:text-violet-400 text-xs flex items-center gap-1 transition-colors"
                    >
                      <Wrench className="w-3 h-3" />
                      Outils de secours
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/')}
                      className="text-white/30 hover:text-white/60 text-xs flex items-center gap-1 transition-colors"
                    >
                      Portail terrain<ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* ══ VUE : CREER PREMIER SUPER ADMIN ═══════════════════════════ */}
            {view === 'create-admin' && (
              <motion.div
                key="create-admin"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-[#111827] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-t-3xl" />

                <div className="flex justify-center mb-5">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    className="w-16 h-16 rounded-2xl bg-emerald-500/15 border-2 border-emerald-500/30 flex items-center justify-center"
                  >
                    <UserPlus className="w-8 h-8 text-emerald-400" />
                  </motion.div>
                </div>

                <div className="text-center mb-2">
                  <h2 className="text-2xl font-black text-white">Premier Super Admin</h2>
                  <p className="text-white/40 text-sm mt-1">
                    A utiliser une seule fois pour initialiser la plateforme
                  </p>
                </div>

                {/* Avertissement securite */}
                <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-4 mb-6">
                  <p className="text-amber-300 text-xs leading-relaxed">
                    Cette action cree le compte Super Admin initial. Si un compte existe deja,
                    la creation sera refusee et vous devez utiliser l'onglet "Se connecter".
                  </p>
                </div>

                <form onSubmit={handleCreateAdmin} className="space-y-4">
                  {/* Telephone */}
                  <div className="space-y-1.5">
                    <label className="text-white/50 text-xs font-semibold uppercase tracking-wider">
                      Numero de telephone
                    </label>
                    <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl overflow-hidden focus-within:border-emerald-500/60 transition-all">
                      <div className="flex items-center gap-2 px-4 py-3.5 border-r border-white/10 bg-white/5 flex-shrink-0">
                        <Phone className="w-4 h-4 text-emerald-400" />
                        <span className="text-white/60 text-sm font-mono">+225</span>
                      </div>
                      <input
                        type="tel"
                        value={caPhone}
                        onChange={e => setCaPhone(e.target.value)}
                        placeholder="07 09 22 00 09"
                        className="flex-1 bg-transparent px-4 py-3.5 text-white placeholder-white/20 text-sm font-mono focus:outline-none"
                        disabled={caLoading || caSuccess}
                      />
                    </div>
                  </div>

                  {/* Prenom + Nom */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-white/50 text-xs font-semibold uppercase tracking-wider">Prenom</label>
                      <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl overflow-hidden focus-within:border-emerald-500/60 transition-all">
                        <User className="w-4 h-4 text-emerald-400 ml-3 flex-shrink-0" />
                        <input
                          type="text"
                          value={caPrenom}
                          onChange={e => setCaPrenom(e.target.value)}
                          placeholder="Prenom"
                          className="flex-1 bg-transparent px-3 py-3.5 text-white placeholder-white/20 text-sm focus:outline-none"
                          disabled={caLoading || caSuccess}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-white/50 text-xs font-semibold uppercase tracking-wider">Nom</label>
                      <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl overflow-hidden focus-within:border-emerald-500/60 transition-all">
                        <User className="w-4 h-4 text-emerald-400 ml-3 flex-shrink-0" />
                        <input
                          type="text"
                          value={caNom}
                          onChange={e => setCaNom(e.target.value)}
                          placeholder="Nom"
                          className="flex-1 bg-transparent px-3 py-3.5 text-white placeholder-white/20 text-sm focus:outline-none"
                          disabled={caLoading || caSuccess}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Mot de passe */}
                  <div className="space-y-1.5">
                    <label className="text-white/50 text-xs font-semibold uppercase tracking-wider">
                      Mot de passe (min. 8 caracteres)
                    </label>
                    <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl overflow-hidden focus-within:border-emerald-500/60 transition-all">
                      <div className="flex items-center px-4 py-3.5 border-r border-white/10 bg-white/5 flex-shrink-0">
                        <Lock className="w-4 h-4 text-emerald-400" />
                      </div>
                      <input
                        type={caShowPwd ? 'text' : 'password'}
                        value={caPassword}
                        onChange={e => setCaPassword(e.target.value)}
                        placeholder="Mot de passe securise"
                        className="flex-1 bg-transparent px-4 py-3.5 text-white placeholder-white/20 text-sm focus:outline-none"
                        disabled={caLoading || caSuccess}
                      />
                      <button
                        type="button"
                        onClick={() => setCaShowPwd(v => !v)}
                        className="px-4 py-3.5 text-white/30 hover:text-white/70 transition-colors flex-shrink-0"
                        tabIndex={-1}
                      >
                        {caShowPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {/* Indicateur force mot de passe */}
                    {caPassword.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {[1,2,3,4].map(i => (
                          <div
                            key={i}
                            className="h-1 flex-1 rounded-full transition-all duration-300"
                            style={{
                              backgroundColor: caPassword.length >= i * 3
                                ? (caPassword.length >= 12 ? '#10B981' : caPassword.length >= 8 ? '#F59E0B' : '#EF4444')
                                : 'rgba(255,255,255,0.1)',
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Erreur */}
                  <AnimatePresence>
                    {caError && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-2xl p-4"
                      >
                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-red-300 text-sm">{caError}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Bouton */}
                  <motion.button
                    type="submit"
                    disabled={caLoading || caSuccess}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 rounded-2xl font-bold text-white text-base relative overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      background: caSuccess
                        ? 'linear-gradient(135deg,#10B981,#059669)'
                        : 'linear-gradient(135deg,#059669,#047857)',
                      boxShadow: caSuccess
                        ? '0 0 30px rgba(16,185,129,0.5)'
                        : '0 0 30px rgba(5,150,105,0.3)',
                    }}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      {caSuccess ? (
                        <><CheckCheck className="w-5 h-5" />Compte cree — Connexion...</>
                      ) : caLoading ? (
                        <><Loader2 className="w-5 h-5 animate-spin" />Creation en cours...</>
                      ) : (
                        <>Creer le compte Super Admin<ArrowRight className="w-5 h-5" /></>
                      )}
                    </span>
                    {!caLoading && !caSuccess && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5 }}
                      />
                    )}
                  </motion.button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Panneau outils de secours ─────────────────────────────────── */}
          <AnimatePresence>
            {showPanel && (
              <motion.div
                initial={{ opacity: 0, y: 10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: 10, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-[#111827] border border-violet-500/30 rounded-3xl p-6 space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-violet-400" />
                      <h3 className="text-white font-bold text-sm">Outils de secours Admin</h3>
                    </div>
                    <button
                      onClick={() => { setShowPanel(false); setToolStep('idle'); }}
                      className="text-white/30 hover:text-white/70"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>

                  {/* ── Choix outil ───────────────────────────────────────── */}
                  {toolStep === 'idle' && (
                    <div className="space-y-3">
                      {[
                        {
                          step: 'reset' as ToolStep,
                          icon: KeyRound,
                          color: 'violet',
                          title: 'Reinitialiser le mot de passe',
                          desc: 'Le compte existe mais le mot de passe ne fonctionne pas',
                          onClick: () => { setToolStep('reset'); setResetPhone(phone.replace(/\s/g,'')); },
                        },
                        {
                          step: 'diag' as ToolStep,
                          icon: Search,
                          color: 'white',
                          title: 'Diagnostic complet',
                          desc: 'Analyser l\'etat du compte dans la base de donnees',
                          onClick: () => { setToolStep('diag'); runDiag(); },
                        },
                        {
                          step: 'recreate' as ToolStep,
                          icon: RefreshCw,
                          color: 'amber',
                          title: 'Recreer le compte complet',
                          desc: 'Supprime et recrée entièrement le Super Admin',
                          onClick: () => setToolStep('recreate'),
                        },
                      ].map(item => {
                        const Icon = item.icon;
                        const cls = {
                          violet: 'bg-violet-500/10 border-violet-500/30 hover:bg-violet-500/20',
                          white:  'bg-white/5 border-white/10 hover:bg-white/10',
                          amber:  'bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20',
                        }[item.color];
                        const iconCls = {
                          violet: 'bg-violet-500/20 text-violet-400',
                          white:  'bg-white/10 text-white/60',
                          amber:  'bg-amber-500/20 text-amber-400',
                        }[item.color];
                        return (
                          <button
                            key={item.step}
                            onClick={item.onClick}
                            className={`w-full flex items-center gap-4 border rounded-2xl p-4 text-left transition-all group ${cls}`}
                          >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconCls}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-white text-sm font-bold">{item.title}</p>
                              <p className="text-white/40 text-xs mt-0.5">{item.desc}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-white/30 ml-auto flex-shrink-0" />
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* ── RESET MOT DE PASSE ─────────────────────────────────── */}
                  {toolStep === 'reset' && (
                    <div className="space-y-4">
                      <button
                        onClick={() => setToolStep('idle')}
                        className="text-white/40 hover:text-white/70 text-xs flex items-center gap-1"
                      >
                        <ChevronRight className="w-3 h-3 rotate-180" /> Retour
                      </button>
                      <div className="bg-violet-500/10 border border-violet-500/30 rounded-2xl p-4">
                        <p className="text-white font-bold text-sm mb-1">Reinitialisation du mot de passe</p>
                        <p className="text-white/40 text-xs">
                          Cette action change uniquement le mot de passe. Le compte et toutes les donnees sont preserves.
                        </p>
                      </div>
                      <div className="space-y-3">
                        {[
                          { label: 'Telephone', val: resetPhone, set: setResetPhone, type: 'tel',      placeholder: '0709220009' },
                          { label: 'Nouveau mot de passe', val: resetNewPwd, set: setResetNewPwd, type: resetShowPwd ? 'text' : 'password', placeholder: 'Min. 6 caracteres' },
                          { label: 'Cle de securite', val: resetKey, set: setResetKey, type: 'text', placeholder: 'JULABA_RECOVERY_2026' },
                        ].map((f, i) => (
                          <div key={i}>
                            <label className="text-white/40 text-xs mb-1.5 block font-medium">{f.label}</label>
                            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl overflow-hidden focus-within:border-violet-500/50">
                              <input
                                type={f.type}
                                value={f.val}
                                onChange={e => f.set(e.target.value)}
                                placeholder={f.placeholder}
                                className="flex-1 bg-transparent px-3 py-3 text-white text-sm font-mono placeholder-white/20 focus:outline-none"
                              />
                              {i === 1 && (
                                <button type="button" onClick={() => setResetShowPwd(v => !v)} className="px-3 text-white/30">
                                  {resetShowPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                        {resetResult && (
                          <div className={`rounded-xl p-3 text-xs font-medium ${resetResult.success ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300' : 'bg-red-500/15 border border-red-500/30 text-red-300'}`}>
                            {resetResult.success
                              ? `Mot de passe reinitialise. Vous pouvez maintenant vous connecter.`
                              : resetResult.error || 'Erreur inconnue.'}
                          </div>
                        )}
                        <motion.button
                          onClick={runReset}
                          disabled={resetLoading}
                          whileTap={{ scale: 0.97 }}
                          className="w-full py-3.5 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                          style={{ background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', boxShadow: '0 0 20px rgba(124,58,237,0.3)' }}
                        >
                          {resetLoading
                            ? <><Loader2 className="w-4 h-4 animate-spin" />Reinitialisation...</>
                            : <><KeyRound className="w-4 h-4" />Reinitialiser le mot de passe</>}
                        </motion.button>
                      </div>
                    </div>
                  )}

                  {/* ── DIAGNOSTIC ─────────────────────────────────────────── */}
                  {toolStep === 'diag' && (
                    <div className="space-y-4">
                      <button
                        onClick={() => setToolStep('idle')}
                        className="text-white/40 hover:text-white/70 text-xs flex items-center gap-1"
                      >
                        <ChevronRight className="w-3 h-3 rotate-180" /> Retour
                      </button>
                      {diagLoading && (
                        <div className="flex items-center justify-center gap-2 py-8">
                          <Loader2 className="w-5 h-5 animate-spin text-violet-400" />
                          <p className="text-white/40 text-sm">Analyse en cours...</p>
                        </div>
                      )}
                      {diagError && <p className="text-red-400 text-sm">{diagError}</p>}
                      {diagResult && (
                        <div className="space-y-3">
                          <div className="bg-white/5 rounded-2xl p-4 space-y-2">
                            <p className="text-white/50 text-xs font-bold uppercase tracking-wider">Super Admin</p>
                            <div className="flex items-center gap-2">
                              {diagResult.status?.count > 0
                                ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                : <XCircle className="w-4 h-4 text-red-400" />}
                              <span className="text-white text-sm">{diagResult.status?.diagnosis || '?'}</span>
                            </div>
                            {(diagResult.status?.profiles || []).map((p: any, i: number) => (
                              <div key={i} className="bg-white/5 rounded-xl p-3 text-xs space-y-1 mt-2">
                                <p className="text-white font-mono">{p.phone}</p>
                                <div className="flex gap-2 flex-wrap">
                                  <span className={`px-2 py-0.5 rounded-full ${p.authExists ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                                    Auth {p.authExists ? 'existe' : 'absent'}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded-full ${p.validated ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                                    {p.validated ? 'valide' : 'non valide'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                          {diagResult.test?.diagnosis && (
                            <div className={`flex items-center gap-2 rounded-xl p-3 ${diagResult.test.diagnosis.loginSuccess ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                              {diagResult.test.diagnosis.loginSuccess
                                ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                : <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
                              <p className="text-white/80 text-xs">{diagResult.test.diagnosis.explanation}</p>
                            </div>
                          )}
                          <button
                            onClick={() => setToolStep('reset')}
                            className="w-full py-3 rounded-2xl bg-violet-600/20 border border-violet-500/40 text-violet-300 text-sm font-medium flex items-center justify-center gap-2 hover:bg-violet-600/30 transition-all"
                          >
                            <KeyRound className="w-4 h-4" />
                            Reinitialiser le mot de passe
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── RECREATION COMPLETE ─────────────────────────────────── */}
                  {toolStep === 'recreate' && (
                    <div className="space-y-4">
                      <button
                        onClick={() => setToolStep('idle')}
                        className="text-white/40 hover:text-white/70 text-xs flex items-center gap-1"
                      >
                        <ChevronRight className="w-3 h-3 rotate-180" /> Retour
                      </button>
                      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4">
                        <p className="text-white font-bold text-sm mb-1">Recreation complete</p>
                        <p className="text-amber-300/70 text-xs">
                          Supprime l'ancien compte et en cree un nouveau. Utiliser seulement si le compte est totalement inaccessible.
                        </p>
                      </div>
                      <div className="space-y-3">
                        {[
                          { label: 'Telephone', val: recPhone, set: setRecPhone, type: 'tel', placeholder: '0709220009' },
                          { label: 'Nouveau mot de passe', val: recPassword, set: setRecPassword, type: 'password', placeholder: 'Min. 6 caracteres' },
                          { label: 'Prenom', val: recPrenom, set: setRecPrenom, type: 'text', placeholder: 'Prenom' },
                          { label: 'Nom', val: recNom, set: setRecNom, type: 'text', placeholder: 'Nom de famille' },
                          { label: 'Cle de securite', val: recKey, set: setRecKey, type: 'text', placeholder: 'JULABA_RECOVERY_2026' },
                        ].map((f, i) => (
                          <div key={i}>
                            <label className="text-white/40 text-xs mb-1.5 block font-medium">{f.label}</label>
                            <input
                              type={f.type}
                              value={f.val}
                              onChange={e => f.set(e.target.value)}
                              placeholder={f.placeholder}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-amber-500/50"
                            />
                          </div>
                        ))}
                        {recResult && (
                          <div className={`rounded-xl p-3 text-xs ${recResult.success ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300' : 'bg-red-500/15 border border-red-500/30 text-red-300'}`}>
                            {recResult.success
                              ? 'Compte recree avec succes. Connexion en cours...'
                              : recResult.error || 'Erreur inconnue.'}
                            {recResult.steps && recResult.steps.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-white/10 space-y-0.5">
                                {recResult.steps.map((s: string, i: number) => (
                                  <p key={i} className="font-mono opacity-60">{s}</p>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                        <button
                          onClick={runRecreate}
                          disabled={recLoading}
                          className="w-full py-3.5 rounded-2xl font-bold text-black text-sm flex items-center justify-center gap-2 disabled:opacity-50 bg-amber-400 hover:bg-amber-300 transition-all"
                        >
                          {recLoading
                            ? <><Loader2 className="w-4 h-4 animate-spin" />Recreation...</>
                            : <><RefreshCw className="w-4 h-4" />Recreer le compte</>}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Badge securite */}
          <div className="flex items-center justify-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-white/20 text-xs">Connexion chiffree HTTPS — Julaba Back-Office</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
