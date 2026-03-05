import React, { useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'motion/react';
import {
  ShoppingBag,
  Users,
  Package,
  Sparkles,
  ArrowRight,
  Check,
  Calendar,
  MapPin,
} from 'lucide-react';

interface Demande {
  id: string;
  marchand: string;
  avatar: string;
  produit: string;
  emoji: string;
  quantite: number;
  unite: string;
  dateCreation: string;
  localisation: string;
  priorite: 'normale' | 'urgente';
}

const mockDemandes: Demande[] = [
  {
    id: '1',
    marchand: 'Marché Adjamé - Aminata',
    avatar: '👩🏾',
    produit: 'Riz local',
    emoji: '🌾',
    quantite: 150,
    unite: 'kg',
    dateCreation: "Aujourd'hui, 14:30",
    localisation: 'Adjamé',
    priorite: 'urgente',
  },
  {
    id: '2',
    marchand: 'Coopérative Yopougon',
    avatar: '🏪',
    produit: 'Tomates fraîches',
    emoji: '🍅',
    quantite: 200,
    unite: 'kg',
    dateCreation: "Aujourd'hui, 11:15",
    localisation: 'Yopougon',
    priorite: 'normale',
  },
  {
    id: '3',
    marchand: 'Marché Plateau - Fatou',
    avatar: '👩🏾',
    produit: 'Ignames',
    emoji: '🍠',
    quantite: 100,
    unite: 'kg',
    dateCreation: 'Hier, 16:00',
    localisation: 'Plateau',
    priorite: 'normale',
  },
  {
    id: '4',
    marchand: 'Marché Abobo - Karim',
    avatar: '👨🏾',
    produit: 'Oignons',
    emoji: '🧅',
    quantite: 80,
    unite: 'kg',
    dateCreation: 'Hier, 09:30',
    localisation: 'Abobo',
    priorite: 'urgente',
  },
  {
    id: '5',
    marchand: 'Marché Cocody - Marie',
    avatar: '👩🏾',
    produit: 'Bananes plantain',
    emoji: '🍌',
    quantite: 50,
    unite: 'régimes',
    dateCreation: '24 Fév, 15:00',
    localisation: 'Cocody',
    priorite: 'normale',
  },
];

// Confetti pour transformation
const Confetti = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: ['#2072AF', '#60A5FA', '#34D399', '#FBBF24'][i % 4],
            left: `${Math.random() * 100}%`,
            top: '50%',
          }}
          animate={{
            y: [0, -200, -400],
            x: [(Math.random() - 0.5) * 200, (Math.random() - 0.5) * 400],
            rotate: [0, 360 * (Math.random() - 0.5) * 2],
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 1.5,
            delay: i * 0.03,
          }}
        />
      ))}
    </div>
  );
};

export function Demandes() {
  const [demandes, setDemandes] = useState<Demande[]>(mockDemandes);
  const [showSuccess, setShowSuccess] = useState(false);
  const [transformedDemande, setTransformedDemande] = useState<Demande | null>(null);

  const handleSwipe = (demandeId: string, info: PanInfo) => {
    const swipeThreshold = 150;
    
    if (info.offset.x > swipeThreshold) {
      // Swipe vers la droite → Transformer en commande
      const demande = demandes.find(d => d.id === demandeId);
      if (demande) {
        setTransformedDemande(demande);
        setShowSuccess(true);
        
        // Retirer de la liste après animation
        setTimeout(() => {
          setDemandes(demandes.filter(d => d.id !== demandeId));
          setShowSuccess(false);
          setTransformedDemande(null);
        }, 2000);
      }
    }
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <motion.h1 
        className="text-2xl font-bold text-gray-900"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Demandes des Marchands
      </motion.h1>

      {/* Stats rapides */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'En attente', value: demandes.length, color: 'orange' },
          { label: 'Urgentes', value: demandes.filter(d => d.priorite === 'urgente').length, color: 'red' },
          { label: "Aujourd'hui", value: demandes.filter(d => d.dateCreation.includes("Aujourd'hui")).length, color: 'blue' },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-white rounded-2xl p-4 shadow-sm border ${
              stat.color === 'red' ? 'border-red-100' :
              stat.color === 'orange' ? 'border-orange-100' :
              'border-blue-100'
            }`}
          >
            <p className="text-gray-500 text-xs mb-1">{stat.label}</p>
            <motion.p 
              className={`text-2xl font-bold ${
                stat.color === 'red' ? 'text-red-600' :
                stat.color === 'orange' ? 'text-orange-600' :
                'text-[#2072AF]'
              }`}
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: index * 0.3,
              }}
            >
              {stat.value}
            </motion.p>
          </motion.div>
        ))}
      </div>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-50 rounded-2xl p-4 flex items-center gap-3"
      >
        <motion.div
          animate={{
            x: [0, 10, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
          }}
        >
          <ArrowRight className="w-6 h-6 text-[#2072AF]" />
        </motion.div>
        <p className="text-sm text-gray-700">
          <span className="font-bold">Glissez vers la droite</span> pour transformer en commande groupée
        </p>
      </motion.div>

      {/* Liste des demandes avec swipe */}
      <div className="space-y-3">
        <AnimatePresence>
          {demandes.map((demande, index) => (
            <motion.div
              key={demande.id}
              layout
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ 
                opacity: 0, 
                x: 300,
                transition: { duration: 0.3 }
              }}
              transition={{ delay: index * 0.05 }}
              drag="x"
              dragConstraints={{ left: 0, right: 200 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => handleSwipe(demande.id, info)}
              whileDrag={{ scale: 1.05, rotateZ: 5 }}
              className={`relative bg-white rounded-2xl p-4 shadow-sm border-l-4 ${
                demande.priorite === 'urgente' ? 'border-red-500' : 'border-blue-500'
              } overflow-hidden cursor-grab active:cursor-grabbing`}
            >
              {/* Icône swipe en arrière-plan */}
              <motion.div
                className="absolute right-6 top-1/2 -translate-y-1/2"
                initial={{ opacity: 0, scale: 0 }}
                whileHover={{ opacity: 0.3, scale: 1 }}
              >
                <Check className="w-16 h-16 text-green-500" strokeWidth={3} />
              </motion.div>

              {/* Particules si urgente */}
              {demande.priorite === 'urgente' && (
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                      }}
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0, 1.5, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.4,
                      }}
                    >
                      <Sparkles className="w-3 h-3 text-red-400" />
                    </motion.div>
                  ))}
                </div>
              )}

              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <motion.div 
                      className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-2xl"
                      animate={{
                        rotate: [0, -10, 10, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: index * 0.3,
                      }}
                    >
                      {demande.avatar}
                    </motion.div>
                    <div>
                      <h3 className="font-bold text-sm text-gray-900">{demande.marchand}</h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {demande.dateCreation}
                      </p>
                    </div>
                  </div>

                  <motion.span 
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      demande.priorite === 'urgente'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                    animate={{
                      scale: demande.priorite === 'urgente' ? [1, 1.15, 1] : 1,
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: demande.priorite === 'urgente' ? Infinity : 0,
                    }}
                  >
                    {demande.priorite === 'urgente' ? '🔥 Urgent' : '✓ Normal'}
                  </motion.span>
                </div>

                {/* Produit demandé */}
                <div className="bg-gray-50 rounded-xl p-3 mb-3">
                  <div className="flex items-center gap-3">
                    <motion.div 
                      className="text-5xl"
                      animate={{
                        rotate: [0, -15, 15, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: index * 0.2,
                      }}
                    >
                      {demande.emoji}
                    </motion.div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">Produit demandé</p>
                      <p className="font-bold text-gray-900">{demande.produit}</p>
                    </div>
                    <motion.div 
                      className="text-right"
                      animate={{
                        scale: [1, 1.08, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                    >
                      <p className="text-2xl font-bold text-[#2072AF]">{demande.quantite}</p>
                      <p className="text-xs text-gray-500">{demande.unite}</p>
                    </motion.div>
                  </div>
                </div>

                {/* Localisation */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{demande.localisation}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {demandes.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <span className="text-6xl mb-4 block">✅</span>
            <p className="text-gray-500 font-semibold">Aucune demande en attente</p>
            <p className="text-sm text-gray-400">Toutes les demandes ont été traitées</p>
          </motion.div>
        )}
      </div>

      {/* Modal Succès Transformation */}
      <AnimatePresence>
        {showSuccess && transformedDemande && (
          <>
            <Confetti />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-6"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ type: 'spring', damping: 15 }}
                className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative overflow-hidden"
              >
                {/* Particules scintillantes */}
                <div className="absolute inset-0">
                  {[...Array(10)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                      }}
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0, 2, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    >
                      <Sparkles className="w-4 h-4 text-blue-400" />
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  className="w-24 h-24 rounded-full bg-green-100 mx-auto mb-4 flex items-center justify-center"
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                  }}
                >
                  <Check className="w-12 h-12 text-green-600" strokeWidth={3} />
                </motion.div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">Commande créée !</h2>
                <p className="text-gray-600 mb-4">La demande a été transformée en commande groupée</p>
                
                <div className="bg-blue-50 rounded-2xl p-4">
                  <motion.div 
                    className="text-6xl mb-2"
                    animate={{
                      rotateY: [0, 360],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  >
                    {transformedDemande.emoji}
                  </motion.div>
                  <p className="font-bold text-gray-900">{transformedDemande.produit}</p>
                  <motion.p 
                    className="text-3xl font-bold text-[#2072AF] mt-2"
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                    }}
                  >
                    {transformedDemande.quantite} {transformedDemande.unite}
                  </motion.p>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}