// TBO Design System Importer -- Figma Plugin
// Creates all variables, color styles, text styles, and effect styles

figma.skipInvisibleInstanceChildren = true;

(async function () {
  try {

  // ─── HELPERS ───────────────────────────────────────────────────────
  function hexToRGB(hex) {
    hex = hex.replace('#', '');
    return {
      r: parseInt(hex.substring(0, 2), 16) / 255,
      g: parseInt(hex.substring(2, 4), 16) / 255,
      b: parseInt(hex.substring(4, 6), 16) / 255,
    };
  }

  function parseRgba(str) {
    const m = str.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+))?\s*\)/);
    if (!m) return null;
    return { r: +m[1] / 255, g: +m[2] / 255, b: +m[3] / 255, a: m[4] !== undefined ? +m[4] : 1 };
  }

  /** Load font with cascading fallback: requested -> Inter same style -> Inter Regular */
  async function safeLoadFont(family, style) {
    try {
      await figma.loadFontAsync({ family: family, style: style });
      return { family: family, style: style };
    } catch (_) {}
    // Fallback: Inter with same weight style
    const interStyle = style === 'Bold' ? 'Bold' : style === 'Medium' ? 'Medium' : 'Regular';
    try {
      await figma.loadFontAsync({ family: 'Inter', style: interStyle });
      return { family: 'Inter', style: interStyle };
    } catch (_) {}
    // Last resort: Inter Regular
    await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
    return { family: 'Inter', style: 'Regular' };
  }

  console.log('[TBO Plugin] Starting...');

  // ─── COLOR DEFINITIONS ─────────────────────────────────────────────
  const brandColors = {
    'Brand/Orange':       '#E85102',
    'Brand/Orange Light': '#FD8241',
    'Brand/Orange Pale':  '#FED5C0',
    'Brand/Orange Dark':  '#BE4202',
    'Brand/Orange Deep':  '#3F1601',
  };

  const neutralColors = {
    'Neutral/White':    '#FFFFFF',
    'Neutral/Gray 100': '#EAEAEA',
    'Neutral/Gray 200': '#DFDFDF',
    'Neutral/Gray 400': '#9F9F9F',
    'Neutral/Gray 600': '#606060',
    'Neutral/Gray 800': '#202020',
    'Neutral/Black':    '#0F0F0F',
  };

  const semanticColors = {
    'Semantic/Success': '#2ecc71',
    'Semantic/Warning': '#f39c12',
    'Semantic/Danger':  '#e74c3c',
    'Semantic/Info':    '#3a7bd5',
    'Semantic/Purple':  '#8b5cf6',
  };

  const moduleColors = {
    'Module/Dashboard':  '#E85102',
    'Module/Projetos':   '#3b82f6',
    'Module/Financeiro': '#10b981',
    'Module/Pessoas':    '#8b5cf6',
    'Module/Comercial':  '#f59e0b',
    'Module/Mercado':    '#14b8a6',
    'Module/Cultura':    '#ec4899',
  };

  const bgColors = {
    'Background/Root':       '#EAEAEA',
    'Background/Card':       '#FFFFFF',
    'Background/Card Hover': '#F8F8F8',
    'Background/Sidebar':    '#FFFFFF',
    'Background/Input':      '#DFDFDF',
    'Background/Tooltip':    '#202020',
    'Background/Elevated':   '#DFDFDF',
  };

  const textColors = {
    'Text/Primary':   '#0F0F0F',
    'Text/Secondary': '#606060',
    'Text/Muted':     '#9F9F9F',
    'Text/Inverse':   '#EAEAEA',
    'Text/Link':      '#BE4202',
  };

  const borderColors = {
    'Border/Default': '#DFDFDF',
    'Border/Subtle':  '#EAEAEA',
    'Border/Hover':   '#9F9F9F',
    'Border/Focus':   '#D14800',
  };

  // ─── 1. CREATE COLOR STYLES ────────────────────────────────────────
  var allColors = Object.assign({},
    brandColors,
    neutralColors,
    semanticColors,
    moduleColors,
    bgColors,
    textColors,
    borderColors
  );

  let colorStyleCount = 0;

  for (const [name, hex] of Object.entries(allColors)) {
    const style = figma.createPaintStyle();
    style.name = name;
    const rgb = hexToRGB(hex);
    style.paints = [{ type: 'SOLID', color: rgb, visible: true }];
    colorStyleCount++;
  }

  // Semantic dim colors (with opacity)
  const dimColors = {
    'Semantic/Success Dim': 'rgba(46, 204, 113, 0.15)',
    'Semantic/Warning Dim': 'rgba(243, 156, 18, 0.15)',
    'Semantic/Danger Dim':  'rgba(231, 76, 60, 0.15)',
    'Semantic/Info Dim':    'rgba(58, 123, 213, 0.15)',
    'Semantic/Purple Dim':  'rgba(139, 92, 246, 0.15)',
    'Accent/Orange Dim':    'rgba(232, 81, 2, 0.10)',
    'Accent/Orange Glow':   'rgba(232, 81, 2, 0.25)',
  };

  for (const [name, rgba] of Object.entries(dimColors)) {
    const parsed = parseRgba(rgba);
    if (!parsed) continue;
    const style = figma.createPaintStyle();
    style.name = name;
    style.paints = [{
      type: 'SOLID',
      color: { r: parsed.r, g: parsed.g, b: parsed.b },
      opacity: parsed.a,
      visible: true,
    }];
    colorStyleCount++;
  }

  console.log('[TBO Plugin] Color styles created:', colorStyleCount);

  // ─── 2. CREATE TEXT STYLES ─────────────────────────────────────────
  const typographyDefs = [
    { name: 'Typography/Display',  family: 'Helvetica Neue', style: 'Bold',    size: 32,   lineHeight: { value: 35.2, unit: 'PIXELS' },  letterSpacing: { value: -0.64, unit: 'PIXELS' } },
    { name: 'Typography/Heading',  family: 'Helvetica Neue', style: 'Bold',    size: 24,   lineHeight: { value: 28.8, unit: 'PIXELS' },  letterSpacing: { value: -0.24, unit: 'PIXELS' } },
    { name: 'Typography/Title',    family: 'Helvetica Neue', style: 'Medium',  size: 17.6, lineHeight: { value: 22.9, unit: 'PIXELS' },  letterSpacing: { value: 0, unit: 'PIXELS' } },
    { name: 'Typography/Body',     family: 'Helvetica Neue', style: 'Regular', size: 14,   lineHeight: { value: 21, unit: 'PIXELS' },     letterSpacing: { value: 0, unit: 'PIXELS' } },
    { name: 'Typography/Caption',  family: 'Helvetica Neue', style: 'Medium',  size: 12,   lineHeight: { value: 16.8, unit: 'PIXELS' },  letterSpacing: { value: 0.12, unit: 'PIXELS' } },
    { name: 'Typography/Overline', family: 'Helvetica Neue', style: 'Bold',    size: 10.4, lineHeight: { value: 12.5, unit: 'PIXELS' },  letterSpacing: { value: 0.83, unit: 'PIXELS' } },
    { name: 'Typography/Mono',     family: 'JetBrains Mono', style: 'Regular', size: 13,   lineHeight: { value: 19.5, unit: 'PIXELS' },  letterSpacing: { value: 0, unit: 'PIXELS' } },
  ];

  let textStyleCount = 0;

  // Resolve fonts first, storing the actual loaded fontName per def
  const resolvedFonts = [];
  for (const def of typographyDefs) {
    const resolved = await safeLoadFont(def.family, def.style);
    resolvedFonts.push(resolved);
  }

  for (let i = 0; i < typographyDefs.length; i++) {
    const def = typographyDefs[i];
    const font = resolvedFonts[i];
    const style = figma.createTextStyle();
    style.name = def.name;
    style.fontName = font;
    style.fontSize = def.size;
    style.lineHeight = def.lineHeight;
    style.letterSpacing = def.letterSpacing;
    textStyleCount++;
  }

  console.log('[TBO Plugin] Text styles created:', textStyleCount);

  // ─── 3. CREATE EFFECT STYLES (SHADOWS) ─────────────────────────────
  const shadowDefs = [
    { name: 'Shadow/SM',   x: 0, y: 1,  blur: 3,  spread: 0, opacity: 0.06 },
    { name: 'Shadow/MD',   x: 0, y: 4,  blur: 12, spread: 0, opacity: 0.08 },
    { name: 'Shadow/LG',   x: 0, y: 8,  blur: 30, spread: 0, opacity: 0.12 },
    { name: 'Shadow/XL',   x: 0, y: 12, blur: 48, spread: 0, opacity: 0.18 },
    { name: 'Shadow/Glow', x: 0, y: 0,  blur: 16, spread: 0, opacity: 0.15, color: { r: 232/255, g: 81/255, b: 2/255 } },
  ];

  let effectStyleCount = 0;

  for (const def of shadowDefs) {
    const style = figma.createEffectStyle();
    style.name = def.name;
    const baseColor = def.color || { r: 0, g: 0, b: 0 };
    style.effects = [{
      type: 'DROP_SHADOW',
      color: { r: baseColor.r, g: baseColor.g, b: baseColor.b, a: def.opacity },
      offset: { x: def.x, y: def.y },
      radius: def.blur,
      spread: def.spread,
      visible: true,
      blendMode: 'NORMAL',
    }];
    effectStyleCount++;
  }

  console.log('[TBO Plugin] Effect styles created:', effectStyleCount);

  // ─── 4. CREATE REFERENCE PAGE WITH SWATCHES ────────────────────────
  const page = figma.currentPage;
  page.name = 'TBO Design System';

  // Load Inter font family for reference page text
  const interBold   = await safeLoadFont('Inter', 'Bold');
  const interReg    = await safeLoadFont('Inter', 'Regular');
  const interMed    = await safeLoadFont('Inter', 'Medium');

  const titleNode = figma.createText();
  titleNode.fontName = interBold;
  titleNode.characters = 'TBO OS -- Design System';
  titleNode.fontSize = 48;
  titleNode.fills = [{ type: 'SOLID', color: hexToRGB('#0F0F0F'), visible: true }];
  titleNode.x = 0;
  titleNode.y = 0;
  page.appendChild(titleNode);

  const subtitleNode = figma.createText();
  subtitleNode.fontName = interReg;
  subtitleNode.characters = 'Architectural Visualization Studio | Curitiba/PR';
  subtitleNode.fontSize = 18;
  subtitleNode.fills = [{ type: 'SOLID', color: hexToRGB('#606060'), visible: true }];
  subtitleNode.x = 0;
  subtitleNode.y = 64;
  page.appendChild(subtitleNode);

  // ─── COLOR SWATCHES ────────────────────────────────────────────────
  function createSwatchSection(title, colors, startX, startY) {
    const label = figma.createText();
    label.fontName = interBold;
    label.characters = title;
    label.fontSize = 20;
    label.fills = [{ type: 'SOLID', color: hexToRGB('#0F0F0F'), visible: true }];
    label.x = startX;
    label.y = startY;
    page.appendChild(label);

    let x = startX;
    let y = startY + 40;
    let col = 0;

    for (const [name, hex] of Object.entries(colors)) {
      // Swatch rectangle
      const rect = figma.createRectangle();
      rect.resize(80, 80);
      rect.x = x;
      rect.y = y;
      rect.cornerRadius = 12;
      rect.fills = [{ type: 'SOLID', color: hexToRGB(hex), visible: true }];
      rect.strokes = [{ type: 'SOLID', color: hexToRGB('#DFDFDF'), visible: true }];
      rect.strokeWeight = 1;
      page.appendChild(rect);

      // Color name
      const nameLabel = figma.createText();
      nameLabel.fontName = interMed;
      nameLabel.characters = name.split('/').pop();
      nameLabel.fontSize = 10;
      nameLabel.fills = [{ type: 'SOLID', color: hexToRGB('#0F0F0F'), visible: true }];
      nameLabel.x = x;
      nameLabel.y = y + 88;
      page.appendChild(nameLabel);

      // Hex value
      const hexLabel = figma.createText();
      hexLabel.fontName = interReg;
      hexLabel.characters = hex;
      hexLabel.fontSize = 9;
      hexLabel.fills = [{ type: 'SOLID', color: hexToRGB('#9F9F9F'), visible: true }];
      hexLabel.x = x;
      hexLabel.y = y + 102;
      page.appendChild(hexLabel);

      x += 110;
      col++;
      if (col >= 7) {
        col = 0;
        x = startX;
        y += 140;
      }
    }

    return y + (col > 0 ? 140 : 0);
  }

  let nextY = 120;
  nextY = createSwatchSection('Brand Palette', brandColors, 0, nextY) + 40;
  nextY = createSwatchSection('Neutrals', neutralColors, 0, nextY) + 40;
  nextY = createSwatchSection('Semantic Colors', semanticColors, 0, nextY) + 40;
  nextY = createSwatchSection('Module Accents', moduleColors, 0, nextY) + 40;
  nextY = createSwatchSection('Backgrounds', bgColors, 0, nextY) + 40;
  nextY = createSwatchSection('Text Colors', textColors, 0, nextY) + 40;
  nextY = createSwatchSection('Borders', borderColors, 0, nextY) + 40;

  console.log('[TBO Plugin] Color swatches created');

  // ─── TYPOGRAPHY SAMPLES ────────────────────────────────────────────
  const typoLabel = figma.createText();
  typoLabel.fontName = interBold;
  typoLabel.characters = 'Typography Scale';
  typoLabel.fontSize = 20;
  typoLabel.fills = [{ type: 'SOLID', color: hexToRGB('#0F0F0F'), visible: true }];
  typoLabel.x = 0;
  typoLabel.y = nextY;
  page.appendChild(typoLabel);

  nextY += 48;

  for (let i = 0; i < typographyDefs.length; i++) {
    const def = typographyDefs[i];
    const font = resolvedFonts[i];
    const sample = figma.createText();
    sample.fontName = font;
    sample.characters = def.name.split('/').pop() + ' -- ' + def.size + 'px / ' + font.style;
    sample.fontSize = def.size;
    sample.lineHeight = def.lineHeight;
    sample.letterSpacing = def.letterSpacing;
    sample.fills = [{ type: 'SOLID', color: hexToRGB('#0F0F0F'), visible: true }];
    sample.x = 0;
    sample.y = nextY;
    page.appendChild(sample);

    nextY += def.lineHeight.value + 24;
  }

  // ─── SPACING REFERENCE ─────────────────────────────────────────────
  nextY += 32;
  const spacingLabel = figma.createText();
  spacingLabel.fontName = interBold;
  spacingLabel.characters = 'Spacing Scale';
  spacingLabel.fontSize = 20;
  spacingLabel.fills = [{ type: 'SOLID', color: hexToRGB('#0F0F0F'), visible: true }];
  spacingLabel.x = 0;
  spacingLabel.y = nextY;
  page.appendChild(spacingLabel);

  nextY += 40;

  const spacingTokens = [
    { name: 'xs', value: 4 },
    { name: 'sm', value: 8 },
    { name: 'md', value: 12 },
    { name: 'lg', value: 16 },
    { name: 'xl', value: 24 },
    { name: 'xxl', value: 32 },
    { name: 'xxxl', value: 48 },
  ];

  let spacingX = 0;
  for (const sp of spacingTokens) {
    const rect = figma.createRectangle();
    rect.resize(sp.value, 40);
    rect.x = spacingX;
    rect.y = nextY;
    rect.cornerRadius = 4;
    rect.fills = [{ type: 'SOLID', color: hexToRGB('#E85102'), visible: true, opacity: 0.2 }];
    rect.strokes = [{ type: 'SOLID', color: hexToRGB('#E85102'), visible: true }];
    rect.strokeWeight = 1;
    page.appendChild(rect);

    const spLabel = figma.createText();
    spLabel.fontName = interMed;
    spLabel.characters = sp.name + '\n' + sp.value + 'px';
    spLabel.fontSize = 10;
    spLabel.fills = [{ type: 'SOLID', color: hexToRGB('#606060'), visible: true }];
    spLabel.x = spacingX;
    spLabel.y = nextY + 48;
    page.appendChild(spLabel);

    spacingX += Math.max(sp.value, 30) + 24;
  }

  // ─── BORDER RADIUS REFERENCE ───────────────────────────────────────
  nextY += 120;
  const radiusLabel = figma.createText();
  radiusLabel.fontName = interBold;
  radiusLabel.characters = 'Border Radius';
  radiusLabel.fontSize = 20;
  radiusLabel.fills = [{ type: 'SOLID', color: hexToRGB('#0F0F0F'), visible: true }];
  radiusLabel.x = 0;
  radiusLabel.y = nextY;
  page.appendChild(radiusLabel);

  nextY += 40;

  const radiusTokens = [
    { name: 'xs', value: 3 },
    { name: 'sm', value: 6 },
    { name: 'md', value: 8 },
    { name: 'lg', value: 12 },
    { name: 'xl', value: 16 },
    { name: 'full', value: 9999 },
  ];

  let radiusX = 0;
  for (const rd of radiusTokens) {
    const rect = figma.createRectangle();
    rect.resize(64, 64);
    rect.x = radiusX;
    rect.y = nextY;
    rect.cornerRadius = Math.min(rd.value, 32);
    rect.fills = [{ type: 'SOLID', color: hexToRGB('#FFFFFF'), visible: true }];
    rect.strokes = [{ type: 'SOLID', color: hexToRGB('#DFDFDF'), visible: true }];
    rect.strokeWeight = 1.5;
    page.appendChild(rect);

    const rdLabel = figma.createText();
    rdLabel.fontName = interMed;
    rdLabel.characters = rd.name + '\n' + (rd.value === 9999 ? 'full' : rd.value + 'px');
    rdLabel.fontSize = 10;
    rdLabel.fills = [{ type: 'SOLID', color: hexToRGB('#606060'), visible: true }];
    rdLabel.x = radiusX;
    rdLabel.y = nextY + 72;
    page.appendChild(rdLabel);

    radiusX += 96;
  }

  // ─── SHADOW REFERENCE ──────────────────────────────────────────────
  nextY += 140;
  const shadowLabel = figma.createText();
  shadowLabel.fontName = interBold;
  shadowLabel.characters = 'Shadows';
  shadowLabel.fontSize = 20;
  shadowLabel.fills = [{ type: 'SOLID', color: hexToRGB('#0F0F0F'), visible: true }];
  shadowLabel.x = 0;
  shadowLabel.y = nextY;
  page.appendChild(shadowLabel);

  nextY += 40;

  let shadowX = 0;
  for (const sd of shadowDefs) {
    const baseColor = sd.color || { r: 0, g: 0, b: 0 };
    const rect = figma.createRectangle();
    rect.resize(100, 80);
    rect.x = shadowX;
    rect.y = nextY;
    rect.cornerRadius = 12;
    rect.fills = [{ type: 'SOLID', color: hexToRGB('#FFFFFF'), visible: true }];
    rect.effects = [{
      type: 'DROP_SHADOW',
      color: { r: baseColor.r, g: baseColor.g, b: baseColor.b, a: sd.opacity },
      offset: { x: sd.x, y: sd.y },
      radius: sd.blur,
      spread: sd.spread,
      visible: true,
      blendMode: 'NORMAL',
    }];
    page.appendChild(rect);

    const sdLabel = figma.createText();
    sdLabel.fontName = interMed;
    sdLabel.characters = sd.name.split('/').pop();
    sdLabel.fontSize = 10;
    sdLabel.fills = [{ type: 'SOLID', color: hexToRGB('#606060'), visible: true }];
    sdLabel.x = shadowX;
    sdLabel.y = nextY + 90;
    page.appendChild(sdLabel);

    shadowX += 140;
  }

  // ─── DONE ──────────────────────────────────────────────────────────
  figma.viewport.scrollAndZoomIntoView(page.children);

  console.log('[TBO Plugin] Done!');
  figma.notify(
    'TBO Design System imported! ' + colorStyleCount + ' colors, ' + textStyleCount + ' text styles, ' + effectStyleCount + ' effects.',
    { timeout: 5000 }
  );

  } catch (err) {
    console.error('[TBO Plugin] Error:', err);
    figma.notify('Plugin error: ' + (err.message || String(err)), { error: true, timeout: 10000 });
  } finally {
    figma.closePlugin();
  }

})();
