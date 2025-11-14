// External dependencies
import React, { memo } from 'react';
import { User, Phone, MessageCircle, MapPin, Mail, Edit, Fingerprint, CheckCircle } from 'lucide-react';

// Internal shared components
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Avatar } from '../../../components/ui/Avatar';
import { BiometricStatus } from '../../../components/biometrics/BiometricStatus';

// Feature imports
import { type Client, clientHelpers } from '../..';
import { type ClientDashboardResponse } from '../..';

/**
 * Props for ClientInfoTab component
 */
interface ClientInfoTabProps {
  /** Client data */
  client: Client;
  /** Optional dashboard data */
  dashboard?: ClientDashboardResponse;
  /** Callback for phone call action */
  onCall: () => void;
  /** Callback for WhatsApp action */
  onWhatsApp: () => void;
  /** Callback for edit action */
  onEdit: () => void;
  /** Callback for biometric action */
  onBiometric: () => void;
  /** Optional callback for activate action */
  onActivate?: () => void;
}

/**
 * ClientInfoTab - Client information display component
 * 
 * Displays comprehensive client information including personal data,
 * contact information, and biometric status.
 * 
 * @param props - ClientInfoTab component props
 * @returns JSX element
 */
export const ClientInfoTab: React.FC<ClientInfoTabProps> = memo(({ 
  client, 
  dashboard,
  onCall, 
  onWhatsApp,
  onEdit,
  onBiometric,
  onActivate,
}): JSX.Element => {
  const age = clientHelpers.calculateAge(client.birth_date);
  const fullName = dashboard ? `${dashboard.client.first_name} ${dashboard.client.last_name}` : 
                   `${client.first_name} ${client.last_name}`;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header del Cliente */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Avatar
            name={fullName}
            src={dashboard?.biometric?.thumbnail || client?.meta_info?.photo_url}
            size="md"
            className="flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{fullName}</h2>
              <Badge 
                variant={dashboard?.client.is_active ? 'success' : 'error'} 
                size="sm"
              >
                {dashboard?.client.is_active ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              {age} años • Cliente desde {new Date(client.created_at).toLocaleDateString('es-CO')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {!client.is_active && onActivate && (
            <Button
              onClick={onActivate}
              size="sm"
              variant="primary"
              leftIcon={<CheckCircle className="w-4 h-4" />}
              className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700"
            >
              <span className="hidden sm:inline">Activar Cliente</span>
              <span className="sm:hidden">Activar</span>
            </Button>
          )}
          <Button
            onClick={onEdit}
            size="sm"
            variant="secondary"
            leftIcon={<Edit className="w-4 h-4" />}
            className="flex-1 sm:flex-none"
          >
            <span className="hidden sm:inline">Editar</span>
            <span className="sm:hidden">Editar</span>
          </Button>
          <Button
            onClick={onBiometric}
            size="sm"
            variant="outline"
            leftIcon={<Fingerprint className="w-4 h-4" />}
            className="flex-1 sm:flex-none"
          >
            <span className="hidden sm:inline">Biometría</span>
            <span className="sm:hidden">Bio</span>
          </Button>
        </div>
      </div>

      {/* Datos Personales */}
      <div className="space-y-3 sm:space-y-4">
        <h3 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-2">
          <User className="w-4 h-4 text-blue-600" />
          Datos Personales
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 mb-1">Tipo de Documento</span>
            <span className="text-sm font-medium text-gray-900">{client.dni_type}</span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 mb-1">Número de Documento</span>
            <span className="text-sm font-medium text-gray-900">{client.dni_number}</span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 mb-1">Fecha de Nacimiento</span>
            <span className="text-sm font-medium text-gray-900">
              {new Date(client.birth_date).toLocaleDateString('es-CO', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 mb-1">Edad</span>
            <span className="text-sm font-medium text-gray-900">{age} años</span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 mb-1">Género</span>
            <span className="text-sm font-medium text-gray-900 capitalize">
              {client.gender === 'male' ? 'Masculino' : client.gender === 'female' ? 'Femenino' : 'Otro'}
            </span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 mb-1">Fecha de Registro</span>
            <span className="text-sm font-medium text-gray-900">
              {new Date(client.created_at).toLocaleDateString('es-CO')}
            </span>
          </div>
        </div>

        {client.updated_at && (
          <div className="pt-3 border-t border-gray-100">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 mb-1">Última Actualización</span>
              <span className="text-sm font-medium text-gray-900">
                {new Date(client.updated_at).toLocaleString('es-CO', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Información de Contacto */}
      <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-4 border-t border-gray-200">
        <h3 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-2">
          <Phone className="w-4 h-4 text-green-600" />
          Información de Contacto
        </h3>

        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex-1 min-w-0">
              <span className="text-xs text-gray-500 block mb-1">Teléfono Principal</span>
              <span className="text-sm font-medium text-gray-900">{client.phone}</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                onClick={onCall}
                variant="secondary"
                size="sm"
                leftIcon={<Phone className="w-4 h-4" />}
                className="min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0"
              >
                <span className="hidden sm:inline">Llamar</span>
                <span className="sm:hidden">Llamar</span>
              </Button>
              <Button
                onClick={onWhatsApp}
                variant="secondary"
                size="sm"
                leftIcon={<MessageCircle className="w-4 h-4" />}
                className="min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0"
              >
                <span className="hidden sm:inline">WhatsApp</span>
                <span className="sm:hidden">WA</span>
              </Button>
            </div>
          </div>

          {client.alternative_phone && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="text-xs text-gray-500 block mb-1">Teléfono Alternativo</span>
              <span className="text-sm font-medium text-gray-900">{client.alternative_phone}</span>
            </div>
          )}

          {client.address && (
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-xs text-gray-500 block mb-1">Dirección</span>
                <span className="text-sm font-medium text-gray-900">{client.address}</span>
              </div>
            </div>
          )}

          {client.meta_info?.email && (
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-xs text-gray-500 block mb-1">Email</span>
                <span className="text-sm font-medium text-gray-900 break-all">{client.meta_info.email}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Estado de Biometría */}
      <div className="pt-3 sm:pt-4 border-t border-gray-200">
        <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
          <Fingerprint className="w-4 h-4 text-purple-600" />
          Autenticación Biométrica
        </h3>
        <BiometricStatus 
          biometric={dashboard?.biometric ? {
            id: dashboard.biometric.id || '',
            type: 'face',
            data: '',
            thumbnail: dashboard.biometric.thumbnail,
            has_face_biometric: true,
            created_at: dashboard.biometric.created_at || new Date().toISOString(),
            updated_at: dashboard.biometric.updated_at || new Date().toISOString(),
          } : undefined} 
        />
      </div>
    </div>
  );
});

ClientInfoTab.displayName = 'ClientInfoTab';
