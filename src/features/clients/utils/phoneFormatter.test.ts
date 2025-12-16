/**
 * Tests for phone number formatting utilities
 */
import { describe, it, expect } from 'vitest';
import { formatPhoneNumber, unformatPhoneNumber } from './phoneFormatter';

describe('phoneFormatter', () => {
  describe('formatPhoneNumber', () => {
    it('should format phone number with 3 digits or less', () => {
      expect(formatPhoneNumber('123')).toBe('123');
      expect(formatPhoneNumber('12')).toBe('12');
      expect(formatPhoneNumber('1')).toBe('1');
    });

    it('should format phone number with 4-6 digits', () => {
      expect(formatPhoneNumber('1234')).toBe('123 4');
      expect(formatPhoneNumber('12345')).toBe('123 45');
      expect(formatPhoneNumber('123456')).toBe('123 456');
    });

    it('should format phone number with 7-10 digits', () => {
      expect(formatPhoneNumber('1234567')).toBe('123 456 7');
      expect(formatPhoneNumber('12345678')).toBe('123 456 78');
      expect(formatPhoneNumber('123456789')).toBe('123 456 789');
      expect(formatPhoneNumber('1234567890')).toBe('123 456 7890');
    });

    it('should format phone number with more than 10 digits', () => {
      expect(formatPhoneNumber('12345678901')).toBe('123 456 7890 1');
      expect(formatPhoneNumber('123456789012')).toBe('123 456 7890 12');
    });

    it('should handle phone numbers with existing formatting', () => {
      expect(formatPhoneNumber('123-456-7890')).toBe('123 456 7890');
      expect(formatPhoneNumber('(123) 456-7890')).toBe('123 456 7890');
      expect(formatPhoneNumber('123.456.7890')).toBe('123 456 7890');
    });

    it('should handle empty string', () => {
      expect(formatPhoneNumber('')).toBe('');
    });

    it('should handle strings with only non-digit characters', () => {
      expect(formatPhoneNumber('abc')).toBe('');
      expect(formatPhoneNumber('---')).toBe('');
      expect(formatPhoneNumber('   ')).toBe('');
    });
  });

  describe('unformatPhoneNumber', () => {
    it('should remove spaces from formatted phone number', () => {
      expect(unformatPhoneNumber('123 456 7890')).toBe('1234567890');
      expect(unformatPhoneNumber('123 45')).toBe('12345');
      expect(unformatPhoneNumber('12 3 4 5')).toBe('12345');
    });

    it('should handle already unformatted numbers', () => {
      expect(unformatPhoneNumber('1234567890')).toBe('1234567890');
      expect(unformatPhoneNumber('123')).toBe('123');
    });

    it('should handle empty string', () => {
      expect(unformatPhoneNumber('')).toBe('');
    });

    it('should handle numbers with multiple spaces', () => {
      expect(unformatPhoneNumber('123   456   7890')).toBe('1234567890');
      expect(unformatPhoneNumber('  123  456  7890  ')).toBe('1234567890');
    });

    it('should preserve non-space characters (only removes spaces)', () => {
      expect(unformatPhoneNumber('123-456-7890')).toBe('123-456-7890');
      expect(unformatPhoneNumber('(123) 456-7890')).toBe('(123)456-7890');
    });
  });
});

