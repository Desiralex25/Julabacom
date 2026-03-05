import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, User, Phone, Calendar, Badge } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useUser } from '../../contexts/UserContext';
import { Input } from '../ui/input';

type FilterType = 'tout' | 'aujourdhui' | 'semaine' | 'mois';

export function IdentificationsHistory() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [filter, setFilter] = useState<FilterType>('tout');
  const [searchQuery, setSearchQuery] = useState('');

  if (!user) return null;

  // Couleurs par rôle
  const roleColors: Record<'marchand' | 'producteur' | 'cooperative' | 'institution' | 'identificateur', string> = {
    marchand: '#C46210',
    producteur: '#00563B',
    cooperative: '#2072AF',
    institution: '#702963',
    identificateur: '#9F8170',
  };

  // Labels par rôle
  const roleLabels: Record<'marchand' | 'producteur' | 'cooperative' | 'institution' | 'identificateur', string> = {
    marchand: 'Marchand',
    producteur: 'Producteur',
    cooperative: 'Coopérative',
    institution: 'Institution',
    identificateur: 'Identificateur',
  };

  // Données mock
  const mockIdentifications = [
    {
      id: '1',
      phone: '0701020304',
      firstName: 'Aminata',
      lastName: 'Kouassi',
      role: 'marchand' as const,
      market: 'Marché de Yopougon',
      commune: 'Yopougon',
      activity: 'Vente de riz',
      createdAt: '2026-02-27T10:30:00',
      type: 'nouveau' as const,
    },
    {
      id: '6',
      phone: '0706060606',
      firstName: 'Koffi',
      lastName: 'N\'Guessan',
      role: 'marchand' as const,
      market: 'Marché de Yopougon',
      commune: 'Yopougon',
      activity: 'Vente de tomates',
      createdAt: '2026-02-25T14:20:00',
      type: 'nouveau' as const,
    },
    {
      id: '7',
      phone: '0707070708',
      firstName: 'Fatou',
      lastName: 'Traoré',
      role: 'marchand' as const,
      market: 'Marché de Yopougon',
      commune: 'Yopougon',
      activity: 'Vente d\'oignons',
      createdAt: '2026-02-26T09:15:00',
      type: 'modifie' as const,
    },
  ];

  // Filtrage
  const filteredIdentifications = mockIdentifications.filter((item) => {
    const itemDate = new Date(item.createdAt);
    const now = new Date();

    // Filtre par période
    if (filter === 'aujourdhui') {
      if (itemDate.toDateString() !== now.toDateString()) return false;
    } else if (filter === 'semaine') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      if (itemDate < weekAgo) return false;
    } else if (filter === 'mois') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      if (itemDate < monthAgo) return false;
    }

    // Filtre par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const fullName = `${item.firstName} ${item.lastName}`.toLowerCase();
      if (!fullName.includes(query) && !item.phone.includes(query)) {
        return false;
      }
    }

    return true;
  });

  const filters: { value: FilterType; label: string }[] = [
    { value: 'tout', label: 'Tout' },
    { value: 'aujourdhui', label: 'Aujourd\'hui' },
    { value: 'semaine', label: 'Semaine' },
    { value: 'mois', label: 'Mois' },
  ];

  return (
    <div className="pb-32 lg:pb-8 pt-16 lg:pt-10 px-4 lg:pl-[320px] max-w-2xl lg:max-w-7xl mx-auto min-h-screen">
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-gray-900">Mes identifications</h1>
        <p className="text-gray-600 mt-1">
          Historique complet de tes identifications
        </p>
      </motion.div>

      {/* Barre de recherche */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-md p-4 mb-4"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom ou numéro..."
            className="pl-10 h-12 rounded-xl"
          />
        </div>
      </motion.div>

      {/* Filtres */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex gap-2 mb-6 overflow-x-auto pb-2"
      >
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className="px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all"
            style={{
              backgroundColor: filter === f.value ? roleColors.identificateur : 'white',
              color: filter === f.value ? 'white' : '#6B7280',
              boxShadow: filter === f.value ? '0 4px 12px rgba(159, 129, 112, 0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            {f.label}
          </button>
        ))}
      </motion.div>

      {/* Compteur */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-4"
      >
        <p className="text-sm text-gray-600">
          <span className="font-semibold" style={{ color: roleColors.identificateur }}>
            {filteredIdentifications.length}
          </span>{' '}
          identification{filteredIdentifications.length > 1 ? 's' : ''}
        </p>
      </motion.div>

      {/* Liste des identifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-3"
      >
        {filteredIdentifications.length > 0 ? (
          filteredIdentifications.map((item, index) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              onClick={() => navigate('/identificateur/fiche-marchand', { state: { merchant: item } })}
              className="w-full bg-white rounded-2xl shadow-md p-4 text-left hover:shadow-lg transition-all"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${roleColors.identificateur}20` }}
                >
                  <User className="w-7 h-7" style={{ color: roleColors.identificateur }} />
                </div>

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-semibold text-gray-900">
                      {item.firstName} {item.lastName}
                    </p>
                    <span
                      className="px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap"
                      style={{
                        backgroundColor: item.type === 'nouveau' ? '#10B98120' : `${roleColors.identificateur}20`,
                        color: item.type === 'nouveau' ? '#10B981' : roleColors.identificateur,
                      }}
                    >
                      {item.type === 'nouveau' ? 'Nouveau' : 'Modifié'}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 flex items-center gap-1 mb-1">
                    <Phone className="w-3 h-3" />
                    {item.phone}
                  </p>

                  <div className="flex items-center gap-2 mb-2">
                    {/* Badge rôle avec pastille */}
                    <div className="flex items-center gap-1.5">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: roleColors[item.role] }}
                      />
                      <span 
                        className="text-xs font-medium"
                        style={{ color: roleColors[item.role] }}
                      >
                        {roleLabels[item.role]}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">•</span>
                    <p className="text-xs text-gray-400">{item.activity}</p>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}{' '}
                    à{' '}
                    {new Date(item.createdAt).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            </motion.button>
          ))
        ) : (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <Filter className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 font-medium mb-2">
              Aucune identification trouvée
            </p>
            <p className="text-sm text-gray-400">
              Essaie de changer les filtres ou la recherche
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}