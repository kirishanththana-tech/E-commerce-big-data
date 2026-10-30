import { useMemo, useState } from 'react';
import { Box, DollarSign, Receipt, RefreshCw, ShoppingCart, Users } from 'lucide-react';
import { CartesianGrid, Line, LineChart, Pie, PieChart, Cell, Tooltip, XAxis, YAxis, Legend, Area, AreaChart, BarChart, Bar } from 'recharts';
import { KPICard } from '@/components/ui/KPICard';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { FilterBar, Filters, defaultFilters } from '@/components/ui/FilterBar';
import { SectionTitle } from '@/components/ui/Feedback';
import { ChartContainer, CHART_COLORS, axisProps, tooltipStyle, formatYAxis, tipCurrency, tipLabel } from '@/components/charts/ChartUtils';
import { ORDERS } from '@/data/dataset';
import { computeKPIs, filterOrders, monthlyRevenue, paymentDistribution, revenueByCategory, topProducts, fmtCurrency, fmtPercent } from '@/data/analytics';

export function DashboardPage() {
  const [filters, setFilters] = useState<Filters>(defaultFilters);

  const orders = useMemo(() => filterOrders(ORDERS, filters.range, { category: filters.category === 'All' ? undefined : filters.category, country: filters.country === 'All' ? undefined : filters.country, payment: filters.payment === 'All' ? undefined : filters.payment }), [filters]);

  // Previous-period comparison: same window length immediately before `from`.
  const prevRange = useMemo(() => {
    const days = Math.round((new Date(filters.range.to).getTime() - new Date(filters.range.from).getTime()) / 86400000);
    const prevTo = new Date(new Date(filters.range.from).getTime() - 86400000);
    const prevFrom = new Date(prevTo.getTime() - days * 86400000);
    return { from: prevFrom.toISOString().slice(0, 10), to: prevTo.toISOString().slice(0, 10) };
  }, [filters.range]);
  const prevOrders = useMemo(() => filterOrders(ORDERS, prevRange), [prevRange]);

  const kpis = useMemo(() => computeKPIs(orders, prevOrders), [orders, prevOrders]);
  const monthly = useMemo(() => monthlyRevenue(orders), [orders]);
  const payDist = useMemo(() => paymentDistribution(orders), [orders]);
  const catRev = useMemo(() => revenueByCategory(orders).slice(0, 6), [orders]);
  const top = useMemo(() => topProducts(orders, 5), [orders]);

  return (
    <div className="animate-fade-in">
      <SectionTitle title="Dashboard Overview" subtitle="Real-time e-commerce performance metrics and key indicators" />

      <FilterBar filters={filters} onChange={setFilters} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KPICard label={kpis.revenue.label} value={kpis.revenue.value} growth={kpis.revenue.growth} icon={DollarSign} accent="blue" />
        <KPICard label={kpis.ordersCount.label} value={kpis.ordersCount.value} growth={kpis.ordersCount.growth} icon={ShoppingCart} accent="purple" />
        <KPICard label={kpis.customers.label} value={kpis.customers.value} growth={kpis.customers.growth} icon={Users} accent="cyan" />
        <KPICard label={kpis.aov.label} value={kpis.aov.value} growth={kpis.aov.growth} icon={Receipt} accent="emerald" />
        <KPICard label={kpis.unitsSold.label} value={kpis.unitsSold.value} growth={kpis.unitsSold.growth} icon={Box} accent="amber" />
        <KPICard label={kpis.retention.label} value={kpis.retention.value} growth={kpis.retention.growth} icon={RefreshCw} accent="rose" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Monthly Sales Revenue" subtitle="Revenue trend across the selected period" icon={DollarSign} />
          <CardBody>
            <ChartContainer height={300}>
              <AreaChart data={monthly} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" {...axisProps} />
                <YAxis tickFormatter={formatYAxis} {...axisProps} />
                <Tooltip contentStyle={tooltipStyle} formatter={tipCurrency(fmtCurrency)} />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} fill="url(#revGrad)" />
              </AreaChart>
            </ChartContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Payment Methods" subtitle="Order distribution" icon={ShoppingCart} />
          <CardBody>
            <ChartContainer height={300}>
              <PieChart>
                <Pie data={payDist} dataKey="count" nameKey="method" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                  {payDist.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={tipLabel} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ChartContainer>
          </CardBody>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Revenue by Category" subtitle="Top 6 product categories" icon={Box} />
          <CardBody>
            <ChartContainer height={280}>
              <BarChart data={catRev} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="category" {...axisProps} interval={0} angle={-12} textAnchor="end" height={50} />
                <YAxis tickFormatter={formatYAxis} {...axisProps} />
                <Tooltip contentStyle={tooltipStyle} formatter={tipCurrency(fmtCurrency)} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="revenue" radius={[6, 6, 0, 0]} fill="#8b5cf6" />
              </BarChart>
            </ChartContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Top 5 Products" subtitle="By total revenue" icon={Users} />
          <CardBody>
            <ChartContainer height={280}>
              <BarChart data={top} layout="vertical" margin={{ left: 20, right: 20, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tickFormatter={formatYAxis} {...axisProps} />
                <YAxis type="category" dataKey="name" width={140} {...axisProps} tick={{ ...axisProps.tick, fontSize: 10 }} />
                <Tooltip contentStyle={tooltipStyle} formatter={tipCurrency(fmtCurrency)} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="revenue" radius={[0, 6, 6, 0]} fill="#3b82f6" />
              </BarChart>
            </ChartContainer>
          </CardBody>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardBody className="flex items-center justify-between">
          <div><p className="text-xs text-slate-500">Avg Order Value</p><p className="mt-1 text-xl font-bold text-slate-900">{fmtCurrency(kpis.aov.raw)}</p></div>
          <div className="rounded-lg bg-blue-50 p-3 text-blue-600"><Receipt size={22} /></div>
        </CardBody></Card>
        <Card><CardBody className="flex items-center justify-between">
          <div><p className="text-xs text-slate-500">Revenue per Customer</p><p className="mt-1 text-xl font-bold text-slate-900">{fmtCurrency(kpis.revenue.raw / (kpis.customers.raw || 1))}</p></div>
          <div className="rounded-lg bg-violet-50 p-3 text-violet-600"><Users size={22} /></div>
        </CardBody></Card>
        <Card><CardBody className="flex items-center justify-between">
          <div><p className="text-xs text-slate-500">Return Rate</p><p className="mt-1 text-xl font-bold text-slate-900">{fmtPercent(100 - kpis.retention.raw)}</p></div>
          <div className="rounded-lg bg-rose-50 p-3 text-rose-600"><RefreshCw size={22} /></div>
        </CardBody></Card>
        <Card><CardBody className="flex items-center justify-between">
          <div><p className="text-xs text-slate-500">Total Records</p><p className="mt-1 text-xl font-bold text-slate-900">{orders.length.toLocaleString()}</p></div>
          <div className="rounded-lg bg-amber-50 p-3 text-amber-600"><Box size={22} /></div>
        </CardBody></Card>
      </div>
    </div>
  );
}
