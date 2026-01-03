import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Scanner } from '@yudiel/react-qr-scanner';
import {
  Users, UserPlus, LayoutDashboard, LogOut, Landmark, X, Camera, 
  Printer, AlertCircle, Moon, Sun, UserCheck, Search,
  TrendingUp, Calendar, Trash2, Edit3, Download, ArrowLeftRight, 
  Wallet, HandCoins, CheckSquare, Square
} from 'lucide-react';

/* ===================== CONFIGURATION ===================== */
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

/* ===================== UTILS ===================== */
const useCountUp = (end, duration = 1000) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = (end || 0) / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { setCount(end); clearInterval(timer); } 
      else { setCount(Math.floor(start)); }
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);
  return count;
};

/* ===================== MAIN APP ===================== */
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
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const confirmAction = (title, msg, onConfirm) => {
    setModal({ show: true, title, msg, onConfirm });
  };

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

  const handleLogin = async (creds) => {
    setLoading(true);
    const u = creds.username.trim().toLowerCase();
    const p = creds.password;

    if (u === CONFIG.admin.username && p === CONFIG.admin.password) {
      setAuth({ id: 'admin', role: 'admin', name: 'Admin' });
    } else {
      const { data: agent } = await supabase.from('employees').select('*').eq('employee_id_number', u).eq('password', p).single();
      if (agent) setAuth({ id: agent.id, role: 'agent', name: agent.full_name, data: agent });
      else showToast("Invalid Credentials", "error");
    }
    setLoading(false);
  };

  const activePrimary = mode ? CONFIG.modes[mode].primary : '#3b82f6';
  const colors = theme === 'dark' ? { ...DARK_THEME, primary: activePrimary } : { ...LIGHT_THEME, primary: activePrimary };

  if (!auth) return <LoginScreen onLogin={handleLogin} loading={loading} theme={theme} />;
  if (!mode) return <ModeSelection setMode={setMode} colors={colors} setAuth={setAuth} />;

  return (
    <div style={{ ...styles.app, background: colors.bg, color: colors.text }}>
      <div className="no-print">
        <Header business={CONFIG.modes[mode].name} role={auth.role} isDark={theme === 'dark'} onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')} onSwitchMode={() => setMode(null)} colors={colors} />
        <main style={styles.main}>
          {loading ? <SkeletonLoader /> : (
            <>
              {auth.role === 'admin' ? 
                <AdminPortal view={view} data={data} onRefresh={fetchData} showToast={showToast} colors={colors} mode={mode} setBulkPrintList={setBulkPrintList} confirmAction={confirmAction} /> :
                <AgentPortal view={view} profile={auth.data} data={data} onRefresh={fetchData} showToast={showToast} colors={colors} mode={mode} />
              }
            </>
          )}
        </main>
        <Navigation view={view} role={auth.role} onNavigate={setView} onLogout={() => confirmAction("Logout", "Exit system?", () => setAuth(null))} colors={colors} />
      </div>

      {bulkPrintList.length > 0 && (
        <div className="print-area">
          {Array.from({ length: Math.ceil(bulkPrintList.length / perPage) }).map((_, pageIdx) => (
            <div key={pageIdx} className={`print-grid grid-${perPage}`}>
              {bulkPrintList.slice(pageIdx * perPage, (pageIdx + 1) * perPage).map(m => (
                <div key={m.id} className="print-card">
                  <h4 style={{ margin: 0 }}>{CONFIG.business.name}</h4>
                  <div style={{ fontSize: '8pt', fontWeight: 'bold' }}>{mode.toUpperCase()} ID CARD</div>
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${m.registration_no}`} style={{ width: '100px', height: '100px' }} alt="qr" />
                  <div style={{ textAlign: 'left', width: '100%', fontSize: '9pt' }}>
                    <strong>NAME:</strong> {m.full_name}<br/>
                    <strong>ID:</strong> {m.registration_no}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      <ToastContainer toasts={toasts} />
      {modal.show && <ConfirmationModal modal={modal} onClose={() => setModal({ ...modal, show: false })} colors={colors} />}
      {bulkPrintList.length > 0 && <BulkPrintConfig members={bulkPrintList} perPage={perPage} setPerPage={setPerPage} onClose={() => setBulkPrintList([])} colors={colors} />}
    </div>
  );
}

/* ===================== MEMBER MANAGEMENT ===================== */

const MemberManagement = ({ members, transactions, onRefresh, showToast, colors, isAdmin, mode, confirmAction, setBulkPrintList }) => {
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [focusedIdx, setFocusedIdx] = useState(0);
  const [form, setForm] = useState({ show: false, member: null });
  const anchorIdx = useRef(null);

  const filtered = useMemo(() => 
    members.filter(m => (m.full_name || '').toLowerCase().includes(search.toLowerCase()) || (m.registration_no || '').includes(search.toUpperCase()))
  , [members, search]);

  const handleKeyboard = (e) => {
    if (!isAdmin || filtered.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = Math.min(focusedIdx + 1, filtered.length - 1);
      if (e.shiftKey) {
        const start = Math.min(anchorIdx.current ?? focusedIdx, next);
        const end = Math.max(anchorIdx.current ?? focusedIdx, next);
        setSelectedIds(filtered.slice(start, end + 1).map(m => m.id));
      }
      setFocusedIdx(next);
    } 
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.max(focusedIdx - 1, 0);
      if (e.shiftKey) {
        const start = Math.min(anchorIdx.current ?? focusedIdx, next);
        const end = Math.max(anchorIdx.current ?? focusedIdx, next);
        setSelectedIds(filtered.slice(start, end + 1).map(m => m.id));
      }
      setFocusedIdx(next);
    } 
    else if (e.key === ' ') {
      e.preventDefault();
      const id = filtered[focusedIdx].id;
      setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
      anchorIdx.current = focusedIdx;
    }
  };

  const handleClick = (e, m, idx) => {
    if (!isAdmin) return;
    if (e.shiftKey && anchorIdx.current !== null) {
      const start = Math.min(idx, anchorIdx.current);
      const end = Math.max(idx, anchorIdx.current);
      setSelectedIds(filtered.slice(start, end + 1).map(item => item.id));
    } else {
      setSelectedIds(prev => prev.includes(m.id) ? prev.filter(i => i !== m.id) : [...prev, m.id]);
      anchorIdx.current = idx;
    }
    setFocusedIdx(idx);
  };

  const getBalance = (m) => {
    const paid = transactions.filter(t => t.contributor_id === m.id).reduce((s, t) => s + (t.amount || 0), 0);
    return (m.total_to_repay || 0) - paid;
  };

  return (
    <div style={styles.fadeIn} onKeyDown={handleKeyboard} tabIndex={0} style={{outline:'none'}}>
      <SearchBar value={search} onChange={(val) => { setSearch(val); setFocusedIdx(0); }} placeholder="Search members..." colors={colors} />
      
      <div style={{ display: 'flex', gap: 10, marginBottom: 15 }}>
        {isAdmin && <button onClick={() => setForm({ show: true, member: null })} style={{ ...styles.btnPrimary, background: colors.primary, flex: 1 }}><UserPlus size={18} /> New Member</button>}
        {isAdmin && (
          <div style={{display:'flex', gap:5}}>
            <button onClick={() => setSelectedIds(filtered.map(m => m.id))} style={styles.smallGhostBtn}>All</button>
            <button onClick={() => setSelectedIds([])} style={styles.smallGhostBtn}>Clear</button>
          </div>
        )}
      </div>

      {selectedIds.length > 0 && (
        <div style={{...styles.floatingBar, background: colors.card, borderColor: colors.primary}}>
          <span>{selectedIds.length} Items</span>
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
            <div key={m.id} onClick={(e) => handleClick(e, m, idx)} style={{ ...styles.listItem, background: isFocused ? `${colors.primary}15` : colors.card, borderColor: isSelected ? colors.primary : isFocused ? colors.primary : colors.border, cursor: 'pointer' }}>
              {isAdmin && <div style={{marginRight: 12}}>{isSelected ? <CheckSquare size={20} color={colors.primary}/> : <Square size={20} opacity={0.2}/>}</div>}
              <div style={{ flex: 1 }}>
                <strong>{m.full_name}</strong>
                <div style={styles.subtext}>{m.registration_no} • ₦{m.expected_amount?.toLocaleString()}</div>
                {mode === 'loans' && <div style={{ fontSize: 10, fontWeight:'bold', color: balance > 0 ? '#ef4444' : '#10b981' }}>Bal: ₦{balance.toLocaleString()}</div>}
              </div>
              {isAdmin && (
                <div style={{display:'flex', gap: 5}}>
                  <button onClick={(e) => { e.stopPropagation(); setForm({ show: true, member: m }); }} style={{ ...styles.iconBtn, color: colors.primary }}><Edit3 size={18} /></button>
                  <button onClick={(e) => { e.stopPropagation(); confirmAction("Delete Member", `Are you sure?`, async () => {
                    await supabase.from(CONFIG.modes[mode].membersTable).delete().eq('id', m.id);
                    onRefresh();
                  }); }} style={{ ...styles.iconBtn, color: '#ef4444' }}><Trash2 size={18} /></button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ===================== SEAMLESS AGENT SCANNER ===================== */

const ScannerView = ({ profile, onRefresh, showToast, colors, mode }) => {
  const [scanning, setScanning] = useState(false);
  const [member, setMember] = useState(null);
  const [amt, setAmt] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleScan = async (res) => {
    if (!res || submitting) return;
    try {
      let lookup;
      try { lookup = JSON.parse(res).id; } catch (e) { lookup = res; }
      
      const table = CONFIG.modes[mode].membersTable;
      const { data: m, error } = await supabase.from(table).select('*').or(`registration_no.eq.${lookup},id.eq.${lookup}`).maybeSingle();
      
      if (m) { 
        setMember(m); 
        setAmt(m.expected_amount || ''); 
        setScanning(false);
        // Play subtle beep if possible or haptic feedback
        if (window.navigator.vibrate) window.navigator.vibrate(50);
      } else {
        showToast("Member not found", "error");
      }
    } catch (e) { 
      showToast("Invalid QR Code", "error"); 
    }
  };

  const handleConfirm = async () => {
    if (!amt || Number(amt) <= 0 || submitting) return;
    setSubmitting(true);
    const { error } = await supabase.from(CONFIG.modes[mode].transTable).insert([{ 
      contributor_id: member.id, 
      full_name: member.full_name, 
      registration_no: member.registration_no,
      amount: Number(amt), 
      employee_id: profile?.id || null, 
      employee_name: profile?.full_name || 'Agent', 
      expected_amount: member.expected_amount
    }]);

    if (!error) { 
      showToast(`₦${amt} recorded for ${member.full_name}`, "success"); 
      setMember(null); 
      setAmt('');
      onRefresh(); 
    } else {
      showToast("Transaction failed", "error");
    }
    setSubmitting(false);
  };

  if (member) return (
    <div style={styles.fadeIn}>
      <div style={{ ...styles.modalBox, background: colors.card, margin: '0 auto', maxWidth: 400, boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
        <div style={{marginBottom: 20}}>
            <small style={{color: colors.primary, fontWeight: 'bold', letterSpacing: 1}}>{member.registration_no}</small>
            <h2 style={{margin: '5px 0 20px 0', fontSize: 24}}>{member.full_name}</h2>
            <div style={{opacity: 0.6, fontSize: 12, marginBottom: 5}}>ENTER COLLECTION AMOUNT</div>
            <input 
              type="number" 
              value={amt} 
              onChange={e => setAmt(e.target.value)} 
              style={{...styles.bigInput, color: colors.text, borderBottomColor: colors.primary}} 
              autoFocus 
              onFocus={(e) => e.target.select()}
            />
        </div>
        <button 
          disabled={submitting}
          onClick={handleConfirm} 
          style={{ ...styles.btnPrimary, background: colors.primary, width: '100%', height: 60, fontSize: 18 }}
        >
          {submitting ? "Processing..." : "Confirm Payment"}
        </button>
        <button 
          onClick={() => { setMember(null); setScanning(true); }} 
          style={{ ...styles.btnSecondary, width: '100%', marginTop: 15, background: 'none', color: colors.textSecondary }}
        >
          Cancel & Rescan
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ textAlign: 'center' }}>
      {!scanning ? (
        <div style={{padding: '40px 0'}}>
           <div style={{marginBottom: 30, opacity: 0.7}}>
              <Camera size={48} style={{margin: '0 auto 15px'}} />
              <p>Ready to collect daily contributions?</p>
           </div>
           <button onClick={() => setScanning(true)} style={{...styles.scanBtn, borderColor: colors.primary, color: colors.primary}}>
             Launch Scanner
           </button>
        </div>
      ) : (
        <div style={styles.scannerWrapper}>
          <div style={styles.scannerContainer}>
            <Scanner 
                onScan={(r) => r?.[0] && handleScan(r[0].rawValue)} 
                allowMultiple={false}
                scanDelay={2000}
                styles={{ container: { width: '100%', height: '100%' }}}
            />
          </div>
          <button onClick={() => setScanning(false)} style={styles.scannerClose}><X size={24}/></button>
          <p style={{marginTop: 15, fontWeight: '500'}}>Align Member QR Code in the box</p>
        </div>
      )}
    </div>
  );
};

/* ===================== LOGIN SCREEN ===================== */

const LoginScreen = ({ onLogin, loading, theme }) => {
  const [type, setType] = useState('admin');
  const colors = theme === 'dark' ? DARK_THEME : LIGHT_THEME;
  return (
    <div style={{ ...styles.loginPage, background: colors.bg }}>
      <div style={{ ...styles.loginCard, background: colors.card, borderColor: colors.border }}>
        <Landmark size={48} color="#3b82f6" style={{ marginBottom: 10 }} />
        <h2 style={{ color: colors.text, marginBottom: 20 }}>{CONFIG.business.name}</h2>
        <div style={{ display: 'flex', gap: 5, background: theme === 'dark' ? '#020617' : '#f1f5f9', padding: 4, borderRadius: 10, marginBottom: 20 }}>
          <button onClick={() => setType('admin')} style={{ ...styles.tab, background: type === 'admin' ? '#3b82f6' : 'none', color: type === 'admin' ? '#fff' : colors.textSecondary }}>Admin</button>
          <button onClick={() => setType('agent')} style={{ ...styles.tab, background: type === 'agent' ? '#3b82f6' : 'none', color: type === 'agent' ? '#fff' : colors.textSecondary }}>Agent</button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onLogin({ username: e.target.u.value, password: e.target.p.value }); }}>
          <input name="u" placeholder={type === 'admin' ? "Admin ID" : "Agent ID"} style={styles.loginInput} required />
          <input name="p" type="password" placeholder="Password" style={styles.loginInput} required />
          <button type="submit" disabled={loading} style={{ ...styles.btnPrimary, background: '#3b82f6', width: '100%', marginTop: 10 }}>Login</button>
        </form>
      </div>
    </div>
  );
};

/* ===================== ADMIN & AGENT PORTALS ===================== */

const AdminPortal = ({ view, data, onRefresh, showToast, colors, mode, setBulkPrintList, confirmAction }) => {
  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return { 
        todayRev: data.transactions.filter(t => t.created_at.startsWith(today)).reduce((s, t) => s + (t.amount || 0), 0), 
        totalRev: data.transactions.reduce((s, t) => s + (t.amount || 0), 0) 
    };
  }, [data.transactions]);

  if (view === 'dashboard') return (
    <div style={styles.fadeIn}>
      <DashboardStats stats={stats} memberCount={data.members.length} colors={colors} />
      <SectionHeader title="Recent Activity" icon={<TrendingUp size={20} />} />
      <TransactionList transactions={data.transactions.slice(0, 10)} colors={colors} />
    </div>
  );
  if (view === 'members') return <MemberManagement members={data.members} transactions={data.transactions} onRefresh={onRefresh} showToast={showToast} colors={colors} isAdmin={true} confirmAction={confirmAction} mode={mode} setBulkPrintList={setBulkPrintList} />;
  if (view === 'agents') return <AgentManagement agents={data.agents} onRefresh={onRefresh} showToast={showToast} colors={colors} confirmAction={confirmAction} />;
  
  return null; // Scanner removed from Admin
};

const AgentPortal = ({ view, profile, data, onRefresh, showToast, colors, mode }) => {
  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const myTs = data.transactions.filter(t => t.employee_id === profile?.id);
    return { 
        todayTotal: myTs.filter(t => t.created_at.startsWith(today)).reduce((s, t) => s + (t.amount || 0), 0), 
        count: myTs.filter(t => t.created_at.startsWith(today)).length 
    };
  }, [data.transactions, profile?.id]);

  if (view === 'dashboard') return (
    <div style={styles.fadeIn}>
      <div style={{...styles.heroCard, background: colors.primary, padding: 30, borderRadius: 24, color: '#fff', marginBottom: 20}}>
        <small>MY COLLECTIONS TODAY</small>
        <h1 style={{fontSize: 32, margin: '10px 0'}}>₦{useCountUp(stats.todayTotal).toLocaleString()}</h1>
        <div style={{opacity: 0.8, fontSize: 14}}>{stats.count} Members processed</div>
      </div>
      <SectionHeader title="Recent Transactions" icon={<Calendar size={20} />} />
      <TransactionList transactions={data.transactions.filter(t => t.employee_id === profile?.id).slice(0, 10)} colors={colors} />
    </div>
  );
  if (view === 'members') return <MemberManagement members={data.members} transactions={data.transactions} onRefresh={onRefresh} showToast={showToast} colors={colors} isAdmin={false} mode={mode} setBulkPrintList={()=>{}} />;
  if (view === 'scan') return <ScannerView profile={profile} onRefresh={onRefresh} showToast={showToast} colors={colors} mode={mode} />;
  return null;
};

/* ===================== OTHER COMPONENTS ===================== */

const AgentManagement = ({ agents, onRefresh, showToast, colors, confirmAction }) => {
  const [form, setForm] = useState({ show: false, agent: null });
  return (
    <div>
      <button onClick={() => setForm({ show: true, agent: null })} style={{ ...styles.btnPrimary, background: colors.primary, marginBottom: 15, width: '100%' }}><UserPlus size={16} /> New Agent</button>
      {form.show && <AgentForm agent={form.agent} onClose={() => setForm({ show: false, agent: null })} onSuccess={() => { setForm({ show: false, agent: null }); onRefresh(); }} showToast={showToast} colors={colors} />}
      <div style={styles.list}>
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

const MemberForm = ({ member, mode, onClose, onSuccess, showToast, colors }) => {
  const isEdit = !!member;
  const table = CONFIG.modes[mode].membersTable;
  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const payload = {
      full_name: fd.get('n'), registration_no: fd.get('r'),
      phone_number: fd.get('p') || '', address: fd.get('a') || '',
      expected_amount: Number(fd.get('am')), ajo_owner_id: 'admin'
    };
    if (mode === 'loans') {
      payload.total_loan_amount = Number(fd.get('tla') || 0);
      payload.total_to_repay = Number(fd.get('ttr') || 0);
    }
    const { error } = isEdit ? await supabase.from(table).update(payload).eq('id', member.id) : await supabase.from(table).insert([payload]);
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
          <input name="am" type="number" defaultValue={member?.expected_amount} placeholder="Daily Contribution" style={styles.input} required />
          {mode === 'loans' && (
            <>
              <input name="tla" type="number" defaultValue={member?.total_loan_amount} placeholder="Loan Taken" style={styles.input} required />
              <input name="ttr" type="number" defaultValue={member?.total_to_repay} placeholder="Total to Pay" style={styles.input} required />
            </>
          )}
          <input name="p" defaultValue={member?.phone_number} placeholder="Phone" style={styles.input} />
          <textarea name="a" defaultValue={member?.address} placeholder="Address" style={{...styles.input, height: 60}} />
          <div style={{ display: 'flex', gap: 10 }}><button type="submit" style={{ ...styles.btnPrimary, background: colors.primary, flex: 1 }}>Save</button><button type="button" onClick={onClose} style={{...styles.btnSecondary, flex: 1}}>Cancel</button></div>
        </form>
      </div>
    </div>
  );
};

const ModeSelection = ({ setMode, colors, setAuth }) => (
  <div style={{ background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 20 }}>
    <div style={{ textAlign: 'center', width: '100%', maxWidth: 380 }}>
      <h2 style={{ color: colors.text, marginBottom: 30 }}>Select Portal</h2>
      <div style={{ display: 'grid', gap: 15 }}>
        <button onClick={() => setMode('ajo')} style={{ ...styles.btnPrimary, border: `2px solid ${CONFIG.modes.ajo.primary}`, color: CONFIG.modes.ajo.primary, background: 'none', height: 100, fontSize: 18 }}><Wallet size={28} /> AJO PORTAL</button>
        <button onClick={() => setMode('loans')} style={{ ...styles.btnPrimary, border: `2px solid ${CONFIG.modes.loans.primary}`, color: CONFIG.modes.loans.primary, background: 'none', height: 100, fontSize: 18 }}><HandCoins size={28} /> LOAN PORTAL</button>
      </div>
      <button onClick={() => setAuth(null)} style={{ marginTop: 30, color: colors.textSecondary, background: 'none', border: 'none', cursor:'pointer' }}>Logout</button>
    </div>
  </div>
);

const Header = ({ business, role, isDark, onToggleTheme, onSwitchMode, colors }) => (
  <header style={{ ...styles.header, background: colors.card, borderBottom: `1px solid ${colors.border}` }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <button onClick={onSwitchMode} title="Switch Portal" style={{ background: 'none', border: 'none', color: colors.text, cursor:'pointer' }}><ArrowLeftRight size={20}/></button>
      <h1 style={{fontSize: 15, fontWeight: '900'}}>{business}</h1>
    </div>
    <button onClick={onToggleTheme} style={{background: 'none', border: 'none', cursor:'pointer'}}>{isDark ? <Sun color="#fff"/> : <Moon color="#000"/>}</button>
  </header>
);

const Navigation = ({ view, role, onNavigate, onLogout, colors }) => (
  <nav style={{ ...styles.nav, background: colors.card, borderTop: `1px solid ${colors.border}` }}>
    <NavBtn active={view === 'dashboard'} icon={<LayoutDashboard/>} label="Home" onClick={() => onNavigate('dashboard')} colors={colors} />
    <NavBtn active={view === 'members'} icon={<Users/>} label="Members" onClick={() => onNavigate('members')} colors={colors} />
    {role === 'admin' && (
      <NavBtn active={view === 'agents'} icon={<UserCheck/>} label="Agents" onClick={() => onNavigate('agents')} colors={colors} />
    )}
    {role === 'agent' && (
      <NavBtn active={view === 'scan'} icon={<Camera/>} label="Scan" onClick={() => onNavigate('scan')} colors={colors} />
    )}
    <NavBtn icon={<LogOut/>} label="Exit" onClick={onLogout} colors={colors} />
  </nav>
);

const NavBtn = ({ active, icon, label, onClick, colors }) => (
  <button onClick={onClick} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', color: active ? colors.primary : colors.textSecondary }}>{icon}<span style={{ fontSize: 10 }}>{label}</span></button>
);

const DashboardStats = ({ stats, memberCount, colors }) => (
  <div style={styles.statsGrid}>
    <StatCard title="Today" value={`₦${useCountUp(stats.todayRev).toLocaleString()}`} colors={colors} />
    <StatCard title="Members" value={memberCount} colors={colors} />
    <StatCard title="Total Rev." value={`₦${useCountUp(stats.totalRev).toLocaleString()}`} colors={colors} />
  </div>
);

const StatCard = ({ title, value, colors }) => (
  <div style={{ ...styles.statCard, background: colors.card, borderColor: colors.border, padding: '15px 10px', flex: 1, borderRadius: 16, border: '1px solid', textAlign: 'center' }}>
    <small style={{ opacity: 0.6, fontSize: 10, display: 'block', marginBottom: 5 }}>{title}</small>
    <div style={{ fontSize: 14, fontWeight: 'bold' }}>{value}</div>
  </div>
);

const TransactionList = ({ transactions, colors }) => (
  <div style={styles.list}>
    {transactions.length === 0 ? <p style={{textAlign: 'center', opacity: 0.5, marginTop: 20}}>No transactions yet.</p> : 
      transactions.map(t => (
      <div key={t.id} style={{ ...styles.listItem, background: colors.card, borderColor: colors.border }}>
        <div style={{ flex: 1 }}>
            <strong>{t.full_name}</strong><br/>
            <small style={styles.subtext}>{t.employee_name || 'Admin'} • {new Date(t.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small>
        </div>
        <strong style={{ color: colors.primary }}>₦{t.amount?.toLocaleString()}</strong>
      </div>
    ))}
  </div>
);

const BulkPrintConfig = ({ members, perPage, setPerPage, onClose, colors }) => (
  <div style={styles.overlay} className="no-print">
    <div style={{ ...styles.modalBox, background: colors.card, maxWidth: 400 }}>
      <h3>Bulk Print Identity Cards</h3>
      <p style={{fontSize: 12, opacity: 0.7, marginBottom: 20}}>Ready to print {members.length} items</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        {[1, 4, 8, 12].map(n => (
          <button key={n} onClick={() => setPerPage(n)} style={{ padding: 12, borderRadius: 10, border: '1px solid', background: perPage === n ? colors.primary : 'none', color: perPage === n ? '#fff' : colors.text, borderColor: colors.primary }}>{n} Per Page</button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={() => { setTimeout(() => window.print(), 500); }} style={{ ...styles.btnPrimary, background: colors.primary, flex: 1 }}>Start Print</button>
        <button onClick={onClose} style={{...styles.btnSecondary, flex: 1}}>Cancel</button>
      </div>
    </div>
  </div>
);

const SearchBar = ({ value, onChange, placeholder, colors }) => (
  <div style={{ ...styles.searchBar, background: colors.card, borderColor: colors.border, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 15px', borderRadius: 12, border: '1px solid', marginBottom: 15 }}>
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

/* ===================== STYLES ===================== */

const DARK_THEME = { bg: '#020617', card: '#0f172a', text: '#f8fafc', textSecondary: '#94a3b8', border: '#1e293b' };
const LIGHT_THEME = { bg: '#f1f5f9', card: '#ffffff', text: '#0f172a', textSecondary: '#64748b', border: '#e2e8f0' };

const styles = {
  app: { minHeight: '100vh' },
  header: { padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50 },
  main: { padding: 20, paddingBottom: 100, maxWidth: 600, margin: '0 auto' },
  nav: { display: 'flex', justifyContent: 'space-around', padding: '12px 0', position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100 },
  listItem: { display: 'flex', alignItems: 'center', padding: 15, borderRadius: 16, border: '1px solid', marginBottom: 10, transition: '0.1s' },
  loginInput: { width: '100%', padding: 14, borderRadius: 12, border: '1px solid #334155', background: 'rgba(255,255,255,0.05)', color: '#ffffff', marginBottom: 12, boxSizing: 'border-box', outline: 'none' },
  btnPrimary: { color: '#fff', border: 'none', borderRadius: 12, padding: 14, fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 },
  btnSecondary: { background: '#64748b', color: '#fff', border: 'none', borderRadius: 12, padding: 12, cursor: 'pointer' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 },
  modalBox: { padding: 30, borderRadius: 24, textAlign: 'center', width: '100%' },
  floatingBar: { position: 'fixed', bottom: 85, left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: 450, padding: '10px 20px', borderRadius: 15, border: '1px solid', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1000, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' },
  loginPage: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 20 },
  loginCard: { padding: 35, borderRadius: 28, width: 340, textAlign: 'center', border: '1px solid' },
  tab: { flex: 1, padding: 10, border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' },
  smallGhostBtn: { background: 'none', border: '1px solid #334155', color: 'inherit', borderRadius: 8, padding: '5px 10px', fontSize: 10, cursor: 'pointer' },
  scanBtn: { padding: '45px 20px', borderRadius: 24, width: '100%', border: '2px dashed', background: 'none', fontWeight: 'bold', fontSize: 18, cursor: 'pointer' },
  bigInput: { fontSize: 40, width: '100%', textAlign: 'center', background: 'none', border: 'none', borderBottom: '3px solid', outline: 'none' },
  fadeIn: { animation: 'fadeIn 0.4s ease' },
  subtext: { fontSize: 12, opacity: 0.6 },
  scannerWrapper: { width: '100%', maxWidth: 400, margin: '0 auto' },
  scannerContainer: { width: '100%', paddingTop: '100%', position: 'relative', borderRadius: 20, overflow: 'hidden', border: '4px solid #3b82f6', background: '#000' },
  scannerClose: { marginTop: 20, background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: 50, height: 50, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '20px auto' },
  input: { width: '100%', padding: 12, borderRadius: 10, border: '1px solid #ddd', background: 'none', color: 'inherit', marginBottom: 10, boxSizing: 'border-box' },
  iconBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: 4 },
  statsGrid: { display: 'flex', gap: 10, marginBottom: 10 },
  toastContainer: { position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10 },
  toast: { padding: '12px 24px', borderRadius: 50, color: '#fff', fontWeight: 'bold', fontSize: 14, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }
};

if (typeof document !== 'undefined') {
  const s = document.createElement('style');
  s.textContent = `
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .print-area { display: none; }
    .scannerContainer > div { position: absolute !important; top: 0; left: 0; width: 100% !important; height: 100% !important; }
    .skeleton { background: #334155; animation: pulse 1.5s infinite ease-in-out; }
    @keyframes pulse { 0% { opacity: .5; } 50% { opacity: .8; } 100% { opacity: .5; } }
    @media print {
      @page { size: A4; margin: 0; }
      body { background: #fff !important; margin: 0; }
      .no-print { display: none !important; }
      .print-area { display: block !important; width: 210mm; background: #fff; }
      .print-grid { display: grid !important; gap: 5mm; padding: 10mm; page-break-after: always; }
      .print-grid:last-child { page-break-after: auto; }
      .grid-1 { grid-template-columns: 1fr !important; }
      .grid-4 { grid-template-columns: 1fr 1fr !important; grid-auto-rows: 120mm; }
      .grid-8 { grid-template-columns: 1fr 1fr !important; grid-auto-rows: 65mm; }
      .grid-12 { grid-template-columns: 1fr 1fr 1fr !important; grid-auto-rows: 65mm; }
      .print-card { border: 1px solid #000 !important; border-radius: 3mm; padding: 5mm; text-align: center; display: flex !important; flex-direction: column; align-items: center; justify-content: center; background: #fff !important; color: #000 !important; page-break-inside: avoid; }
      .print-card * { color: #000 !important; }
    }
  `;
  document.head.appendChild(s);
}