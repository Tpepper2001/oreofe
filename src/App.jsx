import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Scanner } from '@yudiel/react-qr-scanner';
import {
  Users, UserPlus, LayoutDashboard, LogOut, Landmark, X, Camera, 
  Printer, Moon, Sun, UserCheck, Search, TrendingUp, Calendar, 
  Trash2, Edit3, ArrowLeftRight, Wallet, HandCoins, CheckSquare, 
  Square, CreditCard, ChevronRight, QrCode, Zap, ZapOff, AlertCircle,
  Phone, MapPin, Plus, ArrowUpRight, TrendingDown, MoreVertical
} from 'lucide-react';

/* ===================== ENHANCED CONFIGURATION ===================== */
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
    ajo: { 
      name: 'AJO SYSTEM', 
      primary: '#3b82f6', 
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      membersTable: 'contributors', 
      transTable: 'transactions' 
    },
    loans: { 
      name: 'LOAN SYSTEM', 
      primary: '#ef4444', 
      gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      membersTable: 'loan_members', 
      transTable: 'loan_transactions' 
    }
  }
};

const supabase = createClient(CONFIG.supabase.url, CONFIG.supabase.key);

/* ===================== ADVANCED STYLES (GLASSMORPHISM) ===================== */
const getTheme = (mode) => ({
  dark: {
    bg: '#020617',
    card: 'rgba(30, 41, 59, 0.7)',
    cardSolid: '#1e293b',
    text: '#f8fafc',
    textSecondary: '#94a3b8',
    border: 'rgba(255, 255, 255, 0.1)',
    glass: 'rgba(15, 23, 42, 0.8)',
    input: 'rgba(0, 0, 0, 0.2)'
  },
  light: {
    bg: '#f8fafc',
    card: 'rgba(255, 255, 255, 0.8)',
    cardSolid: '#ffffff',
    text: '#0f172a',
    textSecondary: '#64748b',
    border: 'rgba(0, 0, 0, 0.05)',
    glass: 'rgba(255, 255, 255, 0.9)',
    input: 'rgba(255, 255, 255, 1)'
  }
});

const sharedStyles = {
  glass: { backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' },
  shadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  btn: {
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    fontWeight: '600'
  }
};

/* ===================== UTILITIES ===================== */
const hapticFeedback = (type = 'light') => {
  if (!navigator.vibrate) return;
  if (type === 'light') navigator.vibrate(10);
  if (type === 'medium') navigator.vibrate(30);
  if (type === 'error') navigator.vibrate([50, 30, 50]);
  if (type === 'success') navigator.vibrate([10, 30, 10]);
};

const formatCurrency = (amt) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amt || 0);

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

  const colors = useMemo(() => getTheme()[theme], [theme]);
  const primary = mode ? CONFIG.modes[mode].primary : '#3b82f6';
  const gradient = mode ? CONFIG.modes[mode].gradient : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    hapticFeedback(type === 'error' ? 'error' : 'success');
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  const fetchData = useCallback(async () => {
    if (!auth || !mode) return;
    setLoading(true);
    const mConf = CONFIG.modes[mode];
    try {
      const [m, t, e] = await Promise.all([
        supabase.from(mConf.membersTable).select('*').order('created_at', { ascending: false }),
        supabase.from(mConf.transTable).select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('employees').select('*').order('full_name')
      ]);
      setData({ members: m.data || [], transactions: t.data || [], agents: e.data || [] });
    } catch (err) { showToast("Sync failed", "error"); }
    finally { setLoading(false); }
  }, [auth, mode, showToast]);

  useEffect(() => { if (auth && mode) fetchData(); }, [auth, mode, fetchData]);

  // Global Styles injection
  useEffect(() => {
    const s = document.createElement('style');
    s.textContent = `
      * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; font-family: 'Inter', system-ui, sans-serif; }
      body { margin: 0; padding: 0; overflow-x: hidden; }
      .press-effect:active { transform: scale(0.96); opacity: 0.8; }
      @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      .bottom-sheet { animation: slideUp 0.3s cubic-bezier(0, 0, 0.2, 1); }
      .skeleton { background: linear-gradient(90deg, ${colors.border} 25%, ${colors.card} 50%, ${colors.border} 75%); background-size: 200% 100%; animation: skeleton-loading 1.5s infinite; }
      @keyframes skeleton-loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    `;
    document.head.appendChild(s);
  }, [colors]);

  if (!auth) return <LoginScreen onLogin={(creds) => {
    if (creds.type === 'admin') {
      if (creds.u.toLowerCase() === CONFIG.admin.username && creds.p === CONFIG.admin.password) {
        setAuth({ id: 'admin', role: 'admin', name: 'Admin' });
      } else showToast("Invalid Admin Login", "error");
    } else {
      setLoading(true);
      supabase.from('employees').select('*').eq('employee_id_number', creds.u.toLowerCase()).eq('password', creds.p).maybeSingle()
        .then(({data: agent}) => {
          if (agent) setAuth({ id: agent.id, role: 'agent', name: agent.full_name, data: agent });
          else showToast("Invalid Agent Credentials", "error");
          setLoading(false);
        });
    }
  }} colors={colors} />;

  if (!mode) return <ModeSelection setMode={setMode} colors={colors} onLogout={() => setAuth(null)} />;

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, color: colors.text }}>
      {/* Header */}
      <header style={{ 
        padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        position: 'sticky', top: 0, zIndex: 100, background: colors.glass, borderBottom: `1px solid ${colors.border}`,
        ...sharedStyles.glass
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => { hapticFeedback(); setMode(null); }} className="press-effect" style={{ background: colors.card, border: 'none', borderRadius: 12, padding: 8, color: colors.text }}><ArrowLeftRight size={18}/></button>
          <span style={{ fontWeight: 800, fontSize: 14, letterSpacing: 0.5 }}>{CONFIG.modes[mode].name}</span>
        </div>
        <button onClick={() => { hapticFeedback(); setTheme(theme === 'dark' ? 'light' : 'dark'); }} style={{ background: 'none', border: 'none', color: colors.text }}>
          {theme === 'dark' ? <Sun size={22}/> : <Moon size={22}/>}
        </button>
      </header>

      {/* Main Content */}
      <main style={{ padding: '20px 20px 120px', maxWidth: 600, margin: '0 auto' }}>
        {auth.role === 'admin' ? 
          <AdminPortal view={view} data={data} colors={colors} primary={primary} gradient={gradient} mode={mode} onRefresh={fetchData} showToast={showToast} setBulkPrintList={setBulkPrintList} /> :
          <AgentPortal view={view} profile={auth.data} data={data} colors={colors} primary={primary} gradient={gradient} mode={mode} onRefresh={fetchData} showToast={showToast} />
        }
      </main>

      {/* Navigation */}
      <nav style={{ 
        position: 'fixed', bottom: 20, left: 20, right: 20, height: 70, 
        background: colors.glass, borderRadius: 24, display: 'flex', 
        justifyContent: 'space-around', alignItems: 'center', border: `1px solid ${colors.border}`,
        boxShadow: sharedStyles.shadow, zIndex: 100, ...sharedStyles.glass
      }}>
        <NavBtn active={view === 'dashboard'} icon={<LayoutDashboard/>} label="Home" onClick={() => setView('dashboard')} colors={colors} primary={primary} />
        <NavBtn active={view === 'members'} icon={<Users/>} label="Members" onClick={() => setView('members')} colors={colors} primary={primary} />
        {auth.role === 'admin' ? 
          <NavBtn active={view === 'agents'} icon={<UserCheck/>} label="Agents" onClick={() => setView('agents')} colors={colors} primary={primary} /> :
          <NavBtn active={view === 'scan'} icon={<Camera/>} label="Scan" onClick={() => setView('scan')} colors={colors} primary={primary} />
        }
        <NavBtn icon={<LogOut/>} label="Exit" onClick={() => { hapticFeedback('medium'); setAuth(null); }} colors={colors} primary={primary} />
      </nav>

      {/* Toasts */}
      <div style={{ position: 'fixed', top: 80, left: 20, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {toasts.map(t => (
          <div key={t.id} style={{ 
            padding: '16px 20px', borderRadius: 16, background: t.type === 'error' ? '#ef4444' : '#10b981', 
            color: '#fff', fontWeight: '700', boxShadow: sharedStyles.shadow, display: 'flex', alignItems: 'center', gap: 10,
            animation: 'fadeIn 0.3s ease-out'
          }}>
            {t.type === 'error' ? <AlertCircle size={20}/> : <CheckSquare size={20}/>}
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===================== SUB-COMPONENTS (UPGRADED UI) ===================== */

const NavBtn = ({ active, icon, label, onClick, colors, primary }) => (
  <button onClick={() => { hapticFeedback(); onClick(); }} style={{ 
    ...sharedStyles.btn, background: 'none', flexDirection: 'column', gap: 4, 
    color: active ? primary : colors.textSecondary, width: 60 
  }}>
    <div style={{ 
      transition: 'all 0.3s', 
      transform: active ? 'translateY(-2px)' : 'none',
      color: active ? primary : colors.textSecondary 
    }}>{React.cloneElement(icon, { size: active ? 24 : 22, strokeWidth: active ? 2.5 : 2 })}</div>
    <span style={{ fontSize: 10, fontWeight: active ? 800 : 500 }}>{label}</span>
  </button>
);

const StatCard = ({ label, value, icon, gradient, colors, subtext }) => (
  <div style={{ 
    padding: 24, borderRadius: 28, background: gradient, color: '#fff', 
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', position: 'relative', overflow: 'hidden'
  }}>
    <div style={{ position: 'absolute', top: -10, right: -10, opacity: 0.1 }}>{React.cloneElement(icon, { size: 120 })}</div>
    <div style={{ opacity: 0.8, fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>{label.toUpperCase()}</div>
    <div style={{ fontSize: 32, fontWeight: 900, margin: '8px 0' }}>{value}</div>
    {subtext && <div style={{ fontSize: 12, background: 'rgba(255,255,255,0.2)', display: 'inline-block', padding: '4px 12px', borderRadius: 12 }}>{subtext}</div>}
  </div>
);

const AdminPortal = ({ view, data, colors, primary, gradient, mode, onRefresh, showToast, setBulkPrintList }) => {
  if (view === 'dashboard') {
    const today = new Date().toISOString().slice(0, 10);
    const todayTotal = data.transactions.filter(t => t.created_at.startsWith(today)).reduce((s, t) => s + (t.amount || 0), 0);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <StatCard label="Collections Today" value={formatCurrency(todayTotal)} icon={<TrendingUp/>} gradient={gradient} colors={colors} subtext={`${data.transactions.filter(t => t.created_at.startsWith(today)).length} deposits`} />
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
          <div style={{ background: colors.card, padding: 20, borderRadius: 24, border: `1px solid ${colors.border}` }}>
            <div style={{ color: colors.textSecondary, fontSize: 11, fontWeight: 700, marginBottom: 5 }}>TOTAL MEMBERS</div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>{data.members.length}</div>
          </div>
          <div style={{ background: colors.card, padding: 20, borderRadius: 24, border: `1px solid ${colors.border}` }}>
            <div style={{ color: colors.textSecondary, fontSize: 11, fontWeight: 700, marginBottom: 5 }}>ACTIVE AGENTS</div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>{data.agents.length}</div>
          </div>
        </div>

        <h3 style={{ margin: '10px 0 0', fontSize: 18, fontWeight: 800 }}>Recent Transactions</h3>
        <TransactionList transactions={data.transactions.slice(0, 8)} colors={colors} primary={primary} />
      </div>
    );
  }

  if (view === 'members') return <MemberManager data={data} colors={colors} primary={primary} mode={mode} onRefresh={onRefresh} showToast={showToast} setBulkPrintList={setBulkPrintList} isAdmin={true} />;
  if (view === 'agents') return <AgentManager agents={data.agents} onRefresh={onRefresh} colors={colors} primary={primary} />;
};

const AgentPortal = ({ view, profile, data, colors, primary, gradient, mode, onRefresh, showToast }) => {
  if (view === 'dashboard') {
    const today = new Date().toISOString().slice(0, 10);
    const myTs = data.transactions.filter(t => t.employee_id === profile?.id && t.created_at.startsWith(today));
    const total = myTs.reduce((s, t) => s + (t.amount || 0), 0);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <StatCard label="My Daily Total" value={formatCurrency(total)} icon={<Wallet/>} gradient={gradient} colors={colors} subtext={`${myTs.length} collections`} />
        <h3 style={{ margin: '10px 0 0', fontSize: 18, fontWeight: 800 }}>My Recent Work</h3>
        <TransactionList transactions={data.transactions.filter(t => t.employee_id === profile?.id).slice(0, 10)} colors={colors} primary={primary} />
      </div>
    );
  }
  if (view === 'members') return <MemberManager data={data} colors={colors} primary={primary} mode={mode} onRefresh={onRefresh} showToast={showToast} isAdmin={false} />;
  if (view === 'scan') return <ScannerView profile={profile} onRefresh={onRefresh} showToast={showToast} colors={colors} primary={primary} mode={mode} />;
};

/* ===================== MEMBER MANAGER (WITH DELETE & PHONE) ===================== */

const MemberManager = ({ data, colors, primary, mode, onRefresh, showToast, setBulkPrintList, isAdmin }) => {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState([]);
  const [editingMember, setEditingMember] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  const filtered = data.members.filter(m => 
    m.full_name.toLowerCase().includes(query.toLowerCase()) || 
    m.registration_no.includes(query.toUpperCase()) ||
    m.phone_number?.includes(query)
  );

  return (
    <div>
      {/* Search Bar */}
      <div style={{ 
        display: 'flex', gap: 12, background: colors.card, padding: '12px 16px', 
        borderRadius: 20, border: `1px solid ${colors.border}`, marginBottom: 20, 
        alignItems: 'center', ...sharedStyles.glass 
      }}>
        <Search size={20} color={colors.textSecondary}/>
        <input 
          placeholder="Name, ID or Phone..." 
          value={query} 
          onChange={e => setQuery(e.target.value)} 
          style={{ border: 'none', background: 'none', color: colors.text, outline: 'none', flex: 1, fontSize: 16 }} 
        />
      </div>

      {isAdmin && (
        <button onClick={() => { hapticFeedback(); setIsAdding(true); }} style={{ 
          ...sharedStyles.btn, background: primary, color: '#fff', width: '100%', 
          height: 56, borderRadius: 18, marginBottom: 20, boxShadow: sharedStyles.shadow 
        }}>
          <UserPlus size={20}/> Add New Member
        </button>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(m => (
          <div key={m.id} 
            onClick={() => {
              if (isAdmin) {
                hapticFeedback();
                setSelected(prev => prev.includes(m.id) ? prev.filter(id => id !== m.id) : [...prev, m.id]);
              }
            }}
            style={{ 
              background: colors.card, padding: 16, borderRadius: 24, border: `1px solid ${selected.includes(m.id) ? primary : colors.border}`,
              display: 'flex', alignItems: 'center', gap: 15, transition: 'all 0.2s', ...sharedStyles.glass
            }}
          >
            {isAdmin && (selected.includes(m.id) ? <CheckSquare size={22} color={primary}/> : <Square size={22} color={colors.textSecondary} opacity={0.5}/>)}
            
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 16 }}>{m.full_name}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 15px', marginTop: 4 }}>
                <div style={{ fontSize: 12, color: colors.textSecondary, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Zap size={12}/> {m.registration_no}
                </div>
                {m.phone_number && (
                  <div style={{ fontSize: 12, color: primary, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Phone size={12}/> {m.phone_number}
                  </div>
                )}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 900, color: colors.text }}>₦{m.expected_amount?.toLocaleString()}</div>
              {isAdmin && (
                <button 
                  onClick={(e) => { e.stopPropagation(); hapticFeedback(); setEditingMember(m); }}
                  style={{ background: 'none', border: 'none', color: colors.textSecondary, padding: '8px 0 8px 8px' }}
                >
                  <MoreVertical size={20}/>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Floating Action for Bulk Printing */}
      {selected.length > 0 && (
        <div style={{ 
          position: 'fixed', bottom: 100, left: 30, right: 30, background: primary, 
          padding: '12px 20px', borderRadius: 20, display: 'flex', justifyContent: 'space-between', 
          alignItems: 'center', color: '#fff', boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          animation: 'slideUp 0.3s ease'
        }}>
          <span style={{ fontWeight: 800 }}>{selected.length} Selected</span>
          <button onClick={() => setBulkPrintList(data.members.filter(m => selected.includes(m.id)))} style={{ background: '#fff', color: primary, border: 'none', padding: '8px 16px', borderRadius: 12, fontWeight: 800 }}>Print IDs</button>
        </div>
      )}

      {/* Member Form (Bottom Sheet) */}
      {(isAdding || editingMember) && (
        <BottomSheet onClose={() => { setIsAdding(false); setEditingMember(null); }} colors={colors}>
          <MemberForm 
            member={editingMember} 
            mode={mode} 
            primary={primary} 
            colors={colors} 
            onClose={() => { setIsAdding(false); setEditingMember(null); }} 
            onRefresh={onRefresh}
            showToast={showToast}
          />
        </BottomSheet>
      )}
    </div>
  );
};

const MemberForm = ({ member, mode, primary, colors, onClose, onRefresh, showToast }) => {
  const [loading, setLoading] = useState(false);
  const isEdit = !!member;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.target);
    const payload = {
      full_name: fd.get('name'),
      registration_no: fd.get('reg').toUpperCase(),
      phone_number: fd.get('phone'),
      address: fd.get('address'),
      expected_amount: Number(fd.get('amount')),
      ajo_owner_id: 'admin'
    };

    const { error } = isEdit 
      ? await supabase.from(CONFIG.modes[mode].membersTable).update(payload).eq('id', member.id)
      : await supabase.from(CONFIG.modes[mode].membersTable).insert([payload]);

    if (!error) {
      showToast(isEdit ? "Updated successfully" : "Member added", "success");
      onRefresh();
      onClose();
    } else {
      showToast(error.message, "error");
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${member.full_name}?`)) return;
    setLoading(true);
    const { error } = await supabase.from(CONFIG.modes[mode].membersTable).delete().eq('id', member.id);
    if (!error) {
      showToast("Member deleted", "success");
      onRefresh();
      onClose();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
      <h2 style={{ margin: '0 0 10px', fontWeight: 900 }}>{isEdit ? 'Edit Member' : 'New Member'}</h2>
      
      <div className="form-group">
        <label style={labelStyle}>FULL NAME</label>
        <input name="name" defaultValue={member?.full_name} placeholder="e.g. John Doe" style={inputStyle(colors)} required />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
        <div className="form-group">
          <label style={labelStyle}>REG NO / ID</label>
          <input name="reg" defaultValue={member?.registration_no} placeholder="ABC-123" style={inputStyle(colors)} required />
        </div>
        <div className="form-group">
          <label style={labelStyle}>DAILY AMOUNT (₦)</label>
          <input name="amount" type="number" defaultValue={member?.expected_amount} placeholder="1000" style={inputStyle(colors)} required />
        </div>
      </div>

      <div className="form-group">
        <label style={labelStyle}>PHONE NUMBER</label>
        <input name="phone" type="tel" defaultValue={member?.phone_number} placeholder="0810 000 0000" style={inputStyle(colors)} />
      </div>

      <div className="form-group">
        <label style={labelStyle}>HOME ADDRESS</label>
        <textarea name="address" defaultValue={member?.address} rows={2} placeholder="Residential address..." style={{ ...inputStyle(colors), resize: 'none' }} />
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
        <button type="submit" disabled={loading} style={{ ...sharedStyles.btn, background: primary, color: '#fff', flex: 2, height: 56, borderRadius: 16 }}>
          {loading ? 'Saving...' : 'Save Member'}
        </button>
        {isEdit && (
          <button type="button" onClick={handleDelete} style={{ ...sharedStyles.btn, background: '#ef444420', color: '#ef4444', flex: 1, borderRadius: 16 }}>
            <Trash2 size={20}/>
          </button>
        )}
      </div>
    </form>
  );
};

/* ===================== UI COMPONENTS ===================== */

const BottomSheet = ({ children, onClose, colors }) => (
  <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'flex-end' }}>
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />
    <div className="bottom-sheet" style={{ 
      width: '100%', background: colors.cardSolid, borderTopLeftRadius: 32, borderTopRightRadius: 32, 
      padding: '30px 24px 50px', position: 'relative', boxShadow: '0 -10px 40px rgba(0,0,0,0.2)' 
    }}>
      <div style={{ width: 40, height: 5, background: colors.border, borderRadius: 10, margin: '-15px auto 20px' }} />
      {children}
    </div>
  </div>
);

const TransactionList = ({ transactions, colors, primary }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
    {transactions.length === 0 && <div style={{ padding: 40, textAlign: 'center', opacity: 0.5 }}>No records found</div>}
    {transactions.map(t => (
      <div key={t.id} style={{ 
        display: 'flex', alignItems: 'center', gap: 15, padding: 16, background: colors.card, 
        borderRadius: 20, border: `1px solid ${colors.border}`, ...sharedStyles.glass
      }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: primary + '15', color: primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ArrowUpRight size={22}/>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700 }}>{t.full_name}</div>
          <div style={{ fontSize: 11, color: colors.textSecondary }}>{new Date(t.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • by {t.employee_name || 'Admin'}</div>
        </div>
        <div style={{ fontWeight: 900, fontSize: 15 }}>{formatCurrency(t.amount)}</div>
      </div>
    ))}
  </div>
);

const labelStyle = { fontSize: 10, fontWeight: 800, color: '#94a3b8', marginBottom: 6, display: 'block', letterSpacing: 1 };
const inputStyle = (colors) => ({
  width: '100%', padding: '14px 16px', borderRadius: 14, border: `1px solid ${colors.border}`,
  background: colors.bg, color: colors.text, fontSize: 16, outline: 'none'
});

const ModeSelection = ({ setMode, colors, onLogout }) => (
  <div style={{ background: colors.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 25 }}>
    <div style={{ width: '100%', maxWidth: 400 }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ width: 80, height: 80, background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 15px 30px rgba(59, 130, 246, 0.4)' }}>
          <Landmark size={40} color="#fff" />
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0 }}>Portal Select</h1>
        <p style={{ color: colors.textSecondary, marginTop: 8 }}>Choose your operational system</p>
      </div>
      
      <div style={{ display: 'grid', gap: 16 }}>
        <button onClick={() => { hapticFeedback('medium'); setMode('ajo'); }} className="press-effect" style={{ 
          ...sharedStyles.btn, height: 140, background: CONFIG.modes.ajo.gradient, color: '#fff', 
          borderRadius: 30, flexDirection: 'column', fontSize: 18, boxShadow: '0 10px 25px rgba(59, 130, 246, 0.2)' 
        }}>
          <Wallet size={32}/> AJO SYSTEM
        </button>
        <button onClick={() => { hapticFeedback('medium'); setMode('loans'); }} className="press-effect" style={{ 
          ...sharedStyles.btn, height: 140, background: CONFIG.modes.loans.gradient, color: '#fff', 
          borderRadius: 30, flexDirection: 'column', fontSize: 18, boxShadow: '0 10px 25px rgba(239, 68, 68, 0.2)' 
        }}>
          <HandCoins size={32}/> LOAN SYSTEM
        </button>
      </div>

      <button onClick={onLogout} style={{ width: '100%', marginTop: 30, background: 'none', border: 'none', color: colors.textSecondary, fontWeight: 700 }}>Log Out</button>
    </div>
  </div>
);

const LoginScreen = ({ onLogin, colors }) => {
  const [type, setType] = useState('agent');
  return (
    <div style={{ background: colors.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 25 }}>
      <div style={{ width: '100%', maxWidth: 400, background: colors.card, padding: 30, borderRadius: 32, border: `1px solid ${colors.border}`, ...sharedStyles.glass }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 5 }}>Welcome Back</h2>
          <p style={{ color: colors.textSecondary, fontSize: 14 }}>{CONFIG.business.name}</p>
        </div>

        <div style={{ display: 'flex', background: colors.bg, padding: 6, borderRadius: 16, marginBottom: 25, border: `1px solid ${colors.border}` }}>
          <button onClick={() => setType('agent')} style={{ flex: 1, padding: 12, border: 'none', borderRadius: 12, fontWeight: 800, background: type === 'agent' ? '#3b82f6' : 'none', color: type === 'agent' ? '#fff' : colors.textSecondary }}>Agent</button>
          <button onClick={() => setType('admin')} style={{ flex: 1, padding: 12, border: 'none', borderRadius: 12, fontWeight: 800, background: type === 'admin' ? '#3b82f6' : 'none', color: type === 'admin' ? '#fff' : colors.textSecondary }}>Admin</button>
        </div>

        <form onSubmit={e => {
          e.preventDefault();
          onLogin({ u: e.target.u.value, p: e.target.p.value, type });
        }}>
          <div className="form-group" style={{ marginBottom: 15 }}>
            <label style={labelStyle}>{type === 'admin' ? 'USERNAME' : 'AGENT ID'}</label>
            <input name="u" style={inputStyle(colors)} required />
          </div>
          <div className="form-group" style={{ marginBottom: 25 }}>
            <label style={labelStyle}>PASSWORD</label>
            <input name="p" type="password" style={inputStyle(colors)} required />
          </div>
          <button type="submit" style={{ ...sharedStyles.btn, width: '100%', height: 56, background: '#3b82f6', color: '#fff', borderRadius: 16, fontSize: 16 }}>Sign In</button>
        </form>
      </div>
    </div>
  );
};

const ScannerView = ({ profile, onRefresh, showToast, colors, primary, mode }) => {
  const [active, setActive] = useState(false);
  const [member, setMember] = useState(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const lookupMember = async (id) => {
    if (!id) return;
    const { data: m } = await supabase.from(CONFIG.modes[mode].membersTable).select('*').or(`registration_no.eq.${id.toUpperCase()},id.eq.${id}`).maybeSingle();
    if (m) {
      hapticFeedback('success');
      setMember(m);
      setAmount(m.expected_amount || '');
      setActive(false);
    } else {
      hapticFeedback('error');
      showToast("Member not found", "error");
    }
  };

  if (member) return (
    <div style={{ background: colors.card, padding: 30, borderRadius: 32, textAlign: 'center', border: `1px solid ${colors.border}`, ...sharedStyles.glass }}>
      <div style={{ opacity: 0.5, fontSize: 12, fontWeight: 800 }}>MEMBER IDENTIFIED</div>
      <h2 style={{ margin: '10px 0', fontSize: 24, fontWeight: 900 }}>{member.full_name}</h2>
      <div style={{ fontSize: 14, color: primary, fontWeight: 800, marginBottom: 20 }}>{member.registration_no}</div>
      
      <div style={{ marginBottom: 30 }}>
        <label style={labelStyle}>COLLECTION AMOUNT</label>
        <input 
          type="number" 
          value={amount} 
          onChange={e => setAmount(e.target.value)} 
          style={{ width: '100%', fontSize: 42, textAlign: 'center', background: 'none', border: 'none', borderBottom: `2px solid ${primary}`, color: colors.text, fontWeight: 900, outline: 'none' }}
          autoFocus 
        />
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button 
          onClick={async () => {
            setLoading(true);
            const { error } = await supabase.from(CONFIG.modes[mode].transTable).insert([{ 
              contributor_id: member.id, 
              full_name: member.full_name, 
              registration_no: member.registration_no, 
              amount: Number(amount), 
              employee_id: profile?.id, 
              employee_name: profile?.full_name 
            }]);
            if (!error) {
              showToast("Collection Saved", "success");
              setMember(null);
              onRefresh();
            }
            setLoading(false);
          }}
          disabled={loading}
          style={{ ...sharedStyles.btn, background: primary, color: '#fff', flex: 2, height: 60, borderRadius: 20 }}
        >
          {loading ? 'Processing...' : 'Confirm Deposit'}
        </button>
        <button onClick={() => setMember(null)} style={{ ...sharedStyles.btn, background: colors.bg, color: colors.text, flex: 1, borderRadius: 20 }}>Cancel</button>
      </div>
    </div>
  );

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ background: colors.card, padding: 40, borderRadius: 32, border: `2px dashed ${colors.border}`, marginBottom: 25 }}>
        <div style={{ width: 80, height: 80, background: primary + '15', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: primary }}>
          <Camera size={40}/>
        </div>
        <h2 style={{ margin: '0 0 10px', fontWeight: 900 }}>Quick Collect</h2>
        <p style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 25 }}>Scan member QR code or enter ID manually to record deposit</p>
        <button onClick={() => setActive(true)} style={{ ...sharedStyles.btn, background: primary, color: '#fff', width: '100%', height: 60, borderRadius: 20 }}>
          <QrCode/> Start Scanning
        </button>
      </div>

      {active && (
        <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 2000 }}>
          <Scanner onScan={(res) => res?.[0] && lookupMember(res[0].rawValue)} />
          <button onClick={() => setActive(false)} style={{ position: 'absolute', top: 30, right: 30, background: '#fff', border: 'none', borderRadius: '50%', width: 50, height: 50 }}><X/></button>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 250, height: 250, border: '2px solid #fff', borderRadius: 20 }}>
             <div style={{ position: 'absolute', top: 0, width: '100%', height: 2, background: '#ef4444', boxShadow: '0 0 15px #ef4444', animation: 'scan-line 2s infinite' }} />
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12 }}>
        <input placeholder="Enter ID Manually..." id="manID" style={inputStyle(colors)} />
        <button onClick={() => lookupMember(document.getElementById('manID').value)} style={{ ...sharedStyles.btn, background: colors.cardSolid, color: colors.text, width: 60, borderRadius: 14, border: `1px solid ${colors.border}` }}>
          <ChevronRight/>
        </button>
      </div>
    </div>
  );
};

const AgentManager = ({ agents, onRefresh, colors, primary }) => {
  const [editingAgent, setEditingAgent] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  return (
    <div>
      <button onClick={() => setIsAdding(true)} style={{ ...sharedStyles.btn, background: primary, color: '#fff', width: '100%', height: 56, borderRadius: 18, marginBottom: 20 }}>
        <UserPlus size={20}/> Register New Agent
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {agents.map(a => (
          <div key={a.id} style={{ 
            background: colors.card, padding: 16, borderRadius: 24, border: `1px solid ${colors.border}`,
            display: 'flex', alignItems: 'center', gap: 15, ...sharedStyles.glass
          }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>
              {a.full_name.charAt(0)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800 }}>{a.full_name}</div>
              <div style={{ fontSize: 12, opacity: 0.5 }}>ID: {a.employee_id_number}</div>
            </div>
            <button onClick={() => setEditingAgent(a)} style={{ background: 'none', border: 'none', color: primary }}><Edit3 size={18}/></button>
          </div>
        ))}
      </div>

      {(isAdding || editingAgent) && (
        <BottomSheet onClose={() => { setIsAdding(false); setEditingAgent(null); }} colors={colors}>
          <form onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            const p = { full_name: fd.get('n'), employee_id_number: fd.get('e').toLowerCase(), password: fd.get('p') };
            const { error } = editingAgent ? await supabase.from('employees').update(p).eq('id', editingAgent.id) : await supabase.from('employees').insert([p]);
            if (!error) { setIsAdding(false); setEditingAgent(null); onRefresh(); }
          }}>
            <h2 style={{ margin: '0 0 20px', fontWeight: 900 }}>Agent Profile</h2>
            <label style={labelStyle}>FULL NAME</label>
            <input name="n" defaultValue={editingAgent?.full_name} style={{ ...inputStyle(colors), marginBottom: 15 }} required />
            <label style={labelStyle}>AGENT LOGIN ID</label>
            <input name="e" defaultValue={editingAgent?.employee_id_number} style={{ ...inputStyle(colors), marginBottom: 15 }} required />
            <label style={labelStyle}>ACCESS PASSWORD</label>
            <input name="p" defaultValue={editingAgent?.password} style={{ ...inputStyle(colors), marginBottom: 25 }} required />
            <button type="submit" style={{ ...sharedStyles.btn, background: primary, color: '#fff', width: '100%', height: 56, borderRadius: 16 }}>Save Agent</button>
          </form>
        </BottomSheet>
      )}
    </div>
  );
};