/**
 * JULABA — Panel Notifications Unifié v4
 * Cartes ultra-compactes + drawer de détail au tap
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'motion/react';
import {
  Bell, BellOff, X, CheckCircle, ShoppingCart, CreditCard,
  Package, AlertTriangle, Users, FileText, TrendingDown,
  TrendingUp, Shield, Zap, Info, Star, Trash2, Check,
  ChevronDown, ChevronRight,
} from 'lucide-react';
import {
  useNotifications,
  JulabaNotification,
  NotifType,
  NotifPriority,
  PRIORITY_CONFIG,
} from '../../contexts/NotificationsContext';
import { useApp } from '../../contexts/AppContext';

// ─── Constantes visuelles ──────────────────────────────────────
const PRIORITY_GRADIENT: Record<NotifPriority, string> = {
  critical: 'from-red-50 to-rose-50',
  high:     'from-orange-50 to-amber-50',
  medium:   'from-yellow-50 to-lime-50',
  low:      'from-sky-50 to-blue-50',
};
const PRIORITY_LEFT: Record<NotifPriority, string> = {
  critical: 'bg-red-500',
  high:     'bg-orange-400',
  medium:   'bg-amber-400',
  low:      'bg-blue-400',
};
const PRIORITY_ICON_BG: Record<NotifPriority, string> = {
  critical: 'bg-red-100 text-red-600',
  high:     'bg-orange-100 text-orange-500',
  medium:   'bg-amber-100 text-amber-600',
  low:      'bg-blue-100 text-blue-500',
};

// ─── Icône par type ────────────────────────────────────────────
function getIcon(type: NotifType) {
  const cls = 'w-4 h-4';
  switch (type) {
    case 'commande_recue':
    case 'nouvelle_commande':
    case 'commande_groupee_validee': return <ShoppingCart className={cls} />;
    case 'paiement_valide':
    case 'paiement_recu':
    case 'paiement_collectif':
    case 'contribution_recue':       return <CreditCard className={cls} />;
    case 'paiement_echoue':          return <TrendingDown className={cls} />;
    case 'stock_faible':
    case 'offre_expiree':            return <Package className={cls} />;
    case 'document_valide':
    case 'dossier_valide':
    case 'objectif_atteint':
    case 'reactivation':             return <CheckCircle className={cls} />;
    case 'dossier_rejete':
    case 'suspension':               return <AlertTriangle className={cls} />;
    case 'dossier_assigne':
    case 'dossier_en_attente':       return <FileText className={cls} />;
    case 'membre_ajoute':
    case 'nouveau_identificateur':   return <Users className={cls} />;
    case 'distribution_prete':
    case 'recolte_proche':           return <TrendingUp className={cls} />;
    case 'pic_transaction':
    case 'anomalie_systeme':         return <Zap className={cls} />;
    case 'alerte_fraude':
    case 'tentative_acces':
    case 'modification_critique':    return <Shield className={cls} />;
    case 'evaluation_recue':         return <Star className={cls} />;
    default:                         return <Info className={cls} />;
  }
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  const h   = Math.floor(diff / 3600000);
  const d   = Math.floor(diff / 86400000);
  if (min < 1)  return 'À l\'instant';
  if (min < 60) return `${min} min`;
  if (h < 24)   return `${h}h`;
  if (d === 1)  return 'Hier';
  return `${d}j`;
}

// ─── Drawer de détail ─────────────────────────────────────────

interface DetailDrawerProps {
  notif: JulabaNotification;
  accentColor: string;
  onClose: () => void;
  onMarkAsRead: () => void;
  onDelete: () => void;
}

function DetailDrawer({ notif, accentColor, onClose, onMarkAsRead, onDelete }: DetailDrawerProps) {
  const cfg = PRIORITY_CONFIG[notif.priority];

  const handleMarkRead = () => { onMarkAsRead(); onClose(); };
  const handleDelete   = () => { onDelete(); onClose(); };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-end justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 320 }}
          onClick={e => e.stopPropagation()}
          className="bg-white w-full max-w-xl rounded-t-3xl overflow-hidden shadow-2xl border-t-2"
          style={{ borderColor: `${accentColor}30` }}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 rounded-full bg-gray-300" />
          </div>

          {/* Header détail */}
          <div
            className="flex items-start gap-3 px-5 py-4 border-b-2"
            style={{ borderColor: `${accentColor}15`, background: `linear-gradient(135deg, ${accentColor}0A, transparent)` }}
          >
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${PRIORITY_ICON_BG[notif.priority]}`}>
              {getIcon(notif.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-black text-gray-900">{notif.title}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${cfg.badge}`}>
                  {cfg.label}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{formatRelative(notif.createdAt)}</p>
            </div>
            <motion.button
              onClick={onClose}
              whileTap={{ scale: 0.9 }}
              className="w-8 h-8 rounded-2xl bg-gray-100 flex items-center justify-center flex-shrink-0"
            >
              <X className="w-4 h-4 text-gray-500" />
            </motion.button>
          </div>

          {/* Corps du message */}
          <div className="px-5 py-4 max-h-64 overflow-y-auto">
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {notif.message}
            </p>

            {/* Raisons de rejet */}
            {notif.metadata?.raisons && (notif.metadata.raisons as string[]).length > 0 && (
              <div className="mt-3 p-3 rounded-2xl bg-red-50 border border-red-200">
                <p className="text-xs font-bold text-red-700 mb-2">Raisons :</p>
                <ul className="space-y-1">
                  {(notif.metadata.raisons as string[]).map((r: string, i: number) => (
                    <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 px-5 pb-8 pt-2">
            {!notif.isRead && (
              <motion.button
                onClick={handleMarkRead}
                whileTap={{ scale: 0.96 }}
                className="flex-1 py-3 rounded-3xl border-2 font-bold text-sm flex items-center justify-center gap-2"
                style={{ borderColor: `${accentColor}60`, color: accentColor }}
              >
                <CheckCircle className="w-4 h-4" />
                Marquer lu
              </motion.button>
            )}
            <motion.button
              onClick={handleDelete}
              whileTap={{ scale: 0.96 }}
              className="flex-1 py-3 rounded-3xl border-2 border-red-200 font-bold text-sm text-red-500 flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Supprimer
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Carte compacte ────────────────────────────────────────────

interface NotifCardProps {
  notif: JulabaNotification;
  accentColor: string;
  index: number;
  onMarkAsRead: () => void;
  onDelete: () => void;
}

function NotifCard({ notif, accentColor, index, onMarkAsRead, onDelete }: NotifCardProps) {
  const [showDetail, setShowDetail] = useState(false);
  const [done, setDone]             = useState(false);
  const cfg = PRIORITY_CONFIG[notif.priority];

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x < -70 && !notif.isRead) {
      setDone(true);
      setTimeout(() => { onMarkAsRead(); setDone(false); }, 350);
    }
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 10, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
        transition={{ delay: index * 0.04, type: 'spring', damping: 26, stiffness: 280 }}
        className="relative overflow-hidden mb-2 last:mb-0"
      >
        {/* Fond vert swipe */}
        <div className="absolute inset-y-0 right-0 w-14 flex items-center justify-center rounded-3xl bg-emerald-500">
          <Check className="w-4 h-4 text-white" />
        </div>

        <motion.div
          drag={!notif.isRead ? 'x' : false}
          dragConstraints={{ left: -80, right: 0 }}
          dragElastic={0.08}
          onDragEnd={handleDragEnd}
          animate={{ x: done ? -70 : 0, opacity: done ? 0.4 : 1 }}
          onClick={() => setShowDetail(true)}
          className={`relative rounded-3xl border-2 overflow-hidden cursor-pointer active:scale-[0.98] transition-transform
            ${notif.isRead
              ? 'bg-gray-50 border-gray-100'
              : `bg-gradient-to-r ${PRIORITY_GRADIENT[notif.priority]} ${cfg.border}`
            }`}
        >
          {/* Barre gauche priorité */}
          <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-3xl ${PRIORITY_LEFT[notif.priority]} ${notif.isRead ? 'opacity-20' : ''}`} />

          {/* Pulsation critique */}
          {notif.priority === 'critical' && !notif.isRead && (
            <motion.div
              className="absolute inset-0 rounded-3xl border-2 border-red-400 pointer-events-none"
              animate={{ opacity: [0.6, 0, 0.6] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          )}

          <div className="pl-4 pr-3 py-4 flex items-center gap-3">
            {/* Icône */}
            <div className="relative flex-shrink-0">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center
                ${notif.isRead ? 'bg-gray-100 text-gray-400' : PRIORITY_ICON_BG[notif.priority]}`}>
                {getIcon(notif.type)}
              </div>
              {!notif.isRead && (
                <motion.span
                  animate={{ scale: [1, 1.35, 1] }}
                  transition={{ repeat: Infinity, duration: 2.2 }}
                  className={`absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${cfg.dot}`}
                />
              )}
            </div>

            {/* Texte compact */}
            <div className="flex-1 min-w-0">
              <p className={`font-black truncate ${notif.isRead ? 'text-gray-400' : 'text-gray-900'}`}>
                {notif.title}
              </p>
              <p className={`text-sm truncate mt-1 ${notif.isRead ? 'text-gray-400' : 'text-gray-600'}`}>
                {notif.message}
              </p>
            </div>

            {/* Temps + flèche */}
            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
              <span className="text-xs text-gray-400 font-bold">{formatRelative(notif.createdAt)}</span>
              <ChevronRight className="w-4 h-4" style={{ color: notif.isRead ? '#D1D5DB' : '#9CA3AF' }} />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Drawer de détail */}
      {showDetail && (
        <DetailDrawer
          notif={notif}
          accentColor={accentColor}
          onClose={() => setShowDetail(false)}
          onMarkAsRead={onMarkAsRead}
          onDelete={onDelete}
        />
      )}
    </>
  );
}

// ─── Séparateur de date ────────────────────────────────────────
function DateSeparator({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-3 px-1">
      <div className="flex-1 h-px bg-gray-200" />
      <span className="text-xs font-bold text-gray-400 flex-shrink-0">{label}</span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}

// ─── Panel principal ───────────────────────────────────────────

interface NotificationsPanelProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  accentColor?: string;
}

const FILTRES = [
  { key: 'toutes',    label: 'Toutes' },
  { key: 'non-lues',  label: 'Non lues' },
  { key: 'critiques', label: 'Critiques' },
] as const;

export function NotificationsPanel({
  userId,
  isOpen,
  onClose,
  accentColor = '#C46210',
}: NotificationsPanelProps) {
  const { getNotificationsForUser, getUnreadCount, markAsRead, markAllAsRead, deleteNotif } = useNotifications();
  const { setIsModalOpen } = useApp();
  const [filtre, setFiltre] = useState<'toutes' | 'non-lues' | 'critiques'>('toutes');

  // Masquer la BottomBar quand le panel est ouvert
  useEffect(() => {
    setIsModalOpen(isOpen);
    return () => { if (isOpen) setIsModalOpen(false); };
  }, [isOpen]);

  const notifs        = getNotificationsForUser(userId);
  const unreadCount   = getUnreadCount(userId);
  const criticalCount = notifs.filter(n => n.priority === 'critical' && !n.isRead).length;

  const filtrees = notifs.filter(n => {
    if (filtre === 'non-lues')  return !n.isRead;
    if (filtre === 'critiques') return n.priority === 'critical';
    return true;
  });

  const now       = new Date();
  const todayStr  = now.toDateString();
  const yesterStr = new Date(now.getTime() - 86400000).toDateString();

  const grouped = filtrees.reduce<{ today: JulabaNotification[]; yesterday: JulabaNotification[]; older: JulabaNotification[] }>(
    (acc, n) => {
      const d = new Date(n.createdAt).toDateString();
      if (d === todayStr) acc.today.push(n);
      else if (d === yesterStr) acc.yesterday.push(n);
      else acc.older.push(n);
      return acc;
    },
    { today: [], yesterday: [], older: [] }
  );

  let flatIndex = 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-end justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-t-3xl w-full max-h-[92vh] flex flex-col shadow-2xl lg:rounded-3xl lg:max-w-xl lg:max-h-[85vh] lg:mb-8 overflow-hidden"
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 lg:hidden flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>

            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4 flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${accentColor}12 0%, ${accentColor}06 100%)`,
                borderBottom: `2px solid ${accentColor}20`,
              }}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-11 h-11 rounded-3xl flex items-center justify-center border-2 relative"
                  style={{
                    background: `linear-gradient(135deg, ${accentColor}22, ${accentColor}10)`,
                    borderColor: `${accentColor}30`,
                  }}
                  animate={criticalCount > 0 ? { scale: [1, 1.06, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Bell className="w-5 h-5" style={{ color: accentColor }} />
                  {unreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full text-white text-xs font-black flex items-center justify-center border-2 border-white ${criticalCount > 0 ? 'bg-red-600' : 'bg-red-500'}`}
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                  )}
                </motion.div>
                <div>
                  <h2 className="font-black text-gray-900">Notifications</h2>
                  <p className="text-xs text-gray-500">
                    {unreadCount > 0
                      ? <span className="font-bold" style={{ color: accentColor }}>{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</span>
                      : <span className="text-emerald-600 font-bold">Tout est lu</span>
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <motion.button
                    onClick={() => markAllAsRead(userId)}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-2 rounded-2xl border-2 text-xs font-bold flex items-center gap-1.5"
                    style={{ borderColor: `${accentColor}60`, color: accentColor }}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Tout lire
                  </motion.button>
                )}
                <motion.button
                  onClick={onClose}
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.88 }}
                  className="w-10 h-10 rounded-2xl bg-gray-100 border-2 border-gray-200 flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </motion.button>
              </div>
            </div>

            {/* Filtres */}
            <div className="flex gap-2 px-4 py-3 border-b-2 border-gray-100 overflow-x-auto no-scrollbar flex-shrink-0">
              {FILTRES.map(({ key, label }) => {
                const count = key === 'toutes' ? notifs.length : key === 'non-lues' ? unreadCount : criticalCount;
                const isActive = filtre === key;
                return (
                  <motion.button
                    key={key}
                    onClick={() => setFiltre(key)}
                    whileTap={{ scale: 0.94 }}
                    className="flex-shrink-0 px-3 py-1.5 rounded-2xl border-2 text-xs font-bold flex items-center gap-1.5"
                    style={
                      isActive
                        ? { background: `linear-gradient(135deg, ${accentColor}, ${accentColor}CC)`, color: '#fff', borderColor: accentColor }
                        : { color: '#6B7280', borderColor: '#E5E7EB', backgroundColor: '#fff' }
                    }
                  >
                    {label}
                    <span className={`min-w-[18px] h-[18px] px-1 rounded-full text-xs font-black flex items-center justify-center ${isActive ? 'bg-white/30 text-white' : 'bg-gray-100 text-gray-600'}`}>
                      {count}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {/* Hint tap */}
            <div className="px-4 py-2 border-b border-gray-100 flex-shrink-0 bg-gray-50">
              <p className="text-xs text-gray-400 text-center">
                Appuie sur une notification pour voir les détails
              </p>
            </div>

            {/* Liste */}
            <div className="flex-1 overflow-y-auto p-4 min-h-0">
              {filtrees.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-14 gap-4"
                >
                  <motion.div
                    className="w-20 h-20 rounded-3xl flex items-center justify-center border-2"
                    style={{ background: `linear-gradient(135deg, ${accentColor}15, ${accentColor}08)`, borderColor: `${accentColor}25` }}
                    animate={{ scale: [1, 1.04, 1] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                  >
                    <BellOff className="w-9 h-9" style={{ color: `${accentColor}70` }} />
                  </motion.div>
                  <div className="text-center">
                    <p className="font-black text-gray-800">
                      {filtre === 'non-lues' ? 'Tout est lu !' : filtre === 'critiques' ? 'Aucune alerte critique' : 'Aucune notification'}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      {filtre === 'non-lues' ? 'Vous avez tout vérifié' : 'Revenez plus tard'}
                    </p>
                  </div>
                </motion.div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {grouped.today.length > 0 && (
                    <React.Fragment key="group-today">
                      <DateSeparator label="Aujourd'hui" />
                      {grouped.today.map(notif => (
                        <NotifCard key={notif.id} notif={notif} accentColor={accentColor} index={flatIndex++}
                          onMarkAsRead={() => markAsRead(notif.id)} onDelete={() => deleteNotif(notif.id)} />
                      ))}
                    </React.Fragment>
                  )}
                  {grouped.yesterday.length > 0 && (
                    <React.Fragment key="group-yesterday">
                      <DateSeparator label="Hier" />
                      {grouped.yesterday.map(notif => (
                        <NotifCard key={notif.id} notif={notif} accentColor={accentColor} index={flatIndex++}
                          onMarkAsRead={() => markAsRead(notif.id)} onDelete={() => deleteNotif(notif.id)} />
                      ))}
                    </React.Fragment>
                  )}
                  {grouped.older.length > 0 && (
                    <React.Fragment key="group-older">
                      <DateSeparator label="Plus ancien" />
                      {grouped.older.map(notif => (
                        <NotifCard key={notif.id} notif={notif} accentColor={accentColor} index={flatIndex++}
                          onMarkAsRead={() => markAsRead(notif.id)} onDelete={() => deleteNotif(notif.id)} />
                      ))}
                    </React.Fragment>
                  )}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            <div
              className="px-5 py-3 flex-shrink-0 flex items-center justify-between"
              style={{ background: `linear-gradient(135deg, ${accentColor}08, ${accentColor}04)`, borderTop: `2px solid ${accentColor}18` }}
            >
              <p className="text-xs text-gray-400 font-medium">
                {notifs.length} notification{notifs.length !== 1 ? 's' : ''} · 30 jours
              </p>
              <div className="flex items-center gap-1.5">
                {(['critical', 'high', 'medium', 'low'] as NotifPriority[]).map(p => {
                  const cnt = notifs.filter(n => n.priority === p && !n.isRead).length;
                  if (cnt === 0) return null;
                  return (
                    <motion.span key={p} initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className={`min-w-[22px] h-[22px] px-1.5 rounded-full text-xs font-black flex items-center justify-center ${PRIORITY_CONFIG[p].badge}`}>
                      {cnt}
                    </motion.span>
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

// ─── Bouton cloche ─────────────────────────────────────────────

interface NotifBellButtonProps {
  userId: string;
  accentColor?: string;
  onOpen: () => void;
}

export function NotifBellButton({ userId, accentColor = '#C46210', onOpen }: NotifBellButtonProps) {
  const { getUnreadCount, getNotificationsForUser } = useNotifications();
  const count       = getUnreadCount(userId);
  const hasCritical = getNotificationsForUser(userId).some(n => n.priority === 'critical' && !n.isRead);

  return (
    <motion.button
      onClick={onOpen}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.9 }}
      className="relative w-11 h-11 rounded-2xl flex items-center justify-center border-2 bg-white shadow-sm overflow-visible"
      style={{
        borderColor: hasCritical ? '#FCA5A5' : `${accentColor}40`,
        background: hasCritical
          ? 'linear-gradient(135deg, #FFF5F5, #FFF)'
          : `linear-gradient(135deg, ${accentColor}0A, #FFFFFF)`,
      }}
    >
      {hasCritical && (
        <motion.span
          className="absolute inset-0 rounded-2xl border-2 border-red-400"
          animate={{ opacity: [0.8, 0, 0.8], scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
        />
      )}
      {hasCritical ? (
        <motion.div
          animate={{ rotate: [0, -12, 12, -8, 8, -4, 4, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, repeatDelay: 1.5 }}
        >
          <Bell className="w-5 h-5 text-red-500" />
        </motion.div>
      ) : (
        <Bell className="w-5 h-5" style={{ color: accentColor }} />
      )}
      {count > 0 && (
        <motion.span
          key={count}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 14, stiffness: 300 }}
          className={`absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full text-white text-xs font-black flex items-center justify-center border-2 border-white ${hasCritical ? 'bg-red-600' : 'bg-red-500'}`}
        >
          {count > 9 ? '9+' : count}
        </motion.span>
      )}
    </motion.button>
  );
}