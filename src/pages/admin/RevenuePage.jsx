import { useEffect, useState } from 'react';
import AdminNav from '../../components/AdminNav';
import { api } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';

const money = (value) => formatCurrency(value);
export default function RevenuePage() {
  const [range, setRange] = useState('30d'), [data, setData] = useState(null), [error, setError] = useState('');
  useEffect(() => { api(`/admin/analytics/revenue?range=${range}`).then((r) => setData(r.data)).catch((e) => setError(e.message)); }, [range]);
  const maximum = Math.max(1, ...(data?.daily || []).map((x) => x.amount));
  return <div className="admin-shell"><AdminNav /><main>
    <header className="page-heading compact"><p className="eyebrow">Business analytics</p><h1>Revenue</h1><p>Verified captured collections—not profit.</p></header>
    <div className="admin-filters"><select value={range} onChange={(e) => { setError(''); setData(null); setRange(e.target.value); }}>{[['7d', '7 days'], ['30d', '30 days'], ['90d', '90 days'], ['this_year', 'This year']].map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></div>
    {error ? <div className="empty-state"><p>{error}</p></div> : !data ? <div className="page-skeleton">Calculating captured revenue…</div> : <>
      <div className="admin-metrics"><article><strong>{money(data.totalCaptured)}</strong><span>Captured revenue</span></article><article><strong>{money(data.totalRefunded)}</strong><span>Refunded</span></article><article><strong>{money(data.netCaptured)}</strong><span>Net captured revenue</span></article><article><strong>{data.paymentCount}</strong><span>Successful payments</span></article></div>
      <section className="operations-card revenue-chart"><h2>Revenue over time</h2><div className="bar-chart">{data.daily.map((point) => <div className="bar-column" key={point.date} title={`${point.date}: ${money(point.amount)}`}><span style={{ height: `${Math.max(4, point.amount / maximum * 100)}%` }} /><small>{point.date.slice(5)}</small></div>)}</div>{!data.daily.length && <p className="empty-inline">No captured payments in this period.</p>}</section>
      <section className="admin-table"><h2>Revenue by plan</h2>{data.revenueByPlan.map((row) => <div className="admin-row" key={row.plan}><div><strong>{row.plan}</strong><small>{row.count} payments</small></div><span>{money(row.amount)}</span></div>)}</section>
    </>}
  </main></div>;
}
