/**
 * ═══════════════════════════════════════════════════════════════════
 * JÙLABA — ProfileSwitcher (MODE DEV UNIQUEMENT)
 * ═══════════════════════════════════════════════════════════════════
 * 
 * IMPORTANT : Ce composant est DÉSACTIVÉ en attente de Supabase.
 * Les mock users ont été supprimés pour la migration production.
 * 
 * TODO: Réactiver avec liste d'utilisateurs depuis Supabase
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { useApp } from '../../contexts/AppContext';
import { useUser } from '../../contexts/UserContext';
import { Users, X, Code, ShieldCheck, Crown, Globe, MapPin, BarChart3, ChevronRight, AlertCircle } from 'lucide-react';
import { useBackOffice, MOCK_BO_USERS, BORoleType } from '../../contexts/BackOfficeContext';

const BO_PRIMARY = '#E6A817';
const BO_DARK = '#3B3C36';

const BO_ROLES: { role: BORoleType; label: string; desc: string; icon: any; color: string }[] = [
  { role: 'super_admin', label: 'Super Admin', desc: 'Accès total', icon: Crown, color: '#E6A817' },
  { role: 'admin_national', label: 'Admin National', desc: 'Gestion nationale', icon: Globe, color: '#3B82F6' },
  { role: 'gestionnaire_zone', label: 'Gestionnaire Zone', desc: 'Zone Abidjan', icon: MapPin, color: '#10B981' },
  { role: 'analyste', label: 'Analyste', desc: 'Lecture seule', icon: BarChart3, color: '#8B5CF6' },
];

export function ProfileSwitcher() {
  const navigate = useNavigate();
  const { setUser: setAppUser } = useApp();
  const { setUser: setUserProfile } = useUser();
  const { setBOUser } = useBackOffice();
  const [isOpen, setIsOpen] = useState(false);
  const [showBO, setShowBO] = useState(false);
  const [boLoading, setBoLoading] = useState<BORoleType | null>(null);

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
                  // Acteurs Jùlaba - DÉSACTIVÉ
                  <div className="text-center py-8 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto">
                      <AlertCircle className="w-8 h-8 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Profils désactivés
                      </h3>
                      <p className="text-sm text-gray-600 max-w-xs mx-auto">
                        Les utilisateurs mock ont été supprimés pour la migration Supabase.
                        Configure Supabase pour activer le changement de profil.
                      </p>
                    </div>
                  </div>
                ) : (
                  // Back-Office - ACTIF (utilise toujours MOCK_BO_USERS)
                  <div className="space-y-3">
                    <p className="text-xs text-gray-500 mb-4 bg-yellow-50 p-3 rounded-2xl border border-yellow-200">
                      ⚠️ Back-Office utilise encore des mock users. À migrer vers Supabase.
                    </p>
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
