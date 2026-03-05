import React, { useState } from 'react';
import { ImagePickerField } from '../shared/ImagePickerField';
import { SelectWithAutre } from '../shared/SelectWithAutre';
import { Montant, MontantCard } from '../shared/Montant';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  UserPlus,
  Filter,
  Phone,
  MapPin,
  Calendar,
  TrendingUp,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  X,
  Check,
  AlertCircle,
  Package,
  Mic,
} from 'lucide-react';
import { useCooperative, MembreCooperative } from '../../contexts/CooperativeContext';
import { useApp } from '../../contexts/AppContext';
import { useModalRegister } from '../../contexts/ModalContext';
import { Navigation } from '../layout/Navigation';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { SearchBar } from '../shared/SearchBar';
import { matchesSearch } from '../../utils/searchUtils';

const COOPERATIVE_COLOR = '#2072AF';

type FiltreStatut = 'tous' | 'actif' | 'inactif' | 'suspendu';

export function GestionMembres() {
  const {
    membres,
    ajouterMembre,
    modifierMembre,
    supprimerMembre,
    getMembresActifs,
  } = useCooperative();
  const { speak } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filtreStatut, setFiltreStatut] = useState<FiltreStatut>('tous');
  const [showAjoutModal, setShowAjoutModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [membreSelectionne, setMembreSelectionne] = useState<MembreCooperative | null>(null);
  const [isListening, setIsListening] = useState(false);

  // Sync ModalContext (remplace l'ancien setIsModalOpen)
  useModalRegister(showAjoutModal || showDetailModal);

  // Formulaire nouveau membre
  const [photoMembre, setPhotoMembre] = useState('');
  const [nomMembre, setNomMembre] = useState('');
  const [prenomMembre, setPrenomMembre] = useState('');
  const [telephoneMembre, setTelephoneMembre] = useState('');
  const [specialiteMembre, setSpecialiteMembre] = useState('Maraîcher');
  const [localisationMembre, setLocalisationMembre] = useState('');

  // Filtrer les membres — fonction unifiée
  const membresFiltres = membres.filter(membre => {
    const matchSearch = matchesSearch(
      searchTerm,
      membre.nom,
      membre.prenom,
      membre.telephone,
      membre.specialite,
      membre.localisation,
    );
    if (!matchSearch) return false;
    if (filtreStatut !== 'tous' && membre.statut !== filtreStatut) return false;
    return true;
  });

  // Statistiques rapides
  const totalMembres = membres.length;
  const membresActifs = getMembresActifs();
  const totalCotisationsRecues = membres.filter(m => m.cotisationPayee).length * 25000;
  const totalProductionsActives = membres.reduce((acc, m) => acc + m.productionsActives, 0);

  const handleAjouterMembre = () => {
    if (!nomMembre || !prenomMembre || !telephoneMembre || !localisationMembre) {
      speak('Remplis tous les champs obligatoires');
      return;
    }

    ajouterMembre({
      nom: nomMembre,
      prenom: prenomMembre,
      telephone: telephoneMembre,
      specialite: specialiteMembre,
      localisation: localisationMembre,
      dateAdhesion: new Date().toISOString(),
      cotisationPayee: false,
      montantCotisation: 25000,
      productionsActives: 0,
      totalVentes: 0,
      statut: 'actif',
    });

    speak(`${prenomMembre} ${nomMembre} ajouté comme membre de la coopérative`);

    // Reset
    setShowAjoutModal(false);
    setNomMembre('');
    setPrenomMembre('');
    setTelephoneMembre('');
    setSpecialiteMembre('Maraîcher');
    setLocalisationMembre('');
  };

  const handleVoirDetail = (membre: MembreCooperative) => {
    setMembreSelectionne(membre);
    setShowDetailModal(true);
  };

  const handleMarquerCotisation = (membreId: string, paye: boolean) => {
    modifierMembre(membreId, { cotisationPayee: paye });
    speak(paye ? 'Cotisation marquée comme payée' : 'Cotisation marquée comme non payée');
  };

  const handleChangerStatut = (membreId: string, statut: 'actif' | 'inactif' | 'suspendu') => {
    modifierMembre(membreId, { statut });
    speak(`Statut changé en ${statut}`);
  };

  const startVoiceSearch = () => {
    setIsListening(true);
    speak('Dis le nom du membre que tu cherches');
    // Simulation reconnaissance vocale
    setTimeout(() => {
      setIsListening(false);
    }, 3000);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'actif':
        return '#10B981';
      case 'inactif':
        return '#6B7280';
      case 'suspendu':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case 'actif':
        return 'Actif';
      case 'inactif':
        return 'Inactif';
      case 'suspendu':
        return 'Suspendu';
      default:
        return statut;
    }
  };

  const specialites = [
    'Maraîcher',
    'Céréalier',
    'Fruitier',
    'Tubercules',
    'Éleveur',
    'Pêcheur',
    'Transformateur',
    'Autre',
  ];

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-32">
        {/* Header Stats */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-4 py-6 shadow-lg">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Gestion des membres</h1>
                <p className="text-blue-200 text-sm mt-1">{totalMembres} membres inscrits</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setShowAjoutModal(true);
                  speak('Ajouter un nouveau membre');
                }}
                className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg"
              >
                <UserPlus className="w-7 h-7 text-white" />
              </motion.button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-3"
              >
                <Users className="w-5 h-5 text-blue-200 mb-1" />
                <p className="text-2xl font-bold text-white">{membresActifs}</p>
                <p className="text-xs text-blue-200">Actifs</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-3"
              >
                <Package className="w-5 h-5 text-blue-200 mb-1" />
                <p className="text-2xl font-bold text-white">{totalProductionsActives}</p>
                <p className="text-xs text-blue-200">Productions</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-3"
              >
                <CheckCircle className="w-5 h-5 text-blue-200 mb-1" />
                <p className="text-2xl font-bold text-white">
                  {membres.filter(m => m.cotisationPayee).length}
                </p>
                <p className="text-xs text-blue-200">Cotisations</p>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Recherche et Filtres */}
        <div className="px-4 py-4 space-y-3">
          {/* Barre de recherche */}
          <SearchBar
            value={searchTerm}
            onChange={(val) => setSearchTerm(val)}
            placeholder="Rechercher un membre..."
            primaryColor={COOPERATIVE_COLOR}
          />

          {/* Filtres statut */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {(['tous', 'actif', 'inactif', 'suspendu'] as FiltreStatut[]).map(statut => (
              <motion.button
                key={statut}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFiltreStatut(statut)}
                className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors"
                style={{
                  backgroundColor:
                    filtreStatut === statut
                      ? statut === 'tous'
                        ? COOPERATIVE_COLOR
                        : getStatutColor(statut)
                      : 'white',
                  color:
                    filtreStatut === statut
                      ? 'white'
                      : statut === 'tous'
                      ? COOPERATIVE_COLOR
                      : getStatutColor(statut),
                  border: `2px solid ${
                    statut === 'tous' ? COOPERATIVE_COLOR : getStatutColor(statut)
                  }`,
                }}
              >
                {statut === 'tous' ? 'Tous' : getStatutLabel(statut)}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Liste des membres */}
        <div className="px-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">
              Membres ({membresFiltres.length})
            </h2>
          </div>

          <AnimatePresence mode="popLayout">
            {membresFiltres.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Aucun membre trouvé</p>
              </motion.div>
            ) : (
              membresFiltres.map((membre, index) => (
                <motion.div
                  key={membre.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => handleVoirDetail(membre)}
                  className="bg-white rounded-2xl p-4 shadow-md cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
                      style={{ backgroundColor: COOPERATIVE_COLOR }}
                    >
                      {membre.prenom[0]}
                      {membre.nom[0]}
                    </div>

                    {/* Infos */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 truncate">
                            {membre.prenom} {membre.nom}
                          </h3>
                          <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                            <Package className="w-3.5 h-3.5 flex-shrink-0" />
                            {membre.specialite}
                          </p>
                        </div>
                        <span
                          className="px-2 py-1 rounded-full text-xs font-medium flex-shrink-0"
                          style={{
                            backgroundColor: `${getStatutColor(membre.statut)}20`,
                            color: getStatutColor(membre.statut),
                          }}
                        >
                          {getStatutLabel(membre.statut)}
                        </span>
                      </div>

                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-gray-500 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                          {membre.telephone}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                          {membre.localisation}
                        </p>
                      </div>

                      <div className="mt-3 flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span className="text-xs font-medium text-gray-700">
                            {membre.totalVentes.toLocaleString()} <span className="text-[10px] opacity-70">FCFA</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Package className="w-4 h-4 text-blue-600" />
                          <span className="text-xs font-medium text-gray-700">
                            {membre.productionsActives} produit{membre.productionsActives > 1 ? 's' : ''}
                          </span>
                        </div>
                        {membre.cotisationPayee ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      <Navigation role="cooperative" onMicClick={startVoiceSearch} />

      {/* Modal Ajouter Membre */}
      <AnimatePresence>
        {showAjoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-end px-4 pb-4"
            onClick={() => setShowAjoutModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-2xl mx-auto shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Nouveau membre</h2>
                <motion.button
                  onClick={() => setShowAjoutModal(false)}
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </motion.button>
              </div>

              {/* Formulaire */}
              <div className="p-6 space-y-4">
                {/* Photo du membre */}
                <ImagePickerField
                  label="Photo du membre"
                  value={photoMembre}
                  onChange={setPhotoMembre}
                  primaryColor="#2072AF"
                  shape="circle"
                  size={96}
                />

                {/* Prénom */}
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">Prénom *</Label>
                  <Input
                    type="text"
                    value={prenomMembre}
                    onChange={(e) => setPrenomMembre(e.target.value)}
                    placeholder="Ex: Aminata"
                    className="h-12 rounded-xl border-2 border-gray-200 focus:border-blue-500"
                  />
                </div>

                {/* Nom */}
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">Nom *</Label>
                  <Input
                    type="text"
                    value={nomMembre}
                    onChange={(e) => setNomMembre(e.target.value)}
                    placeholder="Ex: Koné"
                    className="h-12 rounded-xl border-2 border-gray-200 focus:border-blue-500"
                  />
                </div>

                {/* Téléphone */}
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">Téléphone *</Label>
                  <Input
                    type="tel"
                    value={telephoneMembre}
                    onChange={(e) => setTelephoneMembre(e.target.value)}
                    placeholder="+225 XX XX XX XX XX"
                    className="h-12 rounded-xl border-2 border-gray-200 focus:border-blue-500"
                  />
                </div>

                {/* Spécialité */}
                <SelectWithAutre
                  label="Spécialité *"
                  value={specialiteMembre}
                  onChange={setSpecialiteMembre}
                  options={specialites}
                  primaryColor={COOPERATIVE_COLOR}
                  placeholder="Ex: Apiculteur, Pisciculteur..."
                />

                {/* Localisation */}
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">Localisation *</Label>
                  <Input
                    type="text"
                    value={localisationMembre}
                    onChange={(e) => setLocalisationMembre(e.target.value)}
                    placeholder="Ex: Yopougon"
                    className="h-12 rounded-xl border-2 border-gray-200 focus:border-blue-500"
                  />
                </div>

                {/* Info */}
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-xs text-gray-700">
                    ℹ️ <strong>Info :</strong> La cotisation mensuelle est fixée à 25 000 FCFA. Le nouveau membre pourra la payer ultérieurement.
                  </p>
                </div>

                {/* Bouton Ajouter */}
                <motion.button
                  onClick={handleAjouterMembre}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: COOPERATIVE_COLOR,
                    color: 'white',
                  }}
                >
                  <UserPlus className="w-5 h-5" />
                  Ajouter le membre
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Détail Membre */}
      <AnimatePresence>
        {showDetailModal && membreSelectionne && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-end px-4 pb-4"
            onClick={() => setShowDetailModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-2xl mx-auto shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div
                className="px-6 py-6 text-white relative overflow-hidden"
                style={{ backgroundColor: COOPERATIVE_COLOR }}
              >
                <div className="flex items-start justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-2xl">
                      {membreSelectionne.prenom[0]}
                      {membreSelectionne.nom[0]}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">
                        {membreSelectionne.prenom} {membreSelectionne.nom}
                      </h2>
                      <p className="text-blue-100 text-sm">{membreSelectionne.specialite}</p>
                    </div>
                  </div>
                  <motion.button
                    onClick={() => setShowDetailModal(false)}
                    whileHover={{ rotate: 90 }}
                    className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* Stats rapides */}
                <div className="grid grid-cols-2 gap-2 mt-4 relative z-10">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                    <p className="text-xs text-blue-100 mb-1">Total ventes</p>
                    <p className="text-lg font-bold"><Montant value={membreSelectionne.totalVentes} size="md" color="white" /></p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                    <p className="text-xs text-blue-100 mb-1">Productions actives</p>
                    <p className="text-lg font-bold">{membreSelectionne.productionsActives}</p>
                  </div>
                </div>
              </div>

              {/* Détails */}
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Téléphone</p>
                  <p className="font-semibold text-gray-900">{membreSelectionne.telephone}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Localisation</p>
                  <p className="font-semibold text-gray-900">{membreSelectionne.localisation}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Date d'adhésion</p>
                  <p className="font-semibold text-gray-900">{formatDate(membreSelectionne.dateAdhesion)}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Cotisation mensuelle</p>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">
                      <Montant value={membreSelectionne.montantCotisation} size="sm" color="#1f2937" />
                    </p>
                    {membreSelectionne.cotisationPayee ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Payée
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Non payée
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Statut</p>
                  <span
                    className="inline-block px-3 py-1 rounded-full text-sm font-medium"
                    style={{
                      backgroundColor: `${getStatutColor(membreSelectionne.statut)}20`,
                      color: getStatutColor(membreSelectionne.statut),
                    }}
                  >
                    {getStatutLabel(membreSelectionne.statut)}
                  </span>
                </div>

                {/* Actions rapides */}
                <div className="pt-4 space-y-2">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Actions rapides</p>

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      handleMarquerCotisation(
                        membreSelectionne.id,
                        !membreSelectionne.cotisationPayee
                      );
                      setMembreSelectionne({
                        ...membreSelectionne,
                        cotisationPayee: !membreSelectionne.cotisationPayee,
                      });
                    }}
                    className="w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 border-2"
                    style={{
                      borderColor: membreSelectionne.cotisationPayee ? '#F59E0B' : '#10B981',
                      color: membreSelectionne.cotisationPayee ? '#F59E0B' : '#10B981',
                    }}
                  >
                    {membreSelectionne.cotisationPayee ? (
                      <>
                        <XCircle className="w-4 h-4" />
                        Marquer cotisation non payée
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Marquer cotisation payée
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}