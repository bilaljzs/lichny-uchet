import React, { useState, useEffect, useRef, useId } from "react";
import { createPortal } from "react-dom";
import {
  LayoutGrid, Users, Calculator, BarChart3, Plus, LogOut, CreditCard,
  ChevronRight, X, Pencil, Trash2, Search, Eye, EyeOff, Loader2, Radio, Download,
  Copy, Calendar,
} from "lucide-react";
import { login as apiLogin, fetchState, saveState, fetchRate, getToken, setToken, clearToken } from "./api";
import { C, STATUSES, STATUS_COLOR } from "./theme";
import AccountCardCarousel from "./components/AccountCardCarousel";

/* ============================================================
   DESIGN TOKENS — v9 "Yamakassi Copper" (see ./theme.js)
   Full redesign: espresso-black carbon surfaces, warm copper as
   the primary brand/interactive accent (borders, buttons, active
   states), ivory-cream reserved for money figures (₽ values),
   mint/coral kept for financial gain/loss. The car-hero photo is
   gone — the login screen and its transition now carry a drawn
   medallion emblem (see the Medallion component) instead.
   ============================================================ */

const FONTS = (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600&family=Cormorant:ital@1&family=Marcellus&display=swap');
    .cmd-root { font-family: 'Inter', system-ui, sans-serif; background: ${C.bg}; }
    .cmd-display { font-family: 'Space Grotesk', system-ui, sans-serif; }
    .cmd-mono { font-family: 'JetBrains Mono', ui-monospace, monospace; font-variant-numeric: tabular-nums; }
    .cmd-serif { font-family: 'Cormorant', Georgia, serif; font-style: italic; font-variant-numeric: tabular-nums; letter-spacing: -0.01em; }

    .yamakassi-word { font-family: 'Cormorant', serif; font-style: italic; font-size: 19px; line-height: 1; color: ${C.gold}; }
    .yamakassi-sub { font-family: 'Marcellus', serif; font-size: 7.5px; letter-spacing: 0.35em; color: ${C.red}; margin-top: 3px; }

    .aurora-wrap { position: fixed; inset: 0; overflow: hidden; z-index: 0; animation: hue-drift 70s linear infinite; }
    .aurora-blob { position: absolute; border-radius: 9999px; filter: blur(60px); opacity: 0.6; mix-blend-mode: screen; will-change: transform; }
    .aurora-a { width: 68vw; height: 68vw; background: radial-gradient(circle, ${C.red}, transparent 68%); top: -18vw; left: -14vw; animation: drift-a 22s ease-in-out infinite; opacity: 0.32; }
    .aurora-b { width: 62vw; height: 62vw; background: radial-gradient(circle, #2e1b0f, transparent 68%); bottom: -20vw; right: -16vw; animation: drift-b 26s ease-in-out infinite; }
    .aurora-c { width: 52vw; height: 52vw; background: radial-gradient(circle, ${C.chrome}, transparent 68%); top: 28vh; right: -12vw; animation: drift-c 19s ease-in-out infinite; opacity: 0.09; }
    .aurora-d { width: 34vw; height: 34vw; background: radial-gradient(circle, ${C.goldSoft}, transparent 72%); top: 8vh; left: 20vw; opacity: 0.07; animation: drift-d 15s ease-in-out infinite; }
    @keyframes drift-a { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(16vw,18vh) scale(1.22); } }
    @keyframes drift-b { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-15vw,-14vh) scale(1.18); } }
    @keyframes drift-c { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-14vw,16vh) scale(0.86); } }
    @keyframes drift-d { 0%,100% { transform: translate(0,0); } 50% { transform: translate(10vw,12vh); } }
    @keyframes hue-drift { 0% { filter: hue-rotate(0deg); } 50% { filter: hue-rotate(6deg); } 100% { filter: hue-rotate(0deg); } }
    @media (prefers-reduced-motion: reduce) { .aurora-blob, .aurora-wrap { animation: none !important; } }

    .glass { background: ${C.surfaceGlass}; backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }
    .glass-strong { background: ${C.surfaceGlassStrong}; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }

    @keyframes cmd-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }
    .cmd-pulse { animation: cmd-pulse 2s ease-in-out infinite; }
    input::placeholder, textarea::placeholder { color: rgba(244,241,248,0.28); }
    .cmd-fade-in { animation: cmd-fade-in 0.3s cubic-bezier(0.16,1,0.3,1) both; }
    @keyframes cmd-fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

    .medal-hero { position: relative; width: 62%; max-width: 210px; margin: 0 auto; }
    .medal-glow { position: absolute; inset: -18%; border-radius: 9999px; background: radial-gradient(circle at center, rgba(200,98,46,0.55), rgba(200,98,46,0.08) 55%, transparent 75%); filter: blur(20px); animation: medal-glow-pulse 3.2s ease-in-out infinite; }
    @keyframes medal-glow-pulse { 0%,100% { opacity: 0.7; transform: scale(1); } 50% { opacity: 1; transform: scale(1.08); } }
    .medal-wrap { position: relative; overflow: hidden; border-radius: 9999px; animation: medal-float 5s ease-in-out infinite; }
    @keyframes medal-float { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-6px) rotate(1.2deg); } }
    .medal-shine { position: absolute; top: 0; left: -60%; width: 40%; height: 100%; background: linear-gradient(115deg, transparent, rgba(255,255,255,0.5), transparent); transform: skewX(-18deg); animation: medal-shine-sweep 3.6s ease-in-out infinite; animation-delay: 1s; mix-blend-mode: overlay; }
    @keyframes medal-shine-sweep { 0% { left: -60%; } 35%,100% { left: 130%; } }
    @media (prefers-reduced-motion: reduce) { .medal-glow, .medal-wrap, .medal-shine { animation: none !important; } }

    .login-form-exit { animation: form-exit 0.35s ease forwards; }
    @keyframes form-exit { to { opacity: 0; transform: scale(0.92); } }

    /* ---- Login transition: launch jolt + layered smoke + fullscreen smog cover ---- */
    .login-transition-overlay { position: fixed; inset: 0; z-index: 9999; overflow: hidden; pointer-events: none; }

    .drive-car-img {
      position: absolute; top: 55%; left: 0; width: 22vw; max-width: 130px; height: auto;
      transform: translate(-20vw, -50%) rotate(0deg) scale(1);
      animation: car-launch 1.1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      filter: drop-shadow(0 14px 22px rgba(0,0,0,0.6)) blur(0px);
    }
    @keyframes car-launch {
      0%   { transform: translate(-20vw, -50%) rotate(0deg) scale(1, 1); filter: drop-shadow(0 10px 16px rgba(0,0,0,0.55)) blur(0px); }
      5%   { transform: translate(-21vw, -49%) rotate(-10deg) scale(1.05, 0.95); filter: drop-shadow(0 6px 10px rgba(0,0,0,0.5)) blur(0px); }
      13%  { transform: translate(-16vw, -50%) rotate(30deg) scale(1, 1); filter: drop-shadow(0 14px 22px rgba(0,0,0,0.6)) blur(1.6px); }
      55%  { transform: translate(52vw, -50%) rotate(430deg) scale(1, 1); filter: drop-shadow(0 14px 22px rgba(0,0,0,0.6)) blur(2px); }
      88%  { transform: translate(96vw, -50%) rotate(690deg) scale(1, 1); filter: drop-shadow(0 14px 22px rgba(0,0,0,0.6)) blur(1px); }
      100% { transform: translate(120vw, -50%) rotate(760deg) scale(1, 1); filter: drop-shadow(0 14px 22px rgba(0,0,0,0.6)) blur(0px); }
    }

    /* layer 1: fine dust kicked up from the rear wheel at launch — one shared blur, not per-particle */
    .dust-layer { position: absolute; inset: 0; filter: blur(1.5px); }
    .dust-particle { position: absolute; top: 62%; left: 4vw; width: 10px; height: 10px; border-radius: 9999px; background: radial-gradient(circle, rgba(205,196,184,0.85), rgba(205,196,184,0) 70%); opacity: 0; animation: dust-kick 0.55s ease-out forwards; }
    @keyframes dust-kick { 0% { opacity: 0.8; transform: translate(0, 0) scale(0.4); } 100% { opacity: 0; transform: translate(-8px, 20px) scale(1.7); } }
    .dust-1 { left: 3vw; top: 63%; animation-delay: 0.02s; }
    .dust-2 { left: 1vw; top: 60%; animation-delay: 0.07s; }
    .dust-3 { left: 5.5vw; top: 65%; animation-delay: 0.05s; }
    .dust-4 { left: 0.5vw; top: 58%; animation-delay: 0.13s; }
    .dust-5 { left: 4.5vw; top: 61%; animation-delay: 0.17s; }
    .dust-6 { left: 2vw; top: 64%; animation-delay: 0.21s; }

    /* layer 2: main smoke trail — 10 layered blur clouds, one shared blur+blend on the parent */
    .smoke-trail-layer { position: absolute; inset: 0; filter: blur(5px); mix-blend-mode: screen; }
    .smoke-cloud { position: absolute; top: 55%; width: 16vw; max-width: 92px; height: 16vw; max-height: 92px; border-radius: 9999px; background: radial-gradient(circle, rgba(214,212,209,0.7), rgba(160,158,156,0.3) 55%, transparent 76%); opacity: 0; animation: cloud-puff 1.7s ease-out forwards; }
    @keyframes cloud-puff { 0% { opacity: 0.7; transform: translateY(0) scale(0.3); } 100% { opacity: 0; transform: translateY(var(--puff-y, -20px)) scale(3.6); } }
    .cloud-1  { left: -17vw; top: 53%; animation-delay: 0.00s; --puff-y: -18px; }
    .cloud-2  { left: -9vw;  top: 58%; animation-delay: 0.08s; --puff-y: 24px; }
    .cloud-3  { left: -1vw;  top: 50%; animation-delay: 0.16s; --puff-y: -30px; }
    .cloud-4  { left: 7vw;   top: 56%; animation-delay: 0.24s; --puff-y: 16px; }
    .cloud-5  { left: 15vw;  top: 52%; animation-delay: 0.32s; --puff-y: -24px; }
    .cloud-6  { left: 24vw;  top: 59%; animation-delay: 0.40s; --puff-y: 28px; }
    .cloud-7  { left: 33vw;  top: 54%; animation-delay: 0.48s; --puff-y: -16px; }
    .cloud-8  { left: 42vw;  top: 57%; animation-delay: 0.56s; --puff-y: 20px; }
    .cloud-9  { left: 51vw;  top: 51%; animation-delay: 0.64s; --puff-y: -26px; }
    .cloud-10 { left: 60vw;  top: 55%; animation-delay: 0.72s; --puff-y: 14px; }

    /* layer 3: fullscreen smog — hides the screen swap, then clears once the app is mounted underneath */
    .smog-overlay {
      position: fixed; inset: -5%; pointer-events: none;
      background:
        radial-gradient(circle at 28% 38%, rgba(218,216,213,0.9), transparent 60%),
        radial-gradient(circle at 72% 62%, rgba(188,186,183,0.9), transparent 65%),
        radial-gradient(circle at 50% 25%, rgba(228,226,223,0.85), transparent 55%),
        radial-gradient(circle at 18% 72%, rgba(178,176,173,0.9), transparent 60%),
        radial-gradient(circle at 82% 22%, rgba(200,198,195,0.9), transparent 55%),
        #b6b4b1;
      filter: blur(16px);
      opacity: 0;
    }
    .smog-in { animation: smog-fill 0.85s ease-in forwards; animation-delay: 0.4s; }
    @keyframes smog-fill { from { opacity: 0; transform: scale(1); } to { opacity: 0.97; transform: scale(1); } }
    .smog-out { animation: smog-clear 1s ease-in forwards; }
    @keyframes smog-clear { from { opacity: 0.97; transform: scale(1); } to { opacity: 0; transform: scale(1.15); } }

    @media (prefers-reduced-motion: reduce) {
      .drive-car-img, .dust-particle, .smoke-cloud, .smog-in, .smog-out, .login-form-exit { animation: none !important; }
      .smog-overlay { opacity: 0 !important; }
    }
  `}</style>
);

/* ---------- Medallion: drawn Yamakassi emblem, replaces the old car-hero photo ---------- */
function Medallion({ className = "" }) {
  const uidBase = useId();
  const gradId = `medal-fill-${uidBase}`;
  return (
    <svg viewBox="0 0 200 200" className={className} style={{ display: "block" }}>
      <defs>
        <radialGradient id={gradId} cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor={C.surfaceGlassStrong} />
          <stop offset="100%" stopColor={C.bg} />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="92" fill="none" stroke={C.red} strokeWidth="1" opacity="0.3" />
      <circle cx="100" cy="100" r="80" fill={`url(#${gradId})`} stroke={C.redSoft} strokeWidth="2" />
      <circle cx="100" cy="100" r="70" fill="none" stroke={C.gold} strokeWidth="0.75" opacity="0.55" />
      <circle cx="100" cy="18" r="2.4" fill={C.gold} />
      <circle cx="182" cy="100" r="2.4" fill={C.gold} />
      <circle cx="100" cy="182" r="2.4" fill={C.gold} />
      <circle cx="18" cy="100" r="2.4" fill={C.gold} />
      <text x="100" y="127" textAnchor="middle" fontFamily="Cormorant, serif" fontStyle="italic" fontSize="86" fill={C.gold}>Y</text>
    </svg>
  );
}

function LoginTransition({ phase }) {
  return createPortal(
    <div className="login-transition-overlay">
      <div className="dust-layer">
        <div className="dust-particle dust-1" />
        <div className="dust-particle dust-2" />
        <div className="dust-particle dust-3" />
        <div className="dust-particle dust-4" />
        <div className="dust-particle dust-5" />
        <div className="dust-particle dust-6" />
      </div>
      <div className="smoke-trail-layer">
        <div className="smoke-cloud cloud-1" />
        <div className="smoke-cloud cloud-2" />
        <div className="smoke-cloud cloud-3" />
        <div className="smoke-cloud cloud-4" />
        <div className="smoke-cloud cloud-5" />
        <div className="smoke-cloud cloud-6" />
        <div className="smoke-cloud cloud-7" />
        <div className="smoke-cloud cloud-8" />
        <div className="smoke-cloud cloud-9" />
        <div className="smoke-cloud cloud-10" />
      </div>
      <Medallion className="drive-car-img" />
      <div className={`smog-overlay ${phase === "fadeout" ? "smog-out" : "smog-in"}`} />
    </div>,
    document.body
  );
}

function AuroraBackground() {
  return (
    <div className="aurora-wrap">
      <div className="aurora-blob aurora-a" />
      <div className="aurora-blob aurora-b" />
      <div className="aurora-blob aurora-c" />
      <div className="aurora-blob aurora-d" />
    </div>
  );
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}
function fmt(n) {
  return new Intl.NumberFormat("ru-RU").format(Math.round(n || 0));
}

/* ---------- Animated number ---------- */
function CountUp({ value, className, style }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);
  const raf = useRef(null);

  useEffect(() => {
    const from = prev.current;
    const to = value;
    if (from === to) return;
    const start = performance.now();
    const duration = 450;
    cancelAnimationFrame(raf.current);
    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (to - from) * eased);
      if (t < 1) raf.current = requestAnimationFrame(tick);
      else prev.current = to;
    }
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [value]);

  return (
    <span className={className} style={style}>
      {fmt(display)}
    </span>
  );
}

/* ---------- Panel: glass card with the aurora glow showing through ---------- */
function Panel({ children, className = "", tone = "default", onClick, as: As = "div" }) {
  const toneBorder = {
    default: C.border,
    gold: "rgba(230,184,105,0.35)",
    coral: "rgba(255,122,107,0.35)",
    mint: "rgba(57,217,171,0.35)",
  }[tone];
  const toneWash = {
    default: "transparent",
    gold: C.goldDim,
    coral: C.coralDim,
    mint: C.mintDim,
  }[tone];
  const markColor = { default: C.red, gold: C.goldSoft, coral: C.coral, mint: C.mint }[tone];

  return (
    <As
      onClick={onClick}
      className={`glass relative p-4 rounded-2xl overflow-hidden ${onClick ? "text-left active:scale-[0.98] transition" : ""} ${className}`}
      style={{
        backgroundImage: `linear-gradient(160deg, ${toneWash}, transparent 60%)`,
        border: `1px solid ${toneBorder}`,
        boxShadow: "0 1px 0 rgba(255,255,255,0.06) inset, 0 14px 28px -16px rgba(0,0,0,0.55)",
      }}
    >
      <div
        className="absolute top-0 left-0 w-5 h-5 pointer-events-none"
        style={{ borderTop: `1.5px solid ${markColor}`, borderLeft: `1.5px solid ${markColor}`, opacity: 0.75, borderTopLeftRadius: "1rem" }}
      />
      {children}
    </As>
  );
}

function Eyebrow({ children, dot = true }) {
  return (
    <div className="flex items-center gap-2">
      {dot && <span className="w-1.5 h-1.5 rounded-full" style={{ background: C.red, boxShadow: `0 0 8px ${C.red}` }} />}
      <span className="cmd-display text-[10.5px] font-semibold tracking-[0.22em] uppercase" style={{ color: C.dim }}>
        {children}
      </span>
    </div>
  );
}

function SectionHead({ icon: Icon, children, right }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={15} color={C.red} strokeWidth={2.25} />}
        <span className="cmd-display text-[13px] font-semibold tracking-[0.14em] uppercase" style={{ color: C.text }}>
          {children}
        </span>
      </div>
      {right}
    </div>
  );
}

/* ---------- Login ---------- */
function Login({ onLogin, error, busy, transitioning }) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");

  function submit(e) {
    e.preventDefault();
    if (!login.trim() || !password.trim()) {
      setLocalError("Введите логин и пароль");
      return;
    }
    setLocalError("");
    onLogin(login.trim(), password);
  }

  const shownError = localError || error;

  return (
    <div className="min-h-full flex items-center justify-center px-6 py-12">
      <form onSubmit={submit} className={`w-full max-w-sm cmd-fade-in ${transitioning ? "login-form-exit" : ""}`}>
        <div className="flex flex-col items-center mb-7">
          <div className="yamakassi-word" style={{ fontSize: 30 }}>Yamakassi</div>
          <div className="yamakassi-sub" style={{ marginTop: 4 }}>CASH</div>
        </div>

        <div className="medal-hero mb-6">
          <div className="medal-glow" />
          <div className="medal-wrap">
            <Medallion className="relative w-full select-none pointer-events-none" />
            <div className="medal-shine" />
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mb-2">
          <Radio size={13} color={C.red} className="cmd-pulse" />
          <span className="cmd-display text-[10.5px] font-semibold tracking-[0.25em] uppercase" style={{ color: C.dim }}>
            Система доступа
          </span>
        </div>
        <h1 className="cmd-display text-[34px] leading-none font-bold text-white tracking-tight mb-9 text-center">
          Авторизация
        </h1>

        <label className="cmd-display block text-[10.5px] font-semibold tracking-[0.2em] uppercase mb-2" style={{ color: C.faint }}>
          Логин
        </label>
        <input
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          autoCapitalize="none"
          className="cmd-mono w-full bg-transparent border-b outline-none text-white px-1 py-3 mb-6 text-[16px] tracking-wide transition-colors"
          style={{ borderColor: C.border }}
          onFocus={(e) => (e.target.style.borderColor = C.red)}
          onBlur={(e) => (e.target.style.borderColor = C.border)}
          placeholder="имя.пользователя"
        />

        <label className="cmd-display block text-[10.5px] font-semibold tracking-[0.2em] uppercase mb-2" style={{ color: C.faint }}>
          Пароль
        </label>
        <div className="relative mb-2">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="cmd-mono w-full bg-transparent border-b outline-none text-white px-1 py-3 pr-10 text-[16px] tracking-wide transition-colors"
            style={{ borderColor: C.border }}
            onFocus={(e) => (e.target.style.borderColor = C.red)}
            onBlur={(e) => (e.target.style.borderColor = C.border)}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-0 top-0 h-full px-1 flex items-center"
            style={{ color: C.faint }}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>

        {shownError && (
          <p className="cmd-mono text-[13px] mt-3" style={{ color: C.coral }}>
            {shownError}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="cmd-display w-full mt-8 py-4 rounded-xl font-semibold text-[13px] tracking-[0.18em] uppercase text-white transition active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ background: `linear-gradient(135deg, ${C.redSoft}, ${C.red})`, boxShadow: `0 8px 28px -6px ${C.red}88` }}
        >
          {busy && <Loader2 size={15} className="animate-spin" />}
          Войти
        </button>

        <p className="text-center text-[11.5px] mt-6 leading-relaxed" style={{ color: C.faint }}>
          Новый логин создаётся автоматически при первом входе.
          <br />У каждого логина — своя отдельная база.
        </p>
      </form>
    </div>
  );
}

/* ---------- Sheet ---------- */
function Sheet({ open, onClose, title, children }) {
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-md rounded-t-2xl max-h-[86vh] overflow-y-auto cmd-fade-in"
        style={{ background: "rgba(10,7,6,0.9)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderTop: `1px solid ${C.borderStrong}` }}
      >
        <div className="flex justify-center pt-3">
          <div className="w-9 h-1 rounded-full" style={{ background: C.border }} />
        </div>
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: `linear-gradient(135deg, ${C.redSoft}, ${C.red})`, boxShadow: `0 10px 24px -10px ${C.red}88` }} />
            <span className="cmd-display text-[12px] font-semibold tracking-[0.18em] uppercase" style={{ color: C.text }}>
              {title}
            </span>
          </div>
          <button onClick={onClose} style={{ color: C.faint }}>
            <X size={19} />
          </button>
        </div>
        <div className="px-5 pb-8">{children}</div>
      </div>
    </div>,
    document.body
  );
}

function Field({ label, children }) {
  return (
    <div className="mb-5">
      <label className="cmd-display block text-[10.5px] font-semibold tracking-[0.2em] uppercase mb-2" style={{ color: C.faint }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function TextInput(props) {
  return (
    <input
      {...props}
      className="cmd-mono w-full bg-black/30 border outline-none text-white px-4 py-3 text-[16px] tracking-wide transition-colors rounded-xl"
      style={{ borderColor: C.border }}
      onFocus={(e) => (e.target.style.borderColor = C.red)}
      onBlur={(e) => (e.target.style.borderColor = C.border)}
    />
  );
}

/* ---------- Stat card ---------- */
function Stat({ icon: Icon, label, value, suffix, signed }) {
  const valueColor = signed ? (value >= 0 ? C.mint : C.coral) : C.text;
  const panelTone = signed ? (value >= 0 ? "mint" : "coral") : "default";
  return (
    <Panel tone={panelTone}>
      <div className="flex items-center gap-2 mb-3" style={{ color: signed ? valueColor : C.faint }}>
        <Icon size={13} strokeWidth={2.25} />
        <span className="cmd-display text-[10px] font-semibold tracking-[0.18em] uppercase">{label}</span>
      </div>
      <div className="cmd-mono text-2xl font-bold" style={{ color: valueColor }}>
        <CountUp value={value} />
        {suffix && <span className="text-base ml-1" style={{ color: C.faint }}>{suffix}</span>}
      </div>
    </Panel>
  );
}

/* ---------- Overview ---------- */
function Overview({ subjects, transactions, onSearch, search, onOpenSubject, cards }) {
  const totalCapital = subjects.reduce((s, sub) => s + sub.accounts.reduce((a, acc) => a + acc.balance, 0), 0);
  const accountCount = subjects.reduce((s, sub) => s + sub.accounts.length, 0);
  const { rapiraRate, localLow, localHigh, error: rateFailed } = useRate();

  const query = search.trim().toLowerCase();
  const matchedSubjects = query
    ? subjects.filter((s) => s.name.toLowerCase().includes(query) || (s.phone || "").toLowerCase().includes(query))
    : [];
  const matchedTransactions = query
    ? transactions.filter((t) => t.label.toLowerCase().includes(query))
    : transactions;

  return (
    <div className="px-5 pt-7">
      <div className="flex items-start justify-between mb-6">
        <Eyebrow>Текущий статус</Eyebrow>
        <div className="text-right">
          <div className="cmd-display text-[8.5px] font-semibold tracking-[0.16em] uppercase mb-1" style={{ color: C.faint }}>
            Курс Rapira
          </div>
          {rapiraRate != null ? (
            <div className="cmd-mono text-[12px] font-semibold leading-none mb-2" style={{ color: C.text }}>
              {rapiraRate.toFixed(2)} ₽
            </div>
          ) : (
            <div className="cmd-mono text-[11px] leading-none mb-2" style={{ color: rateFailed ? C.coral : C.faint }}>
              {rateFailed ? "недоступен" : "…"}
            </div>
          )}
          <div className="cmd-display text-[8.5px] font-semibold tracking-[0.16em] uppercase mb-1" style={{ color: C.faint }}>
            Валютка Мах
          </div>
          {localLow != null && localHigh != null ? (
            <div className="cmd-mono text-[13px] font-bold leading-none" style={{ color: C.gold }}>
              {localLow.toFixed(1)}–{localHigh.toFixed(1)} ₽
            </div>
          ) : (
            <div className="cmd-mono text-[11px] leading-none" style={{ color: rateFailed ? C.coral : C.faint }}>
              {rateFailed ? "недоступен" : "…"}
            </div>
          )}
        </div>
      </div>

      <TodayCards cards={cards} />

      <div className="mb-8">
        <div className="cmd-display text-[10.5px] font-semibold tracking-[0.2em] uppercase mb-1" style={{ color: C.faint }}>
          Баланс
        </div>
        <div className="flex items-baseline gap-2">
          <CountUp
            value={totalCapital}
            className="cmd-serif text-[46px] leading-none font-medium text-white"
            style={{ textShadow: totalCapital !== 0 ? `0 0 34px rgba(201,161,90,0.35)` : "none" }}
          />
          <span className="cmd-serif text-[30px] font-medium" style={{ color: C.gold }}>₽</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <Stat icon={Users} label="Субъекты" value={subjects.length} />
        <Stat icon={CreditCard} label="Счета" value={accountCount} />
      </div>

      <Panel className="flex items-center gap-3 mb-8">
        <Search size={16} style={{ color: C.faint }} />
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Поиск по базе данных..."
          className="cmd-mono bg-transparent outline-none text-white text-[16px] w-full"
        />
      </Panel>

      {query && (
        <div className="mb-6">
          <SectionHead>Найдено субъектов: {matchedSubjects.length}</SectionHead>
          {matchedSubjects.length === 0 ? (
            <div className="cmd-display text-[11px] tracking-[0.2em] uppercase text-center py-6" style={{ color: C.faint }}>
              Ничего не найдено
            </div>
          ) : (
            <div className="space-y-2 pb-2">
              {matchedSubjects.map((s) => {
                const cap = s.accounts.reduce((a, acc) => a + acc.balance, 0);
                return (
                  <Panel key={s.id} as="button" onClick={() => onOpenSubject(s.id)} className="w-full flex items-center justify-between">
                    <div>
                      <div className="text-white font-semibold text-[15px]">{s.name}</div>
                      <div className="cmd-mono text-[11.5px] mt-0.5" style={{ color: C.faint }}>
                        {s.phone || "—"} · {s.accounts.length} счёт(а)
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="cmd-mono font-semibold" style={{ color: C.gold }}>{fmt(cap)} ₽</span>
                      <ChevronRight size={16} style={{ color: C.faint }} />
                    </div>
                  </Panel>
                );
              })}
            </div>
          )}
        </div>
      )}

      {matchedTransactions.length > 0 && (
        <div>
          <SectionHead>{query ? `Найдено транзакций: ${matchedTransactions.length}` : "Журнал транзакций"}</SectionHead>
          <div className="space-y-2 pb-4">
            {matchedTransactions.slice(0, 8).map((t) => (
              <TxRow key={t.id} t={t} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TxRow({ t }) {
  const positive = t.delta >= 0;
  return (
    <Panel className="flex items-center justify-between !p-3.5">
      <div>
        <div className="text-[13.5px] text-white">{t.label}</div>
        <div className="cmd-mono text-[10.5px] mt-0.5" style={{ color: C.faint }}>{t.time}</div>
      </div>
      <div className="cmd-mono font-semibold text-[14px]" style={{ color: positive ? C.mint : C.coral }}>
        {positive ? "+" : ""}
        {fmt(t.delta)} ₽
      </div>
    </Panel>
  );
}

/* ---------- People ---------- */
function People({ subjects, setSubjects, addTransaction, openSubject, setOpenSubject }) {
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");

  function registerSubject() {
    if (!name.trim()) return;
    setSubjects((prev) => [...prev, { id: uid(), name: name.trim(), phone, note, accounts: [] }]);
    setName(""); setPhone(""); setNote("");
    setAddOpen(false);
  }

  const active = subjects.find((s) => s.id === openSubject);

  return (
    <div className="px-5 pt-6">
      <SectionHead
        icon={Users}
        right={
          <button
            onClick={() => setAddOpen(true)}
            className="cmd-display flex items-center gap-1 rounded-full text-[10.5px] font-semibold tracking-[0.14em] uppercase px-3.5 py-2"
            style={{ color: C.red, border: `1px solid ${C.red}66` }}
          >
            <Plus size={13} /> Добавить
          </button>
        }
      >
        Субъекты
      </SectionHead>

      <div className="cmd-display text-[10.5px] font-semibold tracking-[0.2em] uppercase mb-1" style={{ color: C.faint }}>
        База профилей
      </div>
      <div className="cmd-mono text-3xl font-bold mb-6" style={{ color: C.red, textShadow: `0 0 16px ${C.red}55` }}>
        {subjects.length}
      </div>

      {subjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20" style={{ color: C.faint }}>
          <Users size={36} className="mb-3 opacity-40" />
          <div className="cmd-display text-[11px] tracking-[0.2em] uppercase">База данных пуста</div>
        </div>
      ) : (
        <div className="space-y-2">
          {subjects.map((s) => {
            const cap = s.accounts.reduce((a, acc) => a + acc.balance, 0);
            return (
              <Panel key={s.id} as="button" onClick={() => setOpenSubject(s.id)} className="w-full flex items-center justify-between">
                <div>
                  <div className="text-white font-semibold text-[15px]">{s.name}</div>
                  <div className="cmd-mono text-[11.5px] mt-0.5" style={{ color: C.faint }}>
                    {s.phone || "—"} · {s.accounts.length} счёт(а)
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="cmd-mono font-semibold" style={{ color: C.gold }}>{fmt(cap)} ₽</span>
                  <ChevronRight size={16} style={{ color: C.faint }} />
                </div>
              </Panel>
            );
          })}
        </div>
      )}

      <Sheet open={addOpen} onClose={() => setAddOpen(false)} title="Регистрация субъекта">
        <Field label="Идентификатор (имя)">
          <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Введите имя..." />
        </Field>
        <Field label="Канал связи (телефон)">
          <TextInput value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7..." />
        </Field>
        <Field label="Данные (заметка)">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="cmd-mono w-full bg-black/30 border outline-none text-white px-4 py-3 text-[16px] rounded-xl"
            style={{ borderColor: C.border }}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3 mt-2">
          <button onClick={() => setAddOpen(false)} className="cmd-display py-3.5 rounded-xl border text-[12px] font-semibold tracking-[0.14em] uppercase" style={{ borderColor: C.border, color: C.dim }}>
            Отмена
          </button>
          <button onClick={registerSubject} className="cmd-display py-3.5 rounded-xl font-semibold text-[12px] tracking-[0.14em] uppercase text-white" style={{ background: `linear-gradient(135deg, ${C.redSoft}, ${C.red})`, boxShadow: `0 10px 24px -10px ${C.red}88` }}>
            Зарегистрировать
          </button>
        </div>
      </Sheet>

      {active && (
        <SubjectDetail subject={active} onClose={() => setOpenSubject(null)} setSubjects={setSubjects} addTransaction={addTransaction} />
      )}
    </div>
  );
}

function SubjectDetail({ subject, onClose, setSubjects, addTransaction }) {
  const [addAccountOpen, setAddAccountOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [bank, setBank] = useState("");
  const [balance, setBalance] = useState("");
  const [cardId, setCardId] = useState("");
  const [accPhone, setAccPhone] = useState("");
  const [status, setStatus] = useState("РАБОЧИЙ");

  const [editSubjectOpen, setEditSubjectOpen] = useState(false);
  const [editName, setEditName] = useState(subject.name);
  const [editPhone, setEditPhone] = useState(subject.phone);
  const [editNote, setEditNote] = useState(subject.note);

  function openEditSubject() {
    setEditName(subject.name); setEditPhone(subject.phone); setEditNote(subject.note);
    setEditSubjectOpen(true);
  }
  function saveSubject() {
    if (!editName.trim()) return;
    setSubjects((prev) => prev.map((s) => (s.id === subject.id ? { ...s, name: editName.trim(), phone: editPhone, note: editNote } : s)));
    setEditSubjectOpen(false);
  }
  function deleteSubject() {
    if (!window.confirm(`Удалить субъекта «${subject.name}» вместе со всеми его счетами? Это необратимо.`)) return;
    setSubjects((prev) => prev.filter((s) => s.id !== subject.id));
    onClose();
  }

  function resetForm() { setBank(""); setBalance(""); setCardId(""); setAccPhone(""); setStatus("РАБОЧИЙ"); setEditing(null); }
  function openNew() { resetForm(); setAddAccountOpen(true); }
  function openEdit(acc) {
    setBank(acc.bank); setBalance(String(acc.balance)); setCardId(acc.cardId); setAccPhone(acc.phone); setStatus(acc.status);
    setEditing(acc.id); setAddAccountOpen(true);
  }

  function saveAccount() {
    if (!bank.trim()) return;
    const newBalance = Number(balance) || 0;
    setSubjects((prev) =>
      prev.map((s) => {
        if (s.id !== subject.id) return s;
        if (editing) {
          const old = s.accounts.find((a) => a.id === editing);
          if (old && old.balance !== newBalance) {
            addTransaction({ label: `Корректировка · ${bank} (${subject.name})`, delta: newBalance - old.balance });
          }
          return { ...s, accounts: s.accounts.map((a) => (a.id === editing ? { ...a, bank, balance: newBalance, cardId, phone: accPhone, status } : a)) };
        }
        const acc = { id: uid(), bank, balance: newBalance, cardId: cardId || "0000", phone: accPhone, status };
        if (newBalance !== 0) addTransaction({ label: `Новый счёт · ${bank} (${subject.name})`, delta: newBalance });
        return { ...s, accounts: [...s.accounts, acc] };
      })
    );
    setAddAccountOpen(false);
    resetForm();
  }

  function deleteAccount(id) {
    if (!window.confirm("Удалить этот счёт? Это необратимо.")) return;
    setSubjects((prev) => prev.map((s) => (s.id === subject.id ? { ...s, accounts: s.accounts.filter((a) => a.id !== id) } : s)));
  }

  const capital = subject.accounts.reduce((a, acc) => a + acc.balance, 0);

  return createPortal(
    <div className="fixed inset-0 z-40 overflow-y-auto" style={{ background: "rgba(9,5,4,0.9)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}>
      <div className="flex items-center px-5 pt-6 pb-4" style={{ borderBottom: `1px solid ${C.border}` }}>
        <button onClick={onClose} className="cmd-display text-[13px] font-medium" style={{ color: C.dim }}>← Назад</button>
      </div>

      <div className="px-5 pt-6">
        <div className="flex items-start justify-between gap-3 mb-1.5">
          <h2 className="cmd-display text-[30px] font-bold text-white leading-tight">{subject.name}</h2>
          <div className="flex items-center gap-3 pt-2 shrink-0">
            <button onClick={openEditSubject} className="flex items-center gap-1 text-[11.5px] uppercase tracking-wide" style={{ color: C.dim }}>
              <Pencil size={13} />
            </button>
            <button onClick={deleteSubject} className="flex items-center gap-1 text-[11.5px] uppercase tracking-wide" style={{ color: C.coral }}>
              <Trash2 size={13} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 mb-7">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: `linear-gradient(135deg, ${C.redSoft}, ${C.red})`, boxShadow: `0 10px 24px -10px ${C.red}88` }} />
          <span className="cmd-mono text-[13px] tracking-wide" style={{ color: C.red }}>{subject.phone || "нет телефона"}</span>
        </div>

        <div className="cmd-display text-[10.5px] font-semibold tracking-[0.2em] uppercase mb-1" style={{ color: C.faint }}>
          Сводный капитал
        </div>
        <div className="flex items-baseline gap-2 mb-8">
          <CountUp value={capital} className="cmd-serif text-[40px] leading-none font-medium text-white" style={{ textShadow: `0 0 26px rgba(201,161,90,0.35)` }} />
          <span className="cmd-serif text-2xl font-medium" style={{ color: C.gold }}>₽</span>
        </div>

        {subject.accounts.length > 0 && (
          <div className="mb-8">
            <AccountCardCarousel accounts={subject.accounts} ownerName={subject.name} />
          </div>
        )}

        <SectionHead
          icon={CreditCard}
          right={
            <button onClick={openNew} className="cmd-display flex items-center gap-1 rounded-full text-[10.5px] font-semibold tracking-[0.14em] uppercase px-3.5 py-2" style={{ color: C.red, border: `1px solid ${C.red}66` }}>
              <Plus size={13} /> Новый счёт
            </button>
          }
        >
          Реестр счетов
        </SectionHead>

        <div className="space-y-3 pb-10">
          {subject.accounts.map((acc) => (
            <Panel key={acc.id}>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold text-[16px]">{acc.bank}</span>
                  <span
                    className="cmd-display text-[9.5px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full"
                    style={{ color: STATUS_COLOR[acc.status], border: `1px solid ${STATUS_COLOR[acc.status]}` }}
                  >
                    {acc.status}
                  </span>
                </div>
                <div className="cmd-mono text-white font-semibold">
                  {fmt(acc.balance)} <span style={{ color: C.gold }}>₽</span>
                </div>
              </div>
              <div className="cmd-mono text-[13px] tracking-widest mb-3" style={{ color: C.faint }}>•••• {acc.cardId}</div>
              <div className="flex gap-4 pt-3" style={{ borderTop: `1px solid ${C.border}` }}>
                <button onClick={() => openEdit(acc)} className="flex items-center gap-1 text-[11.5px] uppercase tracking-wide" style={{ color: C.dim }}>
                  <Pencil size={12.5} /> Изменить
                </button>
                <button onClick={() => deleteAccount(acc.id)} className="flex items-center gap-1 text-[11.5px] uppercase tracking-wide" style={{ color: C.coral }}>
                  <Trash2 size={12.5} /> Удалить
                </button>
              </div>
            </Panel>
          ))}
          {subject.accounts.length === 0 && (
            <div className="text-[13px] text-center py-10" style={{ color: C.faint }}>Счетов пока нет</div>
          )}
        </div>
      </div>

      <Sheet open={addAccountOpen} onClose={() => setAddAccountOpen(false)} title={editing ? "Редактирование счёта" : "Регистрация счёта"}>
        <Field label="Организация (банк)">
          <TextInput value={bank} onChange={(e) => setBank(e.target.value)} placeholder="Сбербанк" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Баланс (₽)">
            <TextInput value={balance} onChange={(e) => setBalance(e.target.value.replace(/[^0-9-]/g, ""))} placeholder="0" />
          </Field>
          <Field label="ID карты (4 цифры)">
            <TextInput value={cardId} maxLength={4} onChange={(e) => setCardId(e.target.value.replace(/\D/g, ""))} placeholder="1234" />
          </Field>
        </div>
        <Field label="Привязанный телефон">
          <TextInput value={accPhone} onChange={(e) => setAccPhone(e.target.value)} placeholder="+7..." />
        </Field>
        <Field label="Статус доступа">
          <div className="grid grid-cols-2 gap-3">
            {STATUSES.map((st) => (
              <button
                key={st}
                onClick={() => setStatus(st)}
                className="cmd-display py-4 border text-[12px] font-semibold tracking-wide uppercase"
                style={
                  status === st
                    ? { borderColor: STATUS_COLOR[st], color: STATUS_COLOR[st], background: `${STATUS_COLOR[st]}15` }
                    : { borderColor: C.border, color: C.faint }
                }
              >
                {st}
              </button>
            ))}
          </div>
        </Field>
        <div className="grid grid-cols-2 gap-3 mt-2">
          <button onClick={() => setAddAccountOpen(false)} className="cmd-display py-3.5 rounded-xl border text-[12px] font-semibold tracking-[0.14em] uppercase" style={{ borderColor: C.border, color: C.dim }}>
            Отмена
          </button>
          <button onClick={saveAccount} className="cmd-display py-3.5 rounded-xl font-semibold text-[12px] tracking-[0.14em] uppercase text-white" style={{ background: `linear-gradient(135deg, ${C.redSoft}, ${C.red})`, boxShadow: `0 10px 24px -10px ${C.red}88` }}>
            Сохранить счёт
          </button>
        </div>
      </Sheet>

      <Sheet open={editSubjectOpen} onClose={() => setEditSubjectOpen(false)} title="Редактирование субъекта">
        <Field label="Идентификатор (имя)">
          <TextInput value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Введите имя..." />
        </Field>
        <Field label="Канал связи (телефон)">
          <TextInput value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="+7..." />
        </Field>
        <Field label="Данные (заметка)">
          <textarea
            value={editNote}
            onChange={(e) => setEditNote(e.target.value)}
            rows={3}
            className="cmd-mono w-full bg-black/30 border outline-none text-white px-4 py-3 text-[16px] rounded-xl"
            style={{ borderColor: C.border }}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3 mt-2">
          <button onClick={() => setEditSubjectOpen(false)} className="cmd-display py-3.5 rounded-xl border text-[12px] font-semibold tracking-[0.14em] uppercase" style={{ borderColor: C.border, color: C.dim }}>
            Отмена
          </button>
          <button onClick={saveSubject} className="cmd-display py-3.5 rounded-xl font-semibold text-[12px] tracking-[0.14em] uppercase text-white" style={{ background: `linear-gradient(135deg, ${C.redSoft}, ${C.red})`, boxShadow: `0 10px 24px -10px ${C.red}88` }}>
            Сохранить
          </button>
        </div>
      </Sheet>
    </div>,
    document.body
  );
}

/* ---------- Shared rate polling: fetch /api/rate on mount, refresh every 60s ---------- */
function useRate() {
  const [state, setState] = useState({ rapiraRate: null, localLow: null, localHigh: null, error: false });

  useEffect(() => {
    let cancelled = false;
    function load() {
      fetchRate()
        .then((data) => {
          if (!cancelled) {
            setState({ rapiraRate: data.rapiraRate, localLow: data.localLow, localHigh: data.localHigh, error: false });
          }
        })
        .catch(() => {
          if (!cancelled) setState((prev) => ({ ...prev, error: true }));
        });
    }
    load();
    const interval = setInterval(load, 60000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return state;
}

/* ---------- Calculator ---------- */
function CalcTab({ archive, setArchive }) {
  const [amount, setAmount] = useState("");
  const [buy, setBuy] = useState("");
  const [sell, setSell] = useState("");
  const { localLow, localHigh, error: rateFailed } = useRate();
  const average = localLow != null && localHigh != null ? (localLow + localHigh) / 2 : null;

  // Auto-pilot pricing: prefill the buy price from the live average once it
  // loads, but never overwrite a value the operator has already entered.
  useEffect(() => {
    if (average != null && buy === "") setBuy(average.toFixed(1));
  }, [average]);

  const amt = Number(amount) || 0;
  const b = Number(buy) || 0;
  const s = Number(sell) || 0;
  const units = b > 0 ? amt / b : 0;
  const result = units * s - amt;

  function commit() {
    if (!amt || !b || !s) return;
    setArchive((prev) => [{ id: uid(), amount: amt, buy: b, sell: s, result, time: new Date().toLocaleString("ru-RU") }, ...prev]);
    setAmount(""); setBuy(""); setSell("");
  }

  return (
    <div className="px-5 pt-6">
      <SectionHead icon={Calculator}>Вычислительный модуль</SectionHead>

      <Panel className="mb-5" tone="gold">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full cmd-pulse" style={{ background: C.mint, boxShadow: `0 0 6px ${C.mint}` }} />
            <span className="cmd-display text-[10.5px] font-semibold tracking-[0.18em] uppercase" style={{ color: C.faint }}>
              Валютка Мах
            </span>
          </div>
          {localLow != null && localHigh != null ? (
            <span className="cmd-mono font-bold text-lg" style={{ color: C.gold }}>
              {localLow.toFixed(1)}–{localHigh.toFixed(1)} ₽
            </span>
          ) : (
            <span className="cmd-mono text-[12px]" style={{ color: rateFailed ? C.coral : C.faint }}>
              {rateFailed ? "недоступен" : "загрузка…"}
            </span>
          )}
        </div>
      </Panel>

      <Field label="Исходный объём (₽)">
        <TextInput value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="0" />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Покупка">
          <TextInput value={buy} onChange={(e) => setBuy(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="0.0" />
        </Field>
        <Field label="Продажа">
          <TextInput value={sell} onChange={(e) => setSell(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="0.0" />
        </Field>
      </div>

      <Panel className="mt-2 mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="cmd-display text-[11px] font-semibold tracking-[0.14em] uppercase" style={{ color: C.faint }}>Результат операции</span>
          <span className="cmd-mono font-bold text-xl" style={{ color: result >= 0 ? C.mint : C.coral }}>{fmt(result)} ₽</span>
        </div>
        <div className="flex items-center justify-between pt-4" style={{ borderTop: `1px solid ${C.border}` }}>
          <span className="cmd-display text-[11px] font-semibold tracking-[0.14em] uppercase" style={{ color: C.faint }}>Прогнозируемая прибыль</span>
          <span className="cmd-mono font-bold text-xl" style={{ color: result >= 0 ? C.mint : C.coral }}>{fmt(result)} ₽</span>
        </div>
      </Panel>

      <button
        onClick={commit}
        disabled={!amt || !b || !s}
        className="cmd-display w-full py-4 rounded-xl font-semibold tracking-[0.14em] uppercase text-white mb-10 disabled:opacity-30 transition active:scale-[0.98]"
        style={{ background: `linear-gradient(135deg, ${C.redSoft}, ${C.red})`, boxShadow: `0 10px 24px -10px ${C.red}88` }}
      >
        Зафиксировать в архив
      </button>

      <SectionHead
        right={
          archive.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm("Очистить весь архив расчётов? Это необратимо.")) setArchive([]);
              }}
              className="flex items-center gap-1 text-[11.5px] uppercase tracking-wide"
              style={{ color: C.coral }}
            >
              <Trash2 size={12.5} /> Очистить
            </button>
          )
        }
      >
        Архив расчётов
      </SectionHead>
      {archive.length === 0 ? (
        <div className="cmd-display text-[11px] tracking-[0.2em] uppercase text-center py-10" style={{ color: C.faint }}>Архив пуст</div>
      ) : (
        <div className="space-y-2 pb-10">
          {archive.map((a) => (
            <Panel key={a.id} className="flex items-center justify-between !p-3.5">
              <div>
                <div className="cmd-mono text-[13px] text-white">{fmt(a.amount)} ₽ · {a.buy} → {a.sell}</div>
                <div className="cmd-mono text-[10.5px] mt-0.5" style={{ color: C.faint }}>{a.time}</div>
              </div>
              <div className="cmd-mono font-semibold" style={{ color: a.result >= 0 ? C.mint : C.coral }}>
                {a.result >= 0 ? "+" : ""}{fmt(a.result)} ₽
              </div>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Summary ---------- */
function csvCell(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function exportCSV(subjects, transactions) {
  const rows = [];
  rows.push(["Субъекты"]);
  rows.push(["Имя", "Телефон", "Банк", "Баланс", "Карта", "Статус"]);
  subjects.forEach((s) => {
    if (s.accounts.length === 0) {
      rows.push([s.name, s.phone || "", "", "", "", ""]);
    } else {
      s.accounts.forEach((a) => rows.push([s.name, s.phone || "", a.bank, a.balance, a.cardId, a.status]));
    }
  });
  rows.push([]);
  rows.push(["Транзакции"]);
  rows.push(["Дата", "Описание", "Сумма"]);
  transactions.forEach((t) => rows.push([t.time, t.label, t.delta]));

  const csv = rows.map((r) => r.map(csvCell).join(";")).join("\r\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `finance-export-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function Summary({ subjects, transactions }) {
  const totalCapital = subjects.reduce((s, sub) => s + sub.accounts.reduce((a, acc) => a + acc.balance, 0), 0);
  const accountCount = subjects.reduce((s, sub) => s + sub.accounts.length, 0);
  const turnover = transactions.reduce((s, t) => s + Math.abs(t.delta), 0);
  const profit = transactions.reduce((s, t) => s + t.delta, 0);

  return (
    <div className="px-5 pt-6">
      <SectionHead
        icon={BarChart3}
        right={
          <button
            onClick={() => exportCSV(subjects, transactions)}
            className="cmd-display flex items-center gap-1 rounded-full text-[10.5px] font-semibold tracking-[0.14em] uppercase px-3.5 py-2"
            style={{ color: C.red, border: `1px solid ${C.red}66` }}
          >
            <Download size={13} /> Экспорт
          </button>
        }
      >
        Аналитический центр
      </SectionHead>

      <div className="cmd-display text-[10.5px] font-semibold tracking-[0.2em] uppercase mb-1" style={{ color: C.faint }}>
        Агрегированный капитал
      </div>
      <div className="flex items-baseline gap-2 mb-7">
        <CountUp value={totalCapital} className="cmd-serif text-[46px] leading-none font-medium text-white" style={{ textShadow: `0 0 34px rgba(201,161,90,0.35)` }} />
        <span className="cmd-serif text-[30px] font-medium" style={{ color: C.gold }}>₽</span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <Stat icon={Users} label="Субъекты" value={subjects.length} />
        <Stat icon={CreditCard} label="Счета" value={accountCount} />
      </div>
      <div className="grid grid-cols-2 gap-3 mb-8">
        <Stat icon={BarChart3} label="Оборот" value={turnover} suffix="₽" />
        <Stat icon={BarChart3} label="Профит" value={profit} suffix="₽" signed />
      </div>

      <SectionHead right={<span className="cmd-mono text-[11px] px-2.5 py-1" style={{ color: C.faint, border: `1px solid ${C.border}` }}>{transactions.length} записей</span>}>
        Журнал транзакций
      </SectionHead>

      {transactions.length === 0 ? (
        <div className="cmd-display text-[11px] tracking-[0.2em] uppercase text-center py-10" style={{ color: C.faint }}>Журнал пуст</div>
      ) : (
        <div className="space-y-2 pb-10">
          {transactions.map((t) => <TxRow key={t.id} t={t} />)}
        </div>
      )}
    </div>
  );
}

/* ---------- Cards (Карты) ---------- */
const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function todayDayIndex() {
  return (new Date().getDay() + 6) % 7; // 0 = Monday ... 6 = Sunday
}

function cardLine(c) {
  return `[${c.bank}] - ${c.holderName}\n•${c.phone}•`;
}

function TodayCards({ cards }) {
  const [copied, setCopied] = useState(false);
  const today = todayDayIndex();
  const todays = cards.filter((c) => (c.days || []).includes(today));

  if (cards.length === 0) return null;

  function copyAll() {
    navigator.clipboard.writeText(todays.map(cardLine).join("\n\n")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  }

  return (
    <div className="mb-8">
      <SectionHead
        icon={CreditCard}
        right={
          todays.length > 0 && (
            <button
              onClick={copyAll}
              className="cmd-display flex items-center gap-1 rounded-full text-[10.5px] font-semibold tracking-[0.14em] uppercase px-3.5 py-2"
              style={{ color: copied ? C.mint : C.red, border: `1px solid ${copied ? "rgba(57,217,171,0.45)" : C.red + "66"}` }}
            >
              <Copy size={13} /> {copied ? "Скопировано" : "Копировать всё"}
            </button>
          )
        }
      >
        Сегодня
      </SectionHead>
      {todays.length === 0 ? (
        <div className="cmd-display text-[11px] tracking-[0.2em] uppercase text-center py-6" style={{ color: C.faint }}>
          На сегодня карт нет
        </div>
      ) : (
        <div className="space-y-2">
          {todays.map((c) => (
            <Panel key={c.id} tone="gold" className="flex items-center justify-between">
              <div>
                <div className="text-white font-semibold text-[15px]">{c.bank}</div>
                <div className="cmd-mono text-[11.5px] mt-0.5" style={{ color: C.faint }}>
                  {c.holderName} · {c.phone}
                </div>
              </div>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}

function CardsTab({ cards, setCards }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [bank, setBank] = useState("");
  const [holderName, setHolderName] = useState("");
  const [phone, setPhone] = useState("");

  function openAdd() {
    setEditingId(null);
    setBank("");
    setHolderName("");
    setPhone("");
    setSheetOpen(true);
  }

  function openEdit(c) {
    setEditingId(c.id);
    setBank(c.bank);
    setHolderName(c.holderName);
    setPhone(c.phone);
    setSheetOpen(true);
  }

  function submit(e) {
    e.preventDefault();
    if (!bank.trim() || !holderName.trim() || !phone.trim()) return;
    if (editingId) {
      setCards((prev) =>
        prev.map((c) =>
          c.id === editingId ? { ...c, bank: bank.trim(), holderName: holderName.trim(), phone: phone.trim() } : c
        )
      );
    } else {
      setCards((prev) => [...prev, { id: uid(), bank: bank.trim(), holderName: holderName.trim(), phone: phone.trim(), days: [] }]);
    }
    setSheetOpen(false);
  }

  function removeCard(id) {
    if (!window.confirm("Удалить эту карту?")) return;
    setCards((prev) => prev.filter((c) => c.id !== id));
  }

  function toggleDay(id, dayIdx) {
    setCards((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const days = c.days || [];
        const has = days.includes(dayIdx);
        return { ...c, days: has ? days.filter((d) => d !== dayIdx) : [...days, dayIdx].sort() };
      })
    );
  }

  return (
    <div className="px-5 pt-7">
      <Eyebrow>Карты</Eyebrow>
      <h1 className="cmd-display text-[26px] font-bold text-white tracking-tight mt-1 mb-6">Реквизиты</h1>

      <TodayCards cards={cards} />

      <SectionHead
        icon={CreditCard}
        right={
          <button
            onClick={openAdd}
            className="cmd-display flex items-center gap-1 rounded-full text-[10.5px] font-semibold tracking-[0.14em] uppercase px-3.5 py-2"
            style={{ color: C.red, border: `1px solid ${C.red}66` }}
          >
            <Plus size={13} /> Добавить
          </button>
        }
      >
        Управление картами
      </SectionHead>

      {cards.length === 0 ? (
        <div className="cmd-display text-[11px] tracking-[0.2em] uppercase text-center py-10" style={{ color: C.faint }}>
          Карт пока нет
        </div>
      ) : (
        <div className="space-y-2 mb-8">
          {cards.map((c) => (
            <Panel key={c.id} className="flex items-center justify-between">
              <div>
                <div className="text-white font-semibold text-[15px]">{c.bank}</div>
                <div className="cmd-mono text-[11.5px] mt-0.5" style={{ color: C.faint }}>
                  {c.holderName} · {c.phone}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => openEdit(c)} style={{ color: C.faint }}>
                  <Pencil size={16} />
                </button>
                <button onClick={() => removeCard(c.id)} style={{ color: C.coral }}>
                  <Trash2 size={16} />
                </button>
              </div>
            </Panel>
          ))}
        </div>
      )}

      {cards.length > 0 && (
        <>
          <SectionHead icon={Calendar}>Расписание по дням</SectionHead>
          <div className="space-y-3 pb-10">
            {cards.map((c) => (
              <Panel key={c.id}>
                <div className="text-white font-semibold text-[14px] mb-3">
                  {c.bank} · {c.holderName}
                </div>
                <div className="grid grid-cols-7 gap-1.5">
                  {WEEKDAYS.map((label, idx) => {
                    const active = (c.days || []).includes(idx);
                    return (
                      <button
                        key={idx}
                        onClick={() => toggleDay(c.id, idx)}
                        className="cmd-display flex flex-col items-center justify-center rounded-lg py-2.5 text-[10.5px] font-semibold tracking-wide uppercase transition"
                        style={{
                          background: active ? `linear-gradient(135deg, ${C.redSoft}, ${C.red})` : "rgba(255,255,255,0.04)",
                          color: active ? "#fff" : C.faint,
                          border: `1px solid ${active ? C.red : C.border}`,
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </Panel>
            ))}
          </div>
        </>
      )}

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title={editingId ? "Редактировать карту" : "Новая карта"}>
        <form onSubmit={submit}>
          <Field label="Банк">
            <TextInput value={bank} onChange={(e) => setBank(e.target.value)} placeholder="Сбербанк" />
          </Field>
          <Field label="Имя держателя">
            <TextInput value={holderName} onChange={(e) => setHolderName(e.target.value)} placeholder="Иванов Иван" />
          </Field>
          <Field label="Телефон">
            <TextInput value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7 999 000-11-22" />
          </Field>
          <button
            type="submit"
            className="cmd-display w-full py-4 rounded-xl font-semibold tracking-[0.14em] uppercase text-white transition active:scale-[0.98]"
            style={{ background: `linear-gradient(135deg, ${C.redSoft}, ${C.red})`, boxShadow: `0 10px 24px -10px ${C.red}88` }}
          >
            {editingId ? "Сохранить" : "Добавить карту"}
          </button>
        </form>
      </Sheet>
    </div>
  );
}

/* ---------- App shell ---------- */
export default function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("overview");
  const [subjects, setSubjects] = useState([]);
  const [archive, setArchive] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [cards, setCards] = useState([]);
  const [search, setSearch] = useState("");
  const [openSubject, setOpenSubject] = useState(null);
  const [loginError, setLoginError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [transitionPhase, setTransitionPhase] = useState(null); // null | "launch" | "fadeout"
  const [checkingSession, setCheckingSession] = useState(true);
  const loadedRef = useRef(false);
  const saveTimer = useRef(null);

  function addTransaction({ label, delta }) {
    setTransactions((prev) => [{ id: uid(), label, delta, time: new Date().toLocaleString("ru-RU") }, ...prev]);
  }

  // Resume an existing session (same device, valid token) without asking to log in again.
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setCheckingSession(false);
      return;
    }
    fetchState()
      .then((state) => {
        loadedRef.current = false;
        setSubjects(state.subjects || []);
        setArchive(state.archive || []);
        setTransactions(state.transactions || []);
        setCards(state.cards || []);
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUser(payload.login);
        loadedRef.current = true;
      })
      .catch(() => {
        clearToken();
      })
      .finally(() => setCheckingSession(false));
  }, []);

  async function handleLogin(loginValue, password) {
    setBusy(true);
    setLoginError("");
    setNotice("");
    try {
      const { token, login: confirmedLogin } = await apiLogin(loginValue, password);
      setToken(token);
      const state = await fetchState();

      // Launch: car + smoke play, form fades out, smog builds toward ~0.97.
      setTransitionPhase("launch");

      // Swap the actual screen content while the smog is at/near peak opacity,
      // so the unmount/mount happens invisibly underneath it.
      setTimeout(() => {
        loadedRef.current = false;
        setSubjects(state.subjects || []);
        setArchive(state.archive || []);
        setTransactions(state.transactions || []);
        setCards(state.cards || []);
        setUser(confirmedLogin);
        loadedRef.current = true;
        setBusy(false);
      }, 1300);

      // Brief hold at peak smog after the swap, then start clearing it.
      setTimeout(() => setTransitionPhase("fadeout"), 1600);

      // Fade-out animation (1s) has finished — drop the overlay entirely.
      setTimeout(() => setTransitionPhase(null), 2600);
    } catch (err) {
      setLoginError(err.message || "Не удалось войти");
      setBusy(false);
    }
  }

  function handleLogout() {
    loadedRef.current = false;
    clearToken();
    setUser(null); setSubjects([]); setArchive([]); setTransactions([]); setCards([]); setTab("overview"); setNotice("");
  }

  // Debounced autosave of the whole account state to this login's isolated database on the server.
  useEffect(() => {
    if (!user || !loadedRef.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await saveState({ subjects, archive, transactions, cards });
      } catch {
        setNotice("Не удалось сохранить изменения — сервер недоступен.");
      }
    }, 500);
    return () => clearTimeout(saveTimer.current);
  }, [subjects, archive, transactions, cards, user]);

  const NAV = [
    { id: "overview", label: "Обзор", icon: LayoutGrid },
    { id: "people", label: "Люди", icon: Users },
    { id: "cards", label: "Карты", icon: CreditCard },
    { id: "calc", label: "Расчёт", icon: Calculator },
    { id: "summary", label: "Итоги", icon: BarChart3 },
  ];

  // Rendered once, as a sibling of whichever screen is active below — kept out
  // of the checkingSession/!user/main-app branches so React never unmounts
  // and remounts it (and resets its CSS animations) at the exact moment the
  // screen swap happens underneath it.
  const transitionOverlay = transitionPhase && <LoginTransition phase={transitionPhase} />;

  if (checkingSession) {
    return (
      <>
        {transitionOverlay}
        <div className="cmd-root w-full h-full relative flex items-center justify-center">
          {FONTS}
          <AuroraBackground />
          <Loader2 size={22} className="animate-spin relative z-10" color={C.red} />
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        {transitionOverlay}
        <div className="cmd-root w-full h-full relative">
          {FONTS}
          <AuroraBackground />
          <div className="relative z-10">
            <Login onLogin={handleLogin} error={loginError} busy={busy} transitioning={transitionPhase === "launch"} />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {transitionOverlay}
      <div className="cmd-root w-full h-full flex flex-col relative">
      {FONTS}
      <AuroraBackground />

      <div className="glass-strong relative z-10 flex items-center justify-between px-5 pt-6 pb-4" style={{ borderBottom: `1px solid ${C.border}` }}>
        <div className="flex items-center gap-2">
          <Radio size={12} color={C.mint} className="cmd-pulse" />
          <span className="cmd-display text-white font-semibold text-[14px] tracking-wide">{user}</span>
        </div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none select-none">
          <div className="yamakassi-word">Yamakassi</div>
          <div className="yamakassi-sub">CASH</div>
        </div>
        <button
          onClick={handleLogout}
          className="cmd-display flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[10.5px] font-semibold tracking-[0.14em] uppercase"
          style={{ color: C.dim, border: `1px solid ${C.border}` }}
        >
          <LogOut size={12.5} /> Выйти
        </button>
      </div>

      {notice && (
        <div className="relative z-10 px-5 py-2.5 cmd-mono text-[12px]" style={{ background: "rgba(255,176,32,0.12)", color: C.amber, borderBottom: `1px solid rgba(255,176,32,0.25)` }}>
          {notice}
        </div>
      )}

      <div className="relative z-10 flex-1 overflow-y-auto pb-28">
        {tab === "overview" && (
          <Overview
            subjects={subjects}
            transactions={transactions}
            search={search}
            onSearch={setSearch}
            onOpenSubject={(id) => { setOpenSubject(id); setTab("people"); }}
            cards={cards}
          />
        )}
        {tab === "people" && (
          <People
            subjects={subjects}
            setSubjects={setSubjects}
            addTransaction={addTransaction}
            openSubject={openSubject}
            setOpenSubject={setOpenSubject}
          />
        )}
        {tab === "cards" && <CardsTab cards={cards} setCards={setCards} />}
        {tab === "calc" && <CalcTab archive={archive} setArchive={setArchive} />}
        {tab === "summary" && <Summary subjects={subjects} transactions={transactions} />}
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-3 pb-3 z-10">
        <div
          className="glass-strong grid grid-cols-5 rounded-2xl overflow-hidden"
          style={{ border: `1px solid ${C.border}` }}
        >
          {NAV.map((n) => {
            const Icon = n.icon;
            const isActive = tab === n.id;
            return (
              <button key={n.id} onClick={() => setTab(n.id)} className="flex flex-col items-center justify-center gap-1.5 py-3 relative">
                {isActive && (
                  <span className="absolute top-1.5 w-1 h-1 rounded-full" style={{ background: C.red, boxShadow: `0 0 6px ${C.red}` }} />
                )}
                <Icon size={19} color={isActive ? C.red : C.faint} strokeWidth={2.25} />
                <span className="cmd-display text-[9.5px] font-semibold tracking-[0.1em] uppercase" style={{ color: isActive ? C.red : C.faint }}>
                  {n.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      </div>
    </>
  );
}
