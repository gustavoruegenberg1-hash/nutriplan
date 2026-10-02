# NutriPlan — Manual do Usuário
**Projeto:** NutriPlan — Sistema Integrado de Nutrição, Treino e Gamificação RPG  
**Instituição:** FATEC Campinas — Curso Superior de Tecnologia em Análise e Desenvolvimento de Sistemas (5º ADS Noturno - 2.2026)  
**Disciplina:** Laboratório de Engenharia de Software (LES)  
**Versão:** 2.0.0 — 2026-10-02  

---

## 1. Introdução

Bem-vindo ao **NutriPlan**! Este manual foi elaborado para orientar você em todas as funcionalidades do sistema, desde o seu primeiro acesso e preenchimento de perfil até o planejamento avançado de refeições, prescrição de treinos com segurança biomecânica, monitoramento de hidratação com mascote virtual, evolução no jogo RPG NutriHero e acompanhamento com profissionais de saúde credenciados.

---

## 2. Acesso à Plataforma e Autenticação

### 2.1 Cadastro de Conta
1. Acesse a tela inicial do sistema.
2. Clique na aba **"Cadastre-se"**.
3. Preencha seu nome completo, e-mail válido e crie uma senha segura (mínimo de 6 caracteres).
4. Opcionalmente, utilize o botão **"Continuar com o Google"** para um cadastro instantâneo através da sua conta Google OAuth 2.0.
5. Se optou pelo cadastro por e-mail, um código transacional de verificação de 6 dígitos será enviado para a sua caixa de entrada através do serviço seguro Resend. Insira o código na tela para ativar sua conta.

### 2.2 Login e Recuperação de Sessão
1. Na tela de login, informe seu e-mail e senha ou clique em **"Continuar com o Google"**.
2. O sistema gera uma sessão segura de **30 dias**, garantindo que seus dados e sua navegação permaneçam conectados mesmo se o dispositivo for reiniciado ou ficar ocioso.

---

## 3. Painel Principal (Dashboard) e Perfil Antropométrico

### 3.1 Preenchimento da Anamnese e Dados Corporais
No primeiro acesso, acesse a aba **"Perfil"** no menu de navegação para configurar seus parâmetros fisiológicos:
- **Dados Básicos:** Peso atual (kg), altura (cm), idade, sexo biológico e percentual de gordura corporal estimado.
- **Fator de Atividade Física:** Selecione seu estilo de rotina (Sedentário, Levemente Ativo, Moderadamente Ativo, Altamente Ativo ou Extremamente Ativo).
- **Tempo e Nível de Experiência:** Informe seu tempo de prática com exercícios resistidos (Iniciante < 6 meses, Intermediário 6 a 24 meses, Avançado > 2 anos).
- **Mapa Clínico de Dores e Lesões:** Indique regiões anatômicas onde você sente dor ou histórico de lesão (e.g., *Joelho Direito, Lombar, Ombro Esquerdo*) e a intensidade da dor em uma escala de 0 a 10.

### 3.2 Cálculos Científicos Automáticos
Assim que você preenche seus dados corporais, o motor de cálculo clínico do NutriPlan exibe instantaneamente:
- **Taxa Metabólica Basal (TMB):** Calculada pela fórmula de **Mifflin-St Jeor**, indicando o gasto energético do seu organismo em repouso absoluto.
- **Gasto Energético Total Diário (TDEE):** Quantidade total de calorias que seu corpo consome no dia, ponderando seu nível real de atividade física.

---

## 4. Planejador de Dieta & Otimizador Nutricional

### 4.1 Criação de Plano Alimentar
1. Acesse o menu **"Dieta"**.
2. Defina o seu objetivo calórico:
   - **Perda de Gordura:** Aplica o Otimizador de Déficit Calórico Sustentável (redução de 15% a 25% sobre o TDEE para preservar massa muscular).
   - **Manutenção de Peso:** Igual ao TDEE.
   - **Ganho de Massa Muscular (Hipertrofia):** Superávit calórico controlado (+10% a 15% sobre o TDEE).
3. Adicione as refeições desejadas para o seu dia (*Café da Manhã, Almoço, Lanche da Tarde, Jantar, Ceia*).

### 4.2 Pesquisa na Tabela TACO e Verificação de Alérgenos
1. Em qualquer refeição, clique em **"Adicionar Alimento"**.
2. Na primeira vez que for adicionar um alimento, o sistema abrirá um **modal interativo na própria página** (*DietaryRestrictionsModal*) com 3 perguntas rápidas sobre restrições alimentares (intolerância a lactose, alergia a glúten, frutos do mar, vegetarianismo, etc.). Responda em segundos sem sair da tela.
3. Digite o nome do alimento no campo de busca (e.g., *"Arroz integral"*, *"Filé de frango"*, *"Ovo de galinha"*). Os alimentos são consultados diretamente na base oficial da **Tabela TACO (UNICAMP)**.
4. Ajuste a quantidade em gramas (g). O sistema recalcula automaticamente:
   - Calorias totais (kcal).
   - Proteínas (g).
   - Carboidratos (g).
   - Gorduras totais (g).
   - Fibras alimentares (g) com monitoramento da meta da National Academies (**14g de fibras a cada 1.000 kcal**).
5. Se você tentar inserir um alimento que contenha um alérgeno conflitante com suas restrições, o sistema exibirá um alerta em destaque prevenindo acidentes alimentares.

### 4.3 Exportação e Importação de Dietas
- **Exportar:** Clique no ícone de exportação no topo do plano para baixar um arquivo `.json` com todas as refeições e gramaturas salvas.
- **Importar:** Caso seu nutricionista ou amigo compartilhe um plano compatível, use o botão **"Importar Plano"** e selecione o arquivo `.json` para carregar toda a estrutura instantaneamente.

---

## 5. Periodizador de Treino & Segurança Biomecânica

### 5.1 Montagem de Rotinas de Exercícios
1. Acesse o menu **"Treino"**.
2. Crie uma nova rotina (e.g., *"Treino A - Peito, Deltoide e Tríceps"*) ou escolha um preset científico (*Push/Pull/Legs*, *Upper/Lower*, *Full Body*).
3. Clique em **"Adicionar Exercício"** e filtre por grupo muscular (Peito, Costas, Quadríceps, Isquiotibiais, Ombros, Bíceps, Tríceps, Abdômen).

### 5.2 Filtro Biomecânico de Segurança (Proteção contra Lesões)
- Caso você tenha apontado no seu Perfil alguma dor articular ativa (por exemplo: dor no joelho nível 7 ou tendinite no ombro):
  - O sistema sinalizará com alertas visuais vermelhos e impedirá a seleção desavisada de exercícios contraindicados (e.g., agachamento livre pesado ou desenvolvimento com barra atrás da nuca).
  - São sugeridos exercícios substitutos seguros que trabalham o mesmo músculo sem sobrecarregar a articulação inflamada.

### 5.3 Prescrição de Séries e Intensidade (RPE)
Para cada exercício adicionado:
- Defina o número de séries (*Sets*).
- Informe o alvo de repetições e a carga planejada em quilogramas (kg).
- Estipule o tempo de intervalo de descanso entre séries (em segundos).
- Registre o **RPE** (Índice de Percepção Subjetiva de Esforço de 1 a 10), garantindo uma progressão segura de sobrecarga.

---

## 6. Rastreador de Hábitos & Mascote de Hidratação (NutriPet)

1. Na seção **"Hábitos"** ou através do card no Dashboard, você encontra o seu Mascote Virtual de Hidratação.
2. Sua meta de água diária é calculada automaticamente pelo seu peso corporal (35 ml por kg de peso).
3. A cada copo consumido, clique em **"+250 ml"** ou **"+500 ml"**:
   - A barra de progresso avança em direção à meta diária.
   - O mascote reage animadamente e seu humor melhora conforme você se mantém hidratado.
   - Bater a meta diária garante recompensas especiais no inventário do NutriHero RPG.

---

## 7. Gamificação Integrada (NutriHero RPG)

O NutriPlan transforma hábitos saudáveis em progressão no jogo estilo *Idle RPG*:

1. **Ações no Mundo Real viram Atributos no Jogo:**
   - **Concluir um treino planejado:** Concede +1 ponto em **Força (STR)** e um *Baú do Titã*.
   - **Atingir a meta de macros da dieta:** Concede +1 ponto em **Agilidade (AGI)** e um *Baú da Dieta*.
   - **Bater a meta de água:** Aumenta a **Vitalidade (VIT)** e regenera seu personagem.
2. **Arena de Batalha:**
   - Seu herói enfrenta monstros temáticos (*Onda de Açúcar*, *Colosso Ultraprocessado*, *Lorde do Sedentarismo*).
   - O combate é automático e baseado nos seus atributos reais de ataque, defesa e velocidade.
3. **Equipamentos e Fusão de Itens:**
   - Abra os baús obtidos na sua mochila/inventário.
   - Equipe seu personagem com elmos, armaduras, armas, escudos, botas e anéis.
   - Utilize a **Forja de Fusão** para fundir 3 itens de mesma raridade (Comum, Raro, Épico, Lendário) e gerar um item de nível superior.

---

## 8. Módulo de Profissionais de Saúde (Teleorientação)

1. Acesse o menu **"Profissionais"**.
2. **Catálogo Credenciado:** Visualize a lista de Nutricionistas (com número de registro CRN) e Treinadores/Educadores Físicos (com registro CREF).
3. **Solicitação de Acompanhamento:** Clique em **"Conectar com Profissional"** para iniciar o vínculo clínico.
4. **Prontuário Compartilhado:** Com sua autorização expressa, o profissional tem acesso aos seus gráficos de TDEE, histórico de refeições e dores registradas, permitindo que ele prescreva dietas e treinos individualizados para você.
5. **Chat Seguro:** Troque mensagens e tire dúvidas de execução de exercícios ou substituições de alimentos diretamente com seu profissional de referência.

---

## 9. Suporte a Dispositivos Móveis

- O NutriPlan é 100% responsivo (PWA) e otimizado para celulares e tablets Android e iOS.
- Para adicionar à tela inicial do seu celular, abra o sistema no Chrome ou Safari e selecione **"Adicionar à Tela de Início"**.
