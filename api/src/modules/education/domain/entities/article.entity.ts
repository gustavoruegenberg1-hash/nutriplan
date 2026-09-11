export interface EducationalArticleContent {
  investigated: string; // O que este estudo investigou?
  methodology: string;  // O que os pesquisadores fizeram?
  findings: string;     // O que foi descoberto?
  practicalApplication: string; // O que isso significa na prática?
  limitations: string;  // O que devemos ter em mente? (Limitações)
  scientificReference: string; // Referência científica completa
  aiDisclaimer: string; // Disclaimer de segurança gerado por IA
}

export class Article {
  constructor(
    public id: string,
    public title: string,
    public summary: string,
    public sourceUrl: string,
    public publishedAt: Date,
    public tags: string[],
    public authors?: string,
    public year?: number,
    public journal?: string,
    public doi?: string,
    public educationalArticle?: EducationalArticleContent,
  ) {}

  static fromPrisma(data: any): Article {
    let tagList: string[] = [];
    if (Array.isArray(data.tags)) {
      tagList = data.tags.map((t: any) => (typeof t === 'string' ? t : t.tag?.name || t.name));
    } else if (typeof data.tags === 'string') {
      tagList = data.tags.split(' ').filter(Boolean);
    }

    return new Article(
      data.id,
      data.title,
      data.summary,
      data.sourceUrl,
      data.publishedAt,
      tagList,
      data.authors,
      data.year,
      data.journal,
      data.doi,
      data.educationalArticle,
    );
  }
}
