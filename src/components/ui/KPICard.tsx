import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Card } from './Card';
import { LucideIcon } from 'lucide-react';

type Props = {
  label: string;
  value: string;
  growth: number;
  icon: LucideIcon;
  accent?: 'blue' | 'purple' | 'emerald' | 'amber' | 'rose' | 'cyan';
};

const accents: Record<string, string> = {
  blue: 'from-blue-500 to-blue-600',
  purple: 'from-violet-500 to-violet-600',
  emerald: 'from-emerald-500 to-emerald-600',
  amber: 'from-amber-500 to-amber-600',
  rose: 'from-rose-500 to-rose-600',
  cyan: 'from-cyan-500 to-cyan-600',
};

export function KPICard({ label, value, growth, icon: Icon, accent = 'blue' }: Props) {
  const up = growth >= 0;
  return (
    <Card className="card-hover overflow-hidden">
      <div className="flex items-center justify-between p-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
          <div className="mt-2 flex items-center gap-1">
            <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${up ? 'text-emerald-600' : 'text-red-600'}`}>
              {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {Math.abs(growth).toFixed(1)}%
            </span>
            <span className="text-xs text-slate-400">vs prev period</span>
          </div>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${accents[accent]} text-white shadow-lg`}>
          <Icon size={22} />
        </div>
      </div>
    </Card>
  );
}
