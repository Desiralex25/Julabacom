import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, ArrowRight, Code, CheckCircle } from 'lucide-react';
import { useApp, getMockUserByPhone, getAllMockUsers } from '../../contexts/AppContext';
import { useUser } from '../../contexts/UserContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ProfileSwitcher } from '../dev/ProfileSwitcher';
import logoOrange from 'figma:asset/d4e25a0b05d3b69e7e79f65efbd03a87d4b68385.png';
import logoTonDje from 'figma:asset/c7cc70789b435fa844a3d9eb596e29ecf3d4f80c.png';
import logoJulaba from 'figma:asset/54872e2911223a687a64213d3c9b5c2dc0d3d160.png';
import tantieSagesseImg from 'figma:asset/41b92fac963891d143c08b39664bce7342b10a05.png';

export function Login() {
  const navigate = useNavigate();
  const { setUser: setAppUser } = useApp();
  const { setUser: setUserProfile } = useUser();
  const [phone, setPhone] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '']); // Changed to 4 digits
  const [error, setError] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [tantieSpeechText, setTantieSpeechText] = useState('Appuie sur moi pour me parler');
  const recognitionRef = useRef<any>(null);
  const hasSpokenWelcome = useRef(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  // Default OTP code for demo
  const DEFAULT_OTP = '1234'; // Changed to 4 digits

  // Charger les voix au démarrage
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        voicesRef.current = voices;
        setVoicesLoaded(true);
        console.log('✅ Voix chargées:', voices.length);
        
        // Log des voix françaises disponibles
        const frenchVoices = voices.filter(v => v.lang.startsWith('fr'));
        console.log('🇫🇷 Voix françaises:', frenchVoices.length, frenchVoices.map(v => v.name));
      }
    };

    // Charger immédiatement
    loadVoices();

    // Écouter l'événement de chargement des voix
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Fonction locale pour parler ET afficher le texte
  const speakWithText = (message: string) => {
    console.log('🔊 Tentative de parole:', message);
    
    // Mise à jour du texte immédiatement
    setTantieSpeechText(message);
    
    // Vérifier si la synthèse vocale est disponible
    if (!('speechSynthesis' in window)) {
      console.warn('❌ speechSynthesis non disponible');
      setTimeout(() => {
        setTantieSpeechText('Appuie sur moi pour me parler');
      }, message.length * 50);
      return;
    }
    
    // Annuler toute synthèse en cours
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      console.warn('⚠️ Erreur lors de cancel():', e);
    }
    
    // Attendre que les voix soient chargées ET un délai pour éviter les conflits
    const speakTimeout = setTimeout(() => {
      try {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = 'fr-FR';
        utterance.rate = 0.9;
        utterance.volume = 1.0;
        utterance.pitch = 1.0;
        
        // Sauvegarder la référence
        utteranceRef.current = utterance;
        
        // Utiliser les voix en cache ou les recharger
        const voices = voicesRef.current.length > 0 ? voicesRef.current : window.speechSynthesis.getVoices();
        console.log('🎤 Voix disponibles:', voices.length);
        
        if (voices.length === 0) {
          console.warn('️ Aucune voix disponible, tentative sans voix spécifique');
        } else {
          const frenchVoice = voices.find(voice => voice.lang.startsWith('fr'));
          if (frenchVoice) {
            utterance.voice = frenchVoice;
            console.log('✅ Voix française sélectionnée:', frenchVoice.name);
          } else {
            console.warn('⚠️ Aucune voix française, utilisation voix par défaut');
          }
        }
        
        // Quand la voix termine
        utterance.onend = () => {
          console.log('✅ Parole terminée');
          setTimeout(() => {
            setTantieSpeechText('Appuie sur moi pour me parler');
          }, 500);
          utteranceRef.current = null;
        };
        
        // Gestion des erreurs améliorée
        utterance.onerror = (event: any) => {
          // Ne logger que les vraies erreurs, pas les interruptions normales
          if (event.error !== 'interrupted' && event.error !== 'canceled') {
            console.error('❌ Erreur synthèse vocale:', event.error);
            
            // Afficher un message d'erreur convivial pour les vraies erreurs
            let errorMsg = 'Erreur vocale';
            if (event.error === 'not-allowed') {
              errorMsg = 'Autorisation vocale requise';
            } else if (event.error === 'network') {
              errorMsg = 'Erreur réseau';
            }
            
            console.warn('💬 Message erreur:', errorMsg);
          }
          
          setTimeout(() => {
            setTantieSpeechText('Appuie sur moi pour me parler');
          }, 500);
          utteranceRef.current = null;
        };
        
        // Démarrer la voix
        utterance.onstart = () => {
          console.log('🎙️ Parole démarrée');
        };
        
        // Lancer la synthèse
        window.speechSynthesis.speak(utterance);
        console.log('✅ speak() appelé avec succès');
        
      } catch (e) {
        console.error('❌ Erreur lors de speak():', e);
        setTimeout(() => {
          setTantieSpeechText('Appuie sur moi pour me parler');
        }, 2000);
      }
    }, 200); // Délai de 200ms pour éviter les conflits
    
    // Nettoyer le timeout si le composant est démonté
    return () => clearTimeout(speakTimeout);
  };

  // Cleanup au démontage du composant
  useEffect(() => {
    return () => {
      // Arrêter toute synthèse vocale en cours
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      // Arrêter la reconnaissance vocale
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignorer les erreurs
        }
      }
    };
  }, []);

  // Welcome message on mount (optionnel - supprimé pour éviter autoplay)
  // useEffect(() => {
  //   if (!hasSpokenWelcome.current) {
  //     hasSpokenWelcome.current = true;
  //     setTimeout(() => {
  //       speakWithText('Bienvenue, appuie sur Tantie Sagesse et dis-moi ton numéro pour que je t\'aide à le saisir.');
  //     }, 500);
  //   }
  // }, []);

  // Announce OTP when switching to OTP screen
  useEffect(() => {
    if (showOTP) {
      speakWithText('Ton code OTP a été envoyé avec succès');
    }
  }, [showOTP]);

  const handlePhoneSubmit = () => {
    if (phone.length !== 10) {
      setError('Le numéro doit contenir 10 chiffres');
      speakWithText('Le numéro doit contenir 10 chiffres');
      return;
    }

    const user = getMockUserByPhone(phone);
    
    if (user) {
      speakWithText('Un code de vérification a été envoyé par SMS');
      setShowOTP(true);
      setError('');
    } else {
      setError('Ton numéro n\'est pas encore enregistré sur JULABA');
      speakWithText('Ton numéro n\'est pas encore enregistré sur JULABA');
    }
  };

  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOTP = [...otp];
    newOTP[index] = value;
    setOtp(newOTP);

    // Auto focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOTPSubmit = () => {
    const otpCode = otp.join('');
    
    if (otpCode.length !== 4) {
      setError('Entre le code complet');
      speakWithText('Entre le code complet');
      return;
    }

    // Simulate OTP validation (accept any 6 digits for demo)
    const user = getMockUserByPhone(phone);
    
    if (user) {
      setAppUser(user);
      setUserProfile(user);
      speakWithText(`Bienvenue ${user.firstName}. Ton djè est calé`);
      
      // Navigate based on role
      setTimeout(() => {
        navigate(`/${user.role}`);
      }, 500);
    }
  };

  const handleMicClick = () => {
    if (!showOTP) {
      speakWithText(`Votre numéro saisi est ${phone}`);
    } else {
      speakWithText(`Le code entré est ${otp.join('')}`);
    }
  };

  const startListening = () => {
    if (!recognitionRef.current) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        speakWithText('Désolé, ton navigateur ne supporte pas la reconnaissance vocale');
        return;
      }
      
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'fr-FR';
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
    }

    speakWithText('C\'est bon je t\'écoute, dis-moi ton numéro lentement');

    recognitionRef.current.onstart = () => {
      setIsListening(true);
    };

    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase().replace(/\s/g, '');
      
      if (showOTP) {
        // Extract digits for OTP
        const digits = transcript.match(/\d/g);
        if (digits && digits.length >= 4) {
          const newOtp = digits.slice(0, 4);
          setOtp(newOtp);
        }
      } else {
        // Extract digits for phone number (progressive)
        const digits = transcript.match(/\d/g);
        if (digits) {
          const phoneNumber = digits.join('').slice(0, 10);
          setPhone(phoneNumber);
          
          // Auto submit when 10 digits reached
          if (phoneNumber.length === 10) {
            setTimeout(() => {
              const user = getMockUserByPhone(phoneNumber);
              if (user) {
                speakWithText('Un code de vérification a été envoyé par SMS');
                setShowOTP(true);
                setError('');
              } else {
                setError('Ton numéro n\'est pas encore enregistré sur JULABA');
                speakWithText('Ton numéro n\'est pas encore enregistré sur JULABA');
              }
            }, 500);
          }
        }
      }
    };

    recognitionRef.current.onerror = () => {
      setIsListening(false);
      speakWithText('Je n\'entends rien, tu peux aussi taper ton numéro directement');
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    try {
      recognitionRef.current.start();
    } catch (e) {
      setIsListening(false);
      speakWithText('Je n\'entends rien, tu peux aussi taper ton numéro directement');
    }
  };

  const handleTantieSagesse = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    if (!showOTP) {
      startListening();
    } else {
      // Read OTP code and offer dictation
      speakWithText(`Ton code OTP est ${DEFAULT_OTP.split('').join(' ')}. Tu peux aussi me dicter ton code si tu veux`);
      setTimeout(() => {
        startListening();
      }, 7000); // Wait for speech to finish
    }
  };

  // Format phone number with spaces: "07 01 02 03 04"
  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const formatted = cleaned.match(/.{1,2}/g)?.join(' ') || cleaned;
    return formatted;
  };

  return (
    <div className="min-h-screen bg-[#C46210] flex flex-col items-center justify-start pt-32 p-6 relative">
      {/* Dev Mode Toggle */}
      <ProfileSwitcher />

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
            className="h-20 w-auto mx-auto"
          />
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-lg p-8"
        >
          {/* Logo "Ton djè est calé" */}
          <div className="flex justify-center mb-6">
            
          </div>

          {!showOTP ? (
            // Phone Input
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Connexion</h2>
              <p className="text-gray-600 mb-4">Entre ton numéro de téléphone</p>

              {/* Phone Input avec préfixe +225 */}
              <div className="relative mb-2">
                <div className="flex items-center h-14 border-2 border-gray-200 rounded-2xl overflow-hidden focus-within:border-[#C46210] transition-colors bg-white">
                  {/* Préfixe +225 fixe avec fond orange et texte blanc */}
                  <span 
                    className="h-full flex items-center px-4 text-lg font-medium select-none text-white"
                    style={{ backgroundColor: '#C46210' }}
                  >
                    +225
                  </span>
                  
                  {/* Input du numéro */}
                  <input
                    type="tel"
                    value={formatPhoneNumber(phone)}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setPhone(value);
                      setError('');
                    }}
                    placeholder="07 01 02 03 04"
                    className="flex-1 h-full px-3 text-lg outline-none border-none bg-transparent"
                    inputMode="numeric"
                  />
                  
                  {/* Icône de validation verte */}
                  {phone.length === 10 && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className="pr-3"
                    >
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Message d'aide OTP */}
              <p className="text-xs text-gray-500 mb-4">
                Tu recevras un code à 4 chiffres
              </p>

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
                onClick={handlePhoneSubmit}
                className="w-full h-14 rounded-2xl text-lg font-semibold"
                style={{ backgroundColor: '#C46210' }}
              >
                Continuer
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              {error && error.includes('pas encore enregistré') && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 p-4 rounded-2xl bg-amber-50 border-2 border-amber-200"
                >
                  <p className="text-sm font-bold text-amber-800 text-center">
                    Ce numéro n'est pas encore enregistré sur JULABA.
                  </p>
                  <p className="text-xs text-amber-700 text-center mt-1">
                    Seul un agent identificateur ou Administrateur Système peut créer votre compte. Contactez votre agent JÙLABA.
                  </p>
                </motion.div>
              )}
            </div>
          ) : (
            // OTP Input
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Code de vérification</h2>
              <p className="text-gray-600 mb-6">Entre le code reçu par SMS</p>

              <div className="flex gap-2 mb-4">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="tel"
                    value={digit}
                    onChange={(e) => handleOTPChange(index, e.target.value)}
                    className="w-full h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-2xl focus:border-[#C46210] focus:outline-none transition-colors"
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
                style={{ backgroundColor: '#C46210' }}
              >
                Valider
              </Button>

              <button
                onClick={() => setShowOTP(false)}
                className="w-full mt-4 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Modifier le numéro
              </button>
            </div>
          )}
        </motion.div>

        {/* Help Text */}
        <p className="text-center text-white/90 mt-6 font-bold text-[20px]">
          Plateforme nationale d'inclusion économique des acteurs vivriers
        </p>
      </div>

      {/* Link to onboarding - Fixed at bottom */}
      <div className="absolute bottom-6 text-center w-full left-0 px-6">
        <button
          onClick={() => {
            localStorage.removeItem('julaba_skip_onboarding');
            navigate('/onboarding');
          }}
          className="text-white text-sm font-medium hover:underline"
        >
          Revoir le tutoriel
        </button>
      </div>

      {/* Tantie Sagesse FAB */}
      <motion.button
        onClick={handleTantieSagesse}
        className="fixed left-1/2 -translate-x-1/2 flex items-center justify-center rounded-full transition-all"
        style={{ 
          bottom: '140px',
          width: '120px',
          height: '120px',
        }}
        animate={{ 
          y: [0, -8, 0],
          scale: [1, 1.05, 1]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {/* Permanent subtle pulse */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: '#C46210' }}
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.3, 0, 0.3]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Strong pulse when listening */}
        <AnimatePresence>
          {isListening && (
            <>
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: '#C46210' }}
                initial={{ scale: 1, opacity: 0.6 }}
                animate={{ scale: 2.5, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: '#C46210' }}
                initial={{ scale: 1, opacity: 0.6 }}
                animate={{ scale: 3, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
              />
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: '#C46210' }}
                initial={{ scale: 1, opacity: 0.6 }}
                animate={{ scale: 3.5, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
              />
            </>
          )}
        </AnimatePresence>

        <motion.div
          animate={isListening ? { 
            scale: [1, 1.3, 1],
            rotate: [0, 5, -5, 0]
          } : { 
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: isListening ? 0.6 : 2,
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
        style={{ bottom: '110px' }}
        animate={{ opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        {tantieSpeechText}
      </motion.p>
    </div>
  );
}