import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, UserPlus, Store, Sprout, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useUser } from '../../contexts/UserContext';
import { useIdentificateur } from '../../contexts/IdentificateurContext';
import { useZones } from '../../contexts/ZoneContext';
import { toast } from 'sonner';

const PRIMARY_COLOR = '#9F8170';

export function NouvelleIdentification() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { addIdentification, rechercherParNumero } = useIdentificateur();
  const { getZoneById } = useZones();

  const zoneAttribuee = user?.market || 'Marché de Cocody';
  const zoneId = '1'; // TODO: user.zoneAttribueeId

  const [typeActeur, setTypeActeur] = useState<'marchand' | 'producteur' | null>(null);
  const [formData, setFormData] = useState({
    nom: '',
    prenoms: '',
    telephone: '',
    dateNaissance: '',
    activite: '',
    marche: typeActeur === 'marchand' ? zoneAttribuee : '',
    village: '',
    cni: '',
  });
  const [loading, setLoading] = useState(false);
  const [verificationTel, setVerificationTel] = useState<'idle' | 'checking' | 'exists' | 'available'>('idle');

  const handleTelephoneChange = (tel: string) => {
    setFormData({ ...formData, telephone: tel });
    
    if (tel.length >= 10) {
      setVerificationTel('checking');
      
      // Vérifier si le numéro existe déjà
      setTimeout(() => {
        const result = rechercherParNumero(tel);
        if (result.acteur) {
          setVerificationTel('exists');
          toast.error('Ce numéro existe déjà dans le système', {
            description: `${result.acteur.prenoms} ${result.acteur.nom} - ${result.zone}`,
          });
        } else {
          setVerificationTel('available');
        }
      }, 500);
    } else {
      setVerificationTel('idle');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!typeActeur) {
      toast.error('Veuillez sélectionner le type d\'acteur');
      return;
    }

    if (verificationTel === 'exists') {
      toast.error('Ce numéro existe déjà');
      return;
    }

    setLoading(true);

    try {
      // Créer l'identification
      addIdentification({
        identificateurId: user?.telephone || 'ID001',
        identificateurNom: `${user?.prenoms} ${user?.nom}`,
        typeActeur,
        nom: formData.nom.toUpperCase(),
        prenoms: formData.prenoms,
        telephone: formData.telephone,
        dateNaissance: formData.dateNaissance,
        zone: zoneAttribuee,
        zoneId: zoneId,
        activite: formData.activite,
        marche: typeActeur === 'marchand' ? (formData.marche || zoneAttribuee) : undefined,
        village: typeActeur === 'producteur' ? formData.village : undefined,
        cni: formData.cni,
      });

      toast.success('Identification créée avec succès ! 🎉', {
        description: `${formData.prenoms} ${formData.nom} peut maintenant se connecter avec son numéro`,
      });

      // Simuler création compte
      setTimeout(() => {
        toast.info('Compte créé automatiquement', {
          description: `Le membre peut se connecter avec ${formData.telephone}`,
        });
      }, 1000);

      // Rediriger vers suivi
      setTimeout(() => {
        navigate('/identificateur/suivi');
      }, 2000);

    } catch (error) {
      toast.error('Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  if (!typeActeur) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24 lg:pl-[320px]">
        <div className="p-6">
          <button
            onClick={() => navigate('/identificateur')}
            className="flex items-center gap-2 text-gray-600 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </button>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Nouvelle Identification</h1>
          <p className="text-gray-600 mb-8">
            Choisissez le type d'acteur à identifier dans votre zone
          </p>

          <div className="grid gap-4">
            <motion.button
              onClick={() => setTypeActeur('marchand')}
              className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-orange-400 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center">
                  <Store className="w-8 h-8 text-orange-600" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-lg font-bold text-gray-900">Marchand</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Commerçant sur le marché
                  </p>
                </div>
              </div>
            </motion.button>

            <motion.button
              onClick={() => setTypeActeur('producteur')}
              className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-green-400 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center">
                  <Sprout className="w-8 h-8 text-green-600" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-lg font-bold text-gray-900">Producteur</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Agriculteur ou éleveur
                  </p>
                </div>
              </div>
            </motion.button>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-sm text-blue-900">
              <strong>ℹ️ Important:</strong> Le membre pourra se connecter immédiatement avec son numéro. 
              Il sera invité à créer un code PIN optionnel lors de sa première connexion.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 lg:pl-[320px]">
      <div className="p-6">
        <button
          onClick={() => setTypeActeur(null)}
          className="flex items-center gap-2 text-gray-600 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Changer le type</span>
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: typeActeur === 'marchand' ? '#C66A2C' : '#2E8B57' }}
          >
            {typeActeur === 'marchand' ? (
              <Store className="w-6 h-6 text-white" />
            ) : (
              <Sprout className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Identifier un {typeActeur}
            </h1>
            <p className="text-sm text-gray-600">{zoneAttribuee}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Numéro de téléphone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Numéro de téléphone <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="tel"
                value={formData.telephone}
                onChange={(e) => handleTelephoneChange(e.target.value)}
                placeholder="+225 07 XX XX XX XX"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-opacity-50 pr-10"
                style={{ focusRing: PRIMARY_COLOR }}
                required
              />
              {verificationTel === 'checking' && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {verificationTel === 'exists' && (
                <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
              )}
              {verificationTel === 'available' && (
                <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
              )}
            </div>
            {verificationTel === 'available' && (
              <p className="text-xs text-green-600 mt-1">✓ Numéro disponible</p>
            )}
          </div>

          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom de famille <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              placeholder="KOUASSI"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-opacity-50"
              required
            />
          </div>

          {/* Prénoms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prénom(s) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.prenoms}
              onChange={(e) => setFormData({ ...formData, prenoms: e.target.value })}
              placeholder="Aminata"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-opacity-50"
              required
            />
          </div>

          {/* Date de naissance */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date de naissance
            </label>
            <input
              type="date"
              value={formData.dateNaissance}
              onChange={(e) => setFormData({ ...formData, dateNaissance: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-opacity-50"
            />
          </div>

          {/* CNI */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Numéro CNI
            </label>
            <input
              type="text"
              value={formData.cni}
              onChange={(e) => setFormData({ ...formData, cni: e.target.value })}
              placeholder="CI2024XXXXXXXX"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-opacity-50"
            />
          </div>

          {/* Activité */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Activité <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.activite}
              onChange={(e) => setFormData({ ...formData, activite: e.target.value })}
              placeholder={typeActeur === 'marchand' ? 'Vente de légumes' : 'Production de manioc'}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-opacity-50"
              required
            />
          </div>

          {/* Zone (verrouillée) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {typeActeur === 'marchand' ? 'Marché' : 'Village/Zone'}
            </label>
            {typeActeur === 'marchand' ? (
              <input
                type="text"
                value={zoneAttribuee}
                disabled
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-100 text-gray-700 cursor-not-allowed"
              />
            ) : (
              <input
                type="text"
                value={formData.village}
                onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                placeholder="Village proche de la zone"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-opacity-50"
              />
            )}
            <p className="text-xs text-gray-500 mt-1">
              🔒 Zone verrouillée à votre territoire d'attribution
            </p>
          </div>

          {/* Bouton de soumission */}
          <motion.button
            type="submit"
            disabled={loading || verificationTel === 'exists'}
            className="w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ backgroundColor: PRIMARY_COLOR }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Création en cours...
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                Créer le compte
              </>
            )}
          </motion.button>

          <div className="p-4 bg-green-50 rounded-xl border border-green-200">
            <p className="text-sm text-green-900">
              <strong>Création automatique:</strong> Le compte sera créé immédiatement après validation.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}