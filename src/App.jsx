import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import QrScanner from "react-qr-scanner";
import QRCode from "qrcode.react";
import {
  Layout,
  Users,
  UserPlus,
  Briefcase,
  CreditCard,
  LogOut,
  QrCode,
  CheckCircle,
  ShieldAlert,
  Download,
  Printer,
  Trash2,
} from "lucide-react";

/* ===================== CONFIG ===================== */
const SUPABASE_URL ='https://watrosnylvkiuvuptdtp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhdHJvc255bHZraXV2dXB0ZHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MzE2NzEsImV4cCI6MjA4MjUwNzY3MX0.ku6_Ngf2JRJ8fxLs_Q-EySgCU37MjUK3WofpO9bazds';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ORG_DETAILS = {
  name: "ORE-OFE OLUWA",
  address: "No. 1, Bisiriyu Owokade Street, Molete, Ibeju-Lekki, Lagos",
  phones: ["08107218385", "08027203601"],
};

/* ===================== THEME ===================== */
const theme = Object.freeze({
  primary: "#064e3b",
  secondary: "#10b981",
  accent: "#34d399",
  bg: "#f8fafc",
  white: "#ffffff",
  text: "#0f172a",
  gray: "#64748b",
  error: "#dc2626",
  radius: "18px",
  shadow:
    "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
});

/* ===================== STYLES ===================== */
const styles = {
  glassCard: {
    background: theme.white,
    borderRadius: theme.radius,
    padding: "24px",
    boxShadow: theme.shadow,
  },
  input: {
    width: "100%",
    padding: "14px",
    borderRadius: "14px",
    border: "1px solid #e5e7eb",
    outline: "none",
  },
  btn: {
    padding: "14px",
    borderRadius: "14px",
    fontWeight: 800,
    cursor: "pointer",
    border: "none",
  },
  sidebar: {
    width: "260px",
    background: theme.primary,
    color: "#fff",
    height: "100vh",
    position: "fixed",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
  },
  navBtn: {
    padding: "14px",
    borderRadius: "14px",
    border: "none",
    background: "transparent",
    color: "#d1fae5",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontWeight: 700,
  },
  main: {
    marginLeft: "260px",
    padding: "40px",
    minHeight: "100vh",
    background: theme.bg,
  },
};

/* ===================== MEMBERSHIP CARD ===================== */
const MembershipCard = ({ member }) => {
  const qrValue = `${member.id}|${member.expected_amount}|${member.registration_no}`;

  const downloadQR = () => {
    const canvas = document.getElementById(`qr-${member.id}`);
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `QR_${member.registration_no}.png`;
    a.click();
  };

  return (
    <div style={{ ...styles.glassCard, width: 420 }}>
      <h3 style={{ fontWeight: 900 }}>{member.full_name.toUpperCase()}</h3>
      <p>Reg: {member.registration_no}</p>
      <p>Daily: ₦{member.expected_amount.toLocaleString()}</p>
      <p>{member.phone_number}</p>

      <div style={{ margin: "20px 0" }}>
        <QRCode id={`qr-${member.id}`} value={qrValue} size={140} />
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={downloadQR} style={{ ...styles.btn, background: theme.secondary }}>
          <Download size={18} />
        </button>
        <button onClick={() => window.print()} style={{ ...styles.btn }}>
          <Printer size={18} />
        </button>
      </div>
    </div>
  );
};

/* ===================== LOGIN ===================== */
const LoginPage = ({ onLogin }) => {
  const [mode, setMode] = useState("agent");
  const [creds, setCreds] = useState({ user: "", pass: "", empId: "" });
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (mode === "admin") {
      if (creds.user === "oreofe" && creds.pass === "oreofe") {
        onLogin({ role: "admin" });
      } else {
        setError("Invalid admin credentials");
      }
    } else {
      const { data } = await supabase
        .from("employees")
        .select("*")
        .eq("employee_id_number", creds.empId)
        .single();

      if (data) onLogin({ ...data, role: "employee" });
      else setError("Agent ID not authorized");
    }
  };

  return (
    <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <form onSubmit={handleLogin} style={{ ...styles.glassCard, width: 420 }}>
        <h2 style={{ textAlign: "center", fontWeight: 900 }}>{ORG_DETAILS.name}</h2>

        <div style={{ display: "flex", gap: 10, margin: "20px 0" }}>
          <button type="button" onClick={() => setMode("agent")} style={styles.btn}>
            Agent
          </button>
          <button type="button" onClick={() => setMode("admin")} style={styles.btn}>
            Admin
          </button>
        </div>

        {mode === "admin" ? (
          <>
            <input style={styles.input} placeholder="Username" onChange={(e) => setCreds({ ...creds, user: e.target.value })} />
            <input style={styles.input} type="password" placeholder="Password" onChange={(e) => setCreds({ ...creds, pass: e.target.value })} />
          </>
        ) : (
          <input style={styles.input} placeholder="Agent ID Number" onChange={(e) => setCreds({ ...creds, empId: e.target.value })} />
        )}

        {error && <p style={{ color: theme.error }}>{error}</p>}
        <button style={{ ...styles.btn, background: theme.primary, color: "#fff", marginTop: 20 }}>
          Login
        </button>
      </form>
    </div>
  );
};

/* ===================== ADMIN DASHBOARD ===================== */
const AdminDashboard = ({ onLogout }) => {
  const [view, setView] = useState("members");
  const [members, setMembers] = useState([]);

  useEffect(() => {
    supabase.from("contributors").select("*").then(({ data }) => setMembers(data || []));
  }, []);

  return (
    <>
      <aside style={styles.sidebar}>
        <h2 style={{ fontWeight: 900 }}>{ORG_DETAILS.name}</h2>
        <button style={styles.navBtn} onClick={() => setView("members")}>
          <Users size={18} /> Members
        </button>
        <button style={{ ...styles.navBtn, marginTop: "auto", color: "#fecaca" }} onClick={onLogout}>
          <LogOut size={18} /> Logout
        </button>
      </aside>

      <main style={styles.main}>
        {view === "members" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(420px,1fr))", gap: 24 }}>
            {members.map((m) => (
              <MembershipCard key={m.id} member={m} />
            ))}
          </div>
        )}
      </main>
    </>
  );
};

/* ===================== AGENT DASHBOARD ===================== */
const AgentDashboard = ({ user, onLogout }) => {
  const [scanning, setScanning] = useState(false);
  const [status, setStatus] = useState("idle");

  const handleScan = async (data) => {
    if (!data || status !== "idle") return;

    const [id, amount] = data.text.split("|");
    setStatus("processing");

    await supabase.from("transactions").insert([
      { contributor_id: id, employee_id: user.id, amount: Number(amount) },
    ]);

    setStatus("success");
    setTimeout(() => {
      setStatus("idle");
      setScanning(false);
    }, 2500);
  };

  return (
    <div style={{ minHeight: "100vh", background: theme.bg }}>
      <header style={{ padding: 24, display: "flex", justifyContent: "space-between" }}>
        <h2>{ORG_DETAILS.name}</h2>
        <button onClick={onLogout} style={styles.btn}>
          <LogOut />
        </button>
      </header>

      <main style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        {status === "success" ? (
          <CheckCircle size={120} color={theme.secondary} />
        ) : scanning ? (
          <QrScanner delay={300} onScan={handleScan} />
        ) : (
          <button onClick={() => setScanning(true)} style={{ ...styles.btn, background: theme.primary, color: "#fff" }}>
            <QrCode size={60} />
            <p>SCAN CARD</p>
          </button>
        )}
      </main>
    </div>
  );
};

/* ===================== APP ROOT ===================== */
export default function App() {
  const [user, setUser] = useState(null);

  if (!user) return <LoginPage onLogin={setUser} />;

  return user.role === "admin" ? (
    <AdminDashboard onLogout={() => setUser(null)} />
  ) : (
    <AgentDashboard user={user} onLogout={() => setUser(null)} />
  );
}
