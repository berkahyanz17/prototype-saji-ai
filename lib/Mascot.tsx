import Svg, { Circle, ClipPath, Defs, Ellipse, G, Path, Rect } from 'react-native-svg';
import { SKINS } from './cosmetics';

export type MascotMood = 'biasa' | 'senang' | 'cemas' | 'masak';

const BROWN = '#462b0e';
const BODY = '#fffaf0';
const CHEEK = '#f9b5a0';
const EGG =
  'M150 70 C 215 70 255 150 255 215 C 255 270 210 305 150 305 C 90 305 45 270 45 215 C 45 150 85 70 150 70 Z';

type Props = { mood?: MascotMood; skin?: string; size?: number };

export function Mascot({ mood = 'biasa', skin = 'klasik', size = 120 }: Props) {
  const s = SKINS.find((x) => x.id === skin) ?? SKINS[0];

  const leftArm = mood === 'senang' ? { cx: 38, cy: 150 } : { cx: 44, cy: 220 };
  const rightArm =
    mood === 'senang'
      ? { cx: 262, cy: 150 }
      : mood === 'masak'
        ? { cx: 262, cy: 170 }
        : { cx: 256, cy: 220 };

  const line = {
    stroke: BROWN,
    strokeWidth: 7,
    strokeLinecap: 'round' as const,
    fill: 'none',
  };

  const hatShapes = (
    <>
      <Circle cx="108" cy="48" r="34" />
      <Circle cx="192" cy="48" r="34" />
      <Circle cx="150" cy="30" r="40" />
      <Rect x="78" y="58" width="144" height="44" rx="10" />
    </>
  );

  return (
    <Svg width={(size * 300) / 370} height={size} viewBox="0 0 300 370">
      <Defs>
        <ClipPath id="egg">
          <Path d={EGG} />
        </ClipPath>
      </Defs>

      <G transform="translate(0 30)">
        {/* feet */}
        <Ellipse cx="110" cy="312" rx="30" ry="14" fill={BROWN} />
        <Ellipse cx="190" cy="312" rx="30" ry="14" fill={BROWN} />

        {/* spoon (cooking pose) */}
        {mood === 'masak' && (
          <>
            <Path d="M262 170 L276 100" stroke={BROWN} strokeWidth="9" strokeLinecap="round" />
            <Ellipse
              cx="278"
              cy="88"
              rx="15"
              ry="20"
              fill="#d9a066"
              stroke={BROWN}
              strokeWidth="6"
            />
          </>
        )}

        {/* arms */}
        <Ellipse
          cx={leftArm.cx}
          cy={leftArm.cy}
          rx="22"
          ry="15"
          fill={BODY}
          stroke={BROWN}
          strokeWidth="7"
        />
        <Ellipse
          cx={rightArm.cx}
          cy={rightArm.cy}
          rx="22"
          ry="15"
          fill={BODY}
          stroke={BROWN}
          strokeWidth="7"
        />

        {/* body */}
        <Path d={EGG} fill={BODY} stroke={BROWN} strokeWidth="7" strokeLinejoin="round" />

        {/* outfit */}
        {s.outfit === 'apron' && (
          <G clipPath="url(#egg)">
            <Path d="M100 250 L200 250 L232 330 L68 330 Z" fill={s.accent ?? '#ffffff'} />
            <Rect x="124" y="274" width="52" height="30" rx="8" fill="#ffffff" fillOpacity={0.4} />
          </G>
        )}
        {s.outfit === 'scarf' && (
          <G clipPath="url(#egg)">
            <Path
              d="M62 252 Q150 282 238 252 L236 276 Q150 306 64 276 Z"
              fill={s.accent ?? '#e0634a'}
            />
          </G>
        )}

        {/* chef hat: outline first, then fill */}
        <G fill={BROWN} stroke={BROWN} strokeWidth="14" strokeLinejoin="round">
          {hatShapes}
        </G>
        <G fill={s.hat}>{hatShapes}</G>

        {/* cheeks */}
        <Ellipse cx="82" cy="207" rx="17" ry="11" fill={CHEEK} />
        <Ellipse cx="218" cy="207" rx="17" ry="11" fill={CHEEK} />

        {/* face */}
        {mood === 'senang' ? (
          <>
            <Path d="M85 182 Q105 158 125 182" {...line} />
            <Path d="M175 182 Q195 158 215 182" {...line} />
            <Path
              d="M122 198 Q150 192 178 198 Q175 238 150 238 Q125 238 122 198 Z"
              fill="#7a2e1a"
            />
            <Ellipse cx="150" cy="226" rx="16" ry="8" fill="#f07870" />
          </>
        ) : (
          <>
            <Ellipse cx="105" cy="175" rx="11" ry="14" fill={BROWN} />
            <Circle cx="109" cy="169" r="4" fill="#ffffff" />
            <Ellipse cx="195" cy="175" rx="11" ry="14" fill={BROWN} />
            <Circle cx="199" cy="169" r="4" fill="#ffffff" />
            {mood === 'cemas' ? (
              <>
                <Path d="M85 160 L122 147" {...line} />
                <Path d="M215 160 L178 147" {...line} />
                <Path d="M130 220 Q150 202 170 220" {...line} />
                <Path
                  d="M236 120 Q226 138 226 148 A10 10 0 0 0 246 148 Q246 138 236 120 Z"
                  fill="#96c8f0"
                />
              </>
            ) : mood === 'masak' ? (
              <Path d="M125 198 Q150 228 175 198" {...line} />
            ) : (
              <Path d="M130 200 Q150 220 170 200" {...line} />
            )}
          </>
        )}
      </G>
    </Svg>
  );
}