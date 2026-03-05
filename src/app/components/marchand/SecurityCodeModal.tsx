import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock,
  Shield,
  Settings,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

// ========== SECURITY CODE MODAL ==========
interface SecurityCodeModalProps {
  isOpen?: boolean;
  onClose: () => void;
  speak: (text: string) => void;
}

export function SecurityCodeModal({ isOpen = true, onClose, speak }: SecurityCodeModalProps) {
  // Simuler si l'utilisateur a déjà un code ou non (à remplacer par vraie logique backend)
  const [hasExistingCode, setHasExistingCode] = useState(false); // false = pas encore de code
  
  const [step, setStep] = useState<'verify' | 'change'>(hasExistingCode ? 'verify' : 'change');
  const [oldCode, setOldCode] = useState('');
  const [newCode, setNewCode] = useState('');
  const [confirmCode, setConfirmCode] = useState('');
  const [error, setError] = useState('');

  // Toggles de sécurité
  const [autoLock, setAutoLock] = useState(false);
  const [requireCodeForActions, setRequireCodeForActions] = useState(false);
  const [requireForTransactions, setRequireForTransactions] = useState(true);
  const [requireForProfile, setRequireForProfile] = useState(true);
  const [requireForSettings, setRequireForSettings] = useState(false);
  const [requireForLogout, setRequireForLogout] = useState(false);
  const [requireForCaisseView, setRequireForCaisseView] = useState(false);
  const [requireForHistoryView, setRequireForHistoryView] = useState(false);
  const [requireForExportData, setRequireForExportData] = useState(true);
  const [requireForDeleteTransaction, setRequireForDeleteTransaction] = useState(true);
  const [requireForModifyTransaction, setRequireForModifyTransaction] = useState(true);
  const [requireForAddProduct, setRequireForAddProduct] = useState(false);
  const [requireForModifyPrice, setRequireForModifyPrice] = useState(true);
  const [requireForReports, setRequireForReports] = useState(false);
  const [requireForShareDocuments, setRequireForShareDocuments] = useState(true);
  const [requireForPhoneChange, setRequireForPhoneChange] = useState(true);
  const [requireForEmailChange, setRequireForEmailChange] = useState(true);
  const [requireForDeleteAccount, setRequireForDeleteAccount] = useState(true);
  const [requireForStatistics, setRequireForStatistics] = useState(false);
  const [requireForValidateOrder, setRequireForValidateOrder] = useState(false);
  const [requireForCancelOrder, setRequireForCancelOrder] = useState(true);
  const [requireForTransferMoney, setRequireForTransferMoney] = useState(true);
  const [requireForWithdrawMoney, setRequireForWithdrawMoney] = useState(true);
  const [requireForAddBeneficiary, setRequireForAddBeneficiary] = useState(true);
  const [requireForBankingInfo, setRequireForBankingInfo] = useState(true);
  const [requireForConfidentialDocs, setRequireForConfidentialDocs] = useState(true);

  const handleCodeInput = (value: string, setter: (val: string) => void) => {
    // N'accepter que les chiffres et limiter à 4 caractères
    const filtered = value.replace(/\D/g, '').slice(0, 4);
    setter(filtered);
  };

  const handleVerifyOldCode = () => {
    if (!oldCode) {
      setError('Veuillez entrer votre ancien code de sécurité');
      speak('Veuillez entrer votre ancien code de sécurité');
      return;
    }

    if (oldCode.length !== 4 || !/^\d+$/.test(oldCode)) {
      setError('Le code doit contenir exactement 4 chiffres');
      speak('Le code doit contenir exactement 4 chiffres');
      return;
    }

    // Validation de l'ancien code (ici on simule avec '1234')
    if (oldCode !== '1234') {
      setError('L\'ancien code de sécurité est incorrect');
      speak('L\'ancien code de sécurité est incorrect');
      return;
    }

    // Succès - passer à l'étape suivante
    setError('');
    setStep('change');
    speak('Ancien code validé, vous pouvez maintenant entrer votre nouveau code de sécurité');
  };

  const handleSaveNewCode = () => {
    if (!newCode || !confirmCode) {
      setError('Veuillez remplir tous les champs');
      speak('Veuillez remplir tous les champs');
      return;
    }

    if (newCode.length !== 4 || !/^\d+$/.test(newCode)) {
      setError('Le code doit contenir exactement 4 chiffres');
      speak('Le code doit contenir exactement 4 chiffres');
      return;
    }

    if (newCode !== confirmCode) {
      setError('Les codes ne correspondent pas');
      speak('Les codes ne correspondent pas');
      return;
    }

    // Succès
    setError('');
    speak('Code de sécurité modifié avec succès');
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-end px-4 pb-4"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl w-full max-h-[85vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
          <h2 className="text-xl font-bold text-gray-900">
            {!hasExistingCode 
              ? 'Créer un code de sécurité' 
              : step === 'verify' 
                ? 'Modifier le code de sécurité' 
                : 'Nouveau code de sécurité'
            }
          </h2>
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
            whileHover={{ rotate: 90, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </motion.button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {step === 'verify' ? (
            <>
              {/* Étape 1 : Vérifier l'ancien code */}
              
              {/* Info sur le code de sécurité */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-blue-900">À propos du code de sécurité</p>
                  <p className="text-xs text-blue-700 mt-1">
                    Le code de sécurité à 4 chiffres protège vos actions sensibles et peut verrouiller automatiquement l'application. Il est optionnel mais fortement recommandé.
                  </p>
                </div>
              </motion.div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Ancien code de sécurit</label>
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border-2 border-gray-200">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <Lock className="w-5 h-5" style={{ color: '#C46210' }} />
                  </div>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={oldCode}
                    onChange={(e) => handleCodeInput(e.target.value, setOldCode)}
                    placeholder="••••"
                    className="flex-1 p-2 rounded-xl border-0 focus:outline-none font-bold text-gray-900 text-center text-2xl tracking-widest"
                    onKeyPress={(e) => e.key === 'Enter' && handleVerifyOldCode()}
                  />
                </div>
                <p className="text-xs text-gray-500 px-2">
                  Pour des raisons de sécurité, veuillez d'abord confirmer votre ancien code
                </p>
              </div>

              {/* Message d'erreur */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl bg-red-50 border-2 border-red-200 flex items-center gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-sm font-semibold text-red-700">{error}</p>
                </motion.div>
              )}

              {/* Bouton Vérifier */}
              <motion.button
                onClick={handleVerifyOldCode}
                className="w-full py-4 rounded-2xl text-lg font-bold text-white shadow-lg flex items-center justify-center gap-2"
                style={{ backgroundColor: '#C46210' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <CheckCircle className="w-6 h-6" />
                Vérifier
              </motion.button>

              {/* Paramètres de sécurité */}
              <div className="pt-4 border-t-2 border-gray-200">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Paramètres de sécurité</h3>
                
                {/* Verrouillage automatique */}
                <SettingToggle
                  icon={Lock}
                  label="Verrouillage automatique"
                  value={autoLock}
                  onChange={(val) => {
                    setAutoLock(val);
                    speak(val ? 'Verrouillage automatique activé' : 'Verrouillage automatique désactivé');
                  }}
                />
                {autoLock && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="ml-4 mt-2 p-3 rounded-xl bg-gray-50 border border-gray-200"
                  >
                    <p className="text-xs text-gray-700">
                      <strong>L'application se verrouillera :</strong><br />
                      • Au démarrage de l'app<br />
                      • Dès que vous quittez l'application
                    </p>
                  </motion.div>
                )}

                {/* Confirmation par code pour actions sensibles */}
                <div className="mt-3">
                  <SettingToggle
                    icon={Shield}
                    label="Confirmation pour actions sensibles"
                    value={requireCodeForActions}
                    onChange={(val) => {
                      setRequireCodeForActions(val);
                      speak(val ? 'Confirmation par code activée' : 'Confirmation par code désactivée');
                    }}
                  />
                </div>

                {/* Sous-options si activé */}
                {requireCodeForActions && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="ml-4 mt-2 space-y-2"
                  >
                    <SubToggle
                      label="Transactions (ventes/dépenses)"
                      value={requireForTransactions}
                      onChange={setRequireForTransactions}
                    />
                    <SubToggle
                      label="Modifications du profil"
                      value={requireForProfile}
                      onChange={setRequireForProfile}
                    />
                    <SubToggle
                      label="Changement de paramètres"
                      value={requireForSettings}
                      onChange={setRequireForSettings}
                    />
                    <SubToggle
                      label="Déconnexion"
                      value={requireForLogout}
                      onChange={setRequireForLogout}
                    />
                    <SubToggle
                      label="Vue de la caisse"
                      value={requireForCaisseView}
                      onChange={setRequireForCaisseView}
                    />
                    <SubToggle
                      label="Vue de l'historique"
                      value={requireForHistoryView}
                      onChange={setRequireForHistoryView}
                    />
                    <SubToggle
                      label="Exportation de données"
                      value={requireForExportData}
                      onChange={setRequireForExportData}
                    />
                    <SubToggle
                      label="Suppression de transaction"
                      value={requireForDeleteTransaction}
                      onChange={setRequireForDeleteTransaction}
                    />
                    <SubToggle
                      label="Modification de transaction"
                      value={requireForModifyTransaction}
                      onChange={setRequireForModifyTransaction}
                    />
                    <SubToggle
                      label="Ajout de produit"
                      value={requireForAddProduct}
                      onChange={setRequireForAddProduct}
                    />
                    <SubToggle
                      label="Modification de prix"
                      value={requireForModifyPrice}
                      onChange={setRequireForModifyPrice}
                    />
                    <SubToggle
                      label="Rapports"
                      value={requireForReports}
                      onChange={setRequireForReports}
                    />
                    <SubToggle
                      label="Partage de documents"
                      value={requireForShareDocuments}
                      onChange={setRequireForShareDocuments}
                    />
                    <SubToggle
                      label="Changement de numéro de téléphone"
                      value={requireForPhoneChange}
                      onChange={setRequireForPhoneChange}
                    />
                    <SubToggle
                      label="Changement d'email"
                      value={requireForEmailChange}
                      onChange={setRequireForEmailChange}
                    />
                    <SubToggle
                      label="Suppression de compte"
                      value={requireForDeleteAccount}
                      onChange={setRequireForDeleteAccount}
                    />
                    <SubToggle
                      label="Statistiques"
                      value={requireForStatistics}
                      onChange={setRequireForStatistics}
                    />
                    <SubToggle
                      label="Validation de commande"
                      value={requireForValidateOrder}
                      onChange={setRequireForValidateOrder}
                    />
                    <SubToggle
                      label="Annulation de commande"
                      value={requireForCancelOrder}
                      onChange={setRequireForCancelOrder}
                    />
                    <SubToggle
                      label="Transfert d'argent"
                      value={requireForTransferMoney}
                      onChange={setRequireForTransferMoney}
                    />
                    <SubToggle
                      label="Retrait d'argent"
                      value={requireForWithdrawMoney}
                      onChange={setRequireForWithdrawMoney}
                    />
                    <SubToggle
                      label="Ajout de bénéficiaire"
                      value={requireForAddBeneficiary}
                      onChange={setRequireForAddBeneficiary}
                    />
                    <SubToggle
                      label="Informations bancaires"
                      value={requireForBankingInfo}
                      onChange={setRequireForBankingInfo}
                    />
                    <SubToggle
                      label="Documents confidentiels"
                      value={requireForConfidentialDocs}
                      onChange={setRequireForConfidentialDocs}
                    />
                  </motion.div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Étape 2 : Entrer le nouveau code */}
              
              {/* Message différent selon création ou modification */}
              {hasExistingCode ? (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl bg-green-50 border-2 border-green-200 flex items-center gap-3"
                >
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-sm font-semibold text-green-700">
                    Ancien code validé ✓
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-blue-900">Créez votre code de sécurité</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Ce code à 4 chiffres protégera vos actions sensibles. Choisissez un code facile à retenir mais difficile à deviner.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Nouveau code */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  {hasExistingCode ? 'Nouveau code de sécurité' : 'Code de sécurité'}
                </label>
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border-2 border-gray-200">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <Lock className="w-5 h-5" style={{ color: '#C46210' }} />
                  </div>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={newCode}
                    onChange={(e) => handleCodeInput(e.target.value, setNewCode)}
                    placeholder="••••"
                    className="flex-1 p-2 rounded-xl border-0 focus:outline-none font-bold text-gray-900 text-center text-2xl tracking-widest"
                  />
                </div>
                <p className="text-xs text-gray-500 px-2">
                  Exactement 4 chiffres
                </p>
              </div>

              {/* Confirmer le code */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Confirmer le code</label>
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border-2 border-gray-200">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <Lock className="w-5 h-5" style={{ color: '#C46210' }} />
                  </div>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={confirmCode}
                    onChange={(e) => handleCodeInput(e.target.value, setConfirmCode)}
                    placeholder="••••"
                    className="flex-1 p-2 rounded-xl border-0 focus:outline-none font-bold text-gray-900 text-center text-2xl tracking-widest"
                    onKeyPress={(e) => e.key === 'Enter' && handleSaveNewCode()}
                  />
                </div>
              </div>

              {/* Message d'erreur */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl bg-red-50 border-2 border-red-200 flex items-center gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-sm font-semibold text-red-700">{error}</p>
                </motion.div>
              )}

              {/* Bouton Enregistrer */}
              <motion.button
                onClick={handleSaveNewCode}
                className="w-full py-4 rounded-2xl text-lg font-bold text-white shadow-lg flex items-center justify-center gap-2"
                style={{ backgroundColor: '#00563B' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <CheckCircle className="w-6 h-6" />
                {hasExistingCode ? 'Enregistrer' : 'Créer mon code'}
              </motion.button>

              {/* Bouton Retour ou Ignorer */}
              {hasExistingCode ? (
                <motion.button
                  onClick={() => {
                    setStep('verify');
                    setError('');
                    setNewCode('');
                    setConfirmCode('');
                  }}
                  className="w-full py-3 rounded-2xl text-sm font-semibold text-gray-600 border-2 border-gray-200 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Retour
                </motion.button>
              ) : (
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    speak('Vous avez choisi de ne pas créer de code de sécurité');
                    onClose();
                  }}
                  className="w-full py-3 rounded-2xl text-sm font-semibold text-gray-600 border-2 border-gray-200 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Ignorer pour le moment
                </motion.button>
              )}
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ========== SETTING TOGGLE COMPONENT ==========
interface SettingToggleProps {
  icon: any;
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

function SettingToggle({ icon: Icon, label, value, onChange }: SettingToggleProps) {
  return (
    <motion.div
      className="flex items-center justify-between p-4 rounded-2xl bg-white border-2 border-gray-200"
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
          <Icon className="w-5 h-5" style={{ color: '#C46210' }} />
        </div>
        <p className="font-semibold text-gray-900 text-sm">{label}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`w-12 h-7 rounded-full transition-colors ${
          value ? 'bg-[#C46210]' : 'bg-gray-300'
        }`}
      >
        <motion.div
          className="w-5 h-5 bg-white rounded-full shadow-md"
          animate={{ x: value ? 26 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
    </motion.div>
  );
}

// ========== SUB TOGGLE COMPONENT ==========
interface SubToggleProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

function SubToggle({ label, value, onChange }: SubToggleProps) {
  return (
    <motion.div
      className="flex items-center justify-between p-3 rounded-xl bg-white border border-gray-200"
      whileHover={{ scale: 1.01 }}
    >
      <p className="text-sm text-gray-700">{label}</p>
      <button
        onClick={() => onChange(!value)}
        className={`w-10 h-6 rounded-full transition-colors ${
          value ? 'bg-[#C46210]' : 'bg-gray-300'
        }`}
      >
        <motion.div
          className="w-4 h-4 bg-white rounded-full shadow-md"
          animate={{ x: value ? 22 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
    </motion.div>
  );
}