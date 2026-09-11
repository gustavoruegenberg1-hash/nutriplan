import React, { useState } from 'react';
import { PetSpecies, PetEquipped, PetVitality } from '../../types/gamification';
import { triggerHapticFeedback } from '../../utils/mobile';

interface PetAvatarProps {
  species: PetSpecies;
  name: string;
  vitality: PetVitality;
  equipped?: PetEquipped;
  streakDays?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
  onPet?: () => void;
}

export const PetAvatar: React.FC<PetAvatarProps> = ({
  species,
  name,
  vitality,
  equipped,
  streakDays = 1,
  size = 'md',
  interactive = true,
  onPet,
}) => {
  const [isBouncing, setIsBouncing] = useState(false);
  const [showHeart, setShowHeart] = useState(false);

  // Determina emoção
  const avgVitality = (vitality.hydration + vitality.nutrition + vitality.workout + vitality.wisdom) / 4;
  const isSuper = streakDays >= 3 || avgVitality >= 80;
  const isThirsty = vitality.hydration < 30;
  const isHungry = vitality.nutrition < 30;

  const handleInteraction = () => {
    if (!interactive) return;
    triggerHapticFeedback();
    setIsBouncing(true);
    setShowHeart(true);
    setTimeout(() => setIsBouncing(false), 500);
    setTimeout(() => setShowHeart(false), 1200);
    if (onPet) onPet();
  };

  const sizeClasses = {
    sm: 'w-20 h-20',
    md: 'w-36 h-36',
    lg: 'w-48 h-48',
    xl: 'w-64 h-64',
  }[size];

  return (
    <div
      onClick={handleInteraction}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (onPet) onPet();
        }
      }}
      aria-label={`Fazer carinho no mascote`}
      className={`relative inline-flex items-center justify-center select-none ${
        interactive ? 'cursor-pointer' : ''
      }`}
      title={`Acariciar ${name}`}
    >
      {/* Aura Super Saiyajin / Em Chamas */}
      {isSuper && (
        <div className="absolute inset-0 -m-3 rounded-full bg-gradient-to-t from-amber-500/25 via-emerald-500/20 to-teal-400/10 blur-xl animate-pulse pointer-events-none" />
      )}

      {/* Coração flutuante ao tocar */}
      {showHeart && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-2xl animate-bounce pointer-events-none transition-all duration-700 z-30">
          ❤️
        </div>
      )}

      {/* SVG Principal do Mascote */}
      <div
        className={`${sizeClasses} relative transition-transform duration-300 ${
          isBouncing ? 'scale-110 -translate-y-2' : 'hover:scale-105'
        }`}
      >
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full drop-shadow-xl"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Sombras da base */}
          <ellipse cx="100" cy="180" rx="45" ry="10" fill="#000000" fillOpacity="0.25" />

          {/* ESPÉCIE: DRACO (Dragãozinho Verde / Esmeralda) */}
          {species === 'draco' && (
            <g>
              {/* Asas */}
              <path
                d="M 50 110 C 25 90 20 60 45 65 C 55 67 65 85 75 105 Z"
                fill="#059669"
                className="animate-pulse"
              />
              <path
                d="M 150 110 C 175 90 180 60 155 65 C 145 67 135 85 125 105 Z"
                fill="#059669"
                className="animate-pulse"
              />
              {/* Cauda */}
              <path d="M 60 155 C 30 160 20 180 40 185 C 55 188 70 170 80 160 Z" fill="#10B981" />
              {/* Corpo */}
              <ellipse cx="100" cy="135" rx="42" ry="40" fill="#10B981" />
              {/* Barriga suave */}
              <ellipse cx="100" cy="142" rx="28" ry="26" fill="#A7F3D0" />

              {/* Chifres */}
              <polygon points="75,65 65,35 85,55" fill="#F59E0B" />
              <polygon points="125,65 135,35 115,55" fill="#F59E0B" />

              {/* Cabeça */}
              <circle cx="100" cy="85" r="38" fill="#10B981" />
              <circle cx="85" cy="80" r="10" fill="#34D399" opacity="0.5" />
              <circle cx="115" cy="80" r="10" fill="#34D399" opacity="0.5" />

              {/* Olhos expressivos */}
              <ellipse cx="85" cy="82" rx="6" ry="8" fill="#064E3B" />
              <ellipse cx="115" cy="82" rx="6" ry="8" fill="#064E3B" />
              <circle cx="83" cy="79" r="2.5" fill="#FFFFFF" />
              <circle cx="113" cy="79" r="2.5" fill="#FFFFFF" />

              {/* Focinho e Boca */}
              <circle cx="95" cy="94" r="1.5" fill="#064E3B" />
              <circle cx="105" cy="94" r="1.5" fill="#064E3B" />
              <path
                d={isHungry ? 'M 92 104 Q 100 98 108 104' : 'M 92 98 Q 100 108 108 98'}
                stroke="#064E3B"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />

              {/* Bochechas rosadas */}
              <circle cx="76" cy="92" r="5" fill="#F43F5E" opacity="0.3" />
              <circle cx="124" cy="92" r="5" fill="#F43F5E" opacity="0.3" />

              {/* Braços com mini munhequeiras */}
              <ellipse cx="64" cy="132" rx="9" ry="14" fill="#059669" transform="rotate(-15 64 132)" />
              <ellipse cx="136" cy="132" rx="9" ry="14" fill="#059669" transform="rotate(15 136 132)" />

              {/* Perninhas */}
              <ellipse cx="80" cy="172" rx="14" ry="9" fill="#059669" />
              <ellipse cx="120" cy="172" rx="14" ry="9" fill="#059669" />
            </g>
          )}

          {/* ESPÉCIE: KITSUNE (Raposa Ágil / Laranja e Branco) */}
          {species === 'kitsune' && (
            <g>
              {/* Cauda peluda volumosa */}
              <path
                d="M 135 140 C 180 130 190 85 165 75 C 145 68 135 110 120 135 Z"
                fill="#EA580C"
              />
              <path
                d="M 165 75 C 160 85 150 90 142 85 C 148 70 160 68 165 75 Z"
                fill="#FFFFFF"
              />

              {/* Corpo */}
              <ellipse cx="100" cy="138" rx="38" ry="36" fill="#F97316" />
              <ellipse cx="100" cy="144" rx="24" ry="24" fill="#FFF7ED" />

              {/* Orelhas pontudas */}
              <polygon points="70,65 55,20 85,45" fill="#EA580C" />
              <polygon points="70,60 62,32 80,47" fill="#FDBA74" />
              <polygon points="130,65 145,20 115,45" fill="#EA580C" />
              <polygon points="130,60 138,32 120,47" fill="#FDBA74" />

              {/* Cabeça */}
              <circle cx="100" cy="85" r="36" fill="#F97316" />
              {/* Bochechas brancas de raposa */}
              <path d="M 68 85 Q 85 105 100 95 Q 115 105 132 85 Q 120 115 100 110 Q 80 115 68 85 Z" fill="#FFF7ED" />

              {/* Olhos delineados e expressivos */}
              <ellipse cx="85" cy="82" rx="6" ry="7" fill="#431407" />
              <ellipse cx="115" cy="82" rx="6" ry="7" fill="#431407" />
              <circle cx="83" cy="80" r="2.5" fill="#FFFFFF" />
              <circle cx="113" cy="80" r="2.5" fill="#FFFFFF" />

              {/* Focinho preto fofo */}
              <ellipse cx="100" cy="95" rx="3" ry="2" fill="#431407" />
              <path
                d="M 94 100 Q 100 106 106 100"
                stroke="#431407"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />

              {/* Patinhas */}
              <ellipse cx="70" cy="140" rx="8" ry="12" fill="#C2410C" />
              <ellipse cx="130" cy="140" rx="8" ry="12" fill="#C2410C" />
              <ellipse cx="82" cy="172" rx="12" ry="8" fill="#431407" />
              <ellipse cx="118" cy="172" rx="12" ry="8" fill="#431407" />
            </g>
          )}

          {/* ESPÉCIE: PANDA (Panda Zen / Musculoso e Carismático) */}
          {species === 'panda' && (
            <g>
              {/* Orelhas pretas arredondadas */}
              <circle cx="68" cy="50" r="14" fill="#1E293B" />
              <circle cx="132" cy="50" r="14" fill="#1E293B" />

              {/* Corpo branco volumoso */}
              <ellipse cx="100" cy="138" rx="44" ry="38" fill="#F8FAFC" />

              {/* Faixa preta do peito / ombros de panda */}
              <path
                d="M 60 120 C 75 135 125 135 140 120 C 145 135 145 150 140 160 C 125 155 75 155 60 160 Z"
                fill="#1E293B"
              />

              {/* Cabeça */}
              <circle cx="100" cy="82" r="38" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />

              {/* Manchas pretas dos olhos estilo panda */}
              <ellipse cx="82" cy="80" rx="11" ry="14" fill="#1E293B" transform="rotate(-15 82 80)" />
              <ellipse cx="118" cy="80" rx="11" ry="14" fill="#1E293B" transform="rotate(15 118 80)" />

              {/* Olhos brilhantes */}
              <circle cx="82" cy="79" r="4.5" fill="#FFFFFF" />
              <circle cx="118" cy="79" r="4.5" fill="#FFFFFF" />
              <circle cx="82" cy="78" r="2.5" fill="#0F172A" />
              <circle cx="118" cy="78" r="2.5" fill="#0F172A" />

              {/* Focinho */}
              <ellipse cx="100" cy="92" rx="4" ry="3" fill="#1E293B" />
              <path
                d="M 94 97 Q 100 104 106 97"
                stroke="#1E293B"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />

              {/* Braços fortes */}
              <ellipse cx="60" cy="130" rx="12" ry="16" fill="#1E293B" transform="rotate(-20 60 130)" />
              <ellipse cx="140" cy="130" rx="12" ry="16" fill="#1E293B" transform="rotate(20 140 130)" />

              {/* Perninhas */}
              <ellipse cx="78" cy="172" rx="14" ry="10" fill="#1E293B" />
              <ellipse cx="122" cy="172" rx="14" ry="10" fill="#1E293B" />
            </g>
          )}

          {/* ACESSÓRIOS EQUIPADOS (HEAD) */}
          {equipped?.head === 'item_headband' && (
            <path
              d="M 64 68 Q 100 62 136 68 L 134 76 Q 100 70 66 76 Z"
              fill="#EF4444"
              stroke="#991B1B"
              strokeWidth="1"
            />
          )}

          {equipped?.head === 'item_cap' && (
            <g>
              <ellipse cx="100" cy="56" rx="34" ry="16" fill="#2563EB" />
              <path d="M 90 56 Q 140 50 155 64 Q 120 68 95 62 Z" fill="#1D4ED8" />
            </g>
          )}

          {equipped?.head === 'item_glasses' && (
            <g>
              <rect x="70" y="74" width="26" height="15" rx="3" fill="#0F172A" stroke="#334155" strokeWidth="2" />
              <rect x="104" y="74" width="26" height="15" rx="3" fill="#0F172A" stroke="#334155" strokeWidth="2" />
              <line x1="96" y1="80" x2="104" y2="80" stroke="#334155" strokeWidth="2" />
            </g>
          )}

          {equipped?.head === 'item_crown' && (
            <polygon
              points="75,56 70,30 88,44 100,24 112,44 130,30 125,56"
              fill="#F59E0B"
              stroke="#B45309"
              strokeWidth="2"
            />
          )}

          {/* ACESSÓRIOS EQUIPADOS (HELD) */}
          {equipped?.held === 'item_dumbbell' && (
            <g transform="translate(136, 122)">
              <rect x="0" y="8" width="24" height="4" fill="#94A3B8" />
              <rect x="-4" y="2" width="6" height="16" rx="2" fill="#F59E0B" />
              <rect x="22" y="2" width="6" height="16" rx="2" fill="#F59E0B" />
            </g>
          )}

          {equipped?.held === 'item_shaker' && (
            <g transform="translate(138, 120)">
              <rect x="0" y="4" width="14" height="20" rx="3" fill="#06B6D4" />
              <rect x="1" y="0" width="12" height="4" rx="2" fill="#0891B2" />
              <circle cx="7" cy="14" r="3" fill="#FFFFFF" opacity="0.6" />
            </g>
          )}

          {equipped?.held === 'item_apple' && (
            <g transform="translate(140, 122)">
              <circle cx="8" cy="8" r="8" fill="#EF4444" />
              <path d="M 8 0 Q 12 2 10 6" stroke="#15803D" strokeWidth="2" fill="none" />
            </g>
          )}

          {/* Gotas de Sede se Hidratação < 30% */}
          {isThirsty && (
            <g className="animate-bounce">
              <path
                d="M 136 65 C 136 60 142 52 142 52 C 142 52 148 60 148 65 C 148 69 145 72 142 72 C 139 72 136 69 136 65 Z"
                fill="#38BDF8"
              />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};
