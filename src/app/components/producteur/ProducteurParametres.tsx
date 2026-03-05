import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Bell,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Check,
  X,
  Mic,
  Moon,
  ChevronRight,
  LogOut,
  AlertTriangle,
  RefreshCw,
  Smartphone,
  Leaf,
  Save,
  ShoppingCart,
  Star,
  Calendar,
  Headphones,
  Wallet,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { useUser } from '../../contexts/UserContext';
import { useApp } from '../../contexts/AppContext';
import { useProducteur } from '../../contexts/ProducteurContext';
import { toast } from 'sonner';

const COLOR = '#2E8B57';

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <motion.button onClick={() => onChange(!value)}
      className="relative w-12 h-6 rounded-full transition-colors flex-shrink-0"
      style={{ backgroundColor: value ? COLOR : '#E5E7EB' }} whileTap={{ scale: 0.95 }}>
      <motion.div className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
        animate={{ left: value ? '28px' : '4px' }} transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
    </motion.button>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl border-2 border-gray-100 overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100"
        style={{ background: `linear-gradient(90deg, ${COLOR}10 0%, transparent 100%)` }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${COLOR}15` }}>
          <Icon className="w-5 h-5" style={{ color: COLOR }} />
        </div>
        <h3 className="font-bold text-gray-900">{title}</h3>
      </div>
      <div className="divide-y divide-gray-100">{children}</div>
    </motion.div>
  );
}

function RowToggle({ label, sublabel, value, onChange }: { label: string; sublabel?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <div className="flex-1 pr-4">
        <p className="font-semibold text-gray-900">{label}</p>
        {sublabel && <p className="text-xs text-gray-500 mt-0.5">{sublabel}</p>}
      </div>
      <Toggle value={value} onChange={onChange} />
    </div>
  );
}

function RowAction({ label, sublabel, icon: Icon, danger, onClick }: {
  label: string; sublabel?: string; icon?: React.ElementType; danger?: boolean; onClick: () => void;
}) {
  return (
    <motion.button onClick={onClick} className="w-full flex items-center justify-between px-5 py-4 text-left" whileTap={{ scale: 0.99 }}>
      <div className="flex-1">
        <p className="font-semibold" style={{ color: danger ? '#DC2626' : '#111827' }}>{label}</p>
        {sublabel && <p className="text-xs text-gray-500 mt-0.5">{sublabel}</p>}
      </div>
      {Icon ? <Icon className="w-5 h-5" style={{ color: danger ? '#DC2626' : '#9CA3AF' }} /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
    </motion.button>
  );
}

function ModalDanger({ isOpen, title, message, onConfirm, onClose }: {
  isOpen: boolean; title: string; message: string; onConfirm: () => void; onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-5" onClick={onClose}>
          <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}
            onClick={e => e.stopPropagation()} className="bg-white rounded-3xl p-6 w-full max-w-sm">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">{title}</h3>
            <p className="text-sm text-gray-600 text-center mb-6">{message}</p>
            <div className="flex gap-3">
              <motion.button onClick={onClose} className="flex-1 py-3 rounded-2xl border-2 border-gray-200 font-semibold text-gray-700" whileTap={{ scale: 0.97 }}>
                Annuler
              </motion.button>
              <motion.button onClick={() => { onConfirm(); onClose(); }} className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-semibold" whileTap={{ scale: 0.97 }}>
                Confirmer
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ProducteurParametres() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { speak, isOnline } = useApp();
  const { alertes, stats } = useProducteur();

  const [notifCommandes,   setNotifCommandes]   = useState(true);
  const [notifPaiements,   setNotifPaiements]   = useState(true);
  const [notifRecoltes,    setNotifRecoltes]     = useState(true);
  const [notifEvaluations, setNotifEvaluations] = useState(true);
  const [notifOffres,      setNotifOffres]       = useState(false);
  const [vocale,           setVocale]           = useState(true);
  const [modeNuit,         setModeNuit]         = useState(false);
  const [rappelsRecolte,   setRappelsRecolte]   = useState(true);
  const [showLogout,       setShowLogout]        = useState(false);
  const [saved,            setSaved]             = useState(false);

  const handleSave = () => {
    setSaved(true);
    speak('Paramètres sauvegardés');
    toast.success('Paramètres sauvegardés');
    setTimeout(() => setSaved(false), 2500);
  };

  const nbAlertes = alertes.recoltesProches.length + alertes.commandesRetard.length + alertes.paiementsAttente.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="relative pb-6 pt-safe" style={{ background: `linear-gradient(145deg, ${COLOR} 0%, ${COLOR}CC 100%)` }}>
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -translate-y-6 translate-x-6" />
        <div className="relative flex items-center justify-between px-5 pt-5 pb-2">
          <motion.button onClick={() => navigate(-1)} className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center" whileTap={{ scale: 0.9 }}>
            <ArrowLeft className="w-5 h-5 text-white" />
          </motion.button>
          <span className="text-white font-bold text-lg">Paramètres</span>
          <motion.button onClick={handleSave}
            className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: saved ? '#16A34A' : 'rgba(255,255,255,0.2)' }} whileTap={{ scale: 0.9 }}>
            {saved ? <Check className="w-5 h-5 text-white" strokeWidth={3} /> : <Save className="w-5 h-5 text-white" />}
          </motion.button>
        </div>

        <div className="relative px-5 pt-2">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/15 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white font-bold">{user ? `${user.firstName} ${user.lastName}` : 'Producteur'}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`} />
                <p className="text-white/70 text-sm">{isOnline ? 'En ligne' : 'Hors ligne'}</p>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20">
                  <Star className="w-3 h-3 text-white" />
                  <span className="text-white text-xs">{stats.noteMoyenne.toFixed(1)}/5</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 space-y-4 pb-36">

        {/* Alertes actives */}
        {nbAlertes > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-3xl bg-green-50 border-2 border-green-200 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-200 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-green-700" />
            </div>
            <div>
              <p className="font-bold text-green-900">{nbAlertes} alerte(s) en attente</p>
              <p className="text-xs text-green-600 mt-0.5">
                {alertes.recoltesProches.length} récolte(s) proche · {alertes.paiementsAttente.length} paiement(s) en attente
              </p>
            </div>
          </motion.div>
        )}

        {/* NOTIFICATIONS */}
        <Section title="Notifications" icon={Bell}>
          <RowToggle label="Nouvelles commandes"     sublabel="Alertes immédiates"                    value={notifCommandes}   onChange={setNotifCommandes} />
          <RowToggle label="Paiements reçus"         sublabel="Confirmation de chaque paiement"       value={notifPaiements}   onChange={setNotifPaiements} />
          <RowToggle label="Alertes récolte"         sublabel="Cycles arrivant à maturité"            value={notifRecoltes}    onChange={setNotifRecoltes} />
          <RowToggle label="Rappels avant récolte"   sublabel="3 jours, 1 jour avant la date"        value={rappelsRecolte}   onChange={setRappelsRecolte} />
          <RowToggle label="Evaluations clients"     sublabel="Notes reçues sur tes livraisons"       value={notifEvaluations} onChange={setNotifEvaluations} />
          <RowToggle label="Nouvelles offres marché" sublabel="Opportunités de vente sur Jùlaba"      value={notifOffres}      onChange={setNotifOffres} />
        </Section>

        {/* PRODUCTION */}
        <Section title="Production" icon={Leaf}>
          <RowAction label="Mes récoltes" sublabel="Voir et gérer toutes mes récoltes" onClick={() => navigate('/producteur/mes-recoltes')} />
          <RowAction label="Mon calendrier agricole" sublabel="Cycles en cours et à venir"
            onClick={() => { speak('Calendrier agricole'); navigate('/producteur/production'); }} />
        </Section>

        {/* WALLET */}
        <Section title="Wallet" icon={Wallet}>
          <RowAction label="Mon Wallet" sublabel="Solde, historique, recharge"
            onClick={() => navigate('/producteur/wallet')} />
        </Section>

        {/* ACCESSIBILITÉ */}
        <Section title="Accessibilité" icon={Mic}>
          <RowToggle label="Tantie Sagesse — Voix" sublabel="Guide vocal de la plateforme Jùlaba" value={vocale}   onChange={setVocale} />
          <RowToggle label="Mode sombre"            sublabel="Interface sombre (bêta)"             value={modeNuit} onChange={setModeNuit} />
        </Section>

        {/* COMPTE */}
        <Section title="Compte" icon={Lock}>
          <RowAction label="Informations personnelles" sublabel="Modifier mon profil" onClick={() => navigate('/producteur/profil')} />
          <RowAction label="Support et aide" sublabel="Contacter l'équipe JÙLABA" icon={Headphones} onClick={() => navigate('/producteur/support')} />
          <RowAction label="Se déconnecter" sublabel="Retour à la connexion" danger icon={X} onClick={() => setShowLogout(true)} />
        </Section>
      </div>

      <ModalDanger
        isOpen={showLogout}
        title="Se déconnecter ?"
        message="Tu seras redirigé vers la page de connexion Jùlaba."
        onConfirm={() => { speak('Déconnexion'); navigate('/'); }}
        onClose={() => setShowLogout(false)}
      />
    </div>
  );
}