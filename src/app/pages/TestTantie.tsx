import { useState } from 'react';
import { motion } from 'motion/react';
import { Volume2, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import * as ElevenLabs from '../services/elevenlabs';

export default function TestTantie() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [voices, setVoices] = useState<any[]>([]);

  const testElevenLabs = async () => {
    setIsLoading(true);
    setStatus('idle');
    setMessage('');
    
    try {
      console.log('[TestTantie] Fetching voices...');
      const fetchedVoices = await ElevenLabs.getVoices();
      console.log('[TestTantie] Voices received:', fetchedVoices);
      
      setVoices(fetchedVoices);
      setStatus('success');
      setMessage(`✅ ${fetchedVoices.length} voix disponibles via ElevenLabs`);
      
      // Test de synthèse vocale
      console.log('[TestTantie] Testing speech synthesis...');
      await ElevenLabs.speak('Bonjour, je suis Tantie Sagesse, votre assistante vocale pour Jùlaba.');
      
    } catch (error: any) {
      console.error('[TestTantie] Error:', error);
      setStatus('error');
      setMessage(`❌ Erreur: ${error.message || 'Échec du test'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-4">
      <div className="max-w-2xl mx-auto py-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-orange-900 mb-2">
            Test Tantie Sagesse
          </h1>
          <p className="text-orange-700">
            Vérification de l'intégration ElevenLabs
          </p>
        </motion.div>

        {/* Test Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl border-2 border-orange-200 p-6 shadow-lg mb-6"
        >
          <button
            onClick={testElevenLabs}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 px-6 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Test en cours...
              </>
            ) : (
              <>
                <Volume2 className="w-6 h-6" />
                Tester ElevenLabs
              </>
            )}
          </button>

          {/* Status Message */}
          {message && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 p-4 rounded-2xl border-2 flex items-center gap-3 ${
                status === 'success'
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              {status === 'success' ? (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <p className="text-sm font-medium">{message}</p>
            </motion.div>
          )}
        </motion.div>

        {/* Voices List */}
        {voices.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border-2 border-orange-200 p-6 shadow-lg"
          >
            <h2 className="text-xl font-bold text-orange-900 mb-4">
              Voix disponibles ({voices.length})
            </h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {voices.map((voice, index) => (
                <div
                  key={voice.voice_id || index}
                  className="p-3 bg-orange-50 rounded-xl border border-orange-100"
                >
                  <p className="font-medium text-orange-900">{voice.name}</p>
                  <p className="text-sm text-orange-600">
                    ID: {voice.voice_id}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 bg-blue-50 rounded-3xl border-2 border-blue-200 p-6"
        >
          <h3 className="font-bold text-blue-900 mb-2">
            Instructions
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Ouvrez la console du navigateur (F12)</li>
            <li>• Cliquez sur "Tester ElevenLabs"</li>
            <li>• Vérifiez les logs dans la console</li>
            <li>• Si succès, vous devriez entendre Tantie Sagesse</li>
          </ul>
        </motion.div>

      </div>
    </div>
  );
}
