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
      // Check admin credentials
      if (normalizedUsername === CONFIG.admin.username && password === CONFIG.admin.password) {
        setAuth({ id: 'admin', role: 'admin', name: 'Oreofe Admin' });
        showToast("Admin access granted", "success");
        return;
      }

      // Check agent credentials
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
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setAuth(null);
    setView('dashboard');
    setData({ members: [], agents: [], transactions: [] });
  };

  if (!auth) {
    return <LoginScreen onLogin={handleLogin} loading={loading} theme={theme} />;
  }

  const isDark = theme === 'dark';
  const colors = isDark ? DARK_THEME : LIGHT_THEME;

  return (
    <div style={{ ...styles.app, background: colors.bg, color: colors.text }}>
      <Header 
        business={CONFIG.business.name}
        role={auth.role}
        isDark={isDark}
        onToggleTheme={() => setTheme(isDark ? 'light' : 'dark')}
        colors={colors}
      />

      <main style={styles.main}>
        {loading && <LoadingSpinner />}
        
        {!loading && auth.role === 'admin' && (
          <AdminPortal
            view={view}
            data={data}
            onRefresh={fetchData}
            showToast={showToast}
            colors={colors}
            config={CONFIG.business}
          />
        )}

        {!loading && auth.role === 'agent' && (
          <AgentPortal
            view={view}
            profile={auth.data}
            data={data}
            onRefresh={fetchData}
            showToast={showToast}
            colors={colors}
            config={CONFIG.business}
          />
        )}
      </main>

      <Navigation
        view={view}
        role={auth.role}
        onNavigate={setView}
        onLogout={handleLogout}
        colors={colors}
      />

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

  if (view === 'members') {
    return (
      <MemberManagement
        members={data.members}
        onRefresh={onRefresh}
        showToast={showToast}
        colors={colors}
        config={config}
        isAdmin={true}
      />
    );
  }

  if (view === 'agents') {
    return (
      <AgentManagement
        agents={data.agents}
        transactions={data.transactions}
        onRefresh={onRefresh}
        showToast={showToast}
        colors={colors}
      />
    );
  }

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
        <TransactionList 
          transactions={data.transactions.filter(t => t.employee_id === profile.id).slice(0, 10)} 
          colors={colors} 
        />
      </div>
    );
  }

  if (view === 'members') {
    return (
      <MemberManagement
        members={data.members}
        onRefresh={onRefresh}
        showToast={showToast}
        colors={colors}
        config={config}
        isAdmin={false}
      />
    );
  }

  if (view === 'scan') {
    return (
      <ScannerView
        profile={profile}
        onRefresh={onRefresh}
        showToast={showToast}
        colors={colors}
      />
    );
  }

  return null;
};

/* ===================== COMPONENTS ===================== */

const Header = ({ business, role, isDark, onToggleTheme, colors }) => (
  <header style={{ ...styles.header, background: colors.card, borderBottom: `1px solid ${colors.border}` }}>
    <div>
      <h1 style={{ ...styles.brand, color: colors.primary }}>{business}</h1>
      <p style={{ ...styles.subBrand, color: colors.textSecondary }}>
        {role.toUpperCase()} PORTAL
      </p>
    </div>
    <button onClick={onToggleTheme} style={{ ...styles.iconBtn, color: colors.text }} aria-label="Toggle theme">
      {isDark ? <Sun size={22} /> : <Moon size={22} />}
    </button>
  </header>
);

const Navigation = ({ view, role, onNavigate, onLogout, colors }) => (
  <nav style={{ ...styles.nav, background: colors.card, borderTop: `1px solid ${colors.border}` }}>
    <NavButton
      active={view === 'dashboard'}
      icon={<LayoutDashboard size={20} />}
      label="Home"
      onClick={() => onNavigate('dashboard')}
      colors={colors}
    />
    <NavButton
      active={view === 'members'}
      icon={<Users size={20} />}
      label="Members"
      onClick={() => onNavigate('members')}
      colors={colors}
    />
    {role === 'admin' && (
      <NavButton
        active={view === 'agents'}
        icon={<UserCheck size={20} />}
        label="Agents"
        onClick={() => onNavigate('agents')}
        colors={colors}
      />
    )}
    {role === 'agent' && (
      <NavButton
        active={view === 'scan'}
        icon={<Camera size={20} />}
        label="Scan"
        onClick={() => onNavigate('scan')}
        colors={colors}
      />
    )}
    <NavButton
      active={false}
      icon={<LogOut size={20} />}
      label="Exit"
      onClick={onLogout}
      colors={colors}
    />
  </nav>
);

const NavButton = ({ active, icon, label, onClick, colors }) => (
  <button
    onClick={onClick}
    style={{
      ...styles.navBtn,
      color: active ? colors.primary : colors.textSecondary,
      fontWeight: active ? 'bold' : 'normal'
    }}
    aria-label={label}
  >
    {icon}
    <span style={{ fontSize: 11 }}>{label}</span>
  </button>
);

const DashboardStats = ({ stats, memberCount, colors }) => (
  <div style={styles.statsGrid}>
    <StatCard
      title="Today's Revenue"
      value={`₦${stats.todayRevenue.toLocaleString()}`}
      subtitle={`${stats.todayCount} collections`}
      colors={colors}
      gradient={true}
    />
    <StatCard
      title="Active Members"
      value={memberCount}
      subtitle="registered"
      colors={colors}
    />
    <StatCard
      title="Total Revenue"
      value={`₦${stats.totalRevenue.toLocaleString()}`}
      subtitle="all time"
      colors={colors}
    />
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
      <StatCard
        title="Total Collected"
        value={`₦${stats.totalCollected.toLocaleString()}`}
        subtitle="lifetime"
        colors={colors}
      />
    </div>
  </div>
);

const StatCard = ({ title, value, subtitle, colors, gradient }) => (
  <div style={{
    ...styles.statCard,
    background: gradient ? `linear-gradient(135deg, ${colors.cardAlt}, ${colors.card})` : colors.card,
    borderColor: colors.border
  }}>
    <p style={{ margin: 0, fontSize: 12, color: colors.textSecondary }}>{title}</p>
    <h2 style={{ margin: '8px 0', fontSize: 28, color: colors.text }}>{value}</h2>
    <small style={{ color: colors.textSecondary, fontSize: 11 }}>{subtitle}</small>
  </div>
);

const SectionHeader = ({ title, icon }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '25px 0 15px' }}>
    {icon}
    <h3 style={{ margin: 0, fontSize: 16 }}>{title}</h3>
  </div>
);

const TransactionList = ({ transactions, colors }) => (
  <div>
    {transactions.length === 0 ? (
      <EmptyState message="No transactions yet" colors={colors} />
    ) : (
      transactions.map(t => (
        <div key={t.id} style={{ ...styles.listItem, background: colors.card, borderColor: colors.border }}>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: '600' }}>{t.contributor_name}</p>
            <small style={{ color: colors.textSecondary, fontSize: 12 }}>
              {new Date(t.created_at).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </small>
          </div>
          <strong style={{ color: colors.primary, fontSize: 16 }}>₦{t.amount.toLocaleString()}</strong>
        </div>
      ))
    )}
  </div>
);

const MemberManagement = ({ members, onRefresh, showToast, colors, config, isAdmin }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const filteredMembers = useMemo(() => {
    return members.filter(m =>
      m.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.registration_number.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [members, searchQuery]);

  return (
    <div style={styles.fadeIn}>
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search members..."
        colors={colors}
      />

      {isAdmin && (
        <button
          onClick={() => setShowAddForm(true)}
          style={{ ...styles.btnPrimary, background: colors.primary, marginBottom: 15 }}
        >
          <UserPlus size={18} /> Add New Member
        </button>
      )}

      {showAddForm && (
        <AddMemberForm
          onClose={() => setShowAddForm(false)}
          onSuccess={() => {
            setShowAddForm(false);
            onRefresh();
            showToast("Member added successfully", "success");
          }}
          showToast={showToast}
          colors={colors}
        />
      )}

      <div>
        {filteredMembers.length === 0 ? (
          <EmptyState message="No members found" colors={colors} />
        ) : (
          filteredMembers.map(member => (
            <MemberCard
              key={member.id}
              member={member}
              onPrint={() => setSelectedMember(member)}
              colors={colors}
            />
          ))
        )}
      </div>

      {selectedMember && (
        <PrintCardModal
          member={selectedMember}
          config={config}
          onClose={() => setSelectedMember(null)}
          colors={colors}
        />
      )}
    </div>
  );
};

const MemberCard = ({ member, onPrint, colors }) => (
  <div style={{ ...styles.listItem, background: colors.card, borderColor: colors.border }}>
    <div style={{ flex: 1 }}>
      <p style={{ margin: 0, fontWeight: '600', fontSize: 15 }}>{member.full_name}</p>
      <small style={{ color: colors.primary, fontSize: 12 }}>{member.registration_number}</small>
      <div style={{ marginTop: 4, fontSize: 12, color: colors.textSecondary }}>
        <div>📞 {member.phone_number}</div>
        <div>💰 ₦{member.expected_amount.toLocaleString()}/daily</div>
      </div>
    </div>
    <button onClick={onPrint} style={{ ...styles.iconBtn, color: colors.primary }} aria-label="Print card">
      <Printer size={20} />
    </button>
  </div>
);

const SearchBar = ({ value, onChange, placeholder, colors }) => (
  <div style={{ ...styles.searchBox, background: colors.card, borderColor: colors.border }}>
    <Search size={18} color={colors.textSecondary} />
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ ...styles.searchInput, color: colors.text }}
    />
  </div>
);

const AddMemberForm = ({ onClose, onSuccess, showToast, colors }) => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const memberData = {
      full_name: formData.get('name'),
      registration_number: formData.get('regNumber'),
      phone_number: formData.get('phone'),
      address: formData.get('address'),
      expected_amount: Number(formData.get('amount')),
      ajo_owner_id: 'admin'
    };

    const { error } = await supabase.from('contributors').insert([memberData]);

    if (error) {
      showToast("Failed to add member", "error");
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
          <button type="submit" style={{ ...styles.btnPrimary, flex: 1, background: colors.primary }}>
            Register Member
          </button>
          <button type="button" onClick={onClose} style={{ ...styles.btnSecondary, flex: 1, background: colors.cardAlt }}>
            Cancel
          </button>
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

    const agentData = {
      full_name: formData.get('name'),
      employee_id_number: formData.get('employeeId'),
      password: formData.get('password'),
      ajo_owner_id: 'admin'
    };

    const { error } = await supabase.from('employees').insert([agentData]);

    if (error) {
      showToast("Failed to register agent", "error");
      console.error(error);
    } else {
      setShowAddForm(false);
      onRefresh();
      showToast("Agent registered successfully", "success");
    }
  };

  return (
    <div style={styles.fadeIn}>
      <button
        onClick={() => setShowAddForm(true)}
        style={{ ...styles.btnPrimary, background: colors.primary, marginBottom: 15 }}
      >
        <UserPlus size={18} /> Register New Agent
      </button>

      {showAddForm && (
        <div style={{ ...styles.form, background: colors.card, borderColor: colors.primary }}>
          <h3 style={{ marginTop: 0 }}>New Agent Registration</h3>
          <form onSubmit={handleAddAgent}>
            <input name="name" placeholder="Full Name" style={{ ...styles.input, background: colors.bg, borderColor: colors.border, color: colors.text }} required />
            <input name="employeeId" placeholder="Login ID" style={{ ...styles.input, background: colors.bg, borderColor: colors.border, color: colors.text }} required />
            <input name="password" type="password" placeholder="Password" style={{ ...styles.input, background: colors.bg, borderColor: colors.border, color: colors.text }} required />
            
            <div style={{ display: 'flex', gap: 10, marginTop: 15 }}>
              <button type="submit" style={{ ...styles.btnPrimary, flex: 1, background: colors.primary }}>
                Register Agent
              </button>
              <button type="button" onClick={() => setShowAddForm(false)} style={{ ...styles.btnSecondary, flex: 1, background: colors.cardAlt }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <SectionHeader title="Agent Performance" icon={<TrendingUp size={20} />} />
      
      <div>
        {agentStats.map(agent => (
          <div key={agent.id} style={{ ...styles.listItem, background: colors.card, borderColor: colors.border }}>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: '600', fontSize: 15 }}>{agent.full_name}</p>
              <small style={{ color: colors.textSecondary, fontSize: 12 }}>ID: {agent.employee_id_number}</small>
              <div style={{ marginTop: 8, fontSize: 13 }}>
                <span style={{ color: colors.primary, fontWeight: '600' }}>
                  ₦{agent.totalCollected.toLocaleString()}
                </span>
                <span style={{ color: colors.textSecondary, marginLeft: 10 }}>
                  • {agent.transactionCount} collections
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ScannerView = ({ profile, onRefresh, showToast, colors }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [amount, setAmount] = useState('');

  const handleScan = async (result) => {
    try {
      const data = JSON.parse(result);
      const { data: member, error } = await supabase
        .from('contributors')
        .select('*')
        .eq('id', data.id)
        .single();

      if (error || !member) {
        showToast("Invalid member card", "error");
        return;
      }

      setSelectedMember(member);
      setAmount(member.expected_amount.toString());
      setIsScanning(false);
    } catch (error) {
      showToast("Failed to scan card", "error");
      console.error(error);
    }
  };

  const handleSubmitPayment = async () => {
    if (!amount || Number(amount) <= 0) {
      showToast("Please enter a valid amount", "error");
      return;
    }

    const transactionData = {
      contributor_id: selectedMember.id,
      contributor_name: selectedMember.full_name,
      employee_id: profile.id,
      amount: Number(amount),
      ajo_owner_id: 'admin'
    };

    const { error } = await supabase.from('transactions').insert([transactionData]);

    if (error) {
      showToast("Failed to record payment", "error");
      console.error(error);
    } else {
      showToast("Payment recorded successfully", "success");
      setSelectedMember(null);
      setAmount('');
      onRefresh();
    }
  };

  if (selectedMember) {
    return (
      <div style={{ ...styles.paymentModal, background: colors.card, borderColor: colors.primary }}>
        <h2 style={{ marginTop: 0 }}>{selectedMember.full_name}</h2>
        <p style={{ color: colors.textSecondary }}>
          Expected: ₦{selectedMember.expected_amount.toLocaleString()}
        </p>
        
        <div style={{ margin: '20px 0' }}>
          <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: colors.textSecondary }}>
            Amount Collected
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{
              ...styles.bigInput,
              borderColor: colors.primary,
              color: colors.text
            }}
            placeholder="0"
            autoFocus
          />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={handleSubmitPayment}
            style={{ ...styles.btnPrimary, flex: 1, background: colors.primary, padding: 15 }}
          >
            Confirm Payment
          </button>
          <button
            onClick={() => setSelectedMember(null)}
            style={{ ...styles.btnSecondary, flex: 1, background: colors.cardAlt, padding: 15 }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center' }}>
      {!isScanning ? (
        <button
          onClick={() => setIsScanning(true)}
          style={{
            ...styles.btnPrimary,
            background: colors.primary,
            width: '100%',
            padding: 50,
            fontSize: 18
          }}
        >
          <Camera size={40} style={{ marginBottom: 10 }} />
          <div>Tap to Scan Member Card</div>
        </button>
      ) : (
        <div style={styles.scannerBox}>
          <Scanner
            onScan={(results) => {
              if (results && results[0]) {
                handleScan(results[0].rawValue);
              }
            }}
            constraints={{ facingMode: 'environment' }}
          />
          <button
            onClick={() => setIsScanning(false)}
            style={styles.closeBtn}
            aria-label="Close scanner"
          >
            <X size={24} />
          </button>
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
        <div style={styles.cardHeader}>
          <h4 style={{ margin: 0, fontSize: 14 }}>{config.name}</h4>
          <p style={{ margin: '2px 0 0', fontSize: 8 }}>{config.address}</p>
          <p style={{ margin: '2px 0 0', fontSize: 8 }}>Tel: {config.phones}</p>
        </div>
        
        <div style={styles.cardBody}>
          <img src={qrUrl} alt="Member QR Code" style={{ width: 100, height: 100 }} />
          <div style={styles.cardInfo}>
            <p><strong>NAME:</strong> {member.full_name}</p>
            <p><strong>REG:</strong> {member.registration_number}</p>
            <p><strong>TEL:</strong> {member.phone_number}</p>
            <p><strong>DAILY:</strong> ₦{member.expected_amount.toLocaleString()}</p>
          </div>
        </div>
        
        <div style={styles.cardFooter}>
          MEMBERSHIP ID CARD
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        <button
          onClick={() => window.print()}
          style={{ ...styles.btnPrimary, background: colors.primary, padding: '12px 30px' }}
        >
          <Printer size={18} /> Print Card
        </button>
        <button
          onClick={onClose}
          style={{ ...styles.btnSecondary, background: colors.cardAlt, padding: '12px 30px' }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

const LoginScreen = ({ onLogin, loading, theme }) => {
  const [showPassword, setShowPassword] = useState(false);
  const colors = theme === 'dark' ? DARK_THEME : LIGHT_THEME;

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    onLogin({
      username: formData.get('username'),
      password: formData.get('password')
    });
  };

  return (
    <div style={{ ...styles.loginPage, background: colors.bg }}>
      <div style={{ ...styles.loginCard, background: colors.card, borderColor: colors.border }}>
        <Landmark size={48} color={colors.primary} style={{ marginBottom: 15 }} />
        <h1 style={{ margin: 0, color: colors.text }}>{CONFIG.business.name}</h1>
        <p style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 30 }}>
          Management Portal
        </p>

        <form onSubmit={handleSubmit}>
          <input
            name="username"
            type="text"
            placeholder="Username / Employee ID"
            style={{ ...styles.input, background: colors.bg, borderColor: colors.border, color: colors.text }}
            required
            autoComplete="username"
          />
          
          <div style={{ position: 'relative' }}>
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              style={{ ...styles.input, background: colors.bg, borderColor: colors.border, color: colors.text, paddingRight: 45 }}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: colors.textSecondary,
                cursor: 'pointer'
              }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.btnPrimary,
              background: loading ? colors.cardAlt : colors.primary,
              width: '100%',
              padding: 15,
              fontSize: 15,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

const LoadingSpinner = () => (
  <div style={{ textAlign: 'center', padding: 40 }}>
    <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite' }} />
    <p style={{ marginTop: 10, color: '#64748b' }}>Loading...</p>
  </div>
);

const EmptyState = ({ message, colors }) => (
  <div style={{ textAlign: 'center', padding: 40, color: colors.textSecondary }}>
    <AlertCircle size={48} style={{ opacity: 0.3, marginBottom: 15 }} />
    <p>{message}</p>
  </div>
);

const ToastContainer = ({ toasts }) => (
  <div style={styles.toastContainer}>
    {toasts.map(toast => (
      <div
        key={toast.id}
        style={{
          ...styles.toast,
          background: toast.type === 'error' ? '#ef4444' : toast.type === 'success' ? '#10b981' : '#3b82f6'
        }}
      >
        {toast.message}
      </div>
    ))}
  </div>
);

/* ===================== THEME COLORS ===================== */
const DARK_THEME = {
  bg: '#020617',
  card: '#0f172a',
  cardAlt: '#1e293b',
  text: '#f8fafc',
  textSecondary: '#94a3b8',
  border: '#1e293b',
  primary: '#3b82f6',
  primaryDark: '#1e40af'
};

const LIGHT_THEME = {
  bg: '#f1f5f9',
  card: '#ffffff',
  cardAlt: '#e2e8f0',
  text: '#0f172a',
  textSecondary: '#64748b',
  border: '#e2e8f0',
  primary: '#2563eb',
  primaryDark: '#1e40af'
};

/* ===================== STYLES ===================== */
const styles = {
  app: {
    minHeight: '100vh',
    transition: 'background 0.3s, color 0.3s'
  },
  header: {
    padding: '15px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 10
  },
  brand: {
    fontSize: 18,
    fontWeight: 900,
    margin: 0,
    letterSpacing: '-0.5px'
  },
  subBrand: {
    fontSize: 10,
    margin: '2px 0 0',
    fontWeight: '600',
    letterSpacing: '1px'
  },
  main: {
    padding: '20px',
    paddingBottom: 100,
    maxWidth: 1200,
    margin: '0 auto'
  },
  nav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'space-around',
    padding: '12px 0',
    zIndex: 10
  },
  navBtn: {
    background: 'none',
    border: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    cursor: 'pointer',
    padding: '8px 12px',
    transition: 'all 0.2s'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: 12,
    marginBottom: 20
  },
  statCard: {
    padding: 20,
    borderRadius: 16,
    border: '1px solid',
    textAlign: 'center',
    transition: 'transform 0.2s'
  },
  heroCard: {
    padding: 30,
    borderRadius: 20,
    color: '#fff',
    boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    border: '1px solid',
    marginBottom: 10,
    transition: 'all 0.2s',
    gap: 12
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 15px',
    borderRadius: 12,
    border: '1px solid',
    marginBottom: 15
  },
  searchInput: {
    background: 'none',
    border: 'none',
    padding: '14px 10px',
    outline: 'none',
    width: '100%',
    fontSize: 14
  },
  form: {
    padding: 20,
    borderRadius: 16,
    border: '2px solid',
    marginBottom: 20
  },
  input: {
    width: '100%',
    padding: 14,
    marginBottom: 12,
    border: '1px solid',
    borderRadius: 10,
    fontSize: 14,
    boxSizing: 'border-box',
    transition: 'border 0.2s'
  },
  btnPrimary: {
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    fontWeight: '600',
    cursor: 'pointer',
    padding: '12px 20px',
    fontSize: 14,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
    transition: 'all 0.2s',
    width: '100%'
  },
  btnSecondary: {
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    fontWeight: '600',
    cursor: 'pointer',
    padding: '12px 20px',
    fontSize: 14,
    transition: 'all 0.2s'
  },
  iconBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'opacity 0.2s'
  },
  paymentModal: {
    padding: 30,
    borderRadius: 20,
    border: '2px solid',
    textAlign: 'center',
    maxWidth: 400,
    margin: '0 auto'
  },
  bigInput: {
    background: 'none',
    border: 'none',
    borderBottom: '3px solid',
    fontSize: 36,
    textAlign: 'center',
    width: '100%',
    outline: 'none',
    fontWeight: 'bold',
    padding: '10px 0'
  },
  scannerBox: {
    position: 'relative',
    borderRadius: 20,
    overflow: 'hidden',
    maxWidth: 500,
    margin: '0 auto'
  },
  closeBtn: {
    position: 'absolute',
    top: 15,
    right: 15,
    background: 'rgba(0,0,0,0.7)',
    color: '#fff',
    border: 'none',
    padding: 12,
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.85)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    padding: 20
  },
  printCard: {
    width: 280,
    background: '#fff',
    color: '#000',
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
  },
  cardHeader: {
    padding: 12,
    borderBottom: '2px solid #000',
    textAlign: 'center'
  },
  cardBody: {
    display: 'flex',
    padding: 15,
    gap: 12,
    alignItems: 'center'
  },
  cardInfo: {
    fontSize: 9,
    lineHeight: 1.6,
    textAlign: 'left',
    flex: 1
  },
  cardFooter: {
    background: '#000',
    color: '#fff',
    fontSize: 10,
    padding: 6,
    textAlign: 'center',
    fontWeight: 'bold',
    letterSpacing: '1px'
  },
  toastContainer: {
    position: 'fixed',
    top: 20,
    left: 0,
    right: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    zIndex: 1000,
    pointerEvents: 'none'
  },
  toast: {
    padding: '12px 24px',
    borderRadius: 25,
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    animation: 'slideIn 0.3s ease'
  },
  loginPage: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  loginCard: {
    padding: 40,
    borderRadius: 24,
    width: '100%',
    maxWidth: 380,
    textAlign: 'center',
    border: '1px solid',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
  },
  fadeIn: {
    animation: 'fadeIn 0.4s ease'
  }
};

// Add animations
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @media print {
      body * { visibility: hidden; }
      #printable-card, #printable-card * { visibility: visible; }
      #printable-card {
        position: fixed;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
      }
    }
  `;
  document.head.appendChild(styleSheet);
}
