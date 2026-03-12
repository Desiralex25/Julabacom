/**
 * Utilitaire d'environnement
 * Fournit une constante IS_DEV sécurisée qui ne crash pas si import.meta.env n'est pas disponible
 */

// Vérifier si nous sommes en mode développement
export const IS_DEV = (() => {
  try {
    // Essayer d'accéder à import.meta.env.DEV
    return import.meta.env?.DEV ?? false;
  } catch (e) {
    // Si ça échoue, on considère qu'on est en production
    return false;
  }
})();
