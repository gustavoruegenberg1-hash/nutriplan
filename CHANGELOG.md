# Registro de Mudanças (CHANGELOG) - NutriPlan v2

Todas as alterações notáveis, correções de bugs, melhorias arquiteturais e refatorações realizadas no projeto NutriPlan v2 são documentadas neste arquivo.

## [2026-10-06] - Correção dos Nomes de Exercícios e Tradução Completa para Português nas Sugestões de Treino

### Tipo
Correção de Bug / Localização PT-BR / UX

### Alterações Principais
1. **Exibição Correta dos Nomes dos Exercícios nas Sugestões**:
   - Correção no backend (`generateMultipleSuggestions` em `workouts.service.ts`), garantindo o envio tanto de `name` quanto de `exerciseName` para cada item sugerido.
   - Atualização do componente `WorkoutPlanner.tsx` para consumir com fallback seguro `{ex.name || ex.exerciseName || 'Exercício'}`, eliminando o título em branco nos cards de sugestão de treino.
2. **Tradução Completa de Grupamentos Musculares e Equipamentos**:
   - Mapeamento e envio do campo `muscleGroupName` em português pelo backend (`MUSCLE_PT_MAP`).
   - Aplicação consistente do formatador `formatFriendlyName` em todos os locais do frontend onde grupos musculares e equipamentos são apresentados (cards de sugestão, rotina ativa, modal de adição de exercícios e catálogo de exercícios).
   - Ampliação do dicionário `FRIENDLY_DICTIONARY` com equipamentos (`BARBELL: 'Barra'`, `MACHINE: 'Máquina'`, `CABLE: 'Cabo'`, etc.) e suporte a correspondência insensível a maiúsculas/minúsculas (`upperCase` e regex `gi`).
   - Eliminação de identificadores em inglês como `CHEST`, `TRICEPS`, `SHOULDERS` na interface do usuário.

## [2026-10-06] - Refatoração Completa: Montagem de Treino com Múltiplas Sugestões, Timer de Execução e Descanso em Tempo Real, Correção do Histórico e Limpeza de Termos Técnicos

### Tipo
Novas Funcionalidades / Correção Crítica de Interface / UX / Acessibilidade

### Alterações Principais
1. **Montagem de Treino por Grupo Muscular e Múltiplas Sugestões**:
   - Pergunta inicial destacada: *"Qual grupo muscular você deseja treinar?"* com 12 chips interativos multisseleção (Peito, Costas, Ombros, Bíceps, Tríceps, Abdômen, Quadríceps, Posterior de coxa, Glúteos, Panturrilhas, Antebraços, Corpo inteiro).
   - Geração de 3 rotinas completas e distintas (Treino A, Treino B, Treino C) com exercícios reais do banco de dados SQLite (`/workouts/generate-suggestions`).
   - Visualização em cards estilo sanfona com detalhes dos exercícios (séries, repetições, carga, descanso) e escolha explícita via botão `[ ESCOLHER ESTE TREINO ]` (`/workouts/apply-suggestion`), sem auto-seleção arbitrária da primeira opção.
   - Novo teste automatizado `TEST-WORK-007` adicionado à suíte de testes com 100% de sucesso.

2. **Cronômetro e Controle de Execução de Treino em Tempo Real**:
   - Cada exercício da rotina ativa possui rastreador de séries dedicado (ex: Série 1 de 4).
   - Cronômetro dinâmico em tempo real rodando no card ao clicar em `[ INICIAR ]` (`Tempo de Execução: MM:SS`).
   - Ao clicar em `[ FINALIZAR SÉRIE ]`, o tempo de execução para e o cronômetro de descanso inicia imediatamente (`Descanso: MM:SS`).
   - Botão para avançar para a próxima série (`[ Iniciar Série X ]`).
   - O card do exercício só muda de cor e recebe o badge `✓ Concluído` após todas as séries prescritas serem finalizadas.
   - Gerenciamento único e centralizado de intervalo via `useEffect`, impedindo timers duplicados ou ocultos.
   - Persistência contínua do estado da sessão no `localStorage` (`nutriplan_workout_session_{workoutId}`), sobrevivendo a recargas da página.

3. **Correção Definitiva da Página e Aba de Histórico de Treinos**:
   - Correção da causa raiz da tela em branco (`logs.map is not a function`), desempacotando de forma resiliente tanto arrays diretos quanto objetos paginados `{ items: [...], total }`.
   - Implementação dos 4 estados obrigatórios: Carregando, Histórico Encontrado, Histórico Vazio e Erro com botão `[ TENTAR NOVAMENTE ]`.
   - Remoção de códigos técnicos da interface do histórico.

4. **Remoção de Termos Técnicos e Códigos Internos (RN20-RN24)**:
   - Substituição do card `RN20–RN24 em vigor` pelo indicador intuitivo `Volume Total` (total de séries somadas da rotina).
   - Remoção de menções a `(RN20)` e `(RN24)` nos títulos, cabeçalhos, formulários de registro e feedbacks ao usuário.

5. **Apresentação Amigável de Nomes e Tradução na Dieta**:
   - Criação do utilitário `formatFriendlyName` que traduz termos em inglês (`high_protein`, `meal_plan`, `breakfast_option`, `LOSE_WEIGHT`) e remove *underscores* (`_`), substituindo-os por espaços e nomes amigáveis em português.
   - Localização no backend de nomes de dietas padrão geradas automaticamente (*"Sugestão NutriPlan — Emagrecimento/Hipertrofia/Manutenção"*).

6. **Botões Compactos de Ação (+) Touch-Friendly**:
   - Substituição de botões textuais repetitivos ("Adicionar" / "Selecionar") por botões compactos circulares/arredondados com símbolo `+` e feedback imediato `✓`.
   - Alvo tátil conforme diretrizes de acessibilidade ($\ge 40\times 40$px) com atributo `aria-label` descritivo para leitores de tela em adição de exercícios e alimentos.

### Arquivos Modificados
- `api/src/modules/workouts/dto/workout.dtos.ts`
- `api/src/modules/workouts/workouts.service.ts`
- `api/src/modules/workouts/workouts.controller.ts`
- `api/src/modules/workouts/workouts.service.spec.ts`
- `api/src/modules/diets/diets.service.ts`
- `web/src/utils/formatters.ts`
- `web/src/pages/WorkoutPlanner.tsx`
- `web/src/pages/WorkoutHistory.tsx`
- `web/src/pages/DietPlanner.tsx`
- `web/src/App.tsx`
- `TESTES.md`
- `CHANGELOG.md`

---



### Tipo
Melhoria de Usabilidade / Precisão Numérica / Refatoração Arquitetural / Mobile UX

### Alterações Principais
1. **Convergência Rigorosa de Macronutrientes na Dieta Automática**:
   - Substituição de porções fixas por solver numérico adaptativo em gradiente (`diets.service.ts`), calibrando gramaturas reais de alimentos básicos da TACO (arroz, feijão, frango, ovos, azeite, aveia).
   - Validação matemática pós-persistência no SQLite (`meal_foods` + `foods`), garantindo que o plano salvo cumpra tolerâncias estritas ($\le 5\%$ calorias/proteínas, $\le 8\%$ carboidratos/gorduras) em relação às metas do usuário.
   - Testes automatizados `TEST-DIET-009` e `TEST-DIET-010` verificando a convergência.

2. **Montador de Treino com Seleção Multimuscular e Adição Imediata**:
   - Modal reformulado em 2 etapas com a pergunta: *"Quais músculos você deseja trabalhar neste treino?"*.
   - Seleção múltipla interativa via chips (Peito, Costas, Ombros, Bíceps, Tríceps, Abdômen, Quadríceps, Posterior, Glúteos, Panturrilhas, Antebraços, Corpo inteiro).
   - Suporte a múltiplos grupamentos no backend via query parameter `muscleGroups` com normalização de termos em português (`PEITO` -> `CHEST`, etc.).
   - Fluxo de adição rápida imediata (`+ Adicionar` -> `✓ Adicionado` desabilitado instantaneamente), mantendo o modal aberto para seleções contínuas sem perder configurações anteriores.
   - Teste automatizado `TEST-EXER-002` implementado e aprovado.

3. **Seleção de Alimentos por Taxonomia em 2 Níveis e Paginação**:
   - Endpoint `/foods/taxonomy` no backend extraindo hierarquia real (Categoria -> Subcategoria) dinamicamente dos 744 alimentos da TACO.
   - Suporte a filtro por subcategoria no endpoint `/foods` e teste automatizado `TEST-FOOD-006`.
   - Frontend com seleção visual em dois níveis (Nível 1: Categoria, Nível 2: Subcategoria), busca textual combinada e paginação fluida (Página X de Y com anterior/próxima).

4. **Navegação do Perfil e Limpeza da Barra de Navegação**:
   - Remoção da aba fixa "Perfil" das barras de navegação superior (`Navbar`) e inferior (`BottomNav`) para todos os perfis.
   - Acesso ao perfil unificado diretamente pelo avatar/botão com a inicial do usuário no topo da tela, simplificando o menu principal para 3 abas essenciais no perfil usuário (Painel, Dieta, Treino).

5. **Responsividade Mobile e Botões com Safe-Area**:
   - Rodapés dos modais de adição de exercício e de adição de alimentos fixados com `sticky bottom-0 z-30` e espaçamento seguro (`pb-safe`), impedindo corte ou sobreposição pela barra móvel do navegador.

6. **Padronização da Nomenclatura em Português**:
   - Substituição de siglas e termos em inglês por correspondentes oficiais em português: GET (Gasto Energético Total), TMB (Taxa Metabólica Basal), IMC (Índice de Massa Corporal), Proteínas, Carboidratos e Gorduras.

### Arquivos Modificados
- `api/src/modules/diets/diets.service.ts`
- `api/src/modules/diets/diets.service.spec.ts`
- `api/src/modules/workouts/workouts.controller.ts`
- `api/src/modules/workouts/workouts.service.ts`
- `api/src/modules/workouts/workouts.service.spec.ts`
- `api/src/modules/foods/foods.controller.ts`
- `api/src/modules/foods/foods.service.ts`
- `api/src/modules/foods/foods.service.spec.ts`
- `web/src/pages/DietPlanner.tsx`
- `web/src/pages/WorkoutPlanner.tsx`
- `web/src/pages/Dashboard.tsx`
- `web/src/components/Navbar.tsx`
- `web/src/components/BottomNav.tsx`
- `web/src/services/foodService.ts`
- `TESTES.md`
- `CHANGELOG.md`

### Testes e Verificação
- **Backend**: 60 testes aprovados em 12 arquivos (`npm test`), 0 falhas.
- **Build de Produção**: `api` (NestJS) e `web` (Vite + TypeScript) compilados com código 0.

---

## [2026-10-06] - Correção Crítica — Assistente de Dieta, Treino, Adição de Exercícios e Catálogo TACO

### Tipo
Correção Crítica de Bugs / Confiabilidade de Dados / Robustez de Interface

### Alteração
1. **Assistente de Montagem de Dieta ("Falha ao concluir montagem da dieta")**:
   - **Causa Raiz Identificada**: O frontend enviava `'MODERATE'` para o campo `activityLevel`, mas o validador DTO (`UpdateProfileDto`) no NestJS aceitava estritamente o enum canônico `'MODERATELY_ACTIVE'`, gerando rejeição `400 Bad Request`.
   - **Correção no Backend**: Adicionados aliases amigáveis (`LIGHT`, `MODERATE`, `INTENSE`, `VERY_INTENSE` e versões minúsculas) no `@IsIn` do DTO e normalização automática para os valores canônicos em `profile.service.ts`.
   - **Ativação da Dieta**: Atualizado `diets.service.ts` para que a geração assistida (`generateSuggestion`) defina explicitamente `is_active = 1` e desative quaisquer planos anteriores em transação atômica SQLite. Suporte a 3, 4, 5 e 6 refeições dinâmicas.
   - **Validação e Resiliência no Frontend**: Adicionada função de pré-validação abrangente (`validateWizardData`) em `DietPlanner.tsx`, verificando meta, idade (10-120), peso (20-350 kg), altura (50-250 cm), calorias e atividade física. Adicionado banner de erro com botão `[ Tentar Novamente ]` sem perder os dados preenchidos pelo usuário.

2. **Página de Treino e Adição de Exercícios ("Treino não carrega" / Falha ao adicionar)**:
   - **Causa Raiz Identificada**: Em `WorkoutPlanner.tsx`, múltiplos componentes acessavam `item.exercise.name`, mas a API `getWorkoutById` retornava os dados com estrutura plana (`item.name`, `item.muscleGroup`, `item.equipment`). Essa inconsistência disparava `TypeError: Cannot read properties of undefined (reading 'name')`, travando a tela com erro não capturado ou impedindo a renderização do novo exercício.
   - **Correção no Backend**: Atualizado `workouts.service.ts` para retornar tanto os campos no nível raiz quanto o objeto aninhado `exercise: { id, name, muscleGroup, equipment }`, garantindo retrocompatibilidade total. Corrigida a busca do gerador de treino de termos em português para os enums oficiais (`CHEST`, `BACK`, `QUADRICEPS`, etc.).
   - **Defensividade no Frontend**: Atualizada a interface `WorkoutExercise` e todos os acessos para fallback seguro: `item.name || item.exercise?.name || 'Exercício'`.
   - **Estados da Tela de Treino**: Implementados os 4 estados obrigatórios: Carregando (*skeleton/spinner*), Carregado (ficha ativa), Vazio amigável (*"Você ainda não possui um treino. Monte agora mesmo de forma rápida e personalizada!"* com botão `[ INICIAR MONTAGEM ]`), e Erro com botão `[ TENTAR NOVAMENTE ]`.

3. **Aba "Base TACO & Alimentos"**:
   - **Causa Raiz Identificada**: O endpoint `/foods` retorna o objeto paginado `{ items: [...], total: 744 }`. Em `DietPlanner.tsx`, o estado recebia o objeto direto e tentava executar `.map()`, disparando `TypeError: tacoFoods.map is not a function`.
   - **Correção no Frontend**: Extração resiliente com `Array.isArray(res.data) ? res.data : (res.data?.items || [])`. Adicionado tratamento de erro com botão de recarregamento e aviso amigável quando nenhum alimento for encontrado na busca. Todos os 744 alimentos da tabela TACO são navegáveis e paginados.

4. **Testes e Validação Completa**:
   - Adicionados testes automatizados `TEST-DIET-010` (geração de proposta assistida com número dinâmico de refeições) e `TEST-WORK-006` (geração assistida de treino com exercícios reais do catálogo e ativação de rotina).
   - Suíte de testes do backend expandida para 58 testes em 12 arquivos, com 100% de aprovação.
   - Compilação estrita TypeScript do backend e frontend validada com código 0.

### Arquivos/áreas afetadas
- `api/src/modules/profile/dto/update-profile.dto.ts`
- `api/src/modules/profile/profile.service.ts`
- `api/src/modules/diets/diets.service.ts`
- `api/src/modules/diets/diets.service.spec.ts`
- `api/src/modules/workouts/workouts.service.ts`
- `api/src/modules/workouts/workouts.service.spec.ts`
- `web/src/pages/DietPlanner.tsx`
- `web/src/pages/WorkoutPlanner.tsx`
- `TESTES.md`
- `CHANGELOG.md`

### Testes
- **Backend Unitário & Integração**: 58 testes aprovados em 12 suítes (`npm test`), 0 falhas.
- **Backend Build**: `npm run build` compilado com código 0.
- **Frontend Build**: `npm run build` compilado com código 0.

### Resultado
- Assistente de montagem de dieta conclui com sucesso, persiste no banco relacional SQLite e ativa a dieta imediatamente.
- Página de treino carrega perfeitamente tanto no estado vazio quanto com plano ativo, permitindo adicionar, editar, reordenar e excluir exercícios sem erros.
- Aba da Base TACO renderiza a totalidade dos alimentos sem travar.
- Tratamento de erros e botões de repetição presentes em todas as etapas sem perda de dados.

---

## [2026-10-06] - Correção e Refinamento de Dieta, Treino, Responsividade e Suporte com Personal

### Tipo
Correção de Bugs / Melhoria de Usabilidade / Refatoração Arquitetural

### Alteração
1. **Adição e Busca de Alimentos no Montador de Dieta**:
   - Correção do fluxo assíncrono em `DietPlanner.tsx`: chamada a `getPopularFoods(30)` agora utiliza `await` antes de alimentar o estado `foodResults`.
   - Adicionada rota alias `@Get('search')` no backend (`foods.controller.ts`) para manter compatibilidade transparente entre `GET /foods` e `GET /foods/search`.
   - Normalização em `foodService.ts` para processar tanto formatos de array puro quanto objetos paginados `{ items, total }`.
   - Interface simplificada no modal de adição de alimento: exibição exclusiva de informações essenciais (Nome, Categoria, Calorias, Proteína, Carboidrato e Gordura) por porção base de 100g.
   - Validação estrita de quantidade consumida (valor numérico positivo maior que zero, bloqueando zeros, negativos e strings vazias).
   - Pré-visualização nutricional proporcional em tempo real antes da confirmação da adição.
   - Tratamento de estados de carregamento (`isAddingFood`) e exibição de alerta de erro com botão de repetição.
   - Reformulação dos alimentos da refeição em cards verticais responsivos com edição inline de gramagem (`[ Editar ]`), recálculo imediato de macronutrientes da refeição e do dia, e remoção com confirmação (`[ Remover ]`).

2. **Adição, Edição e Reordenação de Exercícios no Montador de Treino**:
   - Correção do tratamento da resposta do catálogo de exercícios em `WorkoutPlanner.tsx`: extração segura de `res.data.items` prevenindo o erro `catalogExercises.map is not a function`.
   - Criação de interface simplificada e responsiva para adicionar exercício, com filtro rápido por grupamento muscular (Peito, Costas, Pernas, Ombros, Bíceps, Tríceps, Abdômen) e busca textual nos 128 exercícios do catálogo.
   - Configuração progressiva de séries, repetições, carga sugerida (kg), tempo de descanso (s) e observações técnicas, com validação de campos obrigatórios (> 0).
   - Implementação de modal dedicado para edição de exercícios (`PUT /workouts/:id/exercises/:weId`), permitindo ajustar séries, repetições, carga e descanso diretamente na rotina.
   - Implementação de reordenação atômica de exercícios (`PUT /workouts/:id/exercises/reorder`) com botões intuitivos de subir (▲) e descer (▼) em cada card, persistindo a ordem no SQLite via transação.

3. **Responsividade Mobile Completa**:
   - Eliminação de tabelas horizontais largas e com rolagem excessiva em telas mobile.
   - Formatação dos itens de dieta e exercícios em cartões verticais modulares (block cards) com botões e áreas de toque confortáveis.

4. **Integração de Suporte com Personal Trainer na Tela de Treino**:
   - Adicionada seção destacada *"PRECISA DE AJUDA COM SEU TREINO? [ FALAR COM PERSONAL ]"* visível em resoluções Desktop, Tablet e Mobile.
   - Integração inteligente com status do usuário: caso possua um treinador vinculado, direciona para o chat em tempo real; caso não possua, exibe aviso amigável e botão para encontrar profissionais certificados e solicitar acompanhamento via `ProfessionalContactModal`.

5. **Testes Automatizados e Documentação**:
   - Adicionado caso de teste unitário `TEST-WORK-005` em `workouts.service.spec.ts` validando reordenação atômica e persistência no banco SQLite.
   - Atualizados os manuais `API.md` e `MANUAL_USUARIO.md` refletindo os novos fluxos e rotas.

### Motivo
- **Falha na Adição de Alimentos**: O montador travava a listagem de alimentos populares devido ao retorno de uma Promise não resolvida e discrepância de formato de resposta da API de alimentos, impedindo o usuário de montar sua dieta.
- **Falha no Montador de Treinos**: A resposta paginada do endpoint `/exercises` era tratada diretamente como um array, quebrando a renderização do catálogo com erro de JavaScript ao abrir o modal.
- **Falta de Reordenação e Edição de Exercícios**: Usuários não conseguiam alterar a sequência dos exercícios prescritos nem ajustar séries/cargas sem ter que deletar e recriar o exercício.
- **Acessibilidade Mobile Prejudicada**: Tabelas com muitas colunas causavam overflow horizontal em smartphones.
- **Isolamento do Aluno**: Faltava um canal de acesso direto ao profissional de educação física a partir da própria ficha de treinamento.

### Arquivos/áreas afetadas
- `api/src/modules/foods/foods.controller.ts`
- `api/src/modules/workouts/workouts.controller.ts`
- `api/src/modules/workouts/workouts.service.ts`
- `api/src/modules/workouts/workouts.service.spec.ts`
- `web/src/services/foodService.ts`
- `web/src/pages/DietPlanner.tsx`
- `web/src/pages/WorkoutPlanner.tsx`
- `API.md`
- `MANUAL_USUARIO.md`
- `CHANGELOG.md`

### Testes
- **Backend Unitário & Integração**: 56 testes executados com Jest em 12 suítes de teste (`npm test` no diretório `api`), todos com status APROVADO (100% de sucesso).
- **Backend Build**: Compilação TypeScript de produção (`npm run build` no diretório `api`) bem-sucedida com código 0.
- **Frontend Build**: Compilação Vite + TypeScript de produção (`npm run build` no diretório `web`) bem-sucedida com código 0.

### Resultado
- Fluxo de adição de alimentos da TACO e exercícios funcionando perfeitamente de ponta a ponta.
- Recálculos instantâneos de macronutrientes ao editar ou excluir itens de dieta.
- Reordenação atômica e edição de parâmetros de exercícios ativas e testadas.
- Experiência móvel aprimorada sem quebras de layout.
- Canal direto para acionar o Personal Trainer integrado à interface de treinos.

---

## [2026-10-06] - Refatoração Arquitetural e Simplificação de Navegação para 4 Abas

### Tipo
Refatoração / Melhoria de Usabilidade

### Alteração
- Condensação de dezenas de páginas espalhadas na navegação principal em 4 abas estruturadas para o aluno: **Dashboard**, **Dieta**, **Treino** e **Perfil**.
- Transformação de assistentes de montagem em fluxos guiados em 8 etapas progressivas com validações intermediárias.
- Inclusão de seções internas e modais contextuais para visualização do catálogo da TACO (744 alimentos), catálogo de exercícios (128 itens), histórico de pesagens e logs de treinos.
- Separação clara dos papéis de Aluno, Profissional de Saúde e Administrador da Plataforma.

### Motivo
Reduzir a sobrecarga cognitiva e a dispersão de abas vazias ou redundantes apontadas na análise de usabilidade, preservando 100% das regras de negócio e integrações existentes.

### Arquivos/áreas afetadas
- `web/src/components/layout/Navbar.tsx`
- `web/src/pages/Dashboard.tsx`
- `web/src/pages/DietPlanner.tsx`
- `web/src/pages/WorkoutPlanner.tsx`
- `web/src/pages/Profile.tsx`
- `web/src/App.tsx`
- `MANUAL_USUARIO.md`

### Testes
- Testes automatizados no backend e validação dos fluxos no frontend compilado.

### Resultado
Interface limpa, moderna, sem redundância e com navegação simplificada.
