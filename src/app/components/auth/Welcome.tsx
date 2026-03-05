import React from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
const logoJulaba = '/images/logo-julaba.png';

export function Welcome() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between p-8"
      style={{ backgroundColor: '#C46210' }}
    >
      {/* Spacer top */}
      <div className="flex-1" />

      {/* Logo + Tagline centré verticalement */}
      <motion.div
        className="flex flex-col items-center text-center"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <img
          src={logoJulaba}
          alt="Jùlaba"
          className="w-72 h-auto"
        />
        <motion.p
          className="text-white/90 text-lg mt-3 tracking-wide"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          style={{ fontStyle: 'italic' }}
        >
          Ton djè est bien géré
        </motion.p>
      </motion.div>

      {/* Spacer bottom */}
      <div className="flex-1" />

      {/* Bouton Commencer */}
      <motion.div
        className="w-full max-w-xs pb-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5, ease: 'easeOut' }}
      >
        <motion.button
          onClick={() => navigate('/login')}
          className="w-full h-14 bg-white rounded-full text-lg font-bold shadow-lg"
          style={{ color: '#C46210' }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          Commencer
        </motion.button>
      </motion.div>
    </div>
  );
}