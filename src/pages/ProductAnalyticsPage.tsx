import { useMemo, useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle, Boxes, Download, Package, TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Tooltip, XAxis, YAxis, Legend } from 'recharts';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { FilterBar, Filters, defaultFilters } from '@/components/ui/FilterBar';
import { SectionTitle } from '@/components/ui/Feedback';
import { ChartContainer, CHART_COLORS, axisProps, tooltipStyle, formatYAxis, tipCurrency } from '@/components/charts/ChartUtils';
import { ORDERS } from '@/data/dataset';
import { bottomProducts, fmtCurrency, fmtNumber, productDemandTrend, revenueByCategory, topProducts } from '@/data/analytics';
import { downloadCSV } from '@/utils/export';

export function ProductAnalyticsPage() {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const orders = useMemo(() => ORDERS.filter((o) => {
    if (o.orderDate < filters.range.from || o.orderDate > filters.range.to) return false;
    if (filters.category !== 'All' && o.category !== filters.category) return false;
    if (filters.country !== 'All' && o.country !== filters.country) return false;
    if (filters.payment !== 'All' && o.paymentMethod !== filters.payment) return false;
    return true;
  }), [filters]);

  const top = useMemo(() => topProducts(orders, 10), [orders]);
  const bottom = useMemo(() => bottomProducts(orders, 5), [orders]);
  const catRev = useMemo(() => revenueByCategory(orders), [orders]);
  const trend = useMemo(() => productDemandTrend(orders), [orders]);

  return (
    <div className="animate-fade-in">
      <SectionTitle
        title="Product Analytics"
        subtitle="Best and worst performers, category performance and demand trends"
        action={
          <button onClick={() => downloadCSV('product_performance.csv', top.map((p) => ({ product: p.name, units: p.units, revenue: p.revenue })))} className="inline-flex items-center gap-2 rounded-lg bg-navy-700 px-4 py-2 text-sm font-medium text-white hover:bg-navy-800">
            <Download size={16} /> Export
          </button>
        }
      />
      <FilterBar filters={filters} onChange={setFilters} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardBody className="flex items-center justify-between">
          <div><p className="text-xs text-slate-500">Top Product Revenue</p><p className="mt-1 text-2xl font-bold text-slate-900">{fmtCurrency(top[0]?.revenue || 0)}</p></div>
          <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600"><ArrowUpCircle size={22} /></div>
        </CardBody></Card>
        <Card><CardBody className="flex items-center justify-between">
          <div><p className="text-xs text-slate-500">Top Product Units</p><p className="mt-1 text-2xl font-bold text-slate-900">{fmtNumber(top[0]?.units || 0)}</p></div>
          <div className="rounded-lg bg-blue-50 p-3 text-blue-600"><Package size={22} /></div>
        </CardBody></Card>
        <Card><CardBody className="flex items-center justify-between">
          <div><p className="text-xs text-slate-500">Lowest Product Revenue</p><p className="mt-1 text-2xl font-bold text-slate-900">{fmtCurrency(bottom[0]?.revenue || 0)}</p></div>
          <div className="rounded-lg bg-rose-50 p-3 text-rose-600"><ArrowDownCircle size={22} /></div>
        </CardBody></Card>
        <Card><CardBody className="flex items-center justify-between">
          <div><p className="text-xs text-slate-500">Product Catalog</p><p className="mt-1 text-2xl font-bold text-slate-900">{new Set(orders.map((o) => o.productId)).size}</p></div>
          <div className="rounded-lg bg-violet-50 p-3 text-violet-600"><Boxes size={22} /></div>
        </CardBody></Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Best-Selling Products" subtitle="Top 10 by revenue" icon={TrendingUp} />
          <CardBody>
            <ChartContainer height={320}>
              <BarChart data={top} layout="vertical" margin={{ left: 40, right: 20, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tickFormatter={formatYAxis} {...axisProps} />
                <YAxis type="category" dataKey="name" width={180} {...axisProps} tick={{ ...axisProps.tick, fontSize: 10 }} />
                <Tooltip contentStyle={tooltipStyle} formatter={tipCurrency(fmtCurrency)} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="revenue" radius={[0, 6, 6, 0]} fill="#22c55e" />
              </BarChart>
            </ChartContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Lowest-Selling Products" subtitle="Bottom 5 by revenue" icon={ArrowDownCircle} />
          <CardBody>
            <ChartContainer height={320}>
              <BarChart data={bottom} layout="vertical" margin={{ left: 40, right: 20, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tickFormatter={formatYAxis} {...axisProps} />
                <YAxis type="category" dataKey="name" width={180} {...axisProps} tick={{ ...axisProps.tick, fontSize: 10 }} />
                <Tooltip contentStyle={tooltipStyle} formatter={tipCurrency(fmtCurrency)} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="revenue" radius={[0, 6, 6, 0]} fill="#ef4444" />
              </BarChart>
            </ChartContainer>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Category-Wise Performance" subtitle="Revenue by product category" icon={Boxes} />
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

        <Card className="lg:col-span-2">
          <CardHeader title="Product Demand Trends" subtitle="Monthly units sold for top 3 products" icon={TrendingUp} />
          <CardBody>
            <ChartContainer height={320}>
              <LineChart data={trend.data} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" {...axisProps} />
                <YAxis {...axisProps} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: unknown) => [`${Number(v)} units`, ''] as [string, string]} cursor={{ fill: '#f8fafc' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} formatter={(v) => trend.labels[v as string] || v} />
                {trend.ids.map((id, i) => (
                  <Line key={id} type="monotone" dataKey={id} stroke={CHART_COLORS[i]} strokeWidth={2} dot={{ r: 3 }} />
                ))}
              </LineChart>
            </ChartContainer>
          </CardBody>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader title="Product Revenue Comparison" subtitle="All products ranked by revenue" icon={Package} />
        <CardBody>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-2">#</th>
                  <th className="px-3 py-2">Product</th>
                  <th className="px-3 py-2">Units</th>
                  <th className="px-3 py-2">Revenue</th>
                  <th className="px-3 py-2 w-1/3">Revenue Share</th>
                </tr>
              </thead>
              <tbody>
                {top.map((p, i) => {
                  const total = top.reduce((s, x) => s + x.revenue, 0);
                  const pct = (p.revenue / (total || 1)) * 100;
                  return (
                    <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <td className="px-3 py-2.5 font-medium text-slate-400">{i + 1}</td>
                      <td className="px-3 py-2.5 font-medium text-slate-800">{p.name}</td>
                      <td className="px-3 py-2.5 text-slate-600">{fmtNumber(p.units)}</td>
                      <td className="px-3 py-2.5 font-semibold text-slate-800">{fmtCurrency(p.revenue)}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-slate-500">{pct.toFixed(1)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
