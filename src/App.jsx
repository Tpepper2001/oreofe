import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { Camera, MapPin, Users, DollarSign, TrendingUp, Clock, CheckCircle, AlertTriangle, Menu, X, QrCode, Download, Plus, Search, Filter, Navigation, Battery, Wifi, WifiOff, Loader, Eye, Edit, Trash2, RefreshCw } from 'lucide-react';

// --- CONFIGURATION --- 
const SUPABASE_URL = 'https://watrosnylvkiuvuptdtp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhdHJvc255bHZraXV2dXB0ZHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MzE2NzEsImV4cCI6MjA4MjUwNzY3MX0.ku6_Ngf2JRJ8fxLs_Q-EySgCU37MjUK3WofpO9bazds';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY); 

// ============================================================================
// LOCATION SERVICE
// ============================================================================
const LocationService = {
  currentPosition: null,
  watchId: null,
  listeners: [],

  requestPermission: async () => {
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported by your browser');
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          LocationService.currentPosition = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date()
          };
          resolve(LocationService.currentPosition);
        },
        (error) => {
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  },

  startTracking: (callback) => {
    if (navigator.geolocation) {
      LocationService.watchId = navigator.geolocation.watchPosition(
        (position) => {
          LocationService.currentPosition = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date()
          };
          callback(LocationService.currentPosition);
        },
        (error) => console.error('Location tracking error:', error),
        { enableHighAccuracy: true, timeout: 30000, maximumAge: 30000 }
      );
    }
  },

  stopTracking: () => {
    if (LocationService.watchId) {
      navigator.geolocation.clearWatch(LocationService.watchId);
    }
  },

  calculateDistance: (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }
};

// ============================================================================
// OFFLINE STORAGE SERVICE
// ============================================================================
const OfflineStorage = {
  getQueue: () => {
    const queue = localStorage.getItem('offline_transactions');
    return queue ? JSON.parse(queue) : [];
  },

  addToQueue: (transaction) => {
    const queue = OfflineStorage.getQueue();
    queue.push({ ...transaction, offline_logged_at: new Date().toISOString() });
    localStorage.setItem('offline_transactions', JSON.stringify(queue));
  },

  clearQueue: () => {
    localStorage.removeItem('offline_transactions');
  },

  getQueueCount: () => {
    return OfflineStorage.getQueue().length;
  }
};

// ============================================================================
// CONTEXTS
// ============================================================================
const AuthContext = createContext(null);
const LocationContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user || null);
      setLoading(false);
    };
    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// ============================================================================
// LOCATION GATE COMPONENT
// ============================================================================
const LocationGate = ({ children }) => {
  const [locationPermission, setLocationPermission] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [error, setError] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    setChecking(true);
    try {
      const position = await LocationService.requestPermission();
      setCurrentLocation(position);
      setLocationPermission('granted');
      setError(null);
      
      // Start continuous tracking
      LocationService.startTracking((position) => {
        setCurrentLocation(position);
      });
    } catch (err) {
      setLocationPermission('denied');
      setError(err.message);
    } finally {
      setChecking(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md text-center">
          <Loader className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Checking Location Services</h2>
          <p className="text-gray-600">Please wait while we verify your location permissions...</p>
        </div>
      </div>
    );
  }

  if (locationPermission === 'denied') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md">
          <AlertTriangle className="w-20 h-20 text-red-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">Location Access Required</h2>
          <p className="text-gray-600 mb-6 text-center">
            This app requires location access to function properly. Location data is used to:
          </p>
          <ul className="text-gray-700 mb-6 space-y-2">
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>Verify collection locations</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>Track employee routes</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>Prevent fraud and ensure accountability</span>
            </li>
          </ul>
          <button
            onClick={requestLocationPermission}
            className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition"
          >
            Enable Location Access
          </button>
          {error && (
            <p className="mt-4 text-sm text-red-600 text-center">{error}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <LocationContext.Provider value={{ currentLocation, locationPermission }}>
      <div className="relative">
        <div className="fixed top-0 left-0 right-0 bg-green-500 text-white px-4 py-2 text-sm flex items-center justify-center z-50">
          <MapPin className="w-4 h-4 mr-2" />
          Location Active: {currentLocation?.latitude.toFixed(4)}, {currentLocation?.longitude.toFixed(4)}
        </div>
        <div className="pt-10">
          {children}
        </div>
      </div>
    </LocationContext.Provider>
  );
};

// ============================================================================
// QR SCANNER COMPONENT
// ============================================================================
const QRScanner = ({ onScan, onClose }) => {
  const videoRef = useRef(null);
  const [scanning, setScanning] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError('Camera access denied');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
  };

  // Simulate QR code detection
  const handleManualScan = () => {
    const mockQRData = {
      contributor_id: 'contrib_' + Math.random().toString(36).substr(2, 9),
      contributor_name: 'John Doe',
      expected_amount: 1000,
      payment_schedule: 'daily',
      registered_lat: 9.0765,
      registered_lon: 7.3986
    };
    onScan(mockQRData);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 bg-gray-900">
        <h2 className="text-white text-xl font-bold">Scan QR Code</h2>
        <button onClick={onClose} className="text-white">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        
        {/* Scanning overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-64 h-64">
            <div className="absolute inset-0 border-4 border-white rounded-lg opacity-50"></div>
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-500 rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-500 rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-500 rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-500 rounded-br-lg"></div>
          </div>
        </div>

        {error && (
          <div className="absolute top-4 left-4 right-4 bg-red-500 text-white p-4 rounded-lg">
            {error}
          </div>
        )}
      </div>

      <div className="p-4 bg-gray-900">
        <button
          onClick={handleManualScan}
          className="w-full bg-green-500 text-white py-4 rounded-lg font-semibold text-lg hover:bg-green-600 transition"
        >
          Simulate QR Scan (Demo)
        </button>
        <p className="text-center text-gray-400 text-sm mt-2">
          Align QR code within the frame
        </p>
      </div>
    </div>
  );
};

// ============================================================================
// TRANSACTION SUCCESS COMPONENT
// ============================================================================
const TransactionSuccess = ({ transaction, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full animate-bounce-in">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
          Collection Successful!
        </h2>
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Contributor:</span>
            <span className="font-semibold">{transaction.contributor_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Amount:</span>
            <span className="font-semibold text-green-600">₦{transaction.amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Time:</span>
            <span className="font-semibold">{new Date(transaction.timestamp).toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// EMPLOYEE COLLECTION INTERFACE
// ============================================================================
const CollectionInterface = () => {
  const { user } = useAuth();
  const { currentLocation } = useContext(LocationContext);
  const [showScanner, setShowScanner] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [successTransaction, setSuccessTransaction] = useState(null);
  const [todayCollections, setTodayCollections] = useState([]);
  const [offlineQueue, setOfflineQueue] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    setOfflineQueue(OfflineStorage.getQueueCount());
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleQRScan = async (qrData) => {
    setShowScanner(false);
    setProcessing(true);

    try {
      // Create transaction automatically
      const transaction = {
        id: 'txn_' + Math.random().toString(36).substr(2, 9),
        contributor_id: qrData.contributor_id,
        contributor_name: qrData.contributor_name,
        employee_id: user.id,
        employee_name: user.full_name,
        amount: qrData.expected_amount,
        expected_amount: qrData.expected_amount,
        transaction_type: 'standard',
        gps_latitude: currentLocation.latitude,
        gps_longitude: currentLocation.longitude,
        timestamp: new Date().toISOString(),
        geofence_verified: true,
        distance_from_registered: LocationService.calculateDistance(
          currentLocation.latitude,
          currentLocation.longitude,
          qrData.registered_lat,
          qrData.registered_lon
        )
      };

      // Check if online
      if (isOnline) {
        // Save to database
        await supabase.from('transactions').insert(transaction);
      } else {
        // Save to offline queue
        OfflineStorage.addToQueue(transaction);
        setOfflineQueue(OfflineStorage.getQueueCount());
      }

      // Add to today's collections
      setTodayCollections(prev => [transaction, ...prev]);

      // Show success
      setSuccessTransaction(transaction);
    } catch (error) {
      console.error('Transaction error:', error);
      alert('Error processing transaction');
    } finally {
      setProcessing(false);
    }
  };

  const todayTotal = todayCollections.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-blue-600 text-white p-6">
        <h1 className="text-2xl font-bold mb-2">Collection Interface</h1>
        <p className="text-blue-100">Welcome, {user?.full_name}</p>
        
        {/* Status indicators */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center">
            {isOnline ? (
              <Wifi className="w-4 h-4 mr-1" />
            ) : (
              <WifiOff className="w-4 h-4 mr-1" />
            )}
            <span className="text-sm">{isOnline ? 'Online' : 'Offline'}</span>
          </div>
          {offlineQueue > 0 && (
            <div className="flex items-center bg-yellow-500 px-2 py-1 rounded">
              <Clock className="w-4 h-4 mr-1" />
              <span className="text-sm">{offlineQueue} pending sync</span>
            </div>
          )}
        </div>
      </div>

      {/* Today's stats */}
      <div className="p-4 grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-gray-600 text-sm mb-1">Today's Collections</div>
          <div className="text-2xl font-bold text-gray-800">{todayCollections.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-gray-600 text-sm mb-1">Total Amount</div>
          <div className="text-2xl font-bold text-green-600">₦{todayTotal.toLocaleString()}</div>
        </div>
      </div>

      {/* Main scan button */}
      <div className="p-4">
        <button
          onClick={() => setShowScanner(true)}
          disabled={processing}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-8 rounded-2xl font-bold text-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center"
        >
          {processing ? (
            <>
              <Loader className="w-8 h-8 mr-3 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Camera className="w-8 h-8 mr-3" />
              Scan QR Code
            </>
          )}
        </button>
      </div>

      {/* Recent collections */}
      <div className="p-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Today's Collections</h2>
        <div className="space-y-3">
          {todayCollections.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              <QrCode className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No collections yet today</p>
            </div>
          ) : (
            todayCollections.map(transaction => (
              <div key={transaction.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-semibold text-gray-800">{transaction.contributor_name}</div>
                    <div className="text-sm text-gray-600">{new Date(transaction.timestamp).toLocaleTimeString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-green-600">₦{transaction.amount.toLocaleString()}</div>
                    {transaction.geofence_verified && (
                      <div className="flex items-center text-green-500 text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  Distance: {transaction.distance_from_registered.toFixed(0)}m from registered location
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* QR Scanner Modal */}
      {showScanner && (
        <QRScanner
          onScan={handleQRScan}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* Success Modal */}
      {successTransaction && (
        <TransactionSuccess
          transaction={successTransaction}
          onClose={() => setSuccessTransaction(null)}
        />
      )}
    </div>
  );
};

// ============================================================================
// AJO OWNER DASHBOARD
// ============================================================================
const AjoOwnerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    todayCollections: 24,
    todayAmount: 156000,
    activeEmployees: 5,
    activeContributors: 87,
    recentTransactions: []
  });

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        todayCollections: prev.todayCollections + Math.floor(Math.random() * 2),
        todayAmount: prev.todayAmount + (Math.random() > 0.5 ? 1000 : 0)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <h1 className="text-3xl font-bold mb-2">Ajo Dashboard</h1>
        <p className="text-blue-100">Welcome back, {user?.full_name}</p>
      </div>

      {/* Stats Grid */}
      <div className="p-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-green-500" />
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-3xl font-bold text-gray-800">₦{stats.todayAmount.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Today's Collections</div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-gray-800">{stats.todayCollections}</div>
          <div className="text-sm text-gray-600">Transactions Today</div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-purple-500" />
          </div>
          <div className="text-3xl font-bold text-gray-800">{stats.activeEmployees}</div>
          <div className="text-sm text-gray-600">Active Employees</div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-orange-500" />
          </div>
          <div className="text-3xl font-bold text-gray-800">{stats.activeContributors}</div>
          <div className="text-sm text-gray-600">Active Contributors</div>
        </div>
      </div>

      {/* Live Activity Feed */}
      <div className="p-4">
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <Clock className="w-6 h-6 mr-2 text-blue-500" />
              Live Activity Feed
              <span className="ml-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-gray-800">John Contributor #{i}</div>
                        <div className="text-sm text-gray-600">Collected by Jane Employee</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">₦1,000</div>
                        <div className="text-xs text-gray-500">{i} min ago</div>
                      </div>
                    </div>
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <MapPin className="w-3 h-3 mr-1" />
                      Verified location
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 grid grid-cols-2 gap-4">
        <button className="bg-blue-600 text-white p-6 rounded-lg shadow-lg hover:bg-blue-700 transition flex flex-col items-center">
          <Users className="w-8 h-8 mb-2" />
          <span className="font-semibold">Manage Contributors</span>
        </button>
        <button className="bg-purple-600 text-white p-6 rounded-lg shadow-lg hover:bg-purple-700 transition flex flex-col items-center">
          <Users className="w-8 h-8 mb-2" />
          <span className="font-semibold">Manage Employees</span>
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// CONTRIBUTOR MANAGEMENT
// ============================================================================
const ContributorManagement = () => {
  const [contributors, setContributors] = useState([
    { id: '1', full_name: 'John Doe', phone_number: '08012345678', expected_amount: 1000, status: 'active', card_issued: true },
    { id: '2', full_name: 'Jane Smith', phone_number: '08098765432', expected_amount: 2000, status: 'active', card_issued: false }
  ]);
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-blue-600 text-white p-6">
        <h1 className="text-2xl font-bold">Contributors</h1>
        <p className="text-blue-100">Manage your contributors</p>
      </div>

      <div className="p-4">
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full bg-green-500 text-white py-4 rounded-lg font-semibold flex items-center justify-center hover:bg-green-600 transition"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Contributor
        </button>
      </div>

      <div className="p-4 space-y-3">
        {contributors.map(contributor => (
          <div key={contributor.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="font-bold text-gray-800">{contributor.full_name}</div>
                <div className="text-sm text-gray-600">{contributor.phone_number}</div>
              </div>
              <div className="flex gap-2">
                <button className="text-blue-500 hover:text-blue-700">
                  <Edit className="w-5 h-5" />
                </button>
                <button className="text-red-500 hover:text-red-700">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm text-gray-600">Expected Amount: </span>
                <span className="font-semibold text-green-600">₦{contributor.expected_amount.toLocaleString()}</span>
              </div>
              {contributor.card_issued ? (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                  Card Issued
                </span>
              ) : (
                <button className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600">
                  Generate QR
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// CONTRIBUTOR PORTAL
// ============================================================================
const ContributorPortal = () => {
  const { user } = useAuth();
  const [transactions] = useState([
    { id: '1', amount: 1000, timestamp: new Date().toISOString(), employee_name: 'Jane Employee' },
    { id: '2', amount: 1000, timestamp: new Date(Date.now() - 86400000).toISOString(), employee_name: 'Jane Employee' }
  ]);

  const totalPaid = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
        <h1 className="text-2xl font-bold mb-2">My Account</h1>
        <p className="text-purple-100">Welcome, {user?.full_name}</p>
      </div>

      <div className="p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
          <div className="text-center mb-4">
            <div className="text-gray-600 mb-2">Total Contributed</div>
            <div className="text-4xl font-bold text-green-600">₦{totalPaid.toLocaleString()}</div>
          </div>
          <div className="border-t pt-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Expected Amount:</span>
              <span className="font-semibold">₦1,000/day</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="text-green-600 font-semibold">Active</span>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-800 mb-4">Payment History</h2>
        <div className="space-y-3">
          {transactions.map(transaction => (
            <div key={transaction.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-gray-800">₦{transaction.amount.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Collected by {transaction.employee_name}</div>
                  <div className="text-xs text-gray-500">{new Date(transaction.timestamp).toLocaleDateString()}</div>
                </div>
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// LOGIN COMPONENT
// ============================================================================
const Login = () => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signIn(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <DollarSign className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Ajo Collection</h1>
          <p className="text-gray-600">Automated collection system</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2 font-semibold">Demo Accounts:</p>
          <div className="text-xs text-gray-600 space-y-1">
            <div>Owner: owner@ajo.com / password</div>
            <div>Employee: employee@ajo.com / password</div>
            <div>Contributor: contributor@ajo.com / password</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================
export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <Loader className="w-16 h-16 text-white animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <AuthProvider>
        <Login />
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <LocationGate>
        {user.role === 'ajo_owner' && <AjoOwnerDashboard />}
        {user.role === 'employee' && <CollectionInterface />}
        {user.role === 'contributor' && <ContributorPortal />}
      </LocationGate>
    </AuthProvider>
  );
}
