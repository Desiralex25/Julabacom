/**
 * ═══════════════════════════════════════════════════════════════════
 * JÙLABA - Moteur d'Intention IA (Tantie Sagesse)
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Ce module analyse les messages texte des utilisateurs via OpenAI GPT
 * pour détecter l'intention métier et retourner une action structurée.
 * 
 * Architecture: User → Tantie Sagesse → /ai/interpret → OpenAI GPT → Action JSON
 */

import type { Context } from "npm:hono";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES & INTERFACES
// ─────────────────────────────────────────────────────────────────────────────

export type Intent =
  | 'create_order'
  | 'update_order'
  | 'cancel_order'
  | 'create_harvest'
  | 'update_stock'
  | 'check_stock'
  | 'create_identification'
  | 'validate_identification'
  | 'view_dashboard'
  | 'view_wallet'
  | 'create_support_ticket'
  | 'update_profile'
  | 'show_sales'
  | 'show_expenses'
  | 'show_balance'
  | 'add_product'
  | 'checkout'
  | 'search_product'
  | 'unknown';

export type Entity =
  | 'commande'
  | 'stock'
  | 'profil'
  | 'support'
  | 'récolte'
  | 'coopérative'
  | 'identification'
  | 'wallet'
  | 'caisse'
  | 'produit'
  | 'dashboard';

export type Action = 'create' | 'read' | 'update' | 'delete';

export interface IntentRequest {
  message: string;
  role: string;
  screen: string;
  userId?: string;
  context?: Record<string, any>;
}

export interface IntentResponse {
  intent: Intent;
  entity: Entity;
  action: Action;
  confidence: number;
  parameters: Record<string, any>;
  requiresConfirmation: boolean;
  message: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// PROMPT SYSTÈME POUR GPT
// ─────────────────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Tu es Tantie Sagesse, une assistante IA bienveillante pour Jùlaba, une plateforme d'inclusion économique ivoirienne pour acteurs vivriers.

Ton rôle est d'analyser les messages des utilisateurs (marchands, producteurs, coopératives, identificateurs, institutions) et de détecter l'action métier demandée.

Tu dois TOUJOURS répondre en JSON structuré selon ce schéma exact:
{
  "intent": "create_order | update_order | cancel_order | create_harvest | update_stock | check_stock | create_identification | validate_identification | view_dashboard | view_wallet | create_support_ticket | update_profile | show_sales | show_expenses | show_balance | add_product | checkout | search_product | unknown",
  "entity": "commande | stock | profil | support | récolte | coopérative | identification | wallet | caisse | produit | dashboard",
  "action": "create | read | update | delete",
  "confidence": 0.0-1.0,
  "parameters": {
    "product": "nom du produit extrait",
    "quantity": "quantité extraite",
    "targetUser": "utilisateur cible",
    "zone": "zone géographique",
    "price": "prix mentionné",
    "unit": "unité (kg, sac, tonne)",
    "period": "période (jour, semaine, mois)"
  },
  "requiresConfirmation": true/false,
  "message": "réponse naturelle et accessible en français simple"
}

RÈGLES IMPORTANTES:
1. Le langage doit être simple et accessible (niveau instruction basique)
2. Utilise le tutoiement et un ton maternel bienveillant
3. Extraie les paramètres numériques (quantités, prix) du message
4. Si l'intention n'est pas claire, mets confidence < 0.5 et intent "unknown"
5. Les actions de suppression/suspension/paiement requièrent TOUJOURS confirmation
6. Adapte ton analyse au rôle de l'utilisateur (marchand, producteur, etc.)
7. Si plusieurs produits ivoiriens sont mentionnés (cacao, café, banane, igname, manioc, riz, maïs, arachide, tomate, oignon), extraie le principal

CONTEXTE MÉTIER JÙLABA:
- Marchands: ventes, stock, caisse, POS, dépenses
- Producteurs: récoltes, déclarations, cycles agricoles
- Coopératives: membres, trésorerie, achats groupés, cotisations
- Identificateurs: créer/valider identifications, commissions
- Institutions: validation comptes, statistiques, rapports

EXEMPLES D'ANALYSE:

Message: "Je veux vendre 200kg de cacao"
Réponse: {
  "intent": "create_order",
  "entity": "commande",
  "action": "create",
  "confidence": 0.95,
  "parameters": {
    "product": "cacao",
    "quantity": "200",
    "unit": "kg"
  },
  "requiresConfirmation": true,
  "message": "Tu veux créer une vente de 200 kg de cacao. Je peux t'aider à l'enregistrer. Dois-je continuer ?"
}

Message: "combien j'ai gagné aujourd'hui"
Réponse: {
  "intent": "show_sales",
  "entity": "dashboard",
  "action": "read",
  "confidence": 0.92,
  "parameters": {
    "period": "jour"
  },
  "requiresConfirmation": false,
  "message": "Je vais te montrer tes ventes d'aujourd'hui."
}

Message: "j'ai besoin d'aide"
Réponse: {
  "intent": "create_support_ticket",
  "entity": "support",
  "action": "create",
  "confidence": 0.88,
  "parameters": {},
  "requiresConfirmation": false,
  "message": "Je comprends que tu as besoin d'aide. Je peux ouvrir un ticket de support ou te mettre en relation avec l'équipe Jùlaba."
}

NE RÉPONDS JAMAIS EN TEXTE LIBRE. TOUJOURS EN JSON STRUCTURÉ.`;

// ─────────────────────────────────────────────────────────────────────────────
// FONCTION D'INTERPRÉTATION IA
// ─────────────────────────────────────────────────────────────────────────────

export async function interpretIntent(c: Context) {
  try {
    const apiKey = Deno.env.get('OPENAI_API_KEY');

    if (!apiKey) {
      console.log('⚠️ OPENAI_API_KEY manquante - Moteur IA désactivé');
      return c.json({
        error: 'Moteur d\'intelligence artificielle non configuré',
        details: 'La clé API OpenAI doit être ajoutée dans les secrets Supabase'
      }, 503);
    }

    const body = await c.req.json() as IntentRequest;
    const { message, role, screen, userId, context } = body;

    if (!message || message.trim().length === 0) {
      return c.json({
        error: 'Message requis pour l\'analyse d\'intention'
      }, 400);
    }

    console.log(`🤖 AI Intent - User: ${userId} | Role: ${role} | Screen: ${screen} | Message: "${message}"`);

    // Construire le contexte utilisateur pour GPT
    const userContext = `
Utilisateur: ${userId || 'anonyme'}
Rôle: ${role}
Écran actuel: ${screen}
Contexte supplémentaire: ${context ? JSON.stringify(context) : 'aucun'}
    `.trim();

    // Appel à l'API OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: `${userContext}\n\nMessage utilisateur: "${message}"`
          }
        ],
        temperature: 0.3, // Faible pour plus de cohérence
        max_tokens: 500,
        response_format: { type: 'json_object' } // Force JSON
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ OpenAI API error (${response.status}):`, errorText);
      
      return c.json({
        error: 'Erreur lors de l\'analyse du message',
        details: `OpenAI API returned ${response.status}`,
        message: errorText
      }, response.status);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      console.error('❌ Réponse vide de l\'API OpenAI');
      return c.json({
        error: 'Réponse vide de l\'IA'
      }, 500);
    }

    // Parser la réponse JSON de GPT
    let intentResult: IntentResponse;
    try {
      intentResult = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('❌ Erreur parsing JSON:', aiResponse);
      return c.json({
        error: 'Format de réponse invalide de l\'IA',
        details: aiResponse
      }, 500);
    }

    console.log(`✅ AI Intent détecté: ${intentResult.intent} (confidence: ${intentResult.confidence})`);

    // Validation de la réponse
    if (!intentResult.intent || !intentResult.message) {
      return c.json({
        error: 'Réponse IA incomplète',
        details: intentResult
      }, 500);
    }

    // Retourner la réponse structurée
    return c.json({
      success: true,
      result: intentResult,
      metadata: {
        model: 'gpt-4o-mini',
        tokens: data.usage?.total_tokens || 0,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Erreur moteur AI Intent:', error);
    return c.json({
      error: 'Erreur serveur lors de l\'analyse d\'intention',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, 500);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FONCTION UTILITAIRE - MAPPING INTENT → ACTION APP
// ─────────────────────────────────────────────────────────────────────────────

export function mapIntentToAction(intent: Intent): string {
  const actionMap: Record<Intent, string> = {
    // Commandes
    create_order: 'navigate:/marchand/caisse',
    update_order: 'navigate:/marchand/historique',
    cancel_order: 'action:cancel_order',
    
    // Récoltes
    create_harvest: 'navigate:/producteur/recolte',
    
    // Stock
    update_stock: 'navigate:/marchand/produits',
    check_stock: 'action:show_stock',
    
    // Identification
    create_identification: 'navigate:/identificateur/identifier',
    validate_identification: 'action:validate_identification',
    
    // Vues
    view_dashboard: 'navigate:/marchand/dashboard',
    view_wallet: 'navigate:/marchand/wallet',
    
    // Support
    create_support_ticket: 'navigate:/marchand/support',
    
    // Profil
    update_profile: 'navigate:/marchand/profil',
    
    // Dashboard actions
    show_sales: 'action:announce_sales',
    show_expenses: 'action:announce_expenses',
    show_balance: 'action:announce_balance',
    
    // POS
    add_product: 'action:add_to_cart',
    checkout: 'action:checkout',
    
    // Marché
    search_product: 'action:search_product',
    
    // Fallback
    unknown: 'action:unknown'
  };

  return actionMap[intent] || 'action:unknown';
}

// ─────────────────────────────────────────────────────────────────────────────
// FONCTION DE TEST - LISTE DES INTENTS DISPONIBLES
// ─────────────────────────────────────────────────────────────────────────────

export function getAvailableIntents(c: Context) {
  const intents: Record<Intent, string> = {
    create_order: 'Créer une commande/vente',
    update_order: 'Modifier une commande',
    cancel_order: 'Annuler une commande',
    create_harvest: 'Créer une déclaration de récolte',
    update_stock: 'Mettre à jour le stock',
    check_stock: 'Vérifier le stock',
    create_identification: 'Créer une identification',
    validate_identification: 'Valider une identification',
    view_dashboard: 'Afficher le tableau de bord',
    view_wallet: 'Afficher le wallet',
    create_support_ticket: 'Créer un ticket de support',
    update_profile: 'Mettre à jour le profil',
    show_sales: 'Afficher les ventes',
    show_expenses: 'Afficher les dépenses',
    show_balance: 'Afficher le solde',
    add_product: 'Ajouter un produit',
    checkout: 'Encaisser une vente',
    search_product: 'Rechercher un produit',
    unknown: 'Intention non reconnue'
  };

  return c.json({
    success: true,
    totalIntents: Object.keys(intents).length,
    intents: intents,
    model: 'gpt-4o-mini',
    description: 'Moteur d\'intention IA pour Tantie Sagesse - Jùlaba'
  });
}
