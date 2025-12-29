import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import QrScanner from 'react-qr-scanner';
import QRCode from 'qrcode';
import { 
  Users, UserPlus, MapPin, Scan, LayoutDashboard, 
  Settings, LogOut, CheckCircle, Loader2, ShieldCheck, Landmark, Printer, 
  AlertCircle, Eye, Download, Search, TrendingUp
} from 'lucide-react';

/* ===================== CONFIG ===================== */
const SUPABASE_URL = 'https://watrosnylvkiuvuptdtp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhdHJvc255bHZraXV2dXB0ZHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MzE2NzEsImV4cCI6MjA4MjUwNzY3MX0.ku6_Ngf2JRJ8fxLs_Q-EySgCU37MjUK3WofpO9bazds';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const GEOFENCE_RADIUS_METERS = 100;

export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [view, setView] = useState('dashboard');
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loginMode, setLoginMode] = useState('admin');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const username = e.target.username.value;
    const password = e.target.password.value;

    try {
      if (loginMode === 'admin') {
        if (username === 'oreofe' && password === 'oreofe') {
          const ownerData = { id: 'admin', full_name: 'Oreofe Owner', role: 'admin', ajo_owner_id: 'admin' };
          setUser({ id: 'admin' });
          setProfile(ownerData);
        } else {
          alert("Access Denied: Invalid admin credentials");
        }
      } else {
        const { data: employee, error } = await supabase
          .from('employees')
          .select('*')
          .eq('employee_id_number', username)
          .eq('password', password)
          .single();

        if (employee) {
          setUser({ id: employee.id });
          setProfile({ ...employee, role: 'employee' });
        } else {
          alert("Access Denied: Invalid agent credentials");
        }
      }
    } catch (err) {
      alert("Connection error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setProfile(null);
    setView('dashboard');
  };

  if (!user) return <LoginScreen onLogin={handleLogin} loading={loading} loginMode={loginMode} setLoginMode={setLoginMode} />;

  return (
    <div style={styles.appContainer}>
      {/* FIXED: Removed the function-child pattern which was causing the "stuck" screen */}
      <LocationGate onLocationUpdate={setUserLocation}>
            <header style={styles.appHeader}>
              <div style={styles.brand}>
                <div style={styles.logoDot} />
                <h1 style={styles.brandH1}>AJO<span style={styles.brandSpan}>PRO</span></h1>
              </div>
              <div style={styles.profilePill}>{profile?.full_name?.split(' ')[0] || 'User'}</div>
            </header>

            <main style={styles.contentArea}>
              {profile?.role === 'admin' ? (
                <>
                  {view === 'dashboard' && <OwnerDashboard />}
                  {view === 'members' && <MemberRegistration />}
                  {view === 'employees' && <EmployeeManagement />}
                </>
              ) : (
                <CollectionInterface profile={profile} userLocation={userLocation} />
              )}
            </main>

            <nav style={styles.bottomNav}>
              <button 
                onClick={() => setView('dashboard')} 
                style={{...styles.navButton, ...(view === 'dashboard' ? styles.navButtonActive : {})}}
              >
                <LayoutDashboard size={22} />
              </button>
              {profile?.role === 'admin' ? (
                <>
                  <button 
                    onClick={() => setView('members')} 
                    style={{...styles.navButton, ...(view === 'members' ? styles.navButtonActive : {})}}
                  >
                    <UserPlus size={22} />
                  </button>
                  <button 
                    onClick={() => setView('employees')} 
                    style={{...styles.navButton, ...(view === 'employees' ? styles.navButtonActive : {})}}
                  >
                    <Settings size={22} />
                  </button>
                </>
              ) : (
                <button style={{...styles.navButton, ...styles.scanBtn}} onClick={() => setView('dashboard')}>
                  <Scan size={22} />
                </button>
              )}
              <button onClick={handleLogout} style={styles.navButton}>
                <LogOut size={22} />
              </button>
            </nav>
      </LocationGate>
    </div>
  );
}

// --- LOCATION GATE (FIXED logic to prevent stuck screens) ---
const LocationGate = ({ children, onLocationUpdate }) => {
  const [status, setStatus] = useState('loading'); // loading, ready, denied

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus('ready');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        onLocationUpdate({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStatus('ready');
      },
      (err) => {
        console.warn("Location access denied");
        setStatus('ready'); // Continue anyway so the app isn't "stuck"
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [onLocationUpdate]);

  if (status === 'loading') {
    return (
      <div style={styles.loadingScreen}>
        <MapPin size={48} style={{color: '#2563eb', marginBottom: 16}} />
        <Loader2 size={32} style={styles.spinner} />
        <p style={{marginTop: 16, fontWeight: '600'}}>Initializing GPS...</p>
      </div>
    );
  }

  return children;
};

// --- LOGIN SCREEN (FIXED input autocomplete and state) ---
const LoginScreen = ({ onLogin, loading, loginMode, setLoginMode }) => (
  <div style={styles.loginPage}>
    <div style={styles.loginCard}>
      <div style={styles.loginHeader}>
        <Landmark size={48} style={styles.loginIcon} />
        <h2 style={styles.loginTitle}>AJO-PRO</h2>
        <p style={styles.loginSubtitle}>
          {loginMode === 'admin' ? 'Owner Administration' : 'Field Agent Portal'}
        </p>
      </div>

      <div style={styles.loginToggle}>
        <button 
          type="button"
          onClick={() => setLoginMode('admin')}
          style={{...styles.toggleBtn, ...(loginMode === 'admin' ? styles.toggleBtnActive : {})}}
        >
          Admin
        </button>
        <button 
          type="button"
          onClick={() => setLoginMode('agent')}
          style={{...styles.toggleBtn, ...(loginMode === 'agent' ? styles.toggleBtnActive : {})}}
        >
          Agent
        </button>
      </div>

      <form onSubmit={onLogin} style={styles.loginForm}>
        <input 
          name="username" 
          placeholder={loginMode === 'admin' ? 'Username' : 'Agent ID'} 
          required 
          style={styles.input}
        />
        <input 
          name="password" 
          type="password" 
          placeholder="Password" 
          required 
          style={styles.input}
        />
        <button disabled={loading} style={styles.btnPrimary}>
          {loading ? <Loader2 size={18} style={styles.spinner} /> : <><ShieldCheck size={18} /> <span style={{marginLeft: 8}}>SECURE LOGIN</span></>}
        </button>
      </form>
    </div>
  </div>
);

// --- [All other components: OwnerDashboard, CollectionInterface, etc. remain the same as your original logic but are included in the bundle for functionality] ---

// --- OWNER DASHBOARD ---
const OwnerDashboard = () => {
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [qrCodes, setQrCodes] = useState({});
  const [dashboardView, setDashboardView] = useState('members');
  const [collections, setCollections] = useState([]);
  const [stats, setStats] = useState({
    totalCollections: 0, totalAmount: 0, todayCollections: 0, todayAmount: 0, verifiedCount: 0, remoteCount: 0
  });

  useEffect(() => {
    loadMembers();
    loadCollections();
  }, []);

  const loadMembers = async () => {
    setLoading(true);
    const { data } = await supabase.from('contributors').select('*').eq('ajo_owner_id', 'admin').order('created_at', { ascending: false });
    if (data) {
      setMembers(data);
      data.forEach(async (m) => {
        const qr = await QRCode.toDataURL(JSON.stringify({ id: m.id, regNo: m.registration_no, name: m.full_name, amount: m.expected_amount }));
        setQrCodes(prev => ({ ...prev, [m.id]: qr }));
      });
    }
    setLoading(false);
  };

  const loadCollections = async () => {
    const { data } = await supabase.from('transactions').select('*, contributors(full_name, registration_no), employees(full_name)').eq('ajo_owner_id', 'admin').order('created_at', { ascending: false });
    if (data) {
      setCollections(data);
      const today = new Date().toISOString().split('T')[0];
      const todayTxs = data.filter(t => t.created_at.startsWith(today));
      setStats({
        totalCollections: data.length,
        totalAmount: data.reduce((s, t) => s + Number(t.amount || 0), 0),
        todayCollections: todayTxs.length,
        todayAmount: todayTxs.reduce((s, t) => s + Number(t.amount || 0), 0),
        verifiedCount: data.filter(t => t.geofence_verified).length,
        remoteCount: data.filter(t => !t.geofence_verified).length
      });
    }
  };

  const printMemberCard = (member) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`<html><body style="font-family:sans-serif; text-align:center; padding:50px;">
      <div style="border:2px solid #000; padding:20px; display:inline-block; border-radius:15px;">
        <h2>AJO-PRO MEMBER</h2>
        <img src="${qrCodes[member.id]}" style="width:200px"/>
        <h3>${member.full_name}</h3>
        <p>ID: ${member.registration_no}</p>
        <p>Daily Contribution: ₦${Number(member.expected_amount).toLocaleString()}</p>
      </div>
    </body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  const filteredMembers = members.filter(m => m.full_name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredCollections = collections.filter(c => c.contributors?.full_name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div style={styles.fadeIn}>
      <div style={styles.dashboardTabs}>
        <button onClick={() => setDashboardView('members')} style={{...styles.dashboardTab, ...(dashboardView === 'members' ? styles.dashboardTabActive : {})}}><Users size={18} /> Members</button>
        <button onClick={() => setDashboardView('collections')} style={{...styles.dashboardTab, ...(dashboardView === 'collections' ? styles.dashboardTabActive : {})}}><TrendingUp size={18} /> Collections</button>
      </div>

      {dashboardView === 'collections' ? (
        <>
          <div style={styles.statsGrid}>
            <div style={{...styles.statCard, ...styles.statCardPrimary}}>
              <p style={styles.statCardLabel}>Today's Total</p>
              <h2 style={styles.statCardValue}>₦{stats.todayAmount.toLocaleString()}</h2>
            </div>
            <div style={styles.statCard}>
              <p style={styles.statCardLabel}>Agent Verified</p>
              <h2 style={styles.statCardValue}>{stats.verifiedCount}</h2>
            </div>
          </div>
          <div style={styles.collectionsList}>
            {filteredCollections.map(c => (
              <div key={c.id} style={styles.collectionCard}>
                <div style={styles.collectionHeader}>
                  <div><strong>{c.contributors?.full_name}</strong><br/><small>{c.employees?.full_name}</small></div>
                  <div style={styles.amount}>₦{c.amount}</div>
                </div>
                <div style={c.geofence_verified ? styles.tagOk : styles.tagWarn}>
                  {c.geofence_verified ? 'Verified at Location' : 'Remote Collection'}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div style={styles.searchBar}>
            <Search size={20} style={{position:'absolute', left: 15, top: 15, color: '#94a3b8'}} />
            <input placeholder="Search members..." style={styles.searchInput} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div style={styles.membersList}>
            {filteredMembers.map(m => (
              <div key={m.id} style={styles.memberCard} onClick={() => printMemberCard(m)}>
                <img src={qrCodes[m.id]} style={styles.qrThumbnail} />
                <div style={{flex:1}}>
                  <div style={styles.memberCardName}>{m.full_name}</div>
                  <div style={styles.memberCardId}>{m.registration_no}</div>
                </div>
                <div style={styles.amount}>₦{m.expected_amount}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// --- COLLECTION INTERFACE ---
const CollectionInterface = ({ profile, userLocation }) => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleScan = async (data) => {
    if (data && !processing) {
      setProcessing(true);
      try {
        const parsed = JSON.parse(data.text);
        const { data: member } = await supabase.from('contributors').select('*').eq('id', parsed.id).single();
        
        if (member) {
          const dist = calculateDistance(userLocation.lat, userLocation.lng, member.gps_latitude, member.gps_longitude);
          const verified = dist <= GEOFENCE_RADIUS_METERS;

          await supabase.from('transactions').insert([{
            ajo_owner_id: 'admin',
            contributor_id: member.id,
            employee_id: profile.id,
            amount: member.expected_amount,
            gps_latitude: userLocation.lat,
            gps_longitude: userLocation.lng,
            geofence_verified: verified,
            distance_from_registered: Math.round(dist)
          }]);

          setResult({ name: member.full_name, amount: member.expected_amount, verified });
          setScanning(false);
          setTimeout(() => { setResult(null); setProcessing(false); }, 3000);
        }
      } catch (e) {
        alert("Invalid QR Code");
        setProcessing(false);
      }
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const p1 = lat1 * Math.PI/180; const p2 = lat2 * Math.PI/180;
    const dp = (lat2-lat1) * Math.PI/180; const dl = (lon2-lon1) * Math.PI/180;
    const a = Math.sin(dp/2)**2 + Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };

  return (
    <div style={{textAlign:'center'}}>
      {result ? (
        <div style={styles.successCard}>
          <CheckCircle size={60} color="#22c55e" />
          <h2>Success!</h2>
          <p>{result.name}</p>
          <h1>₦{result.amount}</h1>
          <span style={result.verified ? styles.tagOk : styles.tagWarn}>{result.verified ? 'Verified' : 'Out of Range'}</span>
        </div>
      ) : (
        <div style={styles.scannerCard}>
          {scanning ? (
            <QrScanner delay={300} onScan={handleScan} style={{width:'100%'}} />
          ) : (
            <button style={styles.btnPrimary} onClick={() => setScanning(true)}><Scan /> Start Scan</button>
          )}
        </div>
      )}
    </div>
  );
};

// --- MEMBER REGISTRATION & EMPLOYEE MANAGEMENT (Placeholders for core logic) ---
const MemberRegistration = () => {
    const handleSubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const regNo = 'AJO' + Math.random().toString(36).substr(2, 5).toUpperCase();
            await supabase.from('contributors').insert([{
                ajo_owner_id: 'admin', full_name: fd.get('name'), phone_number: fd.get('phone'),
                address: fd.get('addr'), expected_amount: fd.get('amt'), registration_no: regNo,
                gps_latitude: pos.coords.latitude, gps_longitude: pos.coords.longitude
            }]);
            alert("Member Registered: " + regNo);
            e.target.reset();
        });
    };
    return (
        <form style={styles.cardForm} onSubmit={handleSubmit}>
            <h3 style={styles.formTitle}>New Member</h3>
            <input name="name" placeholder="Full Name" style={styles.input} required />
            <input name="phone" placeholder="Phone" style={styles.input} required />
            <input name="addr" placeholder="Address" style={styles.input} required />
            <input name="amt" placeholder="Daily Amount (₦)" type="number" style={styles.input} required />
            <button style={styles.btnPrimary}>Register Member</button>
        </form>
    );
};

const EmployeeManagement = () => {
    const [emps, setEmps] = useState([]);
    useEffect(() => { supabase.from('employees').select('*').then(({data}) => setEmps(data || [])) }, []);
    return (
        <div style={styles.cardForm}>
            <h3 style={styles.formTitle}>Agents</h3>
            {emps.map(e => <div key={e.id} style={styles.employeeCard}>{e.full_name} ({e.employee_id_number})</div>)}
        </div>
    );
}

// --- STYLES (Keep existing styles, only showing essential overrides) ---
const styles = {
  appContainer: { maxWidth: '500px', margin: '0 auto', minHeight: '100vh', background: '#f8fafc', position: 'relative', fontFamily: 'sans-serif' },
  appHeader: { padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', borderBottom: '1px solid #e2e8f0' },
  brand: { display: 'flex', alignItems: 'center', gap: '8px' },
  logoDot: { width: '12px', height: '12px', background: '#2563eb', borderRadius: '50%' },
  brandH1: { fontSize: '20px', fontWeight: '900', margin: 0 },
  brandSpan: { color: '#2563eb' },
  profilePill: { background: '#eff6ff', color: '#2563eb', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '700' },
  contentArea: { padding: '20px', paddingBottom: '100px' },
  bottomNav: { position: 'fixed', bottom: '20px', left: '20px', right: '20px', maxWidth: '460px', margin: '0 auto', background: '#0f172a', borderRadius: '26px', padding: '12px', display: 'flex', justifyContent: 'space-around', zIndex: 100 },
  navButton: { background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' },
  navButtonActive: { color: 'white' },
  scanBtn: { background: '#2563eb', color: 'white', borderRadius: '50%', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  loginPage: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#2563eb', padding: '20px' },
  loginCard: { background: 'white', padding: '40px', borderRadius: '30px', width: '100%', maxWidth: '350px', textAlign: 'center' },
  loginHeader: { marginBottom: '30px' },
  loginTitle: { fontSize: '28px', fontWeight: '900', margin: 0 },
  loginSubtitle: { color: '#94a3b8', fontSize: '14px' },
  loginToggle: { display: 'flex', gap: '5px', background: '#f1f5f9', padding: '5px', borderRadius: '12px', marginBottom: '20px' },
  toggleBtn: { flex: 1, padding: '10px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  toggleBtnActive: { background: 'white', color: '#2563eb', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
  input: { width: '100%', padding: '15px', marginBottom: '10px', borderRadius: '12px', border: '1px solid #e2e8f0', boxSizing: 'border-box' },
  btnPrimary: { width: '100%', padding: '15px', borderRadius: '12px', border: 'none', background: '#2563eb', color: 'white', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  loadingScreen: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  spinner: { animation: 'spin 1s linear infinite' },
  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' },
  statCard: { background: 'white', padding: '20px', borderRadius: '20px', border: '1px solid #e2e8f0' },
  statCardPrimary: { background: '#2563eb', color: 'white' },
  statCardLabel: { fontSize: '12px', margin: 0, opacity: 0.8 },
  statCardValue: { fontSize: '24px', margin: '5px 0' },
  collectionCard: { background: 'white', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '1px solid #f1f5f9' },
  collectionHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px' },
  tagOk: { background: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' },
  tagWarn: { background: '#fee2e2', color: '#991b1b', padding: '4px 8px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' },
  memberCard: { background: 'white', padding: '15px', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px', cursor: 'pointer' },
  qrThumbnail: { width: '50px', height: '50px', borderRadius: '8px' },
  amount: { fontWeight: '800', fontSize: '18px' },
  dashboardTabs: { display: 'flex', gap: '10px', marginBottom: '20px' },
  dashboardTab: { flex: 1, padding: '12px', border: 'none', borderRadius: '10px', background: 'white', cursor: 'pointer' },
  dashboardTabActive: { background: '#2563eb', color: 'white' },
  searchBar: { position: 'relative', marginBottom: '15px' },
  searchInput: { width: '100%', padding: '15px 15px 15px 45px', borderRadius: '12px', border: '1px solid #e2e8f0', boxSizing: 'border-box' },
  cardForm: { background: 'white', padding: '25px', borderRadius: '20px' },
  employeeCard: { padding: '10px', borderBottom: '1px solid #eee' },
  successCard: { background: 'white', padding: '40px', borderRadius: '25px' },
  scannerCard: { background: 'white', padding: '20px', borderRadius: '25px' }
};

// Add CSS for spinner
if (typeof document !== 'undefined') {
  const styleTag = document.createElement('style');
  styleTag.innerHTML = `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`;
  document.head.appendChild(styleTag);
}
