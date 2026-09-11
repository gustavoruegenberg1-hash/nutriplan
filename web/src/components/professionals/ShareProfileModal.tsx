import React, { useState } from 'react';
import { User } from '../../types';
import { SharedProfileContext } from '../../types/professionals';
import { ShieldCheck, X, CheckSquare, Square, Share2, AlertCircle } from 'lucide-react';

interface ShareProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onConfirmShare: (data: SharedProfileContext) => Promise<void>;
}

export const ShareProfileModal: React.FC<ShareProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onConfirmShare,
}) => {
  const [shareGoal, setShareGoal] = useState(true);
  const [shareBiometrics, setShareBiometrics] = useState(true);
  const [shareDietary, setShareDietary] = useState(true);
  const [shareTraining, setShareTraining] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !user) return null;

  const handleShare = async () => {
    setIsSubmitting(true);
    try {
      const data: SharedProfileContext = {
        sharedAt: new Date().toISOString(),
      };

      if (shareGoal && user.goal) {
        data.goal = user.goal;
      }
      if (shareBiometrics) {
        if (user.weight) data.weight = user.weight;
        if (user.height) data.height = user.height;
      }
      if (shareDietary) {
        const restrictions = [
          ...(user.allergies || []),
          ...(user.intolerances || []),
        ];
        if (user.dietaryRestrictionsNotes) {
          restrictions.push(user.dietaryRestrictionsNotes);
        }
        if (restrictions.length > 0) {
          data.dietaryRestrictions = restrictions;
        }
      }
      if (shareTraining) {
        const parts: string[] = [];
        if (user.experienceLevel) parts.push(`Nível: ${user.experienceLevel}`);
        if (user.trainingFrequencyDays) parts.push(`${user.trainingFrequencyDays}x por semana`);
        if (user.physicalDisabilityNotes) parts.push(`Limitações: ${user.physicalDisabilityNotes}`);
        if (parts.length > 0) {
          data.trainingExperience = parts.join(' | ');
        }
      }

      await onConfirmShare(data);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-surface border border-surface-border rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative">
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Título e Ícone */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              Compartilhar Dados de Saúde
            </h3>
            <p className="text-xs text-slate-400">
              Controle estrito de privacidade e consentimento
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-300 mb-4 leading-relaxed">
          Selecione quais dados do seu perfil NutriPlan você deseja compartilhar com o profissional
          para que ele possa analisar seu caso e personalizar sua orientação:
        </p>

        {/* Opções de Seleção com Consentimento */}
        <div className="space-y-2.5 mb-5">
          {/* 1. Objetivo */}
          <div
            onClick={() => setShareGoal(!shareGoal)}
            className="p-3 rounded-xl bg-surface-alt border border-slate-700/60 flex items-start gap-3 cursor-pointer hover:border-slate-600 transition-colors"
          >
            <span className="text-emerald-400 mt-0.5">
              {shareGoal ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-500" />}
            </span>
            <div className="text-xs">
              <strong className="text-white block">Objetivo Principal</strong>
              <span className="text-slate-400">
                {user.goal || 'Meta cadastrada no perfil (ex: hipertrofia, emagrecimento)'}
              </span>
            </div>
          </div>

          {/* 2. Biometria */}
          <div
            onClick={() => setShareBiometrics(!shareBiometrics)}
            className="p-3 rounded-xl bg-surface-alt border border-slate-700/60 flex items-start gap-3 cursor-pointer hover:border-slate-600 transition-colors"
          >
            <span className="text-emerald-400 mt-0.5">
              {shareBiometrics ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-500" />}
            </span>
            <div className="text-xs">
              <strong className="text-white block">Dados Biométricos</strong>
              <span className="text-slate-400">
                {user.weight ? `${user.weight} kg` : 'Peso não informado'} &bull;{' '}
                {user.height ? `${user.height} cm` : 'Altura não informada'}
              </span>
            </div>
          </div>

          {/* 3. Restrições e Alergias */}
          <div
            onClick={() => setShareDietary(!shareDietary)}
            className="p-3 rounded-xl bg-surface-alt border border-slate-700/60 flex items-start gap-3 cursor-pointer hover:border-slate-600 transition-colors"
          >
            <span className="text-emerald-400 mt-0.5">
              {shareDietary ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-500" />}
            </span>
            <div className="text-xs">
              <strong className="text-white block">Restrições Alimentares e Alergias</strong>
              <span className="text-slate-400">
                Alergias, intolerâncias e notas alimentares cadastradas
              </span>
            </div>
          </div>

          {/* 4. Treino e Limitações */}
          <div
            onClick={() => setShareTraining(!shareTraining)}
            className="p-3 rounded-xl bg-surface-alt border border-slate-700/60 flex items-start gap-3 cursor-pointer hover:border-slate-600 transition-colors"
          >
            <span className="text-emerald-400 mt-0.5">
              {shareTraining ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-500" />}
            </span>
            <div className="text-xs">
              <strong className="text-white block">Histórico de Treino e Limitações</strong>
              <span className="text-slate-400">
                Frequência de treinos, nível de experiência e dores articulares
              </span>
            </div>
          </div>
        </div>

        {/* Aviso de Privacidade */}
        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2 text-[11px] text-slate-400 mb-5">
          <AlertCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Os dados serão enviados apenas dentro deste chat criptografado e seguro.</span>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            onClick={handleShare}
            disabled={isSubmitting || (!shareGoal && !shareBiometrics && !shareDietary && !shareTraining)}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-xs shadow-md shadow-emerald-950/50 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>{isSubmitting ? 'Compartilhando...' : 'Compartilhar no Chat'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
