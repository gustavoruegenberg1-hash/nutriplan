import React, { useState } from 'react';
import { DailyQuizQuestion, HeroProfile } from '../../types/idleGame';
import { X, BookOpen, Sparkles, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { triggerHapticFeedback } from '../../utils/mobile';
import { idleGameService } from '../../services/idleGameService';
import { Link } from 'react-router-dom';

interface DailyQuizModalProps {
  quiz: DailyQuizQuestion;
  alreadyAnswered: boolean;
  userId: string;
  onHeroUpdate: (hero: HeroProfile) => void;
  onClose: () => void;
}

export const DailyQuizModal: React.FC<DailyQuizModalProps> = ({
  quiz,
  alreadyAnswered,
  userId,
  onHeroUpdate,
  onClose,
}) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(alreadyAnswered);
  const [result, setResult] = useState<{
    correct: boolean;
    message: string;
    explanation: string;
    articleSlug: string;
  } | null>(null);

  const handleSubmitAnswer = async () => {
    if (selectedIdx === null || hasSubmitted) return;
    triggerHapticFeedback();

    const res = await idleGameService.answerDailyQuiz(userId, quiz.id, selectedIdx);
    setResult(res);
    setHasSubmitted(true);
    onHeroUpdate(res.hero);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#111827] border border-[#1F2937] rounded-3xl w-full max-w-lg p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#1F2937]"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Topo */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
              Desafio Científico Diário
            </span>
            <h3 className="text-sm sm:text-base font-extrabold text-white">{quiz.title}</h3>
          </div>
        </div>

        {/* Pergunta */}
        <div className="bg-[#0B0F17] border border-slate-800 rounded-2xl p-4 mb-4">
          <p className="text-xs sm:text-sm font-semibold text-slate-200 leading-relaxed">
            {quiz.question}
          </p>
        </div>

        {/* Opções */}
        <div className="space-y-2 mb-5">
          {quiz.options.map((opt, idx) => {
            const isSelected = selectedIdx === idx;
            return (
              <button
                key={idx}
                disabled={hasSubmitted}
                onClick={() => {
                  triggerHapticFeedback();
                  setSelectedIdx(idx);
                }}
                className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-purple-600/20 border-purple-400 text-white shadow-md'
                    : 'bg-[#1F2937]/50 border-slate-700/60 text-slate-300 hover:border-slate-500'
                } disabled:cursor-not-allowed`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#111827] border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-400 flex-shrink-0">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{opt}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Feedback / Explicação Científica */}
        {result && (
          <div
            className={`p-4 rounded-2xl border mb-4 ${
              result.correct
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5 font-bold text-xs sm:text-sm">
              {result.correct ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{result.message}</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-amber-400" />
                  <span>{result.message}</span>
                </>
              )}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              {result.explanation}
            </p>

            <Link
              to={`/articles/${result.articleSlug}`}
              onClick={onClose}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <span>Ler artigo completo na íntegra</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Botão de Envio */}
        {!hasSubmitted ? (
          <button
            onClick={handleSubmitAnswer}
            disabled={selectedIdx === null}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-purple-600/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Confirmar Resposta (+1 Inteligência)</span>
          </button>
        ) : (
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-2xl bg-[#1F2937] hover:bg-slate-700 text-white text-xs font-bold transition-all"
          >
            Fechar Desafio
          </button>
        )}
      </div>
    </div>
  );
};
