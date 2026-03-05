/**
 * Page de test ElevenLabs - Diagnostic complet
 */

import React, { useState } from 'react';
import { Volume2, Play, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { speak, speakWithWebSpeech, getAvailableVoices } from '../services/elevenlabs';
import { projectId, publicAnonKey } from '/utils/supabase/info';

export default function TestElevenLabs() {
  const [testText] = useState('Bonjour, je suis Tantie Sagesse, votre assistante vocale Jùlaba.');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [voices, setVoices] = useState<any[]>([]);

  const testBackendHealth = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-488793d3/health`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();
      setResult({
        type: 'health',
        success: response.ok,
        data,
      });
    } catch (error) {
      setResult({
        type: 'health',
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    } finally {
      setLoading(false);
    }
  };

  const testElevenLabsVoices = async () => {
    setLoading(true);
    setResult(null);

    try {
      const voicesList = await getAvailableVoices();
      setVoices(voicesList);
      setResult({
        type: 'voices',
        success: true,
        data: voicesList,
      });
    } catch (error) {
      setResult({
        type: 'voices',
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    } finally {
      setLoading(false);
    }
  };

  const testElevenLabsTTS = async () => {
    setLoading(true);
    setResult(null);

    try {
      const success = await speak(
        testText,
        undefined,
        () => console.log('TTS Started'),
        () => console.log('TTS Ended'),
        (error) => console.error('TTS Error:', error)
      );

      setResult({
        type: 'tts',
        success,
        message: success ? 'Audio généré avec succès' : 'Échec de la génération audio',
      });
    } catch (error) {
      setResult({
        type: 'tts',
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    } finally {
      setLoading(false);
    }
  };

  const testWebSpeech = () => {
    setLoading(true);
    setResult(null);

    const success = speakWithWebSpeech(
      testText,
      () => console.log('Web Speech Started'),
      () => {
        console.log('Web Speech Ended');
        setLoading(false);
      },
      (error) => {
        console.error('Web Speech Error:', error);
        setResult({
          type: 'webspeech',
          success: false,
          error,
        });
        setLoading(false);
      }
    );

    if (success) {
      setResult({
        type: 'webspeech',
        success: true,
        message: 'Synthèse vocale native activée',
      });
    }
  };

  const testDirectBackend = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-488793d3/tts/speak`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ text: testText }),
        }
      );

      const data = await response.json();
      
      setResult({
        type: 'backend',
        success: response.ok,
        status: response.status,
        data,
      });
    } catch (error) {
      setResult({
        type: 'backend',
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl border-2 border-gray-200 p-8 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center">
              <Volume2 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Test ElevenLabs</h1>
              <p className="text-gray-600">Diagnostic de la synthèse vocale Tantie Sagesse</p>
            </div>
          </div>

          {/* Texte de test */}
          <div className="bg-gray-50 rounded-2xl border-2 border-gray-200 p-4 mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">Texte de test</p>
            <p className="text-gray-900">{testText}</p>
          </div>

          {/* Boutons de test */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <button
              onClick={testBackendHealth}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-2xl font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? <Loader className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
              Test Backend Health
            </button>

            <button
              onClick={testElevenLabsVoices}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-purple-600 text-white rounded-2xl font-medium hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Volume2 className="w-5 h-5" />}
              Test Liste Voix
            </button>

            <button
              onClick={testDirectBackend}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-orange-600 text-white rounded-2xl font-medium hover:bg-orange-700 disabled:opacity-50"
            >
              {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
              Test Backend Direct
            </button>

            <button
              onClick={testElevenLabsTTS}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-green-600 text-white rounded-2xl font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
              Test ElevenLabs TTS
            </button>

            <button
              onClick={testWebSpeech}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-600 text-white rounded-2xl font-medium hover:bg-gray-700 disabled:opacity-50 md:col-span-2"
            >
              {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
              Test Web Speech API (Fallback)
            </button>
          </div>

          {/* Résultats */}
          {result && (
            <div className={`rounded-2xl border-2 p-6 ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center gap-3 mb-4">
                {result.success ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-600" />
                )}
                <h3 className="font-bold text-gray-900">
                  {result.type === 'health' && 'Backend Health'}
                  {result.type === 'voices' && 'Liste des voix'}
                  {result.type === 'backend' && 'Backend Direct'}
                  {result.type === 'tts' && 'ElevenLabs TTS'}
                  {result.type === 'webspeech' && 'Web Speech API'}
                </h3>
              </div>

              <pre className="bg-white rounded-xl p-4 text-sm overflow-auto max-h-96 border border-gray-200">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          {/* Liste des voix */}
          {voices.length > 0 && (
            <div className="mt-6">
              <h3 className="font-bold text-gray-900 mb-4">Voix disponibles ({voices.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {voices.map((voice) => (
                  <div key={voice.voice_id} className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                    <p className="font-medium text-gray-900">{voice.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{voice.voice_id}</p>
                    {voice.category && (
                      <span className="inline-block mt-2 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-lg">
                        {voice.category}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 rounded-3xl border-2 border-yellow-200 p-6">
          <h3 className="font-bold text-yellow-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Instructions de diagnostic
          </h3>
          <ul className="space-y-2 text-sm text-yellow-800">
            <li>1. <strong>Test Backend Health</strong> : Vérifie que le serveur Supabase fonctionne</li>
            <li>2. <strong>Test Backend Direct</strong> : Appelle directement l'endpoint /tts/speak</li>
            <li>3. <strong>Test Liste Voix</strong> : Récupère les voix ElevenLabs disponibles</li>
            <li>4. <strong>Test ElevenLabs TTS</strong> : Génère et joue l'audio via ElevenLabs</li>
            <li>5. <strong>Test Web Speech API</strong> : Teste le fallback natif du navigateur</li>
          </ul>

          <div className="mt-4 p-4 bg-white rounded-xl border border-yellow-300">
            <p className="text-sm font-medium text-gray-900 mb-2">Si erreur 401 ElevenLabs :</p>
            <ol className="text-xs text-gray-700 space-y-1 list-decimal list-inside">
              <li>Vérifier que ELEVENLABS_API_KEY est définie dans Supabase Edge Functions Secrets</li>
              <li>Vérifier que la clé API est valide (compte actif)</li>
              <li>Vérifier que le compte n'est pas en Free Tier bloqué</li>
              <li>En cas de Free Tier bloqué : upgrader vers un plan payant ($5-11/mois)</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
