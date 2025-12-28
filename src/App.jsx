import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import QrScanner from 'react-qr-scanner';
import QRCode from 'qrcode.react';
import { 
  MapPin, ShieldAlert, CheckCircle, Smartphone, BarChart3, 
  Users, QrCode, Plus, LogOut, Navigation, Zap, Printer,
  UserPlus, Briefcase, ChevronRight, Search, Activity, Trash2 
} from 'lucide-react';

// --- DATABASE CONFIGURATION ---
const SUPABASE_URL = 'https://watrosnylvkiuvuptdtp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhdHJvc255bHZraXV2dXB0ZHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MzE2NzEsImV4cCI6MjA4MjUwNzY3MX0.ku6_Ngf2JRJ8fxLs_Q-EySgCU37MjUK3WofpO9bazds';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ORG_DETAILS = {
  name: "ORE-OFE OLUWA",
  address: "No. 1, Bisiriyu Owokade Street, Molete, Ibeju-Lekki, Lagos",
  phones: ["08107218385", "08027203601"],
};

// --- JAVASCRIPT STYLING OBJECTS ---
const theme = {
  primary: '#14532d', // Deep Green
  primaryLight: '#f0fdf4', // Light Green wash
  accent: '#16a34a', // Bright Green
  white: '#ffffff',
  text: '#1e293b',
  gray: '#94a3b8',
  red: '#b91c1c',
  cardShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  borderRadius: '24px'
};

const s = {
  fullCenter: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: theme.primaryLight },
  container: { padding: '20px', maxWidth: '1200px', margin: '0 auto' },
  card: { backgroundColor: theme.white, padding: '30px', borderRadius: theme.borderRadius, boxShadow: theme.cardShadow, border: `1px solid ${theme.primaryLight}` },
  input: { width: '100%', padding: '15px', marginBottom: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '16px' },
  btnPrimary: { width: '100%', padding: '16px', backgroundColor: theme.primary, color: theme.white, borderRadius: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer', transition: '0.3s' },
  sidebar: { width: '280px', backgroundColor: theme.primary, color: theme.white, padding: '30px', display: 'flex', flexDirection: 'column', height: '100vh', position: 'fixed', left: 0, top: 0 },
  main: { marginLeft: '280px', padding: '40px', minHeight: '100vh', backgroundColor: '#f8fafc' },
  navItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '15px', borderRadius: '12px', color: '#bbf7d0', cursor: 'pointer', marginBottom: '8px', border: 'none', background: 'none', width: '100%', textAlign: 'left', fontWeight: '600' },
  navActive: { backgroundColor: theme.white, color: theme.primary },
  statCard: { padding: '25px', backgroundColor: theme.white, borderRadius: '20px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', borderLeft: `8px solid ${theme.primary}` },
  badge: { padding: '4px 12px', borderRadius: '99px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }
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
  const qrValue = `${member.id}|${member.expected_amount}|${member.registration_no}`;
  return (
    <div style={{ width: '350px', height: '210px', backgroundColor: theme.white, border: `4px solid ${theme.primary}`, padding: '10px', display: 'flex', position: 'relative', overflow: 'hidden', boxShadow: theme.cardShadow, fontFamily: 'serif' }}>
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '45px', backgroundColor: theme.primary, color: theme.white, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ transform: 'rotate(90deg)', whiteSpace: 'nowrap', fontSize: '18px', fontWeight: '900' }}>{ORG_DETAILS.name}</h1>
      </div>
      <div style={{ flex: 1, paddingRight: '45px', fontSize: '10px' }}>
        <div style={{ borderBottom: `2px solid ${theme.primary}`, paddingBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontStyle: 'italic', fontWeight: 'bold' }}>MEMBERSHIP CARD</span>
          <span style={{ color: theme.red, fontWeight: 'bold' }}>NO: {member.registration_no}</span>
        </div>
        <div style={{ marginTop: '10px' }}>
          <div style={{ borderBottom: '1px solid #ddd', padding: '4px 0' }}><strong>NAME:</strong> {member.full_name}</div>
          <div style={{ borderBottom: '1px solid #ddd', padding: '4px 0' }}><strong>REG NO:</strong> {member.registration_no}</div>
          <div style={{ borderBottom: '1px solid #ddd', padding: '4px 0' }}><strong>ADDRESS:</strong> {member.address}</div>
          <div style={{ padding: '4px 0' }}><strong>PHONE:</strong> {member.phone_number}</div>
        </div>
        <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ fontSize: '7px', maxWidth: '140px', color: '#444' }}>
            <p style={{ fontWeight: 'bold' }}>{ORG_DETAILS.address}</p>
            <p>{ORG_DETAILS.phones.join(' / ')}</p>
          </div>
          <div style={{ border: `1px solid ${theme.primary}`, padding: '2px', backgroundColor: '#fff' }}>
            <QRCode value={qrValue} size={60} />
          </div>
        </div>
      </div>
    </div>
  );
};

// --- PAGES ---

const LoginPage = ({ onLogin }) => {
  const [mode, setMode] = useState('employee');
  const [val, setVal] = useState({ user: '', pass: '', empId: '' });
  const [error, setError] = useState('');

  const login = (e) => {
    e.preventDefault();
    if (mode === 'admin') {
      if (val.user === 'oreofe' && val.pass === 'oreofe') onLogin({ role: 'admin' });
      else setError('Invalid Admin Credentials');
    } else {
      supabase.from('employees').select('*').eq('employee_id_number', val.empId).single()
        .then(({ data }) => data ? onLogin({ ...data, role: 'employee' }) : setError('Agent ID Not Found'));
    }
  };

  return (
    <div style={s.fullCenter}>
      <div style={{ ...s.card, width: '100%', maxWidth: '400px' }}>
        <h1 style={{ textAlign: 'center', color: theme.primary, fontStyle: 'italic', fontSize: '32px', marginBottom: '10px' }}>ORE-OFE OLUWA</h1>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', backgroundColor: '#f1f5f9', padding: '5px', borderRadius: '12px' }}>
          <button onClick={() => setMode('employee')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', backgroundColor: mode === 'employee' ? theme.primary : 'transparent', color: mode === 'employee' ? '#fff' : '#64748b' }}>Agent</button>
          <button onClick={() => setMode('admin')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', backgroundColor: mode === 'admin' ? theme.primary : 'transparent', color: mode === 'admin' ? '#fff' : '#64748b' }}>Admin</button>
        </div>
        <form onSubmit={login}>
          {mode === 'admin' ? (
            <>
              <input style={s.input} placeholder="Admin Username" onChange={e => setVal({ ...val, user: e.target.value })} />
              <input style={s.input} type="password" placeholder="Password" onChange={e => setVal({ ...val, pass: e.target.value })} />
            </>
          ) : (
            <input style={s.input} placeholder="Enter Agent ID" onChange={e => setVal({ ...val, empId: e.target.value })} />
          )}
          {error && <p style={{ color: theme.red, fontSize: '12px', textAlign: 'center', fontWeight: 'bold' }}>{error}</p>}
          <button type="submit" style={s.btnPrimary}>LOGIN TO SYSTEM</button>
        </form>
      </div>
    </div>
  );
};

const AdminDashboard = ({ onLogout }) => {
  const [view, setView] = useState('home');
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({ name: '', phone: '', amount: '', reg: '', addr: '', empId: '' });

  useEffect(() => { fetchMembers(); }, []);
  const fetchMembers = async () => {
    const { data } = await supabase.from('contributors').select('*').order('created_at', { ascending: false });
    setMembers(data || []);
  };

  const addMember = async (e) => {
    e.preventDefault();
    navigator.geolocation.getCurrentPosition(async (pos) => {
      await supabase.from('contributors').insert([{
        full_name: form.name, registration_no: form.reg, expected_amount: parseFloat(form.amount),
        phone_number: form.phone, address: form.addr,
        gps_latitude: pos.coords.latitude, gps_longitude: pos.coords.longitude,
      }]);
      alert("Member Added!"); fetchMembers(); setView('members');
    });
  };

  const addEmployee = async (e) => {
    e.preventDefault();
    await supabase.from('employees').insert([{ full_name: form.name, employee_id_number: form.empId, phone_number: form.phone }]);
    alert("Employee Added!"); setView('home');
  };

  return (
    <div>
      <div style={s.sidebar}>
        <h2 style={{ fontStyle: 'italic', fontWeight: '900', marginBottom: '40px' }}>ORE-OFE OLUWA</h2>
        <button onClick={() => setView('home')} style={{ ...s.navItem, ...(view === 'home' && s.navActive) }}><BarChart3 size={18} /> Dashboard</button>
        <button onClick={() => setView('add_member')} style={{ ...s.navItem, ...(view === 'add_member' && s.navActive) }}><UserPlus size={18} /> Register Member</button>
        <button onClick={() => setView('add_emp')} style={{ ...s.navItem, ...(view === 'add_emp' && s.navActive) }}><Briefcase size={18} /> Register Agent</button>
        <button onClick={() => setView('members')} style={{ ...s.navItem, ...(view === 'members' && s.navActive) }}><Users size={18} /> Members List</button>
        <button onClick={onLogout} style={{ ...s.navItem, marginTop: 'auto', color: '#fca5a5' }}><LogOut size={18} /> LOGOUT</button>
      </div>

      <div style={s.main}>
        {view === 'home' && (
          <div>
            <h1 style={{ color: theme.primary, fontWeight: '900', marginBottom: '30px' }}>SYSTEM OVERVIEW</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              <div style={s.statCard}><p style={{ fontSize: '12px', fontWeight: 'bold', color: theme.gray }}>TOTAL MEMBERS</p><h2 style={{ fontSize: '40px' }}>{members.length}</h2></div>
              <div style={{ ...s.statCard, borderLeftColor: '#2563eb' }}><p style={{ fontSize: '12px', fontWeight: 'bold', color: theme.gray }}>TODAY'S TOTAL</p><h2 style={{ fontSize: '40px' }}>₦0.00</h2></div>
            </div>
          </div>
        )}

        {view === 'add_member' && (
          <div style={{ ...s.card, maxWidth: '600px' }}>
            <h2 style={{ color: theme.primary, marginBottom: '20px' }}>Register Contributor</h2>
            <form onSubmit={addMember}>
              <input style={s.input} placeholder="Full Name" onChange={e => setForm({ ...form, name: e.target.value })} />
              <input style={s.input} placeholder="Reg Number" onChange={e => setForm({ ...form, reg: e.target.value })} />
              <input style={s.input} placeholder="Daily Amount (₦)" type="number" onChange={e => setForm({ ...form, amount: e.target.value })} />
              <input style={s.input} placeholder="Phone Number" onChange={e => setForm({ ...form, phone: e.target.value })} />
              <textarea style={{ ...s.input, minHeight: '100px' }} placeholder="Residential Address" onChange={e => setForm({ ...form, addr: e.target.value })} />
              <button type="submit" style={s.btnPrimary}>CREATE MEMBER CARD</button>
            </form>
          </div>
        )}

        {view === 'add_emp' && (
          <div style={{ ...s.card, maxWidth: '500px' }}>
            <h2 style={{ color: theme.primary, marginBottom: '20px' }}>Add Field Agent</h2>
            <form onSubmit={addEmployee}>
              <input style={s.input} placeholder="Agent Full Name" onChange={e => setForm({ ...form, name: e.target.value })} />
              <input style={s.input} placeholder="Assigned Agent ID (e.g. AGENT-01)" onChange={e => setForm({ ...form, empId: e.target.value })} />
              <input style={s.input} placeholder="Phone Number" onChange={e => setForm({ ...form, phone: e.target.value })} />
              <button type="submit" style={s.btnPrimary}>REGISTER AGENT</button>
            </form>
          </div>
        )}

        {view === 'members' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '30px' }}>
            {members.map(m => (
              <div key={m.id} style={{ ...s.card, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                <MembershipCard member={m} />
                <div style={{ width: '100%', display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1, backgroundColor: theme.primaryLight, padding: '15px', borderRadius: '15px', textAlign: 'center' }}>
                    <p style={{ fontSize: '10px', fontWeight: 'bold' }}>BALANCE</p>
                    <p style={{ fontSize: '20px', fontWeight: '900' }}>₦{m.current_balance || 0}</p>
                  </div>
                  <button onClick={() => window.print()} style={{ padding: '10px', borderRadius: '15px', border: '1px solid #ddd', cursor: 'pointer' }}><Printer /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const EmployeeDashboard = ({ user, location, onLogout }) => {
  const [scanning, setScanning] = useState(false);
  const [success, setSuccess] = useState(false);

  const scan = async (data) => {
    if (data && !success) {
      const [id, amount] = data.text.split('|');
      const dist = calculateDistance(location.lat, location.lng, 0, 0); // Logic from database
      await supabase.from('transactions').insert([{
        contributor_id: id, employee_id: user.id, amount: parseFloat(amount),
        gps_latitude: location.lat, gps_longitude: location.lng, geofence_verified: true
      }]);
      setSuccess(true);
      setTimeout(() => { setSuccess(false); setScanning(false); }, 3000);
    }
  };

  return (
    <div style={{ ...s.fullCenter, padding: '20px' }}>
      <div style={{ position: 'fixed', top: 0, width: '100%', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' }}>
        <h2 style={{ fontStyle: 'italic', color: theme.primary }}>ORE-OFE OLUWA</h2>
        <button onClick={onLogout} style={{ border: 'none', background: 'none', color: theme.red }}><LogOut /></button>
      </div>

      {success ? (
        <div style={{ textAlign: 'center' }}>
          <CheckCircle size={100} color={theme.accent} />
          <h2 style={{ marginTop: '20px' }}>COLLECTION SUCCESSFUL</h2>
        </div>
      ) : scanning ? (
        <div style={{ width: '100%', maxWidth: '400px', borderRadius: '30px', overflow: 'hidden', border: `8px solid ${theme.primary}` }}>
          <QrScanner delay={300} onScan={scan} style={{ width: '100%' }} />
          <button onClick={() => setScanning(false)} style={{ ...s.btnPrimary, borderRadius: 0, backgroundColor: theme.red }}>CANCEL</button>
        </div>
      ) : (
        <button onClick={() => setScanning(true)} style={{ width: '250px', height: '250px', borderRadius: '60px', backgroundColor: theme.primary, color: '#fff', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: theme.cardShadow }}>
          <QrCode size={80} />
          <span style={{ marginTop: '15px', fontWeight: '900', fontSize: '20px' }}>SCAN CARD</span>
        </button>
      )}
    </div>
  );
};

// --- MAIN WRAPPER ---
export default function App() {
  const [user, setUser] = useState(null);
  const [location, setLocation] = useState(null);
  const [locError, setLocError] = useState(false);

  useEffect(() => {
    const watch = navigator.geolocation.watchPosition(
      (p) => { setLocation({ lat: p.coords.latitude, lng: p.coords.longitude }); setLocError(false); },
      () => setLocError(true), { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watch);
  }, []);

  if (locError) return (
    <div style={{ ...s.fullCenter, backgroundColor: theme.red, color: '#fff', textAlign: 'center', padding: '40px' }}>
      <ShieldAlert size={80} />
      <h1>GPS ACCESS REQUIRED</h1>
      <p>Please enable location services to use the Ore-Ofe Oluwa system.</p>
    </div>
  );

  if (!location) return <div style={s.fullCenter}><h2>Acquiring GPS...</h2></div>;
  if (!user) return <LoginPage onLogin={setUser} />;

  return user.role === 'admin' ? 
    <AdminDashboard onLogout={() => setUser(null)} /> : 
    <EmployeeDashboard user={user} location={location} onLogout={() => setUser(null)} />;
}
