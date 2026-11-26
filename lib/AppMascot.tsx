import { Mascot, type MascotMood } from './Mascot';
import { useCosmetics } from './CosmeticsContext';
import { useFridge } from './FridgeContext';
import { effectiveCosmetics } from './cosmetics';

export function AppMascot({ mood, size }: { mood?: MascotMood; size?: number }) {
  const { cosmetics } = useCosmetics();
  const { isPlus } = useFridge();
  return (
    <Mascot mood={mood} size={size} skin={effectiveCosmetics(cosmetics, isPlus).skin.id} />
  );
}