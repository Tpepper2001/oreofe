import React, { useState, useEffect, createContext, useContext } from 'react';
import { createClient } from '@supabase/supabase-js';
import QrScanner from 'react-qr-scanner';
import QRCode from 'qrcode';
import { 
  Users, UserPlus, MapPin, Scan, LayoutDashboard, 
  Settings, LogOut, CheckCircle, WifiOff, Loader2, ShieldCheck, Landmark
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

  // --- 2. AUTHENTICATION (Including Oreofe Override) ---
  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    if (email === 'oreofe' && password === 'oreofe') {
      // Mocking the Owner Session
      const ownerData = { id: 'oreofe-id', full_name: 'Oreofe Owner', role: 'ajo_owner' };
      setUser({ id: 'oreofe-id' });
      setProfile(ownerData);
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert("Invalid Credentials");
    else {
      setUser(data.user);
      fetchProfile(data.user.id);
    }
  };

  const fetchProfile = async (uid) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).single();
    setProfile(data);
  };

  // --- 3. ROOT NAVIGATION ---
  if (!user) return <LoginScreen onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-900">
      <LocationGate onLocationUpdate={setUserLocation}>
        <header className="bg-white border-b p-4 sticky top-0 z-40 flex justify-between items-center">
          <div>
            <h1 className="font-black text-blue-600 text-xl tracking-tighter">AJO-AUTOMATE</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Secure Field Unit</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">
              {profile?.full_name}
            </span>
          </div>
        </header>

        <main className="max-w-md mx-auto p-4">
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

        <NavBar role={profile?.role} setView={setView} currentView={view} onLogout={() => setUser(null)} />
      </LocationGate>
    </div>
  );
}

// --- 4. OWNER DASHBOARD (TRACKING) ---
const OwnerDashboard = () => {
  const [txs, setTxs] = useState([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('transactions').select('*, contributors(full_name)').order('created_at', { ascending: false }).limit(5);
      setTxs(data || []);
    };
    load();
    const sub = supabase.channel('txs').on('postgres_changes', { event: 'INSERT', table: 'transactions' }, load).subscribe();
    return () => supabase.removeChannel(sub);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-600 p-5 rounded-3xl text-white shadow-xl shadow-blue-200">
          <Landmark className="mb-2 opacity-50" size={20} />
          <p className="text-xs opacity-80 font-bold">Today's Total</p>
          <h3 className="text-2xl font-black">₦{txs.reduce((a, b) => a + Number(b.amount), 0).toLocaleString()}</h3>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200">
          <ShieldCheck className="mb-2 text-green-500" size={20} />
          <p className="text-xs text-slate-400 font-bold">Live Collections</p>
          <h3 className="text-2xl font-black text-slate-800">{txs.length}</h3>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-black text-slate-400 text-xs uppercase tracking-widest">Live Activity</h4>
        {txs.map(t => (
          <div key={t.id} className="bg-white p-4 rounded-2xl flex justify-between items-center shadow-sm border border-slate-100">
            <div>
              <p className="font-bold text-sm">{t.contributors?.full_name}</p>
              <p className="text-[10px] text-slate-400">{new Date(t.created_at).toLocaleTimeString()}</p>
            </div>
            <div className="text-right">
              <p className="font-black text-blue-600 text-sm">₦{t.amount}</p>
              <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${t.geofence_verified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {t.geofence_verified ? 'VERIFIED' : 'OUTSIDE'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- 5. MEMBER REGISTRATION & QR PRINTING ---
const MemberRegistration = ({ ownerId }) => {
  const [loading, setLoading] = useState(false);
  const [qr, setQr] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.target);

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { data, error } = await supabase.from('contributors').insert([{
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
    <div className="space-y-6">
      <h2 className="text-xl font-black">Register Member</h2>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Full Name</label>
          <input name="name" className="w-full p-4 bg-slate-50 rounded-2xl outline-blue-500" required />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Daily Contribution (₦)</label>
          <input name="amount" type="number" className="w-full p-4 bg-slate-50 rounded-2xl outline-blue-500" required />
        </div>
        <button disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex justify-center items-center gap-2">
          {loading ? <Loader2 className="animate-spin" /> : <><MapPin size={18} /> Pin Location & Register</>}
        </button>
      </form>

      {qr && (
        <div className="bg-white p-8 rounded-3xl text-center border-2 border-dashed border-blue-200 animate-in zoom-in">
          <img src={qr.code} className="mx-auto w-48 mb-4 border-8 border-slate-50" />
          <p className="font-black text-lg">{qr.name}</p>
          <button onClick={() => window.print()} className="mt-4 text-blue-600 font-bold text-sm">Download ID Card</button>
        </div>
      )}
    </div>
  );
};

// --- 6. EMPLOYEE MANAGEMENT ---
const EmployeeManagement = ({ ownerId }) => {
  const handleAdd = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const { error } = await supabase.auth.signUp({
      email: fd.get('email'),
      password: fd.get('pass'),
      options: { data: { role: 'employee', owner_id: ownerId, full_name: fd.get('name') } }
    });
    if (!error) alert("Agent account created!");
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-black">Field Agents</h2>
      <form onSubmit={handleAdd} className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
        <input name="name" placeholder="Full Name" className="w-full p-4 bg-slate-50 rounded-2xl outline-none" required />
        <input name="email" type="email" placeholder="Login Email" className="w-full p-4 bg-slate-50 rounded-2xl outline-none" required />
        <input name="pass" type="password" placeholder="Secure Password" className="w-full p-4 bg-slate-50 rounded-2xl outline-none" required />
        <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold">Create Agent Login</button>
      </form>
    </div>
  );
};

// --- 7. FIELD SCANNER INTERFACE (AUTOMATIC LOGGING) ---
const CollectionInterface = ({ profile, userLocation }) => {
  const [scanning, setScanning] = useState(false);
  const [status, setStatus] = useState('idle');

  const onScan = async (data) => {
    if (data && status === 'idle') {
      setStatus('logging');
      const payload = JSON.parse(data.text);
      
      const { data: member } = await supabase.from('contributors').select('*').eq('id', payload.id).single();

      const tx = {
        ajo_owner_id: member.ajo_owner_id,
        contributor_id: member.id,
        employee_id: profile.id,
        amount: member.expected_amount,
        gps_latitude: userLocation.lat,
        gps_longitude: userLocation.lng,
        geofence_verified: true, // Simplified for demo
        created_at: new Date().toISOString()
      };

      if (navigator.onLine) {
        await supabase.from('transactions').insert([tx]);
      } else {
        const q = JSON.parse(localStorage.getItem('ajo_q') || '[]');
        localStorage.setItem('ajo_q', JSON.stringify([...q, tx]));
      }

      setStatus('done');
      setTimeout(() => { setStatus('idle'); setScanning(false); }, 2000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-10 space-y-8">
      {!scanning ? (
        <button onClick={() => setScanning(true)} className="w-64 h-64 bg-blue-600 rounded-full flex flex-col items-center justify-center text-white shadow-2xl shadow-blue-300 active:scale-95 transition-all">
          <Scan size={64} className="mb-4" />
          <span className="font-black text-xl tracking-widest">SCAN CARD</span>
        </button>
      ) : (
        <div className="w-full relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
          <QrScanner delay={300} onScan={onScan} onError={() => {}} style={{ width: '100%' }} />
          {status === 'logging' && <div className="absolute inset-0 bg-blue-600/80 flex items-center justify-center text-white font-bold">PROCESSING...</div>}
          {status === 'done' && <div className="absolute inset-0 bg-green-500 flex items-center justify-center text-white font-black text-2xl animate-in zoom-in">₦{profile?.expected_amount} LOGGED!</div>}
        </div>
      )}
      <OfflineBadge />
    </div>
  );
};

// --- 8. SHARED UI UTILS ---

const LoginScreen = ({ onLogin }) => (
  <div className="h-screen bg-slate-50 flex items-center justify-center p-6">
    <div className="w-full max-w-sm bg-white p-10 rounded-[40px] shadow-2xl shadow-slate-200">
      <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-blue-100 rotate-3">
        <Landmark color="white" size={32} />
      </div>
      <h2 className="text-3xl font-black text-slate-800 leading-tight">Welcome back to Ajo-Pro.</h2>
      <p className="text-slate-400 mt-2 mb-8 font-medium">Secure Daily Contributions</p>
      <form onSubmit={onLogin} className="space-y-4">
        <input name="email" placeholder="Username" className="w-full p-5 bg-slate-50 rounded-2xl outline-blue-500 font-bold" />
        <input name="password" type="password" placeholder="Password" className="w-full p-5 bg-slate-50 rounded-2xl outline-blue-500 font-bold" />
        <button className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black shadow-lg shadow-blue-100 active:scale-95 transition-all">SIGN IN</button>
      </form>
    </div>
  </div>
);

const LocationGate = ({ children, onLocationUpdate }) => {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    navigator.geolocation.watchPosition(
      (p) => { setOk(true); onLocationUpdate({ lat: p.coords.latitude, lng: p.coords.longitude }); },
      () => setOk(false)
    );
  }, []);

  if (!ok) return (
    <div className="h-screen flex flex-col items-center justify-center p-10 text-center bg-white">
      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4">
        <MapPin size={40} className="text-red-500 animate-pulse" />
      </div>
      <h2 className="text-2xl font-black">GPS Locked</h2>
      <p className="text-slate-500 mt-2">Location access is mandatory for all field operations.</p>
    </div>
  );
  return children;
};

const NavBar = ({ role, setView, currentView, onLogout }) => (
  <nav className="fixed bottom-6 left-6 right-6 bg-slate-900/90 backdrop-blur-md rounded-3xl p-4 flex justify-around items-center shadow-2xl z-50">
    <button onClick={() => setView('dashboard')} className={currentView === 'dashboard' ? 'text-blue-400' : 'text-slate-500'}><LayoutDashboard size={24} /></button>
    {role === 'ajo_owner' ? (
      <>
        <button onClick={() => setView('members')} className={currentView === 'members' ? 'text-blue-400' : 'text-slate-500'}><UserPlus size={24} /></button>
        <button onClick={() => setView('employees')} className={currentView === 'employees' ? 'text-blue-400' : 'text-slate-500'}><Settings size={24} /></button>
      </>
    ) : (
      <button onClick={() => setView('collect')} className="text-white bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-500/50"><Scan size={24} /></button>
    )}
    <button onClick={onLogout} className="text-slate-500"><LogOut size={24} /></button>
  </nav>
);

const OfflineBadge = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  useEffect(() => {
    const update = () => setIsOffline(!navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => { window.removeEventListener('online', update); window.removeEventListener('offline', update); };
  }, []);
  
  if (!isOffline) return null;
  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-orange-600 text-white px-4 py-1 rounded-full text-[10px] font-bold flex items-center gap-2">
      <WifiOff size={12} /> WORKING OFFLINE - SYNC PENDING
    </div>
  );
};
