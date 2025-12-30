import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Scanner } from '@yudiel/react-qr-scanner';
import QRCode from 'react-qr-code'; // Ensure this is installed: npm install react-qr-code
import {
  Users, UserPlus, LayoutDashboard, LogOut,
  CheckCircle, Landmark, X, Camera, RefreshCw, Trash2,
  DollarSign, ReceiptText, Search, Phone, MapPin, Printer
} from 'lucide-react';

/* ===================== CONFIG ===================== */
const SUPABASE_URL = 'https://watrosnylvkiuvuptdtp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhdHJvc255bHZraXV2dXB0ZHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MzE2NzEsImV4cCI6MjA4MjUwNzY3MX0.ku6_Ngf2JRJ8fxLs_Q-EySgCU37MjUK3WofpO9bazds';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const BUSINESS_INFO = {
  name: "ORE-OFE OLUWA",
  address: "No. 1, Bisiriyu Owokade Street, Molete, Ibeju-Lekki, Lagos.",
  phones: "08107218385, 08027203601"
};

/* ===================== MAIN APP ===================== */
export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [view, setView] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [loginMode, setLoginMode] = useState('admin');
  const [members, setMembers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ totalRevenue: 0, todayRevenue: 0, activeMembers: 0 });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [memRes, transRes] = await Promise.all([
        supabase.from('contributors').select('*').order('full_name'),
        supabase.from('transactions').select('*').order('created_at', { ascending: false })
      ]);
      setMembers(memRes.data || []);
      setTransactions(transRes.data || []);
      const today = new Date().toISOString().slice(0, 10);
      const totalRev = (transRes.data || []).reduce((sum, t) => sum + (t.amount || 0), 0);
      const todayRev = (transRes.data || []).filter(t => t.created_at?.slice(0, 10) === today).reduce((sum, t) => sum + (t.amount || 0), 0);
      setStats({ totalRevenue: totalRev, todayRevenue: todayRev, activeMembers: memRes.data?.length || 0 });
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { if (user) fetchData(); }, [user]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const u = e.target.username.value.trim().toLowerCase();
    const p = e.target.password.value;
    if (loginMode === 'admin' && u === 'oreofe' && p === 'oreofe') {
      setUser({ id: 'admin' }); setProfile({ full_name: 'Admin', role: 'admin' });
    } else {
      const { data } = await supabase.from('employees').select('*').eq('employee_id_number', u).eq('password', p).single();
      if (data) { setUser({ id: data.id }); setProfile({ ...data, role: 'employee' }); }
      else alert('Login Failed');
    }
  };

  if (!user) return <LoginScreen onLogin={handleLogin} loading={loading} loginMode={loginMode} setLoginMode={setLoginMode} />;

  return (
    <div style={styles.appContainer}>
      <header style={styles.appHeader}>
        <h1 style={styles.brandH1}>{BUSINESS_INFO.name}</h1>
        <div style={styles.profilePill}><span>{profile?.full_name}</span></div>
      </header>

      <main style={styles.contentArea}>
        {profile?.role === 'admin' ? (
          <>
            {view === 'dashboard' && <OwnerDashboard stats={stats} transactions={transactions} onRefresh={fetchData} />}
            {view === 'members' && <MemberManagement members={members} onRefresh={fetchData} />}
            {view === 'transactions' && <TransactionHistory transactions={transactions} />}
          </>
        ) : (
          <CollectionInterface profile={profile} onRefresh={fetchData} />
        )}
      </main>

      <nav style={styles.bottomNav}>
        <button onClick={() => setView('dashboard')} style={view === 'dashboard' ? styles.navActive : styles.navBtn}><LayoutDashboard /><span>Home</span></button>
        {profile?.role === 'admin' && (
          <button onClick={() => setView('members')} style={view === 'members' ? styles.navActive : styles.navBtn}><Users /><span>Members</span></button>
        )}
        <button onClick={() => { setUser(null); setProfile(null); }} style={styles.navBtn}><LogOut /><span>Exit</span></button>
      </nav>
    </div>
  );
}

/* ==================== QR CARD COMPONENT ==================== */
const MemberCard = ({ member, onClose }) => {
  const printCard = () => { window.print(); };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.cardPrintout} id="printableCard">
        <div style={styles.cardHeader}>
          <h2 style={{margin: 0, fontSize: 18}}>{BUSINESS_INFO.name}</h2>
          <p style={{fontSize: 8, margin: '2px 0'}}>{BUSINESS_INFO.address}</p>
        </div>
        <div style={styles.cardBody}>
          <div style={styles.qrWrapper}>
            <QRCode value={JSON.stringify({ id: member.id })} size={100} />
          </div>
          <div style={styles.cardInfo}>
            <p><strong>NAME:</strong> {member.full_name}</p>
            <p><strong>REG NO:</strong> {member.registration_number}</p>
            <p><strong>PHONE:</strong> {member.phone_number}</p>
            <p><strong>ADDR:</strong> {member.address}</p>
          </div>
        </div>
        <div style={styles.cardFooter}>MEMBERSHIP CARD</div>
      </div>
      <div style={{display: 'flex', gap: 10, marginTop: 20}}>
        <button onClick={printCard} style={styles.btnPrimary}><Printer size={18}/> PRINT CARD</button>
        <button onClick={onClose} style={styles.btnSecondary}>CLOSE</button>
      </div>
    </div>
  );
};

/* ==================== MEMBER MANAGEMENT ==================== */
const MemberManagement = ({ members, onRefresh }) => {
  const [adding, setAdding] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const handleAdd = async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const { error } = await supabase.from('contributors').insert([{
      full_name: f.get('name'),
      registration_number: f.get('reg'),
      phone_number: f.get('phone'),
      address: f.get('addr'),
      expected_amount: Number(f.get('amt')),
      ajo_owner_id: 'admin'
    }]);
    if (!error) { setAdding(false); onRefresh(); } else alert("Database Error: Check columns");
  };

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 20}}>
        <h2>Members</h2>
        <button onClick={() => setAdding(true)} style={styles.btnPrimary}><UserPlus size={18}/> Add</button>
      </div>

      {adding && (
        <form onSubmit={handleAdd} style={styles.cardForm}>
          <input name="name" placeholder="Full Name" style={styles.input} required />
          <input name="reg" placeholder="Registration No" style={styles.input} required />
          <input name="phone" placeholder="Phone Number" style={styles.input} required />
          <input name="addr" placeholder="Address" style={styles.input} required />
          <input name="amt" type="number" placeholder="Daily Amount" style={styles.input} required />
          <button type="submit" style={styles.btnPrimary}>Save Member</button>
        </form>
      )}

      {members.map(m => (
        <div key={m.id} style={styles.listItem}>
          <div style={{flex: 1}}>
            <p style={{fontWeight: 700}}>{m.full_name}</p>
            <p style={{fontSize: 12, color: '#3b82f6'}}>{m.registration_number}</p>
          </div>
          <button onClick={() => setSelectedMember(m)} style={styles.btnIcon}><Printer size={20} color="#3b82f6"/></button>
        </div>
      ))}

      {selectedMember && <MemberCard member={selectedMember} onClose={() => setSelectedMember(null)} />}
    </div>
  );
};

/* ==================== AGENT INTERFACE ==================== */
const CollectionInterface = ({ profile, onRefresh }) => {
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(null);

  const onScan = async (data) => {
    try {
      const parsed = JSON.parse(data);
      const { data: mem } = await supabase.from('contributors').select('*').eq('id', parsed.id).single();
      await supabase.from('transactions').insert([{
        contributor_id: mem.id, contributor_name: mem.full_name,
        employee_id: profile.id, amount: mem.expected_amount, ajo_owner_id: 'admin'
      }]);
      setScanned(mem); setScanning(false); onRefresh();
    } catch (e) { alert("Invalid Card"); }
  };

  if (scanned) return (
    <div style={styles.successCard}>
      <CheckCircle size={60} color="#10b981" />
      <h2>₦{scanned.expected_amount}</h2>
      <p>Collected from {scanned.full_name}</p>
      <button onClick={() => setScanned(null)} style={styles.btnPrimary}>Next Member</button>
    </div>
  );

  return (
    <div style={{textAlign: 'center'}}>
      {!scanning ? (
        <button onClick={() => setScanning(true)} style={{...styles.btnPrimary, width: '100%', padding: 30}}>
          <Camera size={30} /> START SCANNING
        </button>
      ) : (
        <div style={styles.scannerBox}>
          <Scanner onScan={(d) => d[0] && onScan(d[0].rawValue)} />
          <button onClick={() => setScanning(false)} style={styles.closeBtn}><X/></button>
        </div>
      )}
    </div>
  );
};

/* ==================== LOGIN & OTHER COMPONENTS ==================== */
const OwnerDashboard = ({ stats, transactions, onRefresh }) => (
    <div>
        <div style={styles.statsGrid}>
            <div style={styles.statCard}><h3>₦{stats.todayRevenue}</h3><p>Today</p></div>
            <div style={styles.statCard}><h3>{stats.activeMembers}</h3><p>Members</p></div>
        </div>
        <h3 style={{margin: '20px 0'}}>Recent Activity</h3>
        {transactions.slice(0, 5).map(t => (
            <div key={t.id} style={styles.listItem}>
                <span>{t.contributor_name}</span>
                <strong>₦{t.amount}</strong>
            </div>
        ))}
    </div>
);

const TransactionHistory = ({ transactions }) => (
    <div>{transactions.map(t => (
        <div key={t.id} style={styles.listItem}>
            <div><p>{t.contributor_name}</p><small>{new Date(t.created_at).toLocaleString()}</small></div>
            <strong>₦{t.amount}</strong>
        </div>
    ))}</div>
);

const LoginScreen = ({ onLogin, loading, loginMode, setLoginMode }) => (
  <div style={styles.loginPage}>
    <div style={styles.loginCard}>
      <Landmark size={40} color="#3b82f6" style={{marginBottom: 10}}/>
      <h2 style={{marginBottom: 20}}>{BUSINESS_INFO.name}</h2>
      <div style={styles.toggleRow}>
        <button onClick={() => setLoginMode('admin')} style={loginMode === 'admin' ? styles.toggleActive : styles.toggleBtn}>ADMIN</button>
        <button onClick={() => setLoginMode('agent')} style={loginMode === 'agent' ? styles.toggleActive : styles.toggleBtn}>AGENT</button>
      </div>
      <form onSubmit={onLogin}>
        <input name="username" placeholder="ID" style={styles.input} required />
        <input name="password" type="password" placeholder="Password" style={styles.input} required />
        <button type="submit" style={{...styles.btnPrimary, width: '100%'}}>LOGIN</button>
      </form>
    </div>
  </div>
);

/* ==================== STYLES ==================== */
const styles = {
  appContainer: { minHeight: '100vh', background: '#020617', color: '#fff', fontFamily: 'sans-serif' },
  appHeader: { padding: '15px 20px', background: '#0f172a', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between' },
  brandH1: { fontSize: 16, color: '#3b82f6', margin: 0 },
  profilePill: { background: '#1e293b', padding: '4px 12px', borderRadius: 20, fontSize: 12 },
  contentArea: { padding: 20, paddingBottom: 100 },
  bottomNav: { position: 'fixed', bottom: 0, width: '100%', background: '#0f172a', display: 'flex', justifyContent: 'space-around', padding: '10px 0' },
  navBtn: { background: 'none', border: 'none', color: '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: 10 },
  navActive: { background: 'none', border: 'none', color: '#3b82f6', display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: 10 },
  btnPrimary: { background: '#3b82f6', color: '#fff', border: 'none', padding: '12px', borderRadius: 8, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' },
  btnSecondary: { background: '#334155', color: '#fff', border: 'none', padding: '12px', borderRadius: 8 },
  btnIcon: { background: 'none', border: 'none', cursor: 'pointer' },
  input: { width: '100%', padding: '12px', marginBottom: '10px', background: '#0f172a', border: '1px solid #1e293b', color: '#fff', borderRadius: 8, boxSizing: 'border-box' },
  listItem: { background: '#0f172a', padding: '15px', borderRadius: 12, marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #1e293b' },
  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  statCard: { background: '#0f172a', padding: '20px', borderRadius: 15, textAlign: 'center', border: '1px solid #1e293b' },
  cardForm: { background: '#0f172a', padding: '20px', borderRadius: 15, marginBottom: 20, border: '1px solid #3b82f6' },
  loginPage: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  loginCard: { background: '#0f172a', padding: '30px', borderRadius: 20, width: '100%', maxWidth: 350, textAlign: 'center' },
  toggleRow: { display: 'flex', background: '#020617', padding: '5px', borderRadius: 10, marginBottom: 20 },
  toggleBtn: { flex: 1, background: 'none', border: 'none', color: '#64748b', padding: '8px' },
  toggleActive: { flex: 1, background: '#3b82f6', color: '#fff', padding: '8px', borderRadius: 8 },
  scannerBox: { position: 'relative', borderRadius: 20, overflow: 'hidden' },
  closeBtn: { position: 'absolute', top: 10, right: 10, background: '#000', color: '#fff', border: 'none', borderRadius: '50%', padding: '5px' },
  successCard: { textAlign: 'center', padding: '40px', background: '#0f172a', borderRadius: 20 },
  // PRINT STYLES
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  cardPrintout: { width: '280px', background: '#fff', color: '#000', padding: '15px', borderRadius: '10px', textAlign: 'center', border: '2px solid #000' },
  cardHeader: { borderBottom: '2px solid #000', paddingBottom: '5px', marginBottom: '10px' },
  cardBody: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' },
  cardInfo: { textAlign: 'left', width: '100%', fontSize: '10px', lineHeight: '1.4' },
  qrWrapper: { padding: '5px', background: '#fff' },
  cardFooter: { marginTop: '10px', fontSize: '12px', fontWeight: 'bold', borderTop: '1px solid #000', paddingTop: '5px' }
};
