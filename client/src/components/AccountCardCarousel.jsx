import React, { useState, useEffect, useRef } from "react";
import { C, STATUS_COLOR } from "../theme";

/* ============================================================
   AccountCardCarousel — premium interactive 3D "coverflow" carousel
   for a person's real bank accounts (Scuderia design language).

   - Continuous progress value drives a magnetic, circular layout.
   - Cards ease toward a target progress (autoplay drift + click-to-jump),
     never jump-cut.
   - Mouse parallax tilt lags the cursor via inertia damping.
   - Real volumetric thickness: 5 stacked layers per card.
   - Front face = bank + masked number + balance. Back face = magnetic
     stripe + cardholder + status, reached as the card rotates away.
   ============================================================ */

const ACCENTS = [C.red, C.gold, C.mint, C.coral, C.chrome];

function fmtMoney(n) {
  return new Intl.NumberFormat("ru-RU").format(Math.round(n || 0));
}

function maskNumber(cardId) {
  const last4 = (cardId || "0000").padStart(4, "0").slice(-4);
  return `•••• •••• •••• ${last4}`;
}

const STYLE = (
  <style>{`
    @keyframes acc3d-sheen {
      0%   { transform: translateX(-120%) rotate(8deg); }
      100% { transform: translateX(220%) rotate(8deg); }
    }
    .acc3d-sheen {
      position: absolute; top: -40%; left: 0; width: 40%; height: 180%;
      background: linear-gradient(100deg, transparent, rgba(255,255,255,0.16), transparent);
      animation: acc3d-sheen 5.5s ease-in-out infinite;
      pointer-events: none;
    }
    @keyframes acc3d-glow {
      0%, 100% { opacity: 0.55; }
      50% { opacity: 0.9; }
    }
    .acc3d-glow { animation: acc3d-glow 3.6s ease-in-out infinite; }
  `}</style>
);

export default function AccountCardCarousel({ accounts, ownerName }) {
  const cardCount = accounts.length;

  const wrapRef = useRef(null);
  const cardsRefs = useRef([]);
  const frameId = useRef(0);

  const progress = useRef(0);
  const progressTarget = useRef(0);
  const hovering = useRef(false);

  const mouse = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  const [metrics, setMetrics] = useState({ cardW: 240, cardH: 151 });
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const handleMouseMove = (e) => {
      const rect = el.getBoundingClientRect();
      const rx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const ry = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
      mouse.current.targetX = Math.max(-1, Math.min(1, rx));
      mouse.current.targetY = Math.max(-1, Math.min(1, ry));
    };
    const handleMouseLeave = () => {
      mouse.current.targetX = 0;
      mouse.current.targetY = 0;
      hovering.current = false;
    };
    const handleMouseEnter = () => {
      hovering.current = true;
    };

    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseenter", handleMouseEnter);
    el.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseenter", handleMouseEnter);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const measure = () => {
      const w = el.clientWidth;
      let cardW = Math.round(w * 0.4);
      cardW = Math.min(280, Math.max(190, cardW));
      const cardH = Math.round(cardW / 1.5925);
      setMetrics({ cardW, cardH });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const renderLoop = () => {
    const el = wrapRef.current;
    if (!el || cardCount === 0) return;

    if (cardCount > 1 && !hovering.current) {
      progressTarget.current += 0.0026;
    }
    progress.current += (progressTarget.current - progress.current) * 0.06;

    mouse.current.x += (mouse.current.targetX - mouse.current.x) * 0.08;
    mouse.current.y += (mouse.current.targetY - mouse.current.y) * 0.08;

    const cards = cardsRefs.current;
    const w = el.clientWidth;
    const { cardW } = metrics;

    const continuousProgress = progress.current;
    const roundedIndex = Math.round(continuousProgress);
    const diffFromRound = continuousProgress - roundedIndex;
    const easedDiff = Math.sign(diffFromRound) * Math.pow(Math.abs(diffFromRound) * 2, 4.2) / 2;
    const virtualActiveIndex = roundedIndex + easedDiff;

    const liveActive = ((Math.round(continuousProgress) % cardCount) + cardCount) % cardCount;
    if (liveActive !== activeIdx) setActiveIdx(liveActive);

    for (let i = 0; i < cardCount; i++) {
      const card = cards[i];
      if (!card) continue;

      let offset = i - virtualActiveIndex;
      const halfCount = cardCount / 2;
      while (offset > halfCount) offset -= cardCount;
      while (offset < -halfCount) offset += cardCount;

      const absOffset = Math.abs(offset);
      const sign = Math.sign(offset);

      if (absOffset > 3.0) {
        card.style.visibility = "hidden";
        continue;
      }
      card.style.visibility = "visible";

      const gap = 22;
      const peekAmount = -30;
      const D = 1350;

      let x = 0;
      let z = 0;
      let rot = 0;

      if (absOffset <= 1) {
        const t = absOffset;
        const easedT = t * t * (3 - 2 * t);
        const targetX = cardW + gap;
        x = sign * (easedT * targetX);
        z = 260 + easedT * (140 - 260);
        rot = easedT * 132;
      } else if (absOffset <= 2) {
        const t = absOffset - 1;
        const easedT = t * t * (3 - 2 * t);
        const xStart = cardW + gap;
        const zStart = 140;
        const rotStart = 132;
        const zEnd = -60;
        const rotEnd = 175;

        const sEnd = D / (D - zEnd);
        const xEnd = (w / 2 - peekAmount) / sEnd - cardW / 2;

        const currentX = xStart + easedT * (xEnd - xStart);
        x = sign * currentX;
        z = zStart + easedT * (zEnd - zStart);
        rot = rotStart + easedT * (rotEnd - rotStart);
      } else {
        const t = Math.min(absOffset - 2, 1);
        const easedT = t * t * (3 - 2 * t);
        const zStart = -60;
        const rotStart = 175;
        const zEnd3 = -250;
        const rotEnd3 = 195;

        const sEnd2 = D / (D - zStart);
        const xEnd2 = (w / 2 - peekAmount) / sEnd2 - cardW / 2;
        const sEnd3 = D / (D - zEnd3);
        const xEnd3 = (w / 2 + 90) / sEnd3 + cardW / 2;

        const currentX = xEnd2 + easedT * (xEnd3 - xEnd2);
        x = sign * currentX;
        z = zStart + easedT * (zEnd3 - zStart);
        rot = rotStart + easedT * (rotEnd3 - rotStart);
      }

      const localCardRotation = sign * rot;
      const centerFactor = Math.max(0, 1 - absOffset);

      const maxTiltX = 9;
      const maxTiltY = 11;
      const activeTiltX = -mouse.current.y * maxTiltX * centerFactor;
      const activeTiltY = mouse.current.x * maxTiltY * centerFactor;

      const totalRotX = activeTiltX;
      const totalRotY = localCardRotation + activeTiltY;

      card.style.zIndex = Math.round(z).toString();
      card.style.opacity = "1";
      card.style.transform = `translateX(${x.toFixed(2)}px) translateZ(${z.toFixed(2)}px) rotateX(${totalRotX.toFixed(2)}deg) rotateY(${totalRotY.toFixed(2)}deg) rotateZ(${(-sign * 2).toFixed(2)}deg)`;
    }
  };

  useEffect(() => {
    const tick = () => {
      renderLoop();
      frameId.current = requestAnimationFrame(tick);
    };
    frameId.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId.current);
  }, [metrics, cardCount]);

  const goTo = (i) => {
    const cur = progressTarget.current;
    const curMod = ((Math.round(cur) % cardCount) + cardCount) % cardCount;
    let diff = i - curMod;
    const half = cardCount / 2;
    if (diff > half) diff -= cardCount;
    if (diff < -half) diff += cardCount;
    progressTarget.current = Math.round(cur) + diff;
  };

  const thicknessLayers = [-1.4, -0.7, 0, 0.7, 1.4];

  if (cardCount === 0) return null;

  return (
    <div className="w-full select-none">
      {STYLE}
      <div
        ref={wrapRef}
        className="relative w-full rounded-2xl overflow-hidden"
        style={{
          height: metrics.cardH + 96,
          background: "#000000",
          border: `1px solid ${C.border}`,
          boxShadow: "0 1px 0 rgba(255,255,255,0.06) inset, 0 14px 28px -16px rgba(0,0,0,0.7)",
        }}
      >
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ perspective: "1350px" }}
        >
          <div
            className="relative"
            style={{
              width: `${metrics.cardW}px`,
              height: `${metrics.cardH}px`,
              transformStyle: "preserve-3d",
            }}
          >
            {accounts.map((acc, i) => {
              const accent = ACCENTS[i % ACCENTS.length];
              return (
                <div
                  key={acc.id}
                  ref={(el) => {
                    cardsRefs.current[i] = el;
                  }}
                  onClick={() => goTo(i)}
                  className="absolute inset-0 cursor-pointer"
                  style={{
                    width: `${metrics.cardW}px`,
                    height: `${metrics.cardH}px`,
                    transformStyle: "preserve-3d",
                  }}
                >
                  {thicknessLayers.map((zOffset, layerIdx) => {
                    const isFront = layerIdx === thicknessLayers.length - 1;
                    const isBack = layerIdx === 0;

                    if (!isFront && !isBack) {
                      return (
                        <div
                          key={layerIdx}
                          className="absolute inset-0 rounded-[14px] pointer-events-none overflow-hidden"
                          style={{
                            backgroundColor: "#2a2a2a",
                            border: "1px solid #3a3a3a",
                            transform: `translateZ(${zOffset}px)`,
                          }}
                        />
                      );
                    }

                    if (isFront) {
                      return (
                        <div
                          key={layerIdx}
                          className="absolute inset-0 rounded-[14px] pointer-events-none overflow-hidden"
                          style={{
                            background: `radial-gradient(120% 140% at 12% -10%, ${accent}33, transparent 55%), linear-gradient(150deg, #16100f, #050302 70%)`,
                            border: `1px solid ${accent}4d`,
                            transform: `translateZ(${zOffset}px)`,
                            backfaceVisibility: "hidden",
                            boxShadow: "inset 0 1px 1px rgba(255,255,255,0.12)",
                          }}
                        >
                          <div className="acc3d-sheen" />

                          <div className="absolute inset-0 p-3 sm:p-3.5 flex flex-col justify-between">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <svg className="w-4 h-4 sm:w-[18px] sm:h-[18px] shrink-0" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M20 8H40V14C40.0016 14.5299 40.2128 15.0377 40.5875 15.4125C40.9623 15.7872 41.4701 15.9984 42 16H59V24H42C41.4701 24.0016 40.9623 24.2128 40.5875 24.5875C40.2128 24.9623 40.0016 25.4701 40 26V52H20V8ZM18 8H8.00039C4.47435 8 1.56576 10.6083 1.08 14H18V8ZM1 16V24V26V34V36V44H18V36H1V34H18V26H1V24H18V16H1ZM1.08 46C1.56576 49.3917 4.47435 52 8.00039 52H18V46H1.08ZM42 14V8H52.0004C55.5264 8 58.4342 10.6084 58.92 14H42ZM59 26H42V34H59V26ZM59 36H42V44H59V36ZM52.0004 52H42V46H58.92C58.4342 49.3916 55.5264 52 52.0004 52Z"
                                    fill={`url(#acc3d-chip-${acc.id})`}
                                  />
                                  <defs>
                                    <linearGradient id={`acc3d-chip-${acc.id}`} x1="30" y1="8" x2="30" y2="52" gradientUnits="userSpaceOnUse">
                                      <stop stopColor="white" />
                                      <stop offset="1" stopColor="#999999" />
                                    </linearGradient>
                                  </defs>
                                </svg>
                                <span className="cmd-display text-[11px] sm:text-[12.5px] font-bold text-white leading-tight truncate">
                                  {acc.bank}
                                </span>
                              </div>
                              <span
                                className="cmd-display text-[7px] sm:text-[7.5px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-full shrink-0"
                                style={{ color: STATUS_COLOR[acc.status], border: `1px solid ${STATUS_COLOR[acc.status]}` }}
                              >
                                {acc.status}
                              </span>
                            </div>

                            <div>
                              <div className="cmd-mono text-[9px] sm:text-[10px] tracking-[0.1em] text-white/80 mb-1.5">
                                {maskNumber(acc.cardId)}
                              </div>
                              <div className="flex items-end justify-between gap-2">
                                <div className="cmd-mono text-[16px] sm:text-[18px] font-semibold leading-none" style={{ color: C.gold }}>
                                  {fmtMoney(acc.balance)} <span className="text-[10px] font-normal">₽</span>
                                </div>
                                <div className="flex -space-x-2.5 items-center opacity-90 acc3d-glow shrink-0 mb-0.5">
                                  <div className="w-3 h-3 rounded-full" style={{ background: `${C.red}cc` }} />
                                  <div className="w-3 h-3 rounded-full" style={{ background: `${C.gold}cc` }} />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={layerIdx}
                        className="absolute inset-0 rounded-[14px] pointer-events-none overflow-hidden"
                        style={{
                          background: `radial-gradient(120% 140% at 88% 110%, ${accent}26, transparent 55%), linear-gradient(150deg, #050302, #16100f 70%)`,
                          border: `1px solid ${accent}4d`,
                          transform: `translateZ(${zOffset}px) rotateY(180deg)`,
                          backfaceVisibility: "hidden",
                          boxShadow: "inset 0 1px 1px rgba(255,255,255,0.12)",
                        }}
                      >
                        <div className="absolute left-0 right-0 top-3.5 sm:top-4 h-6 sm:h-7" style={{ background: "rgba(0,0,0,0.9)" }} />

                        <div className="absolute left-3.5 sm:left-4 bottom-3.5 sm:bottom-4 right-3.5 sm:right-4 flex flex-col gap-1">
                          <div className="cmd-mono text-[10px] sm:text-[11px] font-medium tracking-[0.1em] text-white">
                            {maskNumber(acc.cardId)}
                          </div>
                          <div className="cmd-mono text-[8px] sm:text-[9px] font-medium text-white/60 tracking-wide flex items-center gap-2">
                            <span className="uppercase truncate">{ownerName}</span>
                            <span className="text-white/30 font-light">•</span>
                            <span style={{ color: STATUS_COLOR[acc.status] }}>{acc.status}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {cardCount > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {accounts.map((acc, i) => (
            <button
              key={acc.id}
              onClick={() => goTo(i)}
              aria-label={acc.bank}
              className="rounded-full transition-all"
              style={{
                width: i === activeIdx ? 16 : 5,
                height: 5,
                background: i === activeIdx ? C.red : "rgba(255,255,255,0.22)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
