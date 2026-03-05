import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";
import { sendSMS } from "./sms.ts";
import * as bo from "./backoffice.ts";

// Routes API
import * as commandes from "./commandes.ts";
import * as recoltes from "./recoltes.ts";
import * as stocks from "./stocks.ts";
import * as wallets from "./wallets.ts";
import * as notifications from "./notifications.ts";
import * as zones from "./zones.ts";
import * as caisse from "./caisse.ts";
import * as tickets from "./tickets.ts";
import * as audit from "./audit.ts";
import * as missions from "./missions.ts";
import * as cooperatives from "./cooperatives.ts";
import * as identifications from "./identifications.ts";
import * as commissions from "./commissions.ts";
import * as scores from "./scores.ts";
import * as aiIntent from "./ai-intent.ts";
import * as stt from "./stt.ts";

const app = new Hono();

// Initialisation du client Supabase avec service role (côté serveur)
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-488793d3/health", (c) => {
  return c.json({ 
    status: "ok",
    supabase: {
      connected: !!supabaseUrl && !!supabaseServiceKey,
      url: supabaseUrl ? 'configured' : 'missing'
    }
  });
});

// Test endpoint KV Store
app.get("/make-server-488793d3/kv/test", async (c) => {
  try {
    await kv.set('test_connection', { timestamp: new Date().toISOString(), message: 'Julaba connected!' });
    const result = await kv.get('test_connection');
    return c.json({ 
      status: "success",
      kv_test: result
    });
  } catch (error) {
    console.log('KV Test error:', error);
    return c.json({ 
      status: "error", 
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Exemple endpoint protégé avec auth Supabase
app.post("/make-server-488793d3/protected-example", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Token manquant' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      console.log('Auth error:', error);
      return c.json({ error: 'Non autorisé' }, 401);
    }

    return c.json({ 
      status: "success",
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (error) {
    console.log('Protected endpoint error:', error);
    return c.json({ 
      error: error instanceof Error ? error.message : 'Erreur serveur'
    }, 500);
  }
});

// ═══════════════════════════════════════════════════════════════════
// AUTHENTIFICATION JÙLABA - MIGRATION PROGRESSIVE SEMAINE 1
// ═══════════════════════════════════════════════════════════════════

/**
 * POST /signup - Inscription nouvel utilisateur
 * Body: { phone, password, firstName, lastName, role, region, commune, activity }
 */
app.post("/make-server-488793d3/auth/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { phone, password, firstName, lastName, role, region, commune, activity, market, cooperativeName, institutionName } = body;

    // Validation des champs obligatoires
    if (!phone || !password || !firstName || !lastName || !role) {
      return c.json({ 
        error: 'Champs obligatoires manquants',
        required: ['phone', 'password', 'firstName', 'lastName', 'role']
      }, 400);
    }

    // Vérifier que le rôle est valide
    const validRoles = [
      'marchand', 
      'producteur', 
      'cooperative', 
      'institution', 
      'identificateur', 
      'consommateur',
      'super_admin',
      'admin_national',
      'gestionnaire_zone',
      'analyste'
    ];
    if (!validRoles.includes(role)) {
      return c.json({ 
        error: 'Rôle invalide',
        validRoles
      }, 400);
    }

    // Vérifier si le téléphone existe déjà
    const { data: existingUser } = await supabase
      .from('users_julaba')
      .select('phone')
      .eq('phone', phone)
      .single();

    if (existingUser) {
      return c.json({ error: 'Ce numéro de téléphone est déjà enregistré' }, 409);
    }

    // Créer l'utilisateur dans Supabase Auth avec le téléphone comme email
    // Format: phone@julaba.local (car Supabase nécessite un email)
    const authEmail = `${phone}@julaba.local`;
    
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: authEmail,
      password: password,
      email_confirm: true, // Auto-confirmer car pas de serveur email configuré
      user_metadata: {
        phone,
        first_name: firstName,
        last_name: lastName,
        role
      }
    });

    if (authError) {
      console.log('Supabase Auth signup error:', authError);
      return c.json({ 
        error: 'Erreur lors de la création du compte',
        details: authError.message 
      }, 500);
    }

    // Créer le profil utilisateur dans users_julaba
    const { data: userProfile, error: profileError } = await supabase
      .from('users_julaba')
      .insert({
        auth_user_id: authData.user.id,
        phone,
        first_name: firstName,
        last_name: lastName,
        role,
        region: region || null,
        commune: commune || null,
        activity: activity || null,
        market: market || null,
        cooperative_name: cooperativeName || null,
        institution_name: institutionName || null,
        score: 50, // Score initial
        validated: false,
        verified_phone: true // Considéré vérifié car utilisé pour signup
      })
      .select()
      .single();

    if (profileError) {
      console.log('Profile creation error:', profileError);
      // Nettoyer l'utilisateur auth si la création du profil échoue
      await supabase.auth.admin.deleteUser(authData.user.id);
      return c.json({ 
        error: 'Erreur lors de la création du profil',
        details: profileError.message 
      }, 500);
    }

    return c.json({
      success: true,
      message: 'Compte créé avec succès',
      user: {
        id: userProfile.id,
        phone: userProfile.phone,
        firstName: userProfile.first_name,
        lastName: userProfile.last_name,
        role: userProfile.role,
        score: userProfile.score
      }
    }, 201);

  } catch (error) {
    console.log('Signup error:', error);
    return c.json({ 
      error: 'Erreur serveur lors de l\'inscription',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, 500);
  }
});

/**
 * POST /login - Connexion utilisateur
 * Body: { phone, password }
 */
app.post("/make-server-488793d3/auth/login", async (c) => {
  try {
    const body = await c.req.json();
    const { phone, password } = body;

    if (!phone || !password) {
      return c.json({ 
        error: 'Téléphone et mot de passe requis' 
      }, 400);
    }

    // Connexion avec email format (phone@julaba.local)
    const authEmail = `${phone}@julaba.local`;
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password: password
    });

    if (authError) {
      console.log('Login error:', authError);
      return c.json({ 
        error: 'Identifiants incorrects',
        details: authError.message
      }, 401);
    }

    // Récupérer le profil utilisateur complet
    const { data: userProfile, error: profileError } = await supabase
      .from('users_julaba')
      .select('*')
      .eq('auth_user_id', authData.user.id)
      .single();

    if (profileError || !userProfile) {
      console.log('Profile fetch error:', profileError);
      return c.json({ 
        error: 'Profil utilisateur introuvable' 
      }, 404);
    }

    // Mettre à jour last_login_at
    await supabase
      .from('users_julaba')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', userProfile.id);

    return c.json({
      success: true,
      accessToken: authData.session.access_token,
      refreshToken: authData.session.refresh_token,
      user: {
        id: userProfile.id,
        phone: userProfile.phone,
        firstName: userProfile.first_name,
        lastName: userProfile.last_name,
        role: userProfile.role,
        region: userProfile.region,
        commune: userProfile.commune,
        activity: userProfile.activity,
        market: userProfile.market,
        cooperativeName: userProfile.cooperative_name,
        institutionName: userProfile.institution_name,
        score: userProfile.score,
        validated: userProfile.validated,
        createdAt: userProfile.created_at
      }
    });

  } catch (error) {
    console.log('Login error:', error);
    return c.json({ 
      error: 'Erreur serveur lors de la connexion',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, 500);
  }
});

/**
 * POST /create-super-admin - Créer le premier compte Super Admin
 * Body: { phone, password, firstName, lastName }
 * ⚠️ Route de bootstrap - À utiliser une seule fois pour créer le premier admin
 */
app.post("/make-server-488793d3/auth/create-super-admin", async (c) => {
  try {
    const body = await c.req.json();
    const { phone, password, firstName, lastName } = body;

    // Validation des champs obligatoires
    if (!phone || !password || !firstName || !lastName) {
      return c.json({ 
        error: 'Champs obligatoires manquants',
        required: ['phone', 'password', 'firstName', 'lastName']
      }, 400);
    }

    // Vérifier si un Super Admin existe déjà
    const { data: existingSuperAdmin } = await supabase
      .from('users_julaba')
      .select('phone')
      .eq('role', 'super_admin')
      .limit(1);

    if (existingSuperAdmin && existingSuperAdmin.length > 0) {
      return c.json({ 
        error: 'Un compte Super Admin existe déjà',
        message: 'Pour des raisons de sécurité, un seul Super Admin initial peut être créé via cette route'
      }, 403);
    }

    // Vérifier si le téléphone existe déjà
    const { data: existingUser } = await supabase
      .from('users_julaba')
      .select('phone')
      .eq('phone', phone)
      .single();

    if (existingUser) {
      return c.json({ error: 'Ce numéro de téléphone est déjà enregistré' }, 409);
    }

    // Créer l'utilisateur dans Supabase Auth
    const authEmail = `${phone}@julaba.local`;
    
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: authEmail,
      password: password,
      email_confirm: true,
      user_metadata: {
        phone,
        first_name: firstName,
        last_name: lastName,
        role: 'super_admin'
      }
    });

    if (authError) {
      console.log('Supabase Auth super admin creation error:', authError);
      return c.json({ 
        error: 'Erreur lors de la création du compte Super Admin',
        details: authError.message 
      }, 500);
    }

    // Créer le profil Super Admin dans users_julaba
    const { data: userProfile, error: profileError } = await supabase
      .from('users_julaba')
      .insert({
        auth_user_id: authData.user.id,
        phone,
        first_name: firstName,
        last_name: lastName,
        role: 'super_admin',
        region: 'National',
        commune: 'Abidjan',
        activity: 'Administration',
        market: null,
        cooperative_name: null,
        institution_name: 'JÙLABA Back-Office',
        score: 100,
        validated: true,
        verified_phone: true
      })
      .select()
      .single();

    if (profileError) {
      console.log('Super Admin profile creation error:', profileError);
      await supabase.auth.admin.deleteUser(authData.user.id);
      return c.json({ 
        error: 'Erreur lors de la création du profil Super Admin',
        details: profileError.message 
      }, 500);
    }

    return c.json({
      success: true,
      message: 'Compte Super Admin créé avec succès',
      user: {
        id: userProfile.id,
        phone: userProfile.phone,
        firstName: userProfile.first_name,
        lastName: userProfile.last_name,
        role: userProfile.role
      }
    });

  } catch (error) {
    console.log('Create super admin error:', error);
    return c.json({ 
      error: 'Erreur serveur lors de la création du Super Admin',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, 500);
  }
});

/**
 * GET /me - Récupérer le profil de l'utilisateur connecté
 * Header: Authorization: Bearer {accessToken}
 */
app.get("/make-server-488793d3/auth/me", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Token d\'authentification manquant' }, 401);
    }

    // Vérifier le token
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      console.log('Auth verification error:', authError);
      return c.json({ error: 'Token invalide ou expiré' }, 401);
    }

    // Récupérer le profil complet
    const { data: userProfile, error: profileError } = await supabase
      .from('users_julaba')
      .select('*')
      .eq('auth_user_id', user.id)
      .single();

    if (profileError || !userProfile) {
      console.log('Profile fetch error:', profileError);
      return c.json({ error: 'Profil utilisateur introuvable' }, 404);
    }

    return c.json({
      success: true,
      user: {
        id: userProfile.id,
        phone: userProfile.phone,
        firstName: userProfile.first_name,
        lastName: userProfile.last_name,
        role: userProfile.role,
        region: userProfile.region,
        commune: userProfile.commune,
        activity: userProfile.activity,
        market: userProfile.market,
        cooperativeName: userProfile.cooperative_name,
        institutionName: userProfile.institution_name,
        score: userProfile.score,
        validated: userProfile.validated,
        photoUrl: userProfile.photo_url,
        createdAt: userProfile.created_at,
        lastLoginAt: userProfile.last_login_at
      }
    });

  } catch (error) {
    console.log('Get user profile error:', error);
    return c.json({ 
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, 500);
  }
});

/**
 * POST /logout - Déconnexion (invalider le token)
 * Header: Authorization: Bearer {accessToken}
 */
app.post("/make-server-488793d3/auth/logout", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Token d\'authentification manquant' }, 401);
    }

    // Supabase gère automatiquement l'invalidation du token
    const { error } = await supabase.auth.admin.signOut(accessToken);

    if (error) {
      console.log('Logout error:', error);
      // On continue quand même car le client peut supprimer le token localement
    }

    return c.json({
      success: true,
      message: 'Déconnexion réussie'
    });

  } catch (error) {
    console.log('Logout error:', error);
    return c.json({ 
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, 500);
  }
});

// ═══════════════════════════════════════════════════════════════════
// GESTION DES MOTS DE PASSE
// ═══════════════════════════════════════════════════════════════════

/**
 * POST /check-phone-for-reset - Vérifier si un numéro existe et retourner l'identificateur
 * Body: { phone }
 */
app.post("/make-server-488793d3/auth/check-phone-for-reset", async (c) => {
  try {
    const body = await c.req.json();
    const { phone } = body;

    if (!phone) {
      return c.json({ error: 'Numéro de téléphone requis' }, 400);
    }

    // Vérifier si l'utilisateur existe
    const { data: user, error: userError } = await supabase
      .from('users_julaba')
      .select('id, phone, first_name, last_name, created_by')
      .eq('phone', phone)
      .single();

    if (userError || !user) {
      return c.json({ 
        exists: false,
        message: 'Ce numéro n\'est pas enregistré'
      });
    }

    // Récupérer les informations de l'identificateur rattaché
    let identificateurName = null;
    if (user.created_by) {
      const { data: identificateur } = await supabase
        .from('users_julaba')
        .select('first_name, last_name')
        .eq('id', user.created_by)
        .single();

      if (identificateur) {
        identificateurName = `${identificateur.first_name} ${identificateur.last_name}`;
      }
    }

    return c.json({
      exists: true,
      identificateur: identificateurName || 'Identificateur non trouvé',
      message: identificateurName 
        ? `Contacte ${identificateurName} pour réinitialiser ton mot de passe`
        : 'Contacte ton identificateur pour réinitialiser ton mot de passe'
    });

  } catch (error) {
    console.log('Check phone for reset error:', error);
    return c.json({ 
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, 500);
  }
});

/**
 * POST /reset-user-password - Réinitialiser le mot de passe d'un utilisateur (identificateur uniquement)
 * Header: Authorization: Bearer {accessToken}
 * Body: { userId, newPassword }
 */
app.post("/make-server-488793d3/auth/reset-user-password", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Token d\'authentification manquant' }, 401);
    }

    // Vérifier que l'utilisateur connecté est un identificateur ou admin
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: 'Token invalide ou expiré' }, 401);
    }

    const { data: currentUser } = await supabase
      .from('users_julaba')
      .select('role')
      .eq('auth_user_id', user.id)
      .single();

    if (!currentUser || !['identificateur', 'super_admin', 'admin'].includes(currentUser.role)) {
      return c.json({ 
        error: 'Accès refusé. Seuls les identificateurs et administrateurs peuvent réinitialiser les mots de passe.'
      }, 403);
    }

    const body = await c.req.json();
    const { userId, newPassword } = body;

    if (!userId || !newPassword) {
      return c.json({ 
        error: 'ID utilisateur et nouveau mot de passe requis'
      }, 400);
    }

    // Validation du mot de passe (minimum 6 caractères)
    if (newPassword.length < 6) {
      return c.json({ 
        error: 'Le mot de passe doit contenir au moins 6 caractères'
      }, 400);
    }

    // Récupérer l'auth_user_id de l'utilisateur cible
    const { data: targetUser, error: targetError } = await supabase
      .from('users_julaba')
      .select('auth_user_id, phone, first_name, last_name')
      .eq('id', userId)
      .single();

    if (targetError || !targetUser) {
      return c.json({ error: 'Utilisateur introuvable' }, 404);
    }

    // Mettre à jour le mot de passe dans Supabase Auth
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      targetUser.auth_user_id,
      { password: newPassword }
    );

    if (updateError) {
      console.log('Password update error:', updateError);
      return c.json({ 
        error: 'Erreur lors de la réinitialisation du mot de passe',
        details: updateError.message
      }, 500);
    }

    return c.json({
      success: true,
      message: `Mot de passe réinitialisé pour ${targetUser.first_name} ${targetUser.last_name}`,
      user: {
        id: userId,
        phone: targetUser.phone,
        firstName: targetUser.first_name,
        lastName: targetUser.last_name
      }
    });

  } catch (error) {
    console.log('Reset password error:', error);
    return c.json({ 
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, 500);
  }
});

// ═══════════════════════════════════════════════════════════════════
// PARAMÈTRES SYSTÈME
// ═══════════════════════════════════════════════════════════════════

/**
 * GET /system/settings - Récupérer les paramètres système publics
 * Retourne les paramètres configurés par le BO (numéro de support, etc.)
 */
app.get("/make-server-488793d3/system/settings", async (c) => {
  try {
    // Récupérer le numéro de support configuré par le BO
    const supportPhone = await kv.get('system:support_phone');
    
    return c.json({
      success: true,
      settings: {
        supportPhone: supportPhone || '0700000000', // Valeur par défaut
      }
    });

  } catch (error) {
    console.log('Error fetching system settings:', error);
    return c.json({ 
      error: 'Erreur lors de la récupération des paramètres',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, 500);
  }
});

// ═══════════════════════════════════════════════════════════════════
// AUTHENTIFICATION OTP (SMS)
// ═══════════════════════════════════════════════════════════════════

/**
 * POST /auth/send-otp - Envoyer un code OTP par SMS
 * Body: { phone: string }
 * En production: envoie un vrai SMS via Twilio/Vonage/etc
 * En développement: stocke le code dans KV et le log
 */
app.post("/make-server-488793d3/auth/send-otp", async (c) => {
  try {
    const body = await c.req.json();
    const { phone } = body;

    if (!phone || !/^\d{10}$/.test(phone)) {
      return c.json({ 
        error: 'Numéro de téléphone invalide (10 chiffres requis)' 
      }, 400);
    }

    // Générer un code OTP aléatoire de 4 chiffres
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Expiration: 10 minutes
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Stocker l'OTP dans KV avec le téléphone comme clé
    const otpKey = `otp:${phone}`;
    await kv.set(otpKey, {
      code: otpCode,
      expiresAt: expiresAt,
      attempts: 0,
      createdAt: new Date().toISOString()
    });

    // Log pour développement
    console.log(`📱 OTP pour ${phone}: ${otpCode} (expire à ${expiresAt})`);

    // Envoyer le SMS via Wassoya
    const smsMessage = `Votre code Jùlaba : ${otpCode}\nValide 10 minutes.\nNe partagez jamais ce code.`;
    const smsResult = await sendSMS(phone, smsMessage);

    if (!smsResult.success) {
      console.error(`⚠️ Erreur envoi SMS Wassoya: ${smsResult.error}`);
      // On continue quand même - l'utilisateur peut voir le code en dev
    } else {
      console.log(`✅ SMS envoyé avec succès à ${phone} via Wassoya`);
    }

    // Déterminer si on est en mode développement
    const isDev = Deno.env.get('DENO_ENV') !== 'production';

    return c.json({
      success: true,
      message: 'Code OTP envoyé avec succès',
      smsDelivered: smsResult.success,
      // En dev uniquement - afficher le code
      ...(isDev && {
        devOnly: {
          code: otpCode,
          expiresAt: expiresAt,
          smsError: smsResult.success ? undefined : smsResult.error
        }
      })
    });

  } catch (error) {
    console.log('Error sending OTP:', error);
    return c.json({ 
      error: 'Erreur lors de l\'envoi du code OTP',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, 500);
  }
});

/**
 * POST /auth/verify-otp - Vérifier le code OTP et connecter l'utilisateur
 * Body: { phone: string, code: string }
 */
app.post("/make-server-488793d3/auth/verify-otp", async (c) => {
  try {
    const body = await c.req.json();
    const { phone, code } = body;

    if (!phone || !code) {
      return c.json({ 
        error: 'Téléphone et code requis' 
      }, 400);
    }

    // Récupérer l'OTP stocké
    const otpKey = `otp:${phone}`;
    const otpData = await kv.get(otpKey);

    if (!otpData) {
      return c.json({ 
        error: 'Code OTP invalide ou expiré' 
      }, 401);
    }

    // Vérifier l'expiration
    if (new Date(otpData.expiresAt) < new Date()) {
      await kv.del(otpKey);
      return c.json({ 
        error: 'Code OTP expiré. Demandez un nouveau code.' 
      }, 401);
    }

    // Vérifier le nombre de tentatives (max 3)
    if (otpData.attempts >= 3) {
      await kv.del(otpKey);
      return c.json({ 
        error: 'Trop de tentatives. Demandez un nouveau code.' 
      }, 429);
    }

    // Vérifier le code
    if (otpData.code !== code) {
      // Incrémenter les tentatives
      await kv.set(otpKey, {
        ...otpData,
        attempts: otpData.attempts + 1
      });
      
      return c.json({ 
        error: 'Code OTP incorrect',
        attemptsRemaining: 3 - (otpData.attempts + 1)
      }, 401);
    }

    // Code correct ! Supprimer l'OTP
    await kv.del(otpKey);

    // Vérifier si l'utilisateur existe dans la base
    const { data: userProfile, error: profileError } = await supabase
      .from('users_julaba')
      .select('*')
      .eq('phone', phone)
      .single();

    if (profileError || !userProfile) {
      // Nouvel utilisateur - retourner un token temporaire pour l'onboarding
      return c.json({
        success: true,
        newUser: true,
        phone: phone,
        message: 'Bienvenue ! Complétez votre profil pour continuer.'
      });
    }

    // Utilisateur existant - créer une session Supabase
    const authEmail = `${phone}@julaba.local`;
    
    // Tenter de se connecter avec le compte Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password: phone // Mot de passe = numéro de téléphone par défaut
    });

    if (authError) {
      console.log('Auth error after OTP:', authError);
      // Si pas de compte auth, en créer un
      const { data: newAuthData, error: createError } = await supabase.auth.admin.createUser({
        email: authEmail,
        password: phone,
        email_confirm: true,
        user_metadata: {
          phone: phone,
          name: `${userProfile.first_name} ${userProfile.last_name}`
        }
      });

      if (createError) {
        console.log('Error creating auth user:', createError);
        return c.json({ 
          error: 'Erreur lors de la création de session',
          details: createError.message
        }, 500);
      }

      // Mettre à jour le profil avec l'auth_user_id
      await supabase
        .from('users_julaba')
        .update({ auth_user_id: newAuthData.user.id })
        .eq('id', userProfile.id);

      // Générer un token d'accès
      const { data: sessionData } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: authEmail
      });

      return c.json({
        success: true,
        newUser: false,
        accessToken: sessionData.properties.action_link,
        user: {
          id: userProfile.id,
          phone: userProfile.phone,
          firstName: userProfile.first_name,
          lastName: userProfile.last_name,
          role: userProfile.role,
          region: userProfile.region,
          commune: userProfile.commune,
          activity: userProfile.activity,
          market: userProfile.market,
          cooperativeName: userProfile.cooperative_name,
          institutionName: userProfile.institution_name,
          score: userProfile.score,
          validated: userProfile.validated,
          createdAt: userProfile.created_at
        }
      });
    }

    // Mettre à jour last_login_at
    await supabase
      .from('users_julaba')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', userProfile.id);

    return c.json({
      success: true,
      newUser: false,
      accessToken: authData.session.access_token,
      refreshToken: authData.session.refresh_token,
      user: {
        id: userProfile.id,
        phone: userProfile.phone,
        firstName: userProfile.first_name,
        lastName: userProfile.last_name,
        role: userProfile.role,
        region: userProfile.region,
        commune: userProfile.commune,
        activity: userProfile.activity,
        market: userProfile.market,
        cooperativeName: userProfile.cooperative_name,
        institutionName: userProfile.institution_name,
        score: userProfile.score,
        validated: userProfile.validated,
        createdAt: userProfile.created_at
      }
    });

  } catch (error) {
    console.log('Error verifying OTP:', error);
    return c.json({ 
      error: 'Erreur lors de la vérification du code OTP',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, 500);
  }
});

// ═══════════════════════════════════════════════════════════════════
// TANTIE SAGESSE - ELEVENLABS TEXT-TO-SPEECH
// ═══════════════════════════════════════════════════════════════════

/**
 * POST /tts/speak - Génération audio via ElevenLabs
 * Body: { text: string, voiceId?: string }
 * Retourne l'audio en base64 pour lecture immédiate
 */
app.post("/make-server-488793d3/tts/speak", async (c) => {
  try {
    const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
    
    if (!apiKey) {
      console.log('ElevenLabs API key missing - TTS unavailable');
      return c.json({ 
        error: 'Service de synthèse vocale non configuré',
        details: 'ELEVENLABS_API_KEY manquante'
      }, 503);
    }

    const body = await c.req.json();
    const { text, voiceId } = body;

    if (!text || text.trim().length === 0) {
      return c.json({ error: 'Texte requis pour la synthèse vocale' }, 400);
    }

    // Voix par défaut : Charlotte (voix féminine française professionnelle)
    // Autres options recommandées : "pNInz6obpgDQGcFmaJgB" (Adam - voix masculine)
    const selectedVoiceId = voiceId || "XB0fDUnXU5powFXDhCwa";

    console.log(`ElevenLabs TTS request - Voice: ${selectedVoiceId}, Text length: ${text.length}`);

    // Appel à l'API ElevenLabs
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_multilingual_v2', // Meilleur modèle pour le français
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`ElevenLabs API error (${response.status}):`, errorText);
      return c.json({ 
        error: 'Erreur lors de la génération audio',
        details: `ElevenLabs API returned ${response.status}`,
        message: errorText
      }, response.status);
    }

    // Convertir l'audio en base64 pour l'envoyer au frontend
    const audioBuffer = await response.arrayBuffer();
    const base64Audio = btoa(
      new Uint8Array(audioBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ''
      )
    );

    console.log(`ElevenLabs TTS success - Audio size: ${audioBuffer.byteLength} bytes`);

    return c.json({
      success: true,
      audio: base64Audio,
      contentType: 'audio/mpeg',
      voiceId: selectedVoiceId
    });

  } catch (error) {
    console.log('TTS error:', error);
    return c.json({ 
      error: 'Erreur serveur lors de la synthèse vocale',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, 500);
  }
});

/**
 * GET /tts/voices - Liste des voix ElevenLabs disponibles
 */
app.get("/make-server-488793d3/tts/voices", async (c) => {
  try {
    const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
    
    console.log('GET /tts/voices - API Key configured:', !!apiKey);
    
    if (!apiKey) {
      console.log('ELEVENLABS_API_KEY missing - Please add it to Supabase Edge Functions secrets');
      return c.json({ 
        success: false,
        error: 'Service de synthèse vocale non configuré',
        details: 'La clé API ELEVENLABS_API_KEY doit être ajoutée dans les Secrets Supabase'
      }, 503);
    }

    console.log('Fetching voices from ElevenLabs API...');
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': apiKey,
      }
    });

    console.log('ElevenLabs API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`ElevenLabs voices API error (${response.status}):`, errorText);
      
      // Si erreur de permission (401), retourner des voix par défaut au lieu d'une erreur
      if (response.status === 401 || errorText.includes('missing_permissions')) {
        console.log('⚠️ Permission manquante - Utilisation des voix par défaut');
        return c.json({
          success: true,
          voices: [
            { voice_id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte (FR)', category: 'premade' },
            { voice_id: 'oWAxZDx7w5VEj9dCyTzz', name: 'Grace (FR)', category: 'premade' },
            { voice_id: 'XrExE9yKIg1WjnnlVkGX', name: 'Matilda (EN)', category: 'premade' },
            { voice_id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam (EN)', category: 'premade' },
          ],
          fallback: true,
          warning: 'Voix par défaut utilisées - Permissions API limitées'
        });
      }
      
      return c.json({ 
        success: false,
        error: 'Erreur lors de la récupération des voix',
        details: errorText,
        status: response.status
      }, response.status);
    }

    const data = await response.json();
    console.log(`Successfully fetched ${data.voices?.length || 0} voices`);
    
    return c.json({
      success: true,
      voices: data.voices || []
    });

  } catch (error) {
    console.log('Voices list error:', error);
    return c.json({ 
      success: false,
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, 500);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES API - TERRAIN
// ─────────────────────────────────────────────────────────────────────────────

// Commandes
app.get("/make-server-488793d3/api/commandes", commandes.getCommandes);
app.post("/make-server-488793d3/api/commandes", commandes.createCommande);
app.patch("/make-server-488793d3/api/commandes/:id", commandes.updateCommande);
app.delete("/make-server-488793d3/api/commandes/:id", commandes.deleteCommande);

// Récoltes
app.get("/make-server-488793d3/api/recoltes", recoltes.getRecoltes);
app.post("/make-server-488793d3/api/recoltes", recoltes.createRecolte);
app.patch("/make-server-488793d3/api/recoltes/:id", recoltes.updateRecolte);
app.delete("/make-server-488793d3/api/recoltes/:id", recoltes.deleteRecolte);

// Stocks
app.get("/make-server-488793d3/api/stocks", stocks.getStocks);
app.post("/make-server-488793d3/api/stocks", stocks.upsertStock);
app.patch("/make-server-488793d3/api/stocks/:id", stocks.updateStock);
app.delete("/make-server-488793d3/api/stocks/:id", stocks.deleteStock);

// Wallets
app.get("/make-server-488793d3/api/wallet", wallets.getWallet);
app.post("/make-server-488793d3/api/wallet/credit", wallets.creditWallet);
app.post("/make-server-488793d3/api/wallet/debit", wallets.debitWallet);
app.get("/make-server-488793d3/api/wallet/transactions", wallets.getWalletTransactions);

// Notifications
app.get("/make-server-488793d3/api/notifications", notifications.getNotifications);
app.post("/make-server-488793d3/api/notifications", notifications.createNotification);
app.patch("/make-server-488793d3/api/notifications/:id/read", notifications.markAsRead);
app.delete("/make-server-488793d3/api/notifications/:id", notifications.deleteNotification);

// Zones
app.get("/make-server-488793d3/api/zones", zones.getZones);
app.get("/make-server-488793d3/api/zones/:id", zones.getZoneById);

// Caisse
app.get("/make-server-488793d3/api/caisse/session", caisse.getCurrentSession);
app.post("/make-server-488793d3/api/caisse/session/open", caisse.openSession);
app.post("/make-server-488793d3/api/caisse/session/close", caisse.closeSession);
app.get("/make-server-488793d3/api/caisse/transactions", caisse.getTransactions);
app.post("/make-server-488793d3/api/caisse/vente", caisse.createVente);
app.post("/make-server-488793d3/api/caisse/depense", caisse.createDepense);
app.get("/make-server-488793d3/api/caisse/stats", caisse.getStats);

// Tickets
app.get("/make-server-488793d3/api/tickets", tickets.getTickets);
app.post("/make-server-488793d3/api/tickets", tickets.createTicket);
app.patch("/make-server-488793d3/api/tickets/:id", tickets.updateTicket);

// Audit
app.get("/make-server-488793d3/api/audit", audit.getAuditLogs);
app.post("/make-server-488793d3/api/audit", audit.createAuditLog);

// Missions
app.get("/make-server-488793d3/api/missions", missions.getMissions);
app.post("/make-server-488793d3/api/missions", missions.createMission);
app.patch("/make-server-488793d3/api/missions/:id", missions.updateMission);
app.delete("/make-server-488793d3/api/missions/:id", missions.deleteMission);

// Cooperatives
app.get("/make-server-488793d3/api/cooperatives", cooperatives.getCooperatives);
app.get("/make-server-488793d3/api/cooperatives/:id", cooperatives.getCooperativeById);
app.post("/make-server-488793d3/api/cooperatives", cooperatives.createCooperative);
app.patch("/make-server-488793d3/api/cooperatives/:id", cooperatives.updateCooperative);
app.get("/make-server-488793d3/api/cooperatives/:id/membres", cooperatives.getMembres);
app.post("/make-server-488793d3/api/cooperatives/:id/membres", cooperatives.addMembre);
app.delete("/make-server-488793d3/api/cooperatives/:id/membres/:membreId", cooperatives.removeMembre);
app.get("/make-server-488793d3/api/cooperatives/:id/tresorerie", cooperatives.getTresorerie);

// Identifications
app.get("/make-server-488793d3/api/identifications", identifications.getIdentifications);
app.post("/make-server-488793d3/api/identifications", identifications.createIdentification);
app.patch("/make-server-488793d3/api/identifications/:id", identifications.updateIdentification);

// Commissions
app.get("/make-server-488793d3/api/commissions", commissions.getCommissions);
app.post("/make-server-488793d3/api/commissions", commissions.createCommission);
app.patch("/make-server-488793d3/api/commissions/:id", commissions.updateCommission);

// Scores
app.get("/make-server-488793d3/api/scores", scores.getScores);
app.post("/make-server-488793d3/api/scores", scores.updateScore);
app.get("/make-server-488793d3/api/scores/history/:userId", scores.getScoreHistory);

// AI Intent
app.post("/make-server-488793d3/api/ai-intent", aiIntent.interpretIntent);
app.get("/make-server-488793d3/api/ai-intent/intents", aiIntent.getAvailableIntents);

// STT
app.post("/make-server-488793d3/api/stt/transcribe", stt.transcribeAudio);

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES BACK-OFFICE
// ─────────────────────────────────────────────────────────────────────────────

// Acteurs
app.get("/make-server-488793d3/backoffice/acteurs", bo.getActeurs);
app.patch("/make-server-488793d3/backoffice/acteurs/:id/statut", bo.updateActeurStatut);

// Dossiers
app.get("/make-server-488793d3/backoffice/dossiers", bo.getDossiers);
app.patch("/make-server-488793d3/backoffice/dossiers/:id/statut", bo.updateDossierStatut);

// Transactions
app.get("/make-server-488793d3/backoffice/transactions", bo.getTransactions);

// Zones
app.get("/make-server-488793d3/backoffice/zones", bo.getZones);
app.patch("/make-server-488793d3/backoffice/zones/:id/statut", bo.updateZoneStatut);

// Commissions
app.get("/make-server-488793d3/backoffice/commissions", bo.getCommissions);
app.patch("/make-server-488793d3/backoffice/commissions/:id/statut", bo.updateCommissionStatut);

// Audit
app.get("/make-server-488793d3/backoffice/audit", bo.getAuditLogs);

// Utilisateurs BO
app.get("/make-server-488793d3/backoffice/users", bo.getBOUsers);

// Institutions
app.get("/make-server-488793d3/backoffice/institutions", bo.getInstitutions);
app.post("/make-server-488793d3/backoffice/institutions", bo.createInstitution);
app.patch("/make-server-488793d3/backoffice/institutions/:id/modules", bo.updateInstitutionModules);
app.patch("/make-server-488793d3/backoffice/institutions/:id/statut", bo.updateInstitutionStatut);
app.delete("/make-server-488793d3/backoffice/institutions/:id", bo.deleteInstitution);

// ═══════════════════════════════════════════════════════════════════
// GESTIONNAIRE D'ERREURS 404 - DOIT RETOURNER JSON
// ═══════════════════════════════════════════════════════════════════
app.notFound((c) => {
  return c.json({ 
    error: 'Route non trouvée',
    path: c.req.path,
    method: c.req.method
  }, 404);
});

// ═══════════════════════════════════════════════════════════════════
// GESTIONNAIRE D'ERREURS GLOBAL - DOIT RETOURNER JSON
// ═══════════════════════════════════════════════════════════════════
app.onError((err, c) => {
  console.error('Erreur serveur:', err);
  return c.json({ 
    error: 'Erreur serveur',
    message: err.message,
    path: c.req.path
  }, 500);
});

Deno.serve(app.fetch);