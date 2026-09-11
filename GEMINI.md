# NutriPlan — Project Rules & Guidelines

Este arquivo define as diretrizes arquiteturais, padrões de código e boas práticas que o assistente **Antigravity** e desenvolvedores devem seguir estritamente neste projeto.

---

## 🏛️ 1. Arquitetura (Clean Architecture & Modular Monolith)

O backend segue o padrão **Clean Architecture** em 4 camadas estritas por módulo funcional (`auth`, `diet`, `workout`, `education`):

1. **Camada de Domínio (`src/modules/*/domain/`):**
   - **Regra de Ouro:** **ZERO dependências** de frameworks ou bibliotecas de terceiros (isento de `@nestjs/*`, `@prisma/*`, Express).
   - **Entidades:** Classes puras representando conceitos de negócio (e.g., `UserEntity`, `DietPlan`, `Routine`).
   - **Value Objects:** Objetos imutáveis com métodos de operação e validação matemática (e.g., `MacroNutrients`).
   - **Domain Services:** Serviços puros para cálculos complexos ou que cruzam entidades (e.g., `MacroCalculatorService` com fórmulas de TMB e TDEE).

2. **Camada de Aplicação (`src/modules/*/application/`):**
   - **Use Cases:** Cada caso de uso deve ter responsabilidade única (e.g., `CreateDietPlanUseCase`, `LoginUseCase`).
   - **Ports (Interfaces):** Todas as operações de persistência e serviços externos devem ser declaradas como interfaces TypeScript (`IUserRepository`, `IFoodRepository`, etc.).

3. **Camada de Infraestrutura (`src/modules/*/infrastructure/`):**
   - Implementações concretas dos Ports usando **Prisma ORM**, autenticação Passport JWT e hashing Argon2.
   - Mapeamento bidirecional seguro entre modelos do Prisma e entidades de domínio via mappers estáticos (`fromPrisma`).

4. **Camada de Apresentação (`src/modules/*/presentation/`):**
   - Controladores REST HTTP com injeção de dependência via tokens (`@Inject('FOOD_REPOSITORY')`).
   - Contratos DTO obrigatórios com validação estrita via `class-validator` e documentação OpenAPI via `@nestjs/swagger`.
   - Segurança: Rotas protegidas devem usar `@UseGuards(JwtAuthGuard)` e decorador `@CurrentUser()`.

---

## 💻 2. Padrões de Código e TypeScript

- **TypeScript Estrito:** Evitar o uso de `any` em entidades e contratos públicos; tipar explicitamente parâmetros e retornos.
- **Injeção de Dependências:** Módulos devem vincular portas e adaptadores via `{ provide: 'NOME_REPOSITORY', useClass: PrismaNomeRepository }`.
- **Tratamento de Exceções:** Lançar exceções HTTP semânticas do NestJS (`NotFoundException`, `UnauthorizedException`, `BadRequestException`, `ForbiddenException`).
- **Sistema Operacional:** O ambiente local é **Windows (PowerShell)**. Não encadear comandos com `&&`; utilizar ponto e vírgula `;` ou quebras de linha.

---

## 🧪 3. Qualidade e Testes Automatizados

- **Test Runner:** Utilizar **Vitest** com sintaxe nativa (`describe`, `it`, `expect`, `vi.fn()`).
- **Testes Unitários:** Todos os Value Objects, Domain Services e Use Cases devem possuir cobertura de testes unitários isolados com mocks de repositórios.
- **Meta de Cobertura:** Manter cobertura mínima de **$\ge 70\%$** em declarações, funções e linhas das camadas `domain/` e `application/`.
- **Regra de Verificação:** Sempre executar `npm test` ao criar ou refatorar funcionalidades antes de finalizar a tarefa.

---

## 🗄️ 4. Banco de Dados e Migrações (Prisma & PostgreSQL)

- O banco oficial de dados é **PostgreSQL 16** (hospedado no Neon ou via contêiner Docker).
- **Integridade:** Manter integridade referencial estrita (`onDelete: Cascade` para relações compostas pai-filho).
- **Idempotência:** Scripts de carga (`seed.ts`) devem ser sempre idempotentes, limpando e recarregando os dados sem duplicar registros ou quebrar constraints.
- **Segurança:** Nunca versionar credenciais confidenciais no Git; manter modelos de referência no `.env.example`.
