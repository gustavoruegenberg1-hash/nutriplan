# MATRIZ DE RASTREABILIDADE DE ENGENHARIA DE SOFTWARE — NUTRIPLAN V2

**Projeto:** Sistema Web/Mobile de Montagem Personalizada de Dieta e Treino  
**Disciplina:** Engenharia de Software  
**Data:** Outubro de 2026  
**Finalidade:** Garantir rastreabilidade bidirecional entre Requisitos Funcionais (RF), Regras de Negócio (RN), Componentes/Serviços de Implementação e Casos de Teste Automatizados (UT/IT/FT).

---

## 1. TABELA DE RASTREABILIDADE

| ID Requisito | Regra de Negócio | Componente / Serviço (Backend & Frontend) | ID do Caso de Teste | Descrição da Cobertura do Teste |
| :--- | :--- | :--- | :--- | :--- |
| **RF01** (Cadastro) | **RN01** (E-mail único), **RN02** (Senha segura) | `AuthService.register`, `UsersRepository` | `TEST-AUTH-001`<br>`TEST-AUTH-002` | Valida criação com sucesso e bloqueio de e-mail duplicado ou senha fraca. |
| **RF02** (Login) | **RN02** (Hash seguro), **RN04** (Token JWT) | `AuthService.login`, `JwtAuthGuard` | `TEST-AUTH-003`<br>`TEST-AUTH-004` | Valida emissão de token com credenciais corretas e rejeição 401 para senha incorreta. |
| **RF05** (Proteção de Rotas) | **RN03** (Isolamento de usuário), **RN04** (Auth obrigatória) | `JwtAuthGuard`, `CurrentUserDecorator` | `TEST-SEC-001`<br>`TEST-SEC-002` | Bloqueia requisição sem cabeçalho Authorization ou com token expirado/adulterado. |
| **RF06** (Isolamento de Dados) | **RN03** (Isolamento multiusuário) | `DietsService`, `WorkoutsService`, Repos | `TEST-SEC-003` | Impede que Usuário B consulte ou altere dieta ou treino criado pelo Usuário A (HTTP 403/404). |
| **RF07** (Gestão de Perfil) | **RN05** (Limites antropométricos) | `ProfilesService`, `ProfilesRepository` | `TEST-PROF-001`<br>`TEST-PROF-002` | Testa atualização do perfil e valida limites fisiológicos (idade, peso, altura). |
| **RF10** (Cálculo TMB) | **RN06** (Mifflin-St Jeor) | `NutritionCalculator.calculateBMR` | `TEST-NUTR-001` | Compara valor calculado de TMB com casos matemáticos tabelados para homens e mulheres. |
| **RF11** (Cálculo TDEE) | **RN07** (Fator de atividade) | `NutritionCalculator.calculateTDEE` | `TEST-NUTR-002` | Testa multiplicação da TMB pelo fator correspondente (sedentário até extra ativo). |
| **RF12** (Metas Nutricionais) | **RN08** (Meta calórica), **RN09** (Macros) | `NutritionCalculator.calculateTargets` | `TEST-NUTR-003` | Verifica déficit de 500 kcal para emagrecimento e proporção correta de P/C/G. |
| **RF14** (Catálogo TACO) | **RN11** (Imutabilidade), **RN12** (Tratamento nulos) | `FoodsService`, `FoodsRepository`, `tacoFoods.json` | `TEST-FOOD-001` | Garante carga de 744 alimentos verídicos TACO e preservação de micronutrientes reais. |
| **RF15** (Busca de Alimentos) | **RN10** (Proporcionalidade) | `FoodsService.search`, `foodService.ts` | `TEST-FOOD-002` | Testa busca por termos parciais, sem acentuação e filtros por tags nutricionais. |
| **RF16** (Cálculo Proporcional) | **RN10** (Proporcionalidade 100g) | `NutritionCalculator.calculateProportion` | `TEST-NUTR-004` | Testa cálculo proporcional: 150g de alimento com 20g de proteína resulta exatamente em 30g. |
| **RF18** (Criação de Dieta) | **RN13** (Associação ao usuário) | `DietsService.createDiet` | `TEST-DIET-001` | Valida persistência relacional de nova dieta associada ao usuário autenticado. |
| **RF19** (Criação de Refeição) | **RN13** (Associação à dieta) | `DietsService.addMeal` | `TEST-DIET-002` | Cria refeição ordenada dentro da dieta (Café, Almoço, Jantar). |
| **RF20** (Adicionar Alimento) | **RN13** (Existência do alimento), **RN14** (Qtd > 0) | `DietsService.addFoodToMeal` | `TEST-DIET-003` | Adiciona item à refeição e rejeita quantidade igual a zero ou negativa. |
| **RF21** (Recálculo Instantâneo) | **RN15** (Sem edição manual), **RN16** (Recálculo cascata) | `DietsService.recalculateTotals` | `TEST-DIET-004`<br>`TEST-DIET-005` | Recalcula totais da refeição e do dia após alteração de quantidade ou remoção de item. |
| **RF22** (Comparativo com Metas) | **RN18** (Alerta de desvio > 15%) | `DietsService.compareWithTarget` | `TEST-DIET-006` | Verifica cálculo do delta e emissão de alertas para planos fora da meta calórica. |
| **RF23** (Alertas de Restrições) | **RN17** (Verificação de alergias) | `RestrictionValidator.checkCompatibility` | `TEST-DIET-007` | Alerta quando alimento com lactose é adicionado por usuário intolerante. |
| **RF26** (Catálogo Exercícios) | **RN21** (Existência prévia) | `ExercisesService`, `ExercisesRepository` | `TEST-EXER-001` | Consulta banco de exercícios por grupamento muscular e equipamento. |
| **RF28** (Rotina de Treino) | **RN20** (Associação ao usuário) | `WorkoutsService.createWorkout` | `TEST-WORK-001` | Persiste rotina de treino relacional do usuário. |
| **RF29** (Séries e Cargas) | **RN22** (Limites válidos de séries/reps) | `WorkoutsService.addExerciseToWorkout` | `TEST-WORK-002` | Valida inserção de exercícios com séries e repetições válidas e rejeita valores absurdos. |
| **RF31** (Registro de Treino) | **RN24** (Imutabilidade do log histórico) | `WorkoutLogsService.createLog` | `TEST-LOG-001` | Registra execução de treino com data, carga realizada e notas. |
| **RF32** (Integridade Histórico) | **RN24** (Preservação pós-exclusão do plano) | `WorkoutLogsRepository` | `TEST-LOG-002` | Exclui plano de treino e confirma que logs históricos permanecem intactos no banco. |
| **RF33** (Dashboard Integrado) | **RN05**, **RN18** | `DashboardService.getSummary` | `TEST-DASH-001` | Valida agregação de dados de perfil, dieta ativa, treino do dia e histórico recente. |

---

## 2. RASTREABILIDADE DE TESTES FUNCIONAIS (CENÁRIOS COMPLETOS)

- **Cenário Funcional 01 (`FT-01`):** Cadastro do Usuário $\rightarrow$ Login $\rightarrow$ Configuração Antropométrica $\rightarrow$ Criação de Dieta $\rightarrow$ Adição de Alimentos TACO $\rightarrow$ Alteração de Gramagem $\rightarrow$ Verificação do Recálculo $\rightarrow$ Logout e Login $\rightarrow$ Persistência confirmada.
- **Cenário Funcional 02 (`FT-02`):** Criação de Rotina de Treino $\rightarrow$ Adição de Exercícios com Séries/Cargas $\rightarrow$ Registro de Execução (Log) $\rightarrow$ Consulta ao Histórico $\rightarrow$ Validação dos Dados.
- **Cenário Funcional 03 (`FT-03`):** Teste de Segurança e Autorização: Usuário A cria recurso $\rightarrow$ Usuário B tenta acessar recurso via API diretamente $\rightarrow$ Bloqueio com erro 403/404.
- **Cenário Funcional 04 (`FT-04`):** Modificação de Dieta Dinâmica: Adiciona alimento $\rightarrow$ Confere somatório $\rightarrow$ Altera quantidade $\rightarrow$ Confere proporcionalidade $\rightarrow$ Remove alimento $\rightarrow$ Confere subtração perfeita dos totais.
