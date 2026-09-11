import React, { useEffect, useState, useRef } from 'react';
import { HeroProfile, DerivedHeroStats, UltraprocessedMonster } from '../../types/idleGame';
import { PetProfile } from '../../types/gamification';
import { HeroAvatar } from './HeroAvatar';
import { PetAvatar } from '../pet/PetAvatar';
import { Shield, Zap, Sparkles, Heart, Coins, UserCheck, BookOpen, Swords } from 'lucide-react';
import { triggerHapticFeedback } from '../../utils/mobile';
import { idleGameService } from '../../services/idleGameService';

interface BattleStageProps {
  hero: HeroProfile;
  stats: DerivedHeroStats;
  currentMonster: UltraprocessedMonster;
  pet?: PetProfile | null;
  weightKg?: number | null;
  heightCm?: number | null;
  bodyFatPct?: number | null;
  onMonsterDefeated?: (gold: number, xp: number, newStage: number) => void;
  onHeroDefeated?: (newStage: number, message: string) => void;
  onAdvanceStage?: () => Promise<void> | void;
  onOpenBackpack?: () => void;
  onOpenCustomizer?: () => void;
  onOpenQuiz?: () => void;
}

interface FloatingDamage {
  id: number;
  damage: number;
  isCrit: boolean;
  xOffset: number;
}

export const BattleStage: React.FC<BattleStageProps> = ({
  hero,
  stats,
  currentMonster,
  pet,
  weightKg,
  heightCm,
  bodyFatPct,
  onMonsterDefeated,
  onHeroDefeated,
  onAdvanceStage,
  onOpenBackpack,
  onOpenCustomizer,
  onOpenQuiz,
}) => {
  // Estado de Vida dos Combatentes
  const [monsterHp, setMonsterHp] = useState<number>(hero.dungeonProgress.currentMonsterHp ?? 85);
  const [monsterMaxHp, setMonsterMaxHp] = useState<number>(hero.dungeonProgress.currentMonsterMaxHp ?? 85);
  const [heroHp, setHeroHp] = useState<number>(hero.dungeonProgress.currentHeroHp ?? stats.maxHp);
  const [heroMaxHp, setHeroMaxHp] = useState<number>(stats.maxHp);

  const [activeMonster, setActiveMonster] = useState<UltraprocessedMonster>(currentMonster);
  const [stageStatus, setStageStatus] = useState<'in_battle' | 'stage_cleared' | 'hero_defeated'>(
    hero.dungeonProgress.stageStatus || 'in_battle'
  );
  const [defeatFeedback, setDefeatFeedback] = useState<string | null>(null);
  const [isAdvancing, setIsAdvancing] = useState(false);

  // Animações
  const [isHeroAttacking, setIsHeroAttacking] = useState(false);
  const [isMonsterHit, setIsMonsterHit] = useState(false);
  const [isHeroHit, setIsHeroHit] = useState(false);
  const [isPetCheering, setIsPetCheering] = useState(false);

  // Danos Flutuantes
  const [damageFloats, setDamageFloats] = useState<FloatingDamage[]>([]);
  const [heroDamageFloats, setHeroDamageFloats] = useState<FloatingDamage[]>([]);

  const hitCounterRef = useRef(0);
  const stage = hero.dungeonProgress.currentStage;
  const isBoss = stage % 5 === 0;

  // Intervalo de Ataque Automático baseado na Velocidade (SPD)
  const attackIntervalMs = Math.max(1200, Math.min(2200, Math.round(220000 / stats.speed)));
  const timerRef = useRef<any>(null);
  const isAttackingRef = useRef(false);

  // Sincroniza atributos do herói e monstro quando o estágio ou stats mudam
  useEffect(() => {
    setHeroMaxHp(stats.maxHp);
    if (!heroHp || heroHp <= 0) {
      setHeroHp(hero.dungeonProgress.currentHeroHp ?? stats.maxHp);
    }
  }, [stats.maxHp]);

  useEffect(() => {
    setActiveMonster(currentMonster);
    setMonsterMaxHp(hero.dungeonProgress.currentMonsterMaxHp);
    setMonsterHp(hero.dungeonProgress.currentMonsterHp);
    if (hero.dungeonProgress.stageStatus) {
      setStageStatus(hero.dungeonProgress.stageStatus);
    }
  }, [hero.dungeonProgress.currentStage, currentMonster]);

  const monsterHpRef = useRef(monsterHp);
  const heroHpRef = useRef(heroHp);
  useEffect(() => {
    monsterHpRef.current = monsterHp;
  }, [monsterHp]);
  useEffect(() => {
    heroHpRef.current = heroHp;
  }, [heroHp]);

  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Loop de Batalha Contínuo (Nunca interrompe o combate ao morrer ou abater monstros)
  useEffect(() => {
    timerRef.current = setInterval(async () => {
      if (isAttackingRef.current) return;
      isAttackingRef.current = true;

      // 1. Início do Golpe: Avatar arma o ataque
      setIsHeroAttacking(true);

      // 2. Momento do Impacto (150ms)
      const t1 = setTimeout(async () => {
        try {
          const res = await idleGameService.executeAttack(
            hero.userId,
            monsterHpRef.current,
            heroHpRef.current
          );

          // Posições alternadas para os números flutuantes
          hitCounterRef.current += 1;
          const slot = hitCounterRef.current % 3;
          const baseX = slot === 0 ? -28 : slot === 1 ? 28 : 0;
          const xOffset = baseX + Math.round(Math.random() * 10 - 5);

          // Dano causado no monstro
          const damageId = Date.now() + Math.random();
          const newMonsterDmg: FloatingDamage = {
            id: damageId,
            damage: res.damageDealt,
            isCrit: res.isCrit,
            xOffset,
          };
          setDamageFloats((prev) => [...prev.slice(-2), newMonsterDmg]);

          // Dano sofrido pelo herói (Contra-ataque)
          const heroDmgId = Date.now() + Math.random() + 1;
          const newHeroDmg: FloatingDamage = {
            id: heroDmgId,
            damage: res.monsterDamageDealt,
            isCrit: false,
            xOffset: -xOffset,
          };
          setHeroDamageFloats((prev) => [...prev.slice(-2), newHeroDmg]);

          // Limpa números após 1150ms
          const tClean = setTimeout(() => {
            setDamageFloats((prev) => prev.filter((d) => d.id !== damageId));
            setHeroDamageFloats((prev) => prev.filter((d) => d.id !== heroDmgId));
          }, 1150);
          timeoutsRef.current.push(tClean);

          // Disparo de tremores e feedback
          setIsMonsterHit(true);
          setIsHeroHit(true);
          setIsPetCheering(true);

          // Atualiza HP em tempo real com piso em 0
          setMonsterHp(res.nextMonsterHp);
          setMonsterMaxHp(res.nextMonsterMaxHp);
          setHeroHp(res.nextHeroHp);
          setHeroMaxHp(res.nextHeroMaxHp);

          triggerHapticFeedback();

          // Retorno da animação aos 160ms
          const tRecovery = setTimeout(() => {
            setIsMonsterHit(false);
            setIsHeroHit(false);
            setIsHeroAttacking(false);
            setIsPetCheering(false);
            isAttackingRef.current = false;
          }, 160);
          timeoutsRef.current.push(tRecovery);

          // Caso 1: O Herói Morreu (Regride de fase e CONTINUA LUTANDO!)
          if (res.heroDied) {
            triggerHapticFeedback();
            setDefeatFeedback(`O Herói foi derrotado na Fase ${hero.dungeonProgress.currentStage}! Recuando para a Fase ${res.newStage}...`);
            setActiveMonster(res.monster);
            setMonsterHp(res.nextMonsterHp);
            setMonsterMaxHp(res.nextMonsterMaxHp);
            setHeroHp(res.nextHeroHp);
            if (onHeroDefeated) {
              onHeroDefeated(res.newStage, res.message || '');
            }
            // Não interrompe o loop! Continua lutando na fase anterior
          } else if (res.isMonsterDead) {
            // Caso 2: O Monstro Morreu (Farm contínuo na fase atual com renascimento imediato)
            triggerHapticFeedback();
            setMonsterHp(res.nextMonsterHp);
            setMonsterMaxHp(res.nextMonsterMaxHp);
            if (onMonsterDefeated) {
              onMonsterDefeated(res.goldEarned, res.xpEarned, res.newStage);
            }
          }
        } catch {
          isAttackingRef.current = false;
          setIsHeroAttacking(false);
        }
      }, 150);
      timeoutsRef.current.push(t1);
    }, attackIntervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
      isAttackingRef.current = false;
    };
  }, [hero.userId, stats, attackIntervalMs, onMonsterDefeated, onHeroDefeated]);

  // Avanço manual de fase acionado estritamente pelo usuário
  const handleAdvanceStage = async () => {
    if (isAdvancing) return;
    try {
      setIsAdvancing(true);
      triggerHapticFeedback();
      const res = await idleGameService.advanceStage(hero.userId);
      setMonsterHp(res.monsterMaxHp);
      setMonsterMaxHp(res.monsterMaxHp);
      setActiveMonster(res.monster);
      setHeroHp(res.heroHp);
      setStageStatus('in_battle');
      setDefeatFeedback(null);
      if (onAdvanceStage) {
        await onAdvanceStage();
      }
    } finally {
      setIsAdvancing(false);
    }
  };

  const monsterHpPercent = Math.max(0, Math.min(100, Math.round((monsterHp / monsterMaxHp) * 100)));
  const heroHpPercent = Math.max(0, Math.min(100, Math.round((heroHp / heroMaxHp) * 100)));
  const xpPercent = Math.min(100, Math.round((hero.currentXp / hero.nextLevelXp) * 100));

  // Bônus passivo do mascote
  const petSpecies = pet?.species || 'draco';
  const petName = pet?.name || 'Mascote Guardião';
  const petBuff =
    petSpecies === 'draco'
      ? '+10% Dano de Ataque'
      : petSpecies === 'kitsune'
      ? '+12% Cadência Veloz'
      : '+15% Defesa & Resistência';

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#0F172A] via-[#111827] to-[#0B0F17] border border-[#1F2937] p-3.5 sm:p-5 shadow-2xl">
      {/* Luz ambiente da arena */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* BARRA SUPERIOR INTEGRADA NO TOPO DO COMBATE IDLE */}
      <div className="flex items-center justify-between border-b border-[#1F2937] pb-3 mb-3.5 relative z-10 flex-wrap gap-2.5">
        {/* Esquerda: Nível, Nome, XP e Moedas */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="px-2.5 py-0.5 rounded-xl bg-slate-800 text-slate-200 font-black text-xs border border-slate-700">
              Estágio {stage}
            </span>
            {isBoss && (
              <span className="px-2 py-0.5 rounded-xl bg-amber-500/20 text-amber-300 font-extrabold text-[10px] border border-amber-500/30 flex items-center gap-1 animate-pulse">
                👑 CHEFE
              </span>
            )}
            <h1 className="text-sm sm:text-base font-black text-white ml-1">{hero.name}</h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-[10px] border border-emerald-500/30">
              Nv. {hero.level}
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#0B0F17] border border-slate-800 text-yellow-300">
              <Coins className="w-3.5 h-3.5 text-yellow-400" />
              {hero.gold}
            </span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#0B0F17] border border-slate-800 text-purple-300">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              {hero.upgradeEssences}
            </span>
          </div>

          {/* Barra de XP */}
          <div className="w-20 sm:w-28 hidden lg:block" title={`XP: ${hero.currentXp} / ${hero.nextLevelXp}`}>
            <div className="w-full bg-[#1F2937] rounded-full h-1.5 overflow-hidden border border-slate-700">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Direita: Ações Rápidas (🎒 Mochila, 👤 Personalizar, 🔬 Quiz) */}
        <div className="flex items-center gap-2">
          {onOpenBackpack && (
            <button
              onClick={() => {
                triggerHapticFeedback();
                onOpenBackpack();
              }}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all active:scale-95"
              title="Abrir Mochila e Equipamentos"
            >
              <span className="text-sm">🎒</span>
              <span>Mochila</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-950 text-amber-400 text-[10px]">
                {hero.inventory.length}
              </span>
            </button>
          )}

          {onOpenCustomizer && (
            <button
              onClick={onOpenCustomizer}
              className="p-1.5 sm:p-2 rounded-xl bg-[#1F2937] hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all active:scale-95"
              title="Personalizar Aparência do Herói"
            >
              <UserCheck className="w-4 h-4 text-emerald-400" />
            </button>
          )}

          {onOpenQuiz && (
            <button
              onClick={onOpenQuiz}
              className="p-1.5 sm:p-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/30 transition-all active:scale-95"
              title="Desafio Científico Diário"
            >
              <BookOpen className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* PALCO DE BATALHA: HERÓI + PET VS MONSTRO ULTRAPROCESSADO */}
      <div className="grid grid-cols-2 gap-3 sm:gap-6 items-center relative z-10 py-1">
        {/* LADO ESQUERDO: HERÓI + MASCOTE COMPANHEIRO */}
        <div className="flex flex-col items-center text-center relative">
          <div className="relative flex items-center justify-center">
            {/* Danos sofridos pelo Herói (💥 -X) */}
            {heroDamageFloats.map((d) => (
              <div
                key={d.id}
                className="absolute -top-6 left-1/2 -translate-x-1/2 font-black pointer-events-none z-30 animate-damage-float text-rose-400 text-sm sm:text-base drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
                style={{ '--x-offset': `${d.xOffset}px` } as React.CSSProperties}
              >
                💥 -{d.damage}
              </div>
            ))}

            {/* Avatar do Herói com reação de impacto */}
            <div className={`transition-transform duration-150 ${isHeroHit ? 'scale-95 -translate-x-1' : ''}`}>
              <HeroAvatar
                customization={hero.customization}
                equipped={hero.equipped}
                weightKg={weightKg}
                heightCm={heightCm}
                bodyFatPct={bodyFatPct}
                size="md"
                isAttacking={isHeroAttacking}
              />
            </div>

            {/* PET COMPANHEIRO AO LADO DO HERÓI */}
            <div
              className={`absolute -bottom-2 -right-3 sm:-right-6 z-20 transition-transform duration-200 ${
                isPetCheering ? 'scale-110 -translate-y-2' : 'hover:scale-105'
              }`}
              title={`${petName} (${petBuff})`}
            >
              <div className="relative">
                {isPetCheering && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-xs animate-bounce">
                    ✨
                  </span>
                )}
                <PetAvatar
                  species={petSpecies}
                  name={petName}
                  vitality={pet?.vitality || { hydration: 80, waterCups: 8, nutrition: 80, workout: 80, wisdom: 80 }}
                  equipped={pet?.equipped}
                  size="sm"
                  interactive={false}
                />
              </div>
            </div>
          </div>

          {/* Nome e Barra de Vida do Avatar (❤️ 100/100) */}
          <div className="w-full max-w-[160px] sm:max-w-xs mt-2.5">
            <h4 className="text-xs sm:text-sm font-extrabold text-white flex items-center justify-center gap-1 truncate">
              {hero.name}
            </h4>

            {/* BARRA DE VIDA DO AVATAR */}
            <div className="w-full bg-[#1F2937] rounded-full h-2.5 sm:h-3 overflow-hidden border border-slate-700 shadow-inner mt-1">
              <div
                className="bg-gradient-to-r from-emerald-600 via-teal-500 to-green-400 h-full rounded-full transition-all duration-150"
                style={{ width: `${heroHpPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5 font-mono">
              <span className="flex items-center gap-0.5 text-emerald-400 font-bold">
                <Heart className="w-3 h-3 text-emerald-400 fill-emerald-500/20" /> Vida
              </span>
              <span className="font-bold text-slate-200">
                {heroHp} / {heroMaxHp} ({heroHpPercent}%)
              </span>
            </div>
          </div>
        </div>

        {/* LADO DIREITO: MONSTRO ULTRAPROCESSADO */}
        <div className="flex flex-col items-center text-center relative">
          <div className="relative">
            {/* NÚMEROS DE DANO FLUTUANTE NO MONSTRO */}
            {damageFloats.map((d) => (
              <div
                key={d.id}
                className={`absolute -top-6 left-1/2 -translate-x-1/2 font-black pointer-events-none z-30 animate-damage-float ${
                  d.isCrit
                    ? 'text-amber-300 text-base sm:text-xl drop-shadow-[0_2px_8px_rgba(245,158,11,0.9)]'
                    : 'text-white text-sm sm:text-base drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]'
                }`}
                style={{ '--x-offset': `${d.xOffset}px` } as React.CSSProperties}
              >
                {d.isCrit ? `🔥 CRÍTICO! -${d.damage}` : `⚔️ -${d.damage}`}
              </div>
            ))}

            {/* Avatar do Monstro com Animação de Tremor no Impacto */}
            <div
              className={`w-28 h-28 sm:w-36 sm:h-36 rounded-3xl border-2 flex items-center justify-center transition-all duration-150 shadow-xl ${
                isMonsterHit
                  ? 'scale-90 rotate-2 bg-red-950/60 border-red-500 shadow-red-500/20'
                  : 'bg-[#1F2937]/50 border-slate-700 hover:scale-102'
              }`}
            >
              <span className="text-5xl sm:text-6xl drop-shadow-md select-none">
                {activeMonster.icon}
              </span>
            </div>
          </div>

          {/* Nome e Barra de Vida do Monstro */}
          <div className="w-full max-w-[160px] sm:max-w-xs mt-2.5">
            <h4 className="text-xs sm:text-sm font-extrabold text-white truncate">
              {activeMonster.name}
            </h4>
            <p className="text-[10px] text-slate-400 truncate mb-1">
              {activeMonster.title}
            </p>

            {/* Barra de Vida Animada com Piso em 0 */}
            <div className="w-full bg-[#1F2937] rounded-full h-2.5 sm:h-3 overflow-hidden border border-slate-700 shadow-inner">
              <div
                className="bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 h-full rounded-full transition-all duration-150"
                style={{ width: `${monsterHpPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5 font-mono">
              <span className="flex items-center gap-0.5">
                <Heart className="w-3 h-3 text-red-400" /> HP
              </span>
              <span className="font-bold text-slate-200">
                {monsterHp} / {monsterMaxHp} ({monsterHpPercent}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* NOTIFICAÇÃO NÃO-BLOQUEANTE DE RECUO DE FASE (CONTINUA LUTANDO) */}
      {defeatFeedback && (
        <div className="mt-3.5 p-3 rounded-2xl bg-rose-950/70 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center justify-between gap-2 animate-in fade-in">
          <span className="flex items-center gap-1.5">
            💀 {defeatFeedback}
          </span>
          <span className="text-[10px] text-slate-400 font-normal">
            Luta contínua ativa
          </span>
        </div>
      )}

      {/* BARRA DE CONTROLE E DESAFIO DA PRÓXIMA FASE (COMBATE CONTÍNUO) */}
      <div className="mt-3.5 p-3 sm:p-3.5 rounded-2xl bg-[#111827] border border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="text-left">
          <span className="text-xs font-black text-white flex items-center gap-1.5">
            ⚔️ Farmando na Fase {stage}
            {hero.dungeonProgress.highestStage > stage && (
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px]">
                Recorde: Fase {hero.dungeonProgress.highestStage}
              </span>
            )}
          </span>
          <span className="text-[11px] text-slate-400">
            O avatar continua lutando sem parar. Avance quando desejar desafiar o próximo nível!
          </span>
        </div>

        <button
          onClick={handleAdvanceStage}
          disabled={isAdvancing}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:brightness-110 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Swords className="w-4 h-4" />
          <span>{isAdvancing ? 'Avançando...' : `DESAFIAR FASE ${stage + 1} ⚔️`}</span>
        </button>
      </div>

      {/* RODAPÉ DA ARENA: RESUMO DE PODER & BÔNUS DO PET */}
      <div className="mt-3.5 pt-2.5 border-t border-[#1F2937] flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            Ataque: <strong className="text-white">{stats.attack}</strong>
          </span>
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-sky-400" />
            Defesa: <strong className="text-white">{stats.defense} ({stats.damageReductionPct}%)</strong>
          </span>
          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
            <Sparkles className="w-3 h-3" />
            Crítico: {stats.critRate}%
          </span>
        </div>

        <div className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300">
          🐾 Companheiro: {petBuff}
        </div>
      </div>
    </div>
  );
};
