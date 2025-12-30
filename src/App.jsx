import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Scanner } from '@yudiel/react-qr-scanner';
import {
  Users, UserPlus, LayoutDashboard, LogOut,
  CheckCircle, Landmark, X, Camera, RefreshCw, Trash2,
  DollarSign, Search, Phone, MapPin, Printer
} from 'lucide-react';

/* ===================== CONFIG ===================== */
const SUPABASE_URL = 'https://watrosnylvkiuvuptdtp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhdHJvc255bHZraXV2dXB0ZHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MzE2NzEsImV4cCI6MjA4MjUwNzY3MX0.ku6_Ngf2JRJ8fxLs_Q-EySgCU37MjUK3WofpO9bazds';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const BUSINESS = {
  name: "ORE-OFE OLUWA",
  address: "No. 1, Bisiriyu Owokade Street, Molete, Ibeju-Lekki, Lagos.",
  phones: "08107218385, 08027203601"
};

export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [view, setView] = useState('dashboard');
  const [members, setMembers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ today: 0, members: 0 });

  const fetchData = async () => {
    const [m, t] = await Promise.all([
      supabase.from('contributors').select('*').order('full_name'),
      supabase.from('transactions').select('*').order('created_at', { ascending: false })
    ]);
    const today = new Date().toISOString().slice(0, 10);
    const todayRev = (t.data || []).filter(x => x.created_at?.startsWith(today)).reduce((s, x) => s + (x.amount || 0), 0);
    setMembers(m.data || []);
    setTransactions(t.data || []);
    setStats({ today: todayRev, members: m.data?.length || 0 });
  };

  useEffect(() => { if (user) fetchData(); }, [user]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const u = e.target.username.value.trim().toLowerCase();
    const p = e.target.password.value;
    if (u === 'oreofe' && p === 'oreofe') {
      setUser({ id: 'admin' }); setProfile({ full_name: 'Admin', role: 'admin' });
    } else {
      const { data } = await supabase.from('employees').select('*').eq('employee_id_number', u).eq('password', p).single();
      if (data) { setUser({ id: data.id }); setProfile({ ...data, role: 'employee' }); }
      else alert('Login Failed');
    }
  };

  if (!user) return <LoginScreen onLogin={handleLogin} />;

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <h1 style={styles.brand}>{BUSINESS.name}</h1>
        <div style={styles.userBadge}>{profile?.full_name}</div>
      </header>

      <main style={styles.main}>
        {profile?.role === 'admin' ? (
          <>
            {view === 'dashboard' && <Dashboard stats={stats} transactions={transactions} onRefresh={fetchData} />}
            {view === 'members' && <Members members={members} onRefresh={fetchData} />}
          </>
        ) : (
          <ScannerView profile={profile} onRefresh={fetchData} />
        )}
      </main>

      <nav style={styles.nav}>
        <button onClick={() => setView('dashboard')} style={view === 'dashboard' ? styles.navActive : styles.navBtn}><LayoutDashboard size={20}/>Home</button>
        {profile?.role === 'admin' && (
          <button onClick={() => setView('members')} style={view === 'members' ? styles.navActive : styles.navBtn}><Users size={20}/>Members</button>
        )}
        <button onClick={() => setUser(null)} style={styles.navBtn}><LogOut size={20}/>Exit</button>
      </nav>
    </div>
  );
}

/* ==================== QR CARD PRINTING ==================== */
const PrintModal = ({ member, onClose }) => {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(JSON.stringify({ id: member.id }))}`;

  return (
    <div style={styles.overlay}>
      <div style={styles.card} id="member-card">
        <div style={styles.cardTop}>
          <h3 style={{margin: 0, fontSize: 16}}>{BUSINESS.name}</h3>
          <p style={{fontSize: 7, margin: '2px 0'}}>{BUSINESS.address}</p>
        </div>
        <div style={styles.cardMid}>
          <img src={qrUrl} alt="QR" style={{width: 100, height: 100, border: '1px solid #eee'}} />
          <div style={styles.cardDetails}>
            <p><strong>NAME:</strong> {member.full_name}</p>
            <p><strong>REG NO:</strong> {member.registration_number}</p>
            <p><strong>TEL:</strong> {member.phone_number}</p>
            <p style={{fontSize: 7}}><strong>ADDR:</strong> {member.address}</p>
          </div>
        </div>
        <div style={styles.cardFoot}>OFFICIAL MEMBERSHIP CARD</div>
      </div>
      <div style={{marginTop: 20, display: 'flex', gap: 10}}>
        <button onClick={() => window.print()} style={styles.btnP}>PRINT CARD</button>
        <button onClick={onClose} style={styles.btnS}>CLOSE</button>
      </div>
    </div>
  );
};

/* ==================== VIEWS ==================== */
const Dashboard = ({ stats, transactions, onRefresh }) => (
  <div>
    <div style={styles.grid}>
      <div style={styles.stat}><h2>₦{stats.today.toLocaleString()}</h2><p>Today's Collection</p></div>
      <div style={styles.stat}><h2>{stats.members}</h2><p>Members</p></div>
    </div>
    <h3 style={{margin: '20px 0 10px'}}>Recent Collections</h3>
    {transactions.slice(0, 5).map(t => (
      <div key={t.id} style={styles.item}>
        <span>{t.contributor_name}</span>
        <strong>₦{t.amount}</strong>
      </div>
    ))}
    <button onClick={onRefresh} style={{...styles.btnS, width: '100%', marginTop: 10}}><RefreshCw size={16}/> Refresh Data</button>
  </div>
);

const Members = ({ members, onRefresh }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState(null);

  const handleAdd = async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const { error } = await supabase.from('contributors').insert([{
      full_name: f.get('n'), registration_number: f.get('r'),
      phone_number: f.get('p'), address: f.get('a'),
      expected_amount: Number(f.get('m')), ajo_owner_id: 'admin'
    }]);
    if (!error) { setShowAdd(false); onRefresh(); } else alert("Database error. Did you run the SQL fix?");
  };

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 20}}>
        <h2>Members</h2>
        <button onClick={() => setShowAdd(true)} style={styles.btnP}><UserPlus size={18}/> New</button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} style={styles.form}>
          <input name="n" placeholder="Full Name" style={styles.input} required />
          <input name="r" placeholder="Registration No" style={styles.input} required />
          <input name="p" placeholder="Phone Number" style={styles.input} required />
          <input name="a" placeholder="Residential Address" style={styles.input} required />
          <input name="m" type="number" placeholder="Daily Amount (₦)" style={styles.input} required />
          <button type="submit" style={{...styles.btnP, width: '100%'}}>Save Member</button>
        </form>
      )}

      {members.map(m => (
        <div key={m.id} style={styles.item}>
          <div>
            <p style={{margin: 0, fontWeight: 'bold'}}>{m.full_name}</p>
            <small style={{color: '#3b82f6'}}>{m.registration_number}</small>
          </div>
          <button onClick={() => setSelected(m)} style={styles.btnIcon}><Printer size={20}/></button>
        </div>
      ))}
      {selected && <PrintModal member={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

const ScannerView = ({ profile, onRefresh }) => {
  const [scanning, setScanning] = useState(false);
  const [done, setDone] = useState(null);

  const handleScan = async (data) => {
    try {
      const parsed = JSON.parse(data);
      const { data: mem } = await supabase.from('contributors').select('*').eq('id', parsed.id).single();
      await supabase.from('transactions').insert([{
        contributor_id: mem.id, contributor_name: mem.full_name,
        employee_id: profile.id, amount: mem.expected_amount, ajo_owner_id: 'admin'
      }]);
      setDone(mem); setScanning(false); onRefresh();
    } catch (e) { alert("Invalid Card QR"); }
  };

  if (done) return (
    <div style={styles.done}>
      <CheckCircle size={60} color="#10b981" />
      <h1>₦{done.expected_amount}</h1>
      <p>Payment recorded for {done.full_name}</p>
      <button onClick={() => setDone(null)} style={styles.btnP}>Next Collection</button>
    </div>
  );

  return (
    <div style={{textAlign: 'center'}}>
      {!scanning ? (
        <button onClick={() => setScanning(true)} style={{...styles.btnP, width: '100%', padding: 40}}>
          <Camera size={30} /><br/>TAP TO SCAN CARD
        </button>
      ) : (
        <div style={styles.scanBox}>
          <Scanner onScan={(d) => d[0] && handleScan(d[0].rawValue)} />
          <button onClick={() => setScanning(false)} style={styles.closeBtn}><X/></button>
        </div>
      )}
    </div>
  );
};

const LoginScreen = ({ onLogin }) => (
  <div style={styles.loginPage}>
    <div style={styles.loginCard}>
      <Landmark size={40} color="#3b82f6" style={{marginBottom: 10}}/>
      <h2 style={{margin: 0}}>{BUSINESS.name}</h2>
      <p style={{fontSize: 12, color: '#94a3b8', marginBottom: 20}}>Management Portal</p>
      <form onSubmit={onLogin}>
        <input name="username" placeholder="Username / ID" style={styles.input} required />
        <input name="password" type="password" placeholder="Password" style={styles.input} required />
        <button type="submit" style={{...styles.btnP, width: '100%', padding: 15}}>SIGN IN</button>
      </form>
    </div>
  </div>
);

/* ==================== STYLES ==================== */
const styles = {
  app: { minHeight: '100vh', background: '#020617', color: '#fff', fontFamily: 'sans-serif' },
  header: { padding: '15px 20px', background: '#0f172a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b' },
  brand: { fontSize: 16, color: '#3b82f6', margin: 0 },
  userBadge: { background: '#1e293b', padding: '5px 12px', borderRadius: 20, fontSize: 12 },
  main: { padding: 20, paddingBottom: 100 },
  nav: { position: 'fixed', bottom: 0, width: '100%', background: '#0f172a', display: 'flex', justifyContent: 'space-around', padding: '10px 0', borderTop: '1px solid #1e293b' },
  navBtn: { background: 'none', border: 'none', color: '#64748b', fontSize: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  navActive: { background: 'none', border: 'none', color: '#3b82f6', fontSize: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  btnP: { background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 },
  btnS: { background: '#1e293b', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer' },
  btnIcon: { background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer' },
  input: { width: '100%', padding: 12, marginBottom: 12, background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, color: '#fff', boxSizing: 'border-box' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 },
  stat: { background: '#0f172a', padding: 20, borderRadius: 15, textAlign: 'center', border: '1px solid #1e293b' },
  item: { background: '#0f172a', padding: 15, borderRadius: 12, marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #1e293b' },
  form: { background: '#0f172a', padding: 20, borderRadius: 15, border: '1px solid #3b82f6', marginBottom: 20 },
  loginPage: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  loginCard: { background: '#0f172a', padding: 30, borderRadius: 24, width: '100%', maxWidth: 350, textAlign: 'center', border: '1px solid #1e293b' },
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  card: { width: '260px', background: '#fff', color: '#000', padding: 15, borderRadius: 12, textAlign: 'center', border: '2px solid #000' },
  cardTop: { borderBottom: '1px solid #000', paddingBottom: 5, marginBottom: 10 },
  cardMid: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 },
  cardDetails: { textAlign: 'left', width: '100%', fontSize: '10px', lineHeight: '1.2' },
  cardFoot: { marginTop: 10, fontSize: 10, fontWeight: 'bold', borderTop: '1px solid #000', paddingTop: 5 },
  scanBox: { position: 'relative', borderRadius: 20, overflow: 'hidden' },
  closeBtn: { position: 'absolute', top: 10, right: 10, background: '#000', color: '#fff', border: 'none', borderRadius: '50%', padding: 5 },
  done: { textAlign: 'center', padding: 40, background: '#0f172a', borderRadius: 20 }
};

if (typeof document !== 'undefined') {
  const s = document.createElement('style');
  s.innerHTML = `@media print { body * { visibility: hidden; } #member-card, #member-card * { visibility: visible; } #member-card { position: absolute; left: 0; top: 0; width: 100%; border: none; } .overlay { background: none; } button { display: none; } }`;
  document.head.appendChild(s);
}
