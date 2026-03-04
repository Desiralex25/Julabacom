import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, Check } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';

const EXPENSE_CATEGORIES = [
  { id: 'transport', name: 'Transport', icon: '🚗' },
  { id: 'achat', name: 'Achat marchandise', icon: '📦' },
  { id: 'location', name: 'Location', icon: '🏪' },
  { id: 'main-oeuvre', name: 'Main d\'œuvre', icon: '👷' },
  { id: 'autre', name: 'Autre', icon: '💼' },
];

export function DepenseForm() {
  const navigate = useNavigate();
  const { user, addTransaction, speak } = useApp();
  
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'transport',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description || !formData.amount) {
      speak('Remplis tous les champs s\'il te plaît');
      return;
    }

    // Add transaction as expense
    addTransaction({
      userId: user!.id,
      type: 'depense',
      productName: formData.description,
      quantity: 1,
      price: Number(formData.amount),
      category: formData.category,
    });

    speak(`Dépense de ${formData.amount} francs CFA enregistrée`);
    navigate('/marchand');
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
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Ajouter une dépense</h1>
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
              {/* Category Selection */}
              <div>
                <Label className="mb-3 block">Catégorie</Label>
                <div className="grid grid-cols-2 gap-3">
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat.id })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.category === cat.id
                          ? 'border-[#C46210]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={formData.category === cat.id ? { backgroundColor: 'rgba(196, 98, 16, 0.06)' } : {}}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{cat.icon}</span>
                        {formData.category === cat.id && (
                          <Check className="w-4 h-4" style={{ color: '#C46210' }} />
                        )}
                      </div>
                      <span className="text-sm font-semibold text-gray-900 block text-left">
                        {cat.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ex: Essence pour livraison"
                  className="h-12 rounded-xl"
                />
              </div>

              <div>
                <Label htmlFor="amount">Montant (FCFA)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0"
                  className="h-12 rounded-xl"
                  inputMode="numeric"
                />
              </div>

              {/* Total Preview */}
              {formData.amount && (
                <div className="p-4 rounded-xl bg-red-50">
                  <p className="text-sm text-gray-600 mb-1">Dépense</p>
                  <p className="text-2xl font-bold text-red-600">
                    -{Number(formData.amount).toLocaleString()} FCFA
                  </p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-14 rounded-2xl text-lg font-semibold"
                style={{ backgroundColor: '#C46210' }}
              >
                Enregistrer la dépense
              </Button>
            </form>
          </Card>

          {/* Voice Hint */}
          <div className="text-center">
            <p className="text-sm text-gray-500">💡 Tu peux aussi dire:</p>
            <p className="text-sm font-medium" style={{ color: '#C46210' }}>
              "Tantie j'ai payé 10000 pour transport"
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
