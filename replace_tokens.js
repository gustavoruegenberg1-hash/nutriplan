const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'web/src/pages/Dashboard.tsx',
  'web/src/pages/Login.tsx',
  'web/src/pages/Register.tsx',
  'web/src/pages/Profile.tsx',
  'web/src/pages/Articles.tsx',
  'web/src/pages/ArticleDetail.tsx',
  'web/src/components/Navbar.tsx',
  'web/src/components/BottomNav.tsx',
  'web/src/components/MacroCard.tsx',
  'web/src/components/MacroChart.tsx',
  'web/src/components/pet/DashboardPetCard.tsx',
  'web/src/App.tsx',
  'web/src/index.css'
];

const basePath = 'C:\\Users\\Mamelas\\.gemini\\antigravity\\scratch\\nutriplan';

const replacements = [
  { regex: /bg-\[#0B0F17\]/g, replacement: 'bg-canvas' },
  { regex: /bg-\[#111827\]/g, replacement: 'bg-surface' },
  { regex: /bg-\[#0F172A\]/g, replacement: 'bg-canvas' },
  { regex: /bg-slate-950/g, replacement: 'bg-canvas' },
  { regex: /bg-\[#1F2937\]/g, replacement: 'bg-surface-alt' },
  { regex: /bg-slate-800/g, replacement: 'bg-surface-alt' },
  { regex: /border-\[#1F2937\]/g, replacement: 'border-surface-border' },
  { regex: /border-slate-800/g, replacement: 'border-surface-border' },
  { regex: /border-slate-700/g, replacement: 'border-surface-border' },
  { regex: /hover:bg-\[#1E293B\]/g, replacement: 'hover:bg-surface-hover' },
  { regex: /hover:bg-slate-700/g, replacement: 'hover:bg-surface-hover' }
];

filesToUpdate.forEach(relPath => {
  const fullPath = path.join(basePath, relPath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    replacements.forEach(r => {
      content = content.replace(r.regex, r.replacement);
    });

    if (relPath.includes('index.css')) {
       content = content.replace(/background-color:\s*#0B0F17;/g, 'background-color: var(--color-canvas);');
       content = content.replace(/background:\s*#0B0F17;/g, 'background: var(--color-canvas);');
       content = content.replace(/background:\s*#1F2937;/g, 'background: var(--color-surface-border);');
    }

    fs.writeFileSync(fullPath, content, 'utf8');
  } else {
    console.log("Not found:", fullPath);
  }
});
