// External dependencies
import { useState, useMemo, useCallback } from 'react';
import { ArrowLeft, Calendar, CreditCard, Activity } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';

// Internal shared components
import { RefreshButton } from '../components/ui/RefreshButton';
import { Button } from '../components/ui/Button';
import { PageLayout } from '../components/ui/PageLayout';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { useToast, logger } from '../shared';

// Feature components
import { ClientFormModal } from '../features/clients/components/ClientFormModal';
import { BiometricCaptureModal } from '../features/clients/components/BiometricCaptureModal';
import { ClientInfoTab } from '../features/clients/components/ClientInfoTab';
import { SubscriptionsTab } from '../features/clients';
import { AttendanceTab } from '../features/clients';
import { useClient, useClientDashboard, clientHelpers, clientKeys } from '../features/clients';
import { useClientStatusToggle } from '../features/clients/hooks/useClientStatusToggle';
import { getActivationDialogConfig } from '../features/clients/utils/clientStatusActions';
import { useActivePlans } from '../features/plans';
import { Plan, subscriptionKeys } from '../features/subscriptions/api/types';
import { attendanceKeys } from '../features/attendances';

interface ClientDetailProps {
  clientId: string;
  onBack: () => void;
}

/**
 * ClientDetailOptimized - Client detail page component
 * 
 * Displays comprehensive client information with tabs for info, subscriptions, and attendance.
 * Supports editing, biometric management, and client activation/deactivation.
 * 
 * @param props - ClientDetailOptimized component props
 * @returns JSX element
 */
export function ClientDetailOptimized({ clientId, onBack }: ClientDetailProps): JSX.Element {
  // State management
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isBiometricModalOpen, setIsBiometricModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('info');
  const [isActivateModalOpen, setIsActivateModalOpen] = useState<boolean>(false);

  // Hooks
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const { handleActivate, isToggling } = useClientStatusToggle();

  const { data: client, isLoading: clientLoading, isRefetching: isClientRefetching, refetch: refetchClient } = useClient(clientId);
  const { data: dashboard, isLoading: dashboardLoading, isError, isRefetching: isDashboardRefetching, refetch: refetchDashboard } = useClientDashboard(clientId);
  const { data: activePlansData, isLoading: plansLoading } = useActivePlans();

  const isLoading = clientLoading || dashboardLoading;

  // Helper function to get query keys to refresh based on active tab
  const getRefreshQueriesForTab = useCallback((tab: string) => {
    switch (tab) {
      case 'subscriptions':
        // Invalidate all subscription-related queries for this client
        // Using subscriptionKeys.all() invalidates all subscription queries
        // and invalidating ['payments'] and ['paymentStats'] covers payment-related queries
        return [
          subscriptionKeys.all(),
          ['payments'],
          ['paymentStats'],
        ];
      case 'attendance':
        // Invalidate attendance queries for this client
        return [
          attendanceKeys.client(clientId),
        ];
      case 'info':
      default:
        // Default: refresh client and dashboard
        return [
          clientKeys.detail(clientId),
          clientKeys.dashboard(clientId),
        ];
    }
  }, [clientId]);

  // Calculate isRefetching based on active tab queries
  const isRefetching = useMemo(() => {
    const queriesToCheck = getRefreshQueriesForTab(activeTab);
    return queriesToCheck.some(queryKey => 
      queryClient.isFetching({ queryKey })
    ) || isClientRefetching || isDashboardRefetching;
  }, [activeTab, queryClient, getRefreshQueriesForTab, isClientRefetching, isDashboardRefetching]);

  const handleRefresh = useCallback(async () => {
    try {
      const queriesToInvalidate = getRefreshQueriesForTab(activeTab);
      
      // Invalidate all queries for the active tab
      await Promise.all(
        queriesToInvalidate.map(queryKey => 
          queryClient.invalidateQueries({ queryKey })
        )
      );

      // For 'info' tab, also explicitly refetch to maintain current behavior
      if (activeTab === 'info') {
      await Promise.all([
        refetchClient(),
        refetchDashboard(),
      ]);
      }

      const tabMessages: Record<string, { title: string; message: string }> = {
        subscriptions: {
          title: 'Actualizado',
          message: 'Las suscripciones se han actualizado correctamente',
        },
        attendance: {
          title: 'Actualizado',
          message: 'Los datos de asistencia se han actualizado correctamente',
        },
        info: {
          title: 'Actualizado',
          message: 'Los datos del cliente se han actualizado correctamente',
        },
      };

      const message = tabMessages[activeTab] || tabMessages.info;
      showToast({
        type: 'success',
        ...message,
      });
    } catch {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'No se pudo actualizar los datos',
      });
    }
  }, [activeTab, queryClient, getRefreshQueriesForTab, refetchClient, refetchDashboard, showToast]);

  // Convert plans from plans module format to subscriptions module format
  const plans: Plan[] = useMemo(() => {
    if (!activePlansData) return [];
    
    return activePlansData.map(plan => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      price: plan.price,
      duration_days: plan.duration_unit === 'day' ? plan.duration_count :
                    plan.duration_unit === 'week' ? plan.duration_count * 7 :
                    plan.duration_unit === 'month' ? plan.duration_count * 30 :
                    plan.duration_unit === 'year' ? plan.duration_count * 365 : 30,
      is_active: plan.is_active,
      created_at: plan.created_at,
      updated_at: plan.updated_at,
    }));
  }, [activePlansData]);

  // Memoized full name
  const fullName = useMemo(() => {
    if (dashboard) {
      return `${dashboard.client.first_name} ${dashboard.client.last_name}`;
    }
    if (client) {
      return `${client.first_name} ${client.last_name}`;
    }
    return '';
  }, [dashboard, client]);

  // Memoized age
  const age = useMemo(() => {
    return client ? clientHelpers.calculateAge(client.birth_date) : 0;
  }, [client]);

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    showToast({
      type: 'success',
      title: 'Éxito',
      message: 'Cliente actualizado exitosamente'
    });
  };

  const handleBiometricSuccess = (): void => {
    setIsBiometricModalOpen(false);
    showToast({
      type: 'success',
      title: 'Éxito',
      message: 'Biometría actualizada exitosamente'
    });
  };

  /**
   * Handle click to activate client
   */
  const handleActivateClick = useCallback((): void => {
    setIsActivateModalOpen(true);
  }, []);

  /**
   * Handle confirmation to activate client
   */
  const handleActivateConfirm = useCallback(async (): Promise<void> => {
    if (!client) return;

    try {
      await handleActivate(client);
      setIsActivateModalOpen(false);
    } catch (error) {
      // Error handling is done by useClientStatusToggle hook
      logger.error('Error in activate confirmation:', error);
    }
  }, [client, handleActivate]);

  /**
   * Handle closing activate modal
   */
  const handleActivateModalClose = useCallback((): void => {
    if (!isToggling) {
      setIsActivateModalOpen(false);
    }
  }, [isToggling]);

  const handleWhatsApp = () => {
    if (client?.phone) {
      const phoneNumber = client.phone.replace(/\D/g, '');
      window.open(`https://wa.me/${phoneNumber}`, '_blank');
    }
  };

  const handleCall = () => {
    if (client?.phone) {
      window.location.href = `tel:${client.phone}`;
    }
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="xl" text="Cargando información del cliente..." />
        </div>
      </PageLayout>
    );
  }

  if (isError || !client) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cliente no encontrado</h2>
            <p className="text-gray-600 mb-8">No se pudo cargar la información del cliente solicitado.</p>
            <Button onClick={onBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Volver a Clientes
            </Button>
          </motion.div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="space-y-6">
          {/* Back Button */}
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              className="text-gray-600 hover:text-gray-900 -ml-2"
            >
              <span className="hidden sm:inline">Volver a Clientes</span>
              <span className="sm:hidden">Volver</span>
            </Button>
          </div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {fullName}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                {age} años • Cliente desde {new Date(client.created_at).toLocaleDateString('es-CO')}
              </p>
            </div>
            <RefreshButton
              onClick={handleRefresh}
              isRefetching={isRefetching}
              variant="secondary"
            />
          </div>

          <Tabs value={activeTab} onChange={setActiveTab} className="w-full">
            <div className="flex justify-center w-full">
              <TabsList className="inline-flex max-w-full">
                <TabsTrigger 
                  value="info" 
                  activeValue={activeTab} 
                  onChange={setActiveTab}
                >
                  <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Información</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="subscriptions" 
                  activeValue={activeTab} 
                  onChange={setActiveTab}
                >
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Suscripciones</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="attendance" 
                  activeValue={activeTab} 
                  onChange={setActiveTab}
                >
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Asistencias</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="mt-6">
              <TabsContent value="info" activeValue={activeTab} className="w-full">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ClientInfoTab
                    client={client}
                    dashboard={dashboard}
                    onCall={handleCall}
                    onWhatsApp={handleWhatsApp}
                    onEdit={() => setIsEditModalOpen(true)}
                    onBiometric={() => setIsBiometricModalOpen(true)}
                    onActivate={!client.is_active ? handleActivateClick : undefined}
                  />
                </motion.div>
              </TabsContent>

              <TabsContent value="subscriptions" activeValue={activeTab} className="w-full">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {plansLoading ? (
                    <div className="flex flex-col items-center justify-center p-12">
                      <LoadingSpinner size="lg" />
                      <p className="text-gray-600 mt-4">Cargando planes disponibles...</p>
                    </div>
                  ) : (
                    <SubscriptionsTab
                      clientId={clientId}
                      clientName={fullName}
                      plans={plans}
                    />
                  )}
                </motion.div>
              </TabsContent>

              <TabsContent value="attendance" activeValue={activeTab} className="w-full">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <AttendanceTab dashboard={dashboard} />
                </motion.div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </motion.div>

      {/* Modales */}
      <AnimatePresence>
        {isEditModalOpen && client && (
          <ClientFormModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSuccess={handleEditSuccess}
            client={client}
          />
        )}

        {isBiometricModalOpen && client && dashboard && (
          <BiometricCaptureModal
            isOpen={isBiometricModalOpen}
            onClose={() => setIsBiometricModalOpen(false)}
            onSuccess={handleBiometricSuccess}
            clientId={client.id}
            clientName={fullName}
            biometric={dashboard.biometric ? {
              id: dashboard.biometric.id || '',
              type: 'face',
              data: '',
              thumbnail: dashboard.biometric.thumbnail,
              has_face_biometric: true,
              created_at: dashboard.biometric.created_at || new Date().toISOString(),
              updated_at: dashboard.biometric.updated_at || new Date().toISOString(),
            } : undefined}
          />
        )}

        {/* Confirm Activate Modal */}
        {client && !client.is_active && (() => {
          const dialogConfig = getActivationDialogConfig(client);
          return (
            <ConfirmDialog
              isOpen={isActivateModalOpen}
              onClose={handleActivateModalClose}
              onConfirm={handleActivateConfirm}
              title={dialogConfig.title}
              message={dialogConfig.message}
              confirmText={dialogConfig.confirmText}
              cancelText={dialogConfig.cancelText}
              variant={dialogConfig.variant}
              isLoading={isToggling}
            />
          );
        })()}
      </AnimatePresence>
    </PageLayout>
  );
}
