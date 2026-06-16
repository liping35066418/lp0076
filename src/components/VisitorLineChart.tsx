import ReactECharts from 'echarts-for-react';
import type { TooltipComponentFormatterCallbackParams } from 'echarts';
import type { DailyVisitorData, HourlyData } from '@/types';
import { useDashboardStore } from '@/store/dashboardStore';
import { TrendingUp } from 'lucide-react';

export default function VisitorLineChart() {
  const { dashboardData, hourlyData } = useDashboardStore();

  if (!dashboardData) {
    return (
      <div className="h-full bg-slate-800/40 rounded-xl animate-pulse" />
    );
  }

  const { weeklyVisitors, timePeriod } = dashboardData;
  const showHourly = timePeriod === 'today';

  const chartData: (DailyVisitorData | HourlyData)[] = showHourly ? hourlyData : weeklyVisitors;
  const xAxisData = chartData.map((d) => (showHourly ? (d as HourlyData).hour : (d as DailyVisitorData).date));
  const yAxisData = chartData.map((d) => d.visitorCount);
  const lowPeriodIndices = chartData
    .map((d, idx) => (d.isLowPeriod ? idx : -1))
    .filter((idx) => idx !== -1);

  const markPoints = lowPeriodIndices.length > 0 ? [{
    type: 'none' as const,
    data: lowPeriodIndices.map((idx: number) => ({
      xAxis: idx,
      yAxis: yAxisData[idx],
      value: '低峰',
      itemStyle: {
        color: '#fbbf24',
      },
    })),
  }] : [];

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: 'rgba(6, 182, 212, 0.3)',
      borderWidth: 1,
      textStyle: { color: '#fff', fontSize: 12 },
      axisPointer: {
        type: 'cross',
        lineStyle: {
          color: 'rgba(6, 182, 212, 0.5)',
          type: 'dashed',
        },
      },
      formatter: (params: TooltipComponentFormatterCallbackParams) => {
        const p = (params as TooltipComponentFormatterCallbackParams[])[0];
        const dataPoint = chartData[p.dataIndex as number];
        const isLow = dataPoint.isLowPeriod;
        return `
          <div class="font-bold text-cyan-400 mb-1">${p.name as string}</div>
          <div>客流: <span class="text-emerald-400">${p.value as number} 人次</span></div>
          ${isLow ? '<div class="text-amber-400 mt-1">⚠️ 低峰时段</div>' : ''}
        `;
      },
    },
    grid: {
      top: 30,
      right: 20,
      bottom: 30,
      left: 50,
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      axisLine: {
        lineStyle: { color: '#334155' },
      },
      axisLabel: {
        color: '#94a3b8',
        fontSize: 10,
        rotate: showHourly ? 45 : 0,
        formatter: (value: string, idx: number) => {
          const d = chartData[idx];
          const isLow = showHourly ? d?.isLowPeriod : d?.isLowPeriod;
          return isLow ? `{low|${value}}` : value;
        },
        rich: {
          low: {
            color: '#fbbf24',
            fontWeight: 'bold',
            backgroundColor: 'rgba(251, 191, 36, 0.15)',
            padding: [2, 4],
            borderRadius: 3,
          },
        },
      },
    },
    yAxis: {
      type: 'value',
      name: '人次',
      nameTextStyle: {
        color: '#64748b',
        fontSize: 10,
      },
      axisLine: {
        show: false,
      },
      axisLabel: {
        color: '#94a3b8',
        fontSize: 10,
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(51, 65, 85, 0.5)',
          type: 'dashed',
        },
      },
    },
    series: [
      {
        name: '客流',
        type: 'line',
        smooth: true,
        data: yAxisData,
        lineStyle: {
          width: 3,
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: '#06b6d4' },
              { offset: 1, color: '#3b82f6' },
            ],
          },
          shadowColor: 'rgba(6, 182, 212, 0.5)',
          shadowBlur: 10,
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(6, 182, 212, 0.4)' },
              { offset: 1, color: 'rgba(6, 182, 212, 0.02)' },
            ],
          },
        },
        itemStyle: {
          color: (params: TooltipComponentFormatterCallbackParams) => {
            const d = chartData[params.dataIndex as number];
            const isLow = d?.isLowPeriod;
            return isLow ? '#fbbf24' : '#06b6d4';
          },
          borderWidth: 2,
          borderColor: '#0f172a',
        },
        markPoint: markPoints.length > 0 ? markPoints[0] : undefined,
      },
    ],
  };

  const totalVisitors = yAxisData.reduce((a: number, b: number) => a + b, 0);
  const avgVisitors = Math.round(totalVisitors / yAxisData.length);
  const peakVisitors = Math.max(...yAxisData);
  const peakIdx = yAxisData.indexOf(peakVisitors);
  const peakLabel = xAxisData[peakIdx];

  return (
    <div className="h-full bg-slate-800/40 backdrop-blur-sm rounded-xl border border-slate-700/50 flex flex-col">
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-700/30">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          <h3 className="font-semibold text-white">
            {showHourly ? '今日分时客流' : '客流变化趋势'}
          </h3>
        </div>
        {lowPeriodIndices.length > 0 && (
          <div className="text-xs px-2 py-1 bg-amber-500/20 text-amber-400 rounded">
            {lowPeriodIndices.length} 个低峰时段
          </div>
        )}
      </div>
      <div className="flex-1 p-2">
        <ReactECharts
          option={option}
          style={{ height: '100%', width: '100%' }}
          opts={{ renderer: 'canvas' }}
        />
      </div>
      <div className="px-5 py-3 border-t border-slate-700/30 grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-xs text-slate-500">累计客流</div>
          <div className="text-lg font-bold text-cyan-400">{totalVisitors}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-slate-500">峰值时段</div>
          <div className="text-lg font-bold text-emerald-400">{peakLabel}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-slate-500">平均客流</div>
          <div className="text-lg font-bold text-amber-400">{avgVisitors}</div>
        </div>
      </div>
    </div>
  );
}
