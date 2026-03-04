/**
 * JULABA — Panel Notifications Unifié v2
 * Utilisé par TOUS les profils. Priorité visuelle critique/high/medium/low.
 * Mobile : swipe gauche pour marquer lu. Web : dropdown scrollable.
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'motion/react';
import {
  Bell,
  X,
  CheckCircle,
  ShoppingCart,
  CreditCard,
  Package,
  AlertTriangle,
  Users,
  FileText,
  TrendingDown,
  TrendingUp,
  Shield,
  Zap,
  Info,
  Star,
  Trash2,
  Check,
} from 'lucide-react';
import {
  useNotifications,
  JulabaNotification,
  NotifType,
  NotifPriority,
  PRIORITY_CONFIG,
} from '../../contexts/NotificationsContext';

// ============================================================
// ICÔNE PAR TYPE
// ============================================================

function getIcon(type: NotifType) {
  const cls = 'w-5 h-5';
  switch (type) {
    case 'commande_recue':
    case 'nouvelle_commande':
    case 'commande_groupee_validee':
      return <ShoppingCart className={cls} />;
    case 'paiement_valide':
    case 'paiement_recu':
    case 'paiement_collectif':
    case 'contribution_recue':
      return <CreditCard className={cls} />;
    case 'paiement_echoue':
      return <TrendingDown className={cls} />;
    case 'stock_faible':
    case 'offre_expiree':
      return <Package className={cls} />;
    case 'document_valide':
    case 'dossier_valide':
    case 'objectif_atteint':
    case 'reactivation':
      return <CheckCircle className={cls} />;
    case 'dossier_rejete':
    case 'suspension':
      return <AlertTriangle className={cls} />;
    case 'dossier_assigne':
    case 'dossier_en_attente':
      return <FileText className={cls} />;
    case 'membre_ajoute':
    case 'nouveau_identificateur':
      return <Users className={cls} />;
    case 'distribution_prete':
    case 'recolte_proche':
      return <TrendingUp className={cls} />;
    case 'pic_transaction':
    case 'anomalie_systeme':
      return <Zap className={cls} />;
    case 'alerte_fraude':
    case 'tentative_acces':
    case 'modification_critique':
      return <Shield className={cls} />;
    case 'evaluation_recue':
      return <Star className={cls} />;
    case 'creation_acteur':
    case 'baisse_activite':
    case 'info':
    case 'systeme':
    default:
      return <Info className={cls} />;
  }
}

function getPriorityIconColor(priority: NotifPriority): string {
  switch (priority) {
    case 'critical': return 'text-red-600';
    case 'high': return 'text-orange-500';
    case 'medium': return 'text-amber-500';
    case 'low': return 'text-blue-500';
  }
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return 'À l\'instant';
  if (minutes < 60) return `Il y a ${minutes} min`;
  if (hours < 24) return `Il y a ${hours}h`;
  if (days === 1) return 'Hier';
  return `Il y a ${days} jours`;
}

// ============================================================
// CARTE NOTIFICATION AVEC SWIPE
// ============================================================

interface NotifCardProps {
  notif: JulabaNotification;
  accentColor: string;
  onMarkAsRead: () => void;
  onDelete: () => void;
}

function NotifCard({ notif, accentColor, onMarkAsRead, onDelete }: NotifCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [swiped, setSwiped] = useState(false);
  const cfg = PRIORITY_CONFIG[notif.priority];

  const shortMessage = notif.message.length > 100
    ? notif.message.slice(0, 100) + '...'
    : notif.message;

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x < -80 && !notif.isRead) {
      setSwiped(true);
      setTimeout(() => {
        onMarkAsRead();
        setSwiped(false);
      }, 300);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: swiped ? 0.4 : 1, y: 0, x: swiped ? -60 : 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      className="relative overflow-hidden mb-3"
    >
      {/* Fond rouge visible au swipe */}
      <div className="absolute inset-y-0 right-0 w-20 flex items-center justify-center bg-green-500 rounded-3xl">
        <Check className="w-5 h-5 text-white" />
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: -100, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        className={`rounded-3xl border-2 p-4 cursor-grab active:cursor-grabbing transition-colors ${
          notif.isRead
            ? `${cfg.bgRead} border-gray-200`
            : `${cfg.bgUnread} ${cfg.border}`
        }`}
      >
        {/* Barre priorité critique */}
        {notif.priority === 'critical' && !notif.isRead && (
          <motion.div
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-full h-1 rounded-full bg-red-500 mb-3"
          />
        )}

        <div className="flex items-start gap-3">
          {/* Icône + Dot non lu */}
          <div className="relative flex-shrink-0 mt-0.5">
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center ${
              notif.isRead ? 'bg-gray-100' : `bg-white shadow-sm`
            } ${getPriorityIconColor(notif.priority)}`}>
              {getIcon(notif.type)}
            </div>
            {!notif.isRead && (
              <motion.span
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${cfg.dot}`}
              />
            )}
          </div>

          {/* Contenu */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-bold text-gray-900 text-sm leading-tight">{notif.title}</span>
              {!notif.isRead && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${cfg.badge}`}>
                  {cfg.label}
                </span>
              )}
            </div>

            <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
              {expanded ? notif.message : shortMessage}
            </p>

            {notif.message.length > 100 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-xs font-bold mt-1"
                style={{ color: accentColor }}
              >
                {expanded ? 'Réduire' : 'Lire tout'}
              </button>
            )}

            {/* Metadata : raisons rejet */}
            {notif.metadata?.raisons && (notif.metadata.raisons as string[]).length > 0 && (
              <div className="mt-2 p-2 rounded-2xl bg-red-100 border border-red-200">
                <p className="text-xs font-bold text-red-700 mb-1">Raisons :</p>
                <ul className="space-y-0.5">
                  {(notif.metadata.raisons as string[]).map((r, i) => (
                    <li key={i} className="text-xs text-red-700 flex items-start gap-1">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-xs text-gray-400 mt-1.5">{formatRelative(notif.createdAt)}</p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-1 flex-shrink-0">
            {!notif.isRead && (
              <motion.button
                onClick={onMarkAsRead}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                className="w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center shadow-sm"
                title="Marquer comme lu"
              >
                <CheckCircle className="w-4 h-4 text-green-600" />
              </motion.button>
            )}
            <motion.button
              onClick={onDelete}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              className="w-8 h-8 rounded-full bg-white border-2 border-gray-100 flex items-center justify-center"
              title="Supprimer"
            >
              <Trash2 className="w-3.5 h-3.5 text-gray-400" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================================
// PANEL PRINCIPAL
// ============================================================

interface NotificationsPanelProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  accentColor?: string;
}

export function NotificationsPanel({
  userId,
  isOpen,
  onClose,
  accentColor = '#C46210',
}: NotificationsPanelProps) {
  const { getNotificationsForUser, getUnreadCount, markAsRead, markAllAsRead, deleteNotif } = useNotifications();
  const [filtre, setFiltre] = useState<'toutes' | 'non-lues' | 'critiques'>('toutes');

  const notifs = getNotificationsForUser(userId);
  const unreadCount = getUnreadCount(userId);

  const filtrees = notifs.filter(n => {
    if (filtre === 'non-lues') return !n.isRead;
    if (filtre === 'critiques') return n.priority === 'critical';
    return true;
  });

  const criticalCount = notifs.filter(n => n.priority === 'critical' && !n.isRead).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end px-3 pb-3 lg:items-center lg:justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-3xl w-full max-h-[90vh] flex flex-col shadow-2xl lg:max-w-lg"
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4 rounded-t-3xl border-b-2"
              style={{ borderColor: `${accentColor}25` }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center relative"
                  style={{ backgroundColor: `${accentColor}18` }}
                >
                  <Bell className="w-5 h-5" style={{ color: accentColor }} />
                  {unreadCount > 0 && (
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-black flex items-center justify-center border-2 border-white"
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                  )}
                </div>
                <div>
                  <h2 className="font-black text-gray-900">Mes notifications</h2>
                  <p className="text-xs text-gray-500">
                    {unreadCount > 0
                      ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}`
                      : 'Tout est lu'}
                    {criticalCount > 0 && (
                      <span className="ml-1 text-red-600 font-bold">
                        • {criticalCount} critique{criticalCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <motion.button
                    onClick={() => markAllAsRead(userId)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-1.5 rounded-2xl border-2 text-xs font-bold"
                    style={{ borderColor: accentColor, color: accentColor }}
                  >
                    Tout lire
                  </motion.button>
                )}
                <motion.button
                  onClick={onClose}
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </motion.button>
              </div>
            </div>

            {/* Filtres */}
            <div className="flex gap-2 px-5 py-3 border-b-2 border-gray-100 overflow-x-auto no-scrollbar">
              {[
                { key: 'toutes', label: `Toutes (${notifs.length})` },
                { key: 'non-lues', label: `Non lues (${unreadCount})` },
                { key: 'critiques', label: `Critiques (${criticalCount})` },
              ].map(({ key, label }) => (
                <motion.button
                  key={key}
                  onClick={() => setFiltre(key as any)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-4 py-1.5 rounded-2xl text-xs font-bold border-2 flex-shrink-0 transition-all"
                  style={
                    filtre === key
                      ? { backgroundColor: accentColor, color: '#fff', borderColor: accentColor }
                      : { color: '#6B7280', borderColor: '#E5E7EB', backgroundColor: '#fff' }
                  }
                >
                  {label}
                </motion.button>
              ))}
            </div>

            {/* Aide swipe (mobile) */}
            <div className="px-5 py-1.5 bg-gray-50 border-b border-gray-100">
              <p className="text-xs text-gray-400 text-center">
                Glissez une carte vers la gauche pour la marquer comme lue
              </p>
            </div>

            {/* Liste */}
            <div className="flex-1 overflow-y-auto p-4">
              {filtrees.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-16 gap-4"
                >
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${accentColor}15` }}
                  >
                    <Bell className="w-10 h-10" style={{ color: accentColor }} />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-gray-700">
                      {filtre === 'non-lues' ? 'Tout est lu' : filtre === 'critiques' ? 'Aucune alerte critique' : 'Aucune notification'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {filtre === 'non-lues' ? 'Vous êtes à jour !' : 'Revenez plus tard'}
                    </p>
                  </div>
                </motion.div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filtrees.map(notif => (
                    <NotifCard
                      key={notif.id}
                      notif={notif}
                      accentColor={accentColor}
                      onMarkAsRead={() => markAsRead(notif.id)}
                      onDelete={() => deleteNotif(notif.id)}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer — statistiques */}
            <div
              className="px-5 py-3 rounded-b-3xl border-t-2 flex items-center justify-between"
              style={{ borderColor: `${accentColor}20` }}
            >
              <p className="text-xs text-gray-400">
                {notifs.length} notification{notifs.length > 1 ? 's' : ''} (30 derniers jours)
              </p>
              <div className="flex gap-1">
                {(['critical', 'high', 'medium', 'low'] as NotifPriority[]).map(p => {
                  const count = notifs.filter(n => n.priority === p && !n.isRead).length;
                  if (count === 0) return null;
                  return (
                    <span
                      key={p}
                      className={`px-2 py-0.5 rounded-full text-xs font-bold ${PRIORITY_CONFIG[p].badge}`}
                    >
                      {count}
                    </span>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================
// BOUTON CLOCHE — Réutilisable partout
// ============================================================

interface NotifBellButtonProps {
  userId: string;
  accentColor?: string;
  onOpen: () => void;
}

export function NotifBellButton({ userId, accentColor = '#C46210', onOpen }: NotifBellButtonProps) {
  const { getUnreadCount } = useNotifications();
  const count = getUnreadCount(userId);
  const hasCritical = useNotifications().getNotificationsForUser(userId)
    .some(n => n.priority === 'critical' && !n.isRead);

  return (
    <motion.button
      onClick={onOpen}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="relative w-11 h-11 rounded-2xl flex items-center justify-center border-2 bg-white shadow-sm"
      style={{ borderColor: `${accentColor}40` }}
    >
      {hasCritical ? (
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
        >
          <Bell className="w-5 h-5" style={{ color: accentColor }} />
        </motion.div>
      ) : (
        <Bell className="w-5 h-5" style={{ color: accentColor }} />
      )}
      {count > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-white text-xs font-black flex items-center justify-center border-2 border-white ${
            hasCritical ? 'bg-red-600' : 'bg-red-500'
          }`}
        >
          {count > 9 ? '9+' : count}
        </motion.span>
      )}
    </motion.button>
  );
}
