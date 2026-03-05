import React from 'react';
import { useLocation, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';

export function Onboarding() {
  const location = useLocation();
  const navigate = useNavigate();
  const phone = location.state?.phone || '';

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#C46210] to-[#A85108] flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md text-center"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Bienvenue sur Jùlaba !
        </h1>
        
        <p className="text-gray-600 mb-6">
          Ton numéro <span className="font-bold text-[#C46210]">{phone}</span> n'est pas encore enregistré.
        </p>

        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 mb-6">
          <p className="text-sm text-amber-800 font-medium">
            Pour créer ton compte, contacte un agent identificateur ou un administrateur Jùlaba.
          </p>
        </div>

        <Button
          onClick={() => navigate('/')}
          className="w-full h-14 rounded-2xl text-lg font-semibold"
          style={{ backgroundColor: '#C46210' }}
        >
          Retour à la connexion
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </motion.div>
    </div>
  );
}
