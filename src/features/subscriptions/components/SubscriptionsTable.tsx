import React, { memo, useMemo, useCallback, useState } from 'react';
import { Subscription, SubscriptionStatus, SubscriptionFilters } from '../api/types';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { SubscriptionStatusBadge } from './SubscriptionList';
import { formatDate, getDaysRemaining } from '../utils/subscriptionHelpers';
import { useMediaQuery } from '../../../shared';
import { useClientsMap } from '../../../features/clients/hooks/useClients';
import { useActivePlans } from '../../../features/plans';
import { clientHelpers } from '../../../features/clients/utils/clientHelpers';
import { Client } from '../../../features/clients/types';
import { Plan } from '../../../features/plans/api/types';
import { Search, X, User, Calendar, Package, ArrowUp, ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { Pagination } from '../../../components/ui/Pagination';

interface SubscriptionsTableProps {
  subscriptions: Subscription[];
  isLoading?: boolean;
  filters: SubscriptionFilters;
  onFiltersChange: (filters: SubscriptionFilters) => void;
  onViewClient?: (clientId: string) => void;
  className?: string;
}

/**
 * Componente compartido para mostrar información de plan y días restantes
 */
const SubscriptionPlanInfo: React.FC<{
  subscription: Subscription;
  plansMap: Map<string, Plan>;
}> = ({ subscription, plansMap }) => {
  const plan = plansMap.get(subscription.plan_id);
  const daysRemaining = getDaysRemaining(subscription);
  const planName = plan?.name || subscription.plan_id.slice(0, 8);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 text-sm">
        <Package className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
        <span className="text-gray-600">Plan:</span>
        <span className="font-medium text-gray-900 truncate">{planName}</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
        <span className="text-gray-600">
          {daysRemaining > 0
            ? `${daysRemaining} día${daysRemaining !== 1 ? 's' : ''} restante${daysRemaining !== 1 ? 's' : ''}`
            : 'Expirada'
          }
        </span>
      </div>
    </div>
  );
};

/**
 * Sortable Column Header
 */
const SortableHeader: React.FC<{
  label: string;
  field: string;
  currentSort?: string;
  currentOrder?: 'asc' | 'desc';
  onSort: (field: string) => void;
  className?: string;
}> = ({ label, field, currentSort, currentOrder, onSort, className = '' }) => {
  const isSorted = currentSort === field;

  return (
    <th
      className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50 transition-colors group ${className}`}
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        {label}
        <div className={`flex flex-col ${isSorted ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}>
          {isSorted && currentOrder === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
        </div>
      </div>
    </th>
  );
};

/**
 * Visual Time Status (Progress Bar)
 */
const TimeStatus: React.FC<{
  subscription: Subscription;
}> = ({ subscription }) => {
  const daysRemaining = getDaysRemaining(subscription);
  const totalDuration = new Date(subscription.end_date).getTime() - new Date(subscription.start_date).getTime();
  const elapsed = new Date().getTime() - new Date(subscription.start_date).getTime();

  let percentage = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
  if (totalDuration <= 0) percentage = 100;

  // Color logic
  let colorClass = 'bg-green-500';
  let textClass = 'text-green-700';
  let bgClass = 'bg-green-50';

  if (daysRemaining <= 0) {
    colorClass = 'bg-gray-400';
    textClass = 'text-gray-500';
    bgClass = 'bg-gray-100';
    percentage = 100;
  } else if (daysRemaining <= 3) {
    colorClass = 'bg-red-500';
    textClass = 'text-red-700';
    bgClass = 'bg-red-50';
  } else if (daysRemaining <= 7) {
    colorClass = 'bg-amber-500';
    textClass = 'text-amber-700';
    bgClass = 'bg-amber-50';
  }

  return (
    <div className="w-full">
      <div className={`flex items-center gap-2 text-xs font-medium ${textClass} mb-1.5`}>
        <Calendar size={12} />
        <span>
          {daysRemaining > 0
            ? `Quedan ${daysRemaining} días`
            : 'Expirada'}
        </span>
      </div>
      <div className={`h-1.5 w-full rounded-full overflow-hidden ${bgClass}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

/**
 * Subscription Row Component (Desktop)
 */
const SubscriptionRow: React.FC<{
  subscription: Subscription;
  onViewClient: (clientId: string) => void;
  index: number;
  clientsMap: Map<string, Client>;
  plansMap: Map<string, Plan>;
}> = ({ subscription, onViewClient, index, clientsMap, plansMap }) => {
  const client = clientsMap.get(subscription.client_id);
  const clientName = client
    ? clientHelpers.formatFullName(client)
    : subscription.client_id.slice(0, 8);
  const plan = plansMap.get(subscription.plan_id);
  const planName = plan?.name || subscription.plan_id.slice(0, 8);

  return (
    <motion.tr
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, delay: index * 0.03 }}
      className="hover:bg-gray-50 border-b border-gray-100 last:border-0"
    >
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="font-medium text-gray-900">{clientName}</div>
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{planName}</div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <SubscriptionStatusBadge status={subscription.status} />
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDate(subscription.start_date)}
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDate(subscription.end_date)}
      </td>
      <td className="px-4 py-4 whitespace-nowrap w-48">
        <TimeStatus subscription={subscription} />
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          onClick={() => onViewClient(subscription.client_id)}
          className="text-primary-600 hover:text-primary-900"
        >
          Ver Cliente
        </button>
      </td>
    </motion.tr>
  );
};

/**
 * Subscription Card Component (Mobile)
 */
const SubscriptionCard: React.FC<{
  subscription: Subscription;
  onViewClient: (clientId: string) => void;
  index: number;
  clientsMap: Map<string, Client>;
  plansMap: Map<string, Plan>;
}> = ({ subscription, onViewClient, index, clientsMap, plansMap }) => {
  const client = clientsMap.get(subscription.client_id);
  const clientName = client
    ? clientHelpers.formatFullName(client)
    : subscription.client_id.slice(0, 8);

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, delay: index * 0.03 }}
      className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all"
    >
      {/* Header with Status Badge */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <button
              onClick={() => onViewClient(subscription.client_id)}
              className="text-sm font-semibold text-gray-900 hover:text-primary-600 transition-colors truncate"
            >
              {clientName}
            </button>
          </div>
          <div className="text-xs text-gray-500">
            ID: {subscription.id.slice(0, 8)}
          </div>
        </div>
        <SubscriptionStatusBadge status={subscription.status} />
      </div>

      {/* Date Information */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-xs text-gray-500">Inicio: </span>
          <span className="text-sm font-medium text-gray-900">{formatDate(subscription.start_date)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-xs text-gray-500">Fin: </span>
          <span className="text-sm font-medium text-gray-900">{formatDate(subscription.end_date)}</span>
        </div>
      </div>

      {/* Plan and Days Remaining */}
      <div className="pt-3 border-t border-gray-100 space-y-3">
        <SubscriptionPlanInfo subscription={subscription} plansMap={plansMap} />
        <TimeStatus subscription={subscription} />
      </div>
    </motion.div>
  );
};

export const SubscriptionsTable: React.FC<SubscriptionsTableProps> = memo(({
  subscriptions,
  isLoading = false,
  filters,
  onFiltersChange,
  onViewClient,
  className = '',
}) => {
  const { isMobile } = useMediaQuery();
  const [searchQuery, setSearchQuery] = useState('');

  // Extract unique client IDs from subscriptions
  const clientIds = useMemo(() => {
    return subscriptions.map(sub => sub.client_id);
  }, [subscriptions]);

  // Get clients map using the hook
  const { clientsMap } = useClientsMap(clientIds);

  // Get plans only when there are subscriptions (lazy load)
  const { data: plans = [] } = useActivePlans();

  // Create plans map for quick lookup
  const plansMap = useMemo(() => {
    const map = new Map<string, Plan>();
    plans.forEach(plan => {
      map.set(plan.id, plan);
    });
    return map;
  }, [plans]);

  // Calculate pagination info
  const limit = filters.limit || 20;
  const currentPage = useMemo(() => {
    return Math.floor((filters.offset || 0) / limit) + 1;
  }, [filters.offset, limit]);

  // Detect if we're on the last page (heuristic: if results < limit)
  // This means there are no more pages after this one
  const isLastPage = subscriptions.length < limit;
  const totalPages = isLastPage ? currentPage : undefined;

  // Filter subscriptions by search query (only in current page results)
  const filteredSubscriptions = useMemo(() => {
    if (!searchQuery.trim()) {
      return subscriptions;
    }

    const query = searchQuery.toLowerCase();
    return subscriptions.filter(sub => {
      const matchesId = sub.id.toLowerCase().includes(query) ||
        sub.client_id.toLowerCase().includes(query);

      // Also search by client name if available
      const client = clientsMap.get(sub.client_id);
      const matchesName = client
        ? clientHelpers.formatFullName(client).toLowerCase().includes(query)
        : false;

      return matchesId || matchesName;
    });
  }, [subscriptions, searchQuery, clientsMap]);

  const handleStatusFilter = useCallback((status: SubscriptionStatus | 'all') => {
    onFiltersChange({
      ...filters,
      status: status === 'all' ? undefined : status,
      offset: 0, // Reset pagination when filtering
    });
    setSearchQuery(''); // Clear search when changing status filter
  }, [filters, onFiltersChange]);

  const clearFilters = useCallback(() => {
    onFiltersChange({
      limit: filters.limit,
      offset: 0,
    });
    setSearchQuery('');
  }, [filters.limit, onFiltersChange]);

  const hasActiveFilters = useMemo(() => {
    return !!filters.status || !!searchQuery.trim();
  }, [filters.status, searchQuery]);

  const handlePageChange = useCallback((page: number) => {
    const limit = filters.limit || 20;
    const newOffset = (page - 1) * limit;
    onFiltersChange({
      ...filters,
      offset: newOffset,
    });
  }, [filters, onFiltersChange]);

  if (isLoading) {
    return (
      <Card className={`p-8 ${className}`}>
        <div className="flex flex-col items-center justify-center py-8">
          <LoadingSpinner size="md" />
          <p className="text-sm text-gray-500 mt-3">Cargando suscripciones...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Filters Section */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, ID de cliente o suscripción..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant={filters.status === undefined ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleStatusFilter('all')}
            >
              Todas
            </Button>
            <Button
              variant={filters.status === SubscriptionStatus.ACTIVE ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleStatusFilter(SubscriptionStatus.ACTIVE)}
            >
              Activas
            </Button>
            <Button
              variant={filters.status === SubscriptionStatus.PENDING_PAYMENT ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleStatusFilter(SubscriptionStatus.PENDING_PAYMENT)}
            >
              Pendientes
            </Button>
            <Button
              variant={filters.status === SubscriptionStatus.SCHEDULED ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleStatusFilter(SubscriptionStatus.SCHEDULED)}
            >
              Programadas
            </Button>
            <Button
              variant={filters.status === SubscriptionStatus.EXPIRED ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleStatusFilter(SubscriptionStatus.EXPIRED)}
            >
              Expiradas
            </Button>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                leftIcon={<X className="w-4 h-4" />}
              >
                Limpiar
              </Button>
            )}
          </div>
        </div>

        {/* Date Filters */}
        <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-gray-100">
          <Button
            variant={filters.end_date_to && filters.end_date_from ? 'primary' : 'outline'}
            size="sm"
            onClick={() => {
              const today = new Date();
              const nextWeek = new Date();
              nextWeek.setDate(today.getDate() + 7);

              onFiltersChange({
                ...filters,
                end_date_from: today.toISOString().split('T')[0],
                end_date_to: nextWeek.toISOString().split('T')[0],
                offset: 0
              });
            }}
          >
            Vencen esta semana
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Vencimiento:</span>
            <input
              type="date"
              className="text-sm border rounded px-2 py-1"
              value={filters.end_date_from || ''}
              onChange={(e) => onFiltersChange({ ...filters, end_date_from: e.target.value, offset: 0 })}
            />
            <span className="text-xs text-gray-400">a</span>
            <input
              type="date"
              className="text-sm border rounded px-2 py-1"
              value={filters.end_date_to || ''}
              onChange={(e) => onFiltersChange({ ...filters, end_date_to: e.target.value, offset: 0 })}
            />
          </div>
        </div>
      </Card>

      {/* Search info (only show if searching) */}
      {searchQuery.trim() && (
        <div className="text-sm text-gray-600">
          {filteredSubscriptions.length > 0 ? (
            <span>
              {filteredSubscriptions.length} resultado{filteredSubscriptions.length !== 1 ? 's' : ''} encontrado{filteredSubscriptions.length !== 1 ? 's' : ''} en esta página
            </span>
          ) : (
            <span className="text-amber-600">
              No se encontraron resultados para "{searchQuery}" en esta página
            </span>
          )}
        </div>
      )}

      {/* Subscriptions List */}
      {subscriptions.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center">
            <p className="text-sm text-gray-500">No se encontraron suscripciones</p>
            <p className="text-xs text-gray-400 mt-1">
              Intenta cambiar los filtros o actualizar la lista
            </p>
          </div>
        </Card>
      ) : filteredSubscriptions.length === 0 && searchQuery.trim() ? (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center">
            <p className="text-sm text-gray-500">No se encontraron resultados para "{searchQuery}"</p>
            <p className="text-xs text-gray-400 mt-1">
              La búsqueda se realiza solo en la página actual. Intenta navegar a otras páginas o cambiar los filtros.
            </p>
          </div>
        </Card>
      ) : (
        <>
          <Card className="overflow-hidden border-0 shadow-sm ring-1 ring-black/5">
            {isMobile ? (
              <div className="space-y-3 p-4">
                {filteredSubscriptions.map((subscription, index) => (
                  <SubscriptionCard
                    key={subscription.id}
                    subscription={subscription}
                    onViewClient={onViewClient || (() => { })}
                    index={index}
                    clientsMap={clientsMap}
                    plansMap={plansMap}
                  />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <SortableHeader
                        label="Cliente"
                        field="client_name" // Note: sorting by client name might be tricky if backend doesn't support joined sort, for now it might just do nothing or we handle id
                        currentSort={filters.sort_by}
                        currentOrder={filters.sort_order}
                        onSort={() => { }} // Client name sort TBD
                      />
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Plan
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <SortableHeader
                        label="Fecha Inicio"
                        field="start_date"
                        currentSort={filters.sort_by}
                        currentOrder={filters.sort_order}
                        onSort={(field) => {
                          const newOrder = filters.sort_by === field && filters.sort_order === 'desc' ? 'asc' : 'desc';
                          onFiltersChange({ ...filters, sort_by: field as any, sort_order: newOrder });
                        }}
                      />
                      <SortableHeader
                        label="Fecha Fin"
                        field="end_date"
                        currentSort={filters.sort_by}
                        currentOrder={filters.sort_order}
                        onSort={(field) => {
                          const newOrder = filters.sort_by === field && filters.sort_order === 'desc' ? 'asc' : 'desc';
                          onFiltersChange({ ...filters, sort_by: field as any, sort_order: newOrder });
                        }}
                      />
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Progreso / Vencimiento
                      </th>
                      <th className="relative px-4 py-3">
                        <span className="sr-only">Acciones</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredSubscriptions.map((subscription, index) => (
                      <SubscriptionRow
                        key={subscription.id}
                        subscription={subscription}
                        onViewClient={onViewClient || (() => { })}
                        index={index}
                        clientsMap={clientsMap}
                        plansMap={plansMap}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Pagination */}
          <Card className="p-4">
            <Pagination
              currentPage={currentPage}
              onPageChange={handlePageChange}
              itemsPerPage={limit}
              isLoading={isLoading}
              totalPages={totalPages}
            />
          </Card>
        </>
      )}
    </div>
  );
});

SubscriptionsTable.displayName = 'SubscriptionsTable';
