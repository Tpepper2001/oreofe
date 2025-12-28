import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import QrScanner from 'react-qr-scanner';
import QRCode from 'qrcode.react';
import { 
  MapPin, ShieldAlert, CheckCircle, Smartphone, BarChart3, 
  Users, QrCode, Plus, LogOut, Navigation, Zap, Printer,
  UserPlus, Briefcase, ChevronRight, Search, Activity, Trash2, 
  Download, Layout, CreditCard, Loader2, Phone, Home, DollarSign, Camera
} from 'lucide-react';

// ===== 1. DATABASE & CONSTANTS =====
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
    primary: '#064e3b',   // Deep Forest Green
    secondary: '#10b981', // Emerald
    accent: '#34d399',    // Mint
    danger: '#dc2626',
    success: '#059669',
    bg: '#f8fafc',
    white: '#ffffff',
    text: '#0f172a',
    gray: '#64748b',
    border: 'rgba(0, 0, 0, 0.08)'
  },
  radius: { md: '16px', lg: '24px', full: '9999px' },
  shadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)'
});

const s = {
  glass: {
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(12px)',
    borderRadius: theme.radius.lg,
    padding: '32px',
    boxShadow: theme.shadow,
    border: '1px solid rgba(255, 255, 255, 0.4)',
    boxSizing: 'border-box'
  },
  input: {
    width: '100%',
    padding: '16px',
    borderRadius: '12px',
    border: `1px solid ${theme.colors.border}`,
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
    marginBottom: '16px'
  },
  btnPrimary: {
    width: '100%',
    padding: '16px',
    backgroundColor: theme.colors.primary,
    color: theme.colors.white,
    borderRadius: '12px',
    fontWeight: 'bold',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px'
  }
};

// ===== 3. UTILITIES =====
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

// ===== 4. COMPONENTS =====

const MembershipCard = ({ member, onDelete }) => {
  const downloadQR = () => {
    const canvas = document.getElementById(`qr-${member.id}`);
    if (!canvas) return;
    const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `OOO_QR_${member.registration_no}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const qrValue = `${member.id}|${member.expected_amount}|${member.registration_no}`;

  return (
    <div style={{ ...s.glass, padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', width: '450px' }}>
      <div id={`card-${member.id}`} className="printable-card" style={{ 
        width: '420px', height: '260px', background: '#fff', border: `6px solid ${theme.colors.primary}`, 
        borderRadius: '16px', display: 'flex', position: 'relative', overflow: 'hidden', fontFamily: 'serif' 
      }}>
        <div style={{ background: theme.colors.primary, width: '50px', height: '100%', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <h2 style={{ transform: 'rotate(90deg)', whiteSpace: 'nowrap', fontSize: '20px', fontWeight: '900', letterSpacing: '2px' }}>{ORG_DETAILS.name}</h2>
        </div>
        <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ borderBottom: `2px solid ${theme.colors.primary}`, display: 'flex', justifyContent: 'space-between', paddingBottom: '5px' }}>
            <span style={{ fontWeight: '900', fontStyle: 'italic', fontSize: '12px' }}>MEMBERSHIP CARD</span>
            <span style={{ color: theme.colors.danger, fontWeight: 'bold' }}>{member.registration_no}</span>
          </div>
          <div style={{ display: 'flex', flex: 1, paddingTop: '10px' }}>
            <div style={{ flex: 1, fontSize: '11px', lineHeight: '1.6' }}>
              <p style={{ margin: 0 }}><strong>NAME:</strong></p>
              <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '900' }}>{member.full_name.toUpperCase()}</p>
              <p style={{ margin: 0 }}><strong>TEL:</strong> {member.phone_number}</p>
              <p style={{ margin: 0 }}><strong>PLAN:</strong> ₦{member.expected_amount?.toLocaleString()} / Day</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
              <div style={{ border: '3px solid #000', padding: '4px', background: '#fff' }}>
                <QRCode id={`qr-${member.id}`} value={qrValue} size={128} level="H" />
              </div>
              <span style={{ fontSize: '7px', fontWeight: 'bold', color: theme.colors.primary }}>SCAN FOR COLLECTION</span>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #eee', paddingTop: '5px', fontSize: '7px', display: 'flex', justifyContent: 'space-between' }}>
            <span>{ORG_DETAILS.address}</span>
            <span style={{ fontWeight: 'bold' }}>{ORG_DETAILS.phones[0]}</span>
          </div>
        </div>
      </div>
      <div className="no-print" style={{ display: 'flex', gap: '10px' }}>
        <button onClick={downloadQR} style={{ ...s.btnPrimary, flex: 1, background: theme.colors.secondary }}><Download size={16}/> Save QR</button>
        <button onClick={() => window.print()} style={{ ...s.btnPrimary, flex: 1, background: '#e2e8f0', color: theme.colors.text }}><Printer size={16}/> Print Card</button>
        <button onClick={() => onDelete(member.id)} style={{ padding: '12px', background: '#fee2e2', color: theme.colors.danger, border: 'none', borderRadius: '12px', cursor: 'pointer' }}><Trash2 size={18}/></button>
      </div>
    </div>
  );
};

// ===== 5. PAGES =====

const LoginPage = ({ onLogin }) => {
  const [mode, setMode] = useState('agent');
  const [creds, setCreds] = useState({ user: '', pass: '', empId: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (mode === 'admin') {
      if (creds.user === 'oreofe' && creds.pass === 'oreofe') onLogin({ role: 'admin' });
      else setError('Invalid Credentials');
      setLoading(false);
    } else {
      const { data } = await supabase.from('employees').select('*').eq('employee_id_number', creds.empId).single();
      if (data) onLogin({ ...data, role: 'employee' });
      else setError('Agent ID Error');
      setLoading(false);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: theme.colors.primary }}>
      <div style={{ ...s.glass, width: '400px', textAlign: 'center' }}>
        <h1 style={{ color: theme.colors.primary, fontStyle: 'italic', fontWeight: '900', fontSize: '32px', marginBottom: '32px' }}>ORE-OFE OLUWA</h1>
        <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '12px', padding: '5px', marginBottom: '24px' }}>
          <button onClick={() => setMode('agent')} style={{ flex: 1, padding: '12px', border: 'none', borderRadius: '10px', fontWeight: 'bold', background: mode === 'agent' ? theme.colors.primary : 'transparent', color: mode === 'agent' ? '#fff' : theme.colors.gray }}>Agent</button>
          <button onClick={() => setMode('admin')} style={{ flex: 1, padding: '12px', border: 'none', borderRadius: '10px', fontWeight: 'bold', background: mode === 'admin' ? theme.colors.primary : 'transparent', color: mode === 'admin' ? '#fff' : theme.colors.gray }}>Admin</button>
        </div>
        <form onSubmit={handleLogin}>
          {mode === 'admin' ? (
            <>
              <input style={s.input} placeholder="Username" onChange={e => setCreds({ ...creds, user: e.target.value })} />
              <input style={s.input} type="password" placeholder="Password" onChange={e => setCreds({ ...creds, pass: e.target.value })} />
            </>
          ) : (
            <input style={s.input} placeholder="Agent ID (e.g. OOO-001)" onChange={e => setCreds({ ...creds, empId: e.target.value })} />
          )}
          {error && <p style={{ color: theme.colors.danger, fontSize: '13px', fontWeight: 'bold', marginBottom: '10px' }}>{error}</p>}
          <button type="submit" style={s.btnPrimary}>{loading ? "Processing..." : "Secure Login"}</button>
        </form>
      </div>
    </div>
  );
};

const AdminDashboard = ({ onLogout }) => {
  const [view, setView] = useState('home');
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({ name: '', phone: '', amount: '', reg: '', addr: '', empId: '' });

  const loadData = useCallback(async () => {
    const { data } = await supabase.from('contributors').select('*').order('created_at', { ascending: false });
    setMembers(data || []);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const addMember = async (e) => {
    e.preventDefault();
    navigator.geolocation.getCurrentPosition(async (pos) => {
      await supabase.from('contributors').insert([{
        full_name: form.name, registration_no: form.reg, expected_amount: parseFloat(form.amount),
        phone_number: form.phone, address: form.addr, gps_latitude: pos.coords.latitude, gps_longitude: pos.coords.longitude
      }]);
      alert("Success!"); loadData(); setView('members');
    });
  };

  const addEmployee = async (e) => {
    e.preventDefault();
    await supabase.from('employees').insert([{ full_name: form.name, employee_id_number: form.empId, phone_number: form.phone }]);
    alert("Agent Added!"); setView('home');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <style>{`@media print { .no-print { display: none !important; } .printable-card { margin: 0 auto; box-shadow: none !important; } }`}</style>
      <div style={{ width: '280px', background: theme.colors.primary, color: '#fff', padding: '40px 20px', position: 'fixed', height: '100vh' }}>
        <h2 style={{ fontStyle: 'italic', fontWeight: '900', marginBottom: '40px' }}>ORE-OFE OLUWA</h2>
        <button onClick={() => setView('home')} style={{ width: '100%', padding: '15px', background: view === 'home' ? 'rgba(255,255,255,0.1)' : 'transparent', color: '#fff', border: 'none', borderRadius: '12px', textAlign: 'left', marginBottom: '10px', cursor: 'pointer', fontWeight: 'bold' }}>Dashboard</button>
        <button onClick={() => setView('add_member')} style={{ width: '100%', padding: '15px', background: view === 'add_member' ? 'rgba(255,255,255,0.1)' : 'transparent', color: '#fff', border: 'none', borderRadius: '12px', textAlign: 'left', marginBottom: '10px', cursor: 'pointer', fontWeight: 'bold' }}>Register Member</button>
        <button onClick={() => setView('add_emp')} style={{ width: '100%', padding: '15px', background: view === 'add_emp' ? 'rgba(255,255,255,0.1)' : 'transparent', color: '#fff', border: 'none', borderRadius: '12px', textAlign: 'left', marginBottom: '10px', cursor: 'pointer', fontWeight: 'bold' }}>Register Agent</button>
        <button onClick={() => setView('members')} style={{ width: '100%', padding: '15px', background: view === 'members' ? 'rgba(255,255,255,0.1)' : 'transparent', color: '#fff', border: 'none', borderRadius: '12px', textAlign: 'left', marginBottom: '10px', cursor: 'pointer', fontWeight: 'bold' }}>Member Cards</button>
        <button onClick={onLogout} style={{ marginTop: 'auto', background: 'transparent', border: 'none', color: '#fca5a5', cursor: 'pointer', fontWeight: 'bold' }}>Logout</button>
      </div>
      <div style={{ marginLeft: '280px', padding: '40px', flex: 1, background: theme.colors.bg }}>
        {view === 'home' && (
          <div>
            <h1 style={{ color: theme.colors.primary, fontWeight: '900', marginBottom: '30px' }}>System Command</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <div style={s.glass}><p style={{ fontWeight: 'bold', color: theme.colors.gray }}>MEMBERS</p><h2>{members.length}</h2></div>
              <div style={{ ...s.glass, borderLeft: `8px solid ${theme.colors.secondary}` }}><p style={{ fontWeight: 'bold', color: theme.colors.gray }}>REVENUE</p><h2>₦0.00</h2></div>
            </div>
          </div>
        )}
        {(view === 'add_member' || view === 'add_emp') && (
          <div style={{ ...s.glass, maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ color: theme.colors.primary, marginBottom: '20px' }}>{view === 'add_member' ? 'Enroll Member' : 'Enroll Agent'}</h2>
            <form onSubmit={view === 'add_member' ? addMember : addEmployee}>
              <input style={s.input} placeholder="Full Name" required onChange={e => setForm({ ...form, name: e.target.value })} />
              {view === 'add_member' ? (
                <>
                  <input style={s.input} placeholder="Reg No (OOO-101)" required onChange={e => setForm({ ...form, reg: e.target.value })} />
                  <input style={s.input} placeholder="Daily Amount (₦)" type="number" required onChange={e => setForm({ ...form, amount: e.target.value })} />
                  <input style={s.input} placeholder="Phone Number" required onChange={e => setForm({ ...form, phone: e.target.value })} />
                  <textarea style={{ ...s.input, minHeight: '100px' }} placeholder="Home Address" required onChange={e => setForm({ ...form, addr: e.target.value })} />
                </>
              ) : (
                <input style={s.input} placeholder="Agent ID" required onChange={e => setForm({ ...form, empId: e.target.value })} />
              )}
              <button type="submit" style={s.btnPrimary}>Save Record</button>
            </form>
          </div>
        )}
        {view === 'members' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))', gap: '20px' }}>
            {members.map(m => (
              <MembershipCard key={m.id} member={m} onDelete={async (id) => { if(confirm("Delete?")) { await supabase.from('contributors').delete().eq('id', id); loadData(); } }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const AgentDashboard = ({ user, location, onLogout }) => {
  const [scanning, setScanning] = useState(false);
  const [status, setStatus] = useState('idle');

  const handleScan = async (data) => {
    if (data && status === 'idle') {
      setStatus('processing');
      try {
        const [id, amount] = data.text.split('|');
        await supabase.from('transactions').insert([{ contributor_id: id, employee_id: user.id, amount: parseFloat(amount), gps_latitude: location.lat, gps_longitude: location.lng, geofence_verified: true }]);
        setStatus('success');
        setTimeout(() => { setStatus('idle'); setScanning(false); }, 3000);
      } catch (err) { setStatus('error'); setTimeout(() => setStatus('idle'), 3000); }
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: theme.colors.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <button onClick={onLogout} style={{ position: 'fixed', top: 20, right: 20, padding: '10px', background: '#fee2e2', border: 'none', borderRadius: '12px', color: theme.colors.danger }}>Logout</button>
      {status === 'success' ? (
        <div style={{ textAlign: 'center' }}><CheckCircle size={100} color={theme.colors.secondary} /><h2>Success!</h2></div>
      ) : scanning ? (
        <div style={{ width: '100%', maxWidth: '400px', border: `10px solid ${theme.colors.primary}`, borderRadius: '40px', overflow: 'hidden' }}>
          <QrScanner delay={300} onScan={handleScan} style={{ width: '100%' }} constraints={{ video: { facingMode: "environment" } }} />
          <button onClick={() => setScanning(false)} style={{ ...s.btnPrimary, background: theme.colors.danger, borderRadius: 0 }}>Cancel</button>
        </div>
      ) : (
        <button onClick={() => setScanning(true)} style={{ width: '250px', height: '250px', borderRadius: '60px', background: theme.colors.primary, color: '#fff', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <QrCode size={80} />
          <span style={{ marginTop: '10px', fontWeight: 'bold' }}>Scan Member</span>
        </button>
      )}
    </div>
  );
};

// ===== 6. CORE LOGIC WRAPPER =====

export default function App() {
  const [user, setUser] = useState(null);
  const [location, setLocation] = useState(null);
  const [locError, setLocError] = useState(null);

  const initLocation = useCallback(() => {
    if (!navigator.geolocation) { setLocError("GPS not supported"); return; }
    navigator.geolocation.getCurrentPosition(
      (p) => setLocation({ lat: p.coords.latitude, lng: p.coords.longitude }),
      (e) => {
        // Fallback for standard accuracy if high accuracy fails
        navigator.geolocation.getCurrentPosition(
          (p) => setLocation({ lat: p.coords.latitude, lng: p.coords.longitude }),
          (e2) => setLocError(e2.message),
          { enableHighAccuracy: false }
        );
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }, []);

  useEffect(() => { initLocation(); }, [initLocation]);

  if (locError) return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: theme.colors.danger, color: '#fff', textAlign: 'center', padding: '20px' }}>
      <ShieldAlert size={80} />
      <h2>GPS ERROR</h2>
      <p>{locError}</p>
      <button onClick={() => window.location.reload()} style={{ padding: '15px 30px', borderRadius: '12px', border: 'none', background: '#fff', color: theme.colors.danger, fontWeight: 'bold', marginTop: '20px' }}>RETRY CONNECTION</button>
      <p style={{ marginTop: '20px', fontSize: '12px' }}>Note: System requires HTTPS and Location permissions.</p>
    </div>
  );

  if (!location) return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: theme.colors.primary, color: '#fff' }}>
      <Loader2 size={50} className="animate-spin" />
      <h2 style={{ marginTop: '20px' }}>Securing Precise GPS...</h2>
    </div>
  );

  if (!user) return <LoginPage onLogin={setUser} />;

  return user.role === 'admin' ? 
    <AdminDashboard onLogout={() => setUser(null)} /> : 
    <AgentDashboard user={user} location={location} onLogout={() => setUser(null)} />;
}
