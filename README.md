# NutriPlan 🥗🏋️‍♂️🎮

Plataforma integrada de planejamento nutricional, periodização de treino com base científica, gamificação Idle RPG (NutriHero) e suporte mobile multiplataforma (Android via Capacitor).

---

## ⚡ Inicialização Rápida (1 Clique no Windows)

- **`iniciar-tudo.bat`** — Inicia o Backend NestJS (porta 3000) e o Frontend React (porta 5173), abrindo o navegador automaticamente.
- **`iniciar-api.bat`** — Inicia exclusivamente a API NestJS.
- **`iniciar-frontend.bat`** — Inicia a aplicação web SPA.
- **`executar-testes.bat`** — Executa a suíte completa de testes automatizados no Vitest.

---

## 🌟 Módulos e Funcionalidades

### 1. 🔐 Autenticação & Perfil Antropométrico
- Autenticação segura com JWT (`24h`), criptografia de senhas com Argon2.
- Cálculo científico da Taxa Metabólica Basal (TMB) pela fórmula de **Mifflin-St Jeor** e Gasto Energético Total (TDEE).
- Mapeamento antropométrico: peso, altura, idade, sexo biológico, percentual de gordura estimado e fator de atividade.
- Rastreamento clínico: histórico de lesões, restrições alimentares e mapa de dores articulares/musculares com escala numérica (0 a 10).

### 2. 🥗 Montador de Dieta & Otimizador Nutricional
- Busca integrada à **Tabela TACO (UNICAMP)** com milhares de alimentos cadastrados.
- Otimizador de Déficit Calórico Sustentável (15% a 25%) conforme diretrizes científicas.
- Cálculo individualizado de meta de fibras pelas DRIs da National Academies (**14g a cada 1.000 kcal**).
- Verificação proativa de alérgenos (glúten, lactose, frutos do mar, soja, amendoim, ovos, etc.).
- Refeições favoritas, calibração de porções práticas e exportação/importação em JSON.

### 3. 🏋️ Montador de Rotinas de Treino
- Catálogo estruturado por agrupamento muscular com prescrição de séries, repetições, carga (kg), tempo de descanso e RPE.
- Técnicas avançadas: Séries Normais, Drop-Set, Rest-Pause, Warm-up, Feeder-Set e Top-Set.
- **Filtro Biomecânico de Segurança:** Alerta e bloqueio de exercícios contraindicados de acordo com as dores e lesões mapeadas no perfil.
- Presets prontos (Push/Pull/Legs, Upper/Lower, Full Body) e exportação em JSON.

### 4. ⚔️ NutriHero RPG & Mascote (Gamificação Integrada)
- Jogo estilo **Idle RPG** onde o progresso no mundo real evolui o personagem:
  - Check-in de treino → Recompensa de Força (+1 STR) e Baú do Titã.
  - Registro de refeições e macros → Recompensa de Agilidade (+1 AGI) e Baú da Dieta.
  - Leitura e quiz sobre artigos científicos → Inteligência (+1 INT) e Baú Arcano.
  - Hidratação diária → Vitalidade e evolução do Mascote NutriPet.
- Combate animado em tempo real contra monstros ultraprocessados, sistema de equipamentos em 6 slots com atributos e raridades, inventário em mochila e abertura de baús.

### 5. 📚 Biblioteca Científica
- Acervo de artigos revisados por pares com síntese metodológica, conclusões práticas e links oficiais para DOI/PubMed.

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia | Detalhes |
|---|---|---|
| **Frontend Web** | React 19 + TypeScript + Vite 8 | Interface moderna SPA reativa |
| **Estilização** | Tailwind CSS v4 | Tema centralizado de design tokens |
| **Gráficos & Ícones** | Recharts + Lucide React | Visualização de dados e consistência estética |
| **Backend API** | NestJS 11 (TypeScript) | Clean Architecture em 4 camadas desacopladas |
| **Persistência** | Google Firebase / Cloud Firestore | Persistência NoSQL com repositórios tipados |
| **Autenticação** | Passport.js + JWT + Argon2 | Tokens seguros sem segredos hardcoded |
| **Mobile** | Capacitor 8 (Android) | Empacotamento nativo Android com Splash e StatusBar |
| **Testes** | Vitest | 31 testes unitários de domínio e regras clínicas |
| **Linter** | Oxlint | Análise estática ultrarrápida de TypeScript/React |

---

## 🏛️ Estrutura do Repositório

```text
nutriplan/
├── api/                        # Backend NestJS (Clean Architecture)
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/           # Autenticação, usuários, perfil e TMB/TDEE
│   │   │   ├── diet/           # Dieta, alimentos TACO, cálculo de macros
│   │   │   ├── workout/        # Treinos, exercícios, séries e segurança
│   │   │   ├── education/      # Artigos científicos e tags
│   │   │   ├── gamification/   # Mascote, hábitos e hidratação
│   │   │   └── idle-game/      # NutriHero RPG, combate, loot e inventário
│   │   └── shared/             # Guards JWT, decorators e Firebase service
│   ├── test/                   # Testes automatizados Vitest
│   └── .env.example
├── web/                        # Frontend React + Vite + Tailwind v4
│   ├── android/                # Projeto nativo Android do Capacitor
│   ├── src/
│   │   ├── api/                # Cliente Axios com interceptors JWT
│   │   ├── components/         # Componentes modulares, UI, diálogos e Navbar
│   │   │   ├── game/           # Arena de batalha, avatar e modais do jogo
│   │   │   └── pet/            # Mascote e rastreador de hidratação
│   │   ├── contexts/           # AuthContext com ciclo de vida de sessão
│   │   ├── pages/              # Dashboard, Dieta, Treino, NutriHero, Perfil
│   │   ├── services/           # Comunicação com backend e fallback
│   │   ├── types/              # Definições estritas de TypeScript
│   │   └── utils/              # Calculadoras metabólicas, segurança e mobile
│   └── capacitor.config.ts
├── docs/                       # Documentação técnica e acadêmica
├── iniciar-tudo.bat            # Script de inicialização completa
├── iniciar-api.bat             # Script para inicializar apenas a API
├── iniciar-frontend.bat        # Script para inicializar apenas o Web
└── executar-testes.bat         # Script para execução da bateria de testes
```

---

## 🧪 Execução de Testes Automatizados

```bash
# Executar todos os testes unitários do backend
cd api
npm run test

# Executar testes com relatório de cobertura
npm run test:cov
```

---

## 📱 Compilação para Android (Capacitor)

```bash
cd web
npm run build
npx cap sync android
npx cap open android
```

---

## 🔒 Segurança e Boas Práticas Implementadas

- **Credenciais Isoladas:** Variáveis de ambiente com `.gitignore` restritivo impedindo vazamento de chaves privadas e credenciais de banco.
- **Validação Estrita:** DTOs com `class-validator` (@Min, @Max, @IsEnum) em todos os endpoints públicos.
- **Sessão Segura:** Limpeza completa de caches no logout e tratamento reativo de expiração HTTP 401.
- **Prevenção de XSS:** Validação por regex em URLs de fontes externas (`https://` ou `http://`).
- **Acessibilidade (WCAG 2.1):** Labels semânticos, touch targets adequados (48x48px), zoom habilitado no viewport móvel e diálogos modais acessíveis via teclado.
