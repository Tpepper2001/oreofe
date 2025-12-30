import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Scanner } from '@yudiel/react-qr-scanner';
import {
  Users, UserPlus, LayoutDashboard, LogOut, Landmark, X, Camera, 
  RefreshCw, Printer, AlertCircle, Moon, Sun, UserCheck, Search,
  TrendingUp, Calendar, Download, Filter, Eye, EyeOff
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

/* ===================== MAIN APP ===================== */
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
      showToast("Failed to fetch data", "error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [auth, showToast]);

  useEffect(() => {
    if (auth) fetchData();
  }, [auth, fetchData]);

  const handleLogin = async (credentials) => {
    setLoading(true);
    const { username, password } = credentials;
    const normalizedUsername = username.trim().toLowerCase();

    try {
      if (normalizedUsername === CONFIG.admin.username && password === CONFIG.admin.password) {
        setAuth({ id: 'admin', role: 'admin', name: 'Oreofe Admin' });
        showToast("Admin access granted", "success");
        return;
      }

      const { data: agent, error } = await supabase
        .from('employees')
        .select('*')
        .eq('employee_id_number', normalizedUsername)
        .eq('password', password)
        .single();

      if (error || !agent) {
        showToast("Invalid credentials", "error");
        return;
      }

      setAuth({ id: agent.id, role: 'agent', name: agent.full_name, data: agent });
      showToast(`Welcome back, ${agent.full_name}`, "success");
    } catch (error) {
      showToast("Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setAuth(null);
    setView('dashboard');
    setData({ members: [], agents: [], transactions: [] });
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
      <Navigation view={view} role={auth.role} onNavigate={setView} onLogout={handleLogout} colors={colors} />
      <ToastContainer toasts={toasts} />
    </div>
  );
}

/* ===================== PORTALS ===================== */

const AdminPortal = ({ view, data, onRefresh, showToast, colors, config }) => {
  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todayTransactions = data.transactions.filter(t => t.created_at.startsWith(today));
    const todayRevenue = todayTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalRevenue = data.transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    return { todayRevenue, totalRevenue, todayCount: todayTransactions.length };
  }, [data.transactions]);

  if (view === 'dashboard') {
    return (
      <div style={styles.fadeIn}>
        <DashboardStats stats={stats} memberCount={data.members.length} colors={colors} />
        <SectionHeader title="Recent Collections" icon={<TrendingUp size={20} />} />
        <TransactionList transactions={data.transactions.slice(0, 15)} colors={colors} />
      </div>
    );
  }
  if (view === 'members') return <MemberManagement members={data.members} onRefresh={onRefresh} showToast={showToast} colors={colors} config={config} isAdmin={true} />;
  if (view === 'agents') return <AgentManagement agents={data.agents} transactions={data.transactions} onRefresh={onRefresh} showToast={showToast} colors={colors} />;
  return null;
};

const AgentPortal = ({ view, profile, data, onRefresh, showToast, colors, config }) => {
  const stats = useMemo(() => {
    const myTransactions = data.transactions.filter(t => t.employee_id === profile.id);
    const today = new Date().toISOString().slice(0, 10);
    const todayTransactions = myTransactions.filter(t => t.created_at.startsWith(today));
    const todayTotal = todayTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    const todayCommission = todayTotal * config.commissionRate;
    const totalCollected = myTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    return { todayTotal, todayCommission, totalCollected, todayCount: todayTransactions.length };
  }, [data.transactions, profile.id, config.commissionRate]);

  if (view === 'dashboard') {
    return (
      <div style={styles.fadeIn}>
        <AgentDashboard stats={stats} colors={colors} />
        <SectionHeader title="Your Recent Collections" icon={<Calendar size={20} />} />
        <TransactionList transactions={data.transactions.filter(t => t.employee_id === profile.id).slice(0, 10)} colors={colors} />
      </div>
    );
  }
  if (view === 'members') return <MemberManagement members={data.members} onRefresh={onRefresh} showToast={showToast} colors={colors} config={config} isAdmin={false} />;
  if (view === 'scan') return <ScannerView profile={profile} onRefresh={onRefresh} showToast={showToast} colors={colors} />;
  return null;
};

/* ===================== COMPONENTS ===================== */

const Header = ({ business, role, isDark, onToggleTheme, colors }) => (
  <header style={{ ...styles.header, background: colors.card, borderBottom: `1px solid ${colors.border}` }}>
    <div>
      <h1 style={{ ...styles.brand, color: colors.primary }}>{business}</h1>
      <p style={{ ...styles.subBrand, color: colors.textSecondary }}>{role.toUpperCase()} PORTAL</p>
    </div>
    <button onClick={onToggleTheme} style={{ ...styles.iconBtn, color: colors.text }}>{isDark ? <Sun size={22} /> : <Moon size={22} />}</button>
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
  <button onClick={onClick} style={{ ...styles.navBtn, color: active ? colors.primary : colors.textSecondary, fontWeight: active ? 'bold' : 'normal' }}>
    {icon}<span style={{ fontSize: 11 }}>{label}</span>
  </button>
);

const DashboardStats = ({ stats, memberCount, colors }) => (
  <div style={styles.statsGrid}>
    <StatCard title="Today's Revenue" value={`₦${stats.todayRevenue.toLocaleString()}`} subtitle={`${stats.todayCount} collections`} colors={colors} gradient={true} />
    <StatCard title="Active Members" value={memberCount} subtitle="registered" colors={colors} />
    <StatCard title="Total Revenue" value={`₦${stats.totalRevenue.toLocaleString()}`} subtitle="all time" colors={colors} />
  </div>
);

const AgentDashboard = ({ stats, colors }) => (
  <div>
    <div style={{ ...styles.heroCard, background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})` }}>
      <small style={{ opacity: 0.8, fontSize: 11 }}>YOUR COLLECTIONS TODAY</small>
      <h1 style={{ margin: '10px 0', fontSize: 36 }}>₦{stats.todayTotal.toLocaleString()}</h1>
      <div style={{ height: 1, background: 'rgba(255,255,255,0.2)', margin: '15px 0' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
        <span>Commission: ₦{stats.todayCommission.toLocaleString()}</span>
        <span>{stats.todayCount} collections</span>
      </div>
    </div>
    <div style={{ ...styles.statsGrid, marginTop: 15 }}>
      <StatCard title="Total Collected" value={`₦${stats.totalCollected.toLocaleString()}`} subtitle="lifetime" colors={colors} />
    </div>
  </div>
);

const StatCard = ({ title, value, subtitle, colors, gradient }) => (
  <div style={{ ...styles.statCard, background: gradient ? `linear-gradient(135deg, ${colors.cardAlt}, ${colors.card})` : colors.card, borderColor: colors.border }}>
    <p style={{ margin: 0, fontSize: 12, color: colors.textSecondary }}>{title}</p>
    <h2 style={{ margin: '8px 0', fontSize: 28, color: colors.text }}>{value}</h2>
    <small style={{ color: colors.textSecondary, fontSize: 11 }}>{subtitle}</small>
  </div>
);

const SectionHeader = ({ title, icon }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '25px 0 15px' }}>
    {icon}<h3 style={{ margin: 0, fontSize: 16 }}>{title}</h3>
  </div>
);

const TransactionList = ({ transactions, colors }) => (
  <div>
    {transactions.length === 0 ? <EmptyState message="No transactions yet" colors={colors} /> : 
      transactions.map(t => (
        <div key={t.id} style={{ ...styles.listItem, background: colors.card, borderColor: colors.border }}>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: '600' }}>{t.contributor_name}</p>
            <small style={{ color: colors.textSecondary, fontSize: 12 }}>{new Date(t.created_at).toLocaleString()}</small>
          </div>
          <strong style={{ color: colors.primary, fontSize: 16 }}>₦{t.amount.toLocaleString()}</strong>
        </div>
      ))
    }
  </div>
);

const MemberManagement = ({ members, onRefresh, showToast, colors, config, isAdmin }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const filteredMembers = useMemo(() => {
    return members.filter(m =>
      m.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.registration_no || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [members, searchQuery]);

  return (
    <div style={styles.fadeIn}>
      <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search members..." colors={colors} />
      {isAdmin && <button onClick={() => setShowAddForm(true)} style={{ ...styles.btnPrimary, background: colors.primary, marginBottom: 15 }}><UserPlus size={18} /> Add New Member</button>}
      {showAddForm && <AddMemberForm onClose={() => setShowAddForm(false)} onSuccess={() => { setShowAddForm(false); onRefresh(); showToast("Member added successfully", "success"); }} showToast={showToast} colors={colors} />}
      <div>
        {filteredMembers.length === 0 ? <EmptyState message="No members found" colors={colors} /> : 
          filteredMembers.map(member => <MemberCard key={member.id} member={member} onPrint={() => setSelectedMember(member)} colors={colors} />)
        }
      </div>
      {selectedMember && <PrintCardModal member={selectedMember} config={config} onClose={() => setSelectedMember(null)} colors={colors} />}
    </div>
  );
};

const MemberCard = ({ member, onPrint, colors }) => (
  <div style={{ ...styles.listItem, background: colors.card, borderColor: colors.border }}>
    <div style={{ flex: 1 }}>
      <p style={{ margin: 0, fontWeight: '600', fontSize: 15 }}>{member.full_name}</p>
      <small style={{ color: colors.primary, fontSize: 12 }}>{member.registration_no}</small>
      <div style={{ marginTop: 4, fontSize: 12, color: colors.textSecondary }}>
        <div>📞 {member.phone_number}</div>
        <div>💰 ₦{member.expected_amount.toLocaleString()}/daily</div>
      </div>
    </div>
    <button onClick={onPrint} style={{ ...styles.iconBtn, color: colors.primary }}><Printer size={20} /></button>
  </div>
);

const SearchBar = ({ value, onChange, placeholder, colors }) => (
  <div style={{ ...styles.searchBox, background: colors.card, borderColor: colors.border }}>
    <Search size={18} color={colors.textSecondary} />
    <input type="text" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} style={{ ...styles.searchInput, color: colors.text }} />
  </div>
);

/* ===================== MEMBER REGISTRATION FIX ===================== */
const AddMemberForm = ({ onClose, onSuccess, showToast, colors }) => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    // FIXED: renamed registration_number to registration_no to match DB schema
    const memberData = {
      full_name: formData.get('name'),
      registration_no: formData.get('regNumber'), 
      phone_number: formData.get('phone'),
      address: formData.get('address'),
      expected_amount: Number(formData.get('amount')),
      ajo_owner_id: 'admin'
    };

    const { error } = await supabase.from('contributors').insert([memberData]);

    if (error) {
      showToast(error.message || "Failed to add member", "error");
      console.error(error);
    } else {
      onSuccess();
    }
  };

  return (
    <div style={{ ...styles.form, background: colors.card, borderColor: colors.primary }}>
      <h3 style={{ marginTop: 0 }}>New Member Registration</h3>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Full Name" style={{ ...styles.input, background: colors.bg, borderColor: colors.border, color: colors.text }} required />
        <input name="regNumber" placeholder="Registration Number" style={{ ...styles.input, background: colors.bg, borderColor: colors.border, color: colors.text }} required />
        <input name="phone" placeholder="Phone Number" style={{ ...styles.input, background: colors.bg, borderColor: colors.border, color: colors.text }} required />
        <input name="address" placeholder="Address" style={{ ...styles.input, background: colors.bg, borderColor: colors.border, color: colors.text }} required />
        <input name="amount" type="number" placeholder="Daily Contribution (₦)" style={{ ...styles.input, background: colors.bg, borderColor: colors.border, color: colors.text }} required />
        <div style={{ display: 'flex', gap: 10, marginTop: 15 }}>
          <button type="submit" style={{ ...styles.btnPrimary, flex: 1, background: colors.primary }}>Register</button>
          <button type="button" onClick={onClose} style={{ ...styles.btnSecondary, flex: 1, background: colors.cardAlt }}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

const AgentManagement = ({ agents, transactions, onRefresh, showToast, colors }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const agentStats = useMemo(() => {
    return agents.map(agent => {
      const agentTransactions = transactions.filter(t => t.employee_id === agent.id);
      const totalCollected = agentTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
      return { ...agent, totalCollected, transactionCount: agentTransactions.length };
    });
  }, [agents, transactions]);

  const handleAddAgent = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const agentData = { full_name: formData.get('name'), employee_id_number: formData.get('employeeId'), password: formData.get('password'), ajo_owner_id: 'admin' };
    const { error } = await supabase.from('employees').insert([agentData]);
    if (error) { showToast("Failed to register agent", "error"); } 
    else { setShowAddForm(false); onRefresh(); showToast("Agent registered successfully", "success"); }
  };

  return (
    <div style={styles.fadeIn}>
      <button onClick={() => setShowAddForm(true)} style={{ ...styles.btnPrimary, background: colors.primary, marginBottom: 15 }}><UserPlus size={18} /> Register Agent</button>
      {showAddForm && (
        <div style={{ ...styles.form, background: colors.card, borderColor: colors.primary }}>
          <h3 style={{ marginTop: 0 }}>New Agent</h3>
          <form onSubmit={handleAddAgent}>
            <input name="name" placeholder="Full Name" style={{ ...styles.input, background: colors.bg, borderColor: colors.border, color: colors.text }} required />
            <input name="employeeId" placeholder="Login ID" style={{ ...styles.input, background: colors.bg, borderColor: colors.border, color: colors.text }} required />
            <input name="password" type="password" placeholder="Password" style={{ ...styles.input, background: colors.bg, borderColor: colors.border, color: colors.text }} required />
            <div style={{ display: 'flex', gap: 10, marginTop: 15 }}>
              <button type="submit" style={{ ...styles.btnPrimary, flex: 1, background: colors.primary }}>Register</button>
              <button type="button" onClick={() => setShowAddForm(false)} style={{ ...styles.btnSecondary, flex: 1, background: colors.cardAlt }}>Cancel</button>
            </div>
          </form>
        </div>
      )}
      <SectionHeader title="Agent Performance" icon={<TrendingUp size={20} />} />
      {agentStats.map(agent => (
        <div key={agent.id} style={{ ...styles.listItem, background: colors.card, borderColor: colors.border }}>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontWeight: '600' }}>{agent.full_name}</p>
            <small style={{ color: colors.textSecondary }}>ID: {agent.employee_id_number}</small>
            <div style={{ marginTop: 8, fontSize: 13 }}><span style={{ color: colors.primary, fontWeight: '600' }}>₦{agent.totalCollected.toLocaleString()}</span> • {agent.transactionCount} collections</div>
          </div>
        </div>
      ))}
    </div>
  );
};

/* ===================== PAYMENT RECORD FIX ===================== */
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
    if (!amount || Number(amount) <= 0) { showToast("Enter valid amount", "error"); return; }

    // FIXED: renamed registration_number to registration_no
    const transactionData = {
      contributor_id: selectedMember.id,
      contributor_name: selectedMember.full_name,
      registration_no: selectedMember.registration_no, 
      employee_id: profile.id,
      employee_name: profile.full_name,
      amount: Math.floor(Number(amount)),
      ajo_owner_id: selectedMember.ajo_owner_id || 'admin'
    };

    const { error } = await supabase.from('transactions').insert([transactionData]);

    if (error) { showToast(error.message || "Payment failed", "error"); } 
    else { showToast("Payment recorded", "success"); setSelectedMember(null); setAmount(''); onRefresh(); }
  };

  if (selectedMember) {
    return (
      <div style={{ ...styles.paymentModal, background: colors.card, borderColor: colors.primary }}>
        <h2>{selectedMember.full_name}</h2>
        <p>Expected: ₦{selectedMember.expected_amount.toLocaleString()}</p>
        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ ...styles.bigInput, borderColor: colors.primary, color: colors.text }} autoFocus />
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={handleSubmitPayment} style={{ ...styles.btnPrimary, flex: 1, background: colors.primary }}>Confirm</button>
          <button onClick={() => setSelectedMember(null)} style={{ ...styles.btnSecondary, flex: 1, background: colors.cardAlt }}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center' }}>
      {!isScanning ? (
        <button onClick={() => setIsScanning(true)} style={{ ...styles.btnPrimary, background: colors.primary, padding: 50, fontSize: 18 }}><Camera size={40} /><br/>Tap to Scan</button>
      ) : (
        <div style={styles.scannerBox}>
          <Scanner onScan={(results) => { if (results?.[0]) handleScan(results[0].rawValue); }} constraints={{ facingMode: 'environment' }} />
          <button onClick={() => setIsScanning(false)} style={styles.closeBtn}><X size={24} /></button>
        </div>
      )}
    </div>
  );
};

const PrintCardModal = ({ member, config, onClose, colors }) => {
  const qrData = JSON.stringify({ id: member.id });
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
  return (
    <div style={styles.overlay}>
      <div style={styles.printCard} id="printable-card">
        <div style={styles.cardHeader}><h4>{config.name}</h4><p>{config.address}</p></div>
        <div style={styles.cardBody}>
          <img src={qrUrl} alt="QR" style={{ width: 100 }} />
          <div style={styles.cardInfo}>
            <p><strong>NAME:</strong> {member.full_name}</p>
            <p><strong>REG:</strong> {member.registration_no}</p>
            <p><strong>DAILY:</strong> ₦{member.expected_amount}</p>
          </div>
        </div>
        <div style={styles.cardFooter}>MEMBERSHIP ID CARD</div>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        <button onClick={() => window.print()} style={{ ...styles.btnPrimary, background: colors.primary }}>Print</button>
        <button onClick={onClose} style={{ ...styles.btnSecondary, background: colors.cardAlt }}>Close</button>
      </div>
    </div>
  );
};

const LoginScreen = ({ onLogin, loading, theme }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginType, setLoginType] = useState('admin');
  const colors = theme === 'dark' ? DARK_THEME : LIGHT_THEME;
  const handleSubmit = (e) => { e.preventDefault(); const fd = new FormData(e.target); onLogin({ username: fd.get('username'), password: fd.get('password') }); };
  return (
    <div style={{ ...styles.loginPage, background: colors.bg }}>
      <div style={{ ...styles.loginCard, background: colors.card, borderColor: colors.border }}>
        <Landmark size={48} color={colors.primary} />
        <h1 style={{ color: colors.text }}>{CONFIG.business.name}</h1>
        <div style={{ display: 'flex', gap: 10, margin: '20px 0', background: colors.bg, padding: 4, borderRadius: 12 }}>
          <button type="button" onClick={() => setLoginType('admin')} style={{ flex: 1, padding: 10, borderRadius: 8, border: 'none', background: loginType === 'admin' ? colors.primary : 'transparent', color: loginType === 'admin' ? '#fff' : colors.textSecondary }}>Admin</button>
          <button type="button" onClick={() => setLoginType('agent')} style={{ flex: 1, padding: 10, borderRadius: 8, border: 'none', background: loginType === 'agent' ? colors.primary : 'transparent', color: loginType === 'agent' ? '#fff' : colors.textSecondary }}>Agent</button>
        </div>
        <form onSubmit={handleSubmit}>
          <input name="username" placeholder={loginType === 'admin' ? 'Username' : 'ID'} style={{ ...styles.input, background: colors.bg, borderColor: colors.border, color: colors.text }} required />
          <div style={{ position: 'relative' }}>
            <input name="password" type={showPassword ? 'text' : 'password'} placeholder="Password" style={{ ...styles.input, background: colors.bg, borderColor: colors.border, color: colors.text }} required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 10, top: 12, border: 'none', background: 'none' }}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
          </div>
          <button type="submit" disabled={loading} style={{ ...styles.btnPrimary, background: colors.primary }}>{loading ? '...' : 'Sign In'}</button>
        </form>
      </div>
    </div>
  );
};

const LoadingSpinner = () => <div style={{ textAlign: 'center', padding: 40 }}><RefreshCw size={32} style={{ animation: 'spin 1s linear infinite' }} /></div>;
const EmptyState = ({ message, colors }) => <div style={{ textAlign: 'center', padding: 40, color: colors.textSecondary }}><AlertCircle size={48} style={{ opacity: 0.3, marginBottom: 15 }} /><p>{message}</p></div>;
const ToastContainer = ({ toasts }) => <div style={styles.toastContainer}>{toasts.map(t => (<div key={t.id} style={{ ...styles.toast, background: t.type === 'error' ? '#ef4444' : '#10b981' }}>{t.message}</div>))}</div>;

const DARK_THEME = { bg: '#020617', card: '#0f172a', cardAlt: '#1e293b', text: '#f8fafc', textSecondary: '#94a3b8', border: '#1e293b', primary: '#3b82f6', primaryDark: '#1e40af' };
const LIGHT_THEME = { bg: '#f1f5f9', card: '#ffffff', cardAlt: '#e2e8f0', text: '#0f172a', textSecondary: '#64748b', border: '#e2e8f0', primary: '#2563eb', primaryDark: '#1e40af' };

const styles = {
  app: { minHeight: '100vh', transition: '0.3s' },
  header: { padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 },
  brand: { fontSize: 18, fontWeight: 900, margin: 0 },
  subBrand: { fontSize: 10, margin: '2px 0 0' },
  main: { padding: '20px', paddingBottom: 100, maxWidth: 1200, margin: '0 auto' },
  nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '12px 0', zIndex: 10 },
  navBtn: { background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 },
  statCard: { padding: 20, borderRadius: 16, border: '1px solid', textAlign: 'center' },
  heroCard: { padding: 30, borderRadius: 20, color: '#fff' },
  listItem: { display: 'flex', alignItems: 'center', padding: 16, borderRadius: 12, border: '1px solid', marginBottom: 10, gap: 12 },
  searchBox: { display: 'flex', alignItems: 'center', padding: '0 15px', borderRadius: 12, border: '1px solid', marginBottom: 15 },
  searchInput: { background: 'none', border: 'none', padding: '14px 10px', width: '100%' },
  form: { padding: 20, borderRadius: 16, border: '2px solid', marginBottom: 20 },
  input: { width: '100%', padding: 14, marginBottom: 12, border: '1px solid', borderRadius: 10 },
  btnPrimary: { color: '#fff', border: 'none', borderRadius: 12, fontWeight: '600', padding: '12px 20px', width: '100%', cursor: 'pointer' },
  btnSecondary: { color: '#fff', border: 'none', borderRadius: 12, fontWeight: '600', padding: '12px 20px', cursor: 'pointer' },
  iconBtn: { background: 'none', border: 'none', cursor: 'pointer' },
  paymentModal: { padding: 30, borderRadius: 20, border: '2px solid', textAlign: 'center', maxWidth: 400, margin: '0 auto' },
  bigInput: { background: 'none', border: 'none', borderBottom: '3px solid', fontSize: 36, textAlign: 'center', width: '100%', outline: 'none' },
  scannerBox: { position: 'relative', borderRadius: 20, overflow: 'hidden', maxWidth: 500, margin: '0 auto' },
  closeBtn: { position: 'absolute', top: 15, right: 15, background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', padding: 12, borderRadius: '50%' },
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  printCard: { width: 280, background: '#fff', color: '#000', borderRadius: 12, overflow: 'hidden' },
  cardHeader: { padding: 12, borderBottom: '2px solid #000', textAlign: 'center' },
  cardBody: { display: 'flex', padding: 15, gap: 12, alignItems: 'center' },
  cardInfo: { fontSize: 9, flex: 1 },
  cardFooter: { background: '#000', color: '#fff', fontSize: 10, padding: 6, textAlign: 'center' },
  toastContainer: { position: 'fixed', top: 20, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, zIndex: 1000 },
  toast: { padding: '12px 24px', borderRadius: 25, color: '#fff', fontSize: 14, fontWeight: '600' },
  loginPage: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  loginCard: { padding: 40, borderRadius: 24, width: '100%', maxWidth: 380, textAlign: 'center', border: '1px solid' },
  fadeIn: { animation: 'fadeIn 0.4s ease' }
};

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @media print { body * { visibility: hidden; } #printable-card, #printable-card * { visibility: visible; } #printable-card { position: fixed; left: 50%; top: 50%; transform: translate(-50%, -50%); border: none; } }
  `;
  document.head.appendChild(styleSheet);
}
