/**
 * JULABA SHARED KPI WIDGET
 * Avec effet shimmer + MontantCard + FCFA petit
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';
import { getRoleColor, MOTION, UserRole } from '../../styles/design-tokens';
import { cn } from '../ui/utils';
import { MontantCard } from './Montant';

export interface KPIWidgetProps {
  title: string;
  value: string | number;
  prefix?: string;
  suffix?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  role?: UserRole;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
  onClick?: () => void;
  className?: string;
}

// CountUp interne
function useCountUp(target: number, duration = 1000) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  useEffect(() => {
    if (isNaN(target)) return;
    startRef.current = null;
    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
      else setDisplay(target);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);
  return display;
}

// Détecte si suffix contient FCFA
function hasFCFA(s?: string) {
  return s ? /FCFA/i.test(s) : false;
}
function extractUnit(s?: string) {
  if (!s) return '';
  // Ex: "FCFA/kg" => unit = "kg"
  const match = s.match(/FCFA\/(.+)/i);
  return match ? match[1] : '';
}

export function KPIWidget({
  title,
  value,
  prefix,
  suffix,
  icon: Icon,
  trend,
  role = 'marchand',
  variant = 'primary',
  onClick,
  className,
}: KPIWidgetProps) {
  const numValue = typeof value === 'number' ? value : NaN;
  const displayValue = useCountUp(isNaN(numValue) ? 0 : numValue);
  const roleColor = getRoleColor(role);

  const colors = {
    primary: { bg: `${roleColor}15`, text: roleColor, icon: roleColor },
    success: { bg: '#10B98115', text: '#10B981', icon: '#10B981' },
    warning: { bg: '#F59E0B15', text: '#F59E0B', icon: '#F59E0B' },
    danger:  { bg: '#EF444415', text: '#EF4444', icon: '#EF4444' },
    neutral: { bg: '#6B728015', text: '#6B7280', icon: '#6B7280' },
  }[variant];

  const isFcfaSuffix = hasFCFA(suffix);
  const unit = extractUnit(suffix);

  return (
    <MontantCard accentColor={colors.text} className={cn('rounded-2xl', className)}>
      <motion.div
        className={cn(
          'bg-white rounded-2xl p-6 shadow-md',
          'transition-all duration-200',
          onClick && 'cursor-pointer hover:shadow-lg',
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={MOTION.spring}
        whileHover={onClick ? { y: -4 } : undefined}
        whileTap={onClick ? MOTION.tap : undefined}
        onClick={onClick}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>

            <motion.div
              className="font-black"
              style={{ color: colors.text }}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ ...MOTION.spring, delay: 0.1 }}
            >
              {typeof value === 'number' ? (
                <span className="text-3xl inline-flex items-baseline gap-1 leading-none">
                  {prefix}
                  {displayValue.toLocaleString('fr-FR')}
                  {isFcfaSuffix && (
                    <span className="text-sm font-bold opacity-80">
                      FCFA{unit ? `/${unit}` : ''}
                    </span>
                  )}
                  {suffix && !isFcfaSuffix && (
                    <span className="text-xl ml-1">{suffix}</span>
                  )}
                </span>
              ) : (
                <span className="text-3xl">{prefix}{value}{suffix && !isFcfaSuffix && <span className="text-xl ml-1">{suffix}</span>}</span>
              )}
            </motion.div>

            {trend && (
              <motion.p
                className={cn('text-sm font-semibold mt-2', trend.value >= 0 ? 'text-green-600' : 'text-red-600')}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
              </motion.p>
            )}
          </div>

          <motion.div
            className="p-3 rounded-xl"
            style={{ backgroundColor: colors.bg }}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ ...MOTION.spring, delay: 0.2 }}
          >
            <Icon className="w-6 h-6" style={{ color: colors.icon }} />
          </motion.div>
        </div>
      </motion.div>
    </MontantCard>
  );
}
