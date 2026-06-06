import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ThemeToggler from "./ThemeToggler/ThemeToggler";

// scroll reveal
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add("revealed"); obs.unobserve(el); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

/* ─── COUNT UP HOOK ─── */
function useCountUp(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      setCount(Math.floor(p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

/* ─── STAT COUNTER ─── */
function StatCounter({ value, suffix, label }) {
  const ref = useRef(null);
  const [started, setStarted] = useState(false);
  const numVal = parseFloat(value);
  const count = useCountUp(Number.isInteger(numVal) ? numVal : Math.round(numVal * 10), 2000, started);
  const display = Number.isInteger(numVal) ? count : (count / 10).toFixed(1);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); obs.unobserve(el); } },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className="text-center">
      <div className="font-display font-black" style={{ color: "var(--accent)", lineHeight: 1, fontSize: "clamp(1.8rem,4vw,2.5rem)" }}>
        {display}{suffix}
      </div>
      <p className="mt-2 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>{label}</p>
    </div>
  );
}

/* ─── LOGO COMPONENT ─── */
function Logo({ size = 32, textSize = "1.25rem" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
      {/* Professional SVG logo mark */}
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="logoGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#15803d"/>
            <stop offset="100%" stopColor="#22c55e"/>
          </linearGradient>
        </defs>
        <rect width="48" height="48" rx="12" fill="url(#logoGrad)"/>
        <path d="M24 9 C13 9 9 21 16 29 C20 34 27 35 32 30 C37 25 38 16 31 12 C29 10 27 9 24 9Z"
          fill="white" opacity="0.92"/>
        <line x1="24" y1="9" x2="24" y2="36" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.45"/>
        <circle cx="35" cy="13" r="2.5" fill="white" opacity="0.65"/>
        <circle cx="38" cy="21" r="1.8" fill="white" opacity="0.45"/>
      </svg>
      <span style={{
        fontFamily: "var(--font-display)",
        fontWeight: 900,
        fontSize: textSize,
        color: "var(--text-primary)",
        letterSpacing: "-0.02em",
        lineHeight: 1,
      }}>
        Career<span style={{ color: "var(--accent)" }}>Mint</span>
      </span>
    </div>
  );
}

/* ─── HEADER ─── */
function Header({ scrolled, theme, setTheme }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const scrollTo = (id) => {
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const navItems = [
    { label: "About", id: "about" },
    { label: "Features", id: "features" },
    { label: "How It Works", id: "how-it-works" },
    { label: "FAQ", id: "faq" },
    { label: "Privacy", id: "privacy" },
  ];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "var(--bg-card)" : "transparent",
        borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
        boxShadow: scrolled ? "var(--shadow-sm)" : "none",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <Logo size={30} textSize="1.15rem" />
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-7">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="nav-link bg-transparent border-0 cursor-pointer"
                style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem" }}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggler theme={theme} setTheme={setTheme} />
            <button
              className="hidden md:flex items-center gap-2 btn-green text-sm py-2 px-5"
              onClick={() => navigate("/builder")}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12l7 7 7-7"/>
              </svg>
              Start Building
            </button>
            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-2 rounded-lg transition-colors"
              style={{ background: "var(--bg-secondary)", color: "var(--text-primary)", border: "none", cursor: "pointer" }}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {menuOpen
                  ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                  : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
                }
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <div className="mobile-nav lg:hidden">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => scrollTo(item.id)}
              className="text-left px-4 py-3 rounded-lg font-medium w-full"
              style={{ background: "transparent", color: "var(--text-secondary)", border: "none", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: "0.95rem" }}
            >
              {item.label}
            </button>
          ))}
          <button className="btn-green mt-2 w-full" onClick={() => { setMenuOpen(false); navigate("/builder"); }}>
            Start Building
          </button>
        </div>
      )}
    </header>
  );
}

/* ─── HERO ─── */
function Hero() {
  const navigate = useNavigate();
  const [typed, setTyped] = useState("");
  const words = ["ATS-Optimized", "Professional", "Stunning", "Job-Winning"];
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  // Fixed max width so longest word never wraps
  const longestWord = words.reduce((a, b) => a.length > b.length ? a : b, "");

  useEffect(() => {
    const current = words[wordIdx];
    const speed = deleting ? 55 : 95;
    const timeout = setTimeout(() => {
      if (!deleting) {
        if (charIdx < current.length) { setTyped(current.slice(0, charIdx + 1)); setCharIdx(c => c + 1); }
        else { setTimeout(() => setDeleting(true), 1600); }
      } else {
        if (charIdx > 0) { setTyped(current.slice(0, charIdx - 1)); setCharIdx(c => c - 1); }
        else { setDeleting(false); setWordIdx(i => (i + 1) % words.length); }
      }
    }, speed);
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, wordIdx]);

  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background blobs */}
      <div className="hero-blob" style={{ width: 600, height: 600, top: -100, left: -200, background: "linear-gradient(135deg, #bbf7d0, #86efac)" }} />
      <div className="hero-blob" style={{ width: 400, height: 400, bottom: -100, right: -100, background: "linear-gradient(135deg, #d1fae5, #6ee7b7)", animationDelay: "3s" }} />
      <div className="hero-blob" style={{ width: 280, height: 280, top: "35%", right: "15%", background: "linear-gradient(135deg, #a7f3d0, #34d399)", animationDelay: "6s", opacity: 0.15 }} />
      {/* Dot grid */}
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle, var(--accent) 1px, transparent 1px)", backgroundSize: "44px 44px" }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="text-center max-w-4xl mx-auto">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-8 animate-fade-in-up">
            <span className="badge-green">
              <span className="w-2 h-2 rounded-full animate-pulse-green inline-block" style={{ background: "var(--accent)" }} />
              Free Resume Builder
            </span>
          </div>

          {/* Headline — typewriter word stays on one line */}
          <h1
            className="font-display font-black leading-tight mb-6 animate-fade-in-up delay-100"
            style={{ color: "var(--text-primary)", fontSize: "clamp(2.4rem, 6vw, 5rem)" }}
          >
            {/* Line 1 & 2: "Build" + typewriter word on same line */}
            <span style={{ display: "block" }}>
              Build{" "}
              {/* Typewriter word stays together */}
              <span style={{ position: "relative", display: "inline-block", whiteSpace: "nowrap" }}>
                {/* Actual typed text */}
                <span className="gradient-text">
                  {typed}
                  <span style={{
                    display: "inline-block",
                    width: 3,
                    height: "0.85em",
                    background: "var(--accent)",
                    marginLeft: 2,
                    verticalAlign: "middle",
                    animation: "blink 1s step-end infinite",
                  }} />
                </span>
              </span>
            </span>
            {/* Line 3 */}
            <span style={{ display: "block" }}>Resumes in Minutes</span>
          </h1>

          {/* Subtext */}
          <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up delay-200"
            style={{ color: "var(--text-secondary)" }}>
            CareerMint helps you craft professionally designed,<br />ATS-friendly resumes with live preview and<br />instant PDF & Word export — completely free.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-14 animate-fade-in-up delay-300">
            <button className="btn-green text-base flex items-center gap-2 group" onClick={() => navigate("/builder")}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
              Start Building — It's Free
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                className="transition-transform duration-200 group-hover:translate-x-1">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
            <button className="btn-outline text-base flex items-center gap-2"
              onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>
              </svg>
              See How It Works
            </button>
          </div>

          {/* Stats box — full width with internal grid, no overflow */}
          <div
            className="animate-fade-in-up delay-400"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "clamp(12px, 3vw, 32px)",
              padding: "clamp(16px, 3vw, 36px) clamp(16px, 4vw, 48px)",
              borderRadius: 20,
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-md)",
              width: "100%",
              maxWidth: 700,
              margin: "0 auto",
            }}
          >
            <StatCounter value="50" suffix="K+" label="Resumes Built" />
            <StatCounter value="98" suffix="%" label="ATS Pass Rate" />
            <StatCounter value="12" suffix="+" label="Templates" />
            <StatCounter value="5" suffix="min" label="Avg Build Time" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── ABOUT ─── */
function About() {
  const titleRef = useReveal();
  const card1 = useReveal();
  const card2 = useReveal();
  const card3 = useReveal();
  return (
    <section id="about" className="py-24 relative" style={{ background: "var(--bg-secondary)" }}>
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, var(--accent), transparent)" }} />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={titleRef} className="reveal text-center mb-16">
          <span className="badge-green mb-4 inline-block">Who We Are</span>
          <h2 className="font-display text-4xl sm:text-5xl font-black mb-5" style={{ color: "var(--text-primary)" }}>
            Built for <span className="gradient-text">Job Seekers</span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            CareerMint was created with one mission:<br />make professional resume building accessible to<br />everyone — no design skills, no subscription, no frustration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              ref: card1,
              emoji: "🎯",
              title: "Our Mission",
              text: "We believe every job seeker deserves a polished, professional resume. CareerMint removes all barriers — no fees, no sign-ups, just results.",
              color: "#22c55e",
            },
            {
              ref: card2,
              emoji: "⚡",
              title: "Built with Speed",
              text: "From blank form to downloaded resume in under 5 minutes. Real-time preview means no surprises — what you type is exactly what gets exported.",
              color: "#16a34a",
            },
            {
              ref: card3,
              emoji: "✨",
              title: "Smart Templates",
              text: "Choose from 12+ professionally designed templates optimized for different industries and career levels. Each one is tested with ATS systems.",
              color: "#15803d",
            },
          ].map((card, i) => (
            <div
              key={i}
              ref={card.ref}
              className="reveal feature-card text-center"
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 text-3xl"
                style={{ background: `${card.color}18` }}
              >
                {card.emoji}
              </div>
              <h3 className="font-display text-xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>{card.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{card.text}</p>
            </div>
          ))}
        </div>


      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, var(--accent), transparent)" }} />
    </section>
  );
}

/* ─── FEATURES ─── */
const features = [
  { icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>, title: "Live Preview", desc: "See your resume update in real-time as you type. No refresh needed — instant results.", color: "#22c55e" },
  { icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>, title: "PDF & Word Export", desc: "Download as polished PDF or editable DOCX — ready to send to any recruiter.", color: "#16a34a" },
  { icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>, title: "ATS Optimized", desc: "Clean, machine-readable formatting engineered to pass Applicant Tracking Systems.", color: "#15803d" },
  { icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>, title: "Fully Editable", desc: "Add, remove, or reorder sections — Personal, Education, Experience, Projects, Skills, and more.", color: "#4ade80" },
  { icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M2 12h20M4.22 4.22l14.24 14.24M19.78 4.22L5.54 18.46"/></svg>, title: "Customizable Sections", desc: "Add unlimited custom sections beyond the standard ones. Certificates, languages, awards, portfolios — organize however you want.", color: "#86efac" },
  { icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>, title: "Multi-Device", desc: "Fully responsive split-panel interface — works seamlessly on desktop, tablet, and mobile.", color: "#34d399" },
];

function Features() {
  const titleRef = useReveal();
  return (
    <section id="features" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={titleRef} className="reveal text-center mb-16">
          <span className="badge-green mb-4 inline-block">Everything You Need</span>
          <h2 className="font-display text-4xl sm:text-5xl font-black mb-4" style={{ color: "var(--text-primary)" }}>
            Powerful Features,<br /><span className="gradient-text">Zero Complexity</span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--text-secondary)" }}>
            Professional-grade tools in a<br />dead-simple interface. No learning curve,<br />no subscription.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const ref = useReveal();
            return (
              <div key={i} ref={ref} className="reveal feature-card" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: `${f.color}1a`, color: f.color }}>{f.icon}</div>
                <h3 className="font-display text-xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── HOW IT WORKS ─── */
const steps = [
  { num: "01", title: "Enter Your Details", desc: "Fill in personal info, education, work experience, projects, skills, and additional sections — all in one clean form.", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"/><polygon points="18 2 22 6 12 16 8 16 8 12 18 2"/></svg> },
  { num: "02", title: "Preview in Real-Time", desc: "Watch your professional resume materialize instantly in the live preview panel as you type — no lag, no refresh.", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> },
  { num: "03", title: "Download & Apply", desc: "Export as polished PDF or Word document. Send directly to recruiters and land more interviews.", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> },
];

function HowItWorks() {
  const titleRef = useReveal();
  const navigate = useNavigate();
  return (
    <section id="how-it-works" className="py-24 relative" style={{ background: "var(--bg-secondary)" }}>
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, var(--accent), transparent)" }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={titleRef} className="reveal text-center mb-16">
          <span className="badge-green mb-4 inline-block">Simple Process</span>
          <h2 className="font-display text-4xl sm:text-5xl font-black mb-4" style={{ color: "var(--text-primary)" }}>
            Ready in <span className="gradient-text">3 Easy Steps</span>
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: "var(--text-secondary)" }}>
            From blank page to job-ready resume<br />in under 5 minutes. Zero design<br />experience required.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14">
          {steps.map((step, i) => {
            const ref = useReveal();
            return (
              <div key={i} ref={ref} className="reveal relative text-center" style={{ animationDelay: `${i * 0.18}s` }}>
                <div className="w-20 h-20 rounded-2xl flex flex-col items-center justify-center mx-auto mb-6 relative"
                  style={{ background: "linear-gradient(135deg, var(--accent-dark), var(--accent-light))", boxShadow: "var(--shadow-green)" }}>
                  <div className="text-white">{step.icon}</div>
                  <span className="text-white/70 text-xs font-bold absolute -top-1 -right-1 px-1.5 py-0.5 rounded-lg" style={{ background: "rgba(255,255,255,0.2)" }}>{step.num}</span>
                </div>
                <h3 className="font-display text-xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>{step.title}</h3>
                <p className="text-sm leading-relaxed max-w-xs mx-auto" style={{ color: "var(--text-secondary)" }}>{step.desc}</p>
              </div>
            );
          })}
        </div>
        <div className="reveal text-center" ref={useReveal()}>
          <button className="btn-green text-base" onClick={() => navigate("/builder")}>
            Build My Resume Now →
          </button>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, var(--accent), transparent)" }} />
    </section>
  );
}

/* ─── STATS BAND ─── */
function StatsBand() {
  const ref = useReveal();
  return (
    <section className="py-16" style={{ background: "linear-gradient(135deg, #15803d, #16a34a 50%, #22c55e)", backgroundSize: "200% 200%", animation: "gradientMove 6s ease infinite" }}>
      <div ref={ref} className="reveal max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          {[{ v:"50",s:"K+",l:"Resumes Created"},{v:"98",s:"%",l:"ATS Success Rate"},{v:"4.9",s:"★",l:"Average Rating"},{v:"100",s:"%",l:"Free Forever"}].map((s,i)=>(
            <div key={i} className="text-center text-white">
              <div className="font-display text-4xl font-black">{s.v}{s.s}</div>
              <div className="text-white/80 text-sm mt-1 font-medium">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── FAQ ─── */
const faqs = [
  { q:"Is CareerMint completely free?", a:"Yes! CareerMint is 100% free. Build, preview, and download your resume in PDF and Word formats with no subscription or hidden fees." },
  { q:"What formats can I download in?", a:"PDF for sharing digitally or printing, and DOCX (Microsoft Word) for further editing in any word processor." },
  { q:"Is my resume data saved?", a:"Your resume data auto-saves to your browser's local storage, preserved between sessions on the same device — no account needed." },
  { q:"Can I add custom sections?", a:"Absolutely. Beyond the standard sections there's an 'Additional Information' area for certifications, languages, awards, volunteering, interests, and anything else." },
  { q:"Are the templates ATS-friendly?", a:"Yes. CareerMint's format is specifically designed to be clean and machine-readable so it passes ATS used by most companies and recruiters." },
  { q:"Do I need to create an account?", a:"No account required. Open CareerMint, fill in your details, and download. Simple as that." },
  { q:"Can I edit my resume after downloading?", a:"Yes. The DOCX download is fully editable in Microsoft Word, Google Docs, or any compatible word processor." },
];

function FAQ() {
  const [open, setOpen] = useState(null);
  const titleRef = useReveal();
  return (
    <section id="faq" className="py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div ref={titleRef} className="reveal text-center mb-14">
          <span className="badge-green mb-4 inline-block">Got Questions?</span>
          <h2 className="font-display text-4xl sm:text-5xl font-black mb-4" style={{ color: "var(--text-primary)" }}>
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
          <p className="text-lg" style={{ color: "var(--text-secondary)" }}>Everything you need to know about CareerMint.</p>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const ref = useReveal();
            return (
              <div key={i} ref={ref} className="reveal faq-item" style={{ animationDelay: `${i * 0.06}s` }}>
                <button
                  className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 font-medium"
                  style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-primary)", fontFamily: "var(--font-display)", fontSize: "0.95rem" }}
                  onClick={() => setOpen(open === i ? null : i)}
                >
                  <span>{faq.q}</span>
                  <span className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300"
                    style={{ background: open === i ? "var(--accent)" : "var(--bg-secondary)", color: open === i ? "white" : "var(--accent)", transform: open === i ? "rotate(45deg)" : "rotate(0)" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                  </span>
                </button>
                {open === i && (
                  <div className="px-6 pb-5 text-sm leading-relaxed"
                    style={{ color: "var(--text-secondary)", borderTop: "1px solid var(--border)", paddingTop: 14, animation: "slideDown 0.22s ease" }}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── PRIVACY ─── */
function Privacy() {
  const titleRef = useReveal();
  const privacyItems = [
    { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, title: "Data Storage", text: "All resume data is stored exclusively in your browser's local storage. We do not transmit, collect, or store any personal information on our servers." },
    { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>, title: "No Tracking", text: "CareerMint does not use advertising trackers, third-party analytics, or behavioral profiling. Your browsing activity remains completely private." },
    { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>, title: "No Account Required", text: "You never need to sign up or provide an email address. Your identity is completely anonymous when using CareerMint." },
    { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>, title: "No Third Parties", text: "We don't share your data with external services. Everything runs locally in your browser. Your resume belongs entirely to you." },
  ];
  return (
    <section id="privacy" className="py-24 relative" style={{ background: "var(--bg-secondary)" }}>
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, var(--accent), transparent)" }} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div ref={titleRef} className="reveal text-center mb-14">
          <span className="badge-green mb-4 inline-block">Your Data, Your Control</span>
          <h2 className="font-display text-4xl sm:text-5xl font-black mb-4" style={{ color: "var(--text-primary)" }}>
            Privacy <span className="gradient-text">Policy</span>
          </h2>
        </div>
        <div className="reveal space-y-5" ref={useReveal()}>
          {privacyItems.map((item, i) => (
            <div key={i} className="flex gap-5 p-6 rounded-2xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <div className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ background: "var(--accent-glow)", color: "var(--accent)" }}>
                {item.icon}
              </div>
              <div>
                <h3 className="font-display font-bold text-base mb-2" style={{ color: "var(--text-primary)" }}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA ─── */
function CTASection() {
  const navigate = useNavigate();
  const ref = useReveal();
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="hero-blob" style={{ width: 500, height: 500, top: -150, left: "20%", background: "linear-gradient(135deg, #bbf7d0, #6ee7b7)", opacity: 0.28 }} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
        <div ref={ref} className="reveal">
          <h2 className="font-display text-4xl sm:text-5xl font-black mb-6" style={{ color: "var(--text-primary)" }}>
            Your Dream Job Starts<br />with a <span className="gradient-text">Great Resume</span>
          </h2>
          <p className="text-lg mb-10 max-w-xl mx-auto" style={{ color: "var(--text-secondary)" }}>
            Join thousands of job seekers who built<br />their winning resumes with CareerMint.<br />Free, fast, and professional.
          </p>
          <button className="btn-green text-lg px-10 py-4 inline-flex items-center gap-2" onClick={() => navigate("/builder")}>
            Start Building Your Resume
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>
    </section>
  );
}

/* ─── FOOTER ─── */
function Footer() {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };
  /* Always hardcoded dark — independent of page theme */
  const F1 = "#f8fafc";
  const F2 = "rgba(248,250,252,0.60)";
  const F3 = "rgba(248,250,252,0.35)";
  const FB = "rgba(248,250,252,0.09)";

  return (
    <footer style={{ background: "#0b1728", color: F1 }}>
      <div style={{ height: 3, background: "linear-gradient(90deg, #15803d, #22c55e, #86efac, #22c55e, #15803d)", backgroundSize: "200% 100%", animation: "shimmer 4s linear infinite" }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">

          {/* Brand col */}
          <div className="lg:col-span-2">
            {/* Logo in footer */}
            <div className="flex items-center gap-2 mb-5">
              <svg width="38" height="38" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs><linearGradient id="fLogo" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#15803d"/><stop offset="100%" stopColor="#22c55e"/></linearGradient></defs>
                <rect width="48" height="48" rx="12" fill="url(#fLogo)"/>
                <path d="M24 9 C13 9 9 21 16 29 C20 34 27 35 32 30 C37 25 38 16 31 12 C29 10 27 9 24 9Z" fill="white" opacity="0.92"/>
                <line x1="24" y1="9" x2="24" y2="36" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.45"/>
                <circle cx="35" cy="13" r="2.5" fill="white" opacity="0.65"/>
              </svg>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "1.5rem", color: "#ffffff", letterSpacing: "-0.02em" }}>
                Career<span style={{ color: "#22c55e" }}>Mint</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-6 max-w-xs" style={{ color: F2 }}>
              Build professional, ATS-optimized<br />resumes in minutes. Free forever,<br />no account required.
            </p>
            {/* Social */}
            <div className="flex items-center gap-4 flex-wrap">
              {[
                { href: "https://github.com/malikmahmad", label: "GitHub", icon: <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/> },
                { href: "https://www.linkedin.com/in/malik-muhammad-ahmad-788b62338", label: "LinkedIn", icon: <><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></> },
                { href: "mailto:mahmad937ak@gmail.com", label: "Email", icon: <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/> },
              ].map(({ href, label, icon }) => (
                <a key={label} href={href} target={href.startsWith("mailto") ? undefined : "_blank"} rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-medium"
                  style={{ color: F2, textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "#4ade80"}
                  onMouseLeave={(e) => e.currentTarget.style.color = F2}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">{icon}</svg>
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-display font-bold text-xs uppercase tracking-widest mb-5" style={{ color: "#22c55e" }}>Navigation</h4>
            <ul className="space-y-3">
              {[{ label:"About",id:"about"},{ label:"Features",id:"features"},{ label:"How It Works",id:"how-it-works"},{ label:"FAQ",id:"faq"},{ label:"Privacy Policy",id:"privacy"}].map((item) => (
                <li key={item.id}>
                  <button onClick={() => scrollTo(item.id)}
                    className="text-sm bg-transparent border-0 cursor-pointer"
                    style={{ color: F2, fontFamily: "var(--font-body)", transition: "color 0.2s", padding: 0 }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "#4ade80"}
                    onMouseLeave={(e) => e.currentTarget.style.color = F2}
                  >{item.label}</button>
                </li>
              ))}
            </ul>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-display font-bold text-xs uppercase tracking-widest mb-5" style={{ color: "#22c55e" }}>Product</h4>
            <ul className="space-y-3">
              {["Free Resume Builder","PDF Download","Word Download","ATS Optimization","Live Preview","Dark Mode"].map((item) => (
                <li key={item}><span className="text-sm" style={{ color: F2 }}>{item}</span></li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-8 pt-12" style={{ borderTop: `1px solid ${FB}` }}>
          <p style={{ color: F3 }}>© {new Date().getFullYear()} CareerMint. All rights reserved.</p>
          <div className="text-center sm:text-right">
            <p style={{ color: F3, fontSize: "0.75rem", letterSpacing: "0.05em" }}>DEVELOPED BY</p>
            <p className="font-display font-bold text-base" style={{ color: "#22c55e", marginTop: 4 }}>Malik Muhammad Ahmad</p>
            <p style={{ color: F2, fontSize: "0.85rem", marginTop: 2 }}>Full Stack Developer</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─── MAIN LANDING PAGE ─── */
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("careermint-theme");
    if (saved === "light" || saved === "dark" || saved === "system") return saved;
    // Default to system preference
    return "system";
  });

  /* Apply theme to <html> */
  useEffect(() => {
    const actual = theme === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : theme;
    document.documentElement.setAttribute("data-theme", actual);
    localStorage.setItem("careermint-theme", theme);

    // If in system mode, listen for OS preference changes
    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => {
        const newActual = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", newActual);
      };
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [theme]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Header scrolled={scrolled} theme={theme} setTheme={setTheme} />
      <Hero />
      <About />
      <Features />
      <HowItWorks />
      <StatsBand />
      <FAQ />
      <Privacy />
      <CTASection />
      <Footer />
      
      {/* Scroll to Top Button */}
      {scrolled && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-40 rounded-full p-3 transition-all duration-300 hover:scale-110 animate-fade-in-up"
          style={{
            background: "var(--accent)",
            color: "white",
            border: "none",
            cursor: "pointer",
            boxShadow: "var(--shadow-lg)",
            width: 48,
            height: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label="Scroll to top"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="18 15 12 9 6 15"/>
          </svg>
        </button>
      )}
    </div>
  );
}
