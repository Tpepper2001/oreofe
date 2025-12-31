import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Scanner } from '@yudiel/react-qr-scanner';
import {
  Users, UserPlus, LayoutDashboard, LogOut, Landmark, X, Camera, 
  RefreshCw, Printer, AlertCircle, Moon, Sun, UserCheck, Search,
  TrendingUp, Calendar, Trash2, Key, MapPin, Phone, Hash
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
    commissionRate: 0.05
  },
  admin: {
    username: 'oreofe',
    password: 'oreofe'
  }
};

const supabase = createClient(CONFIG.supabase.url, CONFIG.supabase.key);

export default function App() {
  const [auth, setAuth] = useState(null);
  const [view, setView] = useState('dashboard');
  const [data, setData] = useState({ members: [], agents: [], transactions: [] });
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const fetchData = useCallback(async () => {
    if (!auth) return;
    setLoading(true);
    try {
      const [membersRes, transactionsRes, agentsRes] = await Promise.all([
        supabase.from('contributors').select('*').order('full_name'),
        supabase.from('transactions').select('*').order('created_at', { ascending: false }),
        supabase.from('employees').select('*').order('full_name')
      ]);
      setData({
        members: membersRes.data || [],
        transactions: transactionsRes.data || [],
        agents: agentsRes.data || []
      });
    } catch (error) {
      showToast("Data fetch failed", "error");
    } finally {
      setLoading(false);
    }
  }, [auth, showToast]);

  useEffect(() => { if (auth) fetchData(); }, [auth, fetchData]);

  const handleLogin = async (credentials) => {
    setLoading(true);
    const { username, password } = credentials;
    const normalizedUsername = username.trim().toLowerCase();
    try {
      if (normalizedUsername === CONFIG.admin.username && password === CONFIG.admin.password) {
        setAuth({ id: 'admin', role: 'admin', name: 'Oreofe Admin' });
        return;
      }
      const { data: agent, error } = await supabase.from('employees').select('*').eq('employee_id_number', normalizedUsername).eq('password', password).single();
      if (error || !agent) { showToast("Invalid credentials", "error"); return; }
      setAuth({ id: agent.id, role: 'agent', name: agent.full_name, data: agent });
    } catch (error) { showToast("Login failed", "error"); } finally { setLoading(false); }
  };

  if (!auth) return <LoginScreen onLogin={handleLogin} loading={loading} theme={theme} />;

  const isDark = theme === 'dark';
  const colors = isDark ? DARK_THEME : LIGHT_THEME;

  return (
    <div style={{ ...styles.app, background: colors.bg, color: colors.text }}>
      <Header business={CONFIG.business.name} role={auth.role} isDark={isDark} onToggleTheme={() => setTheme(isDark ? 'light' : 'dark')} colors={colors} />
      <main style={styles.main}>
        {loading && <LoadingSpinner />}
        {!loading && auth.role === 'admin' && <AdminPortal view={view} data={data} onRefresh={fetchData} showToast={showToast} colors={colors} config={CONFIG.business} />}
        {!loading && auth.role === 'agent' && <AgentPortal view={view} profile={auth.data} data={data} onRefresh={fetchData} showToast={showToast} colors={colors} config={CONFIG.business} />}
      </main>
      <Navigation view={view} role={auth.role} onNavigate={setView} onLogout={() => setAuth(null)} colors={colors} />
      <ToastContainer toasts={toasts} />
    </div>
  );
}

/* ===================== PORTALS ===================== */

const AdminPortal = ({ view, data, onRefresh, showToast, colors, config }) => {
  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todayTransactions = data.transactions.filter(t => t.created_at.startsWith(today));
    return { 
      todayRevenue: todayTransactions.reduce((sum, t) => sum + (t.amount || 0), 0), 
      totalRevenue: data.transactions.reduce((sum, t) => sum + (t.amount || 0), 0), 
      todayCount: todayTransactions.length 
    };
  }, [data.transactions]);

  if (view === 'dashboard') return (
    <div style={styles.fadeIn}>
      <DashboardStats stats={stats} memberCount={data.members.length} colors={colors} />
      
      <SectionHeader title="Registered Member Details" icon={<Users size={20} />} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 25 }}>
        {data.members.length === 0 ? <EmptyState message="No members found" colors={colors} /> : 
          data.members.map(m => (
            <div key={m.id} style={{ ...styles.memberDetailCard, background: colors.card, borderColor: colors.border }}>
              <div style={{ borderBottom: `1px solid ${colors.border}`, paddingBottom: 8, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: 16, color: colors.primary }}>{m.full_name}</strong>
                <span style={{ fontSize: 12, background: colors.primary + '22', color: colors.primary, padding: '2px 8px', borderRadius: 4 }}>₦{m.expected_amount}/day</span>
              </div>
              <div style={styles.detailGrid}>
                <div style={styles.detailItem}><Hash size={12} /> {m.registration_no}</div>
                <div style={styles.detailItem}><Phone size={12} /> {m.phone_number}</div>
                <div style={{ ...styles.detailItem, gridColumn: 'span 2' }}><MapPin size={12} /> {m.address}</div>
              </div>
            </div>
          ))
        }
      </div>

      <SectionHeader title="Recent Collections" icon={<TrendingUp size={20} />} />
      <TransactionList transactions={data.transactions.slice(0, 15)} colors={colors} />
    </div>
  );
  if (view === 'members') return <MemberManagement members={data.members} onRefresh={onRefresh} showToast={showToast} colors={colors} config={config} isAdmin={true} />;
  if (view === 'agents') return <AgentManagement agents={data.agents} transactions={data.transactions} onRefresh={onRefresh} showToast={showToast} colors={colors} />;
  return null;
};

const AgentPortal = ({ view, profile, data, onRefresh, showToast, colors, config }) => {
  const stats = useMemo(() => {
    const myTransactions = data.transactions.filter(t => t.employee_id === profile.id);
    const today = new Date().toISOString().slice(0, 10);
    const todayTotal = myTransactions.filter(t => t.created_at.startsWith(today)).reduce((sum, t) => sum + (t.amount || 0), 0);
    return { todayTotal, todayCommission: todayTotal * config.commissionRate, totalCollected: myTransactions.reduce((sum, t) => sum + (t.amount || 0), 0), todayCount: myTransactions.filter(t => t.created_at.startsWith(today)).length };
  }, [data.transactions, profile.id, config.commissionRate]);

  if (view === 'dashboard') return (
    <div style={styles.fadeIn}>
      <AgentDashboard stats={stats} colors={colors} />
      <SectionHeader title="Your Recent Collections" icon={<Calendar size={20} />} />
      <TransactionList transactions={data.transactions.filter(t => t.employee_id === profile.id).slice(0, 10)} colors={colors} />
    </div>
  );
  if (view === 'members') return <MemberManagement members={data.members} onRefresh={onRefresh} showToast={showToast} colors={colors} config={config} isAdmin={false} />;
  if (view === 'scan') return <ScannerView profile={profile} onRefresh={onRefresh} showToast={showToast} colors={colors} />;
  return null;
};

/* ===================== SCANNER & PAYMENT ===================== */
const ScannerView = ({ profile, onRefresh, showToast, colors }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [amount, setAmount] = useState('');

  const handleScan = async (result) => {
    try {
      const data = JSON.parse(result);
      const { data: member, error } = await supabase.from('contributors').select('*').eq('id', data.id).single();
      if (error || !member) { showToast("Invalid member card", "error"); return; }
      setSelectedMember(member);
      setAmount(member.expected_amount.toString());
      setIsScanning(false);
    } catch (e) { showToast("Scan failed", "error"); }
  };

  const handleSubmitPayment = async () => {
    if (!amount || Number(amount) <= 0) return;
    const { error } = await supabase.from('transactions').insert([{
      contributor_id: selectedMember.id,
      full_name: selectedMember.full_name,
      registration_no: selectedMember.registration_no,
      expected_amount: Number(selectedMember.expected_amount),
      employee_id: profile.id,
      employee_name: profile.full_name,
      amount: Math.floor(Number(amount)),
      ajo_owner_id: selectedMember.ajo_owner_id || 'admin'
    }]);

    if (error) {
      showToast(error.message, "error");
    } else {
      showToast("Payment recorded", "success");
      setSelectedMember(null);
      onRefresh();
    }
  };

  if (selectedMember) return (
    <div style={{ ...styles.paymentModal, background: colors.card, borderColor: colors.primary }}>
      <h2>{selectedMember.full_name}</h2>
      <p>Daily Expected: ₦{selectedMember.expected_amount}</p>
      <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ ...styles.bigInput, color: colors.text, borderColor: colors.primary }} autoFocus />
      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        <button onClick={handleSubmitPayment} style={{ ...styles.btnPrimary, background: colors.primary }}>Confirm</button>
        <button onClick={() => setSelectedMember(null)} style={{ ...styles.btnSecondary, background: colors.cardAlt }}>Cancel</button>
      </div>
    </div>
  );

  return (
    <div style={{ textAlign: 'center' }}>
      {!isScanning ? <button onClick={() => setIsScanning(true)} style={{ ...styles.btnPrimary, background: colors.primary, padding: 50 }}><Camera size={40} /><br/>Scan Member Card</button> : 
      <div style={styles.scannerBox}><Scanner onScan={(r) => { if (r?.[0]) handleScan(r[0].rawValue); }} /><button onClick={() => setIsScanning(false)} style={styles.closeBtn}><X /></button></div>}
    </div>
  );
};

/* ===================== UI COMPONENTS ===================== */

const TransactionList = ({ transactions, colors }) => (
  <div>
    {transactions.length === 0 ? <EmptyState message="No transactions yet" colors={colors} /> : 
      transactions.map(t => (
        <div key={t.id} style={{ ...styles.listItem, background: colors.card, borderColor: colors.border }}>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: '600' }}>{t.full_name || 'Member'}</p>
            <small style={{ color: colors.textSecondary }}>{new Date(t.created_at).toLocaleString()}</small>
          </div>
          <strong style={{ color: colors.primary }}>₦{(t.amount || 0).toLocaleString()}</strong>
        </div>
      ))
    }
  </div>
);

const MemberManagement = ({ members, onRefresh, showToast, colors, config, isAdmin }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const filtered = members.filter(m => m.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || (m.registration_no || '').toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div style={styles.fadeIn}>
      <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search members..." colors={colors} />
      {isAdmin && <button onClick={() => setShowAddForm(true)} style={{ ...styles.btnPrimary, background: colors.primary, marginBottom: 15 }}><UserPlus size={18} /> Add Member</button>}
      {showAddForm && <AddMemberForm onClose={() => setShowAddForm(false)} onSuccess={() => { setShowAddForm(false); onRefresh(); }} showToast={showToast} colors={colors} />}
      <div>{filtered.map(member => <MemberCard key={member.id} member={member} onPrint={() => setSelectedMember(member)} colors={colors} />)}</div>
      {selectedMember && <PrintCardModal member={selectedMember} config={config} onClose={() => setSelectedMember(null)} colors={colors} />}
    </div>
  );
};

const AddMemberForm = ({ onClose, onSuccess, showToast, colors }) => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const { error } = await supabase.from('contributors').insert([{
      full_name: fd.get('name'),
      registration_no: fd.get('regNumber'),
      phone_number: fd.get('phone'),
      address: fd.get('address'),
      expected_amount: Number(fd.get('amount')),
      ajo_owner_id: 'admin'
    }]);
    if (error) showToast(error.message, "error"); else onSuccess();
  };
  return (
    <div style={{ ...styles.form, background: colors.card, borderColor: colors.primary }}>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Full Name" style={styles.input} required />
        <input name="regNumber" placeholder="Reg No" style={styles.input} required />
        <input name="phone" placeholder="Phone" style={styles.input} required />
        <input name="address" placeholder="Address" style={styles.input} required />
        <input name="amount" type="number" placeholder="Daily Amount" style={styles.input} required />
        <div style={{ display: 'flex', gap: 10 }}><button type="submit" style={{ ...styles.btnPrimary, background: colors.primary }}>Save</button><button type="button" onClick={onClose} style={styles.btnSecondary}>Cancel</button></div>
      </form>
    </div>
  );
};

const Header = ({ business, role, isDark, onToggleTheme, colors }) => (
  <header style={{ ...styles.header, background: colors.card, borderBottom: `1px solid ${colors.border}` }}>
    <div><h1 style={{ ...styles.brand, color: colors.primary }}>{business}</h1><p style={styles.subBrand}>{role.toUpperCase()}</p></div>
    <button onClick={onToggleTheme} style={styles.iconBtn}>{isDark ? <Sun size={22} color="#fff" /> : <Moon size={22} color="#000" />}</button>
  </header>
);

const Navigation = ({ view, role, onNavigate, onLogout, colors }) => (
  <nav style={{ ...styles.nav, background: colors.card, borderTop: `1px solid ${colors.border}` }}>
    <NavButton active={view === 'dashboard'} icon={<LayoutDashboard size={20} />} label="Home" onClick={() => onNavigate('dashboard')} colors={colors} />
    <NavButton active={view === 'members'} icon={<Users size={20} />} label="Members" onClick={() => onNavigate('members')} colors={colors} />
    {role === 'admin' && <NavButton active={view === 'agents'} icon={<UserCheck size={20} />} label="Agents" onClick={() => onNavigate('agents')} colors={colors} />}
    {role === 'agent' && <NavButton active={view === 'scan'} icon={<Camera size={20} />} label="Scan" onClick={() => onNavigate('scan')} colors={colors} />}
    <NavButton active={false} icon={<LogOut size={20} />} label="Exit" onClick={onLogout} colors={colors} />
  </nav>
);

const NavButton = ({ active, icon, label, onClick, colors }) => (
  <button onClick={onClick} style={{ ...styles.navBtn, color: active ? colors.primary : colors.textSecondary }}>{icon}<span style={{ fontSize: 10 }}>{label}</span></button>
);

const DashboardStats = ({ stats, memberCount, colors }) => (
  <div style={styles.statsGrid}>
    <StatCard title="Today" value={`₦${stats.todayRevenue.toLocaleString()}`} colors={colors} />
    <StatCard title="Members" value={memberCount} colors={colors} />
    <StatCard title="Total" value={`₦${stats.totalRevenue.toLocaleString()}`} colors={colors} />
  </div>
);

const AgentDashboard = ({ stats, colors }) => (
  <div style={{ ...styles.heroCard, background: colors.primary }}>
    <small>COLLECTED TODAY</small>
    <h1 style={{ fontSize: 32 }}>₦{stats.todayTotal.toLocaleString()}</h1>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
      <span>Comm: ₦{stats.todayCommission.toLocaleString()}</span>
      <span>{stats.todayCount} items</span>
    </div>
  </div>
);

const StatCard = ({ title, value, colors }) => (
  <div style={{ ...styles.statCard, background: colors.card, borderColor: colors.border }}>
    <small style={{ color: colors.textSecondary }}>{title}</small>
    <h2 style={{ margin: '5px 0' }}>{value}</h2>
  </div>
);

const SectionHeader = ({ title, icon }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '20px 0 10px' }}>{icon}<strong>{title}</strong></div>
);

const MemberCard = ({ member, onPrint, colors }) => (
  <div style={{ ...styles.listItem, background: colors.card, borderColor: colors.border }}>
    <div style={{ flex: 1 }}><strong>{member.full_name}</strong><br/><small>{member.registration_no}</small></div>
    <button onClick={onPrint} style={{ ...styles.iconBtn, color: colors.primary }}><Printer size={20} /></button>
  </div>
);

const SearchBar = ({ value, onChange, placeholder, colors }) => (
  <div style={{ ...styles.searchBox, background: colors.card, borderColor: colors.border }}>
    <Search size={18} color={colors.textSecondary} />
    <input type="text" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} style={{ ...styles.searchInput, color: colors.text }} />
  </div>
);

const AgentManagement = ({ agents, transactions, onRefresh, showToast, colors }) => {
  const [showAdd, setShowAdd] = useState(false);
  const stats = agents.map(a => ({ ...a, total: transactions.filter(t => t.employee_id === a.id).reduce((s, t) => s + (t.amount || 0), 0) }));

  const handleDelete = async (id) => {
    if(!confirm("Are you sure you want to delete this agent?")) return;
    const { error } = await supabase.from('employees').delete().eq('id', id);
    if(error) showToast(error.message, "error"); else { showToast("Agent deleted", "success"); onRefresh(); }
  };

  const handleEditPassword = async (id) => {
    const newPass = prompt("Enter new password for this agent:");
    if(!newPass) return;
    const { error } = await supabase.from('employees').update({ password: newPass }).eq('id', id);
    if(error) showToast(error.message, "error"); else showToast("Password updated", "success");
  };

  return (
    <div>
      <button onClick={() => setShowAdd(true)} style={{ ...styles.btnPrimary, background: colors.primary, marginBottom: 15 }}>+ New Agent</button>
      {showAdd && <div style={styles.form}><form onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        await supabase.from('employees').insert([{ full_name: fd.get('n'), employee_id_number: fd.get('id'), password: fd.get('p'), ajo_owner_id: 'admin' }]);
        setShowAdd(false); onRefresh();
      }}>
        <input name="n" placeholder="Name" style={styles.input} required />
        <input name="id" placeholder="ID (Username)" style={styles.input} required />
        <input name="p" placeholder="Pass" style={styles.input} required />
        <button type="submit" style={{ ...styles.btnPrimary, background: colors.primary }}>Save</button>
      </form></div>}
      {stats.map(a => (
        <div key={a.id} style={{...styles.listItem, background: colors.card}}>
          <div style={{ flex: 1 }}>
            <strong>{a.full_name}</strong> (ID: {a.employee_id_number})<br/>
            <small style={{color: colors.primary}}>Total: ₦{a.total.toLocaleString()}</small>
          </div>
          <div style={{ display: 'flex', gap: 5 }}>
            <button onClick={() => handleEditPassword(a.id)} style={{...styles.iconBtn, color: colors.primary}} title="Change Password"><Key size={18} /></button>
            <button onClick={() => handleDelete(a.id)} style={{...styles.iconBtn, color: '#ef4444'}} title="Delete Agent"><Trash2 size={18} /></button>
          </div>
        </div>
      ))}
    </div>
  );
};

const PrintCardModal = ({ member, config, onClose, colors }) => {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(JSON.stringify({ id: member.id }))}`;
  return (
    <div style={styles.overlay}>
      <div style={styles.printCard} id="printable-card">
        <div style={{ textAlign: 'center', borderBottom: '1px solid #000', padding: 10 }}><strong>{config.name}</strong></div>
        <div style={{ display: 'flex', padding: 15, gap: 10, alignItems: 'center' }}>
          <img src={qrUrl} alt="QR" style={{ width: 80 }} />
          <div style={{ fontSize: 10 }}>
            <p>NAME: {member.full_name}</p>
            <p>REG: {member.registration_no}</p>
            <p>DAILY: ₦{member.expected_amount}</p>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}><button onClick={() => window.print()} style={{ ...styles.btnPrimary, background: colors.primary }}>Print</button><button onClick={onClose} style={styles.btnSecondary}>Close</button></div>
    </div>
  );
};

const LoginScreen = ({ onLogin, loading, theme }) => {
  const [loginType, setLoginType] = useState('admin');
  const colors = theme === 'dark' ? DARK_THEME : LIGHT_THEME;
  return (
    <div style={{ ...styles.loginPage, background: colors.bg }}>
      <div style={{ ...styles.loginCard, background: colors.card, borderColor: colors.border }}>
        <Landmark size={48} color={colors.primary} />
        <h1 style={{ color: colors.text }}>{CONFIG.business.name}</h1>
        <div style={{ display: 'flex', gap: 10, margin: '20px 0', background: colors.bg, padding: 4, borderRadius: 10 }}>
          <button onClick={() => setLoginType('admin')} style={{ flex: 1, padding: 8, border: 'none', background: loginType === 'admin' ? colors.primary : 'transparent', color: loginType === 'admin' ? '#fff' : colors.textSecondary, borderRadius: 8 }}>Admin</button>
          <button onClick={() => setLoginType('agent')} style={{ flex: 1, padding: 8, border: 'none', background: loginType === 'agent' ? colors.primary : 'transparent', color: loginType === 'agent' ? '#fff' : colors.textSecondary, borderRadius: 8 }}>Agent</button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target); onLogin({ username: fd.get('u'), password: fd.get('p') }); }}>
          <input name="u" placeholder="ID / User" style={styles.input} required />
          <input name="p" type="password" placeholder="Password" style={styles.input} required />
          <button type="submit" disabled={loading} style={{ ...styles.btnPrimary, background: colors.primary }}>{loading ? '...' : 'Sign In'}</button>
        </form>
      </div>
    </div>
  );
};

const LoadingSpinner = () => <div style={{ textAlign: 'center', padding: 40 }}><RefreshCw size={32} style={{ animation: 'spin 1s linear infinite' }} /></div>;
const EmptyState = ({ message, colors }) => <div style={{ textAlign: 'center', padding: 40, color: colors.textSecondary }}><AlertCircle size={48} style={{ opacity: 0.3, marginBottom: 10 }} /><p>{message}</p></div>;
const ToastContainer = ({ toasts }) => <div style={styles.toastContainer}>{toasts.map(t => (<div key={t.id} style={{ ...styles.toast, background: t.type === 'error' ? '#ef4444' : '#10b981' }}>{t.message}</div>))}</div>;

const DARK_THEME = { bg: '#020617', card: '#0f172a', text: '#f8fafc', textSecondary: '#94a3b8', border: '#1e293b', primary: '#3b82f6' };
const LIGHT_THEME = { bg: '#f1f5f9', card: '#ffffff', text: '#0f172a', textSecondary: '#64748b', border: '#e2e8f0', primary: '#2563eb' };

const styles = {
  app: { minHeight: '100vh', transition: '0.3s' },
  header: { padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 },
  brand: { fontSize: 16, fontWeight: 900, margin: 0 },
  subBrand: { fontSize: 10, margin: 0 },
  main: { padding: '20px', paddingBottom: 100, maxWidth: 800, margin: '0 auto' },
  nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '10px 0', zIndex: 10 },
  navBtn: { background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 },
  statCard: { padding: 15, borderRadius: 12, border: '1px solid', textAlign: 'center' },
  heroCard: { padding: 20, borderRadius: 15, color: '#fff' },
  listItem: { display: 'flex', alignItems: 'center', padding: 12, borderRadius: 10, border: '1px solid', marginBottom: 8, gap: 10 },
  memberDetailCard: { padding: 15, borderRadius: 12, border: '1px solid', marginBottom: 10 },
  detailGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
  detailItem: { fontSize: 11, display: 'flex', alignItems: 'center', gap: 5, opacity: 0.8 },
  searchBox: { display: 'flex', alignItems: 'center', padding: '0 12px', borderRadius: 10, border: '1px solid', marginBottom: 15 },
  searchInput: { background: 'none', border: 'none', padding: '10px 5px', width: '100%', outline: 'none' },
  form: { padding: 15, borderRadius: 12, border: '1px solid', marginBottom: 15 },
  input: { width: '100%', padding: 12, marginBottom: 10, borderRadius: 8, border: '1px solid #ddd', boxSizing: 'border-box' },
  btnPrimary: { color: '#fff', border: 'none', borderRadius: 10, fontWeight: '600', padding: '12px', width: '100%', cursor: 'pointer' },
  btnSecondary: { background: '#64748b', color: '#fff', border: 'none', borderRadius: 10, padding: '12px', cursor: 'pointer' },
  iconBtn: { background: 'none', border: 'none', cursor: 'pointer' },
  paymentModal: { padding: 25, borderRadius: 15, border: '1px solid', textAlign: 'center' },
  bigInput: { background: 'none', border: 'none', borderBottom: '2px solid', fontSize: 32, textAlign: 'center', width: '100%', outline: 'none', margin: '15px 0' },
  scannerBox: { position: 'relative', borderRadius: 15, overflow: 'hidden' },
  closeBtn: { position: 'absolute', top: 10, right: 10, background: '#000', color: '#fff', border: 'none', borderRadius: '50%', padding: 8 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  printCard: { width: 250, background: '#fff', color: '#000', borderRadius: 10 },
  toastContainer: { position: 'fixed', top: 20, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, zIndex: 1000 },
  toast: { padding: '10px 20px', borderRadius: 20, color: '#fff', fontSize: 13 },
  loginPage: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  loginCard: { padding: 30, borderRadius: 20, width: '100%', maxWidth: 350, textAlign: 'center', border: '1px solid' },
  fadeIn: { animation: 'fadeIn 0.3s ease' }
};

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @media print { body * { visibility: hidden; } #printable-card, #printable-card * { visibility: visible; } #printable-card { position: fixed; left: 0; top: 0; } }
  `;
  document.head.appendChild(styleSheet);
}
