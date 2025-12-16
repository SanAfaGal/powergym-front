/**
 * Tests for logger utility
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger, logApiCall, logApiResponse } from './logger';

describe('logger', () => {
  let originalEnv: boolean;
  let consoleLogSpy: ReturnType<typeof vi.spyOn<typeof console, 'log'>>;
  let consoleInfoSpy: ReturnType<typeof vi.spyOn<typeof console, 'info'>>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn<typeof console, 'warn'>>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn<typeof console, 'error'>>;
  let consoleDebugSpy: ReturnType<typeof vi.spyOn<typeof console, 'debug'>>;

  beforeEach(() => {
    originalEnv = import.meta.env.DEV;
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => { });
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => { });
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
    consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => { });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // Reset env if needed
    Object.defineProperty(import.meta, 'env', {
      value: { ...import.meta.env, DEV: originalEnv },
      writable: true,
      configurable: true,
    });
  });

  describe('in development mode', () => {
    beforeEach(() => {
      Object.defineProperty(import.meta, 'env', {
        value: { ...import.meta.env, DEV: true },
        writable: true,
        configurable: true,
      });
    });

    it('should log messages using logger.log', () => {
      logger.log('test message');
      expect(consoleLogSpy).toHaveBeenCalledWith('test message');
    });

    it('should log messages using logger.info', () => {
      logger.info('info message');
      expect(consoleInfoSpy).toHaveBeenCalledWith('info message');
    });

    it('should log messages using logger.warn', () => {
      logger.warn('warning message');
      expect(consoleWarnSpy).toHaveBeenCalledWith('warning message');
    });

    it('should log messages using logger.error', () => {
      logger.error('error message');
      expect(consoleErrorSpy).toHaveBeenCalledWith('error message');
    });

    it('should log messages using logger.debug', () => {
      logger.debug('debug message');
      expect(consoleDebugSpy).toHaveBeenCalledWith('debug message');
    });

    it('should handle multiple arguments', () => {
      logger.log('message', { data: 'test' }, 123);
      expect(consoleLogSpy).toHaveBeenCalledWith('message', { data: 'test' }, 123);
    });

    it('should log API calls using logApiCall', () => {
      logApiCall('GET', '/api/clients', { id: '123' });
      expect(consoleDebugSpy).toHaveBeenCalled();
    });

    it('should log API responses using logApiResponse', () => {
      logApiResponse('POST', { success: true });
      expect(consoleDebugSpy).toHaveBeenCalled();
    });
  });

  describe('in production mode', () => {
    beforeEach(() => {
      Object.defineProperty(import.meta, 'env', {
        value: { ...import.meta.env, DEV: false },
        writable: true,
        configurable: true,
      });
    });

    it('should STILL log errors using logger.error (even in production)', () => {
      logger.error('error message');
      expect(consoleErrorSpy).toHaveBeenCalledWith('error message');
    });
  });
});

