/**
 * Construtor do Conteúdo da Fase 5: Implantação e Encerramento
 * Autores: Gustavo Meneses Ruegenberg Rodrigues e Fabiana Tiemi Watanabe
 * FATEC Campinas - Laboratório de Engenharia de Software
 */

function getFase5Body(common) {
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
  // SEÇÃO 1: PLANO DE IMPLANTAÇÃO
  // ==========================================
  children.push(
    createHeading1('1. PLANO DE IMPLANTAÇÃO E TRANSIÇÃO OPERACIONAL', true),
    createHeading2('1.1. Objetivo e Escopo da Implantação'),
    createParagraph(
      'O Plano de Implantação do NutriPlan v2 estabelece a metodologia, os critérios técnicos, a infraestrutura necessária e os procedimentos de validação para colocar o sistema em pleno estado de disponibilidade operacional, tanto em ambiente local de homologação/avaliação docente da FATEC Campinas quanto em ambiente de produção em nuvem ou servidor institucional.'
    ),

    createHeading2('1.2. Estratégia de Implantação Adotada'),
    createParagraph(
      'Para a transição da versão legada para o NutriPlan v2, adotou-se a estratégia de Implantação em Piloto Controlado com Transição Direta (Cutover), justificada pelos seguintes fatores de engenharia:'
    ),
    createBullet('Eliminação de Conflitos de Estado: A versão inicial possuía acoplamento de regras no frontend e ausência de transações atômicas de banco. Uma operação paralela geraria inconsistências bromatológicas na base de dados.', 'a)'),
    createBullet('Preservação Integral de Histórico: Todo o repositório foi versionado mantendo o histórico de branches, garantindo rastreabilidade sem a necessidade de migrações parciais arriscadas.', 'b)'),
    createBullet('Sanidade de Sementes Bromatológicas: A implantação do NutriPlan v2 executa o auto-provisionamento de 17 tabelas em 3FN e sementeia 744 alimentos da TACO e 128 exercícios de forma idempotente em menos de 8 segundos.', 'c)'),

    createHeading2('1.3. Requisitos de Hardware, Software e Rede'),
    makeTable(
      ['Recurso', 'Requisito Mínimo (Homologação)', 'Requisito Recomendado (Produção)', 'Justificativa Técnica'],
      [
        ['Processador (CPU)', 'Dual-Core (x86_64 ou ARM64), 2.0 GHz.', 'Quad-Core (x86_64 ou ARM64), 2.5 GHz+.', 'Execução concorrente do NestJS e compilação rápida de assets Vite.'],
        ['Memória RAM', '4 GB de memória RAM.', '8 GB ou 16 GB de memória RAM.', 'Alocação do runtime Node.js 24, cache de 744 alimentos TACO e buffer de banco.'],
        ['Armazenamento', '1 GB de espaço livre em disco.', '5 GB em SSD NVMe.', 'Dependências node_modules, arquivo nutriplan.sqlite e logs de auditoria.'],
        ['Sistema Operacional', 'Windows 10/11, Ubuntu 22.04 LTS, macOS 13+.', 'Linux Ubuntu Server 24.04 LTS / Debian 12.', 'Compatibilidade universal do Node 24 native SQLite e shell scripts.'],
        ['Ambiente de Execução', 'Node.js >= 22.0.0 (LTS 24 recomendado), npm 10+.', 'Node.js 24.20.0 LTS, npm 11.19.0.', 'Suporte nativo ao módulo node:sqlite sem dependências compiladas em C.'],
        ['Rede e Portas', 'Porta 3000 (Backend API) e 5173 (Frontend Web).', 'Porta 80 / 443 (Reverse Proxy Nginx / Traefik com SSL).', 'Comunicação RESTful via HTTP/HTTPS e WebSocket para tempo real.']
      ],
      [18, 25, 25, 32]
    ),

    createHeading2('1.4. Topologia de Implantação e Empacotamento'),
    createParagraph(
      'A topologia do NutriPlan v2 é estruturada como um Monorepo Desacoplado, onde o Frontend (Single Page Application em React 19) e o Backend (API RESTful em NestJS 12) comunicam-se exclusivamente via protocolo HTTP com autenticação Bearer JWT (RFC 7519):'
    ),
    createBullet('Camada de Apresentação (Frontend Web): Servida localmente pelo Vite Dev Server (porta 5173) ou empacotada em arquivos estáticos otimizados (HTML, CSS minificado, JS em chunks) através do comando npm run build, prontos para entrega via Nginx ou Cloudflare CDN.', '•'),
    createBullet('Camada de Aplicação (Backend API): Processo autônomo NestJS na porta 3000, modularizado em controladores, serviços de domínio e provedores de banco.', '•'),
    createBullet('Camada de Persistência (SQLite 3FN): Banco relacional embutido de altíssima performance, com PRAGMA journal_mode = WAL e PRAGMA foreign_keys = ON, sem necessidade de daemon externo de banco como MySQL ou PostgreSQL.', '•'),

    createHeading2('1.5. Procedimentos Pré-Implantação (Pre-Flight Checks)'),
    createParagraph(
      'Antes da inicialização formal do sistema, os seguintes passos mandatórios de verificação prévia devem ser efetuados:'
    ),
    createBullet('1. Validação de Variáveis de Ambiente: Verificar a existência e preenchimento dos arquivos api/.env e web/.env com chaves seguras e URLs de porta corretas.', '•'),
    createBullet('2. Integridade dos Arquivos de Semente: Confirmar a presença de api/local-cache/foods.json (744 alimentos TACO) e api/local-cache/exercises.json (128 exercícios).', '•'),
    createBullet('3. Execução da Suíte de Testes de Regressão: Rodar npm test no backend para garantir 100% de aprovação nos 61 testes automatizados antes de liberar o ambiente.', '•'),

    createHeading2('1.6. Procedimentos de Execução da Implantação (Deploy Passo a Passo)'),
    createCallout(
      'PROCEDIMENTO DE IMPLANTAÇÃO EM 1 CLIQUE NO WINDOWS (AVALIAÇÃO FATEC)',
      '1. Navegar até a raiz C:\\Users\\Gustavo\\Projetos\\nutriplan-v2\n2. Executar com duplo clique o arquivo iniciar.bat\n3. O script detecta automaticamente se as dependências existem, inicializa o backend na porta 3000 e o frontend na porta 5173 em janelas de terminal dedicadas.\n4. Acessar no navegador: http://localhost:5173'
    ),
    createParagraph(
      'Para servidores Linux ou ambientes de produção em contêineres, o procedimento equivalente por terminal é executado da seguinte forma:'
    ),
    createBullet('Passo 1 (Clone e Dependências): git clone <repo> && cd nutriplan-v2 && cd api && npm install && cd ../web && npm install', '•'),
    createBullet('Passo 2 (Compilação do Frontend): cd web && npm run build (gera a pasta dist/ otimizada)', '•'),
    createBullet('Passo 3 (Inicialização da API): cd ../api && npm run start:prod (inicializa a API NestJS com sementeira automática)', '•'),

    createHeading2('1.7. Procedimentos Pós-Implantação e Testes de Fumaça (Smoke Tests)'),
    createParagraph(
      'Imediatamente após a subida dos serviços, o operador de implantação deve validar a lista de verificação de sanidade operacional:'
    ),
    makeTable(
      ['Item de Verificação', 'Comando / Rota Testada', 'Resultado Esperado', 'Status de Homologação'],
      [
        ['Healthcheck da API', 'GET http://localhost:3000/api/foods/taco?limit=1', 'HTTP 200 OK com payload JSON de alimento TACO.', 'APROVADO'],
        ['Acesso à Interface Web', 'GET http://localhost:5173/', 'HTTP 200 OK, renderização da tela de Login limpa e sem erros de console.', 'APROVADO'],
        ['Autenticação e Sessão', 'POST http://localhost:3000/api/auth/login', 'HTTP 200 OK com emissão de token Bearer JWT e redirecionamento.', 'APROVADO'],
        ['Carga das 17 Tabelas', 'SELECT count(*) FROM sqlite_master;', 'Retorno exato de 17 tabelas ativas em 3FN no SQLite.', 'APROVADO'],
        ['Contagem TACO', 'SELECT count(*) FROM taco_foods;', 'Exatamente 744 alimentos cadastrados e indexados.', 'APROVADO'],
        ['Contagem de Exercícios', 'SELECT count(*) FROM exercises;', 'Exatamente 128 exercícios com biomecânica oficial.', 'APROVADO']
      ],
      [22, 35, 30, 13]
    ),

    createHeading2('1.8. Plano de Contingência, Backup e Rollback'),
    createParagraph(
      'Caso ocorra qualquer falha imprevista durante a implantação (queda de energia, corrupção de sistema operacional hospedeiro ou falha crítica de rede):'
    ),
    createBullet('Backup a Quente do Banco: O SQLite armazena todos os dados no arquivo api/nutriplan.sqlite. Uma rotina de backup consiste na cópia atômica deste arquivo para api/backups/nutriplan_YYYYMMDD_HHMM.sqlite.', '•'),
    createBullet('Procedimento de Fallback: Em caso de falha de inicialização, basta encerrar os processos Node nas portas 3000 e 5173, restaurar o snapshot da base de dados e relançar o script iniciar.bat.', '•'),
    createBullet('Rollback Zero de Código: Devido à suíte hermética de 61 testes passando e conformidade com o princípio de "Não Efetuar Rollback", o código em si não sofre regressão.', '•'),

    createHeading2('1.9. Matriz RACI de Responsabilidades na Implantação'),
    makeTable(
      ['Atividade de Implantação', 'Gustavo Meneses', 'Fabiana Tiemi', 'Professor / Avaliador'],
      [
        ['Preparação do Ambiente e Node 24', 'Responsável (R)', 'Aprovadora (A)', 'Informado (I)'],
        ['Execução dos Testes Automatizados', 'Responsável (R)', 'Consultada (C)', 'Informado (I)'],
        ['Deploy Local e Inicialização (iniciar.bat)', 'Responsável (R)', 'Responsável (R)', 'Aprovador (A)'],
        ['Validação dos Smoke Tests e TACO', 'Consultado (C)', 'Responsável (R)', 'Informado (I)'],
        ['Auditoria Final de Segurança e Logs', 'Responsável (R)', 'Aprovadora (A)', 'Informado (I)'],
        ['Homologação Final da Disciplina', 'Consultado (C)', 'Consultada (C)', 'Aprovador (A)']
      ],
      [35, 22, 22, 21]
    )
  );

  // ==========================================
  // SEÇÃO 2: MANUAL DO USUÁRIO FINAL
  // ==========================================
  children.push(
    createHeading1('2. MANUAL DO USUÁRIO FINAL', true),
    createHeading2('2.1. Visão Geral do Sistema e Primeiro Acesso'),
    createParagraph(
      'O NutriPlan v2 foi concebido para proporcionar uma experiência fluida, intuitiva e baseada em evidências científicas para planejamento de dietas e treinamentos físicos. O sistema é totalmente responsivo, funcionando perfeitamente em computadores desktop, notebooks, tablets e smartphones.'
    ),

    createHeading2('2.2. Cadastro de Conta e Login Seguro'),
    createParagraph(
      'Para acessar o NutriPlan v2 pela primeira vez, siga os passos abaixo:'
    ),
    createBullet('1. Acesse o endereço da aplicação no navegador: http://localhost:5173.', '•'),
    createBullet('2. Na tela de login, clique no link "Não tem uma conta? Cadastre-se".', '•'),
    createBullet('3. Preencha seu Nome Completo, E-mail corporativo ou pessoal válido e uma Senha com no mínimo 6 caracteres.', '•'),
    createBullet('4. Clique no botão "Criar Conta". O sistema registra seu usuário com hash criptográfico Bcrypt e efetua o login automático, redirecionando-o para o Painel Principal.', '•'),
    createBullet('5. Em acessos futuros, basta informar seu e-mail e senha cadastrados e clicar em "Entrar no Sistema".', '•'),

    createHeading2('2.3. Configurando seu Perfil Antropométrico e Metas Nutricionais'),
    createParagraph(
      'O coração do motor metabólico do NutriPlan v2 reside nos dados antropométricos do seu perfil. Para configurá-los:'
    ),
    createBullet('1. Clique na opção "Perfil" no menu superior (ou na barra de navegação inferior em celulares).', '•'),
    createBullet('2. Preencha sua Idade (anos), Sexo Biológico (Masculino ou Feminino), Peso Atual (em kg) e Altura (em centímetros).', '•'),
    createBullet('3. Selecione seu Nível de Atividade Física (Sedentário, Leve, Moderado, Muito Ativo ou Extremamente Ativo).', '•'),
    createBullet('4. Escolha seu Objetivo: Emagrecimento (com déficit controlado), Manutenção de Peso ou Ganho de Massa Muscular (superávit hipertrófico).', '•'),
    createBullet('5. Marque eventuais Restrições Alimentares (Intolerância à Lactose, Doença Celíaca / Glúten, Vegetariano, Vegano).', '•'),
    createBullet('6. Clique em "Salvar Alterações". O sistema calcula instantaneamente sua TMB (Mifflin-St Jeor), seu TDEE e as metas diárias em gramas de Proteínas, Carboidratos e Gorduras, respeitando os pisos de segurança biológica (1.200 kcal para mulheres e 1.500 kcal para homens).', '•'),

    createHeading2('2.4. Navegando pelo Painel Principal (Dashboard)'),
    createParagraph(
      'O Dashboard reúne as métricas vitais da sua rotina de saúde:'
    ),
    createBullet('Cards de Resumo Biométrico: Exibem seu peso atual, TMB calculada, gasto diário total (TDEE) e meta calórica diária.', '•'),
    createBullet('Balanço Nutricional em Tempo Real: Compara graficamente o que você planejou na sua dieta ativa versus a meta calculada do perfil, mostrando se faltam calorias ou nutrientes.', '•'),
    createBullet('Alertas Inteligentes de Alérgenos: Identifica instantaneamente se algum alimento da dieta conflita com suas restrições declaradas.', '•'),
    createBullet('Aviso Ético de Saúde (Regra RN27): Mensagem mandatória lembrando que o software é um suporte ferramental e não substitui a consulta clínica presencial com nutricionistas e médicos.', '•'),

    createHeading2('2.5. Montando sua Dieta Personalizada'),
    createParagraph(
      'O NutriPlan v2 oferece duas formas complementares para estruturação do plano alimentar:'
    ),
    createHeading3('A) Montagem Manual Refeição por Refeição:'),
    createBullet('1. Acesse o menu "Dieta" e clique em "+ Nova Refeição" (ex.: Café da Manhã, Almoço, Lanche, Jantar).', '•'),
    createBullet('2. Na refeição criada, clique em "+ Adicionar Alimento" para abrir o catálogo da Tabela TACO.', '•'),
    createBullet('3. Digite o nome do alimento no campo de busca (ex.: Arroz, Feijão, Frango, Ovo, Banana). O sistema realiza busca fonética e sem acento.', '•'),
    createBullet('4. Informe a porção consumida em gramas (ex.: 150g). O sistema calcula instantaneamente os macronutrientes proporcionais e adiciona o item à refeição.', '•'),
    createBullet('5. Você pode editar a quantidade em gramas ou remover itens a qualquer momento; os totais da refeição e do dia são recalculados em cascata.', '•'),

    createHeading3('B) Gerador de Dieta Assistido (Montador em 8 Etapas):'),
    createBullet('1. Na tela de Dieta, clique em "Montar Nova Dieta (8 Etapas)".', '•'),
    createBullet('2. O assistente inteligente consulta as metas exatas do seu perfil e executa o solver numérico de restrições.', '•'),
    createBullet('3. O algoritmo seleciona alimentos balanceados da base TACO distribuídos em 3 a 6 refeições, cumprindo as tolerâncias de precisão (≤5% para calorias e proteínas, ≤8% para carboidratos e gorduras).', '•'),
    createBullet('4. A dieta gerada é carregada como o plano ativo, permitindo personalizações pontuais pelo usuário.', '•'),

    createHeading2('2.6. Consulta à Tabela TACO e Simulador Proporcional'),
    createParagraph(
      'Na aba "Alimentos (TACO)", o usuário tem acesso irrestrito aos 744 alimentos catalogados pelo NEPA/UNICAMP. É possível filtrar por categorias (Cereais, Carnes, Frutas, Laticínios) ou por propriedades (Rico em Proteína, Baixo Carboidrato, Rico em Fibras). O Simulador de Porções permite digitar qualquer peso em gramas e visualizar imediatamente a decomposição de energia, macronutrientes e micronutrientes.'
    ),

    createHeading2('2.7. Montador de Treino Interativo por Grupamento Muscular'),
    createParagraph(
      'A montagem de treinos do NutriPlan v2 foi completamente aprimorada para oferecer controle muscular preciso:'
    ),
    createBullet('1. Acesse a aba "Treino" e clique em "Montar Treino por Grupamento".', '•'),
    createBullet('2. Escolha os grupos musculares desejados através dos seletores múltiplos: Peito, Costas, Ombros, Bíceps, Tríceps, Abdômen, Quadríceps, Posterior de Coxa, Glúteos, Panturrilhas ou Corpo Inteiro.', '•'),
    createBullet('3. O sistema gera 3 opções de treino estruturadas (Treino A, Treino B e Treino C), cada uma com seleção biomecânica ideal entre os 128 exercícios oficiais.', '•'),
    createBullet('4. Todos os exercícios são exibidos com nomenclatura amigável em português (PT-BR), grupos musculares alvo e instruções biomecânicas.', '•'),
    createBullet('5. Você pode ajustar o número de séries, repetições, carga sugerida em kg e tempo de descanso entre séries em segundos.', '•'),

    createHeading2('2.8. Cronômetro em Tempo Real e Condução da Sessão de Treino'),
    createParagraph(
      'Durante a realização dos exercícios na academia ou em casa, o NutriPlan v2 atua como assistente ativo:'
    ),
    createBullet('Timer de Execução: Monitora a cadência e o tempo sob tensão do exercício.', '•'),
    createBullet('Cronômetro de Descanso Interativo: Ao concluir uma série, acione o cronômetro regressivo com avisos visuais para manter a densidade do treino e evitar intervalos excessivos.', '•'),

    createHeading2('2.9. Registro de Treino (Workout Log) e Histórico Imutável (RN24)'),
    createParagraph(
      'Ao finalizar sua sessão de treinamento, clique no botão "Registrar Execução". Informe as cargas reais levantadas e a duração da sessão em minutos. Os dados são gravados permanentemente no Histórico de Treinos. Em estrita conformidade com a Regra de Negócio RN24, mesmo que você reconfigure, renomeie ou exclua sua rotina de treinos no futuro, seus registros históricos de esforço físico permanecem eternamente preservados.'
    ),

    createHeading2('2.10. Acompanhamento de Evolução Física e Histórico de Pesagens'),
    createParagraph(
      'Na aba "Evolução", o usuário pode registrar novas pesagens periódicas, acompanhando a curva de evolução corporal ao longo das semanas, a variação de IMC e a relação entre o saldo calórico consumido e o peso corporal obtido.'
    ),

    createHeading2('2.11. Portal de Especialistas e Mensageria'),
    createParagraph(
      'O sistema inclui um canal de suporte e credenciamento de profissionais (Personal Trainers com CREF e Nutricionistas com CRN). Na tela de treinos, o botão "Falar com Personal" permite que o aluno tire dúvidas diretamente com o treinador responsável ou solicite consultoria especializada caso ainda não possua um treinador vinculado.'
    )
  );

  // ==========================================
  // SEÇÃO 3: MANUAL TÉCNICO DE INFRAESTRUTURA
  // ==========================================
  children.push(
    createHeading1('3. MANUAL TÉCNICO DE INFRAESTRUTURA E MANUTENÇÃO', true),
    createHeading2('3.1. Arquitetura do Sistema e Padrões de Projeto'),
    createParagraph(
      'O NutriPlan v2 foi construído adotando os princípios de Clean Architecture, Clean MVC e Domain-Driven Design (DDD). O sistema mantém desacoplamento rigoroso entre as regras de negócio, a camada HTTP e a camada de persistência:'
    ),
    createBullet('Backend (NestJS 12 + TypeScript): Estruturado em módulos coesos (AuthModule, NutritionModule, ProfileModule, FoodsModule, DietsModule, WorkoutsModule, DashboardModule, AdminModule). Todos os serviços de domínio utilizam injeção de dependência nativa do NestJS.', '•'),
    createBullet('Frontend (React 19 + TypeScript + Vite + Tailwind CSS v4): Organizado em componentes atômicos reutilizáveis, gerenciamento de estado via React Context API (AuthContext), chamadas assíncronas via Axios com interceptadores de token JWT e roteamento via react-router-dom v7.', '•'),
    createBullet('Banco de Dados Relacional (SQLite em 3FN): Implementado com o driver nativo node:sqlite do Node 24 LTS, eliminando dependências externas como SQLite3 compilado em C/node-gyp e garantindo máxima portabilidade entre sistemas operacionais.', '•'),

    createHeading2('3.2. Topologia Detalhada do Código-Fonte'),
    createCallout(
      'ESTRUTURA DE DIRETÓRIOS DO MONOREPO NUTRIPLAN V2',
      'nutriplan-v2/\n├── api/                           # Backend RESTful NestJS 12\n│   ├── local-cache/               # Sementes oficiais (foods.json, exercises.json)\n│   ├── src/\n│   │   ├── database/              # Conexão SQLite nativa, DDL 17 tabelas e Seeder\n│   │   ├── modules/               # Módulos de domínio (auth, nutrition, diets, workouts...)\n│   │   ├── app.module.ts          # Módulo raiz\n│   │   └── main.ts                # Bootstrap da API na porta 3000\n│   ├── test/                      # Suíte de testes automatizados Vitest\n│   ├── package.json\n│   └── vitest.config.ts\n├── web/                           # Frontend React 19 + Vite\n│   ├── src/\n│   │   ├── api/                   # Cliente Axios configurado com Bearer interceptor\n│   │   ├── components/            # Componentes reutilizáveis (Navbar, BottomNav...)\n│   │   ├── contexts/              # AuthContext com persistência em localStorage\n│   │   ├── pages/                 # Páginas (Dashboard, DietPlanner, WorkoutPlanner...)\n│   │   ├── types/                 # Definições de tipos TypeScript compartilhadas\n│   │   └── App.tsx                # Roteador SPA\n│   └── vite.config.ts\n├── docs/                          # Documentos formais das 5 Fases (.docx)\n├── iniciar.bat                    # Script de inicialização simultânea (Windows)\n└── package.json'
    ),

    createHeading2('3.3. Dicionário de Configuração e Variáveis de Ambiente'),
    makeTable(
      ['Arquivo', 'Variável', 'Valor Padrão Homologação', 'Descrição Técnica e Finalidade'],
      [
        ['api/.env', 'PORT', '3000', 'Porta TCP de escuta do servidor HTTP NestJS.'],
        ['api/.env', 'DATABASE_URL', './nutriplan.sqlite', 'Caminho relativo para o arquivo de banco relacional SQLite.'],
        ['api/.env', 'JWT_SECRET', 'super_secret_jwt_key_academic', 'Chave criptográfica HMAC-SHA256 para assinatura de tokens Bearer.'],
        ['api/.env', 'JWT_EXPIRES_IN', '7d', 'Tempo de expiração do token de sessão do usuário (7 dias).'],
        ['api/.env', 'CORS_ORIGIN', 'http://localhost:5173', 'Origem autorizada pelo middleware CORS para requisições web.'],
        ['web/.env', 'VITE_API_URL', 'http://localhost:3000', 'URL base da API consumida pelo cliente Axios no frontend.']
      ],
      [18, 22, 28, 32]
    ),

    createHeading2('3.4. Modelo de Dados e Dicionário das 17 Tabelas Relacionais (3FN)'),
    createParagraph(
      'O esquema de dados relacional foi normalizado em Terceira Forma Normal (3FN), garantindo integridade referencial com chaves primárias UUID e integridade semântica:'
    ),
    createBullet('1. users: Usuários da aplicação, e-mails únicos, hashes Bcrypt, papéis (USER, ADMIN, NUTRITIONIST, PERSONAL).', '•'),
    createBullet('2. user_profiles: Dados antropométricos (peso, altura, idade, sexo, fator de atividade, objetivo e metas calculadas).', '•'),
    createBullet('3. weight_history: Registro temporal de pesagens com data e notas para acompanhamento da evolução corporal.', '•'),
    createBullet('4. dietary_restrictions: Restrições alimentares do usuário (lactose, glúten, frutos do mar, vegetariano, vegano).', '•'),
    createBullet('5. taco_foods: Catálogo de 744 alimentos oficiais da Tabela TACO (calorias, macronutrientes e micronutrientes por 100g).', '•'),
    createBullet('6. taco_categories: Categorias bromatológicas de classificação dos alimentos da TACO.', '•'),
    createBullet('7. diet_plans: Planos de dieta do usuário com nome, descrição, metas de calorias/macros e flag de dieta ativa.', '•'),
    createBullet('8. meals: Refeições pertencentes a um plano de dieta (Café, Almoço, Lanche, Jantar, Ceia) ordenadas cronologicamente.', '•'),
    createBullet('9. meal_items: Alimentos associados a cada refeição, quantidade em gramas e macronutrientes calculados em cascata.', '•'),
    createBullet('10. exercises: Catálogo oficial de 128 exercícios com grupo muscular principal, sinergistas, equipamento e biomecânica.', '•'),
    createBullet('11. workout_plans: Fichas de treino do usuário com nome, divisão (A, B, C), objetivo e tempo estimado.', '•'),
    createBullet('12. workout_exercises: Exercícios prescritos na ficha de treino, com séries, repetições, carga sugerida e descanso.', '•'),
    createBullet('13. workout_logs: Registros históricos de execução real de treino, com data, duração e esforço percebido (RN24).', '•'),
    createBullet('14. workout_log_items: Detalhamento de cada exercício realizado na sessão de treino histórica.', '•'),
    createBullet('15. professional_profiles: Perfis de profissionais credenciados com número de registro no conselho (CRN ou CREF).', '•'),
    createBullet('16. professional_clients: Vínculo de acompanhamento entre alunos e profissionais credenciados.', '•'),
    createBullet('17. messages: Mensagens seguras trocadas entre alunos e seus treinadores/nutricionistas responsáveis.', '•'),

    createHeading2('3.5. Mecanismos de Segurança e Proteção Web'),
    createBullet('Armazenamento de Senhas: As senhas dos usuários jamais trafegam ou são persistidas em texto claro; são processadas com algoritmo Bcrypt com fator de custo salt=10.', '•'),
    createBullet('Autenticação e Autorização Stateless: Emissão de tokens JSON Web Token (RFC 7519) contendo sub (ID do usuário), e-mail e papel (role), validados por JwtAuthGuard e RolesGuard.', '•'),
    createBullet('Imunidade contra Injeção de SQL (SQL Injection): 100% dos comandos de leitura e escrita utilizam Prepared Statements nativos parametrizados com marcadores ? (this.db.prepare), impedindo qualquer concatenação insegura de dados.', '•'),
    createBullet('Proteção contra IDOR (Insecure Direct Object References): Todas as consultas que manipulam dietas, treinos e perfis filtram obrigatoriamente por user_id = ? derivado do token criptográfico autenticado.', '•'),
    createBullet('Higienização de Dependências: Auditoria periódica via npm audit zerada com 0 vulnerabilidades no backend e no frontend.', '•'),

    createHeading2('3.6. Rotinas de Manutenção Preventiva e Backup'),
    createParagraph(
      'Para garantir a continuidade operacional e a proteção dos dados dos usuários:'
    ),
    createBullet('Backup Diário da Base SQLite: O arquivo api/nutriplan.sqlite deve ser copiado periodicamente para um diretório de backup ou armazenamento em nuvem via script cron ou agendador de tarefas.', '•'),
    createBullet('Compactação e Otimização do Banco: Execução periódica do comando PRAGMA optimize; e VACUUM; para reorganizar os índices e recuperar espaço em disco.', '•'),
    createBullet('Monitoramento de Logs: O NestJS emite logs estruturados com carimbo de data/hora no console, registrando erros de rota, falhas de autenticação e latência de consultas.', '•')
  );

  // ==========================================
  // SEÇÃO 4: RELATÓRIO FINAL DE ENCERRAMENTO
  // ==========================================
  children.push(
    createHeading1('4. RELATÓRIO FINAL DE ENCERRAMENTO DO PROJETO', true),
    createHeading2('4.1. Análise Crítica do Processo de Desenvolvimento Adotado'),
    createParagraph(
      'Ao longo das 5 fases de Engenharia de Software da disciplina de Laboratório de Engenharia de Software da FATEC Campinas, a equipe composta por Gustavo Meneses Ruegenberg Rodrigues e Fabiana Tiemi Watanabe adotou um modelo de processo ágil/iterativo híbrido, combinando a flexibilidade do Scrum/Kanban com a disciplina formal da Engenharia de Requisitos e da Clean Architecture.'
    ),
    createParagraph(
      'A decisão de estruturar o desenvolvimento em iterações curtas (Sprints de 2 semanas) com checkpoints bem definidos provou-se altamente eficaz. O maior mérito metodológico do projeto foi a aplicação irrestrita da regra de "Não Efetuar Rollback", que exigiu da equipe a identificação da causa raiz de cada problema técnico antes de qualquer modificação de código, prevenindo o desperdício de retrabalho e preservando o patrimônio funcional conquistado.'
    ),

    createHeading2('4.2. Dificuldades Técnicas e Organizacionais Encontradas'),
    createParagraph(
      'Durante o ciclo de desenvolvimento do NutriPlan v2, a equipe enfrentou e superou quatro grandes desafios de engenharia:'
    ),
    createBullet('1. Resolução Simultânea de Restrições no Solver de Dieta: O algoritmo inicial heurístico tentava selecionar alimentos de forma gulosa, gerando dietas com discrepâncias calóricas de até 15% em relação às metas do usuário. A solução exigiu a implementação de um solver numérico iterativo com passos de convergência e tolerâncias estritas (≤5% calorias/proteínas e ≤8% carboidratos/gorduras).', '•'),
    createBullet('2. Inconsistência Polimórfica de Nomenclatura nos Exercícios: A integração inicial com bases externas mesclava termos em inglês e português e retornava campos divergentes (name vs. exerciseName), resultando em cards em branco na interface. A equipe unificou o schema no SQLite e desenvolveu formatadores de apresentação em PT-BR.', '•'),
    createBullet('3. Desempacotamento Resiliente de Histórico e Exclusão em Cascata: No Histórico de Treinos, o retorno de payloads paginados causava falha visual ("logs.map is not a function"). Além disso, a deleção de uma rotina ativa apagava registros passados. Foi implementada integridade relacional ON DELETE SET NULL (RN24) e desempacotamento defensivo na camada React.', '•'),
    createBullet('4. Bloqueio de Sementes Bromatológicas pelo Controle de Versão: Regras genéricas no .gitignore ocultavam os arquivos de sementes da TACO e exercícios. A solução foi criar uma política de whitelist explícita, garantindo a inicialização autônoma em qualquer máquina clonada.', '•'),

    createHeading2('4.3. Melhorias e Inovações Implementadas no NutriPlan v2'),
    makeTable(
      ['Área de Inovação', 'Situação na Base Legada', 'Implementação no NutriPlan v2', 'Impacto na Qualidade'],
      [
        ['Motor Nutricional', 'Cálculos estáticos e divergência de macros.', 'Solver numérico iterativo estrito (≤5% cal/P, ≤8% C/G) com pisos biológicos.', 'Alta precisão científica e conformidade com diretrizes da OMS.'],
        ['Prescrição de Treinos', 'Treino genérico único sem escolha muscular.', 'Seleção por grupamento muscular, 3 sugestões (A, B, C) e 128 exercícios em PT-BR.', 'Personalização completa e autonomia para o praticante.'],
        ['Execução de Treino', 'Telas puramente estáticas sem auxílio em tempo real.', 'Cronômetro em tempo real de execução e descanso sonoro/visual interativo.', 'Melhoria expressiva na experiência do usuário durante o treino.'],
        ['Segurança e Higiene', 'Jargões técnicos (RN10-RN24) e 5 falhas no npm audit.', 'Interface 100% humanizada em português e 0 vulnerabilidades de segurança.', 'Conformidade com padrões de usabilidade e segurança web.'],
        ['Automação de Testes', 'Testes fragmentados ou inexistentes.', '61 testes automatizados (unitários, integração e funcionais) com 100% de sucesso.', 'Confiabilidade extrema contra regressões de software.']
      ],
      [18, 25, 32, 25]
    ),

    createHeading2('4.4. Lições Aprendidas pelo Grupo'),
    createParagraph(
      'O desenvolvimento do NutriPlan v2 proporcionou aos autores um aprendizado prático e profundo sobre a realidade do desenvolvimento profissional de software:'
    ),
    createBullet('Test-Driven Development (TDD) e Pirâmide de Testes: Compreendeu-se que escrever testes antes ou em paralelo às correções não é um custo adicional de tempo, mas a forma mais rápida e segura de garantir estabilidade e evitar retrabalho.', '•'),
    createBullet('Importância da Rastreabilidade Bidirecional: A existência de uma Matriz de Rastreabilidade conectando requisitos funcionais (RFs), regras de negócio (RNs) e IDs de testes permitiu diagnosticar com precisão cirúrgica a causa de cada falha reportada.', '•'),
    createBullet('Governança de Dados e Integridade Relacional: A escolha do SQLite normalizado em 3FN com chaves estrangeiras ativas protegeu a aplicação contra estados inválidos de dados órfãos, provando que a consistência do banco simplifica o código da aplicação.', '•'),
    createBullet('Sinergia e Colaboração em Equipe: A divisão clara de papéis e a comunicação constante entre Gustavo e Fabiana foram determinantes para o cumprimento de 100% dos prazos e entregáveis do projeto.', '•'),

    createHeading2('4.5. Avaliação de Conformidade com a Norma ISO/IEC 25010'),
    makeTable(
      ['Característica de Qualidade', 'Métrica / Critério Avaliado', 'Resultado no NutriPlan v2', 'Classificação'],
      [
        ['Adequação Funcional', 'Cumprimento dos 34 RFs e 27 Regras de Negócio.', '100% dos requisitos implementados e validados.', 'EXCELENTE'],
        ['Eficiência de Desempenho', 'Tempo de resposta de consultas TACO e cálculos de TMB.', '< 50ms para buscas e < 8s para inicialização completa.', 'EXCELENTE'],
        ['Compatibilidade', 'Execução em navegadores modernos (Chrome, Firefox, Edge, Safari).', 'Totalmente compatível e responsivo.', 'EXCELENTE'],
        ['Usabilidade', 'Navegabilidade em dispositivos móveis e clareza visual.', 'Interface intuitiva, sem jargões e com cores semânticas.', 'EXCELENTE'],
        ['Confiabilidade', 'Taxa de sucesso na suíte de testes automatizados.', '61 testes executados com 100% de aprovação (0 falhas).', 'EXCELENTE'],
        ['Segurança', 'Auditoria contra vulnerabilidades (SQLi, IDOR, npm audit).', 'Prepared Statements, Bearer JWT e 0 vulnerabilidades.', 'EXCELENTE'],
        ['Manutenibilidade', 'Arquitetura desacoplada e cobertura de código.', 'Clean MVC modular e cobertura de testes > 93%.', 'EXCELENTE'],
        ['Portabilidade', 'Execução multiplataforma (Windows, Linux, macOS).', 'Driver node:sqlite nativo e scripts de automação.', 'EXCELENTE']
      ],
      [22, 28, 35, 15]
    )
  );

  // ==========================================
  // SEÇÃO 5: CONCLUSÃO GERAL E TERMO DE ENCERRAMENTO
  // ==========================================
  children.push(
    createHeading1('5. CONCLUSÃO GERAL E TERMO DE ENCERRAMENTO DO PROJETO', true),
    createParagraph(
      'Com a entrega deste documento da Fase 5 — Implantação e Encerramento, o ciclo de vida do projeto acadêmico NutriPlan v2 é oficialmente concluído com pleno êxito na disciplina de Laboratório de Engenharia de Software do Curso Superior de Tecnologia em Análise e Desenvolvimento de Sistemas da FATEC Campinas.'
    ),
    createParagraph(
      'O sistema entrega uma solução completa, ética, cientificamente embasada e tecnicamente sofisticada para o planejamento integrado de nutrição e treinamento físico, consolidando o aprendizado prático de engenharia de requisitos, arquitetura de software, garantia de qualidade, implementação orientada a testes e gestão de configuração de software.'
    ),
    createCallout(
      'TERMO FORMAL DE HOMOLOGAÇÃO E ENCERRAMENTO',
      'Declaramos que o software NutriPlan v2 foi integralmente implementado, auditado, testado e documentado pelos discentes Gustavo Meneses Ruegenberg Rodrigues e Fabiana Tiemi Watanabe, encontrando-se apto para avaliação final pela banca docente da FATEC Campinas.\n\nCampinas - SP, Outubro de 2026.'
    )
  );

  return children;
}

module.exports = { getFase5Body };
