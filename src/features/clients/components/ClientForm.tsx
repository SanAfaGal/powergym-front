import { useForm } from 'react-hook-form';
import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
  User,
  FileText,
  Calendar,
  Users,
  Phone,
  MapPin,
  Save,
  X,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { type ClientFormData } from '../..';
import { clientHelpers } from '../..';
import {
  DOCUMENT_TYPES,
  GENDER_OPTIONS,
  VALIDATION_RULES,
  DOCUMENT_VALIDATION,
  NOTIFICATION_MESSAGES,
} from '@/features/clients/constants/clientConstants';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useCreateClient, useUpdateClient } from '../..';
import { useToast } from '@/shared';
import { formatPhoneNumber, unformatPhoneNumber } from '@/features/clients/utils/phoneFormatter';
import { extractCountryCode } from '@/features/clients/utils/phoneParser';

// Internal form data structure (different from ClientFormData API structure)
interface FormInternalData {
  document_type?: string;
  document_number?: string;
  first_name?: string;
  second_name?: string;
  first_surname?: string;
  second_surname?: string;
  phone_primary?: string;
  phone_secondary?: string;
  birth_date?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
}

interface ClientFormProps {
  initialData?: ClientFormData;
  clientId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * Modern, visually enhanced client form component
 * Handles creation and editing of client information with improved UX
 */
export const ClientForm = memo(({
  initialData,
  clientId,
  onSuccess,
  onCancel
}: ClientFormProps) => {
  const [calculatedAge, setCalculatedAge] = useState<number | null>(null);

  // Extract phone codes from initial data if available
  const initialPhoneCode = useMemo(() => {
    if (initialData && 'phoneCode' in initialData && initialData.phoneCode) {
      return initialData.phoneCode;
    }
    return '+57';
  }, [initialData]);

  const initialPhoneCodeSecondary = useMemo(() => {
    if (initialData && 'phoneCodeSecondary' in initialData && initialData.phoneCodeSecondary) {
      return initialData.phoneCodeSecondary;
    }
    return '+57';
  }, [initialData]);

  const [phoneCode, setPhoneCode] = useState(initialPhoneCode);
  const [phoneCodeSecondary, setPhoneCodeSecondary] = useState(initialPhoneCodeSecondary);

  // Update phone codes when initialData changes (e.g., when editing)
  useEffect(() => {
    if (initialData) {
      if ('phoneCode' in initialData && initialData.phoneCode) {
        setPhoneCode(initialData.phoneCode);
      }
      if ('phoneCodeSecondary' in initialData && initialData.phoneCodeSecondary) {
        setPhoneCodeSecondary(initialData.phoneCodeSecondary);
      }
    }
  }, [initialData]);

  const { showToast } = useToast();
  const createClientMutation = useCreateClient();
  const updateClientMutation = useUpdateClient();

  // Prepare initial form values - convert ClientFormData to form internal structure
  const initialFormValues = useMemo(() => {
    if (!initialData) return {};

    const formData: FormInternalData = {
      document_type: initialData.dni_type,
      document_number: initialData.dni_number,
      first_name: initialData.first_name,
      second_name: initialData.middle_name,
      first_surname: initialData.last_name,
      second_surname: initialData.second_last_name,
      birth_date: initialData.birth_date,
      gender: initialData.gender,
      address: initialData.address,
    };

    // Extract country codes and store only the numbers
    if (initialData.phone) {
      const { number } = extractCountryCode(initialData.phone);
      formData.phone_primary = number;
    }

    if (initialData.alternative_phone) {
      const { number } = extractCountryCode(initialData.alternative_phone);
      formData.phone_secondary = number;
    }

    return formData;
  }, [initialData]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<FormInternalData>({
    defaultValues: initialFormValues,
    mode: 'onBlur',
  });

  const birthDate = watch('birth_date');
  const documentNumber = watch('document_number');

  // Calculate age from birth date
  useEffect(() => {
    if (birthDate) {
      const age = clientHelpers.calculateAge(birthDate);
      setCalculatedAge(age);
    } else {
      setCalculatedAge(null);
    }
  }, [birthDate]);

  // Format phone number with country code for API
  const formatPhone = useCallback((phone: string | undefined, countryCode: string) => {
    if (!phone) return '';
    const cleaned = unformatPhoneNumber(phone);
    return `${countryCode}${cleaned}`;
  }, []);

  /**
   * Handles form submission
   */
  const onSubmit = useCallback(async (data: FormInternalData) => {
    const apiData: ClientFormData = {
      dni_type: data.document_type || '',
      dni_number: data.document_number || '',
      first_name: data.first_name || '',
      middle_name: data.second_name || undefined,
      last_name: data.first_surname || '',
      second_last_name: data.second_surname || undefined,
      phone: formatPhone(data.phone_primary, '+57'),
      alternative_phone: data.phone_secondary ? formatPhone(data.phone_secondary, '+57') : undefined,
      birth_date: data.birth_date || '',
      gender: data.gender || 'male',
      address: data.address || undefined,
      is_active: true,
    };

    try {
      if (clientId) {
        await updateClientMutation.mutateAsync({ id: clientId, data: apiData });
        showToast({
          type: 'success',
          title: 'Éxito',
          message: NOTIFICATION_MESSAGES.updateSuccess,
        });
      } else {
        await createClientMutation.mutateAsync(apiData);
        showToast({
          type: 'success',
          title: 'Éxito',
          message: NOTIFICATION_MESSAGES.createSuccess,
        });
      }
      onSuccess();
    } catch (error) {
      // Check if error is related to duplicate DNI/cedula
      const isConflictError = error && typeof error === 'object' && 'status' in error && error.status === 409;
      const errorMessage = error instanceof Error ? error.message : '';
      const isDniDuplicateError = isConflictError ||
        (errorMessage && (
          errorMessage.toLowerCase().includes('dni') ||
          errorMessage.toLowerCase().includes('already exists') ||
          errorMessage.toLowerCase().includes('ya existe') ||
          errorMessage.toLowerCase().includes('ya está registrado')
        ));

      if (isDniDuplicateError) {
        // Set error on document_number field
        setError('document_number', {
          type: 'manual',
          message: 'Este número de cédula ya está registrado. No se puede crear otro cliente con la misma cédula.',
        });

        // Show toast with specific message
        showToast({
          type: 'error',
          title: 'Error de validación',
          message: NOTIFICATION_MESSAGES.documentExists,
        });
      } else {
        // Handle other errors
        const genericErrorMessage = error instanceof Error
          ? error.message
          : (clientId ? NOTIFICATION_MESSAGES.updateError : NOTIFICATION_MESSAGES.createError);
        showToast({
          type: 'error',
          title: 'Error',
          message: genericErrorMessage,
        });
      }
    }
  }, [formatPhone, phoneCode, phoneCodeSecondary, clientId, updateClientMutation, createClientMutation, showToast, onSuccess, setError]);

  // Memoized validation states
  const isDocumentValid = useMemo(() =>
    documentNumber &&
    documentNumber.length >= DOCUMENT_VALIDATION.minLength &&
    !errors.document_number,
    [documentNumber, errors.document_number]
  );

  const watchedPhonePrimary = watch('phone_primary');
  const isPhoneValid = useMemo(() => {
    if (!watchedPhonePrimary) return false;
    const cleaned = unformatPhoneNumber(watchedPhonePrimary);
    return cleaned.length >= VALIDATION_RULES.phone.minLength && !errors.phone_primary;
  }, [watchedPhonePrimary, errors.phone_primary]);

  const isSubmitting = createClientMutation.isPending || updateClientMutation.isPending;
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Personal Information Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="p-8 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 border-2 border-blue-100/50 shadow-lg">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b-2 border-gradient-to-r from-blue-500 to-purple-500">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <User className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Información Personal
              </h3>
              <p className="text-sm text-gray-600 mt-1">Datos básicos de identificación</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Document Type */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Tipo de documento *
              </label>
              <div className="relative group">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors z-10" />
                <select
                  {...register('document_type', {
                    required: 'El tipo de documento es obligatorio',
                  })}
                  className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white hover:border-gray-400 ${errors.document_type ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200'
                    }`}
                >
                  <option value="">Seleccionar tipo...</option>
                  {DOCUMENT_TYPES.map((type: { value: string; label: string }) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              {errors.document_type && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-600 flex items-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  {String(errors.document_type.message)}
                </motion.p>
              )}
            </motion.div>

            {/* Document Number */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Número de documento *
              </label>
              <Input
                {...register('document_number', {
                  required: 'El número de documento es obligatorio',
                  minLength: {
                    value: VALIDATION_RULES.document.minLength,
                    message: `El documento debe tener al menos ${VALIDATION_RULES.document.minLength} caracteres`,
                  },
                  maxLength: {
                    value: VALIDATION_RULES.document.maxLength,
                    message: `El documento no puede exceder ${VALIDATION_RULES.document.maxLength} caracteres`,
                  },
                  pattern: {
                    value: VALIDATION_RULES.document.pattern,
                    message: 'Solo se permiten dígitos',
                  },
                })}
                placeholder="Ej: 1234567890"
                error={errors.document_number?.message as string}
              />
              <AnimatePresence>
                {isDocumentValid && (
                  <motion.p
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="mt-2 text-sm text-green-600 flex items-center gap-2 font-medium"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {NOTIFICATION_MESSAGES.documentValid}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* First Name */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Primer nombre *
              </label>
              <Input
                {...register('first_name', {
                  required: 'El primer nombre es obligatorio',
                  minLength: {
                    value: VALIDATION_RULES.name.minLength,
                    message: `El nombre debe tener al menos ${VALIDATION_RULES.name.minLength} caracteres`,
                  },
                  maxLength: {
                    value: VALIDATION_RULES.name.maxLength,
                    message: `El nombre no puede exceder ${VALIDATION_RULES.name.maxLength} caracteres`,
                  },
                  pattern: {
                    value: VALIDATION_RULES.name.pattern,
                    message: 'Solo se permiten letras y espacios',
                  },
                })}
                placeholder="Ej: Juan"
                error={errors.first_name?.message as string}
              />
            </motion.div>

            {/* Second Name */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Segundo nombre
              </label>
              <Input
                {...register('second_name', {
                  minLength: {
                    value: VALIDATION_RULES.name.minLength,
                    message: `El nombre debe tener al menos ${VALIDATION_RULES.name.minLength} caracteres`,
                  },
                  maxLength: {
                    value: VALIDATION_RULES.name.maxLength,
                    message: `El nombre no puede exceder ${VALIDATION_RULES.name.maxLength} caracteres`,
                  },
                  pattern: {
                    value: VALIDATION_RULES.name.pattern,
                    message: 'Solo se permiten letras y espacios',
                  },
                })}
                placeholder="Ej: Carlos"
                error={errors.second_name?.message as string}
              />
            </motion.div>

            {/* First Surname */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Primer apellido *
              </label>
              <Input
                {...register('first_surname', {
                  required: 'El primer apellido es obligatorio',
                  minLength: {
                    value: VALIDATION_RULES.name.minLength,
                    message: `El apellido debe tener al menos ${VALIDATION_RULES.name.minLength} caracteres`,
                  },
                  maxLength: {
                    value: VALIDATION_RULES.name.maxLength,
                    message: `El apellido no puede exceder ${VALIDATION_RULES.name.maxLength} caracteres`,
                  },
                  pattern: {
                    value: VALIDATION_RULES.name.pattern,
                    message: 'Solo se permiten letras y espacios',
                  },
                })}
                placeholder="Ej: Pérez"
                error={errors.first_surname?.message as string}
              />
            </motion.div>

            {/* Second Surname */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Segundo apellido
              </label>
              <Input
                {...register('second_surname', {
                  minLength: {
                    value: VALIDATION_RULES.name.minLength,
                    message: `El apellido debe tener al menos ${VALIDATION_RULES.name.minLength} caracteres`,
                  },
                  maxLength: {
                    value: VALIDATION_RULES.name.maxLength,
                    message: `El apellido no puede exceder ${VALIDATION_RULES.name.maxLength} caracteres`,
                  },
                  pattern: {
                    value: VALIDATION_RULES.name.pattern,
                    message: 'Solo se permiten letras y espacios',
                  },
                })}
                placeholder="Ej: García"
                error={errors.second_surname?.message as string}
              />
            </motion.div>

            {/* Birth Date */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Fecha de nacimiento *
              </label>
              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors z-10" />
                <Input
                  type="date"
                  {...register('birth_date', {
                    required: 'La fecha de nacimiento es obligatoria',
                    validate: {
                      notFuture: (value) => {
                        if (!value) return true;
                        const selectedDate = new Date(value);
                        const today = new Date();
                        return selectedDate <= today || 'La fecha no puede ser futura';
                      },
                      minimumAge: (value) => {
                        if (!value) return true;
                        const age = clientHelpers.calculateAge(value);
                        return age >= VALIDATION_RULES.age.minimum || `La edad mínima es ${VALIDATION_RULES.age.minimum} años`;
                      },
                      maximumAge: (value) => {
                        if (!value) return true;
                        const age = clientHelpers.calculateAge(value);
                        return age <= VALIDATION_RULES.age.maximum || 'Por favor verifica la fecha de nacimiento';
                      },
                    },
                  })}
                  className="pl-12"
                  max={new Date().toISOString().split('T')[0]}
                  error={errors.birth_date?.message as string}
                />
              </div>
              <AnimatePresence>
                {calculatedAge !== null && !errors.birth_date && (
                  <motion.p
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="mt-2 text-sm text-blue-600 font-semibold flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg w-fit"
                  >
                    <Sparkles className="w-4 h-4" />
                    Edad: {calculatedAge} años
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Gender */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                Género *
              </label>
              <div className="relative group">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors z-10" />
                <select
                  {...register('gender', {
                    required: 'El género es obligatorio',
                  })}
                  className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white hover:border-gray-400 ${errors.gender ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200'
                    }`}
                >
                  <option value="">Seleccionar género...</option>
                  {GENDER_OPTIONS.map((gender: { value: string; label: string }) => (
                    <option key={gender.value} value={gender.value}>
                      {gender.label}
                    </option>
                  ))}
                </select>
              </div>
              {errors.gender && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-600 flex items-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  {String(errors.gender.message)}
                </motion.p>
              )}
            </motion.div>
          </div>
        </Card>
      </motion.div>

      {/* Contact Information Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card className="p-8 bg-gradient-to-br from-white via-green-50/30 to-emerald-50/20 border-2 border-green-100/50 shadow-lg">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b-2 border-gradient-to-r from-green-500 to-emerald-500">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Phone className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Información de Contacto
              </h3>
              <p className="text-sm text-gray-600 mt-1">Datos para comunicación</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Primary Phone */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Teléfono principal *
              </label>
              <div className="flex gap-3">
                <div className="w-20 px-3 py-3.5 border-2 border-gray-200 bg-gray-50 rounded-xl text-gray-500 font-medium flex items-center justify-center select-none">
                  +57
                </div>
                <Input
                  type="tel"
                  {...register('phone_primary', {
                    required: 'El teléfono principal es obligatorio',
                    validate: {
                      validFormat: (value) => {
                        const phoneNumber = unformatPhoneNumber(value);
                        return phoneNumber.length === 10 ||
                          'El teléfono debe tener exactamente 10 dígitos';
                      },
                    },
                  })}
                  placeholder="300 123 4567"
                  value={formatPhoneNumber(watch('phone_primary') || '')}
                  onChange={(e) => {
                    const rawValue = e.target.value.replace(/[^\d]/g, '');
                    const formatted = formatPhoneNumber(rawValue);
                    setValue('phone_primary', formatted, { shouldValidate: true });
                  }}
                  error={errors.phone_primary?.message as string}
                  className="flex-1"
                />
              </div>
              <AnimatePresence>
                {isPhoneValid && (
                  <motion.p
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="mt-2 text-sm text-green-600 flex items-center gap-2 font-medium"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Teléfono válido
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Secondary Phone */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Teléfono alternativo
              </label>
              <div className="flex gap-3">
                <div className="w-20 px-3 py-3.5 border-2 border-gray-200 bg-gray-50 rounded-xl text-gray-500 font-medium flex items-center justify-center select-none">
                  +57
                </div>
                <Input
                  type="tel"
                  {...register('phone_secondary', {
                    validate: {
                      validFormat: (value) => {
                        if (!value) return true;
                        const phoneNumber = unformatPhoneNumber(value);
                        return phoneNumber.length === 10 ||
                          'El teléfono debe tener exactamente 10 dígitos';
                      },
                    },
                  })}
                  placeholder="300 123 4567"
                  value={formatPhoneNumber(watch('phone_secondary') || '')}
                  onChange={(e) => {
                    const rawValue = e.target.value.replace(/[^\d]/g, '');
                    const formatted = formatPhoneNumber(rawValue);
                    setValue('phone_secondary', formatted, { shouldValidate: true });
                  }}
                  error={errors.phone_secondary?.message as string}
                  className="flex-1"
                />
              </div>
            </motion.div>

            {/* Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="md:col-span-2"
            >
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-600" />
                Dirección completa
              </label>
              <div className="relative group">
                <MapPin className="absolute left-4 top-4 w-5 h-5 text-gray-400 group-focus-within:text-green-600 transition-colors z-10" />
                <textarea
                  {...register('address', {
                    minLength: {
                      value: VALIDATION_RULES.address.minLength,
                      message: `La dirección debe tener al menos ${VALIDATION_RULES.address.minLength} caracteres`,
                    },
                    maxLength: {
                      value: VALIDATION_RULES.address.maxLength,
                      message: `La dirección no puede exceder ${VALIDATION_RULES.address.maxLength} caracteres`,
                    },
                  })}
                  placeholder="Ej: Calle 123 #45-67, Bogotá"
                  rows={3}
                  className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all resize-none hover:border-gray-400 bg-white ${errors.address ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200'
                    }`}
                />
              </div>
              {errors.address && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-600 flex items-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  {String(errors.address.message)}
                </motion.p>
              )}
            </motion.div>
          </div>
        </Card>
      </motion.div>

      {/* Error Summary */}
      <AnimatePresence>
        {hasErrors && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-base font-bold text-red-900 mb-3">
                  Por favor corrige los siguientes errores:
                </h4>
                <ul className="text-sm text-red-800 space-y-2">
                  {Object.entries(errors).map(([field, error]) => (
                    <li key={field} className="flex items-start gap-2">
                      <span className="text-red-600 mt-0.5">•</span>
                      <span>{(error as { message?: string })?.message || String(error)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex items-center justify-end gap-4 pt-6 border-t-2 border-gray-200"
      >
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-8"
        >
          <X className="w-5 h-5 mr-2" />
          Cancelar
        </Button>
        <Button
          type="submit"
          className="bg-gradient-to-r from-powergym-red to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed px-8"
          disabled={isSubmitting || hasErrors}
          isLoading={isSubmitting}
          leftIcon={!isSubmitting ? <Save className="w-5 h-5" /> : undefined}
        >
          {clientId ? 'Actualizar Cliente' : 'Guardar Cliente'}
        </Button>
      </motion.div>
    </form>
  );
});

ClientForm.displayName = 'ClientForm';
