/* ============================================================
   DESIGN TOKENS — v9 "Yamakassi Copper"
   Full redesign away from the car-hero imagery: espresso-black
   surfaces, a warm terracotta/copper as the primary brand and
   interactive accent (borders, buttons, active states — kept under
   the `red`/`redSoft`/`redDim` keys for historical reasons, values
   only), an ivory-cream reserved for money figures (₽ values, under
   the `gold` keys), mint/coral kept for financial gain/loss. The
   login hero is now a drawn medallion emblem instead of a photo, so
   these tokens also drive its stroke/fill colors directly.
   ============================================================ */

export const C = {
  bg: "#0b0806",
  surfaceGlass: "rgba(24,17,12,0.5)",
  surfaceGlassStrong: "rgba(17,12,9,0.68)",
  border: "rgba(255,255,255,0.09)",
  borderStrong: "rgba(255,255,255,0.20)",
  red: "#c8622e",
  redSoft: "#e08f5c",
  redDim: "rgba(200,98,46,0.16)",
  gold: "#f2e8d8",
  goldSoft: "#faf5ec",
  goldDim: "rgba(242,232,216,0.14)",
  chrome: "#a89684",
  mint: "#39d9ab",
  mintDim: "rgba(57,217,171,0.14)",
  coral: "#ff7a6b",
  coralDim: "rgba(255,122,107,0.14)",
  amber: "#ffb020",
  text: "#f7f2ea",
  dim: "rgba(247,242,234,0.58)",
  faint: "rgba(247,242,234,0.34)",
};

export const STATUSES = ["РАБОЧИЙ", "ПРОВЕРКА", "БЛОКИРОВКА", "НЕАКТИВЕН"];
export const STATUS_COLOR = { РАБОЧИЙ: C.mint, ПРОВЕРКА: C.amber, БЛОКИРОВКА: C.coral, НЕАКТИВЕН: C.faint };
