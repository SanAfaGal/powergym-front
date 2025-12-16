/**
 * Constants for Attendance Module
 * Centralizes configuration values for consistency and maintainability
 */

// API Timeouts
export const API_TIMEOUTS = {
  default: 30000, // 30 seconds
  checkIn: 60000, // 60 seconds for check-in with image processing
} as const;

// Query Stale Times (when data is considered fresh)
export const QUERY_STALE_TIMES = {
  attendances: 30 * 1000, // 30 seconds - list data changes frequently
  detail: 5 * 60 * 1000, // 5 minutes - individual attendance doesn't change
  metrics: 2 * 60 * 1000, // 2 minutes - metrics update frequently
  stats: 10 * 60 * 1000, // 10 minutes - stats change slowly
} as const;

// Query Cache Times (how long to keep unused data)
export const QUERY_CACHE_TIMES = {
  attendances: 5 * 60 * 1000, // 5 minutes
  detail: 10 * 60 * 1000, // 10 minutes
  metrics: 5 * 60 * 1000, // 5 minutes
  stats: 15 * 60 * 1000, // 15 minutes
} as const;

// Retry Configuration
export const RETRY_CONFIG = {
  retries: 2,
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
} as const;

// Pagination Defaults
export const PAGINATION_DEFAULTS = {
  limit: 100,
  offset: 0,
} as const;

// Search/Filter Debounce
export const SEARCH_DEBOUNCE_MS = 400; // milliseconds

// Date Format Patterns
export const DATE_FORMATS = {
  display: 'dd/MM/yyyy',
  time: 'HH:mm:ss',
  full: 'EEEE, dd \'de\' MMMM \'de\' yyyy',
  time12: 'hh:mm:ss a',
} as const;

// Feature Flags
export const IS_FACE_RECOGNITION_ENABLED = false;

// Notification Messages
export const NOTIFICATION_MESSAGES = {
  checkInSuccess: 'Check-in registrado exitosamente',
  checkInError: 'Error al realizar check-in',
  checkInAlreadyDone: 'Ya has hecho check-in hoy',
  checkInNoFace: 'No se detectó un rostro en la imagen',
  checkInNotRecognized: 'Rostro no reconocido',
  checkInExpired: 'Tu suscripción ha expirado',
  featureDisabled: 'El reconocimiento facial está deshabilitado temporalmente',
} as const;

