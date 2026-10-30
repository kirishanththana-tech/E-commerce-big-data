// Shared Recharts helpers and a responsive chart container.
import { ResponsiveContainer } from 'recharts';

export function ChartContainer({ height = 300, children }: { height?: number; children: React.ReactElement }) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

export const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16', '#0ea5e9', '#a855f7'];

export const axisProps = {
  tick: { fontSize: 11, fill: '#64748b' },
  axisLine: { stroke: '#e2e8f0' },
  tickLine: false,
} as const;

export const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid #e2e8f0',
  boxShadow: '0 8px 20px -8px rgba(15,27,48,0.18)',
  fontSize: 12,
} as const;

export function formatYAxis(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return `${value}`;
}

// Tooltip formatter helpers with Recharts-compatible (loosely-typed) signatures.
export const tipCurrency = (fmt: (n: number) => string) => (v: unknown) => fmt(Number(v));
export const tipCount = (label = 'Count') => (v: unknown) => [`${Number(v)} ${label.toLowerCase()}`, label] as [string, string];
export const tipLabel = (v: unknown, n: unknown) => [`${Number(v)}`, String(n)] as [string, string];
