/**
 * Routes Back-Office JÙLABA
 * Gestion centralisée des données BO — 100% connecté à Supabase
 */

import { Context } from "npm:hono";
import * as kv from "./kv_store.tsx";
import { sharedSupabase as supabase, validateUserJWT } from "./auth-helper.ts";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type BORoleType = 'super_admin' | 'admin_national' | 'gestionnaire_zone' | 'analyste';

export interface BOActeur {
  id: string;
  nom: string;
  prenoms: string;
  telephone: string;
  type: 'marchand' | 'producteur' | 'cooperative' | 'institution' | 'identificateur';
  region: string;
  commune: string;
  statut: 'actif' | 'suspendu' | 'en_attente' | 'rejete';
  dateInscription: string;
  score: number;
  transactionsTotal: number;
  volumeTotal: number;
  validated: boolean;
  identificateurId?: string;
  zone?: string;
  activite?: string;
  email?: string;
  cni?: string;
}

export interface BODossier {
  id: string;
  acteurId: string;
  acteurNom: string;
  acteurType: BOActeur['type'];
  statut: 'draft' | 'pending' | 'approved' | 'rejected' | 'complement';
  dateCreation: string;
  dateModification: string;
  identificateurNom: string;
  region: string;
  motifRejet?: string;
  documents: string[];
}

export interface BOTransaction {
  id: string;
  acteurNom: string;
  acteurType: string;
  produit: string;
  quantite: string;
  montant: number;
  commission: number;
  statut: 'validee' | 'en_cours' | 'gelee' | 'annulee' | 'litige';
  date: string;
  region: string;
  modePaiement: string;
}

export interface BOZone {
  id: string;
  nom: string;
  region: string;
  gestionnaire?: string;
  nbActeurs: number;
  nbIdentificateurs: number;
  volumeTotal: number;
  tauxActivite: number;
  statut: 'active' | 'inactive';
}

export interface BOCommission {
  id: string;
  identificateurNom: string;
  periode: string;
  nbDossiers: number;
  montantTotal: number;
  statut: 'en_attente' | 'payee' | 'validee';
  date: string;
}

export interface BOAuditLog {
  id: string;
  action: string;
  utilisateurBO: string;
  roleBO: BORoleType;
  acteurImpacte?: string;
  ancienneValeur?: string;
  nouvelleValeur?: string;
  date: string;
  ip: string;
  module: string;
}

export interface InstitutionBO {
  id: string;
  nom: string;
  type: 'cnps' | 'bni' | 'ministere' | 'anader' | 'ong' | 'autre';
  region: string;
  email: string;
  referentNom: string;
  referentTelephone: string;
  statut: 'actif' | 'suspendu';
  dateCreation: string;
  modules: {
    dashboard: 'aucun' | 'lecture' | 'complet';
    analytics: 'aucun' | 'lecture' | 'complet';
    acteurs: 'aucun' | 'lecture' | 'complet';
    supervision: 'aucun' | 'lecture' | 'complet';
    audit: 'aucun' | 'lecture' | 'complet';
    export: 'aucun' | 'lecture' | 'complet';
  };
  creePar: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Auth helper interne
// ─────────────────────────────────────────────────────────────────────────────

async function checkAuthBO(c: Context, requiredRole?: BORoleType[]): Promise<{ authorized: boolean; user?: any; error?: string }> {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];

  if (!accessToken) {
    return { authorized: false, error: 'Token manquant' };
  }

  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  if (accessToken === supabaseAnonKey) {
    return { authorized: false, error: 'Token anonyme non autorise pour le Back-Office' };
  }

  // Validation JWT via client anon (évite "Invalid JWT" avec service role key)
  const { user: userProfile, error: validationError } = await validateUserJWT(accessToken);

  if (!userProfile) {
    console.log('[checkAuthBO] Echec validation JWT:', validationError);
    return { authorized: false, error: validationError || 'Token invalide' };
  }

  const boRoles: BORoleType[] = ['super_admin', 'admin_national', 'gestionnaire_zone', 'analyste'];
  if (!boRoles.includes(userProfile.role)) {
    return { authorized: false, error: 'Acces refuse - role insuffisant' };
  }

  if (requiredRole && !requiredRole.includes(userProfile.role)) {
    return { authorized: false, error: `Permissions insuffisantes. Role requis: ${requiredRole.join(' ou ')}. Votre role: ${userProfile.role}` };
  }

  return { authorized: true, user: userProfile };
}

// ─────────────────────────────────────────────────────────────────────────────
// Audit Log — écrit dans la table audit_logs Supabase
// ─────────────────────────────────────────────────────────────────────────────

async function addAuditLog(log: Omit<BOAuditLog, 'id' | 'date'> & { userId?: string }) {
  try {
    await supabase.from('audit_logs').insert({
      user_id: log.userId || null,
      role: log.roleBO,
      action: log.action,
      description: `${log.acteurImpacte || ''}: ${log.ancienneValeur || ''} → ${log.nouvelleValeur || ''}`.trim(),
      severity: 'info',
      entity_type: log.module,
      metadata: {
        utilisateurBO: log.utilisateurBO,
        roleBO: log.roleBO,
        ancienneValeur: log.ancienneValeur,
        nouvelleValeur: log.nouvelleValeur,
        ip: log.ip,
        module: log.module,
        acteurImpacte: log.acteurImpacte,
      },
    });
  } catch (err) {
    console.log('[addAuditLog] Erreur insertion audit_logs:', err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES : Acteurs (table users_julaba)
// ─────────────────────────────────────────────────────────────────────────────

export async function getActeurs(c: Context) {
  const auth = await checkAuthBO(c);
  if (!auth.authorized) return c.json({ error: auth.error }, 401);

  try {
    const { data: users, error } = await supabase
      .from('users_julaba')
      .select('*')
      .in('role', ['marchand', 'producteur', 'cooperative', 'institution', 'identificateur'])
      .order('created_at', { ascending: false });

    if (error) {
      console.log('[getActeurs] DB error:', error.message);
      return c.json({ error: 'Erreur lors du chargement des acteurs', details: error.message }, 500);
    }

    const acteurs: BOActeur[] = (users || []).map(user => ({
      id: user.id,
      nom: user.last_name || '',
      prenoms: user.first_name || '',
      telephone: user.phone,
      type: user.role,
      region: user.region || '',
      commune: user.commune || '',
      statut: user.validated ? 'actif' : 'en_attente',
      dateInscription: user.created_at,
      score: user.score || 0,
      transactionsTotal: 0,
      volumeTotal: 0,
      validated: user.validated,
      zone: user.region,
      activite: user.activity,
      email: `${user.phone}@julaba.local`,
      cni: user.cni_number,
    }));

    return c.json({ acteurs });
  } catch (error) {
    console.log('[getActeurs] Error:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

export async function updateActeurStatut(c: Context) {
  const auth = await checkAuthBO(c, ['super_admin', 'admin_national', 'gestionnaire_zone']);
  if (!auth.authorized) return c.json({ error: auth.error }, 401);

  try {
    const acteurId = c.req.param('id');
    const { statut, logAction } = await c.req.json();

    if (!statut || !['actif', 'suspendu', 'en_attente', 'rejete'].includes(statut)) {
      return c.json({ error: 'Statut invalide' }, 400);
    }

    const { data: acteur, error: fetchError } = await supabase
      .from('users_julaba')
      .select('*')
      .eq('id', acteurId)
      .single();

    if (fetchError || !acteur) return c.json({ error: 'Acteur introuvable' }, 404);

    const validated = statut === 'actif';
    const { error: updateError } = await supabase
      .from('users_julaba')
      .update({ validated })
      .eq('id', acteurId);

    if (updateError) {
      console.log('[updateActeurStatut] DB error:', updateError.message);
      return c.json({ error: 'Erreur lors de la mise à jour', details: updateError.message }, 500);
    }

    await addAuditLog({
      userId: auth.user.id,
      action: logAction || `MODIFICATION statut → ${statut}`,
      utilisateurBO: `${auth.user.first_name} ${auth.user.last_name}`,
      roleBO: auth.user.role,
      acteurImpacte: `${acteur.first_name} ${acteur.last_name}`,
      ancienneValeur: acteur.validated ? 'actif' : 'en_attente',
      nouvelleValeur: statut,
      ip: c.req.header('x-forwarded-for') || 'unknown',
      module: 'Acteurs',
    });

    return c.json({ success: true, statut });
  } catch (error) {
    console.log('[updateActeurStatut] Error:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES : Dossiers (table identifications)
// ─────────────────────────────────────────────────────────────────────────────

export async function getDossiers(c: Context) {
  const auth = await checkAuthBO(c);
  if (!auth.authorized) return c.json({ error: auth.error }, 401);

  try {
    const { data: rows, error } = await supabase
      .from('identifications')
      .select(`
        id,
        statut,
        type_acteur,
        documents,
        date_identification,
        created_at,
        acteur:users_julaba!acteur_id(id, first_name, last_name, role, region),
        identificateur:users_julaba!identificateur_id(id, first_name, last_name)
      `)
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) {
      console.log('[getDossiers] DB error:', error.message);
      return c.json({ error: 'Erreur lors du chargement des dossiers', details: error.message }, 500);
    }

    const statutMap: Record<string, BODossier['statut']> = {
      en_attente: 'pending',
      valide: 'approved',
      approuve: 'approved',
      rejete: 'rejected',
      complement: 'complement',
      draft: 'draft',
    };

    const dossiers: BODossier[] = (rows || []).map(row => {
      const acteur = row.acteur as any;
      const identificateur = row.identificateur as any;
      return {
        id: row.id,
        acteurId: acteur?.id || '',
        acteurNom: acteur ? `${acteur.first_name || ''} ${acteur.last_name || ''}`.trim() : 'Inconnu',
        acteurType: (acteur?.role || row.type_acteur || 'marchand') as BOActeur['type'],
        statut: statutMap[row.statut] || 'pending',
        dateCreation: row.created_at || row.date_identification,
        dateModification: row.created_at || row.date_identification,
        identificateurNom: identificateur
          ? `${identificateur.first_name || ''} ${identificateur.last_name || ''}`.trim()
          : 'Non assigné',
        region: acteur?.region || '',
        documents: Array.isArray(row.documents) ? row.documents : [],
      };
    });

    return c.json({ dossiers });
  } catch (error) {
    console.log('[getDossiers] Error:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

export async function updateDossierStatut(c: Context) {
  const auth = await checkAuthBO(c, ['super_admin', 'admin_national', 'gestionnaire_zone']);
  if (!auth.authorized) return c.json({ error: auth.error }, 401);

  try {
    const dossierId = c.req.param('id');
    const { statut, motif } = await c.req.json();

    const { data: dossier, error: fetchError } = await supabase
      .from('identifications')
      .select('id, statut, acteur_id')
      .eq('id', dossierId)
      .single();

    if (fetchError || !dossier) return c.json({ error: 'Dossier introuvable' }, 404);

    const statutMapReverse: Record<string, string> = {
      approved: 'valide',
      rejected: 'rejete',
      complement: 'complement',
      pending: 'en_attente',
      draft: 'draft',
    };
    const dbStatut = statutMapReverse[statut] || statut;

    const updateData: any = { statut: dbStatut };
    if (motif) updateData.motif_rejet = motif;

    const { error: updateError } = await supabase
      .from('identifications')
      .update(updateData)
      .eq('id', dossierId);

    if (updateError) {
      console.log('[updateDossierStatut] DB error:', updateError.message);
      return c.json({ error: 'Erreur lors de la mise à jour', details: updateError.message }, 500);
    }

    // Si approuvé, valider l'acteur
    if (statut === 'approved' && dossier.acteur_id) {
      await supabase
        .from('users_julaba')
        .update({ validated: true })
        .eq('id', dossier.acteur_id);
    }

    await addAuditLog({
      userId: auth.user.id,
      action: `${statut.toUpperCase()} dossier`,
      utilisateurBO: `${auth.user.first_name} ${auth.user.last_name}`,
      roleBO: auth.user.role,
      acteurImpacte: dossierId,
      ancienneValeur: dossier.statut,
      nouvelleValeur: dbStatut,
      ip: c.req.header('x-forwarded-for') || 'unknown',
      module: 'Enrolement',
    });

    return c.json({ success: true });
  } catch (error) {
    console.log('[updateDossierStatut] Error:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES : Transactions (table commandes)
// ─────────────────────────────────────────────────────────────────────────────

export async function getTransactions(c: Context) {
  const auth = await checkAuthBO(c);
  if (!auth.authorized) return c.json({ error: auth.error }, 401);

  try {
    const { data: rows, error } = await supabase
      .from('commandes')
      .select(`
        id,
        produit,
        quantite,
        total,
        prix,
        statut,
        mode_paiement,
        created_at,
        date_creation,
        user:users_julaba!user_id(first_name, last_name, role, region)
      `)
      .order('created_at', { ascending: false })
      .limit(500);

    if (error) {
      console.log('[getTransactions] DB error:', error.message);
      return c.json({ error: 'Erreur lors du chargement des transactions', details: error.message }, 500);
    }

    const statutMap: Record<string, BOTransaction['statut']> = {
      en_attente: 'en_cours',
      confirmee: 'validee',
      livree: 'validee',
      annulee: 'annulee',
      litige: 'litige',
      validee: 'validee',
    };

    const transactions: BOTransaction[] = (rows || []).map(row => {
      const user = row.user as any;
      const montant = parseFloat(row.total || row.prix || 0);
      return {
        id: row.id,
        acteurNom: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : 'Inconnu',
        acteurType: user?.role || 'marchand',
        produit: row.produit || '',
        quantite: String(row.quantite || ''),
        montant,
        commission: Math.round(montant * 0.01 * 100) / 100,
        statut: statutMap[row.statut] || 'en_cours',
        date: row.created_at || row.date_creation || new Date().toISOString(),
        region: user?.region || '',
        modePaiement: row.mode_paiement || 'wallet',
      };
    });

    return c.json({ transactions });
  } catch (error) {
    console.log('[getTransactions] Error:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

// ───────────────────────────────────────────────────────────────────��─────────
// ROUTES : Zones (table zones) — requêtes sans FK joins pour compatibilité max
// ─────────────────────────────────────────────────────────────────────────────

/** Détecter si une zone est active indépendamment du nom de colonne */
function isZoneActive(row: any): boolean {
  if (row.actif !== undefined && row.actif !== null) return Boolean(row.actif);
  if (row.is_active !== undefined && row.is_active !== null) return Boolean(row.is_active);
  if (row.active !== undefined && row.active !== null) return Boolean(row.active);
  if (row.statut !== undefined) return row.statut === 'actif' || row.statut === 'active';
  return true; // défaut : actif
}

/** Construire l'objet BOZone depuis une ligne DB brute */
function buildBOZone(row: any, parentMap: Record<string, string>, gestionnaireMap: Record<string, string>): BOZone {
  const nom = row.nom || row.name || '';
  const parentNom = row.parent_id ? (parentMap[row.parent_id] || '') : '';
  const gestionnaireNom = row.gestionnaire_id ? (gestionnaireMap[row.gestionnaire_id] || '') : '';

  // Région : soit le parent, soit la colonne région, soit le nom de la zone si c'est une région
  const region = parentNom
    || row.region
    || (row.type === 'region' || row.type === 'Region' ? nom : '');

  return {
    id: row.id,
    nom,
    region,
    gestionnaire: gestionnaireNom || undefined,
    nbActeurs: row.nb_acteurs || 0,
    nbIdentificateurs: row.nb_identificateurs || 0,
    volumeTotal: row.volume_total || 0,
    tauxActivite: row.taux_activite || 0,
    statut: isZoneActive(row) ? 'active' : 'inactive',
  };
}

export async function getZones(c: Context) {
  const auth = await checkAuthBO(c);
  if (!auth.authorized) return c.json({ error: auth.error }, 401);

  try {
    // SELECT * sans aucun join FK — compatible avec toute structure de table zones
    const { data: rows, error } = await supabase
      .from('zones')
      .select('*')
      .order('nom', { ascending: true });

    if (error) {
      console.log('[getZones] DB error:', error.message);
      return c.json({ error: 'Erreur lors du chargement des zones', details: error.message }, 500);
    }

    if (!rows || rows.length === 0) {
      console.log('[getZones] Aucune zone trouvée dans la table zones');
      return c.json({ zones: [] });
    }

    console.log(`[getZones] ${rows.length} zone(s) trouvée(s)`);
    console.log('[getZones] Colonnes détectées:', Object.keys(rows[0]).join(', '));

    // Map parent_id → nom (auto-résolution hiérarchie)
    const parentMap: Record<string, string> = {};
    rows.forEach(r => {
      if (r.id) parentMap[r.id] = r.nom || r.name || '';
    });

    // Résoudre les gestionnaires en une seule requête
    const gestionnaireMap: Record<string, string> = {};
    const gestionnaireIds = [...new Set(
      rows.map(r => r.gestionnaire_id).filter((id): id is string => !!id)
    )];
    if (gestionnaireIds.length > 0) {
      const { data: users, error: usersErr } = await supabase
        .from('users_julaba')
        .select('id, first_name, last_name')
        .in('id', gestionnaireIds);
      if (!usersErr && users) {
        users.forEach(u => {
          gestionnaireMap[u.id] = `${u.first_name || ''} ${u.last_name || ''}`.trim();
        });
      }
    }

    const zones: BOZone[] = rows.map(row => buildBOZone(row, parentMap, gestionnaireMap));
    return c.json({ zones });

  } catch (error) {
    console.log('[getZones] Error:', error);
    return c.json({ error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Erreur inconnue' }, 500);
  }
}

export async function updateZoneStatut(c: Context) {
  const auth = await checkAuthBO(c, ['super_admin', 'admin_national']);
  if (!auth.authorized) return c.json({ error: auth.error }, 401);

  try {
    const zoneId = c.req.param('id');
    const { statut } = await c.req.json();

    const { data: zone, error: fetchError } = await supabase
      .from('zones')
      .select('*')
      .eq('id', zoneId)
      .single();

    if (fetchError || !zone) return c.json({ error: 'Zone introuvable' }, 404);

    const newActif = statut === 'active';

    // Adapter la colonne selon ce qui existe réellement dans la table
    const updateData: any = {};
    if ('actif' in zone) updateData.actif = newActif;
    else if ('is_active' in zone) updateData.is_active = newActif;
    else if ('active' in zone) updateData.active = newActif;
    else if ('statut' in zone) updateData.statut = newActif ? 'actif' : 'inactif';
    else updateData.actif = newActif; // fallback

    const { error: updateError } = await supabase
      .from('zones')
      .update(updateData)
      .eq('id', zoneId);

    if (updateError) {
      console.log('[updateZoneStatut] DB error:', updateError.message);
      return c.json({ error: 'Erreur lors de la mise à jour', details: updateError.message }, 500);
    }

    await addAuditLog({
      userId: auth.user.id,
      action: newActif ? 'ACTIVATION zone' : 'DÉSACTIVATION zone',
      utilisateurBO: `${auth.user.first_name} ${auth.user.last_name}`,
      roleBO: auth.user.role,
      acteurImpacte: zone.nom || zone.name || zoneId,
      ancienneValeur: isZoneActive(zone) ? 'active' : 'inactive',
      nouvelleValeur: statut,
      ip: c.req.header('x-forwarded-for') || 'unknown',
      module: 'Zones',
    });

    return c.json({ success: true, zone: { id: zoneId, statut } });
  } catch (error) {
    console.log('[updateZoneStatut] Error:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

export async function createZone(c: Context) {
  const auth = await checkAuthBO(c, ['super_admin', 'admin_national']);
  if (!auth.authorized) return c.json({ error: auth.error }, 401);

  try {
    const { nom, region, type, parent_id, gestionnaire } = await c.req.json();

    if (!nom) return c.json({ error: 'Le nom de la zone est obligatoire' }, 400);

    // Résoudre le parent_id
    let resolvedParentId = parent_id || null;
    if (!resolvedParentId && region) {
      const { data: parentZone } = await supabase
        .from('zones')
        .select('id')
        .ilike('nom', region)
        .limit(1)
        .maybeSingle();
      if (parentZone) resolvedParentId = parentZone.id;
    }

    // Résoudre le gestionnaire_id
    let resolvedGestionnaireId: string | null = null;
    if (gestionnaire) {
      const { data: gUser } = await supabase
        .from('users_julaba')
        .select('id')
        .eq('id', gestionnaire)
        .maybeSingle();
      if (gUser) resolvedGestionnaireId = gUser.id;
    }

    // Détecter la structure de la table via une lecture préalable
    let sampleRow: any = null;
    const { data: sample } = await supabase.from('zones').select('*').limit(1).maybeSingle();
    if (sample) sampleRow = sample;

    const baseInsert: any = {
      nom,
      type: type || (resolvedParentId ? 'commune' : 'region'),
      parent_id: resolvedParentId,
      gestionnaire_id: resolvedGestionnaireId,
    };

    // Ajouter la colonne d'activation selon ce qui existe
    if (!sampleRow || 'actif' in sampleRow) baseInsert.actif = true;
    else if ('is_active' in sampleRow) baseInsert.is_active = true;
    else if ('active' in sampleRow) baseInsert.active = true;

    const { data: newZone, error: insertError } = await supabase
      .from('zones')
      .insert(baseInsert)
      .select()
      .single();

    if (insertError) {
      console.log('[createZone] DB error:', insertError.message);
      return c.json({ error: 'Erreur lors de la création de la zone', details: insertError.message }, 500);
    }

    await addAuditLog({
      userId: auth.user.id,
      action: 'CRÉATION zone',
      utilisateurBO: `${auth.user.first_name} ${auth.user.last_name}`,
      roleBO: auth.user.role,
      acteurImpacte: nom,
      ancienneValeur: '-',
      nouvelleValeur: region || type || 'region',
      ip: c.req.header('x-forwarded-for') || 'unknown',
      module: 'Zones',
    });

    return c.json({
      success: true,
      zone: {
        id: newZone.id,
        nom: newZone.nom || nom,
        region: region || nom,
        gestionnaire: undefined,
        nbActeurs: 0,
        nbIdentificateurs: 0,
        volumeTotal: 0,
        tauxActivite: 0,
        statut: 'active',
      } as BOZone,
    }, 201);
  } catch (error) {
    console.log('[createZone] Error:', error);
    return c.json({ error: 'Erreur serveur lors de la création de la zone' }, 500);
  }
}

export async function updateZone(c: Context) {
  const auth = await checkAuthBO(c, ['super_admin', 'admin_national']);
  if (!auth.authorized) return c.json({ error: auth.error }, 401);

  try {
    const zoneId = c.req.param('id');
    const { nom, region, gestionnaire, type, parent_id } = await c.req.json();

    const { data: zone, error: fetchError } = await supabase
      .from('zones')
      .select('*')
      .eq('id', zoneId)
      .single();

    if (fetchError || !zone) return c.json({ error: 'Zone introuvable' }, 404);

    let resolvedParentId = parent_id !== undefined ? parent_id : zone.parent_id;
    if (region && !parent_id) {
      const { data: parentZone } = await supabase
        .from('zones').select('id').ilike('nom', region).limit(1).maybeSingle();
      if (parentZone) resolvedParentId = parentZone.id;
    }

    let resolvedGestionnaireId = zone.gestionnaire_id;
    if (gestionnaire !== undefined) {
      if (!gestionnaire) {
        resolvedGestionnaireId = null;
      } else {
        const { data: gUser } = await supabase
          .from('users_julaba').select('id').eq('id', gestionnaire).maybeSingle();
        if (gUser) resolvedGestionnaireId = gUser.id;
      }
    }

    const updateData: any = {};
    if (nom !== undefined) updateData.nom = nom;
    if (type !== undefined) updateData.type = type;
    if (resolvedParentId !== undefined) updateData.parent_id = resolvedParentId;
    if (resolvedGestionnaireId !== undefined) updateData.gestionnaire_id = resolvedGestionnaireId;

    const { data: updated, error: updateError } = await supabase
      .from('zones').update(updateData).eq('id', zoneId).select().single();

    if (updateError) {
      console.log('[updateZone] DB error:', updateError.message);
      return c.json({ error: 'Erreur lors de la mise à jour', details: updateError.message }, 500);
    }

    await addAuditLog({
      userId: auth.user.id,
      action: 'MODIFICATION zone',
      utilisateurBO: `${auth.user.first_name} ${auth.user.last_name}`,
      roleBO: auth.user.role,
      acteurImpacte: zone.nom || zone.name || zoneId,
      ancienneValeur: zone.gestionnaire_id || 'sans gestionnaire',
      nouvelleValeur: gestionnaire || 'sans gestionnaire',
      ip: c.req.header('x-forwarded-for') || 'unknown',
      module: 'Zones',
    });

    return c.json({ success: true, zone: { id: updated.id, nom: updated.nom || nom, statut: isZoneActive(updated) ? 'active' : 'inactive' } });
  } catch (error) {
    console.log('[updateZone] Error:', error);
    return c.json({ error: 'Erreur serveur lors de la mise à jour de la zone' }, 500);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES : Commissions (table commissions)
// ─────────────────────────────────────────────────────────────────────────────

export async function getCommissions(c: Context) {
  const auth = await checkAuthBO(c);
  if (!auth.authorized) return c.json({ error: auth.error }, 401);

  try {
    const { data: rows, error } = await supabase
      .from('commissions')
      .select(`
        id, montant, statut, periode, created_at,
        identificateur:users_julaba!identificateur_id(id, first_name, last_name)
      `)
      .order('created_at', { ascending: false })
      .limit(300);

    if (error) {
      console.log('[getCommissions] DB error:', error.message);
      return c.json({ error: 'Erreur lors du chargement des commissions', details: error.message }, 500);
    }

    const commissions: BOCommission[] = (rows || []).map(row => {
      const ident = row.identificateur as any;
      return {
        id: row.id,
        identificateurNom: ident
          ? `${ident.first_name || ''} ${ident.last_name || ''}`.trim()
          : 'Inconnu',
        periode: row.periode || new Date(row.created_at).toISOString().slice(0, 7),
        nbDossiers: 1,
        montantTotal: parseFloat(row.montant || 0),
        statut: (row.statut as BOCommission['statut']) || 'en_attente',
        date: row.created_at,
      };
    });

    return c.json({ commissions });
  } catch (error) {
    console.log('[getCommissions] Error:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

export async function updateCommissionStatut(c: Context) {
  const auth = await checkAuthBO(c, ['super_admin', 'admin_national']);
  if (!auth.authorized) return c.json({ error: auth.error }, 401);

  try {
    const commissionId = c.req.param('id');
    const { statut } = await c.req.json();

    const { data: commission, error: fetchError } = await supabase
      .from('commissions')
      .select('id, statut, montant, identificateur_id')
      .eq('id', commissionId)
      .single();

    if (fetchError || !commission) return c.json({ error: 'Commission introuvable' }, 404);

    const updateData: any = { statut };
    if (statut === 'payee') updateData.commission_payee = true;

    const { error: updateError } = await supabase
      .from('commissions')
      .update(updateData)
      .eq('id', commissionId);

    if (updateError) {
      console.log('[updateCommissionStatut] DB error:', updateError.message);
      return c.json({ error: 'Erreur lors de la mise à jour', details: updateError.message }, 500);
    }

    await addAuditLog({
      userId: auth.user.id,
      action: statut === 'validee' ? 'VALIDATION commission' : 'PAIEMENT commission',
      utilisateurBO: `${auth.user.first_name} ${auth.user.last_name}`,
      roleBO: auth.user.role,
      acteurImpacte: commissionId,
      ancienneValeur: commission.statut,
      nouvelleValeur: statut,
      ip: c.req.header('x-forwarded-for') || 'unknown',
      module: 'Commissions',
    });

    return c.json({ success: true, commission: { id: commissionId, statut } });
  } catch (error) {
    console.log('[updateCommissionStatut] Error:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES : Audit Logs (table audit_logs)
// ─────────────────────────────────────���───────────────────────────────────────

export async function getAuditLogs(c: Context) {
  const auth = await checkAuthBO(c);
  if (!auth.authorized) return c.json({ error: auth.error }, 401);

  try {
    const { data: rows, error } = await supabase
      .from('audit_logs')
      .select(`
        id, action, description, severity, entity_type, metadata, created_at,
        user:users_julaba!user_id(first_name, last_name, role)
      `)
      .order('created_at', { ascending: false })
      .limit(500);

    if (error) {
      console.log('[getAuditLogs] DB error:', error.message);
      return c.json({ error: 'Erreur lors du chargement des logs', details: error.message }, 500);
    }

    const logs: BOAuditLog[] = (rows || []).map(row => {
      const user = row.user as any;
      const meta = (row.metadata as any) || {};
      return {
        id: row.id,
        action: row.action,
        utilisateurBO: meta.utilisateurBO || (user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : 'Système'),
        roleBO: (meta.roleBO || user?.role || 'analyste') as BORoleType,
        acteurImpacte: meta.acteurImpacte || row.description || '',
        ancienneValeur: meta.ancienneValeur || '',
        nouvelleValeur: meta.nouvelleValeur || '',
        date: row.created_at,
        ip: meta.ip || 'unknown',
        module: meta.module || row.entity_type || 'Système',
      };
    });

    return c.json({ logs });
  } catch (error) {
    console.log('[getAuditLogs] Error:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES : Utilisateurs BO (table users_julaba)
// ─────────────────────────────────────────────────────────────────────────────

export async function getBOUsers(c: Context) {
  const auth = await checkAuthBO(c, ['super_admin', 'admin_national']);
  if (!auth.authorized) return c.json({ error: auth.error }, 401);

  try {
    const { data: users, error } = await supabase
      .from('users_julaba')
      .select('*')
      .in('role', ['super_admin', 'admin_national', 'gestionnaire_zone', 'analyste'])
      .order('created_at', { ascending: false });

    if (error) {
      console.log('[getBOUsers] DB error:', error.message);
      return c.json({ error: 'Erreur lors du chargement des utilisateurs', details: error.message }, 500);
    }

    const boUsers = (users || []).map(user => ({
      id: user.id,
      nom: user.last_name || '',
      prenom: user.first_name || '',
      email: `${user.phone}@julaba.ci`,
      role: user.role,
      region: user.region,
      lastLogin: user.last_login_at || user.created_at,
      actif: user.validated,
    }));

    return c.json({ users: boUsers });
  } catch (error) {
    console.log('[getBOUsers] Error:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

export async function createBOUser(c: Context) {
  const auth = await checkAuthBO(c, ['super_admin']);
  if (!auth.authorized) return c.json({ error: auth.error }, 401);

  try {
    const { prenom, nom, email, password, role, region } = await c.req.json();

    if (!prenom || !nom || !email || !password || !role) {
      return c.json({ error: 'Champs obligatoires manquants : prenom, nom, email, password, role' }, 400);
    }

    const validBoRoles = ['admin_national', 'gestionnaire_zone', 'analyste'];
    if (!validBoRoles.includes(role)) {
      return c.json({ error: 'Rôle BO invalide. Valeurs acceptées : admin_national, gestionnaire_zone, analyste' }, 400);
    }

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { first_name: prenom, last_name: nom, role },
    });

    if (authError) {
      console.log('[createBOUser] Auth error:', authError.message);
      return c.json({ error: 'Erreur lors de la création du compte', details: authError.message }, 500);
    }

    const fakePhone = `BO${Date.now().toString().slice(-8)}`;

    const { data: profile, error: profileError } = await supabase
      .from('users_julaba')
      .insert({
        auth_user_id: authData.user.id,
        phone: fakePhone,
        first_name: prenom,
        last_name: nom,
        role,
        region: region || 'National',
        validated: true,
        score: 100,
      })
      .select()
      .single();

    if (profileError) {
      console.log('[createBOUser] Profile error:', profileError.message);
      await supabase.auth.admin.deleteUser(authData.user.id);
      return c.json({ error: 'Erreur lors de la création du profil', details: profileError.message }, 500);
    }

    await addAuditLog({
      userId: auth.user.id,
      action: 'CRÉATION utilisateur BO',
      utilisateurBO: `${auth.user.first_name} ${auth.user.last_name}`,
      roleBO: auth.user.role,
      acteurImpacte: `${prenom} ${nom}`,
      ancienneValeur: '-',
      nouvelleValeur: role,
      ip: c.req.header('x-forwarded-for') || 'unknown',
      module: 'Utilisateurs',
    });

    return c.json({
      success: true,
      user: {
        id: profile.id, nom, prenom, email, role,
        region: region || 'National',
        lastLogin: new Date().toISOString(),
        actif: true,
      },
    }, 201);
  } catch (error) {
    console.log('[createBOUser] Error:', error);
    return c.json({ error: 'Erreur serveur lors de la création de l\'utilisateur BO', details: error instanceof Error ? error.message : 'Erreur inconnue' }, 500);
  }
}

export async function updateBOUserActif(c: Context) {
  const auth = await checkAuthBO(c, ['super_admin']);
  if (!auth.authorized) return c.json({ error: auth.error }, 401);

  try {
    const userId = c.req.param('id');
    const { actif } = await c.req.json();

    const { data: user, error: fetchError } = await supabase
      .from('users_julaba')
      .select('first_name, last_name, role, validated')
      .eq('id', userId)
      .single();

    if (fetchError || !user) return c.json({ error: 'Utilisateur introuvable' }, 404);

    const { error: updateError } = await supabase
      .from('users_julaba')
      .update({ validated: actif })
      .eq('id', userId);

    if (updateError) {
      console.log('[updateBOUserActif] DB error:', updateError.message);
      return c.json({ error: 'Erreur lors de la mise à jour', details: updateError.message }, 500);
    }

    await addAuditLog({
      userId: auth.user.id,
      action: actif ? 'RÉACTIVATION utilisateur BO' : 'DÉSACTIVATION utilisateur BO',
      utilisateurBO: `${auth.user.first_name} ${auth.user.last_name}`,
      roleBO: auth.user.role,
      acteurImpacte: `${user.first_name} ${user.last_name}`,
      ancienneValeur: user.validated ? 'actif' : 'inactif',
      nouvelleValeur: actif ? 'actif' : 'inactif',
      ip: c.req.header('x-forwarded-for') || 'unknown',
      module: 'Utilisateurs',
    });

    return c.json({ success: true, actif });
  } catch (error) {
    console.log('[updateBOUserActif] Error:', error);
    return c.json({ error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Erreur inconnue' }, 500);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES : Missions BO (table missions)
// ─────────────────────────────────────────────────────────────────────────────

export async function getMissions(c: Context) {
  const auth = await checkAuthBO(c);
  if (!auth.authorized) return c.json({ error: auth.error }, 401);

  try {
    const { data: rows, error } = await supabase
      .from('missions')
      .select(`
        id, titre, statut, objectif, progres, created_at,
        identificateur:users_julaba!identificateur_id(first_name, last_name)
      `)
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) {
      console.log('[getMissions BO] DB error:', error.message);
      return c.json({ error: 'Erreur lors du chargement des missions', details: error.message }, 500);
    }

    const missions = (rows || []).map(row => {
      const ident = row.identificateur as any;
      return {
        id: row.id,
        titre: row.titre || 'Mission sans titre',
        type: 'identification',
        realise: row.progres || 0,
        objectif: row.objectif || 100,
        statut: row.statut || 'en_cours',
        participantsCount: 1,
        creePar: ident ? `${ident.first_name || ''} ${ident.last_name || ''}`.trim() : 'Système',
        dateCreation: row.created_at,
      };
    });

    return c.json({ missions });
  } catch (error) {
    console.log('[getMissions BO] Error:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

export async function createMission(c: Context) {
  const auth = await checkAuthBO(c, ['super_admin', 'admin_national']);
  if (!auth.authorized) return c.json({ error: auth.error }, 401);

  try {
    const { titre, type, objectif, identificateur_id } = await c.req.json();

    if (!titre) return c.json({ error: 'Le titre de la mission est obligatoire' }, 400);

    const insertData: any = {
      titre,
      description: type || 'Mission créée par le Back-Office',
      objectif: objectif || 100,
      recompense: 0,
      progres: 0,
      statut: 'en_cours',
    };
    if (identificateur_id) insertData.identificateur_id = identificateur_id;

    const { data: mission, error: insertError } = await supabase
      .from('missions')
      .insert(insertData)
      .select()
      .single();

    if (insertError) {
      console.log('[createMission BO] DB error:', insertError.message);
      return c.json({ error: 'Erreur lors de la création de la mission', details: insertError.message }, 500);
    }

    await addAuditLog({
      userId: auth.user.id,
      action: 'CRÉATION mission',
      utilisateurBO: `${auth.user.first_name} ${auth.user.last_name}`,
      roleBO: auth.user.role,
      acteurImpacte: titre,
      ancienneValeur: '-',
      nouvelleValeur: 'en_cours',
      ip: c.req.header('x-forwarded-for') || 'unknown',
      module: 'Missions',
    });

    return c.json({
      success: true,
      mission: {
        id: mission.id,
        titre: mission.titre,
        type: type || 'identification',
        realise: 0,
        statut: 'en_cours',
        participantsCount: 0,
        creePar: `${auth.user.first_name} ${auth.user.last_name}`,
        dateCreation: mission.created_at,
      },
    }, 201);
  } catch (error) {
    console.log('[createMission BO] Error:', error);
    return c.json({ error: 'Erreur serveur lors de la création de la mission', details: error instanceof Error ? error.message : 'Erreur inconnue' }, 500);
  }
}

export async function updateMissionStatut(c: Context) {
  const auth = await checkAuthBO(c, ['super_admin', 'admin_national']);
  if (!auth.authorized) return c.json({ error: auth.error }, 401);

  try {
    const missionId = c.req.param('id');
    const { statut } = await c.req.json();

    const { data: mission, error: fetchError } = await supabase
      .from('missions')
      .select('id, titre, statut')
      .eq('id', missionId)
      .single();

    if (fetchError || !mission) return c.json({ error: 'Mission introuvable' }, 404);

    const { error: updateError } = await supabase
      .from('missions')
      .update({ statut })
      .eq('id', missionId);

    if (updateError) {
      console.log('[updateMissionStatut] DB error:', updateError.message);
      return c.json({ error: 'Erreur lors de la mise à jour', details: updateError.message }, 500);
    }

    await addAuditLog({
      userId: auth.user.id,
      action: statut === 'terminee' ? 'CLÔTURE mission' : 'MODIFICATION statut mission',
      utilisateurBO: `${auth.user.first_name} ${auth.user.last_name}`,
      roleBO: auth.user.role,
      acteurImpacte: mission.titre,
      ancienneValeur: mission.statut,
      nouvelleValeur: statut,
      ip: c.req.header('x-forwarded-for') || 'unknown',
      module: 'Missions',
    });

    return c.json({ success: true, mission: { id: missionId, statut } });
  } catch (error) {
    console.log('[updateMissionStatut] Error:', error);
    return c.json({ error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Erreur inconnue' }, 500);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES : Institutions (KV Store — pas de table SQL dédiée)
// ─────────────────────────────────────────────────────────────────────────────

export async function getInstitutions(c: Context) {
  const auth = await checkAuthBO(c, ['super_admin', 'admin_national']);
  if (!auth.authorized) return c.json({ error: auth.error }, 401);

  try {
    const institutions = await kv.get<InstitutionBO[]>('bo_institutions') || [];
    return c.json({ institutions });
  } catch (error) {
    console.log('[getInstitutions] Error:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

export async function createInstitution(c: Context) {
  const auth = await checkAuthBO(c, ['super_admin']);
  if (!auth.authorized) return c.json({ error: auth.error }, 401);

  try {
    const institutionData = await c.req.json();
    const newInstitution: InstitutionBO = {
      ...institutionData,
      id: `inst_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      dateCreation: new Date().toISOString(),
      creePar: `${auth.user.first_name} ${auth.user.last_name}`,
      statut: 'actif',
    };

    const institutions = await kv.get<InstitutionBO[]>('bo_institutions') || [];
    institutions.push(newInstitution);
    await kv.set('bo_institutions', institutions);

    await addAuditLog({
      userId: auth.user.id,
      action: 'CREATION institution',
      utilisateurBO: `${auth.user.first_name} ${auth.user.last_name}`,
      roleBO: auth.user.role,
      acteurImpacte: newInstitution.nom,
      ancienneValeur: '-',
      nouvelleValeur: 'actif',
      ip: c.req.header('x-forwarded-for') || 'unknown',
      module: 'Institutions',
    });

    return c.json({ success: true, institution: newInstitution });
  } catch (error) {
    console.log('[createInstitution] Error:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

export async function updateInstitutionModules(c: Context) {
  const auth = await checkAuthBO(c, ['super_admin']);
  if (!auth.authorized) return c.json({ error: auth.error }, 401);

  try {
    const institutionId = c.req.param('id');
    const { modules } = await c.req.json();

    const institutions = await kv.get<InstitutionBO[]>('bo_institutions') || [];
    const idx = institutions.findIndex(i => i.id === institutionId);
    if (idx === -1) return c.json({ error: 'Institution introuvable' }, 404);

    const institution = institutions[idx];
    institutions[idx] = { ...institution, modules };
    await kv.set('bo_institutions', institutions);

    await addAuditLog({
      userId: auth.user.id,
      action: 'MODIFICATION modules institution',
      utilisateurBO: `${auth.user.first_name} ${auth.user.last_name}`,
      roleBO: auth.user.role,
      acteurImpacte: institution.nom,
      ancienneValeur: JSON.stringify(institution.modules),
      nouvelleValeur: JSON.stringify(modules),
      ip: c.req.header('x-forwarded-for') || 'unknown',
      module: 'Institutions',
    });

    return c.json({ success: true, institution: institutions[idx] });
  } catch (error) {
    console.log('[updateInstitutionModules] Error:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

export async function updateInstitutionStatut(c: Context) {
  const auth = await checkAuthBO(c, ['super_admin']);
  if (!auth.authorized) return c.json({ error: auth.error }, 401);

  try {
    const institutionId = c.req.param('id');
    const { statut } = await c.req.json();

    const institutions = await kv.get<InstitutionBO[]>('bo_institutions') || [];
    const idx = institutions.findIndex(i => i.id === institutionId);
    if (idx === -1) return c.json({ error: 'Institution introuvable' }, 404);

    const institution = institutions[idx];
    institutions[idx] = { ...institution, statut };
    await kv.set('bo_institutions', institutions);

    await addAuditLog({
      userId: auth.user.id,
      action: statut === 'actif' ? 'ACTIVATION institution' : 'DÉSACTIVATION institution',
      utilisateurBO: `${auth.user.first_name} ${auth.user.last_name}`,
      roleBO: auth.user.role,
      acteurImpacte: institution.nom,
      ancienneValeur: institution.statut,
      nouvelleValeur: statut,
      ip: c.req.header('x-forwarded-for') || 'unknown',
      module: 'Institutions',
    });

    return c.json({ success: true, institution: institutions[idx] });
  } catch (error) {
    console.log('[updateInstitutionStatut] Error:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

export async function deleteInstitution(c: Context) {
  const auth = await checkAuthBO(c, ['super_admin']);
  if (!auth.authorized) return c.json({ error: auth.error }, 401);

  try {
    const institutionId = c.req.param('id');
    const institutions = await kv.get<InstitutionBO[]>('bo_institutions') || [];
    const institution = institutions.find(i => i.id === institutionId);
    if (!institution) return c.json({ error: 'Institution introuvable' }, 404);

    await kv.set('bo_institutions', institutions.filter(i => i.id !== institutionId));

    await addAuditLog({
      userId: auth.user.id,
      action: 'SUPPRESSION institution',
      utilisateurBO: `${auth.user.first_name} ${auth.user.last_name}`,
      roleBO: auth.user.role,
      acteurImpacte: institution.nom,
      ancienneValeur: 'actif',
      nouvelleValeur: 'supprimé',
      ip: c.req.header('x-forwarded-for') || 'unknown',
      module: 'Institutions',
    });

    return c.json({ success: true });
  } catch (error) {
    console.log('[deleteInstitution] Error:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES : Création Identificateur depuis BO
// ─────────────────────────────────────────────────────────────────────────────

export async function createIdentificateur(c: Context) {
  const auth = await checkAuthBO(c, ['super_admin', 'admin_national']);
  if (!auth.authorized) return c.json({ error: auth.error }, 401);

  try {
    const { prenom, nom, telephone, cni, region, zoneId, institutionRattachee } = await c.req.json();

    if (!prenom || !nom || !telephone) {
      return c.json({ error: 'Prénom, nom et téléphone sont obligatoires' }, 400);
    }

    const { data: existing } = await supabase
      .from('users_julaba')
      .select('phone')
      .eq('phone', telephone)
      .single();

    if (existing) return c.json({ error: 'Ce numéro de téléphone est déjà enregistré' }, 409);

    const authEmail = `${telephone}@julaba.local`;

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: authEmail,
      password: telephone,
      email_confirm: true,
      user_metadata: { phone: telephone, first_name: prenom, last_name: nom, role: 'identificateur' },
    });

    if (authError) {
      console.log('[createIdentificateur] Auth error:', authError.message);
      return c.json({ error: 'Erreur lors de la création du compte', details: authError.message }, 500);
    }

    const { data: profile, error: profileError } = await supabase
      .from('users_julaba')
      .insert({
        auth_user_id: authData.user.id,
        phone: telephone,
        first_name: prenom,
        last_name: nom,
        role: 'identificateur',
        region: region || null,
        cni_number: cni || null,
        institution_name: institutionRattachee || null,
        score: 50,
        validated: true,
        verified_phone: true,
      })
      .select()
      .single();

    if (profileError) {
      await supabase.auth.admin.deleteUser(authData.user.id);
      return c.json({ error: 'Erreur lors de la création du profil', details: profileError.message }, 500);
    }

    await addAuditLog({
      userId: auth.user.id,
      action: 'CRÉATION identificateur',
      utilisateurBO: `${auth.user.first_name} ${auth.user.last_name}`,
      roleBO: auth.user.role,
      acteurImpacte: `${prenom} ${nom}`,
      ancienneValeur: '-',
      nouvelleValeur: `Zone: ${zoneId || 'non assigné'}`,
      ip: c.req.header('x-forwarded-for') || 'unknown',
      module: 'Enrolement',
    });

    return c.json({
      success: true,
      user: { id: profile.id, phone: telephone, firstName: prenom, lastName: nom, role: 'identificateur' },
    }, 201);
  } catch (error) {
    console.log('[createIdentificateur] Error:', error);
    return c.json({ error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Erreur inconnue' }, 500);
  }
}