import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SubscriptionsTable } from '../features/subscriptions/components/SubscriptionsTable';
import { 
  useAllSubscriptions, 
  useExpireSubscriptions, 
  useActivateSubscriptions 
} from '../features/subscriptions';
import { SubscriptionFilters } from '../features/subscriptions/api/types';
import { NOTIFICATION_MESSAGES, DEFAULT_PAGINATION } from '../features/subscriptions/constants/subscriptionConstants';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { RefreshButton } from '../components/ui/RefreshButton';
import { CreditCard, Clock, Play, CheckCircle, RefreshCw, X } from 'lucide-react';
import { useToast, logger } from '../shared';
import { PageLayout } from '../components/ui/PageLayout';

export const SubscriptionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [filters, setFilters] = useState<SubscriptionFilters>({
    limit: DEFAULT_PAGINATION.limit,
    offset: DEFAULT_PAGINATION.offset,
  });
  const [shouldFetch, setShouldFetch] = useState(true); // Cargar automáticamente al entrar a la página
  const [lastActionResult, setLastActionResult] = useState<{
    type: 'expire' | 'activate';
    count: number;
    timestamp: Date;
    isNetworkError?: boolean;
  } | null>(null);

  // Hooks de mutación para expire y activate
  const expireSubscriptionsMutation = useExpireSubscriptions();
  const activateSubscriptionsMutation = useActivateSubscriptions();

  const {
    data: subscriptions = [],
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useAllSubscriptions(filters, shouldFetch);

  const handleFiltersChange = useCallback((newFilters: SubscriptionFilters) => {
    setFilters(newFilters);
    // Habilitar fetch cuando se cambian los filtros
    if (!shouldFetch) {
      setShouldFetch(true);
    }
  }, [shouldFetch]);


  const handleViewClient = useCallback((clientId: string) => {
    // Guardar el clientId en localStorage para que Clients.tsx lo lea
    localStorage.setItem('selected_client_id', clientId);
    navigate(`/dashboard#clients`);
  }, [navigate]);

  const handleRefresh = useCallback(async () => {
    setShouldFetch(true);
    await refetch();
    showToast({
      title: 'Actualizado',
      message: 'Las suscripciones se han actualizado correctamente',
      type: 'success',
    });
  }, [refetch, showToast]);

  const handleExpireSubscriptions = useCallback(async () => {
    try {
      const response = await expireSubscriptionsMutation.mutateAsync();
      
      // Guardar resultado para mostrar banner
      setLastActionResult({
        type: 'expire',
        count: response.expired_count,
        timestamp: new Date(),
      });

      // Mostrar un solo toast con el resultado
      showToast({
        title: response.expired_count > 0 ? '✓ Operación Completada' : 'Sin Cambios',
        message: response.expired_count > 0 
          ? `Se ${response.expired_count === 1 ? 'expiró' : 'expiraron'} ${response.expired_count} suscripción${response.expired_count !== 1 ? 'es' : ''}.`
          : 'No había suscripciones pendientes de expirar.',
        type: response.expired_count > 0 ? 'success' : 'info',
      });

      // Refrescar la lista automáticamente
      await refetch();

      // Cerrar el banner automáticamente después de 8 segundos
      setTimeout(() => {
        setLastActionResult(null);
      }, 8000);
    } catch (error: unknown) {
      // Detectar errores de CORS o red
      const errorObj = error as { 
        response?: { data?: { detail?: string } }; 
        message?: string;
        type?: string;
        status?: number;
      };
      
      const isNetworkError = errorObj.type === 'network' || 
                            errorObj.status === 0 ||
                            errorObj.message?.includes('CORS') ||
                            errorObj.message?.includes('conexión') ||
                            errorObj.message?.includes('fetch');

      let errorMessage = errorObj.response?.data?.detail || 
                        errorObj.message || 
                        NOTIFICATION_MESSAGES.error.generic;

      // Si es un error de red/CORS pero la operación podría haberse completado
      if (isNetworkError) {
        errorMessage = 'Error de conexión con el servidor. La operación puede haberse completado. Por favor, actualiza la lista para verificar.';
        
        // Mostrar banner indicando que puede haberse completado
        setLastActionResult({
          type: 'expire',
          count: 0, // No sabemos el conteo exacto
          timestamp: new Date(),
          isNetworkError: true,
        });

        // Intentar refrescar la lista de todas formas
        try {
          await refetch();
        } catch (refetchError) {
          logger.error('Error refreshing after network error:', refetchError);
        }
      }

      showToast({
        title: isNetworkError ? 'Error de Conexión' : 'Error al Expirar',
        message: errorMessage,
        type: 'error',
      });
      logger.error('Error expiring subscriptions:', error);
    }
  }, [expireSubscriptionsMutation, showToast, refetch]);

  const handleActivateSubscriptions = useCallback(async () => {
    try {
      const response = await activateSubscriptionsMutation.mutateAsync();
      
      // Guardar resultado para mostrar banner
      setLastActionResult({
        type: 'activate',
        count: response.activated_count,
        timestamp: new Date(),
      });

      // Mostrar un solo toast con el resultado
      showToast({
        title: response.activated_count > 0 ? '✓ Operación Completada' : 'Sin Cambios',
        message: response.activated_count > 0
          ? `Se ${response.activated_count === 1 ? 'activó' : 'activaron'} ${response.activated_count} suscripción${response.activated_count !== 1 ? 'es' : ''} programada${response.activated_count !== 1 ? 's' : ''}.`
          : 'No había suscripciones programadas listas para activar.',
        type: response.activated_count > 0 ? 'success' : 'info',
      });

      // Refrescar la lista automáticamente
      await refetch();

      // Cerrar el banner automáticamente después de 8 segundos
      setTimeout(() => {
        setLastActionResult(null);
      }, 8000);
    } catch (error: unknown) {
      // Detectar errores de CORS o red
      const errorObj = error as { 
        response?: { data?: { detail?: string } }; 
        message?: string;
        type?: string;
        status?: number;
      };
      
      const isNetworkError = errorObj.type === 'network' || 
                            errorObj.status === 0 ||
                            errorObj.message?.includes('CORS') ||
                            errorObj.message?.includes('conexión') ||
                            errorObj.message?.includes('fetch');

      let errorMessage = errorObj.response?.data?.detail || 
                        errorObj.message || 
                        NOTIFICATION_MESSAGES.error.generic;

      // Si es un error de red/CORS pero la operación podría haberse completado
      if (isNetworkError) {
        errorMessage = 'Error de conexión con el servidor. La operación puede haberse completado. Por favor, actualiza la lista para verificar.';
        
        // Mostrar banner indicando que puede haberse completado
        setLastActionResult({
          type: 'activate',
          count: 0, // No sabemos el conteo exacto
          timestamp: new Date(),
          isNetworkError: true,
        });

        // Intentar refrescar la lista de todas formas
        try {
          await refetch();
        } catch (refetchError) {
          logger.error('Error refreshing after network error:', refetchError);
        }
      }

      showToast({
        title: isNetworkError ? 'Error de Conexión' : 'Error al Activar',
        message: errorMessage,
        type: 'error',
      });
      logger.error('Error activating subscriptions:', error);
    }
  }, [activateSubscriptionsMutation, showToast, refetch]);


  return (
    <PageLayout
      title="Suscripciones"
      subtitle="Gestiona todas las suscripciones de los clientes"
      actions={
        <RefreshButton
          onClick={handleRefresh}
          isRefetching={isRefetching}
          variant="secondary"
        />
      }
    >
      <div className="space-y-6">
        {/* Banner de resultado de acción reciente */}
        {lastActionResult && (
          <Card className={`p-4 border-2 ${
            lastActionResult.type === 'expire' 
              ? 'bg-orange-50 border-orange-300' 
              : 'bg-green-50 border-green-300'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 ${
                lastActionResult.type === 'expire' ? 'text-orange-600' : 'text-green-600'
              }`}>
                {lastActionResult.type === 'expire' ? (
                  <Clock className="w-5 h-5" />
                ) : (
                  <CheckCircle className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`text-sm font-semibold ${
                    lastActionResult.type === 'expire' ? 'text-orange-900' : 'text-green-900'
                  }`}>
                    {lastActionResult.type === 'expire' ? 'Suscripciones Expiradas' : 'Suscripciones Activadas'}
                  </h3>
                  {isRefetching && (
                    <RefreshCw className="w-3 h-3 text-gray-500 animate-spin" />
                  )}
                </div>
                <p className={`text-sm ${
                  lastActionResult.type === 'expire' ? 'text-orange-800' : 'text-green-800'
                }`}>
                  {lastActionResult.count > 0 ? (
                    <>
                      <span className="font-semibold">{lastActionResult.count}</span> suscripción{lastActionResult.count !== 1 ? 'es' : ''} {lastActionResult.type === 'expire' ? 'expirada' : 'activada'}{lastActionResult.count !== 1 ? 's' : ''} exitosamente.
                      {isRefetching ? (
                        <span className="block mt-1 text-xs">Actualizando lista...</span>
                      ) : (
                        <span className="block mt-1 text-xs">La lista ha sido actualizada con los cambios.</span>
                      )}
                    </>
                  ) : lastActionResult.count === 0 && lastActionResult.isNetworkError ? (
                    <>
                      La operación se ejecutó pero hubo un error de conexión al obtener el resultado exacto.
                      <span className="block mt-1 text-xs font-medium">Por favor, revisa la lista para verificar los cambios.</span>
                      {isRefetching && (
                        <span className="block mt-1 text-xs">Actualizando lista...</span>
                      )}
                    </>
                  ) : (
                    <>
                      No había suscripciones pendientes de {lastActionResult.type === 'expire' ? 'expirar' : 'activar'}.
                      {isRefetching && (
                        <span className="block mt-1 text-xs">Actualizando lista...</span>
                      )}
                    </>
                  )}
                </p>
              </div>
              <button
                onClick={() => setLastActionResult(null)}
                className={`flex-shrink-0 p-1 rounded transition-colors ${
                  lastActionResult.type === 'expire' 
                    ? 'text-orange-600 hover:bg-orange-200' 
                    : 'text-green-600 hover:bg-green-200'
                }`}
                aria-label="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </Card>
        )}

        {/* Sección de acciones administrativas */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-900 mb-1">
                Acciones Administrativas
              </h3>
              <p className="text-xs text-blue-700">
                Ejecuta manualmente las tareas programadas en caso de fallo del sistema automático
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 flex-shrink-0">
              <Button
                variant="outline"
                onClick={handleExpireSubscriptions}
                disabled={expireSubscriptionsMutation.isPending}
                leftIcon={<Clock className="w-4 h-4" />}
                className="whitespace-nowrap border-blue-300 text-blue-700 hover:bg-blue-100"
                size="sm"
              >
                {expireSubscriptionsMutation.isPending ? 'Expirando...' : 'Expirar Suscripciones'}
              </Button>
              <Button
                variant="outline"
                onClick={handleActivateSubscriptions}
                disabled={activateSubscriptionsMutation.isPending}
                leftIcon={<Play className="w-4 h-4" />}
                className="whitespace-nowrap border-blue-300 text-blue-700 hover:bg-blue-100"
                size="sm"
              >
                {activateSubscriptionsMutation.isPending ? 'Activando...' : 'Activar Suscripciones'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Error State */}
        {error && (
          <Card className="p-4 bg-red-50 border-red-200">
            <div className="flex items-center gap-3">
              <div className="text-red-600">
                <CreditCard className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-900">
                  Error al cargar suscripciones
                </p>
                <p className="text-xs text-red-700 mt-1">
                  {error instanceof Error ? error.message : 'No se pudieron cargar las suscripciones'}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                Reintentar
              </Button>
            </div>
          </Card>
        )}

        {/* Subscriptions Table */}
        <SubscriptionsTable
          subscriptions={subscriptions}
          isLoading={isLoading}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onViewClient={handleViewClient}
        />
      </div>
    </PageLayout>
  );
};

