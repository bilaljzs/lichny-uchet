import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  LayoutGrid, Users, Calculator, BarChart3, Plus, LogOut, CreditCard,
  ChevronRight, X, Pencil, Trash2, Search, Eye, EyeOff, Loader2, Radio,
} from "lucide-react";
import { login as apiLogin, fetchState, saveState, fetchRate, getToken, setToken, clearToken } from "./api";

/* ============================================================
   DESIGN TOKENS — v5 "Scuderia"
   Elite/racing repaint: near-black carbon surfaces, Ferrari red as
   the primary brand/interactive accent (borders, buttons, active
   states), gold reserved specifically for money figures (₽ values),
   mint/coral kept for financial gain/loss. The aurora glow behind
   the glass panels is recolored to red/crimson/chrome, and the
   login screen carries an animated hero shot of the car.
   ============================================================ */

const C = {
  bg: "#0a0504",
  surfaceGlass: "rgba(22,12,11,0.44)",
  surfaceGlassStrong: "rgba(16,9,8,0.62)",
  border: "rgba(255,255,255,0.09)",
  borderStrong: "rgba(255,255,255,0.20)",
  red: "#ff2436",
  redSoft: "#ff5c52",
  redDim: "rgba(255,36,54,0.16)",
  gold: "#e6b869",
  goldSoft: "#f3d29a",
  goldDim: "rgba(230,184,105,0.14)",
  chrome: "#d8d9dd",
  mint: "#39d9ab",
  mintDim: "rgba(57,217,171,0.14)",
  coral: "#ff7a6b",
  coralDim: "rgba(255,122,107,0.14)",
  amber: "#ffb020",
  text: "#f6f4ee",
  dim: "rgba(246,244,238,0.58)",
  faint: "rgba(246,244,238,0.34)",
};

const FONTS = (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;0,600;1,500&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');
    .cmd-root { font-family: 'Inter', system-ui, sans-serif; background: ${C.bg}; }
    .cmd-display { font-family: 'Space Grotesk', system-ui, sans-serif; }
    .cmd-mono { font-family: 'JetBrains Mono', ui-monospace, monospace; font-variant-numeric: tabular-nums; }
    .cmd-serif { font-family: 'Fraunces', Georgia, serif; font-style: italic; font-variant-numeric: tabular-nums; letter-spacing: -0.01em; }

    .aurora-wrap { position: fixed; inset: 0; overflow: hidden; z-index: 0; animation: hue-drift 50s linear infinite; }
    .aurora-blob { position: absolute; border-radius: 9999px; filter: blur(50px); opacity: 0.85; mix-blend-mode: screen; will-change: transform; }
    .aurora-a { width: 68vw; height: 68vw; background: radial-gradient(circle, ${C.red}, transparent 68%); top: -18vw; left: -14vw; animation: drift-a 16s ease-in-out infinite; opacity: 0.55; }
    .aurora-b { width: 62vw; height: 62vw; background: radial-gradient(circle, #7a0d14, transparent 68%); bottom: -20vw; right: -16vw; animation: drift-b 19s ease-in-out infinite; }
    .aurora-c { width: 52vw; height: 52vw; background: radial-gradient(circle, ${C.chrome}, transparent 68%); top: 28vh; right: -12vw; animation: drift-c 14s ease-in-out infinite; opacity: 0.14; }
    .aurora-d { width: 34vw; height: 34vw; background: radial-gradient(circle, ${C.goldSoft}, transparent 72%); top: 8vh; left: 20vw; opacity: 0.12; animation: drift-d 11s ease-in-out infinite; }
    @keyframes drift-a { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(16vw,18vh) scale(1.22); } }
    @keyframes drift-b { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-15vw,-14vh) scale(1.18); } }
    @keyframes drift-c { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-14vw,16vh) scale(0.86); } }
    @keyframes drift-d { 0%,100% { transform: translate(0,0); } 50% { transform: translate(10vw,12vh); } }
    @keyframes hue-drift { 0% { filter: hue-rotate(0deg); } 50% { filter: hue-rotate(10deg); } 100% { filter: hue-rotate(0deg); } }
    @media (prefers-reduced-motion: reduce) { .aurora-blob, .aurora-wrap { animation: none !important; } }

    .glass { background: ${C.surfaceGlass}; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
    .glass-strong { background: ${C.surfaceGlassStrong}; backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); }

    @keyframes cmd-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }
    .cmd-pulse { animation: cmd-pulse 2s ease-in-out infinite; }
    input::placeholder, textarea::placeholder { color: rgba(246,244,238,0.28); }
    .cmd-fade-in { animation: cmd-fade-in 0.3s cubic-bezier(0.16,1,0.3,1) both; }
    @keyframes cmd-fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

    .ferrari-hero { position: relative; width: 100%; max-width: 340px; margin: 0 auto; }
    .ferrari-glow { position: absolute; inset: -20% -10% auto -10%; height: 140%; border-radius: 9999px; background: radial-gradient(ellipse at center, rgba(255,36,54,0.55), rgba(255,36,54,0.08) 55%, transparent 75%); filter: blur(18px); animation: ferrari-glow-pulse 3.2s ease-in-out infinite; }
    @keyframes ferrari-glow-pulse { 0%,100% { opacity: 0.7; transform: scale(1); } 50% { opacity: 1; transform: scale(1.08); } }
    .ferrari-img-wrap { position: relative; overflow: hidden; animation: ferrari-float 5s ease-in-out infinite; }
    @keyframes ferrari-float { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-6px) rotate(-0.6deg); } }
    .ferrari-shine { position: absolute; top: 0; left: -60%; width: 40%; height: 100%; background: linear-gradient(115deg, transparent, rgba(255,255,255,0.55), transparent); transform: skewX(-18deg); animation: ferrari-shine-sweep 3.6s ease-in-out infinite; animation-delay: 1s; mix-blend-mode: overlay; }
    @keyframes ferrari-shine-sweep { 0% { left: -60%; } 35%,100% { left: 130%; } }
    @media (prefers-reduced-motion: reduce) { .ferrari-glow, .ferrari-img-wrap, .ferrari-shine { animation: none !important; } }

    .login-form-exit { animation: form-exit 0.4s ease forwards; }
    @keyframes form-exit { to { opacity: 0; transform: scale(0.92); } }

    .login-transition-overlay { position: fixed; inset: 0; z-index: 60; overflow: hidden; pointer-events: none; }
    .drive-car { position: absolute; top: 52%; left: 0; width: 42vw; max-width: 240px; transform: translate(-20vw, -50%); animation: drive-across 1.3s cubic-bezier(0.4, 0, 0.2, 1) forwards; filter: drop-shadow(0 8px 18px rgba(0,0,0,0.55)); }
    @keyframes drive-across { from { transform: translate(-20vw, -50%); } to { transform: translate(120vw, -50%); } }

    .smoke-puff { position: absolute; top: 52%; width: 15vw; max-width: 70px; height: 15vw; max-height: 70px; border-radius: 9999px; background: radial-gradient(circle, rgba(190,190,190,0.6), rgba(190,190,190,0.15) 60%, transparent 75%); filter: blur(6px); opacity: 0; animation: smoke-out 1s ease-out forwards; }
    @keyframes smoke-out { 0% { opacity: 0.85; transform: translate(0, -50%) scale(1); } 100% { opacity: 0; transform: translate(-10%, -130%) scale(2.5); } }
    .smoke-1 { left: -18vw; animation-delay: 0.05s; }
    .smoke-2 { left: -8vw; animation-delay: 0.2s; }
    .smoke-3 { left: 4vw; animation-delay: 0.35s; }
    .smoke-4 { left: 18vw; animation-delay: 0.5s; }
    .smoke-5 { left: 34vw; animation-delay: 0.65s; }
    .smoke-6 { left: 52vw; animation-delay: 0.8s; }
    @media (prefers-reduced-motion: reduce) { .drive-car, .smoke-puff, .login-form-exit { animation: none !important; opacity: 0; } }
  `}</style>
);

function DriveCarSVG({ className }) {
  return (
    <svg viewBox="0 0 200 70" className={className} xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="42" cy="54" rx="15" ry="15" fill="#141414" />
      <ellipse cx="42" cy="54" rx="6" ry="6" fill="#3a3a3a" />
      <ellipse cx="158" cy="54" rx="15" ry="15" fill="#141414" />
      <ellipse cx="158" cy="54" rx="6" ry="6" fill="#3a3a3a" />
      <path d="M8 46 Q16 20 55 18 L128 18 Q152 20 175 34 L190 40 L190 48 L10 48 Z" fill="#ff2436" />
      <path d="M65 19 L108 19 L102 33 L72 33 Z" fill="#14100f" />
      <path d="M8 46 L190 46 L190 50 L8 50 Z" fill="#c0121f" />
      <rect x="182" y="24" width="6" height="18" rx="1.5" fill="#14100f" />
      <rect x="172" y="20" width="20" height="4.5" rx="1.5" fill="#14100f" />
      <circle cx="50" cy="30" r="4" fill="#f3d29a" />
    </svg>
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
        <div className="ferrari-hero mb-6">
          <div className="ferrari-glow" />
          <div className="ferrari-img-wrap">
            <img src="/ferrari.png" alt="" className="relative w-full select-none pointer-events-none" draggable="false" />
            <div className="ferrari-shine" />
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

      {transitioning && (
        <div className="login-transition-overlay">
          <div className="smoke-puff smoke-1" />
          <div className="smoke-puff smoke-2" />
          <div className="smoke-puff smoke-3" />
          <div className="smoke-puff smoke-4" />
          <div className="smoke-puff smoke-5" />
          <div className="smoke-puff smoke-6" />
          <DriveCarSVG className="drive-car" />
        </div>
      )}
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

const STATUSES = ["РАБОЧИЙ", "ПРОВЕРКА", "БЛОКИРОВКА", "НЕАКТИВЕН"];
const STATUS_COLOR = { РАБОЧИЙ: C.mint, ПРОВЕРКА: C.amber, БЛОКИРОВКА: C.coral, НЕАКТИВЕН: C.faint };

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
function Overview({ subjects, transactions, onSearch, search }) {
  const totalCapital = subjects.reduce((s, sub) => s + sub.accounts.reduce((a, acc) => a + acc.balance, 0), 0);
  const accountCount = subjects.reduce((s, sub) => s + sub.accounts.length, 0);
  const { localLow, localHigh, error: rateFailed } = useRate();

  return (
    <div className="px-5 pt-7">
      <div className="flex items-start justify-between mb-6">
        <Eyebrow>Текущий статус</Eyebrow>
        <div className="text-right">
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

      {transactions.length > 0 && (
        <div>
          <SectionHead>Журнал транзакций</SectionHead>
          <div className="space-y-2 pb-4">
            {transactions.slice(0, 8).map((t) => (
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
function People({ subjects, setSubjects, addTransaction }) {
  const [addOpen, setAddOpen] = useState(false);
  const [openSubject, setOpenSubject] = useState(null);
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
    setSubjects((prev) => prev.map((s) => (s.id === subject.id ? { ...s, accounts: s.accounts.filter((a) => a.id !== id) } : s)));
  }

  const capital = subject.accounts.reduce((a, acc) => a + acc.balance, 0);

  return createPortal(
    <div className="fixed inset-0 z-40 overflow-y-auto" style={{ background: "rgba(9,5,4,0.9)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}>
      <div className="flex items-center px-5 pt-6 pb-4" style={{ borderBottom: `1px solid ${C.border}` }}>
        <button onClick={onClose} className="cmd-display text-[13px] font-medium" style={{ color: C.dim }}>← Назад</button>
      </div>

      <div className="px-5 pt-6">
        <h2 className="cmd-display text-[30px] font-bold text-white mb-1.5">{subject.name}</h2>
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

      <SectionHead>Архив расчётов</SectionHead>
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
function Summary({ subjects, transactions }) {
  const totalCapital = subjects.reduce((s, sub) => s + sub.accounts.reduce((a, acc) => a + acc.balance, 0), 0);
  const accountCount = subjects.reduce((s, sub) => s + sub.accounts.length, 0);
  const turnover = transactions.reduce((s, t) => s + Math.abs(t.delta), 0);
  const profit = transactions.reduce((s, t) => s + t.delta, 0);

  return (
    <div className="px-5 pt-6">
      <SectionHead icon={BarChart3}>Аналитический центр</SectionHead>

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

/* ---------- App shell ---------- */
export default function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("overview");
  const [subjects, setSubjects] = useState([]);
  const [archive, setArchive] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [loginError, setLoginError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
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

      // Play the drive-off transition before switching to the main screen —
      // duration must match the .drive-car animation length in FONTS above.
      setTransitioning(true);
      setTimeout(() => {
        loadedRef.current = false;
        setSubjects(state.subjects || []);
        setArchive(state.archive || []);
        setTransactions(state.transactions || []);
        setUser(confirmedLogin);
        loadedRef.current = true;
        setTransitioning(false);
        setBusy(false);
      }, 1300);
    } catch (err) {
      setLoginError(err.message || "Не удалось войти");
      setBusy(false);
    }
  }

  function handleLogout() {
    loadedRef.current = false;
    clearToken();
    setUser(null); setSubjects([]); setArchive([]); setTransactions([]); setTab("overview"); setNotice("");
  }

  // Debounced autosave of the whole account state to this login's isolated database on the server.
  useEffect(() => {
    if (!user || !loadedRef.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await saveState({ subjects, archive, transactions });
      } catch {
        setNotice("Не удалось сохранить изменения — сервер недоступен.");
      }
    }, 500);
    return () => clearTimeout(saveTimer.current);
  }, [subjects, archive, transactions, user]);

  if (checkingSession) {
    return (
      <div className="cmd-root w-full h-full relative flex items-center justify-center">
        {FONTS}
        <AuroraBackground />
        <Loader2 size={22} className="animate-spin relative z-10" color={C.red} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="cmd-root w-full h-full relative">
        {FONTS}
        <AuroraBackground />
        <div className="relative z-10">
          <Login onLogin={handleLogin} error={loginError} busy={busy} transitioning={transitioning} />
        </div>
      </div>
    );
  }

  const NAV = [
    { id: "overview", label: "Обзор", icon: LayoutGrid },
    { id: "people", label: "Люди", icon: Users },
    { id: "calc", label: "Расчёт", icon: Calculator },
    { id: "summary", label: "Итоги", icon: BarChart3 },
  ];

  return (
    <div className="cmd-root w-full h-full flex flex-col relative">
      {FONTS}
      <AuroraBackground />

      <div className="glass-strong relative z-10 flex items-center justify-between px-5 pt-6 pb-4" style={{ borderBottom: `1px solid ${C.border}` }}>
        <div className="flex items-center gap-2">
          <Radio size={12} color={C.mint} className="cmd-pulse" />
          <span className="cmd-display text-white font-semibold text-[14px] tracking-wide">{user}</span>
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
        {tab === "overview" && <Overview subjects={subjects} transactions={transactions} search={search} onSearch={setSearch} />}
        {tab === "people" && <People subjects={subjects} setSubjects={setSubjects} addTransaction={addTransaction} />}
        {tab === "calc" && <CalcTab archive={archive} setArchive={setArchive} />}
        {tab === "summary" && <Summary subjects={subjects} transactions={transactions} />}
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-3 pb-3 z-10">
        <div
          className="glass-strong grid grid-cols-4 rounded-2xl overflow-hidden"
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
  );
}
