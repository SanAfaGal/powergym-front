/**
 * Client Status Action Utilities
 * 
 * Centralized utilities for client activation/deactivation actions.
 * Provides type-safe handlers, confirmation dialog configurations, and constants.
 * 
 * @module features/clients/utils/clientStatusActions
 */

import type { Client } from '../types';

/**
 * Configuration for client status confirmation dialogs
 */
export interface ClientStatusDialogConfig {
  /** Dialog title */
  title: string;
  /** Dialog message */
  message: string;
  /** Confirm button text */
  confirmText: string;
  /** Cancel button text */
  cancelText: string;
  /** Dialog variant (danger, warning, info, success) */
  variant: 'danger' | 'warning' | 'info' | 'success';
}

/**
 * Constants for activation messages (Spanish for UI)
 */
export const ACTIVATION_MESSAGES = {
  title: 'Activar Cliente',
  message: (clientName: string): string => 
    `¿Estás seguro de que deseas activar al cliente ${clientName}?`,
  confirmText: 'Activar',
  cancelText: 'Cancelar',
  successMessage: (clientName: string): string => 
    `${clientName} ha sido activado correctamente`,
  errorMessage: 'Error al activar cliente',
} as const;

/**
 * Constants for deactivation messages (Spanish for UI)
 */
export const DEACTIVATION_MESSAGES = {
  title: 'Inactivar Cliente',
  message: (clientName: string): string => 
    `¿Está seguro de que desea inactivar al cliente ${clientName}?`,
  confirmText: 'Inactivar Cliente',
  cancelText: 'Cancelar',
  successMessage: (clientName: string): string => 
    `${clientName} ha sido inactivado correctamente`,
  errorMessage: 'Error al inactivar cliente',
} as const;

/**
 * Get confirmation dialog configuration for activating a client
 * 
 * @param client - Client to activate
 * @returns Dialog configuration object
 */
export const getActivationDialogConfig = (client: Client): ClientStatusDialogConfig => {
  const clientName = `${client.first_name} ${client.last_name}`.trim();
  
  return {
    title: ACTIVATION_MESSAGES.title,
    message: ACTIVATION_MESSAGES.message(clientName),
    confirmText: ACTIVATION_MESSAGES.confirmText,
    cancelText: ACTIVATION_MESSAGES.cancelText,
    variant: 'success',
  };
};

/**
 * Get confirmation dialog configuration for deactivating a client
 * 
 * @param client - Client to deactivate
 * @returns Dialog configuration object
 */
export const getDeactivationDialogConfig = (client: Client): ClientStatusDialogConfig => {
  const clientName = `${client.first_name} ${client.last_name}`.trim();
  
  return {
    title: DEACTIVATION_MESSAGES.title,
    message: DEACTIVATION_MESSAGES.message(clientName),
    confirmText: DEACTIVATION_MESSAGES.confirmText,
    cancelText: DEACTIVATION_MESSAGES.cancelText,
    variant: 'danger',
  };
};

/**
 * Get success message for client activation
 * 
 * @param client - Client that was activated
 * @returns Success message string
 */
export const getActivationSuccessMessage = (client: Client): string => {
  const clientName = `${client.first_name} ${client.last_name}`.trim();
  return ACTIVATION_MESSAGES.successMessage(clientName);
};

/**
 * Get success message for client deactivation
 * 
 * @param client - Client that was deactivated
 * @returns Success message string
 */
export const getDeactivationSuccessMessage = (client: Client): string => {
  const clientName = `${client.first_name} ${client.last_name}`.trim();
  return DEACTIVATION_MESSAGES.successMessage(clientName);
};

