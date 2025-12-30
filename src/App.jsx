import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Scanner } from '@yudiel/react-qr-scanner';
import {
  Users, UserPlus, LayoutDashboard, LogOut, CheckCircle, Landmark, X, Camera, 
  RefreshCw, Trash2, DollarSign, Search, Phone, MapPin, Printer, History, 
  AlertCircle, Moon, Sun, MoreVertical, Wallet, ArrowUpRight, Ban
} from 'lucide-react';

/* ===================== CONFIG ===================== */
const SUPABASE_URL = 'https://watrosnylvkiuvuptdtp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhdHJvc255bHZraXV2dXB0ZHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MzE2NzEsImV4cCI6MjA4MjUwNzY3MX0.ku6_Ngf2JRJ8fxLs_Q-EySgCU37MjUK3WofpO9bazds';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const BUSINESS = {
  name: "ORE-OFE OLUWA",
  address: "No. 1, Bisiriyu Owokade Street, Molete, Lagos.",
  commission_rate: 0.05 // 5% Agent Commission
};

export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [view, setView] = useState('dashboard');
  const [members, setMembers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [confirm, setConfirm] = useState(null);

  // Global Utilities
  const toast = (msg, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const haptic = () => { if (window.navigator.vibrate) window.navigator.vibrate(50); };

  const fetchData = async () => {
    setLoading(true);
    const [m, t] = await Promise.all([
      supabase.from('contributors').select('*').order('full_name'),
      supabase.from('transactions').select('*').order('created_at', { ascending: false })
    ]);
    setMembers(m.data || []);
    setTransactions(t.data || []);
    setLoading(false);
  };

  useEffect(() => { if (user) fetchData(); }, [user]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const u = e.target.username.value.trim().toLowerCase();
    const p = e.target.password.value;
    if (u === 'oreofe' && p === 'oreofe') {
      setUser({ id: 'admin' }); setProfile({ full_name: 'Admin', role: 'admin' });
    } else {
      const { data } = await supabase.from('employees').select('*').eq('employee_id_number', u).eq('password', p).single();
      if (data) { setUser({ id: data.id }); setProfile({ ...data, role: 'agent' }); }
      else toast('Invalid login credentials', 'error');
    }
  };

  if (!user) return <LoginScreen onLogin={handleLogin} />;

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <div style={{ ...styles.app, background: theme.bg, color: theme.text }}>
      <header style={{ ...styles.header, background: theme.card, borderBottom: `1px solid ${theme.border}` }}>
        <div onClick={() => setIsDark(!isDark)} style={styles.brandBox}>
          <h1 style={{ ...styles.brand, color: theme.primary }}>{BUSINESS.name}</h1>
          <p style={styles.subBrand}>{profile?.role.toUpperCase()}</p>
        </div>
        <button onClick={() => setIsDark(!isDark)} style={styles.iconBtn}>
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      <main style={styles.main}>
        {loading ? <SkeletonLoader /> : (
          profile?.role === 'admin' ? 
            <AdminPortal view={view} members={members} transactions={transactions} onRefresh={fetchData} toast={toast} setConfirm={setConfirm} /> :
            <AgentPortal view={view} profile={profile} members={members} transactions={transactions} onRefresh={fetchData} toast={toast} haptic={haptic} />
        )}
      </main>

      {/* Floating Action Button for Agents */}
      {profile?.role === 'agent' && view !== 'scan' && (
        <button style={styles.fab} onClick={() => setView('scan')}>
          <Camera size={28} />
        </button>
      )}

      <nav style={{ ...styles.nav, background: theme.card, borderTop: `1px solid ${theme.border}` }}>
        <NavBtn act={view === 'dashboard'} icon={<LayoutDashboard size={20}/>} lab="Home" onClick={() => setView('dashboard')} />
        <NavBtn act={view === 'members'} icon={<Users size={20}/>} lab="Members" onClick={() => setView('members')} />
        <NavBtn act={view === 'history'} icon={<History size={20}/>} lab="Logs" onClick={() => setView('history')} />
        <NavBtn act={false} icon={<LogOut size={20}/>} lab="Exit" onClick={() => setConfirm({ msg: 'Logout of the system?', onOk: () => setUser(null) })} />
      </nav>

      {/* Overlays */}
      <ToastContainer toasts={toasts} />
      {confirm && <ConfirmModal data={confirm} onClose={() => setConfirm(null)} theme={theme} />}
    </div>
  );
}

/* ==================== PORTALS ==================== */

const AgentPortal = ({ view, profile, members, transactions, onRefresh, toast, haptic }) => {
  const myLogs = transactions.filter(t => t.employee_id === profile.id);
  const today = new Date().toISOString().slice(0, 10);
  const todayTotal = myLogs.filter(t => t.created_at.startsWith(today)).reduce((s, t) => s + t.amount, 0);

  if (view === 'dashboard') return (
    <div style={styles.fadeIn}>
      <div style={styles.heroCard}>
        <small>COLLECTED TODAY</small>
        <h1 style={{fontSize: 32}}>₦{todayTotal.toLocaleString()}</h1>
        <div style={styles.heroLine} />
        <small>COMMISSION EARNED: ₦{(todayTotal * BUSINESS.commission_rate).toLocaleString()}</small>
      </div>
      
      <div style={styles.sectionHeader}>
        <h3>Quick Tools</h3>
        <button onClick={onRefresh} style={styles.iconBtn}><RefreshCw size={16}/></button>
      </div>

      <div style={styles.grid}>
        <div style={styles.toolCard} onClick={() => onRefresh()}>
          <RefreshCw size={24} color="#3b82f6"/>
          <span>Sync Data</span>
        </div>
        <div style={styles.toolCard}>
          <Wallet size={24} color="#10b981"/>
          <span>Earning Report</span>
        </div>
      </div>
    </div>
  );

  if (view === 'scan') return <ScannerView profile={profile} onRefresh={onRefresh} toast={toast} haptic={haptic} />;
  if (view === 'members') return <MemberDirectory members={members} onRefresh={onRefresh} toast={toast} isAgent={true} profile={profile} />;
  if (view === 'history') return <TransactionHistory transactions={myLogs} />;
};

const AdminPortal = ({ view, members, transactions, onRefresh, toast, setConfirm }) => {
  const today = new Date().toISOString().slice(0, 10);
  const todayRev = transactions.filter(t => t.created_at.startsWith(today)).reduce((s, t) => s + t.amount, 0);

  if (view === 'dashboard') return (
    <div style={styles.fadeIn}>
      <div style={styles.grid}>
        <div style={styles.statCard}>
          <ArrowUpRight size={20} color="#10b981" />
          <h2>₦{todayRev.toLocaleString()}</h2>
          <p>Today Total</p>
        </div>
        <div style={styles.statCard}>
          <Users size={20} color="#3b82f6" />
          <h2>{members.length}</h2>
          <p>Members</p>
        </div>
      </div>
      <h3 style={{margin: '25px 0 15px'}}>Business Health</h3>
      <div style={styles.item}>
        <span>Active Members</span>
        <span style={{color: '#10b981'}}>{members.filter(m => m.status !== 'locked').length}</span>
      </div>
      <div style={styles.item}>
        <span>System Status</span>
        <span style={{color: '#3b82f6'}}>Online</span>
      </div>
    </div>
  );

  if (view === 'members') return <MemberDirectory members={members} onRefresh={onRefresh} toast={toast} isAgent={false} setConfirm={setConfirm} />;
  if (view === 'history') return <TransactionHistory transactions={transactions} isAdmin={true} />;
};

/* ==================== FEATURE COMPONENTS ==================== */

const ScannerView = ({ profile, onRefresh, toast, haptic }) => {
  const [scanning, setScanning] = useState(false);
  const [member, setMember] = useState(null);
  const [amount, setAmount] = useState('');

  const handleScan = async (data) => {
    try {
      const parsed = JSON.parse(data);
      const { data: mem } = await supabase.from('contributors').select('*').eq('id', parsed.id).single();
      if (!mem) throw new Error();
      if (mem.status === 'locked') { toast('Member Account Locked', 'error'); return; }
      haptic();
      setMember(mem);
      setAmount(mem.expected_amount);
      setScanning(false);
    } catch (e) { toast('Invalid Member QR', 'error'); }
  };

  const processPayment = async (isManual = false, manualMember = null) => {
    const targetMember = manualMember || member;
    const payAmt = Number(amount);
    
    const { error } = await supabase.from('transactions').insert([{
      contributor_id: targetMember.id,
      contributor_name: targetMember.full_name,
      employee_id: profile.id,
      amount: payAmt,
      payment_type: payAmt === targetMember.expected_amount ? 'full' : 'partial',
      agent_commission: payAmt * BUSINESS.commission_rate,
      ajo_owner_id: 'admin'
    }]);

    if (!error) {
      // Update member balance
      await supabase.rpc('increment_balance', { member_id: targetMember.id, amt: payAmt });
      toast(`₦${payAmt} Recorded Successfully`, 'success');
      setMember(null); setAmount(''); onRefresh();
    }
  };

  if (member) return (
    <div style={styles.paymentModal}>
      <h2 style={{margin: 0}}>{member.full_name}</h2>
      <p style={{color: '#94a3b8', fontSize: 13}}>Daily Target: ₦{member.expected_amount}</p>
      
      <div style={{margin: '30px 0'}}>
        <label style={styles.label}>ENTER AMOUNT (₦)</label>
        <input 
          type="number" 
          value={amount} 
          onChange={(e) => setAmount(e.target.value)} 
          style={styles.bigInput}
        />
      </div>

      <div style={{display: 'flex', gap: 10}}>
        <button onClick={() => processPayment()} style={{...styles.btnP, flex: 2}}>CONFIRM PAYMENT</button>
        <button onClick={() => setMember(null)} style={{...styles.btnS, flex: 1}}>CANCEL</button>
      </div>
    </div>
  );

  return (
    <div style={{textAlign: 'center'}}>
      {!scanning ? (
        <div style={styles.emptyState}>
          <Camera size={64} color="#1e293b" />
          <h2>Camera Ready</h2>
          <p>Point at member card to collect payment</p>
          <button onClick={() => setScanning(true)} style={{...styles.btnP, width: '100%', marginTop: 20}}>START SCANNER</button>
        </div>
      ) : (
        <div style={styles.scanBox}>
          <Scanner onScan={(d) => d[0] && handleScan(d[0].rawValue)} />
          <button onClick={() => setScanning(false)} style={styles.closeBtn}><X/></button>
        </div>
      )}
    </div>
  );
};

const MemberDirectory = ({ members, onRefresh, toast, isAgent, profile, setConfirm }) => {
  const [query, setQuery] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState(null);

  const filtered = members.filter(m => 
    m.full_name.toLowerCase().includes(query.toLowerCase()) || 
    m.registration_number.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={styles.fadeIn}>
      <div style={styles.searchBox}>
        <Search size={18} color="#64748b" />
        <input placeholder="Search members..." value={query} onChange={e => setQuery(e.target.value)} style={styles.searchIn} />
      </div>

      {!isAgent && (
        <button onClick={() => setShowAdd(true)} style={{...styles.btnP, width: '100%', marginBottom: 20}}>
          <UserPlus size={18}/> Add New Member
        </button>
      )}

      {showAdd && <AddMemberForm onRefresh={onRefresh} onClose={() => setShowAdd(false)} toast={toast} />}

      {filtered.length === 0 ? <EmptyState lab="No members found" /> : 
        filtered.map(m => (
          <div key={m.id} style={styles.item}>
            <div style={{flex: 1}}>
              <p style={{margin: 0, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 6}}>
                {m.full_name} {m.status === 'locked' && <Ban size={12} color="#ef4444" />}
              </p>
              <small style={{color: '#3b82f6'}}>REG: {m.registration_number} • ₦{m.balance || 0} Saved</small>
            </div>
            <div style={{display: 'flex', gap: 5}}>
              <button onClick={() => setSelected(m)} style={styles.iconBtn}><Printer size={18}/></button>
              {!isAgent && (
                <button onClick={() => setConfirm({ msg: 'Delete this member?', onOk: () => supabase.from('contributors').delete().eq('id', m.id).then(onRefresh) })} 
                        style={styles.iconBtn}><Trash2 size={18} color="#ef4444"/></button>
              )}
            </div>
          </div>
        ))
      }
      {selected && <MemberCard member={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

/* ==================== UI PRIMITIVES ==================== */

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

const ConfirmModal = ({ data, onClose, theme }) => (
  <div style={styles.overlay}>
    <div style={{ ...styles.confirmBox, background: theme.card }}>
      <h3>Are you sure?</h3>
      <p style={{color: '#94a3b8', margin: '10px 0 20px'}}>{data.msg}</p>
      <div style={{display: 'flex', gap: 10}}>
        <button onClick={() => { data.onOk(); onClose(); }} style={{...styles.btnP, flex: 1}}>YES</button>
        <button onClick={onClose} style={{...styles.btnS, flex: 1}}>NO</button>
      </div>
    </div>
  </div>
);

const SkeletonLoader = () => (
  <div style={styles.fadeIn}>
    {[1,2,3,4].map(i => <div key={i} style={styles.skeleton} />)}
  </div>
);

const EmptyState = ({ lab }) => (
  <div style={styles.emptyState}>
    <AlertCircle size={40} color="#1e293b" />
    <p>{lab}</p>
  </div>
);

// (Other helper components like AddMemberForm, MemberCard, TransactionHistory would follow same style patterns)

const LoginScreen = ({ onLogin }) => (
  <div style={styles.loginPage}>
    <div style={styles.loginCard}>
      <Landmark size={48} color="#3b82f6" />
      <h1 style={{margin: '10px 0 5px'}}>{BUSINESS.name}</h1>
      <p style={{color: '#94a3b8', fontSize: 13, marginBottom: 30}}>Financial Security Management</p>
      <form onSubmit={onLogin}>
        <input name="username" placeholder="Login ID" style={styles.input} required />
        <input name="password" type="password" placeholder="Password" style={styles.input} required />
        <button type="submit" style={{...styles.btnP, width: '100%', padding: 18}}>ENTER SYSTEM</button>
      </form>
    </div>
  </div>
);

/* ==================== STYLES ==================== */
const darkTheme = { bg: '#020617', card: '#0f172a', text: '#f8fafc', border: '#1e293b', primary: '#3b82f6' };
const lightTheme = { bg: '#f1f5f9', card: '#ffffff', text: '#0f172a', border: '#e2e8f0', primary: '#2563eb' };

const styles = {
  app: { minHeight: '100vh', transition: 'all 0.3s ease' },
  header: { padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50 },
  brandBox: { cursor: 'pointer' },
  brand: { fontSize: 18, fontWeight: 900, margin: 0 },
  subBrand: { fontSize: 9, margin: 0, letterSpacing: 1 },
  main: { padding: 20, paddingBottom: 120 },
  heroCard: { background: 'linear-gradient(135deg, #1e40af, #3b82f6)', padding: 25, borderRadius: 24, color: '#fff', marginBottom: 25 },
  heroLine: { height: 1, background: 'rgba(255,255,255,0.1)', margin: '15px 0' },
  statCard: { background: '#0f172a', padding: 20, borderRadius: 20, border: '1px solid #1e293b', flex: 1 },
  grid: { display: 'flex', gap: 15 },
  item: { padding: 16, borderRadius: 16, border: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, background: '#0f172a' },
  nav: { position: 'fixed', bottom: 0, width: '100%', display: 'flex', justifyContent: 'space-around', padding: '12px 0' },
  navBtn: { background: 'none', border: 'none', color: '#64748b', fontSize: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  navActive: { background: 'none', border: 'none', color: '#3b82f6', fontSize: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, fontWeight: 'bold' },
  fab: { position: 'fixed', bottom: 90, right: 20, width: 64, height: 64, borderRadius: '50%', background: '#3b82f6', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 25px rgba(59,130,246,0.5)', zIndex: 40 },
  btnP: { background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 },
  btnS: { background: '#1e293b', color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer' },
  iconBtn: { background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' },
  input: { width: '100%', padding: 15, marginBottom: 15, background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, color: '#fff', boxSizing: 'border-box' },
  searchBox: { display: 'flex', alignItems: 'center', gap: 10, background: '#0f172a', padding: '0 15px', borderRadius: 12, marginBottom: 20, border: '1px solid #1e293b' },
  searchIn: { background: 'none', border: 'none', padding: '15px 0', color: '#fff', width: '100%', outline: 'none' },
  toastWrap: { position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 10 },
  toast: { padding: '12px 24px', borderRadius: 30, color: '#fff', fontWeight: 'bold', fontSize: 14, boxShadow: '0 10px 20px rgba(0,0,0,0.2)', animation: 'slideDown 0.3s ease' },
  skeleton: { height: 70, background: '#0f172a', borderRadius: 16, marginBottom: 12, animation: 'pulse 1.5s infinite' },
  emptyState: { textAlign: 'center', padding: '60px 20px', color: '#64748b' },
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 },
  confirmBox: { padding: 30, borderRadius: 24, width: '100%', maxWidth: 320, textAlign: 'center' },
  paymentModal: { background: '#0f172a', padding: 30, borderRadius: 24, textAlign: 'center', border: '1px solid #3b82f6' },
  bigInput: { background: 'none', border: 'none', borderBottom: '2px solid #3b82f6', color: '#fff', fontSize: 40, width: '100%', textAlign: 'center', outline: 'none', fontWeight: 'bold' },
  label: { fontSize: 10, color: '#3b82f6', letterSpacing: 2 },
  scanBox: { position: 'relative', borderRadius: 24, overflow: 'hidden' },
  closeBtn: { position: 'absolute', top: 15, right: 15, background: '#000', color: '#fff', border: 'none', borderRadius: '50%', padding: 10 },
  loginPage: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  loginCard: { background: '#0f172a', padding: 40, borderRadius: 32, width: '100%', maxWidth: 400, textAlign: 'center', border: '1px solid #1e293b' },
  fadeIn: { animation: 'fadeIn 0.4s ease-out' }
};

if (typeof document !== 'undefined') {
  const s = document.createElement('style');
  s.innerHTML = `
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 0.8; } 100% { opacity: 0.5; } }
  `;
  document.head.appendChild(s);
}
