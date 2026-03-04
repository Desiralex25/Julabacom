import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, TrendingUp, Users, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Card } from '../ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { ProfileSwitcher } from '../dev/ProfileSwitcher';

const volumeData = [
  { month: 'Jan', volume: 45 },
  { month: 'Fév', volume: 52 },
  { month: 'Mar', volume: 61 },
  { month: 'Avr', volume: 58 },
  { month: 'Mai', volume: 72 },
  { month: 'Juin', volume: 85 },
];

const roleData = [
  { name: 'Marchands', value: 6543, color: '#C46210' },
  { name: 'Producteurs', value: 4234, color: '#00563B' },
  { name: 'Coopératives', value: 145, color: '#2072AF' },
];

const regionData = [
  { region: 'Abidjan', transactions: 12543, volume: 450 },
  { region: 'Bouaké', transactions: 8932, volume: 320 },
  { region: 'San Pedro', transactions: 7654, volume: 280 },
  { region: 'Yamoussoukro', transactions: 6234, volume: 220 },
  { region: 'Daloa', transactions: 4532, volume: 180 },
];

export function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/institution')}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-900" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Analytics National</h1>
              <p className="text-sm text-gray-600">Plateforme JULABA - Données en temps réel</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Top KPIs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card className="p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(112, 41, 99, 0.13)' }}>
                <Users className="w-6 h-6" style={{ color: '#702963' }} />
              </div>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">12,543</h3>
            <p className="text-sm text-gray-600">Utilisateurs actifs</p>
            <p className="text-xs text-green-600 mt-2">+12% ce mois</p>
          </Card>

          <Card className="p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-100">
                <DollarSign className="w-6 h-6 text-blue-700" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">45,678</h3>
            <p className="text-sm text-gray-600">Transactions</p>
            <p className="text-xs text-green-600 mt-2">+18% ce mois</p>
          </Card>

          <Card className="p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-100">
                <TrendingUp className="w-6 h-6 text-green-700" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">125M</h3>
            <p className="text-sm text-gray-600">Volume (FCFA)</p>
            <p className="text-xs text-green-600 mt-2">+24% ce mois</p>
          </Card>

          <Card className="p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-orange-100">
                <Users className="w-6 h-6 text-orange-700" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">78/100</h3>
            <p className="text-sm text-gray-600">Score moyen</p>
            <p className="text-xs text-green-600 mt-2">+5pts ce mois</p>
          </Card>
        </motion.div>

        {/* Charts Row 1 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        >
          {/* Volume Evolution */}
          <Card className="p-6 rounded-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Évolution du volume (Millions FCFA)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '12px',
                  }}
                />
                <Line type="monotone" dataKey="volume" stroke="#702963" strokeWidth={3} dot={{ fill: '#702963', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Distribution by Role */}
          <Card className="p-6 rounded-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Répartition par rôle</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={roleData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {roleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Regional Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 rounded-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Performance par région</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={regionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="region" stroke="#6B7280" />
                <YAxis yAxisId="left" orientation="left" stroke="#6B7280" />
                <YAxis yAxisId="right" orientation="right" stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '12px',
                  }}
                />
                <Bar yAxisId="left" dataKey="transactions" fill="#2072AF" radius={[8, 8, 0, 0]} />
                <Bar yAxisId="right" dataKey="volume" fill="#00563B" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#2072AF' }} />
                <span className="text-sm text-gray-600">Transactions</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#00563B' }} />
                <span className="text-sm text-gray-600">Volume (M FCFA)</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Heatmap Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Card className="p-6 rounded-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Carte de Côte d'Ivoire - Heatmap des transactions</h3>
            <div className="aspect-video bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
              <div className="text-center">
                <p className="text-gray-500 font-semibold mb-2">Carte interactive</p>
                <p className="text-sm text-gray-400">Visualisation géographique des activités</p>
                <p className="text-xs text-gray-400 mt-4">🗺️ Intégration carte prévue avec Leaflet/Mapbox</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Dev Profile Switcher - Only in development */}
      <ProfileSwitcher />
    </div>
  );
}