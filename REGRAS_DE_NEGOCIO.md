# REGRAS DE NEGÓCIO DO SISTEMA — NUTRIPLAN V2

**Projeto:** Sistema Web/Mobile de Montagem Personalizada de Dieta e Treino  
**Disciplina:** Engenharia de Software  
**Data:** Outubro de 2026  

---

## 1. REGRAS GERAIS DE ACESSO E USUÁRIO

- **RN01 — E-mail Único e Válido:** Não é permitido o cadastro de dois usuários com o mesmo endereço de e-mail. O e-mail deve respeitar o formato canônico de endereço eletrônico.
- **RN02 — Política de Senhas Seguras:** A senha deve ter no mínimo 8 caracteres e conter pelo menos um número e uma letra maiúscula. Não são aceitas senhas vazias ou compostas apenas por espaços em branco. Senhas nunca são salvas em texto puro.
- **RN03 — Isolamento Multiusuário:** Um usuário só tem permissão para visualizar, alterar ou excluir seus próprios dados (dietas, treinos, perfil, históricos, logs). Tentativas de acesso a recursos de terceiros retornam erro HTTP 403 (Proibido) ou 404 (Não Encontrado).
- **RN04 — Obrigatoriedade de Autenticação:** Rotas de manipulação de dados privados exigem token de autenticação JWT válido no cabeçalho `Authorization: Bearer <token>`. Requisições sem token retornam HTTP 401.

---

## 2. REGRAS DE PERFIL E CÁLCULO NUTRICIONAL

- **RN05 — Limites Antropométricos Válidos:**
  - Idade deve ser um número inteiro positivo entre 10 e 120 anos.
  - Peso deve ser um valor numérico entre 20.0 kg e 350.0 kg.
  - Altura deve ser um valor numérico entre 50.0 cm e 250.0 cm.
- **RN06 — Fórmula de Cálculo da Taxa Metabólica Basal (TMB):**
  A TMB deve ser calculada pela equação de Mifflin-St Jeor:
  - *Homens:* $\text{TMB} = (10 \times \text{peso}) + (6.25 \times \text{altura}) - (5 \times \text{idade}) + 5$
  - *Mulheres:* $\text{TMB} = (10 \times \text{peso}) + (6.25 \times \text{altura}) - (5 \times \text{idade}) - 161$
- **RN07 — Gasto Energético Diário (TDEE):**
  $\text{TDEE} = \text{TMB} \times \text{Fator de Atividade}$, onde:
  - Sedentário: 1.2
  - Levemente ativo: 1.375
  - Moderadamente ativo: 1.55
  - Muito ativo: 1.725
  - Extremamente ativo: 1.9
- **RN08 — Definição da Meta Calórica:**
  - Emagrecimento (Perda de peso): $\text{Meta} = \text{TDEE} - 500\text{ kcal}$ (com piso mínimo seguro de 1200 kcal para mulheres e 1500 kcal para homens).
  - Manutenção: $\text{Meta} = \text{TDEE}$.
  - Ganho de massa (Hipertrofia): $\text{Meta} = \text{TDEE} + 350\text{ kcal}$.
- **RN09 — Distribuição dos Macronutrientes:**
  - Proteínas: 2.0g por kg de peso corporal (4 kcal/g).
  - Gorduras: 0.9g por kg de peso corporal (9 kcal/g).
  - Carboidratos: calorias restantes divididas por 4 kcal/g.

---

## 3. REGRAS DA BASE NUTRICIONAL (TACO) E ALIMENTOS

- **RN10 — Proporcionalidade Estrita de Nutrientes:**
  A base TACO armazena dados para 100g de referência. Para uma quantidade $Q$ em gramas:
  $$\text{Nutriente}_{\text{calculado}} = \text{Nutriente}_{\text{referencia}} \times \frac{Q}{100}$$
  Essa fórmula aplica-se individualmente a Calorias, Proteínas, Carboidratos, Gorduras, Fibras e Sódio.
- **RN11 — Imutabilidade dos Dados Oficiais:** O usuário não pode sobrescrever as propriedades nutricionais oficiais de um alimento TACO. O que varia na dieta é exclusivamente a quantidade consumida (em gramas).
- **RN12 — Tratamento de Nutrientes Indisponíveis:** Caso um nutriente não conste na fonte TACO oficial para determinado alimento, o valor deve permanecer nulo (`null`), nunca inventado ou assumido arbitrariamente como zero (salvo para fins de soma onde campos ausentes contam como 0 com flag indicativa).

---

## 4. REGRAS DE MONTAGEM DE DIETA E REFEIÇÕES

- **RN13 — Associação Obrigatória:** Uma dieta deve pertencer obrigatoriamente a um usuário. Uma refeição deve pertencer a uma dieta. Um item de refeição deve pertencer a uma refeição e referenciar um alimento existente.
- **RN14 — Quantidade Positiva Obrigatória:** A quantidade de alimento informada em uma refeição deve ser estritamente maior que zero ($Q > 0$).
- **RN15 — Bloqueio de Edição Manual de Totais:** O usuário nunca envia os totais nutricionais via frontend. O backend calcula todos os totais a partir dos alimentos e quantidades persistidos.
- **RN16 — Recálculo em Cascata:**
  - Ao alterar a quantidade de um alimento, o total da refeição e o total diário da dieta devem ser recalculados.
  - Ao remover um item, os totais da refeição e da dieta devem subtrair proporcionalmente os nutrientes removidos.
  - Ao adicionar um item, os totais devem somar imediatamente a nova porção.
- **RN17 — Alertas de Restrição Alimentar:**
  Se o usuário tiver restrição cadastrada (ex.: intolerância a lactose, alergia a frutos do mar, dieta vegana) e adicionar um alimento incompatível (identificado por categoria ou tags), o sistema deve emitir aviso impeditivo ou de advertência explícito.
- **RN18 — Comparação com Metas:** O sistema deve calcular a discrepância calórica e de macronutrientes:
  $$\Delta = \text{Planejado na Dieta} - \text{Meta do Perfil}$$
  Diferenças superiores a 15% devem disparar alerta visual na interface.
- **RN19 — Proposta do Gerador Automático:** A sugestão de dieta gerada automaticamente deve ser puramente uma proposta inicial e permanecer 100% editável pelo usuário antes de salvar.

---

## 5. REGRAS DO MÓDULO DE TREINOS E EXERCÍCIOS

- **RN20 — Associação de Treino:** Todo treino deve pertencer a um usuário autenticado.
- **RN21 — Existência do Exercício:** Todo exercício inserido em um treino deve existir previamente no catálogo de exercícios.
- **RN22 — Séries e Repetições Válidas:**
  - Quantidade de séries deve ser um número inteiro entre 1 e 20.
  - Repetições devem ser um número inteiro entre 1 e 100 (ou tempo em segundos para exercícios isométricos).
  - Carga deve ser maior ou igual a zero (0 kg para exercícios com o próprio peso corporal).
- **RN23 — Reordenação Permitida:** O usuário tem permissão para alterar a ordem sequencial dos exercícios no treino (`orderIndex`).
- **RN24 — Integridade do Histórico de Execução (Workout Logs):**
  A alteração ou exclusão de um plano de treino futuro NUNCA deve apagar ou corromper os registros históricos de treinos já realizados no passado (`WORKOUT_LOGS`). O histórico é um registro auditável e imutável de sessões já concluídas.
- **RN25 — Confirmação de Exclusão:** Exclusão de rotinas de treino ou planos de dieta requer confirmação explícita do usuário.

---

## 6. REGRAS DE AUDITORIA E NOTIFICAÇÃO

- **RN26 — Registro de Auditoria:** Operações críticas de criação, atualização e exclusão de contas e planos devem registrar log com `userId`, `action`, `resource` e `timestamp`.
- **RN27 — Isenção Médica Obrigatória:** Em todas as telas e relatórios com metas ou planos, deve ser exibido o aviso de que o aplicativo é uma ferramenta de apoio educacional e de organização pessoal, não substituindo prescrição profissional por nutricionista ou educador físico.
