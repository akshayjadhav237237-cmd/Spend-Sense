import React, { useState, useMemo, useCallback } from 'react';
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
    onAdd({id:generateId(),name:name.trim(),phone:phone.trim(),amount:amt,reason:reason.trim(),date,status:'pending',createdAt:Date.now()});
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
  const [returnLend,setReturnLend]=useState(null);
  const [deleteId,setDeleteId]=useState(null);

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

  const handleReturn=(id,amtReturned,date)=>{
    setLendings(p=>p.map(l=>{
      if(l.id!==id) return l;
      const rem=(l.amountRemaining??l.amount)-amtReturned;
      if(rem<=0) return {...l,status:'returned',amountReturned:l.amount,returnDate:date};
      return {...l,status:'partial',amountReturned,amountRemaining:rem};
    }));
    showToast('Updated!','success');
  };

  const remindLend=(lend)=>{
    const text=`Hey ${lend.name}! 👋 Friendly reminder — you borrowed ${sym}${lend.amount} from me on ${getRelativeDateLabel(lend.date)}${lend.reason?` for '${lend.reason}'`:''} . Please return it when you can! 😊`;
    if(lend.phone){window.open(`https://wa.me/${lend.phone.replace(/[^\d]/g,'')}?text=${encodeURIComponent(text)}`,'_blank');}
    else{navigator.clipboard.writeText(text).then(()=>showToast('Message copied!','success'));}
  };

  const remindAll=()=>{
    const pending=lendings.filter(l=>l.status==='pending'||l.status==='partial');
    if(!pending.length){showToast('No pending lendings!','error');return;}
    pending.forEach((l,i)=>setTimeout(()=>remindLend(l),i*1200));
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
      ):filtered.map(lend=>{
        const days=Math.floor((Date.now()-new Date(lend.date+'T00:00:00'))/86400000);
        const isPending=lend.status==='pending'||lend.status==='partial';
        return(
          <div key={lend.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 mb-3 hover:shadow-md transition-shadow ss-card">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{background:avatarColor(lend.name)}}>{getInitials(lend.name)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-900 text-sm ss-text">{lend.name}</p>
                  <p className="text-base font-bold" style={{color:'#4ECDC4'}}>{formatCurr(lend.amountRemaining??lend.amount,sym)}</p>
                </div>
                {lend.reason&&<p className="text-xs text-gray-400 mt-0.5">{lend.reason}</p>}
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs text-gray-400">{getRelativeDateLabel(lend.date)}</span>
                  {lend.status==='pending'&&<span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">Pending</span>}
                  {lend.status==='partial'&&<span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Partial</span>}
                  {lend.status==='returned'&&<span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Returned ✓</span>}
                  {isPending&&days>30&&<span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">⚠️ {days}d overdue</span>}
                  {isPending&&days>=7&&days<=30&&<span className="text-[10px] bg-yellow-50 text-yellow-600 px-2 py-0.5 rounded-full">{days}d ago</span>}
                </div>
                {lend.status==='partial'&&<p className="text-xs text-gray-400 mt-0.5">Remaining: {formatCurr(lend.amountRemaining,sym)}</p>}
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              {isPending&&(<>
                <button onClick={()=>remindLend(lend)} aria-label={`Remind ${lend.name}`} className="flex-1 py-2 rounded-xl text-xs font-medium bg-[#4ECDC4]/10 text-[#4ECDC4] active:scale-95 transition-transform focus-visible:ring-2 focus-visible:ring-[#4ECDC4]">💬 Remind</button>
                <button onClick={()=>setReturnLend(lend)} aria-label="Mark as returned" className="flex-1 py-2 rounded-xl text-xs font-medium bg-green-50 text-green-600 active:scale-95 transition-transform focus-visible:ring-2 focus-visible:ring-green-500">✓ Returned</button>
              </>)}
              {lend.status==='returned'&&(
                <button onClick={()=>setLendings(p=>p.map(l=>l.id===lend.id?{...l,status:'pending',amountReturned:undefined,amountRemaining:undefined}:l))} aria-label="Undo return" className="flex-1 py-2 rounded-xl text-xs font-medium bg-gray-100 text-gray-500 active:scale-95 transition-transform focus-visible:ring-2 focus-visible:ring-gray-400">Undo</button>
              )}
              <button onClick={()=>setDeleteId(lend.id)} aria-label="Delete lending" className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 text-red-400 active:scale-95 transition-transform focus-visible:ring-2 focus-visible:ring-red-400">🗑</button>
            </div>
          </div>
        );
      })}

      <AddLendModal isOpen={showAdd} onClose={()=>setShowAdd(false)} onAdd={addLend} settings={settings} lendings={lendings} showToast={showToast}/>
      <PartialReturnModal isOpen={!!returnLend} lend={returnLend} onClose={()=>setReturnLend(null)} onConfirm={handleReturn} sym={sym}/>
      <ConfirmDialog isOpen={!!deleteId} title="Delete Lending?" message="This cannot be undone." confirmLabel="Delete" confirmColor="#FF6B6B" onConfirm={()=>deleteLend(deleteId)} onCancel={()=>setDeleteId(null)}/>
    </div>
  );
}
