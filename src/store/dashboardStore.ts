import { create } from 'zustand';
import type { TimePeriod, DashboardData, HourlyData } from '@/types';
import { aggregateDashboardData, getHourlyVisitorData } from '@/data/dataAggregator';

interface DashboardState {
  timePeriod: TimePeriod;
  dashboardData: DashboardData | null;
  hourlyData: HourlyData[];
  loading: boolean;
  selectedCampsite: string | null;
  setTimePeriod: (period: TimePeriod) => void;
  refreshData: () => void;
  setSelectedCampsite: (id: string | null) => void;
  isLowPeriod: (timeLabel: string) => boolean;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  timePeriod: 'week',
  dashboardData: null,
  hourlyData: [],
  loading: false,
  selectedCampsite: null,

  setTimePeriod: (period: TimePeriod) => {
    set({ timePeriod: period, loading: true, selectedCampsite: null });
    const data = aggregateDashboardData(period);
    const hourly = getHourlyVisitorData();
    set({ dashboardData: data, hourlyData: hourly, loading: false });
  },

  refreshData: () => {
    const { timePeriod } = get();
    set({ loading: true });
    const data = aggregateDashboardData(timePeriod);
    const hourly = getHourlyVisitorData();
    set({ dashboardData: data, hourlyData: hourly, loading: false });
  },

  setSelectedCampsite: (id: string | null) => {
    set({ selectedCampsite: id });
  },

  isLowPeriod: (timeLabel: string) => {
    const { dashboardData, hourlyData } = get();
    if (!dashboardData) return false;
    if (dashboardData.lowPeriods.includes(timeLabel)) return true;
    return hourlyData.some((h) => h.hour === timeLabel && h.isLowPeriod);
  },
}));

export const initializeDashboard = () => {
  const data = aggregateDashboardData('week');
  const hourly = getHourlyVisitorData();
  useDashboardStore.setState({
    dashboardData: data,
    hourlyData: hourly,
  });
};
