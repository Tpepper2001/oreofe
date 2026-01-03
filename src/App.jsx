import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
        supabase.from(mConf.membersTable).select('*').order('full_name'),
        supabase.from(mConf.transTable).select('*').order('created_at', { ascending: false }),
        supabase.from('employees').select('*').order('full_name')
      ]);
      setData({ members: m.data || [], transactions: t.data || [], agents: e.data || [] });
    } catch (e) { showToast("Fetch failed", "error"); }
    finally { setLoading(false); }
  }, [auth, mode, showToast]);

  useEffect(() => { if (auth && mode) fetchData(); }, [auth, mode, fetchData]);

  const activePrimary = mode ? CONFIG.modes[mode].primary : '#3b82f6';
  const colors = theme === 'dark' ? { ...DARK_THEME, primary: activePrimary } : { ...LIGHT_THEME, primary: activePrimary };

  if (!auth) return <LoginScreen onLogin={(c) => {
    if (c.username === CONFIG.admin.username && c.password === CONFIG.admin.password) setAuth({ role: 'admin' });
    else showToast("Invalid Credentials", "error");
  }} theme={theme} />;
  
  if (!mode) return <ModeSelection setMode={setMode} colors={colors} setAuth={setAuth} />;

  return (
    <div style={{ ...styles.app, background: colors.bg, color: colors.text }}>
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

      <Navigation view={view} role={auth.role} onNavigate={setView} onLogout={() => confirmAction("Logout", "Exit?", () => setAuth(null))} colors={colors} />
      <ToastContainer toasts={toasts} />
      {modal.show && <ConfirmationModal modal={modal} onClose={() => setModal({ ...modal, show: false })} colors={colors} />}
      {bulkPrintList.length > 0 && <BulkPrintModal members={bulkPrintList} mode={mode} onClose={() => setBulkPrintList([])} colors={colors} />}
    </div>
  );
}

/* ===================== ADMIN PORTAL ===================== */

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
  return null;
};

const MemberManagement = ({ members, transactions, onRefresh, showToast, colors, isAdmin, mode, confirmAction, setBulkPrintList }) => {
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [form, setForm] = useState({ show: false, member: null });

  const filtered = members.filter(m => (m.full_name || '').toLowerCase().includes(search.toLowerCase()) || (m.registration_no || '').includes(search));

  const toggleSelect = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const getBalance = (member) => {
    const paid = transactions.filter(t => t.contributor_id === member.id).reduce((s, t) => s + (t.amount || 0), 0);
    return (member.total_to_repay || 0) - paid;
  };

  return (
    <div style={styles.fadeIn}>
      <SearchBar value={search} onChange={setSearch} placeholder="Search members..." colors={colors} />
      
      <div style={{ display: 'flex', gap: 10, marginBottom: 15 }}>
        {isAdmin && <button onClick={() => setForm({ show: true, member: null })} style={{ ...styles.btnPrimary, background: colors.primary, flex: 1 }}><UserPlus size={18} /> Add Member</button>}
        {selectedIds.length > 0 && <button onClick={() => setBulkPrintList(members.filter(m => selectedIds.includes(m.id)))} style={{ ...styles.btnPrimary, background: '#10b981', flex: 1 }}><Printer size={18} /> Bulk Print ({selectedIds.length})</button>}
      </div>

      {form.show && <MemberForm member={form.member} mode={mode} onClose={() => setForm({ show: false, member: null })} onSuccess={() => { setForm({ show: false, member: null }); onRefresh(); }} showToast={showToast} colors={colors} />}

      <div style={styles.list}>
        {filtered.map(m => {
          const balance = mode === 'loans' ? getBalance(m) : null;
          return (
            <div key={m.id} style={{ ...styles.listItem, background: colors.card, borderColor: selectedIds.includes(m.id) ? colors.primary : colors.border }}>
              <button onClick={() => toggleSelect(m.id)} style={{ background: 'none', border: 'none', color: colors.primary, cursor: 'pointer', padding: 0 }}>
                {selectedIds.includes(m.id) ? <CheckSquare size={22} /> : <Square size={22} opacity={0.3} />}
              </button>
              <div style={{ flex: 1, marginLeft: 15 }}>
                <strong>{m.full_name}</strong>
                <div style={styles.subtext}>{m.registration_no} • ₦{m.expected_amount?.toLocaleString()}</div>
                {mode === 'loans' && <div style={{ color: balance > 0 ? '#ef4444' : '#10b981', fontSize: 11, fontWeight: 'bold' }}>Balance: ₦{balance.toLocaleString()}</div>}
              </div>
              <div style={{display: 'flex', gap: 5}}>
                <button onClick={() => setForm({ show: true, member: m })} style={{ ...styles.iconBtn, color: colors.primary }}><Edit3 size={18} /></button>
                <button onClick={() => confirmAction("Delete Member", `Delete ${m.full_name}?`, async () => {
                  await supabase.from(CONFIG.modes[mode].membersTable).delete().eq('id', m.id);
                  onRefresh();
                })} style={{ ...styles.iconBtn, color: '#ef4444' }}><Trash2 size={18} /></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ===================== BULK PRINT (FIXED) ===================== */

const BulkPrintModal = ({ members, mode, onClose, colors }) => {
  const [perPage, setPerPage] = useState(8);
  
  const pages = useMemo(() => {
    const chunks = [];
    for (let i = 0; i < members.length; i += perPage) {
      chunks.push(members.slice(i, i + perPage));
    }
    return chunks;
  }, [members, perPage]);

  return (
    <div style={styles.overlay} className="no-print">
      <div style={{ ...styles.modalBox, background: colors.card, width: '90%', maxWidth: 450 }}>
        <h3 style={{marginBottom: 10}}>Bulk Print Config</h3>
        <p style={{fontSize: 12, opacity: 0.7, marginBottom: 20}}>Choose how many cards fit on one A4 sheet</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          {[1, 4, 8, 12].map(n => (
            <button key={n} onClick={() => setPerPage(n)} style={{ 
              padding: 12, borderRadius: 10, border: '1px solid',
              background: perPage === n ? colors.primary : 'none',
              color: perPage === n ? '#fff' : colors.text, borderColor: colors.primary
            }}>{n} per page</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => window.print()} style={{ ...styles.btnPrimary, background: colors.primary, flex: 1 }}>Print {members.length} Cards</button>
          <button onClick={onClose} style={{...styles.btnSecondary, flex: 1}}>Cancel</button>
        </div>
      </div>

      <div className="print-area">
        {pages.map((pageMembers, pIdx) => (
          <div key={pIdx} className={`print-grid grid-${perPage}`}>
            {pageMembers.map(m => (
              <div key={m.id} className="print-card">
                <h4 style={{ margin: '0 0 2px 0', fontSize: 13, color: '#000' }}>{CONFIG.business.name}</h4>
                <div style={{ fontSize: 8, fontWeight: 'bold', marginBottom: 5 }}>{mode.toUpperCase()} IDENTITY CARD</div>
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${m.registration_no}`} alt="QR" style={{ width: '100px', height: '100px', marginBottom: 5 }} />
                <div style={{ textAlign: 'left', width: '100%', fontSize: 10 }}>
                  <div style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}><strong>NAME:</strong> {m.full_name}</div>
                  <div><strong>ID NO:</strong> {m.registration_no}</div>
                  <div><strong>AMOUNT:</strong> ₦{m.expected_amount?.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ===================== SCANNER & AGENTS ===================== */

const ScannerView = ({ profile, onRefresh, showToast, colors, mode }) => {
  const [scanning, setScanning] = useState(false);
  const [member, setMember] = useState(null);
  const [amt, setAmt] = useState('');
  const handleScan = async (res) => {
    try {
      let lookup;
      try { lookup = JSON.parse(res).id; } catch (e) { lookup = res; }
      const { data: m } = await supabase.from(CONFIG.modes[mode].membersTable).select('*').or(`id.eq.${lookup},registration_no.eq.${lookup}`).maybeSingle();
      if (m) { setMember(m); setAmt(m.expected_amount || ''); setScanning(false); }
      else showToast("Member not found", "error");
    } catch (e) { showToast("Invalid Scan", "error"); }
  };
  if (member) return (
    <div style={{ ...styles.modalBox, background: colors.card, margin: '0 auto' }}>
      <small style={{color: colors.primary}}>{member.registration_no}</small>
      <h2 style={{margin: '5px 0 20px'}}>{member.full_name}</h2>
      <input type="number" value={amt} onChange={e => setAmt(e.target.value)} style={{...styles.bigInput, color: colors.text, borderBottomColor: colors.primary}} autoFocus />
      <button onClick={async () => {
        const { error } = await supabase.from(CONFIG.modes[mode].transTable).insert([{ 
          contributor_id: member.id, full_name: member.full_name, registration_no: member.registration_no,
          amount: Number(amt), employee_id: profile?.id || null, employee_name: profile?.full_name || 'Admin', expected_amount: member.expected_amount
        }]);
        if (!error) { showToast("Payment Saved", "success"); setMember(null); onRefresh(); }
      }} style={{ ...styles.btnPrimary, background: colors.primary }}>Confirm Entry</button>
      <button onClick={() => setMember(null)} style={styles.btnSecondary}>Cancel</button>
    </div>
  );
  return (
    <div style={{ textAlign: 'center' }}>
      {!scanning ? <button onClick={() => setScanning(true)} style={{...styles.scanBtn, borderColor: colors.primary, color: colors.primary}}><Camera size={32}/> Scan Serial / Card</button> :
      <div style={styles.scanner}><Scanner onScan={(r) => r?.[0] && handleScan(r[0].rawValue)} /><button onClick={() => setScanning(false)} style={styles.closeBtn}><X/></button></div>}
    </div>
  );
};

/* ===================== SHARED UI COMPONENTS ===================== */

const LoginScreen = ({ onLogin, theme }) => {
  const colors = theme === 'dark' ? DARK_THEME : LIGHT_THEME;
  return (
    <div style={{ background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 20 }}>
      <div style={{ ...styles.loginCard, background: colors.card, borderColor: colors.border }}>
        <Landmark size={48} color="#3b82f6" style={{marginBottom: 10}} />
        <h2 style={{color: colors.text, marginBottom: 20}}>{CONFIG.business.name}</h2>
        <form onSubmit={e => { e.preventDefault(); onLogin({ username: e.target.u.value, password: e.target.p.value }); }}>
          <input name="u" placeholder="Admin ID" style={styles.input} required />
          <input name="p" type="password" placeholder="Password" style={styles.input} required />
          <button type="submit" style={{ ...styles.btnPrimary, background: '#3b82f6', width: '100%' }}>Login</button>
        </form>
      </div>
    </div>
  );
};

const ModeSelection = ({ setMode, colors, setAuth }) => (
  <div style={{ background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
    <div style={{ textAlign: 'center', width: '100%', maxWidth: 400, padding: 20 }}>
      <h2 style={{ color: colors.text, marginBottom: 30 }}>Select Management System</h2>
      <div style={{ display: 'grid', gap: 15 }}>
        <button onClick={() => setMode('ajo')} style={{ ...styles.modeCard, border: `2px solid ${CONFIG.modes.ajo.primary}`, color: CONFIG.modes.ajo.primary }}>
          <Wallet size={32} /> <div style={{fontWeight: '900', fontSize: 18}}>AJO PORTAL</div>
        </button>
        <button onClick={() => setMode('loans')} style={{ ...styles.modeCard, border: `2px solid ${CONFIG.modes.loans.primary}`, color: CONFIG.modes.loans.primary }}>
          <HandCoins size={32} /> <div style={{fontWeight: '900', fontSize: 18}}>LOAN PORTAL</div>
        </button>
      </div>
      <button onClick={() => setAuth(null)} style={{ marginTop: 30, color: colors.textSecondary, background: 'none', border: 'none' }}>Logout</button>
    </div>
  </div>
);

const Header = ({ business, role, isDark, onToggleTheme, onSwitchMode, colors }) => (
  <header style={{ ...styles.header, background: colors.card, borderBottom: `1px solid ${colors.border}` }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <button onClick={onSwitchMode} style={{ background: 'none', border: 'none', color: colors.text }}><ArrowLeftRight size={20}/></button>
      <h1 style={{fontSize: 14, fontWeight: '900'}}>{business}</h1>
    </div>
    <button onClick={onToggleTheme} style={{background: 'none', border: 'none'}}>{isDark ? <Sun color="#fff"/> : <Moon color="#000"/>}</button>
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

const DashboardStats = ({ stats, memberCount, colors }) => (
  <div style={styles.statsGrid}>
    <StatCard title="Today" value={`₦${useCountUp(stats.todayRev).toLocaleString()}`} colors={colors} />
    <StatCard title="Members" value={memberCount} colors={colors} />
    <StatCard title="Gross" value={`₦${useCountUp(stats.totalRev).toLocaleString()}`} colors={colors} />
  </div>
);

const TransactionList = ({ transactions, colors }) => (
  <div style={styles.list}>
    {transactions.map(t => (
      <div key={t.id} style={{ ...styles.listItem, background: colors.card, borderColor: colors.border }}>
        <div style={{ flex: 1 }}><strong>{t.full_name}</strong><br/><small style={styles.subtext}>{t.employee_name || 'Admin'}</small></div>
        <strong style={{ color: colors.primary }}>₦{t.amount?.toLocaleString()}</strong>
      </div>
    ))}
  </div>
);

/* ===================== STYLES & PRINT ENGINE ===================== */

const DARK_THEME = { bg: '#020617', card: '#0f172a', text: '#f8fafc', textSecondary: '#94a3b8', border: '#1e293b' };
const LIGHT_THEME = { bg: '#f1f5f9', card: '#ffffff', text: '#0f172a', textSecondary: '#64748b', border: '#e2e8f0' };

const styles = {
  app: { minHeight: '100vh' },
  header: { padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50 },
  main: { padding: 20, paddingBottom: 100, maxWidth: 600, margin: '0 auto' },
  nav: { display: 'flex', justifyContent: 'space-around', padding: '12px 0', position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100 },
  navBtn: { background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  listItem: { display: 'flex', alignItems: 'center', padding: 12, borderRadius: 12, border: '1px solid', marginBottom: 10 },
  input: { width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd', background: 'none', color: 'inherit', marginBottom: 10 },
  btnPrimary: { color: '#fff', border: 'none', borderRadius: 10, padding: 12, fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 },
  btnSecondary: { background: '#64748b', color: '#fff', border: 'none', borderRadius: 10, padding: 12, cursor: 'pointer' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 },
  modalBox: { padding: 25, borderRadius: 20, textAlign: 'center' },
  searchBar: { display: 'flex', alignItems: 'center', padding: '10px 15px', borderRadius: 12, border: '1px solid', marginBottom: 15, gap: 10 },
  subtext: { fontSize: 11, opacity: 0.6 },
  modeCard: { padding: 25, borderRadius: 15, background: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, cursor: 'pointer' },
  loginCard: { padding: 30, borderRadius: 24, width: '100%', maxWidth: 360, textAlign: 'center', border: '1px solid' },
  scanBtn: { padding: '40px 20px', borderRadius: 20, width: '100%', border: '2px dashed', background: 'none', fontWeight: 'bold', fontSize: 18, cursor: 'pointer' },
  bigInput: { fontSize: 40, width: '100%', textAlign: 'center', background: 'none', border: 'none', borderBottom: '2px solid', outline: 'none' },
  fadeIn: { animation: 'fadeIn 0.3s ease' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 },
  statCard: { padding: 12, borderRadius: 12, border: '1px solid', textAlign: 'center' }
};

if (typeof document !== 'undefined') {
  const s = document.createElement('style');
  s.textContent = `
    @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 0.2; } 100% { opacity: 0.5; } }
    .skeleton { background: #888; animation: pulse 1.5s infinite; }
    .print-area { display: none; }
    
    @media print {
      @page { size: A4; margin: 10mm; }
      body { margin: 0; padding: 0; }
      .no-print { display: none !important; }
      body > *:not(.print-area) { display: none !important; }
      .print-area { display: block !important; position: relative !important; width: 100% !important; background: #fff !important; }
      .print-grid { display: grid !important; gap: 5mm; width: 100%; page-break-after: always; padding-bottom: 5mm; }
      .print-grid:last-child { page-break-after: auto; }
      .grid-1 { grid-template-columns: 1fr; }
      .grid-4 { grid-template-columns: repeat(2, 1fr); }
      .grid-8 { grid-template-columns: repeat(2, 1fr); }
      .grid-12 { grid-template-columns: repeat(3, 1fr); }
      .print-card { 
        border: 2px solid #000 !important; border-radius: 3mm; padding: 4mm;
        text-align: center; display: flex !important; flex-direction: column; align-items: center; 
        justify-content: center; page-break-inside: avoid; break-inside: avoid; background: #fff !important; color: #000 !important; 
      }
      .print-card * { color: #000 !important; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    }
  `;
  document.head.appendChild(s);
}

/* ===================== REMAINING SUB-COMPONENTS ===================== */

const NavBtn = ({ active, icon, label, onClick, colors }) => (
  <button onClick={onClick} style={{ ...styles.navBtn, color: active ? colors.primary : colors.textSecondary }}>{icon}<span style={{ fontSize: 10 }}>{label}</span></button>
);

const StatCard = ({ title, value, colors }) => (
  <div style={{ ...styles.statCard, background: colors.card, borderColor: colors.border }}>
    <small style={{ opacity: 0.6, fontSize: 10 }}>{title}</small>
    <div style={{ fontSize: 13, fontWeight: 'bold' }}>{value}</div>
  </div>
);

const SearchBar = ({ value, onChange, placeholder, colors }) => (
  <div style={{ ...styles.searchBar, background: colors.card, borderColor: colors.border }}>
    <Search size={18} opacity={0.5} />
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ background: 'none', border: 'none', color: colors.text, width: '100%', outline: 'none' }} />
  </div>
);

const SectionHeader = ({ title, icon }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '20px 0 10px' }}>{icon} <strong style={{fontSize: 14}}>{title}</strong></div>
);

const ConfirmationModal = ({ modal, onClose, colors }) => (
  <div style={styles.overlay}>
    <div style={{ ...styles.modalBox, background: colors.card, borderColor: colors.border }}>
      <h3>{modal.title}</h3><p style={{fontSize: 14, margin: '10px 0 20px'}}>{modal.msg}</p>
      <div style={{ display: 'flex', gap: 10 }}>
        <button style={{ ...styles.btnPrimary, background: colors.primary, flex: 1 }} onClick={() => { modal.onConfirm(); onClose(); }}>Confirm</button>
        <button style={{...styles.btnSecondary, flex: 1}} onClick={onClose}>Cancel</button>
      </div>
    </div>
  </div>
);

const ToastContainer = ({ toasts }) => (
  <div style={styles.toastContainer}>
    {toasts.map(t => (
      <div key={t.id} style={{ ...styles.toast, background: t.type === 'error' ? '#ef4444' : '#10b981' }}>{t.message}</div>
    ))}
  </div>
);

const SkeletonLoader = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}><div className="skeleton" style={{ height: 60, borderRadius: 12 }}></div><div className="skeleton" style={{ height: 60, borderRadius: 12 }}></div><div className="skeleton" style={{ height: 60, borderRadius: 12 }}></div></div>
    <div className="skeleton" style={{ height: 150, borderRadius: 12 }}></div>
  </div>
);

const AgentPortal = ({ view, profile, data, onRefresh, showToast, colors, mode }) => {
  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const myTs = data.transactions.filter(t => t.employee_id === profile?.id);
    return { todayTotal: myTs.filter(t => t.created_at.startsWith(today)).reduce((s, t) => s + (t.amount || 0), 0), count: myTs.filter(t => t.created_at.startsWith(today)).length };
  }, [data.transactions, profile?.id]);
  if (view === 'dashboard') return (
    <div style={styles.fadeIn}>
      <AgentDashboard stats={stats} colors={colors} />
      <SectionHeader title="Your Activity" icon={<Calendar size={20} />} />
      <TransactionList transactions={data.transactions.filter(t => t.employee_id === profile?.id).slice(0, 10)} colors={colors} />
    </div>
  );
  if (view === 'members') return <MemberManagement members={data.members} transactions={data.transactions} onRefresh={onRefresh} showToast={showToast} colors={colors} isAdmin={false} mode={mode} setBulkPrintList={()=>{}} />;
  if (view === 'scan') return <ScannerView profile={profile} onRefresh={onRefresh} showToast={showToast} colors={colors} mode={mode} />;
  return null;
};

const AgentDashboard = ({ stats, colors }) => (
  <div style={{ ...styles.heroCard, background: colors.primary }}>
    <small>COLLECTED TODAY</small>
    <h1 style={{ fontSize: 32 }}>₦{useCountUp(stats.todayTotal).toLocaleString()}</h1>
    <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.8 }}><span>{stats.count} Operations</span><span>{new Date().toLocaleDateString()}</span></div>
  </div>
);

const AgentManagement = ({ agents, onRefresh, showToast, colors, confirmAction }) => {
  const [form, setForm] = useState({ show: false, agent: null });
  return (
    <div>
      <button onClick={() => setForm({ show: true, agent: null })} style={{ ...styles.btnPrimary, background: colors.primary, marginBottom: 15 }}><UserPlus size={16} /> New Agent</button>
      {form.show && <AgentForm agent={form.agent} onClose={() => setForm({ show: false, agent: null })} onSuccess={() => { setForm({ show: false, agent: null }); onRefresh(); }} showToast={showToast} colors={colors} />}
      <div style={styles.list}>
        {agents.map(a => (
          <div key={a.id} style={{ ...styles.listItem, background: colors.card, borderColor: colors.border }}>
            <div style={{ flex: 1 }}><strong>{a.full_name}</strong><br/><small style={styles.subtext}>ID: {a.employee_id_number}</small></div>
            <div style={{display:'flex', gap:5}}>
              <button onClick={() => setForm({ show: true, agent: a })} style={{ ...styles.iconBtn, color: colors.primary }}><Edit3 size={18} /></button>
              <button onClick={() => confirmAction("Delete Agent", `Remove ${a.full_name}?`, async () => { await supabase.from('employees').delete().eq('id', a.id); onRefresh(); })} style={{ ...styles.iconBtn, color: '#ef4444' }}><Trash2 size={18} /></button>
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
    if (error) showToast(error.message, "error");
    else { showToast("Agent Saved", "success"); onSuccess(); }
  };
  return (
    <div style={styles.overlay}>
      <div style={{ ...styles.modalBox, background: colors.card }}>
        <h3>{isEdit ? 'Edit Agent' : 'New Agent'}</h3>
        <form onSubmit={handleSubmit} style={{ textAlign: 'left', display: 'grid', gap: 10 }}>
          <input name="n" defaultValue={agent?.full_name} placeholder="Full Name" style={styles.input} required />
          <input name="id" defaultValue={agent?.employee_id_number} placeholder="Login ID" style={styles.input} required />
          <input name="p" defaultValue={agent?.password} placeholder="Password" style={styles.input} required />
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" style={{ ...styles.btnPrimary, background: colors.primary, flex: 1 }}>Save</button>
            <button type="button" onClick={onClose} style={{...styles.btnSecondary, flex: 1}}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};