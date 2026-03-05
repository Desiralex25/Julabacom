/**
 * ═══════════════════════════════════════════════════════════════════
 * JÙLABA — Entry Gate (Point d'entrée unique)
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Gère le flow strict :
 * 1. Splash (Welcome)
 * 2. Onboarding (4 écrans)
 * 3. Login (LoginPassword)
 * 4. Application principale
 * 
 * AUCUNE redirection en cascade - Logique centralisée unique
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useUser } from '../../contexts/UserContext';
import { Welcome } from './Welcome';
import { OnboardingSlides } from './OnboardingSlides';
import { LoginPassword } from './LoginPassword';

// Clés localStorage
const STORAGE_KEYS = {
  SEEN_SPLASH: 'julaba_seen_splash',
  COMPLETED_ONBOARDING: 'julaba_completed_onboarding',
};

export function EntryGate() {
  const navigate = useNavigate();
  const { user } = useUser();
  
  const [hasSeenSplash, setHasSeenSplash] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.SEEN_SPLASH) === 'true';
  });
  
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.COMPLETED_ONBOARDING) === 'true';
  });

  // Callback pour marquer le splash comme vu
  const handleSplashComplete = () => {
    localStorage.setItem(STORAGE_KEYS.SEEN_SPLASH, 'true');
    setHasSeenSplash(true);
  };

  // Callback pour marquer l'onboarding comme complété
  const handleOnboardingComplete = () => {
    localStorage.setItem(STORAGE_KEYS.COMPLETED_ONBOARDING, 'true');
    setHasCompletedOnboarding(true);
  };

  // Si utilisateur authentifié, rediriger vers son interface
  useEffect(() => {
    if (user && hasSeenSplash && hasCompletedOnboarding) {
      // Redirection basée sur le rôle
      switch (user.role) {
        case 'marchand':
          navigate('/marchand', { replace: true });
          break;
        case 'producteur':
          navigate('/producteur', { replace: true });
          break;
        case 'cooperative':
          navigate('/cooperative', { replace: true });
          break;
        case 'institution':
          navigate('/institution', { replace: true });
          break;
        case 'identificateur':
          navigate('/identificateur', { replace: true });
          break;
        case 'super_admin':
        case 'admin':
        case 'superviseur':
        case 'analyste':
          navigate('/backoffice', { replace: true });
          break;
        default:
          // Si rôle inconnu, rester sur login
          break;
      }
    }
  }, [user, hasSeenSplash, hasCompletedOnboarding, navigate]);

  // ═══════════════════════════════════════════════════════════════════
  // LOGIQUE UNIQUE - PAS DE NAVIGATION EN CASCADE
  // ═══════════════════════════════════════════════════════════════════

  // 1️⃣ Splash non vu
  if (!hasSeenSplash) {
    return <Welcome onComplete={handleSplashComplete} />;
  }

  // 2️⃣ Onboarding non complété
  if (!hasCompletedOnboarding) {
    return <OnboardingSlides onComplete={handleOnboardingComplete} />;
  }

  // 3️⃣ Non authentifié
  if (!user) {
    return <LoginPassword />;
  }

  // 4️⃣ Authentifié - L'useEffect ci-dessus gère la redirection
  // Afficher un écran de chargement pendant la redirection
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white text-xl font-bold">Chargement...</p>
      </div>
    </div>
  );
}
