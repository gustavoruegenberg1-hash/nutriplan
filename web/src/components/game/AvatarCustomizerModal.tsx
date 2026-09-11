import React, { useState } from 'react';
import { HeroCustomization } from '../../types/idleGame';
import { HeroAvatar } from './HeroAvatar';
import { X, Check, Sparkles, User, Palette } from 'lucide-react';
import { triggerHapticFeedback } from '../../utils/mobile';

interface AvatarCustomizerModalProps {
  initialCustomization: HeroCustomization;
  weightKg?: number | null;
  heightCm?: number | null;
  bodyFatPct?: number | null;
  onSave: (customization: HeroCustomization) => void;
  onClose: () => void;
}

const SKIN_TONES = [
  { label: 'Muito Claro (I)', color: '#FCE0D4' },
  { label: 'Claro (II)', color: '#F3C5A5' },
  { label: 'Médio Claro (III)', color: '#E5B288' },
  { label: 'Trigueiro / Dourado (IV)', color: '#C68652' },
  { label: 'Moreno Castanho (V)', color: '#965E36' },
  { label: 'Moreno Escuro (VI)', color: '#6A3D1E' },
  { label: 'Negro / Ébano', color: '#432616' },
  { label: 'Cobre / Solar', color: '#B87333' },
];

const HAIR_STYLES = [
  { id: 'short', label: 'Curto Atlético' },
  { id: 'buzz', label: 'Raspado / Militar' },
  { id: 'wavy', label: 'Ondulado Livre' },
  { id: 'ponytail', label: 'Longo Amarrado' },
  { id: 'dreadlocks', label: 'Dreadlocks' },
  { id: 'afro', label: 'Afro Volumoso' },
  { id: 'pompadour', label: 'Topete Clássico' },
  { id: 'bald', label: 'Careca' },
];

const HAIR_COLORS = [
  { label: 'Castanho Escuro', color: '#2B1B17' },
  { label: 'Preto', color: '#111827' },
  { label: 'Loiro Dourado', color: '#D4AF37' },
  { label: 'Ruivo Queimado', color: '#8D3A1B' },
  { label: 'Grisalho', color: '#9CA3AF' },
  { label: 'Platinado', color: '#E5E7EB' },
  { label: 'Azul Elétrico', color: '#2563EB' },
  { label: 'Verde Neon', color: '#10B981' },
];

const BEARD_STYLES = [
  { id: 'none', label: 'Sem Barba' },
  { id: 'stubble', label: 'Por Fazer' },
  { id: 'full', label: 'Barba Cheia' },
  { id: 'goatee', label: 'Cavanhaque' },
  { id: 'mustache', label: 'Bigode' },
];

export const AvatarCustomizerModal: React.FC<AvatarCustomizerModalProps> = ({
  initialCustomization,
  weightKg,
  heightCm,
  bodyFatPct,
  onSave,
  onClose,
}) => {
  const [custom, setCustom] = useState<HeroCustomization>(initialCustomization);
  const [tab, setTab] = useState<'skin' | 'hair' | 'beard' | 'gender'>('skin');

  const handleSave = () => {
    triggerHapticFeedback();
    onSave(custom);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#111827] border border-[#1F2937] rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1F2937]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base sm:text-lg font-extrabold text-white">
              Personalizar Aparência do Herói
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#1F2937] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo: Espelho do Avatar + Controles */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Espelho / Preview ao Vivo */}
          <div className="flex flex-col items-center justify-center bg-gradient-to-b from-[#0F172A] to-[#1E293B] border border-[#1F2937] rounded-2xl p-6 relative">
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 mb-3">
              Pré-Visualização em Tempo Real
            </span>

            <HeroAvatar
              customization={custom}
              weightKg={weightKg}
              heightCm={heightCm}
              bodyFatPct={bodyFatPct}
              size="lg"
            />

            <p className="text-[10px] text-slate-400 text-center mt-3">
              Silhueta calculada: {weightKg || 75}kg • {heightCm || 175}cm
              {bodyFatPct ? ` • ${bodyFatPct}% Gordura` : ''}
            </p>
          </div>

          {/* Abas de Opções */}
          <div className="space-y-4">
            {/* Navegação entre abas */}
            <div className="flex border-b border-[#1F2937] pb-2 gap-2 text-xs font-bold">
              <button
                onClick={() => setTab('skin')}
                className={`pb-1 px-2 border-b-2 transition-colors ${
                  tab === 'skin' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                Pele
              </button>
              <button
                onClick={() => setTab('hair')}
                className={`pb-1 px-2 border-b-2 transition-colors ${
                  tab === 'hair' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                Cabelo
              </button>
              <button
                onClick={() => setTab('beard')}
                className={`pb-1 px-2 border-b-2 transition-colors ${
                  tab === 'beard' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                Barba
              </button>
              <button
                onClick={() => setTab('gender')}
                className={`pb-1 px-2 border-b-2 transition-colors ${
                  tab === 'gender' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                Gênero
              </button>
            </div>

            {/* ABA: TOM DE PELE */}
            {tab === 'skin' && (
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-300 block">Escolha o Tom de Pele:</label>
                <div className="grid grid-cols-4 gap-2.5">
                  {SKIN_TONES.map((t) => (
                    <button
                      key={t.color}
                      onClick={() => {
                        triggerHapticFeedback();
                        setCustom((prev) => ({ ...prev, skinTone: t.color }));
                      }}
                      className={`h-12 rounded-xl border-2 transition-all flex items-center justify-center ${
                        custom.skinTone === t.color
                          ? 'border-emerald-400 scale-105 shadow-md shadow-emerald-500/20'
                          : 'border-transparent hover:scale-102'
                      }`}
                      style={{ backgroundColor: t.color }}
                      title={t.label}
                    >
                      {custom.skinTone === t.color && <Check className="w-5 h-5 text-slate-900 drop-shadow" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ABA: CABELO & COR */}
            {tab === 'hair' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-2">Estilo de Cabelo:</label>
                  <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                    {HAIR_STYLES.map((h) => (
                      <button
                        key={h.id}
                        onClick={() => {
                          triggerHapticFeedback();
                          setCustom((prev) => ({ ...prev, hairStyle: h.id as any }));
                        }}
                        className={`text-xs py-2 px-3 rounded-xl border text-left font-semibold transition-all ${
                          custom.hairStyle === h.id
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                            : 'bg-[#1F2937]/50 border-slate-700 text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        {h.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-2">Cor do Cabelo:</label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {HAIR_COLORS.map((c) => (
                      <button
                        key={c.color}
                        onClick={() => {
                          triggerHapticFeedback();
                          setCustom((prev) => ({ ...prev, hairColor: c.color, beardColor: c.color }));
                        }}
                        className={`w-7 h-7 rounded-full border-2 transition-transform ${
                          custom.hairColor === c.color ? 'border-emerald-400 scale-110' : 'border-slate-700'
                        }`}
                        style={{ backgroundColor: c.color }}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ABA: BARBA */}
            {tab === 'beard' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-2">Estilo de Barba:</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {BEARD_STYLES.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => {
                          triggerHapticFeedback();
                          setCustom((prev) => ({ ...prev, beardStyle: b.id as any }));
                        }}
                        className={`text-xs py-2 px-3 rounded-xl border text-left font-semibold transition-all ${
                          custom.beardStyle === b.id
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                            : 'bg-[#1F2937]/50 border-slate-700 text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-2">Cor da Barba:</label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {HAIR_COLORS.map((c) => (
                      <button
                        key={c.color}
                        onClick={() => {
                          triggerHapticFeedback();
                          setCustom((prev) => ({ ...prev, beardColor: c.color }));
                        }}
                        className={`w-7 h-7 rounded-full border-2 transition-transform ${
                          custom.beardColor === c.color ? 'border-emerald-400 scale-110' : 'border-slate-700'
                        }`}
                        style={{ backgroundColor: c.color }}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ABA: GÊNERO */}
            {tab === 'gender' && (
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-300 block">Proporção do Tórax / Pelve:</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['male', 'female', 'neutral'] as const).map((g) => (
                    <button
                      key={g}
                      onClick={() => {
                        triggerHapticFeedback();
                        setCustom((prev) => ({ ...prev, gender: g }));
                      }}
                      className={`text-xs py-3 rounded-xl border font-bold capitalize transition-all ${
                        custom.gender === g
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                          : 'bg-[#1F2937]/50 border-slate-700 text-slate-300'
                      }`}
                    >
                      {g === 'male' ? 'Masculino' : g === 'female' ? 'Feminino' : 'Neutro'}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Rodapé com Botões */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#1F2937] bg-[#0B0F17]/60">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Salvar Personalização</span>
          </button>
        </div>
      </div>
    </div>
  );
};
