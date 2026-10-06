# NutriPlan v2 — Plataforma Limpa & Moderna de Nutrição e Treino

Projeto recomeçado com arquitetura desacoplada, código limpo e moderno, mantendo a versão anterior (`nutriplan` v1) 100% preservada como referência de apoio.

---

## 🚀 Estrutura do Projeto

```
nutriplan-v2/
├── api/                    # Backend NestJS (TypeScript, DDD, Vitest)
│   ├── src/
│   │   ├── app.controller.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   └── local-cache/        # Cache seguro com os 744 alimentos da TACO
├── web/                    # Frontend React 19 + Vite + Tailwind CSS v4
│   ├── src/
│   │   ├── api/client.ts   # Cliente HTTP resiliente (com retry para cold-start)
│   │   ├── data/           # Base TACO higienizada e catalogada (tacoFoods.json)
│   │   ├── services/       # Serviço de busca rápida e filtragem (foodService.ts)
│   │   └── types/          # Tipagem TypeScript centralizada
├── scripts/                # Scripts utilitários de build de dados
├── iniciar.bat             # Inicializador em 1 clique (inicia API e Web)
├── iniciar-api.bat         # Inicia apenas a API (porta 3000)
├── iniciar-web.bat         # Inicia apenas o Frontend (porta 5173)
└── PROJECT_RULES.md        # Regras permanentes contra rollback e simplificações
```

---

## 🛠️ Tecnologias

* **Frontend:** React 19, Vite, Tailwind CSS v4, TypeScript, Lucide React, Axios, React Router.
* **Backend:** NestJS, TypeScript, Express, Vitest.
* **Dados Base:** Tabela TACO integral (744 alimentos com calorias, proteínas, carboidratos, gorduras, fibras, sub-tags e tags nutricionais).

---

## 🏁 Como Executar

### Opção 1: Inicializador Automático
Execute o arquivo `iniciar.bat` com 2 cliques na raiz.

### Opção 2: Terminal Manual
1. **Backend:**
   ```bash
   cd api
   npm run start:dev
   ```
2. **Frontend:**
   ```bash
   cd web
   npm run dev
   ```

* Frontend: `http://localhost:5173`
* Backend API: `http://localhost:3000`

---

## 🛡️ Regras de Preservação e Segurança
Este projeto segue rigorosamente o arquivo `PROJECT_RULES.md` contra rollbacks, substituições destrutivas ou simplificações forçadas.
A versão 1 continua intacta em `../nutriplan` como referência segura de regras de negócio e histórico.
