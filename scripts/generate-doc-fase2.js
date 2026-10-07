/**
 * Gerador do Documento Oficial: Fase 2 – Engenharia de Requisitos (Laboratório de Engenharia de Software)
 * Instituição: FATEC Campinas (Faculdade de Tecnologia de Campinas)
 * Curso: Superior de Tecnologia em Análise e Desenvolvimento de Sistemas (ADS)
 * Disciplina: Laboratório de Engenharia de Software
 * Autores: Gustavo Meneses Ruegenberg Rodrigues e Fabiana Tiemi Watanabe
 * Projeto: NutriPlan v2 (Projeto Contemplando 5 Fases)
 * Formato: Microsoft Word (.docx) compatível com ABNT e ISO/IEC 25010
 */

const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
  Header,
  Footer,
  PageNumber,
} = require('./node_modules/docx');

// Cores da paleta acadêmica FATEC
const COLORS = {
  PRIMARY: '1B365D',     // Azul Marinho Institucional
  SECONDARY: '0D9488',   // Verde Petróleo / Esmeralda
  TEXT: '1E293B',        // Cinza Escuro Grafite para Leitura
  MUTED: '64748B',       // Cinza Médio para notas
  BG_LIGHT: 'F8FAFC',    // Fundo Zebrado Claro
  WHITE: 'FFFFFF',
  BORDER: 'CBD5E1',      // Borda sutil
  CALLOUT_BG: 'F0FDF4',  // Fundo Verde Suave para Destaques
  CALLOUT_BORDER: '16A34A',
  ALERT_BG: 'FEF2F2',    // Fundo Vermelho Suave para Riscos
  ALERT_BORDER: 'DC2626',
};

// Funções utilitárias de tipografia
function createTitle(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 120 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 36, // 18pt
        color: COLORS.PRIMARY,
        font: 'Arial',
      }),
    ],
  });
}

function createSubtitle(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 300 },
    children: [
      new TextRun({
        text,
        size: 26, // 13pt
        color: COLORS.SECONDARY,
        bold: true,
        font: 'Arial',
      }),
    ],
  });
}

function createHeading1(text, pageBreakBefore = false) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    pageBreakBefore,
    spacing: { before: 400, after: 160 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 30, // 15pt
        color: COLORS.PRIMARY,
        font: 'Arial',
      }),
    ],
  });
}

function createHeading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 120 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 24, // 12pt
        color: COLORS.SECONDARY,
        font: 'Arial',
      }),
    ],
  });
}

function createHeading3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 80 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 22, // 11pt
        color: COLORS.PRIMARY,
        font: 'Arial',
      }),
    ],
  });
}

function createParagraph(text, options = {}) {
  const { bold = false, italic = false, align = AlignmentType.JUSTIFIED, spaceAfter = 140 } = options;
  return new Paragraph({
    alignment: align,
    spacing: { before: 0, after: spaceAfter, line: 360 }, // 1.5 de espaçamento
    children: [
      new TextRun({
        text,
        size: 22, // 11pt ABNT
        color: COLORS.TEXT,
        font: 'Arial',
        bold,
        italic,
      }),
    ],
  });
}

function createBullet(text, boldPrefix = '') {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { before: 40, after: 80, line: 300 },
    children: [
      boldPrefix ? new TextRun({ text: boldPrefix + ' ', bold: true, color: COLORS.PRIMARY, size: 21, font: 'Arial' }) : new TextRun({ text: '' }),
      new TextRun({ text, size: 21, color: COLORS.TEXT, font: 'Arial' }),
    ],
  });
}

function createCallout(title, text, type = 'success') {
  const bg = type === 'alert' ? COLORS.ALERT_BG : COLORS.CALLOUT_BG;
  const borderCol = type === 'alert' ? COLORS.ALERT_BORDER : COLORS.CALLOUT_BORDER;
  const titleCol = type === 'alert' ? 'B91C1C' : '15803D';

  const cell = new TableCell({
    shading: { fill: bg },
    margins: { top: 120, bottom: 120, left: 160, right: 160 },
    borders: {
      left: { style: BorderStyle.SINGLE, size: 24, color: borderCol },
      top: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
    },
    children: [
      new Paragraph({
        spacing: { before: 0, after: 60 },
        children: [new TextRun({ text: title, bold: true, size: 22, color: titleCol, font: 'Arial' })],
      }),
      new Paragraph({
        spacing: { before: 0, after: 0 },
        children: [new TextRun({ text, size: 20, color: COLORS.TEXT, font: 'Arial', italic: true })],
      }),
    ],
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({ children: [cell] })],
  });
}

function makeTable(headers, data, colWidths = []) {
  const defaultWidth = Math.max(5, Math.floor(100 / headers.length));
  const safeWidths = headers.map((_, i) => (colWidths && colWidths[i] !== undefined ? colWidths[i] : defaultWidth));

  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) => new TableCell({
      width: { size: safeWidths[i] || defaultWidth, type: WidthType.PERCENTAGE },
      shading: { fill: COLORS.PRIMARY },
      margins: { top: 100, bottom: 100, left: 120, right: 120 },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 6, color: COLORS.BORDER },
        bottom: { style: BorderStyle.SINGLE, size: 12, color: COLORS.PRIMARY },
        left: { style: BorderStyle.SINGLE, size: 6, color: COLORS.BORDER },
        right: { style: BorderStyle.SINGLE, size: 6, color: COLORS.BORDER },
      },
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: h, bold: true, color: COLORS.WHITE, size: 20, font: 'Arial' })],
      })],
    })),
  });

  const bodyRows = data.map((row, rIdx) => new TableRow({
    children: row.map((cell, cIdx) => new TableCell({
      width: { size: safeWidths[cIdx] || defaultWidth, type: WidthType.PERCENTAGE },
      shading: { fill: rIdx % 2 === 0 ? COLORS.BG_LIGHT : COLORS.WHITE },
      margins: { top: 80, bottom: 80, left: 100, right: 100 },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 4, color: COLORS.BORDER },
        bottom: { style: BorderStyle.SINGLE, size: 4, color: COLORS.BORDER },
        left: { style: BorderStyle.SINGLE, size: 4, color: COLORS.BORDER },
        right: { style: BorderStyle.SINGLE, size: 4, color: COLORS.BORDER },
      },
      children: [new Paragraph({
        alignment: cIdx === 0 ? AlignmentType.LEFT : (cell.length < 15 ? AlignmentType.CENTER : AlignmentType.LEFT),
        children: [new TextRun({ text: cell, size: 19, color: COLORS.TEXT, font: 'Arial' })],
      })],
    })),
  }));

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...bodyRows],
  });
}

async function generateFase2Docx() {
  console.log('Iniciando montagem do documento da Fase 2 (Engenharia de Requisitos)...');

  const children = [];

  // ==========================================
  // CAPA FORMAL (ABNT) - FATEC CAMPINAS
  // ==========================================
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 80 },
      children: [
        new TextRun({
          text: 'CENTRO ESTADUAL DE EDUCAÇÃO TECNOLÓGICA PAULA SOUZA\nFATEC CAMPINAS — FACULDADE DE TECNOLOGIA DE CAMPINAS',
          bold: true,
          size: 24,
          color: COLORS.PRIMARY,
          font: 'Arial',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 1200 },
      children: [
        new TextRun({
          text: 'CURSO SUPERIOR DE TECNOLOGIA EM ANÁLISE E DESENVOLVIMENTO DE SISTEMAS\nDISCIPLINA: LABORATÓRIO DE ENGENHARIA DE SOFTWARE',
          size: 20,
          color: COLORS.MUTED,
          font: 'Arial',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 200 },
      children: [
        new TextRun({
          text: 'NUTRIPLAN V2',
          bold: true,
          size: 44,
          color: COLORS.PRIMARY,
          font: 'Arial',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 300 },
      children: [
        new TextRun({
          text: 'SISTEMA INTEGRADO DE MONTAGEM PERSONALIZADA DE DIETA E TREINO BASEADO EM EVIDÊNCIAS',
          bold: true,
          size: 24,
          color: COLORS.SECONDARY,
          font: 'Arial',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 1400 },
      children: [
        new TextRun({
          text: 'ENTREGÁVEL 2: ENGENHARIA DE REQUISITOS (PROJETO EM 5 FASES)',
          size: 22,
          bold: true,
          color: COLORS.TEXT,
          font: 'Arial',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { before: 400, after: 80 },
      children: [
        new TextRun({
          text: 'Integrantes do Grupo:\nGustavo Meneses Ruegenberg Rodrigues\nFabiana Tiemi Watanabe',
          bold: true,
          size: 22,
          color: COLORS.TEXT,
          font: 'Arial',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { before: 0, after: 80 },
      children: [
        new TextRun({
          text: 'Disciplina: Laboratório de Engenharia de Software',
          size: 20,
          color: COLORS.MUTED,
          font: 'Arial',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { before: 0, after: 1200 },
      children: [
        new TextRun({
          text: 'Curso: Tecnologia em Análise e Desenvolvimento de Sistemas (ADS)',
          size: 20,
          color: COLORS.MUTED,
          font: 'Arial',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 600, after: 0 },
      children: [
        new TextRun({
          text: 'CAMPINAS — SP\nOUTUBRO DE 2026',
          bold: true,
          size: 20,
          color: COLORS.MUTED,
          font: 'Arial',
        }),
      ],
    })
  );

  // ==========================================
  // FOLHA DE ROSTO E CARACTERIZAÇÃO
  // ==========================================
  children.push(
    createHeading1('FOLHA DE ROSTO E CARACTERIZAÇÃO DA FASE 2', true),
    createParagraph(
      'Este documento técnico-acadêmico constitui o segundo entregável formal do projeto NutriPlan v2 na disciplina de Laboratório de Engenharia de Software do Curso Superior de Tecnologia em Análise e Desenvolvimento de Sistemas (ADS) da FATEC Campinas. O artefato documenta com rigor a Fase 2 — Engenharia de Requisitos, contendo as técnicas de elicitação aplicadas, a especificação detalhada de 38 Requisitos Funcionais, 10 Requisitos Não-Funcionais e 29 Regras de Negócio, a Modelagem de Negócio (BPM), o Diagrama e as Especificações de Casos de Uso (UML), a Matriz de Rastreabilidade Bidirecional e a política de Controle de Mudanças.'
    ),
    createCallout(
      'ESTRUTURA INTEGRADA DO PROJETO EM 5 FASES',
      'O projeto acadêmico NutriPlan v2 está estruturado formalmente em 5 macro-fases de Engenharia de Software:\n• Fase 1: Processo e Planejamento de Software (Entregue)\n• Fase 2: Engenharia de Requisitos (Presente Documento)\n• Fase 3: Projeto Arquitetural e Modelagem de Banco de Dados Relacional\n• Fase 4: Construção, Implementação e Testes Automatizados (61 testes herméticos)\n• Fase 5: Implantação, Auditoria e Entrega Final'
    ),
    createHeading2('SUMÁRIO DOS ENTREGÁVEIS DA FASE 2'),
    createBullet('Seção 1: Técnicas de Elicitação de Requisitos Utilizadas', '•'),
    createBullet('Seção 2: Documento de Requisitos (38 RFs, 10 RNFs e 29 Regras de Negócio)', '•'),
    createBullet('Seção 3: Modelagem de Negócio (Cadeia de Valor e Macroprocessos BPM)', '•'),
    createBullet('Seção 4: Diagrama e Especificação Detalhada de Casos de Uso (UML)', '•'),
    createBullet('Seção 5: Matriz de Rastreabilidade Bidirecional Completa', '•'),
    createBullet('Seção 6: Política e Registro Histórico de Controle de Mudanças', '•')
  );

  // ==========================================
  // SEÇÃO 1: TÉCNICAS DE ELICITAÇÃO UTILIZADAS
  // ==========================================
  children.push(
    createHeading1('1. TÉCNICAS DE ELICITAÇÃO DE REQUISITOS UTILIZADAS', true),
    createParagraph(
      'Para garantir que os requisitos do NutriPlan v2 refletissem necessidades autênticas do domínio de saúde, nutrição e treinamento de força, a equipe de engenharia combinou cinco técnicas complementares de elicitação, alinhando métodos qualitativos e quantitativos.'
    ),

    createHeading2('1.1. Entrevistas Semiestruturadas com Profissionais de Saúde'),
    createParagraph(
      'Foram conduzidas entrevistas semiestruturadas com nutricionistas clínicos/esportivos credenciados no CRN-3 e educadores físicos habilitados pelo CREF-4 SP. O roteiro abordou:'
    ),
    createBullet('Prescrição dietética na prática clínica: Como calcular TMB/TDEE e quais as tabelas de composição de alimentos adotadas como referência no Brasil.', 'a)'),
    createBullet('Adesão e evasão de pacientes: Quais as maiores queixas dos pacientes em relação ao registro de refeições e pesagem de porções.', 'b)'),
    createBullet('Periodização do treinamento de força: Como estruturar divisões semanais (Push/Pull/Legs, Treinos A/B/C) e a importância do controle do intervalo de descanso.', 'c)'),
    createParagraph(
      'Principais Descobertas: Os nutricionistas enfatizaram que a base TACO (UNICAMP) é o único padrão aceitável para refeições brasileiras e que o sistema não deve permitir déficits perigosos. Os treinadores destacaram que a ausência de cronômetro no aplicativo induz descanso excessivo e perda de intensidade no treino.'
    ),

    createHeading2('1.2. Questionários Estruturados (Survey com Usuários Finais)'),
    createParagraph(
      'Foi aplicado um formulário eletrônico estruturado a uma amostra de 45 praticantes de musculação e indivíduos em processo de reeducação alimentar (idade entre 18 e 45 anos). Resultados estatísticos mais expressivos:'
    ),
    createBullet('78% dos entrevistados relataram dificuldade em estimar porções subjetivas (colheres, xícaras) e preferem a precisão da balança de precisão em gramas.', '•'),
    createBullet('84% já abandonaram algum aplicativo de dieta devido a dados nutricionais incorretos ou conflitantes cadastrados por outros usuários.', '•'),
    createBullet('91% desejam uma ferramenta que sugira opções completas de treino a partir dos grupamentos musculares que desejam treinar no dia, sem requerer montagem do zero.', '•'),
    createBullet('67% declararam esquecer o tempo adequado de descanso entre as séries, prejudicando o rendimento.', '•'),

    createHeading2('1.3. Análise Documental e Pesquisa Científica'),
    createParagraph(
      'A elicitação técnica baseou-se na análise minuciosa de normas científicas e literatura médica consolidada:'
    ),
    createBullet('Tabela TACO (4ª Edição / NEPA - UNICAMP): Extração e análise bromatológica dos 744 alimentos para consolidação de macronutrientes e micronutrientes por 100g de porção comestível.', '•'),
    createBullet('Equações Metabólicas: Estudo comparativo das fórmulas de Harris-Benedict, Cunningham e Mifflin-St Jeor, confirmando a superioridade desta última para adultos contemporâneos.', '•'),
    createBullet('Resoluções CFN nº 600/2018 e CONFEF: Levantamento das restrições legais para assegurar que a plataforma atue como ferramenta de suporte e contenha aviso legal mandatório de saúde.', '•'),

    createHeading2('1.4. Benchmarking Competitivo e Análise de Similares'),
    createParagraph(
      'Foi realizado benchmarking aprofundado dos aplicativos líderes de mercado, mapeando lacunas técnicas a serem superadas pelo NutriPlan v2:'
    ),
    makeTable(
      ['Aplicativo Analisado', 'Pontos Fortes', 'Deficiências Críticas Identificadas', 'Diferencial do NutriPlan v2'],
      [
        ['MyFitnessPal', 'Grande base de usuários e leitura de código de barras.', 'Banco de dados poluído por crowdsourcing; sem base TACO nativa; não monta treinos.', 'Base TACO oficial auditada (744 itens); sinergia com treinos.'],
        ['FatSecret Brasil', 'Alguns alimentos nacionais catalogados.', 'Interface poluída; não possui solver inteligente com tolerâncias estritas de macros.', 'Solver numérico matemático; tolerâncias ≤ 5% calorias/P e ≤ 8% C/G.'],
        ['Hevy / Strong', 'Excelente interface para registro de musculação.', 'Foco exclusivo em treino; nenhuma integração com metas calóricas ou dieta.', 'Integração completa: dieta e treino sincronizados no mesmo painel.'],
        ['Cronometer', 'Foco em micronutrientes.', 'Curva de aprendizado íngreme; voltado exclusivamente ao mercado norte-americano.', 'Ergonomia em português com botões táteis e foco nos hábitos alimentares do Brasil.']
      ],
      [20, 25, 30, 25]
    ),

    createHeading2('1.5. Prototipação Rápida e Sessões de JAD (Joint Application Design)'),
    createParagraph(
      'Realizou-se sessões colaborativas de projeto de telas com os usuários para validar os fluxos críticos de: (a) busca rápida de alimentos sem acento com botões compactos circulares `+`, (b) seleção interativa de grupos musculares em chips e (c) cronômetro dinâmico de execução e descanso em tempo real acoplado aos cards de exercícios.'
    )
  );

  // ==========================================
  // SEÇÃO 2: DOCUMENTO DE REQUISITOS (SRS)
  // ==========================================
  children.push(
    createHeading1('2. DOCUMENTO DE ESPECIFICAÇÃO DE REQUISITOS', true),
    createHeading2('2.1. Requisitos Funcionais (RF01 a RF38)'),
    createParagraph(
      'Os Requisitos Funcionais descrevem os serviços, comportamentos e transformações de dados que o sistema executa. O NutriPlan v2 contempla 38 Requisitos Funcionais organizados em 7 módulos funcionais:'
    ),

    createHeading3('Módulo 1: Autenticação, Identidade e Segurança de Acesso'),
    makeTable(
      ['ID', 'Nome do Requisito', 'Descrição Funcional Detalhada', 'Prioridade'],
      [
        ['RF01', 'Cadastro de Usuário', 'O sistema deve permitir o registro de novas contas com nome completo, e-mail único e senha segura (mínimo 6 caracteres).', 'Must-Have'],
        ['RF02', 'Login e Sessão', 'O sistema deve autenticar usuários com validação de hash Bcrypt e emitir token JWT assinado com expiração automática.', 'Must-Have'],
        ['RF03', 'Recuperação de Acesso', 'O sistema deve permitir a alteração e redefinição segura de senha mediante confirmação de senha atual.', 'Should-Have'],
        ['RF04', 'Encerramento de Sessão', 'O sistema deve invalidar a sessão ativa localmente e remover o token JWT armazenado no cliente.', 'Must-Have'],
        ['RF05', 'Proteção de Endpoints', 'Todas as rotas privadas devem interceptar requisições e exigir cabeçalho Authorization Bearer com token JWT válido.', 'Must-Have'],
        ['RF06', 'Isolamento de Dados (IDOR)', 'O sistema deve assegurar que cada usuário consulte e modifique exclusivamente seus próprios recursos através do escopo userId.', 'Must-Have']
      ],
      [12, 22, 52, 14]
    ),

    createHeading3('Módulo 2: Perfil do Usuário e Avaliação Antropométrica'),
    makeTable(
      ['ID', 'Nome do Requisito', 'Descrição Funcional Detalhada', 'Prioridade'],
      [
        ['RF07', 'Gestão Antropométrica', 'O usuário pode cadastrar e editar peso (kg), altura (cm), idade, sexo biológico, nível de atividade e objetivo corporal.', 'Must-Have'],
        ['RF08', 'Histórico de Pesagens', 'O sistema deve registrar cada pesagem com data e nota opcional, permitindo visualizar a curva evolutiva de peso.', 'Must-Have'],
        ['RF09', 'Restrições e Alergias', 'O usuário pode registrar intolerâncias (lactose, glúten), estilo alimentar (vegetariano, vegano) e limitações físicas/articulares.', 'Must-Have']
      ],
      [12, 22, 52, 14]
    ),

    createHeading3('Módulo 3: Motor de Cálculo Nutricional e Metas Fisiológicas'),
    makeTable(
      ['ID', 'Nome do Requisito', 'Descrição Funcional Detalhada', 'Prioridade'],
      [
        ['RF10', 'Cálculo da TMB', 'O sistema calcula automaticamente a Taxa Metabólica Basal via equação de Mifflin-St Jeor para homens e mulheres.', 'Must-Have'],
        ['RF11', 'Cálculo do TDEE', 'O sistema calcula o Gasto Energético Total Diário multiplicando a TMB pelo fator de atividade física informado (1.2 a 1.9).', 'Must-Have'],
        ['RF12', 'Metas Nutricionais', 'O sistema calcula as metas de calorias (com déficit ou superávit) e distribui gramas de proteínas, carboidratos e lipídios.', 'Must-Have'],
        ['RF13', 'Piso de Segurança', 'O sistema impõe piso calórico inegociável de 1.200 kcal (mulheres) e 1.500 kcal (homens), alertando caso o déficit seja inseguro.', 'Must-Have']
      ],
      [12, 22, 52, 14]
    ),

    createHeading3('Módulo 4: Catálogo de Alimentos e Base Científica TACO'),
    makeTable(
      ['ID', 'Nome do Requisito', 'Descrição Funcional Detalhada', 'Prioridade'],
      [
        ['RF14', 'Carga Oficial TACO', 'O sistema mantém banco de dados relacional com 744 alimentos quimicamente analisados da base TACO/UNICAMP.', 'Must-Have'],
        ['RF15', 'Busca e Filtragem', 'O usuário pode pesquisar alimentos por termos parciais, sem distinção de acentuação, categoria e tags especiais.', 'Must-Have'],
        ['RF16', 'Cálculo Proporcional', 'O sistema calcula instantaneamente calorias e macronutrientes para qualquer porção em gramas com base em 100g.', 'Must-Have'],
        ['RF17', 'Taxonomia em 2 Níveis', 'Os alimentos são organizados em Categorias e Subcategorias com tags (sem glúten, sem lactose, vegetariano, vegano).', 'Should-Have']
      ],
      [12, 22, 52, 14]
    ),

    createHeading3('Módulo 5: Montador de Dietas e Solver Matemático Otimizado'),
    makeTable(
      ['ID', 'Nome do Requisito', 'Descrição Funcional Detalhada', 'Prioridade'],
      [
        ['RF18', 'Gestão de Dietas', 'O usuário pode criar, renomear, duplicar e excluir planos alimentares associados à sua conta.', 'Must-Have'],
        ['RF19', 'Estrutura de Refeições', 'Uma dieta contém refeições ordenadas (Café da Manhã, Almoço, Lanche, Jantar, Ceia) com totais calculados.', 'Must-Have'],
        ['RF20', 'Adição/Remoção de Itens', 'O usuário adiciona alimentos à refeição informando gramas exatas, com interface compacta tátil (+) e feedback (✓).', 'Must-Have'],
        ['RF21', 'Recálculo Instantâneo', 'Qualquer alteração de gramas ou remoção recalcula instantaneamente os totais da refeição e da dieta em cascata.', 'Must-Have'],
        ['RF22', 'Comparativo com Metas', 'Exibição de barras de progresso e indicadores percentuais comparando a dieta com as metas nutricionais do usuário.', 'Must-Have'],
        ['RF23', 'Detecção de Conflitos', 'O sistema emite avisos claros se um alimento adicionado violar restrições cadastradas (ex.: lactose ou glúten).', 'Must-Have'],
        ['RF24', 'Solver de Dieta Assistida', 'O assistente gera propostas de dieta otimizadas que respeitam metas estritas (≤ 5% kcal/P, ≤ 8% C/G) e número dinâmico de refeições.', 'Must-Have'],
        ['RF25', 'Disclaimer Médico Legal', 'Exibição compulsória de aviso de que os cálculos são estimativas e não substituem prescrição por nutricionista ou médico.', 'Must-Have']
      ],
      [12, 22, 52, 14]
    ),

    createHeading3('Módulo 6: Catálogo de Exercícios, Montador de Treinos e Execução em Tempo Real'),
    makeTable(
      ['ID', 'Nome do Requisito', 'Descrição Funcional Detalhada', 'Prioridade'],
      [
        ['RF26', 'Catálogo de Exercícios', 'Banco de 128 exercícios classificados por grupamento muscular em português, equipamento, nível e biomecânica.', 'Must-Have'],
        ['RF27', 'Filtro Multimuscular', 'Busca textual e filtragem combinada por múltiplos grupamentos musculares em língua portuguesa e equipamento.', 'Must-Have'],
        ['RF28', 'Rotinas de Treino', 'Criação e edição de rotinas de treino personalizadas associadas ao usuário.', 'Must-Have'],
        ['RF29', 'Séries, Cargas e Reps', 'Definição de séries, repetições planejadas, carga em kg e tempo de descanso em segundos para cada exercício.', 'Must-Have'],
        ['RF30', 'Reordenação de Itens', 'Reordenação atômica e sequencial dos exercícios dentro da rotina de treino.', 'Should-Have'],
        ['RF31', 'Registro de Sessão (Log)', 'Gravação de sessão de treino executada com séries cumpridas, repetições reais e notas.', 'Must-Have'],
        ['RF32', 'Histórico Imutável', 'Exclusão de planos de treino jamais apaga registros históricos passados, garantindo rastreabilidade contínua.', 'Must-Have'],
        ['RF35', 'Múltiplas Sugestões A/B/C', 'O assistente gera 3 opções completas de treino a partir dos grupos musculares escolhidos para seleção do usuário.', 'Must-Have'],
        ['RF36', 'Cronômetro em Tempo Real', 'Cronômetro dinâmico com tempo de execução e tempo de descanso por série, persistido por sessão.', 'Must-Have']
      ],
      [12, 22, 52, 14]
    ),

    createHeading3('Módulo 7: Painel de Controle Integrado, Governança e Auditoria'),
    makeTable(
      ['ID', 'Nome do Requisito', 'Descrição Funcional Detalhada', 'Prioridade'],
      [
        ['RF33', 'Dashboard Integrado', 'Painel unificado com calorias do dia, macronutrientes, meta de água, resumo do treino e evolução de peso.', 'Must-Have'],
        ['RF34', 'Alertas de Inconsistência', 'Notificação de refeições com baixa densidade proteica ou treinos vazios sem exercícios cadastrados.', 'Should-Have'],
        ['RF37', 'Portal Profissional', 'Cadastro de nutricionistas e treinadores com número de conselho (CRN/CREF), perfil público e canal de mensagens.', 'Should-Have'],
        ['RF38', 'Painel Administrativo', 'Área restrita para perfil ADMIN com métricas consolidadas, moderação de profissionais e auditoria do sistema.', 'Must-Have']
      ],
      [12, 22, 52, 14]
    ),

    createHeading2('2.2. Requisitos Não-Funcionais (RNF01 a RNF10)'),
    makeTable(
      ['ID', 'Categoria', 'Descrição do Requisito Não-Funcional', 'Métrica de Aceitação'],
      [
        ['RNF01', 'Segurança', 'Senhas armazenadas obrigatoriamente com hash Bcrypt (salt rounds = 10). Tokens JWT RFC 7519 assinados com segredo de ambiente.', 'Zero senhas em texto puro; tokens com expiração.'],
        ['RNF02', 'Controle de Acesso', 'Validação mandatória de escopo userId e proteção por perfil (@Roles ADMIN/PROFESSIONAL) via Guards.', 'Zero vulnerabilidades de IDOR; HTTP 403 para acessos indevidos.'],
        ['RNF03', 'Usabilidade e UX', 'Design responsivo adaptável a Mobile (360px+), Tablet (768px+) e Desktop (1024px+). Alvos de toque táteis ≥ 40x40px.', '100% dos botões táteis conformes; sem jargões internos.'],
        ['RNF04', 'Desempenho', 'Tempo de resposta da API para consultas locais no SQLite inferior a 200ms para 95% das requisições.', 'Latência média < 50ms nos testes de carga local.'],
        ['RNF05', 'Manutenibilidade', 'Arquitetura limpa em camadas (Clean MVC) desacoplando Controllers, Services, Repositories e DTOs tipados.', 'TypeScript strict mode ativo; zero any não controlado.'],
        ['RNF06', 'Testabilidade', 'Suíte de testes automatizados herméticos executando sobre SQLite em memória (:memory:) sem efeitos colaterais.', 'Cobertura de código > 90% nos módulos de domínio.'],
        ['RNF07', 'Confiabilidade', 'Tratamento centralizado de exceções com status HTTP padronizados (400, 401, 403, 404, 409, 422, 500).', 'Zero vazamento de stack traces ao usuário final.'],
        ['RNF08', 'Integridade de Dados', 'Banco relacional SQLite com integridade referencial ativa (PRAGMA foreign_keys = ON) e transações ACID.', 'Zero registros órfãos; integridade garantida por cascades.'],
        ['RNF09', 'Rastreabilidade', 'Rastreabilidade bidirecional documentada entre requisitos, regras de negócio, implementação e casos de teste.', '100% dos requisitos cobertos na matriz de rastreabilidade.'],
        ['RNF10', 'Portabilidade', 'Execução autônoma em qualquer sistema com Node 24 via scripts automatizados em 1 clique (iniciar.bat).', 'Inicialização de API e Web em menos de 8 segundos.']
      ],
      [12, 18, 48, 22]
    ),

    createHeading2('2.3. Regras de Negócio do Sistema (RN01 a RN29)'),
    makeTable(
      ['ID', 'Nome da Regra', 'Descrição Normativa da Regra de Negócio', 'Módulo Vinculado'],
      [
        ['RN01', 'Unicidade de Identidade', 'O endereço de e-mail é a chave de identidade exclusiva do usuário; cadastros duplicados retornam HTTP 409.', 'Autenticação'],
        ['RN02', 'Criptografia de Senha', 'Senhas devem conter no mínimo 6 caracteres e serem hasheadas antes da gravação no banco.', 'Autenticação'],
        ['RN03', 'Isolamento Multiusuário', 'Um usuário comum jamais pode visualizar, alterar ou excluir registros pertencentes a outro usuário.', 'Segurança'],
        ['RN04', 'Autenticação Obrigatória', 'Operações que modifiquem o estado de dietas, perfis ou treinos exigem cabeçalho Authorization com token JWT válido.', 'Segurança'],
        ['RN05', 'Limites Fisiológicos', 'Valores antropométricos devem respeitar faixas biológicas válidas (idade 12-120 anos, peso 30-350 kg, altura 100-250 cm).', 'Perfil'],
        ['RN06', 'Equação da TMB', 'A TMB deve ser calculada estritamente segundo a fórmula de Mifflin-St Jeor para o sexo biológico informado.', 'Nutrição'],
        ['RN07', 'Fator de Atividade (TDEE)', 'O TDEE deve ser obtido multiplicando a TMB pelos coeficientes da FAO/OMS (1.20, 1.375, 1.55, 1.725 ou 1.90).', 'Nutrição'],
        ['RN08', 'Ajuste Calórico Seguro', 'Déficits para emagrecimento (-500 kcal) ou superávits para hipertrofia (+400 kcal) não podem ultrapassar o piso de 1200/1500 kcal.', 'Nutrição'],
        ['RN09', 'Distribuição de Macronutrientes', 'Proteínas calculadas entre 1.6 e 2.2g/kg para praticantes de musculação; gorduras entre 0.8 e 1.0g/kg; restante em carboidratos.', 'Nutrição'],
        ['RN10', 'Proporcionalidade TACO', 'Nutrientes de alimentos devem ser calculados pela regra de três direta sobre a base de 100g de porção comestível.', 'Alimentos'],
        ['RN11', 'Imutabilidade da TACO', 'Os 744 registros da base TACO são oficiais e imutáveis; usuários não podem editar valores bromatológicos de referência.', 'Alimentos'],
        ['RN12', 'Tratamento de Nulos', 'Nutrientes não quantificados ou traços na TACO devem ser tratados de forma resiliente sem gerar valores NaN.', 'Alimentos'],
        ['RN13', 'Associação Relacional de Dieta', 'Toda dieta pertence a um usuário; toda refeição pertence a uma dieta; todo alimento pertence a uma refeição.', 'Dieta'],
        ['RN14', 'Porção Positiva Estrita', 'A quantidade de alimento em uma refeição deve ser estritamente maior que zero gramas.', 'Dieta'],
        ['RN15', 'Cálculo Automático de Totais', 'Totais de calorias e macros de refeições e dietas são campos derivados calculados pelo backend, sem edição manual.', 'Dieta'],
        ['RN16', 'Recálculo em Cascata', 'Qualquer inserção, alteração de gramas ou remoção recalcula atômica e imediatamente todos os totalizadores.', 'Dieta'],
        ['RN17', 'Conflito de Restrições', 'O sistema deve emitir alerta de incompatibilidade ao adicionar alimento que contenha alergênicos do perfil.', 'Dieta'],
        ['RN18', 'Alerta de Desvio de Metas', 'Dietas com desvio superior a 15% das metas calóricas devem exibir alertas visuais de desequilíbrio.', 'Dieta'],
        ['RN19', 'Tolerância Estrita do Solver', 'O assistente automático deve atingir tolerância ≤ 5% para calorias e proteínas e ≤ 8% para carboidratos e gorduras.', 'Dieta'],
        ['RN20', 'Associação de Treinos', 'Toda rotina de treino pertence a um usuário e possui divisões ordenadas.', 'Treino'],
        ['RN21', 'Catálogo Biomecânico', 'Exercícios são cadastrados previamente no banco com grupamentos musculares oficiais em língua portuguesa.', 'Treino'],
        ['RN22', 'Limites Válidos de Cargas e Séries', 'Séries devem estar entre 1 e 10; repetições entre 1 e 100; descanso entre 15 e 600 segundos.', 'Treino'],
        ['RN23', 'Persistência Sequencial de Ordem', 'A ordem dos exercícios na rotina de treino é persistida atomicamente no banco de dados.', 'Treino'],
        ['RN24', 'Imutabilidade Histórica de Treinos', 'A exclusão ou alteração de um plano de treino NUNCA remove ou adultera os registros históricos de treinos já realizados.', 'Treino'],
        ['RN25', 'Múltiplas Opções de Sugestão', 'O assistente de treino deve gerar 3 opções completas (Treino A, B, C) para escolha explícita do usuário.', 'Treino'],
        ['RN26', 'Alertas de Inconsistência de Treino', 'O sistema alerta o usuário caso rotinas ativas estejam sem exercícios cadastrados.', 'Treino'],
        ['RN27', 'Isenção Médica Obrigatória', 'Todas as telas de planejamento nutricional e treino devem exibir o aviso de isenção de responsabilidade médica.', 'Governança'],
        ['RN28', 'Credenciamento Profissional', 'Nutricionistas e treinadores devem fornecer número de conselho de classe (CRN/CREF) para verificação.', 'Governança'],
        ['RN29', 'Governança Administrativa', 'Módulos de moderação, métricas globais e auditoria são restritos a usuários com a atribuição ADMIN.', 'Governança']
      ],
      [10, 24, 52, 14]
    )
  );

  // ==========================================
  // SEÇÃO 3: MODELAGEM DE NEGÓCIO (BPM)
  // ==========================================
  children.push(
    createHeading1('3. MODELAGEM DE NEGÓCIO (BUSINESS PROCESS MODELING)', true),
    createParagraph(
      'A Modelagem de Negócio descreve a cadeia de valor e os processos operacionais do NutriPlan v2, evidenciando como os atores interagem com o sistema para gerar valor no planejamento de saúde.'
    ),

    createHeading2('3.1. Cadeia de Valor do Sistema NutriPlan v2'),
    createBullet('1. Entrada / Diagnóstico: Coleta de dados biométricos, hábitos, intolerâncias e objetivos.', '•'),
    createBullet('2. Processamento Científico: Cálculo da TMB/TDEE e distribuição ótima de macronutrientes.', '•'),
    createBullet('3. Planejamento Nutricional: Seleção de alimentos da TACO e balanceamento via solver numérico.', '•'),
    createBullet('4. Periodização Física: Montagem de rotinas por grupamento muscular e orientação de séries/cargas.', '•'),
    createBullet('5. Execução e Controle: Cronômetro interativo em tempo real e gravação de logs imutáveis.', '•'),
    createBullet('6. Monitoramento e Supervisão: Acompanhamento de metas no Dashboard e supervisão profissional.', '•'),

    createHeading2('3.2. Macroprocessos de Negócio Detalhados'),
    makeTable(
      ['Processo de Negócio', 'Atores', 'Entradas', 'Atividades Sequenciais', 'Saídas Geradas'],
      [
        ['MP01: Anamnese e Metas', 'Usuário Comum', 'Idade, peso, altura, sexo, atividade, objetivo.', '1. Informar dados biométricos.\n2. Validar limites (RN05).\n3. Calcular TMB (RN06) e TDEE (RN07).\n4. Estabelecer déficit/superávit seguro (RN08).', 'Metas de calorias, proteínas, carboidratos e água salvas no perfil.'],
        ['MP02: Planejamento Alimentar', 'Usuário Comum, Solver Numérico', 'Metas nutricionais, restrições, 744 itens TACO.', '1. Consultar base TACO por categoria/termo.\n2. Adicionar alimentos e informar gramas.\n3. Recalcular refeição e dieta (RN15, RN16).\n4. Opcional: Acionar solver automático (RN19).', 'Plano alimentar ativo, balanceado e comparado com metas diárias.'],
        ['MP03: Prescrição e Treino', 'Usuário Comum, Treinador, Cronômetro', 'Grupos musculares, 128 exercícios.', '1. Escolher grupos musculares em português.\n2. Gerar 3 sugestões (Treino A, B, C) (RN25).\n3. Selecionar e ativar rotina.\n4. Executar séries com cronômetro em tempo real.\n5. Gravar log imutável no histórico (RN24).', 'Rotina de treino personalizada, sessão executada e histórico gravado.'],
        ['MP04: Supervisão e Gestão', 'Profissional (CRN/CREF), Administrador', 'Credenciais, mensagens de clientes, dados globais.', '1. Cadastrar conselho de classe (RN28).\n2. Administrador audita e valida conta (RN29).\n3. Usuário envia mensagem solicitando plano.\n4. Profissional responde e acompanha evolução.', 'Acompanhamento clínico humanizado e relatórios de auditoria.']
      ],
      [18, 16, 20, 26, 20]
    )
  );

  // ==========================================
  // SEÇÃO 4: DIAGRAMA DE CASOS DE USO (UML)
  // ==========================================
  children.push(
    createHeading1('4. DIAGRAMA E ESPECIFICAÇÃO DE CASOS DE USO (UML)', true),
    createHeading2('4.1. Atores do Sistema'),
    createBullet('Usuário Comum: Ator primário que consome o sistema para gerenciar seu perfil, planejar sua dieta e executar treinos.', '•'),
    createBullet('Profissional de Saúde (Nutricionista/Educador Físico): Ator especialista que cadastra registro de classe (CRN/CREF) e atende clientes.', '•'),
    createBullet('Administrador do Sistema: Ator gestor responsável pela auditoria, moderação de contas e análise de métricas.', '•'),
    createBullet('Cronômetro e Solver Matemático: Atores internos de sistema que gerenciam intervalos temporais e convergência numérica.', '•'),

    createHeading2('4.2. Mapeamento Geral de Casos de Uso por Subsistema'),
    makeTable(
      ['Código', 'Nome do Caso de Uso', 'Ator Primário', 'Relacionamentos (Include / Extend)', 'Requisitos'],
      [
        ['UC01', 'Cadastrar e Atualizar Perfil Antropométrico', 'Usuário Comum', '<<include>> Validar Limites Fisiológicos', 'RF01, RF07, RF09'],
        ['UC02', 'Calcular Metas Nutricionais e Gasto Energético', 'Usuário Comum', '<<include>> Aplicar Equação Mifflin-St Jeor', 'RF10, RF11, RF12, RF13'],
        ['UC03', 'Consultar Alimentos na Tabela TACO', 'Usuário Comum, Nutricionista', '<<include>> Calcular Proporcionalidade 100g', 'RF14, RF15, RF16, RF17'],
        ['UC04', 'Montar Dieta com Solver Numérico', 'Usuário Comum, Nutricionista', '<<include>> UC03; <<extend>> UC07 Alerta Alergias', 'RF18, RF19, RF20, RF21, RF24'],
        ['UC05', 'Montar Treino com Múltiplas Sugestões', 'Usuário Comum, Treinador', '<<include>> Filtrar Catálogo por Grupamento', 'RF26, RF27, RF28, RF29, RF35'],
        ['UC06', 'Executar Treino com Cronômetro em Tempo Real', 'Usuário Comum', '<<include>> Gravar Log Histórico Imutável', 'RF31, RF32, RF36'],
        ['UC07', 'Solicitar Acompanhamento Profissional', 'Usuário Comum', '<<include>> Enviar Mensagem Segura', 'RF37'],
        ['UC08', 'Auditar Plataforma e Moderar Profissionais', 'Administrador', '<<include>> Validar Registro CRN/CREF', 'RF38']
      ],
      [10, 26, 18, 28, 18]
    ),

    createHeading2('4.3. Especificação Detalhada dos Casos de Uso Principais'),
    createCallout(
      'UC04 — MONTAR DIETA COM SOLVER NUMÉRICO',
      'Ator: Usuário Comum / Nutricionista\nPré-condições: Usuário autenticado e com metas nutricionais calculadas no perfil.\nFluxo Principal:\n1. O usuário acessa o montador de dietas e seleciona "Assistente de Dieta".\n2. O sistema recupera as metas de calorias, proteínas, carboidratos e lipídios do usuário.\n3. O usuário define o número desejado de refeições (3 a 6 refeições diárias).\n4. O solver numérico do backend seleciona alimentos balanceados da base TACO (744 itens) e calcula gramas ótimas.\n5. O sistema valida que as tolerâncias estritas foram cumpridas (≤ 5% calorias/P, ≤ 8% C/G) e persiste o plano no SQLite.\n6. A interface renderiza o plano completo com indicadores de progresso.\nPós-condições: Dieta ativa criada e associada ao usuário com totais sincronizados.'
    ),

    createCallout(
      'UC06 — EXECUTAR TREINO COM CRONÔMETRO EM TEMPO REAL E GRAVAR HISTÓRICO',
      'Ator: Usuário Comum\nPré-condições: Usuário autenticado com rotina de treino ativa cadastrada.\nFluxo Principal:\n1. O usuário acessa a aba "Treino de Hoje" e clica em [ INICIAR ] no primeiro exercício.\n2. O cronômetro de execução inicia contagem progressiva em MM:SS.\n3. Ao concluir a série, o usuário clica em [ FINALIZAR SÉRIE ].\n4. O cronômetro de execução para e o cronômetro de descanso inicia imediatamente.\n5. O usuário avança para a próxima série. O exercício recebe o badge "✓ Concluído" ao finalizar todas as séries.\n6. O usuário clica em [ CONCLUIR SESSÃO DE TREINO ]. O sistema grava o log no SQLite (workout_logs).\nPós-condições: Log histórico imutável gravado no banco; rotina base pode ser alterada no futuro sem afetar este registro (RN24).'
    )
  );

  // ==========================================
  // SEÇÃO 5: MATRIZ DE RASTREABILIDADE
  // ==========================================
  children.push(
    createHeading1('5. MATRIZ DE RASTREABILIDADE BIDIRECIONAL', true),
    createParagraph(
      'A Matriz de Rastreabilidade garante o alinhamento de ponta a ponta entre Requisitos Funcionais, Requisitos Não-Funcionais, Regras de Negócio, Casos de Uso, Código-Fonte e Casos de Teste Automatizados da disciplina:'
    ),

    makeTable(
      ['RF', 'RN Vinculada', 'Caso de Uso', 'Componente / Arquivo (Código-Fonte)', 'ID do Teste Vitest', 'Cobertura Validada'],
      [
        ['RF01', 'RN01, RN02', 'UC01', 'api/src/modules/auth/auth.service.ts', 'TEST-AUTH-001, 002', 'Criação com Bcrypt e bloqueio de duplicados.'],
        ['RF02', 'RN02, RN04', 'UC01', 'api/src/modules/auth/auth.service.ts', 'TEST-AUTH-003, 004', 'Emissão de JWT e rejeição 401 para credenciais falsas.'],
        ['RF05', 'RN03, RN04', 'UC01', 'api/src/modules/auth/jwt-auth.guard.ts', 'TEST-SEC-001, 002', 'Bloqueio de chamadas não autenticadas.'],
        ['RF06', 'RN03', 'UC04, UC05', 'api/src/modules/diets/diets.service.ts', 'TEST-SEC-003, 004', 'Proteção IDOR: bloqueio de acesso a dados alheios.'],
        ['RF07', 'RN05', 'UC01', 'api/src/modules/profile/profile.service.ts', 'TEST-PROF-001, 002', 'Validação de limites antropométricos e pesagens.'],
        ['RF10', 'RN06', 'UC02', 'api/src/modules/nutrition/nutrition-calculator.service.ts', 'TEST-NUTRI-001, 002', 'Cálculo TMB Mifflin-St Jeor para ambos os sexos.'],
        ['RF11', 'RN07', 'UC02', 'api/src/modules/nutrition/nutrition-calculator.service.ts', 'TEST-NUTRI-003', 'Multiplicação pelos fatores de atividade física.'],
        ['RF12', 'RN08, RN09', 'UC02', 'api/src/modules/nutrition/nutrition-calculator.service.ts', 'TEST-NUTRI-004, 005', 'Déficit/superávit seguro e distribuição de macros.'],
        ['RF14', 'RN11, RN12', 'UC03', 'api/src/database/database.service.ts', 'TEST-DB-003, FOOD-001', 'Carga de 744 alimentos TACO com micronutrientes.'],
        ['RF15', 'RN10', 'UC03', 'api/src/modules/foods/foods.service.ts', 'TEST-FOOD-002, 006', 'Busca sem acento e taxonomia em 2 níveis.'],
        ['RF16', 'RN10', 'UC03', 'api/src/modules/nutrition/nutrition-calculator.service.ts', 'TEST-NUTRI-007', 'Cálculo proporcional de porções arbitrárias por 100g.'],
        ['RF18', 'RN13', 'UC04', 'api/src/modules/diets/diets.service.ts', 'TEST-DIET-001', 'Criação relacional de dieta associada ao usuário.'],
        ['RF20', 'RN13, RN14', 'UC04', 'api/src/modules/diets/diets.service.ts', 'TEST-DIET-002, 005', 'Adição de alimentos e rejeição de gramas ≤ 0.'],
        ['RF21', 'RN15, RN16', 'UC04', 'api/src/modules/diets/diets.service.ts', 'TEST-DIET-003, 004', 'Recálculo em cascata atômico pós-alteração de porção.'],
        ['RF23', 'RN17', 'UC04', 'api/src/modules/nutrition/nutrition-calculator.service.ts', 'TEST-DIET-007, NUTRI-008', 'Detecção de conflitos de alergias e intolerâncias.'],
        ['RF24', 'RN19', 'UC04', 'api/src/modules/diets/diets.service.ts', 'TEST-DIET-009, 010', 'Solver de dieta automática com tolerâncias estritas.'],
        ['RF25', 'RN27', 'UC04', 'api/src/modules/dashboard/dashboard.service.ts', 'TEST-DASH-001', 'Aviso legal mandatório de saúde em todas as respostas.'],
        ['RF26', 'RN21', 'UC05', 'api/src/modules/workouts/workouts.service.ts', 'TEST-DB-004, EXER-001', 'Catálogo de 128 exercícios com biomecânica.'],
        ['RF27', 'RN21', 'UC05', 'api/src/modules/workouts/workouts.service.ts', 'TEST-EXER-001, 002', 'Busca por múltiplos grupamentos em português.'],
        ['RF28', 'RN20', 'UC05', 'api/src/modules/workouts/workouts.service.ts', 'TEST-WORK-001', 'Persistência de rotinas de treino do usuário.'],
        ['RF29', 'RN22', 'UC05', 'api/src/modules/workouts/workouts.service.ts', 'TEST-WORK-002, 003', 'Validação de séries, repetições e cargas válidas.'],
        ['RF30', 'RN23', 'UC05', 'api/src/modules/workouts/workouts.service.ts', 'TEST-WORK-005', 'Reordenação atômica sequencial no SQLite.'],
        ['RF31', 'RN24', 'UC06', 'api/src/modules/workouts/workouts.service.ts', 'TEST-LOG-001', 'Gravação de sessão de treino executada.'],
        ['RF32', 'RN24', 'UC06', 'api/src/modules/workouts/workouts.service.ts', 'TEST-LOG-002', 'Imutabilidade: exclusão do plano preserva logs passados.'],
        ['RF35', 'RN25', 'UC05', 'api/src/modules/workouts/workouts.service.ts', 'TEST-WORK-006, 007', 'Geração de 3 sugestões de treino (A, B, C).'],
        ['RF36', 'RN22', 'UC06', 'web/src/pages/WorkoutPlanner.tsx', 'TEST-WORK-002', 'Cronômetro de execução e descanso em tempo real.'],
        ['RF37', 'RN28', 'UC07', 'api/src/modules/professionals/professionals.service.ts', 'TEST-PROF-003', 'Credenciamento profissional com CRN/CREF.'],
        ['RF38', 'RN29', 'UC08', 'api/src/modules/admin/admin.service.ts', 'TEST-ADMIN-001', 'Painel administrativo com proteção @Roles(ADMIN).']
      ],
      [8, 12, 10, 32, 16, 22]
    )
  );

  // ==========================================
  // SEÇÃO 6: CONTROLE DE MUDANÇAS
  // ==========================================
  children.push(
    createHeading1('6. POLÍTICA E REGISTRO DE CONTROLE DE MUDANÇAS', true),
    createHeading2('6.1. Política e Governança de Mudanças em Requisitos'),
    createParagraph(
      'Para coibir desvios descontrolados de escopo (Scope Creep) e garantir que todas as alterações preservem a integridade da arquitetura e a aprovação na suíte de testes, o projeto adotou um processo formal de gestão de mudanças:'
    ),
    createBullet('1. Solicitação de Mudança (RFC): Toda proposta de alteração de requisito é formalizada indicando justificativa de domínio e componentes afetados.', '•'),
    createBullet('2. Análise de Impacto Tridimensional: Avaliação dos impactos em: (a) Modelo de dados SQLite, (b) Quebra potencial de testes existentes, (c) Ergonomia da interface.', '•'),
    createBullet('3. Parecer do CCB (Change Control Board): Deliberação pelo grupo de engenharia (Gustavo e Fabiana).', '•'),
    createBullet('4. Princípio de Não-Rollback: Proibição terminante de rollbacks cegos; correções pontuais são resolvidas no código atual.', '•'),

    createHeading2('6.2. Registro Histórico de Mudanças em Requisitos do NutriPlan v2'),
    makeTable(
      ['RFC', 'Data', 'Solicitante', 'Descrição da Mudança de Requisito', 'Motivação / Justificativa Técnica', 'Impacto nos Requisitos', 'Situação'],
      [
        ['RFC-01', '06/10/2026', 'Usuários / UX', 'Remoção de jargões técnicos internos (RN10, RN20, RN24) da interface e tradução para português amigável.', 'Evitar sobrecarga cognitiva no usuário comum, tornando a interface acessível e intuitiva.', 'RF21, RF29, RN10, RN24', 'APROVADA E IMPLEMENTADA'],
        ['RFC-02', '06/10/2026', 'Equipe ES', 'Substituição da geração única de treino por seleção multimuscular com 3 sugestões (Treino A, B, C).', 'Permitir que o usuário escolha a divisão que melhor se adequa ao tempo e preferências do dia.', 'RF35, RN25, TEST-WORK-007', 'APROVADA E IMPLEMENTADA'],
        ['RFC-03', '06/10/2026', 'Stakeholders', 'Inclusão de cronômetro dinâmico em tempo real de execução e descanso por série com memória local.', 'Controlar o tempo fisiológico ótimo de intervalo entre séries sem sair do aplicativo.', 'RF36, RN22, UI Treino', 'APROVADA E IMPLEMENTADA'],
        ['RFC-04', '06/10/2026', 'Segurança / QA', 'Garantia de imutabilidade estrita do histórico de treinos (ON DELETE SET NULL em rotinas).', 'Exclusão ou alteração de planos base jamais pode corromper ou apagar execuções passadas do usuário.', 'RF32, RN24, TEST-LOG-002', 'APROVADA E IMPLEMENTADA'],
        ['RFC-05', '06/10/2026', 'Docente / PO', 'Otimização estrita do solver numérico de dietas com limites matemáticos (≤ 5% kcal/P, ≤ 8% C/G).', 'Eliminar divergências entre as metas calóricas calculadas e a soma final de macronutrientes da dieta.', 'RF24, RN19, TEST-DIET-009/010', 'APROVADA E IMPLEMENTADA'],
        ['RFC-06', '06/10/2026', 'Auditoria FATEC', 'Proteção explícita de sementes da base TACO no .gitignore e eliminação de vulnerabilidades de pacotes.', 'Garantir que clones limpos executem a inicialização e o seed com sucesso e zero alertas npm audit.', 'RNF01, RNF08, RNF10, Seeds', 'APROVADA E IMPLEMENTADA']
      ],
      [8, 11, 13, 26, 20, 11, 11]
    )
  );

  // ==========================================
  // REFERÊNCIAS BIBLIOGRÁFICAS
  // ==========================================
  children.push(
    createHeading1('REFERÊNCIAS BIBLIOGRÁFICAS', true),
    createParagraph(
      'ASSOCIAÇÃO BRASILEIRA DE NORMAS TÉCNICAS. NBR 6023: Informação e documentação — Referências — Elaboração. Rio de Janeiro: ABNT, 2018.'
    ),
    createParagraph(
      'CONSELHO FEDERAL DE NUTRICIONISTAS. Resolução CFN nº 600/2018: Define as áreas de atuação do nutricionista e suas atribuições. Brasília: CFN, 2018.'
    ),
    createParagraph(
      'INTERNATIONAL ORGANIZATION FOR STANDARDIZATION. ISO/IEC/IEEE 29148:2018: Systems and software engineering — Life cycle processes — Requirements engineering. Geneva: ISO/IEC, 2018.'
    ),
    createParagraph(
      'INTERNATIONAL ORGANIZATION FOR STANDARDIZATION. ISO/IEC 25010:2011: Systems and software engineering — Systems and software Quality Requirements and Evaluation (SQuaRE) — System and software quality models. Geneva: ISO, 2011.'
    ),
    createParagraph(
      'MIFFLIN, M. D.; ST JEOR, S. T.; HILL, L. A.; SCOTT, B. J.; DAUGHERTY, S. A.; KOH, Y. O. A new predictive equation for resting energy expenditure in healthy individuals. The American Journal of Clinical Nutrition, v. 51, n. 2, p. 241-247, 1990.'
    ),
    createParagraph(
      'NÚCLEO DE ESTUDOS E PESQUISAS EM ALIMENTAÇÃO - NEPA. Tabela Brasileira de Composição de Alimentos - TACO. 4. ed. rev. e ampl. Campinas: UNICAMP, 2011. 161 p.'
    ),
    createParagraph(
      'PRESSMAN, Roger S.; MAXIM, Bruce R. Engenharia de Software: Uma Abordagem Profissional. 9. ed. Porto Alegre: AMGH, 2021.'
    ),
    createParagraph(
      'SOMMERVILLE, Ian. Engenharia de Software. 10. ed. São Paulo: Pearson Education do Brasil, 2019.'
    ),
    createParagraph(
      'WIEGERS, Karl; BEATTY, Joy. Software Requirements. 3. ed. Redmond: Microsoft Press, 2013.'
    )
  );

  // Montagem do Documento com Cabeçalho e Rodapé Formatados
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1700,    // ~3cm (30mm) ABNT
              bottom: 1134, // ~2cm (20mm) ABNT
              left: 1700,   // ~3cm (30mm) ABNT
              right: 1134,  // ~2cm (20mm) ABNT
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { after: 120 },
                children: [
                  new TextRun({
                    text: 'NUTRIPLAN V2 — FASE 2: ENGENHARIA DE REQUISITOS | FATEC CAMPINAS',
                    size: 16,
                    color: COLORS.MUTED,
                    font: 'Arial',
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'Laboratório de Engenharia de Software — ADS — Página ',
                    size: 16,
                    color: COLORS.MUTED,
                    font: 'Arial',
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 16,
                    color: COLORS.MUTED,
                    font: 'Arial',
                    bold: true,
                  }),
                  new TextRun({
                    text: ' de ',
                    size: 16,
                    color: COLORS.MUTED,
                    font: 'Arial',
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    size: 16,
                    color: COLORS.MUTED,
                    font: 'Arial',
                  }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);

  // Salva no diretório raiz do projeto e na pasta docs/
  const rootPath = path.resolve(__dirname, '..', 'Fase_2_Engenharia_de_Requisitos_NutriPlan_v2.docx');
  const docsDir = path.resolve(__dirname, '..', 'docs');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }
  const docsPath = path.resolve(docsDir, 'Fase_2_Engenharia_de_Requisitos_NutriPlan_v2.docx');

  try {
    fs.writeFileSync(rootPath, buffer);
    console.log(`- Raiz: ${rootPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
  } catch (err) {
    if (err.code === 'EBUSY') {
      const altRoot = path.resolve(__dirname, '..', 'Fase_2_Engenharia_de_Requisitos_NutriPlan_v2_Atualizado.docx');
      fs.writeFileSync(altRoot, buffer);
      console.log(`- Raiz (arquivo original aberto no Word; salvo como alternativo): ${altRoot} (${(buffer.length / 1024).toFixed(1)} KB)`);
    } else {
      throw err;
    }
  }

  try {
    fs.writeFileSync(docsPath, buffer);
    console.log(`- Docs: ${docsPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
  } catch (err) {
    if (err.code === 'EBUSY') {
      const altDocs = path.resolve(docsDir, 'Fase_2_Engenharia_de_Requisitos_NutriPlan_v2_Atualizado.docx');
      fs.writeFileSync(altDocs, buffer);
      console.log(`- Docs (arquivo original aberto no Word; salvo como alternativo): ${altDocs} (${(buffer.length / 1024).toFixed(1)} KB)`);
    } else {
      throw err;
    }
  }

  console.log('Documento da Fase 2 gerado com sucesso!');
}

generateFase2Docx().catch((err) => {
  console.error('Erro ao gerar documento da Fase 2:', err);
  process.exit(1);
});
