# NutriPlan API 🚀

Servidor backend desenvolvido em **NestJS 11** utilizando princípios de **Clean Architecture**, TypeScript estrito e persistência com **Google Firebase / Cloud Firestore**.

---

## 🏛️ Arquitetura e Módulos

A API segue a separação em camadas concêntricas (Apresentação, Aplicação, Domínio e Infraestrutura):

- **`auth/`** — Gerenciamento de credenciais, registro, login, perfil do usuário, cálculo científico de TMB (Mifflin-St Jeor) e TDEE.
- **`diet/`** — Montagem de dietas, catálogo de alimentos da Tabela TACO (UNICAMP), balanceamento de macronutrientes, exportação/importação em JSON.
- **`workout/`** — Prescrição de rotinas de treino, catálogo de exercícios, registro de séries, repetições, cargas e tempos de descanso.
- **`education/`** — Gerenciamento e pesquisa de artigos científicos revisados por pares e tags temáticas.
- **`gamification/`** — Sistema de hábitos do Mascote NutriPet, registro de hidratação e metas diárias.
- **`idle-game/`** — Mecânicas do NutriHero RPG: atributos derivados, combate contra monstros, tabelas de loot de baús e inventário.

---

## ⚙️ Variáveis de Ambiente (`.env`)

Crie o arquivo `api/.env` com as seguintes chaves:

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=seu_segredo_jwt_seguro_e_longo
JWT_EXPIRES_IN=24h
FIREBASE_PROJECT_ID=nutri-plan-72ad4
```

> **Aviso de Segurança:** Nunca versione arquivos de chave privada (`serviceAccountKey.json`) ou o arquivo `.env`. Eles já estão protegidos pelo `.gitignore`.

---

## 🚀 Execução

```bash
# Instalação de dependências
npm install

# Execução em modo desenvolvimento com hot-reload
npm run start:dev

# Compilação para produção
npm run build

# Execução do build compilado
npm run start:prod
```

---

## 🧪 Testes Automatizados

```bash
# Executar todos os testes unitários
npm run test

# Executar testes em modo watch
npm run test:watch

# Executar relatório de cobertura
npm run test:cov
```

Atualmente a suíte conta com **31 testes unitários** cobrindo entidades de domínio, use cases, cálculo metabólico e calibragem de regras clínicas.

---

## 🛡️ Segurança e Validação

- **Hash de Senhas:** Argon2id com parâmetros de alto custo de memória e tempo.
- **Autenticação:** Passport JWT com expiração de 24h e extração de payload seguro.
- **Validação de Payload:** `ValidationPipe` global com `class-validator` (@Min, @Max, @IsEnum, @IsNotEmpty).
- **Tratamento de I/O:** Persistência assíncrona baseada em Promises para evitar bloqueio da event loop do Node.js.
