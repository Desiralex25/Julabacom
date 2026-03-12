import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { ProfileSwitcher } from '../dev/ProfileSwitcher';
import { IS_DEV } from '../../utils/env';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar } from './Sidebar';
import { BottomBar } from './BottomBar';
import { ScrollToTop } from './ScrollToTop';
import { useApp } from '../../contexts/AppContext';
import { useUser } from '../../contexts/UserContext';

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isOnline, loading } = useApp();
  const { user } = useUser();

  useEffect(() => {
    // Ne rediriger QUE si le chargement est terminé ET qu'il n'y a pas d'user
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  // Pendant le chargement initial : afficher un écran d'attente
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#C46210]" />
          <p className="text-gray-500 text-sm font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Masquer la BottomBar sur les pages Academy (plein écran immersif)
  const hideBottomBar = location.pathname.includes('/academy');

  return (
    <div className="min-h-screen bg-gray-50">
      <ScrollToTop />
      {/* Sidebar Desktop Unifié */}
      <Sidebar role={user.role} />

      {/* Offline Badge */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="bg-orange-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
              <WifiOff className="w-4 h-4" />
              <span className="text-sm font-semibold">Mode hors ligne</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="min-h-screen">
        <Outlet />
      </main>

      {/* Bottom Navigation Mobile — masquée sur Academy */}
      {!hideBottomBar && <BottomBar role={user.role} />}

      {/* Dev Profile Switcher - Only in development */}
      {IS_DEV && <ProfileSwitcher />}
    </div>
  );
}