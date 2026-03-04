// ═══════════════════════════════════════════════════════════════════
//  MarketplaceCard — Carte produit partagée entre les 3 profils
// ═══════════════════════════════════════════════════════════════════
import React from 'react';
import { motion } from 'motion/react';
import {
  MapPin, Banknote, Package, Star, ShoppingCart,
  Store, Users, Phone,
} from 'lucide-react';
import { ProduitMarche, Q_LABELS, THEME_PROFIL } from './marketplace-data';

interface MarketplaceCardProps {
  produit: ProduitMarche;
  profil: 'producteur' | 'cooperative' | 'marchand';
  index?: number;
  /** Action principale sur la carte */
  onAction?: (produit: ProduitMarche) => void;
  actionLabel?: string;
  /** Label bouton secondaire (optionnel) */
  onSecondary?: (produit: ProduitMarche) => void;
  secondaryLabel?: string;
  onClick?: (produit: ProduitMarche) => void;
}

export function MarketplaceCard({
  produit,
  profil,
  index = 0,
  onAction,
  actionLabel,
  onSecondary,
  secondaryLabel,
  onClick,
}: MarketplaceCardProps) {
  const theme = THEME_PROFIL[profil];
  const q = Q_LABELS[produit.qualite];
  const initiales = produit.vendeurNom.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const isCoop = produit.vendeurType === 'cooperative';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.04 }}
      className="bg-white rounded-2xl overflow-hidden"
      style={{ border: `2px solid ${isCoop ? theme.light : '#F3F4F6'}` }}
    >
      <motion.div
        className="p-4"
        onClick={() => onClick?.(produit)}
        whileHover={{ backgroundColor: '#FAFAFA' }}
        style={{ cursor: onClick ? 'pointer' : 'default' }}
      >
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-white text-base"
              style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.dark})` }}
            >
              {initiales}
            </div>
            {isCoop && (
              <motion.div
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ backgroundColor: theme.primary }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Store className="w-3 h-3 text-white" />
              </motion.div>
            )}
          </div>

          {/* Infos */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-base truncate">{produit.produit}</h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <div
                className="px-2 py-0.5 rounded-full text-xs font-bold"
                style={{ backgroundColor: `${theme.primary}15`, color: theme.primary }}
              >
                {produit.categorie}
              </div>
              <span
                className="px-2 py-0.5 rounded-full text-xs font-bold"
                style={{ backgroundColor: q.bg, color: q.color }}
              >
                {q.label}
              </span>
            </div>
            <div className="space-y-1 mt-2 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{produit.vendeurNom}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{produit.village} — {produit.region}</span>
              </div>
              <div className="flex items-center gap-1">
                <Banknote className="w-3 h-3 flex-shrink-0" />
                <span className="font-bold text-gray-700">
                  {produit.quantite.toLocaleString()} {produit.unite} ·{' '}
                  {produit.prixUnitaire.toLocaleString()} FCFA/{produit.unite}
                </span>
              </div>
              {produit.prixOrigine && (
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 flex-shrink-0 text-amber-500" />
                  <span className="text-amber-600 font-semibold">
                    Prix producteur : {produit.prixOrigine.toLocaleString()} FCFA/{produit.unite}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Score vendeur */}
          <div className="flex-shrink-0 flex flex-col items-center gap-1">
            <ScoreRing score={produit.scoreVendeur} color={theme.primary} />
            <p className="text-[9px] text-gray-400 font-bold">score</p>
          </div>
        </div>
      </motion.div>

      {/* Boutons action */}
      {(onAction || onSecondary) && (
        <div
          className={`px-4 pb-4 border-t-2 border-gray-50 pt-3 ${onAction && onSecondary ? 'grid grid-cols-2 gap-2' : ''}`}
        >
          {onAction && actionLabel && (
            <motion.button
              onClick={() => onAction(produit)}
              whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold border-2 transition-all text-white"
              style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.dark})`, borderColor: theme.primary }}
            >
              <ShoppingCart className="w-4 h-4" />
              {actionLabel}
            </motion.button>
          )}
          {onSecondary && secondaryLabel && (
            <motion.button
              onClick={() => onSecondary(produit)}
              whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold border-2 transition-all"
              style={{ borderColor: theme.primary, color: theme.primary, backgroundColor: theme.light }}
            >
              <Store className="w-4 h-4" />
              {secondaryLabel}
            </motion.button>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ─── Score Ring ───────────────────────────────────────────────────
function ScoreRing({ score, color, size = 44 }: { score: number; color: string; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  const c = score >= 71 ? '#16A34A' : score >= 41 ? '#EA580C' : '#DC2626';
  return (
    <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E5E7EB" strokeWidth={5} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={c} strokeWidth={5}
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - filled }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <span className="absolute text-[10px] font-bold" style={{ color: c }}>{score}</span>
    </div>
  );
}
