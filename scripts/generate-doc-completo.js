/**
 * Gerador do Documento Mestre Unificado: Fases 1 a 5 (Projeto Completo)
 * Disciplina: Laboratório de Engenharia de Software
 * Instituição: FATEC Campinas — Faculdade de Tecnologia de Campinas
 * Curso: Superior de Tecnologia em Análise e Desenvolvimento de Sistemas (ADS)
 * Autores: Gustavo Meneses Ruegenberg Rodrigues e Fabiana Tiemi Watanabe
 * Projeto: NutriPlan v2 (Relatório Consolidado de Engenharia de Software)
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

const common = require('./builders/common');
const {
  COLORS,
  createTitle,
  createHeading1,
  createHeading2,
  createHeading3,
  createParagraph,
  createBullet,
  createCallout,
  makeTable,
} = common;

const { getFase1Body } = require('./builders/fase1');
const { getFase2Body } = require('./builders/fase2');
const { getFase3Body } = require('./builders/fase3');
const { getFase4Body } = require('./builders/fase4');
const { getFase5Body } = require('./builders/fase5');

function createPartBanner(partTitle, phaseName, subtitle, description) {
  return [
    new Paragraph({
      pageBreakBefore: true,
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 120 },
      children: [
        new TextRun({
          text: partTitle.toUpperCase(),
          bold: true,
          size: 32, // 16pt
          color: COLORS.PRIMARY,
          font: 'Arial',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 160 },
      children: [
        new TextRun({
          text: phaseName,
          bold: true,
          size: 26, // 13pt
          color: COLORS.SECONDARY,
          font: 'Arial',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 240 },
      children: [
        new TextRun({
          text: subtitle,
          italic: true,
          size: 20,
          color: COLORS.MUTED,
          font: 'Arial',
        }),
      ],
    }),
    createCallout(
      'CARACTERIZAÇÃO E ESCOPO DA ETAPA',
      description,
      'success'
    ),
    new Paragraph({
      spacing: { before: 200, after: 200 },
      children: [new TextRun({ text: '' })],
    }),
  ];
}

async function generateDocCompleto() {
  console.log('Iniciando montagem do Documento Mestre Unificado (Fases 1 a 5)...');

  const children = [];

  // ==========================================
  // 1. CAPA FORMAL ABNT (PROJETO COMPLETO)
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
      spacing: { before: 0, after: 1000 },
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
      spacing: { before: 300, after: 160 },
      children: [
        new TextRun({
          text: 'NUTRIPLAN V2',
          bold: true,
          size: 46,
          color: COLORS.PRIMARY,
          font: 'Arial',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 240 },
      children: [
        new TextRun({
          text: 'SISTEMA INTEGRADO DE MONTAGEM PERSONALIZADA DE DIETA E TREINO BASEADO EM EVIDÊNCIAS',
          bold: true,
          size: 22,
          color: COLORS.SECONDARY,
          font: 'Arial',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 1200 },
      children: [
        new TextRun({
          text: 'RELATÓRIO TÉCNICO-CIENTÍFICO CONSOLIDADO DE ENGENHARIA DE SOFTWARE\nPROJETO INTEGRADO COMPLETO (FASES 1 A 5)',
          size: 22,
          bold: true,
          color: COLORS.TEXT,
          font: 'Arial',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { before: 300, after: 60 },
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
      spacing: { before: 0, after: 60 },
      children: [
        new TextRun({
          text: 'Orientação: Corpo Docente de Engenharia de Software',
          size: 20,
          color: COLORS.MUTED,
          font: 'Arial',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { before: 0, after: 1000 },
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
      spacing: { before: 400, after: 0 },
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
  // 2. FOLHA DE ROSTO ABNT
  // ==========================================
  children.push(
    createHeading1('FOLHA DE ROSTO E CARACTERIZAÇÃO DO TRABALHO', true),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 80 },
      children: [
        new TextRun({
          text: 'GUSTAVO MENESES RUEGENBERG RODRIGUES\nFABIANA TIEMI WATANABE',
          bold: true,
          size: 24,
          color: COLORS.PRIMARY,
          font: 'Arial',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 300, after: 80 },
      children: [
        new TextRun({
          text: 'NUTRIPLAN V2: SISTEMA INTEGRADO DE MONTAGEM PERSONALIZADA DE DIETA E TREINO BASEADO EM EVIDÊNCIAS',
          bold: true,
          size: 26,
          color: COLORS.PRIMARY,
          font: 'Arial',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { before: 600, after: 600 },
      children: [
        new TextRun({
          text: 'Trabalho de Conclusão Acadêmica Integrada do Ciclo de Engenharia de Software, abrangendo Processo e Planejamento (Fase 1), Engenharia de Requisitos (Fase 2), Análise e Arquitetura de Software (Fase 3), Implementação e Testes (Fase 4) e Implantação e Encerramento (Fase 5), apresentado como requisito obrigatório de avaliação no Curso Superior de Tecnologia em Análise e Desenvolvimento de Sistemas (ADS) da Faculdade de Tecnologia de Campinas (FATEC Campinas), sob orientação do corpo docente da disciplina de Laboratório de Engenharia de Software.',
          size: 20,
          italic: true,
          color: COLORS.TEXT,
          font: 'Arial',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 800, after: 0 },
      children: [
        new TextRun({
          text: 'FATEC CAMPINAS — CENTRO PAULA SOUZA\nCAMPINAS — SP\n2026',
          bold: true,
          size: 20,
          color: COLORS.MUTED,
          font: 'Arial',
        }),
      ],
    })
  );

  // ==========================================
  // 3. RESUMO E ABSTRACT
  // ==========================================
  children.push(
    createHeading1('RESUMO', true),
    createParagraph(
      'O presente relatório técnico-científico consolida integralmente o desenvolvimento do sistema NutriPlan v2, contemplando todas as 5 fases estruturantes da disciplina de Laboratório de Engenharia de Software da FATEC Campinas. O sistema soluciona o problema crítico da fragmentação entre planejamento nutricional e treinamento de força, fornecendo uma plataforma moderna, ética e baseada em evidências científicas. A arquitetura adota o padrão Clean MVC desacoplado com backend em NestJS 12 e frontend responsivo em React 19 com Tailwind CSS v4, consumindo um banco de dados relacional em Terceira Forma Normal (3FN) gerenciado pelo motor nativo SQLite do Node 24 (node:sqlite). O sistema incorpora o catálogo bromatológico oficial de 744 alimentos da Tabela Brasileira de Composição de Alimentos (TACO/UNICAMP) com cálculo proporcional contínuo por 100g, equações metabólicas de Mifflin-St Jeor e FAO/OMS, solver numérico iterativo com tolerâncias estritas (≤ 5% calorias/proteínas, ≤ 8% carboidratos/gorduras), prescrição de treinos com 128 exercícios com biomecânica em português organizados em 3 opções completas (Treino A, B, C), cronômetro em tempo real e preservação imutável do histórico (RN24). A qualidade do software foi validada através de uma suíte hermética de 61 testes automatizados (unitários, integração e funcionais) com 100% de sucesso e mais de 93% de cobertura de código, auditoria de segurança zerada no npm audit, zero vulnerabilidades a SQL Injection ou IDOR e conformidade total com o modelo de qualidade ISO/IEC 25010.'
    ),
    createParagraph(
      'Palavras-chave: Engenharia de Software. Clean Architecture. Tabela TACO. Planejamento Nutricional. Treinamento Resistido. Testes Automatizados. FATEC Campinas.',
      { bold: true }
    ),

    createHeading1('ABSTRACT', true),
    createParagraph(
      'This comprehensive technical and scientific report consolidates the complete software engineering lifecycle of the NutriPlan v2 system across all 5 structured phases of the Software Engineering Laboratory course at FATEC Campinas. The system addresses the critical fragmentation between dietary planning and resistance training by providing a modern, evidence-based, and ethical application. The architecture implements a decoupled Clean MVC pattern featuring a NestJS 12 backend and a responsive React 19 frontend with Tailwind CSS v4, powered by a Third Normal Form (3NF) relational SQLite database driven by Node 24 native engine (node:sqlite). It incorporates the official 744-food scientific database from the Brazilian Table of Food Composition (TACO/UNICAMP) with continuous 100g proportionality, metabolic equations from Mifflin-St Jeor and FAO/WHO, an iterative numerical solver with strict nutritional tolerances (≤ 5% calories/protein, ≤ 8% carbs/fat), workout prescription covering 128 exercises with biomechanics in Portuguese structured across 3 full workout options (A, B, C), interactive real-time chronometer, and immutable workout execution logs (RN24). Software quality was validated through an airtight automated test suite comprising 61 tests (unit, integration, functional/security) with 100% pass rate and over 93% code coverage, zero security vulnerabilities on npm audit, full immunity against SQL Injection and IDOR, and total compliance with the ISO/IEC 25010 quality model.'
    ),
    createParagraph(
      'Keywords: Software Engineering. Clean Architecture. TACO Database. Nutritional Planning. Resistance Training. Automated Testing. FATEC Campinas.',
      { bold: true }
    )
  );

  // ==========================================
  // 4. SUMÁRIO GERAL CONSOLIDADO
  // ==========================================
  children.push(
    createHeading1('SUMÁRIO GERAL CONSOLIDADO DAS 5 FASES', true),
    createParagraph(
      'Abaixo apresenta-se a estrutura organizacional deste relatório técnico-científico unificado, decomposto em cinco partes correspondentes às etapas regimentais do projeto NutriPlan v2:'
    ),
    makeTable(
      ['Parte / Fase do Projeto', 'Seções e Entregáveis Abrangidos', 'Módulos de Domínio e Foco Metodológico'],
      [
        [
          'PARTE I: FASE 1\nProcesso e Planejamento\n(Engenharia de Software I)',
          '• Seção 1: Definição Formal do Problema e Dores do Usuário\n• Seção 2: Justificativa Biomédica, TACO e Viabilidade\n• Seção 3: Identificação de Stakeholders e Matriz de Mendelow\n• Seção 4: Modelo de Processo Híbrido Incremental (XP/Scrum)\n• Seção 5: Ciclo de Vida do Software e Quality Gates\n• Seção 6: Plano de Projeto (EAP, Cronograma 16 Semanas, RACI, Riscos)\n• Seção 7: Critérios de Qualidade ISO/IEC 25010 e KPIs\n• Seção 8: Considerações Finais da Fase 1',
          'Concepção, viabilidade técnica/econômica, governança, cronograma físico e mitigação de riscos de engenharia.'
        ],
        [
          'PARTE II: FASE 2\nEngenharia de Requisitos\n(Engenharia de Software II)',
          '• Seção 1: Técnicas de Elicitação (Entrevistas, Survey, JAD, Benchmark)\n• Seção 2: Especificação de Requisitos (38 RFs, 10 RNFs e 29 RNs)\n• Seção 3: Modelagem de Negócio (BPM e Cadeia de Valor)\n• Seção 4: Diagrama e Especificação Detalhada de Casos de Uso (UML)\n• Seção 5: Matriz de Rastreabilidade Bidirecional Completa\n• Seção 6: Política e Registro de Controle de Mudanças (RFC-01 a 06)',
          'Engenharia de requisitos rigorosa, modelagem de processos, rastreabilidade bidirecional e gestão de mudanças.'
        ],
        [
          'PARTE III: FASE 3\nAnálise, Arquitetura e Projeto\n(Engenharia de Software III)',
          '• Seção 1: Definição Formal da Arquitetura (Clean MVC em Camadas)\n• Seção 2: Padrões de Projeto (Repository, Strategy, DTO, Guard, Solver)\n• Seção 3: Diagrama de Classes e Especificação Estrutural\n• Seção 4: Diagramas Comportamentais (Sequência e Atividade)\n• Seção 5: Modelo de Dados Relacional e Dicionário (SQLite 3FN)\n• Seção 6: Planejamento Estratégico de Testes Automatizados\n• Seção 7: Estratégia de Integração e Deploy em 1 Clique',
          'Clean Architecture, GoF patterns, modelagem relacional 3FN, diagramas UML comportamentais e pirâmide de testes.'
        ],
        [
          'PARTE IV: FASE 4\nImplementação e Testes\n(Laboratório de Eng. de Software)',
          '• Seção 1: Sistema Funcional e Evolução da Base Sem Rollback\n• Seção 2: Repositório Versionado e Engenharia de Configuração Git\n• Seção 3: Tipos de Testes Implementados (Unitários, Integração e Funcionais)\n• Seção 4: Evidências Formais de Execução (61 Testes Aprovados)\n• Seção 5: Relatório de Defeitos e Causa Raiz (RCA BUG-01 a BUG-07)\n• Seção 6: Métricas de Cobertura de Código (>93%) e Segurança Web\n• Seção 7: Conclusão da Fase 4',
          'Implementação concreta, 61 testes herméticos no Vitest, Root Cause Analysis (RCA) e eliminação de vulnerabilidades.'
        ],
        [
          'PARTE V: FASE 5\nImplantação e Encerramento\n(Entrega Final e Auditoria)',
          '• Seção 1: Plano de Implantação e Transição Operacional (Cutover)\n• Seção 2: Manual do Usuário Final (Guia Passo a Passo de Operação)\n• Seção 3: Manual Técnico de Infraestrutura e Manutenção Preventiva\n• Seção 4: Relatório Final de Encerramento (Análise Crítica, Lições)\n• Seção 5: Conclusão Geral e Termo de Homologação',
          'Transição operacional, manuais de usuário e técnico, análise crítica do processo, lições aprendidas e homologação.'
        ],
        [
          'PÓS-TEXTUAL\nConclusão e Referências',
          '• Conclusão Geral Consolidada do Projeto Integrado\n• Referências Bibliográficas Completas (Normas ABNT NBR 6023)',
          'Consolidação do aprendizado de engenharia de software e embasamento científico multidisciplinar.'
        ]
      ],
      [22, 50, 28]
    )
  );

  // ==========================================
  // PARTE I: FASE 1 – PROCESSO E PLANEJAMENTO
  // ==========================================
  children.push(
    ...createPartBanner(
      'PARTE I',
      'FASE 1: PROCESSO E PLANEJAMENTO DE SOFTWARE',
      'Engenharia de Software I — FATEC Campinas',
      'A Fase 1 estabelece o alicerce metodológico do NutriPlan v2, definindo a formulação formal do problema biomédico e de software, a justificativa científica embasada na Tabela TACO (UNICAMP), o mapeamento de stakeholders pela Matriz de Mendelow, a fundamentação do Modelo de Processo Híbrido Incremental com práticas de XP/Scrum, a definição do ciclo de vida com Quality Gates, o Plano de Projeto com EAP e Matriz RACI, e os critérios de qualidade segundo a ISO/IEC 25010.'
    ),
    ...getFase1Body(common)
  );

  // ==========================================
  // PARTE II: FASE 2 – ENGENHARIA DE REQUISITOS
  // ==========================================
  children.push(
    ...createPartBanner(
      'PARTE II',
      'FASE 2: ENGENHARIA DE REQUISITOS',
      'Engenharia de Software II — FATEC Campinas',
      'A Fase 2 consolida a especificação rigorosa das necessidades do sistema através de 5 técnicas de elicitação (entrevistas clínicas, survey quantitativo com 45 praticantes, análise documental da TACO, benchmarking competitivo e JAD). Documenta 38 Requisitos Funcionais (RFs), 10 Requisitos Não-Funcionais (RNFs) e 29 Regras de Negócio (RNs), a modelagem de processos de negócio em BPM, diagramas e especificações de casos de uso UML, a matriz de rastreabilidade bidirecional completa e o controle formal de mudanças via RFCs.'
    ),
    ...getFase2Body(common)
  );

  // ==========================================
  // PARTE III: FASE 3 – ANÁLISE, ARQUITETURA E PROJETO
  // ==========================================
  children.push(
    ...createPartBanner(
      'PARTE III',
      'FASE 3: ANÁLISE, ARQUITETURA E PROJETO',
      'Engenharia de Software III — FATEC Campinas',
      'A Fase 3 formaliza as decisões de design estrutural e comportamental do sistema, fundamentando a Clean Architecture em camadas desacopladas (Clean MVC) com NestJS 12 e React 19, os padrões de projeto arquiteturais e GoF (Repository, Strategy, DTO, Guard, Solver, State), o diagrama estrutural de classes, os diagramas de sequência e de atividades, o modelo relacional normalizado em 3FN com dicionário de dados no SQLite nativo (node:sqlite) e a estratégia de integração contínua e deploy em 1 clique.'
    ),
    ...getFase3Body(common)
  );

  // ==========================================
  // PARTE IV: FASE 4 – IMPLEMENTAÇÃO E TESTES
  // ==========================================
  children.push(
    ...createPartBanner(
      'PARTE IV',
      'FASE 4: IMPLEMENTAÇÃO E TESTES DE SOFTWARE',
      'Laboratório de Engenharia de Software — FATEC Campinas',
      'A Fase 4 documenta a concretização do software sem realização de rollback, preservando a integridade funcional histórica. Apresenta o repositório Git versionado com Conventional Commits e whitelist de sementes, a implementação dos 3 tipos formais de testes (unitários, integração e funcionais/segurança), as evidências de execução da suíte de 61 testes automatizados herméticos com 100% de sucesso no Vitest, o Relatório de Causa Raiz (RCA BUG-01 a BUG-07) e as métricas de cobertura de código superiores a 93%.'
    ),
    ...getFase4Body(common)
  );

  // ==========================================
  // PARTE V: FASE 5 – IMPLANTAÇÃO E ENCERRAMENTO
  // ==========================================
  children.push(
    ...createPartBanner(
      'PARTE V',
      'FASE 5: IMPLANTAÇÃO E ENCERRAMENTO',
      'Entrega Final e Auditoria — FATEC Campinas',
      'A Fase 5 estabelece a estratégia de implantação em piloto controlado com mecanismo de Cutover e deploy em 1 clique (iniciar.bat), os Smoke Tests de homologação, o Plano de Contingência e Backup, o Manual Completo do Usuário Final com guia de todas as telas operacionais, o Manual Técnico de Infraestrutura e Manutenção Preventiva, e o Relatório Final de Encerramento contendo a análise crítica do processo adotado, dificuldades superadas, melhorias implementadas, lições aprendidas e avaliação de maturidade ISO/IEC 25010.'
    ),
    ...getFase5Body(common)
  );

  // ==========================================
  // 5. CONCLUSÃO GERAL CONSOLIDADA
  // ==========================================
  children.push(
    createHeading1('CONCLUSÃO GERAL CONSOLIDADA DO PROJETO INTEGRADO', true),
    createParagraph(
      'A conclusão do projeto NutriPlan v2 ao longo das cinco fases da disciplina de Laboratório de Engenharia de Software do Curso Superior de Tecnologia em Análise e Desenvolvimento de Sistemas da FATEC Campinas consolida uma jornada acadêmica de altíssimo rigor técnico, metodológico e científico.'
    ),
    createParagraph(
      'O sistema resultante transcende a condição de protótipo conceitual para se firmar como uma aplicação pronta para produção (production-ready). A união sinérgica entre os cálculos metabólicos de precisão (Mifflin-St Jeor), a adoção pioneira da Tabela TACO oficial da UNICAMP (744 alimentos analisados quimicamente), o algoritmo de solver numérico iterativo estrito (≤ 5% cal/P, ≤ 8% C/G), a prescrição estruturada de treino resistido por grupamentos em português (128 exercícios com biomecânica), o cronômetro interativo em tempo real e a imutabilidade histórica de dados (RN24) conferem ao NutriPlan v2 uma proposta de valor sólida e diferenciada.'
    ),
    createParagraph(
      'Sob a perspectiva da Engenharia de Software, o projeto atesta que a disciplina metodológica é o alicerce indispensável para a velocidade e sustentabilidade do desenvolvimento de software. A adoção da regra de "Não Efetuar Rollback", a arquitetura limpa em camadas (Clean MVC), a normalização relacional em 3FN no SQLite nativo, a cobertura de testes automatizados superior a 93% com 61 testes passando com 100% de sucesso e a auditoria contínua de segurança (0 vulnerabilidades no npm audit) demonstram a maturidade de engenharia atingida pelos autores Gustavo Meneses Ruegenberg Rodrigues e Fabiana Tiemi Watanabe.'
    ),
    createCallout(
      'DECLARAÇÃO FINAL DE HOMOLOGAÇÃO DO PROJETO',
      'Declaramos para os devidos fins acadêmicos que o projeto NutriPlan v2 foi integralmente planejado, especificado, arquitetado, construído, testado, implantado e documentado de acordo com as normas da ABNT e as exigências curriculares da FATEC Campinas, encontrando-se homologado e pronto para a avaliação final perante a banca examinadora.\n\nCampinas — SP, Outubro de 2026.',
      'success'
    )
  );

  // ==========================================
  // 6. REFERÊNCIAS BIBLIOGRÁFICAS CONSOLIDADAS
  // ==========================================
  children.push(
    createHeading1('REFERÊNCIAS BIBLIOGRÁFICAS CONSOLIDADAS', true),
    createParagraph(
      'ASSOCIAÇÃO BRASILEIRA DE NORMAS TÉCNICAS. NBR 6023: Informação e documentação — Referências — Elaboração. Rio de Janeiro: ABNT, 2018.'
    ),
    createParagraph(
      'ASSOCIAÇÃO BRASILEIRA DE NORMAS TÉCNICAS. NBR 14724: Informação e documentação — Trabalhos acadêmicos — Apresentação. Rio de Janeiro: ABNT, 2011.'
    ),
    createParagraph(
      'COHN, Mike. Succeeding with Agile: Software Development Using Scrum. Boston: Addison-Wesley, 2009.'
    ),
    createParagraph(
      'CONSELHO FEDERAL DE EDUCAÇÃO FÍSICA - CONFEF. Resolução CONFEF nº 307/2015: Código de Ética dos Profissionais de Educação Física. Rio de Janeiro: CONFEF, 2015.'
    ),
    createParagraph(
      'CONSELHO FEDERAL DE NUTRICIONISTAS - CFN. Resolução CFN nº 600/2018: Define as áreas de atuação do nutricionista e suas atribuições. Brasília: CFN, 2018.'
    ),
    createParagraph(
      'GAMMA, Erich; HELM, Richard; JOHNSON, Ralph; VLISSIDES, John. Padrões de Projeto: Soluções Reutilizáveis de Software Orientado a Objetos. Porto Alegre: Bookman, 2000.'
    ),
    createParagraph(
      'INTERNATIONAL ORGANIZATION FOR STANDARDIZATION. ISO/IEC/IEEE 29148:2018: Systems and software engineering — Life cycle processes — Requirements engineering. Geneva: ISO/IEC, 2018.'
    ),
    createParagraph(
      'INTERNATIONAL ORGANIZATION FOR STANDARDIZATION. ISO/IEC 25010:2011: Systems and software engineering — Systems and software Quality Requirements and Evaluation (SQuaRE) — System and software quality models. Geneva: ISO, 2011.'
    ),
    createParagraph(
      'MARTIN, Robert C. Clean Architecture: A Craftsman\'s Guide to Software Structure and Design. Boston: Prentice Hall, 2017.'
    ),
    createParagraph(
      'MARTIN, Robert C. Clean Code: A Handbook of Agile Software Craftsmanship. Boston: Prentice Hall, 2008.'
    ),
    createParagraph(
      'MIFFLIN, M. D.; ST JEOR, S. T.; HILL, L. A.; SCOTT, B. J.; DAUGHERTY, S. A.; KOH, Y. O. A new predictive equation for resting energy expenditure in healthy individuals. The American Journal of Clinical Nutrition, v. 51, n. 2, p. 241-247, 1990.'
    ),
    createParagraph(
      'NÚCLEO DE ESTUDOS E PESQUISAS EM ALIMENTAÇÃO - NEPA. Tabela Brasileira de Composição de Alimentos - TACO. 4. ed. rev. e ampl. Campinas: UNICAMP, 2011. 161 p.'
    ),
    createParagraph(
      'ORGANIZAÇÃO MUNDIAL DA SAÚDE - OMS. Diet, nutrition and the prevention of chronic diseases: report of a Joint WHO/FAO Expert Consultation. Genebra: World Health Organization, 2003.'
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

  // ==========================================
  // CONFIGURAÇÃO DO DOCUMENTO DOCX UNIFICADO
  // ==========================================
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
                    text: 'NUTRIPLAN V2 — PROJETO COMPLETO (FASES 1 A 5) | FATEC CAMPINAS',
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
  const fileNames = [
    'NutriPlan_v2_Projeto_Completo_Engenharia_de_Software_Fases_1_a_5.docx',
    'Fases_1_a_5_Consolidado_NutriPlan_v2.docx',
  ];

  const docsDir = path.resolve(__dirname, '..', 'docs');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  for (const fileName of fileNames) {
    const rootPath = path.resolve(__dirname, '..', fileName);
    const docsPath = path.resolve(docsDir, fileName);

    try {
      fs.writeFileSync(rootPath, buffer);
      console.log(`- Raiz: ${rootPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
    } catch (err) {
      if (err.code === 'EBUSY') {
        const altRoot = path.resolve(__dirname, '..', fileName.replace('.docx', '_Atualizado.docx'));
        fs.writeFileSync(altRoot, buffer);
        console.log(`- Raiz (arquivo aberto; salvo como alternativo): ${altRoot}`);
      } else {
        throw err;
      }
    }

    try {
      fs.writeFileSync(docsPath, buffer);
      console.log(`- Docs: ${docsPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
    } catch (err) {
      if (err.code === 'EBUSY') {
        const altDocs = path.resolve(docsDir, fileName.replace('.docx', '_Atualizado.docx'));
        fs.writeFileSync(altDocs, buffer);
        console.log(`- Docs (arquivo aberto; salvo como alternativo): ${altDocs}`);
      } else {
        throw err;
      }
    }
  }

  console.log('Documento Mestre Unificado das 5 Fases gerado com pleno sucesso!');
}

generateDocCompleto().catch((err) => {
  console.error('Erro ao gerar documento mestre unificado:', err);
  process.exit(1);
});
