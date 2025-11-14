/**
 * Client Status Toggle Hook
 * 
 * Custom hook that wraps useToggleClientStatus with proper error handling,
 * toast notifications, logging, and loading states.
 * 
 * @module features/clients/hooks/useClientStatusToggle
 */

import { useCallback } from 'react';
import { useToggleClientStatus } from './useClients';
import { useToast, logger } from '@/shared';
import {
  getActivationSuccessMessage,
  getDeactivationSuccessMessage,
  ACTIVATION_MESSAGES,
  DEACTIVATION_MESSAGES,
} from '../utils/clientStatusActions';
import type { Client } from '../types';

/**
 * Return type for useClientStatusToggle hook
 */
export interface UseClientStatusToggleReturn {
  /** Handler to activate a client */
  handleActivate: (client: Client) => Promise<void>;
  /** Handler to deactivate a client */
  handleDeactivate: (client: Client) => Promise<void>;
  /** Whether an activation/deactivation operation is in progress */
  isToggling: boolean;
}

/**
 * Custom hook for toggling client active status with error handling and notifications
 * 
 * Provides typed handlers for activating and deactivating clients with:
 * - Automatic toast notifications on success/error
 * - Error logging
 * - Loading state management
 * 
 * @returns Object containing activate/deactivate handlers and loading state
 * 
 * @example
 * ```tsx
 * const { handleActivate, handleDeactivate, isToggling } = useClientStatusToggle();
 * 
 * // Activate a client
 * await handleActivate(client);
 * 
 * // Deactivate a client
 * await handleDeactivate(client);
 * ```
 */
export const useClientStatusToggle = (): UseClientStatusToggleReturn => {
  const { showToast } = useToast();
  const toggleStatusMutation = useToggleClientStatus();

  /**
   * Handle client activation
   * 
   * @param client - Client to activate
   * @throws Error if activation fails
   */
  const handleActivate = useCallback(
    async (client: Client): Promise<void> => {
      try {
        logger.info(`Attempting to activate client: ${client.id}`, {
          clientId: client.id,
          clientName: `${client.first_name} ${client.last_name}`,
        });

        await toggleStatusMutation.mutateAsync({
          id: client.id,
          isActive: true,
        });

        const successMessage = getActivationSuccessMessage(client);
        showToast({
          type: 'success',
          title: 'Éxito',
          message: successMessage,
        });

        logger.info(`Client activated successfully: ${client.id}`);
      } catch (error) {
        const errorMessage = error instanceof Error 
          ? error.message 
          : ACTIVATION_MESSAGES.errorMessage;

        logger.error('Error activating client:', {
          clientId: client.id,
          error,
        });

        showToast({
          type: 'error',
          title: 'Error',
          message: errorMessage,
        });

        // Re-throw to allow caller to handle if needed
        throw error;
      }
    },
    [toggleStatusMutation, showToast]
  );

  /**
   * Handle client deactivation
   * 
   * @param client - Client to deactivate
   * @throws Error if deactivation fails
   */
  const handleDeactivate = useCallback(
    async (client: Client): Promise<void> => {
      try {
        logger.info(`Attempting to deactivate client: ${client.id}`, {
          clientId: client.id,
          clientName: `${client.first_name} ${client.last_name}`,
        });

        await toggleStatusMutation.mutateAsync({
          id: client.id,
          isActive: false,
        });

        const successMessage = getDeactivationSuccessMessage(client);
        showToast({
          type: 'success',
          title: 'Éxito',
          message: successMessage,
        });

        logger.info(`Client deactivated successfully: ${client.id}`);
      } catch (error) {
        const errorMessage = error instanceof Error 
          ? error.message 
          : DEACTIVATION_MESSAGES.errorMessage;

        logger.error('Error deactivating client:', {
          clientId: client.id,
          error,
        });

        showToast({
          type: 'error',
          title: 'Error',
          message: errorMessage,
        });

        // Re-throw to allow caller to handle if needed
        throw error;
      }
    },
    [toggleStatusMutation, showToast]
  );

  return {
    handleActivate,
    handleDeactivate,
    isToggling: toggleStatusMutation.isPending,
  };
};


