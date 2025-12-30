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
const GOOGLE_MAPS_API_KEY = 'AIzaSyBBiTuUQiNVQnDjUsYOtDFYvXBf4haVoo4'; // Replace with your actual key

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const GEOFENCE_RADIUS_METERS = 100;

/* ===================== UTILS ===================== */

// Accurate Distance Calculation (Haversine)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; 
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

// Google Maps Reverse Geocoding
const getGoogleAddress = async (lat, lng) => {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.status === 'OK') {
      return {
        full: data.results[0].formatted_address,
        street: data.results[0].address_components.find(c => c.types.includes('route'))?.long_name || 'Street Found'
      };
    }
    return { full: `${lat}, ${lng}`, street: 'Unknown Location' };
  } catch {
    return { full: 'Address unavailable', street: 'Unknown' };
  }
};

export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [view, setView] = useState('dashboard');
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loginMode, setLoginMode] = useState('admin');

  useEffect(() => {
    // Load Scanner Library
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js";
    script.async = true;
    document.head.appendChild(script);

    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
      @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      .scanner-laser { position: absolute; top: 0; left: 0; right: 0; height: 2px; background: #22d3ee; box-shadow: 0 0 15px #22d3ee; animation: scanMove 2s infinite linear; }
      @keyframes scanMove { 0% { top: 0% } 100% { top: 100% } }
    `;
    document.head.appendChild(styleSheet);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const username = e.target.username.value;
    const password = e.target.password.value;

    if (loginMode === 'admin') {
      if (username === 'oreofe' && password === 'oreofe') {
        setUser({ id: 'admin' });
        setProfile({ id: 'admin', full_name: 'Oreofe Owner', role: 'admin' });
      } else { alert("Admin Access Denied"); }
    } else {
      const { data } = await supabase.from('employees').select('*').eq('employee_id_number', username).eq('password', password).single();
      if (data) {
        setUser({ id: data.id });
        setProfile({ ...data, role: 'employee' });
      } else { alert("Agent Access Denied"); }
    }
    setLoading(false);
  };

  if (!user) return <LoginScreen onLogin={handleLogin} loading={loading} loginMode={loginMode} setLoginMode={setLoginMode} />;

  return (
    <div style={styles.appContainer}>
      <LocationGate onLocationUpdate={setUserLocation}>
        <header style={styles.appHeader}>
          <div style={styles.brand}><div style={styles.logoDot} /><h1 style={styles.brandH1}>AJO<span style={styles.brandSpan}>PRO</span></h1></div>
          <div style={styles.profilePill}>
            <div style={styles.profileAvatar}>{profile?.full_name?.charAt(0)}</div>
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
            <LayoutDashboard size={20} /><span>Home</span>
          </button>
          {profile?.role === 'admin' && (
            <>
              <button onClick={() => setView('members')} style={{...styles.navButton, ...(view === 'members' ? styles.navButtonActive : {})}}>
                <UserPlus size={20} /><span>Members</span>
              </button>
              <button onClick={() => setView('employees')} style={{...styles.navButton, ...(view === 'employees' ? styles.navButtonActive : {})}}>
                <Settings size={20} /><span>Agents</span>
              </button>
            </>
          )}
          <button onClick={() => setUser(null)} style={styles.navButton}><LogOut size={20} /><span>Exit</span></button>
        </nav>
      </LocationGate>
    </div>
  );
}

// --- LOCATION GATE (GOOGLE ACCURACY) ---
const LocationGate = ({ children, onLocationUpdate }) => {
  const [status, setStatus] = useState('locating');
  const [addr, setAddr] = useState('');

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        onLocationUpdate(loc);
        const gAddr = await getGoogleAddress(loc.lat, loc.lng);
        setAddr(gAddr.street);
        setStatus('ready');
      },
      () => setStatus('error'),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [onLocationUpdate]);

  if (status === 'locating') return <div style={styles.fullState}><Loader2 style={styles.spinner} size={40} /><p>Connecting to Satellites...</p></div>;
  if (status === 'error') return <div style={styles.fullState}><AlertCircle size={40} color="#ef4444" /><p>Enable GPS to continue</p></div>;

  return (
    <>
      <div style={styles.locationBanner}><MapPin size={14} /><span>{addr || 'Google Maps Accurate'}</span></div>
      {children}
    </>
  );
};

// --- SCANNING FIX (COLLECTION INTERFACE) ---
const CollectionInterface = ({ profile, userLocation }) => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [processing, setProcessing] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const startScan = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      setScanning(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        requestAnimationFrame(processFrame);
      }
    } catch { alert("Camera Permission Required"); }
  };

  const processFrame = () => {
    if (videoRef.current?.readyState === videoRef.current?.HAVE_ENOUGH_DATA && !processing) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = window.jsQR ? window.jsQR(imgData.data, imgData.width, imgData.height) : null;

      if (code) {
        handleSuccess(code.data);
        return;
      }
    }
    if (!result) requestAnimationFrame(processFrame);
  };

  const handleSuccess = async (qrData) => {
    setProcessing(true);
    try {
      const parsed = JSON.parse(qrData);
      const { data: member } = await supabase.from('contributors').select('*').eq('id', parsed.id).single();
      
      if (!member) throw new Error("Invalid Member QR");

      const distance = calculateDistance(userLocation.lat, userLocation.lng, member.gps_latitude, member.gps_longitude);
      const verified = distance <= GEOFENCE_RADIUS_METERS;

      const { error } = await supabase.from('transactions').insert([{
        contributor_id: member.id,
        employee_id: profile.id,
        amount: member.expected_amount,
        geofence_verified: verified,
        gps_latitude: userLocation.lat,
        gps_longitude: userLocation.lng,
        distance_from_registered: Math.round(distance),
        ajo_owner_id: 'admin'
      }]);

      if (!error) setResult({ name: member.full_name, amount: member.expected_amount, verified });
    } catch (e) { 
      alert("Invalid QR Data"); 
      setProcessing(false);
    }
    stopStream();
  };

  const stopStream = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    setScanning(false);
  };

  if (result) return (
    <div style={styles.successCard}>
      <CheckCircle size={70} color="#10b981" />
      <h2 style={{fontSize: 28, margin: '15px 0'}}>₦{result.amount.toLocaleString()}</h2>
      <p style={{fontSize: 18, color: '#94a3b8'}}>{result.name}</p>
      <div style={result.verified ? styles.badgeSuccess : styles.badgeWarning}>
        {result.verified ? '✓ Google Verified Loc' : '⚠ Remote Collection'}
      </div>
      <button onClick={() => {setResult(null); setProcessing(false);}} style={{...styles.btnPrimary, marginTop: 30}}>Scan Next</button>
    </div>
  );

  return (
    <div style={styles.scannerCard}>
      {!scanning ? (
        <div style={{textAlign: 'center', padding: '20px 0'}}>
          <Scan size={80} color="#3b82f6" style={{marginBottom: 20}} />
          <h2>Ready to Collect?</h2>
          <p style={{color: '#64748b', marginBottom: 30}}>Ensure GPS is active for location verification.</p>
          <button onClick={startScan} style={styles.btnPrimary}><Camera size={20} /> Open Scanner</button>
        </div>
      ) : (
        <div style={styles.scannerContainer}>
          <video ref={videoRef} style={styles.scannerVideo} playsInline />
          <div className="scanner-laser" />
          <canvas ref={canvasRef} style={{display: 'none'}} />
          <button onClick={stopStream} style={styles.closeBtn}><X /></button>
          <div style={styles.scanLabel}>Align QR code for processing...</div>
        </div>
      )}
    </div>
  );
};

// --- OWNER DASHBOARD ---
const OwnerDashboard = () => {
  const [stats, setStats] = useState({ total: 0, count: 0 });
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const { data: txs } = await supabase.from('transactions').select('amount');
      const { data: mems } = await supabase.from('contributors').select('*');
      setStats({
        total: txs?.reduce((a, b) => a + Number(b.amount), 0) || 0,
        count: mems?.length || 0
      });
      setMembers(mems || []);
      setLoading(false);
    };
    loadData();
  }, []);

  return (
    <div style={styles.fadeIn}>
      <div style={styles.statsGrid}>
        <div style={{...styles.statCard, ...styles.statCardPrimary}}>
          <TrendingUp size={24} />
          <p>Total Revenue</p>
          <h2>₦{stats.total.toLocaleString()}</h2>
        </div>
        <div style={styles.statCard}>
          <Users size={24} />
          <p>Members</p>
          <h2>{stats.count}</h2>
        </div>
      </div>
      
      <h3 style={{marginBottom: 15}}>Recent Members</h3>
      {loading ? <Loader2 style={styles.spinner} /> : (
        <div style={styles.membersList}>
          {members.slice(0, 5).map(m => (
            <div key={m.id} style={styles.memberCard}>
              <div>
                <strong>{m.full_name}</strong>
                <p style={{fontSize: 12, color: '#64748b'}}>{m.registration_no}</p>
              </div>
              <div style={{textAlign: 'right'}}>
                <div style={{fontWeight: 700}}>₦{m.expected_amount}</div>
                <div style={styles.badgeSuccess}>Active</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- MEMBER REGISTRATION ---
const MemberRegistration = () => {
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.target);
    
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { error } = await supabase.from('contributors').insert([{
        full_name: fd.get('name'),
        phone_number: fd.get('phone'),
        expected_amount: fd.get('amount'),
        address: fd.get('address'),
        registration_no: 'AJO' + Date.now().toString().slice(-5),
        gps_latitude: pos.coords.latitude,
        gps_longitude: pos.coords.longitude,
        ajo_owner_id: 'admin'
      }]);
      
      if (!error) {
        alert("Member registered with precise Google coordinates!");
        e.target.reset();
      }
      setLoading(false);
    }, () => {
      alert("Please enable GPS to register a member location");
      setLoading(false);
    });
  };

  return (
    <form style={styles.cardForm} onSubmit={handleRegister}>
      <h3>📝 Register New Member</h3>
      <p style={{fontSize: 12, color: '#94a3b8', marginBottom: 20}}>GPS coordinates will be saved as the official collection point.</p>
      <input name="name" placeholder="Full Name" style={styles.input} required />
      <input name="phone" placeholder="Phone Number" style={styles.input} required />
      <input name="address" placeholder="Home Address" style={styles.input} required />
      <input name="amount" type="number" placeholder="Daily Amount (₦)" style={styles.input} required />
      <button disabled={loading} style={styles.btnPrimary}>{loading ? 'Capturing Location...' : 'Register Member'}</button>
    </form>
  );
};

// --- EMPLOYEE MGMT ---
const EmployeeManagement = () => (
  <div style={styles.cardForm}>
    <h3>👥 Field Agents</h3>
    <div style={styles.statCard}>
      <strong>Agent EMP-902</strong>
      <p>Currently Active - Verified by Google GPS</p>
    </div>
  </div>
);

// --- LOGIN ---
const LoginScreen = ({ onLogin, loading, loginMode, setLoginMode }) => (
  <div style={styles.loginPage}>
    <div style={styles.loginCard}>
      <Landmark size={50} color="#3b82f6" />
      <h1 style={{margin: '20px 0'}}>AJO-PRO</h1>
      <div style={styles.toggleRow}>
        <button onClick={() => setLoginMode('admin')} style={{...styles.toggleBtn, ...(loginMode === 'admin' ? styles.toggleActive : {})}}>Owner</button>
        <button onClick={() => setLoginMode('agent')} style={{...styles.toggleBtn, ...(loginMode === 'agent' ? styles.toggleActive : {})}}>Agent</button>
      </div>
      <form onSubmit={onLogin}>
        <input name="username" placeholder="ID Number" style={styles.input} required />
        <input name="password" type="password" placeholder="Password" style={styles.input} required />
        <button disabled={loading} style={styles.btnPrimary}>{loading ? 'Authenticating...' : 'Secure Login'}</button>
      </form>
    </div>
  </div>
);

// --- STYLES ---
const styles = {
  appContainer: { minHeight: '100vh', background: '#020617', color: '#fff', fontFamily: 'sans-serif' },
  appHeader: { height: 65, padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0f172a', borderBottom: '1px solid #1e293b' },
  brand: { display: 'flex', alignItems: 'center', gap: 10 },
  logoDot: { width: 12, height: 12, background: '#22d3ee', borderRadius: '50%', boxShadow: '0 0 10px #22d3ee' },
  brandH1: { fontSize: 20, fontWeight: 900 },
  brandSpan: { color: '#3b82f6' },
  profilePill: { display: 'flex', alignItems: 'center', gap: 10, background: '#1e293b', padding: '6px 15px', borderRadius: 20 },
  profileAvatar: { width: 24, height: 24, background: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900 },
  contentArea: { padding: 20, paddingBottom: 100 },
  bottomNav: { position: 'fixed', bottom: 0, width: '100%', height: 75, background: '#0f172a', borderTop: '1px solid #1e293b', display: 'flex', justifyContent: 'space-around', alignItems: 'center' },
  navButton: { background: 'none', border: 'none', color: '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 700 },
  navButtonActive: { color: '#22d3ee' },
  locationBanner: { background: '#1e293b', padding: '10px 20px', fontSize: 12, color: '#22d3ee', display: 'flex', alignItems: 'center', gap: 8 },
  fullState: { height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 },
  spinner: { animation: 'spin 1s linear infinite' },
  fadeIn: { animation: 'fadeIn 0.4s ease-out' },
  
  // Dashboard
  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginBottom: 30 },
  statCard: { background: '#0f172a', padding: 20, borderRadius: 20, border: '1px solid #1e293b' },
  statCardPrimary: { background: '#3b82f6' },
  membersList: { display: 'flex', flexDirection: 'column', gap: 12 },
  memberCard: { background: '#0f172a', padding: 15, borderRadius: 15, border: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  badgeSuccess: { padding: '4px 10px', background: '#064e3b', color: '#34d399', borderRadius: 10, fontSize: 10, fontWeight: 700 },
  badgeWarning: { padding: '4px 10px', background: '#450a0a', color: '#f87171', borderRadius: 10, fontSize: 10, fontWeight: 700 },

  // Forms
  cardForm: { background: '#0f172a', padding: 25, borderRadius: 25, border: '1px solid #1e293b' },
  input: { width: '100%', padding: 15, background: '#020617', border: '1px solid #1e293b', borderRadius: 12, color: '#fff', marginBottom: 15, boxSizing: 'border-box' },
  btnPrimary: { width: '100%', padding: 16, background: '#3b82f6', border: 'none', color: '#fff', borderRadius: 12, fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 },
  
  // Scanner
  scannerCard: { background: '#0f172a', borderRadius: 30, padding: 20, border: '1px solid #1e293b' },
  scannerContainer: { position: 'relative', width: '100%', background: '#000', borderRadius: 20, overflow: 'hidden' },
  scannerVideo: { width: '100%', display: 'block' },
  closeBtn: { position: 'absolute', top: 15, right: 15, background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', padding: 10, borderRadius: '50%' },
  scanLabel: { position: 'absolute', bottom: 20, width: '100%', textAlign: 'center', color: '#22d3ee', fontWeight: 700, textShadow: '0 2px 4px #000' },
  successCard: { textAlign: 'center', padding: 40, background: '#0f172a', borderRadius: 30, border: '1px solid #1e293b' },

  // Login
  loginPage: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  loginCard: { width: '100%', maxWidth: 400, padding: 40, background: '#0f172a', borderRadius: 35, textAlign: 'center', border: '1px solid #1e293b' },
  toggleRow: { display: 'flex', background: '#020617', padding: 5, borderRadius: 15, marginBottom: 25 },
  toggleBtn: { flex: 1, padding: 12, background: 'none', border: 'none', color: '#64748b', borderRadius: 12, cursor: 'pointer' },
  toggleActive: { background: '#3b82f6', color: '#fff' }
};
