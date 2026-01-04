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
    ajo: { name: 'AJO SYSTEM', primary: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', membersTable: 'contributors', transTable: 'transactions' },
    loans: { name: 'LOAN SYSTEM', primary: '#ef4444', gradient: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', membersTable: 'loan_members', transTable: 'loan_transactions' }
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
  inputBg: '#ffffff',
  inputText: '#000000'
};
const LIGHT_THEME = { 
  bg: '#f8fafc', 
  card: 'rgba(255, 255, 255, 0.8)', 
  cardSolid: '#ffffff',
  text: '#0f172a', 
  textSecondary: '#64748b', 
  border: 'rgba(0,0,0,0.05)',
  inputBg: '#ffffff',
  inputText: '#000000'
};

const styles = {
  app: { minHeight: '100vh', transition: 'all 0.4s ease' },
  header: { padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(20px)', borderBottom: '1px solid' },
  main: { padding: 20, paddingBottom: 120, maxWidth: 650, margin: '0 auto' },
  nav: { display: 'flex', justifyContent: 'space-around', padding: '15px 0', position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, borderTop: '1px solid', backdropFilter: 'blur(20px)' },
  card: { padding: 20, borderRadius: 28, border: '1px solid', marginBottom: 16, position: 'relative', overflow: 'hidden' },
  listItem: { display: 'flex', alignItems: 'center', padding: 18, borderRadius: 22, border: '1px solid', marginBottom: 12 },
  btnPrimary: { color: '#fff', border: 'none', borderRadius: 16, padding: '16px 24px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 },
  input: { width: '100%', padding: '16px', borderRadius: 14, border: '2px solid #e2e8f0', background: '#ffffff', color: '#000000', fontSize: 16, outline: 'none', boxSizing: 'border-box', marginTop: 6, fontWeight: '600' },
  label: { fontSize: 11, fontWeight: '800', color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase', marginLeft: 4 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' },
  modal: { padding: 30, borderTopLeftRadius: 32, borderTopRightRadius: 32, width: '100%', maxWidth: 500, animation: 'slideUp 0.3s ease-out' }
};

/* ===================== APP COMPONENT ===================== */

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
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      .glass-card { backdrop-filter: blur(20px); background: ${colors.card}; border: 1px solid ${colors.border}; }
      input::placeholder { color: #94a3b8; }
    `;
    document.head.appendChild(s);
  }, [colors]);

  if (!auth) return <LoginScreen onLogin={async (c) => {
    setLoading(true);
    if (c.type === 'admin') {
      if (c.u.toLowerCase() === CONFIG.admin.username && c.p === CONFIG.admin.password) setAuth({ id: 'admin', role: 'admin', name: 'Admin' });
      else showToast("Invalid Credentials", "error");
    } else {
      const { data: agent } = await supabase.from('employees').select('*').eq('employee_id_number', c.u.toLowerCase()).eq('password', c.p).maybeSingle();
      if (agent) setAuth({ id: agent.id, role: 'agent', name: agent.full_name, data: agent });
      else showToast("Invalid Credentials", "error");
    }
    setLoading(false);
  }} colors={colors} />;

  if (!mode) return <ModeSelection setMode={setMode} colors={colors} onLogout={() => setAuth(null)} />;

  return (
    <div style={{ ...styles.app, background: colors.bg, color: colors.text }}>
      <div className="no-print">
        <header style={{ ...styles.header, background: colors.card, borderColor: colors.border }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setMode(null)} style={{ width: 40, height: 40, borderRadius: 12, background: activeMode.gradient, border: 'none', color: '#fff', cursor: 'pointer' }}><ArrowLeftRight size={20}/></button>
            <div>
              <h1 style={{ fontSize: 14, fontWeight: '900', margin: 0 }}>{activeMode.name}</h1>
              <span style={{ fontSize: 10, fontWeight: '800', color: activeMode.primary, textTransform: 'uppercase' }}>{auth.role}</span>
            </div>
          </div>
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} style={{ background: 'none', border: 'none', color: colors.text }}><Sun size={20}/></button>
        </header>

        <main style={styles.main}>
          {auth.role === 'admin' ? 
            <AdminPortal view={view} data={data} colors={colors} modeConf={activeMode} mode={mode} onRefresh={fetchData} showToast={showToast} setBulkPrintList={setBulkPrintList} /> :
            <AgentPortal view={view} profile={auth.data} data={data} colors={colors} modeConf={activeMode} mode={mode} onRefresh={fetchData} showToast={showToast} />
          }
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
      
      <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 9999 }}>
        {toasts.map(t => (
          <div key={t.id} style={{ padding: '12px 24px', borderRadius: 12, background: t.type === 'error' ? '#ef4444' : '#10b981', color: '#fff', marginBottom: 10, fontWeight: '800', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>{t.message}</div>
        ))}
      </div>
    </div>
  );
}

/* ===================== DASHBOARDS ===================== */

const AdminPortal = ({ view, data, colors, modeConf, mode, onRefresh, showToast, setBulkPrintList }) => {
  if (view === 'dashboard') {
    const today = new Date().toISOString().slice(0, 10);
    const todayTotal = data.transactions.filter(t => t.created_at.startsWith(today)).reduce((s, t) => s + (t.amount || 0), 0);

    return (
      <div style={{ animation: 'fadeIn 0.4s' }}>
        <div style={{ ...styles.card, background: modeConf.gradient, color: '#fff', border: 'none' }}>
          <p style={{ opacity: 0.8, fontSize: 12, fontWeight: '800', margin: 0 }}>TOTAL COLLECTIONS TODAY</p>
          <h1 style={{ fontSize: 42, margin: '10px 0', fontWeight: '900' }}>₦{todayTotal.toLocaleString()}</h1>
          <div style={{ display: 'flex', gap: 20, marginTop: 15 }}>
            <div><small style={{ opacity: 0.7 }}>Members</small><div style={{ fontWeight: 'bold' }}>{data.members.length}</div></div>
            <div><small style={{ opacity: 0.7 }}>Agents</small><div style={{ fontWeight: 'bold' }}>{data.agents.length}</div></div>
          </div>
        </div>
        <h3 style={{ margin: '25px 0 15px' }}>Recent Activity</h3>
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
          <p style={{ opacity: 0.8, fontSize: 12, fontWeight: '800', margin: 0 }}>MY COLLECTIONS TODAY</p>
          <h1 style={{ fontSize: 48, margin: '10px 0', fontWeight: '900' }}>₦{myTotal.toLocaleString()}</h1>
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '6px 16px', borderRadius: 20, display: 'inline-block', fontSize: 13, fontWeight: '700' }}>{myTs.length} Records</div>
        </div>
        <h3 style={{ margin: '25px 0 15px' }}>My Recent Transactions</h3>
        <TransactionList transactions={data.transactions.filter(t => t.employee_id === profile?.id).slice(0, 10)} colors={colors} primary={modeConf.primary} />
      </div>
    );
  }
  if (view === 'members') return <MemberManager data={data} colors={colors} modeConf={modeConf} mode={mode} onRefresh={onRefresh} showToast={showToast} isAdmin={false} />;
  if (view === 'scan') return <ScannerView profile={profile} onRefresh={onRefresh} showToast={showToast} colors={colors} modeConf={modeConf} mode={mode} />;
};

/* ===================== MEMBER MANAGER ===================== */

const MemberManager = ({ data, colors, modeConf, mode, onRefresh, showToast, setBulkPrintList, isAdmin }) => {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState([]);
  const [form, setForm] = useState({ show: false, m: null });
  const filtered = data.members.filter(m => 
    m.full_name.toLowerCase().includes(query.toLowerCase()) || 
    m.registration_no.includes(query.toUpperCase())
  );

  return (
    <div>
      <div className="glass-card" style={{ display: 'flex', gap: 10, padding: 14, borderRadius: 18, marginBottom: 15, alignItems: 'center' }}>
        <Search size={20} opacity={0.5}/><input placeholder="Search members..." value={query} onChange={e => setQuery(e.target.value)} style={{ border: 'none', background: 'none', color: 'inherit', outline: 'none', flex: 1, fontWeight: '600' }} />
      </div>

      {isAdmin && <button onClick={() => setForm({ show: true, m: null })} style={{ ...styles.btnPrimary, background: modeConf.gradient, width: '100%', marginBottom: 15 }}><UserPlus size={20}/> Add Member</button>}
      
      {selected.length > 0 && (
        <div style={{ position:'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: 400, background: modeConf.primary, padding: 15, borderRadius: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1000, boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
          <span style={{ color: '#fff', fontWeight: '800' }}>{selected.length} Selected</span>
          <button onClick={() => setBulkPrintList(data.members.filter(m => selected.includes(m.id)))} style={{ background: '#fff', color: modeConf.primary, border: 'none', padding: '8px 15px', borderRadius: 10, fontWeight: '800' }}>Print IDs</button>
        </div>
      )}

      {filtered.map(m => (
        <div key={m.id} onClick={() => isAdmin && setSelected(s => s.includes(m.id) ? s.filter(i => i !== m.id) : [...s, m.id])} className="glass-card" style={{ ...styles.listItem, borderColor: selected.includes(m.id) ? modeConf.primary : colors.border }}>
          {isAdmin && <div style={{ marginRight: 15 }}>{selected.includes(m.id) ? <CheckSquare size={22} color={modeConf.primary}/> : <Square size={22} opacity={0.2}/>}</div>}
          <div style={{ flex: 1 }}>
            <strong style={{ fontSize: 16 }}>{m.full_name}</strong>
            <div style={{ fontSize: 12, opacity: 0.6 }}>{m.registration_no} • ₦{m.expected_amount?.toLocaleString()}</div>
            {m.phone && <div style={{ fontSize: 11, opacity: 0.5, marginTop: 2 }}>📞 {m.phone}</div>}
          </div>
          {isAdmin && <button onClick={(e) => { e.stopPropagation(); setForm({ show: true, m }); }} style={{ background: 'none', border: 'none', color: modeConf.primary }}><Edit3 size={18}/></button>}
        </div>
      ))}

      {form.show && (
        <div style={styles.overlay}>
          <div style={{ ...styles.modal, background: colors.cardSolid, color: colors.text }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
               <h3 style={{ margin: 0 }}>Member Information</h3>
               {form.m && <button onClick={async () => { if(window.confirm("Delete member?")) { await supabase.from(CONFIG.modes[mode].membersTable).delete().eq('id', form.m.id); onRefresh(); setForm({ show: false }); } }} style={{ background: 'none', border: 'none', color: '#ef4444' }}><Trash2 size={20}/></button>}
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
              if (!error) { setForm({ show: false }); onRefresh(); }
            }}>
              <label style={styles.label}>Full Name</label>
              <input name="n" defaultValue={form.m?.full_name} style={styles.input} required />
              
              <div style={{ display: 'flex', gap: 10, marginTop: 15 }}>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Reg No</label>
                  <input name="r" defaultValue={form.m?.registration_no} style={styles.input} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Daily Amount</label>
                  <input name="a" type="number" defaultValue={form.m?.expected_amount} style={styles.input} required />
                </div>
              </div>

              <div style={{ marginTop: 15 }}>
                <label style={styles.label}>Phone Number</label>
                <input name="p" type="tel" defaultValue={form.m?.phone} placeholder="08000000000" style={styles.input} />
              </div>

              <div style={{ marginTop: 15, marginBottom: 25 }}>
                <label style={styles.label}>Home Address</label>
                <textarea name="addr" defaultValue={form.m?.address} rows="2" style={{ ...styles.input, resize: 'none' }} />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" style={{ ...styles.btnPrimary, background: modeConf.gradient, flex: 2 }}>Save Member</button>
                <button type="button" onClick={() => setForm({ show: false })} style={{ ...styles.btnSecondary, flex: 1 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* ===================== SCANNER & LOGIN ===================== */

const LoginScreen = ({ onLogin, colors }) => {
  const [type, setType] = useState('agent');
  return (
    <div style={{ background: colors.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="glass-card" style={{ padding: 40, borderRadius: 32, width: '100%', maxWidth: 400, textAlign: 'center' }}>
        <Landmark size={48} color="#3b82f6" style={{ marginBottom: 15 }} />
        <h2 style={{ marginBottom: 30, letterSpacing: -1 }}>{CONFIG.business.name}</h2>
        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.05)', padding: 4, borderRadius: 14, marginBottom: 25 }}>
          <button onClick={() => setType('agent')} style={{ flex: 1, padding: 12, border: 'none', borderRadius: 10, fontWeight: 'bold', background: type === 'agent' ? '#fff' : 'none', color: type === 'agent' ? '#000' : '#64748b' }}>Agent</button>
          <button onClick={() => setType('admin')} style={{ flex: 1, padding: 12, border: 'none', borderRadius: 10, fontWeight: 'bold', background: type === 'admin' ? '#fff' : 'none', color: type === 'admin' ? '#000' : '#64748b' }}>Admin</button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onLogin({ u: e.target.u.value, p: e.target.p.value, type }); }}>
          <input name="u" placeholder={type === 'admin' ? "Username" : "Agent ID"} style={styles.input} required />
          <input name="p" type="password" placeholder="Password" style={{ ...styles.input, marginTop: 10, marginBottom: 25 }} required />
          <button type="submit" style={{ ...styles.btnPrimary, background: '#3b82f6', width: '100%', height: 55 }}>Login</button>
        </form>
      </div>
    </div>
  );
};

const ScannerView = ({ profile, onRefresh, showToast, colors, modeConf, mode }) => {
  const [active, setActive] = useState(false);
  const [member, setMember] = useState(null);
  const [amount, setAmount] = useState('');

  const lookupMember = async (id) => {
    const { data: m } = await supabase.from(CONFIG.modes[mode].membersTable).select('*').or(`registration_no.eq.${id.toUpperCase()},id.eq.${id}`).maybeSingle();
    if (m) { setMember(m); setAmount(m.expected_amount || ''); setActive(false); } 
    else showToast("Member not found", "error");
  };

  if (member) return (
    <div style={{ ...styles.card, background: colors.cardSolid, textAlign: 'center', padding: '60px 20px' }}>
      <button onClick={() => setMember(null)} style={{ position:'absolute', top: 20, right: 20, background:'none', border:'none', color:colors.text }}><X/></button>
      <h2 style={{ margin: 0 }}>{member.full_name}</h2>
      <p style={{ opacity: 0.5 }}>{member.registration_no}</p>
      <div style={{ margin: '30px 0' }}>
        <label style={styles.label}>Collection Amount</label>
        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} style={{ ...styles.input, fontSize: 32, textAlign: 'center' }} autoFocus />
      </div>
      <button onClick={async () => {
        const { error } = await supabase.from(CONFIG.modes[mode].transTable).insert([{ contributor_id: member.id, full_name: member.full_name, registration_no: member.registration_no, amount: Number(amount), employee_id: profile?.id, employee_name: profile?.full_name }]);
        if (!error) { showToast("Success", "success"); setMember(null); onRefresh(); }
      }} style={{ ...styles.btnPrimary, background: modeConf.gradient, width: '100%', height: 60 }}>Confirm Payment</button>
    </div>
  );

  return (
    <div style={{ textAlign: 'center' }}>
      <div className="glass-card" style={{ padding: '60px 20px', borderRadius: 32 }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: `${modeConf.primary}20`, color: modeConf.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}><Camera size={40}/></div>
        <button onClick={() => setActive(true)} style={{ ...styles.btnPrimary, background: modeConf.gradient, width: '100%', height: 60, fontSize: 18 }}><QrCode/> Open Scanner</button>
      </div>
      {active && (
        <div style={{ position:'fixed', inset:0, background:'#000', zIndex:2000 }}>
          <Scanner onScan={(res) => res?.[0] && lookupMember(res[0].rawValue)} />
          <button onClick={() => setActive(false)} style={{ position:'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', background:'#fff', border:'none', padding:'12px 30px', borderRadius:20, fontWeight:'bold' }}>Close</button>
        </div>
      )}
    </div>
  );
};

/* ===================== SHARED UI ===================== */

const NavBtn = ({ active, icon, label, onClick, colors, primary }) => (
  <button onClick={onClick} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', color: active ? primary : colors.textSecondary }}>
    {React.cloneElement(icon, { size: 22 })}
    <span style={{ fontSize: 10, fontWeight: '800' }}>{label}</span>
  </button>
);

const TransactionList = ({ transactions, colors, primary }) => (
  <div>
    {transactions.map(t => (
      <div key={t.id} className="glass-card" style={styles.listItem}>
        <div style={{ width: 45, height: 45, borderRadius: 12, background: `${primary}15`, color: primary, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 15 }}><ArrowUpRight size={22}/></div>
        <div style={{ flex: 1 }}>
          <strong style={{ fontSize: 15 }}>{t.full_name}</strong>
          <div style={{ fontSize: 11, opacity: 0.5 }}>{new Date(t.created_at).toLocaleTimeString()} • {t.employee_name || 'Admin'}</div>
        </div>
        <div style={{ fontWeight: '900', color: primary, fontSize: 16 }}>₦{t.amount?.toLocaleString()}</div>
      </div>
    ))}
  </div>
);

const ModeSelection = ({ setMode, colors, onLogout }) => (
  <div style={{ background: colors.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
    <div style={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
      <h2 style={{ marginBottom: 40 }}>Select Portal</h2>
      <div style={{ display: 'grid', gap: 15 }}>
        <button onClick={() => setMode('ajo')} className="glass-card" style={{ height: 120, cursor: 'pointer', borderRadius: 24 }}><Wallet size={32} color={CONFIG.modes.ajo.primary}/><br/><b>AJO SYSTEM</b></button>
        <button onClick={() => setMode('loans')} className="glass-card" style={{ height: 120, cursor: 'pointer', borderRadius: 24 }}><HandCoins size={32} color={CONFIG.modes.loans.primary}/><br/><b>LOAN SYSTEM</b></button>
      </div>
      <button onClick={onLogout} style={{ marginTop: 40, background: 'none', border: 'none', color: colors.textSecondary, fontWeight: '800' }}><LogOut size={18}/> Logout</button>
    </div>
  </div>
);

const AgentManager = ({ agents, onRefresh, colors, modeConf }) => {
  const [form, setForm] = useState({ show: false, a: null });
  return (
    <div>
      <button onClick={() => setForm({ show: true, a: null })} style={{ ...styles.btnPrimary, background: modeConf.gradient, width: '100%', marginBottom: 15 }}>Register Agent</button>
      {agents.map(a => (
        <div key={a.id} className="glass-card" style={styles.listItem}>
          <div style={{ flex: 1 }}><strong>{a.full_name}</strong><div style={{ fontSize: 12, opacity: 0.5 }}>ID: {a.employee_id_number}</div></div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setForm({ show: true, a })} style={{ background: 'none', border: 'none', color: modeConf.primary }}><Edit3 size={18}/></button>
            <button onClick={async () => { if(window.confirm("Delete agent?")) { await supabase.from('employees').delete().eq('id', a.id); onRefresh(); } }} style={{ background: 'none', border: 'none', color: '#ef4444' }}><Trash2 size={18}/></button>
          </div>
        </div>
      ))}
      {form.show && (
        <div style={styles.overlay}>
          <div style={{ ...styles.modal, background: colors.cardSolid, color: colors.text }}>
            <h3 style={{ margin: '0 0 20px 0' }}>Agent Profile</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              const p = { full_name: fd.get('n'), employee_id_number: fd.get('e').toLowerCase(), password: fd.get('p') };
              const { error } = form.a ? await supabase.from('employees').update(p).eq('id', form.a.id) : await supabase.from('employees').insert([p]);
              if (!error) { setForm({ show: false }); onRefresh(); }
            }}>
              <label style={styles.label}>Full Name</label>
              <input name="n" defaultValue={form.a?.full_name} style={styles.input} required />
              <label style={{ ...styles.label, marginTop: 15 }}>Agent ID</label>
              <input name="e" defaultValue={form.a?.employee_id_number} style={styles.input} required />
              <label style={{ ...styles.label, marginTop: 15 }}>Password</label>
              <input name="p" defaultValue={form.a?.password} style={{ ...styles.input, marginBottom: 25 }} required />
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" style={{ ...styles.btnPrimary, background: modeConf.gradient, flex: 2 }}>Save</button>
                <button type="button" onClick={() => setForm({ show: false })} style={{ ...styles.btnSecondary, flex: 1 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const PrintView = ({ list, mode, onClose }) => (
  <div className="print-area">
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10mm', padding: '10mm' }}>
      {list.map(m => (
        <div key={m.id} style={{ border: '2px solid #000', borderRadius: '15px', padding: '20px', textAlign: 'center', color: '#000' }}>
          <h3>{CONFIG.business.name}</h3>
          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${m.registration_no}`} style={{ width: '120px' }} alt="qr" />
          <div style={{ textAlign: 'left', marginTop: '10px' }}>
            <div><b>NAME:</b> {m.full_name}</div>
            <div><b>ID:</b> {m.registration_no}</div>
          </div>
        </div>
      ))}
    </div>
    <div className="no-print" style={{ position:'fixed', bottom: 20, right: 20 }}>
      <button onClick={() => window.print()} style={{ ...styles.btnPrimary, background: '#10b981' }}>Print</button>
      <button onClick={onClose} style={styles.btnSecondary}>Close</button>
    </div>
  </div>
);