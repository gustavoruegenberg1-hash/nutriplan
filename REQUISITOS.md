# DOCUMENTO DE ENGENHARIA DE REQUISITOS — NUTRIPLAN V2

**Projeto:** Sistema Web/Mobile de Montagem Personalizada de Dieta e Treino  
**Disciplina:** Engenharia de Software  
**Data:** Outubro de 2026  
**Status:** Aprovado para Implementação  

---

## 1. VISÃO GERAL DO PRODUTO

O **NutriPlan v2** é um sistema completo e testável projetado para apoiar usuários na elaboração, acompanhamento e registro de planos de dieta e rotinas de treino físico. A aplicação adota uma base de dados nutricionais verídica fundamentada na **Tabela Brasileira de Composição de Alimentos (TACO - UNICAMP, 4ª Edição)**, cálculos de gasto calórico baseados em literatura científica (Mifflin-St Jeor / Harris-Benedict) e um catálogo completo de exercícios por grupamento muscular.

O sistema atende a requisitos acadêmicos rigorosos de Engenharia de Software:
- Separação em camadas com baixo acoplamento e alta coesão;
- Backend com persistência relacional e integridade referencial;
- Autenticação e autorização robustas no lado do servidor;
- Cobertura por testes unitários, integração, funcionais e regressão;
- Rastreabilidade bidirecional entre requisitos, regras de negócio, implementação e suíte de testes.

---

## 2. ATORES DO SISTEMA

| Ator | Descrição |
| :--- | :--- |
| **Visitante** | Usuário não autenticado que acessa a landing page, tela de login ou formulário de cadastro. |
| **Usuário Comum** | Indivíduo autenticado que gerencia seu próprio perfil, metas, dietas, refeições, treinos e histórico. |
| **Administrador** | Usuário com permissões de gestão do catálogo de alimentos (TACO) e banco de exercícios. |

---

## 3. REQUISITOS FUNCIONAIS (RF)

### 3.1. Módulo de Autenticação e Usuários
- **RF01 — Cadastro de Usuário:** O sistema deve permitir que novos usuários se cadastrem fornecendo nome completo, e-mail válido e senha segura (mínimo de 8 caracteres, com validações de complexidade).
- **RF02 — Autenticação (Login):** O sistema deve autenticar o usuário via e-mail e senha, gerando token JWT com expiração e controle de sessão.
- **RF03 — Encerramento de Sessão (Logout):** O sistema deve permitir que o usuário encerre sua sessão ativa, invalidando o token no cliente.
- **RF04 — Recuperação e Redefinição de Senha:** O sistema deve fornecer fluxo para solicitação de redefinição e alteração de senha de forma segura.
- **RF05 — Proteção de Rotas:** O sistema deve bloquear qualquer acesso não autenticado a recursos privados da API e telas restritas.
- **RF06 — Autorização por Usuário:** O sistema deve garantir que nenhum usuário consiga ler, alterar ou excluir registros pertencentes a outro usuário (isolamento estrito no backend por `userId`).

### 3.2. Módulo de Perfil e Parâmetros Fisiológicos
- **RF07 — Gestão do Perfil do Usuário:** O sistema deve permitir visualizar e atualizar dados antropométricos: idade, sexo biológico, peso atual (kg), altura (cm), nível de atividade física e objetivo principal.
- **RF08 — Restrições e Preferências Alimentares:** O sistema deve permitir selecionar alergias alimentares (lactose, glúten, frutos do mar, oleaginosas, etc.), estilo alimentar (vegetariano, vegano) e alimentos a evitar.
- **RF09 — Histórico de Peso:** O sistema deve armazenar cada alteração de peso com data/hora para acompanhamento gráfico de evolução.

### 3.3. Módulo de Cálculo Nutricional
- **RF10 — Cálculo de Taxa Metabólica Basal (TMB/BMR):** O sistema deve calcular a TMB utilizando a fórmula de Mifflin-St Jeor isolada em serviço de domínio testável.
- **RF11 — Cálculo do Gasto Energético Diário (TDEE/GET):** O sistema deve calcular o TDEE multiplicando a TMB pelo fator de atividade física especificado.
- **RF12 — Cálculo de Meta Calórica e Macronutrientes:** O sistema deve estimar a meta de calorias conforme o objetivo (déficit calórico para emagrecimento, superávit para hipertrofia, manutenção) e distribuir a meta em Proteínas (g), Carboidratos (g) e Lipídios (g).
- **RF13 — Isolamento dos Algoritmos de Cálculo:** Todas as fórmulas matemáticas devem estar desacopladas da interface gráfica e ser invocadas via serviços de aplicação com parâmetros configuráveis.

### 3.4. Módulo da Base de Alimentos (TACO)
- **RF14 — Catálogo de Alimentos TACO:** O sistema deve fornecer um banco relacional com os alimentos da Tabela Brasileira de Composição de Alimentos (4ª edição), armazenando calorias, proteínas, carboidratos, lipídios, fibras, sódio e micronutrientes por 100g de referência.
- **RF15 — Busca e Filtragem de Alimentos:** O sistema deve permitir pesquisar alimentos por nome, categoria, subcategoria e tags nutricionais (alto-proteína, zero-carb, baixa-caloria, etc.).
- **RF16 — Cálculo Proporcional de Nutrientes:** Ao informar uma porção em gramas (ex.: 150g), o sistema deve calcular proporcionalmente cada nutriente a partir da base de 100g.
- **RF17 — Integridade dos Dados Nutricionais:** Valores ausentes na fonte devem ser armazenados como nulos e nunca substituídos por números fictícios.

### 3.5. Módulo de Montagem de Dieta
- **RF18 — Criação e Gestão de Dietas:** O usuário pode criar, renomear, duplicar e excluir seus planos alimentares.
- **RF19 — Organização em Refeições:** Uma dieta deve conter refeições ordenadas (ex.: Café da Manhã, Almoço, Lanche da Tarde, Jantar, Ceia).
- **RF20 — Adição e Remoção de Alimentos na Refeição:** O usuário pode vincular alimentos existentes à refeição com quantidade em gramas informada.
- **RF21 — Recálculo Automático Instantâneo:** Ao alterar a quantidade de um alimento ou adicionar/remover itens, os totais da refeição e os totais diários de calorias e macros devem ser recalculados automaticamente.
- **RF22 — Comparativo com Metas:** O sistema deve exibir indicadores visuais comparando os totais calculados da dieta com as metas nutricionais do usuário (diferença absoluta e percentual).
- **RF23 — Alertas de Restrições Alimentares:** O sistema deve emitir avisos claros se um alimento adicionado colidir com as restrições cadastradas no perfil do usuário.
- **RF24 — Gerador Assistido de Proposta de Dieta:** O sistema deve fornecer uma funcionalidade que sugira uma distribuição inicial de refeições e alimentos com base no perfil e metas do usuário, sendo 100% editável pelo usuário.
- **RF25 — Aviso Legal de Domínio de Saúde:** Todas as interfaces de cálculo e plano devem exibir o aviso explícito de que o sistema fornece estimativas e não substitui avaliação de nutricionista ou médico.

### 3.6. Módulo de Treinos e Exercícios
- **RF26 — Catálogo de Exercícios:** O sistema deve manter um banco de dados relacional com exercícios categorizados por grupamento muscular (peito, costas, quadríceps, bíceps, etc.), equipamento e instruções.
- **RF27 — Busca e Filtragem de Exercícios:** O usuário pode buscar exercícios por nome, grupo muscular e equipamento.
- **RF28 — Montagem de Rotinas de Treino:** O usuário pode criar rotinas de treino divididas por dias da semana ou divisão (Treino A, B, C), definindo nome, objetivo e duração estimada.
- **RF29 — Configuração de Séries e Repetições:** Cada exercício da rotina deve possuir séries, repetições planejadas, carga prevista (kg), tempo de descanso (s) e observações técnicas.
- **RF30 — Reordenação de Exercícios:** O usuário pode alterar a ordem dos exercícios na rotina.
- **RF31 — Registro de Treino Realizado (Workout Log):** O usuário pode registrar a execução de um treino em uma data específica, apontando as séries cumpridas, repetições reais e cargas executadas.
- **RF32 — Histórico e Evolução de Treinos:** O sistema deve manter o histórico imutável das execuções, permitindo consultas temporais para análise de progressão de carga e consistência.

### 3.7. Módulo Dashboard e Notificações
- **RF33 — Painel de Controle Integrado (Dashboard):** Visão unificada com peso atual, status da meta calórica, resumo da dieta ativa, próximos treinos e últimos treinos registrados.
- **RF34 — Alertas e Inconsistências:** Avisos sobre refeições com baixa densidade proteica, desvio acentuado da meta calórica ou treinos vazios sem exercícios.
- **RF35 — Múltiplas Opções de Sugestões de Treino Assistido:** O assistente de montagem de treino deve permitir selecionar grupamentos musculares específicos em português e gerar múltiplas alternativas estruturadas (Treino A, B, C) com catálogo oficial traduzido para escolha do usuário.
- **RF36 — Cronômetro Interativo em Tempo Real:** Interface de execução e descanso com cronômetro integrado (play, pause, reset e intervalos rápidos) para condução dos treinos.
- **RF37 — Portal e Credenciamento de Profissionais de Saúde:** Cadastro especializado com número de registro (CRN/CREF), perfil profissional público e canal de solicitação de acompanhamento direto.
- **RF38 — Painel de Controle e Auditoria Administrativa:** Módulo de gestão exclusivo para perfil de Administrador (`ADMIN`), com métricas consolidadas da plataforma e moderação de contas.

---

## 4. REQUISITOS NÃO FUNCIONAIS (RNF)

| Identificador | Categoria | Descrição |
| :--- | :--- | :--- |
| **RNF01** | **Segurança** | Senhas devem ser hasheadas com algoritmos robustos com salt (`bcrypt`/`pbkdf2`). Nenhuma credencial trafega em texto puro. Tokens JWT assinados com chave secreta e expiração. |
| **RNF02** | **Controle de Acesso** | Validação mandatória no backend de propriedade dos recursos (`userId`). Bloqueio contra manipulação de IDs (`IDOR`). |
| **RNF03** | **Usabilidade & Responsividade** | Interface responsiva adaptável a Mobile (360px+), Tablet (768px+) e Desktop (1024px+). Componentes amigáveis para toque. |
| **RNF04** | **Desempenho** | Tempo de resposta da API abaixo de 200ms para consultas locais de banco de dados. Índices criados em colunas de chaves estrangeiras e buscas textuais. |
| **RNF05** | **Manutenibilidade** | Arquitetura em camadas (Clean/Layered MVC) separando Controllers/Apresentação, Casos de Uso/Serviços, Entidades de Domínio e Repositórios de Dados. |
| **RNF06** | **Testabilidade** | Regras de negócio desacopladas do framework HTTP e de banco de dados, permitindo execução isolada de testes unitários rápidos. |
| **RNF07** | **Confiabilidade & Resiliência** | Tratamento centralizado de exceções com status HTTP padronizados (400, 401, 403, 404, 409, 422, 500) sem vazamento de stack trace ao usuário final. |
| **RNF08** | **Integridade de Dados** | Banco de dados relacional com integridade referencial ativa (`PRAGMA foreign_keys = ON`), transações ACID para persistência de planos e registros. |
| **RNF09** | **Rastreabilidade** | Rastreabilidade documentada entre requisitos, regras de negócio, implementação e casos de teste automatizados. |
| **RNF10** | **Compatibilidade** | Suporte aos navegadores modernos (Chrome, Firefox, Safari, Edge) e interoperabilidade com clientes HTTP RESTful padrão. |
