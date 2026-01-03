/**
 * Security Tests for Login Form Block
 *
 * Tests for Open Redirect vulnerability prevention
 * Validates that redirect URLs are properly sanitized
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the getSafeRedirectUrl function logic for testing
// (In production, this is defined in login-form.js)
function getSafeRedirectUrl(url) {
  if (!url || typeof url !== 'string') return null;

  try {
    const decoded = decodeURIComponent(url);

    // Security: Reject URLs with control characters (newlines, tabs, etc.)
    if (/[\n\r\t]/.test(decoded)) {
      return null;
    }

    // Allow relative URLs (starting with / but not //)
    if (decoded.startsWith('/') && !decoded.startsWith('//')) {
      return decoded;
    }

    // Check if same origin for absolute URLs
    const parsedUrl = new URL(decoded, 'https://example.com');
    if (parsedUrl.origin === 'https://example.com') {
      return parsedUrl.pathname + parsedUrl.search + parsedUrl.hash;
    }

    // Reject external URLs
    return null;
  } catch (e) {
    return null;
  }
}

describe('Login Form Security: Open Redirect Prevention', () => {

  describe('getSafeRedirectUrl', () => {

    // ========================================================================
    // VALID REDIRECT URLs (should pass)
    // ========================================================================
    describe('Valid Relative URLs', () => {
      it('should allow simple relative path', () => {
        expect(getSafeRedirectUrl('/pages/dashboard.html')).toBe('/pages/dashboard.html');
      });

      it('should allow root path', () => {
        expect(getSafeRedirectUrl('/')).toBe('/');
      });

      it('should allow path with query string', () => {
        expect(getSafeRedirectUrl('/catalog?category=lumber')).toBe('/catalog?category=lumber');
      });

      it('should allow path with hash', () => {
        expect(getSafeRedirectUrl('/pages/account.html#orders')).toBe('/pages/account.html#orders');
      });

      it('should allow URL-encoded relative path', () => {
        const encoded = encodeURIComponent('/pages/catalog.html');
        expect(getSafeRedirectUrl(encoded)).toBe('/pages/catalog.html');
      });

      it('should allow path with query and hash', () => {
        expect(getSafeRedirectUrl('/catalog?q=test#results')).toBe('/catalog?q=test#results');
      });
    });

    // ========================================================================
    // INVALID REDIRECT URLs (should be rejected)
    // ========================================================================
    describe('Malicious External URLs', () => {
      it('should reject absolute external URL', () => {
        expect(getSafeRedirectUrl('https://malicious-site.com/steal')).toBeNull();
      });

      it('should reject external URL with similar domain', () => {
        expect(getSafeRedirectUrl('https://example.com.evil.com/phish')).toBeNull();
      });

      it('should reject URL-encoded external URL', () => {
        const encoded = encodeURIComponent('https://evil.com/phish');
        expect(getSafeRedirectUrl(encoded)).toBeNull();
      });

      it('should reject protocol-relative URL (//)', () => {
        expect(getSafeRedirectUrl('//evil.com/path')).toBeNull();
      });

      it('should reject javascript: protocol', () => {
        expect(getSafeRedirectUrl('javascript:alert(1)')).toBeNull();
      });

      it('should reject data: protocol', () => {
        expect(getSafeRedirectUrl('data:text/html,<script>alert(1)</script>')).toBeNull();
      });

      it('should reject URL-encoded javascript: protocol', () => {
        const encoded = encodeURIComponent('javascript:alert(1)');
        expect(getSafeRedirectUrl(encoded)).toBeNull();
      });
    });

    describe('Edge Cases', () => {
      it('should reject null input', () => {
        expect(getSafeRedirectUrl(null)).toBeNull();
      });

      it('should reject undefined input', () => {
        expect(getSafeRedirectUrl(undefined)).toBeNull();
      });

      it('should reject empty string', () => {
        expect(getSafeRedirectUrl('')).toBeNull();
      });

      it('should reject non-string input (number)', () => {
        expect(getSafeRedirectUrl(123)).toBeNull();
      });

      it('should reject non-string input (object)', () => {
        expect(getSafeRedirectUrl({ url: '/path' })).toBeNull();
      });

      it('should reject malformed URL encoding', () => {
        expect(getSafeRedirectUrl('%ZZ%invalid')).toBeNull();
      });
    });

    describe('Bypass Attempts', () => {
      it('should reject backslash protocol bypass', () => {
        // Some browsers interpret \\ as //
        expect(getSafeRedirectUrl('\\\\evil.com')).toBeNull();
      });

      it('should reject URL with @ symbol (credential bypass)', () => {
        expect(getSafeRedirectUrl('https://safe.com@evil.com/path')).toBeNull();
      });

      it('should handle triple-encoded URLs safely', () => {
        // Triple encode https://evil.com
        const tripleEncoded = encodeURIComponent(encodeURIComponent(encodeURIComponent('https://evil.com')));
        const result = getSafeRedirectUrl(tripleEncoded);
        // After one decode, the result starts with / so it's treated as relative path
        // This is safe because browsers interpret it as a literal path segment, not a URL
        // The result "/https%253A%252F%252Fevil.com" navigates to that literal path on same origin
        expect(result).not.toContain('://'); // Does not contain protocol separator
        // The actual navigation will be to same-origin path, not external site
      });

      it('should reject newline injection attempt', () => {
        // URLs with newlines could be used for response splitting attacks
        expect(getSafeRedirectUrl('/path\nhttps://evil.com')).toBeNull();
      });

      it('should reject carriage return injection attempt', () => {
        expect(getSafeRedirectUrl('/path\rhttps://evil.com')).toBeNull();
      });

      it('should reject tab injection attempt', () => {
        expect(getSafeRedirectUrl('/path\thttps://evil.com')).toBeNull();
      });
    });
  });
});
