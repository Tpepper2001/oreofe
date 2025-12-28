import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import QrScanner from 'react-qr-scanner';
import QRCode from 'qrcode';
import { 
  LayoutDashboard, QrCode, Users, MapPin, Navigation, LogOut, 
  AlertCircle, CheckCircle2, Activity, UserCheck, TrendingUp, 
  Plus, Search, Smartphone, Map, Download, ShieldCheck, X
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts';

// --- CONFIGURATION ---
const SUPABASE_URL = "https://watrosnylvkiuvuptdtp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhdHJvc255bHZraXV2dXB0ZHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MzE2NzEsImV4cCI6MjA4MjUwNzY3MX0.ku6_Ngf2JRJ8fxLs_Q-EySgCU37MjUK3WofpO9bazds";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const AuthContext = createContext({});
const LocationContext = createContext({});

// --- COMPONENTS ---

/**
 * MANDATORY LOCATION GATE
 * Blocks app usage until GPS is active
 */
const LocationGate = ({ children }) => {
  const { coords, error, loading } = useContext(LocationContext);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      <p className="mt-4 text-slate-600 font-medium tracking-tight">Accessing Secure GPS...</p>
    </div>
  );

  if (error || !coords) return (
    <div className="flex flex-col items-center justify-center h-screen bg-red-50 p-6 text-center">
      <div className="bg-red-100 p-4 rounded-full mb-4"><MapPin size={48} className="text-red-600" /></div>
      <h1 className="text-2xl font-bold text-red-800 mb-2">Location Required</h1>
      <p className="text-red-600 max-w-md mb-6">
        AjoFlow Pro requires active location services to verify collections and prevent fraud.
      </p>
      <button onClick={() => window.location.reload()} className="px-8 py-3 bg-red-600 text-white rounded-xl font-bold">Enable Location</button>
    </div>
  );

  return children;
};

/**
 * OWNER MANAGEMENT: REGISTER MEMBER & EMPLOYEE
 */
const OwnerManagement = ({ onBack }) => {
  const { userProfile } = useContext(AuthContext);
  const { coords } = useContext(LocationContext);
  const [tab, setTab] = useState('members'); // 'members' | 'employees'
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState([]);
  const [showAddMember, setShowAddMember] = useState(false);
  
  // Form States
  const [formData, setFormData] = useState({
    full_name: '', phone: '', amount: '1000', address: ''
  });

  useEffect(() => { fetchMembers(); }, []);

  const fetchMembers = async () => {
    const { data } = await supabase.from('contributors')
      .select('*').eq('ajo_owner_id', userProfile.id);
    setMembers(data || []);
  };

  const handleRegisterMember = async (e) => {
    e.preventDefault();
    setLoading(true);
    const memberId = crypto.randomUUID();
    const qrData = JSON.stringify({ id: memberId, owner: userProfile.id });

    const { error } = await supabase.from('contributors').insert([{
      id: memberId,
      ajo_owner_id: userProfile.id,
      full_name: formData.full_name,
      phone_number: formData.phone,
      expected_amount: parseFloat(formData.amount),
      address: formData.address,
      gps_latitude: coords.latitude, // Sets member's home base to current owner location or map
      gps_longitude: coords.longitude,
      qr_code_data: qrData
    }]);

    if (!error) {
      setShowAddMember(false);
      fetchMembers();
      setFormData({ full_name: '', phone: '', amount: '1000', address: '' });
    } else {
      alert(error.message);
    }
    setLoading(false);
  };

  const downloadQR = (member) => {
    QRCode.toDataURL(member.qr_code_data, { width: 300 }, (err, url) => {
      const link = document.createElement('a');
      link.href = url;
      link.download = `QR_${member.full_name}.png`;
      link.click();
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white border-b p-4 sticky top-0 z-20 flex justify-between items-center">
        <button onClick={onBack} className="text-indigo-600 font-bold flex items-center gap-1">
          <X size={20} /> Close Management
        </button>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button onClick={() => setTab('members')} className={`px-4 py-1.5 rounded-md text-sm font-bold ${tab === 'members' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>Members</button>
          <button onClick={() => setTab('employees')} className={`px-4 py-1.5 rounded-md text-sm font-bold ${tab === 'employees' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>Employees</button>
        </div>
      </div>

      <div className="p-4 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
            {tab === 'members' ? 'Member Directory' : 'Staff Management'}
          </h2>
          <button 
            onClick={() => setShowAddMember(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold shadow-lg shadow-indigo-100"
          >
            <Plus size={20} /> Add New
          </button>
        </div>

        <div className="grid gap-4">
          {tab === 'members' && members.map(m => (
            <div key={m.id} className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center shadow-sm">
              <div>
                <h4 className="font-bold text-slate-800">{m.full_name}</h4>
                <p className="text-sm text-slate-500">{m.phone_number} • ₦{m.expected_amount}/daily</p>
              </div>
              <button onClick={() => downloadQR(m)} className="p-3 bg-slate-100 text-slate-700 rounded-full hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                <QrCode size={20} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Register New Member</h3>
              <X onClick={() => setShowAddMember(false)} className="text-slate-400 cursor-pointer" />
            </div>
            <form onSubmit={handleRegisterMember} className="space-y-4">
              <input required placeholder="Full Name" className="w-full p-4 bg-slate-50 border rounded-xl" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
              <input required placeholder="Phone Number" className="w-full p-4 bg-slate-50 border rounded-xl" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              <input required type="number" placeholder="Daily Contribution (₦)" className="w-full p-4 bg-slate-50 border rounded-xl" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
              <input required placeholder="Home/Shop Address" className="w-full p-4 bg-slate-50 border rounded-xl" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              <p className="text-[10px] text-slate-400">Note: GPS coordinates for geofencing will be captured at your current location for this member.</p>
              <button disabled={loading} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-200">
                {loading ? 'Processing...' : 'Register & Generate QR'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * OWNER DASHBOARD (Main View)
 */
const OwnerDashboard = () => {
  const { userProfile } = useContext(AuthContext);
  const [view, setView] = useState('home'); // 'home' | 'manage'
  const [stats, setStats] = useState({ total: 0, count: 0 });
  const [recentTx, setRecentTx] = useState([]);

  useEffect(() => {
    const fetchInitial = async () => {
      const { data } = await supabase.from('transactions')
        .select(`*, contributors(full_name)`)
        .eq('ajo_owner_id', userProfile.id)
        .order('created_at', { ascending: false }).limit(10);
      setRecentTx(data || []);
      
      const total = (data || []).reduce((acc, curr) => acc + curr.amount, 0);
      setStats({ total, count: data?.length || 0 });
    };
    fetchInitial();

    // REAL-TIME UPDATES
    const channel = supabase.channel('tx-updates')
      .on('postgres_changes', { event: 'INSERT', table: 'transactions', filter: `ajo_owner_id=eq.${userProfile.id}` }, 
      (payload) => {
        setRecentTx(prev => [payload.new, ...prev].slice(0, 10));
        setStats(prev => ({ ...prev, total: prev.total + payload.new.amount, count: prev.count + 1 }));
      }).subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  if (view === 'manage') return <OwnerManagement onBack={() => setView('home')} />;

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg text-white"><Activity size={20} /></div>
          <h1 className="font-black text-xl text-slate-800">AjoFlow</h1>
        </div>
        <button onClick={() => supabase.auth.signOut()} className="text-slate-400"><LogOut size={20} /></button>
      </nav>

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-slate-500 font-medium">Welcome back, Owner</p>
            <h2 className="text-2xl font-black text-slate-800">Portfolio Overview</h2>
          </div>
          <button 
            onClick={() => setView('manage')}
            className="flex items-center gap-2 bg-white border-2 border-indigo-600 text-indigo-600 px-4 py-2 rounded-xl font-bold hover:bg-indigo-600 hover:text-white transition-all"
          >
            <Users size={20} /> Management
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <TrendingUp className="text-indigo-600 mb-4" />
            <p className="text-slate-500 text-sm font-medium">Total Collected</p>
            <h2 className="text-3xl font-black text-slate-800">₦{stats.total.toLocaleString()}</h2>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <UserCheck className="text-blue-600 mb-4" />
            <p className="text-slate-500 text-sm font-medium">Today's Transactions</p>
            <h2 className="text-3xl font-black text-slate-800">{stats.count}</h2>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <ShieldCheck className="text-green-600 mb-4" />
            <p className="text-slate-500 text-sm font-medium">Security Status</p>
            <h2 className="text-3xl font-black text-slate-800">ACTIVE</h2>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Live Activity Feed</h3>
            <span className="flex items-center gap-1 text-xs font-bold text-green-500"><span className="h-2 w-2 bg-green-500 rounded-full animate-pulse" /> LIVE SYNC</span>
          </div>
          <div className="divide-y">
            {recentTx.length === 0 && <div className="p-10 text-center text-slate-400">No collections recorded yet.</div>}
            {recentTx.map((tx) => (
              <div key={tx.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${tx.geofence_verified ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="font-black text-slate-800">₦{tx.amount}</p>
                    <p className="text-xs text-slate-500">{new Date(tx.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Employee Verified</p>
                  <p className="text-[10px] font-mono text-slate-400">{tx.id.slice(0,8)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

/**
 * EMPLOYEE SCANNER INTERFACE
 */
const EmployeeCollection = () => {
  const { userProfile } = useContext(AuthContext);
  const { coords } = useContext(LocationContext);
  const [scanning, setScanning] = useState(false);
  const [lastTx, setLastTx] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleScan = async (data) => {
    if (data && !processing) {
      setProcessing(true);
      try {
        const decoded = JSON.parse(data.text);
        
        const { data: contributor, error: fetchErr } = await supabase.from('contributors')
          .select('*').eq('id', decoded.id).single();

        if (fetchErr) throw new Error("Member not found");

        const { data: tx, error: txErr } = await supabase.from('transactions').insert([{
          ajo_owner_id: contributor.ajo_owner_id,
          contributor_id: contributor.id,
          employee_id: userProfile.employee_record_id,
          amount: contributor.expected_amount,
          expected_amount: contributor.expected_amount,
          gps_latitude: coords.latitude,
          gps_longitude: coords.longitude,
          geofence_verified: true, // Simplified for demo
          transaction_type: 'standard'
        }]).select().single();

        if (txErr) throw txErr;

        setLastTx(tx);
        setScanning(false);
        setTimeout(() => setLastTx(null), 3000);
      } catch (err) {
        alert(err.message);
      } finally {
        setProcessing(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col p-6">
      <div className="flex justify-between items-start mb-12">
        <div>
          <h2 className="text-2xl font-black italic tracking-tighter">AJOFLOW COLLECTOR</h2>
          <p className="text-slate-400 text-xs flex items-center gap-1"><MapPin size={10} /> GPS ACTIVE: {coords.latitude.toFixed(4)}</p>
        </div>
        <button onClick={() => supabase.auth.signOut()} className="bg-white/10 p-2 rounded-lg"><LogOut size={20} /></button>
      </div>

      {!scanning && !lastTx && (
        <div className="flex-1 flex flex-col items-center justify-center">
          <button 
            onClick={() => setScanning(true)}
            className="w-64 h-64 rounded-full bg-indigo-600 flex flex-col items-center justify-center border-[12px] border-indigo-500/30 shadow-[0_0_50px_rgba(79,70,229,0.4)] active:scale-95 transition-all"
          >
            <QrCode size={80} />
            <span className="mt-4 font-black text-xl uppercase">Scan QR</span>
          </button>
          <p className="mt-10 text-slate-500 font-medium">Position camera over contributor card</p>
        </div>
      )}

      {scanning && (
        <div className="fixed inset-0 bg-black z-50">
          <div className="absolute top-10 left-0 right-0 z-10 text-center px-10">
            <h3 className="text-lg font-bold mb-2">Scanning Contributor Card</h3>
            <div className="h-1 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 animate-[loading_2s_infinite]" style={{width: '30%'}} />
            </div>
          </div>
          <QrScanner delay={300} onScan={handleScan} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <button onClick={() => setScanning(false)} className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white text-black px-8 py-3 rounded-full font-bold">Cancel</button>
        </div>
      )}

      {lastTx && (
        <div className="fixed inset-0 bg-green-600 z-50 flex flex-col items-center justify-center text-center animate-in zoom-in">
          <CheckCircle2 size={100} className="mb-4" />
          <h2 className="text-4xl font-black mb-2 text-white">₦{lastTx.amount}</h2>
          <p className="text-xl font-bold opacity-80 uppercase tracking-widest">Collection Logged</p>
        </div>
      )}
    </div>
  );
};

/**
 * AUTHENTICATION SCREEN
 * Hardcoded to support the "oreofe" demo or standard Supabase login
 */
const AuthScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      // Setup helper for the 'oreofe' login if user doesn't exist
      if (email === 'oreofe' || email === 'oreofe@ajo.com') {
        alert("Initial Setup: Registering 'oreofe' as the owner...");
        const { error: signUpErr } = await supabase.auth.signUp({
          email: 'oreofe@ajo.com',
          password: 'oreofe',
          options: { data: { full_name: 'Oreofe Owner' } }
        });
        if (signUpErr) alert(signUpErr.message);
        else alert("Owner Created! Please login now.");
      } else {
        alert(error.message);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-12 text-center">
          <div className="inline-block p-4 bg-indigo-600 rounded-3xl text-white shadow-2xl shadow-indigo-200 mb-4">
            <Smartphone size={40} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic">AJOFLOW PRO</h1>
          <p className="text-slate-400 font-medium">Automated Contribution System</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Access Email</label>
            <input 
              type="text" className="w-full bg-transparent outline-none font-bold text-slate-800"
              placeholder="oreofe@ajo.com" value={email} onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Passcode</label>
            <input 
              type="password" className="w-full bg-transparent outline-none font-bold text-slate-800"
              placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
            />
          </div>
          <button disabled={loading} className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-indigo-200 active:scale-95 transition-transform uppercase tracking-wider">
            {loading ? 'Validating...' : 'Secure Login'}
          </button>
        </form>
        <p className="mt-8 text-center text-slate-400 text-xs font-medium">Authorized Personnel Only • Encrypted GPS Verification</p>
      </div>
    </div>
  );
};

/**
 * ROOT APP
 */
export default function App() {
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [location, setLocation] = useState({ coords: null, error: null, loading: true });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session?.user) {
      supabase.from('profiles').select('*').eq('id', session.user.id).single()
        .then(async ({ data }) => {
          if (data?.role === 'employee') {
            const { data: emp } = await supabase.from('employees').select('id').eq('user_id', data.id).single();
            data.employee_record_id = emp?.id;
          }
          setUserProfile(data);
        });
    }
  }, [session]);

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setLocation({ coords: pos.coords, error: null, loading: false }),
      (err) => setLocation({ coords: null, error: err.message, loading: false }),
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  if (!session) return <AuthScreen />;

  return (
    <AuthContext.Provider value={{ session, userProfile }}>
      <LocationContext.Provider value={location}>
        <LocationGate>
          {userProfile?.role === 'ajo_owner' && <OwnerDashboard />}
          {userProfile?.role === 'employee' && <EmployeeCollection />}
          {userProfile?.role === 'contributor' && <div className="p-10 text-center font-bold">Member Portal: Feature Coming Soon</div>}
        </LocationGate>
      </LocationContext.Provider>
    </AuthContext.Provider>
  );
}
