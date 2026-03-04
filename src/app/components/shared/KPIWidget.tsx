/**
 * 📊 JULABA SHARED KPI WIDGET
 * 
 * Composant KPI unifié pour tous les dashboards.
 * Basé sur le Design System Marchand.
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';
import { getRoleColor, MOTION, UserRole } from '../../styles/design-tokens';
import { cn } from '../ui/utils';

export interface KPIWidgetProps {
  /** Titre du KPI */
  title: string;
  
  /** Valeur du KPI */
  value: string | number;
  
  /** Préfixe (ex: "+", "FCFA") */
  prefix?: string;
  
  /** Suffixe (ex: "FCFA", "%") */
  suffix?: string;
  
  /** Icône */
  icon: LucideIcon;
  
  /** Tendance (optionnel) */
  trend?: {
    value: number;
    label: string;
  };
  
  /** Rôle pour la couleur */
  role?: UserRole;
  
  /** Variante de couleur */
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
  
  /** Action au clic */
  onClick?: () => void;
  
  /** Classes additionnelles */
  className?: string;
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
  const [displayValue, setDisplayValue] = useState(0);
  const roleColor = getRoleColor(role);
  
  // Animation du compteur
  useEffect(() => {
    if (typeof value === 'number') {
      const duration = 1000;
      const steps = 60;
      const increment = value / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, duration / steps);
      
      return () => clearInterval(timer);
    }
  }, [value]);
  
  // Couleurs selon variant
  const colors = {
    primary: {
      bg: `${roleColor}15`,
      text: roleColor,
      icon: roleColor,
    },
    success: {
      bg: '#10B98115',
      text: '#10B981',
      icon: '#10B981',
    },
    warning: {
      bg: '#F59E0B15',
      text: '#F59E0B',
      icon: '#F59E0B',
    },
    danger: {
      bg: '#EF444415',
      text: '#EF4444',
      icon: '#EF4444',
    },
    neutral: {
      bg: '#6B728015',
      text: '#6B7280',
      icon: '#6B7280',
    },
  }[variant];
  
  return (
    <motion.div
      className={cn(
        'bg-white rounded-2xl p-6 shadow-md',
        'transition-all duration-200',
        onClick && 'cursor-pointer hover:shadow-lg',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={MOTION.spring}
      whileHover={onClick ? { y: -4 } : undefined}
      whileTap={onClick ? MOTION.tap : undefined}
      onClick={onClick}
    >
      {/* Header avec icône */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          
          {/* Valeur animée */}
          <motion.div
            className="text-3xl font-bold"
            style={{ color: colors.text }}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ ...MOTION.spring, delay: 0.1 }}
          >
            {prefix}
            {typeof value === 'number' 
              ? displayValue.toLocaleString('fr-FR')
              : value
            }
            {suffix && <span className="text-xl ml-1">{suffix}</span>}
          </motion.div>
          
          {/* Tendance */}
          {trend && (
            <motion.p
              className={cn(
                'text-sm font-semibold mt-2',
                trend.value >= 0 ? 'text-green-600' : 'text-red-600'
              )}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
            </motion.p>
          )}
        </div>
        
        {/* Icône */}
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
  );
}
