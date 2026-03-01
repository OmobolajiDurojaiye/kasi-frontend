import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bot, MessageSquare, Receipt, Calendar, CreditCard, ChevronRight, CheckCircle2, Menu, X, Globe, Lock, Workflow, Sun, Moon, Monitor } from 'lucide-react';
import clsx from 'clsx';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';

// Simple nav structure
const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
];

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme, THEMES, isDark } = useTheme();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [themeOpen, setThemeOpen] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-bg-main text-gray-900 dark:text-gray-100 font-sans tracking-tight selection:bg-green-100 dark:selection:bg-green-900/50 selection:text-green-900 dark:selection:text-green-100 overflow-x-hidden w-full relative">
      
      {/* ===== NAVIGATION ===== */}
      <nav 
        className={clsx(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300 w-full',
          scrolled ? 'bg-white/90 dark:bg-bg-surface/90 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-gray-800 py-3' : 'bg-transparent py-5'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Kasi" className="w-8 h-8 rounded-xl shadow-sm" />
              <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-br from-green-700 to-green-500 bg-clip-text text-transparent">
                Kasi
              </span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map(link => (
                <a key={link.label} href={link.href} className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                  {link.label}
                </a>
              ))}
              <div className="flex items-center gap-4 ml-4 border-l border-gray-200 dark:border-gray-700 pl-8 relative">
                
                {/* Theme Switcher (Desktop) */}
                <div className="relative">
                  <button
                    onClick={() => setThemeOpen(!themeOpen)}
                    className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    {isDark ? <Moon size={20} /> : <Sun size={20} />}
                  </button>

                  {themeOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-bg-surface border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                      {THEMES.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => { setTheme(t.id); setThemeOpen(false); }}
                          className={`w-full flex items-center justify-between px-4 py-2 text-sm ${
                            theme === t.id 
                              ? 'text-primary bg-primary/5 dark:bg-primary/10 font-medium' 
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span>{t.emoji}</span>
                            {t.name}
                          </span>
                          {theme === t.id && <CheckCircle2 size={16} className="text-primary" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <Link to="/login" className="text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Log in
                </Link>
                <Link to="/signup" className="text-sm font-semibold text-white bg-green-600 hover:bg-green-700 px-5 py-2.5 rounded-full shadow-sm shadow-green-600/20 transition-all hover:scale-105 active:scale-95">
                  Get Started
                </Link>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-gray-600 dark:text-gray-300">
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-bg-surface shadow-xl border-t border-gray-100 dark:border-gray-800 p-4 flex flex-col gap-4 animate-in slide-in-from-top-2 max-h-[85vh] overflow-y-auto">
            {NAV_LINKS.map(link => (
              <a onClick={() => setMobileMenuOpen(false)} key={link.label} href={link.href} className="text-base font-medium text-gray-800 dark:text-gray-200 p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg">
                {link.label}
              </a>
            ))}
            
            <div className="h-px bg-gray-100 dark:bg-gray-800 my-2" />
            
            {/* Theme Switcher Mobile */}
            <div className="p-2">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Theme</p>
              <div className="grid grid-cols-2 gap-2">
                 {THEMES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => { setTheme(t.id); setMobileMenuOpen(false); }}
                      className={`flex items-center gap-2 p-3 rounded-xl border ${
                        theme === t.id 
                          ? 'border-primary bg-primary/5 text-primary' 
                          : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <span className="text-lg">{t.emoji}</span>
                      <span className="text-sm font-medium">{t.name}</span>
                    </button>
                  ))}
              </div>
            </div>

            <div className="h-px bg-gray-100 dark:bg-gray-800 my-2" />

            <Link to="/login" className="w-full text-center py-3 font-semibold text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800/80 rounded-xl">
              Log in
            </Link>
            <Link to="/signup" className="w-full text-center py-3 font-semibold text-white bg-green-600 rounded-xl shadow-sm">
              Get Started Free
            </Link>
          </div>
        )}
      </nav>

      {/* ===== HERO SECTION ===== */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] opacity-30 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-400/30 rounded-full mix-blend-multiply filter blur-[80px]" />
          <div className="absolute top-48 left-0 w-[400px] h-[400px] bg-emerald-400/20 rounded-full mix-blend-multiply filter blur-[80px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 text-green-800 text-sm font-semibold mb-8 mx-auto self-center">
            <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />
            Kasi is Live
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-[1.1] mb-6 max-w-4xl mx-auto">
            Your AI Sales Agent that <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">Never Sleeps.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Automate your business on Telegram (and soon WhatsApp/Instagram). Kasi talks to your customers, negotiates prices, generates formatted invoices, and books services autonomously.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 w-full">
            <Link to="/signup" className="w-full sm:w-auto px-8 py-4 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-gray-900 rounded-full font-bold text-lg transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
              Start Using Kasi Now <ChevronRight size={20} />
            </Link>
            <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200 border-2 border-gray-200 dark:border-gray-700 rounded-full font-bold text-lg transition-all flex items-center justify-center">
              Login to Dashboard
            </Link>
          </div>

          {/* Hero Image Mockup */}
          <div className="relative mx-auto max-w-5xl rounded-2xl border border-gray-200/50 dark:border-gray-800/80 bg-white/50 dark:bg-bg-surface/50 p-2 shadow-2xl backdrop-blur-xl">
            <img 
              src="/images/hero-dashboard.png" 
              alt="Kasi Dashboard" 
              className="w-full h-auto rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm"
            />
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTIONS ===== */}
      <section id="features" className="py-24 bg-white dark:bg-bg-main relative transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Feature 1: AI Chat & Negotiation */}
          <div className="flex flex-col lg:flex-row items-center gap-16 mb-32">
            <div className="flex-1 order-2 lg:order-1">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-100 dark:from-green-900/30 to-transparent rounded-3xl transform -rotate-3 scale-105 -z-10" />
                <img 
                  src="/images/ai-chat-demo.png" 
                  alt="AI Negotiation Chat" 
                  className="rounded-2xl shadow-xl w-full max-w-md mx-auto object-cover dark:border dark:border-gray-800"
                />
              </div>
            </div>
            <div className="flex-1 order-1 lg:order-2 space-y-6">
              <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-green-600 dark:text-green-400 mb-6">
                <MessageSquare size={24} />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Let AI Negotiate For You</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                Stop wasting hours replying to "How much?". Kasi handles the back-and-forth. It haggles creatively with your customers inside social apps while strictly protecting your floor prices.
              </p>
              <ul className="space-y-4 pt-4">
                {['Human-like, friendly responses', 'Understands context & history', 'Strictly protects your minimum price'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700 dark:text-gray-300 font-medium">
                    <CheckCircle2 className="text-green-500 dark:text-green-400 shrink-0" size={20} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Feature 2: Invoicing */}
          <div className="flex flex-col lg:flex-row items-center gap-16 mb-32">
            <div className="flex-1 space-y-6">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6">
                <Receipt size={24} />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Instant Invoices, Zero Hassle</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                The moment a customer agrees to buy, Kasi generates a beautiful PDF receipt directly in the chat. It attaches your bank details so you get paid instantly—straight to your bank. No gateway fees!
              </p>
              <ul className="space-y-4 pt-4">
                {['Auto-generated PDFs directly in Telegram', 'Securely displays your bank account', 'Customers pay you directly'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700 dark:text-gray-300 font-medium">
                    <CheckCircle2 className="text-blue-500 dark:text-blue-400 shrink-0" size={20} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-bl from-blue-100 dark:from-blue-900/30 to-transparent rounded-3xl transform rotate-3 scale-105 -z-10" />
                <img 
                  src="/images/invoice-demo.png" 
                  alt="Invoice Demo" 
                  className="rounded-2xl shadow-xl w-full max-w-lg mx-auto object-cover border border-gray-100 dark:border-gray-800"
                />
              </div>
            </div>
          </div>

          {/* Feature 3: Services & Bookings */}
          <div className="flex flex-col lg:flex-row items-center gap-16 mb-20">
            <div className="flex-1 order-2 lg:order-1">
              <div className="relative">
                 <div className="absolute inset-0 bg-gradient-to-br from-orange-100 dark:from-orange-900/30 to-transparent rounded-3xl transform -rotate-2 scale-105 -z-10" />
                <img 
                  src="/images/service-booking.png" 
                  alt="Service Schedule" 
                  className="rounded-2xl shadow-xl w-full mx-auto object-cover border border-gray-100 dark:border-gray-800"
                />
              </div>
            </div>
            <div className="flex-1 order-1 lg:order-2 space-y-6">
              <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 mb-6">
                <Calendar size={24} />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Automate Your Bookings</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                Whether you offer home services or taking appointments in-shop, Kasi knows your schedule. It prevents double-bookings, checks your availability, and schedules clients without your intervention.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ===== ANALYTICS TEASER ===== */}
      <section className="py-24 bg-gray-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Track Your Growth</h2>
          <p className="text-xl text-gray-400 mb-16 max-w-2xl mx-auto">
            See exactly how much revenue your AI agent is bringing in. Track click-through rates, average chat times, and successful auto-replacements.
          </p>
          <div className="relative max-w-5xl mx-auto">
            <img 
              src="/images/analytics-page.png" 
              alt="Analytics Dashboard" 
              className="rounded-xl shadow-2xl border border-gray-700/50 relative z-10"
            />
            {/* Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-green-500/20 blur-[120px] rounded-full -z-10" />
          </div>
        </div>
      </section>

      {/* ===== PRICING (EXPLAINED SIMPLY) ===== */}
      <section id="pricing" className="py-24 bg-gray-50 dark:bg-bg-main/50 border-t border-gray-100 dark:border-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">Pay Only For Success</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              No expensive monthly subscriptions. We use a simple <strong className="dark:text-white">Credit System</strong>. You only pay when Kasi successfully secures a sale for you!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white dark:bg-bg-surface p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-800 dark:text-gray-200 font-bold text-2xl mb-6">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Buy Credits Early</h3>
              <p className="text-gray-600 dark:text-gray-400">
                You purchase Kasi Credits from your dashboard (e.g., 50 Credits for ₦1,000). Think of them as tokens.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white dark:bg-bg-surface p-8 rounded-3xl shadow-md shadow-green-900/5 dark:shadow-green-900/20 border-2 border-green-500 flex flex-col items-center text-center relative transform lg:-translate-y-4">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                How It Works
              </div>
              <div className="w-16 h-16 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-700 dark:text-green-400 mb-6">
                <Bot size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Kasi Goes to Work</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Kasi chats with unlimited customers, answers all their questions, and negotiates pricing—completely for free!
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white dark:bg-bg-surface p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-800 dark:text-gray-200 font-bold text-2xl mb-6">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">-1 Credit Deducted</h3>
              <p className="text-gray-600 dark:text-gray-400">
                A credit is <strong>ONLY</strong> deducted when Kasi closes the deal and generates a successful invoice or booking. If they don't buy, you don't pay.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== BOTTOM CTA & FOOTER ===== */}
      <section className="py-24 bg-white dark:bg-bg-surface text-center relative overflow-hidden transition-colors">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-green-50/50 dark:to-green-900/10" />
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-8 tracking-tight">
            Ready to hire your AI employee?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
            Get 10 free credits when you sign up today. Watch Kasi close your first few deals entirely on autopilot.
          </p>
          <Link to="/signup" className="inline-flex items-center gap-2 px-10 py-5 bg-green-600 hover:bg-green-700 text-white rounded-full font-bold text-xl transition-all shadow-xl shadow-green-600/30 hover:scale-105 active:scale-95">
            Create Free Account <ChevronRight size={24} />
          </Link>
        </div>
      </section>

      <footer className="bg-white dark:bg-bg-main border-t border-gray-100 dark:border-gray-800 py-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-xl text-gray-900 dark:text-white tracking-tight">Kasi</span>
            <span className="text-gray-400 dark:text-gray-600 text-sm">© {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">Terms</a>
            <a href="#" className="text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">Privacy</a>
            <a href="#" className="text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
