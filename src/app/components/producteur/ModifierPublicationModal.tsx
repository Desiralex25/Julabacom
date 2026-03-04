import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Package, DollarSign, Edit3 } from 'lucide-react';
import { useProducteur, type PublicationOffre, type CycleAgricole } from '../../contexts/ProducteurContext';
import { useApp } from '../../contexts/AppContext';

interface ModifierPublicationModalProps {
  publication: PublicationOffre;
  cycle: CycleAgricole;
  isOpen: boolean;
  onClose: () => void;
}

export function ModifierPublicationModal({ publication, cycle, isOpen, onClose }: ModifierPublicationModalProps) {
  const { updatePublication } = useProducteur();
  const { speak } = useApp();

  // États MODIFIABLES
  const [prixUnitaire, setPrixUnitaire] = useState(publication.prixUnitaire);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleModifier = async () => {
    if (prixUnitaire <= 0) {
      speak('Prix invalide');
      return;
    }

    setIsSubmitting(true);
    speak('Modification en cours...');

    setTimeout(() => {
      updatePublication(publication.id, { prixUnitaire });
      
      setIsSubmitting(false);
      speak('Prix modifié avec succès !');
      onClose();
    }, 1000);
  };

  const montantTotal = publication.stockDisponible * prixUnitaire;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Modal - CENTRÉ */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white rounded-3xl shadow-2xl z-[101] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#C66A2C] to-[#D97706] px-6 py-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <Edit3 className="w-5 h-5" />
                  Modifier le prix
                </h2>
                <p className="text-white/90 text-sm mt-1">{cycle.culture} - {publication.stockDisponible} kg</p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5 text-white" strokeWidth={2.5} />
              </button>
            </div>

            {/* Contenu */}
            <div className="p-6 space-y-5">
              {/* Info publication */}
              <div className="bg-orange-50 rounded-2xl p-4 border-2 border-orange-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 font-medium">Quantité publiée</span>
                  <span className="text-lg font-black text-gray-900">
                    {publication.stockDisponible} kg
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 font-medium">Prix actuel</span>
                  <span className="text-lg font-black text-orange-600">
                    {publication.prixUnitaire} FCFA/kg
                  </span>
                </div>
              </div>

              {/* Nouveau prix - MODIFIABLE */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Nouveau prix (FCFA/kg)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={prixUnitaire}
                    onChange={(e) => setPrixUnitaire(Number(e.target.value))}
                    min={1}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none font-bold text-2xl text-gray-900 bg-white"
                  />
                </div>
                {prixUnitaire !== publication.prixUnitaire && (
                  <p className={`text-xs font-bold mt-2 ${
                    prixUnitaire > publication.prixUnitaire ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {prixUnitaire > publication.prixUnitaire ? '↑' : '↓'} 
                    {' '}
                    {Math.abs(prixUnitaire - publication.prixUnitaire)} FCFA de différence
                  </p>
                )}
              </div>

              {/* Nouveau montant total */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-5 border-2 border-yellow-300">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Nouveau montant total</p>
                  <p className="text-4xl font-black text-green-600">
                    {montantTotal.toLocaleString()} <span className="text-lg">FCFA</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {publication.stockDisponible} kg × {prixUnitaire} FCFA
                  </p>
                </div>
              </div>

              {/* Boutons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 py-4 rounded-2xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleModifier}
                  disabled={isSubmitting || prixUnitaire <= 0 || prixUnitaire === publication.prixUnitaire}
                  className="flex-1 py-4 rounded-2xl font-bold text-white shadow-lg hover:shadow-xl disabled:opacity-50 transition-all"
                  style={{ backgroundColor: '#C66A2C' }}
                >
                  {isSubmitting ? 'Modification...' : 'Modifier'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}