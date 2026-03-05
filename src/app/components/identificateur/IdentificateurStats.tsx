import React, { useState } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Users, Target, Calendar, Award } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const PRIMARY_COLOR = '#9F8170';
const SECONDARY_COLOR = '#DAC8AE';

type Period = 'semaine' | 'mois' | 'annee';

export function IdentificateurStats() {
  const { user } = useUser();
  const [period, setPeriod] = useState<Period>('mois');

  if (!user) return null;

  // Données mock pour les graphiques
  const evolutionData = [
    { date: 'Lun', identifications: 2 },
    { date: 'Mar', identifications: 5 },
    { date: 'Mer', identifications: 3 },
    { date: 'Jeu', identifications: 8 },
    { date: 'Ven', identifications: 6 },
    { date: 'Sam', identifications: 4 },
    { date: 'Dim', identifications: 1 },
  ];

  const communeData = [
    { name: 'Yopougon', value: 45 },
    { name: 'Adjamé', value: 30 },
    { name: 'Cocody', value: 15 },
    { name: 'Marcory', value: 10 },
  ];

  const produitsData = [
    { produit: 'Riz', nombre: 12 },
    { produit: 'Tomates', nombre: 10 },
    { produit: 'Oignons', nombre: 8 },
    { produit: 'Maïs', nombre: 7 },
    { produit: 'Attiéké', nombre: 6 },
  ];

  const COLORS = [PRIMARY_COLOR, SECONDARY_COLOR, '#E5C4A1', '#B89176'];

  const stats = {
    total: 100,
    croissance: 15,
    objectifMois: 120,
    moyenne: 4.3,
  };

  const progressPercent = (stats.total / stats.objectifMois) * 100;

  return (
    <div className="pb-32 lg:pb-8 pt-16 lg:pt-10 px-4 lg:pl-[320px] max-w-2xl lg:max-w-7xl mx-auto min-h-screen">
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-gray-900">Statistiques</h1>
        <p className="text-gray-600 mt-1">
          Tes performances et KPIs
        </p>
      </motion.div>

      {/* KPIs principaux */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        <div className="bg-white rounded-2xl shadow-md p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5" style={{ color: PRIMARY_COLOR }} />
            <span className="text-sm text-gray-600">Total</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-500 mt-1">marchands identifiés</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-600">Croissance</span>
          </div>
          <p className="text-3xl font-bold text-green-500">+{stats.croissance}%</p>
          <p className="text-xs text-gray-500 mt-1">vs mois dernier</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5" style={{ color: PRIMARY_COLOR }} />
            <span className="text-sm text-gray-600">Objectif</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.objectifMois}</p>
          <p className="text-xs text-gray-500 mt-1">ce mois</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5" style={{ color: PRIMARY_COLOR }} />
            <span className="text-sm text-gray-600">Moyenne/jour</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.moyenne}</p>
          <p className="text-xs text-gray-500 mt-1">identifications</p>
        </div>
      </motion.div>

      {/* Objectif du mois */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-md p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5" style={{ color: PRIMARY_COLOR }} />
            <h2 className="font-semibold text-gray-900">Objectif du mois</h2>
          </div>
          <span className="text-sm font-medium" style={{ color: PRIMARY_COLOR }}>
            {stats.total} / {stats.objectifMois}
          </span>
        </div>

        <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden mb-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ backgroundColor: PRIMARY_COLOR }}
          />
        </div>

        <p className="text-sm text-gray-600">
          {progressPercent >= 100 ? (
            <span className="text-green-500 font-semibold">🎉 Objectif atteint !</span>
          ) : (
            <>
              Plus que <span className="font-semibold" style={{ color: PRIMARY_COLOR }}>
                {stats.objectifMois - stats.total}
              </span> identifications pour atteindre ton objectif
            </>
          )}
        </p>
      </motion.div>

      {/* Évolution des identifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-md p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-gray-900">Évolution cette semaine</h2>
          
          <div className="flex gap-2">
            {(['semaine', 'mois', 'annee'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className="px-3 py-1 rounded-lg text-sm font-medium transition-all"
                style={{
                  backgroundColor: period === p ? PRIMARY_COLOR : 'transparent',
                  color: period === p ? 'white' : '#6B7280',
                }}
              >
                {p === 'semaine' ? '7J' : p === 'mois' ? '30J' : '1A'}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-[250px]">
          <ResponsiveContainer width="100%" height={250}>
          <LineChart data={evolutionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="date" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
            <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            />
            <Line
              type="monotone"
              dataKey="identifications"
              stroke={PRIMARY_COLOR}
              strokeWidth={3}
              dot={{ fill: PRIMARY_COLOR, r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Répartition par commune */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl shadow-md p-6 mb-6"
      >
        <h2 className="font-semibold text-gray-900 mb-6">Répartition par commune</h2>
        
        <div className="min-h-[250px]">
          <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={communeData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {communeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Top produits identifiés */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl shadow-md p-6"
      >
        <h2 className="font-semibold text-gray-900 mb-6">Top produits identifiés</h2>
        
        <div className="min-h-[300px]">
          <ResponsiveContainer width="100%" height={300}>
          <BarChart data={produitsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="produit" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
            <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            />
            <Bar dataKey="nombre" fill={PRIMARY_COLOR} radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}