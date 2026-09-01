/* ============================================================
   DESIGN TOKENS — v6 "Yamakassi Noir & Gold"
   Boutique exchange-house repaint to match the Yamakassi Cash
   wordmark: warm near-black surfaces, a rich gold as the primary
   brand/interactive accent (borders, buttons, active states — kept
   under the `red`/`redSoft`/`redDim` keys for historical reasons,
   values only), a champagne-platinum reserved for money figures
   (₽ values, under the `gold` keys), mint/coral kept for financial
   gain/loss.
   ============================================================ */

export const C = {
  bg: "#0a0806",
  surfaceGlass: "rgba(18,15,11,0.44)",
  surfaceGlassStrong: "rgba(13,11,8,0.62)",
  border: "rgba(255,255,255,0.09)",
  borderStrong: "rgba(255,255,255,0.20)",
  red: "#c9a24b",
  redSoft: "#e8c878",
  redDim: "rgba(201,162,75,0.16)",
  gold: "#d9cdb0",
  goldSoft: "#efe6d0",
  goldDim: "rgba(217,205,176,0.14)",
  chrome: "#b8b2a0",
  mint: "#39d9ab",
  mintDim: "rgba(57,217,171,0.14)",
  coral: "#ff7a6b",
  coralDim: "rgba(255,122,107,0.14)",
  amber: "#ffb020",
  text: "#f6f4ee",
  dim: "rgba(246,244,238,0.58)",
  faint: "rgba(246,244,238,0.34)",
};

export const STATUSES = ["РАБОЧИЙ", "ПРОВЕРКА", "БЛОКИРОВКА", "НЕАКТИВЕН"];
export const STATUS_COLOR = { РАБОЧИЙ: C.mint, ПРОВЕРКА: C.amber, БЛОКИРОВКА: C.coral, НЕАКТИВЕН: C.faint };
