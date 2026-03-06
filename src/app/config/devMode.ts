/**
 * ═══════════════════════════════════════════════════════════════════
 * JÙLABA — Configuration Mode Développement
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Active le mode dev pour naviguer sans données Supabase
 * 
 * ⚠️ ATTENTION : Mettre à false en production
 */

// ┌─────────────────────────────────────────────────────────────────┐
// │  🔧 TOGGLE MODE DEV                                             │
// │                                                                  │
// │  true  = Mode dev (navigation sans API, données mock)           │
// │  false = Mode production (authentification, Supabase actif)     │
// └─────────────────────────────────────────────────────────────────┘

export const DEV_MODE = false;

// Configuration du mode dev
export const DEV_CONFIG = {
  // Désactiver tous les appels API
  skipApiCalls: true,
  
  // Désactiver le chargement automatique des données
  skipAutoLoad: true,
  
  // Désactiver la synchronisation temps réel
  skipRealtime: true,
  
  // Désactiver les notifications
  skipNotifications: true,
  
  // Afficher le badge "MODE DEV"
  showDevBadge: true,
  
  // Logs détaillés dans la console
  verboseLogs: true,
};

// Helper pour logger en mode dev
export const devLog = (context: string, message: string, data?: any) => {
  if (DEV_MODE && DEV_CONFIG.verboseLogs) {
    console.log(`[DEV MODE - ${context}]`, message, data || '');
  }
};