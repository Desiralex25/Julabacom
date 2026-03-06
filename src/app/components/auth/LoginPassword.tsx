// Page de connexion Jùlaba avec mot de passe et système "Mot de passe oublié"
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, ArrowRight, CheckCircle, Eye, EyeOff, X, AlertCircle } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useUser } from '../../contexts/UserContext';
import { useBackOfficeOptional } from '../../contexts/BackOfficeContext';
import { Button } from '../ui/button';
import { ProfileSwitcher } from '../dev/ProfileSwitcher';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { supabase } from '../../services/supabaseClient';

import logoJulabaBlanc from '/logo-julaba.svg';
const tantieSagesseImg = '/images/tantie-sagesse.svg';
const tantieImage = '/images/tantie-sagesse.png';
const newLogoImage = '/images/logo-julaba-blanc.svg';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-488793d3`;

// Compteur de tentatives de connexion (en mémoire)
const loginAttempts: Record<string, { count: number; lastAttempt: number }> = {};
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes en millisecondes

export function LoginPassword() {
  const navigate = useNavigate();
  const { setUser: setAppUser } = useApp();
  const { setUser: setUserProfile } = useUser();
  const backOfficeCtx = useBackOfficeOptional();
  const setBOUser = backOfficeCtx?.setBOUser ?? (() => {});
  
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [tantieSpeechText, setTantieSpeechText] = useState('Appuie sur moi pour me parler');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [showDevButton, setShowDevButton] = useState(false);

  const recognitionRef = useRef<any>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  // Charger les voix au démarrage
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        voicesRef.current = voices;
        setVoicesLoaded(true);
      }
    };

    loadVoices();
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
    setTantieSpeechText('...');
    
    if (!('speechSynthesis' in window)) {
      setTantieSpeechText(message);
      setTimeout(() => {
        setTantieSpeechText('Appuie sur moi pour me parler');
      }, message.length * 50);
      return;
    }
    
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      console.warn('Erreur lors de cancel:', e);
    }
    
    const speakTimeout = setTimeout(() => {
      try {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = 'fr-FR';
        utterance.rate = 0.9;
        utterance.volume = 1.0;
        utterance.pitch = 1.0;
        
        utteranceRef.current = utterance;
        
        const voices = voicesRef.current.length > 0 ? voicesRef.current : window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          const frenchVoice = voices.find(voice => voice.lang.startsWith('fr'));
          if (frenchVoice) {
            utterance.voice = frenchVoice;
          }
        }
        
        utterance.onstart = () => {
          setTantieSpeechText(message);
        };
        
        utterance.onend = () => {
          setTimeout(() => {
            setTantieSpeechText('Appuie sur moi pour me parler');
          }, 500);
          utteranceRef.current = null;
        };
        
        utterance.onerror = (event: any) => {
          if (event.error !== 'interrupted' && event.error !== 'canceled') {
            console.error('Erreur synthèse vocale:', event.error);
          }
          setTimeout(() => {
            setTantieSpeechText('Appuie sur moi pour me parler');
          }, 500);
          utteranceRef.current = null;
        };
        
        window.speechSynthesis.speak(utterance);
        
      } catch (e) {
        console.error('Erreur lors de speak():', e);
        setTantieSpeechText(message);
        setTimeout(() => {
          setTantieSpeechText('Appuie sur moi pour me parler');
        }, 2000);
      }
    }, 200);
    
    return () => clearTimeout(speakTimeout);
  };

  // Cleanup au démontage du composant
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignorer les erreurs
        }
      }
    };
  }, []);

  // Vérifier si le numéro est bloqué
  const isPhoneLocked = (phoneNum: string): boolean => {
    const attempt = loginAttempts[phoneNum];
    if (!attempt) return false;
    
    if (attempt.count >= MAX_ATTEMPTS) {
      const timeSinceLastAttempt = Date.now() - attempt.lastAttempt;
      if (timeSinceLastAttempt < LOCKOUT_DURATION) {
        return true;
      } else {
        // Réinitialiser après la période de blocage
        delete loginAttempts[phoneNum];
        return false;
      }
    }
    return false;
  };

  // Enregistrer une tentative de connexion échouée
  const recordFailedAttempt = (phoneNum: string) => {
    if (!loginAttempts[phoneNum]) {
      loginAttempts[phoneNum] = { count: 0, lastAttempt: Date.now() };
    }
    loginAttempts[phoneNum].count++;
    loginAttempts[phoneNum].lastAttempt = Date.now();
  };

  // Réinitialiser les tentatives après une connexion réussie
  const resetAttempts = (phoneNum: string) => {
    delete loginAttempts[phoneNum];
  };

  const handleLogin = async () => {
    if (phone.length !== 10) {
      setError('Le numéro doit contenir 10 chiffres');
      speakWithText('Le numéro doit contenir 10 chiffres');
      return;
    }

    if (!password) {
      setError('Entre ton mot de passe');
      speakWithText('Entre ton mot de passe');
      return;
    }

    // Vérifier si le compte est bloqué
    if (isPhoneLocked(phone)) {
      const remainingTime = Math.ceil((LOCKOUT_DURATION - (Date.now() - loginAttempts[phone].lastAttempt)) / 60000);
      setError(`Compte bloqué. Réessaye dans ${remainingTime} minutes ou contacte ton identificateur.`);
      speakWithText('Compte bloqué. Trop de tentatives échouées.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ phone, password })
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        recordFailedAttempt(phone);
        const attemptsLeft = MAX_ATTEMPTS - (loginAttempts[phone]?.count || 0);
        
        if (attemptsLeft > 0) {
          setError(`Identifiants incorrects. ${attemptsLeft} tentatives restantes.`);
          speakWithText('Identifiants incorrects');
        } else {
          setError('Compte bloqué. Contacte ton identificateur pour le débloquer.');
          speakWithText('Compte bloqué. Contacte ton identificateur.');
        }
        setIsLoading(false);
        return;
      }

      // Connexion réussie
      resetAttempts(phone);
      const user = result.user;
      
      // ✅ Vérifier si c'est un rôle Back-Office
      const boRoles = ['super_admin', 'admin_national', 'gestionnaire_zone', 'analyste'];
      const isBackOffice = boRoles.includes(user.role);
      
      if (isBackOffice) {
        // ✅ Définir l'utilisateur Back-Office
        setBOUser({
          id: user.id,
          nom: user.lastName,
          prenom: user.firstName,
          email: `${user.phone}@julaba.ci`, // Email temporaire basé sur le téléphone
          role: user.role,
          region: user.region,
          lastLogin: new Date().toISOString(),
          actif: true
        });
      } else {
        // Utilisateur terrain normal
        setAppUser(user);
        setUserProfile(user);
      }

      if (result.accessToken) {
        // Le SDK Supabase gère la persistance des tokens — pas de localStorage manuel
        await supabase.auth.setSession({
          access_token: result.accessToken,
          refresh_token: result.refreshToken || '',
        });
      }

      speakWithText(`Bienvenue ${user.firstName} ! Redirection en cours...`);

      setTimeout(() => {
        const roleRoutes: Record<string, string> = {
          'marchand': '/marchand',
          'producteur': '/producteur',
          'cooperative': '/cooperative',
          'institution': '/institution',
          'identificateur': '/identificateur',
          'consommateur': '/consommateur',
          'super_admin': '/backoffice/dashboard',
          'admin_national': '/backoffice/dashboard',
          'gestionnaire_zone': '/backoffice/dashboard',
          'analyste': '/backoffice/dashboard'
        };
        
        const route = roleRoutes[user.role] || '/marchand';
        navigate(route);
      }, 1500);
    } catch (err) {
      console.error('Error in handleLogin:', err);
      setError('Erreur de connexion');
      speakWithText('Erreur de connexion');
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (forgotPhone.length !== 10) {
      setForgotMessage('Le numéro doit contenir 10 chiffres');
      return;
    }

    setForgotLoading(true);
    setForgotMessage('');

    try {
      const response = await fetch(`${API_URL}/auth/check-phone-for-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ phone: forgotPhone })
      });

      const result = await response.json();

      if (result.exists) {
        setForgotMessage(result.message);
        speakWithText(result.message);
      } else {
        setForgotMessage('Ce numéro n\'est pas enregistré');
        speakWithText('Ce numéro n\'est pas enregistré');
      }
    } catch (err) {
      console.error('Error in handleForgotPassword:', err);
      setForgotMessage('Erreur lors de la vérification');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleTantieSagesse = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    speakWithText(`Ton numéro saisi est ${phone}`);
  };

  // Format phone number with spaces: "07 01 02 03 04"
  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const formatted = cleaned.match(/.{1,2}/g)?.join(' ') || cleaned;
    return formatted;
  };

  const handleLogoClick = () => {
    if (!import.meta.env.DEV) return; // Seulement en mode dev
    
    const newCount = logoClickCount + 1;
    setLogoClickCount(newCount);
    
    if (newCount >= 5) {
      setShowDevButton(true);
      setLogoClickCount(0);
    }
  };

  return (
    <div className="min-h-screen bg-[#C46210] flex flex-col items-center p-4 relative overflow-hidden">
      {import.meta.env.DEV && showDevButton && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <ProfileSwitcher />
        </motion.div>
      )}

      <div className="w-full max-w-md flex flex-col items-center flex-grow justify-center">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4"
        >
          <img 
            src={newLogoImage} 
            alt="JÙLABA" 
            className="h-20 w-auto mx-auto cursor-pointer"
            onClick={handleLogoClick}
          />
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-lg p-6 w-full"
        >
          {!showForgotPassword ? (
            // Login Form
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Connexion</h2>
              <p className="text-gray-600 mb-4">Entre tes identifiants</p>

              {/* Phone Input avec préfixe +225 */}
              <div className="relative mb-4">
                <div className="flex items-center h-14 border-2 border-gray-200 rounded-2xl overflow-hidden focus-within:border-[#C46210] transition-colors bg-white">
                  <span 
                    className="h-full flex items-center px-4 text-lg font-medium select-none text-white"
                    style={{ backgroundColor: '#C46210' }}
                  >
                    +225
                  </span>
                  
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

              {/* Password Input */}
              <div className="relative mb-2">
                <div className="flex items-center h-14 border-2 border-gray-200 rounded-2xl overflow-hidden focus-within:border-[#C46210] transition-colors bg-white">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    placeholder="Mot de passe"
                    className="flex-1 h-full px-4 text-lg outline-none border-none bg-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="pr-4 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <p className="text-xs text-gray-500 mb-4">
                Mot de passe créé lors de ton enrôlement
              </p>

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-4 p-3 rounded-2xl bg-red-50 border-2 border-red-200 flex items-start gap-2"
                >
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </motion.div>
              )}

              <Button
                onClick={handleLogin}
                disabled={isLoading || phone.length !== 10 || !password}
                className="w-full h-14 rounded-2xl text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#C46210' }}
              >
                {isLoading ? 'Connexion...' : 'Se connecter'}
                {!isLoading && <ArrowRight className="w-5 h-5 ml-2" />}
              </Button>

              {/* Lien Mot de passe oublié */}
              <button
                onClick={() => {
                  setShowForgotPassword(true);
                  setForgotPhone(phone);
                  setForgotMessage('');
                }}
                className="w-full mt-4 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
              >
                Mot de passe oublié ?
              </button>
            </div>
          ) : (
            // Forgot Password Form
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Mot de passe oublié</h2>
                <button
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotMessage('');
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              
              <p className="text-gray-600 mb-4">
                Entre ton numéro pour savoir qui contacter
              </p>

              {/* Phone Input */}
              <div className="relative mb-4">
                <div className="flex items-center h-14 border-2 border-gray-200 rounded-2xl overflow-hidden focus-within:border-[#C46210] transition-colors bg-white">
                  <span 
                    className="h-full flex items-center px-4 text-lg font-medium select-none text-white"
                    style={{ backgroundColor: '#C46210' }}
                  >
                    +225
                  </span>
                  
                  <input
                    type="tel"
                    value={formatPhoneNumber(forgotPhone)}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setForgotPhone(value);
                      setForgotMessage('');
                    }}
                    placeholder="07 01 02 03 04"
                    className="flex-1 h-full px-3 text-lg outline-none border-none bg-transparent"
                    inputMode="numeric"
                  />
                </div>
              </div>

              {forgotMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-4 p-4 rounded-2xl border-2 ${
                    forgotMessage.includes('Contacte') 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <p className={`text-sm font-bold ${
                    forgotMessage.includes('Contacte') 
                      ? 'text-blue-800' 
                      : 'text-red-800'
                  }`}>
                    {forgotMessage}
                  </p>
                </motion.div>
              )}

              <Button
                onClick={handleForgotPassword}
                disabled={forgotLoading || forgotPhone.length !== 10}
                className="w-full h-14 rounded-2xl text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#C46210' }}
              >
                {forgotLoading ? 'Vérification...' : 'Vérifier'}
              </Button>
            </div>
          )}
        </motion.div>

        {/* Help Text */}
        <p className="text-center text-white/90 mt-4 font-bold text-[15px]">
          Plateforme nationale d'inclusion économique des acteurs vivriers
        </p>

        {/* Tantie Sagesse */}
        <div className="flex flex-col items-center mt-10 mb-2">
          <motion.button
            onClick={handleTantieSagesse}
            className="relative flex items-center justify-center rounded-full transition-all"
            style={{ width: '90px', height: '90px' }}
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
                src={tantieImage}
                alt="Tantie Sagesse" 
                className="w-full h-full object-cover"
              />
            </motion.div>
          </motion.button>

          <motion.p
            className="text-center text-white font-medium text-xs px-4 max-w-xs mt-2"
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            {tantieSpeechText}
          </motion.p>
        </div>
      </div>

      {/* Link to onboarding */}
      <div className="w-full text-center py-6 mt-auto space-y-2">
        <button
          onClick={() => {
            localStorage.removeItem('julaba_completed_onboarding');
            window.location.href = '/';
          }}
          className="text-white text-sm font-medium hover:underline opacity-80 block mx-auto"
        >
          Revoir le tutoriel
        </button>
        {/* Lien de recuperation admin - visible uniquement sur /backoffice/login */}
        {window.location.pathname.includes('backoffice') && (
          <a
            href="/admin-recovery"
            className="text-white/60 text-xs hover:text-white/90 transition-colors block mx-auto"
          >
            Probleme de connexion admin ?
          </a>
        )}
      </div>
    </div>
  );
}