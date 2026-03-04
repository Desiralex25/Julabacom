import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Package, 
  DollarSign,
  Clock,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Zap,
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (view: string) => void;
}

// Données mock
const commandesRecentes = [
  {
    id: 1,
    client: 'Coopérative Espoir du Plateau',
    avatar: '🏪',
    temps: 'Il y a 15 min',
    produit: 'Tomates',
    icon: '🍅',
    quantite: '500 kg',
    montant: 375000,
    statut: 'nouvelle',
  },
  {
    id: 2,
    client: 'Marché Adjamé - Aminata Traoré',
    avatar: '👩🏾',
    temps: 'Il y a 1h',
    produit: 'Aubergines locales',
    icon: '🍆',
    quantite: '200 kg',
    montant: 160000,
    statut: 'nouvelle',
  },
];

const stocksAlerte = [
  { nom: 'Gombo', quantite: 25, seuil: 50, emoji: '🫛' },
  { nom: 'Piment', quantite: 80, seuil: 100, emoji: '🌶️' },
];

// Bulles flottantes
const BullesFlottantes = ({ color = 'white' }: { color?: string }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full ${color === 'white' ? 'bg-white/10' : 'bg-green-500/10'}`}
          style={{
            width: Math.random() * 80 + 40,
            height: Math.random() * 80 + 40,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -25, 0],
            x: [0, Math.random() * 15 - 7.5, 0],
            scale: [1, 1.15, 1],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
};

export function Dashboard({ onNavigate }: DashboardProps) {
  const [stats, setStats] = useState({
    revenuJour: 0,
    commandesNouvelles: 0,
    produitsStock: 0,
    alertesStock: 0,
  });

  // Animation count-up
  useEffect(() => {
    const targets = {
      revenuJour: 1875000,
      commandesNouvelles: 8,
      produitsStock: 8,
      alertesStock: 2,
    };

    const duration = 1200;
    const steps = 50;
    const interval = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      
      setStats({
        revenuJour: Math.floor(targets.revenuJour * progress),
        commandesNouvelles: Math.floor(targets.commandesNouvelles * progress),
        produitsStock: Math.floor(targets.produitsStock * progress),
        alertesStock: Math.floor(targets.alertesStock * progress),
      });

      if (step >= steps) {
        setStats(targets);
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6 pb-6">
      {/* Stats Grid - Card hero + 2 petites */}
      <div className="grid grid-cols-2 gap-3">
        {/* Revenu du jour - Full width avec animations */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.02 }}
          className="col-span-2 relative bg-gradient-to-br from-[#00563B] to-[#16A34A] rounded-2xl p-5 shadow-lg overflow-hidden"
        >
          {/* Bulles flottantes */}
          <BullesFlottantes />

          {/* Gradient animé */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatDelay: 1,
            }}
          />

          {/* Particules scintillantes */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              >
                <Sparkles className="w-3 h-3 text-yellow-300" />
              </motion.div>
            ))}
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <motion.div 
                className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
                animate={{
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                <DollarSign className="w-5 h-5 text-white" strokeWidth={2.5} />
              </motion.div>
              <p className="text-white/90 font-medium text-sm">Revenu du jour</p>
            </div>
            <motion.p 
              className="text-4xl font-bold text-white mb-1"
              animate={{
                scale: [1, 1.03, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              {stats.revenuJour.toLocaleString()}
              <span className="text-lg ml-1">F</span>
            </motion.p>
            <motion.div 
              className="flex items-center gap-1 text-white/80 text-xs"
              animate={{
                y: [0, -2, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            >
              <TrendingUp className="w-3 h-3" />
              <span>+15% vs hier</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Nouvelles commandes */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          onClick={() => onNavigate('commandes')}
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.95 }}
          className="relative bg-white rounded-2xl p-4 shadow-sm border border-gray-100 overflow-hidden"
        >
          {/* Particules */}
          <BullesFlottantes color="orange" />
          
          <motion.div 
            className="relative w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center mb-3"
            animate={{
              rotate: [0, -10, 10, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
            }}
          >
            <Clock className="w-6 h-6 text-orange-600" strokeWidth={2.5} />
          </motion.div>
          <p className="relative text-gray-500 text-xs mb-1">Nouvelles</p>
          <motion.p 
            className="relative text-3xl font-bold text-gray-900"
            animate={{
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            {stats.commandesNouvelles}
          </motion.p>
          
          {/* Badge pulsant */}
          {stats.commandesNouvelles > 0 && (
            <motion.div
              className="absolute top-2 right-2 w-2 h-2 rounded-full bg-orange-500"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [1, 0.5, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            />
          )}
        </motion.div>

        {/* Produits en stock */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          onClick={() => onNavigate('stocks')}
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.95 }}
          className="relative bg-white rounded-2xl p-4 shadow-sm border border-gray-100 overflow-hidden"
        >
          <BullesFlottantes color="green" />
          
          <motion.div 
            className="relative w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mb-3"
            animate={{
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: 0.5,
            }}
          >
            <Package className="w-6 h-6 text-[#00563B]" strokeWidth={2.5} />
          </motion.div>
          <p className="relative text-gray-500 text-xs mb-1">Produits</p>
          <motion.p 
            className="relative text-3xl font-bold text-gray-900"
            animate={{
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 0.3,
            }}
          >
            {stats.produitsStock}
          </motion.p>
        </motion.div>
      </div>

      {/* Commandes récentes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <motion.h2 
            className="text-xl font-bold text-gray-900"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            Commandes Récentes
          </motion.h2>
          <motion.button
            onClick={() => onNavigate('commandes')}
            className="flex items-center gap-1 text-[#00563B] font-semibold text-sm"
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
          >
            Voir tout
            <motion.div
              animate={{
                x: [0, 3, 0],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
              }}
            >
              <ChevronRight className="w-4 h-4" />
            </motion.div>
          </motion.button>
        </div>

        <div className="space-y-3">
          {commandesRecentes.map((cmd, index) => (
            <motion.div
              key={cmd.id}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, type: 'spring' }}
              onClick={() => onNavigate('commandes')}
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
              className="relative bg-white rounded-2xl p-4 shadow-sm border-l-4 border-orange-400 overflow-hidden"
            >
              {/* Effet de brillance */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <motion.div 
                      className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-2xl"
                      animate={{
                        rotate: [0, -8, 8, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: index * 0.5,
                      }}
                    >
                      {cmd.avatar}
                    </motion.div>
                    <div>
                      <h3 className="font-bold text-sm text-gray-900">{cmd.client}</h3>
                      <p className="text-xs text-gray-500">{cmd.temps}</p>
                    </div>
                  </div>
                  <motion.span 
                    className="px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-700"
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                    }}
                  >
                    En attente
                  </motion.span>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <motion.div 
                    className="bg-gray-50 rounded-xl p-2 flex items-center gap-2 hover:bg-green-50"
                  >
                    <motion.span 
                      className="text-2xl"
                      animate={{
                        rotate: [0, -10, 10, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                    >
                      {cmd.icon}
                    </motion.span>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Produit</p>
                      <p className="font-semibold text-xs text-gray-900">{cmd.produit}</p>
                    </div>
                  </motion.div>
                  <div className="bg-gray-50 rounded-xl p-2">
                    <p className="text-xs text-gray-500">Quantité</p>
                    <p className="font-semibold text-xs text-gray-900">{cmd.quantite}</p>
                  </div>
                </div>

                <motion.p 
                  className="text-2xl font-bold text-[#00563B]"
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.3,
                  }}
                >
                  {cmd.montant.toLocaleString()} FCFA
                </motion.p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Alertes stock avec animations */}
      {stocksAlerte.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <motion.h2 
              className="text-xl font-bold text-gray-900"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              Alertes Stock
            </motion.h2>
            <motion.button
              onClick={() => onNavigate('stocks')}
              className="flex items-center gap-1 text-red-600 font-semibold text-sm"
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
            >
              Voir tout
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {stocksAlerte.map((stock, index) => (
              <motion.div
                key={stock.nom}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, type: 'spring' }}
                onClick={() => onNavigate('stocks')}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="relative bg-white rounded-2xl p-4 shadow-sm border-2 border-red-200 overflow-hidden"
              >
                {/* Effet pulsant rouge */}
                <motion.div
                  className="absolute inset-0 bg-red-50"
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-2">
                    <motion.div 
                      className="text-4xl"
                      animate={{
                        rotate: [0, -15, 15, 0],
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.5,
                      }}
                    >
                      {stock.emoji}
                    </motion.div>
                    <motion.span 
                      className="px-2 py-1 rounded-lg bg-red-500 text-white text-xs font-bold flex items-center gap-1"
                      animate={{
                        scale: [1, 1.15, 1],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                      }}
                    >
                      <AlertCircle className="w-3 h-3" />
                      Bas
                    </motion.span>
                  </div>
                  <h3 className="font-bold text-sm text-gray-900 mb-2">{stock.nom}</h3>
                  <div className="flex items-baseline gap-1">
                    <motion.span 
                      className="text-xl font-bold text-red-600"
                      animate={{
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                    >
                      {stock.quantite}
                    </motion.span>
                    <span className="text-xs text-gray-500">/ {stock.seuil} kg</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Actions rapides */}
      <div>
        <motion.h2 
          className="text-xl font-bold text-gray-900 mb-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          Actions rapides
        </motion.h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Package, label: 'Gérer stocks', sublabel: 'Ajouter produits', color: 'green', action: 'stocks' },
            { icon: TrendingUp, label: 'Voir revenus', sublabel: 'Historique ventes', color: 'blue', action: 'revenus' },
          ].map((item, index) => (
            <motion.button
              key={item.label}
              onClick={() => onNavigate(item.action)}
              className={`relative p-4 rounded-2xl bg-gradient-to-br ${
                item.color === 'green' ? 'from-green-50 to-green-100 border-green-200' : 'from-blue-50 to-blue-100 border-blue-200'
              } border text-left overflow-hidden`}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05, y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              {/* Effet de brillance */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 2,
                  delay: index * 0.5,
                }}
              />
              
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: index * 0.5,
                }}
              >
                <item.icon className={`relative w-8 h-8 ${
                  item.color === 'green' ? 'text-[#00563B]' : 'text-blue-600'
                } mb-2`} strokeWidth={2} />
              </motion.div>
              <p className="relative font-bold text-sm text-gray-900">{item.label}</p>
              <p className="relative text-xs text-gray-600">{item.sublabel}</p>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
