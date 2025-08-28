import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  changeLabel?: string;
  iconColor?: string;
  iconBgColor?: string;
}

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  change, 
  changeLabel, 
  iconColor = "text-primary",
  iconBgColor = "bg-blue-100"
}: StatsCardProps) {
  return (
    <div className="bg-surface p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium" data-testid={`stat-title-${title.toLowerCase().replace(/\s+/g, '-')}`}>
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 mt-1" data-testid={`stat-value-${title.toLowerCase().replace(/\s+/g, '-')}`}>
            {value}
          </p>
        </div>
        <div className={`w-12 h-12 ${iconBgColor} rounded-lg flex items-center justify-center`}>
          <Icon className={`${iconColor} text-xl`} />
        </div>
      </div>
      {change && (
        <div className="mt-4 flex items-center text-sm">
          <span className="text-secondary font-medium" data-testid={`stat-change-${title.toLowerCase().replace(/\s+/g, '-')}`}>
            {change}
          </span>
          {changeLabel && (
            <span className="text-gray-600 ml-2" data-testid={`stat-change-label-${title.toLowerCase().replace(/\s+/g, '-')}`}>
              {changeLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
