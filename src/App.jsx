import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import QrScanner from 'react-qr-scanner';
import QRCode from 'qrcode.react';
import { 
  MapPin, ShieldAlert, CheckCircle, Smartphone, BarChart3, 
  Users, QrCode, Plus, LogOut, Navigation, Zap, { 
  MapPin, ShieldAlert, CheckCircle, Smartphone, BarChart3, 
  Users, QrCode, Plus, LogOut, Navigation, Zap, Printer,
  UserPlus, Briefcase, ChevronRight, Search, Activity, Trash2, Download,
  Layout, CreditCard
} from 'lucide-react';

// --- CONFIGURATION ---
const SUPABASE_URL = 'https://watrosnylvkiuvuptdtp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhdHJvc255bHZraXV2dXB0ZHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MzE2NzEsImV4cCI6MjA4MjUwNzY3MX0.ku6_Ngf2JRJ8fxLs_Q-EySgCU37MjUK3WofpO9bazds';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ORG_DETAILS = {
  name: "ORE-OFE OLUWA",
  address: "No. 1, Bisiriyu Owokade Street, Molete, Ibeju-Lekki, Lagos",
  phones: ["08107218385", "08027203601"],
};

// --- STYLING SYSTEM ---
const theme = {
  primary: '#064e3b', 
  secondary: '#10b981', Printer,
  UserPlus, Briefcase, ChevronRight, Search, Activity, Trash2, Download,
  Camera, User, Phone, DollarSign, Home, Layout
} from 'lucide-react';

// --- DATABASE CONFIGURATION ---
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ORG_DETAILS = {
  name: "ORE-OFE OLUWA",
  address: "No. 1, Bisiriyu Owokade Street, Molete, Ibeju-Lekki, Lagos",
  phones: ["08107218385", "08027203601"],
};

// --- STYLING SYSTEM ---
const theme = { 
  accent: '#34d399',
  bg: '#f8fafc',
  white: '#ffffff',
  glass: 'rgba(255, 255, 255, 0.9)',
  text: '#0f172a',
  gray: '#64748b',
  error: '#dc2626',
  radius: '24px',
  shadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
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

  primary: '#064e3b',
  secondary: '#10b981',
  accent: '#34d399',
  bg: '#f8fafc',
  white: '#ffffff',
  glass: 'rgba(255, 255, 255, 0.8)',
  text: '#0f172a',
  gray: '#64748b',
  error: '#dc2626',
  radius: '24px',
  shadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
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
    marginLeft: '28    padding: '40px 24px',
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
  },
  navLink: {
    padding: '16px',
    borderRadius: '16px',
    color: '#a7f3d0',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
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
    outline: 'none'
  },
  navLink: {
    padding: '16px',
    borderRadius: '16px',
    color: '#a7f3d0',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontWeight: '600',
    marginBottom: '8px',
    background: 'transparent',
    border:2px',
    fontWeight: '600',
    marginBottom: '8px',
    background: 'transparent',
    border: 'none',
    width: '100%',
    textAlign: 'left',
    cursor: 'pointer'
  }
};

// --- COMPONENTS ---

const MembershipCard = ({ member }) => {
  const downloadQR = () => {
    const canvas = document.getElementById(`qr-${member 'none',
    width: '100%',
    textAlign: 'left',
    cursor: 'pointer'
  }
};

// --- COMPONENTS ---

const MembershipCard = ({ member }) => {
  const downloadQR = () => {
    const canvas = document.getElementById(`qr-${member.id}`);
    const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    let downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `QR_${member.registration_no}.png`;
    document.body.appendChild(.id}`);
    const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    let downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `QR_${member.registration_no}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const qrValue = `${member.id}|${member.expected_amount}|${downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const qrValue = `${member.id}|${member.expected_amount}|${member.registration_no}`;

  return (
    <div style={{ 
      width: '420px', 
      height:member.registration_no}`;

  return (
    <div className="printable-card" style={{ 
      width: '420px', 
      height: '260px', 
      background: '#fff', 
      border: `6px solid ${theme.primary}`, 
      borderRadius: '16px', 
       '260px', 
      background: '#fff', 
      border: `6px solid ${themeoverflow: 'hidden', 
      position: 'relative', 
      display: 'flex', 
      boxShadow: theme.shadow, 
      fontFamily: '"Times New Roman", Times, serif' 
    }}>
      {/* Side Brand Bar */}
      <div style={{ background: theme.primary, width: '55px.primary}`, 
      borderRadius: '16px', 
      position: 'relative', 
      display: 'flex', 
      boxShadow: theme.shadow, 
      fontFamily: 'Georgia, serif',
      margin: '0 auto' 
    }}>
      {/* Sidebar Label */}
      <div style={{ background: theme.', height: '100%', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ transform: 'rotate(90deg)', whiteSpace: 'nowrap', fontSize: '22px', fontWeight: '900', letterSpacing: '3px' }}>{ORG_DETAILS.name}</h2>
      </div>

      <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column' }}>
        {/* Header Section */}
        <div style={{ borderBottom: `3px solid ${theme.primary}`, marginBottom: '12px', paddingBottom: '5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: '900', fontStyle: 'italic', fontSize: '14px', color: theme.primary, width: '55px', height: '100%', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ transform: 'rotate(90deg)', whiteSpace: 'nowrap', fontSize: '22px', fontWeight: '900primary }}>MEMBERSHIP CARD</span>
          <span style={{ color: theme.error, fontWeight: 'bold', fontSize: '14px' }}>REG: {member.registration_no}</span>
        </div>

        {/* Content Body */}
        <div style={{ display: 'flex', flex: 1 }}>
          <div style={{ flex: 1.2, fontSize: '12px', lineHeight: '1.8' }}>
            <p', letterSpacing: '2px' }}>{ORG_DETAILS.name}</h2>
      </div>

      {/* Card Body */}
      <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ borderBottom: `2px solid ${theme.primary}`, marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: '900', fontStyle: 'italic', fontSize: '13px', color: theme.primary }}>MEMBERSHIP CARD</span>
          <span style={{ color: theme.error, fontWeight: 'bold', fontSize: '14px' }}>{member.registration_no}</span>
        </div>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between' }}>
          {/* Text style={{ margin: 0 }}><strong>NAME:</strong></p>
            <p style={{ fontSize: '14px', fontWeight: '900', margin: '0 0 8px 0', color: '#000' }}>{member.full_name.toUpperCase()}</p>
            
            <p style={{ margin: 0 }}><strong>TEL:</strong> {member.phone_number}</p>
            <p style={{ margin: 0 }}><strong>PLAN:</strong> ₦{member.expected_amount.toLocaleString()} Daily</p Details */}
          <div style={{ fontSize: '12px', lineHeight: '1.8', maxWidth: '200px' }}>
            <p style={{ margin: 0 }}><strong>NAME:</strong></p>
            <p style={{ margin: '0 0 5px 0', fontSize: '13px', fontWeight: 'bold' }}>{member.full_name.toUpperCase()}</p>
            
            <p style={{ margin: 0 }}><strong>PLAN:</strong> ₦{member.expected_amount.toLocaleString()} / Day</p>
            <p style={{ margin: 0 }}><strong>TEL:</strong> {member.phone_number}</p>
            
            <div style={{ marginTop: '15px', fontSize: '8px', color: '#555', lineHeight: '1.4' }}>
              <p style={{ margin: 0 }}>{ORG_DETAILS.address}</p>
>
            <p style={{ margin: '5px 0 0 0', fontSize: '9px', color: '#555', lineHeight: '1.2' }}>{member.address}</p>
          </div>

          {/* ENLARGED QR CODE AREA */}
          <div style={{ flex: 0.8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style              <p style={{ margin: '2px 0 0 0', fontWeight: 'bold' }}>{ORG_DETAILS.phones.join(' • ')}</p>
            </div>
          </div>

          {/* MASSIVE QR CODE AREA */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ border: '3px solid #000', padding: '5px', background: '#fff', borderRadius: '8px' }}>
              <QRCode id={`qr-${member.id}`} value={qrValue} size={115} level="H" includeMargin={false} />
            </div>
            <span style={{ fontSize: '8px', fontWeight: 'bold', color={{ border: '3px solid #000', padding: '5px', background: '#fff', borderRadius: '8px' }}>
              <QRCode 
                id={`qr-${member.id}`} 
                value={qrValue} 
                size={115}  // MASSIVE QR CODE
                level="H" 
                includeMargin={false} 
              />
            </div>
            <p style={{ fontSize: '8px',: theme.gray }}>SCAN TO LOG PAYMENT</span>
          </div>
        </div>
      </div>

      {/* Action fontWeight: 'bold', marginTop: '5px', color: theme.primary }}>SCAN FOR COLLECTION</p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid #eee', paddingTop: '8px', marginTop: '5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '7px', color: '#666' }}>
             <p>{ORG_DETAILS.phones.join(' • ')}</p>
          </div>
          <p style={{ fontSize: '7px', fontWeight: 'bold' }}>Valid at Lekki Branch</p>
        </div>
      </div>

      {/* Action Floating Buttons */}
      <div className="no-print" style={{ position: Buttons (Floating) */}
      <div style={{ position: 'absolute', top: '10px', right: '65px', display: 'flex', gap: '8px' }}>
         <button onClick={downloadQR} style={{ background: theme.secondary, border: 'none', borderRadius: '8px', cursor: 'pointer', padding: '6px', color: '#fff' }}><Download size={16}/></button>
         <button onClick={() => window.print()} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', padding: '6px', color: theme.primary }}><Printer size={16}/></button>
      </div>
    </div>
  );
};

// --- PAGES ---

const LoginPage = ({ 'absolute', top: '10px', right: '65px', display: 'flex', gap: '8px' }}>
         <button onClick={downloadQR} style={{ background: theme.accent, border: 'none', borderRadius: '8px', cursor: 'pointer', padding: '6px', color: theme.primary }} title="Download QR"><Download size={18}/></button>
         <button onClick={() => window.print()} style={{ background: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer', padding: '6px', color: theme.text }} title="Print Card"><Printer size={18}/></button>
      </div>
    </div>
  );
};

// --- MAIN PAGES ---

const LoginPage = ({ onLogin }) => {
  const [mode, setMode] = useState('agent');
   onLogin }) => {
  const [mode, setMode] = useState('agent');
  const [creds, setCreds] = useState({ user: '', pass: '', empId: '' });
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (mode === 'admin') {
      if (creds.user === 'oreofe' && creds.pass === 'oreofe') onLogin({ role: 'admin' });
      else setError('Invalid Credentials');
    } else {
      supabase.from('employees').select('*').eq('employee_id_number', creds.empId).single()
        .then(({ data }) => data ? onLogin({ ...data, role: 'employee' }) : setError('Agent ID Error'));
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContentconst [creds, setCreds] = useState({ user: '', pass: '', empId: '' });
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (mode === 'admin') {
      if (creds.user === 'oreofe' && creds.pass === 'oreofe') onLogin({ role: 'admin' });
      else setError('Incorrect Admin Credentials');
    } else {
      supabase.from('employees').select('*').eq('employee_id_number', creds.empId).single()
        .then(({ data }) => data ?: 'center', background: theme.primary }}>
      <div style={{ ...styles.glassCard, width: '400px', textAlign: 'center' }}>
        <h1 style={{ color: theme.primary, fontStyle: 'italic', fontWeight: '900', fontSize: '32px', marginBottom: '32px' }}>ORE-OFE OLUWA</h1>
        
        <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '14px', padding: '6px', marginBottom: '24px' }}>
          <button onClick={() => setMode('agent')} style={{ flex: 1, padding: '12px', border: 'none', borderRadius: '10px', fontWeight: '700', background: mode === ' onLogin({ ...data, role: 'employee' }) : setError('Agent ID not authorized'));
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg, ${theme.primary} 0%, #065f46 100%)` }}>
      <div style={{ ...styles.glassCard, width: '420px', textAlign: 'center' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ color: theme.primary, fontStyle: 'italic', fontWeight: '900', fontSize: '38px', margin: 0 }}>ORE-OFE OLUWA</h1>
          <p style={{ color: theme.secondary, fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '3px' }}>Ajo Automated Systems</p>
        </div>
        
        <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '18px', padding: '6px', marginBottom: '32agent' ? theme.primary : 'transparent', color: mode === 'agent' ? '#fff' : theme.gray }}>Agent</button>
          <button onClick={() => setMode('admin')} style={{ flex: 1, padding: '12px', border: 'none', borderRadius: '10px', fontWeight: '700', background: mode === 'admin' ? theme.primary : 'transparent', color: mode === 'admin' ? '#fff' : theme.gray }}>Admin</button>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {mode === 'admin' ? (
            <>
              <input style={styles.input} placeholder="Username" onChange={e => setCreds({ ...creds, user: e.target.value })} />
              <input style={styles.input} type="password" placeholder="Password" onChange={e => setCreds({ ...creds, pass: e.target.value })} />
            </>
          ) : (
            <input style={styles.input} placeholder="Agent ID Number" onChange={e => setCreds({ ...creds, empId: e.target.value })} />
          )}
          {error && <p style={{ colorpx' }}>
          <button onClick={() => setMode('agent')} style={{ flex: 1, padding: '14px', border: 'none', borderRadius: '14px', fontWeight: '800', cursor: 'pointer', background: mode === 'agent' ? theme.primary : 'transparent', color: mode === 'agent' ? '#fff' : theme.gray }}>FIELD AGENT</button>
          <button onClick={() => setMode('admin')} style={{ flex: 1, padding: '14px', border: 'none', borderRadius: '14px', fontWeight: '800', cursor: 'pointer', background: mode === 'admin' ? theme.primary : 'transparent', color: mode === 'admin' ? '#fff' : theme.gray }}>ADMIN</button>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex: theme.error, fontSize: '13px', fontWeight: 'bold' }}>{error}</p>}
          <button style={{ ...styles.btn, background: theme.primary, color: '#fff' }}>LOGIN</button>
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
    navigator.geolocation.getCurrentPosition(', flexDirection: 'column', gap: '20px' }}>
          {mode === 'admin' ? (
            <>
              <input style={styles.input} placeholder="Admin Username" onChange={e => setCreds({ ...creds, user: e.target.value })} />
              <input style={styles.input} type="password" placeholder="Password" onChange={e => setCreds({ ...creds, pass: e.target.value })} />
            </>
          ) : (
            <input style={styles.input} placeholder="Agent Identification ID" onChange={e => setCreds({ ...creds, empId: e.target.value })} />
          )}
          {error && <p style={{ color: theme.error, fontSize: '13px', fontWeight: 'bold' }}>{error}</p>}
          <button style={{ ...styles.btn, background: theme.primary, color: '#fff', fontSize: '18px', padding: '18px' }}>LOGIN TO DASHBOARD</button>
        </form>
      </div>
    </div>async (pos) => {
      await supabase.from('contributors').insert([{
        full_name: form.name, registration_no: form.reg, expected_amount: parseFloat(form.amount),
        phone_number: form.phone, address: form.addr, gps_latitude: pos.coords.latitude, gps_longitude: pos.coords.longitude
      }]);
      alert("Member Added!"); loadData(); setView('members');
    });
  };

  const registerEmployee = async (e) => {
    e.preventDefault();
    await supabase.from('employees').insert([{ full_name: form.name, employee_id_number: form.empId, phone_number: form.phone }]);
    alert("Agent Authorized!"); set
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

  const registerMember = async (e)View('home');
  };

  return (
    <div>
      <div style={styles.sidebar}>
        <h2 style={{ fontWeight: '900', fontStyle: 'italic', fontSize: '24px', marginBottom: '40px' }}>ORE-OFE OLUWA</h2>
        <button onClick={() => setView('home')} style={{ ...styles.navLink, ...(view === 'home' && { background: 'rgba(255,255,255,0.1)', color: '#fff' }) }}><Layout size={20} /> Dashboard</button>
        <button onClick={() => setView('add_member')} style={{ ...styles.navLink, ...(view === 'add_member' && { background: 'rgba(255,2 => {
    e.preventDefault();
    navigator.geolocation.getCurrentPosition(async (pos) => {
      await supabase.from('contributors').insert([{
        full_name: form.name, registration_no: form.reg, expected_amount: parseFloat(form.amount),
        phone_number: form.phone, address: form.addr, gps_latitude: pos.coords.latitude, gps_longitude: pos.coords.longitude
      }]);
      alert("Success: New Member Registered"); loadData(); setView('members');
    });
  };

  const registerEmployee = async (e) => {
    e.preventDefault();
    await supabase55,255,0.1)', color: '#fff' }) }}><UserPlus size={20} /> Add Member</button>
        <button onClick={() => setView('add_emp')} style={{ ...styles.navLink, ...(view === 'add_emp' && { background: 'rgba(255,255,255,0.1)', color: '#fff' }) }}><Briefcase size={20} /> Add Agent</button>
        <button onClick={() => setView('members')} style={{.from('employees').insert([{ full_name: form.name, employee_id_number: form.empId, phone_number: form.phone }]);
    alert("Success: Field Agent Authorized"); setView('home');
  };

  return (
    <div>
      <div style={styles.sidebar}>
        <div style={{ marginBottom: '50px' }}>
          <h2 style={{ fontWeight: '900', fontStyle: 'italic', fontSize: '26px' }}>ORE-OFE OLUWA</h2>
          <div style={{ ...styles.navLink, ...(view === 'members' && { background: 'rgba(255,255,255,0.1)', color: '#fff' }) }}><Users size={20} /> Member Cards</button>
        <button onClick={onLogout} style={{ ...styles.navLink, marginTop: 'auto', color: '#fca5a5' }}><LogOut size={20} /> Exit</button>
      </div>

      <div style={styles.main}>
        {view === 'home' && (
          <div>
            <h1 style={{ fontSize: '36px', fontWeight: '900 height: '4px', width: '40px', background: theme.accent, marginTop: '8px' }} />
        </div>
        <button onClick={() => setView('home')} style={{ ...styles.navLink, ...(view === 'home' && { background: 'rgba(255,255,255,0.15)', color: '#fff' }) }}><BarChart3 size={22} /> Dashboard</button>
        <button onClick={() => setView('add_member')} style={{ ...styles.navLink, ...(', color: theme.primary, marginBottom: '40px' }}>Admin Panel</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              <div style={styles.glassCard}><p style={{ fontWeight: 'bold', color: theme.gray, fontSize: '12px' }}>MEMBERS</p><h2 style={{ fontSize: '48px', fontWeight: '900' }}>{members.length}</h2></div>view === 'add_member' && { background: 'rgba(255,255,255,0.15)', color: '#fff' }) }}><UserPlus size={22} /> Register Member</button>
        <button onClick={() => setView('add_emp')} style={{ ...styles.navLink, ...(view === 'add_emp' && { background: 'rgba(255,255,255,0.15)', color: '#fff' }) }}><Briefcase size={22} /> Register Agent</button>
        <button onClick={() => setView('members')} style={{ ...styles.navLink, ...(view === 'members' && { background: 'rgba(255,255,255,0.15)', color: '#fff' }) }}><CreditCard size={22} /> Membership File</button>
        <button onClick={onLogout} style={{ ...styles.navLink, marginTop: 'auto', color: '#fca5a5' }}><LogOut size={22} /> Log
              <div style={{ ...styles.glassCard, borderLeft: `8px solid ${theme.accent}` }}><p style={{ fontWeight: 'bold', color: theme.gray, fontSize: '12px' }}>COLLECTIONS</p><h2 style={{ fontSize: '48px', fontWeight: '900' }}>₦0.00</h2></div>
            </div>
          </div>
        )}

        {(view === 'add_member' || view === 'add_emp') && (
           <div style={{ ...styles.glassCard, maxWidth: '600px', margin: '0 auto' }}>
              <h2 style={{ color: theme.primary, marginBottom: '24px', fontWeight: '900' }}>
                {view === 'add_member' ? 'Enroll New Member' : 'Authorize Agent'}
              </h2>
              <form onSubmit={view === 'add_member' ? register Out</button>
      </div>

      <div style={styles.main}>
        {view === 'home' && (
          <div style={{ animate: 'fadein 0.5s' }}>
            <h1 style={{ fontSize: '42px', fontWeight: '900', color: theme.primary, marginBottom: '40px' }}>System Command</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>Member : registerEmployee} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                 <input style={styles.input} placeholder="Full Name" required onChange={e => setForm({ ...form, name: e.target.value })} />
                 {view === 'add_member' ? (
                   <>
                     <input style={styles.input} placeholder="Reg Number" required onChange={e => setForm({ ...form, reg: e.target.value })} />
                     <input style={styles.input} placeholder="Daily Contribution (₦)" type="number" required onChange={e => setForm({ ...form, amount: e.
              <div style={styles.glassCard}><p style={{ fontWeight: '900', color: theme.gray, fontSize: '13px', letterSpacing: '1px' }}>ACTIVE MEMBERS</p><h2 style={{ fontSize: '64px', fontWeight: '900', color: theme.primary }}>{members.length}</h2></div>
              <div style={{ ...styles.glassCard, borderLeft: `10px solid ${theme.secondary}` }}><p style={{ fontWeight: '900', color: theme.gray, fontSize: '13px', letterSpacing: '1px' }}>TOTAL COLLECTIONS</p><h2 style={{ fontSize: '64target.value })} />
                     <input style={styles.input} placeholder="Phone Number" required onChange={e => setForm({ ...form, phone: e.target.value })} />
                     <textarea style={{ ...styles.input, minHeight: '100px' }} placeholder="Address" required onChange={e => setForm({ ...form, addr: e.target.value })} />
                   </>
                 ) : (
                   <input style={styles.input} placeholder="Agent ID Number" required onChange={e => setForm({ ...form, empId: e.target.value })} />
                 )}
                 <button style={{ ...styles.btnpx', fontWeight: '900', color: theme.secondary }}>₦0.00</h2></div>
            </div>
          </div>
        )}

        {(view === 'add_member' || view === 'add_emp') && (
           <div style={{ ...styles.glassCard, maxWidth: '650px', margin: '0 auto' }}>
              <h2 style={{ color: theme.primary, marginBottom: '30px', fontWeight: '900', fontSize: '28px' }}>
                {view === 'add, background: theme.primary, color: '#fff' }}>SAVE RECORD</button>
              </form>
           </div>
        )}

        {view === 'members' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(440px, 1fr))', gap: '32px' }}>
            {members.map(m => (
              <div key={m.id} style={{ ...styles.glassCard, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2_member' ? 'Enroll New Member' : 'Authorize Field Agent'}
              </h2>
              <form onSubmit={view === 'add_member' ? registerMember : registerEmployee} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                 <input style={styles.input} placeholder="Full Legal Name" required onChange={e => setForm({ ...form, name: e.target.value })} />
                 {view === 'add_member' ? (
                   <>
                     <div style={{ display: 'flex', gap: '15px' }}>
                        <input style={styles.input} placeholder="Registration No. (OOO-0px' }}>
                 <MembershipCard member={m} />
                 <div style={{ width: '100%', display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1, background: '#f0fdf4', padding: '16px', borderRadius: '16px', textAlign: 'center' }}>
                       <p style={{ fontSize: '10px', fontWeight: '900', color: theme.secondary }}>BALANCE</p>
                       <p style={{ fontSize: '24px',XXX)" required onChange={e => setForm({ ...form, reg: e.target.value })} />
                        <input style={styles.input} placeholder="Daily Amount (₦)" type="number" required onChange={e => setForm({ ...form, amount: e.target.value })} />
                     </div>
                     <input style={styles.input} placeholder="Mobile Phone Number" required onChange={e => setForm({ ...form, phone: e.target.value })} />
                     <textarea style={{ ...styles.input, minHeight: '140px' }} placeholder="Full Residential Address" required onChange={e => setForm({ ...form, addr: e.target.value })} />
                   </>
                 ) : (
                   <>
                     <input style={styles.input} placeholder="Assigned Agent ID Code" required onChange={e => setForm({ ...form, empId: e.target.value })} />
                     <input style={styles.input} placeholder="Agent Phone Number" required onChange={e => setForm({ ...form, phone: e.target.value })} />
                   </>
                 )}
                 <button style={{ ... fontWeight: '900', color: theme.primary }}>₦{m.current_balance || 0}</p>
                    </div>
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
  const [status, setStatus] = useState('idle');

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
      } catch (err) { setStatus('error'); setTimeout(() => setStatus('idle'), 3000); }styles.btn, background: theme.primary, color: '#fff', padding: '20px', fontSize: '18px' }}>
                    {view === 'add_member' ? 'ACTIVATE & GENERATE CARD' : 'ENROLL AGENT'}
                 </button>
              </form>
           </div>
        )}

        {view === 'members' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))', gap: '40px' }}>
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: theme.bg, display: 'flex', flexDirection: 'column' }}>
       <header style={{ padding: '24px', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontStyle: 'italic', fontWeight: '900', color: theme.primary }}>ORE-OFE OLUWA</h2>
          <button onClick={onLogout} style={{ padding: '10px', borderRadius: '12px', background: '#fee2e2', border:
            {members.map(m => (
              <div key={m.id} style={{ ...styles.glassCard, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '25px' }}>
                 <MembershipCard member={m} />
                 <div style={{ width: '100%', display: 'flex', gap: '15px' }}>
                    <div style={{ flex: 1, background: '#f0fdf4', padding: '20px', borderRadius: '20px', textAlign: 'center' }}>
                       <p style={{ fontSize: '12px', fontWeight: '900', color: theme 'none', color: '#ef4444' }}><LogOut size={20}/></button>
       </header>

       <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {status === 'success' ? (
             <div style={{ textAlign: 'center' }}>
                <CheckCircle size={100} color={theme.secondary} />
                <h2 style={{ fontWeight: '900', color: theme.primary }}>SUCCESS</h2>
             </div>
          ) : scanning ? (
             <div style={{ width: '100%', maxWidth: '40.secondary, marginBottom: '5px' }}>CURRENT ACCOUNT BALANCE</p>
                       <p style={{ fontSize: '28px', fontWeight: '900', color: theme.primary }}>₦{m.current_balance || 0}</p>
                    </div>
                    <button style={{ padding: '20px', borderRadius: '20px', background: '#fee2e2', border: 'none', color: '#b91c1c', cursor: 'pointer' }} onClick={() => supabase.from('contributors').delete().eq('id', m.id).then0px', borderRadius: '40px', overflow: 'hidden', border: `10px solid ${theme.primary}` }}>
                <QrScanner delay={300} onScan={handleScan} style={{ width: '100%' }} constraints={{ video: { facingMode: "environment" } }} />
                <button onClick={() => setScanning(false)} style={{ ...styles.btn, width: '100%', background: theme.error, color: '#fff', borderRadius: 0 }}>CANCEL</button>
             </div>
          ) : (
             <(loadData)}><Trash2 size={24}/></button>
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
  const [status, setStatus] = useState('idle');

  const handleScan = async (data) => {
    if (data && status === 'idle') {
      setStatus('processing');
      try {
        const [id, amount] = data.text.split('|');
        await supabase.from('transactions').insert([{
          contributor_id: id, employee_id: user.id, amount: parseFloat(amount),button onClick={() => setScanning(true)} style={{ width: '280px', height: '280px', borderRadius: '80px', background: theme.primary, color: '#fff', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <QrCode size={200} />
                <span style={{ marginTop: '20px', fontSize: '24px', fontWeight: '900' }}>SCAN CARD</span>
             </button>
          )}
       </main>
    </div>
  );
};

// --- SYSTEM ROOT ---
export default function
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
       <header style={{ padding: '24px 32px', background: '#fff', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style App() {
  const [user, setUser] = useState(null);
  const [location, setLocation] = useState(null);
  const [locError, setLocError] = useState(false);

  useEffect(() => {
    navigator.geolocation.watchPosition(
      (p) => { setLocation({ lat: p.coords.latitude, lng: p.coords.longitude }); setLocError(false); },
      () => setLocError(true), { enableHighAccuracy: true }
    );
  }, []);

  if (locError) return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: theme.error, color: '#fff', padding: '40px', textAlign: 'center' }}>
      <ShieldAlert size={100} />
      <h1>GPS REQUIRED</h1>
    </div>
  );

  if (!location) return <div={{ fontStyle: 'italic', fontWeight: '900', color: theme.primary, fontSize: '22px' }}>ORE-OFE OLUWA</h2>
            <p style={{ fontSize: '11px', color: theme.gray, fontWeight: '700' }}>AGENT ID: {user.employee_id_number}</p>
          </div>
          <button onClick={onLogout} style={{ padding: '12px', borderRadius: '14px', background: '#fee2e2', border: 'none', color: '#ef4444' }}><LogOut size={22}/></button>
       </header>

       < style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: theme.primary, color: '#fff' }}>Locating...</div>;
  if (!user) return <LoginPage onLogin={setUser} />;

  return user.role === 'admin' ? <AdminDashboard onLogout={() => setUser(null)} /> : <AgentDashboard user={user} location={location} onLogout={() => setUser(null)} />;
}
