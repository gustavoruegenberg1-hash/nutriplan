# NutriPlan 🥗🏋️‍♂️🎮
**Sistema Integrado de Nutrição Científica, Periodização de Treino, Gamificação RPG e Conexão com Profissionais de Saúde**

> **Instituição:** Faculdade de Tecnologia de Campinas (FATEC Campinas)  
> **Curso:** Curso Superior de Tecnologia em Análise e Desenvolvimento de Sistemas (5º ADS Noturno - 2.2026)  
> **Disciplina:** Laboratório de Engenharia de Software (LES)  
> **Professor / Avaliador:** Prof. Dr. Fernando Brandão  

---

## 📚 Documentação Formal de Engenharia de Software (Fases LES)

Toda a documentação formal exigida nas diretrizes da disciplina encontra-se dividida e detalhada nos seguintes documentos:

| Fase / Documento | Descrição e Conteúdo Principal | Link |
| :--- | :--- | :--- |
| **Fase 1** | **Processo e Planejamento:** Definição do problema, justificativa científica, stakeholders, modelo de processo Scrum Adaptado / Incremental, cronograma de 10 semanas, riscos e critérios de qualidade ISO/IEC 25010. | [fase-1-processo-planejamento.md](docs/fase-1-processo-planejamento.md) |
| **Fase 2** | **Engenharia de Requisitos:** Elicitação, SRS completo (RF01 a RF24, RNF01 a RNF08, RN01 a RN08), modelagem de processos BPMN, diagrama de casos de uso UML, matriz de rastreabilidade bidirecional e controle formal de mudanças (CR-01 a CR-05). | [docs/fase-2-engenharia-requisitos.md](docs/fase-2-engenharia-requisitos.md) |
| **Fase 3** | **Análise, Arquitetura e Projeto:** Clean Architecture em 4 camadas, tabela de Design Patterns (GoF e DDD), diagramas de classes de domínio UML, diagramas de sequência e atividade, modelo NoSQL Firestore e planejamento de testes. | [docs/fase-3-arquitetura-projeto.md](docs/fase-3-arquitetura-projeto.md) |
| **Fase 4** | **Implementação e Testes:** Visão geral da implementação em TypeScript, evidências de **52 testes automatizados** passando com 100% de sucesso no Vitest, cobertura v8 e relatório de defeitos corrigidos (BUG-01 a BUG-08). | [docs/fase-4-implementacao-testes.md](docs/fase-4-implementacao-testes.md) |
| **Fase 5** | **Implantação e Encerramento:** Topologia em nuvem Render Cloud (`render.yaml`), Docker Compose, esteira de CI/CD, variáveis de ambiente, roteiro de homologação e relatório final com análise crítica e lições aprendidas. | [docs/fase-5-implantacao-encerramento.md](docs/fase-5-implantacao-encerramento.md) |
| 📖 **Manual do Usuário** | Guia ilustrado passo a passo para o usuário final operando todas as telas e fluxos do sistema. | [docs/manual-do-usuario.md](docs/manual-do-usuario.md) |
| ⚙️ **Manual Técnico** | Guia aprofundado para engenheiros e avaliadores, cobrindo compilação, persistência e catálogo Swagger OpenAPI. | [docs/manual-tecnico.md](docs/manual-tecnico.md) |

---

## ⚡ Inicialização Rápida (1 Clique no Windows)

Para facilitar a avaliação da banca, o repositório conta com scripts automatizados de inicialização direta:

- **`iniciar-tudo.bat`** — Inicia a API NestJS (porta 3000) e o Frontend React (porta 5173), abrindo o navegador automaticamente em `http://localhost:5173`.
- **`iniciar-api.bat`** — Inicia exclusivamente o backend NestJS.
- **`iniciar-frontend.bat`** — Inicia exclusivamente a aplicação web SPA.
- **`executar-testes.bat`** — Executa a suíte completa de **52 testes unitários** no Vitest.

---

## 🌟 Módulos e Funcionalidades do Sistema

### 1. 🔐 Autenticação Segura & Perfil Clínico
- Autenticação por credenciais com hashing criptográfico **Argon2id** ou ágil via **Google OAuth 2.0**.
- Ativação de conta com código transacional de 6 dígitos via **Resend API**.
- Sessão de longa duração (**30 dias**) para evitar deslogues acidentais por suspensão de contêineres na nuvem.
- Cálculo da Taxa Metabólica Basal (**TMB**) pela equação de **Mifflin-St Jeor** e Gasto Calórico Total Diário (**TDEE**).
- Anamnese clínica estruturada: mapa de dores articulares e histórico de lesões com escala de dor (0 a 10) e nível consolidado de experiência.

### 2. 🥗 Planejador de Dieta & Otimizador Nutricional
- Busca instantânea na base oficial de alimentos da **Tabela TACO (UNICAMP)**.
- Otimizador de Déficit Calórico Sustentável (15% a 25%) para perda de gordura preservando massa magra.
- Meta de fibras individualizada conforme DRIs da National Academies (**14g a cada 1.000 kcal**).
- **Verificação Proativa de Alérgenos:** Diálogo modal *in-page* na primeira adição e alertas para glúten, lactose, frutos do mar, soja, amendoim e ovos.
- Exportação e importação completa de planos alimentares em formato JSON.

### 3. 🏋️ Periodizador de Treino & Segurança Biomecânica
- Catálogo de exercícios categorizado por agrupamentos musculares (Peito, Costas, Pernas, Ombros, Braços, Abdômen).
- Prescrição técnica completa: séries, repetições alvo, carga em kg, tempo de descanso e **RPE** (Percepção Subjetiva de Esforço de 1 a 10).
- **Filtro Biomecânico de Segurança:** Bloqueia e emite alertas vermelhos para exercícios contraindicados para articulações com dor ativa reportada no perfil do usuário.
- Presets prontos (*Push/Pull/Legs*, *Upper/Lower*, *Full Body*) e exportação/importação em JSON.

### 4. 💧 Hábitos Saudáveis & Mascote de Hidratação (NutriPet)
- Meta de hidratação calculada matematicamente pelo peso corporal (35 ml / kg).
- Registro rápido de ingestão hídrica (+250 ml e +500 ml).
- Mascote virtual que reage com animações e humor conforme o usuário cumpre a meta de água.

### 5. ⚔️ Gamificação RPG Integrada (NutriHero)
- Jogo estilo **Idle RPG** onde os hábitos reais do usuário geram atributos virtuais:
  - Check-in de treino concluído → +1 Força (STR) e Baú do Titã.
  - Metas da dieta atingidas → +1 Agilidade (AGI) e Baú da Dieta.
  - Meta diária de água cumprida → +1 Vitalidade (VIT) e regeneração do herói.
- Combate em tempo real contra monstros ultraprocessados.
- Inventário com 6 slots de equipamentos (Elmo, Armadura, Arma, Escudo, Botas, Anel) e **Forja de Fusão** de itens.

### 6. 🩺 Conexão com Profissionais de Saúde
- Catálogo de Nutricionistas (CRN) e Treinadores (CREF) credenciados.
- Prontuário clínico compartilhado com autorização do paciente.
- Chat seguro em tempo real para orientações e ajustes de prescrição.

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia | Detalhes |
| :--- | :--- | :--- |
| **Frontend Web** | React 19 + TypeScript + Vite 8 | Single Page Application reativa de alta performance |
| **Estilização** | Tailwind CSS v4 | Design tokens padronizados e interface responsiva (PWA) |
| **Visualização** | Recharts + Lucide React | Gráficos de macronutrientes, TDEE e ícones consistentes |
| **Backend API** | NestJS 12 (TypeScript) | Clean Architecture em 4 camadas desacopladas |
| **Persistência** | Google Cloud Firestore | NoSQL gerenciado em nuvem com fallback em cache local |
| **Autenticação** | Passport.js + JWT (30d) + Argon2id | Autenticação robusta e integração Google Identity |
| **E-mails Transacionais** | Resend API | Envio seguro de códigos de verificação de conta |
| **Testes Automatizados** | Vitest v4.1.11 | 52 testes unitários e de domínio com cobertura v8 |
| **Cloud Hosting** | Render Cloud (`render.yaml`) | Blueprint de IaC com auto-deploy contínuo da branch main |

---

## 🧪 Execução de Testes Automatizados

```bash
cd api

# Executar a bateria de 52 testes automatizados
npm test

# Executar testes com relatório completo de cobertura v8
npm run test:cov
```

---

## 🏛️ Estrutura do Repositório

```text
nutriplan/
├── api/                        # Backend NestJS (Clean Architecture)
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/           # Autenticação, perfis clínicos, TMB/TDEE e Google OAuth
│   │   │   ├── diet/           # Tabela TACO, montador de dietas, alérgenos e macros
│   │   │   ├── workout/        # Catálogo de exercícios, rotinas e segurança biomecânica
│   │   │   ├── gamification/   # Mascote de hidratação e rastreador de hábitos
│   │   │   ├── idle-game/      # NutriHero RPG, combate idle, loot e forja de itens
│   │   │   └── professionals/  # Conexão profissional, prontuário e chat de consulta
│   │   └── shared/             # Guards JWT, decorators, Firebase e Resend Mail
│   ├── test/                   # Bateria de testes unitários Vitest
│   ├── Dockerfile              # Imagem Docker multi-estágio da API
│   └── .env.example
├── web/                        # Frontend React 19 + Vite 8 + Tailwind CSS v4
│   ├── src/
│   │   ├── api/                # Cliente Axios com interceptors JWT e auto-recovery
│   │   ├── components/         # Diálogos acessíveis, modais de alérgenos e navbar
│   │   ├── contexts/           # AuthContext com ciclo de vida e persistência de 30 dias
│   │   ├── pages/              # Dashboard, Dieta, Treino, Hábitos, NutriHero, Profissionais
│   │   └── services/           # Comunicação com a API REST
│   ├── Dockerfile              # Imagem Docker com Nginx para produção
│   └── nginx.conf              # Regras de rewrite SPA para Nginx
├── docs/                       # Documentação formal completa FATEC LES (Fases 1 a 5)
├── render.yaml                 # Blueprint declarativo de nuvem para a plataforma Render
├── docker-compose.yml          # Orquestrador local multi-container (API + Web)
├── iniciar-tudo.bat            # Script de inicialização completa automatizada
├── iniciar-api.bat             # Script para inicializar apenas o backend
├── iniciar-frontend.bat        # Script para inicializar apenas o frontend
└── executar-testes.bat         # Script para execução dos 52 testes automatizados
```

---

## 🔒 Segurança e Boas Práticas

- **Proteção Criptográfica:** Senhas processadas exclusivamente com algoritmo Argon2id com parâmetros resistentes a GPU e rainbow tables.
- **Validação Estrita:** DTOs com `class-validator` (@Min, @Max, @IsEnum, @IsEmail) protegidos por `ValidationPipe(whitelist: true, forbidNonWhitelisted: true)`.
- **Prevenção de XSS e Injeções:** Sanitização rigorosa de entradas de formulário e URLs externas.
- **Resiliência Offline-First:** Repositórios Firestore projetados com camada de cache local para funcionamento ininterrupto mesmo em contingências de rede.
