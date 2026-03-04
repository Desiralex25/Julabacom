import React from 'react';
import { Home, ShoppingBag, Package, Users, Settings, BarChart3, Mic } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';
import { useApp, UserRole } from '../../contexts/AppContext';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  isMic?: boolean;
}

const NAV_ITEMS: Record<UserRole, NavItem[]> = {
  marchand: [
    { icon: Home, label: 'Accueil', path: '/marchand' },
    { icon: ShoppingBag, label: 'Marketplace', path: '/marketplace' },
    { icon: Mic, label: 'Voix', path: '#', isMic: true },
    { icon: Package, label: 'Produit', path: '/marchand/produits' },
    { icon: Settings, label: 'Réglage', path: '/marchand/reglages' },
  ],
  producteur: [
    { icon: Home, label: 'Accueil', path: '/producteur' },
    { icon: ShoppingBag, label: 'Marketplace', path: '/marketplace' },
    { icon: Mic, label: 'Voix', path: '#', isMic: true },
    { icon: Package, label: 'Récoltes', path: '/producteur/recoltes' },
    { icon: Settings, label: 'Profil', path: '/producteur/profil' },
  ],
  cooperative: [
    { icon: Home, label: 'Accueil', path: '/cooperative' },
    { icon: Users, label: 'Membres', path: '/cooperative/membres' },
    { icon: Mic, label: 'Voix', path: '#', isMic: true },
    { icon: BarChart3, label: 'Finances', path: '/cooperative/finances' },
    { icon: Settings, label: 'Profil', path: '/cooperative/profil' },
  ],
  institution: [
    { icon: Home, label: 'Accueil', path: '/institution' },
    { icon: BarChart3, label: 'Analytics', path: '/institution/analytics' },
    { icon: Mic, label: 'Voix', path: '#', isMic: true },
    { icon: Users, label: 'Acteurs', path: '/institution/acteurs' },
    { icon: Settings, label: 'Paramètres', path: '/institution/parametres' },
  ],
};

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, roleColor } = useApp();

  if (!user) return null;

  const items = NAV_ITEMS[user.role];

  const handleClick = (item: NavItem) => {
    if (item.isMic) return; // Mic is handled by VoiceButton component
    navigate(item.path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2 max-w-md mx-auto">
        {items.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          const isMic = item.isMic;

          return (
            <button
              key={index}
              onClick={() => handleClick(item)}
              className={`flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl transition-all ${
                isMic ? 'invisible' : ''
              } ${isActive ? 'scale-105' : ''}`}
              style={{
                color: isActive ? roleColor : '#6B7280',
              }}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'scale-110' : ''}`} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
