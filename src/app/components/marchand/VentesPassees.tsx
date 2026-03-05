import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Receipt,
  Calendar,
  Filter,
  Search,
  CreditCard,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Package,
  ChevronDown,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { Navigation } from '../layout/Navigation';
import { useApp } from '../../contexts/AppContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { NotificationButton } from './NotificationButton';
import { Montant } from '../shared/Montant';

export function VentesPassees() {
  const navigate = useNavigate();
  const { getSalesHistory, speak, isOnline } = useApp();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSale, setSelectedSale] = useState<string | null>(null);

  // Récupérer l'historique avec les filtres
  const salesHistory = useMemo(() => {
    return getSalesHistory({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      productName: selectedProduct || searchQuery || undefined,
      paymentMethod: selectedPaymentMethod || undefined,
    });
  }, [getSalesHistory, startDate, endDate, selectedProduct, searchQuery, selectedPaymentMethod]);

  // Calculer les statistiques
  const stats = useMemo(() => {
    const totalVentes = salesHistory.reduce((acc, sale) => acc + (sale.price * sale.quantity), 0);
    const totalMarges = salesHistory.reduce((acc, sale) => acc + (sale.totalMargin || 0), 0);
    const nombreVentes = salesHistory.length;
    
    return { totalVentes, totalMarges, nombreVentes };
  }, [salesHistory]);

  // Obtenir la liste des produits uniques
  const uniqueProducts = useMemo(() => {
    const products = salesHistory.map(s => s.productName);
    return Array.from(new Set(products)).sort();
  }, [salesHistory]);

  // Obtenir la liste des modes de paiement uniques
  const paymentMethods = useMemo(() => {
    const methods = salesHistory
      .map(s => s.paymentMethod)
      .filter(m => m);
    return Array.from(new Set(methods)).sort();
  }, [salesHistory]);

  const handleSaleClick = (saleId: string) => {
    setSelectedSale(selectedSale === saleId ? null : saleId);
    speak('Détails de la vente');
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedProduct('');
    setSelectedPaymentMethod('');
    setStartDate('');
    setEndDate('');
    speak('Filtres réinitialisés');
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
              Ventes passées
            </h1>
            <p className="text-xs sm:text-sm text-gray-600">
              Historique complet de tes ventes
            </p>
          </div>
          
          {/* Bouton Notifications */}
          <NotificationButton />
          
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className="text-xs font-medium text-gray-600">
              {isOnline ? 'En ligne' : 'Hors ligne'}
            </span>
          </div>
        </div>

        {/* KPIs rapides */}
        <div className="grid grid-cols-3 gap-3 px-6 pb-4">
          <motion.div
            className="p-3 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200"
            whileHover={{ scale: 1.02 }}
          >
            <p className="text-xs font-semibold text-gray-600 mb-1">Total ventes</p>
            <p className="text-lg font-bold text-green-700">
              <Montant value={stats.totalVentes} size="md" color="#15803d" />
            </p>
          </motion.div>

          <motion.div
            className="p-3 rounded-2xl border border-gray-200"
            style={{ backgroundColor: '#FFF7ED' }}
            whileHover={{ scale: 1.02 }}
          >
            <p className="text-xs font-semibold text-gray-600 mb-1">Marges</p>
            <p className="text-lg font-bold" style={{ color: '#C46210' }}>
              <Montant value={stats.totalMarges} size="md" color="#C46210" />
            </p>
          </motion.div>

          <motion.div
            className="p-3 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200"
            whileHover={{ scale: 1.02 }}
          >
            <p className="text-xs font-semibold text-gray-600 mb-1">Nombre</p>
            <p className="text-lg font-bold text-blue-700">{stats.nombreVentes}</p>
          </motion.div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="px-6 py-4">
        {/* Barre de recherche */}
        <motion.div
          className="mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border-2 border-gray-200 focus:border-[#C46210] focus:outline-none transition-colors"
            />
          </div>
        </motion.div>

        {/* Bouton filtres */}
        <motion.button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full mb-4 flex items-center justify-between px-4 py-3 rounded-2xl bg-white border-2 border-gray-200 hover:border-[#C46210] transition-colors"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5" style={{ color: '#C46210' }} />
            <span className="font-semibold text-gray-700">Filtres avancés</span>
          </div>
          <motion.div
            animate={{ rotate: showFilters ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </motion.div>
        </motion.button>

        {/* Panel de filtres */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 overflow-hidden"
            >
              <div className="p-4 rounded-2xl bg-white border-2 border-gray-200 space-y-3">
                {/* Filtres par date */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1 block">
                      Date début
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-[#C46210] focus:outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1 block">
                      Date fin
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-[#C46210] focus:outline-none text-sm"
                    />
                  </div>
                </div>

                {/* Filtre par produit */}
                {uniqueProducts.length > 0 && (
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1 block">
                      Produit
                    </label>
                    <select
                      value={selectedProduct}
                      onChange={(e) => setSelectedProduct(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-[#C46210] focus:outline-none text-sm"
                    >
                      <option value="">Tous les produits</option>
                      {uniqueProducts.map((product) => (
                        <option key={product} value={product}>
                          {product}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Filtre par mode de paiement */}
                {paymentMethods.length > 0 && (
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1 block">
                      Mode de paiement
                    </label>
                    <select
                      value={selectedPaymentMethod}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-[#C46210] focus:outline-none text-sm"
                    >
                      <option value="">Tous les modes</option>
                      {paymentMethods.map((method) => (
                        <option key={method} value={method}>
                          {method}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Bouton réinitialiser */}
                <motion.button
                  onClick={resetFilters}
                  className="w-full px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm transition-colors"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  Réinitialiser les filtres
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Liste des ventes */}
        <div className="space-y-3">
          {salesHistory.length === 0 ? (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Receipt className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-semibold text-gray-600 mb-1">
                Aucune vente trouvée
              </p>
              <p className="text-sm text-gray-500">
                Essaie de modifier tes filtres
              </p>
            </motion.div>
          ) : (
            salesHistory.map((sale, index) => (
              <motion.div
                key={sale.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <motion.div
                  onClick={() => handleSaleClick(sale.id)}
                  className="p-4 rounded-2xl bg-white border-2 border-gray-200 hover:border-[#C46210] transition-colors cursor-pointer"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {/* En-tête de la vente */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 mb-1">
                        {sale.productName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {format(new Date(sale.date), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {sale.synced !== false ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Montant principal */}
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-600">
                      {sale.quantity} × {sale.price.toLocaleString()} <span className="text-[10px] opacity-60">FCFA</span>
                    </span>
                    <span className="text-xl font-bold" style={{ color: '#C46210' }}>
                      <Montant value={sale.price * sale.quantity} size="lg" color="#C46210" />
                    </span>
                  </div>

                  {/* Mode de paiement */}
                  {sale.paymentMethod && (
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{sale.paymentMethod}</span>
                    </div>
                  )}

                  {/* Détails extensibles */}
                  <AnimatePresence>
                    {selectedSale === sale.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 pt-3 border-t border-gray-200 space-y-2"
                      >
                        {sale.margin && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-600">
                              Marge unitaire
                            </span>
                            <span className="text-sm font-bold text-green-700">
                              {sale.margin.toLocaleString()} <span className="text-[10px] opacity-60">FCFA</span>
                            </span>
                          </div>
                        )}
                        {sale.totalMargin && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-600">
                              Marge totale
                            </span>
                            <span className="text-sm font-bold text-green-700">
                              +{sale.totalMargin.toLocaleString()} <span className="text-[10px] opacity-60">FCFA</span>
                            </span>
                          </div>
                        )}
                        {sale.purchasePrice && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-600">
                              Prix d'achat unitaire
                            </span>
                            <span className="text-sm text-gray-700">
                              {sale.purchasePrice.toLocaleString()} <span className="text-[10px] opacity-60">FCFA</span>
                            </span>
                          </div>
                        )}
                        {sale.category && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-600">
                              Catégorie
                            </span>
                            <span className="text-sm text-gray-700">{sale.category}</span>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Navigation */}
      <Navigation role="marchand" />
    </div>
  );
}