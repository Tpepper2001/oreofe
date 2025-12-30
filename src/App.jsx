import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Scanner } from '@yudiel/react-qr-scanner';
import {
  Users, UserPlus, LayoutDashboard, LogOut,
  CheckCircle, Landmark, X, Camera, RefreshCw, Trash2,
  DollarSign, UserCheck, Search, Phone, MapPin, ReceiptText
} from 'lucide-react';

/* ===================== CONFIG ===================== */
const SUPABASE_URL = 'https://watrosnylvkiuvuptdtp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhdHJvc255bHZraXV2dXB0ZHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MzE2NzEsImV4cCI6MjA4MjUwNzY3MX0.ku6_Ngf2JRJ8fxLs_Q-EySgCU37MjUK3WofpO9bazds';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const BUSINESS_INFO = {
  name: "ORE-OFE OLUWA",
  address: "No. 1, Bisiriyu Owokade Street, Molete, Ibeju-Lekki, Lagos.",
  phones: "08107218385, 08027203601"
};

/* ===================== UTILS ===================== */
const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
const formatTime = (dateString) => new Date(dateString).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

/* ===================== MAIN APP ===================== */
export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [view, setView] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [loginMode, setLoginMode] = useState('admin');

  const [members, setMembers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ totalRevenue: 0, todayRevenue: 0, activeMembers: 0 });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [memRes, agentRes, transRes] = await Promise.all([
        supabase.from('contributors').select('*').order('full_name'),
        supabase.from('employees').select('*'),
        supabase.from('transactions').select('*').order('created_at', { ascending: false })
      ]);

      setMembers(memRes.data || []);
      setAgents(agentRes.data || []);
      setTransactions(transRes.data || []);

      const today = new Date().toISOString().slice(0, 10);
      const totalRev = (transRes.data || []).reduce((sum, t) => sum + (t.amount || 0), 0);
      const todayRev = (transRes.data || [])
        .filter(t => t.created_at?.slice(0, 10) === today)
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      setStats({
        totalRevenue: totalRev,
        todayRevenue: todayRev,
        activeMembers: memRes.data?.length || 0
      });
    } catch (err) {
      console.error("Data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const username = e.target.username.value.trim().toLowerCase();
    const password = e.target.password.value;

    if (loginMode === 'admin') {
      if (username === 'oreofe' && password === 'oreofe') {
        setUser({ id: 'admin' });
        setProfile({ id: 'admin', full_name: 'Admin Owner', role: 'admin' });
      } else {
        alert('Invalid Admin Access');
      }
    } else {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('employee_id_number', username)
        .eq('password', password)
        .single();

      if (error || !data) {
        alert('Invalid Agent Credentials');
      } else {
        setUser({ id: data.id });
        setProfile({ ...data, role: 'employee' });
      }
    }
    setLoading(false);
  };

  if (!user) return <LoginScreen onLogin={handleLogin} loading={loading} loginMode={loginMode} setLoginMode={setLoginMode} />;

  return (
    <div style={styles.appContainer}>
      <header style={styles.appHeader}>
        <div style={styles.brand}>
          <h1 style={styles.brandH1}>{BUSINESS_INFO.name}</h1>
        </div>
        <div style={styles.profilePill}>
          <div style={styles.profileAvatar}>{profile?.full_name?.charAt(0)}</div>
          <span>{profile?.full_name?.split(' ')[0]}</span>
        </div>
      </header>

      <main style={styles.contentArea}>
        {profile?.role === 'admin' ? (
          <>
            {view === 'dashboard' && <OwnerDashboard stats={stats} transactions={transactions} onRefresh={fetchData} />}
            {view === 'members' && <MemberManagement members={members} onRefresh={fetchData} transactions={transactions} />}
            {view === 'employees' && <AgentManagement agents={agents} onRefresh={fetchData} />}
            {view === 'transactions' && <TransactionHistory transactions={transactions} members={members} agents={agents} />}
          </>
        ) : (
          <CollectionInterface profile={profile} onRefresh={fetchData} />
        )}
      </main>

      <nav style={styles.bottomNav}>
        <button onClick={() => setView('dashboard')} style={{...styles.navButton, ...(view === 'dashboard' ? styles.navButtonActive : {})}}>
          <LayoutDashboard size={22} /><span>Home</span>
        </button>
        {profile?.role === 'admin' && (
          <>
            <button onClick={() => setView('members')} style={{...styles.navButton, ...(view === 'members' ? styles.navButtonActive : {})}}>
              <Users size={22} /><span>Members</span>
            </button>
            <button onClick={() => setView('transactions')} style={{...styles.navButton, ...(view === 'transactions' ? styles.navButtonActive : {})}}>
              <ReceiptText size={22} /><span>History</span>
            </button>
          </>
        )}
        <button onClick={() => { setUser(null); setProfile(null); }} style={styles.navButton}>
          <LogOut size={22} /><span>Exit</span>
        </button>
      </nav>
    </div>
  );
}

/* ==================== COLLECTION INTERFACE (AGENT) ==================== */
const CollectionInterface = ({ profile, onRefresh }) => {
  const [result, setResult] = useState(null);
  const [scanning, setScanning] = useState(false);

  const handleScan = async (data) => {
    if (!data) return;
    try {
      const parsed = JSON.parse(data);
      const { data: member, error: memErr } = await supabase.from('contributors').select('*').eq('id', parsed.id).single();
      
      if (memErr || !member) throw new Error('Member not found');

      const { error: insErr } = await supabase.from('transactions').insert([{
        contributor_id: member.id,
        contributor_name: member.full_name,
        employee_id: profile.id,
        amount: member.expected_amount,
        ajo_owner_id: 'admin'
      }]);

      if (insErr) throw insErr;

      setResult({ name: member.full_name, amount: member.expected_amount });
      setScanning(false);
      onRefresh();
    } catch (e) {
      alert('Invalid Card QR Code');
    }
  };

  if (result) {
    return (
      <div style={styles.successCard}>
        <CheckCircle size={80} color="#10b981" />
        <h1 style={{fontSize: 48, margin: '15px 0'}}>₦{result.amount.toLocaleString()}</h1>
        <p style={{fontSize: 18, fontWeight: 600}}>{result.name}</p>
        <p style={{color: '#94a3b8', marginTop: 10}}>Collection Successful</p>
        <button onClick={() => setResult(null)} style={{...styles.btnPrimary, marginTop: 40, width: '100%'}}>CONTINUE</button>
      </div>
    );
  }

  return (
    <div style={styles.cardContainer}>
      {!scanning ? (
        <div style={{textAlign: 'center', padding: '40px 0'}}>
          <Landmark size={80} color="#3b82f6" style={{marginBottom: 20}} />
          <h2 style={{fontSize: 24, fontWeight: 800}}>Member Collection</h2>
          <p style={{color: '#94a3b8', margin: '15px 0 30px'}}>Scan the QR code on the member's card to record payment.</p>
          <button onClick={() => setScanning(true)} style={{...styles.btnPrimary, width: '100%', padding: 20}}>
            <Camera size={24} /> OPEN CAMERA
          </button>
        </div>
      ) : (
        <div style={styles.scannerBox}>
          <Scanner 
            onScan={(detected) => detected.length > 0 && handleScan(detected[0].rawValue)}
            styles={{ container: { width: '100%', aspectRatio: '1/1' } }}
          />
          <button onClick={() => setScanning(false)} style={styles.closeBtn}><X size={24} /></button>
        </div>
      )}
    </div>
  );
};

/* ==================== OWNER DASHBOARD ==================== */
const OwnerDashboard = ({ stats, transactions, onRefresh }) => (
  <div style={styles.fadeIn}>
    <div style={{marginBottom: 25}}>
      <p style={{color: '#94a3b8', fontSize: 14}}>Business Overview</p>
      <h2 style={{fontSize: 28, fontWeight: 900}}>{BUSINESS_INFO.name}</h2>
    </div>

    <div style={styles.statsGrid}>
      <div style={{...styles.statCard, background: 'linear-gradient(135deg, #3b82f6, #2563eb)'}}>
        <p style={{fontSize: 12, opacity: 0.9}}>TODAY'S TOTAL</p>
        <h2 style={{fontSize: 24, fontWeight: 900}}>₦{stats.todayRevenue.toLocaleString()}</h2>
      </div>
      <div style={styles.statCard}>
        <p style={{fontSize: 12, color: '#94a3b8'}}>MEMBERS</p>
        <h2 style={{fontSize: 24, fontWeight: 900}}>{stats.activeMembers}</h2>
      </div>
    </div>

    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '30px 0 15px'}}>
      <h3 style={{fontWeight: 800}}>Recent Collections</h3>
      <button onClick={onRefresh} style={styles.btnIcon}><RefreshCw size={18} /></button>
    </div>

    <div style={styles.list}>
      {transactions.slice(0, 8).map(t => (
        <div key={t.id} style={styles.listItem}>
          <div style={styles.listIcon}><DollarSign size={18} color="#34d399"/></div>
          <div style={{flex: 1}}>
            <p style={{fontWeight: 700, fontSize: 15}}>{t.contributor_name}</p>
            <p style={{fontSize: 12, color: '#64748b'}}>{formatTime(t.created_at)}</p>
          </div>
          <p style={{fontWeight: 900, color: '#fff'}}>₦{t.amount}</p>
        </div>
      ))}
    </div>
  </div>
);

/* ==================== MEMBER MANAGEMENT ==================== */
const MemberManagement = ({ members, onRefresh, transactions }) => {
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState('');

  const calculateBalance = (memberId) => {
    return transactions
      .filter(t => t.contributor_id === memberId)
      .reduce((sum, t) => sum + (t.amount || 0), 0);
  };

  const filteredMembers = members.filter(m => 
    m.full_name.toLowerCase().includes(search.toLowerCase()) || 
    m.registration_number?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const { error } = await supabase.from('contributors').insert([{
      full_name: formData.get('name'),
      registration_number: formData.get('regNo'),
      phone_number: formData.get('phone'),
      address: formData.get('address'),
      expected_amount: Number(formData.get('amount')),
      ajo_owner_id: 'admin'
    }]);

    if (!error) { setAdding(false); onRefresh(); }
    else alert('Error adding member');
  };

  return (
    <div style={styles.fadeIn}>
      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 20}}>
        <h2 style={{fontWeight: 900}}>Members</h2>
        <button onClick={() => setAdding(true)} style={styles.btnPrimary}><UserPlus size={18} /> New</button>
      </div>

      <div style={styles.searchBar}>
        <Search size={18} color="#64748b" />
        <input 
          placeholder="Search Name or Reg No..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {adding && (
        <form onSubmit={handleAdd} style={styles.cardForm}>
          <h3 style={{marginBottom: 15}}>Register New Member</h3>
          <input name="name" placeholder="Full Name (as on card)" style={styles.input} required />
          <input name="regNo" placeholder="Registration No" style={styles.input} required />
          <input name="phone" placeholder="Phone Number" style={styles.input} required />
          <input name="address" placeholder="Residential Address" style={styles.input} required />
          <input name="amount" type="number" placeholder="Contribution Amount (₦)" style={styles.input} required />
          <div style={{display: 'flex', gap: 10}}>
            <button type="submit" style={{...styles.btnPrimary, flex: 1}}>Save Member</button>
            <button type="button" onClick={() => setAdding(false)} style={styles.btnSecondary}>Cancel</button>
          </div>
        </form>
      )}

      <div style={styles.list}>
        {filteredMembers.map(m => (
          <div key={m.id} style={{...styles.listItem, flexDirection: 'column', alignItems: 'flex-start', gap: 10}}>
            <div style={{display: 'flex', justifyContent: 'space-between', width: '100%'}}>
              <div>
                <p style={{fontWeight: 800, fontSize: 16}}>{m.full_name}</p>
                <p style={{fontSize: 12, color: '#3b82f6', fontWeight: 700}}>REG: {m.registration_number}</p>
              </div>
              <div style={{textAlign: 'right'}}>
                <p style={{fontSize: 10, color: '#94a3b8'}}>SAVINGS</p>
                <p style={{fontWeight: 900, color: '#34d399'}}>₦{calculateBalance(m.id).toLocaleString()}</p>
              </div>
            </div>
            <div style={{display: 'flex', gap: 15, fontSize: 12, color: '#94a3b8'}}>
               <span style={{display: 'flex', alignItems: 'center', gap: 4}}><Phone size={12}/> {m.phone_number}</span>
               <span style={{display: 'flex', alignItems: 'center', gap: 4}}><MapPin size={12}/> {m.address?.slice(0, 20)}...</span>
            </div>
            <button 
                onClick={async () => { if(confirm('Delete member?')) { await supabase.from('contributors').delete().eq('id', m.id); onRefresh(); }}} 
                style={{...styles.btnDanger, alignSelf: 'flex-end', padding: '4px 8px'}}
            >
                <Trash2 size={14}/>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ==================== TRANSACTION HISTORY ==================== */
const TransactionHistory = ({ transactions }) => (
  <div style={styles.fadeIn}>
    <h2 style={{fontWeight: 900, marginBottom: 20}}>Collection Logs</h2>
    <div style={styles.list}>
      {transactions.map(t => (
        <div key={t.id} style={styles.listItem}>
          <div style={{flex: 1}}>
            <p style={{fontWeight: 700}}>{t.contributor_name}</p>
            <p style={{fontSize: 11, color: '#94a3b8'}}>{formatDate(t.created_at)} at {formatTime(t.created_at)}</p>
          </div>
          <p style={{fontWeight: 900, fontSize: 18}}>₦{t.amount}</p>
        </div>
      ))}
    </div>
  </div>
);

/* ==================== LOGIN SCREEN ==================== */
const LoginScreen = ({ onLogin, loading, loginMode, setLoginMode }) => (
  <div style={styles.loginPage}>
    <div style={styles.loginCard}>
      <div style={styles.loginLogo}>
        <Landmark size={40} color="#fff" />
      </div>
      <h1 style={{fontSize: 22, fontWeight: 900, marginBottom: 5}}>{BUSINESS_INFO.name}</h1>
      <p style={{fontSize: 12, color: '#94a3b8', marginBottom: 30}}>Ajo Management Portal</p>
      
      <div style={styles.toggleRow}>
        <button onClick={() => setLoginMode('admin')} style={{...styles.toggleBtn, ...(loginMode === 'admin' ? styles.toggleActive : {})}}>OWNER</button>
        <button onClick={() => setLoginMode('agent')} style={{...styles.toggleBtn, ...(loginMode === 'agent' ? styles.toggleActive : {})}}>AGENT</button>
      </div>

      <form onSubmit={onLogin}>
        <input name="username" placeholder="Username / ID" style={styles.input} required />
        <input name="password" type="password" placeholder="Password" style={styles.input} required />
        <button type="submit" disabled={loading} style={{...styles.btnPrimary, width: '100%', padding: 16, marginTop: 10}}>
          {loading ? 'AUTHENTICATING...' : 'LOGIN'}
        </button>
      </form>

      <div style={{marginTop: 30, fontSize: 10, color: '#64748b', lineHeight: 1.5}}>
        <p>{BUSINESS_INFO.address}</p>
        <p>{BUSINESS_INFO.phones}</p>
      </div>
    </div>
  </div>
);

/* ==================== STYLES ==================== */
const styles = {
  appContainer: { minHeight: '100vh', background: '#020617', color: '#fff', fontFamily: 'system-ui, sans-serif' },
  appHeader: { height: 70, padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0f172a', borderBottom: '1px solid #1e293b', position: 'sticky', top: 0, zIndex: 10 },
  brandH1: { fontSize: 18, fontWeight: 900, color: '#3b82f6' },
  profilePill: { display: 'flex', alignItems: 'center', gap: 8, background: '#1e293b', padding: '6px 12px', borderRadius: 25, fontSize: 13 },
  profileAvatar: { width: 24, height: 24, background: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 11 },
  contentArea: { padding: 20, paddingBottom: 100 },
  bottomNav: { position: 'fixed', bottom: 0, left: 0, right: 0, height: 75, background: '#0f172a', display: 'flex', justifyContent: 'space-around', alignItems: 'center', borderTop: '1px solid #1e293b', paddingBottom: 10 },
  navButton: { background: 'none', border: 'none', color: '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600 },
  navButtonActive: { color: '#3b82f6' },
  btnPrimary: { background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer' },
  btnSecondary: { background: '#1e293b', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: 12, fontWeight: 700 },
  btnDanger: { background: '#450a0a', border: 'none', color: '#f87171', borderRadius: 8 },
  btnIcon: { background: 'none', border: 'none', color: '#64748b' },
  statsGrid: { display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 15 },
  statCard: { background: '#0f172a', padding: 22, borderRadius: 24, border: '1px solid #1e293b' },
  cardForm: { background: '#0f172a', padding: 25, borderRadius: 24, border: '1px solid #3b82f6', marginBottom: 25 },
  input: { width: '100%', padding: 14, background: '#020617', border: '1px solid #1e293b', borderRadius: 12, color: '#fff', marginBottom: 12, fontSize: 15 },
  searchBar: { display: 'flex', alignItems: 'center', gap: 10, background: '#0f172a', padding: '12px 15px', borderRadius: 12, marginBottom: 20, border: '1px solid #1e293b' },
  searchInput: { background: 'none', border: 'none', color: '#fff', width: '100%', outline: 'none' },
  list: { display: 'flex', flexDirection: 'column', gap: 12 },
  listItem: { background: '#0f172a', padding: 18, borderRadius: 20, border: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: 15 },
  listIcon: { width: 40, height: 40, borderRadius: 12, background: '#064e3b', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  successCard: { textAlign: 'center', padding: 40, background: '#0f172a', borderRadius: 30, border: '1px solid #1e293b' },
  scannerBox: { position: 'relative', borderRadius: 25, overflow: 'hidden', border: '4px solid #3b82f6' },
  closeBtn: { position: 'absolute', top: 15, right: 15, background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', padding: 10, borderRadius: '50%' },
  loginPage: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  loginCard: { width: '100%', maxWidth: 380, padding: 40, background: '#0f172a', borderRadius: 32, textAlign: 'center', border: '1px solid #1e293b' },
  loginLogo: { width: 70, height: 70, background: '#3b82f6', borderRadius: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' },
  toggleRow: { display: 'flex', background: '#020617', padding: 5, borderRadius: 15, marginBottom: 25 },
  toggleBtn: { flex: 1, padding: 12, background: 'none', border: 'none', color: '#64748b', borderRadius: 12, fontWeight: 700, fontSize: 13 },
  toggleActive: { background: '#3b82f6', color: '#fff' },
  fadeIn: { animation: 'fadeIn 0.4s ease' }
};

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`;
  document.head.appendChild(style);
}
