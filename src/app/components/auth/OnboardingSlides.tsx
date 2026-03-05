/**
 * ═══════════════════════════════════════════════════════════════════
 * JÙLABA — Onboarding (4 écrans de présentation)
 * Icônes adaptées + animations par icône + transitions directionnelles
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wallet,
  Store,
  Mic,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { Button } from '../ui/button';

interface OnboardingSlidesProps {
  onComplete?: () => void;
}

const slides = [
  {
    id: 'bienvenue',
    icon: Wallet,
    title: 'BIENVENUE',
    description: "Jùlaba t'aide à bien gérer ton argent",
    gradient: 'from-orange-500 to-amber-600',
    bgFrom: '#fff7ed',
    bgTo: '#ffedd5',
    accent: '#C46210',
    iconAnimation: 'float',
  },
  {
    id: 'commerce',
    icon: Store,
    title: 'ACHETEZ ET VENDEZ',
    description: 'Tu vends, tu vois ce que tu gagnes.',
    gradient: 'from-green-500 to-emerald-600',
    bgFrom: '#f0fdf4',
    bgTo: '#dcfce7',
    accent: '#16a34a',
    iconAnimation: 'bounce',
  },
  {
    id: 'assistante',
    icon: Mic,
    title: 'VOTRE ASSISTANTE VOCALE',
    description: "Tantie Sagesse t'accompagne partout.",
    gradient: 'from-purple-500 to-violet-600',
    bgFrom: '#faf5ff',
    bgTo: '#ede9fe',
    accent: '#7c3aed',
    iconAnimation: 'pulse',
  },
  {
    id: 'cotisations',
    icon: ShieldCheck,
    title: 'COTISATIONS SOCIALES',
    description: 'Gère tes cotisations CNPS et CMU ici.',
    gradient: 'from-blue-500 to-cyan-600',
    bgFrom: '#eff6ff',
    bgTo: '#dbeafe',
    accent: '#2563eb',
    iconAnimation: 'spin',
  },
];

/* ── Animations spécifiques par type ─────────────────────────────── */
function FloatIcon({ Icon, gradient }: { Icon: React.ElementType; gradient: string }) {
  return (
    <motion.div
      animate={{ y: [0, -14, 0] }}
      transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
      className={`w-32 h-32 rounded-3xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-2xl mx-auto`}
    >
      <Icon className="w-16 h-16 text-white" />
    </motion.div>
  );
}

function BounceIcon({ Icon, gradient }: { Icon: React.ElementType; gradient: string }) {
  return (
    <motion.div
      animate={{ scale: [1, 1.12, 0.95, 1.06, 1] }}
      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.6 }}
      className={`w-32 h-32 rounded-3xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-2xl mx-auto`}
    >
      <Icon className="w-16 h-16 text-white" />
    </motion.div>
  );
}

function PulseIcon({ Icon, gradient, accent }: { Icon: React.ElementType; gradient: string; accent: string }) {
  return (
    <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
      {/* Ondes concentriques */}
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border-2"
          style={{ borderColor: accent, opacity: 0 }}
          animate={{ scale: [1, 2.4], opacity: [0.5, 0] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.5,
            ease: 'easeOut',
          }}
          initial={{ width: 128, height: 128 }}
        />
      ))}
      <div className={`w-32 h-32 rounded-3xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-2xl`}>
        <motion.div
          animate={{ scale: [1, 1.18, 1] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Icon className="w-16 h-16 text-white" />
        </motion.div>
      </div>
    </div>
  );
}

function SpinIcon({ Icon, gradient }: { Icon: React.ElementType; gradient: string }) {
  return (
    <div className="relative w-32 h-32 mx-auto">
      {/* Bordure qui tourne */}
      <motion.div
        className="absolute inset-0 rounded-3xl"
        style={{
          background: 'conic-gradient(from 0deg, transparent 70%, rgba(255,255,255,0.6) 100%)',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />
      <div className={`absolute inset-1 rounded-[20px] bg-gradient-to-br ${gradient} flex items-center justify-center shadow-2xl`}>
        <motion.div
          animate={{ rotate: [0, -10, 10, -6, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.8 }}
        >
          <Icon className="w-16 h-16 text-white" />
        </motion.div>
      </div>
    </div>
  );
}

function AnimatedIcon({ slide }: { slide: typeof slides[0] }) {
  const props = { Icon: slide.icon, gradient: slide.gradient, accent: slide.accent };
  switch (slide.iconAnimation) {
    case 'float':  return <FloatIcon {...props} />;
    case 'bounce': return <BounceIcon {...props} />;
    case 'pulse':  return <PulseIcon {...props} />;
    case 'spin':   return <SpinIcon {...props} />;
    default:       return <FloatIcon {...props} />;
  }
}

/* ── Composant principal ─────────────────────────────────────────── */
export function OnboardingSlides({ onComplete }: OnboardingSlidesProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1); // 1 = forward, -1 = backward
  const isLastSlide = currentSlide === slides.length - 1;
  const slide = slides[currentSlide];

  const handleNext = () => {
    if (isLastSlide) {
      onComplete?.();
    } else {
      setDirection(1);
      setCurrentSlide(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setDirection(-1);
      setCurrentSlide(prev => prev - 1);
    }
  };

  const handleDot = (index: number) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  };

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 340 : -340,
      opacity: 0,
      scale: 0.92,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -340 : 340,
      opacity: 0,
      scale: 0.92,
    }),
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-between p-6 overflow-hidden"
      animate={{
        background: `linear-gradient(135deg, ${slide.bgFrom}, ${slide.bgTo})`,
      }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
    >
      {/* Formes décoratives en fond */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`bg-${currentSlide}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.12, scale: 1 }}
          exit={{ opacity: 0, scale: 1.2 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 pointer-events-none"
        >
          <div
            className={`absolute -top-24 -right-24 w-72 h-72 rounded-full bg-gradient-to-br ${slide.gradient}`}
          />
          <div
            className={`absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-gradient-to-br ${slide.gradient}`}
          />
        </motion.div>
      </AnimatePresence>

      {/* Bouton Skip */}
      <motion.div
        className="w-full max-w-md flex justify-end relative z-10"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <button
          onClick={() => onComplete?.()}
          className="font-semibold text-sm px-5 py-2 rounded-full border-2 transition-all duration-200"
          style={{ borderColor: slide.accent, color: slide.accent }}
        >
          Passer
        </button>
      </motion.div>

      {/* Contenu principal */}
      <div className="flex-1 flex items-center justify-center w-full max-w-md relative z-10 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="w-full text-center"
          >
            {/* Icône animée */}
            <motion.div
              className="mb-10"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <AnimatedIcon slide={slide} />
            </motion.div>

            {/* Titre */}
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="text-3xl font-extrabold mb-4 tracking-wide"
              style={{ color: '#1a1a2e' }}
            >
              {slide.title}
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="text-lg text-gray-600 px-6 leading-relaxed"
            >
              {slide.description}
            </motion.p>

            {/* Barre de couleur décorative sous le texte */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.45, duration: 0.5, ease: 'easeOut' }}
              className={`mx-auto mt-6 h-1 w-16 rounded-full bg-gradient-to-r ${slide.gradient}`}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="w-full max-w-md space-y-6 pb-4 relative z-10">
        {/* Indicateurs dots */}
        <div className="flex justify-center gap-3">
          {slides.map((s, index) => (
            <motion.button
              key={s.id}
              onClick={() => handleDot(index)}
              animate={{
                width: index === currentSlide ? 32 : 8,
                backgroundColor: index === currentSlide ? slide.accent : '#d1d5db',
              }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="h-2 rounded-full"
            />
          ))}
        </div>

        {/* Boutons */}
        <div className="flex gap-3">
          <AnimatePresence>
            {currentSlide > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20, width: 0 }}
                animate={{ opacity: 1, x: 0, width: 'auto', flex: 1 }}
                exit={{ opacity: 0, x: -20, width: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <Button
                  onClick={handlePrevious}
                  variant="outline"
                  className="w-full h-14 rounded-3xl border-2 text-base font-semibold"
                  style={{ borderColor: slide.accent, color: slide.accent }}
                >
                  <ChevronLeft className="w-5 h-5 mr-1" />
                  Retour
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            className="flex-1"
            whileTap={{ scale: 0.97 }}
          >
            <Button
              onClick={handleNext}
              className="w-full h-14 rounded-3xl text-base font-bold text-white shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${slide.accent}, ${slide.accent}cc)`,
              }}
            >
              {isLastSlide ? 'Commencer' : 'Suivant'}
              {!isLastSlide && (
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                  className="ml-1 inline-flex"
                >
                  <ChevronRight className="w-5 h-5" />
                </motion.span>
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
