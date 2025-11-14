import { useMemo } from 'react';
import { Gift } from 'lucide-react';
import { motion } from 'framer-motion';

import { Badge } from '../../../../../components/ui/Badge';
import { Card } from '../../../../../components/ui/Card';
import { calculateCycleAttendances, isPlanEligibleForRewards } from '../../../../rewards';
import { useRewardConfig, getRewardConfigData } from '../../../../rewards/hooks/useRewardConfig';

interface RewardProgressProps {
  activeSubscription: {
    id: string;
    start_date: string;
    end_date: string;
    plan_id: string;
  } | null | undefined;
  subscriptionPlan: {
    duration_unit: string;
  } | null | undefined;
  attendances: Array<{ check_in: string }>;
}

/**
 * Reward Progress Component (Read-only)
 * Displays progress toward reward eligibility for the current subscription cycle
 */
export const RewardProgress = ({ 
  activeSubscription, 
  subscriptionPlan, 
  attendances 
}: RewardProgressProps) => {
  const rewardConfigQuery = useRewardConfig();
  const config = getRewardConfigData(rewardConfigQuery);

  const progress = useMemo(() => {
    if (!activeSubscription || !subscriptionPlan || !attendances || attendances.length === 0) {
      return null;
    }

    const isEligible = isPlanEligibleForRewards(subscriptionPlan.duration_unit, config);
    if (!isEligible) {
      return null; // Don't show progress for non-eligible plans
    }

    const cycleAttendances = calculateCycleAttendances(
      attendances,
      activeSubscription.start_date,
      activeSubscription.end_date
    );

    const threshold = config.attendance_threshold;
    const progressPercentage = Math.min((cycleAttendances / threshold) * 100, 100);
    const remaining = Math.max(0, threshold - cycleAttendances);
    const isComplete = cycleAttendances >= threshold;

    return {
      cycleAttendances,
      threshold,
      progressPercentage,
      remaining,
      isComplete,
      discountPercentage: config.discount_percentage,
    };
  }, [activeSubscription, subscriptionPlan, attendances, config]);

  if (!progress) return null;

  return (
    <Card className="p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200">
      <div className="flex items-center gap-2 sm:gap-3 mb-3">
        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
          <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">Progreso hacia Recompensa</p>
          <p className="text-xs text-gray-600 truncate">
            {progress.discountPercentage}% de descuento con {progress.threshold}+ asistencias
          </p>
        </div>
        <Badge 
          variant={progress.isComplete ? 'success' : 'info'} 
          size="lg"
          className="flex-shrink-0"
        >
          {progress.cycleAttendances}/{progress.threshold}
        </Badge>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
        <motion.div
          className={`h-2.5 rounded-full ${
            progress.isComplete ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-purple-500 to-pink-500'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${progress.progressPercentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      <div className="flex items-center justify-between text-xs gap-2">
        <span className="text-gray-600 truncate">
          {progress.isComplete 
            ? '¡Has alcanzado el objetivo!' 
            : `Faltan ${progress.remaining} asistencias`
          }
        </span>
        <span className="text-gray-500 font-medium flex-shrink-0">
          {Math.round(progress.progressPercentage)}%
        </span>
      </div>
    </Card>
  );
};

