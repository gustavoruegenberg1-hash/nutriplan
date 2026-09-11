import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PetProfile } from '../../types/gamification';
import { PetAvatar } from './PetAvatar';
import { Flame, Droplets, Utensils, Dumbbell, BookOpen, ChevronRight, Heart, Coins } from 'lucide-react';
import { gamificationService } from '../../services/gamificationService';

interface DashboardPetCardProps {
  initialPet: PetProfile;
  userId: string;
}

export const DashboardPetCard: React.FC<DashboardPetCardProps> = ({ initialPet, userId }) => {
  const [pet, setPet] = useState<PetProfile>(initialPet);
  const [floatingMsg, setFloatingMsg] = useState<string | null>(null);

  const showNotification = (text: string) => {
    setFloatingMsg(text);
    setTimeout(() => setFloatingMsg(null), 3000);
  };

  const handleDrinkWater = async () => {
    const res = await gamificationService.recordAction(userId, 'DRINK_WATER');
    setPet({ ...res.pet });
    showNotification(res.message);
  };

  const handlePet = async () => {
    const res = await gamificationService.recordAction(userId, 'PET_PET');
    setPet({ ...res.pet });
    showNotification(res.message);
  };

  const xpPercent = Math.min(100, Math.round((pet.currentXp / pet.nextLevelXp) * 100));

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#111827] via-[#0F172A] to-[#1E293B] border border-emerald-500/20 rounded-2xl p-4 sm:p-6 shadow-xl mb-6">
      {/* Luz ambiente sutil de fundo */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Notificação flutuante de XP / Level Up */}
      {floatingMsg && (
        <div className="absolute top-3 right-3 z-30 bg-emerald-600/90 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-lg border border-emerald-400/30 animate-fade-in">
          {floatingMsg}
        </div>
      )}

      <div className="flex flex-col md:flex-row items-center justify-between gap-5 relative z-10">
        {/* Lado Esquerdo: Mascote Interativo */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex-shrink-0">
            <PetAvatar
              species={pet.species}
              name={pet.name}
              vitality={pet.vitality}
              equipped={pet.equipped}
              streakDays={pet.streakDays}
              size="md"
              interactive={true}
              onPet={handlePet}
            />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
                {pet.name}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                Nível {pet.level}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold flex items-center gap-1 border border-amber-500/30">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                {pet.streakDays} {pet.streakDays === 1 ? 'dia' : 'dias'}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 text-xs font-semibold flex items-center gap-1 border border-yellow-500/30">
                <Coins className="w-3.5 h-3.5 text-yellow-400" />
                {pet.coins}
              </span>
            </div>

            {/* Barra de XP */}
            <div className="mt-2 w-full max-w-xs">
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>XP para o próximo nível</span>
                <span className="font-semibold text-emerald-400">
                  {pet.currentXp} / {pet.nextLevelXp} ({xpPercent}%)
                </span>
              </div>
              <div className="w-full bg-surface-alt rounded-full h-2 overflow-hidden border border-[#374151]">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
            </div>

            {/* 4 Indicadores Rápidos de Vitalidade */}
            <div className="grid grid-cols-4 gap-2 mt-3 max-w-xs text-center">
              <div className="bg-surface-alt/70 rounded-lg p-1.5 border border-surface-border/50">
                <div className="flex items-center justify-center text-sky-400 text-xs gap-0.5 font-bold">
                  <Droplets className="w-3 h-3" /> {pet.vitality.hydration}%
                </div>
                <span className="text-[9px] text-slate-400">Água</span>
              </div>
              <div className="bg-surface-alt/70 rounded-lg p-1.5 border border-surface-border/50">
                <div className="flex items-center justify-center text-emerald-400 text-xs gap-0.5 font-bold">
                  <Utensils className="w-3 h-3" /> {pet.vitality.nutrition}%
                </div>
                <span className="text-[9px] text-slate-400">Dieta</span>
              </div>
              <div className="bg-surface-alt/70 rounded-lg p-1.5 border border-surface-border/50">
                <div className="flex items-center justify-center text-orange-400 text-xs gap-0.5 font-bold">
                  <Dumbbell className="w-3 h-3" /> {pet.vitality.workout}%
                </div>
                <span className="text-[9px] text-slate-400">Treino</span>
              </div>
              <div className="bg-surface-alt/70 rounded-lg p-1.5 border border-surface-border/50">
                <div className="flex items-center justify-center text-purple-400 text-xs gap-0.5 font-bold">
                  <BookOpen className="w-3 h-3" /> {pet.vitality.wisdom}%
                </div>
                <span className="text-[9px] text-slate-400">Ciência</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lado Direito: Ações Rápidas e Botão de Acesso */}
        <div className="flex flex-row md:flex-col items-center justify-between md:justify-center gap-2 w-full md:w-auto border-t md:border-t-0 md:border-l border-surface-border pt-3 md:pt-0 md:pl-5">
          <div className="flex items-center gap-2">
            <button
              onClick={handleDrinkWater}
              className="px-3 py-2 rounded-xl bg-sky-600/90 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-sky-600/20 active:scale-95 transition-all"
              title="Beber copo d'água (+250ml e +10 XP)"
            >
              <Droplets className="w-3.5 h-3.5" />
              <span>Beber Água</span>
            </button>
            <button
              onClick={handlePet}
              className="px-3 py-2 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-rose-600/20 active:scale-95 transition-all"
              title="Acariciar o mascote (+5 XP)"
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Carinho</span>
            </button>
          </div>

          <Link
            to="/jogo?tab=mascote"
            className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors py-1 group"
          >
            <span>Ver no NutriHero</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};
