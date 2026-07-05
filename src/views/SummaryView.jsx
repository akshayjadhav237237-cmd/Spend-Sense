import React, { useState, useMemo, useCallback } from 'react';
import { TrendingUp, TrendingDown, Minus, Lightbulb } from 'lucide-react';
import { CATEGORIES, formatCurr, getMonthKey, getCurrentMonthKey, getTodayISO, parseAmount, generateId } from '../utils.js';
import { BottomSheet } from '../components/GlobalComponents.jsx';

const GOAL_EMOJIS = ['🎯','🏠','✈️','💻','📱','🎓','🚗','💍','🏋️','🎸','📚','💰'];
const GOAL_COLORS = ['#6C63FF','#FF6B6B','#4ECDC4','#51CF66','#FFD93D','#FF8E53'];

function AddGoalModal({ isOpen, onClose, onAdd, sym }) {
  const [title,setTitle]=useState(''); const [target,setTarget]=useState('');
  const [current,setCurrent]=useState('0'); const [emoji,setEmoji]=useState('🎯');
  const [deadline,setDeadline]=useState(''); const [color,setColor]=useState(GOAL_COLORS[0]);
  const submit=()=>{
    if(!title.trim()||!parseAmount(target)) return;
    onAdd({id:generateId(),title:title.trim(),targetAmount:parseFloat(target),currentAmount:parseFloat(current)||0,emoji,deadline,color,createdAt:Date.now()});
    setTitle('');setTarget('');setCurrent('0');setEmoji('🎯');setDeadline('');setColor(GOAL_COLORS[0]); onClose();
  };
  return(
    <BottomSheet isOpen={isOpen} onClose={onClose} title="New Savings Goal">
      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block" htmlFor="goal-title">Goal Title</label>
          <input id="goal-title" value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. New Laptop" autoFocus
            className="w-full border border-gray-200 rounded-xl px-3 py-3 bg-gray-50 text-sm outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ss-input"/>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">Icon</p>
          <div className="flex flex-wrap gap-2">{GOAL_EMOJIS.map(e=>(
            <button key={e} onClick={()=>setEmoji(e)} aria-label={`Select ${e}`}
              className={`text-xl w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-500 ${emoji===e?'bg-indigo-100 scale-110 ring-2 ring-indigo-400':'bg-gray-50'}`}>{e}</button>
          ))}</div>
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs font-medium text-gray-500 mb-1 block" htmlFor="goal-target">Target {sym}</label>
            <input id="goal-target" type="number" inputMode="decimal" value={target} onChange={e=>setTarget(e.target.value)} placeholder="10000"
              className="w-full border border-gray-200 rounded-xl px-3 py-3 bg-gray-50 text-sm outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ss-input"/>
          </div>
          <div className="flex-1">
            <label className="text-xs font-medium text-gray-500 mb-1 block" htmlFor="goal-current">Saved So Far {sym}</label>
            <input id="goal-current" type="number" inputMode="decimal" value={current} onChange={e=>setCurrent(e.target.value)} placeholder="0"
              className="w-full border border-gray-200 rounded-xl px-3 py-3 bg-gray-50 text-sm outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ss-input"/>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block" htmlFor="goal-deadline">Target Date</label>
          <input id="goal-deadline" type="date" value={deadline} min={getTodayISO()} onChange={e=>setDeadline(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-3 bg-gray-50 text-sm outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ss-input"/>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">Color</p>
          <div className="flex gap-2">{GOAL_COLORS.map(c=>(
            <button key={c} onClick={()=>setColor(c)} aria-label={`Color ${c}`}
              className={`w-8 h-8 rounded-full transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-indigo-500 ${color===c?'scale-125 ring-2 ring-offset-1':''}`} style={{background:c}}/>
          ))}</div>
        </div>
        <button onClick={submit} className="w-full py-3.5 bg-[#6C63FF] text-white rounded-2xl font-semibold text-sm active:scale-95 transition-transform">Add Goal</button>
      </div>
    </BottomSheet>
  );
}

/* ── Reusable Interactive Line Graph ─────────────────────────────────────── */
function InteractiveLineGraph({ title, subtitle, lines, xLabels, yMax, onPointClick, selectedPoint, setSelectedPoint, emptyLabel }) {
  const SVG_W = 320, SVG_H = 100, PAD_L = 36, PAD_R = 10, PAD_T = 10, PAD_B = 20;
  const plotW = SVG_W - PAD_L - PAD_R;
  const plotH = SVG_H - PAD_T - PAD_B;
  const n = lines[0]?.data?.length || 0;
  const getX = (i) => PAD_L + (n > 1 ? (i / (n - 1)) * plotW : plotW / 2);
  const getY = (val) => PAD_T + plotH - ((val / (yMax || 1)) * plotH);
  const gridFracs = [0.25, 0.5, 0.75, 1];
  const hasData = lines.some(l => l.data.some(v => v > 0));

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 mb-4 ss-card" onClick={() => setSelectedPoint(null)}>
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-semibold text-gray-700 ss-text">{title}</span>
        {subtitle && <span className="text-xs text-gray-400 ss-text-muted">{subtitle}</span>}
      </div>
      {!hasData ? (
        <div className="flex flex-col items-center py-8">
          <span className="text-3xl mb-2">📊</span>
          <p className="text-sm text-gray-400">{emptyLabel || 'No data'}</p>
        </div>
      ) : (
        <div className="relative">
          <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full" onClick={e => e.stopPropagation()}>
            {/* Grid + Y labels */}
            {gridFracs.map(f => (
              <g key={f}>
                <line x1={PAD_L} x2={SVG_W - PAD_R} y1={getY(yMax * f)} y2={getY(yMax * f)} stroke="#F3F4F6" strokeWidth="1" />
                <text x={PAD_L - 3} y={getY(yMax * f) + 3} textAnchor="end" fontSize="7" fill="#9CA3AF">
                  {yMax * f >= 1000 ? `${((yMax * f) / 1000).toFixed(0)}k` : Math.round(yMax * f)}
                </text>
              </g>
            ))}
            {/* X labels */}
            {xLabels.map(({ idx, label }) => (
              <text key={idx} x={getX(idx)} y={SVG_H - 4} textAnchor="middle" fontSize="7" fill="#9CA3AF">{label}</text>
            ))}
            {/* Lines + dots */}
            {lines.map(line => (
              <g key={line.id}>
                <polyline
                  points={line.data.map((v, i) => `${getX(i)},${getY(v)}`).join(' ')}
                  fill="none" stroke={line.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"
                />
                {line.data.map((v, i) => (
                  <circle key={i} cx={getX(i)} cy={getY(v)} r="4"
                    fill={line.color} stroke="white" strokeWidth="1.5"
                    style={{ cursor: 'pointer' }}
                    onClick={e => { e.stopPropagation(); setSelectedPoint({ lineId: line.id, idx: i }); onPointClick && onPointClick(line, i); }}
                  />
                ))}
              </g>
            ))}
          </svg>
          {/* Legend */}
          {lines.length > 1 && (
            <div className="flex flex-wrap gap-3 mt-1 justify-center">
              {lines.map(l => (
                <span key={l.id} className="flex items-center gap-1 text-xs text-gray-500">
                  <span className="w-3 h-0.5 rounded-full inline-block" style={{ background: l.color }} />{l.label}
                </span>
              ))}
            </div>
          )}
          {/* Tooltip */}
          {selectedPoint && (() => {
            const line = lines.find(l => l.id === selectedPoint.lineId);
            if (!line) return null;
            const val = line.data[selectedPoint.idx];
            const meta = line.meta?.[selectedPoint.idx];
            return (
              <div className="absolute z-20 bg-white border border-gray-100 rounded-xl shadow-lg p-3 min-w-[160px] text-xs"
                style={{ top: 0, left: '50%', transform: 'translateX(-50%)' }}
                onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-gray-800" style={{ color: line.color }}>{line.label}</span>
                  <button onClick={() => setSelectedPoint(null)} className="text-gray-400 ml-2">✕</button>
                </div>
                {meta?.date && <p className="text-gray-500 mb-1">{meta.date}</p>}
                <p className="font-medium" style={{ color: line.color }}>{meta?.sym}{typeof val === 'number' ? val.toFixed(2) : val}</p>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

export default function SummaryView({ settings, expenses, lendings, savingsGoals, setSavingsGoals, showToast }) {
  const sym = settings.currency;
  const mk = getCurrentMonthKey();
  const prevMk = useMemo(()=>{ const d=new Date(mk+'-01'); d.setMonth(d.getMonth()-1); return d.toISOString().slice(0,7); },[mk]);

  const monthExp = useMemo(()=>expenses.filter(e=>getMonthKey(e.date)===mk),[expenses,mk]);
  const prevExp = useMemo(()=>expenses.filter(e=>getMonthKey(e.date)===prevMk),[expenses,prevMk]);
  const monthTotal = useMemo(()=>monthExp.reduce((s,e)=>s+e.amount,0),[monthExp]);
  const prevTotal = useMemo(()=>prevExp.reduce((s,e)=>s+e.amount,0),[prevExp]);
  const totalLentAll = useMemo(()=>lendings.reduce((s,l)=>s+(l.amountOriginal||parseFloat(l.amount)||0),0),[lendings]);
  const recovered = useMemo(()=>lendings.filter(l=>l.status==='returned').reduce((s,l)=>s+(l.amountOriginal||parseFloat(l.amount)||0),0),[lendings]);
  const stillOwed = useMemo(()=>lendings.filter(l=>l.status==='pending'||l.status==='partial').reduce((s,l)=>s+(parseFloat(l.amount)||0),0),[lendings]);

  // Category data — spending by category across current month days
  const monthDays = useMemo(() => {
    const d = new Date(mk + '-01');
    const days = [];
    while (d.toISOString().slice(0, 7) === mk) {
      days.push(d.toISOString().slice(0, 10));
      d.setDate(d.getDate() + 1);
    }
    return days;
  }, [mk]);

  const catLines = useMemo(() => {
    const activeCats = CATEGORIES.filter(c => monthExp.some(e => e.category === c.name));
    return activeCats.map(cat => ({
      id: cat.name,
      label: `${cat.emoji} ${cat.name}`,
      color: cat.color,
      data: monthDays.map(iso => monthExp.filter(e => e.date === iso && e.category === cat.name).reduce((s, e) => s + e.amount, 0)),
      meta: monthDays.map(iso => ({ date: iso, sym })),
    }));
  }, [monthExp, monthDays, sym]);

  const catYMax = useMemo(() => Math.max(...catLines.flatMap(l => l.data), 1), [catLines]);
  const catXLabels = useMemo(() => {
    const n = monthDays.length;
    return [0, Math.floor(n * 0.25), Math.floor(n * 0.5), Math.floor(n * 0.75), n - 1].map(idx => ({
      idx, label: monthDays[idx]?.slice(8) || ''
    }));
  }, [monthDays]);

  // 90-day chart
  const last90Days = useMemo(() => {
    const days = [];
    for (let i = 89; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const total = expenses.filter(e => e.date === iso).reduce((s, e) => s + e.amount, 0);
      days.push({ iso, total });
    }
    return days;
  }, [expenses]);

  const day90Lines = useMemo(() => [{
    id: 'spend',
    label: 'Daily Spend',
    color: '#6C63FF',
    data: last90Days.map(d => d.total),
    meta: last90Days.map(d => ({ date: d.iso, sym })),
  }], [last90Days, sym]);

  const day90YMax = useMemo(() => Math.max(...last90Days.map(d => d.total), 1), [last90Days]);
  const day90XLabels = useMemo(() => [0, 17, 35, 53, 71, 89].map(idx => ({
    idx, label: last90Days[idx]?.iso?.slice(5) || ''
  })), [last90Days]);

  const [catGraphPoint, setCatGraphPoint] = useState(null);
  const [day90Point, setDay90Point] = useState(null);

  const topCat = useMemo(() => {
    const m = {};
    monthExp.forEach(e => { m[e.category] = (m[e.category] || 0) + e.amount; });
    return Object.entries(m).sort((a, b) => b[1] - a[1])[0];
  }, [monthExp]);

  const pctChange = prevTotal > 0 ? Math.round(((monthTotal - prevTotal) / prevTotal) * 100) : null;
  const pendingCount = lendings.filter(l => l.status === 'pending' || l.status === 'partial').length;

  const [showGoalModal, setShowGoalModal] = useState(false);
  const [addFundsGoal, setAddFundsGoal] = useState(null);
  const [addFundsAmt, setAddFundsAmt] = useState('');

  const TrendIcon = ({ cur, prev }) => {
    if (prev === 0) return <span className="flex items-center gap-0.5 text-gray-400 text-xs"><Minus size={12}/>New</span>;
    const p = Math.round(((cur - prev) / prev) * 100);
    if (cur > prev) return <span className="flex items-center gap-0.5 text-red-400 text-xs"><TrendingUp size={12}/>+{p}%</span>;
    return <span className="flex items-center gap-0.5 text-green-500 text-xs"><TrendingDown size={12}/>{p}%</span>;
  };

  const STAT_CARDS = [
    { label: 'Total Spent', value: monthTotal, color: '#FF6B6B', trend: <TrendIcon cur={monthTotal} prev={prevTotal}/> },
    { label: 'Total Lent', value: totalLentAll, color: '#4ECDC4' },
    { label: 'Recovered', value: recovered, color: '#51CF66' },
    { label: 'Still Owed', value: stillOwed, color: '#FFD93D' },
  ];

  return (
    <div className="px-4 pt-4 pb-32 animate-fade-in">
      <h2 className="text-lg font-bold text-gray-900 mb-4 ss-text">Summary</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {STAT_CARDS.map(c => (
          <div key={c.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 ss-card">
            <p className="text-xs text-gray-400 mb-1 ss-text-muted">{c.label}</p>
            <p className="text-lg font-bold" style={{ color: c.color }}>{formatCurr(c.value, sym)}</p>
            {c.trend && <div className="mt-1">{c.trend}</div>}
          </div>
        ))}
      </div>

      {/* Spending by Category — interactive line graph */}
      <InteractiveLineGraph
        title="Spending by Category"
        subtitle={new Intl.DateTimeFormat('en-IN', { month: 'short', year: 'numeric' }).format(new Date(mk + '-01'))}
        lines={catLines}
        xLabels={catXLabels}
        yMax={catYMax}
        selectedPoint={catGraphPoint}
        setSelectedPoint={setCatGraphPoint}
        emptyLabel="No spending data this month"
      />

      {/* Last 90 Days — interactive line graph */}
      <InteractiveLineGraph
        title="Last 90 Days"
        lines={day90Lines}
        xLabels={day90XLabels}
        yMax={day90YMax}
        selectedPoint={day90Point}
        setSelectedPoint={setDay90Point}
        emptyLabel="No spending data in last 90 days"
      />

      {/* Insights */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 mb-4 ss-card">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb size={16} className="text-yellow-500"/>
          <p className="text-sm font-semibold text-gray-700 ss-text">Insights</p>
        </div>
        {monthExp.length === 0 ? (
          <p className="text-sm text-gray-400">Add expenses to see personalized insights</p>
        ) : (
          <div className="space-y-2">
            {topCat && <div className="bg-indigo-50 rounded-xl p-3 text-sm text-indigo-800 border border-indigo-100">Your biggest expense this month is <strong>{topCat[0]}</strong> at {formatCurr(topCat[1], sym)}</div>}
            {pctChange !== null && <div className={`rounded-xl p-3 text-sm border ${pctChange > 0 ? 'bg-red-50 text-red-800 border-red-100' : 'bg-green-50 text-green-800 border-green-100'}`}>You spent <strong>{Math.abs(pctChange)}% {pctChange > 0 ? 'more' : 'less'}</strong> than last month</div>}
            {pendingCount > 0 && <div className="bg-yellow-50 rounded-xl p-3 text-sm text-yellow-800 border border-yellow-100">You have <strong>{pendingCount}</strong> pending {pendingCount === 1 ? 'loan' : 'loans'} totaling {formatCurr(stillOwed, sym)}</div>}
          </div>
        )}
      </div>

      {/* Savings Goals */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 ss-card">
        <div className="flex justify-between items-center mb-3">
          <p className="text-sm font-semibold text-gray-700 ss-text">Savings Goals</p>
          <button onClick={() => setShowGoalModal(true)} aria-label="Add savings goal" className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-lg font-medium active:scale-95 transition-transform focus-visible:ring-2 focus-visible:ring-indigo-500">+</button>
        </div>
        {savingsGoals.length === 0 ? (
          <div className="flex flex-col items-center py-8"><span className="text-4xl mb-2">🎯</span><p className="text-sm text-gray-400">No savings goals yet</p><p className="text-xs text-gray-300 mt-1">Set a goal and start saving!</p></div>
        ) : savingsGoals.map(g => {
          const pct = Math.min((g.currentAmount / g.targetAmount) * 100, 100);
          const reached = g.currentAmount >= g.targetAmount;
          const daysLeft = g.deadline ? Math.ceil((new Date(g.deadline) - Date.now()) / 86400000) : null;
          return (
            <div key={g.id} className="mb-4 last:mb-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{g.emoji}</span>
                  <p className="text-sm font-medium text-gray-800 ss-text">{g.title}</p>
                  {reached && <span className="text-xs animate-pulse-subtle">🎉</span>}
                </div>
                <p className="text-xs text-gray-500 ss-text-muted">{daysLeft != null ? daysLeft > 0 ? `${daysLeft}d left` : 'Deadline passed' : ''}</p>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mb-1 ss-text-muted">
                <span>{formatCurr(g.currentAmount, sym)}</span><span>{formatCurr(g.targetAmount, sym)}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 mb-2 overflow-hidden">
                <div className="h-2 rounded-full transition-all duration-700" style={{ width: pct + '%', background: g.color }}/>
              </div>
              {!reached && (
                <button onClick={() => { setAddFundsGoal(g); setAddFundsAmt(''); }} aria-label={`Add funds to ${g.title}`}
                  className="text-xs text-indigo-500 font-medium border border-indigo-100 bg-indigo-50 px-3 py-1.5 rounded-xl active:scale-95 transition-transform focus-visible:ring-2 focus-visible:ring-indigo-500">
                  + Add Funds
                </button>
              )}
              {reached && <p className="text-xs font-semibold text-green-500">🎉 Goal Reached!</p>}
            </div>
          );
        })}
      </div>

      <AddGoalModal isOpen={showGoalModal} onClose={() => setShowGoalModal(false)} sym={sym} onAdd={(g) => { setSavingsGoals(p => [...p, g]); showToast('Goal added!', 'success'); }}/>

      {addFundsGoal && (
        <BottomSheet isOpen={!!addFundsGoal} onClose={() => setAddFundsGoal(null)} title={`Add Funds — ${addFundsGoal.title}`}>
          <div className="space-y-4">
            <input type="number" inputMode="decimal" value={addFundsAmt} onChange={e => setAddFundsAmt(e.target.value)} autoFocus placeholder="Amount to add" aria-label="Amount to add"
              className="w-full border border-gray-200 rounded-xl px-3 py-3 bg-gray-50 text-sm outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ss-input"/>
            <button onClick={() => {
              const v = parseAmount(addFundsAmt);
              if (!v) return;
              setSavingsGoals(p => p.map(g => g.id === addFundsGoal.id ? { ...g, currentAmount: Math.min(g.currentAmount + v, g.targetAmount) } : g));
              showToast('Funds added!', 'success'); setAddFundsGoal(null);
            }} className="w-full py-3.5 rounded-2xl font-semibold text-sm text-white active:scale-95 transition-transform" style={{ background: addFundsGoal.color }}>Add Funds</button>
          </div>
        </BottomSheet>
      )}
    </div>
  );
}
