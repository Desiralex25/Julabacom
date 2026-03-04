import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Bell,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Moon,
  Sun,
  Mic,
  Wifi,
  Shield,
  Download,
  Trash2,
  ChevronRight,
  Check,
  RefreshCw,
  Database,
  AlertTriangle,
  Users,
  BarChart3,
  Smartphone,
  Mail,
  Phone,
  Building2,
  Save,
  X,
  Headphones,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { useApp } from '../../contexts/AppContext';
import { useUser } from '../../contexts/UserContext';
import { toast } from 'sonner';

const COLOR = '#712864';

// ── Toggle switch ────────────────────────────────────────────

function Toggle({ value, onChange, color = COLOR }: { value: boolean; onChange: (v: boolean) => void; color?: string }) {
  return (
    <motion.button
      onClick={() => onChange(!value)}
      className="relative w-12 h-6 rounded-full transition-colors"
      style={{ backgroundColor: value ? color : '#E5E7EB' }}
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

// ── Section générique ────────────────────────────────────────

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl border-2 border-gray-100 overflow-hidden"
    >
      <div
        className="flex items-center gap-3 px-5 py-4 border-b border-gray-100"
        style={{ background: `linear-gradient(90deg, ${COLOR}10 0%, transparent 100%)` }}
      >
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${COLOR}15` }}>
          <Icon className="w-5 h-5" style={{ color: COLOR }} />
        </div>
        <h3 className="font-bold text-gray-900">{title}</h3>
      </div>
      <div className="divide-y divide-gray-100">{children}</div>
    </motion.div>
  );
}

// ── Row toggle ───────────────────────────────────────────────

function RowToggle({
  label,
  sublabel,
  value,
  onChange,
}: {
  label: string;
  sublabel?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <div className="flex-1">
        <p className="font-semibold text-gray-900">{label}</p>
        {sublabel && <p className="text-xs text-gray-500 mt-0.5">{sublabel}</p>}
      </div>
      <Toggle value={value} onChange={onChange} />
    </div>
  );
}

// ── Row action ───────────────────────────────────────────────

function RowAction({
  label,
  sublabel,
  icon: Icon,
  danger,
  onClick,
}: {
  label: string;
  sublabel?: string;
  icon?: React.ElementType;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      className="w-full flex items-center justify-between px-5 py-4 text-left"
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex-1">
        <p className="font-semibold" style={{ color: danger ? '#DC2626' : '#111827' }}>{label}</p>
        {sublabel && <p className="text-xs text-gray-500 mt-0.5">{sublabel}</p>}
      </div>
      {Icon ? (
        <Icon className="w-5 h-5" style={{ color: danger ? '#DC2626' : '#9CA3AF' }} />
      ) : (
        <ChevronRight className="w-5 h-5 text-gray-400" />
      )}
    </motion.button>
  );
}

// ── Modal alerte danger ───────────────────────────────────────

function ModalDanger({
  isOpen,
  title,
  message,
  onConfirm,
  onClose,
}: {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-5"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-3xl p-6 w-full max-w-sm"
          >
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">{title}</h3>
            <p className="text-sm text-gray-600 text-center mb-6">{message}</p>
            <div className="flex gap-3">
              <motion.button
                onClick={onClose}
                className="flex-1 py-3 rounded-2xl border-2 border-gray-200 font-semibold text-gray-700"
                whileTap={{ scale: 0.97 }}
              >
                Annuler
              </motion.button>
              <motion.button
                onClick={() => { onConfirm(); onClose(); }}
                className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-semibold"
                whileTap={{ scale: 0.97 }}
              >
                Confirmer
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Page principale ──────────────────────────────────────────

export function InstitutionParametres() {
  const navigate = useNavigate();
  const { speak, isOnline } = useApp();
  const { user } = useUser();

  // États des paramètres
  const [notifEmail,         setNotifEmail]         = useState(true);
  const [notifSMS,           setNotifSMS]           = useState(false);
  const [notifPush,          setNotifPush]          = useState(true);
  const [alertesFraude,      setAlertesFraude]      = useState(true);
  const [alertesBaisseAct,   setAlertesBaisseAct]   = useState(true);
  const [alertesPicTrans,    setAlertesPicTrans]     = useState(true);
  const [modeNuit,           setModeNuit]           = useState(false);
  const [vocaleActive,       setVocaleActive]       = useState(true);
  const [langFr,             setLangFr]             = useState(true);
  const [autoExport,         setAutoExport]         = useState(false);
  const [rapportHebdo,       setRapportHebdo]       = useState(true);
  const [showConfirmLogout,  setShowConfirmLogout]  = useState(false);
  const [showConfirmReset,   setShowConfirmReset]   = useState(false);
  const [saved, setSaved]                           = useState(false);

  const handleSave = () => {
    setSaved(true);
    speak('Paramètres sauvegardés');
    toast.success('Paramètres sauvegardés');
    setTimeout(() => setSaved(false), 2500);
  };

  const handleExportLogs = () => {
    speak('Export des journaux en cours');
    toast.success('Export des journaux démarré — disponible dans 2 minutes');
  };

  const handleResetCache = () => {
    speak('Cache système réinitialisé');
    toast.success('Cache effacé avec succès');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div
        className="relative pb-6 pt-safe"
        style={{ background: `linear-gradient(145deg, ${COLOR} 0%, ${COLOR}CC 100%)` }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -translate-y-6 translate-x-6" />
        <div className="relative flex items-center justify-between px-5 pt-5 pb-2">
          <motion.button
            onClick={() => navigate(-1)}
            className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center"
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </motion.button>
          <span className="text-white font-bold text-lg">Paramètres</span>
          <motion.button
            onClick={handleSave}
            className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: saved ? '#16A34A' : 'rgba(255,255,255,0.2)' }}
            whileTap={{ scale: 0.9 }}
          >
            {saved
              ? <Check className="w-5 h-5 text-white" strokeWidth={3} />
              : <Save className="w-5 h-5 text-white" />
            }
          </motion.button>
        </div>

        {/* Info profil */}
        <div className="relative px-5 pt-2">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/15 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white font-bold">{user ? `${user.firstName} ${user.lastName}` : 'Institution'}</p>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`} />
                <p className="text-white/70 text-sm">{isOnline ? 'En ligne' : 'Hors ligne'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 space-y-4 pb-36">

        {/* NOTIFICATIONS */}
        <Section title="Notifications" icon={Bell}>
          <RowToggle label="Alertes par e-mail"        sublabel="Rapports et alertes critiques"        value={notifEmail}       onChange={setNotifEmail} />
          <RowToggle label="Alertes par SMS"           sublabel="Fraudes et incidents urgents"         value={notifSMS}         onChange={setNotifSMS} />
          <RowToggle label="Notifications push"        sublabel="Sur cet appareil en temps réel"       value={notifPush}        onChange={setNotifPush} />
        </Section>

        {/* ALERTES MÉTIER */}
        <Section title="Alertes métier" icon={AlertTriangle}>
          <RowToggle label="Alertes fraude"            sublabel="Transactions suspectes et anomalies"  value={alertesFraude}    onChange={setAlertesFraude} />
          <RowToggle label="Baisses d'activité"        sublabel="Zones en déclin de plus de 30%"       value={alertesBaisseAct} onChange={setAlertesBaisseAct} />
          <RowToggle label="Pics de transactions"      sublabel="Volumes anormalement élevés"          value={alertesPicTrans}  onChange={setAlertesPicTrans} />
        </Section>

        {/* RAPPORTS */}
        <Section title="Rapports automatiques" icon={BarChart3}>
          <RowToggle label="Rapport hebdomadaire"      sublabel="Envoyé le lundi à 08h00"              value={rapportHebdo}     onChange={setRapportHebdo} />
          <RowToggle label="Export automatique CSV"    sublabel="Chaque fin de mois"                   value={autoExport}       onChange={setAutoExport} />
          <RowAction
            label="Exporter les journaux maintenant"
            sublabel="Télécharger les 30 derniers jours"
            icon={Download}
            onClick={handleExportLogs}
          />
        </Section>

        {/* ACCESSIBILITÉ */}
        <Section title="Accessibilité" icon={Mic}>
          <RowToggle label="Tantie Sagesse — Voix"    sublabel="Assistance vocale Jùlaba"             value={vocaleActive}     onChange={setVocaleActive} />
          <RowToggle label="Mode sombre"               sublabel="Interface sombre (bêta)"              value={modeNuit}         onChange={setModeNuit} />
          <RowToggle label="Langue française"          sublabel="Interface en français"                value={langFr}           onChange={setLangFr} />
        </Section>

        {/* SYSTÈME */}
        <Section title="Système" icon={Database}>
          <RowAction
            label="Réinitialiser le cache"
            sublabel="Efface les données temporaires locales"
            icon={RefreshCw}
            onClick={() => setShowConfirmReset(true)}
          />
          <RowAction
            label="Politique de confidentialité"
            sublabel="RGPD et données personnelles"
            onClick={() => { speak('Politique de confidentialité Jùlaba'); toast.info('Document disponible prochainement'); }}
          />
          <RowAction
            label="Version de l'application"
            sublabel="Jùlaba Institution v2.4.1"
            icon={Smartphone}
            onClick={() => {}}
          />
        </Section>

        {/* COMPTE */}
        <Section title="Compte" icon={Shield}>
          <RowAction
            label="Changer de mot de passe"
            sublabel="Sécurité de votre compte"
            icon={Lock}
            onClick={() => { speak('Changement de mot de passe'); toast.info('Fonctionnalité disponible bientôt'); }}
          />
          <RowAction
            label="Support et aide"
            sublabel="Contacter l'équipe JÙLABA"
            icon={Headphones}
            onClick={() => navigate('/institution/support')}
          />
          <RowAction
            label="Se déconnecter"
            sublabel="Vous serez redirigé vers la page de connexion"
            danger
            icon={X}
            onClick={() => setShowConfirmLogout(true)}
          />
        </Section>

        {/* Info système */}
        <div className="p-4 rounded-2xl bg-purple-50 border-2 border-purple-100 flex items-start gap-3">
          <Shield className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-purple-900">Données sécurisées</p>
            <p className="text-xs text-purple-600 mt-0.5">
              Toutes vos préférences sont stockées localement sur cet appareil. Aucune donnée sensible n'est transmise sans votre accord.
            </p>
          </div>
        </div>
      </div>

      {/* Modals confirmation */}
      <ModalDanger
        isOpen={showConfirmReset}
        title="Réinitialiser le cache ?"
        message="Cette action efface les données temporaires. Vos données métier sont conservées."
        onConfirm={handleResetCache}
        onClose={() => setShowConfirmReset(false)}
      />
      <ModalDanger
        isOpen={showConfirmLogout}
        title="Se déconnecter ?"
        message="Vous serez redirigé vers la page de connexion Jùlaba."
        onConfirm={() => { speak('Déconnexion en cours'); navigate('/login'); }}
        onClose={() => setShowConfirmLogout(false)}
      />
    </div>
  );
}
