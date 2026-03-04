import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { useWallet } from '../../contexts/WalletContext';
import { useApp } from '../../contexts/AppContext';

// Import des logos Mobile Money
import logoOrange from 'figma:asset/7840046de3eacaf33de5795c18da3a00db7537d8.png';
import logoMTN from 'figma:asset/05a1748493c62d7c35d0a1fc74000c8692f4626c.png';
import logoMoov from 'figma:asset/465392f77ff396489006c9f3550b62cd1a884f25.png';
import logoWave from 'figma:asset/9119f6953c88fd332a7c103f59e0ce9b7098da8a.png';

interface WithdrawWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  roleColor?: string;
}

const MOBILE_MONEY_PROVIDERS = [
  { id: 'ORANGE', name: 'Orange Money', color: '#FF6600', logo: logoOrange },
  { id: 'MTN', name: 'MTN Mobile Money', color: '#FFCC00', logo: logoMTN },
  { id: 'MOOV', name: 'Moov Money', color: '#009CDE', logo: logoMoov },
  { id: 'WAVE', name: 'Wave', color: '#00D9A5', logo: logoWave },
] as const;

const MONTANTS_PREDEFINIS = [1000, 2000, 5000, 10000, 20000, 50000];

export function WithdrawWalletModal({ isOpen, onClose, roleColor = '#2E8B57' }: WithdrawWalletModalProps) {
  const { retirerWallet, getAvailableBalance } = useWallet();
  const { speak } = useApp();
  
  const [etape, setEtape] = useState<1 | 2 | 3>(1);
  const [provider, setProvider] = useState<'ORANGE' | 'MTN' | 'MOOV' | 'WAVE' | null>(null);
  const [montant, setMontant] = useState<string>('');
  const [isAutreMontant, setIsAutreMontant] = useState(false);
  const [numeroMobileMoney, setNumeroMobileMoney] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const soldeDisponible = getAvailableBalance();

  const resetModal = () => {
    setEtape(1);
    setProvider(null);
    setMontant('');
    setIsAutreMontant(false);
    setNumeroMobileMoney('');
    setError('');
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleProviderSelect = (selectedProvider: typeof provider) => {
    setProvider(selectedProvider);
    speak(`${MOBILE_MONEY_PROVIDERS.find(p => p.id === selectedProvider)?.name} sélectionné`);
    setTimeout(() => setEtape(2), 300);
  };

  const handleMontantSelect = (selectedMontant: number) => {
    // Vérifier si le solde est suffisant
    if (selectedMontant > soldeDisponible) {
      setError(`Solde insuffisant. Tu as ${soldeDisponible.toLocaleString()} FCFA disponible`);
      speak('Solde insuffisant');
      return;
    }

    setMontant(selectedMontant.toString());
    setIsAutreMontant(false);
    setError('');
    speak(`${selectedMontant.toLocaleString()} francs CFA`);
    setTimeout(() => setEtape(3), 300);
  };

  const handleAutreMontant = () => {
    setIsAutreMontant(true);
    setMontant('');
    setError('');
    speak('Saisir un autre montant');
  };

  const handleAutreMontantSubmit = () => {
    const montantNum = parseFloat(montant);
    
    if (!montant || montantNum <= 0) {
      setError('Montant invalide');
      speak('Montant invalide');
      return;
    }

    if (montantNum % 100 !== 0) {
      setError('Le montant doit être un multiple de 100 FCFA');
      speak('Le montant doit être un multiple de 100 francs');
      return;
    }

    if (montantNum > soldeDisponible) {
      setError(`Solde insuffisant. Tu as ${soldeDisponible.toLocaleString()} FCFA disponible`);
      speak('Solde insuffisant');
      return;
    }

    setError('');
    speak(`${montantNum.toLocaleString()} francs CFA`);
    setIsAutreMontant(false);
    setTimeout(() => setEtape(3), 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!numeroMobileMoney || numeroMobileMoney.length !== 10) {
      setError('Numéro Mobile Money invalide');
      speak('Numéro Mobile Money invalide. Dix chiffres requis');
      return;
    }

    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await retirerWallet(parseFloat(montant), provider!);
      
      speak(`Retrait effectué avec succès. ${parseFloat(montant).toLocaleString()} francs CFA`);
      
      handleClose();
      
    } catch (err: any) {
      setError(err.message);
      speak('Erreur lors du retrait');
    } finally {
      setLoading(false);
    }
  };

  const handleRetour = () => {
    if (etape === 1) {
      handleClose();
    } else if (etape === 2) {
      setEtape(1);
      setMontant('');
      setIsAutreMontant(false);
      setError('');
      speak('Retour au choix du service');
    } else if (etape === 3) {
      setEtape(2);
      setNumeroMobileMoney('');
      setError('');
      speak('Retour au choix du montant');
    }
  };

  const selectedProviderData = MOBILE_MONEY_PROVIDERS.find(p => p.id === provider);

  // Filtrer les montants prédéfinis selon le solde disponible
  const montantsDisponibles = MONTANTS_PREDEFINIS.filter(m => m <= soldeDisponible);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={handleClose}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="w-full max-w-md pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-3xl border-4 shadow-2xl overflow-hidden" style={{ borderColor: roleColor }}>
                {/* HEADER */}
                <div className="p-5 border-b-2 border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Bouton Retour */}
                      <motion.button
                        onClick={handleRetour}
                        className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {etape === 1 ? (
                          <X className="w-5 h-5 text-gray-700" />
                        ) : (
                          <ArrowLeft className="w-5 h-5 text-gray-700" />
                        )}
                      </motion.button>
                      
                      <div>
                        <p className="text-xs font-semibold text-gray-500">Étape {etape} sur 3</p>
                        <h2 className="text-lg font-bold text-gray-900">Retirer de l'argent</h2>
                      </div>
                    </div>

                    {/* Indicateur d'étapes */}
                    <div className="flex gap-1.5">
                      {[1, 2, 3].map((step) => (
                        <div
                          key={step}
                          className="w-2 h-2 rounded-full transition-all"
                          style={{
                            backgroundColor: step <= etape ? roleColor : '#E5E7EB',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* BODY - Contenu selon l'étape */}
                <div className="p-6 min-h-[400px]">
                  <AnimatePresence mode="wait">
                    {/* ÉTAPE 1 : Choix du service */}
                    {etape === 1 && (
                      <motion.div
                        key="etape1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          Vers quel service ?
                        </h3>
                        <p className="text-sm text-gray-500 mb-6">
                          Tu as {soldeDisponible.toLocaleString()} FCFA disponible
                        </p>
                        
                        <div className="space-y-3">
                          {MOBILE_MONEY_PROVIDERS.map((p) => (
                            <motion.button
                              key={p.id}
                              onClick={() => handleProviderSelect(p.id as any)}
                              whileHover={{ scale: 1.02, x: 4 }}
                              whileTap={{ scale: 0.98 }}
                              className="w-full h-20 rounded-2xl border-2 border-gray-200 bg-white hover:border-gray-300 transition-all flex items-center gap-4 px-5 shadow-sm hover:shadow-md"
                            >
                              <img 
                                src={p.logo} 
                                alt={p.name}
                                className="h-10 w-auto object-contain"
                              />
                              <div className="text-left flex-1">
                                <p className="text-lg font-bold text-gray-900">{p.name}</p>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* ÉTAPE 2 : Choix du montant */}
                    {etape === 2 && !isAutreMontant && (
                      <motion.div
                        key="etape2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          Combien veux-tu retirer ?
                        </h3>
                        <p className="text-sm text-gray-500 mb-6">
                          Vers {selectedProviderData?.name} • Disponible: {soldeDisponible.toLocaleString()} FCFA
                        </p>
                        
                        {error && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-50 border-2 border-red-500 rounded-2xl p-4 mb-4 flex items-start gap-3"
                          >
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm font-semibold text-red-700">{error}</p>
                          </motion.div>
                        )}
                        
                        <div className="space-y-3">
                          {montantsDisponibles.length > 0 ? (
                            montantsDisponibles.map((m) => (
                              <motion.button
                                key={m}
                                onClick={() => handleMontantSelect(m)}
                                whileHover={{ scale: 1.02, x: 4 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full h-16 rounded-2xl border-2 bg-white hover:border-gray-300 transition-all flex items-center justify-between px-5 shadow-sm hover:shadow-md"
                                style={{ borderColor: '#E5E7EB' }}
                              >
                                <span className="text-2xl font-bold text-gray-900">
                                  {m.toLocaleString()}
                                </span>
                                <span className="text-base font-semibold text-gray-500">FCFA</span>
                              </motion.button>
                            ))
                          ) : (
                            <div className="text-center py-8">
                              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                              <p className="text-sm text-gray-500">
                                Solde insuffisant pour les montants prédéfinis
                              </p>
                            </div>
                          )}

                          {/* Bouton "Autre montant" - Toujours visible */}
                          <motion.button
                            onClick={handleAutreMontant}
                            whileHover={{ scale: 1.02, x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full h-16 rounded-2xl border-2 border-dashed transition-all flex items-center justify-center shadow-sm hover:shadow-md"
                            style={{ borderColor: roleColor, backgroundColor: `${roleColor}10` }}
                          >
                            <span className="text-lg font-bold" style={{ color: roleColor }}>
                              Autre montant...
                            </span>
                          </motion.button>
                        </div>
                      </motion.div>
                    )}

                    {/* ÉTAPE 2bis : Saisie autre montant */}
                    {etape === 2 && isAutreMontant && (
                      <motion.div
                        key="etape2bis"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          Saisis le montant
                        </h3>
                        <p className="text-sm text-gray-500 mb-6">
                          Multiple de 100 • Max: {soldeDisponible.toLocaleString()} FCFA
                        </p>

                        <div className="space-y-4">
                          <input
                            type="number"
                            placeholder={`Max: ${soldeDisponible.toLocaleString()}`}
                            value={montant}
                            onChange={(e) => setMontant(e.target.value)}
                            autoFocus
                            step="100"
                            min="100"
                            max={soldeDisponible}
                            className="w-full px-5 py-5 rounded-2xl border-2 border-gray-300 text-2xl font-bold text-center focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-gray-400"
                          />

                          {error && (
                            <motion.div 
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="bg-red-50 border-2 border-red-500 rounded-2xl p-4 flex items-start gap-3"
                            >
                              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                              <p className="text-sm font-semibold text-red-700">{error}</p>
                            </motion.div>
                          )}

                          <motion.button
                            onClick={handleAutreMontantSubmit}
                            disabled={!montant}
                            whileHover={montant ? { scale: 1.02 } : {}}
                            whileTap={montant ? { scale: 0.98 } : {}}
                            className="w-full h-16 rounded-2xl font-bold text-lg text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ backgroundColor: roleColor }}
                          >
                            Continuer
                          </motion.button>
                        </div>
                      </motion.div>
                    )}

                    {/* ÉTAPE 3 : Numéro + Confirmation */}
                    {etape === 3 && (
                      <motion.div
                        key="etape3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          Ton numéro {selectedProviderData?.name}
                        </h3>
                        <p className="text-sm text-gray-500 mb-6">
                          10 chiffres sans espaces
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-5">
                          <input
                            type="tel"
                            placeholder="0701020304"
                            value={numeroMobileMoney}
                            onChange={(e) => setNumeroMobileMoney(e.target.value.replace(/\s/g, ''))}
                            maxLength={10}
                            autoFocus
                            className="w-full px-5 py-5 rounded-2xl border-2 border-gray-300 text-xl font-bold text-center tracking-wider focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-gray-400"
                          />

                          {error && (
                            <motion.div 
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="bg-red-50 border-2 border-red-500 rounded-2xl p-4 flex items-start gap-3"
                            >
                              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                              <p className="text-sm font-semibold text-red-700">{error}</p>
                            </motion.div>
                          )}

                          {/* Résumé */}
                          <div 
                            className="rounded-2xl p-5 border-2"
                            style={{ backgroundColor: '#FFF7ED', borderColor: '#FDBA74' }}
                          >
                            <p className="text-sm font-semibold text-gray-600 mb-3 text-center">
                              Récapitulatif
                            </p>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Montant</span>
                                <span className="text-lg font-bold text-gray-900">
                                  {parseFloat(montant).toLocaleString()} FCFA
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Service</span>
                                <div className="flex items-center gap-2">
                                  <img 
                                    src={selectedProviderData?.logo} 
                                    alt={selectedProviderData?.name}
                                    className="h-6 w-auto object-contain"
                                  />
                                  <span className="text-sm font-bold text-gray-900">
                                    {selectedProviderData?.name}
                                  </span>
                                </div>
                              </div>
                              <div className="flex justify-between items-center pt-2 border-t border-orange-200">
                                <span className="text-sm text-gray-600">Nouveau solde</span>
                                <span className="text-lg font-bold text-orange-600">
                                  {(soldeDisponible - parseFloat(montant)).toLocaleString()} FCFA
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Bouton Confirmer */}
                          <motion.button
                            type="submit"
                            disabled={loading || !numeroMobileMoney || numeroMobileMoney.length !== 10}
                            whileHover={!loading && numeroMobileMoney.length === 10 ? { scale: 1.02 } : {}}
                            whileTap={!loading && numeroMobileMoney.length === 10 ? { scale: 0.98 } : {}}
                            className="w-full h-16 rounded-2xl font-bold text-lg text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            style={{ backgroundColor: '#ea580c' }}
                          >
                            {loading ? (
                              'Traitement...'
                            ) : (
                              <>
                                <Check className="w-5 h-5" />
                                Confirmer le retrait
                              </>
                            )}
                          </motion.button>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
