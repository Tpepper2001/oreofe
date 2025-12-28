import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import QrScanner from 'react-qr-scanner';
import QRCode from 'qrcode.react';
import { 
  MapPin, ShieldAlert, CheckCircle, Smartphone, BarChart3, 
  Users, QrCode, Plus, LogOut, Navigation, Zap, Printer,
  UserPlus, Briefcase, ChevronRight, Search, Activity, 
  Trash2, X, CreditCard, Clock, Map
} from 'lucide-react';

// --- DATABASE CONFIGURATION ---
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ORG_DETAILS = {
  name: "ORE-OFE OLUWA",
  address: "No. 1, Bisiriyu Owokade Street, Molete, Ibeju-Lekki, Lagos",
  phones: ["08107218385", "08027203601"],
};

// --- UTILITIES ---
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371e3; // meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// --- REUSABLE COMPONENTS ---

/**
 * MembershipCard: Branded Green/White Physical Card Component
 */
const MembershipCard = ({ member, idPrefix = "card" }) => {
  const qrValue = `${member.id}|${member.expected_amount}|${member.registration_no}`;
  return (
    <div id={`${idPrefix}-${member.id}`} className="w-[350px] h-[215px] bg-white border-[4px] border-green-800 p-2 flex flex-col font-serif relative overflow-hidden shadow-2xl shrink-0 mx-auto">
      {/* Vertical Side Header */}
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-green-800 text-white flex items-center justify-center">
        <h1 className="rotate-90 whitespace-nowrap text-xl font-black tracking-tighter uppercase">{ORG_DETAILS.name}</h1>
      </div>
      
      <div className="flex-1 pr-14 text-[10px] flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start border-b-2 border-green-800 pb-1">
            <p className="font-bold text-green-900 italic">MEMBERSHIP CARD</p>
            <span className="text-red-600 font-bold tracking-tight">Reg No: {member.registration_no}</span>
          </div>
          
          <div className="mt-3 space-y-2">
            <div className="border-b border-gray-200 flex py-0.5">
              <span className="font-bold w-12 text-green-800">NAME:</span> 
              <span className="font-bold uppercase">{member.full_name}</span>
            </div>
            <div className="border-b border-gray-200 flex py-0.5">
              <span className="font-bold w-12 text-green-800">ADDR:</span> 
              <span className="truncate">{member.address}</span>
            </div>
            <div className="border-b border-gray-200 flex py-0.5">
              <span className="font-bold w-12 text-green-800">PHONE:</span> 
              <span>{member.phone_number}</span>
            </div>
            <div className="flex py-0.5">
              <span className="font-bold w-12 text-green-800">DAILY:</span> 
              <span className="font-bold">₦{member.expected_amount?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-end mb-1">
          <div className="text-[7px] leading-tight text-gray-700 max-w-[150px]">
            <p className="font-bold text-green-900">{ORG_DETAILS.address}</p>
            <p className="font-bold mt-1 uppercase italic">{ORG_DETAILS.phones.join(' • ')}</p>
          </div>
          <div className="bg-white p-1 border border-green-800">
            <QRCode value={qrValue} size={65} level="H" />
          </div>
        </div>
      </div>
    </div>
  );
};

// --- PAGES ---

/**
 * 1. Login Page: Admin (oreofe/oreofe) or Employee (By ID)
 */
const LoginPage = ({ onLogin }) => {
  const [mode, setMode] = useState('employee'); 
  const [form, setForm] = useState({ user: '', pass: '', empId: '' });
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    if (mode === 'admin') {
      if (form.user === 'oreofe' && form.pass === 'oreofe') {
        onLogin({ role: 'admin', full_name: 'Central Administrator', id: 'admin' });
      } else {
        setError('Invalid Admin Credentials');
      }
    } else {
      const { data } = await supabase.from('employees').select('*').eq('employee_id_number', form.empId).single();
      if (data) onLogin({ ...data, role: 'employee' });
      else setError('Employee ID not recognized');
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/leaf.png')]">
      <div className="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-md border-t-8 border-green-700">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black italic text-green-800 tracking-tighter">ORE-OFE OLUWA</h1>
          <p className="text-green-600 font-bold text-[10px] uppercase tracking-widest mt-2 border-b-2 border-green-100 pb-2 inline-block">Ajo Automated System</p>
        </div>

        <div className="flex bg-gray-100 p-1.5 rounded-2xl mb-8">
          <button onClick={() => setMode('employee')} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${mode === 'employee' ? 'bg-green-700 text-white shadow-lg' : 'text-gray-500'}`}>Agent Login</button>
          <button onClick={() => setMode('admin')} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${mode === 'admin' ? 'bg-green-700 text-white shadow-lg' : 'text-gray-500'}`}>Admin</button>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {mode === 'admin' ? (
            <>
              <input type="text" onChange={e=>setForm({...form, user: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none" placeholder="Admin Username" />
              <input type="password" onChange={e=>setForm({...form, pass: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none" placeholder="Password" />
            </>
          ) : (
            <input type="text" onChange={e=>setForm({...form, empId: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none" placeholder="Enter Agent ID" />
          )}
          {error && <p className="text-red-500 text-xs font-bold text-center italic">{error}</p>}
          <button className="w-full bg-green-700 text-white py-5 rounded-2xl font-black shadow-xl hover:bg-green-800 transition-all uppercase tracking-widest flex items-center justify-center gap-2">
            Secure Entry <ChevronRight size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

/**
 * 2. Employee Dashboard: High-Speed Scanning Interface
 */
const EmployeeDashboard = ({ user, location, onLogout }) => {
  const [scanning, setScanning] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, processing, success, error
  const [lastMember, setLastMember] = useState(null);

  const handleScan = async (data) => {
    if (data && status === 'idle') {
      setStatus('processing');
      try {
        const [memberId, amount] = data.text.split('|');
        const { data: member } = await supabase.from('contributors').select('*').eq('id', memberId).single();
        
        const dist = calculateDistance(location.lat, location.lng, member.gps_latitude, member.gps_longitude);

        const { error } = await supabase.from('transactions').insert({
          ajo_owner_id: 'admin',
          contributor_id: memberId,
          employee_id: user.id,
          amount: parseFloat(amount),
          expected_amount: parseFloat(amount),
          gps_latitude: location.lat,
          gps_longitude: location.lng,
          distance_from_registered: Math.round(dist),
          geofence_verified: dist <= 100,
          timestamp: new Date().toISOString()
        });

        if (error) throw error;

        // Auto-update contributor balance in background via DB triggers or manual call
        await supabase.rpc('increment_contributor_balance', { row_id: memberId, val: parseFloat(amount) });

        setLastMember(member);
        setStatus('success');
        setTimeout(() => { setStatus('idle'); setScanning(false); }, 3000);
      } catch (err) {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 3000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex flex-col font-sans">
      <header className="bg-white p-6 shadow-sm border-b border-green-100 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-black italic text-green-800">ORE-OFE OLUWA</h1>
          <div className="flex items-center gap-1 text-[9px] font-bold text-gray-400">
            <MapPin size={10} className="text-green-500" /> {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-green-700 uppercase tracking-tighter">{user.full_name}</p>
          <button onClick={onLogout} className="text-[10px] font-black text-red-500 uppercase">Sign Out</button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6">
        {status === 'success' ? (
          <div className="text-center animate-in zoom-in duration-300">
            <div className="w-40 h-40 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white shadow-[0_0_50px_rgba(22,163,74,0.4)]">
              <CheckCircle size={80} />
            </div>
            <h2 className="text-3xl font-black text-green-900 mb-2 tracking-tighter uppercase">₦{lastMember?.expected_amount} LOGGED</h2>
            <p className="text-gray-500 font-medium italic">Confirmed for {lastMember?.full_name}</p>
          </div>
        ) : status === 'processing' ? (
          <div className="text-center">
            <div className="w-20 h-20 border-4 border-green-700 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="font-bold text-green-800">Verifying Collection...</p>
          </div>
        ) : scanning ? (
          <div className="w-full max-w-sm aspect-square relative rounded-[3rem] overflow-hidden border-8 border-green-800 shadow-2xl">
            <QrScanner delay={300} onScan={handleScan} style={{ width: '100%' }} />
            <div className="absolute inset-0 border-[60px] border-black/40 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-green-400 rounded-2xl animate-pulse" />
            <button onClick={() => setScanning(false)} className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-red-600 text-white px-8 py-2 rounded-full font-bold shadow-lg">CANCEL SCAN</button>
          </div>
        ) : (
          <div className="space-y-12 w-full max-w-xs">
            <button onClick={() => setScanning(true)} className="w-full aspect-square bg-green-700 rounded-[4rem] shadow-2xl flex flex-col items-center justify-center text-white active:scale-90 transition-all border-[10px] border-green-800/20">
              <QrCode size={120} strokeWidth={1.5} />
              <span className="text-2xl font-black mt-6 uppercase tracking-widest">Collect Now</span>
            </button>
            <div className="bg-white p-6 rounded-3xl border border-green-100 shadow-xl flex items-center justify-between">
               <div className="text-left">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Today's Progress</p>
                 <p className="text-2xl font-black text-green-900 tracking-tighter">₦0.00</p>
               </div>
               <div className="p-3 bg-green-50 rounded-2xl text-green-700">
                 <Activity size={24} />
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

/**
 * 3. Admin Dashboard: Full System Management
 */
const AdminDashboard = ({ onLogout }) => {
  const [view, setView] = useState('home'); // home, members, employees, transactions
  const [data, setData] = useState({ members: [], employees: [], txs: [], stats: { total: 0 } });
  const [form, setForm] = useState({ name: '', phone: '', amount: '', reg: '', addr: '', empId: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const { data: m } = await supabase.from('contributors').select('*').order('created_at', { ascending: false });
    const { data: e } = await supabase.from('employees').select('*').order('created_at', { ascending: false });
    const { data: t } = await supabase.from('transactions').select('*, contributors(full_name), employees(full_name)').order('timestamp', { ascending: false }).limit(20);
    
    const totalToday = t?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0;
    setData({ members: m || [], employees: e || [], txs: t || [], stats: { total: totalToday } });
    setLoading(false);
  };

  const addMember = async (e) => {
    e.preventDefault();
    // Use current location as registered location for the member
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { error } = await supabase.from('contributors').insert([{
        full_name: form.name, registration_no: form.reg, expected_amount: parseFloat(form.amount),
        phone_number: form.phone, address: form.addr, ajo_owner_id: 'admin',
        gps_latitude: pos.coords.latitude, gps_longitude: pos.coords.longitude,
        qr_code_data: `M-${form.reg}`
      }]);
      if (!error) { alert("Member Profile Created Successfully"); loadData(); setView('members'); }
    });
  };

  const addEmployee = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('employees').insert([{
      full_name: form.name, employee_id_number: form.empId, phone_number: form.phone, ajo_owner_id: 'admin', status: 'active'
    }]);
    if (!error) { alert("Field Agent Registered"); loadData(); setView('home'); }
  };

  const deleteRecord = async (table, id) => {
    if(confirm("Are you sure? This cannot be undone.")) {
      await supabase.from(table).delete().eq('id', id);
      loadData();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <nav className="w-full md:w-72 bg-green-900 text-white p-8 flex flex-col shadow-2xl z-20">
        <div className="mb-12">
          <h1 className="text-2xl font-black italic tracking-tighter">ORE-OFE OLUWA</h1>
          <p className="text-[10px] font-bold text-green-400 uppercase tracking-widest mt-1">Lekki Branch Control</p>
        </div>

        <div className="space-y-3 flex-1">
          <button onClick={()=>setView('home')} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${view==='home'?'bg-white text-green-900 shadow-xl':'text-green-200 hover:bg-green-800'}`}>
            <BarChart3 size={20}/> Dashboard
          </button>
          <button onClick={()=>setView('members')} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${view==='members'?'bg-white text-green-900 shadow-xl':'text-green-200 hover:bg-green-800'}`}>
            <Users size={20}/> Members Directory
          </button>
          <button onClick={()=>setView('txs')} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${view==='txs'?'bg-white text-green-900 shadow-xl':'text-green-200 hover:bg-green-800'}`}>
            <Activity size={20}/> Collection Feed
          </button>
        </div>

        <div className="pt-8 border-t border-green-800 space-y-4">
          <button onClick={()=>setView('add_member')} className="w-full bg-green-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-sm hover:bg-green-600">
            <UserPlus size={16}/> NEW MEMBER
          </button>
          <button onClick={()=>setView('add_emp')} className="w-full bg-white text-green-900 py-3 rounded-xl font-black flex items-center justify-center gap-2 text-sm">
            <Briefcase size={16}/> ADD AGENT
          </button>
          <button onClick={onLogout} className="w-full text-center text-green-400 font-bold text-[10px] uppercase tracking-widest mt-4">Sign Out System</button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        
        {view === 'home' && (
          <div className="animate-in fade-in duration-500">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-4xl font-black text-green-900 tracking-tighter uppercase">System Overview</h2>
                <p className="text-slate-500 font-medium">Status report for {new Date().toLocaleDateString()}</p>
              </div>
              <button onClick={loadData} className="p-3 bg-white rounded-full shadow-sm hover:rotate-180 transition-transform duration-500"><Zap size={20} className="text-green-600"/></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border-l-[12px] border-green-700">
                <p className="text-xs font-black text-slate-400 uppercase mb-2">Total Membership</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-green-900 tracking-tighter">{data.members.length}</span>
                  <span className="text-green-500 font-bold text-sm underline">View All</span>
                </div>
              </div>
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border-l-[12px] border-blue-700">
                <p className="text-xs font-black text-slate-400 uppercase mb-2">Active Field Agents</p>
                <p className="text-5xl font-black text-blue-900 tracking-tighter">{data.employees.length}</p>
              </div>
              <div className="bg-green-900 p-8 rounded-[2rem] shadow-2xl text-white">
                <p className="text-xs font-black text-green-400 uppercase mb-2 italic underline">Daily Revenue (Live)</p>
                <p className="text-5xl font-black tracking-tighter">₦{data.stats.total.toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
               <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
                 <h3 className="font-black text-green-900 uppercase text-sm tracking-widest">Recent Activity Feed</h3>
                 <span className="bg-green-100 text-green-700 text-[10px] font-black px-4 py-1.5 rounded-full animate-pulse uppercase">Live Monitoring</span>
               </div>
               <div className="divide-y divide-slate-50">
                 {data.txs.length === 0 ? (
                    <div className="p-20 text-center text-slate-300 italic">No collections recorded today.</div>
                 ) : data.txs.map(tx => (
                    <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-green-50/30 transition-colors">
                       <div className="flex items-center gap-5">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tx.geofence_verified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                             {tx.geofence_verified ? <CheckCircle size={24}/> : <ShieldAlert size={24}/>}
                          </div>
                          <div>
                            <p className="font-black text-slate-800 uppercase tracking-tighter">{tx.contributors?.full_name}</p>
                            <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase">
                               <Clock size={10}/> {new Date(tx.timestamp).toLocaleTimeString()} • AGENT: {tx.employees?.full_name}
                            </p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-xl font-black text-green-700 tracking-tighter">₦{tx.amount?.toLocaleString()}</p>
                          <p className={`text-[10px] font-black uppercase ${tx.geofence_verified ? 'text-green-500' : 'text-red-500'}`}>
                             {tx.geofence_verified ? 'Verified Location' : 'Location Alert!'}
                          </p>
                       </div>
                    </div>
                 ))}
               </div>
            </div>
          </div>
        )}

        {view === 'add_member' && (
          <div className="max-w-2xl bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100 animate-in slide-in-from-bottom-8">
            <div className="flex justify-between items-center mb-10">
               <h2 className="text-3xl font-black text-green-900 uppercase italic">New Member Registration</h2>
               <div className="p-3 bg-green-50 rounded-2xl text-green-600"><UserPlus size={32}/></div>
            </div>
            <form onSubmit={addMember} className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="md:col-span-2">
                 <label className="text-xs font-black text-slate-400 uppercase mb-3 block">Full Name of Contributor</label>
                 <input required onChange={e=>setForm({...form, name: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-green-600 transition-colors font-bold" placeholder="e.g. ADEKUNLE CHINEDU" />
               </div>
               <div>
                 <label className="text-xs font-black text-slate-400 uppercase mb-3 block">Reg No.</label>
                 <input required onChange={e=>setForm({...form, reg: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none" placeholder="OOO/2024/001" />
               </div>
               <div>
                 <label className="text-xs font-black text-slate-400 uppercase mb-3 block">Daily Amount (₦)</label>
                 <input required onChange={e=>setForm({...form, amount: e.target.value})} type="number" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-black text-green-700" placeholder="2000" />
               </div>
               <div>
                 <label className="text-xs font-black text-slate-400 uppercase mb-3 block">Phone Number</label>
                 <input required onChange={e=>setForm({...form, phone: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none" placeholder="080..." />
               </div>
               <div className="md:col-span-2">
                 <label className="text-xs font-black text-slate-400 uppercase mb-3 block">Full Residential Address</label>
                 <textarea required onChange={e=>setForm({...form, addr: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none min-h-[100px]" placeholder="Detailed address for GPS geofencing verification"></textarea>
               </div>
               <button className="md:col-span-2 bg-green-800 text-white py-6 rounded-[2rem] font-black text-xl shadow-2xl hover:bg-green-700 transition-all uppercase tracking-widest">
                 Generate Official Member Card
               </button>
            </form>
          </div>
        )}

        {view === 'add_emp' && (
          <div className="max-w-xl bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100 animate-in slide-in-from-bottom-8">
            <h2 className="text-3xl font-black text-blue-900 mb-10 flex items-center gap-4">
               <Briefcase size={36} className="text-blue-600" /> AGENT ENROLLMENT
            </h2>
            <form onSubmit={addEmployee} className="space-y-8">
               <input required onChange={e=>setForm({...form, name: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold" placeholder="Full Name" />
               <input required onChange={e=>setForm({...form, empId: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-mono" placeholder="AGENT-ID (e.g. OOO-001)" />
               <input required onChange={e=>setForm({...form, phone: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none" placeholder="Phone Number" />
               <button className="w-full bg-blue-700 text-white py-6 rounded-[2rem] font-black text-xl shadow-2xl">AUTHORIZE FIELD AGENT</button>
            </form>
          </div>
        )}

        {view === 'members' && (
          <div className="animate-in fade-in">
             <div className="flex justify-between items-center mb-10">
               <h2 className="text-3xl font-black text-green-900 tracking-tighter uppercase">Contributor Registry</h2>
               <div className="relative">
                 <Search className="absolute left-4 top-4 text-slate-400" size={20}/>
                 <input type="text" placeholder="Search members..." className="pl-12 pr-6 py-4 border-2 border-slate-100 rounded-full w-80 outline-none focus:border-green-500 shadow-sm" />
               </div>
             </div>
             <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
               {data.members.map(m => (
                 <div key={m.id} className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col items-center">
                    <MembershipCard member={m} />
                    <div className="w-full mt-8 flex gap-4">
                       <div className="flex-1 bg-green-50 p-6 rounded-[2rem] border border-green-100 text-center">
                          <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">Account Balance</p>
                          <p className="text-3xl font-black text-green-900 tracking-tighter">₦{m.current_balance?.toLocaleString()}</p>
                       </div>
                       <div className="flex flex-col gap-2">
                          <button onClick={()=>window.print()} className="p-4 bg-slate-100 rounded-2xl hover:bg-green-100 text-slate-600 hover:text-green-700 transition-all"><Printer size={24}/></button>
                          <button onClick={()=>deleteRecord('contributors', m.id)} className="p-4 bg-red-50 rounded-2xl hover:bg-red-600 text-red-600 hover:text-white transition-all"><Trash2 size={24}/></button>
                       </div>
                    </div>
                 </div>
               ))}
             </div>
          </div>
        )}

        {view === 'txs' && (
           <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
              <div className="p-10 bg-green-900 text-white flex justify-between items-center">
                 <h2 className="text-2xl font-black uppercase tracking-widest">Global Live Feed</h2>
                 <Map size={32} className="text-green-400 opacity-50" />
              </div>
              <table className="w-full">
                <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 border-b">
                   <tr>
                     <th className="p-6 text-left">Time</th>
                     <th className="p-6 text-left">Contributor</th>
                     <th className="p-6 text-left">Agent</th>
                     <th className="p-6 text-left">Amount</th>
                     <th className="p-6 text-left">Verification</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {data.txs.map(tx => (
                      <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-6 text-xs font-bold">{new Date(tx.timestamp).toLocaleTimeString()}</td>
                        <td className="p-6 font-black uppercase text-slate-800 text-sm">{tx.contributors?.full_name}</td>
                        <td className="p-6 font-bold text-slate-500 text-xs italic">{tx.employees?.full_name}</td>
                        <td className="p-6 font-black text-green-700 text-base tracking-tighter">₦{tx.amount?.toLocaleString()}</td>
                        <td className="p-6">
                           <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${tx.geofence_verified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                             {tx.geofence_verified ? 'Verified On-site' : 'Off-site Alert'}
                           </span>
                        </td>
                      </tr>
                   ))}
                </tbody>
              </table>
           </div>
        )}
      </main>
    </div>
  );
};

// --- SYSTEM ROOT WRAPPER ---
export default function App() {
  const [user, setUser] = useState(null);
  const [location, setLocation] = useState(null);
  const [locError, setLocError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Mandatory Real-time Location Tracking
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocError(false);
        setLoading(false);
      },
      (err) => {
        setLocError(true);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Location Access Screen
  if (locError) return (
    <div className="fixed inset-0 bg-red-800 text-white flex flex-col items-center justify-center p-12 text-center z-[100] animate-in fade-in">
      <ShieldAlert size={100} className="mb-8 animate-bounce text-red-200" />
      <h1 className="text-5xl font-black mb-6 uppercase tracking-tighter">SECURITY LOCK: NO GPS</h1>
      <p className="text-xl max-w-lg mb-12 font-medium opacity-90 leading-relaxed">
        The Ore-Ofe Oluwa system requires active high-accuracy GPS to verify collection locations and prevent fraud. Please enable location permissions in your browser and phone settings, then refresh this page.
      </p>
      <button onClick={() => window.location.reload()} className="bg-white text-red-800 px-16 py-6 rounded-[2rem] font-black text-2xl shadow-[0_0_50px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95 transition-all">
        ACTIVATE SYSTEM GPS
      </button>
    </div>
  );

  if (loading) return (
    <div className="h-screen bg-green-900 flex flex-col items-center justify-center text-white p-10 font-sans">
      <div className="w-24 h-24 border-8 border-white/20 border-t-white rounded-full animate-spin mb-10"></div>
      <h1 className="text-4xl font-black italic tracking-tighter animate-pulse">ORE-OFE OLUWA</h1>
      <p className="text-green-300 font-bold uppercase tracking-widest mt-4 text-xs">Securing System Connection...</p>
    </div>
  );

  // Authentication Switch
  if (!user) return <LoginPage onLogin={setUser} />;

  // Role Switch
  return user.role === 'admin' ? (
    <AdminDashboard onLogout={() => setUser(null)} />
  ) : (
    <EmployeeDashboard user={user} location={location} onLogout={() => setUser(null)} />
  );
}
