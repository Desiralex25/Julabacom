import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Phone, User, MapPin, ShoppingBag, Lock, CheckCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';
import { useUser } from '../../contexts/UserContext';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

const PRIMARY_COLOR = '#9F8170';
const SECONDARY_COLOR = '#DAC8AE';

type Step = 1 | 2 | 3 | 4 | 5;

export function NouveauMarchand() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const { speak } = useApp();

  const [step, setStep] = useState<Step>(1);
  const [formData, setFormData] = useState({
    phone: (location.state?.phone as string) || '',
    firstName: '',
    lastName: '',
    commune: '',
    products: '',
    securityCode: '',
  });
  const [error, setError] = useState('');

  if (!user) return null;

  const steps = [
    { num: 1, icon: Phone, label: 'Téléphone', field: 'phone' },
    { num: 2, icon: User, label: 'Identité', field: 'name' },
    { num: 3, icon: MapPin, label: 'Commune', field: 'commune' },
    { num: 4, icon: ShoppingBag, label: 'Produits', field: 'products' },
    { num: 5, icon: Lock, label: 'Validation', field: 'code' },
  ];

  const handleNext = () => {
    setError('');

    if (step === 1) {
      if (formData.phone.length !== 10) {
        setError('Le numéro doit contenir 10 chiffres');
        speak?.('Le numéro doit contenir 10 chiffres');
        return;
      }
      speak?.('Maintenant, entre le nom et le prénom du marchand');
    } else if (step === 2) {
      if (!formData.firstName || !formData.lastName) {
        setError('Remplis le nom et le prénom');
        speak?.('Remplis le nom et le prénom');
        return;
      }
      speak?.('Quelle est sa commune ?');
    } else if (step === 3) {
      if (!formData.commune) {
        setError('Indique la commune');
        speak?.('Indique la commune');
        return;
      }
      speak?.('Quels produits vend-il ?');
    } else if (step === 4) {
      if (!formData.products) {
        setError('Indique les produits vendus');
        speak?.('Indique les produits vendus');
        return;
      }
      speak?.('Entre ton code de sécurité pour valider');
    }

    setStep((prev) => (prev + 1) as Step);
  };

  const handleSubmit = () => {
    setError('');

    if (formData.securityCode.length !== 4) {
      setError('Le code de sécurité doit contenir 4 chiffres');
      speak?.('Le code de sécurité doit contenir 4 chiffres');
      return;
    }

    // Ici on validerait le code de sécurité
    // Pour le mock, on accepte tout code à 4 chiffres

    speak?.(`${formData.firstName} ${formData.lastName} a été créé avec succès. Le marchand recevra une notification.`);
    
    setTimeout(() => {
      navigate('/identificateur');
    }, 2000);
  };

  const handleBack = () => {
    if (step === 1) {
      navigate(-1);
    } else {
      setStep((prev) => (prev - 1) as Step);
    }
  };

  return (
    <div className="pb-32 lg:pb-8 pt-24 lg:pt-16 px-4 lg:pl-[320px] max-w-2xl mx-auto min-h-screen">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={handleBack}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nouveau marchand</h1>
          <p className="text-sm text-gray-600">Étape {step} sur 5</p>
        </div>
      </div>

      {/* Barre de progression */}
      <motion.div className="bg-gray-100 rounded-full h-2 mb-8 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: PRIMARY_COLOR }}
          initial={{ width: '20%' }}
          animate={{ width: `${(step / 5) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>

      {/* Indicateurs d'étapes */}
      <div className="flex justify-between mb-8 overflow-x-auto pb-2">
        {steps.map((s) => {
          const Icon = s.icon;
          const isActive = step === s.num;
          const isDone = step > s.num;
          
          return (
            <div
              key={s.num}
              className="flex flex-col items-center gap-2 min-w-[60px]"
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center transition-all"
                style={{
                  backgroundColor: isDone ? PRIMARY_COLOR : isActive ? `${PRIMARY_COLOR}30` : '#E5E7EB',
                  border: isActive ? `2px solid ${PRIMARY_COLOR}` : 'none',
                }}
              >
                {isDone ? (
                  <CheckCircle className="w-6 h-6 text-white" />
                ) : (
                  <Icon
                    className="w-5 h-5"
                    style={{ color: isActive ? PRIMARY_COLOR : '#9CA3AF' }}
                  />
                )}
              </div>
              <span
                className="text-xs font-medium text-center"
                style={{ color: isActive || isDone ? PRIMARY_COLOR : '#9CA3AF' }}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Formulaire */}
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="bg-white rounded-3xl shadow-lg p-6 mb-6"
      >
        {/* Étape 1 : Téléphone */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Numéro de téléphone</h2>
            <p className="text-gray-600 mb-6">Entre le numéro du marchand à identifier</p>
            
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                setFormData({ ...formData, phone: value });
                setError('');
              }}
              placeholder="0701020304"
              className="text-lg h-14 rounded-2xl mb-2"
              inputMode="numeric"
              autoFocus
            />
            <p className="text-xs text-gray-500">10 chiffres requis</p>
          </div>
        )}

        {/* Étape 2 : Nom et Prénom */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Identité du marchand</h2>
            <p className="text-gray-600 mb-6">Entre son nom et son prénom</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                <Input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => {
                    setFormData({ ...formData, firstName: e.target.value });
                    setError('');
                  }}
                  placeholder="Aminata"
                  className="text-lg h-14 rounded-2xl"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                <Input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => {
                    setFormData({ ...formData, lastName: e.target.value });
                    setError('');
                  }}
                  placeholder="Kouassi"
                  className="text-lg h-14 rounded-2xl"
                />
              </div>
            </div>
          </div>
        )}

        {/* Étape 3 : Commune */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Commune</h2>
            <p className="text-gray-600 mb-6">Dans quelle commune se trouve le marchand ?</p>
            
            <Input
              type="text"
              value={formData.commune}
              onChange={(e) => {
                setFormData({ ...formData, commune: e.target.value });
                setError('');
              }}
              placeholder="Yopougon"
              className="text-lg h-14 rounded-2xl"
              autoFocus
            />
          </div>
        )}

        {/* Étape 4 : Produits */}
        {step === 4 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Produits vendus</h2>
            <p className="text-gray-600 mb-6">Quels produits vend ce marchand ?</p>
            
            <Input
              type="text"
              value={formData.products}
              onChange={(e) => {
                setFormData({ ...formData, products: e.target.value });
                setError('');
              }}
              placeholder="Riz, tomates, oignons..."
              className="text-lg h-14 rounded-2xl mb-2"
              autoFocus
            />
            <p className="text-xs text-gray-500">Sépare les produits par des virgules</p>
            
            {/* Aperçu des produits saisis */}
            {formData.products.trim() && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-gray-50 rounded-2xl"
              >
                <p className="text-xs font-medium text-gray-700 mb-2">Aperçu des produits :</p>
                <div className="flex flex-wrap gap-2">
                  {formData.products
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
              </motion.div>
            )}
          </div>
        )}

        {/* Étape 5 : Code de sécurité */}
        {step === 5 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Validation</h2>
            <p className="text-gray-600 mb-6">Entre ton code de sécurité pour confirmer</p>
            
            <Input
              type="password"
              value={formData.securityCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                setFormData({ ...formData, securityCode: value });
                setError('');
              }}
              placeholder="••••"
              className="text-lg h-14 rounded-2xl text-center tracking-widest mb-2"
              inputMode="numeric"
              maxLength={4}
              autoFocus
            />
            <p className="text-xs text-gray-500">Ton code de sécurité à 4 chiffres</p>

            {/* Récapitulatif */}
            <div className="mt-6 p-4 bg-gray-50 rounded-2xl space-y-2">
              <p className="text-sm font-medium text-gray-700">Récapitulatif :</p>
              <p className="text-sm text-gray-600">📱 {formData.phone}</p>
              <p className="text-sm text-gray-600">👤 {formData.firstName} {formData.lastName}</p>
              <p className="text-sm text-gray-600">📍 {formData.commune}</p>
              <p className="text-sm text-gray-600">🛒 {formData.products}</p>
            </div>
          </div>
        )}

        {/* Erreur */}
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-500 text-sm mt-4"
          >
            {error}
          </motion.p>
        )}
      </motion.div>

      {/* Boutons */}
      <div className="flex gap-3">
        {step < 5 ? (
          <Button
            onClick={handleNext}
            className="flex-1 h-14 rounded-2xl font-semibold"
            style={{ backgroundColor: PRIMARY_COLOR }}
          >
            Continuer
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            className="flex-1 h-14 rounded-2xl font-semibold"
            style={{ backgroundColor: PRIMARY_COLOR }}
          >
            Créer le marchand
          </Button>
        )}
      </div>
    </div>
  );
}