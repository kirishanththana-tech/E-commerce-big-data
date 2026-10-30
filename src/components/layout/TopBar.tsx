import { Bell, Menu, Search } from 'lucide-react';

export function TopBar({ title, onMenu }: { title: string; onMenu: () => void }) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur lg:px-8">
      <button onClick={onMenu} className="text-slate-600 lg:hidden">
        <Menu size={22} />
      </button>
      <h1 className="text-lg font-bold text-slate-900">{title}</h1>

      <div className="relative ml-auto hidden md:block">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          placeholder="Quick search..."
          className="w-56 rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 focus:border-navy-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-100"
        />
      </div>

      <button className="relative ml-2 rounded-lg p-2 text-slate-600 hover:bg-slate-100">
        <Bell size={20} />
        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500" />
      </button>

      <div className="flex items-center gap-2 rounded-lg pl-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-navy-700 to-navy-900 text-sm font-bold text-white">DA</div>
        <div className="hidden lg:block">
          <p className="text-sm font-semibold text-slate-800">Data Admin</p>
          <p className="text-xs text-slate-500">Administrator</p>
        </div>
      </div>
    </header>
  );
}
