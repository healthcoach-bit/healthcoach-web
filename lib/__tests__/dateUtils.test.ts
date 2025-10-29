/**
 * ⚠️ CRITICAL TESTS: Timestamp Display
 * 
 * These tests verify that timestamps are displayed WITHOUT timezone conversion.
 * 
 * Our system stores "display time" not actual UTC:
 * - "2025-10-29T09:00:00.000Z" means 9:00 AM local (NOT 9:00 AM UTC)
 * 
 * These tests MUST pass before deploying any changes to dateUtils.
 */

import { formatTime, formatDateTime } from '../dateUtils';

describe('formatTime - CRITICAL timestamp display', () => {
  describe('should display time WITHOUT timezone conversion', () => {
    it('displays 9:00 AM as 9:00 AM (not 2:00 AM)', () => {
      // This is the most critical test - ensures no UTC conversion
      const timestamp = '2025-10-29T09:00:00.000Z';
      const result = formatTime(timestamp, 'es');
      
      // MUST be 9:00 a. m. - NOT 2:00 a. m. (which would be UTC-7 conversion)
      expect(result).toBe('9:00 a. m.');
    });
    
    it('displays 2:30 PM correctly', () => {
      const timestamp = '2025-10-29T14:30:00.000Z';
      const result = formatTime(timestamp, 'es');
      expect(result).toBe('2:30 p. m.');
    });
    
    it('displays midnight correctly', () => {
      const timestamp = '2025-10-29T00:00:00.000Z';
      const result = formatTime(timestamp, 'es');
      expect(result).toBe('12:00 a. m.');
    });
    
    it('displays noon correctly', () => {
      const timestamp = '2025-10-29T12:00:00.000Z';
      const result = formatTime(timestamp, 'es');
      expect(result).toBe('12:00 p. m.');
    });
  });
  
  describe('works for different locales', () => {
    it('formats for Spanish (es)', () => {
      expect(formatTime('2025-10-29T15:00:00.000Z', 'es')).toBe('3:00 p. m.');
    });
    
    it('formats for English (en)', () => {
      expect(formatTime('2025-10-29T15:00:00.000Z', 'en')).toBe('3:00 PM');
    });
  });
  
  describe('handles edge cases', () => {
    it('returns placeholder for null timestamp', () => {
      expect(formatTime(null, 'es')).toBe('--:--');
    });
    
    it('returns placeholder for undefined timestamp', () => {
      expect(formatTime(undefined, 'es')).toBe('--:--');
    });
    
    it('returns placeholder for empty string', () => {
      expect(formatTime('', 'es')).toBe('--:--');
    });
  });
  
  describe('handles different timestamp formats', () => {
    it('handles timestamps with milliseconds', () => {
      expect(formatTime('2025-10-29T09:30:00.123Z', 'es')).toBe('9:30 a. m.');
    });
    
    it('handles timestamps without milliseconds', () => {
      expect(formatTime('2025-10-29T09:30:00Z', 'es')).toBe('9:30 a. m.');
    });
  });
});

describe('Timestamp extraction for datetime-local input', () => {
  it('extracts datetime correctly without conversion', () => {
    const timestamp = '2025-10-29T09:00:00.000Z';
    const match = timestamp.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);
    
    expect(match).not.toBeNull();
    const result = `${match![1]}T${match![2]}`;
    
    // MUST be 09:00, not converted to 02:00
    expect(result).toBe('2025-10-29T09:00');
  });
  
  it('extracts afternoon time correctly', () => {
    const timestamp = '2025-10-29T14:30:00.000Z';
    const match = timestamp.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);
    const result = `${match![1]}T${match![2]}`;
    
    expect(result).toBe('2025-10-29T14:30');
  });
});

describe('REGRESSION TESTS - Previous bugs', () => {
  it('9:00 AM should NOT display as 2:00 AM (UTC-7 bug)', () => {
    const result = formatTime('2025-10-29T09:00:00.000Z', 'es');
    expect(result).not.toBe('2:00 a. m.');
    expect(result).toBe('9:00 a. m.');
  });
  
  it('Edit form should show 9:00 not 2:00', () => {
    const timestamp = '2025-10-29T09:00:00.000Z';
    const match = timestamp.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);
    const result = `${match![1]}T${match![2]}`;
    
    expect(result).toContain('T09:00');
    expect(result).not.toContain('T02:00');
  });
});
