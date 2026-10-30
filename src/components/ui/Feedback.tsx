import { Loader2, LucideIcon } from 'lucide-react';

export function Loading({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-400">
      <Loader2 className="h-8 w-8 animate-spin text-navy-500" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function EmptyState({ title, message, icon: Icon }: { title: string; message: string; icon: LucideIcon }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <div className="rounded-full bg-slate-100 p-4 text-slate-400">
        <Icon size={28} />
      </div>
      <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      <p className="max-w-xs text-xs text-slate-500">{message}</p>
    </div>
  );
}

export function SectionTitle({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
