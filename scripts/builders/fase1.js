/**
 * Construtor do Conteúdo da Fase 1: Processo e Planejamento de Software
 * Autores: Gustavo Meneses Ruegenberg Rodrigues e Fabiana Tiemi Watanabe
 * FATEC Campinas - Laboratório de Engenharia de Software
 */

function getFase1Body(common) {
  const {
    createHeading1,
    createHeading2,
    createHeading3,
    createParagraph,
    createBullet,
    createCallout,
    makeTable,
  } = common;

  const children = [];

  // ==========================================
  // SEÇÃO 1: DEFINIÇÃO DO PROBLEMA
  // ==========================================
  children.push(
    createHeading1('1. DEFINIÇÃO DO PROBLEMA', true),
    createHeading2('1.1. Contexto e Relevância Social e Biomédica'),
    createParagraph(
      'A busca por saúde, longevidade, recomposição corporal e melhora no desempenho físico cresceu exponencialmente nas últimas décadas. Segundo a Organização Mundial da Saúde (OMS) e o Ministério da Saúde do Brasil, a prática regular de exercícios com sobrecarga (musculação) aliada a um plano nutricional balanceado constitui a principal intervenção não farmacológica contra doenças crônicas não transmissíveis (DCNTs), como obesidade, diabetes tipo 2, hipertensão arterial sistêmica e sarcopenia precoce.'
    ),
    createParagraph(
      'Apesar do vasto consenso científico sobre a necessidade de conciliar alimentação e treino, a população em geral enfrenta severas barreiras para transformar esse conhecimento em rotinas consistentes e sustentáveis ao longo do tempo.'
    ),

    createHeading2('1.2. Dores do Usuário e Ineficiência das Soluções Existentes'),
    createParagraph(
      'A análise de campo e o levantamento de contexto evidenciaram um conjunto crítico de dores que afetam tanto praticantes autônomos quanto indivíduos sob supervisão profissional:'
    ),
    createBullet(
      'Sobrecarga cognitiva e desistência prematura: Estima-se que mais de 60% dos novos frequentadores de academias e iniciantes em reeducação alimentar abandonam suas rotinas nos primeiros três meses de prática. A principal causa reside na extrema fricção e complexidade em pesar alimentos, calcular macronutrientes (proteínas, carboidratos e lipídios), correlacionar calorias com o gasto energético total e controlar manualmente a progressão de cargas e séries.',
      'a)'
    ),
    createBullet(
      'Desinformação e dietas da moda: A proliferação de protocolos nutricionais sem embasamento fisiológico nas redes sociais (dietas extremamente restritivas, jejuns descontrolados, privação severa de carboidratos) gera quadros de compulsão alimentar, perda severa de massa muscular (catabolismo) e desaceleração metabólica.',
      'b)'
    ),
    createBullet(
      'Treinos aleatórios e risco biomecânico: Sem orientação estruturada, usuários recorrem a fichas genéricas ou intercalam exercícios sem critério de volume semanal por grupamento muscular, descanso entre séries ou adaptação para dores articulares e lesões preexistentes.',
      'c)'
    ),

    createHeading2('1.3. A Lacuna Nutricional Científica Brasileira (Tabela TACO)'),
    createParagraph(
      'Um dos problemas mais graves identificados nos aplicativos internacionais líderes de mercado (como MyFitnessPal, FatSecret e Cronometer) é a completa desarmonia com os hábitos alimentares e padrões de medição brasileiros:'
    ),
    createBullet(
      'Bancos de dados poluídos e não confiáveis: Tais ferramentas permitem que qualquer usuário cadastre alimentos sem moderação, resultando em dados inconsistentes (por exemplo, registros do mesmo alimento com diferenças de mais de 400% na quantidade de calorias e teores de sódio zerados).',
      '•'
    ),
    createBullet(
      'Ausência da Tabela TACO: O padrão ouro da ciência dos alimentos no Brasil é a Tabela Brasileira de Composição de Alimentos (TACO), desenvolvida pelo Núcleo de Estudos e Pesquisas em Alimentação (NEPA) da UNICAMP. Os aplicativos existentes não operam prioritariamente com a TACO, forçando o cidadão brasileiro a registrar marcas industriais norte-americanas incompatíveis com preparações típicas (arroz branco cozido, feijão carioca, mandioca, cortes bovinos e aves nacionais).',
      '•'
    ),

    createHeading2('1.4. Riscos à Saúde e Ausência de Supervisão Profissional'),
    createParagraph(
      'A automação de dietas e treinos sem mecanismos de segurança oferece riscos severos à integridade biológica do usuário. Softwares comerciais frequentemente incentivam déficits calóricos perigosos (abaixo de 1.000 kcal diárias para adultos), ignoram alergias a amendoim, glúten ou intolerância à lactose, e não possuem canais formais de comunicação com nutricionistas e educadores físicos habilitados.'
    ),

    createHeading2('1.5. Formulação Formal do Problema'),
    createCallout(
      'ENUNCIADO FORMAL DO PROBLEMA',
      '"Como projetar e implementar um sistema computacional integrado, cientificamente fundamentado e ergonomicamente intuitivo, capaz de calcular com precisão matemática a Taxa Metabólica Basal (TMB) e Gasto Energético Total (TDEE), montar e recalcular automaticamente dietas individualizadas baseadas na Tabela TACO (744 alimentos), prescrever rotinas estruturadas de treino por grupamento muscular com cronômetro em tempo real, garantir proteção de dados e integridade de histórico, mantendo conformidade estrita com as diretrizes éticas e de Engenharia de Software?"',
      'alert'
    )
  );

  // ==========================================
  // SEÇÃO 2: JUSTIFICATIVA DO SISTEMA
  // ==========================================
  children.push(
    createHeading1('2. JUSTIFICATIVA DO SISTEMA', true),
    createHeading2('2.1. Proposta de Valor e Inovação'),
    createParagraph(
      'O NutriPlan v2 justifica-se pela urgente necessidade de superar a fragmentação existente entre planejamento dietético e prescrição de treinamento físico. Ao consolidar em uma arquitetura unificada o motor de cálculo nutricional científico e a periodização do treinamento musculoesquelético, o sistema oferece ao usuário clareza, previsibilidade e consistência.'
    ),

    createHeading2('2.2. Fundamentação Científica e Modelos Matemáticos'),
    createParagraph(
      'Diferentemente de sistemas que utilizam aproximações empíricas não documentadas, o NutriPlan v2 baseia-se estritamente na literatura médica e bioquímica consolidada:'
    ),
    createBullet(
      'Taxa Metabólica Basal (TMB): Aplicação da equação de Mifflin-St Jeor (1990), reconhecida pela American Dietetic Association (ADA) como a fórmula mais acurada para indivíduos adultos contemporâneos:\n• Homens: TMB = (10 × peso em kg) + (6.25 × altura em cm) - (5 × idade) + 5\n• Mulheres: TMB = (10 × peso em kg) + (6.25 × altura em cm) - (5 × idade) - 161',
      '1.'
    ),
    createBullet(
      'Gasto Energético Total Diário (TDEE): Ponderação rigorosa pelos 5 fatores de atividade física padronizados pela FAO/OMS (1.20 para sedentários até 1.90 para praticantes de atividade física intensa diária).',
      '2.'
    ),
    createBullet(
      'Pisos Biológicos de Segurança Nutricional: Implementação mandatória de piso calórico inegociável (1.200 kcal para mulheres e 1.500 kcal para homens), impedindo a prescrição de dietas de subnutrição lesivas à tireoide e ao sistema endócrino.',
      '3.'
    ),
    createBullet(
      'Proporcionalidade da Base TACO: Todos os 744 alimentos operam sob a base de 100g de porção comestível, permitindo que o sistema calcule instantaneamente proporções matemáticas contínuas para porções arbitrárias (ex.: 135g) sem arredondamentos distorcidos.',
      '4.'
    ),

    createHeading2('2.3. Sinergia entre Nutrição e Treinamento Físico'),
    createParagraph(
      'A síntese proteica muscular (hipertrofia) e a oxidação de gorduras (lipólise) são processos fisiológicos interdependentes. Uma dieta com superávit calórico sem estímulo tensional resistido gera acúmulo de gordura corporal; inversamente, um treino de musculação extenuante sob déficit calórico não planejado conduz ao catabolismo muscular e lesão por esforço repetitivo. A justificativa técnica do NutriPlan v2 repousa no alinhamento simultâneo entre macronutrientes da dieta e divisão do volume de treino.'
    ),

    createHeading2('2.4. Análise de Viabilidade'),
    makeTable(
      ['Dimensão de Viabilidade', 'Análise Técnica no NutriPlan v2', 'Parecer'],
      [
        ['Viabilidade Técnica', 'Uso de tecnologias consolidadas (Node 24, NestJS, SQLite com PRAGMA foreign_keys, React 19, TypeScript). Arquitetura local de banco permite execução rápida e sem custos de nuvem de terceiros.', 'TOTALMENTE VIÁVEL'],
        ['Viabilidade Econômica', 'Desenvolvimento baseado em software livre de código aberto (FOSS). Custo operacional zero para prototipação e homologação acadêmica.', 'TOTALMENTE VIÁVEL'],
        ['Viabilidade Operacional', 'Interfaces projetadas com alta usabilidade, botões com alvo tátil ≥ 40x40px, vocabulário em português desprovido de termos técnicos internos.', 'TOTALMENTE VIÁVEL'],
        ['Viabilidade Jurídica / Ética', 'Presença mandatória de disclaimer legal (RN27) indicando ferramenta de apoio educacional que não substitui médico ou nutricionista.', 'TOTALMENTE VIÁVEL']
      ],
      [25, 55, 20]
    ),

    createHeading2('2.5. Conformidade Ética e Isenção Médica Obrigatória (RN27)'),
    createParagraph(
      'Em estrito cumprimento às resoluções do Conselho Federal de Nutricionistas (CFN) e do Conselho Federal de Educação Física (CONFEF), o NutriPlan v2 implementa avisos visuais ostensivos declarando que o software fornece estimativas educacionais e organizacionais. Ademais, o sistema incorpora portal de credenciamento e verificação de registro profissional (CRN/CREF), viabilizando o contato formal e a supervisão clínica humanizada.'
    )
  );

  // ==========================================
  // SEÇÃO 3: IDENTIFICAÇÃO DOS STAKEHOLDERS
  // ==========================================
  children.push(
    createHeading1('3. IDENTIFICAÇÃO E GESTÃO DOS STAKEHOLDERS', true),
    createHeading2('3.1. Identificação dos Grupos de Interesse'),
    createParagraph(
      'Em Engenharia de Software, a identificação precoce e detalhada dos stakeholders (partes interessadas) é indispensável para elicitar requisitos autênticos, antecipar conflitos de interesses e estabelecer critérios objetivos de aceitação do produto. O ecossistema do NutriPlan v2 engloba sete perfis primários e secundários.'
    ),

    createHeading2('3.2. Caracterização Detalhada dos Stakeholders'),
    makeTable(
      ['Stakeholder', 'Papel no Sistema', 'Necessidades e Expectativas Principais', 'Poder', 'Interesse'],
      [
        ['Usuário Comum (Praticante)', 'Usuário final primário da plataforma', 'Calcular metas nutricionais, montar dietas sem burocracia com a TACO, escolher rotinas de treino e cronometrar séries.', 'Médio', 'Muito Alto'],
        ['Nutricionista Credenciado', 'Profissional de saúde (CRN)', 'Base de alimentos confiável (sem adulterações), acompanhamento de clientes e validação de restrições alimentares.', 'Alto', 'Alto'],
        ['Educador Físico / Treinador', 'Profissional de educação física (CREF)', 'Catálogo biomecânico com exercícios categorizados, prescrição de rotinas A/B/C e monitoramento do histórico de cargas.', 'Alto', 'Alto'],
        ['Administrador do Sistema', 'Gestor operacional e de auditoria', 'Visualizar métricas consolidadas, moderar contas, auditar cadastros de profissionais e garantir a segurança geral.', 'Muito Alto', 'Médio'],
        ['Equipe de Engenharia / Devs', 'Desenvolvedores e arquitetos', 'Código limpo, arquitetura desacoplada, tipagem estrita, banco relacional ACID e 100% de testes automatizados passando.', 'Alto', 'Muito Alto'],
        ['Corpo Docente / Banca', 'Avaliadores acadêmicos da disciplina', 'Rastreabilidade estrita entre requisitos, regras de negócio e testes, cumprimento do modelo de processo e relatórios formais.', 'Muito Alto', 'Muito Alto'],
        ['Conselhos Profissionais', 'Órgãos reguladores (CFN, CONFEF)', 'Não invasão do exercício privativo da profissão, presença clara de termos de isenção médica e proteção de dados.', 'Muito Alto', 'Baixo']
      ],
      [18, 18, 38, 12, 14]
    ),

    createHeading2('3.3. Matriz Poder versus Interesse (Mendelow)'),
    createParagraph(
      'A Matriz de Mendelow orienta a estratégia de comunicação e gestão das expectativas de cada grupo durante o ciclo de vida do projeto:'
    ),
    createBullet('Gerenciar com Atenção Prioritária (Alto Poder, Alto Interesse): Corpo Docente/Avaliadores da disciplina e Usuários Finais.', '•'),
    createBullet('Manter Satisfeitos (Alto Poder, Baixo Interesse): Conselhos Profissionais (CFN/CONFEF) e Administradores do Sistema.', '•'),
    createBullet('Manter Informados (Baixo Poder, Alto Interesse): Nutricionistas e Treinadores parceiros.', '•'),
    createBullet('Monitorar (Baixo Poder, Baixo Interesse): Usuários esporádicos e visitantes da plataforma.', '•')
  );

  // ==========================================
  // SEÇÃO 4: MODELO DE PROCESSO ADOTADO
  // ==========================================
  children.push(
    createHeading1('4. MODELO DE PROCESSO ADOTADO', true),
    createHeading2('4.1. Avaliação Crítica dos Modelos de Processo de Software'),
    createParagraph(
      'Para determinar o modelo de desenvolvimento mais adequado ao NutriPlan v2, realizou-se uma avaliação comparativa dos principais paradigmas da Engenharia de Software:'
    ),
    createBullet(
      'Modelo em Cascata (Waterfall): Rigoroso e sequencial, porém excessivamente rígido frente a refinamentos nos algoritmos matemáticos de balanceamento e ajustes na interface com usuário.',
      '1.'
    ),
    createBullet(
      'Modelo em Espiral: Excelente para análise aprofundada de riscos, porém com custo de gerenciamento e documentação desproporcional para um ciclo acadêmico de um semestre.',
      '2.'
    ),
    createBullet(
      'Modelo Puramente Ágil (Scrum/Kanban informal): Rápido e iterativo, mas frequentemente negligencia artefatos formais de Engenharia de Software exigidos pela academia (como matrizes formais de rastreabilidade e dicionários de dados).',
      '3.'
    ),

    createHeading2('4.2. Seleção: Modelo Híbrido Incremental com Práticas Ágeis (XP/Scrum)'),
    createParagraph(
      'Adotou-se o Modelo Híbrido Incremental impulsionado por práticas selecionadas de Extreme Programming (XP) e cerimônias adaptadas do Scrum. Esta escolha conjuga o rigor de controle e entrega estruturada de artefatos com a flexibilidade da prototipação rápida e evolução orientada a testes.'
    ),
    createCallout(
      'JUSTIFICATIVA TÉCNICA DO PROCESSO ADOTADO',
      'O desenvolvimento incremental permite que o NutriPlan v2 forneça subsistemas completamente funcionais e verificáveis ao término de cada ciclo. A camada de segurança e banco de dados é consolidada no primeiro incremento; em seguida, entrega-se o motor nutricional; posteriormente, os montadores de dieta e treino; e, por fim, a governança e auditoria. As práticas de XP (TDD, refatoração contínua e padrões arquiteturais estritos) garantem taxa zero de regressão.'
    ),

    createHeading2('4.3. Práticas de Engenharia Incorporadas ao Processo'),
    createBullet('Desenvolvimento Orientado a Testes (TDD / Test-First nos Cálculos): Os 61 testes automatizados foram especificados e implementados em estreita simbiose com as regras de negócio, assegurando que fórmulas biomédicas operem sem desvios.', 'a)'),
    createBullet('Refatoração Contínua (Refactoring): Código constantemente higienizado para eliminar duplicações, remover dependências vulneráveis e manter tempo de compilação inferior a 2 segundos.', 'b)'),
    createBullet('Design Simples e Arquitetura em Camadas: Princípios de Clean Code, MVC e DDD (Domain-Driven Design), desacoplando lógica de domínio de detalhes de frameworks HTTP.', 'c)'),
    createBullet('Integração Contínua (Continuous Integration): Execução compulsória de suítes de teste antes de cada commit e sincronização com o repositório remoto no GitHub.', 'd)'),

    createHeading2('4.4. Mapeamento dos Incrementos do Produto'),
    makeTable(
      ['Incremento', 'Objetivo do Ciclo', 'Funcionalidades Entregues', 'Artefatos de Saída'],
      [
        ['Incremento 1', 'Infraestrutura e Autenticação', 'Schema relacional SQLite com 17 tabelas, autenticação Bcrypt, emissão de JWT, perfil antropométrico.', 'Módulo Auth, Repositórios, TEST-AUTH (6 testes).'],
        ['Incremento 2', 'Motor Nutricional e Base TACO', 'Cálculo TMB/TDEE, ingestão de 744 alimentos TACO no banco, cálculo proporcional para 100g e taxonomia.', 'Módulos Nutrition e Foods, TEST-NUTRI/FOOD (14 testes).'],
        ['Incremento 3', 'Montador de Dietas e Solver', 'Montagem manual e assistida de dietas com solver estrito (tolerâncias ≤5% kcal/P e ≤8% C/G), alertas de alergias.', 'Módulo Diets, TEST-DIET (9 testes).'],
        ['Incremento 4', 'Catálogo e Montador de Treinos', 'Catálogo de 128 exercícios, 3 sugestões estruturadas (A, B, C), cronômetro em tempo real e histórico imutável.', 'Módulo Workouts, TEST-WORK/LOG (12 testes).'],
        ['Incremento 5', 'Governança, RBAC e Publicação', 'Portal profissional com CRN/CREF, painel administrativo, auditoria, remoção de débitos técnicos e deploy.', 'Módulos Admin e Messages, 61 testes integrados.']
      ],
      [15, 25, 40, 20]
    )
  );

  // ==========================================
  // SEÇÃO 5: CICLO DE VIDA DO SOFTWARE
  // ==========================================
  children.push(
    createHeading1('5. DEFINIÇÃO DO CICLO DE VIDA DO SOFTWARE', true),
    createHeading2('5.1. Fases do Ciclo de Vida do NutriPlan v2'),
    createParagraph(
      'O ciclo de vida do software define a sequência temporal de estados e processos pelos quais o produto transita desde a sua concepção inicial até a sua desativação planejada. O NutriPlan v2 estrutura-se em sete fases fundamentais:'
    ),

    makeTable(
      ['Fase do Ciclo de Vida', 'Entradas', 'Atividades Principais', 'Saídas / Artefatos Gerados'],
      [
        ['I. Concepção e Planejamento', 'Ideia inicial e problemas de nutrição/treino no mercado.', 'Definição do problema, justificativa, stakeholders, seleção do modelo de processo, cronograma e riscos.', 'Documento da Fase 1, Matriz RACI, EAP.'],
        ['II. Engenharia de Requisitos', 'Necessidades dos stakeholders e fórmulas médicas.', 'Elicitação detalhada, especificação formal de 38 RFs, 10 RNFs e 29 Regras de Negócio.', 'REQUISITOS.md, REGRAS_DE_NEGOCIO.md, Casos de Uso.'],
        ['III. Projeto e Modelagem', 'Documento de requisitos aprovado.', 'Modelagem relacional em 3FN, diagramas de classe, especificação da API RESTful OpenAPI e arquitetura MVC.', 'ARQUITETURA.md, BANCO_DE_DADOS.md, API.md, Schema SQL.'],
        ['IV. Construção e Codificação', 'Modelos arquiteturais e casos de teste.', 'Implementação modular em NestJS, React 19, SQLite nativo, componentes visuais e otimização do solver.', 'Código-fonte limpo, sementes de dados TACO, executáveis .bat.'],
        ['V. Verificação e Testes', 'Código-fonte e cenários de homologação.', 'Execução de 61 testes herméticos em SQLite :memory:, auditoria de segurança (SQLi, IDOR, Bcrypt) e cobertura >90%.', 'TESTES.md, MATRIZ_RASTREABILIDADE.md, Relatórios Vitest.'],
        ['VI. Implantação e Transição', 'Sistema testado e homologado.', 'Build de produção otimizado, configuração de scripts de inicialização em 1 clique e publicação no GitHub.', 'Repositório GitHub (branch v2), MANUAL_TECNICO.md, MANUAL_USUARIO.md.'],
        ['VII. Manutenção e Auditoria', 'Feedback de usuários e métricas em operação.', 'Auditoria periódica de segurança, atualização da base alimentar TACO e novas funcionalidades.', 'CHANGELOG.md, Relatórios de auditoria contínua.']
      ],
      [22, 22, 34, 22]
    ),

    createHeading2('5.2. Portões de Qualidade e Critérios de Transição (Quality Gates)'),
    createParagraph(
      'Para garantir que uma fase do ciclo de vida só seja considerada concluída quando cumprir padrões inegociáveis de excelência, foram instituídos três Quality Gates obrigatórios:'
    ),
    createBullet('Quality Gate 1 (Fase I → Fase II/III): Aprovação formal do plano de projeto, matriz de stakeholders e modelo de processo sem inconsistências metodológicas.', '•'),
    createBullet('Quality Gate 2 (Fase III → Fase IV): Schema de banco validado em 3FN com chaves estrangeiras ativas e endpoints da API 100% tipados em DTOs.', '•'),
    createBullet('Quality Gate 3 (Fase IV/V → Fase VI): 100% dos testes automatizados aprovados (61/61), zero vulnerabilidades no npm audit, zero segredos expostos no Git e rastreabilidade total verificada.', '•')
  );

  // ==========================================
  // SEÇÃO 6: PLANO DE PROJETO
  // ==========================================
  children.push(
    createHeading1('6. PLANO DE PROJETO', true),
    createHeading2('6.1. Declaração de Escopo do Projeto'),
    createParagraph(
      'O gerenciamento do escopo visa assegurar que o projeto inclua todo o trabalho necessário, e somente o trabalho necessário, para a entrega do produto final com êxito.'
    ),
    createBullet('Escopo do Produto Incluso (In-Scope): Cadastro/login com JWT e Bcrypt; perfil antropométrico; motor de cálculo TMB/TDEE; base oficial TACO com 744 itens; montador de dietas com solver matemático; catálogo de 128 exercícios com biomecânica; montador de treino com opções A/B/C; cronômetro de séries e descanso em tempo real; histórico imutável de treinos; portal de profissionais com CRN/CREF; painel de administração e métricas; suíte de 61 testes automatizados; manuais técnicos e de usuário.', '✓'),
    createBullet('Escopo Não Incluso (Out-of-Scope): Processamento de transações financeiras e pagamentos com cartão de crédito (funcionalidade diferida para versões futuras); integração com dispositivos vestíveis (smartwatches) de marcas proprietárias; consultas médicas ao vivo via streaming WebRTC.', '✗'),

    createHeading2('6.2. Estrutura Analítica do Projeto (EAP / WBS)'),
    createParagraph(
      'A Estrutura Analítica do Projeto desdobra hierarquicamente o trabalho total em pacotes gerenciáveis:'
    ),
    createBullet('1.1 Gestão da Fase 1 e Plano de Projeto (Escopo, Cronograma, Riscos, Stakeholders)', '1.0 GERENCIAMENTO:'),
    createBullet('1.2 Acompanhamento de Sprints e Cerimônias de Qualidade', ''),
    createBullet('1.3 Preparação de Relatórios Formais de Engenharia de Software', ''),
    createBullet('2.1 Elicitação de Requisitos com Profissionais de Nutrição e Treinadores', '2.0 REQUISITOS:'),
    createBullet('2.2 Especificação Formal de Requisitos Funcionais (RF01 a RF38)', ''),
    createBullet('2.3 Especificação de Requisitos Não-Funcionais (RNF01 a RNF10) e Regras (RN01 a RN29)', ''),
    createBullet('3.1 Arquitetura em Camadas Desacopladas (Clean MVC)', '3.0 ARQUITETURA & DADOS:'),
    createBullet('3.2 Modelagem Relacional do SQLite em 3FN com 17 Tabelas e Índices', ''),
    createBullet('3.3 Especificação OpenAPI da API RESTful', ''),
    createBullet('4.1 Implementação do Backend NestJS (Módulos de Domínio)', '4.0 DESENVOLVIMENTO:'),
    createBullet('4.2 Implementação do Frontend React 19 com Tailwind CSS v4', ''),
    createBullet('4.3 Integração e Sincronização do Solver Matemático de Dietas e Cronômetro de Treino', ''),
    createBullet('5.1 Desenvolvimento da Suíte de 61 Testes Unitários e de Integração', '5.0 QUALIDADE & DEPLOY:'),
    createBullet('5.2 Auditoria de Segurança, Varredura de Vulnerabilidades e Prevenção IDOR/SQLi', ''),
    createBullet('5.3 Publicação no GitHub e Elaboração dos Manuais Técnicos e de Usuário', ''),

    createHeading2('6.3. Cronograma do Projeto (16 Semanas / 6 Marcos)'),
    makeTable(
      ['Semana', 'Fase / Atividade', 'Entregável Principal', 'Marco (Milestone)'],
      [
        ['Sem. 01 - 02', 'Definição do Problema, Justificativa e Stakeholders', 'Termo de Abertura e Plano da Fase 1', 'M1: Concepção Aprovada'],
        ['Sem. 03 - 04', 'Engenharia de Requisitos e Modelagem das Regras de Negócio', 'Documentos REQUISITOS.md e REGRAS_DE_NEGOCIO.md', 'M2: Requisitos Congelados'],
        ['Sem. 05 - 07', 'Projeto de Arquitetura, Banco SQLite 3FN e API REST', 'Documentos ARQUITETURA.md, BANCO_DE_DADOS.md e API.md', 'M3: Arquitetura Validada'],
        ['Sem. 08 - 11', 'Implementação dos Incrementos 1, 2, 3 e 4 (Backend + Web)', 'Módulos de Nutrição, Dieta, Treino e Cronômetro', 'M4: Núcleo Funcional Pronto'],
        ['Sem. 12 - 14', 'Governança (Admin/Profissionais), Testes Automatizados e Auditoria', '61 Testes Automatizados (TESTES.md, MATRIZ)', 'M5: Homologação Aprovada'],
        ['Sem. 15 - 16', 'Elaboração de Manuais, Empacotamento e Publicação GitHub', 'Manual Técnico, Manual do Usuário e Repositório v2', 'M6: Entrega Final do Sistema']
      ],
      [15, 40, 30, 15]
    ),

    createHeading2('6.4. Papéis, Responsabilidades e Matriz RACI'),
    createParagraph(
      'A Matriz RACI estabelece a governança sobre cada entregável do projeto, identificando quem é o Responsável pela execução (R - Responsible), quem responde pela aprovação final (A - Accountable), quem é Consultado (C - Consulted) e quem deve ser Informado (I - Informed):'
    ),
    makeTable(
      ['Entregável do Projeto', 'Gerente / Scrum', 'PO / Requisitos', 'Arquiteto / Dev', 'QA / Testes', 'Segurança / DevOps'],
      [
        ['Plano de Projeto e Fase 1', 'R / A', 'C', 'C', 'I', 'I'],
        ['Especificação de Requisitos e RNs', 'A', 'R', 'C', 'C', 'I'],
        ['Modelagem de Arquitetura e SQLite', 'I', 'C', 'R / A', 'C', 'C'],
        ['Implementação dos Módulos NestJS/React', 'I', 'C', 'R / A', 'C', 'I'],
        ['Suíte de Testes Automatizados (61 testes)', 'I', 'C', 'C', 'R / A', 'I'],
        ['Auditoria de Segurança (SQLi, IDOR, Bcrypt)', 'I', 'I', 'C', 'C', 'R / A'],
        ['Manuais de Usuário e Implantação', 'A', 'R', 'C', 'I', 'I'],
        ['Publicação no Repositório GitHub', 'A', 'I', 'C', 'I', 'R']
      ],
      [35, 13, 13, 13, 13, 13]
    ),

    createHeading2('6.5. Gerenciamento e Matriz de Riscos'),
    createParagraph(
      'Adotou-se metodologia quantitativa-qualitativa de análise de riscos baseada na matriz de severidade (Probabilidade de 1 a 5 × Impacto de 1 a 5 = Severidade de 1 a 25):'
    ),
    makeTable(
      ['Risco Identificado', 'Prob.', 'Imp.', 'Sev.', 'Estratégia de Mitigação', 'Plano de Contingência'],
      [
        ['R1: Desvios matemáticos nos macronutrientes da dieta', '2', '5', '10 (Médio)', 'Implementação de solver numérico iterativo com testes unitários dedicados (TEST-DIET-009/010).', 'Reversão atômica de persistência caso o delta exceda tolerâncias (≤5% calorias/P, ≤8% C/G).'],
        ['R2: Corrupção ou perda de dados da base TACO', '1', '5', '5 (Baixo)', 'Armazenamento da semente original em JSON versionada no Git com permissão explícita no .gitignore.', 'Script automatizado de restauração e reinjeção das 744 sementes no banco.'],
        ['R3: Falhas de segurança (SQL Injection ou vazamento IDOR)', '1', '5', '5 (Baixo)', 'Uso compulsório de Prepared Statements com ? e validação rigorosa de userId em 100% das rotas.', 'Auditoria estática contínua e revogação imediata de tokens em caso de anomalia.'],
        ['R4: Atrasos no cronograma letivo de 16 semanas', '3', '4', '12 (Alto)', 'Adoção de modelo incremental com escopo flexível (MoSCoW) e congelamento de requisitos na Semana 4.', 'Priorização das funcionalidades essenciais (Must-Have) e postergação de itens secundários.'],
        ['R5: Incompatibilidade de ambiente na máquina do avaliador', '2', '4', '8 (Médio)', 'Uso de SQLite local sem dependências de servidores externos em nuvem e criação de scripts .bat em 1 clique.', 'Documentação passo a passo detalhada no MANUAL_TECNICO.md com comandos manuais alternativos.'],
        ['R6: Sobrecarga mental do usuário com interface confusa', '2', '3', '6 (Médio)', 'Testes contínuos de usabilidade, eliminação total de identificadores técnicos internos e botões táteis.', 'Refatoração da UX com formatadores de nomes amigáveis em língua portuguesa.']
      ],
      [22, 7, 7, 10, 27, 27]
    )
  );

  // ==========================================
  // SEÇÃO 7: CRITÉRIOS DE QUALIDADE (ISO/IEC 25010)
  // ==========================================
  children.push(
    createHeading1('7. DEFINIÇÃO DE CRITÉRIOS DE QUALIDADE DE SOFTWARE', true),
    createHeading2('7.1. Modelo de Qualidade Baseado na Norma Internacional ISO/IEC 25010'),
    createParagraph(
      'Para transcender noções subjetivas de qualidade, o NutriPlan v2 adota o modelo de qualidade de produto de software padronizado pela norma internacional ISO/IEC 25010 (Systems and software engineering — Systems and software Quality Requirements and Evaluation - SQuaRE). A norma decompõe a qualidade em oito características fundamentais:'
    ),

    makeTable(
      ['Característica ISO/IEC 25010', 'Aplicação Prática no NutriPlan v2', 'Meta de Engenharia Estabelecida'],
      [
        ['1. Adequação Funcional', 'O sistema executa com precisão todas as 38 funções previstas sem erros de arredondamento.', '100% dos requisitos funcionais implementados e aprovados nos testes automatizados.'],
        ['2. Eficiência de Desempenho', 'Tempo de resposta de consultas de alimentos e exercícios no SQLite local.', 'Tempo de resposta da API < 200ms para 95% das requisições sob carga local.'],
        ['3. Compatibilidade', 'Interoperabilidade RESTful JSON e funcionamento responsivo em diferentes telas e navegadores.', 'Suporte completo a telas de 360px a 1920px (Mobile/Desktop) e browsers modernos (Chrome, Firefox, Safari, Edge).'],
        ['4. Usabilidade', 'Facilidade de operação, eliminação de termos técnicos internos e conformidade ergonômica tátil.', 'Alvos de toque ≥ 40x40px, vocabulário 100% traduzido para PT-BR e navegação fluida em menos de 3 cliques.'],
        ['5. Confiabilidade', 'Integridade referencial do banco de dados relacional e imutabilidade do histórico de execuções.', 'Zero corrupção de dados; exclusão de planos jamais apaga registros históricos (RN24).'],
        ['6. Segurança da Informação', 'Confidencialidade de credenciais, autorização por perfil e prevenção a ataques web comuns.', 'Zero senhas em texto puro (Bcrypt salt=10), zero vulnerabilidades npm, proteção total contra IDOR e SQLi.'],
        ['7. Manutenibilidade', 'Arquitetura desacoplada em camadas limpas, tipagem estrita com TypeScript e alta testabilidade.', 'Cobertura de código > 90% nos módulos de domínio e conformidade com princípios Clean Code e SOLID.'],
        ['8. Portabilidade', 'Capacidade de inicialização em qualquer computador com Node.js sem dependências proprietárias.', 'Inicialização completa em menos de 10 segundos através de script único em 1 clique (iniciar.bat).']
      ],
      [22, 45, 33]
    ),

    createHeading2('7.2. Tabela de Métricas e Metas de Aceitação (KPIs de Qualidade)'),
    makeTable(
      ['Métrica de Qualidade', 'Fórmula / Método de Medição', 'Meta Aceitável', 'Status Alcançado'],
      [
        ['Taxa de Sucesso dos Testes', '(Testes Aprovados / Total de Testes) × 100', '100%', '100% (61/61 testes)'],
        ['Cobertura de Código Global', 'Relatório gerado pelo Vitest Coverage (v8)', '> 85%', '> 93% nos módulos de domínio'],
        ['Tempo de Execução dos Testes', 'Tempo total da suíte completa de testes unitários', '< 30 segundos', '~12.1 segundos (Vitest)'],
        ['Vulnerabilidades em Dependências', 'Relatório de auditoria gerado pelo npm audit', '0 de alta severidade', '0 vulnerabilidades (Backend e Web)'],
        ['Tolerância da Dieta Assistida', 'Delta entre calorias/macros gerados e metas do usuário', '≤ 5% kcal/P, ≤ 8% C/G', 'Cumprida com rigor pelo solver'],
        ['Integridade Referencial SQLite', 'Validação de constraints de Foreign Key e Cascades', '100% ativas', 'PRAGMA foreign_keys = ON verificado'],
        ['Tempo de Inicialização em 1 Clique', 'Tempo para API e Web subirem simultaneamente', '< 15 segundos', '< 8 segundos via iniciar.bat']
      ],
      [24, 30, 20, 26]
    )
  );

  // ==========================================
  // SEÇÃO 8: CONCLUSÃO E PRÓXIMOS PASSOS
  // ==========================================
  children.push(
    createHeading1('8. CONSIDERAÇÕES FINAIS E PRÓXIMOS PASSOS', true),
    createParagraph(
      'A conclusão da Fase 1 — Processo e Planejamento de Software consolida o alicerce metodológico, científico e operacional sobre o qual o NutriPlan v2 foi erigido. Ao estabelecer uma definição rigorosa do problema, caracterizar exaustivamente as partes interessadas, justificar a necessidade da base oficial TACO e formular um plano de projeto robusto com modelo de processo híbrido incremental orientado a qualidade (ISO/IEC 25010), a equipe mitiga os riscos de retrabalho e desvios de escopo.'
    ),
    createParagraph(
      'Como transição para as fases subsequentes da disciplina de Engenharia de Software I, estabelecem-se os seguintes desdobramentos imediatos:'
    ),
    createBullet('Fase 2 (Engenharia de Requisitos): Detalhamento formal dos 38 Requisitos Funcionais e 10 Requisitos Não-Funcionais com critérios de aceitação e diagramas de casos de uso (UML).', '1.'),
    createBullet('Fase 3 (Modelagem de Arquitetura e Dados): Especificação da arquitetura limpa em camadas, diagramas de sequência e dicionário de dados das 17 tabelas em 3FN do SQLite.', '2.'),
    createBullet('Fase 4 e 5 (Implementação e Testes): Consolidação da rastreabilidade bidirecional entre cada linha de código implementada e a matriz de testes automatizados com execução contínua.', '3.')
  );

  return children;
}

module.exports = { getFase1Body };
