import React, { useState, useEffect } from 'react';
import { ChestReward, ItemRarity } from '../../types/idleGame';
import { Coins, Sparkles, Check, X, Shield, Zap, Flame } from 'lucide-react';
import { triggerHapticFeedback } from '../../utils/mobile';

interface ChestOpeningModalProps {
  chestType: 'titan' | 'nutritionist' | 'sage' | 'sprinter';
  remainingCount: number;
  reward: ChestReward;
  isProcessingNext?: boolean;
  onOpenAnother?: () => void;
  onClose: () => void;
}

const RARITY_THEMES: Record<ItemRarity, { border: string; bg: string; text: string; label: string; glow: string }> = {
  common: { border: 'border-slate-500', bg: 'bg-slate-800/60', text: 'text-slate-300', label: 'Comum', glow: 'shadow-slate-500/20' },
  uncommon: { border: 'border-emerald-500', bg: 'bg-emerald-950/40', text: 'text-emerald-400', label: 'Incomum', glow: 'shadow-emerald-500/30' },
  rare: { border: 'border-sky-500', bg: 'bg-sky-950/40', text: 'text-sky-400', label: 'Raro', glow: 'shadow-sky-500/30' },
  epic: { border: 'border-purple-500', bg: 'bg-purple-950/40', text: 'text-purple-400', label: 'Épico', glow: 'shadow-purple-500/40' },
  legendary: { border: 'border-amber-400', bg: 'bg-amber-950/50', text: 'text-amber-400', label: 'Lendário', glow: 'shadow-amber-400/50' },
};

const CHEST_INFO = {
  titan: { title: 'Baú do Titã', icon: '🧰', color: 'from-rose-600 to-red-700' },
  nutritionist: { title: 'Baú do Nutricionista', icon: '🥗', color: 'from-emerald-600 to-teal-700' },
  sage: { title: 'Baú do Sábio', icon: '🔮', color: 'from-purple-600 to-indigo-700' },
  sprinter: { title: 'Baú do Velocista', icon: '⚡', color: 'from-sky-600 to-blue-700' },
};

export const ChestOpeningModal: React.FC<ChestOpeningModalProps> = ({
  chestType,
  remainingCount,
  reward,
  isProcessingNext = false,
  onOpenAnother,
  onClose,
}) => {
  const [stage, setStage] = useState<'shaking' | 'revealed'>('shaking');
  const [isLocalOpening, setIsLocalOpening] = useState(false);
  const info = CHEST_INFO[chestType];

  useEffect(() => {
    setStage('shaking');
    triggerHapticFeedback();
    const timer = setTimeout(() => {
      setStage('revealed');
      setIsLocalOpening(false);
      triggerHapticFeedback();
    }, 600);

    return () => clearTimeout(timer);
  }, [reward]);

  const handleOpenNext = () => {
    if (remainingCount <= 0 || isLocalOpening || isProcessingNext || !onOpenAnother) return;
    setIsLocalOpening(true);
    setStage('shaking');
    triggerHapticFeedback();
    onOpenAnother();
  };

  const eq = reward.equipment;
  const rarityStyle = eq ? RARITY_THEMES[eq.rarity] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#111827] border border-[#1F2937] rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-2xl relative text-center overflow-hidden">
        {/* Luz de fundo do baú */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#1F2937] transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {stage === 'shaking' ? (
          <div className="py-10 space-y-4">
            <div className="text-7xl animate-bounce drop-shadow-2xl">
              {info.icon}
            </div>
            <h3 className="text-lg font-extrabold text-white animate-pulse">
              Abrindo {info.title}...
            </h3>
            <p className="text-xs text-slate-400">Sorteando recompensa da tabela oficial de loot</p>
          </div>
        ) : (
          <div className="animate-in zoom-in-95 duration-300 space-y-4">
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Recompensa Conquistada!
            </span>

            {/* CASO 1: EQUIPAMENTO */}
            {reward.type === 'equipment' && eq && (
              <div className={`p-4 sm:p-5 rounded-2xl border-2 ${rarityStyle?.border} ${rarityStyle?.bg} ${rarityStyle?.glow} shadow-xl text-left`}>
                <div className="flex items-center gap-3.5 mb-3">
                  <div className="text-4xl p-2 rounded-xl bg-slate-900/60 border border-slate-700">
                    {eq.icon}
                  </div>
                  <div>
                    <span className={`text-[10px] font-extrabold uppercase ${rarityStyle?.text}`}>
                      {rarityStyle?.label} • Slot {eq.slot.toUpperCase()}
                    </span>
                    <h4 className="text-base font-black text-white">{eq.name}</h4>
                    <span className="text-[10px] text-slate-400">Nível {eq.level}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {eq.description}
                </p>

                {/* Atributos do Equipamento */}
                <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                  {eq.bonusStats.attack && (
                    <div className="flex items-center gap-1.5 text-rose-400 bg-black/30 p-2 rounded-lg">
                      <Zap className="w-3.5 h-3.5" />
                      <span>+{eq.bonusStats.attack} Ataque</span>
                    </div>
                  )}
                  {eq.bonusStats.defense && (
                    <div className="flex items-center gap-1.5 text-sky-400 bg-black/30 p-2 rounded-lg">
                      <Shield className="w-3.5 h-3.5" />
                      <span>+{eq.bonusStats.defense} Defesa</span>
                    </div>
                  )}
                  {eq.bonusStats.hp && (
                    <div className="flex items-center gap-1.5 text-emerald-400 bg-black/30 p-2 rounded-lg">
                      <Flame className="w-3.5 h-3.5" />
                      <span>+{eq.bonusStats.hp} Vida Máxima</span>
                    </div>
                  )}
                  {eq.bonusStats.critRate && (
                    <div className="flex items-center gap-1.5 text-amber-400 bg-black/30 p-2 rounded-lg">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>+{eq.bonusStats.critRate}% Crítico</span>
                    </div>
                  )}
                  {eq.bonusStats.speed && (
                    <div className="flex items-center gap-1.5 text-cyan-400 bg-black/30 p-2 rounded-lg">
                      <Zap className="w-3.5 h-3.5" />
                      <span>+{eq.bonusStats.speed} Velocidade</span>
                    </div>
                  )}
                </div>

                {/* Se for Duplicata Convertida */}
                {reward.isDuplicateConverted && (
                  <div className="mt-3 p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                    ♻️ Item duplicado! Convertido automaticamente em +{reward.amount} Ouro 🪙 e +12 Essências 🧪.
                  </div>
                )}
              </div>
            )}

            {/* CASO 2: MOEDAS DE OURO */}
            {reward.type === 'gold' && (
              <div className="p-6 rounded-2xl bg-yellow-950/30 border-2 border-yellow-500/50 shadow-xl shadow-yellow-500/10 space-y-2">
                <div className="w-16 h-16 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center mx-auto border border-yellow-500/40 text-3xl animate-pulse">
                  🪙
                </div>
                <h4 className="text-xl font-black text-yellow-300">+{reward.amount} Ouro</h4>
                <p className="text-xs text-slate-400">Moedas depositadas no seu tesouro para aprimoramentos.</p>
              </div>
            )}

            {/* CASO 3: EXPERIÊNCIA DE HERÓI */}
            {reward.type === 'xp' && (
              <div className="p-6 rounded-2xl bg-emerald-950/30 border-2 border-emerald-500/50 shadow-xl shadow-emerald-500/10 space-y-2">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40 text-3xl animate-pulse">
                  ⭐
                </div>
                <h4 className="text-xl font-black text-emerald-300">+{reward.amount} XP</h4>
                <p className="text-xs text-slate-400">Experiência creditada na sua evolução de nível!</p>
              </div>
            )}

            {/* CASO 4: ESSÊNCIAS DE APRIMORAMENTO */}
            {reward.type === 'essence' && (
              <div className="p-6 rounded-2xl bg-purple-950/30 border-2 border-purple-500/50 shadow-xl shadow-purple-500/10 space-y-2">
                <div className="w-16 h-16 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto border border-purple-500/40 text-3xl animate-pulse">
                  🧪
                </div>
                <h4 className="text-xl font-black text-purple-300">+{reward.amount} Essências</h4>
                <p className="text-xs text-slate-400">Materiais místicos para aprimorar e forjar equipamentos.</p>
              </div>
            )}

            {/* Aviso quando não houver mais baús */}
            {remainingCount <= 0 && (
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-amber-400 font-semibold flex items-center justify-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Todos os baús deste tipo foram abertos!</span>
              </div>
            )}

            {/* Botões de Ação */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 active:scale-98"
              >
                <Check className="w-4 h-4" />
                <span>FECHAR</span>
              </button>

              {remainingCount > 0 && onOpenAnother && (
                <button
                  onClick={handleOpenNext}
                  disabled={isLocalOpening || isProcessingNext}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed active:scale-98"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {isLocalOpening || isProcessingNext
                      ? 'ABRINDO...'
                      : `ABRIR PRÓXIMO (${remainingCount})`}
                  </span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
