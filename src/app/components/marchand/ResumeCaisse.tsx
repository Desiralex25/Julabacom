import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { Navigation } from '../layout/Navigation';
import { useApp } from '../../contexts/AppContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { NotificationButton } from './NotificationButton';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

import { Montant, MontantCard } from '../shared/Montant';

type Period = 'today' | '7days' | '30days' | 'custom';

export function ResumeCaisse() {
  const navigate = useNavigate();
  const { getFinancialSummary, transactions, currentSession, speak, isOnline } = useApp();
  
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('today');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [expandedTransactionId, setExpandedTransactionId] = useState<string | null>(null);

  // Récupérer le résumé financier
  const financialData = useMemo(() => {
    return getFinancialSummary(selectedPeriod, customStart, customEnd);
  }, [getFinancialSummary, selectedPeriod, customStart, customEnd]);

  // Préparer les données pour le graphique d'évolution
  const evolutionData = useMemo(() => {
    let filteredTransactions = transactions;
    const today = new Date();
    const startDate = new Date(today);

    switch (selectedPeriod) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        filteredTransactions = transactions.filter(
          (t) => new Date(t.date) >= startDate
        );
        break;
      case '7days':
        startDate.setDate(today.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
        filteredTransactions = transactions.filter(
          (t) => new Date(t.date) >= startDate
        );
        break;
      case '30days':
        startDate.setDate(today.getDate() - 29);
        startDate.setHours(0, 0, 0, 0);
        filteredTransactions = transactions.filter(
          (t) => new Date(t.date) >= startDate
        );
        break;
      case 'custom':
        if (customStart && customEnd) {
          filteredTransactions = transactions.filter(
            (t) =>
              new Date(t.date) >= new Date(customStart) &&
              new Date(t.date) <= new Date(customEnd)
          );
        }
        break;
    }

    // Grouper par jour
    const groupedByDay: Record<string, { ventes: number; depenses: number; solde: number }> = {};
    filteredTransactions.forEach((t) => {
      const day = format(new Date(t.date), 'dd/MM', { locale: fr });
      if (!groupedByDay[day]) {
        groupedByDay[day] = { ventes: 0, depenses: 0, solde: 0 };
      }
      if (t.type === 'vente') {
        groupedByDay[day].ventes += t.price * t.quantity;
      } else if (t.type === 'depense') {
        groupedByDay[day].depenses += t.price * t.quantity;
      }
    });

    // Convertir en array pour le graphique
    let cumulativeSolde = currentSession?.fondInitial || 0;
    return Object.entries(groupedByDay).map(([day, data]) => {
      cumulativeSolde += data.ventes - data.depenses;
      return {
        day,
        ventes: data.ventes,
        depenses: data.depenses,
        solde: cumulativeSolde,
      };
    });
  }, [transactions, selectedPeriod, customStart, customEnd, currentSession]);

  // Préparer les données pour le camembert des dépenses
  const depensesData = useMemo(() => {
    let filteredTransactions = transactions;
    const today = new Date();
    const startDate = new Date(today);

    switch (selectedPeriod) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case '7days':
        startDate.setDate(today.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
        break;
      case '30days':
        startDate.setDate(today.getDate() - 29);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'custom':
        if (customStart) {
          startDate.setTime(new Date(customStart).getTime());
        }
        break;
    }

    filteredTransactions = filteredTransactions.filter(
      (t) => t.type === 'depense' && new Date(t.date) >= startDate
    );

    // Grouper par catégorie
    const groupedByCategory: Record<string, number> = {};
    filteredTransactions.forEach((t) => {
      const category = t.category || 'Autres';
      groupedByCategory[category] = (groupedByCategory[category] || 0) + t.price * t.quantity;
    });

    return Object.entries(groupedByCategory).map(([name, value]) => ({
      name,
      value,
    }));
  }, [transactions, selectedPeriod, customStart]);

  // Obtenir les transactions récentes filtrées
  const recentTransactions = useMemo(() => {
    let filteredTransactions = transactions;
    const today = new Date();
    const startDate = new Date(today);

    switch (selectedPeriod) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case '7days':
        startDate.setDate(today.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
        break;
      case '30days':
        startDate.setDate(today.getDate() - 29);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'custom':
        if (customStart && customEnd) {
          return transactions.filter(
            (t) =>
              new Date(t.date) >= new Date(customStart) &&
              new Date(t.date) <= new Date(customEnd)
          );
        }
        return [];
    }

    return transactions.filter((t) => new Date(t.date) >= startDate).slice(0, 20);
  }, [transactions, selectedPeriod, customStart, customEnd]);

  const soldeActuel = (currentSession?.fondInitial || 0) + financialData.totalVentes - financialData.totalDepenses;

  const COLORS = ['#C46210', '#00563B', '#2072AF', '#702963', '#F59E0B', '#EF4444'];

  const periodLabels: Record<Period, string> = {
    today: "Aujourd'hui",
    '7days': '7 derniers jours',
    '30days': '30 derniers jours',
    custom: 'Personnalisé',
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header fixe */}
      <div className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="flex items-center gap-4 px-6 py-4">
          <motion.button
            onClick={() => navigate('/marchand/produits')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(196, 98, 16, 0.1)' }}
          >
            <ArrowLeft className="w-5 h-5" style={{ color: '#C46210' }} />
          </motion.button>
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold" style={{ color: '#C46210' }}>
              Résumé caisse
            </h1>
            <p className="text-xs sm:text-sm text-gray-600">
              Tableau de bord financier
            </p>
          </div>
          
          {/* Bouton Notifications */}
          <NotificationButton />
          
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className="text-xs font-medium text-gray-600">
              {isOnline ? 'Sync' : 'Local'}
            </span>
          </div>
        </div>

        {/* Sélecteur de période */}
        <div className="px-6 pb-4">
          <div className="grid grid-cols-4 gap-2">
            {(['today', '7days', '30days', 'custom'] as Period[]).map((period) => (
              <motion.button
                key={period}
                onClick={() => {
                  setSelectedPeriod(period);
                  speak(periodLabels[period]);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  selectedPeriod === period
                    ? 'text-white'
                    : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-[#C46210]'
                }`}
                style={
                  selectedPeriod === period
                    ? { backgroundColor: '#C46210' }
                    : undefined
                }
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {periodLabels[period]}
              </motion.button>
            ))}
          </div>

          {/* Sélecteur de dates personnalisées */}
          <AnimatePresence>
            {selectedPeriod === 'custom' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 grid grid-cols-2 gap-2"
              >
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-[#C46210] focus:outline-none text-sm"
                />
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-[#C46210] focus:outline-none text-sm"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="px-6 py-4 space-y-4">
        {/* KPIs principaux */}
        <motion.div
          className="grid grid-cols-2 gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            className="p-4 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <p className="text-xs font-semibold text-gray-600">Total ventes</p>
            </div>
            <motion.p
              className="text-2xl font-bold text-green-700"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <Montant value={financialData.totalVentes} size="xl" color="#15803d" />
            </motion.p>
            <p className="text-xs text-gray-600 mt-1">
              {financialData.nombreVentes} vente{financialData.nombreVentes > 1 ? 's' : ''}
            </p>
          </motion.div>

          <motion.div
            className="p-4 rounded-2xl bg-gradient-to-br from-red-50 to-red-100 border border-red-200"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-red-600" />
              <p className="text-xs font-semibold text-gray-600">Total dépenses</p>
            </div>
            <motion.p
              className="text-2xl font-bold text-red-700"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <Montant value={financialData.totalDepenses} size="xl" color="#b91c1c" />
            </motion.p>
            <p className="text-xs text-gray-600 mt-1">
              {financialData.nombreDepenses} dépense{financialData.nombreDepenses > 1 ? 's' : ''}
            </p>
          </motion.div>
        </motion.div>

        {/* Bénéfice net et solde */}
        <motion.div
          className="grid grid-cols-2 gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <motion.div
            className={`p-4 rounded-2xl border ${
              financialData.beneficeNet >= 0
                ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'
                : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'
            }`}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-2 mb-2">
              {financialData.beneficeNet >= 0 ? (
                <ArrowUpRight className="w-5 h-5 text-green-600" />
              ) : (
                <ArrowDownRight className="w-5 h-5 text-red-600" />
              )}
              <p className="text-xs font-semibold text-gray-600">Bénéfice net</p>
            </div>
            <motion.p
              className={`text-2xl font-bold ${
                financialData.beneficeNet >= 0 ? 'text-green-700' : 'text-red-700'
              }`}
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <Montant value={financialData.beneficeNet} size="xl" color={financialData.beneficeNet >= 0 ? '#15803d' : '#b91c1c'} showPlus />
            </motion.p>
          </motion.div>

          <motion.div
            className="p-4 rounded-2xl border"
            style={{ backgroundColor: '#FFF7ED', borderColor: '#FED7AA' }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-5 h-5" style={{ color: '#C46210' }} />
              <p className="text-xs font-semibold text-gray-600">Solde actuel</p>
            </div>
            <motion.p
              className="text-2xl font-bold"
              style={{ color: '#C46210' }}
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <Montant value={soldeActuel} size="xl" color="#C46210" />
            </motion.p>
            <p className="text-xs text-gray-600 mt-1">
              Fond initial: <Montant value={currentSession?.fondInitial || 0} size="xs" color="#6b7280" />
            </p>
          </motion.div>
        </motion.div>

        {/* Moyenne de vente */}
        {financialData.moyenneVente > 0 && (
          <motion.div
            className="p-4 rounded-2xl bg-white border-2 border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5" style={{ color: '#C46210' }} />
              <p className="text-sm font-semibold text-gray-700">Moyenne par vente</p>
            </div>
            <p className="text-xl font-bold" style={{ color: '#C46210' }}>
              <Montant value={financialData.moyenneVente} size="lg" color="#C46210" />
            </p>
          </motion.div>
        )}

        {/* Graphique d'évolution des ventes */}
        {evolutionData.length > 0 && (
          <motion.div
            className="p-4 rounded-2xl bg-white border-2 border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-sm font-bold text-gray-800 mb-4">
              Évolution du solde
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={evolutionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" stroke="#9CA3AF" style={{ fontSize: '10px' }} />
                <YAxis stroke="#9CA3AF" style={{ fontSize: '10px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '2px solid #E5E7EB',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number) => `${value.toLocaleString()} FCFA`}
                />
                <Line
                  type="monotone"
                  dataKey="solde"
                  stroke="#C46210"
                  strokeWidth={3}
                  dot={{ fill: '#C46210', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Graphique camembert des dépenses */}
        {depensesData.length > 0 && (
          <motion.div
            className="p-4 rounded-2xl bg-white border-2 border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-sm font-bold text-gray-800 mb-4">
              Répartition des dépenses
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={depensesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {depensesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '2px solid #E5E7EB',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number) => `${value.toLocaleString()} FCFA`}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Top 5 produits */}
        {financialData.topProduits.length > 0 && (
          <motion.div
            className="p-4 rounded-2xl bg-white border-2 border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-sm font-bold text-gray-800 mb-3">
              Top 5 des produits
            </h3>
            <div className="space-y-2">
              {financialData.topProduits.map((product, index) => (
                <motion.div
                  key={product.productName}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.05 }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">
                        {product.productName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {product.quantity} unité{product.quantity > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <p className="font-bold" style={{ color: '#C46210' }}>
                    <Montant value={product.total} size="xs" color="#C46210" />
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Liste des transactions récentes */}
        <motion.div
          className="p-4 rounded-2xl bg-white border-2 border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-sm font-bold text-gray-800 mb-3">
            Transactions récentes
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {recentTransactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                onClick={() => setExpandedTransactionId(
                  expandedTransactionId === transaction.id ? null : transaction.id
                )}
                className={`p-3 rounded-xl cursor-pointer transition-colors ${
                  transaction.type === 'vente'
                    ? 'bg-green-50 hover:bg-green-100'
                    : 'bg-red-50 hover:bg-red-100'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.02 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {transaction.type === 'vente' ? (
                      <ArrowUpRight className="w-4 h-4 text-green-600" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-600" />
                    )}
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">
                        {transaction.productName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(transaction.date), 'dd MMM à HH:mm', { locale: fr })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold text-sm ${
                        transaction.type === 'vente' ? 'text-green-700' : 'text-red-700'
                      }`}
                    >
                      {transaction.type === 'vente' ? '+' : '-'}
                      {(transaction.price * transaction.quantity).toLocaleString()} <span className="text-[10px] font-bold opacity-70">FCFA</span>
                    </p>
                    {transaction.synced !== false ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-400 ml-auto" />
                    )}
                  </div>
                </div>

                {/* Détails extensibles */}
                <AnimatePresence>
                  {expandedTransactionId === transaction.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-600"
                    >
                      <div className="flex justify-between">
                        <span>Quantité:</span>
                        <span className="font-semibold">{transaction.quantity}</span>
                      </div>
                      {transaction.paymentMethod && (
                        <div className="flex justify-between mt-1">
                          <span>Paiement:</span>
                          <span className="font-semibold">{transaction.paymentMethod}</span>
                        </div>
                      )}
                      {transaction.category && (
                        <div className="flex justify-between mt-1">
                          <span>Catégorie:</span>
                          <span className="font-semibold">{transaction.category}</span>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Navigation */}
      <Navigation role="marchand" />
    </div>
  );
}