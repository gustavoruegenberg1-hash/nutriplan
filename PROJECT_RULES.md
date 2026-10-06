# REGRA PERMANENTE — PROTEÇÃO DO PROJETO CONTRA ROLLBACK (NUTRIPLAN V2)

A partir deste momento, NÃO faça rollback, restore, reset ou substituição completa do projeto para corrigir erros.

## 1. PRESERVAÇÃO OBRIGATÓRIA

Sempre preserve a versão ATUAL do aplicativo.

Quando o usuário solicitar uma correção:
* altere somente os arquivos necessários;
* altere somente o código relacionado ao problema;
* preserve todas as funcionalidades existentes;
* preserve o layout atual;
* preserve estilos, componentes, páginas e configurações;
* preserve melhorias feitas anteriormente;
* preserve textos, imagens, banco de dados e integrações;
* NÃO substitua arquivos atuais por versões antigas;
* NÃO recrie o projeto do zero;
* NÃO utilize uma versão anterior como base sem autorização explícita do usuário.

A versão atual é sempre a fonte principal do projeto.

---

## 2. CORREÇÃO DE ERROS

Antes de modificar qualquer coisa:
1. identifique exatamente qual é o erro;
2. localize o arquivo responsável;
3. descubra a causa do problema;
4. faça a menor alteração possível para corrigir o erro (patch cirúrgico);
5. verifique se a alteração não quebra funcionalidades existentes.

Se o erro puder ser corrigido em um único arquivo, NÃO altere outros arquivos sem necessidade.

---

## 3. PROIBIÇÃO DE ROLLBACK

É PROIBIDO executar ou simular:
* rollback;
* restore;
* reset para versão anterior;
* checkout de versões antigas;
* substituição do projeto atual por backup antigo;
* restauração de commit antigo;
* recriação do projeto baseada em uma versão anterior;
* remoção de melhorias existentes para resolver um erro.

Só faça isso se o usuário escrever explicitamente:
`"FAZER ROLLBACK"` ou `"RESTAURAR A VERSÃO ANTERIOR"`.

Mesmo nesse caso, antes de executar, informe o que será perdido.

---

## 4. PROTEÇÃO DAS MELHORIAS

Considere TODAS as funcionalidades presentes na versão atual como importantes.

Ao corrigir um problema, faça uma análise de regressão:
* O que já funciona?
* O que foi adicionado recentemente?
* O que será alterado?
* Existe alguma funcionalidade que depende desse código?
* A correção pode remover alguma melhoria?

Se houver risco de perder uma funcionalidade, NÃO remova a funcionalidade.
Procure uma solução que mantenha a melhoria e corrija o erro simultaneamente.

---

## 5. BACKUP ANTES DE ALTERAÇÕES GRANDES

Se uma alteração exigir mudanças em vários arquivos ou uma mudança estrutural importante:
1. preserve a versão atual;
2. crie um backup/ponto de restauração da versão atual;
3. faça as alterações;
4. teste;
5. somente depois considere a alteração concluída.

NUNCA substitua o backup anterior pelo projeto modificado.

---

## 6. NÃO APAGAR FUNCIONALIDADES PARA "SIMPLIFICAR"

Não remova código, páginas, componentes ou funcionalidades simplesmente porque isso torna a correção mais fácil.

Não use soluções como:
* "vou voltar para uma versão mais simples"
* "vou recriar essa página"
* "vou restaurar a versão anterior"
* "vou substituir o arquivo inteiro"
sem autorização do usuário.

A prioridade é: **CORRIGIR O ERRO + PRESERVAR O PROJETO ATUAL**.

---

## 7. ALTERAÇÃO MÍNIMA

Sempre prefira:
**PATCH PEQUENO → TESTE → CORREÇÃO → TESTE NOVAMENTE**

em vez de:
ERRO → RESTAURAR VERSÃO ANTIGA → PERDER FUNCIONALIDADES.

---

## 8. ARQUIVOS NÃO RELACIONADOS

Se um arquivo não estiver relacionado ao erro solicitado, NÃO altere esse arquivo.
Se for necessário alterar um arquivo adicional, explique previamente por que ele precisa ser alterado.

---

## 9. VERSÃO ANTIGA DO SITE

A versão anterior (`nutriplan` v1) funciona como referência segura e backup intacto em `C:\Users\Gustavo\Projetos\nutriplan`.
NÃO remova a versão de referência.
NÃO remova dependências ou configurações necessárias ao funcionamento do aplicativo.

---

## 10. ANTES DE FINALIZAR UMA CORREÇÃO

Verifique a checklist:
- [ ] O erro original foi corrigido?
- [ ] As funcionalidades existentes continuam funcionando?
- [ ] As melhorias recentes continuam presentes?
- [ ] O layout atual foi preservado?
- [ ] Nenhuma página foi perdida?
- [ ] Nenhum componente foi removido sem necessidade?
- [ ] Nenhum arquivo não relacionado foi alterado?
- [ ] Não ocorreu rollback?
- [ ] A versão atual continua sendo a base do projeto?

---

## REGRA PRINCIPAL

> **NUNCA sacrifique melhorias existentes para corrigir um erro.**  
> **"CORRIJA O PROBLEMA SEM DESFAZER O QUE JÁ FUNCIONA."**  
> *Se não for possível corrigir o erro sem realizar uma alteração potencialmente destrutiva, PARE e informe o risco antes de continuar.*
