import { useEffect } from 'react';
import { initializeDashboard, useDashboardStore } from '@/store/dashboardStore';
import KPICards from '@/components/KPICards';
import TimePeriodSelector from '@/components/TimePeriodSelector';
import CampsiteHeatmap from '@/components/CampsiteHeatmap';
import VisitorLineChart from '@/components/VisitorLineChart';
import ConsumptionPieChart from '@/components/ConsumptionPieChart';
import LowPeriodAlert from '@/components/LowPeriodAlert';
import { RefreshCw } from 'lucide-react';

export default function Dashboard() {
  const { loading, refreshData, dashboardData } = useDashboardStore();

  useEffect(() => {
    initializeDashboard();
    const interval = setInterval(() => {
      refreshData();
    }, 30000);
    return () => clearInterval(interval);
  }, [refreshData]);

  const currentTime = new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative z-10 p-4 h-screen flex flex-col">
        <header className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              营地运营数据可视化大屏
            </h1>
            <p className="text-slate-400 text-sm mt-1">实时监控 · 智能分析 · 科学决策</p>
          </div>

          <div className="flex items-center gap-6">
            <LowPeriodAlert />
            <div className="text-right">
              <div className="text-xs text-slate-400">当前时间</div>
              <div className="text-cyan-400 font-mono text-lg">{currentTime}</div>
            </div>
            <div className="flex items-center gap-3">
              <TimePeriodSelector />
              <button
                onClick={refreshData}
                disabled={loading}
                className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition-colors disabled:opacity-50"
                title="刷新数据"
              >
                <RefreshCw className={`w-5 h-5 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </header>

        <KPICards />

        <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
          <div className="col-span-5">
            <CampsiteHeatmap />
          </div>

          <div className="col-span-4">
            <VisitorLineChart />
          </div>

          <div className="col-span-3">
            <ConsumptionPieChart />
          </div>
        </div>

        {dashboardData && (
          <footer className="mt-4 flex items-center justify-center gap-8 text-xs text-slate-500">
            <span>数据模块: 8806 (全量数据聚合)</span>
            <span>|</span>
            <span>展示模块: 3806 (可视化大屏)</span>
            <span>|</span>
            <span>数据更新间隔: 30秒</span>
          </footer>
        )}
      </div>
    </div>
  );
}
