# Fase 3 — Análise, Arquitetura e Projeto
**Instituição:** FATEC Campinas  
**Curso:** Superior de Tecnologia em Análise e Desenvolvimento de Sistemas (ADS Noturno)  
**Disciplina:** LES — Laboratório de Engenharia de Software (2.2026)  
**Projeto:** NutriPlan — Sistema Integrado de Planejamento Nutricional, Periodização de Treino e Gamificação de Hábitos  
**Autor:** Gustavo Ruegenberg  
**Versão:** 2.0.0 — Outubro de 2026  

---

## 1. Definição Formal da Arquitetura

O sistema NutriPlan adota o padrão **Clean Architecture (Arquitetura Limpa / Ports & Adapters / Onion Architecture)** estruturado como um **Monólito Modular** no backend e uma **Single Page Application (SPA)** desacoplada no frontend.

A regra fundamental de dependência da Clean Architecture é rigorosamente preservada: **as dependências de código apontam exclusivamente para dentro, em direção às regras de negócio de mais alto nível**.

```mermaid
graph TD
    subgraph Presentation [1. Presentation Layer - HTTP / Controllers / DTOs]
        C1[AuthController]
        C2[DietController & FoodController]
        C3[WorkoutController & ExerciseController]
        C4[GamificationController & IdleGameController]
        C5[ProfessionalsController]
    end

    subgraph Application [2. Application Layer - Use Cases & Ports]
        UC1[Register, Login, GoogleAuth, VerifyEmail]
        UC2[CreateDietPlan, GetDietPlan, ExportDietPlan]
        UC3[CreateRoutine, GetRoutine, ExportRoutine]
        UC4[GetPet, PerformPetAction, HeroCombat]
        UC5[ListProfessionals, ShareProfile, ChatMessages]
        P1[IUserRepository, IDietPlanRepository, IFoodRepository, IWorkoutRepository, IProfessionalRepository]
    end

    subgraph Domain [3. Domain Layer - Pure Entities, Value Objects & Domain Services]
        E1[UserEntity]
        E2[DietPlan, DayPlan, Meal, MealItem, FoodItem]
        E3[Routine, WorkoutDay, Exercise, WorkoutSet]
        E4[Hero, Pet, Item, Habit]
        E5[Professional, Conversation, Message]
        VO1[MacroNutrients - Imutável]
        DS1[MacroCalculatorService - Mifflin-St Jeor, TDEE, Macros]
        DS2[IdleCombatService, GamificationService]
    end

    subgraph Infrastructure [4. Infrastructure Layer - Firebase Firestore, Security, Mail]
        R1[FirestoreUserRepository com Cache Local]
        R2[FirestoreDietPlanRepository & FirestoreFoodRepository]
        R3[FirestoreWorkoutRepository & FirestoreExerciseRepository]
        R4[FirestoreProfessionalRepository]
        S1[JwtStrategy, Argon2 Password Hasher]
        M1[ResendMailService]
    end

    Presentation --> Application
    Application --> Domain
    Infrastructure -.->|Implementa Ports| Application
```

### 1.1 Responsabilidades de Cada Camada

1. **Domain Layer (`src/modules/*/domain/`):**
   - É o coração do sistema, contendo regras de negócio corporativas puras, entidades ricas, objetos de valor e serviços de domínio.
   - **Zero Dependências:** É totalmente agnóstica a bancos de dados, NestJS, Express ou qualquer biblioteca externa de infraestrutura.
2. **Application Layer (`src/modules/*/application/`):**
   - Contém os casos de uso (*Use Cases*) que orquestram o fluxo de execução das regras de negócio.
   - Declara as portas de entrada e saída (*Ports / Interfaces*) necessárias para que a infraestrutura forneça persistência e serviços de rede sem acoplamento direto.
3. **Infrastructure Layer (`src/modules/*/infrastructure/`):**
   - Implementa os adaptadores concretos para os repositórios (via **Firebase Cloud Firestore** com camada de cache resiliente em disco/memória), autenticação Passport JWT, hashing com Argon2id e envio de e-mails transacionais com a API Resend.
4. **Presentation Layer (`src/modules/*/presentation/`):**
   - Recebe as requisições HTTP, valida os dados de entrada através de **Data Transfer Objects (DTOs)** com anotações de `class-validator` e expõe a documentação OpenAPI/Swagger 3.0.

---

## 2. Justificativa dos Padrões Adotados (Design Patterns)

| Padrão de Projeto | Categoria | Onde foi aplicado no NutriPlan | Justificativa Técnica |
| :--- | :--- | :--- | :--- |
| **Repository** | Estrutural | `IUserRepository`, `IDietPlanRepository`, `IWorkoutRepository`, etc. | Isola o domínio do mecanismo de persistência (Firestore), permitindo testar as regras de negócio em milissegundos através de Mocks nos testes unitários. |
| **Value Object** | Tático (DDD) | `MacroNutrients` | Garante imutabilidade e encapsula regras de proporcionalidade e soma de nutrientes ($\text{calorias}, \text{proteínas}, \text{carboidratos}, \text{gorduras}, \text{fibras}$). |
| **Domain Service** | Tático (DDD) | `MacroCalculatorService`, `IdleCombatService` | Centraliza regras matemáticas e cálculos que não pertencem exclusivamente a uma entidade única (e.g. equações de Mifflin-St Jeor, TDEE, DRIs e combate). |
| **Data Transfer Object (DTO)** | Comportamental | `CreateDietPlanDto`, `UpdateProfileDto`, `RegisterDto` | Define contratos estritos de entrada/saída HTTP, sanitiza dados contra injeções maliciosas e alimenta o gerador automático do Swagger. |
| **Dependency Injection** | Criacional | IoC Container do NestJS via Tokens (`'USER_REPOSITORY'`, etc.) | Inverte as dependências, permitindo que os casos de uso recebam suas portas resolvidas em tempo de execução sem conhecer a infraestrutura. |
| **Strategy / Guard** | Estrutural | `JwtAuthGuard`, `JwtStrategy` | Intercepta requisições protegidas para autenticar e validar o payload criptográfico do token JWT de forma modular. |
| **Circuit Breaker / Fallback Cache** | Resiliência | Repositórios Firestore (`localUsersMap`, `local-cache/`) | Garante alta disponibilidade caso o banco em nuvem sofra oscilações ou o servidor opere em ambientes efêmeros (como Render Free Tier). |

---

## 3. Diagrama de Classes do Domínio (UML)

```mermaid
classDiagram
    class UserEntity {
        +string id
        +string email
        +string passwordHash
        +string name
        +number weight
        +number height
        +number age
        +string gender
        +string activityLevel
        +string goal
        +string role
        +boolean hasFoodAllergies
        +string[] allergies
        +boolean hasFoodIntolerances
        +string[] intolerances
        +string experienceLevel
        +number trainingFrequencyDays
        +string[] affectedJoints
        +calculateBMR() number
        +calculateTDEE() number
    }

    class MacroNutrients {
        +number calories
        +number protein
        +number carbs
        +number fat
        +number fiber
        +add(other: MacroNutrients) MacroNutrients
        +scale(factor: number) MacroNutrients
        +fromFood(food, grams) MacroNutrients
    }

    class DietPlan {
        +string id
        +string userId
        +string name
        +boolean isActive
        +DayPlan[] days
        +getTotalCalories() number
        +getTotalMacros() MacroNutrients
    }

    class DayPlan {
        +string id
        +string dayOfWeek
        +Meal[] meals
        +getDayMacros() MacroNutrients
    }

    class Meal {
        +string id
        +string name
        +string timeOfDay
        +MealItem[] items
        +getMealMacros() MacroNutrients
    }

    class MealItem {
        +string id
        +string foodItemId
        +number quantityGrams
        +FoodItem foodItem
        +getScaledNutrients() MacroNutrients
    }

    class FoodItem {
        +string id
        +string name
        +number caloriesPer100g
        +number proteinPer100g
        +number carbsPer100g
        +number fatPer100g
        +number fiberPer100g
    }

    class Routine {
        +string id
        +string userId
        +string name
        +boolean isActive
        +WorkoutDay[] days
        +getTotalExercises() number
        +getTotalVolumeKg() number
    }

    class WorkoutDay {
        +string id
        +string name
        +string dayOfWeek
        +ExerciseEntry[] exercises
    }

    class ExerciseEntry {
        +string id
        +string exerciseId
        +string notes
        +WorkoutSet[] sets
    }

    class Exercise {
        +string id
        +string name
        +string muscleGroup
        +string equipment
    }

    class WorkoutSet {
        +string id
        +number setNumber
        +number reps
        +number weightKg
        +number restSeconds
        +string setType
        +number rpe
    }

    class Hero {
        +string id
        +string userId
        +number level
        +number xp
        +number strength
        +number agility
        +number intelligence
        +number vitality
    }

    class Professional {
        +string id
        +string name
        +string specialty
        +string crnCref
        +string bio
    }

    UserEntity "1" --> "*" DietPlan : possui
    UserEntity "1" --> "*" Routine : possui
    UserEntity "1" --> "1" Hero : comanda
    DietPlan "1" --> "*" DayPlan : contém
    DayPlan "1" --> "*" Meal : agrupa
    Meal "1" --> "*" MealItem : possui
    MealItem "1" --> "1" FoodItem : referencia
    MealItem ..> MacroNutrients : gera
    Routine "1" --> "*" WorkoutDay : contém
    WorkoutDay "1" --> "*" ExerciseEntry : possui
    ExerciseEntry "1" --> "1" Exercise : referencia
    ExerciseEntry "1" --> "*" WorkoutSet : contém
```

---

## 4. Diagramas Comportamentais

### 4.1 Diagrama de Sequência — Autenticação e Atualização Resiliente de Perfil

```mermaid
sequenceDiagram
    autonumber
    actor User as Cliente Web (React)
    participant AuthGuard as JwtAuthGuard
    participant Strategy as JwtStrategy
    participant Controller as AuthController
    participant UseCase as UpdateProfileUseCase
    participant Repo as FirestoreUserRepository
    participant Cloud as Firebase Cloud Firestore

    User->>AuthGuard: PATCH /auth/profile (Bearer JWT + Payload)
    AuthGuard->>Strategy: validate(payload)
    Strategy->>Repo: findById(payload.sub)
    alt Usuário não encontrado no cache (após reinício de instância)
        Strategy->>Repo: create(usuário restaurado a partir do token)
        Repo-->>Strategy: Usuário ativo restabelecido
    else Usuário presente
        Repo-->>Strategy: UserEntity
    end
    Strategy-->>AuthGuard: Sessão Aprovada ({ id, email, role })
    AuthGuard->>Controller: updateProfile(user, dto)
    Controller->>UseCase: execute(user.id, dto)
    UseCase->>Repo: update(userId, dto)
    Repo->>Cloud: set(updateData, { merge: true })
    Cloud-->>Repo: Sucesso (ou fallback seguro no cache local)
    Repo-->>UseCase: UserEntity atualizado
    UseCase-->>Controller: UserResponseDto
    Controller-->>User: 200 OK (Perfil Atualizado com Novos Macros e Metas)
```

### 4.2 Diagrama de Atividades — Montagem de Dieta e Interceptação Preventiva de Alergias

```mermaid
flowchart TD
    A([Início: Usuário Clica em Adicionar Alimento]) --> B{Restrições Alimentares Preenchidas?}
    B -- Não --> C[Exibir Modal In-Page na Mesma Página]
    C --> D{Possui Alergias ou Intolerâncias?}
    D -- Não --> E[Opção Rápida de 1-Clique: 'Não Possuo Alergias']
    D -- Sim --> F[Marcar Chips de Alergias e Intolerâncias]
    E --> G[Salvar Perfil via PATCH /auth/profile]
    F --> G
    G --> H[Fechar Modal e Abrir Campo de Busca Automaticamente]
    B -- Sim --> I[Digitar Nome do Alimento na Busca TACO]
    H --> I
    I --> J[Exibir Alimentos Encontrados]
    J --> K{Alimento Contém Ingrediente Alérgeno?}
    K -- Sim --> L[Exibir Badge Vermelho de Alerta Crítico]
    L --> M[Usuário Avalia o Risco e Decide Adicionar ou Substituir]
    K -- Não --> N[Adicionar à Refeição]
    M --> N
    N --> O[Recalcular Calorias, Fibras e Macros da Refeição]
    O --> P[Disparar Autosave Silencioso em Nuvem]
    P --> Q([Fim: Refeição Atualizada com Sucesso])
```

---

## 5. Modelo Lógico de Dados (Coleções NoSQL - Firebase Firestore)

O NutriPlan utiliza uma modelagem orientada a documentos no **Firebase Cloud Firestore**, otimizada para leituras atômicas e renderização instantânea do plano alimentar completo:

### Coleção `users`
```json
{
  "id": "uuid-v4",
  "email": "atleta@nutriplan.app",
  "name": "Carlos Silva",
  "passwordHash": "$argon2id$v=19$...",
  "role": "USER",
  "isEmailVerified": true,
  "weight": 78.5,
  "height": 178,
  "age": 28,
  "gender": "MALE",
  "activityLevel": "MODERATE",
  "goal": "HYPERTROPHY",
  "hasFoodAllergies": true,
  "allergies": ["Amendoim", "Frutos do mar"],
  "hasFoodIntolerances": false,
  "intolerances": [],
  "experienceLevel": "INTERMEDIATE",
  "trainingFrequencyDays": 5,
  "hasJointPain": "YES",
  "affectedJoints": ["Ombro direito"],
  "createdAt": "2026-10-01T12:00:00Z",
  "updatedAt": "2026-10-02T15:30:00Z"
}
```

### Coleção `diet_plans`
```json
{
  "id": "uuid-v4",
  "userId": "uuid-user-v4",
  "name": "Hipertrofia Limpa - 2800 kcal",
  "isActive": true,
  "days": [
    {
      "id": "uuid-day-1",
      "dayOfWeek": "MONDAY",
      "meals": [
        {
          "id": "uuid-meal-1",
          "name": "Café da Manhã",
          "items": [
            {
              "id": "uuid-item-1",
              "foodItemId": "taco-ovo-cozido",
              "foodName": "Ovo de galinha cozido",
              "quantityGrams": 150,
              "unit": "un",
              "quantityValue": 3
            }
          ]
        }
      ]
    }
  ],
  "updatedAt": "2026-10-02T15:30:00Z"
}
```

### Coleção `routines`
```json
{
  "id": "uuid-v4",
  "userId": "uuid-user-v4",
  "name": "Push / Pull / Legs",
  "isActive": true,
  "days": [
    {
      "id": "uuid-routine-day-1",
      "name": "Treino A - Peito, Ombro e Tríceps",
      "dayOfWeek": "MONDAY",
      "exercises": [
        {
          "id": "uuid-ex-entry-1",
          "exerciseId": "supino-reto-barra",
          "notes": "Foco na fase excêntrica de 3 segundos",
          "sets": [
            { "setNumber": 1, "reps": 10, "weightKg": 80, "restSeconds": 90, "setType": "NORMAL", "rpe": 8 }
          ]
        }
      ]
    }
  ]
}
```

---

## 6. Planejamento de Testes e Estratégia de Integração

A estratégia de testes do NutriPlan adota a **Pirâmide de Testes Tradicional da Engenharia de Software**:

1. **Testes Unitários (Base da Pirâmide):**
   - Foco em funções matemáticas puras, Value Objects e Use Cases isolados.
   - Execução via **Vitest** com emulação de módulos e injeção de dependências falsas (Spies/Mocks).
   - Meta estabelecida de cobertura: $\ge 70\%$ nas camadas de Domínio e Casos de Uso.
2. **Testes de Integração:**
   - Validação dos Pipes de validação (`ValidationPipe`), decoradores personalizados e compatibilidade entre DTOs e entidades.
   - Teste de integração de repositórios com mecanismo de cache local de contingência.
3. **Estratégia de Integração Contínua (CI/CD):**
   - Todo commit enviado ao branch `main` executa a compilação completa do TypeScript e roda a bateria de testes automatizados antes de acionar o deploy automático no servidor de produção Render.
