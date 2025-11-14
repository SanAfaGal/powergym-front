import React, { useState, useEffect, useMemo } from 'react';
import { Subscription } from '../api/types';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { Badge } from '../../../components/ui/Badge';
import { formatDate } from '../utils/subscriptionHelpers';
import { canRenewByDaysRemaining } from '../utils/subscriptionFilters';
import { logger } from '../../../shared';
import { AlertTriangle, RefreshCw, Gift, CheckCircle2, XCircle, Info, Target } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { RewardSelector } from '../../../features/rewards/components/RewardSelector';
import { 
  useAvailableRewards, 
  useApplyReward,
  useRewardsBySubscription,
  filterAvailableRewards,
  type Reward,
  type RewardEligibilityResponse,
} from '../../../features/rewards';
import { useRewardConfig, getRewardConfigData } from '../../../features/rewards/hooks/useRewardConfig';
import { CalculateRewardButton } from './CalculateRewardButton';

interface RenewSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (discountPercentage?: number) => Promise<string | undefined>;
  subscription: Subscription | null;
  clientId?: string;
  isLoading?: boolean;
}

/**
 * Reward Calculation Status Component
 * Shows reward calculation status and results with clear messaging
 */
const RewardCalculationStatus: React.FC<{
  subscriptionId: string;
  onCalculationSuccess?: () => void;
}> = ({ subscriptionId, onCalculationSuccess }) => {
  const { data: rewards, isLoading, error, refetch } = useRewardsBySubscription(subscriptionId);
  const [lastCalculationResult, setLastCalculationResult] = useState<RewardEligibilityResponse | null>(null);
  const rewardConfigQuery = useRewardConfig();
  const config = getRewardConfigData(rewardConfigQuery);

  const rewardStatus = useMemo(() => {
    if (isLoading) return { type: 'loading' as const };
    if (error) return { type: 'error' as const };
    
    const availableRewards = rewards ? filterAvailableRewards(rewards) : [];
    const appliedRewards = rewards?.filter(r => r.status === 'applied') || [];
    
    // Check if there's a reward for this subscription
    if (availableRewards.length > 0) {
      const reward = availableRewards[0];
      return {
        type: 'calculated' as const,
        reward,
        message: `¡Recompensa obtenida! ${reward.discount_percentage}% de descuento`,
      };
    }
    
    if (appliedRewards.length > 0) {
      return {
        type: 'applied' as const,
        message: 'La recompensa ya fue aplicada',
      };
    }
    
    // If we have a calculation result showing not eligible, show that
    if (lastCalculationResult && !lastCalculationResult.eligible) {
      return {
        type: 'not-eligible' as const,
        attendanceCount: lastCalculationResult.attendance_count,
      };
    }
    
    return { type: 'not-calculated' as const };
  }, [rewards, isLoading, error, lastCalculationResult]);

  const handleCalculationResult = (result: RewardEligibilityResponse) => {
    setLastCalculationResult(result);
    if (result.eligible) {
      refetch();
      onCalculationSuccess?.();
    }
  };

  if (rewardStatus.type === 'loading') {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500 p-3">
        <LoadingSpinner size="sm" />
        <span>Verificando recompensas...</span>
      </div>
    );
  }

  if (rewardStatus.type === 'error') {
    return (
      <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-red-900">Error al verificar recompensas</p>
          <p className="text-xs text-red-700 mt-1">
            No se pudo cargar la información de recompensas. Por favor, intenta nuevamente.
          </p>
        </div>
      </div>
    );
  }

  if (rewardStatus.type === 'calculated') {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-green-900">{rewardStatus.message}</p>
            <p className="text-xs text-green-700 mt-1">
              Esta recompensa está disponible para aplicar en la renovación
            </p>
          </div>
          {rewardStatus.reward && (
            <Badge variant="success" size="lg">
              {rewardStatus.reward.discount_percentage}%
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span className="text-xs text-amber-700">
            Ya no se puede calcular otra recompensa para esta suscripción
          </span>
        </div>
      </div>
    );
  }

  if (rewardStatus.type === 'applied') {
    return (
      <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          <CheckCircle2 className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-blue-900">{rewardStatus.message}</p>
          <p className="text-xs text-blue-700 mt-1">
            La recompensa fue aplicada en una renovación anterior
          </p>
        </div>
      </div>
    );
  }

  if (rewardStatus.type === 'not-eligible') {
    const { attendanceCount } = rewardStatus;
    const remaining = config.attendance_threshold - attendanceCount;
    const progress = Math.min((attendanceCount / config.attendance_threshold) * 100, 100);

    return (
      <div className="space-y-3">
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Target className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-900 mb-1">
                No es elegible para recompensa
              </p>
              <p className="text-xs text-amber-700">
                El cliente tiene <span className="font-semibold">{attendanceCount}</span> {attendanceCount === 1 ? 'asistencia' : 'asistencias'} en este ciclo.
              </p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-amber-700 mb-1">
              <span>Progreso hacia recompensa</span>
              <span className="font-semibold">{attendanceCount}/{config.attendance_threshold}</span>
            </div>
            <div className="w-full bg-amber-200 rounded-full h-2">
              <div 
                className="bg-amber-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Info Message */}
          <div className="flex items-start gap-2 p-2 bg-white rounded border border-amber-300">
            <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-amber-800">
                {remaining > 0 
                  ? `Se requieren ${config.attendance_threshold} asistencias para obtener un ${config.discount_percentage}% de descuento. Faltan ${remaining} ${remaining === 1 ? 'asistencia' : 'asistencias'}.`
                  : `Se requieren ${config.attendance_threshold} asistencias para obtener un ${config.discount_percentage}% de descuento.`
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not calculated - show calculate button
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
          <Gift className="w-5 h-5 text-gray-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">Recompensa no calculada</p>
          <p className="text-xs text-gray-600 mt-1">
            Calcula si esta suscripción es elegible para obtener una recompensa de {config.discount_percentage}% de descuento
          </p>
        </div>
      </div>
      <CalculateRewardButton
        subscriptionId={subscriptionId}
        onSuccess={() => {
          refetch();
          onCalculationSuccess?.();
        }}
        onCalculationResult={handleCalculationResult}
        variant="primary"
        size="md"
        className="w-full"
      />
    </div>
  );
};

export const RenewSubscriptionModal: React.FC<RenewSubscriptionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  subscription,
  clientId,
  isLoading = false,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [hasCalculatedReward, setHasCalculatedReward] = useState(false);
  
  // Get available rewards if clientId is provided
  const { data: availableRewards, refetch: refetchRewards } = useAvailableRewards(clientId);
  const applyRewardMutation = useApplyReward();

  // Check if reward was already calculated
  const { data: rewardsBySubscription } = useRewardsBySubscription(subscription?.id || '');
  const hasExistingReward = useMemo(() => {
    if (!rewardsBySubscription) return false;
    const available = filterAvailableRewards(rewardsBySubscription);
    return available.length > 0 || rewardsBySubscription.some(r => r.status === 'applied');
  }, [rewardsBySubscription]);

  // Check if subscription can be renewed based on days remaining
  // This must be before any early returns to follow Rules of Hooks
  const renewalCheck = useMemo(() => {
    if (!subscription) {
      return { canRenew: false, daysRemaining: 0, message: undefined };
    }
    if (subscription.status === 'expired') {
      return { canRenew: true, daysRemaining: 0, message: undefined };
    }
    if (subscription.status === 'active') {
      return canRenewByDaysRemaining(subscription);
    }
    return { canRenew: false, daysRemaining: 0, message: undefined };
  }, [subscription]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen && subscription) {
      setHasCalculatedReward(hasExistingReward);
      setSelectedReward(null);
      setError(null);
    }
  }, [isOpen, subscription, hasExistingReward]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setHasCalculatedReward(false);
      setSelectedReward(null);
      setError(null);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    if (!subscription) return;
    
    setError(null);
    setIsSubmitting(true);
    try {
      // Convert discount percentage to number if it's a string
      let discountPercentage: number | undefined;
      if (selectedReward) {
        const discount = typeof selectedReward.discount_percentage === 'string' 
          ? parseFloat(selectedReward.discount_percentage) 
          : selectedReward.discount_percentage;
        discountPercentage = isNaN(discount) ? undefined : discount;
      }
      
      // Call onConfirm which will return the new subscription ID
      const newSubscriptionId = await onConfirm(discountPercentage);
      
      // If reward was selected and we have the new subscription ID, apply the reward
      if (selectedReward && newSubscriptionId && discountPercentage !== undefined) {
        try {
          await applyRewardMutation.mutateAsync({
            rewardId: selectedReward.id,
            data: {
              subscription_id: newSubscriptionId,
              discount_percentage: discountPercentage,
            },
          });
        } catch (rewardError) {
          const errorMessage = rewardError instanceof Error ? rewardError.message : 'Error desconocido';
          logger.error('Error applying reward:', errorMessage);
          // Show a warning but don't fail the renewal
          setError('La suscripción se renovó pero hubo un problema al marcar la recompensa como aplicada');
        }
      }
      
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al renovar la suscripción');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setIsSubmitting(false);
    setSelectedReward(null);
    onClose();
  };

  if (!subscription) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Renovar Suscripción"
      size="md"
    >
      <div className="space-y-5">
        {/* Renewal Restriction Message */}
        {!renewalCheck.canRenew && renewalCheck.message && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-900 mb-1">
                  No se puede renovar aún
                </p>
                <p className="text-sm text-amber-800">
                  {renewalCheck.message}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Subscription Info */}
        <Card className="p-4 bg-gray-50 border border-gray-200">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">ID:</span>
              <span className="font-medium text-gray-900">{subscription.id.slice(0, 8)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Fecha Fin:</span>
              <span className="font-medium text-gray-900">{formatDate(subscription.end_date)}</span>
            </div>
          </div>
        </Card>

        {/* Reward Calculation Status */}
        <RewardCalculationStatus
          subscriptionId={subscription.id}
          onCalculationSuccess={() => {
            setHasCalculatedReward(true);
            refetchRewards();
          }}
        />

        {/* Reward Selector - Only show if there are available rewards */}
        {clientId && availableRewards && availableRewards.length > 0 && hasCalculatedReward && (
          <div className="pt-2">
            <RewardSelector
              clientId={clientId}
              subscriptionId={subscription.id}
              onSelect={setSelectedReward}
              selectedRewardId={selectedReward?.id}
            />
          </div>
        )}

        {/* Warning */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              Esta acción no se puede deshacer. La suscripción se renovará inmediatamente después de la confirmación.
            </p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="p-3 bg-red-50 border-red-200">
            <p className="text-sm text-red-800">{error}</p>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isSubmitting || isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting || isLoading || !renewalCheck.canRenew}
            leftIcon={isSubmitting || isLoading ? <LoadingSpinner size="sm" /> : <RefreshCw className="w-4 h-4" />}
          >
            {isSubmitting || isLoading ? 'Renovando...' : 'Confirmar Renovación'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
