import { CATEGORIES, COUNTRIES, PAYMENT_METHODS } from '@/data/dataset';
import { Calendar, Filter, Search } from 'lucide-react';
import { DateRange } from '@/data/analytics';

export type Filters = {
  range: DateRange;
  category: string;
  country: string;
  payment: string;
  search: string;
};

export const defaultFilters: Filters = {
  range: { from: '2025-01-01', to: '2025-12-31' },
  category: 'All',
  country: 'All',
  payment: 'All',
  search: '',
};

export function FilterBar({ filters, onChange }: { filters: Filters; onChange: (f: Filters) => void }) {
  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });
  const selectCls = 'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-100';

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
        <Filter size={16} /> Filters
      </div>

      <div className="flex items-center gap-1.5">
        <Calendar size={15} className="text-slate-400" />
        <input type="date" value={filters.range.from} onChange={(e) => set({ range: { ...filters.range, from: e.target.value } })} className={`${selectCls} py-1.5`} />
        <span className="text-slate-400">–</span>
        <input type="date" value={filters.range.to} onChange={(e) => set({ range: { ...filters.range, to: e.target.value } })} className={`${selectCls} py-1.5`} />
      </div>

      <select value={filters.category} onChange={(e) => set({ category: e.target.value })} className={selectCls}>
        <option>All</option>
        {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
      </select>

      <select value={filters.country} onChange={(e) => set({ country: e.target.value })} className={selectCls}>
        <option>All</option>
        {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
      </select>

      <select value={filters.payment} onChange={(e) => set({ payment: e.target.value })} className={selectCls}>
        <option>All</option>
        {PAYMENT_METHODS.map((c) => <option key={c}>{c}</option>)}
      </select>

      <div className="relative ml-auto">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={filters.search}
          onChange={(e) => set({ search: e.target.value })}
          placeholder="Search..."
          className={`${selectCls} pl-8`}
        />
      </div>
    </div>
  );
}

// Applies filters to a search-able set of orders (search matches product/customer/order id).
export function applySearch<T extends { productName: string; customerId: string; orderId: string }>(rows: T[], q: string): T[] {
  if (!q.trim()) return rows;
  const s = q.toLowerCase();
  return rows.filter((r) => r.productName.toLowerCase().includes(s) || r.customerId.toLowerCase().includes(s) || r.orderId.toLowerCase().includes(s));
}
