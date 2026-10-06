# Registro de Mudanças (CHANGELOG) - NutriPlan v2

Todas as alterações notáveis, correções de bugs, melhorias arquiteturais e refatorações realizadas no projeto NutriPlan v2 são documentadas neste arquivo.

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
