import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Scanner } from '@yudiel/react-qr-scanner';
import {
  Users, UserPlus, LayoutDashboard, LogOut, Landmark, X, Camera, 
  Printer, AlertCircle, Moon, Sun, UserCheck, Search,
  TrendingUp, Calendar, Trash2, Edit3, Download, ArrowLeftRight, 
  Wallet, HandCoins, CheckSquare, Square, CreditCard, ChevronRight
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

/* ===================== THEMES & STYLES ===================== */
const DARK_THEME = { bg: '#020617', card: '#0f172a', text: '#f8fafc', textSecondary: '#94a3b8', border: '#1e293b' };
const LIGHT_THEME = { bg: '#f1f5f9', card: '#ffffff', text: '#0f172a', textSecondary: '#64748b', border: '#e2e8f0' };

const styles = {
  app: { minHeight: '100vh', transition: 'all 0.3s ease' },
  header: { padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(10px)' },
  main: { padding: 20, paddingBottom: 100, maxWidth: 600, margin: '0 auto' },
  nav: { display: 'flex', justifyContent: 'space-around', padding: '12px 0', position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, borderTop: '1px solid' },
  card: { padding: 20, borderRadius: 24, border: '1px solid', marginBottom: 15, position: 'relative', overflow: 'hidden' },
  listItem: { display: 'flex', alignItems: 'center', padding: 16, borderRadius: 18, border: '1px solid', marginBottom: 10, transition: 'transform 0.2s' },
  btnPrimary: { color: '#fff', border: 'none', borderRadius: 14, padding: '14px 24px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 15 },
  btnSecondary: { background: '#64748b', color: '#fff', border: 'none', borderRadius: 14, padding: 12, cursor: 'pointer', fontWeight: '600' },
  input: { width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid', background: 'rgba(255,255,255,0.02)', color: 'inherit', fontSize: 16, outline: 'none' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20, backdropFilter: 'blur(4px)' },
  modal: { padding: 30, borderRadius: 28, width: '100%', maxWidth: 400, position: 'relative' },
  bigInput: { fontSize: 42, width: '100%', textAlign: 'center', background: 'none', border: 'none', borderBottom: '3px solid', outline: 'none', fontWeight: '800', margin: '20px 0' },
  badge: { padding: '4px 10px', borderRadius: 8, fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  scanContainer: { position: 'fixed', inset: 0, background: '#000', zIndex: 2000, display: 'flex', flexDirection: 'column' }
};

/* ===================== UTILS ===================== */
const useCountUp = (end, duration = 1000) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = (end || 0) / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { setCount(end); clearInterval(timer); } 
      else { setCount(Math.floor(start)); }
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);
  return count;
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
  const [modal, setModal] = useState({ show: false, title: '', msg: '', onConfirm: null });
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
    } catch (err) { showToast("Sync failed", "error"); }
    finally { setLoading(false); }
  }, [auth, mode, showToast]);

  useEffect(() => { if (auth && mode) fetchData(); }, [auth, mode, fetchData]);

  const handleLogin = async (creds) => {
    setLoading(true);
    const u = creds.username.trim().toLowerCase();
    const p = creds.password;

    if (u === CONFIG.admin.username && p === CONFIG.admin.password) {
      setAuth({ id: 'admin', role: 'admin', name: 'Admin' });
    } else {
      const { data: agent } = await supabase.from('employees').select('*').eq('employee_id_number', u).eq('password', p).maybeSingle();
      if (agent) setAuth({ id: agent.id, role: 'agent', name: agent.full_name, data: agent });
      else showToast("Invalid Credentials", "error");
    }
    setLoading(false);
  };

  const colors = theme === 'dark' ? DARK_THEME : LIGHT_THEME;
  const primaryColor = mode ? CONFIG.modes[mode].primary : '#3b82f6';

  useEffect(() => {
    const s = document.createElement('style');
    s.textContent = `
      @keyframes scan-line { 0% { top: 0%; } 50% { top: 100%; } 100% { top: 0%; } }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      .scanner-overlay { position: absolute; inset: 0; z-index: 10; box-shadow: 0 0 0 4000px rgba(0,0,0,0.6); border: 2px solid rgba(255,255,255,0.2); border-radius: 24px; }
      .scanner-laser { position: absolute; width: 100%; height: 3px; background: #ef4444; box-shadow: 0 0 15px #ef4444; animation: scan-line 2s linear infinite; z-index: 11; }
      @media print {
        .no-print { display: none !important; }
        .print-area { display: block !important; width: 210mm; }
        .print-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10mm; padding: 10mm; }
        .print-card { border: 1px solid #000; border-radius: 5mm; padding: 10mm; text-align: center; page-break-inside: avoid; }
      }
    `;
    document.head.appendChild(s);
  }, []);

  if (!auth) return <LoginScreen onLogin={handleLogin} loading={loading} theme={theme} />;
  if (!mode) return <ModeSelection setMode={setMode} colors={colors} onLogout={() => setAuth(null)} />;

  return (
    <div style={{ ...styles.app, background: colors.bg, color: colors.text }}>
      <div className="no-print">
        <header style={{ ...styles.header, background: colors.card, borderBottom: `1px solid ${colors.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setMode(null)} style={{ background: 'none', border: 'none', color: colors.text, cursor: 'pointer' }}><ArrowLeftRight size={20}/></button>
            <h1 style={{ fontSize: 16, fontWeight: '900', letterSpacing: -0.5 }}>{CONFIG.modes[mode].name}</h1>
          </div>
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            {theme === 'dark' ? <Sun size={20} color="#fff"/> : <Moon size={20} color="#000"/>}
          </button>
        </header>

        <main style={styles.main}>
          {loading ? <div style={{textAlign:'center', padding: 50}}>Syncing Data...</div> : (
            <>
              {auth.role === 'admin' ? 
                <AdminPortal view={view} data={data} onRefresh={fetchData} showToast={showToast} colors={colors} primary={primaryColor} mode={mode} setBulkPrintList={setBulkPrintList} /> :
                <AgentPortal view={view} profile={auth.data} data={data} onRefresh={fetchData} showToast={showToast} colors={colors} primary={primaryColor} mode={mode} />
              }
            </>
          )}
        </main>

        <nav style={{ ...styles.nav, background: colors.card, borderColor: colors.border }}>
          <NavBtn active={view === 'dashboard'} icon={<LayoutDashboard/>} label="Home" onClick={() => setView('dashboard')} colors={colors} primary={primaryColor} />
          <NavBtn active={view === 'members'} icon={<Users/>} label="Members" onClick={() => setView('members')} colors={colors} primary={primaryColor} />
          {auth.role === 'admin' && <NavBtn active={view === 'agents'} icon={<UserCheck/>} label="Agents" onClick={() => setView('agents')} colors={colors} primary={primaryColor} />}
          {auth.role === 'agent' && <NavBtn active={view === 'scan'} icon={<Camera/>} label="Scan" onClick={() => setView('scan')} colors={colors} primary={primaryColor} />}
          <NavBtn icon={<LogOut/>} label="Exit" onClick={() => setAuth(null)} colors={colors} primary={primaryColor} />
        </nav>
      </div>

      {/* Printing Layer */}
      {bulkPrintList.length > 0 && (
        <div className="print-area" style={{display: 'none'}}>
          <div className="print-grid">
            {bulkPrintList.map(m => (
              <div key={m.id} className="print-card">
                <h2 style={{ margin: '0 0 5px 0' }}>{CONFIG.business.name}</h2>
                <p style={{ margin: '0 0 15px 0', fontSize: 12 }}>{mode.toUpperCase()} IDENTITY CARD</p>
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${m.registration_no}`} style={{ width: 140, marginBottom: 15 }} alt="qr" />
                <div style={{ textAlign: 'left', borderTop: '1px solid #000', paddingTop: 10 }}>
                  <strong>NAME:</strong> {m.full_name}<br/>
                  <strong>ID:</strong> {m.registration_no}
                </div>
              </div>
            ))}
          </div>
          <div className="no-print" style={{position:'fixed', bottom: 20, right: 20}}>
             <button onClick={() => window.print()} style={{...styles.btnPrimary, background: '#10b981'}}>Confirm Print</button>
             <button onClick={() => setBulkPrintList([])} style={{...styles.btnSecondary, marginTop: 10, width: '100%'}}>Close</button>
          </div>
        </div>
      )}

      {/* Toast Overlay */}
      <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 9999 }}>
        {toasts.map(t => (
          <div key={t.id} style={{ padding: '12px 24px', borderRadius: 12, background: t.type === 'error' ? '#ef4444' : '#10b981', color: '#fff', marginBottom: 10, fontWeight: 'bold', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', animation: 'fadeIn 0.3s ease' }}>
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===================== COMPONENTS ===================== */

const NavBtn = ({ active, icon, label, onClick, colors, primary }) => (
  <button onClick={onClick} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', color: active ? primary : colors.textSecondary }}>
    {React.cloneElement(icon, { size: 22 })}
    <span style={{ fontSize: 10, fontWeight: active ? 'bold' : 'normal' }}>{label}</span>
  </button>
);

const AdminPortal = ({ view, data, onRefresh, showToast, colors, primary, mode, setBulkPrintList }) => {
  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return {
      today: data.transactions.filter(t => t.created_at.startsWith(today)).reduce((s, t) => s + (t.amount || 0), 0),
      total: data.transactions.reduce((s, t) => s + (t.amount || 0), 0)
    };
  }, [data.transactions]);

  if (view === 'dashboard') return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 25 }}>
        <div style={{ ...styles.card, background: primary, color: '#fff', border: 'none' }}>
          <small style={{ opacity: 0.8 }}>TODAY</small>
          <h2 style={{ margin: 0 }}>₦{useCountUp(stats.today).toLocaleString()}</h2>
        </div>
        <div style={{ ...styles.card, background: colors.card, borderColor: colors.border }}>
          <small style={{ color: colors.textSecondary }}>MEMBERS</small>
          <h2 style={{ margin: 0 }}>{data.members.length}</h2>
        </div>
      </div>
      <div style={{display:'flex', alignItems:'center', gap: 8, marginBottom: 15}}><TrendingUp size={18}/> <strong>Recent Activity</strong></div>
      <TransactionList transactions={data.transactions.slice(0, 10)} colors={colors} primary={primary} />
    </div>
  );

  if (view === 'members') return <MemberManager data={data} onRefresh={onRefresh} showToast={showToast} colors={colors} primary={primary} mode={mode} setBulkPrintList={setBulkPrintList} isAdmin={true} />;
  if (view === 'agents') return <AgentManager agents={data.agents} onRefresh={onRefresh} showToast={showToast} colors={colors} primary={primary} />;
};

const AgentPortal = ({ view, profile, data, onRefresh, showToast, colors, primary, mode }) => {
  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const myTs = data.transactions.filter(t => t.employee_id === profile?.id);
    return {
      today: myTs.filter(t => t.created_at.startsWith(today)).reduce((s, t) => s + (t.amount || 0), 0),
      count: myTs.filter(t => t.created_at.startsWith(today)).length
    };
  }, [data.transactions, profile]);

  if (view === 'dashboard') return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <div style={{ ...styles.card, background: primary, color: '#fff', padding: 30, border: 'none', textAlign: 'center' }}>
        <div style={{ opacity: 0.8, fontSize: 12, marginBottom: 8 }}>COLLECTED TODAY</div>
        <h1 style={{ fontSize: 42, margin: 0 }}>₦{useCountUp(stats.today).toLocaleString()}</h1>
        <div style={{ marginTop: 10, fontSize: 14 }}>{stats.count} People Cleared</div>
      </div>
      <div style={{display:'flex', alignItems:'center', gap: 8, marginBottom: 15}}><Calendar size={18}/> <strong>Your Recent Work</strong></div>
      <TransactionList transactions={data.transactions.filter(t => t.employee_id === profile?.id).slice(0, 10)} colors={colors} primary={primary} />
    </div>
  );

  if (view === 'members') return <MemberManager data={data} onRefresh={onRefresh} showToast={showToast} colors={colors} primary={primary} mode={mode} isAdmin={false} />;
  if (view === 'scan') return <ScannerView profile={profile} onRefresh={onRefresh} showToast={showToast} colors={colors} primary={primary} mode={mode} />;
};

/* ===================== THE IMPROVED SCANNER ===================== */

const ScannerView = ({ profile, onRefresh, showToast, colors, primary, mode }) => {
  const [active, setActive] = useState(false);
  const [manualId, setManualId] = useState('');
  const [member, setMember] = useState(null);
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  const lookupMember = async (id) => {
    const table = CONFIG.modes[mode].membersTable;
    const { data: m } = await supabase.from(table).select('*').or(`registration_no.eq.${id},id.eq.${id}`).maybeSingle();
    if (m) {
      if (navigator.vibrate) navigator.vibrate(100);
      setMember(m);
      setAmount(m.expected_amount || '');
      setActive(false);
    } else {
      showToast("Member not found", "error");
    }
  };

  const handleTransaction = async () => {
    if (!amount || amount <= 0) return;
    setProcessing(true);
    const { error } = await supabase.from(CONFIG.modes[mode].transTable).insert([{ 
      contributor_id: member.id, 
      full_name: member.full_name, 
      registration_no: member.registration_no,
      amount: Number(amount), 
      employee_id: profile?.id, 
      employee_name: profile?.full_name,
      expected_amount: member.expected_amount
    }]);

    if (!error) {
      showToast("Payment Recorded", "success");
      setMember(null);
      onRefresh();
    } else {
      showToast("Transaction failed", "error");
    }
    setProcessing(false);
  };

  if (member) return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <div style={{ ...styles.card, background: colors.card, borderColor: colors.border, textAlign: 'center' }}>
        <span style={{ ...styles.badge, background: primary, color: '#fff' }}>{member.registration_no}</span>
        <h2 style={{ margin: '15px 0 5px' }}>{member.full_name}</h2>
        <p style={{ opacity: 0.6, fontSize: 14 }}>Enter collection amount</p>
        
        <input 
          type="number" 
          value={amount} 
          onChange={e => setAmount(e.target.value)} 
          style={{ ...styles.bigInput, color: colors.text, borderBottomColor: primary }}
          autoFocus
        />

        <button onClick={handleTransaction} disabled={processing} style={{ ...styles.btnPrimary, background: primary, width: '100%' }}>
          {processing ? "Saving..." : "Confirm Payment"}
        </button>
        <button onClick={() => setMember(null)} style={{ ...styles.btnSecondary, width: '100%', marginTop: 10, background: 'none', color: colors.textSecondary }}>Cancel</button>
      </div>
    </div>
  );

  return (
    <div style={{ textAlign: 'center' }}>
      {!active ? (
        <div style={{ display: 'grid', gap: 15 }}>
          <button onClick={() => setActive(true)} style={{ ...styles.card, background: 'none', border: `2px dashed ${primary}`, color: primary, cursor: 'pointer', height: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <Camera size={40}/>
            <span style={{ fontWeight: 'bold' }}>Open Camera Scanner</span>
          </button>
          
          <div style={{ position: 'relative', margin: '10px 0' }}>
            <hr style={{ borderColor: colors.border, opacity: 0.3 }} />
            <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate( -50%, -50% )', padding: '0 15px', background: colors.bg, fontSize: 12, color: colors.textSecondary }}>OR MANUAL ENTRY</span>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <input placeholder="Member ID (e.g. 001)" value={manualId} onChange={e => setManualId(e.target.value)} style={{ ...styles.input, borderColor: colors.border }} />
            <button onClick={() => lookupMember(manualId)} style={{ ...styles.btnPrimary, background: primary }}><ChevronRight/></button>
          </div>
        </div>
      ) : (
        <div style={styles.scanContainer}>
          <div style={{ padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ color: '#fff', margin: 0 }}>Scanning Code</h3>
            <button onClick={() => setActive(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: 10, borderRadius: '50%' }}><X/></button>
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
            <Scanner 
              onScan={(res) => res?.[0] && lookupMember(res[0].rawValue)} 
              styles={{ container: { width: '100%', height: '100%' } }}
              components={{ finder: false, audio: false }}
            />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <div style={{ width: 250, height: 250, position: 'relative' }}>
                <div className="scanner-overlay"></div>
                <div className="scanner-laser"></div>
              </div>
            </div>
          </div>
          <div style={{ padding: 40, color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Position the QR code inside the box</div>
        </div>
      )}
    </div>
  );
};

/* ===================== OTHER UI PARTS ===================== */

const MemberManager = ({ data, onRefresh, showToast, colors, primary, mode, setBulkPrintList, isAdmin }) => {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState([]);
  const [form, setForm] = useState({ show: false, m: null });

  const filtered = data.members.filter(m => 
    m.full_name.toLowerCase().includes(query.toLowerCase()) || 
    m.registration_no.includes(query.toUpperCase())
  );

  const toggleSelect = (id) => {
    if (!isAdmin) return;
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 15, background: colors.card, padding: '4px 12px', borderRadius: 14, border: `1px solid ${colors.border}`, alignItems: 'center' }}>
        <Search size={18} opacity={0.5}/>
        <input placeholder="Search members..." value={query} onChange={e => setQuery(e.target.value)} style={{ background: 'none', border: 'none', color: colors.text, padding: '12px 0', outline: 'none', flex: 1 }} />
      </div>

      {isAdmin && (
        <button onClick={() => setForm({ show: true, m: null })} style={{ ...styles.btnPrimary, background: primary, width: '100%', marginBottom: 15 }}>
          <UserPlus size={18}/> Add New Member
        </button>
      )}

      {selected.length > 0 && (
        <div style={{ position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: 400, background: primary, padding: '12px 20px', borderRadius: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1000, boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
          <span style={{ color: '#fff', fontWeight: 'bold' }}>{selected.length} selected</span>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setBulkPrintList(data.members.filter(m => selected.includes(m.id)))} style={{ background: '#fff', color: primary, border: 'none', padding: '8px 15px', borderRadius: 10, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 6 }}><Printer size={16}/> Print</button>
            <button onClick={() => setSelected([])} style={{ color: '#fff', background: 'none', border: 'none' }}><X size={20}/></button>
          </div>
        </div>
      )}

      {filtered.map(m => (
        <div key={m.id} onClick={() => toggleSelect(m.id)} style={{ ...styles.listItem, background: colors.card, borderColor: selected.includes(m.id) ? primary : colors.border }}>
          {isAdmin && <div style={{ marginRight: 15 }}>{selected.includes(m.id) ? <CheckSquare size={20} color={primary}/> : <Square size={20} opacity={0.3}/>}</div>}
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 'bold' }}>{m.full_name}</div>
            <div style={{ fontSize: 12, opacity: 0.6 }}>{m.registration_no} • ₦{m.expected_amount || 0}</div>
          </div>
          {isAdmin && <button onClick={(e) => { e.stopPropagation(); setForm({ show: true, m }); }} style={{ background: 'none', border: 'none', color: primary, padding: 8 }}><Edit3 size={18}/></button>}
        </div>
      ))}

      {form.show && (
        <div style={styles.overlay}>
          <div style={{ ...styles.modal, background: colors.card }}>
            <h3>{form.m ? 'Edit Member' : 'New Member'}</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              const payload = { 
                full_name: fd.get('name'), 
                registration_no: fd.get('reg'), 
                expected_amount: Number(fd.get('amt')), 
                ajo_owner_id: 'admin' 
              };
              const { error } = form.m 
                ? await supabase.from(CONFIG.modes[mode].membersTable).update(payload).eq('id', form.m.id)
                : await supabase.from(CONFIG.modes[mode].membersTable).insert([payload]);
              
              if (!error) { showToast("Saved", "success"); setForm({ show: false, m: null }); onRefresh(); }
              else showToast("Error", "error");
            }}>
              <input name="name" defaultValue={form.m?.full_name} placeholder="Full Name" style={{ ...styles.input, borderColor: colors.border, marginBottom: 10 }} required />
              <input name="reg" defaultValue={form.m?.registration_no} placeholder="Reg Number" style={{ ...styles.input, borderColor: colors.border, marginBottom: 10 }} required />
              <input name="amt" type="number" defaultValue={form.m?.expected_amount} placeholder="Daily Amount" style={{ ...styles.input, borderColor: colors.border, marginBottom: 20 }} required />
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" style={{ ...styles.btnPrimary, background: primary, flex: 1 }}>Save</button>
                <button type="button" onClick={() => setForm({ show: false, m: null })} style={{ ...styles.btnSecondary, flex: 1 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const TransactionList = ({ transactions, colors, primary }) => (
  <div>
    {transactions.length === 0 && <div style={{ opacity: 0.5, textAlign: 'center', padding: 20 }}>No records found</div>}
    {transactions.map(t => (
      <div key={t.id} style={{ ...styles.listItem, background: colors.card, borderColor: colors.border }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: primary + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 12, color: primary }}>
          <CreditCard size={20}/>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 'bold', fontSize: 14 }}>{t.full_name}</div>
          <div style={{ fontSize: 11, opacity: 0.5 }}>By {t.employee_name || 'Admin'} • {new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 'bold', color: primary }}>₦{t.amount?.toLocaleString()}</div>
        </div>
      </div>
    ))}
  </div>
);

const AgentManager = ({ agents, onRefresh, showToast, colors, primary }) => {
  const [form, setForm] = useState({ show: false, a: null });

  return (
    <div>
      <button onClick={() => setForm({ show: true, a: null })} style={{ ...styles.btnPrimary, background: primary, width: '100%', marginBottom: 15 }}>
        <UserPlus size={18}/> Register New Agent
      </button>

      {agents.map(a => (
        <div key={a.id} style={{ ...styles.listItem, background: colors.card, borderColor: colors.border }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 'bold' }}>{a.full_name}</div>
            <div style={{ fontSize: 12, opacity: 0.6 }}>ID: {a.employee_id_number}</div>
          </div>
          <div style={{ display: 'flex', gap: 5 }}>
            <button onClick={() => setForm({ show: true, a })} style={{ background: 'none', border: 'none', color: primary, padding: 8 }}><Edit3 size={18}/></button>
            <button onClick={async () => {
              if (window.confirm("Delete agent?")) {
                await supabase.from('employees').delete().eq('id', a.id);
                onRefresh();
              }
            }} style={{ background: 'none', border: 'none', color: '#ef4444', padding: 8 }}><Trash2 size={18}/></button>
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
              const payload = { 
                full_name: fd.get('name'), 
                employee_id_number: fd.get('eid').toLowerCase(), 
                password: fd.get('pwd') 
              };
              const { error } = form.a 
                ? await supabase.from('employees').update(payload).eq('id', form.a.id)
                : await supabase.from('employees').insert([payload]);
              
              if (!error) { showToast("Success", "success"); setForm({ show: false, a: null }); onRefresh(); }
              else showToast("Error", "error");
            }}>
              <input name="name" defaultValue={form.a?.full_name} placeholder="Full Name" style={{ ...styles.input, borderColor: colors.border, marginBottom: 10 }} required />
              <input name="eid" defaultValue={form.a?.employee_id_number} placeholder="Agent Login ID" style={{ ...styles.input, borderColor: colors.border, marginBottom: 10 }} required />
              <input name="pwd" defaultValue={form.a?.password} placeholder="Login Password" style={{ ...styles.input, borderColor: colors.border, marginBottom: 20 }} required />
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" style={{ ...styles.btnPrimary, background: primary, flex: 1 }}>Save</button>
                <button type="button" onClick={() => setForm({ show: false, a: null })} style={{ ...styles.btnSecondary, flex: 1 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const LoginScreen = ({ onLogin, loading, theme }) => {
  const [type, setType] = useState('admin');
  const colors = theme === 'dark' ? DARK_THEME : LIGHT_THEME;

  return (
    <div style={{ background: colors.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ ...styles.modal, background: colors.card, border: `1px solid ${colors.border}`, textAlign: 'center' }}>
        <Landmark size={48} color="#3b82f6" style={{ marginBottom: 10 }} />
        <h2 style={{ color: colors.text, marginBottom: 25, letterSpacing: -1 }}>{CONFIG.business.name}</h2>
        
        <div style={{ display: 'flex', background: theme === 'dark' ? '#020617' : '#f1f5f9', padding: 4, borderRadius: 14, marginBottom: 20 }}>
          <button onClick={() => setType('admin')} style={{ flex: 1, padding: 10, border: 'none', borderRadius: 10, fontWeight: 'bold', background: type === 'admin' ? '#3b82f6' : 'none', color: type === 'admin' ? '#fff' : colors.textSecondary }}>Admin</button>
          <button onClick={() => setType('agent')} style={{ flex: 1, padding: 10, border: 'none', borderRadius: 10, fontWeight: 'bold', background: type === 'agent' ? '#3b82f6' : 'none', color: type === 'agent' ? '#fff' : colors.textSecondary }}>Agent</button>
        </div>

        <form onSubmit={e => { e.preventDefault(); onLogin({ username: e.target.u.value, password: e.target.p.value }); }}>
          <input name="u" placeholder={type === 'admin' ? "Username" : "Agent ID"} style={{ ...styles.input, borderColor: colors.border, marginBottom: 10 }} required />
          <input name="p" type="password" placeholder="Password" style={{ ...styles.input, borderColor: colors.border, marginBottom: 20 }} required />
          <button type="submit" disabled={loading} style={{ ...styles.btnPrimary, background: '#3b82f6', width: '100%' }}>
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

const ModeSelection = ({ setMode, colors, onLogout }) => (
  <div style={{ background: colors.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
    <div style={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
      <h2 style={{ color: colors.text, marginBottom: 30 }}>Select Portal</h2>
      <div style={{ display: 'grid', gap: 15 }}>
        <button onClick={() => setMode('ajo')} style={{ ...styles.card, background: 'none', borderColor: CONFIG.modes.ajo.primary, color: CONFIG.modes.ajo.primary, cursor: 'pointer', height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 15, fontSize: 20, fontWeight: '900' }}>
          <Wallet size={32}/> AJO SYSTEM
        </button>
        <button onClick={() => setMode('loans')} style={{ ...styles.card, background: 'none', borderColor: CONFIG.modes.loans.primary, color: CONFIG.modes.loans.primary, cursor: 'pointer', height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 15, fontSize: 20, fontWeight: '900' }}>
          <HandCoins size={32}/> LOAN SYSTEM
        </button>
      </div>
      <button onClick={onLogout} style={{ marginTop: 40, background: 'none', border: 'none', color: colors.textSecondary, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, margin: '40px auto 0' }}><LogOut size={18}/> Log out of System</button>
    </div>
  </div>
);