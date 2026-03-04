import React from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { SupportContact } from './SupportContact';
import { getRoleColor } from '../../config/roleConfig';

type RoleType = 'marchand' | 'producteur' | 'cooperative' | 'institution' | 'identificateur' | 'administrateur';

export function SupportPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const role = (user?.role as RoleType) || 'marchand';
  const activeColor = getRoleColor(role);
  const userName = user ? `${user.prenoms || ''} ${user.nom || ''}`.trim() || 'Utilisateur' : 'Utilisateur';

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F5F5' }}>
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate(-1)}
        className="fixed top-4 left-4 z-40 w-11 h-11 rounded-2xl bg-white/90 backdrop-blur-sm shadow-md border-2 flex items-center justify-center"
        style={{ borderColor: `${activeColor}40` }}
      >
        <ArrowLeft className="w-5 h-5" style={{ color: activeColor }} />
      </motion.button>

      <SupportContact role={role} userName={userName} />
    </div>
  );
}