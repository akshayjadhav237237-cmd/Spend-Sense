import React, { useMemo, useState } from 'react';
import { Settings, TriangleAlert } from 'lucide-react';
import { CATEGORIES, formatCurr, getMonthKey, getCurrentMonthKey, getTodayISO, getBudgetPercent, getInitials, getRelativeDateLabel } from '../utils.js';

export default function HomeView({ settings, expenses, lendings, setActiveTab, setShowSettings }) {
  const sym = settings.currency;
  const mk = getCurrentMonthKey();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const monthlyTotal = useMemo(() => expenses.filter(e => getMonthKey(e.date) === mk).reduce((s, e) => s + e.amount, 0), [expenses, mk]);
  const pendingTotal = useMemo(() => lendings.filter(l => l.status === 'pending' || l.status === 'partial').reduce((s, l) => s + (parseFloat(l.amount) || 0), 0), [lendings]);

  const budgetPct = useMemo(() => getBudgetPercent(expenses, settings.budgetLimit), [expenses, settings.budgetLimit]);
  const budgetColor = budgetPct < 70 ? '#51CF66' : budgetPct < 90 ? '#FFD93D' : '#FF6B6B';

  const streak = useMemo(() => {
    let count = 0;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    for (let i = 0; i < 365; i++) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      if (expenses.some(e => e.date === iso)) count++;
      else break;
    }
    return count;
  }, [expenses]);

  const recentActivity = useMemo(() => {
    const merged = [
      ...expenses.map(e => ({ ...e, _type: 'expense' })),
      ...lendings.map(l => ({ ...l, _type: 'lend' })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    return merged;
  }, [expenses, lendings]);

  const catEmoji = (name) => CATEGORIES.find(c => c.name === name)?.emoji || '💸';

  // ── 30-Day Dual-Line Graph ─────────────────────────────────────────────────
  const [selectedGraphPoint, setSelectedGraphPoint] = useState(null);

  const graphDays = useMemo(() => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const dayExpenses = expenses.filter(e => e.date === iso);
      const dayLendings = lendings.filter(l => l.date === iso);
      const expTotal = dayExpenses.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
      const lendTotal = dayLendings.reduce((s, l) => s + (parseFloat(l.amountOriginal || l.amount) || 0), 0);
      days.push({ iso, expTotal, lendTotal, dayExpenses, dayLendings, label: `${d.getDate()}/${d.getMonth() + 1}` });
    }
    return days;
  }, [expenses, lendings]);

  const hasAnyData = useMemo(() => graphDays.some(d => d.expTotal > 0 || d.lendTotal > 0), [graphDays]);
  const maxVal = useMemo(() => Math.max(...graphDays.map(d => Math.max(d.expTotal, d.lendTotal)), 1), [graphDays]);

  const SVG_W = 320, SVG_H = 100, PAD_L = 36, PAD_R = 10, PAD_T = 10, PAD_B = 20;
  const plotW = SVG_W - PAD_L - PAD_R;
  const plotH = SVG_H - PAD_T - PAD_B;

  const getX = (i) => PAD_L + (i / (graphDays.length - 1)) * plotW;
  const getY = (val) => PAD_T + plotH - (val / maxVal) * plotH;

  const expPoints = graphDays.map((d, i) => ({ x: getX(i), y: getY(d.expTotal), ...d }));
  const lendPoints = graphDays.map((d, i) => ({ x: getX(i), y: getY(d.lendTotal), ...d }));

  const expPolyline = expPoints.map(p => `${p.x},${p.y}`).join(' ');
  const lendPolyline = lendPoints.map(p => `${p.x},${p.y}`).join(' ');

  const gridValues = [0.25, 0.5, 0.75, 1].map(f => ({ f, val: Math.round(maxVal * f) }));

  // X-axis: 5 evenly spaced labels
  const xLabelIdxs = [0, 7, 14, 21, 29];

  return (
    <div className="px-4 pt-4 pb-32 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 ss-text">{greeting}, {settings.name}! 👋</h1>
          <p className="text-xs text-gray-400 mt-0.5 ss-text-muted">Track smart. Spend wise.</p>
        </div>
        <div className="flex items-center gap-2">
          {streak > 0 && (
            <span className={`flex items-center gap-1 bg-orange-50 text-orange-500 rounded-full px-2.5 py-1 text-xs font-semibold ${streak >= 7 ? 'border border-yellow-400' : ''}`}>
              {streak >= 7 ? '🏆' : '🔥'} {streak >= 2 ? `${streak}d streak` : 'Start streak!'}
            </span>
          )}
          <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
            {getInitials(settings.name)}
          </div>
          <button onClick={() => setShowSettings(true)} aria-label="Open settings" className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500">
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Budget Bar */}
      {settings.budgetLimit > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 mb-3 ss-card">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-gray-500 ss-text-muted">Monthly Budget</span>
            {budgetPct >= 100 && <span className="flex items-center gap-1 text-xs text-red-500 font-medium"><TriangleAlert size={12} /> Over budget!</span>}
          </div>
          <div className="flex justify-between text-xs text-gray-700 mb-1.5">
            <span className="font-semibold">{formatCurr(monthlyTotal, sym)}</span>
            <span className="text-gray-400">of {formatCurr(settings.budgetLimit, sym)}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div className="h-2.5 rounded-full transition-all duration-700" style={{ width: budgetPct + '%', background: budgetColor }} />
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div className="flex gap-3 mb-3">
        <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-50 ss-card">
          <p className="text-xs text-gray-400 mb-1 ss-text-muted">Spent This Month</p>
          <p className="text-lg font-bold" style={{ color: '#FF6B6B' }}>{formatCurr(monthlyTotal, sym)}</p>
        </div>
        <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-50 ss-card">
          <p className="text-xs text-gray-400 mb-1 ss-text-muted">Total Owed</p>
          <p className="text-lg font-bold" style={{ color: '#4ECDC4' }}>{formatCurr(pendingTotal, sym)}</p>
        </div>
      </div>

      {/* 30-Day Interactive Graph */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 mb-3 ss-card" onClick={() => setSelectedGraphPoint(null)}>
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-gray-700 ss-text">Activity — Last 30 Days</span>
        </div>

        {!hasAnyData ? (
          <div className="flex flex-col items-center justify-center py-8">
            <span className="text-3xl mb-2">📈</span>
            <p className="text-sm text-gray-400">No activity yet</p>
          </div>
        ) : (
          <div className="relative">
            <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full" onClick={e => e.stopPropagation()}>
              {/* Grid lines + Y labels */}
              {gridValues.map(({ f, val }) => (
                <g key={f}>
                  <line x1={PAD_L} x2={SVG_W - PAD_R} y1={getY(maxVal * f)} y2={getY(maxVal * f)} stroke="#F3F4F6" strokeWidth="1" />
                  <text x={PAD_L - 3} y={getY(maxVal * f) + 3} textAnchor="end" fontSize="7" fill="#9CA3AF">
                    {val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                  </text>
                </g>
              ))}

              {/* X-axis labels */}
              {xLabelIdxs.map(i => (
                <text key={i} x={getX(i)} y={SVG_H - 4} textAnchor="middle" fontSize="7" fill="#9CA3AF">
                  {graphDays[i]?.label}
                </text>
              ))}

              {/* Expense line */}
              <polyline points={expPolyline} fill="none" stroke="#FF6B6B" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
              {/* Lending line */}
              <polyline points={lendPolyline} fill="none" stroke="#4ECDC4" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

              {/* Expense data points */}
              {expPoints.map((p, i) => (
                <circle key={`exp-${i}`} cx={p.x} cy={p.y} r="4" fill="#FF6B6B" stroke="white" strokeWidth="1.5"
                  style={{ cursor: 'pointer' }}
                  onClick={e => { e.stopPropagation(); setSelectedGraphPoint({ idx: i, type: 'exp', x: p.x, y: p.y, day: graphDays[i] }); }}
                />
              ))}
              {/* Lending data points */}
              {lendPoints.map((p, i) => (
                <circle key={`lend-${i}`} cx={p.x} cy={p.y} r="4" fill="#4ECDC4" stroke="white" strokeWidth="1.5"
                  style={{ cursor: 'pointer' }}
                  onClick={e => { e.stopPropagation(); setSelectedGraphPoint({ idx: i, type: 'lend', x: p.x, y: p.y, day: graphDays[i] }); }}
                />
              ))}
            </svg>

            {/* Popup tooltip */}
            {selectedGraphPoint && (() => {
              const { day } = selectedGraphPoint;
              return (
                <div className="absolute z-20 bg-white border border-gray-100 rounded-xl shadow-lg p-3 min-w-[180px] text-xs"
                  style={{ top: 0, left: '50%', transform: 'translateX(-50%)' }}
                  onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-800">{day.iso}</span>
                    <button onClick={() => setSelectedGraphPoint(null)} className="text-gray-400 hover:text-gray-600 ml-2">✕</button>
                  </div>
                  {day.expTotal > 0 && <p className="text-[#FF6B6B] font-medium mb-1">Expenses: {formatCurr(day.expTotal, sym)}</p>}
                  {day.lendTotal > 0 && <p className="text-[#4ECDC4] font-medium mb-1">Lent: {formatCurr(day.lendTotal, sym)}</p>}
                  {day.dayExpenses.length === 0 && day.dayLendings.length === 0 && <p className="text-gray-400">No transactions</p>}
                  {day.dayExpenses.map(e => (
                    <div key={e.id} className="flex justify-between mt-1 text-gray-600">
                      <span>{CATEGORIES.find(c => c.name === e.category)?.emoji || '💸'} {e.desc || e.category}</span>
                      <span className="font-medium text-[#FF6B6B]">{formatCurr(e.amount, sym)}</span>
                    </div>
                  ))}
                  {day.dayLendings.map(l => (
                    <div key={l.id} className="flex justify-between mt-1 text-gray-600">
                      <span>🤝 {l.name}</span>
                      <span className="font-medium text-[#4ECDC4]">{formatCurr(l.amountOriginal || l.amount, sym)}</span>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Legend */}
            <div className="flex items-center gap-4 mt-2 justify-center">
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <span className="w-3 h-0.5 rounded-full inline-block" style={{ background: '#FF6B6B' }} /> Expenses
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <span className="w-3 h-0.5 rounded-full inline-block" style={{ background: '#4ECDC4' }} /> Lendings
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Activity Feed */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-50 ss-card">
        <div className="flex justify-between items-center px-4 pt-4 pb-2">
          <span className="text-sm font-semibold text-gray-700 ss-text">Recent Activity</span>
          <button onClick={() => setActiveTab('expenses')} className="text-xs text-[#6C63FF] font-medium focus-visible:ring-2 focus-visible:ring-indigo-500 rounded">See All</button>
        </div>
        {recentActivity.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4">
            <span className="text-5xl mb-3">🧾</span>
            <p className="font-medium text-gray-700 text-sm ss-text">No activity yet</p>
            <p className="text-xs text-gray-400 mt-1 mb-3 ss-text-muted">Add your first expense to get started</p>
            <button onClick={() => setActiveTab('expenses')} className="bg-[#6C63FF] text-white text-xs font-medium px-4 py-2 rounded-full active:scale-95 transition-transform focus-visible:ring-2 focus-visible:ring-indigo-500">
              Add Expense
            </button>
          </div>
        ) : (
          <div className="px-4 pb-4">
            {recentActivity.map((item) => (
              <div key={item.id} className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-lg flex-shrink-0">
                  {item._type === 'expense' ? catEmoji(item.category) : '🤝'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate ss-text">{item._type === 'expense' ? (item.desc || item.category) : item.name}</p>
                  <p className="text-xs text-gray-400 ss-text-muted">{item._type === 'expense' ? item.category : 'Lent to'} · {getRelativeDateLabel(item.date)}</p>
                </div>
                <span className={`text-sm font-semibold ${item._type === 'expense' ? 'text-[#FF6B6B]' : 'text-[#4ECDC4]'}`}>
                  {item._type === 'expense' ? '-' : '+'}{formatCurr(item.amount, sym)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
