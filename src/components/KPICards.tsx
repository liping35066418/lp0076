import { useDashboardStore } from '@/store/dashboardStore';
import { Users, DollarSign, TrendingUp, Tent } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  growth: number | null;
  icon: React.ReactNode;
  iconBg: string;
  filtered?: boolean;
  filterLabel?: string;
}

const KPICard = ({ title, value, growth, icon, iconBg, filtered, filterLabel }: KPICardProps) => {
  const isPositive = (growth ?? 0) >= 0;
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className={`relative backdrop-blur-sm rounded-xl p-5 border transition-all ${
        filtered
          ? 'bg-slate-800/80 border-cyan-500/40 shadow-lg shadow-cyan-500/10'
          : 'bg-slate-800/60 border-slate-700/50 hover:border-cyan-500/30'
      }`}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-slate-400 text-sm mb-1 flex items-center gap-1.5">
              {title}
              {filtered && filterLabel && (
                <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  {filterLabel}
                </span>
              )}
            </p>
            <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
          </div>
          <div className={`p-3 rounded-lg ${iconBg}`}>
            {icon}
          </div>
        </div>
        {growth !== null && (
          <div className="flex items-center gap-1 mt-3">
            <span className={`text-sm font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {isPositive ? '↑' : '↓'} {Math.abs(growth)}%
            </span>
            <span className="text-slate-500 text-sm">较上一周期</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default function KPICards() {
  const { dashboardData, selectedCampsite } = useDashboardStore();

  if (!dashboardData) {
    return (
      <div className="grid grid-cols-4 gap-4 mb-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-slate-800/40 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  const { kpi, campsiteConsumption, campsites } = dashboardData;

  const formatNumber = (num: number): string => {
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + '万';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toLocaleString();
  };

  const selectedCampsiteData = selectedCampsite
    ? campsites.find((c) => c.id === selectedCampsite)
    : null;

  const selectedConsumption = selectedCampsite && campsiteConsumption[selectedCampsite]
    ? campsiteConsumption[selectedCampsite]
    : null;

  const filterLabel = selectedCampsiteData?.name || null;

  let cards: KPICardProps[];

  if (selectedCampsiteData && selectedConsumption) {
    const campsiteRevenue = selectedConsumption.reduce((s, c) => s + c.value, 0);
    const campsiteOccupancy = selectedCampsiteData.currentOccupancy;
    const campsiteCapacity = selectedCampsiteData.capacity;
    const campsiteAvgConsumption = campsiteOccupancy > 0
      ? Math.round(campsiteRevenue / campsiteOccupancy)
      : 0;
    const campsiteUtilization = campsiteCapacity > 0
      ? Math.round((campsiteOccupancy / campsiteCapacity) * 100)
      : 0;

    cards = [
      {
        title: '营位入住',
        value: `${campsiteOccupancy}/${campsiteCapacity}`,
        growth: null,
        icon: <Users className="w-6 h-6 text-cyan-400" />,
        iconBg: 'bg-cyan-500/20',
        filtered: true,
        filterLabel,
      },
      {
        title: '营位营收',
        value: '¥' + formatNumber(campsiteRevenue),
        growth: null,
        icon: <DollarSign className="w-6 h-6 text-emerald-400" />,
        iconBg: 'bg-emerald-500/20',
        filtered: true,
        filterLabel,
      },
      {
        title: '人均消费',
        value: '¥' + campsiteAvgConsumption,
        growth: null,
        icon: <TrendingUp className="w-6 h-6 text-amber-400" />,
        iconBg: 'bg-amber-500/20',
        filtered: true,
        filterLabel,
      },
      {
        title: '营位利用率',
        value: campsiteUtilization + '%',
        growth: null,
        icon: <Tent className="w-6 h-6 text-purple-400" />,
        iconBg: 'bg-purple-500/20',
        filtered: true,
        filterLabel,
      },
    ];
  } else {
    cards = [
      {
        title: '总客流人次',
        value: formatNumber(kpi.totalVisitors),
        growth: kpi.visitorGrowth,
        icon: <Users className="w-6 h-6 text-cyan-400" />,
        iconBg: 'bg-cyan-500/20',
      },
      {
        title: '总营业收入',
        value: '¥' + formatNumber(kpi.totalRevenue),
        growth: kpi.revenueGrowth,
        icon: <DollarSign className="w-6 h-6 text-emerald-400" />,
        iconBg: 'bg-emerald-500/20',
      },
      {
        title: '人均消费',
        value: '¥' + kpi.avgConsumption,
        growth: kpi.consumptionGrowth,
        icon: <TrendingUp className="w-6 h-6 text-amber-400" />,
        iconBg: 'bg-amber-500/20',
      },
      {
        title: '营位利用率',
        value: kpi.campsiteUtilization + '%',
        growth: kpi.utilizationGrowth,
        icon: <Tent className="w-6 h-6 text-purple-400" />,
        iconBg: 'bg-purple-500/20',
      },
    ];
  }

  return (
    <div className="grid grid-cols-4 gap-4 mb-4">
      {cards.map((card, idx) => (
        <KPICard key={idx} {...card} />
      ))}
    </div>
  );
}
