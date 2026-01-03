import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Scanner } from '@yudiel/react-qr-scanner';
import {
  Users, UserPlus, LayoutDashboard, LogOut, Landmark, X, Camera, 
  Printer, Moon, Sun, UserCheck, Search, TrendingUp, Calendar, 
  Trash2, Edit3, ArrowLeftRight, Wallet, HandCoins, CheckSquare, 
  Square, CreditCard, ChevronRight, QrCode, Zap, ZapOff, AlertCircle
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

/* ===================== STYLES & THEMES ===================== */
const DARK_THEME = { bg: '#020617', card: '#0f172a', text: '#f8fafc', textSecondary: '#94a3b8', border: '#1e293b' };
const LIGHT_THEME = { bg: '#f1f5f9', card: '#ffffff', text: '#0f172a', textSecondary: '#64748b', border: '#e2e8f0' };

const styles = {
  app: { minHeight: '100vh', transition: 'all 0.3s ease' },
  header: { padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(10px)' },
  main: { padding: 20, paddingBottom: 100, maxWidth: 600, margin: '0 auto' },
  nav: { display: 'flex', justifyContent: 'space-around', padding: '12px 0', position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, borderTop: '1px solid' },
  card: { padding: 20, borderRadius: 24, border: '1px solid', marginBottom: 15, position: 'relative' },
  listItem: { display: 'flex', alignItems: 'center', padding: 16, borderRadius: 18, border: '1px solid', marginBottom: 10 },
  btnPrimary: { color: '#fff', border: 'none', borderRadius: 14, padding: '14px 24px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 15 },
  btnSecondary: { background: '#64748b', color: '#fff', border: 'none', borderRadius: 14, padding: 12, cursor: 'pointer', fontWeight: '600' },
  input: { width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid', background: 'rgba(255,255,255,0.02)', color: 'inherit', fontSize: 16, outline: 'none', boxSizing: 'border-box' },
  bigInput: { fontSize: 42, width: '100%', textAlign: 'center', background: 'none', border: 'none', borderBottom: '3px solid', outline: 'none', fontWeight: '800', margin: '20px 0' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20, backdropFilter: 'blur(4px)' },
  modal: { padding: 30, borderRadius: 28, width: '100%', maxWidth: 400 },
  scanContainer: { position: 'fixed', inset: 0, background: '#000', zIndex: 2000, display: 'flex', flexDirection: 'column' }
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
  const [bulkPrintList, setBulkPrintList] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
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
      // Offline Cache
      localStorage.setItem(`cache_members_${mode}`, JSON.stringify(m.data || []));
    } catch (err) { showToast("Sync failed", "error"); }
    finally { setLoading(false); }
  }, [auth, mode, showToast]);

  useEffect(() => { if (auth && mode) fetchData(); }, [auth, mode, fetchData]);

  const colors = theme === 'dark' ? DARK_THEME : LIGHT_THEME;
  const primaryColor = mode ? CONFIG.modes[mode].primary : '#3b82f6';

  useEffect(() => {
    const s = document.createElement('style');
    s.textContent = `
      @keyframes scan-line { 0% { top: 0%; } 50% { top: 100%; } 100% { top: 0%; } }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      .scanner-overlay { position: absolute; inset: 0; z-index: 10; box-shadow: 0 0 0 4000px rgba(0,0,0,0.7); border: 2px solid rgba(255,255,255,0.3); border-radius: 24px; }
      .scanner-overlay.error { border-color: #ef4444; }
      .scanner-laser { position: absolute; width: 100%; height: 3px; background: #ef4444; box-shadow: 0 0 15px #ef4444; animation: scan-line 2s linear infinite; z-index: 11; }
      @media print {
        .no-print { display: none !important; }
        .print-area { display: block !important; width: 210mm; }
        .print-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10mm; padding: 10mm; }
        .print-card { border: 1px solid #000; border-radius: 5mm; padding: 10mm; text-align: center; }
      }
    `;
    document.head.appendChild(s);
  }, []);

  if (!auth) return <LoginScreen onLogin={(c) => {
    if (c.u === CONFIG.admin.username && c.p === CONFIG.admin.password) setAuth({ id: 'admin', role: 'admin', name: 'Admin' });
    else {
      setLoading(true);
      supabase.from('employees').select('*').eq('employee_id_number', c.u.toLowerCase()).eq('password', c.p).maybeSingle().then(({data}) => {
        if (data) setAuth({ id: data.id, role: 'agent', name: data.full_name, data });
        else showToast("Invalid login", "error");
        setLoading(false);
      });
    }
  }} loading={loading} colors={colors} />;

  if (!mode) return <ModeSelection setMode={setMode} colors={colors} onLogout={() => setAuth(null)} />;

  return (
    <div style={{ ...styles.app, background: colors.bg, color: colors.text }}>
      <div className="no-print">
        <header style={{ ...styles.header, background: colors.card, borderBottom: `1px solid ${colors.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setMode(null)} style={{ background: 'none', border: 'none', color: colors.text }}><ArrowLeftRight size={20}/></button>
            <h1 style={{ fontSize: 16, fontWeight: '900' }}>{CONFIG.modes[mode].name}</h1>
          </div>
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} style={{ background: 'none', border: 'none' }}>
            {theme === 'dark' ? <Sun size={20} color="#fff"/> : <Moon size={20} color="#000"/>}
          </button>
        </header>

        <main style={styles.main}>
          {auth.role === 'admin' ? 
            <AdminPortal view={view} data={data} colors={colors} primary={primaryColor} mode={mode} onRefresh={fetchData} showToast={showToast} setBulkPrintList={setBulkPrintList} /> :
            <AgentPortal view={view} profile={auth.data} data={data} colors={colors} primary={primaryColor} mode={mode} onRefresh={fetchData} showToast={showToast} />
          }
        </main>

        <nav style={{ ...styles.nav, background: colors.card, borderColor: colors.border }}>
          <NavBtn active={view === 'dashboard'} icon={<LayoutDashboard/>} label="Home" onClick={() => setView('dashboard')} colors={colors} primary={primaryColor} />
          <NavBtn active={view === 'members'} icon={<Users/>} label="Members" onClick={() => setView('members')} colors={colors} primary={primaryColor} />
          {auth.role === 'admin' && <NavBtn active={view === 'agents'} icon={<UserCheck/>} label="Agents" onClick={() => setView('agents')} colors={colors} primary={primaryColor} />}
          {auth.role === 'agent' && <NavBtn active={view === 'scan'} icon={<Camera/>} label="Scan" onClick={() => setView('scan')} colors={colors} primary={primaryColor} />}
          <NavBtn icon={<LogOut/>} label="Exit" onClick={() => setAuth(null)} colors={colors} primary={primaryColor} />
        </nav>
      </div>

      {bulkPrintList.length > 0 && <PrintView list={bulkPrintList} mode={mode} onClose={() => setBulkPrintList([])} />}
      
      <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 9999 }}>
        {toasts.map(t => (
          <div key={t.id} style={{ padding: '12px 24px', borderRadius: 12, background: t.type === 'error' ? '#ef4444' : '#10b981', color: '#fff', marginBottom: 10, fontWeight: 'bold' }}>{t.message}</div>
        ))}
      </div>
    </div>
  );
}

/* ===================== SCANNER COMPONENT (ADVANCED) ===================== */

const ScannerView = ({ profile, onRefresh, showToast, colors, primary, mode }) => {
  const [active, setActive] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [manualId, setManualId] = useState('');
  const [member, setMember] = useState(null);
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [scanError, setScanError] = useState(null);
  
  const scanLock = useRef(false);
  const timeoutRef = useRef(null);

  // Auto-close scanner after 2 minutes of inactivity
  useEffect(() => {
    if (active) {
      timeoutRef.current = setTimeout(() => {
        setActive(false);
        showToast("Scanner timed out", "info");
      }, 120000);
    }
    return () => clearTimeout(timeoutRef.current);
  }, [active, showToast]);

  const lookupMember = async (id) => {
    if (!id || scanLock.current || processing) return;
    scanLock.current = true;
    setIsSearching(true);
    setScanError(null);

    try {
      let m = null;
      // Offline Fallback
      if (!navigator.onLine) {
        const cache = JSON.parse(localStorage.getItem(`cache_members_${mode}`) || '[]');
        m = cache.find(x => x.registration_no === id.toUpperCase() || x.id === id);
      } else {
        const { data } = await supabase.from(CONFIG.modes[mode].membersTable).select('*')
          .or(`registration_no.eq.${id.toUpperCase()},id.eq.${id}`).maybeSingle();
        m = data;
      }

      if (m) {
        if (navigator.vibrate) navigator.vibrate(100);
        setMember(m);
        setAmount(m.expected_amount || '');
        setActive(false);
        setTorchOn(false);
      } else {
        setScanError("Not Found");
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      }
    } catch (err) { setScanError("Error"); }
    finally {
      setIsSearching(false);
      setTimeout(() => { scanLock.current = false; }, 2000);
    }
  };

  const handleTransaction = async () => {
    if (!amount || amount <= 0) return;
    setProcessing(true);
    const { error } = await supabase.from(CONFIG.modes[mode].transTable).insert([{ 
      contributor_id: member.id, full_name: member.full_name, registration_no: member.registration_no,
      amount: Number(amount), employee_id: profile?.id, employee_name: profile?.full_name, expected_amount: member.expected_amount
    }]);
    if (!error) { showToast("Saved", "success"); setMember(null); onRefresh(); }
    else showToast("Failed to save", "error");
    setProcessing(false);
  };

  if (member) return (
    <div style={{ ...styles.card, background: colors.card, borderColor: colors.border, textAlign: 'center', paddingTop: 40, animation: 'fadeIn 0.3s' }}>
      <button onClick={() => setMember(null)} style={{ position:'absolute', top: 20, right: 20, background:'none', border:'none', color:colors.textSecondary }}><X/></button>
      <div style={{ background: primary, color: '#fff', display: 'inline-block', padding: '4px 12px', borderRadius: 8, fontSize: 12, fontWeight: 'bold' }}>{member.registration_no}</div>
      <h2 style={{ margin: '15px 0 5px' }}>{member.full_name}</h2>
      <input type="number" value={amount} onChange={e => setAmount(e.target.value)} style={{ ...styles.bigInput, color: colors.text, borderBottomColor: primary }} autoFocus />
      <button onClick={handleTransaction} disabled={processing} style={{ ...styles.btnPrimary, background: primary, width: '100%', height: 60 }}>{processing ? "Saving..." : "Confirm Collection"}</button>
    </div>
  );

  if (active) return (
    <div style={styles.scanContainer}>
      <div style={{ padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', zIndex: 2001 }}>
        <div>
          <h3 style={{ color: '#fff', margin: 0 }}>Scan QR Code</h3>
          {scanError && <small style={{color: '#ef4444', fontWeight: 'bold'}}>{scanError}</small>}
        </div>
        <button onClick={() => { setActive(false); setTorchOn(false); }} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: 10, borderRadius: '50%' }}><X/></button>
      </div>
      <div style={{ flex: 1, position: 'relative' }}>
        <Scanner 
          onScan={(res) => res?.[0] && lookupMember(res[0].rawValue)} 
          styles={{ container: { width: '100%', height: '100%' } }} 
          components={{ finder: false, audio: false }}
          constraints={{ facingMode: 'environment', advanced: [{ torch: torchOn }] }}
        />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <div style={{ width: 250, height: 250, position: 'relative' }}>
            <div className={`scanner-overlay ${scanError ? 'error' : ''}`}></div>
            {!scanError && <div className="scanner-laser"></div>}
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', zIndex: 2002 }}>
          <button onClick={() => setTorchOn(!torchOn)} style={{ width: 64, height: 64, borderRadius: '50%', background: torchOn ? '#fbbf24' : 'rgba(255,255,255,0.2)', border: 'none', color: torchOn ? '#000' : '#fff', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 15px rgba(0,0,0,0.3)' }}>
            {torchOn ? <ZapOff size={28} /> : <Zap size={28} />}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <div style={{ ...styles.card, background: colors.card, borderColor: colors.border, padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: primary + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: primary }}><Camera size={40}/></div>
        <h2 style={{ margin: '0 0 10px 0' }}>Daily Collection</h2>
        <button onClick={() => setActive(true)} style={{ ...styles.btnPrimary, background: primary, width: '100%', height: 60, fontSize: 18, marginBottom: 15 }}><QrCode/> Begin Scanning</button>
      </div>
      <div style={{ textAlign: 'center', margin: '20px 0', fontSize: 12, opacity: 0.4, fontWeight: 'bold' }}>OR ENTER MANUALLY</div>
      <div style={{ display: 'flex', gap: 10 }}>
        <input placeholder="Member ID" value={manualId} onChange={e => setManualId(e.target.value)} style={{ ...styles.input, borderColor: colors.border, background: colors.card }} />
        <button onClick={() => lookupMember(manualId)} style={{ ...styles.btnPrimary, background: primary, padding: '0 20px' }}><ChevronRight/></button>
      </div>
      {!navigator.onLine && (
        <div style={{ marginTop: 20, padding: 12, background: '#fef3c7', color: '#92400e', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
          <AlertCircle size={16}/> Offline Mode: Results from local cache.
        </div>
      )}
    </div>
  );
};

/* ===================== OTHER UI PARTS ===================== */

const NavBtn = ({ active, icon, label, onClick, colors, primary }) => (
  <button onClick={onClick} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', color: active ? primary : colors.textSecondary }}>
    {React.cloneElement(icon, { size: 22 })}
    <span style={{ fontSize: 10, fontWeight: active ? 'bold' : 'normal' }}>{label}</span>
  </button>
);

const TransactionList = ({ transactions, colors, primary }) => (
  <div>
    {transactions.map(t => (
      <div key={t.id} style={{ ...styles.listItem, background: colors.card, borderColor: colors.border }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: primary + '15', color: primary, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 15 }}><CreditCard size={20}/></div>
        <div style={{ flex: 1 }}><strong>{t.full_name}</strong><div style={{ fontSize: 11, opacity: 0.5 }}>By {t.employee_name || 'Admin'}</div></div>
        <div style={{ fontWeight: 'bold', color: primary }}>₦{t.amount?.toLocaleString()}</div>
      </div>
    ))}
  </div>
);

const AdminPortal = ({ view, data, colors, primary, mode, onRefresh, showToast, setBulkPrintList }) => {
  if (view === 'dashboard') {
    const today = new Date().toISOString().slice(0, 10);
    const todayTotal = data.transactions.filter(t => t.created_at.startsWith(today)).reduce((s, t) => s + (t.amount || 0), 0);
    return (
      <div style={{ animation: 'fadeIn 0.4s' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          <div style={{ ...styles.card, background: primary, border: 'none', color: '#fff' }}><small>TODAY</small><h2 style={{ margin: 0 }}>₦{todayTotal.toLocaleString()}</h2></div>
          <div style={{ ...styles.card, background: colors.card, borderColor: colors.border }}><small>MEMBERS</small><h2 style={{ margin: 0 }}>{data.members.length}</h2></div>
        </div>
        <h3 style={{ marginBottom: 15, display:'flex', alignItems:'center', gap:8 }}><TrendingUp size={18}/> Recent Activity</h3>
        <TransactionList transactions={data.transactions.slice(0, 10)} colors={colors} primary={primary} />
      </div>
    );
  }
  if (view === 'members') return <MemberManager data={data} colors={colors} primary={primary} mode={mode} onRefresh={onRefresh} showToast={showToast} setBulkPrintList={setBulkPrintList} isAdmin={true} />;
  if (view === 'agents') return <AgentManager agents={data.agents} onRefresh={onRefresh} colors={colors} primary={primary} />;
};

const AgentPortal = ({ view, profile, data, colors, primary, mode, onRefresh, showToast }) => {
  if (view === 'dashboard') {
    const today = new Date().toISOString().slice(0, 10);
    const myTs = data.transactions.filter(t => t.employee_id === profile?.id && t.created_at.startsWith(today));
    return (
      <div style={{ animation: 'fadeIn 0.4s' }}>
        <div style={{ ...styles.card, background: primary, color: '#fff', textAlign: 'center', padding: 40, border: 'none' }}>
          <small style={{ opacity: 0.8 }}>MY COLLECTIONS TODAY</small>
          <h1 style={{ fontSize: 42, margin: '10px 0' }}>₦{myTs.reduce((s, t) => s + (t.amount || 0), 0).toLocaleString()}</h1>
          <div style={{ background: 'rgba(0,0,0,0.1)', display: 'inline-block', padding: '4px 12px', borderRadius: 20 }}>{myTs.length} People Processed</div>
        </div>
        <h3 style={{ marginBottom: 15 }}><Calendar size={18}/> My Recent Activity</h3>
        <TransactionList transactions={data.transactions.filter(t => t.employee_id === profile?.id).slice(0, 10)} colors={colors} primary={primary} />
      </div>
    );
  }
  if (view === 'members') return <MemberManager data={data} colors={colors} primary={primary} mode={mode} onRefresh={onRefresh} showToast={showToast} isAdmin={false} />;
  if (view === 'scan') return <ScannerView profile={profile} onRefresh={onRefresh} showToast={showToast} colors={colors} primary={primary} mode={mode} />;
};

const MemberManager = ({ data, colors, primary, mode, onRefresh, showToast, setBulkPrintList, isAdmin }) => {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState([]);
  const [form, setForm] = useState({ show: false, m: null });
  const filtered = data.members.filter(m => m.full_name.toLowerCase().includes(query.toLowerCase()) || m.registration_no.includes(query.toUpperCase()));

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, background: colors.card, padding: 12, borderRadius: 16, border: `1px solid ${colors.border}`, marginBottom: 15, alignItems: 'center' }}>
        <Search size={18} opacity={0.5}/><input placeholder="Search members..." value={query} onChange={e => setQuery(e.target.value)} style={{ border: 'none', background: 'none', color: 'inherit', outline: 'none', flex: 1 }} />
      </div>
      {isAdmin && <button onClick={() => setForm({ show: true, m: null })} style={{ ...styles.btnPrimary, background: primary, width: '100%', marginBottom: 15 }}><UserPlus size={18}/> Add New Member</button>}
      {selected.length > 0 && (
        <div style={{ position:'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: 400, background: primary, padding: 15, borderRadius: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1000 }}>
          <span style={{ color: '#fff', fontWeight: 'bold' }}>{selected.length} Selected</span>
          <button onClick={() => setBulkPrintList(data.members.filter(m => selected.includes(m.id)))} style={{ background: '#fff', color: primary, border: 'none', padding: '8px 15px', borderRadius: 10, fontWeight: 'bold' }}>Print Selected</button>
        </div>
      )}
      {filtered.map(m => (
        <div key={m.id} onClick={() => isAdmin && setSelected(s => s.includes(m.id) ? s.filter(i => i !== m.id) : [...s, m.id])} style={{ ...styles.listItem, background: colors.card, borderColor: selected.includes(m.id) ? primary : colors.border }}>
          {isAdmin && <div style={{ marginRight: 15 }}>{selected.includes(m.id) ? <CheckSquare size={20} color={primary}/> : <Square size={20} opacity={0.3}/>}</div>}
          <div style={{ flex: 1 }}><strong>{m.full_name}</strong><div style={{ fontSize: 12, opacity: 0.5 }}>{m.registration_no} • ₦{m.expected_amount}</div></div>
          {isAdmin && <button onClick={(e) => { e.stopPropagation(); setForm({ show: true, m }); }} style={{ background: 'none', border: 'none', color: primary }}><Edit3 size={18}/></button>}
        </div>
      ))}
      {form.show && (
        <div style={styles.overlay}>
          <div style={{ ...styles.modal, background: colors.card }}>
            <h3>Member Details</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              const p = { full_name: fd.get('n'), registration_no: fd.get('r'), expected_amount: Number(fd.get('a')), ajo_owner_id: 'admin' };
              const { error } = form.m ? await supabase.from(CONFIG.modes[mode].membersTable).update(p).eq('id', form.m.id) : await supabase.from(CONFIG.modes[mode].membersTable).insert([p]);
              if (!error) { setForm({ show: false }); onRefresh(); }
              else showToast("Save failed", "error");
            }}>
              <input name="n" defaultValue={form.m?.full_name} placeholder="Name" style={{ ...styles.input, borderColor: colors.border, marginBottom: 10 }} required />
              <input name="r" defaultValue={form.m?.registration_no} placeholder="ID Number" style={{ ...styles.input, borderColor: colors.border, marginBottom: 10 }} required />
              <input name="a" type="number" defaultValue={form.m?.expected_amount} placeholder="Daily Amount" style={{ ...styles.input, borderColor: colors.border, marginBottom: 20 }} required />
              <div style={{ display: 'flex', gap: 10 }}><button type="submit" style={{ ...styles.btnPrimary, background: primary, flex: 1 }}>Save</button><button type="button" onClick={() => setForm({ show: false })} style={{ ...styles.btnSecondary, flex: 1 }}>Cancel</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const AgentManager = ({ agents, onRefresh, colors, primary }) => {
  const [form, setForm] = useState({ show: false, a: null });
  return (
    <div>
      <button onClick={() => setForm({ show: true, a: null })} style={{ ...styles.btnPrimary, background: primary, width: '100%', marginBottom: 15 }}><UserPlus size={18}/> Register Agent</button>
      {agents.map(a => (
        <div key={a.id} style={{ ...styles.listItem, background: colors.card, borderColor: colors.border }}>
          <div style={{ flex: 1 }}><strong>{a.full_name}</strong><div style={{ fontSize: 12, opacity: 0.5 }}>Login ID: {a.employee_id_number}</div></div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setForm({ show: true, a })} style={{ background: 'none', border: 'none', color: primary }}><Edit3 size={18}/></button>
            <button onClick={async () => { if (window.confirm("Delete agent?")) await supabase.from('employees').delete().eq('id', a.id); onRefresh(); }} style={{ background: 'none', border: 'none', color: '#ef4444' }}><Trash2 size={18}/></button>
          </div>
        </div>
      ))}
      {form.show && (
        <div style={styles.overlay}>
          <div style={{ ...styles.modal, background: colors.card }}>
            <h3>Agent Profile</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              const p = { full_name: fd.get('n'), employee_id_number: fd.get('e').toLowerCase(), password: fd.get('p') };
              const { error } = form.a ? await supabase.from('employees').update(p).eq('id', form.a.id) : await supabase.from('employees').insert([p]);
              if (!error) { setForm({ show: false }); onRefresh(); }
            }}>
              <input name="n" defaultValue={form.a?.full_name} placeholder="Agent Name" style={{ ...styles.input, borderColor: colors.border, marginBottom: 10 }} required />
              <input name="e" defaultValue={form.a?.employee_id_number} placeholder="Agent ID" style={{ ...styles.input, borderColor: colors.border, marginBottom: 10 }} required />
              <input name="p" defaultValue={form.a?.password} placeholder="Password" style={{ ...styles.input, borderColor: colors.border, marginBottom: 20 }} required />
              <div style={{ display: 'flex', gap: 10 }}><button type="submit" style={{ ...styles.btnPrimary, background: primary, flex: 1 }}>Save</button><button type="button" onClick={() => setForm({ show: false })} style={{ ...styles.btnSecondary, flex: 1 }}>Cancel</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const LoginScreen = ({ onLogin, loading, colors }) => (
  <div style={{ background: colors.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
    <div style={{ ...styles.modal, background: colors.card, border: `1px solid ${colors.border}`, textAlign: 'center' }}>
      <Landmark size={48} color="#3b82f6" style={{ marginBottom: 10 }} />
      <h2 style={{ color: colors.text, marginBottom: 30 }}>{CONFIG.business.name}</h2>
      <form onSubmit={e => { e.preventDefault(); onLogin({ u: e.target.u.value, p: e.target.p.value }); }}>
        <input name="u" placeholder="Admin/Agent ID" style={{ ...styles.input, borderColor: colors.border, marginBottom: 10 }} required />
        <input name="p" type="password" placeholder="Password" style={{ ...styles.input, borderColor: colors.border, marginBottom: 20 }} required />
        <button type="submit" disabled={loading} style={{ ...styles.btnPrimary, background: '#3b82f6', width: '100%' }}>{loading ? "Logging in..." : "Sign In"}</button>
      </form>
    </div>
  </div>
);

const ModeSelection = ({ setMode, colors, onLogout }) => (
  <div style={{ background: colors.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
    <div style={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
      <h2 style={{ color: colors.text, marginBottom: 40 }}>Select Portal</h2>
      <div style={{ display: 'grid', gap: 15 }}>
        <button onClick={() => setMode('ajo')} style={{ ...styles.card, background: 'none', borderColor: CONFIG.modes.ajo.primary, color: CONFIG.modes.ajo.primary, height: 120, fontSize: 20, fontWeight: '900', cursor: 'pointer' }}><Wallet size={32}/><br/>AJO PORTAL</button>
        <button onClick={() => setMode('loans')} style={{ ...styles.card, background: 'none', borderColor: CONFIG.modes.loans.primary, color: CONFIG.modes.loans.primary, height: 120, fontSize: 20, fontWeight: '900', cursor: 'pointer' }}><HandCoins size={32}/><br/>LOAN PORTAL</button>
      </div>
      <button onClick={onLogout} style={{ marginTop: 40, background: 'none', border: 'none', color: colors.textSecondary, cursor: 'pointer' }}><LogOut size={18}/> Log Out</button>
    </div>
  </div>
);

const PrintView = ({ list, mode, onClose }) => (
  <div className="print-area">
    <div className="print-grid">
      {list.map(m => (
        <div key={m.id} className="print-card">
          <h2>{CONFIG.business.name}</h2>
          <div style={{fontSize: 10, marginBottom: 10}}>{mode.toUpperCase()} MEMBER</div>
          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${m.registration_no}`} style={{ width: 130 }} alt="qr" />
          <div style={{ textAlign: 'left', marginTop: 15, fontSize: 13 }}>
            <strong>NAME:</strong> {m.full_name}<br/>
            <strong>ID:</strong> {m.registration_no}
          </div>
        </div>
      ))}
    </div>
    <div className="no-print" style={{position:'fixed', bottom: 20, right: 20, display:'flex', gap:10}}>
      <button onClick={() => window.print()} style={{...styles.btnPrimary, background:'#10b981'}}>Print Now</button>
      <button onClick={onClose} style={styles.btnSecondary}>Close</button>
    </div>
  </div>
);