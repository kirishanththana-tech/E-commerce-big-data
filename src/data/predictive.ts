import { ORDERS, Order } from './dataset';
import { revenueOf, monthlyRevenue } from './analytics';

// Linear regression for simple forecasting (least squares).
function linRegress(points: { x: number; y: number }[]) {
  const n = points.length;
  const sumX = points.reduce((s, p) => s + p.x, 0);
  const sumY = points.reduce((s, p) => s + p.y, 0);
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
  const sumXX = points.reduce((s, p) => s + p.x * p.x, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX || 1);
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

export function forecastSales(months = 6) {
  const monthly = monthlyRevenue(ORDERS);
  const pts = monthly.map((m, i) => ({ x: i, y: m.revenue }));
  const { slope, intercept } = linRegress(pts);
  // Add seasonal factor from last year (repeat pattern).
  const result = monthly.map((m) => ({ month: m.month, revenue: m.revenue, type: 'Actual' }));
  for (let i = 0; i < months; i++) {
    const x = 12 + i;
    const seasonal = pts[i % 12].y * 0.05; // carry-over seasonal lift
    const forecast = Math.max(0, Math.round(slope * x + intercept + seasonal));
    const futureMonth = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i % 12];
    result.push({ month: `${futureMonth} (F)`, revenue: forecast, type: 'Forecast' });
  }
  return result;
}

export function churnPrediction() {
  // Simple rule: customers not active in last 90 days with low frequency => churn risk.
  const byCust = new Map<string, { last: string; freq: number; monetary: number }>();
  for (const o of ORDERS) {
    const cur = byCust.get(o.customerId) || { last: '', freq: 0, monetary: 0 };
    if (!cur.last || o.orderDate > cur.last) cur.last = o.orderDate;
    cur.freq += 1;
    cur.monetary += revenueOf(o);
    byCust.set(o.customerId, cur);
  }
  const asOf = new Date('2025-12-31').getTime();
  const buckets = { 'High Risk': 0, 'Medium Risk': 0, 'Low Risk': 0, 'Safe': 0 };
  for (const v of byCust.values()) {
    const days = Math.round((asOf - new Date(v.last).getTime()) / 86400000);
    if (days > 120 && v.freq <= 2) buckets['High Risk']++;
    else if (days > 90) buckets['Medium Risk']++;
    else if (days > 60) buckets['Low Risk']++;
    else buckets['Safe']++;
  }
  return [
    { name: 'Safe', value: buckets['Safe'], color: '#22c55e' },
    { name: 'Low Risk', value: buckets['Low Risk'], color: '#eab308' },
    { name: 'Medium Risk', value: buckets['Medium Risk'], color: '#f97316' },
    { name: 'High Risk', value: buckets['High Risk'], color: '#ef4444' },
  ];
}

export function purchasePrediction() {
  // Predict customers likely to purchase next month based on recent activity + frequency.
  const byCust = new Map<string, { last: string; freq: number; monetary: number }>();
  for (const o of ORDERS) {
    const cur = byCust.get(o.customerId) || { last: '', freq: 0, monetary: 0 };
    if (!cur.last || o.orderDate > cur.last) cur.last = o.orderDate;
    cur.freq += 1;
    cur.monetary += revenueOf(o);
    byCust.set(o.customerId, cur);
  }
  const rows = Array.from(byCust.entries()).map(([id, v]) => {
    const days = Math.round((new Date('2025-12-31').getTime() - new Date(v.last).getTime()) / 86400000);
    const score = Math.min(100, Math.max(0, Math.round(60 - days * 0.4 + v.freq * 3 + v.monetary / 100)));
    return { customerId: id, lastPurchase: v.last, frequency: v.freq, monetary: v.monetary, score, likely: score >= 55 };
  });
  const likely = rows.filter((r) => r.likely).slice(0, 12);
  const summary = { likely: rows.filter((r) => r.likely).length, unlikely: rows.filter((r) => !r.likely).length };
  return { likely, summary };
}

export function demandForecast() {
  // Forecast next-month units for top 5 products using moving average.
  const byCust = new Map<string, number[]>();
  const months = 12;
  for (const o of ORDERS) {
    const m = parseInt(o.orderDate.slice(5, 7), 10) - 1;
    const arr = byCust.get(o.productId) || new Array(months).fill(0);
    arr[m] += o.quantity;
    byCust.set(o.productId, arr);
  }
  const productNames = new Map(ORDERS.map((o) => [o.productId, o.productName]));
  const top = Array.from(byCust.entries())
    .map(([id, arr]) => ({ id, total: arr.reduce((s, v) => s + v, 0) }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
  return top.map((p) => {
    const arr = byCust.get(p.id)!;
    const last3 = arr.slice(-3);
    const ma = last3.reduce((s, v) => s + v, 0) / (last3.length || 1);
    const trend = arr[arr.length - 1] - arr[arr.length - 4 < 0 ? 0 : arr.length - 4];
    const forecast = Math.max(0, Math.round(ma + trend * 0.3));
    return { productId: p.id, productName: productNames.get(p.id) || p.id, lastMonthUnits: arr[arr.length - 1], forecast };
  });
}
