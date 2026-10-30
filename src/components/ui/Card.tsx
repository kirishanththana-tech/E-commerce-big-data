import { LucideIcon } from 'lucide-react';

export function Card({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <div className={`card ${className}`}>{children}</div>;
}

export function CardHeader({ title, subtitle, icon: Icon }: { title: string; subtitle?: string; icon?: LucideIcon }) {
  return (
    <div className="flex items-start justify-between gap-3 px-5 pt-5">
      <div>
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
      </div>
      {Icon && (
        <div className="rounded-lg bg-navy-50 p-2 text-navy-600">
          <Icon size={18} />
        </div>
      )}
    </div>
  );
}

export function CardBody({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <div className={`px-5 pb-5 pt-4 ${className}`}>{children}</div>;
}

export function Badge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'up' | 'down' }) {
  const tones = {
    neutral: 'bg-slate-100 text-slate-600',
    up: 'bg-emerald-50 text-emerald-600',
    down: 'bg-red-50 text-red-600',
  };
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}
