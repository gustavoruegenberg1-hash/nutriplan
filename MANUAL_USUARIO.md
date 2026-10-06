# Manual do Usuário - NutriPlan v2

Bem-vindo ao **NutriPlan v2**, seu sistema integrado e científico de planejamento de dieta alimentar e treinamento resistido. Este guia foi elaborado para auxiliá-lo a utilizar todas as funcionalidades da aplicação com facilidade em seu computador, tablet ou celular.

---

## 1. Cadastro e Primeiro Acesso

### 1.1. Criando sua Conta
1. Ao acessar a aplicação pelo navegador (`http://localhost:5173`), caso não esteja autenticado, você será direcionado para a tela de **Login**.
2. Clique no link **"Não tem uma conta? Cadastre-se"** na parte inferior do formulário.
3. Preencha seus dados:
   * **Nome Completo**;
   * **E-mail válido**;
   * **Senha de acesso** (mínimo de 6 caracteres).
4. Clique em **"Criar Conta"**. Sua conta será criada de forma segura com criptografia de ponta e você será autenticado automaticamente.

### 1.2. Fazendo Login
1. Na tela inicial de login, informe seu e-mail e sua senha cadastrados.
2. Clique em **"Entrar no Sistema"**.
3. O sistema redirecionará você para o seu **Painel Principal (Dashboard)**.

---

## 2. Configurando seu Perfil e Metas Antropométricas

Antes de montar sua primeira dieta ou treino, é fundamental configurar seu perfil biológico para que o motor nutricional calcule suas metas exatas:
1. No menu superior (ou na barra inferior em celulares), clique em **"Perfil"**.
2. Preencha seus dados corporais:
   * **Idade** (anos);
   * **Sexo Biológico** (Masculino ou Feminino - utilizado na fórmula metabólica padrão Mifflin-St Jeor);
   * **Peso Atual** (em kg);
   * **Altura** (em centímetros);
   * **Nível de Atividade Física** (Sedentário, Levemente Ativo, Moderadamente Ativo, Muito Ativo ou Extremamente Ativo);
   * **Objetivo Atual** (Emagrecimento, Manutenção de Peso ou Ganho de Massa Muscular).
3. Selecione suas **Restrições Alimentares**:
   * Marque alergias ou intolerâncias aplicáveis (ex: *Intolerância à Lactose*, *Intolerância ao Glúten*, *Dieta Vegetariana*, *Dieta Vegana*, etc.).
4. Clique em **"Salvar Alterações do Perfil"**.
5. O sistema recalculará imediatamente:
   * Sua **Taxa Metabólica Basal (TMB)**;
   * Seu **Gasto Energético Total Diário (TDEE)**;
   * Suas **Metas Diárias de Calorias, Proteínas, Carboidratos, Gorduras e Fibras**.

---

## 3. Navegando pelo Painel Principal (Dashboard)

O Dashboard centraliza todas as informações essenciais em uma única visão:
* **Cards Superiores**: Exibem seu peso atual, TMB, TDEE e a meta calórica do seu objetivo.
* **Balanço Nutricional**: Mostra a comparação visual entre a meta calculada do seu perfil e o que você planejou na sua dieta ativa, indicando se faltam calorias ou se você está em excesso.
* **Alertas Inteligentes**: Avisa caso algum alimento da sua dieta entre em conflito com suas restrições alimentares.
* **Treinos Recentes**: Atalhos para suas rotinas de exercício cadastradas e resumo das últimas execuções realizadas.
* **Aviso de Saúde (RN27)**: Lembrete ético e legal sobre a importância do acompanhamento multiprofissional.

---

## 4. Montando sua Dieta Personalizada

### 4.1. Criando uma Nova Dieta
1. Acesse o menu **"Dieta"**.
2. Caso ainda não possua uma dieta, clique em **"Nova Dieta"** e dê um nome ao seu plano (ex: *Dieta Hipertrofia 2026*).

### 4.2. Adicionando Refeições
1. Dentro do seu plano de dieta, clique em **"+ Nova Refeição"**.
2. Escolha o nome da refeição (ex: *Café da Manhã*, *Almoço*, *Lanche da Tarde*, *Jantar*, *Ceia*).

### 4.3. Adicionando Alimentos da Base Científica TACO
1. Na refeição desejada, clique em **"+ Adicionar Alimento"**.
2. A interface de seleção da **Tabela TACO (744 alimentos oficiais)** será aberta.
3. Digite o nome do alimento na barra de busca (ex: *Arroz*, *Frango*, *Feijão*, *Ovo*, *Banana*).
4. O catálogo exibirá apenas as informações essenciais por 100g: **Nome**, **Categoria**, **Calorias**, **Proteínas**, **Carboidratos** e **Gorduras**.
5. Clique no alimento desejado para selecioná-lo.
6. Informe a porção em **gramas** (ex: 100g). O sistema valida a entrada, impedindo valores zerados, negativos ou em branco.
7. Veja a prévia instantânea dos macronutrientes proporcionais à quantidade informada.
8. Clique em **"ADICIONAR À REFEIÇÃO"**. Em caso de falha de conexão, uma mensagem clara com botão de tentar novamente será apresentada.
9. O sistema atualizará os totais da refeição e da dieta automaticamente.

### 4.4. Editando e Removendo Alimentos da Dieta
* **Editar quantidade:** No card do alimento dentro da refeição, clique no botão **"Editar"** ou sobre o valor em gramas, digite o novo peso e clique em **"Salvar"**. Os macronutrientes da refeição e os totais diários serão recalculados imediatamente.
* **Remover alimento:** Clique no ícone de lixeira (**"Remover"**) para excluir o item. Os totais calóricos e nutricionais são subtraídos na mesma hora.

### 4.5. Gerador de Dieta Assistido (Montagem Automática)
* Se preferir uma sugestão automática inicial baseada nas metas do seu perfil, clique no botão **"Montar Nova Dieta (8 Etapas)"** no topo da tela de dietas.
* O sistema distribuirá alimentos balanceados da base TACO entre as refeições do seu dia para atingir suas metas de calorias e proteínas. Você poderá editar, trocar ou remover qualquer alimento da sugestão a qualquer momento.

---

## 5. Consultando a Tabela Nutricional TACO e Simulador de Porções

1. Acesse o menu **"Alimentos (TACO)"**.
2. Navegue pelos 744 alimentos oficiais catalogados pelo NEPA/UNICAMP.
3. Utilize os filtros rápidos por categoria (Carnes, Cereais, Frutas, Laticínios, etc.) ou por tags (*Proteico*, *Zero Carb*, *Fibras*).
4. **Simulador de Porção Proporcional (RN10)**:
   * Clique em qualquer alimento da lista.
   * Altere o campo **"Porção Consumida (gramas)"** no topo da tela.
   * Veja em tempo real a decomposição exata de Calorias, Proteínas, Carboidratos, Gorduras, Fibras e Sódio para a quantidade informada.

---

## 6. Planejando e Acompanhando seus Treinos

### 6.1. Criando uma Ficha de Treino
1. Acesse o menu **"Treino"** (ou a aba Treino).
2. Clique no botão **"Nova Ficha"**.
3. Defina o nome da ficha (ex: *Treino A - Peitoral e Tríceps*), a divisão muscular (*Treino A*, *Treino B*, *Superior*, *Inferior*, etc.) e a duração estimada em minutos.

### 6.2. Adicionando Exercícios à Ficha (Fluxo Passo a Passo)
1. Na ficha de treino ativa, localize a seção de exercícios e clique no botão **"+ Adicionar Exercício"**.
2. Uma janela dedicada e otimizada para mobile e desktop será aberta:
   * **Busca Rápida**: Digite o nome do exercício (ex: *Supino*, *Agachamento*, *Puxada*).
   * **Filtros por Grupamento Muscular**: Toque nos chips rápidos (Todos, Peito, Costas, Pernas, Ombros, Bíceps, Tríceps, Abdômen).
   * **Seleção do Exercício**: Toque no exercício desejado dentre os 128 exercícios do catálogo. O sistema exibe o nome, músculo principal e equipamento.
3. Configure os parâmetros da prescrição:
   * **Séries**: Quantidade de séries (mínimo 1, padrão 3 ou 4);
   * **Repetições**: Faixa de repetições planejada (mínimo 1, padrão 8 a 12);
   * **Carga Sugerida (kg)**: Carga inicial em quilogramas (opcional, padrão 0);
   * **Tempo de Descanso (segundos)**: Intervalo de recuperação entre séries (mínimo 1, padrão 60s);
   * **Observações Técnicas**: Orientações de cadência ou pegada (opcional).
4. Clique em **"Adicionar à Ficha"**. O botão exibe estado de carregamento e trata eventuais falhas com opção de repetição imediata.

### 6.3. Editando e Reordenando Exercícios
Cada exercício é exibido como um card vertical responsivo, ideal para dispositivos móveis:
* **Reordenação (Subir / Descer)**: Utilize as setas **▲** e **▼** em cada exercício para alterar a sequência cronológica do treino. A nova ordem é salva atomicamente no servidor.
* **Editar Exercício**: Clique no botão **"Editar"** para abrir o modal de ajustes de séries, repetições, carga planejada e descanso. Ao salvar, as alterações são gravadas imediatamente.
* **Remover Exercício**: Clique no botão **"Remover"** (ícone de lixeira) para retirar o exercício da rotina com confirmação.

### 6.4. Seção Integrada: Precisa de Ajuda com seu Treino? [ Falar com Personal ]
Em todas as resoluções (Desktop, Tablet e Celular), a tela de treinos inclui uma área permanente de suporte técnico:
* **Aluno com Personal Vinculado**: O sistema reconhece o educador físico credenciado e o botão **"Falar com Personal"** abre diretamente a conversa em tempo real com seu treinador.
* **Aluno sem Personal**: É exibido o aviso amigável *"Você ainda não possui um profissional de treinamento associado"*, com botão rápido para abrir a lista de treinadores físicos homologados no sistema, permitindo solicitar acompanhamento profissional imediatamente.

### 6.5. Registrando a Execução Real do Treino (Log de Treino)
1. Ao concluir uma sessão de treinamento na academia ou em casa, abra sua ficha e clique no botão **"Registrar Execução"**.
2. O sistema abrirá a ficha preenchida com os exercícios daquele treino.
3. Ajuste caso você tenha feito repetições diferentes ou cargas diferentes (ex: aumentou de 30kg para 32.5kg na última série).
4. Informe a duração real em minutos e observações do seu treino.
5. Clique em **"Concluir e Salvar Log"**.
6. A sessão será arquivada permanentemente no seu histórico!

---

## 7. Consultando o Histórico e a Evolução Física

### 7.1. Histórico de Treinos (RN24 - Imutabilidade)
1. Acesse o menu **"Histórico"**.
2. Visualize cronologicamente todas as sessões de treino realizadas, com a data, duração, volume total de carga levantada (kg) e os exercícios executados.
3. *Garantia do Sistema:* Mesmo que você decida reorganizar, renomear ou excluir sua ficha de treino ativa no futuro, seus registros passados de esforço físico continuarão eternamente preservados no histórico.

### 7.2. Evolução Antropométrica e Linha do Tempo de Pesagens
1. Acesse o menu **"Evolução"**.
2. Visualize:
   * Seu **Peso Atual** e o **Índice de Massa Corporal (IMC)** calculado com sua respectiva classificação;
   * A **Variação Total de Peso** (kg perdidos ou ganhos desde a primeira pesagem);
   * A **Linha do Tempo de Pesagens** detalhada.
3. Para registrar uma nova medição, use o formulário **"Registrar Nova Pesagem"**, informe seu peso aferido e clique em **"Salvar Registro"**.

---

## 8. Orientações de Saúde e Segurança

* Todas as estimativas de calorias, taxa metabólica e divisão de macronutrientes utilizam equações científicas amplamente aceitas pela comunidade médica e nutricional (Mifflin-St Jeor, 1990).
* O NutriPlan v2 é uma ferramenta de apoio ao planejamento esportivo e nutricional. Sempre consulte um médico, nutricionista (CRN) e educador físico (CREF) antes de iniciar mudanças radicais em sua dieta ou protocolos de treinamento de alta intensidade.

---

## 9. Nova Navegação Simplificada (4 Abas Principais)

O NutriPlan v2 agora possui uma interface concisa organizada em apenas 4 abas para o aluno:
1. **Dashboard**: Painel inicial consolidado com resumo de dieta, treinos, progresso físico e botão para falar com especialistas.
2. **Dieta**: Reúne sua dieta atual, o assistente passo a passo em 8 etapas, o catálogo de 744 alimentos da TACO e o balanço de metas.
3. **Treino**: Reúne sua ficha atual, o assistente passo a passo em 8 etapas, o registrador de treino, a linha do tempo histórica e o catálogo de 128 exercícios.
4. **Perfil**: Reúne seus dados antropométricos, metas, preferências, evolução de peso com IMC e alteração de senha de segurança.

---

## 10. Assistente de Montagem de Dieta (8 Etapas Guiadas)

Ao acessar a aba **Dieta** e clicar em **"Montar Nova Dieta (8 Etapas)"**, você verá a tela de introdução `# MONTE SUA DIETA`. Clique em `[ INICIAR MONTAGEM ]` para seguir o fluxo:
* **Etapa 1: Objetivo**: Escolha entre Emagrecimento, Manutenção ou Hipertrofia.
* **Etapa 2: Dados Corporais**: Revise sua idade, sexo, peso e altura.
* **Etapa 3: Nível de Atividade**: Selecione sua frequência e intensidade de atividades no dia a dia.
* **Etapa 4: Número de Refeições**: Escolha entre 3 e 6 refeições diárias.
* **Etapa 5: Preferências e Restrições**: Marque caso seja Vegetariano, Vegano, Celíaco (Sem Glúten) ou Intolerante a Lactose.
* **Etapa 6: Estimativa de Calorias e Macros**: O sistema calcula sua TMB e GET pela fórmula de Mifflin-St Jeor e exibe a divisão ideal de Proteínas, Carboidratos e Gorduras.
* **Etapa 7: Proposta Inicial de Refeições**: Uma estrutura de cardápio com alimentos da TACO é proposta.
* **Etapa 8: Conclusão**: Clique no botão `[ VER MINHA DIETA ]`. A dieta será salva como ativa e você poderá editar qualquer gramagem livremente!

---

## 11. Assistente de Montagem de Treino (8 Etapas Guiadas)

Ao acessar a aba **Treino** e clicar em **"Montar Novo Treino (8 Etapas)"**, você verá `# MONTE SEU TREINO`. Clique em `[ INICIAR MONTAGEM ]`:
* **Etapa 1: Objetivo**: Hipertrofia, Força, Emagrecimento ou Condicionamento.
* **Etapa 2: Nível de Experiência**: Iniciante, Intermediário ou Avançado.
* **Etapa 3: Frequência Semanal**: 2 a 6 dias disponíveis por semana.
* **Etapa 4: Tempo Disponível**: 30, 45, 60 ou 90 minutos por sessão.
* **Etapa 5: Equipamentos**: Academia completa, halteres em casa ou apenas peso corporal.
* **Etapa 6: Limitações**: Nenhuma, Coluna/Lombar, Joelhos ou Ombros.
* **Etapa 7: Proposta de Divisão**: O sistema sugere a melhor divisão (Full Body, AB Upper/Lower ou ABC Push/Pull/Legs).
* **Etapa 8: Conclusão**: Clique em `[ VER TREINO ]` para acessar a ficha montada com exercícios selecionados do banco de 128 itens!

---

## 12. Comunicação com Especialistas e Módulo Profissional

* **Falar com Profissional**: Em qualquer tela ou pelo botão destacado no topo, clique em *"Falar com Profissional"*. Você poderá visualizar nutricionistas e educadores físicos homologados, iniciar conversas e tirar dúvidas técnicas.
* **Cadastro de Profissional (`/register-professional`)**:
  - Nutricionistas e treinadores realizam o cadastro em 4 etapas informando seu registro de classe (CRN / CREF) e anexando comprovante documental.
  - O cadastro fica com status *"Em Análise"* até ser moderado pelo Administrador.
* **Painel do Especialista (`/professional`)**:
  - Profissionais aprovados acompanham seus alunos vinculados, inspecionam metas e históricos de peso e prestam suporte via chat.

---

## 13. Painel de Administração e Governança (`/admin`)

* O Administrador da plataforma acessa indicadores em tempo real (total de usuários, profissionais ativos, dietas e treinos).
* Na aba **"Moderação de Especialistas"**, analisa documentos anexados e pode **Aprovar**, **Solicitar Correções** com justificativa ou **Rejeitar** solicitações de credenciamento.

