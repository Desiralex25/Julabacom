/**
 * Visualisation du flux de connexion Jùlaba
 */

import React, { useState } from 'react';
import { Smartphone, Lock, Server, Database, Key, ChevronRight, CheckCircle, XCircle } from 'lucide-react';

interface Step {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  codeExample?: string;
}

const otpFlow: Step[] = [
  {
    id: 'otp-1',
    title: '1. Utilisateur saisit son téléphone',
    description: 'Frontend : Formulaire avec numéro de téléphone (10 chiffres)',
    icon: Smartphone,
    color: 'blue',
    codeExample: `const sendOTP = async (phone: string) => {
  const response = await fetch(
    \`https://\${projectId}.supabase.co/functions/v1/make-server-488793d3/auth/send-otp\`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${publicAnonKey}\`,
      },
      body: JSON.stringify({ phone }),
    }
  );
  
  const data = await response.json();
  console.log('OTP envoyé !', data);
};`
  },
  {
    id: 'otp-2',
    title: '2. Backend génère et envoie OTP',
    description: 'Backend : Génère code 4 chiffres, stocke dans KV, envoie SMS Wassoya',
    icon: Server,
    color: 'purple',
    codeExample: `// Backend Edge Function
const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

// Stocker dans KV Store
await kv.set(\`otp:\${phone}\`, {
  code: otpCode,
  expiresAt: expiresAt.toISOString(),
  attempts: 0,
  createdAt: new Date().toISOString()
});

// Envoyer SMS
const smsMessage = \`Votre code Jùlaba : \${otpCode}\\nValide 10 minutes.\`;
await sendSMS(phone, smsMessage);

return c.json({ success: true });`
  },
  {
    id: 'otp-3',
    title: '3. Utilisateur saisit le code OTP',
    description: 'Frontend : Formulaire de vérification du code reçu par SMS',
    icon: Key,
    color: 'green',
    codeExample: `const verifyOTP = async (phone: string, code: string) => {
  const response = await fetch(
    \`https://\${projectId}.supabase.co/functions/v1/make-server-488793d3/auth/verify-otp\`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${publicAnonKey}\`,
      },
      body: JSON.stringify({ phone, code }),
    }
  );
  
  const data = await response.json();
  
  if (data.success && !data.newUser) {
    // Utilisateur existant
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    navigate(\`/\${data.user.role}\`);
  } else if (data.newUser) {
    // Nouvel utilisateur → onboarding
    navigate('/onboarding', { state: { phone } });
  }
};`
  },
  {
    id: 'otp-4',
    title: '4. Backend vérifie et crée session',
    description: 'Backend : Vérifie OTP, cherche utilisateur, crée session Supabase',
    icon: Database,
    color: 'orange',
    codeExample: `// Récupérer et vérifier OTP
const otpData = await kv.get(\`otp:\${phone}\`);
if (otpData.code !== code) {
  return c.json({ error: 'Code incorrect' }, 401);
}

// Chercher utilisateur dans users_julaba
const { data: userProfile } = await supabase
  .from('users_julaba')
  .select('*')
  .eq('phone', phone)
  .single();

if (!userProfile) {
  return c.json({ success: true, newUser: true, phone });
}

// Créer session Supabase Auth
const { data: authData } = await supabase.auth.signInWithPassword({
  email: \`\${phone}@julaba.local\`,
  password: phone
});

return c.json({
  success: true,
  accessToken: authData.session.access_token,
  refreshToken: authData.session.refresh_token,
  user: userProfile
});`
  },
  {
    id: 'otp-5',
    title: '5. Frontend stocke tokens et redirige',
    description: 'Frontend : Stocke accessToken dans localStorage, redirige selon rôle',
    icon: CheckCircle,
    color: 'green',
    codeExample: `// Stocker dans localStorage
localStorage.setItem('accessToken', data.accessToken);
localStorage.setItem('refreshToken', data.refreshToken);
localStorage.setItem('user', JSON.stringify(data.user));

// Rediriger selon le rôle
const roleRoutes = {
  marchand: '/marchand',
  producteur: '/producteur',
  cooperative: '/cooperative',
  institution: '/institution',
  identificateur: '/identificateur',
  consommateur: '/consommateur'
};

navigate(roleRoutes[data.user.role]);`
  },
];

const passwordFlow: Step[] = [
  {
    id: 'pwd-1',
    title: '1. Utilisateur saisit téléphone + mot de passe',
    description: 'Frontend : Formulaire de connexion Back-Office',
    icon: Lock,
    color: 'blue',
    codeExample: `const login = async (phone: string, password: string) => {
  const response = await fetch(
    \`https://\${projectId}.supabase.co/functions/v1/make-server-488793d3/auth/login\`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${publicAnonKey}\`,
      },
      body: JSON.stringify({ phone, password }),
    }
  );
  
  return await response.json();
};`
  },
  {
    id: 'pwd-2',
    title: '2. Backend authentifie via Supabase Auth',
    description: 'Backend : Appelle signInWithPassword avec email = {phone}@julaba.local',
    icon: Server,
    color: 'purple',
    codeExample: `const authEmail = \`\${phone}@julaba.local\`;

const { data: authData, error } = await supabase.auth.signInWithPassword({
  email: authEmail,
  password: password
});

if (error) {
  return c.json({ error: 'Identifiants incorrects' }, 401);
}

// Récupérer profil complet
const { data: userProfile } = await supabase
  .from('users_julaba')
  .select('*')
  .eq('auth_user_id', authData.user.id)
  .single();

return c.json({
  success: true,
  accessToken: authData.session.access_token,
  refreshToken: authData.session.refresh_token,
  user: userProfile
});`
  },
  {
    id: 'pwd-3',
    title: '3. Frontend stocke tokens et accède au BO',
    description: 'Frontend : Vérifie rôle admin, stocke tokens, redirige vers Back-Office',
    icon: CheckCircle,
    color: 'green',
    codeExample: `const data = await login(phone, password);

if (data.success) {
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('user', JSON.stringify(data.user));
  
  // Vérifier rôle (à implémenter selon votre logique)
  if (data.user.role === 'admin' || hasBackofficeAccess(data.user)) {
    navigate('/backoffice');
  } else {
    alert('Accès refusé - Permissions insuffisantes');
  }
}`
  },
];

export default function ConnectionFlow() {
  const [selectedFlow, setSelectedFlow] = useState<'otp' | 'password'>('otp');
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  const currentFlow = selectedFlow === 'otp' ? otpFlow : passwordFlow;

  const getColorClasses = (color: string) => {
    const colors: Record<string, any> = {
      blue: { bg: 'bg-blue-100', border: 'border-blue-200', text: 'text-blue-600', icon: 'bg-blue-600' },
      purple: { bg: 'bg-purple-100', border: 'border-purple-200', text: 'text-purple-600', icon: 'bg-purple-600' },
      green: { bg: 'bg-green-100', border: 'border-green-200', text: 'text-green-600', icon: 'bg-green-600' },
      orange: { bg: 'bg-orange-100', border: 'border-orange-200', text: 'text-orange-600', icon: 'bg-orange-600' },
    };
    return colors[color];
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* En-tête */}
        <div className="bg-white rounded-3xl border-2 border-gray-200 p-8 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <Key className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Flux de connexion Jùlaba</h1>
              <p className="text-gray-600">Comprendre comment se fait l'authentification</p>
            </div>
          </div>

          {/* Sélecteur de flux */}
          <div className="flex gap-4">
            <button
              onClick={() => setSelectedFlow('otp')}
              className={`flex-1 px-6 py-4 rounded-2xl border-2 font-medium transition-all ${
                selectedFlow === 'otp'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
              }`}
            >
              <Smartphone className="w-5 h-5 inline-block mr-2" />
              Connexion OTP (SMS)
            </button>
            <button
              onClick={() => setSelectedFlow('password')}
              className={`flex-1 px-6 py-4 rounded-2xl border-2 font-medium transition-all ${
                selectedFlow === 'password'
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300'
              }`}
            >
              <Lock className="w-5 h-5 inline-block mr-2" />
              Connexion Mot de passe (BO)
            </button>
          </div>
        </div>

        {/* Étapes */}
        <div className="space-y-4">
          {currentFlow.map((step, index) => {
            const isExpanded = expandedStep === step.id;
            const colors = getColorClasses(step.color);
            const Icon = step.icon;

            return (
              <div key={step.id} className="relative">
                {/* Ligne de connexion */}
                {index < currentFlow.length - 1 && (
                  <div className="absolute left-6 top-16 w-0.5 h-12 bg-gray-300 z-0"></div>
                )}

                {/* Carte étape */}
                <div className={`bg-white rounded-3xl border-2 ${colors.border} overflow-hidden relative z-10`}>
                  <button
                    onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                    className={`w-full ${colors.bg} p-6 flex items-center justify-between hover:opacity-80 transition-opacity`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 ${colors.icon} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left">
                        <h3 className={`text-lg font-bold ${colors.text}`}>{step.title}</h3>
                        <p className="text-sm text-gray-600">{step.description}</p>
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-6 h-6 ${colors.text} transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                    />
                  </button>

                  {/* Code exemple */}
                  {isExpanded && step.codeExample && (
                    <div className="p-6 bg-gray-900">
                      <pre className="text-sm text-green-400 overflow-x-auto">
                        <code>{step.codeExample}</code>
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Informations clés */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-3xl border-2 border-blue-200 p-6">
            <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
              <Key className="w-5 h-5" />
              Format email universel
            </h3>
            <div className="bg-white rounded-xl border border-blue-200 p-4">
              <code className="text-sm text-blue-600">
                {'{phone}@julaba.local'}
              </code>
              <p className="text-xs text-gray-600 mt-2">
                Exemple : <strong>0707123456@julaba.local</strong>
              </p>
            </div>
          </div>

          <div className="bg-purple-50 rounded-3xl border-2 border-purple-200 p-6">
            <h3 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
              <Server className="w-5 h-5" />
              Tokens retournés
            </h3>
            <div className="space-y-2">
              <div className="bg-white rounded-xl border border-purple-200 p-3">
                <p className="text-sm font-medium text-gray-900">accessToken</p>
                <p className="text-xs text-gray-600">Expire après 1 heure</p>
              </div>
              <div className="bg-white rounded-xl border border-purple-200 p-3">
                <p className="text-sm font-medium text-gray-900">refreshToken</p>
                <p className="text-xs text-gray-600">Expire après 30 jours</p>
              </div>
            </div>
          </div>
        </div>

        {/* Endpoints */}
        <div className="mt-6 bg-white rounded-3xl border-2 border-gray-200 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Endpoints disponibles</h2>
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-2xl border-2 border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm font-bold mr-3">
                    POST
                  </span>
                  <code className="text-sm font-mono text-gray-900">/auth/send-otp</code>
                </div>
                <p className="text-sm text-gray-600">Envoyer code OTP par SMS</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl border-2 border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm font-bold mr-3">
                    POST
                  </span>
                  <code className="text-sm font-mono text-gray-900">/auth/verify-otp</code>
                </div>
                <p className="text-sm text-gray-600">Vérifier OTP et créer session</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl border-2 border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm font-bold mr-3">
                    POST
                  </span>
                  <code className="text-sm font-mono text-gray-900">/auth/login</code>
                </div>
                <p className="text-sm text-gray-600">Connexion mot de passe</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl border-2 border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm font-bold mr-3">
                    GET
                  </span>
                  <code className="text-sm font-mono text-gray-900">/auth/me</code>
                </div>
                <p className="text-sm text-gray-600">Récupérer profil utilisateur</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl border-2 border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm font-bold mr-3">
                    POST
                  </span>
                  <code className="text-sm font-mono text-gray-900">/auth/logout</code>
                </div>
                <p className="text-sm text-gray-600">Déconnexion utilisateur</p>
              </div>
            </div>
          </div>
        </div>

        {/* Documentation */}
        <div className="mt-6 bg-yellow-50 rounded-3xl border-2 border-yellow-200 p-6 text-center">
          <p className="text-gray-700">
            📄 Documentation complète disponible dans{' '}
            <code className="bg-yellow-100 px-2 py-1 rounded-lg font-mono text-sm">/CONNEXION_FLOW.md</code>
          </p>
        </div>
      </div>
    </div>
  );
}
