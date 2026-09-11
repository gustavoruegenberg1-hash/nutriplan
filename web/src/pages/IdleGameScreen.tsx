import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  HeroProfile,
  DerivedHeroStats,
  UltraprocessedMonster,
  AfkReport,
  DailyQuizQuestion,
  HeroCustomization,
  ChestLootTable,
  ChestReward,
} from '../types/idleGame';
import { PetProfile, DailyQuest, ShopItem, PetSpecies } from '../types/gamification';
import { idleGameService } from '../services/idleGameService';
import { gamificationService } from '../services/gamificationService';
import { BattleStage } from '../components/game/BattleStage';
import { BackpackModal } from '../components/game/BackpackModal';
import { ChestOpeningModal } from '../components/game/ChestOpeningModal';
import { AvatarCustomizerModal } from '../components/game/AvatarCustomizerModal';
import { DailyQuizModal } from '../components/game/DailyQuizModal';
import { AfkRewardModal } from '../components/game/AfkRewardModal';
import { PetAvatar } from '../components/pet/PetAvatar';
import { WaterTrackerWidget } from '../components/pet/WaterTrackerWidget';
import {
  Coins,
  Sparkles,
  Dumbbell,
  Utensils,
  BookOpen,
  Footprints,
  PackageOpen,
  CheckCircle2,
  ArrowRight,
  Info,
  Droplets,
  Award,
  ShoppingBag,
  Flame,
  Edit2,
  Check,
  Heart,
} from 'lucide-react';
import { triggerHapticFeedback } from '../utils/mobile';

export const IdleGameScreen: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.id || 'guest';
  const [searchParams, setSearchParams] = useSearchParams();

  // Estados do Herói & Batalha
  const [hero, setHero] = useState<HeroProfile | null>(null);
  const [stats, setStats] = useState<DerivedHeroStats | null>(null);
  const [currentMonster, setCurrentMonster] = useState<UltraprocessedMonster | null>(null);
  const [afkReport, setAfkReport] = useState<AfkReport | null>(null);
  const [showAfkModal, setShowAfkModal] = useState(false);
  const [lootTables, setLootTables] = useState<Record<'titan' | 'nutritionist' | 'sage' | 'sprinter', ChestLootTable> | null>(null);

  // Estados do Mascote
  const [pet, setPet] = useState<PetProfile | null>(null);
  const [petQuests, setPetQuests] = useState<DailyQuest[]>([]);
  const [shopItems] = useState<ShopItem[]>(gamificationService.getShopCatalog());
  const [isEditingPetName, setIsEditingPetName] = useState(false);
  const [tempPetName, setTempPetName] = useState('');

  // Aba Ativa (Loot/Tarefas vs Mascote vs Missões vs Loja vs Evolução)
  const initialTab = (searchParams.get('tab') as any) || 'chests';
  const [activeTab, setActiveTab] = useState<'chests' | 'mascote' | 'pet_quests' | 'shop' | 'evolution'>(initialTab);

  // Modais
  const [showBackpack, setShowBackpack] = useState(false);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [openingChestType, setOpeningChestType] = useState<'titan' | 'nutritionist' | 'sage' | 'sprinter' | null>(null);
  const [chestReward, setChestReward] = useState<ChestReward | null>(null);
  const [dailyQuiz, setDailyQuiz] = useState<DailyQuizQuestion | null>(null);
  const [quizAlreadyAnswered, setQuizAlreadyAnswered] = useState(false);
  const [inspectingRates, setInspectingRates] = useState<'titan' | 'nutritionist' | 'sage' | 'sprinter' | null>(null);
  const [isOpeningChest, setIsOpeningChest] = useState(false);

  // Notificação Toast
  const [toast, setToast] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['chests', 'mascote', 'pet_quests', 'shop', 'evolution'].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [searchParams]);

  useEffect(() => {
    const loadGame = async () => {
      const [heroData, tables, petData] = await Promise.all([
        idleGameService.fetchHero(userId),
        idleGameService.fetchLootTables(),
        gamificationService.fetchPet(userId),
      ]);

      setHero(heroData.hero);
      setStats(heroData.derivedStats);
      setCurrentMonster(heroData.afkReport.currentMonster);
      setLootTables(tables);

      if (petData?.pet) {
        setPet(petData.pet);
        setPetQuests(petData.quests || []);
        setTempPetName(petData.pet.name);
      }

      if (heroData.afkReport && heroData.afkReport.minutesOffline >= 2) {
        setAfkReport(heroData.afkReport);
        setShowAfkModal(true);
      }

      const quizData = await idleGameService.fetchDailyQuiz(userId);
      setDailyQuiz(quizData.quiz);
      setQuizAlreadyAnswered(quizData.alreadyAnswered);
    };

    loadGame();
  }, [userId]);

  if (!hero || !stats || !currentMonster) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Carregando o mundo de NutriHero...</p>
        </div>
      </div>
    );
  }

  // Abertura de Baú Visual com proteção de concorrência e verificação de quantidade
  const handleOpenChest = async (chestType: 'titan' | 'nutritionist' | 'sage' | 'sprinter') => {
    if (isOpeningChest) return;
    if (!hero || hero.chests[chestType] <= 0) {
      showNotification('Você não possui nenhum baú deste tipo disponível!');
      return;
    }

    try {
      setIsOpeningChest(true);
      triggerHapticFeedback();
      const res = await idleGameService.openChest(userId, chestType);
      if (res.success && res.reward) {
        setHero({ ...res.hero });
        setStats(idleGameService.calculateLocalDerivedStats(res.hero));
        setOpeningChestType(chestType);
        setChestReward(res.reward);
      } else {
        showNotification(res.message);
      }
    } finally {
      setIsOpeningChest(false);
    }
  };

  // Salvar Customização do Avatar
  const handleSaveCustomization = async (newCustom: HeroCustomization) => {
    const res = await idleGameService.customizeAvatar(userId, newCustom);
    setHero({ ...res.hero });
    showNotification(res.message);
  };

  // --- AÇÕES DO MASCOTE (MIGRADAS INTEGRALMENTE) ---
  const handleAddWater = async () => {
    const res = await gamificationService.recordAction(userId, 'DRINK_WATER');
    setPet({ ...res.pet });
    showNotification(res.message);
  };

  const handleRemoveWater = async () => {
    const res = await gamificationService.recordAction(userId, 'REMOVE_WATER');
    setPet({ ...res.pet });
    showNotification(res.message);
  };

  const handlePetInteraction = async () => {
    const res = await gamificationService.recordAction(userId, 'PET_PET');
    setPet({ ...res.pet });
    showNotification(res.message);
  };

  const handleClaimPetQuest = async (questId: string) => {
    triggerHapticFeedback();
    const res = await gamificationService.claimQuest(userId, questId);
    setPet({ ...res.pet });
    setPetQuests((prev) =>
      prev.map((q) => (q.id === questId ? { ...q, completed: true } : q))
    );
    showNotification(res.message);
  };

  const handleBuyShopItem = async (item: ShopItem) => {
    triggerHapticFeedback();
    const res = await gamificationService.buyItem(userId, item.id);
    setPet({ ...res.pet });
    showNotification(res.message);
  };

  const handleToggleEquipShopItem = async (item: ShopItem) => {
    triggerHapticFeedback();
    if (!pet) return;
    const slot = item.slot;
    const isEquipped = pet.equipped[slot] === item.id;
    const nextItem = isEquipped ? null : item.id;

    const updated = await gamificationService.equipItem(userId, slot, nextItem);
    setPet({ ...updated });
    showNotification(isEquipped ? `Item desequipado` : `Item ${item.name} equipado!`);
  };

  const handleChangeSpecies = async (species: PetSpecies) => {
    triggerHapticFeedback();
    const updated = await gamificationService.updateSpecies(userId, species);
    setPet({ ...updated });
    showNotification(`Mascote alterado para a forma ${species}!`);
  };

  const handleSavePetName = async () => {
    if (!tempPetName.trim() || !pet) return;
    const updated = await gamificationService.updateSpecies(userId, pet.species, tempPetName.trim());
    setPet({ ...updated });
    setIsEditingPetName(false);
    showNotification(`Nome do mascote atualizado para "${tempPetName.trim()}"!`);
  };

  const totalChests = hero.chests.titan + hero.chests.nutritionist + hero.chests.sage + hero.chests.sprinter;

  // Tema de fundo do mascote
  const petBgTheme = {
    bg_gym: 'from-slate-900 via-slate-800 to-zinc-900 border-slate-700/50',
    bg_park: 'from-emerald-950 via-teal-900 to-slate-900 border-emerald-500/30',
    bg_zen: 'from-amber-950/70 via-stone-900 to-slate-950 border-amber-500/30',
    bg_cyber: 'from-purple-950 via-indigo-950 to-slate-950 border-purple-500/30',
  }[pet?.equipped?.background || 'bg_gym'] || 'from-slate-900 via-slate-800 to-zinc-900 border-slate-700/50';

  const petXpPercent = pet ? Math.min(100, Math.round((pet.currentXp / pet.nextLevelXp) * 100)) : 0;

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2 sm:py-3 space-y-4">
      {/* Toast Flutuante */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-600 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-2xl shadow-2xl border border-emerald-400 animate-bounce">
          {toast}
        </div>
      )}

      {/* 1. O COMBATE IDLE NO TOPO ABSOLUTO DA PÁGINA (COM BARRA DE HP DO AVATAR E AVANÇO MANUAL) */}
      <BattleStage
        hero={hero}
        stats={stats}
        currentMonster={currentMonster}
        pet={pet}
        weightKg={user?.weight}
        heightCm={user?.height}
        bodyFatPct={user?.bodyFatPct}
        onOpenBackpack={() => setShowBackpack(true)}
        onOpenCustomizer={() => setShowCustomizer(true)}
        onOpenQuiz={() => setShowQuizModal(true)}
        onMonsterDefeated={(goldEarned, xpEarned) => {
          setHero((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              gold: prev.gold + goldEarned,
              currentXp: prev.currentXp + xpEarned,
              dungeonProgress: {
                ...prev.dungeonProgress,
                stageStatus: 'in_battle',
              },
            };
          });
        }}
        onHeroDefeated={(newStage) => {
          setHero((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              dungeonProgress: {
                ...prev.dungeonProgress,
                currentStage: newStage,
                stageStatus: 'in_battle',
              },
            };
          });
        }}
        onAdvanceStage={async () => {
          const fresh = await idleGameService.fetchHero(userId);
          setHero(fresh.hero);
          setStats(fresh.derivedStats);
          setCurrentMonster(fresh.afkReport.currentMonster);
          showNotification(`Fase ${fresh.hero.dungeonProgress.currentStage} iniciada! Avante guerreiro! ⚔️`);
        }}
      />

      {/* 2. NAVEGADOR DE ABAS UNIFICADO DO NUTRIHERO & MASCOTE */}
      <div className="flex items-center justify-between border-b border-[#1F2937] overflow-x-auto no-scrollbar gap-1 pt-1">
        <div className="flex space-x-1 sm:space-x-2">
          <button
            onClick={() => {
              setActiveTab('chests');
              setSearchParams({ tab: 'chests' });
            }}
            className={`flex items-center gap-1.5 py-2.5 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'chests'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <PackageOpen className="w-4 h-4" />
            <span>Espólios & Desafios ({totalChests})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('mascote');
              setSearchParams({ tab: 'mascote' });
            }}
            className={`flex items-center gap-1.5 py-2.5 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'mascote'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Heart className="w-4 h-4 text-rose-400" />
            <span>Mascote & Hábitos</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('pet_quests');
              setSearchParams({ tab: 'pet_quests' });
            }}
            className={`flex items-center gap-1.5 py-2.5 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'pet_quests'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span>Missões do Pet ({petQuests.filter((q) => q.completed && !pet?.completedQuests.includes(q.id)).length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('shop');
              setSearchParams({ tab: 'shop' });
            }}
            className={`flex items-center gap-1.5 py-2.5 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'shop'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
            <span>Loja do Mascote</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('evolution');
              setSearchParams({ tab: 'evolution' });
            }}
            className={`flex items-center gap-1.5 py-2.5 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'evolution'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-4 h-4 text-purple-400" />
            <span>Evolução</span>
          </button>
        </div>
      </div>

      {/* 3. CONTEÚDO DAS ABAS INTEGRADAS */}

      {/* ABA 1: ESPÓLIOS & DESAFIOS DIÁRIOS (BAÚS + CHANCES + OBJETIVOS) */}
      {activeTab === 'chests' && (
        <div className="space-y-4">
          {/* SEUS BAÚS DE RECOMPENSA */}
          <div className="bg-[#111827] border border-[#1F2937] rounded-3xl p-4 sm:p-5 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PackageOpen className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm sm:text-base font-black text-white">
                  Seus Baús de Recompensa ({totalChests} disponíveis)
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                Acumule e abra quando desejar
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Baú do Titã */}
              <div className="p-3.5 rounded-2xl bg-[#0B0F17] border border-rose-500/30 flex flex-col justify-between text-center relative shadow-md">
                <div>
                  <span className="text-3xl sm:text-4xl block mb-1">🧰</span>
                  <h4 className="text-xs font-black text-white truncate">Baú do Titã</h4>
                  <span className="text-xs font-bold text-rose-400 block mt-0.5">
                    × {hero.chests.titan}
                  </span>
                </div>
                <button
                  onClick={() => handleOpenChest('titan')}
                  disabled={hero.chests.titan <= 0}
                  className="mt-3 w-full py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 text-white font-extrabold text-[11px] shadow-sm transition-all disabled:opacity-25 disabled:cursor-not-allowed"
                >
                  Abrir
                </button>
              </div>

              {/* Baú do Nutricionista */}
              <div className="p-3.5 rounded-2xl bg-[#0B0F17] border border-emerald-500/30 flex flex-col justify-between text-center relative shadow-md">
                <div>
                  <span className="text-3xl sm:text-4xl block mb-1">🥗</span>
                  <h4 className="text-xs font-black text-white truncate">Baú Nutricionista</h4>
                  <span className="text-xs font-bold text-emerald-400 block mt-0.5">
                    × {hero.chests.nutritionist}
                  </span>
                </div>
                <button
                  onClick={() => handleOpenChest('nutritionist')}
                  disabled={hero.chests.nutritionist <= 0}
                  className="mt-3 w-full py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-extrabold text-[11px] shadow-sm transition-all disabled:opacity-25 disabled:cursor-not-allowed"
                >
                  Abrir
                </button>
              </div>

              {/* Baú do Sábio */}
              <div className="p-3.5 rounded-2xl bg-[#0B0F17] border border-purple-500/30 flex flex-col justify-between text-center relative shadow-md">
                <div>
                  <span className="text-3xl sm:text-4xl block mb-1">🔮</span>
                  <h4 className="text-xs font-black text-white truncate">Baú do Sábio</h4>
                  <span className="text-xs font-bold text-purple-400 block mt-0.5">
                    × {hero.chests.sage}
                  </span>
                </div>
                <button
                  onClick={() => handleOpenChest('sage')}
                  disabled={hero.chests.sage <= 0}
                  className="mt-3 w-full py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-extrabold text-[11px] shadow-sm transition-all disabled:opacity-25 disabled:cursor-not-allowed"
                >
                  Abrir
                </button>
              </div>

              {/* Baú do Velocista */}
              <div className="p-3.5 rounded-2xl bg-[#0B0F17] border border-sky-500/30 flex flex-col justify-between text-center relative shadow-md">
                <div>
                  <span className="text-3xl sm:text-4xl block mb-1">⚡</span>
                  <h4 className="text-xs font-black text-white truncate">Baú Velocista</h4>
                  <span className="text-xs font-bold text-sky-400 block mt-0.5">
                    × {hero.chests.sprinter}
                  </span>
                </div>
                <button
                  onClick={() => handleOpenChest('sprinter')}
                  disabled={hero.chests.sprinter <= 0}
                  className="mt-3 w-full py-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 text-white font-extrabold text-[11px] shadow-sm transition-all disabled:opacity-25 disabled:cursor-not-allowed"
                >
                  Abrir
                </button>
              </div>
            </div>
          </div>

          {/* VITRINE DE HÁBITOS & TAXAS DE DROP OFICIAIS */}
          <div className="bg-[#111827] border border-[#1F2937] rounded-3xl p-4 sm:p-5 shadow-xl space-y-3.5">
            <div>
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                Objetivos Diários & Possíveis Recompensas
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                A coleta do baú ocorre exclusivamente na aba do respectivo objetivo.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* OBJETIVO: DIETA */}
              <div className="bg-[#0B0F17] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <Utensils className="w-4 h-4" /> 1ª Refeição do Dia
                    </span>
                    {hero.completedHabitsToday.diet ? (
                      <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Concluído Hoje
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-400">Pendente na Dieta</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300">
                    Cadastre sua 1ª refeição para ganhar <strong>+1 AGI</strong> e <strong>1 Baú do Nutricionista</strong>.
                  </p>

                  <button
                    onClick={() => setInspectingRates(inspectingRates === 'nutritionist' ? null : 'nutritionist')}
                    className="mt-2 text-[11px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 font-semibold"
                  >
                    <Info className="w-3 h-3" /> Ver possíveis recompensas & chances
                  </button>

                  {inspectingRates === 'nutritionist' && lootTables && (
                    <div className="mt-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] space-y-1">
                      {lootTables.nutritionist.entries.map((e, idx) => (
                        <div key={idx} className="flex justify-between text-slate-300">
                          <span>{e.icon} {e.label}</span>
                          <strong className="text-emerald-400">{e.chancePct}%</strong>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Link
                  to="/diet"
                  className="mt-3.5 w-full py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-bold text-xs border border-emerald-500/30 flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>Ir para a Aba Dieta</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* OBJETIVO: TREINO */}
              <div className="bg-[#0B0F17] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                      <Dumbbell className="w-4 h-4" /> Sessão de Treino
                    </span>
                    {hero.completedHabitsToday.workout ? (
                      <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Concluído Hoje
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-400">Pendente no Treino</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300">
                    Conclua seu treino para ganhar <strong>+1 STR</strong> e <strong>1 Baú do Titã</strong>.
                  </p>

                  <button
                    onClick={() => setInspectingRates(inspectingRates === 'titan' ? null : 'titan')}
                    className="mt-2 text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1 font-semibold"
                  >
                    <Info className="w-3 h-3" /> Ver possíveis recompensas & chances
                  </button>

                  {inspectingRates === 'titan' && lootTables && (
                    <div className="mt-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] space-y-1">
                      {lootTables.titan.entries.map((e, idx) => (
                        <div key={idx} className="flex justify-between text-slate-300">
                          <span>{e.icon} {e.label}</span>
                          <strong className="text-rose-400">{e.chancePct}%</strong>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Link
                  to="/workout"
                  className="mt-3.5 w-full py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 font-bold text-xs border border-rose-500/30 flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>Ir para a Aba Treino</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* OBJETIVO: CIÊNCIA & QUIZ */}
              <div className="bg-[#0B0F17] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" /> Desafio Científico
                    </span>
                    {hero.completedHabitsToday.quiz ? (
                      <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Concluído Hoje
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-400">Pendente</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300">
                    Acerte o quiz diário para ganhar <strong>+1 INT</strong> e <strong>1 Baú do Sábio</strong>.
                  </p>

                  <button
                    onClick={() => setInspectingRates(inspectingRates === 'sage' ? null : 'sage')}
                    className="mt-2 text-[11px] text-slate-400 hover:text-purple-400 flex items-center gap-1 font-semibold"
                  >
                    <Info className="w-3 h-3" /> Ver possíveis recompensas & chances
                  </button>

                  {inspectingRates === 'sage' && lootTables && (
                    <div className="mt-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] space-y-1">
                      {lootTables.sage.entries.map((e, idx) => (
                        <div key={idx} className="flex justify-between text-slate-300">
                          <span>{e.icon} {e.label}</span>
                          <strong className="text-purple-400">{e.chancePct}%</strong>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setShowQuizModal(true)}
                  className="mt-3.5 w-full py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 font-bold text-xs border border-purple-500/30 flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>{hero.completedHabitsToday.quiz ? 'Rever Desafio de Hoje' : 'Responder Quiz Científico'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* OBJETIVO: CARDIO */}
              <div className="bg-[#0B0F17] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                      <Footprints className="w-4 h-4" /> Cardio & Passos
                    </span>
                    {hero.completedHabitsToday.cardio ? (
                      <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Concluído Hoje
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-400">Pendente no Perfil</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300">
                    Atividade aeróbica para ganhar <strong>+1 SPD</strong> e <strong>1 Baú do Velocista</strong>.
                  </p>

                  <button
                    onClick={() => setInspectingRates(inspectingRates === 'sprinter' ? null : 'sprinter')}
                    className="mt-2 text-[11px] text-slate-400 hover:text-sky-400 flex items-center gap-1 font-semibold"
                  >
                    <Info className="w-3 h-3" /> Ver possíveis recompensas & chances
                  </button>

                  {inspectingRates === 'sprinter' && lootTables && (
                    <div className="mt-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] space-y-1">
                      {lootTables.sprinter.entries.map((e, idx) => (
                        <div key={idx} className="flex justify-between text-slate-300">
                          <span>{e.icon} {e.label}</span>
                          <strong className="text-sky-400">{e.chancePct}%</strong>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Link
                  to="/profile"
                  className="mt-3.5 w-full py-2 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 font-bold text-xs border border-sky-500/30 flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>Ver no Perfil</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: MASCOTE GUARDIÃO & HÁBITOS (MIGRAÇÃO INTEGRAL) */}
      {activeTab === 'mascote' && pet && (
        <div className="space-y-5">
          {/* CARTÃO HERÓICO DO MASCOTE INTERATIVO */}
          <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-b ${petBgTheme} border p-5 sm:p-7 shadow-2xl transition-all duration-500`}>
            <div className="flex flex-col items-center text-center relative z-10">
              {/* Badges do Mascote: Nível, Moedas e Foco */}
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center mb-3">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs border border-emerald-500/30 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" />
                  Nível {pet.level}
                </span>
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  {pet.streakDays} {pet.streakDays === 1 ? 'Dia de Foco' : 'Dias Seguidos'}
                </span>
                <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-300 font-bold text-xs border border-yellow-500/30 flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-yellow-400" />
                  {pet.coins} NutriCoins
                </span>
              </div>

              {/* Avatar Interativo com Toque de Carinho */}
              <div className="my-1 cursor-pointer" onClick={handlePetInteraction} title="Toque para fazer carinho no mascote!">
                <PetAvatar
                  species={pet.species}
                  name={pet.name}
                  vitality={pet.vitality}
                  equipped={pet.equipped}
                  streakDays={pet.streakDays}
                  size="md"
                  interactive={true}
                  onPet={handlePetInteraction}
                />
              </div>

              {/* Edição de Nome */}
              <div className="flex items-center justify-center gap-2 mt-2">
                {isEditingPetName ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={tempPetName}
                      onChange={(e) => setTempPetName(e.target.value)}
                      maxLength={20}
                      className="bg-[#1F2937] border border-emerald-500/50 rounded-xl px-3 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      autoFocus
                    />
                    <button
                      onClick={handleSavePetName}
                      className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      {pet.name}
                    </h2>
                    <button
                      onClick={() => setIsEditingPetName(true)}
                      className="p-1 text-slate-400 hover:text-white transition-colors"
                      title="Renomear mascote"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-300 mt-1 max-w-md">
                Toque no mascote para interagir! Ele acompanha seu Herói em combate e evolui conforme seus hábitos.
              </p>

              {/* Barra de XP do Mascote */}
              <div className="w-full max-w-md mt-3">
                <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                  <span>Experiência (XP)</span>
                  <span className="font-bold text-emerald-400">
                    {pet.currentXp} / {pet.nextLevelXp} XP ({petXpPercent}%)
                  </span>
                </div>
                <div className="w-full bg-[#1F2937] rounded-full h-2.5 overflow-hidden border border-slate-700/60 shadow-inner">
                  <div
                    className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${petXpPercent}%` }}
                  />
                </div>
              </div>

              {/* Alternador Rápido de Forma do Mascote */}
              <div className="flex items-center gap-2 mt-4 p-1 bg-[#111827]/80 rounded-2xl border border-slate-700/50">
                <button
                  onClick={() => handleChangeSpecies('draco')}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                    pet.species === 'draco' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🐉 Draco
                </button>
                <button
                  onClick={() => handleChangeSpecies('kitsune')}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                    pet.species === 'kitsune' ? 'bg-orange-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🦊 Kitsune
                </button>
                <button
                  onClick={() => handleChangeSpecies('panda')}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                    pet.species === 'panda' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🐼 Panda
                </button>
              </div>
            </div>
          </div>

          {/* WIDGET DE HIDRATAÇÃO */}
          <WaterTrackerWidget
            currentCups={pet.vitality.waterCups}
            onAddCup={handleAddWater}
            onRemoveCup={handleRemoveWater}
          />

          {/* 4 BARRAS DE VITALIDADE DO MASCOTE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nutrição */}
            <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Utensils className="w-4 h-4 text-emerald-400" />
                  Nutrição & Saciedade
                </span>
                <span className="text-sm font-bold text-emerald-400">{pet.vitality.nutrition}%</span>
              </div>
              <div className="w-full bg-[#1F2937] rounded-full h-2.5 overflow-hidden mb-2.5">
                <div
                  className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${pet.vitality.nutrition}%` }}
                />
              </div>
              <p className="text-xs text-slate-400">
                Monte e registre refeições na aba <strong>Dieta</strong> para nutrir o mascote e ganhar baús.
              </p>
            </div>

            {/* Treino */}
            <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Dumbbell className="w-4 h-4 text-orange-400" />
                  Energia & Força
                </span>
                <span className="text-sm font-bold text-orange-400">{pet.vitality.workout}%</span>
              </div>
              <div className="w-full bg-[#1F2937] rounded-full h-2.5 overflow-hidden mb-2.5">
                <div
                  className="bg-orange-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${pet.vitality.workout}%` }}
                />
              </div>
              <p className="text-xs text-slate-400">
                Conclua suas séries na aba <strong>Treino</strong> para fortalecer o parceiro e acumular Baús do Titã.
              </p>
            </div>

            {/* Hidratação */}
            <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-sky-400" />
                  Nível de Hidratação
                </span>
                <span className="text-sm font-bold text-sky-400">{pet.vitality.hydration}%</span>
              </div>
              <div className="w-full bg-[#1F2937] rounded-full h-2.5 overflow-hidden mb-2.5">
                <div
                  className="bg-sky-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${pet.vitality.hydration}%` }}
                />
              </div>
              <p className="text-xs text-slate-400">
                Bata a meta de 8 copos diários para evitar desidratação e manter o mascote ativo.
              </p>
            </div>

            {/* Sabedoria */}
            <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-purple-400" />
                  Sabedoria Científica
                </span>
                <span className="text-sm font-bold text-purple-400">{pet.vitality.wisdom}%</span>
              </div>
              <div className="w-full bg-[#1F2937] rounded-full h-2.5 overflow-hidden mb-2.5">
                <div
                  className="bg-purple-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${pet.vitality.wisdom}%` }}
                />
              </div>
              <p className="text-xs text-slate-400">
                Responda o Desafio Diário e leia artigos para aumentar o intelecto e conquistar Baús do Sábio.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ABA 3: MISSÕES DIÁRIAS DO MASCOTE */}
      {activeTab === 'pet_quests' && pet && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Missões do Parceiro de Saúde
            </h3>
            <span className="text-xs text-slate-400">Renovam à meia-noite</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {petQuests.map((quest) => {
              const isClaimed = pet.completedQuests.includes(quest.id);
              const canClaim = quest.completed && !isClaimed;

              return (
                <div
                  key={quest.id}
                  className={`border rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                    isClaimed
                      ? 'bg-[#111827]/40 border-slate-800 opacity-60'
                      : canClaim
                      ? 'bg-emerald-950/20 border-emerald-500/40 shadow-lg shadow-emerald-500/5'
                      : 'bg-[#111827] border-[#1F2937]'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{quest.title}</h4>
                      {isClaimed && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Resgatado
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">{quest.description}</p>
                    <div className="flex items-center gap-3 pt-1">
                      <span className="text-xs font-semibold text-emerald-400">
                        +{quest.rewardXp} XP
                      </span>
                      <span className="text-xs font-semibold text-yellow-400 flex items-center gap-1">
                        <Coins className="w-3 h-3" /> +{quest.rewardCoins} Moedas
                      </span>
                    </div>
                  </div>

                  <div>
                    {isClaimed ? (
                      <button
                        disabled
                        className="px-4 py-2 rounded-xl bg-slate-800 text-slate-500 text-xs font-semibold cursor-not-allowed"
                      >
                        Concluído
                      </button>
                    ) : canClaim ? (
                      <button
                        onClick={() => handleClaimPetQuest(quest.id)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all animate-pulse"
                      >
                        Resgatar Recompensa
                      </button>
                    ) : (
                      <div className="text-right">
                        <span className="text-xs text-slate-400 font-semibold">
                          Progresso: {quest.current}/{quest.target}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ABA 4: LOJA DO MASCOTE */}
      {activeTab === 'shop' && pet && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-400" />
                Catálogo de Customização do Mascote
              </h3>
              <p className="text-xs text-slate-400">Use suas NutriCoins para personalizar seu parceiro</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 font-bold text-sm">
              <Coins className="w-4 h-4 text-yellow-400" />
              <span>{pet.coins} NutriCoins</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {shopItems.map((item) => {
              const isOwned = pet.inventory.includes(item.id);
              const isEquipped = pet.equipped[item.slot] === item.id;
              const canAfford = pet.coins >= item.price;

              return (
                <div
                  key={item.id}
                  className={`bg-[#111827] border rounded-2xl p-4 flex flex-col justify-between transition-all ${
                    isEquipped
                      ? 'border-emerald-500 shadow-md shadow-emerald-500/10'
                      : isOwned
                      ? 'border-slate-700'
                      : 'border-[#1F2937]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{item.icon}</span>
                      {isEquipped ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                          Equipado
                        </span>
                      ) : isOwned ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 font-medium">
                          Adquirido
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-yellow-400 flex items-center gap-1">
                          <Coins className="w-3.5 h-3.5" />
                          {item.price === 0 ? 'Grátis' : item.price}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-white">{item.name}</h4>
                    <p className="text-xs text-slate-400 mt-1">{item.description}</p>
                  </div>

                  <div className="pt-4">
                    {isOwned ? (
                      <button
                        onClick={() => handleToggleEquipShopItem(item)}
                        className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
                          isEquipped
                            ? 'bg-[#1F2937] text-slate-300 hover:text-white'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        }`}
                      >
                        {isEquipped ? 'Desequipar' : 'Equipar'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBuyShopItem(item)}
                        disabled={!canAfford}
                        className="w-full py-2 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-slate-950 text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-md shadow-yellow-500/10"
                      >
                        Comprar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ABA 5: JORNADA DE EVOLUÇÃO DO MASCOTE */}
      {activeTab === 'evolution' && pet && (
        <div className="bg-[#111827] border border-[#1F2937] rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
              <Award className="w-5 h-5 text-emerald-400" />
              Jornada de Evolução do Mascote
            </h3>
            <p className="text-xs text-slate-400">
              Cada marco de nível desbloqueia novas auras e potencializa os bônus que o parceiro concede em batalha.
            </p>
          </div>

          <div className="space-y-3">
            <div className={`p-4 rounded-2xl border ${pet.level >= 1 ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-[#1F2937]/30 border-slate-800'}`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white">Fase 1: Filhote Aprendiz (Nível 1 - 9)</span>
                <span className="text-xs text-emerald-400 font-semibold">{pet.level >= 1 ? 'Alcançado' : 'Bloqueado'}</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Início da jornada e sincronização inicial com os hábitos do herói.</p>
            </div>

            <div className={`p-4 rounded-2xl border ${pet.level >= 10 ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-[#1F2937]/30 border-slate-800'}`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white">Fase 2: Jovem Atleta (Nível 10 - 24)</span>
                <span className="text-xs text-emerald-400 font-semibold">{pet.level >= 10 ? 'Alcançado' : 'Bloqueado'}</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Ganha reflexos velozes e presença vibrante no palco de batalha.</p>
            </div>

            <div className={`p-4 rounded-2xl border ${pet.level >= 25 ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-[#1F2937]/30 border-slate-800'}`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white">Fase 3: Guardião Supremo (Nível 25 - 49)</span>
                <span className="text-xs text-emerald-400 font-semibold">{pet.level >= 25 ? 'Alcançado' : 'Bloqueado'}</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Aura de energia radiante permanente e alto vigor em combate.</p>
            </div>

            <div className={`p-4 rounded-2xl border ${pet.level >= 50 ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-[#1F2937]/30 border-slate-800'}`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white">Fase 4: Mestre Titã Lendário (Nível 50+)</span>
                <span className="text-xs text-emerald-400 font-semibold">{pet.level >= 50 ? 'Alcançado' : 'Bloqueado'}</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">O pico máximo de consistência e domínio da ciência do bem-estar.</p>
            </div>
          </div>
        </div>
      )}

      {/* MODAIS DO HERÓI */}

      {/* MODAL DA MOCHILA (🎒) */}
      {showBackpack && (
        <BackpackModal
          hero={hero}
          lootTables={lootTables}
          onHeroUpdate={(updated) => {
            setHero(updated);
            setStats(idleGameService.calculateLocalDerivedStats(updated));
          }}
          onOpenChest={(type) => {
            setShowBackpack(false);
            handleOpenChest(type);
          }}
          onClose={() => setShowBackpack(false)}
          onShowMessage={showNotification}
        />
      )}

      {/* MODAL DE ABERTURA DE BAÚ ANIMADO */}
      {openingChestType && chestReward && (
        <ChestOpeningModal
          chestType={openingChestType}
          remainingCount={hero.chests[openingChestType]}
          reward={chestReward}
          isProcessingNext={isOpeningChest}
          onOpenAnother={() => handleOpenChest(openingChestType)}
          onClose={() => {
            setOpeningChestType(null);
            setChestReward(null);
          }}
        />
      )}

      {/* MODAL DE CUSTOMIZAÇÃO DO AVATAR */}
      {showCustomizer && (
        <AvatarCustomizerModal
          initialCustomization={hero.customization}
          weightKg={user?.weight}
          heightCm={user?.height}
          bodyFatPct={user?.bodyFatPct}
          onSave={handleSaveCustomization}
          onClose={() => setShowCustomizer(false)}
        />
      )}

      {/* MODAL DE QUIZ DIÁRIO */}
      {showQuizModal && dailyQuiz && (
        <DailyQuizModal
          quiz={dailyQuiz}
          alreadyAnswered={quizAlreadyAnswered}
          userId={userId}
          onHeroUpdate={(updated) => {
            setHero(updated);
            setStats(idleGameService.calculateLocalDerivedStats(updated));
            setQuizAlreadyAnswered(true);
          }}
          onClose={() => setShowQuizModal(false)}
        />
      )}

      {/* MODAL DE RECOMPENSAS AFK */}
      {showAfkModal && afkReport && (
        <AfkRewardModal
          report={afkReport}
          onClaim={() => setShowAfkModal(false)}
        />
      )}
    </div>
  );
};
