import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
const bgMarket = '/images/bg-market.png';
const bgMarketplace = '/images/bg-marketplace.png';
const bgTantie = '/images/bg-tantie.png';
const bgOffline = '/images/bg-offline.png';
const logoJulaba = '/images/logo-julaba.png';
const bgCotisations = '/images/bg-cotisations.png';
const logoSplash = '/images/logo-julaba-splash.png';
const bgVirtualMarket = '/images/bg-virtual-market.png';

// ONBOARDING V3 - ANIMATIONS DYNAMIQUES 2025
export function Onboarding() {
  const navigate = useNavigate();
  const [currentScreen, setCurrentScreen] = useState(-1); // -1 = splash screen

  // Contenus des 4 écrans
  const screens = [
    {
      title: "BIENVENUE SUR",
      description: "Jùlaba t'aide à bien gérer ton argent",
      background: bgMarket,
    },
    {
      title: "ACHETEZ ET VENDEZ",
      description: "Tu vends, tu vois ce que tu gagnes.",
      background: bgVirtualMarket,
    },
    {
      title: "VOTRE ASSISTANTE VOCALE",
      description: "Tantie Sagesse t'accompagne partout.",
      background: bgTantie,
    },
    {
      title: "COTISATIONS SOCIALES",
      description: "Gère tes cotisations CNPS et CMU ici.",
      background: bgCotisations,
    },
  ];

  const currentContent = screens[currentScreen];

  const handleNext = () => {
    // Arrêter la synthèse vocale si elle est en cours
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    
    if (currentScreen < 3) {
      setCurrentScreen(currentScreen + 1);
    } else {
      navigate('/welcome');
    }
  };

  const handleSkip = () => {
    // Arrêter la synthèse vocale si elle est en cours
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    
    navigate('/welcome');
  };

  const handleListen = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      const text = `${currentContent.title}. ${currentContent.description}`;
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      window.speechSynthesis.speak(utterance);
    } else {
      alert('La synthèse vocale n\'est pas disponible sur cet appareil.');
    }
  };

  // Variants d'animation pour les différents éléments
  const backgroundVariants = {
    initial: { scale: 1.1, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        duration: 0.6,
        ease: "easeOut"
      }
    },
    exit: { 
      scale: 0.95, 
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  const cardVariants = {
    initial: { x: 300, opacity: 0, scale: 0.95 },
    animate: { 
      x: 0, 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    exit: { 
      x: -300, 
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
    }
  };

  const titleVariants = {
    initial: { y: -30, opacity: 0 },
    animate: { 
      y: [0, -5, 0],
      opacity: 1,
      transition: { 
        y: {
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut"
        },
        opacity: {
          duration: 0.6,
          delay: 0.5,
          ease: "easeOut"
        }
      }
    }
  };

  const logoVariants = {
    initial: { scale: 0, rotate: -180, opacity: 0 },
    animate: { 
      scale: [1, 1.05, 1], 
      rotate: [0, 2, -2, 0], 
      opacity: 1,
      y: [0, -8, 0],
      transition: { 
        scale: {
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        },
        rotate: {
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        },
        y: {
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut"
        },
        opacity: {
          duration: 0.8,
          delay: 0.7
        }
      }
    }
  };

  const descriptionVariants = {
    initial: { y: 20, opacity: 0 },
    animate: { 
      y: [0, 3, 0],
      opacity: [1, 0.9, 1],
      transition: { 
        y: {
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        },
        opacity: {
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }
    }
  };

  const buttonVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: { 
      scale: [1, 1.02, 1],
      y: [0, -3, 0],
      opacity: 1,
      transition: { 
        scale: {
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut"
        },
        y: {
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut"
        },
        opacity: {
          duration: 0.5,
          delay: 1.1
        }
      }
    },
    hover: { 
      scale: 1.08,
      y: -5,
      boxShadow: "0 20px 40px rgba(196, 98, 16, 0.4)",
      transition: { duration: 0.3 }
    },
    tap: { 
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  };

  const listenButtonVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: { 
      scale: [1, 1.03, 1], 
      opacity: 1,
      boxShadow: [
        "0 10px 30px rgba(196, 98, 16, 0.3)",
        "0 15px 35px rgba(196, 98, 16, 0.4)",
        "0 10px 30px rgba(196, 98, 16, 0.3)"
      ],
      transition: { 
        scale: {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        },
        boxShadow: {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        },
        opacity: {
          duration: 0.5,
          delay: 1.1
        }
      }
    },
    hover: { 
      scale: 1.12,
      rotate: [0, -3, 3, -3, 0],
      boxShadow: "0 20px 40px rgba(196, 98, 16, 0.5)",
      transition: { 
        scale: { duration: 0.3 },
        rotate: { duration: 0.5 }
      }
    },
    tap: { 
      scale: 0.9,
      transition: { duration: 0.1 }
    }
  };

  const iconVariants = {
    animate: {
      scale: [1, 1.3, 1],
      rotate: [0, 10, -10, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const dotVariants = {
    inactive: { scale: 1, opacity: 0.5 },
    active: { 
      scale: 1.2, 
      opacity: 1,
      transition: { 
        duration: 0.3,
        type: "spring",
        bounce: 0.5
      }
    }
  };

  // Splash screen variants
  const splashLogoVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { 
        duration: 1.5,
        ease: "easeOut"
      }
    }
  };

  const splashButtonVariants = {
    initial: { y: 50, opacity: 0 },
    animate: { 
      y: 0,
      opacity: 1,
      transition: { 
        duration: 0.8,
        delay: 0.5,
        ease: "easeOut"
      }
    },
    hover: { 
      scale: 1.05,
      boxShadow: "0 15px 30px rgba(0, 0, 0, 0.3)",
      transition: { duration: 0.3 }
    },
    tap: { 
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  };

  // Si on est sur le splash screen
  if (currentScreen === -1) {
    return (
      <motion.div 
        className="fixed inset-0 bg-[#C46210] flex flex-col items-center justify-between overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo centré */}
        <div className="flex-1 flex items-center justify-center px-6">
          <motion.img 
            src={logoSplash} 
            alt="JULABA Logo" 
            className="max-w-xs w-full"
            variants={splashLogoVariants}
            initial="initial"
            animate="animate"
          />
        </div>

        {/* Bouton Commencer en bas */}
        <div className="pb-12 px-6 w-full">
          <motion.button
            onClick={() => setCurrentScreen(0)}
            className="w-full max-w-[200px] mx-auto block bg-white text-[#C46210] font-bold py-3.5 px-8 rounded-full shadow-2xl"
            variants={splashButtonVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            whileTap="tap"
          >
            Commencer
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Image de fond plein écran avec animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${currentContent.background})` }}
          variants={backgroundVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        />
      </AnimatePresence>

      {/* Overlay noir animé */}
      <motion.div 
        className="absolute inset-0 bg-black/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      />

      {/* Bouton "Passer" animé */}
      <motion.button
        onClick={handleSkip}
        className="absolute top-6 right-6 text-white text-sm font-medium z-20 px-3 py-1.5"
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        whileHover={{ 
          scale: 1.1,
          color: "#ffffff",
          transition: { duration: 0.2 }
        }}
        whileTap={{ scale: 0.95 }}
      >
        Passer
      </motion.button>

      {/* Contenu principal - Carte blanche centrée */}
      <div className="relative z-10 h-full flex items-end justify-center px-6 pb-40">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen}
            className="bg-white/90 backdrop-blur-md rounded-3xl p-8 max-w-md w-full shadow-2xl border-2 border-[#C46210]/70"
            variants={cardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {/* Titre animé */}
            <motion.h2 
              className="text-center text-gray-700 text-xl font-bold mb-4"
              variants={titleVariants}
              initial="initial"
              animate="animate"
            >
              {currentContent.title}
            </motion.h2>

            {/* Logo JULABA animé avec rotation et bounce */}
            <motion.div 
              className="mb-6"
              variants={logoVariants}
              initial="initial"
              animate="animate"
            >
              <motion.img 
                src={logoJulaba} 
                alt="Jùlaba - Ton djè est bien géré" 
                className="w-40 mx-auto"
                whileHover={{ 
                  scale: 1.1,
                  rotate: [0, -5, 5, -5, 0],
                  transition: { duration: 0.5 }
                }}
              />
            </motion.div>

            {/* Description animée */}
            <motion.p 
              className="text-gray-600 text-center leading-relaxed mb-6 font-bold text-[24px]"
              variants={descriptionVariants}
              initial="initial"
              animate="animate"
              onAnimationStart={() => {
                if ('speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                  const utterance = new SpeechSynthesisUtterance(currentContent.description);
                  utterance.lang = 'fr-FR';
                  utterance.rate = 0.9;
                  utterance.pitch = 1;
                  window.speechSynthesis.speak(utterance);
                }
              }}
            >
              {currentContent.description}
            </motion.p>

            {/* Bouton Écouter animé avec pulse sur l'icône */}
            <motion.button
              onClick={handleListen}
              className="max-w-xs mx-auto block bg-[#C46210] text-white font-semibold py-3.5 px-8 rounded-full flex items-center justify-center gap-2 shadow-lg"
              variants={listenButtonVariants}
              initial="initial"
              animate="animate"
              whileHover="hover"
              whileTap="tap"
            >
              <motion.div variants={iconVariants} animate="animate">
                <Volume2 className="w-5 h-5" />
              </motion.div>
              Écouter
            </motion.button>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer fixe en bas */}
      <div className="absolute bottom-0 left-0 right-0 z-10 px-6 pb-8 space-y-4">
        {/* Indicateurs de pagination animés */}
        <div className="flex justify-center gap-2">
          {[0, 1, 2, 3].map((index) => (
            <motion.div
              key={index}
              className={currentScreen === index ? "rounded-full bg-white" : "rounded-full bg-white/50"}
              variants={dotVariants}
              initial="inactive"
              animate={currentScreen === index ? "active" : "inactive"}
              style={{
                width: currentScreen === index ? "32px" : "8px",
                height: "8px"
              }}
              whileHover={{ scale: 1.3 }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>

        {/* Bouton Suivant animé */}
        <div className="flex justify-center">
          <motion.button
            onClick={handleNext}
            className="max-w-xs bg-white text-[#C46210] font-semibold py-4 px-12 rounded-full shadow-lg"
            variants={buttonVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            whileTap="tap"
          >
            Suivant &gt;
          </motion.button>
        </div>
      </div>
    </div>
  );
}