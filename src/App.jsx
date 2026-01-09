import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Scanner } from '@yudiel/react-qr-scanner';
import {
  Users, UserPlus, LayoutDashboard, LogOut, Landmark, X, Camera, 
  Printer, AlertCircle, Moon, Sun, UserCheck, Search,
  TrendingUp, Calendar, Trash2, Edit3, Download, ArrowLeftRight, 
  Wallet, HandCoins, CheckSquare, Square, BarChart3, ChevronLeft, Clock, RefreshCw
} from 'lucide-react';

/* ===================== 1. CONFIGURATION ===================== */
const CONFIG = {
  supabase: {
    url: 'https://watrosnylvkiuvuptdtp.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhdHJvc255bHZraXV2dXB0ZHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MzE2NzEsImV4cCI6MjA4MjUwNzY3MX0.ku6_Ngf2JRJ8fxLs_Q-EySgCU37MjUK3WofpO9bazds'
  },
  business: {
    name: "ORE-OFE OLUWA",
    address: "No. 1, Bisiriyu Owokade Street, Molete, Lagos.",
    phones: "08107218385, 08027203601",
  },
  admin: { username: 'oreofe', password: 'oreofe' },
  modes: {
    ajo: { name: 'AJO SYSTEM', primary: '#3b82f6', membersTable: 'contributors', transTable: 'transactions' },
    loans: { name: 'LOAN SYSTEM', primary: '#ef4444', membersTable: 'loan_members', transTable: 'loan_transactions' }
  }
};

const supabase = createClient(CONFIG.supabase.url, CONFIG.supabase.key);

const DARK_THEME = { bg: '#020617', card: '#0f172a', text: '#f8fafc', textSecondary: '#94a3b8', border: '#1e293b' };
const LIGHT_THEME = { bg: '#f1f5f9', card: '#ffffff', text: '#0f172a', textSecondary: '#64748b', border: '#e2e8f0' };

/* ===================== 2. MAIN APP ===================== */
export default function App() {
  const [auth, setAuth] = useState(null); 
  const [mode, setMode] = useState(null); 
  const [view, setView] = useState('dashboard');
  const [data, setData] = useState({ members: [], agents: [], transactions: [] });
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [toasts, setToasts] = useState([]);
  const [modal, setModal] = useState({ show: false, title: '', msg: '', onConfirm: null });
  const [bulkPrintList, setBulkPrintList] = useState([]);
  const [perPage, setPerPage] = useState(8);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  const fetchData = useCallback(async () => {
    if (!auth || !mode) return;
    setLoading(true);
    const mConf = CONFIG.modes[mode];
    try {
      const [m, t, e] = await Promise.all([
        supabase.from(mConf.membersTable).select('*').order('registration_no'),
        supabase.from(mConf.transTable).select('*').order('created_at', { ascending: false }),
        supabase.from('employees').select('*').order('full_name')
      ]);
      setData({ members: m.data || [], transactions: t.data || [], agents: e.data || [] });
    } catch (err) { showToast("Sync Error", "error"); }
    finally { setLoading(false); }
  }, [auth, mode, showToast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const activePrimary = mode ? CONFIG.modes[mode].primary : '#3b82f6';
  const colors = theme === 'dark' ? { ...DARK_THEME, primary: activePrimary } : { ...LIGHT_THEME, primary: activePrimary };

  if (!auth) return <LoginScreen onLogin={async (c) => {
    setLoading(true);
    const u = c.username.trim().toLowerCase();
    if (u === CONFIG.admin.username && c.password === CONFIG.admin.password) setAuth({ role: 'admin' });
    else {
      const { data: ag } = await supabase.from('employees').select('*').eq('employee_id_number', u).eq('password', c.password).single();
      if (ag) setAuth({ id: ag.id, role: 'agent', name: ag.full_name, data: ag });
      else showToast("Invalid login", "error");
    }
    setLoading(false);
  }} colors={colors} loading={loading} />;
  
  if (!mode) return <ModeSelection setMode={setMode} colors={colors} onLogout={() => setAuth(null)} />;

  return (
    <div style={{ ...styles.app, background: colors.bg, color: colors.text }}>
      <div className="no-print">
        <Header business={CONFIG.modes[mode].name} role={auth.role} isDark={theme === 'dark'} onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} onSwitchMode={() => setMode(null)} colors={colors} />
        <main style={styles.main}>
          {loading && data.members.length === 0 ? <SkeletonLoader /> : (
            <>
              {auth.role === 'admin' ? 
                <AdminPortal view={view} data={data} onRefresh={fetchData} showToast={showToast} colors={colors} mode={mode} setBulkPrintList={setBulkPrintList} setModal={setModal} /> :
                <AgentPortal view={view} profile={auth.data} data={data} onRefresh={fetchData} showToast={showToast} colors={colors} mode={mode} />
              }
            </>
          )}
        </main>
        <Navigation view={view} role={auth.role} onNavigate={setView} onLogout={() => setModal({show:true, title:"Logout", msg:"Exit system?", onConfirm:()=>setAuth(null)})} colors={colors} />
      </div>

      <PrintEngine members={bulkPrintList} mode={mode} perPage={perPage} />
      <ToastContainer toasts={toasts} />
      {modal.show && <ConfirmationModal modal={modal} onClose={() => setModal(m => ({ ...m, show: false }))} colors={colors} />}
      {bulkPrintList.length > 0 && <BulkPrintConfig members={bulkPrintList} perPage={perPage} setPerPage={setPerPage} onClose={() => setBulkPrintList([])} colors={colors} />}
    </div>
  );
}

/* ===================== ADMIN DASHBOARD ===================== */

const AdminPortal = ({ view, data, onRefresh, showToast, colors, mode, setBulkPrintList, setModal }) => {
  const [selectedDay, setSelectedDay] = useState(null);
  const [syncing, setSyncing] = useState(false);

  const handleGlobalSync = async () => {
    setSyncing(true);
    try {
      const { data: members } = await supabase.from(CONFIG.modes[mode].membersTable).select('*');
      
      // We process each member's transactions
      for (const m of members) {
        // Find transactions for this member that are empty or have amount 0
        const { data: badTrans } = await supabase.from(CONFIG.modes[mode].transTable)
          .select('id, amount')
          .eq('contributor_id', m.id);

        if (badTrans && badTrans.length > 0) {
          const updates = badTrans.map(t => {
            const finalAmount = (t.amount && t.amount > 0) ? t.amount : m.expected_amount;
            return supabase.from(CONFIG.modes[mode].transTable)
              .update({ 
                full_name: m.full_name, 
                registration_no: m.registration_no,
                expected_amount: m.expected_amount,
                amount: finalAmount // FIXING THE "0" OR NULL AMOUNTS
              })
              .eq('id', t.id);
          });
          await Promise.all(updates);
        }
      }
      
      showToast("History Fixed & Synced", "success");
      onRefresh();
    } catch (err) { 
      showToast("Sync Failed", "error"); 
    } finally { 
      setSyncing(false); 
    }
  };

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return { 
      todayRev: data.transactions.filter(t => t.created_at.startsWith(today)).reduce((s, t) => s + (Number(t.amount) || 0), 0), 
      totalRev: data.transactions.reduce((s, t) => s + (Number(t.amount) || 0), 0) 
    };
  }, [data.transactions]);

  const dailyStats = useMemo(() => {
    const groups = {};
    data.transactions.forEach(t => {
      const date = t.created_at.split('T')[0];
      groups[date] = (groups[date] || 0) + (Number(t.amount) || 0);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 7); 
  }, [data.transactions]);

  if (view === 'dashboard') return (
    <div style={styles.fadeIn}>
      {selectedDay ? (
        <div>
          <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20}}>
            <button onClick={() => setSelectedDay(null)} style={{...styles.iconBtn, color: colors.text}}><ChevronLeft size={24}/></button>
            <div>
              <h2 style={{margin:0, fontSize: 18}}>{new Date(selectedDay).toLocaleDateString('en-GB', { dateStyle: 'full' })}</h2>
              <small style={styles.subtext}>Collection Breakdown</small>
            </div>
          </div>
          <TransactionList transactions={data.transactions.filter(t => t.created_at.startsWith(selectedDay))} colors={colors} showTime={true} showCollector={true} />
        </div>
      ) : (
        <>
          <div style={styles.statsGrid}>
            <StatCard title="Today" value={`₦${stats.todayRev.toLocaleString()}`} colors={colors} />
            <StatCard title="People" value={data.members.length} colors={colors} />
            <StatCard title="Total" value={`₦${stats.totalRev.toLocaleString()}`} colors={colors} />
          </div>

          <div style={{marginBottom: 20}}>
            <button onClick={handleGlobalSync} disabled={syncing} style={{...styles.btnSecondary, width: '100%', background: colors.card, border: `1px solid ${colors.border}`, display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'center', color: colors.text}}>
              <RefreshCw size={16} className={syncing ? "spin" : ""}/> {syncing ? "Repairing Amounts..." : "Global Sync (Fix History & Amounts)"}
            </button>
          </div>

          <SectionHeader title="Daily Collections" icon={<BarChart3 size={20} />} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {dailyStats.map(([date, amount]) => (
              <div key={date} onClick={() => setSelectedDay(date)} style={{ ...styles.listItem, padding: '12px 18px', marginBottom: 0, background: colors.card, borderColor: colors.border }}>
                <div style={{ flex: 1 }}>
                  <div style={{fontSize: 14, fontWeight: 'bold'}}>{new Date(date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</div>
                  <div style={styles.subtext}>{date}</div>
                </div>
                <strong style={{ color: colors.primary, fontSize: 16 }}>₦{amount.toLocaleString()}</strong>
              </div>
            ))}
          </div>

          <SectionHeader title="Recent Activity" icon={<TrendingUp size={20} />} />
          <TransactionList transactions={data.transactions.slice(0, 10)} colors={colors} />
        </>
      )}
    </div>
  );
  if (view === 'members') return <MemberManagement members={data.members} transactions={data.transactions} onRefresh={onRefresh} showToast={showToast} colors={colors} isAdmin={true} setModal={setModal} mode={mode} setBulkPrintList={setBulkPrintList} />;
  if (view === 'agents') return <AgentManagement agents={data.agents} onRefresh={onRefresh} showToast={showToast} colors={colors} confirmAction={(t,m,c)=>setModal({show:true,title:t,msg:m,onConfirm:c})} />;
  if (view === 'scan') return <ScannerView profile={null} onRefresh={onRefresh} showToast={showToast} colors={colors} mode={mode} />;
  return null;
};

/* ===================== SCANNER & PAYMENT ===================== */

const ScannerView = ({ profile, onRefresh, showToast, colors, mode }) => {
  const [scanning, setScanning] = useState(false);
  const [member, setMember] = useState(null);
  const [amt, setAmt] = useState('');
  const [days, setDays] = useState(1);
  const [backDate, setBackDate] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  const handleScanResult = useCallback(async (res) => {
    if (!res || res.length === 0) return;
    const val = res[0].rawValue.trim();
    try {
      let lookup;
      try { lookup = JSON.parse(val).id; } catch (e) { lookup = val; }
      const table = CONFIG.modes[mode].membersTable;
      let { data: m } = await supabase.from(table).select('*').eq('registration_no', lookup).maybeSingle();
      if (!m && lookup.length > 20) {
        const { data: m2 } = await supabase.from(table).select('*').eq('id', lookup).maybeSingle();
        m = m2;
      }
      if (m) { 
        setMember(m); 
        setAmt(String(m.expected_amount || '')); 
        setDays(1);
        setScanning(false); 
      }
      else showToast("Member Not Found", "error");
    } catch (e) { showToast("Invalid Card", "error"); }
  }, [mode, showToast]);

  const handlePayment = async () => {
    const inputAmt = Number(amt) || member.expected_amount || 0;
    if (inputAmt <= 0) return showToast("Enter valid amount", "error");
    
    setSaving(true);
    try {
      const finalAmt = inputAmt * Number(days);
      const payload = { 
        contributor_id: member.id, 
        full_name: member.full_name, 
        registration_no: member.registration_no,
        amount: finalAmt, 
        expected_amount: member.expected_amount,
        employee_name: profile?.name || 'Admin', 
        employee_id: profile?.id || null
      };
      if (!profile && backDate !== new Date().toISOString().slice(0, 10)) {
        payload.created_at = backDate + 'T' + new Date().toISOString().split('T')[1];
      }
      const { error } = await supabase.from(CONFIG.modes[mode].transTable).insert([payload]);
      if (error) throw error;
      showToast("Payment Recorded!", "success");
      setMember(null);
      onRefresh();
    } catch (err) { showToast("Save Failed", "error"); }
    finally { setSaving(false); }
  };

  if (member) return (
    <div style={{ ...styles.modalBox, background: colors.card, margin: '0 auto', maxWidth: 350 }}>
      <small style={{color: colors.primary, fontWeight:'bold'}}>{member.registration_no}</small>
      <h2 style={{margin: '5px 0 20px'}}>{member.full_name}</h2>
      {!profile && (
        <div style={{marginBottom: 15, textAlign: 'left'}}>
          <small style={styles.subtext}>Transaction Date (Admin)</small>
          <input type="date" value={backDate} onChange={e => setBackDate(e.target.value)} style={{...styles.input, marginTop: 5}} />
        </div>
      )}
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 15, marginBottom: 25}}>
        <div style={{flex: 1}}><small style={styles.subtext}>Amount (₦)</small>
          <input type="number" value={amt} onChange={e => setAmt(e.target.value)} style={{ width: '100%', fontSize: 24, fontWeight: 'bold', textAlign: 'center', background: 'none', border: 'none', borderBottom: `2px solid ${colors.primary}`, color: colors.text, outline: 'none' }} />
        </div>
        <div style={{fontSize: 24, opacity: 0.5, paddingTop: 15}}>×</div>
        <div style={{width: 80}}><small style={styles.subtext}>Days</small>
          <input type="number" value={days} onChange={e => setDays(Math.max(1, parseInt(e.target.value) || 1))} style={{ width: '100%', fontSize: 24, fontWeight: 'bold', textAlign: 'center', background: 'none', border: 'none', borderBottom: `2px solid ${colors.primary}`, color: colors.text, outline: 'none' }} />
        </div>
      </div>
      <div style={{marginBottom: 20, padding: 15, borderRadius: 12, background: `${colors.primary}10`}}>
        <small style={styles.subtext}>TOTAL TO PAY</small>
        <div style={{fontSize: 28, fontWeight: '900', color: colors.primary}}>₦{( (Number(amt) || member.expected_amount) * days).toLocaleString()}</div>
      </div>
      <button disabled={saving} onClick={handlePayment} style={{ ...styles.btnPrimary, background: colors.primary, width: '100%' }}>{saving ? 'Saving...' : 'Confirm Payment'}</button>
      <button onClick={() => setMember(null)} style={{ ...styles.btnSecondary, width: '100%', marginTop: 10 }}>Cancel</button>
    </div>
  );

  return (
    <div style={{ textAlign: 'center', padding: 20 }}>
      {!scanning ? (
        <button onClick={() => setScanning(true)} style={{ width: '100%', height: 200, borderRadius: 24, border: `2px dashed ${colors.primary}`, background: 'none', cursor: 'pointer', color: colors.primary, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <Camera size={48}/><br/>Start Scanning
        </button>
      ) : (
        <div style={{ position: 'relative', height: '380px', borderRadius: 24, overflow: 'hidden', border: `3px solid ${colors.primary}` }}>
          <Scanner onScan={handleScanResult} allowMultiple={false} />
          <button onClick={() => setScanning(false)} style={{ position:'absolute', top: 15, right: 15, background:'#ef4444', color:'#fff', borderRadius:'50%', padding:10, border:'none', zIndex: 50 }}><X/></button>
        </div>
      )}
    </div>
  );
};

/* ===================== MEMBER FORM ===================== */

const MemberForm = ({ member, mode, onClose, onSuccess, showToast, colors }) => {
  const isEdit = !!member;
  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const payload = { full_name: fd.get('n'), registration_no: fd.get('r'), phone_number: fd.get('p') || '', address: fd.get('a') || '', expected_amount: Number(fd.get('am')), ajo_owner_id: 'admin' };
    if (mode === 'loans') { payload.total_loan_amount = Number(fd.get('tla') || 0); payload.total_to_repay = Number(fd.get('ttr') || 0); }
    
    const { error } = isEdit ? await supabase.from(CONFIG.modes[mode].membersTable).update(payload).eq('id', member.id) : await supabase.from(CONFIG.modes[mode].membersTable).insert([payload]);
    
    if (error) { 
      showToast("Error saving", "error"); 
    } else {
      if (isEdit) {
        // Find existing transactions that might be missing amount info or need updates
        const { data: trans } = await supabase.from(CONFIG.modes[mode].transTable).select('id, amount').eq('contributor_id', member.id);
        if (trans) {
          const updates = trans.map(t => supabase.from(CONFIG.modes[mode].transTable).update({ 
            full_name: payload.full_name, 
            registration_no: payload.registration_no,
            expected_amount: payload.expected_amount,
            amount: (t.amount && t.amount > 0) ? t.amount : payload.expected_amount
          }).eq('id', t.id));
          await Promise.all(updates);
        }
      }
      showToast("Saved & History Repaired", "success"); 
      onSuccess(); 
    }
  };
  return (
    <div style={styles.overlay}>
      <div style={{ ...styles.modalBox, background: colors.card, maxWidth: 400 }}>
        <h3>{isEdit ? 'Update' : 'New'} Member</h3>
        <form onSubmit={handleSubmit} style={{ textAlign: 'left', display: 'grid', gap: 10 }}>
          <input name="n" defaultValue={member?.full_name} placeholder="Name" style={styles.input} required />
          <input name="r" defaultValue={member?.registration_no} placeholder="Serial Number" style={styles.input} required />
          <input name="am" type="number" defaultValue={member?.expected_amount} placeholder="Amount" style={styles.input} required />
          {mode === 'loans' && (
            <><input name="tla" type="number" defaultValue={member?.total_loan_amount} placeholder="Loan Taken" style={styles.input} required /><input name="ttr" type="number" defaultValue={member?.total_to_repay} placeholder="Total to Pay" style={styles.input} required /></>
          )}
          <input name="p" defaultValue={member?.phone_number} placeholder="Phone" style={styles.input} />
          <textarea name="a" defaultValue={member?.address} placeholder="Address" style={{...styles.input, height: 60}} />
          <div style={{ display: 'flex', gap: 10 }}><button type="submit" style={{ ...styles.btnPrimary, background: colors.primary, flex: 1 }}>Save</button><button type="button" onClick={onClose} style={{...styles.btnSecondary, flex: 1}}>Cancel</button></div>
        </form>
      </div>
    </div>
  );
};

/* ===================== SHARED UI (UNCHANGED) ===================== */

const MemberManagement = ({ members, transactions, onRefresh, showToast, colors, isAdmin, mode, setModal, setBulkPrintList }) => {
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [focusedIdx, setFocusedIdx] = useState(0);
  const [form, setForm] = useState({ show: false, member: null });
  const anchorIdx = useRef(null);
  const filtered = useMemo(() => members.filter(m => (m.full_name || '').toLowerCase().includes(search.toLowerCase()) || (m.registration_no || '').includes(search.toUpperCase())), [members, search]);
  const handleKeyboard = (e) => {
    if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
    if (filtered.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); const next = Math.min(focusedIdx + 1, filtered.length - 1); if (e.shiftKey) { const start = Math.min(anchorIdx.current ?? focusedIdx, next); const end = Math.max(anchorIdx.current ?? focusedIdx, next); setSelectedIds(filtered.slice(start, end + 1).map(m => m.id)); } setFocusedIdx(next); } 
    else if (e.key === 'ArrowUp') { e.preventDefault(); const next = Math.max(focusedIdx - 1, 0); if (e.shiftKey) { const start = Math.min(anchorIdx.current ?? focusedIdx, next); const end = Math.max(anchorIdx.current ?? focusedIdx, next); setSelectedIds(filtered.slice(start, end + 1).map(m => m.id)); } setFocusedIdx(next); } 
    else if (e.key === ' ') { e.preventDefault(); const id = filtered[focusedIdx].id; setSelectedIds(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id]); anchorIdx.current = focusedIdx; }
  };
  const getBalance = (m) => { const paid = transactions.filter(t => t.contributor_id === m.id).reduce((s, t) => s + (t.amount || 0), 0); return (m.total_to_repay || 0) - paid; };
  return (
    <div onKeyDown={handleKeyboard} tabIndex={0} style={{outline:'none'}}>
      <SearchBar value={search} onChange={setSearch} placeholder="Search members..." colors={colors} />
      <div style={{ display: 'flex', gap: 10, marginBottom: 15 }}>{isAdmin && <button onClick={() => setForm({ show: true, member: null })} style={{ ...styles.btnPrimary, background: colors.primary, flex: 1 }}>+ New Member</button>}<div style={{display:'flex', gap:5}}><button onClick={() => setSelectedIds(filtered.map(m => m.id))} style={styles.smallGhostBtn}>All</button><button onClick={() => setSelectedIds([])} style={styles.smallGhostBtn}>Clear</button></div></div>
      {selectedIds.length > 0 && (<div style={{...styles.floatingBar, background: colors.card, borderColor: colors.primary}}><span>{selectedIds.length} Selected</span><div style={{display:'flex', gap: 8}}><button onClick={() => setBulkPrintList(members.filter(m => selectedIds.includes(m.id)))} style={{...styles.btnPrimary, padding: '8px 16px', fontSize: 12, background: '#10b981'}}>Print Cards</button><button onClick={() => setSelectedIds([])} style={{...styles.btnSecondary, padding: '8px 16px', fontSize: 12}}>Cancel</button></div></div>)}
      {form.show && <MemberForm member={form.member} mode={mode} onClose={() => setForm({ show: false, member: null })} onSuccess={() => { setForm({ show: false, member: null }); onRefresh(); }} showToast={showToast} colors={colors} />}
      <div style={styles.list}>{filtered.map((m, idx) => {
        const isSelected = selectedIds.includes(m.id); const isFocused = focusedIdx === idx; const balance = mode === 'loans' ? getBalance(m) : null; const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${m.registration_no}`;
        return (<div key={m.id} onClick={() => { setSelectedIds(p => p.includes(m.id) ? p.filter(i => i !== m.id) : [...p, m.id]); setFocusedIdx(idx); anchorIdx.current = idx; }} style={{ ...styles.listItem, background: isFocused ? `${colors.primary}15` : colors.card, borderColor: isSelected ? colors.primary : isFocused ? colors.primary : colors.border }}><div style={{ width: 50, height: 50, background: '#fff', borderRadius: 8, overflow: 'hidden', marginRight: 12, border: '1px solid #ddd' }}><img src={qrUrl} alt="qr" style={{ width: '100%', height: '100%' }} /></div><div style={{ flex: 1 }}><strong style={{ fontSize: 14 }}>{m.full_name}</strong><div style={styles.subtext}>{m.registration_no}</div>{mode === 'loans' && <div style={{ fontSize: 10, fontWeight:'bold', color: balance > 0 ? '#ef4444' : '#10b981' }}>Bal: ₦{balance.toLocaleString()}</div>}</div>{isAdmin && (<div style={{display:'flex', gap: 5}}><button onClick={(e) => { e.stopPropagation(); setForm({ show: true, member: m }); }} style={{ ...styles.iconBtn, color: colors.primary }}><Edit3 size={18} /></button><button onClick={(e) => { e.stopPropagation(); setModal({show:true, title:"Delete?", msg:`Delete ${m.full_name}?`, onConfirm:async ()=>{await supabase.from(CONFIG.modes[mode].membersTable).delete().eq('id', m.id); onRefresh();}}); }} style={{ ...styles.iconBtn, color: '#ef4444' }}><Trash2 size={18} /></button></div>)}</div>);
      })}</div>
    </div>
  );
};

const AgentPortal = ({ view, profile, data, onRefresh, showToast, colors, mode }) => {
  const stats = useMemo(() => { const today = new Date().toISOString().slice(0, 10); const myTs = data.transactions.filter(t => t.employee_id === profile?.id); return { todayTotal: myTs.filter(t => t.created_at.startsWith(today)).reduce((s, t) => s + (Number(t.amount) || 0), 0), count: myTs.filter(t => t.created_at.startsWith(today)).length }; }, [data.transactions, profile?.id]);
  if (view === 'dashboard') return (<div style={styles.fadeIn}><div style={{padding: 30, borderRadius: 24, background: colors.primary, color: '#fff', marginBottom: 20}}><small>COLLECTED TODAY</small><h1 style={{fontSize: 32}}>₦{stats.todayTotal.toLocaleString()}</h1><span>{stats.count} Operations</span></div><SectionHeader title="Recent Activity" icon={<Calendar size={20} />} /><TransactionList transactions={data.transactions.filter(t => t.employee_id === profile?.id).slice(0, 10)} colors={colors} /></div>);
  if (view === 'members') return <MemberManagement members={data.members} transactions={data.transactions} onRefresh={onRefresh} showToast={showToast} colors={colors} isAdmin={false} mode={mode} setBulkPrintList={()=>{}} />;
  if (view === 'scan') return <ScannerView profile={profile} onRefresh={onRefresh} showToast={showToast} colors={colors} mode={mode} />;
  return null;
};

const AgentManagement = ({ agents, onRefresh, showToast, colors, confirmAction }) => {
  const [form, setForm] = useState({ show: false, agent: null });
  return (<div><button onClick={() => setForm({ show: true, agent: null })} style={{ ...styles.btnPrimary, background: colors.primary, marginBottom: 15, width: '100%' }}><UserPlus size={16} /> New Agent</button>{form.show && <AgentForm agent={form.agent} onClose={() => setForm({ show: false, agent: null })} onSuccess={() => { setForm({ show: false, agent: null }); onRefresh(); }} showToast={showToast} colors={colors} />}<div style={styles.list}>{agents.map(a => (<div key={a.id} style={{ ...styles.listItem, background: colors.card, borderColor: colors.border }}><div style={{ flex: 1 }}><strong>{a.full_name}</strong><br/><small style={styles.subtext}>ID: {a.employee_id_number}</small></div><div style={{display:'flex', gap:5}}><button onClick={() => setForm({ show: true, agent: a })} style={{ ...styles.iconBtn, color: colors.primary }}><Edit3 size={18} /></button><button onClick={() => confirmAction("Delete?", `Remove ${a.full_name}?`, async () => { await supabase.from('employees').delete().eq('id', a.id); onRefresh(); })} style={{ ...styles.iconBtn, color: '#ef4444' }}><Trash2 size={18} /></button></div></div>))}</div></div>);
};

const AgentForm = ({ agent, onClose, onSuccess, showToast, colors }) => {
  const isEdit = !!agent;
  const handleSubmit = async (e) => { e.preventDefault(); const fd = new FormData(e.target); const payload = { full_name: fd.get('n'), employee_id_number: fd.get('id').toLowerCase(), password: fd.get('p') }; const { error } = isEdit ? await supabase.from('employees').update(payload).eq('id', agent.id) : await supabase.from('employees').insert([payload]); if (error) showToast("Error saving", "error"); else { showToast("Saved", "success"); onSuccess(); } };
  return (<div style={styles.overlay}><div style={{ ...styles.modalBox, background: colors.card, maxWidth: 350 }}><h3>{isEdit ? 'Edit' : 'New'} Agent</h3><form onSubmit={handleSubmit} style={{ textAlign: 'left', display: 'grid', gap: 10 }}><input name="n" defaultValue={agent?.full_name} placeholder="Name" style={styles.input} required /><input name="id" defaultValue={agent?.employee_id_number} placeholder="Login ID" style={styles.input} required /><input name="p" defaultValue={agent?.password} placeholder="Password" style={styles.input} required /><div style={{ display: 'flex', gap: 10 }}><button type="submit" style={{ ...styles.btnPrimary, background: colors.primary, flex: 1 }}>Save</button><button type="button" onClick={onClose} style={{...styles.btnSecondary, flex: 1}}>Cancel</button></div></form></div></div>);
};

const LoginScreen = ({ onLogin, loading, colors }) => {
  const [type, setType] = useState('admin');
  return (<div style={{ ...styles.loginPage, background: colors.bg }}><div style={{ ...styles.loginCard, background: colors.card, borderColor: colors.border }}><Landmark size={48} color="#3b82f6" style={{ marginBottom: 15 }} /><h2>{CONFIG.business.name}</h2><div style={{ display: 'flex', gap: 5, background: '#020617', padding: 4, borderRadius: 10, margin: '20px 0' }}><button type="button" onClick={() => setType('admin')} style={{ ...styles.tab, background: type === 'admin' ? '#3b82f6' : 'none', color: '#fff' }}>Admin</button><button type="button" onClick={() => setType('agent')} style={{ ...styles.tab, background: type === 'agent' ? '#3b82f6' : 'none', color: '#fff' }}>Agent</button></div><form onSubmit={e => { e.preventDefault(); onLogin({ username: e.target.u.value, password: e.target.p.value }); }}><input name="u" placeholder="ID Number" style={styles.loginInput} required /><input name="p" type="password" placeholder="Password" style={styles.loginInput} required /><button type="submit" disabled={loading} style={{ ...styles.btnPrimary, background: '#3b82f6', width: '100%', marginTop: 10 }}>{loading ? '...' : 'Sign In'}</button></form></div></div>);
};

const ModeSelection = ({ setMode, colors, onLogout }) => (<div style={{ background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 20 }}><div style={{ textAlign: 'center', width: '100%', maxWidth: 380 }}><h2 style={{ color: colors.text, marginBottom: 30 }}>Select Portal</h2><div style={{ display: 'grid', gap: 15 }}><button onClick={() => setMode('ajo')} style={{ ...styles.btnPrimary, border: `2px solid ${CONFIG.modes.ajo.primary}`, color: CONFIG.modes.ajo.primary, background: 'none', height: 100, fontSize: 18 }}><Wallet size={28} /> AJO PORTAL</button><button onClick={() => setMode('loans')} style={{ ...styles.btnPrimary, border: `2px solid ${CONFIG.modes.loans.primary}`, color: CONFIG.modes.loans.primary, background: 'none', height: 100, fontSize: 18 }}><HandCoins size={28} /> LOAN PORTAL</button></div><button onClick={onLogout} style={{ marginTop: 30, color: colors.textSecondary, background: 'none', border: 'none', cursor:'pointer' }}>Logout</button></div></div>);
const Header = ({ business, isDark, onToggleTheme, onSwitchMode, colors }) => (<header style={{ ...styles.header, background: colors.card, borderBottom: `1px solid ${colors.border}` }}><div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><button onClick={onSwitchMode} style={{ background: 'none', border: 'none', color: colors.text, cursor:'pointer' }}><ArrowLeftRight size={20}/></button><h1 style={{fontSize: 15, fontWeight: '900'}}>{business}</h1></div><button onClick={onToggleTheme} style={{background: 'none', border: 'none', cursor:'pointer'}}>{isDark ? <Sun color="#fff"/> : <Moon color="#000"/>}</button></header>);
const Navigation = ({ view, role, onNavigate, onLogout, colors }) => (<nav style={{ ...styles.nav, background: colors.card, borderTop: `1px solid ${colors.border}` }}><NavBtn active={view === 'dashboard'} icon={<LayoutDashboard/>} label="Home" onClick={() => onNavigate('dashboard')} colors={colors} /><NavBtn active={view === 'members'} icon={<Users/>} label="Members" onClick={() => onNavigate('members')} colors={colors} />{role === 'admin' ? <NavBtn active={view === 'agents'} icon={<UserCheck/>} label="Agents" onClick={() => onNavigate('agents')} colors={colors} /> : <NavBtn active={view === 'scan'} icon={<Camera/>} label="Scan" onClick={() => onNavigate('scan')} colors={colors} />}<NavBtn icon={<LogOut/>} label="Exit" onClick={onLogout} colors={colors} /></nav>);
const NavBtn = ({ active, icon, label, onClick, colors }) => (<button onClick={onClick} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', color: active ? colors.primary : colors.textSecondary }}>{icon}<span style={{ fontSize: 10 }}>{label}</span></button>);
const TransactionList = ({ transactions, colors, showTime = false, showCollector = true }) => (<div style={{display: 'flex', flexDirection: 'column', gap: 10}}>{transactions.map(t => (<div key={t.id} style={{ ...styles.listItem, background: colors.card, borderColor: colors.border }}><div style={{ flex: 1 }}><strong style={{fontSize: 14}}>{t.full_name}</strong><div style={{display: 'flex', gap: 10, marginTop: 4}}>{showCollector && <small style={styles.subtext}>{t.employee_name || 'Admin'}</small>}{showTime && (<small style={{...styles.subtext, display:'flex', alignItems:'center', gap:3}}><Clock size={10}/> {new Date(t.created_at).toLocaleTimeString('en-GB', {hour:'2-digit', minute:'2-digit'})}</small>)}</div></div><strong style={{ color: colors.primary }}>₦{(Number(t.amount) || 0).toLocaleString()}</strong></div>))}</div>);
const StatCard = ({ title, value, colors }) => (<div style={{ ...styles.statCard, background: colors.card, borderColor: colors.border }}><small style={{ opacity: 0.6, fontSize: 10 }}>{title}</small><div style={{ fontSize: 14, fontWeight: 'bold' }}>{value}</div></div>);
const SearchBar = ({ value, onChange, placeholder, colors }) => (<div style={{ ...styles.searchBar, background: colors.card, borderColor: colors.border }}><Search size={18} opacity={0.5} /><input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ background: 'none', border: 'none', color: colors.text, width: '100%', outline: 'none' }} /></div>);
const SectionHeader = ({ title, icon }) => (<div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '20px 0 10px' }}>{icon} <strong style={{fontSize: 15}}>{title}</strong></div>);
const ConfirmationModal = ({ modal, onClose, colors }) => (<div style={styles.overlay}><div style={{ ...styles.modalBox, background: colors.card, borderColor: colors.border, maxWidth: 350 }}><h3>{modal.title}</h3><p style={{fontSize: 14, margin: '15px 0'}}>{modal.msg}</p><div style={{ display: 'flex', gap: 10 }}><button style={{ ...styles.btnPrimary, background: colors.primary, flex: 1 }} onClick={() => { modal.onConfirm(); onClose(); }}>Yes</button><button style={{...styles.btnSecondary, flex: 1}} onClick={onClose}>No</button></div></div></div>);
const ToastContainer = ({ toasts }) => (<div style={styles.toastContainer}>{toasts.map(t => (<div key={t.id} style={{ ...styles.toast, background: t.type === 'error' ? '#ef4444' : '#10b981' }}>{t.message}</div>))}</div>);
const SkeletonLoader = () => (<div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}><div className="skeleton" style={{ height: 60, borderRadius: 12 }}></div><div className="skeleton" style={{ height: 60, borderRadius: 12 }}></div><div className="skeleton" style={{ height: 60, borderRadius: 12 }}></div></div><div className="skeleton" style={{ height: 150, borderRadius: 12 }}></div></div>);
const PrintEngine = ({ members, perPage }) => { if (members.length === 0) return null; const pages = []; for (let i = 0; i < members.length; i += perPage) { pages.push(members.slice(i, i + perPage)); } return (<div className="print-area">{pages.map((pMembers, pIdx) => (<div key={pIdx} className={`print-grid grid-${perPage}`}>{pMembers.map(m => (<div key={m.id} className="print-card"><h4 style={{ margin: 0, fontSize: '12pt' }}>{CONFIG.business.name}</h4><img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${m.registration_no}`} style={{ width: '120px', height: '120px', margin: '3mm 0' }} crossOrigin="anonymous" alt="qr" /><div style={{ textAlign: 'left', width: '100%', fontSize: '10pt' }}><strong>ID:</strong> {m.registration_no}<br/><strong>NAME:</strong> {m.full_name}</div></div>))}</div>))}</div>); };
const BulkPrintConfig = ({ members, perPage, setPerPage, onClose, colors }) => { const [isPreparing, setIsPreparing] = useState(false); const handlePrint = () => { setIsPreparing(true); const images = document.querySelectorAll('.print-area img'); const promises = Array.from(images).map(img => { if (img.complete) return Promise.resolve(); return new Promise((resolve) => { img.onload = resolve; img.onerror = resolve; }); }); Promise.all(promises).then(() => { setTimeout(() => { setIsPreparing(false); window.print(); }, 500); }); }; return (<div style={styles.overlay} className="no-print"><div style={{ ...styles.modalBox, background: colors.card, maxWidth: 400 }}><h3>Print {members.length} Cards</h3><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>{[1, 4, 8, 12].map(n => (<button key={n} onClick={() => setPerPage(n)} style={{ padding: 12, borderRadius: 10, border: '1px solid', background: perPage === n ? colors.primary : 'none', color: perPage === n ? '#fff' : colors.text, borderColor: colors.primary }}>{n} Per A4</button>))}</div><div style={{ display: 'flex', gap: 10 }}><button disabled={isPreparing} onClick={handlePrint} style={{ ...styles.btnPrimary, background: colors.primary, flex: 1 }}>{isPreparing ? 'Loading...' : 'Open Print Dialog'}</button><button onClick={onClose} style={{...styles.btnSecondary, flex: 1}}>Cancel</button></div></div></div>); };

const styles = {
  app: { minHeight: '100vh' },
  header: { padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50 },
  main: { padding: 20, paddingBottom: 100, maxWidth: 600, margin: '0 auto' },
  nav: { display: 'flex', justifyContent: 'space-around', padding: '12px 0', position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100 },
  listItem: { display: 'flex', alignItems: 'center', padding: '10px 15px', borderRadius: 16, border: '1px solid', marginBottom: 10, cursor: 'pointer' },
  loginInput: { width: '100%', padding: 14, borderRadius: 12, border: '1px solid #334155', background: '#1e293b', color: '#ffffff', marginBottom: 12, boxSizing: 'border-box', outline: 'none' },
  btnPrimary: { color: '#fff', border: 'none', borderRadius: 12, padding: 14, fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 },
  btnSecondary: { background: '#64748b', color: '#fff', border: 'none', borderRadius: 12, padding: 14, cursor: 'pointer' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 },
  modalBox: { padding: 30, borderRadius: 24, textAlign: 'center', width: '100%' },
  floatingBar: { position: 'fixed', bottom: 85, left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: 450, padding: '10px 20px', borderRadius: 15, border: '1px solid', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1000, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' },
  subtext: { fontSize: 12, opacity: 0.6 },
  iconBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: 4 },
  searchBar: { display: 'flex', alignItems: 'center', padding: '12px 18px', borderRadius: 15, border: '1px solid', marginBottom: 15, gap: 10 },
  input: { width: '100%', padding: 12, borderRadius: 10, border: '1px solid #ddd', background: 'none', color: 'inherit', marginBottom: 10, boxSizing: 'border-box' },
  loginPage: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 20 },
  loginCard: { padding: 35, borderRadius: 28, width: 340, textAlign: 'center', border: '1px solid' },
  tab: { flex: 1, padding: 10, border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' },
  smallGhostBtn: { background: 'none', border: '1px solid #334155', color: 'inherit', borderRadius: 8, padding: '5px 10px', fontSize: 10, cursor: 'pointer' },
  statCard: { padding: 12, borderRadius: 12, border: '1px solid', textAlign: 'center' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 },
  fadeIn: { animation: 'fadeIn 0.4s ease' },
  toastContainer: { position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10 },
  toast: { padding: '12px 24px', borderRadius: 12, color: '#fff', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }
};

if (typeof document !== 'undefined') {
  const s = document.createElement('style');
  s.textContent = `
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .print-area { display: none; }
    .skeleton { background: #1e293b; animation: pulse 1.5s infinite ease-in-out; }
    @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 0.8; } 100% { opacity: 0.5; } }
    .spin { animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @media print {
      @page { size: A4; margin: 0; }
      .no-print { display: none !important; }
      .print-area { display: block !important; width: 210mm; background: #fff; }
      .print-grid { display: grid !important; gap: 5mm; padding: 10mm; grid-template-columns: repeat(2, 1fr); page-break-after: always; }
      .print-card { border: 1px solid #000 !important; border-radius: 3mm; padding: 5mm; text-align: center; background: #fff !important; color: #000 !important; page-break-inside: avoid; display: flex !important; flex-direction: column; align-items: center; }
    }
  `;
  document.head.appendChild(s);
}