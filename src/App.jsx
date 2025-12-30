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

// Haversine Distance Calculation
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

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
    return { street: 'Unknown Location', area: '', full: `${lat.toFixed(6)}, ${lng.toFixed(6)}` };
  } catch (err) {
    return { street: 'Location unavailable', area: '', full: `${lat.toFixed(6)}, ${lng.toFixed(6)}` };
  }
};

export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [view, setView] = useState('dashboard');
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loginMode, setLoginMode] = useState('admin');

  // Inject jsQR and Animations
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js";
    script.async = true;
    document.head.appendChild(script);

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
          const ownerData = { id: 'admin', full_name: 'Oreofe Owner', role: 'admin' };
          setUser({ id: 'admin' });
          setProfile(ownerData);
        } else { alert("Invalid Admin credentials"); }
      } else {
        const { data: employee } = await supabase.from('employees').select('*').eq('employee_id_number', username).eq('password', password).single();
        if (employee) {
          setUser({ id: employee.id });
          setProfile({ ...employee, role: 'employee' });
        } else { alert("Invalid Employee credentials"); }
      }
    } catch (err) { alert("Login failed"); }
    finally { setLoading(false); }
  };

  const handleLogout = () => { setUser(null); setProfile(null); setView('dashboard'); };

  if (!user) return <LoginScreen onLogin={handleLogin} loading={loading} loginMode={loginMode} setLoginMode={setLoginMode} />;

  return (
    <div style={styles.appContainer}>
      <LocationGate onLocationUpdate={setUserLocation}>
        <header style={styles.appHeader}>
          <div style={styles.brand}><div style={styles.logoDot} /><h1 style={styles.brandH1}>AJO<span style={styles.brandSpan}>PRO</span></h1></div>
          <div style={styles.profilePill}>
            <div style={styles.profileAvatar}>{profile?.full_name?.charAt(0).toUpperCase()}</div>
            <span>{profile?.full_name?.split(' ')[0]}</span>
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
          <button onClick={() => setView('dashboard')} style={{...styles.navButton, ...(view === 'dashboard' ? styles.navButtonActive : {})}}>
            <LayoutDashboard size={20} /><span style={styles.navLabel}>Dashboard</span>
          </button>
          {profile?.role === 'admin' ? (
            <>
              <button onClick={() => setView('members')} style={{...styles.navButton, ...(view === 'members' ? styles.navButtonActive : {})}}>
                <UserPlus size={20} /><span style={styles.navLabel}>Members</span>
              </button>
              <button onClick={() => setView('employees')} style={{...styles.navButton, ...(view === 'employees' ? styles.navButtonActive : {})}}>
                <Settings size={20} /><span style={styles.navLabel}>Agents</span>
              </button>
            </>
          ) : (
            <button onClick={() => setView('dashboard')} style={{...styles.navButton, ...styles.scanBtn}}>
              <Scan size={20} /><span style={styles.navLabel}>Scan</span>
            </button>
          )}
          <button onClick={handleLogout} style={styles.navButton}><LogOut size={20} /><span style={styles.navLabel}>Logout</span></button>
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
    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        onLocationUpdate(location);
        const geocoded = await reverseGeocode(location.lat, location.lng);
        setAddress(geocoded.street);
        setHasLocation(true);
        setLocationDenied(false);
      },
      () => { setHasLocation(true); setLocationDenied(true); },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [onLocationUpdate]);

  if (!hasLocation) return (
    <div style={styles.loadingScreen}>
      <Navigation size={56} style={{color: '#3b82f6', marginBottom: 24}} />
      <Loader2 size={40} style={styles.spinner} />
      <p>Acquiring Precise GPS...</p>
    </div>
  );

  return (
    <>
      {locationDenied && <div style={styles.locationWarning}><AlertCircle size={16} /><span>GPS Access Denied</span></div>}
      {!locationDenied && address && <div style={styles.locationBanner}><MapPin size={14} /><span>{address}</span></div>}
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
  const [stats, setStats] = useState({ totalCollections: 0, totalAmount: 0, todayCollections: 0, todayAmount: 0, verifiedCount: 0, remoteCount: 0 });

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
        const qrCode = await QRCode.toDataURL(qrData, { width: 200, margin: 2, color: { dark: '#1e293b', light: '#ffffff' } });
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
          setCollectionAddresses(p => ({ ...p, [col.id]: addr }));
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

  const filteredMembers = members.filter(m => m.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || m.registration_no.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredCollections = collections.filter(c => c.contributors?.full_name.toLowerCase().includes(searchTerm.toLowerCase()));

  const printMemberCard = (member) => {
    const win = window.open('', '_blank');
    win.document.write(`<html><head><title>Print ID</title><style>body{font-family:sans-serif;text-align:center;padding:50px}.card{border:2px solid #000;padding:20px;display:inline-block;border-radius:15px}img{width:200px}</style></head><body><div class="card"><h1>AJO-PRO</h1><img src="${qrCodes[member.id]}"/><h2>${member.full_name}</h2><p>ID: ${member.registration_no}</p></div></body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 500);
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
            <div style={{...styles.statCard, ...styles.statCardPrimary}}><p style={styles.statCardLabel}>Today's Revenue</p><h2 style={styles.statCardValue}>₦{stats.todayAmount.toLocaleString()}</h2></div>
            <div style={styles.statCard}><p style={styles.statCardLabel}>Total Verified</p><h2 style={styles.statCardValue}>{stats.verifiedCount}</h2></div>
          </div>
          <div style={styles.searchBar}><Search size={18} /><input placeholder="Search history..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={styles.searchInput} /></div>
          <div style={styles.collectionsList}>
            {filteredCollections.map(c => (
              <div key={c.id} style={styles.collectionCard}>
                <div style={styles.collectionHeader}>
                  <div style={styles.collectionMemberInfo}><div style={styles.collectionAvatar}>{c.contributors?.full_name[0]}</div><strong>{c.contributors?.full_name}</strong></div>
                  <div style={styles.collectionAmount}>₦{c.amount}</div>
                </div>
                <div style={styles.collectionDetails}>
                   <span>Agent: {c.employees?.full_name}</span>
                   <span>📍 {collectionAddresses[c.id]?.street || 'Locating...'}</span>
                </div>
                <div style={styles.collectionFooter}><span style={c.geofence_verified ? styles.badgeSuccess : styles.badgeWarning}>{c.geofence_verified ? '✓ Verified' : '⚠ Remote'}</span></div>
              </div>
            ))}
          </div>
        </>
      ) : (
        selectedMember ? <MemberDetailView member={selectedMember} qrCode={qrCodes[selectedMember.id]} onBack={() => setSelectedMember(null)} printMemberCard={printMemberCard} /> : (
          <>
            <div style={styles.searchBar}><Search size={18} /><input placeholder="Search members..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={styles.searchInput} /></div>
            <div style={styles.membersList}>
              {filteredMembers.map(m => (
                <div key={m.id} style={styles.memberCard} onClick={() => setSelectedMember(m)}>
                  <div style={styles.memberCardCenter}><strong style={styles.memberCardName}>{m.full_name}</strong><span>{m.registration_no}</span></div>
                  <div style={styles.memberCardRight}><strong>₦{m.expected_amount}</strong><Eye size={16} color="#3b82f6" /></div>
                </div>
              ))}
            </div>
          </>
        )
      )}
    </div>
  );
};

// --- MEMBER DETAIL VIEW ---
const MemberDetailView = ({ member, qrCode, onBack, printMemberCard }) => (
  <div style={styles.fadeIn}>
    <button onClick={onBack} style={styles.backBtn}>← Back to List</button>
    <div style={styles.memberDetailCard}>
      <div style={styles.qrSection}><img src={qrCode} style={styles.qrImageLarge} /></div>
      <h2>{member.full_name}</h2>
      <div style={styles.memberInfoGrid}>
        <div style={styles.infoItem}><span style={styles.infoLabel}>ID Number</span><span>{member.registration_no}</span></div>
        <div style={styles.infoItem}><span style={styles.infoLabel}>Daily Target</span><span>₦{member.expected_amount}</span></div>
        <div style={styles.infoItem}><span style={styles.infoLabel}>Home GPS</span><span>Captured</span></div>
      </div>
      <button onClick={() => printMemberCard(member)} style={styles.btnPrimary}><Printer size={18} /> Print Member ID</button>
    </div>
  </div>
);

// --- MEMBER REGISTRATION ---
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
        address: fd.get('address'),
        expected_amount: fd.get('amount'),
        registration_no: 'AJO' + Date.now().toString().slice(-6),
        gps_latitude: pos.coords.latitude,
        gps_longitude: pos.coords.longitude,
        ajo_owner_id: 'admin',
        status: 'active'
      }]);
      if (!error) { alert("Member Registered Successfully!"); e.target.reset(); }
      setLoading(false);
    });
  };

  return (
    <form style={styles.cardForm} onSubmit={handleSubmit}>
      <h3 style={styles.formTitle}>📝 Register New Member</h3>
      <input name="name" placeholder="Full Name" required style={styles.input} />
      <input name="phone" placeholder="Phone Number" required style={styles.input} />
      <input name="address" placeholder="Physical Address" required style={styles.input} />
      <input name="amount" type="number" placeholder="Daily Amount (₦)" required style={styles.input} />
      <button disabled={loading} style={styles.btnPrimary}>{loading ? <Loader2 style={styles.spinner}/> : 'Capture GPS & Register'}</button>
    </form>
  );
};

// --- EMPLOYEE MANAGEMENT ---
const EmployeeManagement = () => {
  const [emps, setEmps] = useState([]);
  useEffect(() => {
    supabase.from('employees').select('*').then(({ data }) => setEmps(data || []));
  }, []);

  const addAgent = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const { error } = await supabase.from('employees').insert([{
      full_name: fd.get('name'),
      employee_id_number: 'EMP' + Math.floor(Math.random() * 1000),
      password: fd.get('pass'),
      ajo_owner_id: 'admin'
    }]);
    if (!error) window.location.reload();
  };

  return (
    <div style={styles.cardForm}>
      <h3 style={styles.formTitle}>👥 Field Agents</h3>
      <form onSubmit={addAgent} style={{marginBottom: 20}}>
        <input name="name" placeholder="Agent Name" style={styles.input} required />
        <input name="pass" placeholder="Password" style={styles.input} required />
        <button style={styles.btnPrimary}>Add New Agent</button>
      </form>
      <div style={styles.employeeList}>
        {emps.map(e => (
          <div key={e.id} style={styles.employeeCard}>
            <div style={styles.employeeAvatar}>{e.full_name[0]}</div>
            <div style={styles.employeeInfo}><strong>{e.full_name}</strong><span>ID: {e.employee_id_number}</span></div>
            <span style={styles.badgeSuccess}>Active</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- COLLECTION INTERFACE (FIXED SCANNER) ---
const CollectionInterface = ({ profile, userLocation }) => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      setScanning(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        requestAnimationFrame(tick);
      }
    } catch (err) { alert("Camera Permission Required"); }
  };

  const tick = () => {
    if (videoRef.current?.readyState === videoRef.current?.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = window.jsQR ? window.jsQR(imageData.data, imageData.width, imageData.height) : null;

      if (code && !isProcessing) {
        setIsProcessing(true);
        processScan(code.data);
        return;
      }
    }
    if (scanning && !result) requestAnimationFrame(tick);
  };

  const processScan = async (data) => {
    try {
      const parsed = JSON.parse(data);
      const { data: member } = await supabase.from('contributors').select('*').eq('id', parsed.id).single();
      if (!member) throw new Error("Member unknown");

      const dist = calculateDistance(userLocation.lat, userLocation.lng, member.gps_latitude, member.gps_longitude);
      const verified = dist <= GEOFENCE_RADIUS_METERS;

      const { error } = await supabase.from('transactions').insert([{
        contributor_id: member.id,
        employee_id: profile.id,
        amount: member.expected_amount,
        geofence_verified: verified,
        gps_latitude: userLocation.lat,
        gps_longitude: userLocation.lng,
        distance_from_registered: Math.round(dist),
        ajo_owner_id: 'admin'
      }]);

      if (!error) setResult({ name: member.full_name, amount: member.expected_amount, verified });
    } catch (e) { alert("Invalid QR Code"); setIsProcessing(false); }
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    setScanning(false);
  };

  if (result) return (
    <div style={styles.successCard}>
      <CheckCircle size={64} color="#10b981" />
      <h2>Collection Logged</h2>
      <h1 style={{fontSize: 42, margin: '10px 0'}}>₦{result.amount}</h1>
      <p>{result.name}</p>
      <div style={result.verified ? styles.badgeSuccessLarge : styles.badgeWarningLarge}>{result.verified ? '✓ Location Verified' : '⚠ Remote Collection'}</div>
      <button onClick={() => {setResult(null); setIsProcessing(false);}} style={{...styles.btnPrimary, marginTop: 20}}>Scan Next</button>
    </div>
  );

  return (
    <div style={styles.scannerCard}>
      {!scanning ? (
        <div style={{textAlign: 'center'}}>
          <Scan size={80} color="#3b82f6" style={{marginBottom: 20}} />
          <h3>Agent Terminal</h3>
          <p style={{color: '#94a3b8', marginBottom: 20}}>Position camera over member's QR code</p>
          <button onClick={startScanning} style={styles.btnPrimary}><Camera size={20} /> Open Camera</button>
        </div>
      ) : (
        <div style={styles.scannerContainer}>
          <video ref={videoRef} style={styles.scannerVideo} playsInline />
          <canvas ref={canvasRef} style={{display: 'none'}} />
          <button onClick={() => {setScanning(false); if(streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());}} style={styles.closeScan}><X /></button>
        </div>
      )}
    </div>
  );
};

// --- LOGIN SCREEN ---
const LoginScreen = ({ onLogin, loading, loginMode, setLoginMode }) => (
  <div style={styles.loginPage}>
    <div style={styles.loginCard}>
      <Landmark size={48} color="#3b82f6" />
      <h2 style={{margin: '10px 0 30px'}}>AJO-PRO SECURE</h2>
      <div style={styles.loginToggle}>
        <button onClick={() => setLoginMode('admin')} style={{...styles.toggleBtn, ...(loginMode === 'admin' ? styles.toggleBtnActive : {})}}>Owner</button>
        <button onClick={() => setLoginMode('agent')} style={{...styles.toggleBtn, ...(loginMode === 'agent' ? styles.toggleBtnActive : {})}}>Agent</button>
      </div>
      <form onSubmit={onLogin}>
        <input name="username" placeholder="Username / ID" style={styles.input} required />
        <input name="password" type="password" placeholder="Password" style={styles.input} required />
        <button disabled={loading} style={styles.btnPrimary}>{loading ? <Loader2 style={styles.spinner} /> : 'Login System'}</button>
      </form>
    </div>
  </div>
);

// --- STYLES ---
const styles = {
  appContainer: { minHeight: '100vh', background: '#020617', color: '#f8fafc', fontFamily: 'sans-serif' },
  appHeader: { height: 65, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', background: '#0f172a', borderBottom: '1px solid #1e293b' },
  brand: { display: 'flex', alignItems: 'center', gap: 10 },
  logoDot: { width: 12, height: 12, background: '#22d3ee', borderRadius: '50%', boxShadow: '0 0 10px #22d3ee' },
  brandH1: { fontSize: 20, fontWeight: 900 },
  brandSpan: { color: '#3b82f6' },
  profilePill: { display: 'flex', alignItems: 'center', gap: 8, background: '#1e293b', padding: '5px 12px', borderRadius: 20, fontSize: 13 },
  profileAvatar: { width: 24, height: 24, background: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900 },
  contentArea: { padding: 20, paddingBottom: 100 },
  bottomNav: { position: 'fixed', bottom: 0, width: '100%', height: 75, background: '#0f172a', display: 'flex', justifyContent: 'space-around', alignItems: 'center', borderTop: '1px solid #1e293b' },
  navButton: { background: 'none', border: 'none', color: '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 },
  navButtonActive: { color: '#22d3ee' },
  navLabel: { fontSize: 10, fontWeight: 700 },
  scanBtn: { color: '#22d3ee' },
  locationBanner: { background: '#1e293b', padding: '8px 20px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 8, color: '#22d3ee' },
  locationWarning: { background: '#450a0a', padding: '8px 20px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 8, color: '#f87171' },
  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginBottom: 20 },
  statCard: { background: '#0f172a', padding: 20, borderRadius: 20, border: '1px solid #1e293b' },
  statCardPrimary: { background: '#3b82f6', color: '#fff' },
  statCardLabel: { fontSize: 12, opacity: 0.8 },
  statCardValue: { fontSize: 24, fontWeight: 900 },
  dashboardTabs: { display: 'flex', gap: 10, marginBottom: 20 },
  dashboardTab: { flex: 1, padding: 12, background: '#0f172a', border: '1px solid #1e293b', color: '#fff', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' },
  dashboardTabActive: { background: '#3b82f6', borderColor: '#3b82f6' },
  searchBar: { display: 'flex', alignItems: 'center', gap: 10, background: '#0f172a', padding: '12px 15px', borderRadius: 15, marginBottom: 20, border: '1px solid #1e293b' },
  searchInput: { background: 'none', border: 'none', color: '#fff', width: '100%', outline: 'none' },
  collectionCard: { background: '#0f172a', padding: 15, borderRadius: 20, marginBottom: 12, border: '1px solid #1e293b' },
  collectionHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: 10 },
  collectionMemberInfo: { display: 'flex', alignItems: 'center', gap: 10 },
  collectionAvatar: { width: 30, height: 30, background: '#1e293b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  collectionAmount: { fontWeight: 900, color: '#22d3ee' },
  collectionDetails: { fontSize: 12, color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: 4 },
  collectionFooter: { marginTop: 10 },
  badgeSuccess: { background: '#064e3b', color: '#34d399', padding: '4px 10px', borderRadius: 10, fontSize: 10, fontWeight: 700 },
  badgeWarning: { background: '#450a0a', color: '#f87171', padding: '4px 10px', borderRadius: 10, fontSize: 10, fontWeight: 700 },
  membersList: { display: 'flex', flexDirection: 'column', gap: 10 },
  memberCard: { background: '#0f172a', padding: 15, borderRadius: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #1e293b' },
  memberCardCenter: { display: 'flex', flexDirection: 'column', gap: 4 },
  memberCardName: { fontSize: 16 },
  memberCardRight: { display: 'flex', alignItems: 'center', gap: 10 },
  memberDetailCard: { background: '#0f172a', padding: 30, borderRadius: 25, border: '1px solid #1e293b', textAlign: 'center' },
  qrSection: { background: '#fff', padding: 15, borderRadius: 20, display: 'inline-block', marginBottom: 20 },
  qrImageLarge: { width: 180, height: 180 },
  memberInfoGrid: { textAlign: 'left', marginBottom: 30 },
  infoItem: { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #1e293b' },
  infoLabel: { color: '#64748b' },
  backBtn: { background: 'none', border: 'none', color: '#3b82f6', marginBottom: 20, fontWeight: 700 },
  cardForm: { background: '#0f172a', padding: 25, borderRadius: 25, border: '1px solid #1e293b' },
  formTitle: { marginBottom: 20 },
  input: { width: '100%', padding: 14, background: '#020617', border: '1px solid #1e293b', borderRadius: 12, color: '#fff', marginBottom: 15, boxSizing: 'border-box' },
  btnPrimary: { width: '100%', padding: 16, background: '#3b82f6', border: 'none', color: '#fff', borderRadius: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer' },
  employeeList: { display: 'flex', flexDirection: 'column', gap: 10 },
  employeeCard: { background: '#1e293b', padding: 15, borderRadius: 15, display: 'flex', alignItems: 'center', gap: 15 },
  employeeAvatar: { width: 35, height: 35, background: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 },
  employeeInfo: { flex: 1, display: 'flex', flexDirection: 'column' },
  scannerCard: { background: '#0f172a', padding: 30, borderRadius: 30, border: '1px solid #1e293b' },
  scannerContainer: { position: 'relative', background: '#000', borderRadius: 20, overflow: 'hidden' },
  scannerVideo: { width: '100%', display: 'block' },
  closeScan: { position: 'absolute', top: 15, right: 15, background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', padding: 8, borderRadius: '50%' },
  successCard: { background: '#0f172a', padding: 40, borderRadius: 30, border: '1px solid #1e293b', textAlign: 'center' },
  badgeSuccessLarge: { background: '#064e3b', color: '#34d399', padding: '10px 20px', borderRadius: 20, fontWeight: 700, marginTop: 15 },
  badgeWarningLarge: { background: '#450a0a', color: '#f87171', padding: '10px 20px', borderRadius: 20, fontWeight: 700, marginTop: 15 },
  loginPage: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  loginCard: { background: '#0f172a', padding: 40, borderRadius: 30, width: '100%', maxWidth: 400, textAlign: 'center', border: '1px solid #1e293b' },
  loginToggle: { display: 'flex', background: '#020617', padding: 5, borderRadius: 15, marginBottom: 30 },
  toggleBtn: { flex: 1, padding: 10, background: 'none', border: 'none', color: '#64748b', borderRadius: 12 },
  toggleBtnActive: { background: '#3b82f6', color: '#fff' },
  loadingScreen: { height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 },
  spinner: { animation: 'spin 1s linear infinite' },
  fadeIn: { animation: 'fadeIn 0.4s ease-out' }
};
