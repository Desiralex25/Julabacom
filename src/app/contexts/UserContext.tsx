import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { User } from './AppContext';

export interface UserData {
  nom: string;
  prenoms: string;
  telephone: string;
  telephone2?: string;
  email: string;
  localisation: string;
  typeActivite: string;
  dateInscription: string;
  numeroMarchand: string;
  statut: string;
  scoreCredit: number;
  niveauMembre: string;
  role: 'marchand' | 'producteur' | 'cooperative' | 'institution' | 'identificateur';
  market?: string; // Marché assigné pour identificateur/marchand
  photo?: string;
  dateNaissance?: string;
  nationalite?: string;
  commune?: string;
  cni?: string;
  cmu?: string;
  rsti?: string;
  categorie?: string;
  recepisse?: string;
  boitePostale?: string;
  // Paramètres de sécurité
  pinSecurityEnabled?: boolean; // PIN activé pour les paiements Wallet
  pinCode?: string; // Code PIN à 4 chiffres (hashé en production)
}

interface UserContextType {
  user: UserData | null;
  setUser: (user: UserData | User | null) => void;
  updateUser: (updates: Partial<UserData>) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const STORAGE_KEY = 'julaba_user_data';

// Default user data
const DEFAULT_USER: UserData = {
  nom: 'KOUASSI',
  prenoms: 'Aminata',
  telephone: '+225 07 01 02 03 04',
  telephone2: '+225 05 44 55 66 77',
  email: 'aminata.kouassi@julaba.ci',
  localisation: 'Marché de Yopougon',
  typeActivite: 'Vente de riz',
  dateInscription: '2024-01-15',
  numeroMarchand: 'JLB-MAR-2024-00123',
  statut: 'Vérifié',
  scoreCredit: 785,
  niveauMembre: 'Gold',
  role: 'marchand',
  dateNaissance: '15/03/1985',
  nationalite: 'Ivoirienne',
  commune: 'Yopougon',
  cni: 'CI2024001234567',
  cmu: 'CMU202400987654',
  rsti: 'RSTI2024000123',
  categorie: 'A',
  recepisse: 'N°01673/PA/SG/D1',
  boitePostale: '31 BP 573 ABIDJAN 31',
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserData | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setUserState(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load user data:', e);
        setUserState(DEFAULT_USER);
      }
    } else {
      setUserState(DEFAULT_USER);
    }
  }, []);

  // Save user to localStorage on change
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    }
  }, [user]);

  const setUser = (userData: UserData | User | null) => {
    // Handle null (logout case)
    if (userData === null) {
      setUserState(null);
      return;
    }

    // Check if it's a User from AppContext
    if ('firstName' in userData && 'lastName' in userData) {
      // Convert User to UserData
      const convertedUser: UserData = {
        nom: userData.lastName.toUpperCase(),
        prenoms: userData.firstName,
        telephone: `+225 ${userData.phone.slice(0, 2)} ${userData.phone.slice(2, 4)} ${userData.phone.slice(4, 6)} ${userData.phone.slice(6, 8)} ${userData.phone.slice(8, 10)}`,
        email: `${userData.firstName.toLowerCase()}.${userData.lastName.toLowerCase()}@julaba.ci`,
        localisation: `${userData.commune}, ${userData.region}`,
        typeActivite: userData.activity,
        dateInscription: userData.createdAt,
        numeroMarchand: `JLB-${userData.role.toUpperCase().slice(0, 3)}-${userData.createdAt.split('-')[0]}-${userData.id.padStart(5, '0')}`,
        statut: userData.validated ? 'Vérifié' : 'En attente',
        scoreCredit: userData.score * 10, // Convert score to credit score
        niveauMembre: userData.score >= 90 ? 'Platinum' : userData.score >= 80 ? 'Gold' : userData.score >= 70 ? 'Silver' : 'Bronze',
        role: userData.role,
        market: userData.market, // Conserver le marché
      };
      setUserState(convertedUser);
    } else {
      setUserState(userData as UserData);
    }
  };

  const updateUser = (updates: Partial<UserData>) => {
    if (user) {
      setUserState({ ...user, ...updates });
    }
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUserState(null);
  };

  return (
    <UserContext.Provider value={{ user, setUser, updateUser, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    // En développement, retourner des valeurs par défaut au lieu de crasher
    console.warn('useUser called outside of UserProvider - using default values');
    return {
      user: null,
      setUser: () => {},
      updateUser: () => {},
      logout: () => {},
    } as UserContextType;
  }
  return context;
}