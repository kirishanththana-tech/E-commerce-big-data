import { useMemo, useState } from 'react';
import { BarChart3, Download, Globe, LineChart as LineIcon, PieChart as PieIcon, ShoppingBag } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, Tooltip, XAxis, YAxis, Legend, Area, AreaChart } from 'recharts';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { FilterBar, Filters, defaultFilters } from '@/components/ui/FilterBar';
import { SectionTitle, EmptyState } from '@/components/ui/Feedback';
import { ChartContainer, CHART_COLORS, axisProps, tooltipStyle, formatYAxis, tipCurrency, tipLabel } from '@/components/charts/ChartUtils';
import { ORDERS } from '@/data/dataset';
import { dailyRevenue, fmtCurrency, monthlyRevenue, paymentDistribution, revenueByCategory, salesByCountry, topProducts } from '@/data/analytics';
import { downloadCSV } from '@/utils/export';

export function SalesAnalyticsPage() {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const orders = useMemo(() => {
    return ORDERS.filter((o) => {
      if (o.orderDate < filters.range.from || o.orderDate > filters.range.to) return false;
      if (filters.category !== 'All' && o.category !== filters.category) return false;
      if (filters.country !== 'All' && o.country !== filters.country) return false;
      if (filters.payment !== 'All' && o.paymentMethod !== filters.payment) return false;
      return true;
    });
  }, [filters]);

  const monthly = useMemo(() => monthlyRevenue(orders), [orders]);
  const daily = useMemo(() => dailyRevenue(orders), [orders]);
  const catRev = useMemo(() => revenueByCategory(orders), [orders]);
  const top = useMemo(() => topProducts(orders, 10), [orders]);
  const byCountry = useMemo(() => salesByCountry(orders), [orders]);
  const payDist = useMemo(() => paymentDistribution(orders), [orders]);

  return (
    <div className="animate-fade-in">
      <SectionTitle
        title="Sales Analytics"
        subtitle="Interactive visualizations of sales revenue, trends and distribution"
        action={
          <button onClick={() => downloadCSV('sales_summary.csv', catRev)} className="inline-flex items-center gap-2 rounded-lg bg-navy-700 px-4 py-2 text-sm font-medium text-white hover:bg-navy-800">
            <Download size={16} /> Export
          </button>
        }
      />
      <FilterBar filters={filters} onChange={setFilters} />

      {!orders.length ? (
        <Card><CardBody><EmptyState title="No sales data" message="No orders match the current filters. Try adjusting the date range or filters." icon={ShoppingBag} /></CardBody></Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader title="Monthly Sales Revenue" subtitle="Aggregated by month" icon={LineIcon} />
              <CardBody>
                <ChartContainer height={300}>
                  <LineChart data={monthly} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="month" {...axisProps} />
                    <YAxis tickFormatter={formatYAxis} {...axisProps} />
                    <Tooltip contentStyle={tooltipStyle} formatter={tipCurrency(fmtCurrency)} />
                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3, fill: '#3b82f6' }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ChartContainer>
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Daily Sales Trend" subtitle="Day-by-day revenue" icon={LineIcon} />
              <CardBody>
                <ChartContainer height={300}>
                  <AreaChart data={daily} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="dailyGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="date" {...axisProps} tick={{ ...axisProps.tick, fontSize: 10 }} minTickGap={40} />
                    <YAxis tickFormatter={formatYAxis} {...axisProps} />
                    <Tooltip contentStyle={tooltipStyle} formatter={tipCurrency(fmtCurrency)} />
                    <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={1.5} fill="url(#dailyGrad)" />
                  </AreaChart>
                </ChartContainer>
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Revenue by Product Category" subtitle="Total revenue per category" icon={BarChart3} />
              <CardBody>
                <ChartContainer height={300}>
                  <BarChart data={catRev} margin={{ left: -10, right: 10, top: 10, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="category" {...axisProps} interval={0} angle={-20} textAnchor="end" height={60} />
                    <YAxis tickFormatter={formatYAxis} {...axisProps} />
                    <Tooltip contentStyle={tooltipStyle} formatter={tipCurrency(fmtCurrency)} cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                      {catRev.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Payment Method Distribution" subtitle="Share of orders by payment type" icon={PieIcon} />
              <CardBody>
                <ChartContainer height={300}>
                  <PieChart>
                    <Pie data={payDist} dataKey="count" nameKey="method" cx="50%" cy="50%" outerRadius={100} label={({ method, percent }) => `${method} ${((percent || 0) * 100).toFixed(0)}%`} labelLine={false} style={{ fontSize: 10 }}>
                      {payDist.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} formatter={tipLabel} />
                  </PieChart>
                </ChartContainer>
              </CardBody>
            </Card>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader title="Top 10 Selling Products" subtitle="Ranked by revenue" icon={BarChart3} />
              <CardBody>
                <ChartContainer height={320}>
                  <BarChart data={top} layout="vertical" margin={{ left: 30, right: 20, top: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis type="number" tickFormatter={formatYAxis} {...axisProps} />
                    <YAxis type="category" dataKey="name" width={180} {...axisProps} tick={{ ...axisProps.tick, fontSize: 10 }} />
                    <Tooltip contentStyle={tooltipStyle} formatter={tipCurrency(fmtCurrency)} cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="revenue" radius={[0, 6, 6, 0]} fill="#3b82f6" />
                  </BarChart>
                </ChartContainer>
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Sales by Country" subtitle="Revenue by region" icon={Globe} />
              <CardBody>
                <ChartContainer height={320}>
                  <BarChart data={byCountry} layout="vertical" margin={{ left: 20, right: 20, top: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis type="number" tickFormatter={formatYAxis} {...axisProps} />
                    <YAxis type="category" dataKey="country" width={100} {...axisProps} tick={{ ...axisProps.tick, fontSize: 10 }} />
                    <Tooltip contentStyle={tooltipStyle} formatter={tipCurrency(fmtCurrency)} cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="revenue" radius={[0, 6, 6, 0]} fill="#22c55e" />
                  </BarChart>
                </ChartContainer>
              </CardBody>
            </Card>
          </div>

          <Card className="mt-4">
            <CardHeader title="Top Products Table" subtitle="Units sold and revenue" icon={BarChart3} />
            <CardBody>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-3 py-2">#</th>
                      <th className="px-3 py-2">Product</th>
                      <th className="px-3 py-2">Units Sold</th>
                      <th className="px-3 py-2">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {top.map((p, i) => (
                      <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                        <td className="px-3 py-2.5 font-medium text-slate-400">{i + 1}</td>
                        <td className="px-3 py-2.5 font-medium text-slate-800">{p.name}</td>
                        <td className="px-3 py-2.5 text-slate-600">{p.units.toLocaleString()}</td>
                        <td className="px-3 py-2.5 font-semibold text-slate-800">{fmtCurrency(p.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}
