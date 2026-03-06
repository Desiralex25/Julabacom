import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Eye, EyeOff, Lock, Phone, Shield, AlertCircle,
  ChevronRight, Activity, Users, BarChart3, Settings,
  ArrowRight, CheckCircle2, Loader2, Search, RefreshCw,
  XCircle, Info, Wrench
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
  { label: 'Acteurs enrolles',  value: '12 847', icon: Users },
  { label: 'Zones actives',     value: '38',     icon: Activity },
  { label: 'Transactions/jour', value: '4 290',  icon: BarChart3 },
  { label: 'Modules actifs',    value: '14',     icon: Settings },
];

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

  // Diagnostic
  const [showDiag, setShowDiag] = useState(false);
  const [diagLoading, setDiagLoading] = useState(false);
  const [diagResult, setDiagResult] = useState<any>(null);
  const [diagError, setDiagError] = useState('');

  // Recovery
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryPhone, setRecoveryPhone] = useState('');
  const [recoveryPassword, setRecoveryPassword] = useState('');
  const [recoveryFirstName, setRecoveryFirstName] = useState('');
  const [recoveryLastName, setRecoveryLastName] = useState('');
  const [recoveryKey, setRecoveryKey] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryResult, setRecoveryResult] = useState<any>(null);

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const cleanPhone = phone.replace(/\s/g, '');
    if (!cleanPhone || !password) {
      setError('Veuillez renseigner votre numero et votre mot de passe.');
      return;
    }
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
    } catch (err) {
      console.error('BO Login error:', err);
      setError('Erreur reseau. Verifiez votre connexion et reessayez.');
    } finally {
      setIsLoading(false);
    }
  };

  const runDiagnostic = async () => {
    const cleanPhone = phone.replace(/\s/g, '') || recoveryPhone.replace(/\s/g, '');
    if (!cleanPhone) {
      setDiagError('Entrez votre numero de telephone ci-dessus avant de lancer le diagnostic.');
      return;
    }
    setDiagLoading(true);
    setDiagResult(null);
    setDiagError('');
    try {
      // 1. Super admin status
      const statusRes = await fetch(`${API_URL}/auth/super-admin-status`);
      const statusData = await statusRes.json();
      // 2. Test login si mot de passe fourni
      let testData = null;
      const pwd = password || recoveryPassword;
      if (pwd) {
        const testRes = await fetch(`${API_URL}/auth/test-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: cleanPhone, password: pwd }),
        });
        testData = await testRes.json();
      }
      setDiagResult({ status: statusData, test: testData });
    } catch (err) {
      setDiagError('Erreur reseau lors du diagnostic.');
    } finally {
      setDiagLoading(false);
    }
  };

  const runRecovery = async () => {
    if (!recoveryPhone || !recoveryPassword || !recoveryFirstName || !recoveryLastName || !recoveryKey) {
      setRecoveryResult({ error: 'Tous les champs sont requis pour la recuperation.' });
      return;
    }
    setRecoveryLoading(true);
    setRecoveryResult(null);
    try {
      const res = await fetch(`${API_URL}/auth/recover-super-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: recoveryPhone.replace(/\s/g, ''),
          password: recoveryPassword,
          firstName: recoveryFirstName,
          lastName: recoveryLastName,
          secretKey: recoveryKey,
        }),
      });
      const data = await res.json();
      setRecoveryResult(data);
      if (data.success) {
        // Pré-remplir les champs de connexion
        setPhone(recoveryPhone.replace(/\s/g, ''));
        setPassword(recoveryPassword);
        setShowRecovery(false);
        setShowDiag(false);
      }
    } catch (err) {
      setRecoveryResult({ error: 'Erreur reseau lors de la recuperation.' });
    } finally {
      setRecoveryLoading(false);
    }
  };

  const StatIcon = STATS[currentStat].icon;

  const DiagItem = ({ label, value, ok }: { label: string; value: string; ok?: boolean | null }) => (
    <div className="flex items-start gap-2 py-1.5 border-b border-white/5 last:border-0">
      {ok === true && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />}
      {ok === false && <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />}
      {ok === null || ok === undefined && <Info className="w-3.5 h-3.5 text-white/30 flex-shrink-0 mt-0.5" />}
      <div className="flex-1 min-w-0">
        <span className="text-white/40 text-xs">{label} : </span>
        <span className="text-white/80 text-xs font-mono break-all">{value}</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#0B1120] overflow-hidden relative">
      {/* Fond grille */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `linear-gradient(rgba(124,58,237,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.3) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }} />
      {/* Orbes */}
      <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] rounded-full bg-violet-700/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-150px] right-[200px] w-[500px] h-[500px] rounded-full bg-blue-600/15 blur-[100px] pointer-events-none" />

      {/* ═══ PANNEAU GAUCHE ════════════════════════════════════════════════ */}
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
          <div className="space-y-4">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
              <p className="text-violet-400 text-sm font-medium uppercase tracking-widest mb-2">Plateforme nationale</p>
              <h1 className="text-5xl font-black text-white leading-tight">
                Inclusion<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">economique</span><br />
                des vivriers
              </h1>
            </motion.div>
            <p className="text-white/50 text-lg leading-relaxed max-w-md">
              Pilotez l'ensemble de l'ecosysteme Julaba depuis ce centre de commande national.
            </p>
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={currentStat} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}
              className="flex items-center gap-6 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <div className="w-14 h-14 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
                <StatIcon className="w-7 h-7 text-violet-400" />
              </div>
              <div>
                <p className="text-4xl font-black text-white">{STATS[currentStat].value}</p>
                <p className="text-white/50 text-sm mt-1">{STATS[currentStat].label}</p>
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="space-y-3">
            <p className="text-white/30 text-xs uppercase tracking-widest font-medium">Roles d'administration</p>
            <div className="grid grid-cols-2 gap-3">
              {BO_ROLES.map((role, i) => {
                const Icon = role.icon;
                return (
                  <motion.div key={role.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.1 }}
                    className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: role.color + '25', border: `1px solid ${role.color}50` }}>
                      <Icon className="w-4 h-4" style={{ color: role.color }} />
                    </div>
                    <span className="text-white/70 text-sm font-medium">{role.label}</span>
                  </motion.div>
                );
              })}
            </div>
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

      {/* ═══ PANNEAU DROIT (FORMULAIRE) ════════════════════════════════════ */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12 relative z-10 overflow-y-auto">
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="w-full max-w-md space-y-4">

          {/* Logo mobile */}
          <div className="lg:hidden flex justify-center mb-8">
            <img src={logoJulabaBlanc} alt="Julaba" className="h-10 brightness-0 invert" />
          </div>

          {/* ── Carte connexion ── */}
          <div className="bg-[#111827] border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/40 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 via-violet-400 to-cyan-400 rounded-t-3xl" />

            <div className="flex justify-center mb-6">
              <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2.5, repeat: Infinity }}
                className="w-16 h-16 rounded-2xl bg-violet-500/15 border-2 border-violet-500/30 flex items-center justify-center">
                <Shield className="w-8 h-8 text-violet-400" />
              </motion.div>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-white">Administration</h2>
              <p className="text-white/40 text-sm mt-1">Acces reserve aux agents Back-Office</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Telephone */}
              <div className="space-y-2">
                <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Numero de telephone</label>
                <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl overflow-hidden focus-within:border-violet-500/50 focus-within:bg-violet-500/5 transition-all">
                  <div className="flex items-center gap-2 px-4 py-4 border-r border-white/10 bg-white/5">
                    <Phone className="w-4 h-4 text-violet-400" />
                    <span className="text-white/60 text-sm font-mono">+225</span>
                  </div>
                  <input
                    type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="07 09 22 00 09"
                    className="flex-1 bg-transparent px-4 py-4 text-white placeholder-white/20 text-sm font-mono focus:outline-none"
                    autoComplete="tel" disabled={isLoading || success}
                  />
                  {phone.replace(/\s/g, '').length >= 8 && <CheckCircle2 className="w-4 h-4 text-emerald-400 mr-4" />}
                </div>
              </div>

              {/* Mot de passe */}
              <div className="space-y-2">
                <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Mot de passe</label>
                <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl overflow-hidden focus-within:border-violet-500/50 focus-within:bg-violet-500/5 transition-all">
                  <div className="flex items-center px-4 py-4 border-r border-white/10 bg-white/5">
                    <Lock className="w-4 h-4 text-violet-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Mot de passe administrateur"
                    className="flex-1 bg-transparent px-4 py-4 text-white placeholder-white/20 text-sm focus:outline-none"
                    autoComplete="current-password" disabled={isLoading || success}
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    className="px-4 py-4 text-white/30 hover:text-white/70 transition-colors" tabIndex={-1}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Erreur */}
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-red-300 text-sm">{error}</p>
                      <button type="button" onClick={() => { setShowDiag(true); setError(''); }}
                        className="text-violet-400 text-xs mt-1 hover:text-violet-300 flex items-center gap-1 transition-colors">
                        <Search className="w-3 h-3" />
                        Lancer le diagnostic
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bouton connexion */}
              <motion.button type="submit" disabled={isLoading || success}
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                className="w-full py-4 rounded-2xl font-bold text-white text-base relative overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                style={{
                  background: success ? 'linear-gradient(135deg, #10B981, #059669)' : 'linear-gradient(135deg, #7C3AED, #6D28D9)',
                  boxShadow: success ? '0 0 30px rgba(16,185,129,0.4)' : '0 0 30px rgba(124,58,237,0.4)',
                }}>
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {success ? (<><CheckCircle2 className="w-5 h-5" />Connexion reussie</>) :
                    isLoading ? (<><Loader2 className="w-5 h-5 animate-spin" />Authentification...</>) :
                    (<>Acceder au Back-Office<ArrowRight className="w-5 h-5" /></>)}
                </span>
                {!isLoading && !success && (
                  <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }} />
                )}
              </motion.button>

              <div className="flex items-center justify-between pt-2">
                <button type="button" onClick={() => setShowDiag(v => !v)}
                  className="text-white/30 hover:text-violet-400 text-xs flex items-center gap-1 transition-colors">
                  <Wrench className="w-3 h-3" />
                  Diagnostic et recuperation
                </button>
                <button type="button" onClick={() => navigate('/')}
                  className="text-white/30 hover:text-white/60 text-xs flex items-center gap-1 transition-colors">
                  Portail terrain<ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </form>
          </div>

          {/* ── Panneau Diagnostic ── */}
          <AnimatePresence>
            {showDiag && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                className="bg-[#111827] border border-violet-500/30 rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-violet-400" />
                    <h3 className="text-white font-bold text-sm">Diagnostic de connexion</h3>
                  </div>
                  <button onClick={() => setShowDiag(false)} className="text-white/30 hover:text-white/60">
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-white/40 text-xs">
                  Entrez votre numero et mot de passe dans le formulaire ci-dessus, puis lancez le diagnostic pour voir exactement ce qui bloque.
                </p>

                <button onClick={runDiagnostic} disabled={diagLoading}
                  className="w-full py-3 rounded-2xl bg-violet-600/20 border border-violet-500/40 text-violet-300 text-sm font-medium flex items-center justify-center gap-2 hover:bg-violet-600/30 transition-all disabled:opacity-50">
                  {diagLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Analyse en cours...</> : <><Search className="w-4 h-4" />Analyser mon compte</>}
                </button>

                {diagError && <p className="text-red-400 text-xs">{diagError}</p>}

                {diagResult && (
                  <div className="space-y-3">
                    {/* Status super admin */}
                    <div className="bg-white/5 rounded-2xl p-4 space-y-1">
                      <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-2">Etat du compte Super Admin</p>
                      <DiagItem label="Nombre de SA dans la base" value={String(diagResult.status?.count ?? '?')} ok={diagResult.status?.count > 0} />
                      <DiagItem label="Diagnostic" value={diagResult.status?.diagnosis ?? '?'} />
                      {(diagResult.status?.profiles || []).map((p: any, i: number) => (
                        <div key={i} className="mt-2 bg-white/5 rounded-xl p-3 space-y-1">
                          <DiagItem label="Phone" value={p.phone} />
                          <DiagItem label="auth_user_id" value={p.auth_user_id || 'MANQUANT'} ok={!!p.auth_user_id} />
                          <DiagItem label="Compte Auth existe" value={p.authExists ? 'OUI' : 'NON'} ok={p.authExists} />
                          <DiagItem label="Email Auth" value={p.authEmail || 'inconnu'} />
                          <DiagItem label="Valide" value={p.validated ? 'OUI' : 'NON'} ok={p.validated} />
                        </div>
                      ))}
                    </div>

                    {/* Test login */}
                    {diagResult.test?.diagnosis && (
                      <div className="bg-white/5 rounded-2xl p-4 space-y-1">
                        <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-2">Test de connexion</p>
                        <DiagItem label="Profil dans la base" value={diagResult.test.diagnosis.profileExists ? 'OUI' : 'NON'} ok={diagResult.test.diagnosis.profileExists} />
                        <DiagItem label="Compte Auth existe" value={diagResult.test.diagnosis.authUserExists ? 'OUI' : 'NON'} ok={diagResult.test.diagnosis.authUserExists} />
                        <DiagItem label="Login reussi" value={diagResult.test.diagnosis.loginSuccess ? 'OUI' : 'NON'} ok={diagResult.test.diagnosis.loginSuccess} />
                        {diagResult.test.diagnosis.loginError && (
                          <DiagItem label="Erreur login" value={diagResult.test.diagnosis.loginError} ok={false} />
                        )}
                        <div className="mt-2 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
                          <p className="text-amber-300 text-xs">{diagResult.test.diagnosis.explanation}</p>
                        </div>
                      </div>
                    )}

                    {/* Bouton recuperation si necessaire */}
                    {(
                      !diagResult.status?.count ||
                      diagResult.status?.count === 0 ||
                      diagResult.status?.error ||
                      diagResult.test?.diagnosis?.loginSuccess === false
                    ) && (
                      <button onClick={() => setShowRecovery(v => !v)}
                        className="w-full py-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-sm font-medium flex items-center justify-center gap-2 hover:bg-amber-500/30 transition-all">
                        <RefreshCw className="w-4 h-4" />
                        Recreer le compte Super Admin
                      </button>
                    )}
                  </div>
                )}

                {/* Formulaire de recuperation */}
                <AnimatePresence>
                  {showRecovery && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="space-y-3 overflow-hidden">
                      <div className="border-t border-white/10 pt-4">
                        <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                          <RefreshCw className="w-3 h-3 text-amber-400" />
                          Recuperation forcee du Super Admin
                        </p>
                        {[
                          { label: 'Nouveau telephone', val: recoveryPhone, set: setRecoveryPhone, placeholder: '0709220009', type: 'tel' },
                          { label: 'Nouveau mot de passe', val: recoveryPassword, set: setRecoveryPassword, placeholder: 'Minimum 6 caracteres', type: 'password' },
                          { label: 'Prenom', val: recoveryFirstName, set: setRecoveryFirstName, placeholder: 'Prenom', type: 'text' },
                          { label: 'Nom', val: recoveryLastName, set: setRecoveryLastName, placeholder: 'Nom de famille', type: 'text' },
                          { label: 'Cle de recuperation', val: recoveryKey, set: setRecoveryKey, placeholder: 'JULABA_RECOVERY_2026', type: 'text' },
                        ].map((field, i) => (
                          <div key={i} className="mb-2">
                            <label className="text-white/40 text-xs mb-1 block">{field.label}</label>
                            <input type={field.type} value={field.val} onChange={e => field.set(e.target.value)}
                              placeholder={field.placeholder}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-amber-500/50" />
                          </div>
                        ))}
                        <button onClick={runRecovery} disabled={recoveryLoading}
                          className="w-full py-3 rounded-2xl bg-amber-500 text-black font-bold text-sm flex items-center justify-center gap-2 hover:bg-amber-400 transition-all disabled:opacity-50 mt-3">
                          {recoveryLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Recuperation...</> : <><RefreshCw className="w-4 h-4" />Lancer la recuperation</>}
                        </button>
                        {recoveryResult && (
                          <div className={`mt-3 rounded-xl p-3 text-xs ${recoveryResult.success ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300' : 'bg-red-500/20 border border-red-500/30 text-red-300'}`}>
                            {recoveryResult.success
                              ? `Compte recree avec succes. Vous pouvez maintenant vous connecter avec le nouveau mot de passe.`
                              : recoveryResult.error || 'Erreur inconnue.'}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Badge securite */}
          <div className="flex items-center justify-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-white/25 text-xs">Connexion chiffree HTTPS — Julaba Back-Office Central</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}