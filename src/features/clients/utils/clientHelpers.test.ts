/**
 * Tests for client helper functions
 */
import { describe, it, expect } from 'vitest';
import { clientHelpers } from './clientHelpers';
import { Client, ClientFormData } from '../types';

describe('clientHelpers', () => {
  describe('calculateAge', () => {
    it('should calculate age correctly for a person born 25 years ago', () => {
      const today = new Date();
      const birthDate = new Date(today.getFullYear() - 25, today.getMonth(), today.getDate());
      const age = clientHelpers.calculateAge(birthDate.toISOString().split('T')[0]);
      expect(age).toBe(25);
    });

    it('should calculate age correctly accounting for month', () => {
      const today = new Date();
      // Person born 6 months ago (should be 0 years old)
      const birthDate = new Date(today.getFullYear(), today.getMonth() - 6, today.getDate());
      const age = clientHelpers.calculateAge(birthDate.toISOString().split('T')[0]);
      expect(age).toBe(0);
    });

    it('should calculate age correctly accounting for day within month', () => {
      const today = new Date();
      // Person born 20 days ago in same month (should be 0 years old)
      const birthDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 20);
      const age = clientHelpers.calculateAge(birthDate.toISOString().split('T')[0]);
      expect(age).toBe(0);
    });

    it('should handle birthday that has not occurred yet this year', () => {
      const today = new Date();
      // Person born 25 years ago but birthday hasn't occurred this year
      const birthDate = new Date(today.getFullYear() - 25, today.getMonth() + 1, today.getDate());
      const age = clientHelpers.calculateAge(birthDate.toISOString().split('T')[0]);
      expect(age).toBe(24);
    });

    it('should handle edge case: birthday today', () => {
      const today = new Date();
      const birthDate = new Date(today.getFullYear() - 30, today.getMonth(), today.getDate());
      const age = clientHelpers.calculateAge(birthDate.toISOString().split('T')[0]);
      expect(age).toBe(30);
    });
  });

  describe('formatFullName', () => {
    const mockClient: Client = {
      id: '1',
      dni_type: 'cc',
      dni_number: '1234567890',
      first_name: 'Juan',
      middle_name: 'Carlos',
      last_name: 'Pérez',
      second_last_name: 'González',
      phone: '+573001234567',
      birth_date: '1990-01-01',
      gender: 'male',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      meta_info: {},
    };

    const mockClientFormData: ClientFormData = {
      dni_type: 'cc',
      dni_number: '1234567890',
      first_name: 'María',
      middle_name: 'José',
      last_name: 'Rodríguez',
      second_last_name: 'López',
      phone: '+573001234567',
      birth_date: '1990-01-01',
      gender: 'female',
    };

    it('should format full name from Client object', () => {
      expect(clientHelpers.formatFullName(mockClient)).toBe('Juan Carlos Pérez González');
    });

    it('should format full name from ClientFormData object', () => {
      // Note: ClientFormData uses different field names internally
      // This test verifies the function handles the type correctly
      const clientWithFormDataFields = {
        ...mockClientFormData,
        second_name: mockClientFormData.middle_name,
        first_surname: mockClientFormData.last_name,
        second_surname: mockClientFormData.second_last_name,
      };
      // The function should detect it's a Client type (has dni_type)
      expect(clientHelpers.formatFullName(mockClientFormData)).toBe('María José Rodríguez López');
    });

    it('should handle missing optional names', () => {
      const clientWithoutMiddleNames: Client = {
        ...mockClient,
        middle_name: undefined,
        second_last_name: undefined,
      };
      expect(clientHelpers.formatFullName(clientWithoutMiddleNames)).toBe('Juan Pérez');
    });

    it('should handle empty optional names', () => {
      const clientWithEmptyNames: Client = {
        ...mockClient,
        middle_name: '',
        second_last_name: '',
      };
      expect(clientHelpers.formatFullName(clientWithEmptyNames)).toBe('Juan Pérez');
    });
  });

  describe('getInitials', () => {
    const mockClient: Client = {
      id: '1',
      dni_type: 'cc',
      dni_number: '1234567890',
      first_name: 'Juan',
      middle_name: 'Carlos',
      last_name: 'Pérez',
      second_last_name: 'González',
      phone: '+573001234567',
      birth_date: '1990-01-01',
      gender: 'male',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      meta_info: {},
    };

    it('should handle single name', () => {
      const singleNameClient: Client = {
        ...mockClient,
        first_name: 'Juan',
        middle_name: undefined,
        last_name: '',
        second_last_name: undefined,
      };
      const initials = clientHelpers.getInitials(singleNameClient);
      expect(initials.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('isClientActive', () => {
    it('should return true for active client', () => {
      const activeClient: Client = {
        id: '1',
        dni_type: 'cc',
        dni_number: '1234567890',
        first_name: 'Juan',
        last_name: 'Pérez',
        phone: '+573001234567',
        birth_date: '1990-01-01',
        gender: 'male',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        meta_info: {},
      };
      expect(clientHelpers.isClientActive(activeClient)).toBe(true);
    });

    it('should return false for inactive client', () => {
      const inactiveClient: Client = {
        id: '1',
        dni_type: 'cc',
        dni_number: '1234567890',
        first_name: 'Juan',
        last_name: 'Pérez',
        phone: '+573001234567',
        birth_date: '1990-01-01',
        gender: 'male',
        is_active: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        meta_info: {},
      };
      expect(clientHelpers.isClientActive(inactiveClient)).toBe(false);
    });
  });

  describe('getClientStatus', () => {
    it('should return "active" for active client', () => {
      const activeClient: Client = {
        id: '1',
        dni_type: 'cc',
        dni_number: '1234567890',
        first_name: 'Juan',
        last_name: 'Pérez',
        phone: '+573001234567',
        birth_date: '1990-01-01',
        gender: 'male',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        meta_info: {},
      };
      expect(clientHelpers.getClientStatus(activeClient)).toBe('active');
    });

    it('should return "inactive" for inactive client', () => {
      const inactiveClient: Client = {
        id: '1',
        dni_type: 'cc',
        dni_number: '1234567890',
        first_name: 'Juan',
        last_name: 'Pérez',
        phone: '+573001234567',
        birth_date: '1990-01-01',
        gender: 'male',
        is_active: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        meta_info: {},
      };
      expect(clientHelpers.getClientStatus(inactiveClient)).toBe('inactive');
    });
  });

  describe('formatDocumentNumber', () => {
    it('should format document number with type', () => {
      expect(clientHelpers.formatDocumentNumber('cc', '1234567890')).toBe('cc 1234567890');
      expect(clientHelpers.formatDocumentNumber('ce', 'AB123456')).toBe('ce AB123456');
    });
  });

  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(clientHelpers.validateEmail('test@example.com')).toBe(true);
      expect(clientHelpers.validateEmail('user.name@domain.co.uk')).toBe(true);
      expect(clientHelpers.validateEmail('user+tag@example.com')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(clientHelpers.validateEmail('invalid')).toBe(false);
      expect(clientHelpers.validateEmail('invalid@')).toBe(false);
      expect(clientHelpers.validateEmail('@invalid.com')).toBe(false);
      expect(clientHelpers.validateEmail('invalid@.com')).toBe(false);
      expect(clientHelpers.validateEmail('')).toBe(false);
    });
  });

  describe('validatePhone', () => {
    it('should validate correct phone numbers', () => {
      expect(clientHelpers.validatePhone('+573001234567')).toBe(true);
      expect(clientHelpers.validatePhone('3001234567')).toBe(true);
      expect(clientHelpers.validatePhone('+1 555 123 4567')).toBe(true);
    });
  });

  describe('validateDocumentNumber', () => {
    it('should validate correct document numbers', () => {
      expect(clientHelpers.validateDocumentNumber('1234567890')).toBe(true);
      expect(clientHelpers.validateDocumentNumber('123456')).toBe(true);
      expect(clientHelpers.validateDocumentNumber('123456789012')).toBe(true);
    });

    it('should reject invalid document numbers', () => {
      expect(clientHelpers.validateDocumentNumber('12345')).toBe(false); // Too short
      expect(clientHelpers.validateDocumentNumber('1234567890123')).toBe(false); // Too long
      expect(clientHelpers.validateDocumentNumber('abc123')).toBe(false); // Contains letters
      expect(clientHelpers.validateDocumentNumber('')).toBe(false);
    });
  });
});

