/**
 * ═══════════════════════════════════════════════════════════════════
 * JÙLABA — ProfileSwitcher (MODE DEV UNIQUEMENT)
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Composant de développement permettant l'accès rapide à tous les profils
 * utilisateurs et au Back-Office sans authentification.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { useApp } from '../../contexts/AppContext';
import { useUser } from '../../contexts/UserContext';
import { Users, X, Code, Crown, Globe, MapPin, BarChart3, ChevronRight, Store, Leaf, UsersRound, Building2, Scan } from 'lucide-react';
import { useBackOffice, MOCK_BO_USERS, BORoleType } from '../../contexts/BackOfficeContext';
import { DEV_MOCK_USERS } from '../../data/mockUsers';

const BO_PRIMARY = '#E6A817';
const BO_DARK = '#3B3C36';

const BO_ROLES: { role: BORoleType; label: string; desc: string; icon: any; color: string }[] = [
  { role: 'super_admin', label: 'Super Admin', desc: 'Accès total', icon: Crown, color: '#E6A817' },
  { role: 'admin_national', label: 'Admin National', desc: 'Gestion nationale', icon: Globe, color: '#3B82F6' },
  { role: 'gestionnaire_zone', label: 'Gestionnaire Zone', desc: 'Zone Abidjan', icon: MapPin, color: '#10B981' },
  { role: 'analyste', label: 'Analyste', desc: 'Lecture seule', icon: BarChart3, color: '#8B5CF6' },
];

const PROFILE_COLORS: Record<string, { color: string; icon: any }> = {
  'marchand': { color: '#10B981', icon: Store },
  'producteur': { color: '#F59E0B', icon: Leaf },
  'cooperative': { color: '#8B5CF6', icon: UsersRound },
  'institution': { color: '#3B82F6', icon: Building2 },
  'identificateur': { color: '#EC4899', icon: Scan },
};

export function ProfileSwitcher() {
  const navigate = useNavigate();
  const { setUser: setAppUser } = useApp();
  const { setUser: setUserProfile } = useUser();
  const { setBOUser } = useBackOffice();
  const [isOpen, setIsOpen] = useState(false);
  const [showBO, setShowBO] = useState(false);
  const [boLoading, setBoLoading] = useState<BORoleType | null>(null);
  const [profileLoading, setProfileLoading] = useState<string | null>(null);

  const handleBOAccess = async (role: BORoleType) => {
    setBoLoading(role);
    await new Promise(r => setTimeout(r, 350));
    const user = MOCK_BO_USERS.find(u => u.role === role);
    if (user) {
      setBOUser(user);
      setIsOpen(false);
      setShowBO(false);
      navigate('/backoffice/dashboard');
    }
    setBoLoading(null);
  };

  const handleProfileSwitch = async (userId: string) => {
    setProfileLoading(userId);
    await new Promise(r => setTimeout(r, 350));
    const user = DEV_MOCK_USERS.find(u => u.id === userId);
    if (user) {
      console.log('[ProfileSwitcher] Switching to user:', user);
      setAppUser(user);
      setUserProfile(user);
      console.log('[ProfileSwitcher] User set successfully');
      setIsOpen(false);
      setShowBO(false);
      
      // Navigation selon le profil
      const routes: Record<string, string> = {
        'marchand': '/marchand',
        'producteur': '/producteur',
        'cooperative': '/cooperative',
        'institution': '/institution',
        'identificateur': '/identificateur',
      };
      console.log('[ProfileSwitcher] Navigating to:', routes[user.role]);
      navigate(routes[user.role] || '/');
    }
    setProfileLoading(null);
  };

  const isDevEnvironment =
    window.location.hostname === 'localhost' ||
    window.location.hostname.includes('127.0.0.1') ||
    window.location.hostname.includes('figma.site') ||
    window.location.hostname.includes('makeproxy');

  if (!isDevEnvironment) return null;

  return (
    <>
      {/* Bouton flottant Dev */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-4 z-[9999] w-12 h-12 rounded-full bg-purple-600 shadow-2xl flex items-center justify-center border-2 border-white"
        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}
      >
        <Code className="w-6 h-6 text-white" />
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => { setIsOpen(false); setShowBO(false); }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-6 text-white relative">
                <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30">
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <Code className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Mode Développeur</h2>
                    <p className="text-sm text-white/80">Accès rapide profils</p>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setShowBO(false)}
                  className={`flex-1 py-3 text-sm font-semibold transition-colors ${!showBO ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'}`}
                >
                  Acteurs Jùlaba
                </button>
                <button
                  onClick={() => setShowBO(true)}
                  className={`flex-1 py-3 text-sm font-semibold transition-colors ${showBO ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'}`}
                  style={{ color: showBO ? BO_PRIMARY : undefined, borderColor: showBO ? BO_PRIMARY : undefined }}
                >
                  Back-Office
                </button>
              </div>

              {/* Content */}
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {!showBO ? (
                  // Acteurs Jùlaba - ACTIVÉ
                  <div className="space-y-3">
                    {DEV_MOCK_USERS.map((user) => {
                      const { color, icon: Icon } = PROFILE_COLORS[user.role] || { color: '#6B7280', icon: Users };
                      return (
                        <motion.button
                          key={user.id}
                          onClick={() => handleProfileSwitch(user.id)}
                          disabled={profileLoading !== null}
                          className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all hover:shadow-lg disabled:opacity-50"
                          style={{
                            borderColor: profileLoading === user.id ? color : '#E5E7EB',
                            backgroundColor: profileLoading === user.id ? `${color}15` : 'white'
                          }}
                          whileHover={{ scale: profileLoading === null ? 1.02 : 1 }}
                          whileTap={{ scale: profileLoading === null ? 0.98 : 1 }}
                        >
                          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
                            <Icon className="w-5 h-5" style={{ color }} />
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-semibold text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-xs text-gray-500 capitalize">
                              {user.role === 'marchand' && 'Commerçant'}
                              {user.role === 'producteur' && 'Producteur'}
                              {user.role === 'cooperative' && 'Coopérative'}
                              {user.role === 'institution' && 'Institution'}
                              {user.role === 'identificateur' && 'Identificateur'}
                              {' • '}
                              {user.region}
                            </div>
                          </div>
                          {profileLoading === user.id ? (
                            <div className="w-5 h-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                ) : (
                  // Back-Office - ACTIF
                  <div className="space-y-3">
                    {BO_ROLES.map(({ role, label, desc, icon: Icon, color }) => (
                      <motion.button
                        key={role}
                        onClick={() => handleBOAccess(role)}
                        disabled={boLoading !== null}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all hover:shadow-lg disabled:opacity-50"
                        style={{
                          borderColor: boLoading === role ? color : '#E5E7EB',
                          backgroundColor: boLoading === role ? `${color}15` : 'white'
                        }}
                        whileHover={{ scale: boLoading === null ? 1.02 : 1 }}
                        whileTap={{ scale: boLoading === null ? 0.98 : 1 }}
                      >
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
                          <Icon className="w-5 h-5" style={{ color }} />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-semibold text-gray-900">{label}</div>
                          <div className="text-xs text-gray-500">{desc}</div>
                        </div>
                        {boLoading === role ? (
                          <div className="w-5 h-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        )}
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
