import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Scanner } from '@yudiel/react-qr-scanner';
import {
  Users, UserPlus, LayoutDashboard, LogOut, Landmark, X, Camera, 
  RefreshCw, Printer, AlertCircle, Moon, Sun, UserCheck, Search,
  TrendingUp, Calendar, Trash2, Key, MapPin, Phone, Hash, CheckCircle2,
  WifiOff, User, CreditCard, ChevronLeft, Download, Edit3, Plus, 
  Zap, Flame, History, Volume2, Type, ArrowUpRight, Check
} from 'lucide-react';

/* ===================== CONFIG & INITIALIZATION ===================== */
const CONFIG = {
  supabase: {
    url: 'https://watrosnylvkiuvuptdtp.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhdHJvc255bHZraXV2dXB0ZHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MzE2NzEsImV4cCI6MjA4MjUwNzY3MX0.ku6_Ngf2JRJ8fxLs_Q-EySgCU37MjUK3WofpO9bazds'
  },
  business: { name: "ORE-OFE OLUWA", commissionRate: 0.05 },
  admin: { username: 'oreofe', password: 'oreofe' }
};

const supabase = createClient(CONFIG.supabase.url, CONFIG.supabase.key);

/* ===================== CUSTOM HOOKS ===================== */
const useOfflineSync = (onSyncSuccess) => {
  const [queue, setQueue] = useState(() => JSON.parse(localStorage.getItem('ajo_queue') || '[]'));

  useEffect(() => {
    localStorage.setItem('ajo_queue', JSON.stringify(queue));
    if (navigator.onLine && queue.length > 0) syncQueue();
  }, [queue]);

  const addToQueue = (data) => setQueue(prev => [...prev, { ...data, id: Date.now() }]);

  const syncQueue = async () => {
    const item = queue[0];
    const { error } = await supabase.from('transactions').insert([item.payload]);
    if (!error) {
      setQueue(prev => prev.slice(1));
      onSyncSuccess();
    }
  };

  return { queue, addToQueue };
};

const useCountUp = (end, duration = 800) => {
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
  }, [end]);
  return count;
};

/* ===================== MAIN APP ===================== */
export default function App() {
  const [auth, setAuth] = useState(null);
  const [view, setView] = useState('dashboard');
  const [data, setData] = useState({ members: [], agents: [], transactions: [] });
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const [toasts, setToasts] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [sheet, setSheet] = useState({ show: false, content: null, title: '' });
  const [textSize, setTextSize] = useState('normal'); // small, normal, large

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
    if (type === 'error' && navigator.vibrate) navigator.vibrate([50, 50, 50]);
  }, []);

  const fetchData = useCallback(async () => {
    if (!auth) return;
    setLoading(true);
    try {
      const [m, t, e] = await Promise.all([
        supabase.from('contributors').select('*').order('full_name'),
        supabase.from('transactions').select('*').order('created_at', { ascending: false }),
        supabase.from('employees').select('*').order('full_name')
      ]);
      setData({ members: m.data || [], transactions: t.data || [], agents: e.data || [] });
    } finally { setLoading(false); }
  }, [auth]);

  const { queue, addToQueue } = useOfflineSync(fetchData);

  useEffect(() => { if (auth) fetchData(); }, [auth, fetchData]);

  const handleLogin = async (creds) => {
    setLoading(true);
    const u = creds.username.trim().toLowerCase();
    if (u === CONFIG.admin.username && creds.password === CONFIG.admin.password) {
      setAuth({ id: 'admin', role: 'admin', name: 'Admin' });
    } else {
      const { data: agent } = await supabase.from('employees').select('*').eq('employee_id_number', u).eq('password', creds.password).single();
      if (agent) setAuth({ id: agent.id, role: 'agent', name: agent.full_name, data: agent });
      else showToast("Login Failed", "error");
    }
    setLoading(false);
  };

  const colors = theme === 'dark' ? DARK_THEME : LIGHT_THEME;

  if (!auth) return <LoginScreen onLogin={handleLogin} loading={loading} colors={colors} />;

  return (
    <div style={{ 
      ...styles.app, 
      background: colors.bg, 
      color: colors.text, 
      fontSize: textSize === 'small' ? '14px' : textSize === 'large' ? '18px' : '16px' 
    }}>
      {!isOnline && <div style={styles.offlineBanner}><WifiOff size={14} /> Offline: Scans will be queued</div>}
      
      <Header 
        auth={auth} 
        theme={theme} 
        onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} 
        onSettings={() => setSheet({ show: true, title: 'Settings', content: <SettingsPanel textSize={textSize} setTextSize={setTextSize} onLogout={() => setAuth(null)} colors={colors} /> })}
        colors={colors} 
      />

      <main style={styles.main}>
        {loading ? <SkeletonLoader type={view === 'dashboard' ? 'card' : 'list'} /> : (
          <>
            {auth.role === 'admin' ? 
              <AdminPortal view={view} data={data} colors={colors} showToast={showToast} onRefresh={fetchData} setSheet={setSheet} /> : 
              <AgentPortal view={view} profile={auth.data} data={data} colors={colors} showToast={showToast} onRefresh={fetchData} setSheet={setSheet} addToQueue={addToQueue} />
            }
          </>
        )}
      </main>

      <FAB role={auth.role} onClick={() => setSheet({ 
        show: true, 
        title: auth.role === 'admin' ? 'New Member' : 'Quick Scan',
        content: auth.role === 'admin' ? <MemberForm colors={colors} onSuccess={() => { setSheet({ show: false }); fetchData(); }} /> : <ScannerView profile={auth.data} colors={colors} onRefresh={fetchData} showToast={showToast} />
      })} colors={colors} />

      <Navigation view={view} role={auth.role} onNavigate={setView} colors={colors} />
      
      <ToastContainer toasts={toasts} />
      <BottomSheet sheet={sheet} onClose={() => setSheet({ ...sheet, show: false })} colors={colors} />
    </div>
  );
}

/* ===================== PORTALS ===================== */

const AdminPortal = ({ view, data, colors, setSheet, onRefresh }) => {
  const stats = useMemo(() => ({
    revenue: data.transactions.reduce((s, t) => s + (t.amount || 0), 0),
    agents: data.agents.length,
    activeToday: new Set(data.transactions.filter(t => t.created_at.startsWith(new Date().toISOString().slice(0, 10))).map(t => t.employee_id)).size
  }), [data]);

  if (view === 'dashboard') return (
    <div style={styles.fadeIn}>
      <Breadcrumbs path={['Dashboard']} colors={colors} />
      <div style={styles.statsGrid}>
        <StatCard title="Total Revenue" value={`₦${stats.revenue.toLocaleString()}`} icon={<TrendingUp />} colors={colors} highlight />
        <StatCard title="Active Agents" value={`${stats.activeToday}/${stats.agents}`} icon={<UserCheck />} colors={colors} />
      </div>
      <SectionHeader title="Recent Activity" icon={<Zap size={18}/>} action={() => exportToCSV('Transactions', data.transactions)} />
      <TransactionList transactions={data.transactions.slice(0, 15)} colors={colors} />
    </div>
  );

  if (view === 'members') return <MemberManagement members={data.members} colors={colors} setSheet={setSheet} onRefresh={onRefresh} />;
  if (view === 'agents') return <AgentManagement agents={data.agents} transactions={data.transactions} colors={colors} onRefresh={onRefresh} />;
  return null;
};

const AgentPortal = ({ view, profile, data, colors, showToast, onRefresh, addToQueue, setSheet }) => {
  const stats = useMemo(() => {
    const myTs = data.transactions.filter(t => t.employee_id === profile.id);
    const today = new Date().toISOString().slice(0, 10);
    const todayTotal = myTs.filter(t => t.created_at.startsWith(today)).reduce((s, t) => s + (t.amount || 0), 0);
    return { todayTotal, target: 50000 }; // Example target
  }, [data.transactions, profile.id]);

  if (view === 'dashboard') return (
    <div style={styles.fadeIn}>
      <div style={{ ...styles.heroCard, background: `linear-gradient(135deg, ${colors.primary}, #1d4ed8)` }}>
        <small>COLLECTED TODAY</small>
        <h1 style={{ fontSize: 36 }}>₦{useCountUp(stats.todayTotal).toLocaleString()}</h1>
        <div style={styles.progressLabel}>Target: ₦{stats.target.toLocaleString()}</div>
        <div style={styles.progressBarBg}><div style={{ ...styles.progressBarFill, width: `${Math.min((stats.todayTotal/stats.target)*100, 100)}%` }}></div></div>
      </div>
      <SectionHeader title="Your History" icon={<History size={18}/>} />
      <TransactionList transactions={data.transactions.filter(t => t.employee_id === profile.id).slice(0, 10)} colors={colors} />
    </div>
  );

  if (view === 'members') return <MemberManagement members={data.members} colors={colors} setSheet={setSheet} onRefresh={onRefresh} />;
  if (view === 'scan') return <ScannerView profile={profile} colors={colors} onRefresh={onRefresh} showToast={showToast} />;
  return null;
};

/* ===================== COMPONENTS ===================== */

const ScannerView = ({ profile, colors, onRefresh, showToast }) => {
  const [member, setMember] = useState(null);
  const [amount, setAmount] = useState('');
  const [history, setHistory] = useState([]);

  const handleScan = async (res) => {
    try {
      if (navigator.vibrate) navigator.vibrate(100);
      const { id } = JSON.parse(res);
      const { data: m } = await supabase.from('contributors').select('*').eq('id', id).single();
      if (m) { setMember(m); setAmount(m.expected_amount.toString()); }
    } catch (e) { showToast("Invalid Card", "error"); }
  };

  if (member) return (
    <div style={styles.sheetContent}>
      <div style={styles.memberHeader}>
        <div style={styles.avatarLarge}>{member.full_name[0]}</div>
        <h3>{member.full_name}</h3>
        <p>Expected: ₦{member.expected_amount}</p>
      </div>

      <div style={styles.currencyPad}>
        <div style={styles.amountDisplay}>₦{amount || '0'}</div>
        <div style={styles.padGrid}>
          {[500, 1000, 2000, 5000].map(v => (
            <button key={v} onClick={() => setAmount(v.toString())} style={{...styles.padBtn, background: colors.cardAlt}}>+₦{v}</button>
          ))}
        </div>
        <input 
          type="number" 
          value={amount} 
          onChange={e => setAmount(e.target.value)} 
          placeholder="Enter Custom Amount" 
          style={{...styles.input, textAlign: 'center', fontSize: 20, marginTop: 15}} 
        />
      </div>

      <button 
        style={{...styles.btnPrimary, background: colors.primary, marginTop: 20}}
        onClick={async () => {
          const payload = { contributor_id: member.id, full_name: member.full_name, amount: Number(amount), employee_id: profile.id, employee_name: profile.full_name, expected_amount: member.expected_amount };
          const { error } = await supabase.from('transactions').insert([payload]);
          if (!error) {
            showToast("Payment Saved", "success");
            setHistory(prev => [payload, ...prev].slice(0, 3));
            setMember(null);
            onRefresh();
          }
        }}
      >Confirm ₦{amount} Collection</button>
    </div>
  );

  return (
    <div style={styles.scannerWrapper}>
      <div style={styles.scannerBox}>
        <Scanner onScan={(r) => r?.[0] && handleScan(r[0].rawValue)} />
        <div style={styles.scannerOverlay}></div>
      </div>
      {history.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <small style={{ opacity: 0.6 }}>RECENT SCANS</small>
          {history.map((h, i) => (
            <div key={i} style={styles.historyItem}>
              <Check size={14} color="#10b981" /> <span>{h.full_name}</span> <strong>₦{h.amount}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const TransactionList = ({ transactions, colors }) => (
  <div style={styles.list}>
    {transactions.length === 0 ? <EmptyState msg="No transactions found" /> : 
      transactions.map(t => {
        const isToday = t.created_at.startsWith(new Date().toISOString().slice(0, 10));
        const type = t.amount > t.expected_amount ? 'Extra' : t.amount < t.expected_amount ? 'Partial' : 'Paid';
        const badgeColor = type === 'Extra' ? '#a855f7' : type === 'Partial' ? '#f59e0b' : '#10b981';
        
        return (
          <div key={t.id} style={{ 
            ...styles.listItem, 
            background: colors.card, 
            borderColor: isToday ? colors.primary + '44' : colors.border,
            borderLeft: `4px solid ${badgeColor}`
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <strong>{t.full_name}</strong>
                {isToday && <span style={styles.todayBadge}>Today</span>}
              </div>
              <div style={styles.subtext}>By {t.employee_name || 'Admin'} • {new Date(t.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 'bold', color: colors.text }}>₦{t.amount.toLocaleString()}</div>
              <div style={{ fontSize: 9, color: badgeColor, fontWeight: 'bold' }}>{type.toUpperCase()}</div>
            </div>
          </div>
        );
      })
    }
  </div>
);

const MemberManagement = ({ members, colors, setSheet, onRefresh }) => {
  const [search, setSearch] = useState('');
  const filtered = members.filter(m => m.full_name.toLowerCase().includes(search.toLowerCase()) || m.registration_no.includes(search));

  return (
    <div style={styles.fadeIn}>
      <div style={styles.stickySubNav}>
        <SearchBar value={search} onChange={setSearch} colors={colors} />
      </div>
      <div style={styles.list}>
        {filtered.map(m => (
          <div key={m.id} style={{ ...styles.listItem, background: colors.card }} onClick={() => setSheet({
            show: true, title: 'Member Profile', content: <MemberProfile member={m} colors={colors} onRefresh={onRefresh} />
          })}>
            <div style={styles.avatar}>{m.full_name[0]}</div>
            <div style={{ flex: 1 }}>
              <strong>{m.full_name}</strong>
              <div style={styles.subtext}>ID: {m.registration_no} • Streak: <Flame size={10} color="#f97316"/> 7 days</div>
            </div>
            <ChevronLeft size={18} style={{ transform: 'rotate(180deg)', opacity: 0.3 }} />
          </div>
        ))}
      </div>
    </div>
  );
};

const MemberForm = ({ member, colors, onSuccess }) => {
  const [form, setForm] = useState(member || { full_name: '', registration_no: '', phone_number: '', address: '', expected_amount: 1000 });
  const [errors, setErrors] = useState({});

  const validate = () => {
    let e = {};
    if (!form.full_name) e.n = "Required";
    if (form.phone_number.length < 10) e.p = "Invalid Phone";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    const { error } = member 
      ? await supabase.from('contributors').update(form).eq('id', member.id)
      : await supabase.from('contributors').insert([form]);
    if (!error) onSuccess();
  };

  return (
    <div style={styles.sheetContent}>
      <div style={styles.inputGroup}>
        <label>Full Name</label>
        <input value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} style={{...styles.input, borderColor: errors.n ? '#ef4444' : '#ddd'}} />
      </div>
      <div style={styles.inputGroup}>
        <label>Phone (+234)</label>
        <input value={form.phone_number} onChange={e => setForm({...form, phone_number: e.target.value.replace(/\D/g, '')})} style={{...styles.input, borderColor: errors.p ? '#ef4444' : '#ddd'}} />
      </div>
      <div style={styles.inputGroup}>
        <label>Daily Amount</label>
        <input type="number" value={form.expected_amount} onChange={e => setForm({...form, expected_amount: Number(e.target.value)})} style={styles.input} />
      </div>
      <button onClick={handleSave} style={{...styles.btnPrimary, background: colors.primary, marginTop: 10}}><Save size={18}/> Save Member</button>
    </div>
  );
};

/* ===================== UI WRAPPERS ===================== */

const BottomSheet = ({ sheet, onClose, colors }) => (
  <>
    <div style={{ ...styles.overlay, opacity: sheet.show ? 1 : 0, pointerEvents: sheet.show ? 'auto' : 'none' }} onClick={onClose} />
    <div style={{ ...styles.sheet, background: colors.card, transform: sheet.show ? 'translateY(0)' : 'translateY(100%)' }}>
      <div style={styles.sheetHandle} />
      <div style={styles.sheetHeader}>
        <h3>{sheet.title}</h3>
        <button onClick={onClose} style={styles.iconBtn}><X size={20}/></button>
      </div>
      <div style={styles.sheetBody}>{sheet.content}</div>
    </div>
  </>
);

const Header = ({ auth, theme, onToggleTheme, onSettings, colors }) => (
  <header style={{ ...styles.header, background: colors.card, borderBottom: `1px solid ${colors.border}` }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ ...styles.avatarSmall, background: colors.primary }}>{auth.name[0]}</div>
      <div><div style={{ fontWeight: 'bold', fontSize: 14 }}>{CONFIG.business.name}</div><div style={styles.subtext}>{auth.role.toUpperCase()}</div></div>
    </div>
    <div style={{ display: 'flex', gap: 5 }}>
      <button onClick={onToggleTheme} style={styles.iconBtn}>{theme === 'dark' ? <Sun size={20} color={colors.primary}/> : <Moon size={20}/>}</button>
      <button onClick={onSettings} style={styles.iconBtn}><User size={20}/></button>
    </div>
  </header>
);

const FAB = ({ onClick, colors }) => (
  <button onClick={onClick} style={{ ...styles.fab, background: colors.primary }}>
    <Plus size={28} color="#fff" />
  </button>
);

const Navigation = ({ view, role, onNavigate, colors }) => (
  <nav className="bottom-nav" style={{ ...styles.nav, background: colors.card, borderTop: `1px solid ${colors.border}` }}>
    <NavBtn active={view === 'dashboard'} icon={<LayoutDashboard/>} label="Home" onClick={() => onNavigate('dashboard')} />
    <NavBtn active={view === 'members'} icon={<Users/>} label="Members" onClick={() => onNavigate('members')} />
    {role === 'admin' ? 
      <NavBtn active={view === 'agents'} icon={<UserCheck/>} label="Agents" onClick={() => onNavigate('agents')} /> :
      <NavBtn active={view === 'scan'} icon={<Camera/>} label="Scan" onClick={() => onNavigate('scan')} />
    }
  </nav>
);

const NavBtn = ({ active, icon, label, onClick }) => (
  <button onClick={onClick} style={{ ...styles.navBtn, color: active ? '#3b82f6' : '#94a3b8' }}>
    {icon}
    <span style={{ fontSize: 10, fontWeight: active ? 'bold' : 'normal' }}>{label}</span>
  </button>
);

/* ===================== STYLES ===================== */
const DARK_THEME = { bg: '#020617', card: '#0f172a', text: '#f8fafc', border: '#1e293b', primary: '#3b82f6', cardAlt: '#1e293b' };
const LIGHT_THEME = { bg: '#f8fafc', card: '#ffffff', text: '#0f172a', border: '#e2e8f0', primary: '#2563eb', cardAlt: '#f1f5f9' };

const styles = {
  app: { minHeight: '100vh', position: 'relative', paddingBottom: 80, transition: '0.3s' },
  header: { padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 },
  main: { padding: '16px' },
  nav: { display: 'flex', justifyContent: 'space-around', padding: '10px 0', zIndex: 100 },
  navBtn: { background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: 4 },
  fab: { position: 'fixed', bottom: 90, right: 20, width: 60, height: 60, borderRadius: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', border: 'none', zIndex: 200 },
  heroCard: { padding: 24, borderRadius: 24, color: '#fff', marginBottom: 20 },
  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 },
  statCard: { padding: 16, borderRadius: 20, border: '1px solid', textAlign: 'center' },
  list: { display: 'flex', flexDirection: 'column', gap: 10 },
  listItem: { display: 'flex', alignItems: 'center', padding: 14, borderRadius: 18, border: '1px solid', gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, background: '#3b82f622', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
  avatarLarge: { width: 80, height: 80, borderRadius: 40, background: '#3b82f622', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 10px' },
  avatarSmall: { width: 32, height: 32, borderRadius: 16, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 12 },
  subtext: { fontSize: 11, opacity: 0.6 },
  progressBarBg: { height: 8, background: 'rgba(255,255,255,0.2)', borderRadius: 4, marginTop: 8 },
  progressBarFill: { height: '100%', background: '#fff', borderRadius: 4, transition: '1s' },
  progressLabel: { fontSize: 12, marginTop: 12, fontWeight: 'bold' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, transition: '0.3s' },
  sheet: { position: 'fixed', bottom: 0, left: 0, right: 0, borderTopLeftRadius: 24, borderTopRightRadius: 24, zIndex: 1001, transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)', maxHeight: '90vh', overflowY: 'auto' },
  sheetHandle: { width: 40, height: 5, background: '#cbd5e1', borderRadius: 3, margin: '12px auto' },
  sheetHeader: { padding: '0 20px 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  sheetBody: { padding: '0 20px 30px' },
  input: { width: '100%', padding: 14, borderRadius: 12, border: '1px solid #ddd', boxSizing: 'border-box', outline: 'none' },
  btnPrimary: { width: '100%', padding: 16, borderRadius: 16, border: 'none', color: '#fff', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 },
  iconBtn: { background: 'none', border: 'none', padding: 8 },
  todayBadge: { background: '#10b98122', color: '#10b981', fontSize: 9, padding: '2px 6px', borderRadius: 4, fontWeight: 'bold' },
  offlineBanner: { background: '#ef4444', color: '#fff', textAlign: 'center', padding: 4, fontSize: 10, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 },
  currencyPad: { textAlign: 'center', margin: '20px 0' },
  amountDisplay: { fontSize: 36, fontWeight: 'bold', marginBottom: 15 },
  padGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  padBtn: { padding: 12, borderRadius: 12, border: 'none', fontWeight: 'bold' },
  scannerWrapper: { borderRadius: 24, overflow: 'hidden' },
  scannerBox: { position: 'relative', width: '100%', aspectRatio: '1/1' },
  scannerOverlay: { position: 'absolute', inset: 0, border: '40px solid rgba(0,0,0,0.5)', pointerEvents: 'none' },
  historyItem: { display: 'flex', gap: 10, padding: 8, fontSize: 13, borderBottom: '1px solid #eee' },
  fadeIn: { animation: 'fadeIn 0.3s ease-out' }
};

if (typeof document !== 'undefined') {
  const s = document.createElement('style');
  s.textContent = `
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @media (max-width: 768px) { .bottom-nav { position: fixed !important; bottom: 0; left: 0; right: 0; } }
    .skeleton { background: #cbd5e1; animation: pulse 1.5s infinite; }
    @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 0.3; } 100% { opacity: 0.6; } }
  `;
  document.head.appendChild(s);
}

const StatCard = ({ title, value, icon, colors, highlight }) => (
  <div style={{ ...styles.statCard, background: colors.card, borderColor: highlight ? colors.primary : colors.border }}>
    <div style={{ color: highlight ? colors.primary : '#94a3b8', marginBottom: 5 }}>{icon}</div>
    <div style={styles.subtext}>{title}</div>
    <div style={{ fontWeight: 'bold', fontSize: 16 }}>{value}</div>
  </div>
);

const SearchBar = ({ value, onChange, colors }) => (
  <div style={{ display: 'flex', alignItems: 'center', background: colors.cardAlt, padding: '10px 15px', borderRadius: 14, gap: 10 }}>
    <Search size={18} opacity={0.5} />
    <input value={value} onChange={e => onChange(e.target.value)} placeholder="Search..." style={{ background: 'none', border: 'none', width: '100%', outline: 'none', color: 'inherit' }} />
  </div>
);

const SectionHeader = ({ title, icon, action }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '15px 0' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 'bold' }}>{icon} {title}</div>
    {action && <button onClick={action} style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: 12 }}>Export</button>}
  </div>
);

const Breadcrumbs = ({ path }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, opacity: 0.5, marginBottom: 10 }}>
    {path.map((p, i) => <React.Fragment key={i}><span>{p}</span>{i < path.length - 1 && <ChevronLeft size={10} style={{transform:'rotate(180deg)'}}/>}</React.Fragment>)}
  </div>
);

const EmptyState = ({ msg }) => (
  <div style={{ textAlign: 'center', padding: 40, opacity: 0.5 }}>
    <AlertCircle size={40} style={{ margin: '0 auto 10px' }} />
    <div>{msg}</div>
  </div>
);

const SkeletonLoader = ({ type }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
    {type === 'card' && <div className="skeleton" style={{ height: 160, borderRadius: 24 }}></div>}
    {[1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton" style={{ height: 60, borderRadius: 16 }}></div>)}
  </div>
);

const ToastContainer = ({ toasts }) => (
  <div style={{ position: 'fixed', top: 60, left: 20, right: 20, zIndex: 3000, display: 'flex', flexDirection: 'column', gap: 8 }}>
    {toasts.map(t => (
      <div key={t.id} style={{ 
        padding: '12px 16px', borderRadius: 12, color: '#fff', fontSize: 13, fontWeight: 'bold',
        background: t.type === 'error' ? '#ef4444' : '#10b981', display: 'flex', alignItems: 'center', gap: 8,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)', animation: 'fadeIn 0.2s'
      }}>
        {t.type === 'error' ? <AlertCircle size={16}/> : <CheckCircle2 size={16}/>}
        {t.message}
      </div>
    ))}
  </div>
);

const SettingsPanel = ({ textSize, setTextSize, onLogout, colors }) => (
  <div style={styles.sheetContent}>
    <div style={{ marginBottom: 20 }}>
      <label style={styles.subtext}>Text Size</label>
      <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
        {['small', 'normal', 'large'].map(s => (
          <button key={s} onClick={() => setTextSize(s)} style={{ 
            flex: 1, padding: 10, borderRadius: 10, border: '1px solid',
            background: textSize === s ? colors.primary : 'none',
            color: textSize === s ? '#fff' : 'inherit',
            borderColor: colors.border, textTransform: 'capitalize'
          }}>{s}</button>
        ))}
      </div>
    </div>
    <button onClick={onLogout} style={{ ...styles.btnPrimary, background: '#ef4444' }}><LogOut size={18}/> Sign Out</button>
  </div>
);

const LoginScreen = ({ onLogin, loading, colors }) => (
  <div style={{ ...styles.app, background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
    <div style={{ ...styles.statCard, background: colors.card, borderColor: colors.border, width: '100%', maxWidth: 360, padding: 30 }}>
      <Landmark size={48} color={colors.primary} style={{ marginBottom: 20 }} />
      <h3>{CONFIG.business.name}</h3>
      <form onSubmit={e => { e.preventDefault(); onLogin({ username: e.target.u.value, password: e.target.p.value }); }} style={{ marginTop: 25 }}>
        <input name="u" placeholder="ID / Username" style={styles.input} required />
        <input name="p" type="password" placeholder="Password" style={{...styles.input, marginTop: 10}} required />
        <button type="submit" disabled={loading} style={{...styles.btnPrimary, background: colors.primary, marginTop: 20}}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  </div>
);
