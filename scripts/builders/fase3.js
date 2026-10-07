/**
 * Construtor do Conteúdo da Fase 3: Análise, Arquitetura e Projeto
 * Autores: Gustavo Meneses Ruegenberg Rodrigues e Fabiana Tiemi Watanabe
 * FATEC Campinas - Laboratório de Engenharia de Software
 */

function getFase3Body(common) {
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
  // SEÇÃO 1: DEFINIÇÃO FORMAL DA ARQUITETURA
  // ==========================================
  children.push(
    createHeading1('1. DEFINIÇÃO FORMAL DA ARQUITETURA DE SOFTWARE', true),
    createHeading2('1.1. Estilo Arquitetural Adotado: Clean Architecture em Camadas'),
    createParagraph(
      'A arquitetura do NutriPlan v2 foi concebida sob os preceitos da Arquitetura em Camadas (Layered Architecture) integrada à Clean Architecture e ao Domain-Driven Design (DDD). O objetivo primordial é garantir a Separação de Preocupações (Separation of Concerns), Alta Coesão e Baixo Acoplamento, blindando o núcleo de regras de negócio biomédicas e nutricionais contra variações de frameworks web, bancos de dados ou protocolos de transporte.'
    ),
    createParagraph(
      'O sistema está estruturado em quatro macrocamadas concêntricas, onde a regra de dependência dita que dependências de código-fonte sempre apontam para dentro, em direção ao domínio de negócio:'
    ),

    makeTable(
      ['Camada Arquitetural', 'Tecnologias Utilizadas', 'Responsabilidade Principal', 'Isolamento / Regra de Dependência'],
      [
        ['1. Camada de Apresentação (Frontend)', 'React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React.', 'Renderização responsiva (Mobile/Desktop), gestão de estado de interface, cronômetro em tempo real e captura de eventos de usuário.', 'Consome a API via cliente HTTP Axios desacoplado; não contém fórmulas de TMB/TDEE.'],
        ['2. Camada de Apresentação da API (Backend Controllers)', 'NestJS Controllers, Express, Validation Pipes, JwtAuthGuard, RolesGuard.', 'Recepção de requisições HTTP RESTful, validação estrita de contratos de entrada (DTOs), autorização perimetral e formatação de respostas JSON.', 'Delega toda a lógica de negócio à Camada de Aplicação; trata exceções sem vazar stack traces.'],
        ['3. Camada de Aplicação (Application Services)', 'NestJS Services (Auth, Diets, Workouts, Profile, Foods, Dashboard).', 'Orquestração de casos de uso (UC01 a UC08), coordenação de transações atômicas e execução do solver matemático de balanceamento.', 'Conecta os repositórios à camada de domínio puro; não conhece detalhes do HTTP.'],
        ['4. Camada de Domínio e Regras Puras (Domain Core)', 'TypeScript Puro (Nutrition Calculator, Formulas, Validators, Entities).', 'Execução das fórmulas biomédicas (Mifflin-St Jeor), cálculo proporcional TACO por 100g, tolerâncias estritas e checagem de alergias.', '100% independente de frameworks, HTTP ou banco de dados; testável em milissegundos.'],
        ['5. Camada de Persistência e Repositórios (Data Access)', 'Node.js Native SQLite Engine (node:sqlite), Prepared Statements, ACID Transactions.', 'Acesso a dados relacional seguro, execução de transações atômicas, execução de Prepared Statements parametrizados e sementes TACO.', 'Implementa o padrão Repository; expõe métodos de consulta limpos à aplicação.']
      ],
      [22, 22, 34, 22]
    ),

    createHeading2('1.2. Visão de Implantação e Nós Físicos (Deployment View)'),
    createParagraph(
      'O NutriPlan v2 foi arquitetado para máxima portabilidade e independência de infraestruturas pagas de terceiros. A topologia física divide-se em:'
    ),
    createBullet('Nó do Cliente (Navegador Web / Mobile): Executa a Single Page Application (SPA) compilada com React 19 em porta local 5173 (modo desenvolvimento) ou servida estaticamente.', '•'),
    createBullet('Nó do Servidor de Aplicação (Runtime Node 24): Executa a API NestJS modular na porta 3000, gerenciando sessões e endpoints RESTful.', '•'),
    createBullet('Nó de Armazenamento Relacional (Engine SQLite): Banco relacional embutido de altíssimo desempenho operando em arquivo local (nutriplan.sqlite) em produção ou em memória (:memory:) durante testes automatizados.', '•')
  );

  // ==========================================
  // SEÇÃO 2: JUSTIFICATIVA DOS PADRÕES ADOTADOS
  // ==========================================
  children.push(
    createHeading1('2. JUSTIFICATIVA DOS PADRÕES ARQUITETURAIS E DE PROJETO', true),
    createParagraph(
      'A seleção dos padrões de software (design patterns) foi motivada por requisitos funcionais e não-funcionais específicos do sistema NutriPlan v2, priorizando testabilidade, segurança e manutenibilidade contínua:'
    ),

    makeTable(
      ['Padrão de Projeto', 'Classificação', 'Aplicação Concreta no NutriPlan v2', 'Justificativa de Engenharia'],
      [
        ['Repository Pattern', 'Arquitetural / Estrutural', 'Módulos de banco (DatabaseService, DietsRepository, WorkoutsRepository).', 'Permite isolar completamente as instruções SQL da lógica de negócio. Viabiliza testes herméticos com SQLite em memória (:memory:) sem alterar os serviços.'],
        ['Dependency Injection (DI)', 'Criacional / Inversão de Controle', 'Container nativo do NestJS (@Injectable, construtores).', 'Garante baixo acoplamento entre controladores, serviços e repositórios, viabilizando a injeção de mocks e stubs nos 61 testes unitários.'],
        ['Data Transfer Object (DTO)', 'Comportamental / Enterprise', 'Classes com class-validator e class-transformer em todas as rotas da API.', 'Bloqueia ataques de atribuição em massa (mass assignment), valida tipos de dados na entrada e garante contratos de interface rígidos.'],
        ['Strategy Pattern', 'Comportamental (GoF)', 'NutritionCalculatorService (estratégias por objetivo: Emagrecimento, Hipertrofia, Manutenção).', 'Encapsula algoritmos variáveis de déficit (-500 kcal) e superávit (+400 kcal) sob interface comum, facilitando adição de novas diretrizes metabólicas.'],
        ['Guard / Interceptor Pattern', 'Comportamental / Segurança', 'JwtAuthGuard e RolesGuard aplicados com @Roles(ADMIN, PROFESSIONAL).', 'Barreira perimetral de segurança que valida tokens JWT e permissões antes que a requisição atinja o controlador, eliminando acessos indevidos.'],
        ['Builder / Solver Pattern', 'Criacional / Comportamental', 'Algoritmo de Dieta Assistida com solver iterativo em DietsService.', 'Monta planos alimentares complexos a partir de 744 alimentos TACO, resolvendo restrições de tolerância (≤ 5% cal/P, ≤ 8% C/G) passo a passo.'],
        ['Observer / State Pattern', 'Comportamental (GoF)', 'Gerenciamento do Cronômetro em tempo real no WorkoutPlanner.tsx.', 'Permite transições fluidas de estado (Parado ➔ Executando MM:SS ➔ Descanso MM:SS) e notificação de fim de séries persistidas no localStorage.']
      ],
      [18, 16, 36, 30]
    )
  );

  // ==========================================
  // SEÇÃO 3: DIAGRAMA DE CLASSES
  // ==========================================
  children.push(
    createHeading1('3. DIAGRAMA DE CLASSES E ESPECIFICAÇÃO ESTRUTURAL', true),
    createParagraph(
      'O Diagrama de Classes modela a estrutura estática do domínio do NutriPlan v2, detalhando as entidades centrais, seus atributos, operações e relacionamentos conceituais:'
    ),

    createHeading2('3.1. Especificação Tabular das Principais Classes do Sistema'),
    makeTable(
      ['Classe de Entidade', 'Atributos Principais', 'Métodos / Operações Centrais', 'Relacionamentos'],
      [
        ['User', 'id: string\nemail: string\npasswordHash: string\nname: string\nrole: RoleEnum\nstatus: StatusEnum', 'validatePassword(pwd)\nupdateRole(newRole)\nisActive(): boolean', '1:1 Profile\n1:N Diet\n1:N Workout\n1:N WorkoutLog'],
        ['Profile', 'id: string\nuserId: string\nage: number\ngender: GenderEnum\nweight: number\nheight: number\nactivityLevel: ActivityEnum\ngoal: GoalEnum\nbmr: number\ntdee: number', 'calculateBMR()\ncalculateTDEE()\nupdateAnthropometry(p, h, a)', '1:1 User\n1:N WeightRecord\n1:N UserRestriction'],
        ['Diet', 'id: string\nuserId: string\nname: string\ntargetCalories: number\ntotalCalories: number\ntotalProtein: number\ntotalCarbs: number\ntotalFat: number\nisActive: boolean', 'recalculateTotals()\naddMeal(name, order)\ncompareWithTarget(target)', 'N:1 User\n1:N Meal'],
        ['Meal', 'id: string\ndietId: string\nname: string\norderIndex: number\ntotalCalories: number\ntotalProtein: number', 'addFood(foodId, grams)\nremoveFood(itemId)\ncalculateMealMacros()', 'N:1 Diet\n1:N MealFood'],
        ['Food (TACO)', 'id: string\nname: string\ncategory: string\nsubCategory: string\ncalories100g: number\nprotein100g: number\ncarbs100g: number\nfat100g: number\nfiber100g: number', 'calculateProportion(grams)\nhasAllergen(tag): boolean', '1:N MealFood'],
        ['Workout', 'id: string\nuserId: string\nname: string\ndivision: string\nisActive: boolean', 'addExercise(exId, sets, reps)\nreorder(newOrderList)', 'N:1 User\n1:N WorkoutExercise'],
        ['WorkoutLog', 'id: string\nuserId: string\nworkoutId: string (nullable)\nperformedAt: string\nnotes: string', 'recordSetExecution(exId, set, weight, reps)\nfinalizeWorkout()', 'N:1 User\nN:1 Workout (preservado)\n1:N WorkoutLogExercise']
      ],
      [16, 28, 30, 26]
    ),

    createHeading2('3.2. Relacionamentos Estruturais e Cardinadas'),
    createBullet('Composição Rígida Dieta ➔ Refeições ➔ Itens: Uma refeição não existe sem uma dieta vinculada; a exclusão da dieta remove suas refeições e itens associados em cascata (ON DELETE CASCADE).', '•'),
    createBullet('Associação Histórica Imutável Treino ➔ Log de Treino: Um log de treino executado faz referência à rotina que lhe deu origem, mas se a rotina for excluída pelo usuário, a chave estrangeira é convertida em nulo (ON DELETE SET NULL), garantindo a preservação absoluta do histórico do praticante (RN24).', '•'),
    createBullet('Catálogo Científico TACO ➔ Itens de Refeição: Relação fraca de agregação. O alimento da TACO é imutável e sua remoção do catálogo é bloqueada por integridade referencial.', '•')
  );

  // ==========================================
  // SEÇÃO 4: DIAGRAMAS COMPORTAMENTAIS
  // ==========================================
  children.push(
    createHeading1('4. DIAGRAMAS COMPORTAMENTAIS', true),
    createHeading2('4.1. Diagrama de Sequência: Montagem e Recálculo de Dieta com Solver Numérico'),
    createParagraph(
      'O fluxo a seguir ilustra as mensagens síncronas e assíncronas trocadas entre os componentes durante a adição de um alimento e a atuação do solver numérico de balanceamento de macronutrientes:'
    ),
    createCallout(
      'FLUXO DE SEQUÊNCIA: ADIÇÃO E RECÁLCULO ATÔMICO DE DIETA',
      '1. Ator Usuário ➔ UI React: Seleciona "Arroz Branco Cozido" (Base TACO), digita "150g" e clica em Adicionar (+).\n2. UI React ➔ DietsController: POST /diets/:id/meals/:mealId/foods { foodId, grams: 150 } com Token JWT.\n3. DietsController ➔ JwtAuthGuard: Intercepta requisição e valida autenticidade e expiração do token.\n4. JwtAuthGuard ➔ DietsController: Retorna payload do usuário autenticado (userId: "usr_42").\n5. DietsController ➔ DietsService: addFoodToMeal(userId, dietId, mealId, foodId, 150).\n6. DietsService ➔ DatabaseService: Consulta dieta e valida propriedade (WHERE id=? AND user_id=?). Proteção IDOR.\n7. DietsService ➔ DatabaseService: Recupera dados químicos do alimento na tabela foods (por 100g).\n8. DietsService ➔ NutritionCalculator: calculateProportional(food, 150g). Retorna kcal e macronutrientes exatos.\n9. DietsService ➔ DatabaseService: INSERT INTO meal_foods (transação atômica ACID).\n10. DietsService ➔ DietsService: recalculateTotals(dietId). Executa agregação em cascata com somatório das refeições.\n11. DietsService ➔ DietsController: Retorna DTO da dieta atualizada com status de tolerância de metas.\n12. DietsController ➔ UI React: HTTP 201 Created com payload JSON da dieta.\n13. UI React ➔ Ator Usuário: Renderiza alimento na tabela, emite feedback visual (✓) e atualiza gráficos de progresso.'
    ),

    createHeading2('4.2. Diagrama de Sequência: Execução de Treino com Cronômetro em Tempo Real'),
    createParagraph(
      'Demonstra a máquina de estados temporais durante a condução de uma sessão de musculação:'
    ),
    createCallout(
      'FLUXO DE SEQUÊNCIA: CRONÔMETRO DE SÉRIE E DESCANSO EM TEMPO REAL',
      '1. Ator Usuário ➔ UI WorkoutPlanner: Clica em [ INICIAR ] na Série 1 do exercício "Supino Reto".\n2. UI WorkoutPlanner ➔ Timer State: Ativa cronômetro de execução com contagem progressiva a cada 1000ms (MM:SS).\n3. Timer State ➔ LocalStorage: Persiste estado da sessão (evita perda de tempo caso o usuário recarregue a página).\n4. Ator Usuário ➔ UI WorkoutPlanner: Executa as repetições e clica em [ FINALIZAR SÉRIE ].\n5. UI WorkoutPlanner ➔ Timer State: Congela tempo de execução e dispara imediatamente o cronômetro de descanso.\n6. UI WorkoutPlanner ➔ Audio/Visual Feedback: Alerta visual quando o descanso atinge a meta configurada (ex: 60s).\n7. Ator Usuário ➔ UI WorkoutPlanner: Clica em [ CONCLUIR SESSÃO DE TREINO ].\n8. UI WorkoutPlanner ➔ WorkoutsController: POST /workouts/log { workoutId, exercisesExec: [...] }.\n9. WorkoutsController ➔ WorkoutsService: createLog(userId, logData).\n10. WorkoutsService ➔ DatabaseService: Grava registro imutável nas tabelas workout_logs e workout_log_exercises.\n11. DatabaseService ➔ UI WorkoutPlanner: HTTP 201 Created. Interface limpa timer e exibe mensagem de sucesso.'
    ),

    createHeading2('4.3. Diagrama de Atividades: Ciclo de Vida da Sessão de Treinamento'),
    createParagraph(
      'O ciclo operacional do treinamento compreende os seguintes nós de atividade e decisões:'
    ),
    createBullet('[Início] ➔ Usuário seleciona grupamentos musculares desejados (Peito, Costas, etc.).', '1.'),
    createBullet('Assistente de Treino gera 3 sugestões completas (Treino A, B, C) com exercícios oficiais em português.', '2.'),
    createBullet('[Decisão] ➔ Usuário escolhe uma das rotinas ou personaliza séries e cargas manualmente.', '3.'),
    createBullet('Ativação da sessão com cronômetro em tempo real acoplado a cada exercício.', '4.'),
    createBullet('[Loop de Séries] ➔ Iniciar Execução (MM:SS) ➔ Finalizar Série ➔ Iniciar Descanso (MM:SS) ➔ Próxima Série.', '5.'),
    createBullet('[Condição de Saída] ➔ Todas as séries cumpridas? Exercício recebe badge "✓ Concluído".', '6.'),
    createBullet('Finalização e gravação compulsória do histórico imutável no banco SQLite ➔ [Fim].', '7.')
  );

  // ==========================================
  // SEÇÃO 5: MODELO DE DADOS (BANCO DE DADOS)
  // ==========================================
  children.push(
    createHeading1('5. MODELO DE DADOS RELACIONAL E DICIONÁRIO DE DADOS', true),
    createHeading2('5.1. Normalização Relacional em Terceira Forma Normal (3FN)'),
    createParagraph(
      'A base de dados do NutriPlan v2 foi integralmente projetada e normalizada em Terceira Forma Normal (3FN), eliminando dependências parciais e transitivas. O Sistema de Gerenciamento de Banco de Dados relacional adotado é o SQLite (através do driver nativo node:sqlite do Node 24), configurado com PRAGMA foreign_keys = ON e modo WAL (Write-Ahead Logging) para garantir alta performance e integridade referencial estrita.'
    ),

    createHeading2('5.2. Dicionário de Dados das Tabelas Principais'),
    createHeading3('Tabela 1: users (Usuários e Credenciais de Acesso)'),
    makeTable(
      ['Coluna', 'Tipo SQL', 'Restrições', 'Descrição de Domínio'],
      [
        ['id', 'TEXT', 'PRIMARY KEY', 'Identificador único UUIDv4 do usuário.'],
        ['email', 'TEXT', 'UNIQUE, NOT NULL', 'Endereço de e-mail de acesso e identidade única.'],
        ['password_hash', 'TEXT', 'NOT NULL', 'Hash criptográfico da senha gerado com Bcrypt (salt = 10).'],
        ['name', 'TEXT', 'NOT NULL', 'Nome civil completo do usuário.'],
        ['role', 'TEXT', 'NOT NULL, DEFAULT "USER"', 'Perfil de controle de acesso (USER, PROFESSIONAL, ADMIN).'],
        ['status', 'TEXT', 'NOT NULL, DEFAULT "ACTIVE"', 'Estado da conta (ACTIVE, SUSPENDED, PENDING).'],
        ['created_at', 'TEXT', 'NOT NULL', 'Timestamp ISO 8601 de criação da conta.'],
        ['updated_at', 'TEXT', 'NOT NULL', 'Timestamp ISO 8601 da última alteração de cadastro.']
      ],
      [18, 16, 26, 40]
    ),

    createHeading3('Tabela 2: user_profiles (Antropometria e Parâmetros Metabólicos)'),
    makeTable(
      ['Coluna', 'Tipo SQL', 'Restrições', 'Descrição de Domínio'],
      [
        ['id', 'TEXT', 'PRIMARY KEY', 'Identificador único do perfil antropométrico.'],
        ['user_id', 'TEXT', 'UNIQUE, FK -> users(id) ON DELETE CASCADE', 'Chave estrangeira 1:1 vinculada à conta do usuário.'],
        ['age', 'INTEGER', 'CHECK(age BETWEEN 12 AND 120)', 'Idade em anos para cálculo da fórmula de Mifflin-St Jeor.'],
        ['gender', 'TEXT', 'CHECK(gender IN ("MALE", "FEMALE"))', 'Sexo biológico utilizado no termo constante da TMB (+5 ou -161).'],
        ['weight', 'REAL', 'CHECK(weight BETWEEN 30 AND 350)', 'Peso corporal em quilogramas (kg).'],
        ['height', 'REAL', 'CHECK(height BETWEEN 100 AND 250)', 'Estatura em centímetros (cm).'],
        ['activity_level', 'TEXT', 'NOT NULL', 'Nível de atividade física para aplicação do fator TDEE (1.2 a 1.9).'],
        ['bmr', 'REAL', 'NOT NULL', 'Taxa Metabólica Basal calculada em calorias diárias.'],
        ['tdee', 'REAL', 'NOT NULL', 'Gasto Energético Total Diário calculado em calorias.']
      ],
      [18, 16, 32, 34]
    ),

    createHeading3('Tabela 3: foods (Catálogo Científico de 744 Alimentos da TACO)'),
    makeTable(
      ['Coluna', 'Tipo SQL', 'Restrições', 'Descrição de Domínio'],
      [
        ['id', 'TEXT', 'PRIMARY KEY', 'Identificador único do alimento TACO.'],
        ['name', 'TEXT', 'NOT NULL', 'Nome oficial do alimento analisado (ex: "Arroz, integral, cozido").'],
        ['category', 'TEXT', 'NOT NULL', 'Categoria bromatológica principal (ex: "Cereais e derivados").'],
        ['sub_category', 'TEXT', 'NULL', 'Subcategoria de classificação para refinamento de busca.'],
        ['calories_per_100g', 'REAL', 'NOT NULL', 'Valor energético em quilocalorias por 100 gramas comestíveis.'],
        ['protein_per_100g', 'REAL', 'NOT NULL', 'Teor de proteína em gramas por 100g.'],
        ['carbs_per_100g', 'REAL', 'NOT NULL', 'Teor de carboidratos disponíveis em gramas por 100g.'],
        ['fat_per_100g', 'REAL', 'NOT NULL', 'Teor de lipídios totais em gramas por 100g.'],
        ['fiber_per_100g', 'REAL', 'NOT NULL', 'Fibra alimentar total em gramas por 100g.'],
        ['sodium_mg_per_100g', 'REAL', 'NULL', 'Teor de sódio em miligramas por 100g.']
      ],
      [22, 14, 20, 44]
    ),

    createHeading3('Tabela 4: diets, meals e meal_foods (Planos Alimentares Relacionais)'),
    makeTable(
      ['Tabela', 'Chave Primária', 'Chaves Estrangeiras', 'Regra de Integridade Referencial', 'Descrição'],
      [
        ['diets', 'id', 'user_id -> users(id)', 'ON DELETE CASCADE', 'Plano alimentar do usuário com totalizadores de calorias e macros.'],
        ['meals', 'id', 'diet_id -> diets(id)', 'ON DELETE CASCADE', 'Refeição estruturada (Café, Almoço, Jantar) com ordem de exibição.'],
        ['meal_foods', 'id', 'meal_id -> meals(id)\nfood_id -> foods(id)', 'meal: ON DELETE CASCADE\nfood: ON DELETE RESTRICT', 'Item consumido com quantidade em gramas exatas e nutrientes proporcionais.']
      ],
      [15, 15, 25, 25, 20]
    ),

    createHeading3('Tabela 5: workouts, workout_exercises e workout_logs (Treinos e Histórico Imutável)'),
    makeTable(
      ['Tabela', 'Chave Primária', 'Chaves Estrangeiras', 'Regra ON DELETE', 'Justificativa de Integridade'],
      [
        ['workouts', 'id', 'user_id -> users(id)', 'ON DELETE CASCADE', 'Rotina de treino personalizada com divisões semanais (A, B, C).'],
        ['workout_exercises', 'id', 'workout_id -> workouts(id)\nexercise_id -> exercises(id)', 'CASCADE em workout\nRESTRICT em exercise', 'Exercício da rotina com séries, repetições, carga e tempo de descanso.'],
        ['workout_logs', 'id', 'user_id -> users(id)\nworkout_id -> workouts(id)', 'user: CASCADE\nworkout: ON DELETE SET NULL', 'CRÍTICO (RN24): A exclusão do plano base nunca apaga logs passados do usuário.'],
        ['workout_log_exercises', 'id', 'workout_log_id -> workout_logs(id)\nexercise_id -> exercises(id)', 'CASCADE em log\nRESTRICT em exercise', 'Registro da execução de cada série com cargas reais e tempo decorrido.']
      ],
      [20, 15, 25, 20, 20]
    )
  );

  // ==========================================
  // SEÇÃO 6: PLANEJAMENTO DE TESTES
  // ==========================================
  children.push(
    createHeading1('6. PLANEJAMENTO DE TESTES AUTOMATIZADOS', true),
    createHeading2('6.1. Pirâmide de Testes e Estratégia de Homologação'),
    createParagraph(
      'Para garantir confiabilidade inabalável em cálculos biomédicos e segurança relacional, a estratégia de Garantia da Qualidade (QA) adota a clássica Pirâmide de Testes de Mike Cohn:'
    ),
    createBullet('Camada de Base — Testes Unitários de Domínio: Testam algoritmos puros em isolamento matemático estrito (Mifflin-St Jeor, proporção da TACO, checagem de alergênicos). Executam em menos de 10 milissegundos sem depender de banco.', '1.'),
    createBullet('Camada Intermediária — Testes de Integração com Banco Relacional: Cada suíte instancia sua própria conexão SQLite isolada em memória (:memory:), valida transações atômicas, chaves estrangeiras com CASCADE e constraints CHECK.', '2.'),
    createBullet('Camada de Topo — Testes de Segurança e IDOR: Simulam múltiplos usuários simultâneos (Usuário A e Usuário B) e validam bloqueios HTTP 401/403 contra invasão de planos e dados alheios.', '3.'),

    createHeading2('6.2. Mapeamento das 12 Suítes de Teste (61 Testes Automatizados)'),
    makeTable(
      ['Suíte de Teste (*.spec.ts)', 'Qtd. Testes', 'Camada Testada', 'Exemplos de Casos Cobertos'],
      [
        ['nutrition-calculator.service.spec.ts', '8 testes', 'Domínio Puro', 'TEST-NUTRI-001 a 008: TMB masculina e feminina, coeficientes TDEE, déficit -500 kcal, proporção TACO.'],
        ['database.service.spec.ts', '5 testes', 'Persistência / SQLite', 'TEST-DB-001 a 005: 17 tabelas, PRAGMA foreign_keys=ON, carga das 744 sementes TACO, integridade referencial.'],
        ['auth.service.spec.ts', '6 testes', 'Aplicação / Segurança', 'TEST-AUTH-001 a 006: Bcrypt salt=10, e-mail duplicado 409, login 401, emissão JWT e perfil automático.'],
        ['diets.service.spec.ts', '9 testes', 'Aplicação / Domínio', 'TEST-DIET-001 a 010: Recálculo em cascata, porção negativa, solver numérico estrito (≤5% P/kcal, ≤8% C/G).'],
        ['workouts.service.spec.ts', '12 testes', 'Aplicação / Domínio', 'TEST-WORK-001 a 007 / TEST-LOG-001 a 002: Catálogo em PT-BR, 3 sugestões (A/B/C), imutabilidade histórica (RN24).'],
        ['profile.service.spec.ts', '4 testes', 'Aplicação', 'TEST-PROF-001 a 004: Atualização de peso, histórico temporal e recálculo imediato de TMB.'],
        ['foods.service.spec.ts', '6 testes', 'Aplicação', 'TEST-FOOD-001 a 006: Busca sem acento, taxonomia em 2 níveis, cálculo proporcional.'],
        ['dashboard.service.spec.ts', '3 testes', 'Aplicação / Agregação', 'TEST-DASH-001 a 003: Agregação em chamada única de alta performance, aviso médico mandatório (RN27).'],
        ['professionals.service.spec.ts', '3 testes', 'Aplicação / RBAC', 'TEST-PROF-001 a 003: Validação de CRN/CREF, perfil público e moderação.'],
        ['admin.service.spec.ts', '3 testes', 'Segurança / RBAC', 'TEST-ADMIN-001 a 003: Bloqueio de não-administradores, métricas globais e auditoria.'],
        ['messages.service.spec.ts', '2 testes', 'Aplicação', 'TEST-MSG-001 a 002: Envio de mensagem segura entre cliente e profissional.'],
        ['TOTAL CONSOLIDADO', '61 testes (12 arquivos)', 'Cobertura Global > 93%', '100% DE SUCESSO APROVADO EM ~12.1 SEGUNDOS (VITEST)']
      ],
      [30, 14, 24, 32]
    )
  );

  // ==========================================
  // SEÇÃO 7: ESTRATÉGIA DE INTEGRAÇÃO
  // ==========================================
  children.push(
    createHeading1('7. ESTRATÉGIA DE INTEGRAÇÃO E DEPLOY EM 1 CLIQUE', true),
    createHeading2('7.1. Modelo de Integração Contínua (CI) e Contratos de API'),
    createParagraph(
      'A integração entre a interface gráfica do usuário (Frontend React 19) e o servidor de regras de negócio (Backend NestJS) é regida por Contratos de Dados Estritos baseados na especificação OpenAPI / RESTful. O cliente HTTP Axios opera com interceptores automáticos de autenticação que injetam o Bearer Token JWT e capturam respostas de erro com tratamento resiliente.'
    ),
    createBullet('Contratos Tipados de Entrada e Saída: DTOs no backend sincronizados com interfaces TypeScript no frontend (web/src/types/index.ts).', '•'),
    createBullet('Pipeline de Verificação Local: Antes de cada commit, o ambiente executa verificação estática de tipos (tsc -b) e a suíte completa de 61 testes automatizados (vitest run).', '•'),
    createBullet('Gestão de Versionamento Semântico: Repositório com histórico limpo, commits semânticos (feat, fix, chore, docs) e proteção contra rollbacks cegos.', '•'),

    createHeading2('7.2. Automação de Inicialização e Deploy em 1 Clique'),
    createParagraph(
      'Para assegurar a máxima portabilidade e facilitar a avaliação acadêmica sem atritos de configuração de ambiente, o NutriPlan v2 disponibiliza scripts de orquestração automatizados:'
    ),
    createBullet('iniciar.bat (Orquestrador Universal em 1 Clique): Script batch na raiz do projeto que inicia de forma concorrente a API NestJS na porta 3000 e o Frontend Web na porta 5173, efetuando a semente inicial do banco SQLite caso esteja vazio.', '•'),
    createBullet('iniciar-api.bat: Inicializa exclusivamente o backend para depuração de endpoints ou execução de testes.', '•'),
    createBullet('iniciar-web.bat: Inicializa exclusivamente a aplicação cliente React.', '•'),
    createBullet('Sementes Versionadas no Git: Os arquivos de dados essenciais (foods.json com 744 itens e exercises.json com 128 itens) estão protegidos no repositório com regras explícitas no .gitignore, garantindo que qualquer clone limpo funcione imediatamente.', '•')
  );

  return children;
}

module.exports = { getFase3Body };
