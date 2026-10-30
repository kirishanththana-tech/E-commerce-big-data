import { useMemo, useState } from 'react';
import { Award, BarChart3, Crown, Download, UsersRound } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, PolarAngleAxis, PolarGrid, Radar, RadarChart, Tooltip, XAxis, YAxis, Legend } from 'recharts';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { FilterBar, Filters, defaultFilters } from '@/components/ui/FilterBar';
import { SectionTitle } from '@/components/ui/Feedback';
import { ChartContainer, CHART_COLORS, axisProps, tooltipStyle, tipLabel } from '@/components/charts/ChartUtils';
import { ORDERS } from '@/data/dataset';
import { fmtNumber, rfmAnalysis, segmentCounts, RFMSegment } from '@/data/analytics';
import { downloadCSV } from '@/utils/export';

const SEGMENT_META: Record<RFMSegment, { color: string; icon: typeof Crown; desc: string }> = {
  'Champions': { color: '#8b5cf6', icon: Crown, desc: 'Best customers — bought recently, often and spend the most.' },
  'Loyal Customers': { color: '#3b82f6', icon: Award, desc: 'Consistent buyers with strong engagement.' },
  'Potential Loyalists': { color: '#06b6d4', icon: Award, desc: 'Recent customers who could become loyal.' },
  'New Customers': { color: '#22c55e', icon: Award, desc: 'First-time or very recent buyers.' },
  'At Risk': { color: '#f59e0b', icon: Award, desc: 'Were active but have not purchased recently.' },
  'Lost': { color: '#ef4444', icon: Award, desc: 'Low recency, frequency and monetary value.' },
};

export function CustomerSegmentationPage() {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const orders = useMemo(() => ORDERS.filter((o) => {
    if (o.orderDate < filters.range.from || o.orderDate > filters.range.to) return false;
    if (filters.category !== 'All' && o.category !== filters.category) return false;
    if (filters.country !== 'All' && o.country !== filters.country) return false;
    if (filters.payment !== 'All' && o.paymentMethod !== filters.payment) return false;
    return true;
  }), [filters]);

  const rows = useMemo(() => rfmAnalysis(orders), [orders]);
  const counts = useMemo(() => segmentCounts(rows), [rows]);

  // Average R/F/M per segment for radar
  const radar = useMemo(() => {
    return counts.map(({ segment }) => {
      const subset = rows.filter((r) => r.segment === segment);
      const avg = (key: 'rScore' | 'fScore' | 'mScore') => subset.length ? subset.reduce((s, r) => s + r[key], 0) / subset.length : 0;
      return { segment, Recency: +avg('rScore').toFixed(2), Frequency: +avg('fScore').toFixed(2), Monetary: +avg('mScore').toFixed(2) };
    });
  }, [rows, counts]);

  const topCustomers = rows.slice(0, 10);

  return (
    <div className="animate-fade-in">
      <SectionTitle
        title="Customer Segmentation (RFM)"
        subtitle="Recency, Frequency and Monetary analysis to group customers"
        action={
          <button onClick={() => downloadCSV('rfm_segments.csv', rows.map((r) => ({ customerId: r.customerId, recency: r.recency, frequency: r.frequency, monetary: r.monetary, rScore: r.rScore, fScore: r.fScore, mScore: r.mScore, segment: r.segment })))} className="inline-flex items-center gap-2 rounded-lg bg-navy-700 px-4 py-2 text-sm font-medium text-white hover:bg-navy-800">
            <Download size={16} /> Export
          </button>
        }
      />
      <FilterBar filters={filters} onChange={setFilters} />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {counts.map(({ segment, count }) => {
          const meta = SEGMENT_META[segment];
          const Icon = meta.icon;
          return (
            <Card key={segment} className="card-hover">
              <CardBody>
                <div className="flex items-center gap-2">
                  <div className="rounded-lg p-2" style={{ backgroundColor: `${meta.color}1a`, color: meta.color }}>
                    <Icon size={18} />
                  </div>
                  <span className="text-xs font-medium text-slate-500">{segment}</span>
                </div>
                <p className="mt-3 text-2xl font-bold text-slate-900">{fmtNumber(count)}</p>
                <p className="mt-1 text-[11px] leading-snug text-slate-400">{meta.desc}</p>
              </CardBody>
            </Card>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Segment Distribution" subtitle="Customer count per RFM segment" icon={UsersRound} />
          <CardBody>
            <ChartContainer height={300}>
              <BarChart data={counts} margin={{ left: -10, right: 10, top: 10, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="segment" {...axisProps} interval={0} angle={-15} textAnchor="end" height={60} />
                <YAxis {...axisProps} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: unknown) => [`${Number(v)} customers`, 'Count'] as [string, string]} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {counts.map((c) => <Cell key={c.segment} fill={SEGMENT_META[c.segment].color} />)}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Segment Share" subtitle="Proportion of customers" icon={UsersRound} />
          <CardBody>
            <ChartContainer height={300}>
              <PieChart>
                <Pie data={counts} dataKey="count" nameKey="segment" cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={2}>
                  {counts.map((c) => <Cell key={c.segment} fill={SEGMENT_META[c.segment].color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={tipLabel} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ChartContainer>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Average RFM Scores by Segment" subtitle="Recency, Frequency and Monetary (1–4 scale)" icon={BarChart3} />
          <CardBody>
            <ChartContainer height={300}>
              <RadarChart data={radar}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="segment" tick={{ fontSize: 11, fill: '#64748b' }} />
                <Radar name="Recency" dataKey="Recency" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                <Radar name="Frequency" dataKey="Frequency" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
                <Radar name="Monetary" dataKey="Monetary" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} />
              </RadarChart>
            </ChartContainer>
          </CardBody>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader title="Top Customers" subtitle="Highest monetary value customers" icon={Crown} />
        <CardBody>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-2">Customer</th>
                  <th className="px-3 py-2">Recency (days)</th>
                  <th className="px-3 py-2">Frequency</th>
                  <th className="px-3 py-2">Monetary</th>
                  <th className="px-3 py-2">R</th>
                  <th className="px-3 py-2">F</th>
                  <th className="px-3 py-2">M</th>
                  <th className="px-3 py-2">Segment</th>
                </tr>
              </thead>
              <tbody>
                {topCustomers.map((r) => (
                  <tr key={r.customerId} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-3 py-2.5 font-medium text-slate-800">{r.customerId}</td>
                    <td className="px-3 py-2.5 text-slate-600">{r.recency}</td>
                    <td className="px-3 py-2.5 text-slate-600">{r.frequency}</td>
                    <td className="px-3 py-2.5 font-semibold text-slate-800">${r.monetary.toLocaleString()}</td>
                    <td className="px-3 py-2.5"><span className="rounded bg-blue-50 px-1.5 py-0.5 text-xs font-semibold text-blue-600">{r.rScore}</span></td>
                    <td className="px-3 py-2.5"><span className="rounded bg-violet-50 px-1.5 py-0.5 text-xs font-semibold text-violet-600">{r.fScore}</span></td>
                    <td className="px-3 py-2.5"><span className="rounded bg-emerald-50 px-1.5 py-0.5 text-xs font-semibold text-emerald-600">{r.mScore}</span></td>
                    <td className="px-3 py-2.5"><span className="rounded-full px-2 py-0.5 text-xs font-medium text-white" style={{ backgroundColor: SEGMENT_META[r.segment].color }}>{r.segment}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
