import React, { useState, useCallback } from 'react';
import { CameraCapture } from './CameraCapture';
import { CheckInResult } from './CheckInResult';
import { CheckInProcessingStatus } from './CheckInProcessingStatus';
import { useCheckIn } from '../hooks/useAttendances';
import { CheckInResponse } from '../types';
import { logger } from '../../../shared';
import { Camera, AlertCircle } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { IS_FACE_RECOGNITION_ENABLED, NOTIFICATION_MESSAGES } from '../constants/attendanceConstants';

type ProcessingStage = 'idle' | 'uploading' | 'processing' | 'verifying' | 'finalizing' | 'completed';

export const CheckInFacial: React.FC = () => {
  const [checkInResult, setCheckInResult] = useState<CheckInResponse | null>(null);
  const [processingStage, setProcessingStage] = useState<ProcessingStage>('idle');
  const [cameraKey, setCameraKey] = useState(0); // Key to force camera remount

  const { checkIn, reset } = useCheckIn();

  if (!IS_FACE_RECOGNITION_ENABLED) {
    return (
      <Card className="p-8 sm:p-12 text-center bg-white border border-gray-100 shadow-soft max-w-2xl mx-auto" padding="none">
        <div className="flex flex-col items-center space-y-5 sm:space-y-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 rounded-full flex items-center justify-center">
            <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Reconocimiento Facial Deshabilitado</h3>
            <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto font-medium">
              {NOTIFICATION_MESSAGES.featureDisabled}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const handleImageCaptured = async (base64Image: string) => {
    setProcessingStage('uploading');
    setCheckInResult(null);

    try {
      // Stage 1: Uploading (simulated delay for better UX)
      await new Promise(resolve => setTimeout(resolve, 300));

      // Stage 2: Processing facial recognition
      setProcessingStage('processing');
      await new Promise(resolve => setTimeout(resolve, 400));

      // Stage 3: Verifying subscription
      setProcessingStage('verifying');
      await new Promise(resolve => setTimeout(resolve, 300));

      // Stage 4: Finalizing
      setProcessingStage('finalizing');

      // Make actual API call
      const result = await checkIn(base64Image);

      // Stage 5: Completed
      setProcessingStage('completed');
      await new Promise(resolve => setTimeout(resolve, 200));

      setCheckInResult(result);
    } catch (err: unknown) {
      logger.error('Check-in failed:', err);

      let errorResult: CheckInResponse;
      const error = err as {
        type?: string;
        status?: number;
        message?: string;
        response?: {
          data?: {
            detail?: string;
            message?: string;
          } | string;
        }
      };
      const errorType = error?.type;
      const status = error?.status;

      if (errorType === 'network') {
        errorResult = {
          success: false,
          message: 'Error de conexión',
          can_enter: false,
          reason: 'system_error',
          detail: 'No se pudo conectar al servidor. Por favor verifica tu conexión a internet e intenta de nuevo.',
        };
      } else if (errorType === 'timeout') {
        errorResult = {
          success: false,
          message: 'Tiempo de espera agotado',
          can_enter: false,
          reason: 'system_error',
          detail: 'La solicitud tardó demasiado tiempo. Por favor verifica tu conexión e intenta de nuevo.',
        };
      } else if (status && status > 0) {
        let apiMessage = '';
        let apiDetail = '';

        try {
          if (error.response?.data) {
            const errorData = error.response.data;
            if (typeof errorData === 'string') {
              apiMessage = errorData;
              apiDetail = errorData;
            } else if (typeof errorData === 'object') {
              apiMessage = errorData.message || errorData.detail || '';
              apiDetail = errorData.detail || errorData.message || '';
            }
          }
        } catch (parseError) {
          logger.warn('Could not parse error response:', parseError);
        }

        if (status === 400) {
          errorResult = {
            success: false,
            message: apiMessage || 'No se detectó rostro en la imagen',
            can_enter: false,
            reason: 'no_face_detected',
            detail: apiDetail || 'Por favor asegúrate de que tu rostro esté claramente visible en el marco de la cámara e intenta de nuevo.',
          };
        } else if (status === 401) {
          errorResult = {
            success: false,
            message: apiMessage || 'Rostro no reconocido',
            can_enter: false,
            reason: 'face_not_recognized',
            detail: apiDetail || 'Tu rostro no fue reconocido en nuestro sistema. Por favor contacta a recepción para registrar tus datos faciales.',
          };
        } else if (status === 403) {
          errorResult = {
            success: false,
            message: apiMessage || 'Acceso denegado',
            can_enter: false,
            reason: 'subscription_expired',
            detail: apiDetail || 'El acceso al gimnasio está actualmente restringido. Por favor verifica el estado de tu suscripción.',
          };
        } else if (status === 409) {
          errorResult = {
            success: false,
            message: apiMessage || 'Ya has hecho check-in hoy',
            can_enter: false,
            reason: 'already_checked_in',
            detail: apiDetail || 'Ya has registrado tu entrada hoy. Solo puedes hacer check-in una vez por día.',
          };
        } else if (status === 422) {
          errorResult = {
            success: false,
            message: apiMessage || 'Error de validación',
            can_enter: false,
            reason: 'system_error',
            detail: apiDetail || 'Los datos enviados no son válidos. Por favor verifica la información e intenta de nuevo.',
          };
        } else if (status >= 500) {
          errorResult = {
            success: false,
            message: apiMessage || 'Error del servidor',
            can_enter: false,
            reason: 'system_error',
            detail: apiDetail || 'Error interno del servidor. Por favor intenta de nuevo más tarde.',
          };
        } else {
          errorResult = {
            success: false,
            message: apiMessage || 'Error del sistema',
            can_enter: false,
            reason: 'system_error',
            detail: apiDetail || 'Ocurrió un error inesperado. Por favor intenta de nuevo.',
          };
        }
      } else {
        errorResult = {
          success: false,
          message: 'Error desconocido',
          can_enter: false,
          reason: 'system_error',
          detail: 'Ocurrió un error inesperado. Por favor intenta de nuevo o contacta al soporte técnico.',
        };
      }

      setCheckInResult(errorResult);
      setProcessingStage('completed');
    } finally {
      if (processingStage !== 'completed') {
        setProcessingStage('completed');
      }
    }
  };

  const handleRetry = useCallback(() => {
    setCheckInResult(null);
    setProcessingStage('idle');
    reset();
    // Force camera remount by changing key
    setCameraKey(prev => prev + 1);
  }, [reset]);

  const handleNewCheckIn = useCallback(() => {
    setCheckInResult(null);
    setProcessingStage('idle');
    reset();
    // Force camera remount by changing key
    setCameraKey(prev => prev + 1);
  }, [reset]);

  const handleError = useCallback((error: string) => {
    logger.error('Camera error:', error);
  }, []);

  // Determine what to show
  const showCamera = processingStage === 'idle' && !checkInResult;
  const showProcessing = processingStage !== 'idle' && processingStage !== 'completed' && !checkInResult;
  const showResult = checkInResult !== null;

  const processingStageForStatus = showProcessing
    ? (processingStage === 'uploading' ? 'uploading' :
      processingStage === 'processing' ? 'processing' :
        processingStage === 'verifying' ? 'verifying' : 'finalizing')
    : 'uploading';

  return (
    <div className="w-full space-y-4 sm:space-y-6 max-w-4xl mx-auto">
      {/* Camera Section - Only show when idle */}
      {showCamera && (
        <div className="w-full">
          <CameraCapture
            key={cameraKey}
            onImageCaptured={handleImageCaptured}
            onError={handleError}
            isProcessing={false}
          />
        </div>
      )}

      {/* Processing Status - Show during processing */}
      {showProcessing && (
        <div className="w-full">
          <CheckInProcessingStatus
            stage={processingStageForStatus}
          />
        </div>
      )}

      {/* Result Section - Show after completion */}
      {showResult && checkInResult && (
        <div className="w-full">
          <CheckInResult
            result={checkInResult}
            onRetry={handleRetry}
            onNewCheckIn={checkInResult.success && checkInResult.can_enter ? handleNewCheckIn : undefined}
          />
        </div>
      )}

      {/* Empty State - Only show if nothing else is displayed */}
      {!showCamera && !showProcessing && !showResult && (
        <Card className="p-8 sm:p-12 text-center bg-white border border-gray-100 shadow-soft max-w-2xl mx-auto" padding="none">
          <div className="flex flex-col items-center space-y-5 sm:space-y-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl flex items-center justify-center shadow-[0_8px_16px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04)] border border-gray-200/50">
              <Camera className="w-10 h-10 sm:w-12 sm:h-12 text-gray-600" strokeWidth={2} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Listo para Check-in</h3>
              <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto font-medium">
                Captura tu foto para comenzar el proceso de reconocimiento facial
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
