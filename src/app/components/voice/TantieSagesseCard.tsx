import React from 'react';
import { Mic } from 'lucide-react';
import { motion } from 'motion/react';
import tantieSagesseAvatar from 'figma:asset/c57c6b035a1cf2a547f2ddf8ab7ca6884bc3980e.png';

interface TantieSagesseCardProps {
  onClick?: () => void;
  role: 'marchand' | 'producteur' | 'cooperative' | 'institution' | 'identificateur';
}

const ROLE_COLORS = {
  marchand: '#C66A2C',
  producteur: '#2E8B57',
  cooperative: '#2072AF',
  identificateur: '#9F8170',
  institution: '#712864',
};

const ROLE_MESSAGES = {
  marchand: 'Besoin d\'aide pour gérer ta journée ?',
  producteur: 'Besoin d\'aide avec tes récoltes ?',
  cooperative: 'Besoin d\'aide pour gérer les membres ?',
  identificateur: 'Besoin d\'aide avec les identifications ?',
  institution: 'Besoin d\'aide avec la plateforme ?',
};

export function TantieSagesseCard({ onClick, role }: TantieSagesseCardProps) {
  const roleColor = ROLE_COLORS[role] || ROLE_COLORS.marchand;
  const message = ROLE_MESSAGES[role] || ROLE_MESSAGES.marchand;

  return (
    <motion.button
      onClick={onClick}
      className="w-full bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 shadow-sm border border-purple-200 hover:shadow-md transition-shadow"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <img
            src={tantieSagesseAvatar}
            alt="Tantie Sagesse"
            className="w-14 h-14 rounded-full border-2 border-white shadow-sm"
          />
          <div
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center shadow-sm"
            style={{ backgroundColor: roleColor }}
          >
            <Mic className="w-3 h-3 text-white" />
          </div>
        </div>

        {/* Message */}
        <div className="flex-1 text-left">
          <p className="font-bold text-gray-900 text-sm">Tantie Sagesse</p>
          <p className="text-xs text-gray-600 mt-0.5">{message}</p>
        </div>

        {/* Indicateur */}
        <div className="flex-shrink-0">
          <motion.div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${roleColor}20` }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Mic className="w-4 h-4" style={{ color: roleColor }} />
          </motion.div>
        </div>
      </div>
    </motion.button>
  );
}
