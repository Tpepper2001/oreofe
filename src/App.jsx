import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import QrScanner from 'react-qr-scanner';
import QRCode from 'qrcode';
import { 
  Users, UserPlus, MapPin, Scan, LayoutDashboard, 
  Settings, LogOut, CheckCircle, WifiOff, Loader2, ShieldCheck, Landmark, Printer
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

  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    if (email === 'oreofe' && password === 'oreofe') {
      const ownerData = { id: 'oreofe-id', full_name: 'Oreofe Owner', role: 'ajo_owner' };
      setUser({ id: 'oreofe-id' });
      setProfile(ownerData);
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert("Access Denied");
    else {
      setUser(data.user);
      const { data: p } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
      setProfile(p);
    }
  };

  if (!user) return <LoginScreen onLogin={handleLogin} />;

  return (
    <div className="app-container">
      <style>{styles}</style>
      <LocationGate onLocationUpdate={setUserLocation}>
        <header className="app-header">
          <div className="brand">
            <div className="logo-dot" />
            <h1>AJO<span>PRO</span></h1>
          </div>
          <div className="profile-pill">{profile?.full_name.split(' ')[0]}</div>
        </header>

        <main className="content-area">
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

        <nav className="bottom-nav">
          <button onClick={() => setView('dashboard')} className={view === 'dashboard' ? 'active' : ''}><LayoutDashboard /></button>
          {profile?.role === 'ajo_owner' ? (
            <>
              <button onClick={() => setView('members')} className={view === 'members' ? 'active' : ''}><UserPlus /></button>
              <button onClick={() => setView('employees')} className={view === 'employees' ? 'active' : ''}><Settings /></button>
            </>
          ) : (
            <button onClick={() => setView('collect')} className="scan-btn-nav"><Scan /></button>
          )}
          <button onClick={() => setUser(null)} className="logout-btn"><LogOut /></button>
        </nav>
      </LocationGate>
    </div>
  );
}

// --- DASHBOARD COMPONENT ---
const OwnerDashboard = () => {
  const [txs, setTxs] = useState([]);
  
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('transactions').select('*, contributors(full_name)').order('created_at', { ascending: false }).limit(6);
      setTxs(data || []);
    };
    load();
    const sub = supabase.channel('txs').on('postgres_changes', { event: 'INSERT', table: 'transactions' }, load).subscribe();
    return () => supabase.removeChannel(sub);
  }, []);

  return (
    <div className="fade-in">
      <div className="stats-grid">
        <div className="stat-card primary">
          <p>Total Today</p>
          <h2>₦{txs.reduce((a, b) => a + Number(b.amount), 0).toLocaleString()}</h2>
        </div>
        <div className="stat-card">
          <p>Collections</p>
          <h2>{txs.length}</h2>
        </div>
      </div>

      <h3 className="section-title">LIVE ACTIVITY</h3>
      <div className="activity-list">
        {txs.map(t => (
          <div key={t.id} className="activity-item">
            <div className="item-info">
              <strong>{t.contributors?.full_name}</strong>
              <span>{new Date(t.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
            <div className="item-amount">
              ₦{t.amount}
              <span className={t.geofence_verified ? 'tag-ok' : 'tag-warn'}>
                {t.geofence_verified ? 'Verified' : 'Remote'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- MEMBER REGISTRATION ---
const MemberRegistration = ({ ownerId }) => {
  const [loading, setLoading] = useState(false);
  const [qr, setQr] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.target);
    
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { data } = await supabase.from('contributors').insert([{
        full_name: fd.get('name'),
        expected_amount: fd.get('amount'),
        ajo_owner_id: ownerId,
        gps_latitude: pos.coords.latitude,
        gps_longitude: pos.coords.longitude,
        qr_code_data: `AJO-${Math.random().toString(36).substring(7).toUpperCase()}`
      }]).select().single();

      if (data) {
        const qrCode = await QRCode.toDataURL(JSON.stringify({ id: data.id, amt: data.expected_amount }));
        setQr({ code: qrCode, name: data.full_name });
      }
      setLoading(false);
    });
  };

  return (
    <div className="fade-in">
      <form className="card-form" onSubmit={handleSubmit}>
        <h3>Add New Member</h3>
        <input name="name" placeholder="Member Full Name" required />
        <input name="amount" type="number" placeholder="Daily Amount (₦)" required />
        <button disabled={loading} className="btn-primary">
          {loading ? <Loader2 className="spinner" /> : 'Register Member'}
        </button>
      </form>

      {qr && (
        <div className="qr-result shadow-pop">
          <img src={qr.code} alt="QR" />
          <h4>{qr.name}</h4>
          <button onClick={() => window.print()} className="btn-secondary">
            <Printer size={16} /> Print ID Card
          </button>
        </div>
      )}
    </div>
  );
};

// --- LOGIN SCREEN ---
const LoginScreen = ({ onLogin }) => (
  <div className="login-page">
    <style>{styles}</style>
    <div className="login-card shadow-pop">
      <div className="login-header">
        <Landmark size={40} className="login-icon" />
        <h2>AJO-PRO</h2>
        <p>Enter Oreofe Credentials</p>
      </div>
      <form onSubmit={onLogin} className="login-form">
        <input name="email" placeholder="Username" required />
        <input name="password" type="password" placeholder="Password" required />
        <button className="btn-primary">SECURE LOGIN</button>
      </form>
    </div>
  </div>
);

// --- CSS STYLES ---
const styles = `
  :root {
    --primary: #2563eb;
    --dark: #0f172a;
    --light: #f8fafc;
    --success: #22c55e;
    --warning: #f59e0b;
  }

  * { box-sizing: border-box; font-family: 'Inter', sans-serif; }
  body { margin: 0; background: var(--light); color: var(--dark); }

  .app-container { max-width: 500px; margin: 0 auto; min-height: 100vh; position: relative; }
  
  .app-header { 
    padding: 20px; display: flex; justify-content: space-between; align-items: center;
    background: white; border-bottom: 1px solid #e2e8f0; position: sticky; top: 0; z-index: 10;
  }

  .brand { display: flex; align-items: center; gap: 8px; }
  .logo-dot { width: 12px; height: 12px; background: var(--primary); border-radius: 50%; }
  .brand h1 { font-size: 18px; font-weight: 900; margin: 0; letter-spacing: -1px; }
  .brand span { color: var(--primary); }

  .profile-pill { 
    background: #eff6ff; color: var(--primary); padding: 4px 12px; 
    border-radius: 20px; font-size: 12px; font-weight: 700; border: 1px solid #dbeafe;
  }

  .content-area { padding: 20px; padding-bottom: 100px; }

  .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px; }
  .stat-card { background: white; padding: 20px; border-radius: 24px; border: 1px solid #e2e8f0; }
  .stat-card.primary { background: var(--dark); color: white; border: none; }
  .stat-card p { font-size: 11px; font-weight: 700; opacity: 0.7; margin: 0 0 8px 0; text-transform: uppercase; }
  .stat-card h2 { font-size: 24px; font-weight: 900; margin: 0; }

  .section-title { font-size: 11px; font-weight: 800; color: #94a3b8; letter-spacing: 1px; margin-bottom: 15px; }

  .activity-list { display: flex; flex-direction: column; gap: 10px; }
  .activity-item { 
    background: white; padding: 15px; border-radius: 20px; 
    display: flex; justify-content: space-between; align-items: center;
    border: 1px solid #f1f5f9;
  }

  .item-info strong { display: block; font-size: 14px; }
  .item-info span { font-size: 11px; color: #94a3b8; }
  .item-amount { text-align: right; font-weight: 800; font-size: 15px; }
  
  .tag-ok { font-size: 9px; background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 10px; display: block; margin-top: 4px; }
  .tag-warn { font-size: 9px; background: #fee2e2; color: #991b1b; padding: 2px 8px; border-radius: 10px; display: block; margin-top: 4px; }

  .card-form { background: white; padding: 25px; border-radius: 30px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
  .card-form h3 { margin-top: 0; font-size: 18px; margin-bottom: 20px; }
  .card-form input { 
    width: 100%; padding: 15px; margin-bottom: 15px; border-radius: 15px; 
    border: 1px solid #e2e8f0; background: #f8fafc; outline: none; transition: 0.2s;
  }
  .card-form input:focus { border-color: var(--primary); background: white; }

  .btn-primary { 
    width: 100%; padding: 16px; border-radius: 15px; border: none; 
    background: var(--primary); color: white; font-weight: 800; cursor: pointer;
  }
  
  .btn-secondary {
    background: #f1f5f9; color: var(--dark); border: none; padding: 10px 20px; border-radius: 10px;
    font-size: 12px; font-weight: 700; display: flex; align-items: center; gap: 5px; margin: 15px auto;
  }

  .bottom-nav { 
    position: fixed; bottom: 20px; left: 20px; right: 20px; max-width: 460px; margin: 0 auto;
    background: var(--dark); border-radius: 25px; padding: 10px; display: flex; 
    justify-content: space-around; align-items: center; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2);
  }
  .bottom-nav button { background: none; border: none; color: #64748b; padding: 12px; cursor: pointer; transition: 0.3s; }
  .bottom-nav button.active { color: white; }
  .scan-btn-nav { background: var(--primary) !important; color: white !important; border-radius: 18px; }

  .login-page { 
    height: 100vh; display: flex; items-center; justify-content: center; 
    background: #f1f5f9; padding: 20px;
  }
  .login-card { 
    background: white; padding: 40px; border-radius: 40px; width: 100%; max-width: 400px; 
    text-align: center;
  }
  .login-icon { color: var(--primary); margin-bottom: 20px; }
  .login-header h2 { font-size: 28px; font-weight: 900; margin: 0; }
  .login-header p { color: #94a3b8; margin-bottom: 30px; }

  .qr-result { margin-top: 30px; text-align: center; background: white; padding: 20px; border-radius: 30px; }
  .qr-result img { width: 200px; border: 10px solid #f8fafc; border-radius: 20px; }

  .fade-in { animation: fadeIn 0.5s ease-out; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  
  .shadow-pop { box-shadow: 0 20px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05); }
  .spinner { animation: spin 1s linear infinite; }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
`;

// LocationGate, EmployeeManagement, etc. would continue as before using these classes.
