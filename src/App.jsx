import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import QrScanner from 'react-qr-scanner';
import QRCode from 'qrcode';
import { 
  Users, UserPlus, MapPin, Scan, LayoutDashboard, 
  Settings, LogOut, CheckCircle, WifiOff, Loader2, ShieldCheck, Landmark, Printer, AlertCircle, TrendingUp
} from 'lucide-react';

/* ===================== CONFIG ===================== */
const SUPABASE_URL = 'https://watrosnylvkiuvuptdtp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhdHJvc255bHZraXV2dXB0ZHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MzE2NzEsImV4cCI6MjA4MjUwNzY3MX0.ku6_Ngf2JRJ8fxLs_Q-EySgCU37MjUK3WofpO9bazds';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const GEOFENCE_RADIUS_METERS = 100; // 100 meters radius

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

    // Hardcoded admin login
    if (email === 'oreofe' && password === 'oreofe') {
      const ownerData = { id: 'admin', full_name: 'Oreofe Owner', role: 'admin', ajo_owner_id: 'admin' };
      setUser({ id: 'admin' });
      setProfile(ownerData);
      setLoading(false);
      return;
    }

    // Try Supabase auth for employees
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
            <button onClick={() => setView('scan')} style={{...styles.navButton, ...styles.scanBtn}}>
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
  const [stats, setStats] = useState({ totalToday: 0, totalMembers: 0, totalCollected: 0 });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      
      // Get transactions with contributor names
      const { data: txData } = await supabase
        .from('transactions')
        .select('*, contributors(full_name, registration_no)')
        .order('created_at', { ascending: false })
        .limit(15);
      
      setTxs(txData || []);

      // Get total members count
      const { count } = await supabase
        .from('contributors')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Calculate today's total
      const today = new Date().toISOString().split('T')[0];
      const todayTotal = (txData || [])
        .filter(t => t.created_at.startsWith(today))
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

      // Calculate all-time total
      const allTimeTotal = (txData || []).reduce((sum, t) => sum + Number(t.amount || 0), 0);

      setStats({
        totalToday: todayTotal,
        totalMembers: count || 0,
        totalCollected: allTimeTotal
      });

      setLoading(false);
    };
    
    load();
    
    // Subscribe to real-time updates
    const sub = supabase
      .channel('transactions-channel')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'transactions' 
      }, (payload) => {
        load(); // Reload when new transaction comes in
      })
      .subscribe();
    
    return () => supabase.removeChannel(sub);
  }, []);

  return (
    <div style={styles.fadeIn}>
      <div style={styles.statsGrid}>
        <div style={{...styles.statCard, ...styles.statCardPrimary}}>
          <p style={styles.statCardLabel}>Today's Total</p>
          <h2 style={styles.statCardValue}>₦{stats.totalToday.toLocaleString()}</h2>
        </div>
        <div style={styles.statCard}>
          <p style={styles.statCardLabel}>Active Members</p>
          <h2 style={styles.statCardValue}>{stats.totalMembers}</h2>
        </div>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <p style={styles.statCardLabel}>Collections</p>
          <h2 style={styles.statCardValue}>{txs.length}</h2>
        </div>
        <div style={styles.statCard}>
          <p style={styles.statCardLabel}>All-Time Total</p>
          <h2 style={styles.statCardValue}>₦{(stats.totalCollected / 1000).toFixed(1)}K</h2>
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
          <p>No transactions yet</p>
        </div>
      ) : (
        <div style={styles.activityList}>
          {txs.map(t => (
            <div key={t.id} style={styles.activityItem}>
              <div style={styles.itemInfo}>
                <strong style={styles.itemName}>
                  {t.contributors?.full_name || 'Unknown'}
                </strong>
                <span style={styles.itemTime}>
                  {t.contributors?.registration_no} • {new Date(t.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
              <div style={styles.itemAmount}>
                <div style={styles.amount}>₦{Number(t.amount).toLocaleString()}</div>
                <span style={t.geofence_verified ? styles.tagOk : styles.tagWarn}>
                  {t.geofence_verified ? '✓ Verified' : '⚠ Remote'}
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
const MemberRegistration = () => {
  const [loading, setLoading] = useState(false);
  const [qr, setQr] = useState(null);
  const [error, setError] = useState(null);

  const generateRegistrationNo = () => {
    const prefix = 'AJO';
    const year = new Date().getFullYear().toString().slice(-2);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}${year}${random}`;
  };

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
          const registrationNo = generateRegistrationNo();
          const qrData = `AJOPRO-${registrationNo}`;
          
          const { data, error: dbError } = await supabase.from('contributors').insert([{
            ajo_owner_id: 'admin',
            full_name: fd.get('name'),
            phone_number: fd.get('phone'),
            address: fd.get('address'),
            registration_no: registrationNo,
            expected_amount: fd.get('amount'),
            gps_latitude: pos.coords.latitude,
            gps_longitude: pos.coords.longitude,
            qr_code_data: qrData,
            status: 'active'
          }]).select().single();

          if (dbError) throw dbError;

          if (data) {
            const qrCode = await QRCode.toDataURL(JSON.stringify({ 
              id: data.id, 
              regNo: registrationNo,
              name: data.full_name,
              amount: data.expected_amount
            }), { width: 300, margin: 2, color: { dark: '#0f172a' } });
            
            setQr({ 
              code: qrCode, 
              name: data.full_name, 
              amount: data.expected_amount,
              regNo: registrationNo 
            });
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
          placeholder="Full Name" 
          required 
          style={styles.input}
        />
        <input 
          name="phone" 
          type="tel" 
          placeholder="Phone Number" 
          required 
          style={styles.input}
        />
        <input 
          name="address" 
          placeholder="Home Address" 
          required 
          style={styles.input}
        />
        <input 
          name="amount" 
          type="number" 
          placeholder="Daily Expected Amount (₦)" 
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
          ) : (
            <>
              <UserPlus size={18} />
              <span style={{marginLeft: 8}}>Register Member</span>
            </>
          )}
        </button>
      </form>

      {qr && (
        <div style={styles.qrResult}>
          <div style={styles.qrCard}>
            <img src={qr.code} alt="QR Code" style={styles.qrImage} />
            <div style={styles.qrDetails}>
              <h4 style={styles.qrName}>{qr.name}</h4>
              <p style={styles.qrRegNo}>ID: {qr.regNo}</p>
              <p style={styles.qrAmount}>Daily: ₦{Number(qr.amount).toLocaleString()}</p>
            </div>
          </div>
          <button onClick={() => window.print()} style={styles.btnSecondary}>
            <Printer size={16} />
            <span style={{marginLeft: 6}}>Print ID Card</span>
          </button>
          <button onClick={() => setQr(null)} style={{...styles.btnSecondary, marginTop: 10}}>
            Register Another
          </button>
        </div>
      )}
    </div>
  );
};

// --- EMPLOYEE MANAGEMENT ---
const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('employees')
      .select('*')
      .eq('ajo_owner_id', 'admin')
      .order('created_at', { ascending: false });
    setEmployees(data || []);
    setLoading(false);
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    const fd = new FormData(e.target);
    
    const employeeId = `EMP${Date.now().toString().slice(-6)}`;
    
    const { error } = await supabase.from('employees').insert([{
      ajo_owner_id: 'admin',
      full_name: fd.get('name'),
      employee_id_number: employeeId,
      phone_number: fd.get('phone'),
      status: 'active'
    }]);

    setFormLoading(false);
    if (!error) {
      setShowForm(false);
      e.target.reset();
      loadEmployees();
    } else {
      alert('Error adding employee: ' + error.message);
    }
  };

  return (
    <div style={styles.fadeIn}>
      <div style={styles.cardForm}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24}}>
          <h3 style={{...styles.formTitle, marginBottom: 0}}>Field Agents</h3>
          <button onClick={() => setShowForm(!showForm)} style={styles.btnSmall}>
            {showForm ? 'Cancel' : '+ Add Agent'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleAddEmployee} style={{marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #e2e8f0'}}>
            <input name="name" placeholder="Full Name" required style={styles.input} />
            <input name="phone" type="tel" placeholder="Phone Number" required style={styles.input} />
            <button disabled={formLoading} style={styles.btnPrimary}>
              {formLoading ? <Loader2 size={18} style={styles.spinner} /> : 'Add Employee'}
            </button>
          </form>
        )}

        {loading ? (
          <div style={styles.loadingContainer}>
            <Loader2 size={32} style={styles.spinner} />
          </div>
        ) : employees.length === 0 ? (
          <div style={styles.emptyState}>
            <Users size={48} style={{color: '#94a3b8'}} />
            <p>No field agents registered yet</p>
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
                  <span style={{fontSize: 12, color: '#64748b'}}>
                    {emp.employee_id_number} • {emp.phone_number}
                  </span>
                </div>
                <span style={{...styles.tagOk, marginLeft: 'auto'}}>
                  {emp.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// --- COLLECTION INTERFACE (for employees) ---
const CollectionInterface = ({ profile, userLocation }) => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [processing, setProcessing] = useState(false);

  // Calculate distance between two GPS coordinates (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  };

  const handleScan = async (data) => {
    if (data && !result && !processing) {
      setProcessing(true);
      try {
        const parsed = JSON.parse(data.text);
        
        // Get contributor details
        const { data: contributor } = await supabase
          .from('contributors')
          .select('*')
          .eq('id', parsed.id)
          .single();

        if (!contributor) {
          alert('Invalid QR Code: Member not found');
          setProcessing(false);
          return;
        }

        // Calculate distance from registered location
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          contributor.gps_latitude,
          contributor.gps_longitude
        );

        const isVerified = distance <= GEOFENCE_RADIUS_METERS;

        // Insert transaction
        const { error: txError } = await supabase.from('transactions').insert([{
          ajo_owner_id: 'admin',
          contributor_id: parsed.id,
          employee_id: profile.id,
          amount: contributor.expected_amount,
          expected_amount: contributor.expected_amount,
          gps_latitude: userLocation.lat,
          gps_longitude: userLocation.lng,
          distance_from_registered: Math.round(distance),
          geofence_verified: isVerified
        }]);

        if (!txError) {
          setResult({
            name: contributor.full_name,
            amount: contributor.expected_amount,
            verified: isVerified,
            distance: Math.round(distance)
          });
          setScanning(false);
          
          setTimeout(() => {
            setResult(null);
            setProcessing(false);
          }, 4000);
        } else {
          alert('Transaction failed: ' + txError.message);
          setProcessing(false);
        }
      } catch (e) {
        console.error('Scan error:', e);
        alert('Invalid QR Code format');
        setProcessing(false);
      }
    }
  };

  const handleError = (err) => {
    console.error('Scanner error:', err);
  };

  if (result) {
    return (
      <div style={styles.fadeIn}>
        <div style={styles.successCard}>
          <CheckCircle size={64} style={{color: '#22c55e', marginBottom: 20}} />
          <h2 style={{fontSize: 24, fontWeight: 800, marginBottom: 8}}>Collection Successful!</h2>
          <p style={{fontSize: 16, color: '#64748b', marginBottom: 24}}>{result.name}</p>
          <div style={{...styles.statCard, ...styles.statCardPrimary, marginBottom: 20}}>
            <p style={styles.statCardLabel}>Amount Collected</p>
            <h2 style={styles.statCardValue}>₦{Number(result.amount).toLocaleString()}</h2>
          </div>
          <div style={{display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'center'}}>
            <span style={result.verified ? styles.tagOk : styles.tagWarn}>
              {result.verified ? '✓ Verified Location' : `⚠ ${result.distance}m away`}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.fadeIn}>
      <div style={styles.scannerCard}>
        <h3 style={styles.formTitle}>Scan Member QR Code</h3>
        <p style={{color: '#64748b', marginBottom: 24, fontSize: 14}}>
          Position the QR code within the frame to collect payment
        </p>
        
        {scanning ? (
          <div style={styles.scannerContainer}>
            <div style={styles.scannerFrame}>
              <QrScanner
                delay={300}
                onError={handleError}
                onScan={handleScan}
                style={{ width: '100%' }}
                constraints={{
                  video: { facingMode: 'environment' }
                }}
              />
            </div>
            <button onClick={() => setScanning(false)} style={{...styles.btnSecondary, marginTop: 20}}>
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
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          onLocationUpdate({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setHasLocation(true);
        },
        (err) => {
          setError('Location access required');
          setHasLocation(true); // Allow anyway for testing
        },
        { enableHighAccuracy: true, maximumAge: 10000 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      setHasLocation(true);
    }
  }, [onLocationUpdate]);

  if (!hasLocation) {
    return (
      <div style={styles.loadingScreen}>
        <MapPin size={48} style={{color: '#2563eb', marginBottom: 16}} />
        <Loader2 size={32} style={styles.spinner} />
        <p style={{marginTop: 16}}>Getting your location...</p>
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
          placeholder="Username or Email" 
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
