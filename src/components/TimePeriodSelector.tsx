import { useDashboardStore } from '@/store/dashboardStore';
import type { TimePeriod } from '@/types';

const PERIODS: { value: TimePeriod; label: string }[] = [
  { value: 'today', label: '今日' },
  { value: 'week', label: '本周' },
  { value: 'month', label: '本月' },
  { value: 'year', label: '全年' },
];

export default function TimePeriodSelector() {
  const { timePeriod, setTimePeriod } = useDashboardStore();

  return (
    <div className="flex bg-slate-800/60 backdrop-blur-sm rounded-lg p-1 border border-slate-700/50">
      {PERIODS.map((period) => (
        <button
          key={period.value}
          onClick={() => setTimePeriod(period.value)}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
            timePeriod === period.value
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
}
