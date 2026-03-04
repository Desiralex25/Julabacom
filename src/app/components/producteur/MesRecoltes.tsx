import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Package, 
  MapPin, 
  Calendar,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  TrendingUp,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Plus,
  Filter
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { Navigation } from '../layout/Navigation';
import { useApp } from '../../contexts/AppContext';
import { useUser } from '../../contexts/UserContext';
import { Button } from '../ui/button';
import { NotificationButton } from '../marchand/NotificationButton';

interface Recolte {
  id: string;
  producteurId: string;
  producteurName: string;
  produit: string;
  quantite: number;
  unite: string;
  prixUnitaire: number;
  stockDisponible: number;
  description?: string;
  localisation: string;
  dateRecolte: string;
  datePublication: string;
  statut: 'disponible' | 'epuise' | 'retire';
  imageUrl?: string;
  vuesTotal?: number;
  commandesRecues?: number;
}

const STATUT_COLORS = {
  'disponible': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
  'epuise': { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' },
  'retire': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
};

const STATUT_LABELS = {
  'disponible': 'Disponible',
  'epuise': 'Épuisé',
  'retire': 'Retiré',
};

export function MesRecoltes() {
  const navigate = useNavigate();
  const { speak } = useApp();
  const { user } = useUser();
  const [recoltes, setRecoltes] = useState<Recolte[]>([]);
  const [filtreStatut, setFiltreStatut] = useState<string>('tous');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRecolte, setSelectedRecolte] = useState<Recolte | null>(null);
  const [nouveauPrix, setNouveauPrix] = useState('');

  // Charger les récoltes depuis localStorage
  useEffect(() => {
    const stored = localStorage.getItem('julaba_recoltes_publiees');
    if (stored) {
      const allRecoltes = JSON.parse(stored);
      // Filtrer uniquement les récoltes de l'utilisateur
      const mesRecoltes = allRecoltes.filter((r: Recolte) => r.producteurId === user?.id);
      setRecoltes(mesRecoltes);
    }
  }, [user?.id]);

  const recoltesFiltrees = filtreStatut === 'tous' 
    ? recoltes 
    : recoltes.filter(r => r.statut === filtreStatut);

  const handleRetirerDuMarche = (recolteId: string) => {
    const updated = recoltes.map(r => 
      r.id === recolteId ? { ...r, statut: 'retire' as const } : r
    );
    setRecoltes(updated);
    
    // Mettre à jour localStorage
    const allRecoltes = JSON.parse(localStorage.getItem('julaba_recoltes_publiees') || '[]');
    const updatedAll = allRecoltes.map((r: Recolte) => 
      r.id === recolteId ? { ...r, statut: 'retire' } : r
    );
    localStorage.setItem('julaba_recoltes_publiees', JSON.stringify(updatedAll));
    
    speak('Récolte retirée du marché');
  };

  const handleRemettreDansMarche = (recolteId: string) => {
    const updated = recoltes.map(r => 
      r.id === recolteId ? { ...r, statut: 'disponible' as const } : r
    );
    setRecoltes(updated);
    
    // Mettre à jour localStorage
    const allRecoltes = JSON.parse(localStorage.getItem('julaba_recoltes_publiees') || '[]');
    const updatedAll = allRecoltes.map((r: Recolte) => 
      r.id === recolteId ? { ...r, statut: 'disponible' } : r
    );
    localStorage.setItem('julaba_recoltes_publiees', JSON.stringify(updatedAll));
    
    speak('Récolte remise dans le marché');
  };

  const handleOpenEditPrix = (recolte: Recolte) => {
    setSelectedRecolte(recolte);
    setNouveauPrix(recolte.prixUnitaire.toString());
    setShowEditModal(true);
  };

  const handleUpdatePrix = () => {
    if (!selectedRecolte || !nouveauPrix) {
      speak('Entre un nouveau prix');
      return;
    }

    const updated = recoltes.map(r => 
      r.id === selectedRecolte.id ? { ...r, prixUnitaire: Number(nouveauPrix) } : r
    );
    setRecoltes(updated);
    
    // Mettre à jour localStorage
    const allRecoltes = JSON.parse(localStorage.getItem('julaba_recoltes_publiees') || '[]');
    const updatedAll = allRecoltes.map((r: Recolte) => 
      r.id === selectedRecolte.id ? { ...r, prixUnitaire: Number(nouveauPrix) } : r
    );
    localStorage.setItem('julaba_recoltes_publiees', JSON.stringify(updatedAll));
    
    speak('Prix mis à jour');
    setShowEditModal(false);
    setSelectedRecolte(null);
  };

  const statsRecoltes = {
    total: recoltes.length,
    disponibles: recoltes.filter(r => r.statut === 'disponible').length,
    epuises: recoltes.filter(r => r.statut === 'epuise').length,
    valeurTotale: recoltes
      .filter(r => r.statut === 'disponible')
      .reduce((sum, r) => sum + (r.quantite * r.prixUnitaire), 0),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#2E8B57' }}>
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900">Mes Récoltes Publiées</h1>
                <p className="text-xs text-gray-600">{statsRecoltes.total} publication{statsRecoltes.total > 1 ? 's' : ''}</p>
              </div>
            </div>
            <NotificationButton />
          </div>

          {/* Stats KPI */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            <div className="bg-green-50 rounded-lg p-2 text-center border border-green-200">
              <p className="text-xs text-green-700 mb-1">Disponibles</p>
              <p className="font-bold text-green-900">{statsRecoltes.disponibles}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2 text-center border border-gray-200">
              <p className="text-xs text-gray-700 mb-1">Épuisées</p>
              <p className="font-bold text-gray-900">{statsRecoltes.epuises}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-2 text-center border border-blue-200">
              <p className="text-xs text-blue-700 mb-1">Total</p>
              <p className="font-bold text-blue-900">{statsRecoltes.total}</p>
            </div>
            <div className="bg-emerald-50 rounded-lg p-2 text-center border border-emerald-200">
              <p className="text-xs text-emerald-700 mb-1">Valeur</p>
              <p className="font-bold text-emerald-900 text-sm">{(statsRecoltes.valeurTotale / 1000).toFixed(0)}K</p>
            </div>
          </div>

          {/* Filtres */}
          <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
            <button
              onClick={() => setFiltreStatut('tous')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                filtreStatut === 'tous'
                  ? 'bg-[#2E8B57] text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Toutes
            </button>
            <button
              onClick={() => setFiltreStatut('disponible')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                filtreStatut === 'disponible'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Disponibles
            </button>
            <button
              onClick={() => setFiltreStatut('epuise')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                filtreStatut === 'epuise'
                  ? 'bg-gray-500 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Épuisées
            </button>
            <button
              onClick={() => setFiltreStatut('retire')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                filtreStatut === 'retire'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Retirées
            </button>
          </div>
        </div>
      </div>

      {/* Liste des récoltes */}
      <div className="px-4 py-4 pb-24">
        {/* Bouton Publier */}
        <Button
          onClick={() => navigate('/producteur/publier-recolte')}
          className="w-full bg-[#2E8B57] hover:bg-[#236B43] mb-4 py-6 rounded-xl"
        >
          <Plus className="w-5 h-5 mr-2" />
          Publier une nouvelle récolte
        </Button>

        {recoltesFiltrees.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 mb-1">Aucune récolte publiée</p>
            <p className="text-sm text-gray-500">
              {filtreStatut === 'tous' 
                ? 'Publie ta première récolte pour commencer à vendre' 
                : 'Aucune récolte dans cette catégorie'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recoltesFiltrees.map((recolte) => {
              const statutColors = STATUT_COLORS[recolte.statut];
              const statutLabel = STATUT_LABELS[recolte.statut];
              const montantTotal = recolte.quantite * recolte.prixUnitaire;

              return (
                <motion.div
                  key={recolte.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                >
                  {/* Header */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-1">{recolte.produit}</h3>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statutColors.bg} ${statutColors.text}`}>
                            {statutLabel}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{recolte.localisation}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(recolte.datePublication).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Détails */}
                  <div className="p-4 bg-gray-50">
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <p className="text-xs text-gray-600 mb-0.5">Quantité totale</p>
                        <p className="font-semibold text-gray-900">{recolte.quantite} {recolte.unite}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-0.5">Stock disponible</p>
                        <p className="font-semibold text-gray-900">{recolte.stockDisponible} {recolte.unite}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-0.5">Prix unitaire</p>
                        <p className="font-semibold text-green-700">{recolte.prixUnitaire.toLocaleString()} FCFA/{recolte.unite}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-0.5">Valeur totale</p>
                        <p className="font-semibold text-green-700">{montantTotal.toLocaleString()} FCFA</p>
                      </div>
                    </div>

                    {recolte.description && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-600 mb-1">Description</p>
                        <p className="text-sm text-gray-700">{recolte.description}</p>
                      </div>
                    )}

                    {/* Stats engagement (mockées pour l'instant) */}
                    <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{recolte.vuesTotal || 0} vues</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>{recolte.commandesRecues || 0} commandes</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {recolte.statut === 'disponible' && (
                        <>
                          <Button
                            onClick={() => handleOpenEditPrix(recolte)}
                            variant="outline"
                            className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50"
                            size="sm"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Modifier prix
                          </Button>
                          <Button
                            onClick={() => handleRetirerDuMarche(recolte.id)}
                            variant="outline"
                            className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                            size="sm"
                          >
                            <EyeOff className="w-4 h-4 mr-2" />
                            Retirer
                          </Button>
                        </>
                      )}
                      
                      {recolte.statut === 'retire' && (
                        <Button
                          onClick={() => handleRemettreDansMarche(recolte.id)}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          size="sm"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Remettre en vente
                        </Button>
                      )}

                      {recolte.statut === 'epuise' && (
                        <div className="flex-1 text-center py-2 text-sm text-gray-700 bg-gray-100 rounded-lg">
                          Stock épuisé
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Modifier Prix */}
      <AnimatePresence>
        {showEditModal && selectedRecolte && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEditModal(false)}
              className="absolute inset-0 bg-black/50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl w-[90%] max-w-md mx-4 max-h-[80vh] flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Modifier le prix</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
                >
                  <Trash2 className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 flex-1 overflow-y-auto">
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">Produit</p>
                  <p className="text-lg font-bold text-gray-900">{selectedRecolte.produit}</p>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">Prix actuel</p>
                  <p className="text-xl font-bold text-gray-900">{selectedRecolte.prixUnitaire.toLocaleString()} FCFA/{selectedRecolte.unite}</p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nouveau prix (FCFA/{selectedRecolte.unite})
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      value={nouveauPrix}
                      onChange={(e) => setNouveauPrix(e.target.value)}
                      className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Entre le nouveau prix"
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200">
                <Button
                  onClick={handleUpdatePrix}
                  className="w-full bg-[#2E8B57] hover:bg-[#236B43]"
                >
                  Mettre à jour le prix
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Navigation role="producteur" />
    </div>
  );
}