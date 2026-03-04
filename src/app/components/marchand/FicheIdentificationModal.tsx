import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  ShoppingBag, 
  Users, 
  FileText, 
  Shield,
  Calendar,
  Edit3,
  Save,
  Camera,
  Upload,
  Wheat,
  Building2,
  Home,
  Baby,
  Heart,
  IdCard,
  Briefcase,
} from 'lucide-react';

const PRIMARY_COLOR = '#C46210';
const SECONDARY_COLOR = '#DAC8AE';

interface FicheIdentificationModalProps {
  onClose: () => void;
  speak: (text: string) => void;
  user: any;
  onSave: (updatedUser: any) => void;
}

export function FicheIdentificationModal({ onClose, speak, user, onSave }: FicheIdentificationModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);

  // État local pour les modifications
  const [formData, setFormData] = useState({
    // IDENTITÉ
    nom: user.nom || '',
    prenoms: user.prenoms || '',
    lieuNaissance: user.lieuNaissance || '',
    dateNaissance: user.dateNaissance || '',
    nationalite: user.nationalite || 'Ivoirienne',
    situationMatrimoniale: user.situationMatrimoniale || '',
    nombreEnfants: user.nombreEnfants || '',
    
    // CONTACT
    telephone: user.telephone || '',
    telephoneUrgence: user.telephoneUrgence || '',
    email: user.email || '',
    lieuResidence: user.lieuResidence || '',
    
    // LIEU D'EXERCICE
    commune: user.commune || user.localisation || '',
    marche: user.marche || user.localisation || '',
    emplacement: user.emplacement || '',
    box: user.box || '',
    nombreMagasin: user.nombreMagasin || '',
    nombreTable: user.nombreTable || '',
    
    // ACTIVITÉ COMMERCIALE
    servicesMarchand: user.servicesMarchand || '',
    produitCommercial: user.produitCommercial || user.produitsVendus || user.typeActivite || '',
    secteurCommercial: user.secteurCommercial || {
      grossiste: false,
      semiGrossiste: false,
      detaillant: false,
    },
    
    // DOCUMENTS & IDENTITÉ
    numCNI: user.numCNI || '',
    numCNPS: user.numCNPS || '',
    numCMU: user.numCMU || '',
    
    // AFFILIATIONS
    membreMarche: user.membreMarche || '',
    membreCooperative: user.membreCooperative || '',
    nomResponsableMarche: user.nomResponsableMarche || '',
    nomResponsableCooperative: user.nomResponsableCooperative || '',
    
    // STATUT
    statutEntrepreneur: user.statutEntrepreneur || '',
    dateArrivee: user.dateArrivee || '',
    recepisse: user.recepisse || 'N0167/PA/SG/D1',
    categorie: user.categorie || '',
    
    // MÉDIAS
    photo: user.photo || null,
    signature: user.signature || null,
  });

  const numeroId = user.numeroMarchand || user.numeroProducteur || `JULABA-2026-${String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')}`;
  const dateAujourdhui = new Date().toLocaleDateString('fr-FR');

  // Gestion photo
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photo: reader.result as string });
        speak?.('Photo modifiée avec succès');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = () => {
    speak?.('Prendre une photo');
    fileInputRef.current?.click();
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
      speak?.('Signature modifiée');
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

  // Sauvegarder les modifications
  const handleSave = () => {
    const updatedUser = {
      ...user,
      ...formData,
      localisation: formData.marche || formData.commune,
      produitsVendus: formData.produitCommercial,
      typeActivite: formData.produitCommercial,
      typeCommerce: formData.secteurCommercial,
    };

    onSave(updatedUser);
    setIsEditing(false);
    speak?.('Fiche d\'identification mise à jour avec succès');
  };

  const handleCancel = () => {
    setFormData({
      nom: user.nom || '',
      prenoms: user.prenoms || '',
      lieuNaissance: user.lieuNaissance || '',
      dateNaissance: user.dateNaissance || '',
      nationalite: user.nationalite || 'Ivoirienne',
      situationMatrimoniale: user.situationMatrimoniale || '',
      nombreEnfants: user.nombreEnfants || '',
      telephone: user.telephone || '',
      telephoneUrgence: user.telephoneUrgence || '',
      email: user.email || '',
      lieuResidence: user.lieuResidence || '',
      commune: user.commune || user.localisation || '',
      marche: user.marche || user.localisation || '',
      emplacement: user.emplacement || '',
      box: user.box || '',
      nombreMagasin: user.nombreMagasin || '',
      nombreTable: user.nombreTable || '',
      servicesMarchand: user.servicesMarchand || '',
      produitCommercial: user.produitCommercial || user.produitsVendus || user.typeActivite || '',
      secteurCommercial: user.secteurCommercial || {
        grossiste: false,
        semiGrossiste: false,
        detaillant: false,
      },
      numCNI: user.numCNI || '',
      numCNPS: user.numCNPS || '',
      numCMU: user.numCMU || '',
      membreMarche: user.membreMarche || '',
      membreCooperative: user.membreCooperative || '',
      nomResponsableMarche: user.nomResponsableMarche || '',
      nomResponsableCooperative: user.nomResponsableCooperative || '',
      statutEntrepreneur: user.statutEntrepreneur || '',
      dateArrivee: user.dateArrivee || '',
      recepisse: user.recepisse || 'N0167/PA/SG/D1',
      categorie: user.categorie || '',
      photo: user.photo || null,
      signature: user.signature || null,
    });
    setIsEditing(false);
    speak?.('Modifications annulées');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end px-4 pb-4 lg:items-center lg:justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl w-full max-h-[90vh] overflow-y-auto lg:max-w-4xl"
      >
        {/* Header Vert avec Logo */}
        <div className="sticky top-0 bg-gradient-to-r from-green-700 to-green-600 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10 border-b-4 border-green-800">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-lg">
              <Wheat className="w-10 h-10 text-green-700" />
            </div>
            <div className="text-white">
              <h1 className="text-2xl font-black" style={{ fontFamily: 'Calisga Bold, sans-serif' }}>
                JULABA
              </h1>
              <p className="text-xs font-bold opacity-90">République de Côte d'Ivoire</p>
              <p className="text-xs font-medium opacity-80">Plateforme Nationale d'Inclusion Économique</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Catégorie Checkbox */}
            {isEditing && (
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                <label className="text-xs font-bold text-white mb-1 block">Catégorie</label>
                <select
                  value={formData.categorie}
                  onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                  className="px-3 py-1 rounded-lg text-sm font-bold text-gray-900 border-2 border-white"
                >
                  <option value="">-- Sélectionner --</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </select>
              </div>
            )}
            {!isEditing && formData.categorie && (
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                <p className="text-xs font-bold text-white">Catégorie</p>
                <p className="text-2xl font-black text-white">{formData.categorie}</p>
              </div>
            )}
            {!isEditing && (
              <motion.button
                onClick={() => {
                  setIsEditing(true);
                  speak?.('Mode édition activé');
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm shadow-md bg-white text-green-700"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Edit3 className="w-4 h-4" />
                Modifier
              </motion.button>
            )}
            <motion.button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center"
              whileHover={{ rotate: 90, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-5 h-5 text-gray-600" />
            </motion.button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Badge N° ID, Date, Agent & Statut */}
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-300">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-bold text-gray-600 mb-1">N° de Fiche</p>
                <p className="text-2xl font-black" style={{ color: PRIMARY_COLOR }}>{numeroId}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-600 mb-1">Date d'enregistrement</p>
                <p className="text-sm font-bold text-gray-900">
                  {user.dateIdentification
                    ? new Date(user.dateIdentification).toLocaleDateString('fr-FR')
                    : dateAujourdhui}
                </p>
              </div>
            </div>
            {/* Agent identificateur */}
            <div className="pt-3 border-t-2 border-orange-200">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="text-xs font-bold text-gray-600 mb-0.5">Agent identificateur</p>
                  <p className="text-sm font-black text-gray-900">
                    {user.prenomAgent || 'Issa'} {user.nomAgent || 'BAMBA'}
                  </p>
                </div>
                {/* Statut validation */}
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-600 mb-0.5">Statut</p>
                  {(() => {
                    const s = user.statutIdentification || 'valide';
                    const cfg = {
                      valide: { cls: 'bg-green-100 text-green-700 border-green-300', label: 'Validé par BO' },
                      soumis: { cls: 'bg-amber-100 text-amber-700 border-amber-300', label: 'En attente BO' },
                      rejete: { cls: 'bg-red-100 text-red-700 border-red-300', label: 'Rejeté par BO' },
                      draft:  { cls: 'bg-gray-100 text-gray-700 border-gray-300', label: 'Brouillon' },
                    }[s] || { cls: 'bg-gray-100 text-gray-600 border-gray-200', label: s };
                    return (
                      <span className={`inline-block px-3 py-1 rounded-xl border-2 text-xs font-black ${cfg.cls}`}>
                        {cfg.label}
                      </span>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* Section Photo */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div
                className="w-36 h-36 rounded-2xl border-4 shadow-xl flex items-center justify-center overflow-hidden relative bg-gradient-to-br from-orange-50 to-orange-100"
                style={{ borderColor: PRIMARY_COLOR }}
              >
                {formData.photo ? (
                  <img src={formData.photo} alt="Photo" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-20 h-20" style={{ color: PRIMARY_COLOR }} />
                )}
                {isEditing && formData.photo && (
                  <motion.button
                    onClick={() => setFormData({ ...formData, photo: null })}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                )}
              </div>
              {isEditing && (
                <motion.button
                  onClick={handleCameraCapture}
                  className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full flex items-center justify-center shadow-xl border-2 border-white"
                  style={{ backgroundColor: PRIMARY_COLOR }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Camera className="w-6 h-6 text-white" />
                </motion.button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>

          {/* IDENTITÉ */}
          <div className="mb-6">
            <SectionHeader icon={User} title="IDENTITÉ" color={PRIMARY_COLOR} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FicheField
                label="Nom"
                value={formData.nom}
                isEditing={isEditing}
                onChange={(val) => setFormData({ ...formData, nom: val })}
              />
              <FicheField
                label="Prénoms"
                value={formData.prenoms}
                isEditing={isEditing}
                onChange={(val) => setFormData({ ...formData, prenoms: val })}
              />
              <FicheField
                label="Lieu de naissance"
                value={formData.lieuNaissance}
                isEditing={isEditing}
                onChange={(val) => setFormData({ ...formData, lieuNaissance: val })}
              />
              <FicheField
                label="Date de naissance"
                value={formData.dateNaissance}
                isEditing={isEditing}
                onChange={(val) => setFormData({ ...formData, dateNaissance: val })}
                type="date"
              />
              <FicheField
                label="Nationalité"
                value={formData.nationalite}
                isEditing={isEditing}
                onChange={(val) => setFormData({ ...formData, nationalite: val })}
              />
              <FicheField
                label="Situation matrimoniale"
                value={formData.situationMatrimoniale}
                isEditing={isEditing}
                onChange={(val) => setFormData({ ...formData, situationMatrimoniale: val })}
                icon={Heart}
                placeholder="Ex: Marié(e), Célibataire, Mère sans mari..."
              />
              <FicheField
                label="Nombre d'enfant(s)"
                value={formData.nombreEnfants}
                isEditing={isEditing}
                onChange={(val) => setFormData({ ...formData, nombreEnfants: val })}
                icon={Baby}
                type="number"
              />
            </div>
          </div>

          {/* CONTACT */}
          <div className="mb-6">
            <SectionHeader icon={Phone} title="CONTACT" color="#2072AF" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FicheField
                label="Téléphone"
                value={formData.telephone}
                isEditing={isEditing}
                onChange={(val) => setFormData({ ...formData, telephone: val })}
                icon={Phone}
                type="tel"
              />
              <FicheField
                label="Téléphone en cas d'urgence"
                value={formData.telephoneUrgence}
                isEditing={isEditing}
                onChange={(val) => setFormData({ ...formData, telephoneUrgence: val })}
                icon={Phone}
                type="tel"
              />
              <FicheField
                label="Email"
                value={formData.email}
                isEditing={isEditing}
                onChange={(val) => setFormData({ ...formData, email: val })}
                icon={Mail}
                type="email"
              />
              <FicheField
                label="Lieu de résidence"
                value={formData.lieuResidence}
                isEditing={isEditing}
                onChange={(val) => setFormData({ ...formData, lieuResidence: val })}
                icon={Home}
              />
            </div>
          </div>

          {/* LIEU D'EXERCICE */}
          <div className="mb-6">
            <SectionHeader icon={MapPin} title="LIEU D'EXERCICE" color="#16A34A" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FicheField
                label="Commune"
                value={formData.commune}
                isEditing={isEditing}
                onChange={(val) => setFormData({ ...formData, commune: val })}
              />
              <FicheField
                label="Marché"
                value={formData.marche}
                isEditing={isEditing}
                onChange={(val) => setFormData({ ...formData, marche: val })}
              />
              <FicheField
                label="Emplacement"
                value={formData.emplacement}
                isEditing={isEditing}
                onChange={(val) => setFormData({ ...formData, emplacement: val })}
              />
              <FicheField
                label="Box"
                value={formData.box}
                isEditing={isEditing}
                onChange={(val) => setFormData({ ...formData, box: val })}
              />
              <FicheField
                label="Nombre de Magasin"
                value={formData.nombreMagasin}
                isEditing={isEditing}
                onChange={(val) => setFormData({ ...formData, nombreMagasin: val })}
                type="number"
              />
              <FicheField
                label="Nombre de table"
                value={formData.nombreTable}
                isEditing={isEditing}
                onChange={(val) => setFormData({ ...formData, nombreTable: val })}
                type="number"
              />
            </div>
          </div>

          {/* ACTIVITÉ COMMERCIALE */}
          <div className="mb-6">
            <SectionHeader icon={ShoppingBag} title="ACTIVITÉ COMMERCIALE" color="#702963" />
            <div className="space-y-4">
              <FicheField
                label="Services Marchand"
                value={formData.servicesMarchand}
                isEditing={isEditing}
                onChange={(val) => setFormData({ ...formData, servicesMarchand: val })}
                placeholder="Ex: Vente en gros, Distribution..."
              />
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Produit commercial</label>
                {isEditing ? (
                  <textarea
                    value={formData.produitCommercial}
                    onChange={(e) => setFormData({ ...formData, produitCommercial: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-[#C46210] focus:outline-none text-gray-900 font-medium"
                    placeholder="Ex: Riz, tomates, oignons, plantain..."
                    rows={2}
                  />
                ) : (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200">
                    <p className="text-sm font-semibold text-gray-900">{formData.produitCommercial || 'N/A'}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Secteur commercial</label>
                {isEditing ? (
                  <div className="flex flex-wrap gap-3">
                    <label className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-xl bg-white border-2 border-gray-200 hover:border-orange-400">
                      <input
                        type="checkbox"
                        checked={formData.secteurCommercial.grossiste}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            secteurCommercial: { ...formData.secteurCommercial, grossiste: e.target.checked },
                          })
                        }
                        className="w-4 h-4 rounded accent-[#C46210]"
                      />
                      <span className="text-sm font-medium text-gray-700">Grossiste</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-xl bg-white border-2 border-gray-200 hover:border-orange-400">
                      <input
                        type="checkbox"
                        checked={formData.secteurCommercial.semiGrossiste}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            secteurCommercial: { ...formData.secteurCommercial, semiGrossiste: e.target.checked },
                          })
                        }
                        className="w-4 h-4 rounded accent-[#C46210]"
                      />
                      <span className="text-sm font-medium text-gray-700">Semi-grossiste</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-xl bg-white border-2 border-gray-200 hover:border-orange-400">
                      <input
                        type="checkbox"
                        checked={formData.secteurCommercial.detaillant}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            secteurCommercial: { ...formData.secteurCommercial, detaillant: e.target.checked },
                          })
                        }
                        className="w-4 h-4 rounded accent-[#C46210]"
                      />
                      <span className="text-sm font-medium text-gray-700">Détaillant</span>
                    </label>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {formData.secteurCommercial?.grossiste && (
                      <span className="px-3 py-1.5 rounded-xl bg-purple-100 text-purple-700 text-xs font-bold border-2 border-purple-300">
                        Grossiste
                      </span>
                    )}
                    {formData.secteurCommercial?.semiGrossiste && (
                      <span className="px-3 py-1.5 rounded-xl bg-purple-100 text-purple-700 text-xs font-bold border-2 border-purple-300">
                        Semi-grossiste
                      </span>
                    )}
                    {formData.secteurCommercial?.detaillant && (
                      <span className="px-3 py-1.5 rounded-xl bg-purple-100 text-purple-700 text-xs font-bold border-2 border-purple-300">
                        Détaillant
                      </span>
                    )}
                    {!formData.secteurCommercial?.grossiste &&
                      !formData.secteurCommercial?.semiGrossiste &&
                      !formData.secteurCommercial?.detaillant && (
                        <span className="px-3 py-1.5 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold border-2 border-gray-300">
                          Non spécifié
                        </span>
                      )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* DOCUMENTS & IDENTITÉ */}
          <div className="mb-6">
            <SectionHeader icon={IdCard} title="DOCUMENTS & IDENTITÉ" color="#DC2626" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FicheField
                label="N° CNI"
                value={formData.numCNI}
                isEditing={isEditing}
                onChange={(val) => setFormData({ ...formData, numCNI: val })}
                icon={IdCard}
              />
              <FicheField
                label="N° CNPS"
                value={formData.numCNPS}
                isEditing={isEditing}
                onChange={(val) => setFormData({ ...formData, numCNPS: val })}
                icon={Shield}
              />
              <FicheField
                label="N° CMU"
                value={formData.numCMU}
                isEditing={isEditing}
                onChange={(val) => setFormData({ ...formData, numCMU: val })}
                icon={Shield}
              />
            </div>
          </div>

          {/* AFFILIATIONS */}
          <div className="mb-6">
            <SectionHeader icon={Users} title="AFFILIATIONS & RESPONSABLES" color="#702963" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FicheField
                label="Membre d'un marché (préciser le nom)"
                value={formData.membreMarche}
                isEditing={isEditing}
                onChange={(val) => setFormData({ ...formData, membreMarche: val })}
                icon={Building2}
              />
              <FicheField
                label="Membre d'une coopérative (nom société)"
                value={formData.membreCooperative}
                isEditing={isEditing}
                onChange={(val) => setFormData({ ...formData, membreCooperative: val })}
                icon={Users}
              />
              <FicheField
                label="Nom responsable du marché"
                value={formData.nomResponsableMarche}
                isEditing={isEditing}
                onChange={(val) => setFormData({ ...formData, nomResponsableMarche: val })}
              />
              <FicheField
                label="Nom responsable coopérative"
                value={formData.nomResponsableCooperative}
                isEditing={isEditing}
                onChange={(val) => setFormData({ ...formData, nomResponsableCooperative: val })}
              />
            </div>
          </div>

          {/* STATUT & DATES */}
          <div className="mb-6">
            <SectionHeader icon={Briefcase} title="STATUT & DATES" color="#2072AF" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FicheField
                label="Statut d'entrepreneur"
                value={formData.statutEntrepreneur}
                isEditing={isEditing}
                onChange={(val) => setFormData({ ...formData, statutEntrepreneur: val })}
                icon={Briefcase}
                placeholder="Ex: Auto-entrepreneur, SARL..."
              />
              <FicheField
                label="Date d'arrivée"
                value={formData.dateArrivee}
                isEditing={isEditing}
                onChange={(val) => setFormData({ ...formData, dateArrivee: val })}
                icon={Calendar}
                type="date"
              />
              <FicheField
                label="Récépissé N°"
                value={formData.recepisse}
                isEditing={isEditing}
                onChange={(val) => setFormData({ ...formData, recepisse: val })}
                icon={FileText}
              />
            </div>
          </div>

          {/* SIGNATURE ET CACHET */}
          <div className="mb-6">
            <SectionHeader icon={FileText} title="SIGNATURE ET CACHET" color="#DC2626" />
            <div className="border-2 border-dashed rounded-2xl p-4 bg-gradient-to-br from-amber-50 to-orange-50" style={{ borderColor: SECONDARY_COLOR }}>
              {isEditing ? (
                <div className="relative">
                  <p className="text-sm font-bold text-gray-700 mb-2">Signez dans le cadre ci-dessous</p>
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
                      className="absolute top-9 right-2 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-lg shadow-md"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Effacer
                    </motion.button>
                  )}
                </div>
              ) : (
                <>
                  {formData.signature ? (
                    <img src={formData.signature} alt="Signature" className="w-full h-32 object-contain" />
                  ) : (
                    <div className="h-32 flex items-center justify-center text-gray-400 text-sm font-semibold">
                      Signature non disponible
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Boutons d'action en mode édition */}
          {isEditing && (
            <div className="flex gap-3 mb-4">
              <motion.button
                onClick={handleSave}
                className="flex-1 py-4 rounded-2xl font-bold text-white shadow-lg flex items-center justify-center gap-2"
                style={{ backgroundColor: '#00563B' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Save className="w-5 h-5" />
                Enregistrer
              </motion.button>

              <motion.button
                onClick={handleCancel}
                className="px-8 py-4 rounded-2xl font-bold border-2 border-gray-300 text-gray-700 shadow-lg flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <X className="w-5 h-5" />
                Annuler
              </motion.button>
            </div>
          )}

          {/* Footer avec Date et Badge */}
          <div className="space-y-4">
            {/* Fait à Abidjan le */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200">
              <p className="text-sm font-bold text-gray-700 text-center">
                Fait à Abidjan le <span className="font-black text-blue-700">{dateAujourdhui}</span>
              </p>
            </div>

            {/* Badge de certification */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-black text-green-900" style={{ fontFamily: 'Calisga Bold, sans-serif' }}>
                  Acteur certifié JULABA
                </p>
                <p className="text-xs font-bold text-green-700">
                  Plateforme Nationale d'Inclusion Économique des Acteurs Vivriers
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ========== SECTION HEADER COMPONENT ==========
interface SectionHeaderProps {
  icon: any;
  title: string;
  color: string;
}

function SectionHeader({ icon: Icon, title, color }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-2 mb-4 pb-2 border-b-2" style={{ borderColor: `${color}30` }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md" style={{ backgroundColor: `${color}20` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <h4 className="text-base font-black" style={{ color }}>
        {title}
      </h4>
    </div>
  );
}

// ========== FICHE FIELD COMPONENT ==========
interface FicheFieldProps {
  label: string;
  value: string;
  icon?: any;
  isEditing?: boolean;
  onChange?: (value: string) => void;
  type?: string;
  placeholder?: string;
}

function FicheField({ label, value, icon: Icon, isEditing = false, onChange, type = 'text', placeholder }: FicheFieldProps) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-700 mb-2">{label}</label>
      {isEditing && onChange ? (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#C46210] focus:outline-none font-semibold text-gray-900"
          placeholder={placeholder || label}
        />
      ) : (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-200 min-h-[48px]">
          {Icon && <Icon className="w-4 h-4 text-gray-500 flex-shrink-0" />}
          <p className="text-sm font-semibold text-gray-900">{value || 'N/A'}</p>
        </div>
      )}
    </div>
  );
}
