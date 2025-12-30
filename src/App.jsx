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
  if (!lat1 || !lon1 || !lat2 || !lon2) return 999999;
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
    // Load Scanner Library
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js";
    script.async = true;
    document.head.appendChild(script);

    // Global Styles & Animations
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
      @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
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

// --- PRODUCTION LOCATION GATE ---
const LocationGate = ({ children, onLocationUpdate }) => {
  const [status, setStatus] = useState('waiting'); 
  const [errorDetails, setErrorDetails] = useState('');
  const watchIdRef = useRef(null);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const requestGPS = async () => {
    setStatus('locating');

    if (!navigator.geolocation) {
      setStatus('denied');
      setErrorDetails('Geolocation not supported by this browser.');
      return;
    }

    try {
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        if (permission.state === 'denied') {
          setStatus('denied');
          setErrorDetails('Location permission denied. Please reset permissions in browser settings.');
          return;
        }
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      };

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy
          };

          if (coords.accuracy > 150) {
            setErrorDetails('Signal too weak (Accuracy: ' + Math.round(coords.accuracy) + 'm). Move outdoors.');
            setStatus('locating'); 
            return;
          }

          onLocationUpdate(coords);
          setStatus('ready');

          watchIdRef.current = navigator.geolocation.watchPosition(
            (p) => {
              onLocationUpdate({
                lat: p.coords.latitude,
                lng: p.coords.longitude,
                accuracy: p.coords.accuracy
              });
            },
            null,
            { enableHighAccuracy: true, maximumAge: 0 }
          );
        },
        (err) => {
          setStatus('denied');
          setErrorDetails(err.message);
        },
        options
      );
    } catch (err) {
      setStatus('denied');
      setErrorDetails(err.message);
    }
  };

  if (status !== 'ready') {
    return (
      <div style={styles.fullState}>
        <MapPin size={60} color="#3b82f6" />
        <h2 style={{ marginTop: 20 }}>
          {status === 'waiting' && 'GPS Required'}
          {status === 'locating' && 'Acquiring GPS Lock'}
          {status === 'denied' && 'GPS Blocked'}
        </h2>
        <p style={styles.gpsSubtext}>
          {status === 'waiting' && 'Authorize location to access the collection system.'}
          {status === 'locating' && 'Stand outdoors or near a window for a satellite lock.'}
          {status === 'denied' && errorDetails}
        </p>
        {(status === 'waiting' || status === 'denied') && (
          <button onClick={requestGPS} style={styles.btnPrimary}>ENABLE GPS</button>
        )}
        {status === 'locating' && <Loader2 size={32} style={styles.spinner} />}
      </div>
    );
  }

  return children;
};

// --- COLLECTION INTERFACE (SCANNER) ---
const CollectionInterface = ({ profile, userLocation }) => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [processing, setProcessing] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const startScan = async () => {
    // 🛡️ GPS STABILITY GUARD
    if (!userLocation || userLocation.accuracy > 150) {
      alert("GPS not stable (Accuracy: " + Math.round(userLocation?.accuracy || 0) + "m). Move outdoors and wait for lock.");
      return;
    }

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
    } catch (e) { alert("Camera access denied."); }
  };

  const tick = () => {
    if (videoRef.current?.readyState === videoRef.current?.HAVE_ENOUGH_DATA && !processing) {
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
    if (scanning && !result) requestAnimationFrame(tick);
  };

  const handleScan = async (data) => {
    setProcessing(true);
    try {
      const parsed = JSON.parse(data);
      const { data: member } = await supabase.from('contributors').select('*').eq('id', parsed.id).single();
      
      if (!member) throw new Error("Unknown Member QR");

      // 🛡️ MEMBER GPS GUARD
      if (!member.gps_latitude || !member.gps_longitude) {
        alert("This member has no registered home GPS coordinates.");
        setProcessing(false);
        return;
      }

      const dist = calculateDistance(userLocation.lat, userLocation.lng, member.gps_latitude, member.gps_longitude);
      const verified = dist <= GEOFENCE_RADIUS_METERS;

      await supabase.from('transactions').insert([{
        contributor_id: member.id, employee_id: profile.id, amount: member.expected_amount,
        geofence_verified: verified, gps_latitude: userLocation.lat, gps_longitude: userLocation.lng,
        distance_from_registered: Math.round(dist), ajo_owner_id: 'admin'
      }]);

      setResult({ name: member.full_name, amount: member.expected_amount, verified });
    } catch (e) { alert("Invalid QR Code."); setProcessing(false); }
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
      <p style={{fontSize: 18}}>{result.name}</p>
      <div style={result.verified ? styles.badgeSuccess : styles.badgeWarning}>
        {result.verified ? '✓ VERIFIED AT SITE' : '⚠ REMOTE COLLECTION'}
      </div>
      <button onClick={() => {setResult(null); setProcessing(false);}} style={{...styles.btnPrimary, marginTop: 40}}>CONTINUE</button>
    </div>
  );

  return (
    <div style={styles.scannerCard}>
      {!scanning ? (
        <div style={{textAlign: 'center', padding: '40px 0'}}>
          <Scan size={100} color="#3b82f6" />
          <h2 style={{marginTop: 20}}>Ready to Scan</h2>
          <p style={{color: '#64748b', marginBottom: 30}}>GPS Accuracy: {Math.round(userLocation?.accuracy)}m</p>
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

// --- OTHER DASHBOARD COMPONENTS ---
const OwnerDashboard = () => (
  <div style={styles.fadeIn}>
    <div style={styles.statsGrid}>
      <div style={{...styles.statCard, ...styles.statCardPrimary}}><p>Daily Revenue</p><h2>₦240,500</h2></div>
      <div style={styles.statCard}><p>Active Members</p><h2>84</h2></div>
    </div>
    <p style={{textAlign: 'center', color: '#64748b'}}>AJO-PRO Monitoring Active</p>
  </div>
);

const MemberRegistration = () => (
  <form style={styles.cardForm}>
    <h3>New Registration</h3>
    <input placeholder="Name" style={styles.input} />
    <input placeholder="Amount" style={styles.input} />
    <button style={styles.btnPrimary}>Capture GPS & Register</button>
  </form>
);

const EmployeeManagement = () => <div style={styles.cardForm}><h3>Agent List</h3><p>System verified agents: 4</p></div>;

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
        <button disabled={loading} style={styles.btnPrimary}>{loading ? 'LOGGING IN...' : 'LOGIN'}</button>
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
  fullState: { height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, textAlign: 'center' },
  gpsSubtext: { color: '#94a3b8', margin: '15px 40px 30px' },
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
