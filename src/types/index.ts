export type TimePeriod = 'today' | 'week' | 'month' | 'year';

export interface CampsiteData {
  id: string;
  name: string;
  x: number;
  y: number;
  heat: number;
  capacity: number;
  currentOccupancy: number;
}

export interface DailyVisitorData {
  date: string;
  weekday: string;
  visitorCount: number;
  isLowPeriod: boolean;
}

export interface ConsumptionCategory {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

export interface KPIData {
  totalVisitors: number;
  visitorGrowth: number;
  totalRevenue: number;
  revenueGrowth: number;
  avgConsumption: number;
  consumptionGrowth: number;
  campsiteUtilization: number;
  utilizationGrowth: number;
}

export interface DashboardData {
  kpi: KPIData;
  campsites: CampsiteData[];
  weeklyVisitors: DailyVisitorData[];
  consumption: ConsumptionCategory[];
  campsiteConsumption: Record<string, ConsumptionCategory[]>;
  timePeriod: TimePeriod;
  lowPeriods: string[];
}

export interface HourlyData {
  hour: string;
  visitorCount: number;
  isLowPeriod: boolean;
}
