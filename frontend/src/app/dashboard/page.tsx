'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Plus,
  Trash2,
  RefreshCw,
  MapPin,
  Calendar,
  Wallet,
  Sun,
  CloudRain,
  Thermometer,
  Luggage,
  Hotel as HotelIcon,
  Utensils,
  Plane,
  ArrowRight,
  X,
  CheckCircle2,
  Share2,
  Printer,
  ChevronRight,
  TrendingUp,
  Map as MapIcon,
  LayoutDashboard,
  Compass,
  User,
  Settings,
  LogOut,
  Sparkles,
  Trophy,
  Navigation,
  CloudSun,
  Globe,
  Star
} from 'lucide-react';

// --- Types ---

interface Activity {
  _id?: string;
  title: string;
  description: string;
  estimatedCostUSD: number;
  timeOfDay: 'Morning' | 'Afternoon' | 'Evening';
}

interface ItineraryDay {
  dayNumber: number;
  activities: Activity[];
}

interface Hotel {
  name: string;
  tier: string;
  estimatedCostNightUSD: number;
  rating: string;
  amenities?: string[];
}

interface PackingItem {
  _id?: string;
  item: string;
  category: string;
  isPacked: boolean;
}

interface Trip {
  _id: string;
  destination: string;
  durationDays: number;
  budgetTier: 'Low' | 'Medium' | 'High';
  interests: string[];
  itinerary: ItineraryDay[];
  hotels: Hotel[];
  packingList: PackingItem[];
  weatherInfo?: { season: string; avgTemp: string; conditions: string };
  estimatedBudget: {
    total: number;
    accommodation: number;
    food: number;
    activities: number;
    transport: number;
  };
  createdAt: string;
}

// --- Schemas & Constants ---

const tripSchema = z.object({
  destination: z.string().min(2, 'Destination is required'),
  durationDays: z.number().min(1).max(14, 'Max 14 days'),
  budgetTier: z.enum(['Low', 'Medium', 'High']),
  interests: z.array(z.string()).min(1, 'Select at least one interest'),
});

type TripForm = z.infer<typeof tripSchema>;

const INTERESTS = ['Food', 'Culture', 'Adventure', 'Shopping', 'Nature', 'History', 'Art', 'Nightlife', 'Sports', 'Wellness'];
const BUDGET_TIERS = ['Low', 'Medium', 'High'];
const TIME_ICONS = { Morning: <Sun className="w-4 h-4 text-orange-400" />, Afternoon: <Sun className="w-4 h-4 text-yellow-400" />, Evening: <CloudRain className="w-4 h-4 text-blue-400" /> };
const CATEGORY_ICONS: Record<string, any> = {
  Documents: '📄', Clothing: '👕', Gear: '🎒', Toiletries: '🧴', Electronics: '💻', Other: '📦'
};

// --- Main Component ---

export default function Dashboard() {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'itinerary' | 'hotels' | 'packing' | 'budget'>('itinerary');
  const [activeView, setActiveView] = useState<'trips' | 'create' | 'profile' | 'settings'>('trips');
  const [newActivity, setNewActivity] = useState('');
  const [regeneratingDay, setRegeneratingDay] = useState<number | null>(null);
  const [regenFeedback, setRegenFeedback] = useState('');
  const [showRegenForm, setShowRegenForm] = useState<number | null>(null);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const getToken = () => localStorage.getItem('token');
  const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  });

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<TripForm>({
    resolver: zodResolver(tripSchema),
    defaultValues: { durationDays: 3, budgetTier: 'Medium', interests: [] }
  });

  const watchInterests = watch('interests');
  const watchBudget = watch('budgetTier');

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push('/login'); return; }
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
    fetchTrips();
  }, [router]);

  const fetchTrips = async () => {
    try {
      const res = await fetch(`${API}/api/trips`, { headers: authHeaders() });
      if (res.status === 401) { router.push('/login'); return; }
      if (res.ok) {
        const data = await res.json();
        setTrips(data);
        if (data.length > 0) setSelectedTrip(data[0]);
      }
    } catch (err) {
      toast.error('Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  const onGenerate = async (data: TripForm) => {
    setGenerating(true);
    try {
      const res = await fetch(`${API}/api/trips/generate`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (res.ok) {
        setTrips(prev => [result, ...prev]);
        setSelectedTrip(result);
        setActiveView('trips');
        reset();
        toast.success('Your dream trip has been generated!');
      } else {
        toast.error(result.message || 'Generation failed');
      }
    } catch (err) {
      toast.error('AI is busy. Please try again in a moment.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteTrip = async (id: string) => {
    if (!confirm('Delete this trip memory?')) return;
    try {
      const res = await fetch(`${API}/api/trips/${id}`, { method: 'DELETE', headers: authHeaders() });
      if (res.ok) {
        setTrips(trips.filter(t => t._id !== id));
        if (selectedTrip?._id === id) setSelectedTrip(trips[1] || null);
        toast.success('Trip deleted');
      }
    } catch {
      toast.error('Delete failed');
    }
  };

  const toggleInterest = (interest: string) => {
    const current = watchInterests;
    const next = current.includes(interest) ? current.filter(i => i !== interest) : [...current, interest];
    setValue('interests', next, { shouldValidate: true });
  };

  const togglePackingItem = async (itemId: string) => {
    if (!selectedTrip) return;
    const updatedPacking = selectedTrip.packingList.map(item =>
      item._id === itemId ? { ...item, isPacked: !item.isPacked } : item
    );
    try {
      const res = await fetch(`${API}/api/trips/${selectedTrip._id}`, {
        method: 'PUT', headers: authHeaders(),
        body: JSON.stringify({ packingList: updatedPacking }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedTrip(updated);
        setTrips(trips.map(t => t._id === updated._id ? updated : t));
      }
    } catch {
      toast.error('Update failed');
    }
  };

  const signOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          <div className="absolute inset-x-0 -bottom-10 text-center text-xs font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Skyway AI Intelligence Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] flex overflow-hidden">

      {/* Sidebar Navigation */}
      <aside className="w-20 lg:w-72 bg-slate-900/40 border-r border-white/5 flex flex-col z-50">
        <div className="p-6 lg:p-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/10">
              <Plane className="w-5 h-5 rotate-45" />
            </div>
            <span className="hidden lg:block text-white font-black text-xl tracking-tighter">Voyager <span className="text-blue-400">AI</span></span>
          </div>
        </div>

        <nav className="flex-1 px-4 lg:px-6 space-y-2 mt-4">
          {[
            { id: 'trips', label: 'My Journey', icon: <Compass className="w-5 h-5" /> },
            { id: 'create', label: 'Plan New Trip', icon: <Plus className="w-5 h-5" /> },
            { id: 'profile', label: 'Explorer Profile', icon: <User className="w-5 h-5" /> },
            { id: 'settings', label: 'Customization', icon: <Settings className="w-5 h-5" /> },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as any)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group ${activeView === item.id
                ? 'bg-blue-600 text-white shadow-2xl shadow-blue-900/20'
                : 'text-slate-500 hover:text-white hover:bg-white/5'
                }`}
            >
              <div className={`${activeView === item.id ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>{item.icon}</div>
              <span className="hidden lg:block text-sm font-bold">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 lg:p-8 mt-auto border-t border-white/5">
          <button onClick={signOut} className="w-full flex items-center gap-4 p-4 rounded-2xl text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-all text-sm font-bold">
            <LogOut className="w-5 h-5" />
            <span className="hidden lg:block">Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen relative overflow-hidden bg-[radial-gradient(circle_at_top_right,_rgba(37,99,235,0.05),_transparent_40%)]">

        {/* Animated Background Orbs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        {/* Global Toolbar */}
        <header className="px-8 py-6 flex items-center justify-between border-b border-white/5 relative z-10">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight uppercase">
              {activeView === 'trips' && 'My Travel Journal'}
              {activeView === 'create' && 'New Expedition'}
              {activeView === 'profile' && 'Traveler Identity'}
              {activeView === 'settings' && 'System Config'}
            </h2>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1">Status: Fully Operational</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-3 bg-white/5 border border-white/5 px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global AI Engine Online</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-bold text-white">{user?.name || 'Explorer'}</p>
                <p className="text-[10px] text-blue-400 font-bold uppercase">Pro Explorer</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-400 border-2 border-white/10" />
            </div>
          </div>
        </header>

        {/* Dynamic Content Viewport */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative z-10">

          <AnimatePresence mode="wait">

            {/* --- VIEW: MY TRIPS --- */}
            {activeView === 'trips' && (
              <motion.div
                key="trips-view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="flex flex-col lg:flex-row gap-8 h-full"
              >
                {/* Left Panel: Statistics & List */}
                <div className="lg:w-80 flex-shrink-0 space-y-6 overflow-y-auto pr-2 custom-scrollbar">

                  {/* Mini Stats Card */}
                  <div className="premium-glass p-6 rounded-[2rem] border-white/5 space-y-6 bg-gradient-to-br from-blue-600/5 to-purple-600/5">
                    <div className="flex items-center justify-between">
                      <Trophy className="w-8 h-8 text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.3)]" />
                      <div className="text-right">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Level 12</p>
                        <p className="text-white font-bold">Seasoned Voyager</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xl font-black text-white">{trips.length}</p>
                        <p className="text-[9px] font-black text-slate-500 uppercase">Journeys</p>
                      </div>
                      <div>
                        <p className="text-xl font-black text-white">{trips.reduce((acc, t) => acc + t.durationDays, 0)}</p>
                        <p className="text-[9px] font-black text-slate-500 uppercase">Days Out</p>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-white/5">
                      <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-2">
                        <span>World Map Discovery</span>
                        <span>14%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: '14%' }} className="h-full bg-blue-500" />
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-2">Trip Memories</p>

                  <div className="space-y-3 pb-20">
                    {trips.map(trip => (
                      <button
                        key={trip._id}
                        onClick={() => setSelectedTrip(trip)}
                        className={`w-full text-left p-5 rounded-[2.5rem] border transition-all relative overflow-hidden group ${selectedTrip?._id === trip._id
                          ? 'bg-blue-600/10 border-blue-500/30 shadow-2xl shadow-blue-900/20'
                          : 'bg-white/2 border-white/5 hover:border-white/10'
                          }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[9px] font-black bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full uppercase">{trip.budgetTier}</span>
                          <Calendar className="w-3 h-3 text-slate-500" />
                        </div>
                        <h4 className="font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">{trip.destination}</h4>
                        <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-tighter">{trip.durationDays} Days • ${trip.estimatedBudget.total}</p>
                        {selectedTrip?._id === trip._id && <motion.div layoutId="nav-dot" className="absolute right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full" />}
                      </button>
                    ))}
                    {trips.length === 0 && (
                      <div className="p-10 border border-dashed border-white/10 rounded-[2.5rem] text-center">
                        <p className="text-slate-500 text-xs font-bold">No trips discovered yet.</p>
                        <button onClick={() => setActiveView('create')} className="text-blue-400 text-[10px] font-black uppercase mt-4 hover:underline underline-offset-4">Initialization Required →</button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Panel: Trip Viewer */}
                <div className="flex-1 min-w-0">
                  <AnimatePresence mode="wait">
                    {selectedTrip ? (
                      <motion.div key={selectedTrip._id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">

                        {/* Hero Detail Card */}
                        <div className="p-8 lg:p-12 rounded-[3.5rem] premium-glass relative overflow-hidden border-white/5">
                          <div className="absolute top-0 right-0 p-8 flex gap-3 print:hidden">
                            <button className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all"><Share2 className="w-5 h-5" /></button>
                            <button onClick={() => handleDeleteTrip(selectedTrip._id)} className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500/50 hover:text-red-500 transition-all"><Trash2 className="w-5 h-5" /></button>
                          </div>
                          <div className="max-w-2xl relative z-10">
                            <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-6"> <Navigation className="w-3 h-3 fill-current" /> AI Optimized Path</div>
                            <h1 className="text-4xl lg:text-6xl font-black text-white mb-6 leading-tight uppercase tracking-tighter">{selectedTrip.destination}</h1>
                            <div className="flex flex-wrap gap-8">
                              <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Duration</p>
                                <p className="text-white font-bold flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-400" /> {selectedTrip.durationDays} Full Days</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Budget Optimization</p>
                                <p className="text-white font-bold flex items-center gap-2"><Wallet className="w-4 h-4 text-orange-400" /> ${selectedTrip.estimatedBudget.total} USD Est.</p>
                              </div>
                              {selectedTrip.weatherInfo && (
                                <div className="space-y-1">
                                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Local Climate ({selectedTrip.weatherInfo.season})</p>
                                  <p className="text-white font-bold flex items-center gap-2"><CloudSun className="w-4 h-4 text-yellow-400" /> {selectedTrip.weatherInfo.avgTemp}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Detail Navigation Tabs */}
                        <div className="flex items-center gap-1 bg-white/2 p-1.5 rounded-[2.5rem] border border-white/5 sticky top-0 bg-[#020617]/80 backdrop-blur-md z-20 print:hidden">
                          {[
                            { id: 'itinerary', label: 'Tactical Plan', icon: <MapIcon className="w-4 h-4" /> },
                            { id: 'hotels', label: 'Base Stays', icon: <HotelIcon className="w-4 h-4" /> },
                            { id: 'packing', label: 'Item Checklist', icon: <Luggage className="w-4 h-4" /> },
                            { id: 'budget', label: 'Cost Analysis', icon: <TrendingUp className="w-4 h-4" /> },
                          ].map(tab => (
                            <button
                              key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                              className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[2rem] font-black text-[11px] uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 scale-105' : 'text-slate-500 hover:text-white'
                                }`}
                            >
                              {tab.icon} <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                          ))}
                        </div>

                        {/* Tab Content Display */}
                        <div className="min-h-[400px]">
                          {activeTab === 'itinerary' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {selectedTrip.itinerary.map(day => (
                                <div key={day.dayNumber} className="premium-glass p-8 rounded-[3rem] border-white/5 hover:border-blue-500/20 transition-all group">
                                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                                    <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 rounded-2xl bg-blue-500 text-white flex items-center justify-center font-black shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">{day.dayNumber}</div>
                                      <h3 className="font-black text-lg text-white uppercase tracking-tighter">PHASE {day.dayNumber}</h3>
                                    </div>
                                    <button onClick={() => setShowRegenForm(day.dayNumber)} className="text-[9px] font-black bg-white/5 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-full uppercase tracking-widest transition-all print:hidden">Customize Phase</button>
                                  </div>
                                  <div className="space-y-6">
                                    {day.activities.map((act, i) => (
                                      <div key={i} className="flex gap-5">
                                        <div className="flex-shrink-0 pt-1">
                                          <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
                                            {TIME_ICONS[act.timeOfDay]}
                                          </div>
                                        </div>
                                        <div className="space-y-1">
                                          <h4 className="font-bold text-white group-hover:text-blue-400 transition-all">{act.title}</h4>
                                          <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">{act.description}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {activeTab === 'hotels' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {selectedTrip.hotels.map((hotel, i) => (
                                <div key={i} className="premium-glass p-8 rounded-[3rem] border-white/5 flex flex-col group">
                                  <div className="flex justify-between items-start mb-8">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400"> <HotelIcon className="w-6 h-6" /> </div>
                                    <div className="text-right">
                                      <p className="text-2xl font-black text-white">${hotel.estimatedCostNightUSD}</p>
                                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">NIGHTLY</p>
                                    </div>
                                  </div>
                                  <h4 className="font-black text-lg text-white mb-4 line-clamp-1 group-hover:text-indigo-400 transition-all uppercase tracking-tighter">{hotel.name}</h4>
                                  <div className="flex items-center gap-3 mb-6">
                                    <span className="flex items-center gap-1.5 bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded-lg text-[10px] font-black tracking-widest uppercase"> <Star className="w-3 h-3 fill-current" /> {hotel.rating}</span>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{hotel.tier}</span>
                                  </div>
                                  <div className="flex flex-wrap gap-2 mb-8 h-12 overflow-hidden">
                                    {hotel.amenities?.map(a => <span key={a} className="text-[9px] font-bold text-slate-400 border border-white/5 px-2 py-1 rounded-full uppercase tracking-widest">{a}</span>)}
                                  </div>
                                  <button className="w-full py-4 bg-white/5 hover:bg-white text-slate-300 hover:text-black rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Select Strategic Base</button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Placeholder for other tabs - they follow a similar refined style */}
                          {(activeTab === 'packing' || activeTab === 'budget') && (
                            <div className="premium-glass p-20 rounded-[4rem] text-center border-white/5">
                              <Globe className="w-16 h-16 text-slate-800 mx-auto mb-8 animate-spin-slow" />
                              <h4 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Phase Expansion Required</h4>
                              <p className="text-slate-500 max-w-sm mx-auto font-bold uppercase tracking-widest text-[10px] leading-loose">Detailed analytical breakdown for {activeTab === 'packing' ? 'Packing Lists' : 'Financial Budgeting'} is currently being synthesized by the AI Agent.</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center p-20 text-center opacity-60">
                        <MapIcon className="w-24 h-24 text-slate-800 mb-12 animate-float" />
                        <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Awaiting Voyage Parameters</h3>
                        <p className="text-slate-500 max-w-md font-bold uppercase tracking-widest text-xs leading-loose">Select an existing journey from the journal or initialize a new sequence using the mission control sidebar.</p>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* --- VIEW: CREATE TRIP --- */}
            {activeView === 'create' && (
              <motion.div key="create-view" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex justify-center pt-8 pb-20">
                <div className="w-full max-w-4xl premium-glass p-12 lg:p-20 rounded-[4rem] border-white/5 relative bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5">

                  <div className="absolute top-10 right-10 flex gap-1 items-center">
                    <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Next-Gen Intelligence</span>
                  </div>

                  <div className="mb-16 max-w-xl">
                    <h2 className="text-4xl lg:text-6xl font-black text-white mb-6 uppercase tracking-tighter">Synthesize a New <span className="text-blue-500">Adventure</span></h2>
                    <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] leading-relaxed">Our neural network will process your destination and interests to generate a zero-compromise professional itinerary.</p>
                  </div>

                  <form onSubmit={handleSubmit(onGenerate)} className="space-y-12">
                    <div className="grid md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <label className="form-label">Objective Location</label>
                        <div className="relative group">
                          <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                          <input {...register('destination')} placeholder="Destination Name..." className="input-field pl-16 py-6 rounded-[2rem]" />
                        </div>
                        {errors.destination && <p className="text-red-400 text-[10px] font-black uppercase ml-1">{errors.destination.message}</p>}
                      </div>
                      <div className="space-y-4">
                        <label className="form-label">Duration Sequence: {watch('durationDays')} Cycles</label>
                        <div className="pt-4">
                          <input type="range" min={1} max={14} {...register('durationDays', { valueAsNumber: true })} className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                          <div className="flex justify-between text-[10px] font-black text-slate-700 mt-4 uppercase tracking-[0.2em]"><span>Short Stay</span><span>Long Haul</span></div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="form-label">Socio-Economic Tier</label>
                      <div className="grid grid-cols-3 gap-4">
                        {BUDGET_TIERS.map(tier => (
                          <button key={tier} type="button" onClick={() => setValue('budgetTier', tier as any)} className={`py-5 rounded-[2rem] text-xs font-black uppercase tracking-widest border transition-all ${watchBudget === tier ? 'bg-blue-600 border-blue-500 text-white shadow-2xl shadow-blue-600/20' : 'bg-white/2 border-white/5 text-slate-500 hover:border-white/10'}`}>
                            {tier}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <label className="form-label flex justify-between">Experience Modules <span className="text-blue-500">{watchInterests.length} Activated</span></label>
                      <div className="flex flex-wrap gap-2">
                        {INTERESTS.map(item => (
                          <button key={item} type="button" onClick={() => toggleInterest(item)} className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${watchInterests.includes(item) ? 'bg-blue-500/20 border-blue-500/50 text-blue-300' : 'bg-white/2 border-white/5 text-slate-500 hover:border-white/10'}`}>
                            {item}
                          </button>
                        ))}
                      </div>
                      {errors.interests && <p className="text-red-400 text-[10px] font-black uppercase ml-1">{errors.interests.message}</p>}
                    </div>

                    <button type="submit" disabled={generating} className="w-full py-6 bg-white hover:bg-slate-200 text-black rounded-[2.5rem] font-black text-lg uppercase tracking-tight transition-all active:scale-[0.98] flex items-center justify-center gap-4 shadow-3xl">
                      {generating ? <span className="flex items-center gap-4"><div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" /> Neural Processing...</span> : <><Sparkles className="w-6 h-6 fill-black" /> Begin Strategic Planning</>}
                    </button>
                  </form>
                </div>
              </motion.div>
            )}

            {/* --- VIEW: PROFILE --- */}
            {activeView === 'profile' && (
              <motion.div key="profile-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center pt-8">
                <div className="w-full max-w-xl premium-glass p-20 rounded-[4rem] border-white/5 text-center">
                  <div className="w-32 h-32 rounded-[3.5rem] bg-gradient-to-br from-blue-500 to-indigo-600 mx-auto mb-10 flex items-center justify-center text-white scale-110 shadow-3xl shadow-blue-600/20">
                    <User className="w-12 h-12" />
                  </div>
                  <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">{user?.name}</h2>
                  <p className="text-blue-500 text-xs font-black uppercase tracking-[0.5em] mb-10">Pro License Active</p>
                  <div className="space-y-4 pt-10 border-t border-white/5">
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Account Identification</p>
                    <p className="text-white font-bold">{user?.email}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>

      {/* Global CSS for scrollbar and extra refinements */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
        .animate-spin-slow { animation: spin 10s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media print { .print\:hidden { display: none !important; } .premium-glass { background: white !important; border: 1px solid #eee !important; color: black !important; } }
      `}</style>
    </div>
  );
}
