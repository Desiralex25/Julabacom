import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { useApp } from '../../contexts/AppContext';
import { useUser } from '../../contexts/UserContext';
import { Wifi, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar } from './Sidebar';
import { BottomBar } from './BottomBar';
import { ProfileSwitcher } from '../dev/ProfileSwitcher';
import { ScrollToTop } from './ScrollToTop';

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isOnline } = useApp();
  const { user } = useUser();

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

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
      {import.meta.env.DEV && <ProfileSwitcher />}
    </div>
  );
}