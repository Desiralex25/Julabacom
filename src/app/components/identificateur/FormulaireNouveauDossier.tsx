import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, User, Briefcase, FileText, MapPin, Check, Navigation } from 'lucide-react';
import { motion } from 'motion/react';
import { ImagePickerField } from '../shared/ImagePickerField';

const PRIMARY_COLOR = '#9F8170';

type Step = 1 | 2 | 3 | 4;

export function FormulaireNouveauDossier() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [useRealGPS, setUseRealGPS] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    // Étape 1: Identité
    prenoms: '',
    nom: '',
    telephone: '',
    dateNaissance: '',
    genre: '',
    
    // Étape 2: Activité économique
    typeActeur: '',
    activite: '',
    localisation: '',
    anneesDExperience: '',
    
    // Étape 3: Documents
    photoProfil: null,
    photoCNI: null,
    autresDocuments: [] as File[],
    
    // Étape 4: Signature et GPS
    signature: null,
    coordonneesGPS: '',
    consentement: false,
  });

  const steps = [
    { number: 1, title: 'Identité', icon: User },
    { number: 2, title: 'Activité', icon: Briefcase },
    { number: 3, title: 'Documents', icon: FileText },
    { number: 4, title: 'GPS & Signature', icon: MapPin },
  ];

  const handleNext = () => {
    // Validation avant de passer à l'étape suivante
    if (validateCurrentStep()) {
      if (currentStep < 4) {
        setCurrentStep((currentStep + 1) as Step);
      }
    } else {
      alert('Veuillez remplir tous les champs obligatoires');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const handleSubmit = () => {
    if (validateCurrentStep()) {
      alert('Dossier soumis avec succès !');
      // TODO: Envoyer les données
    } else {
      alert('Veuillez remplir tous les champs obligatoires');
    }
  };

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!(formData.prenoms && formData.nom && formData.telephone && formData.dateNaissance && formData.genre);
      case 2:
        return !!(formData.typeActeur && formData.activite && formData.localisation);
      case 3:
        return !!(formData.photoProfil && formData.photoCNI);
      case 4:
        return !!(formData.coordonneesGPS && formData.consentement);
      default:
        return false;
    }
  };

  const handleGetGPS = () => {
    if (useRealGPS && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = `${position.coords.latitude.toFixed(4)}° N, ${position.coords.longitude.toFixed(4)}° W`;
          setFormData({ ...formData, coordonneesGPS: coords });
        },
        (error) => {
          alert('Impossible d\'obtenir la position GPS');
          // Fallback sur mock
          const mockCoords = `5.${Math.floor(Math.random() * 1000)}° N, 4.${Math.floor(Math.random() * 1000)}° W`;
          setFormData({ ...formData, coordonneesGPS: mockCoords });
        }
      );
    } else {
      // Mock GPS
      const mockCoords = `5.${Math.floor(Math.random() * 1000)}° N, 4.${Math.floor(Math.random() * 1000)}° W`;
      setFormData({ ...formData, coordonneesGPS: mockCoords });
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Stepper */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.number;
            const isCompleted = currentStep > step.number;
            
            return (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                    isCompleted ? 'bg-green-500 text-white' :
                    isActive ? 'bg-[#9F8170] text-white' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {isCompleted ? <Check className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                  </div>
                  <p className={`text-xs mt-2 font-medium ${
                    isActive ? 'text-gray-900' : 'text-gray-600'
                  }`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 rounded-full ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        {currentStep === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Étape 1 : Identité</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prénoms <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.prenoms}
                onChange={(e) => setFormData({ ...formData, prenoms: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#9F8170] focus:outline-none"
                placeholder="Ex: Jean Marie"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#9F8170] focus:outline-none"
                placeholder="Ex: KOUASSI"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#9F8170] focus:outline-none"
                placeholder="Ex: 07 22 45 67 89"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de naissance <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.dateNaissance}
                onChange={(e) => setFormData({ ...formData, dateNaissance: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#9F8170] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Genre <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {['Homme', 'Femme'].map((option) => (
                  <button
                    key={option}
                    onClick={() => setFormData({ ...formData, genre: option })}
                    className={`py-3 rounded-xl font-medium border-2 transition-all ${
                      formData.genre === option
                        ? 'border-[#9F8170] bg-[#9F8170]/10 text-[#9F8170]'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Étape 2 : Activité économique</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type d'acteur <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'Marchand', icon: '🏪' },
                  { value: 'Producteur', icon: '🌾' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFormData({ ...formData, typeActeur: option.value })}
                    className={`py-4 rounded-xl font-medium border-2 transition-all flex items-center justify-center gap-2 ${
                      formData.typeActeur === option.value
                        ? 'border-[#9F8170] bg-[#9F8170]/10 text-[#9F8170]'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    <span className="text-2xl">{option.icon}</span>
                    <span>{option.value}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Activité principale <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.activite}
                onChange={(e) => setFormData({ ...formData, activite: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#9F8170] focus:outline-none"
                placeholder="Ex: Vente de légumes, Culture de manioc..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Localisation (Marché ou Village) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.localisation}
                onChange={(e) => setFormData({ ...formData, localisation: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#9F8170] focus:outline-none"
                placeholder="Ex: Marché de Cocody, Village Adzopé..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Années d'expérience (optionnel)
              </label>
              <input
                type="number"
                value={formData.anneesDExperience}
                onChange={(e) => setFormData({ ...formData, anneesDExperience: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#9F8170] focus:outline-none"
                placeholder="Ex: 5"
              />
            </div>
          </motion.div>
        )}

        {currentStep === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Étape 3 : Documents et photos</h2>

            {/* Photo de profil — ImagePickerField */}
            <ImagePickerField
              label="Photo de profil *"
              value={typeof formData.photoProfil === 'string' ? formData.photoProfil : ''}
              onChange={(url) => setFormData({ ...formData, photoProfil: url as any })}
              primaryColor={PRIMARY_COLOR}
              shape="circle"
              size={100}
            />

            {/* Photo CNI — ImagePickerField */}
            <ImagePickerField
              label="Photo CNI (Carte d'identité) *"
              value={typeof formData.photoCNI === 'string' ? formData.photoCNI : ''}
              onChange={(url) => setFormData({ ...formData, photoCNI: url as any })}
              primaryColor={PRIMARY_COLOR}
              shape="rect"
              size={100}
            />

            {/* Autres documents */}
            <ImagePickerField
              label="Autres documents (optionnel)"
              value={''}
              onChange={() => {}}
              primaryColor={PRIMARY_COLOR}
              shape="rect"
              size={90}
            />
          </motion.div>
        )}

        {currentStep === 4 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Étape 4 : Signature et GPS</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Coordonnées GPS <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.coordonneesGPS}
                  readOnly
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-300 bg-gray-50"
                  placeholder="Cliquer sur le bouton pour obtenir la position"
                />
                <button
                  onClick={handleGetGPS}
                  className="px-4 py-3 rounded-xl text-white font-medium flex items-center gap-2 whitespace-nowrap"
                  style={{ backgroundColor: PRIMARY_COLOR }}
                >
                  <Navigation className="w-4 h-4" />
                  GPS
                </button>
              </div>
              
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="useRealGPS"
                  checked={useRealGPS}
                  onChange={(e) => setUseRealGPS(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <label htmlFor="useRealGPS" className="text-sm text-gray-600">
                  Utiliser la vraie géolocalisation (sinon : mock)
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Signature (optionnel)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#9F8170] transition-colors cursor-pointer">
                <p className="text-sm text-gray-600">Zone de signature tactile (à implémenter)</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.consentement}
                  onChange={(e) => setFormData({ ...formData, consentement: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 mt-0.5"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Consentement RGPD <span className="text-red-500">*</span>
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    J'accepte que mes données personnelles soient collectées et traitées par JULABA dans le cadre de mon enregistrement sur la plateforme.
                  </p>
                </div>
              </label>
            </div>
          </motion.div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-6 pt-6 border-t">
          {currentStep > 1 && (
            <button
              onClick={handlePrevious}
              className="flex-1 py-3 rounded-xl border-2 border-gray-300 font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              Précédent
            </button>
          )}
          
          {currentStep < 4 && (
            <button
              onClick={handleNext}
              className="flex-1 py-3 rounded-xl text-white font-medium flex items-center justify-center gap-2"
              style={{ backgroundColor: PRIMARY_COLOR }}
            >
              Suivant
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {currentStep === 4 && (
            <button
              onClick={handleSubmit}
              className="flex-1 py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2"
              style={{ backgroundColor: PRIMARY_COLOR }}
            >
              <Check className="w-5 h-5" />
              Soumettre le dossier
            </button>
          )}
        </div>
      </div>
    </div>
  );
}