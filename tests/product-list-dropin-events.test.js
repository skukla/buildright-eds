/**
 * Product List Dropin Event Emissions Tests
 *
 * TDD tests for Step 4: JavaScript Event Emissions
 * Validates that product-list-dropin.js emits the correct events
 * matching the canonical patterns from product-grid.js.
 *
 * Run with: node --test tests/product-list-dropin-events.test.js
 */

const { describe, it, before } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

// File paths
const BLOCKS_DIR = path.join(__dirname, '..', 'blocks');
const PRODUCT_LIST_DROPIN_PATH = path.join(BLOCKS_DIR, 'product-list-dropin', 'product-list-dropin.js');
const PRODUCT_GRID_PATH = path.join(BLOCKS_DIR, 'product-grid', 'product-grid.js');

// Helper: Read JavaScript file contents
function readJSFile(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

// Helper: Check if file exists
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

// Helper: Extract CustomEvent dispatches from JS content
// Detects both direct `new CustomEvent` and helper function `emitCatalogEvent` patterns
function extractCustomEvents(jsContent) {
  const events = [];

  // Split into lines for easier processing
  const lines = jsContent.split('\n');

  lines.forEach((line, index) => {
    // Match: new CustomEvent('eventName' OR emitCatalogEvent('eventName'
    const directMatch = line.match(/new\s+CustomEvent\s*\(\s*['"`]([^'"`]+)['"`]/);
    const helperMatch = line.match(/emitCatalogEvent\s*\(\s*['"`]([^'"`]+)['"`]/);

    const eventMatch = directMatch || helperMatch;

    if (eventMatch) {
      const eventName = eventMatch[1];

      // Look at this line and following lines to find detail object
      // Events may span multiple lines like:
      //   emitCatalogEvent('name', { validating: true })
      // or:
      //   new CustomEvent('name', {
      //     detail: { validating: true }
      //   })
      let contextLines = line;
      for (let i = 1; i <= 3 && (index + i) < lines.length; i++) {
        contextLines += ' ' + lines[index + i];
      }

      // Check for detail in the context
      // For helper function, the second argument IS the detail
      // For direct CustomEvent, it's wrapped in { detail: ... }
      const hasDetail = helperMatch
        ? (contextLines.includes(',') && contextLines.split(eventName)[1]?.includes('{'))
        : (contextLines.includes('detail:') || contextLines.includes('detail :'));

      // Extract detail content
      let detail = null;
      if (hasDetail || helperMatch) {
        // Try to extract validating: true/false pattern
        const validatingMatch = contextLines.match(/validating\s*:\s*(true|false)/);
        if (validatingMatch) {
          detail = `{ validating: ${validatingMatch[1]} }`;
        }
        // Try to extract error pattern
        const errorMatch = contextLines.match(/error\s*:/);
        if (errorMatch) {
          detail = `{ error: ... }`;
        }
      }

      events.push({
        name: eventName,
        hasDetail: detail !== null,
        detail,
        lineNumber: index + 1,
        fullMatch: line.trim(),
        isHelperFunction: !!helperMatch
      });
    }
  });

  return events;
}

// Helper: Check if event is in a try block (success path)
function isInTryBlock(jsContent, eventMatch) {
  // Find the event's position
  const eventIndex = jsContent.indexOf(eventMatch);
  if (eventIndex === -1) return false;

  // Get content before the event
  const beforeEvent = jsContent.substring(0, eventIndex);

  // Count try/catch balance - if we have more "try {" than "} catch", we're in try block
  const tryCount = (beforeEvent.match(/\btry\s*\{/g) || []).length;
  const catchCount = (beforeEvent.match(/\}\s*catch\s*\(/g) || []).length;

  return tryCount > catchCount;
}

// Helper: Check if event is in a catch block (error path)
function isInCatchBlock(jsContent, eventMatch) {
  // Find the event's position
  const eventIndex = jsContent.indexOf(eventMatch);
  if (eventIndex === -1) return false;

  // Get content before the event
  const beforeEvent = jsContent.substring(0, eventIndex);

  // Find the last catch block opening
  const lastCatchIndex = beforeEvent.lastIndexOf('catch');
  if (lastCatchIndex === -1) return false;

  // Check if we're still inside that catch block (not closed yet)
  const afterCatch = jsContent.substring(lastCatchIndex, eventIndex);

  // Count opening and closing braces in the catch block portion
  const openBraces = (afterCatch.match(/\{/g) || []).length;
  const closeBraces = (afterCatch.match(/\}/g) || []).length;

  // If more opening than closing braces after catch, we're inside the catch block
  return openBraces > closeBraces;
}

// Helper: Get the canonical event names from product-grid.js
function getCanonicalEvents(jsContent) {
  const events = extractCustomEvents(jsContent);
  const uniqueNames = [...new Set(events.map(e => e.name))];
  return uniqueNames.sort();
}

// Test suite
describe('Product List Dropin Event Emissions', () => {
  let dropinContent;
  let gridContent;
  let dropinEvents;
  let gridEvents;

  before(() => {
    // Verify files exist
    assert.ok(fileExists(PRODUCT_LIST_DROPIN_PATH),
      `product-list-dropin.js should exist at ${PRODUCT_LIST_DROPIN_PATH}`);
    assert.ok(fileExists(PRODUCT_GRID_PATH),
      `product-grid.js should exist at ${PRODUCT_GRID_PATH}`);

    // Read file contents
    dropinContent = readJSFile(PRODUCT_LIST_DROPIN_PATH);
    gridContent = readJSFile(PRODUCT_GRID_PATH);

    // Extract events
    dropinEvents = extractCustomEvents(dropinContent);
    gridEvents = extractCustomEvents(gridContent);

    console.log('\n=== Dropin Events Found ===');
    dropinEvents.forEach(e => console.log(`  Line ${e.lineNumber}: ${e.name}${e.hasDetail ? ' (with detail)' : ''}`));

    console.log('\n=== Grid Events (Reference) ===');
    gridEvents.forEach(e => console.log(`  Line ${e.lineNumber}: ${e.name}${e.hasDetail ? ' (with detail)' : ''}`));
  });

  describe('Test 1: catalogLoading Emitted on Initialization', () => {
    it('should emit catalogLoading event before API call', () => {
      // Given: block begins decoration
      // When: decorate(block) is called
      // Then: catalogLoading event should be dispatched BEFORE API call

      const catalogLoadingEvents = dropinEvents.filter(e => e.name === 'catalogLoading');

      assert.ok(
        catalogLoadingEvents.length > 0,
        'catalogLoading event should be emitted at least once. ' +
        `Found events: ${dropinEvents.map(e => e.name).join(', ')}`
      );

      // Verify it's emitted early (in the try block, before imports/render)
      const firstLoading = catalogLoadingEvents[0];
      assert.ok(
        firstLoading.lineNumber < 50,
        `catalogLoading should be emitted early in the function (before line 50). ` +
        `Found at line ${firstLoading.lineNumber}`
      );
    });
  });

  describe('Test 2: catalogLoaded Emitted on Success Only', () => {
    it('should emit catalogLoaded event on successful completion', () => {
      // Given: search completes successfully
      // When: search API returns products
      // Then: catalogLoaded event should be dispatched

      const catalogLoadedEvents = dropinEvents.filter(e => e.name === 'catalogLoaded');

      assert.ok(
        catalogLoadedEvents.length >= 1,
        'catalogLoaded event should be emitted at least once on success path'
      );

      // At least one should be in the try block (success path)
      const successPathEvents = catalogLoadedEvents.filter(e => {
        const eventLine = `new CustomEvent('catalogLoaded')`;
        // Check if this occurrence is in a try block
        const lines = dropinContent.split('\n');
        let tryDepth = 0;
        for (let i = 0; i < e.lineNumber - 1; i++) {
          const line = lines[i];
          if (/\btry\s*\{/.test(line)) tryDepth++;
          if (/\}\s*catch\s*\(/.test(line)) tryDepth--;
        }
        return tryDepth > 0;
      });

      assert.ok(
        successPathEvents.length >= 1,
        'At least one catalogLoaded event should be in the success path (try block)'
      );
    });

    it('should NOT emit catalogLoaded in error handler', () => {
      // Given: error occurs during initialization
      // When: checking the catch block
      // Then: catalogLoaded should NOT be in the catch block

      // Find all catalogLoaded occurrences and check if any are in catch blocks
      const lines = dropinContent.split('\n');
      let inCatchBlock = false;
      let braceCount = 0;
      let catchBraceStart = 0;
      let foundInCatch = false;
      let foundLineNumber = -1;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Track entering/exiting catch blocks
        if (/\}\s*catch\s*\([^)]*\)\s*\{/.test(line) || /catch\s*\([^)]*\)\s*\{/.test(line)) {
          inCatchBlock = true;
          braceCount = 1;
          catchBraceStart = i;
        } else if (inCatchBlock) {
          braceCount += (line.match(/\{/g) || []).length;
          braceCount -= (line.match(/\}/g) || []).length;
          if (braceCount <= 0) {
            inCatchBlock = false;
          }
        }

        // Check if catalogLoaded is EMITTED (not just mentioned in comments) in catch block
        // Must be in a dispatchEvent or emitCatalogEvent call, not just any mention
        const isComment = line.trim().startsWith('//') || line.trim().startsWith('*');
        const isDirectDispatch = line.includes('new CustomEvent') && line.includes('catalogLoaded');
        const isHelperDispatch = line.includes('emitCatalogEvent') && line.includes('catalogLoaded');
        if (inCatchBlock && (isDirectDispatch || isHelperDispatch) && !isComment) {
          foundInCatch = true;
          foundLineNumber = i + 1;
        }
      }

      assert.ok(
        !foundInCatch,
        `catalogLoaded should NOT be emitted in catch block. ` +
        `Found at line ${foundLineNumber}. Use catalogError instead.`
      );
    });
  });

  describe('Test 3: catalogError Emitted on Failure', () => {
    it('should emit catalogError event when error is caught', () => {
      // Given: search or initialization fails
      // When: error is caught
      // Then: catalogError event should be dispatched

      const catalogErrorEvents = dropinEvents.filter(e => e.name === 'catalogError');

      assert.ok(
        catalogErrorEvents.length >= 1,
        'catalogError event should be emitted at least once. ' +
        `Found events: ${dropinEvents.map(e => e.name).join(', ')}`
      );
    });

    it('should emit catalogError in the catch block', () => {
      // Verify catalogError is in a catch block
      const lines = dropinContent.split('\n');
      let foundInCatch = false;
      let inCatchBlock = false;
      let braceCount = 0;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (/\}\s*catch\s*\([^)]*\)\s*\{/.test(line) || /catch\s*\([^)]*\)\s*\{/.test(line)) {
          inCatchBlock = true;
          braceCount = 1;
        } else if (inCatchBlock) {
          braceCount += (line.match(/\{/g) || []).length;
          braceCount -= (line.match(/\}/g) || []).length;
          if (braceCount <= 0) {
            inCatchBlock = false;
          }
        }

        if (inCatchBlock && line.includes("catalogError")) {
          foundInCatch = true;
          break;
        }
      }

      assert.ok(
        foundInCatch,
        'catalogError event should be emitted within a catch block'
      );
    });

    it('should include error details in catalogError event', () => {
      // The catalogError event should have a detail property with error info
      const catalogErrorEvents = dropinEvents.filter(e => e.name === 'catalogError');

      // At least one should have detail with error
      const withErrorDetail = catalogErrorEvents.filter(e =>
        e.hasDetail && e.detail && e.detail.includes('error')
      );

      assert.ok(
        withErrorDetail.length >= 1,
        'catalogError event should include error details (e.g., { detail: { error: error.message } }). ' +
        `Found: ${catalogErrorEvents.map(e => e.fullMatch).join(', ')}`
      );
    });
  });

  describe('Test 4: facetsValidating Emitted on Filter Change', () => {
    it('should emit facetsValidating event during filter operations', () => {
      // Given: user changes a facet filter
      // When: checkbox/radio is toggled
      // Then: facetsValidating should be emitted

      const facetsValidatingEvents = dropinEvents.filter(e => e.name === 'facetsValidating');

      assert.ok(
        facetsValidatingEvents.length >= 1,
        'facetsValidating event should be emitted at least once. ' +
        `Found events: ${dropinEvents.map(e => e.name).join(', ')}`
      );
    });

    it('should emit facetsValidating with validating: true first', () => {
      // facetsValidating should be emitted with { validating: true }
      const facetsValidatingEvents = dropinEvents.filter(e => e.name === 'facetsValidating');

      const withValidatingTrue = facetsValidatingEvents.filter(e =>
        e.hasDetail && e.detail && e.detail.includes('validating') && e.detail.includes('true')
      );

      assert.ok(
        withValidatingTrue.length >= 1,
        'facetsValidating event should be emitted with { detail: { validating: true } }. ' +
        `Found: ${facetsValidatingEvents.map(e => e.fullMatch).join(', ')}`
      );
    });

    it('should emit facetsValidating with validating: false after', () => {
      // facetsValidating should be emitted with { validating: false }
      const facetsValidatingEvents = dropinEvents.filter(e => e.name === 'facetsValidating');

      const withValidatingFalse = facetsValidatingEvents.filter(e =>
        e.hasDetail && e.detail && e.detail.includes('validating') && e.detail.includes('false')
      );

      assert.ok(
        withValidatingFalse.length >= 1,
        'facetsValidating event should be emitted with { detail: { validating: false } }. ' +
        `Found: ${facetsValidatingEvents.map(e => e.fullMatch).join(', ')}`
      );
    });
  });

  describe('Test 5: Event Names Match product-grid.js', () => {
    it('should use the exact same event names as product-grid.js', () => {
      // Given: all event emissions
      // When: checking event names
      // Then: names should match exactly: catalogLoading, catalogLoaded, catalogError, facetsValidating

      const expectedEvents = ['catalogError', 'catalogLoaded', 'catalogLoading', 'facetsValidating'];
      const dropinEventNames = [...new Set(dropinEvents.map(e => e.name))].sort();

      // Check that all expected events are present
      for (const expected of expectedEvents) {
        assert.ok(
          dropinEventNames.includes(expected),
          `Event "${expected}" should be emitted by product-list-dropin.js. ` +
          `Found events: ${dropinEventNames.join(', ')}`
        );
      }
    });

    it('should emit the same catalog events as product-grid.js', () => {
      // Get catalog-related events from both files
      const catalogEvents = ['catalogLoading', 'catalogLoaded', 'catalogError'];

      const gridCatalogEvents = gridEvents
        .filter(e => catalogEvents.includes(e.name))
        .map(e => e.name);
      const dropinCatalogEvents = dropinEvents
        .filter(e => catalogEvents.includes(e.name))
        .map(e => e.name);

      // Both should have all three catalog events
      for (const event of catalogEvents) {
        assert.ok(
          dropinCatalogEvents.includes(event),
          `Dropin should emit ${event} (grid emits: ${gridCatalogEvents.filter(e => e === event).length}x)`
        );
      }
    });

    it('should emit facetsValidating with same detail structure as product-grid.js', () => {
      // Get facetsValidating events from grid as reference
      const gridFacetsEvents = gridEvents.filter(e => e.name === 'facetsValidating');
      const dropinFacetsEvents = dropinEvents.filter(e => e.name === 'facetsValidating');

      // Grid should have facetsValidating (sanity check)
      assert.ok(
        gridFacetsEvents.length > 0,
        'product-grid.js should have facetsValidating events as reference'
      );

      // Dropin should have matching structure
      assert.ok(
        dropinFacetsEvents.length > 0,
        'product-list-dropin.js should emit facetsValidating events'
      );

      // Both should have detail with validating boolean
      const gridHasDetail = gridFacetsEvents.some(e =>
        e.hasDetail && e.detail && e.detail.includes('validating')
      );
      const dropinHasDetail = dropinFacetsEvents.some(e =>
        e.hasDetail && e.detail && e.detail.includes('validating')
      );

      assert.ok(
        gridHasDetail,
        'product-grid.js facetsValidating should have { detail: { validating: boolean } }'
      );
      assert.ok(
        dropinHasDetail,
        'product-list-dropin.js facetsValidating should have { detail: { validating: boolean } }'
      );
    });
  });

  describe('Helper Function (Optional Refactoring)', () => {
    it('should have an event emission helper function for consistency', () => {
      // Check if there's a helper function like emitCatalogEvent
      const hasHelper =
        dropinContent.includes('emitCatalogEvent') ||
        dropinContent.includes('dispatchCatalogEvent') ||
        dropinContent.includes('emitEvent');

      // This is optional but recommended for maintainability
      // The test passes if the pattern is direct but consistent
      const directEmissions = dropinContent.match(/window\.dispatchEvent\s*\(\s*new\s+CustomEvent/g) || [];

      if (!hasHelper && directEmissions.length >= 4) {
        console.log('\n[SUGGESTION] Consider extracting a helper function for event emission:');
        console.log('  function emitCatalogEvent(eventName, detail = {}) {');
        console.log("    window.dispatchEvent(new CustomEvent(eventName, { detail }));");
        console.log(`    console.log('[ProductListDropin] Event emitted:', eventName, detail);`);
        console.log('  }');
      }

      // This test always passes - it's just a suggestion
      assert.ok(true, 'Event emission pattern checked');
    });
  });
});
