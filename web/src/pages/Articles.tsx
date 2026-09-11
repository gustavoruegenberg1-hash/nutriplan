import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Article } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { articleService } from '../services/articleService';
import {
  BookOpen,
  Search,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

export const Articles: React.FC = () => {
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lista reativa de artigos lidos pelo usuário
  const userReadArticles = useMemo(() => {
    const userId = user?.id || 'guest';
    const localSaved = localStorage.getItem(`nutriplan_read_articles_${userId}`);
    let localList: string[] = [];
    if (localSaved) {
      try {
        localList = JSON.parse(localSaved);
      } catch {
        localList = [];
      }
    }
    const profileList = user?.readArticles || [];
    return new Set([...profileList, ...localList]);
  }, [user]);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await articleService.getArticles();
      setArticles(data);
    } catch (err) {
      console.error('Erro ao buscar artigos', err);
      setError('Não foi possível carregar o acervo científico.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // Extrair todas as tags únicas
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    articles.forEach((art) => {
      if (Array.isArray(art.tags)) {
        art.tags.forEach((t) => tagSet.add(t));
      }
    });
    return Array.from(tagSet);
  }, [articles]);

  // Motor de pontuação e recomendação multicamada baseado no perfil do usuário
  const scoredArticles = useMemo(() => {
    return articleService.scoreAndRankArticles(articles, user?.goal || 'maintain');
  }, [articles, user?.goal]);

  // Filtragem combinada de busca + tag selecionada + ordenação por relevância
  const filteredArticles = useMemo(() => {
    return scoredArticles
      .filter((art) => {
        const matchesTag =
          selectedTag === 'ALL' ||
          (Array.isArray(art.tags) && art.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase()));

        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !query ||
          art.title.toLowerCase().includes(query) ||
          art.summary.toLowerCase().includes(query) ||
          (Array.isArray(art.tags) && art.tags.some((t) => t.toLowerCase().includes(query)));

        return matchesTag && matchesSearch;
      })
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
  }, [scoredArticles, selectedTag, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      {/* Header Banner com Tema Científico Violeta */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950/60 via-[#111827] to-[#111827] border border-[#8B5CF6]/20 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 text-[#8B5CF6] text-xs font-semibold uppercase tracking-wider mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Evidências Científicas & Matérias Didáticas</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Biblioteca Científica
          </h1>
          <p className="text-slate-300 text-sm sm:text-base mt-2 leading-relaxed">
            Estudos indexados no PubMed com matérias didáticas e aplicações práticas para acelerar seus resultados com base na ciência.
          </p>
        </div>
        <div className="absolute right-0 top-0 -mt-8 -mr-8 w-64 h-64 bg-[#8B5CF6]/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Barra de Busca e Filtros */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por título, resumo ou palavra-chave..."
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-surface-border rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#8B5CF6]"
          />
        </div>

        {/* Chips de Tags */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          <button
            onClick={() => setSelectedTag('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedTag === 'ALL'
                ? 'bg-[#8B5CF6] text-white shadow-md shadow-[#8B5CF6]/20'
                : 'bg-surface text-slate-400 hover:text-white border border-surface-border'
            }`}
          >
            Todos
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedTag === tag
                  ? 'bg-[#8B5CF6] text-white shadow-md shadow-[#8B5CF6]/20'
                  : 'bg-surface text-slate-400 hover:text-white border border-surface-border'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Artigos com Todo o Card Clicável e Identificação de Leitura */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400 text-sm">
          <RefreshCw className="w-8 h-8 animate-spin text-[#8B5CF6]" />
          <span className="font-medium">Carregando acervo científico...</span>
        </div>
      ) : error ? (
        <div className="py-12 px-6 text-center rounded-3xl bg-rose-500/10 border border-rose-500/30 flex flex-col items-center gap-3 max-w-md mx-auto">
          <AlertCircle className="w-8 h-8 text-rose-400" />
          <p className="text-sm text-rose-300 font-medium">{error}</p>
          <button
            type="button"
            onClick={() => fetchArticles()}
            className="px-5 py-2 rounded-xl bg-[#8B5CF6] text-white text-xs font-bold hover:bg-purple-600 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Tentar Novamente</span>
          </button>
        </div>
      ) : filteredArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => {
            const isRead = userReadArticles.has(article.id);

            return (
              <Link
                key={article.id}
                to={`/articles/${article.id}`}
                className={`rounded-3xl p-6 shadow-xl flex flex-col justify-between transition-all group border block cursor-pointer ${
                  article.isRecommended
                    ? 'bg-surface border-[#8B5CF6]/40 hover:border-[#8B5CF6] hover:shadow-[#8B5CF6]/10'
                    : 'bg-surface border-surface-border hover:border-slate-600'
                }`}
              >
                <div className="space-y-4">
                  {/* Badges de Status, Recomendação ou Tags */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex flex-wrap gap-1.5 items-center">
                      {Array.isArray(article.tags) &&
                        article.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20"
                          >
                            {tag}
                          </span>
                        ))}
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {isRead && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 shadow-sm">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>✓ Já lida</span>
                        </span>
                      )}

                      {article.isRecommended && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                          <Sparkles className="w-3 h-3" />
                          <span>Recomendado</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-white group-hover:text-purple-300 transition-colors leading-snug line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-slate-400 text-xs mt-2 line-clamp-3 leading-relaxed">
                      {article.summary}
                    </p>
                  </div>
                </div>

                {/* Rodapé do Card com Periódico e Botão Visual */}
                <div className="pt-4 mt-4 border-t border-surface-border flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-medium truncate max-w-[180px]">
                    {article.journal || 'PubMed Central'}
                  </span>

                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#8B5CF6] group-hover:text-purple-300 transition-colors">
                    <span>Ler Matéria</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center text-slate-400 text-sm border border-dashed border-surface-border rounded-3xl">
          Nenhum artigo encontrado para o filtro selecionado.
        </div>
      )}
    </div>
  );
};
