# Diretrizes e Regras do NutriPlan

## 🇧🇷 Idioma Oficial do Projeto: Português do Brasil (pt-BR)

Todas as comunicações, interfaces, formulários, feedbacks, validações e mensagens de erro do sistema devem ser estritamente em **Português do Brasil (pt-BR)**.

### Regras Obrigatórias:
1. **Mensagens de Erro e Validações:**
   - Nunca retornar mensagens de erro genéricas em inglês (ex: `Invalid credentials`, `User not found`, `Unauthorized`).
   - Retornar mensagens claras em pt-BR (ex: `Credenciais inválidas. Verifique seu e-mail e senha.`, `Usuário não encontrado.`, `Sessão expirada. Faça login novamente.`).
2. **Interface do Usuário (Frontend):**
   - Todos os botões, títulos, placeholders, tooltips, modais, dias da semana e gráficos devem estar em português brasileiro.
   - Utilizar pontuação e formatos numéricos brasileiros quando aplicável (ex: `1.500 kcal`, `80,5 kg`).
3. **Autosave e Persistência:**
   - As alterações feitas em Dietas e Treinos devem persistir automaticamente e sincronizar com o Dashboard sem perda de dados do usuário.
4. **Unidades de Medida Contextuais:**
   - Cada alimento/bebida deve exibir apenas unidades que façam sentido para o seu formato (ex: `ml`, `copo`, `lata` para líquidos; `scoop`, `colher`, `g` para suplementos; `fatia`, `g` para queijos e pães; `unidade` para frutas e ovos).
