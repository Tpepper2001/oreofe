import React, { useEffect, useState, useRef, createContext, useContext } from "react";
import { createClient } from "@supabase/supabase-js";
import QrScanner from "react-qr-scanner";
import { MapPin, ShieldAlert, CheckCircle, LogOut, QrCode } from "lucide-react";
import { format } from "date-fns";

/* ============================
   SUPABASE SETUP
============================ */
// --- CONFIGURATION --- 
const SUPABASE_URL = 'https://watrosnylvkiuvuptdtp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhdHJvc255bHZraXV2dXB0ZHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MzE2NzEsImV4cCI6MjA4MjUwNzY3MX0.ku6_Ngf2JRJ8fxLs_Q-EySgCU37MjUK3WofpO9bazds';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY); 

/* ============================
   AUTH CONTEXT
============================ */
const AuthContext = createContext();
const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
      .then(({ data }) => setProfile(data));
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

/* ============================
   LOCATION GATE (NON-NEGOTIABLE)
============================ */
function LocationGate({ children }) {
  const [allowed, setAllowed] = useState(false);
  const [error, setError] = useState("");
  const watchId = useRef(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      () => setAllowed(true),
      () => setError("Location permission is REQUIRED"),
      { enableHighAccuracy: true }
    );

    watchId.current = navigator.geolocation.watchPosition(
      () => {},
      () => setError("Location service disabled"),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId.current);
  }, []);

  if (error) {
    return (
      <div style={styles.blocker}>
        <ShieldAlert size={64} color="red" />
        <h2>Location Required</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div style={styles.blocker}>
        <MapPin size={64} />
        <h2>Requesting Location…</h2>
      </div>
    );
  }

  return children;
}

/* ============================
   DISTANCE CALCULATION
============================ */
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

/* ============================
   TRANSACTION PROCESSOR
============================ */
async function processTransaction({ qrData, employee, ajoOwnerId }) {
  const parsed = JSON.parse(atob(qrData));
  const position = await new Promise((res, rej) =>
    navigator.geolocation.getCurrentPosition(res, rej, {
      enableHighAccuracy: true,
    })
  );

  const { data: contributor } = await supabase
    .from("contributors")
    .select("*")
    .eq("id", parsed.contributor_id)
    .single();

  const distance = haversine(
    position.coords.latitude,
    position.coords.longitude,
    contributor.gps_latitude,
    contributor.gps_longitude
  );

  await supabase.from("transactions").insert({
    ajo_owner_id: ajoOwnerId,
    contributor_id: contributor.id,
    employee_id: employee.id,
    amount: contributor.expected_amount,
    expected_amount: contributor.expected_amount,
    transaction_type: "standard",
    gps_latitude: position.coords.latitude,
    gps_longitude: position.coords.longitude,
    distance_from_registered: distance,
    geofence_verified: distance <= 100,
    timestamp: new Date().toISOString(),
  });
}

/* ============================
   EMPLOYEE COLLECTION SCREEN
============================ */
function CollectionInterface() {
  const { profile } = useAuth();
  const [status, setStatus] = useState("");

  const handleScan = async (data) => {
    if (!data?.text) return;
    setStatus("Processing…");

    const { data: employee } = await supabase
      .from("employees")
      .select("*")
      .eq("user_id", profile.id)
      .single();

    await processTransaction({
      qrData: data.text,
      employee,
      ajoOwnerId: profile.ajo_owner_id,
    });

    setStatus("Collected ✔");
    setTimeout(() => setStatus(""), 2500);
  };

  return (
    <div style={styles.page}>
      <h1>Scan Contribution</h1>
      <QrScanner
        delay={300}
        onScan={handleScan}
        onError={() => {}}
        style={{ width: "100%" }}
      />
      {status && <p>{status}</p>}
    </div>
  );
}

/* ============================
   OWNER DASHBOARD (REALTIME)
============================ */
function AjoOwnerDashboard() {
  const { profile } = useAuth();
  const [tx, setTx] = useState([]);

  useEffect(() => {
    supabase
      .from("transactions")
      .select("*")
      .eq("ajo_owner_id", profile.id)
      .order("timestamp", { ascending: false })
      .then(({ data }) => setTx(data));

    const channel = supabase
      .channel("realtime-tx")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "transactions" },
        (p) => setTx((t) => [p.new, ...t])
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [profile]);

  return (
    <div style={styles.page}>
      <h1>Live Collections</h1>
      {tx.map((t) => (
        <div key={t.id} style={styles.card}>
          ₦{t.amount} • {format(new Date(t.timestamp), "HH:mm:ss")}
          {t.geofence_verified ? (
            <CheckCircle color="green" />
          ) : (
            <ShieldAlert color="orange" />
          )}
        </div>
      ))}
    </div>
  );
}

/* ============================
   APP ROOT
============================ */
export default function App() {
  return (
    <AuthProvider>
      <LocationGate>
        <Main />
      </LocationGate>
    </AuthProvider>
  );
}

function Main() {
  const { profile, loading } = useAuth();
  if (loading) return <div>Loading…</div>;
  if (!profile) return <div>Please log in</div>;

  if (profile.role === "employee") return <CollectionInterface />;
  if (profile.role === "ajo_owner") return <AjoOwnerDashboard />;

  return <div>Contributor Portal</div>;
}

/* ============================
   STYLES
============================ */
const styles = {
  blocker: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#111",
    color: "#fff",
    textAlign: "center",
  },
  page: { padding: 20 },
  card: {
    padding: 12,
    marginBottom: 8,
    background: "#f3f3f3",
    borderRadius: 6,
    display: "flex",
    justifyContent: "space-between",
  },
};
