# Registro de Mudanças (CHANGELOG) - NutriPlan v2

Todas as alterações notáveis, correções de bugs, melhorias arquiteturais e refatorações realizadas no projeto NutriPlan v2 são documentadas neste arquivo.

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
