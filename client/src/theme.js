/* ============================================================
   DESIGN TOKENS — v7 "Yamakassi Sapphire"
   Cool-toned repaint: deep near-black navy surfaces, a sapphire
   blue as the primary brand/interactive accent (borders, buttons,
   active states — kept under the `red`/`redSoft`/`redDim` keys for
   historical reasons, values only), an icy platinum reserved for
   money figures (₽ values, under the `gold` keys), mint/coral kept
   for financial gain/loss.
   ============================================================ */

export const C = {
  bg: "#060a12",
  surfaceGlass: "rgba(10,16,26,0.44)",
  surfaceGlassStrong: "rgba(7,11,18,0.62)",
  border: "rgba(255,255,255,0.09)",
  borderStrong: "rgba(255,255,255,0.20)",
  red: "#3f7fe0",
  redSoft: "#7aa8f0",
  redDim: "rgba(63,127,224,0.16)",
  gold: "#dce6f5",
  goldSoft: "#eef3fb",
  goldDim: "rgba(220,230,245,0.14)",
  chrome: "#8fa0b8",
  mint: "#39d9ab",
  mintDim: "rgba(57,217,171,0.14)",
  coral: "#ff7a6b",
  coralDim: "rgba(255,122,107,0.14)",
  amber: "#ffb020",
  text: "#eef1f6",
  dim: "rgba(238,241,246,0.58)",
  faint: "rgba(238,241,246,0.34)",
};

export const STATUSES = ["РАБОЧИЙ", "ПРОВЕРКА", "БЛОКИРОВКА", "НЕАКТИВЕН"];
export const STATUS_COLOR = { РАБОЧИЙ: C.mint, ПРОВЕРКА: C.amber, БЛОКИРОВКА: C.coral, НЕАКТИВЕН: C.faint };
