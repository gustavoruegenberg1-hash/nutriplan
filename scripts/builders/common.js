/**
 * Módulo Comum de Tipografia e Formatação ABNT para o NutriPlan v2
 * Disciplina: Laboratório de Engenharia de Software - FATEC Campinas
 * Autores: Gustavo Meneses Ruegenberg Rodrigues e Fabiana Tiemi Watanabe
 */

const {
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
} = require('../node_modules/docx');

const COLORS = {
  PRIMARY: '1B365D',     // Azul Marinho Institucional FATEC
  SECONDARY: '0D9488',   // Verde Petróleo / Esmeralda
  TEXT: '1E293B',        // Cinza Escuro Grafite para Leitura
  MUTED: '64748B',       // Cinza Médio para notas
  BG_LIGHT: 'F8FAFC',    // Fundo Zebrado Claro
  WHITE: 'FFFFFF',
  BORDER: 'CBD5E1',      // Borda sutil
  CALLOUT_BG: 'F0FDF4',  // Fundo Verde Suave para Destaques
  CALLOUT_BORDER: '16A34A',
  ALERT_BG: 'FEF2F2',    // Fundo Vermelho Suave para Riscos
  ALERT_BORDER: 'DC2626',
};

function createTitle(text, pageBreakBefore = false) {
  return new Paragraph({
    pageBreakBefore,
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 120 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 34, // 17pt
        color: COLORS.PRIMARY,
        font: 'Arial',
      }),
    ],
  });
}

function createHeading1(text, pageBreakBefore = false) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    pageBreakBefore,
    spacing: { before: 400, after: 160 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 28, // 14pt
        color: COLORS.PRIMARY,
        font: 'Arial',
      }),
    ],
  });
}

function createHeading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 120 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 24, // 12pt
        color: COLORS.SECONDARY,
        font: 'Arial',
      }),
    ],
  });
}

function createHeading3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 80 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 22, // 11pt
        color: COLORS.PRIMARY,
        font: 'Arial',
      }),
    ],
  });
}

function createParagraph(text, options = {}) {
  const { bold = false, italic = false, align = AlignmentType.JUSTIFIED, spaceAfter = 140 } = options;
  return new Paragraph({
    alignment: align,
    spacing: { before: 0, after: spaceAfter, line: 360 }, // 1.5 de espaçamento ABNT
    children: [
      new TextRun({
        text,
        size: 22, // 11pt ABNT
        color: COLORS.TEXT,
        font: 'Arial',
        bold,
        italic,
      }),
    ],
  });
}

function createBullet(text, boldPrefix = '') {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { before: 40, after: 80, line: 300 },
    children: [
      boldPrefix ? new TextRun({ text: boldPrefix + ' ', bold: true, color: COLORS.PRIMARY, size: 21, font: 'Arial' }) : new TextRun({ text: '' }),
      new TextRun({ text, size: 21, color: COLORS.TEXT, font: 'Arial' }),
    ],
  });
}

function createCallout(title, text, type = 'success') {
  const bg = type === 'alert' ? COLORS.ALERT_BG : COLORS.CALLOUT_BG;
  const borderCol = type === 'alert' ? COLORS.ALERT_BORDER : COLORS.CALLOUT_BORDER;
  const titleCol = type === 'alert' ? 'B91C1C' : '15803D';

  const cell = new TableCell({
    shading: { fill: bg },
    margins: { top: 120, bottom: 120, left: 160, right: 160 },
    borders: {
      left: { style: BorderStyle.SINGLE, size: 24, color: borderCol },
      top: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
    },
    children: [
      new Paragraph({
        spacing: { before: 0, after: 60 },
        children: [new TextRun({ text: title, bold: true, size: 22, color: titleCol, font: 'Arial' })],
      }),
      new Paragraph({
        spacing: { before: 0, after: 0 },
        children: [new TextRun({ text, size: 20, color: COLORS.TEXT, font: 'Arial', italic: true })],
      }),
    ],
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({ children: [cell] })],
  });
}

function makeTable(headers, data, colWidths = []) {
  const defaultWidth = Math.max(5, Math.floor(100 / headers.length));
  const safeWidths = headers.map((_, i) => (colWidths && colWidths[i] !== undefined ? colWidths[i] : defaultWidth));

  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) => new TableCell({
      width: { size: safeWidths[i] || defaultWidth, type: WidthType.PERCENTAGE },
      shading: { fill: COLORS.PRIMARY },
      margins: { top: 100, bottom: 100, left: 120, right: 120 },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 6, color: COLORS.BORDER },
        bottom: { style: BorderStyle.SINGLE, size: 12, color: COLORS.PRIMARY },
        left: { style: BorderStyle.SINGLE, size: 6, color: COLORS.BORDER },
        right: { style: BorderStyle.SINGLE, size: 6, color: COLORS.BORDER },
      },
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: h, bold: true, color: COLORS.WHITE, size: 20, font: 'Arial' })],
      })],
    })),
  });

  const bodyRows = data.map((row, rIdx) => new TableRow({
    children: row.map((cell, cIdx) => new TableCell({
      width: { size: safeWidths[cIdx] || defaultWidth, type: WidthType.PERCENTAGE },
      shading: { fill: rIdx % 2 === 0 ? COLORS.BG_LIGHT : COLORS.WHITE },
      margins: { top: 80, bottom: 80, left: 100, right: 100 },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 4, color: COLORS.BORDER },
        bottom: { style: BorderStyle.SINGLE, size: 4, color: COLORS.BORDER },
        left: { style: BorderStyle.SINGLE, size: 4, color: COLORS.BORDER },
        right: { style: BorderStyle.SINGLE, size: 4, color: COLORS.BORDER },
      },
      children: [new Paragraph({
        alignment: cIdx === 0 ? AlignmentType.LEFT : (cell.length < 15 ? AlignmentType.CENTER : AlignmentType.LEFT),
        children: [new TextRun({ text: cell, size: 19, color: COLORS.TEXT, font: 'Arial' })],
      })],
    })),
  }));

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...bodyRows],
  });
}

module.exports = {
  COLORS,
  createTitle,
  createHeading1,
  createHeading2,
  createHeading3,
  createParagraph,
  createBullet,
  createCallout,
  makeTable,
};
