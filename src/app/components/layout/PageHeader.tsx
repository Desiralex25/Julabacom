import React, { ReactNode } from 'react';
import { motion } from 'motion/react';

interface PageHeaderProps {
  title: string;
  rightContent?: ReactNode;
  backgroundColor?: string;
  children?: ReactNode; // contenu additionnel sous le titre (sous-titre, onglets, etc.)
}

/**
 * Header fixe universel pour toutes les sous-pages (Marché, Finances, Commandes…)
 * Remplace les multiples `fixed top-0` codés manuellement avec un padding top cohérent.
 * - Mobile : pt-10 pour laisser la place à la barre de statut Android
 * - Desktop : pt-4 (la sidebar gère l'espace)
 */
export function PageHeader({ title, rightContent, backgroundColor = 'bg-[#F5F0ED]', children }: PageHeaderProps) {
  return (
    <motion.div
      className={`fixed top-0 left-0 right-0 z-40 ${backgroundColor}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="px-4 pt-10 pb-3 lg:pt-4 lg:pb-3 lg:pl-[320px] max-w-2xl lg:max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-3">
          <h1 className="flex-1 font-bold text-gray-900 text-xl sm:text-2xl">{title}</h1>
          {rightContent && <div className="flex items-center gap-2">{rightContent}</div>}
        </div>
        {children && <div className="mt-2">{children}</div>}
      </div>
    </motion.div>
  );
}
