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

## 📚 Documentação Técnica e Acadêmica de Engenharia de Software

O NutriPlan v2 possui documentação completa e formal de Engenharia de Software:

1. **[REQUISITOS.md](./REQUISITOS.md)**: Especificação formal dos 38 Requisitos Funcionais (RF01 a RF38) e 10 Requisitos Não-Funcionais (RNF01 a RNF10).
2. **[REGRAS_DE_NEGOCIO.md](./REGRAS_DE_NEGOCIO.md)**: Modelagem detalhada das 29 Regras de Negócio (RN01 a RN29), do cálculo metabólico à integridade histórica e governança administrativa.
3. **[ARQUITETURA.md](./ARQUITETURA.md)**: Padrão arquitetural em camadas, diagramas de fluxo de dados, padrão GoF e decisões tecnológicas justificadas academicamente.
4. **[BANCO_DE_DADOS.md](./BANCO_DE_DADOS.md)**: Modelo Entidade-Relacionamento completo (17 tabelas em 3FN), tipos de dados, chaves estrangeiras, índices e integridade referencial.
5. **[MATRIZ_RASTREABILIDADE.md](./MATRIZ_RASTREABILIDADE.md)**: Matriz bidirecional completa conectando Requisitos ↔ Regras ↔ Código-Fonte ↔ Testes Automatizados.
6. **[DOCUMENTACAO.md](./DOCUMENTACAO.md)**: Visão geral da engenharia do sistema, metodologia de desenvolvimento, governança de dados científicos e segurança.
7. **[API.md](./API.md)**: Especificação RESTful OpenAPI com todas as rotas, cabeçalhos, parâmetros, códigos de status e payloads JSON de requisição e resposta.
8. **[TESTES.md](./TESTES.md)**: Plano e relatório da suíte de 61 testes automatizados de unidade e integração, pirâmide de testes e métricas de cobertura (>90%).
9. **[MANUAL_USUARIO.md](./MANUAL_USUARIO.md)**: Guia passo a passo ilustrado com instruções de operação de todas as telas e fluxos para o usuário final.
10. **[MANUAL_TECNICO.md](./MANUAL_TECNICO.md)**: Manual de implantação, infraestrutura, ciclo de vida do SQLite, variáveis de ambiente e procedimentos de build.

---

## 🛡️ Regras de Preservação e Segurança
Este projeto segue rigorosamente o arquivo `PROJECT_RULES.md` contra rollbacks, substituições destrutivas ou simplificações forçadas.
A versão 1 continua intacta em `../nutriplan` como referência segura de regras de negócio e histórico.

