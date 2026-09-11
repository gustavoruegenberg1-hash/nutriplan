import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { Article } from '../types';
import {
  ArrowLeft,
  ExternalLink,
  Calendar,
  User,
  Sparkles,
  ShieldAlert,
  FileText,
  Lightbulb,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
} from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';
import { gamificationService } from '../services/gamificationService';
import { articleService } from '../services/articleService';

export const ArticleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, refreshProfile } = useAuth();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!id) return;
        const data = await articleService.getArticleById(id);
        if (!data) {
          setError('Artigo não encontrado.');
          return;
        }
        setArticle(data);

        // Marca como lido de forma persistente por usuário
        const userId = user?.id || 'guest';
        const storageKey = `nutriplan_read_articles_${userId}`;
        const localSaved = localStorage.getItem(storageKey);
        let list: string[] = [];
        if (localSaved) {
          try {
            list = JSON.parse(localSaved);
          } catch {
            list = [];
          }
        }

        if (id && !list.includes(id)) {
          list.push(id);
          localStorage.setItem(storageKey, JSON.stringify(list));
          gamificationService.recordAction(userId, 'ARTICLE_READ');
        }

        if (user && id && (!user.readArticles || !user.readArticles.includes(id))) {
          const updatedReadArticles = Array.from(new Set([...(user.readArticles || []), id]));
          api.patch('/auth/profile', { readArticles: updatedReadArticles }).then(() => {
            if (refreshProfile) refreshProfile();
          }).catch((e) => console.warn('Erro ao sincronizar leitura no perfil:', e));
        }
      } catch (err: any) {
        console.error('Erro ao buscar artigo', err);
        setError('Não foi possível carregar o artigo científico solicitado.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchArticle();
    }
  }, [id, user?.id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4 animate-in fade-in">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-violet-500 border-t-transparent" />
        <p className="text-slate-400 text-sm">Carregando dados científicos e análise didática...</p>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6 animate-in fade-in">
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm max-w-md mx-auto">
          {error || 'Artigo não encontrado.'}
        </div>
        <Link
          to="/articles"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para a Biblioteca Científica</span>
        </Link>
      </div>
    );
  }

  const ed = article.educationalArticle;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      {/* Botão de Retorno */}
      <Link
        to="/articles"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Voltar para a Biblioteca de Artigos</span>
      </Link>

      {/* Cabeçalho Bibliográfico Acadêmico */}
      <div className="bg-surface border border-surface-border rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full text-xs font-bold bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/30 uppercase tracking-wider"
            >
              {tag}
            </span>
          ))}
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
          {article.title}
        </h1>

        {/* Metadados Acadêmicos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-surface-border text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-violet-400 flex-shrink-0" />
            <span className="truncate">
              <strong>Autores:</strong> {article.authors || 'Pesquisadores'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-violet-400 flex-shrink-0" />
            <span>
              <strong>Ano:</strong> {article.year || new Date(article.publishedAt).getFullYear()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-violet-400 flex-shrink-0" />
            <span className="truncate">
              <strong>Periódico:</strong> {article.journal || 'PubMed Central'}
            </span>
          </div>
        </div>

        {/* Link para o Artigo Original */}
        {article.sourceUrl && /^https?:\/\//i.test(article.sourceUrl) && (
          <div className="pt-2">
            <a
              href={article.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs transition-all shadow-lg shadow-violet-600/20"
            >
              <span>Acessar Artigo Original no PubMed / Fonte</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            {article.doi && (
              <span className="text-[11px] text-slate-400 ml-3">
                DOI: {article.doi}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Matéria Didática Explicativa da IA */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">
              Matéria Didática & Explicação Científica
            </h2>
            <span className="text-xs text-slate-400">
              Resumo didático estruturado baseado estritamente nas evidências do estudo
            </span>
          </div>
        </div>

        {/* Seção 1: O que foi investigado */}
        <div className="bg-surface border border-surface-border rounded-2xl p-6 shadow-md space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-violet-300">
            <HelpCircle className="w-4 h-4 text-violet-400" />
            <h3>1. O que este estudo investigou?</h3>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed pl-6">
            {ed?.investigated || article.summary}
          </p>
        </div>

        {/* Seção 2: O que os pesquisadores fizeram */}
        {ed?.methodology && (
          <div className="bg-surface border border-surface-border rounded-2xl p-6 shadow-md space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-violet-300">
              <FileText className="w-4 h-4 text-violet-400" />
              <h3>2. O que os pesquisadores fizeram? (Metodologia)</h3>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed pl-6">
              {ed.methodology}
            </p>
          </div>
        )}

        {/* Seção 3: O que foi descoberto */}
        {ed?.findings && (
          <div className="bg-surface border border-surface-border rounded-2xl p-6 shadow-md space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-violet-300">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <h3>3. O que foi descoberto? (Resultados Principais)</h3>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed pl-6">
              {ed.findings}
            </p>
          </div>
        )}

        {/* Seção 4: Aplicação Prática */}
        {ed?.practicalApplication && (
          <div className="bg-surface border border-emerald-500/30 rounded-2xl p-6 shadow-md space-y-2 bg-gradient-to-r from-emerald-950/20 to-[#111827]">
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
              <Lightbulb className="w-4 h-4 text-emerald-400" />
              <h3>4. O que isso significa na prática para o seu dia a dia?</h3>
            </div>
            <p className="text-slate-200 text-sm leading-relaxed pl-6 font-medium">
              {ed.practicalApplication}
            </p>
          </div>
        )}

        {/* Seção 5: Limitações */}
        {ed?.limitations && (
          <div className="bg-surface border border-amber-500/30 rounded-2xl p-6 shadow-md space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3>5. O que devemos ter em mente? (Limitações do estudo)</h3>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed pl-6">
              {ed.limitations}
            </p>
          </div>
        )}

        {/* Seção 6: Referência Original */}
        <div className="bg-canvas border border-surface-border rounded-2xl p-5 space-y-2 text-xs text-slate-400">
          <span className="font-bold text-slate-300 block">6. Citação e Referência Científica Completa:</span>
          <p className="italic font-mono text-[11px] text-slate-300">
            {ed?.scientificReference || `${article.authors} (${article.year}). ${article.title}. ${article.journal}.`}
          </p>
        </div>

        {/* Disclaimer Educativo de IA */}
        <div className="p-4 rounded-2xl bg-canvas border border-surface-border text-slate-400 text-xs flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {ed?.aiDisclaimer ||
              'Esta matéria explicativa foi estruturada com auxílio de inteligência artificial com base estrita no artigo científico original. Ela tem finalidade exclusivamente educativa e informativa, não substituindo a leitura integral da publicação nem a consulta com profissionais de saúde habilitados.'}
          </p>
        </div>
      </div>
    </div>
  );
};
