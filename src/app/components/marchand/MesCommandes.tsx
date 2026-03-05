import React, { useState } from 'react';
import { motion } from 'motion/react';
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
  Package
} from 'lucide-react';
import { Navigation } from '../layout/Navigation';
import { useCommande } from '../../contexts/CommandeContext';
import { useApp } from '../../contexts/AppContext';
import { useUser } from '../../contexts/UserContext';
import { Button } from '../ui/button';
import { NotificationButton } from './NotificationButton';

const STATUT_COLORS = {
  'en-attente': { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
  'confirmee': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
  'en-cours': { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
  'livree': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
  'annulee': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
  'en-negociation': { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
};

const STATUT_LABELS = {
  'en-attente': 'En attente',
  'confirmee': 'Confirmée',
  'en-cours': 'En cours',
  'livree': 'Livrée',
  'annulee': 'Annulée',
  'en-negociation': 'Négociation',
};

export function MesCommandes() {
  const { commandes, annulerCommande, accepterNegociation, refuserNegociation } = useCommande();
  const { speak } = useApp();
  const { user } = useUser();
  const [filtreStatut, setFiltreStatut] = useState<string>('tous');

  // Filtrer les commandes de l'utilisateur comme acheteur
  const mesCommandes = commandes.filter(c => c.acheteurId === user?.id);

  const commandesFiltrees = filtreStatut === 'tous' 
    ? mesCommandes 
    : mesCommandes.filter(c => c.statut === filtreStatut);

  const handleAnnulerCommande = async (commandeId: string) => {
    try {
      await annulerCommande(commandeId);
      speak('Commande annulée avec succès');
    } catch (error: any) {
      speak(error.message);
    }
  };

  const handleAccepterNegociation = async (commandeId: string) => {
    try {
      await accepterNegociation(commandeId);
      speak('Contre-proposition acceptée');
    } catch (error: any) {
      speak(error.message);
    }
  };

  const handleRefuserNegociation = async (commandeId: string) => {
    try {
      await refuserNegociation(commandeId);
      speak('Contre-proposition refusée');
    } catch (error: any) {
      speak(error.message);
    }
  };

  const calculerMontantTotal = (commande: any) => {
    if (commande.type === 'negociee' && commande.negociation?.contreProposition) {
      return commande.negociation.contreProposition.montant;
    }
    return commande.montantTotal;
  };

  const statsCommandes = {
    total: mesCommandes.length,
    enCours: mesCommandes.filter(c => ['en-attente', 'confirmee', 'en-cours', 'en-negociation'].includes(c.statut)).length,
    livrees: mesCommandes.filter(c => c.statut === 'livree').length,
    montantTotal: mesCommandes
      .filter(c => c.statut === 'livree')
      .reduce((sum, c) => sum + calculerMontantTotal(c), 0),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div style={{ backgroundColor: '#C66A2C' }} className="px-4 pt-12 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Mes Commandes</h1>
            <p className="text-white/80 text-xs sm:text-sm mt-1">Suivez vos achats en temps réel</p>
          </div>
          <NotificationButton />
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <div className="text-white/70 text-xs mb-1">Total</div>
            <div className="text-white text-xl font-bold">{statsCommandes.total}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <div className="text-white/70 text-xs mb-1">En cours</div>
            <div className="text-white text-xl font-bold">{statsCommandes.enCours}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <div className="text-white/70 text-xs mb-1">Livrées</div>
            <div className="text-white text-xl font-bold">{statsCommandes.livrees}</div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-3 overflow-x-auto">
          <div className="flex gap-2">
            {[
              { key: 'tous', label: 'Tous', count: mesCommandes.length },
              { key: 'en-attente', label: 'En attente', count: mesCommandes.filter(c => c.statut === 'en-attente').length },
              { key: 'en-negociation', label: 'Négociation', count: mesCommandes.filter(c => c.statut === 'en-negociation').length },
              { key: 'confirmee', label: 'Confirmées', count: mesCommandes.filter(c => c.statut === 'confirmee').length },
              { key: 'livree', label: 'Livrées', count: mesCommandes.filter(c => c.statut === 'livree').length },
            ].map(filtre => (
              <button
                key={filtre.key}
                onClick={() => setFiltreStatut(filtre.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  filtreStatut === filtre.key
                    ? 'bg-[#C66A2C] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filtre.label} ({filtre.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Liste des commandes */}
      <div className="px-4 py-4 pb-24">
        {commandesFiltrees.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucune commande</h3>
            <p className="text-gray-500 text-sm mb-4">
              {filtreStatut === 'tous' 
                ? 'Vous n\'avez pas encore passé de commandes' 
                : `Aucune commande ${STATUT_LABELS[filtreStatut as keyof typeof STATUT_LABELS]?.toLowerCase()}`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {commandesFiltrees.map((commande, index) => {
              const colors = STATUT_COLORS[commande.statut as keyof typeof STATUT_COLORS];
              const montant = calculerMontantTotal(commande);

              return (
                <motion.div
                  key={commande.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  {/* Header commande */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Package className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            Commande #{commande.id.slice(0, 8)}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-800">
                          {commande.items[0]?.produitNom || 'Produit'}
                          {commande.items.length > 1 && ` +${commande.items.length - 1} autre(s)`}
                        </h3>
                      </div>
                      <div className={`px-3 py-1 rounded-full ${colors.bg} ${colors.border} border`}>
                        <span className={`text-xs font-medium ${colors.text}`}>
                          {STATUT_LABELS[commande.statut as keyof typeof STATUT_LABELS]}
                        </span>
                      </div>
                    </div>

                    {/* Info vendeur */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <MapPin className="w-4 h-4" />
                      <span>Vendeur: {commande.vendeurNom || 'Producteur'}</span>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(commande.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="p-4 bg-gray-50">
                    {commande.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center py-2">
                        <div>
                          <span className="font-medium text-gray-700">{item.produitNom}</span>
                          <span className="text-gray-500 text-sm ml-2">
                            {item.quantite} {item.unite}
                          </span>
                        </div>
                        <div className="font-semibold text-gray-800">
                          {item.prixUnitaire.toLocaleString()} <span className="text-[10px] opacity-60">FCFA</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Négociation en cours */}
                  {commande.statut === 'en-negociation' && commande.negociation?.contreProposition && (
                    <div className="p-4 bg-orange-50 border-t border-orange-100">
                      <div className="flex items-start gap-3 mb-3">
                        <MessageSquare className="w-5 h-5 text-orange-600 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-orange-900 mb-1">Contre-proposition reçue</h4>
                          <p className="text-sm text-orange-700 mb-2">
                            Nouveau prix: {commande.negociation.contreProposition.montant.toLocaleString()} <span className="text-[10px] opacity-60">FCFA</span>
                          </p>
                          {commande.negociation.contreProposition.message && (
                            <p className="text-sm text-orange-600 italic">
                              "{commande.negociation.contreProposition.message}"
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleAccepterNegociation(commande.id)}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          size="sm"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Accepter
                        </Button>
                        <Button
                          onClick={() => handleRefuserNegociation(commande.id)}
                          variant="outline"
                          className="flex-1 border-orange-300 text-orange-700 hover:bg-orange-100"
                          size="sm"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Refuser
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Footer montant */}
                  <div className="p-4 bg-gray-100 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Montant total</span>
                      <span className="text-xl font-bold text-gray-800">
                        {montant.toLocaleString()} <span className="text-sm opacity-60">FCFA</span>
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-3">
                      {commande.statut === 'en-attente' && (
                        <Button
                          onClick={() => handleAnnulerCommande(commande.id)}
                          variant="outline"
                          className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                          size="sm"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Annuler
                        </Button>
                      )}
                      {commande.statut === 'livree' && (
                        <Button
                          variant="outline"
                          className="flex-1"
                          size="sm"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Reçue
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <Navigation role="marchand" />
    </div>
  );
}