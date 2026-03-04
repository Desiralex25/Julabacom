import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { useApp, getMockUserByPhone, getAllMockUsers } from '../../contexts/AppContext';
import { useUser } from '../../contexts/UserContext';
import { Users, X, Code, ShieldCheck, Crown, Globe, MapPin, BarChart3, ChevronRight } from 'lucide-react';
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

  const mockUsers = getAllMockUsers();

  const handleProfileSwitch = (userPhone: string) => {
    const user = getMockUserByPhone(userPhone);
    if (user) {
      setAppUser(user);
      setUserProfile(user);
      setIsOpen(false);
      setTimeout(() => { navigate(`/${user.role}`); }, 300);
    }
  };

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
      {/* Bouton flottant Dev — en bas à droite pour ne pas gêner les headers */}
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
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Code className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Dev Mode</h2>
                    <p className="text-sm text-gray-600">Changer de profil</p>
                  </div>
                </div>
                <motion.button onClick={() => { setIsOpen(false); setShowBO(false); }}
                  className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center"
                  whileHover={{ scale: 1.1, backgroundColor: '#FEE2E2' }} whileTap={{ scale: 0.9 }}>
                  <X className="w-5 h-5 text-gray-600" />
                </motion.button>
              </div>

              {/* Profils app */}
              <div className="space-y-3">
                {mockUsers.map((user) => {
                  const roleColors: Record<string, { bg: string; border: string; text: string }> = {
                    marchand: { bg: '#FEF3C7', border: '#F59E0B', text: '#92400E' },
                    producteur: { bg: '#D1FAE5', border: '#10B981', text: '#065F46' },
                    cooperative: { bg: '#DBEAFE', border: '#3B82F6', text: '#1E3A8A' },
                    institution: { bg: '#F3E8FF', border: '#A855F7', text: '#6B21A8' },
                    identificateur: { bg: '#FED7AA', border: '#F97316', text: '#9A3412' },
                  };
                  const colors = roleColors[user.role] || roleColors.marchand;
                  return (
                    <motion.button key={user.id} onClick={() => handleProfileSwitch(user.phone)}
                      className="w-full p-4 rounded-2xl border-2 flex items-center justify-between text-left"
                      style={{ backgroundColor: colors.bg, borderColor: colors.border }}
                      whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg"
                          style={{ backgroundColor: colors.border, color: 'white' }}>
                          {user.firstName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{user.firstName} {user.lastName}</p>
                          <p className="text-sm font-semibold capitalize" style={{ color: colors.text }}>{user.role}</p>
                          <p className="text-xs text-gray-600">{user.phone}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">{user.commune}</p>
                        <p className="text-xs font-bold" style={{ color: colors.text }}>Score: {user.score}</p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* ── Séparateur + Accès Back-Office ── */}
              <div className="mt-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Administration</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                <AnimatePresence mode="wait">
                  {!showBO ? (
                    <motion.button
                      key="btn-bo"
                      initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                      onClick={() => setShowBO(true)}
                      className="w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-left"
                      style={{ backgroundColor: `${BO_DARK}08`, borderColor: `${BO_DARK}30`, borderStyle: 'dashed' }}
                      whileHover={{ borderColor: BO_PRIMARY, backgroundColor: `${BO_PRIMARY}10`, scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}>
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: BO_PRIMARY }}>
                        <ShieldCheck className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">Back-Office Central</p>
                        <p className="text-xs text-gray-500">Accès admin sans connexion</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </motion.button>
                  ) : (
                    <motion.div
                      key="panel-bo"
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className="rounded-2xl border-2 overflow-hidden"
                      style={{ backgroundColor: BO_DARK, borderColor: `${BO_PRIMARY}40` }}>
                      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                          <p className="text-xs font-bold text-white">Back-Office — Choisir le rôle</p>
                        </div>
                        <motion.button onClick={() => setShowBO(false)} className="text-white/40 hover:text-white/80" whileTap={{ scale: 0.9 }}>
                          <X className="w-4 h-4" />
                        </motion.button>
                      </div>
                      <div className="p-3 space-y-2">
                        {BO_ROLES.map(({ role, label, desc, icon: Icon, color }) => {
                          const isLoading = boLoading === role;
                          return (
                            <motion.button key={role} onClick={() => handleBOAccess(role)} disabled={boLoading !== null}
                              className="w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all"
                              style={{ borderColor: `${color}35`, backgroundColor: `${color}12` }}
                              whileHover={{ borderColor: color, scale: 1.01 }}
                              whileTap={{ scale: 0.97 }}>
                              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: `${color}25` }}>
                                {isLoading
                                  ? <motion.div className="w-4 h-4 border-2 border-t-transparent rounded-full"
                                      style={{ borderColor: `${color}50`, borderTopColor: color }}
                                      animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} />
                                  : <Icon className="w-4 h-4" style={{ color }} />
                                }
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm truncate" style={{ color }}>{label}</p>
                                <p className="text-[10px] text-white/40">{desc}</p>
                              </div>
                              <ShieldCheck className="w-4 h-4 flex-shrink-0" style={{ color: `${color}50` }} />
                            </motion.button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-center text-gray-600">
                  Mode développeur - Visible uniquement en localhost
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}