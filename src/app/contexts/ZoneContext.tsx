import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ZoneType = 'marche' | 'village' | 'region';

export interface Zone {
  id: string;
  nom: string; // "Marché de Cocody", "Village Yamoussoukro", "Région du Bélier"
  type: ZoneType;
  nombreMarchands: number;
  nombreProducteurs: number;
  nombreIdentificateurs: number;
  region: string; // Région administrative
  commune?: string;
  createdAt: string;
  active: boolean;
}

export interface ZoneStats {
  zoneId: string;
  zoneNom: string;
  totalIdentifications: number;
  identificationsEnAttente: number;
  identificationsValides: number;
  commissionsVersees: number;
  derniereMaj: string;
}

interface ZoneContextType {
  zones: Zone[];
  addZone: (zone: Omit<Zone, 'id' | 'createdAt'>) => void;
  updateZone: (id: string, updates: Partial<Zone>) => void;
  deleteZone: (id: string) => void;
  getZoneById: (id: string) => Zone | undefined;
  getZonesByType: (type: ZoneType) => Zone[];
  getZonesByRegion: (region: string) => Zone[];
  getZoneStats: (zoneId: string) => ZoneStats | undefined;
}

const ZoneContext = createContext<ZoneContextType | undefined>(undefined);

const STORAGE_KEY = 'julaba_zones';

// Zones par défaut - Marchés d'Abidjan et zones rurales
const DEFAULT_ZONES: Zone[] = [
  // Marchés urbains
  {
    id: '1',
    nom: 'Marché de Cocody',
    type: 'marche',
    nombreMarchands: 45,
    nombreProducteurs: 12,
    nombreIdentificateurs: 3,
    region: 'Abidjan',
    commune: 'Cocody',
    createdAt: '2024-01-01',
    active: true,
  },
  {
    id: '2',
    nom: "Marché d'Adjamé",
    type: 'marche',
    nombreMarchands: 78,
    nombreProducteurs: 23,
    nombreIdentificateurs: 5,
    region: 'Abidjan',
    commune: 'Adjamé',
    createdAt: '2024-01-01',
    active: true,
  },
  {
    id: '3',
    nom: 'Marché de Yopougon',
    type: 'marche',
    nombreMarchands: 67,
    nombreProducteurs: 18,
    nombreIdentificateurs: 4,
    region: 'Abidjan',
    commune: 'Yopougon',
    createdAt: '2024-01-01',
    active: true,
  },
  {
    id: '4',
    nom: 'Marché de Port-Bouët',
    type: 'marche',
    nombreMarchands: 34,
    nombreProducteurs: 15,
    nombreIdentificateurs: 2,
    region: 'Abidjan',
    commune: 'Port-Bouët',
    createdAt: '2024-01-01',
    active: true,
  },
  // Villages producteurs
  {
    id: '5',
    nom: 'Village de Yamoussoukro',
    type: 'village',
    nombreMarchands: 8,
    nombreProducteurs: 56,
    nombreIdentificateurs: 2,
    region: 'Yamoussoukro',
    createdAt: '2024-01-01',
    active: true,
  },
  {
    id: '6',
    nom: 'Village de Korhogo',
    type: 'village',
    nombreMarchands: 5,
    nombreProducteurs: 42,
    nombreIdentificateurs: 2,
    region: 'Savanes',
    commune: 'Korhogo',
    createdAt: '2024-01-01',
    active: true,
  },
  {
    id: '7',
    nom: 'Village de Bouaké',
    type: 'village',
    nombreMarchands: 12,
    nombreProducteurs: 38,
    nombreIdentificateurs: 2,
    region: 'Gbêkê',
    commune: 'Bouaké',
    createdAt: '2024-01-01',
    active: true,
  },
  // Régions agricoles
  {
    id: '8',
    nom: 'Région du Bélier',
    type: 'region',
    nombreMarchands: 15,
    nombreProducteurs: 124,
    nombreIdentificateurs: 4,
    region: 'Bélier',
    createdAt: '2024-01-01',
    active: true,
  },
  {
    id: '9',
    nom: 'Région des Lacs',
    type: 'region',
    nombreMarchands: 18,
    nombreProducteurs: 98,
    nombreIdentificateurs: 3,
    region: 'Lacs',
    createdAt: '2024-01-01',
    active: true,
  },
];

export function ZoneProvider({ children }: { children: ReactNode }) {
  // ✅ NETTOYAGE PHASE 2 : localStorage SUPPRIMÉ
  // TODO: Charger les zones depuis Supabase
  const [zones, setZones] = useState<Zone[]>(DEFAULT_ZONES);

  // TODO: Charger depuis Supabase au démarrage
  // React.useEffect(() => {
  //   const loadZones = async () => {
  //     const { data } = await supabase.from('zones').select('*');
  //     if (data) setZones(data);
  //   };
  //   loadZones();
  // }, []);

  const addZone = (zoneData: Omit<Zone, 'id' | 'createdAt'>) => {
    const newZone: Zone = {
      ...zoneData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setZones(prev => [...prev, newZone]);
  };

  const updateZone = (id: string, updates: Partial<Zone>) => {
    setZones(prev => prev.map(zone => 
      zone.id === id ? { ...zone, ...updates } : zone
    ));
  };

  const deleteZone = (id: string) => {
    setZones(prev => prev.filter(zone => zone.id !== id));
  };

  const getZoneById = (id: string) => {
    return zones.find(zone => zone.id === id);
  };

  const getZonesByType = (type: ZoneType) => {
    return zones.filter(zone => zone.type === type && zone.active);
  };

  const getZonesByRegion = (region: string) => {
    return zones.filter(zone => zone.region === region && zone.active);
  };

  const getZoneStats = (zoneId: string): ZoneStats | undefined => {
    const zone = getZoneById(zoneId);
    if (!zone) return undefined;

    // TODO: Calculer les stats réelles à partir des identifications
    return {
      zoneId: zone.id,
      zoneNom: zone.nom,
      totalIdentifications: zone.nombreMarchands + zone.nombreProducteurs,
      identificationsEnAttente: Math.floor((zone.nombreMarchands + zone.nombreProducteurs) * 0.15),
      identificationsValides: Math.floor((zone.nombreMarchands + zone.nombreProducteurs) * 0.85),
      commissionsVersees: (zone.nombreMarchands * 2000) + (zone.nombreProducteurs * 2500),
      derniereMaj: new Date().toISOString(),
    };
  };

  return (
    <ZoneContext.Provider
      value={{
        zones,
        addZone,
        updateZone,
        deleteZone,
        getZoneById,
        getZonesByType,
        getZonesByRegion,
        getZoneStats,
      }}
    >
      {children}
    </ZoneContext.Provider>
  );
}

export function useZones() {
  const context = useContext(ZoneContext);
  if (!context) {
    throw new Error('useZones must be used within a ZoneProvider');
  }
  return context;
}
