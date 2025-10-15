/**
 * Tests for UUID validation and query parameter sanitization
 * in the Manage Encounter page
 */

describe('UUID Validation', () => {
  // Copy of the isValidUuid function from the page
  function isValidUuid(v?: string | null) {
    if (!v) return false;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
  }

  it('validates correct UUID v4 format', () => {
    expect(isValidUuid('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    expect(isValidUuid('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe(true);
    expect(isValidUuid('f47ac10b-58cc-4372-a567-0e02b2c3d479')).toBe(true);
  });

  it('rejects invalid UUID formats', () => {
    expect(isValidUuid('not-a-uuid')).toBe(false);
    expect(isValidUuid('12345678-1234-1234-1234-1234567890ab-extra')).toBe(false);
    expect(isValidUuid('12345678-1234-1234-1234')).toBe(false);
    expect(isValidUuid('')).toBe(false);
  });

  it('rejects undefined and null values', () => {
    expect(isValidUuid(undefined)).toBe(false);
    expect(isValidUuid(null)).toBe(false);
  });

  it('rejects the literal string "undefined"', () => {
    expect(isValidUuid('undefined')).toBe(false);
  });

  it('is case insensitive', () => {
    expect(isValidUuid('550E8400-E29B-41D4-A716-446655440000')).toBe(true);
    expect(isValidUuid('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
  });
});

describe('Query Parameter Sanitization', () => {
  it('should filter out "undefined" string from query params', () => {
    // Simulate the sanitization logic from the page
    const sanitize = (value: string | null) => {
      return value && value !== 'undefined' ? value : null;
    };

    expect(sanitize('undefined')).toBe(null);
    expect(sanitize('valid-id')).toBe('valid-id');
    expect(sanitize(null)).toBe(null);
    expect(sanitize('550e8400-e29b-41d4-a716-446655440000')).toBe('550e8400-e29b-41d4-a716-446655440000');
  });

  it('combines sanitization with UUID validation correctly', () => {
    function isValidUuid(v?: string | null) {
      if (!v) return false;
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
    }

    const sanitize = (value: string | null) => {
      return value && value !== 'undefined' ? value : null;
    };

    // Test the full flow
    const testUndefinedString = sanitize('undefined');
    expect(isValidUuid(testUndefinedString)).toBe(false);

    const testValidUuid = sanitize('550e8400-e29b-41d4-a716-446655440000');
    expect(isValidUuid(testValidUuid)).toBe(true);

    const testInvalidString = sanitize('not-a-uuid');
    expect(isValidUuid(testInvalidString)).toBe(false);
  });
});
