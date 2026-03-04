import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Camera, 
  Upload, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  ShoppingBag,
  Building2,
  Users,
  CheckCircle,
  X,
  Save,
  FileText
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';
import { useUser } from '../../contexts/UserContext';
import { useApp } from '../../contexts/AppContext';

const PRIMARY_COLOR = '#9F8170';
const SECONDARY_COLOR = '#DAC8AE';

interface FormData {
  // Identifiant
  numeroId: string;
  
  // Photo
  photo: string | null;
  
  // Identité
  nom: string;
  prenoms: string;
  lieuNaissance: string;
  dateNaissance: string;
  
  // Contact
  telephone: string;
  email: string;
  
  // Lieu d'exercice
  commune: string;
  marche: string;
  emplacement: string;
  
  // Activité
  produitsVendus: string;
  typeCommerce: {
    grossiste: boolean;
    semiGrossiste: boolean;
    detaillant: boolean;
  };
  
  // Responsables
  nomResponsableMarche: string;
  nomResponsableCooperative: string;
  
  // Signature
  signature: string | null;
}

export function FormulaireIdentificationMarchand() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { speak } = useApp();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Générer un ID automatique
  const generateNumeroId = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 9999) + 1;
    return `MARC-${year}-${String(random).padStart(4, '0')}`;
  };

  const [formData, setFormData] = useState<FormData>({
    numeroId: generateNumeroId(),
    photo: null,
    nom: '',
    prenoms: '',
    lieuNaissance: '',
    dateNaissance: '',
    telephone: (location.state?.phone as string) || '',
    email: '',
    commune: '',
    marche: '',
    emplacement: '',
    produitsVendus: '',
    typeCommerce: {
      grossiste: false,
      semiGrossiste: false,
      detaillant: false,
    },
    nomResponsableMarche: '',
    nomResponsableCooperative: '',
    signature: null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCamera, setShowCamera] = useState(false);

  // Validation en temps réel
  const validateField = (field: string, value: any) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'telephone':
        if (value && value.length !== 10) {
          newErrors.telephone = 'Le numéro doit contenir 10 chiffres';
        } else {
          delete newErrors.telephone;
        }
        break;
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Email invalide';
        } else {
          delete newErrors.email;
        }
        break;
      case 'nom':
      case 'prenoms':
      case 'commune':
      case 'marche':
        if (!value || value.trim() === '') {
          newErrors[field] = 'Ce champ est obligatoire';
        } else {
          delete newErrors[field];
        }
        break;
    }

    setErrors(newErrors);
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData({ ...formData, [field]: value });
    validateField(field, value);
  };

  // Gestion photo
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photo: reader.result as string });
        speak?.('Photo ajoutée avec succès');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = () => {
    setShowCamera(true);
    speak?.('Prends la photo du marchand');
    // TODO: Implémenter la capture caméra réelle
    // Pour l'instant, on simule avec un upload
    setTimeout(() => {
      fileInputRef.current?.click();
      setShowCamera(false);
    }, 500);
  };

  // Gestion signature
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = signatureCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.strokeStyle = PRIMARY_COLOR;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (isDrawing && signatureCanvasRef.current) {
      const signature = signatureCanvasRef.current.toDataURL();
      setFormData({ ...formData, signature });
      speak?.('Signature enregistrée');
    }
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setFormData({ ...formData, signature: null });
        speak?.('Signature effacée');
      }
    }
  };

  // Soumission du formulaire
  const handleSubmit = () => {
    // Validation finale
    const requiredFields = ['nom', 'prenoms', 'telephone', 'commune', 'marche'];
    const newErrors: Record<string, string> = {};

    requiredFields.forEach(field => {
      if (!formData[field as keyof FormData]) {
        newErrors[field] = 'Ce champ est obligatoire';
      }
    });

    if (!formData.photo) {
      newErrors.photo = 'La photo est obligatoire';
    }

    if (!formData.signature) {
      newErrors.signature = 'La signature est obligatoire';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      speak?.('Certains champs obligatoires sont manquants');
      return;
    }

    // Sauvegarder localement (préparé pour Supabase)
    const identifications = JSON.parse(localStorage.getItem('identifications') || '[]');
    identifications.push({
      ...formData,
      dateIdentification: new Date().toISOString(),
      identificateurId: user?.id,
      identificateurNom: user?.name,
      statut: 'en_attente', // Le Marchand doit créer son code
    });
    localStorage.setItem('identifications', JSON.stringify(identifications));

    // Créer automatiquement le profil Marchand
    const marchands = JSON.parse(localStorage.getItem('marchands') || '[]');
    marchands.push({
      id: formData.numeroId,
      telephone: formData.telephone,
      nom: formData.nom,
      prenoms: formData.prenoms,
      email: formData.email,
      commune: formData.commune,
      marche: formData.marche,
      emplacement: formData.emplacement,
      produitsVendus: formData.produitsVendus,
      typeCommerce: formData.typeCommerce,
      photo: formData.photo,
      dateCreation: new Date().toISOString(),
      statut: 'actif',
      codeSecurite: null, // Sera créé par le Marchand
      premièreConnexion: true,
    });
    localStorage.setItem('marchands', JSON.stringify(marchands));

    speak?.(`${formData.prenoms} ${formData.nom} a été identifié avec succès. Le compte Marchand est créé. Il peut se connecter avec son numéro ${formData.telephone}`);

    setTimeout(() => {
      navigate('/identificateur');
    }, 2000);
  };

  if (!user) return null;

  return (
    <div className="pb-32 lg:pb-8 pt-24 lg:pt-16 px-4 lg:pl-[320px] max-w-4xl mx-auto min-h-screen bg-gradient-to-b from-amber-50 to-white">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Fiche d'Identification Marchand</h1>
          <p className="text-sm text-gray-600">République de Côte d'Ivoire - JULABA</p>
        </div>
      </div>

      {/* Formulaire principal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-lg p-6 mb-6"
      >
        {/* En-tête de la fiche */}
        <div className="flex items-start justify-between mb-6 pb-4 border-b-2 border-gray-200">
          <div>
            <h2 className="text-sm font-bold text-gray-600 mb-1">FICHE D'IDENTIFICATION</h2>
            <p className="text-xs text-gray-500">Plateforme Nationale d'Inclusion Économique</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-gray-600">N° ID</p>
            <p className="text-lg font-black" style={{ color: PRIMARY_COLOR }}>{formData.numeroId}</p>
          </div>
        </div>

        {/* Section Photo */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-3">Photo d'identité *</label>
          <div className="flex items-center gap-4">
            {formData.photo ? (
              <div className="relative">
                <img 
                  src={formData.photo} 
                  alt="Photo" 
                  className="w-32 h-32 object-cover rounded-2xl border-4"
                  style={{ borderColor: PRIMARY_COLOR }}
                />
                <button
                  onClick={() => setFormData({ ...formData, photo: null })}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div 
                className="w-32 h-32 border-4 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50"
                style={{ borderColor: SECONDARY_COLOR }}
              >
                <Camera className="w-8 h-8 text-gray-400 mb-1" />
                <p className="text-xs text-gray-500 text-center">Photo</p>
              </div>
            )}
            
            <div className="flex flex-col gap-2">
              <motion.button
                onClick={handleCameraCapture}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm text-white shadow-md"
                style={{ backgroundColor: PRIMARY_COLOR }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Camera className="w-4 h-4" />
                Prendre photo
              </motion.button>
              
              <motion.button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm border-2"
                style={{ borderColor: PRIMARY_COLOR, color: PRIMARY_COLOR }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Upload className="w-4 h-4" />
                Charger photo
              </motion.button>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
          {errors.photo && <p className="text-red-500 text-xs mt-2">{errors.photo}</p>}
        </div>

        {/* Identité */}
        <div className="mb-6">
          <h3 className="text-sm font-bold mb-3" style={{ color: PRIMARY_COLOR }}>
            <User className="w-4 h-4 inline mr-2" />
            IDENTITÉ
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
              <input
                type="text"
                value={formData.nom}
                onChange={(e) => handleInputChange('nom', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#9F8170] focus:outline-none"
                placeholder="KOUASSI"
              />
              {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prénoms *</label>
              <input
                type="text"
                value={formData.prenoms}
                onChange={(e) => handleInputChange('prenoms', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#9F8170] focus:outline-none"
                placeholder="Aminata Marie"
              />
              {errors.prenoms && <p className="text-red-500 text-xs mt-1">{errors.prenoms}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Lieu de naissance</label>
              <input
                type="text"
                value={formData.lieuNaissance}
                onChange={(e) => handleInputChange('lieuNaissance', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#9F8170] focus:outline-none"
                placeholder="Abidjan"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date de naissance</label>
              <input
                type="date"
                value={formData.dateNaissance}
                onChange={(e) => handleInputChange('dateNaissance', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#9F8170] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="mb-6">
          <h3 className="text-sm font-bold mb-3" style={{ color: PRIMARY_COLOR }}>
            <Phone className="w-4 h-4 inline mr-2" />
            CONTACT
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone *</label>
              <input
                type="tel"
                value={formData.telephone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                  handleInputChange('telephone', value);
                }}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#9F8170] focus:outline-none"
                placeholder="0701020304"
                inputMode="numeric"
              />
              {errors.telephone && <p className="text-red-500 text-xs mt-1">{errors.telephone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#9F8170] focus:outline-none"
                placeholder="aminata@example.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
          </div>
        </div>

        {/* Lieu d'exercice */}
        <div className="mb-6">
          <h3 className="text-sm font-bold mb-3" style={{ color: PRIMARY_COLOR }}>
            <MapPin className="w-4 h-4 inline mr-2" />
            LIEU D'EXERCICE
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Commune *</label>
              <input
                type="text"
                value={formData.commune}
                onChange={(e) => handleInputChange('commune', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#9F8170] focus:outline-none"
                placeholder="Yopougon"
              />
              {errors.commune && <p className="text-red-500 text-xs mt-1">{errors.commune}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Marché *</label>
              <input
                type="text"
                value={formData.marche}
                onChange={(e) => handleInputChange('marche', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#9F8170] focus:outline-none"
                placeholder="Marché de Siporex"
              />
              {errors.marche && <p className="text-red-500 text-xs mt-1">{errors.marche}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Emplacement (Secteur)</label>
              <input
                type="text"
                value={formData.emplacement}
                onChange={(e) => handleInputChange('emplacement', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#9F8170] focus:outline-none"
                placeholder="Secteur A, Allée 3"
              />
            </div>
          </div>
        </div>

        {/* Activité commerciale */}
        <div className="mb-6">
          <h3 className="text-sm font-bold mb-3" style={{ color: PRIMARY_COLOR }}>
            <ShoppingBag className="w-4 h-4 inline mr-2" />
            ACTIVITÉ COMMERCIALE
          </h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Produits vendus</label>
            <textarea
              value={formData.produitsVendus}
              onChange={(e) => handleInputChange('produitsVendus', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#9F8170] focus:outline-none"
              placeholder="Riz, tomates, oignons, pommes de terre..."
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Type de commerce (choix multiples)</label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.typeCommerce.grossiste}
                  onChange={(e) => handleInputChange('typeCommerce', {
                    ...formData.typeCommerce,
                    grossiste: e.target.checked,
                  })}
                  className="w-5 h-5 rounded accent-[#9F8170]"
                />
                <span className="text-sm font-medium text-gray-700">Grossiste</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.typeCommerce.semiGrossiste}
                  onChange={(e) => handleInputChange('typeCommerce', {
                    ...formData.typeCommerce,
                    semiGrossiste: e.target.checked,
                  })}
                  className="w-5 h-5 rounded accent-[#9F8170]"
                />
                <span className="text-sm font-medium text-gray-700">Semi-grossiste</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.typeCommerce.detaillant}
                  onChange={(e) => handleInputChange('typeCommerce', {
                    ...formData.typeCommerce,
                    detaillant: e.target.checked,
                  })}
                  className="w-5 h-5 rounded accent-[#9F8170]"
                />
                <span className="text-sm font-medium text-gray-700">Détaillant</span>
              </label>
            </div>
          </div>
        </div>

        {/* Responsables */}
        <div className="mb-6">
          <h3 className="text-sm font-bold mb-3" style={{ color: PRIMARY_COLOR }}>
            <Users className="w-4 h-4 inline mr-2" />
            RESPONSABLES
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom Responsable du marché</label>
              <input
                type="text"
                value={formData.nomResponsableMarche}
                onChange={(e) => handleInputChange('nomResponsableMarche', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#9F8170] focus:outline-none"
                placeholder="Nom du responsable"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom Responsable coopérative (si applicable)</label>
              <input
                type="text"
                value={formData.nomResponsableCooperative}
                onChange={(e) => handleInputChange('nomResponsableCooperative', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#9F8170] focus:outline-none"
                placeholder="Nom du responsable"
              />
            </div>
          </div>
        </div>

        {/* Signature digitale */}
        <div className="mb-6">
          <h3 className="text-sm font-bold mb-3" style={{ color: PRIMARY_COLOR }}>
            <FileText className="w-4 h-4 inline mr-2" />
            SIGNATURE ET CACHET *
          </h3>
          <div className="border-2 border-dashed rounded-2xl p-4" style={{ borderColor: SECONDARY_COLOR }}>
            <p className="text-xs text-gray-600 mb-2">Signez dans le cadre ci-dessous</p>
            <div className="relative">
              <canvas
                ref={signatureCanvasRef}
                width={600}
                height={200}
                className="w-full border-2 border-gray-300 rounded-xl bg-white cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
              {formData.signature && (
                <motion.button
                  onClick={clearSignature}
                  className="absolute top-2 right-2 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-lg shadow-md"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Effacer
                </motion.button>
              )}
            </div>
          </div>
          {errors.signature && <p className="text-red-500 text-xs mt-2">{errors.signature}</p>}
        </div>

        {/* Bouton Soumettre */}
        <motion.button
          onClick={handleSubmit}
          className="w-full py-4 rounded-2xl font-bold text-white shadow-lg flex items-center justify-center gap-2"
          style={{ backgroundColor: PRIMARY_COLOR }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Save className="w-5 h-5" />
          Enregistrer et créer le compte Marchand
        </motion.button>
      </motion.div>
    </div>
  );
}