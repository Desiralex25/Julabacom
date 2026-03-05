import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ArrowLeft, User, Phone, MapPin, Briefcase } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useUser } from '../../contexts/UserContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
const logoJulaba = '/images/logo-julaba.svg';
const tantieSagesseImg = '/images/tantie-sagesse.svg';

const ROLE_COLORS = {
  marchand: '#C46210',
  producteur: '#00563B',
  cooperative: '#2072AF',
  institution: '#702963',
  identificateur: '#9F8170',
};

const ROLE_LABELS = {
  marchand: 'Marchand',
  producteur: 'Producteur',
  cooperative: 'Coopérative',
  institution: 'Institution',
  identificateur: 'Identificateur',
};

export function Inscription() {
  const navigate = useNavigate();
  const { setUser: setAppUser } = useApp();
  const { setUser: setUserProfile } = useUser();
  
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<'marchand' | 'producteur' | 'cooperative' | 'institution' | 'identificateur' | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    city: '',
    commune: '',
    market: '',
  });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [securityCode, setSecurityCode] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [tantieSpeechText, setTantieSpeechText] = useState('Appuie sur moi pour me parler');
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Fonction locale pour parler ET afficher le texte
  const speakWithText = (message: string) => {
    setTantieSpeechText(message);
    
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    
    if ('speechSynthesis' in window) {
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = 'fr-FR';
        utterance.rate = 0.9;
        utterance.volume = 1.0;
        utterance.pitch = 1.0;
        
        utteranceRef.current = utterance;
        
        const voices = window.speechSynthesis.getVoices();
        const frenchVoice = voices.find(voice => voice.lang.startsWith('fr'));
        if (frenchVoice) {
          utterance.voice = frenchVoice;
        }
        
        utterance.onend = () => {
          setTimeout(() => {
            setTantieSpeechText('Appuie sur moi pour me parler');
          }, 500);
          utteranceRef.current = null;
        };
        
        utterance.onerror = (event: any) => {
          // Ne logger que les vraies erreurs, pas les interruptions normales
          if (event.error !== 'interrupted' && event.error !== 'canceled') {
            console.warn('Erreur synthèse vocale:', event.error);
          }
          setTimeout(() => {
            setTantieSpeechText('Appuie sur moi pour me parler');
          }, 500);
          utteranceRef.current = null;
        };
        
        try {
          window.speechSynthesis.speak(utterance);
        } catch (e) {
          console.warn('Erreur synthèse vocale:', e);
          setTimeout(() => {
            setTantieSpeechText('Appuie sur moi pour me parler');
          }, 2000);
        }
      }, 100);
    } else {
      setTimeout(() => {
        setTantieSpeechText('Appuie sur moi pour me parler');
      }, message.length * 50);
    }
  };

  // Cleanup au démontage
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleRoleSelect = (role: 'marchand' | 'producteur' | 'cooperative' | 'institution' | 'identificateur') => {
    setSelectedRole(role);
    speakWithText(`Tu as choisi ${ROLE_LABELS[role]}. Continue pour remplir tes informations`);
    setTimeout(() => setStep(2), 300);
  };

  const handleInfoSubmit = () => {
    if (!formData.firstName || !formData.lastName || !formData.phone) {
      setError('Remplis tous les champs obligatoires');
      speakWithText('Remplis tous les champs obligatoires');
      return;
    }

    if (formData.phone.length !== 10) {
      setError('Le numéro doit contenir 10 chiffres');
      speakWithText('Le numéro doit contenir 10 chiffres');
      return;
    }

    // Vérifier que le marché est rempli pour marchand et identificateur
    if ((selectedRole === 'marchand' || selectedRole === 'identificateur') && !formData.market) {
      setError('Le marché est obligatoire pour ce profil');
      speakWithText('Le marché est obligatoire pour ce profil');
      return;
    }

    speakWithText('Un code de vérification a été envoyé par SMS');
    setError('');
    setStep(3);
  };

  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOTP = [...otp];
    newOTP[index] = value;
    setOtp(newOTP);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOTPSubmit = () => {
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      setError('Entre le code complet');
      speakWithText('Entre le code complet');
      return;
    }

    speakWithText('Code vérifié. Maintenant crée ton code de sécurité à 4 chiffres');
    setError('');
    setStep(4);
  };

  const handleSecurityCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newCode = [...securityCode];
    newCode[index] = value;
    setSecurityCode(newCode);

    if (value && index < 3) {
      const nextInput = document.getElementById(`security-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleFinalSubmit = () => {
    const code = securityCode.join('');
    
    if (code.length !== 4) {
      setError('Entre un code à 4 chiffres');
      speakWithText('Entre un code à 4 chiffres');
      return;
    }

    // Créer le nouvel utilisateur avec toutes les données
    const newUser = {
      id: `user-${Date.now()}`,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      role: selectedRole!,
      city: formData.city || 'Abidjan',
      commune: formData.commune || '',
      market: formData.market || '',
      securityCode: code,
      balance: 0,
      createdAt: new Date().toISOString(),
    };

    // Sauvegarder dans les contextes
    setAppUser(newUser);
    setUserProfile(newUser);

    speakWithText(`Bienvenue ${formData.firstName}. Ton compte est créé. Ton djè est calé`);
    
    // Naviguer vers le dashboard du rôle sélectionné
    setTimeout(() => {
      navigate(`/${selectedRole}`);
    }, 1500);
  };

  const currentColor = selectedRole ? ROLE_COLORS[selectedRole] : '#C46210';

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-16 p-6 relative" style={{ backgroundColor: currentColor }}>
      {/* Header avec retour */}
      <div className="w-full max-w-md mb-6">
        <button
          onClick={() => {
            if (step > 1) {
              setStep(step - 1);
            } else {
              navigate('/');
            }
          }}
          className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Retour</span>
        </button>
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <img 
            src={logoJulaba} 
            alt="JULABA" 
            className="h-16 w-auto mx-auto"
          />
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl shadow-lg p-8"
        >
          <AnimatePresence mode="wait">
            {/* Step 1: Sélection du rôle */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Créer mon compte</h2>
                <p className="text-gray-600 mb-6">Choisis ton profil</p>

                <div className="space-y-3">
                  {Object.entries(ROLE_LABELS).map(([role, label]) => (
                    <button
                      key={role}
                      onClick={() => handleRoleSelect(role as any)}
                      className="w-full p-4 rounded-2xl border-2 border-gray-200 hover:border-gray-300 transition-all text-left flex items-center justify-between group"
                    >
                      <span className="font-semibold text-gray-900">{label}</span>
                      <div
                        className="w-6 h-6 rounded-full transition-transform group-hover:scale-110"
                        style={{ backgroundColor: ROLE_COLORS[role as keyof typeof ROLE_COLORS] }}
                      />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Informations personnelles */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Tes informations</h2>
                <p className="text-gray-600 mb-6">Remplis tes informations personnelles</p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prénom *
                    </label>
                    <Input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="Konan"
                      className="text-lg h-12 rounded-2xl"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom *
                    </label>
                    <Input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Kouassi"
                      className="text-lg h-12 rounded-2xl"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone *
                    </label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setFormData({ ...formData, phone: value });
                      }}
                      placeholder="0701020304"
                      className="text-lg h-12 rounded-2xl"
                      inputMode="numeric"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ville
                    </label>
                    <Input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Abidjan"
                      className="text-lg h-12 rounded-2xl"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Commune
                    </label>
                    <Input
                      type="text"
                      value={formData.commune}
                      onChange={(e) => setFormData({ ...formData, commune: e.target.value })}
                      placeholder="Yopougon"
                      className="text-lg h-12 rounded-2xl"
                    />
                  </div>

                  {(selectedRole === 'marchand' || selectedRole === 'identificateur') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Marché *
                      </label>
                      <Input
                        type="text"
                        value={formData.market}
                        onChange={(e) => setFormData({ ...formData, market: e.target.value })}
                        placeholder="Marché de Yopougon"
                        className="text-lg h-12 rounded-2xl"
                      />
                    </div>
                  )}
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-500 text-sm mt-4"
                  >
                    {error}
                  </motion.p>
                )}

                <Button
                  onClick={handleInfoSubmit}
                  className="w-full h-14 rounded-2xl text-lg font-semibold mt-6"
                  style={{ backgroundColor: currentColor }}
                >
                  Continuer
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            )}

            {/* Step 3: Code OTP */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Code de vérification</h2>
                <p className="text-gray-600 mb-6">Entre le code reçu par SMS au {formData.phone}</p>

                <div className="flex gap-2 mb-4">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="tel"
                      value={digit}
                      onChange={(e) => handleOTPChange(index, e.target.value)}
                      className="w-full h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-2xl focus:outline-none transition-colors"
                      style={{ borderColor: digit ? currentColor : undefined }}
                      maxLength={1}
                      inputMode="numeric"
                    />
                  ))}
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-500 text-sm mb-4"
                  >
                    {error}
                  </motion.p>
                )}

                <Button
                  onClick={handleOTPSubmit}
                  className="w-full h-14 rounded-2xl text-lg font-semibold"
                  style={{ backgroundColor: currentColor }}
                >
                  Valider
                </Button>
              </motion.div>
            )}

            {/* Step 4: Code de sécurité */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Code de sécurité</h2>
                <p className="text-gray-600 mb-6">Crée un code à 4 chiffres pour sécuriser ton compte</p>

                <div className="flex gap-3 mb-4 justify-center">
                  {securityCode.map((digit, index) => (
                    <input
                      key={index}
                      id={`security-${index}`}
                      type="tel"
                      value={digit}
                      onChange={(e) => handleSecurityCodeChange(index, e.target.value)}
                      className="w-16 h-16 text-center text-2xl font-bold border-2 border-gray-200 rounded-2xl focus:outline-none transition-colors"
                      style={{ borderColor: digit ? currentColor : undefined }}
                      maxLength={1}
                      inputMode="numeric"
                    />
                  ))}
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-500 text-sm mb-4"
                  >
                    {error}
                  </motion.p>
                )}

                <Button
                  onClick={handleFinalSubmit}
                  className="w-full h-14 rounded-2xl text-lg font-semibold mt-6"
                  style={{ backgroundColor: currentColor }}
                >
                  Créer mon compte
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Progress indicator */}
        <div className="flex justify-center gap-2 mt-6">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className="h-2 rounded-full transition-all"
              style={{
                width: step === s ? '32px' : '8px',
                backgroundColor: step >= s ? 'white' : 'rgba(255, 255, 255, 0.3)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Tantie Sagesse FAB */}
      <motion.button
        onClick={() => speakWithText('Je suis là pour t\'aider. Continue à remplir le formulaire')}
        className="fixed left-1/2 -translate-x-1/2 flex items-center justify-center rounded-full transition-all"
        style={{ 
          bottom: '140px',
          width: '100px',
          height: '100px',
        }}
        animate={{ 
          y: [0, -6, 0],
          scale: [1, 1.03, 1]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: currentColor }}
          animate={{ 
            scale: [1, 1.4, 1],
            opacity: [0.3, 0, 0.3]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative z-10 w-full h-full rounded-full overflow-hidden"
        >
          <img 
            src={tantieSagesseImg} 
            alt="Tantie Sagesse" 
            className="w-full h-full object-cover"
          />
        </motion.div>
      </motion.button>

      {/* Texte dynamique sous Tantie Sagesse */}
      <motion.p
        className="fixed left-1/2 -translate-x-1/2 text-center text-white font-medium text-xs px-4 max-w-xs whitespace-nowrap"
        style={{ bottom: '115px' }}
        animate={{ opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        {tantieSpeechText}
      </motion.p>
    </div>
  );
}