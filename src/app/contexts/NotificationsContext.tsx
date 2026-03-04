/**
 * JULABA — Système de Notifications Unifié v2
 * Un seul provider central, dynamique, par profil, par userId réel.
 * Aucun userId hardcodé. Aucun système parallèle.
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { useApp } from './AppContext';

// ============================================================
// TYPES CENTRAUX
// ============================================================

export type NotifRole =
  | 'marchand'
  | 'producteur'
  | 'cooperative'
  | 'identificateur'
  | 'institution'
  | 'admin';

export type NotifPriority = 'low' | 'medium' | 'high' | 'critical';

export type NotifType =
  // Marchand
  | 'commande_recue'
  | 'paiement_valide'
  | 'paiement_echoue'
  | 'stock_faible'
  | 'document_valide'
  | 'suspension'
  | 'reactivation'
  // Producteur
  | 'nouvelle_commande'
  | 'paiement_recu'
  | 'offre_expiree'
  | 'recolte_proche'
  | 'evaluation_recue'
  // Coopérative
  | 'membre_ajoute'
  | 'contribution_recue'
  | 'paiement_collectif'
  | 'commande_groupee_validee'
  | 'distribution_prete'
  // Identificateur
  | 'dossier_valide'
  | 'dossier_rejete'
  | 'objectif_atteint'
  | 'dossier_assigne'
  // Institution
  | 'pic_transaction'
  | 'baisse_activite'
  | 'nouveau_identificateur'
  | 'dossier_en_attente'
  | 'alerte_fraude'
  // Admin / BO
  | 'creation_acteur'
  | 'modification_critique'
  | 'tentative_acces'
  | 'anomalie_systeme'
  // Universel
  | 'info'
  | 'systeme';

export interface JulabaNotification {
  id: string;
  userId: string;        // Toujours le vrai user.id — jamais hardcodé
  role: NotifRole;
  type: NotifType;
  title: string;
  message: string;
  entityId?: string;
  entityType?: string;   // 'commande' | 'dossier' | 'transaction' | 'membre'...
  isRead: boolean;
  createdAt: string;
  priority: NotifPriority;
  actionLink?: string;
  metadata?: Record<string, any>;
}

// ============================================================
// CONSTANTES VISUELLES (partagées avec le panel)
// ============================================================

export const PRIORITY_CONFIG: Record<NotifPriority, {
  label: string;
  bgUnread: string;
  bgRead: string;
  border: string;
  badge: string;
  dot: string;
}> = {
  critical: {
    label: 'Critique',
    bgUnread: 'bg-red-50',
    bgRead: 'bg-gray-50',
    border: 'border-red-300',
    badge: 'bg-red-600 text-white',
    dot: 'bg-red-500',
  },
  high: {
    label: 'Important',
    bgUnread: 'bg-orange-50',
    bgRead: 'bg-gray-50',
    border: 'border-orange-300',
    badge: 'bg-orange-500 text-white',
    dot: 'bg-orange-500',
  },
  medium: {
    label: 'Normal',
    bgUnread: 'bg-amber-50',
    bgRead: 'bg-gray-50',
    border: 'border-amber-200',
    badge: 'bg-amber-400 text-white',
    dot: 'bg-amber-400',
  },
  low: {
    label: 'Info',
    bgUnread: 'bg-blue-50',
    bgRead: 'bg-gray-50',
    border: 'border-gray-200',
    badge: 'bg-gray-400 text-white',
    dot: 'bg-gray-400',
  },
};

// ============================================================
// GÉNÉRATEUR DE NOTIFICATIONS DE DÉMO (dynamique par userId)
// ============================================================

function makeid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function hoursAgo(h: number) {
  return new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
}

function daysAgo(d: number) {
  return new Date(Date.now() - d * 24 * 60 * 60 * 1000).toISOString();
}

function getDemoNotifications(userId: string, role: NotifRole): JulabaNotification[] {
  const base = { userId, isRead: false };

  switch (role) {
    case 'marchand':
      return [
        {
          ...base, id: makeid('m'), role: 'marchand', type: 'commande_recue',
          title: 'Nouvelle commande reçue',
          message: 'Konan Yao a passé une commande de 50 kg de riz. Total : 32 500 FCFA.',
          priority: 'high', createdAt: hoursAgo(1), entityType: 'commande', entityId: 'CMD-001',
        },
        {
          ...base, id: makeid('m'), role: 'marchand', type: 'paiement_valide',
          title: 'Paiement validé',
          message: 'Votre paiement de 18 000 FCFA pour la commande CMD-0042 a été confirmé.',
          priority: 'medium', createdAt: hoursAgo(3), isRead: true,
        },
        {
          ...base, id: makeid('m'), role: 'marchand', type: 'stock_faible',
          title: 'Stock faible — Plantain',
          message: 'Il vous reste seulement 8 régimes de plantain. Pensez à vous réapprovisionner.',
          priority: 'high', createdAt: hoursAgo(5),
        },
        {
          ...base, id: makeid('m'), role: 'marchand', type: 'document_valide',
          title: 'Document validé',
          message: 'Votre carte de commerçant a été validée par le Back Office. Bravo !',
          priority: 'medium', createdAt: daysAgo(1), isRead: true,
        },
        {
          ...base, id: makeid('m'), role: 'marchand', type: 'paiement_echoue',
          title: 'Paiement échoué',
          message: 'Le paiement de Fatou Koné (15 000 FCFA) a échoué. Contactez le client.',
          priority: 'critical', createdAt: hoursAgo(2),
        },
      ];

    case 'producteur':
      return [
        {
          ...base, id: makeid('p'), role: 'producteur', type: 'nouvelle_commande',
          title: 'Commande reçue',
          message: 'La coopérative COOP IVOIRE VIVRIER commande 200 kg de maïs. Répondez vite !',
          priority: 'high', createdAt: hoursAgo(2), entityType: 'commande',
        },
        {
          ...base, id: makeid('p'), role: 'producteur', type: 'paiement_recu',
          title: 'Paiement reçu',
          message: 'Vous avez reçu 45 000 FCFA pour votre livraison de sorgho du 28 février.',
          priority: 'medium', createdAt: hoursAgo(6), isRead: true,
        },
        {
          ...base, id: makeid('p'), role: 'producteur', type: 'recolte_proche',
          title: 'Récolte dans 5 jours',
          message: 'Votre cycle de maïs touche à sa fin. Pensez à préparer votre déclaration.',
          priority: 'high', createdAt: daysAgo(1),
        },
        {
          ...base, id: makeid('p'), role: 'producteur', type: 'evaluation_recue',
          title: 'Nouvelle évaluation',
          message: 'Vous avez reçu 5 étoiles de la coopérative COOP SAN PEDRO. Excellent travail !',
          priority: 'low', createdAt: daysAgo(2), isRead: true,
        },
        {
          ...base, id: makeid('p'), role: 'producteur', type: 'offre_expiree',
          title: 'Offre expirée',
          message: 'Votre offre de vente de 100 kg de manioc a expiré sans acheteur. Renouvelez-la.',
          priority: 'medium', createdAt: daysAgo(3),
        },
      ];

    case 'cooperative':
      return [
        {
          ...base, id: makeid('c'), role: 'cooperative', type: 'membre_ajoute',
          title: 'Nouveau membre',
          message: 'Awa Traoré a rejoint votre coopérative. Elle est maintenant active.',
          priority: 'medium', createdAt: hoursAgo(2),
        },
        {
          ...base, id: makeid('c'), role: 'cooperative', type: 'contribution_recue',
          title: 'Contribution reçue',
          message: 'Koffi Jean a versé sa contribution mensuelle de 5 000 FCFA.',
          priority: 'low', createdAt: hoursAgo(4), isRead: true,
        },
        {
          ...base, id: makeid('c'), role: 'cooperative', type: 'commande_groupee_validee',
          title: 'Commande groupée validée',
          message: 'Votre commande groupée de 1 500 kg de riz local a été validée. Livraison demain.',
          priority: 'high', createdAt: hoursAgo(1),
        },
        {
          ...base, id: makeid('c'), role: 'cooperative', type: 'paiement_collectif',
          title: 'Paiement collectif complété',
          message: 'Les 12 membres ont payé leur cotisation. Total collecté : 60 000 FCFA.',
          priority: 'medium', createdAt: daysAgo(1), isRead: true,
        },
        {
          ...base, id: makeid('c'), role: 'cooperative', type: 'distribution_prete',
          title: 'Distribution prête',
          message: 'Le lot de 800 kg de manioc est prêt à être distribué aux membres.',
          priority: 'high', createdAt: hoursAgo(3),
        },
      ];

    case 'identificateur':
      return [
        {
          ...base, id: makeid('i'), role: 'identificateur', type: 'dossier_valide',
          title: 'Dossier validé par le BO',
          message: 'La fiche de Fatou KONÉ (Marchand) a été validée par KOFFI Jean-Baptiste. Son compte est maintenant actif.',
          priority: 'high', createdAt: hoursAgo(1), entityId: 'MARCH-2026-0001', entityType: 'dossier',
          metadata: { numeroFiche: 'MARCH-2026-0001', typeActeur: 'marchand' },
        },
        {
          ...base, id: makeid('i'), role: 'identificateur', type: 'dossier_rejete',
          title: 'Dossier rejeté — Action requise',
          message: 'La fiche de Aïcha DIOMANDÉ (Marchand) — N° MARCH-2026-0002 — a été rejetée. Raisons : Photo de mauvaise qualité, Géolocalisation manquante.',
          priority: 'critical', createdAt: hoursAgo(3), entityId: 'MARCH-2026-0002', entityType: 'dossier',
          metadata: { numeroFiche: 'MARCH-2026-0002', raisons: ['Photo de mauvaise qualité', 'Géolocalisation manquante'] },
        },
        {
          ...base, id: makeid('i'), role: 'identificateur', type: 'objectif_atteint',
          title: 'Objectif du mois atteint',
          message: 'Bravo ! Vous avez identifié 10 acteurs ce mois-ci. Votre bonus est validé.',
          priority: 'medium', createdAt: daysAgo(1), isRead: true,
        },
        {
          ...base, id: makeid('i'), role: 'identificateur', type: 'dossier_assigne',
          title: 'Nouveau dossier assigné',
          message: 'Un nouveau dossier de Producteur vous a été assigné dans votre zone Marcory.',
          priority: 'medium', createdAt: hoursAgo(5),
        },
      ];

    case 'institution':
      return [
        {
          ...base, id: makeid('inst'), role: 'institution', type: 'pic_transaction',
          title: 'Pic de transactions anormal',
          message: 'La région d\'Abidjan enregistre +340% de transactions ce matin. Analyse recommandée.',
          priority: 'critical', createdAt: hoursAgo(1),
          metadata: { region: 'Abidjan', variation: '+340%' },
        },
        {
          ...base, id: makeid('inst'), role: 'institution', type: 'baisse_activite',
          title: 'Forte baisse d\'activité — Bouaké',
          message: 'La zone de Bouaké affiche -65% d\'activité cette semaine. Vérification nécessaire.',
          priority: 'high', createdAt: hoursAgo(4),
        },
        {
          ...base, id: makeid('inst'), role: 'institution', type: 'nouveau_identificateur',
          title: 'Nouvel identificateur créé',
          message: 'Un nouveau compte identificateur a été créé pour la zone de Yamoussoukro.',
          priority: 'low', createdAt: daysAgo(1), isRead: true,
        },
        {
          ...base, id: makeid('inst'), role: 'institution', type: 'dossier_en_attente',
          title: '14 dossiers en attente depuis 7 jours',
          message: 'Ces dossiers bloqués nécessitent une action urgente du Back Office.',
          priority: 'high', createdAt: hoursAgo(2),
        },
        {
          ...base, id: makeid('inst'), role: 'institution', type: 'alerte_fraude',
          title: 'Alerte fraude détectée',
          message: 'Tentative de transaction suspecte de 2 500 000 FCFA détectée. Dossier : MARCH-2026-0089.',
          priority: 'critical', createdAt: hoursAgo(0.5),
        },
      ];

    case 'admin':
      return [
        {
          ...base, id: makeid('a'), role: 'admin', type: 'creation_acteur',
          title: 'Nouvel acteur créé',
          message: '15 nouveaux comptes acteurs ont été créés aujourd\'hui.',
          priority: 'low', createdAt: hoursAgo(2), isRead: true,
        },
        {
          ...base, id: makeid('a'), role: 'admin', type: 'tentative_acces',
          title: 'Tentative d\'accès non autorisée',
          message: '3 tentatives d\'accès au Back Office depuis une IP inconnue (41.202.x.x).',
          priority: 'critical', createdAt: hoursAgo(1),
        },
        {
          ...base, id: makeid('a'), role: 'admin', type: 'anomalie_systeme',
          title: 'Anomalie système',
          message: 'Le module de synchronisation signale 12 erreurs consécutives depuis 06h00.',
          priority: 'high', createdAt: hoursAgo(3),
        },
      ];

    default:
      return [];
  }
}

// ============================================================
// FONCTIONS MOTEUR (déclencheurs métier)
// ============================================================

function buildNotif(
  userId: string,
  role: NotifRole,
  type: NotifType,
  title: string,
  message: string,
  priority: NotifPriority,
  extra: Partial<JulabaNotification> = {}
): JulabaNotification {
  return {
    id: makeid('notif'),
    userId,
    role,
    type,
    title,
    message,
    priority,
    isRead: false,
    createdAt: new Date().toISOString(),
    ...extra,
  };
}

// ============================================================
// CONTEXTE
// ============================================================

interface NotificationsContextType {
  // Lecture
  getNotificationsForUser: (userId: string) => JulabaNotification[];
  getUnreadCount: (userId: string) => number;
  // Actions lecture
  markAsRead: (notifId: string) => void;
  markAllAsRead: (userId: string) => void;
  deleteNotif: (notifId: string) => void;
  // Ajout manuel
  addNotification: (notif: JulabaNotification) => void;

  // ── Déclencheurs métier ──────────────────────────────────
  // Commun
  triggerInfo: (userId: string, role: NotifRole, title: string, message: string) => void;
  triggerSuspension: (userId: string, role: NotifRole, raison: string) => void;
  triggerReactivation: (userId: string, role: NotifRole) => void;
  // Marchand
  triggerCommandeRecueMarchand: (userId: string, acheteur: string, produit: string, montant: number) => void;
  triggerPaiementValideMarchand: (userId: string, montant: number, refCommande: string) => void;
  triggerPaiementEchoueMarchand: (userId: string, client: string, montant: number) => void;
  triggerStockFaible: (userId: string, produit: string, quantite: number, unite: string) => void;
  // Producteur
  triggerCommandeRecueProducteur: (userId: string, acheteur: string, produit: string, quantite: number) => void;
  triggerPaiementRecuProducteur: (userId: string, montant: number, produit: string) => void;
  triggerRecolteProche: (userId: string, produit: string, joursRestants: number) => void;
  // Coopérative
  triggerMembreAjoute: (userId: string, nomMembre: string) => void;
  triggerCommandeGroupeeValidee: (userId: string, produit: string, quantite: number) => void;
  triggerDistributionPrete: (userId: string, produit: string, quantite: number) => void;
  // Identificateur
  triggerDossierValide: (params: {
    identificateurId: string;
    prenomActeur: string;
    nomActeur: string;
    typeActeur: 'marchand' | 'producteur';
    numeroFiche: string;
    nomAgentBO: string;
  }) => void;
  triggerDossierRejete: (params: {
    identificateurId: string;
    prenomActeur: string;
    nomActeur: string;
    typeActeur: 'marchand' | 'producteur';
    numeroFiche: string;
    nomAgentBO: string;
    raisons: string[];
  }) => void;
  triggerDossierAssigne: (userId: string, zone: string) => void;
  triggerObjectifAtteint: (userId: string, nombre: number) => void;
  // Institution
  triggerPicTransaction: (userId: string, region: string, variation: string) => void;
  triggerBaisseActivite: (userId: string, region: string, variation: string) => void;
  triggerAlerteFraude: (userId: string, montant: number, numeroDossier: string) => void;
  // Admin
  triggerTentativeAcces: (userId: string, ip: string, nbTentatives: number) => void;
  triggerAnomalieSysteme: (userId: string, module: string, nbErreurs: number) => void;
}

const NotificationsContext = createContext<NotificationsContextType | null>(null);

const STORAGE_KEY_PREFIX = 'julaba_notifs_v2_';  // scopé par userId
const DEMO_GENERATED_KEY = 'julaba_notifs_demo_generated';

function getStorageKey(userId: string): string {
  // Clé unique par utilisateur → isolation totale entre comptes sur même device
  return `${STORAGE_KEY_PREFIX}${userId}`;
}

function loadFromStorage(userId: string): JulabaNotification[] {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (!raw) return [];
    return JSON.parse(raw) as JulabaNotification[];
  } catch {
    return [];
  }
}

function saveToStorage(userId: string, notifs: JulabaNotification[]) {
  if (!userId) return;
  try {
    // Garder max 30 jours ET toujours les non-lues critiques
    const limit = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const trimmed = notifs.filter(n =>
      n.createdAt > limit ||
      (n.priority === 'critical' && !n.isRead) // critiques non-lues : conservation illimitée
    );
    localStorage.setItem(getStorageKey(userId), JSON.stringify(trimmed));
  } catch (e: any) {
    // Quota dépassé : on tente un nettoyage d'urgence (garder 50 plus récentes)
    try {
      const emergency = notifs
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 50);
      localStorage.setItem(getStorageKey(userId), JSON.stringify(emergency));
    } catch {
      // Si même ça échoue, on abandonne sans crasher
      console.warn('JULABA Notifications: localStorage quota dépassé, données non sauvegardées.');
    }
  }
}

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useApp();
  const currentUserId = user?.id || '';

  // État initialisé VIDE — chargement réel dans l'effect userId
  const [allNotifs, setAllNotifs] = useState<JulabaNotification[]>([]);
  const generatedRef = useRef<Set<string>>(new Set(
    JSON.parse(localStorage.getItem(DEMO_GENERATED_KEY) || '[]')
  ));
  // Track l'userId précédent pour détecter un changement de compte
  const prevUserIdRef = useRef<string>('');

  // ── Chargement/déchargement au changement d'userId ──────────
  useEffect(() => {
    if (currentUserId === prevUserIdRef.current) return;
    prevUserIdRef.current = currentUserId;

    if (!currentUserId) {
      // Déconnexion → vider la mémoire
      setAllNotifs([]);
      return;
    }

    // Nouvel utilisateur → charger SES données uniquement
    const userNotifs = loadFromStorage(currentUserId);
    setAllNotifs(userNotifs);
  }, [currentUserId]);

  // ── Génération des notifs démo (une seule fois par userId) ──
  useEffect(() => {
    if (!currentUserId || !user?.role) return;
    if (generatedRef.current.has(currentUserId)) return;

    const role = user.role as NotifRole;
    const demos = getDemoNotifications(currentUserId, role);

    setAllNotifs(prev => {
      const updated = [...demos, ...prev];
      saveToStorage(currentUserId, updated);
      return updated;
    });

    generatedRef.current.add(currentUserId);
    localStorage.setItem(DEMO_GENERATED_KEY, JSON.stringify([...generatedRef.current]));
  }, [currentUserId, user?.role]);

  // ── Persistance auto (scopée userId) ────────────────────────
  useEffect(() => {
    if (!currentUserId) return;
    saveToStorage(currentUserId, allNotifs);
  }, [allNotifs, currentUserId]);

  // ── Synchronisation multi-onglets ───────────────────────────
  useEffect(() => {
    if (!currentUserId) return;

    const handleStorageEvent = (event: StorageEvent) => {
      if (event.key === getStorageKey(currentUserId) && event.newValue) {
        try {
          const updated = JSON.parse(event.newValue) as JulabaNotification[];
          setAllNotifs(updated);
        } catch {
          // ignore parse errors
        }
      }
    };

    window.addEventListener('storage', handleStorageEvent);
    return () => window.removeEventListener('storage', handleStorageEvent);
  }, [currentUserId]);

  // ── Lecture ────────────────────────────────────────────────

  const getNotificationsForUser = useCallback((userId: string): JulabaNotification[] => {
    return allNotifs
      .filter(n => n.userId === userId)
      .sort((a, b) => {
        // Critiques non lues toujours en premier
        const priorityOrder: Record<NotifPriority, number> = { critical: 0, high: 1, medium: 2, low: 3 };
        if (!a.isRead && b.isRead) return -1;
        if (a.isRead && !b.isRead) return 1;
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [allNotifs]);

  const getUnreadCount = useCallback((userId: string): number => {
    return allNotifs.filter(n => n.userId === userId && !n.isRead).length;
  }, [allNotifs]);

  // ── Actions ────────────────────────────────────────────────

  const addNotification = useCallback((notif: JulabaNotification) => {
    setAllNotifs(prev => [notif, ...prev]);
  }, []);

  const markAsRead = useCallback((notifId: string) => {
    setAllNotifs(prev => prev.map(n => n.id === notifId ? { ...n, isRead: true } : n));
  }, []);

  const markAllAsRead = useCallback((userId: string) => {
    setAllNotifs(prev => prev.map(n => n.userId === userId ? { ...n, isRead: true } : n));
  }, []);

  const deleteNotif = useCallback((notifId: string) => {
    setAllNotifs(prev => prev.filter(n => n.id !== notifId));
  }, []);

  // ── Déclencheurs métier ────────────────────────────────────

  const triggerInfo = useCallback((userId: string, role: NotifRole, title: string, message: string) => {
    addNotification(buildNotif(userId, role, 'info', title, message, 'low'));
  }, [addNotification]);

  const triggerSuspension = useCallback((userId: string, role: NotifRole, raison: string) => {
    addNotification(buildNotif(userId, role, 'suspension',
      'Votre compte est suspendu',
      `Votre compte a été suspendu. Raison : ${raison}. Contactez le support.`,
      'critical'));
  }, [addNotification]);

  const triggerReactivation = useCallback((userId: string, role: NotifRole) => {
    addNotification(buildNotif(userId, role, 'reactivation',
      'Compte réactivé',
      'Bonne nouvelle ! Votre compte est à nouveau actif. Vous pouvez utiliser JULABA normalement.',
      'high'));
  }, [addNotification]);

  // Marchand
  const triggerCommandeRecueMarchand = useCallback((userId: string, acheteur: string, produit: string, montant: number) => {
    addNotification(buildNotif(userId, 'marchand', 'commande_recue',
      'Nouvelle commande reçue',
      `${acheteur} a commandé ${produit}. Total : ${montant.toLocaleString('fr-FR')} FCFA.`,
      'high', { entityType: 'commande' }));
  }, [addNotification]);

  const triggerPaiementValideMarchand = useCallback((userId: string, montant: number, refCommande: string) => {
    addNotification(buildNotif(userId, 'marchand', 'paiement_valide',
      'Paiement validé',
      `Votre paiement de ${montant.toLocaleString('fr-FR')} FCFA pour ${refCommande} a été confirmé.`,
      'medium', { entityType: 'transaction' }));
  }, [addNotification]);

  const triggerPaiementEchoueMarchand = useCallback((userId: string, client: string, montant: number) => {
    addNotification(buildNotif(userId, 'marchand', 'paiement_echoue',
      'Paiement échoué',
      `Le paiement de ${client} (${montant.toLocaleString('fr-FR')} FCFA) a échoué. Contactez le client.`,
      'critical'));
  }, [addNotification]);

  const triggerStockFaible = useCallback((userId: string, produit: string, quantite: number, unite: string) => {
    addNotification(buildNotif(userId, 'marchand', 'stock_faible',
      `Stock faible — ${produit}`,
      `Il vous reste seulement ${quantite} ${unite} de ${produit}. Pensez à vous réapprovisionner.`,
      'high'));
  }, [addNotification]);

  // Producteur
  const triggerCommandeRecueProducteur = useCallback((userId: string, acheteur: string, produit: string, quantite: number) => {
    addNotification(buildNotif(userId, 'producteur', 'nouvelle_commande',
      'Nouvelle commande',
      `${acheteur} commande ${quantite} kg de ${produit}. Répondez rapidement !`,
      'high', { entityType: 'commande' }));
  }, [addNotification]);

  const triggerPaiementRecuProducteur = useCallback((userId: string, montant: number, produit: string) => {
    addNotification(buildNotif(userId, 'producteur', 'paiement_recu',
      'Paiement reçu',
      `Vous avez reçu ${montant.toLocaleString('fr-FR')} FCFA pour votre livraison de ${produit}.`,
      'medium'));
  }, [addNotification]);

  const triggerRecolteProche = useCallback((userId: string, produit: string, joursRestants: number) => {
    addNotification(buildNotif(userId, 'producteur', 'recolte_proche',
      `Récolte dans ${joursRestants} jours`,
      `Votre cycle de ${produit} touche à sa fin. Préparez votre déclaration de récolte.`,
      'high'));
  }, [addNotification]);

  // Coopérative
  const triggerMembreAjoute = useCallback((userId: string, nomMembre: string) => {
    addNotification(buildNotif(userId, 'cooperative', 'membre_ajoute',
      'Nouveau membre',
      `${nomMembre} a rejoint votre coopérative. Elle est maintenant active.`,
      'medium', { entityType: 'membre' }));
  }, [addNotification]);

  const triggerCommandeGroupeeValidee = useCallback((userId: string, produit: string, quantite: number) => {
    addNotification(buildNotif(userId, 'cooperative', 'commande_groupee_validee',
      'Commande groupée validée',
      `Votre commande groupée de ${quantite} kg de ${produit} a été validée. Livraison prévue demain.`,
      'high', { entityType: 'commande' }));
  }, [addNotification]);

  const triggerDistributionPrete = useCallback((userId: string, produit: string, quantite: number) => {
    addNotification(buildNotif(userId, 'cooperative', 'distribution_prete',
      'Distribution prête',
      `Le lot de ${quantite} kg de ${produit} est prêt. Informez vos membres.`,
      'high'));
  }, [addNotification]);

  // Identificateur
  const triggerDossierValide = useCallback((params: {
    identificateurId: string;
    prenomActeur: string;
    nomActeur: string;
    typeActeur: 'marchand' | 'producteur';
    numeroFiche: string;
    nomAgentBO: string;
  }) => {
    const typeLabel = params.typeActeur === 'marchand' ? 'Marchand' : 'Producteur';
    addNotification(buildNotif(
      params.identificateurId, 'identificateur', 'dossier_valide',
      'Dossier validé par le Back Office',
      `La fiche de ${params.prenomActeur} ${params.nomActeur} (${typeLabel}) a été validée par ${params.nomAgentBO}. Son compte JULABA est maintenant actif.`,
      'high', {
        entityId: params.numeroFiche,
        entityType: 'dossier',
        metadata: { numeroFiche: params.numeroFiche, typeActeur: params.typeActeur, nomAgentBO: params.nomAgentBO },
      }
    ));
  }, [addNotification]);

  const triggerDossierRejete = useCallback((params: {
    identificateurId: string;
    prenomActeur: string;
    nomActeur: string;
    typeActeur: 'marchand' | 'producteur';
    numeroFiche: string;
    nomAgentBO: string;
    raisons: string[];
  }) => {
    const typeLabel = params.typeActeur === 'marchand' ? 'Marchand' : 'Producteur';
    addNotification(buildNotif(
      params.identificateurId, 'identificateur', 'dossier_rejete',
      'Dossier rejeté — Action requise',
      `La fiche de ${params.prenomActeur} ${params.nomActeur} (${typeLabel}) — N° ${params.numeroFiche} — a été rejetée par ${params.nomAgentBO}.\n\nRaison(s) :\n${params.raisons.map(r => `• ${r}`).join('\n')}\n\nReprenez contact avec la personne.`,
      'critical', {
        entityId: params.numeroFiche,
        entityType: 'dossier',
        metadata: { numeroFiche: params.numeroFiche, raisons: params.raisons },
      }
    ));
  }, [addNotification]);

  const triggerDossierAssigne = useCallback((userId: string, zone: string) => {
    addNotification(buildNotif(userId, 'identificateur', 'dossier_assigne',
      'Nouveau dossier assigné',
      `Un nouveau dossier d\'acteur vous a été assigné dans votre zone ${zone}.`,
      'medium', { entityType: 'dossier' }));
  }, [addNotification]);

  const triggerObjectifAtteint = useCallback((userId: string, nombre: number) => {
    addNotification(buildNotif(userId, 'identificateur', 'objectif_atteint',
      'Objectif du mois atteint',
      `Bravo ! Vous avez identifié ${nombre} acteurs ce mois-ci. Votre bonus est validé.`,
      'medium'));
  }, [addNotification]);

  // Institution
  const triggerPicTransaction = useCallback((userId: string, region: string, variation: string) => {
    addNotification(buildNotif(userId, 'institution', 'pic_transaction',
      'Pic de transactions anormal',
      `La région ${region} enregistre ${variation} de transactions. Analyse recommandée.`,
      'critical', { metadata: { region, variation } }));
  }, [addNotification]);

  const triggerBaisseActivite = useCallback((userId: string, region: string, variation: string) => {
    addNotification(buildNotif(userId, 'institution', 'baisse_activite',
      `Forte baisse d\'activité — ${region}`,
      `La zone de ${region} affiche ${variation} d\'activité cette semaine. Vérification nécessaire.`,
      'high', { metadata: { region, variation } }));
  }, [addNotification]);

  const triggerAlerteFraude = useCallback((userId: string, montant: number, numeroDossier: string) => {
    addNotification(buildNotif(userId, 'institution', 'alerte_fraude',
      'Alerte fraude détectée',
      `Transaction suspecte de ${montant.toLocaleString('fr-FR')} FCFA détectée. Dossier : ${numeroDossier}.`,
      'critical', { entityId: numeroDossier, entityType: 'transaction' }));
  }, [addNotification]);

  // Admin
  const triggerTentativeAcces = useCallback((userId: string, ip: string, nbTentatives: number) => {
    addNotification(buildNotif(userId, 'admin', 'tentative_acces',
      'Tentative d\'accès non autorisée',
      `${nbTentatives} tentatives d\'accès au Back Office depuis l\'IP ${ip}.`,
      'critical'));
  }, [addNotification]);

  const triggerAnomalieSysteme = useCallback((userId: string, module: string, nbErreurs: number) => {
    addNotification(buildNotif(userId, 'admin', 'anomalie_systeme',
      'Anomalie système',
      `Le module ${module} signale ${nbErreurs} erreurs consécutives.`,
      'high'));
  }, [addNotification]);

  // ── Valeur exposée ─────────────────────────────────────────

  const value: NotificationsContextType = {
    getNotificationsForUser,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotif,
    addNotification,
    triggerInfo,
    triggerSuspension,
    triggerReactivation,
    triggerCommandeRecueMarchand,
    triggerPaiementValideMarchand,
    triggerPaiementEchoueMarchand,
    triggerStockFaible,
    triggerCommandeRecueProducteur,
    triggerPaiementRecuProducteur,
    triggerRecolteProche,
    triggerMembreAjoute,
    triggerCommandeGroupeeValidee,
    triggerDistributionPrete,
    triggerDossierValide,
    triggerDossierRejete,
    triggerDossierAssigne,
    triggerObjectifAtteint,
    triggerPicTransaction,
    triggerBaisseActivite,
    triggerAlerteFraude,
    triggerTentativeAcces,
    triggerAnomalieSysteme,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications(): NotificationsContextType {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications doit être utilisé dans NotificationsProvider');
  return ctx;
}