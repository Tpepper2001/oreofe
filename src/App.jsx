import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import QrReader from 'react-qr-reader';
import {
  Users, UserPlus, MapPin, LayoutDashboard, Settings, LogOut,
  CheckCircle, Loader2, Landmark, X, Camera, RefreshCw, Trash2,
  Edit, Save, AlertCircle, DollarSign, Calendar, Clock, UserCheck
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

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
};

/* ===================== MAIN APP ===================== */
export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [view, setView] = useState('dashboard');
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loginMode, setLoginMode] = useState('admin');

  // Global data for admin
  const [members, setMembers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ totalRevenue: 0, todayRevenue: 0, activeMembers: 0 });

  const fetchAdminData = async () => {
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

      // Calculate stats
      const today = new Date().toISOString().slice(0, 10);
      const todayTrans = (transRes.data || []).filter(t => t.created_at?.slice(0, 10) === today);
      const totalRev = (transRes.data || []).reduce((sum, t) => sum + (t.amount || 0), 0);
      const todayRev = todayTrans.reduce((sum, t) => sum + (t.amount || 0), 0);

      setStats({
        totalRevenue: totalRev,
        todayRevenue: todayRev,
        activeMembers: memRes.data?.length || 0
      });
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (profile?.role === 'admin') fetchAdminData();
  }, [profile]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const username = e.target.username.value.trim();
    const password = e.target.password.value;

    try {
      if (loginMode === 'admin') {
        if (username === 'oreofe' && password === 'oreofe') {
          setUser({ id: 'admin' });
          setProfile({ id: 'admin', full_name: 'Oreofe Owner', role: 'admin' });
        } else {
          alert('Admin Access Denied');
        }
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
      }
    } catch (err) {
      alert('Login error.');
      console.error(err);
    } finally {
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
              {view === 'dashboard' && <OwnerDashboard stats={stats} transactions={transactions} loading={loading} onRefresh={fetchAdminData} />}
              {view === 'members' && <MemberManagement members={members} userLocation={userLocation} onRefresh={fetchAdminData} />}
              {view === 'employees' && <AgentManagement agents={agents} onRefresh={fetchAdminData} />}
              {view === 'transactions' && <TransactionHistory transactions={transactions} members={members} agents={agents} />}
            </>
          ) : (
            <CollectionInterface profile={profile} userLocation={userLocation} onRefresh={fetchAdminData} />
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
                <DollarSign size={20} /><span>History</span>
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

    const options = { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy };
        onLocationUpdate(coords);
        setStatus('ready');

        watchIdRef.current = navigator.geolocation.watchPosition(
          (p) => onLocationUpdate({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy }),
          (err) => console.error(err),
          options
        );
      },
      (err) => {
        setStatus('denied');
        setErrorDetails(err.message || 'Unknown error');
      },
      options
    );
  };

  useEffect(() => () => {
    if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
  }, []);

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
          {status === 'waiting' && 'Authorize location to access the system.'}
          {status === 'locating' && 'Stand outdoors. Accuracy needed: <150m.'}
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

/* ==================== COLLECTION INTERFACE (AGENT) ==================== */
const CollectionInterface = ({ profile, userLocation, onRefresh }) => {
  const [result, setResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');

  const handleScan = async (data) => {
    if (!data) return;
    setError('');

    if (!userLocation || userLocation.accuracy > 150) {
      alert(`GPS not stable (${Math.round(userLocation?.accuracy || 0)}m accuracy). Move outdoors.`);
      return;
    }

    try {
      const parsed = JSON.parse(data);
      const { data: member } = await supabase.from('contributors').select('*').eq('id', parsed.id).single();
      if (!member) throw new Error('Member not found');

      if (!member.gps_latitude || !member.gps_longitude) {
        alert('Member has no registered GPS location.');
        return;
      }

      const dist = calculateDistance(userLocation.lat, userLocation.lng, member.gps_latitude, member.gps_longitude);
      const verified = dist <= GEOFENCE_RADIUS_METERS;

      const { error: insertError } = await supabase.from('transactions').insert([{
        contributor_id: member.id,
        employee_id: profile.id,
        amount: member.expected_amount,
        geofence_verified: verified,
        gps_latitude: userLocation.lat,
        gps_longitude: userLocation.lng,
        distance_from_registered: Math.round(dist),
        ajo_owner_id: 'admin'
      }]);

      if (insertError) throw insertError;

      setResult({ name: member.full_name, amount: member.expected_amount, verified, distance: Math.round(dist) });
      setScanning(false);
      if (onRefresh) onRefresh();
    } catch (e) {
      console.error(e);
      alert('Invalid QR or error.');
    }
  };

  const handleError = (err) => {
    console.error(err);
    setError('Camera access denied.');
  };

  if (result) {
    return (
      <div style={styles.successCard}>
        <CheckCircle size={80} color="#10b981" />
        <h1 style={{fontSize: 40, margin: '20px 0'}}>₦{result.amount}</h1>
        <p style={{fontSize: 18}}>{result.name}</p>
        <p style={{color: '#94a3b8', margin: '10px 0'}}>Distance: {result.distance}m</p>
        <div style={result.verified ? styles.badgeSuccess : styles.badgeWarning}>
          {result.verified ? '✓ VERIFIED AT SITE' : '⚠ REMOTE COLLECTION'}
        </div>
        <button onClick={() => setResult(null)} style={{...styles.btnPrimary, marginTop: 40}}>CONTINUE COLLECTING</button>
      </div>
    );
  }

  return (
    <div style={styles.scannerCard}>
      {!scanning ? (
        <div style={{textAlign: 'center', padding: '40px 0'}}>
          <Camera size={100} color="#3b82f6" />
          <h2 style={{marginTop: 20}}>Scan Member QR</h2>
          <p style={{color: '#64748b', marginBottom: 30}}>
            GPS Accuracy: {userLocation ? `${Math.round(userLocation.accuracy)}m` : 'Waiting...'}
          </p>
          <button onClick={() => setScanning(true)} style={styles.btnPrimary}>
            <Camera size={20} /> OPEN CAMERA
          </button>
        </div>
      ) : (
        <div style={styles.scannerContainer}>
          <QrReader delay={300} onError={handleError} onScan={handleScan} style={{ width: '100%' }} facingMode="environment" />
          {error && <p style={{color: 'red', textAlign: 'center', padding: '10px'}}>{error}</p>}
          <button onClick={() => setScanning(false)} style={styles.closeBtn}><X size={24} /></button>
        </div>
      )}
    </div>
  );
};

/* ==================== OWNER DASHBOARD ==================== */
const OwnerDashboard = ({ stats, transactions, loading, onRefresh }) => (
  <div style={styles.fadeIn}>
    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
      <h2 style={{fontSize: 24, fontWeight: 900}}>Dashboard</h2>
      <button onClick={onRefresh} style={styles.btnIcon}><RefreshCw size={20} /></button>
    </div>

    <div style={styles.statsGrid}>
      <div style={{...styles.statCard, ...styles.statCardPrimary}}>
        <p>Today's Revenue</p><h2>₦{stats.todayRevenue.toLocaleString()}</h2>
      </div>
      <div style={styles.statCard}>
        <p>Total Revenue</p><h2>₦{stats.totalRevenue.toLocaleString()}</h2>
      </div>
      <div style={styles.statCard}>
        <p>Active Members</p><h2>{stats.activeMembers}</h2>
      </div>
      <div style={styles.statCard}>
        <p>Today's Collections</p><h2>{transactions.filter(t => t.created_at?.slice(0,10) === new Date().toISOString().slice(0,10)).length}</h2>
      </div>
    </div>

    <h3 style={{margin: '30px 0 15px', fontSize: 18}}>Recent Transactions</h3>
    <div style={styles.transactionList}>
      {transactions.slice(0, 10).map(trans => (
        <div key={trans.id} style={styles.transItem}>
          <div>
            <p style={{fontWeight: 700}}>{trans.contributor_name || 'Member'}</p>
            <p style={{fontSize: 12, color: '#94a3b8'}}>{formatDate(trans.created_at)} • {formatTime(trans.created_at)}</p>
          </div>
          <div style={{textAlign: 'right'}}>
            <p style={{fontWeight: 900}}>₦{trans.amount}</p>
            <p style={{fontSize: 12, color: trans.geofence_verified ? '#34d399' : '#f87171'}}>
              {trans.geofence_verified ? 'Verified' : 'Remote'}
            </p>
          </div>
        </div>
      ))}
      {transactions.length === 0 && <p style={{textAlign: 'center', color: '#64748b'}}>No transactions yet</p>}
    </div>
  </div>
);

/* ==================== MEMBER MANAGEMENT ==================== */
const MemberManagement = ({ members, userLocation, onRefresh }) => {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');

  const handleAddMember = async () => {
    if (!name || !amount || !userLocation) {
      alert('Fill all fields and ensure GPS is active.');
      return;
    }

    try {
      const { error } = await supabase.from('contributors').insert([{
        full_name: name,
        expected_amount: Number(amount),
        gps_latitude: userLocation.lat,
        gps_longitude: userLocation.lng,
        ajo_owner_id: 'admin'
      }]);

      if (error) throw error;

      alert('Member registered successfully!');
      setName(''); setAmount(''); setAdding(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Error registering member.');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this member?')) return;
    await supabase.from('contributors').delete().eq('id', id);
    if (onRefresh) onRefresh();
  };

  return (
    <div style={styles.fadeIn}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
        <h2 style={{fontSize: 24, fontWeight: 900}}>Members ({members.length})</h2>
        <button onClick={() => setAdding(true)} style={styles.btnPrimary}><UserPlus size={20} /> Add Member</button>
      </div>

      {adding && (
        <div style={styles.cardForm}>
          <h3>New Member</h3>
          <input placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} style={styles.input} />
          <input placeholder="Expected Amount (₦)" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} style={styles.input} />
          <p style={{color: '#94a3b8', fontSize: 14, margin: '10px 0'}}>Current GPS will be saved as home location.</p>
          <div style={{display: 'flex', gap: 10}}>
            <button onClick={handleAddMember} style={styles.btnPrimary}>Save Member</button>
            <button onClick={() => setAdding(false)} style={styles.btnSecondary}>Cancel</button>
          </div>
        </div>
      )}

      <div style={styles.memberList}>
        {members.map(member => (
          <div key={member.id} style={styles.memberItem}>
            <div>
              <p style={{fontWeight: 700}}>{member.full_name}</p>
              <p style={{fontSize: 14, color: '#64748b'}}>₦{member.expected_amount} monthly</p>
            </div>
            <button onClick={() => handleDelete(member.id)} style={styles.btnDanger}><Trash2 size={18} /></button>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ==================== AGENT MANAGEMENT ==================== */
const AgentManagement = ({ agents, onRefresh }) => {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [password, setPassword] = useState('');

  const handleAddAgent = async () => {
    if (!name || !idNumber || !password) {
      alert('Fill all fields.');
      return;
    }

    try {
      const { error } = await supabase.from('employees').insert([{
        full_name: name,
        employee_id_number: idNumber,
        password: password,
        ajo_owner_id: 'admin'
      }]);

      if (error) throw error;

      alert('Agent added!');
      setName(''); setIdNumber(''); setPassword(''); setAdding(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Error adding agent.');
    }
  };

  return (
    <div style={styles.fadeIn}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
        <h2 style={{fontSize: 24, fontWeight: 900}}>Agents ({agents.length})</h2>
        <button onClick={() => setAdding(true)} style={styles.btnPrimary}><UserPlus size={20} /> Add Agent</button>
      </div>

      {adding && (
        <div style={styles.cardForm}>
          <h3>New Agent</h3>
          <input placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} style={styles.input} />
          <input placeholder="ID Number (Login)" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} style={styles.input} />
          <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={styles.input} />
          <div style={{display: 'flex', gap: 10}}>
            <button onClick={handleAddAgent} style={styles.btnPrimary}>Save Agent</button>
            <button onClick={() => setAdding(false)} style={styles.btnSecondary}>Cancel</button>
          </div>
        </div>
      )}

      <div style={styles.agentList}>
        {agents.map(agent => (
          <div key={agent.id} style={styles.memberItem}>
            <div>
              <p style={{fontWeight: 700}}>{agent.full_name}</p>
              <p style={{fontSize: 14, color: '#64748b'}}>ID: {agent.employee_id_number}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ==================== TRANSACTION HISTORY ==================== */
const TransactionHistory = ({ transactions, members, agents }) => {
  const getMemberName = (id) => members.find(m => m.id === id)?.full_name || 'Unknown';
  const getAgentName = (id) => agents.find(a => a.id === id)?.full_name || 'Unknown';

  return (
    <div style={styles.fadeIn}>
      <h2 style={{fontSize: 24, fontWeight: 900, marginBottom: 20}}>All Transactions ({transactions.length})</h2>

      <div style={styles.transactionList}>
        {transactions.map(trans => (
          <div key={trans.id} style={styles.transItemFull}>
            <div>
              <p style={{fontWeight: 700}}>{getMemberName(trans.contributor_id)}</p>
              <p style={{fontSize: 13, color: '#94a3b8'}}>
                By {getAgentName(trans.employee_id)} • {formatDate(trans.created_at)} {formatTime(trans.created_at)}
              </p>
              <p style={{fontSize: 13, color: '#64748b'}}>
                Distance: {trans.distance_from_registered}m • {trans.geofence_verified ? 'On-site' : 'Remote'}
              </p>
            </div>
            <div style={{textAlign: 'right'}}>
              <p style={{fontSize: 20, fontWeight: 900}}>₦{trans.amount}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ==================== LOGIN SCREEN ==================== */
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
        <input name="username" placeholder={loginMode === 'admin' ? 'Admin ID' : 'Agent ID Number'} style={styles.input} required />
        <input name="password" type="password" placeholder="Password" style={styles.input} required />
        <button type="submit" disabled={loading} style={styles.btnPrimary}>
          {loading ? 'LOGGING IN...' : 'LOGIN'}
        </button>
      </form>
    </div>
  </div>
);

/* ==================== FULL STYLES ==================== */
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
  bottomNav: { position: 'fixed', bottom: 0, left: 0, right: 0, height: 75, background: '#0f172a', display: 'flex', justifyContent: 'space-around', alignItems: 'center', borderTop: '1px solid #1e293b' },
  navButton: { background: 'none', border: 'none', color: '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 700, padding: '10px' },
  navButtonActive: { color: '#22d3ee' },
  fullState: { height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, textAlign: 'center', background: '#020617' },
  gpsSubtext: { color: '#94a3b8', margin: '15px 40px 30px', lineHeight: '1.5' },
  btnPrimary: { padding: '14px 24px', background: '#3b82f6', border: 'none', color: '#fff', borderRadius: 12, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' },
  btnSecondary: { padding: '14px 24px', background: '#1e293b', border: 'none', color: '#fff', borderRadius: 12, fontWeight: 900, cursor: 'pointer' },
  btnDanger: { padding: '10px', background: '#450a0a', border: 'none', color: '#f87171', borderRadius: 8, cursor: 'pointer' },
  btnIcon: { background: 'none', border: 'none', color: '#64748b', padding: 10 },
  scannerCard: { background: '#0f172a', borderRadius: 30, padding: 20, border: '1px solid #1e293b', margin: '10px' },
  scannerContainer: { position: 'relative', overflow: 'hidden', borderRadius: 20, background: '#000' },
  closeBtn: { position: 'absolute', top: 15, right: 15, background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', padding: 12, borderRadius: '50%', cursor: 'pointer' },
  successCard: { textAlign: 'center', padding: 40, background: '#0f172a', borderRadius: 30, border: '1px solid #1e293b', margin: '20px' },
  badgeSuccess: { background: '#064e3b', color: '#34d399', padding: '10px 20px', borderRadius: 20, fontWeight: 900, marginTop: 15, display: 'inline-block' },
  badgeWarning: { background: '#450a0a', color: '#f87171', padding: '10px 20px', borderRadius: 20, fontWeight: 900, marginTop: 15, display: 'inline-block' },
  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginBottom: 30 },
  statCard: { background: '#0f172a', padding: 20, borderRadius: 20, border: '1px solid #1e293b', textAlign: 'center' },
  statCardPrimary: { background: '#3b82f6' },
  cardForm: { background: '#0f172a', padding: 25, borderRadius: 25, border: '1px solid #1e293b', marginBottom: 20 },
  input: { width: '100%', padding: 15, background: '#020617', border: '1px solid #1e293b', borderRadius: 12, color: '#fff', marginBottom: 15, boxSizing: 'border-box', fontSize: 16 },
  loginPage: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: '#020617' },
  loginCard: { width: '100%', maxWidth: 400, padding: 40, background: '#0f172a', borderRadius: 35, textAlign: 'center', border: '1px solid #1e293b' },
  toggleRow: { display: 'flex', background: '#020617', padding: 5, borderRadius: 15, marginBottom: 25 },
  toggleBtn: { flex: 1, padding: 12, background: 'none', border: 'none', color: '#64748b', borderRadius: 12, fontWeight: 700 },
  toggleActive: { background: '#3b82f6', color: '#fff' },
  spinner: { animation: 'spin 1s linear infinite' },
  fadeIn: { animation: 'fadeIn 0.4s ease' },
  transactionList: { display: 'flex', flexDirection: 'column', gap: 12 },
  transItem: { background: '#0f172a', padding: 15, borderRadius: 15, border: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  transItemFull: { background: '#0f172a', padding: 18, borderRadius: 15, border: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  memberList: { display: 'flex', flexDirection: 'column', gap: 12 },
  memberItem: { background: '#0f172a', padding: 15, borderRadius: 15, border: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  agentList: { display: 'flex', flexDirection: 'column', gap: 12 }
};

/* Global keyframes */
useEffect(() => {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = `
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `;
  document.head.appendChild(styleSheet);
  return () => document.head.removeChild(styleSheet);
}, []);
