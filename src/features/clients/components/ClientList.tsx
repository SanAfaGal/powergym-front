// External dependencies
import { useState, useMemo, useCallback, memo } from 'react';
import { Search, Plus, Edit2, Eye, Trash2, CheckCircle, UserCircle2, Phone, Mail, Calendar, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Internal shared components
import { Button } from '@/components/ui/Button';
import { RefreshButton } from '@/components/ui/RefreshButton';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { IconButton } from '@/components/ui/IconButton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PageLayout } from '@/components/ui/PageLayout';
import { useToast, logger, useMediaQuery } from '@/shared';

// Feature components
import { ClientFormModal } from './ClientFormModal';
import { ClientCards } from './ClientCards';
import { useClients, clientHelpers, type Client } from '../..';
import { useClientStatusToggle } from '../hooks/useClientStatusToggle';
import {
  getActivationDialogConfig,
  getDeactivationDialogConfig,
} from '../utils/clientStatusActions';

/**
 * Props for ClientList component
 */
interface ClientListProps {
  /** Optional callback when a client is selected */
  onSelectClient?: (clientId: string) => void;
}

/**
 * Optimized client list component with search and filtering capabilities
 * 
 * Features:
 * - Search by name, document, phone, or address
 * - Filter by active/inactive status
 * - Activate/deactivate clients with confirmation
 * - Responsive design (table for desktop, cards for mobile)
 * 
 * @param props - ClientList component props
 * @returns JSX element
 */
export const ClientList = memo(({ onSelectClient }: ClientListProps): JSX.Element => {
  // State management
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [isActivateModalOpen, setIsActivateModalOpen] = useState<boolean>(false);
  const [clientToActivate, setClientToActivate] = useState<Client | null>(null);

  // Hooks
  const { showToast } = useToast();
  const { isDesktop } = useMediaQuery();
  const { data: clients = [], isLoading: loading, isError, isRefetching, refetch } = useClients();
  const { handleActivate, handleDeactivate, isToggling } = useClientStatusToggle();

  const handleSearch = useCallback(() => {
    setSearchTerm(searchTerm);
  }, [searchTerm]);

  const handleEdit = useCallback((client: Client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  }, []);

  /**
   * Handle click to delete (deactivate) a client
   */
  const handleDeleteClick = useCallback((client: Client): void => {
    setClientToDelete(client);
    setIsDeleteModalOpen(true);
  }, []);

  /**
   * Handle click to activate a client
   */
  const handleActivateClick = useCallback((client: Client): void => {
    setClientToActivate(client);
    setIsActivateModalOpen(true);
  }, []);

  /**
   * Handle confirmation to deactivate a client
   */
  const handleDeleteConfirm = useCallback(async (): Promise<void> => {
    if (!clientToDelete) return;

    try {
      await handleDeactivate(clientToDelete);
      setIsDeleteModalOpen(false);
      setClientToDelete(null);
    } catch (error) {
      // Error handling is done by useClientStatusToggle hook
      logger.error('Error in delete confirmation:', error);
    }
  }, [clientToDelete, handleDeactivate]);

  /**
   * Handle confirmation to activate a client
   */
  const handleActivateConfirm = useCallback(async (): Promise<void> => {
    if (!clientToActivate) return;

    try {
      await handleActivate(clientToActivate);
      setIsActivateModalOpen(false);
      setClientToActivate(null);
    } catch (error) {
      // Error handling is done by useClientStatusToggle hook
      logger.error('Error in activate confirmation:', error);
    }
  }, [clientToActivate, handleActivate]);

  /**
   * Handle closing delete modal
   */
  const handleDeleteModalClose = useCallback((): void => {
    if (!isToggling) {
      setIsDeleteModalOpen(false);
      setClientToDelete(null);
    }
  }, [isToggling]);

  /**
   * Handle closing activate modal
   */
  const handleActivateModalClose = useCallback((): void => {
    if (!isToggling) {
      setIsActivateModalOpen(false);
      setClientToActivate(null);
    }
  }, [isToggling]);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setSelectedClient(null);
  }, []);

  const handleClientSaved = () => {
    handleModalClose();
  };

  const handleRefresh = useCallback(async () => {
    try {
      await refetch();
      showToast({
        type: 'success',
        title: 'Actualizado',
        message: 'La lista de clientes se ha actualizado correctamente',
      });
    } catch {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'No se pudo actualizar la lista de clientes',
      });
    }
  }, [refetch, showToast]);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }, []);

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const matchesSearch = !searchTerm ||
        clientHelpers.formatFullName(client).toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.dni_number.includes(searchTerm) ||
        client.phone.includes(searchTerm) ||
        client.address?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesActiveFilter = activeFilter === undefined || client.is_active === activeFilter;

      return matchesSearch && matchesActiveFilter;
    });
  }, [clients, searchTerm, activeFilter]);

  if (isError) {
    return (
      <PageLayout
        title="Clientes"
        subtitle="Gestión de información de clientes"
      >
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-800 font-medium">Error al cargar clientes</p>
          <p className="text-red-600 text-sm mt-2">Por favor, verifica tu conexión e intenta nuevamente</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Clientes
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Gestión de información de tus clientes
            </p>
          </div>
          <div className="flex items-center gap-4">
            <RefreshButton
              onClick={handleRefresh}
              isRefetching={isRefetching}
              variant="secondary"
            />
            <Button
              onClick={() => setIsModalOpen(true)}
              size="sm"
              className="bg-powergym-red hover:bg-[#c50202] shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
              <span className="hidden sm:inline">Nuevo Cliente</span>
              <span className="sm:hidden">Nuevo</span>
            </Button>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar por nombre, documento, teléfono o dirección"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-8 sm:pl-10 text-sm sm:text-base"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
          <Filter className="w-5 h-5 text-gray-400 self-center mr-1" />
          <Button
            variant={activeFilter === undefined ? 'primary' : 'outline'}
            onClick={() => setActiveFilter(undefined)}
            size="sm"
            className={activeFilter === undefined ? 'bg-powergym-blue-medium hover:bg-powergym-blue-dark' : ''}
          >
            Todos
          </Button>
          <Button
            variant={activeFilter === true ? 'primary' : 'outline'}
            onClick={() => setActiveFilter(true)}
            size="sm"
            className={activeFilter === true ? 'bg-green-600 hover:bg-green-700 shadow-sm' : ''}
          >
            Activos
          </Button>
          <Button
            variant={activeFilter === false ? 'primary' : 'outline'}
            onClick={() => setActiveFilter(false)}
            size="sm"
            className={activeFilter === false ? 'bg-powergym-red hover:bg-red-700 shadow-sm' : ''}
          >
            Inactivos
          </Button>
        </div>

        {loading ? (
          isDesktop ? (
            // Skeleton para tabla (desktop)
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-4 p-4 border-b border-gray-100">
                  <div className="w-12 h-12 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                  <div className="h-6 w-16 bg-gray-200 rounded-full" />
                  <div className="h-3 bg-gray-200 rounded w-20" />
                  <div className="flex gap-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-lg" />
                    <div className="w-8 h-8 bg-gray-200 rounded-lg" />
                    <div className="w-8 h-8 bg-gray-200 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Skeleton para cards (móvil/tablet)
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-xl border border-gray-100 p-4 sm:p-5 lg:p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-5 bg-gray-200 rounded w-16" />
                    </div>
                  </div>
                  <div className="space-y-2 border-t border-gray-100 pt-3 mb-4">
                    <div className="h-3 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                    <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                    <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          )
        ) : filteredClients.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center py-12"
          >
            <UserCircle2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || activeFilter !== undefined
                ? 'No se encontraron clientes'
                : 'No hay clientes registrados'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || activeFilter !== undefined
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Comienza agregando tu primer cliente'}
            </p>
          </motion.div>
        ) : isDesktop ? (
          // Vista de tabla para desktop
          <div className="overflow-x-auto -mx-3 sm:-mx-4 lg:-mx-6 px-3 sm:px-4 lg:px-6">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5 rounded-xl">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50">
                    <tr>
                      <th className="text-left py-4 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="text-center py-4 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider hidden sm:table-cell">
                        Documento
                      </th>
                      <th className="text-left py-4 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider hidden md:table-cell">
                        Contacto
                      </th>
                      <th className="text-center py-4 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="text-center py-4 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider hidden lg:table-cell">
                        Registro
                      </th>
                      <th className="sticky right-0 bg-gradient-to-r from-gray-50 to-gray-100/50 text-right py-4 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider z-10 backdrop-blur-sm">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    <AnimatePresence>
                    {filteredClients.map((client, index) => (
                      <motion.tr
                        key={client.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.02, duration: 0.2 }}
                        className="hover:bg-blue-50/40 transition-colors duration-200 group border-b border-gray-100/60"
                      >
                        <td className="py-4 px-4 min-h-[52px]">
                          <div className="flex items-center gap-3">
                            <Avatar
                              src=""
                              alt={clientHelpers.formatFullName(client)}
                              size="md"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold text-gray-900 text-base truncate">
                                {clientHelpers.formatFullName(client)}
                              </div>
                              <div className="text-sm text-gray-500 font-normal mt-0.5">
                                {clientHelpers.calculateAge(client.birth_date)} años
                              </div>
                              <div className="text-xs text-gray-400 font-light sm:hidden mt-1">
                                {client.dni_type}: {client.dni_number}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center hidden sm:table-cell min-h-[52px]">
                          <div className="flex flex-col items-center">
                            <div className="text-sm font-medium text-gray-900">
                              {client.dni_type}
                            </div>
                            <div className="text-sm text-gray-600 font-normal mt-0.5">
                              {client.dni_number}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 hidden md:table-cell min-h-[52px]">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-sm text-gray-700 font-normal">
                              <Phone className="w-4 h-4 text-gray-400" strokeWidth={2} />
                              <span>{client.phone}</span>
                            </div>
                            {client.address && (
                              <div className="flex items-center gap-2 text-sm text-gray-600 font-light">
                                <Mail className="w-4 h-4 text-gray-400" strokeWidth={2} />
                                <span className="truncate max-w-[200px]">{client.address}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center min-h-[52px]">
                          <div className="flex justify-center">
                            <Badge 
                              variant={client.is_active ? 'success' : 'error'}
                              className="font-medium"
                            >
                              {client.is_active ? 'Activo' : 'Inactivo'}
                            </Badge>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center hidden lg:table-cell min-h-[52px]">
                          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 font-normal">
                            <Calendar className="w-4 h-4 text-gray-400" strokeWidth={2} />
                            <span>{formatDate(client.created_at)}</span>
                          </div>
                        </td>
                        <td className="sticky right-0 bg-white group-hover:bg-blue-50/40 py-4 px-4 min-h-[52px] z-10 transition-colors duration-200 backdrop-blur-sm">
                          <div className="flex items-center justify-end gap-1.5">
                            {onSelectClient && (
                              <IconButton
                                icon={Eye}
                                onClick={() => onSelectClient(client.id)}
                                variant="default"
                                size="sm"
                                title="Ver detalles"
                                aria-label="Ver detalles"
                                className="!text-gray-400 hover:!text-powergym-blue-medium hover:!bg-blue-50/50"
                              />
                            )}
                            <IconButton
                              icon={Edit2}
                              onClick={() => handleEdit(client)}
                              variant="default"
                              size="sm"
                              title="Editar cliente"
                              aria-label="Editar cliente"
                              className="!text-gray-400 hover:!text-powergym-blue-medium hover:!bg-blue-50/50"
                            />
                            {client.is_active ? (
                              <IconButton
                                icon={Trash2}
                                onClick={() => handleDeleteClick(client)}
                                variant="default"
                                size="sm"
                                disabled={isToggling}
                                title="Inactivar cliente"
                                aria-label="Inactivar cliente"
                                className="!text-gray-400 hover:!text-powergym-red hover:!bg-red-50/50"
                              />
                            ) : (
                              <IconButton
                                icon={CheckCircle}
                                onClick={() => handleActivateClick(client)}
                                variant="default"
                                size="sm"
                                disabled={isToggling}
                                title="Activar cliente"
                                aria-label="Activar cliente"
                                className="!text-gray-400 hover:!text-green-600 hover:!bg-green-50/50"
                              />
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          // Vista de cards para móvil/tablet
          <ClientCards
            clients={filteredClients}
            onView={onSelectClient}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            onActivate={handleActivateClick}
            isDeleting={isToggling}
          />
        )}
        </div>

        <ClientFormModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          client={selectedClient}
          onSaved={handleClientSaved}
        />

        {/* Confirm Deactivate Modal */}
        {clientToDelete && (() => {
          const dialogConfig = getDeactivationDialogConfig(clientToDelete);
          return (
            <ConfirmDialog
              isOpen={isDeleteModalOpen}
              onClose={handleDeleteModalClose}
              onConfirm={handleDeleteConfirm}
              title={dialogConfig.title}
              message={dialogConfig.message}
              confirmText={dialogConfig.confirmText}
              cancelText={dialogConfig.cancelText}
              variant={dialogConfig.variant}
              isLoading={isToggling}
              warningMessage="Esta acción no se puede deshacer. El cliente será marcado como inactivo y no aparecerá en la lista de clientes activos."
            />
          );
        })()}

        {/* Confirm Activate Modal */}
        {clientToActivate && (() => {
          const dialogConfig = getActivationDialogConfig(clientToActivate);
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
        </div>
      </div>
    </PageLayout>
  );
});

ClientList.displayName = 'ClientList';
