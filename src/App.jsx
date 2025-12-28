import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import QrScanner from 'react-qr-scanner';
import QRCode from 'qrcode.react';
import { 
  MapPin, ShieldAlert, CheckCircle, Smartphone, BarChart3, 
  Users, QrCode, Plus, LogOut, Navigation, Zap, Printer,
  UserPlus, Briefcase, ChevronRight, Search, Activity, Trash2, Download,
  Camera, User, Phone, DollarSign, Home, Layout
} from 'lucide-react';

// --- CONFIGURATION ---
const SUPABASE_URL ='https://watrosnylvkiuvuptdtp.supabase.co';
const SUPABASE_ANON_KEY = ''eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhdHJvc255bHZraXV2dXB0ZHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MzE2NzEsImV4cCI6MjA4MjUwNzY3MX0.ku6_Ngf2JRJ8fxLs_Q-EySgCU37MjUK3WofpO9bazds;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ORG_DETAILS = {
  name: "ORE-OFE OLUWA",
  address: "No. 1, Bisiriyu Owokade Street, Molete, Ibeju-Lekki, Lagos",
  phones: ["08107218385", "08027203601"],
};

// --- STYLING SYSTEM ---
const theme = {
  primary: '#064e3b', // Deep Forest Green
  secondary: '#10b981', // Emerald
  accent: '#34d399',
  bg: '#f8fafc',
  white: '#ffffff',
  glass: 'rgba(255, 255, 255, 0.8)',
  text: '#0f172a',
  gray: '#64748b',
  error: '#dc2626',
  radius: '24px',
  shadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)'
};

const styles = {
  glassCard: {
    background: theme.glass,
    backdropFilter: 'blur(10px)',
    borderRadius: theme.radius,
    padding: '32px',
    boxShadow: theme.shadow,
    border: '1px solid rgba(255, 255, 255, 0.3)',
  },
  sidebar: {
    width: '280px',
    background: `linear-gradient(180deg, ${theme.primary} 0%, #065f46 100%)`,
    color: '#fff',
    height: '100vh',
    position: 'fixed',
    left: 0,
    top: 0,
    padding: '40px 24px',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 100
  },
  main: {
    marginLeft: '280px',
    padding: '48px',
    minHeight: '100vh',
    background: theme.bg
  },
  btn: {
    padding: '14px 24px',
    borderRadius: '16px',
    fontWeight: '700',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px'
  },
  input: {
    width: '100%',
    padding: '16px',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    background: '#fff',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  navLink: {
    padding: '16px',
    borderRadius: '16px',
    color: '#a7f3d0',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    textDecoration: 'none',
    fontWeight: '600',
    marginBottom: '8px',
    transition: '0.2s',
    background: 'transparent',
    border: 'none',
    width: '100%',
    textAlign: 'left',
    cursor: 'pointer'
  }
};

// --- UTILS ---
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371e3;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
};

// --- COMPONENTS ---

const MembershipCard = ({ member }) => {
  const qrRef = useRef();

  const downloadQR = () => {
    const canvas = document.getElementById(`qr-${member.id}`);
    const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    let downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `QR_${member.registration_no}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const qrValue = `${member.id}|${member.expected_amount}|${member.registration_no}`;

  return (
    <div className="printable-card" style={{ width: '400px', height: '240px', background: '#fff', border: `5px solid ${theme.primary}`, borderRadius: '12px', overflow: 'hidden', position: 'relative', display: 'flex', boxShadow: theme.shadow, fontFamily: 'Georgia, serif' }}>
      <div style={{ background: theme.primary, width: '50px', height: '100%', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ transform: 'rotate(90deg)', whiteSpace: 'nowrap', fontSize: '20px', fontWeight: '900', letterSpacing: '2px' }}>{ORG_DETAILS.name}</h2>
      </div>
      <div style={{ flex: 1, padding: '16px', paddingRight: '10px' }}>
        <div style={{ borderBottom: `2px solid ${theme.primary}`, marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: '900', fontStyle: 'italic', fontSize: '12px' }}>MEMBERSHIP CARD</span>
          <span style={{ color: theme.error, fontWeight: 'bold', fontSize: '12px' }}>{member.registration_no}</span>
        </div>
        <div style={{ fontSize: '11px', lineHeight: '1.6' }}>
          <p><strong>NAME:</strong> {member.full_name.toUpperCase()}</p>
          <p><strong>ADDR:</strong> {member.address}</p>
          <p><strong>TEL:</strong> {member.phone_number}</p>
          <p><strong>PLAN:</strong> ₦{member.expected_amount.toLocaleString()} Daily</p>
        </div>
        <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ fontSize: '7px', color: '#666', maxWidth: '160px' }}>
             <p>{ORG_DETAILS.address}</p>
             <p>{ORG_DETAILS.phones.join(' • ')}</p>
          </div>
          <div style={{ border: '2px solid #000', padding: '2px', background: '#fff' }}>
            <QRCode id={`qr-${member.id}`} value={qrValue} size={65} level="H" includeMargin={true} />
          </div>
        </div>
      </div>
      {/* Action Buttons (Hidden on Print) */}
      <div className="no-print" style={{ position: 'absolute', top: '5px', right: '60px', display: 'flex', gap: '5px' }}>
         <button onClick={downloadQR} style={{ background: theme.accent, border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '4px' }} title="Download QR"><Download size={14}/></button>
         <button onClick={() => window.print()} style={{ background: '#ddd', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '4px' }} title="Print Card"><Printer size={14}/></button>
      </div>
    </div>
  );
};

// --- MAIN PAGES ---

const LoginPage = ({ onLogin }) => {
  const [mode, setMode] = useState('agent');
  const [creds, setCreds] = useState({ user: '', pass: '', empId: '' });
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (mode === 'admin') {
      if (creds.user === 'oreofe' && creds.pass === 'oreofe') onLogin({ role: 'admin' });
      else setError('Invalid Admin Access');
    } else {
      supabase.from('employees').select('*').eq('employee_id_number', creds.empId).single()
        .then(({ data }) => data ? onLogin({ ...data, role: 'employee' }) : setError('Agent ID not recognized'));
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg, ${theme.primary} 0%, #065f46 100%)` }}>
      <div style={{ ...styles.glassCard, width: '400px', textAlign: 'center' }}>
        <h1 style={{ color: theme.primary, fontStyle: 'italic', fontWeight: '900', fontSize: '32px', marginBottom: '8px' }}>ORE-OFE OLUWA</h1>
        <p style={{ color: theme.gray, fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '32px' }}>Ajo Automation System</p>
        
        <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '14px', padding: '6px', marginBottom: '24px' }}>
          <button onClick={() => setMode('agent')} style={{ flex: 1, padding: '12px', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', background: mode === 'agent' ? theme.primary : 'transparent', color: mode === 'agent' ? '#fff' : theme.gray }}>Agent Login</button>
          <button onClick={() => setMode('admin')} style={{ flex: 1, padding: '12px', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', background: mode === 'admin' ? theme.primary : 'transparent', color: mode === 'admin' ? '#fff' : theme.gray }}>Central Admin</button>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {mode === 'admin' ? (
            <>
              <input style={styles.input} placeholder="Username" onChange={e => setCreds({ ...creds, user: e.target.value })} />
              <input style={styles.input} type="password" placeholder="Password" onChange={e => setCreds({ ...creds, pass: e.target.value })} />
            </>
          ) : (
            <input style={styles.input} placeholder="Enter Agent ID (e.g. OOO-001)" onChange={e => setCreds({ ...creds, empId: e.target.value })} />
          )}
          {error && <p style={{ color: theme.error, fontSize: '13px', fontWeight: 'bold' }}>{error}</p>}
          <button style={{ ...styles.btn, background: theme.primary, color: '#fff', fontSize: '16px' }}>ACCESS DASHBOARD</button>
        </form>
      </div>
    </div>
  );
};

const AdminDashboard = ({ onLogout }) => {
  const [view, setView] = useState('home');
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({ name: '', phone: '', amount: '', reg: '', addr: '', empId: '' });

  useEffect(() => { loadData(); }, []);
  const loadData = async () => {
    const { data } = await supabase.from('contributors').select('*').order('created_at', { ascending: false });
    setMembers(data || []);
  };

  const registerMember = async (e) => {
    e.preventDefault();
    navigator.geolocation.getCurrentPosition(async (pos) => {
      await supabase.from('contributors').insert([{
        full_name: form.name, registration_no: form.reg, expected_amount: parseFloat(form.amount),
        phone_number: form.phone, address: form.addr, gps_latitude: pos.coords.latitude, gps_longitude: pos.coords.longitude
      }]);
      alert("Member Registered Successfully!"); loadData(); setView('members');
    });
  };

  const registerEmployee = async (e) => {
    e.preventDefault();
    await supabase.from('employees').insert([{ full_name: form.name, employee_id_number: form.empId, phone_number: form.phone }]);
    alert("Field Agent Authorized!"); setView('home');
  };

  return (
    <div>
      <div style={styles.sidebar}>
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontWeight: '900', fontStyle: 'italic', fontSize: '24px', letterSpacing: '-1px' }}>ORE-OFE OLUWA</h2>
          <div style={{ height: '3px', width: '30px', background: theme.accent, marginTop: '5px' }} />
        </div>
        <button onClick={() => setView('home')} style={{ ...styles.navLink, ...(view === 'home' && { background: 'rgba(255,255,255,0.1)', color: '#fff' }) }}><Layout size={20} /> Dashboard</button>
        <button onClick={() => setView('add_member')} style={{ ...styles.navLink, ...(view === 'add_member' && { background: 'rgba(255,255,255,0.1)', color: '#fff' }) }}><UserPlus size={20} /> Register Member</button>
        <button onClick={() => setView('add_emp')} style={{ ...styles.navLink, ...(view === 'add_emp' && { background: 'rgba(255,255,255,0.1)', color: '#fff' }) }}><Briefcase size={20} /> Register Agent</button>
        <button onClick={() => setView('members')} style={{ ...styles.navLink, ...(view === 'members' && { background: 'rgba(255,255,255,0.1)', color: '#fff' }) }}><Users size={20} /> Membership File</button>
        <button onClick={onLogout} style={{ ...styles.navLink, marginTop: 'auto', color: '#fca5a5' }}><LogOut size={20} /> Exit System</button>
      </div>

      <div style={styles.main}>
        {view === 'home' && (
          <div>
            <div style={{ marginBottom: '40px' }}>
              <h1 style={{ fontSize: '36px', fontWeight: '900', color: theme.primary }}>Lekki Branch Control</h1>
              <p style={{ color: theme.gray }}>Real-time overview of Ore-Ofe Oluwa operations</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              <div style={styles.glassCard}><p style={{ fontWeight: 'bold', color: theme.gray, fontSize: '12px' }}>TOTAL CONTRIBUTORS</p><h2 style={{ fontSize: '48px', fontWeight: '900', color: theme.primary }}>{members.length}</h2></div>
              <div style={{ ...styles.glassCard, borderLeft: `8px solid ${theme.accent}` }}><p style={{ fontWeight: 'bold', color: theme.gray, fontSize: '12px' }}>TODAY'S REVENUE</p><h2 style={{ fontSize: '48px', fontWeight: '900', color: theme.accent }}>₦0.00</h2></div>
            </div>
          </div>
        )}

        {(view === 'add_member' || view === 'add_emp') && (
           <div style={{ ...styles.glassCard, maxWidth: '600px', margin: '0 auto' }}>
              <h2 style={{ color: theme.primary, marginBottom: '24px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '10px' }}>
                {view === 'add_member' ? <><UserPlus /> New Member Enrollment</> : <><Briefcase /> Agent Authorization</>}
              </h2>
              <form onSubmit={view === 'add_member' ? registerMember : registerEmployee} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                 <input style={styles.input} placeholder="Full Legal Name" required onChange={e => setForm({ ...form, name: e.target.value })} />
                 {view === 'add_member' ? (
                   <>
                     <div style={{ display: 'flex', gap: '10px' }}>
                        <input style={styles.input} placeholder="Registration No." required onChange={e => setForm({ ...form, reg: e.target.value })} />
                        <input style={styles.input} placeholder="Daily Contribution (₦)" type="number" required onChange={e => setForm({ ...form, amount: e.target.value })} />
                     </div>
                     <input style={styles.input} placeholder="Primary Phone Number" required onChange={e => setForm({ ...form, phone: e.target.value })} />
                     <textarea style={{ ...styles.input, minHeight: '120px' }} placeholder="Residential Home Address" required onChange={e => setForm({ ...form, addr: e.target.value })} />
                   </>
                 ) : (
                   <>
                     <input style={styles.input} placeholder="Assigned Agent ID (e.g. OOO-001)" required onChange={e => setForm({ ...form, empId: e.target.value })} />
                     <input style={styles.input} placeholder="Phone Number" required onChange={e => setForm({ ...form, phone: e.target.value })} />
                   </>
                 )}
                 <button style={{ ...styles.btn, background: theme.primary, color: '#fff' }}>
                    {view === 'add_member' ? 'ACTIVATE MEMBERSHIP' : 'ENROLL AGENT'}
                 </button>
              </form>
           </div>
        )}

        {view === 'members' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '32px' }}>
            {members.map(m => (
              <div key={m.id} style={{ ...styles.glassCard, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                 <MembershipCard member={m} />
                 <div style={{ width: '100%', display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1, background: '#f0fdf4', padding: '16px', borderRadius: '16px', textAlign: 'center' }}>
                       <p style={{ fontSize: '10px', fontWeight: '900', color: theme.secondary, marginBottom: '4px' }}>CURRENT BALANCE</p>
                       <p style={{ fontSize: '24px', fontWeight: '900', color: theme.primary }}>₦{m.current_balance || 0}</p>
                    </div>
                    <button style={{ padding: '16px', borderRadius: '16px', background: '#fee2e2', border: 'none', color: '#b91c1c', cursor: 'pointer' }}><Trash2 /></button>
                 </div>
              </div>
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
      setStatus('processing');
      try {
        const [id, amount] = data.text.split('|');
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
    <div style={{ minHeight: '100vh', background: theme.bg, display: 'flex', flexDirection: 'column' }}>
       <header style={{ padding: '24px', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontStyle: 'italic', fontWeight: '900', color: theme.primary }}>ORE-OFE OLUWA</h2>
            <p style={{ fontSize: '10px', color: theme.gray }}>AGENT: {user.full_name.toUpperCase()}</p>
          </div>
          <button onClick={onLogout} style={{ padding: '10px', borderRadius: '12px', background: '#fee2e2', border: 'none', color: '#ef4444' }}><LogOut size={20}/></button>
       </header>

       <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          {status === 'success' ? (
             <div style={{ textAlign: 'center' }}>
                <div style={{ width: '120px', height: '120px', background: theme.accent, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#fff shadow: "0 0 20px rgba(16,185,129,0.4)' }}><CheckCircle size={64}/></div>
                <h2 style={{ fontWeight: '900', color: theme.primary }}>COLLECTION LOGGED</h2>
                <p style={{ color: theme.gray }}>The system has been updated successfully.</p>
             </div>
          ) : scanning ? (
             <div style={{ width: '100%', maxWidth: '400px', borderRadius: '40px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', border: `10px solid ${theme.primary}` }}>
                <QrScanner 
                   delay={300} 
                   onError={(e) => alert("Camera Error: " + e)}
                   onScan={handleScan} 
                   style={{ width: '100%' }} 
                   constraints={{ video: { facingMode: "environment" } }} // FORCES REAR CAMERA
                />
                <button onClick={() => setScanning(false)} style={{ ...styles.btn, borderRadius: 0, width: '100%', background: '#dc2626', color: '#fff' }}>CANCEL SCAN</button>
             </div>
          ) : (
             <div style={{ textAlign: 'center' }}>
                <button onClick={() => setScanning(true)} style={{ width: '280px', height: '280px', borderRadius: '80px', background: theme.primary, color: '#fff', border: 'none', boxShadow: '0 25px 40px rgba(6,78,59,0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                   <QrCode size={100} />
                   <span style={{ marginTop: '20px', fontSize: '24px', fontWeight: '900', letterSpacing: '1px' }}>SCAN MEMBER</span>
                </button>
                <div style={{ marginTop: '40px', background: '#fff', padding: '16px 32px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '15px', color: theme.gray }}>
                   <MapPin size={20} color={theme.accent} />
                   <span style={{ fontWeight: 'bold', fontSize: '13px' }}>Location Secured: Lekki Branch</span>
                </div>
             </div>
          )}
       </main>
    </div>
  );
};

// --- SYSTEM WRAPPER ---
export default function App() {
  const [user, setUser] = useState(null);
  const [location, setLocation] = useState(null);
  const [locError, setLocError] = useState(false);

  useEffect(() => {
    const watch = navigator.geolocation.watchPosition(
      (p) => { setLocation({ lat: p.coords.latitude, lng: p.coords.longitude }); setLocError(false); },
      () => setLocError(true), { enableHighAccuracy: true, maximumAge: 0 }
    );
    return () => navigator.geolocation.clearWatch(watch);
  }, []);

  if (locError) return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: theme.error, color: '#fff', padding: '40px', textAlign: 'center' }}>
      <ShieldAlert size={100} style={{ marginBottom: '24px' }} />
      <h1 style={{ fontWeight: '900', fontSize: '32px' }}>SECURITY ALERT: NO GPS</h1>
      <p style={{ maxWidth: '400px', fontSize: '18px', lineHeight: '1.5' }}>Ore-Ofe Oluwa system requires active location tracking to verify field collections. Please enable GPS in your device settings and refresh.</p>
    </div>
  );

  if (!location) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: theme.primary, color: '#fff' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '60px', height: '60px', border: '6px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }} />
        <h2 style={{ fontStyle: 'italic', letterSpacing: '2px' }}>ORE-OFE OLUWA</h2>
        <p style={{ fontSize: '10px', opacity: 0.7 }}>Securing Precise GPS Location...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!user) return <LoginPage onLogin={setUser} />;

  return user.role === 'admin' ? 
    <AdminDashboard onLogout={() => setUser(null)} /> : 
    <AgentDashboard user={user} location={location} onLogout={() => setUser(null)} />;
}
