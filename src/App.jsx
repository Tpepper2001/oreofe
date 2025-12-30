import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import QRCode from 'qrcode';
import { 
  Users, UserPlus, MapPin, Scan, LayoutDashboard, 
  Settings, LogOut, CheckCircle, Loader2, ShieldCheck, Landmark, Printer, 
  AlertCircle, Eye, Search, TrendingUp, Camera, X, Navigation
} from 'lucide-react';

/* ===================== CONFIG ===================== */
const SUPABASE_URL = 'https://watrosnylvkiuvuptdtp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhdHJvc255bHZraXV2dXB0ZHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MzE2NzEsImV4cCI6MjA4MjUwNzY3MX0.ku6_Ngf2JRJ8fxLs_Q-EySgCU37MjUK3WofpO9bazds';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const GEOFENCE_RADIUS_METERS = 100;

// Placeholder for jsQR - In a real app, import jsQR from 'jsqr'
const jsQR = window.jsQR || ((data, width, height) => null);

// Reverse Geocoding Function
const reverseGeocode = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
      { headers: { 'User-Agent': 'AJO-PRO-App' } }
    );
    const data = await response.json();
    
    if (data.address) {
      const { road, suburb, city, state } = data.address;
      return {
        street: road || suburb || 'Unknown Street',
        area: suburb || city || state || '',
        full: data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      };
    }
    return {
      street: 'Unknown Location',
      area: '',
      full: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    };
  } catch (err) {
    console.error('Geocoding error:', err);
    return {
      street: 'Location unavailable',
      area: '',
      full: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    };
  }
};

export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [view, setView] = useState('dashboard');
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loginMode, setLoginMode] = useState('admin');

  // Inject animations
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
      @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    `;
    document.head.appendChild(styleSheet);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const username = e.target.username.value;
      const password = e.target.password.value;

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

        if (error || !employee) {
          alert("Access Denied: Invalid employee credentials");
        } else {
          setUser({ id: employee.id });
          setProfile({ ...employee, role: 'employee' });
        }
      }
    } catch (err) {
      alert("Login failed: " + err.message);
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
      <LocationGate onLocationUpdate={setUserLocation}>
        <header style={styles.appHeader}>
          <div style={styles.brand}>
            <div style={styles.logoDot} />
            <h1 style={styles.brandH1}>AJO<span style={styles.brandSpan}>PRO</span></h1>
          </div>
          <div style={styles.profilePill}>
            <div style={styles.profileAvatar}>
              {profile?.full_name?.charAt(0).toUpperCase()}
            </div>
            <span>{profile?.full_name?.split(' ')[0] || 'User'}</span>
          </div>
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
            <LayoutDashboard size={20} />
            <span style={styles.navLabel}>Dashboard</span>
          </button>
          {profile?.role === 'admin' ? (
            <>
              <button 
                onClick={() => setView('members')} 
                style={{...styles.navButton, ...(view === 'members' ? styles.navButtonActive : {})}}
              >
                <UserPlus size={20} />
                <span style={styles.navLabel}>Members</span>
              </button>
              <button 
                onClick={() => setView('employees')} 
                style={{...styles.navButton, ...(view === 'employees' ? styles.navButtonActive : {})}}
              >
                <Settings size={20} />
                <span style={styles.navLabel}>Agents</span>
              </button>
            </>
          ) : (
            <button style={{...styles.navButton, ...styles.scanBtn}} onClick={() => setView('dashboard')}>
              <Scan size={20} />
              <span style={styles.navLabel}>Scan</span>
            </button>
          )}
          <button onClick={handleLogout} style={styles.navButton}>
            <LogOut size={20} />
            <span style={styles.navLabel}>Logout</span>
          </button>
        </nav>
      </LocationGate>
    </div>
  );
}

// --- LOCATION GATE ---
const LocationGate = ({ children, onLocationUpdate }) => {
  const [hasLocation, setHasLocation] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (!navigator.geolocation) {
      setHasLocation(true);
      setLocationDenied(true);
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        onLocationUpdate(location);
        const geocoded = await reverseGeocode(location.lat, location.lng);
        setAddress(geocoded.street);
        setHasLocation(true);
        setLocationDenied(false);
      },
      () => {
        setHasLocation(true);
        setLocationDenied(true);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [onLocationUpdate]);

  if (!hasLocation) {
    return (
      <div style={styles.loadingScreen}>
        <div style={styles.loadingContent}>
          <Navigation size={56} style={{color: '#3b82f6', marginBottom: 24}} />
          <Loader2 size={40} style={styles.spinner} />
          <p style={styles.loadingText}>Acquiring precise location...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {locationDenied && (
        <div style={styles.locationWarning}>
          <AlertCircle size={16} />
          <span>Location access denied. Some features may be limited.</span>
        </div>
      )}
      {!locationDenied && address && (
        <div style={styles.locationBanner}>
          <MapPin size={14} />
          <span>{address}</span>
        </div>
      )}
      {children}
    </>
  );
};

// --- OWNER DASHBOARD ---
const OwnerDashboard = () => {
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [qrCodes, setQrCodes] = useState({});
  const [dashboardView, setDashboardView] = useState('members');
  const [collections, setCollections] = useState([]);
  const [collectionAddresses, setCollectionAddresses] = useState({});
  const [stats, setStats] = useState({
    totalCollections: 0,
    totalAmount: 0,
    todayCollections: 0,
    todayAmount: 0,
    verifiedCount: 0,
    remoteCount: 0
  });

  useEffect(() => {
    loadMembers();
    loadCollections();
  }, []);

  const loadMembers = async () => {
    setLoading(true);
    const { data } = await supabase.from('contributors').select('*').order('created_at', { ascending: false });
    if (data) {
      setMembers(data);
      data.forEach(async (member) => {
        const qrData = JSON.stringify({ id: member.id, regNo: member.registration_no, name: member.full_name, amount: member.expected_amount });
        const qrCode = await QRCode.toDataURL(qrData, { width: 200, margin: 2 });
        setQrCodes(prev => ({ ...prev, [member.id]: qrCode }));
      });
    }
    setLoading(false);
  };

  const loadCollections = async () => {
    const { data } = await supabase.from('transactions').select('*, contributors(full_name, registration_no, phone_number, address), employees(full_name)').order('created_at', { ascending: false });
    if (data) {
      setCollections(data);
      data.forEach(async (col) => {
        if (col.gps_latitude) {
          const addr = await reverseGeocode(col.gps_latitude, col.gps_longitude);
          setCollectionAddresses(prev => ({ ...prev, [col.id]: addr }));
        }
      });
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

  const filteredMembers = members.filter(m => m.full_name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredCollections = collections.filter(c => c.contributors?.full_name.toLowerCase().includes(searchTerm.toLowerCase()));

  const printMemberCard = (member) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`<html><body><img src="${qrCodes[member.id]}" /><br/><h2>${member.full_name}</h2></body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div style={styles.fadeIn}>
      <div style={styles.dashboardTabs}>
        <button onClick={() => setDashboardView('members')} style={{...styles.dashboardTab, ...(dashboardView === 'members' ? styles.dashboardTabActive : {})}}><Users size={18} /><span>Members</span></button>
        <button onClick={() => setDashboardView('collections')} style={{...styles.dashboardTab, ...(dashboardView === 'collections' ? styles.dashboardTabActive : {})}}><TrendingUp size={18} /><span>Collections</span></button>
      </div>

      {dashboardView === 'collections' ? (
        <>
          <div style={styles.statsGrid}>
            <div style={{...styles.statCard, ...styles.statCardPrimary}}>
              <p style={styles.statCardLabel}>Today</p>
              <h2 style={styles.statCardValue}>₦{stats.todayAmount.toLocaleString()}</h2>
            </div>
            <div style={styles.statCard}>
              <p style={styles.statCardLabel}>Total</p>
              <h2 style={styles.statCardValue}>₦{stats.totalAmount.toLocaleString()}</h2>
            </div>
          </div>
          <div style={styles.collectionsList}>
            {filteredCollections.map(c => (
              <div key={c.id} style={styles.collectionCard}>
                <div style={styles.collectionHeader}>
                  <div style={styles.collectionMemberInfo}>
                    <div style={styles.collectionAvatar}>{c.contributors?.full_name[0]}</div>
                    <div style={styles.collectionName}>{c.contributors?.full_name}</div>
                  </div>
                  <div style={styles.collectionAmount}>₦{c.amount}</div>
                </div>
                <div style={styles.collectionFooter}>
                   <span style={c.geofence_verified ? styles.badgeSuccess : styles.badgeWarning}>
                    {c.geofence_verified ? 'Verified' : 'Remote'}
                   </span>
                   <span style={styles.detailValue}>{collectionAddresses[c.id]?.street}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {selectedMember ? (
            <MemberDetailView member={selectedMember} qrCode={qrCodes[selectedMember.id]} onBack={() => setSelectedMember(null)} printMemberCard={printMemberCard} />
          ) : (
            <div style={styles.membersList}>
              <div style={styles.searchBar}>
                <Search size={18} />
                <input placeholder="Search members..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={styles.searchInput} />
              </div>
              {filteredMembers.map(m => (
                <div key={m.id} style={styles.memberCard} onClick={() => setSelectedMember(m)}>
                  <div style={styles.memberCardCenter}>
                    <strong style={styles.memberCardName}>{m.full_name}</strong>
                    <span style={styles.memberCardId}>{m.registration_no}</span>
                  </div>
                  <div style={styles.memberCardRight}>
                    <div style={styles.memberAmount}>₦{m.expected_amount}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// --- MEMBER DETAIL VIEW ---
const MemberDetailView = ({ member, qrCode, onBack, printMemberCard }) => (
  <div style={styles.fadeIn}>
    <button onClick={onBack} style={styles.backBtn}>← Back</button>
    <div style={styles.memberDetailCard}>
      <div style={styles.qrSection}>
        <img src={qrCode} alt="QR" style={styles.qrImageLarge} />
      </div>
      <h2 style={styles.memberName}>{member.full_name}</h2>
      <div style={styles.memberInfoGrid}>
        <div style={styles.infoItem}><span style={styles.infoLabel}>ID</span><span>{member.registration_no}</span></div>
        <div style={styles.infoItem}><span style={styles.infoLabel}>Phone</span><span>{member.phone_number}</span></div>
      </div>
      <button onClick={() => printMemberCard(member)} style={styles.btnPrimary}><Printer size={18} /> Print Card</button>
    </div>
  </div>
);

// --- REGISTRATION ---
const MemberRegistration = () => {
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.target);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { error } = await supabase.from('contributors').insert([{
        full_name: fd.get('name'),
        phone_number: fd.get('phone'),
        expected_amount: fd.get('amount'),
        address: fd.get('address'),
        registration_no: 'AJO' + Date.now().toString().slice(-6),
        gps_latitude: pos.coords.latitude,
        gps_longitude: pos.coords.longitude
      }]);
      if (!error) alert("Registered!");
      setLoading(false);
    });
  };

  return (
    <form style={styles.cardForm} onSubmit={handleSubmit}>
      <h3 style={styles.formTitle}>New Member</h3>
      <input name="name" placeholder="Full Name" required style={styles.input} />
      <input name="phone" placeholder="Phone" required style={styles.input} />
      <input name="address" placeholder="Address" required style={styles.input} />
      <input name="amount" type="number" placeholder="Daily Amount" required style={styles.input} />
      <button disabled={loading} style={styles.btnPrimary}>{loading ? <Loader2 style={styles.spinner} /> : 'Register'}</button>
    </form>
  );
};

// --- EMPLOYEE MGMT ---
const EmployeeManagement = () => {
  const [emps, setEmps] = useState([]);
  useEffect(() => {
    supabase.from('employees').select('*').then(({ data }) => setEmps(data || []));
  }, []);

  return (
    <div style={styles.cardForm}>
      <h3 style={styles.formTitle}>Field Agents</h3>
      <div style={styles.employeeList}>
        {emps.map(e => (
          <div key={e.id} style={styles.employeeCard}>
            <div style={styles.employeeAvatar}>{e.full_name[0]}</div>
            <div style={styles.employeeInfo}>
              <strong>{e.full_name}</strong>
              <small>{e.employee_id_number}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- COLLECTION INTERFACE ---
const CollectionInterface = ({ profile, userLocation }) => {
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const startScanning = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    setScanning(true);
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play();
      requestAnimationFrame(tick);
    }
  };

  const tick = () => {
    if (videoRef.current?.readyState === videoRef.current?.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current;
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code) {
        alert("Scanned: " + code.data);
        setScanning(false);
        return;
      }
    }
    if (scanning) requestAnimationFrame(tick);
  };

  return (
    <div style={styles.scannerCard}>
      {scanning ? (
        <div style={styles.scannerContainer}>
          <video ref={videoRef} style={styles.scannerVideo} />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <button onClick={() => setScanning(false)} style={styles.btnSecondary}>Cancel</button>
        </div>
      ) : (
        <button onClick={startScanning} style={styles.btnPrimary}><Camera /> Start Scan</button>
      )}
    </div>
  );
};

// --- LOGIN ---
const LoginScreen = ({ onLogin, loading, loginMode, setLoginMode }) => (
  <div style={styles.loginPage}>
    <div style={styles.loginCard}>
      <div style={styles.loginHeader}>
        <Landmark size={48} />
        <h2 style={styles.loginTitle}>AJO-PRO</h2>
      </div>
      <div style={styles.loginToggle}>
        <button onClick={() => setLoginMode('admin')} style={{...styles.toggleBtn, ...(loginMode === 'admin' ? styles.toggleBtnActive : {})}}>Admin</button>
        <button onClick={() => setLoginMode('agent')} style={{...styles.toggleBtn, ...(loginMode === 'agent' ? styles.toggleBtnActive : {})}}>Agent</button>
      </div>
      <form onSubmit={onLogin} style={styles.loginForm}>
        <input name="username" placeholder="Username" style={styles.input} />
        <input name="password" type="password" placeholder="Password" style={styles.input} />
        <button disabled={loading} style={styles.btnPrimary}>Login</button>
      </form>
    </div>
  </div>
);

// --- STYLES ---
const styles = {
  appContainer: { minHeight: '100vh', background: '#020617', color: '#e5e7eb', fontFamily: 'sans-serif' },
  appHeader: { height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', borderBottom: '1px solid #1e293b' },
  brand: { display: 'flex', alignItems: 'center', gap: 10 },
  logoDot: { width: 12, height: 12, borderRadius: '50%', background: '#22d3ee' },
  brandH1: { fontSize: 20, fontWeight: 900 },
  brandSpan: { color: '#3b82f6' },
  profilePill: { display: 'flex', alignItems: 'center', gap: 8, background: '#1e293b', padding: '6px 12px', borderRadius: 20 },
  profileAvatar: { width: 24, height: 24, borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 },
  contentArea: { padding: 20, paddingBottom: 100 },
  bottomNav: { position: 'fixed', bottom: 0, left: 0, right: 0, height: 70, background: '#0f172a', display: 'flex', justifyContent: 'space-around', alignItems: 'center', borderTop: '1px solid #1e293b' },
  navButton: { background: 'none', border: 'none', color: '#94a3b8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  navButtonActive: { color: '#22d3ee' },
  scanBtn: { background: '#3b82f6', color: '#fff', padding: '10px 20px', borderRadius: 15 },
  navLabel: { fontSize: 10, fontWeight: 700 },
  
  // Dashboard & Stats
  dashboardTabs: { display: 'flex', gap: 10, marginBottom: 20 },
  dashboardTab: { flex: 1, padding: 12, background: '#1e293b', border: 'none', color: '#fff', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' },
  dashboardTabActive: { background: '#3b82f6' },
  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginBottom: 20 },
  statCard: { background: '#1e293b', padding: 15, borderRadius: 15 },
  statCardPrimary: { background: '#3b82f6' },
  statCardLabel: { fontSize: 12, opacity: 0.8 },
  statCardValue: { fontSize: 22, fontWeight: 900 },
  
  // Lists & Cards
  collectionsList: { display: 'flex', flexDirection: 'column', gap: 10 },
  collectionCard: { background: '#1e293b', padding: 15, borderRadius: 15 },
  collectionHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: 10 },
  collectionMemberInfo: { display: 'flex', alignItems: 'center', gap: 10 },
  collectionAvatar: { width: 32, height: 32, borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  collectionName: { fontWeight: 700 },
  collectionAmount: { fontWeight: 900, color: '#22d3ee' },
  collectionFooter: { display: 'flex', justifyContent: 'space-between', fontSize: 12 },
  
  membersList: { display: 'flex', flexDirection: 'column', gap: 10 },
  memberCard: { background: '#1e293b', padding: 15, borderRadius: 15, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  memberCardCenter: { display: 'flex', flexDirection: 'column' },
  memberCardName: { fontSize: 16 },
  memberCardId: { fontSize: 12, color: '#94a3b8' },
  memberCardRight: { textAlign: 'right' },
  memberAmount: { fontWeight: 700 },

  // Forms & Detail
  cardForm: { background: '#1e293b', padding: 20, borderRadius: 20 },
  formTitle: { marginBottom: 15 },
  input: { width: '100%', padding: 12, marginBottom: 10, borderRadius: 10, border: '1px solid #334155', background: '#0f172a', color: '#fff' },
  btnPrimary: { width: '100%', padding: 14, background: '#3b82f6', border: 'none', color: '#fff', borderRadius: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 },
  btnSecondary: { padding: 10, background: '#334155', border: 'none', color: '#fff', borderRadius: 8 },
  
  memberDetailCard: { background: '#1e293b', padding: 20, borderRadius: 20, textAlign: 'center' },
  qrSection: { background: '#fff', padding: 15, borderRadius: 15, display: 'inline-block', marginBottom: 20 },
  qrImageLarge: { width: 180, height: 180 },
  memberName: { marginBottom: 20 },
  memberInfoGrid: { textAlign: 'left', marginBottom: 20 },
  infoItem: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #334155' },
  infoLabel: { color: '#94a3b8' },
  backBtn: { background: 'none', border: 'none', color: '#3b82f6', marginBottom: 15 },

  // Login
  loginPage: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020617' },
  loginCard: { width: '100%', maxWidth: 360, padding: 30, background: '#0f172a', borderRadius: 25, textAlign: 'center' },
  loginHeader: { marginBottom: 30, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 },
  loginTitle: { fontSize: 28, fontWeight: 900 },
  loginToggle: { display: 'flex', background: '#1e293b', borderRadius: 12, padding: 4, marginBottom: 20 },
  toggleBtn: { flex: 1, padding: 8, background: 'none', border: 'none', color: '#94a3b8', borderRadius: 8 },
  toggleBtnActive: { background: '#3b82f6', color: '#fff' },
  
  // Misc
  loadingScreen: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' },
  locationBanner: { background: '#1e293b', padding: '8px 20px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 },
  locationWarning: { background: '#7f1d1d', padding: '8px 20px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 },
  searchBar: { display: 'flex', alignItems: 'center', gap: 10, background: '#0f172a', padding: '10px 15px', borderRadius: 10, marginBottom: 15 },
  searchInput: { background: 'none', border: 'none', color: '#fff', outline: 'none', width: '100%' },
  badgeSuccess: { background: '#065f46', color: '#34d399', padding: '2px 8px', borderRadius: 10, fontSize: 10 },
  badgeWarning: { background: '#7c2d12', color: '#fb923c', padding: '2px 8px', borderRadius: 10, fontSize: 10 },
  scannerCard: { textAlign: 'center' },
  scannerContainer: { position: 'relative', width: '100%', maxWidth: 400, margin: '0 auto' },
  scannerVideo: { width: '100%', borderRadius: 20, marginBottom: 20 },
  spinner: { animation: 'spin 1s linear infinite' },
  fadeIn: { animation: 'fadeIn 0.3s ease-out' }
};
