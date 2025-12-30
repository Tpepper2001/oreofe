import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Scanner } from '@yudiel/react-qr-scanner';
import {
  Users, UserPlus, LayoutDashboard, LogOut, CheckCircle, Landmark, X, Camera, 
  RefreshCw, Trash2, DollarSign, Search, Phone, MapPin, Printer, History, 
  AlertCircle, Moon, Sun, Wallet, ArrowUpRight, Ban, UserCheck
} from 'lucide-react';

/* ===================== CONFIG ===================== */
const SUPABASE_URL = 'https://watrosnylvkiuvuptdtp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhdHJvc255bHZraXV2dXB0ZHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MzE2NzEsImV4cCI6MjA4MjUwNzY3MX0.ku6_Ngf2JRJ8fxLs_Q-EySgCU37MjUK3WofpO9bazds';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const BUSINESS = {
  name: "ORE-OFE OLUWA",
  address: "No. 1, Bisiriyu Owokade Street, Molete, Lagos.",
  phones: "08107218385, 08027203601",
  commission_rate: 0.05
};

export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [view, setView] = useState('dashboard');
  const [members, setMembers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(true);
  const [toasts, setToasts] = useState([]);

  // Toast Helper
  const toast = (msg, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [m, t, a] = await Promise.all([
        supabase.from('contributors').select('*').order('full_name'),
        supabase.from('transactions').select('*').order('created_at', { ascending: false }),
        supabase.from('employees').select('*').order('full_name')
      ]);
      setMembers(m.data || []);
      setTransactions(t.data || []);
      setAgents(a.data || []);
    } catch (e) { toast("Error fetching data", "error"); }
    setLoading(false);
  };

  useEffect(() => { if (user) fetchData(); }, [user]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const u = e.target.username.value.trim().toLowerCase();
    const p = e.target.password.value;

    if (u === 'oreofe' && p === 'oreofe') {
      setUser({ id: 'admin' });
      setProfile({ full_name: 'Oreofe Admin', role: 'admin' });
      toast("Admin Access Granted", "success");
    } else {
      const { data } = await supabase.from('employees').select('*').eq('employee_id_number', u).eq('password', p).single();
      if (data) {
        setUser({ id: data.id });
        setProfile({ ...data, role: 'agent' });
        toast(`Welcome, ${data.full_name}`, "success");
      } else {
        toast("Invalid Credentials", "error");
      }
    }
    setLoading(false);
  };

  if (!user) return <LoginScreen onLogin={handleLogin} loading={loading} />;

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <div style={{ ...styles.app, background: theme.bg, color: theme.text }}>
      <header style={{ ...styles.header, background: theme.card, borderBottom: `1px solid ${theme.border}` }}>
        <div>
          <h1 style={{ ...styles.brand, color: theme.primary }}>{BUSINESS.name}</h1>
          <p style={styles.subBrand}>{profile?.role.toUpperCase()} MODE</p>
        </div>
        <button onClick={() => setIsDark(!isDark)} style={styles.iconBtn}>
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      <main style={styles.main}>
        {loading ? <SkeletonLoader /> : (
          profile?.role === 'admin' ? 
            <AdminPortal view={view} members={members} agents={agents} transactions={transactions} onRefresh={fetchData} toast={toast} /> :
            <AgentPortal view={view} profile={profile} members={members} transactions={transactions} onRefresh={fetchData} toast={toast} />
        )}
      </main>

      <nav style={{ ...styles.nav, background: theme.card, borderTop: `1px solid ${theme.border}` }}>
        <NavBtn act={view === 'dashboard'} icon={<LayoutDashboard size={20}/>} lab="Home" onClick={() => setView('dashboard')} />
        <NavBtn act={view === 'members'} icon={<Users size={20}/>} lab="Members" onClick={() => setView('members')} />
        
        {profile?.role === 'admin' && (
          <NavBtn act={view === 'agents'} icon={<UserCheck size={20}/>} lab="Agents" onClick={() => setView('agents')} />
        )}

        {profile?.role === 'agent' && (
           <NavBtn act={view === 'scan'} icon={<Camera size={20}/>} lab="Scan" onClick={() => setView('scan')} />
        )}

        <NavBtn act={false} icon={<LogOut size={20}/>} lab="Exit" onClick={() => setUser(null)} />
      </nav>

      <ToastContainer toasts={toasts} />
    </div>
  );
}

/* ==================== PORTALS ==================== */

const AdminPortal = ({ view, members, agents, transactions, onRefresh, toast }) => {
  const today = new Date().toISOString().slice(0, 10);
  const todayRev = transactions.filter(t => t.created_at.startsWith(today)).reduce((s, t) => s + (t.amount || 0), 0);

  if (view === 'dashboard') return (
    <div style={styles.fadeIn}>
      <div style={styles.grid}>
        <div style={styles.statCard}><h2>₦{todayRev.toLocaleString()}</h2><p>Today Total</p></div>
        <div style={styles.statCard}><h2>{members.length}</h2><p>Active Members</p></div>
      </div>
      <h3 style={{margin: '25px 0 10px'}}>Global Collections</h3>
      <TransactionHistory transactions={transactions.slice(0, 10)} />
    </div>
  );

  if (view === 'members') return <MemberDirectory members={members} onRefresh={onRefresh} toast={toast} isAdmin={true} />;
  if (view === 'agents') return <AgentManagement agents={agents} onRefresh={onRefresh} toast={toast} />;
  return <TransactionHistory transactions={transactions} />;
};

const AgentPortal = ({ view, profile, members, transactions, onRefresh, toast }) => {
  const myLogs = transactions.filter(t => t.employee_id === profile.id);
  const todayTotal = myLogs.filter(t => t.created_at.startsWith(new Date().toISOString().slice(0, 10))).reduce((s, t) => s + (t.amount || 0), 0);

  if (view === 'dashboard') return (
    <div style={styles.fadeIn}>
      <div style={styles.heroCard}>
        <small>YOUR COLLECTIONS TODAY</small>
        <h1>₦{todayTotal.toLocaleString()}</h1>
        <div style={styles.heroLine} />
        <small>COMMISSION: ₦{(todayTotal * BUSINESS.commission_rate).toLocaleString()}</small>
      </div>
      <h3 style={{margin: '20px 0'}}>Your Recent Log</h3>
      <TransactionHistory transactions={myLogs.slice(0, 5)} />
    </div>
  );

  if (view === 'members') return <MemberDirectory members={members} onRefresh={onRefresh} toast={toast} isAdmin={false} />;
  if (view === 'scan') return <ScannerView profile={profile} onRefresh={onRefresh} toast={toast} />;
};

/* ==================== COMPONENTS ==================== */

const ScannerView = ({ profile, onRefresh, toast }) => {
  const [scanning, setScanning] = useState(false);
  const [member, setMember] = useState(null);
  const [amount, setAmount] = useState('');

  const handleScan = async (data) => {
    try {
      const parsed = JSON.parse(data);
      const { data: mem } = await supabase.from('contributors').select('*').eq('id', parsed.id).single();
      if (!mem) throw new Error();
      setMember(mem); setAmount(mem.expected_amount); setScanning(false);
    } catch (e) { toast("Invalid Card", "error"); }
  };

  const submitPayment = async () => {
    const pay = Number(amount);
    const { error } = await supabase.from('transactions').insert([{
      contributor_id: member.id, contributor_name: member.full_name,
      employee_id: profile.id, amount: pay, ajo_owner_id: 'admin'
    }]);

    if (!error) {
      toast("Collection Recorded!", "success");
      setMember(null); onRefresh();
    }
  };

  if (member) return (
    <div style={styles.paymentModal}>
      <h2>{member.full_name}</h2>
      <p>Target: ₦{member.expected_amount}</p>
      <input type="number" value={amount} onChange={e => setAmount(e.target.value)} style={styles.bigInput} />
      <div style={{display: 'flex', gap: 10, marginTop: 20}}>
        <button onClick={submitPayment} style={{...styles.btnP, flex: 1}}>CONFIRM</button>
        <button onClick={() => setMember(null)} style={{...styles.btnS, flex: 1}}>CANCEL</button>
      </div>
    </div>
  );

  return (
    <div style={{textAlign: 'center'}}>
      {!scanning ? (
        <button onClick={() => setScanning(true)} style={{...styles.btnP, width: '100%', padding: 40}}>
           <Camera size={32}/><br/>TAP TO SCAN CARD
        </button>
      ) : (
        <div style={styles.scanBox}>
          <Scanner onScan={(d) => d[0] && handleScan(d[0].rawValue)} />
          <button onClick={() => setScanning(false)} style={styles.closeBtn}><X/></button>
        </div>
      )}
    </div>
  );
};

const MemberDirectory = ({ members, onRefresh, toast, isAdmin }) => {
  const [query, setQuery] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState(null);

  const filtered = members.filter(m => m.full_name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <div style={styles.searchBox}>
        <Search size={18} color="#64748b" />
        <input placeholder="Search member..." value={query} onChange={e => setQuery(e.target.value)} style={styles.searchIn} />
      </div>

      {isAdmin && (
        <button onClick={() => setShowAdd(true)} style={{...styles.btnP, width: '100%', marginBottom: 15}}><UserPlus size={18}/> New Member</button>
      )}

      {showAdd && <AddMemberForm onRefresh={onRefresh} onClose={() => setShowAdd(false)} toast={toast} />}

      {filtered.map(m => (
        <div key={m.id} style={styles.item}>
          <div>
            <p style={{margin: 0, fontWeight: 'bold'}}>{m.full_name}</p>
            <small style={{color: '#3b82f6'}}>{m.registration_number}</small>
          </div>
          <button onClick={() => setSelected(m)} style={styles.iconBtn}><Printer/></button>
        </div>
      ))}
      {selected && <PrintCard member={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

const AgentManagement = ({ agents, onRefresh, toast }) => {
  const [showAdd, setShowAdd] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const { error } = await supabase.from('employees').insert([{
      full_name: f.get('n'),
      employee_id_number: f.get('id'),
      password: f.get('p'),
      ajo_owner_id: 'admin'
    }]);
    if (!error) { setShowAdd(false); onRefresh(); toast("Agent Registered", "success"); }
    else toast("Error registering agent", "error");
  };

  return (
    <div>
      <button onClick={() => setShowAdd(true)} style={{...styles.btnP, width: '100%', marginBottom: 15}}>Register New Agent</button>
      {showAdd && (
        <form onSubmit={handleAdd} style={styles.form}>
          <input name="n" placeholder="Full Name" style={styles.input} required />
          <input name="id" placeholder="Login ID" style={styles.input} required />
          <input name="p" placeholder="Password" style={styles.input} required />
          <button type="submit" style={styles.btnP}>Save Agent</button>
        </form>
      )}
      {agents.map(a => (
        <div key={a.id} style={styles.item}>
          <span>{a.full_name}</span>
          <small>ID: {a.employee_id_number}</small>
        </div>
      ))}
    </div>
  );
};

const TransactionHistory = ({ transactions }) => (
  <div>
    {transactions.map(t => (
      <div key={t.id} style={styles.item}>
        <div>
          <p style={{margin: 0, fontSize: 14}}>{t.contributor_name}</p>
          <small style={{color: '#64748b'}}>{new Date(t.created_at).toLocaleString()}</small>
        </div>
        <strong>₦{t.amount}</strong>
      </div>
    ))}
  </div>
);

const AddMemberForm = ({ onRefresh, onClose, toast }) => {
  const submit = async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const { error } = await supabase.from('contributors').insert([{
      full_name: f.get('n'), registration_number: f.get('r'),
      phone_number: f.get('p'), address: f.get('a'),
      expected_amount: Number(f.get('m')), ajo_owner_id: 'admin'
    }]);
    if (!error) { onClose(); onRefresh(); toast("Member Added", "success"); }
  };
  return (
    <form onSubmit={submit} style={styles.form}>
      <input name="n" placeholder="Member Full Name" style={styles.input} required />
      <input name="r" placeholder="Registration Number" style={styles.input} required />
      <input name="p" placeholder="Phone Number" style={styles.input} required />
      <input name="a" placeholder="Address" style={styles.input} required />
      <input name="m" type="number" placeholder="Daily Contribution (₦)" style={styles.input} required />
      <button type="submit" style={styles.btnP}>Confirm Registration</button>
      <button type="button" onClick={onClose} style={{...styles.btnS, marginLeft: 10}}>Cancel</button>
    </form>
  );
};

const PrintCard = ({ member, onClose }) => {
  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(JSON.stringify({ id: member.id }))}`;
  return (
    <div style={styles.overlay}>
      <div style={styles.cardPrint} id="card">
        <div style={{padding: 10, borderBottom: '1px solid #000'}}>
          <h4 style={{margin: 0}}>{BUSINESS.name}</h4>
          <p style={{fontSize: 7, margin: 0}}>{BUSINESS.address}</p>
        </div>
        <div style={{display: 'flex', padding: 10, alignItems: 'center', gap: 10}}>
          <img src={qr} alt="QR" style={{width: 80}} />
          <div style={{fontSize: 8, textAlign: 'left', lineHeight: 1.4}}>
            <p><strong>NAME:</strong> {member.full_name}</p>
            <p><strong>REG:</strong> {member.registration_number}</p>
            <p><strong>TEL:</strong> {member.phone_number}</p>
          </div>
        </div>
        <div style={{background: '#000', color: '#fff', fontSize: 8, padding: 2}}>MEMBERSHIP ID</div>
      </div>
      <div style={{marginTop: 20, display: 'flex', gap: 10}}>
        <button onClick={() => window.print()} style={styles.btnP}>PRINT</button>
        <button onClick={onClose} style={styles.btnS}>CLOSE</button>
      </div>
    </div>
  );
};

/* ==================== UI STUFF ==================== */

const NavBtn = ({ act, icon, lab, onClick }) => (
  <button onClick={onClick} style={act ? styles.navActive : styles.navBtn}>
    {icon} <span>{lab}</span>
  </button>
);

const ToastContainer = ({ toasts }) => (
  <div style={styles.toastWrap}>
    {toasts.map(t => (
      <div key={t.id} style={{ ...styles.toast, background: t.type === 'error' ? '#ef4444' : '#10b981' }}>
        {t.msg}
      </div>
    ))}
  </div>
);

const LoginScreen = ({ onLogin, loading }) => (
  <div style={styles.loginPage}>
    <div style={styles.loginCard}>
      <Landmark size={48} color="#3b82f6" style={{marginBottom: 10}}/>
      <h1 style={{margin: 0}}>{BUSINESS.name}</h1>
      <p style={{fontSize: 12, color: '#64748b', marginBottom: 30}}>Management Portal</p>
      <form onSubmit={onLogin}>
        <input name="username" placeholder="Username / ID" style={styles.input} required />
        <input name="password" type="password" placeholder="Password" style={styles.input} required />
        <button type="submit" style={{...styles.btnP, width: '100%', padding: 15}} disabled={loading}>
          {loading ? 'WAIT...' : 'SIGN IN'}
        </button>
      </form>
    </div>
  </div>
);

const SkeletonLoader = () => (
  <div style={{padding: 20}}>
    {[1,2,3,4].map(i => <div key={i} style={styles.skeleton} />)}
  </div>
);

/* ==================== STYLES ==================== */
const darkTheme = { bg: '#020617', card: '#0f172a', text: '#f8fafc', border: '#1e293b', primary: '#3b82f6' };
const lightTheme = { bg: '#f1f5f9', card: '#ffffff', text: '#0f172a', border: '#e2e8f0', primary: '#2563eb' };

const styles = {
  app: { minHeight: '100vh', transition: 'all 0.3s' },
  header: { padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  brand: { fontSize: 18, fontWeight: 900, margin: 0 },
  subBrand: { fontSize: 9, margin: 0, color: '#64748b' },
  main: { padding: 20, paddingBottom: 100 },
  heroCard: { background: 'linear-gradient(135deg, #1e40af, #3b82f6)', padding: 25, borderRadius: 20, color: '#fff' },
  heroLine: { height: 1, background: 'rgba(255,255,255,0.1)', margin: '15px 0' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  statCard: { background: '#0f172a', padding: 20, borderRadius: 15, border: '1px solid #1e293b', textAlign: 'center' },
  item: { background: '#0f172a', padding: 15, borderRadius: 12, border: '1px solid #1e293b', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  nav: { position: 'fixed', bottom: 0, width: '100%', display: 'flex', justifyContent: 'space-around', padding: '12px 0' },
  navBtn: { background: 'none', border: 'none', color: '#64748b', fontSize: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  navActive: { background: 'none', border: 'none', color: '#3b82f6', fontSize: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, fontWeight: 'bold' },
  btnP: { background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 'bold', cursor: 'pointer', padding: '10px 15px' },
  btnS: { background: '#1e293b', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', padding: '10px 15px' },
  iconBtn: { background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' },
  input: { width: '100%', padding: 12, marginBottom: 10, background: '#020617', border: '1px solid #1e293b', borderRadius: 10, color: '#fff', boxSizing: 'border-box' },
  form: { background: '#0f172a', padding: 20, borderRadius: 15, border: '1px solid #3b82f6', marginBottom: 20 },
  searchBox: { background: '#0f172a', display: 'flex', alignItems: 'center', padding: '0 15px', borderRadius: 10, border: '1px solid #1e293b', marginBottom: 15 },
  searchIn: { background: 'none', border: 'none', color: '#fff', padding: '12px 0', outline: 'none', width: '100%' },
  toastWrap: { position: 'fixed', top: 20, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, zIndex: 1000 },
  toast: { padding: '10px 20px', borderRadius: 20, color: '#fff', fontSize: 13, fontWeight: 'bold' },
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  cardPrint: { width: '250px', background: '#fff', color: '#000', borderRadius: 8, border: '1px solid #000', textAlign: 'center', overflow: 'hidden' },
  bigInput: { background: 'none', border: 'none', borderBottom: '2px solid #3b82f6', color: '#fff', fontSize: 32, textAlign: 'center', width: '100%', outline: 'none', fontWeight: 'bold' },
  paymentModal: { background: '#0f172a', padding: 25, borderRadius: 20, textAlign: 'center', border: '1px solid #3b82f6' },
  scanBox: { position: 'relative', borderRadius: 20, overflow: 'hidden' },
  closeBtn: { position: 'absolute', top: 10, right: 10, background: '#000', color: '#fff', border: 'none', padding: 10, borderRadius: '50%' },
  skeleton: { height: 60, background: '#0f172a', borderRadius: 12, marginBottom: 10 },
  loginPage: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  loginCard: { background: '#0f172a', padding: 40, borderRadius: 25, width: '100%', maxWidth: 350, textAlign: 'center', border: '1px solid #1e293b' },
  fadeIn: { animation: 'fadeIn 0.4s ease' }
};

if (typeof document !== 'undefined') {
  const s = document.createElement('style');
  s.innerHTML = `
    @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
    @media print { body * { visibility: hidden; } #card, #card * { visibility: visible; } #card { position: fixed; left: 0; top: 0; } }
  `;
  document.head.appendChild(s);
}
