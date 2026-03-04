// ═══════════════════════════════════════════════════════════════════
//  HistoriqueList — Liste historique partagée entre les 3 profils
// ═══════════════════════════════════════════════════════════════════
import React from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle, XCircle, Truck, Clock, Package,
  Banknote, Calendar, ArrowDownLeft, ArrowUpRight,
} from 'lucide-react';
import { CommandeMarche, STATUT_CMD_LABELS, THEME_PROFIL } from './marketplace-data';

interface HistoriqueListProps {
  commandes: CommandeMarche[];
  profil: 'producteur' | 'cooperative' | 'marchand';
  /** 'achat' = on filtre ce que ce profil A ACHETÉ
   *  'vente' = on filtre ce que ce profil A VENDU
   *  'tous'  = tout l'historique */
  sens?: 'achat' | 'vente' | 'tous';
  emptyLabel?: string;
}

export function HistoriqueList({
  commandes,
  profil,
  sens = 'tous',
  emptyLabel = 'Aucune transaction dans l\'historique',
}: HistoriqueListProps) {
  const theme = THEME_PROFIL[profil];

  // Filtrer selon le sens et le profil
  const filtrées = commandes.filter(c => {
    if (profil === 'producteur') {
      // Le producteur vend → vendeurType = 'producteur'
      if (sens === 'vente') return c.vendeurType === 'producteur';
      return c.vendeurType === 'producteur';
    }
    if (profil === 'cooperative') {
      if (sens === 'achat') return c.acheteurType === 'cooperative';
      if (sens === 'vente') return c.vendeurType === 'cooperative';
      return c.acheteurType === 'cooperative' || c.vendeurType === 'cooperative';
    }
    if (profil === 'marchand') {
      return c.acheteurType === 'marchand';
    }
    return true;
  });

  // Montant total
  const montantTotal = filtrées.reduce((s, c) => s + c.montantTotal, 0);
  const livrées = filtrées.filter(c => c.statut === 'livree').length;

  if (filtrées.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4"
          style={{ backgroundColor: theme.light }}
        >
          <Clock className="w-10 h-10" style={{ color: theme.primary }} />
        </div>
        <p className="font-bold text-gray-400">{emptyLabel}</p>
        <p className="text-xs text-gray-300 mt-1">Les transactions apparaîtront ici</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Résumé */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 gap-3"
      >
        <div
          className="rounded-2xl p-3 border-2 text-center"
          style={{ backgroundColor: theme.light, borderColor: `${theme.primary}30` }}
        >
          <p className="text-xs text-gray-500 mb-1">Transactions</p>
          <p className="text-2xl font-bold" style={{ color: theme.primary }}>{filtrées.length}</p>
        </div>
        <div className="rounded-2xl p-3 border-2 border-green-200 bg-green-50 text-center">
          <p className="text-xs text-gray-500 mb-1">Livrées</p>
          <p className="text-2xl font-bold text-green-600">{livrées}</p>
        </div>
        <div className="col-span-2 rounded-2xl p-3 border-2 border-gray-100 bg-white text-center">
          <p className="text-xs text-gray-500 mb-1">Montant total</p>
          <p className="text-xl font-bold" style={{ color: theme.primary }}>
            {montantTotal.toLocaleString()} FCFA
          </p>
        </div>
      </motion.div>

      {/* Liste */}
      {filtrées.map((c, i) => {
        const sc = STATUT_CMD_LABELS[c.statut];
        const initiales = c.produit.slice(0, 2).toUpperCase();
        const isAchat = c.acheteurType === profil || 
          (profil === 'marchand' && c.acheteurType === 'marchand');

        return (
          <motion.div
            key={c.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="bg-white rounded-2xl overflow-hidden"
            style={{ border: `2px solid ${sc.border}` }}
          >
            <div className="p-4 flex items-start gap-3">
              {/* Avatar + sens */}
              <div className="relative flex-shrink-0">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-sm"
                  style={{ background: `linear-gradient(135deg, ${sc.color}, ${sc.color}BB)` }}
                >
                  {initiales}
                </div>
                <div
                  className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center bg-white border"
                  style={{ borderColor: sc.color }}
                >
                  {isAchat
                    ? <ArrowDownLeft className="w-2.5 h-2.5" style={{ color: sc.color }} />
                    : <ArrowUpRight className="w-2.5 h-2.5" style={{ color: sc.color }} />}
                </div>
              </div>

              {/* Infos */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-gray-900 text-sm truncate pr-2">{c.produit}</h3>
                  <span
                    className="flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ backgroundColor: sc.bg, color: sc.color }}
                  >
                    {sc.label}
                  </span>
                </div>
                <div className="space-y-0.5 mt-1 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    <span>{c.quantite.toLocaleString()} {c.unite}</span>
                    <span className="mx-1">·</span>
                    <Banknote className="w-3 h-3" />
                    <span className="font-bold text-gray-700">{c.montantTotal.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(c.dateCreation).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
