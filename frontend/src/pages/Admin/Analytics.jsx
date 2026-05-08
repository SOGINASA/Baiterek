import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Users,
  FileText,
  CheckCircle,
  Clock,
  BarChart2,
  PieChart,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const PERIODS = ['7 дней', '30 дней', '90 дней', 'Год'];

const METRICS = [
  { id: 'apps',     label: 'Всего заявок',      values: { '7 дней': 84,    '30 дней': 347,   '90 дней': 1024,  'Год': 3847  }, delta: { '7 дней': 12.4, '30 дней': 8.1, '90 дней': 5.3, 'Год': 21.7 }, icon: FileText,    color: 'text-accent',     bg: 'bg-accent/10' },
  { id: 'users',    label: 'Новые пользователи', values: { '7 дней': 212,   '30 дней': 891,   '90 дней': 2640,  'Год': 9870  }, delta: { '7 дней': 5.2,  '30 дней': 11.3,'90 дней': 7.1, 'Год': 18.4 }, icon: Users,       color: 'text-blue-500',   bg: 'bg-blue-500/10' },
  { id: 'approved', label: 'Одобрено заявок',    values: { '7 дней': 51,    '30 дней': 204,   '90 дней': 618,   'Год': 2104  }, delta: { '7 дней': 3.1,  '30 дней': 6.4, '90 дней': 4.2, 'Год': 9.8  }, icon: CheckCircle, color: 'text-emerald-500',bg: 'bg-emerald-500/10' },
  { id: 'time',     label: 'Среднее время, дней',values: { '7 дней': 6.2,   '30 дней': 7.1,   '90 дней': 8.0,   'Год': 8.4   }, delta: { '7 дней': -4.6, '30 дней':-2.1, '90 дней':-1.4, 'Год': -3.1 }, icon: Clock,       color: 'text-amber-500',  bg: 'bg-amber-400/10' },
];

// Monthly chart data (fixed for year)
const MONTHLY = [
  { month: 'Май\'25', apps: 280, approved: 160, users: 710 },
  { month: 'Июн',     apps: 310, approved: 185, users: 780 },
  { month: 'Июл',     apps: 295, approved: 172, users: 750 },
  { month: 'Авг',     apps: 340, approved: 210, users: 820 },
  { month: 'Сен',     apps: 380, approved: 240, users: 900 },
  { month: 'Окт',     apps: 420, approved: 275, users: 980 },
  { month: 'Ноя',     apps: 390, approved: 250, users: 930 },
  { month: 'Дек',     apps: 440, approved: 290, users: 1050 },
  { month: 'Янв\'26', apps: 360, approved: 215, users: 870 },
  { month: 'Фев',     apps: 410, approved: 260, users: 940 },
  { month: 'Мар',     apps: 455, approved: 300, users: 1020 },
  { month: 'Апр',     apps: 490, approved: 320, users: 1090 },
];

const BY_ORG = [
  { org: 'КМФ',         apps: 1240, approved: 880, rate: 71 },
  { org: 'КазГарант',   apps: 920,  approved: 630, rate: 68 },
  { org: 'БРК',         apps: 640,  approved: 410, rate: 64 },
  { org: 'БРК-Лизинг',  apps: 580,  approved: 380, rate: 66 },
  { org: 'КЭГ',         apps: 467,  approved: 290, rate: 62 },
];

const BY_SERVICE = [
  { name: 'Микрокредит для МСБ',       value: 32, color: 'bg-accent' },
  { name: 'Гарантия по кредиту',        value: 24, color: 'bg-blue-500' },
  { name: 'Лизинг оборудования',        value: 18, color: 'bg-purple-500' },
  { name: 'Экспортное страхование',     value: 14, color: 'bg-emerald-500' },
  { name: 'Инвестиционный заём',        value: 8,  color: 'bg-amber-400' },
  { name: 'Прочее',                     value: 4,  color: 'bg-primary/25' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const Delta = ({ value }) => {
  const positive = value > 0;
  const neutral  = value === 0;
  if (neutral) return <span className="flex items-center gap-1 text-xs text-primary/40"><Minus size={12} />0%</span>;
  return (
    <span className={`flex items-center gap-1 text-xs font-medium ${positive ? 'text-emerald-500' : 'text-red-400'}`}>
      {positive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
      {Math.abs(value)}%
    </span>
  );
};

// Simple bar chart using divs
const BarChart = ({ data, period }) => {
  const [hovered, setHovered] = useState(null);
  const maxVal = Math.max(...data.map(d => d.apps));
  return (
    <div className="flex items-end gap-1.5 h-44 px-1">
      {data.map((d, i) => (
        <div
          key={i}
          className="flex-1 flex flex-col items-center gap-1 group cursor-pointer"
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}
        >
          {hovered === i && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute -translate-y-full mb-2 bg-primary text-white text-xs rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-lg pointer-events-none z-10"
              style={{ marginBottom: '8px' }}
            >
              <p className="font-medium">{d.month}</p>
              <p>Заявок: {d.apps}</p>
              <p>Одобрено: {d.approved}</p>
            </motion.div>
          )}
          <div className="relative w-full flex flex-col justify-end" style={{ height: '168px' }}>
            {/* Approved bar (back) */}
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(d.approved / maxVal) * 100}%` }}
              transition={{ delay: i * 0.04, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              className="absolute bottom-0 inset-x-0 bg-emerald-500/30 rounded-t"
            />
            {/* Apps bar (front, narrower) */}
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(d.apps / maxVal) * 100}%` }}
              transition={{ delay: i * 0.04 + 0.05, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              className={`absolute bottom-0 left-1 right-1 rounded-t transition-colors ${hovered === i ? 'bg-accent' : 'bg-accent/60'}`}
            />
          </div>
          <span className="text-[9px] text-primary/30 rotate-45 origin-left translate-x-2">{d.month}</span>
        </div>
      ))}
    </div>
  );
};

// Donut-like horizontal bars for service distribution
const ServiceDistribution = () => {
  return (
    <div className="space-y-3">
      {/* Stacked bar */}
      <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
        {BY_SERVICE.map((s, i) => (
          <motion.div
            key={i}
            initial={{ width: 0 }}
            animate={{ width: `${s.value}%` }}
            transition={{ delay: i * 0.08, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            className={`h-full ${s.color} first:rounded-l-full last:rounded-r-full`}
            title={s.name}
          />
        ))}
      </div>
      {/* Legend */}
      <div className="space-y-2 pt-1">
        {BY_SERVICE.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-sm flex-shrink-0 ${s.color}`} />
            <span className="text-xs text-primary flex-1 truncate">{s.name}</span>
            <span className="text-xs font-medium text-primary">{s.value}%</span>
            <div className="w-16 h-1 bg-primary/8 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${s.value}%` }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
                className={`h-full rounded-full ${s.color}`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminAnalytics() {
  const [period, setPeriod] = useState('Год');

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary">Аналитика</h1>
          <p className="text-primary/50 text-sm mt-0.5">Статистика и показатели работы портала</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Period tabs */}
          <div className="flex items-center bg-bg border border-primary/10 rounded-xl p-1 gap-1">
            {PERIODS.map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  period === p
                    ? 'bg-surface text-primary shadow-sm border border-primary/10'
                    : 'text-primary/50 hover:text-primary'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 border border-primary/10 rounded-xl text-sm text-primary/60 hover:text-primary hover:bg-bg transition-colors">
            <Download size={14} />
            Экспорт
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {METRICS.map((m, i) => {
          const Icon = m.icon;
          const val = m.values[period];
          const delta = m.delta[period];
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="bg-surface border border-primary/8 rounded-xl p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${m.bg}`}>
                  <Icon size={18} className={m.color} />
                </div>
                <Delta value={delta} />
              </div>
              <p className="text-2xl font-bold text-primary">
                {typeof val === 'number' && val % 1 !== 0 ? val.toFixed(1) : val.toLocaleString()}
              </p>
              <p className="text-xs text-primary/50 mt-0.5">{m.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Chart row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Main bar chart */}
        <div className="lg:col-span-2 bg-surface border border-primary/8 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-primary/8">
            <div className="flex items-center gap-2">
              <BarChart2 size={16} className="text-primary/50" />
              <span className="text-sm font-semibold text-primary">Динамика заявок</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-primary/40">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-accent/60" />Подано</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-emerald-500/30" />Одобрено</span>
            </div>
          </div>
          <div className="p-5">
            <BarChart data={MONTHLY} period={period} />
          </div>
        </div>

        {/* Service distribution */}
        <div className="bg-surface border border-primary/8 rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-primary/8">
            <PieChart size={16} className="text-primary/50" />
            <span className="text-sm font-semibold text-primary">По услугам</span>
          </div>
          <div className="p-5">
            <ServiceDistribution />
          </div>
        </div>
      </div>

      {/* By org table */}
      <div className="bg-surface border border-primary/8 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-primary/8">
          <TrendingUp size={16} className="text-primary/50" />
          <span className="text-sm font-semibold text-primary">По организациям</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-primary/35 uppercase tracking-wide border-b border-primary/6">
                <th className="text-left px-5 py-3 font-medium">Организация</th>
                <th className="text-right px-4 py-3 font-medium">Заявок</th>
                <th className="text-right px-4 py-3 font-medium hidden md:table-cell">Одобрено</th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Процент одобрения</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {BY_ORG.map((row, i) => (
                <motion.tr
                  key={row.org}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-bg/60 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-medium text-primary">{row.org}</span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="text-sm text-primary">{row.apps.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-3.5 text-right hidden md:table-cell">
                    <span className="text-sm text-emerald-600 font-medium">{row.approved.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-3.5 hidden lg:table-cell">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-primary/8 rounded-full overflow-hidden max-w-[160px]">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${row.rate}%` }}
                          transition={{ delay: 0.2 + i * 0.06, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                          className="h-full bg-emerald-500/70 rounded-full"
                        />
                      </div>
                      <span className="text-sm font-medium text-primary min-w-[36px]">{row.rate}%</span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}