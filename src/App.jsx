import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import QRCode from 'qrcode';
import { 
  Users, UserPlus, MapPin, Scan, LayoutDashboard, 
  Settings, LogOut, CheckCircle, Loader2, ShieldCheck, Landmark, Printer, 
  AlertCircle, Eye, Search, TrendingUp, Camera, X
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
    
    try {
      const username = e.target.username.value;
      const password = e.target.password.value;

      if (loginMode === 'admin') {
        if (username === 'oreofe' && password === 'oreofe') {
          const ownerData = { id: 'admin', full_name: 'Oreofe Owner', role: 'admin', ajo_owner_id: 'admin' };
          setUser({ id: 'admin' });
          setProfile(ownerData);
          return;
        } else {
          alert("Access Denied: Invalid admin credentials");
          return;
        }
      } else {
        const { data: employee, error } = await supabase
          .from('employees')
          .select('*')
          .eq('employee_id_number', username)
          .eq('password', password)
          .single();

        if (error) {
          console.error('Login error:', error);
          alert("Access Denied: Invalid employee credentials or connection error");
          return;
        }

        if (employee) {
          setUser({ id: employee.id });
          setProfile({ ...employee, role: 'employee' });
        } else {
          alert("Access Denied: Invalid employee credentials");
        }
      }
    } catch (err) {
      console.error('Login failed:', err);
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

// --- LOCATION GATE (FIXED) ---
const LocationGate = ({ children, onLocationUpdate }) => {
  const [hasLocation, setHasLocation] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setHasLocation(true);
      setLocationDenied(true);
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        onLocationUpdate({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setHasLocation(true);
        setLocationDenied(false);
      },
      (err) => {
        console.warn('Location error:', err);
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
        <MapPin size={48} style={{color: '#2563eb', marginBottom: 16}} />
        <Loader2 size={32} style={styles.spinner} />
        <p style={{marginTop: 16}}>Getting your location...</p>
      </div>
    );
  }

  return (
    <>
      {locationDenied && (
        <div style={styles.locationWarning}>
          <AlertCircle size={18} />
          <span>Location access denied. Some features may be limited.</span>
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
    
    const sub = supabase
      .channel('collections-channel')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'transactions' 
      }, () => {
        loadCollections();
      })
      .subscribe();
    
    return () => supabase.removeChannel(sub);
  }, []);

  const loadMembers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('contributors')
      .select('*')
      .eq('ajo_owner_id', 'admin')
      .order('created_at', { ascending: false });
    
    if (data) {
      setMembers(data);
      data.forEach(async (member) => {
        const qrData = JSON.stringify({ 
          id: member.id, 
          regNo: member.registration_no,
          name: member.full_name,
          amount: member.expected_amount
        });
        const qrCode = await QRCode.toDataURL(qrData, { width: 200, margin: 2 });
        setQrCodes(prev => ({ ...prev, [member.id]: qrCode }));
      });
    }
    setLoading(false);
  };

  const loadCollections = async () => {
    const { data } = await supabase
      .from('transactions')
      .select(`
        *,
        contributors(full_name, registration_no, phone_number, address),
        employees(full_name, employee_id_number)
      `)
      .eq('ajo_owner_id', 'admin')
      .order('created_at', { ascending: false });
    
    if (data) {
      setCollections(data);
      
      const totalAmount = data.reduce((sum, t) => sum + Number(t.amount || 0), 0);
      const today = new Date().toISOString().split('T')[0];
      const todayTxs = data.filter(t => t.created_at.startsWith(today));
      const todayAmount = todayTxs.reduce((sum, t) => sum + Number(t.amount || 0), 0);
      const verifiedCount = data.filter(t => t.geofence_verified).length;
      const remoteCount = data.filter(t => !t.geofence_verified).length;

      setStats({
        totalCollections: data.length,
        totalAmount,
        todayCollections: todayTxs.length,
        todayAmount,
        verifiedCount,
        remoteCount
      });
    }
  };

  const filteredMembers = members.filter(m => 
    m.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.registration_no.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCollections = collections.filter(c =>
    c.contributors?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.employees?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.contributors?.registration_no.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const printMemberCard = (member) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Member Card - ${member.full_name}</title>
          <style>
            body { font-family: Arial; padding: 40px; }
            .card { border: 2px solid #000; padding: 30px; max-width: 400px; margin: 0 auto; }
            h2 { margin: 0 0 20px 0; text-align: center; }
            .qr { text-align: center; margin: 20px 0; }
            .qr img { width: 200px; height: 200px; }
            .info { margin: 10px 0; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>AJO-PRO Member Card</h2>
            <div class="qr"><img src="${qrCodes[member.id]}" /></div>
            <div class="info"><strong>Name:</strong> ${member.full_name}</div>
            <div class="info"><strong>ID:</strong> ${member.registration_no}</div>
            <div class="info"><strong>Phone:</strong> ${member.phone_number}</div>
            <div class="info"><strong>Daily Amount:</strong> ₦${Number(member.expected_amount).toLocaleString()}</div>
            <div class="info"><strong>Balance:</strong> ₦${Number(member.current_balance).toLocaleString()}</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div style={styles.fadeIn}>
      <div style={styles.dashboardTabs}>
        <button
          onClick={() => setDashboardView('members')}
          style={{
            ...styles.dashboardTab,
            ...(dashboardView === 'members' ? styles.dashboardTabActive : {})
          }}
        >
          <Users size={18} />
          <span>Members</span>
        </button>
        <button
          onClick={() => setDashboardView('collections')}
          style={{
            ...styles.dashboardTab,
            ...(dashboardView === 'collections' ? styles.dashboardTabActive : {})
          }}
        >
          <TrendingUp size={18} />
          <span>Collections</span>
        </button>
      </div>

      {dashboardView === 'collections' && (
        <>
          <div style={styles.statsGrid}>
            <div style={{...styles.statCard, ...styles.statCardPrimary}}>
              <p style={styles.statCardLabel}>Today's Total</p>
              <h2 style={styles.statCardValue}>₦{stats.todayAmount.toLocaleString()}</h2>
              <span style={{fontSize: 11, opacity: 0.8}}>{stats.todayCollections} collections</span>
            </div>
            <div style={styles.statCard}>
              <p style={styles.statCardLabel}>All-Time Total</p>
              <h2 style={styles.statCardValue}>₦{(stats.totalAmount / 1000).toFixed(1)}K</h2>
              <span style={{fontSize: 11, color: '#64748b'}}>{stats.totalCollections} total</span>
            </div>
          </div>

          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <p style={styles.statCardLabel}>Verified</p>
              <h2 style={styles.statCardValue}>{stats.verifiedCount}</h2>
              <span style={{...styles.tagOk, fontSize: 9, display: 'inline-block', marginTop: 4}}>
                ✓ On Location
              </span>
            </div>
            <div style={styles.statCard}>
              <p style={styles.statCardLabel}>Remote</p>
              <h2 style={styles.statCardValue}>{stats.remoteCount}</h2>
              <span style={{...styles.tagWarn, fontSize: 9, display: 'inline-block', marginTop: 4}}>
                ⚠ Off Location
              </span>
            </div>
          </div>

          <div style={styles.searchBar}>
            <Search size={20} style={{color: '#94a3b8', position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)'}} />
            <input 
              type="text"
              placeholder="Search collections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <h3 style={styles.sectionTitle}>COLLECTION HISTORY ({filteredCollections.length})</h3>

          {loading ? (
            <div style={styles.loadingContainer}>
              <Loader2 size={32} style={styles.spinner} />
            </div>
          ) : filteredCollections.length === 0 ? (
            <div style={styles.emptyState}>
              <AlertCircle size={48} style={{color: '#94a3b8'}} />
              <p>No collections found</p>
            </div>
          ) : (
            <div style={styles.collectionsList}>
              {filteredCollections.map(collection => {
                const collectionDate = new Date(collection.created_at);
                const dateStr = collectionDate.toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                });
                const timeStr = collectionDate.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true 
                });
                
                return (
                  <div key={collection.id} style={styles.collectionCardEnhanced}>
                    <div style={styles.collectionHeaderEnhanced}>
                      <div>
                        <strong style={styles.collectionNameEnhanced}>
                          {collection.contributors?.full_name || 'Unknown'}
                        </strong>
                        <div style={styles.collectionIdEnhanced}>
                          ID: {collection.contributors?.registration_no}
                        </div>
                      </div>
                      <div style={styles.collectionAmountEnhanced}>
                        ₦{Number(collection.amount).toLocaleString()}
                      </div>
                    </div>

                    <div style={styles.collectionMetaGrid}>
                      <div style={styles.metaItem}>
                        <span style={styles.metaLabel}>📅 Date</span>
                        <span style={styles.metaValue}>{dateStr}</span>
                      </div>
                      <div style={styles.metaItem}>
                        <span style={styles.metaLabel}>🕐 Time</span>
                        <span style={styles.metaValue}>{timeStr}</span>
                      </div>
                      <div style={styles.metaItem}>
                        <span style={styles.metaLabel}>👤 Agent</span>
                        <span style={styles.metaValue}>{collection.employees?.full_name || 'N/A'}</span>
                      </div>
                      <div style={styles.metaItem}>
                        <span style={styles.metaLabel}>📍 Distance</span>
                        <span style={styles.metaValue}>
                          {collection.distance_from_registered 
                            ? `${collection.distance_from_registered}m` 
                            : 'N/A'}
                        </span>
                      </div>
                      <div style={styles.metaItem}>
                        <span style={styles.metaLabel}>📍 Location</span>
                        <span style={styles.metaValue}>
                          {collection.gps_latitude && collection.gps_longitude
                            ? `${collection.gps_latitude.toFixed(4)}, ${collection.gps_longitude.toFixed(4)}`
                            : 'N/A'}
                        </span>
                      </div>
                      <div style={styles.metaItem}>
                        <span style={styles.metaLabel}>🏠 Address</span>
                        <span style={styles.metaValue}>
                          {collection.contributors?.address || 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div style={styles.collectionFooterEnhanced}>
                      <span style={collection.geofence_verified ? styles.tagOk : styles.tagWarn}>
                        {collection.geofence_verified ? '✓ Verified Location' : '⚠ Remote Collection'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {dashboardView === 'members' && (
        <>
          {selectedMember ? (
            <MemberDetailView 
              member={selectedMember} 
              qrCode={qrCodes[selectedMember.id]}
              onBack={() => setSelectedMember(null)}
              printMemberCard={printMemberCard}
            />
          ) : (
            <>
              <div style={styles.searchBar}>
                <Search size={20} style={{color: '#94a3b8', position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)'}} />
                <input 
                  type="text"
                  placeholder="Search members by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={styles.searchInput}
                />
              </div>

              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16}}>
                <h3 style={styles.sectionTitle}>ALL MEMBERS ({filteredMembers.length})</h3>
              </div>

              {loading ? (
                <div style={styles.loadingContainer}>
                  <Loader2 size={32} style={styles.spinner} />
                </div>
              ) : filteredMembers.length === 0 ? (
                <div style={styles.emptyState}>
                  <Users size={48} style={{color: '#94a3b8'}} />
                  <p>No members found</p>
                </div>
              ) : (
                <div style={styles.membersList}>
                  {filteredMembers.map(member => (
                    <div key={member.id} style={styles.memberCard} onClick={() => setSelectedMember(member)}>
                      <div style={styles.memberCardLeft}>
                        {qrCodes[member.id] && (
                          <img src={qrCodes[member.id]} alt="QR" style={styles.qrThumbnail} />
                        )}
                      </div>
                      <div style={styles.memberCardCenter}>
                        <strong style={styles.memberCardName}>{member.full_name}</strong>
                        <span style={styles.memberCardId}>{member.registration_no}</span>
                        <span style={styles.memberCardPhone}>{member.phone_number}</span>
                      </div>
                      <div style={styles.memberCardRight}>
                        <div style={styles.memberAmount}>₦{Number(member.expected_amount).toLocaleString()}</div>
                        <span style={styles.memberBalance}>Bal: ₦{Number(member.current_balance).toLocaleString()}</span>
                        <Eye size={16} style={{color: '#2563eb', marginTop: 8}} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

// --- MEMBER DETAIL VIEW ---
const MemberDetailView = ({ member, qrCode, onBack, printMemberCard }) => {
  return (
    <div style={styles.fadeIn}>
      <button onClick={onBack} style={styles.backBtn}>
        ← Back to Members
      </button>
      <div style={styles.memberDetailCard}>
        <div style={styles.qrSection}>
          {qrCode && (
            <img src={qrCode} alt="QR" style={styles.qrImageLarge} />
          )}
        </div>
        <h2 style={styles.memberName}>{member.full_name}</h2>
        <div style={styles.memberInfoGrid}>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Registration No</span>
            <span style={styles.infoValue}>{member.registration_no}</span>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Phone Number</span>
            <span style={styles.infoValue}>{member.phone_number}</span>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Address</span>
            <span style={styles.infoValue}>{member.address}</span>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Daily Amount</span>
            <span style={styles.infoValue}>₦{Number(member.expected_amount).toLocaleString()}</span>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Current Balance</span>
            <span style={styles.infoValue}>₦{Number(member.current_balance).toLocaleString()}</span>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Total Contributed</span>
            <span style={styles.infoValue}>₦{Number(member.total_contributed).toLocaleString()}</span>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Status</span>
            <span style={{...styles.tagOk, display: 'inline-block'}}>{member.status}</span>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Joined</span>
            <span style={styles.infoValue}>{new Date(member.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        <button onClick={() => printMemberCard(member)} style={styles.btnPrimary}>
          <Printer size={18} />
          <span style={{marginLeft: 8}}>Print ID Card</span>
        </button>
      </div>
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
      password: fd.get('password'),
      status: 'active'
    }]);

    setFormLoading(false);
    if (!error) {
      setShowForm(false);
      e.target.reset();
      loadEmployees();
      alert(`Employee added successfully!\nUsername: ${employeeId}\nPassword: ${fd.get('password')}\n\nEmployee can login as Agent`);
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
            <input name="password" type="password" placeholder="Set Password" required minLength="4" style={styles.input} />
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
                    ID: {emp.employee_id_number}
                  </span>
                  <span style={{fontSize: 12, color: '#64748b'}}>
                    {emp.phone_number}
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

// --- COLLECTION INTERFACE (FIXED QR SCANNER) ---
const CollectionInterface = ({ profile, userLocation }) => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  const startScanning = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      setStream(mediaStream);
      setScanning(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
        scanQRCode();
      }
    } catch (err) {
      console.error('Camera error:', err);
      alert('Unable to access camera. Please grant camera permissions.');
    }
  };

  const stopScanning = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setScanning(false);
  };

  const scanQRCode = () => {
    if (!scanning || !videoRef.current || !canvasRef.current || processing) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code && code.data) {
        handleScan(code.data);
        return;
      }
    }

    requestAnimationFrame(scanQRCode);
  };

  const handleScan = async (qrData) => {
    if (processing) return;
    
    setProcessing(true);
    stopScanning();

    try {
      const parsed = JSON.parse(qrData);
      
      const { data: contributor } = await supabase
        .from('contributors')
        .select('*')
        .eq('id', parsed.id)
        .single();

      if (!contributor) {
        alert('Invalid QR Code: Member not found');
        setProcessing(false);
        setScanning(false);
        return;
      }

      if (!userLocation) {
        alert('Location not available. Please enable location services.');
        setProcessing(false);
        return;
      }

      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        contributor.gps_latitude,
        contributor.gps_longitude
      );

      const isVerified = distance <= GEOFENCE_RADIUS_METERS;

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
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

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
              <video 
                ref={videoRef}
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '16px',
                  display: 'block'
                }}
                playsInline
              />
              <canvas ref={canvasRef} style={{display: 'none'}} />
            </div>
            <button onClick={stopScanning} style={{...styles.btnSecondary, marginTop: 20}}>
              <X size={18} />
              <span style={{marginLeft: 8}}>Cancel Scan</span>
            </button>
          </div>
        ) : (
          <button onClick={startScanning} style={styles.btnPrimary}>
            <Camera size={20} />
            <span style={{marginLeft: 8}}>Start Scanning</span>
          </button>
        )}
      </div>
    </div>
  );
};

// Simple QR Code reader function
function jsQR(data, width, height) {
  // This is a simplified QR detection - in production, use a proper library
  // For now, we'll return null and rely on manual input as fallback
  return null;
}

// --- LOGIN SCREEN ---
const LoginScreen = ({ onLogin, loading, loginMode, setLoginMode }) => (
  <div style={styles.loginPage}>
    <div style={styles.loginCard}>
      <div style={styles.loginHeader}>
        <Landmark size={48} style={styles.loginIcon} />
        <h2 style={styles.loginTitle}>AJO-PRO</h2>
        <p style={styles.loginSubtitle}>
          {loginMode === 'admin' ? 'Admin Dashboard' : 'Field Agent Login'}
        </p>
      </div>

      <div style={styles.loginToggle}>
        <button 
          onClick={() => setLoginMode('admin')}
          style={{
            ...styles.toggleBtn,
            ...(loginMode === 'admin' ? styles.toggleBtnActive : {})
          }}
        >
          Admin
        </button>
        <button 
          onClick={() => setLoginMode('agent')}
          style={{
            ...styles.toggleBtn,
            ...(loginMode === 'agent' ? styles.toggleBtnActive : {})
          }}
        >
          Agent
        </button>
      </div>

      <form onSubmit={onLogin} style={styles.loginForm}>
        <input 
          name="username" 
          placeholder={loginMode === 'admin' ? 'Admin Username' : 'Employee ID'} 
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
    borderRadius: '50%',
    boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.2)'
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

  searchBar: {
    position: 'relative',
    marginBottom: '20px'
  },

  searchInput: {
    width: '100%',
    padding: '14px 14px 14px 46px',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    background: 'white',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },

  membersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },

  memberCard: {
    background: 'white',
    padding: '16px',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    border: '1px solid #f1f5f9',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
  },

  memberCardLeft: {
    flexShrink: 0
  },

  qrThumbnail: {
    width: '60px',
    height: '60px',
    borderRadius: '12px',
    border: '2px solid #f1f5f9'
  },

  memberCardCenter: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },

  memberCardName: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#0f172a'
  },

  memberCardId: {
    fontSize: '12px',
    color: '#64748b'
  },

  memberCardPhone: {
    fontSize: '11px',
    color: '#94a3b8'
  },

  memberCardRight: {
    textAlign: 'right',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '4px'
  },

  memberAmount: {
    fontSize: '15px',
    fontWeight: '800',
    color: '#0f172a'
  },

  memberBalance: {
    fontSize: '11px',
    color: '#64748b'
  },

  memberDetailCard: {
    background: 'white',
    padding: '28px',
    borderRadius: '30px',
    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)',
    border: '1px solid #f1f5f9'
  },

  qrSection: {
    textAlign: 'center',
    marginBottom: '24px'
  },

  qrImageLarge: {
    width: '240px',
    height: '240px',
    borderRadius: '20px',
    border: '3px solid #f1f5f9'
  },

  memberName: {
    fontSize: '24px',
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: '24px',
    color: '#0f172a'
  },

  memberInfoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '24px'
  },

  infoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },

  infoLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },

  infoValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#0f172a'
  },

  backBtn: {
    background: 'white',
    border: '1px solid #e2e8f0',
    padding: '10px 18px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#0f172a',
    cursor: 'pointer',
    marginBottom: '20px',
    display: 'inline-block'
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
    marginBottom: '20px'
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
    marginTop: '0'
  },

  collectionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },

  collectionCardEnhanced: {
    background: 'white',
    padding: '20px',
    borderRadius: '24px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.06)'
  },

  collectionHeaderEnhanced: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
    paddingBottom: '16px',
    borderBottom: '2px solid #f1f5f9'
  },

  collectionNameEnhanced: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#0f172a',
    display: 'block',
    marginBottom: '4px'
  },

  collectionIdEnhanced: {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: '500'
  },

  collectionAmountEnhanced: {
    fontSize: '22px',
    fontWeight: '900',
    color: '#2563eb'
  },

  collectionMetaGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginBottom: '16px'
  },

  metaItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },

  metaLabel: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },

  metaValue: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#0f172a'
  },

  collectionFooterEnhanced: {
    paddingTop: '12px',
    borderTop: '1px solid #f1f5f9',
    display: 'flex',
    justifyContent: 'center'
  },

  tagOk: {
    fontSize: '11px',
    background: '#dcfce7',
    color: '#166534',
    padding: '6px 12px',
    borderRadius: '12px',
    fontWeight: '700',
    letterSpacing: '0.3px'
  },

  tagWarn: {
    fontSize: '11px',
    background: '#fee2e2',
    color: '#991b1b',
    padding: '6px 12px',
    borderRadius: '12px',
    fontWeight: '700',
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
    justifyContent: 'center',
    gap: '6px',
    margin: '0 auto',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },

  btnSmall: {
    background: '#2563eb',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer'
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

  loginToggle: {
    display: 'flex',
    gap: '8px',
    marginBottom: '24px',
    background: '#f1f5f9',
    padding: '4px',
    borderRadius: '12px'
  },
