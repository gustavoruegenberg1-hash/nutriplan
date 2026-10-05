import React, { useState } from 'react';
import {
  GameCharacter,
  FurnitureItem,
  CareerTrack,
  GameNotification,
  InGameMeal,
  InGameWorkoutItem,
  ShopItem,
} from './types/game';
import { IsometricRoom } from './components/IsometricRoom';
import { PaperDollViewer } from './components/PaperDollViewer';
import { CareerHub } from './components/CareerHub';
import { ProductivityCard } from './components/ProductivityCard';
import { SleepScheduleModal } from './components/SleepScheduleModal';
import { InGamePlannerModal } from './components/InGamePlannerModal';
import { GameShopModal } from './components/GameShopModal';
import { NotificationToast } from './components/NotificationToast';
import {
  Sparkles,
  Coins,
  Zap,
  Dumbbell,
  Layers,
  Briefcase,
  Home,
  ShoppingBag,
  ExternalLink,
  Moon,
  Droplet,
  Send,
} from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'room' | 'paperdoll' | 'careers'>('room');

  // Modais de Controle
  const [isSleepModalOpen, setIsSleepModalOpen] = useState(false);
  const [isPlannerModalOpen, setIsPlannerModalOpen] = useState(false);
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);

  // Notificação Ativa
  const [activeNotification, setActiveNotification] = useState<GameNotification | null>({
    id: 'n_welcome',
    type: 'water',
    title: '💧 Lembrete de Hidratação!',
    message: 'Que tal beber 250ml de água fresca agora para acelerar seu Foco Arcano?',
    rewardKamas: 15,
    rewardStamina: 10,
    rewardXp: 20,
    actionText: 'Bebi 250ml de Água! ✨',
  });

  // Estado Inicial do Personagem integrado às métricas reais do NutriPlan
  const [character, setCharacter] = useState<GameCharacter>({
    id: 'char_01',
    name: 'Gael Arcanista',
    title: 'Noviço da Alquimia Corporal',
    level: 3,
    currentXp: 180,
    nextLevelXp: 300,
    kamas: 650,
    disciplineTokens: 14,
    streakDays: 7,
    isRestDay: false,
    statusEffect: 'energized',
    paperDoll: {
      skinTone: '#E2A772',
      eyes: 'default',
      hairStyle: 'spiky',
      hairColor: '#D97706',
      bottom: 'jeans',
      shoes: 'sneakers',
      top: 'tank_top',
      accessories: 'glasses',
      heldItem: 'water_bottle',
    },
    attributes: {
      vigor: 85,
      lucidity: 90,
      discipline: 75,
      energy: 85,
      maxEnergy: 100,
    },
    sleep: {
      bedtime: '23:00',
      wakeupTime: '07:00',
      isSleeping: false,
      lastQualityPct: 88,
      morningBuffActive: true,
    },
    productivity: {
      totalScore: 84, // 40% Dieta (85) + 35% Treino (85) + 25% Sono (80)
      dietScore: 85,
      workoutScore: 85,
      sleepScore: 80,
      daysStreakAbove80: 3,
      targetDaysForPromo: 5,
    },
  });

  // Móveis no Quarto Isométrico
  const [furniture] = useState<FurnitureItem[]>([
    {
      id: 'bed_01',
      name: 'Cama Ortopédica Alquímica',
      category: 'bed',
      tileX: 1,
      tileY: 1,
      tileWidth: 1,
      tileHeight: 1,
      icon: '🛏️',
      color: '#475569',
      buffDescription: 'Clique para colocar o avatar para dormir ou configurar seus horários de sono.',
    },
    {
      id: 'desk_01',
      name: 'Estação de Planejamento & Estudos',
      category: 'desk',
      tileX: 5,
      tileY: 1,
      tileWidth: 1,
      tileHeight: 1,
      icon: '💻',
      color: '#334155',
      buffDescription: 'Clique para abrir o Montador In-Game de Dieta e Treino e exportar para o NutriPlan.',
    },
    {
      id: 'gym_01',
      name: 'Halteres de Forja Pesada',
      category: 'gym',
      tileX: 1,
      tileY: 5,
      tileWidth: 1,
      tileHeight: 1,
      icon: '🏋️',
      color: '#64748b',
      buffDescription: 'Exibe troféus de disciplina e auras conquistadas pelos treinos reais do NutriPlan.',
    },
    {
      id: 'coffee_01',
      name: 'Cafeteira a Vapor Arcano',
      category: 'alchemy',
      tileX: 5,
      tileY: 5,
      tileWidth: 1,
      tileHeight: 1,
      icon: '☕',
      color: '#78350f',
      buffDescription: 'Prepara café termogênico que reduz o consumo de Stamina para trabalhar.',
    },
  ]);

  // Carreiras Iniciais
  const [careers, setCareers] = useState<CareerTrack[]>([
    {
      id: 'tech_alchemy',
      name: 'Alquimia de Dados / Tech',
      tagline: 'Desenvolva glifos e arquiteturas magitech corporativas.',
      icon: '⚡',
      rankTitle: 'Desenvolvedor de Glifos Jr.',
      level: 1,
      requiredAttribute: 'lucidity',
      baseSalary: 120,
      salaryPerShift: 120,
      shiftDurationMinutes: 5,
      isWorking: false,
      canBePromoted: false,
    },
    {
      id: 'combat_gladiator',
      name: 'Gladiador Urbano / Atleta',
      tagline: 'Lute na arena elemental e mostre seu condicionamento.',
      icon: '🥊',
      rankTitle: 'Sparring de Academia',
      level: 1,
      requiredAttribute: 'vigor',
      baseSalary: 150,
      salaryPerShift: 150,
      shiftDurationMinutes: 10,
      isWorking: false,
      canBePromoted: false,
    },
    {
      id: 'chef_alchemist',
      name: 'Chef Alquímico / Culinária',
      tagline: 'Prepare elixires saudáveis e poções nutritivas.',
      icon: '🍲',
      rankTitle: 'Mixologista de Elixires',
      level: 1,
      requiredAttribute: 'discipline',
      baseSalary: 110,
      salaryPerShift: 110,
      shiftDurationMinutes: 5,
      isWorking: false,
      canBePromoted: false,
    },
  ]);

  // Recálculo da Barra de Produtividade (40% Dieta + 35% Treino + 25% Sono)
  const recalculateProductivity = (
    dietScore: number,
    workoutScore: number,
    sleepScore: number
  ) => {
    const total = Math.min(100, Math.round(0.4 * dietScore + 0.35 * workoutScore + 0.25 * sleepScore));
    return total;
  };

  // 1. Ação de Simular Meta na Barra de Produtividade
  const handleSimulateGoal = (pillar: 'diet' | 'workout' | 'sleep') => {
    setCharacter((prev) => {
      let { dietScore, workoutScore, sleepScore, daysStreakAbove80 } = prev.productivity;

      if (pillar === 'diet') dietScore = Math.min(100, dietScore + 10);
      if (pillar === 'workout') workoutScore = Math.min(100, workoutScore + 10);
      if (pillar === 'sleep') sleepScore = Math.min(100, sleepScore + 10);

      const newTotal = recalculateProductivity(dietScore, workoutScore, sleepScore);
      if (newTotal >= 80 && prev.productivity.totalScore < 80) {
        daysStreakAbove80 = Math.min(prev.productivity.targetDaysForPromo, daysStreakAbove80 + 1);
      }

      return {
        ...prev,
        productivity: {
          ...prev.productivity,
          totalScore: newTotal,
          dietScore,
          workoutScore,
          sleepScore,
          daysStreakAbove80,
        },
      };
    });
  };

  // 2. Interação Contextual com Móveis do Quarto Isométrico
  const handleInteractFurniture = (item: FurnitureItem) => {
    if (item.category === 'bed') {
      setIsSleepModalOpen(true);
    } else if (item.category === 'desk') {
      setIsPlannerModalOpen(true);
    } else if (item.category === 'gym') {
      handleSimulateGoal('workout');
    } else if (item.category === 'alchemy') {
      setCharacter((prev) => ({
        ...prev,
        attributes: {
          ...prev.attributes,
          energy: Math.min(prev.attributes.maxEnergy, prev.attributes.energy + 15),
        },
      }));
    }
  };

  // 3. Confirmar Ação da Notificação Interativa (Ganha Recursos)
  const handleConfirmNotification = () => {
    if (!activeNotification) return;

    setCharacter((prev) => ({
      ...prev,
      kamas: prev.kamas + activeNotification.rewardKamas,
      currentXp: prev.currentXp + activeNotification.rewardXp,
      attributes: {
        ...prev.attributes,
        energy: Math.min(
          prev.attributes.maxEnergy,
          prev.attributes.energy + activeNotification.rewardStamina
        ),
      },
    }));

    // Se for água, aumenta lucidez e pontuação de dieta
    if (activeNotification.type === 'water') {
      handleSimulateGoal('diet');
    }

    setActiveNotification(null);
  };

  // 4. Exportação do Planejador In-Game para o NutriPlan Clínico
  const handleExportToNutriPlan = (meals: InGameMeal[], workouts: InGameWorkoutItem[]) => {
    // Sincroniza via LocalStorage para o site web/ poder ler instantaneamente
    try {
      localStorage.setItem('nutriplan_ingame_diet', JSON.stringify(meals));
      localStorage.setItem('nutriplan_ingame_workout', JSON.stringify(workouts));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }

    // Eleva produtividade para 100% e premia o jogador
    setCharacter((prev) => ({
      ...prev,
      kamas: prev.kamas + 75,
      currentXp: prev.currentXp + 60,
      productivity: {
        ...prev.productivity,
        totalScore: 98,
        dietScore: 100,
        workoutScore: 100,
        daysStreakAbove80: Math.min(5, prev.productivity.daysStreakAbove80 + 1),
      },
    }));

    setActiveNotification({
      id: `export_${Date.now()}`,
      type: 'export',
      title: '🚀 Sincronização Concluída!',
      message: 'Seu plano de dieta e treino foi enviado com sucesso para a rotina do NutriPlan.',
      rewardKamas: 75,
      rewardStamina: 30,
      rewardXp: 60,
      actionText: 'Maravilha! Ver Rotina ✨',
    });
  };

  // 5. Compra no Centro Comercial (Salão de Beleza, Roupas, Imóveis)
  const handleBuyShopItem = (item: ShopItem) => {
    if (character.kamas < item.price) return;

    setCharacter((prev) => {
      const nextKamas = prev.kamas - item.price;
      const nextLayers = { ...prev.paperDoll };

      if (item.category === 'hair_style') {
        nextLayers.hairStyle = item.previewValue;
      } else if (item.category === 'hair_color') {
        nextLayers.hairColor = item.previewValue;
      } else if (item.category === 'top') {
        nextLayers.top = item.previewValue;
      }

      return {
        ...prev,
        kamas: nextKamas,
        paperDoll: nextLayers,
      };
    });

    setIsShopModalOpen(false);
  };

  // 6. Turnos de Trabalho & Promoção
  const handleStartShift = (careerId: string) => {
    setCharacter((prev) => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        energy: Math.max(0, prev.attributes.energy - 20),
      },
    }));

    setCareers((prev) =>
      prev.map((c) => (c.id === careerId ? { ...c, isWorking: true } : c))
    );
  };

  const handleClaimShift = (careerId: string) => {
    const career = careers.find((c) => c.id === careerId);
    if (!career) return;

    const isHigh = character.productivity.totalScore >= 80;
    const finalSalary = isHigh ? Math.round(career.salaryPerShift * 1.2) : career.salaryPerShift;

    setCharacter((prev) => ({
      ...prev,
      kamas: prev.kamas + finalSalary,
      currentXp: prev.currentXp + 45,
    }));

    setCareers((prev) =>
      prev.map((c) => (c.id === careerId ? { ...c, isWorking: false } : c))
    );
  };

  const handlePromoteCareer = (careerId: string) => {
    setCareers((prev) =>
      prev.map((c) =>
        c.id === careerId
          ? {
              ...c,
              level: c.level + 1,
              salaryPerShift: Math.round(c.salaryPerShift * 1.4),
              rankTitle: `${c.rankTitle} Especialista`,
            }
          : c
      )
    );

    setCharacter((prev) => ({
      ...prev,
      kamas: prev.kamas + 300,
      productivity: {
        ...prev.productivity,
        daysStreakAbove80: 0, // Reinicia contagem para a próxima promoção
      },
    }));

    setActiveNotification({
      id: `promo_${Date.now()}`,
      type: 'promo',
      title: '🎉 PROMOÇÃO DE CARGO CONQUISTADA!',
      message: 'Sua consistência exemplar em Dieta, Treino e Sono garantiu um aumento de 40% no salário!',
      rewardKamas: 300,
      rewardStamina: 50,
      rewardXp: 100,
      actionText: 'Comemorar Promoção! 👑',
    });
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-[#070A10] text-slate-100 overflow-hidden">
      {/* TOAST DE NOTIFICAÇÃO INTERATIVA */}
      <NotificationToast
        notification={activeNotification}
        onConfirm={handleConfirmNotification}
        onDismiss={() => setActiveNotification(null)}
      />

      {/* MODAL DE CICLO DE SONO */}
      <SleepScheduleModal
        sleep={character.sleep}
        isOpen={isSleepModalOpen}
        onClose={() => setIsSleepModalOpen(false)}
        onUpdateSchedule={(bedtime, wakeupTime) =>
          setCharacter((prev) => ({
            ...prev,
            sleep: { ...prev.sleep, bedtime, wakeupTime },
          }))
        }
        onToggleSleepState={() =>
          setCharacter((prev) => ({
            ...prev,
            sleep: { ...prev.sleep, isSleeping: !prev.sleep.isSleeping },
          }))
        }
        onTriggerNotificationSim={(type) => {
          setActiveNotification({
            id: `sim_${Date.now()}`,
            type,
            title: type === 'sleep' ? '🌙 Hora de Descansar!' : '☀️ Bom dia, Aventureiro!',
            message:
              type === 'sleep'
                ? 'Coloque seu personagem na cama para regenerar estamina passiva.'
                : 'Seu descanso concedeu o Buff de Revigoramento Matinal (+20% Produtividade)!',
            rewardKamas: 20,
            rewardStamina: 25,
            rewardXp: 30,
            actionText: type === 'sleep' ? 'Deitar na Cama 💤' : 'Despertar e Produzir! ⚡',
          });
          setIsSleepModalOpen(false);
        }}
      />

      {/* MODAL DO MONTADOR DE DIETA & TREINO IN-GAME */}
      <InGamePlannerModal
        isOpen={isPlannerModalOpen}
        onClose={() => setIsPlannerModalOpen(false)}
        onExportToNutriPlan={handleExportToNutriPlan}
      />

      {/* MODAL DO CENTRO COMERCIAL (LOJA, SALÃO, ROUPAS) */}
      <GameShopModal
        character={character}
        isOpen={isShopModalOpen}
        onClose={() => setIsShopModalOpen(false)}
        onBuyItem={handleBuyShopItem}
      />

      {/* HEADER SUPERIOR: RECURSOS DO LIFE SIM & SINCRONIZAÇÃO */}
      <header className="h-16 border-b border-slate-800 bg-[#0B0F19]/90 backdrop-blur-md px-6 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center font-black text-slate-950 shadow-md">
            NL
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wide text-white flex items-center gap-1.5">
              NutriLife Sim
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono px-2 py-0.5 rounded-full border border-amber-500/30">
                Ankama 2D
              </span>
            </h1>
            <p className="text-[10px] text-slate-400">Simulador de Vida & Fantasia Urbana Isométrica</p>
          </div>
        </div>

        {/* HUD DE MOEDAS & RECURSOS */}
        <div className="flex items-center gap-3 sm:gap-6 text-xs">
          {/* Kamas (Ouro) */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-amber-500/30">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="font-extrabold text-amber-300 font-mono">{character.kamas}</span>
            <span className="text-[10px] text-slate-400">Kamas</span>
          </div>

          {/* Tokens de Disciplina (Treino) */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-rose-500/30">
            <Dumbbell className="w-4 h-4 text-rose-400" />
            <span className="font-extrabold text-rose-300 font-mono">{character.disciplineTokens}</span>
            <span className="text-[10px] text-slate-400">Disciplina</span>
          </div>

          {/* Stamina Ativa */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-emerald-500/30">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span className="font-extrabold text-emerald-300 font-mono">
              {character.attributes.energy}/{character.attributes.maxEnergy}
            </span>
          </div>

          {/* Botão de Abrir Loja / Centro Comercial */}
          <button
            onClick={() => setIsShopModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:brightness-110 text-slate-950 font-black text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Lojas & Salão</span>
          </button>
        </div>

        {/* NAVEGAÇÃO DE ABAS */}
        <nav className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('room')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'room'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Quarto Isométrico</span>
          </button>

          <button
            onClick={() => setActiveTab('paperdoll')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'paperdoll'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Perfil & Guarda-Roupa</span>
          </button>

          <button
            onClick={() => setActiveTab('careers')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'careers'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Carreiras & Empregos</span>
          </button>
        </nav>
      </header>

      {/* ÁREA CENTRAL PRINCIPAL */}
      <main className="flex-1 flex flex-col md:flex-row p-4 gap-4 overflow-hidden">
        {/* Painel Central do Jogo */}
        <div className="flex-1 h-full overflow-y-auto pr-1 flex flex-col gap-4">
          {/* Card da Barra de Produtividade sempre visível no topo da tela do jogo */}
          <ProductivityCard
            productivity={character.productivity}
            onSimulateGoal={handleSimulateGoal}
          />

          <div className="flex-1 min-h-[440px]">
            {activeTab === 'room' && (
              <IsometricRoom
                character={character}
                furniture={furniture}
                onInteractFurniture={handleInteractFurniture}
              />
            )}

            {activeTab === 'paperdoll' && (
              <PaperDollViewer
                character={character}
                onChangeLayers={(newLayers) =>
                  setCharacter((prev) => ({ ...prev, paperDoll: newLayers }))
                }
              />
            )}

            {activeTab === 'careers' && (
              <CareerHub
                character={character}
                careers={careers}
                onStartShift={handleStartShift}
                onClaimShift={handleClaimShift}
                onPromote={handlePromoteCareer}
              />
            )}
          </div>
        </div>

        {/* SIDEBAR LATERAL: CONTROLES DE ROTINA, SONO & EXPORTAÇÃO */}
        <aside className="w-full md:w-80 bg-slate-900/90 border border-slate-800 rounded-3xl p-4 flex flex-col justify-between shrink-0 shadow-2xl">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-xs font-black tracking-wider text-slate-300 uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Estação de Hábitos
              </h3>
              <a
                href="http://localhost:5173"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-teal-400 hover:underline flex items-center gap-0.5"
                title="Abrir o site clínico do NutriPlan"
              >
                <span>Abrir Site</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

            {/* Ações Rápidas de Planejador e Sono */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setIsPlannerModalOpen(true)}
                className="w-full p-2.5 rounded-xl bg-gradient-to-r from-teal-500/20 to-emerald-500/20 border border-teal-500/40 hover:border-teal-300 transition-all text-left flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-teal-500/20 text-teal-300 rounded-lg">💻</span>
                  <div>
                    <h5 className="text-xs font-bold text-white">Montar Dieta & Treino</h5>
                    <p className="text-[10px] text-teal-300">Editor In-Game + Exportar</p>
                  </div>
                </div>
                <Send className="w-3.5 h-3.5 text-teal-400" />
              </button>

              <button
                onClick={() => setIsSleepModalOpen(true)}
                className="w-full p-2.5 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/40 hover:border-indigo-300 transition-all text-left flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-indigo-500/20 text-indigo-300 rounded-lg">🌙</span>
                  <div>
                    <h5 className="text-xs font-bold text-white">Ciclo de Sono ({character.sleep.bedtime})</h5>
                    <p className="text-[10px] text-indigo-300">
                      {character.sleep.isSleeping ? 'Dormindo na cama 💤' : 'Configurar Horários'}
                    </p>
                  </div>
                </div>
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
              </button>

              <button
                onClick={() =>
                  setActiveNotification({
                    id: `sim_water_${Date.now()}`,
                    type: 'water',
                    title: '💧 Alerta de Água!',
                    message: 'Hora de beber seu próximo copo de 250ml para manter o Foco mental.',
                    rewardKamas: 15,
                    rewardStamina: 10,
                    rewardXp: 20,
                    actionText: 'Bebi 250ml de Água! ✨',
                  })
                }
                className="w-full p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 hover:border-cyan-400 transition-all text-left flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-cyan-500/20 text-cyan-300 rounded-lg">💧</span>
                  <div>
                    <h5 className="text-xs font-bold text-white">Testar Alerta de Água</h5>
                    <p className="text-[10px] text-cyan-300">Dispara notificação com recompensa</p>
                  </div>
                </div>
                <Droplet className="w-3.5 h-3.5 text-cyan-400" />
              </button>
            </div>
          </div>

          {/* STATUS DO AVATAR & BARRA DE PROGRESSÃO DE NÍVEL */}
          <div className="pt-3 border-t border-slate-800">
            <div className="flex justify-between text-[11px] mb-1 font-mono">
              <span className="text-slate-400">Progresso de Nível ({character.level})</span>
              <span className="text-emerald-400 font-bold">
                {character.currentXp} / {character.nextLevelXp} XP
              </span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, (character.currentXp / character.nextLevelXp) * 100)}%`,
                }}
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-2 text-center">
              NutriLife Sim • 100% Sincronizado com o NutriPlan
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
};
export default App;
