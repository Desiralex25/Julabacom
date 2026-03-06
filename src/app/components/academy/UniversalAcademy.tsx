/**
 * JÙLABA ACADEMY — Interface style Duolingo
 * QCM animé, Tantie Sagesse réactive, carte du monde, progression Score Jùlaba
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Flame, Star, CheckCircle, XCircle, Award, Zap, Volume2,
  ShoppingBag, Package, Wallet, TrendingUp, Users, Leaf, Sun, Droplets,
  MapPin, FileText, Clock, BarChart2, Target, BookOpen, Store, Send,
  RefreshCw, MessageSquare, Eye, UserCheck, Shield, Globe, Heart,
  CreditCard, AlertTriangle, Database, ThumbsDown, AlertCircle, Sprout,
  Truck, Phone, Lock, ChevronRight, Play, Wind, Utensils, Hand,
  Ban, Calendar, Trash2, Image, EyeOff, UserX, Mic, Briefcase,
  TrendingDown, List, Share2, Percent, Edit3, User, Plus, Bug, Wrench,
  ArrowDown, Minus, Building, Printer, Hash, Navigation, Map, Gift,
  UserPlus, PiggyBank, Moon, Shuffle, Mail, Snowflake, Smile, Circle,
  Bell, Zap as ZapIcon, ThumbsUp
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useUser } from '../../contexts/UserContext';
import { UserRole } from './types';
import {
  AcademyQuestion,
  CHAPTER_THEMES,
  getQuestionsForChapter,
} from './academyQuestions';
import { ROLE_COLORS } from './academyConfig';
const tantieSagesseImg = '/images/tantie-sagesse.png';

// ── Icon registry ────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  ShoppingBag, Package, Wallet, TrendingUp, Users, Leaf, Sun, Droplets,
  MapPin, FileText, Clock, BarChart2, Target, BookOpen, Store, Send,
  RefreshCw, MessageSquare, Eye, UserCheck, Shield, Globe, Heart,
  CreditCard, AlertTriangle, Database, ThumbsDown, AlertCircle, Sprout,
  Truck, Phone, Lock, Wind, Utensils, Hand, Ban, Calendar, Trash2,
  Image, EyeOff, UserX, Mic, Briefcase, TrendingDown, List, Share2,
  Percent, Edit3, User, Plus, Bug, Wrench, ArrowDown, Minus, Building,
  Printer, Hash, Navigation, Map, Gift, UserPlus, PiggyBank, Moon,
  Shuffle, Mail, Snowflake, Smile, Circle, Bell, CheckCircle, XCircle,
  Award, Zap, Star, ThumbsUp, Flame, ArrowLeft,
  ChevronRight, Play, Volume2,
};

function DynIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name] || Target;
  return <Icon className={className} />;
}

// ── Types internes ───────────────────────────────────────────────────────────
type Screen = 'home' | 'map' | 'playing' | 'victory';
type TantieState = 'idle' | 'speaking' | 'correct' | 'wrong' | 'dancing';

interface Progress {
  completedLessons: string[]; // "ch-le" ex: "1-1"
  julabaScore: number;        // 0-100
  streak: number;
  lastPlayedDate: string;
  totalXP: number;
}

interface GameState {
  chapter: number;
  lesson: number;
  questions: AcademyQuestion[];
  questionIndex: number;
  selectedAnswer: number | null;
  answered: boolean;
  correctCount: number;
  xpEarned: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const URL_TO_ROLE: Record<string, UserRole> = {
  marchand: 'marchand', producteur: 'producteur',
  cooperative: 'cooperative', institution: 'institution',
  identificateur: 'identificateur', administrateur: 'institution',
};

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getLessonKey(ch: number, le: number) { return `${ch}-${le}`; }

const TOTAL_LESSONS = 15; // 3 ch × 5 lessons
const QUESTIONS_PER_LESSON = 5;
const XP_PER_CORRECT = 10;
const SCORE_PER_CORRECT = 1; // +1 Score Jùlaba

// Encouragements de Tantie Sagesse
const TANTIE_CORRECT = [
  'Bravo ! Tu es trop fort !', 'Waaaah ! Bonne réponse !',
  'C\'est ça ! Tu gères bien !', 'Exactement ! Continue comme ça !',
  'Oui oui oui ! Tu as compris !',
];
const TANTIE_WRONG = [
  'Aïe, pas tout à fait... Pas grave !', 'Non, mais c\'est pas grave. Retiens bien !',
  'Hmm, presque. Lis l\'explication !', 'Ce n\'est pas ça, mais tu apprendras !',
  'Courage ! La prochaine tu l\'auras !',
];
const TANTIE_STREAK = ['Tu es en feu ! Série de victoires !', 'Wooooh ! Rien ne t\'arrête !'];

// ── Confettis ────────────────────────────────────────────────────────────────
function Confetti({ active }: { active: boolean }) {
  if (!active) return null;
  const items = Array.from({ length: 20 }, (_, i) => i);
  const colors = ['#FFD700', '#FF6B35', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {items.map(i => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 rounded-sm"
          style={{
            backgroundColor: colors[i % colors.length],
            left: `${Math.random() * 100}%`,
            top: '-10px',
          }}
          animate={{
            y: ['0vh', '110vh'],
            x: [0, (Math.random() - 0.5) * 200],
            rotate: [0, Math.random() * 720 - 360],
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 1.5 + Math.random(),
            delay: Math.random() * 0.5,
            ease: 'easeIn',
          }}
        />
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export function UniversalAcademy() {
  const navigate = useNavigate();
  const location = useLocation();
  const { speak } = useApp();
  const { user } = useUser();

  const urlSegment = location.pathname.split('/')[1];
  const role: UserRole = URL_TO_ROLE[urlSegment] ?? 'marchand';
  const primaryColor = ROLE_COLORS[role];
  const theme = CHAPTER_THEMES[role];

  const PROGRESS_KEY = `julaba-academy-progress-${role}`;

  const [screen, setScreen] = useState<Screen>('home');
  const [game, setGame] = useState<GameState | null>(null);
  const [tantieState, setTantieState] = useState<TantieState>('idle');
  const [tantieMsg, setTantieMsg] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [victoryData, setVictoryData] = useState<{ xp: number; scoreGained: number; lessonKey: string } | null>(null);
  const [micOpen, setMicOpen] = useState(false);

  const [progress, setProgress] = useState<Progress>(() => {
    try {
      const s = localStorage.getItem(PROGRESS_KEY);
      if (s) return JSON.parse(s);
    } catch { /* ignore */ }
    return { completedLessons: [], julabaScore: user?.scoreCredit ?? 30, streak: 1, lastPlayedDate: '', totalXP: 0 };
  });

  // Persist progress
  useEffect(() => {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  }, [progress, PROGRESS_KEY]);

  // Streak check
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (progress.lastPlayedDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (progress.lastPlayedDate !== yesterday && progress.lastPlayedDate !== '') {
        setProgress(p => ({ ...p, streak: 1 }));
      }
    }
  }, []);

  // Tantie speaks
  const tantieSpeak = useCallback((msg: string, state: TantieState) => {
    setTantieMsg(msg);
    setTantieState(state);
    speak(msg);
    setTimeout(() => { setTantieState('idle'); setTantieMsg(''); }, 3500);
  }, [speak]);

  // ── Start a lesson ──────────────────────────────────────────────────────────
  const startLesson = (chapter: number, lesson: number) => {
    const pool = getQuestionsForChapter(role, chapter);
    if (pool.length === 0) return;
    const questions = shuffleArray(pool).slice(0, QUESTIONS_PER_LESSON);
    setGame({ chapter, lesson, questions, questionIndex: 0, selectedAnswer: null, answered: false, correctCount: 0, xpEarned: 0 });
    setScreen('playing');
    setTantieState('idle');
    const chapterName = chapter === 1 ? theme.ch1 : chapter === 2 ? theme.ch2 : theme.ch3;
    tantieSpeak(`Allez, on joue ! Chapitre ${chapter} : ${chapterName}. Écoute bien les questions !`, 'speaking');
  };

  // ── Answer a question ───────────────────────────────────────────────────────
  const handleAnswer = (index: number) => {
    if (!game || game.answered) return;
    const q = game.questions[game.questionIndex];
    const isCorrect = index === q.correctIndex;
    const newXP = game.xpEarned + (isCorrect ? XP_PER_CORRECT : 0);
    const newCorrect = game.correctCount + (isCorrect ? 1 : 0);

    setGame(g => g ? { ...g, selectedAnswer: index, answered: true, correctCount: newCorrect, xpEarned: newXP } : g);
    setShowExplanation(false);

    if (isCorrect) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
      const msg = TANTIE_CORRECT[Math.floor(Math.random() * TANTIE_CORRECT.length)];
      tantieSpeak(msg, 'correct');
    } else {
      setShowExplanation(true);
      const msg = TANTIE_WRONG[Math.floor(Math.random() * TANTIE_WRONG.length)];
      tantieSpeak(msg, 'wrong');
    }
  };

  // ── Next question ───────────────────────────────────────────────────────────
  const handleNext = () => {
    if (!game) return;
    if (game.questionIndex + 1 >= game.questions.length) {
      // End of lesson
      const lessonKey = getLessonKey(game.chapter, game.lesson);
      const scoreGained = Math.min(game.correctCount * SCORE_PER_CORRECT, 100 - progress.julabaScore);
      setVictoryData({ xp: game.xpEarned, scoreGained, lessonKey });

      setProgress(p => ({
        ...p,
        completedLessons: p.completedLessons.includes(lessonKey)
          ? p.completedLessons
          : [...p.completedLessons, lessonKey],
        julabaScore: Math.min(100, p.julabaScore + scoreGained),
        totalXP: p.totalXP + game.xpEarned,
        streak: p.streak + (game.correctCount > 0 ? 0 : 0),
        lastPlayedDate: new Date().toISOString().split('T')[0],
      }));

      if (game.correctCount === game.questions.length) {
        tantieSpeak(TANTIE_STREAK[Math.floor(Math.random() * TANTIE_STREAK.length)], 'dancing');
      }
      setScreen('victory');
    } else {
      setGame(g => g ? { ...g, questionIndex: g.questionIndex + 1, selectedAnswer: null, answered: false } : g);
      setShowExplanation(false);
      setTantieState('idle');
    }
  };

  // ── Chapter/Lesson unlock logic ────────────────────────────────────────────
  const isLessonUnlocked = (ch: number, le: number) => {
    if (ch === 1 && le === 1) return true; // toujours débloqué
    if (le === 1) {
      // Premier leçon du chapitre : chapitre précédent doit avoir ≥3 leçons complètes
      const prevChComplete = Array.from({ length: 5 }, (_, i) => i + 1)
        .filter(l => progress.completedLessons.includes(getLessonKey(ch - 1, l))).length;
      return prevChComplete >= 3;
    }
    return progress.completedLessons.includes(getLessonKey(ch, le - 1));
  };

  // ── Back handler ────────────────────────────────────────────────────────────
  const handleBack = () => {
    if (screen === 'playing') { setScreen('map'); setGame(null); }
    else if (screen === 'map') setScreen('home');
    else if (screen === 'victory') setScreen('map');
    else navigate(`/${urlSegment}/profil`);
  };

  // ════════════════════════════════════════════════════════════════════════════
  // SCREEN: HOME
  // ════════════════════════════════════════════════════════════════════════════
  if (screen === 'home') return (
    <div className="min-h-screen flex flex-col" style={{ background: `linear-gradient(160deg, ${primaryColor}15 0%, white 40%, ${primaryColor}08 100%)` }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-12 pb-4 gap-3">
        <motion.button
          onClick={handleBack}
          className="w-11 h-11 rounded-full bg-white shadow-md border-2 flex items-center justify-center flex-shrink-0"
          style={{ borderColor: `${primaryColor}40` }}
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
        >
          <ArrowLeft className="w-5 h-5" style={{ color: primaryColor }} />
        </motion.button>

        <motion.div
          className="flex items-center gap-2 px-4 h-11 rounded-full bg-white shadow-md border-2"
          style={{ borderColor: `${primaryColor}30` }}
          animate={{ scale: [1, 1.03, 1] }} transition={{ duration: 3, repeat: Infinity }}
        >
          <Flame className="w-5 h-5 text-orange-500" />
          <span className="font-black text-gray-900">{progress.streak}</span>
          <span className="text-xs text-gray-500 font-semibold">jours</span>
        </motion.div>

        <motion.div
          className="flex items-center gap-2 px-4 h-11 rounded-full text-white shadow-lg border-2 border-white/30 flex-shrink-0"
          style={{ backgroundColor: primaryColor }}
          animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 2, repeat: Infinity }}
        >
          <Star className="w-5 h-5" />
          <span className="font-black">{progress.julabaScore}</span>
          <span className="text-xs opacity-80">/100</span>
        </motion.div>
      </div>

      {/* Tantie Sagesse Hero */}
      <div className="flex flex-col items-center px-6 pt-4 pb-6">

        {/* Bulle discours — dans le flux, au-dessus de Tantie */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-3xl rounded-b-none px-5 py-3 shadow-xl border-2 mb-0 max-w-[220px] text-center"
          style={{ borderColor: primaryColor, borderBottomColor: 'transparent' }}
        >
          <p className="text-sm font-bold text-gray-900 leading-snug">
            On apprend en jouant !<br />
            <span style={{ color: primaryColor }}>C\'est parti !</span>
          </p>
        </motion.div>

        <motion.div
          initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          <motion.img
            src={tantieSagesseImg} alt="Tantie Sagesse"
            className="w-44 h-auto object-contain"
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>

        {/* Titre Academy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }} className="text-center mt-4 mb-6"
        >
          <h1 className="text-3xl font-black text-gray-900">
            Jùlaba <span style={{ color: primaryColor }}>Academy</span>
          </h1>
          <p className="text-gray-500 mt-1 font-medium">Apprends et gagne des points !</p>
        </motion.div>

        {/* Score Jùlaba barre */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full bg-white rounded-3xl p-5 shadow-lg border-2 mb-4"
          style={{ borderColor: `${primaryColor}30` }}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-gray-500 font-semibold">Mon Score Jùlaba</p>
              <p className="text-3xl font-black" style={{ color: primaryColor }}>{progress.julabaScore}<span className="text-lg text-gray-400">/100</span></p>
            </div>
            <motion.div
              className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg border-4 border-white"
              style={{ background: `conic-gradient(${primaryColor} ${progress.julabaScore * 3.6}deg, #e5e7eb 0deg)` }}
              animate={{ rotate: [0, 360] }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            >
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                <Star className="w-6 h-6" style={{ color: primaryColor }} />
              </div>
            </motion.div>
          </div>
          <div className="h-4 bg-gray-100 rounded-full overflow-hidden border-2 border-gray-200">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: primaryColor }}
              initial={{ width: 0 }} animate={{ width: `${progress.julabaScore}%` }}
              transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2 font-medium text-right">{100 - progress.julabaScore} points pour arriver à 100</p>
        </motion.div>

        {/* Stats rapides */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-3 gap-3 w-full mb-6"
        >
          {[
            { icon: Award, label: 'Leçons OK', value: progress.completedLessons.length, color: '#F59E0B' },
            { icon: Zap, label: 'XP total', value: progress.totalXP, color: '#8B5CF6' },
            { icon: Flame, label: 'Série', value: `${progress.streak}j`, color: '#EF4444' },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="bg-white rounded-2xl p-3 text-center shadow-md border-2 border-gray-100"
                whileHover={{ y: -3 }}
              >
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                >
                  <Icon className="w-6 h-6 mx-auto mb-1" style={{ color: s.color }} />
                </motion.div>
                <p className="font-black text-gray-900 text-lg">{s.value}</p>
                <p className="text-xs text-gray-500 font-semibold">{s.label}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bouton JOUER */}
        <motion.button
          onClick={() => setScreen('map')}
          className="w-full py-6 rounded-3xl text-white shadow-2xl border-4 border-white/30 relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}CC 100%)` }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.03, y: -4 }} whileTap={{ scale: 0.97 }}
        >
          {/* Shimmer */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          />
          <div className="relative z-10 flex items-center justify-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Play className="w-8 h-8" strokeWidth={3} />
            </motion.div>
            <span className="text-2xl font-black tracking-wide">JOUER !</span>
          </div>
        </motion.button>
      </div>
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════════
  // SCREEN: MAP (Carte du monde)
  // ════════════════════════════════════════════════════════════════════════════
  if (screen === 'map') {
    const chapters = [
      { num: 1, name: theme.ch1, icon: theme.icons[0], color: primaryColor },
      { num: 2, name: theme.ch2, icon: theme.icons[1], color: '#6366F1' },
      { num: 3, name: theme.ch3, icon: theme.icons[2], color: '#F59E0B' },
    ];

    return (
      <div className="min-h-screen pb-10" style={{ background: `linear-gradient(180deg, ${primaryColor}20 0%, white 30%)` }}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-12 pb-6">
          <motion.button
            onClick={handleBack}
            className="w-11 h-11 rounded-full bg-white shadow-md border-2 flex items-center justify-center"
            style={{ borderColor: `${primaryColor}40` }}
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft className="w-5 h-5" style={{ color: primaryColor }} />
          </motion.button>
          <h1 className="text-xl font-black text-gray-900">Carte du savoir</h1>
          <motion.div
            className="flex items-center gap-1 px-3 py-2 rounded-full text-white shadow-md"
            style={{ backgroundColor: primaryColor }}
          >
            <Star className="w-4 h-4" />
            <span className="font-black text-sm">{progress.julabaScore}</span>
          </motion.div>
        </div>

        {/* Chapitres & Leçons */}
        <div className="px-4 space-y-8">
          {chapters.map((ch, chIdx) => {
            const completedInChapter = Array.from({ length: 5 }, (_, i) => i + 1)
              .filter(l => progress.completedLessons.includes(getLessonKey(ch.num, l))).length;
            const chapterUnlocked = ch.num === 1 || isLessonUnlocked(ch.num, 1);

            return (
              <motion.div
                key={ch.num}
                initial={{ opacity: 0, x: chIdx % 2 === 0 ? -30 : 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: chIdx * 0.15 }}
              >
                {/* Chapter header */}
                <div className="flex items-center gap-3 mb-4">
                  <motion.div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg border-2 border-white"
                    style={{ backgroundColor: chapterUnlocked ? ch.color : '#9CA3AF' }}
                    animate={chapterUnlocked ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <DynIcon name={ch.icon} className="w-7 h-7 text-white" />
                  </motion.div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-semibold">Chapitre {ch.num}</p>
                    <h2 className="font-black text-gray-900 text-lg">{ch.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: ch.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${(completedInChapter / 5) * 100}%` }}
                          transition={{ duration: 1, delay: 0.3 }}
                        />
                      </div>
                      <span className="text-xs font-bold text-gray-500">{completedInChapter}/5</span>
                    </div>
                  </div>
                </div>

                {/* Lessons path */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {Array.from({ length: 5 }, (_, i) => i + 1).map((le) => {
                    const unlocked = isLessonUnlocked(ch.num, le);
                    const completed = progress.completedLessons.includes(getLessonKey(ch.num, le));
                    const isCurrent = !completed && unlocked;

                    return (
                      <motion.div key={le} className="flex flex-col items-center flex-shrink-0">
                        {/* Connecteur */}
                        {le > 1 && (
                          <div className="flex items-center w-6 mb-1">
                            {Array.from({ length: 3 }).map((_, di) => (
                              <motion.div
                                key={di}
                                className="w-1.5 h-1.5 rounded-full mx-0.5"
                                style={{ backgroundColor: unlocked ? ch.color : '#D1D5DB' }}
                                animate={unlocked ? { opacity: [0.3, 1, 0.3] } : {}}
                                transition={{ duration: 1.5, repeat: Infinity, delay: di * 0.3 }}
                              />
                            ))}
                          </div>
                        )}
                        <motion.button
                          onClick={() => unlocked && startLesson(ch.num, le)}
                          disabled={!unlocked}
                          className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center shadow-lg border-4 relative"
                          style={{
                            backgroundColor: completed ? ch.color : isCurrent ? 'white' : '#F3F4F6',
                            borderColor: completed ? ch.color : isCurrent ? ch.color : '#E5E7EB',
                          }}
                          whileHover={unlocked ? { scale: 1.1, y: -4 } : {}}
                          whileTap={unlocked ? { scale: 0.95 } : {}}
                          animate={isCurrent ? {
                            boxShadow: [`0 0 0 0 ${ch.color}40`, `0 0 0 12px ${ch.color}00`],
                          } : {}}
                          transition={isCurrent ? { duration: 1.5, repeat: Infinity } : {}}
                        >
                          {completed ? (
                            <CheckCircle className="w-7 h-7 text-white" strokeWidth={3} />
                          ) : unlocked ? (
                            <>
                              <Star className="w-6 h-6" style={{ color: ch.color }} />
                              <span className="text-xs font-black mt-0.5" style={{ color: ch.color }}>{le}</span>
                            </>
                          ) : (
                            <Lock className="w-6 h-6 text-gray-400" />
                          )}
                          {isCurrent && (
                            <motion.div
                              className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: ch.color }}
                              animate={{ scale: [1, 1.3, 1] }}
                              transition={{ duration: 0.8, repeat: Infinity }}
                            >
                              <Play className="w-3 h-3 text-white" strokeWidth={3} />
                            </motion.div>
                          )}
                        </motion.button>
                        <span className="text-xs text-gray-500 font-semibold mt-1">L{le}</span>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Checkpoint badge */}
                {chIdx < 2 && (
                  <motion.div
                    className="mt-5 flex justify-center"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <motion.div
                      className="flex items-center gap-3 px-5 py-3 rounded-full border-2 bg-white shadow-md"
                      style={{ borderColor: `${ch.color}60` }}
                      animate={{ y: [0, -4, 0] }} transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Award className="w-5 h-5" style={{ color: ch.color }} />
                      <span className="text-sm font-bold text-gray-700">
                        {completedInChapter >= 3 ? `Chapitre ${ch.num + 1} débloqué !` : `Fais 3 leçons pour débloquer le suivant`}
                      </span>
                      {completedInChapter >= 3 && <CheckCircle className="w-5 h-5 text-green-500" />}
                    </motion.div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // SCREEN: PLAYING (La leçon)
  // ═══════════════════════════════════════════════════════════════════════════
  if (screen === 'playing' && game) {
    const q = game.questions[game.questionIndex];
    const isCorrect = game.answered && game.selectedAnswer === q.correctIndex;
    const isWrong = game.answered && game.selectedAnswer !== q.correctIndex;
    const letters = ['A', 'B', 'C', 'D'];

    return (
      <div className="min-h-screen flex flex-col" style={{ background: `linear-gradient(180deg, ${primaryColor}18 0%, white 35%, ${primaryColor}08 100%)` }}>
        <Confetti active={showConfetti} />

        {/* ── Barre de progression ── */}
        <div className="px-4 pt-10 pb-3">
          <div className="flex items-center gap-3">
            <motion.button
              onClick={handleBack}
              className="w-10 h-10 rounded-full bg-white shadow-md border-2 flex items-center justify-center flex-shrink-0"
              style={{ borderColor: `${primaryColor}40` }}
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            >
              <XCircle className="w-5 h-5 text-gray-400" />
            </motion.button>
            <div className="flex-1 flex items-center gap-1.5">
              {game.questions.map((_, i) => (
                <motion.div
                  key={i}
                  className="flex-1 h-3 rounded-full"
                  style={{ backgroundColor: i < game.questionIndex ? primaryColor : i === game.questionIndex ? `${primaryColor}55` : '#E5E7EB' }}
                  animate={i === game.questionIndex ? { opacity: [0.5, 1, 0.5] } : {}}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
              ))}
            </div>
            <motion.div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white shadow-md flex-shrink-0"
              style={{ backgroundColor: '#F59E0B' }}
              animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Zap className="w-4 h-4" strokeWidth={3} />
              <span className="font-black text-sm">{game.xpEarned}</span>
            </motion.div>
          </div>
        </div>

        {/* ── TANTIE SAGESSE — parfaitement centrée ── */}
        <div className="flex flex-col items-center px-6 pt-1 pb-2">
          {/* Bulle de dialogue — uniquement quand Tantie a un message */}
          <AnimatePresence mode="wait">
            {tantieMsg && (
              <motion.div
                key={tantieMsg}
                initial={{ opacity: 0, scale: 0.85, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85 }}
                className="px-5 py-3 rounded-3xl rounded-b-none shadow-xl border-2 text-center"
                style={{
                  maxWidth: '72%',
                  backgroundColor: isCorrect ? '#F0FDF4' : isWrong ? '#FEF2F2' : 'white',
                  borderColor: isCorrect ? '#10B981' : isWrong ? '#EF4444' : primaryColor,
                  borderBottomColor: 'transparent',
                }}
              >
                <p className="font-bold text-sm leading-snug" style={{ color: isCorrect ? '#059669' : isWrong ? '#DC2626' : primaryColor }}>
                  {tantieMsg}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Image Tantie */}
          <motion.div
            animate={
              tantieState === 'correct' ? { y: [0, -18, 0, -10, 0], rotate: [0, -12, 12, -6, 0] } :
              tantieState === 'wrong'    ? { x: [-8, 8, -8, 8, 0] } :
              tantieState === 'dancing'  ? { y: [0, -14, 0], rotate: [-6, 6, -6, 6, 0], scale: [1, 1.12, 1] } :
              tantieState === 'speaking' ? { scale: [1, 1.06, 1] } :
              { y: [0, -7, 0] }
            }
            transition={tantieState === 'idle' ? { duration: 3, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.55 }}
          >
            <img src={tantieSagesseImg} alt="Tantie Sagesse" className="w-28 h-auto object-contain drop-shadow-xl" />
          </motion.div>
        </div>

        {/* ── CARTE QUESTION ── */}
        <div className="px-4 mb-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 14, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -14, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              className="bg-white rounded-3xl border-2 shadow-xl"
              style={{ borderColor: `${primaryColor}40` }}
            >
              <div className="px-5 pt-4 pb-2 flex items-center justify-between">
                <span className="text-xs font-black px-3 py-1 rounded-full text-white" style={{ backgroundColor: primaryColor }}>
                  Question {game.questionIndex + 1} / {game.questions.length}
                </span>
                <motion.button
                  onClick={() => speak(q.question)}
                  className="w-9 h-9 rounded-full flex items-center justify-center border-2 shadow-sm"
                  style={{ borderColor: `${primaryColor}40`, color: primaryColor }}
                  whileTap={{ scale: 0.88 }}
                >
                  <Volume2 className="w-4 h-4" />
                </motion.button>
              </div>
              <div className="px-5 pb-5">
                <p className="font-black text-gray-900 leading-snug" style={{ fontSize: '1.12rem' }}>{q.question}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── GRILLE 2×2 DES RÉPONSES ── */}
        {(() => {
          // Couleurs vives UNIQUEMENT pour les icônes — cartes restent blanches/neutres
          const ICON_COLORS = ['#F97316', '#3B82F6', '#22C55E', '#A855F7'];
          const ICON_GLOW   = ['#FED7AA', '#BFDBFE', '#BBF7D0', '#E9D5FF'];

          const idleAnims = [
            { y: [0, -9, 0] },
            { y: [0, -7, 0], rotate: [-5, 5, -5] },
            { y: [0, -8, 0], scale: [1, 1.14, 1] },
            { y: [0, -6, 0], rotate: [5, -5, 5] },
          ];
          const idleDelays = [0, 0.45, 0.8, 1.2];

          return (
            <div className="px-4 grid grid-cols-2 gap-4 pb-4">
              {q.options.map((opt, idx) => {
                const isSelected = game.selectedAnswer === idx;
                const isThisCorrect = idx === q.correctIndex;

                // Carte : toujours blanche, bordure neutre → vert/rouge après réponse
                let cardBg    = 'white';
                let cardBorder = `${primaryColor}30`;
                let textColor  = '#1F2937';
                let iconColor  = ICON_COLORS[idx];
                let iconGlow   = ICON_GLOW[idx];
                let letterColor = primaryColor;

                if (game.answered) {
                  if (isThisCorrect) {
                    cardBg = '#F0FDF4'; cardBorder = '#10B981';
                    textColor = '#065F46'; iconColor = '#16A34A'; iconGlow = '#BBF7D0';
                    letterColor = '#10B981';
                  } else if (isSelected) {
                    cardBg = '#FEF2F2'; cardBorder = '#EF4444';
                    textColor = '#991B1B'; iconColor = '#DC2626'; iconGlow = '#FECACA';
                    letterColor = '#EF4444';
                  } else {
                    cardBg = '#F9FAFB'; cardBorder = '#E5E7EB';
                    textColor = '#9CA3AF'; iconColor = '#D1D5DB'; iconGlow = '#F3F4F6';
                    letterColor = '#D1D5DB';
                  }
                }

                return (
                  <motion.button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    disabled={game.answered}
                    className="rounded-3xl border-2 flex flex-col items-center justify-center gap-3 pb-5 pt-4 px-3 relative overflow-hidden"
                    style={{
                      backgroundColor: cardBg,
                      borderColor: cardBorder,
                      minHeight: '162px',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.07)',
                    }}
                    initial={{ opacity: 0, scale: 0.75, y: 28 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: idx * 0.08, type: 'spring', stiffness: 340, damping: 22 }}
                    whileHover={!game.answered ? { scale: 1.06, y: -5, boxShadow: `0 14px 32px ${ICON_COLORS[idx]}28` } : {}}
                    whileTap={!game.answered ? { scale: 0.92 } : {}}
                  >
                    {/* Badge lettre — coin haut gauche */}
                    <motion.div
                      className="absolute top-2.5 left-3 w-8 h-8 rounded-2xl flex items-center justify-center border-2 bg-white"
                      style={{ borderColor: `${cardBorder}` }}
                      animate={isThisCorrect && game.answered ? { scale: [1, 1.6, 1], rotate: [0, 25, -25, 0] } : {}}
                      transition={{ duration: 0.5 }}
                    >
                      {game.answered && isThisCorrect ? (
                        <CheckCircle className="w-4 h-4 text-green-500" strokeWidth={3} />
                      ) : game.answered && isSelected ? (
                        <XCircle className="w-4 h-4 text-red-500" strokeWidth={3} />
                      ) : (
                        <span className="font-black text-sm" style={{ color: letterColor }}>{letters[idx]}</span>
                      )}
                    </motion.div>

                    {/* ── ICÔNE COLORÉE ET VIVANTE ── */}
                    <motion.div
                      className="relative flex items-center justify-center mt-3"
                      animate={
                        game.answered && isThisCorrect
                          ? { scale: [1, 1.6, 1.2, 1.5, 1], rotate: [0, -18, 18, -10, 0] }
                          : game.answered && isSelected
                          ? { scale: [1, 0.75, 1], x: [0, -4, 4, -4, 0] }
                          : game.answered
                          ? {}
                          : idleAnims[idx]
                      }
                      transition={
                        game.answered
                          ? { duration: 0.65, type: 'spring' }
                          : { duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: idleDelays[idx] }
                      }
                    >
                      {/* Halo lumineux derrière l'icône */}
                      {!game.answered && (
                        <motion.div
                          className="absolute inset-0 rounded-full blur-lg"
                          style={{ backgroundColor: iconGlow, width: '72px', height: '72px', margin: '-4px' }}
                          animate={{ opacity: [0.4, 0.9, 0.4], scale: [0.85, 1.1, 0.85] }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: idleDelays[idx] }}
                        />
                      )}
                      <DynIcon
                        name={opt.icon}
                        className="w-16 h-16 relative z-10"
                        style={{ color: iconColor, filter: !game.answered ? `drop-shadow(0 4px 10px ${iconGlow})` : undefined } as any}
                      />
                    </motion.div>

                    {/* Étincelles sur bonne réponse */}
                    <AnimatePresence>
                      {game.answered && isThisCorrect && (
                        <>
                          {[...Array(6)].map((_, si) => (
                            <motion.div
                              key={si}
                              className="absolute w-2.5 h-2.5 rounded-full pointer-events-none"
                              style={{ backgroundColor: ICON_COLORS[idx], top: '50%', left: '50%' }}
                              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                              animate={{
                                x: Math.cos((si / 6) * Math.PI * 2) * 60,
                                y: Math.sin((si / 6) * Math.PI * 2) * 60,
                                opacity: 0, scale: 0,
                              }}
                              transition={{ duration: 0.65, delay: si * 0.05 }}
                            />
                          ))}
                        </>
                      )}
                    </AnimatePresence>

                    {/* Texte de la réponse */}
                    <span
                      className="font-black text-center leading-tight px-1"
                      style={{ color: textColor, fontSize: '0.83rem' }}
                    >
                      {opt.text}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          );
        })()}

        {/* ── MICRO FLOTTANT TANTIE SAGESSE ── */}
        {!game.answered && (
          <div className="fixed bottom-6 left-0 right-0 z-40 flex flex-col items-center gap-2">
            {/* Panel d'options — s'ouvre quand on appuie sur le micro */}
            <AnimatePresence>
              {micOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.85, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.85, y: 16 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                  className="bg-white rounded-3xl shadow-2xl border-2 overflow-hidden"
                  style={{ borderColor: `${primaryColor}40`, width: '220px' }}
                >
                  {/* Entête du panel */}
                  <div className="px-4 py-3 flex items-center gap-2 border-b border-gray-100"
                    style={{ backgroundColor: `${primaryColor}10` }}>
                    <img src={tantieSagesseImg} alt="Tantie" className="w-8 h-8 object-contain rounded-full" />
                    <p className="font-black text-sm" style={{ color: primaryColor }}>Tantie Sagesse</p>
                  </div>
                  {/* Actions */}
                  {[
                    { icon: Volume2,     label: 'Répéter la question',  action: () => { speak(q.question); tantieSpeak(`Voici la question : ${q.question}`, 'speaking'); setMicOpen(false); } },
                    { icon: RefreshCw,   label: 'Expliquer autrement',  action: () => { tantieSpeak(`Lis bien chaque réponse. Élimine celles qui semblent fausses !`, 'speaking'); setMicOpen(false); } },
                    { icon: Target,      label: 'Donne-moi un indice',  action: () => { tantieSpeak(`Pense bien au contexte... La bonne réponse parle de ${q.options[q.correctIndex].text.split(' ')[0]}.`, 'speaking'); setMicOpen(false); } },
                    { icon: MessageSquare, label: 'Encourager moi',    action: () => { tantieSpeak(`Tu peux le faire ! Lis bien et fais confiance à toi !`, 'speaking'); setMicOpen(false); } },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <motion.button
                        key={i}
                        onClick={item.action}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left border-b border-gray-50 last:border-0 active:bg-gray-50"
                        whileTap={{ scale: 0.97 }}
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                      >
                        <div className="w-8 h-8 rounded-2xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${primaryColor}15` }}>
                          <Icon className="w-4 h-4" style={{ color: primaryColor }} />
                        </div>
                        <span className="font-bold text-sm text-gray-800 leading-tight">{item.label}</span>
                      </motion.button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bouton micro principal */}
            <motion.button
              onClick={() => setMicOpen(o => !o)}
              className="relative w-16 h-16 rounded-full shadow-2xl border-4 border-white flex items-center justify-center"
              style={{ backgroundColor: micOpen ? '#EF4444' : primaryColor }}
              animate={{ scale: micOpen ? 1 : [1, 1.08, 1] }}
              transition={{ duration: 2, repeat: micOpen ? 0 : Infinity, ease: 'easeInOut' }}
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.92 }}
            >
              {/* Halo pulsant quand fermé */}
              {!micOpen && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ backgroundColor: primaryColor }}
                  animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
              <motion.div
                animate={micOpen ? { rotate: 45 } : { rotate: 0 }}
                transition={{ duration: 0.22 }}
              >
                {micOpen
                  ? <XCircle className="w-7 h-7 text-white" strokeWidth={2.5} />
                  : <Mic className="w-7 h-7 text-white" strokeWidth={2.5} />
                }
              </motion.div>
            </motion.button>

            {/* Label flottant */}
            <AnimatePresence>
              {!micOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="bg-white rounded-2xl px-3 py-1 shadow-lg border-2"
                  style={{ borderColor: `${primaryColor}30` }}
                >
                  <p className="text-xs font-black" style={{ color: primaryColor }}>Tantie aide</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ── Explication + bouton Suivant ── */}
        <AnimatePresence>
          {game.answered && (
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              className="px-4 pt-2 pb-8"
            >
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                className="rounded-2xl px-4 py-3 border-2 mb-3"
                style={{
                  backgroundColor: isCorrect ? '#F0FDF4' : '#FEF2F2',
                  borderColor: isCorrect ? '#10B981' : '#EF4444',
                }}
              >
                <div className="flex items-start gap-2">
                  {isCorrect
                    ? <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    : <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  }
                  <p className="text-sm font-semibold leading-snug" style={{ color: isCorrect ? '#065F46' : '#7F1D1D' }}>
                    {q.explanation}
                  </p>
                </div>
              </motion.div>

              <motion.button
                onClick={handleNext}
                className="w-full py-5 rounded-3xl text-white font-black text-xl shadow-2xl border-4 border-white/30 relative overflow-hidden"
                style={{ backgroundColor: isCorrect ? '#10B981' : '#6366F1' }}
                whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
                animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 1, repeat: Infinity }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span className="relative z-10">
                  {game.questionIndex + 1 >= game.questions.length ? 'Voir mes résultats !' : 'Question suivante'}
                </span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // SCREEN: VICTORY
  // ════════════════════════════════════════════════════���═══════════════════════
  if (screen === 'victory' && game && victoryData) {
    const perfect = game.correctCount === game.questions.length;
    const stars = game.correctCount >= 5 ? 3 : game.correctCount >= 3 ? 2 : 1;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 pb-10 pt-16 relative overflow-hidden"
        style={{ background: `linear-gradient(160deg, ${primaryColor}20 0%, white 50%, ${primaryColor}10 100%)` }}>
        <Confetti active={true} />

        {/* Cercle animé déco */}
        <motion.div
          className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
          style={{ backgroundColor: primaryColor }}
          animate={{ scale: [1, 1.5, 1], rotate: [0, 180] }}
          transition={{ duration: 8, repeat: Infinity }}
        />

        {/* Tantie qui danse */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [-5, 5, -5, 5, 0] }}
          transition={{ duration: 0.8, repeat: 4 }}
          className="mb-4 relative z-10"
        >
          <img src={tantieSagesseImg} alt="Tantie" className="w-36 h-auto object-contain" />
        </motion.div>

        {/* Titre victoire */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, delay: 0.3 }}
          className="text-center mb-6 relative z-10"
        >
          <h1 className="text-4xl font-black text-gray-900 mb-1">
            {perfect ? 'PARFAIT !' : game.correctCount >= 3 ? 'BIEN JOUÉ !' : 'CONTINUE !'}
          </h1>
          <p className="text-gray-500 font-semibold">
            {game.correctCount}/{game.questions.length} bonnes réponses
          </p>
        </motion.div>

        {/* Étoiles */}
        <div className="flex gap-3 mb-6 relative z-10">
          {[1, 2, 3].map(s => (
            <motion.div
              key={s}
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: s <= stars ? 1 : 0.6, rotate: 0, opacity: s <= stars ? 1 : 0.3 }}
              transition={{ type: 'spring', delay: 0.5 + s * 0.15 }}
            >
              <Star
                className="w-14 h-14"
                style={{ color: s <= stars ? '#F59E0B' : '#D1D5DB' }}
                fill={s <= stars ? '#F59E0B' : 'none'}
              />
            </motion.div>
          ))}
        </div>

        {/* Récompenses */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-3xl p-5 shadow-xl border-4 text-center"
            style={{ borderColor: '#F59E0B40' }}
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.8, repeat: 3 }}
            >
              <Zap className="w-10 h-10 text-yellow-500 mx-auto mb-2" />
            </motion.div>
            <p className="text-3xl font-black text-yellow-500">+{victoryData.xp}</p>
            <p className="text-xs font-bold text-gray-500">XP gagnés</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85 }}
            className="bg-white rounded-3xl p-5 shadow-xl border-4 text-center"
            style={{ borderColor: `${primaryColor}40` }}
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.8, repeat: 3, delay: 0.2 }}
            >
              <Star className="w-10 h-10 mx-auto mb-2" style={{ color: primaryColor }} />
            </motion.div>
            <p className="text-3xl font-black" style={{ color: primaryColor }}>+{victoryData.scoreGained}</p>
            <p className="text-xs font-bold text-gray-500">Score Jùlaba</p>
          </motion.div>
        </div>

        {/* Nouveau Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 }}
          className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-xl border-2 mb-6 relative z-10"
          style={{ borderColor: `${primaryColor}30` }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="font-bold text-gray-700">Score Jùlaba</p>
            <p className="font-black text-2xl" style={{ color: primaryColor }}>{progress.julabaScore}/100</p>
          </div>
          <div className="h-5 bg-gray-100 rounded-full overflow-hidden border-2 border-gray-200">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: primaryColor }}
              initial={{ width: `${Math.max(0, progress.julabaScore - victoryData.scoreGained)}%` }}
              animate={{ width: `${progress.julabaScore}%` }}
              transition={{ duration: 1.5, ease: 'easeOut', delay: 1.2 }}
            />
          </div>
        </motion.div>

        {/* Boutons */}
        <div className="flex flex-col gap-3 w-full max-w-sm relative z-10">
          <motion.button
            onClick={() => {
              const nextLesson = game.lesson < 5 ? game.lesson + 1 : null;
              const nextChapter = game.lesson >= 5 && game.chapter < 3 ? game.chapter + 1 : null;
              if (nextLesson && isLessonUnlocked(game.chapter, nextLesson)) {
                startLesson(game.chapter, nextLesson);
              } else if (nextChapter && isLessonUnlocked(nextChapter, 1)) {
                startLesson(nextChapter, 1);
              } else {
                setScreen('map');
              }
            }}
            className="py-5 rounded-3xl text-white font-black text-xl shadow-2xl border-4 border-white/30 overflow-hidden relative"
            style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}CC)` }}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="relative z-10">Continuer</span>
          </motion.button>

          <motion.button
            onClick={() => setScreen('map')}
            className="py-4 rounded-3xl font-bold text-gray-600 bg-white shadow-md border-2 border-gray-200"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          >
            Retour à la carte
          </motion.button>
        </div>
      </div>
    );
  }

  return null;
}