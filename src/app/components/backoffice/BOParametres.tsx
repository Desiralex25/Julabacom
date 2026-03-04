import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Settings, Shield, AlertTriangle, Star, Percent, Clock,
  Bell, Smartphone, Save, RotateCcw, ChevronRight,
  Lock, Zap, Database, Globe, CheckCircle2, Info,
} from 'lucide-react';
import { useBackOffice } from '../../contexts/BackOfficeContext';
import { toast } from 'sonner';

const BO_PRIMARY = '#E6A817';
const BO_DARK = '#3B3C36';

interface ParamSection {
  id: string;
  titre: string;
  description: string;
  icon: any;
  color: string;
}

const SECTIONS: ParamSection[] = [
  { id: 'scoring', titre: 'Scoring & Évaluation', description: 'Règles de calcul du score de performance', icon: Star, color: BO_PRIMARY },
  { id: 'alertes', titre: 'Seuils d\'alertes', description: 'Déclencheurs automatiques de notifications', icon: AlertTriangle, color: '#EF4444' },
  { id: 'suspension', titre: 'Suspension automatique', description: 'Conditions de suspension sans intervention humaine', icon: Shield, color: '#EF4444' },
  { id: 'commissions', titre: 'Règles de commissions', description: 'Barème et conditions de paiement', icon: Percent, color: '#10B981' },
  { id: 'sessions', titre: 'Sessions & Sécurité', description: 'Durée de session, 2FA et IP whitelist', icon: Lock, color: '#3B82F6' },
  { id: 'notifications', titre: 'Notifications système', description: 'SMS, Push et email automatiques', icon: Bell, color: '#8B5CF6' },
  { id: 'api', titre: 'API & Intégrations', description: 'Clés API, webhooks et partenaires', icon: Database, color: BO_DARK },
  { id: 'plateforme', titre: 'Paramètres plateforme', description: 'Version app, maintenance et mode debug', icon: Globe, color: '#F59E0B' },
];

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <motion.button onClick={onChange}
      className={`w-12 h-6 rounded-full relative flex-shrink-0 transition-colors`}
      style={{ backgroundColor: value ? BO_PRIMARY : '#d1d5db' }}
      whileTap={{ scale: 0.95 }}>
      <motion.div className="w-5 h-5 bg-white rounded-full shadow-md absolute top-0.5"
        animate={{ left: value ? '26px' : '2px' }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
    </motion.button>
  );
}

function SliderInput({ value, min, max, step = 1, onChange, unit = '' }: { value: number; min: number; max: number; step?: number; onChange: (v: number) => void; unit?: string }) {
  return (
    <div className="flex items-center gap-3">
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(+e.target.value)}
        className="flex-1 h-2 rounded-full appearance-none cursor-pointer"
        style={{ accentColor: BO_PRIMARY }} />
      <span className="text-sm font-black text-gray-900 min-w-[60px] text-right">{value}{unit}</span>
    </div>
  );
}

export function BOParametres() {
  const { hasPermission, addAuditLog, boUser } = useBackOffice();
  const [activeSection, setActiveSection] = useState<string>('scoring');
  const [saved, setSaved] = useState(false);

  const canWrite = hasPermission('parametres.write');

  // Scoring
  const [scoring, setScoring] = useState({
    poidsTransactions: 40,
    poidsFormation: 25,
    poidsPresence: 20,
    poidsAnciennete: 15,
    bonusCooperative: 10,
    bonusAcademy: 5,
    penaliteSuspension: 30,
    penaliteRetard: 5,
  });

  // Alertes
  const [alertes, setAlertes] = useState({
    inactiviteJours: 7,
    transactionSuspect: 50,
    volumeAnormal: 3,
    dossierAttentHeures: 72,
    tauxActiviteMin: 40,
    nbLitigesMax: 3,
  });

  // Suspension auto
  const [suspension, setSuspension] = useState({
    scoreMinSuspension: 20,
    nbLitigesAuto: 5,
    nbTransactionsSuspectes: 10,
    inactiviteAutoJours: 30,
    suspensionAutoActive: true,
    notifierAvantJours: 7,
  });

  // Commissions
  const [commissions, setCommissions] = useState({
    tauxBase: 2,
    bonusObjectif: 20,
    delaiPaiementJours: 30,
    seuiMinPaiement: 1000,
    paiementAutoActive: false,
    periodeCalcul: 'mensuelle',
  });

  // Sessions
  const [sessions, setSessions] = useState({
    dureeSessionMinutes: 480,
    tentativesEchecMax: 5,
    delaiVerrouillageMinutes: 15,
    deuxFA: false,
    journalisationIP: true,
  });

  // Notifications
  const [notifs, setNotifs] = useState({
    smsActif: true,
    emailActif: true,
    pushActif: true,
    alertesCritiques: true,
    dossiersEnAttente: true,
    rapportHebdo: false,
  });

  // API
  const [api, setApi] = useState({
    apiVersion: 'v2.1.0',
    webhookUrl: 'https://api.julaba.ci/webhooks',
    rateLimitPerMin: 100,
    maintenanceMode: false,
  });

  // Plateforme
  const [plateforme, setPlateforme] = useState({
    versionAndroid: '3.2.1',
    versionIOS: '3.2.1',
    modeDebug: false,
    maintenanceProgrammee: false,
    messageMaintenace: '',
    dureeMaintenanceH: 2,
  });

  const handleSave = () => {
    if (boUser) addAuditLog({
      action: `MODIFICATION paramètres — section "${activeSection}"`,
      utilisateurBO: `${boUser.prenom} ${boUser.nom}`,
      roleBO: boUser.role,
      ancienneValeur: 'configuration précédente',
      nouvelleValeur: activeSection,
      ip: '127.0.0.1',
      module: 'Paramètres',
    });
    setSaved(true);
    toast.success('Paramètres enregistrés avec succès — journalisé');
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = (section: string) => {
    toast.info(`Paramètres "${section}" réinitialisés par défaut`);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'scoring':
        return (
          <div className="space-y-5">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 flex gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700 font-medium">La somme des poids doit être égale à 100%. Total actuel : <strong>{scoring.poidsTransactions + scoring.poidsFormation + scoring.poidsPresence + scoring.poidsAnciennete}%</strong></p>
            </div>
            <h3 className="font-black text-gray-900">Poids par composante</h3>
            {[
              { key: 'poidsTransactions', label: 'Transactions (volume et fréquence)', max: 60 },
              { key: 'poidsFormation', label: 'Formation Academy complétée', max: 40 },
              { key: 'poidsPresence', label: 'Présence et connexions régulières', max: 40 },
              { key: 'poidsAnciennete', label: 'Ancienneté sur la plateforme', max: 30 },
            ].map(f => (
              <div key={f.key}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-gray-700">{f.label}</label>
                </div>
                <SliderInput value={(scoring as any)[f.key]} min={0} max={f.max} onChange={v => setScoring(p => ({ ...p, [f.key]: v }))} unit="%" />
              </div>
            ))}
            <h3 className="font-black text-gray-900 pt-2">Bonus & Pénalités</h3>
            {[
              { key: 'bonusCooperative', label: 'Bonus coopérative (membres actifs)', onChange: (v: number) => setScoring(p => ({ ...p, bonusCooperative: v })) },
              { key: 'bonusAcademy', label: 'Bonus modules Academy complétés', onChange: (v: number) => setScoring(p => ({ ...p, bonusAcademy: v })) },
              { key: 'penaliteSuspension', label: 'Pénalité suspension temporaire', onChange: (v: number) => setScoring(p => ({ ...p, penaliteSuspension: v })) },
              { key: 'penaliteRetard', label: 'Pénalité retard de paiement', onChange: (v: number) => setScoring(p => ({ ...p, penaliteRetard: v })) },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-sm font-bold text-gray-700 mb-2">{f.label}</label>
                <SliderInput value={(scoring as any)[f.key]} min={0} max={50} onChange={f.onChange} unit=" pts" />
              </div>
            ))}
          </div>
        );

      case 'alertes':
        return (
          <div className="space-y-5">
            <h3 className="font-black text-gray-900">Seuils de déclenchement</h3>
            {[
              { key: 'inactiviteJours', label: 'Alerte inactivité (jours sans connexion)', min: 1, max: 30, unit: ' j', onChange: (v: number) => setAlertes(p => ({ ...p, inactiviteJours: v })) },
              { key: 'transactionSuspect', label: 'Nb transactions anormales (sur 24h)', min: 5, max: 200, unit: '', onChange: (v: number) => setAlertes(p => ({ ...p, transactionSuspect: v })) },
              { key: 'volumeAnormal', label: 'Volume x fois supérieur à la moyenne', min: 2, max: 10, unit: 'x', onChange: (v: number) => setAlertes(p => ({ ...p, volumeAnormal: v })) },
              { key: 'dossierAttentHeures', label: 'Dossier en attente max (heures)', min: 24, max: 168, step: 24, unit: 'h', onChange: (v: number) => setAlertes(p => ({ ...p, dossierAttentHeures: v })) },
              { key: 'tauxActiviteMin', label: 'Taux d\'activité minimal zone (%)', min: 10, max: 80, unit: '%', onChange: (v: number) => setAlertes(p => ({ ...p, tauxActiviteMin: v })) },
              { key: 'nbLitigesMax', label: 'Nb litiges avant alerte critique', min: 1, max: 10, unit: '', onChange: (v: number) => setAlertes(p => ({ ...p, nbLitigesMax: v })) },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-sm font-bold text-gray-700 mb-2">{f.label}</label>
                <SliderInput value={(alertes as any)[f.key]} min={f.min} max={f.max} step={f.step} onChange={f.onChange} unit={f.unit} />
              </div>
            ))}
          </div>
        );

      case 'suspension':
        return (
          <div className="space-y-5">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-red-50 border-2 border-red-200">
              <div>
                <p className="font-bold text-red-900">Suspension automatique</p>
                <p className="text-xs text-red-700">Suspend un acteur sans validation humaine</p>
              </div>
              <Toggle value={suspension.suspensionAutoActive} onChange={() => setSuspension(p => ({ ...p, suspensionAutoActive: !p.suspensionAutoActive }))} />
            </div>
            {[
              { key: 'scoreMinSuspension', label: 'Score minimum avant suspension (pts)', min: 0, max: 50, unit: ' pts' },
              { key: 'nbLitigesAuto', label: 'Nb litiges déclenchant la suspension', min: 1, max: 20, unit: '' },
              { key: 'nbTransactionsSuspectes', label: 'Transactions suspectes (suspension auto)', min: 5, max: 50, unit: '' },
              { key: 'inactiviteAutoJours', label: 'Inactivité totale avant suspension (jours)', min: 14, max: 90, unit: ' j' },
              { key: 'notifierAvantJours', label: 'Notification pré-suspension (jours avant)', min: 1, max: 14, unit: ' j' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-sm font-bold text-gray-700 mb-2">{f.label}</label>
                <SliderInput value={(suspension as any)[f.key]} min={f.min} max={f.max} onChange={v => setSuspension(p => ({ ...p, [f.key]: v }))} unit={f.unit} />
              </div>
            ))}
          </div>
        );

      case 'commissions':
        return (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Taux de base (%)</label>
              <SliderInput value={commissions.tauxBase} min={0.5} max={5} step={0.5} onChange={v => setCommissions(p => ({ ...p, tauxBase: v }))} unit="%" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Bonus objectif dépassé (%)</label>
              <SliderInput value={commissions.bonusObjectif} min={0} max={50} step={5} onChange={v => setCommissions(p => ({ ...p, bonusObjectif: v }))} unit="%" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Délai de paiement (jours)</label>
              <SliderInput value={commissions.delaiPaiementJours} min={7} max={90} step={7} onChange={v => setCommissions(p => ({ ...p, delaiPaiementJours: v }))} unit=" j" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Seuil minimum paiement (FCFA)</label>
              <SliderInput value={commissions.seuiMinPaiement} min={500} max={10000} step={500} onChange={v => setCommissions(p => ({ ...p, seuiMinPaiement: v }))} unit=" F" />
            </div>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border-2 border-gray-200">
              <div>
                <p className="font-bold text-gray-900">Paiement automatique</p>
                <p className="text-xs text-gray-600">Déclenche le virement automatiquement à l'échéance</p>
              </div>
              <Toggle value={commissions.paiementAutoActive} onChange={() => setCommissions(p => ({ ...p, paiementAutoActive: !p.paiementAutoActive }))} />
            </div>
          </div>
        );

      case 'sessions':
        return (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Durée session Back-Office (minutes)</label>
              <SliderInput value={sessions.dureeSessionMinutes} min={30} max={1440} step={30} onChange={v => setSessions(p => ({ ...p, dureeSessionMinutes: v }))} unit=" min" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Tentatives échouées max</label>
              <SliderInput value={sessions.tentativesEchecMax} min={3} max={10} onChange={v => setSessions(p => ({ ...p, tentativesEchecMax: v }))} unit="" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Délai verrouillage (minutes)</label>
              <SliderInput value={sessions.delaiVerrouillageMinutes} min={5} max={60} step={5} onChange={v => setSessions(p => ({ ...p, delaiVerrouillageMinutes: v }))} unit=" min" />
            </div>
            {[
              { key: 'deuxFA', label: 'Authentification 2 facteurs (2FA)', desc: 'Code SMS à chaque connexion BO' },
              { key: 'journalisationIP', label: 'Journalisation IP', desc: 'Enregistrer l\'adresse IP de chaque action' },
            ].map(f => (
              <div key={f.key} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border-2 border-gray-200">
                <div>
                  <p className="font-bold text-gray-900">{f.label}</p>
                  <p className="text-xs text-gray-600">{f.desc}</p>
                </div>
                <Toggle value={(sessions as any)[f.key]} onChange={() => setSessions(p => ({ ...p, [f.key]: !(p as any)[f.key] }))} />
              </div>
            ))}
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-4">
            <h3 className="font-black text-gray-900">Canaux actifs</h3>
            {[
              { key: 'smsActif', label: 'SMS (Orange, MTN, Moov)', icon: Smartphone },
              { key: 'emailActif', label: 'Email automatique', icon: Globe },
              { key: 'pushActif', label: 'Push notification in-app', icon: Bell },
            ].map(f => {
              const Icon = f.icon;
              return (
                <div key={f.key} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border-2 border-gray-200">
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-gray-600" />
                    <p className="font-bold text-gray-900">{f.label}</p>
                  </div>
                  <Toggle value={(notifs as any)[f.key]} onChange={() => setNotifs(p => ({ ...p, [f.key]: !(p as any)[f.key] }))} />
                </div>
              );
            })}
            <h3 className="font-black text-gray-900 pt-2">Événements notifiés</h3>
            {[
              { key: 'alertesCritiques', label: 'Alertes critiques (fraudes, anomalies)' },
              { key: 'dossiersEnAttente', label: 'Nouveaux dossiers en attente' },
              { key: 'rapportHebdo', label: 'Rapport hebdomadaire (lundi matin)' },
            ].map(f => (
              <div key={f.key} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border-2 border-gray-200">
                <p className="font-semibold text-gray-900 text-sm">{f.label}</p>
                <Toggle value={(notifs as any)[f.key]} onChange={() => setNotifs(p => ({ ...p, [f.key]: !(p as any)[f.key] }))} />
              </div>
            ))}
          </div>
        );

      case 'api':
        return (
          <div className="space-y-4">
            {[
              { label: 'Version API', value: api.apiVersion },
              { label: 'Webhook URL', value: api.webhookUrl },
            ].map(f => (
              <div key={f.label}>
                <label className="block text-sm font-bold text-gray-700 mb-1">{f.label}</label>
                <div className="flex gap-2">
                  <input defaultValue={f.value} className="flex-1 px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-[#E6A817] focus:outline-none text-sm font-mono" />
                </div>
              </div>
            ))}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Rate limit (requêtes/minute)</label>
              <SliderInput value={api.rateLimitPerMin} min={10} max={500} step={10} onChange={v => setApi(p => ({ ...p, rateLimitPerMin: v }))} unit=" req/min" />
            </div>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-orange-50 border-2 border-orange-200">
              <div>
                <p className="font-bold text-orange-900">Mode maintenance API</p>
                <p className="text-xs text-orange-700">Coupe les accès API externes (urgent)</p>
              </div>
              <Toggle value={api.maintenanceMode} onChange={() => setApi(p => ({ ...p, maintenanceMode: !p.maintenanceMode }))} />
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 border-2 border-gray-200">
              <p className="text-xs font-bold text-gray-600 mb-2">Clé API principale (masquée)</p>
              <div className="font-mono text-xs text-gray-500 bg-white px-3 py-2 rounded-xl border border-gray-200 tracking-widest">
                jlb_••••••••••••••••••••••••••••••••
              </div>
              <motion.button onClick={() => toast.info('Clé régénérée (simulation)')}
                className="mt-2 text-xs font-bold px-3 py-1.5 rounded-xl border-2 border-red-200 text-red-600"
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                Régénérer la clé
              </motion.button>
            </div>
          </div>
        );

      case 'plateforme':
        return (
          <div className="space-y-4">
            {[
              { label: 'Version Android', value: plateforme.versionAndroid, onChange: (v: string) => setPlateforme(p => ({ ...p, versionAndroid: v })) },
              { label: 'Version iOS', value: plateforme.versionIOS, onChange: (v: string) => setPlateforme(p => ({ ...p, versionIOS: v })) },
            ].map(f => (
              <div key={f.label}>
                <label className="block text-sm font-bold text-gray-700 mb-1">{f.label}</label>
                <input value={f.value} onChange={e => f.onChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-[#E6A817] focus:outline-none text-sm font-mono" />
              </div>
            ))}
            {[
              { key: 'modeDebug', label: 'Mode debug', desc: 'Logs verbeux côté app (développement)' },
              { key: 'maintenanceProgrammee', label: 'Maintenance programmée', desc: 'Affiche un écran de maintenance aux utilisateurs' },
            ].map(f => (
              <div key={f.key} className={`flex items-center justify-between p-4 rounded-2xl border-2 ${f.key === 'maintenanceProgrammee' ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'}`}>
                <div>
                  <p className={`font-bold ${f.key === 'maintenanceProgrammee' ? 'text-orange-900' : 'text-gray-900'}`}>{f.label}</p>
                  <p className={`text-xs ${f.key === 'maintenanceProgrammee' ? 'text-orange-700' : 'text-gray-600'}`}>{f.desc}</p>
                </div>
                <Toggle value={(plateforme as any)[f.key]} onChange={() => setPlateforme(p => ({ ...p, [f.key]: !(p as any)[f.key] }))} />
              </div>
            ))}
            {plateforme.maintenanceProgrammee && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Message affiché aux utilisateurs</label>
                  <textarea value={plateforme.messageMaintenace} onChange={e => setPlateforme(p => ({ ...p, messageMaintenace: e.target.value }))} rows={2}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-orange-300 focus:border-[#E6A817] focus:outline-none text-sm resize-none"
                    placeholder="Jùlaba est en maintenance. Nous revenons dans 2 heures..." />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Durée estimée</label>
                  <SliderInput value={plateforme.dureeMaintenanceH} min={1} max={24} onChange={v => setPlateforme(p => ({ ...p, dureeMaintenanceH: v }))} unit="h" />
                </div>
              </motion.div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="px-4 lg:px-8 py-6 max-w-7xl mx-auto">

      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-black text-gray-900">Paramètres Système</h1>
        <p className="text-sm text-gray-500 mt-0.5">Configuration globale de la plateforme Jùlaba</p>
      </motion.div>

      {!canWrite && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-4 mb-5 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0" />
          <p className="text-sm font-semibold text-orange-800">Vous avez un accès en lecture seule sur cette section.</p>
        </motion.div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">

        {/* Menu latéral sections */}
        <div className="lg:w-72 flex-shrink-0">
          <div className="bg-white rounded-3xl shadow-md border-2 border-gray-100 overflow-hidden">
            {SECTIONS.map((section, i) => {
              const Icon = section.icon;
              const active = activeSection === section.id;
              return (
                <motion.button key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-5 py-4 text-left transition-all border-b border-gray-100 last:border-0 ${active ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
                  whileHover={!active ? { x: 4 } : {}}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: active ? `${section.color}20` : '#f3f4f6' }}>
                    <Icon className="w-5 h-5" style={{ color: active ? section.color : '#6b7280' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-sm truncate ${active ? 'text-gray-900' : 'text-gray-600'}`}>{section.titre}</p>
                  </div>
                  {active && <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: section.color }} />}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Contenu section */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div key={activeSection}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-white rounded-3xl p-6 shadow-md border-2 border-gray-100">
              {/* Header section */}
              {(() => {
                const section = SECTIONS.find(s => s.id === activeSection);
                if (!section) return null;
                const Icon = section.icon;
                return (
                  <div className="flex items-center gap-3 mb-6 pb-5 border-b-2 border-gray-100">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${section.color}20` }}>
                      <Icon className="w-6 h-6" style={{ color: section.color }} />
                    </div>
                    <div>
                      <h2 className="font-black text-gray-900 text-lg">{section.titre}</h2>
                      <p className="text-xs text-gray-500">{section.description}</p>
                    </div>
                  </div>
                );
              })()}

              {renderSection()}

              {/* Boutons save/reset */}
              {canWrite && (
                <div className="flex gap-3 mt-8 pt-5 border-t-2 border-gray-100">
                  <motion.button onClick={() => handleReset(activeSection)}
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl border-2 border-gray-200 font-bold text-sm text-gray-700"
                    whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                    <RotateCcw className="w-4 h-4" />
                    Réinitialiser
                  </motion.button>
                  <motion.button onClick={handleSave}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm text-white"
                    style={{ backgroundColor: saved ? '#10B981' : BO_PRIMARY }}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                    {saved ? <CheckCircle2 className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                    {saved ? 'Enregistré !' : 'Enregistrer les modifications'}
                  </motion.button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}