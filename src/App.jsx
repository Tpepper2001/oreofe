import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import QRCode from 'qrcode';
import { 
  Users, UserPlus, MapPin, Scan, LayoutDashboard, 
  Settings, LogOut, CheckCircle, Loader2, ShieldCheck, Landmark, Printer, 
  AlertCircle, Eye, Search, TrendingUp, Camera, X, Navigation, RefreshCw
} from 'lucide-react';

/* ===================== CONFIG ===================== */
const SUPABASE_URL = 'https://watrosnylvkiuvuptdtp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhdHJvc255bHZraXV2dXB0ZHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MzE2NzEsImV4cCI6MjA4MjUwNzY3MX0.ku6_Ngf2JRJ8fxLs_Q-EySgCU37MjUK3WofpO9bazds';
const GOOGLE_MAPS_API_KEY = 'AIzaSyBBiTuUQiNVQnDjUsYOtDFYvXBf4haVoo4'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const GEOFENCE_RADIUS_METERS = 100;

/* ===================== UTILS ===================== */

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; 
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [view, setView] = useState('dashboard');
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loginMode, setLoginMode] = useState('admin');

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js";
    script.async = true;
    document.head.appendChild(script);

    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
      @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
      .scanner-laser { position: absolute; top: 0; left: 0; right: 0; height: 3px; background: #ef4444; box-shadow: 0 0 15px #ef4444; animation: scanMove 2s infinite linear; z-index: 10; }
      @keyframes scanMove { 0% { top: 5% } 100% { top: 95% } }
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
          <button onClick={() => { setUser(null); window.location.reload(); }} style={styles.navButton}><LogOut size={20} /><span>Exit</span></button>
        </nav>
      </LocationGate>
    </div>
  );
}

// --- UPDATED LOCATION GATE (ROBUST GPS) ---
const LocationGate = ({ children, onLocationUpdate }) => {
  const [status, setStatus] = useState('waiting'); // 'waiting', 'locating', 'ready', 'denied'
  const [errorDetails, setErrorDetails] = useState('');

  const startGPS = (highAccuracy = true) => {
    setStatus('locating');
    
    if (!navigator.geolocation) {
      setStatus('denied');
      setErrorDetails("Your browser is too old to support GPS.");
      return;
    }

    const options = {
      enableHighAccuracy: highAccuracy,
      timeout: 20000, 
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onLocationUpdate({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStatus('ready');
        // Switch to continuous watch once first lock is found
        navigator.geolocation.watchPosition(
          (p) => onLocationUpdate({ lat: p.coords.latitude, lng: p.coords.longitude }),
          null,
          { enableHighAccuracy: true }
        );
      },
      (err) => {
        console.error("GPS Error:", err);
        if (highAccuracy) {
          // If Satellite failed, try Network/Wifi (Low Accuracy)
          console.log("Retrying with standard accuracy...");
          startGPS(false);
        } else {
          if (err.code === 1) setStatus('denied');
          else setStatus('denied');
          setErrorDetails(err.message);
        }
      },
      options
    );
  };

  if (status === 'waiting' || status === 'locating') return (
    <div style={styles.fullState}>
      <div style={styles.gpsPulse}><MapPin size={60} color="#3b82f6" /></div>
      <h2 style={{marginTop: 20}}>{status === 'waiting' ? 'Secure GPS Link' : 'Connecting...'}</h2>
      <p style={styles.gpsSubtext}>
        {status === 'waiting' 
          ? 'Agents must be physically present at collection points to proceed.' 
          : 'Attempting to lock satellite signal. Stand near a window or outdoors.'}
      </p>
      {status === 'waiting' && (
        <button onClick={() => startGPS(true)} style={styles.btnPrimary}>
          <Navigation size={20} /> ENABLE SYSTEM GPS
        </button>
      )}
      {status === 'locating' && <Loader2 size={30} style={styles.spinner} color="#22d3ee" />}
    </div>
  );

  if (status === 'denied') return (
    <div style={styles.fullState}>
      <AlertCircle size={60} color="#ef4444" />
      <h2 style={{marginTop: 20}}>GPS Access Blocked</h2>
      <div style={styles.instructionBox}>
        <p>1. Tap the <strong>Lock Icon</strong> 🔒 next to the website URL.</p>
        <p>2. Set <strong>Location</strong> to "Allow".</p>
        <p>3. Refresh this page.</p>
      </div>
      <p style={{fontSize: 12, color: '#64748b', marginBottom: 20}}>Error: {errorDetails}</p>
      <button onClick={() => window.location.reload()} style={styles.btnPrimary}>
        <RefreshCw size={20} /> REFRESH SYSTEM
      </button>
    </div>
  );

  return children;
};

// --- SCANNING COMPONENT ---
const CollectionInterface = ({ profile, userLocation }) => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const startScan = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      streamRef.current = stream;
      setScanning(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        requestAnimationFrame(tick);
      }
    } catch (e) { alert("Enable camera in settings to scan."); }
  };

  const tick = () => {
    if (videoRef.current?.readyState === videoRef.current?.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = window.jsQR ? window.jsQR(img.data, img.width, img.height) : null;

      if (code) {
        handleScan(code.data);
        return;
      }
    }
    if (!result && scanning) requestAnimationFrame(tick);
  };

  const handleScan = async (data) => {
    try {
      const parsed = JSON.parse(data);
      const { data: member } = await supabase.from('contributors').select('*').eq('id', parsed.id).single();
      
      const dist = calculateDistance(userLocation.lat, userLocation.lng, member.gps_latitude, member.gps_longitude);
      const verified = dist <= GEOFENCE_RADIUS_METERS;

      await supabase.from('transactions').insert([{
        contributor_id: member.id, employee_id: profile.id, amount: member.expected_amount,
        geofence_verified: verified, gps_latitude: userLocation.lat, gps_longitude: userLocation.lng,
        distance_from_registered: Math.round(dist), ajo_owner_id: 'admin'
      }]);

      setResult({ name: member.full_name, amount: member.expected_amount, verified });
    } catch (e) { alert("Invalid QR Code"); }
    stopCamera();
  };

  const stopCamera = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    setScanning(false);
  };

  if (result) return (
    <div style={styles.successCard}>
      <CheckCircle size={80} color="#10b981" />
      <h1 style={{fontSize: 40, margin: '20px 0'}}>₦{result.amount}</h1>
      <p style={{fontSize: 20, fontWeight: 700}}>{result.name}</p>
      <div style={result.verified ? styles.badgeSuccess : styles.badgeWarning}>
        {result.verified ? '✓ LOCATION VERIFIED' : '⚠ REMOTE COLLECTION'}
      </div>
      <button onClick={() => setResult(null)} style={{...styles.btnPrimary, marginTop: 40}}>NEXT SCAN</button>
    </div>
  );

  return (
    <div style={styles.scannerCard}>
      {!scanning ? (
        <div style={{textAlign: 'center', padding: '40px 0'}}>
          <Scan size={100} color="#3b82f6" />
          <h2 style={{marginTop: 20}}>Scan Member ID</h2>
          <p style={{color: '#64748b', marginBottom: 30}}>GPS Connection: Stable ✅</p>
          <button onClick={startScan} style={styles.btnPrimary}><Camera /> OPEN CAMERA</button>
        </div>
      ) : (
        <div style={styles.scannerContainer}>
          <video ref={videoRef} style={styles.scannerVideo} playsInline />
          <div className="scanner-laser" />
          <canvas ref={canvasRef} style={{display: 'none'}} />
          <button onClick={stopCamera} style={styles.closeBtn}><X /></button>
        </div>
      )}
    </div>
  );
};

// --- COMPONENTS ---
const OwnerDashboard = () => (
    <div style={styles.fadeIn}>
      <div style={styles.statsGrid}>
        <div style={{...styles.statCard, ...styles.statCardPrimary}}><p>Revenue</p><h2>₦240,000</h2></div>
        <div style={styles.statCard}><p>Members</p><h2>48</h2></div>
      </div>
    </div>
);

const MemberRegistration = () => (
    <form style={styles.cardForm}>
      <h3>Member Registration</h3>
      <p style={{fontSize: 12, color: '#64748b', marginBottom: 20}}>You must be standing at the member's house to register.</p>
      <input placeholder="Full Name" style={styles.input} />
      <input placeholder="Phone" style={styles.input} />
      <button style={styles.btnPrimary}>CAPTURE HOME GPS & SAVE</button>
    </form>
);

const EmployeeManagement = () => <div style={styles.cardForm}><h3>Agent List</h3><p>Active Agents: 4</p></div>;

const LoginScreen = ({ onLogin, loading, loginMode, setLoginMode }) => (
  <div style={styles.loginPage}>
    <div style={styles.loginCard}>
      <Landmark size={50} color="#3b82f6" />
      <h1 style={{margin: '20px 0'}}>AJO-PRO</h1>
      <div style={styles.toggleRow}>
        <button onClick={() => setLoginMode('admin')} style={{...styles.toggleBtn, ...(loginMode === 'admin' ? styles.toggleActive : {})}}>OWNER</button>
        <button onClick={() => setLoginMode('agent')} style={{...styles.toggleBtn, ...(loginMode === 'agent' ? styles.toggleActive : {})}}>AGENT</button>
      </div>
      <form onSubmit={onLogin}>
        <input name="username" placeholder="ID Number" style={styles.input} required />
        <input name="password" type="password" placeholder="Password" style={styles.input} required />
        <button disabled={loading} style={styles.btnPrimary}>{loading ? 'VERIFYING...' : 'LOGIN SYSTEM'}</button>
      </form>
    </div>
  </div>
);

// --- STYLES ---
const styles = {
  appContainer: { minHeight: '100vh', background: '#020617', color: '#fff', fontFamily: 'sans-serif' },
  appHeader: { height: 65, padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0f172a', borderBottom: '1px solid #1e293b' },
  brand: { display: 'flex', alignItems: 'center', gap: 10 },
  logoDot: { width: 12, height: 12, background: '#22d3ee', borderRadius: '50%' },
  brandH1: { fontSize: 20, fontWeight: 900 },
  brandSpan: { color: '#3b82f6' },
  profilePill: { display: 'flex', alignItems: 'center', gap: 10, background: '#1e293b', padding: '6px 15px', borderRadius: 20, fontSize: 13 },
  profileAvatar: { width: 24, height: 24, background: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 },
  contentArea: { padding: 20, paddingBottom: 100 },
  bottomNav: { position: 'fixed', bottom: 0, width: '100%', height: 75, background: '#0f172a', display: 'flex', justifyContent: 'space-around', alignItems: 'center', borderTop: '1px solid #1e293b' },
  navButton: { background: 'none', border: 'none', color: '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 700 },
  navButtonActive: { color: '#22d3ee' },
  fullState: { height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 },
  gpsPulse: { animation: 'pulse 2s infinite' },
  gpsSubtext: { textAlign: 'center', color: '#94a3b8', margin: '15px 40px 30px' },
  instructionBox: { background: '#0f172a', padding: 20, borderRadius: 15, margin: '20px 0', border: '1px solid #1e293b', textAlign: 'left' },
  btnPrimary: { padding: '16px 30px', background: '#3b82f6', border: 'none', color: '#fff', borderRadius: 12, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' },
  scannerCard: { background: '#0f172a', borderRadius: 30, padding: 20, border: '1px solid #1e293b' },
  scannerContainer: { position: 'relative', overflow: 'hidden', borderRadius: 20, background: '#000' },
  scannerVideo: { width: '100%', display: 'block' },
  closeBtn: { position: 'absolute', top: 15, right: 15, background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', padding: 10, borderRadius: '50%' },
  successCard: { textAlign: 'center', padding: 40, background: '#0f172a', borderRadius: 30, border: '1px solid #1e293b' },
  badgeSuccess: { background: '#064e3b', color: '#34d399', padding: '10px 20px', borderRadius: 20, fontWeight: 900, marginTop: 15 },
  badgeWarning: { background: '#450a0a', color: '#f87171', padding: '10px 20px', borderRadius: 20, fontWeight: 900, marginTop: 15 },
  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 },
  statCard: { background: '#0f172a', padding: 20, borderRadius: 20, border: '1px solid #1e293b' },
  statCardPrimary: { background: '#3b82f6' },
  cardForm: { background: '#0f172a', padding: 25, borderRadius: 25, border: '1px solid #1e293b' },
  input: { width: '100%', padding: 15, background: '#020617', border: '1px solid #1e293b', borderRadius: 12, color: '#fff', marginBottom: 15, boxSizing: 'border-box' },
  loginPage: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  loginCard: { width: '100%', maxWidth: 400, padding: 40, background: '#0f172a', borderRadius: 35, textAlign: 'center', border: '1px solid #1e293b' },
  toggleRow: { display: 'flex', background: '#020617', padding: 5, borderRadius: 15, marginBottom: 25 },
  toggleBtn: { flex: 1, padding: 12, background: 'none', border: 'none', color: '#64748b', borderRadius: 12 },
  toggleActive: { background: '#3b82f6', color: '#fff' },
  spinner: { animation: 'spin 1s linear infinite' },
  fadeIn: { animation: 'fadeIn 0.4s ease' }
};
