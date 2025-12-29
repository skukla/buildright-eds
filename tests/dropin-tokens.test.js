/**
 * Dropin Tokens CSS Tests
 *
 * TDD tests for Step 1: Design Token Foundation
 * Validates dropin-tokens.css creation and proper token mapping.
 *
 * Run with: node --test tests/dropin-tokens.test.js
 */

const { describe, it, before } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

// File paths
const STYLES_DIR = path.join(__dirname, '..', 'styles');
const DROPIN_TOKENS_PATH = path.join(STYLES_DIR, 'dropin-tokens.css');
const STYLES_CSS_PATH = path.join(STYLES_DIR, 'styles.css');
const BASE_CSS_PATH = path.join(STYLES_DIR, 'base.css');

// Helper: Read CSS file contents
function readCSSFile(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

// Helper: Check if file exists
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

// Helper: Extract CSS custom properties (variables) from CSS content
function extractCSSVariables(cssContent) {
  const variables = {};
  // Match CSS variable declarations: --var-name: value;
  const regex = /--([a-zA-Z0-9-]+)\s*:\s*([^;]+);/g;
  let match;
  while ((match = regex.exec(cssContent)) !== null) {
    variables[`--${match[1]}`] = match[2].trim();
  }
  return variables;
}

// Helper: Check for hardcoded color values (hex, rgb, rgba, hsl)
function findHardcodedValues(cssContent) {
  const hardcoded = [];

  // Match property declarations
  const declarationRegex = /--([a-zA-Z0-9-]+)\s*:\s*([^;]+);/g;
  let match;

  while ((match = declarationRegex.exec(cssContent)) !== null) {
    const varName = match[1];
    const value = match[2].trim();

    // Check if value contains hardcoded colors (not using var())
    // Hex colors: #xxx or #xxxxxx
    if (/#[0-9a-fA-F]{3,8}/.test(value) && !value.includes('var(')) {
      hardcoded.push({ variable: `--${varName}`, value, type: 'hex' });
    }

    // RGB/RGBA values
    if (/rgba?\s*\(/.test(value) && !value.includes('var(')) {
      hardcoded.push({ variable: `--${varName}`, value, type: 'rgb' });
    }

    // HSL values
    if (/hsla?\s*\(/.test(value) && !value.includes('var(')) {
      hardcoded.push({ variable: `--${varName}`, value, type: 'hsl' });
    }

    // Hardcoded pixel/rem values for spacing (without var())
    if (/^\d+(?:\.\d+)?(?:px|rem|em)$/.test(value)) {
      hardcoded.push({ variable: `--${varName}`, value, type: 'size' });
    }
  }

  return hardcoded;
}

// Helper: Check if all variable values use var() references
function checkVarUsage(cssVariables) {
  const nonVarValues = [];

  for (const [name, value] of Object.entries(cssVariables)) {
    // Skip if value uses var()
    if (!value.includes('var(')) {
      nonVarValues.push({ name, value });
    }
  }

  return nonVarValues;
}

// Helper: Get import order from styles.css
function getImportOrder(cssContent) {
  const imports = [];
  const importRegex = /@import\s+url\s*\(\s*['"]?([^'")\s]+)['"]?\s*\)/g;
  let match;

  while ((match = importRegex.exec(cssContent)) !== null) {
    imports.push(match[1]);
  }

  return imports;
}

describe('Test 1: Token File Creation', () => {
  it('should create dropin-tokens.css file at styles/dropin-tokens.css', () => {
    // Given: the dropin-tokens.css file needs to be created
    // When: I check if the file exists
    const exists = fileExists(DROPIN_TOKENS_PATH);

    // Then: the file should exist
    assert.strictEqual(exists, true,
      `dropin-tokens.css should exist at ${DROPIN_TOKENS_PATH}`);
  });

  it('should be valid CSS with :root selector', () => {
    // Given: dropin-tokens.css exists
    // When: I read and parse the content
    const content = readCSSFile(DROPIN_TOKENS_PATH);

    // Then: it should contain a :root selector
    assert.match(content, /:root\s*\{/,
      'dropin-tokens.css should contain :root selector');
  });

  it('should not have CSS syntax errors (balanced braces)', () => {
    // Given: dropin-tokens.css exists
    const content = readCSSFile(DROPIN_TOKENS_PATH);

    // When: I count opening and closing braces
    const openBraces = (content.match(/\{/g) || []).length;
    const closeBraces = (content.match(/\}/g) || []).length;

    // Then: braces should be balanced
    assert.strictEqual(openBraces, closeBraces,
      `CSS braces should be balanced. Found ${openBraces} open and ${closeBraces} close`);
  });
});

describe('Test 2: Primary Color Token Mapping', () => {
  it('should map --dropin-color-primary to var(--color-brand-500)', () => {
    // Given: Adobe dropins use --dropin-color-primary
    const content = readCSSFile(DROPIN_TOKENS_PATH);
    const variables = extractCSSVariables(content);

    // When: I check the mapping
    const primaryColor = variables['--dropin-color-primary'];

    // Then: it should reference var(--color-brand-500)
    assert.ok(primaryColor, '--dropin-color-primary should be defined');
    assert.match(primaryColor, /var\s*\(\s*--color-brand-500\s*\)/,
      '--dropin-color-primary should map to var(--color-brand-500)');
  });

  it('should map --dropin-color-primary-hover to var(--color-brand-600)', () => {
    const content = readCSSFile(DROPIN_TOKENS_PATH);
    const variables = extractCSSVariables(content);

    const hoverColor = variables['--dropin-color-primary-hover'];

    assert.ok(hoverColor, '--dropin-color-primary-hover should be defined');
    assert.match(hoverColor, /var\s*\(\s*--color-brand-600\s*\)/,
      '--dropin-color-primary-hover should map to var(--color-brand-600)');
  });

  it('should map --dropin-color-primary-active to var(--color-brand-700)', () => {
    const content = readCSSFile(DROPIN_TOKENS_PATH);
    const variables = extractCSSVariables(content);

    const activeColor = variables['--dropin-color-primary-active'];

    assert.ok(activeColor, '--dropin-color-primary-active should be defined');
    assert.match(activeColor, /var\s*\(\s*--color-brand-700\s*\)/,
      '--dropin-color-primary-active should map to var(--color-brand-700)');
  });
});

describe('Test 3: CTA/Accent Color Mapping', () => {
  it('should map --dropin-color-cta to var(--color-accent-500)', () => {
    // Given: Adobe dropins need accent colors for CTAs
    const content = readCSSFile(DROPIN_TOKENS_PATH);
    const variables = extractCSSVariables(content);

    // When: I check the CTA color mapping
    const ctaColor = variables['--dropin-color-cta'];

    // Then: it should reference var(--color-accent-500)
    assert.ok(ctaColor, '--dropin-color-cta should be defined');
    assert.match(ctaColor, /var\s*\(\s*--color-accent-500\s*\)/,
      '--dropin-color-cta should map to var(--color-accent-500)');
  });

  it('should map --dropin-color-cta-hover to var(--color-accent-600)', () => {
    const content = readCSSFile(DROPIN_TOKENS_PATH);
    const variables = extractCSSVariables(content);

    const ctaHover = variables['--dropin-color-cta-hover'];

    assert.ok(ctaHover, '--dropin-color-cta-hover should be defined');
    assert.match(ctaHover, /var\s*\(\s*--color-accent-600\s*\)/,
      '--dropin-color-cta-hover should map to var(--color-accent-600)');
  });
});

describe('Test 4: Typography Token Mapping', () => {
  it('should map --dropin-font-family to var(--type-font-family-base)', () => {
    // Given: Adobe dropins use typography variables
    const content = readCSSFile(DROPIN_TOKENS_PATH);
    const variables = extractCSSVariables(content);

    // When: I check the font family mapping
    const fontFamily = variables['--dropin-font-family'];

    // Then: it should reference var(--type-font-family-base)
    assert.ok(fontFamily, '--dropin-font-family should be defined');
    assert.match(fontFamily, /var\s*\(\s*--type-font-family-base\s*\)/,
      '--dropin-font-family should map to var(--type-font-family-base)');
  });

  it('should map --dropin-font-size-base typography token', () => {
    const content = readCSSFile(DROPIN_TOKENS_PATH);
    const variables = extractCSSVariables(content);

    const fontSize = variables['--dropin-font-size-base'];

    assert.ok(fontSize, '--dropin-font-size-base should be defined');
    // Should use a var() reference, not hardcoded value
    assert.match(fontSize, /var\s*\(/,
      '--dropin-font-size-base should use a var() reference');
  });

  it('should map font weight tokens', () => {
    const content = readCSSFile(DROPIN_TOKENS_PATH);
    const variables = extractCSSVariables(content);

    // Check that at least one font weight token exists
    const hasWeightToken =
      variables['--dropin-font-weight-normal'] ||
      variables['--dropin-font-weight-medium'] ||
      variables['--dropin-font-weight-bold'];

    assert.ok(hasWeightToken, 'At least one font weight token should be defined');
  });
});

describe('Test 5: Spacing Token Mapping', () => {
  it('should map --dropin-spacing-small to var(--spacing-small)', () => {
    // Given: Adobe dropins use spacing variables
    const content = readCSSFile(DROPIN_TOKENS_PATH);
    const variables = extractCSSVariables(content);

    // When: I check the spacing mapping
    const spacingSmall = variables['--dropin-spacing-small'];

    // Then: it should reference var(--spacing-small)
    assert.ok(spacingSmall, '--dropin-spacing-small should be defined');
    assert.match(spacingSmall, /var\s*\(\s*--spacing-small\s*\)/,
      '--dropin-spacing-small should map to var(--spacing-small)');
  });

  it('should map --dropin-spacing-medium to var(--spacing-medium)', () => {
    const content = readCSSFile(DROPIN_TOKENS_PATH);
    const variables = extractCSSVariables(content);

    const spacingMedium = variables['--dropin-spacing-medium'];

    assert.ok(spacingMedium, '--dropin-spacing-medium should be defined');
    assert.match(spacingMedium, /var\s*\(\s*--spacing-medium\s*\)/,
      '--dropin-spacing-medium should map to var(--spacing-medium)');
  });

  it('should map --dropin-spacing-large to var(--spacing-large)', () => {
    const content = readCSSFile(DROPIN_TOKENS_PATH);
    const variables = extractCSSVariables(content);

    const spacingLarge = variables['--dropin-spacing-large'];

    assert.ok(spacingLarge, '--dropin-spacing-large should be defined');
    assert.match(spacingLarge, /var\s*\(\s*--spacing-large\s*\)/,
      '--dropin-spacing-large should map to var(--spacing-large)');
  });
});

describe('Test 6: Import Order Verification', () => {
  it('should have dropin-tokens.css imported in styles.css', () => {
    // Given: styles.css manages the CSS cascade
    const content = readCSSFile(STYLES_CSS_PATH);

    // When: I check for the import
    // Then: dropin-tokens.css should be imported
    assert.match(content, /@import.*dropin-tokens\.css/,
      'styles.css should import dropin-tokens.css');
  });

  it('should import dropin-tokens.css after base.css', () => {
    // Given: styles.css manages the CSS cascade
    const content = readCSSFile(STYLES_CSS_PATH);
    const imports = getImportOrder(content);

    // When: I check the import order
    const baseIndex = imports.findIndex(i => i.includes('base.css'));
    const dropinTokensIndex = imports.findIndex(i => i.includes('dropin-tokens.css'));

    // Then: dropin-tokens.css should come after base.css
    assert.ok(baseIndex !== -1, 'base.css should be imported');
    assert.ok(dropinTokensIndex !== -1, 'dropin-tokens.css should be imported');
    assert.ok(dropinTokensIndex > baseIndex,
      `dropin-tokens.css (index ${dropinTokensIndex}) should come after base.css (index ${baseIndex})`);
  });

  it('should import dropin-tokens.css before components.css', () => {
    const content = readCSSFile(STYLES_CSS_PATH);
    const imports = getImportOrder(content);

    const dropinTokensIndex = imports.findIndex(i => i.includes('dropin-tokens.css'));
    const componentsIndex = imports.findIndex(i => i.includes('components.css'));

    assert.ok(dropinTokensIndex !== -1, 'dropin-tokens.css should be imported');
    assert.ok(componentsIndex !== -1, 'components.css should be imported');
    assert.ok(dropinTokensIndex < componentsIndex,
      `dropin-tokens.css (index ${dropinTokensIndex}) should come before components.css (index ${componentsIndex})`);
  });
});

describe('Test 7: No Hardcoded Values', () => {
  it('should not contain hardcoded hex color values', () => {
    // Given: dropin-tokens.css is created
    const content = readCSSFile(DROPIN_TOKENS_PATH);
    const hardcoded = findHardcodedValues(content);

    // When: I check for hardcoded hex values
    const hexValues = hardcoded.filter(h => h.type === 'hex');

    // Then: there should be none
    assert.strictEqual(hexValues.length, 0,
      `No hardcoded hex values should exist. Found: ${JSON.stringify(hexValues)}`);
  });

  it('should not contain hardcoded rgb/rgba values', () => {
    const content = readCSSFile(DROPIN_TOKENS_PATH);
    const hardcoded = findHardcodedValues(content);

    const rgbValues = hardcoded.filter(h => h.type === 'rgb');

    assert.strictEqual(rgbValues.length, 0,
      `No hardcoded rgb/rgba values should exist. Found: ${JSON.stringify(rgbValues)}`);
  });

  it('should use var() references for all token values', () => {
    const content = readCSSFile(DROPIN_TOKENS_PATH);
    const variables = extractCSSVariables(content);

    // When: I check all variables
    const nonVarValues = checkVarUsage(variables);

    // Then: all should use var() references
    assert.strictEqual(nonVarValues.length, 0,
      `All values should use var() references. Found non-var values: ${JSON.stringify(nonVarValues)}`);
  });
});

describe('Test 8: No Token Duplication', () => {
  it('should not duplicate base.css token values', () => {
    // Given: dropin-tokens.css maps to base.css tokens
    const baseContent = readCSSFile(BASE_CSS_PATH);
    const dropinContent = readCSSFile(DROPIN_TOKENS_PATH);

    // Extract all variables
    const baseVariables = extractCSSVariables(baseContent);
    const dropinVariables = extractCSSVariables(dropinContent);

    // When: I verify the mappings
    const duplicatedValues = [];

    for (const [name, value] of Object.entries(dropinVariables)) {
      // Check if the dropin token value is a direct copy of a base token value
      // (e.g., dropin-color-primary: #0f5ba7 instead of dropin-color-primary: var(--color-brand-500))
      for (const [baseName, baseValue] of Object.entries(baseVariables)) {
        if (value === baseValue && !value.includes('var(')) {
          duplicatedValues.push({
            dropinVar: name,
            baseVar: baseName,
            value
          });
        }
      }
    }

    // Then: no token values should be duplicated
    assert.strictEqual(duplicatedValues.length, 0,
      `No token values should be duplicated from base.css. Found: ${JSON.stringify(duplicatedValues)}`);
  });

  it('should reference base.css tokens via var() rather than copying values', () => {
    const dropinContent = readCSSFile(DROPIN_TOKENS_PATH);
    const variables = extractCSSVariables(dropinContent);

    // Count how many use var() references
    let varRefCount = 0;
    for (const value of Object.values(variables)) {
      if (value.includes('var(')) {
        varRefCount++;
      }
    }

    const totalVars = Object.keys(variables).length;

    // All variables should use var() references
    assert.strictEqual(varRefCount, totalVars,
      `All ${totalVars} variables should use var() references. Found ${varRefCount} using var()`);
  });
});

describe('Additional Token Mappings', () => {
  it('should define neutral color tokens', () => {
    const content = readCSSFile(DROPIN_TOKENS_PATH);
    const variables = extractCSSVariables(content);

    // Check for at least some neutral color mappings
    const hasNeutral =
      variables['--dropin-color-neutral-50'] ||
      variables['--dropin-color-neutral-100'] ||
      variables['--dropin-color-neutral-200'];

    assert.ok(hasNeutral, 'At least one neutral color token should be defined');
  });

  it('should define shape/border radius token', () => {
    const content = readCSSFile(DROPIN_TOKENS_PATH);
    const variables = extractCSSVariables(content);

    const borderRadius = variables['--dropin-border-radius'];

    assert.ok(borderRadius, '--dropin-border-radius should be defined');
    assert.match(borderRadius, /var\s*\(/,
      '--dropin-border-radius should use var() reference');
  });

  it('should define shadow tokens', () => {
    const content = readCSSFile(DROPIN_TOKENS_PATH);
    const variables = extractCSSVariables(content);

    const hasShadow =
      variables['--dropin-shadow-small'] ||
      variables['--dropin-shadow-medium'];

    assert.ok(hasShadow, 'At least one shadow token should be defined');
  });
});
