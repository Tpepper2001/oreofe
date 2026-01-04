import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Scanner } from '@yudiel/react-qr-scanner';
import {
  Users, UserPlus, LayoutDashboard, LogOut, Landmark, X, Camera, 
  Printer, AlertCircle, Moon, Sun, UserCheck, Search,
  TrendingUp, Calendar, Trash2, Edit3, Download, ArrowLeftRight, 
  Wallet, HandCoins, CheckSquare, Square, Loader2
} from 'lucide-react';

/* ===================== 1. STATIC CONFIG ===================== */
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

const DARK_THEME = { bg: '#020617', card: '#0f172a', text: '#f8fafc', textSecondary: '#94a3b8', border: '#1e293b' };
const LIGHT_THEME = { bg: '#f1f5f9', card: '#ffffff', text: '#0f172a', textSecondary: '#64748b', border: '#e2e8f0' };

const supabase = createClient(CONFIG.supabase.url, CONFIG.supabase.key);

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
    } catch (err) { showToast("Sync failed", "error"); }
    finally { setLoading(false); }
  }, [auth, mode, showToast]);

  useEffect(() => { if (auth && mode) fetchData(); }, [auth, mode, fetchData]);

  const activePrimary = mode ? CONFIG.modes[mode].primary : '#3b82f6';
  const colors = theme === 'dark' ? { ...DARK_THEME, primary: activePrimary } : { ...LIGHT_THEME, primary: activePrimary };

  if (!auth) return <LoginScreen onLogin={async (c) => {
    setLoading(true);
    const u = c.username.trim().toLowerCase();
    if (u === CONFIG.admin.username && c.password === CONFIG.admin.password) setAuth({ role: 'admin' });
    else {
      const { data: ag } = await supabase.from('employees').select('*').eq('employee_id_number', u).eq('password', c.password).single();
      if (ag) setAuth({ id: ag.id, role: 'agent', name: ag.full_name, data: ag });
      else showToast("Invalid Details", "error");
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

      {/* PRINT ENGINE */}
      <PrintArea members={bulkPrintList} mode={mode} perPage={perPage} />

      <ToastContainer toasts={toasts} />
      {modal.show && <ConfirmationModal modal={modal} onClose={() => setModal(m => ({ ...m, show: false }))} colors={colors} />}
      {bulkPrintList.length > 0 && <BulkPrintModal members={bulkPrintList} perPage={perPage} setPerPage={setPerPage} onClose={() => setBulkPrintList([])} colors={colors} />}
    </div>
  );
}

/* ===================== SUB-COMPONENTS (OUTSIDE MAIN APP) ===================== */

const LoginScreen = ({ onLogin, loading, colors }) => (
  <div style={{ ...styles.loginPage, background: colors.bg }}>
    <div style={{ ...styles.loginCard, background: colors.card, borderColor: colors.border }}>
      <Landmark size={48} color="#3b82f6" style={{ marginBottom: 15 }} />
      <h2 style={{ color: colors.text }}>{CONFIG.business.name}</h2>
      <p style={{fontSize: 12, opacity: 0.6, marginBottom: 20}}>Administrative Access Only</p>
      <form onSubmit={e => { e.preventDefault(); onLogin({ username: e.target.u.value, password: e.target.p.value }); }}>
        <input name="u" placeholder="ID Number" style={styles.loginInput} required autoComplete="off" />
        <input name="p" type="password" placeholder="Password" style={styles.loginInput} required />
        <button type="submit" disabled={loading} style={{ ...styles.btnPrimary, background: '#3b82f6', width: '100%', marginTop: 10 }}>{loading ? 'Authenticating...' : 'Sign In'}</button>
      </form>
    </div>
  </div>
);

const ScannerView = ({ profile, onRefresh, showToast, colors, mode }) => {
  const [scanning, setScanning] = useState(false);
  const [member, setMember] = useState(null);
  const [amt, setAmt] = useState('');

  const handleScan = useCallback(async (res) => {
    if (!res || res.length === 0) return;
    const val = res[0].rawValue.trim();
    try {
      let lookup;
      try { lookup = JSON.parse(val).id; } catch (e) { lookup = val; }
      const { data: m } = await supabase.from(CONFIG.modes[mode].membersTable).select('*').or(`registration_no.eq.${lookup},id.eq.${lookup}`).maybeSingle();
      if (m) { setMember(m); setAmt(m.expected_amount || ''); setScanning(false); }
      else showToast("Member Not Found", "error");
    } catch (e) { showToast("Scan Error", "error"); }
  }, [mode, showToast]);

  if (member) return (
    <div style={{ ...styles.modalBox, background: colors.card, margin: '0 auto', maxWidth: 350 }}>
      <small style={{color: colors.primary, fontWeight:'bold'}}>{member.registration_no}</small>
      <h2 style={{margin: '10px 0'}}>{member.full_name}</h2>
      <input type="number" value={amt} onChange={e => setAmt(e.target.value)} style={{...styles.bigInput, color: colors.text, borderBottomColor: colors.primary}} autoFocus />
      <button onClick={async () => {
        const { error } = await supabase.from(CONFIG.modes[mode].transTable).insert([{ contributor_id: member.id, full_name: member.full_name, registration_no: member.registration_no, amount: Number(amt), employee_name: profile?.name || 'Agent', expected_amount: member.expected_amount }]);
        if (!error) { showToast("Saved!", "success"); setMember(null); onRefresh(); }
      }} style={{ ...styles.btnPrimary, background: colors.primary, width: '100%' }}>Confirm Payment</button>
      <button onClick={() => setMember(null)} style={{ ...styles.btnSecondary, width: '100%', marginTop: 10 }}>Cancel</button>
    </div>
  );

  return (
    <div style={{ textAlign: 'center', padding: 20 }}>
      {!scanning ? <button onClick={() => setScanning(true)} style={{...styles.scanBtn, borderColor: colors.primary, color: colors.primary}}><Camera size={48}/><br/>Start Scanning</button> :
      <div style={{ position: 'relative', height: '380px', borderRadius: 24, overflow: 'hidden', border: `3px solid ${colors.primary}` }}><Scanner onScan={handleScan} /><button onClick={() => setScanning(false)} style={{ position:'absolute', top: 15, right: 15, background:'#ef4444', color:'#fff', borderRadius:'50%', padding:10, border:'none', zIndex:50 }}><X/></button></div>}
    </div>
  );
};

const MemberManagement = ({ members, transactions, onRefresh, showToast, colors, isAdmin, mode, setModal, setBulkPrintList }) => {
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [focusedIdx, setFocusedIdx] = useState(0);
  const [form, setForm] = useState({ show: false, member: null });
  const anchorIdx = useRef(null);

  const filtered = useMemo(() => members.filter(m => (m.full_name || '').toLowerCase().includes(search.toLowerCase()) || (m.registration_no || '').includes(search.toUpperCase())), [members, search]);

  const handleRowClick = (e, m, idx) => {
    if (!isAdmin) return;
    let newSel = [...selectedIds];
    if (e.shiftKey && anchorIdx.current !== null) {
      const start = Math.min(idx, anchorIdx.current);
      const end = Math.max(idx, anchorIdx.current);
      const range = filtered.slice(start, end + 1).map(x => x.id);
      newSel = Array.from(new Set([...newSel, ...range]));
    } else {
      if (newSel.includes(m.id)) newSel = newSel.filter(id => id !== m.id);
      else newSel.push(m.id);
      anchorIdx.current = idx;
    }
    setSelectedIds(newSel);
    setFocusedIdx(idx);
  };

  const getBalance = (m) => {
    const paid = transactions.filter(t => t.contributor_id === m.id).reduce((s, t) => s + (t.amount || 0), 0);
    return (m.total_to_repay || 0) - paid;
  };

  return (
    <div tabIndex={0} style={{outline:'none'}}>
      <SearchBar value={search} onChange={setSearch} placeholder="Search members..." colors={colors} />
      <div style={{ display: 'flex', gap: 10, marginBottom: 15 }}>
        {isAdmin && <button onClick={() => setForm({ show: true, member: null })} style={{ ...styles.btnPrimary, background: colors.primary, flex: 1 }}>+ New Member</button>}
        {isAdmin && <button onClick={() => setSelectedIds([])} style={styles.smallGhostBtn}>Clear ({selectedIds.length})</button>}
      </div>

      {selectedIds.length > 0 && (
        <div style={{...styles.floatingBar, background: colors.card, borderColor: colors.primary}}>
          <span style={{fontWeight:'bold'}}>{selectedIds.length} Selected</span>
          <div style={{display:'flex', gap: 8}}>
            <button onClick={() => setBulkPrintList(members.filter(m => selectedIds.includes(m.id)))} style={{...styles.btnPrimary, padding: '8px 16px', fontSize: 12, background: '#10b981'}}><Printer size={14}/> Print</button>
            <button onClick={() => setSelectedIds([])} style={{...styles.btnSecondary, padding: '8px 16px', fontSize: 12}}>Cancel</button>
          </div>
        </div>
      )}

      {form.show && <MemberForm member={form.member} mode={mode} onClose={() => setForm({ show: false, member: null })} onSuccess={() => { setForm({ show: false, member: null }); onRefresh(); }} showToast={showToast} colors={colors} />}

      <div style={styles.list}>
        {filtered.map((m, idx) => {
          const isSelected = selectedIds.includes(m.id);
          const isFocused = focusedIdx === idx;
          const balance = mode === 'loans' ? getBalance(m) : null;
          return (
            <div key={m.id} onClick={(e) => handleRowClick(e, m, idx)} style={{ ...styles.listItem, background: isFocused ? `${colors.primary}11` : colors.card, borderColor: isSelected ? colors.primary : isFocused ? colors.primary : colors.border, cursor: 'pointer' }}>
              {isAdmin && <div style={{marginRight: 12}}>{isSelected ? <CheckSquare size={20} color={colors.primary}/> : <Square size={20} opacity={0.2}/>}</div>}
              <div style={{ flex: 1 }}>
                <strong>{m.full_name}</strong>
                <div style={styles.subtext}>{m.registration_no}</div>
                {mode === 'loans' && <div style={{ fontSize: 10, fontWeight:'bold', color: balance > 0 ? '#ef4444' : '#10b981' }}>Bal: ₦{balance.toLocaleString()}</div>}
              </div>
              {isAdmin && <button onClick={(e) => { e.stopPropagation(); setForm({ show: true, member: m }); }} style={{ ...styles.iconBtn, color: colors.primary }}><Edit3 size={18} /></button>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ===================== BULK PRINT MODAL ===================== */

const BulkPrintModal = ({ members, perPage, setPerPage, onClose, colors }) => {
  const [preloading, setPreloading] = useState(true);
  
  useEffect(() => {
    // Simple preloader for QR code images
    let loadedCount = 0;
    members.forEach(m => {
      const img = new Image();
      img.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${m.registration_no}`;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === members.length) setPreloading(false);
      };
    });
  }, [members]);

  return (
    <div style={styles.overlay} className="no-print">
      <div style={{ ...styles.modalBox, background: colors.card, maxWidth: 400 }}>
        <h3>Print Config</h3>
        <p style={{fontSize: 12, opacity: 0.7, marginBottom: 20}}>Wait for images to load before printing</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          {[1, 4, 8, 12].map(n => (
            <button key={n} onClick={() => setPerPage(n)} style={{ padding: 12, borderRadius: 10, border: '1px solid', background: perPage === n ? colors.primary : 'none', color: perPage === n ? '#fff' : colors.text, borderColor: colors.primary }}>{n} Per A4</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => window.print()} disabled={preloading} style={{ ...styles.btnPrimary, background: colors.primary, flex: 1 }}>{preloading ? <Loader2 className="animate-spin"/> : 'Print Now'}</button>
          <button onClick={onClose} style={{...styles.btnSecondary, flex: 1}}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

const PrintArea = ({ members, mode, perPage }) => {
  if (!members || members.length === 0) return null;
  const pages = [];
  for (let i = 0; i < members.length; i += perPage) { pages.push(members.slice(i, i + perPage)); }

  return (
    <div className="print-area">
      {pages.map((pMembers, pIdx) => (
        <div key={pIdx} className={`print-grid grid-${perPage}`}>
          {pMembers.map(m => (
            <div key={m.id} className="print-card">
              <h4 style={{ margin: 0 }}>{CONFIG.business.name}</h4>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${m.registration_no}`} style={{ width: '100px', height: '100px' }} />
              <div style={{ textAlign: 'left', width: '100%', fontSize: '9pt' }}>
                <strong>ID:</strong> {m.registration_no}<br/>
                <strong>NAME:</strong> {m.full_name}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

/* ===================== STYLES ===================== */

const styles = {
  app: { minHeight: '100vh' },
  header: { padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50 },
  main: { padding: 20, paddingBottom: 100, maxWidth: 600, margin: '0 auto' },
  nav: { display: 'flex', justifyContent: 'space-around', padding: '12px 0', position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100 },
  listItem: { display: 'flex', alignItems: 'center', padding: 15, borderRadius: 16, border: '1px solid', marginBottom: 10, transition: '0.1s' },
  loginInput: { width: '100%', padding: 14, borderRadius: 12, border: '1px solid #334155', background: '#1e293b', color: '#ffffff', marginBottom: 12, boxSizing: 'border-box', outline: 'none' },
  btnPrimary: { color: '#fff', border: 'none', borderRadius: 12, padding: 14, fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 },
  btnSecondary: { background: '#64748b', color: '#fff', border: 'none', borderRadius: 12, padding: 14, cursor: 'pointer' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 },
  modalBox: { padding: 30, borderRadius: 24, textAlign: 'center', width: '100%' },
  floatingBar: { position: 'fixed', bottom: 85, left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: 450, padding: '10px 20px', borderRadius: 15, border: '1px solid', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1000, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' },
  loginPage: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 20 },
  loginCard: { padding: 35, borderRadius: 28, width: 340, textAlign: 'center', border: '1px solid' },
  tab: { flex: 1, padding: 10, border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' },
  smallGhostBtn: { background: 'none', border: '1px solid #334155', color: 'inherit', borderRadius: 8, padding: '5px 10px', fontSize: 10, cursor: 'pointer' },
  scanBtn: { padding: '45px 20px', borderRadius: 24, width: '100%', border: '2px dashed', background: 'none', fontWeight: 'bold', fontSize: 18, cursor: 'pointer' },
  bigInput: { fontSize: 40, width: '100%', textAlign: 'center', background: 'none', border: 'none', borderBottom: '3px solid', outline: 'none' },
  subtext: { fontSize: 12, opacity: 0.6 },
  iconBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: 4 }
};

if (typeof document !== 'undefined') {
  const s = document.createElement('style');
  s.textContent = `
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .print-area { display: none; }
    @media print {
      @page { size: A4; margin: 10mm; }
      body > *:not(.print-area) { display: none !important; }
      .print-area { display: block !important; width: 100%; background: #fff !important; }
      .print-grid { display: grid !important; gap: 5mm; width: 100%; page-break-after: always; grid-template-columns: repeat(2, 1fr); }
      .print-card { border: 1px solid #000 !important; border-radius: 3mm; padding: 5mm; text-align: center; display: flex !important; flex-direction: column; align-items: center; justify-content: center; background: #fff !important; color: #000 !important; page-break-inside: avoid; break-inside: avoid; }
      .grid-1 { grid-template-columns: 1fr !important; }
      .grid-12 { grid-template-columns: repeat(3, 1fr) !important; }
    }
  `;
  document.head.appendChild(s);
}

// REST OF HELPER COMPONENTS (ADMIN, AGENT PORTAL, FORM, ETC)
const AdminPortal = ({ view, data, onRefresh, showToast, colors, mode, setBulkPrintList, setModal }) => {
  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return { todayRev: data.transactions.filter(t => t.created_at.startsWith(today)).reduce((s, t) => s + (t.amount || 0), 0), totalRev: data.transactions.reduce((s, t) => s + (t.amount || 0), 0) };
  }, [data.transactions]);
  if (view === 'dashboard') return (
    <div style={{animation: 'fadeIn 0.4s ease'}}>
      <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 10, marginBottom: 20}}>
        <div style={{...styles.listItem, padding: 10, flexDirection:'column'}}><small style={{opacity:0.6, fontSize:10}}>Today</small><strong>₦{stats.todayRev.toLocaleString()}</strong></div>
        <div style={{...styles.listItem, padding: 10, flexDirection:'column'}}><small style={{opacity:0.6, fontSize:10}}>People</small><strong>{data.members.length}</strong></div>
        <div style={{...styles.listItem, padding: 10, flexDirection:'column'}}><small style={{opacity:0.6, fontSize:10}}>Gross</small><strong>₦{stats.totalRev.toLocaleString()}</strong></div>
      </div>
      <SectionHeader title="Recent Activity" icon={<TrendingUp size={20} />} />
      <TransactionList transactions={data.transactions.slice(0, 10)} colors={colors} />
    </div>
  );
  if (view === 'members') return <MemberManagement members={data.members} transactions={data.transactions} onRefresh={onRefresh} showToast={showToast} colors={colors} isAdmin={true} setModal={setModal} mode={mode} setBulkPrintList={setBulkPrintList} />;
  if (view === 'agents') return <AgentManagement agents={data.agents} onRefresh={onRefresh} showToast={showToast} colors={colors} confirmAction={(t,m,c)=>setModal({show:true,title:t,msg:m,onConfirm:c})} />;
  return null;
};

const AgentPortal = ({ view, profile, data, onRefresh, showToast, colors, mode }) => {
  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const myTs = data.transactions.filter(t => t.employee_id === profile?.id);
    return { todayTotal: myTs.filter(t => t.created_at.startsWith(today)).reduce((s, t) => s + (t.amount || 0), 0), count: myTs.filter(t => t.created_at.startsWith(today)).length };
  }, [data.transactions, profile?.id]);
  if (view === 'dashboard') return (
    <div style={{animation: 'fadeIn 0.4s ease'}}>
      <div style={{padding: 30, borderRadius: 24, background: colors.primary, color: '#fff', marginBottom: 20}}>
        <small>COLLECTED TODAY</small>
        <h1 style={{fontSize: 32}}>₦{stats.todayTotal.toLocaleString()}</h1>
        <span>{stats.count} Operations</span>
      </div>
      <SectionHeader title="Recent Collections" icon={<Calendar size={20} />} />
      <TransactionList transactions={data.transactions.filter(t => t.employee_id === profile?.id).slice(0, 10)} colors={colors} />
    </div>
  );
  if (view === 'members') return <MemberManagement members={data.members} transactions={data.transactions} onRefresh={onRefresh} showToast={showToast} colors={colors} isAdmin={false} mode={mode} setBulkPrintList={()=>{}} />;
  if (view === 'scan') return <ScannerView profile={profile} onRefresh={onRefresh} showToast={showToast} colors={colors} mode={mode} />;
  return null;
};

const MemberForm = ({ member, mode, onClose, onSuccess, showToast, colors }) => {
  const isEdit = !!member;
  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const payload = { full_name: fd.get('n'), registration_no: fd.get('r'), expected_amount: Number(fd.get('am')), ajo_owner_id: 'admin' };
    if (mode === 'loans') { payload.total_loan_amount = Number(fd.get('tla') || 0); payload.total_to_repay = Number(fd.get('ttr') || 0); }
    const { error } = isEdit ? await supabase.from(CONFIG.modes[mode].membersTable).update(payload).eq('id', member.id) : await supabase.from(CONFIG.modes[mode].membersTable).insert([payload]);
    if (error) showToast("Error saving", "error");
    else { showToast("Saved", "success"); onSuccess(); }
  };
  return (
    <div style={styles.overlay}>
      <div style={{ ...styles.modalBox, background: colors.card, maxWidth: 400 }}>
        <h3>{isEdit ? 'Update' : 'New'} Member</h3>
        <form onSubmit={handleSubmit} style={{ textAlign: 'left', display: 'grid', gap: 10 }}>
          <input name="n" defaultValue={member?.full_name} placeholder="Full Name" style={styles.input} required />
          <input name="r" defaultValue={member?.registration_no} placeholder="Reg Number" style={styles.input} required />
          <input name="am" type="number" defaultValue={member?.expected_amount} placeholder="Amount" style={styles.input} required />
          {mode === 'loans' && (
            <><input name="tla" type="number" defaultValue={member?.total_loan_amount} placeholder="Loan Taken" style={styles.input} required /><input name="ttr" type="number" defaultValue={member?.total_to_repay} placeholder="Total to Pay" style={styles.input} required /></>
          )}
          <div style={{ display: 'flex', gap: 10 }}><button type="submit" style={{ ...styles.btnPrimary, background: colors.primary, flex: 1 }}>Save</button><button type="button" onClick={onClose} style={{...styles.btnSecondary, flex: 1}}>Cancel</button></div>
        </form>
      </div>
    </div>
  );
};

const AgentManagement = ({ agents, onRefresh, showToast, colors, confirmAction }) => {
  const [form, setForm] = useState({ show: false, agent: null });
  return (
    <div>
      <button onClick={() => setForm({ show: true, agent: null })} style={{ ...styles.btnPrimary, background: colors.primary, marginBottom: 15, width: '100%' }}><UserPlus size={16} /> New Agent</button>
      {form.show && <AgentForm agent={form.agent} onClose={() => setForm({ show: false, agent: null })} onSuccess={() => { setForm({ show: false, agent: null }); onRefresh(); }} showToast={showToast} colors={colors} />}
      <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
        {agents.map(a => (
          <div key={a.id} style={{ ...styles.listItem, background: colors.card, borderColor: colors.border }}>
            <div style={{ flex: 1 }}><strong>{a.full_name}</strong><br/><small style={styles.subtext}>ID: {a.employee_id_number}</small></div>
            <div style={{display:'flex', gap:5}}>
              <button onClick={() => setForm({ show: true, agent: a })} style={{ ...styles.iconBtn, color: colors.primary }}><Edit3 size={18} /></button>
              <button onClick={() => confirmAction("Delete?", `Remove ${a.full_name}?`, async () => { await supabase.from('employees').delete().eq('id', a.id); onRefresh(); })} style={{ ...styles.iconBtn, color: '#ef4444' }}><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AgentForm = ({ agent, onClose, onSuccess, showToast, colors }) => {
  const isEdit = !!agent;
  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const payload = { full_name: fd.get('n'), employee_id_number: fd.get('id').toLowerCase(), password: fd.get('p') };
    const { error } = isEdit ? await supabase.from('employees').update(payload).eq('id', agent.id) : await supabase.from('employees').insert([payload]);
    if (error) showToast("Error saving", "error");
    else { showToast("Saved", "success"); onSuccess(); }
  };
  return (
    <div style={styles.overlay}>
      <div style={{ ...styles.modalBox, background: colors.card, maxWidth: 350 }}>
        <h3>{isEdit ? 'Edit' : 'New'} Agent</h3>
        <form onSubmit={handleSubmit} style={{ textAlign: 'left', display: 'grid', gap: 10 }}>
          <input name="n" defaultValue={agent?.full_name} placeholder="Name" style={styles.input} required />
          <input name="id" defaultValue={agent?.employee_id_number} placeholder="Login ID" style={styles.input} required />
          <input name="p" defaultValue={agent?.password} placeholder="Password" style={styles.input} required />
          <div style={{ display: 'flex', gap: 10 }}><button type="submit" style={{ ...styles.btnPrimary, background: colors.primary, flex: 1 }}>Save</button><button type="button" onClick={onClose} style={{...styles.btnSecondary, flex: 1}}>Cancel</button></div>
        </form>
      </div>
    </div>
  );
};

const Header = ({ business, role, isDark, onToggleTheme, onSwitchMode, colors }) => (
  <header style={{ ...styles.header, background: colors.card, borderBottom: `1px solid ${colors.border}` }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <button onClick={onSwitchMode} style={{ background: 'none', border: 'none', color: colors.text, cursor:'pointer' }}><ArrowLeftRight size={20}/></button>
      <h1 style={{fontSize: 15, fontWeight: '900'}}>{business}</h1>
    </div>
    <button onClick={onToggleTheme} style={{background: 'none', border: 'none', cursor:'pointer'}}>{isDark ? <Sun color="#fff"/> : <Moon color="#000"/>}</button>
  </header>
);

const Navigation = ({ view, role, onNavigate, onLogout, colors }) => (
  <nav style={{ ...styles.nav, background: colors.card, borderTop: `1px solid ${colors.border}` }}>
    <NavBtn active={view === 'dashboard'} icon={<LayoutDashboard/>} label="Home" onClick={() => onNavigate('dashboard')} colors={colors} />
    <NavBtn active={view === 'members'} icon={<Users/>} label="Members" onClick={() => onNavigate('members')} colors={colors} />
    {role === 'admin' ? <NavBtn active={view === 'agents'} icon={<UserCheck/>} label="Agents" onClick={() => onNavigate('agents')} colors={colors} /> :
    <NavBtn active={view === 'scan'} icon={<Camera/>} label="Scan" onClick={() => onNavigate('scan')} colors={colors} />}
    <NavBtn icon={<LogOut/>} label="Exit" onClick={onLogout} colors={colors} />
  </nav>
);

const NavBtn = ({ active, icon, label, onClick, colors }) => (
  <button onClick={onClick} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', color: active ? colors.primary : colors.textSecondary }}>{icon}<span style={{ fontSize: 10 }}>{label}</span></button>
);

const TransactionList = ({ transactions, colors }) => (
  <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
    {transactions.map(t => (
      <div key={t.id} style={{ ...styles.listItem, background: colors.card, borderColor: colors.border }}>
        <div style={{ flex: 1 }}><strong>{t.full_name}</strong><br/><small style={styles.subtext}>{t.employee_name || 'Admin'}</small></div>
        <strong style={{ color: colors.primary }}>₦{t.amount?.toLocaleString()}</strong>
      </div>
    ))}
  </div>
);

const SearchBar = ({ value, onChange, placeholder, colors }) => (
  <div style={{ ...styles.searchBar, background: colors.card, borderColor: colors.border }}>
    <Search size={18} opacity={0.5} />
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ background: 'none', border: 'none', color: colors.text, width: '100%', outline: 'none' }} />
  </div>
);

const SectionHeader = ({ title, icon }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '20px 0 10px' }}>{icon} <strong style={{fontSize: 15}}>{title}</strong></div>
);

const ConfirmationModal = ({ modal, onClose, colors }) => (
  <div style={styles.overlay}>
    <div style={{ ...styles.modalBox, background: colors.card, borderColor: colors.border, maxWidth: 350 }}>
      <h3>{modal.title}</h3><p style={{fontSize: 14, margin: '15px 0'}}>{modal.msg}</p>
      <div style={{ display: 'flex', gap: 10 }}><button style={{ ...styles.btnPrimary, background: colors.primary, flex: 1 }} onClick={() => { modal.onConfirm(); onClose(); }}>Yes</button><button style={{...styles.btnSecondary, flex: 1}} onClick={onClose}>No</button></div>
    </div>
  </div>
);

const ToastContainer = ({ toasts }) => (
  <div style={styles.toastContainer}>{toasts.map(t => (<div key={t.id} style={{ ...styles.toast, background: t.type === 'error' ? '#ef4444' : '#10b981' }}>{t.message}</div>))}</div>
);

const SkeletonLoader = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}><div className="skeleton" style={{ height: 60, borderRadius: 12 }}></div><div className="skeleton" style={{ height: 60, borderRadius: 12 }}></div><div className="skeleton" style={{ height: 60, borderRadius: 12 }}></div></div>
    <div className="skeleton" style={{ height: 150, borderRadius: 12 }}></div>
  </div>
);