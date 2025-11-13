import { TrendingUp, Calendar, BarChart3, Filter } from 'lucide-react';
import { RefreshButton } from '../../../components/ui/RefreshButton';
import { PeriodSelector } from './PeriodSelector';
import { PeriodType } from '../types';
import { calculateDateRange } from '../utils/dateRangeHelpers';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DashboardHeaderProps {
  period: PeriodType;
  date: string;
  periodLabel: string;
  dateLabel: string;
  onPeriodChange: (period: PeriodType) => void;
  onDateChange: (date: string) => void;
  onRefresh: () => void;
  isRefetching: boolean;
}

export const DashboardHeader = ({
  period,
  date,
  periodLabel,
  dateLabel,
  onPeriodChange,
  onDateChange,
  onRefresh,
  isRefetching,
}: DashboardHeaderProps) => {
  // Calcular rango de fechas
  const dateRange = calculateDateRange(period, date);
  const startDate = format(new Date(dateRange.start_date), 'dd/MM/yyyy', { locale: es });
  const endDate = format(new Date(dateRange.end_date), 'dd/MM/yyyy', { locale: es });
  const dateRangeLabel = dateRange.start_date === dateRange.end_date 
    ? startDate 
    : `${startDate} - ${endDate}`;

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden">
      <div className="px-3 sm:px-4 py-2.5 sm:py-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Info de Período y Fecha */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md flex-shrink-0">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 rounded-lg border border-blue-200">
                <TrendingUp className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                <span className="text-[10px] sm:text-xs font-semibold text-blue-700 truncate">{periodLabel}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 rounded-lg border border-green-200">
                <Calendar className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                <span className="text-[10px] sm:text-xs font-semibold text-green-700 truncate">{dateRangeLabel}</span>
              </div>
            </div>
          </div>

          {/* Filtros y Botón - En línea */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Filtros Compactos Inline */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
              <Filter className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
              <PeriodSelector
                period={period}
                date={date}
                onPeriodChange={onPeriodChange}
                onDateChange={onDateChange}
                inline
              />
            </div>

            {/* Botón Actualizar */}
            <RefreshButton
              onClick={onRefresh}
              isRefetching={isRefetching}
              variant="primary"
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800 border-0 shadow-md font-semibold text-xs"
            />
          </div>
        </div>

        {/* Filtros para Mobile - Debajo */}
        <div className="lg:hidden mt-3 pt-3 border-t border-gray-200">
          <PeriodSelector
            period={period}
            date={date}
            onPeriodChange={onPeriodChange}
            onDateChange={onDateChange}
          />
        </div>
      </div>
    </div>
  );
};
