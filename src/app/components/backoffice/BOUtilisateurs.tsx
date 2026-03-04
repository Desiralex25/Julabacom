import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield, UserPlus, Edit2, UserX, RotateCcw, Eye, EyeOff,
  Mail, Key, Check, X, ChevronDown, ChevronUp, Save,
  Crown, Globe, MapPin, BarChart3,
} from 'lucide-react';
import { useBackOffice, BOUser, BORoleType, PERMISSIONS } from '../../contexts/BackOfficeContext';
import { toast } from 'sonner';

const BO_PRIMARY = '#E6A817';
const BO_DARK = '#3B3C36';

const ROLE_CONFIG: Record<BORoleType, { label: string; color: string; icon: any; desc: string }> = {
  super_admin: {
    label: 'Super Administrateur',
    color: '#E6A817',
    icon: Crown,
    desc: 'Accès total — toutes les fonctions du Back-Office',
  },
  admin_national: {
    label: 'Admin National',
    color: '#3B82F6',
    icon: Globe,
    desc: 'Gestion nationale — validation, enrôlement, supervision',
  },
  gestionnaire_zone: {
    label: 'Gestionnaire de Zone',
    color: '#10B981',
    icon: MapPin,
    desc: 'Gestion régionale — acteurs et identificateurs d\'une zone',
  },
  analyste: {
    label: 'Analyste / Observateur',
    color: '#8B5CF6',
    icon: BarChart3,
    desc: 'Lecture seule — statistiques et rapports',
  },
};

const REGIONS = ['National', 'Abidjan', 'Bouaké', 'Yamoussoukro', 'Korhogo', 'San Pédro', 'Man', 'Daloa'];

const PERMISSION_LABELS: Record<string, string> = {
  'acteurs.read': 'Voir acteurs',
  'acteurs.write': 'Modifier acteurs',
  'acteurs.delete': 'Supprimer acteurs',
  'acteurs.suspend': 'Suspendre acteurs',
  'enrolement.read': 'Voir enrôlement',
  'enrolement.write': 'Modifier enrôlement',
  'enrolement.validate': 'Valider dossiers',
  'supervision.read': 'Voir transactions',
  'supervision.write': 'Modifier transactions',
  'supervision.freeze': 'Geler transactions',
  'zones.read': 'Voir zones',
  'zones.write': 'Modifier zones',
  'commissions.read': 'Voir commissions',
  'commissions.write': 'Modifier commissions',
  'commissions.pay': 'Payer commissions',
  'academy.read': 'Voir Academy',
  'academy.write': 'Gérer Academy',
  'missions.read': 'Voir missions',
  'missions.write': 'Gérer missions',
  'parametres.read': 'Voir paramètres',
  'parametres.write': 'Modifier paramètres',
  'audit.read': 'Voir Audit & Logs',
  'utilisateurs.read': 'Voir utilisateurs BO',
  'utilisateurs.write': 'Créer utilisateurs BO',
  'utilisateurs.delete': 'Supprimer utilisateurs BO',
};

function RoleBadge({ role }: { role: BORoleType }) {
  const conf = ROLE_CONFIG[role];
  const Icon = conf.icon;
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
      style={{ backgroundColor: `${conf.color}20`, color: conf.color }}>
      <Icon className="w-3.5 h-3.5" />
      {conf.label}
    </span>
  );
}

export function BOUtilisateurs() {
  const { boUsers, boUser, hasPermission, addBOUser, addAuditLog } = useBackOffice();
  const [showCreate, setShowCreate] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [localUsers, setLocalUsers] = useState(boUsers);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRolePreview, setSelectedRolePreview] = useState<BORoleType>('admin_national');

  const [form, setForm] = useState({
    prenom: '', nom: '', email: '',
    role: 'admin_national' as BORoleType,
    region: 'National',
    password: '',
    actif: true,
  });

  const canCreate = hasPermission('utilisateurs.write');
  const canDelete = hasPermission('utilisateurs.delete');

  const handleToggleActif = (id: string) => {
    setLocalUsers(prev => prev.map(u => {
      if (u.id !== id) return u;
      const newActif = !u.actif;
      if (boUser) {
        addAuditLog({
          action: newActif ? 'RÉACTIVATION utilisateur BO' : 'DÉSACTIVATION utilisateur BO',
          utilisateurBO: `${boUser.prenom} ${boUser.nom}`,
          roleBO: boUser.role,
          acteurImpacte: `${u.prenom} ${u.nom}`,
          ancienneValeur: u.actif ? 'actif' : 'inactif',
          nouvelleValeur: newActif ? 'actif' : 'inactif',
          ip: '127.0.0.1',
          module: 'Utilisateurs',
        });
      }
      return { ...u, actif: newActif };
    }));
    toast.success('Statut mis à jour');
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.prenom || !form.nom || !form.email || !form.password) {
      toast.error('Tous les champs obligatoires doivent être remplis');
      return;
    }
    addBOUser({ prenom: form.prenom, nom: form.nom, email: form.email, role: form.role, region: form.region, actif: true });
    toast.success(`Compte créé pour ${form.prenom} ${form.nom}`);
    setForm({ prenom: '', nom: '', email: '', role: 'admin_national', region: 'National', password: '', actif: true });
    setShowCreate(false);
  };

  return (
    <div className="px-4 lg:px-8 py-6 max-w-7xl mx-auto">

      {/* Header */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
        className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-gray-900">Utilisateurs Back-Office</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gestion des accès RBAC — {localUsers.length} comptes</p>
        </div>
        {canCreate && (
          <motion.button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl text-white font-bold shadow-lg"
            style={{ backgroundColor: BO_PRIMARY }}
            whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
            <UserPlus className="w-5 h-5" />
            <span className="hidden sm:inline">Nouvel utilisateur</span>
          </motion.button>
        )}
      </motion.div>

      {/* Stats rôles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {(Object.entries(ROLE_CONFIG) as [BORoleType, typeof ROLE_CONFIG[BORoleType]][]).map(([role, conf], i) => {
          const Icon = conf.icon;
          const count = localUsers.filter(u => u.role === role).length;
          return (
            <motion.div key={role} className="bg-white rounded-2xl p-4 shadow-sm border-2 border-gray-100"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              whileHover={{ y: -3 }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${conf.color}20` }}>
                  <Icon className="w-4 h-4" style={{ color: conf.color }} />
                </div>
              </div>
              <p className="text-2xl font-black text-gray-900">{count}</p>
              <p className="text-xs font-bold text-gray-500 mt-0.5">{conf.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Matrice permissions (lecture) */}
      <motion.div className="bg-white rounded-3xl p-5 shadow-md border-2 border-gray-100 mb-6"
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h2 className="font-black text-gray-900 mb-4">Matrice des permissions par rôle</h2>
        <div className="flex gap-2 mb-4 flex-wrap">
          {(Object.keys(ROLE_CONFIG) as BORoleType[]).map(role => {
            const conf = ROLE_CONFIG[role];
            const Icon = conf.icon;
            return (
              <motion.button key={role} onClick={() => setSelectedRolePreview(role)}
                className="flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-sm border-2 transition-all"
                style={{
                  backgroundColor: selectedRolePreview === role ? conf.color : 'transparent',
                  color: selectedRolePreview === role ? 'white' : '#374151',
                  borderColor: selectedRolePreview === role ? conf.color : '#e5e7eb',
                }}
                whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{conf.label}</span>
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={selectedRolePreview}
            initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="bg-gray-50 rounded-2xl p-4 border-2 border-gray-100 mb-3">
              <p className="text-sm text-gray-600 font-semibold">{ROLE_CONFIG[selectedRolePreview].desc}</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
              {Object.keys(PERMISSION_LABELS).map(perm => {
                const has = PERMISSIONS[selectedRolePreview]?.includes(perm);
                return (
                  <div key={perm} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border ${has ? 'bg-green-50 border-green-200 text-green-800' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                    {has
                      ? <Check className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                      : <X className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                    }
                    {PERMISSION_LABELS[perm]}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Liste utilisateurs */}
      <div className="space-y-3">
        {localUsers.map((user, index) => {
          const conf = ROLE_CONFIG[user.role];
          const Icon = conf.icon;
          const isExpanded = expanded === user.id;
          const isCurrentUser = boUser?.id === user.id;

          return (
            <motion.div key={user.id}
              className={`bg-white rounded-2xl shadow-sm border-2 overflow-hidden ${isCurrentUser ? 'border-[#E6A817]' : 'border-gray-100'}`}
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}
              layout>
              <div className="p-4">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: conf.color }}>
                    {user.prenom.charAt(0)}{user.nom.charAt(0)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-gray-900">{user.prenom} {user.nom}</p>
                          {isCurrentUser && (
                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#E6A817]/20 text-[#E6A817]">Vous</span>
                          )}
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${user.actif ? 'bg-green-500' : 'bg-gray-300'}`} />
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                      </div>
                      <RoleBadge role={user.role} />
                    </div>

                    <div className="flex items-center gap-4 mt-2">
                      {user.region && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <MapPin className="w-3 h-3" />
                          {user.region}
                        </div>
                      )}
                      <div className="text-xs text-gray-400">
                        Dernière connexion : {new Date(user.lastLogin).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {canDelete && !isCurrentUser && (
                      <motion.button onClick={() => handleToggleActif(user.id)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center border-2 transition-colors ${user.actif ? 'border-red-200 hover:bg-red-50' : 'border-green-200 hover:bg-green-50'}`}
                        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        title={user.actif ? 'Désactiver' : 'Réactiver'}>
                        {user.actif
                          ? <UserX className="w-4 h-4 text-red-500" />
                          : <RotateCcw className="w-4 h-4 text-green-500" />
                        }
                      </motion.button>
                    )}
                    <motion.button onClick={() => setExpanded(isExpanded ? null : user.id)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center border-2 border-gray-200 bg-gray-50"
                      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-600" /> : <ChevronDown className="w-4 h-4 text-gray-600" />}
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Détail permissions */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden">
                    <div className="px-4 pb-4 border-t-2 border-gray-100 pt-4">
                      <p className="text-xs font-bold text-gray-600 mb-3">Permissions accordées</p>
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-1.5">
                        {PERMISSIONS[user.role]?.map(perm => (
                          <div key={perm} className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-green-50 border border-green-200">
                            <Check className="w-3 h-3 text-green-600 flex-shrink-0" />
                            <span className="text-[10px] font-semibold text-green-800">{PERMISSION_LABELS[perm] || perm}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Modal création */}
      <AnimatePresence>
        {showCreate && (
          <motion.div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowCreate(false)}>
            <motion.div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border-2 max-h-[90vh] overflow-y-auto"
              style={{ borderColor: BO_PRIMARY }}
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-black text-gray-900 text-xl">Nouvel utilisateur BO</h2>
                  <p className="text-sm text-gray-500">Accès Back-Office Central</p>
                </div>
                <button onClick={() => setShowCreate(false)}
                  className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Prénom *</label>
                    <input value={form.prenom} onChange={e => setForm(p => ({ ...p, prenom: e.target.value }))} required
                      className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-[#E6A817] focus:outline-none text-sm" placeholder="Jean" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Nom *</label>
                    <input value={form.nom} onChange={e => setForm(p => ({ ...p, nom: e.target.value }))} required
                      className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-[#E6A817] focus:outline-none text-sm" placeholder="KOUASSI" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-[#E6A817] focus:outline-none text-sm" placeholder="utilisateur@julaba.ci" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Mot de passe provisoire *</label>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required
                      className="w-full pl-10 pr-12 py-3 rounded-2xl border-2 border-gray-200 focus:border-[#E6A817] focus:outline-none text-sm" placeholder="••••••••" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2">
                      {showPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                    </button>
                  </div>
                </div>

                {/* Sélection rôle */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Rôle *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.entries(ROLE_CONFIG) as [BORoleType, typeof ROLE_CONFIG[BORoleType]][]).map(([role, conf]) => {
                      const Icon = conf.icon;
                      const selected = form.role === role;
                      return (
                        <motion.button type="button" key={role} onClick={() => setForm(p => ({ ...p, role }))}
                          className="p-3 rounded-2xl border-2 text-left transition-all"
                          style={{
                            borderColor: selected ? conf.color : '#e5e7eb',
                            backgroundColor: selected ? `${conf.color}10` : 'transparent',
                          }}
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className="w-4 h-4" style={{ color: conf.color }} />
                            {selected && <Check className="w-3.5 h-3.5 ml-auto" style={{ color: conf.color }} />}
                          </div>
                          <p className="text-xs font-bold text-gray-900">{conf.label}</p>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Région */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Région d'affectation</label>
                  <select value={form.region} onChange={e => setForm(p => ({ ...p, region: e.target.value }))}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-[#E6A817] focus:outline-none text-sm">
                    {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                {/* Permissions preview */}
                <div className="bg-gray-50 rounded-2xl p-4 border-2 border-gray-100">
                  <p className="text-xs font-bold text-gray-600 mb-2">Permissions accordées automatiquement ({PERMISSIONS[form.role]?.length})</p>
                  <p className="text-xs text-gray-500">{ROLE_CONFIG[form.role].desc}</p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowCreate(false)}
                    className="flex-1 py-3.5 rounded-2xl border-2 border-gray-200 font-bold text-gray-700">
                    Annuler
                  </button>
                  <motion.button type="submit"
                    className="flex-1 py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
                    style={{ backgroundColor: BO_PRIMARY }}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                    <Save className="w-5 h-5" />
                    Créer le compte
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
