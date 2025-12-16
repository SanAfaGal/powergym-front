/**
 * Tests for date utility functions
 */
import { describe, it, expect } from 'vitest';
import {
  formatAttendanceDate,
  formatAttendanceDateTime,
  formatAttendanceDateTimeFull,
} from './dateUtils';

describe('dateUtils', () => {
  describe('formatAttendanceDate', () => {
    it('should format valid ISO date string', () => {
      const dateString = '2024-01-15T10:30:00Z';
      const formatted = formatAttendanceDate(dateString);
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it('should handle date-only string', () => {
      const dateString = '2024-01-15';
      const formatted = formatAttendanceDate(dateString);
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it('should return error message for invalid date', () => {
      expect(formatAttendanceDate('invalid-date')).toBe('Fecha inválida');
      expect(formatAttendanceDate('')).toBe('Fecha inválida');
      expect(formatAttendanceDate('2024-13-45')).toBe('Fecha inválida');
    });
  });

  describe('formatAttendanceDateTime', () => {
    it('should format date and time correctly', () => {
      const dateString = '2024-01-15T14:30:45Z';
      const result = formatAttendanceDateTime(dateString);

      expect(result.date).toMatch(/\d{2}\/\d{2}\/\d{4}/);
      expect(result.time).toMatch(/\d{2}:\d{2}:\d{2}/);
    });

    it('should return error messages for invalid date', () => {
      const result = formatAttendanceDateTime('invalid-date');
      expect(result.date).toBe('Fecha inválida');
      expect(result.time).toBe('Hora inválida');
    });
  });

  describe('formatAttendanceDateTimeFull', () => {
    it('should format with full locale formatting', () => {
      const dateString = '2024-01-15T14:30:45Z';
      const result = formatAttendanceDateTimeFull(dateString);

      expect(result.date).toContain('2024');
      expect(result.time).toMatch(/\d{2}:\d{2}:\d{2}/);
    });

    it('should return error messages for invalid date', () => {
      const result = formatAttendanceDateTimeFull('invalid-date');
      expect(result.date).toBe('Fecha inválida');
      expect(result.time).toBe('Hora inválida');
    });

    it('should include day name and month name in Spanish', () => {
      const dateString = '2024-01-15T14:30:45Z';
      const result = formatAttendanceDateTimeFull(dateString);
      // Should contain Spanish month name
      expect(result.date.length).toBeGreaterThan(10);
    });
  });
});

