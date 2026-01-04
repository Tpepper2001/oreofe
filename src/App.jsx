import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Scanner } from '@yudiel/react-qr-scanner';
import {
  Users, UserPlus, LayoutDashboard, LogOut, Landmark, X, Camera, 
  Printer, Moon, Sun, UserCheck, Search, TrendingUp, Calendar, 
  Trash2, Edit3, ArrowLeftRight, Wallet, HandCoins, CheckSquare, 
  Square, CreditCard, ChevronRight, QrCode, Zap, ZapOff, AlertCircle,
  Phone, MapPin, MoreVertical, Filter, ArrowUpRight, Activity
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
    ajo: { name: 'AJO SYSTEM', primary: '#3b82f6', secondary: '#1d4ed8', gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', membersTable: 'contributors', transTable: 'transactions' },
    loans: { name: 'LOAN SYSTEM', primary: '#ef4444', secondary: '#b91c1c', gradient: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', membersTable: 'loan_members', transTable: 'loan_transactions' }
  }
};

const supabase = createClient(CONFIG.supabase.url, CONFIG.supabase.key);

/* ===================== STYLES & THEMES ===================== */
const DARK_THEME = { 
  bg: '#020617', 
  card: 'rgba(30, 41, 59, 0.7)', 
  cardSolid: '#1e293b',
  text: '#f8fafc', 
  textSecondary: '#94a3b8', 
  border: 'rgba(255,255,255,0.08)',
  glass: 'blur(20px)'
};
const LIGHT_THEME = { 
  bg: '#f8fafc', 
  card: 'rgba(255, 255, 255, 0.8)', 
  cardSolid: '#ffffff',
  text: '#0f172a', 
  textSecondary: '#64748b', 
  border: 'rgba(0,0,0,0.05)',
  glass: 'blur(20px)'
};

const styles = {
  app: { minHeight: '100vh', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)' },
  header: { padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(20px)', borderBottom: '1px solid' },
  main: { padding: 20, paddingBottom: 120, maxWidth: 650, margin: '0 auto' },
  nav: { display: 'flex', justifyContent: 'space-around', padding: '15px 0', position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, borderTop: '1px solid', backdropFilter: 'blur(20px)' },
  card: { padding: 20, borderRadius: 28, border: '1px solid', marginBottom: 16, position: 'relative', overflow: 'hidden', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' },
  listItem: { display: 'flex', alignItems: 'center', padding: 18, borderRadius: 22, border: '1px solid', marginBottom: 12, transition: 'transform 0.2s ease' },
  btnPrimary: { color: '#fff', border: 'none', borderRadius: 16, padding: '16px 24px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 15, boxShadow: '0 4px 15px rgba(0,0,0,0.15)' },
  btnSecondary: { background: 'rgba(100, 116, 139, 0.1)', color: '#64748b', border: 'none', borderRadius: 16, padding: 14, cursor: 'pointer', fontWeight: '700' },
  input: { width: '100%', padding: '16px', borderRadius: 14, border: '1px solid', background: 'rgba(255,255,255,0.03)', color: 'inherit', fontSize: 16, outline: 'none', boxSizing: 'border-box', marginTop: 6 },
  label: { fontSize: 11, fontWeight: '800', color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase', marginLeft: 4 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' },
  modal: { padding: 30, borderTopLeftRadius: 32, borderTopRightRadius: 32, width: '100%', maxWidth: 500, animation: 'slideUp 0.4s cubic-bezier(0, 0, 0.2, 1)' }
};

/* ===================== COMPONENTS ===================== */

const Badge = ({ children, color }) => (
  <span style={{ padding: '4px 10px', borderRadius: 8, fontSize: 10, fontWeight: '800', background: `${color}20`, color: color, textTransform: 'uppercase' }}>{children}</span>
);

const AnimatedNumber = ({ value }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = display;
    const end = parseInt(value);
    if (start === end) return;
    let timer = setInterval(() => {
      start += Math.ceil((end - start) / 5);
      if (start >= end) { setDisplay(end); clearInterval(timer); }
      else setDisplay(start);
    }, 30);
    return () => clearInterval(timer);
  }, [value]);
  return <span>₦{display.toLocaleString()}</span>;
};

const Skeleton = ({ width = '100%', height = 20, radius = 8 }) => (
  <div className="skeleton" style={{ width, height, borderRadius: radius, marginBottom: 10 }} />
);

/* ===================== MAIN APP ===================== */

export default function App() {
  const [auth, setAuth] = useState(null); 
  const [mode, setMode] = useState(null); 
  const [view, setView] = useState('dashboard');
  const [data, setData] = useState({ members: [], agents: [], transactions: [] });
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [toasts, setToasts] = useState([]);
  const [bulkPrintList, setBulkPrintList] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    if (navigator.vibrate) navigator.vibrate(type === 'error' ? [50, 50, 50] : 30);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  const fetchData = useCallback(async () => {
    if (!auth || !mode) return;
    setLoading(true);
    const mConf = CONFIG.modes[mode];
    try {
      const [m, t, e] = await Promise.all([
        supabase.from(mConf.membersTable).select('*').order('registration_no'),
        supabase.from(mConf.transTable).select('*').order('created_at', { ascending: false }),
        supabase.from('employees').select('*').order('full_name')
      ]);
      setData({ members: m.data || [], transactions: t.data || [], agents: e.data || [] });
    } catch (err) { showToast("Sync failed", "error"); }
    finally { setLoading(false); }
  }, [auth, mode, showToast]);

  useEffect(() => { if (auth && mode) fetchData(); }, [auth, mode, fetchData]);

  const colors = theme === 'dark' ? DARK_THEME : LIGHT_THEME;
  const activeMode = mode ? CONFIG.modes[mode] : null;

  useEffect(() => {
    const s = document.createElement('style');
    s.textContent = `
      @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      @keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
      @keyframes skeleton-loading { 0% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
      .skeleton { background: linear-gradient(90deg, ${colors.border} 25%, ${colors.cardSolid} 50%, ${colors.border} 75%); background-size: 200% 100%; animation: skeleton-loading 1.5s infinite; }
      .scanner-laser { position: absolute; width: 100%; height: 2px; background: #ef4444; animation: scan-line 2s linear infinite; z-index: 11; box-shadow: 0 0 15px 2px #ef4444; }
      @keyframes scan-line { 0% { top: 0%; } 100% { top: 100%; } }
      button:active { transform: scale(0.96); }
      .glass-card { backdrop-filter: ${colors.glass}; background: ${colors.card}; border: 1px solid ${colors.border}; }
      @media print { .no-print { display: none !important; } .print-area { display: block !important; } }
    `;
    document.head.appendChild(s);
  }, [colors]);

  if (!auth) return <LoginScreen onLogin={async (c) => {
    setLoading(true);
    if (c.type === 'admin') {
      if (c.u.toLowerCase() === CONFIG.admin.username && c.p === CONFIG.admin.password) setAuth({ id: 'admin', role: 'admin', name: 'Admin' });
      else showToast("Invalid Admin Login", "error");
    } else {
      const { data: agent } = await supabase.from('employees').select('*').eq('employee_id_number', c.u.toLowerCase()).eq('password', c.p).maybeSingle();
      if (agent) setAuth({ id: agent.id, role: 'agent', name: agent.full_name, data: agent });
      else showToast("Invalid Agent Login", "error");
    }
    setLoading(false);
  }} loading={loading} colors={colors} />;

  if (!mode) return <ModeSelection setMode={setMode} colors={colors} onLogout={() => setAuth(null)} />;

  return (
    <div style={{ ...styles.app, background: colors.bg, color: colors.text }}>
      <div className="no-print">
        <header style={{ ...styles.header, background: colors.card, borderColor: colors.border }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div onClick={() => setMode(null)} style={{ width: 40, height: 40, borderRadius: 12, background: activeMode.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}>
              <ArrowLeftRight size={20}/>
            </div>
            <div>
              <h1 style={{ fontSize: 14, fontWeight: '900', margin: 0, letterSpacing: -0.5 }}>{activeMode.name}</h1>
              <Badge color={activeMode.primary}>{auth.role}</Badge>
            </div>
          </div>
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} style={{ width: 42, height: 42, borderRadius: 12, border: 'none', background: colors.card, color: colors.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {theme === 'dark' ? <Sun size={20}/> : <Moon size={20}/>}
          </button>
        </header>

        <main style={styles.main}>
          {loading && <SkeletonLoader />}
          {!loading && (
            auth.role === 'admin' ? 
              <AdminPortal view={view} data={data} colors={colors} modeConf={activeMode} mode={mode} onRefresh={fetchData} showToast={showToast} setBulkPrintList={setBulkPrintList} /> :
              <AgentPortal view={view} profile={auth.data} data={data} colors={colors} modeConf={activeMode} mode={mode} onRefresh={fetchData} showToast={showToast} />
          )}
        </main>

        <nav style={{ ...styles.nav, background: colors.card, borderColor: colors.border }}>
          <NavBtn active={view === 'dashboard'} icon={<LayoutDashboard/>} label="Home" onClick={() => setView('dashboard')} colors={colors} primary={activeMode.primary} />
          <NavBtn active={view === 'members'} icon={<Users/>} label="Members" onClick={() => setView('members')} colors={colors} primary={activeMode.primary} />
          {auth.role === 'admin' && <NavBtn active={view === 'agents'} icon={<UserCheck/>} label="Agents" onClick={() => setView('agents')} colors={colors} primary={activeMode.primary} />}
          {auth.role === 'agent' && <NavBtn active={view === 'scan'} icon={<Camera/>} label="Scan" onClick={() => setView('scan')} colors={colors} primary={activeMode.primary} />}
          <NavBtn icon={<LogOut/>} label="Exit" onClick={() => setAuth(null)} colors={colors} primary={activeMode.primary} />
        </nav>
      </div>

      {bulkPrintList.length > 0 && <PrintView list={bulkPrintList} mode={mode} onClose={() => setBulkPrintList([])} />}
      
      <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, width: '90%', maxWidth: 400 }}>
        {toasts.map(t => (
          <div key={t.id} style={{ padding: '16px 20px', borderRadius: 16, background: t.type === 'error' ? '#ef4444' : '#10b981', color: '#fff', marginBottom: 10, fontWeight: '800', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 10px 20px rgba(0,0,0,0.2)', animation: 'fadeIn 0.3s' }}>
            {t.type === 'error' ? <AlertCircle size={20}/> : <CheckSquare size={20}/>} {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===================== VIEWS & PORTALS ===================== */

const AdminPortal = ({ view, data, colors, modeConf, mode, onRefresh, showToast, setBulkPrintList }) => {
  if (view === 'dashboard') {
    const today = new Date().toISOString().slice(0, 10);
    const todayTrans = data.transactions.filter(t => t.created_at.startsWith(today));
    const todayTotal = todayTrans.reduce((s, t) => s + (t.amount || 0), 0);
    const totalExpected = data.members.reduce((s, m) => s + (m.expected_amount || 0), 0);
    const progress = (todayTotal / (totalExpected || 1)) * 100;

    return (
      <div style={{ animation: 'fadeIn 0.4s' }}>
        <div style={{ ...styles.card, background: modeConf.gradient, color: '#fff', border: 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ opacity: 0.8, fontSize: 12, fontWeight: '800', margin: 0 }}>COLLECTIONS TODAY</p>
              <h1 style={{ fontSize: 36, margin: '5px 0', fontWeight: '900' }}><AnimatedNumber value={todayTotal}/></h1>
            </div>
            <div style={{ width: 60, height: 60, position: 'relative' }}>
               <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                 <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                 <circle cx="18" cy="18" r="16" fill="none" stroke="#fff" strokeWidth="3" strokeDasharray={`${progress}, 100`} />
               </svg>
               <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 'bold' }}>{Math.round(progress)}%</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 20, marginTop: 20, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div><small style={{ opacity: 0.7 }}>Members</small><div style={{ fontWeight: 'bold' }}>{data.members.length}</div></div>
            <div><small style={{ opacity: 0.7 }}>Transactions</small><div style={{ fontWeight: 'bold' }}>{todayTrans.length}</div></div>
            <div><small style={{ opacity: 0.7 }}>Target</small><div style={{ fontWeight: 'bold' }}>₦{totalExpected.toLocaleString()}</div></div>
          </div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}><Activity size={20} color={modeConf.primary}/> Recent Transactions</h3>
          <button style={{ background: 'none', border: 'none', color: modeConf.primary, fontSize: 13, fontWeight: '700' }}>See All</button>
        </div>
        <TransactionList transactions={data.transactions.slice(0, 10)} colors={colors} primary={modeConf.primary} />
      </div>
    );
  }
  if (view === 'members') return <MemberManager data={data} colors={colors} modeConf={modeConf} mode={mode} onRefresh={onRefresh} showToast={showToast} setBulkPrintList={setBulkPrintList} isAdmin={true} />;
  if (view === 'agents') return <AgentManager agents={data.agents} onRefresh={onRefresh} colors={colors} modeConf={modeConf} />;
};

const AgentPortal = ({ view, profile, data, colors, modeConf, mode, onRefresh, showToast }) => {
  if (view === 'dashboard') {
    const today = new Date().toISOString().slice(0, 10);
    const myTs = data.transactions.filter(t => t.employee_id === profile?.id && t.created_at.startsWith(today));
    const myTotal = myTs.reduce((s, t) => s + (t.amount || 0), 0);

    return (
      <div style={{ animation: 'fadeIn 0.4s' }}>
        <div style={{ ...styles.card, background: modeConf.gradient, color: '#fff', textAlign: 'center', padding: '40px 20px', border: 'none' }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
            <TrendingUp size={32}/>
          </div>
          <p style={{ opacity: 0.8, fontSize: 12, fontWeight: '800', margin: 0 }}>MY DAILY TARGET</p>
          <h1 style={{ fontSize: 48, margin: '10px 0', fontWeight: '900' }}><AnimatedNumber value={myTotal}/></h1>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.2)', padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: '700' }}>
            <CreditCard size={14}/> {myTs.length} Successful Collections
          </div>
        </div>
        <h3 style={{ margin: '25px 0 15px', display: 'flex', alignItems: 'center', gap: 8 }}><Calendar size={20} color={modeConf.primary}/> My Activity</h3>
        <TransactionList transactions={data.transactions.filter(t => t.employee_id === profile?.id).slice(0, 15)} colors={colors} primary={modeConf.primary} />
      </div>
    );
  }
  if (view === 'members') return <MemberManager data={data} colors={colors} modeConf={modeConf} mode={mode} onRefresh={onRefresh} showToast={showToast} isAdmin={false} />;
  if (view === 'scan') return <ScannerView profile={profile} onRefresh={onRefresh} showToast={showToast} colors={colors} modeConf={modeConf} mode={mode} />;
};

/* ===================== MANAGERS ===================== */

const MemberManager = ({ data, colors, modeConf, mode, onRefresh, showToast, setBulkPrintList, isAdmin }) => {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState([]);
  const [form, setForm] = useState({ show: false, m: null });
  const filtered = data.members.filter(m => 
    m.full_name.toLowerCase().includes(query.toLowerCase()) || 
    m.registration_no.includes(query.toUpperCase()) ||
    m.phone?.includes(query)
  );

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this member? This cannot be undone.")) {
      const { error } = await supabase.from(CONFIG.modes[mode].membersTable).delete().eq('id', id);
      if (!error) { showToast("Member deleted", "success"); setForm({ show: false }); onRefresh(); }
    }
  };

  return (
    <div>
      <div className="glass-card" style={{ display: 'flex', gap: 12, padding: '14px 18px', borderRadius: 20, marginBottom: 20, alignItems: 'center' }}>
        <Search size={20} color={modeConf.primary} style={{ opacity: 0.7 }}/>
        <input placeholder="Search name, ID or phone..." value={query} onChange={e => setQuery(e.target.value)} style={{ border: 'none', background: 'none', color: 'inherit', outline: 'none', flex: 1, fontSize: 15, fontWeight: '600' }} />
        <Filter size={20} style={{ opacity: 0.4 }}/>
      </div>

      {isAdmin && <button onClick={() => setForm({ show: true, m: null })} style={{ ...styles.btnPrimary, background: modeConf.gradient, width: '100%', marginBottom: 20 }}><UserPlus size={20}/> Register New Member</button>}
      
      {selected.length > 0 && (
        <div style={{ position:'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)', width: '92%', maxWidth: 450, background: modeConf.primary, padding: '16px 24px', borderRadius: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1000, boxShadow: '0 20px 40px rgba(0,0,0,0.3)', animation: 'slideUp 0.3s' }}>
          <span style={{ color: '#fff', fontWeight: '900' }}>{selected.length} Members Selected</span>
          <button onClick={() => setBulkPrintList(data.members.filter(m => selected.includes(m.id)))} style={{ background: '#fff', color: modeConf.primary, border: 'none', padding: '10px 20px', borderRadius: 14, fontWeight: '800', fontSize: 13 }}>Generate ID Cards</button>
        </div>
      )}

      {filtered.length === 0 && <div style={{ textAlign: 'center', padding: 40, opacity: 0.5 }}><Users size={48} style={{ marginBottom: 10 }} /><p>No members found</p></div>}

      {filtered.map(m => (
        <div key={m.id} onClick={() => isAdmin && setSelected(s => s.includes(m.id) ? s.filter(i => i !== m.id) : [...s, m.id])} className="glass-card" style={{ ...styles.listItem, borderColor: selected.includes(m.id) ? modeConf.primary : colors.border, transform: selected.includes(m.id) ? 'scale(0.98)' : 'scale(1)' }}>
          {isAdmin && <div style={{ marginRight: 15 }}>{selected.includes(m.id) ? <CheckSquare size={24} color={modeConf.primary}/> : <Square size={24} style={{ opacity: 0.2 }}/>}</div>}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <strong style={{ fontSize: 16 }}>{m.full_name}</strong>
              <Badge color={modeConf.primary}>{m.registration_no}</Badge>
            </div>
            <div style={{ fontSize: 12, opacity: 0.6, marginTop: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={12}/> {m.phone || 'No Phone'}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Wallet size={12}/> ₦{m.expected_amount?.toLocaleString()}</span>
            </div>
          </div>
          {isAdmin && <button onClick={(e) => { e.stopPropagation(); setForm({ show: true, m }); }} style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(0,0,0,0.05)', border: 'none', color: modeConf.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Edit3 size={18}/></button>}
        </div>
      ))}

      {form.show && (
        <div style={styles.overlay} onClick={() => setForm({ show: false })}>
          <div style={{ ...styles.modal, background: colors.cardSolid, color: colors.text }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 40, height: 4, background: colors.border, borderRadius: 2, margin: '0 auto 20px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
               <h2 style={{ margin: 0, fontWeight: '900' }}>{form.m ? 'Edit Member' : 'New Member'}</h2>
               {form.m && <button onClick={() => handleDelete(form.m.id)} style={{ background: 'none', border: 'none', color: '#ef4444' }}><Trash2 size={20}/></button>}
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              const p = { 
                full_name: fd.get('n'), 
                registration_no: fd.get('r'), 
                expected_amount: Number(fd.get('a')), 
                phone: fd.get('p'),
                address: fd.get('addr'),
                ajo_owner_id: 'admin' 
              };
              const { error } = form.m ? await supabase.from(CONFIG.modes[mode].membersTable).update(p).eq('id', form.m.id) : await supabase.from(CONFIG.modes[mode].membersTable).insert([p]);
              if (!error) { showToast("Success", "success"); setForm({ show: false }); onRefresh(); }
            }}>
              <div style={{ marginBottom: 15 }}>
                <label style={styles.label}>Full Name</label>
                <input name="n" defaultValue={form.m?.full_name} placeholder="e.g. John Doe" style={{ ...styles.input, borderColor: colors.border }} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 15 }}>
                <div>
                  <label style={styles.label}>Reg Number</label>
                  <input name="r" defaultValue={form.m?.registration_no} placeholder="ABC-123" style={{ ...styles.input, borderColor: colors.border }} required />
                </div>
                <div>
                  <label style={styles.label}>Daily Amount</label>
                  <input name="a" type="number" defaultValue={form.m?.expected_amount} placeholder="1000" style={{ ...styles.input, borderColor: colors.border }} required />
                </div>
              </div>
              <div style={{ marginBottom: 15 }}>
                <label style={styles.label}>Phone Number</label>
                <input name="p" type="tel" defaultValue={form.m?.phone} placeholder="0800 000 0000" style={{ ...styles.input, borderColor: colors.border }} />
              </div>
              <div style={{ marginBottom: 25 }}>
                <label style={styles.label}>Residential Address</label>
                <textarea name="addr" defaultValue={form.m?.address} rows="2" style={{ ...styles.input, borderColor: colors.border, resize: 'none', fontFamily: 'inherit' }} placeholder="Enter full address..."></textarea>
              </div>
              <button type="submit" style={{ ...styles.btnPrimary, background: modeConf.gradient, width: '100%', height: 60 }}>
                {form.m ? 'Update Profile' : 'Complete Registration'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* ===================== SHARED UI ELEMENTS ===================== */

const NavBtn = ({ active, icon, label, onClick, colors, primary }) => (
  <button onClick={onClick} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer', color: active ? primary : colors.textSecondary, transition: 'all 0.3s' }}>
    <div style={{ width: 48, height: 32, borderRadius: 16, background: active ? `${primary}15` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}>
      {React.cloneElement(icon, { size: 22, strokeWidth: active ? 2.5 : 2 })}
    </div>
    <span style={{ fontSize: 10, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' }}>{label}</span>
  </button>
);

const TransactionList = ({ transactions, colors, primary }) => (
  <div>
    {transactions.map((t, i) => (
      <div key={t.id} className="glass-card" style={{ ...styles.listItem, animation: `fadeIn ${0.2 + i * 0.05}s ease` }}>
        <div style={{ width: 48, height: 48, borderRadius: 16, background: `${primary}10`, color: primary, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 15 }}>
          <ArrowUpRight size={22}/>
        </div>
        <div style={{ flex: 1 }}>
          <strong style={{ fontSize: 15 }}>{t.full_name}</strong>
          <div style={{ fontSize: 11, opacity: 0.5, fontWeight: '700' }}>{new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Collector: {t.employee_name || 'Admin'}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: '900', color: primary, fontSize: 16 }}>₦{t.amount?.toLocaleString()}</div>
          <Badge color="#10b981">Success</Badge>
        </div>
      </div>
    ))}
  </div>
);

const SkeletonLoader = () => (
  <div>
    <Skeleton height={180} radius={28} />
    <div style={{ marginTop: 30 }}>
      {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} height={80} radius={22} />)}
    </div>
  </div>
);

/* ===================== REMAINING LOGIC (SCANNERS/MODES) ===================== */

const LoginScreen = ({ onLogin, loading, colors }) => {
  const [type, setType] = useState('agent');
  return (
    <div style={{ background: colors.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="glass-card" style={{ ...styles.modal, borderRadius: 32, padding: 40, textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#fff', boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)' }}>
          <Landmark size={40} />
        </div>
        <h2 style={{ fontSize: 28, fontWeight: '900', letterSpacing: -1, marginBottom: 8 }}>{CONFIG.business.name}</h2>
        <p style={{ color: colors.textSecondary, marginBottom: 30, fontSize: 14, fontWeight: '600' }}>Secure Portal Access</p>
        
        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.05)', padding: 6, borderRadius: 16, marginBottom: 25 }}>
          <button onClick={() => setType('agent')} style={{ flex: 1, padding: 12, border: 'none', borderRadius: 12, fontWeight: '800', background: type === 'agent' ? '#fff' : 'none', color: type === 'agent' ? '#000' : '#64748b', boxShadow: type === 'agent' ? '0 4px 12px rgba(0,0,0,0.1)' : 'none' }}>Agent</button>
          <button onClick={() => setType('admin')} style={{ flex: 1, padding: 12, border: 'none', borderRadius: 12, fontWeight: '800', background: type === 'admin' ? '#fff' : 'none', color: type === 'admin' ? '#000' : '#64748b', boxShadow: type === 'admin' ? '0 4px 12px rgba(0,0,0,0.1)' : 'none' }}>Admin</button>
        </div>

        <form onSubmit={e => { e.preventDefault(); onLogin({ u: e.target.u.value, p: e.target.p.value, type }); }}>
          <input name="u" placeholder={type === 'admin' ? "Admin Username" : "Agent ID Number"} style={{ ...styles.input, marginBottom: 12, background: 'rgba(0,0,0,0.03)', border: `1px solid ${colors.border}` }} required />
          <input name="p" type="password" placeholder="Password" style={{ ...styles.input, marginBottom: 25, background: 'rgba(0,0,0,0.03)', border: `1px solid ${colors.border}` }} required />
          <button type="submit" disabled={loading} style={{ ...styles.btnPrimary, background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', width: '100%', height: 60, fontSize: 18 }}>
            {loading ? "Verifying..." : `Sign In as ${type.toUpperCase()}`}
          </button>
        </form>
      </div>
    </div>
  );
};

const ModeSelection = ({ setMode, colors, onLogout }) => (
  <div style={{ background: colors.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
    <div style={{ width: '100%', maxWidth: 450, textAlign: 'center' }}>
      <h2 style={{ fontWeight: '900', fontSize: 32, letterSpacing: -1, marginBottom: 40 }}>Choose Portal</h2>
      <div style={{ display: 'grid', gap: 20 }}>
        {Object.entries(CONFIG.modes).map(([key, m]) => (
          <button key={key} onClick={() => setMode(key)} className="glass-card" style={{ padding: 40, textAlign: 'left', cursor: 'pointer', transition: 'all 0.3s' }}>
            <div style={{ width: 50, height: 50, borderRadius: 15, background: m.gradient, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              {key === 'ajo' ? <Wallet size={28}/> : <HandCoins size={28}/>}
            </div>
            <h3 style={{ margin: 0, fontWeight: '900', fontSize: 22 }}>{m.name}</h3>
            <p style={{ margin: '5px 0 0', opacity: 0.5, fontWeight: '700' }}>Manage collections and records</p>
          </button>
        ))}
      </div>
      <button onClick={onLogout} style={{ marginTop: 40, background: 'none', border: 'none', color: colors.textSecondary, fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: 8 }}><LogOut size={18}/> Log Out System</button>
    </div>
  </div>
);

const ScannerView = ({ profile, onRefresh, showToast, colors, modeConf, mode }) => {
  const [active, setActive] = useState(false);
  const [member, setMember] = useState(null);
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  const lookupMember = async (id) => {
    const { data: m } = await supabase.from(CONFIG.modes[mode].membersTable).select('*').or(`registration_no.eq.${id.toUpperCase()},id.eq.${id}`).maybeSingle();
    if (m) { setMember(m); setAmount(m.expected_amount || ''); setActive(false); } 
    else showToast("Invalid Member ID", "error");
  };

  if (member) return (
    <div style={{ ...styles.card, background: colors.cardSolid, textAlign: 'center', padding: '60px 20px', animation: 'fadeIn 0.3s' }}>
      <button onClick={() => setMember(null)} style={{ position:'absolute', top: 25, right: 25, background:'rgba(0,0,0,0.05)', border:'none', width: 40, height: 40, borderRadius: '50%', color:colors.text }}><X/></button>
      <Badge color={modeConf.primary}>{member.registration_no}</Badge>
      <h2 style={{ fontSize: 28, fontWeight: '900', margin: '15px 0' }}>{member.full_name}</h2>
      <div style={{ marginBottom: 30 }}>
        <label style={styles.label}>Collection Amount (₦)</label>
        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} style={{ ...styles.input, fontSize: 42, textAlign: 'center', fontWeight: '900', border: 'none', background: 'none', color: modeConf.primary }} autoFocus />
      </div>
      <button onClick={async () => {
        setProcessing(true);
        const { error } = await supabase.from(CONFIG.modes[mode].transTable).insert([{ contributor_id: member.id, full_name: member.full_name, registration_no: member.registration_no, amount: Number(amount), employee_id: profile?.id, employee_name: profile?.full_name }]);
        if (!error) { showToast("Payment Recorded", "success"); setMember(null); onRefresh(); }
        setProcessing(false);
      }} disabled={processing} style={{ ...styles.btnPrimary, background: modeConf.gradient, width: '100%', height: 65, fontSize: 18 }}>
        {processing ? "Processing..." : "Confirm Collection"}
      </button>
    </div>
  );

  return (
    <div style={{ animation: 'fadeIn 0.4s' }}>
       {active ? (
         <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 2000 }}>
            <Scanner onScan={(res) => res?.[0] && lookupMember(res[0].rawValue)} />
            <div className="scanner-laser" />
            <button onClick={() => setActive(false)} style={{ position:'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', background: '#fff', border: 'none', padding: '15px 40px', borderRadius: 30, fontWeight: '900' }}>Cancel Scan</button>
         </div>
       ) : (
         <>
          <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center', borderRadius: 32 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: `${modeConf.primary}15`, color: modeConf.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}><Camera size={40}/></div>
            <h2 style={{ fontWeight: '900' }}>Fast Scan</h2>
            <p style={{ opacity: 0.5, marginBottom: 30 }}>Scan member ID card for quick payment</p>
            <button onClick={() => setActive(true)} style={{ ...styles.btnPrimary, background: modeConf.gradient, width: '100%', height: 65, fontSize: 18 }}><QrCode/> Launch Scanner</button>
          </div>
          <div style={{ textAlign: 'center', margin: '30px 0 20px', fontSize: 11, fontWeight: '800', opacity: 0.3, letterSpacing: 2 }}>MANUAL ENTRY</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <input placeholder="Enter Member ID..." id="manualId" style={{ ...styles.input, flex: 1, margin: 0, height: 60, borderRadius: 18 }} />
            <button onClick={() => lookupMember(document.getElementById('manualId').value)} style={{ ...styles.btnPrimary, background: modeConf.primary, width: 60, height: 60, padding: 0 }}><ChevronRight/></button>
          </div>
         </>
       )}
    </div>
  );
};

const AgentManager = ({ agents, onRefresh, colors, modeConf }) => {
  const [form, setForm] = useState({ show: false, a: null });
  return (
    <div>
      <button onClick={() => setForm({ show: true, a: null })} style={{ ...styles.btnPrimary, background: modeConf.gradient, width: '100%', marginBottom: 20 }}><UserPlus size={20}/> Register New Agent</button>
      {agents.map(a => (
        <div key={a.id} className="glass-card" style={styles.listItem}>
          <div style={{ width: 48, height: 48, borderRadius: 16, background: 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 15 }}><UserCheck size={24}/></div>
          <div style={{ flex: 1 }}>
            <strong style={{ fontSize: 16 }}>{a.full_name}</strong>
            <div style={{ fontSize: 12, opacity: 0.5 }}>Agent ID: {a.employee_id_number}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setForm({ show: true, a })} style={{ background: 'none', border: 'none', color: modeConf.primary }}><Edit3 size={18}/></button>
            <button onClick={async () => { if (window.confirm("Delete agent?")) await supabase.from('employees').delete().eq('id', a.id); onRefresh(); }} style={{ background: 'none', border: 'none', color: '#ef4444' }}><Trash2 size={18}/></button>
          </div>
        </div>
      ))}
      {form.show && (
        <div style={styles.overlay} onClick={() => setForm({ show: false })}>
          <div style={{ ...styles.modal, background: colors.cardSolid, color: colors.text }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 25px 0', fontWeight: '900' }}>Agent Profile</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              const p = { full_name: fd.get('n'), employee_id_number: fd.get('e').toLowerCase(), password: fd.get('p') };
              const { error } = form.a ? await supabase.from('employees').update(p).eq('id', form.a.id) : await supabase.from('employees').insert([p]);
              if (!error) { setForm({ show: false }); onRefresh(); }
            }}>
              <label style={styles.label}>Full Name</label>
              <input name="n" defaultValue={form.a?.full_name} placeholder="Agent Name" style={{ ...styles.input, marginBottom: 15 }} required />
              <label style={styles.label}>System ID</label>
              <input name="e" defaultValue={form.a?.employee_id_number} placeholder="Agent ID" style={{ ...styles.input, marginBottom: 15 }} required />
              <label style={styles.label}>Access Password</label>
              <input name="p" defaultValue={form.a?.password} placeholder="Password" style={{ ...styles.input, marginBottom: 30 }} required />
              <button type="submit" style={{ ...styles.btnPrimary, background: modeConf.gradient, width: '100%', height: 60 }}>Save Agent</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const PrintView = ({ list, mode, onClose }) => (
  <div className="print-area" style={{ display: 'none' }}>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10mm', padding: '10mm' }}>
      {list.map(m => (
        <div key={m.id} style={{ border: '2px solid #000', borderRadius: '8mm', padding: '8mm', textAlign: 'center', color: '#000', height: '55mm', position: 'relative' }}>
          <h2 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>{CONFIG.business.name}</h2>
          <div style={{ fontSize: '10px', letterSpacing: '2px', marginBottom: '10px', fontWeight: 'bold' }}>OFFICIAL ID CARD</div>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', textAlign: 'left' }}>
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${m.registration_no}`} style={{ width: '80px', height: '80px' }} alt="qr" />
            <div>
              <div style={{ fontSize: '14px', fontWeight: '900' }}>{m.full_name}</div>
              <div style={{ fontSize: '12px', marginTop: '4px' }}><strong>ID:</strong> {m.registration_no}</div>
              <div style={{ fontSize: '12px' }}><strong>PORTAL:</strong> {mode.toUpperCase()}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
    <div className="no-print" style={{ position:'fixed', bottom: 30, right: 30, display:'flex', gap: 12 }}>
      <button onClick={() => window.print()} style={{ ...styles.btnPrimary, background: '#10b981' }}>Confirm Print</button>
      <button onClick={onClose} style={styles.btnSecondary}>Close</button>
    </div>
  </div>
);