import React, { useState, useMemo, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import { formatCurr, getRelativeDateLabel, getTodayISO, parseAmount, generateId, avatarColor, getInitials } from '../utils.js';
import { BottomSheet, ConfirmDialog, useContactPicker } from '../components/GlobalComponents.jsx';

function AddLendModal({ isOpen, onClose, onAdd, settings, lendings, showToast }) {
  const sym = settings.currency;
  const [name,setName]=useState(''); const [phone,setPhone]=useState('');
  const [amount,setAmount]=useState(''); const [reason,setReason]=useState('');
  const [date,setDate]=useState(getTodayISO());
  const [amtErr,setAmtErr]=useState(false); const [nameErr,setNameErr]=useState(false);

  const quickContacts = useMemo(()=>{
    const seen={}; return lendings.filter(l=>{const k=l.name.toLowerCase(); if(seen[k]) return false; seen[k]=true; return true;}).slice(0,6);
  },[lendings]);

  const reset=()=>{setName('');setPhone('');setAmount('');setReason('');setDate(getTodayISO());setAmtErr(false);setNameErr(false);};
  const submit=()=>{
    let err=false;
    if(!name.trim()){setNameErr(true);err=true;}else setNameErr(false);
    const amt=parseAmount(amount); if(!amt){setAmtErr(true);err=true;}else setAmtErr(false);
    if(err) return;
    onAdd({
      id: generateId(),
      name: name.trim(),
      phone: phone.trim(),
      amountOriginal: parseFloat(amt),
      amountPaid: 0,
      payments: [],
      amount: amt,
      reason: reason.trim(),
      date,
      status: 'pending',
      createdAt: Date.now()
    });
    reset(); onClose();
  };

  const { pickContact } = useContactPicker(
    ({ name: n, phone: p }) => { setName(n); setPhone(p); },
    showToast
  );

  return (
    <BottomSheet isOpen={isOpen} onClose={()=>{reset();onClose();}} title="Add Lending">
      {quickContacts.length>0&&(
        <div className="mb-4">
          <p className="text-xs text-gray-400 mb-2">Quick Select</p>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {quickContacts.map(l=>(
              <button key={l.id} onClick={()=>{setName(l.name);setPhone(l.phone||'');}}
                className="flex-shrink-0 flex flex-col items-center gap-1 focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg p-1">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{background:avatarColor(l.name)}}>{getInitials(l.name)}</div>
                <span className="text-[10px] text-gray-500 max-w-[48px] truncate">{l.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block" htmlFor="lend-name">Name</label>
          <div className="flex gap-2">
            <input id="lend-name" value={name} onChange={e=>{setName(e.target.value);setNameErr(false);}} placeholder="Person's name" aria-invalid={nameErr} aria-describedby={nameErr?'lend-name-err':undefined}
              className={`flex-1 border rounded-xl px-3 py-3 bg-gray-50 text-sm outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ss-input ${nameErr?'border-red-400':'border-gray-200'}`}/>
            <button onClick={pickContact} aria-label="Pick from contacts" className="w-11 h-11 border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 bg-gray-50 active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-500">👤</button>
          </div>
          {nameErr&&<p id="lend-name-err" role="alert" className="text-xs text-red-500 mt-1">Name is required</p>}
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block" htmlFor="lend-phone">Phone (optional)</label>
          <input id="lend-phone" type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+91 98765 43210"
            className="w-full border border-gray-200 rounded-xl px-3 py-3 bg-gray-50 text-sm outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"/>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block" htmlFor="lend-amount">Amount</label>
          <div className={`flex items-center border rounded-xl px-3 gap-2 bg-gray-50 ${amtErr?'border-red-400':'border-gray-200'}`}>
            <span className="text-gray-400 text-sm">{sym}</span>
            <input id="lend-amount" type="number" inputMode="decimal" value={amount} onChange={e=>{setAmount(e.target.value);setAmtErr(false);}} placeholder="0.00"
              aria-invalid={amtErr} aria-describedby={amtErr?'lend-amt-err':undefined}
              className="flex-1 py-3 bg-transparent outline-none text-sm text-gray-800 focus-visible:ring-0"/>
          </div>
          {amtErr&&<p id="lend-amt-err" role="alert" className="text-xs text-red-500 mt-1">Enter a valid amount</p>}
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block" htmlFor="lend-reason">Reason</label>
          <input id="lend-reason" value={reason} onChange={e=>setReason(e.target.value)} placeholder="What for?"
            className="w-full border border-gray-200 rounded-xl px-3 py-3 bg-gray-50 text-sm outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"/>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block" htmlFor="lend-date">Date</label>
          <input id="lend-date" type="date" value={date} max={getTodayISO()} onChange={e=>setDate(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-3 bg-gray-50 text-sm outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"/>
        </div>
        <button onClick={submit} className="w-full py-3.5 bg-[#4ECDC4] text-white rounded-2xl font-semibold text-sm active:scale-95 transition-transform focus-visible:ring-2 focus-visible:ring-[#4ECDC4] focus-visible:ring-offset-2">
          Add Lending
        </button>
      </div>
    </BottomSheet>
  );
}

function PartialReturnModal({ isOpen, lend, onClose, onConfirm, sym }) {
  const [amt,setAmt]=useState('');
  const [date,setDate]=useState(getTodayISO());
  if(!lend) return null;
  const submit=()=>{
    const v=parseAmount(amt);
    if(!v||v>lend.amount) return;
    onConfirm(lend.id,v,date); setAmt(''); onClose();
  };
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Mark as Returned">
      <div className="space-y-4">
        <p className="text-sm text-gray-500">Total lent: <strong>{formatCurr(lend.amount,sym)}</strong></p>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block" htmlFor="ret-amt">Amount Returned</label>
          <div className="flex items-center border border-gray-200 rounded-xl px-3 gap-2 bg-gray-50">
            <span className="text-gray-400 text-sm">{sym}</span>
            <input id="ret-amt" type="number" inputMode="decimal" value={amt} onChange={e=>setAmt(e.target.value)} placeholder={String(lend.amount)} autoFocus
              className="flex-1 py-3 bg-transparent outline-none text-sm text-gray-800 focus-visible:ring-0"/>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block" htmlFor="ret-date">Return Date</label>
          <input id="ret-date" type="date" value={date} max={getTodayISO()} onChange={e=>setDate(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-3 bg-gray-50 text-sm outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"/>
        </div>
        <button onClick={submit} className="w-full py-3.5 bg-[#51CF66] text-white rounded-2xl font-semibold text-sm active:scale-95 transition-transform">Confirm Return</button>
      </div>
    </BottomSheet>
  );
}

export default function LendView({ settings, lendings, setLendings, showToast }) {
  const sym = settings.currency;
  const [lendFilter,setLendFilter]=useState('pending');
  const [showAdd,setShowAdd]=useState(false);
  const [deleteId,setDeleteId]=useState(null);
  const [expandedPayments, setExpandedPayments] = useState({});

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState(null);
  const [paymentForm, setPaymentForm] = useState({ amount: '', date: getTodayISO(), note: '' });

  const pendingCount=useMemo(()=>lendings.filter(l=>l.status==='pending'||l.status==='partial').length,[lendings]);
  const returnedCount=useMemo(()=>lendings.filter(l=>l.status==='returned').length,[lendings]);
  const pendingTotal=useMemo(()=>lendings.filter(l=>l.status==='pending'||l.status==='partial').reduce((s,l)=>s+(l.amountRemaining??l.amount),0),[lendings]);

  const filtered=useMemo(()=>{
    if(lendFilter==='pending') return lendings.filter(l=>l.status==='pending'||l.status==='partial');
    if(lendFilter==='returned') return lendings.filter(l=>l.status==='returned');
    return [...lendings].sort((a,b)=>new Date(b.date)-new Date(a.date));
  },[lendings,lendFilter]);

  const addLend=useCallback((l)=>{setLendings(p=>[l,...p]);showToast('Lending added!','success');},[setLendings,showToast]);
  const deleteLend=useCallback((id)=>{setLendings(p=>p.filter(l=>l.id!==id));showToast('Deleted','info');setDeleteId(null);},[setLendings,showToast]);

  const handleRecordPayment = () => {
    const amt = parseFloat(paymentForm.amount);
    if (!amt || amt <= 0) { showToast('Enter a valid amount', 'error'); return; }
    const remaining = paymentTarget.amountOriginal - paymentTarget.amountPaid;
    if (amt > remaining) { showToast('Amount exceeds remaining balance', 'error'); return; }
    const newPayment = { id: generateId(), amount: amt, date: paymentForm.date, note: paymentForm.note.trim() };
    const newAmountPaid = paymentTarget.amountPaid + amt;
    const newRemaining = paymentTarget.amountOriginal - newAmountPaid;
    const newStatus = newRemaining <= 0 ? 'returned' : 'partial';
    setLendings(prev => prev.map(l => l.id === paymentTarget.id ? {
      ...l,
      amountPaid: newAmountPaid,
      amount: newRemaining,
      status: newStatus,
      payments: [...(l.payments || []), newPayment]
    } : l));
    setShowPaymentModal(false);
    setPaymentTarget(null);
    setPaymentForm({ amount: '', date: getTodayISO(), note: '' });
    if (newStatus === 'returned') {
      showToast('Fully returned! 🎉', 'success');
    } else {
      showToast(`Payment recorded — ${sym}${newRemaining.toFixed(2)} remaining`, 'info');
    }
  };

  const remindLending = (lend) => {
    const paid = lend.amountPaid || 0;
    const original = lend.amountOriginal || lend.amount;
    const remaining = original - paid;
    const text = paid > 0
      ? `Hey ${lend.name}! 👋 You borrowed ${sym}${original} from me on ${getRelativeDateLabel(lend.date)}${lend.reason?` for '${lend.reason}'`:''}. You've returned ${sym}${paid.toFixed(2)} so far — ${sym}${remaining.toFixed(2)} is still pending. Please return it when you can! 😊`
      : `Hey ${lend.name}! 👋 Friendly reminder — you borrowed ${sym}${original} from me on ${getRelativeDateLabel(lend.date)}${lend.reason?` for '${lend.reason}'`:''}. Please return it when you can! 😊`;
    if (lend.phone) { window.open(`https://wa.me/${lend.phone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(text)}`, '_blank'); }
    else { navigator.clipboard.writeText(text).then(() => showToast('Message copied!', 'success')); }
  };

  const remindAll=()=>{
    const pending=lendings.filter(l=>l.status==='pending'||l.status==='partial');
    if(!pending.length){showToast('No pending lendings!','error');return;}
    pending.forEach((l,i)=>setTimeout(()=>remindLending(l),i*1200));
    showToast(`Reminding ${pending.length} people...`,'info');
  };

  const FILTER_TABS=[{id:'pending',label:'Pending',count:pendingCount},{id:'returned',label:'Returned',count:returnedCount},{id:'all',label:'All'}];

  return (
    <div className="px-4 pt-4 pb-32 animate-fade-in">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-bold text-gray-900 ss-text">Lendings</h2>
        <div className="flex gap-2">
          <button onClick={remindAll} aria-label="Remind all" className="text-xs font-medium px-3 py-1.5 rounded-full border border-[#4ECDC4] text-[#4ECDC4] active:scale-95 transition-all focus-visible:ring-2 focus-visible:ring-[#4ECDC4]">Remind All</button>
          <button onClick={()=>setShowAdd(true)} aria-label="Add lending" className="text-xs font-medium px-3 py-1.5 rounded-full bg-[#4ECDC4] text-white active:scale-95 transition-all focus-visible:ring-2 focus-visible:ring-[#4ECDC4]">+ Add</button>
        </div>
      </div>

      <div className="rounded-2xl p-4 mb-3 text-white" style={{background:'linear-gradient(135deg,#4ECDC4,#0984e3)'}}>
        <p className="text-2xl font-bold">{formatCurr(pendingTotal,sym)}</p>
        <p className="text-xs opacity-80 mt-0.5">{pendingCount} pending</p>
      </div>

      <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-2xl">
        {FILTER_TABS.map(t=>(
          <button key={t.id} onClick={()=>setLendFilter(t.id)} aria-label={t.label}
            className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-500 ${lendFilter===t.id?'bg-white text-gray-900 shadow-sm':'text-gray-500'}`}>
            {t.label}{t.count!=null&&<span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${lendFilter===t.id?'bg-indigo-100 text-indigo-600':'bg-gray-200 text-gray-500'}`}>{t.count}</span>}
          </button>
        ))}
      </div>

      {filtered.length===0?(
        <div className="flex flex-col items-center py-14">
          <span className="text-5xl mb-3">🤝</span>
          <p className="font-medium text-gray-700">No {lendFilter==='all'?'':lendFilter+' '}lendings</p>
          <p className="text-xs text-gray-400 mt-1">Keep track of who owes you money</p>
        </div>
      ):lendings.filter(l => lendFilter === 'all' ? true : lendFilter === 'pending' ? (l.status === 'pending' || l.status === 'partial') : l.status === 'returned').map(lend => {
        const original = lend.amountOriginal || parseFloat(lend.amount);
        const paid = lend.amountPaid || 0;
        const remaining = original - paid;
        const progressPct = original > 0 ? (paid / original) * 100 : 0;
        const daysSince = Math.floor((Date.now() - new Date(lend.date+'T00:00:00')) / 86400000);
        const expanded = expandedPayments[lend.id] || false;
        return (
          <div key={lend.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 mb-3 ss-card relative">
            <button onClick={()=>setDeleteId(lend.id)} aria-label="Delete lending" className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-xl bg-red-50 text-red-400 active:scale-95 transition-transform"><Trash2 size={14}/></button>
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 font-semibold text-sm flex-shrink-0" style={{background:avatarColor(lend.name)}}>
                {getInitials(lend.name)}
              </div>
              <div className="flex-1 min-w-0 pr-8">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm text-gray-800 truncate ss-text">{lend.name}</p>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                    lend.status === 'returned' ? 'bg-green-100 text-green-700' :
                    lend.status === 'partial'  ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {lend.status === 'returned' ? 'Returned' : lend.status === 'partial' ? 'Partial' : 'Pending'}
                  </span>
                </div>
                <p className="text-xs text-gray-400 ss-text-muted mt-0.5">{lend.reason}</p>
                <p className="text-xs text-gray-400 ss-text-muted">{getRelativeDateLabel(lend.date)}</p>
              </div>
            </div>

            <div className="mt-3">
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-lg font-bold text-[#4ECDC4]">{formatCurr(remaining, sym)}</span>
                <span className="text-xs text-gray-400 ss-text-muted">of {formatCurr(original, sym)}</span>
              </div>
              {paid > 0 && (
                <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
                  <div className="bg-[#4ECDC4] h-1.5 rounded-full transition-all duration-700" style={{ width: progressPct + '%' }} />
                </div>
              )}
              {lend.status !== 'returned' && daysSince > 30 && (
                <p className="text-[10px] bg-red-50 text-red-600 font-medium px-2 py-0.5 rounded inline-block mb-2">⚠️ {daysSince}d overdue</p>
              )}
              {lend.status !== 'returned' && daysSince >= 7 && daysSince <= 30 && (
                <p className="text-[10px] bg-yellow-50 text-yellow-600 px-2 py-0.5 rounded inline-block mb-2">{daysSince}d ago</p>
              )}
            </div>

            {lend.status !== 'returned' && (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => { setPaymentTarget(lend); setPaymentForm({ amount: remaining.toFixed(2), date: getTodayISO(), note: '' }); setShowPaymentModal(true); }}
                  className="flex-1 py-1.5 rounded-xl bg-teal-50 text-teal-600 text-xs font-medium active:scale-95 transition-transform border border-teal-100 focus-visible:ring-2 focus-visible:ring-teal-400"
                >
                  + Payment
                </button>
                <button
                  onClick={() => remindLending(lend)}
                  className="flex-1 py-1.5 rounded-xl bg-green-50 text-green-600 text-xs font-medium active:scale-95 transition-transform border border-green-100 focus-visible:ring-2 focus-visible:ring-green-400"
                >
                  Remind
                </button>
                <button
                  onClick={() => setLendings(prev => prev.map(l => l.id === lend.id ? { ...l, status: 'returned', amountPaid: original, amount: 0 } : l))}
                  className="px-3 py-1.5 rounded-xl bg-gray-50 text-gray-400 text-[10px] font-medium active:scale-95 transition-transform border border-gray-100"
                >
                  Full ✓
                </button>
              </div>
            )}
            {lend.status === 'returned' && (
              <button
                onClick={() => setLendings(prev => prev.map(l => l.id === lend.id ? { ...l, status: 'pending', amountPaid: 0, amount: original, payments: [] } : l))}
                className="w-full mt-3 py-1.5 rounded-xl bg-gray-50 text-gray-400 text-xs font-medium active:scale-95 transition-transform border border-gray-100"
              >
                Undo Return
              </button>
            )}

            {lend.payments && lend.payments.length > 0 && (
              <div className="mt-3 border-t border-gray-50 pt-3 ss-divider">
                <button
                  onClick={() => setExpandedPayments(prev => ({ ...prev, [lend.id]: !prev[lend.id] }))}
                  className="flex items-center justify-between w-full text-xs text-gray-400 ss-text-muted"
                >
                  <span>{lend.payments.length} payment{lend.payments.length > 1 ? 's' : ''} recorded</span>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
                </button>
                {expanded && (
                  <div className="mt-2 space-y-1.5">
                    {lend.payments.map(p => (
                      <div key={p.id} className="flex items-center justify-between text-xs">
                        <span className="text-gray-400 ss-text-muted">{getRelativeDateLabel(p.date)}{p.note ? ` · ${p.note}` : ''}</span>
                        <span className="text-teal-500 font-medium">+{formatCurr(p.amount, sym)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      <AddLendModal isOpen={showAdd} onClose={()=>setShowAdd(false)} onAdd={addLend} settings={settings} lendings={lendings} showToast={showToast}/>
      
      <BottomSheet isOpen={showPaymentModal} onClose={() => { setShowPaymentModal(false); setPaymentTarget(null); }} title={`Record Payment — ${paymentTarget?.name}`}>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 ss-text-muted mb-1.5 block">Amount Returned</label>
            <div className="flex items-center bg-gray-50 rounded-xl px-3 ss-input">
              <span className="text-gray-400 text-sm mr-1">{sym}</span>
              <input
                type="number"
                inputMode="decimal"
                className="flex-1 bg-transparent py-3 text-sm outline-none ss-input"
                value={paymentForm.amount}
                onChange={e => setPaymentForm(p => ({ ...p, amount: e.target.value }))}
                placeholder="0"
                autoFocus
              />
            </div>
            {paymentTarget && (
              <p className="text-xs text-gray-400 ss-text-muted mt-1">
                Remaining: {formatCurr(paymentTarget.amountOriginal - paymentTarget.amountPaid, sym)}
              </p>
            )}
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 ss-text-muted mb-1.5 block">Date</label>
            <input
              type="date"
              className="w-full bg-gray-50 rounded-xl px-3 py-3 text-sm outline-none ss-input border border-gray-200"
              value={paymentForm.date}
              max={getTodayISO()}
              onChange={e => setPaymentForm(p => ({ ...p, date: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 ss-text-muted mb-1.5 block">Note (optional)</label>
            <input
              type="text"
              className="w-full bg-gray-50 rounded-xl px-3 py-3 text-sm outline-none ss-input border border-gray-200"
              value={paymentForm.note}
              onChange={e => setPaymentForm(p => ({ ...p, note: e.target.value }))}
              placeholder="e.g. UPI, cash, bank transfer"
              maxLength={50}
            />
          </div>
          <button
            onClick={handleRecordPayment}
            className="w-full py-3.5 rounded-2xl bg-[#4ECDC4] text-white font-semibold text-sm active:scale-95 transition-transform mb-6"
          >
            Record Payment
          </button>
        </div>
      </BottomSheet>

      <ConfirmDialog isOpen={!!deleteId} title="Delete Lending?" message="This cannot be undone." confirmLabel="Delete" confirmColor="#FF6B6B" onConfirm={()=>deleteLend(deleteId)} onCancel={()=>setDeleteId(null)}/>
    </div>
  );
}
