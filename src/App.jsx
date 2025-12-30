import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Scanner } from '@yudiel/react-qr-scanner';
import {
  Users, UserPlus, MapPin, LayoutDashboard, LogOut,
  CheckCircle, Loader2, Landmark, X, Camera, RefreshCw, Trash2,
  DollarSign, UserCheck
} from 'lucide-react';

/* ===================== CONFIG ===================== */
const SUPABASE_URL = 'https://watrosnylvkiuvuptdtp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhdHJvc255bHZraXV2dXB0ZHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MzE2NzEsImV4cCI6MjA4MjUwNzY3MX0.ku6_Ngf2JRJ8fxLs_Q-EySgCU37MjUK3WofpO9bazds';
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

const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
const formatTime = (dateString) => new Date(dateString).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

/* ===================== MAIN APP ===================== */
export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [view, setView] = useState('dashboard');
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loginMode, setLoginMode] = useState('admin');

  const [members, setMembers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ totalRevenue: 0, todayRevenue: 0, activeMembers: 0 });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [memRes, agentRes, transRes] = await Promise.all([
        supabase.from('contributors').select('*'),
        supabase.from('employees').select('*'),
        supabase.from('transactions').select('*').order('created_at', { ascending: false })
      ]);

      setMembers(memRes.data || []);
      setAgents(agentRes.data || []);
      setTransactions(transRes.data || []);

      const today = new Date().toISOString().slice(0, 10);
      const totalRev = (transRes.data || []).reduce((sum, t) => sum + (t.amount || 0), 0);
      const todayRev = (transRes.data || [])
        .filter(t => t.created_at?.slice(0, 10) === today)
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      setStats({
        totalRevenue: totalRev,
        todayRevenue: todayRev,
        activeMembers: memRes.data?.length || 0
      });
    } catch (err) {
      console.error("Data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const username = e.target.username.value.trim();
    const password = e.target.password.value;

    if (loginMode === 'admin') {
      if (username === 'oreofe' && password === 'oreofe') {
        setUser({ id: 'admin' });
        setProfile({ id: 'admin', full_name: 'Oreofe Owner', role: 'admin' });
      } else {
        alert('Invalid Admin Credentials');
      }
      setLoading(false);
    } else {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('employee_id_number', username)
        .eq('password', password)
        .single();

      if (error || !data) {
        alert('Agent Access Denied');
      } else {
        setUser({ id: data.id });
        setProfile({ ...data, role: 'employee' });
      }
      setLoading(false);
    }
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
            <div style={styles.profileAvatar}>{profile?.full_name?.charAt(0)}</div>
            <span>{profile?.full_name?.split(' ')[0]}</span>
          </div>
        </header>

        <main style={styles.contentArea}>
          {profile?.role === 'admin' ? (
            <>
              {view === 'dashboard' && <OwnerDashboard stats={stats} transactions={transactions} onRefresh={fetchData} />}
              {view === 'members' && <MemberManagement members={members} userLocation={userLocation} onRefresh={fetchData} />}
              {view === 'employees' && <AgentManagement agents={agents} onRefresh={fetchData} />}
              {view === 'transactions' && <TransactionHistory transactions={transactions} members={members} agents={agents} />}
            </>
          ) : (
            <CollectionInterface profile={profile} userLocation={userLocation} onRefresh={fetchData} />
          )}
        </main>

        <nav style={styles.bottomNav}>
          <button onClick={() => setView('dashboard')} style={{...styles.navButton, ...(view === 'dashboard' ? styles.navButtonActive : {})}}>
            <LayoutDashboard size={20} /><span>Home</span>
          </button>
          {profile?.role === 'admin' && (
            <>
              <button onClick={() => setView('members')} style={{...styles.navButton, ...(view === 'members' ? styles.navButtonActive : {})}}>
                <Users size={20} /><span>Members</span>
              </button>
              <button onClick={() => setView('employees')} style={{...styles.navButton, ...(view === 'employees' ? styles.navButtonActive : {})}}>
                <UserCheck size={20} /><span>Agents</span>
              </button>
              <button onClick={() => setView('transactions')} style={{...styles.navButton, ...(view === 'transactions' ? styles.navButtonActive : {})}}>
                <DollarSign size={20} /><span>Logs</span>
              </button>
            </>
          )}
          <button onClick={() => { setUser(null); setProfile(null); }} style={styles.navButton}>
            <LogOut size={20} /><span>Exit</span>
          </button>
        </nav>
      </LocationGate>
    </div>
  );
}

/* ==================== LOCATION GATE ==================== */
const LocationGate = ({ children, onLocationUpdate }) => {
  const [status, setStatus] = useState('waiting');
  const [errorDetails, setErrorDetails] = useState('');
  const watchIdRef = useRef(null);

  const requestGPS = () => {
    setStatus('locating');
    if (!navigator.geolocation) {
      setStatus('denied');
      setErrorDetails('Geolocation not supported.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onLocationUpdate({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy });
        setStatus('ready');
        watchIdRef.current = navigator.geolocation.watchPosition(
          (p) => onLocationUpdate({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy }),
          null,
          { enableHighAccuracy: true }
        );
      },
      (err) => { setStatus('denied'); setErrorDetails(err.message); },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  useEffect(() => () => watchIdRef.current && navigator.geolocation.clearWatch(watchIdRef.current), []);

  if (status !== 'ready') {
    return (
      <div style={styles.fullState}>
        <MapPin size={60} color="#3b82f6" />
        <h2>{status === 'waiting' ? 'GPS Required' : status === 'locating' ? 'Locking GPS' : 'GPS Error'}</h2>
        <p style={styles.gpsSubtext}>{status === 'denied' ? errorDetails : 'Required for collection verification.'}</p>
        {status !== 'locating' && <button onClick={requestGPS} style={styles.btnPrimary}>ENABLE GPS</button>}
        {status === 'locating' && <Loader2 size={32} style={styles.spinner} />}
      </div>
    );
  }
  return children;
};

/* ==================== AGENT COLLECTION ==================== */
const CollectionInterface = ({ profile, userLocation, onRefresh }) => {
  const [result, setResult] = useState(null);
  const [scanning, setScanning] = useState(false);

  const handleScan = async (data) => {
    if (!data) return;
    try {
      const parsed = JSON.parse(data);
      const { data: member, error: memErr } = await supabase.from('contributors').select('*').eq('id', parsed.id).single();
      
      if (memErr || !member) throw new Error('Member not found');

      const dist = calculateDistance(userLocation.lat, userLocation.lng, member.gps_latitude, member.gps_longitude);
      const verified = dist <= GEOFENCE_RADIUS_METERS;

      const { error: insErr } = await supabase.from('transactions').insert([{
        contributor_id: member.id,
        contributor_name: member.full_name,
        employee_id: profile.id,
        amount: member.expected_amount,
        geofence_verified: verified,
        gps_latitude: userLocation.lat,
        gps_longitude: userLocation.lng,
        distance_from_registered: Math.round(dist),
        ajo_owner_id: 'admin'
      }]);

      if (insErr) throw insErr;

      setResult({ name: member.full_name, amount: member.expected_amount, verified, distance: Math.round(dist) });
      setScanning(false);
      onRefresh();
    } catch (e) {
      alert('Invalid Member QR Code');
    }
  };

  if (result) {
    return (
      <div style={styles.successCard}>
        <CheckCircle size={80} color="#10b981" />
        <h1 style={{fontSize: 40, margin: '20px 0'}}>₦{result.amount}</h1>
        <p>{result.name}</p>
        <div style={result.verified ? styles.badgeSuccess : styles.badgeWarning}>
          {result.verified ? 'VERIFIED ON-SITE' : 'REMOTE COLLECTION'}
        </div>
        <button onClick={() => setResult(null)} style={{...styles.btnPrimary, marginTop: 40, width: '100%'}}>NEXT CUSTOMER</button>
      </div>
    );
  }

  return (
    <div style={styles.scannerCard}>
      {!scanning ? (
        <div style={{textAlign: 'center', padding: '40px 0'}}>
          <Camera size={80} color="#3b82f6" />
          <h2 style={{marginTop: 20}}>Ready to Collect</h2>
          <p style={{color: '#64748b', marginBottom: 30}}>Accuracy: {Math.round(userLocation?.accuracy || 0)}m</p>
          <button onClick={() => setScanning(true)} style={styles.btnPrimary}>OPEN SCANNER</button>
        </div>
      ) : (
        <div style={styles.scannerContainer}>
          <Scanner 
            onScan={(detected) => detected.length > 0 && handleScan(detected[0].rawValue)}
            styles={{ container: { width: '100%', aspectRatio: '1/1' } }}
          />
          <button onClick={() => setScanning(false)} style={styles.closeBtn}><X size={24} /></button>
        </div>
      )}
    </div>
  );
};

/* ==================== OWNER COMPONENTS ==================== */
const OwnerDashboard = ({ stats, transactions, onRefresh }) => (
  <div style={styles.fadeIn}>
    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 20}}>
      <h2 style={{fontWeight: 900}}>Dashboard</h2>
      <button onClick={onRefresh} style={styles.btnIcon}><RefreshCw size={20} /></button>
    </div>
    <div style={styles.statsGrid}>
      <div style={{...styles.statCard, ...styles.statCardPrimary}}>
        <p>Today</p><h3>₦{stats.todayRevenue.toLocaleString()}</h3>
      </div>
      <div style={styles.statCard}>
        <p>Members</p><h3>{stats.activeMembers}</h3>
      </div>
    </div>
    <h3 style={{margin: '20px 0'}}>Recent Activity</h3>
    <div style={styles.transactionList}>
      {transactions.slice(0, 5).map(t => (
        <div key={t.id} style={styles.transItem}>
          <div>
            <p style={{fontWeight: 700}}>{t.contributor_name || 'Payment'}</p>
            <p style={{fontSize: 12, color: '#94a3b8'}}>{formatTime(t.created_at)}</p>
          </div>
          <p style={{fontWeight: 900}}>₦{t.amount}</p>
        </div>
      ))}
    </div>
  </div>
);

const MemberManagement = ({ members, userLocation, onRefresh }) => {
  const [adding, setAdding] = useState(false);
  
  const handleAdd = async (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const amount = e.target.amount.value;
    
    const { error } = await supabase.from('contributors').insert([{
      full_name: name,
      expected_amount: Number(amount),
      gps_latitude: userLocation.lat,
      gps_longitude: userLocation.lng,
      ajo_owner_id: 'admin'
    }]);

    if (!error) { setAdding(false); onRefresh(); }
    else alert('Error adding member');
  };

  return (
    <div style={styles.fadeIn}>
      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 20}}>
        <h2>Members</h2>
        <button onClick={() => setAdding(true)} style={styles.btnPrimary}><UserPlus size={18} /> Add</button>
      </div>

      {adding && (
        <form onSubmit={handleAdd} style={styles.cardForm}>
          <input name="name" placeholder="Member Name" style={styles.input} required />
          <input name="amount" type="number" placeholder="Daily Amount" style={styles.input} required />
          <p style={{fontSize: 12, color: '#3b82f6', marginBottom: 15}}>Location will be pinned to your current GPS.</p>
          <div style={{display: 'flex', gap: 10}}>
            <button type="submit" style={styles.btnPrimary}>Save</button>
            <button type="button" onClick={() => setAdding(false)} style={styles.btnSecondary}>Cancel</button>
          </div>
        </form>
      )}

      {members.map(m => (
        <div key={m.id} style={styles.memberItem}>
          <div>
            <p style={{fontWeight: 700}}>{m.full_name}</p>
            <p style={{fontSize: 12, color: '#64748b'}}>ID: {m.id.slice(0,8)}</p>
          </div>
          <button onClick={async () => { if(confirm('Delete?')) { await supabase.from('contributors').delete().eq('id', m.id); onRefresh(); }}} style={styles.btnDanger}><Trash2 size={16}/></button>
        </div>
      ))}
    </div>
  );
};

const AgentManagement = ({ agents, onRefresh }) => {
  const [adding, setAdding] = useState(false);
  
  const handleAdd = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('employees').insert([{
      full_name: e.target.name.value,
      employee_id_number: e.target.idNum.value,
      password: e.target.pass.value,
      ajo_owner_id: 'admin'
    }]);
    if (!error) { setAdding(false); onRefresh(); }
  };

  return (
    <div style={styles.fadeIn}>
      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 20}}>
        <h2>Agents</h2>
        <button onClick={() => setAdding(true)} style={styles.btnPrimary}><UserPlus size={18} /> New Agent</button>
      </div>
      {adding && (
        <form onSubmit={handleAdd} style={styles.cardForm}>
          <input name="name" placeholder="Agent Full Name" style={styles.input} required />
          <input name="idNum" placeholder="Login ID" style={styles.input} required />
          <input name="pass" placeholder="Password" style={styles.input} required />
          <button type="submit" style={styles.btnPrimary}>Create Agent</button>
        </form>
      )}
      {agents.map(a => (
        <div key={a.id} style={styles.memberItem}>
          <p style={{fontWeight: 700}}>{a.full_name}</p>
          <p style={{fontSize: 12, color: '#64748b'}}>ID: {a.employee_id_number}</p>
        </div>
      ))}
    </div>
  );
};

const TransactionHistory = ({ transactions }) => (
  <div style={styles.fadeIn}>
    <h2 style={{marginBottom: 20}}>Transaction Logs</h2>
    {transactions.map(t => (
      <div key={t.id} style={styles.transItemFull}>
        <div style={{flex: 1}}>
          <p style={{fontWeight: 700}}>{t.contributor_name || 'Member'}</p>
          <p style={{fontSize: 11, color: '#94a3b8'}}>{formatDate(t.created_at)} • {formatTime(t.created_at)}</p>
        </div>
        <div style={{textAlign: 'right'}}>
          <p style={{fontWeight: 900}}>₦{t.amount}</p>
          <p style={{fontSize: 10, color: t.geofence_verified ? '#34d399' : '#f87171'}}>
            {t.geofence_verified ? 'Verified' : 'Remote'}
          </p>
        </div>
      </div>
    ))}
  </div>
);

const LoginScreen = ({ onLogin, loading, loginMode, setLoginMode }) => (
  <div style={styles.loginPage}>
    <div style={styles.loginCard}>
      <Landmark size={48} color="#3b82f6" />
      <h1 style={{margin: '15px 0'}}>AJO PRO</h1>
      <div style={styles.toggleRow}>
        <button onClick={() => setLoginMode('admin')} style={{...styles.toggleBtn, ...(loginMode === 'admin' ? styles.toggleActive : {})}}>OWNER</button>
        <button onClick={() => setLoginMode('agent')} style={{...styles.toggleBtn, ...(loginMode === 'agent' ? styles.toggleActive : {})}}>AGENT</button>
      </div>
      <form onSubmit={onLogin}>
        <input name="username" placeholder="Username / ID" style={styles.input} required />
        <input name="password" type="password" placeholder="Password" style={styles.input} required />
        <button type="submit" disabled={loading} style={{...styles.btnPrimary, width: '100%'}}>
          {loading ? 'AUTHENTICATING...' : 'SIGN IN'}
        </button>
      </form>
    </div>
  </div>
);

/* ==================== STYLES ==================== */
const styles = {
  appContainer: { minHeight: '100vh', background: '#020617', color: '#fff', fontFamily: 'system-ui, sans-serif' },
  appHeader: { height: 60, padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0f172a', borderBottom: '1px solid #1e293b', position: 'sticky', top: 0, zIndex: 10 },
  brand: { display: 'flex', alignItems: 'center', gap: 8 },
  logoDot: { width: 10, height: 10, background: '#3b82f6', borderRadius: '50%' },
  brandH1: { fontSize: 18, fontWeight: 900, letterSpacing: -0.5 },
  brandSpan: { color: '#3b82f6' },
  profilePill: { display: 'flex', alignItems: 'center', gap: 8, background: '#1e293b', padding: '5px 12px', borderRadius: 20, fontSize: 12 },
  profileAvatar: { width: 22, height: 22, background: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 10 },
  contentArea: { padding: 20, paddingBottom: 100 },
  bottomNav: { position: 'fixed', bottom: 0, left: 0, right: 0, height: 70, background: '#0f172a', display: 'flex', justifyContent: 'space-around', alignItems: 'center', borderTop: '1px solid #1e293b', paddingBottom: 5 },
  navButton: { background: 'none', border: 'none', color: '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 600 },
  navButtonActive: { color: '#3b82f6' },
  fullState: { height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 30, textAlign: 'center' },
  gpsSubtext: { color: '#94a3b8', margin: '10px 0 25px', fontSize: 14 },
  btnPrimary: { padding: '12px 20px', background: '#3b82f6', border: 'none', color: '#fff', borderRadius: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 },
  btnSecondary: { padding: '12px 20px', background: '#1e293b', border: 'none', color: '#fff', borderRadius: 10, fontWeight: 700 },
  btnDanger: { background: '#7f1d1d', border: 'none', color: '#fca5a5', padding: 8, borderRadius: 8 },
  btnIcon: { background: 'none', border: 'none', color: '#64748b' },
  scannerCard: { background: '#0f172a', borderRadius: 24, padding: 20, border: '1px solid #1e293b' },
  scannerContainer: { position: 'relative', borderRadius: 16, overflow: 'hidden', background: '#000' },
  closeBtn: { position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', padding: 8, borderRadius: '50%' },
  successCard: { textAlign: 'center', padding: 30, background: '#0f172a', borderRadius: 24, border: '1px solid #1e293b' },
  badgeSuccess: { background: '#064e3b', color: '#34d399', padding: '8px 16px', borderRadius: 20, fontSize: 12, fontWeight: 800, marginTop: 10, display: 'inline-block' },
  badgeWarning: { background: '#450a0a', color: '#f87171', padding: '8px 16px', borderRadius: 20, fontSize: 12, fontWeight: 800, marginTop: 10, display: 'inline-block' },
  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 },
  statCard: { background: '#0f172a', padding: 20, borderRadius: 20, border: '1px solid #1e293b' },
  statCardPrimary: { background: '#3b82f6' },
  cardForm: { background: '#0f172a', padding: 20, borderRadius: 20, marginBottom: 20, border: '1px solid #3b82f6' },
  input: { width: '100%', padding: 12, background: '#020617', border: '1px solid #1e293b', borderRadius: 10, color: '#fff', marginBottom: 12, fontSize: 14 },
  loginPage: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  loginCard: { width: '100%', maxWidth: 360, padding: 30, background: '#0f172a', borderRadius: 24, textAlign: 'center', border: '1px solid #1e293b' },
  toggleRow: { display: 'flex', background: '#020617', padding: 4, borderRadius: 12, marginBottom: 20 },
  toggleBtn: { flex: 1, padding: 10, background: 'none', border: 'none', color: '#64748b', borderRadius: 8, fontWeight: 700, fontSize: 12 },
  toggleActive: { background: '#3b82f6', color: '#fff' },
  spinner: { animation: 'spin 1s linear infinite' },
  fadeIn: { animation: 'fadeIn 0.3s ease-out' },
  transactionList: { display: 'flex', flexDirection: 'column', gap: 10 },
  transItem: { background: '#0f172a', padding: 12, borderRadius: 12, border: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  transItemFull: { background: '#0f172a', padding: 15, borderRadius: 12, border: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  memberItem: { background: '#0f172a', padding: 12, borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, border: '1px solid #1e293b' }
};

// Keyframes
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
  `;
  document.head.appendChild(style);
}
