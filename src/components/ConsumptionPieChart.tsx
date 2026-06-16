import ReactECharts from 'echarts-for-react';
import type { TooltipComponentFormatterCallbackParams } from 'echarts';
import { useDashboardStore } from '@/store/dashboardStore';
import { PieChart } from 'lucide-react';

export default function ConsumptionPieChart() {
  const { dashboardData, selectedCampsite } = useDashboardStore();

  if (!dashboardData) {
    return (
      <div className="h-full bg-slate-800/40 rounded-xl animate-pulse" />
    );
  }

  const { consumption, campsiteConsumption, campsites } = dashboardData;

  const activeConsumption = selectedCampsite && campsiteConsumption[selectedCampsite]
    ? campsiteConsumption[selectedCampsite]
    : consumption;

  const selectedCampsiteName = selectedCampsite
    ? campsites.find((c) => c.id === selectedCampsite)?.name
    : null;

  const total = activeConsumption.reduce((s, c) => s + c.value, 0);

  const pieData = activeConsumption.map((c) => ({
    name: c.name,
    value: c.value,
    itemStyle: { color: c.color },
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
        const p = params as unknown as { value: number; color: string; name: string };
        const percent = ((p.value / total) * 100).toFixed(1);
        return `
          <div class="font-bold mb-1" style="color:${p.color}">${p.name}</div>
          <div>金额: <span class="text-white">¥${p.value.toLocaleString()}</span></div>
          <div>占比: <span class="text-cyan-400">${percent}%</span></div>
        `;
      },
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 8,
      textStyle: {
        color: '#94a3b8',
        fontSize: 11,
      },
      formatter: (name: string) => {
        const item = activeConsumption.find((c) => c.name === name);
        return `${name}  ${item?.percentage}%`;
      },
    },
    series: [
      {
        name: '消费构成',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#0f172a',
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
            color: '#fff',
            formatter: (params: TooltipComponentFormatterCallbackParams) => {
              const p = params as unknown as { value: number; name: string };
              const percent = ((p.value / total) * 100).toFixed(1);
              return `{name|${p.name}}\n{value|¥${p.value.toLocaleString()}}\n{percent|${percent}%}`;
            },
            rich: {
              name: {
                fontSize: 12,
                color: '#94a3b8',
                padding: [0, 0, 5, 0],
              },
              value: {
                fontSize: 18,
                fontWeight: 'bold',
                color: '#fff',
                padding: [0, 0, 3, 0],
              },
              percent: {
                fontSize: 14,
                color: '#06b6d4',
              },
            },
          },
          itemStyle: {
            shadowBlur: 20,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
        labelLine: {
          show: false,
        },
        data: pieData,
      },
    ],
  };

  const sortedConsumption = [...activeConsumption].sort((a, b) => b.value - a.value);
  const topCategory = sortedConsumption[0];

  return (
    <div className="h-full bg-slate-800/40 backdrop-blur-sm rounded-xl border border-slate-700/50 flex flex-col">
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-700/30">
        <div className="flex items-center gap-2">
          <PieChart className="w-4 h-4 text-cyan-400" />
          <h3 className="font-semibold text-white">消费构成分析</h3>
          {selectedCampsiteName && (
            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              {selectedCampsiteName}
            </span>
          )}
        </div>
      </div>
      <div className="flex-1 p-2">
        <ReactECharts
          option={option}
          style={{ height: '100%', width: '100%' }}
          opts={{ renderer: 'canvas' }}
        />
      </div>
      <div className="px-5 py-3 border-t border-slate-700/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-500">{selectedCampsite ? '营位消费金额' : '总消费金额'}</span>
          <span className="text-xl font-bold text-emerald-400">¥{total.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">最高消费项</span>
          <span className="text-sm font-medium" style={{ color: topCategory?.color }}>
            {topCategory?.name} ({topCategory?.percentage}%)
          </span>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-700/30">
          <div className="text-xs text-slate-500 mb-2">消费排行</div>
          <div className="space-y-1.5">
            {sortedConsumption.slice(0, 3).map((item, idx) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-4 h-4 flex items-center justify-center text-xs rounded bg-slate-700/50 text-slate-400">
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
                <span className="text-xs text-slate-400 w-10 text-right">
                  ¥{(item.value / 1000).toFixed(0)}k
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
