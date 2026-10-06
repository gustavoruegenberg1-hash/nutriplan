# Documentação Geral do Sistema - NutriPlan v2

## 1. Visão Geral do Projeto
O **NutriPlan v2** é um sistema completo, responsivo e de nível de produção desenvolvido para a disciplina de Engenharia de Software. Seu propósito central é fornecer a indivíduos e profissionais um ambiente de planejamento integrado de dietas alimentares e rotinas de treinamento resistido, ancorado em bases de dados científicas e em cálculos metabólicos validados pela literatura médica e nutricional.

Diferente de protótipos visuais convencionais, o NutriPlan v2 possui um backend corporativo em **NestJS**, persistência relacional com integridade referencial estrita via **SQLite nativo (Node 24 `node:sqlite`)**, motor de autenticação por tokens criptográficos **JWT (JSON Web Tokens)**, isolamento rigoroso de recursos por usuário (**IDOR Protection**) e interface responsiva para Web, Tablets e Dispositivos Móveis em **React 19, TypeScript e Tailwind CSS v4**.

---

## 2. Metodologia de Desenvolvimento e Engenharia de Software
O desenvolvimento seguiu princípios de Engenharia de Software com foco em:
1. **Engenharia de Requisitos**: Levantamento e especificação formal de 34 Requisitos Funcionais (RF01 a RF34) e 10 Requisitos Não-Funcionais (RNF01 a RNF10) descritos em [`REQUISITOS.md`](./REQUISITOS.md).
2. **Regras de Negócio Inegociáveis**: Modelagem de 27 Regras de Negócio (RN01 a RN27) descritas em [`REGRAS_DE_NEGOCIO.md`](./REGRAS_DE_NEGOCIO.md), cobrindo desde o cálculo metabólico até o isolamento histórico de treinos.
3. **Arquitetura Limpa e em Camadas**: Separação estrita de responsabilidades detalhada em [`ARQUITETURA.md`](./ARQUITETURA.md).
4. **Modelagem Relacional de Dados**: 17 tabelas em Terceira Forma Normal (3FN) com chaves estrangeiras (`ON DELETE CASCADE` e `ON DELETE SET NULL`) especificadas em [`BANCO_DE_DADOS.md`](./BANCO_DE_DADOS.md).
5. **Rastreabilidade Bidirecional**: Mapeamento unívoco entre Requisitos, Regras, Código-Fonte e Testes Automatizados registrado em [`MATRIZ_RASTREABILIDADE.md`](./MATRIZ_RASTREABILIDADE.md).
6. **Testes Automatizados Contínuos**: Pirâmide de testes unitários e de integração utilizando o framework **Vitest**, atingindo mais de 90% de cobertura de código.

---

## 3. Padrões de Projeto e Arquiteturais Adotados

### 3.1. Clean Architecture & Layered Pattern
A solução é dividida em camadas bem delimitadas:
* **Presentation Layer (Web UI)**: Componentes React e páginas responsivas isoladas de lógica de cálculo bruta.
* **Controller Layer (REST Controllers)**: Recepção de requisições HTTP, validação de payload com DTOs (`class-validator`) e mapeamento de respostas.
* **Application / Service Layer**: Orquestração das regras de negócio (ex: `DietsService`, `WorkoutsService`, `ProfileService`).
* **Domain / Engine Layer**: Serviços puros de domínio que realizam cálculos científicos sem efeitos colaterais de I/O (ex: `NutritionCalculatorService`).
* **Persistence Layer (Data Access)**: Acesso a dados centralizado no `DatabaseService`, garantindo transações ACID atômicas e segurança parametrizada contra SQL Injection.

### 3.2. Padrões de Projeto (GoF & Corporativos)
* **Strategy Pattern**: Aplicado no cálculo da Taxa Metabólica Basal (Mifflin-St Jeor para homens e mulheres) e na distribuição de macronutrientes conforme o objetivo selecionado (emagrecimento, manutenção ou hipertrofia).
* **Data Transfer Object (DTO)**: Garantia de tipagem forte e validação estrita na borda da aplicação. Qualquer campo não autorizado é higienizado antes de atingir as camadas de serviço.
* **Repository / DAO Pattern**: Encapsulamento dos comandos SQL em métodos específicos, abstraindo o dialeto do banco de dados das regras de negócio.
* **Guards & Decorators**: Utilização de `JwtAuthGuard` e `@CurrentUser()` para injeção de dependência e controle de acesso uniforme em todas as rotas.

---

## 4. Governança e Integridade dos Dados

### 4.1. Base Nutricional TACO (Tabela Brasileira de Composição de Alimentos)
* **Fonte Oficial**: UNICAMP / NEPA (Núcleo de Estudos e Pesquisas em Alimentação), 4ª Edição.
* **744 Alimentos Oficiais**: Nenhum dado é gerado por estimativa aleatória. Os nutrientes (energia, proteínas, carboidratos, lipídios, fibras alimentares e sódio) são armazenados conforme apurado laboratorialmente.
* **Cálculo Proporcional Estrito (RN10)**: Nutrientes são recalculados rigorosamente a partir da porção consumida:
  $$\text{Nutriente}_{\text{calculado}} = \text{Nutriente}_{\text{100g}} \times \frac{\text{Gramas}}{100}$$

### 4.2. Catálogo Oficial de Exercícios e Biomecânica
* **128 Exercícios Cadastrados**: Agrupados por grupamento muscular primário (Peito, Costas, Quadríceps, Ombros, Bíceps, Tríceps, Abdômen, etc.) e tipo de equipamento (Halteres, Barra, Máquinas, Polias, Peso Corporal).
* **Instruções Técnicas**: Cada exercício possui instruções detalhadas de segurança biomecânica e nível de dificuldade para mitigar riscos de lesão articular.

---

## 5. Políticas de Segurança e Privacidade

1. **Criptografia de Senhas (RNF02)**: As senhas de usuários nunca são persistidas em texto simples. Utiliza-se a função de derivação de chave **bcrypt** com fator de custo (*salt rounds*) igual a 10.
2. **Autenticação Stateless via JWT (RNF01)**: Sessões gerenciadas por tokens assinados com algoritmo SHA-256 e segredo configurável em variável de ambiente.
3. **Prevenção contra IDOR (Insecure Direct Object Reference - RN01, RN14)**: Nenhuma operação de consulta, edição ou exclusão depende unicamente do identificador do recurso (`dietId`, `workoutId`). Todas as consultas injetam compulsoriamente a cláusula `AND user_id = :userId`, impedindo que usuários adulterem dados de terceiros.
4. **Proteção contra SQL Injection (RNF06)**: 100% das interações com a base SQLite utilizam comandos preparados (*Prepared Statements*) com parâmetros nomeados ou posicionais.

---

## 6. Histórico Imutável e Rastreabilidade Longitudinal (RN24)
Uma das regras críticas de Engenharia de Software no NutriPlan v2 é a garantia de que a exclusão ou alteração de uma ficha de treino futura jamais apague ou corrompa os registros históricos de esforço físico já realizados no passado:
* A tabela `workout_logs` armazena o nome da ficha executada e referencia `workout_id` com a restrição `ON DELETE SET NULL`.
* A tabela `workout_log_exercises` grava cópias dos nomes dos exercícios, repetições, cargas e séries executadas.
* O histórico é, portanto, imutável e preservado para fins de auditoria de progresso físico.

---

## 7. Aviso Legal de Saúde e Domínio Profissional (RN27)
O NutriPlan v2 segue estritamente as diretrizes éticas e legais de software para a área da saúde (CFN - Conselho Federal de Nutricionistas e CONFEF - Conselho Federal de Educação Física):
> **Aviso Legal:** O NutriPlan v2 fornece planos nutricionais e fichas de treinamento como ferramenta de organização e suporte referencial computacional. O sistema não prescreve dietas médicas, diagnósticos ou condutas terapêuticas. Recomenda-se a avaliação e prescrição individualizada por profissionais habilitados (Nutricionista com CRN ativo e Profissional de Educação Física com CREF ativo).

---

## 8. Arquitetura Refatorada & Navegação por Perfis (RBAC)

Para aprimorar a usabilidade e diminuir a dispersão visual de abas, o sistema foi organizado por papéis de acesso estritos:

### 8.1. Estrutura de Navegação do Usuário Comum (4 Abas Principais)
1. **Dashboard**: Painel consolidado com resumo de dieta ativa, treinos ativos, métricas antropométricas, alertas do sistema e botão direto *"Falar com Profissional"*.
2. **Dieta**: Concentra todo o domínio nutricional em sub-abas internas:
   - *Minha Dieta Atual*: Gestão de refeições, edição inline de porções (RN10), exclusão e alertas de restrições.
   - *Montar Nova Dieta (8 Etapas)*: Assistente guiado passo a passo com estimativa de Mifflin-St Jeor e geração inteligente baseada na TACO.
   - *Base TACO & Alimentos*: Consulta aos 744 alimentos da TACO e simulador proporcional de porção (RN10).
   - *Metas & Balanço*: Comparativo gráfico de macronutrientes planejados vs metas estipuladas.
3. **Treino**: Concentra todo o domínio de exercícios e treinamento resistido em sub-abas internas:
   - *Meu Treino Atual*: Gestão das fichas e rotinas ativas (séries, repetições, carga e descanso).
   - *Montar Novo Treino (8 Etapas)*: Assistente guiado passo a passo por objetivo, nível, dias/semana e equipamentos.
   - *Registrar Treino*: Logger de sessão executada com cargas e séries reais (RN24).
   - *Histórico*: Linha do tempo cronológica com imutabilidade histórica.
   - *Banco de Exercícios*: Catálogo anatômico com 128 exercícios, agrupamentos musculares e instruções.
4. **Perfil**: Concentra dados pessoais, metas antropométricas, linha do tempo de evolução (IMC e histórico de pesagens), segurança (alteração de senha) e conta.

### 8.2. Estrutura do Profissional de Saúde (`PROFESSIONAL`)
1. **Painel**: Visão dos atendimentos clínicos, status de homologação de conselho (`PENDING`, `APPROVED`, `CORRECTION_REQUESTED`) e atalhos rápidos.
2. **Meus Clientes**: Listagem e busca de alunos supervisionados, inspeção de metas e histórico de peso, e canal de chat direto.
3. **Perfil**: Configurações de credenciais e biografia.

### 8.3. Estrutura do Administrador (`ADMIN`)
1. **Visão Geral**: Métricas consolidadas em tempo real (total de usuários, profissionais ativos, aprovações pendentes, dietas e logs).
2. **Moderação de Especialistas**: Tabela com filtros de status e modal para Aprovar, Rejeitar ou Solicitar Correção de documentos de conselho.
3. **Gestão de Usuários**: Tabela geral de contas e papéis no sistema.
4. **Perfil**: Configurações do administrador.

---

## 9. Assistentes Guiados por Etapas (Wizards Progressivos)

As telas de montagem de dieta e treino deixaram de exibir formulários extensos monolíticos e foram transformadas em assistentes progressivos de 8 etapas:
* **Landing Page Clara**: `# MONTE SUA DIETA` e `# MONTE SEU TREINO` com o botão destacado `[ INICIAR MONTAGEM ]`.
* **Indicador Visual de Progresso**: Barra de progresso contínua e rótulo claro indicando `Etapa X de 8`.
* **Fluxo Bidirecional**: O usuário pode avançar e voltar a qualquer momento sem perder o estado preenchido.
* **Conclusão com Ação Direta**: Botão `[ VER MINHA DIETA ]` ou `[ VER TREINO ]` ao concluir a geração.

---

## 10. Credenciamento de Profissionais e Canal de Mensageria

1. **Onboarding de Profissionais (`/register-professional`)**:
   - 4 Etapas: Dados Pessoais -> Registro Profissional (CRN / CREF com UF) -> Upload de Documento Comprobatório -> Revisão e Envio.
   - Status inicial gravado como `PENDING` ("Em Análise").
2. **Homologação pelo Administrador**:
   - O administrador avalia o registro e o documento anexado, podendo emitir pareceres de aprovação ou de retificação.
3. **Canal de Comunicação Integrado**:
   - Botão universal *"Falar com Profissional"* permite ao aluno localizar nutricionistas ou treinadores credenciados e trocar mensagens técnicas em tempo real com histórico preservado.

---

## 11. Resiliência de Interface e Tratamento de Estados Vazios

Seguindo as diretrizes de UX de software, nenhuma tela exibe tela branca ou falha de renderização:
1. **Estado de Carregamento**: Indicador giratório (*spinner*) com mensagem descritiva do que está sendo processado.
2. **Estado Vazio Amigável**: Ícones temáticos, mensagens explicativas sobre o porquê de estar vazio e botões de ação imediata (ex: *"Montar Dieta Agora"*, *"Iniciar Novo Treino"*).
3. **Estado de Erro com Retry**: Alertas informativos com botão *"Tentar Novamente"* para reexecutar a chamada de API sem necessidade de recarregar a página inteira.

