# NutriPlan — Regras de Projeto e Padrões de Arquitetura

Este documento estabelece as diretrizes obrigatórias de desenvolvimento para o projeto **NutriPlan**.

## Diretrizes Principais

1. **Clean Architecture Obrigatória:**
   - `domain/`: Entidades puras e Value Objects sem imports de frameworks.
   - `application/`: Casos de uso e Ports (interfaces).
   - `infrastructure/`: Prisma ORM, JWT, Argon2.
   - `presentation/`: Controllers e DTOs com validação e Swagger.

2. **Qualidade e Testes:**
   - Suíte de testes em Vitest (`*.spec.ts`).
   - Cobertura $\ge 70\%$ no core da aplicação.
   - Testar antes de concluir (`npm test`).

3. **Ambiente:**
   - Node.js 20+ no Windows (PowerShell).
   - PostgreSQL via Neon ou Docker.
