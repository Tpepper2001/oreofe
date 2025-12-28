import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import QrScanner from 'react-qr-scanner';
import QRCode from 'qrcode.react';
import { 
  MapPin, ShieldAlert, CheckCircle, Smartphone, BarChart3, 
  Users, QrCode, Plus, LogOut, Navigation, Zap, Printer,
  UserPlus, Briefcase, ChevronRight, Search, Activity, Trash2, 
  Download, Layout, CreditCard, Loader2, Phone, Home, DollarSign
} from 'lucide-react';

// ===== 1. CONFIGURATION & DATABASE =====
const SUPABASE_URL = 'https://watrosnylvkiuvuptdtp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhdHJvc255bHZraXV2dXB0ZHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MzE2NzEsImV4cCI6MjA4MjUwNzY3MX0.ku6_Ngf2JRJ8fxLs_Q-EySgCU37MjUK3WofpO9bazds';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ORG_DETAILS = Object.freeze({
  name: "ORE-OFE OLUWA",
  address: "No. 1, Bisiriyu Owokade Street, Molete, Ibeju-Lekki, Lagos",
  phones: ["08107218385", "08027203601"],
  branch: "Lekki Branch Control"
});

// ===== 2. IMMUTABLE THEME SYSTEM =====
const theme = Object.freeze({
  colors: {
    primary: '#064e3b',
    secondary: '#10b981',
    accent: '#34d399',
    danger: '#dc2626',
    success: '#059669',
    bg: '#f8fafc',
    white: '#ffffff',
    text: '#0f172a',
    gray: '#64748b',
    glass: 'rgba(255, 255, 255, 0.9)',
    border: 'rgba(0, 0, 0, 0.08)'
  },
  spacing: { sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
  radius: { sm: '8px', md: '16px', lg: '24px', full: '9999px' },
  shadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)'
});

const commonStyles = {
  centerFlex: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
  glassCard: {
    background: theme.colors.glass,
    backdropFilter: 'blur(12px)',
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xl,
    boxShadow: theme.shadow,
    border: `1px solid ${theme.colors.white}`,
    boxSizing: 'border-box'
  },
  input: {
    width: '100%',
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    border: `1px solid ${theme.colors.border}`,
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box'
  },
  btnBase: {
    padding: '14px 24px',
    borderRadius: theme.radius.md,
    fontWeight: '700',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    transition: 'transform 0.1s ease, opacity 0.2s ease',
  }
};

// ===== 3. UTILITY FUNCTIONS =====
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371e3; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
};

// ===== 4. UI COMPONENTS =====

const Spinner = ({ size = 24, color = theme.colors.primary }) => (
  <Loader2 size={size} color={color} className="animate-spin" />
);

const MembershipCard = ({ member, onDelete, onPrint }) => {
  const qrRef = useRef();
  const CARD_WIDTH = '420px';

  const downloadQR = useCallback(() => {
    const canvas = document.getElementById(`qr-${member.id}`);
    if (!canvas) return;
    const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `OOO_QR_${member?.registration_no}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }, [member]);

  const qrValue = `${member?.id}|${member?.expected_amount}|${member?.registration_no}`;

  return (
    <div style={{ ...commonStyles.glassCard, padding: theme.spacing.md, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: theme.spacing.md }}>
      <div className="printable-card" style={{ 
        width: CARD_WIDTH, height: '260px', background: '#fff', border: `6px solid ${theme.colors.primary}`, 
        borderRadius: '16px', display: 'flex', position: 'relative', overflow: 'hidden', fontFamily: 'Georgia, serif' 
      }}>
        {/* Side Branding */}
        <div style={{ background: theme.colors.primary, width: '55px', height: '100%', color: '#fff', ...commonStyles.centerFlex }}>
          <h2 style={{ transform: 'rotate(90deg)', whiteSpace: 'nowrap', fontSize: '20px', fontWeight: '900', letterSpacing: '2px' }}>{ORG_DETAILS.name}</h2>
        </div>

        <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ borderBottom: `2px solid ${theme.colors.primary}`, display: 'flex', justifyContent: 'space-between', paddingBottom: '5px' }}>
            <span style={{ fontWeight: '900', fontStyle: 'italic', fontSize: '12px' }}>MEMBERSHIP CARD</span>
            <span style={{ color: theme.colors.danger, fontWeight: 'bold' }}>{member?.registration_no}</span>
          </div>

          <div style={{ display: 'flex', flex: 1, paddingTop: '10px' }}>
            <div style={{ flex: 1, fontSize: '11px', lineHeight: '1.6' }}>
              <p style={{ margin: 0 }}><strong>NAME:</strong></p>
              <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '900' }}>{member?.full_name?.toUpperCase()}</p>
              <p style={{ margin: 0 }}><strong>TEL:</strong> {member?.phone_number}</p>
              <p style={{ margin: 0 }}><strong>PLAN:</strong> ₦{member?.expected_amount?.toLocaleString()} / Day</p>
            </div>

            {/* ENLARGED QR CODE */}
            <div style={{ ...commonStyles.centerFlex, flexDirection: 'column', gap: '5px' }}>
              <div style={{ border: '3px solid #000', padding: '4px', background: '#fff' }}>
                <QRCode id={`qr-${member.id}`} value={qrValue} size={128} level="H" />
              </div>
              <span style={{ fontSize: '8px', fontWeight: 'bold', color: theme.colors.primary }}>SCAN FOR COLLECTION</span>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #eee', paddingTop: '5px', fontSize: '7px', display: 'flex', justifyContent: 'space-between' }}>
            <span>{ORG_DETAILS.address}</span>
            <span style={{ fontWeight: 'bold' }}>{ORG_DETAILS.phones[0]}</span>
          </div>
        </div>
      </div>

      {/* UX: Action Buttons */}
      <div className="no-print" style={{ display: 'flex', gap: '10px', width: '100%' }}>
        <button onClick={downloadQR} style={{ ...commonStyles.btnBase, flex: 1, background: theme.colors.secondary, color: '#fff' }}><Download size={16}/> Save QR</button>
        <button onClick={() => window.print()} style={{ ...commonStyles.btnBase, flex: 1, background: theme.colors.bg, color: theme.colors.text }}><Printer size={16}/> Print</button>
        <button onClick={() => onDelete(member.id)} style={{ ...commonStyles.btnBase, background: '#fee2e2', color: theme.colors.danger }}><Trash2 size={16}/></button>
      </div>
    </div>
  );
};

// ===== 5. MAIN PAGES =====

const LoginPage = ({ onLogin }) => {
  const [mode, setMode] = useState('agent');
  const [creds, setCreds] = useState({ user: '', pass: '', empId: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'admin') {
        if (creds.user === 'oreofe' && creds.pass === 'oreofe') {
          onLogin({ role: 'admin', full_name: 'Central Admin' });
        } else {
          setError('Incorrect admin credentials');
        }
      } else {
        const { data } = await supabase.from('employees').select('*').eq('employee_id_number', creds.empId).single();
        if (data) onLogin({ ...data, role: 'employee' });
        else setError('Agent ID not found or unauthorized');
      }
    } catch (err) {
      setError('System connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: '100vh', ...commonStyles.centerFlex, background: theme.colors.primary }}>
      <div style={{ ...commonStyles.glassCard, width: '400px', textAlign: 'center' }}>
        <h1 style={{ color: theme.colors.primary, fontStyle: 'italic', fontWeight: '900', fontSize: '32px', marginBottom: '8px' }}>ORE-OFE OLUWA</h1>
        <p style={{ color: theme.colors.gray, fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '32px' }}>Ajo Automation</p>
        
        <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: theme.radius.md, padding: '4px', marginBottom: '24px' }}>
          {['agent', 'admin'].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{ 
              flex: 1, padding: '12px', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer',
              background: mode === m ? theme.colors.primary : 'transparent', color: mode === m ? '#fff' : theme.colors.gray 
            }}>{m.toUpperCase()}</button>
          ))}
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {mode === 'admin' ? (
            <>
              <input style={commonStyles.input} placeholder="Username" onChange={e => setCreds({ ...creds, user: e.target.value })} />
              <input style={commonStyles.input} type="password" placeholder="Password" onChange={e => setCreds({ ...creds, pass: e.target.value })} />
            </>
          ) : (
            <input style={commonStyles.input} placeholder="Enter Agent ID (e.g. OOO-001)" onChange={e => setCreds({ ...creds, empId: e.target.value })} />
          )}
          {error && <p style={{ color: theme.colors.danger, fontSize: '13px', fontWeight: 'bold' }}>{error}</p>}
          <button disabled={loading} style={{ ...commonStyles.btnBase, background: theme.colors.primary, color: '#fff' }}>
            {loading ? <Spinner size={20} color="#fff" /> : 'ACCESS SYSTEM'}
          </button>
        </form>
      </div>
    </div>
  );
};

const AdminDashboard = ({ onLogout }) => {
  const [view, setView] = useState('home');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', amount: '', reg: '', addr: '', empId: '' });

  const loadData = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('contributors').select('*').order('created_at', { ascending: false });
    setMembers(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this member card?")) return;
    await supabase.from('contributors').delete().eq('id', id);
    loadData();
  };

  const registerMember = async (e) => {
    e.preventDefault();
    setLoading(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      await supabase.from('contributors').insert([{
        full_name: form.name, registration_no: form.reg, expected_amount: parseFloat(form.amount),
        phone_number: form.phone, address: form.addr, gps_latitude: pos.coords.latitude, gps_longitude: pos.coords.longitude
      }]);
      setLoading(false);
      setView('members');
      loadData();
    });
  };

  const registerEmployee = async (e) => {
    e.preventDefault();
    setLoading(true);
    await supabase.from('employees').insert([{ full_name: form.name, employee_id_number: form.empId, phone_number: form.phone }]);
    setLoading(false);
    setView('home');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <style>{`@media print { .no-print { display: none !important; } .printable-card { margin: 0 auto; box-shadow: none !important; border-width: 4px !important; } }`}</style>
      
      {/* Sidebar */}
      <div style={{ width: '280px', background: theme.colors.primary, color: '#fff', padding: '40px 20px', position: 'fixed', height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontStyle: 'italic', fontWeight: '900', fontSize: '24px', marginBottom: '40px' }}>ORE-OFE OLUWA</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { id: 'home', icon: Layout, label: 'Dashboard' },
            { id: 'add_member', icon: UserPlus, label: 'Add Member' },
            { id: 'add_emp', icon: Briefcase, label: 'Add Agent' },
            { id: 'members', icon: CreditCard, label: 'Registry' }
          ].map(item => (
            <button key={item.id} onClick={() => setView(item.id)} style={{ 
              display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '12px', border: 'none', cursor: 'pointer',
              background: view === item.id ? 'rgba(255,255,255,0.15)' : 'transparent', color: view === item.id ? '#fff' : '#a7f3d0', fontWeight: '600'
            }}><item.icon size={20}/> {item.label}</button>
          ))}
        </div>
        <button onClick={onLogout} style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: 'transparent', border: 'none', color: '#fca5a5', cursor: 'pointer', fontWeight: 'bold' }}>
          <LogOut size={20}/> Logout System
        </button>
      </div>

      {/* Main Content */}
      <div style={{ marginLeft: '280px', padding: theme.spacing.xxl, background: theme.colors.bg, flex: 1 }}>
        {loading && <div style={{ position: 'fixed', top: 20, right: 20 }}><Spinner /></div>}
        
        {view === 'home' && (
          <div>
            <h1 style={{ fontSize: '36px', fontWeight: '900', color: theme.colors.primary, marginBottom: '40px' }}>System Overview</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              <div style={commonStyles.glassCard}>
                <p style={{ fontWeight: 'bold', color: theme.colors.gray, fontSize: '12px' }}>TOTAL CONTRIBUTORS</p>
                <h2 style={{ fontSize: '48px', fontWeight: '900' }}>{members.length}</h2>
              </div>
              <div style={{ ...commonStyles.glassCard, borderLeft: `10px solid ${theme.colors.secondary}` }}>
                <p style={{ fontWeight: 'bold', color: theme.colors.gray, fontSize: '12px' }}>DAILY COLLECTIONS</p>
                <h2 style={{ fontSize: '48px', fontWeight: '900' }}>₦0.00</h2>
              </div>
            </div>
          </div>
        )}

        {view === 'add_member' && (
          <div style={{ ...commonStyles.glassCard, maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ color: theme.colors.primary, marginBottom: '24px', fontWeight: '900' }}>Enroll New Member</h2>
            <form onSubmit={registerMember} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <input required style={commonStyles.input} placeholder="Full Legal Name" onChange={e => setForm({...form, name: e.target.value})} />
              <div style={{ display: 'flex', gap: '10px' }}>
                <input required style={commonStyles.input} placeholder="Reg No (e.g. OOO-101)" onChange={e => setForm({...form, reg: e.target.value})} />
                <input required style={commonStyles.input} type="number" placeholder="Daily Amount (₦)" onChange={e => setForm({...form, amount: e.target.value})} />
              </div>
              <input required style={commonStyles.input} placeholder="Phone Number" onChange={e => setForm({...form, phone: e.target.value})} />
              <textarea required style={{ ...commonStyles.input, minHeight: '100px' }} placeholder="Home Address" onChange={e => setForm({...form, addr: e.target.value})} />
              <button disabled={loading} style={{ ...commonStyles.btnBase, background: theme.colors.primary, color: '#fff' }}>
                {loading ? <Spinner color="#fff"/> : 'GENERATE OFFICIAL CARD'}
              </button>
            </form>
          </div>
        )}

        {view === 'add_emp' && (
          <div style={{ ...commonStyles.glassCard, maxWidth: '500px', margin: '0 auto' }}>
            <h2 style={{ color: theme.colors.primary, marginBottom: '24px', fontWeight: '900' }}>Authorize Field Agent</h2>
            <form onSubmit={registerEmployee} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <input required style={commonStyles.input} placeholder="Agent Full Name" onChange={e => setForm({...form, name: e.target.value})} />
              <input required style={commonStyles.input} placeholder="Assigned Agent ID (e.g. AGENT-01)" onChange={e => setForm({...form, empId: e.target.value})} />
              <input required style={commonStyles.input} placeholder="Agent Phone" onChange={e => setForm({...form, phone: e.target.value})} />
              <button disabled={loading} style={{ ...commonStyles.btnBase, background: theme.colors.primary, color: '#fff' }}>
                {loading ? <Spinner color="#fff"/> : 'AUTHORIZE AGENT'}
              </button>
            </form>
          </div>
        )}

        {view === 'members' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(440px, 1fr))', gap: '32px' }}>
            {members.length === 0 && <p style={{ color: theme.colors.gray }}>No members found. Use "Add Member" to begin.</p>}
            {members.map(m => (
              <MembershipCard key={m.id} member={m} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const AgentDashboard = ({ user, location, onLogout }) => {
  const [scanning, setScanning] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, processing, success, error

  const handleScan = async (data) => {
    if (data && status === 'idle') {
      const parts = data?.text?.split('|');
      if (parts?.length < 2) return; // Guard malformed data

      setStatus('processing');
      try {
        const [id, amount] = parts;
        await supabase.from('transactions').insert([{
          contributor_id: id, employee_id: user.id, amount: parseFloat(amount),
          gps_latitude: location.lat, gps_longitude: location.lng, geofence_verified: true
        }]);
        setStatus('success');
        setTimeout(() => { setStatus('idle'); setScanning(false); }, 3000);
      } catch (err) {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 3000);
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: theme.colors.bg, display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '24px', background: '#fff', borderBottom: `1px solid ${theme.colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontStyle: 'italic', fontWeight: '900', color: theme.colors.primary }}>ORE-OFE OLUWA</h2>
          <p style={{ fontSize: '10px', color: theme.colors.gray, fontWeight: 'bold' }}>AGENT: {user?.full_name?.toUpperCase()}</p>
        </div>
        <button onClick={onLogout} style={{ padding: '10px', borderRadius: '12px', background: '#fee2e2', border: 'none', color: theme.colors.danger, cursor: 'pointer' }}><LogOut size={20}/></button>
      </header>

      <main style={{ flex: 1, ...commonStyles.centerFlex, padding: '24px' }}>
        {status === 'success' ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '120px', height: '120px', background: theme.colors.secondary, borderRadius: '50%', ...commonStyles.centerFlex, margin: '0 auto 24px', color: '#fff' }}><CheckCircle size={64}/></div>
            <h2 style={{ fontWeight: '900', color: theme.colors.primary }}>COLLECTION RECORDED</h2>
          </div>
        ) : scanning ? (
          <div style={{ width: '100%', maxWidth: '400px', borderRadius: '32px', overflow: 'hidden', border: `10px solid ${theme.colors.primary}`, boxShadow: theme.shadow }}>
            <QrScanner 
              delay={300} 
              onScan={handleScan} 
              style={{ width: '100%' }} 
              constraints={{ video: { facingMode: "environment" } }} 
            />
            <button onClick={() => setScanning(false)} style={{ ...commonStyles.btnBase, width: '100%', borderRadius: 0, background: theme.colors.danger, color: '#fff' }}>CANCEL SCAN</button>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <button onClick={() => setScanning(true)} style={{ 
              width: '280px', height: '280px', borderRadius: '80px', background: theme.colors.primary, color: '#fff', border: 'none', 
              boxShadow: '0 25px 40px rgba(6,78,59,0.3)', ...commonStyles.centerFlex, flexDirection: 'column', cursor: 'pointer' 
            }}>
              <QrCode size={100} />
              <span style={{ marginTop: '20px', fontSize: '24px', fontWeight: '900' }}>COLLECT PAYMENT</span>
            </button>
            <p style={{ marginTop: '32px', color: theme.colors.gray, fontWeight: 'bold' }}>Scan member card to log daily ajo</p>
          </div>
        )}
      </main>
    </div>
  );
};

// ===== 6. CORE LOGIC WRAPPER =====

export default function App() {
  const [user, setUser] = useState(null);
  const [location, setLocation] = useState(null);
  const [locError, setLocError] = useState(false);

  useEffect(() => {
    const watch = navigator.geolocation.watchPosition(
      (p) => { setLocation({ lat: p.coords.latitude, lng: p.coords.longitude }); setLocError(false); },
      () => setLocError(true), 
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
    return () => navigator.geolocation.clearWatch(watch);
  }, []);

  if (locError) return (
    <div style={{ height: '100vh', ...commonStyles.centerFlex, background: theme.colors.danger, color: '#fff', textAlign: 'center', padding: '40px' }}>
      <ShieldAlert size={100} style={{ marginBottom: '24px' }} />
      <h1 style={{ fontWeight: '900', fontSize: '32px' }}>GPS REQUIRED</h1>
      <p style={{ maxWidth: '400px', fontSize: '18px' }}>Ore-Ofe Oluwa requires active location services to prevent fraud. Please enable GPS and refresh.</p>
      <button onClick={() => window.location.reload()} style={{ ...commonStyles.btnBase, background: '#fff', color: theme.colors.danger, marginTop: '24px' }}>Refresh App</button>
    </div>
  );

  if (!location) return (
    <div style={{ height: '100vh', ...commonStyles.centerFlex, background: theme.colors.primary, color: '#fff' }}>
      <Spinner size={48} color="#fff" />
      <p style={{ marginLeft: '16px', fontWeight: 'bold' }}>Securing System Location...</p>
    </div>
  );

  if (!user) return <LoginPage onLogin={setUser} />;

  return user.role === 'admin' ? 
    <AdminDashboard onLogout={() => setUser(null)} /> : 
    <AgentDashboard user={user} location={location} onLogout={() => setUser(null)} />;
}
