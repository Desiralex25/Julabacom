import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Bell,
  Shield,
  Lock,
  Check,
  X,
  Mic,
  Moon,
  ChevronRight,
  AlertTriangle,
  RefreshCw,
  Smartphone,
  Users,
  Save,
  ShoppingCart,
  TrendingUp,
  PieChart,
  BarChart3,
  Headphones,
  Wallet,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { useUser } from '../../contexts/UserContext';
import { useApp } from '../../contexts/AppContext';
import { useCooperative } from '../../contexts/CooperativeContext';
import { toast } from 'sonner';

const COLOR = '#2072AF';

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

function RowAction({ label, sublabel, icon: Icon, danger, badge, onClick }: {
  label: string; sublabel?: string; icon?: React.ElementType; danger?: boolean; badge?: number; onClick: () => void;
}) {
  return (
    <motion.button onClick={onClick} className="w-full flex items-center justify-between px-5 py-4 text-left" whileTap={{ scale: 0.99 }}>
      <div className="flex-1">
        <p className="font-semibold" style={{ color: danger ? '#DC2626' : '#111827' }}>{label}</p>
        {sublabel && <p className="text-xs text-gray-500 mt-0.5">{sublabel}</p>}
      </div>
      <div className="flex items-center gap-2">
        {badge !== undefined && badge > 0 && (
          <div className="w-6 h-6 rounded-full flex items-center justify-center bg-red-500">
            <span className="text-white text-xs font-bold">{badge}</span>
          </div>
        )}
        {Icon ? <Icon className="w-5 h-5" style={{ color: danger ? '#DC2626' : '#9CA3AF' }} /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
      </div>
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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-5" onClick={onClose}>
          <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}
            onClick={e => e.stopPropagation()} className="bg-white rounded-3xl p-6 w-full max-w-sm">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">{title}</h3>
            <p className="text-sm text-gray-600 text-center mb-6">{message}</p>
            <div className="flex gap-3">
              <motion.button onClick={onClose} className="flex-1 py-3 rounded-2xl border-2 border-gray-200 font-semibold text-gray-700" whileTap={{ scale: 0.97 }}>Annuler</motion.button>
              <motion.button onClick={() => { onConfirm(); onClose(); }} className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-semibold" whileTap={{ scale: 0.97 }}>Confirmer</motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Modal seuil de cotisation ────────────────────────────────

function ModalSeuilCotisation({ isOpen, onClose, seuilActuel, onSave }: {
  isOpen: boolean; onClose: () => void; seuilActuel: number; onSave: (s: number) => void;
}) {
  const [val, setVal] = useState(String(seuilActuel));
  const [done, setDone] = useState(false);

  const handleSave = () => {
    const n = parseInt(val, 10);
    if (!n || n < 500) return;
    onSave(n);
    setDone(true);
    setTimeout(() => { setDone(false); onClose(); }, 1500);
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
              <h2 className="text-xl font-bold text-gray-900">Seuil de cotisation</h2>
              <motion.button onClick={onClose} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center" whileTap={{ scale: 0.9 }}>
                <X className="w-5 h-5 text-gray-600" />
              </motion.button>
            </div>
            <AnimatePresence mode="wait">
              {done ? (
                <motion.div key="done" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center gap-4 py-8">
                  <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="w-8 h-8 text-white" strokeWidth={3} />
                  </div>
                  <p className="font-bold text-gray-900">Seuil mis à jour</p>
                </motion.div>
              ) : (
                <motion.div key="form" className="space-y-4">
                  <p className="text-sm text-gray-600">Définissez le montant minimum de cotisation mensuelle par membre.</p>
                  <input type="number" inputMode="numeric" value={val} onChange={e => setVal(e.target.value)}
                    className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 text-2xl font-bold text-center focus:outline-none"
                    onFocus={e => (e.target.style.borderColor = COLOR)} onBlur={e => (e.target.style.borderColor = '#E5E7EB')} />
                  <p className="text-xs text-gray-500 text-center">Seuil actuel : {seuilActuel.toLocaleString('fr-FR')} FCFA</p>
                  <div className="flex gap-2">
                    {[1000, 2500, 5000, 10000].map(m => (
                      <motion.button key={m} onClick={() => setVal(String(m))}
                        className="flex-1 py-2 rounded-xl border-2 text-sm font-semibold"
                        style={{ borderColor: `${COLOR}40`, color: COLOR }} whileTap={{ scale: 0.95 }}>
                        {m >= 1000 ? `${m / 1000}k` : m}
                      </motion.button>
                    ))}
                  </div>
                  <motion.button onClick={handleSave}
                    className="w-full py-4 rounded-2xl text-white font-bold" style={{ backgroundColor: COLOR }} whileTap={{ scale: 0.98 }}>
                    Enregistrer
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

// ── Page principale ───────────────────────────────────────────

export function CooperativeParametres() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { speak, isOnline } = useApp();
  const { membres, stats, getTotalCotisations } = useCooperative();

  const [notifMembres,       setNotifMembres]       = useState(true);
  const [notifCotisations,   setNotifCotisations]   = useState(true);
  const [notifCommandes,     setNotifCommandes]      = useState(true);
  const [notifDistributions, setNotifDistributions] = useState(true);
  const [rapportMensuel,     setRapportMensuel]     = useState(true);
  const [vocale,             setVocale]             = useState(true);
  const [modeNuit,           setModeNuit]           = useState(false);
  const [seuilCotisation,    setSeuilCotisation]    = useState(5000);
  const [showSeuil,          setShowSeuil]          = useState(false);
  const [showLogout,         setShowLogout]         = useState(false);
  const [saved,              setSaved]              = useState(false);

  const membresInactifs = membres.filter(m => !m.cotisationPayee).length;

  const handleSave = () => {
    setSaved(true);
    speak('Paramètres sauvegardés');
    toast.success('Paramètres sauvegardés');
    setTimeout(() => setSaved(false), 2500);
  };

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
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white font-bold">{user ? `${user.firstName} ${user.lastName}` : 'Coopérative'}</p>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`} />
                <p className="text-white/70 text-sm">{membres.length} membres</p>
                {membresInactifs > 0 && (
                  <div className="px-2 py-0.5 rounded-full bg-red-500/80 flex items-center gap-1">
                    <span className="text-white text-xs">{membresInactifs} cotis. en retard</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 space-y-4 pb-36">

        {/* NOTIFICATIONS */}
        <Section title="Notifications" icon={Bell}>
          <RowToggle label="Nouveau membre"         sublabel="Quand quelqu'un rejoint la coop"       value={notifMembres}       onChange={setNotifMembres} />
          <RowToggle label="Cotisations reçues"     sublabel="Chaque paiement de cotisation"         value={notifCotisations}   onChange={setNotifCotisations} />
          <RowToggle label="Commandes groupées"     sublabel="Validations et mises à jour"           value={notifCommandes}     onChange={setNotifCommandes} />
          <RowToggle label="Distributions prêtes"  sublabel="Quand un lot est prêt à distribuer"    value={notifDistributions} onChange={setNotifDistributions} />
        </Section>

        {/* GESTION COOPÉRATIVE */}
        <Section title="Gestion" icon={Users}>
          <RowAction label="Seuil de cotisation mensuelle"
            sublabel={`Actuel : ${seuilCotisation.toLocaleString('fr-FR')} FCFA`}
            badge={membresInactifs}
            onClick={() => setShowSeuil(true)} />
          <RowToggle label="Rapport mensuel automatique" sublabel="Envoyé le 1er de chaque mois" value={rapportMensuel} onChange={setRapportMensuel} />
          <RowAction label="Finances de la coopérative" sublabel="Trésorerie et transactions" onClick={() => navigate('/cooperative/finances')} />
        </Section>

        {/* WALLET */}
        <Section title="Wallet" icon={Wallet}>
          <RowAction label="Mon Wallet" sublabel="Solde de la coopérative"
            onClick={() => navigate('/cooperative/wallet')} />
        </Section>

        {/* ACCESSIBILITÉ */}
        <Section title="Accessibilité" icon={Mic}>
          <RowToggle label="Tantie Sagesse — Voix" sublabel="Guide vocal Jùlaba" value={vocale}   onChange={setVocale} />
          <RowToggle label="Mode sombre"            sublabel="Interface sombre (bêta)"             value={modeNuit} onChange={setModeNuit} />
        </Section>

        {/* COMPTE */}
        <Section title="Compte" icon={Lock}>
          <RowAction label="Informations de la coopérative" sublabel="Nom, localisation, contact" onClick={() => navigate('/cooperative/profil')} />
          <RowAction label="Support et aide" sublabel="Contacter l'équipe JÙLABA" icon={Headphones} onClick={() => navigate('/cooperative/support')} />
          <RowAction label="Se déconnecter" danger icon={X} onClick={() => setShowLogout(true)} />
        </Section>
      </div>

      <ModalSeuilCotisation
        isOpen={showSeuil}
        onClose={() => setShowSeuil(false)}
        seuilActuel={seuilCotisation}
        onSave={s => { setSeuilCotisation(s); toast.success(`Seuil mis à jour : ${s.toLocaleString('fr-FR')} FCFA`); }}
      />
      <ModalDanger
        isOpen={showLogout}
        title="Se déconnecter ?"
        message="Vous serez redirigé vers la page de connexion Jùlaba."
        onConfirm={() => { speak('Déconnexion'); navigate('/login'); }}
        onClose={() => setShowLogout(false)}
      />
    </div>
  );
}