import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Scanner } from '@yudiel/react-qr-scanner';
import {
  Users, UserPlus, LayoutDashboard, LogOut, Landmark, X, Camera, 
  RefreshCw, Printer, AlertCircle, Moon, Sun, UserCheck, Search,
  TrendingUp, Calendar, Trash2, Key, MapPin, Phone, Hash, CheckCircle2,
  WifiOff, User, CreditCard, ChevronRight, Info, Download, Edit3, Save,
  ArrowLeftRight, Wallet, HandCoins
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
const exportToCSV = (filename, data) => {
  if (!data || !data.length) return;
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => 
    Object.values(row).map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
  );
  const csv = [headers, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
};

const useCountUp = (end, duration = 1000) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 16);
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
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [modal, setModal] = useState({ show: false, title: '', msg: '', onConfirm: null, isPrompt: false });

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const confirmAction = (title, msg, onConfirm, isPrompt = false) => {
    setModal({ show: true, title, msg, onConfirm, isPrompt });
  };

  const fetchData = useCallback(async () => {
    if (!auth || !mode) return;
    setLoading(true);
    const modeConfig = CONFIG.modes[mode];
    try {
      const [m, t, e] = await Promise.all([
        supabase.from(modeConfig.membersTable).select('*').order('full_name'),
        supabase.from(modeConfig.transTable).select('*').order('created_at', { ascending: false }),
        supabase.from('employees').select('*').order('full_name')
      ]);
      setData({ members: m.data || [], transactions: t.data || [], agents: e.data || [] });
    } catch (e) { showToast("Fetch failed", "error"); }
    finally { setLoading(false); }
  }, [auth, mode, showToast]);

  useEffect(() => { if (auth && mode) fetchData(); }, [auth, mode, fetchData]);
  useEffect(() => {
    const hO = () => setIsOnline(true); const hF = () => setIsOnline(false);
    window.addEventListener('online', hO); window.addEventListener('offline', hF);
    return () => { window.removeEventListener('online', hO); window.removeEventListener('offline', hF); };
  }, []);

  const handleLogin = async (creds) => {
    setLoading(true);
    const u = creds.username.trim().toLowerCase();
    if (u === CONFIG.admin.username && creds.password === CONFIG.admin.password) {
      setAuth({ id: 'admin', role: 'admin', name: 'Admin' });
      setLoading(false); return;
    }
    const { data: agent } = await supabase.from('employees').select('*').eq('employee_id_number', u).eq('password', creds.password).single();
    if (agent) setAuth({ id: agent.id, role: 'agent', name: agent.full_name, data: agent });
    else showToast("Invalid login", "error");
    setLoading(false);
  };

  const activePrimary = mode ? CONFIG.modes[mode].primary : '#3b82f6';
  const colors = theme === 'dark' ? { ...DARK_THEME, primary: activePrimary } : { ...LIGHT_THEME, primary: activePrimary };

  if (!auth) return <LoginScreen onLogin={handleLogin} loading={loading} theme={theme} />;
  
  if (!mode) return (
    <div style={{ ...styles.loginPage, background: colors.bg }}>
      <div style={{ maxWidth: 400, width: '100%', textAlign: 'center' }}>
        <h2 style={{ color: colors.text, marginBottom: 30 }}>Select Management System</h2>
        <div style={{ display: 'grid', gap: 20 }}>
          <button onClick={() => setMode('ajo')} style={{ ...styles.modeCard, border: `2px solid ${CONFIG.modes.ajo.primary}`, color: CONFIG.modes.ajo.primary }}>
            <Wallet size={40} />
            <div style={{ fontWeight: '900', fontSize: 20 }}>AJO PORTAL</div>
            <small style={{ opacity: 0.7 }}>Daily Contributions & Savings</small>
          </button>
          <button onClick={() => setMode('loans')} style={{ ...styles.modeCard, border: `2px solid ${CONFIG.modes.loans.primary}`, color: CONFIG.modes.loans.primary }}>
            <HandCoins size={40} />
            <div style={{ fontWeight: '900', fontSize: 20 }}>LOANS PORTAL</div>
            <small style={{ opacity: 0.7 }}>Credit Management & Repayments</small>
          </button>
        </div>
        <button onClick={() => setAuth(null)} style={{ marginTop: 30, background: 'none', border: 'none', color: colors.textSecondary, cursor: 'pointer' }}>Logout</button>
      </div>
    </div>
  );

  return (
    <div style={{ ...styles.app, background: colors.bg, color: colors.text }}>
      {!isOnline && <div style={styles.offlineBanner}><WifiOff size={14} /> Offline Mode</div>}
      <Header 
        business={CONFIG.modes[mode].name} 
        role={auth.role} 
        isDark={theme === 'dark'} 
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
        onSwitchMode={() => setMode(null)}
        colors={colors} 
      />
      
      <main style={styles.main}>
        {loading ? <SkeletonLoader /> : (
          <>
            {auth.role === 'admin' && <AdminPortal view={view} data={data} onRefresh={fetchData} showToast={showToast} colors={colors} config={CONFIG.business} confirmAction={confirmAction} mode={mode} />}
            {auth.role === 'agent' && <AgentPortal view={view} profile={auth.data} data={data} onRefresh={fetchData} showToast={showToast} colors={colors} config={CONFIG.business} mode={mode} />}
          </>
        )}
      </main>

      <Navigation view={view} role={auth.role} onNavigate={setView} onLogout={() => confirmAction("Logout", "Exit application?", () => setAuth(null))} colors={colors} />
      <ToastContainer toasts={toasts} />
      {modal.show && <ConfirmationModal modal={modal} onClose={() => setModal({ ...modal, show: false })} colors={colors} />}
    </div>
  );
}

/* ===================== PORTALS ===================== */

const AdminPortal = ({ view, data, onRefresh, showToast, colors, config, confirmAction, mode }) => {
  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todayTs = data.transactions.filter(t => t.created_at.startsWith(today));
    return { 
      todayRev: todayTs.reduce((s, t) => s + (t.amount || 0), 0), 
      totalRev: data.transactions.reduce((s, t) => s + (t.amount || 0), 0)
    };
  }, [data.transactions]);

  if (view === 'dashboard') return (
    <div style={styles.fadeIn}>
      <div style={styles.exportBar}>
        <button onClick={() => exportToCSV(`${mode}_Transactions`, data.transactions)} style={{...styles.btnGhost, color: colors.primary}}><Download size={16}/> Transactions</button>
        <button onClick={() => exportToCSV(`${mode}_Members`, data.members)} style={{...styles.btnGhost, color: colors.primary}}><Download size={16}/> Members</button>
      </div>
      <DashboardStats stats={stats} memberCount={data.members.length} colors={colors} />
      <SectionHeader title={`Recent ${mode === 'ajo' ? 'Collections' : 'Repayments'}`} icon={<TrendingUp size={20} />} />
      <TransactionList transactions={data.transactions.slice(0, 10)} colors={colors} />
    </div>
  );
  if (view === 'members') return <MemberManagement members={data.members} transactions={data.transactions} onRefresh={onRefresh} showToast={showToast} colors={colors} isAdmin={true} confirmAction={confirmAction} mode={mode} />;
  if (view === 'agents') return <AgentManagement agents={data.agents} transactions={data.transactions} onRefresh={onRefresh} showToast={showToast} colors={colors} confirmAction={confirmAction} />;
  return null;
};

const AgentPortal = ({ view, profile, data, onRefresh, showToast, colors, config, mode }) => {
  const stats = useMemo(() => {
    const myTs = data.transactions.filter(t => t.employee_id === profile.id);
    const today = new Date().toISOString().slice(0, 10);
    const todayTotal = myTs.filter(t => t.created_at.startsWith(today)).reduce((s, t) => s + (t.amount || 0), 0);
    return { todayTotal, count: myTs.filter(t => t.created_at.startsWith(today)).length };
  }, [data.transactions, profile.id]);

  if (view === 'dashboard') return (
    <div style={styles.fadeIn}>
      <AgentDashboard stats={stats} colors={colors} />
      <SectionHeader title="Your Activity" icon={<Calendar size={20} />} />
      <TransactionList transactions={data.transactions.filter(t => t.employee_id === profile.id).slice(0, 10)} colors={colors} />
    </div>
  );
  if (view === 'members') return <MemberManagement members={data.members} transactions={data.transactions} onRefresh={onRefresh} showToast={showToast} colors={colors} isAdmin={false} mode={mode} />;
  if (view === 'scan') return <ScannerView profile={profile} onRefresh={onRefresh} showToast={showToast} colors={colors} mode={mode} />;
  return null;
};

/* ===================== MEMBER LOGIC ===================== */

const MemberManagement = ({ members, transactions, onRefresh, showToast, colors, isAdmin, mode, confirmAction }) => {
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ show: false, member: null });
  const filtered = members.filter(m => (m.full_name || '').toLowerCase().includes(search.toLowerCase()) || (m.registration_no || '').includes(search));

  const getBalance = (member) => {
    const paid = transactions.filter(t => t.contributor_id === member.id).reduce((s, t) => s + (t.amount || 0), 0);
    return (member.total_to_repay || 0) - paid;
  };

  return (
    <div style={styles.fadeIn}>
      <SearchBar value={search} onChange={setSearch} placeholder="Search..." colors={colors} />
      {isAdmin && <button onClick={() => setForm({ show: true, member: null })} style={{ ...styles.btnPrimary, background: colors.primary, marginBottom: 15 }}><UserPlus size={18} /> New {mode === 'ajo' ? 'Member' : 'Loan Client'}</button>}
      
      {form.show && <MemberForm member={form.member} mode={mode} onClose={() => setForm({ show: false, member: null })} onSuccess={() => { setForm({ show: false, member: null }); onRefresh(); }} showToast={showToast} colors={colors} />}

      <div style={styles.list}>
        {filtered.map(m => {
          const balance = mode === 'loans' ? getBalance(m) : null;
          return (
            <div key={m.id} style={{ ...styles.listItem, background: colors.card, borderColor: colors.border }}>
              <div style={{ ...styles.avatar, color: colors.primary }}>{m.full_name ? m.full_name[0] : '?'}</div>
              <div style={{ flex: 1 }}>
                <strong>{m.full_name}</strong>
                <div style={styles.subtext}>ID: {m.registration_no}</div>
                {mode === 'loans' && (
                  <div style={{ fontSize: 11, marginTop: 4 }}>
                    <span style={{ color: colors.textSecondary }}>Repay: ₦{m.expected_amount} • </span>
                    <span style={{ color: balance > 0 ? '#ef4444' : '#10b981', fontWeight: 'bold' }}>Bal: ₦{balance.toLocaleString()}</span>
                  </div>
                )}
              </div>
              <button onClick={() => setForm({ show: true, member: m })} style={{ ...styles.iconBtn, color: colors.primary }}><Edit3 size={18} /></button>
            </div>
          );
        })}
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
      phone_number: fd.get('p'), address: fd.get('a'),
      expected_amount: Number(fd.get('am')), ajo_owner_id: 'admin'
    };
    if (mode === 'loans') {
      payload.total_loan_amount = Number(fd.get('tla'));
      payload.total_to_repay = Number(fd.get('ttr'));
    }
    const { error } = isEdit ? await supabase.from(table).update(payload).eq('id', member.id) : await supabase.from(table).insert([payload]);
    if (error) showToast(error.message, "error");
    else { showToast("Success", "success"); onSuccess(); }
  };

  return (
    <div style={styles.overlay}>
      <div style={{ ...styles.modalBox, background: colors.card }}>
        <h3>{isEdit ? 'Edit' : 'Add'} {mode === 'ajo' ? 'Contributor' : 'Loan Client'}</h3>
        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <input name="n" defaultValue={member?.full_name} placeholder="Full Name" style={styles.input} required />
          <input name="r" defaultValue={member?.registration_no} placeholder="ID Number" style={styles.input} required />
          <input name="am" type="number" defaultValue={member?.expected_amount} placeholder={mode === 'ajo' ? "Daily Save" : "Repayment"} style={styles.input} required />
          {mode === 'loans' && (
            <>
              <input name="tla" type="number" defaultValue={member?.total_loan_amount} placeholder="Loan Taken" style={styles.input} required />
              <input name="ttr" type="number" defaultValue={member?.total_to_repay} placeholder="Total to Repay" style={styles.input} required />
            </>
          )}
          <input name="p" defaultValue={member?.phone_number} placeholder="Phone" style={styles.input} />
          <input name="a" defaultValue={member?.address} placeholder="Address" style={styles.input} />
          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <button type="submit" style={{ ...styles.btnPrimary, background: colors.primary }}>Save</button>
            <button type="button" onClick={onClose} style={styles.btnSecondary}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ===================== SCANNER & UI ===================== */

const ScannerView = ({ profile, onRefresh, showToast, colors, mode }) => {
  const [scanning, setScanning] = useState(false);
  const [member, setMember] = useState(null);
  const [amt, setAmt] = useState('');
  const handleScan = async (res) => {
    try {
      const { id } = JSON.parse(res);
      const { data: m } = await supabase.from(CONFIG.modes[mode].membersTable).select('*').eq('id', id).single();
      if (m) { setMember(m); setAmt(m.expected_amount); setScanning(false); }
    } catch (e) { showToast("Invalid Card", "error"); }
  };

  if (member) return (
    <div style={{ ...styles.modalBox, background: colors.card, margin: '0 auto' }}>
      <h2>{member.full_name}</h2>
      <input type="number" value={amt} onChange={e => setAmt(e.target.value)} style={{...styles.bigInput, color: colors.text, borderBottomColor: colors.primary}} />
      <button onClick={async () => {
        const { error } = await supabase.from(CONFIG.modes[mode].transTable).insert([{ 
          contributor_id: member.id, full_name: member.full_name, registration_no: member.registration_no,
          amount: Number(amt), employee_id: profile.id, employee_name: profile.full_name, expected_amount: member.expected_amount
        }]);
        if (!error) { showToast("Saved", "success"); setMember(null); onRefresh(); }
      }} style={{ ...styles.btnPrimary, background: colors.primary }}>Confirm Payment</button>
      <button onClick={() => setMember(null)} style={styles.btnSecondary}>Cancel</button>
    </div>
  );

  return (
    <div style={{ textAlign: 'center' }}>
      {!scanning ? <button onClick={() => setScanning(true)} style={{...styles.scanBtn, borderColor: colors.primary, color: colors.primary}}><Camera size={32}/> Scan Card</button> :
      <div style={styles.scanner}><Scanner onScan={(r) => r?.[0] && handleScan(r[0].rawValue)} /><button onClick={() => setScanning(false)} style={styles.closeBtn}><X/></button></div>}
    </div>
  );
};

const Header = ({ business, role, isDark, onToggleTheme, onSwitchMode, colors }) => (
  <header style={{ ...styles.header, background: colors.card, borderBottom: `1px solid ${colors.border}` }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <button onClick={onSwitchMode} style={{ ...styles.iconBtn, color: colors.text }}><ArrowLeftRight size={20}/></button>
      <div><h1 style={styles.brand}>{business}</h1><small style={{ color: colors.primary }}>{role.toUpperCase()}</small></div>
    </div>
    <button onClick={onToggleTheme} style={styles.iconBtn}>{isDark ? <Sun color="#fff"/> : <Moon color="#000"/>}</button>
  </header>
);

const Navigation = ({ view, role, onNavigate, onLogout, colors }) => (
  <nav className="mobile-nav" style={{ ...styles.nav, background: colors.card, borderTop: `1px solid ${colors.border}` }}>
    <NavBtn active={view === 'dashboard'} icon={<LayoutDashboard/>} label="Home" onClick={() => onNavigate('dashboard')} colors={colors} />
    <NavBtn active={view === 'members'} icon={<Users/>} label="Members" onClick={() => onNavigate('members')} colors={colors} />
    {role === 'admin' ? <NavBtn active={view === 'agents'} icon={<UserCheck/>} label="Agents" onClick={() => onNavigate('agents')} colors={colors} /> :
    <NavBtn active={view === 'scan'} icon={<Camera/>} label="Scan" onClick={() => onNavigate('scan')} colors={colors} />}
    <NavBtn icon={<LogOut/>} label="Exit" onClick={onLogout} colors={colors} />
  </nav>
);

const NavBtn = ({ active, icon, label, onClick, colors }) => (
  <button onClick={onClick} style={{ ...styles.navBtn, color: active ? colors.primary : colors.textSecondary }}>{icon}<span style={{ fontSize: 10 }}>{label}</span></button>
);

const DashboardStats = ({ stats, memberCount, colors }) => (
  <div style={styles.statsGrid}>
    <StatCard title="Today" value={`₦${useCountUp(stats.todayRev).toLocaleString()}`} colors={colors} />
    <StatCard title="Count" value={memberCount} colors={colors} />
    <StatCard title="Total" value={`₦${useCountUp(stats.totalRev).toLocaleString()}`} colors={colors} />
  </div>
);

const StatCard = ({ title, value, colors }) => (
  <div style={{ ...styles.statCard, background: colors.card, borderColor: colors.border }}>
    <small style={{ opacity: 0.6 }}>{title}</small>
    <div style={{ fontSize: 15, fontWeight: 'bold' }}>{value}</div>
  </div>
);

const TransactionList = ({ transactions, colors }) => (
  <div style={styles.list}>
    {transactions.map(t => (
      <div key={t.id} style={{ ...styles.listItem, background: colors.card, borderColor: colors.border }}>
        <div style={{ flex: 1 }}><strong>{t.full_name}</strong><br/><small style={styles.subtext}>By: {t.employee_name || 'Admin'}</small></div>
        <strong style={{ color: colors.primary }}>₦{t.amount?.toLocaleString()}</strong>
      </div>
    ))}
  </div>
);

const AgentDashboard = ({ stats, colors }) => {
  const anim = useCountUp(stats.todayTotal);
  return (
    <div style={{ ...styles.heroCard, background: colors.primary }}>
      <small>TODAY'S OPERATIONS</small>
      <h1 style={{ fontSize: 32 }}>₦{anim.toLocaleString()}</h1>
      <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.8 }}><span>{stats.count} Trans</span><span>{new Date().toLocaleDateString()}</span></div>
    </div>
  );
};

const AgentManagement = ({ agents, transactions, onRefresh, showToast, colors, confirmAction }) => {
  const stats = agents.map(a => ({ ...a, total: transactions.filter(t => t.employee_id === a.id).reduce((s, t) => s + (t.amount || 0), 0) }));
  return (
    <div>
      {stats.map(a => (
        <div key={a.id} style={{ ...styles.listItem, background: colors.card, borderColor: colors.border }}>
          <div style={{ ...styles.avatar, background: colors.primary, color: '#fff' }}>{a.full_name[0]}</div>
          <div style={{ flex: 1 }}><strong>{a.full_name}</strong><br/><small>Handled: ₦{a.total.toLocaleString()}</small></div>
          <button onClick={() => confirmAction("Delete", "Remove agent?", async () => { await supabase.from('employees').delete().eq('id', a.id); onRefresh(); })} style={{ ...styles.iconBtn, color: '#ef4444' }}><Trash2 size={18} /></button>
        </div>
      ))}
    </div>
  );
};

const SearchBar = ({ value, onChange, placeholder, colors }) => (
  <div style={{ ...styles.searchBar, background: colors.card, borderColor: colors.border }}>
    <Search size={18} opacity={0.5} />
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ background: 'none', border: 'none', color: colors.text, width: '100%', outline: 'none' }} />
  </div>
);

const SectionHeader = ({ title, icon }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '20px 0 10px' }}>{icon} <strong>{title}</strong></div>
);

const LoginScreen = ({ onLogin, loading, theme }) => {
  const [type, setType] = useState('admin');
  const colors = theme === 'dark' ? DARK_THEME : LIGHT_THEME;
  return (
    <div style={{ ...styles.loginPage, background: colors.bg }}>
      <div style={{ ...styles.loginCard, background: colors.card, borderColor: colors.border }}>
        <Landmark size={48} color="#3b82f6" />
        <h2 style={{ margin: '10px 0', color: colors.text }}>{CONFIG.business.name}</h2>
        <div style={{ display: 'flex', gap: 5, background: colors.bg, padding: 4, borderRadius: 10, marginBottom: 20 }}>
          <button onClick={() => setType('admin')} style={{ ...styles.tab, background: type === 'admin' ? '#3b82f6' : 'none', color: type === 'admin' ? '#fff' : colors.textSecondary }}>Admin</button>
          <button onClick={() => setType('agent')} style={{ ...styles.tab, background: type === 'agent' ? '#3b82f6' : 'none', color: type === 'agent' ? '#fff' : colors.textSecondary }}>Agent</button>
        </div>
        <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.target); onLogin({ username: fd.get('u'), password: fd.get('p') }); }}>
          <input name="u" placeholder="ID / Username" style={styles.input} required />
          <input name="p" type="password" placeholder="Password" style={styles.input} required />
          <button type="submit" disabled={loading} style={{ ...styles.btnPrimary, background: '#3b82f6' }}>{loading ? '...' : 'Sign In'}</button>
        </form>
      </div>
    </div>
  );
};

/* ===================== COMPONENTS & STYLES ===================== */

const ConfirmationModal = ({ modal, onClose, colors }) => (
  <div style={styles.overlay}>
    <div style={{ ...styles.modalBox, background: colors.card, borderColor: colors.border }}>
      <h3>{modal.title}</h3><p>{modal.msg}</p>
      <div style={{ display: 'flex', gap: 10 }}>
        <button style={{ ...styles.btnPrimary, background: colors.primary }} onClick={() => { modal.onConfirm(); onClose(); }}>Confirm</button>
        <button style={styles.btnSecondary} onClick={onClose}>Cancel</button>
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

const DARK_THEME = { bg: '#020617', card: '#0f172a', text: '#f8fafc', textSecondary: '#94a3b8', border: '#1e293b' };
const LIGHT_THEME = { bg: '#f1f5f9', card: '#ffffff', text: '#0f172a', textSecondary: '#64748b', border: '#e2e8f0' };

const styles = {
  app: { minHeight: '100vh', transition: '0.3s' },
  header: { padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50 },
  brand: { fontSize: 16, fontWeight: '900', margin: 0 },
  main: { padding: 20, paddingBottom: 100, maxWidth: 600, margin: '0 auto' },
  nav: { display: 'flex', justifyContent: 'space-around', padding: '12px 0', zIndex: 100 },
  navBtn: { background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', gap: 4 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 },
  statCard: { padding: 12, borderRadius: 12, border: '1px solid', textAlign: 'center' },
  heroCard: { padding: 25, borderRadius: 16, color: '#fff', marginBottom: 20 },
  listItem: { display: 'flex', alignItems: 'center', padding: 12, borderRadius: 12, border: '1px solid', marginBottom: 10, gap: 12 },
  avatar: { width: 36, height: 36, borderRadius: '50%', background: '#8882', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
  subtext: { fontSize: 11, opacity: 0.6 },
  searchBar: { display: 'flex', alignItems: 'center', padding: '10px 15px', borderRadius: 12, border: '1px solid', marginBottom: 15, gap: 10 },
  input: { width: '100%', padding: 12, marginBottom: 10, borderRadius: 8, border: '1px solid #ddd', boxSizing: 'border-box' },
  btnPrimary: { color: '#fff', border: 'none', borderRadius: 10, padding: 12, width: '100%', fontWeight: 'bold', cursor: 'pointer' },
  btnSecondary: { background: '#64748b', color: '#fff', border: 'none', borderRadius: 10, padding: 12, width: '100%', cursor: 'pointer' },
  btnGhost: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 },
  iconBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: 4 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 },
  modalBox: { padding: 25, borderRadius: 20, width: '100%', maxWidth: 350, textAlign: 'center' },
  toastContainer: { position: 'fixed', top: 70, left: 20, right: 20, display: 'flex', flexDirection: 'column', gap: 10, zIndex: 2000 },
  toast: { padding: '10px 15px', borderRadius: 10, color: '#fff', fontSize: 13, textAlign: 'center' },
  loginPage: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  loginCard: { padding: 30, borderRadius: 24, width: '100%', maxWidth: 360, textAlign: 'center', border: '1px solid' },
  tab: { flex: 1, padding: 8, border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 'bold' },
  modeCard: { padding: 30, borderRadius: 20, background: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, cursor: 'pointer' },
  scanBtn: { padding: '40px 20px', borderRadius: 20, width: '100%', border: '2px dashed', background: 'none', fontWeight: 'bold', fontSize: 18, cursor: 'pointer' },
  bigInput: { fontSize: 40, width: '100%', textAlign: 'center', background: 'none', border: 'none', outline: 'none' },
  offlineBanner: { background: '#ef4444', color: '#fff', textAlign: 'center', padding: 5, fontSize: 11 },
  exportBar: { display: 'flex', gap: 10, marginBottom: 15, justifyContent: 'flex-end' },
  fadeIn: { animation: 'fadeIn 0.3s ease' }
};

if (typeof document !== 'undefined') {
  const s = document.createElement('style');
  s.textContent = `
    @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 0.2; } 100% { opacity: 0.5; } }
    .skeleton { background: #888; animation: pulse 1.5s infinite; }
    @media (max-width: 768px) { .mobile-nav { position: fixed !important; bottom: 0; left: 0; right: 0; } }
  `;
  document.head.appendChild(s);
}