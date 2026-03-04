import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, Users, UserPlus, Eye, MapPin, Wallet,
  BookOpen, Target, Settings, FileText, LogOut, Menu, X,
  Bell, Search, ChevronRight, Shield, Volume2, BarChart3,
  Building2, Headphones, MessageSquare, Hash, Clock,
  CheckCircle2, Circle, AlertCircle, Sparkles, BellRing,
} from 'lucide-react';
import { useBackOffice, BORoleType } from '../../contexts/BackOfficeContext';
import { useTickets, Ticket } from '../../contexts/TicketsContext';

const BO_PRIMARY = '#E6A817';
const BO_DARK = '#3B3C36';

const ROLE_LABELS: Record<BORoleType, string> = {
  super_admin: 'Super Admin',
  admin_national: 'Admin National',
  gestionnaire_zone: 'Gestionnaire Zone',
  analyste: 'Analyste',
};

const ROLE_COLORS: Record<BORoleType, string> = {
  super_admin: '#E6A817',
  admin_national: '#3B82F6',
  gestionnaire_zone: '#10B981',
  analyste: '#8B5CF6',
};

const STATUT_CONFIG = {
  nouveau: { label: 'Nouveau', color: '#EF4444', bg: '#FEF2F2' },
  en_cours: { label: 'En cours', color: '#F59E0B', bg: '#FFFBEB' },
  resolu: { label: 'Résolu', color: '#10B981', bg: '#F0FDF4' },
  ferme: { label: 'Fermé', color: '#6B7280', bg: '#F9FAFB' },
};

const SIDEBAR_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/backoffice/dashboard', permission: null },
  { id: 'acteurs', label: 'Acteurs', icon: Users, path: '/backoffice/acteurs', permission: 'acteurs.read' },
  { id: 'enrolement', label: 'Enrôlement', icon: UserPlus, path: '/backoffice/enrolement', permission: 'enrolement.read' },
  { id: 'supervision', label: 'Supervision', icon: Eye, path: '/backoffice/supervision', permission: 'supervision.read' },
  { id: 'zones', label: 'Zones & Territoires', icon: MapPin, path: '/backoffice/zones', permission: 'zones.read' },
  { id: 'commissions', label: 'Commissions', icon: Wallet, path: '/backoffice/commissions', permission: 'commissions.read' },
  { id: 'audit', label: 'Audit & Logs', icon: FileText, path: '/backoffice/audit', permission: 'audit.read' },
  { id: 'sep1', label: '──────────', icon: null, path: '', permission: null, separator: true },
  { id: 'utilisateurs', label: 'Utilisateurs BO', icon: Shield, path: '/backoffice/utilisateurs', permission: 'utilisateurs.read' },
  { id: 'institutions', label: 'Institutions', icon: Building2, path: '/backoffice/institutions', permission: 'utilisateurs.read' },
  { id: 'sep2', label: '──────────', icon: null, path: '', permission: null, separator: true },
  { id: 'academy', label: 'Academy', icon: BookOpen, path: '/backoffice/academy', permission: 'academy.read' },
  { id: 'missions', label: 'Missions', icon: Target, path: '/backoffice/missions', permission: 'missions.read' },
  { id: 'rapports', label: 'Rapports', icon: BarChart3, path: '/backoffice/rapports', permission: 'audit.read' },
  { id: 'notifications', label: 'Notifications', icon: Bell, path: '/backoffice/notifications', permission: null },
  { id: 'support', label: 'Support', icon: Headphones, path: '/backoffice/support', permission: 'parametres.read' },
  { id: 'parametres', label: 'Paramètres', icon: Settings, path: '/backoffice/parametres', permission: 'parametres.read' },
] as any[];

const MOBILE_BOTTOM = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/backoffice/dashboard' },
  { id: 'acteurs', label: 'Acteurs', icon: Users, path: '/backoffice/acteurs' },
  { id: 'supervision', label: 'Supervision', icon: Eye, path: '/backoffice/supervision' },
  { id: 'support', label: 'Support', icon: Headphones, path: '/backoffice/support' },
  { id: 'profil', label: 'Profil', icon: Shield, path: '/backoffice/profil' },
];

// ─── Panneau de notifications ────────────────────────────────────────────────

function formatRelTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `il y a ${h}h`;
  return `il y a ${Math.floor(h / 24)}j`;
}

interface NotifPanelProps {
  open: boolean;
  onClose: () => void;
  tickets: Ticket[];
  nouveauxCount: number;
  onVoirTicket: (id: string) => void;
  onMarquerLu: (id: string) => void;
}

function NotifPanel({ open, onClose, tickets, nouveauxCount, onVoirTicket, onMarquerLu }: NotifPanelProps) {
  const nonLus = tickets.filter(t => !t.luParBO && t.statut !== 'ferme');

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          {/* Panneau */}
          <motion.div
            className="fixed top-14 right-4 z-50 w-96 max-h-[calc(100vh-100px)] bg-white rounded-3xl shadow-2xl border-2 border-gray-100 flex flex-col overflow-hidden"
            initial={{ opacity: 0, y: -12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [0, -15, 15, -10, 10, 0] }}
                  transition={{ duration: 0.6, repeat: nouveauxCount > 0 ? Infinity : 0, repeatDelay: 3 }}
                >
                  <BellRing className="w-5 h-5" style={{ color: BO_PRIMARY }} />
                </motion.div>
                <h3 className="font-bold text-gray-900">Nouveaux tickets</h3>
                {nouveauxCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-black text-white" style={{ backgroundColor: '#EF4444' }}>
                    {nouveauxCount}
                  </span>
                )}
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Liste */}
            <div className="overflow-y-auto flex-1">
              {nonLus.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <CheckCircle2 className="w-10 h-10 text-green-400 mb-3" />
                  <p className="font-bold text-gray-500">Tout est à jour</p>
                  <p className="text-xs text-gray-400 mt-1">Aucun ticket en attente de traitement</p>
                </div>
              ) : (
                <div className="p-3 space-y-2">
                  {nonLus.map((ticket, i) => {
                    const statut = STATUT_CONFIG[ticket.statut];
                    const dernier = ticket.messages[ticket.messages.length - 1];
                    return (
                      <motion.div
                        key={ticket.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-gray-50 rounded-2xl p-3 border-2 border-transparent hover:border-[#E6A817] transition-all cursor-pointer"
                        onClick={() => { onVoirTicket(ticket.id); onMarquerLu(ticket.id); onClose(); }}
                      >
                        <div className="flex items-start gap-3">
                          {/* Icône statut */}
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${statut.bg}` }}>
                            {ticket.statut === 'nouveau'
                              ? <AlertCircle className="w-4 h-4" style={{ color: statut.color }} />
                              : <Circle className="w-4 h-4" style={{ color: statut.color }} />
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-black text-xs" style={{ color: BO_PRIMARY }}>{ticket.numero}</span>
                              <span
                                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                                style={{ backgroundColor: statut.bg, color: statut.color }}
                              >
                                {statut.label}
                              </span>
                              {/* Pastille non-lu */}
                              <span className="w-2 h-2 rounded-full bg-red-500 ml-auto shrink-0" />
                            </div>
                            <p className="font-bold text-gray-800 text-xs truncate">{ticket.sujet}</p>
                            <p className="text-gray-500 text-[11px] truncate mt-0.5">{ticket.role} — {dernier?.auteurNom}</p>
                            {dernier && (
                              <p className="text-gray-400 text-[11px] mt-1 line-clamp-1 italic">
                                "{dernier.texte}"
                              </p>
                            )}
                            <div className="flex items-center gap-1 mt-1.5 text-[10px] text-gray-400">
                              <Clock className="w-3 h-3" />
                              <span>{formatRelTime(ticket.dateCreation)}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-gray-100">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => { onClose(); }}
                className="w-full py-2.5 rounded-2xl font-bold text-sm text-white"
                style={{ backgroundColor: BO_PRIMARY }}
              >
                Gérer tous les tickets
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Toast notification push ─────────────────────────────────────────────────

interface PushToastProps {
  ticket: Ticket | null;
  onClose: () => void;
  onOuvrir: () => void;
}

function PushToast({ ticket, onClose, onOuvrir }: PushToastProps) {
  useEffect(() => {
    if (!ticket) return;
    const t = setTimeout(onClose, 6000);
    return () => clearTimeout(t);
  }, [ticket, onClose]);

  return (
    <AnimatePresence>
      {ticket && (
        <motion.div
          className="fixed top-20 right-4 z-[100] w-80 bg-white rounded-3xl shadow-2xl border-2 overflow-hidden"
          style={{ borderColor: BO_PRIMARY }}
          initial={{ opacity: 0, x: 60, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 60, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        >
          {/* Barre de progression */}
          <motion.div
            className="h-1 rounded-full"
            style={{ backgroundColor: BO_PRIMARY }}
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: 6, ease: 'linear' }}
          />
          <div className="p-4">
            <div className="flex items-start gap-3">
              <motion.div
                className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: '#FEE2E2' }}
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                <BellRing className="w-5 h-5 text-red-500" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="font-black text-xs" style={{ color: BO_PRIMARY }}>Nouveau ticket</p>
                  <button onClick={onClose}>
                    <X className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </div>
                <p className="font-bold text-gray-800 text-sm">{ticket.sujet}</p>
                <p className="text-gray-500 text-xs">{ticket.role} · {ticket.messages[0]?.auteurNom}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-gray-100 text-gray-600">
                    {ticket.numero}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => { onOuvrir(); onClose(); }}
                className="flex-1 h-9 rounded-2xl text-white text-xs font-bold flex items-center justify-center gap-1.5"
                style={{ backgroundColor: BO_PRIMARY }}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Répondre
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="h-9 px-3 rounded-2xl text-xs font-bold border-2 border-gray-200 text-gray-500"
              >
                Ignorer
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── BOLayout principal ───────────────────────────────────────────────────────

export function BOLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { boUser, hasPermission, setBOUser } = useBackOffice();
  const { tickets, nouveauxCount, creerTicketDemo, marquerLuParBO } = useTickets();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [pushTicket, setPushTicket] = useState<Ticket | null>(null);
  const [bellShake, setBellShake] = useState(false);

  const prevCount = useRef(nouveauxCount);
  const notifPermission = useRef<NotificationPermission>('default');

  // ── Demander permission Browser Notification ──────────────────────────────
  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission().then(p => {
        notifPermission.current = p;
      });
    }
  }, []);

  // ── Détecter nouveaux tickets → push ──────────────────────────────────────
  useEffect(() => {
    if (nouveauxCount > prevCount.current) {
      const nouveaux = tickets.filter(t => !t.luParBO && t.statut !== 'ferme');
      const dernier = nouveaux[0];
      if (dernier) {
        // Afficher le toast in-app
        setPushTicket(dernier);
        // Shake la cloche
        setBellShake(true);
        setTimeout(() => setBellShake(false), 1000);
        // Browser push notification si autorisée
        if ('Notification' in window && notifPermission.current === 'granted') {
          new Notification('Nouveau ticket JÙLABA', {
            body: `${dernier.sujet} — ${dernier.role} (${dernier.numero})`,
            icon: '/favicon.ico',
          });
        }
      }
    }
    prevCount.current = nouveauxCount;
  }, [nouveauxCount, tickets]);

  // ── Simulation : nouveau ticket toutes les 45 secondes (démo) ────────────
  useEffect(() => {
    const id = setInterval(() => {
      creerTicketDemo();
    }, 45000);
    return () => clearInterval(id);
  }, [creerTicketDemo]);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'fr-FR'; u.rate = 0.9;
      setIsSpeaking(true);
      u.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(u);
    }
  };

  const handleLogout = () => {
    speak('Au revoir. Déconnexion du Back-Office.');
    setTimeout(() => { setBOUser(null); navigate('/backoffice'); }, 1000);
  };

  const handleVoirTicket = useCallback((ticketId: string) => {
    navigate('/backoffice/support');
    // Passe l'id via state pour que BOSupport puisse ouvrir ce ticket
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('bo-open-ticket', { detail: { ticketId } }));
    }, 300);
  }, [navigate]);

  if (!boUser) return null;

  const visibleItems = SIDEBAR_ITEMS.filter(item =>
    item.separator || item.permission === null || hasPermission(item.permission)
  );

  const isActive = (path: string) =>
    path && (location.pathname === path || location.pathname.startsWith(path + '/'));

  const SidebarNavItem = ({ item, onClick }: { item: any; onClick?: () => void }) => {
    if (item.separator) return <div className="mx-4 my-2 border-t border-white/10" />;
    const Icon = item.icon;
    const active = isActive(item.path);
    const isSupport = item.id === 'support';
    return (
      <motion.button
        onClick={() => { navigate(item.path); onClick?.(); }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all ${active ? 'text-white' : 'text-white/80 hover:text-white hover:bg-white/10'}`}
        style={active ? { backgroundColor: BO_PRIMARY } : {}}
        whileHover={!active ? { x: 4 } : {}}
        whileTap={{ scale: 0.97 }}
      >
        <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={active ? 2.5 : 2} />
        <span className="font-semibold text-sm flex-1">{item.label}</span>
        {isSupport && nouveauxCount > 0 && !active && (
          <motion.span
            className="w-5 h-5 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {nouveauxCount}
          </motion.span>
        )}
        {active && <ChevronRight className="w-4 h-4 opacity-70" />}
      </motion.button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* ── PUSH TOAST ─────────────────────────────────────────────────── */}
      <PushToast
        ticket={pushTicket}
        onClose={() => setPushTicket(null)}
        onOuvrir={() => pushTicket && handleVoirTicket(pushTicket.id)}
      />

      {/* ── SIDEBAR DESKTOP ────────────────────────────────────────────── */}
      <div
        className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[280px] xl:w-[300px] z-50 flex-col"
        style={{ backgroundColor: BO_DARK }}
      >
        {/* Logo */}
        <div className="px-6 py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <motion.div
              className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-white text-xl shadow-lg"
              style={{ backgroundColor: BO_PRIMARY }}
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              J
            </motion.div>
            <div>
              <h1 className="font-black text-white text-lg" style={{ fontFamily: "'Calisga', serif" }}>JÙLABA</h1>
              <p className="text-xs font-semibold" style={{ color: BO_PRIMARY }}>Back-Office Central</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm shadow"
              style={{ backgroundColor: ROLE_COLORS[boUser.role] }}
            >
              {boUser.prenom.charAt(0)}{boUser.nom.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white text-sm truncate">{boUser.prenom} {boUser.nom}</p>
              <p className="text-xs font-semibold truncate" style={{ color: BO_PRIMARY }}>{ROLE_LABELS[boUser.role]}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-0.5">
          {visibleItems.map((item, i) => <SidebarNavItem key={item.id + i} item={item} />)}
        </nav>

        {/* Tantie + Logout */}
        <div className="px-4 pb-6 space-y-2 border-t border-white/10 pt-4">
          {/* Bouton demo nouveau ticket */}
          <motion.button
            onClick={creerTicketDemo}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl"
            style={{ backgroundColor: 'rgba(239,68,68,0.15)' }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            title="Simuler l'arrivée d'un nouveau ticket"
          >
            <Sparkles className="w-4 h-4 text-red-400" />
            <span className="font-semibold text-xs text-red-300">Simuler ticket entrant</span>
          </motion.button>
          <motion.button
            onClick={() => speak(`Bonjour ${boUser.prenom}. Vous êtes connecté en tant que ${ROLE_LABELS[boUser.role]}. Il y a ${nouveauxCount} ticket${nouveauxCount > 1 ? 's' : ''} en attente. Comment puis-je vous aider ?`)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{ backgroundColor: `${BO_PRIMARY}20` }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <motion.div animate={isSpeaking ? { scale: [1, 1.2, 1] } : {}} transition={{ duration: 0.5, repeat: isSpeaking ? Infinity : 0 }}>
              <Volume2 className="w-5 h-5" style={{ color: BO_PRIMARY }} />
            </motion.div>
            <span className="font-semibold text-sm" style={{ color: BO_PRIMARY }}>Tantie Sagesse</span>
          </motion.button>
          <motion.button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-white/80 hover:text-red-400 hover:bg-red-500/10 transition-all"
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.97 }}
          >
            <LogOut className="w-5 h-5" />
            <span className="font-semibold text-sm">Déconnexion</span>
          </motion.button>
        </div>
      </div>

      {/* ── TOPBAR DESKTOP ─────────────────────────────────────────────── */}
      <div
        className="hidden lg:flex fixed top-0 right-0 z-40 h-16 items-center px-6 gap-4 bg-white border-b-2 border-gray-100 shadow-sm"
        style={{ left: '280px' }}
      >
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Recherche globale..."
            value={globalSearch}
            onChange={e => setGlobalSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border-2 border-gray-200 focus:border-[#E6A817] focus:outline-none text-sm bg-gray-50"
          />
        </div>

        {/* Cloche notifications */}
        <motion.button
          onClick={() => setNotifOpen(o => !o)}
          className="relative w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={bellShake ? { rotate: [0, -18, 18, -14, 14, -8, 8, 0] } : {}}
          transition={{ duration: 0.6 }}
        >
          <Bell className="w-5 h-5 text-gray-600" />
          <AnimatePresence>
            {nouveauxCount > 0 && (
              <motion.span
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                key={nouveauxCount}
              >
                {nouveauxCount > 9 ? '9+' : nouveauxCount}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Panneau notifications */}
        <NotifPanel
          open={notifOpen}
          onClose={() => setNotifOpen(false)}
          tickets={tickets}
          nouveauxCount={nouveauxCount}
          onVoirTicket={handleVoirTicket}
          onMarquerLu={marquerLuParBO}
        />

        <div className="flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-xs"
            style={{ backgroundColor: ROLE_COLORS[boUser.role] }}
          >
            {boUser.prenom.charAt(0)}{boUser.nom.charAt(0)}
          </div>
          <div className="hidden xl:block">
            <p className="text-sm font-bold text-gray-900">{boUser.prenom}</p>
            <p className="text-xs text-gray-500">{ROLE_LABELS[boUser.role]}</p>
          </div>
        </div>
      </div>

      {/* ── TOPBAR MOBILE ──────────────────────────────────────────────── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b-2 border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-white text-sm" style={{ backgroundColor: BO_PRIMARY }}>J</div>
            <div>
              <p className="font-black text-gray-900 text-sm">JÙLABA</p>
              <p className="text-[10px] font-semibold" style={{ color: BO_PRIMARY }}>Back-Office</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => setNotifOpen(o => !o)}
              className="relative w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center"
              whileTap={{ scale: 0.9 }}
              animate={bellShake ? { rotate: [0, -15, 15, -10, 10, 0] } : {}}
            >
              <Bell className="w-4 h-4 text-gray-600" />
              <AnimatePresence>
                {nouveauxCount > 0 && (
                  <motion.span
                    className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    key={nouveauxCount}
                  >
                    {nouveauxCount > 9 ? '9+' : nouveauxCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
            <motion.button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center"
              whileTap={{ scale: 0.9 }}
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </motion.button>
          </div>
        </div>

        {/* Panneau notif mobile (sous la topbar) */}
        <NotifPanel
          open={notifOpen}
          onClose={() => setNotifOpen(false)}
          tickets={tickets}
          nouveauxCount={nouveauxCount}
          onVoirTicket={handleVoirTicket}
          onMarquerLu={marquerLuParBO}
        />
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              className="lg:hidden fixed top-0 right-0 bottom-0 w-72 z-50 flex flex-col"
              style={{ backgroundColor: BO_DARK }}
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="px-6 py-6 border-b border-white/10 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white" style={{ fontFamily: "'Calisga', serif" }}>{boUser.prenom} {boUser.nom}</p>
                  <p className="text-xs font-semibold" style={{ color: BO_PRIMARY }}>{ROLE_LABELS[boUser.role]}</p>
                </div>
                <button onClick={() => setMobileMenuOpen(false)}><X className="w-5 h-5 text-white/80" /></button>
              </div>
              <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-0.5">
                {visibleItems.map((item, i) => <SidebarNavItem key={item.id + i} item={item} onClick={() => setMobileMenuOpen(false)} />)}
              </nav>
              <div className="px-4 pb-8 pt-4 border-t border-white/10 space-y-2">
                <motion.button
                  onClick={() => { creerTicketDemo(); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl"
                  style={{ backgroundColor: 'rgba(239,68,68,0.15)' }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Sparkles className="w-4 h-4 text-red-400" />
                  <span className="font-semibold text-xs text-red-300">Simuler ticket entrant</span>
                </motion.button>
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-400">
                  <LogOut className="w-5 h-5" />
                  <span className="font-semibold text-sm">Déconnexion</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── CONTENT ────────────────────────────────────────────────────── */}
      <main className="flex-1 lg:ml-[280px] xl:ml-[300px] pt-14 lg:pt-16 pb-20 lg:pb-6 min-h-screen">
        <Outlet />
      </main>

      {/* ── BOTTOM BAR MOBILE ──────────────────────────────────────────── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-gray-100 shadow-lg">
        <div className="flex items-center justify-around px-2 py-2">
          {MOBILE_BOTTOM.map(item => {
            const Icon = item.icon;
            const active = isActive(item.path);
            const isSupport = item.id === 'support';
            return (
              <motion.button
                key={item.id}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center gap-1 px-2 py-2 rounded-2xl flex-1 relative"
                style={active ? { backgroundColor: `${BO_PRIMARY}20` } : {}}
                whileTap={{ scale: 0.9 }}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" style={{ color: active ? BO_PRIMARY : '#9ca3af' }} strokeWidth={active ? 2.5 : 2} />
                  {isSupport && nouveauxCount > 0 && (
                    <motion.span
                      className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[7px] font-black flex items-center justify-center"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      {nouveauxCount > 9 ? '9+' : nouveauxCount}
                    </motion.span>
                  )}
                </div>
                <span className="text-[9px] font-bold" style={{ color: active ? BO_PRIMARY : '#9ca3af' }}>{item.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
