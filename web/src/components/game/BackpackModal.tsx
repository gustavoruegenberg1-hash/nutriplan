import React, { useState } from 'react';
import { HeroProfile, EquipmentItem, EquipmentSlot, ItemRarity, ChestLootTable } from '../../types/idleGame';
import {
  X,
  Shield,
  Sparkles,
  Coins,
  PackageOpen,
  Trash2,
  ArrowUpCircle,
  ArrowDownCircle,
  Check,
  Info,
  Hammer,
} from 'lucide-react';
import { triggerHapticFeedback } from '../../utils/mobile';
import { idleGameService } from '../../services/idleGameService';

interface BackpackModalProps {
  hero: HeroProfile;
  lootTables?: Record<'titan' | 'nutritionist' | 'sage' | 'sprinter', ChestLootTable> | null;
  onHeroUpdate: (updated: HeroProfile) => void;
  onOpenChest: (chestType: 'titan' | 'nutritionist' | 'sage' | 'sprinter') => void;
  onClose: () => void;
  onShowMessage: (msg: string) => void;
}

const RARITY_COLORS: Record<ItemRarity, { border: string; bg: string; text: string; label: string }> = {
  common: { border: 'border-slate-600', bg: 'bg-slate-800/40', text: 'text-slate-300', label: 'Comum' },
  uncommon: { border: 'border-emerald-500', bg: 'bg-emerald-950/20', text: 'text-emerald-400', label: 'Incomum' },
  rare: { border: 'border-sky-500', bg: 'bg-sky-950/20', text: 'text-sky-400', label: 'Raro' },
  epic: { border: 'border-purple-500', bg: 'bg-purple-950/20', text: 'text-purple-400', label: 'Épico' },
  legendary: { border: 'border-amber-400', bg: 'bg-amber-950/25', text: 'text-amber-400', label: 'Lendário' },
};

const NEXT_RARITY: Record<ItemRarity, ItemRarity | null> = {
  common: 'uncommon',
  uncommon: 'rare',
  rare: 'epic',
  epic: 'legendary',
  legendary: null,
};

const SLOT_LABELS: Record<EquipmentSlot, { label: string; placeholderIcon: string }> = {
  weapon: { label: 'Arma', placeholderIcon: '🗡️' },
  helmet: { label: 'Elmo', placeholderIcon: '🪖' },
  chest: { label: 'Peitoral', placeholderIcon: '🦺' },
  legs: { label: 'Pernas', placeholderIcon: '👖' },
  boots: { label: 'Botas', placeholderIcon: '👟' },
  amulet: { label: 'Amuleto', placeholderIcon: '🔮' },
};

export const BackpackModal: React.FC<BackpackModalProps> = ({
  hero,
  lootTables,
  onHeroUpdate,
  onOpenChest,
  onClose,
  onShowMessage,
}) => {
  const [activeTab, setActiveTab] = useState<'equipment' | 'fusion' | 'chests' | 'resources'>('equipment');
  const [selectedItem, setSelectedItem] = useState<EquipmentItem | null>(null);
  const [isFromEquipped, setIsFromEquipped] = useState(false);
  const [inspectingChest, setInspectingChest] = useState<'titan' | 'nutritionist' | 'sage' | 'sprinter' | null>(null);

  // Estados da Fusão de Equipamentos (3 da mesma raridade -> 1 superior)
  const [selectedForFusion, setSelectedForFusion] = useState<string[]>([]);
  const [isFusing, setIsFusing] = useState(false);
  const [showFusionConfirm, setShowFusionConfirm] = useState(false);
  const [fusionResult, setFusionResult] = useState<EquipmentItem | null>(null);
  const [fusionRarityFilter, setFusionRarityFilter] = useState<ItemRarity | 'ALL'>('ALL');

  const handleToggleFusionItem = (item: EquipmentItem) => {
    triggerHapticFeedback();
    if (selectedForFusion.includes(item.id)) {
      setSelectedForFusion(selectedForFusion.filter((id) => id !== item.id));
      return;
    }

    if (item.rarity === 'legendary') {
      onShowMessage('Equipamentos Lendários já atingiram a raridade máxima e não podem ser fundidos!');
      return;
    }

    if (selectedForFusion.length >= 3) {
      onShowMessage('Você já selecionou os 3 equipamentos necessários para a fusão!');
      return;
    }

    if (selectedForFusion.length > 0) {
      const firstItem = hero.inventory.find((i) => i.id === selectedForFusion[0]);
      if (firstItem && firstItem.rarity !== item.rarity) {
        onShowMessage(`Todos os equipamentos da fusão devem ser da mesma raridade (${RARITY_COLORS[firstItem.rarity].label})!`);
        return;
      }
    }

    setSelectedForFusion([...selectedForFusion, item.id]);
  };

  const handleExecuteFusion = async () => {
    if (selectedForFusion.length !== 3 || isFusing) return;
    setIsFusing(true);
    triggerHapticFeedback();
    try {
      const res = await idleGameService.fuseEquipment(hero.userId, selectedForFusion);
      if (res.success && res.fusedItem) {
        onHeroUpdate(res.hero);
        setFusionResult(res.fusedItem);
        setSelectedForFusion([]);
        setShowFusionConfirm(false);
        onShowMessage(res.message);
      } else {
        onShowMessage(res.message);
      }
    } catch {
      onShowMessage('Falha ao processar a fusão.');
    } finally {
      setIsFusing(false);
    }
  };

  const handleEquip = async (item: EquipmentItem) => {
    triggerHapticFeedback();
    const res = await idleGameService.equipItem(hero.userId, item.id);
    onHeroUpdate(res.hero);
    onShowMessage(res.message);
    setSelectedItem(null);
  };

  const handleUnequip = async (slot: EquipmentSlot) => {
    triggerHapticFeedback();
    const res = await idleGameService.unequipItem(hero.userId, slot);
    onHeroUpdate(res.hero);
    onShowMessage(res.message);
    setSelectedItem(null);
  };

  const handleRecycle = async (item: EquipmentItem) => {
    triggerHapticFeedback();
    const res = await idleGameService.recycleItem(hero.userId, item.id);
    onHeroUpdate(res.hero);
    onShowMessage(res.message);
    setSelectedItem(null);
  };

  const equippedInSameSlot = selectedItem ? hero.equipped[selectedItem.slot] : null;

  const compareStat = (statName: keyof EquipmentItem['bonusStats']) => {
    if (!selectedItem) return null;
    const currentVal = equippedInSameSlot?.bonusStats[statName] || 0;
    const newVal = selectedItem.bonusStats[statName] || 0;
    const diff = newVal - currentVal;
    if (diff === 0 && newVal === 0) return null;

    return {
      current: currentVal,
      new: newVal,
      diff,
      isBetter: diff > 0,
      isWorse: diff < 0,
    };
  };

  const chestCards = [
    { type: 'titan' as const, name: 'Baú do Titã', icon: '🧰', count: hero.chests.titan, theme: 'border-rose-500/50 bg-rose-950/20 text-rose-300' },
    { type: 'nutritionist' as const, name: 'Baú do Nutricionista', icon: '🥗', count: hero.chests.nutritionist, theme: 'border-emerald-500/50 bg-emerald-950/20 text-emerald-300' },
    { type: 'sage' as const, name: 'Baú do Sábio', icon: '🔮', count: hero.chests.sage, theme: 'border-purple-500/50 bg-purple-950/20 text-purple-300' },
    { type: 'sprinter' as const, name: 'Baú do Velocista', icon: '⚡', count: hero.chests.sprinter, theme: 'border-sky-500/50 bg-sky-950/20 text-sky-300' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#111827] border border-[#1F2937] rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Topo da Mochila */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1F2937] bg-[#0B0F17]/60">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🎒</span>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                Mochila do Herói
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {hero.inventory.length} itens guardados
                </span>
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#1F2937] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Abas da Mochila */}
        <div className="flex border-b border-[#1F2937] px-6 pt-3 gap-4 text-xs font-bold bg-[#0B0F17]/30">
          <button
            onClick={() => {
              setActiveTab('equipment');
              setSelectedItem(null);
            }}
            className={`pb-2.5 px-1 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'equipment' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Equipamentos ({hero.inventory.length})</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('fusion');
              setSelectedItem(null);
            }}
            className={`pb-2.5 px-1 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'fusion' ? 'border-amber-400 text-amber-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Hammer className="w-3.5 h-3.5" />
            <span>Fusão (3-para-1) 🔨</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('chests');
              setSelectedItem(null);
            }}
            className={`pb-2.5 px-1 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'chests' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <PackageOpen className="w-3.5 h-3.5" />
            <span>Baús de Espólios ({hero.chests.titan + hero.chests.nutritionist + hero.chests.sage + hero.chests.sprinter})</span>
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`pb-2.5 px-1 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'resources' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Recursos & Tesouros</span>
          </button>
        </div>

        {/* Conteúdo da Mochila */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* ABA 1: EQUIPAMENTOS */}
          {activeTab === 'equipment' && (
            <div className="space-y-6">
              {/* 6 SLOTS EQUIPADOS */}
              <div>
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  Equipados no Herói
                </h4>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {(Object.keys(SLOT_LABELS) as EquipmentSlot[]).map((slot) => {
                    const item = hero.equipped[slot];
                    const slotInfo = SLOT_LABELS[slot];
                    const rarityStyle = item ? RARITY_COLORS[item.rarity] : null;

                    return (
                      <button
                        key={slot}
                        onClick={() => {
                          if (item) {
                            setSelectedItem(item);
                            setIsFromEquipped(true);
                          }
                        }}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all text-center min-h-[90px] ${
                          item
                            ? `${rarityStyle?.border} ${rarityStyle?.bg} hover:scale-105 shadow-sm`
                            : 'bg-[#0B0F17] border-slate-800 border-dashed hover:border-slate-700'
                        }`}
                      >
                        <span className="text-2xl mb-1">{item ? item.icon : slotInfo.placeholderIcon}</span>
                        <span className="text-[11px] font-bold text-white truncate w-full">{item ? item.name : slotInfo.label}</span>
                        <span className="text-[9px] text-slate-400">{item ? `Nv.${item.level}` : 'Vazio'}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* GRADE DE ITENS GUARDADOS */}
              <div>
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                  Itens na Mochila ({hero.inventory.length})
                </h4>

                {hero.inventory.length === 0 ? (
                  <div className="text-center py-8 bg-[#0B0F17] border border-slate-800 rounded-2xl">
                    <p className="text-xs text-slate-400">Nenhum equipamento guardado no momento.</p>
                    <p className="text-[11px] text-emerald-400 mt-1">Abra baús para obter novos equipamentos!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {hero.inventory.map((item) => {
                      const rarityStyle = RARITY_COLORS[item.rarity];
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setSelectedItem(item);
                            setIsFromEquipped(false);
                          }}
                          className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center ${rarityStyle.border} ${rarityStyle.bg} hover:scale-105`}
                        >
                          <span className="text-2xl mb-1">{item.icon}</span>
                          <span className="text-xs font-bold text-white truncate w-full">{item.name}</span>
                          <span className={`text-[10px] font-semibold mt-0.5 ${rarityStyle.text}`}>
                            {rarityStyle.label} • Nv.{item.level}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ABA 2: FUSÃO DE EQUIPAMENTOS (3-PARA-1) */}
          {activeTab === 'fusion' && (
            <div className="space-y-6">
              {/* Altar de Fusão */}
              <div className="p-5 rounded-3xl bg-gradient-to-b from-[#0B0F17] via-slate-900/90 to-slate-950 border border-amber-500/40 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Hammer className="w-5 h-5 text-amber-400" />
                    <div>
                      <h4 className="text-sm font-extrabold text-white">Forja Mística de Fusão</h4>
                      <p className="text-[11px] text-slate-400">
                        Combine 3 equipamentos da mesma raridade para forjar 1 de raridade superior.
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-black px-2.5 py-1 rounded-full border ${
                      selectedForFusion.length === 3
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {selectedForFusion.length}/3 Selecionados
                  </span>
                </div>

                {/* Grid dos 3 Itens Selecionados + Preview do Resultado */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
                  <div className="sm:col-span-3 grid grid-cols-3 gap-2.5">
                    {[0, 1, 2].map((slotIdx) => {
                      const itemId = selectedForFusion[slotIdx];
                      const item = itemId ? hero.inventory.find((i) => i.id === itemId) : null;
                      const rarityStyle = item ? RARITY_COLORS[item.rarity] : null;

                      return (
                        <div
                          key={slotIdx}
                          onClick={() => {
                            if (item) handleToggleFusionItem(item);
                          }}
                          className={`p-3 rounded-2xl border-2 flex flex-col items-center text-center justify-between h-32 transition-all ${
                            item
                              ? `${rarityStyle?.border} ${rarityStyle?.bg} cursor-pointer hover:opacity-80 active:scale-95`
                              : 'border-dashed border-slate-700 bg-slate-950/60 text-slate-500'
                          }`}
                        >
                          {item ? (
                            <>
                              <span className="text-2xl">{item.icon}</span>
                              <div className="w-full">
                                <span className={`text-[9px] font-extrabold uppercase block truncate ${rarityStyle?.text}`}>
                                  {rarityStyle?.label}
                                </span>
                                <h5 className="text-[11px] font-bold text-white truncate">{item.name}</h5>
                                <span className="text-[9px] text-slate-400">Slot {SLOT_LABELS[item.slot]?.label || item.slot}</span>
                              </div>
                              <span className="text-[10px] text-rose-400 hover:underline">Remover ✕</span>
                            </>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full space-y-1">
                              <span className="text-lg opacity-40">➕</span>
                              <span className="text-[10px] font-semibold text-slate-400">
                                {slotIdx + 1}º Item
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Prévia do Resultado */}
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col items-center justify-center text-center h-32 space-y-1">
                    <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
                    <span className="text-[10px] font-extrabold uppercase text-amber-300">
                      Resultado Previsto:
                    </span>
                    {selectedForFusion.length === 3 ? (
                      (() => {
                        const firstItem = hero.inventory.find((i) => i.id === selectedForFusion[0]);
                        const targetRarity = firstItem ? NEXT_RARITY[firstItem.rarity] : null;
                        const targetStyle = targetRarity ? RARITY_COLORS[targetRarity] : null;

                        return (
                          <div>
                            <span className={`text-xs font-black block ${targetStyle?.text}`}>
                              [1x {targetStyle?.label.toUpperCase()}]
                            </span>
                            <span className="text-[10px] text-slate-300">Equipamento Aleatório</span>
                          </div>
                        );
                      })()
                    ) : (
                      <span className="text-[10px] text-slate-400 leading-tight">
                        Selecione 3 itens da mesma raridade
                      </span>
                    )}
                  </div>
                </div>

                {/* Botão de Ação para Disparar a Fusão */}
                <div className="flex items-center justify-between pt-2">
                  {selectedForFusion.length > 0 ? (
                    <button
                      onClick={() => setSelectedForFusion([])}
                      className="text-xs text-slate-400 hover:text-white underline"
                    >
                      Limpar seleção
                    </button>
                  ) : (
                    <span className="text-xs text-slate-500">Nenhum item selecionado</span>
                  )}

                  <button
                    onClick={() => setShowFusionConfirm(true)}
                    disabled={selectedForFusion.length !== 3 || isFusing}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 active:scale-98"
                  >
                    <Hammer className="w-4 h-4" />
                    <span>{isFusing ? 'FUSIONANDO...' : 'FUSIONAR (3/3)'}</span>
                  </button>
                </div>
              </div>

              {/* Seletor de Filtro de Raridade e Itens do Inventário */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    Selecione Itens do Inventário para a Fusão
                  </h4>

                  {/* Filtro de Raridade */}
                  <div className="flex items-center gap-1 flex-wrap">
                    {(['ALL', 'common', 'uncommon', 'rare', 'epic'] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => setFusionRarityFilter(r)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all ${
                          fusionRarityFilter === r
                            ? 'bg-amber-500 text-slate-950 shadow-sm'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {r === 'ALL' ? 'Todos' : RARITY_COLORS[r]?.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grade de Itens Disponíveis */}
                {(() => {
                  const eligibleItems = hero.inventory.filter((item) => {
                    if (fusionRarityFilter !== 'ALL' && item.rarity !== fusionRarityFilter) return false;
                    return true;
                  });

                  if (eligibleItems.length === 0) {
                    return (
                      <div className="p-8 text-center rounded-2xl bg-slate-900/50 border border-slate-800 text-slate-400 text-xs">
                        Nenhum equipamento encontrado no inventário para os filtros selecionados.
                      </div>
                    );
                  }

                  const firstSelectedItem =
                    selectedForFusion.length > 0
                      ? hero.inventory.find((i) => i.id === selectedForFusion[0])
                      : null;

                  return (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-80 overflow-y-auto pr-1">
                      {eligibleItems.map((item) => {
                        const isSelected = selectedForFusion.includes(item.id);
                        const isLegendary = item.rarity === 'legendary';
                        const isDifferentRarity = Boolean(
                          firstSelectedItem && firstSelectedItem.rarity !== item.rarity
                        );
                        const isMaxSelected = selectedForFusion.length >= 3 && !isSelected;
                        const isDisabled = isLegendary || isDifferentRarity || isMaxSelected;
                        const rarityStyle = RARITY_COLORS[item.rarity];
                        const selectedOrder = selectedForFusion.indexOf(item.id) + 1;

                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleToggleFusionItem(item)}
                            disabled={isDisabled && !isSelected}
                            className={`p-3 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between ${
                              isSelected
                                ? 'border-amber-400 bg-amber-950/40 ring-2 ring-amber-400/50 scale-[1.02]'
                                : isDisabled
                                ? 'border-slate-800 bg-slate-950/40 opacity-40 cursor-not-allowed'
                                : `${rarityStyle.border} ${rarityStyle.bg} hover:border-amber-400/70 cursor-pointer active:scale-95`
                            }`}
                          >
                            {isSelected && (
                              <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black text-[10px] shadow-md">
                                {selectedOrder}/3 ✓
                              </span>
                            )}

                            {isLegendary && (
                              <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-slate-800 text-amber-400 text-[9px] font-bold">
                                Máximo
                              </span>
                            )}

                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-2xl">{item.icon}</span>
                              <div className="flex-1 min-w-0">
                                <span className={`text-[9px] font-black uppercase block truncate ${rarityStyle.text}`}>
                                  {rarityStyle.label}
                                </span>
                                <h5 className="text-xs font-extrabold text-white truncate">{item.name}</h5>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                              <span>Slot: {SLOT_LABELS[item.slot]?.label || item.slot}</span>
                              <span>Nív. {item.level}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* ABA 2: BAÚS DE ESPÓLIOS */}
          {activeTab === 'chests' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {chestCards.map((c) => {
                  const table = lootTables ? lootTables[c.type] : null;
                  return (
                    <div
                      key={c.type}
                      className={`p-4 rounded-2xl border-2 ${c.theme} flex flex-col justify-between shadow-lg relative`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-3xl">{c.icon}</span>
                            <div>
                              <h4 className="text-sm font-extrabold text-white">{c.name}</h4>
                              <span className="text-xs font-bold text-amber-300">
                                Quantidade: × {c.count}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => setInspectingChest(inspectingChest === c.type ? null : c.type)}
                            className="p-1.5 rounded-lg bg-black/40 text-slate-300 hover:text-white"
                            title="Ver taxas de drop reais"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Detalhes / Taxas de Drop */}
                        {inspectingChest === c.type && table && (
                          <div className="mt-2.5 p-3 rounded-xl bg-black/50 border border-slate-700 text-left text-xs space-y-1.5">
                            <span className="text-[10px] font-extrabold uppercase text-amber-400 block mb-1">
                              Taxas de Drop Oficiais do Sistema:
                            </span>
                            {table.entries.map((e, idx) => (
                              <div key={idx} className="flex justify-between text-slate-300">
                                <span>{e.icon} {e.label}</span>
                                <strong className="text-white">{e.chancePct}%</strong>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => onOpenChest(c.type)}
                        disabled={c.count <= 0}
                        className="mt-4 w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                      >
                        <PackageOpen className="w-4 h-4" />
                        <span>Abrir 1 Baú</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ABA 3: RECURSOS & TESOUROS */}
          {activeTab === 'resources' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-[#0B0F17] border border-slate-800 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center text-2xl">
                    🪙
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Ouro Acumulado</span>
                    <strong className="text-xl text-yellow-300">{hero.gold}</strong>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#0B0F17] border border-slate-800 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-2xl">
                    🧪
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Essências de Aprimoramento</span>
                    <strong className="text-xl text-purple-300">{hero.upgradeEssences}</strong>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0B0F17] border border-slate-800 text-xs text-slate-400 leading-relaxed">
                💡 <strong>Dica de Economia:</strong> Você pode reciclar equipamentos sobressalentes na aba de Equipamentos para obter mais Ouro e Essências de Aprimoramento.
              </div>
            </div>
          )}
        </div>

        {/* MODAL DE INSPEÇÃO/COMPARAÇÃO DE ITEM */}
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#111827] border border-[#1F2937] rounded-3xl w-full max-w-md p-5 sm:p-6 shadow-2xl relative">
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#1F2937]"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{selectedItem.icon}</span>
                <div>
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                      RARITY_COLORS[selectedItem.rarity].border
                    } ${RARITY_COLORS[selectedItem.rarity].text}`}
                  >
                    {RARITY_COLORS[selectedItem.rarity].label}
                  </span>
                  <h3 className="text-base font-extrabold text-white mt-1">{selectedItem.name}</h3>
                  <p className="text-[11px] text-slate-400">
                    Slot: {SLOT_LABELS[selectedItem.slot].label} • Nível {selectedItem.level}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-300 bg-[#0B0F17] p-3 rounded-xl border border-slate-800 mb-4">
                {selectedItem.description}
              </p>

              {/* Comparação com item equipado */}
              <div className="space-y-2 mb-6">
                <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Estatísticas do Item:
                </h5>

                <div className="space-y-1.5">
                  {(['attack', 'defense', 'hp', 'critRate', 'speed'] as const).map((stat) => {
                    const comp = compareStat(stat);
                    if (!comp) return null;
                    const statLabels = {
                      attack: 'Ataque',
                      defense: 'Defesa',
                      hp: 'Vida Máxima',
                      critRate: 'Chance Crítica',
                      speed: 'Velocidade',
                    };

                    return (
                      <div
                        key={stat}
                        className="flex items-center justify-between text-xs p-2 rounded-lg bg-[#1F2937]/50 border border-slate-800"
                      >
                        <span className="text-slate-300">{statLabels[stat]}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">
                            +{comp.new}
                            {stat === 'critRate' ? '%' : ''}
                          </span>

                          {!isFromEquipped && comp.diff !== 0 && (
                            <span
                              className={`flex items-center gap-0.5 text-[11px] font-bold ${
                                comp.isBetter ? 'text-emerald-400' : 'text-red-400'
                              }`}
                            >
                              {comp.isBetter ? (
                                <>
                                  <ArrowUpCircle className="w-3.5 h-3.5" /> +{comp.diff}
                                </>
                              ) : (
                                <>
                                  <ArrowDownCircle className="w-3.5 h-3.5" /> {comp.diff}
                                </>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Ações */}
              <div className="flex items-center gap-2 pt-2 border-t border-[#1F2937]">
                {isFromEquipped ? (
                  <button
                    onClick={() => handleUnequip(selectedItem.slot)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all"
                  >
                    Desequipar
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleEquip(selectedItem)}
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all"
                    >
                      Equipar Item
                    </button>
                    <button
                      onClick={() => handleRecycle(selectedItem)}
                      className="px-3 py-2.5 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-400 hover:bg-rose-900/40 text-xs font-semibold transition-all flex items-center gap-1"
                      title="Reciclar em Essências e Ouro"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Reciclar</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MODAL DE CONFIRMAÇÃO DA FUSÃO */}
        {showFusionConfirm && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fade-in">
            <div className="bg-[#111827] border border-amber-500/40 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto text-2xl border border-amber-500/40">
                🔨
              </div>

              <div>
                <h3 className="text-base font-extrabold text-white">Confirmar Fusão Mística</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Os seguintes 3 equipamentos serão <strong className="text-rose-400">consumidos permanentemente</strong>:
                </p>
              </div>

              {/* Lista dos 3 itens que serão consumidos */}
              <div className="p-3 rounded-2xl bg-[#0B0F17] border border-slate-800 space-y-2 text-left max-h-48 overflow-y-auto">
                {selectedForFusion.map((id) => {
                  const it = hero.inventory.find((i) => i.id === id);
                  if (!it) return null;
                  const rStyle = RARITY_COLORS[it.rarity];
                  return (
                    <div key={id} className="flex items-center gap-2.5 text-xs text-slate-200">
                      <span className="text-lg">{it.icon}</span>
                      <div className="flex-1 truncate">
                        <span className="font-bold">{it.name}</span>
                        <span className={`text-[10px] block uppercase font-extrabold ${rStyle.text}`}>
                          {rStyle.label} • Slot {SLOT_LABELS[it.slot]?.label || it.slot}
                        </span>
                      </div>
                      <span className="text-rose-400 font-bold text-xs">Consumir ✕</span>
                    </div>
                  );
                })}
              </div>

              {/* Resultado previsto */}
              {(() => {
                const first = hero.inventory.find((i) => i.id === selectedForFusion[0]);
                const nextRarity = first ? NEXT_RARITY[first.rarity] : null;
                const nextStyle = nextRarity ? RARITY_COLORS[nextRarity] : null;

                return (
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs">
                    <span className="text-amber-300 font-bold block">✨ Recompensa Garantida:</span>
                    <span className={`text-sm font-black mt-0.5 block ${nextStyle?.text}`}>
                      1x Equipamento [{nextStyle?.label.toUpperCase()}] Aleatório
                    </span>
                  </div>
                );
              })()}

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setShowFusionConfirm(false)}
                  disabled={isFusing}
                  className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all disabled:opacity-50 active:scale-98"
                >
                  CANCELAR
                </button>
                <button
                  onClick={handleExecuteFusion}
                  disabled={isFusing}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 active:scale-98"
                >
                  <Hammer className="w-4 h-4" />
                  <span>{isFusing ? 'FUSIONANDO...' : 'CONFIRMAR FUSÃO'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL DE RESULTADO DA FUSÃO */}
        {fusionResult && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fade-in">
            <div className="bg-[#111827] border border-amber-500/40 rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-2xl text-center space-y-4 relative overflow-hidden">
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

              <span className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Fusão Bem-Sucedida!
              </span>

              {(() => {
                const rStyle = RARITY_COLORS[fusionResult.rarity];
                return (
                  <div className={`p-5 rounded-2xl border-2 ${rStyle.border} ${rStyle.bg} text-left shadow-xl`}>
                    <div className="flex items-center gap-3.5 mb-3">
                      <div className="text-4xl p-2 rounded-xl bg-slate-900/60 border border-slate-700">
                        {fusionResult.icon}
                      </div>
                      <div>
                        <span className={`text-[10px] font-extrabold uppercase ${rStyle.text}`}>
                          {rStyle.label} • Slot {(SLOT_LABELS[fusionResult.slot]?.label || fusionResult.slot).toUpperCase()}
                        </span>
                        <h4 className="text-base font-black text-white">{fusionResult.name}</h4>
                        <span className="text-[10px] text-slate-400">Nível {fusionResult.level}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed mb-3">
                      {fusionResult.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                      {fusionResult.bonusStats.attack && (
                        <div className="flex items-center gap-1.5 text-rose-400 bg-black/30 p-2 rounded-lg">
                          <span>+{fusionResult.bonusStats.attack} Ataque</span>
                        </div>
                      )}
                      {fusionResult.bonusStats.defense && (
                        <div className="flex items-center gap-1.5 text-sky-400 bg-black/30 p-2 rounded-lg">
                          <span>+{fusionResult.bonusStats.defense} Defesa</span>
                        </div>
                      )}
                      {fusionResult.bonusStats.hp && (
                        <div className="flex items-center gap-1.5 text-emerald-400 bg-black/30 p-2 rounded-lg">
                          <span>+{fusionResult.bonusStats.hp} Vida Máxima</span>
                        </div>
                      )}
                      {fusionResult.bonusStats.speed && (
                        <div className="flex items-center gap-1.5 text-cyan-400 bg-black/30 p-2 rounded-lg">
                          <span>+{fusionResult.bonusStats.speed} Velocidade</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              <button
                onClick={() => setFusionResult(null)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                <Check className="w-4 h-4" />
                <span>GUARDAR NA MOCHILA</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
