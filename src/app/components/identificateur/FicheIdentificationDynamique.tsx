import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, ArrowRight, Camera, Upload, User, Phone, MapPin,
  ShoppingBag, Building2, Sprout, Store, CheckCircle, X,
  FileText, Navigation, Users, Star, Layers, RotateCcw,
  Briefcase, ChevronDown, AlertCircle, CheckCircle2,
  Clock, Send, ShieldCheck, Info, Zap, Trophy
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';
import { useUser } from '../../contexts/UserContext';
import { useApp } from '../../contexts/AppContext';
import { useIdentificateur } from '../../contexts/IdentificateurContext';

/* ═══════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════ */
type ProfilType = 'marchand' | 'producteur' | 'cooperative' | null;

interface ProfileConfig {
  label: string;
  color: string;
  colorDark: string;
  lightColor: string;
  borderColor: string;
  gradientFrom: string;
  gradientBg: string;
  icon: React.FC<{ className?: string; style?: React.CSSProperties }>;
  steps: StepConfig[];
  desc: string;
  stepsCount: string;
}

interface StepConfig {
  id: string;
  label: string;
  icon: React.FC<{ className?: string; style?: React.CSSProperties }>;
  tip: string;
}

/* ═══════════════════════════════════════════════════
   PROFIL CONFIGS
═══════════════════════════════════════════════════ */
const PROFILES: Record<string, ProfileConfig> = {
  marchand: {
    label: 'Marchand',
    color: '#C66A2C',
    colorDark: '#A3551F',
    lightColor: 'rgba(198,106,44,0.12)',
    borderColor: '#C66A2C',
    gradientFrom: 'from-orange-50',
    gradientBg: 'linear-gradient(135deg, #FFF7ED 0%, #FFFBF5 100%)',
    icon: Store,
    desc: 'Commerçant sur le marché vivrier',
    stepsCount: '6 étapes',
    steps: [
      { id: 'photo',       label: 'Photo',    icon: Camera,      tip: 'Une belle photo claire du visage' },
      { id: 'identite',    label: 'Identité', icon: User,        tip: 'Nom, prénom, date de naissance' },
      { id: 'contact',     label: 'Contact',  icon: Phone,       tip: 'Numéro de téléphone principal' },
      { id: 'lieu',        label: 'Lieu',     icon: MapPin,      tip: 'Commune et marché d\'exercice' },
      { id: 'activite',    label: 'Activité', icon: ShoppingBag, tip: 'Produits vendus et expérience' },
      { id: 'finalisation',label: 'Validation',icon: CheckCircle, tip: 'GPS, signature et envoi' },
    ],
  },
  producteur: {
    label: 'Producteur',
    color: '#2E8B57',
    colorDark: '#1F6B41',
    lightColor: 'rgba(46,139,87,0.12)',
    borderColor: '#2E8B57',
    gradientFrom: 'from-green-50',
    gradientBg: 'linear-gradient(135deg, #F0FDF4 0%, #F9FFF9 100%)',
    icon: Sprout,
    desc: 'Agriculteur ou éleveur',
    stepsCount: '6 étapes',
    steps: [
      { id: 'photo',       label: 'Photo',    icon: Camera,      tip: 'Photo claire du producteur' },
      { id: 'identite',    label: 'Identité', icon: User,        tip: 'Nom, prénom, date de naissance' },
      { id: 'contact',     label: 'Contact',  icon: Phone,       tip: 'Numéro de téléphone principal' },
      { id: 'lieu',        label: 'Zone',     icon: MapPin,      tip: 'Village et zone de production' },
      { id: 'activite',    label: 'Culture',  icon: Sprout,      tip: 'Filières et superficie' },
      { id: 'finalisation',label: 'Validation',icon: CheckCircle, tip: 'GPS, signature et envoi' },
    ],
  },
  cooperative: {
    label: 'Coopérative',
    color: '#2072AF',
    colorDark: '#185A8C',
    lightColor: 'rgba(32,114,175,0.12)',
    borderColor: '#2072AF',
    gradientFrom: 'from-blue-50',
    gradientBg: 'linear-gradient(135deg, #EFF6FF 0%, #F9FBFF 100%)',
    icon: Building2,
    desc: 'Groupement ou coopérative agricole',
    stepsCount: '7 étapes',
    steps: [
      { id: 'photo',       label: 'Photo',     icon: Camera,      tip: 'Photo du dirigeant principal' },
      { id: 'dirigeant',   label: 'Dirigeant', icon: User,        tip: 'Identité du responsable' },
      { id: 'cooperative', label: 'Structure', icon: Building2,   tip: 'Nom et infos légales' },
      { id: 'contact',     label: 'Contact',   icon: Phone,       tip: 'Téléphone et adresse siège' },
      { id: 'localisation',label: 'Siège',     icon: MapPin,      tip: 'Commune et zone couverte' },
      { id: 'activite',    label: 'Activité',  icon: Layers,      tip: 'Filières de la coopérative' },
      { id: 'finalisation',label: 'Validation',icon: CheckCircle, tip: 'GPS, signature et envoi' },
    ],
  },
};

const FILIERES = [
  'Maïs','Manioc','Igname','Riz','Banane plantain','Banane douce',
  'Tomate','Aubergine','Piment','Gombo','Patate douce','Taro',
  'Haricot','Arachide','Coton','Café','Cacao','Hévéa','Palmier à huile','Autres',
];

const COMMUNES_CI = [
  'Abidjan - Abobo','Abidjan - Adjamé','Abidjan - Attécoubé','Abidjan - Cocody',
  'Abidjan - Koumassi','Abidjan - Marcory','Abidjan - Plateau','Abidjan - Port-Bouët',
  'Abidjan - Treichville','Abidjan - Yopougon','Yamoussoukro','Bouaké','Daloa',
  'San-Pédro','Korhogo','Man','Gagnoa','Abengourou','Divo','Soubré','Autre',
];

const STATUTS_JURIDIQUES = [
  'Formelle (immatriculée)',
  'Informelle (non immatriculée)',
  'En cours d\'immatriculation',
];

/* ═══════════════════════════════════════════════════
   MICRO-COMPOSANTS UI
═══════════════════════════════════════════════════ */
function BigLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block mb-3 text-gray-800" style={{ fontSize: '1.05rem', fontWeight: 700 }}>
      {children} {required && <span className="text-red-500">*</span>}
    </label>
  );
}

function ErrMsg({ msg }: { msg: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6, height: 0 }}
      animate={{ opacity: 1, y: 0, height: 'auto' }}
      className="flex items-center gap-2 mt-2 text-red-500"
      style={{ fontSize: '0.88rem' }}
    >
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      <span>{msg}</span>
    </motion.div>
  );
}

function Field({ label, required, error, children }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <BigLabel required={required}>{label}</BigLabel>
      {children}
      {error && <ErrMsg msg={error} />}
    </div>
  );
}

function BigInput({ value, onChange, placeholder, type = 'text', inputMode, color, readOnly, rows }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
  type?: string; inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  color: string; readOnly?: boolean; rows?: number;
}) {
  const base = `w-full px-5 py-4 rounded-3xl border-2 border-gray-200 bg-white focus:outline-none transition-all`;
  const sizeStyle: React.CSSProperties = { fontSize: '1.05rem', fontWeight: 500 };

  if (rows) return (
    <textarea
      value={value} onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder} rows={rows} readOnly={readOnly}
      className={base} style={{ resize: 'none', ...sizeStyle }}
      onFocus={(e) => { e.target.style.borderColor = color; e.target.style.boxShadow = `0 0 0 4px ${color}18`; }}
      onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; }}
    />
  );

  return (
    <input
      type={type} value={value} onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder} inputMode={inputMode} readOnly={readOnly}
      className={`${base} h-16`} style={sizeStyle}
      onFocus={(e) => { e.target.style.borderColor = color; e.target.style.boxShadow = `0 0 0 4px ${color}18`; }}
      onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; }}
    />
  );
}

function BigSelect({ value, onChange, options, placeholder, color }: {
  value: string; onChange: (v: string) => void; options: string[]; placeholder?: string; color: string;
}) {
  return (
    <div className="relative">
      <select
        value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-5 h-16 rounded-3xl border-2 border-gray-200 bg-white focus:outline-none appearance-none cursor-pointer transition-all"
        style={{ fontSize: '1.05rem', fontWeight: 500, color: value ? '#111827' : '#9CA3AF' }}
        onFocus={(e) => { e.target.style.borderColor = color; e.target.style.boxShadow = `0 0 0 4px ${color}18`; }}
        onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; }}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 pointer-events-none" />
    </div>
  );
}

function GenreSelector({ value, onChange, color }: { value: string; onChange: (v: string) => void; color: string }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {[
        { v: 'Homme', icon: User },
        { v: 'Femme', icon: User },
      ].map(({ v, icon: Icon }) => (
        <motion.button
          key={v}
          onClick={() => onChange(v)}
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.02 }}
          className="flex flex-col items-center gap-2 py-5 rounded-3xl border-2 transition-all"
          style={{
            borderColor: value === v ? color : '#E5E7EB',
            backgroundColor: value === v ? color : 'white',
            color: value === v ? 'white' : '#6B7280',
          }}
        >
          <Icon className="w-8 h-8" />
          <span style={{ fontSize: '1.05rem', fontWeight: 700 }}>{v}</span>
          {value === v && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <CheckCircle className="w-5 h-5" />
            </motion.div>
          )}
        </motion.button>
      ))}
    </div>
  );
}

function TagSelector({ options, values, onChange, color }: {
  options: string[]; values: string[]; onChange: (v: string[]) => void; color: string;
}) {
  const toggle = (opt: string) => {
    if (values.includes(opt)) onChange(values.filter((v) => v !== opt));
    else onChange([...values, opt]);
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const sel = values.includes(opt);
        return (
          <motion.button
            key={opt}
            onClick={() => toggle(opt)}
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.05 }}
            className="px-4 py-2 rounded-2xl border-2 transition-all flex items-center gap-1"
            style={{
              borderColor: sel ? color : '#E5E7EB',
              backgroundColor: sel ? color : 'white',
              color: sel ? 'white' : '#4B5563',
              fontSize: '0.9rem',
              fontWeight: sel ? 700 : 500,
            }}
          >
            {sel && <CheckCircle className="w-4 h-4" />}
            {opt}
          </motion.button>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
═══════════════════════════════════════════════════ */
export function FicheIdentificationDynamique() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const { speak } = useApp();
  const { rechercherParNumero } = useIdentificateur();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [xpPulse, setXpPulse] = useState(false);

  const [profil, setProfil] = useState<ProfilType>(null);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [verificationTel, setVerificationTel] = useState<'idle' | 'checking' | 'exists' | 'available'>('idle');
  const [gpsCapturing, setGpsCapturing] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const generateNumeroId = (type: string) => {
    const y = new Date().getFullYear();
    const r = String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0');
    const prefix = type === 'marchand' ? 'MARC' : type === 'producteur' ? 'PROD' : 'COOP';
    return `${prefix}-${y}-${r}`;
  };

  const [data, setData] = useState({
    numeroId: '',
    photo: null as string | null,
    nom: '', prenoms: '', genre: '',
    lieuNaissance: '', dateNaissance: '', nin: '',
    telephone: (location.state?.phone as string) || '',
    email: '', signature: null as string | null,
    gps: null as { lat: number; lng: number } | null,
    codeIdentificateur: '',
    commune: '', marche: '', emplacement: '', produitsVendus: '',
    typeCommerce: [] as string[], anneesExperience: '',
    nomResponsableMarche: '', nomResponsableCooperative: '',
    village: '', region: '', sousPrefecture: '',
    filierePrincipale: '', filieresSecondaires: [] as string[],
    superficie: '', typeElevage: '', groupement: '',
    fonctionDirigeant: '', nomCooperative: '', dateCreation: '',
    statutJuridique: '', numeroRecepisse: '', nombreMembres: '',
    adresseSiege: '', ville: '', zoneCouverte: '',
    filiereCoopPrincipale: '', filieresCoopSecondaires: [] as string[],
    zonesIntervention: '',
  });

  const cfg = profil ? PROFILES[profil] : null;
  const totalSteps = cfg ? cfg.steps.length : 0;
  const currentStepConfig = cfg ? cfg.steps[step] : null;

  const setField = (field: string, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => { const e = { ...prev }; delete e[field]; return e; });
  };

  const handleTelChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 10);
    setField('telephone', cleaned);
    if (cleaned.length >= 10) {
      setVerificationTel('checking');
      setTimeout(() => {
        const result = rechercherParNumero(cleaned);
        setVerificationTel(result.acteur ? 'exists' : 'available');
        if (result.acteur) speak(`Ce numéro appartient déjà à ${result.acteur.prenoms} ${result.acteur.nom}`);
      }, 600);
    } else setVerificationTel('idle');
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setField('photo', reader.result as string); speak('Photo ajoutée avec succès'); };
      reader.readAsDataURL(file);
    }
  };

  const handleGPS = () => {
    setGpsCapturing(true);
    speak('Capture de la position GPS en cours');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setField('gps', { lat: pos.coords.latitude, lng: pos.coords.longitude });
          setGpsCapturing(false);
          speak('Position GPS capturée avec succès');
        },
        () => {
          setField('gps', { lat: 5.3599517 + Math.random() * 0.01, lng: -4.0082563 + Math.random() * 0.01 });
          setGpsCapturing(false);
          speak('Position GPS enregistrée');
        }
      );
    } else {
      setField('gps', { lat: 5.3599517, lng: -4.0082563 });
      setGpsCapturing(false);
    }
  };

  const getCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = signatureCanvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault(); setIsDrawing(true);
    const { x, y } = getCoords(e);
    const ctx = signatureCanvasRef.current?.getContext('2d');
    if (ctx) { ctx.beginPath(); ctx.moveTo(x, y); }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;
    const { x, y } = getCoords(e);
    const ctx = signatureCanvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.strokeStyle = cfg?.color || '#9F8170';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (isDrawing && signatureCanvasRef.current) {
      setField('signature', signatureCanvasRef.current.toDataURL());
    }
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (canvas) {
      canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
      setField('signature', null);
    }
  };

  const validateStep = (): boolean => {
    const e: Record<string, string> = {};
    const stepId = currentStepConfig?.id;
    if (stepId === 'photo') { if (!data.photo) e.photo = 'La photo est obligatoire pour continuer'; }
    if (stepId === 'identite' || stepId === 'dirigeant') {
      if (!data.nom.trim()) e.nom = 'Le nom est obligatoire';
      if (!data.prenoms.trim()) e.prenoms = 'Le prénom est obligatoire';
      if (stepId === 'dirigeant' && !data.fonctionDirigeant.trim()) e.fonctionDirigeant = 'La fonction est obligatoire';
    }
    if (stepId === 'contact') {
      if (!data.telephone || data.telephone.length !== 10) e.telephone = 'Numéro de 10 chiffres obligatoire';
      if (verificationTel === 'exists') e.telephone = 'Ce numéro existe déjà dans le système';
    }
    if (stepId === 'lieu') {
      if (!data.commune.trim()) e.commune = 'La commune est obligatoire';
      if (profil === 'marchand' && !data.marche.trim()) e.marche = 'Le marché est obligatoire';
      if (profil === 'producteur' && !data.village.trim()) e.village = 'Le village est obligatoire';
    }
    if (stepId === 'localisation') {
      if (!data.commune.trim()) e.commune = 'La commune est obligatoire';
      if (!data.ville.trim()) e.ville = 'La ville est obligatoire';
    }
    if (stepId === 'cooperative') {
      if (!data.nomCooperative.trim()) e.nomCooperative = 'Le nom est obligatoire';
      if (!data.nombreMembres.trim()) e.nombreMembres = 'Le nombre de membres est obligatoire';
    }
    if (stepId === 'activite') {
      if (profil === 'marchand' && !data.produitsVendus.trim()) e.produitsVendus = 'Indiquez les produits vendus';
      if (profil === 'producteur' && !data.filierePrincipale) e.filierePrincipale = 'Choisissez une filière';
      if (profil === 'cooperative' && !data.filiereCoopPrincipale) e.filiereCoopPrincipale = 'Choisissez une filière';
    }
    if (stepId === 'finalisation') {
      if (!data.signature) e.signature = 'La signature est obligatoire';
      if (!data.codeIdentificateur || data.codeIdentificateur.length !== 4) e.codeIdentificateur = 'Code de 4 chiffres obligatoire';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) { speak('Remplis les champs obligatoires avant de continuer'); return; }
    setCompletedSteps((prev) => new Set([...prev, step]));
    setXpPulse(true);
    setTimeout(() => setXpPulse(false), 700);
    setDirection(1);
    setStep((s) => s + 1);
    speak(cfg?.steps[step + 1]?.label || '');
  };

  const handleBack = () => {
    if (step === 0) { setProfil(null); }
    else { setDirection(-1); setStep((s) => s - 1); }
  };

  const handleSubmit = () => {
    if (!validateStep()) { speak('Remplis les champs obligatoires'); return; }
    const numId = generateNumeroId(profil!);
    const dossier = {
      ...data, numeroId: numId, profil,
      dateDepot: new Date().toISOString(),
      identificateurId: user?.id,
      identificateurNom: (user as any)?.name || (user as any)?.prenoms || '',
      statut: 'en_attente_validation', etapeValidation: 'soumis',
      documentsJoints: { photo: !!data.photo, signature: !!data.signature, gps: !!data.gps },
    };
    const dossiersEnAttente = JSON.parse(localStorage.getItem('dossiers_validation') || '[]');
    dossiersEnAttente.push(dossier);
    localStorage.setItem('dossiers_validation', JSON.stringify(dossiersEnAttente));
    const identifications = JSON.parse(localStorage.getItem('identifications') || '[]');
    identifications.push(dossier);
    localStorage.setItem('identifications', JSON.stringify(identifications));
    speak(`Dossier de ${data.prenoms} ${data.nom} envoyé au Back-Office. Le compte sera créé après validation.`);
    setSubmitted(true);
    setTimeout(() => navigate('/identificateur'), 7000);
  };

  /* ══════════════════════════════════════════════════════
     ÉCRAN DE SÉLECTION DU PROFIL
  ══════════════════════════════════════════════════════ */
  if (!profil) {
    return (
      <div className="min-h-screen pb-10 px-4 pt-6 lg:pl-[320px] max-w-2xl lg:max-w-3xl mx-auto" style={{ background: 'linear-gradient(180deg, #FAFAF8 0%, #FFFFFF 100%)' }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-8">
          <motion.button
            onClick={() => navigate(-1)}
            whileTap={{ scale: 0.9 }}
            className="w-14 h-14 rounded-3xl flex items-center justify-center border-2 border-gray-200 bg-white shadow-sm"
          >
            <ArrowLeft className="w-7 h-7 text-gray-700" />
          </motion.button>
          <div>
            <h1 className="text-gray-900" style={{ fontSize: '1.6rem', fontWeight: 900 }}>Nouvelle Identification</h1>
            <p className="text-gray-500" style={{ fontSize: '0.92rem' }}>Choisissez le type d'acteur</p>
          </div>
        </motion.div>

        {/* Instruction */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl border-2 border-amber-200 bg-amber-50 p-5 mb-6 flex items-start gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Zap className="w-7 h-7 text-amber-600" />
          </div>
          <div>
            <p className="text-amber-900" style={{ fontSize: '1rem', fontWeight: 700 }}>Qui souhaitez-vous identifier ?</p>
            <p className="text-amber-700 mt-1" style={{ fontSize: '0.88rem' }}>
              Sélectionnez le profil pour démarrer la fiche. L'expérience sera adaptée automatiquement.
            </p>
          </div>
        </motion.div>

        {/* Cartes de sélection */}
        <div className="space-y-4">
          {(['marchand', 'producteur', 'cooperative'] as const).map((type, i) => {
            const p = PROFILES[type];
            const Icon = p.icon;
            return (
              <motion.button
                key={type}
                onClick={() => { setProfil(type); setStep(0); speak(`Identification d'un ${p.label}. ${p.steps.length} étapes.`); }}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.12, type: 'spring', stiffness: 300 }}
                whileHover={{ scale: 1.02, x: 6 }}
                whileTap={{ scale: 0.97 }}
                className="w-full text-left rounded-3xl border-2 p-5 shadow-sm flex items-center gap-5 transition-all bg-white"
                style={{ borderColor: '#E5E7EB' }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = p.color;
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 24px ${p.color}22`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#E5E7EB';
                  (e.currentTarget as HTMLElement).style.boxShadow = '';
                }}
              >
                <motion.div
                  className="w-20 h-20 rounded-3xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: p.lightColor }}
                  whileHover={{ rotate: [0, -5, 5, 0], transition: { duration: 0.4 } }}
                >
                  <Icon className="w-10 h-10" style={{ color: p.color }} />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827' }}>{p.label}</p>
                  <p className="text-gray-500 mt-0.5" style={{ fontSize: '0.92rem' }}>{p.desc}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex gap-1">
                      {p.steps.map((_, si) => (
                        <div key={si} className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color + '60' }} />
                      ))}
                    </div>
                    <span style={{ fontSize: '0.8rem', color: p.color, fontWeight: 600 }}>{p.stepsCount}</span>
                  </div>
                </div>
                <motion.div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: p.lightColor }}
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                >
                  <ArrowRight className="w-5 h-5" style={{ color: p.color }} />
                </motion.div>
              </motion.button>
            );
          })}
        </div>

        {/* Note bas de page */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="mt-6 p-4 rounded-2xl border-2 border-blue-100 bg-blue-50 flex gap-3"
        >
          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-blue-800" style={{ fontSize: '0.88rem' }}>
            Chaque dossier soumis sera vérifié par le Back-Office avant création du compte.
          </p>
        </motion.div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════
     ÉCRAN DE SUCCÈS
  ══════════════════════════════════════════════════════ */
  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5 pb-24 lg:pl-[320px]" style={{ background: 'linear-gradient(180deg, #FFFBEB 0%, #FFFFFF 100%)' }}>
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="w-full max-w-md"
        >
          {/* Trophée animé */}
          <div className="flex justify-center mb-6">
            <motion.div
              className="relative"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="w-32 h-32 rounded-full bg-amber-100 flex items-center justify-center">
                <Trophy className="w-16 h-16 text-amber-500" />
              </div>
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 rounded-full bg-amber-400"
                  style={{ top: '50%', left: '50%' }}
                  animate={{
                    x: [0, Math.cos(i * 90 * (Math.PI / 180)) * 60],
                    y: [0, Math.sin(i * 90 * (Math.PI / 180)) * 60],
                    opacity: [1, 0],
                    scale: [1, 0],
                  }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
                />
              ))}
            </motion.div>
          </div>

          <h2 className="text-center text-gray-900 mb-1" style={{ fontSize: '1.7rem', fontWeight: 900 }}>
            Dossier envoyé !
          </h2>
          <p className="text-center text-gray-500 mb-2" style={{ fontSize: '1rem' }}>
            {data.prenoms} {data.nom}
          </p>
          <p className="text-center mb-6" style={{ color: cfg!.color, fontSize: '0.92rem', fontWeight: 700 }}>
            Dossier {cfg!.label} transmis au Back-Office
          </p>

          {/* Workflow */}
          <div className="bg-white rounded-3xl border-2 border-amber-200 p-5 mb-4 shadow-sm">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b-2 border-gray-100">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center">
                <Clock className="w-7 h-7 text-amber-600" />
              </div>
              <div>
                <p className="font-black text-gray-900" style={{ fontSize: '1rem' }}>En attente de validation</p>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#D97706' }}>Délai : 24 à 48 heures ouvrées</p>
              </div>
            </div>
            <div className="space-y-0">
              {[
                { icon: Send,       label: 'Dossier soumis',          desc: 'Reçu par le Back-Office central',       done: true,  active: false },
                { icon: FileText,   label: 'Vérification des docs',   desc: 'Photo, signature, GPS, données',        done: false, active: true  },
                { icon: ShieldCheck,label: 'Contrôle de doublons',    desc: 'NIN, téléphone, biométrie',             done: false, active: false },
                { icon: CheckCircle,label: 'Approbation superviseur', desc: 'Validation finale par le responsable',  done: false, active: false },
                { icon: Users,      label: 'Création du compte',      desc: `Activation du compte ${cfg!.label}`,   done: false, active: false },
              ].map((item, i, arr) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <motion.div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: item.done ? '#22C55E' : item.active ? '#F59E0B' : '#F3F4F6' }}
                        animate={item.active ? { scale: [1, 1.15, 1] } : {}}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        {item.done ? <CheckCircle className="w-5 h-5 text-white" />
                          : item.active ? (
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
                              <Clock className="w-5 h-5 text-white" />
                            </motion.div>
                          ) : <Icon className="w-5 h-5 text-gray-400" />}
                      </motion.div>
                      {i < arr.length - 1 && (
                        <div className="w-0.5 flex-1 my-1 min-h-[24px]" style={{ backgroundColor: item.done ? '#22C55E' : '#E5E7EB' }} />
                      )}
                    </div>
                    <div className="flex-1 pb-4 pt-1">
                      <p style={{ fontWeight: 700, fontSize: '0.92rem', color: item.done ? '#16A34A' : item.active ? '#D97706' : '#9CA3AF' }}>
                        {item.label}
                      </p>
                      <p style={{ fontSize: '0.78rem', color: '#9CA3AF' }}>{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-blue-50 rounded-2xl border-2 border-blue-100 p-4 mb-4 flex gap-3">
            <Info className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1E40AF' }}>Aucun compte créé pour l'instant</p>
              <p style={{ fontSize: '0.82rem', color: '#3B82F6', lineHeight: '1.5', marginTop: 4 }}>
                Le compte sera activé uniquement après approbation complète par le Back-Office central.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl border-2 border-gray-200 p-4 text-center">
            <p style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Numéro de référence
            </p>
            <p className="font-black text-gray-900 mt-1" style={{ fontSize: '1.3rem', letterSpacing: '0.08em' }}>
              {data.numeroId}
            </p>
            <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: 4 }}>Conservez ce numéro pour le suivi</p>
          </div>

          <p className="text-center mt-5" style={{ fontSize: '0.82rem', color: '#9CA3AF' }}>
            Retour automatique dans quelques secondes...
          </p>
        </motion.div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════
     FORMULAIRE PRINCIPAL
  ══════════════════════════════════════════════════════ */
  const isLastStep = step === totalSteps - 1;
  const progressPct = ((step + 1) / totalSteps) * 100;
  const ProfileIcon = cfg!.icon;

  return (
    <div className={`min-h-screen pb-10 pt-0 lg:pl-[320px]`} style={{ background: cfg!.gradientBg }}>
      {/* ── HEADER ── */}
      <div className="sticky top-0 z-20 px-4 pt-5 pb-3" style={{ background: cfg!.gradientBg }}>
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <motion.button
              onClick={handleBack}
              whileTap={{ scale: 0.88 }}
              whileHover={{ scale: 1.05 }}
              className="w-14 h-14 rounded-3xl flex items-center justify-center border-2 border-gray-200 bg-white shadow-sm flex-shrink-0"
            >
              <ArrowLeft className="w-7 h-7 text-gray-700" />
            </motion.button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cfg!.lightColor }}>
                  <ProfileIcon className="w-5 h-5" style={{ color: cfg!.color }} />
                </div>
                <h1 className="text-gray-900 truncate" style={{ fontSize: '1.25rem', fontWeight: 900 }}>
                  Identification {cfg!.label}
                </h1>
              </div>
              <p className="text-gray-500" style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                Étape {step + 1} sur {totalSteps} — {currentStepConfig?.label}
              </p>
            </div>

            {/* XP Badge */}
            <motion.div
              animate={xpPulse ? { scale: [1, 1.4, 1], rotate: [0, 10, -10, 0] } : {}}
              transition={{ duration: 0.5 }}
              className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center flex-shrink-0"
              style={{ backgroundColor: cfg!.color }}
            >
              <Star className="w-5 h-5 text-white" />
              <span className="text-white" style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '-0.01em' }}>
                {completedSteps.size * 100} XP
              </span>
            </motion.div>
          </div>

          {/* ── BARRE DE PROGRESSION ── */}
          <div className="relative mb-4">
            <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
              <motion.div
                className="h-full rounded-full relative overflow-hidden"
                style={{ backgroundColor: cfg!.color }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              >
                {/* Shimmer */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                />
              </motion.div>
            </div>
            <div className="flex justify-between mt-1">
              <span style={{ fontSize: '0.72rem', color: cfg!.color, fontWeight: 700 }}>
                {Math.round(progressPct)}% accompli
              </span>
              <span style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>
                {totalSteps - step - 1} étape{totalSteps - step - 1 !== 1 ? 's' : ''} restante{totalSteps - step - 1 !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* ── INDICATEURS D'ÉTAPES ── */}
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {cfg!.steps.map((s, i) => {
              const Icon = s.icon;
              const done = completedSteps.has(i);
              const active = i === step;
              return (
                <motion.div
                  key={s.id}
                  className="flex flex-col items-center gap-1.5 flex-shrink-0"
                  style={{ minWidth: 56 }}
                  animate={active ? { y: [0, -3, 0] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <motion.div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all"
                    style={{
                      backgroundColor: done ? cfg!.color : active ? cfg!.lightColor : '#F3F4F6',
                      border: active ? `2.5px solid ${cfg!.color}` : done ? 'none' : '2px solid #E5E7EB',
                      boxShadow: active ? `0 4px 16px ${cfg!.color}44` : 'none',
                    }}
                    animate={done ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    {done
                      ? <CheckCircle className="w-6 h-6 text-white" />
                      : <Icon className="w-6 h-6" style={{ color: active ? cfg!.color : '#9CA3AF' }} />
                    }
                  </motion.div>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: active || done ? 800 : 500,
                    color: active ? cfg!.color : done ? cfg!.color : '#9CA3AF',
                    textAlign: 'center',
                    lineHeight: '1.2',
                  }}>
                    {s.label}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── TIP DE L'ÉTAPE ── */}
      <div className="px-4 max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={`tip-${step}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl mb-4"
            style={{ backgroundColor: cfg!.lightColor }}
          >
            <Zap className="w-5 h-5 flex-shrink-0" style={{ color: cfg!.color }} />
            <p style={{ fontSize: '0.92rem', color: cfg!.color, fontWeight: 600 }}>
              {currentStepConfig?.tip}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* ── CONTENU DE L'ÉTAPE ── */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`${profil}-${step}`}
            custom={direction}
            initial={{ opacity: 0, x: direction * 60, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: direction * -60, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.34, 1.2, 0.64, 1] }}
            className="bg-white rounded-3xl shadow-xl border-2 p-6 mb-5"
            style={{ borderColor: `${cfg!.color}30` }}
          >
            <StepContent
              stepId={currentStepConfig!.id}
              profil={profil!}
              data={data}
              setField={setField}
              errors={errors}
              cfg={cfg!}
              signatureCanvasRef={signatureCanvasRef}
              fileInputRef={fileInputRef}
              isDrawing={isDrawing}
              startDrawing={startDrawing}
              draw={draw}
              stopDrawing={stopDrawing}
              clearSignature={clearSignature}
              handlePhoto={handlePhoto}
              handleGPS={handleGPS}
              gpsCapturing={gpsCapturing}
              handleTelChange={handleTelChange}
              verificationTel={verificationTel}
            />
          </motion.div>
        </AnimatePresence>

        {/* ── BOUTON NAVIGATION ── */}
        <motion.button
          onClick={isLastStep ? handleSubmit : handleNext}
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.96 }}
          className="w-full rounded-3xl text-white flex items-center justify-center gap-3 shadow-xl"
          style={{
            background: `linear-gradient(135deg, ${cfg!.color} 0%, ${cfg!.colorDark} 100%)`,
            fontWeight: 800,
            fontSize: '1.15rem',
            paddingTop: 20,
            paddingBottom: 20,
            boxShadow: `0 8px 32px ${cfg!.color}55`,
          }}
        >
          {isLastStep ? (
            <>
              <Send className="w-6 h-6" />
              Soumettre au Back-Office
            </>
          ) : (
            <>
              Continuer
              <motion.div animate={{ x: [0, 4, 0] }} transition={{ duration: 1, repeat: Infinity }}>
                <ArrowRight className="w-6 h-6" />
              </motion.div>
            </>
          )}
        </motion.button>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" capture="user" onChange={handlePhoto} className="hidden" />
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   STEP CONTENT
══════════════════════════════════════════════════════ */
function StepContent({
  stepId, profil, data, setField, errors, cfg,
  signatureCanvasRef, fileInputRef, isDrawing,
  startDrawing, draw, stopDrawing, clearSignature,
  handlePhoto, handleGPS, gpsCapturing, handleTelChange, verificationTel,
}: {
  stepId: string; profil: ProfilType; data: any; setField: (f: string, v: any) => void;
  errors: Record<string, string>; cfg: ProfileConfig;
  signatureCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  isDrawing: boolean; startDrawing: any; draw: any; stopDrawing: any; clearSignature: () => void;
  handlePhoto: any; handleGPS: () => void; gpsCapturing: boolean;
  handleTelChange: (v: string) => void;
  verificationTel: 'idle' | 'checking' | 'exists' | 'available';
}) {
  const color = cfg.color;

  /* ── SECTION HEADER ── */
  const SH = ({ icon: Icon, label }: { icon: React.FC<{ className?: string; style?: React.CSSProperties }>; label: string }) => (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cfg.lightColor }}>
        <Icon className="w-8 h-8" style={{ color }} />
      </div>
      <p style={{ fontSize: '1.3rem', fontWeight: 900, color: '#111827' }}>{label}</p>
    </div>
  );

  /* ── PHOTO ── */
  if (stepId === 'photo') {
    return (
      <div>
        <SH icon={Camera} label={profil === 'cooperative' ? 'Photo du dirigeant' : "Photo d'identité"} />

        <div className="flex flex-col items-center gap-5">
          <AnimatePresence mode="wait">
            {data.photo ? (
              <motion.div
                key="has-photo"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="relative"
              >
                <img src={data.photo} alt="Photo" className="w-52 h-52 object-cover rounded-3xl border-4" style={{ borderColor: color }} />
                <motion.div
                  className="absolute -top-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: color }}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <CheckCircle className="w-5 h-5 text-white" />
                </motion.div>
                <motion.button
                  onClick={() => setField('photo', null)}
                  whileTap={{ scale: 0.9 }}
                  className="absolute -bottom-3 -right-3 w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="no-photo"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-52 h-52 border-4 border-dashed rounded-3xl flex flex-col items-center justify-center gap-3"
                style={{ borderColor: color + '60', backgroundColor: cfg.lightColor }}
              >
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Camera className="w-16 h-16" style={{ color: color + '90' }} />
                </motion.div>
                <p className="text-gray-400" style={{ fontSize: '1rem', fontWeight: 600 }}>Aucune photo</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-2 gap-3 w-full">
            <motion.button
              onClick={() => fileInputRef.current?.click()}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
              className="py-5 rounded-3xl border-2 flex flex-col items-center gap-2"
              style={{ borderColor: color, color }}
            >
              <Camera className="w-8 h-8" />
              <span style={{ fontSize: '1rem', fontWeight: 700 }}>Prendre photo</span>
            </motion.button>
            <motion.button
              onClick={() => fileInputRef.current?.click()}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
              className="py-5 rounded-3xl border-2 border-gray-200 flex flex-col items-center gap-2 text-gray-600"
            >
              <Upload className="w-8 h-8" />
              <span style={{ fontSize: '1rem', fontWeight: 700 }}>Importer</span>
            </motion.button>
          </div>
        </div>
        {errors.photo && <ErrMsg msg={errors.photo} />}
      </div>
    );
  }

  /* ── IDENTITÉ ── */
  if (stepId === 'identite') {
    return (
      <div className="space-y-5">
        <SH icon={User} label="Identité de la personne" />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nom de famille" required error={errors.nom}>
            <BigInput value={data.nom} onChange={(v) => setField('nom', v.toUpperCase())} placeholder="KOUASSI" color={color} />
          </Field>
          <Field label="Prénoms" required error={errors.prenoms}>
            <BigInput value={data.prenoms} onChange={(v) => setField('prenoms', v)} placeholder="Aminata" color={color} />
          </Field>
        </div>
        <Field label="Genre" error={errors.genre}>
          <GenreSelector value={data.genre} onChange={(v) => setField('genre', v)} color={color} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Date de naissance" error={errors.dateNaissance}>
            <BigInput type="date" value={data.dateNaissance} onChange={(v) => setField('dateNaissance', v)} color={color} />
          </Field>
          <Field label="Lieu de naissance" error={errors.lieuNaissance}>
            <BigInput value={data.lieuNaissance} onChange={(v) => setField('lieuNaissance', v)} placeholder="Abidjan" color={color} />
          </Field>
        </div>
        <Field label="Numéro NIN / CNI" error={errors.nin}>
          <BigInput value={data.nin} onChange={(v) => setField('nin', v)} placeholder="CI2024XXXXXXXX" color={color} />
        </Field>
      </div>
    );
  }

  /* ── DIRIGEANT (Coopérative) ── */
  if (stepId === 'dirigeant') {
    return (
      <div className="space-y-5">
        <SH icon={User} label="Identité du dirigeant" />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nom de famille" required error={errors.nom}>
            <BigInput value={data.nom} onChange={(v) => setField('nom', v.toUpperCase())} placeholder="KOUAMÉ" color={color} />
          </Field>
          <Field label="Prénoms" required error={errors.prenoms}>
            <BigInput value={data.prenoms} onChange={(v) => setField('prenoms', v)} placeholder="Jean-Paul" color={color} />
          </Field>
        </div>
        <Field label="Fonction dans la coopérative" required error={errors.fonctionDirigeant}>
          <BigSelect
            value={data.fonctionDirigeant}
            onChange={(v) => setField('fonctionDirigeant', v)}
            options={['Président', 'Directeur', 'Secrétaire général', 'Trésorier', 'Gestionnaire', 'Autre']}
            placeholder="Choisir la fonction"
            color={color}
          />
        </Field>
        <Field label="Genre" error={errors.genre}>
          <GenreSelector value={data.genre} onChange={(v) => setField('genre', v)} color={color} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Date de naissance" error={errors.dateNaissance}>
            <BigInput type="date" value={data.dateNaissance} onChange={(v) => setField('dateNaissance', v)} color={color} />
          </Field>
          <Field label="Lieu de naissance" error={errors.lieuNaissance}>
            <BigInput value={data.lieuNaissance} onChange={(v) => setField('lieuNaissance', v)} placeholder="Bouaké" color={color} />
          </Field>
        </div>
        <Field label="NIN / CNI du dirigeant" error={errors.nin}>
          <BigInput value={data.nin} onChange={(v) => setField('nin', v)} placeholder="CI2024XXXXXXXX" color={color} />
        </Field>
      </div>
    );
  }

  /* ── INFOS COOPÉRATIVE ── */
  if (stepId === 'cooperative') {
    return (
      <div className="space-y-5">
        <SH icon={Building2} label="Informations de la coopérative" />
        <Field label="Nom de la coopérative" required error={errors.nomCooperative}>
          <BigInput value={data.nomCooperative} onChange={(v) => setField('nomCooperative', v)} placeholder="Coopérative des Femmes de Daloa" color={color} />
        </Field>
        <Field label="Statut juridique" error={errors.statutJuridique}>
          <BigSelect value={data.statutJuridique} onChange={(v) => setField('statutJuridique', v)} options={STATUTS_JURIDIQUES} placeholder="Choisir le statut" color={color} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="N° Récépissé" error={errors.numeroRecepisse}>
            <BigInput value={data.numeroRecepisse} onChange={(v) => setField('numeroRecepisse', v)} placeholder="2024/REC/XXXX" color={color} />
          </Field>
          <Field label="Date de création" error={errors.dateCreation}>
            <BigInput type="date" value={data.dateCreation} onChange={(v) => setField('dateCreation', v)} color={color} />
          </Field>
        </div>
        <Field label="Nombre de membres" required error={errors.nombreMembres}>
          <BigInput type="number" value={data.nombreMembres} onChange={(v) => setField('nombreMembres', v)} placeholder="Ex : 45" inputMode="numeric" color={color} />
        </Field>
      </div>
    );
  }

  /* ── CONTACT ── */
  if (stepId === 'contact') {
    return (
      <div className="space-y-5">
        <SH icon={Phone} label="Coordonnées de contact" />
        <Field label="Numéro de téléphone" required error={errors.telephone}>
          <div className="relative">
            <BigInput
              value={data.telephone}
              onChange={handleTelChange}
              placeholder="0701020304"
              type="tel"
              inputMode="numeric"
              color={color}
            />
            <div className="absolute right-5 top-1/2 -translate-y-1/2">
              {verificationTel === 'checking' && (
                <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: color }} />
              )}
              {verificationTel === 'exists' && <AlertCircle className="w-7 h-7 text-red-500" />}
              {verificationTel === 'available' && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                  <CheckCircle2 className="w-7 h-7 text-green-500" />
                </motion.div>
              )}
            </div>
          </div>
          {verificationTel === 'available' && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-green-600 mt-2 flex items-center gap-2" style={{ fontSize: '0.92rem', fontWeight: 600 }}>
              <CheckCircle2 className="w-4 h-4" /> Numéro disponible
            </motion.p>
          )}
          {verificationTel === 'exists' && (
            <p className="text-red-500 mt-2" style={{ fontSize: '0.92rem' }}>Ce numéro est déjà enregistré dans le système</p>
          )}
        </Field>
        <Field label="Email (optionnel)" error={errors.email}>
          <BigInput type="email" value={data.email} onChange={(v) => setField('email', v)} placeholder="exemple@mail.com" color={color} />
        </Field>
        {profil === 'cooperative' && (
          <Field label="Adresse du siège" error={errors.adresseSiege}>
            <BigInput value={data.adresseSiege} onChange={(v) => setField('adresseSiege', v)} placeholder="Rue, quartier, numéro..." color={color} />
          </Field>
        )}
      </div>
    );
  }

  /* ── LIEU ── */
  if (stepId === 'lieu') {
    return (
      <div className="space-y-5">
        <SH icon={MapPin} label={profil === 'marchand' ? "Lieu d'exercice" : 'Zone de production'} />
        <Field label="Commune" required error={errors.commune}>
          <BigSelect value={data.commune} onChange={(v) => setField('commune', v)} options={COMMUNES_CI} placeholder="Choisir la commune" color={color} />
        </Field>
        {profil === 'marchand' && (
          <>
            <Field label="Marché" required error={errors.marche}>
              <BigInput value={data.marche} onChange={(v) => setField('marche', v)} placeholder="Marché de Siporex" color={color} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Emplacement / Secteur" error={errors.emplacement}>
                <BigInput value={data.emplacement} onChange={(v) => setField('emplacement', v)} placeholder="Secteur A" color={color} />
              </Field>
              <Field label="Allée / Rangée" error={errors.sousPrefecture}>
                <BigInput value={data.sousPrefecture} onChange={(v) => setField('sousPrefecture', v)} placeholder="Allée 3" color={color} />
              </Field>
            </div>
          </>
        )}
        {profil === 'producteur' && (
          <>
            <Field label="Village / Zone" required error={errors.village}>
              <BigInput value={data.village} onChange={(v) => setField('village', v)} placeholder="Village de Tiébissou" color={color} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Région" error={errors.region}>
                <BigInput value={data.region} onChange={(v) => setField('region', v)} placeholder="Vallée du Bandama" color={color} />
              </Field>
              <Field label="Sous-préfecture" error={errors.sousPrefecture}>
                <BigInput value={data.sousPrefecture} onChange={(v) => setField('sousPrefecture', v)} placeholder="Tiébissou" color={color} />
              </Field>
            </div>
          </>
        )}
      </div>
    );
  }

  /* ── LOCALISATION (Coopérative) ── */
  if (stepId === 'localisation') {
    return (
      <div className="space-y-5">
        <SH icon={MapPin} label="Localisation du siège" />
        <Field label="Commune" required error={errors.commune}>
          <BigSelect value={data.commune} onChange={(v) => setField('commune', v)} options={COMMUNES_CI} placeholder="Choisir la commune" color={color} />
        </Field>
        <Field label="Ville" required error={errors.ville}>
          <BigInput value={data.ville} onChange={(v) => setField('ville', v)} placeholder="Daloa" color={color} />
        </Field>
        <Field label="Zones d'intervention" error={errors.zoneCouverte}>
          <BigInput value={data.zoneCouverte} onChange={(v) => setField('zoneCouverte', v)} placeholder="Ex : Daloa, Vavoua, Issia" color={color} rows={3} />
        </Field>
      </div>
    );
  }

  /* ── ACTIVITÉ ── */
  if (stepId === 'activite') {
    if (profil === 'marchand') return (
      <div className="space-y-5">
        <SH icon={ShoppingBag} label="Activité commerciale" />
        <Field label="Produits vendus" required error={errors.produitsVendus}>
          <BigInput value={data.produitsVendus} onChange={(v) => setField('produitsVendus', v)} placeholder="Riz, tomates, oignons, pommes de terre..." color={color} rows={3} />
        </Field>
        <Field label="Type de commerce (choix multiples)" error={errors.typeCommerce}>
          <TagSelector options={['Grossiste', 'Semi-grossiste', 'Détaillant']} values={data.typeCommerce} onChange={(v) => setField('typeCommerce', v)} color={color} />
        </Field>
        <Field label="Années d'expérience" error={errors.anneesExperience}>
          <BigSelect value={data.anneesExperience} onChange={(v) => setField('anneesExperience', v)} options={['Moins de 1 an', '1 à 3 ans', '3 à 5 ans', '5 à 10 ans', 'Plus de 10 ans']} placeholder="Choisir" color={color} />
        </Field>
        <Field label="Responsable du marché" error={errors.nomResponsableMarche}>
          <BigInput value={data.nomResponsableMarche} onChange={(v) => setField('nomResponsableMarche', v)} placeholder="Nom et prénom" color={color} />
        </Field>
        <Field label="Responsable de coopérative (si membre)" error={errors.nomResponsableCooperative}>
          <BigInput value={data.nomResponsableCooperative} onChange={(v) => setField('nomResponsableCooperative', v)} placeholder="Nom du responsable" color={color} />
        </Field>
      </div>
    );

    if (profil === 'producteur') return (
      <div className="space-y-5">
        <SH icon={Sprout} label="Activité agricole" />
        <Field label="Filière principale" required error={errors.filierePrincipale}>
          <BigSelect value={data.filierePrincipale} onChange={(v) => setField('filierePrincipale', v)} options={FILIERES} placeholder="Choisir la filière principale" color={color} />
        </Field>
        <Field label="Filières secondaires (optionnel)" error={errors.filieresSecondaires}>
          <TagSelector options={FILIERES.filter((f) => f !== data.filierePrincipale).slice(0, 10)} values={data.filieresSecondaires} onChange={(v) => setField('filieresSecondaires', v)} color={color} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Superficie (ha)" error={errors.superficie}>
            <BigInput type="number" value={data.superficie} onChange={(v) => setField('superficie', v)} placeholder="2.5" inputMode="decimal" color={color} />
          </Field>
          <Field label="Élevage pratiqué" error={errors.typeElevage}>
            <BigInput value={data.typeElevage} onChange={(v) => setField('typeElevage', v)} placeholder="Volailles..." color={color} />
          </Field>
        </div>
        <Field label="Groupement / Coopérative (si membre)" error={errors.groupement}>
          <BigInput value={data.groupement} onChange={(v) => setField('groupement', v)} placeholder="Nom du groupement" color={color} />
        </Field>
      </div>
    );

    if (profil === 'cooperative') return (
      <div className="space-y-5">
        <SH icon={Layers} label="Activité de la coopérative" />
        <Field label="Filière principale" required error={errors.filiereCoopPrincipale}>
          <BigSelect value={data.filiereCoopPrincipale} onChange={(v) => setField('filiereCoopPrincipale', v)} options={FILIERES} placeholder="Choisir la filière principale" color={color} />
        </Field>
        <Field label="Filières secondaires" error={errors.filieresCoopSecondaires}>
          <TagSelector options={FILIERES.filter((f) => f !== data.filiereCoopPrincipale).slice(0, 10)} values={data.filieresCoopSecondaires} onChange={(v) => setField('filieresCoopSecondaires', v)} color={color} />
        </Field>
        <Field label="Zones d'intervention" error={errors.zonesIntervention}>
          <BigInput value={data.zonesIntervention} onChange={(v) => setField('zonesIntervention', v)} placeholder="Villages et localités couverts..." color={color} rows={3} />
        </Field>
      </div>
    );
  }

  /* ── FINALISATION ── */
  if (stepId === 'finalisation') {
    return (
      <div className="space-y-6">
        <SH icon={CheckCircle} label="GPS, Signature et Validation" />

        {/* GPS */}
        <div>
          <BigLabel>
            Position GPS{' '}
            {profil === 'marchand' ? 'du marché' : profil === 'producteur' ? 'du champ' : 'du siège'}
          </BigLabel>
          <AnimatePresence mode="wait">
            {data.gps ? (
              <motion.div
                key="gps-ok"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-4 p-5 rounded-3xl border-2"
                style={{ borderColor: color, backgroundColor: cfg.lightColor }}
              >
                <motion.div
                  animate={{ rotate: [0, 20, -20, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: color }}
                >
                  <Navigation className="w-8 h-8 text-white" />
                </motion.div>
                <div className="flex-1">
                  <p style={{ fontWeight: 800, color, fontSize: '1rem' }}>Position capturée</p>
                  <p className="text-gray-500 mt-0.5" style={{ fontSize: '0.82rem' }}>
                    {data.gps.lat.toFixed(6)}, {data.gps.lng.toFixed(6)}
                  </p>
                </div>
                <motion.button onClick={() => setField('gps', null)} whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <X className="w-5 h-5 text-red-600" />
                </motion.button>
              </motion.div>
            ) : (
              <motion.button
                key="gps-btn"
                onClick={handleGPS}
                disabled={gpsCapturing}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-6 rounded-3xl border-2 border-dashed flex flex-col items-center gap-3 transition-all"
                style={{ borderColor: color, color }}
              >
                {gpsCapturing ? (
                  <>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
                      <Navigation className="w-10 h-10" />
                    </motion.div>
                    <span style={{ fontSize: '1rem', fontWeight: 700 }}>Capture en cours...</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-10 h-10" />
                    <span style={{ fontSize: '1rem', fontWeight: 700 }}>Capturer ma position GPS</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 500, color: '#9CA3AF' }}>Appuyez pour localiser</span>
                  </>
                )}
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Signature */}
        <div>
          <BigLabel required>
            Signature {profil === 'cooperative' ? 'du dirigeant' : 'de la personne'}
          </BigLabel>
          <div className="border-2 border-dashed rounded-3xl overflow-hidden" style={{ borderColor: color + '60' }}>
            <div className="px-4 pt-3 pb-1">
              <p className="text-gray-400" style={{ fontSize: '0.88rem', fontWeight: 500 }}>
                Signez avec votre doigt dans le cadre ci-dessous
              </p>
            </div>
            <div className="relative">
              <canvas
                ref={signatureCanvasRef}
                width={600} height={200}
                className="w-full bg-white cursor-crosshair touch-none"
                onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing}
                onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing}
              />
              {data.signature && (
                <motion.button
                  onClick={clearSignature}
                  whileTap={{ scale: 0.9 }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute top-3 right-3 flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white rounded-2xl shadow-lg"
                  style={{ fontSize: '0.85rem', fontWeight: 700 }}
                >
                  <RotateCcw className="w-4 h-4" /> Effacer
                </motion.button>
              )}
            </div>
          </div>
          {errors.signature && <ErrMsg msg={errors.signature} />}
        </div>

        {/* Récapitulatif */}
        <div className="rounded-3xl border-2 p-5 space-y-3" style={{ borderColor: `${color}30`, backgroundColor: cfg.lightColor }}>
          <p style={{ fontWeight: 800, color: '#111827', fontSize: '1rem', marginBottom: 8 }}>
            Récapitulatif du dossier
          </p>
          {[
            { label: 'Nom complet', value: `${data.prenoms} ${data.nom}` },
            { label: 'Téléphone', value: data.telephone },
            { label: 'Commune', value: data.commune },
            { label: 'Marché', value: data.marche },
            { label: 'Village', value: data.village },
            { label: 'Coopérative', value: data.nomCooperative },
            { label: 'Produits', value: data.produitsVendus?.substring(0, 40) },
            { label: 'Filière', value: data.filierePrincipale || data.filiereCoopPrincipale },
          ].filter(item => item.value).map((item) => (
            <div key={item.label} className="flex justify-between items-center gap-3 bg-white/70 rounded-2xl px-4 py-3">
              <span className="text-gray-500" style={{ fontSize: '0.88rem' }}>{item.label}</span>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#111827' }}>{item.value}</span>
            </div>
          ))}
        </div>

        {/* Notice Back-Office */}
        <div className="flex gap-4 p-5 rounded-3xl border-2 border-amber-200 bg-amber-50">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Clock className="w-7 h-7 text-amber-600" />
          </div>
          <div>
            <p style={{ fontSize: '1rem', fontWeight: 800, color: '#92400E' }}>Envoi au Back-Office</p>
            <p className="mt-1" style={{ fontSize: '0.88rem', color: '#B45309', lineHeight: '1.5' }}>
              Ce dossier sera transmis pour vérification. Le compte sera créé uniquement après approbation.
            </p>
          </div>
        </div>

        {/* Code PIN de confirmation */}
        <Field label="Mon code de confirmation (4 chiffres)" required error={errors.codeIdentificateur}>
          <div className="flex gap-3 justify-center">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="flex-1 h-20 rounded-3xl border-2 flex items-center justify-center"
                style={{
                  borderColor: data.codeIdentificateur.length > i ? color : '#E5E7EB',
                  backgroundColor: data.codeIdentificateur.length > i ? cfg.lightColor : 'white',
                }}
                animate={data.codeIdentificateur.length === i + 1 ? { scale: [1, 1.15, 1] } : {}}
                transition={{ duration: 0.2 }}
              >
                <span style={{ fontSize: '2rem', fontWeight: 900, color }}>
                  {data.codeIdentificateur.length > i ? '●' : ''}
                </span>
              </motion.div>
            ))}
          </div>
          <input
            type="number"
            value={data.codeIdentificateur}
            onChange={(e) => setField('codeIdentificateur', e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="Tapez votre code à 4 chiffres"
            inputMode="numeric"
            maxLength={4}
            className="w-full mt-3 px-5 h-16 rounded-3xl border-2 border-gray-200 bg-white focus:outline-none text-center transition-all"
            style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '0.5rem' }}
            onFocus={(e) => { e.target.style.borderColor = color; }}
            onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; }}
          />
          <p className="text-center text-gray-400 mt-2" style={{ fontSize: '0.85rem' }}>
            Code personnel de l'identificateur pour confirmer la soumission
          </p>
        </Field>
      </div>
    );
  }

  return null;
}


