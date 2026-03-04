import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FileText, Search, Download, Shield, User, MapPin, Clock, Filter } from 'lucide-react';
import { useBackOffice, BORoleType } from '../../contexts/BackOfficeContext';
import { toast } from 'sonner';

const BO_PRIMARY = '#E6A817';
const BO_DARK = '#3B3C36';

const ROLE_COLORS: Record<BORoleType, string> = {
  super_admin: '#E6A817',
  admin_national: '#3B82F6',
  gestionnaire_zone: '#10B981',
  analyste: '#8B5CF6',
};

const ROLE_LABELS: Record<BORoleType, string> = {
  super_admin: 'Super Admin',
  admin_national: 'Admin National',
  gestionnaire_zone: 'Gestionnaire Zone',
  analyste: 'Analyste',
};

const MODULE_COLORS: Record<string, string> = {
  Acteurs: '#C66A2C',
  Enrôlement: '#2E8B57',
  Supervision: '#3B82F6',
  Commissions: BO_PRIMARY,
  Utilisateurs: '#8B5CF6',
  Zones: '#10B981',
};

export function BOAudit() {
  const { auditLogs } = useBackOffice();
  const [search, setSearch] = useState('');
  const [filterModule, setFilterModule] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const modules = [...new Set(auditLogs.map(l => l.module))];

  const filtered = auditLogs.filter(l => {
    const matchSearch = !search || `${l.action} ${l.utilisateurBO} ${l.acteurImpacte || ''}`.toLowerCase().includes(search.toLowerCase());
    const matchModule = filterModule === 'all' || l.module === filterModule;
    const matchRole = filterRole === 'all' || l.roleBO === filterRole;
    return matchSearch && matchModule && matchRole;
  });

  const handleExport = (fmt: string) => toast.success(`Export ${fmt} Audit & Logs — simulation`);

  return (
    <div className="px-4 lg:px-8 py-6 max-w-7xl mx-auto">

      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-gray-900">Audit & Logs</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} entrées • Historique immuable</p>
        </div>
        <div className="flex gap-2">
          {['CSV', 'Excel', 'PDF'].map(fmt => (
            <motion.button key={fmt} onClick={() => handleExport(fmt)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 border-gray-200 text-xs font-bold text-gray-600 bg-white"
              whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
              <Download className="w-3.5 h-3.5" />
              {fmt}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: 'Actions totales', value: auditLogs.length, color: BO_DARK },
          { label: 'Modules couverts', value: modules.length, color: BO_PRIMARY },
          { label: "Utilisateurs BO actifs", value: [...new Set(auditLogs.map(l => l.utilisateurBO))].length, color: '#10B981' },
        ].map((s, i) => (
          <motion.div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border-2 border-gray-100"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <p className="text-xs font-bold text-gray-500 mb-1">{s.label}</p>
            <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Barre de recherche */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Rechercher action, utilisateur, acteur..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-gray-200 focus:outline-none bg-white text-sm"
            style={{ borderColor: search ? BO_PRIMARY : undefined }} />
        </div>
        <select value={filterModule} onChange={e => setFilterModule(e.target.value)}
          className="px-4 py-3.5 rounded-2xl border-2 border-gray-200 bg-white text-sm font-semibold focus:outline-none"
          style={{ borderColor: filterModule !== 'all' ? BO_PRIMARY : undefined }}>
          <option value="all">Tous modules</option>
          {modules.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
          className="px-4 py-3.5 rounded-2xl border-2 border-gray-200 bg-white text-sm font-semibold focus:outline-none"
          style={{ borderColor: filterRole !== 'all' ? BO_PRIMARY : undefined }}>
          <option value="all">Tous rôles</option>
          <option value="super_admin">Super Admin</option>
          <option value="admin_national">Admin National</option>
          <option value="gestionnaire_zone">Gestionnaire Zone</option>
          <option value="analyste">Analyste</option>
        </select>
      </div>

      {/* Timeline logs */}
      <div className="space-y-3">
        {filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((log, index) => {
          const roleColor = ROLE_COLORS[log.roleBO] || BO_PRIMARY;
          const moduleColor = MODULE_COLORS[log.module] || BO_DARK;
          return (
            <motion.div key={log.id} className="bg-white rounded-2xl p-4 shadow-sm border-2 border-gray-100"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}
              whileHover={{ y: -2 }}>
              <div className="flex items-start gap-3 sm:gap-4">
                {/* Indicateur module */}
                <div className="w-1 h-full min-h-[50px] rounded-full flex-shrink-0" style={{ backgroundColor: moduleColor }} />

                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 text-sm">{log.action}</p>
                      {log.acteurImpacte && (
                        <p className="text-xs text-gray-500 mt-0.5">Acteur : {log.acteurImpacte}</p>
                      )}
                    </div>
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold flex-shrink-0 hidden sm:inline-block"
                      style={{ backgroundColor: `${moduleColor}20`, color: moduleColor }}>
                      {log.module}
                    </span>
                  </div>

                  {/* Badge module — mobile only */}
                  <span className="sm:hidden px-2 py-0.5 rounded-lg text-[10px] font-bold mb-2 inline-block"
                    style={{ backgroundColor: `${moduleColor}20`, color: moduleColor }}>
                    {log.module}
                  </span>

                  {/* Avant / Après */}
                  {(log.ancienneValeur || log.nouvelleValeur) && (
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {log.ancienneValeur && (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-red-50 text-red-600 line-through">{log.ancienneValeur}</span>
                      )}
                      {log.ancienneValeur && log.nouvelleValeur && <span className="text-gray-400 text-xs">→</span>}
                      {log.nouvelleValeur && (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-green-50 text-green-700">{log.nouvelleValeur}</span>
                      )}
                    </div>
                  )}

                  {/* Meta — flex-wrap sur mobile */}
                  <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: roleColor }}>
                        <User className="w-2.5 h-2.5 text-white" />
                      </div>
                      <span className="text-xs font-bold text-gray-700 truncate max-w-[120px] sm:max-w-none">{log.utilisateurBO}</span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-lg hidden sm:inline-block"
                        style={{ backgroundColor: `${roleColor}20`, color: roleColor }}>
                        {ROLE_LABELS[log.roleBO]}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-gray-400">
                      <Clock className="w-3 h-3 flex-shrink-0" />
                      <span className="hidden sm:inline">{new Date(log.date).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="sm:hidden">{new Date(log.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-1 text-[10px] text-gray-400">
                      <MapPin className="w-3 h-3" />
                      {log.ip}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <FileText className="w-16 h-16 mx-auto mb-3" />
            <p className="font-bold">Aucun log trouvé</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filtered.length > PAGE_SIZE && (
        <div className="flex items-center justify-between mt-6 pt-5 border-t-2 border-gray-100">
          <p className="text-sm text-gray-500 font-semibold">
            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} sur {filtered.length} entrées
          </p>
          <div className="flex items-center gap-2">
            <motion.button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-4 py-2 rounded-xl border-2 border-gray-200 font-bold text-sm text-gray-600 disabled:opacity-40 bg-white"
              whileHover={page > 1 ? { y: -2 } : {}} whileTap={{ scale: 0.97 }}>
              Préc.
            </motion.button>
            {Array.from({ length: Math.min(5, Math.ceil(filtered.length / PAGE_SIZE)) }, (_, i) => i + 1).map(p => (
              <motion.button key={p} onClick={() => setPage(p)}
                className="w-9 h-9 rounded-xl border-2 font-bold text-sm"
                style={{ backgroundColor: page === p ? BO_PRIMARY : 'white', color: page === p ? 'white' : '#374151', borderColor: page === p ? BO_PRIMARY : '#e5e7eb' }}
                whileTap={{ scale: 0.97 }}>
                {p}
              </motion.button>
            ))}
            <motion.button onClick={() => setPage(p => Math.min(Math.ceil(filtered.length / PAGE_SIZE), p + 1))} disabled={page >= Math.ceil(filtered.length / PAGE_SIZE)}
              className="px-4 py-2 rounded-xl border-2 border-gray-200 font-bold text-sm text-gray-600 disabled:opacity-40 bg-white"
              whileHover={page < Math.ceil(filtered.length / PAGE_SIZE) ? { y: -2 } : {}} whileTap={{ scale: 0.97 }}>
              Suiv.
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}