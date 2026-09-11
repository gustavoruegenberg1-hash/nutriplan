import React from 'react';
import { Professional } from '../../types/professionals';
import {
  Utensils,
  Dumbbell,
  MapPin,
  Star,
  CheckCircle2,
  MessageCircle,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

interface ProfessionalCardProps {
  professional: Professional;
  onChatClick: (prof: Professional) => void;
  onViewProfile: (prof: Professional) => void;
}

export const ProfessionalCard: React.FC<ProfessionalCardProps> = ({
  professional,
  onChatClick,
  onViewProfile,
}) => {
  const isNutritionist = professional.type === 'NUTRITIONIST';
  const isAvailable = professional.status === 'ACTIVE';

  return (
    <div className="bg-surface rounded-2xl border border-surface-border p-5 hover:border-slate-600 transition-all duration-200 flex flex-col justify-between shadow-lg relative group">
      <div>
        {/* Cabeçalho do Card: Foto, Badges e Status */}
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
            <img
              src={professional.avatarUrl}
              alt={professional.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-surface-border group-hover:border-emerald-500/40 transition-colors shadow-md"
              loading="lazy"
            />
            {professional.isVerified && (
              <span
                title="Profissional Credenciado e Verificado"
                className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-0.5 rounded-full ring-2 ring-surface shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* Tag de Especialidade / Profissão */}
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  isNutritionist
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                }`}
              >
                {isNutritionist ? (
                  <>
                    <Utensils className="w-3 h-3" />
                    Nutricionista
                  </>
                ) : (
                  <>
                    <Dumbbell className="w-3 h-3" />
                    Personal Trainer
                  </>
                )}
              </span>

              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-surface-alt text-slate-300 border border-slate-700">
                {professional.registrationNumber}
              </span>
            </div>

            {/* Nome do Profissional */}
            <h3
              onClick={() => onViewProfile(professional)}
              className="text-base sm:text-lg font-bold text-white hover:text-emerald-400 cursor-pointer transition-colors truncate"
            >
              {professional.name}
            </h3>

            {/* Subtítulo / Especialidade Principal */}
            <p className="text-xs sm:text-sm text-slate-300 font-medium line-clamp-1">
              {professional.specialty}
            </p>
          </div>
        </div>

        {/* Avaliações, Experiência e Localização */}
        <div className="flex items-center gap-3 text-xs text-slate-400 mt-3 pt-3 border-t border-surface-border/60 flex-wrap">
          <div className="flex items-center gap-1 text-amber-300 font-semibold">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{professional.rating.toFixed(1)}</span>
            <span className="text-slate-400 font-normal text-[11px]">
              ({professional.reviewCount})
            </span>
          </div>

          <span className="text-slate-600">&bull;</span>

          <span className="text-slate-300 font-medium">
            {professional.experienceYears} anos de exp.
          </span>

          <span className="text-slate-600">&bull;</span>

          <div className="flex items-center gap-1 text-slate-400 text-[11px] truncate">
            <MapPin className="w-3 h-3 text-slate-500 flex-shrink-0" />
            <span className="truncate">{professional.location}</span>
          </div>
        </div>

        {/* Breve Resumo da Bio */}
        <p className="text-xs text-slate-400 mt-2.5 line-clamp-2 leading-relaxed">
          {professional.bio}
        </p>
      </div>

      {/* Rodapé do Card: Status e Ações */}
      <div className="mt-4 pt-3 border-t border-surface-border/80 flex items-center justify-between gap-2">
        {/* Status de Disponibilidade */}
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
            }`}
          />
          <span
            className={`text-xs font-semibold ${
              isAvailable ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isAvailable ? 'Disponível' : 'Agenda Fechada'}
          </span>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewProfile(professional)}
            className="px-3 py-1.5 rounded-xl bg-surface-alt hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>Ver perfil</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <button
            onClick={() => onChatClick(professional)}
            disabled={!isAvailable}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
              isAvailable
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95 cursor-pointer shadow-emerald-950/40'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Conversar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
