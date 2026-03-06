import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Eye, EyeOff, Lock, Phone, Shield, AlertCircle,
  ChevronRight, Activity, Users, BarChart3, Settings,
  ArrowRight, CheckCircle2, Loader2, Search, RefreshCw,
  XCircle, Wrench, KeyRound, CheckCheck
} from 'lucide-react';
import { useBackOffice } from '../../contexts/BackOfficeContext';
import { useApp } from '../../contexts/AppContext';
import { projectId, publicAnonKey } from '/utils/supabase/info';

import logoJulabaBlanc from '/logo-julaba.svg';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-488793d3`;

// Headers de base requis par Supabase Edge Functions (meme pour les routes publiques)
const baseHeaders = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${publicAnonKey}`,
};

const BO_ROLES = [
  { key: 'super_admin',       label: 'Super Admin',         color: '#7C3AED', icon: Shield },
  { key: 'admin_national',    label: 'Admin National',      color: '#0EA5E9', icon: Activity },
  { key: 'gestionnaire_zone', label: 'Gestionnaire Zone',   color: '#10B981', icon: Users },
  { key: 'analyste',          label: 'Analyste',            color: '#F59E0B', icon: BarChart3 },
];

const STATS = [
  { label: 'Acteurs enrolles',  value: '12 847', icon: Users },
  { label: 'Zones actives',     value: '38',     icon: Activity },
  { label: 'Transactions/jour', value: '4 290',  icon: BarChart3 },
  { label: 'Modules actifs',    value: '14',     icon: Settings },
];

const loginAttempts: Record<string, { count: number; ts: number }> = {};

// ── Etape du panneau de secours
type Step = 'idle' | 'diag' | 'reset' | 'recreate';

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

  // Panneau secours
  const [showPanel, setShowPanel] = useState(false);
  const [step, setStep] = useState<Step>('idle');

  // Diagnostic
  const [diagLoading, setDiagLoading] = useState(false);
  const [diagResult, setDiagResult] = useState<any>(null);
  const [diagError, setDiagError] = useState('');

  // Reset mot de passe
  const [resetPhone, setResetPhone] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetShowPwd, setResetShowPwd] = useState(false);
  const [resetKey, setResetKey] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetResult, setResetResult] = useState<any>(null);

  // Recreation complete
  const [recPhone, setRecPhone] = useState('');
  const [recPassword, setRecPassword] = useState('');
  const [recFirstName, setRecFirstName] = useState('');
  const [recLastName, setRecLastName] = useState('');
  const [recKey, setRecKey] = useState('');
  const [recLoading, setRecLoading] = useState(false);
  const [recResult, setRecResult] = useState<any>(null);

  // Boot Admin urgence
  const [bootLoading, setBootLoading] = useState(false);
  const [bootLog, setBootLog] = useState<string[]>([]);
  const [bootError, setBootError] = useState('');

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

  // ── Connexion
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
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: baseHeaders,
        body: JSON.stringify({ phone: cleanPhone, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        loginAttempts[cleanPhone] = { count: (loginAttempts[cleanPhone]?.count || 0) + 1, ts: now };
        setError(data.error || 'Identifiants incorrects.');
        return;
      }
      const boRoles = ['super_admin', 'admin_national', 'gestionnaire_zone', 'analyste'];
      if (!boRoles.includes(data.user?.role)) {
        setError('Acces refuse. Ce portail est reserve aux administrateurs Back-Office.');
        return;
      }
      localStorage.setItem('julaba_access_token', data.accessToken);
      localStorage.setItem('julaba_refresh_token', data.refreshToken);
      localStorage.setItem('julaba_user', JSON.stringify(data.user));
      setAppUser(data.user);
      setBOUser(data.user);
      delete loginAttempts[cleanPhone];
      setSuccess(true);
      setTimeout(() => navigate('/backoffice/dashboard'), 1200);
    } catch {
      setError('Erreur reseau. Verifiez votre connexion.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── BOOT ADMIN URGENCE
  const runBootAdmin = async () => {
    setBootLoading(true);
    setBootLog([]);
    setBootError('');
    try {
      const res = await fetch(`${API_URL}/auth/boot-admin`, {
        method: 'POST',
        headers: baseHeaders,
        body: JSON.stringify({ secretKey: 'JULABA_BOOT_2026' }),
      });
      const text = await res.text();
      console.log('[boot-admin] raw response:', text);
      let data: any;
      try { data = JSON.parse(text); } catch { setBootError(`Reponse non-JSON: ${text.slice(0, 200)}`); return; }
      setBootLog(data.log || []);
      if (!data.ok) { setBootError(data.error || 'Echec inconnu'); return; }
      // Succes
      const user = data.user || { phone: data.phone, role: 'super_admin' };
      if (data.autoLogin && data.accessToken) {
        localStorage.setItem('julaba_access_token', data.accessToken);
        if (data.refreshToken) localStorage.setItem('julaba_refresh_token', data.refreshToken);
        localStorage.setItem('julaba_user', JSON.stringify(user));
        setAppUser(user);
        setBOUser(user);
        setSuccess(true);
        setTimeout(() => navigate('/backoffice/dashboard'), 1000);
      } else {
        // Login manuel avec les creds retournés
        setPhone(data.phone || '0759153077');
        setPassword(data.password || 'Admin@Julaba2026');
        setShowPanel(false);
        setBootError(`Compte cree! Connectez-vous avec: ${data.phone} / ${data.password}`);
      }
    } catch (err: any) {
      setBootError(`Erreur reseau: ${err?.message}`);
    } finally {
      setBootLoading(false);
    }
  };

  // ── Diagnostic
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
          body: JSON.stringify({ phone: phone.replace(/\s/g,'') || '0709220009', password: password || '___' }),
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

  // ── Reset mot de passe — utilise la route emergency-reset (plus fiable)
  const runReset = async () => {
    if (!resetPhone || !resetNewPassword || !resetKey) {
      setResetResult({ error: 'Tous les champs sont obligatoires.' });
      return;
    }
    if (resetNewPassword.length < 6) {
      setResetResult({ error: 'Le mot de passe doit avoir au moins 6 caracteres.' });
      return;
    }
    setResetLoading(true);
    setResetResult(null);
    try {
      const res = await fetch(`${API_URL}/auth/emergency-reset`, {
        method: 'POST',
        headers: baseHeaders,
        body: JSON.stringify({
          phone: resetPhone.replace(/\s/g, ''),
          newPassword: resetNewPassword,
          secretKey: resetKey,
        }),
      });
      const data = await res.json();
      console.log('[emergency-reset] response:', data);
      setResetResult(data);
      if (data.success) {
        // Si le token est directement disponible, connexion automatique
        if (data.accessToken && data.user) {
          const boRoles = ['super_admin', 'admin_national', 'gestionnaire_zone', 'analyste'];
          if (boRoles.includes(data.user.role)) {
            localStorage.setItem('julaba_access_token', data.accessToken);
            if (data.refreshToken) localStorage.setItem('julaba_refresh_token', data.refreshToken);
            localStorage.setItem('julaba_user', JSON.stringify(data.user));
            setAppUser(data.user);
            setBOUser(data.user);
            setShowPanel(false);
            setStep('idle');
            setSuccess(true);
            setTimeout(() => navigate('/backoffice/dashboard'), 1200);
            return;
          }
        }
        // Sinon pre-remplir le formulaire pour connexion manuelle
        setPhone(resetPhone.replace(/\s/g, ''));
        setPassword(resetNewPassword);
        setShowPanel(false);
        setStep('idle');
      }
    } catch (err) {
      console.error('[emergency-reset] catch:', err);
      setResetResult({ error: 'Erreur reseau. Verifiez votre connexion.' });
    } finally {
      setResetLoading(false);
    }
  };

  // ── Recreation complete
  const runRecreate = async () => {
    if (!recPhone || !recPassword || !recFirstName || !recLastName || !recKey) {
      setRecResult({ error: 'Tous les champs sont requis.' });
      return;
    }
    setRecLoading(true);
    setRecResult(null);
    try {
      const res = await fetch(`${API_URL}/auth/recover-super-admin`, {
        method: 'POST',
        headers: baseHeaders,
        body: JSON.stringify({
          phone: recPhone.replace(/\s/g, ''),
          password: recPassword,
          firstName: recFirstName,
          lastName: recLastName,
          secretKey: recKey,
        }),
      });
      const data = await res.json();
      console.log('[recover-super-admin] response:', JSON.stringify(data));
      setRecResult(data);
      if (data.success) {
        // Connexion automatique si token disponible
        if (data.accessToken && data.user) {
          localStorage.setItem('julaba_access_token', data.accessToken);
          if (data.refreshToken) localStorage.setItem('julaba_refresh_token', data.refreshToken);
          localStorage.setItem('julaba_user', JSON.stringify(data.user));
          setAppUser(data.user);
          setBOUser(data.user);
          setShowPanel(false);
          setStep('idle');
          setSuccess(true);
          setTimeout(() => navigate('/backoffice/dashboard'), 1200);
          return;
        }
        // Sinon pre-remplir
        setPhone(recPhone.replace(/\s/g, ''));
        setPassword(recPassword);
        setShowPanel(false);
        setStep('idle');
      }
    } catch (err) {
      console.error('[recover-super-admin] catch:', err);
      setRecResult({ error: 'Erreur reseau.' });
    } finally {
      setRecLoading(false);
    }
  };

  const StatIcon = STATS[currentStat].icon;

  return (
    <div className="min-h-screen flex bg-[#0B1120] overflow-hidden relative">
      {/* Grille de fond */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `linear-gradient(rgba(124,58,237,0.3) 1px, transparent 1px),linear-gradient(90deg, rgba(124,58,237,0.3) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }} />
      <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] rounded-full bg-violet-700/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-150px] right-[100px] w-[500px] h-[500px] rounded-full bg-blue-600/15 blur-[100px] pointer-events-none" />

      {/* ══ PANNEAU GAUCHE ══════════════════════════════════════════════════════ */}
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
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
            <p className="text-violet-400 text-sm font-medium uppercase tracking-widest mb-3">Plateforme nationale</p>
            <h1 className="text-5xl font-black text-white leading-tight">
              Inclusion<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">economique</span><br />
              des vivriers
            </h1>
            <p className="text-white/50 text-lg leading-relaxed max-w-md mt-4">
              Pilotez l'ensemble de l'ecosysteme Julaba depuis ce centre de commande national.
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div key={currentStat} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="flex items-center gap-6 bg-white/5 border border-white/10 rounded-2xl p-6">
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
                <motion.div key={role.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: role.color + '25', border: `1px solid ${role.color}50` }}>
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

      {/* ══ PANNEAU DROIT ═══════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12 relative z-10 overflow-y-auto py-12">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-4">

          {/* Logo mobile */}
          <div className="lg:hidden flex justify-center mb-6">
            <img src={logoJulabaBlanc} alt="Julaba" className="h-10 brightness-0 invert" />
          </div>

          {/* ══ ACCES DIRECT SANS MOT DE PASSE ══════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="relative rounded-3xl overflow-hidden border-2 border-red-500/60"
            style={{ background: 'linear-gradient(135deg, rgba(220,38,38,0.15), rgba(153,27,27,0.25))' }}>
            {/* Barre animée en haut */}
            <motion.div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-400 to-red-500"
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 3, repeat: Infinity }} />
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-white font-black text-base">Acces administrateur direct</p>
                  <p className="text-white/40 text-xs">Connexion instantanee sans mot de passe</p>
                </div>
              </div>

              <motion.button type="button" onClick={runBootAdmin} disabled={bootLoading || success}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                className="w-full py-4 rounded-2xl font-black text-white text-base flex items-center justify-center gap-3 disabled:opacity-50 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg,#dc2626,#b91c1c)', boxShadow: '0 0 30px rgba(220,38,38,0.4)' }}>
                {bootLoading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" />Connexion en cours...</>
                ) : success ? (
                  <><CheckCheck className="w-5 h-5" />Connecte — Redirection...</>
                ) : (
                  <><ArrowRight className="w-5 h-5" />SE CONNECTER MAINTENANT</>
                )}
                {!bootLoading && !success && (
                  <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                    animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 0.5 }} />
                )}
              </motion.button>

              {/* Retour d'état */}
              {bootError && (
                <div className={`rounded-2xl p-4 text-sm ${bootError.startsWith('Compte') || bootError.startsWith('Connexion')
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                  : 'bg-red-900/30 border border-red-500/30 text-red-300'}`}>
                  <p className="font-bold">{bootError}</p>
                  {bootLog.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-white/10 space-y-0.5">
                      {bootLog.map((l, i) => <p key={i} className="font-mono text-xs opacity-60">{l}</p>)}
                    </div>
                  )}
                </div>
              )}
              {bootLoading && bootLog.length > 0 && (
                <div className="rounded-xl p-3 bg-white/5 border border-white/10">
                  {bootLog.map((l, i) => <p key={i} className="font-mono text-xs text-white/40">{l}</p>)}
                </div>
              )}
            </div>
          </motion.div>

          {/* Séparateur */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <p className="text-white/20 text-xs font-medium">ou connexion manuelle</p>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* ── Carte connexion ─────────────────────────────────────────── */}
          <div className="bg-[#111827] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 via-violet-400 to-cyan-400 rounded-t-3xl" />

            <div className="flex justify-center mb-6">
              <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2.5, repeat: Infinity }}
                className="w-16 h-16 rounded-2xl bg-violet-500/15 border-2 border-violet-500/30 flex items-center justify-center">
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
                <label className="text-white/50 text-xs font-semibold uppercase tracking-wider">Numero de telephone</label>
                <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl overflow-hidden focus-within:border-violet-500/60 transition-all">
                  <div className="flex items-center gap-2 px-4 py-4 border-r border-white/10 bg-white/5 flex-shrink-0">
                    <Phone className="w-4 h-4 text-violet-400" />
                    <span className="text-white/60 text-sm font-mono">+225</span>
                  </div>
                  <input
                    type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="07 09 22 00 09"
                    className="flex-1 bg-transparent px-4 py-4 text-white placeholder-white/20 text-sm font-mono focus:outline-none"
                    autoComplete="tel" disabled={isLoading || success}
                  />
                  {phone.replace(/\s/g, '').length >= 8 && <CheckCircle2 className="w-4 h-4 text-emerald-400 mr-4 flex-shrink-0" />}
                </div>
              </div>

              {/* Mot de passe */}
              <div className="space-y-2">
                <label className="text-white/50 text-xs font-semibold uppercase tracking-wider">Mot de passe</label>
                <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl overflow-hidden focus-within:border-violet-500/60 transition-all">
                  <div className="flex items-center px-4 py-4 border-r border-white/10 bg-white/5 flex-shrink-0">
                    <Lock className="w-4 h-4 text-violet-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Mot de passe administrateur"
                    className="flex-1 bg-transparent px-4 py-4 text-white placeholder-white/20 text-sm focus:outline-none"
                    autoComplete="current-password" disabled={isLoading || success}
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    className="px-4 py-4 text-white/30 hover:text-white/70 transition-colors flex-shrink-0" tabIndex={-1}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Erreur */}
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-300 text-sm">{error}</p>
                      <button type="button" onClick={() => { setShowPanel(true); setStep('reset'); setResetPhone(phone.replace(/\s/g,'')); setError(''); }}
                        className="text-violet-400 hover:text-violet-300 text-xs mt-1.5 flex items-center gap-1 transition-colors">
                        <KeyRound className="w-3 h-3" />
                        Reinitialiser mon mot de passe
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bouton */}
              <motion.button type="submit" disabled={isLoading || success}
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                className="w-full py-4 rounded-2xl font-bold text-white text-base relative overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: success ? 'linear-gradient(135deg,#10B981,#059669)' : 'linear-gradient(135deg,#7C3AED,#6D28D9)',
                  boxShadow: success ? '0 0 30px rgba(16,185,129,0.4)' : '0 0 30px rgba(124,58,237,0.4)',
                }}>
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {success ? (<><CheckCheck className="w-5 h-5" />Connexion reussie</>) :
                    isLoading ? (<><Loader2 className="w-5 h-5 animate-spin" />Authentification...</>) :
                    (<>Acceder au Back-Office<ArrowRight className="w-5 h-5" /></>)}
                </span>
                {!isLoading && !success && (
                  <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5 }} />
                )}
              </motion.button>

              <div className="flex items-center justify-between pt-1">
                <button type="button" onClick={() => { setShowPanel(v => !v); setStep('idle'); }}
                  className="text-white/30 hover:text-violet-400 text-xs flex items-center gap-1 transition-colors">
                  <Wrench className="w-3 h-3" />
                  Outils de secours
                </button>
                <button type="button" onClick={() => navigate('/')}
                  className="text-white/30 hover:text-white/60 text-xs flex items-center gap-1 transition-colors">
                  Portail terrain<ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </form>
          </div>

          {/* ── Panneau outils de secours ───────────────────────────────── */}
          <AnimatePresence>
            {showPanel && (
              <motion.div initial={{ opacity: 0, y: 10, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: 10, height: 0 }} className="overflow-hidden">
                <div className="bg-[#111827] border border-violet-500/30 rounded-3xl p-6 space-y-4">

                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-violet-400" />
                      <h3 className="text-white font-bold text-sm">Outils de secours Admin</h3>
                    </div>
                    <button onClick={() => { setShowPanel(false); setStep('idle'); }} className="text-white/30 hover:text-white/70">
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Choix de l'outil */}
                  {step === 'idle' && (
                    <div className="space-y-3">
                      {/* Option 1 : Reset mot de passe */}
                      <button onClick={() => { setStep('reset'); setResetPhone(phone.replace(/\s/g,'')); }}
                        className="w-full flex items-center gap-4 bg-violet-500/10 border border-violet-500/30 rounded-2xl p-4 text-left hover:bg-violet-500/20 transition-all group">
                        <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-violet-500/30">
                          <KeyRound className="w-5 h-5 text-violet-400" />
                        </div>
                        <div>
                          <p className="text-white text-sm font-bold">Reinitialiser le mot de passe</p>
                          <p className="text-white/40 text-xs mt-0.5">Le compte existe mais le mot de passe ne fonctionne pas</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/30 ml-auto flex-shrink-0" />
                      </button>

                      {/* Option 2 : Diagnostic */}
                      <button onClick={() => { setStep('diag'); runDiag(); }}
                        className="w-full flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 text-left hover:bg-white/10 transition-all group">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                          <Search className="w-5 h-5 text-white/60" />
                        </div>
                        <div>
                          <p className="text-white text-sm font-bold">Diagnostic complet</p>
                          <p className="text-white/40 text-xs mt-0.5">Analyser l'etat du compte dans la base de donnees</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/30 ml-auto flex-shrink-0" />
                      </button>

                      {/* Option 3 : Recreation complete */}
                      <button onClick={() => setStep('recreate')}
                        className="w-full flex items-center gap-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-left hover:bg-amber-500/20 transition-all group">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                          <RefreshCw className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                          <p className="text-white text-sm font-bold">Recreer le compte complet</p>
                          <p className="text-white/40 text-xs mt-0.5">Supprime et recrée entièrement le Super Admin</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/30 ml-auto flex-shrink-0" />
                      </button>
                    </div>
                  )}

                  {/* ── RESET MOT DE PASSE ──────────────────────────────── */}
                  {step === 'reset' && (
                    <div className="space-y-4">
                      <button onClick={() => setStep('idle')} className="text-white/40 hover:text-white/70 text-xs flex items-center gap-1">
                        <ChevronRight className="w-3 h-3 rotate-180" /> Retour
                      </button>

                      <div className="bg-violet-500/10 border border-violet-500/30 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <KeyRound className="w-4 h-4 text-violet-400" />
                          <p className="text-white font-bold text-sm">Reinitialisation du mot de passe</p>
                        </div>
                        <p className="text-white/40 text-xs">
                          Cette action change uniquement le mot de passe. Le compte et toutes les donnees sont preserves.
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="text-white/40 text-xs mb-1.5 block font-medium">Numero de telephone du Super Admin</label>
                          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl overflow-hidden focus-within:border-violet-500/50">
                            <span className="text-white/40 text-sm font-mono px-3 py-3 border-r border-white/10">+225</span>
                            <input type="tel" value={resetPhone} onChange={e => setResetPhone(e.target.value)}
                              placeholder="0709220009"
                              className="flex-1 bg-transparent px-3 py-3 text-white text-sm font-mono placeholder-white/20 focus:outline-none" />
                          </div>
                        </div>

                        <div>
                          <label className="text-white/40 text-xs mb-1.5 block font-medium">Nouveau mot de passe</label>
                          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl overflow-hidden focus-within:border-violet-500/50">
                            <input type={resetShowPwd ? 'text' : 'password'} value={resetNewPassword} onChange={e => setResetNewPassword(e.target.value)}
                              placeholder="Minimum 6 caracteres"
                              className="flex-1 bg-transparent px-3 py-3 text-white text-sm placeholder-white/20 focus:outline-none" />
                            <button type="button" onClick={() => setResetShowPwd(v => !v)} className="px-3 text-white/30 hover:text-white/60">
                              {resetShowPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="text-white/40 text-xs mb-1.5 block font-medium">Cle de securite</label>
                          <input type="text" value={resetKey} onChange={e => setResetKey(e.target.value)}
                            placeholder="JULABA_RECOVERY_2026"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white text-sm font-mono placeholder-white/20 focus:outline-none focus:border-violet-500/50" />
                        </div>

                        {resetResult && (
                          <div className={`rounded-xl p-3 text-xs font-medium ${resetResult.success
                            ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                            : 'bg-red-500/15 border border-red-500/30 text-red-300'}`}>
                            {resetResult.success
                              ? `Mot de passe reinitialise avec succes pour ${resetResult.phone || resetPhone}. Vous pouvez maintenant vous connecter.`
                              : resetResult.error || 'Erreur inconnue.'}
                          </div>
                        )}

                        <motion.button onClick={runReset} disabled={resetLoading}
                          whileTap={{ scale: 0.97 }}
                          className="w-full py-3.5 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                          style={{ background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', boxShadow: '0 0 20px rgba(124,58,237,0.3)' }}>
                          {resetLoading
                            ? <><Loader2 className="w-4 h-4 animate-spin" />Reinitialisation en cours...</>
                            : <><KeyRound className="w-4 h-4" />Reinitialiser le mot de passe</>}
                        </motion.button>

                        {resetResult?.success && (
                          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            onClick={() => { setShowPanel(false); setStep('idle'); }}
                            className="w-full py-3.5 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2"
                            style={{ background: 'linear-gradient(135deg,#10B981,#059669)', boxShadow: '0 0 20px rgba(16,185,129,0.3)' }}>
                            <CheckCircle2 className="w-4 h-4" />
                            Se connecter maintenant
                          </motion.button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ── DIAGNOSTIC ──────────────────────────────────────── */}
                  {step === 'diag' && (
                    <div className="space-y-4">
                      <button onClick={() => setStep('idle')} className="text-white/40 hover:text-white/70 text-xs flex items-center gap-1">
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
                                  <span className={`px-2 py-0.5 rounded-full ${p.auth_user_id ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                                    auth_user_id {p.auth_user_id ? 'lie' : 'manquant'}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded-full ${p.authExists ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                                    Auth {p.authExists ? 'existe' : 'absent'}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded-full ${p.validated ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                                    {p.validated ? 'valide' : 'non valide'}
                                  </span>
                                </div>
                                {p.authEmail && <p className="text-white/40">Email: {p.authEmail}</p>}
                              </div>
                            ))}
                          </div>
                          {diagResult.test?.diagnosis && (
                            <div className="bg-white/5 rounded-2xl p-4 space-y-2">
                              <p className="text-white/50 text-xs font-bold uppercase tracking-wider">Test connexion</p>
                              <div className={`flex items-center gap-2 rounded-xl p-3 ${diagResult.test.diagnosis.loginSuccess ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                                {diagResult.test.diagnosis.loginSuccess
                                  ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                  : <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
                                <p className="text-white/80 text-xs">{diagResult.test.diagnosis.explanation}</p>
                              </div>
                              {diagResult.test.diagnosis.loginError && (
                                <p className="text-red-300 text-xs font-mono bg-red-500/10 rounded-lg px-3 py-2">
                                  {diagResult.test.diagnosis.loginError}
                                </p>
                              )}
                            </div>
                          )}
                          <button onClick={() => setStep('reset')}
                            className="w-full py-3 rounded-2xl bg-violet-600/20 border border-violet-500/40 text-violet-300 text-sm font-medium flex items-center justify-center gap-2 hover:bg-violet-600/30 transition-all">
                            <KeyRound className="w-4 h-4" />
                            Reinitialiser le mot de passe
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── RECREATION COMPLETE ──────────────────────────────── */}
                  {step === 'recreate' && (
                    <div className="space-y-4">
                      <button onClick={() => setStep('idle')} className="text-white/40 hover:text-white/70 text-xs flex items-center gap-1">
                        <ChevronRight className="w-3 h-3 rotate-180" /> Retour
                      </button>

                      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <RefreshCw className="w-4 h-4 text-amber-400" />
                          <p className="text-white font-bold text-sm">Recreation complete</p>
                        </div>
                        <p className="text-amber-300/70 text-xs">
                          Supprime l'ancien compte et en cree un nouveau. Utiliser seulement si le compte est totalement inaccessible.
                        </p>
                      </div>

                      <div className="space-y-3">
                        {[
                          { label: 'Telephone', val: recPhone, set: setRecPhone, placeholder: '0709220009', type: 'tel' },
                          { label: 'Nouveau mot de passe', val: recPassword, set: setRecPassword, placeholder: 'Min. 6 caracteres', type: 'password' },
                          { label: 'Prenom', val: recFirstName, set: setRecFirstName, placeholder: 'Prenom', type: 'text' },
                          { label: 'Nom', val: recLastName, set: setRecLastName, placeholder: 'Nom de famille', type: 'text' },
                          { label: 'Cle de securite', val: recKey, set: setRecKey, placeholder: 'JULABA_RECOVERY_2026', type: 'text' },
                        ].map((f, i) => (
                          <div key={i}>
                            <label className="text-white/40 text-xs mb-1.5 block font-medium">{f.label}</label>
                            <input type={f.type} value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.placeholder}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-amber-500/50" />
                          </div>
                        ))}

                        {recResult && (
                          <div className={`rounded-xl p-3 text-xs ${recResult.success ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300' : 'bg-red-500/15 border border-red-500/30 text-red-300'}`}>
                            {recResult.success ? 'Compte recree avec succes. Vous pouvez maintenant vous connecter.' : (
                              <div className="space-y-1">
                                <p className="font-bold">{recResult.error || 'Erreur inconnue.'}</p>
                                {recResult.details && <p className="opacity-70 font-mono">{recResult.details}</p>}
                                {recResult.steps && recResult.steps.length > 0 && (
                                  <div className="mt-2 space-y-0.5 pt-2 border-t border-red-500/20">
                                    <p className="text-red-400/60 font-bold mb-1">Journal:</p>
                                    {recResult.steps.map((s: string, i: number) => (
                                      <p key={i} className="font-mono opacity-60">{s}</p>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        <button onClick={runRecreate} disabled={recLoading}
                          className="w-full py-3.5 rounded-2xl font-bold text-black text-sm flex items-center justify-center gap-2 disabled:opacity-50 bg-amber-400 hover:bg-amber-300 transition-all">
                          {recLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Recreation...</> : <><RefreshCw className="w-4 h-4" />Recreer le compte</>}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Badge */}
          <div className="flex items-center justify-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-white/20 text-xs">Connexion chiffree HTTPS — Julaba Back-Office</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}