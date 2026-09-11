import React from 'react';
import { HeroCustomization, EquipmentItem, EquipmentSlot } from '../../types/idleGame';

interface HeroAvatarProps {
  customization: HeroCustomization;
  equipped?: Partial<Record<EquipmentSlot, EquipmentItem | null>>;
  weightKg?: number | null;
  heightCm?: number | null;
  bodyFatPct?: number | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isAttacking?: boolean;
  isHit?: boolean;
}

export const HeroAvatar: React.FC<HeroAvatarProps> = ({
  customization,
  equipped = {},
  weightKg = 75,
  heightCm = 175,
  bodyFatPct = null,
  size = 'md',
  isAttacking = false,
  isHit = false,
}) => {
  const gender = customization.gender || 'male';
  const skin = customization.skinTone || '#F3C5A5';
  const hairColor = customization.hairColor || '#2B1B17';
  const beardColor = customization.beardColor || hairColor;

  // --- CÁLCULO DA MORFOLOGIA BIOMÉTRICA VETORIAL ---
  const height = heightCm && heightCm > 120 ? heightCm : 175;
  const weight = weightKg && weightKg > 35 ? weightKg : 75;
  const heightM = height / 100;
  const bmi = weight / (heightM * heightM);

  // Se o BF% não foi informado, estima baseado em sexo e IMC de forma coerente
  const bf =
    bodyFatPct && bodyFatPct >= 3 && bodyFatPct <= 60
      ? bodyFatPct
      : gender === 'female'
      ? Math.max(16, Math.min(42, 1.2 * bmi + 0.23 * 28 - 5.4))
      : Math.max(8, Math.min(36, 1.2 * bmi + 0.23 * 28 - 16.2));

  // Modificadores de proporção
  const shoulderWidth = Math.max(34, Math.min(52, 40 + (bmi - 22) * 0.8));
  const waistWidth = Math.max(22, Math.min(46, 28 + (bmi - 22) * 1.1 + (bf - 15) * 0.4));
  const armThickness = Math.max(9, Math.min(17, 12 + (bmi - 22) * 0.4));
  const isAthleticVcut = bf <= (gender === 'female' ? 21 : 14);

  const sizeClasses = {
    sm: 'w-24 h-32',
    md: 'w-44 h-60',
    lg: 'w-56 h-80',
    xl: 'w-72 h-96',
  }[size];

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${sizeClasses} ${
        isAttacking ? 'animate-bounce' : ''
      } ${isHit ? 'animate-pulse scale-95' : ''}`}
    >
      <svg
        viewBox="0 0 200 240"
        className="w-full h-full drop-shadow-2xl transition-transform duration-300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Sombra dos pés */}
        <ellipse cx="100" cy="230" rx="38" ry="8" fill="#000000" fillOpacity="0.35" />

        {/* --- PERNAS & BOTAS --- */}
        <g id="legs">
          {/* Perna Esquerda */}
          <path
            d={`M ${100 - waistWidth / 3} 150 L ${80} 210 L ${92} 210 L ${100 - waistWidth / 8} 150 Z`}
            fill={equipped.legs ? '#1E293B' : skin}
            stroke="#0F172A"
            strokeWidth="1"
          />
          {/* Perna Direita */}
          <path
            d={`M ${100 + waistWidth / 8} 150 L ${108} 210 L ${120} 210 L ${100 + waistWidth / 3} 150 Z`}
            fill={equipped.legs ? '#1E293B' : skin}
            stroke="#0F172A"
            strokeWidth="1"
          />

          {/* Botas Equipadas */}
          {equipped.boots ? (
            <g id="boots">
              <path d="M 76 205 L 94 205 L 96 226 L 72 226 Z" fill="#059669" stroke="#064E3B" strokeWidth="1.5" />
              <path d="M 106 205 L 124 205 L 128 226 L 104 226 Z" fill="#059669" stroke="#064E3B" strokeWidth="1.5" />
            </g>
          ) : (
            <g id="barefoot">
              <ellipse cx="82" cy="222" rx="9" ry="5" fill={skin} />
              <ellipse cx="118" cy="222" rx="9" ry="5" fill={skin} />
            </g>
          )}
        </g>

        {/* --- TRONCO & TÓRAX PROPORCIONAL AO IMC E % BF --- */}
        <g id="torso">
          {/* Silhueta do Tronco */}
          <path
            d={`M ${100 - shoulderWidth} 78 
                Q ${100 - waistWidth} 118 ${100 - waistWidth / 1.1} 150 
                L ${100 + waistWidth / 1.1} 150 
                Q ${100 + waistWidth} 118 ${100 + shoulderWidth} 78 Z`}
            fill={equipped.chest ? '#334155' : skin}
            stroke="#0F172A"
            strokeWidth="1.5"
          />

          {/* Peitoral e Definição Muscular (apenas se sem armadura ou se BF baixo) */}
          {!equipped.chest && (
            <g id="muscle_definition">
              {/* Linhas peitorais */}
              <path
                d={`M ${100 - shoulderWidth * 0.7} 92 Q 100 102 ${100 + shoulderWidth * 0.7} 92`}
                stroke="#000000"
                strokeWidth="1.2"
                strokeOpacity="0.18"
              />
              {/* Linha vertical central do abdômen */}
              <line x1="100" y1="94" x2="100" y2="142" stroke="#000000" strokeWidth="1.2" strokeOpacity="0.15" />

              {/* Gomos abdominais se BF for atlético (<14% M / <21% F) */}
              {isAthleticVcut && (
                <g stroke="#000000" strokeWidth="1.2" strokeOpacity="0.22">
                  <line x1="92" y1="110" x2="108" y2="110" />
                  <line x1="93" y1="124" x2="107" y2="124" />
                  <line x1="95" y1="136" x2="105" y2="136" />
                  {/* V-Taper pélvico */}
                  <path d="M 88 142 L 100 150 L 112 142" fill="none" />
                </g>
              )}
            </g>
          )}

          {/* Peitoral de Armadura Equipado */}
          {equipped.chest && (
            <g id="chest_armor">
              <path
                d={`M ${100 - shoulderWidth * 0.9} 82 L ${100 + shoulderWidth * 0.9} 82 L ${100 + waistWidth * 0.8} 145 L ${100 - waistWidth * 0.8} 145 Z`}
                fill="#475569"
                stroke="#10B981"
                strokeWidth="1.5"
              />
              <circle cx="100" cy="112" r="8" fill="#10B981" fillOpacity="0.4" />
              <line x1="100" y1="92" x2="100" y2="136" stroke="#10B981" strokeWidth="1.5" />
            </g>
          )}
        </g>

        {/* --- BRAÇOS & ARMA EQUIPADA --- */}
        <g id="arms">
          {/* Braço Esquerdo (Escudo / Guarda) */}
          <path
            d={`M ${100 - shoulderWidth} 80 Q ${100 - shoulderWidth - armThickness} 115 ${95 - shoulderWidth} 145`}
            stroke={skin}
            strokeWidth={armThickness}
            strokeLinecap="round"
          />

          {/* Braço Direito com Arma */}
          <g
            className={`transition-transform duration-200 origin-[140px_80px] ${
              isAttacking ? 'rotate-45' : ''
            }`}
          >
            <path
              d={`M ${100 + shoulderWidth} 80 Q ${100 + shoulderWidth + armThickness} 115 ${105 + shoulderWidth} 145`}
              stroke={skin}
              strokeWidth={armThickness}
              strokeLinecap="round"
            />

            {/* Mão direita segurando arma */}
            <circle cx={105 + shoulderWidth} cy="148" r="6" fill={skin} />

            {/* ARMA EQUIPADA */}
            {equipped.weapon && (
              <g id="weapon" transform={`translate(${102 + shoulderWidth}, 110)`}>
                {/* Lâmina / Espada do Halter */}
                <rect x="-3" y="-50" width="6" height="60" rx="2" fill="#E2E8F0" stroke="#475569" strokeWidth="1" />
                <rect x="-14" y="10" width="28" height="5" rx="2" fill="#F59E0B" />
                <circle cx="0" cy="22" r="5" fill="#D97706" />
                <path d="M 0 -58 L -5 -48 L 5 -48 Z" fill="#E2E8F0" />
              </g>
            )}
          </g>
        </g>

        {/* --- CABEÇA, ROSTO & EXPRESSÃO --- */}
        <g id="head">
          {/* Pescoço */}
          <rect x="92" y="66" width="16" height="18" fill={skin} />

          {/* Cabeça */}
          <ellipse cx="100" cy="52" rx="22" ry="26" fill={skin} stroke="#0F172A" strokeWidth="0.8" />

          {/* Olhos e Sobrancelhas */}
          <ellipse cx="91" cy="50" rx="3" ry="3.5" fill="#0F172A" />
          <ellipse cx="109" cy="50" rx="3" ry="3.5" fill="#0F172A" />
          <circle cx="90" cy="49" r="1" fill="#FFFFFF" />
          <circle cx="108" cy="49" r="1" fill="#FFFFFF" />
          {/* Sobrancelhas resolutas de guerreiro */}
          <line x1="86" y1="44" x2="95" y2="45" stroke={hairColor} strokeWidth="2" strokeLinecap="round" />
          <line x1="105" y1="45" x2="114" y2="44" stroke={hairColor} strokeWidth="2" strokeLinecap="round" />

          {/* Nariz & Boca */}
          <path d="M 100 52 L 98 58 L 102 58" stroke="#000000" strokeWidth="1.2" strokeOpacity="0.2" fill="none" />
          <path d="M 96 64 Q 100 68 104 64" stroke="#0F172A" strokeWidth="1.5" strokeLinecap="round" fill="none" />

          {/* --- ESTILOS DE BARBA --- */}
          {customization.beardStyle === 'stubble' && (
            <path
              d="M 86 58 Q 100 78 114 58 Q 114 74 100 76 Q 86 74 86 58 Z"
              fill={beardColor}
              fillOpacity="0.25"
            />
          )}

          {customization.beardStyle === 'full' && (
            <path
              d="M 80 52 Q 100 84 120 52 Q 122 78 100 82 Q 78 78 80 52 Z"
              fill={beardColor}
            />
          )}

          {customization.beardStyle === 'goatee' && (
            <path
              d="M 94 62 Q 100 76 106 62 Q 106 75 100 78 Q 94 75 94 62 Z"
              fill={beardColor}
            />
          )}

          {customization.beardStyle === 'mustache' && (
            <path
              d="M 93 61 Q 100 64 107 61 Q 104 65 96 65 Z"
              fill={beardColor}
            />
          )}

          {/* --- ESTILOS DE CABELO --- */}
          {customization.hairStyle === 'short' && (
            <path
              d="M 77 48 C 76 28 88 22 100 22 C 112 22 124 28 123 48 C 118 36 108 34 100 34 C 92 34 82 36 77 48 Z"
              fill={hairColor}
            />
          )}

          {customization.hairStyle === 'buzz' && (
            <ellipse cx="100" cy="38" rx="21" ry="14" fill={hairColor} fillOpacity="0.35" />
          )}

          {customization.hairStyle === 'wavy' && (
            <g fill={hairColor}>
              <path d="M 76 52 C 70 30 90 20 100 20 C 115 20 128 30 124 52 C 122 34 112 30 100 30 C 88 30 78 34 76 52 Z" />
              <path d="M 74 46 Q 70 65 74 72 Q 78 60 76 46 Z" />
              <path d="M 126 46 Q 130 65 126 72 Q 122 60 124 46 Z" />
            </g>
          )}

          {customization.hairStyle === 'ponytail' && (
            <g fill={hairColor}>
              <path d="M 78 48 C 76 28 88 22 100 22 C 112 22 124 28 122 48 C 118 34 108 32 100 32 C 92 32 82 34 78 48 Z" />
              <path d="M 116 36 C 132 30 144 45 140 68 C 132 55 124 48 116 36 Z" />
            </g>
          )}

          {customization.hairStyle === 'dreadlocks' && (
            <g stroke={hairColor} strokeWidth="4" strokeLinecap="round">
              <line x1="84" y1="36" x2="74" y2="64" />
              <line x1="92" y1="30" x2="80" y2="70" />
              <line x1="100" y1="26" x2="100" y2="72" />
              <line x1="108" y1="30" x2="120" y2="70" />
              <line x1="116" y1="36" x2="126" y2="64" />
            </g>
          )}

          {customization.hairStyle === 'afro' && (
            <circle cx="100" cy="42" r="30" fill={hairColor} />
          )}

          {customization.hairStyle === 'pompadour' && (
            <path
              d="M 76 44 C 74 16 95 14 106 14 C 122 14 128 26 124 44 C 118 28 108 26 100 26 C 90 26 82 30 76 44 Z"
              fill={hairColor}
            />
          )}

          {/* ELMO OU DIADEMA EQUIPADO */}
          {equipped.helmet && (
            <g id="helmet">
              <path
                d="M 75 42 C 75 22 88 18 100 18 C 112 18 125 22 125 42 L 123 54 L 115 52 L 115 42 L 85 42 L 85 52 L 77 54 Z"
                fill="#1E293B"
                stroke="#10B981"
                strokeWidth="1.5"
              />
              <polygon points="96,18 100,8 104,18" fill="#F59E0B" />
            </g>
          )}
        </g>

        {/* AMULETO NO PESCOÇO */}
        {equipped.amulet && (
          <g id="amulet">
            <path d="M 90 76 Q 100 90 110 76" stroke="#F59E0B" strokeWidth="1.5" fill="none" />
            <circle cx="100" cy="88" r="4" fill="#06B6D4" stroke="#F59E0B" strokeWidth="1" />
          </g>
        )}
      </svg>
    </div>
  );
};
