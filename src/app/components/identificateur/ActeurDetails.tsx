import React from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Phone, MapPin, Briefcase, Calendar, CheckCircle, XCircle, Clock, Lock, Edit } from 'lucide-react';
import { motion } from 'motion/react';

const PRIMARY_COLOR = '#9F8170';

// Mock data - à remplacer par vraies données
const MOCK_ACTEURS_DETAILS: Record<string, any> = {
  '0722456789': {
    numero: '0722456789',
    nom: 'KOUASSI',
    prenoms: 'Jean',
    type: 'Marchand',
    activite: 'Vente de légumes',
    zone: 'Marché de Cocody',
    statut: 'approved',
    dateIdentification: '2024-02-15',
    dateValidation: '2024-02-16',
    identificateur: 'YAO Marie (ID007)',
    coordonneesGPS: '5.3599° N, 4.0083° W',
    photo: null,
    documents: ['CNI', 'Attestation marché'],
    historique: [
      { date: '2024-02-16', action: 'Validation', par: 'Institution', statut: 'approved' },
      { date: '2024-02-15', action: 'Soumission', par: 'YAO Marie', statut: 'submitted' },
      { date: '2024-02-15', action: 'Création dossier', par: 'YAO Marie', statut: 'draft' },
    ],
    maZone: true, // true si c'est dans la zone de l'identificateur connecté
  },
  '0722334455': {
    numero: '0722334455',
    nom: 'KOFFI',
    prenoms: 'Marie',
    type: 'Producteur',
    activite: 'Culture de manioc',
    zone: 'Marché de Cocody',
    statut: 'submitted',
    dateIdentification: '2024-02-20',
    dateValidation: null,
    identificateur: 'YAO Marie (ID007)',
    coordonneesGPS: '5.3650° N, 4.0120° W',
    photo: null,
    documents: ['CNI', 'Attestation village'],
    historique: [
      { date: '2024-02-20', action: 'Soumission', par: 'YAO Marie', statut: 'submitted' },
      { date: '2024-02-20', action: 'Création dossier', par: 'YAO Marie', statut: 'draft' },
    ],
    maZone: true,
  },
  '0555123456': {
    numero: '0555123456',
    nom: 'TOURE',
    prenoms: 'Awa',
    type: 'Producteur',
    activite: 'Culture de bananes',
    zone: 'Village Adzopé',
    statut: 'approved',
    dateIdentification: '2024-01-10',
    dateValidation: '2024-01-11',
    identificateur: 'DIABATE Ibrahim (ID002)',
    coordonneesGPS: '6.1072° N, 3.8630° W',
    photo: null,
    documents: ['CNI'],
    historique: [
      { date: '2024-01-11', action: 'Validation', par: 'Institution', statut: 'approved' },
      { date: '2024-01-10', action: 'Soumission', par: 'DIABATE Ibrahim', statut: 'submitted' },
      { date: '2024-01-10', action: 'Création dossier', par: 'DIABATE Ibrahim', statut: 'draft' },
    ],
    maZone: false, // HORS ZONE - verrouillé
  },
};

export function ActeurDetails() {
  const { numero } = useParams<{ numero: string }>();
  const navigate = useNavigate();

  const acteur = numero ? MOCK_ACTEURS_DETAILS[numero] : null;

  if (!acteur) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24 lg:pl-[320px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 font-medium">Acteur non trouvé</p>
          <button
            onClick={() => navigate('/identificateur')}
            className="mt-4 px-6 py-2 rounded-xl text-white font-medium"
            style={{ backgroundColor: PRIMARY_COLOR }}
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  const isLocked = !acteur.maZone;

  const getStatutBadge = () => {
    switch (acteur.statut) {
      case 'approved':
        return <div className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700 flex items-center gap-1">
          <CheckCircle className="w-4 h-4" /> Validé
        </div>;
      case 'submitted':
        return <div className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-700 flex items-center gap-1">
          <Clock className="w-4 h-4" /> En cours de validation
        </div>;
      case 'rejected':
        return <div className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700 flex items-center gap-1">
          <XCircle className="w-4 h-4" /> Rejeté
        </div>;
      case 'draft':
        return <div className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 flex items-center gap-1">
          <Clock className="w-4 h-4" /> Brouillon
        </div>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 lg:pl-[320px]">
      {/* Header */}
      <div className="bg-white border-b p-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">Fiche Acteur</h1>
            <p className="text-sm text-gray-600">Détails de l'identification</p>
          </div>
          {isLocked && (
            <div className="flex items-center gap-2 px-3 py-1 bg-red-50 rounded-xl border border-red-200">
              <Lock className="w-4 h-4 text-red-600" />
              <span className="text-xs font-medium text-red-700">Hors zone</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        {/* Message de blocage si hors zone */}
        {isLocked && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6"
          >
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-bold text-red-900">Acteur hors de votre zone</p>
                <p className="text-sm text-red-700 mt-1">
                  Cet acteur appartient à la zone "{acteur.zone}". Vous ne pouvez pas modifier ses informations.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Carte principale */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          {/* Photo/Avatar */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#9F8170] to-[#7a6558] flex items-center justify-center text-white text-3xl font-bold">
              {acteur.prenoms.charAt(0)}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{acteur.prenoms} {acteur.nom}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Phone className="w-4 h-4 text-gray-600" />
                <span className="text-gray-700 font-medium">{acteur.numero}</span>
              </div>
              <div className="mt-2">{getStatutBadge()}</div>
            </div>
          </div>

          {/* Informations principales */}
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <Briefcase className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <p className="text-xs text-gray-600">Type d'acteur</p>
                <p className="font-bold text-gray-900">
                  {acteur.type === 'Marchand' ? '🏪' : '🌾'} {acteur.type}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <Briefcase className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <p className="text-xs text-gray-600">Activité</p>
                <p className="font-bold text-gray-900">{acteur.activite}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <MapPin className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <p className="text-xs text-gray-600">Zone</p>
                <p className="font-bold text-gray-900">{acteur.zone}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <Calendar className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <p className="text-xs text-gray-600">Date d'identification</p>
                <p className="font-bold text-gray-900">
                  {new Date(acteur.dateIdentification).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>

            {acteur.dateValidation && (
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-xl border border-green-200">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-xs text-green-700">Date de validation</p>
                  <p className="font-bold text-green-900">
                    {new Date(acteur.dateValidation).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Informations techniques */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h3 className="font-bold text-gray-900 mb-4">Informations techniques</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-600 mb-1">Identificateur créateur</p>
              <p className="font-medium text-gray-900">{acteur.identificateur}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Coordonnées GPS</p>
              <p className="font-medium text-gray-900">{acteur.coordonneesGPS}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Documents fournis</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {acteur.documents.map((doc: string, idx: number) => (
                  <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                    {doc}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Historique / Audit log */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">📋 Historique des actions</h3>
          <div className="space-y-3">
            {acteur.historique.map((entry: any, idx: number) => (
              <div key={idx} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-b-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  entry.statut === 'approved' ? 'bg-green-100' :
                  entry.statut === 'submitted' ? 'bg-orange-100' :
                  entry.statut === 'rejected' ? 'bg-red-100' : 'bg-gray-100'
                }`}>
                  {entry.statut === 'approved' ? <CheckCircle className="w-4 h-4 text-green-600" /> :
                   entry.statut === 'submitted' ? <Clock className="w-4 h-4 text-orange-600" /> :
                   entry.statut === 'rejected' ? <XCircle className="w-4 h-4 text-red-600" /> :
                   <Clock className="w-4 h-4 text-gray-600" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{entry.action}</p>
                  <p className="text-xs text-gray-600 mt-1">Par {entry.par}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(entry.date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bouton d'édition (si dans ma zone et statut = draft) */}
        {!isLocked && acteur.statut === 'draft' && (
          <motion.button
            onClick={() => navigate(`/identificateur/edit/${acteur.numero}`)}
            className="w-full mt-6 py-4 rounded-2xl text-white font-bold shadow-lg flex items-center justify-center gap-2"
            style={{ backgroundColor: PRIMARY_COLOR }}
            whileTap={{ scale: 0.98 }}
          >
            <Edit className="w-5 h-5" />
            Modifier le dossier
          </motion.button>
        )}
      </div>
    </div>
  );
}
