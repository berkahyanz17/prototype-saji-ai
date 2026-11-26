import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { DEFAULT_COSMETICS, sanitizeCosmetics, type Cosmetics } from './cosmetics';

const KEY = 'saji-look-v1';

type LookState = {
  cosmetics: Cosmetics;
  setCosmetics: (c: Cosmetics) => void;
  profilePhoto?: string;
  setProfilePhoto: (uri?: string) => void;
  resetLook: () => void;
};

const LookContext = createContext<LookState | null>(null);

export function CosmeticsProvider({ children }: { children: ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const [cosmetics, setCosmetics] = useState<Cosmetics>(DEFAULT_COSMETICS);
  const [profilePhoto, setProfilePhoto] = useState<string | undefined>(undefined);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          setCosmetics(sanitizeCosmetics(saved.cosmetics));
          if (typeof saved.profilePhoto === 'string' && saved.profilePhoto) {
            setProfilePhoto(saved.profilePhoto);
          }
        }
      } catch {
        // start with defaults
      }
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(KEY, JSON.stringify({ cosmetics, profilePhoto })).catch(() => {});
  }, [loaded, cosmetics, profilePhoto]);

  const resetLook = () => {
    setCosmetics(DEFAULT_COSMETICS);
    setProfilePhoto(undefined);
  };

  return (
    <LookContext.Provider
      value={{ cosmetics, setCosmetics, profilePhoto, setProfilePhoto, resetLook }}
    >
      {children}
    </LookContext.Provider>
  );
}

export function useCosmetics() {
  const ctx = useContext(LookContext);
  if (!ctx) throw new Error('useCosmetics must be used inside CosmeticsProvider');
  return ctx;
}