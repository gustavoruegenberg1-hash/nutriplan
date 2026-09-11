import { api } from '../api/client';
import { Article } from '../types';
import { SEED_ARTICLES } from '../data/seedData';

const ARTICLES_CACHE_KEY = 'nutriplan_articles_cache';

class ArticleService {
  private memoryCache: Article[] = [];

  constructor() {
    this.initCache();
  }

  private initCache() {
    try {
      const saved = localStorage.getItem(ARTICLES_CACHE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.memoryCache = parsed;
          return;
        }
      }
    } catch {
      // Ignora erro no storage
    }
    this.memoryCache = [...SEED_ARTICLES];
  }

  private persistCache(articles: Article[]) {
    try {
      this.memoryCache = articles;
      localStorage.setItem(ARTICLES_CACHE_KEY, JSON.stringify(articles));
    } catch {
      // Storage indisponível
    }
  }

  /**
   * Obtém acervo completo de artigos com fallback resiliente.
   */
  async getArticles(limit: number = 50): Promise<Article[]> {
    try {
      const res = await api.get('/articles', {
        params: { limit },
      });
      const items = res.data?.items || res.data;
      if (Array.isArray(items) && items.length > 0) {
        this.persistCache(items);
        return items;
      }
    } catch (err) {
      console.warn('ArticleService: API indisponível, utilizando acervo científico local indexado.', err);
    }

    return this.memoryCache.length > 0 ? this.memoryCache : SEED_ARTICLES;
  }

  /**
   * Obtém artigo por ID
   */
  async getArticleById(id: string): Promise<Article | null> {
    try {
      const res = await api.get(`/articles/${id}`);
      if (res.data) return res.data;
    } catch {
      // Fallback
    }

    const all = this.memoryCache.length > 0 ? this.memoryCache : SEED_ARTICLES;
    return all.find((a) => a.id === id) || null;
  }

  /**
   * Sistema de Recomendação Multicamada baseado no perfil do usuário:
   * 1. Artigos altamente relevantes (afinidade direta)
   * 2. Artigos parcialmente relevantes (afinidade secundária/saúde)
   * 3. Demais artigos científicos indexados
   */
  scoreAndRankArticles(articles: Article[], userGoal: string = 'maintain'): (Article & { relevanceScore: number; isRecommended: boolean })[] {
    const goal = (userGoal || 'maintain').toLowerCase();

    const highAffinityKeywords: Record<string, string[]> = {
      gain_weight: ['hipertrofia', 'proteínas', 'proteína', 'ganho de força', 'treinamento de resistência', 'creatina', 'volume'],
      lose_weight: ['déficit calórico', 'déficit', 'emagrecimento', 'perda de gordura', 'fibras', 'recomposição corporal', 'saciedade'],
      maintain: ['recomposição corporal', 'manutenção', 'gorduras', 'carboidratos', 'saúde', 'sono', 'recuperação'],
    };

    const secondaryKeywords = ['sono', 'saúde', 'recuperação', 'nutrição esportiva', 'timing', 'gorduras', 'carboidratos'];

    const targetHigh = highAffinityKeywords[goal] || highAffinityKeywords['maintain'];

    return articles.map((article) => {
      let score = 0;
      const rawTags = Array.isArray(article.tags) ? article.tags : [];
      const articleTags = rawTags.map((t) => t.toLowerCase());
      const articleText = `${article.title || ''} ${article.summary || ''}`.toLowerCase();

      // Alta afinidade (+3 pontos por correspondência de tag ou texto)
      targetHigh.forEach((kw) => {
        if (articleTags.some((t) => t.includes(kw) || kw.includes(t))) score += 3;
        else if (articleText.includes(kw)) score += 1;
      });

      // Afinidade secundária (+1 ponto)
      secondaryKeywords.forEach((kw) => {
        if (articleTags.some((t) => t.includes(kw) || kw.includes(t))) score += 1;
      });

      return {
        ...article,
        relevanceScore: score,
        isRecommended: score >= 3,
      };
    });
  }
}

export const articleService = new ArticleService();
