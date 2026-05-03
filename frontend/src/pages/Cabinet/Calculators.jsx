import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calculator, TrendingUp, Percent, Building2,
  Info, RefreshCw, ArrowRight, CheckCircle2,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt  = n => new Intl.NumberFormat('ru-KZ', { style: 'currency', currency: 'KZT', maximumFractionDigits: 0 }).format(n);
const fmtN = n => new Intl.NumberFormat('ru-KZ').format(Math.round(n));

function calcAnnuity(principal, rateYear, months) {
  if (!principal || !rateYear || !months) return null;
  const r = rateYear / 100 / 12;
  const payment = r === 0 ? principal / months
    : (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  const total = payment * months;
  return { payment, total, overpay: total - principal };
}

// ─── Slider ───────────────────────────────────────────────────────────────────
function SliderField({ label, value, onChange, min, max, step = 1, format, hint }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-primary/55">{label}</label>
        <span className="text-sm font-bold text-primary">{format ? format(value) : value}</span>
      </div>
      <div className="relative h-5 flex items-center">
        <div className="w-full h-1.5 bg-primary/10 rounded-full overflow-hidden">
          <div className="h-full bg-accent rounded-full" style={{ width: `${pct}%` }} />
        </div>
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-5" />
        <div className="absolute w-4 h-4 bg-accent rounded-full border-2 border-white shadow-md pointer-events-none"
          style={{ left: `calc(${pct}% - 8px)` }} />
      </div>
      {hint && <p className="text-[10px] text-primary/35">{hint}</p>}
    </div>
  );
}

function ResultRow({ label, value, accent, large }) {
  return (
    <div className={`flex items-center justify-between py-2.5 border-b border-primary/6 last:border-0 ${large ? 'py-3.5' : ''}`}>
      <p className={`text-sm ${accent ? 'font-semibold text-primary' : 'text-primary/55'}`}>{label}</p>
      <p className={`font-bold ${accent ? 'text-accent' : 'text-sm text-primary'} ${large ? 'text-xl' : ''}`}>{value}</p>
    </div>
  );
}

const TABS = [
  { id: 'credit',  label: 'Кредит',          icon: TrendingUp },
  { id: 'leasing', label: 'Лизинг',          icon: Building2 },
  { id: 'subsidy', label: 'Субсидирование',  icon: Percent },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Calculators() {
  const [tab, setTab] = useState('credit');

  // Credit
  const [crPrincipal, setCrPrincipal] = useState(10_000_000);
  const [crRate,      setCrRate]      = useState(14);
  const [crMonths,    setCrMonths]    = useState(36);

  // Leasing
  const [lsCost,   setLsCost]   = useState(15_000_000);
  const [lsAdv,    setLsAdv]    = useState(20);
  const [lsRate,   setLsRate]   = useState(12);
  const [lsMonths, setLsMonths] = useState(48);

  // Subsidy
  const [sbPrincipal, setSbPrincipal] = useState(20_000_000);
  const [sbRate,      setSbRate]      = useState(18);
  const [sbSubsidy,   setSbSubsidy]   = useState(7);
  const [sbMonths,    setSbMonths]    = useState(60);

  const crResult = useMemo(() => calcAnnuity(crPrincipal, crRate, crMonths), [crPrincipal, crRate, crMonths]);

  const lsResult = useMemo(() => {
    const principal = lsCost * (1 - lsAdv / 100);
    const base = calcAnnuity(principal, lsRate, lsMonths);
    return base ? { ...base, principal } : null;
  }, [lsCost, lsAdv, lsRate, lsMonths]);

  const sbResult = useMemo(() => {
    const full = calcAnnuity(sbPrincipal, sbRate, sbMonths);
    const sub  = calcAnnuity(sbPrincipal, Math.max(0, sbRate - sbSubsidy), sbMonths);
    if (!full || !sub) return null;
    return { fullPayment: full.payment, subsidizedPayment: sub.payment,
             saving: full.payment - sub.payment, totalSaving: (full.payment - sub.payment) * sbMonths };
  }, [sbPrincipal, sbRate, sbSubsidy, sbMonths]);

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <div className="bg-primary relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-accent/8 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl bg-accent/20 flex items-center justify-center">
                <Calculator size={18} className="text-accent" />
              </div>
              <h1 className="text-2xl font-bold text-white">Финансовые калькуляторы</h1>
            </div>
            <p className="text-white/40 text-sm ml-12">Предварительный расчёт платежей по программам господдержки</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {TABS.map(t => { const Icon = t.icon; return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                ${tab === t.id ? 'bg-accent text-white shadow-sm' : 'bg-surface border border-primary/10 text-primary/60 hover:border-accent/40 hover:text-primary'}`}>
              <Icon size={15} />{t.label}
            </button>
          ); })}
        </div>

        <AnimatePresence mode="wait">

          {/* Credit */}
          {tab === 'credit' && (
            <motion.div key="credit" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
              className="grid grid-cols-1 lg:grid-cols-5 gap-5">
              <div className="lg:col-span-3 bg-surface border border-primary/8 rounded-2xl p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-primary">Параметры кредита</h2>
                  <button onClick={() => { setCrPrincipal(10_000_000); setCrRate(14); setCrMonths(36); }}
                    className="flex items-center gap-1.5 text-xs text-primary/40 hover:text-accent transition-colors duration-150">
                    <RefreshCw size={12} />Сбросить
                  </button>
                </div>
                <SliderField label="Сумма кредита" value={crPrincipal} onChange={setCrPrincipal}
                  min={1_000_000} max={200_000_000} step={500_000}
                  format={v => `${fmtN(v)} ₸`} hint="от 1 млн до 200 млн тенге" />
                <SliderField label="Процентная ставка (годовых)" value={crRate} onChange={setCrRate}
                  min={1} max={35} step={0.5} format={v => `${v}%`} />
                <SliderField label="Срок кредита" value={crMonths} onChange={setCrMonths}
                  min={3} max={120} step={3}
                  format={v => `${v} мес. · ${(v / 12).toFixed(1)} лет`} />
                <div className="flex items-start gap-2 bg-accent/6 border border-accent/15 rounded-xl px-4 py-3">
                  <Info size={13} className="text-accent flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-primary/55 leading-relaxed">Расчёт по аннуитетной схеме. Итоговые условия определяются организацией по результатам рассмотрения заявки.</p>
                </div>
              </div>
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-surface border border-primary/8 rounded-2xl p-6">
                  <p className="text-xs font-semibold text-primary/40 uppercase tracking-wider mb-4">Результат расчёта</p>
                  {crResult ? (
                    <>
                      <ResultRow label="Ежемесячный платёж" value={fmt(crResult.payment)} accent large />
                      <ResultRow label="Сумма кредита"       value={fmt(crPrincipal)} />
                      <ResultRow label="Всего выплат"        value={fmt(crResult.total)} />
                      <ResultRow label="Переплата"           value={fmt(crResult.overpay)} />
                      <ResultRow label="Срок"                value={`${crMonths} мес.`} />
                    </>
                  ) : <p className="text-sm text-primary/30 text-center py-6">Заполните параметры</p>}
                </div>
                {crResult && (
                  <div className="bg-surface border border-primary/8 rounded-2xl p-5">
                    <p className="text-xs text-primary/40 mb-3">Структура выплат</p>
                    <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5 mb-3">
                      <div className="bg-accent rounded-l-full transition-all duration-500"
                        style={{ width: `${(crPrincipal / crResult.total * 100).toFixed(1)}%` }} />
                      <div className="bg-rose-400/50 flex-1 rounded-r-full" />
                    </div>
                    <div className="flex items-center gap-4 text-xs text-primary/45">
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-accent" />Основной долг</span>
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-400/50" />Проценты</span>
                    </div>
                  </div>
                )}
                <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl
                  bg-accent text-white text-sm font-medium hover:bg-accent-light transition-colors duration-150">
                  Подать заявку на кредит <ArrowRight size={15} />
                </button>
              </div>
            </motion.div>
          )}

          {/* Leasing */}
          {tab === 'leasing' && (
            <motion.div key="leasing" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
              className="grid grid-cols-1 lg:grid-cols-5 gap-5">
              <div className="lg:col-span-3 bg-surface border border-primary/8 rounded-2xl p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-primary">Параметры лизинга</h2>
                  <button onClick={() => { setLsCost(15_000_000); setLsAdv(20); setLsRate(12); setLsMonths(48); }}
                    className="flex items-center gap-1.5 text-xs text-primary/40 hover:text-accent transition-colors duration-150">
                    <RefreshCw size={12} />Сбросить
                  </button>
                </div>
                <SliderField label="Стоимость предмета лизинга" value={lsCost} onChange={setLsCost}
                  min={1_000_000} max={500_000_000} step={1_000_000} format={v => `${fmtN(v)} ₸`} />
                <SliderField label="Авансовый платёж" value={lsAdv} onChange={setLsAdv}
                  min={10} max={50} step={5}
                  format={v => `${v}%  (${fmtN(lsCost * v / 100)} ₸)`}
                  hint="Как правило, от 10% до 50% стоимости" />
                <SliderField label="Удорожание (годовых)" value={lsRate} onChange={setLsRate}
                  min={1} max={25} step={0.5} format={v => `${v}%`} />
                <SliderField label="Срок лизинга" value={lsMonths} onChange={setLsMonths}
                  min={12} max={120} step={6} format={v => `${v} мес. · ${(v / 12).toFixed(1)} лет`} />
                <div className="flex items-start gap-2 bg-accent/6 border border-accent/15 rounded-xl px-4 py-3">
                  <Info size={13} className="text-accent flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-primary/55 leading-relaxed">Авансовый платёж вносится при заключении договора лизинга и не включается в ежемесячные выплаты.</p>
                </div>
              </div>
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-surface border border-primary/8 rounded-2xl p-6">
                  <p className="text-xs font-semibold text-primary/40 uppercase tracking-wider mb-4">Результат расчёта</p>
                  {lsResult ? (
                    <>
                      <ResultRow label="Ежемесячный платёж"  value={fmt(lsResult.payment)}           accent large />
                      <ResultRow label="Авансовый платёж"    value={fmt(lsCost * lsAdv / 100)} />
                      <ResultRow label="Сумма финансирования" value={fmt(lsResult.principal)} />
                      <ResultRow label="Удорожание"           value={fmt(lsResult.overpay)} />
                      <ResultRow label="Итого с авансом"     value={fmt(lsResult.total + lsCost * lsAdv / 100)} />
                      <ResultRow label="Срок"                 value={`${lsMonths} мес.`} />
                    </>
                  ) : <p className="text-sm text-primary/30 text-center py-6">Заполните параметры</p>}
                </div>
                {lsResult && (
                  <div className="bg-surface border border-primary/8 rounded-2xl p-5">
                    <p className="text-xs text-primary/40 mb-3">Структура затрат</p>
                    <div className="space-y-2.5">
                      {[
                        { label: 'Аванс',        val: lsCost * lsAdv / 100,  total: lsResult.total + lsCost * lsAdv / 100, color: 'bg-accent' },
                        { label: 'Тело лизинга', val: lsResult.principal,     total: lsResult.total + lsCost * lsAdv / 100, color: 'bg-blue-400' },
                        { label: 'Удорожание',   val: lsResult.overpay,       total: lsResult.total + lsCost * lsAdv / 100, color: 'bg-rose-400/60' },
                      ].map(item => (
                        <div key={item.label}>
                          <div className="flex justify-between text-xs text-primary/45 mb-1">
                            <span className="flex items-center gap-1.5"><span className={`w-2 h-2 rounded-full ${item.color}`} />{item.label}</span>
                            <span>{fmtN(item.val)} ₸</span>
                          </div>
                          <div className="h-1.5 bg-primary/8 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${item.color} transition-all duration-500`}
                              style={{ width: `${Math.min(100, item.val / item.total * 100).toFixed(1)}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl
                  bg-accent text-white text-sm font-medium hover:bg-accent-light transition-colors duration-150">
                  Подать заявку на лизинг <ArrowRight size={15} />
                </button>
              </div>
            </motion.div>
          )}

          {/* Subsidy */}
          {tab === 'subsidy' && (
            <motion.div key="subsidy" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
              className="grid grid-cols-1 lg:grid-cols-5 gap-5">
              <div className="lg:col-span-3 bg-surface border border-primary/8 rounded-2xl p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-primary">Параметры субсидирования</h2>
                  <button onClick={() => { setSbPrincipal(20_000_000); setSbRate(18); setSbSubsidy(7); setSbMonths(60); }}
                    className="flex items-center gap-1.5 text-xs text-primary/40 hover:text-accent transition-colors duration-150">
                    <RefreshCw size={12} />Сбросить
                  </button>
                </div>
                <SliderField label="Сумма займа" value={sbPrincipal} onChange={setSbPrincipal}
                  min={1_000_000} max={300_000_000} step={1_000_000} format={v => `${fmtN(v)} ₸`} />
                <SliderField label="Ставка банка (годовых)" value={sbRate} onChange={setSbRate}
                  min={5} max={40} step={0.5} format={v => `${v}%`} hint="Базовая ставка, установленная банком" />
                <SliderField label="Размер субсидии" value={sbSubsidy} onChange={setSbSubsidy}
                  min={1} max={Math.min(sbRate - 1, 15)} step={0.5}
                  format={v => `${v}%  →  ваша ставка: ${(sbRate - v).toFixed(1)}%`}
                  hint="Часть ставки, оплачиваемая государством" />
                <SliderField label="Срок займа" value={sbMonths} onChange={setSbMonths}
                  min={6} max={120} step={6} format={v => `${v} мес. · ${(v / 12).toFixed(1)} лет`} />
                <div className="flex items-start gap-2 bg-emerald-400/8 border border-emerald-400/20 rounded-xl px-4 py-3">
                  <CheckCircle2 size={13} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-primary/55 leading-relaxed">
                    Субсидирование снижает эффективную ставку по займу за счёт частичного покрытия процентов государством.
                  </p>
                </div>
              </div>
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-surface border border-primary/8 rounded-2xl p-6">
                  <p className="text-xs font-semibold text-primary/40 uppercase tracking-wider mb-4">Результат расчёта</p>
                  {sbResult ? (
                    <>
                      <ResultRow label="Ваш платёж (с субсидией)"  value={fmt(sbResult.subsidizedPayment)} accent large />
                      <ResultRow label="Платёж без субсидии"        value={fmt(sbResult.fullPayment)} />
                      <ResultRow label="Ежемесячная экономия"       value={fmt(sbResult.saving)} />
                      <ResultRow label="Экономия за весь срок"      value={fmt(sbResult.totalSaving)} />
                      <ResultRow label="Ставка для вас"             value={`${(sbRate - sbSubsidy).toFixed(1)}%`} />
                      <ResultRow label="Субсидия государства"       value={`${sbSubsidy}%`} />
                    </>
                  ) : <p className="text-sm text-primary/30 text-center py-6">Заполните параметры</p>}
                </div>
                {sbResult && (
                  <div className="bg-surface border border-primary/8 rounded-2xl p-5">
                    <p className="text-xs text-primary/40 mb-3">Сравнение ставок</p>
                    <div className="space-y-3">
                      {[
                        { label: 'Ставка банка', val: sbRate, max: sbRate, color: 'bg-rose-400/50', textColor: 'text-primary/70' },
                        { label: 'Ваша ставка',  val: sbRate - sbSubsidy, max: sbRate, color: 'bg-emerald-400', textColor: 'text-emerald-400' },
                      ].map(item => (
                        <div key={item.label}>
                          <div className="flex justify-between text-xs text-primary/45 mb-1.5">
                            <span>{item.label}</span>
                            <span className={`font-semibold ${item.textColor}`}>{item.val.toFixed(1)}%</span>
                          </div>
                          <div className="h-2.5 bg-primary/8 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${item.color} transition-all duration-500`}
                              style={{ width: `${(item.val / item.max * 100).toFixed(1)}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-primary/6 flex items-center justify-between">
                      <p className="text-xs text-primary/40">Субсидия покрывает</p>
                      <p className="text-sm font-bold text-emerald-400">{(sbSubsidy / sbRate * 100).toFixed(0)}% ставки</p>
                    </div>
                  </div>
                )}
                <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl
                  bg-accent text-white text-sm font-medium hover:bg-accent-light transition-colors duration-150">
                  Подать заявку на субсидию <ArrowRight size={15} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-xs text-primary/30 text-center mt-8 max-w-xl mx-auto leading-relaxed">
          Расчёты носят информационный характер и не являются офертой.
          Окончательные условия определяются организацией-партнёром после рассмотрения заявки.
        </p>
      </div>
    </div>
  );
}