import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, User, Phone, MapPin, ShoppingBag, Edit, History, Calendar, Lock } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';
import { useApp } from '../../contexts/AppContext';
import { useNotifications } from '../../contexts/NotificationsContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

const PRIMARY_COLOR = '#9F8170';
const SECONDARY_COLOR = '#DAC8AE';

export function FicheMarchand() {
  const navigate = useNavigate();
  const location = useLocation();
  const { speak, user } = useApp();
  const { triggerInfo } = useNotifications();
  const merchant = location.state?.merchant;

  const [isEditing, setIsEditing] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [securityCode, setSecurityCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [editData, setEditData] = useState({
    firstName: merchant?.firstName || '',
    lastName: merchant?.lastName || '',
    commune: merchant?.commune || '',
    products: merchant?.activity || '',
  });

  if (!merchant) {
    navigate('/identificateur');
    return null;
  }

  // Historique mock
  const modifications = [
    {
      id: '1',
      date: '2026-02-27T10:30:00',
      type: 'creation',
      description: 'Marchand créé',
    },
    {
      id: '2',
      date: '2026-02-26T14:20:00',
      type: 'modification',
      description: 'Commune mise à jour : Yopougon → Abobo',
    },
    {
      id: '3',
      date: '2026-02-25T09:15:00',
      type: 'modification',
      description: 'Produits mis à jour',
    },
  ];

  const handleEditClick = () => {
    speak?.('Entre ton code de sécurité pour modifier les informations');
    setShowCodeModal(true);
  };

  const handleCodeSubmit = () => {
    setCodeError('');

    if (securityCode.length !== 4) {
      setCodeError('Le code doit contenir 4 chiffres');
      speak?.('Le code doit contenir 4 chiffres');
      return;
    }

    // Mock validation (on accepte n'importe quel code à 4 chiffres)
    speak?.('Code validé. Tu peux maintenant modifier les informations');
    setShowCodeModal(false);
    setIsEditing(true);
    setSecurityCode('');
  };

  const handleSave = () => {
    speak?.('Informations mises à jour avec succès. Le marchand a reçu une notification');
    setIsEditing(false);
    
    // Notification vers l'utilisateur connecté (identificateur) via le nouveau système
    if (user?.id) {
      triggerInfo(
        user.id,
        'identificateur',
        'Profil mis à jour',
        `Le profil de ${editData.firstName} ${editData.lastName} a été mis à jour avec succès.`
      );
    }
  };

  return (
    <div className="pb-32 lg:pb-8 pt-24 lg:pt-16 px-4 lg:pl-[320px] max-w-2xl mx-auto min-h-screen">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Fiche marchand</h1>
        </div>
      </div>

      {/* Carte principale */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-3xl shadow-xl mb-6 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${PRIMARY_COLOR}, ${SECONDARY_COLOR})` }}
      >
        <div className="p-8 text-center">
          {/* Avatar */}
          <div
            className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
          >
            <User className="w-12 h-12 text-white" />
          </div>

          {/* Nom */}
          <h2 className="text-2xl font-bold text-white mb-1">
            {merchant.firstName} {merchant.lastName}
          </h2>
          <p className="text-white/80 mb-2">Marchand</p>
          
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
            <span className="text-white text-sm">
              Créé le {new Date(merchant.createdAt).toLocaleDateString('fr-FR')}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Informations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-md p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Informations</h3>
          {!isEditing && (
            <button
              onClick={handleEditClick}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium"
              style={{ backgroundColor: `${PRIMARY_COLOR}20`, color: PRIMARY_COLOR }}
            >
              <Edit className="w-4 h-4" />
              Modifier
            </button>
          )}
        </div>

        <div className="space-y-4">
          {/* Téléphone (non modifiable) */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <Phone className="w-5 h-5 text-gray-400" />
            <div className="flex-1">
              <p className="text-xs text-gray-500">Téléphone</p>
              <p className="font-medium text-gray-900">{merchant.phone}</p>
            </div>
          </div>

          {/* Nom et Prénom (modifiable) */}
          {isEditing ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Prénom</label>
                <Input
                  type="text"
                  value={editData.firstName}
                  onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                  className="h-12 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Nom</label>
                <Input
                  type="text"
                  value={editData.lastName}
                  onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                  className="h-12 rounded-xl"
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <User className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">Nom complet</p>
                <p className="font-medium text-gray-900">
                  {editData.firstName} {editData.lastName}
                </p>
              </div>
            </div>
          )}

          {/* Commune (modifiable) */}
          {isEditing ? (
            <div>
              <label className="block text-xs text-gray-500 mb-1">Commune</label>
              <Input
                type="text"
                value={editData.commune}
                onChange={(e) => setEditData({ ...editData, commune: e.target.value })}
                className="h-12 rounded-xl"
              />
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">Commune</p>
                <p className="font-medium text-gray-900">{editData.commune}</p>
              </div>
            </div>
          )}

          {/* Produits (modifiable) */}
          {isEditing ? (
            <div>
              <label className="block text-xs text-gray-500 mb-1">Produits vendus</label>
              <Input
                type="text"
                value={editData.products}
                onChange={(e) => setEditData({ ...editData, products: e.target.value })}
                className="h-12 rounded-xl mb-2"
                placeholder="Riz, tomates, oignons..."
              />
              <p className="text-xs text-gray-500">Sépare les produits par des virgules</p>
              
              {/* Aperçu en temps réel */}
              {editData.products.trim() && (
                <div className="mt-3 p-3 bg-gray-50 rounded-xl">
                  <div className="flex flex-wrap gap-2">
                    {editData.products
                      .split(',')
                      .map(p => p.trim())
                      .filter(p => p.length > 0)
                      .map((product, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: PRIMARY_COLOR }}
                        >
                          {product}
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingBag className="w-5 h-5 text-gray-400" />
                <p className="text-xs text-gray-500">Produits vendus</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {editData.products
                  .split(',')
                  .map(p => p.trim())
                  .filter(p => p.length > 0)
                  .map((product, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full text-sm font-medium text-white"
                      style={{ backgroundColor: PRIMARY_COLOR }}
                    >
                      {product}
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Boutons d'édition */}
        {isEditing && (
          <div className="flex gap-3 mt-6">
            <Button
              onClick={() => {
                setIsEditing(false);
                setEditData({
                  firstName: merchant.firstName,
                  lastName: merchant.lastName,
                  commune: merchant.commune,
                  products: merchant.activity,
                });
              }}
              variant="outline"
              className="flex-1 h-12 rounded-xl"
            >
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 h-12 rounded-xl"
              style={{ backgroundColor: PRIMARY_COLOR }}
            >
              Enregistrer
            </Button>
          </div>
        )}
      </motion.div>

      {/* Historique des modifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-md p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <History className="w-5 h-5" style={{ color: PRIMARY_COLOR }} />
          <h3 className="font-semibold text-gray-900">Historique</h3>
        </div>

        <div className="space-y-3">
          {modifications.map((mod) => (
            <div key={mod.id} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${PRIMARY_COLOR}20` }}
              >
                <Calendar className="w-5 h-5" style={{ color: PRIMARY_COLOR }} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 text-sm">{mod.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(mod.date).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}{' '}
                  à{' '}
                  {new Date(mod.date).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Modal code de sécurité */}
      {showCodeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-sm w-full"
          >
            <div
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: `${PRIMARY_COLOR}20` }}
            >
              <Lock className="w-8 h-8" style={{ color: PRIMARY_COLOR }} />
            </div>

            <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
              Code de sécurité
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Entre ton code à 4 chiffres pour modifier
            </p>

            <Input
              type="password"
              value={securityCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                setSecurityCode(value);
                setCodeError('');
              }}
              placeholder="••••"
              className="text-lg h-14 rounded-2xl text-center tracking-widest mb-2"
              inputMode="numeric"
              maxLength={4}
              autoFocus
            />

            {codeError && (
              <p className="text-red-500 text-sm text-center mb-4">{codeError}</p>
            )}

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => {
                  setShowCodeModal(false);
                  setSecurityCode('');
                  setCodeError('');
                }}
                variant="outline"
                className="flex-1 h-12 rounded-xl"
              >
                Annuler
              </Button>
              <Button
                onClick={handleCodeSubmit}
                className="flex-1 h-12 rounded-xl"
                style={{ backgroundColor: PRIMARY_COLOR }}
              >
                Valider
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}