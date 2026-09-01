/* ============================================================
   DESIGN TOKENS — v8 "Yamakassi Amethyst"
   Quieter, more matte redesign: near-black surfaces with a violet
   undertone, a rich amethyst as the primary brand/interactive
   accent (borders, buttons, active states — kept under the
   `red`/`redSoft`/`redDim` keys for historical reasons, values
   only), a soft lavender-ivory reserved for money figures (₽
   values, under the `gold` keys), mint/coral kept for financial
   gain/loss.
   ============================================================ */

export const C = {
  bg: "#0a0710",
  surfaceGlass: "rgba(21,15,30,0.5)",
  surfaceGlassStrong: "rgba(15,11,22,0.68)",
  border: "rgba(255,255,255,0.09)",
  borderStrong: "rgba(255,255,255,0.20)",
  red: "#8a63e8",
  redSoft: "#b39cf5",
  redDim: "rgba(138,99,232,0.16)",
  gold: "#e9e2f7",
  goldSoft: "#f5f0fc",
  goldDim: "rgba(233,226,247,0.14)",
  chrome: "#a79bc4",
  mint: "#39d9ab",
  mintDim: "rgba(57,217,171,0.14)",
  coral: "#ff7a6b",
  coralDim: "rgba(255,122,107,0.14)",
  amber: "#ffb020",
  text: "#f4f1f8",
  dim: "rgba(244,241,248,0.58)",
  faint: "rgba(244,241,248,0.34)",
};

export const STATUSES = ["РАБОЧИЙ", "ПРОВЕРКА", "БЛОКИРОВКА", "НЕАКТИВЕН"];
export const STATUS_COLOR = { РАБОЧИЙ: C.mint, ПРОВЕРКА: C.amber, БЛОКИРОВКА: C.coral, НЕАКТИВЕН: C.faint };
