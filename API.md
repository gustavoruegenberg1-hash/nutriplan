# Especificação Completa da API REST - NutriPlan v2

A API do NutriPlan v2 foi projetada seguindo as convenções arquiteturais **RESTful**, utilizando payloads JSON para troca de informações, códigos de status HTTP padrão e autenticação stateless baseada em **Bearer Tokens (JWT)**.

---

## 1. Padrões Globais da API

### 1.1. Base URL
* **Desenvolvimento Local:** `http://localhost:3000`
* **Porta Padrão:** `3000`

### 1.2. Cabeçalhos de Requisição
| Cabeçalho | Tipo | Obrigatório | Descrição |
| :--- | :--- | :--- | :--- |
| `Content-Type` | String | Sim (POST/PUT) | Sempre `application/json` |
| `Authorization` | String | Sim (rotas seguras) | Formato `Bearer <seu_token_jwt>` |

### 1.3. Códigos de Status HTTP Padronizados
* `200 OK`: Requisição processada e retornada com sucesso.
* `201 Created`: Recurso criado com sucesso (ex: novo usuário, nova dieta, novo treino).
* `400 Bad Request`: Falha de validação de DTO, parâmetros fora do intervalo ou corpo mal formatado.
* `401 Unauthorized`: Token ausente, expirado ou inválido; credenciais de login incorretas.
* `404 Not Found`: Recurso solicitado não existe ou não pertence ao usuário logado (proteção IDOR).
* `409 Conflict`: Conflito de integridade (ex: tentativa de cadastrar e-mail já existente).
* `500 Internal Server Error`: Erro inesperado do servidor.

---

## 2. Módulo de Autenticação (`/auth`)

### 2.1. Registro de Novo Usuário
Cria uma nova conta no sistema e gera automaticamente um perfil antropométrico padrão.
* **Método:** `POST`
* **Rota:** `/auth/register`
* **Autenticação:** Pública

#### Corpo da Requisição (JSON)
```json
{
  "name": "Maria Silva",
  "email": "maria@exemplo.com",
  "password": "SenhaSegura123"
}
```

#### Resposta de Sucesso (`201 Created`)
```json
{
  "user": {
    "id": "c1f7a4e2-...",
    "email": "maria@exemplo.com",
    "name": "Maria Silva",
    "role": "USER"
  },
  "token": "eyJhbGciOiJIUzI1NiIsIn..."
}
```

---

### 2.2. Autenticação e Login
Verifica credenciais e retorna o token de acesso JWT.
* **Método:** `POST`
* **Rota:** `/auth/login`
* **Autenticação:** Pública

#### Corpo da Requisição (JSON)
```json
{
  "email": "maria@exemplo.com",
  "password": "SenhaSegura123"
}
```

#### Resposta de Sucesso (`200 OK`)
```json
{
  "user": {
    "id": "c1f7a4e2-...",
    "email": "maria@exemplo.com",
    "name": "Maria Silva",
    "role": "USER"
  },
  "token": "eyJhbGciOiJIUzI1NiIsIn..."
}
```

---

### 2.3. Obter Perfil Autenticado Atual
Valida o token JWT e retorna dados essenciais do usuário logado.
* **Método:** `GET`
* **Rota:** `/auth/me`
* **Autenticação:** Requer Bearer Token

---

## 3. Módulo de Perfil e Antropometria (`/profile`)

### 3.1. Obter Dados Completos do Perfil
Retorna dados pessoais, parâmetros antropométricos, metas nutricionais calculadas pelo motor científico e histórico recente de pesagens.
* **Método:** `GET`
* **Rota:** `/profile`
* **Autenticação:** Requer Bearer Token

#### Resposta de Sucesso (`200 OK`)
```json
{
  "user": {
    "id": "c1f7a4e2-...",
    "email": "maria@exemplo.com",
    "name": "Maria Silva",
    "role": "USER"
  },
  "profile": {
    "age": 28,
    "gender": "FEMALE",
    "weight": 65.5,
    "height": 168.0,
    "activityLevel": "MODERATELY_ACTIVE",
    "goal": "LOSE_WEIGHT",
    "dietaryNotes": "Sem açúcar refinado",
    "bmr": 1420.5,
    "tdee": 2201.8
  },
  "targets": {
    "calories": 1701.8,
    "proteinGrams": 131.0,
    "carbsGrams": 161.0,
    "fatGrams": 58.0,
    "fiberGrams": 28.0
  },
  "restrictions": [
    {
      "id": "rest-lactose",
      "name": "Intolerância à Lactose",
      "category": "INTOLERANCE",
      "severity": "MODERATE"
    }
  ],
  "recentWeightHistory": [
    {
      "id": "w1...",
      "weight": 65.5,
      "recordedAt": "2026-10-06T10:00:00.000Z",
      "notes": "Pesagem matinal em jejum"
    }
  ]
}
```

---

### 3.2. Atualizar Perfil e Recalcular Metas (RN06, RN07, RN08, RN09)
Atualiza parâmetros biométricos e restrições. Recalcula atômica e instantaneamente a Taxa Metabólica Basal (TMB), Gasto Energético Total (TDEE) e Metas de Macronutrientes.
* **Método:** `PUT`
* **Rota:** `/profile`
* **Autenticação:** Requer Bearer Token

#### Corpo da Requisição (JSON)
```json
{
  "name": "Maria Silva",
  "age": 29,
  "gender": "FEMALE",
  "weight": 64.8,
  "height": 168.0,
  "activityLevel": "VERY_ACTIVE",
  "goal": "MAINTAIN",
  "dietaryNotes": "Preferência por grãos integrais",
  "restrictionIds": ["rest-lactose"]
}
```

---

### 3.3. Listar Catálogo de Restrições Disponíveis
Retorna todas as alergias, intolerâncias e preferências dietéticas pré-cadastradas no sistema.
* **Método:** `GET`
* **Rota:** `/profile/restrictions`
* **Autenticação:** Requer Bearer Token

---

### 3.4. Registrar Nova Pesagem (Evolução Temporal)
Grava uma nova aferição de peso na tabela `weight_history` e atualiza o peso atual no perfil.
* **Método:** `POST`
* **Rota:** `/profile/weight`
* **Autenticação:** Requer Bearer Token

#### Corpo da Requisição (JSON)
```json
{
  "weight": 64.5,
  "notes": "Pós-treino de corrida"
}
```

---

## 4. Módulo de Alimentos TACO (`/foods`)

### 4.1. Pesquisar Alimentos no Catálogo Oficial
Permite filtrar 744 alimentos por texto, categoria ou tags nutricionais.
* **Método:** `GET`
* **Rotas:** `/foods` e `/foods/search`
* **Autenticação:** Pública ou Autenticada
* **Query Parameters:**
  * `query`: Termo de busca (ex: `Frango`, `Arroz`, `Aveia`)
  * `category`: Categoria TACO (ex: `Carnes e derivados`, `Cereais e derivados`)
  * `tag`: Filtro rápido (`alto-proteina`, `baixo-carb`, `rico-fibras`)
  * `limit`: Quantidade máxima de registros (padrão: 40)
  * `offset`: Deslocamento para paginação (padrão: 0)

---

### 4.2. Listar Categorias de Alimentos
Retorna todas as categorias disponíveis na base TACO.
* **Método:** `GET`
* **Rota:** `/foods/categories`

---

### 4.3. Calcular Porção Proporcional (RN10)
Calcula a exata equivalência nutricional para uma determinada quantidade em gramas.
* **Método:** `GET`
* **Rota:** `/foods/:id/portion/:grams`
* **Exemplo:** `/foods/taco-001/portion/150`

#### Resposta de Sucesso (`200 OK`)
```json
{
  "food": {
    "id": "taco-001",
    "name": "Arroz, integral, cozido",
    "referenceQuantity": 100,
    "calories": 124.0,
    "protein": 2.6,
    "carbohydrates": 25.8,
    "lipids": 1.0,
    "fiber": 2.7,
    "sodium": 1.0
  },
  "grams": 150,
  "calories": 186.0,
  "protein": 3.9,
  "carbohydrates": 38.7,
  "lipids": 1.5,
  "fiber": 4.1,
  "sodium": 1.5
}
```

---

## 5. Módulo de Dietas (`/diets`)

### 5.1. Listar Dietas do Usuário (RN01, RN02)
* **Método:** `GET`
* **Rota:** `/diets`
* **Autenticação:** Requer Bearer Token

---

### 5.2. Criar Nova Dieta
* **Método:** `POST`
* **Rota:** `/diets`
* **Autenticação:** Requer Bearer Token

#### Corpo da Requisição (JSON)
```json
{
  "name": "Dieta Hipertrofia Limpa",
  "notes": "Planejamento com 4 refeições diárias"
}
```

---

### 5.3. Obter Detalhes da Dieta com Totais e Comparação de Metas (RN13)
Retorna a dieta completa com todas as refeições, alimentos, somatório de calorias/macronutrientes e a diferença para as metas calculadas do perfil.
* **Método:** `GET`
* **Rota:** `/diets/:id`
* **Autenticação:** Requer Bearer Token

#### Resposta de Sucesso (`200 OK`)
```json
{
  "id": "d1...",
  "userId": "c1...",
  "name": "Dieta Hipertrofia Limpa",
  "isActive": true,
  "meals": [
    {
      "id": "m1...",
      "name": "Café da Manhã",
      "orderIndex": 0,
      "items": [
        {
          "id": "item1...",
          "foodId": "taco-001",
          "quantityGrams": 200,
          "calories": 248.0,
          "protein": 5.2,
          "carbohydrates": 51.6,
          "lipids": 2.0,
          "fiber": 5.4,
          "sodium": 2.0,
          "food": { "name": "Arroz, integral, cozido" }
        }
      ],
      "totals": {
        "calories": 248.0,
        "protein": 5.2,
        "carbohydrates": 51.6,
        "lipids": 2.0,
        "fiber": 5.4,
        "sodium": 2.0
      }
    }
  ],
  "totals": {
    "calories": 248.0,
    "protein": 5.2,
    "carbohydrates": 51.6,
    "lipids": 2.0,
    "fiber": 5.4,
    "sodium": 2.0
  },
  "targetsComparison": {
    "targetCalories": 2200.0,
    "plannedCalories": 248.0,
    "calorieDelta": -1952.0,
    "proteinDelta": -140.0,
    "carbsDelta": -198.0,
    "fatDelta": -68.0
  },
  "restrictionAlerts": []
}
```

---

### 5.4. Adicionar Alimento a uma Refeição (RN04, RN05, RN08, RN10)
* **Método:** `POST`
* **Rota:** `/diets/:id/meals/:mealId/foods`
* **Autenticação:** Requer Bearer Token

#### Corpo da Requisição (JSON)
```json
{
  "foodId": "taco-002",
  "quantityGrams": 150
}
```

---

### 5.5. Atualizar Quantidade em Gramas de um Alimento (RN08)
* **Método:** `PUT`
* **Rota:** `/diets/:id/meals/:mealId/foods/:mealFoodId`
* **Autenticação:** Requer Bearer Token

#### Corpo da Requisição (JSON)
```json
{
  "quantityGrams": 200
}
```

---

### 5.6. Remover Alimento de uma Refeição (RN09)
* **Método:** `DELETE`
* **Rota:** `/diets/:id/meals/:mealId/foods/:mealFoodId`
* **Autenticação:** Requer Bearer Token

---

### 5.7. Gerador de Sugestão de Dieta Assistida (Seção 13, RF19)
Algoritmo que distribui alimentos da base TACO em refeições para atingir a meta calórica e de macronutrientes do usuário.
* **Método:** `POST`
* **Rota:** `/diets/generate-suggestion`
* **Autenticação:** Requer Bearer Token

#### Corpo da Requisição (JSON)
```json
{
  "name": "Sugestão Automática NutriPlan",
  "mealsCount": 4,
  "targetCalories": 2000,
  "targetProteinGrams": 150,
  "targetCarbsGrams": 200,
  "targetFatGrams": 65
}
```

---

## 6. Módulo de Treinos e Exercícios (`/workouts` e `/exercises`)

### 6.1. Consultar Catálogo de Exercícios
* **Método:** `GET`
* **Rota:** `/exercises`
* **Autenticação:** Requer Bearer Token
* **Query Parameters:** `query`, `muscleGroup`, `equipment`, `limit`, `offset`

---

### 6.2. Listar Fichas de Treino do Usuário (RN14)
* **Método:** `GET`
* **Rota:** `/workouts`
* **Autenticação:** Requer Bearer Token

---

### 6.3. Criar Ficha de Treino
* **Método:** `POST`
* **Rota:** `/workouts`
* **Autenticação:** Requer Bearer Token

#### Corpo da Requisição (JSON)
```json
{
  "name": "Treino A - Peitoral e Tríceps",
  "splitName": "Treino A",
  "estimatedDurationMin": 60,
  "description": "Foco em hipertrofia de peitoral superior"
}
```

---

### 6.4. Adicionar Exercício à Ficha de Treino (RN16)
* **Método:** `POST`
* **Rota:** `/workouts/:id/exercises`
* **Autenticação:** Requer Bearer Token

#### Corpo da Requisição (JSON)
```json
{
  "exerciseId": "ex-supino-reto",
  "sets": 4,
  "reps": 10,
  "weightKg": 30.0,
  "restSeconds": 90,
  "notes": "Descida controlada de 3 segundos"
}
```

---

### 6.5. Atualizar Exercício da Ficha de Treino (RN16, RN22)
Permite alterar o número de séries, repetições, carga em kg, tempo de descanso e anotações técnicas.
* **Método:** `PUT`
* **Rota:** `/workouts/:id/exercises/:weId`
* **Autenticação:** Requer Bearer Token

#### Corpo da Requisição (JSON)
```json
{
  "sets": 4,
  "reps": 12,
  "weightKg": 35.0,
  "restSeconds": 60,
  "notes": "Aumentada a carga em relação à semana anterior"
}
```

---

### 6.6. Reordenar Exercícios da Ficha de Treino
Persiste atomicamente a nova ordem dos exercícios da rotina no banco relacional SQLite.
* **Método:** `PUT`
* **Rota:** `/workouts/:id/exercises/reorder`
* **Autenticação:** Requer Bearer Token

#### Corpo da Requisição (JSON)
```json
{
  "exerciseIds": [
    "we-uuid-item-2",
    "we-uuid-item-1",
    "we-uuid-item-3"
  ]
}
```

---

### 6.7. Remover Exercício da Ficha de Treino
Remove o exercício da ficha e recalcula o total de séries da rotina.
* **Método:** `DELETE`
* **Rota:** `/workouts/:id/exercises/:weId`
* **Autenticação:** Requer Bearer Token

---

### 6.8. Registrar Execução de Treino (RN22, RN24 - Histórico Imutável)
Grava uma sessão de treino concluída na tabela de histórico `workout_logs` e `workout_log_exercises`.
* **Método:** `POST`
* **Rota:** `/workouts/:id/log`
* **Autenticação:** Requer Bearer Token

#### Corpo da Requisição (JSON)
```json
{
  "performedDate": "2026-10-06",
  "durationMin": 65,
  "notes": "Treino concluído com alta intensidade",
  "exercises": [
    {
      "exerciseId": "ex-supino-reto",
      "exerciseName": "Supino Reto com Barra",
      "setsCompleted": 4,
      "repsCompleted": 10,
      "weightUsedKg": 32.5,
      "notes": "Aumentei a carga na última série"
    }
  ]
}
```

---

### 6.6. Consultar Histórico de Execuções de Treino (RN23, RN24)
* **Método:** `GET`
* **Rota:** `/workout-logs`
* **Autenticação:** Requer Bearer Token

---

## 7. Módulo de Painel de Controle (`/dashboard`)

### 7.1. Obter Resumo Consolidado do Sistema
Retorna em uma única chamada de alta performance todos os dados necessários para o dashboard do usuário: métricas do perfil, metas ativas, dieta em andamento, ficha de treino e execuções recentes com disclaimer de saúde obrigatório.
* **Método:** `GET`
* **Rota:** `/dashboard`
* **Autenticação:** Requer Bearer Token

---

## 8. Módulo de Geração Assistida de Treino (`/workouts/generate-suggestion`)

### 8.1. Gerar Proposta Automática de Treino
Gera um programa completo com rotinas divididas por objetivo e nível utilizando o catálogo oficial de exercícios.
* **Método:** `POST`
* **Rota:** `/workouts/generate-suggestion`
* **Autenticação:** Requer Bearer Token

#### Corpo da Requisição (JSON)
```json
{
  "goal": "HYPERTROPHY",
  "daysPerWeek": 4,
  "level": "INTERMEDIATE",
  "durationMin": 60
}
```

---

## 9. Módulo de Profissionais (`/professionals`)

### 9.1. Cadastro de Profissional (4 Etapas)
Cria uma solicitação de credenciamento profissional com status inicial `PENDING`.
* **Método:** `POST`
* **Rota:** `/professionals/register`
* **Autenticação:** Pública

#### Corpo da Requisição (JSON)
```json
{
  "name": "Dra. Renata Nutricionista",
  "email": "renata@nutri.com",
  "password": "SenhaSegura123",
  "phone": "(11) 98888-7777",
  "specialty": "NUTRITIONIST",
  "councilType": "CRN",
  "councilNumber": "CRN 54321/SP",
  "councilState": "SP",
  "bio": "Especialista em nutrição esportiva e clínica",
  "documentName": "carteira_crn.pdf",
  "documentData": "data:application/pdf;base64,..."
}
```

### 9.2. Listar Profissionais Aprovados
Retorna a lista de especialistas homologados para consulta dos alunos.
* **Método:** `GET`
* **Rota:** `/professionals`
* **Autenticação:** Requer Bearer Token

### 9.3. Obter Perfil do Profissional Conectado
* **Método:** `GET`
* **Rota:** `/professionals/me`
* **Autenticação:** Requer Bearer Token (`PROFESSIONAL`)

### 9.4. Listar Alunos e Pacientes Vinculados
* **Método:** `GET`
* **Rota:** `/professionals/clients`
* **Autenticação:** Requer Bearer Token (`PROFESSIONAL`)

### 9.5. Vincular Novo Aluno ao Profissional
* **Método:** `POST`
* **Rota:** `/professionals/clients/:clientId/link`
* **Autenticação:** Requer Bearer Token (`PROFESSIONAL`)

---

## 10. Módulo de Administração (`/admin`)

### 10.1. Métricas da Plataforma
* **Método:** `GET`
* **Rota:** `/admin/overview`
* **Autenticação:** Requer Bearer Token (`ADMIN`)

### 10.2. Listar Solicitações de Credenciamento
* **Método:** `GET`
* **Rota:** `/admin/professionals`
* **Parâmetros de Consulta:** `status` (opcional: `PENDING`, `APPROVED`, `REJECTED`, `CORRECTION_REQUESTED`)
* **Autenticação:** Requer Bearer Token (`ADMIN`)

### 10.3. Moderar Cadastro Profissional
* **Método:** `PUT`
* **Rota:** `/admin/professionals/:id/status`
* **Autenticação:** Requer Bearer Token (`ADMIN`)

#### Corpo da Requisição (JSON)
```json
{
  "status": "APPROVED",
  "reviewNotes": "Registro validado no portal oficial do conselho de classe regional."
}
```

### 10.4. Listar Todos os Usuários
* **Método:** `GET`
* **Rota:** `/admin/users`
* **Autenticação:** Requer Bearer Token (`ADMIN`)

---

## 11. Módulo de Mensageria (`/messages`)

### 11.1. Listar Conversas Ativas
* **Método:** `GET`
* **Rota:** `/messages/conversations`
* **Autenticação:** Requer Bearer Token

### 11.2. Consultar Histórico de Mensagens com um Contato
* **Método:** `GET`
* **Rota:** `/messages/:contactId`
* **Autenticação:** Requer Bearer Token

### 11.3. Enviar Mensagem Direta
* **Método:** `POST`
* **Rota:** `/messages/:contactId`
* **Autenticação:** Requer Bearer Token

#### Corpo da Requisição (JSON)
```json
{
  "content": "Olá, preciso de orientação sobre a quantidade de carboidratos no pré-treino."
}
```

