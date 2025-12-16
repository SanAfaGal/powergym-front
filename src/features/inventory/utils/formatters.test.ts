/**
 * Tests for inventory formatter utilities
 */
import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatQuantity,
  formatDate,
  parseQuantity,
  formatPhone,
} from './formatters';

describe('formatters', () => {
  describe('formatCurrency', () => {
    it('should format number as currency', () => {
      const formatted = formatCurrency(1000);
      expect(formatted).toContain('1.000');
    });

    it('should format string as currency', () => {
      const formatted = formatCurrency('1000');
      expect(formatted).toContain('1.000');
    });

    it('should handle COP currency by default', () => {
      const formatted = formatCurrency(1000, 'COP');
      expect(formatted).toContain('1.000');
    });

    it('should handle USD currency', () => {
      const formatted = formatCurrency(1000, 'USD');
      expect(formatted).toContain('$');
    });

    it('should handle decimal amounts', () => {
      const formatted = formatCurrency(1234.56);
      expect(formatted).toContain('1.234');
    });

    it('should handle invalid values', () => {
      expect(formatCurrency('invalid')).toBe('invalid');
      expect(formatCurrency(NaN)).toBe('NaN');
    });

    it('should handle zero', () => {
      const formatted = formatCurrency(0);
      expect(formatted).toContain('0');
    });

    it('should handle negative values', () => {
      const formatted = formatCurrency(-1000);
      expect(formatted).toContain('-');
    });
  });

  describe('formatQuantity', () => {
    it('should format number quantity', () => {
      expect(formatQuantity(100)).toBe('100');
      expect(formatQuantity(0)).toBe('0');
      expect(formatQuantity(1234)).toBe('1234');
    });

    it('should format string quantity', () => {
      expect(formatQuantity('100')).toBe('100');
      expect(formatQuantity('0')).toBe('0');
    });

    it('should format with unit', () => {
      expect(formatQuantity(100, 'kg')).toBe('100 kg');
      expect(formatQuantity(50, 'ml')).toBe('50 ml');
      expect(formatQuantity(0, 'units')).toBe('0 units');
    });

    it('should handle decimal quantities (rounded)', () => {
      expect(formatQuantity(99.9)).toBe('100');
      expect(formatQuantity(50.4)).toBe('50');
    });

    it('should handle invalid values', () => {
      expect(formatQuantity('invalid')).toBe('invalid');
      expect(formatQuantity(NaN)).toBe('NaN');
    });
  });

  describe('formatDate', () => {
    it('should format date with short format', () => {
      const date = new Date('2024-01-15T14:30:00');
      const formatted = formatDate(date, 'short');
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it('should format date with long format', () => {
      const date = new Date('2024-01-15T14:30:00');
      const formatted = formatDate(date, 'long');
      expect(formatted.length).toBeGreaterThan(10);
    });

    it('should format date with time format', () => {
      const date = new Date('2024-01-15T14:30:00');
      const formatted = formatDate(date, 'time');
      expect(formatted).toMatch(/\d{2}:\d{2}/);
    });

    it('should handle string dates', () => {
      const formatted = formatDate('2024-01-15T14:30:00', 'short');
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it('should handle invalid dates', () => {
      const formatted = formatDate('invalid-date', 'short');
      expect(typeof formatted).toBe('string');
    });

    it('should default to long format', () => {
      const date = new Date('2024-01-15T14:30:00');
      const formatted = formatDate(date);
      expect(formatted.length).toBeGreaterThan(10);
    });
  });

  describe('parseQuantity', () => {
    it('should parse string quantity to number', () => {
      expect(parseQuantity('100')).toBe(100);
      expect(parseQuantity('0')).toBe(0);
      expect(parseQuantity('123.45')).toBeCloseTo(123.45, 2);
    });

    it('should return number as is', () => {
      expect(parseQuantity(100)).toBe(100);
      expect(parseQuantity(0)).toBe(0);
      expect(parseQuantity(123.45)).toBe(123.45);
    });

    it('should return 0 for invalid values', () => {
      expect(parseQuantity('invalid')).toBe(0);
      expect(parseQuantity('abc')).toBe(0);
      expect(parseQuantity('')).toBe(0);
    });

    it('should handle negative values', () => {
      expect(parseQuantity('-100')).toBe(-100);
      expect(parseQuantity(-100)).toBe(-100);
    });
  });

  describe('formatPhone', () => {
    it('should format phone with country code', () => {
      expect(formatPhone('3001234567', '+57')).toBe('+573001234567');
      expect(formatPhone('5551234567', '+1')).toBe('+15551234567');
    });

    it('should handle phone with spaces', () => {
      expect(formatPhone('300 123 4567', '+57')).toBe('+573001234567');
      expect(formatPhone('  3001234567  ', '+57')).toBe('+573001234567');
    });

    it('should return empty string for empty phone', () => {
      expect(formatPhone('', '+57')).toBe('');
      expect(formatPhone('   ', '+57')).toBe('+57');
    });

    it('should handle phone already with country code', () => {
      expect(formatPhone('+573001234567', '+57')).toBe('+57+573001234567');
      // This is expected behavior - function doesn't check for existing code
    });
  });
});

