import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/dashboard/Sidebar';
import { useAuth } from '../features/auth';
import { useDashboardHome } from '../features/dashboard/hooks/useDashboardHome';
import { useMembershipReminder } from '../features/dashboard/hooks/useMembershipReminder';
import { ClientStatsCard } from '../features/dashboard/components/ClientStatsCard';
import { FinancialStatsCard } from '../features/dashboard/components/FinancialStatsCard';
import { AttendanceStatsCard } from '../features/dashboard/components/AttendanceStatsCard';
import { InventoryStatsCard } from '../features/dashboard/components/InventoryStatsCard';
import { RecentActivitiesList } from '../features/dashboard/components/RecentActivitiesList';
import { FloatingAlerts } from '../features/dashboard/components/FloatingAlerts';
import { DashboardHeader } from '../features/dashboard/components/DashboardHeader';
import { DashboardErrorState } from '../features/dashboard/components/DashboardErrorState';
import { DashboardSkeleton } from '../features/dashboard/components/DashboardSkeleton';
import { MembershipReminder } from '../features/dashboard/components/MembershipReminder';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { NOTIFICATION_MESSAGES } from '../features/dashboard/constants/dashboardConstants';
import { useToast } from '../shared';

// Lazy load heavy dashboard components for better code splitting
const Clients = lazy(() => import('./Clients').then(module => ({ default: module.Clients })));
const Attendances = lazy(() => import('./Attendances').then(module => ({ default: module.default })));
const InventoryPage = lazy(() => import('../features/inventory').then(module => ({ default: module.InventoryPage })));
const SubscriptionsPage = lazy(() => import('./SubscriptionsPage').then(module => ({ default: module.SubscriptionsPage })));
const PlansPage = lazy(() => import('../features/plans/pages/PlansPage').then(module => ({ default: module.PlansPage })));
const UsersPage = lazy(() => import('../features/users/pages/UsersPage').then(module => ({ default: module.UsersPage })));

// Loading fallback for lazy components
const ComponentLoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <LoadingSpinner size="lg" />
  </div>
);

export const Dashboard = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  
  // Initialize activeMenuItem from URL hash or localStorage
  const getInitialMenuItem = (): string => {
    const hash = window.location.hash.substring(1);
    if (hash) {
      return hash;
    }
    const saved = localStorage.getItem('dashboard_active_menu');
    return saved || 'home';
  };

  const [activeMenuItem, setActiveMenuItem] = useState(getInitialMenuItem);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);

  // Hook personalizado para gestionar el estado del recordatorio de membresías
  const { hasShownReminder, markAsShown } = useMembershipReminder();

  // Ref para rastrear si ya se intentó mostrar el recordatorio en esta sesión
  // Esto evita que se muestre durante refetches de filtros
  const hasAttemptedToShowReminder = useRef(false);

  // Use custom hook for dashboard home logic
  const {
    period,
    date,
    setPeriod,
    setDate,
    dashboardData,
    recentActivities,
    isDashboardLoading,
    isDashboardRefetching,
    isActivitiesLoading,
    dashboardError,
    periodLabel,
    dateLabel,
    handleRefresh,
  } = useDashboardHome();

  // Mostrar el modal automáticamente cuando se carga el dashboard por primera vez en la sesión
  // Solo se muestra una vez, no durante refetches causados por cambios de filtros
  useEffect(() => {
    // Verificar directamente sessionStorage para evitar problemas de sincronización
    const STORAGE_KEY = 'membership_reminder_shown';
    const reminderShownInStorage = typeof window !== 'undefined' 
      ? sessionStorage.getItem(STORAGE_KEY) === 'true'
      : false;

    // Solo mostrar el recordatorio si:
    // 1. El dashboard terminó de cargar (no está en loading inicial)
    // 2. Hay datos del dashboard
    // 3. No se ha mostrado antes (ni en estado ni en sessionStorage)
    // 4. No es un refetch (solo en la carga inicial)
    // 5. No se ha intentado mostrar antes en esta sesión
    const shouldShowReminder = 
      !isDashboardLoading && 
      !isDashboardRefetching &&
      dashboardData && 
      !reminderShownInStorage &&
      !hasShownReminder &&
      !hasAttemptedToShowReminder.current;

    if (shouldShowReminder) {
      setIsReminderModalOpen(true);
      markAsShown();
      hasAttemptedToShowReminder.current = true;
    }
  }, [isDashboardLoading, isDashboardRefetching, dashboardData, hasShownReminder, markAsShown]);

  const handleCloseReminder = () => {
    setIsReminderModalOpen(false);
  };

  // Handle errors
  useEffect(() => {
    if (dashboardError) {
      const errorMessage = 
        (dashboardError as Error & { response?: { data?: { detail?: string } }; message?: string })?.response?.data?.detail || 
        (dashboardError as Error & { message?: string })?.message || 
        NOTIFICATION_MESSAGES.loadError;
      showToast({
        type: 'error',
        title: 'Error',
        message: errorMessage,
      });
    }
  }, [dashboardError, showToast]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Update URL hash and localStorage when menu item changes
  useEffect(() => {
    window.location.hash = activeMenuItem;
    localStorage.setItem('dashboard_active_menu', activeMenuItem);
  }, [activeMenuItem]);

  // Listen for browser back/forward navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1);
      if (hash) {
        setActiveMenuItem(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const renderContent = () => {
    if (activeMenuItem === 'clients') {
      return (
        <Suspense fallback={<ComponentLoadingFallback />}>
          <Clients />
        </Suspense>
      );
    }

    if (activeMenuItem === 'attendances') {
      return (
        <Suspense fallback={<ComponentLoadingFallback />}>
          <Attendances />
        </Suspense>
      );
    }

    if (activeMenuItem === 'inventory') {
      return (
        <Suspense fallback={<ComponentLoadingFallback />}>
          <InventoryPage />
        </Suspense>
      );
    }

    if (activeMenuItem === 'subscriptions') {
      return (
        <Suspense fallback={<ComponentLoadingFallback />}>
          <SubscriptionsPage />
        </Suspense>
      );
    }

    if (activeMenuItem === 'plans') {
      return (
        <Suspense fallback={<ComponentLoadingFallback />}>
          <PlansPage />
        </Suspense>
      );
    }

    if (activeMenuItem === 'users') {
      return (
        <Suspense fallback={<ComponentLoadingFallback />}>
          <UsersPage />
        </Suspense>
      );
    }

    if (activeMenuItem === 'home') {
      if (isDashboardLoading && !dashboardData) {
        return <DashboardSkeleton />;
      }

      if (dashboardError || !dashboardData) {
        return (
          <DashboardErrorState 
            error={dashboardError || new Error('No se pudo cargar el dashboard')}
            onRetry={handleRefresh}
          />
        );
      }

      return (
        <>
          <div className="min-h-screen flex flex-col">
            {/* Header Compacto */}
            <div className="flex-shrink-0 mb-6 sm:mb-8">
              <DashboardHeader
                period={period}
                date={date}
                periodLabel={periodLabel}
                dateLabel={dateLabel}
                onPeriodChange={setPeriod}
                onDateChange={setDate}
                onRefresh={handleRefresh}
                isRefetching={isDashboardRefetching}
              />
            </div>

            {/* Contenido Principal - Grid con Actividades a la Derecha */}
            <div className="flex-1">
              <div className="grid grid-cols-12 gap-6">
                {/* Columna Izquierda - Stats Cards de 2 en 2 */}
                <div className="col-span-12 lg:col-span-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ClientStatsCard stats={dashboardData.client_stats} period={period} />
                    <AttendanceStatsCard stats={dashboardData.attendance_stats} period={period} />
                    <InventoryStatsCard stats={dashboardData.inventory_stats} />
                    <FinancialStatsCard stats={dashboardData.financial_stats} period={period} />
                  </div>
                </div>

                {/* Columna Derecha - Actividades Recientes */}
                <div className="col-span-12 lg:col-span-4">
                  <RecentActivitiesList 
                    activities={recentActivities}
                    isLoading={isActivitiesLoading}
                  />
                </div>
              </div>
            </div>

            {/* Margin bottom para evitar que el contenido quede pegado */}
            <div className="h-8 sm:h-12" />
          </div>

          {/* Alertas Flotantes */}
          {dashboardData.alerts.length > 0 && (
            <FloatingAlerts alerts={dashboardData.alerts} />
          )}
        </>
      );
    }

    return null;
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex overflow-hidden">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeItem={activeMenuItem}
        onItemClick={setActiveMenuItem}
        onLogout={handleLogout}
        user={user}
      />

      <div className="flex-1 flex flex-col min-w-0 lg:ml-72 overflow-hidden">
        {/* Mobile Header with Hamburger */}
        <header className="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm flex-shrink-0">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Abrir menú"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center">
                <img 
                  src="/logo.svg" 
                  alt="PowerGym AG" 
                  className="w-full h-full object-contain"
                />
              </div>
              <h2 className="text-lg font-bold text-powergym-charcoal">PowerGym AG</h2>
            </div>
            <div className="w-10" />
          </div>
        </header>

        {/* Main Content Area - Con Scroll cuando sea necesario */}
        <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden relative">
          <div className="min-h-full max-w-[1920px] mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Modal de Recordatorio de Membresías */}
      <MembershipReminder
        isOpen={isReminderModalOpen}
        onClose={handleCloseReminder}
      />
    </div>
  );
};
