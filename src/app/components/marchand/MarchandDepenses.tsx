import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Plus, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Navigation } from '../layout/Navigation';

const CATEGORIES_DEPENSES = [
  'Transport',
  'Nourriture',
  'Loyer',
  'Électricité',
  'Eau',
  'Téléphone',
  'Santé',
  'Éducation',
  'Autre',
];

export function MarchandDepenses() {
  const navigate = useNavigate();
  const { speak, addTransaction } = useApp();

  const [description, setDescription] = useState('');
  const [montant, setMontant] = useState('');
  const [categorie, setCategorie] = useState('');
  const [notes, setNotes] = useState('');

  const handleAddDepense = () => {
    if (!description || !montant || !categorie) {
      speak('Remplis tous les champs pour enregistrer ta dépense');
      return;
    }

    const montantNumber = parseFloat(montant);
    if (isNaN(montantNumber) || montantNumber <= 0) {
      speak('Entre un montant valide');
      return;
    }

    addTransaction({
      userId: '',
      type: 'depense',
      productName: description,
      quantity: 1,
      price: montantNumber,
      category: categorie,
    });

    speak(`Dépense de ${montantNumber.toLocaleString()} francs CFA enregistrée dans ${categorie}`);

    // Reset le formulaire
    setDescription('');
    setMontant('');
    setCategorie('');
    setNotes('');
  };

  const handleReset = () => {
    setDescription('');
    setMontant('');
    setCategorie('');
    setNotes('');
    speak('Formulaire réinitialisé');
  };

  return (
    <div className="pb-32 pt-6 px-4 max-w-2xl mx-auto min-h-screen bg-gradient-to-b from-red-50 to-white">
      {/* Header avec bouton retour */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <motion.button
            onClick={() => navigate('/marchand')}
            whileHover={{ scale: 1.1, x: -3 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-full bg-white shadow-md"
            style={{ color: '#DC2626' }}
          >
            <ArrowLeft className="w-6 h-6" />
          </motion.button>
          <h1 className="text-3xl font-bold text-gray-900">Noter une dépense</h1>
        </div>
      </motion.div>

      {/* Formulaire */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-6 rounded-3xl shadow-lg bg-white mb-4">
          {/* Description */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-5"
          >
            <Label className="text-base font-semibold mb-2 block text-gray-700">
              Description de la dépense
            </Label>
            <Input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Achat de carburant"
              className="h-14 text-lg rounded-xl border-2"
              style={{ borderColor: '#DC2626' }}
            />
          </motion.div>

          {/* Montant */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-5"
          >
            <Label className="text-base font-semibold mb-2 block text-gray-700">
              Montant (FCFA)
            </Label>
            <Input
              type="number"
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
              placeholder="0"
              className="h-16 text-3xl font-bold text-center rounded-xl border-2"
              style={{ 
                borderColor: '#DC2626',
                color: '#DC2626'
              }}
            />
          </motion.div>

          {/* Catégories */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            className="mb-5"
          >
            <Label className="text-base font-semibold mb-2 block text-gray-700">
              Catégorie
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES_DEPENSES.map((cat, index) => (
                <motion.button
                  key={cat}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.03 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setCategorie(cat);
                    speak(`Catégorie ${cat} sélectionnée`);
                  }}
                  className="py-3 px-4 rounded-xl font-semibold text-sm transition-all border-2"
                  style={{
                    backgroundColor: categorie === cat ? '#DC2626' : 'white',
                    color: categorie === cat ? 'white' : '#DC2626',
                    borderColor: '#DC2626',
                  }}
                >
                  {cat}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Notes (optionnel) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-5"
          >
            <Label className="text-base font-semibold mb-2 block text-gray-700">
              Notes (optionnel)
            </Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ajoute une note..."
              className="rounded-xl min-h-[80px] resize-none"
            />
          </motion.div>
        </Card>
      </motion.div>

      {/* Boutons d'action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="flex gap-3"
      >
        {/* Bouton Reset */}
        {(description || montant || categorie || notes) && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-shrink-0"
          >
            <Button
              onClick={handleReset}
              variant="outline"
              className="h-16 px-6 rounded-2xl border-2"
              style={{ borderColor: '#DC2626', color: '#DC2626' }}
            >
              <XCircle className="w-5 h-5 mr-2" />
              Réinitialiser
            </Button>
          </motion.div>
        )}

        {/* Bouton Enregistrer */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1"
        >
          <Button
            onClick={handleAddDepense}
            disabled={!description || !montant || !categorie}
            className="w-full h-16 rounded-2xl text-xl font-bold text-white shadow-xl relative overflow-hidden disabled:opacity-50"
            style={{
              backgroundColor: description && montant && categorie ? '#DC2626' : '#9CA3AF',
            }}
          >
            <motion.div
              className="absolute inset-0 bg-white opacity-20"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.2, 0, 0.2],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <Plus className="w-6 h-6 mr-2" />
            Enregistrer la dépense
          </Button>
        </motion.div>
      </motion.div>

      <Navigation role="marchand" />
    </div>
  );
}