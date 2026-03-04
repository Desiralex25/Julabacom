import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
  Sparkles,
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

// Mock data
const transactionsData = [
  { jour: 'Lun', montant: 850000 },
  { jour: 'Mar', montant: 1200000 },
  { jour: 'Mer', montant: 950000 },
  { jour: 'Jeu', montant: 1450000 },
  { jour: 'Ven', montant: 1100000 },
  { jour: 'Sam', montant: 1650000 },
  { jour: 'Dim', montant: 900000 },
];

const commissionsData = [
  { mois: 'Jan', montant: 125000 },
  { mois: 'Fév', montant: 145000 },
  { mois: 'Mar', montant: 135000 },
];

const transactions = [
  {
    id: 1,
    type: 'commission',
    description: 'Commission commande groupée #1234',
    montant: 15000,
    date: "Aujourd'hui, 14:30",
    statut: 'recu',
  },
  {
    id: 2,
    type: 'cotisation',
    description: 'Cotisation mensuelle - Aminata T.',
    montant: 5000,
    date: "Aujourd'hui, 11:00",
    statut: 'recu',
  },
  {
    id: 3,
    type: 'commission',
    description: 'Commission commande groupée #1230',
    montant: 22000,
    date: 'Hier, 16:45',
    statut: 'recu',
  },
  {
    id: 4,
    type: 'cotisation',
    description: 'Cotisation mensuelle - Fatou K.',
    montant: 5000,
    date: 'Hier, 09:20',
    statut: 'recu',
  },
  {
    id: 5,
    type: 'paiement',
    description: 'Paiement producteur - Kouassi Jean',
    montant: -325000,
    date: '24 Fév, 14:00',
    statut: 'envoye',
  },
];

// Bulles flottantes
const BullesFlottantes = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white/10"
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

export function Finances() {
  const [stats, setStats] = useState({
    soldeTotal: 0,
    commissionsTotal: 0,
    cotisationsTotal: 0,
    paiementsEnvoyes: 0,
  });

  // Count-up animation
  useEffect(() => {
    const targets = {
      soldeTotal: 3250000,
      commissionsTotal: 425000,
      cotisationsTotal: 185000,
      paiementsEnvoyes: 2640000,
    };

    const duration = 1500;
    const steps = 60;
    const interval = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      
      setStats({
        soldeTotal: Math.floor(targets.soldeTotal * progress),
        commissionsTotal: Math.floor(targets.commissionsTotal * progress),
        cotisationsTotal: Math.floor(targets.cotisationsTotal * progress),
        paiementsEnvoyes: Math.floor(targets.paiementsEnvoyes * progress),
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
          Finances
        </motion.h1>
        <motion.button
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-[#2072AF] font-semibold text-sm"
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
        >
          <Download className="w-4 h-4" />
          Exporter
        </motion.button>
      </div>

      {/* Carte Solde Total */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-[#2072AF] to-[#1E3A8A] rounded-3xl p-6 shadow-2xl overflow-hidden"
      >
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
          <div className="flex items-center gap-2 mb-3">
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
              <Wallet className="w-5 h-5 text-white" strokeWidth={2.5} />
            </motion.div>
            <p className="text-white/90 font-medium">Solde Total Coopérative</p>
          </div>

          <motion.h1 
            className="text-5xl font-bold text-white mb-4 tracking-tight"
            animate={{
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 2,
            }}
          >
            {stats.soldeTotal.toLocaleString()}
            <span className="text-2xl ml-2 font-semibold">FCFA</span>
          </motion.h1>

          <motion.div 
            className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2"
            whileHover={{ scale: 1.05 }}
            animate={{
              y: [0, -3, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
            }}
          >
            <ArrowUpRight className="w-4 h-4 text-white" strokeWidth={3} />
            <span className="text-white font-bold text-lg">+18.5%</span>
            <span className="text-white/80 text-sm ml-1">vs mois dernier</span>
          </motion.div>
        </div>
      </motion.div>

      {/* 3 Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { 
            label: 'Commissions', 
            value: `${stats.commissionsTotal.toLocaleString('fr-FR')} FCFA`, 
            icon: TrendingUp, 
            color: 'green',
            bg: 'from-green-50 via-white to-green-50',
            border: 'border-green-200'
          },
          { 
            label: 'Cotisations', 
            value: `${stats.cotisationsTotal.toLocaleString('fr-FR')} FCFA`, 
            icon: CreditCard, 
            color: 'blue',
            bg: 'from-blue-50 via-white to-blue-50',
            border: 'border-blue-200'
          },
          { 
            label: 'Paiements', 
            value: `${stats.paiementsEnvoyes.toLocaleString('fr-FR')} FCFA`, 
            icon: DollarSign, 
            color: 'orange',
            bg: 'from-orange-50 via-white to-orange-50',
            border: 'border-orange-200'
          },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, type: 'spring' }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="relative bg-white rounded-2xl p-4 shadow-sm border border-gray-100 overflow-hidden"
          >
            {/* Particules */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 rounded-full bg-gradient-to-r from-blue-400 to-blue-600"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -15, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.5,
                  }}
                />
              ))}
            </div>

            <motion.div 
              className={`relative w-12 h-12 rounded-xl ${
                stat.color === 'green' ? 'bg-green-50' :
                stat.color === 'blue' ? 'bg-blue-50' :
                'bg-orange-50'
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
                'text-orange-600'
              }`} strokeWidth={2.5} />
            </motion.div>
            <p className="relative text-gray-500 text-xs mb-1">{stat.label}</p>
            <motion.p 
              className="relative text-2xl font-bold text-gray-900 mb-1"
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
            <p className={`relative text-xs font-semibold ${
              stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
            }`}>
              {stat.trend} ce mois
            </p>
          </motion.div>
        ))}
      </div>

      {/* Graphique Évolution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
      >
        <h2 className="text-lg font-bold text-gray-900 mb-4">Évolution des transactions (7j)</h2>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={transactionsData}>
              <Line 
                type="monotone" 
                dataKey="montant" 
                stroke="#2072AF" 
                strokeWidth={3}
                dot={{ fill: '#2072AF', r: 4 }}
              />
              <XAxis dataKey="jour" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255,255,255,0.95)', 
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
                formatter={(value: number) => `${value.toLocaleString()} F`}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Graphique Commissions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
      >
        <h2 className="text-lg font-bold text-gray-900 mb-4">Commissions mensuelles</h2>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={commissionsData}>
              <Bar 
                dataKey="montant" 
                fill="#2072AF" 
                radius={[8, 8, 0, 0]}
              />
              <XAxis dataKey="mois" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255,255,255,0.95)', 
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
                formatter={(value: number) => `${value.toLocaleString()} F`}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Historique Transactions */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Historique récent</h2>
        <div className="space-y-3">
          {transactions.map((transaction, index) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02, x: 5 }}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <motion.div 
                    className={`w-12 h-12 rounded-xl ${
                      transaction.type === 'commission' ? 'bg-green-50' :
                      transaction.type === 'cotisation' ? 'bg-blue-50' :
                      'bg-orange-50'
                    } flex items-center justify-center`}
                    animate={{
                      rotate: [0, -10, 10, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: index * 0.3,
                    }}
                  >
                    {transaction.montant > 0 ? (
                      <ArrowDownRight className={`w-6 h-6 ${
                        transaction.type === 'commission' ? 'text-green-600' :
                        transaction.type === 'cotisation' ? 'text-blue-600' :
                        'text-orange-600'
                      }`} />
                    ) : (
                      <ArrowUpRight className="w-6 h-6 text-orange-600" />
                    )}
                  </motion.div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{transaction.description}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {transaction.date}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <motion.p 
                    className={`text-xl font-bold ${
                      transaction.montant > 0 ? 'text-green-600' : 'text-orange-600'
                    }`}
                    animate={{
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.2,
                    }}
                  >
                    {transaction.montant > 0 ? '+' : ''}{transaction.montant.toLocaleString()} F
                  </motion.p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    transaction.statut === 'recu' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-orange-100 text-orange-700'
                  }`}>
                    {transaction.statut === 'recu' ? '✓ Reçu' : '→ Envoyé'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}