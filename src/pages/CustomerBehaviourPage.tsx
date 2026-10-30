import { useMemo, useState } from 'react';
import { Activity, BarChart3, Crown, Download, RefreshCw, Users } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, Tooltip, XAxis, YAxis, Legend, Area, AreaChart } from 'recharts';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { FilterBar, Filters, defaultFilters } from '@/components/ui/FilterBar';
import { SectionTitle } from '@/components/ui/Feedback';
import { ChartContainer, CHART_COLORS, axisProps, tooltipStyle, formatYAxis, tipLabel } from '@/components/charts/ChartUtils';
import { ORDERS } from '@/data/dataset';
import { avgSpendPerCustomer, customerLifetimeValue, fmtCurrency, fmtNumber, fmtPercent, newVsReturning, purchaseFrequency, revenueOf } from '@/data/analytics';
import { downloadCSV } from '@/utils/export';

export function CustomerBehaviourPage() {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const orders = useMemo(() => ORDERS.filter((o) => {
    if (o.orderDate < filters.range.from || o.orderDate > filters.range.to) return false;
    if (filters.category !== 'All' && o.category !== filters.category) return false;
    if (filters.country !== 'All' && o.country !== filters.country) return false;
    if (filters.payment !== 'All' && o.paymentMethod !== filters.payment) return false;
    return true;
  }), [filters]);

  const prevRange = useMemo(() => {
    const days = Math.round((new Date(filters.range.to).getTime() - new Date(filters.range.from).getTime()) / 86400000);
    const prevTo = new Date(new Date(filters.range.from).getTime() - 86400000);
    const prevFrom = new Date(prevTo.getTime() - days * 86400000);
    return { from: prevFrom.toISOString().slice(0, 10), to: prevTo.toISOString().slice(0, 10) };
  }, [filters.range]);
  const prevOrders = useMemo(() => ORDERS.filter((o) => o.orderDate >= prevRange.from && o.orderDate <= prevRange.to), [prevRange]);

  const nv = useMemo(() => newVsReturning(orders, prevOrders), [orders, prevOrders]);
  const freq = useMemo(() => purchaseFrequency(orders), [orders]);
  const spend = useMemo(() => avgSpendPerCustomer(orders), [orders]);
  const clv = useMemo(() => customerLifetimeValue(orders), [orders]);

  // Retention cohort: month-over-month returning rate
  const cohort = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthCust = new Map<number, Set<string>>();
    for (const o of orders) {
      const m = parseInt(o.orderDate.slice(5, 7), 10) - 1;
      if (!monthCust.has(m)) monthCust.set(m, new Set());
      monthCust.get(m)!.add(o.customerId);
    }
    return months.map((month, i) => {
      const cur = monthCust.get(i) || new Set();
      const prev = monthCust.get(i - 1) || new Set();
      let returning = 0;
      cur.forEach((c) => { if (prev.has(c)) returning++; });
      const rate = cur.size ? (returning / cur.size) * 100 : 0;
      return { month, retention: Math.round(rate), customers: cur.size };
    });
  }, [orders]);

  return (
    <div className="animate-fade-in">
      <SectionTitle
        title="Customer Behaviour Analytics"
        subtitle="Purchasing patterns, retention and lifetime value"
        action={
          <button onClick={() => downloadCSV('customer_behaviour.csv', cohort.map((c) => ({ month: c.month, retention_rate: c.retention, customers: c.customers })))} className="inline-flex items-center gap-2 rounded-lg bg-navy-700 px-4 py-2 text-sm font-medium text-white hover:bg-navy-800">
            <Download size={16} /> Export
          </button>
        }
      />
      <FilterBar filters={filters} onChange={setFilters} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardBody className="flex items-center justify-between">
          <div><p className="text-xs text-slate-500">New Customers</p><p className="mt-1 text-2xl font-bold text-slate-900">{fmtNumber(nv[0].value)}</p></div>
          <div className="rounded-lg bg-blue-50 p-3 text-blue-600"><Users size={22} /></div>
        </CardBody></Card>
        <Card><CardBody className="flex items-center justify-between">
          <div><p className="text-xs text-slate-500">Returning Customers</p><p className="mt-1 text-2xl font-bold text-slate-900">{fmtNumber(nv[1].value)}</p></div>
          <div className="rounded-lg bg-violet-50 p-3 text-violet-600"><RefreshCw size={22} /></div>
        </CardBody></Card>
        <Card><CardBody className="flex items-center justify-between">
          <div><p className="text-xs text-slate-500">Avg Spend / Customer</p><p className="mt-1 text-2xl font-bold text-slate-900">{fmtCurrency(spend.avg)}</p></div>
          <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600"><Activity size={22} /></div>
        </CardBody></Card>
        <Card><CardBody className="flex items-center justify-between">
          <div><p className="text-xs text-slate-500">Est. Customer LTV</p><p className="mt-1 text-2xl font-bold text-slate-900">{fmtCurrency(clv.clv)}</p></div>
          <div className="rounded-lg bg-amber-50 p-3 text-amber-600"><Crown size={22} /></div>
        </CardBody></Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="New vs Returning Customers" subtitle="Compared to previous period" icon={Users} />
          <CardBody>
            <ChartContainer height={280}>
              <PieChart>
                <Pie data={nv} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {nv.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={tipLabel} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ChartContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Purchase Frequency" subtitle="Orders per customer distribution" icon={BarChart3} />
          <CardBody>
            <ChartContainer height={280}>
              <BarChart data={freq} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="range" {...axisProps} />
                <YAxis {...axisProps} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: unknown) => [`${Number(v)} customers`, 'Count'] as [string, string]} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="#3b82f6" />
              </BarChart>
            </ChartContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Customer Retention Rate" subtitle="Month-over-month returning rate" icon={RefreshCw} />
          <CardBody>
            <ChartContainer height={280}>
              <LineChart data={cohort} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" {...axisProps} />
                <YAxis tickFormatter={(v) => `${v}%`} {...axisProps} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: unknown) => [fmtPercent(Number(v)), 'Retention'] as [string, string]} />
                <Line type="monotone" dataKey="retention" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ChartContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Customer Lifetime Value" subtitle="Distribution by estimated CLV" icon={Crown} />
          <CardBody>
            <ChartContainer height={280}>
              <BarChart data={clv.distribution} margin={{ left: -10, right: 10, top: 10, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="segment" {...axisProps} interval={0} angle={-12} textAnchor="end" height={50} />
                <YAxis {...axisProps} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: unknown) => [`${Number(v)} customers`, 'Count'] as [string, string]} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="#8b5cf6" />
              </BarChart>
            </ChartContainer>
          </CardBody>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader title="Active Customers per Month" subtitle="Unique customers each month" icon={Activity} />
        <CardBody>
          <ChartContainer height={300}>
            <AreaChart data={cohort} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="custGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" {...axisProps} />
              <YAxis {...axisProps} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: unknown) => [`${Number(v)} customers`, 'Active'] as [string, string]} />
              <Area type="monotone" dataKey="customers" stroke="#06b6d4" strokeWidth={2} fill="url(#custGrad)" />
            </AreaChart>
          </ChartContainer>
        </CardBody>
      </Card>
    </div>
  );
}
