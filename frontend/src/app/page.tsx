'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import {
  MapPin,
  Plane,
  Hotel,
  Briefcase,
  ChevronRight,
  Sparkles,
  Search,
  ArrowRight,
  Star,
  CheckCircle2,
  Globe2,
  Smartphone,
  Clock,
  ShieldCheck
} from 'lucide-react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const HERO_IMAGES = [
  { url: '/hero-1.png', title: 'Tropical Escapes', tag: 'Paradise' },
  { url: '/hero-2.png', title: 'Urban Adventures', tag: 'Vibrant' },
  { url: '/hero-3.png', title: 'Alpine Retreats', tag: 'Majestic' }
];

const COUNTRIES = [
  'France', 'Japan', 'Italy', 'USA', 'Switzerland', 'Australia', 'Greece', 'Norway', 'Singapore', 'Canada',
  'Thailand', 'Germany', 'Spain', 'Iceland', 'UAE', 'New Zealand', 'Brazil', 'Portugal', 'Egypt', 'India',
  'Turkey', 'Vietnam', 'Bali', 'Mexico', 'Netherlands', 'South Korea', 'Ireland', 'Maldives', 'Finland', 'Peru'
];

export default function Home() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCountries, setShowCountries] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const token = localStorage.getItem('token');
    if (token) router.push('/dashboard');

    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [router]);

  if (!isMounted) return null;

  const filteredCountries = COUNTRIES.filter(c =>
    c.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-blue-500/30">

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 ${isScrolled ? 'bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
              <Plane className="w-5 h-5 rotate-45" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">Skyway <span className="text-blue-400">AI</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-10">
            <a href="#features" className="nav-link">Features</a>
            <a href="#pricing" className="nav-link">Pricing</a>
            <a href="#about" className="nav-link">About</a>
            <a href="#faq" className="nav-link">FAQ</a>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-slate-400 hover:text-white transition-colors text-sm font-semibold px-4 py-2">Sign in</Link>
            <Link href="/register" className="btn-primary">Get started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 -right-1/4 w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]" />
          <div className="absolute -bottom-1/4 -left-1/4 w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10 w-full">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold px-4 py-2 rounded-full mb-8 uppercase tracking-[0.2em]">
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              Next-Gen Travel Planning
            </div>
            <h1 className="heading-xl mb-8">
              Explore the <span className="text-gradient">Unknown</span>, <br />
              Powered by Intelligence.
            </h1>
            <p className="text-slate-400 text-lg md:text-xl max-w-xl mb-12 leading-relaxed">
              Ditch the generic travel guides. Skyway AI crafts hyper-personalized itineraries, discovers hidden stays, and optimizes your budget for unforgettable memories.
            </p>

            {/* Country Selector */}
            <div className="relative max-w-md group mb-12">
              <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-2.5 flex items-center gap-3 group-focus-within:border-blue-500/30 group-focus-within:bg-slate-900/80 transition-all shadow-2xl">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                  <Search className="w-5 h-5 text-slate-500" />
                </div>
                <input
                  type="text"
                  placeholder="Where to next? (e.g. Japan, Italy...)"
                  className="bg-transparent border-none focus:outline-none text-white w-full py-2 font-medium"
                  onFocus={() => setShowCountries(true)}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Link href="/register" className="bg-blue-600 text-white w-12 h-12 flex-shrink-0 rounded-2xl flex items-center justify-center hover:bg-blue-500 transition-colors">
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>

              <AnimatePresence>
                {showCountries && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 w-full mt-4 bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-3xl z-[110]"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Popular Destinations</span>
                      <button onClick={() => setShowCountries(false)} className="text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                      {filteredCountries.map(country => (
                        <button
                          key={country}
                          onClick={() => { setSearchQuery(country); setShowCountries(false); }}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left"
                        >
                          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-sm">📍</div>
                          <span className="text-sm font-semibold">{country}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-8">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className={`w-12 h-12 rounded-full border-4 border-[#020617] bg-slate-800 overflow-hidden`}>
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 123}`} alt="" />
                  </div>
                ))}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />)}
                </div>
                <p className="text-xs font-bold text-slate-400">Trusted by 50,000+ travelers</p>
              </div>
            </div>
          </motion.div>

          {/* Right side: Slider */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative pt-12 lg:pt-0"
          >
            <div className="relative z-10 rounded-[3.5rem] p-4 bg-white/5 border border-white/10 backdrop-blur-sm">
              <Swiper
                modules={[Autoplay, Pagination, EffectFade]}
                effect="fade"
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                pagination={{ clickable: true }}
                className="hero-swiper rounded-[2.5rem]"
              >
                {HERO_IMAGES.map((img, index) => (
                  <SwiperSlide key={index}>
                    <img src={img.url} className="w-full h-full object-cover" alt={img.title} />
                    <div className="hero-slide-content">
                      <div className="max-w-xs space-y-3">
                        <span className="bg-blue-600 text-white text-[9px] font-black uppercase px-3 py-1 rounded-full">{img.tag}</span>
                        <h3 className="text-3xl font-black text-white">{img.title}</h3>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
            {/* Abstract Decorations */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/20 rounded-full blur-[80px] animate-pulse" />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '2s' }} />
          </motion.div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="features" className="section-padding bg-white/2 relative">
        <div className="max-container">
          <div className="text-center mb-24 max-w-3xl mx-auto space-y-6">
            <h2 className="heading-lg">Engineered for <span className="text-gradient">Perfection</span></h2>
            <p className="text-slate-400 text-lg">We went beyond traditional planning to build a system that understands the nuance of every traveler's unique taste.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <MapPin className="text-blue-500" />, title: 'Hyper-Local Itineraries', desc: 'Our AI finds the small cafes and secret viewpoints that Google Maps hides from you.' },
              { icon: <ShieldCheck className="text-indigo-500" />, title: 'Fraud Protection', desc: 'Secure booking suggestions with direct links to verified hotel and transport providers.' },
              { icon: <Smartphone className="text-purple-500" />, title: 'Mobile-Sync Ready', desc: 'Access your plans anywhere, even offline. Your trip, optimized for your pocket.' },
              { icon: <Globe2 className="text-emerald-500" />, title: '190+ Countries', desc: 'Global coverage with specific awareness of local customs, transport, and tipping.' },
              { icon: <Clock className="text-pink-500" />, title: 'Time Optimization', desc: 'We calculate travel times between activities to ensure you never feel rushed.' },
              { icon: <Sparkles className="text-yellow-500" />, title: 'Magic Suggestions', desc: 'One-click "Surprise Me" feature to add unexpected magic to your travel routine.' }
            ].map((feat, i) => (
              <div key={i} className="glass-card p-10 rounded-[3rem] space-y-6 group">
                <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                  {feat.icon}
                </div>
                <h4 className="text-2xl font-bold text-white mb-2">{feat.title}</h4>
                <p className="text-slate-400 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="section-padding relative">
        <div className="max-container">
          <div className="text-center mb-24 max-w-2xl mx-auto space-y-6">
            <h2 className="heading-lg">Choose Your <span className="text-gradient">Experience</span></h2>
            <p className="text-slate-400">Unlock the full power of Skyway AI. Start free or upgrade for professional tools.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-end">
            {/* Free Tier */}
            <div className="glass-card p-10 rounded-[3rem] border-white/5 order-2 md:order-1">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2 block">Standard</span>
              <h3 className="text-2xl font-black text-white mb-6">Explorer</h3>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-black text-white">$0</span>
                <span className="text-slate-500">/mo</span>
              </div>
              <div className="space-y-4 mb-10">
                {['Unlimited Trips', 'Smart Itineraries', 'Packing Assistant'].map(f => (
                  <div key={f} className="flex items-center gap-3 text-sm text-slate-400">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" /> {f}
                  </div>
                ))}
              </div>
              <Link href="/register" className="btn-secondary w-full">Join Free</Link>
            </div>

            {/* Pro Tier (Featured) */}
            <div className="glass-card p-12 rounded-[3.5rem] border-blue-500/20 bg-blue-600/5 relative overflow-hidden order-1 md:order-2">
              <div className="absolute top-0 right-0 py-2 px-6 bg-blue-600 text-white text-[10px] uppercase font-black tracking-widest rounded-bl-3xl">Most Popular</div>
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 block">Elite Tier</span>
              <h3 className="text-3xl font-black text-white mb-6">Voyager Pro</h3>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-5xl font-black text-white">$12</span>
                <span className="text-slate-500">/mo</span>
              </div>
              <div className="space-y-4 mb-12">
                {['Advanced Hotel Insights', 'Offline PDF Export', 'Private Access', 'Weather Intelligence', 'Priority AI Support'].map(f => (
                  <div key={f} className="flex items-center gap-3 font-bold text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-blue-500" /> {f}
                  </div>
                ))}
              </div>
              <Link href="/register" className="btn-primary w-full py-5 text-lg">Go Pro Now</Link>
            </div>

            {/* Enterprise Tier */}
            <div className="glass-card p-10 rounded-[3rem] border-white/5 order-3">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Team</span>
              <h3 className="text-2xl font-black text-white mb-6">Concierge</h3>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-black text-white">$29</span>
                <span className="text-slate-500">/mo</span>
              </div>
              <div className="space-y-4 mb-10">
                {['Up to 5 Users', 'Collaboration Tools', 'Dedicated Account Mgr', 'Custom API Access'].map(f => (
                  <div key={f} className="flex items-center gap-3 text-sm text-slate-400">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" /> {f}
                  </div>
                ))}
              </div>
              <Link href="/register" className="btn-secondary w-full">Contact Sales</Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="section-padding bg-slate-900/40">
        <div className="max-container">
          <div className="flex flex-col lg:flex-row gap-20">
            <div className="lg:w-1/3">
              <h2 className="heading-lg mb-6">Common <span className="text-gradient">Questions</span></h2>
              <p className="text-slate-400">Everything you need to know about Skyway AI before you start your journey.</p>
            </div>
            <div className="flex-1 space-y-6">
              {[
                { q: 'How accurate is the AI-generated itinerary?', a: 'Extremely. We use GPT-4 enabled models specifically trained on global travel patterns, ensuring logical transitions and realistic wait times.' },
                { q: 'Can I use this for business travel?', a: 'Yes! Voyager Pro includes budget-optimization for corporate tiers and easy expense-ready reports.' },
                { q: 'Does it work offline?', a: 'Pro users can export trips to interactive PDFs that work completely offline on any mobile device.' },
                { q: 'Can I modify the AI results?', a: 'Absolutely. You can regenerate specific days with custom feedback like "more history" or "less walking".' }
              ].map((faq, i) => (
                <div key={i} className="p-8 rounded-[2rem] bg-white/2 border border-white/5 hover:border-white/10 transition-all cursor-pointer group">
                  <h4 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
                    {faq.q} <Plus className="w-4 h-4 text-slate-500 group-hover:text-blue-500" />
                  </h4>
                  <p className="text-slate-500 text-sm leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-24 pb-12 bg-[#020617] border-t border-white/5">
        <div className="max-container">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 mb-20 px-6">
            <div className="col-span-2 space-y-8">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                  <Plane className="w-5 h-5 rotate-45" />
                </div>
                <span className="text-white font-black text-2xl tracking-tighter">Skyway AI</span>
              </Link>
              <p className="text-slate-500 text-sm max-w-xs leading-relaxed font-medium">Developing the future of travel intelligence. One passport stamp at a time.</p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center text-slate-400 hover:bg-white/5 transition-all cursor-pointer"><InstagramIcon className="w-4 h-4" /></div>
                <div className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center text-slate-400 hover:bg-white/5 transition-all cursor-pointer"><FacebookIcon className="w-4 h-4" /></div>
                <div className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center text-slate-400 hover:bg-white/5 transition-all cursor-pointer"><TwitterIcon className="w-4 h-4" /></div>
                <div className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center text-slate-400 hover:bg-white/5 transition-all cursor-pointer"><GithubIcon className="w-4 h-4" /></div>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-white text-sm font-black uppercase tracking-widest">Platform</h4>
              <ul className="space-y-4 text-slate-500 text-sm font-bold">
                <li className="hover:text-blue-400 cursor-pointer">AI Agent</li>
                <li className="hover:text-blue-400 cursor-pointer">Destinations</li>
                <li className="hover:text-blue-400 cursor-pointer">Mobile App</li>
                <li className="hover:text-blue-400 cursor-pointer">Pricing</li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-white text-sm font-black uppercase tracking-widest">Company</h4>
              <ul className="space-y-4 text-slate-500 text-sm font-bold">
                <li className="hover:text-blue-400 cursor-pointer">About Us</li>
                <li className="hover:text-blue-400 cursor-pointer">Careers</li>
                <li className="hover:text-blue-400 cursor-pointer">Blog</li>
                <li className="hover:text-blue-400 cursor-pointer">Contact</li>
              </ul>
            </div>

            <div className="space-y-6 col-span-2">
              <h4 className="text-white text-sm font-black uppercase tracking-widest">Stay Updated</h4>
              <p className="text-slate-500 text-sm leading-relaxed">Get travel secrets delivered to your inbox once a month.</p>
              <div className="flex gap-2">
                <input type="text" placeholder="Your Email" className="bg-white/5 border border-white/5 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 w-full" />
                <button className="bg-blue-600 text-white px-5 py-3 rounded-2xl font-bold text-sm">Join</button>
              </div>
            </div>
          </div>

          <div className="px-6 flex flex-col md:flex-row items-center justify-between pt-12 border-t border-white/5 gap-6">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">© 2024 Skyway AI International. All Rights Reserved.</p>
            <div className="flex items-center gap-8 text-[10px] font-black text-slate-600 uppercase tracking-widest">
              <span className="hover:text-slate-400 cursor-pointer">Privacy</span>
              <span className="hover:text-slate-400 cursor-pointer">Terms</span>
              <span className="hover:text-slate-400 cursor-pointer">Security</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Full CSS Customizations */}
      <style jsx global>{`
        .nav-link { 
          font-size: 0.875rem; 
          font-weight: 600; 
          color: #94a3b8; 
          transition: all 0.3s;
          text-decoration: none;
        }
        .nav-link:hover { color: white; }
        .X-icon { position: relative; } /* Dummy for Lucide X */
      `}</style>
    </div>
  );
}

function Plus({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
  );
}

function X({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
  );
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-4.51-2-7-2" /></svg>
  );
}
