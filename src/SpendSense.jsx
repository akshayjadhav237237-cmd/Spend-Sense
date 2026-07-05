import React, { useState, useEffect, useCallback } from 'react';
import { OfflineBanner, Toast, BottomNav, BottomSheet } from './components/GlobalComponents.jsx';
import HomeView from './views/HomeView.jsx';
import ExpensesView from './views/ExpensesView.jsx';
import LendView from './views/LendView.jsx';
import SummaryView from './views/SummaryView.jsx';
import AiInsightsView from './views/AiInsightsView.jsx';
import SettingsSheet from './views/SettingsSheet.jsx';
import { getTodayISO, generateId, CATEGORIES } from './utils.js';
import { Camera, X } from 'lucide-react';

const DEFAULT_SETTINGS = { name: 'Student', currency: '₹', theme: 'light', budgetLimit: 0, weeklyDigest: false, haptics: true };

function nextDueDateCalc(freq, from) {
  const d = new Date(from + 'T00:00:00');
  if (freq === 'daily') d.setDate(d.getDate() + 1);
  else if (freq === 'weekly') d.setDate(d.getDate() + 7);
  else d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
}

function SpendSenseApp() {
  const [activeTab, setActiveTab] = useState('home');

  // ── State with safe lazy initializers ────────────────────────────────────
  const [settings, setSettings] = useState(() => {
    try {
      const s = localStorage.getItem('ss_settings');
      if (!s) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(s) };
    } catch { return DEFAULT_SETTINGS; }
  });

  const [expenses, setExpenses] = useState(() => {
    try {
      const s = localStorage.getItem('ss_expenses');
      if (!s) return [];
      const p = JSON.parse(s);
      return Array.isArray(p) ? p.filter(e => e?.id && e?.amount && e?.date) : [];
    } catch { return []; }
  });

  const [lendings, setLendings] = useState(() => {
    try {
      const stored = localStorage.getItem('ss_lendings');
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return [];
      return parsed.map(l => ({
        ...l,
        amountOriginal: l.amountOriginal ?? parseFloat(l.amount) ?? 0,
        amountPaid: l.amountPaid ?? 0,
        payments: Array.isArray(l.payments) ? l.payments.map(p => ({
          id: p.id || generateId(),
          amount: parseFloat(p.amount) || 0,
          date: p.date || getTodayISO(),
          note: p.note || ''
        })) : [],
        status: l.status ?? 'pending'
      }));
    } catch (err) { console.warn('Failed to load lendings:', err); return []; }
  });

  const [recurringExpenses, setRecurringExpenses] = useState(() => {
    try {
      const s = localStorage.getItem('ss_recurring');
      if (!s) return [];
      const p = JSON.parse(s);
      return Array.isArray(p) ? p : [];
    } catch { return []; }
  });

  const [savingsGoals, setSavingsGoals] = useState(() => {
    try {
      const s = localStorage.getItem('ss_goals');
      if (!s) return [];
      const p = JSON.parse(s);
      return Array.isArray(p) ? p : [];
    } catch { return []; }
  });

  const [chatHistory, setChatHistory] = useState(() => {
    try {
      const s = localStorage.getItem('ss_chat');
      if (!s) return [];
      const p = JSON.parse(s);
      return Array.isArray(p) ? p : [];
    } catch { return []; }
  });

  const [toast, setToast] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  // Grouped lending state (top-level dictionaries — no hooks inside maps)
  const [expandedPersons, setExpandedPersons] = useState({});
  const [animatingLendId, setAnimatingLendId] = useState(null);
  const [expandedPayments, setExpandedPayments] = useState({});

  // Edit Expense
  const [showEditExpenseModal, setShowEditExpenseModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [editExpenseForm, setEditExpenseForm] = useState({ amount: '', category: '', desc: '', date: '', photo: null });

  // Edit Lending
  const [showEditLendModal, setShowEditLendModal] = useState(false);
  const [editingLend, setEditingLend] = useState(null);
  const [editLendForm, setEditLendForm] = useState({ name: '', phone: '', amount: '', reason: '', date: '' });

  const showToast = useCallback((msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // ── localStorage sync (try/catch per Part 1, Rule 3) ─────────────────────
  useEffect(() => { try { localStorage.setItem('ss_settings', JSON.stringify(settings)); } catch (e) { console.warn(e); } }, [settings]);
  useEffect(() => { try { localStorage.setItem('ss_expenses', JSON.stringify(expenses)); } catch (e) { console.warn(e); } }, [expenses]);
  useEffect(() => { try { localStorage.setItem('ss_lendings', JSON.stringify(lendings)); } catch (e) { console.warn(e); } }, [lendings]);
  useEffect(() => { try { localStorage.setItem('ss_recurring', JSON.stringify(recurringExpenses)); } catch (e) { console.warn(e); } }, [recurringExpenses]);
  useEffect(() => { try { localStorage.setItem('ss_goals', JSON.stringify(savingsGoals)); } catch (e) { console.warn(e); } }, [savingsGoals]);
  useEffect(() => { try { localStorage.setItem('ss_chat', JSON.stringify(chatHistory)); } catch (e) { console.warn(e); } }, [chatHistory]);

  // ── Dark mode: set data-theme on #ss-root ────────────────────────────────
  useEffect(() => {
    const root = document.getElementById('ss-root');
    if (root) root.setAttribute('data-theme', settings.theme === 'dark' ? 'dark' : 'light');
    // Also set on documentElement for any legacy selectors
    document.documentElement.setAttribute('data-theme', settings.theme || 'light');
  }, [settings.theme]);

  // ── Auto backup on mount (Update 4) ─────────────────────────────────────
  useEffect(() => {
    const createAutoBackup = () => {
      try {
        const lightExpenses = expenses.map(({ photo, ...rest }) => rest);
        const backup = {
          version: '1.2',
          backupDate: new Date().toISOString(),
          settings, expenses: lightExpenses, lendings, savingsGoals, recurringExpenses
        };
        const existing = JSON.parse(localStorage.getItem('ss_backups') || '[]');
        const updated = [backup, ...existing].slice(0, 5);
        localStorage.setItem('ss_backups', JSON.stringify(updated));
        localStorage.setItem('ss_last_backup', new Date().toISOString());
      } catch (err) { console.warn('Auto backup failed:', err); }
    };
    const timer = setTimeout(createAutoBackup, 2000);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Recurring expense auto-add on mount ──────────────────────────────────
  useEffect(() => {
    const today = getTodayISO();
    let newExpenses = [];
    const updated = recurringExpenses.map(r => {
      if (!r.active || r.nextDue > today) return r;
      const exp = { id: generateId(), amount: r.amount, category: r.category, desc: r.desc, date: today, createdAt: Date.now() };
      newExpenses.push({ exp, desc: r.desc, amount: r.amount });
      return { ...r, nextDue: nextDueDateCalc(r.frequency, today) };
    });
    if (newExpenses.length > 0) {
      setExpenses(prev => [...newExpenses.map(x => x.exp), ...prev]);
      setRecurringExpenses(updated);
      newExpenses.forEach(({ desc, amount }) => {
        setTimeout(() => showToast(`Auto-added: ${desc} — ${settings.currency}${amount}`, 'info'), 500);
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Edit expense ─────────────────────────────────────────────────────────
  const handleEditExpense = () => {
    try {
      const amt = parseFloat(editExpenseForm.amount);
      if (!amt || amt <= 0) { showToast('Enter a valid amount', 'error'); return; }
      if (!editExpenseForm.category) { showToast('Select a category', 'error'); return; }
      setExpenses(prev => prev.map(e => e.id === editingExpense.id ? {
        ...e, amount: amt, category: editExpenseForm.category,
        desc: editExpenseForm.desc, date: editExpenseForm.date, photo: editExpenseForm.photo || null
      } : e));
      setShowEditExpenseModal(false); setEditingExpense(null);
      showToast('Expense updated!', 'success');
    } catch (err) { showToast('Something went wrong', 'error'); }
  };

  const openEditExpense = (expense) => {
    setEditingExpense(expense);
    setEditExpenseForm({ amount: expense.amount.toString(), category: expense.category, desc: expense.desc, date: expense.date, photo: expense.photo || null });
    setShowEditExpenseModal(true);
  };

  // No-op: lendings are fully local
  const updateLendingInDB = () => {};

  // ── Edit lending ─────────────────────────────────────────────────────────
  const handleEditLend = () => {
    try {
      const amt = parseFloat(editLendForm.amount);
      if (!amt || amt <= 0) { showToast('Enter a valid amount', 'error'); return; }
      if (!editLendForm.name.trim()) { showToast('Enter a name', 'error'); return; }
      setLendings(prev => prev.map(l => l.id === editingLend.id ? {
        ...l, name: editLendForm.name.trim(), phone: editLendForm.phone.trim(),
        amountOriginal: amt, amount: amt - (l.amountPaid || 0),
        reason: editLendForm.reason.trim(), date: editLendForm.date
      } : l));
      setShowEditLendModal(false); setEditingLend(null);
      showToast('Lending updated!', 'success');
    } catch (err) { showToast('Something went wrong', 'error'); }
  };

  const openEditLend = (lend) => {
    setEditingLend(lend);
    setEditLendForm({ name: lend.name, phone: lend.phone || '', amount: lend.amountOriginal?.toString() || lend.amount.toString(), reason: lend.reason, date: lend.date });
    setShowEditLendModal(true);
  };

  // ── Itemized remind (Update 3) ───────────────────────────────────────────
  const remindLending = useCallback((lend) => {
    try {
      const original = lend.amountOriginal || parseFloat(lend.amount) || 0;
      const paid = lend.amountPaid || 0;
      const remaining = original - paid;
      const payments = lend.payments || [];
      let paymentHistory = '';
      if (payments.length > 0) {
        paymentHistory = '\n\nPayment history:\n' + payments.map((p, i) =>
          `${i + 1}. ${p.date} — ${settings.currency}${parseFloat(p.amount).toFixed(2)}${p.note ? ` (${p.note})` : ''}`
        ).join('\n');
      }
      const text = payments.length > 0
        ? `Hey ${lend.name}! 👋 Friendly reminder about the money you borrowed.\n\nOriginal amount: ${settings.currency}${original}\nFor: ${lend.reason}\nDate borrowed: ${lend.date}${paymentHistory}\n\nTotal returned so far: ${settings.currency}${paid.toFixed(2)}\nStill pending: ${settings.currency}${remaining.toFixed(2)}\n\nPlease return the remaining amount when you can! 😊`
        : `Hey ${lend.name}! 👋 Friendly reminder — you borrowed ${settings.currency}${original} from me on ${lend.date} for '${lend.reason}'. Please return it when you can! 😊`;
      if (lend.phone) {
        const phone = lend.phone.replace(/[^\d]/g, '').slice(-10);
        window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(text)}`, '_blank');
      } else {
        navigator.clipboard.writeText(text)
          .then(() => showToast('Message copied!', 'success'))
          .catch(() => showToast('No phone number saved', 'info'));
      }
    } catch (err) {
      console.error('remindLending error:', err);
      showToast('Could not send reminder', 'error');
    }
  }, [settings, showToast]);

  const isDark = settings.theme === 'dark';

  const renderTab = () => {
    const common = { settings, showToast };
    switch (activeTab) {
      case 'home':
        return <HomeView {...common} expenses={expenses} lendings={lendings} setActiveTab={setActiveTab} setShowSettings={setShowSettings}/>;
      case 'expenses':
        return <ExpensesView {...common} expenses={expenses} setExpenses={setExpenses} openEditExpense={openEditExpense}/>;
      case 'lend':
        return <LendView {...common} lendings={lendings} setLendings={setLendings} openEditLend={openEditLend}
          expandedPersons={expandedPersons} setExpandedPersons={setExpandedPersons}
          animatingLendId={animatingLendId} setAnimatingLendId={setAnimatingLendId}
          expandedPayments={expandedPayments} setExpandedPayments={setExpandedPayments}
          lendingsLoading={false} updateLendingInDB={updateLendingInDB}
          remindLending={remindLending}/>;
      case 'summary':
        return <SummaryView {...common} expenses={expenses} lendings={lendings} savingsGoals={savingsGoals} setSavingsGoals={setSavingsGoals}/>;
      case 'chat':
        return <AiInsightsView {...common} expenses={expenses} lendings={lendings}/>;
      default:
        return null;
    }
  };

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
        @keyframes slideOutRight {
          0% { transform: translateX(0); opacity: 1; max-height: 300px; }
          100% { transform: translateX(110%); opacity: 0; max-height: 0; padding: 0; margin: 0; }
        }
        .lend-exit { animation: slideOutRight 0.6s cubic-bezier(0.55, 0, 1, 0.45) forwards; pointer-events: none; overflow: hidden; }
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

        /* ── Dark Mode — exhaustive overrides ─────────────────────────── */
        [data-theme="dark"] {
          --ss-bg: #0F0F1A;
          --ss-surface: #1A1A2E;
          --ss-surface2: #252540;
          --ss-text: #E8E8F4;
          --ss-text-muted: #9090B0;
          --ss-border: rgba(255,255,255,0.08);
          color-scheme: dark;
        }
        /* Page bg */
        [data-theme="dark"] .ss-page-bg,
        [data-theme="dark"] .bg-\\[\\#F8F9FF\\]   { background-color: #0F0F1A !important; }
        /* Cards */
        [data-theme="dark"] .ss-card,
        [data-theme="dark"] .bg-white            { background-color: #1A1A2E !important; border-color: rgba(255,255,255,0.07) !important; }
        /* Inputs */
        [data-theme="dark"] .ss-input,
        [data-theme="dark"] .bg-gray-50          { background-color: #252540 !important; color: #E8E8F4 !important; border-color: rgba(255,255,255,0.12) !important; }
        /* Text */
        [data-theme="dark"] .ss-text,
        [data-theme="dark"] .text-gray-900,
        [data-theme="dark"] .text-gray-800,
        [data-theme="dark"] .text-gray-700       { color: #E8E8F4 !important; }
        [data-theme="dark"] .ss-text-muted,
        [data-theme="dark"] .text-gray-500,
        [data-theme="dark"] .text-gray-400,
        [data-theme="dark"] .text-gray-300       { color: #9090B0 !important; }
        [data-theme="dark"] .text-gray-600       { color: #B0B0D0 !important; }
        /* Borders */
        [data-theme="dark"] .border-gray-50,
        [data-theme="dark"] .border-gray-100,
        [data-theme="dark"] .border-gray-200     { border-color: rgba(255,255,255,0.08) !important; }
        /* Nav */
        [data-theme="dark"] .ss-bottom-nav,
        [data-theme="dark"] nav.fixed            { background-color: #1A1A2E !important; border-color: rgba(255,255,255,0.07) !important; }
        /* Sheets */
        [data-theme="dark"] .ss-bottom-sheet    { background-color: #1A1A2E !important; }
        /* Chips / inactive buttons */
        [data-theme="dark"] .ss-chip-inactive   { background-color: #252540 !important; color: #C0C0E0 !important; border-color: rgba(255,255,255,0.10) !important; }
        /* Section headers */
        [data-theme="dark"] .ss-section-header  { color: #9090B0 !important; background-color: #0F0F1A !important; }
        /* Drag handle */
        [data-theme="dark"] .ss-drag-handle     { background-color: #3A3A5C !important; }
        /* Dividers */
        [data-theme="dark"] .ss-divider,
        [data-theme="dark"] .border-b           { border-color: rgba(255,255,255,0.06) !important; }
        /* Avatar bg */
        [data-theme="dark"] .ss-avatar-bg,
        [data-theme="dark"] .bg-indigo-100      { background-color: #2D2D50 !important; }
        /* Sticky/scroll headers */
        [data-theme="dark"] .sticky             { background-color: #0F0F1A !important; }
        /* Badges */
        [data-theme="dark"] .bg-orange-50       { background-color: #2A1A0A !important; }
        [data-theme="dark"] .bg-indigo-50       { background-color: #1A1A3A !important; }
        [data-theme="dark"] .bg-red-50          { background-color: #2A0A0A !important; }
        [data-theme="dark"] .bg-green-50        { background-color: #0A2A0A !important; }
        [data-theme="dark"] .bg-yellow-50       { background-color: #2A2000 !important; }
        [data-theme="dark"] .text-indigo-800    { color: #A0A0FF !important; }
        [data-theme="dark"] .text-red-800       { color: #FF9090 !important; }
        [data-theme="dark"] .text-green-800     { color: #90FF90 !important; }
        [data-theme="dark"] .text-yellow-800    { color: #FFD080 !important; }
        [data-theme="dark"] .text-indigo-600,
        [data-theme="dark"] .text-indigo-700    { color: #8080FF !important; }
        /* SVG grid lines */
        [data-theme="dark"] svg line            { stroke: #2A2A4A !important; }
        [data-theme="dark"] svg text            { fill: #6060A0 !important; }
        /* Progress bar tracks */
        [data-theme="dark"] .bg-gray-100        { background-color: #252540 !important; }
        /* Modals */
        [data-theme="dark"] .bg-black\\/50      { background-color: rgba(0,0,0,0.7) !important; }
      `}</style>

      <div
        id="ss-root"
        className={`w-full min-h-screen relative overflow-hidden font-sans selection:bg-indigo-100 flex flex-col ss-page-bg ${isDark ? 'bg-[#0F0F1A]' : 'bg-[#F8F9FF]'}`}
        data-theme={settings.theme}
      >
        <OfflineBanner/>

        {/* Main content area */}
        <div className={activeTab === 'chat' ? 'flex flex-col flex-1 overflow-hidden pt-0' : 'flex-1 overflow-y-auto'}>
          {renderTab()}
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

        {/* Edit Expense Modal */}
        <BottomSheet isOpen={showEditExpenseModal} onClose={() => { setShowEditExpenseModal(false); setEditingExpense(null); }} title="Edit Expense">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500 ss-text-muted mb-1.5 block">Amount</label>
              <div className="flex items-center bg-gray-50 rounded-xl px-3 ss-input">
                <span className="text-gray-400 text-sm mr-1">{settings.currency}</span>
                <input type="number" inputMode="decimal" className="flex-1 bg-transparent py-3 text-sm outline-none"
                  value={editExpenseForm.amount} onChange={e => setEditExpenseForm(p => ({ ...p, amount: e.target.value }))} autoFocus/>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 ss-text-muted mb-1.5 block">Category</label>
              <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
                {CATEGORIES.map(cat => (
                  <button key={cat.name} onClick={() => setEditExpenseForm(p => ({ ...p, category: cat.name }))}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm whitespace-nowrap flex-shrink-0 transition-all duration-200 border ${editExpenseForm.category === cat.name ? 'bg-[#6C63FF] text-white border-[#6C63FF]' : 'bg-white text-gray-600 border-gray-100 ss-chip-inactive'}`}>
                    <span>{cat.emoji}</span><span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 ss-text-muted mb-1.5 block">Description</label>
              <input type="text" className="w-full bg-gray-50 rounded-xl px-3 py-3 text-sm outline-none ss-input"
                value={editExpenseForm.desc} onChange={e => setEditExpenseForm(p => ({ ...p, desc: e.target.value }))} placeholder="What was this for?" maxLength={60}/>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 ss-text-muted mb-1.5 block">Date</label>
              <input type="date" className="w-full bg-gray-50 rounded-xl px-3 py-3 text-sm outline-none ss-input"
                value={editExpenseForm.date} max={getTodayISO()} onChange={e => setEditExpenseForm(p => ({ ...p, date: e.target.value }))}/>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 ss-text-muted mb-1.5 block">Receipt Photo</label>
              <div className="flex gap-2 items-center">
                {editExpenseForm.photo && <img src={editExpenseForm.photo} alt="Receipt preview" className="w-14 h-14 rounded-xl object-cover border border-gray-100"/>}
                <label className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-500 cursor-pointer active:scale-95 transition-transform ss-input">
                  <Camera size={16}/>{editExpenseForm.photo ? 'Change Photo' : 'Add Receipt'}
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => {
                    const file = e.target.files[0]; if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => setEditExpenseForm(p => ({ ...p, photo: ev.target.result }));
                    reader.readAsDataURL(file);
                  }}/>
                </label>
                {editExpenseForm.photo && (
                  <button onClick={() => setEditExpenseForm(p => ({ ...p, photo: null }))}
                    className="w-9 h-9 rounded-xl bg-red-50 text-red-400 flex items-center justify-center active:scale-95 transition-transform" aria-label="Remove photo">
                    <X size={16}/>
                  </button>
                )}
              </div>
            </div>
            <button onClick={handleEditExpense} className="w-full py-3.5 rounded-2xl bg-[#6C63FF] text-white font-semibold text-sm active:scale-95 transition-transform">
              Save Changes
            </button>
          </div>
        </BottomSheet>

        {/* Edit Lending Modal */}
        <BottomSheet isOpen={showEditLendModal} onClose={() => { setShowEditLendModal(false); setEditingLend(null); }} title="Edit Lending">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500 ss-text-muted mb-1.5 block">Name</label>
              <input type="text" className="w-full bg-gray-50 rounded-xl px-3 py-3 text-sm outline-none ss-input"
                value={editLendForm.name} onChange={e => setEditLendForm(p => ({ ...p, name: e.target.value }))} placeholder="Borrower name" autoFocus/>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 ss-text-muted mb-1.5 block">Phone (optional)</label>
              <input type="tel" className="w-full bg-gray-50 rounded-xl px-3 py-3 text-sm outline-none ss-input"
                value={editLendForm.phone} onChange={e => setEditLendForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 XXXXX XXXXX"/>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 ss-text-muted mb-1.5 block">Original Amount</label>
              <div className="flex items-center bg-gray-50 rounded-xl px-3 ss-input">
                <span className="text-gray-400 text-sm mr-1">{settings.currency}</span>
                <input type="number" inputMode="decimal" className="flex-1 bg-transparent py-3 text-sm outline-none"
                  value={editLendForm.amount} onChange={e => setEditLendForm(p => ({ ...p, amount: e.target.value }))} placeholder="0"/>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 ss-text-muted mb-1.5 block">Reason</label>
              <input type="text" className="w-full bg-gray-50 rounded-xl px-3 py-3 text-sm outline-none ss-input"
                value={editLendForm.reason} onChange={e => setEditLendForm(p => ({ ...p, reason: e.target.value }))} placeholder="What was the money for?" maxLength={60}/>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 ss-text-muted mb-1.5 block">Date</label>
              <input type="date" className="w-full bg-gray-50 rounded-xl px-3 py-3 text-sm outline-none ss-input"
                value={editLendForm.date} max={getTodayISO()} onChange={e => setEditLendForm(p => ({ ...p, date: e.target.value }))}/>
            </div>
            <button onClick={handleEditLend} className="w-full py-3.5 rounded-2xl bg-[#4ECDC4] text-white font-semibold text-sm active:scale-95 transition-transform">
              Save Changes
            </button>
          </div>
        </BottomSheet>
      </div>
    </>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(err, info) { console.error('SpendSense crash:', err, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-[430px] mx-auto min-h-screen flex flex-col items-center justify-center p-8 bg-[#F8F9FF]">
          <p className="text-4xl mb-4">💸</p>
          <h2 className="font-semibold text-lg text-gray-800 mb-2">Something went wrong</h2>
          <p className="text-sm text-gray-400 text-center mb-6">{this.state.error?.message || 'Unknown error'}</p>
          <div className="flex gap-3">
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-5 py-3 bg-indigo-100 text-indigo-700 rounded-2xl text-sm font-medium active:scale-95 transition-transform"
            >
              Try Again
            </button>
            <button
              onClick={() => { localStorage.clear(); window.location.reload(); }}
              className="px-5 py-3 bg-[#FF6B6B] text-white rounded-2xl text-sm font-medium active:scale-95 transition-transform"
            >
              Reset App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const App = () => (
  <ErrorBoundary>
    <SpendSenseApp />
  </ErrorBoundary>
);

export default App;
