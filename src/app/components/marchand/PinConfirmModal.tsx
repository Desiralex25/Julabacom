import { motion } from 'motion/react';
import { X, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

interface PinConfirmModalProps {
  onClose: () => void;
  onConfirm: () => void;
  speak: (text: string) => void;
  title: string;
  message: string;
}

export function PinConfirmModal({ onClose, onConfirm, speak, title, message }: PinConfirmModalProps) {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState(false);

  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`pin-${index + 1}`);
      nextInput?.focus();
    }

    // Auto-validate when 4 digits entered
    if (index === 3 && value && newPin.every(d => d !== '')) {
      handleValidate(newPin.join(''));
    }
  };

  const handleValidate = (pinCode: string) => {
    // TODO: Vérifier le vrai PIN utilisateur
    const correctPin = '1234'; // Mock - À remplacer par le vrai PIN
    
    if (pinCode === correctPin) {
      speak('Code correct. Suppression confirmée');
      onConfirm();
    } else {
      setError(true);
      speak('Code incorrect');
      setPin(['', '', '', '']);
      setTimeout(() => setError(false), 2000);
      document.getElementById('pin-0')?.focus();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl w-full max-w-sm p-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600">{message}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* PIN Input */}
        <div className="space-y-4">
          <p className="text-sm text-center text-gray-600 font-semibold">
            Entrez votre code de sécurité
          </p>
          
          <div className="flex items-center justify-center gap-3">
            {pin.map((digit, index) => (
              <motion.input
                key={index}
                id={`pin-${index}`}
                type="tel"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handlePinChange(index, e.target.value)}
                onFocus={(e) => e.target.select()}
                className={`w-14 h-14 text-center text-2xl font-bold rounded-xl border-2 transition-all ${
                  error
                    ? 'border-red-500 bg-red-50'
                    : digit
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-300 bg-white'
                }`}
                animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
                transition={{ duration: 0.4 }}
              />
            ))}
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-600 text-center font-semibold"
            >
              ❌ Code incorrect. Réessayez.
            </motion.p>
          )}

          <p className="text-xs text-center text-gray-500">
            Cette action est irréversible
          </p>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <motion.button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-bold bg-gray-100 text-gray-900"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Annuler
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
