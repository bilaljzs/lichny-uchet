/* ============================================================
   DESIGN TOKENS — v5 "Scuderia"
   Elite/racing repaint: near-black carbon surfaces, Ferrari red as
   the primary brand/interactive accent (borders, buttons, active
   states), gold reserved specifically for money figures (₽ values),
   mint/coral kept for financial gain/loss.
   ============================================================ */

export const C = {
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

export const STATUSES = ["РАБОЧИЙ", "ПРОВЕРКА", "БЛОКИРОВКА", "НЕАКТИВЕН"];
export const STATUS_COLOR = { РАБОЧИЙ: C.mint, ПРОВЕРКА: C.amber, БЛОКИРОВКА: C.coral, НЕАКТИВЕН: C.faint };
