/**
 * Service ElevenLabs pour Tantie Sagesse (Mode Local)
 * Utilise uniquement Web Speech API
 */

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

/**
 * Genere et joue l'audio (mode local - Web Speech API uniquement)
 */
export async function speak(
  text: string,
  voiceId?: string,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (error: string) => void
): Promise<boolean> {
  // Mode local - utilise directement Web Speech API
  return speakWithWebSpeech(text, onStart, onEnd, onError);
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
    if (onError) onError('Synthese vocale non disponible sur cet appareil');
    return false;
  }

  try {
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
  useElevenLabs: boolean = false,
  voiceId?: string
): Promise<void> {
  speakWithWebSpeech(text);
}

/**
 * Arrete toute lecture audio en cours
 */
export function stopSpeaking(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Recupere la liste des voix disponibles (mode local)
 */
export async function getAvailableVoices(): Promise<Voice[]> {
  return [
    {
      voice_id: RECOMMENDED_VOICES.CHARLOTTE,
      name: 'Charlotte (FR) - Par defaut',
      category: 'premade',
    },
    {
      voice_id: RECOMMENDED_VOICES.GRACE,
      name: 'Grace (FR) - Alternative',
      category: 'premade',
    },
  ];
}

/**
 * Voix recommandees pour Tantie Sagesse
 */
export const RECOMMENDED_VOICES = {
  CHARLOTTE: 'charlotte',
  GRACE: 'grace',
  MATILDA: 'matilda',
  ADAM: 'adam',
} as const;

/**
 * Efface le cache audio
 */
export function clearAudioCache(): void {
  console.log('Mode local - pas de cache audio');
}
