import { useMemo } from 'react';
import { BarChart3, Boxes, Download, FileBarChart, FileText, Printer, Users } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { SectionTitle } from '@/components/ui/Feedback';
import { ORDERS } from '@/data/dataset';
import { computeKPIs, fmtCurrency, fmtNumber, rfmAnalysis, revenueByCategory, segmentCounts, topProducts, bottomProducts, salesByCountry, customerLifetimeValue } from '@/data/analytics';
import { downloadCSV, downloadText } from '@/utils/export';

export function ReportsPage() {
  const kpis = useMemo(() => computeKPIs(ORDERS, ORDERS), []);
  const catRev = useMemo(() => revenueByCategory(ORDERS), []);
  const top = useMemo(() => topProducts(ORDERS, 10), []);
  const bottom = useMemo(() => bottomProducts(ORDERS, 5), []);
  const byCountry = useMemo(() => salesByCountry(ORDERS), []);
  const rfm = useMemo(() => rfmAnalysis(ORDERS), []);
  const segs = useMemo(() => segmentCounts(rfm), [rfm]);
  const clv = useMemo(() => customerLifetimeValue(ORDERS), []);

  const reports = [
    { title: 'Sales Summary', desc: 'Revenue, orders, AOV, top categories & countries', icon: BarChart3, export: () => downloadCSV('sales_summary.csv', [...catRev, ...byCountry.map((c) => ({ Country: c.country, Revenue: c.revenue, Orders: c.orders }))]) },
    { title: 'Customer Behaviour Report', desc: 'New vs returning, frequency, retention, CLV', icon: Users, export: () => downloadCSV('customer_behaviour_report.csv', rfm.slice(0, 50).map((r) => ({ customerId: r.customerId, recency: r.recency, frequency: r.frequency, monetary: r.monetary, segment: r.segment }))) },
    { title: 'Product Performance Report', desc: 'Top & bottom products by revenue and units', icon: Boxes, export: () => downloadCSV('product_performance.csv', [...top.map((p) => ({ rank: 'top', product: p.name, units: p.units, revenue: p.revenue })), ...bottom.map((p) => ({ rank: 'bottom', product: p.name, units: p.units, revenue: p.revenue }))]) },
    { title: 'Customer Segmentation Report', desc: 'RFM segment counts and customer-level scores', icon: FileBarChart, export: () => downloadCSV('segmentation_report.csv', segs.map((s) => ({ segment: s.segment, count: s.count }))) },
  ];

  function exportPDF() {
    // Browser-friendly: open a printable HTML report (acts as PDF via print dialog).
    const html = `<!doctype html><html><head><title>E-Commerce Analytics Report</title>
      <style>
        body{font-family:Inter,Arial,sans-serif;padding:40px;color:#0f172a}
        h1{font-size:24px;margin-bottom:8px} h2{font-size:16px;margin-top:24px;border-bottom:1px solid #e2e8f0;padding-bottom:6px}
        table{width:100%;border-collapse:collapse;margin-top:8px;font-size:12px} th,td{text-align:left;padding:6px 8px;border-bottom:1px solid #f1f5f9}
        th{color:#64748b;text-transform:uppercase;font-size:10px} .kpi{display:flex;gap:24px;flex-wrap:wrap;margin-top:12px}
        .kpi div{background:#f8fafc;border-radius:8px;padding:12px 16px;min-width:140px}
        .kpi p{margin:0} .kpi .label{font-size:11px;color:#64748b} .kpi .val{font-size:18px;font-weight:700}
      </style></head><body>
      <h1>E-Commerce Customer Behaviour & Sales Analytics Report</h1>
      <p>Generated ${new Date().toLocaleDateString()} — Sample dataset (${ORDERS.length.toLocaleString()} orders)</p>
      <div class="kpi">
        <div><p class="label">Total Revenue</p><p class="val">${fmtCurrency(kpis.revenue.raw)}</p></div>
        <div><p class="label">Total Orders</p><p class="val">${fmtNumber(kpis.ordersCount.raw)}</p></div>
        <div><p class="label">Customers</p><p class="val">${fmtNumber(kpis.customers.raw)}</p></div>
        <div><p class="label">Avg Order Value</p><p class="val">${fmtCurrency(kpis.aov.raw)}</p></div>
        <div><p class="label">Retention</p><p class="val">${kpis.retention.value}</p></div>
        <div><p class="label">Est. CLV</p><p class="val">${fmtCurrency(clv.clv)}</p></div>
      </div>
      <h2>Revenue by Category</h2><table><tr><th>Category</th><th>Revenue</th></tr>${catRev.map((c) => `<tr><td>${c.category}</td><td>${fmtCurrency(c.revenue)}</td></tr>`).join('')}</table>
      <h2>Sales by Country</h2><table><tr><th>Country</th><th>Revenue</th><th>Orders</th></tr>${byCountry.map((c) => `<tr><td>${c.country}</td><td>${fmtCurrency(c.revenue)}</td><td>${c.orders}</td></tr>`).join('')}</table>
      <h2>Top Products</h2><table><tr><th>Product</th><th>Units</th><th>Revenue</th></tr>${top.map((p) => `<tr><td>${p.name}</td><td>${p.units}</td><td>${fmtCurrency(p.revenue)}</td></tr>`).join('')}</table>
      <h2>Customer Segments</h2><table><tr><th>Segment</th><th>Count</th></tr>${segs.map((s) => `<tr><td>${s.segment}</td><td>${s.count}</td></tr>`).join('')}</table>
      <p style="margin-top:24px;color:#94a3b8;font-size:11px">E-Commerce Big Data Analytics Project — demonstration report.</p>
      </body></html>`;
    const w = window.open('', '_blank');
    if (w) { w.document.write(html); w.document.close(); setTimeout(() => w.print(), 400); }
    else downloadText('analytics_report.html', html, 'text/html');
  }

  return (
    <div className="animate-fade-in">
      <SectionTitle
        title="Reports"
        subtitle="Generate and download analytics reports in CSV or PDF"
        action={
          <button onClick={exportPDF} className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:opacity-90">
            <Printer size={16} /> Download PDF
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {reports.map((r) => {
          const Icon = r.icon;
          return (
            <Card key={r.title} className="card-hover">
              <CardBody>
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-navy-50 p-3 text-navy-600"><Icon size={22} /></div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-slate-800">{r.title}</h3>
                    <p className="mt-1 text-xs text-slate-500">{r.desc}</p>
                    <div className="mt-3 flex gap-2">
                      <button onClick={r.export} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
                        <Download size={14} /> CSV
                      </button>
                      <button onClick={exportPDF} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
                        <FileText size={14} /> PDF
                      </button>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Sales Summary" subtitle="Headline KPIs" icon={BarChart3} />
          <CardBody>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {Object.values(kpis).map((k) => (
                <div key={k.label} className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">{k.label}</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">{k.value}</p>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Segment Snapshot" subtitle="RFM customer distribution" icon={Users} />
          <CardBody>
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500"><th className="py-2">Segment</th><th className="py-2">Customers</th><th className="py-2">Share</th></tr></thead>
              <tbody>
                {segs.map((s) => {
                  const total = segs.reduce((a, b) => a + b.count, 0) || 1;
                  return (
                    <tr key={s.segment} className="border-b border-slate-100 last:border-0">
                      <td className="py-2.5 font-medium text-slate-800">{s.segment}</td>
                      <td className="py-2.5 text-slate-600">{s.count}</td>
                      <td className="py-2.5 text-slate-500">{((s.count / total) * 100).toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
