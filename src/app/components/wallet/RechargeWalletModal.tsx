import { useWallet } from '../../contexts/WalletContext';
import { useApp } from '../../contexts/AppContext';
import { useNotifications } from '../../contexts/NotificationsContext';
import { useUser } from '../../contexts/UserContext';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowLeft, Check } from 'lucide-react';

// Import des logos Mobile Money
const logoOrange = '/images/logo-orange-money.svg';
const logoMTN = '/images/logo-mtn.svg';
const logoMoov = '/images/logo-moov.svg';
const logoWave = '/images/logo-wave.svg';

interface RechargeWalletModalProps {
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

export function RechargeWalletModal({ isOpen, onClose, roleColor = '#2E8B57' }: RechargeWalletModalProps) {
  const { rechargerWallet } = useWallet();
  const { speak } = useApp();
  const { triggerPaiementValideMarchand, triggerInfo } = useNotifications();
  const { user } = useUser();
  
  const [etape, setEtape] = useState<1 | 2 | 3>(1);
  const [provider, setProvider] = useState<'ORANGE' | 'MTN' | 'MOOV' | 'WAVE' | null>(null);
  const [montant, setMontant] = useState<string>('');
  const [isAutreMontant, setIsAutreMontant] = useState(false);
  const [numeroMobileMoney, setNumeroMobileMoney] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    setMontant(selectedMontant.toString());
    setIsAutreMontant(false);
    speak(`${selectedMontant.toLocaleString()} francs CFA`);
    setTimeout(() => setEtape(3), 300);
  };

  const handleAutreMontant = () => {
    setIsAutreMontant(true);
    setMontant('');
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
      
      const reference = `MM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      await rechargerWallet(parseFloat(montant), provider!, reference);
      
      speak(`Wallet rechargé avec succès. ${parseFloat(montant).toLocaleString()} francs CFA`);

      // Déclencher notification selon le rôle
      if (user?.id) {
        if (user.role === 'marchand') {
          triggerPaiementValideMarchand(user.id, parseFloat(montant), reference);
        } else {
          triggerInfo(user.id, (user.role as any) || 'marchand', 'Wallet rechargé', `Rechargement de ${parseFloat(montant).toLocaleString('fr-FR')} FCFA via ${provider} confirmé.`);
        }
      }
      
      handleClose();
      
    } catch (err: any) {
      setError(err.message);
      speak('Erreur lors du rechargement');
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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200]"
            onClick={handleClose}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 pointer-events-none">
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
                        <h2 className="text-lg font-bold text-gray-900">Ajouter de l'argent</h2>
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
                        <h3 className="text-xl font-bold text-gray-900 mb-6">
                          Quel service utilises-tu ?
                        </h3>
                        
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
                          Combien veux-tu ajouter ?
                        </h3>
                        <p className="text-sm text-gray-500 mb-6">
                          Depuis {selectedProviderData?.name}
                        </p>
                        
                        <div className="space-y-3">
                          {MONTANTS_PREDEFINIS.map((m) => (
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
                          ))}

                          {/* Bouton "Autre montant" */}
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
                          Multiple de 100 FCFA
                        </p>

                        <div className="space-y-4">
                          <input
                            type="number"
                            placeholder="Ex: 15000"
                            value={montant}
                            onChange={(e) => setMontant(e.target.value)}
                            autoFocus
                            step="100"
                            min="100"
                            className="w-full px-5 py-5 rounded-2xl border-2 border-gray-300 text-2xl font-bold text-center focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-gray-400"
                          />

                          {error && (
                            <motion.div 
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="bg-red-50 border-2 border-red-500 rounded-2xl p-4"
                            >
                              <p className="text-sm font-semibold text-red-700 text-center">⚠️ {error}</p>
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
                            className="w-full px-5 py-5 rounded-2xl border-2 border-gray-300 text-xl font-bold text-center tracking-wider focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-gray-400"
                          />

                          {error && (
                            <motion.div 
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="bg-red-50 border-2 border-red-500 rounded-2xl p-4"
                            >
                              <p className="text-sm font-semibold text-red-700 text-center">⚠️ {error}</p>
                            </motion.div>
                          )}

                          {/* Résumé */}
                          <div 
                            className="rounded-2xl p-5 border-2"
                            style={{ backgroundColor: `${roleColor}10`, borderColor: `${roleColor}40` }}
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
                            </div>
                          </div>

                          {/* Bouton Confirmer */}
                          <motion.button
                            type="submit"
                            disabled={loading || !numeroMobileMoney || numeroMobileMoney.length !== 10}
                            whileHover={!loading && numeroMobileMoney.length === 10 ? { scale: 1.02 } : {}}
                            whileTap={!loading && numeroMobileMoney.length === 10 ? { scale: 0.98 } : {}}
                            className="w-full h-16 rounded-2xl font-bold text-lg text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            style={{ backgroundColor: '#16a34a' }}
                          >
                            {loading ? (
                              'Traitement...'
                            ) : (
                              <>
                                <Check className="w-5 h-5" />
                                Confirmer et Ajouter
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