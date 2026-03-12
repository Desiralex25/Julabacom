import { useState } from 'react';
import { motion } from 'motion/react';
import { Database, CheckCircle2, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { callServer } from '/utils/supabase-helpers';

export function SupabaseTestPanel() {
  const [testing, setTesting] = useState(false);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [kvStatus, setKvStatus] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async () => {
    setTesting(true);
    setError(null);
    setHealthStatus(null);
    setKvStatus(null);

    try {
      // Test 1: Health check
      const health = await callServer('/health');
      setHealthStatus(health);

      // Test 2: KV Store
      const kv = await callServer('/kv/test');
      setKvStatus(kv);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      console.error('Erreur test Supabase:', err);
    } finally {
      setTesting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl border-2 border-emerald-200"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-emerald-500 rounded-2xl">
          <Database className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Test Connexion Supabase</h2>
          <p className="text-sm text-gray-600">Verification de l integration backend</p>
        </div>
      </div>

      <Button
        onClick={testConnection}
        disabled={testing}
        className="w-full mb-6 h-14 text-lg rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
      >
        {testing ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Test en cours...
          </>
        ) : (
          <>
            <RefreshCw className="w-5 h-5 mr-2" />
            Tester la connexion
          </>
        )}
      </Button>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-red-50 border-2 border-red-200 rounded-2xl mb-4"
        >
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Erreur de connexion</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Health Status */}
      {healthStatus && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-white rounded-2xl border-2 border-emerald-200 mb-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <p className="font-semibold text-gray-900">Serveur Backend</p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-semibold text-emerald-600">{healthStatus.status}</span>
            </div>
            {healthStatus.supabase && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Supabase connecte:</span>
                  <span className="font-semibold">
                    {healthStatus.supabase.connected ? 'Oui' : 'Non'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">URL configuree:</span>
                  <span className="font-semibold">{healthStatus.supabase.url}</span>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}

      {/* KV Store Status */}
      {kvStatus && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-white rounded-2xl border-2 border-emerald-200"
        >
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <p className="font-semibold text-gray-900">Base de donnees KV</p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-semibold text-emerald-600">{kvStatus.status}</span>
            </div>
            {kvStatus.kv_test && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Message:</span>
                  <span className="font-semibold">{kvStatus.kv_test.message}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Timestamp:</span>
                  <span className="text-xs">{kvStatus.kv_test.timestamp}</span>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}

      {!testing && !healthStatus && !kvStatus && !error && (
        <div className="text-center text-gray-500 py-8">
          <p>Cliquez sur le bouton pour tester la connexion</p>
        </div>
      )}
    </motion.div>
  );
}