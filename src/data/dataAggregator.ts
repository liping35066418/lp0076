import type {
  TimePeriod,
  CampsiteData,
  DailyVisitorData,
  ConsumptionCategory,
  KPIData,
  DashboardData,
  HourlyData,
} from '@/types';

const CAMPSITE_NAMES = [
  '湖景A区', '山景B区', '草坪C区', '森林D区', '河畔E区',
  '星空F区', '日出G区', '日落H区', '松林I区', '花海J区',
  '溪谷K区', '岩石L区', '月光M区', '彩虹N区', '清风O区',
];

const CONSUMPTION_CATEGORIES = [
  { name: '帐篷租赁', color: '#5B8FF9' },
  { name: '烧烤食材', color: '#5AD8A6' },
  { name: '饮品', color: '#F6BD16' },
  { name: '休闲娱乐', color: '#E86452' },
  { name: '户外活动', color: '#6DC8EC' },
  { name: '其他', color: '#9270CA' },
];

const generateRandomValue = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const generateCampsites = (): CampsiteData[] => {
  const campsites: CampsiteData[] = [];
  const rows = 5;
  const cols = 3;
  let idx = 0;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (idx >= CAMPSITE_NAMES.length) break;
      const capacity = generateRandomValue(20, 50);
      const currentOccupancy = generateRandomValue(Math.floor(capacity * 0.3), capacity);
      const heat = Math.floor((currentOccupancy / capacity) * 100);

      campsites.push({
        id: `campsite-${idx}`,
        name: CAMPSITE_NAMES[idx],
        x: col * 100 + 50 + generateRandomValue(-15, 15),
        y: row * 80 + 40 + generateRandomValue(-10, 10),
        heat,
        capacity,
        currentOccupancy,
      });
      idx++;
    }
  }
  return campsites;
};

const generateWeeklyVisitors = (period: TimePeriod): DailyVisitorData[] => {
  const weekdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const data: DailyVisitorData[] = [];
  const today = new Date();

  let count = 7;
  if (period === 'month') count = 30;
  if (period === 'year') count = 12;

  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    let baseCount = generateRandomValue(150, 350);
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      baseCount = generateRandomValue(300, 500);
    }

    const isLowPeriod = baseCount < 200;
    const dateStr = period === 'year'
      ? `${date.getMonth() + 1}月`
      : `${date.getMonth() + 1}/${date.getDate()}`;

    data.push({
      date: dateStr,
      weekday: weekdays[dayOfWeek === 0 ? 6 : dayOfWeek - 1],
      visitorCount: baseCount,
      isLowPeriod,
    });
  }
  return data;
};

const generateHourlyData = (): HourlyData[] => {
  const data: HourlyData[] = [];
  for (let hour = 6; hour <= 22; hour++) {
    let count = generateRandomValue(10, 60);
    if (hour >= 11 && hour <= 14) count = generateRandomValue(40, 80);
    if (hour >= 17 && hour <= 20) count = generateRandomValue(50, 90);
    if (hour >= 6 && hour <= 8) count = generateRandomValue(5, 20);

    const isLowPeriod = count < 25;
    data.push({
      hour: `${hour.toString().padStart(2, '0')}:00`,
      visitorCount: count,
      isLowPeriod,
    });
  }
  return data;
};

const generateConsumption = (period: TimePeriod): ConsumptionCategory[] => {
  const multiplier = period === 'today' ? 1 : period === 'week' ? 7 : period === 'month' ? 30 : 365;
  const totalBase = generateRandomValue(8000, 15000) * multiplier;

  let remaining = totalBase;
  const categories: ConsumptionCategory[] = CONSUMPTION_CATEGORIES.map((cat, idx) => {
    let value: number;
    if (idx === CONSUMPTION_CATEGORIES.length - 1) {
      value = remaining;
    } else {
      const ratio = [0.35, 0.25, 0.18, 0.12, 0.07][idx];
      value = Math.floor(totalBase * ratio * (0.9 + Math.random() * 0.2));
      remaining -= value;
    }
    return {
      ...cat,
      value,
      percentage: Math.round((value / totalBase) * 1000) / 10,
    };
  });
  return categories;
};

const calculateKPI = (
  visitors: DailyVisitorData[],
  consumption: ConsumptionCategory[],
  campsites: CampsiteData[]
): KPIData => {
  const totalVisitors = visitors.reduce((sum, v) => sum + v.visitorCount, 0);
  const totalRevenue = consumption.reduce((sum, c) => sum + c.value, 0);
  const avgConsumption = totalVisitors > 0 ? Math.round(totalRevenue / totalVisitors) : 0;

  const totalCapacity = campsites.reduce((sum, c) => sum + c.capacity, 0);
  const totalOccupancy = campsites.reduce((sum, c) => sum + c.currentOccupancy, 0);
  const campsiteUtilization = totalCapacity > 0 ? Math.round((totalOccupancy / totalCapacity) * 100) : 0;

  return {
    totalVisitors,
    visitorGrowth: generateRandomValue(-5, 25),
    totalRevenue,
    revenueGrowth: generateRandomValue(-3, 30),
    avgConsumption,
    consumptionGrowth: generateRandomValue(-2, 15),
    campsiteUtilization,
    utilizationGrowth: generateRandomValue(-8, 20),
  };
};

const findLowPeriods = (visitors: DailyVisitorData[], hourlyData: HourlyData[]): string[] => {
  const lowPeriods: string[] = [];
  visitors.forEach((v) => {
    if (v.isLowPeriod) {
      lowPeriods.push(v.date);
    }
  });
  hourlyData.forEach((h) => {
    if (h.isLowPeriod && !lowPeriods.includes(h.hour)) {
      lowPeriods.push(h.hour);
    }
  });
  return lowPeriods;
};

export const aggregateDashboardData = (period: TimePeriod): DashboardData => {
  const campsites = generateCampsites();
  const weeklyVisitors = generateWeeklyVisitors(period);
  const consumption = generateConsumption(period);
  const hourlyData = generateHourlyData();
  const kpi = calculateKPI(weeklyVisitors, consumption, campsites);
  const lowPeriods = findLowPeriods(weeklyVisitors, hourlyData);

  return {
    kpi,
    campsites,
    weeklyVisitors,
    consumption,
    timePeriod: period,
    lowPeriods,
  };
};

export const getHourlyVisitorData = (): HourlyData[] => {
  return generateHourlyData();
};

export const calculateTotalMetrics = (data: DashboardData) => {
  const popularCampsite = [...data.campsites].sort((a, b) => b.heat - a.heat)[0];
  const peakDay = [...data.weeklyVisitors].sort((a, b) => b.visitorCount - a.visitorCount)[0];
  const topConsumption = [...data.consumption].sort((a, b) => b.value - a.value)[0];

  return {
    popularCampsite: popularCampsite?.name || '-',
    peakDay: peakDay?.date || '-',
    peakVisitors: peakDay?.visitorCount || 0,
    topConsumption: topConsumption?.name || '-',
    topConsumptionValue: topConsumption?.value || 0,
  };
};
