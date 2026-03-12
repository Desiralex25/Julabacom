/**
 * ═══════════════════════════════════════════════════════════════════
 * JÙLABA - Service d'Intention IA (Mode Local)
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Service frontend pour interpreter les messages utilisateur
 * Mode local sans backend
 */

// Types
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
  | 'recolte'
  | 'cooperative'
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

export interface IntentResult {
  success: boolean;
  result?: IntentResponse;
  metadata?: {
    model: string;
    tokens: number;
    timestamp: string;
  };
  error?: string;
  details?: string;
}

// Service (mode local - pas de backend)
class AIIntentService {
  async interpret(request: IntentRequest): Promise<IntentResult> {
    console.log('AI Intent mode local - pas de backend disponible');
    return {
      success: false,
      error: 'Mode local - service IA non disponible',
    };
  }

  async getAvailableIntents(): Promise<any> {
    return {
      success: false,
      error: 'Mode local - service IA non disponible',
    };
  }

  mapIntentToAction(intent: Intent, role: string): string {
    const rolePrefix = `/${role}`;
    const actionMap: Record<Intent, string> = {
      create_order: `${rolePrefix}/caisse`,
      update_order: `${rolePrefix}/historique`,
      cancel_order: 'action:cancel_order',
      create_harvest: `${rolePrefix}/recolte`,
      update_stock: `${rolePrefix}/produits`,
      check_stock: 'action:show_stock',
      create_identification: `${rolePrefix}/identifier`,
      validate_identification: 'action:validate_identification',
      view_dashboard: `${rolePrefix}/dashboard`,
      view_wallet: `${rolePrefix}/wallet`,
      create_support_ticket: `${rolePrefix}/support`,
      update_profile: `${rolePrefix}/profil`,
      show_sales: 'action:announce_sales',
      show_expenses: 'action:announce_expenses',
      show_balance: 'action:announce_balance',
      add_product: 'action:add_to_cart',
      checkout: 'action:checkout',
      search_product: 'action:search_product',
      unknown: 'action:unknown',
    };
    return actionMap[intent] || 'action:unknown';
  }

  extractParameters(result: IntentResponse): Record<string, any> {
    const { parameters } = result;
    return {
      product: parameters.product || null,
      quantity: parameters.quantity ? parseFloat(parameters.quantity) : null,
      unit: parameters.unit || null,
      price: parameters.price ? parseFloat(parameters.price) : null,
      targetUser: parameters.targetUser || null,
      zone: parameters.zone || null,
      period: parameters.period || null,
      ...parameters,
    };
  }

  requiresConfirmation(result: IntentResponse): boolean {
    return result.requiresConfirmation;
  }

  getErrorMessage(error: string): string {
    const errorMessages: Record<string, string> = {
      'Moteur d\'intelligence artificielle non configure': 'Le moteur IA n\'est pas encore configure.',
      'Message requis pour l\'analyse d\'intention': 'Dis-moi ce que tu veux faire.',
      'Erreur de connexion au serveur': 'Probleme de connexion.',
      'Reponse vide de l\'IA': 'Je n\'ai pas compris.',
    };
    return errorMessages[error] || 'Une erreur est survenue.';
  }

  getSuggestionsByRole(role: string): string[] {
    const suggestions: Record<string, string[]> = {
      marchand: [
        'Combien j\'ai gagne aujourd\'hui ?',
        'Ajouter un produit au panier',
        'Voir mon stock',
        'Fermer ma caisse',
      ],
      producteur: [
        'Declarer ma recolte de cacao',
        'Combien vaut ma recolte ?',
        'Voir mes cycles agricoles',
        'Creer un nouveau cycle',
      ],
      cooperative: [
        'Combien de membres actifs ?',
        'Tresorerie de la cooperative',
        'Creer un achat groupe',
        'Liste des cotisations',
      ],
      identificateur: [
        'Identifier un nouveau producteur',
        'Mes identifications du mois',
        'Valider un dossier',
        'Mes commissions',
      ],
      institution: [
        'Statistiques de la plateforme',
        'Valider un compte',
        'Generer un rapport',
        'Utilisateurs actifs',
      ],
    };
    return suggestions[role] || suggestions.marchand;
  }
}

export const aiIntentService = new AIIntentService();
export default aiIntentService;
