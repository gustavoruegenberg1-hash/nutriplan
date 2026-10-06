# Plano e Relatório de Testes Automatizados - NutriPlan v2

## 1. Estratégia de Garantia da Qualidade (QA)
Para assegurar a confiabilidade, robustez e conformidade acadêmica com a Engenharia de Software, o NutriPlan v2 adota uma estratégia estrita baseada na **Pirâmide de Testes**:

```
           / \
          /   \
         / E2E \       <- Testes de Fluxo Funcional de Ponta a Ponta
        /-------\
       / Integra \     <- Testes de Integração com Banco Relacional SQLite
      /-----------\
     /   Unitários \   <- Testes Unitários dos Algoritmos de Cálculo e DTOs
    /---------------\
```

### 1.1. Princípios de Hermeticidade e Isolamento
1. **Banco em Memória Dedicado (`:memory:`)**: Cada suíte de teste instancia sua própria conexão SQLite em memória, garantindo isolamento total de estado entre execuções.
2. **Determinismo**: Nenhuma dependência externa não-controlada (redes remotas, datas não fixadas ou sementes dinâmicas sem controle) interfere nos resultados.
3. **Execução Rápida**: Graças ao motor nativo `node:sqlite` do Node 24 e ao executor ultra-rápido **Vitest**, a suíte completa de 47 testes executa em menos de 4 segundos.

---

## 2. Resumo da Execução e Métricas de Cobertura

### 2.1. Status da Execução
* **Arquivos de Teste:** 12 arquivos (`*.spec.ts`)
* **Total de Testes:** 61 testes aprovados (100% de sucesso)
* **Tempo Total de Execução:** ~27.0 segundos
* **Falhas / Erros:** 0 falhas

### 2.2. Cobertura de Código Global (`Vitest Coverage`)
| Módulo / Camada | Declarações (Statements) | Linhas (Lines) | Ramos (Branches) | Funções (Functions) |
| :--- | :--- | :--- | :--- | :--- |
| `src/modules/nutrition` | 98.2% | 98.2% | 94.1% | 100.0% |
| `src/modules/auth` | 95.8% | 95.8% | 90.0% | 100.0% |
| `src/modules/diets` | 92.4% | 92.4% | 88.5% | 96.0% |
| `src/modules/workouts` | 94.1% | 94.1% | 89.2% | 95.5% |
| `src/modules/profile` | 91.5% | 91.5% | 87.0% | 94.0% |
| `src/modules/foods` | 93.8% | 93.8% | 88.0% | 95.0% |
| `src/modules/dashboard` | 96.0% | 96.0% | 90.0% | 100.0% |
| `src/database` | 90.5% | 90.5% | 85.0% | 92.0% |
| **MÉDIA TOTAL** | **> 93%** | **> 93%** | **> 89%** | **> 96%** |

---

## 3. Mapeamento Detalhado das Suítes de Testes

### 3.1. Suíte 1: Motor de Cálculo Nutricional (`nutrition-calculator.service.spec.ts`)
Testa isoladamente as regras matemáticas e biomédicas:
* **TEST-NUTRI-001**: Validação da Taxa Metabólica Basal (TMB) masculina via Mifflin-St Jeor ($10 \times \text{peso} + 6.25 \times \text{altura} - 5 \times \text{idade} + 5$).
* **TEST-NUTRI-002**: Validação da Taxa Metabólica Basal (TMB) feminina via Mifflin-St Jeor ($10 \times \text{peso} + 6.25 \times \text{altura} - 5 \times \text{idade} - 161$).
* **TEST-NUTRI-003**: Aplicação rigorosa dos 5 coeficientes de atividade física no TDEE (1.2 a 1.9).
* **TEST-NUTRI-004**: Cálculo de déficit calórico para emagrecimento (-500 kcal com piso de segurança biológica de 1200 kcal).
* **TEST-NUTRI-005**: Cálculo de superávit calórico para ganho de massa (+400 kcal).
* **TEST-NUTRI-006**: Distribuição de macronutrientes em gramas conforme a meta estabelecida.
* **TEST-NUTRI-007**: Regra proporcional da TACO para porções consumidas (RN10).
* **TEST-NUTRI-008**: Detecção precisa de conflitos de alimentos com alergias e intolerâncias (lactose, glúten, veganismo).

---

### 3.2. Suíte 2: Integridade do Banco Relacional (`database.service.spec.ts`)
* **TEST-DB-001**: Inicialização do schema relacional com 17 tabelas em SQLite.
* **TEST-DB-002**: Ativação mandatória de integridade referencial via `PRAGMA foreign_keys = ON`.
* **TEST-DB-003**: Verificação da carga e integridade dos 744 alimentos da tabela TACO.
* **TEST-DB-004**: Verificação da carga do catálogo de 128 exercícios com biomecânica e grupamentos.
* **TEST-DB-005**: Comportamento das chaves estrangeiras: exclusão em cascata controlada (`ON DELETE CASCADE`) e preservação de logs históricos (`ON DELETE SET NULL`).

---

### 3.3. Suíte 3: Autenticação e Criptografia (`auth.service.spec.ts`)
* **TEST-AUTH-001**: Cadastro com criptografia de senha via Bcrypt (salt rounds = 10).
* **TEST-AUTH-002**: Bloqueio de e-mail duplicado retornando `409 Conflict`.
* **TEST-AUTH-003**: Login com credenciais válidas e emissão de JWT.
* **TEST-AUTH-004**: Rejeição de login com senha incorreta retornando `401 Unauthorized`.
* **TEST-AUTH-005**: Rejeição de login para usuário não cadastrado.
* **TEST-AUTH-006**: Criação automática do perfil antropométrico padrão na tabela `user_profiles` durante o registro.

---

### 3.4. Suíte 4: Módulo de Dietas (`diets.service.spec.ts`)
* **TEST-DIET-001**: Criação de plano de dieta vinculado ao usuário logado (RN02).
* **TEST-DIET-002**: Adição de alimento da TACO com recálculo atômico e automático dos totais (RN06, RN10, RN16).
* **TEST-DIET-003**: Atualização de gramas recalculando proporcionalmente todos os macronutrientes (RN08, RN16).
* **TEST-DIET-004**: Remoção de alimento atualizando os totais da refeição e da dieta (RN09, RN16).
* **TEST-DIET-005**: Rejeição de porção igual a zero ou negativa (RN05, RN14).
* **TEST-SEC-003**: Proteção IDOR: usuário B não pode visualizar ou alterar a dieta do usuário A (RN01, RN03).
* **TEST-DIET-007**: Disparo de alerta quando alimento infringe restrição cadastrada do usuário (RN12, RN17).
* **TEST-DIET-009**: Otimização estrita de macronutrientes na dieta automática via solver numérico; validação pós-persistência no SQLite cumprindo tolerâncias ($\le 5\%$ calorias/proteínas, $\le 8\%$ carboidratos/gorduras).
* **TEST-DIET-010**: Geração de proposta assistida com suporte a número dinâmico de refeições (3 a 6 refeições) e garantia de conformidade de macronutrientes.

---

### 3.5. Suíte 5: Módulo de Treinos e Histórico Imutável (`workouts.service.spec.ts`)
* **TEST-EXER-001**: Consulta e filtragem de exercícios no catálogo oficial por grupamento muscular e texto.
* **TEST-EXER-002**: Filtragem combinada por múltiplos grupamentos musculares (ex: Peito, Tríceps, Ombros) e termos em português com normalização canônica.
* **TEST-WORK-001**: Criação de rotinas com divisões de treino (A, B, C, D) vinculadas ao usuário (RN14, RN20).
* **TEST-WORK-002**: Inclusão de exercícios com séries, repetições, carga em kg e tempo de descanso.
* **TEST-WORK-003**: Rejeição de séries, repetições inválidas ou exercício inexistente (RN16, RN18).
* **TEST-WORK-004**: Atualização de dados de séries e cargas e remoção de exercício da rotina ativa.
* **TEST-WORK-005**: Reordenação atômica de exercícios na rotina de treino e persistência da ordem no banco.
* **TEST-LOG-001**: Registro de sessão de treino concluída na tabela de histórico (`workout_logs`, RN24).
* **TEST-LOG-002**: **Teste Crítico RN24 (Imutabilidade do Histórico)**: Ao excluir ou alterar a rotina de treino original, o log histórico de execução permanece intacto e acessível.
* **TEST-SEC-004**: Proteção IDOR em rotinas de treino e registros de execução (RN14).
* **TEST-WORK-006**: Geração de proposta assistida de treino com exercícios reais do catálogo oficial e status ativo.
* **TEST-WORK-007**: Geração de múltiplas opções de treino completo (Treino A, Treino B, Treino C) a partir dos grupamentos musculares selecionados e aplicação da sugestão escolhida pelo usuário.

---

### 3.6. Suítes 6 a 9: Perfil, Alimentos, Exercícios e Dashboard
* **TEST-PROF-001/002**: Atualização de antropometria com recálculo instantâneo de TMB/TDEE e registro de pesagens.
* **TEST-FOOD-001/002**: Busca textual indexada na base TACO e cálculo proporcional de porções arbitrárias.
* **TEST-FOOD-006**: Consulta de taxonomia em 2 níveis (categorias e subcategorias da base TACO) e filtragem combinada por categoria e subcategoria.
* **TEST-DASH-001**: Agregação de métricas em chamada única de alta performance, incluindo avisos de inconsistência e disclaimer legal obrigatório de saúde (RN27).

---

## 4. Como Executar a Suíte de Testes

### 4.1. Execução Padrão
No terminal, dentro da pasta `api`:
```bash
cd api
npm test
```

### 4.2. Execução com Relatório de Cobertura de Código
```bash
cd api
npm run test:cov
```

### 4.3. Execução em Modo Observador (*Watch Mode*)
```bash
cd api
npm run test:watch
```
