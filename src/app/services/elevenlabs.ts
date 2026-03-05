/**
 * Service ElevenLabs pour Tantie Sagesse
 * Gère la synthèse vocale via l'API ElevenLabs avec fallback vers Web Speech API
 */

import { projectId, publicAnonKey } from '/utils/supabase/info';

interface TTSResponse {
  success: boolean;
  audio?: string;
  contentType?: string;
  voiceId?: string;
  error?: string;
  details?: string;
}

interface Voice {
  voice_id: string;
  name: string;
  preview_url?: string;
  category?: string;
}

interface VoicesResponse {
  success: boolean;
  voices?: Voice[];
  error?: string;
}

// Cache audio pour éviter les appels répétés
const audioCache = new Map<string, string>();

// File d'attente pour gérer les appels séquentiels
let currentAudioElement: HTMLAudioElement | null = null;

/**
 * Génère et joue l'audio via ElevenLabs
 */
export async function speak(
  text: string,
  voiceId?: string,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (error: string) => void
): Promise<boolean> {
  try {
    // Vérifier le cache
    const cacheKey = `${voiceId || 'default'}_${text}`;
    let base64Audio = audioCache.get(cacheKey);

    if (!base64Audio) {
      // Appel au backend pour générer l'audio
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-488793d3/tts/speak`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ text, voiceId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('ElevenLabs TTS error:', errorData);
        throw new Error(errorData.error || 'Erreur de synthèse vocale');
      }

      const data: TTSResponse = await response.json();

      if (!data.success || !data.audio) {
        throw new Error(data.error || 'Pas de données audio reçues');
      }

      base64Audio = data.audio;

      // Mettre en cache (limiter à 50 entrées)
      if (audioCache.size > 50) {
        const firstKey = audioCache.keys().next().value;
        audioCache.delete(firstKey);
      }
      audioCache.set(cacheKey, base64Audio);
    }

    // Arrêter l'audio en cours si existant
    if (currentAudioElement) {
      currentAudioElement.pause();
      currentAudioElement = null;
    }

    // Créer et jouer le nouvel audio
    const audio = new Audio(`data:audio/mpeg;base64,${base64Audio}`);
    currentAudioElement = audio;

    audio.onplay = () => {
      if (onStart) onStart();
    };

    audio.onended = () => {
      currentAudioElement = null;
      if (onEnd) onEnd();
    };

    audio.onerror = () => {
      currentAudioElement = null;
      const error = 'Erreur lors de la lecture audio';
      console.error(error);
      if (onError) onError(error);
    };

    await audio.play();
    return true;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error('Speak error:', errorMessage);
    if (onError) onError(errorMessage);
    return false;
  }
}

/**
 * Fallback vers Web Speech API (navigateur natif)
 */
export function speakWithWebSpeech(
  text: string,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (error: string) => void
): boolean {
  if (!('speechSynthesis' in window)) {
    console.error('Web Speech API non disponible');
    if (onError) onError('Synthèse vocale non disponible sur cet appareil');
    return false;
  }

  try {
    // Annuler toute synthèse en cours
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      if (onStart) onStart();
    };

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onerror = (event) => {
      if (event.error !== 'interrupted' && event.error !== 'canceled') {
        console.error('Web Speech error:', event.error);
        if (onError) onError(event.error);
      }
    };

    window.speechSynthesis.speak(utterance);
    return true;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error('Web Speech error:', errorMessage);
    if (onError) onError(errorMessage);
    return false;
  }
}

/**
 * Fonction principale avec fallback automatique
 */
export async function speakWithFallback(
  text: string,
  useElevenLabs: boolean = true,
  voiceId?: string
): Promise<void> {
  if (useElevenLabs) {
    const success = await speak(text, voiceId);
    if (!success) {
      console.log('ElevenLabs failed, falling back to Web Speech API');
      speakWithWebSpeech(text);
    }
  } else {
    speakWithWebSpeech(text);
  }
}

/**
 * Arrête toute lecture audio en cours
 */
export function stopSpeaking(): void {
  // Arrêter ElevenLabs
  if (currentAudioElement) {
    currentAudioElement.pause();
    currentAudioElement = null;
  }

  // Arrêter Web Speech API
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Récupère la liste des voix ElevenLabs disponibles
 */
export async function getAvailableVoices(): Promise<Voice[]> {
  try {
    const url = `https://${projectId}.supabase.co/functions/v1/make-server-488793d3/tts/voices`;
    console.log('Fetching voices from:', url);

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });

    console.log('Voices response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Voices API error:', errorData);
      throw new Error(errorData.error || `Erreur HTTP ${response.status}`);
    }

    const data: VoicesResponse = await response.json();
    console.log('Voices data:', data);

    if (!data.success || !data.voices) {
      throw new Error(data.error || 'Pas de voix disponibles');
    }

    console.log(`${data.voices.length} voix récupérées avec succès`);
    return data.voices;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error('Get voices error:', errorMessage);
    
    // Retourner des voix par défaut en cas d'erreur
    console.log('Utilisation des voix par défaut');
    return [
      {
        voice_id: RECOMMENDED_VOICES.CHARLOTTE,
        name: 'Charlotte (FR)',
        category: 'premade',
      },
      {
        voice_id: RECOMMENDED_VOICES.GRACE,
        name: 'Grace (FR)',
        category: 'premade',
      },
      {
        voice_id: RECOMMENDED_VOICES.MATILDA,
        name: 'Matilda (EN)',
        category: 'premade',
      },
    ];
  }
}

/**
 * Voix recommandées pour Tantie Sagesse
 */
export const RECOMMENDED_VOICES = {
  // Voix féminine française professionnelle (par défaut)
  CHARLOTTE: 'XB0fDUnXU5powFXDhCwa',
  
  // Alternatives
  GRACE: 'oWAxZDx7w5VEj9dCyTzz',
  MATILDA: 'XrExE9yKIg1WjnnlVkGX',
  
  // Voix masculine (si besoin)
  ADAM: 'pNInz6obpgDQGcFmaJgB',
} as const;

/**
 * Efface le cache audio
 */
export function clearAudioCache(): void {
  audioCache.clear();
  console.log('Cache audio effacé');
}
