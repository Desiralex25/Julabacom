import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, Check } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';

const PAYMENT_METHODS = [
  { id: 'orange', name: 'Orange Money', color: '#FF6600' },
  { id: 'mtn', name: 'MTN Mobile Money', color: '#FFCC00' },
  { id: 'moov', name: 'Moov Money', color: '#009CDE' },
  { id: 'wave', name: 'Wave', color: '#00D9A5' },
  { id: 'cash', name: 'Cash', color: '#4B5563' },
];

export function VendreForm() {
  const navigate = useNavigate();
  const { user, addTransaction, addMarketplaceItem, speak } = useApp();
  
  const [formData, setFormData] = useState({
    productName: '',
    quantity: '',
    price: '',
    paymentMethod: 'cash',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.productName || !formData.quantity || !formData.price) {
      speak('Remplis tous les champs s\'il te plaît');
      return;
    }

    // Add transaction
    addTransaction({
      userId: user!.id,
      type: 'vente',
      productName: formData.productName,
      quantity: Number(formData.quantity),
      price: Number(formData.price),
      paymentMethod: formData.paymentMethod,
    });

    const total = Number(formData.quantity) * Number(formData.price);
    speak(`Vente de ${formData.quantity} ${formData.productName} à ${total} francs CFA enregistrée`);

    navigate('/marchand');
  };

  const handleVoiceCommand = (command: string) => {
    // Simple voice command parsing (can be enhanced with NLP)
    const lowerCommand = command.toLowerCase();
    
    // Example: "j'ai vendu 5 sacs de riz à 25000"
    const venteMatch = lowerCommand.match(/vendu?\s+(\d+)\s+(.+?)\s+à\s+(\d+)/);
    
    if (venteMatch) {
      setFormData({
        ...formData,
        quantity: venteMatch[1],
        productName: venteMatch[2],
        price: venteMatch[3],
      });
      speak('Informations enregistrées. Choisis le mode de paiement');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white pb-24 pt-6 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/marchand')}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-900" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Enregistrer une vente</h1>
            <p className="text-xs sm:text-sm text-gray-600">Parle ou remplis le formulaire</p>
          </div>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6 rounded-2xl mb-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="product">Produit</Label>
                <Input
                  id="product"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  placeholder="Ex: Sac de riz"
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantité</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="0"
                    className="h-12 rounded-xl"
                    inputMode="numeric"
                  />
                </div>

                <div>
                  <Label htmlFor="price">Prix unitaire (FCFA)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0"
                    className="h-12 rounded-xl"
                    inputMode="numeric"
                  />
                </div>
              </div>

              {/* Total */}
              {formData.quantity && formData.price && (
                <div className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(196, 98, 16, 0.06)' }}>
                  <p className="text-sm text-gray-600 mb-1">Total</p>
                  <p className="text-2xl font-bold" style={{ color: '#C46210' }}>
                    {(Number(formData.quantity) * Number(formData.price)).toLocaleString()} FCFA
                  </p>
                </div>
              )}

              {/* Payment Methods */}
              <div>
                <Label className="mb-3 block">Mode de paiement</Label>
                <div className="grid grid-cols-2 gap-3">
                  {PAYMENT_METHODS.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, paymentMethod: method.id })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.paymentMethod === method.id
                          ? 'border-[#C46210]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={formData.paymentMethod === method.id ? { backgroundColor: 'rgba(196, 98, 16, 0.06)' } : {}}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-gray-900">{method.name}</span>
                        {formData.paymentMethod === method.id && (
                          <Check className="w-4 h-4" style={{ color: '#C46210' }} />
                        )}
                      </div>
                      <div className="w-8 h-1 rounded-full" style={{ backgroundColor: method.color }} />
                    </button>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-14 rounded-2xl text-lg font-semibold"
                style={{ backgroundColor: '#C46210' }}
              >
                Enregistrer la vente
              </Button>
            </form>
          </Card>

          {/* Voice Hint */}
          <div className="text-center">
            <p className="text-sm text-gray-500">💡 Tu peux aussi dire:</p>
            <p className="text-sm font-medium" style={{ color: '#C46210' }}>
              "Tantie j'ai vendu 5 sacs de riz à 25000"
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
