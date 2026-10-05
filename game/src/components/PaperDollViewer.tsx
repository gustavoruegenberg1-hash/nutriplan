import React from 'react';
import { GameCharacter, PaperDollLayers } from '../types/game';
import { Palette } from 'lucide-react';

interface PaperDollViewerProps {
  character: GameCharacter;
  onChangeLayers: (layers: PaperDollLayers) => void;
}

export const PaperDollViewer: React.FC<PaperDollViewerProps> = ({
  character,
  onChangeLayers,
}) => {
  const { paperDoll } = character;

  const skinTones = ['#FAD4B2', '#E2A772', '#C68642', '#8D5524', '#603913'];
  const hairColors = ['#1E293B', '#B91C1C', '#D97706', '#059669', '#2563EB', '#7C3AED'];
  const tops = [
    { id: 'tshirt', name: 'Camiseta Básica', color: '#3B82F6' },
    { id: 'hoodie', name: 'Moletom Arcano', color: '#8B5CF6' },
    { id: 'tank_top', name: 'Regata de Treino', color: '#EF4444' },
    { id: 'arcane_robe', name: 'Manto Alquímico', color: '#10B981' },
  ];
  const accessories = [
    { id: 'none', name: 'Nenhum' },
    { id: 'glasses', name: 'Óculos de Arcanista' },
    { id: 'headband', name: 'Faixa de Treino' },
  ];

  return (
    <div className="w-full flex flex-col md:flex-row items-center gap-6 p-6 bg-slate-900/90 rounded-3xl border border-slate-800 shadow-2xl">
      {/* Lado Esquerdo: Visualizador Close-up Paper-Doll (Estilo Ankama / Retrato de Perfil) */}
      <div className="flex flex-col items-center">
        <div className="relative w-64 h-80 bg-gradient-to-b from-slate-800 to-slate-950 rounded-2xl border-2 border-slate-700 p-4 shadow-inner flex items-center justify-center overflow-hidden">
          {/* Fundo de Aura com base no Status */}
          <div className="absolute inset-0 bg-radial from-teal-500/10 via-transparent to-transparent opacity-50" />

          {/* SVG Vetorial Paper-Doll em Camadas (Layer Stacking) */}
          <svg viewBox="0 0 200 260" className="w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]">
            <defs>
              {/* Sombra suave de chão */}
              <radialGradient id="shadowGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#000000" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* [Layer 1] Sombra de Base */}
            <ellipse cx="100" cy="245" rx="55" ry="12" fill="url(#shadowGrad)" />

            {/* [Layer 2] Base Corporal (Pernas + Tronco + Cabeça) */}
            {/* Pernas / Tom de Pele Base */}
            <rect x="75" y="160" width="18" height="60" rx="6" fill={paperDoll.skinTone} />
            <rect x="107" y="160" width="18" height="60" rx="6" fill={paperDoll.skinTone} />

            {/* [Layer 4 & 5] Parte Inferior & Calçados */}
            <rect x="73" y="160" width="22" height="42" rx="4" fill="#1e293b" />
            <rect x="105" y="160" width="22" height="42" rx="4" fill="#1e293b" />
            {/* Tênis */}
            <rect x="70" y="212" width="26" height="15" rx="5" fill="#f8fafc" stroke="#0f172a" strokeWidth="2" />
            <rect x="104" y="212" width="26" height="15" rx="5" fill="#f8fafc" stroke="#0f172a" strokeWidth="2" />

            {/* [Layer 6] Parte Superior (Tronco e Braços) */}
            {/* Braços */}
            <rect x="52" y="95" width="18" height="55" rx="7" fill={paperDoll.skinTone} />
            <rect x="130" y="95" width="18" height="55" rx="7" fill={paperDoll.skinTone} />
            {/* Torso / Roupa */}
            <path
              d="M 68 85 L 132 85 L 138 165 L 62 165 Z"
              fill={tops.find((t) => t.id === paperDoll.top)?.color || '#3b82f6'}
              stroke="#0f172a"
              strokeWidth="2"
            />

            {/* [Layer 7] Cabelo Traseiro */}
            <ellipse cx="100" cy="65" rx="42" ry="46" fill={paperDoll.hairColor} />

            {/* [Layer 2] Pescoço e Cabeça */}
            <rect x="88" y="70" width="24" height="22" rx="4" fill={paperDoll.skinTone} />
            <ellipse cx="100" cy="55" rx="34" ry="38" fill={paperDoll.skinTone} stroke="#0f172a" strokeWidth="1.5" />

            {/* [Layer 3] Olhos e Expressão (Estilo Ankama) */}
            <ellipse cx="88" cy="54" rx="5" ry="7" fill="#ffffff" />
            <ellipse cx="112" cy="54" rx="5" ry="7" fill="#ffffff" />
            <ellipse cx="90" cy="54" rx="3" ry="5" fill="#0f172a" />
            <ellipse cx="114" cy="54" rx="3" ry="5" fill="#0f172a" />
            {/* Brilho nos olhos */}
            <circle cx="91" cy="52" r="1.2" fill="#ffffff" />
            <circle cx="115" cy="52" r="1.2" fill="#ffffff" />
            {/* Sobrancelhas */}
            <path d="M 82 43 Q 89 40 96 44" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M 104 44 Q 111 40 118 43" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            {/* Sorriso */}
            <path d="M 94 67 Q 100 71 106 67" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" fill="none" />

            {/* [Layer 8] Cabelo Frontal / Franja Estilizada */}
            <path
              d="M 68 45 Q 85 20 100 18 Q 115 20 132 45 Q 115 32 100 35 Q 85 32 68 45 Z"
              fill={paperDoll.hairColor}
              stroke="#0f172a"
              strokeWidth="1.5"
            />

            {/* [Layer 9] Acessórios (Óculos ou Faixa) */}
            {paperDoll.accessories === 'glasses' && (
              <g stroke="#0f172a" strokeWidth="2.5" fill="rgba(56, 189, 248, 0.3)">
                <circle cx="88" cy="54" r="10" />
                <circle cx="112" cy="54" r="10" />
                <line x1="98" y1="54" x2="102" y2="54" />
              </g>
            )}
            {paperDoll.accessories === 'headband' && (
              <path d="M 67 36 Q 100 28 133 36" stroke="#ef4444" strokeWidth="6" strokeLinecap="round" fill="none" />
            )}

            {/* [Layer 10] Item Empunhado (Garrafa Térmica de Hidratação) */}
            <g transform="translate(138, 125)">
              <rect x="0" y="0" width="14" height="32" rx="4" fill="#06b6d4" stroke="#0f172a" strokeWidth="2" />
              <rect x="3" y="-5" width="8" height="6" rx="2" fill="#f8fafc" />
              <text x="7" y="18" textAnchor="middle" fontSize="10">💧</text>
            </g>
          </svg>
        </div>

        {/* Nome do Avatar e Título */}
        <div className="mt-3 text-center">
          <h3 className="text-base font-extrabold text-white flex items-center justify-center gap-1.5">
            {character.name}
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono">
              Nv. {character.level}
            </span>
          </h3>
          <p className="text-xs text-slate-400">{character.title}</p>
        </div>
      </div>

      {/* Lado Direito: Guarda-Roupa & Customização de Camadas (Paper-Doll) */}
      <div className="flex-1 w-full flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <Palette className="w-4 h-4 text-amber-400" />
          <h4 className="text-sm font-bold text-white">Guarda-Roupa & Estilização (Ankama Vetorial)</h4>
        </div>

        {/* 1. Tom de Pele */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">Tom de Pele:</label>
          <div className="flex gap-2">
            {skinTones.map((tone) => (
              <button
                key={tone}
                onClick={() => onChangeLayers({ ...paperDoll, skinTone: tone })}
                style={{ backgroundColor: tone }}
                className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 cursor-pointer ${
                  paperDoll.skinTone === tone ? 'border-amber-400 scale-110 shadow-md' : 'border-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* 2. Cor do Cabelo */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">Cor do Penteado:</label>
          <div className="flex gap-2">
            {hairColors.map((color) => (
              <button
                key={color}
                onClick={() => onChangeLayers({ ...paperDoll, hairColor: color })}
                style={{ backgroundColor: color }}
                className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 cursor-pointer ${
                  paperDoll.hairColor === color ? 'border-amber-400 scale-110 shadow-md' : 'border-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* 3. Vestimenta Superior (Parte de Cima) */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">Vestimenta Superior:</label>
          <div className="grid grid-cols-2 gap-2">
            {tops.map((top) => (
              <button
                key={top.id}
                onClick={() => onChangeLayers({ ...paperDoll, top: top.id })}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-left flex items-center justify-between cursor-pointer ${
                  paperDoll.top === top.id
                    ? 'bg-slate-800 border-amber-400 text-amber-300 shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span>{top.name}</span>
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: top.color }} />
              </button>
            ))}
          </div>
        </div>

        {/* 4. Acessórios de Cabeça */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">Acessório de Cabeça:</label>
          <div className="flex gap-2">
            {accessories.map((acc) => (
              <button
                key={acc.id}
                onClick={() => onChangeLayers({ ...paperDoll, accessories: acc.id })}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  paperDoll.accessories === acc.id
                    ? 'bg-slate-800 border-amber-400 text-amber-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {acc.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
