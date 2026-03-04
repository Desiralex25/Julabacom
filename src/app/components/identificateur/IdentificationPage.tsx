import React, { useState, useEffect } from 'react';
import { UserPlus, FileText, Send, Clock, Calendar, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FormulaireNouveauDossier } from './FormulaireNouveauDossier';
import { useNavigate } from 'react-router';
import { useApp } from '../../contexts/AppContext';

const PRIMARY_COLOR = '#9F8170';

// Mock data
const MOCK_BROUILLONS = [
  { id: '1', nom: 'KOUAME Yao', type: 'Marchand', activite: 'Vente fruits', dateModif: '2024-03-01', progression: 75 },
  { id: '2', nom: 'BAMBA Fatou', type: 'Producteur', activite: 'Culture manioc', dateModif: '2024-02-28', progression: 50 },
  { id: '3', nom: 'DIALLO Moussa', type: 'Marchand', activite: 'Vente légumes', dateModif: '2024-02-25', progression: 25 },
];

const MOCK_SOUMISSIONS = [
  { id: '4', nom: 'KOFFI Marie', type: 'Producteur', activite: 'Culture bananes', dateSoumission: '2024-02-20', statut: 'en_cours' },
  { id: '5', nom: 'YAO Pierre', type: 'Marchand', activite: 'Vente poissons', dateSoumission: '2024-02-18', statut: 'en_cours' },
  { id: '6', nom: 'TOURE Ibrahim', type: 'Producteur', activite: 'Culture cacao', dateSoumission: '2024-02-15', statut: 'en_cours' },
];

type Tab = 'nouveau' | 'brouillons' | 'soumissions';

export function IdentificationPage() {
  const navigate = useNavigate();
  const { setIsModalOpen } = useApp();
  const [activeTab, setActiveTab] = useState<Tab>('nouveau');

  // Masquer la bottom bar quand on est sur cette page
  useEffect(() => {
    setIsModalOpen(true);
    return () => {
      setIsModalOpen(false);
    };
  }, [setIsModalOpen]);

  const tabs = [
    { id: 'nouveau' as Tab, label: 'Nouveau Dossier', icon: UserPlus },
    { id: 'brouillons' as Tab, label: 'Brouillons', icon: FileText, count: MOCK_BROUILLONS.length },
    { id: 'soumissions' as Tab, label: 'Soumissions', icon: Send, count: MOCK_SOUMISSIONS.length },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24 lg:pl-[320px]">
      {/* Header */}
      <div className="bg-white border-b p-4 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          {/* Bouton retour */}
          <motion.button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </motion.button>
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Identification</h1>
            <p className="text-sm text-gray-600 mt-1">Gérer les dossiers d'identification</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b px-4">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-3 font-medium text-sm whitespace-nowrap transition-colors ${
                  isActive ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    isActive ? 'bg-[#9F8170] text-white' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {tab.count}
                  </span>
                )}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ backgroundColor: PRIMARY_COLOR }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="p-6"
        >
          {activeTab === 'nouveau' && <FormulaireNouveauDossier />}
          {activeTab === 'brouillons' && <BrouillonsTab brouillons={MOCK_BROUILLONS} />}
          {activeTab === 'soumissions' && <SoumissionsTab soumissions={MOCK_SOUMISSIONS} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Composant Brouillons
function BrouillonsTab({ brouillons }: { brouillons: any[] }) {
  if (brouillons.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Aucun brouillon</p>
        <p className="text-sm text-gray-500 mt-1">Les dossiers incomplets apparaîtront ici</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {brouillons.map((brouillon) => (
        <motion.div
          key={brouillon.id}
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
          whileHover={{ y: -2 }}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-bold text-gray-900">{brouillon.nom}</h3>
              <p className="text-sm text-gray-600 mt-1">
                {brouillon.type === 'Marchand' ? '🏪' : '🌾'} {brouillon.type} • {brouillon.activite}
              </p>
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>Dernière modification : {new Date(brouillon.dateModif).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-blue-50 rounded-lg transition-colors">
                <Edit className="w-4 h-4 text-blue-600" />
              </button>
              <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </div>
          </div>
          
          {/* Barre de progression */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Progression du dossier</span>
              <span className="font-bold text-gray-900">{brouillon.progression}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#9F8170] to-[#7a6558] rounded-full"
                style={{ width: `${brouillon.progression}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">
              {brouillon.progression < 100 ? 'Dossier incomplet - Continuer la saisie' : 'Prêt à soumettre'}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Composant Soumissions
function SoumissionsTab({ soumissions }: { soumissions: any[] }) {
  if (soumissions.length === 0) {
    return (
      <div className="text-center py-12">
        <Send className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Aucune soumission</p>
        <p className="text-sm text-gray-500 mt-1">Les dossiers soumis apparaîtront ici</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {soumissions.map((soumission) => (
        <motion.div
          key={soumission.id}
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
          whileHover={{ y: -2 }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-gray-900">{soumission.nom}</h3>
                <div className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                  Transmis à Administrateur
                </div>
              </div>
              <p className="text-sm text-gray-600">
                {soumission.type === 'Marchand' ? '🏪' : '🌾'} {soumission.type} • {soumission.activite}
              </p>
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                <span>Soumis le : {new Date(soumission.dateSoumission).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-orange-50 rounded-xl border border-orange-200">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-600" />
              <p className="text-xs text-orange-700 font-medium">
                Transmis à Administrateur
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}