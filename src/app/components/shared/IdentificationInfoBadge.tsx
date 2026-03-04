/**
 * JULABA - Badge d'Information Identification
 * Affiché dans le profil Marchand/Producteur
 * Montre : Agent identificateur, date, statut BO, numéro de fiche
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Calendar,
  Shield,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from 'lucide-react';
import { StatutBO, STATUT_LABELS, STATUT_COLORS } from '../../data/mockBO';

const PRIMARY = '#C46210';

interface IdentificationInfoBadgeProps {
  numeroFiche: string;
  nomAgent: string;
  prenomAgent: string;
  dateIdentification: string;
  statut: StatutBO;
  raisonsRejet?: string[];
  accentColor?: string;
}

function StatutBadge({ statut }: { statut: StatutBO }) {
  const colors = STATUT_COLORS[statut];
  const icon = statut === 'valide'
    ? <CheckCircle className="w-4 h-4" />
    : statut === 'rejete'
    ? <XCircle className="w-4 h-4" />
    : statut === 'soumis'
    ? <Clock className="w-4 h-4" />
    : <FileText className="w-4 h-4" />;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 text-xs font-bold ${colors.bg} ${colors.text} ${colors.border}`}>
      {icon}
      {STATUT_LABELS[statut]}
    </span>
  );
}

function InfoRow({ icon: Icon, label, value, color = '#6B7280' }: {
  icon: React.ElementType;
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-sm font-bold text-gray-900 truncate">{value}</p>
      </div>
    </div>
  );
}

export function IdentificationInfoBadge({
  numeroFiche,
  nomAgent,
  prenomAgent,
  dateIdentification,
  statut,
  raisonsRejet,
  accentColor = PRIMARY,
}: IdentificationInfoBadgeProps) {
  const [expanded, setExpanded] = useState(false);

  const dateFormatee = new Date(dateIdentification).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border-2 overflow-hidden"
      style={{ borderColor: `${accentColor}30` }}
    >
      {/* Header */}
      <motion.button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 gap-2"
        style={{ backgroundColor: `${accentColor}08` }}
        whileHover={{ backgroundColor: `${accentColor}12` }}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${accentColor}20` }}
          >
            <FileText className="w-5 h-5" style={{ color: accentColor }} />
          </div>
          <div className="text-left min-w-0">
            <p className="text-xs font-bold text-gray-500">Fiche d'identification JULABA</p>
            <p className="font-black text-gray-900 break-all leading-tight">{numeroFiche}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <StatutBadge statut={statut} />
          {expanded
            ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
            : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
          }
        </div>
      </motion.button>

      {/* Détails */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-3 border-t-2" style={{ borderColor: `${accentColor}20` }}>
              <InfoRow
                icon={User}
                label="Agent identificateur"
                value={`${prenomAgent} ${nomAgent}`}
                color={accentColor}
              />
              <InfoRow
                icon={Calendar}
                label="Date d'identification"
                value={dateFormatee}
                color="#2072AF"
              />
              <InfoRow
                icon={Shield}
                label="Numéro de fiche"
                value={numeroFiche}
                color="#16A34A"
              />

              {/* Statut détaillé */}
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: statut === 'valide' ? '#16A34A15' : statut === 'rejete' ? '#DC262615' : '#D9770615' }}
                >
                  {statut === 'valide'
                    ? <CheckCircle className="w-4 h-4 text-green-600" />
                    : statut === 'rejete'
                    ? <XCircle className="w-4 h-4 text-red-600" />
                    : <Clock className="w-4 h-4 text-amber-600" />
                  }
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Statut validation</p>
                  <StatutBadge statut={statut} />
                </div>
              </div>

              {/* Raisons de rejet */}
              {statut === 'rejete' && raisonsRejet && raisonsRejet.length > 0 && (
                <div className="p-3 rounded-2xl bg-red-50 border-2 border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <p className="text-xs font-bold text-red-700">Motif(s) de rejet</p>
                  </div>
                  <ul className="space-y-1.5">
                    {raisonsRejet.map((r, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-red-700">
                        <span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                        {r}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-red-600 font-bold mt-2">
                    Votre agent identificateur va vous recontacter pour corriger votre dossier.
                  </p>
                </div>
              )}

              {/* Message d'attente pour statut soumis */}
              {statut === 'soumis' && (
                <div className="p-3 rounded-2xl bg-amber-50 border-2 border-amber-200">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <p className="text-xs font-bold text-amber-700">
                      Votre dossier est en cours d'examen par le Back Office JULABA. Vous serez notifié par SMS dès qu'une décision est prise.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}