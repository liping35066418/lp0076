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

const OCCUPANCY_RANGE: Record<TimePeriod, { min: number; max: number }> = {
  today: { min: 0.2, max: 0.6 },
  week: { min: 0.35, max: 0.75 },
  month: { min: 0.45, max: 0.85 },
  year: { min: 0.55, max: 0.95 },
};

const generateCampsites = (period: TimePeriod): CampsiteData[] => {
  const campsites: CampsiteData[] = [];
  const rows = 5;
  const cols = 3;
  let idx = 0;
  const range = OCCUPANCY_RANGE[period];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (idx >= CAMPSITE_NAMES.length) break;
      const capacity = generateRandomValue(20, 50);
      const occupancyRate = range.min + Math.random() * (range.max - range.min);
      const currentOccupancy = Math.min(capacity, Math.floor(capacity * occupancyRate));
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

const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

const generateWeeklyVisitors = (period: TimePeriod): DailyVisitorData[] => {
  const weekdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const data: DailyVisitorData[] = [];
  const today = new Date();

  if (period === 'year') {
    const currentYear = today.getFullYear();
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(currentYear, today.getMonth() - i, 1);
      const year = monthDate.getFullYear();
      const month = monthDate.getMonth();
      const daysInMonth = getDaysInMonth(year, month);

      const dailyAvg = generateRandomValue(200, 400);
      const weekendBoost = generateRandomValue(0, 100);
      const monthlyTotal = Math.floor((dailyAvg + weekendBoost) * daysInMonth * (0.9 + Math.random() * 0.2));

      const dayOfWeek = monthDate.getDay();
      const isLowPeriod = monthlyTotal < daysInMonth * 200;
      const dateStr = `${month + 1}月`;

      data.push({
        date: dateStr,
        weekday: weekdays[dayOfWeek === 0 ? 6 : dayOfWeek - 1],
        visitorCount: monthlyTotal,
        isLowPeriod,
      });
    }
    return data;
  }

  let count = 7;
  if (period === 'today') count = 1;
  if (period === 'month') count = 30;

  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    let baseCount = generateRandomValue(150, 350);
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      baseCount = generateRandomValue(300, 500);
    }

    const isLowPeriod = baseCount < 200;
    const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;

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

const generateConsumptionForCampsite = (
  period: TimePeriod,
  occupancy: number,
  capacity: number
): ConsumptionCategory[] => {
  const multiplier = period === 'today' ? 1 : period === 'week' ? 7 : period === 'month' ? 30 : 365;
  const occupancyRatio = capacity > 0 ? occupancy / capacity : 0.5;
  const basePerPerson = generateRandomValue(80, 200);
  const totalBase = Math.floor(occupancy * basePerPerson * multiplier * (0.8 + Math.random() * 0.4));

  let remaining = totalBase;
  const categories: ConsumptionCategory[] = CONSUMPTION_CATEGORIES.map((cat, idx) => {
    let value: number;
    if (idx === CONSUMPTION_CATEGORIES.length - 1) {
      value = remaining;
    } else {
      const ratio = [0.35, 0.25, 0.18, 0.12, 0.07][idx];
      value = Math.floor(totalBase * ratio * (0.85 + Math.random() * 0.3));
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

const generateCampsiteConsumption = (
  period: TimePeriod,
  campsites: CampsiteData[]
): Record<string, ConsumptionCategory[]> => {
  const result: Record<string, ConsumptionCategory[]> = {};
  for (const campsite of campsites) {
    result[campsite.id] = generateConsumptionForCampsite(
      period,
      campsite.currentOccupancy,
      campsite.capacity
    );
  }
  return result;
};

const aggregateConsumptionFromCampsites = (
  campsiteConsumption: Record<string, ConsumptionCategory[]>
): ConsumptionCategory[] => {
  const allIds = Object.keys(campsiteConsumption);
  if (allIds.length === 0) return [];

  return CONSUMPTION_CATEGORIES.map((cat, catIdx) => {
    let totalValue = 0;
    for (const id of allIds) {
      totalValue += campsiteConsumption[id][catIdx].value;
    }
    return {
      ...cat,
      value: totalValue,
      percentage: 0,
    };
  }).map((cat, _, arr) => {
    const total = arr.reduce((s, c) => s + c.value, 0);
    return {
      ...cat,
      percentage: total > 0 ? Math.round((cat.value / total) * 1000) / 10 : 0,
    };
  });
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
  const campsites = generateCampsites(period);
  const weeklyVisitors = generateWeeklyVisitors(period);
  const campsiteConsumption = generateCampsiteConsumption(period, campsites);
  const consumption = aggregateConsumptionFromCampsites(campsiteConsumption);
  const hourlyData = generateHourlyData();
  const kpi = calculateKPI(weeklyVisitors, consumption, campsites);
  const lowPeriods = findLowPeriods(weeklyVisitors, hourlyData);

  return {
    kpi,
    campsites,
    weeklyVisitors,
    consumption,
    campsiteConsumption,
    timePeriod: period,
    lowPeriods,
  };
};

export const getHourlyVisitorData = (): HourlyData[] => {
  return generateHourlyData();
};

export const calculateTotalMetrics = (data: DashboardData) => {
  const popularCampsite = [...data.campsites].sort(
    (a, b) => (b.currentOccupancy / b.capacity) - (a.currentOccupancy / a.capacity)
  )[0];
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
