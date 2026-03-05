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
  Wallet,
  ChevronRight,
  AlertTriangle,
  MapPin,
  Target,
  BarChart3,
  Save,
  UserCheck,
  Clock,
  TrendingUp,
  Smartphone,
  RefreshCw,
  Award,
  Zap,
  Headphones,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { useUser } from '../../contexts/UserContext';
import { useApp } from '../../contexts/AppContext';
import { useIdentificateur } from '../../contexts/IdentificateurContext';
import { toast } from 'sonner';

const COLOR = '#9F8170';

// ── Composants réutilisables ─────────────────────────────────

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <motion.button
      onClick={() => onChange(!value)}
      className="relative w-12 h-6 rounded-full flex-shrink-0 transition-colors"
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

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl border-2 border-gray-100 overflow-hidden"
    >
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100"
        style={{ background: `linear-gradient(90deg, ${COLOR}10 0%, transparent 100%)` }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${COLOR}18` }}>
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
          <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">{badge}</span>
          </div>
        )}
        {Icon ? <Icon className="w-5 h-5" style={{ color: danger ? '#DC2626' : '#9CA3AF' }} /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
      </div>
    </motion.button>
  );
}

// ── Modal Objectif mensuel ────────────────────────────────────

function ModalObjectif({ isOpen, onClose, actuel, onSave }: {
  isOpen: boolean; onClose: () => void; actuel: number; onSave: (n: number) => void;
}) {
  const [val, setVal] = useState(String(actuel));
  const [done, setDone] = useState(false);

  const handleSave = () => {
    const n = parseInt(val, 10);
    if (!n || n < 1) return;
    onSave(n);
    setDone(true);
    setTimeout(() => { setDone(false); onClose(); }, 1400);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-end" onClick={onClose}>
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 26 }}
            onClick={e => e.stopPropagation()} className="bg-white rounded-t-3xl w-full p-6 pb-10">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-5" />
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900">Objectif mensuel</h2>
              <motion.button onClick={onClose} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center" whileTap={{ scale: 0.9 }}>
                <X className="w-5 h-5 text-gray-600" />
              </motion.button>
            </div>
            <AnimatePresence mode="wait">
              {done ? (
                <motion.div key="done" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center gap-4 py-8">
                  <motion.div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center"
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                    <Check className="w-8 h-8 text-white" strokeWidth={3} />
                  </motion.div>
                  <p className="font-bold text-gray-900">Objectif mis à jour</p>
                </motion.div>
              ) : (
                <motion.div key="form" className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Nombre d'identifications à réaliser par mois. Cela t'aide à suivre tes performances.
                  </p>
                  <input
                    type="number" inputMode="numeric" value={val}
                    onChange={e => setVal(e.target.value)}
                    className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 text-3xl font-bold text-center focus:outline-none"
                    onFocus={e => (e.target.style.borderColor = COLOR)}
                    onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
                  />
                  <div className="grid grid-cols-4 gap-2">
                    {[10, 20, 30, 50].map(n => (
                      <motion.button key={n} onClick={() => setVal(String(n))}
                        className="py-2 rounded-xl border-2 text-sm font-semibold"
                        style={{ borderColor: `${COLOR}40`, color: COLOR }} whileTap={{ scale: 0.95 }}>
                        {n}
                      </motion.button>
                    ))}
                  </div>
                  <motion.button onClick={handleSave}
                    className="w-full py-4 rounded-2xl text-white font-bold text-lg"
                    style={{ backgroundColor: COLOR }} whileTap={{ scale: 0.98 }}>
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

// ── Modal danger ──────────────────────────────────────────────

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
              <motion.button onClick={onClose} className="flex-1 py-3 rounded-2xl border-2 border-gray-200 font-semibold text-gray-700" whileTap={{ scale: 0.97 }}>Annuler</motion.button>
              <motion.button onClick={() => { onConfirm(); onClose(); }} className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-semibold" whileTap={{ scale: 0.97 }}>Confirmer</motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Page principale ───────────────────────────────────────────

export function IdentificateurParametres() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { speak, isOnline } = useApp();
  const { stats, identifications, commissions, getStatsIdentificateur } = useIdentificateur();
  const fullStats = user?.id ? getStatsIdentificateur(user.id) : null;
  const commissionsEnAttente = commissions.filter(c => !c.dateVersement || c.dateVersement === '').length;

  const [notifDossiers,    setNotifDossiers]    = useState(true);
  const [notifValidations, setNotifValidations] = useState(true);
  const [notifRejets,      setNotifRejets]      = useState(true);
  const [notifCommissions, setNotifCommissions] = useState(true);
  const [notifObjectifs,   setNotifObjectifs]   = useState(true);
  const [notifOffres,      setNotifOffres]      = useState(false);
  const [vocale,           setVocale]           = useState(true);
  const [modeNuit,         setModeNuit]         = useState(false);
  const [objectifMensuel,  setObjectifMensuel]  = useState(20);
  const [showObjectif,     setShowObjectif]     = useState(false);
  const [showLogout,       setShowLogout]       = useState(false);
  const [saved,            setSaved]            = useState(false);

  const dossierEnAttente = commissionsEnAttente || 0;
  const tauxRealisation = objectifMensuel > 0
    ? Math.round(((fullStats?.identificationsValides || 0) / objectifMensuel) * 100)
    : 0;

  const handleSave = () => {
    setSaved(true);
    speak('Paramètres sauvegardés');
    toast.success('Paramètres sauvegardés');
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER ─────────────────────────────────────────────── */}
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
            style={{ backgroundColor: saved ? '#16A34A' : 'rgba(255,255,255,0.2)' }} whileTap={{ scale: 0.9 }}>
            {saved ? <Check className="w-5 h-5 text-white" strokeWidth={3} /> : <Save className="w-5 h-5 text-white" />}
          </motion.button>
        </div>

        {/* Carte identité */}
        <div className="relative px-5 pt-2">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/15 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white font-bold">{user ? `${user.firstName} ${user.lastName}` : 'Identificateur'}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`} />
                <p className="text-white/70 text-sm">{isOnline ? 'En ligne' : 'Hors ligne'}</p>
                {dossierEnAttente > 0 && (
                  <div className="px-2 py-0.5 rounded-full bg-amber-500/80">
                    <span className="text-white text-xs">{dossierEnAttente} commission(s)</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STATS RAPIDES */}
      <div className="px-5 pt-4 grid grid-cols-3 gap-3">
        {[
          { label: 'Identifications', value: fullStats?.totalIdentifications || stats.identificationsTotal || 0, icon: UserCheck, color: '#16A34A' },
          { label: 'Objectif %', value: `${Math.min(tauxRealisation, 100)}%`, icon: Target, color: COLOR },
          { label: 'Commissions', value: `${(((fullStats?.totalCommissions || stats.commissionsTotal) || 0) / 1000).toFixed(0)}k`, icon: Award, color: '#D97706' },
        ].map(({ label, value, icon: Icon, color }, i) => (
          <motion.div key={label}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="bg-white rounded-2xl p-3 border-2 border-gray-100 text-center">
            <div className="w-8 h-8 rounded-xl mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <p className="font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </motion.div>
        ))}
      </div>

      <div className="px-5 py-4 space-y-4 pb-36">

        {/* NOTIFICATIONS */}
        <Section title="Notifications" icon={Bell}>
          <RowToggle label="Dossiers assignés"     sublabel="Quand un nouveau dossier t'est confié"   value={notifDossiers}    onChange={setNotifDossiers} />
          <RowToggle label="Validations BO"         sublabel="Confirmation de tes soumissions"          value={notifValidations} onChange={setNotifValidations} />
          <RowToggle label="Dossiers rejetés"       sublabel="Avec la raison du rejet"                  value={notifRejets}      onChange={setNotifRejets} />
          <RowToggle label="Commissions disponibles" sublabel="Paiement de commission prêt"             value={notifCommissions} onChange={setNotifCommissions} />
          <RowToggle label="Objectif mensuel"       sublabel="Rappel si tu es en retard sur l'objectif" value={notifObjectifs}   onChange={setNotifObjectifs} />
          <RowToggle label="Offres de formation"    sublabel="Academy Jùlaba et certifications"         value={notifOffres}      onChange={setNotifOffres} />
        </Section>

        {/* OBJECTIFS */}
        <Section title="Mes objectifs" icon={Target}>
          <RowAction
            label="Objectif d'identifications"
            sublabel={`Actuel : ${objectifMensuel} identifications / mois · Réalisé : ${tauxRealisation}%`}
            onClick={() => setShowObjectif(true)}
          />
          <RowAction
            label="Mes performances"
            sublabel="Statistiques détaillées par zone"
            onClick={() => navigate('/identificateur/statistiques')}
          />
        </Section>

        {/* ZONE */}
        <Section title="Zone de travail" icon={MapPin}>
          <RowAction
            label="Ma zone assignée"
            sublabel={user?.zone || 'Zone non définie'}
            icon={MapPin}
            onClick={() => { toast.info('Demandez un changement de zone à votre superviseur'); }}
          />
          <RowAction
            label="Historique des identifications"
            sublabel="Tous mes dossiers soumis"
            onClick={() => navigate('/identificateur/identifications')}
          />
        </Section>

        {/* WALLET */}
        <Section title="Wallet & Commissions" icon={Wallet}>
          <RowAction
            label="Mon Wallet"
            sublabel="Solde et historique de commissions"
            onClick={() => navigate('/identificateur/wallet')}
          />
          {dossierEnAttente > 0 && (
            <RowAction
              label="Commissions en attente"
              sublabel={`${dossierEnAttente} commission(s) à percevoir`}
              badge={dossierEnAttente}
              onClick={() => navigate('/identificateur/wallet')}
            />
          )}
        </Section>

        {/* ACCESSIBILITÉ */}
        <Section title="Accessibilité" icon={Mic}>
          <RowToggle label="Tantie Sagesse — Voix" sublabel="Guide vocal Jùlaba" value={vocale}   onChange={setVocale} />
          <RowToggle label="Mode sombre"            sublabel="Interface sombre (bêta)"             value={modeNuit} onChange={setModeNuit} />
        </Section>

        {/* SYSTÈME */}
        <Section title="Système" icon={RefreshCw}>
          <RowAction label="Version de l'app" sublabel="Jùlaba Identificateur v2.4.1" icon={Smartphone} onClick={() => {}} />
          <RowAction label="Vider le cache"  sublabel="Données temporaires uniquement"
            onClick={() => { speak('Cache effacé'); toast.success('Cache vidé'); }} />
        </Section>

        {/* COMPTE */}
        <Section title="Compte" icon={Lock}>
          <RowAction label="Mon profil" sublabel="Modifier mes informations"
            onClick={() => navigate('/identificateur/profil')} />
          <RowAction label="Support et aide" sublabel="Contacter l'équipe JÙLABA" icon={Headphones} onClick={() => navigate('/identificateur/support')} />
          <RowAction label="Se déconnecter" danger icon={X} onClick={() => setShowLogout(true)} />
        </Section>

        {/* Bandeau sécurité */}
        <div className="p-4 rounded-2xl bg-stone-50 border-2 border-stone-100 flex items-start gap-3">
          <Shield className="w-5 h-5 text-stone-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-stone-600">
            <span className="font-bold">Confidentialité :</span> Les données des acteurs identifiés sont protégées et ne sont accessibles qu'au Back Office Jùlaba.
          </p>
        </div>
      </div>

      <ModalObjectif
        isOpen={showObjectif}
        onClose={() => setShowObjectif(false)}
        actuel={objectifMensuel}
        onSave={n => {
          setObjectifMensuel(n);
          toast.success(`Objectif mis à jour : ${n} identifications/mois`);
        }}
      />
      <ModalDanger
        isOpen={showLogout}
        title="Se déconnecter ?"
        message="Vous serez redirigé vers la page de connexion Jùlaba."
        onConfirm={() => { speak('Déconnexion'); navigate('/'); }}
        onClose={() => setShowLogout(false)}
      />
    </div>
  );
}