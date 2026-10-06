# Manual Técnico de Implantação e Manutenção - NutriPlan v2

Este documento descreve detalhadamente a infraestrutura, dependências, procedimentos de implantação, banco de dados, execução e manutenção do sistema **NutriPlan v2**.

---

## 1. Requisitos de Ambiente e Dependências

### 1.1. Pré-requisitos de Sistema Operacional
* **Sistemas Suportados:** Microsoft Windows (10/11), Linux (Ubuntu 22.04+, Debian, Fedora, Arch) e macOS (macOS 13+ Ventura ou superior).
* **Processador:** Arquitetura x86_64 ou ARM64 (Apple Silicon).
* **Memória RAM Mínima:** 4 GB de memória RAM (8 GB recomendados).
* **Armazenamento:** Mínimo de 1 GB de espaço livre em disco para dependências do `node_modules` e dados locais.

### 1.2. Ferramentas de Linha de Comando (CLI)
* **Node.js:** Versão `>= 22.0.0` (recomendado: Node.js 24 LTS, que inclui nativamente o módulo relacional `node:sqlite`).
* **npm:** Versão `>= 10.0.0`.
* **Git:** Versão `>= 2.30.0`.

---

## 2. Topologia do Repositório (Monorepo Estruturado)

O projeto está organizado em duas aplicações complementares e desacopladas:

```
nutriplan-v2/
├── api/                           # Backend RESTful em NestJS 12
│   ├── local-cache/               # Sementes oficiais locais (744 alimentos TACO, 128 exercícios)
│   │   ├── foods.json
│   │   └── exercises.json
│   ├── src/
│   │   ├── database/              # Conexão SQLite nativa, DDL das 17 tabelas e Seeder
│   │   ├── modules/
│   │   │   ├── auth/              # Autenticação, Bcrypt e JWT Guards
│   │   │   ├── nutrition/         # Motor de cálculo Mifflin-St Jeor, TDEE e proporções
│   │   │   ├── profile/           # Gestão de perfil biométrico e pesagens
│   │   │   ├── foods/             # Catálogo TACO e simulador proporcional
│   │   │   ├── diets/             # Gestão de dietas, refeições e gerador assistido
│   │   │   ├── workouts/          # Fichas de treino e histórico imutável (RN24)
│   │   │   └── dashboard/         # Consolidação agregada para o painel
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── test/                      # Testes e2e adicionais
│   ├── package.json
│   ├── tsconfig.json
│   └── vitest.config.ts
├── web/                           # Frontend Responsivo em React 19 + Vite + Tailwind v4
│   ├── src/
│   │   ├── api/                   # Cliente Axios configurado com interceptors
│   │   ├── components/            # Componentes reutilizáveis (Navbar, BottomNav, ProtectedRoute)
│   │   ├── contexts/              # Contexto de Autenticação com persistência em localStorage
│   │   ├── pages/                 # Telas da aplicação (Dashboard, DietPlanner, WorkoutPlanner, etc.)
│   │   ├── types/                 # Interfaces e definições de tipos TypeScript
│   │   ├── App.tsx                # Configuração do roteador react-router-dom v7
│   │   ├── main.tsx
│   │   └── index.css              # Configurações do Tailwind CSS v4
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── iniciar.bat                    # Script de inicialização simultânea (Windows)
├── iniciar-api.bat                # Script de inicialização da API (Windows)
├── iniciar-web.bat                # Script de inicialização do Frontend (Windows)
├── ARQUITETURA.md                 # Documento formal de arquitetura
├── BANCO_DE_DADOS.md              # Documento do Modelo Entidade-Relacionamento
├── REQUISITOS.md                  # Especificação dos 34 RFs e 10 RNFs
├── REGRAS_DE_NEGOCIO.md           # Especificação das 27 Regras de Negócio
├── MATRIZ_RASTREABILIDADE.md      # Matriz bidirecional de rastreabilidade
├── DOCUMENTACAO.md                # Visão geral de Engenharia de Software
├── API.md                         # Especificação completa de rotas e payloads
├── TESTES.md                      # Plano e relatório de testes automatizados
├── MANUAL_USUARIO.md              # Manual de operação do usuário final
└── MANUAL_TECNICO.md              # Este manual de implantação e manutenção
```

---

## 3. Configuração de Variáveis de Ambiente

### 3.1. Backend (`api/.env`)
Crie ou verifique o arquivo `.env` dentro da pasta `api`:
```env
PORT=3000
DATABASE_URL=./nutriplan.sqlite
JWT_SECRET=super_secret_jwt_key_nutriplan_v2_academic_safe
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

### 3.2. Frontend (`web/.env`)
Crie ou verifique o arquivo `.env` dentro da pasta `web`:
```env
VITE_API_URL=http://localhost:3000
```

---

## 4. Procedimentos de Instalação Passo a Passo

### 4.1. Clonagem ou Navegação até a Pasta Raiz
```bash
cd C:\Users\Gustavo\Projetos\nutriplan-v2
```

### 4.2. Instalação de Dependências do Backend (`api`)
```bash
cd api
npm install
cd ..
```

### 4.3. Instalação de Dependências do Frontend (`web`)
```bash
cd web
npm install
cd ..
```

---

## 5. Inicialização e Execução do Sistema

### 5.1. Inicialização Rápida no Windows (Recomendada)
Basta dar um duplo clique no arquivo:
```
iniciar.bat
```
Ou executar no terminal:
```powershell
.\iniciar.bat
```
O script abrirá duas janelas de console dedicadas:
1. Uma janela para o servidor **NestJS** na porta `3000`.
2. Uma janela para o servidor **Vite / React** na porta `5173`.

### 5.2. Inicialização Manual via Terminal

**Terminal 1 (Backend - API):**
```bash
cd C:\Users\Gustavo\Projetos\nutriplan-v2\api
npm run start:dev
```
Aguarde a mensagem:
`[NestApplication] Nest application successfully started on port 3000`

**Terminal 2 (Frontend - Web):**
```bash
cd C:\Users\Gustavo\Projetos\nutriplan-v2\web
npm run dev
```
Acesse no seu navegador: `http://localhost:5173`

---

## 6. Banco de Dados e Ciclo de Vida das Migrações

### 6.1. SQLite Nativo (`node:sqlite`)
O NutriPlan v2 utiliza o módulo nativo `DatabaseSync` do Node 24 (`node:sqlite`), eliminando qualquer dependência de compilação externa com `node-gyp` ou ferramentas C++ no Windows.

### 6.2. Automação de Schema e Semente de Dados
Ao iniciar o servidor pela primeira vez:
1. O serviço `DatabaseService` conecta-se ao arquivo SQLite configurado (ou cria o arquivo caso não exista).
2. Executa `PRAGMA foreign_keys = ON` para habilitar a integridade referencial estrita.
3. Cria automaticamente todas as 17 tabelas relacionais em 3FN e seus respectivos índices de busca.
4. Detecta se a tabela `foods` está vazia e semeia os **744 alimentos oficiais da base TACO** a partir do arquivo local `api/local-cache/foods.json`.
5. Detecta se a tabela `exercises` está vazia e semeia os **128 exercícios com biomecânica e grupamentos** a partir de `api/local-cache/exercises.json`.
6. Semeia o catálogo de restrições alimentares (lactose, glúten, veganismo, etc.).

---

## 7. Procedimentos de Compilação para Produção (Build)

### 7.1. Compilando o Backend (`api`)
```bash
cd api
npm run build
```
Os arquivos JavaScript transpilados são gerados no diretório `api/dist/`.

### 7.2. Compilando o Frontend (`web`)
```bash
cd web
npm run build
```
O bundle otimizado para produção (HTML, CSS e JavaScript minificados) é gerado no diretório `web/dist/`.

---

## 8. Execução dos Testes Automatizados

Para executar os 47 testes automatizados de unidade e integração:
```bash
cd api
npm test
```

Para gerar o relatório detalhado de cobertura de código no terminal:
```bash
cd api
npm run test:cov
```

---

## 9. Diagnóstico e Resolução de Problemas (Troubleshooting)

| Sintoma | Causa Provável | Solução |
| :--- | :--- | :--- |
| **Porta 3000 em uso** (`EADDRINUSE`) | Outro processo está ocupando a porta 3000. | Finalize o processo anterior com `netstat -ano \| findstr :3000` e `taskkill /PID <PID> /F`, ou altere a variável `PORT` no arquivo `api/.env`. |
| **Erro de CORS no navegador** | O frontend não está rodando na porta autorizada (`5173`). | Verifique se o frontend está em `http://localhost:5173` ou ajuste a variável `CORS_ORIGIN` no `.env` da API. |
| **Sessão expirada ou erro 401** | O token JWT no navegador expirou ou foi invalidado. | Faça logout e efetue o login novamente para emitir um novo token válido. |
| **Banco de dados bloqueado** (`SQLITE_BUSY`) | Múltiplas conexões tentando gravar simultaneamente sem modo WAL. | O sistema já inicia em modo WAL (`PRAGMA journal_mode = WAL;`). Em caso de trava por encerramento abrupto, reinicie o serviço da API. |
