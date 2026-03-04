import React, { useState } from 'react';
import { ArrowLeft, MapPin, Send, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { useUser } from '../../contexts/UserContext';
import { useIdentificateur } from '../../contexts/IdentificateurContext';
import { useZones } from '../../contexts/ZoneContext';
import { toast } from 'sonner';

const PRIMARY_COLOR = '#9F8170';

export function DemandeMutation() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { demanderMutation, getMesDemandes } = useIdentificateur();
  const { zones } = useZones();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    zoneDemandeeId: '',
    raison: '',
  });

  const zoneActuelle = user?.market || 'Marché de Cocody';
  const zoneActuelleId = '1'; // TODO: user.zoneAttribueeId
  const mesDemandes = getMesDemandes();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const zoneDemandee = zones.find(z => z.id === formData.zoneDemandeeId);
    if (!zoneDemandee) return;

    demanderMutation({
      identificateurId: user?.telephone || 'ID001',
      identificateurNom: `${user?.prenoms} ${user?.nom}`,
      zoneActuelle,
      zoneActuelleId,
      zoneDemandee: zoneDemandee.nom,
      zoneDemandeeId: zoneDemandee.id,
      raison: formData.raison,
    });

    toast.success('Demande envoyée !', {
      description: 'Votre demande de mutation sera traitée par l\'Institution',
    });

    setShowForm(false);
    setFormData({ zoneDemandeeId: '', raison: '' });
  };

  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24 lg:pl-[320px]">
        <div className="p-6">
          <button
            onClick={() => setShowForm(false)}
            className="flex items-center gap-2 text-gray-600 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </button>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Demande de changement de zone
          </h1>
          <p className="text-gray-600 mb-6">
            Remplissez le formulaire pour demander votre mutation
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Zone actuelle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zone actuelle
              </label>
              <div className="px-4 py-3 rounded-xl border-2 border-gray-300 bg-gray-50">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-gray-600" />
                  <span className="font-bold text-gray-900">{zoneActuelle}</span>
                </div>
              </div>
            </div>

            {/* Nouvelle zone souhaitée */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nouvelle zone souhaitée <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.zoneDemandeeId}
                onChange={(e) => setFormData({ ...formData, zoneDemandeeId: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-opacity-50"
                required
              >
                <option value="">-- Sélectionnez une zone --</option>
                {zones
                  .filter(z => z.id !== zoneActuelleId && z.active)
                  .map(zone => (
                    <option key={zone.id} value={zone.id}>
                      {zone.nom} ({zone.type === 'marche' ? 'Marché' : zone.type === 'village' ? 'Village' : 'Région'})
                    </option>
                  ))}
              </select>
            </div>

            {/* Raison */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Raison de la demande <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.raison}
                onChange={(e) => setFormData({ ...formData, raison: e.target.value })}
                placeholder="Expliquez pourquoi vous souhaitez changer de zone..."
                rows={5}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-opacity-50 resize-none"
                required
              />
              <p className="text-xs text-gray-500 mt-2">
                Minimum 20 caractères
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-sm text-blue-900">
                <strong>ℹ️ À savoir :</strong> Votre demande sera examinée par l'Institution. 
                Vous serez notifié de la décision dans les plus brefs délais.
              </p>
            </div>

            <motion.button
              type="submit"
              disabled={formData.raison.length < 20}
              className="w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ backgroundColor: PRIMARY_COLOR }}
              whileTap={{ scale: 0.98 }}
            >
              <Send className="w-5 h-5" />
              Envoyer la demande
            </motion.button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 lg:pl-[320px]">
      <div className="p-6">
        <button
          onClick={() => navigate('/identificateur/profil')}
          className="flex items-center gap-2 text-gray-600 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Retour au profil</span>
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Changement de zone
        </h1>
        <p className="text-gray-600 mb-6">
          Gérez vos demandes de mutation de zone
        </p>

        {/* Zone actuelle */}
        <div className="mb-6 p-4 rounded-2xl border-2 bg-white" style={{ borderColor: PRIMARY_COLOR }}>
          <div className="flex items-center gap-3">
            <MapPin className="w-6 h-6" style={{ color: PRIMARY_COLOR }} />
            <div>
              <p className="text-sm text-gray-600">Zone actuelle</p>
              <p className="text-lg font-bold text-gray-900">{zoneActuelle}</p>
            </div>
          </div>
        </div>

        {/* Bouton nouvelle demande */}
        {mesDemandes.filter(d => d.statut === 'en_attente').length === 0 && (
          <motion.button
            onClick={() => setShowForm(true)}
            className="w-full mb-6 py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-2 shadow-lg"
            style={{ backgroundColor: PRIMARY_COLOR }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Send className="w-5 h-5" />
            Nouvelle demande de mutation
          </motion.button>
        )}

        {mesDemandes.filter(d => d.statut === 'en_attente').length > 0 && (
          <div className="mb-6 p-4 bg-orange-50 rounded-xl border border-orange-200">
            <p className="text-sm text-orange-900">
              ⏳ Vous avez une demande en cours d'examen. Vous ne pouvez pas soumettre une nouvelle demande.
            </p>
          </div>
        )}

        {/* Historique des demandes */}
        <h2 className="text-lg font-bold text-gray-900 mb-4">Mes demandes</h2>

        <div className="space-y-3">
          {mesDemandes.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">Aucune demande</p>
              <p className="text-sm text-gray-500 mt-1">
                Vous n'avez pas encore demandé de changement de zone
              </p>
            </div>
          ) : (
            mesDemandes.map((demande) => (
              <motion.div
                key={demande.id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200"
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-gray-600">De:</span>
                      <span className="font-bold text-gray-900">{demande.zoneActuelle}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Vers:</span>
                      <span className="font-bold text-gray-900">{demande.zoneDemandee}</span>
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 ${
                      demande.statut === 'en_attente'
                        ? 'bg-orange-100 text-orange-700'
                        : demande.statut === 'approuve'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {demande.statut === 'en_attente' && <Clock className="w-3 h-3" />}
                    {demande.statut === 'approuve' && <CheckCircle2 className="w-3 h-3" />}
                    {demande.statut === 'rejete' && <XCircle className="w-3 h-3" />}
                    {demande.statut === 'en_attente' ? 'En attente' : demande.statut === 'approuve' ? 'Approuvée' : 'Rejetée'}
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl mb-3">
                  <p className="text-sm text-gray-600 mb-1">Raison</p>
                  <p className="text-sm text-gray-900">{demande.raison}</p>
                </div>

                {demande.commentaireInstitution && (
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 mb-3">
                    <p className="text-sm text-blue-900 mb-1 font-medium">
                      Commentaire de l'Institution
                    </p>
                    <p className="text-sm text-blue-800">{demande.commentaireInstitution}</p>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    Demandé le {new Date(demande.dateDemande).toLocaleDateString('fr-FR')}
                  </span>
                  {demande.dateTraitement && (
                    <span>
                      Traité le {new Date(demande.dateTraitement).toLocaleDateString('fr-FR')}
                    </span>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
