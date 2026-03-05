import React, { useState } from 'react';
import { matchesSearch } from '../../utils/searchUtils';
import { motion, AnimatePresence } from 'motion/react';
import {
  History,
  Search,
  Filter,
  Download,
  Eye,
  User,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  Clock,
  Calendar,
  X,
  Check,
} from 'lucide-react';
import { useInstitution } from '../../contexts/InstitutionContext';
import { useAudit } from '../../contexts/AuditContext';
import { Card } from '../ui/card';
import { Input } from '../ui/input';

const INSTITUTION_COLOR = '#712864';

type FiltreAction = 'tout' | 'vente' | 'recolte' | 'transaction' | 'membre' | 'identification';
type FiltreRole = 'tout' | 'marchand' | 'producteur' | 'cooperative' | 'identificateur' | 'institution';

export function AuditTrail() {
  const { getHistoriqueComplet } = useInstitution();
  const { logs } = useAudit();

  const [searchTerm, setSearchTerm] = useState('');
  const [filtreAction, setFiltreAction] = useState<FiltreAction>('tout');
  const [filtreRole, setFiltreRole] = useState<FiltreRole>('tout');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [logSelectionne, setLogSelectionne] = useState<any>(null);

  // Combiner les logs du AuditContext
  const historique = logs || [];

  // Filtrer l'historique
  const historiqueFiltré = historique.filter(log => {
    // Filtre recherche
    const searchLower = searchTerm.toLowerCase();
    const matchSearch =
      log.action.toLowerCase().includes(searchLower) ||
      log.details?.toLowerCase().includes(searchLower) ||
      log.userId?.toLowerCase().includes(searchLower);

    if (!matchSearch) return false;

    // Filtre action
    if (filtreAction !== 'tout') {
      const actionType = log.action.toLowerCase();
      if (filtreAction === 'vente' && !actionType.includes('vente')) return false;
      if (filtreAction === 'recolte' && !actionType.includes('recolte')) return false;
      if (filtreAction === 'transaction' && !actionType.includes('transaction')) return false;
      if (filtreAction === 'membre' && !actionType.includes('membre')) return false;
      if (filtreAction === 'identification' && !actionType.includes('identification')) return false;
    }

    // Filtre rôle
    if (filtreRole !== 'tout' && log.role !== filtreRole) return false;

    return true;
  });

  const getIconeAction = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('vente')) return <ShoppingCart className="w-4 h-4" />;
    if (actionLower.includes('recolte')) return <Package className="w-4 h-4" />;
    if (actionLower.includes('transaction')) return <TrendingUp className="w-4 h-4" />;
    if (actionLower.includes('membre')) return <Users className="w-4 h-4" />;
    if (actionLower.includes('identification')) return <User className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  const getCouleurRole = (role: string) => {
    const rolesColors: Record<string, string> = {
      marchand: '#C66A2C',
      producteur: '#2E8B57',
      cooperative: '#2072AF',
      identificateur: '#9F8170',
      institution: '#712864',
    };
    return rolesColors[role] || '#6B7280';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const aujourdhui = new Date();
    const hier = new Date(aujourdhui);
    hier.setDate(hier.getDate() - 1);

    if (date.toDateString() === aujourdhui.toDateString()) {
      return `Aujourd'hui, ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === hier.toDateString()) {
      return `Hier, ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  const handleVoirDetail = (log: any) => {
    setLogSelectionne(log);
    setShowDetailModal(true);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <History className="w-8 h-8" style={{ color: INSTITUTION_COLOR }} />
              Audit Trail
            </h1>
            <p className="text-gray-500 mt-1">Historique complet des actions JULABA</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white font-medium shadow-lg"
            style={{ backgroundColor: INSTITUTION_COLOR }}
          >
            <Download className="w-5 h-5" />
            Exporter
          </motion.button>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-sm text-gray-500 mb-1">Total événements</p>
            <p className="text-2xl font-bold text-gray-900">{historique.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-500 mb-1">Aujourd'hui</p>
            <p className="text-2xl font-bold text-gray-900">
              {historique.filter(log => {
                const date = new Date(log.timestamp);
                return date.toDateString() === new Date().toDateString();
              }).length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-500 mb-1">Cette semaine</p>
            <p className="text-2xl font-bold text-gray-900">
              {historique.filter(log => {
                const date = new Date(log.timestamp);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return date >= weekAgo;
              }).length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-500 mb-1">Utilisateurs actifs</p>
            <p className="text-2xl font-bold text-gray-900">
              {new Set(historique.map(log => log.userId)).size}
            </p>
          </Card>
        </div>

        {/* Recherche */}
        <Card className="p-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher dans l'historique..."
              className="pl-12 h-12 rounded-xl border-2 border-gray-200 focus:border-purple-500"
            />
          </div>
        </Card>

        {/* Filtres */}
        <div className="space-y-3">
          {/* Filtres Action */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Type d'action</p>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {(['tout', 'vente', 'recolte', 'transaction', 'membre', 'identification'] as FiltreAction[]).map(action => (
                <motion.button
                  key={action}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFiltreAction(action)}
                  className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border-2"
                  style={{
                    backgroundColor: filtreAction === action ? INSTITUTION_COLOR : 'white',
                    color: filtreAction === action ? 'white' : INSTITUTION_COLOR,
                    borderColor: INSTITUTION_COLOR,
                  }}
                >
                  {action.charAt(0).toUpperCase() + action.slice(1)}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Filtres Rôle */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Rôle</p>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {(['tout', 'marchand', 'producteur', 'cooperative', 'identificateur', 'institution'] as FiltreRole[]).map(role => (
                <motion.button
                  key={role}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFiltreRole(role)}
                  className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border-2"
                  style={{
                    backgroundColor: filtreRole === role ? getCouleurRole(role) : 'white',
                    color: filtreRole === role ? 'white' : getCouleurRole(role),
                    borderColor: getCouleurRole(role),
                  }}
                >
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Liste de l'historique */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Événements ({historiqueFiltré.length})
            </h2>
          </div>

          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {historiqueFiltré.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-12"
                >
                  <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Aucun événement trouvé</p>
                </motion.div>
              ) : (
                historiqueFiltré.map((log, index) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.02 }}
                    onClick={() => handleVoirDetail(log)}
                    className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100"
                  >
                    <div className="flex items-start gap-3">
                      {/* Icône */}
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0"
                        style={{ backgroundColor: getCouleurRole(log.role) }}
                      >
                        {getIconeAction(log.action)}
                      </div>

                      {/* Infos */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{log.action}</h3>
                            {log.details && (
                              <p className="text-sm text-gray-600 mt-0.5">{log.details}</p>
                            )}
                          </div>
                          <span
                            className="px-2 py-1 rounded-full text-xs font-medium flex-shrink-0"
                            style={{
                              backgroundColor: `${getCouleurRole(log.role)}20`,
                              color: getCouleurRole(log.role),
                            }}
                          >
                            {log.role}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {log.userId || 'Système'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(log.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Modal Détail */}
      <AnimatePresence>
        {showDetailModal && logSelectionne && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center px-4"
            onClick={() => setShowDetailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div
                className="px-6 py-4 text-white"
                style={{ backgroundColor: getCouleurRole(logSelectionne.role) }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Détails de l'événement</h3>
                  <motion.button
                    onClick={() => setShowDetailModal(false)}
                    whileHover={{ rotate: 90 }}
                    className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Détails */}
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Action</p>
                  <p className="font-bold text-gray-900 text-lg">{logSelectionne.action}</p>
                </div>

                {logSelectionne.details && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Détails</p>
                    <p className="text-gray-700">{logSelectionne.details}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Rôle</p>
                    <span
                      className="inline-block px-3 py-1 rounded-full text-sm font-medium"
                      style={{
                        backgroundColor: `${getCouleurRole(logSelectionne.role)}20`,
                        color: getCouleurRole(logSelectionne.role),
                      }}
                    >
                      {logSelectionne.role}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Utilisateur</p>
                    <p className="font-semibold text-gray-900">{logSelectionne.userId || 'Système'}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Date et heure</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(logSelectionne.timestamp).toLocaleString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </p>
                </div>

                {logSelectionne.metadata && Object.keys(logSelectionne.metadata).length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Métadonnées</p>
                    <div className="bg-gray-50 rounded-xl p-3 text-sm font-mono">
                      <pre className="whitespace-pre-wrap break-words">
                        {JSON.stringify(logSelectionne.metadata, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}