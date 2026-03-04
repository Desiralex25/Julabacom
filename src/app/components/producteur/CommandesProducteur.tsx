import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  XCircle, 
  MessageSquare,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Package,
  ArrowLeft,
  Filter
} from 'lucide-react';
import { Navigation } from '../layout/Navigation';
import { useCommande } from '../../contexts/CommandeContext';
import { useApp } from '../../contexts/AppContext';
import { useUser } from '../../contexts/UserContext';
import { Button } from '../ui/button';
import { NotificationButton } from '../marchand/NotificationButton';

const STATUT_COLORS = {
  'en-attente': { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
  'acceptee': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
  'payee': { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
  'en-livraison': { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-300' },
  'livree': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
  'completee': { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300' },
  'refusee': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
  'annulee': { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' },
  'expiree': { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
  'en-negociation': { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' },
};

const STATUT_LABELS = {
  'en-attente': 'En attente',
  'acceptee': 'Acceptée',
  'payee': 'Payée',
  'en-livraison': 'En livraison',
  'livree': 'Livrée',
  'completee': 'Complétée',
  'refusee': 'Refusée',
  'annulee': 'Annulée',
  'expiree': 'Expirée',
  'en-negociation': 'Négociation',
};

export function CommandesProducteur() {
  const { commandes, accepterCommande, refuserCommande, contreProposerPrix, marquerLivree } = useCommande();
  const { speak } = useApp();
  const { user } = useUser();
  const [filtreStatut, setFiltreStatut] = useState<string>('tous');
  const [showContrePropositionModal, setShowContrePropositionModal] = useState(false);
  const [selectedCommande, setSelectedCommande] = useState<any>(null);
  const [nouveauPrix, setNouveauPrix] = useState('');
  const [messageContreProposition, setMessageContreProposition] = useState('');

  // Filtrer les commandes où le producteur est le vendeur
  const mesCommandes = commandes.filter(c => c.vendeurId === user?.id);

  const commandesFiltrees = filtreStatut === 'tous' 
    ? mesCommandes 
    : mesCommandes.filter(c => c.statut === filtreStatut);

  const handleAccepterCommande = async (commandeId: string) => {
    try {
      await accepterCommande(commandeId, user!.id);
      speak('Commande acceptée avec succès');
    } catch (error: any) {
      speak(error.message);
    }
  };

  const handleRefuserCommande = async (commandeId: string) => {
    try {
      await refuserCommande(commandeId, user!.id, 'Stock insuffisant');
      speak('Commande refusée');
    } catch (error: any) {
      speak(error.message);
    }
  };

  const handleMarquerLivree = async (commandeId: string) => {
    try {
      await marquerLivree(commandeId, user!.id);
      speak('Commande marquée comme livrée');
    } catch (error: any) {
      speak(error.message);
    }
  };

  const handleOpenContreProposition = (commande: any) => {
    setSelectedCommande(commande);
    setNouveauPrix(commande.montantTotal.toString());
    setMessageContreProposition('');
    setShowContrePropositionModal(true);
  };

  const handleContreProposer = async () => {
    if (!selectedCommande || !nouveauPrix) {
      speak('Entre un nouveau prix');
      return;
    }

    try {
      await contreProposerPrix(
        selectedCommande.id, 
        user!.id, 
        Number(nouveauPrix), 
        messageContreProposition
      );
      speak('Contre-proposition envoyée');
      setShowContrePropositionModal(false);
      setSelectedCommande(null);
    } catch (error: any) {
      speak(error.message);
    }
  };

  const statsCommandes = {
    total: mesCommandes.length,
    enAttente: mesCommandes.filter(c => c.statut === 'en-attente').length,
    acceptees: mesCommandes.filter(c => ['acceptee', 'payee', 'en-livraison'].includes(c.statut)).length,
    livrees: mesCommandes.filter(c => ['livree', 'completee'].includes(c.statut)).length,
    montantTotal: mesCommandes
      .filter(c => ['livree', 'completee'].includes(c.statut))
      .reduce((sum, c) => sum + c.montantTotal, 0),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#2E8B57' }}>
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900">Mes Commandes</h1>
                <p className="text-xs text-gray-600">{statsCommandes.total} commande{statsCommandes.total > 1 ? 's' : ''}</p>
              </div>
            </div>
            <NotificationButton />
          </div>

          {/* Stats KPI */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            <div className="bg-yellow-50 rounded-lg p-2 text-center border border-yellow-200">
              <p className="text-xs text-yellow-700 mb-1">En attente</p>
              <p className="font-bold text-yellow-900">{statsCommandes.enAttente}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-2 text-center border border-blue-200">
              <p className="text-xs text-blue-700 mb-1">Acceptées</p>
              <p className="font-bold text-blue-900">{statsCommandes.acceptees}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-2 text-center border border-green-200">
              <p className="text-xs text-green-700 mb-1">Livrées</p>
              <p className="font-bold text-green-900">{statsCommandes.livrees}</p>
            </div>
            <div className="bg-emerald-50 rounded-lg p-2 text-center border border-emerald-200">
              <p className="text-xs text-emerald-700 mb-1">Total</p>
              <p className="font-bold text-emerald-900 text-sm">{(statsCommandes.montantTotal / 1000).toFixed(0)}K</p>
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
              onClick={() => setFiltreStatut('en-attente')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                filtreStatut === 'en-attente'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              En attente
            </button>
            <button
              onClick={() => setFiltreStatut('acceptee')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                filtreStatut === 'acceptee'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Acceptées
            </button>
            <button
              onClick={() => setFiltreStatut('livree')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                filtreStatut === 'livree'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Livrées
            </button>
          </div>
        </div>
      </div>

      {/* Liste des commandes */}
      <div className="px-4 py-4 pb-24">
        {commandesFiltrees.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 mb-1">Aucune commande</p>
            <p className="text-sm text-gray-500">
              {filtreStatut === 'tous' 
                ? 'Tu recevras tes commandes ici' 
                : 'Aucune commande dans cette catégorie'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {commandesFiltrees.map((commande) => {
              const statutColors = STATUT_COLORS[commande.statut as keyof typeof STATUT_COLORS] || STATUT_COLORS['en-attente'];
              const statutLabel = STATUT_LABELS[commande.statut as keyof typeof STATUT_LABELS] || commande.statut;

              return (
                <motion.div
                  key={commande.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                >
                  {/* Header */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{commande.acheteurName}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statutColors.bg} ${statutColors.text}`}>
                            {statutLabel}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">Commande #{commande.numeroJulaba}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(commande.dateCreation).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{new Date(commande.dateCreation).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Produit */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-green-700" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{commande.produit}</h4>
                        <p className="text-sm text-gray-600">
                          Quantité: <span className="font-semibold">{commande.quantite} kg</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Négociation en cours */}
                  {commande.statut === 'en-negociation' && commande.historique && commande.historique.length > 0 && (
                    <div className="p-4 bg-amber-50 border-b border-amber-100">
                      <div className="flex items-start gap-3">
                        <MessageSquare className="w-5 h-5 text-amber-600 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-amber-900 mb-1">Négociation en cours</h4>
                          <p className="text-sm text-amber-700">
                            Prix proposé par l'acheteur: {commande.montantTotal.toLocaleString()} FCFA
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Footer montant + actions */}
                  <div className="p-4 bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-gray-600 font-medium text-sm">Montant total</span>
                      <span className="text-lg font-bold text-gray-900">
                        {commande.montantTotal.toLocaleString()} FCFA
                      </span>
                    </div>

                    {/* Actions selon le statut */}
                    <div className="flex gap-2">
                      {commande.statut === 'en-attente' && (
                        <>
                          <Button
                            onClick={() => handleAccepterCommande(commande.id)}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            size="sm"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Accepter
                          </Button>
                          <Button
                            onClick={() => handleOpenContreProposition(commande)}
                            variant="outline"
                            className="flex-1 border-amber-300 text-amber-700 hover:bg-amber-50"
                            size="sm"
                          >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Négocier
                          </Button>
                          <Button
                            onClick={() => handleRefuserCommande(commande.id)}
                            variant="outline"
                            className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                            size="sm"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Refuser
                          </Button>
                        </>
                      )}
                      
                      {commande.statut === 'payee' && (
                        <Button
                          onClick={() => handleMarquerLivree(commande.id)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                          size="sm"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Marquer livrée
                        </Button>
                      )}

                      {commande.statut === 'acceptee' && (
                        <div className="flex-1 text-center py-2 text-sm text-blue-700 bg-blue-50 rounded-lg">
                          En attente du paiement
                        </div>
                      )}

                      {commande.statut === 'livree' && (
                        <div className="flex-1 text-center py-2 text-sm text-green-700 bg-green-50 rounded-lg flex items-center justify-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Livrée - En attente confirmation
                        </div>
                      )}

                      {commande.statut === 'completee' && (
                        <div className="flex-1 text-center py-2 text-sm text-emerald-700 bg-emerald-50 rounded-lg flex items-center justify-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Commande terminée
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

      {/* Modal Contre-proposition */}
      <AnimatePresence>
        {showContrePropositionModal && selectedCommande && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowContrePropositionModal(false)}
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
                <h3 className="font-bold text-gray-900">Contre-proposition</h3>
                <button
                  onClick={() => setShowContrePropositionModal(false)}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
                >
                  <XCircle className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 flex-1 overflow-y-auto">
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">Prix proposé par l'acheteur</p>
                  <p className="text-xl font-bold text-gray-900">{selectedCommande.montantTotal.toLocaleString()} FCFA</p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ton nouveau prix (FCFA)
                  </label>
                  <input
                    type="number"
                    value={nouveauPrix}
                    onChange={(e) => setNouveauPrix(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Entre ton prix"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message (optionnel)
                  </label>
                  <textarea
                    value={messageContreProposition}
                    onChange={(e) => setMessageContreProposition(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    rows={3}
                    placeholder="Explique ta contre-proposition..."
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200">
                <Button
                  onClick={handleContreProposer}
                  className="w-full bg-[#2E8B57] hover:bg-[#236B43]"
                >
                  Envoyer la contre-proposition
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