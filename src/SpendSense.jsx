import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { OfflineBanner, Toast, BottomNav } from './components/GlobalComponents.jsx';
import HomeView from './views/HomeView.jsx';
import ExpensesView from './views/ExpensesView.jsx';
import LendView from './views/LendView.jsx';
import SummaryView from './views/SummaryView.jsx';
import AiInsightsView from './views/AiInsightsView.jsx';
import SettingsSheet from './views/SettingsSheet.jsx';
import { getTodayISO, generateId } from './utils.js';

const DEFAULT_SETTINGS = { name:'Student', currency:'₹', theme:'light', budgetLimit:0, weeklyDigest:false, haptics:true };

function safeLoad(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch(e) { console.warn('SpendSense: failed to load', key); return fallback; }
}

function safeSave(key, value, showToast) {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch(e) { showToast?.('Storage error. Data may not be saved.', 'error'); }
}

function nextDueDateCalc(freq, from) {
  const d = new Date(from + 'T00:00:00');
  if(freq==='daily') d.setDate(d.getDate()+1);
  else if(freq==='weekly') d.setDate(d.getDate()+7);
  else d.setMonth(d.getMonth()+1);
  return d.toISOString().slice(0,10);
}

export default function SpendSenseApp() {
  const [activeTab, setActiveTab] = useState('home');
  const [settings, setSettings] = useState(() => safeLoad('ss_settings', DEFAULT_SETTINGS));
  const [expenses, setExpenses] = useState(() => {
    const loaded = safeLoad('ss_expenses', []);
    return Array.isArray(loaded) ? loaded.filter(e => e?.id && e?.amount && e?.date) : [];
  });
  const [lendings, setLendings] = useState(() => {
    const loaded = safeLoad('ss_lendings', []);
    return Array.isArray(loaded) ? loaded.filter(l => l?.id && l?.amount).map(l => ({
      ...l,
      amountOriginal: l.amountOriginal ?? parseFloat(l.amount),
      amountPaid: l.amountPaid ?? 0,
      payments: l.payments ?? []
    })) : [];
  });
  const [recurringExpenses, setRecurringExpenses] = useState(() => safeLoad('ss_recurring', []));
  const [savingsGoals, setSavingsGoals] = useState(() => safeLoad('ss_goals', []));
  const [chatHistory, setChatHistory] = useState(() => safeLoad('ss_chat', []));
  const [toast, setToast] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  const showToast = useCallback((msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // localStorage sync
  useEffect(() => { safeSave('ss_settings', settings, showToast); }, [settings]);
  useEffect(() => { safeSave('ss_expenses', expenses, showToast); }, [expenses]);
  useEffect(() => { safeSave('ss_lendings', lendings, showToast); }, [lendings]);
  useEffect(() => { safeSave('ss_recurring', recurringExpenses, showToast); }, [recurringExpenses]);
  useEffect(() => { safeSave('ss_goals', savingsGoals, showToast); }, [savingsGoals]);
  useEffect(() => { safeSave('ss_chat', chatHistory, showToast); }, [chatHistory]);

  // Theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme || 'light');
  }, [settings.theme]);

  // Recurring expense auto-add on mount
  useEffect(() => {
    const today = getTodayISO();
    let newExpenses = [];
    const updated = recurringExpenses.map(r => {
      if(!r.active || r.nextDue > today) return r;
      const exp = { id: generateId(), amount: r.amount, category: r.category, desc: r.desc, date: today, createdAt: Date.now() };
      newExpenses.push({ exp, desc: r.desc, amount: r.amount });
      return { ...r, nextDue: nextDueDateCalc(r.frequency, today) };
    });
    if(newExpenses.length > 0) {
      setExpenses(prev => [...newExpenses.map(x => x.exp), ...prev]);
      setRecurringExpenses(updated);
      newExpenses.forEach(({ desc, amount }) => {
        setTimeout(() => showToast(`Auto-added: ${desc} — ${settings.currency}${amount}`, 'info'), 500);
      });
    }
  }, []);

  const isDark = settings.theme === 'dark';

  const tabContent = useMemo(() => {
    const common = { settings, showToast };
    switch(activeTab) {
      case 'home':
        return <HomeView {...common} expenses={expenses} lendings={lendings} setActiveTab={setActiveTab} setShowSettings={setShowSettings}/>;
      case 'expenses':
        return <ExpensesView {...common} expenses={expenses} setExpenses={setExpenses}/>;
      case 'lend':
        return <LendView {...common} lendings={lendings} setLendings={setLendings}/>;
      case 'summary':
        return <SummaryView {...common} expenses={expenses} lendings={lendings} savingsGoals={savingsGoals} setSavingsGoals={setSavingsGoals}/>;
      case 'chat':
        return <AiInsightsView {...common} expenses={expenses} lendings={lendings}/>;
      default:
        return null;
    }
  }, [activeTab, settings, expenses, lendings, savingsGoals, showToast]);

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
        @keyframes scaleIn { from { transform: scale(0.85); opacity: 0 } to { transform: scale(1); opacity: 1 } }
        @keyframes pulseSubtle { 0%, 100% { opacity: 1 } 50% { opacity: 0.6 } }
        @keyframes shake { 0%, 100% { transform: translateX(0) } 25% { transform: translateX(-4px) } 75% { transform: translateX(4px) } }
        @keyframes dotBounce { 0%, 80%, 100% { transform: scale(0) } 40% { transform: scale(1) } }
        @keyframes confettiFall { 0% { transform: translateY(-10px) rotate(0deg); opacity: 1 } 100% { transform: translateY(60px) rotate(360deg); opacity: 0 } }
        .animate-fade-in { animation: fadeIn 200ms ease-out both }
        .animate-slide-up { animation: slideUp 300ms cubic-bezier(0.34, 1.56, 0.64, 1) both }
        .animate-scale-in { animation: scaleIn 200ms ease-out both }
        .animate-pulse-subtle { animation: pulseSubtle 2s ease-in-out infinite }
        .animate-shake { animation: shake 300ms ease-in-out }
        .animate-dot-bounce { animation: dotBounce 1.4s ease-in-out infinite both }
        .animate-confetti-fall { animation: confettiFall 1s ease-out forwards }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none }
        .scrollbar-hide::-webkit-scrollbar { display: none }
        .pb-safe { padding-bottom: env(safe-area-inset-bottom) }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation: none !important; transition: none !important; }
        }
        [data-theme="dark"] {
          --ss-bg: #0F0F1A;
          --ss-surface: #1A1A2E;
          --ss-surface2: #252540;
          --ss-text: #E8E8F4;
          --ss-text-muted: #9090B0;
          --ss-border: rgba(255,255,255,0.08);
        }
        [data-theme="dark"] .ss-page-bg   { background-color: #0F0F1A !important; }
        [data-theme="dark"] .ss-card      { background-color: #1A1A2E !important; border-color: rgba(255,255,255,0.07) !important; }
        [data-theme="dark"] .ss-text      { color: #E8E8F4 !important; }
        [data-theme="dark"] .ss-text-muted{ color: #9090B0 !important; }
        [data-theme="dark"] .ss-input     { background-color: #252540 !important; color: #E8E8F4 !important; border-color: rgba(255,255,255,0.12) !important; }
        [data-theme="dark"] .ss-bottom-nav{ background-color: #1A1A2E !important; border-color: rgba(255,255,255,0.07) !important; }
        [data-theme="dark"] .ss-bottom-sheet { background-color: #1A1A2E !important; }
        [data-theme="dark"] .ss-chip-inactive { background-color: #252540 !important; color: #C0C0E0 !important; border-color: rgba(255,255,255,0.1) !important; }
        [data-theme="dark"] .ss-section-header { color: #9090B0 !important; background-color: #0F0F1A !important; }
        [data-theme="dark"] .ss-drag-handle { background-color: #3A3A5C !important; }
        [data-theme="dark"] .ss-divider   { border-color: rgba(255,255,255,0.07) !important; }
        [data-theme="dark"] .ss-avatar-bg { background-color: #2D2D50 !important; }
      `}</style>

      <div
        className={`w-full min-h-screen relative overflow-hidden font-sans selection:bg-indigo-100 flex flex-col ss-root ss-page-bg ${isDark ? 'bg-[#0F0F1A]' : 'bg-[#F8F9FF]'}`}
        data-theme={settings.theme}
      >
        <OfflineBanner/>

        {/* Main content area */}
        <div className={activeTab === 'chat' ? 'flex flex-col flex-1 overflow-hidden pt-0' : 'flex-1 overflow-y-auto'}>
          {tabContent}
        </div>

        {/* Bottom Nav */}
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab}/>

        {/* Toast */}
        <Toast toast={toast}/>

        {/* Settings */}
        <SettingsSheet
          isOpen={showSettings} onClose={() => setShowSettings(false)}
          settings={settings} setSettings={setSettings}
          expenses={expenses} lendings={lendings} savingsGoals={savingsGoals}
          recurringExpenses={recurringExpenses} setRecurringExpenses={setRecurringExpenses}
          setExpenses={setExpenses} setLendings={setLendings} setSavingsGoals={setSavingsGoals}
          showToast={showToast}
        />
      </div>
    </>
  );
}
