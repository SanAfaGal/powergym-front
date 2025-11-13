import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'membership_reminder_shown';

/**
 * Hook personalizado para gestionar el estado del recordatorio de membresías.
 * 
 * Gestiona el estado en sessionStorage para que persista durante la sesión
 * del navegador pero se limpie al cerrar la pestaña/ventana.
 * 
 * El estado se sincroniza con sessionStorage para que se actualice correctamente
 * cuando cambia el valor almacenado.
 * 
 * @returns Objeto con funciones y estado para gestionar el recordatorio
 */
export const useMembershipReminder = () => {
  /**
   * Estado que indica si el recordatorio ya se mostró en esta sesión.
   * Se sincroniza con sessionStorage para reflejar cambios en tiempo real.
   */
  const [hasShownReminder, setHasShownReminder] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(STORAGE_KEY) === 'true';
  });

  /**
   * Sincroniza el estado con sessionStorage cuando el componente se monta
   * o cuando el valor en sessionStorage cambia externamente.
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Leer el valor inicial de sessionStorage
    const checkReminderStatus = () => {
      const stored = sessionStorage.getItem(STORAGE_KEY) === 'true';
      setHasShownReminder(stored);
    };

    // Verificar el estado inicial
    checkReminderStatus();

    // Escuchar cambios en sessionStorage (por si cambia en otra pestaña)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        checkReminderStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  /**
   * Marca el recordatorio como mostrado en sessionStorage y actualiza el estado.
   * Usa useCallback para mantener la referencia estable.
   */
  const markAsShown = useCallback(() => {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(STORAGE_KEY, 'true');
    setHasShownReminder(true);
  }, []);

  /**
   * Limpia el estado del recordatorio del sessionStorage y actualiza el estado.
   * Útil para resetear el estado cuando el usuario cierra sesión.
   */
  const clearReminderState = useCallback(() => {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(STORAGE_KEY);
    setHasShownReminder(false);
  }, []);

  return {
    hasShownReminder,
    markAsShown,
    clearReminderState,
  };
};

