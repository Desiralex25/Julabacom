/**
 * Composant de test pour Tantie Sagesse avec ElevenLabs
 */

import { useState, useEffect } from 'react';
import { Volume2, VolumeX, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as ElevenLabs from '../services/elevenlabs';

export function TantieSagesseTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [voices, setVoices] = useState<any[]>([]);
  const [selectedVoice, setSelectedVoice] = useState(ElevenLabs.RECOMMENDED_VOICES.CHARLOTTE);
  const [customText, setCustomText] = useState('Bonjour, je suis Tantie Sagesse, ton assistante vocale pour Jùlaba.');
  const [voicesLoadError, setVoicesLoadError] = useState('');
  const [voicesLoading, setVoicesLoading] = useState(true);

  // Charger les voix disponibles
  useEffect(() => {
    setVoicesLoading(true);
    ElevenLabs.getAvailableVoices()
      .then((voicesList) => {
        setVoices(voicesList);
        console.log('Voix ElevenLabs disponibles:', voicesList);
        if (voicesList.length === 0) {
          setVoicesLoadError('Aucune voix disponible');
        }
        setVoicesLoading(false);
      })
      .catch((error) => {
        const errMsg = error instanceof Error ? error.message : 'Erreur inconnue';
        setVoicesLoadError(errMsg);
        console.error('Erreur chargement voix:', errMsg);
        setVoicesLoading(false);
      });
  }, []);

  const testElevenLabs = async () => {
    setIsLoading(true);
    setStatus('idle');
    setErrorMessage('');

    const success = await ElevenLabs.speak(
      customText,
      selectedVoice,
      () => {
        console.log('Audio started');
        setStatus('success');
      },
      () => {
        console.log('Audio ended');
        setIsLoading(false);
      },
      (error) => {
        console.error('Audio error:', error);
        setStatus('error');
        setErrorMessage(error);
        setIsLoading(false);
      }
    );

    if (!success) {
      setStatus('error');
      setErrorMessage('Échec de la synthèse vocale ElevenLabs');
      setIsLoading(false);
    }
  };

  const testWebSpeech = () => {
    setIsLoading(true);
    setStatus('idle');
    setErrorMessage('');

    ElevenLabs.speakWithWebSpeech(
      customText,
      () => {
        setStatus('success');
      },
      () => {
        setIsLoading(false);
      },
      (error) => {
        setStatus('error');
        setErrorMessage(error);
        setIsLoading(false);
      }
    );
  };

  const stopAll = () => {
    ElevenLabs.stopSpeaking();
    setIsLoading(false);
    setStatus('idle');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-20 right-4 z-50 w-96 bg-white/90 backdrop-blur-xl border-2 border-orange-200 rounded-3xl p-6 shadow-2xl"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-gray-900">Test Tantie Sagesse</h3>
        <AnimatePresence mode="wait">
          {status === 'success' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </motion.div>
          )}
          {status === 'error' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <XCircle className="w-6 h-6 text-red-500" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sélection de voix */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Voix ElevenLabs {voicesLoading && '(chargement...)'}
        </label>
        {voicesLoadError && (
          <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded-xl text-xs text-yellow-800">
            {voicesLoadError} - Utilisation des voix par défaut
          </div>
        )}
        <select
          value={selectedVoice}
          onChange={(e) => setSelectedVoice(e.target.value)}
          className="w-full px-4 py-2 rounded-2xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-all"
        >
          <option value={ElevenLabs.RECOMMENDED_VOICES.CHARLOTTE}>
            Charlotte (Recommandée)
          </option>
          <option value={ElevenLabs.RECOMMENDED_VOICES.GRACE}>Grace</option>
          <option value={ElevenLabs.RECOMMENDED_VOICES.MATILDA}>Matilda</option>
          <option value={ElevenLabs.RECOMMENDED_VOICES.ADAM}>Adam (Masculine)</option>
          {voices.length > 0 && voices.map((voice) => (
            <option key={voice.voice_id} value={voice.voice_id}>
              {voice.name}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-500">
          {voices.length > 0 ? `${voices.length} voix chargées` : 'Voix par défaut uniquement'}
        </p>
      </div>

      {/* Texte personnalisé */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Texte à dire
        </label>
        <textarea
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          rows={3}
          className="w-full px-4 py-2 rounded-2xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-all resize-none"
          placeholder="Entrez le texte ici..."
        />
      </div>

      {/* Boutons de test */}
      <div className="space-y-2">
        <button
          onClick={testElevenLabs}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
          Test ElevenLabs
        </button>

        <button
          onClick={testWebSpeech}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
          Test Web Speech
        </button>

        <button
          onClick={stopAll}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-2xl font-medium hover:shadow-lg transition-all"
        >
          <VolumeX className="w-5 h-5" />
          Arrêter
        </button>
      </div>

      {/* Message d'erreur */}
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 p-3 bg-red-50 border-2 border-red-200 rounded-2xl text-sm text-red-700"
        >
          {errorMessage}
        </motion.div>
      )}

      {/* Informations */}
      <div className="mt-4 p-3 bg-orange-50 border-2 border-orange-200 rounded-2xl text-xs text-gray-600">
        <p className="font-medium mb-2">Configuration requise :</p>
        <ul className="space-y-1">
          <li className="flex items-center gap-2">
            {voicesLoadError ? (
              <XCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />
            )}
            <span>Clé API ElevenLabs dans Supabase</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-3 h-3 text-blue-500 flex-shrink-0" />
            <span>Fallback automatique vers Web Speech</span>
          </li>
        </ul>
        {voicesLoadError && (
          <p className="mt-2 text-red-600 font-medium">
            Pour activer ElevenLabs, ajoutez ELEVENLABS_API_KEY dans les Secrets Supabase
          </p>
        )}
      </div>
    </motion.div>
  );
}
