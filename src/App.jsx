import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import QrScanner from 'react-qr-scanner';
import QRCode from 'qrcode.react';
import { 
  MapPin, ShieldAlert, CheckCircle, Smartphone, BarChart3, 
  Users, QrCode, Plus, LogOut, Navigation, Zap, Printer 
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- CONFIGURATION ---
const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ORG_DETAILS = {
  name: "ORE-OFE OLUWA",
  address: "No. 1, Bisiriyu Owokade Street, Molete, Ibeju-Lekki, Lagos",
  phones: ["08107218385", "08027203601"],
};

// --- UTILS ---
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
};

// --- COMPONENTS ---

/**
 * 1. LOCATION GATE
 * Blocks app usage if GPS is disabled or denied
 */
const LocationGate = ({ children, location, locError }) => {
  if (locError) {
    return (
      <div className="fixed inset-0 bg-red-600 text-white flex flex-col items-center justify-center p-8 text-center z-[9999]">
        <ShieldAlert size={80} className="mb-4 animate-pulse" />
        <h1 className="text-3xl font-black mb-4 uppercase">Access Denied</h1>
        <p className="text-xl mb-8">Ore-Ofe Oluwa Ajo system requires active GPS to prevent fraud. Please enable location services.</p>
        <button onClick={() => window.location.reload()} className="bg-white text-red-600 px-10 py-4 rounded-full font-bold shadow-xl">
          Try Again
        </button>
      </div>
    );
  }
  if (!location) {
    return (
      <div className="fixed inset-0 bg-slate-900 text-white flex flex-col items-center justify-center p-6">
        <Navigation size={48} className="mb-4 animate-bounce text-blue-400" />
        <p className="text-lg font-medium">Securing Precise Location...</p>
      </div>
    );
  }
  return children;
};

/**
 * 2. ORE-OFE OLUWA CARD COMPONENT
 * Custom branded membership card
 */
const MembershipCard = ({ member }) => {
  // Payload: ID|Amount|RegNo
  const qrValue = `${member.id}|${member.expected_amount}|${member.registration_no}`;

  return (
    <div className="w-[350px] h-[220px] bg-white border-[3px] border-black p-2 flex flex-col font-serif relative overflow-hidden shadow-md shrink-0">
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-black text-white flex items-center justify-center">
        <h1 className="rotate-90 whitespace-nowrap text-lg font-black tracking-tighter uppercase">
          {ORG_DETAILS.name}
        </h1>
      </div>
      <div className="flex-1 pr-14 text-[10px]">
        <div className="flex justify-between items-start border-b border-black pb-1">
          <p className="font-bold italic">MEMBERSHIP CARD</p>
          <span className="text-red-600 font-bold">#{member.registration_no || 'NEW'}</span>
        </div>
        <div className="mt-3 space-y-2">
          <div className="border-b border-dotted border-black flex gap-2">
            <span className="font-bold uppercase w-10">Name:</span> <span>{member.full_name}</span>
          </div>
          <div className="border-b border-dotted border-black flex gap-2">
            <span className="font-bold uppercase w-10">Addr:</span> <span className="truncate">{member.address}</span>
          </div>
          <div className="border-b border-dotted border-black flex gap-2">
            <span className="font-bold uppercase w-10">Phone:</span> <span>{member.phone_number}</span>
          </div>
        </div>
        <div className="mt-4 flex justify-between items-end">
          <div className="text-[7px] leading-tight text-gray-700 max-w-[140px]">
            <p>{ORG_DETAILS.address}</p>
            <p className="font-bold mt-1 text-black">{ORG_DETAILS.phones.join(' / ')}</p>
          </div>
          <div className="bg-white p-1 border border-black">
            <QRCode value={qrValue} size={65} level="H" />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 3. EMPLOYEE COLLECTION INTERFACE
 * Handles high-speed QR scanning and auto-logging
 */
const CollectionInterface = ({ user, location }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, processing, success, error
  const [lastMember, setLastMember] = useState(null);

  const handleScan = async (data) => {
    if (data && status === 'idle') {
      setStatus('processing');
      try {
        const [id, amount, regNo] = data.text.split('|');
        
        // 1. Fetch member details
        const { data: member } = await supabase.from('contributors').select('*').eq('id', id).single();
        
        // 2. Geofence Check
        const dist = calculateDistance(location.lat, location.lng, member.gps_latitude, member.gps_longitude);

        // 3. Auto-Log Transaction
        const { error } = await supabase.from('transactions').insert({
          ajo_owner_id: user.ajo_owner_id,
          contributor_id: id,
          employee_id: user.employee_profile_id,
          amount: parseFloat(amount),
          expected_amount: parseFloat(amount),
          gps_latitude: location.lat,
          gps_longitude: location.lng,
          distance_from_registered: Math.round(dist),
          geofence_verified: dist <= 100
        });

        if (error) throw error;

        setLastMember({ name: member.full_name, amount });
        setStatus('success');
        setTimeout(() => { setStatus('idle'); setIsScanning(false); }, 3000);
      } catch (err) {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 3000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="p-4 bg-white shadow-sm flex justify-between items-center">
        <h1 className="font-black text-xl tracking-tighter italic">ORE-OFE OLUWA</h1>
        <div className="flex items-center gap-2 bg-green-100 px-3 py-1 rounded-full">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-bold text-green-700 uppercase">GPS Tracking Active</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6">
        {status === 'success' ? (
          <div className="text-center animate-in zoom-in">
            <div className="w-32 h-32 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-200">
              <CheckCircle size={64} className="text-white" />
            </div>
            <h2 className="text-3xl font-black text-slate-800">₦{lastMember?.amount} COLLECTED</h2>
            <p className="text-slate-500 font-medium">{lastMember?.name}</p>
          </div>
        ) : isScanning ? (
          <div className="w-full max-w-sm aspect-square relative rounded-3xl overflow-hidden border-4 border-blue-600 shadow-2xl">
            <QrScanner delay={300} onScan={handleScan} style={{ width: '100%' }} />
            <div className="absolute inset-0 border-[50px] border-black/50 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-blue-400 rounded-lg animate-pulse" />
            <button onClick={() => setIsScanning(false)} className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-red-500 text-white px-8 py-2 rounded-full font-bold">
              CANCEL
            </button>
          </div>
        ) : (
          <div className="space-y-8 w-full max-w-xs">
            <button 
              onClick={() => setIsScanning(true)}
              className="w-full aspect-square bg-blue-600 rounded-[3rem] shadow-2xl shadow-blue-200 flex flex-col items-center justify-center text-white active:scale-95 transition-all"
            >
              <QrCode size={100} strokeWidth={1.5} />
              <span className="text-2xl font-black mt-4 uppercase tracking-widest">Scan Card</span>
            </button>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Collected Today</p>
              <p className="text-3xl font-black text-slate-800">₦0.00</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

/**
 * 4. AJO OWNER DASHBOARD
 * Real-time monitoring and management
 */
const OwnerDashboard = ({ user }) => {
  const [txs, setTxs] = useState([]);
  const [view, setView] = useState('stats'); // stats, members, map

  useEffect(() => {
    fetchInitialData();
    const channel = supabase
      .channel('realtime_ajo')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'transactions', filter: `ajo_owner_id=eq.${user.id}` },
        (payload) => setTxs(prev => [payload.new, ...prev])
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const fetchInitialData = async () => {
    const { data } = await supabase.from('transactions')
      .select('*, contributors(full_name)')
      .eq('ajo_owner_id', user.id)
      .order('created_at', { ascending: false });
    setTxs(data || []);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-black text-white p-6 flex flex-col gap-8 shadow-2xl">
        <div>
          <h1 className="text-2xl font-black tracking-tighter">ORE-OFE OLUWA</h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Lekki Branch Control</p>
        </div>
        
        <nav className="space-y-2">
          <button onClick={() => setView('stats')} className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${view === 'stats' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-white/5'}`}>
            <BarChart3 size={20} /> Dashboard
          </button>
          <button onClick={() => setView('members')} className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${view === 'members' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-white/5'}`}>
            <Users size={20} /> Members
          </button>
          <button onClick={() => setView('map')} className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${view === 'map' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-white/5'}`}>
            <Navigation size={20} /> Live Routes
          </button>
        </nav>

        <div className="mt-auto">
          <button onClick={() => supabase.auth.signOut()} className="flex items-center gap-2 text-red-400 text-sm font-bold">
            <LogOut size={16} /> SIGN OUT
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-4xl font-black text-slate-800">Operational Overview</h2>
            <p className="text-slate-500 font-medium">Real-time status of all collections</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-right min-w-[200px]">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Total Revenue Today</p>
            <p className="text-3xl font-black text-blue-600">₦{txs.reduce((sum, t) => sum + t.amount, 0).toLocaleString()}</p>
          </div>
        </header>

        {view === 'stats' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white p-6 rounded-3xl shadow-sm border h-80">
                <h3 className="font-bold text-slate-400 uppercase text-xs mb-6">Collection Velocity (Hourly)</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={txs.slice(0, 10).reverse()}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis hide />
                    <YAxis hide />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Line type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={4} dot={{ r: 6, fill: '#2563eb' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
                <div className="p-6 border-b flex justify-between items-center">
                  <h3 className="font-black text-slate-800 uppercase text-sm">Live Activity Feed</h3>
                  <span className="bg-blue-100 text-blue-600 text-[10px] font-bold px-3 py-1 rounded-full animate-pulse">LIVE UPDATE</span>
                </div>
                <div className="divide-y max-h-[400px] overflow-y-auto">
                  {txs.map(tx => (
                    <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${tx.geofence_verified ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          <Zap size={16} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{tx.contributors?.full_name || 'Member'}</p>
                          <p className="text-[10px] text-slate-400">{new Date(tx.created_at).toLocaleTimeString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-slate-800">₦{tx.amount}</p>
                        <p className={`text-[10px] font-bold ${tx.geofence_verified ? 'text-green-500' : 'text-red-500'}`}>
                          {tx.geofence_verified ? 'ON-SITE' : 'OFF-SITE ALERT'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-black text-white p-8 rounded-[2rem] shadow-xl">
                <h3 className="text-blue-400 font-bold text-xs uppercase mb-4 tracking-tighter">Member Quick Add</h3>
                <p className="text-sm text-slate-300 mb-6 italic">Automatically generate branded Ore-Ofe Oluwa membership cards for new members.</p>
                <button className="w-full bg-white text-black p-4 rounded-xl font-black flex items-center justify-center gap-2 hover:bg-blue-500 hover:text-white transition-all">
                  <Plus size={20} /> REGISTER MEMBER
                </button>
              </div>
              
              <div className="bg-white p-6 rounded-[2rem] border shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-black text-xs uppercase tracking-widest text-slate-400">Card Preview</h3>
                  <Printer size={16} className="text-slate-400 cursor-pointer" />
                </div>
                <div className="scale-75 origin-top">
                  <MembershipCard member={{
                    full_name: "Adekunle Ciroma",
                    registration_no: "OOO/2024/77",
                    address: "Lekki Phase 1, Lagos",
                    phone_number: "08107218385",
                    expected_amount: 5000,
                    id: 'sample-uuid'
                  }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'members' && (
          <div className="bg-white rounded-3xl p-8 shadow-sm border">
             <h2 className="text-2xl font-black mb-6">Member Registry</h2>
             <p className="text-slate-500">Search and manage all registered contributors.</p>
             {/* Member list logic here */}
          </div>
        )}
      </main>
    </div>
  );
};

// --- MAIN APP COMPONENT ---
export default function App() {
  const [user, setUser] = useState(null);
  const [location, setLocation] = useState(null);
  const [locError, setLocError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check Auth Session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) fetchProfile(session.user.id);
      else setLoading(false);
    });

    // 2. Continuous Location Watch
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocError(false);
      },
      (err) => setLocError(true),
      { enableHighAccuracy: true, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const fetchProfile = async (uid) => {
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', uid).single();
    if (profile.role === 'employee') {
      const { data: emp } = await supabase.from('employees').select('*').eq('user_id', uid).single();
      setUser({ ...profile, employee_profile_id: emp.id });
    } else {
      setUser(profile);
    }
    setLoading(false);
  };

  if (loading) return (
    <div className="h-screen bg-slate-900 flex items-center justify-center text-white font-black italic text-3xl animate-pulse">
      ORE-OFE OLUWA...
    </div>
  );

  // Simple Auth Toggle for Demo - In production, use real Login UI
  if (!user) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
       <div className="p-12 bg-white rounded-3xl shadow-2xl text-center max-w-sm">
         <h1 className="text-3xl font-black italic mb-6">ORE-OFE OLUWA</h1>
         <p className="text-slate-500 mb-8">Please sign in to access the automated collection system.</p>
         <button 
           onClick={() => fetchProfile('YOUR_TEST_UID')} // Replace with actual login logic
           className="w-full bg-black text-white py-4 rounded-xl font-bold"
          >
           CONTINUE TO SYSTEM
         </button>
       </div>
    </div>
  );

  return (
    <LocationGate location={location} locError={locError}>
      {user.role === 'employee' ? (
        <CollectionInterface user={user} location={location} />
      ) : (
        <OwnerDashboard user={user} />
      )}
    </LocationGate>
  );
}
