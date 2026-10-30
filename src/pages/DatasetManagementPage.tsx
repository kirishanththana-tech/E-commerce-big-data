import { useMemo, useRef, useState } from 'react';
import { Database, Download, FileSpreadsheet, Search, Upload } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { SectionTitle, EmptyState } from '@/components/ui/Feedback';
import { ORDERS, Order } from '@/data/dataset';
import { downloadCSV, parseCSV } from '@/utils/export';

const FIELDS = ['Order ID', 'Customer ID', 'Product ID', 'Product Name', 'Category', 'Quantity', 'Price', 'Order Date', 'Country', 'Payment Method'] as const;

function orderToRow(o: Order) {
  return {
    'Order ID': o.orderId,
    'Customer ID': o.customerId,
    'Product ID': o.productId,
    'Product Name': o.productName,
    Category: o.category,
    Quantity: String(o.quantity),
    Price: o.price.toFixed(2),
    'Order Date': o.orderDate,
    Country: o.country,
    'Payment Method': o.paymentMethod,
  };
}

export function DatasetManagementPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [customRows, setCustomRows] = useState<Record<string, string>[] | null>(null);
  const [customName, setCustomName] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [country, setCountry] = useState('All');
  const [page, setPage] = useState(0);
  const pageSize = 12;

  const base = customRows || ORDERS.map(orderToRow);
  const categories = useMemo(() => Array.from(new Set(base.map((r) => r.Category))), [base]);
  const countries = useMemo(() => Array.from(new Set(base.map((r) => r.Country))), [base]);

  const filtered = useMemo(() => {
    return base.filter((r) => {
      if (category !== 'All' && r.Category !== category) return false;
      if (country !== 'All' && r.Country !== country) return false;
      if (search.trim()) {
        const s = search.toLowerCase();
        if (![r['Order ID'], r['Customer ID'], r['Product Name'], r['Product ID']].some((v) => v.toLowerCase().includes(s))) return false;
      }
      return true;
    });
  }, [base, search, category, country]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const current = filtered.slice(page * pageSize, (page + 1) * pageSize);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = parseCSV(String(reader.result || ''));
      setCustomRows(parsed);
      setCustomName(file.name);
      setPage(0);
    };
    reader.readAsText(file);
  }

  return (
    <div className="animate-fade-in">
      <SectionTitle
        title="Dataset Management"
        subtitle="Upload, import, search, filter and export e-commerce records"
        action={
          <button onClick={() => downloadCSV('ecommerce_dataset.csv', filtered)} className="inline-flex items-center gap-2 rounded-lg bg-navy-700 px-4 py-2 text-sm font-medium text-white hover:bg-navy-800">
            <Download size={16} /> Export CSV
          </button>
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Upload / Import Dataset" subtitle="Upload a CSV or use the built-in e-commerce dataset" icon={Upload} />
          <CardBody>
            <div onClick={() => inputRef.current?.click()} className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-8 text-center hover:border-navy-400 hover:bg-navy-50/40">
              <div className="rounded-full bg-navy-100 p-3 text-navy-600"><Upload size={22} /></div>
              <p className="mt-2 text-sm font-medium text-slate-700">Click to upload CSV</p>
              <p className="text-xs text-slate-400">Columns: {FIELDS.join(', ')}</p>
              <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={onFile} />
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <button onClick={() => { setCustomRows(ORDERS.map(orderToRow)); setCustomName('imported_sample_dataset.csv'); setPage(0); }} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                <FileSpreadsheet size={16} /> Import sample e-commerce dataset
              </button>
              {customRows && (
                <button onClick={() => { setCustomRows(null); setCustomName(''); setPage(0); }} className="rounded-lg px-4 py-2 text-sm text-slate-500 hover:text-slate-700">Reset to default</button>
              )}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Dataset Stats" subtitle="Record overview" icon={Database} />
          <CardBody>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Source</span><span className="font-medium text-slate-800">{customRows ? customName || 'Uploaded CSV' : 'Built-in dataset'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Total records</span><span className="font-semibold text-slate-800">{base.length.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Filtered records</span><span className="font-semibold text-slate-800">{filtered.length.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Categories</span><span className="font-semibold text-slate-800">{categories.length}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Countries</span><span className="font-semibold text-slate-800">{countries.length}</span></div>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Records" subtitle={`Showing ${current.length} of ${filtered.length.toLocaleString()} filtered records`} icon={Database} />
        <CardBody>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} placeholder="Search order, customer, product..." className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-100" />
            </div>
            <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(0); }} className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-navy-400 focus:outline-none">
              <option value="All">All categories</option>
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
            <select value={country} onChange={(e) => { setCountry(e.target.value); setPage(0); }} className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-navy-400 focus:outline-none">
              <option value="All">All countries</option>
              {countries.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          {current.length === 0 ? (
            <EmptyState title="No records found" message="Try changing the search term or filters." icon={Search} />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                      {FIELDS.map((h) => <th key={h} className="whitespace-nowrap px-3 py-2">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {current.map((r, i) => (
                      <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                        {FIELDS.map((h) => <td key={h} className="whitespace-nowrap px-3 py-2.5 text-slate-600">{r[h]}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-slate-500">Page {page + 1} of {totalPages}</span>
                <div className="flex gap-2">
                  <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm disabled:opacity-40">Previous</button>
                  <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm disabled:opacity-40">Next</button>
                </div>
              </div>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
