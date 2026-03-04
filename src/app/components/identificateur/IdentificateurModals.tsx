import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserCheck, DollarSign, Award, FileText, UserPlus, Sprout, X, Calendar, TrendingUp } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useNavigate } from 'react-router';
import { useIdentificateur } from '../../contexts/IdentificateurContext';

const IDENTIFICATEUR_COLOR = '#9F8170';

// ✨ ==== COMPOSANTS DE BASE ==== ✨

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

function BaseModal({ isOpen, onClose, children }: BaseModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop avec blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Contenu du modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="w-full max-w-md pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {children}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

interface StyledButtonProps {
  onClick: () => void;
  variant?: 'primary' | 'outline' | 'danger' | 'success';
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

function StyledButton({ onClick, variant = 'primary', disabled, children, className = '', fullWidth }: StyledButtonProps) {
  const baseStyle = 'px-6 py-3.5 rounded-2xl font-semibold text-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantStyles = {
    primary: 'text-white shadow-lg hover:shadow-xl',
    outline: 'bg-white border text-gray-700 hover:bg-gray-50',
    danger: 'bg-red-600 text-white shadow-lg hover:bg-red-700 hover:shadow-xl',
    success: 'text-white shadow-lg hover:shadow-xl',
  };

  let bgColor = IDENTIFICATEUR_COLOR;
  if (variant === 'danger') bgColor = '#DC2626';
  if (variant === 'success') bgColor = '#16A34A';

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variantStyles[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      style={variant === 'primary' || variant === 'success' ? { backgroundColor: bgColor } : variant === 'outline' ? { borderWidth: '2px', borderColor: '#E5E7EB' } : undefined}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
    >
      {children}
    </motion.button>
  );
}

// ✨ ==== MODALS IDENTIFICATEUR ==== ✨

// Modal Identifications (KPI1)
interface IdentificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  count: number;
}

export function IdentificationsModal({ isOpen, onClose, count }: IdentificationsModalProps) {
  const navigate = useNavigate();
  const { getRecentIdentifications } = useIdentificateur();
  const recentIdentifications = getRecentIdentifications(5);

  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div 
          className="px-6 py-5 text-white relative overflow-hidden"
          style={{ backgroundColor: IDENTIFICATEUR_COLOR }}
        >
          <motion.div
            className="absolute inset-0 opacity-20"
            animate={{ 
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{ 
              duration: 20,
              repeat: Infinity,
              repeatType: 'reverse'
            }}
            style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '30px 30px'
            }}
          />
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black">Identifications</h2>
                <p className="text-sm opacity-90">Acteurs identifiés</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Nombre total */}
          <div 
            className="mb-6 p-6 rounded-2xl text-center"
            style={{ backgroundColor: `${IDENTIFICATEUR_COLOR}10` }}
          >
            <p className="text-sm font-semibold text-gray-600 mb-2">Total identifications</p>
            <p className="text-5xl font-black mb-1" style={{ color: IDENTIFICATEUR_COLOR }}>
              {count}
            </p>
            <p className="text-sm font-medium text-gray-500">acteurs identifiés</p>
          </div>

          {/* Liste récente */}
          {recentIdentifications.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-700 mb-3">Identifications récentes</h3>
              <div className="space-y-2">
                {recentIdentifications.map((identification) => (
                  <div 
                    key={identification.id}
                    className="p-3 rounded-xl bg-gray-50 border border-gray-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{identification.nom}</p>
                        <p className="text-xs text-gray-500">{identification.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium" style={{ color: IDENTIFICATEUR_COLOR }}>
                          {identification.statut}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bouton action */}
          <StyledButton 
            onClick={() => {
              onClose();
              navigate('/identificateur/suivi');
            }}
            variant="primary"
            fullWidth
          >
            Voir toutes les identifications
          </StyledButton>
        </div>
      </div>
    </BaseModal>
  );
}

// Modal Commissions (KPI2)
interface CommissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  montant: number;
}

export function CommissionsModal({ isOpen, onClose, montant }: CommissionsModalProps) {
  const navigate = useNavigate();

  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div 
          className="px-6 py-5 text-white relative overflow-hidden"
          style={{ backgroundColor: '#F59E0B' }}
        >
          <motion.div
            className="absolute inset-0 opacity-20"
            animate={{ 
              rotate: [0, 360],
            }}
            transition={{ 
              duration: 30,
              repeat: Infinity,
              ease: 'linear'
            }}
            style={{
              backgroundImage: 'radial-gradient(circle, white 2px, transparent 2px)',
              backgroundSize: '40px 40px'
            }}
          />
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black">Commissions</h2>
                <p className="text-sm opacity-90">Gains cumulés</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Montant total */}
          <div className="mb-6 p-6 rounded-2xl text-center bg-gradient-to-br from-amber-50 to-orange-50">
            <p className="text-sm font-semibold text-gray-600 mb-2">Total des commissions</p>
            <p className="text-5xl font-black text-amber-600 mb-1">
              {montant.toLocaleString()}
            </p>
            <p className="text-sm font-medium text-gray-500">Francs CFA</p>
          </div>

          {/* Info commission */}
          <div className="mb-6 p-4 rounded-xl bg-blue-50 border-2 border-blue-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-blue-900 mb-1">Commission par identification</p>
                <p className="text-sm text-blue-700">Tu gagnes une commission pour chaque acteur identifié et validé sur JULABA.</p>
              </div>
            </div>
          </div>

          {/* Boutons actions */}
          <div className="space-y-3">
            <StyledButton 
              onClick={() => {
                onClose();
                navigate('/identificateur/suivi');
              }}
              variant="primary"
              fullWidth
            >
              Voir détails des commissions
            </StyledButton>
          </div>
        </div>
      </div>
    </BaseModal>
  );
}

// Modal Score
interface ScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ScoreModal({ isOpen, onClose }: ScoreModalProps) {
  const { user } = useApp();

  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div 
          className="px-6 py-5 text-white relative overflow-hidden"
          style={{ backgroundColor: IDENTIFICATEUR_COLOR }}
        >
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black">Score JULABA</h2>
                <p className="text-sm opacity-90">Ton niveau</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <p className="text-6xl font-black mb-2" style={{ color: IDENTIFICATEUR_COLOR }}>
              {user?.scoreJulaba || 850}
            </p>
            <p className="text-sm font-medium text-gray-500">points JULABA</p>
          </div>

          <div className="space-y-3 mb-6">
            <div className="p-4 rounded-xl bg-green-50 border-2 border-green-200">
              <p className="font-bold text-green-900 mb-1">✨ Continue comme ça !</p>
              <p className="text-sm text-green-700">Chaque identification validée augmente ton score.</p>
            </div>
          </div>

          <StyledButton onClick={onClose} variant="primary" fullWidth>
            Compris
          </StyledButton>
        </div>
      </div>
    </BaseModal>
  );
}

// Modal Résumé
interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: {
    identifications: number;
    commissions: number;
  };
}

export function ResumeModal({ isOpen, onClose, stats }: ResumeModalProps) {
  const navigate = useNavigate();

  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div 
          className="px-6 py-5 text-white relative overflow-hidden"
          style={{ backgroundColor: IDENTIFICATEUR_COLOR }}
        >
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black">Résumé</h2>
                <p className="text-sm opacity-90">Vue d'ensemble</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-gray-50 border-2 border-gray-200">
              <UserCheck className="w-8 h-8 mb-2" style={{ color: IDENTIFICATEUR_COLOR }} />
              <p className="text-2xl font-black text-gray-900 mb-1">{stats.identifications}</p>
              <p className="text-xs font-medium text-gray-600">Identifications</p>
            </div>
            <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-200">
              <DollarSign className="w-8 h-8 text-amber-600 mb-2" />
              <p className="text-2xl font-black text-amber-600 mb-1">{stats.commissions.toLocaleString()}</p>
              <p className="text-xs font-medium text-amber-700">Commissions</p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <StyledButton 
              onClick={() => {
                onClose();
                navigate('/identificateur/suivi');
              }}
              variant="primary"
              fullWidth
            >
              Voir le rapport complet
            </StyledButton>
            <StyledButton onClick={onClose} variant="outline" fullWidth>
              Fermer
            </StyledButton>
          </div>
        </div>
      </div>
    </BaseModal>
  );
}

// Modal Nouveau Marchand (Action1)
interface NouveauMarchandModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NouveauMarchandModal({ isOpen, onClose }: NouveauMarchandModalProps) {
  const navigate = useNavigate();
  const { speak } = useApp();

  const handleStart = () => {
    speak('Commençons l\'identification d\'un nouveau marchand');
    onClose();
    navigate('/identificateur/identification');
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div 
          className="px-6 py-5 text-white relative overflow-hidden"
          style={{ backgroundColor: '#C66A2C' }}
        >
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black">Nouveau Marchand</h2>
                <p className="text-sm opacity-90">Identification</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-orange-100 flex items-center justify-center">
              <UserPlus className="w-10 h-10 text-orange-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Identifier un nouveau marchand</h3>
            <p className="text-sm text-gray-600">
              Collecte les informations du marchand pour l'enregistrer sur JULABA
            </p>
          </div>

          <div className="space-y-3 mb-6">
            <div className="p-4 rounded-xl bg-blue-50 border-2 border-blue-200">
              <p className="font-bold text-blue-900 mb-1">📋 Informations requises</p>
              <ul className="text-sm text-blue-700 space-y-1 ml-4">
                <li>• Identité complète</li>
                <li>• Contact téléphonique</li>
                <li>• Localisation du marché</li>
                <li>• Type de produits vendus</li>
              </ul>
            </div>
          </div>

          <div className="space-y-3">
            <StyledButton onClick={handleStart} variant="primary" fullWidth>
              Commencer l'identification
            </StyledButton>
            <StyledButton onClick={onClose} variant="outline" fullWidth>
              Annuler
            </StyledButton>
          </div>
        </div>
      </div>
    </BaseModal>
  );
}

// Modal Nouveau Producteur (Action2)
interface NouveauProducteurModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NouveauProducteurModal({ isOpen, onClose }: NouveauProducteurModalProps) {
  const navigate = useNavigate();
  const { speak } = useApp();

  const handleStart = () => {
    speak('Commençons l\'identification d\'un nouveau producteur');
    onClose();
    navigate('/identificateur/identification');
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div 
          className="px-6 py-5 text-white relative overflow-hidden"
          style={{ backgroundColor: '#2E8B57' }}
        >
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black">Nouveau Producteur</h2>
                <p className="text-sm opacity-90">Identification</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <Sprout className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Identifier un nouveau producteur</h3>
            <p className="text-sm text-gray-600">
              Collecte les informations du producteur pour l'enregistrer sur JULABA
            </p>
          </div>

          <div className="space-y-3 mb-6">
            <div className="p-4 rounded-xl bg-blue-50 border-2 border-blue-200">
              <p className="font-bold text-blue-900 mb-1">📋 Informations requises</p>
              <ul className="text-sm text-blue-700 space-y-1 ml-4">
                <li>• Identité complète</li>
                <li>• Contact téléphonique</li>
                <li>• Localisation des parcelles</li>
                <li>• Types de cultures</li>
              </ul>
            </div>
          </div>

          <div className="space-y-3">
            <StyledButton onClick={handleStart} variant="primary" fullWidth>
              Commencer l'identification
            </StyledButton>
            <StyledButton onClick={onClose} variant="outline" fullWidth>
              Annuler
            </StyledButton>
          </div>
        </div>
      </div>
    </BaseModal>
  );
}
