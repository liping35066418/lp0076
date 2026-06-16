import { useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import type { TooltipComponentFormatterCallbackParams } from 'echarts';
import { useDashboardStore } from '@/store/dashboardStore';
import { calculateTotalMetrics } from '@/data/dataAggregator';
import { MapPin } from 'lucide-react';

export default function CampsiteHeatmap() {
  const { dashboardData, selectedCampsite, setSelectedCampsite } = useDashboardStore();
  const chartRef = useRef<ReactECharts>(null);

  if (!dashboardData) {
    return (
      <div className="h-full bg-slate-800/40 rounded-xl animate-pulse" />
    );
  }

  const { campsites } = dashboardData;
  const metrics = calculateTotalMetrics(dashboardData);

  const heatmapData = campsites.map((c) => ({
    value: [c.x, c.y, c.heat, c.currentOccupancy, c.capacity],
    campsiteId: c.id,
    campsiteName: c.name,
  }));

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: 'rgba(6, 182, 212, 0.3)',
      borderWidth: 1,
      textStyle: { color: '#fff', fontSize: 12 },
      formatter: (params: TooltipComponentFormatterCallbackParams) => {
        const p = params as unknown as { data: { value: number[]; campsiteId: string; campsiteName: string } };
        const item = p.data;
        const [, , heat, occupancy, capacity] = item.value;
        return `
          <div class="font-bold text-cyan-400 mb-1">${item.campsiteName}</div>
          <div>热度: <span class="text-amber-400">${heat}%</span></div>
          <div>入住: <span class="text-emerald-400">${occupancy}/${capacity}</span></div>
        `;
      },
    },
    grid: {
      top: 10,
      right: 10,
      bottom: 10,
      left: 10,
    },
    xAxis: {
      type: 'value',
      min: 0,
      max: 300,
      show: false,
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 400,
      show: false,
    },
    visualMap: {
      min: 0,
      max: 100,
      calculable: true,
      orient: 'vertical',
      right: 10,
      top: 'center',
      inRange: {
        color: ['#1e3a5f', '#0ea5e9', '#22c55e', '#eab308', '#ef4444'],
      },
      textStyle: {
        color: '#94a3b8',
        fontSize: 10,
      },
    },
    series: [
      {
        name: '营位热度',
        type: 'effectScatter',
        data: heatmapData.map((item) => ({
          value: item.value,
          campsiteId: item.campsiteId,
          campsiteName: item.campsiteName,
          symbolSize: selectedCampsite === item.campsiteId
            ? Math.max(15, item.value[2] * 0.5) * 1.5
            : Math.max(15, item.value[2] * 0.5),
          itemStyle: selectedCampsite && selectedCampsite !== item.campsiteId
            ? { opacity: 0.35, shadowBlur: 0 }
            : selectedCampsite === item.campsiteId
              ? { opacity: 1, shadowBlur: 30, shadowColor: 'rgba(6, 182, 212, 0.8)', borderColor: '#22d3ee', borderWidth: 3 }
              : {},
          label: {
            show: true,
            formatter: () => item.campsiteName,
            position: 'top' as const,
            fontSize: selectedCampsite === item.campsiteId ? 13 : 10,
            color: selectedCampsite === item.campsiteId ? '#22d3ee' : '#e2e8f0',
            fontWeight: selectedCampsite === item.campsiteId ? 'bold' : 'normal',
          },
        })),
        showEffectOn: selectedCampsite ? 'render' : 'emphasis',
        rippleEffect: {
          brushType: 'stroke',
          scale: selectedCampsite ? 6 : 4,
        },
        itemStyle: {
          shadowBlur: 20,
          shadowColor: 'rgba(6, 182, 212, 0.5)',
        },
      },
    ],
  };

  const onChartClick = (params: TooltipComponentFormatterCallbackParams) => {
    const p = params as unknown as { data?: { campsiteId: string } };
    if (!p.data) {
      setSelectedCampsite(null);
      return;
    }
    if (selectedCampsite === p.data.campsiteId) {
      setSelectedCampsite(null);
    } else {
      setSelectedCampsite(p.data.campsiteId);
    }
  };

  const onZrClick = (params: { target?: unknown }) => {
    if (!params.target && selectedCampsite) {
      setSelectedCampsite(null);
    }
  };

  const selectedCampsiteName = selectedCampsite
    ? campsites.find((c) => c.id === selectedCampsite)?.name
    : null;

  return (
    <div className="h-full bg-slate-800/40 backdrop-blur-sm rounded-xl border border-slate-700/50 flex flex-col">
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-700/30">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-cyan-400" />
          <h3 className="font-semibold text-white">营地营位热度分布</h3>
          {selectedCampsiteName && (
            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              {selectedCampsiteName}
            </span>
          )}
        </div>
        <div className="text-xs text-slate-400">
          最热门: <span className="text-amber-400 font-medium">{metrics.popularCampsite}</span>
        </div>
      </div>
      <div className="flex-1 p-2">
        <ReactECharts
          ref={chartRef}
          option={option}
          style={{ height: '100%', width: '100%' }}
          opts={{ renderer: 'canvas' }}
          onEvents={{
            click: onChartClick,
            'zr:click': onZrClick,
          }}
        />
      </div>
      <div className="px-5 py-3 border-t border-slate-700/30 grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-xs text-slate-500">营位总数</div>
          <div className="text-lg font-bold text-cyan-400">{campsites.length}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-slate-500">总容量</div>
          <div className="text-lg font-bold text-emerald-400">
            {campsites.reduce((s, c) => s + c.capacity, 0)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-slate-500">当前入住</div>
          <div className="text-lg font-bold text-amber-400">
            {campsites.reduce((s, c) => s + c.currentOccupancy, 0)}
          </div>
        </div>
      </div>
    </div>
  );
}
