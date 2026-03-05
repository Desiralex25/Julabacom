import { SupabaseTestPanel } from '../components/SupabaseTestPanel';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';

export default function SupabaseTestPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Button
          onClick={() => navigate('/')}
          variant="outline"
          className="mb-6 rounded-2xl border-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Integration Supabase
          </h1>
          <p className="text-gray-600">
            Plateforme Julaba - Backend configure et operationnel
          </p>
        </div>

        <SupabaseTestPanel />

        <div className="mt-8 p-6 bg-white rounded-3xl border-2 border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Documentation Integration
          </h3>
          
          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <p className="font-semibold text-gray-900 mb-2">Client Supabase Frontend:</p>
              <code className="block bg-gray-50 p-3 rounded-xl border border-gray-200">
                import &#123; supabase &#125; from '../utils/supabase-client';
              </code>
            </div>

            <div>
              <p className="font-semibold text-gray-900 mb-2">Appeler le serveur:</p>
              <code className="block bg-gray-50 p-3 rounded-xl border border-gray-200">
                import &#123; callServer &#125; from '../utils/supabase-helpers';<br/>
                const data = await callServer('/route');
              </code>
            </div>

            <div>
              <p className="font-semibold text-gray-900 mb-2">KV Store (depuis serveur):</p>
              <code className="block bg-gray-50 p-3 rounded-xl border border-gray-200">
                import * as kv from './kv_store.tsx';<br/>
                await kv.set('key', &#123; data: 'value' &#125;);<br/>
                const value = await kv.get('key');
              </code>
            </div>

            <div>
              <p className="font-semibold text-gray-900 mb-2">Authentification:</p>
              <code className="block bg-gray-50 p-3 rounded-xl border border-gray-200">
                import &#123; signIn, signOut, getCurrentUser &#125; from '../utils/supabase-helpers';<br/>
                await signIn('email@example.com', 'password');
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
