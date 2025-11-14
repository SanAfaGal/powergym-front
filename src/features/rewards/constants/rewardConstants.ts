// Reward Configuration Constants

// Query Stale Times
export const QUERY_STALE_TIMES = {
  rewards: 5 * 60 * 1000, // 5 minutes
  eligibility: 2 * 60 * 1000, // 2 minutes (eligibility changes frequently)
} as const;

// Query Cache Times
export const QUERY_CACHE_TIMES = {
  rewards: 15 * 60 * 1000, // 15 minutes
  eligibility: 5 * 60 * 1000, // 5 minutes
} as const;

// Retry Configuration
export const RETRY_CONFIG = {
  retries: 3,
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
} as const;

/**
 * Reward Business Rules
 * 
 * @deprecated Use `useRewardConfig()` hook to get configuration from the backend API.
 * These constants are kept as fallback defaults and for backward compatibility.
 * 
 * Migration: Replace `REWARD_RULES` usage with `useRewardConfig()` hook:
 * ```tsx
 * const { data: config } = useRewardConfig();
 * const threshold = config.attendance_threshold;
 * ```
 */
export const REWARD_RULES = {
  ATTENDANCE_THRESHOLD: 20, // Minimum attendances to qualify
  DISCOUNT_PERCENTAGE: 20, // Default discount percentage
  EXPIRATION_DAYS: 7, // Days until reward expires
  MIN_DISCOUNT: 0.01, // Minimum discount percentage
  MAX_DISCOUNT: 100.0, // Maximum discount percentage
  EXPIRING_SOON_THRESHOLD: 3, // Days before expiration to consider "expiring soon"
} as const;

/**
 * Plan Eligibility
 * 
 * @deprecated Use `useRewardConfig()` hook to get eligible plan units from the backend API.
 * This constant is kept as fallback default and for backward compatibility.
 * 
 * Migration: Replace `ELIGIBLE_PLAN_UNITS` usage with `useRewardConfig()` hook:
 * ```tsx
 * const { data: config } = useRewardConfig();
 * const eligibleUnits = config.eligible_plan_units;
 * ```
 */
export const ELIGIBLE_PLAN_UNITS = ['month'] as const;

// Reward Status Labels
export const REWARD_STATUS_LABELS = {
  pending: 'Pendiente',
  applied: 'Aplicada',
  expired: 'Expirada',
} as const;

// Notification Messages
export const NOTIFICATION_MESSAGES = {
  reward: {
    calculated: 'Recompensa calculada exitosamente',
    applied: 'Recompensa aplicada exitosamente',
    expired: 'La recompensa ha expirado',
  },
  error: {
    calculate: 'Error al calcular la recompensa',
    apply: 'Error al aplicar la recompensa',
    notEligible: 'La suscripción no es elegible para recompensa',
    notMonthly: 'Solo las suscripciones mensuales pueden generar recompensas',
    expired: 'La recompensa ha expirado y no puede ser aplicada',
    alreadyApplied: 'Esta recompensa ya ha sido aplicada',
  },
} as const;

