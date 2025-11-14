// External dependencies
import { memo } from 'react';
import { Edit2, Eye, Trash2, CheckCircle, Phone } from 'lucide-react';

// Internal shared components
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { IconButton } from '@/components/ui/IconButton';

// Feature imports
import { clientHelpers, type Client } from '../..';

/**
 * Props for ClientCard component
 */
interface ClientCardProps {
  /** Client data to display */
  client: Client;
  /** Optional callback when viewing client details */
  onView?: (clientId: string) => void;
  /** Callback when editing client */
  onEdit: (client: Client) => void;
  /** Callback when deactivating client */
  onDelete: (client: Client) => void;
  /** Optional callback when activating client */
  onActivate?: (client: Client) => void;
  /** Whether a delete/activate operation is in progress */
  isDeleting?: boolean;
}

/**
 * ClientCard - Individual client card component
 * 
 * Displays client information in a compact card format, optimized for mobile and tablet.
 * Supports view, edit, delete (deactivate), and activate actions.
 * 
 * @param props - ClientCard component props
 * @returns JSX element
 */
export const ClientCard = memo(({
  client,
  onView,
  onEdit,
  onDelete,
  onActivate,
  isDeleting = false,
}: ClientCardProps): JSX.Element => {
  const fullName = clientHelpers.formatFullName(client);

  return (
    <Card
      padding="none"
      className="p-3 sm:p-4 lg:p-5 hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex flex-col gap-3">
        {/* Header: Avatar, Nombre y Estado */}
        <div className="flex items-start gap-3">
          <Avatar
            src=""
            alt={fullName}
            name={fullName}
            size="md"
            className="flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-base sm:text-lg truncate mb-1.5">
              {fullName}
            </h3>
            <Badge variant={client.is_active ? 'success' : 'error'} size="sm">
              {client.is_active ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>
        </div>

        {/* Información del Cliente */}
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <div className="text-sm text-gray-900">
            <span className="font-medium">{client.dni_type} {client.dni_number}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
            <span className="truncate">{client.phone}</span>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-gray-100">
          {onView && (
            <IconButton
              icon={Eye}
              onClick={() => onView(client.id)}
              variant="primary"
              size="md"
              aria-label="Ver detalles"
              title="Ver detalles"
            />
          )}
          <IconButton
            icon={Edit2}
            onClick={() => onEdit(client)}
            variant="primary"
            size="md"
            aria-label="Editar cliente"
            title="Editar"
          />
          {client.is_active ? (
            <IconButton
              icon={Trash2}
              onClick={() => onDelete(client)}
              variant="danger"
              size="md"
              disabled={isDeleting}
              aria-label="Inactivar cliente"
              title="Inactivar cliente"
            />
          ) : (
            onActivate && (
              <IconButton
                icon={CheckCircle}
                onClick={() => onActivate(client)}
                variant="primary"
                size="md"
                disabled={isDeleting}
                aria-label="Activar cliente"
                title="Activar cliente"
                className="!text-gray-400 hover:!text-green-600 hover:!bg-green-50/50"
              />
            )
          )}
        </div>
      </div>
    </Card>
  );
});

ClientCard.displayName = 'ClientCard';
