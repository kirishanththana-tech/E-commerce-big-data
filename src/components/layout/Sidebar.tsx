import { BarChart3, Boxes, Brain, Database, FileBarChart, FileText, LayoutDashboard, Sparkles, Users, UsersRound, X } from 'lucide-react';

export type PageKey =
  | 'dashboard'
  | 'sales'
  | 'customer-behaviour'
  | 'segmentation'
  | 'products'
  | 'big-data'
  | 'predictive'
  | 'datasets'
  | 'reports'
  | 'settings';

export const NAV_ITEMS: { key: PageKey; label: string; icon: typeof LayoutDashboard }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'sales', label: 'Sales Analytics', icon: BarChart3 },
  { key: 'customer-behaviour', label: 'Customer Behaviour', icon: Users },
  { key: 'segmentation', label: 'Customer Segmentation', icon: UsersRound },
  { key: 'products', label: 'Product Analytics', icon: Boxes },
  { key: 'big-data', label: 'Big Data Processing', icon: Sparkles },
  { key: 'predictive', label: 'Predictive Analytics', icon: Brain },
  { key: 'datasets', label: 'Dataset Management', icon: Database },
  { key: 'reports', label: 'Reports', icon: FileBarChart },
  { key: 'settings', label: 'Settings', icon: FileText },
];

export function Sidebar({ active, onNavigate, mobileOpen, onClose }: { active: PageKey; onNavigate: (k: PageKey) => void; mobileOpen: boolean; onClose: () => void }) {
  return (
    <>
      {mobileOpen && <div className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed z-40 h-full w-64 transform bg-navy-950 text-navy-100 transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-lg">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-white">BigShop</p>
              <p className="text-[10px] text-navy-300">Analytics Suite</p>
            </div>
          </div>
          <button onClick={onClose} className="text-navy-300 hover:text-white lg:hidden">
            <X size={20} />
          </button>
        </div>

        <nav className="mt-2 space-y-1 px-3">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.key;
            return (
              <button
                key={item.key}
                onClick={() => { onNavigate(item.key); onClose(); }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-md' : 'text-navy-200 hover:bg-navy-800 hover:text-white'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-0 right-0 px-5">
          <div className="rounded-xl bg-navy-900/60 p-3 text-xs text-navy-300">
            <p className="font-semibold text-navy-100">Big Data Project</p>
            <p className="mt-1 text-navy-400">E-Commerce Analytics v1.0</p>
          </div>
        </div>
      </aside>
    </>
  );
}
