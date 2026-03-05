/**
 * JULABA - Simulateur Back Office (BO)
 * Permet de simuler les actions BO (validation/rejet) depuis l'interface
 * EN ATTENDANT la création du vrai Back Office
 * 
 * Ce composant est visible uniquement dans le profil Identificateur
 * et représente ce que le BO fera réellement
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronDown,
  X,
  Send,
  Smartphone,
  Eye,
  Building2,
  Clock,
} from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationsContext';
import {
  MOCK_IDENTIFICATIONS_BO,
  IdentificationBO,
  RAISONS_REJET,
  STATUT_LABELS,
  STATUT_COLORS,
  StatutBO,
} from '../../data/mockBO';

const BO_COLOR = '#702963'; // Couleur violette pour le BO

interface SimulateurBOProps {
  isOpen: boolean;
  onClose: () => void;
  identificateurId?: string;
}

export function SimulateurBO({ isOpen, onClose, identificateurId = 'identificateur-001' }: SimulateurBOProps) {
  const { triggerDossierValide, triggerDossierRejete } = useNotifications();
  const [selectedFiche, setSelectedFiche] = useState<IdentificationBO | null>(null);
  const [action, setAction] = useState<'valider' | 'rejeter' | null>(null);
  const [raisonsSelectionnees, setRaisonsSelectionnees] = useState<string[]>([]);
  const [raisonPerso, setRaisonPerso] = useState('');
  const [confirme, setConfirme] = useState(false);

  const fichesEnAttente = MOCK_IDENTIFICATIONS_BO.filter(f => f.statut === 'soumis');
  const fichesValidees = MOCK_IDENTIFICATIONS_BO.filter(f => f.statut === 'valide');
  const fichesRejetees = MOCK_IDENTIFICATIONS_BO.filter(f => f.statut === 'rejete');

  const handleValider = () => {
    if (!selectedFiche) return;
    triggerDossierValide({
      identificateurId,
      prenomActeur: selectedFiche.prenomActeur,
      nomActeur: selectedFiche.nomActeur,
      typeActeur: selectedFiche.typeActeur,
      numeroFiche: selectedFiche.numeroFiche,
      nomAgentBO: 'KOFFI Jean-Baptiste (BO simulé)',
    });
    setConfirme(true);
    setTimeout(() => {
      setConfirme(false);
      setSelectedFiche(null);
      setAction(null);
    }, 3000);
  };

  const handleRejeter = () => {
    if (!selectedFiche) return;
    const toutesRaisons = [
      ...raisonsSelectionnees,
      ...(raisonPerso.trim() ? [raisonPerso.trim()] : []),
    ];
    if (toutesRaisons.length === 0) return;
    triggerDossierRejete({
      identificateurId,
      prenomActeur: selectedFiche.prenomActeur,
      nomActeur: selectedFiche.nomActeur,
      typeActeur: selectedFiche.typeActeur,
      numeroFiche: selectedFiche.numeroFiche,
      nomAgentBO: 'COULIBALY Aminata (BO simulé)',
      raisons: toutesRaisons,
    });
    setConfirme(true);
    setTimeout(() => {
      setConfirme(false);
      setSelectedFiche(null);
      setAction(null);
      setRaisonsSelectionnees([]);
      setRaisonPerso('');
    }, 3000);
  };

  const toggleRaison = (r: string) => {
    setRaisonsSelectionnees(prev =>
      prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]
    );
  };

  function FicheRow({ fiche }: { fiche: IdentificationBO }) {
    const colors = STATUT_COLORS[fiche.statut];
    return (
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => {
          setSelectedFiche(fiche);
          setAction(null);
          setConfirme(false);
        }}
        className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
          selectedFiche?.id === fiche.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-white'
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <p className="font-black text-gray-900 text-sm">{fiche.prenomActeur} {fiche.nomActeur}</p>
          <span className={`px-2 py-0.5 rounded-lg border text-xs font-bold ${colors.bg} ${colors.text} ${colors.border}`}>
            {STATUT_LABELS[fiche.statut]}
          </span>
        </div>
        <p className="text-xs text-gray-500">{fiche.numeroFiche} • {fiche.typeActeur === 'marchand' ? 'Marchand' : 'Producteur'}</p>
        <p className="text-xs text-gray-400">{fiche.communeActeur} • Agent : {fiche.prenomIdentificateur} {fiche.nomIdentificateur}</p>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-end px-4 pb-4 lg:items-center lg:justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-3xl w-full max-h-[92vh] flex flex-col lg:max-w-2xl"
          >
            {/* Header BO */}
            <div
              className="flex items-center justify-between px-6 py-4 rounded-t-3xl"
              style={{ backgroundColor: BO_COLOR }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white/70">SIMULATION</p>
                  <h2 className="font-black text-white">Back Office JULABA</h2>
                </div>
              </div>
              <motion.button
                onClick={onClose}
                whileHover={{ rotate: 90, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
              >
                <X className="w-5 h-5 text-white" />
              </motion.button>
            </div>

            {/* Avertissement simulation */}
            <div className="px-4 py-3 bg-amber-50 border-b-2 border-amber-200">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <p className="text-xs font-bold text-amber-700">
                  Interface de simulation — En attendant la création du vrai Back Office JULABA
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {/* Statistiques rapides */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { label: 'En attente', count: fichesEnAttente.length, color: 'amber' },
                  { label: 'Validées', count: fichesValidees.length, color: 'green' },
                  { label: 'Rejetées', count: fichesRejetees.length, color: 'red' },
                ].map(s => (
                  <div key={s.label} className={`p-3 rounded-2xl text-center bg-${s.color}-50 border-2 border-${s.color}-200`}>
                    <p className={`text-2xl font-black text-${s.color}-700`}>{s.count}</p>
                    <p className={`text-xs font-bold text-${s.color}-600`}>{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Liste fiches */}
              <div className="mb-4">
                <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                  Toutes les fiches
                </p>
                <div className="space-y-2">
                  {MOCK_IDENTIFICATIONS_BO.map(f => (
                    <FicheRow key={f.id} fiche={f} />
                  ))}
                </div>
              </div>

              {/* Panel actions pour la fiche sélectionnée */}
              <AnimatePresence>
                {selectedFiche && !confirme && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="p-4 rounded-3xl border-2 border-purple-200 bg-purple-50"
                  >
                    <div className="mb-3">
                      <p className="font-black text-purple-900 text-base">
                        {selectedFiche.prenomActeur} {selectedFiche.nomActeur}
                      </p>
                      <p className="text-xs text-purple-700">{selectedFiche.numeroFiche} • {selectedFiche.communeActeur}</p>
                    </div>

                    {selectedFiche.statut === 'soumis' ? (
                      <>
                        <p className="text-xs font-bold text-gray-600 mb-3">
                          Choisir l'action du Back Office :
                        </p>
                        <div className="flex gap-2 mb-3">
                          <motion.button
                            onClick={() => setAction('valider')}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className={`flex-1 py-2.5 rounded-2xl border-2 font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                              action === 'valider'
                                ? 'bg-green-600 text-white border-green-600'
                                : 'bg-green-50 text-green-700 border-green-300'
                            }`}
                          >
                            <CheckCircle className="w-4 h-4" />
                            Valider
                          </motion.button>
                          <motion.button
                            onClick={() => setAction('rejeter')}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className={`flex-1 py-2.5 rounded-2xl border-2 font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                              action === 'rejeter'
                                ? 'bg-red-600 text-white border-red-600'
                                : 'bg-red-50 text-red-700 border-red-300'
                            }`}
                          >
                            <XCircle className="w-4 h-4" />
                            Rejeter
                          </motion.button>
                        </div>

                        {/* Formulaire validation */}
                        <AnimatePresence>
                          {action === 'valider' && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="p-3 rounded-2xl bg-green-50 border-2 border-green-200 mb-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <Smartphone className="w-4 h-4 text-green-600" />
                                  <p className="text-xs font-bold text-green-700">SMS qui sera envoyé au {selectedFiche.typeActeur === 'marchand' ? 'Marchand' : 'Producteur'} :</p>
                                </div>
                                <p className="text-xs text-gray-600 font-mono leading-relaxed">
                                  Bonjour {selectedFiche.prenomActeur} ! Votre inscription sur JULABA a ete validee. Votre numero est {selectedFiche.numeroFiche}. Telechargez JULABA et connectez-vous avec votre telephone pour acceder a votre compte.
                                </p>
                              </div>
                              <motion.button
                                onClick={handleValider}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full py-3 rounded-2xl bg-green-600 text-white font-black flex items-center justify-center gap-2"
                              >
                                <Send className="w-4 h-4" />
                                Confirmer la validation et envoyer les notifications
                              </motion.button>
                            </motion.div>
                          )}

                          {/* Formulaire rejet */}
                          {action === 'rejeter' && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <p className="text-xs font-bold text-gray-700 mb-2">Sélectionner la/les raison(s) :</p>
                              <div className="space-y-1.5 mb-3 max-h-40 overflow-y-auto">
                                {RAISONS_REJET.map(r => (
                                  <label
                                    key={r}
                                    className={`flex items-center gap-2 p-2 rounded-xl cursor-pointer border-2 transition-all text-xs ${
                                      raisonsSelectionnees.includes(r)
                                        ? 'bg-red-100 border-red-400 text-red-800'
                                        : 'bg-white border-gray-200 text-gray-700'
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={raisonsSelectionnees.includes(r)}
                                      onChange={() => toggleRaison(r)}
                                      className="w-3 h-3 rounded accent-red-600"
                                    />
                                    <span className="font-medium">{r}</span>
                                  </label>
                                ))}
                              </div>
                              <input
                                type="text"
                                value={raisonPerso}
                                onChange={e => setRaisonPerso(e.target.value)}
                                placeholder="Autre raison personnalisée..."
                                className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 text-xs mb-3 focus:border-red-400 focus:outline-none"
                              />
                              <motion.button
                                onClick={handleRejeter}
                                disabled={raisonsSelectionnees.length === 0 && !raisonPerso.trim()}
                                whileHover={{ scale: raisonsSelectionnees.length > 0 || raisonPerso.trim() ? 1.02 : 1 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full py-3 rounded-2xl font-black flex items-center justify-center gap-2 disabled:opacity-40 bg-red-600 text-white"
                              >
                                <Send className="w-4 h-4" />
                                Confirmer le rejet et envoyer les notifications
                              </motion.button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <div className={`p-3 rounded-2xl border-2 text-center ${STATUT_COLORS[selectedFiche.statut].bg} ${STATUT_COLORS[selectedFiche.statut].border}`}>
                        <p className={`text-sm font-bold ${STATUT_COLORS[selectedFiche.statut].text}`}>
                          {STATUT_LABELS[selectedFiche.statut]}
                        </p>
                        {selectedFiche.statut === 'draft' && (
                          <p className="text-xs text-gray-500 mt-1">Ce dossier est encore en brouillon, pas encore soumis par l'Identificateur.</p>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Confirmation */}
                {confirme && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-6 rounded-3xl border-2 border-green-300 bg-green-50 text-center"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.5, repeat: 2 }}
                      className="flex justify-center mb-3"
                    >
                      <CheckCircle className="w-12 h-12 text-green-600" />
                    </motion.div>
                    <p className="font-black text-green-800 text-lg mb-1">Notifications envoyées</p>
                    <p className="text-sm text-green-700">
                      L'Identificateur a reçu une notification in-app et le {selectedFiche?.typeActeur === 'marchand' ? 'Marchand' : 'Producteur'} a reçu un SMS.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}