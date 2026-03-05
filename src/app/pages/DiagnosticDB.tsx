/**
 * ═══════════════════════════════════════════════════════════════════
 * JÙLABA — Page de Diagnostic Base de Données
 * ═══════════════════════════════════════════════════════════════════
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Database, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-488793d3`;

export default function DiagnosticDB() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testCreateSuperAdmin = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/auth/create-super-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          phone: '0700000001',
          password: 'TestSecure123',
          firstName: 'Test',
          lastName: 'Admin'
        })
      });

      const data = await response.json();
      
      setResult({
        status: response.status,
        ok: response.ok,
        data: data
      });

      console.log('Test result:', {
        status: response.status,
        ok: response.ok,
        data: data
      });
    } catch (err) {
      console.error('Test error:', err);
      setResult({
        status: 'error',
        ok: false,
        data: { error: err instanceof Error ? err.message : 'Unknown error' }
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-xl p-8 max-w-2xl w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
            <Database className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Diagnostic Base de Données
          </h1>
          <p className="text-gray-600">
            Test de création du Super Admin
          </p>
        </div>

        {/* Test Button */}
        <button
          onClick={testCreateSuperAdmin}
          disabled={isLoading}
          className="w-full py-4 rounded-2xl bg-blue-600 text-white font-semibold text-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50 mb-6"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Test en cours...
            </>
          ) : (
            <>
              <RefreshCw className="w-5 h-5" />
              Tester la Création
            </>
          )}
        </button>

        {/* Result */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Status */}
            <div className={`flex items-center gap-3 p-4 rounded-2xl ${
              result.ok ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'
            }`}>
              {result.ok ? (
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
              )}
              <div>
                <p className={`font-semibold ${result.ok ? 'text-green-900' : 'text-red-900'}`}>
                  {result.ok ? 'Succès' : 'Échec'}
                </p>
                <p className={`text-sm ${result.ok ? 'text-green-700' : 'text-red-700'}`}>
                  Status: {result.status}
                </p>
              </div>
            </div>

            {/* Data */}
            <div className="bg-gray-50 rounded-2xl p-4 overflow-auto">
              <p className="text-sm font-medium text-gray-700 mb-2">Réponse serveur :</p>
              <pre className="text-xs text-gray-800 font-mono whitespace-pre-wrap">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </div>

            {/* Interpretation */}
            {result.data?.error && (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4">
                <p className="text-sm font-medium text-yellow-900 mb-2">
                  Analyse de l'erreur :
                </p>
                <ul className="text-sm text-yellow-800 space-y-1">
                  {result.data.error.includes('existe déjà') && (
                    <li>• Un Super Admin existe déjà dans la base</li>
                  )}
                  {result.data.error.includes('téléphone') && (
                    <li>• Ce numéro de téléphone est déjà utilisé</li>
                  )}
                  {result.data.error.includes('profil') && (
                    <li>• Problème lors de la création du profil dans users_julaba</li>
                  )}
                  {result.data.details && (
                    <li>• Détails: {result.data.details}</li>
                  )}
                </ul>
              </div>
            )}
          </motion.div>
        )}

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-2xl">
          <p className="text-sm text-blue-800">
            <strong>Note :</strong> Ce test utilise les identifiants de test :
          </p>
          <ul className="text-sm text-blue-700 mt-2 space-y-1">
            <li>• Téléphone : 0700000001</li>
            <li>• Mot de passe : TestSecure123</li>
            <li>• Prénom : Test</li>
            <li>• Nom : Admin</li>
          </ul>
        </div>

        {/* Links */}
        <div className="mt-6 flex gap-4">
          <a
            href="/create-super-admin"
            className="flex-1 py-3 text-center rounded-2xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
          >
            Page Création
          </a>
          <a
            href="/database"
            className="flex-1 py-3 text-center rounded-2xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
          >
            Database Viewer
          </a>
        </div>
      </motion.div>
    </div>
  );
}
