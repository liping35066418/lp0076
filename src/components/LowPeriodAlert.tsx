import { useDashboardStore } from '@/store/dashboardStore';
import { AlertTriangle } from 'lucide-react';

export default function LowPeriodAlert() {
  const { dashboardData } = useDashboardStore();

  if (!dashboardData || dashboardData.lowPeriods.length === 0) {
    return null;
  }

  const lowPeriods = dashboardData.lowPeriods.slice(0, 5);

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/40 rounded-lg">
      <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />
      <div className="text-sm">
        <span className="text-amber-400 font-medium">低峰时段提示:</span>
        <span className="text-amber-200 ml-2">
          {lowPeriods.join('、')}
          {dashboardData.lowPeriods.length > 5 && ' 等'}
        </span>
      </div>
    </div>
  );
}
