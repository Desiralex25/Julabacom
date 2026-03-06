import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
const tantieSagesseAvatar = '/images/tantie-sagesse.png';
const tantiePortrait = '/images/tantie-sagesse.png';

interface TantieSagesseProps {
  isVisible: boolean;
  isSpeaking: boolean;
  onSkip?: () => void;
}

export function TantieSagesse({ isVisible, isSpeaking, onSkip }: TantieSagesseProps) {
  const [shouldShow, setShouldShow] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setShouldShow(true);
    }
  }, [isVisible]);

  useEffect(() => {
    // Disparaît 2 secondes après la fin du TTS
    if (!isSpeaking && shouldShow) {
      const timer = setTimeout(() => {
        setShouldShow(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSpeaking, shouldShow]);

  // Fonction appelée quand on clique sur "Passer"
  const handleSkip = () => {
    setShouldShow(false); // Disparaît immédiatement
    onSkip?.(); // Appelle la fonction du parent pour arrêter le TTS
  };

  return (
    <AnimatePresence>
      {shouldShow && (
        <>
          {/* Overlay flou d'arrière-plan */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[200]"
          />

          {/* Tantie Sagesse */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[210]"
          >
            {/* Cercle lumineux pulsant en arrière-plan */}
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/30 to-orange-500/30 blur-2xl"
              animate={{
                scale: isSpeaking ? [1, 1.3, 1] : 1,
                opacity: isSpeaking ? [0.5, 0.8, 0.5] : 0.3,
              }}
              transition={{
                duration: 1.2,
                repeat: isSpeaking ? Infinity : 0,
                ease: 'easeInOut',
              }}
            />

            {/* Cercle extérieur animé */}
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-purple-400/50"
              animate={{
                scale: isSpeaking ? [1, 1.15, 1] : 1,
                rotate: isSpeaking ? 360 : 0,
              }}
              transition={{
                scale: {
                  duration: 1.5,
                  repeat: isSpeaking ? Infinity : 0,
                  ease: 'easeInOut',
                },
                rotate: {
                  duration: 8,
                  repeat: isSpeaking ? Infinity : 0,
                  ease: 'linear',
                },
              }}
            />

            {/* Image de Tantie Sagesse */}
            <motion.div
              className="relative w-[280px] h-[280px]"
              animate={{
                scale: isSpeaking ? [1, 1.05, 1] : 1,
              }}
              transition={{
                duration: 0.4,
                repeat: isSpeaking ? Infinity : 0,
                ease: 'easeInOut',
              }}
            >
              {/* Gradient overlay pour simulation de parole */}
              <AnimatePresence>
                {isSpeaking && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.3, 0] }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="absolute inset-0 bg-gradient-to-t from-purple-600/40 to-transparent z-10 pointer-events-none"
                  />
                )}
              </AnimatePresence>

              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <motion.img
                  src={tantiePortrait}
                  alt="Tantie Sagesse"
                  className="w-full h-full object-contain"
                  animate={{
                    scale: [1, 1.04, 1],
                  }}
                  transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
            </motion.div>

            {/* Particules flottantes */}
            {isSpeaking && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-gradient-to-br from-purple-400 to-orange-400"
                    style={{
                      left: '50%',
                      top: '50%',
                    }}
                    animate={{
                      x: [0, Math.cos((i * Math.PI * 2) / 6) * 60],
                      y: [0, Math.sin((i * Math.PI * 2) / 6) * 60],
                      opacity: [0, 1, 0],
                      scale: [0, 1.5, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: 'easeOut',
                    }}
                  />
                ))}
              </div>
            )}

            {/* Badge "Tantie Sagesse parle" quand elle parle */}
            <AnimatePresence>
              {isSpeaking && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute top-full mt-4 left-1/2 -translate-x-1/2 bg-green-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg border-2 border-white whitespace-nowrap"
                >
                  <motion.div
                    className="flex items-center justify-center gap-2"
                    animate={{
                      opacity: [1, 0.6, 1],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                    }}
                  >
                    <motion.div
                      className="w-2 h-2 rounded-full bg-white flex-shrink-0"
                      animate={{
                        scale: [1, 1.3, 1],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                      }}
                    />
                    Tantie Sagesse parle
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Bouton "Passer" en bas */}
          <AnimatePresence>
            {isSpeaking && onSkip && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: 0.3 }}
                onClick={handleSkip}
                className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[210] bg-white/90 backdrop-blur-sm text-gray-700 text-sm font-medium px-4 py-2 rounded-full shadow-lg hover:bg-white hover:scale-105 transition-all duration-200 border border-gray-200"
              >
                Passer
              </motion.button>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}