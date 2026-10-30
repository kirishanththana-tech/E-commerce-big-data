import { ORDERS, Order } from './dataset';

export const revenueOf = (o: Order) => o.quantity * o.price;

export const fmtCurrency = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export const fmtCurrencyPrecise = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });

export const fmtNumber = (n: number) => n.toLocaleString('en-US');

export const fmtPercent = (n: number, digits = 1) => `${n.toFixed(digits)}%`;

export type DateRange = { from: string; to: string };

export function filterOrders(orders: Order[], range?: DateRange, opts?: { category?: string; country?: string; payment?: string }): Order[] {
  return orders.filter((o) => {
    if (range && (o.orderDate < range.from || o.orderDate > range.to)) return false;
    if (opts?.category && o.category !== opts.category) return false;
    if (opts?.country && o.country !== opts.country) return false;
    if (opts?.payment && o.paymentMethod !== opts.payment) return false;
    return true;
  });
}

export const FULL_RANGE: DateRange = { from: '2025-01-01', to: '2025-12-31' };

export function monthlyRevenue(orders: Order[]) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const map = new Map<number, number>();
  for (let m = 0; m < 12; m++) map.set(m, 0);
  for (const o of orders) {
    const m = parseInt(o.orderDate.slice(5, 7), 10) - 1;
    map.set(m, (map.get(m) || 0) + revenueOf(o));
  }
  return months.map((month, idx) => ({ month, revenue: Math.round(map.get(idx) || 0) }));
}

export function dailyRevenue(orders: Order[]) {
  const map = new Map<string, number>();
  for (const o of orders) {
    map.set(o.orderDate, (map.get(o.orderDate) || 0) + revenueOf(o));
  }
  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, revenue]) => ({ date, revenue: Math.round(revenue) }));
}

export function revenueByCategory(orders: Order[]) {
  const map = new Map<string, number>();
  for (const o of orders) map.set(o.category, (map.get(o.category) || 0) + revenueOf(o));
  return Array.from(map.entries())
    .map(([category, revenue]) => ({ category, revenue: Math.round(revenue) }))
    .sort((a, b) => b.revenue - a.revenue);
}

export function topProducts(orders: Order[], n = 10) {
  const map = new Map<string, { name: string; units: number; revenue: number }>();
  for (const o of orders) {
    const cur = map.get(o.productId) || { name: o.productName, units: 0, revenue: 0 };
    cur.units += o.quantity;
    cur.revenue += revenueOf(o);
    map.set(o.productId, cur);
  }
  return Array.from(map.entries())
    .map(([id, v]) => ({ id, ...v, revenue: Math.round(v.revenue) }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, n);
}

export function bottomProducts(orders: Order[], n = 10) {
  const map = new Map<string, { name: string; units: number; revenue: number }>();
  for (const o of orders) {
    const cur = map.get(o.productId) || { name: o.productName, units: 0, revenue: 0 };
    cur.units += o.quantity;
    cur.revenue += revenueOf(o);
    map.set(o.productId, cur);
  }
  return Array.from(map.entries())
    .map(([id, v]) => ({ id, ...v, revenue: Math.round(v.revenue) }))
    .sort((a, b) => a.revenue - b.revenue)
    .slice(0, n);
}

export function salesByCountry(orders: Order[]) {
  const map = new Map<string, { revenue: number; orders: number }>();
  for (const o of orders) {
    const cur = map.get(o.country) || { revenue: 0, orders: 0 };
    cur.revenue += revenueOf(o);
    cur.orders += 1;
    map.set(o.country, cur);
  }
  return Array.from(map.entries())
    .map(([country, v]) => ({ country, ...v, revenue: Math.round(v.revenue) }))
    .sort((a, b) => b.revenue - a.revenue);
}

export function paymentDistribution(orders: Order[]) {
  const map = new Map<string, number>();
  for (const o of orders) map.set(o.paymentMethod, (map.get(o.paymentMethod) || 0) + 1);
  return Array.from(map.entries()).map(([method, count]) => ({ method, count }));
}

export type KPI = {
  label: string;
  value: string;
  raw: number;
  growth: number; // percentage vs previous period
  icon: string;
};

export function computeKPIs(orders: Order[], prevOrders: Order[]): {
  revenue: KPI;
  ordersCount: KPI;
  customers: KPI;
  aov: KPI;
  unitsSold: KPI;
  retention: KPI;
} {
  const totalRevenue = orders.reduce((s, o) => s + revenueOf(o), 0);
  const prevRevenue = prevOrders.reduce((s, o) => s + revenueOf(o), 0);
  const orderCount = orders.length;
  const prevOrderCount = prevOrders.length;
  const customers = new Set(orders.map((o) => o.customerId)).size;
  const prevCustomers = new Set(prevOrders.map((o) => o.customerId)).size;
  const aov = orderCount ? totalRevenue / orderCount : 0;
  const prevAov = prevOrderCount ? prevRevenue / prevOrderCount : 0;
  const unitsSold = orders.reduce((s, o) => s + o.quantity, 0);
  const prevUnits = prevOrders.reduce((s, o) => s + o.quantity, 0);

  // Retention: customers in this period who also appeared in previous period.
  const prevCustSet = new Set(prevOrders.map((o) => o.customerId));
  const returning = new Set(orders.filter((o) => prevCustSet.has(o.customerId)).map((o) => o.customerId));
  const retentionRate = customers ? (returning.size / customers) * 100 : 0;
  // Approx previous-period retention for growth comparison
  const prevPrev = new Set(prevOrders.filter((o) => !prevCustSet.has(o.customerId)).map((o) => o.customerId));
  const prevRetention = prevCustomers ? (prevPrev.size / prevCustomers) * 100 : 0;

  const pct = (cur: number, prev: number) => (prev ? ((cur - prev) / prev) * 100 : 0);

  return {
    revenue: { label: 'Total Revenue', value: fmtCurrency(totalRevenue), raw: totalRevenue, growth: pct(totalRevenue, prevRevenue), icon: 'dollar' },
    ordersCount: { label: 'Total Orders', value: fmtNumber(orderCount), raw: orderCount, growth: pct(orderCount, prevOrderCount), icon: 'cart' },
    customers: { label: 'Total Customers', value: fmtNumber(customers), raw: customers, growth: pct(customers, prevCustomers), icon: 'users' },
    aov: { label: 'Average Order Value', value: fmtCurrency(aov), raw: aov, growth: pct(aov, prevAov), icon: 'receipt' },
    unitsSold: { label: 'Products Sold', value: fmtNumber(unitsSold), raw: unitsSold, growth: pct(unitsSold, prevUnits), icon: 'box' },
    retention: { label: 'Customer Retention', value: fmtPercent(retentionRate), raw: retentionRate, growth: pct(retentionRate, prevRetention), icon: 'refresh' },
  };
}

export function newVsReturning(orders: Order[], prevOrders: Order[]) {
  const prevSet = new Set(prevOrders.map((o) => o.customerId));
  let returning = 0;
  let newC = 0;
  for (const cid of new Set(orders.map((o) => o.customerId))) {
    if (prevSet.has(cid)) returning++;
    else newC++;
  }
  return [
    { name: 'New', value: newC },
    { name: 'Returning', value: returning },
  ];
}

export function purchaseFrequency(orders: Order[]) {
  const map = new Map<string, number>();
  for (const o of orders) map.set(o.customerId, (map.get(o.customerId) || 0) + 1);
  const buckets = [
    { range: '1', count: 0 },
    { range: '2', count: 0 },
    { range: '3', count: 0 },
    { range: '4-5', count: 0 },
    { range: '6-10', count: 0 },
    { range: '10+', count: 0 },
  ];
  for (const cnt of map.values()) {
    if (cnt === 1) buckets[0].count++;
    else if (cnt === 2) buckets[1].count++;
    else if (cnt === 3) buckets[2].count++;
    else if (cnt <= 5) buckets[3].count++;
    else if (cnt <= 10) buckets[4].count++;
    else buckets[5].count++;
  }
  return buckets;
}

export function avgSpendPerCustomer(orders: Order[]) {
  const map = new Map<string, number>();
  for (const o of orders) map.set(o.customerId, (map.get(o.customerId) || 0) + revenueOf(o));
  const vals = Array.from(map.values()).sort((a, b) => a - b);
  const avg = vals.reduce((s, v) => s + v, 0) / (vals.length || 1);
  const median = vals.length ? vals[Math.floor(vals.length / 2)] : 0;
  return { avg: Math.round(avg), median: Math.round(median), max: Math.round(vals[vals.length - 1] || 0), min: Math.round(vals[0] || 0) };
}

export function customerLifetimeValue(orders: Order[]) {
  // CLV = avg purchase value * avg purchase frequency * avg customer lifespan (estimated via observed window)
  const byCust = new Map<string, { dates: Set<string>; total: number }>();
  for (const o of orders) {
    const cur = byCust.get(o.customerId) || { dates: new Set(), total: 0 };
    cur.dates.add(o.orderDate);
    cur.total += revenueOf(o);
    byCust.set(o.customerId, cur);
  }
  const stats = Array.from(byCust.values());
  const avgValue = stats.reduce((s, c) => s + c.total / c.dates.size, 0) / (stats.length || 1);
  const avgFreq = stats.reduce((s, c) => s + c.dates.size, 0) / (stats.length || 1);
  // lifespan estimate: distinct day span (assume represents active lifespan, min 1 month)
  const lifespans = stats.map((c) => c.dates.size > 1 ? c.dates.size : 1);
  const avgLifespan = lifespans.reduce((s, v) => s + v, 0) / (lifespans.length || 1) / 12; // years
  const clv = avgValue * avgFreq * Math.max(avgLifespan, 1);
  const distribution = [
    { segment: 'High ($1000+)', count: 0 },
    { segment: 'Medium ($300-1000)', count: 0 },
    { segment: 'Low (<$300)', count: 0 },
  ];
  for (const c of stats) {
    const est = c.total;
    if (est >= 1000) distribution[0].count++;
    else if (est >= 300) distribution[1].count++;
    else distribution[2].count++;
  }
  return { clv: Math.round(clv), distribution };
}

export type RFMSegment = 'Champions' | 'Loyal Customers' | 'Potential Loyalists' | 'New Customers' | 'At Risk' | 'Lost';
export type RFMRow = { customerId: string; recency: number; frequency: number; monetary: number; rScore: number; fScore: number; mScore: number; segment: RFMSegment };

export function rfmAnalysis(orders: Order[], asOf = '2025-12-31'): RFMRow[] {
  const byCust = new Map<string, { last: string; freq: number; monetary: number }>();
  for (const o of orders) {
    const cur = byCust.get(o.customerId) || { last: '', freq: 0, monetary: 0 };
    if (!cur.last || o.orderDate > cur.last) cur.last = o.orderDate;
    cur.freq += 1;
    cur.monetary += revenueOf(o);
    byCust.set(o.customerId, cur);
  }
  const rows = Array.from(byCust.entries()).map(([customerId, v]) => {
    const recency = Math.max(0, Math.round((new Date(asOf).getTime() - new Date(v.last).getTime()) / 86400000));
    return { customerId, recency, frequency: v.freq, monetary: Math.round(v.monetary), rScore: 0, fScore: 0, mScore: 0, segment: 'Lost' as RFMSegment };
  });

  const score = (vals: number[], reverse = false) => {
    const sorted = [...vals].sort((a, b) => (reverse ? a - b : b - a));
    const q = (n: number) => {
      const idx = Math.min(sorted.length - 1, Math.floor((n / 4) * sorted.length));
      return sorted[idx];
    };
    const q1 = q(1), q2 = q(2), q3 = q(3);
    return (v: number) => {
      if (reverse) {
        if (v <= q1) return 4;
        if (v <= q2) return 3;
        if (v <= q3) return 2;
        return 1;
      } else {
        if (v >= q3) return 4;
        if (v >= q2) return 3;
        if (v >= q1) return 2;
        return 1;
      }
    };
  };
  const rFn = score(rows.map((r) => r.recency), true);
  const fFn = score(rows.map((r) => r.frequency), false);
  const mFn = score(rows.map((r) => r.monetary), false);
  for (const r of rows) {
    r.rScore = rFn(r.recency);
    r.fScore = fFn(r.frequency);
    r.mScore = mFn(r.monetary);
    r.segment = segmentOf(r.rScore, r.fScore, r.mScore);
  }
  return rows.sort((a, b) => b.monetary - a.monetary);
}

function segmentOf(r: number, f: number, m: number): RFMSegment {
  const sum = r + f + m;
  if (r >= 4 && f >= 4 && m >= 4) return 'Champions';
  if (r >= 3 && f >= 3 && m >= 3) return 'Loyal Customers';
  if (r >= 3 && f <= 3 && m >= 2) return 'Potential Loyalists';
  if (r >= 4 && f <= 2) return 'New Customers';
  if (r <= 2 && f >= 3) return 'At Risk';
  return 'Lost';
}

export function segmentCounts(rows: RFMRow[]) {
  const order: RFMSegment[] = ['Champions', 'Loyal Customers', 'Potential Loyalists', 'New Customers', 'At Risk', 'Lost'];
  const map = new Map<RFMSegment, number>();
  for (const r of rows) map.set(r.segment, (map.get(r.segment) || 0) + 1);
  return order.map((seg) => ({ segment: seg, count: map.get(seg) || 0 }));
}

// Demand trend by month for a product (or top products overall).
export function productDemandTrend(orders: Order[], productIds?: string[]) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const ids = productIds || topProducts(orders, 3).map((p) => p.id);
  const result = months.map((m) => ({ month: m, ...Object.fromEntries(ids.map((id) => [id, 0])) }));
  for (const o of orders) {
    if (!ids.includes(o.productId)) continue;
    const m = parseInt(o.orderDate.slice(5, 7), 10) - 1;
    (result[m] as Record<string, number | string>)[o.productId] =
      ((result[m] as Record<string, number | string>)[o.productId] as number) + o.quantity;
  }
  const labels = Object.fromEntries(ids.map((id, i) => [id, `Product ${i + 1}`]));
  return { data: result, labels, ids };
}
