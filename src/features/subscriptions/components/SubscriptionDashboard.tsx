import React from 'react';
import { Card } from '../../../components/ui/Card';
import { useSubscriptionStats } from '../hooks/useSubscriptions';
import { CheckCircle, AlertTriangle, XCircle, Clock, Calendar } from 'lucide-react';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';

export const SubscriptionDashboard: React.FC = () => {
    const { data: stats, isLoading, isError } = useSubscriptionStats();

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="p-4 h-24 flex items-center justify-center">
                        <LoadingSpinner size="sm" />
                    </Card>
                ))}
            </div>
        );
    }

    if (isError || !stats) {
        return null; // O mostrar mensaje de error discreto
    }

    const cards = [
        {
            title: 'Activas',
            value: stats.active_count,
            icon: CheckCircle,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-100',
        },
        {
            title: 'Vencen Hoy',
            value: stats.expiring_today_count,
            icon: AlertTriangle,
            color: 'text-amber-600',
            bgColor: 'bg-amber-50',
            borderColor: 'border-amber-100',
        },
        {
            title: 'Próximas a Vencer',
            value: stats.expiring_soon_count,
            icon: Clock,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-100',
            subtitle: 'En 7 días',
        },
        {
            title: 'Expiradas',
            value: stats.expired_count,
            icon: XCircle,
            color: 'text-red-600',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-100',
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
            {cards.map((card, index) => (
                <Card
                    key={index}
                    className={`p-3 md:p-4 border ${card.borderColor} ${card.bgColor} relative overflow-hidden`}
                >
                    <div className="flex justify-between items-start z-10 relative">
                        <div className="min-w-0">
                            <p className="text-xs md:text-sm font-medium text-gray-600 truncate">{card.title}</p>
                            <div className="flex flex-col md:flex-row md:items-baseline gap-0 md:gap-2 mt-1">
                                <h3 className={`text-xl md:text-2xl font-bold ${card.color}`}>
                                    {card.value}
                                </h3>
                                {card.subtitle && (
                                    <span className="text-[10px] md:text-xs text-gray-500">{card.subtitle}</span>
                                )}
                            </div>
                        </div>
                        <div className={`p-1.5 md:p-2 rounded-lg ${card.color} bg-white/60 flex-shrink-0 ml-2`}>
                            <card.icon className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
};
