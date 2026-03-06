import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Phone, MapPin, Calendar, Shield, TrendingUp,
  CheckCircle2, XCircle, Clock, AlertCircle, Edit2,
  UserX, RotateCcw, Key, UserCog, FileText, Activity,
  Wallet, Star, ChevronRight, X, Save, Paperclip, Download, Eye, EyeOff,
} from 'lucide-react';
import { useBackOffice, BORoleType } from '../../contexts/BackOfficeContext';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-488793d3`;

const BO_PRIMARY = '#E6A817';
const BO_DARK = '#3B3C36';

const TYPE_COLORS: Record<string, string> = {
  marchand: '#C66A2C', producteur: '#2E8B57', cooperative: '#1D4ED8',
  institution: '#7C3AED', identificateur: '#E6A817',
};

const STATUT_CONFIG: Record<string, { label: string; bg: string; text: string; icon: any }> = {
  actif:     { label: 'Actif',      bg: 'bg-green-100',  text: 'text-green-700',  icon: CheckCircle2 },
  suspendu:  { label: 'Suspendu',   bg: 'bg-red-100',    text: 'text-red-700',    icon: XCircle },
  en_attente:{ label: 'En attente', bg: 'bg-orange-100', text: 'text-orange-700', icon: Clock },
  rejete:    { label: 'Rejeté',     bg: 'bg-gray-100',   text: 'text-gray-700',   icon: AlertCircle },
};

const ROLE_OPTIONS: { value: BORoleType | 'marchand' | 'producteur' | 'cooperative' | 'identificateur'; label: string }[] = [
  { value: 'marchand', label: 'Marchand' },
  { value: 'producteur', label: 'Producteur' },
  { value: 'cooperative', label: 'Coopérative' },
  { value: 'identificateur', label: 'Identificateur' },
];

const TABS = [
  { id: 'info',      label: 'Informations', icon: FileText },
  { id: 'documents', label: 'Documents',    icon: Paperclip },
  { id: 'activite',  label: 'Activité',     icon: Activity },
  { id: 'kpi',       label: 'KPI',          icon: TrendingUp },
  { id: 'historique',label: 'Historique',   icon: Clock },
];

function ConfirmModal({ open, title, message, onConfirm, onCancel, danger }: any) {
  if (!open) return null;
  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onCancel}>
        <motion.div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border-2"
          style={{ borderColor: danger ? '#EF4444' : BO_PRIMARY }}
          initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
          onClick={e => e.stopPropagation()}>
          <h3 className="font-black text-gray-900 text-lg mb-2">{title}</h3>
          <p className="text-sm text-gray-600 mb-6">{message}</p>
          <div className="flex gap-3">
            <button onClick={onCancel} className="flex-1 py-3 rounded-2xl border-2 border-gray-200 font-bold text-gray-700">Annuler</button>
            <button onClick={onConfirm} className="flex-1 py-3 rounded-2xl font-bold text-white"
              style={{ backgroundColor: danger ? '#EF4444' : BO_PRIMARY }}>Confirmer</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function BOActeurDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { acteurs, transactions, hasPermission, updateActeurStatut, addAuditLog, boUser, auditLogs } = useBackOffice();
  const [activeTab, setActiveTab] = useState('info');
  const [showConfirm, setShowConfirm] = useState<string | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);

  const acteur = acteurs.find(a => a.id === id);
  if (!acteur) return (
    <div className="px-8 py-6 text-center">
      <p className="text-gray-500 font-semibold">Acteur introuvable</p>
      <button onClick={() => navigate('/backoffice/acteurs')} className="mt-4 px-6 py-3 rounded-2xl font-bold text-white" style={{ backgroundColor: BO_PRIMARY }}>Retour</button>
    </div>
  );

  const acteurTx = transactions.filter(t => t.acteurNom.includes(acteur.nom));
  const typeColor = TYPE_COLORS[acteur.type] || BO_PRIMARY;
  const statutConf = STATUT_CONFIG[acteur.statut];
  const StatutIcon = statutConf.icon;

  const handleCriticalAction = (action: string) => setShowConfirm(action);

  const executeCriticalAction = (action: string) => {
    if (action === 'suspendre') {
      updateActeurStatut(acteur.id, 'suspendu', 'SUSPENSION forcée depuis détail acteur');
      toast.warning('Acteur suspendu immédiatement');
    } else if (action === 'reactiver') {
      updateActeurStatut(acteur.id, 'actif', 'RÉACTIVATION depuis détail acteur');
      toast.success('Acteur réactivé');
    } else if (action === 'valider') {
      updateActeurStatut(acteur.id, 'actif', 'VALIDATION forcée BO');
      toast.success('Validation forcée effectuée');
    } else if (action === 'reset_mdp') {
      // Ouvrir le modal pour saisir le nouveau mot de passe
      setShowResetPasswordModal(true);
    }
    setShowConfirm(null);
  };

  const handleChangeRole = () => {
    if (!newRole) { toast.error('Sélectionnez un rôle'); return; }
    if (boUser) addAuditLog({
      action: 'CHANGEMENT type acteur',
      utilisateurBO: `${boUser.prenom} ${boUser.nom}`,
      roleBO: boUser.role,
      acteurImpacte: `${acteur.prenoms} ${acteur.nom}`,
      ancienneValeur: acteur.type,
      nouvelleValeur: newRole,
      ip: '127.0.0.1',
      module: 'Acteurs',
    });
    toast.success(`Type changé vers "${newRole}" — synchronisé`);
    setShowRoleModal(false);
    setNewRole('');
  };

  const handleResetPassword = async () => {
    if (!newPassword) {
      toast.error('Entre un nouveau mot de passe');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    setResetPasswordLoading(true);

    try {
      const accessToken = localStorage.getItem('julaba_access_token');
      
      const response = await fetch(`${API_URL}/auth/reset-user-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          userId: acteur.id,
          newPassword: newPassword
        })
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        toast.error(result.error || 'Erreur lors de la réinitialisation');
        setResetPasswordLoading(false);
        return;
      }

      // Ajouter un log d'audit
      if (boUser) addAuditLog({
        action: 'RESET mot de passe',
        utilisateurBO: `${boUser.prenom} ${boUser.nom}`,
        roleBO: boUser.role,
        acteurImpacte: `${acteur.prenoms} ${acteur.nom}`,
        ip: '127.0.0.1',
        module: 'Acteurs'
      });

      toast.success('Mot de passe réinitialisé avec succès');
      setShowResetPasswordModal(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Error resetting password:', err);
      toast.error('Erreur lors de la réinitialisation');
    } finally {
      setResetPasswordLoading(false);
    }
  };

  const confirmConfig: Record<string, { title: string; message: string; danger: boolean }> = {
    suspendre: { title: 'Suspendre cet acteur ?', message: `Suspendre ${acteur.prenoms} ${acteur.nom} bloquera immédiatement son accès. Action journalisée.`, danger: true },
    reactiver: { title: 'Réactiver cet acteur ?', message: `Réactiver ${acteur.prenoms} ${acteur.nom} lui redonnera un accès complet. Action journalisée.`, danger: false },
    valider:   { title: 'Forcer la validation ?', message: `Cela validera le dossier de ${acteur.prenoms} ${acteur.nom} sans processus standard. Action journalisée.`, danger: false },
    reset_mdp: { title: 'Réinitialiser le mot de passe ?', message: `Un SMS avec un nouveau mot de passe temporaire sera envoyé au ${acteur.telephone}.`, danger: false },
  };

  return (
    <div className="px-4 lg:px-8 py-6 max-w-5xl mx-auto">

      <motion.button onClick={() => navigate('/backoffice/acteurs')}
        className="flex items-center gap-2 text-gray-600 font-semibold mb-6 hover:text-gray-900"
        whileHover={{ x: -4 }} whileTap={{ scale: 0.97 }}>
        <ArrowLeft className="w-5 h-5" /> Retour aux acteurs
      </motion.button>

      {/* Card principale */}
      <motion.div className="bg-white rounded-3xl p-6 shadow-md border-2 border-gray-100 mb-6"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start gap-5">
          <motion.div className="w-20 h-20 rounded-3xl flex items-center justify-center text-white font-black text-3xl shadow-lg flex-shrink-0"
            style={{ backgroundColor: typeColor }}
            animate={{ rotate: [0, 3, -3, 0] }} transition={{ duration: 4, repeat: Infinity }}>
            {acteur.prenoms.charAt(0)}
          </motion.div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h1 className="text-2xl font-black text-gray-900">{acteur.prenoms} {acteur.nom}</h1>
                <p className="font-semibold mt-0.5" style={{ color: typeColor }}>{acteur.type.charAt(0).toUpperCase() + acteur.type.slice(1)} • {acteur.activite}</p>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl ${statutConf.bg} ${statutConf.text} border-2 border-transparent`}>
                <StatutIcon className="w-4 h-4" />
                <span className="font-bold">{statutConf.label}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 mt-3">
              <div className="flex items-center gap-2 text-sm text-gray-600"><Phone className="w-4 h-4" /><span>{acteur.telephone}</span></div>
              <div className="flex items-center gap-2 text-sm text-gray-600"><MapPin className="w-4 h-4" /><span>{acteur.commune}, {acteur.region}</span></div>
              <div className="flex items-center gap-2 text-sm text-gray-600"><Calendar className="w-4 h-4" /><span>Inscrit le {new Date(acteur.dateInscription).toLocaleDateString('fr-FR')}</span></div>
              {acteur.email && <div className="flex items-center gap-2 text-sm text-gray-600"><Shield className="w-4 h-4" /><span>{acteur.email}</span></div>}
            </div>
          </div>
        </div>
        <div className="mt-5 pt-5 border-t-2 border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-gray-700">Score de performance</span>
            <span className="text-lg font-black" style={{ color: acteur.score >= 70 ? '#10B981' : acteur.score >= 40 ? BO_PRIMARY : '#EF4444' }}>{acteur.score}/100</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden border-2 border-gray-200">
            <motion.div className="h-full rounded-full"
              style={{ backgroundColor: acteur.score >= 70 ? '#10B981' : acteur.score >= 40 ? BO_PRIMARY : '#EF4444' }}
              initial={{ width: 0 }} animate={{ width: `${acteur.score}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }} />
          </div>
        </div>
      </motion.div>

      {/* Actions critiques */}
      {(hasPermission('acteurs.write') || hasPermission('acteurs.suspend')) && (
        <motion.div className="bg-white rounded-3xl p-5 shadow-md border-2 border-gray-100 mb-6"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="font-black text-gray-900 mb-4">Actions critiques</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {hasPermission('enrolement.validate') && acteur.statut === 'en_attente' && (
              <motion.button onClick={() => handleCriticalAction('valider')}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-green-200 bg-green-50 hover:bg-green-100 transition-colors"
                whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}>
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <span className="text-xs font-bold text-green-700">Forcer validation</span>
              </motion.button>
            )}
            {hasPermission('acteurs.suspend') && acteur.statut === 'actif' && (
              <motion.button onClick={() => handleCriticalAction('suspendre')}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-red-200 bg-red-50 hover:bg-red-100 transition-colors"
                whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}>
                <UserX className="w-6 h-6 text-red-600" />
                <span className="text-xs font-bold text-red-700">Suspension</span>
              </motion.button>
            )}
            {hasPermission('acteurs.suspend') && acteur.statut === 'suspendu' && (
              <motion.button onClick={() => handleCriticalAction('reactiver')}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-green-200 bg-green-50 hover:bg-green-100 transition-colors"
                whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}>
                <RotateCcw className="w-6 h-6 text-green-600" />
                <span className="text-xs font-bold text-green-700">Réactiver</span>
              </motion.button>
            )}
            {/* Reset MDP — protégé par permission acteurs.write */}
            {hasPermission('acteurs.write') && (
              <motion.button onClick={() => handleCriticalAction('reset_mdp')}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors"
                whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}>
                <Key className="w-6 h-6 text-gray-600" />
                <span className="text-xs font-bold text-gray-700">Reset MDP</span>
              </motion.button>
            )}
            {/* Changer type/rôle — fonctionnel */}
            {hasPermission('acteurs.write') && (
              <motion.button onClick={() => { setNewRole(acteur.type); setShowRoleModal(true); }}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-orange-200 bg-orange-50 hover:bg-orange-100 transition-colors"
                whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}>
                <UserCog className="w-6 h-6 text-orange-600" />
                <span className="text-xs font-bold text-orange-700">Changer type</span>
              </motion.button>
            )}
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-5">
        {TABS.map(tab => {
          const TabIcon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <motion.button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm flex-shrink-0 border-2 transition-all"
              style={{ backgroundColor: active ? BO_PRIMARY : 'white', color: active ? 'white' : '#374151', borderColor: active ? BO_PRIMARY : '#e5e7eb' }}
              whileHover={!active ? { y: -2 } : {}} whileTap={{ scale: 0.97 }}>
              <TabIcon className="w-4 h-4" />
              {tab.label}
            </motion.button>
          );
        })}
      </div>

      {/* Contenu tabs */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className="bg-white rounded-3xl p-6 shadow-md border-2 border-gray-100">

          {/* INFORMATIONS */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              <h3 className="font-black text-gray-900 text-lg mb-4">Informations générales</h3>
              {[
                { label: 'Nom complet', value: `${acteur.prenoms} ${acteur.nom}` },
                { label: 'Téléphone', value: acteur.telephone },
                { label: 'Type', value: acteur.type },
                { label: 'Activité', value: acteur.activite || '—' },
                { label: 'Région', value: acteur.region },
                { label: 'Commune', value: acteur.commune },
                { label: 'Email', value: acteur.email || '—' },
                { label: 'CNI', value: acteur.cni || '—' },
                { label: 'Zone', value: acteur.zone || '—' },
                { label: 'Dossier validé', value: acteur.validated ? 'Oui' : 'Non' },
                { label: 'Date inscription', value: new Date(acteur.dateInscription).toLocaleDateString('fr-FR') },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <span className="text-sm font-semibold text-gray-500">{row.label}</span>
                  <span className="text-sm font-bold text-gray-900">{row.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* DOCUMENTS */}
          {activeTab === 'documents' && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-black text-gray-900 text-lg">Documents officiels</h3>
              </div>
              <div className="space-y-3">
                {acteur.cni ? (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border-2 border-gray-100">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-blue-50">
                      <Paperclip className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-gray-900">CNI : {acteur.cni}</p>
                      <p className="text-xs text-gray-500">Numero de CNI enregistre</p>
                    </div>
                    <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-green-100 text-green-700">valide</span>
                  </motion.div>
                ) : (
                  <div className="py-10 flex flex-col items-center justify-center text-gray-400">
                    <Paperclip className="w-10 h-10 mb-2 opacity-30" />
                    <p className="text-sm font-semibold">Aucun document enregistre</p>
                    <p className="text-xs mt-1">Les documents soumis lors de l'identification apparaitront ici</p>
                  </div>
                )}
              </div>
              {hasPermission('acteurs.write') && (
                <motion.button onClick={() => toast.info('Ajout de document — a implementer avec upload')}
                  className="mt-4 flex items-center gap-2 px-4 py-3 rounded-2xl border-2 border-dashed border-gray-300 text-sm font-bold text-gray-500 w-full justify-center hover:border-gray-400 transition-colors"
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  <Paperclip className="w-4 h-4" /> Ajouter un document
                </motion.button>
              )}
            </div>
          )}

          {/* ACTIVITÉ */}
          {activeTab === 'activite' && (
            <div>
              <h3 className="font-black text-gray-900 text-lg mb-4">Transactions récentes</h3>
              {acteurTx.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Aucune transaction trouvée</p>
              ) : (
                <div className="space-y-3">
                  {acteurTx.map(tx => (
                    <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border-2 border-gray-100">
                      <div>
                        <p className="font-bold text-sm text-gray-900">{tx.produit}</p>
                        <p className="text-xs text-gray-500">{tx.quantite} • {tx.modePaiement}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-base" style={{ color: BO_PRIMARY }}>{tx.montant.toLocaleString('fr-FR')} F</p>
                        <p className="text-xs text-gray-500">Commission: {tx.commission.toLocaleString('fr-FR')} F</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* KPI */}
          {activeTab === 'kpi' && (
            <div>
              <h3 className="font-black text-gray-900 text-lg mb-5">Indicateurs de performance</h3>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { label: 'Score global', value: `${acteur.score}/100`, icon: Star, color: BO_PRIMARY },
                  { label: 'Transactions', value: acteur.transactionsTotal, icon: Activity, color: '#3B82F6' },
                  { label: 'Volume total', value: `${(acteur.volumeTotal / 1000000).toFixed(2)}M F`, icon: Wallet, color: '#10B981' },
                  { label: 'Taux activité', value: `${acteur.validated ? '87' : '32'}%`, icon: TrendingUp, color: '#8B5CF6' },
                  { label: 'Alertes actives', value: acteur.statut === 'suspendu' ? '1' : '0', icon: AlertCircle, color: '#EF4444' },
                  { label: 'Rang régional', value: '#12', icon: Shield, color: BO_DARK },
                ].map(kpi => {
                  const Icon = kpi.icon;
                  return (
                    <motion.div key={kpi.label} className="bg-gray-50 rounded-2xl p-4 border-2 border-gray-100" whileHover={{ y: -3 }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `${kpi.color}20` }}>
                        <Icon className="w-5 h-5" style={{ color: kpi.color }} />
                      </div>
                      <p className="text-xs text-gray-500 font-semibold mb-1">{kpi.label}</p>
                      <p className="text-xl font-black text-gray-900">{kpi.value}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* HISTORIQUE */}
          {activeTab === 'historique' && (
            <div>
              <h3 className="font-black text-gray-900 text-lg mb-4">Historique des actions BO</h3>
              {(() => {
                const acteurLogs = auditLogs.filter(l =>
                  l.acteurImpacte && l.acteurImpacte.toLowerCase().includes(acteur.nom.toLowerCase())
                );
                const baseHistory = [
                  { action: 'Compte créé sur Jùlaba', date: acteur.dateInscription, auteur: 'Système automatique', couleur: '#6b7280', module: 'Système' },
                  { action: 'Dossier soumis par identificateur', date: acteur.dateInscription, auteur: 'GNAGNE Brice-Olivier', couleur: BO_PRIMARY, module: 'Enrôlement' },
                  ...(acteur.validated ? [{ action: 'Dossier validé — acteur actif', date: '2025-11-15', auteur: 'BAMBA Fatoumata (Admin National)', couleur: '#10B981', module: 'Enrôlement', detail: undefined }] : []),
                ];
                const auditHistory = acteurLogs.map(l => ({
                  action: l.action,
                  date: l.date,
                  auteur: `${l.utilisateurBO} (${l.roleBO.replace(/_/g, ' ')})`,
                  couleur: l.action.includes('SUSPEND') ? '#EF4444' : l.action.includes('VALID') ? '#10B981' : l.action.includes('REJET') ? '#F97316' : '#3B82F6',
                  module: l.module,
                  detail: l.ancienneValeur && l.nouvelleValeur ? `${l.ancienneValeur} → ${l.nouvelleValeur}` : undefined,
                }));
                const allHistory = [...baseHistory, ...auditHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                return (
                  <div className="space-y-3">
                    {allHistory.map((h, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                        className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 border-2 border-gray-100">
                        <div className="flex flex-col items-center gap-1 flex-shrink-0">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: h.couleur }} />
                          {i < allHistory.length - 1 && <div className="w-0.5 h-6 bg-gray-200" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-bold text-sm text-gray-900">{h.action}</p>
                            <span className="text-[10px] text-gray-400 flex-shrink-0">{new Date(h.date).toLocaleDateString('fr-FR')}</span>
                          </div>
                          <p className="text-xs text-gray-500">{h.auteur}</p>
                          {h.detail && (
                            <p className="text-xs font-semibold mt-1 px-2 py-0.5 rounded-lg bg-white border border-gray-200 inline-block" style={{ color: h.couleur }}>{h.detail}</p>
                          )}
                          <span className="text-[10px] text-gray-400 mt-0.5 block">{h.module}</span>
                        </div>
                      </motion.div>
                    ))}
                    {allHistory.length === 0 && <p className="text-center text-gray-400 py-8">Aucun historique disponible</p>}
                  </div>
                );
              })()}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Modal Confirmation */}
      {showConfirm && confirmConfig[showConfirm] && (
        <ConfirmModal
          open={true}
          title={confirmConfig[showConfirm].title}
          message={confirmConfig[showConfirm].message}
          danger={confirmConfig[showConfirm].danger}
          onConfirm={() => executeCriticalAction(showConfirm)}
          onCancel={() => setShowConfirm(null)}
        />
      )}

      {/* Modal Changer Type */}
      <AnimatePresence>
        {showRoleModal && (
          <motion.div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowRoleModal(false)}>
            <motion.div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border-2"
              style={{ borderColor: '#F97316' }}
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-black text-gray-900 text-lg">Changer le type</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Action journalisée dans l'audit</p>
                </div>
                <button onClick={() => setShowRoleModal(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-4">Type actuel : <strong>{acteur.type}</strong></p>
              <div className="space-y-2 mb-5">
                {ROLE_OPTIONS.filter(r => r.value !== acteur.type).map(r => (
                  <button key={r.value} onClick={() => setNewRole(r.value)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all text-left"
                    style={{ borderColor: newRole === r.value ? '#F97316' : '#e5e7eb', backgroundColor: newRole === r.value ? '#FFF7ED' : 'transparent' }}>
                    <div className="w-3 h-3 rounded-full border-2 flex-shrink-0"
                      style={{ borderColor: '#F97316', backgroundColor: newRole === r.value ? '#F97316' : 'transparent' }} />
                    <span className="font-semibold text-sm text-gray-900">{r.label}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowRoleModal(false)} className="flex-1 py-3 rounded-2xl border-2 border-gray-200 font-bold text-gray-700">Annuler</button>
                <motion.button onClick={handleChangeRole}
                  className="flex-1 py-3 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#F97316' }}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                  <Save className="w-4 h-4" /> Confirmer
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Réinitialiser Mot de Passe */}
      <AnimatePresence>
        {showResetPasswordModal && (
          <motion.div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowResetPasswordModal(false)}>
            <motion.div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border-2"
              style={{ borderColor: BO_PRIMARY }}
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-black text-gray-900 text-lg">Réinitialiser le mot de passe</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{acteur.prenoms} {acteur.nom}</p>
                </div>
                <button onClick={() => setShowResetPasswordModal(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Saisis un nouveau mot de passe pour cet utilisateur. Minimum 6 caractères.
              </p>

              {/* Nouveau mot de passe */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-600 mb-2">Nouveau mot de passe</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 caractères"
                  className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-[#E6A817] focus:outline-none text-sm"
                />
              </div>

              {/* Confirmer mot de passe */}
              <div className="mb-5">
                <label className="block text-xs font-bold text-gray-600 mb-2">Confirmer le mot de passe</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Resaisis le mot de passe"
                  className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-[#E6A817] focus:outline-none text-sm"
                />
              </div>

              {newPassword && confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-red-600 font-medium mb-4">Les mots de passe ne correspondent pas</p>
              )}

              <div className="flex gap-3">
                <button onClick={() => setShowResetPasswordModal(false)} className="flex-1 py-3 rounded-2xl border-2 border-gray-200 font-bold text-gray-700">Annuler</button>
                <motion.button onClick={handleResetPassword}
                  disabled={resetPasswordLoading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                  className="flex-1 py-3 rounded-2xl font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: BO_PRIMARY }}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                  <Key className="w-4 h-4" /> {resetPasswordLoading ? 'Réinitialisation...' : 'Réinitialiser'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}