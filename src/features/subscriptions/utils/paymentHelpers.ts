import { format, parseISO, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import { Payment, PaymentMethod, PaymentStats, SubscriptionStatus } from '../api/types';
import { Subscription } from '../api/types';
import { PAYMENT_METHOD_CONFIG, CURRENCY_CONFIG } from '../constants/subscriptionConstants';
import { isSubscriptionExpired } from './subscriptionHelpers';

// Payment Helper Functions

/**
 * Format currency amount for display
 */
export const formatCurrency = (amount: string | number): string => {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numericAmount)) return 'Monto inválido';

  return new Intl.NumberFormat(CURRENCY_CONFIG.locale, {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: CURRENCY_CONFIG.decimals,
    maximumFractionDigits: CURRENCY_CONFIG.decimals,
  }).format(numericAmount);
};

/**
 * Format payment date for display
 */
export const formatPaymentDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return 'Fecha inválida';
    return format(date, 'dd/MM/yyyy HH:mm', { locale: es });
  } catch {
    return 'Fecha inválida';
  }
};

/**
 * Get payment method display info
 */
export const getPaymentMethodInfo = (method: PaymentMethod) => {
  return PAYMENT_METHOD_CONFIG[method] || PAYMENT_METHOD_CONFIG[PaymentMethod.CASH];
};

/**
 * Calculate total amount from payments array
 */
export const calculateTotalPayments = (payments: Payment[]): number => {
  return payments.reduce((total, payment) => {
    const amount = parseFloat(payment.amount);
    return total + (isNaN(amount) ? 0 : amount);
  }, 0);
};

/**
 * Calculate remaining debt
 */
export const calculateRemainingDebt = (
  subscriptionPrice: number,
  totalPaid: number
): number => {
  return Math.max(0, subscriptionPrice - totalPaid);
};

/**
 * Check if subscription is fully paid
 */
export const isSubscriptionFullyPaid = (
  paymentStats?: PaymentStats
): boolean => {
  if (!paymentStats) return false;
  const remainingDebt = parseFloat(paymentStats.remaining_debt || '0');
  return remainingDebt <= 0;
};

/**
 * Check if payment can be made for a subscription
 */
export const canMakePayment = (
  subscription: Subscription,
  paymentStats?: PaymentStats
): { canPay: boolean; reason?: string } => {
  // Check if subscription is cancelled
  if (subscription.status === SubscriptionStatus.CANCELED) {
    return {
      canPay: false,
      reason: 'No se pueden registrar pagos en suscripciones canceladas',
    };
  }



  // Check if subscription is fully paid
  if (isSubscriptionFullyPaid(paymentStats)) {
    return {
      canPay: false,
      reason: 'La suscripción ya está completamente pagada',
    };
  }

  // Only allow payments for active or pending_payment subscriptions
  const allowedStatuses = [
    SubscriptionStatus.ACTIVE,
    SubscriptionStatus.PENDING_PAYMENT,
    SubscriptionStatus.EXPIRED,
  ];

  if (!allowedStatuses.includes(subscription.status)) {
    return {
      canPay: false,
      reason: `No se pueden registrar pagos en suscripciones con estado: ${subscription.status}`,
    };
  }

  return { canPay: true };
};

/**
 * Check if payment is recent (within last 24 hours)
 */
export const isRecentPayment = (payment: Payment): boolean => {
  const paymentDate = parseISO(payment.payment_date);
  const now = new Date();
  const hoursDiff = (now.getTime() - paymentDate.getTime()) / (1000 * 60 * 60);

  return hoursDiff <= 24;
};

/**
 * Sort payments by date (newest first)
 */
export const sortPaymentsByDate = (payments: Payment[]): Payment[] => {
  return [...payments].sort((a, b) =>
    new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()
  );
};

/**
 * Group payments by month
 */
export const groupPaymentsByMonth = (payments: Payment[]): Record<string, Payment[]> => {
  return payments.reduce((groups, payment) => {
    const date = parseISO(payment.payment_date);
    const monthKey = format(date, 'yyyy-MM', { locale: es });

    if (!groups[monthKey]) {
      groups[monthKey] = [];
    }

    groups[monthKey].push(payment);
    return groups;
  }, {} as Record<string, Payment[]>);
};

/**
 * Get payment statistics from payments array
 */
export const calculatePaymentStats = (payments: Payment[]): {
  totalPayments: number;
  totalAmount: number;
  averageAmount: number;
  lastPaymentDate?: string;
} => {
  if (payments.length === 0) {
    return {
      totalPayments: 0,
      totalAmount: 0,
      averageAmount: 0,
    };
  }

  const totalAmount = calculateTotalPayments(payments);
  const sortedPayments = sortPaymentsByDate(payments);

  return {
    totalPayments: payments.length,
    totalAmount,
    averageAmount: totalAmount / payments.length,
    lastPaymentDate: sortedPayments[0]?.payment_date,
  };
};

/**
 * Validate payment amount - only integers allowed
 */
export const validatePaymentAmount = (
  amount: string,
  maxAmount?: number,
  remainingDebt?: number
): {
  isValid: boolean;
  error?: string;
} => {
  // Check if it's a valid number
  if (!amount || amount.trim() === '') {
    return {
      isValid: false,
      error: 'Debe ingresar un monto',
    };
  }

  // Check if it's a valid integer (no decimals)
  const numericAmount = parseFloat(amount);

  if (isNaN(numericAmount)) {
    return {
      isValid: false,
      error: 'El monto debe ser un número válido',
    };
  }

  // Check if it's an integer
  if (!Number.isInteger(numericAmount)) {
    return {
      isValid: false,
      error: 'El monto debe ser un número entero (sin decimales)',
    };
  }

  if (numericAmount <= 0) {
    return {
      isValid: false,
      error: 'El monto debe ser mayor a 0',
    };
  }

  // Use remainingDebt if available (more accurate), otherwise use maxAmount
  const maxAllowed = remainingDebt !== undefined ? remainingDebt : (maxAmount || Infinity);

  if (numericAmount > maxAllowed) {
    const maxFormatted = formatCurrency(maxAllowed);
    return {
      isValid: false,
      error: `El monto no puede exceder ${maxFormatted}`,
    };
  }

  return { isValid: true };
};

/**
 * Get payment method icon
 */
export const getPaymentMethodIcon = (method: PaymentMethod): string => {
  return getPaymentMethodInfo(method).icon;
};

/**
 * Get payment method color
 */
export const getPaymentMethodColor = (method: PaymentMethod): string => {
  return getPaymentMethodInfo(method).color;
};

/**
 * Calculate payment progress percentage
 */
export const calculatePaymentProgress = (
  totalPaid: number,
  totalRequired: number
): number => {
  if (totalRequired <= 0) return 100;

  const progress = Math.min(Math.max((totalPaid / totalRequired) * 100, 0), 100);
  return Math.round(progress);
};

/**
 * Check if payment is overdue
 */
export const isPaymentOverdue = (
  subscriptionEndDate: string,
  daysGracePeriod: number = 7
): boolean => {
  const endDate = parseISO(subscriptionEndDate);
  const gracePeriodEnd = new Date(endDate);
  gracePeriodEnd.setDate(gracePeriodEnd.getDate() + daysGracePeriod);

  return new Date() > gracePeriodEnd;
};

/**
 * Get payment status based on subscription and payments
 */
export const getPaymentStatus = (
  subscription: { status: string; end_date: string },
  payments: Payment[],
  requiredAmount: number
): 'paid' | 'partial' | 'overdue' | 'pending' => {
  const totalPaid = calculateTotalPayments(payments);

  if (totalPaid >= requiredAmount) {
    return 'paid';
  }

  if (totalPaid > 0) {
    return 'partial';
  }

  if (isPaymentOverdue(subscription.end_date)) {
    return 'overdue';
  }

  return 'pending';
};
