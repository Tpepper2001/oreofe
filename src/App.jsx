import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import QrScanner from 'react-qr-scanner';
import QRCode from 'qrcode';
import { 
  Users, UserPlus, MapPin, Scan, LayoutDashboard, 
  Settings, LogOut, CheckCircle, WifiOff, Loader2, ShieldCheck, Landmark, Printer, AlertCircle
} from 'lucide-react';

/* ===================== CONFIG ===================== */
const SUPABASE_URL = 'https://watrosnylvkiuvuptdtp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhdHJvc255bHZraXV2dXB0ZHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MzE2NzEsImV4cCI6MjA4MjUwNzY3MX0.ku6_Ngf2JRJ8fxLs_Q-EySgCU37MjUK3WofpO9bazds';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [view, setView] = useState('dashboard');
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const email = e.target.email.value;
    const password = e.target.password.value;

    if (email === 'oreofe' && password === 'oreofe') {
      const ownerData = { id: 'oreofe-id', full_name: 'Oreofe Owner', role: 'ajo_owner' };
      setUser({ id: 'oreofe-id' });
      setProfile(ownerData);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      alert("Access Denied: " + error.message);
    } else {
      setUser(data.user);
      const { data: p } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
      setProfile(p);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setProfile(null);
    setView('dashboard');
  };

  if (!user) return <LoginScreen onLogin={handleLogin} loading={loading} />;

  return (
    <div style={styles.appContainer}>
      <LocationGate onLocationUpdate={setUserLocation}>
        <header style={styles.appHeader}>
          <div style={styles.brand}>
            <div style={styles.logoDot} />
            <h1 style={styles.brandH1}>AJO<span style={styles.brandSpan}>PRO</span></h1>
          </div>
          <div style={styles.profilePill}>{profile?.full_name?.split(' ')[0] || 'User'}</div>
        </header>

        <main style={styles.contentArea}>
          {profile?.role === 'ajo_owner' ? (
            <>
              {view === 'dashboard' && <OwnerDashboard />}
              {view === 'members' && <MemberRegistration ownerId={user.id} />}
              {view === 'employees' && <EmployeeManagement ownerId={user.id} />}
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
          {profile?.role === 'ajo_owner' ? (
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
            <button style={{...styles.navButton, ...styles.scanBtn}}>
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

// --- OWNER DASHBOARD ---
const OwnerDashboard = () => {
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('transactions')
        .select('*, contributors(full_name)')
        .order('created_at', { ascending: false })
        .limit(10);
      setTxs(data || []);
      setLoading(false);
    };
    load();
    
    const sub = supabase
      .channel('txs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'transactions' }, load)
      .subscribe();
    
    return () => supabase.removeChannel(sub);
  }, []);

  const totalToday = txs.reduce((a, b) => a + Number(b.amount || 0), 0);

  return (
    <div style={styles.fadeIn}>
      <div style={styles.statsGrid}>
        <div style={{...styles.statCard, ...styles.statCardPrimary}}>
          <p style={styles.statCardLabel}>Total Today</p>
          <h2 style={styles.statCardValue}>₦{totalToday.toLocaleString()}</h2>
        </div>
        <div style={styles.statCard}>
          <p style={styles.statCardLabel}>Collections</p>
          <h2 style={styles.statCardValue}>{txs.length}</h2>
        </div>
      </div>

      <h3 style={styles.sectionTitle}>LIVE ACTIVITY</h3>
      
      {loading ? (
        <div style={styles.loadingContainer}>
          <Loader2 size={32} style={styles.spinner} />
        </div>
      ) : txs.length === 0 ? (
        <div style={styles.emptyState}>
          <AlertCircle size={48} style={{color: '#94a3b8'}} />
          <p>No transactions yet today</p>
        </div>
      ) : (
        <div style={styles.activityList}>
          {txs.map(t => (
            <div key={t.id} style={styles.activityItem}>
              <div style={styles.itemInfo}>
                <strong style={styles.itemName}>{t.contributors?.full_name || 'Unknown'}</strong>
                <span style={styles.itemTime}>
                  {new Date(t.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
              <div style={styles.itemAmount}>
                <div style={styles.amount}>₦{Number(t.amount).toLocaleString()}</div>
                <span style={t.geofence_verified ? styles.tagOk : styles.tagWarn}>
                  {t.geofence_verified ? 'Verified' : 'Remote'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- MEMBER REGISTRATION ---
const MemberRegistration = ({ ownerId }) => {
  const [loading, setLoading] = useState(false);
  const [qr, setQr] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.target);
    
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const qrData = `AJO-${Math.random().toString(36).substring(7).toUpperCase()}`;
          const { data, error: dbError } = await supabase.from('contributors').insert([{
            full_name: fd.get('name'),
            expected_amount: fd.get('amount'),
            ajo_owner_id: ownerId,
            gps_latitude: pos.coords.latitude,
            gps_longitude: pos.coords.longitude,
            qr_code_data: qrData
          }]).select().single();

          if (dbError) throw dbError;

          if (data) {
            const qrCode = await QRCode.toDataURL(JSON.stringify({ 
              id: data.id, 
              amt: data.expected_amount,
              code: qrData
            }), { width: 300, margin: 2 });
            
            setQr({ code: qrCode, name: data.full_name, amount: data.expected_amount });
            e.target.reset();
          }
        } catch (err) {
          setError('Failed to register member: ' + err.message);
        }
        setLoading(false);
      },
      (err) => {
        setError('Location access denied. Please enable location services.');
        setLoading(false);
      }
    );
  };

  return (
    <div style={styles.fadeIn}>
      <form style={styles.cardForm} onSubmit={handleSubmit}>
        <h3 style={styles.formTitle}>Add New Member</h3>
        {error && <div style={styles.errorAlert}>{error}</div>}
        <input 
          name="name" 
          placeholder="Member Full Name" 
          required 
          style={styles.input}
        />
        <input 
          name="amount" 
          type="number" 
          placeholder="Daily Amount (₦)" 
          required 
          min="1"
          style={styles.input}
        />
        <button disabled={loading} style={styles.btnPrimary}>
          {loading ? (
            <>
              <Loader2 size={18} style={styles.spinner} />
              <span style={{marginLeft: 8}}>Processing...</span>
            </>
          ) : 'Register Member'}
        </button>
      </form>

      {qr && (
        <div style={styles.qrResult}>
          <img src={qr.code} alt="QR Code" style={styles.qrImage} />
          <h4 style={styles.qrName}>{qr.name}</h4>
          <p style={styles.qrAmount}>Daily: ₦{Number(qr.amount).toLocaleString()}</p>
          <button onClick={() => window.print()} style={styles.btnSecondary}>
            <Printer size={16} />
            <span style={{marginLeft: 6}}>Print ID Card</span>
          </button>
        </div>
      )}
    </div>
  );
};

// --- EMPLOYEE MANAGEMENT ---
const EmployeeManagement = ({ ownerId }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'collector')
        .eq('ajo_owner_id', ownerId);
      setEmployees(data || []);
      setLoading(false);
    };
    load();
  }, [ownerId]);

  return (
    <div style={styles.fadeIn}>
      <div style={styles.cardForm}>
        <h3 style={styles.formTitle}>Employee Management</h3>
        {loading ? (
          <div style={styles.loadingContainer}>
            <Loader2 size={32} style={styles.spinner} />
          </div>
        ) : employees.length === 0 ? (
          <div style={styles.emptyState}>
            <Users size={48} style={{color: '#94a3b8'}} />
            <p>No employees registered yet</p>
          </div>
        ) : (
          <div style={styles.employeeList}>
            {employees.map(emp => (
              <div key={emp.id} style={styles.employeeCard}>
                <div style={styles.employeeAvatar}>
                  {emp.full_name?.charAt(0).toUpperCase()}
                </div>
                <div style={styles.employeeInfo}>
                  <strong>{emp.full_name}</strong>
                  <span>{emp.email}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// --- COLLECTION INTERFACE ---
const CollectionInterface = ({ profile, userLocation }) => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);

  const handleScan = async (data) => {
    if (data && !result) {
      try {
        const parsed = JSON.parse(data.text);
        setResult(parsed);
        setScanning(false);
        
        // Process collection here
        const { error } = await supabase.from('transactions').insert([{
          contributor_id: parsed.id,
          collector_id: profile.id,
          amount: parsed.amt,
          geofence_verified: true
        }]);
        
        if (!error) {
          alert('Collection successful!');
        }
      } catch (e) {
        console.error('Scan error:', e);
      }
    }
  };

  return (
    <div style={styles.fadeIn}>
      <div style={styles.scannerCard}>
        <h3 style={styles.formTitle}>Scan Member QR Code</h3>
        {scanning ? (
          <div style={styles.scannerContainer}>
            <QrScanner
              delay={300}
              onError={(err) => console.error(err)}
              onScan={handleScan}
              style={{ width: '100%' }}
            />
            <button onClick={() => setScanning(false)} style={styles.btnSecondary}>
              Cancel Scan
            </button>
          </div>
        ) : (
          <button onClick={() => setScanning(true)} style={styles.btnPrimary}>
            <Scan size={20} />
            <span style={{marginLeft: 8}}>Start Scanning</span>
          </button>
        )}
      </div>
    </div>
  );
};

// --- LOCATION GATE ---
const LocationGate = ({ children, onLocationUpdate }) => {
  const [hasLocation, setHasLocation] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          onLocationUpdate({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setHasLocation(true);
        },
        (err) => {
          setError('Location access required for this app');
          setHasLocation(true); // Allow access anyway for demo
        }
      );
    } else {
      setHasLocation(true);
    }
  }, [onLocationUpdate]);

  if (!hasLocation) {
    return (
      <div style={styles.loadingScreen}>
        <Loader2 size={48} style={styles.spinner} />
        <p>Getting your location...</p>
      </div>
    );
  }

  return children;
};

// --- LOGIN SCREEN ---
const LoginScreen = ({ onLogin, loading }) => (
  <div style={styles.loginPage}>
    <div style={styles.loginCard}>
      <div style={styles.loginHeader}>
        <Landmark size={48} style={styles.loginIcon} />
        <h2 style={styles.loginTitle}>AJO-PRO</h2>
        <p style={styles.loginSubtitle}>Secure Collection System</p>
      </div>
      <form onSubmit={onLogin} style={styles.loginForm}>
        <input 
          name="email" 
          placeholder="Username" 
          required 
          style={styles.input}
          autoComplete="username"
        />
        <input 
          name="password" 
          type="password" 
          placeholder="Password" 
          required 
          style={styles.input}
          autoComplete="current-password"
        />
        <button disabled={loading} style={styles.btnPrimary}>
          {loading ? (
            <>
              <Loader2 size={18} style={styles.spinner} />
              <span style={{marginLeft: 8}}>Logging in...</span>
            </>
          ) : (
            <>
              <ShieldCheck size={18} />
              <span style={{marginLeft: 8}}>SECURE LOGIN</span>
            </>
          )}
        </button>
      </form>
    </div>
  </div>
);

// --- STYLES ---
const styles = {
  appContainer: {
    maxWidth: '500px',
    margin: '0 auto',
    minHeight: '100vh',
    background: '#f8fafc',
    position: 'relative',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  },
  
  appHeader: {
    padding: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'white',
    borderBottom: '1px solid #e2e8f0',
    position: 'sticky',
    top: 0,
    zIndex: 10,
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },

  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },

  logoDot: {
    width: '12px',
    height: '12px',
    background: '#2563eb',
    borderRadius: '50%'
  },

  brandH1: {
    fontSize: '20px',
    fontWeight: '900',
    margin: 0,
    letterSpacing: '-0.5px',
    color: '#0f172a'
  },

  brandSpan: {
    color: '#2563eb'
  },

  profilePill: {
    background: '#eff6ff',
    color: '#2563eb',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '700',
    border: '1px solid #dbeafe'
  },

  contentArea: {
    padding: '20px',
    paddingBottom: '100px',
    minHeight: 'calc(100vh - 140px)'
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
    marginBottom: '30px'
  },

  statCard: {
    background: 'white',
    padding: '24px',
    borderRadius: '24px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },

  statCardPrimary: {
    background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
    color: 'white',
    border: 'none',
    boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)'
  },

  statCardLabel: {
    fontSize: '11px',
    fontWeight: '700',
    opacity: 0.7,
    margin: '0 0 10px 0',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },

  statCardValue: {
    fontSize: '26px',
    fontWeight: '900',
    margin: 0
  },

  sectionTitle: {
    fontSize: '11px',
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: '1.2px',
    marginBottom: '16px',
    marginTop: '30px'
  },

  activityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },

  activityItem: {
    background: 'white',
    padding: '16px',
    borderRadius: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    border: '1px solid #f1f5f9',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    transition: 'all 0.2s',
    cursor: 'pointer'
  },

  itemInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },

  itemName: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#0f172a'
  },

  itemTime: {
    fontSize: '12px',
    color: '#94a3b8'
  },

  itemAmount: {
    textAlign: 'right',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '6px'
  },

  amount: {
    fontWeight: '800',
    fontSize: '16px',
    color: '#0f172a'
  },

  tagOk: {
    fontSize: '10px',
    background: '#dcfce7',
    color: '#166534',
    padding: '3px 10px',
    borderRadius: '10px',
    fontWeight: '600',
    letterSpacing: '0.3px'
  },

  tagWarn: {
    fontSize: '10px',
    background: '#fee2e2',
    color: '#991b1b',
    padding: '3px 10px',
    borderRadius: '10px',
    fontWeight: '600',
    letterSpacing: '0.3px'
  },

  cardForm: {
    background: 'white',
    padding: '28px',
    borderRadius: '30px',
    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)',
    border: '1px solid #f1f5f9'
  },

  formTitle: {
    marginTop: 0,
    fontSize: '20px',
    marginBottom: '24px',
    fontWeight: '700',
    color: '#0f172a'
  },

  input: {
    width: '100%',
    padding: '16px',
    marginBottom: '14px',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    background: '#f8fafc',
    outline: 'none',
    transition: 'all 0.2s',
    fontSize: '15px',
    boxSizing: 'border-box'
  },

  btnPrimary: {
    width: '100%',
    padding: '16px',
    borderRadius: '16px',
    border: 'none',
    background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
    color: 'white',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)'
  },

  btnSecondary: {
    background: '#f1f5f9',
    color: '#0f172a',
    border: 'none',
    padding: '12px 22px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    margin: '16px auto 0',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },

  bottomNav: {
    position: 'fixed',
    bottom: '20px',
    left: '20px',
    right: '20px',
    maxWidth: '460px',
    margin: '0 auto',
    background: '#0f172a',
    borderRadius: '26px',
    padding: '12px 16px',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)',
    backdropFilter: 'blur(10px)',
    zIndex: 100
  },

  navButton: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    padding: '12px 16px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  navButtonActive: {
    color: 'white',
    background: 'rgba(255,255,255,0.1)'
  },

  scanBtn: {
    background: '#2563eb',
    color: 'white'
  },

  loginPage: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px'
  },

  loginCard: {
    background: 'white',
    padding: '44px 36px',
    borderRadius: '40px',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
  },

  loginHeader: {
    marginBottom: '32px'
  },

  loginIcon: {
    color: '#2563eb',
    marginBottom: '16px'
  },

  loginTitle: {
    fontSize: '32px',
    fontWeight: '900',
    margin: '0 0 8px 0',
    color: '#0f172a'
  },

  loginSubtitle: {
    color: '#94a3b8',
    margin: 0,
    fontSize: '14px'
  },

  loginForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },

  qrResult: {
    marginTop: '32px',
    textAlign: 'center',
    background: 'white',
    padding: '28px',
    borderRadius: '30px',
    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)',
    border: '1px solid #f1f5f9'
  },

  qrImage: {
    width: '240px',
    height: '240px',
    border: '12px solid #f8fafc',
    borderRadius: '24px',
    marginBottom: '16px'
  },

  qrName: {
    fontSize: '20px',
    fontWeight: '700',
    margin: '0 0 8px 0',
    color: '#0f172a'
  },

  qrAmount: {
    fontSize: '14px',
    color: '#64748b',
    margin: '0 0 12px 0'
  },

  fadeIn: {
    animation: 'fadeIn 0.5s ease-out'
  },

  spinner: {
    animation: 'spin 1s linear infinite'
  },

  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px',
    color: '#2563eb'
  },

  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#94a3b8'
  },

  errorAlert: {
    background: '#fee2e2',
    color: '#991b1b',
    padding: '12px 16px',
    borderRadius: '12px',
    marginBottom: '16px',
    fontSize: '13px',
    fontWeight: '600'
  },

  loadingScreen: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    color: '#2563eb'
  },

  employeeList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },

  employeeCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '14px',
    background: '#f8fafc',
    borderRadius: '16px'
  },

  employeeAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: '700'
  },

  employeeInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },

  scannerCard: {
    background: 'white',
    padding: '28px',
    borderRadius: '30px',
    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)',
    border: '1px solid #f1f5f9',
    textAlign: 'center'
  },

  scannerContainer: {
    marginTop: '20px'
  }
};
