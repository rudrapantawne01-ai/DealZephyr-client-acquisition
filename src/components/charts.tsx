'use client';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { MonthResult } from '@/lib/model';
import { money, monthName } from '@/lib/format';

type Point = { month: string; label: string; selected: number; base?: number; revenue: number; expenses: number; burn: number; headcount: number };
function points(months: MonthResult[], base?: MonthResult[]): Point[] {
  return months.slice(0, 18).map((m, i) => ({ month: m.month, label: monthName(m.month), selected: m.closingCash,
    base: base?.[i]?.closingCash, revenue: m.revenue, expenses: m.expenses, burn: m.netBurn, headcount: m.headcount }));
}
const tick = { fill: '#8a8981', fontSize: 11 };
function ChartTooltip({ active, payload, label, unit = 'money' }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string; unit?: 'money' | 'number' }) {
  if (!active || !payload?.length) return null;
  return <div className="chart-tooltip"><strong>{label}</strong>{payload.map((p, i) => <div key={i}><span className="tip-dot" style={{ background: p.color }} />{p.name}<b>{unit === 'money' ? money(p.value) : Math.round(p.value)}</b></div>)}</div>;
}
function chartXAxis() { return <XAxis dataKey="label" axisLine={false} tickLine={false} tick={tick} minTickGap={28} tickMargin={12} />; }
function chartYAxis(unit: 'money' | 'number' = 'money') { return <YAxis axisLine={false} tickLine={false} tick={tick} width={52} tickFormatter={v => unit === 'money' ? money(v, 0) : String(v)} />; }
function Grid() { return <CartesianGrid stroke="#e8e4db" strokeDasharray="3 5" vertical={false} />; }
export function CashChart({ months, base, compact = false }: { months: MonthResult[]; base?: MonthResult[]; compact?: boolean }) {
  return <div className={compact ? 'chart compact' : 'chart'}><ResponsiveContainer width="100%" height="100%"><AreaChart data={points(months, base)} margin={{ top: 18, right: 8, left: -8, bottom: 2 }}>
    <defs><linearGradient id="cashFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#cc7650" stopOpacity={0.22} /><stop offset="100%" stopColor="#cc7650" stopOpacity={0.005} /></linearGradient></defs>
    <Grid />{chartXAxis()}{chartYAxis()}<Tooltip content={<ChartTooltip />} /><ReferenceLine y={0} stroke="#8c9991" strokeDasharray="5 4" />
    {base && <Area dataKey="base" name="Base plan" type="monotone" stroke="#9eb1a9" strokeWidth={2} strokeDasharray="5 5" fill="transparent" dot={false} isAnimationActive={false} />}
    <Area dataKey="selected" name="Selected plan" type="monotone" stroke="#c76d48" strokeWidth={3} fill="url(#cashFill)" dot={false} isAnimationActive={false} />
  </AreaChart></ResponsiveContainer></div>;
}
export function BurnChart({ months }: { months: MonthResult[] }) {
  return <div className="chart small"><ResponsiveContainer width="100%" height="100%"><BarChart data={points(months)} margin={{ top: 12, right: 6, left: -8, bottom: 0 }}>
    <Grid />{chartXAxis()}{chartYAxis()}<Tooltip content={<ChartTooltip />} /><ReferenceLine y={0} stroke="#8c9991" />
    <Bar dataKey="burn" name="Net burn" fill="#c76d48" radius={[3,3,0,0]} maxBarSize={18} isAnimationActive={false} />
  </BarChart></ResponsiveContainer></div>;
}
export function RevenueExpenseChart({ months }: { months: MonthResult[] }) {
  return <div className="chart small"><ResponsiveContainer width="100%" height="100%"><LineChart data={points(months)} margin={{ top: 12, right: 6, left: -8, bottom: 0 }}>
    <Grid />{chartXAxis()}{chartYAxis()}<Tooltip content={<ChartTooltip />} />
    <Line dataKey="revenue" name="Revenue" type="monotone" stroke="#57796d" strokeWidth={2.5} dot={false} isAnimationActive={false} />
    <Line dataKey="expenses" name="Expenses" type="monotone" stroke="#c76d48" strokeWidth={2.5} dot={false} isAnimationActive={false} />
  </LineChart></ResponsiveContainer></div>;
}
export function HeadcountChart({ months }: { months: MonthResult[] }) {
  return <div className="chart small"><ResponsiveContainer width="100%" height="100%"><AreaChart data={points(months)} margin={{ top: 12, right: 6, left: -8, bottom: 0 }}>
    <Grid />{chartXAxis()}{chartYAxis('number')}<Tooltip content={<ChartTooltip unit="number" />} />
    <Area dataKey="headcount" name="Employees" type="stepAfter" stroke="#253b4c" strokeWidth={2.5} fill="#253b4c" fillOpacity={0.08} dot={false} isAnimationActive={false} />
  </AreaChart></ResponsiveContainer></div>;
}
