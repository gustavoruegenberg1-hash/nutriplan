import React, { useState } from 'react';
import { FurnitureItem, GameCharacter } from '../types/game';
import { Sparkles, Info } from 'lucide-react';

interface IsometricRoomProps {
  character: GameCharacter;
  furniture: FurnitureItem[];
  onInteractFurniture: (item: FurnitureItem) => void;
}

export const IsometricRoom: React.FC<IsometricRoomProps> = ({
  character,
  furniture,
  onInteractFurniture,
}) => {
  const GRID_SIZE = 7;
  const TILE_WIDTH = 72;
  const TILE_HEIGHT = 36;
  const ORIGIN_X = 260; // Ponto central no canvas SVG
  const ORIGIN_Y = 110;

  const [hoveredTile, setHoveredTile] = useState<{ x: number; y: number } | null>(null);
  const [avatarPos, setAvatarPos] = useState({ x: 3, y: 3 });
  const [selectedFurniture, setSelectedFurniture] = useState<FurnitureItem | null>(null);

  // Projeção isométrica 2:1 clássica (Dofus/Ankama)
  const toScreen = (gx: number, gy: number) => {
    const sx = ORIGIN_X + (gx - gy) * (TILE_WIDTH / 2);
    const sy = ORIGIN_Y + (gx + gy) * (TILE_HEIGHT / 2);
    return { sx, sy };
  };

  // Caminho do polígono do losango isométrico
  const getTilePoints = (gx: number, gy: number) => {
    const { sx, sy } = toScreen(gx, gy);
    const top = `${sx},${sy}`;
    const right = `${sx + TILE_WIDTH / 2},${sy + TILE_HEIGHT / 2}`;
    const bottom = `${sx},${sy + TILE_HEIGHT}`;
    const left = `${sx - TILE_WIDTH / 2},${sy + TILE_HEIGHT / 2}`;
    return `${top} ${right} ${bottom} ${left}`;
  };

  const handleTileClick = (x: number, y: number) => {
    const furn = furniture.find((f) => f.tileX === x && f.tileY === y);
    if (furn) {
      // Posiciona o avatar no ladrilho adjacente ao móvel
      setAvatarPos({ x: Math.min(6, Math.max(0, furn.tileX + (furn.tileX === 6 ? -1 : 1))), y: furn.tileY });
      setSelectedFurniture(furn);
      onInteractFurniture(furn);
    } else {
      setAvatarPos({ x, y });
      setSelectedFurniture(null);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-radial from-slate-900/90 via-[#0B0F19] to-[#06090E] rounded-3xl border border-slate-800 shadow-2xl overflow-hidden p-4">
      {/* HUD Superior da Sala */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-700 text-xs">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
        <span className="font-bold text-slate-200">Quarto Urbano Arcano</span>
        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded-full">
          Grid 7x7 (2:1 Dimétrico)
        </span>
      </div>

      {/* Dica interativa */}
      <div className="absolute top-4 right-4 z-20 hidden sm:flex items-center gap-1.5 text-slate-400 text-[11px] bg-slate-900/70 px-3 py-1 rounded-lg border border-slate-800">
        <Info className="w-3.5 h-3.5 text-sky-400" />
        <span>Clique nos ladrilhos para andar ou nos móveis para ver bônus</span>
      </div>

      {/* Renderização Isométrica Vetorial SVG */}
      <div className="w-full max-w-[620px] aspect-[4/3] flex items-center justify-center">
        <svg viewBox="0 0 520 400" className="w-full h-full drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)]">
          <defs>
            <linearGradient id="tileGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
            <linearGradient id="wallGradientL" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0b1120" />
            </linearGradient>
            <linearGradient id="wallGradientR" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="100%" stopColor="#111827" />
            </linearGradient>
          </defs>

          {/* Paredes Isométricas do Quarto */}
          {/* Parede Esquerda */}
          <polygon
            points={`
              ${ORIGIN_X},${ORIGIN_Y}
              ${ORIGIN_X - (GRID_SIZE * TILE_WIDTH) / 2},${ORIGIN_Y + (GRID_SIZE * TILE_HEIGHT) / 2}
              ${ORIGIN_X - (GRID_SIZE * TILE_WIDTH) / 2},${ORIGIN_Y + (GRID_SIZE * TILE_HEIGHT) / 2 - 130}
              ${ORIGIN_X},${ORIGIN_Y - 130}
            `}
            fill="url(#wallGradientL)"
            stroke="#334155"
            strokeWidth="1.5"
            opacity="0.85"
          />
          {/* Parede Direita */}
          <polygon
            points={`
              ${ORIGIN_X},${ORIGIN_Y}
              ${ORIGIN_X + (GRID_SIZE * TILE_WIDTH) / 2},${ORIGIN_Y + (GRID_SIZE * TILE_HEIGHT) / 2}
              ${ORIGIN_X + (GRID_SIZE * TILE_WIDTH) / 2},${ORIGIN_Y + (GRID_SIZE * TILE_HEIGHT) / 2 - 130}
              ${ORIGIN_X},${ORIGIN_Y - 130}
            `}
            fill="url(#wallGradientR)"
            stroke="#475569"
            strokeWidth="1.5"
            opacity="0.85"
          />

          {/* Grid de Pisos Isométricos */}
          {Array.from({ length: GRID_SIZE }).map((_, gy) =>
            Array.from({ length: GRID_SIZE }).map((_, gx) => {
              const isHovered = hoveredTile?.x === gx && hoveredTile?.y === gy;
              const hasFurn = furniture.some((f) => f.tileX === gx && f.tileY === gy);
              const isAvatarTile = avatarPos.x === gx && avatarPos.y === gy;

              return (
                <polygon
                  key={`tile-${gx}-${gy}`}
                  points={getTilePoints(gx, gy)}
                  fill={
                    isAvatarTile
                      ? '#0d9488'
                      : isHovered
                      ? '#38bdf8'
                      : hasFurn
                      ? '#1e293b'
                      : 'url(#tileGradient)'
                  }
                  stroke={isHovered ? '#7dd3fc' : '#334155'}
                  strokeWidth={isHovered ? '2' : '0.8'}
                  opacity={isHovered ? 0.95 : 0.8}
                  className="cursor-pointer transition-colors duration-150"
                  onMouseEnter={() => setHoveredTile({ x: gx, y: gy })}
                  onMouseLeave={() => setHoveredTile(null)}
                  onClick={() => handleTileClick(gx, gy)}
                />
              );
            })
          )}

          {/* Renderização de Móveis e Avatar com Ordenação de Profundidade (Y-Sorting) */}
          {furniture.map((item) => {
            const { sx, sy } = toScreen(item.tileX, item.tileY);
            const isSelected = selectedFurniture?.id === item.id;

            return (
              <g
                key={item.id}
                className="cursor-pointer transition-transform hover:scale-105"
                onClick={() => {
                  setSelectedFurniture(item);
                  onInteractFurniture(item);
                }}
              >
                {/* Sombra do Móvel */}
                <ellipse cx={sx} cy={sy + 18} rx="22" ry="11" fill="#000000" opacity="0.4" />

                {/* Base do Móvel no Grid */}
                <rect
                  x={sx - 18}
                  y={sy - 15}
                  width="36"
                  height="30"
                  rx="6"
                  fill={item.color}
                  stroke={isSelected ? '#f59e0b' : '#64748b'}
                  strokeWidth={isSelected ? '2.5' : '1.2'}
                  className="filter drop-shadow-md"
                />

                {/* Ícone Representativo */}
                <text
                  x={sx}
                  y={sy + 5}
                  textAnchor="middle"
                  fontSize="16"
                  className="select-none pointer-events-none"
                >
                  {item.icon}
                </text>
              </g>
            );
          })}

          {/* Avatar no Grid Isométrico (Estilo Ankama Chibi com Sombra) */}
          {(() => {
            const isSleeping = character.sleep?.isSleeping;
            // Se estiver dormindo, posiciona sobre a cama (1, 1)
            const targetX = isSleeping ? 1 : avatarPos.x;
            const targetY = isSleeping ? 1 : avatarPos.y;
            const { sx, sy } = toScreen(targetX, targetY);

            if (isSleeping) {
              return (
                <g className="transition-all duration-500 pointer-events-none">
                  {/* Avatar Deitado na Cama */}
                  <rect
                    x={sx - 15}
                    y={sy - 8}
                    width="30"
                    height="12"
                    rx="4"
                    fill={character.paperDoll.skinTone}
                    transform={`rotate(-20 ${sx} ${sy})`}
                  />
                  {/* Cobertor Alquímico */}
                  <rect
                    x={sx - 10}
                    y={sy - 4}
                    width="24"
                    height="12"
                    rx="3"
                    fill="#3b82f6"
                    opacity="0.9"
                    transform={`rotate(-20 ${sx} ${sy})`}
                  />
                  {/* Balão Zzz animado */}
                  <g transform={`translate(${sx + 10}, ${sy - 22})`}>
                    <rect x="-18" y="-14" width="36" height="18" rx="8" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1.5" />
                    <text x="0" y="-1" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#a5b4fc" className="animate-pulse">
                      Zzz... ✨
                    </text>
                  </g>
                </g>
              );
            }

            return (
              <g className="transition-all duration-300 pointer-events-none">
                {/* Sombra elíptica do personagem */}
                <ellipse cx={sx} cy={sy + 20} rx="14" ry="7" fill="#000000" opacity="0.6" />

                {/* Efeito Aura se estiver energizado */}
                {character.statusEffect === 'energized' && (
                  <circle cx={sx} cy={sy - 10} r="24" fill="#10b981" opacity="0.25" className="animate-pulse" />
                )}

                {/* Corpo do Avatar Isométrico */}
                {/* Pernas */}
                <rect x={sx - 6} y={sy - 4} width="5" height="12" rx="2" fill="#3b82f6" />
                <rect x={sx + 1} y={sy - 4} width="5" height="12" rx="2" fill="#3b82f6" />
                {/* Tronco */}
                <rect x={sx - 8} y={sy - 18} width="16" height="16" rx="4" fill="#ef4444" />
                {/* Cabeça */}
                <circle cx={sx} cy={sy - 26} r="10" fill={character.paperDoll.skinTone} />
                {/* Cabelo */}
                <path
                  d={`M ${sx - 10} ${sy - 28} Q ${sx} ${sy - 38} ${sx + 10} ${sy - 28} Z`}
                  fill={character.paperDoll.hairColor}
                />
                {/* Olhos estilo Ankama */}
                <circle cx={sx - 3} cy={sy - 26} r="1.5" fill="#0f172a" />
                <circle cx={sx + 3} cy={sy - 26} r="1.5" fill="#0f172a" />

                {/* Balão de Status / Nome */}
                <g transform={`translate(${sx}, ${sy - 44})`}>
                  <rect x="-35" y="-14" width="70" height="16" rx="8" fill="#0f172a" opacity="0.85" stroke="#334155" strokeWidth="1" />
                  <text x="0" y="-3" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#f8fafc">
                    {character.name}
                  </text>
                </g>
              </g>
            );
          })()}
        </svg>
      </div>

      {/* Painel Inferior de Detalhes do Móvel Selecionado */}
      {selectedFurniture && (
        <div className="absolute bottom-4 left-4 right-4 z-20 bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border border-amber-500/40 shadow-xl flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <span className="text-2xl p-2 bg-slate-800 rounded-xl border border-slate-700">
              {selectedFurniture.icon}
            </span>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                {selectedFurniture.name}
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono">
                  {selectedFurniture.category.toUpperCase()}
                </span>
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">{selectedFurniture.buffDescription}</p>
            </div>
          </div>

          <button
            onClick={() => setSelectedFurniture(null)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-bold transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      )}
    </div>
  );
};
