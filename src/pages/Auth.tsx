import { useState, useEffect, useRef, useCallback } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Code2, LogIn, UserPlus, ArrowRight, Loader2, CheckCircle2, Zap, Shield, TrendingUp, Eye, EyeOff, Linkedin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const features = [
  { icon: TrendingUp, text: "Track your progress per company",   stat: "32+",  statLabel: "companies"  },
  { icon: Zap,        text: "AI-powered interview coaching",      stat: "∞",    statLabel: "questions"  },
  { icon: Shield,     text: "Sync across all your devices",       stat: "100%", statLabel: "private"    },
];

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = leftPanelRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMouse({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    } else {
      navigate("/");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: window.location.origin, data: { display_name: displayName } },
    });
    setLoading(false);
    if (error) {
      toast({ title: "Signup failed", description: error.message, variant: "destructive" });
    } else {
      setSubmitted(true);
    }
  };

  const orbX = `${(mouse.x - 0.5) * 40}px`;
  const orbY = `${(mouse.y - 0.5) * 40}px`;
  const orbX2 = `${(0.5 - mouse.x) * 30}px`;
  const orbY2 = `${(0.5 - mouse.y) * 30}px`;

  return (
    <>
      <style>{`
        @keyframes drift   { 0%,100%{transform:translate(0,0)scale(1)}33%{transform:translate(40px,-30px)scale(1.06)}66%{transform:translate(-20px,20px)scale(0.95)} }
        @keyframes spin-s  { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }
        @keyframes spin-r  { from{transform:rotate(0deg)}to{transform:rotate(-360deg)} }
        @keyframes rise    { 0%{opacity:0;transform:translateY(24px)}100%{opacity:1;transform:translateY(0)} }
        @keyframes slidein { 0%{opacity:0;transform:translateX(10px)}100%{opacity:1;transform:translateX(0)} }
        @keyframes shimmer { 0%{background-position:-200% center}100%{background-position:200% center} }
        @keyframes pulse-r { 0%,100%{box-shadow:0 0 0 0 rgba(255,107,53,0.4)}70%{box-shadow:0 0 0 12px rgba(255,107,53,0)} }
        @keyframes scan    { 0%{top:-20%}100%{top:120%} }
        @keyframes float-p { 0%,100%{transform:translateY(0) rotate(0deg);opacity:0.6} 50%{transform:translateY(-18px) rotate(180deg);opacity:1} }
        .animate-drift    { animation: drift 14s ease-in-out infinite }
        .animate-drift-2  { animation: drift 18s ease-in-out infinite reverse }
        .animate-spin-s   { animation: spin-s 22s linear infinite }
        .animate-spin-r   { animation: spin-r 32s linear infinite }
        .shimmer-text     { background: linear-gradient(90deg,#fff 0%,#fff 30%,#FF6B35 50%,#fff 70%,#fff 100%);background-size:200% auto;background-clip:text;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 5s linear 1s infinite }
        .rise-1  { animation: rise 0.7s cubic-bezier(.22,1,.36,1) 0.1s both }
        .rise-2  { animation: rise 0.7s cubic-bezier(.22,1,.36,1) 0.25s both }
        .rise-3  { animation: rise 0.7s cubic-bezier(.22,1,.36,1) 0.4s both }
        .rise-4  { animation: rise 0.7s cubic-bezier(.22,1,.36,1) 0.55s both }
        .slidein { animation: slidein 0.35s ease both }
        .pulse-r { animation: pulse-r 2s infinite }
        input:-webkit-autofill,input:-webkit-autofill:hover,input:-webkit-autofill:focus{box-shadow:0 0 0 100px #0f0f11 inset!important;-webkit-text-fill-color:#fff!important}
        .scan-line::after{content:'';position:absolute;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(255,107,53,0.4),transparent);animation:scan 4s linear infinite}
      `}</style>

      <div className="min-h-screen flex bg-[#08090B] overflow-hidden">

        {/* ─── LEFT PANEL ─────────────────────────────────────── */}
        <div
          ref={leftPanelRef}
          className="hidden lg:flex lg:w-[52%] relative flex-col p-14 overflow-hidden select-none"
          onMouseMove={handleMouseMove}
        >
          {/* Interactive parallax orbs */}
          <div
            className="absolute pointer-events-none rounded-full"
            style={{
              top: '15%', left: '10%', width: 480, height: 480,
              background: 'radial-gradient(circle, rgba(255,107,53,0.22) 0%, transparent 70%)',
              filter: 'blur(60px)',
              transform: `translate(${orbX}, ${orbY})`,
              transition: 'transform 0.4s ease-out',
            }}
          />
          <div
            className="absolute pointer-events-none rounded-full"
            style={{
              bottom: '5%', right: '0%', width: 380, height: 380,
              background: 'radial-gradient(circle, rgba(0,200,180,0.16) 0%, transparent 70%)',
              filter: 'blur(60px)',
              transform: `translate(${orbX2}, ${orbY2})`,
              transition: 'transform 0.5s ease-out',
            }}
          />

          {/* Spinning rings */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="animate-spin-s w-[560px] h-[560px] rounded-full border border-white/[0.035]" />
            <div className="animate-spin-r absolute inset-10 rounded-full border border-orange-500/10" />
            <div className="animate-spin-s absolute inset-24 rounded-full border border-teal-500/[0.08]" />
          </div>

          {/* Floating particles */}
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: 3 + (i % 3),
                height: 3 + (i % 3),
                left: `${10 + (i * 11.5)}%`,
                top: `${15 + (i % 5) * 15}%`,
                background: i % 2 === 0 ? 'rgba(255,107,53,0.5)' : 'rgba(0,200,180,0.4)',
                animation: `float-p ${4 + i}s ease-in-out ${i * 0.5}s infinite`,
              }}
            />
          ))}

          {/* Dot grid */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
            maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent)'
          }} />

          {/* Scan line effect */}
          <div className="absolute inset-0 scan-line pointer-events-none overflow-hidden" />

          {/* Content */}
          <div className="relative z-10 flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center gap-3 group cursor-default">
              <div className="h-10 w-10 rounded-2xl flex items-center justify-center relative overflow-hidden pulse-r"
                   style={{ background: 'linear-gradient(135deg, #FF6B35, #E84A1D)' }}>
                <Code2 className="h-5 w-5 text-white relative z-10" />
              </div>
              <span className="text-[22px] font-bold tracking-tight text-white group-hover:text-orange-300 transition-colors duration-300">LeetTracker</span>
            </div>

            {/* Headline */}
            <div className="mt-auto mb-auto pt-20">
              <p className="text-xs font-bold tracking-[0.3em] uppercase mb-6 rise-1" style={{ color: '#FF6B35' }}>
                Interview Preparation Platform
              </p>
              <h2 className="text-[3.2rem] font-black leading-[1.08] text-white mb-6 rise-2">
                Crack any<br />
                <span className="shimmer-text">tech interview</span><br />
                with confidence.
              </h2>
              <p className="text-white/40 text-lg leading-relaxed max-w-sm rise-3">
                Practice company-specific questions, track your progress, and get AI coaching — all in one place.
              </p>

              {/* Features */}
              <div className="mt-10 space-y-3 rise-4">
                {features.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-3 rounded-2xl cursor-default transition-all duration-300"
                    style={{
                      background: hoveredFeature === i ? 'rgba(255,107,53,0.08)' : 'transparent',
                      border: `1px solid ${hoveredFeature === i ? 'rgba(255,107,53,0.2)' : 'transparent'}`,
                      transform: hoveredFeature === i ? 'translateX(6px)' : 'translateX(0)',
                    }}
                    onMouseEnter={() => setHoveredFeature(i)}
                    onMouseLeave={() => setHoveredFeature(null)}
                  >
                    <div
                      className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300"
                      style={{
                        background: hoveredFeature === i ? 'rgba(255,107,53,0.2)' : 'rgba(255,107,53,0.09)',
                        border: `1px solid ${hoveredFeature === i ? 'rgba(255,107,53,0.4)' : 'rgba(255,107,53,0.15)'}`,
                        transform: hoveredFeature === i ? 'scale(1.15) rotate(-6deg)' : 'scale(1)',
                      }}
                    >
                      <f.icon className="h-4 w-4 transition-colors duration-300" style={{ color: hoveredFeature === i ? '#FF6B35' : '#FF6B3599' }} />
                    </div>
                    <span
                      className="text-[15px] transition-colors duration-300 flex-1"
                      style={{ color: hoveredFeature === i ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)' }}
                    >
                      {f.text}
                    </span>
                    {hoveredFeature === i && (
                      <div className="flex flex-col items-end slidein">
                        <span className="text-sm font-bold" style={{ color: '#FF6B35' }}>{f.stat}</span>
                        <span className="text-[10px] text-white/30 uppercase tracking-wider">{f.statLabel}</span>
                      </div>
                    )}
                    {hoveredFeature !== i && <CheckCircle2 className="h-4 w-4 opacity-20 transition-opacity" style={{ color: '#00C8B4' }} />}
                  </div>
                ))}
              </div>
            </div>

            <p className="text-white/15 text-[10px] tracking-[0.35em] uppercase">Trusted by engineers at FAANG and beyond</p>
          </div>
        </div>

        {/* ─── RIGHT PANEL ─────────────────────────────────────── */}
        <div className="flex-1 flex items-center justify-center p-6 relative">
          <div className="absolute inset-0 bg-[#0C0C0F] lg:border-l" style={{ borderColor: 'rgba(255,255,255,0.04)' }} />

          <div className={`w-full max-w-[400px] relative z-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

            {/* Mobile logo */}
            <div className="flex lg:hidden items-center gap-3 mb-8 justify-center">
              <div className="h-9 w-9 rounded-xl flex items-center justify-center"
                   style={{ background: 'linear-gradient(135deg, #FF6B35, #E84A1D)' }}>
                <Code2 className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold text-white">LeetTracker</span>
            </div>

            {/* Heading */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                {isLogin ? "Welcome back 👋" : "Join for free"}
              </h1>
              <p className="text-white/40 text-[15px]">
                {isLogin ? "Sign in to continue your practice streak." : "Create your account and start crushing interviews."}
              </p>
            </div>

            {/* Success state */}
            {submitted ? (
              <div
                className="rounded-3xl p-8 text-center space-y-4 border"
                style={{ background: 'rgba(0,200,180,0.05)', borderColor: 'rgba(0,200,180,0.2)' }}
              >
                <div className="h-14 w-14 rounded-2xl flex items-center justify-center mx-auto"
                     style={{ background: 'rgba(0,200,180,0.12)' }}>
                  <CheckCircle2 className="h-7 w-7" style={{ color: '#00C8B4' }} />
                </div>
                <h3 className="text-white text-xl font-bold">Check your inbox</h3>
                <p className="text-white/40 text-sm">We sent a verification link to<br />
                  <span className="font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>{email}</span>
                </p>
                <button
                  onClick={() => { setSubmitted(false); setIsLogin(true); }}
                  className="text-sm mt-2 transition-colors"
                  style={{ color: '#FF6B35' }}
                >
                  Back to sign in →
                </button>
              </div>
            ) : (
              <>
                {/* Tab switcher */}
                <div
                  className="flex gap-1 p-1 rounded-2xl mb-8 border"
                  style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' }}
                >
                  {["Log In", "Sign Up"].map((label, idx) => {
                    const active = (idx === 0) === isLogin;
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setIsLogin(idx === 0)}
                        className="flex-1 py-2.5 text-[13px] font-semibold rounded-xl transition-all duration-300 relative overflow-hidden group"
                        style={{
                          background: active ? 'linear-gradient(135deg, #FF6B35, #E84A1D)' : 'transparent',
                          color: active ? '#fff' : 'rgba(255,255,255,0.3)',
                          boxShadow: active ? '0 4px 20px rgba(255,107,53,0.3)' : 'none',
                        }}
                      >
                        {!active && (
                          <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                style={{ background: 'rgba(255,255,255,0.04)' }} />
                        )}
                        {label}
                      </button>
                    );
                  })}
                </div>

                {/* Form */}
                <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4">

                  {!isLogin && (
                    <div className="slidein space-y-1.5">
                      <Label className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>Display Name</Label>
                      <div className="relative">
                        <Input
                          placeholder="Your full name"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          onFocus={() => setFocusedField('name')}
                          onBlur={() => setFocusedField(null)}
                          className="h-12 rounded-xl text-white placeholder:text-white/20 text-[15px] border transition-all duration-300"
                          style={{
                            background: 'rgba(255,255,255,0.04)',
                            borderColor: focusedField === 'name' ? 'rgba(255,107,53,0.5)' : 'rgba(255,255,255,0.07)',
                            boxShadow: focusedField === 'name' ? '0 0 0 3px rgba(255,107,53,0.12), 0 0 20px rgba(255,107,53,0.06)' : 'none',
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>Email Address</Label>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      required
                      className="h-12 rounded-xl text-white placeholder:text-white/20 text-[15px] border transition-all duration-300"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        borderColor: focusedField === 'email' ? 'rgba(255,107,53,0.5)' : 'rgba(255,255,255,0.07)',
                        boxShadow: focusedField === 'email' ? '0 0 0 3px rgba(255,107,53,0.12), 0 0 20px rgba(255,107,53,0.06)' : 'none',
                      }}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>Password</Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setFocusedField('pw')}
                        onBlur={() => setFocusedField(null)}
                        required
                        minLength={6}
                        className="h-12 rounded-xl text-white placeholder:text-white/20 text-[15px] border pr-12 transition-all duration-300"
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          borderColor: focusedField === 'pw' ? 'rgba(255,107,53,0.5)' : 'rgba(255,255,255,0.07)',
                          boxShadow: focusedField === 'pw' ? '0 0 0 3px rgba(255,107,53,0.12), 0 0 20px rgba(255,107,53,0.06)' : 'none',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-13 rounded-xl font-bold text-[15px] text-white mt-2 relative overflow-hidden group transition-all duration-300 active:scale-[0.97]"
                    style={{
                      height: '52px',
                      background: 'linear-gradient(135deg, #FF6B35, #E84A1D)',
                      boxShadow: '0 8px 32px rgba(255,107,53,0.35)',
                    }}
                  >
                    {/* Shimmer sweep on hover */}
                    <span
                      className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"
                      style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)' }}
                    />
                    <span className="relative flex items-center justify-center gap-2">
                      {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : isLogin ? (
                        <>
                          <LogIn className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 duration-200" />
                          Sign In
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 transition-transform group-hover:scale-110 duration-200" />
                          Create Account
                        </>
                      )}
                    </span>
                  </Button>
                </form>

                {/* Switch mode */}
                <p className="mt-6 text-center text-[13px]" style={{ color: 'rgba(255,255,255,0.28)' }}>
                  {isLogin ? "New here?" : "Already have an account?"}
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="ml-2 font-semibold group inline-flex items-center gap-1 transition-all duration-200 hover:gap-2"
                    style={{ color: '#FF6B35' }}
                  >
                    {isLogin ? "Create an account" : "Sign in instead"}
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1 duration-200" />
                  </button>
                </p>
              </>
            )}

            {/* Creator credit */}
            <div className="mt-8 flex items-center justify-center gap-1.5" style={{ color: 'rgba(255,255,255,0.2)' }}>
              <span className="text-[11px] tracking-wide">Built by</span>
              <a
                href="https://www.linkedin.com/in/sathwikpentapati/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-semibold transition-all duration-200 hover:gap-1.5 group"
                style={{ color: 'rgba(255,255,255,0.45)' }}
              >
                <Linkedin
                  className="h-3 w-3 transition-all duration-200 group-hover:scale-110"
                  style={{ color: '#0A66C2' }}
                />
                <span className="group-hover:text-white transition-colors duration-200">Sathwik</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
