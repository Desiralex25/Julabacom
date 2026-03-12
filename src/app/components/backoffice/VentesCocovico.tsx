import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play, Pause, RotateCcw, Zap, Award, Package,
  TrendingUp, TrendingDown, ShoppingBag, DollarSign,
  User, Clock, CheckCircle, Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { useBackOffice } from '../../contexts/BackOfficeContext';
import { MARCHANDS_COCOVICO, TRANSACTIONS_COCOVICO } from '../../data/cocovicoData';

const BO_PRIMARY = '#E6A817';
const BO_DARK = '#3B3C36';

// Avatars et couleurs pour les marchands
const AVATAR_COLORS = [
  { avatar: '👩🏿', color: '#EF4444' },
  { avatar: '👩🏾', color: '#F59E0B' },
  { avatar: '👩🏿', color: '#10B981' },
  { avatar: '👨🏾', color: '#3B82F6' },
  { avatar: '👩🏿', color: '#8B5CF6' },
  { avatar: '👩🏾', color: '#EC4899' },
  { avatar: '👩🏿', color: '#14B8A6' },
  { avatar: '👨🏿', color: '#F97316' },
  { avatar: '👩🏾', color: '#06B6D4' },
  { avatar: '👩🏿', color: '#84CC16' },
  { avatar: '👨🏾', color: '#EAB308' },
  { avatar: '👩🏾', color: '#A855F7' },
  { avatar: '👩🏿', color: '#EF4444' },
  { avatar: '👨🏿', color: '#F59E0B' },
  { avatar: '👩🏾', color: '#10B981' },
];

// Convertir les marchands Cocovico en format avec avatar et couleur
const MARCHANDES = MARCHANDS_COCOVICO.map((marchand, index) => ({
  id: marchand.id,
  nom: `${marchand.prenoms} ${marchand.nom}`,
  specialite: marchand.activite || 'Commerce',
  emplacement: `${marchand.commune} - ${marchand.zone}`,
  avatar: AVATAR_COLORS[index % AVATAR_COLORS.length].avatar,
  color: AVATAR_COLORS[index % AVATAR_COLORS.length].color,
}));

// Liste des 12 produits de Cocovico
const PRODUITS = [
  { nom: 'Banane plantain', prix: [300, 500, 800], unite: 'tas', populaire: 0.9 },
  { nom: 'Poisson', prix: [1500, 2500, 4000], unite: 'tas', populaire: 0.95 },
  { nom: 'Poulet', prix: [3000, 4500, 6000], unite: 'unite', populaire: 0.7 },
  { nom: 'Tomate', prix: [300, 500, 800], unite: 'tas', populaire: 0.85 },
  { nom: 'Oignon', prix: [400, 600, 1000], unite: 'tas', populaire: 0.8 },
  { nom: 'Attieke', prix: [200, 300, 500], unite: 'sachet', populaire: 1.0 },
  { nom: 'Piment', prix: [100, 200, 300], unite: 'tas', populaire: 0.6 },
  { nom: 'Viande', prix: [2000, 3000, 5000], unite: 'kg', populaire: 0.65 },
  { nom: 'Poisson fume', prix: [1000, 1500, 2500], unite: 'tas', populaire: 0.75 },
  { nom: 'Fruits', prix: [500, 1000, 1500], unite: 'tas', populaire: 0.7 },
  { nom: 'Manioc', prix: [300, 500, 800], unite: 'tas', populaire: 0.8 },
  { nom: 'Gombo', prix: [150, 200, 400], unite: 'tas', populaire: 0.65 },
];

interface Vente {
  id: string;
  marchandeId: string;
  marchandeNom: string;
  produit: string;
  montant: number;
  unite: string;
  quantite: number;
  timestamp: string;
}

export function VentesCocovico() {
  const [ventes, setVentes] = useState<Vente[]>([]);
  const [simulationActive, setSimulationActive] = useState(false);
  const [vitesse, setVitesse] = useState<'lente' | 'normale' | 'rapide'>('normale');
  const [selectedMarchande, setSelectedMarchande] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  // Charger les vraies transactions Cocovico au démarrage
  useEffect(() => {
    // Convertir les TRANSACTIONS_COCOVICO en format Vente
    const ventesReelles: Vente[] = TRANSACTIONS_COCOVICO
      .filter(tx => tx.statut === 'validee') // Ne prendre que les transactions validées
      .map(tx => {
        // Extraire la quantité et l'unité depuis la chaîne "3 tas"
        const [quantiteStr, ...uniteArr] = (tx.quantite || '1 unite').split(' ');
        const quantite = parseInt(quantiteStr) || 1;
        const unite = uniteArr.join(' ') || 'unite';

        return {
          id: tx.id,
          marchandeId: tx.acteurId || '',
          marchandeNom: tx.acteurNom,
          produit: tx.produit,
          montant: tx.montant,
          unite: unite,
          quantite: quantite,
          timestamp: tx.date,
        };
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); // Plus récentes en premier

    setVentes(ventesReelles);
    console.log(`[VentesCocovico] ${ventesReelles.length} ventes réelles chargées depuis Cocovico`);
  }, []);

  // Statistiques calculees
  const caTotal = ventes.reduce((sum, v) => sum + v.montant, 0);
  const ventesAujourdhui = ventes.length;
  const moyenneVente = ventesAujourdhui > 0 ? caTotal / ventesAujourdhui : 0;

  // Statistiques par marchande
  const statsMarchandes = MARCHANDES.map(m => {
    const ventesM = ventes.filter(v => v.marchandeId === m.id);
    const ca = ventesM.reduce((sum, v) => sum + v.montant, 0);
    return {
      ...m,
      nbVentes: ventesM.length,
      ca,
      moyenneVente: ventesM.length > 0 ? ca / ventesM.length : 0,
    };
  }).sort((a, b) => b.ca - a.ca);

  // Produits les plus vendus
  const statsProduits = PRODUITS.map(p => {
    const ventesP = ventes.filter(v => v.produit === p.nom);
    const ca = ventesP.reduce((sum, v) => sum + v.montant, 0);
    return {
      ...p,
      nbVentes: ventesP.length,
      ca,
    };
  }).sort((a, b) => b.nbVentes - a.nbVentes).slice(0, 5);

  // Simulateur automatique de ventes
  const genererVente = useCallback(() => {
    const heureActuelle = new Date().getHours();
    let frequenceMultiplier = 1;

    // Heures de rush
    if ((heureActuelle >= 6 && heureActuelle <= 10) || (heureActuelle >= 16 && heureActuelle <= 19)) {
      frequenceMultiplier = 2.5;
    } else if (heureActuelle >= 11 && heureActuelle <= 15) {
      frequenceMultiplier = 1.5;
    } else {
      frequenceMultiplier = 0.5;
    }

    // Selectionner aleatoirement une marchande
    const marchande = MARCHANDES[Math.floor(Math.random() * MARCHANDES.length)];

    // Selectionner un produit base sur la popularite
    const produit = PRODUITS.sort(() => 0.5 - Math.random())
      .find(p => Math.random() < p.populaire * frequenceMultiplier) || PRODUITS[0];

    // Prix aleatoire dans la fourchette
    const prixIndex = Math.floor(Math.random() * produit.prix.length);
    const prixUnitaire = produit.prix[prixIndex];
    const quantite = Math.floor(Math.random() * 3) + 1; // 1 a 3 unites
    const montant = prixUnitaire * quantite;

    const nouvelleVente: Vente = {
      id: `V${Date.now()}`,
      marchandeId: marchande.id,
      marchandeNom: marchande.nom,
      produit: produit.nom,
      montant,
      unite: produit.unite,
      quantite,
      timestamp: new Date().toISOString(),
    };

    setVentes(prev => [nouvelleVente, ...prev].slice(0, 100)); // Garder les 100 dernieres

    // Annonce vocale pour les grandes ventes
    if (montant >= 5000) {
      toast.success(`${marchande.nom} vient de vendre ${quantite} ${produit.unite} de ${produit.nom} pour ${montant.toLocaleString()} FCFA!`);
    }
  }, []);

  // Gestion de la simulation
  useEffect(() => {
    if (simulationActive) {
      const delais = {
        lente: 5000,
        normale: 2000,
        rapide: 500,
      };
      intervalRef.current = window.setInterval(genererVente, delais[vitesse]);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [simulationActive, vitesse, genererVente]);

  const toggleSimulation = () => {
    setSimulationActive(!simulationActive);
    if (!simulationActive) {
      toast.success('Simulation de ventes demarree');
    } else {
      toast.info('Simulation de ventes mise en pause');
    }
  };

  const resetSimulation = () => {
    // Recharger les données réelles au lieu de tout effacer
    const ventesReelles: Vente[] = TRANSACTIONS_COCOVICO
      .filter(tx => tx.statut === 'validee')
      .map(tx => {
        const [quantiteStr, ...uniteArr] = (tx.quantite || '1 unite').split(' ');
        const quantite = parseInt(quantiteStr) || 1;
        const unite = uniteArr.join(' ') || 'unite';
        return {
          id: tx.id,
          marchandeId: tx.acteurId || '',
          marchandeNom: tx.acteurNom,
          produit: tx.produit,
          montant: tx.montant,
          unite: unite,
          quantite: quantite,
          timestamp: tx.date,
        };
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    setVentes(ventesReelles);
    setSimulationActive(false);
    toast.info('Donnees reelles rechargees');
  };

  const formatTempsEcoule = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `il y a ${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `il y a ${minutes}min`;
    const hours = Math.floor(minutes / 60);
    return `il y a ${hours}h`;
  };

  const marchandesFiltered = selectedMarchande
    ? statsMarchandes.filter(m => m.id === selectedMarchande)
    : statsMarchandes;

  return (
    <div className="space-y-6">
      {/* Header + Controles */}
      <div className="bg-white rounded-3xl p-6 border-2 border-gray-100 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-xl font-black text-gray-900">Ventes Terrain - Marche de Cocovico</h2>
            <p className="text-sm text-gray-500 mt-1">Donnees reelles des {MARCHANDS_COCOVICO.length} marchands de Cocovico (7-12 mars 2026)</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Play/Pause */}
            <motion.button
              onClick={toggleSimulation}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm text-white border-2"
              style={{
                backgroundColor: simulationActive ? '#EF4444' : '#10B981',
                borderColor: simulationActive ? '#EF4444' : '#10B981',
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {simulationActive ? (
                <>
                  <Pause className="w-4 h-4" /> Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" /> Demarrer
                </>
              )}
            </motion.button>

            {/* Vitesse */}
            <div className="flex items-center bg-gray-100 rounded-2xl p-1">
              {(['lente', 'normale', 'rapide'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setVitesse(v)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                  style={{
                    backgroundColor: vitesse === v ? 'white' : 'transparent',
                    color: vitesse === v ? BO_DARK : '#9ca3af',
                    boxShadow: vitesse === v ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  {v === 'lente' ? 'Lent' : v === 'normale' ? 'Normal' : 'Rapide'}
                </button>
              ))}
            </div>

            {/* Reset */}
            <motion.button
              onClick={resetSimulation}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 border-gray-200 font-bold text-sm text-gray-700 bg-white"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </motion.button>
          </div>
        </div>

        {/* KPIs globaux */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'CA Total', value: `${caTotal.toLocaleString()} F`, icon: DollarSign, color: BO_PRIMARY },
            { label: 'Ventes', value: ventesAujourdhui, icon: ShoppingBag, color: '#3B82F6' },
            { label: 'Moyenne/vente', value: `${Math.round(moyenneVente).toLocaleString()} F`, icon: TrendingUp, color: '#10B981' },
            { label: 'Marchandes actives', value: new Set(ventes.map(v => v.marchandeId)).size, icon: User, color: '#8B5CF6' },
          ].map((kpi, i) => (
            <motion.div
              key={kpi.label}
              className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-4 border-2 border-gray-100"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex items-center justify-between mb-2">
                <kpi.icon className="w-5 h-5" style={{ color: kpi.color }} />
                {simulationActive && (
                  <motion.div
                    className="w-2 h-2 rounded-full bg-green-500"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </div>
              <p className="text-xs font-bold text-gray-500 mb-0.5">{kpi.label}</p>
              <p className="text-xl font-black" style={{ color: kpi.color }}>
                {kpi.value}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Grid: Classement marchandes + Feed ventes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Classement marchandes */}
        <div className="bg-white rounded-3xl p-6 border-2 border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-black text-gray-900 text-lg">Classement des marchandes</h3>
              <p className="text-xs text-gray-500">Par chiffre d'affaires</p>
            </div>
            <Award className="w-6 h-6" style={{ color: BO_PRIMARY }} />
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {marchandesFiltered.map((m, index) => {
              const rank = index + 1;
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-2xl border-2 border-gray-100 hover:border-gray-200 transition-all cursor-pointer"
                  onClick={() => setSelectedMarchande(selectedMarchande === m.id ? null : m.id)}
                  style={{
                    backgroundColor: selectedMarchande === m.id ? `${m.color}10` : 'white',
                    borderColor: selectedMarchande === m.id ? m.color : undefined,
                  }}
                >
                  {/* Rang */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm"
                    style={{
                      backgroundColor: rank === 1 ? '#FFD700' : rank === 2 ? '#C0C0C0' : rank === 3 ? '#CD7F32' : `${m.color}20`,
                      color: rank <= 3 ? '#fff' : m.color,
                    }}
                  >
                    {rank}
                  </div>

                  {/* Avatar */}
                  <div className="text-3xl">{m.avatar}</div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm truncate">{m.nom}</p>
                    <p className="text-xs text-gray-500 truncate">{m.specialite}</p>
                    <p className="text-xs text-gray-400 truncate">{m.emplacement}</p>
                  </div>

                  {/* Stats */}
                  <div className="text-right">
                    <p className="font-black text-sm" style={{ color: m.color }}>
                      {m.ca.toLocaleString()} F
                    </p>
                    <p className="text-xs text-gray-500">{m.nbVentes} vente{m.nbVentes > 1 ? 's' : ''}</p>
                  </div>
                </motion.div>
              );
            })}
            {marchandesFiltered.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Package className="w-12 h-12 mx-auto mb-3" />
                <p className="font-bold">Aucune vente pour l'instant</p>
                <p className="text-xs mt-1">Demarrez la simulation</p>
              </div>
            )}
          </div>
        </div>

        {/* Feed ventes en temps reel */}
        <div className="bg-white rounded-3xl p-6 border-2 border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-black text-gray-900 text-lg">Feed en temps reel</h3>
              <p className="text-xs text-gray-500">Dernieres ventes enregistrees</p>
            </div>
            <Zap className="w-6 h-6 text-orange-500" />
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            <AnimatePresence mode="popLayout">
              {ventes.slice(0, 50).map((vente, index) => {
                const marchande = MARCHANDES.find(m => m.id === vente.marchandeId);
                return (
                  <motion.div
                    key={vente.id}
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    className="flex items-start gap-3 p-3 rounded-2xl bg-gradient-to-r from-gray-50 to-white border border-gray-100"
                  >
                    {/* Avatar */}
                    <div className="text-2xl">{marchande?.avatar}</div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm truncate">{vente.marchandeNom}</p>
                      <p className="text-xs text-gray-600">
                        {vente.quantite} {vente.unite} de <span className="font-semibold">{vente.produit}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-400">{formatTempsEcoule(vente.timestamp)}</span>
                      </div>
                    </div>

                    {/* Montant */}
                    <div className="text-right">
                      <p className="font-black text-sm" style={{ color: marchande?.color || BO_PRIMARY }}>
                        {vente.montant.toLocaleString()} F
                      </p>
                      {vente.montant >= 5000 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', delay: 0.2 }}
                        >
                          <Sparkles className="w-3 h-3 text-orange-500 inline" />
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {ventes.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <ShoppingBag className="w-12 h-12 mx-auto mb-3" />
                <p className="font-bold">Aucune vente enregistree</p>
                <p className="text-xs mt-1">Demarrez la simulation pour voir les ventes en temps reel</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top 5 produits */}
      <div className="bg-white rounded-3xl p-6 border-2 border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-black text-gray-900 text-lg">Top 5 produits les plus vendus</h3>
            <p className="text-xs text-gray-500">Depuis le debut de la simulation</p>
          </div>
          <TrendingUp className="w-6 h-6 text-green-500" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {statsProduits.map((produit, index) => (
            <motion.div
              key={produit.nom}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-4 border-2 border-gray-100 text-center"
            >
              <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center bg-green-100">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <p className="font-bold text-gray-900 text-sm mb-1">{produit.nom}</p>
              <p className="text-xs text-gray-500 mb-2">{produit.unite}</p>
              <div className="pt-2 border-t border-gray-100">
                <p className="text-lg font-black text-green-600">{produit.nbVentes}</p>
                <p className="text-xs text-gray-400">vente{produit.nbVentes > 1 ? 's' : ''}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}