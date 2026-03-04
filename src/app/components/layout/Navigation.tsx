import React from 'react';
import { BottomBar } from './BottomBar';
import { Sidebar } from './Sidebar';
import { useApp } from '../../contexts/AppContext';
import { AnimatePresence, motion } from 'motion/react';

interface NavigationProps {
  role: 'marchand' | 'producteur' | 'cooperative' | 'institution' | 'identificateur';
  onMicClick?: () => void;
}

export function Navigation({ role, onMicClick }: NavigationProps) {
  const { isModalOpen } = useApp();
  
  if (!role) {
    console.error('Navigation component requires a valid role prop');
    return null;
  }

  return (
    <>
      {/* Sidebar for desktop (lg and above) */}
      <Sidebar role={role} onMicClick={onMicClick} />
      
      {/* BottomBar for mobile — disparaît totalement quand un modal est ouvert */}
      <AnimatePresence>
        {!isModalOpen && (
          <motion.div
            className="lg:hidden"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <BottomBar role={role} onMicClick={onMicClick} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}