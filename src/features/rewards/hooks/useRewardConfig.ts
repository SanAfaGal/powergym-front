import { useQuery } from '@tanstack/react-query';

import { logger } from '../../../shared';
import { rewardsApi, RewardConfig } from '../api/rewardsApi';
import { REWARD_RULES, ELIGIBLE_PLAN_UNITS } from '../constants/rewardConstants';

/**
 * Query key for reward configuration
 */
export const rewardConfigKey = ['rewards', 'config'] as const;

/**
 * Default reward configuration (fallback values)
 * These match the backend defaults and are used if the API is unavailable
 */
const DEFAULT_REWARD_CONFIG: RewardConfig = {
  attendance_threshold: REWARD_RULES.ATTENDANCE_THRESHOLD,
  discount_percentage: REWARD_RULES.DISCOUNT_PERCENTAGE,
  expiration_days: REWARD_RULES.EXPIRATION_DAYS,
  eligible_plan_units: [...ELIGIBLE_PLAN_UNITS],
};

/**
 * Hook to get reward system configuration from the backend.
 * 
 * This hook fetches the current reward configuration (attendance threshold,
 * discount percentage, expiration days, eligible plan units) from the API.
 * 
 * The configuration is cached for a long time (1 hour) since it rarely changes.
 * If the API call fails, the hook returns default values as a fallback.
 * 
 * @returns Query result with reward configuration and default fallback values
 * 
 * @example
 * ```tsx
 * const { data: config, isLoading } = useRewardConfig();
 * 
 * if (isLoading) return <Loading />;
 * 
 * const threshold = config.attendance_threshold;
 * const discount = config.discount_percentage;
 * ```
 */
export const useRewardConfig = () => {
  return useQuery({
    queryKey: rewardConfigKey,
    queryFn: async () => {
      try {
        logger.debug('Fetching reward configuration from API');
        const config = await rewardsApi.getRewardConfig();
        logger.debug('Reward configuration fetched successfully:', config);
        return config;
      } catch (error) {
        logger.warn(
          'Failed to fetch reward configuration from API, using defaults:',
          error instanceof Error ? error.message : 'Unknown error'
        );
        // Return default values as fallback
        return DEFAULT_REWARD_CONFIG;
      }
    },
    staleTime: 60 * 60 * 1000, // 1 hour - config rarely changes
    gcTime: 2 * 60 * 60 * 1000, // 2 hours - keep in cache longer
    retry: 2, // Retry twice on failure
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    refetchOnWindowFocus: false, // Don't refetch on window focus since config rarely changes
    // Always return data (default values) even if query fails
    placeholderData: DEFAULT_REWARD_CONFIG,
  });
};

/**
 * Get reward configuration with guaranteed data (never undefined).
 * 
 * This is a convenience function that returns the configuration data
 * or default values if the query is still loading or failed.
 * 
 * @param config - Configuration from useRewardConfig hook
 * @returns Reward configuration (never undefined)
 */
export const getRewardConfigData = (config: ReturnType<typeof useRewardConfig>): RewardConfig => {
  return config.data ?? DEFAULT_REWARD_CONFIG;
};

