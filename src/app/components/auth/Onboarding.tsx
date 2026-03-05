import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowRight, Phone } from 'lucide-react';
import { Button } from '../ui/button';
import { getSystemSettings } from '../../utils/api';

export function Onboarding() {
  const location = useLocation();
  const navigate = useNavigate();
  const phone = location.state?.phone || '';
  const [supportPhone, setSupportPhone] = useState<string>('');

  useEffect(() => {
    // Récupérer le numéro de support depuis le serveur
    getSystemSettings().then(response => {
      if (response.success && response.settings?.supportPhone) {
        setSupportPhone(response.settings.supportPhone);
      }
    }).catch(error => {
      console.error('Erreur récupération paramètres système:', error);
    });
  }, []);

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
          <p className="text-sm text-amber-800 font-medium mb-4">
            Pour créer ton compte, contacte un agent identificateur ou un administrateur Jùlaba.
          </p>
          
          {supportPhone && (
            <motion.a
              href={`tel:${supportPhone}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-3 bg-gradient-to-r from-[#C46210] to-[#A85108] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-shadow"
            >
              <Phone className="w-5 h-5" />
              <span>Appeler le support : {supportPhone}</span>
            </motion.a>
          )}
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
