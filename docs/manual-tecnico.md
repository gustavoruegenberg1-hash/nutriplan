# NutriPlan — Manual Técnico de Arquitetura e Engenharia
**Projeto:** NutriPlan — Sistema Integrado de Nutrição, Treino e Gamificação RPG  
**Instituição:** FATEC Campinas — Curso Superior de Tecnologia em Análise e Desenvolvimento de Sistemas (5º ADS Noturno - 2.2026)  
**Disciplina:** Laboratório de Engenharia de Software (LES)  
**Versão:** 2.0.0 — 2026-10-02  

---

## 1. Visão Geral da Arquitetura e Tecnologias

O **NutriPlan** é composto por uma arquitetura distribuída moderna desacoplada em backend RESTful construído em **NestJS 12** com **TypeScript** e frontend SPA/PWA construído em **React 19** com **Vite 8** e **Tailwind CSS v4**.

### 1.1 Camadas da Clean Architecture (Backend)

O backend segue rigorosamente a **Clean Architecture (Onion Architecture)**, isolando o núcleo de regras de negócio de frameworks e serviços externos:

1. **Domain Layer (`src/modules/*/domain/`):**
   - Contém entidades ricas (`UserEntity`, `DietPlanEntity`, `RoutineEntity`, `PetEntity`, `HeroEntity`, `ProfessionalEntity`), objetos de valor imutáveis (`MacroNutrients`) e serviços de domínio puros (`MacroCalculatorService`, `IdleCombatService`, `LootService`).
   - **Zero dependências** de bibliotecas de terceiros ou frameworks (isento de NestJS, Express ou Firestore SDK).
2. **Application Layer (`src/modules/*/application/`):**
   - Contém os casos de uso (*Use Cases*) que orquestram a execução dos fluxos do sistema (e.g., `RegisterUseCase`, `LoginUseCase`, `CreateDietPlanUseCase`, `ConnectProfessionalUseCase`).
   - Declara as portas de entrada e saída (*Ports / Interfaces*) para repositórios e serviços de mensageria externa.
3. **Infrastructure Layer (`src/modules/*/infrastructure/`):**
   - Implementa os adaptadores de repositório conectando-se ao **Google Cloud Firestore** com camada de cache resiliente em disco local (`.cache/*.json`), estratégias Passport JWT, validação de tokens Google OAuth 2.0 e disparo de e-mails via SDK Resend.
4. **Presentation Layer (`src/modules/*/presentation/`):**
   - Controladores REST HTTP (`AuthController`, `DietController`, `WorkoutController`, `GamificationController`, `IdleGameController`, `ProfessionalsController`), DTOs fortemente tipados com decorators do `class-validator` e documentação automática Swagger OpenAPI.

---

## 2. Instruções de Instalação, Compilação e Execução

### 2.1 Pré-requisitos de Ambiente
- **Node.js:** Versão 20.x ou 22.x LTS instalada.
- **Gerenciador de Pacotes:** npm (v10+).
- **Sistema Operacional:** Windows 10/11, Linux (Ubuntu/Debian) ou macOS.

### 2.2 Variáveis de Ambiente da API (`api/.env`)
Crie o arquivo `api/.env` com base no arquivo `.env.example`:

```ini
# Configuração do Servidor
PORT=3000
NODE_ENV=development

# Autenticação e Segurança
JWT_SECRET=nutriplan-super-secret-jwt-key-for-fatec-les-2026
JWT_EXPIRES_IN=30d

# Google OAuth 2.0 (Opcional para homologação local)
GOOGLE_CLIENT_ID=663037343222-5uissbggo7s0qkuv9522l5j39hph52tl.apps.googleusercontent.com

# Firebase Cloud Firestore (Opcional - se omitido, ativa cache local resiliente)
# FIREBASE_PROJECT_ID=nutriplan-fatec
# FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}

# Resend API (Opcional - se omitido, exibe códigos no console da API)
# RESEND_API_KEY=re_123456789
```

### 2.3 Variáveis de Ambiente do Frontend (`web/.env`)
Crie o arquivo `web/.env`:

```ini
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=663037343222-5uissbggo7s0qkuv9522l5j39hph52tl.apps.googleusercontent.com
```

### 2.4 Comandos do Ciclo de Desenvolvimento

#### Execução Rápida via Scripts Automatizados (Windows):
- [iniciar-tudo.bat](file:///C:/Users/Gustavo/Projetos/nutriplan/iniciar-tudo.bat) — Sobe a API na porta 3000, o Frontend na porta 5173 e abre o navegador.
- [iniciar-api.bat](file:///C:/Users/Gustavo/Projetos/nutriplan/iniciar-api.bat) — Sobe exclusivamente o backend NestJS.
- [iniciar-frontend.bat](file:///C:/Users/Gustavo/Projetos/nutriplan/iniciar-frontend.bat) — Sobe exclusivamente a SPA React.
- [executar-testes.bat](file:///C:/Users/Gustavo/Projetos/nutriplan/executar-testes.bat) — Executa a suíte completa de testes no Vitest.

#### Comandos Manuais no Terminal:
```bash
# 1. Instalação de Dependências
cd api && npm install
cd ../web && npm install

# 2. Execução da Suíte de Testes Automatizados (52 testes)
cd ../api
npm test

# 3. Execução de Testes com Relatório de Cobertura (v8)
npm run test:cov

# 4. Inicialização do Backend em Modo Watch (Desenvolvimento)
npm run start:dev

# 5. Inicialização do Frontend Web
cd ../web
npm run dev
```

---

## 3. Persistência de Dados e Cache Resiliente

O NutriPlan utiliza o **Google Firebase Cloud Firestore** como banco de dados NoSQL distribuído. Para garantir máxima resiliência e permitir execução offline ou em ambientes de avaliação sem credenciais em nuvem, foi implementado o padrão **Resilient Repository with Disk Fallback**:

- **Coleções Principais:**
  - `users`: Credenciais criptografadas (Argon2id), perfil antropométrico, dores, restrições e flag de validação de e-mail.
  - `diet_plans`: Planos alimentares, dias da semana, refeições e gramaturas de alimentos TACO.
  - `workout_routines`: Rotinas de treino, dias A/B/C, exercícios, séries, cargas e RPE.
  - `pets`: Mascote virtual de hidratação, nível, humor e histórico de consumo de água.
  - `heroes`: Personagem RPG NutriHero, atributos (STR, AGI, INT, VIT), equipamentos e inventário.
  - `professionals`: Catálogo de nutricionistas (CRN) e treinadores (CREF), prontuários e mensagens de consulta.
- **Comportamento em Falha de Nuvem:**
  Se o `FirebaseAdminService` não identificar credenciais válidas ou se a conexão de rede oscilar, os repositórios chaveiam transparentemente para persistência local em arquivos JSON estruturados no diretório `api/.cache/`, emitindo logs informativos no console e mantendo 100% da funcionalidade do sistema ativa.

---

## 4. Catálogo de Endpoints REST (Swagger OpenAPI)

A documentação interativa OpenAPI 3.0 é acessível em tempo de execução na rota:  
👉 **`http://localhost:3000/api`**

### 4.1 Módulo de Autenticação (`/auth`)
- `POST /auth/register` — Cadastra novo usuário com senha criptografada via Argon2id.
- `POST /auth/verify-email` — Confirma código transacional de 6 dígitos enviado por e-mail.
- `POST /auth/login` — Autentica por e-mail e senha, retornando token JWT (validade de 30 dias).
- `POST /auth/google` — Autentica ou cadastra usuário via token Google Identity OAuth 2.0.
- `GET /auth/profile` — Obtém perfil antropométrico e cálculos de TMB/TDEE (Requer JWT).
- `PATCH /auth/profile` — Atualiza dados antropométricos, metas e dores articulares (Requer JWT).

### 4.2 Módulo de Alimentos e Dietas (`/foods`, `/diet-plans`)
- `GET /foods/search?q={termo}&limit=20` — Busca textual eficiente no catálogo TACO (Requer JWT).
- `GET /foods/:id` — Retorna composição nutricional completa por 100g de alimento (Requer JWT).
- `POST /diet-plans` — Cria ou atualiza plano alimentar com cálculo de macros e fibras (Requer JWT).
- `GET /diet-plans` — Lista planos alimentares do usuário (Requer JWT).
- `GET /diet-plans/:id` — Consulta plano com cálculo de macros agregado por refeição (Requer JWT).
- `GET /diet-plans/:id/export` — Exporta o plano completo em formato JSON estruturado (Requer JWT).
- `POST /diet-plans/import` — Importa plano a partir de arquivo JSON estruturado (Requer JWT).
- `DELETE /diet-plans/:id` — Exclui um plano alimentar cadastrado (Requer JWT).

### 4.3 Módulo de Exercícios e Treinos (`/exercises`, `/routines`)
- `GET /exercises?muscleGroup={grupo}` — Catálogo de exercícios filtrado por agrupamento (Requer JWT).
- `GET /exercises/:id` — Detalhes, contraindicações e execução do exercício (Requer JWT).
- `POST /routines` — Cria nova rotina com dias, exercícios, séries e RPE (Requer JWT).
- `GET /routines` — Lista rotinas cadastradas pelo usuário (Requer JWT).
- `GET /routines/:id` — Consulta rotina com cálculo de tonelagem/volume semanal (Requer JWT).
- `GET /routines/:id/export` — Exporta rotina em formato JSON estruturado (Requer JWT).
- `POST /routines/import` — Importa rotina via JSON estruturado (Requer JWT).
- `DELETE /routines/:id` — Exclui rotina cadastrada (Requer JWT).

### 4.4 Módulo de Gamificação e Hábitos (`/gamification`)
- `GET /gamification/pet` — Retorna estado atual do Mascote NutriPet e nível de hidratação (Requer JWT).
- `POST /gamification/water` — Registra ingestão hídrica em mililitros (+250ml ou +500ml) (Requer JWT).
- `GET /gamification/habits` — Retorna checklist de hábitos saudáveis do dia (Requer JWT).

### 4.5 Módulo NutriHero RPG (`/idle-game`)
- `GET /idle-game/hero` — Consulta atributos do herói, inventário e itens equipados (Requer JWT).
- `POST /idle-game/combat` — Executa turno de combate automático contra monstro (Requer JWT).
- `POST /idle-game/chest/open` — Abre baú obtido através de hábitos saudáveis (Requer JWT).
- `POST /idle-game/inventory/fuse` — Funde 3 itens de mesma raridade na forja (Requer JWT).

### 4.6 Módulo de Profissionais de Saúde (`/professionals`)
- `GET /professionals` — Lista profissionais cadastrados (Nutricionistas e Treinadores) (Requer JWT).
- `GET /professionals/:id` — Exibe dados, biografia e registro do profissional (Requer JWT).
- `POST /professionals/connect` — Solicita conexão e acompanhamento clínico (Requer JWT).
- `GET /professionals/consultations` — Lista consultas e orientações ativas (Requer JWT).
- `POST /professionals/messages` — Envia mensagem no chat de acompanhamento seguro (Requer JWT).

---

## 5. Medidas de Segurança e Confiabilidade

1. **Criptografia de Senhas com Argon2id:** Resistência avançada contra ataques de força bruta e GPU/ASIC em comparação com algoritmos legados (Bcrypt/MD5).
2. **Ciclo de Vida de Sessão Seguro (30 dias):** Token assinado criptograficamente com expiração de 30 dias (`JWT_EXPIRES_IN=30d`), eliminando o deslogue frequente gerado por dormência de contêineres na nuvem.
3. **Validação Estrita de Entrada:** `ValidationPipe` do NestJS configurado com `whitelist: true` e `forbidNonWhitelisted: true`, rejeitando qualquer propriedade não declarada nos DTOs.
4. **Isolamento de Segredos:** Todas as chaves e credenciais sensíveis são carregadas exclusivamente via variáveis de ambiente com `.gitignore` preventivo.
