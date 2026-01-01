import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Scanner } from '@yudiel/react-qr-scanner';
import {
  Users, UserPlus, LayoutDashboard, LogOut, Landmark, X, Camera, 
  RefreshCw, Printer, AlertCircle, Moon, Sun, UserCheck, Search,
  TrendingUp, Calendar, Trash2, Key, MapPin, Phone, Hash, CheckCircle2,
  WifiOff, User, CreditCard, ChevronRight, Info
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

/* ===================== CUSTOM HOOKS ===================== */
const useCountUp = (end, duration = 1000) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);
  return count;
};

export default function App() {
  const [auth, setAuth] = useState(null);
  const [view, setView] = useState('dashboard');
  const [data, setData] = useState({ members: [], agents: [], transactions: [] });
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [toasts, setToasts] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Custom Modal State
  const [modal, setModal] = useState({ show: false, title: '', msg: '', onConfirm: null, isPrompt: false, value: '' });

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const confirmAction = (title, msg, onConfirm, isPrompt = false) => {
    setModal({ show: true, title, msg, onConfirm, isPrompt, value: '' });
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
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

  const isDark = theme === 'dark';
  const colors = isDark ? DARK_THEME : LIGHT_THEME;

  if (!auth) return <LoginScreen onLogin={handleLogin} loading={loading} theme={theme} />;

  return (
    <div style={{ ...styles.app, background: colors.bg, color: colors.text }}>
      {!isOnline && <div style={styles.offlineBanner}><WifiOff size={14} /> You are currently offline</div>}
      
      <Header business={CONFIG.business.name} role={auth.role} isDark={isDark} onToggleTheme={() => setTheme(isDark ? 'light' : 'dark')} colors={colors} />
      
      <main style={styles.main}>
        {loading ? (
          <SkeletonLoader />
        ) : (
          <>
            {auth.role === 'admin' && <AdminPortal view={view} data={data} onRefresh={fetchData} showToast={showToast} colors={colors} config={CONFIG.business} confirmAction={confirmAction} />}
            {auth.role === 'agent' && <AgentPortal view={view} profile={auth.data} data={data} onRefresh={fetchData} showToast={showToast} colors={colors} config={CONFIG.business} />}
          </>
        )}
      </main>

      <Navigation view={view} role={auth.role} onNavigate={setView} onLogout={() => confirmAction("Logout", "Are you sure you want to exit?", () => setAuth(null))} colors={colors} />
      
      <ToastContainer toasts={toasts} />
      
      {modal.show && (
        <ConfirmationModal 
          modal={modal} 
          onClose={() => setModal({ ...modal, show: false })} 
          colors={colors} 
        />
      )}
    </div>
  );
}

/* ===================== PORTALS ===================== */

const AdminPortal = ({ view, data, onRefresh, showToast, colors, config, confirmAction }) => {
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
  if (view === 'agents') return <AgentManagement agents={data.agents} transactions={data.transactions} onRefresh={onRefresh} showToast={showToast} colors={colors} confirmAction={confirmAction} />;
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
      const scanData = JSON.parse(result);
      const { data: member, error } = await supabase.from('contributors').select('*').eq('id', scanData.id).single();
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
      showToast("Payment recorded successfully", "success");
      setSelectedMember(null);
      onRefresh();
    }
  };

  if (selectedMember) return (
    <div style={{ ...styles.paymentModal, background: colors.card, borderColor: colors.primary }}>
      <User size={48} color={colors.primary} />
      <h2 style={{ margin: '10px 0' }}>{selectedMember.full_name}</h2>
      <p style={{ color: colors.textSecondary }}>Expected: ₦{selectedMember.expected_amount}</p>
      <div style={styles.amountInputWrap}>
        <span style={{ fontSize: 24, fontWeight: 'bold', color: colors.primary }}>₦</span>
        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ ...styles.bigInput, color: colors.text }} autoFocus />
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        <button onClick={handleSubmitPayment} style={{ ...styles.btnPrimary, background: colors.primary }}>Confirm Payment</button>
        <button onClick={() => setSelectedMember(null)} style={{ ...styles.btnSecondary, background: colors.cardAlt }}>Cancel</button>
      </div>
    </div>
  );

  return (
    <div style={{ textAlign: 'center' }}>
      {!isScanning ? (
        <button onClick={() => setIsScanning(true)} style={{ ...styles.scanBtnLarge, color: colors.primary, background: colors.card, borderColor: colors.border }}>
          <Camera size={48} />
          <span>Scan Member Card</span>
        </button>
      ) : (
        <div style={styles.scannerBox}>
          <Scanner onScan={(r) => { if (r?.[0]) handleScan(r[0].rawValue); }} />
          <button onClick={() => setIsScanning(false)} style={styles.closeBtn}><X /></button>
        </div>
      )}
    </div>
  );
};

/* ===================== UI COMPONENTS ===================== */

const TransactionList = ({ transactions, colors }) => {
  const isToday = (dateString) => {
    const d = new Date(dateString);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  };

  const getBadge = (amt, expected) => {
    if (amt > expected) return { label: 'EXTRA', color: '#a855f7' };
    if (amt < expected) return { label: 'PARTIAL', color: '#f59e0b' };
    return { label: 'PAID', color: '#10b981' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {transactions.length === 0 ? <EmptyState message="No transactions yet" colors={colors} /> : 
        transactions.map(t => {
          const badge = getBadge(t.amount, t.expected_amount);
          const today = isToday(t.created_at);
          return (
            <div key={t.id} style={{ 
              ...styles.listItem, 
              background: colors.card, 
              borderColor: today ? colors.primary : colors.border,
              borderLeft: today ? `4px solid ${colors.primary}` : `1px solid ${colors.border}`
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: '700' }}>{t.full_name}</p>
                  <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: badge.color + '22', color: badge.color, fontWeight: 'bold' }}>
                    {badge.label}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
                  <User size={10} color={colors.textSecondary} />
                  <small style={{ color: colors.textSecondary, fontSize: 10 }}>Agent: {t.employee_name || 'Admin'}</small>
                  <span style={{ color: colors.border }}>•</span>
                  <small style={{ color: colors.textSecondary, fontSize: 10 }}>{new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <strong style={{ color: today ? colors.primary : colors.text, fontSize: 16 }}>₦{t.amount?.toLocaleString()}</strong>
              </div>
            </div>
          );
        })
      }
    </div>
  );
};

const MemberManagement = ({ members, onRefresh, showToast, colors, config, isAdmin }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const filtered = members.filter(m => m.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || (m.registration_no || '').toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div style={styles.fadeIn}>
      <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search members..." colors={colors} />
      {isAdmin && <button onClick={() => setShowAddForm(true)} style={{ ...styles.btnPrimary, background: colors.primary, marginBottom: 15, borderRadius: 12 }}><UserPlus size={18} /> Add Member</button>}
      {showAddForm && <AddMemberForm onClose={() => setShowAddForm(false)} onSuccess={() => { setShowAddForm(false); onRefresh(); }} showToast={showToast} colors={colors} />}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(member => <MemberCard key={member.id} member={member} onPrint={() => setSelectedMember(member)} colors={colors} />)}
      </div>
      {selectedMember && <PrintCardModal member={selectedMember} config={config} onClose={() => setSelectedMember(null)} colors={colors} />}
    </div>
  );
};

const MemberCard = ({ member, onPrint, colors }) => (
  <div style={{ ...styles.listItem, background: colors.card, borderColor: colors.border, padding: '12px 16px' }}>
    <div style={{ width: 40, height: 40, borderRadius: 20, background: colors.primary + '22', color: colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
      {member.full_name.charAt(0)}
    </div>
    <div style={{ flex: 1 }}>
      <strong style={{ fontSize: 15 }}>{member.full_name}</strong>
      <div style={{ display: 'flex', gap: 10, color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>
        <span>ID: {member.registration_no}</span>
        <span>•</span>
        <span>₦{member.expected_amount}/day</span>
      </div>
    </div>
    <button onClick={onPrint} style={{ ...styles.iconBtn, color: colors.primary, padding: 8 }}><Printer size={20} /></button>
  </div>
);

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
    if (error) showToast(error.message, "error"); else {
      showToast("Member added successfully", "success");
      onSuccess();
    }
  };
  return (
    <div style={{ ...styles.form, background: colors.card, borderColor: colors.primary }}>
      <h3 style={{ margin: '0 0 15px 0' }}>New Member</h3>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Full Name" style={{...styles.input, borderColor: colors.border, color: colors.text, background: colors.bg}} required />
        <input name="regNumber" placeholder="Reg No" style={{...styles.input, borderColor: colors.border, color: colors.text, background: colors.bg}} required />
        <input name="phone" placeholder="Phone Number" style={{...styles.input, borderColor: colors.border, color: colors.text, background: colors.bg}} required />
        <input name="address" placeholder="Residential Address" style={{...styles.input, borderColor: colors.border, color: colors.text, background: colors.bg}} required />
        <input name="amount" type="number" placeholder="Daily Amount (₦)" style={{...styles.input, borderColor: colors.border, color: colors.text, background: colors.bg}} required />
        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
          <button type="submit" style={{ ...styles.btnPrimary, background: colors.primary }}>Save Member</button>
          <button type="button" onClick={onClose} style={{...styles.btnSecondary, background: colors.border}}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

const Header = ({ business, role, isDark, onToggleTheme, colors }) => (
  <header style={{ ...styles.header, background: colors.card, borderBottom: `1px solid ${colors.border}` }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ background: colors.primary, padding: 6, borderRadius: 8 }}><Landmark size={20} color="#fff" /></div>
      <div><h1 style={{ ...styles.brand, color: colors.text }}>{business}</h1><p style={{...styles.subBrand, color: colors.primary}}>{role.toUpperCase()} PANEL</p></div>
    </div>
    <button onClick={onToggleTheme} style={{...styles.iconBtn, background: colors.bg, borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      {isDark ? <Sun size={18} color={colors.primary} /> : <Moon size={18} color={colors.primary} />}
    </button>
  </header>
);

const Navigation = ({ view, role, onNavigate, onLogout, colors }) => (
  <nav className="bottom-nav" style={{ ...styles.nav, background: colors.card, borderTop: `1px solid ${colors.border}` }}>
    <NavButton active={view === 'dashboard'} icon={<LayoutDashboard size={22} />} label="Home" onClick={() => onNavigate('dashboard')} colors={colors} />
    <NavButton active={view === 'members'} icon={<Users size={22} />} label="Members" onClick={() => onNavigate('members')} colors={colors} />
    {role === 'admin' && <NavButton active={view === 'agents'} icon={<UserCheck size={22} />} label="Agents" onClick={() => onNavigate('agents')} colors={colors} />}
    {role === 'agent' && <NavButton active={view === 'scan'} icon={<Camera size={22} />} label="Scan QR" onClick={() => onNavigate('scan')} colors={colors} />}
    <NavButton active={false} icon={<LogOut size={22} />} label="Exit" onClick={onLogout} colors={colors} />
  </nav>
);

const NavButton = ({ active, icon, label, onClick, colors }) => (
  <button onClick={onClick} style={{ ...styles.navBtn, color: active ? colors.primary : colors.textSecondary }}>
    <div style={{ position: 'relative' }}>
      {icon}
      {active && <div style={{ position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)', width: 4, height: 4, borderRadius: '50%', background: colors.primary }} />}
    </div>
    <span style={{ fontSize: 10, marginTop: 4, fontWeight: active ? 'bold' : 'normal' }}>{label}</span>
  </button>
);

const DashboardStats = ({ stats, memberCount, colors }) => {
  const animatedToday = useCountUp(stats.todayRevenue);
  const animatedTotal = useCountUp(stats.totalRevenue);

  return (
    <div style={styles.statsGrid}>
      <StatCard title="Today's Revenue" value={`₦${animatedToday.toLocaleString()}`} icon={<TrendingUp size={14} />} colors={colors} highlight />
      <StatCard title="Active Members" value={memberCount} icon={<Users size={14} />} colors={colors} />
      <StatCard title="Total Collected" value={`₦${animatedTotal.toLocaleString()}`} icon={<CreditCard size={14} />} colors={colors} />
    </div>
  );
};

const AgentDashboard = ({ stats, colors }) => {
  const animatedTotal = useCountUp(stats.todayTotal);
  return (
    <div style={{ ...styles.heroCard, background: `linear-gradient(135deg, ${colors.primary}, #1d4ed8)` }}>
      <div style={{ opacity: 0.9, fontSize: 12, fontWeight: 'bold', letterSpacing: 1 }}>COLLECTED TODAY</div>
      <h1 style={{ fontSize: 36, margin: '10px 0', fontWeight: '800' }}>₦{animatedTotal.toLocaleString()}</h1>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 15, background: 'rgba(255,255,255,0.1)', padding: '10px 15px', borderRadius: 12 }}>
        <div>
          <small style={{ opacity: 0.8, display: 'block', fontSize: 10 }}>COMMISSION</small>
          <strong style={{ fontSize: 16 }}>₦{stats.todayCommission.toLocaleString()}</strong>
        </div>
        <div style={{ textAlign: 'right' }}>
          <small style={{ opacity: 0.8, display: 'block', fontSize: 10 }}>ENTRIES</small>
          <strong style={{ fontSize: 16 }}>{stats.todayCount}</strong>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, colors, highlight }) => (
  <div style={{ ...styles.statCard, background: colors.card, borderColor: highlight ? colors.primary : colors.border }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, color: colors.textSecondary, marginBottom: 5 }}>
      {icon} <small style={{ fontWeight: '600', fontSize: 10, textTransform: 'uppercase' }}>{title}</small>
    </div>
    <h2 style={{ margin: 0, fontSize: 18, color: highlight ? colors.primary : colors.text }}>{value}</h2>
  </div>
);

const SectionHeader = ({ title, icon }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '25px 0 15px', paddingLeft: 5 }}>
    <div style={{ color: '#3b82f6' }}>{icon}</div>
    <strong style={{ fontSize: 16 }}>{title}</strong>
  </div>
);

const SearchBar = ({ value, onChange, placeholder, colors }) => (
  <div style={{ ...styles.searchBox, background: colors.card, borderColor: colors.border }}>
    <Search size={18} color={colors.textSecondary} />
    <input type="text" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} style={{ ...styles.searchInput, color: colors.text }} />
  </div>
);

const AgentManagement = ({ agents, transactions, onRefresh, showToast, colors, confirmAction }) => {
  const [showAdd, setShowAdd] = useState(false);
  const stats = agents.map(a => ({ ...a, total: transactions.filter(t => t.employee_id === a.id).reduce((s, t) => s + (t.amount || 0), 0) }));

  const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const handleDelete = (id) => {
    confirmAction("Delete Agent", "This will permanently remove this agent. Continue?", async () => {
      const { error } = await supabase.from('employees').delete().eq('id', id);
      if(error) showToast(error.message, "error"); else { showToast("Agent deleted", "success"); onRefresh(); }
    });
  };

  const handleEditPassword = (id) => {
    confirmAction("Change Password", "Enter new password for agent:", async (newPass) => {
      if(!newPass) return;
      const { error } = await supabase.from('employees').update({ password: newPass }).eq('id', id);
      if(error) showToast(error.message, "error"); else showToast("Password updated", "success");
    }, true);
  };

  return (
    <div>
      <button onClick={() => setShowAdd(true)} style={{ ...styles.btnPrimary, background: colors.primary, marginBottom: 15, borderRadius: 12 }}>+ Register New Agent</button>
      {showAdd && <div style={{...styles.form, background: colors.card}}><form onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const { error } = await supabase.from('employees').insert([{ full_name: fd.get('n'), employee_id_number: fd.get('id'), password: fd.get('p'), ajo_owner_id: 'admin' }]);
        if(error) showToast(error.message, "error");
        else { showToast("Agent created", "success"); setShowAdd(false); onRefresh(); }
      }}>
        <input name="n" placeholder="Full Name" style={{...styles.input, background: colors.bg, color: colors.text, borderColor: colors.border}} required />
        <input name="id" placeholder="Username / ID" style={{...styles.input, background: colors.bg, color: colors.text, borderColor: colors.border}} required />
        <input name="p" type="password" placeholder="Login Password" style={{...styles.input, background: colors.bg, color: colors.text, borderColor: colors.border}} required />
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="submit" style={{ ...styles.btnPrimary, background: colors.primary }}>Save Agent</button>
          <button type="button" onClick={() => setShowAdd(false)} style={styles.btnSecondary}>Cancel</button>
        </div>
      </form></div>}
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {stats.map(a => (
          <div key={a.id} className="agent-item" style={{...styles.listItem, background: colors.card, borderColor: colors.border, padding: 15}}>
            <div style={{ width: 45, height: 45, borderRadius: 12, background: `linear-gradient(45deg, ${colors.primary}, #6366f1)`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 18 }}>
              {getInitials(a.full_name)}
            </div>
            <div style={{ flex: 1 }}>
              <strong style={{ fontSize: 16 }}>{a.full_name}</strong>
              <div style={{ color: colors.textSecondary, fontSize: 12 }}>ID: {a.employee_id_number}</div>
              <div style={{ color: colors.primary, fontWeight: 'bold', fontSize: 13, marginTop: 4 }}>Total: ₦{a.total.toLocaleString()}</div>
            </div>
            <div className="swipe-actions" style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => handleEditPassword(a.id)} style={{...styles.iconBtn, background: colors.bg, color: colors.primary, width: 36, height: 36, borderRadius: 8}}><Key size={18} /></button>
              <button onClick={() => handleDelete(a.id)} style={{...styles.iconBtn, background: colors.bg, color: '#ef4444', width: 36, height: 36, borderRadius: 8}}><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PrintCardModal = ({ member, config, onClose, colors }) => {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(JSON.stringify({ id: member.id }))}`;
  
  return (
    <div style={styles.overlay}>
      <div style={styles.printContainer}>
        <div style={styles.printCard} id="printable-card">
          <div style={styles.cardWatermark}>{config.name}</div>
          <div style={styles.cardHeader}>
            <Landmark size={20} />
            <div style={{ fontWeight: '900', fontSize: 14 }}>{config.name}</div>
          </div>
          
          <div style={styles.cardBody}>
            <div style={styles.qrWrapper}>
              <img src={qrUrl} alt="QR" style={{ width: 100, height: 100 }} />
            </div>
            <div style={styles.cardInfo}>
              <div style={styles.infoRow}><label>NAME</label><strong>{member.full_name}</strong></div>
              <div style={styles.infoRow}><label>REG NO</label><strong>{member.registration_no}</strong></div>
              <div style={styles.infoRow}><label>DAILY</label><strong>₦{member.expected_amount}</strong></div>
            </div>
          </div>
          
          <div style={styles.cardFooter}>
            Official Membership Identification Card
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: 12, marginTop: 25, width: '100%' }}>
          <button onClick={() => window.print()} style={{ ...styles.btnPrimary, background: colors.primary, flex: 2 }}><Printer size={18} /> Print Now</button>
          <button onClick={onClose} style={{ ...styles.btnSecondary, background: 'rgba(255,255,255,0.1)', flex: 1 }}>Close</button>
        </div>
      </div>
    </div>
  );
};

const ConfirmationModal = ({ modal, onClose, colors }) => {
  const [input, setInput] = useState('');
  return (
    <div style={styles.overlay}>
      <div style={{ ...styles.modalBox, background: colors.card, borderColor: colors.border }}>
        <div style={{ color: colors.primary, marginBottom: 15 }}><Info size={32} /></div>
        <h3 style={{ margin: '0 0 10px 0' }}>{modal.title}</h3>
        <p style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 20 }}>{modal.msg}</p>
        
        {modal.isPrompt && (
          <input 
            autoFocus
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            placeholder="Type here..."
            style={{ ...styles.input, background: colors.bg, color: colors.text, borderColor: colors.border, marginBottom: 20 }}
          />
        )}
        
        <div style={{ display: 'flex', gap: 10 }}>
          <button 
            style={{ ...styles.btnPrimary, background: colors.primary }} 
            onClick={() => { modal.onConfirm(modal.isPrompt ? input : true); onClose(); }}
          >
            Confirm
          </button>
          <button style={styles.btnSecondary} onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

const ToastContainer = ({ toasts }) => (
  <div style={styles.toastContainer}>
    {toasts.map(t => (
      <div key={t.id} style={{ 
        ...styles.toast, 
        background: t.type === 'error' ? '#fee2e2' : t.type === 'success' ? '#dcfce7' : '#e0f2fe',
        color: t.type === 'error' ? '#991b1b' : t.type === 'success' ? '#166534' : '#075985',
        border: `1px solid ${t.type === 'error' ? '#f87171' : t.type === 'success' ? '#4ade80' : '#38bdf8'}`
      }}>
        {t.type === 'error' ? <AlertCircle size={16} /> : t.type === 'success' ? <CheckCircle2 size={16} /> : <Info size={16} />}
        {t.message}
      </div>
    ))}
  </div>
);

const SkeletonLoader = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
    <div style={styles.skeletonGrid}>
      <div className="skeleton" style={{ height: 80, borderRadius: 12 }}></div>
      <div className="skeleton" style={{ height: 80, borderRadius: 12 }}></div>
      <div className="skeleton" style={{ height: 80, borderRadius: 12 }}></div>
    </div>
    <div className="skeleton" style={{ height: 40, borderRadius: 10, width: '60%' }}></div>
    <div className="skeleton" style={{ height: 60, borderRadius: 12 }}></div>
    <div className="skeleton" style={{ height: 60, borderRadius: 12 }}></div>
    <div className="skeleton" style={{ height: 60, borderRadius: 12 }}></div>
  </div>
);

const LoginScreen = ({ onLogin, loading, theme }) => {
  const [loginType, setLoginType] = useState('admin');
  const colors = theme === 'dark' ? DARK_THEME : LIGHT_THEME;
  return (
    <div style={{ ...styles.loginPage, background: colors.bg }}>
      <div style={{ ...styles.loginCard, background: colors.card, borderColor: colors.border }}>
        <div style={{ width: 60, height: 60, background: colors.primary, borderRadius: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <Landmark size={32} color="#fff" />
        </div>
        <h1 style={{ color: colors.text, fontSize: 24, marginBottom: 5 }}>{CONFIG.business.name}</h1>
        <p style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 30 }}>Daily Contribution Management</p>
        
        <div style={{ display: 'flex', gap: 10, marginBottom: 25, background: colors.bg, padding: 4, borderRadius: 12 }}>
          <button onClick={() => setLoginType('admin')} style={{ flex: 1, padding: '10px', border: 'none', background: loginType === 'admin' ? colors.primary : 'transparent', color: loginType === 'admin' ? '#fff' : colors.textSecondary, borderRadius: 10, fontWeight: 'bold', transition: '0.2s' }}>Admin</button>
          <button onClick={() => setLoginType('agent')} style={{ flex: 1, padding: '10px', border: 'none', background: loginType === 'agent' ? colors.primary : 'transparent', color: loginType === 'agent' ? '#fff' : colors.textSecondary, borderRadius: 10, fontWeight: 'bold', transition: '0.2s' }}>Agent</button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target); onLogin({ username: fd.get('u'), password: fd.get('p') }); }}>
          <div style={{ textAlign: 'left', marginBottom: 15 }}>
            <label style={{ fontSize: 12, color: colors.textSecondary, marginLeft: 5 }}>{loginType === 'admin' ? 'Username' : 'Agent ID'}</label>
            <input name="u" style={{...styles.input, background: colors.bg, color: colors.text, borderColor: colors.border, marginTop: 5}} placeholder="Enter ID" required />
          </div>
          <div style={{ textAlign: 'left', marginBottom: 25 }}>
            <label style={{ fontSize: 12, color: colors.textSecondary, marginLeft: 5 }}>Password</label>
            <input name="p" type="password" style={{...styles.input, background: colors.bg, color: colors.text, borderColor: colors.border, marginTop: 5}} placeholder="••••••••" required />
          </div>
          <button type="submit" disabled={loading} style={{ ...styles.btnPrimary, background: colors.primary, height: 50, fontSize: 16 }}>
            {loading ? <RefreshCw className="spin" /> : 'Sign In to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
};

const EmptyState = ({ message, colors }) => <div style={{ textAlign: 'center', padding: '60px 20px', color: colors.textSecondary, background: colors.card, borderRadius: 15, border: `1px dashed ${colors.border}` }}><AlertCircle size={40} style={{ opacity: 0.2, marginBottom: 15 }} /><p style={{ margin: 0 }}>{message}</p></div>;

/* ===================== THEMES & STYLES ===================== */
const DARK_THEME = { bg: '#020617', card: '#0f172a', text: '#f8fafc', textSecondary: '#94a3b8', border: '#1e293b', primary: '#3b82f6', cardAlt: '#1e293b' };
const LIGHT_THEME = { bg: '#f8fafc', card: '#ffffff', text: '#0f172a', textSecondary: '#64748b', border: '#e2e8f0', primary: '#2563eb', cardAlt: '#f1f5f9' };

const styles = {
  app: { minHeight: '100vh', transition: '0.3s', paddingBottom: '20px' },
  header: { padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(10px)' },
  brand: { fontSize: 14, fontWeight: '900', margin: 0, letterSpacing: -0.5 },
  subBrand: { fontSize: 9, margin: 0, fontWeight: 'bold' },
  main: { padding: '20px', maxWidth: 600, margin: '0 auto' },
  nav: { position: 'relative', display: 'flex', justifyContent: 'space-around', padding: '12px 0', zIndex: 100 },
  navBtn: { background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', flex: 1 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 },
  skeletonGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 },
  statCard: { padding: '15px 10px', borderRadius: 16, border: '1px solid', textAlign: 'center', transition: '0.2s' },
  heroCard: { padding: '25px 20px', borderRadius: 20, color: '#fff', marginBottom: 20, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' },
  listItem: { display: 'flex', alignItems: 'center', padding: '12px', borderRadius: 14, border: '1px solid', gap: 12, transition: '0.2s' },
  memberDetailCard: { padding: 15, borderRadius: 16, border: '1px solid', marginBottom: 12 },
  detailGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  detailItem: { fontSize: 11, display: 'flex', alignItems: 'center', gap: 6, opacity: 0.8 },
  searchBox: { display: 'flex', alignItems: 'center', padding: '0 15px', borderRadius: 14, border: '1px solid', marginBottom: 15 },
  searchInput: { background: 'none', border: 'none', padding: '12px 5px', width: '100%', outline: 'none', fontSize: 14 },
  form: { padding: 20, borderRadius: 16, border: '1px solid', marginBottom: 20 },
  input: { width: '100%', padding: '12px 15px', borderRadius: 10, border: '1px solid', boxSizing: 'border-box', outline: 'none', fontSize: 14 },
  btnPrimary: { color: '#fff', border: 'none', borderRadius: 10, fontWeight: '700', padding: '12px 20px', width: '100%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 },
  btnSecondary: { color: '#64748b', border: 'none', borderRadius: 10, padding: '12px 20px', cursor: 'pointer', width: '100%', fontWeight: '600' },
  iconBtn: { background: 'none', border: 'none', cursor: 'pointer' },
  paymentModal: { padding: 30, borderRadius: 24, border: '2px solid', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  amountInputWrap: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, borderBottom: '2px solid #3b82f6', margin: '20px 0', width: '80%' },
  bigInput: { background: 'none', border: 'none', fontSize: 42, textAlign: 'center', width: '100%', outline: 'none', fontWeight: 'bold' },
  scannerBox: { position: 'relative', borderRadius: 24, overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' },
  closeBtn: { position: 'absolute', top: 15, right: 15, background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', padding: 8, zIndex: 10, cursor: 'pointer' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 },
  printContainer: { width: '100%', maxWidth: 350 },
  printCard: { 
    width: '100%', background: '#fff', color: '#000', borderRadius: 15, position: 'relative', overflow: 'hidden',
    border: '8px solid #000', boxSizing: 'border-box', padding: 15
  },
  cardWatermark: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-45deg)', fontSize: 40, fontWeight: '900', opacity: 0.05, whiteSpace: 'nowrap', pointerEvents: 'none' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: 8, borderBottom: '2px solid #000', paddingBottom: 10, marginBottom: 15 },
  cardBody: { display: 'flex', gap: 15, alignItems: 'center' },
  qrWrapper: { border: '1px solid #eee', padding: 5, background: '#fff' },
  cardInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: 8 },
  infoRow: { display: 'flex', flexDirection: 'column', borderBottom: '1px solid #eee' },
  cardFooter: { marginTop: 15, textAlign: 'center', fontSize: 8, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, borderTop: '1px solid #000', paddingTop: 8 },
  toastContainer: { position: 'fixed', top: 80, left: 20, right: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, zIndex: 2000 },
  toast: { padding: '12px 20px', borderRadius: 12, fontSize: 13, fontWeight: '600', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', minWidth: 200, animation: 'toastIn 0.3s ease' },
  loginPage: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  loginCard: { padding: '40px 30px', borderRadius: 24, width: '100%', maxWidth: 400, textAlign: 'center', border: '1px solid', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.2)' },
  modalBox: { padding: 30, borderRadius: 24, border: '1px solid', width: '100%', maxWidth: 350, textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' },
  offlineBanner: { background: '#ef4444', color: '#fff', textAlign: 'center', padding: '6px', fontSize: 11, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 },
  scanBtnLarge: { width: '100%', padding: '60px 20px', borderRadius: 24, border: '2px dashed', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 15, fontWeight: 'bold' },
  fadeIn: { animation: 'fadeIn 0.4s ease-out' }
};

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes toastIn { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 0.3; } 100% { opacity: 0.6; } }
    .skeleton { background: #cbd5e1; animation: pulse 1.5s infinite ease-in-out; }
    .spin { animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    
    /* Mobile-only Sticky Nav */
    @media (max-width: 768px) {
      .bottom-nav {
        position: fixed !important;
        bottom: 0;
        left: 0;
        right: 0;
        padding-bottom: env(safe-area-inset-bottom);
      }
    }
    
    @media print { 
      body * { visibility: hidden; } 
      #printable-card, #printable-card * { visibility: visible; } 
      #printable-card { position: fixed; left: 50%; top: 50%; transform: translate(-50%, -50%); border: 4px solid #000; } 
    }
    
    /* Swipe action simulation style */
    .agent-item:hover .swipe-actions { transform: translateX(0); opacity: 1; }
    .swipe-actions { transition: 0.3s ease; }
  `;
  document.head.appendChild(styleSheet);
}
