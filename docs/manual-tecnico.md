# NutriPlan — Manual Técnico de Arquitetura e Engenharia
**Versão:** 1.0.0 — Documentação Técnica para Desenvolvedores e Avaliadores  

---

## 1. Visão Geral da Arquitetura

O NutriPlan é uma aplicação backend estruturada em **Clean Architecture (Onion Architecture)** utilizando o framework **NestJS** (TypeScript).

### 1.1 Camadas do Sistema

1. **Domain Layer (`src/modules/*/domain/`):**
   - Contém entidades puras, objetos de valor (Value Objects) e serviços de domínio.
   - **Zero dependências** de bibliotecas de terceiros ou frameworks (isento de NestJS, Prisma, Express).
2. **Application Layer (`src/modules/*/application/`):**
   - Contém os casos de uso (*Use Cases*) que orquestram a execução das regras de negócio.
   - Declara as portas de entrada e saída (*Ports / Interfaces*) para persistência e serviços externos.
3. **Infrastructure Layer (`src/modules/*/infrastructure/`):**
   - Implementa os adaptadores de repositório via **Prisma ORM**, estratégias de autenticação Passport JWT e hashing Argon2.
4. **Presentation Layer (`src/modules/*/presentation/`):**
   - Expõe controladores REST HTTP com validação automática via `class-validator` / `ValidationPipe` e contratos Swagger OpenAPI.

---

## 2. Instruções de Compilação, Testes e Execução

### 2.1 Pré-requisitos
- Node.js 20+
- PostgreSQL 16 (ou via Docker Compose)

### 2.2 Variáveis de Ambiente (`.env`)
```ini
DATABASE_URL="postgresql://nutriplan:nutriplan123@localhost:5432/nutriplan?schema=public"
JWT_SECRET="nutriplan-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=3000
```

### 2.3 Comandos do Ciclo de Desenvolvimento
```bash
# Instalação de dependências
npm install

# Geração dos clientes Prisma
npx prisma generate

# Execução das migrações de banco
npx prisma migrate dev --name init

# Carga de dados inicial (Seed TACO + Exercícios + Artigos)
npx ts-node prisma/seed.ts

# Execução dos testes unitários
npm test

# Execução dos testes com relatório de cobertura (v8)
npm run test:cov

# Compilação para produção
npm run build

# Inicialização da API em desenvolvimento
npm run start:dev
```

---

## 3. Endpoints da API REST (OpenAPI / Swagger)

Após iniciar a aplicação, a documentação interativa Swagger está acessível em `http://localhost:3000/api`.

### 3.1 Autenticação (`/auth`)
- `POST /auth/register` — Cadastra novo usuário.
- `POST /auth/login` — Autentica e retorna tokens JWT de acesso e refresh.
- `GET /auth/profile` — Obtém perfil antropométrico e cálculos de TMB/TDEE (Requer JWT).
- `PATCH /auth/profile` — Atualiza dados corporais e metas (Requer JWT).

### 3.2 Dieta e Alimentos (`/foods`, `/diet-plans`)
- `GET /foods/search?q=arroz&limit=20` — Busca textual em base TACO (Requer JWT).
- `GET /foods/:id` — Detalhes nutricionais do alimento (Requer JWT).
- `POST /diet-plans` — Criação de plano alimentar com cálculo de macros (Requer JWT).
- `GET /diet-plans` — Lista planos do usuário autenticado (Requer JWT).
- `GET /diet-plans/:id` — Consulta plano com macronutrientes calculados (Requer JWT).
- `GET /diet-plans/:id/export` — Exportação de plano alimentar em JSON (Requer JWT).
- `POST /diet-plans/import` — Importação de plano a partir de JSON estruturado (Requer JWT).
- `DELETE /diet-plans/:id` — Exclusão de plano (Requer JWT).

### 3.3 Treino e Exercícios (`/exercises`, `/routines`)
- `GET /exercises?muscleGroup=CHEST` — Catálogo de exercícios filtrado por agrupamento muscular (Requer JWT).
- `GET /exercises/:id` — Detalhes do exercício (Requer JWT).
- `POST /routines` — Criação de rotina de treino com dias, séries e RPE (Requer JWT).
- `GET /routines` — Lista rotinas cadastradas pelo usuário (Requer JWT).
- `GET /routines/:id` — Detalhes da rotina com cálculo de volume (Requer JWT).
- `GET /routines/:id/export` — Exportação de rotina em JSON (Requer JWT).
- `POST /routines/import` — Importação de rotina via JSON (Requer JWT).
- `DELETE /routines/:id` — Exclusão de rotina (Requer JWT).

### 3.4 Educação Científica (`/articles`)
- `GET /articles?tag=Nutrição&page=1&limit=10` — Lista artigos científicos com resumos e links (Público).
- `GET /articles/:id` — Consulta artigo por identificador (Público).
- `POST /articles` — Cadastro de novos artigos e tags (Restrito a `role: ADMIN`).
