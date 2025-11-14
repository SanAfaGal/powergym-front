import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

import { RewardConfig } from '../api/rewardsApi';
import { ELIGIBLE_PLAN_UNITS, REWARD_RULES } from '../constants/rewardConstants';
import { Reward, RewardStatus } from '../types';

interface SubscriptionInfo {
  start_date: string;
  end_date: string;
  plan?: {
    duration_unit?: string;
  };
}

/**
 * Verifies if a reward is expired
 */
export function isRewardExpired(reward: Reward): boolean {
  if (!reward.expires_at) return false;
  return new Date(reward.expires_at) < new Date();
}

/**
 * Verifies if a reward is available (pending and not expired)
 */
export function isRewardAvailable(reward: Reward): boolean {
  return reward.status === RewardStatus.PENDING && !isRewardExpired(reward);
}

/**
 * Converts discount percentage to number (handles both string and number)
 */
function toNumber(value: number | string): number {
  if (typeof value === 'number') {
    return isNaN(value) ? 0 : value;
  }
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

/**
 * Formats the discount percentage for display
 */
export function formatDiscount(percentage: number | string): string {
  const num = toNumber(percentage);
  return `${num.toFixed(0)}%`;
}

/**
 * Calculates the price with discount applied
 */
export function calculateDiscountedPrice(originalPrice: number, discountPercentage: number | string): number {
  const discount = toNumber(discountPercentage);
  return originalPrice * (1 - discount / 100);
}

/**
 * Calculates the amount saved with discount
 */
export function calculateDiscountAmount(originalPrice: number, discountPercentage: number | string): number {
  const discount = toNumber(discountPercentage);
  return originalPrice - calculateDiscountedPrice(originalPrice, discount);
}

/**
 * Formats the expiration date
 */
export function formatExpirationDate(expiresAt: string): string {
  try {
    const date = parseISO(expiresAt);
    return format(date, 'dd \'de\' MMMM, yyyy', { locale: es });
  } catch {
    return expiresAt;
  }
}

/**
 * Gets days until expiration
 * Returns negative number if already expired
 */
export function getDaysUntilExpiration(expiresAt: string): number {
  const now = new Date();
  const expiration = new Date(expiresAt);
  const diffTime = expiration.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Formats days until expiration for display
 */
export function formatDaysUntilExpiration(expiresAt: string): string {
  const days = getDaysUntilExpiration(expiresAt);
  
  if (days < 0) {
    return 'Expirada';
  }
  
  if (days === 0) {
    return 'Expira hoy';
  }
  
  if (days === 1) {
    return 'Expira mañana';
  }
  
  return `Expira en ${days} días`;
}

/**
 * Formats the eligible date
 */
export function formatEligibleDate(eligibleDate: string): string {
  try {
    const date = parseISO(eligibleDate);
    return format(date, 'dd \'de\' MMMM, yyyy', { locale: es });
  } catch {
    return eligibleDate;
  }
}

/**
 * Formats the applied date
 */
export function formatAppliedDate(appliedAt: string): string {
  try {
    const date = parseISO(appliedAt);
    return format(date, 'dd \'de\' MMMM, yyyy \'a las\' HH:mm', { locale: es });
  } catch {
    return appliedAt;
  }
}

/**
 * Validates discount percentage
 */
export function isValidDiscountPercentage(percentage: number | string): boolean {
  const num = toNumber(percentage);
  return (
    num >= REWARD_RULES.MIN_DISCOUNT &&
    num <= REWARD_RULES.MAX_DISCOUNT
  );
}

/**
 * Gets reward status display info
 */
export function getRewardStatusInfo(status: RewardStatus) {
  const statusConfig = {
    [RewardStatus.PENDING]: {
      label: 'Pendiente',
      color: 'info',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-800',
    },
    [RewardStatus.APPLIED]: {
      label: 'Aplicada',
      color: 'success',
      bgColor: 'bg-green-50',
      textColor: 'text-green-800',
    },
    [RewardStatus.EXPIRED]: {
      label: 'Expirada',
      color: 'default',
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-800',
    },
  };

  return statusConfig[status] || statusConfig[RewardStatus.PENDING];
}

/**
 * Filters available rewards from a list
 */
export function filterAvailableRewards(rewards: Reward[]): Reward[] {
  return rewards.filter(isRewardAvailable);
}

/**
 * Checks if a plan is eligible for rewards.
 * 
 * @param planDurationUnit - Plan duration unit to check (e.g., 'month', 'week')
 * @param config - Optional reward configuration. If not provided, uses default constants.
 * @returns True if the plan unit is eligible for rewards
 */
export function isPlanEligibleForRewards(
  planDurationUnit: string,
  config?: Pick<RewardConfig, 'eligible_plan_units'>
): boolean {
  const eligibleUnits = config?.eligible_plan_units ?? ELIGIBLE_PLAN_UNITS;
  return (eligibleUnits as readonly string[]).includes(planDurationUnit);
}

/**
 * Checks if subscription cycle has ended (can calculate reward)
 */
export function canCalculateReward(subscriptionEndDate: string): boolean {
  const endDate = parseISO(subscriptionEndDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);
  return endDate <= today;
}

/**
 * Obtiene el precio efectivo de una suscripción.
 * 
 * Si la suscripción tiene final_price (descuento aplicado), usa ese valor.
 * De lo contrario, usa el precio del plan.
 * 
 * @param subscription - Suscripción con final_price opcional
 * @param planPrice - Precio del plan (fallback)
 * @returns Precio efectivo a pagar
 */
export function getSubscriptionPrice(
  subscription?: { final_price?: number | null },
  planPrice?: number | string
): number {
  if (subscription?.final_price != null) {
    return subscription.final_price;
  }
  
  // Convert planPrice to number if it's a string
  if (typeof planPrice === 'string') {
    const parsed = parseFloat(planPrice);
    return isNaN(parsed) ? 0 : parsed;
  }
  
  return planPrice ?? 0;
}

/**
 * Checks if a reward can be calculated for renewal (subscription active but has enough attendances)
 * This allows calculating rewards even if the subscription hasn't ended yet
 * 
 * @param subscription - Subscription information
 * @param attendanceCount - Number of attendances in the current cycle
 * @param config - Optional reward configuration. If not provided, uses default constants.
 * @returns True if can calculate reward for renewal
 */
export function canCalculateRewardForRenewal(
  subscription: SubscriptionInfo | null | undefined,
  attendanceCount: number,
  config?: Pick<RewardConfig, 'attendance_threshold' | 'eligible_plan_units'>
): boolean {
  if (!subscription) return false;
  
  const threshold = config?.attendance_threshold ?? REWARD_RULES.ATTENDANCE_THRESHOLD;
  
  // Check if plan is eligible for rewards
  const isEligiblePlan = subscription.plan?.duration_unit 
    ? isPlanEligibleForRewards(subscription.plan.duration_unit, config)
    : false;
  
  // Can calculate if:
  // 1. Plan is eligible for rewards
  // 2. Has enough attendances in current cycle (meets threshold)
  // 3. Subscription is active (not necessarily ended)
  return isEligiblePlan && attendanceCount >= threshold;
}

/**
 * Checks if a reward is expiring soon (within threshold days)
 * 
 * @param reward - Reward to check
 * @param thresholdDays - Days threshold (default from constants)
 * @returns True if reward expires within threshold
 */
export function isRewardExpiringSoon(
  reward: Reward,
  thresholdDays: number = REWARD_RULES.EXPIRING_SOON_THRESHOLD
): boolean {
  if (!reward.expires_at || isRewardExpired(reward)) {
    return false;
  }
  
  const daysLeft = getDaysUntilExpiration(reward.expires_at);
  return daysLeft > 0 && daysLeft <= thresholdDays;
}

/**
 * Filters rewards that are expiring soon from a list
 * 
 * @param rewards - List of rewards to filter
 * @param thresholdDays - Days threshold (default from constants)
 * @returns Array of rewards expiring soon
 */
export function getRewardsExpiringSoon(
  rewards: Reward[],
  thresholdDays: number = REWARD_RULES.EXPIRING_SOON_THRESHOLD
): Reward[] {
  return rewards.filter(reward => isRewardExpiringSoon(reward, thresholdDays));
}

/**
 * Sorts rewards by priority: expiring soon first, then by expiration date
 * 
 * @param rewards - List of rewards to sort
 * @returns Sorted array of rewards
 */
export function sortRewardsByPriority(rewards: Reward[]): Reward[] {
  return [...rewards].sort((a, b) => {
    const aExpiringSoon = isRewardExpiringSoon(a);
    const bExpiringSoon = isRewardExpiringSoon(b);
    
    // Expiring soon rewards first
    if (aExpiringSoon && !bExpiringSoon) return -1;
    if (!aExpiringSoon && bExpiringSoon) return 1;
    
    // Then sort by expiration date (earlier first)
    if (a.expires_at && b.expires_at) {
      return new Date(a.expires_at).getTime() - new Date(b.expires_at).getTime();
    }
    
    return 0;
  });
}

/**
 * Calculates the number of attendances within a subscription cycle
 * 
 * @param attendances - Array of attendance records
 * @param startDate - Subscription start date (ISO string)
 * @param endDate - Subscription end date (ISO string)
 * @returns Number of attendances in the cycle
 */
export function calculateCycleAttendances(
  attendances: Array<{ check_in: string }>,
  startDate: string,
  endDate: string
): number {
  if (!attendances || attendances.length === 0) return 0;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return attendances.filter((att) => {
    const checkIn = new Date(att.check_in);
    return checkIn >= start && checkIn <= end;
  }).length;
}

/**
 * Validates reward application input data
 * 
 * @param rewardId - Reward ID to validate
 * @param data - Reward apply input data
 * @throws Error if validation fails
 */
export function validateRewardApplyInput(
  rewardId: string,
  data: { subscription_id?: string; discount_percentage?: number }
): void {
  if (!rewardId || typeof rewardId !== 'string' || rewardId.trim() === '') {
    throw new Error('ID de recompensa es requerido');
  }

  if (!data || typeof data !== 'object') {
    throw new Error('Datos de recompensa son requeridos');
  }

  if (!data.subscription_id || typeof data.subscription_id !== 'string' || data.subscription_id.trim() === '') {
    throw new Error('ID de suscripción es requerido');
  }

  if (typeof data.discount_percentage !== 'number' || isNaN(data.discount_percentage)) {
    throw new Error('Porcentaje de descuento debe ser un número válido');
  }

  if (data.discount_percentage < 0 || data.discount_percentage > 100) {
    throw new Error('Porcentaje de descuento debe estar entre 0 y 100');
  }
}

