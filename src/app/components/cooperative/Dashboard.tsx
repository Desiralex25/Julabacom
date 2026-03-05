import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp,
  ShoppingCart,
  Users,
  Package,
  DollarSign,
  AlertCircle,
  Sparkles,
  ArrowUpRight,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

interface DashboardProps {
  onNavigate: (view: string) => void;
}

// Mock data
const demandesData = [
  { jour: 'Lun', volume: 450 },
  { jour: 'Mar', volume: 680 },
  { jour: 'Mer', volume: 520 },
  { jour: 'Jeu', volume: 890 },
  { jour: 'Ven', volume: 750 },
  { jour: 'Sam', volume: 920 },
  { jour: 'Dim', volume: 650 },
];

const topProduits = [
  { nom: 'Riz local', emoji: '🌾', volume: 1250, vendeurs: 15 },
  { nom: 'Tomates', emoji: '🍅', volume: 850, vendeurs: 22 },
  { nom: 'Oignons', emoji: '🧅', volume: 620, vendeurs: 18 },
];

const commandesGroupees = [
  { id: 1, produit: 'Riz local', emoji: '🌾', volume: 500, vendeurs: 8, statut: 'en_cours' },
  { id: 2, produit: 'Ignames', emoji: '🍠', volume: 350, vendeurs: 12, statut: 'prete' },
];

const producteurs = [
  { nom: 'Kouassi Jean', localisation: 'Yamoussoukro', disponible: true, enRetard: false },
  { nom: 'Koné Aminata', localisation: 'Bouaké', disponible: true, enRetard: false },
  { nom: 'Traoré Mamadou', localisation: 'Korhogo', disponible: false, enRetard: true },
];

// Bulles flottantes
const BullesFlottantes = ({ color = 'blue' }: { color?: string }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full ${
            color === 'blue' ? 'bg-blue-500/10' : 'bg-white/10'
          }`}
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
    caTotal: 0,
    tauxLivraison: 0,
    volumeFormalise: 0,
    cotisations: 0,
  });

  // Count-up animation
  useEffect(() => {
    const targets = {
      caTotal: 15750000,
      tauxLivraison: 94,
      volumeFormalise: 8250,
      cotisations: 1575000,
    };

    const duration = 1500;
    const steps = 60;
    const interval = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      
      setStats({
        caTotal: Math.floor(targets.caTotal * progress),
        tauxLivraison: Math.floor(targets.tauxLivraison * progress),
        volumeFormalise: Math.floor(targets.volumeFormalise * progress),
        cotisations: Math.floor(targets.cotisations * progress),
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <motion.h1 
          className="text-2xl font-bold text-gray-900"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Tableau de Bord
        </motion.h1>
        <motion.button
          onClick={() => onNavigate('membres')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-[#2072AF] font-semibold text-sm"
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
        >
          <Users className="w-4 h-4" />
          Membres
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      </div>

      {/* 1️⃣ BLOC DEMANDES AGRÉGÉES */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-[#2072AF] to-[#1E3A8A] rounded-3xl p-6 shadow-2xl overflow-hidden"
      >
        <BullesFlottantes color="white" />

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

        {/* Particules */}
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
          <div className="flex items-center gap-2 mb-4">
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
              <TrendingUp className="w-5 h-5 text-white" strokeWidth={2.5} />
            </motion.div>
            <h2 className="text-lg font-bold text-white">Demandes Agrégées (7j)</h2>
          </div>

          {/* Graphique */}
          <div className="h-32 min-h-[128px] mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={demandesData}>
                <Line 
                  type="monotone" 
                  dataKey="volume" 
                  stroke="#ffffff" 
                  strokeWidth={3}
                  dot={{ fill: '#ffffff', r: 4 }}
                />
                <XAxis dataKey="jour" stroke="#ffffff" opacity={0.7} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255,255,255,0.9)', 
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Top produits */}
          <div className="space-y-2">
            {topProduits.map((produit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-3 flex items-center gap-3"
              >
                <motion.span 
                  className="text-3xl"
                  animate={{
                    rotate: [0, -10, 10, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: index * 0.3,
                  }}
                >
                  {produit.emoji}
                </motion.span>
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm">{produit.nom}</p>
                  <p className="text-white/70 text-xs">{produit.vendeurs} marchands</p>
                </div>
                <motion.p 
                  className="text-white font-bold text-lg"
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.2,
                  }}
                >
                  {produit.volume} kg
                </motion.p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* 2️⃣ BLOC COMMANDES GROUPÉES */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <motion.h2 
            className="text-xl font-bold text-gray-900"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            Commandes Groupées
          </motion.h2>
          <motion.button
            onClick={() => onNavigate('commandes')}
            className="flex items-center gap-1 text-[#2072AF] font-semibold text-sm"
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
          >
            Voir tout
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>

        <div className="space-y-3">
          {commandesGroupees.map((cmd, index) => (
            <motion.div
              key={cmd.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, type: 'spring' }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="relative bg-white rounded-2xl p-4 shadow-sm border-2 border-blue-100 overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />

              <div className="relative z-10">
                <div className="flex items-start gap-3 mb-3">
                  <motion.div 
                    className="text-5xl"
                    animate={{
                      rotateY: [0, 15, -15, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      delay: index * 0.5,
                    }}
                  >
                    {cmd.emoji}
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="font-bold text-base text-gray-900 mb-1">{cmd.produit}</h3>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        {cmd.volume} kg
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {cmd.vendeurs} marchands
                      </span>
                    </div>
                  </div>
                  <motion.span 
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      cmd.statut === 'prete' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-orange-100 text-orange-700'
                    }`}
                    animate={{
                      scale: cmd.statut === 'prete' ? [1, 1.1, 1] : 1,
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: cmd.statut === 'prete' ? Infinity : 0,
                    }}
                  >
                    {cmd.statut === 'prete' ? '✓ Prête' : '⏳ En cours'}
                  </motion.span>
                </div>

                {cmd.statut === 'prete' && (
                  <motion.button
                    className="relative w-full py-3 rounded-xl bg-[#2072AF] text-white font-bold text-sm flex items-center justify-center gap-2 overflow-hidden"
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.02 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{
                        x: ['-100%', '100%'],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 1,
                      }}
                    />
                    <Zap className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">Lancer commande groupée</span>
                  </motion.button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 3️⃣ BLOC PRODUCTEURS ACTIFS */}
      <div>
        <motion.h2 
          className="text-xl font-bold text-gray-900 mb-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          Producteurs Actifs
        </motion.h2>

        <div className="space-y-2">
          {producteurs.map((prod, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center gap-3"
            >
              <motion.div
                className={`w-3 h-3 rounded-full ${
                  prod.disponible ? 'bg-green-500' : 'bg-red-500'
                }`}
                animate={{
                  scale: prod.disponible ? [1, 1.3, 1] : 1,
                  opacity: prod.disponible ? [1, 0.5, 1] : 1,
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              />
              <div className="flex-1">
                <p className="font-semibold text-sm text-gray-900">{prod.nom}</p>
                <p className="text-xs text-gray-500">{prod.localisation}</p>
              </div>
              {prod.enRetard && (
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                  }}
                >
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* 4️⃣ BLOC PERFORMANCE GLOBALE */}
      <div>
        <motion.h2 
          className="text-xl font-bold text-gray-900 mb-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          Performance Globale
        </motion.h2>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'CA Total', value: `${(stats.caTotal / 1000000).toFixed(1)}M F`, icon: DollarSign, color: 'green' },
            { label: 'Taux livraison', value: `${stats.tauxLivraison}%`, icon: TrendingUp, color: 'blue' },
            { label: 'Volume formalisé', value: `${(stats.volumeFormalise / 1000).toFixed(1)}T`, icon: Package, color: 'orange' },
            { label: 'Cotisations', value: `${stats.cotisations.toLocaleString('fr-FR')} FCFA`, icon: ShoppingCart, color: 'purple' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, type: 'spring' }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="relative bg-white rounded-2xl p-4 shadow-sm border border-gray-100 overflow-hidden"
            >
              <BullesFlottantes color="blue" />

              <motion.div 
                className={`relative w-12 h-12 rounded-xl ${
                  stat.color === 'green' ? 'bg-green-50' :
                  stat.color === 'blue' ? 'bg-blue-50' :
                  stat.color === 'orange' ? 'bg-orange-50' :
                  'bg-purple-50'
                } flex items-center justify-center mb-3`}
                animate={{
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: index * 0.3,
                }}
              >
                <stat.icon className={`w-6 h-6 ${
                  stat.color === 'green' ? 'text-green-600' :
                  stat.color === 'blue' ? 'text-[#2072AF]' :
                  stat.color === 'orange' ? 'text-orange-600' :
                  'text-purple-600'
                }`} strokeWidth={2.5} />
              </motion.div>
              <p className="relative text-gray-500 text-xs mb-1">{stat.label}</p>
              <motion.p 
                className="relative text-2xl font-bold text-gray-900"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.4,
                }}
              >
                {stat.value}
              </motion.p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}