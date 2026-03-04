import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  User, Mail, Shield, MapPin, Clock, Key, Bell,
  Moon, Globe, Save, Eye, EyeOff, CheckCircle2, Volume2,
} from 'lucide-react';
import { useBackOffice, BORoleType } from '../../contexts/BackOfficeContext';
import { toast } from 'sonner';

const BO_PRIMARY = '#E6A817';
const BO_DARK = '#3B3C36';

const ROLE_LABELS: Record<BORoleType, string> = {
  super_admin: 'Super Administrateur',
  admin_national: 'Admin National',
  gestionnaire_zone: 'Gestionnaire de Zone',
  analyste: 'Analyste / Observateur',
};

const ROLE_COLORS: Record<BORoleType, string> = {
  super_admin: '#E6A817',
  admin_national: '#3B82F6',
  gestionnaire_zone: '#10B981',
  analyste: '#8B5CF6',
};

export function BOProfil() {
  const { boUser, auditLogs } = useBackOffice();
  const [showPassword, setShowPassword] = useState(false);
  const [notifications, setNotifications] = useState({ alertes: true, dossiers: true, commissions: false, rapports: true });
  const [langue, setLangue] = useState('fr');
  const [mdpForm, setMdpForm] = useState({ actuel: '', nouveau: '', confirmation: '' });

  if (!boUser) return null;

  const roleColor = ROLE_COLORS[boUser.role];
  const myLogs = auditLogs.filter(l => l.utilisateurBO.includes(boUser.nom));

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'fr-FR'; u.rate = 0.9;
      window.speechSynthesis.speak(u);
    }
  };

  const handleChangeMDP = (e: React.FormEvent) => {
    e.preventDefault();
    if (mdpForm.nouveau !== mdpForm.confirmation) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    if (mdpForm.nouveau.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    toast.success('Mot de passe modifié avec succès');
    setMdpForm({ actuel: '', nouveau: '', confirmation: '' });
  };

  return (
    <div className="px-4 lg:px-8 py-6 max-w-4xl mx-auto">

      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-black text-gray-900">Mon Profil</h1>
        <p className="text-sm text-gray-500 mt-0.5">Compte administrateur Back-Office</p>
      </motion.div>

      {/* Card identité */}
      <motion.div className="bg-white rounded-3xl p-6 shadow-md border-2 border-gray-100 mb-6"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-5 mb-6">
          <motion.div
            className="w-20 h-20 rounded-3xl flex items-center justify-center text-white font-black text-2xl shadow-lg flex-shrink-0"
            style={{ backgroundColor: roleColor }}
            animate={{ rotate: [0, 3, -3, 0] }}
            transition={{ duration: 4, repeat: Infinity }}>
            {boUser.prenom.charAt(0)}{boUser.nom.charAt(0)}
          </motion.div>
          <div className="flex-1">
            <h2 className="text-xl font-black text-gray-900">{boUser.prenom} {boUser.nom}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                style={{ backgroundColor: `${roleColor}20`, color: roleColor }}>
                <Shield className="w-3.5 h-3.5" />
                {ROLE_LABELS[boUser.role]}
              </span>
              <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Connecté
              </span>
            </div>
            <div className="flex flex-wrap gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <Mail className="w-4 h-4 text-gray-400" />
                {boUser.email}
              </div>
              {boUser.region && (
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {boUser.region}
                </div>
              )}
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <Clock className="w-4 h-4 text-gray-400" />
                Dernière connexion : {new Date(boUser.lastLogin).toLocaleString('fr-FR')}
              </div>
            </div>
          </div>
          <motion.button
            onClick={() => speak(`Bonjour ${boUser.prenom}. Vous êtes connecté en tant que ${ROLE_LABELS[boUser.role]} sur le Back-Office Julaba.`)}
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0"
            style={{ backgroundColor: BO_PRIMARY }}
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Volume2 className="w-6 h-6 text-white" />
          </motion.button>
        </div>

        {/* Stats personnelles */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Actions réalisées', value: myLogs.length || 3, color: roleColor },
            { label: 'Modules accessibles', value: Object.values({ a: 'acteurs.read', b: 'supervision.read', c: 'zones.read', d: 'commissions.read', e: 'audit.read' }).filter(() => true).length, color: '#10B981' },
            { label: 'Jours actif', value: 47, color: '#3B82F6' },
          ].map(s => (
            <div key={s.label} className="bg-gray-50 rounded-2xl p-4 border-2 border-gray-100 text-center">
              <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs font-semibold text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Changer mot de passe */}
        <motion.div className="bg-white rounded-3xl p-6 shadow-md border-2 border-gray-100"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="font-black text-gray-900 text-lg mb-5 flex items-center gap-2">
            <Key className="w-5 h-5" style={{ color: BO_PRIMARY }} />
            Changer le mot de passe
          </h2>
          <form onSubmit={handleChangeMDP} className="space-y-4">
            {[
              { key: 'actuel', label: 'Mot de passe actuel' },
              { key: 'nouveau', label: 'Nouveau mot de passe' },
              { key: 'confirmation', label: 'Confirmer le nouveau' },
            ].map(field => (
              <div key={field.key}>
                <label className="block text-sm font-bold text-gray-700 mb-1">{field.label}</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={(mdpForm as any)[field.key]}
                    onChange={e => setMdpForm(p => ({ ...p, [field.key]: e.target.value }))}
                    className="w-full px-4 py-3 pr-10 rounded-2xl border-2 border-gray-200 focus:border-[#E6A817] focus:outline-none text-sm"
                    placeholder="••••••••"
                  />
                  {field.key === 'confirmation' && (
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2">
                      {showPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                    </button>
                  )}
                </div>
              </div>
            ))}
            <motion.button type="submit"
              className="w-full py-3 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
              style={{ backgroundColor: BO_PRIMARY }}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Save className="w-4 h-4" />
              Mettre à jour
            </motion.button>
          </form>
        </motion.div>

        {/* Préférences & Notifications */}
        <motion.div className="bg-white rounded-3xl p-6 shadow-md border-2 border-gray-100"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <h2 className="font-black text-gray-900 text-lg mb-5 flex items-center gap-2">
            <Bell className="w-5 h-5" style={{ color: BO_PRIMARY }} />
            Notifications & Préférences
          </h2>

          <div className="space-y-4">
            {[
              { key: 'alertes', label: 'Alertes critiques', desc: 'Fraudes, anomalies, suspensions' },
              { key: 'dossiers', label: 'Nouveaux dossiers', desc: 'Dossiers en attente de validation' },
              { key: 'commissions', label: 'Paiements commissions', desc: 'Commissions à valider et payer' },
              { key: 'rapports', label: 'Rapports hebdomadaires', desc: 'Synthèse nationale chaque lundi' },
            ].map(notif => (
              <div key={notif.key} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border-2 border-gray-100">
                <div>
                  <p className="text-sm font-bold text-gray-900">{notif.label}</p>
                  <p className="text-xs text-gray-500">{notif.desc}</p>
                </div>
                <motion.button
                  onClick={() => setNotifications(p => ({ ...p, [notif.key]: !(p as any)[notif.key] }))}
                  className={`w-12 h-6 rounded-full transition-all relative flex-shrink-0 ${(notifications as any)[notif.key] ? '' : 'bg-gray-300'}`}
                  style={{ backgroundColor: (notifications as any)[notif.key] ? BO_PRIMARY : undefined }}
                  whileTap={{ scale: 0.95 }}>
                  <motion.div
                    className="w-5 h-5 bg-white rounded-full shadow-md absolute top-0.5"
                    animate={{ left: (notifications as any)[notif.key] ? '26px' : '2px' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </motion.button>
              </div>
            ))}

            <div className="pt-2">
              <p className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4" style={{ color: BO_PRIMARY }} />
                Langue interface
              </p>
              <div className="flex gap-2">
                {[{ code: 'fr', label: 'Français' }, { code: 'en', label: 'English' }].map(l => (
                  <motion.button key={l.code} onClick={() => setLangue(l.code)}
                    className="flex-1 py-2.5 rounded-2xl font-bold text-sm border-2 transition-all"
                    style={{
                      backgroundColor: langue === l.code ? BO_PRIMARY : 'transparent',
                      color: langue === l.code ? 'white' : '#374151',
                      borderColor: langue === l.code ? BO_PRIMARY : '#e5e7eb',
                    }}
                    whileHover={langue !== l.code ? { y: -2 } : {}} whileTap={{ scale: 0.97 }}>
                    {l.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Mes dernières actions */}
      {myLogs.length > 0 && (
        <motion.div className="bg-white rounded-3xl p-6 shadow-md border-2 border-gray-100 mt-6"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="font-black text-gray-900 text-lg mb-4">Mes dernières actions</h2>
          <div className="space-y-3">
            {myLogs.slice(0, 5).map(log => (
              <div key={log.id} className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border-2 border-gray-100">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: roleColor }} />
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">{log.action}</p>
                  {log.acteurImpacte && <p className="text-xs text-gray-500">{log.acteurImpacte}</p>}
                </div>
                <span className="text-xs text-gray-400">{new Date(log.date).toLocaleDateString('fr-FR')}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
