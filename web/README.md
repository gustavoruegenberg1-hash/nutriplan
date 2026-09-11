# NutriPlan Frontend Web & Mobile 🌐📱

Interface do usuário desenvolvida em **React 19**, **TypeScript** e **Vite 8**, estilizada com **Tailwind CSS v4** e empacotada para Android nativo via **Capacitor 8**.

---

## 🎨 Design System e Cores

O projeto utiliza um conjunto centralizado de Design Tokens declarados no `@theme` de `src/index.css`:

- **Superfícies:** `--color-canvas: #0C1117`, `--color-surface: #151D28`, `--color-surface-border: #243044`
- **Primária:** `--color-primary: #14B8A6` (Teal 500)
- **Macronutrientes:**
  - Calorias: `--color-calories: #F97316` (Laranja)
  - Proteínas: `--color-protein: #F43F5E` (Rosa)
  - Carboidratos: `--color-carbs: #3B82F6` (Azul)
  - Gorduras: `--color-fat: #EAB308` (Amarelo Dourado)
  - Fibras: `--color-fiber: #10B981` (Verde Esmeralda)

---

## 📱 Páginas e Rotas

- `/` — **Dashboard:** Visão holística do dia, saudação contextual, checklist dinâmico de "Próximas Ações", progresso nutricional com skeletons de carregamento, treino do dia e artigo recomendado.
- `/diet` — **Montador de Dieta:** Busca na tabela TACO, otimizador de déficit calórico sustentável, calibração de porções práticas e alertas de alérgenos.
- `/workout` — **Montador de Treino:** Catálogo biomecânico com prevenção de lesões e prescrição detalhada de exercícios.
- `/jogo` — **NutriHero RPG:** Arena de batalha contra comidas ultraprocessadas, inventário, abertura de baús e cuidados com o Mascote.
- `/articles` — **Biblioteca Científica:** Artigos revisados por pares com links PubMed/DOI.
- `/profile` — **Prontuário e Perfil:** Medidas antropométricas, %BF, histórico de lesões e mapa de dores musculares.

---

## 🚀 Comandos de Desenvolvimento

```bash
# Instalação das dependências
npm install

# Iniciar servidor de desenvolvimento (porta 5173)
npm run dev

# Análise estática com Oxlint
npm run lint

# Compilação de produção (gera pasta /dist)
npm run build
```

---

## 📲 Integração Mobile (Android)

```bash
# Compilar frontend e sincronizar com o projeto Android
npm run build
npx cap sync android

# Abrir no Android Studio para emulação ou compilação de APK
npx cap open android
```

---

## ♿ Acessibilidade e Usabilidade (WCAG 2.1)

- Modais nativos acessíveis (`ConfirmDialog` e `InputDialog`) substituindo `window.prompt` e `window.confirm`.
- Suporte a navegação por teclado e foco semântico (`role="button"`, `tabIndex`, `onKeyDown`).
- Touch targets calibrados para dispositivos touch (mínimo 44x44px).
- Labels de formulários estritamente vinculados via `htmlFor` e `id`.
- Viewport livre de bloqueio de zoom para usuários com baixa visão.
