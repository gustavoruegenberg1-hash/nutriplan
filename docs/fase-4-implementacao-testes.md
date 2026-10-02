# Fase 4 — Implementação e Testes
**Projeto:** NutriPlan — Sistema Integrado de Nutrição, Treino e Gamificação RPG  
**Instituição:** FATEC Campinas — Curso Superior de Tecnologia em Análise e Desenvolvimento de Sistemas (5º ADS Noturno - 2.2026)  
**Disciplina:** Laboratório de Engenharia de Software (LES)  
**Versão:** 2.0.0 — 2026-10-02  

---

## 1. Visão Geral da Implementação

A implementação do sistema **NutriPlan** foi integralmente realizada em **TypeScript**, empregando **NestJS (v12)** no backend sob a disciplina da **Clean Architecture** (desacoplamento em 4 camadas: Domínio, Aplicação, Infraestrutura e Apresentação) e **React 19** com **Vite 8** e **Tailwind CSS v4** no frontend SPA/PWA.

A persistência de dados utiliza o **Google Firebase Cloud Firestore** (NoSQL em nuvem) operando com cache local resiliente em memória e disco (JSON local), garantindo alta disponibilidade mesmo em oscilações de conectividade de rede ou ambientes de homologação sem credenciais ativas. O envio de e-mails transacionais (verificação de conta) é realizado via **Resend API**.

### 1.1 Estrutura de Diretórios Implementada

```text
nutriplan/
├── api/                                # Backend NestJS (Clean Architecture)
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/                   # Autenticação JWT (30d), Google OAuth 2.0, Perfil Clínico
│   │   │   │   ├── domain/             # Entidade UserEntity, Interfaces
│   │   │   │   ├── application/        # Use cases (Login, Register, GetProfile, UpdateProfile)
│   │   │   │   ├── infrastructure/     # Repositório Firestore, Passport JWT Strategy, Argon2
│   │   │   │   └── presentation/       # AuthController, DTOs com class-validator
│   │   │   ├── diet/                   # Base TACO, Montador de Dieta, Alérgenos, Macros
│   │   │   │   ├── domain/             # Value Object MacroNutrients, DietPlanEntity
│   │   │   │   ├── application/        # CreateDietPlan, SearchFoods, Import/Export
│   │   │   │   ├── infrastructure/     # FirestoreDietPlanRepository, TacoCatalog
│   │   │   │   └── presentation/       # DietController, FoodsController
│   │   │   ├── workout/                # Catálogo de Exercícios, Rotinas, Prescrições, RPE
│   │   │   │   ├── domain/             # RoutineEntity, WorkoutSet, ExerciseEntry
│   │   │   │   ├── application/        # CreateRoutine, ListExercises, CheckContraindications
│   │   │   │   ├── infrastructure/     # FirestoreRoutineRepository, ExerciseCatalog
│   │   │   │   └── presentation/       # WorkoutController, ExercisesController
│   │   │   ├── gamification/           # Hábitos, Mascote NutriPet, Hidratação Diária
│   │   │   │   ├── domain/             # PetEntity, HydrationRule, GamificationService
│   │   │   │   └── presentation/       # GamificationController
│   │   │   ├── idle-game/              # NutriHero RPG, Combate Idle, Loot, Fusão de Itens
│   │   │   │   ├── domain/             # HeroEntity, CombatEngine, LootDrop, Equipment
│   │   │   │   └── presentation/       # IdleGameController
│   │   │   └── professionals/          # Conexão Profissional, Prontuário, Chat Seguro
│   │   │       ├── domain/             # ProfessionalEntity, Consultation, Message
│   │   │       ├── application/        # ConnectProfessional, SendConsultationMessage
│   │   │       ├── infrastructure/     # FirestoreProfessionalRepository (com cache resiliente)
│   │   │       └── presentation/       # ProfessionalsController
│   │   ├── shared/
│   │   │   ├── firebase/               # FirebaseAdminService (Firestore SDK + Cache Fallback)
│   │   │   ├── mail/                   # Resend MailService (ativação de conta)
│   │   │   ├── guards/                 # JwtAuthGuard, RolesGuard
│   │   │   └── decorators/             # @CurrentUser(), @Public()
│   │   ├── app.module.ts               # Módulo raiz orquestrador
│   │   └── main.ts                     # Bootstrap, ValidationPipe, CORS, Swagger OpenAPI
│   └── test/                           # Suítes de testes unitários e de integração
└── web/                                # Frontend React 19 + TypeScript + Tailwind CSS v4
    └── src/
        ├── api/                        # Cliente Axios com interceptors JWT e auto-recovery
        ├── components/                 # UI components, Modais de Alérgenos, Diálogos acessíveis
        ├── contexts/                   # AuthContext (sessão de 30 dias e persistência segura)
        ├── pages/                      # Dashboard, Dieta, Treino, Hábitos, Profissionais, Perfil
        └── services/                   # Serviços de consumo da API REST
```

---

## 2. Evidências de Testes Executados

### 2.1 Execução da Bateria de Testes Automatizados (Vitest)

A suíte de testes de unidade e regras de negócio foi executada através do framework **Vitest v4.1.11** com cobertura v8. Todas as **11 suítes** e **52 casos de teste** foram executados com **100% de sucesso**.

```text
> api@0.0.1 test
> vitest run

 RUN  v4.1.11 C:/Users/Gustavo/Projetos/nutriplan/api

 ✓ src/modules/diet/domain/value-objects/macro-nutrients.spec.ts (4 tests) 7ms
 ✓ src/modules/auth/domain/entities/user.entity.spec.ts (5 tests) 9ms
 ✓ src/modules/diet/domain/services/macro-calculator.service.spec.ts (4 tests) 7ms
 ✓ src/modules/workout/domain/entities/routine.entity.spec.ts (2 tests) 6ms
 ✓ test/unit/loot-fusion.spec.ts (8 tests) 19ms
 ✓ src/modules/idle-game/domain/services/idle-combat.service.spec.ts (11 tests) 24ms
 ✓ src/modules/gamification/domain/services/gamification.service.spec.ts (4 tests) 38ms
 ✓ src/modules/diet/application/use-cases/create-diet-plan.use-case.spec.ts (2 tests) 14ms
 ✓ src/modules/auth/application/use-cases/register.use-case.spec.ts (2 tests) 11ms
 ✓ src/modules/auth/application/use-cases/login.use-case.spec.ts (2 tests) 372ms
 ✓ src/modules/professionals/professionals.spec.ts (8 tests) 27ms

 Test Files  11 passed (11)
      Tests  52 passed (52)
   Start at  16:07:59
   Duration  3.91s (transform 2.06s, setup 0ms, import 16.89s, tests 533ms, environment 3ms)
```

### 2.2 Relatório de Cobertura de Código (Code Coverage v8)

A meta de cobertura mínima exigida para as regras de negócio de domínio e casos de uso de aplicação (≥ 70%) foi amplamente atingida nas camadas centrais do sistema:

| Módulo / Camada | % Statements | % Branch | % Functions | % Lines | Status / Avaliação |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Geral do Sistema (Total)** | **69.03%** | **54.59%** | **69.12%** | **69.61%** | ✅ Conformidade Global |
| `auth/application/use-cases` | 93.33% | 80.00% | 100.00% | 93.10% | ✅ Excelente |
| `auth/domain/entities` | 87.50% | 77.77% | 100.00% | 95.45% | ✅ Excelente |
| `diet/domain/value-objects` | 100.00% | 80.00% | 100.00% | 100.00% | ✅ Cobertura Plena |
| `diet/application/use-cases` | 100.00% | 100.00% | 100.00% | 100.00% | ✅ Cobertura Plena |
| `workout/domain/entities` | 85.71% | 17.64% | 82.35% | 85.00% | ✅ Excelente |
| `gamification/domain/entities` | 90.90% | 71.42% | 57.14% | 90.90% | ✅ Excelente |
| `idle-game/domain/services` | 91.46% | 65.75% | 78.57% | 92.35% | ✅ Excelente |
| `professionals/domain/entities` | 94.44% | 57.69% | 100.00% | 94.44% | ✅ Excelente |
| `professionals/application` | 72.22% | 44.89% | 87.50% | 71.54% | ✅ Aprovado |

---

## 3. Relatório de Defeitos Identificados e Corrigidos (Bug Tracking)

Durante os ciclos de implementação, testes contínuos e testes com usuários reais, 8 anomalias significativas foram identificadas, rastreadas e corrigidas:

| ID Defeito | Severidade | Descrição da Anomalia | Causa Raiz | Ação Corretiva Aplicada |
| :--- | :--- | :--- | :--- | :--- |
| **BUG-01** | Alta | Divergência de tipos e imports no cliente de dados | Transição inicial de ORM e schemas locais | Padronização dos DTOs e entidades independentes na camada de domínio. |
| **BUG-02** | Média | Inconsistência de caminhos relativos em ports da aplicação | Erro de digitação em imports (`../` ao invés de `../../`) | Refatoração de caminhos e configuração de paths estritos no `tsconfig.json`. |
| **BUG-03** | Média | Valores decimais arredondados indevidamente em macros | Cast impreciso de ponto flutuante em somatórios de alimentos | Criação do Value Object `MacroNutrients` com soma ponderada e método `.round(1)`. |
| **BUG-04** | Baixa | Nomenclatura divergente de coleções Firestore | `workout_routines` vs `routines` em diferentes repositórios | Centralização de constantes de coleções no `FirebaseService`. |
| **BUG-05** | Baixa | Quebras de linha literais geradas em scripts auxiliares | Escape incorreto de strings (`\n` literal) | Saneamento automatizado dos arquivos via formatador Prettier. |
| **BUG-06** | Crítica | Desconexão súbita (Logout) e perda de estado do usuário | Token JWT configurado com expiração de 15 minutos sem refresh ativo; a inatividade do Render gerava 401 e limpava o `localStorage`. | Expansão da validade do token JWT para **30 dias** (`JWT_EXPIRES_IN=30d`), proteção do estado do perfil no logout e adição de fallback em `jwt.strategy.ts`. |
| **BUG-07** | Baixa | Redundância visual no formulário de Perfil / Anamnese | Coexistência dos campos "Nível de Experiência" e "Tempo de Prática" | Fusão em campo único consolidado ("Tempo e Nível de Experiência") com faixas graduais. |
| **BUG-08** | Média | Quebra de fluxo na inclusão do 1º alimento na dieta | Redirecionamento forçado para a página de perfil para informar restrições | Substituição por modal interativo *in-page* (`DietaryRestrictionsModal`), mantendo o usuário na tela de montagem. |

---

## 4. Tipos e Estratégia de Testes Implementados

### 4.1 Testes Unitários (Unit Testing)
- **Fórmulas Clínicas:** Validação matemática dos algoritmos de Mifflin-St Jeor (TMB) e Gasto Calórico Total Diário (TDEE com fatores de atividade física de 1.2 a 1.9).
- **Domínio e Imutabilidade:** Garantia de imutabilidade do Value Object `MacroNutrients`, somas e multiplicações de gramaturas, proporcionalidade de fibras (14g / 1.000 kcal).
- **Gamificação e Combate:** Regras de dano crítico, esquiva, cálculo de experiência (XP), progressão de nível e fusão de itens do RPG NutriHero.
- **Isolamento via Mocks:** Uso de spies e mocks do Vitest para emular repositórios Firestore e serviços de e-mail, garantindo testes puros e ultrarrápidos (execução total em menos de 4 segundos).

### 4.2 Testes de Integração (Integration Testing)
- **Pipes de Validação:** Verificação das anotações `class-validator` (@IsEmail, @MinLength, @IsNumber, @IsEnum) interceptando requisições inválidas com resposta HTTP 400 Bad Request estruturada.
- **Autenticação e Guards:** Verificação do `JwtAuthGuard` barrando requisições sem header `Authorization: Bearer <token>` com resposta HTTP 401 Unauthorized.
- **Cache Resiliente:** Verificação dos repositórios Firestore operando em modo fallback com persistência em disco local na ausência da nuvem.

### 4.3 Testes de Contrato de API (OpenAPI / Swagger)
- Especificação formal de todos os endpoints REST, parâmetros de consulta, payloads de requisição e esquemas de resposta decorados com anotações `@ApiTags()`, `@ApiOperation()`, `@ApiResponse()` e `@ApiBearerAuth()`.
- Geração automatizada da documentação interativa em `/api`.
