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
  Globe,
  Smartphone,
  Package,
  ChevronRight,
  LogOut,
  AlertTriangle,
  RefreshCw,
  Volume2,
  Store,
  Save,
  Headphones,
  Wallet,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { useUser } from '../../contexts/UserContext';
import { useApp } from '../../contexts/AppContext';
import { useStock } from '../../contexts/StockContext';
import { toast } from 'sonner';

const COLOR = '#C66A2C';

// ── Toggle ───────────────────────────────────────────────────

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <motion.button
      onClick={() => onChange(!value)}
      className="relative w-12 h-6 rounded-full transition-colors flex-shrink-0"
      style={{ backgroundColor: value ? COLOR : '#E5E7EB' }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
        animate={{ left: value ? '28px' : '4px' }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      />
    </motion.button>
  );
}

// ── Section ──────────────────────────────────────────────────

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl border-2 border-gray-100 overflow-hidden"
    >
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

// ── Modal PIN ─────────────────────────────────────────────────

function ModalPIN({ isOpen, onClose, color, onSave, hasPinAlready }: {
  isOpen: boolean; onClose: () => void; color: string;
  onSave: (newPin: string, currentPin?: string) => void; hasPinAlready: boolean;
}) {
  const [current, setCurrent] = useState('');
  const [nouveau, setNouveau] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showC, setShowC] = useState(false);
  const [showN, setShowN] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState(false);

  const handleSave = () => {
    setErr('');
    if (nouveau.length !== 4) { setErr('Le code PIN doit contenir exactement 4 chiffres'); return; }
    if (nouveau !== confirm) { setErr('Les codes ne correspondent pas'); return; }
    if (nouveau === '0000' || nouveau === '1234') { setErr('Code trop simple — choisis un autre'); return; }
    onSave(nouveau, hasPinAlready ? current : undefined);
    setDone(true);
    setTimeout(() => { setDone(false); setCurrent(''); setNouveau(''); setConfirm(''); onClose(); }, 1800);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end" onClick={onClose}>
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 26 }}
            onClick={e => e.stopPropagation()} className="bg-white rounded-t-3xl w-full p-6 pb-10">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-5" />
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900">{hasPinAlready ? 'Modifier le PIN' : 'Créer un PIN'}</h2>
              <motion.button onClick={onClose} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center" whileTap={{ scale: 0.9 }}>
                <X className="w-5 h-5 text-gray-600" />
              </motion.button>
            </div>
            <AnimatePresence mode="wait">
              {done ? (
                <motion.div key="done" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center gap-4 py-8">
                  <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="w-10 h-10 text-white" strokeWidth={3} />
                  </div>
                  <p className="text-lg font-bold text-gray-900">PIN enregistré</p>
                </motion.div>
              ) : (
                <motion.div key="form" className="space-y-4">
                  {hasPinAlready && (
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">PIN actuel</label>
                      <div className="relative">
                        <input type={showC ? 'text' : 'password'} value={current}
                          onChange={e => setCurrent(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          placeholder="••••"
                          className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 focus:outline-none font-mono text-2xl text-center tracking-widest"
                          onFocus={e => (e.target.style.borderColor = color)} onBlur={e => (e.target.style.borderColor = '#E5E7EB')} />
                        <button type="button" onClick={() => setShowC(!showC)} className="absolute right-4 top-1/2 -translate-y-1/2">
                          {showC ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                        </button>
                      </div>
                    </div>
                  )}
                  {[
                    { label: 'Nouveau PIN (4 chiffres)', value: nouveau, onChange: setNouveau, show: showN, toggleShow: () => setShowN(!showN) },
                    { label: 'Confirmer le PIN', value: confirm, onChange: setConfirm, show: showN, toggleShow: () => setShowN(!showN) },
                  ].map(({ label, value, onChange, show, toggleShow }) => (
                    <div key={label}>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">{label}</label>
                      <div className="relative">
                        <input type={show ? 'text' : 'password'} value={value}
                          onChange={e => onChange(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          placeholder="••••"
                          className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 focus:outline-none font-mono text-2xl text-center tracking-widest"
                          onFocus={e => (e.target.style.borderColor = color)} onBlur={e => (e.target.style.borderColor = '#E5E7EB')} />
                        <button type="button" onClick={toggleShow} className="absolute right-4 top-1/2 -translate-y-1/2">
                          {show ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                        </button>
                      </div>
                    </div>
                  ))}
                  {err && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
                      <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <p className="text-sm text-red-600">{err}</p>
                    </div>
                  )}
                  <motion.button onClick={handleSave}
                    className="w-full py-4 rounded-2xl text-white font-bold text-lg"
                    style={{ backgroundColor: color }} whileTap={{ scale: 0.98 }}>
                    Enregistrer le PIN
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Modal danger ──────────────────────────────────────────────

function ModalDanger({ isOpen, title, message, onConfirm, onClose }: {
  isOpen: boolean; title: string; message: string; onConfirm: () => void; onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-5"
          onClick={onClose}>
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

// ── Page principale ───────────────────────────────────────────

export function Parametres() {
  const navigate = useNavigate();
  const { user, updateUser } = useUser();
  const { speak, isOnline } = useApp();
  const { getStockFaible } = useStock();

  const stockFaible = getStockFaible();

  // États settings
  const [pinEnabled,         setPinEnabled]         = useState(user?.pinSecurityEnabled || false);
  const [showPinModal,       setShowPinModal]        = useState(false);
  const [showLogoutConfirm,  setShowLogoutConfirm]   = useState(false);
  const [notifCommandes,     setNotifCommandes]      = useState(true);
  const [notifPaiements,     setNotifPaiements]      = useState(true);
  const [notifStockFaible,   setNotifStockFaible]    = useState(true);
  const [notifPromotions,    setNotifPromotions]     = useState(false);
  const [vocale,             setVocale]              = useState(true);
  const [modeNuit,           setModeNuit]            = useState(false);
  const [saved,              setSaved]               = useState(false);

  const handleSave = () => {
    setSaved(true);
    speak('Paramètres sauvegardés');
    toast.success('Paramètres sauvegardés');
    setTimeout(() => setSaved(false), 2500);
  };

  const handleSavePin = (newPin: string) => {
    updateUser({ pinSecurityEnabled: true, pinCode: newPin });
    setPinEnabled(true);
    speak('Code PIN enregistré avec succès');
    toast.success('Code PIN activé');
  };

  const handleDisablePin = () => {
    updateUser({ pinSecurityEnabled: false, pinCode: undefined });
    setPinEnabled(false);
    speak('Sécurité PIN désactivée');
    toast.success('PIN désactivé');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="relative pb-6 pt-safe"
        style={{ background: `linear-gradient(145deg, ${COLOR} 0%, ${COLOR}CC 100%)` }}>
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -translate-y-6 translate-x-6" />
        <div className="relative flex items-center justify-between px-5 pt-5 pb-2">
          <motion.button onClick={() => navigate(-1)}
            className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center" whileTap={{ scale: 0.9 }}>
            <ArrowLeft className="w-5 h-5 text-white" />
          </motion.button>
          <span className="text-white font-bold text-lg">Paramètres</span>
          <motion.button onClick={handleSave}
            className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: saved ? '#16A34A' : 'rgba(255,255,255,0.2)' }}
            whileTap={{ scale: 0.9 }}>
            {saved ? <Check className="w-5 h-5 text-white" strokeWidth={3} /> : <Save className="w-5 h-5 text-white" />}
          </motion.button>
        </div>

        {/* Status bar */}
        <div className="relative px-5 pt-2">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/15 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white font-bold">{user ? `${user.firstName} ${user.lastName}` : 'Marchand'}</p>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`} />
                <p className="text-white/70 text-sm">{isOnline ? 'En ligne' : 'Hors ligne'}</p>
                {stockFaible.length > 0 && (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/80">
                    <Package className="w-3 h-3 text-white" />
                    <span className="text-white text-xs">{stockFaible.length} stocks faibles</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 space-y-4 pb-36">

        {/* Stocks faibles — alerte visible */}
        {stockFaible.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-3xl bg-orange-50 border-2 border-orange-200 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-200 flex items-center justify-center flex-shrink-0">
              <Package className="w-5 h-5 text-orange-700" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-orange-900">{stockFaible.length} produit(s) en stock faible</p>
              <p className="text-xs text-orange-600 mt-0.5">
                {stockFaible.slice(0, 3).map(s => `${s.name} (${s.quantity} ${s.unit})`).join(' · ')}
              </p>
              <motion.button onClick={() => navigate('/marchand/stock')}
                className="mt-2 px-3 py-1.5 rounded-xl text-xs font-bold text-white"
                style={{ backgroundColor: COLOR }} whileTap={{ scale: 0.95 }}>
                Voir les stocks
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* NOTIFICATIONS */}
        <Section title="Notifications" icon={Bell}>
          <RowToggle label="Nouvelles commandes"    sublabel="Alertes immédiates sur chaque commande" value={notifCommandes}   onChange={setNotifCommandes} />
          <RowToggle label="Paiements"              sublabel="Confirmation et echecs de paiement"     value={notifPaiements}   onChange={setNotifPaiements} />
          <RowToggle label="Alertes stock faible"   sublabel="Quand un produit passe sous le seuil"   value={notifStockFaible} onChange={setNotifStockFaible} />
          <RowToggle label="Promotions Jùlaba"      sublabel="Offres et nouveautés de la plateforme"  value={notifPromotions}  onChange={setNotifPromotions} />
        </Section>

        {/* SÉCURITÉ */}
        <Section title="Sécurité" icon={Shield}>
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex-1 pr-4">
              <p className="font-semibold text-gray-900">Code PIN Wallet</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {pinEnabled ? 'PIN activé — paiements sécurisés' : 'Active le PIN pour sécuriser tes paiements'}
              </p>
              {pinEnabled && (
                <motion.button onClick={() => setShowPinModal(true)}
                  className="mt-1 text-xs font-bold" style={{ color: COLOR }} whileTap={{ scale: 0.95 }}>
                  Modifier le PIN
                </motion.button>
              )}
            </div>
            <Toggle value={pinEnabled} onChange={v => v ? setShowPinModal(true) : handleDisablePin()} />
          </div>
          <RowAction label="Historique des connexions" sublabel="Voir les accès récents à ton compte"
            onClick={() => { speak('Historique des connexions'); toast.info('Disponible prochainement'); }} />
        </Section>



        {/* WALLET */}
        <Section title="Wallet" icon={Wallet}>
          <RowAction label="Mon Wallet complet" sublabel="Historique, recharge, retrait"
            onClick={() => navigate('/marchand/wallet')} />
          <RowAction label="Fournisseurs Mobile Money" sublabel="Orange Money · MTN · Moov · Wave"
            onClick={() => { toast.info('Tous les fournisseurs sont actifs'); }} />
        </Section>

        {/* ACCESSIBILITÉ */}
        <Section title="Accessibilité" icon={Mic}>
          <RowToggle label="Tantie Sagesse — Voix" sublabel="Guide vocal de la plateforme Jùlaba" value={vocale}   onChange={setVocale} />
          <RowToggle label="Mode sombre"            sublabel="Interface sombre (bêta)"             value={modeNuit} onChange={setModeNuit} />
        </Section>

        {/* SYSTÈME */}
        <Section title="Système" icon={RefreshCw}>
          <RowAction label="Vider le cache local" sublabel="Données temporaires uniquement"
            onClick={() => { speak('Cache effacé'); toast.success('Cache vidé avec succès'); }} />
          <RowAction label="Version de l'app" sublabel="Jùlaba Marchand v2.4.1"
            icon={Smartphone} onClick={() => {}} />
        </Section>

        {/* COMPTE */}
        <Section title="Compte" icon={Lock}>
          <RowAction label="Support et aide" sublabel="Contacter l'équipe JÙLABA"
            icon={Headphones} onClick={() => navigate('/marchand/support')} />
          <RowAction label="Se déconnecter" sublabel="Retour à l'écran de connexion"
            danger icon={X} onClick={() => setShowLogoutConfirm(true)} />
        </Section>

        <div className="p-4 rounded-2xl bg-orange-50 border-2 border-orange-100 flex items-start gap-3">
          <Shield className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-orange-700">
            <span className="font-bold">Sécurité :</span> Tes données de vente et ton wallet sont protégés localement sur cet appareil.
          </p>
        </div>
      </div>

      <ModalPIN
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        color={COLOR}
        onSave={handleSavePin}
        hasPinAlready={!!user?.pinSecurityEnabled}
      />
      <ModalDanger
        isOpen={showLogoutConfirm}
        title="Se déconnecter ?"
        message="Tu seras redirigé vers la page de connexion Jùlaba."
        onConfirm={() => { speak('Déconnexion'); navigate('/login'); }}
        onClose={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
}