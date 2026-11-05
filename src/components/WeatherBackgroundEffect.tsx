import React, { useMemo } from 'react';
import type { ConditionKey } from '../utils/logicFlows';

export interface WeatherBackgroundEffectProps {
  condKey: ConditionKey;
  conditionLabel?: string;
  isDark?: boolean;
}

/**
 * WeatherBackgroundEffect (CSS + JS Dynamic Engine)
 * Renders high-performance, GPU-accelerated weather phenomenon animations
 * (Overcast Clouds, Light Rain, Thunderstorm with Lightning, Sunrays & Sparkles, Heat Shimmer, Fog Mist, Twinkling Night Stars)
 * beneath the interactive UI layer inside the Atmospheric Hero Weather Card.
 */
export const WeatherBackgroundEffect: React.FC<WeatherBackgroundEffectProps> = ({
  condKey,
  conditionLabel,
  isDark = false,
}) => {
  // Dynamically resolve the active weather type based on the real-time conditionLabel or condKey
  const activeType = useMemo<ConditionKey | 'suong-mu'>(() => {
    const s = (conditionLabel || '').toLowerCase().trim();
    if (s.includes('dông') || s.includes('dong') || s.includes('sấm') || s.includes('bão') || s.includes('thunder')) {
      return 'mua-dong';
    }
    if (s.includes('mưa') || s.includes('mua') || s.includes('rain') || s.includes('drizzle')) {
      return 'mua-nho';
    }
    if (s.includes('nắng gắt') || s.includes('nang gat') || s.includes('nắng nóng') || s.includes('extreme heat') || s.includes('hot')) {
      return 'nang-gat';
    }
    if (s.includes('mây') || s.includes('may') || s.includes('u ám') || s.includes('am u') || s.includes('cloud') || s.includes('overcast')) {
      return 'am-u';
    }
    if (s.includes('sương') || s.includes('suong') || s.includes('fog') || s.includes('mist')) {
      return 'suong-mu';
    }
    if (s.includes('nắng') || s.includes('nang') || s.includes('sun') || s.includes('clear') || s.includes('quang')) {
      return 'nang';
    }
    return condKey;
  }, [condKey, conditionLabel]);

  // Raindrops configuration for light rain / drizzle
  const raindrops = useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      left: `${((i * 17) % 94) + 3}%`,
      delay: `${((i * 0.17) % 2).toFixed(2)}s`,
      duration: `${(0.85 + ((i * 0.11) % 0.65)).toFixed(2)}s`,
      height: `${14 + (i % 12)}px`,
      opacity: (0.4 + (i % 5) * 0.12).toFixed(2),
    }));
  }, []);

  // Heavy rain streaks for thunderstorm
  const heavyRaindrops = useMemo(() => {
    return Array.from({ length: 32 }).map((_, i) => ({
      id: i,
      left: `${((i * 13) % 96) + 2}%`,
      delay: `${((i * 0.13) % 1.5).toFixed(2)}s`,
      duration: `${(0.6 + ((i * 0.08) % 0.45)).toFixed(2)}s`,
      height: `${20 + (i % 16)}px`,
      opacity: (0.5 + (i % 5) * 0.1).toFixed(2),
    }));
  }, []);

  // Sun sparkles configuration
  const sparkles = useMemo(() => {
    return Array.from({ length: 10 }).map((_, i) => ({
      id: i,
      left: `${15 + ((i * 23) % 75)}%`,
      top: `${18 + ((i * 19) % 65)}%`,
      size: `${4 + (i % 4) * 2}px`,
      delay: `${((i * 0.35) % 3).toFixed(1)}s`,
      duration: `${(2.6 + ((i * 0.4) % 2.2)).toFixed(1)}s`,
    }));
  }, []);

  // Heat embers for intense heat
  const heatEmbers = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      left: `${10 + ((i * 29) % 80)}%`,
      bottom: `${5 + ((i * 15) % 40)}%`,
      size: `${3 + (i % 4)}px`,
      delay: `${((i * 0.3) % 2.5).toFixed(1)}s`,
      duration: `${(2.2 + ((i * 0.35) % 2.0)).toFixed(1)}s`,
    }));
  }, []);

  // Night stars configuration for calm / clear night
  const stars = useMemo(() => {
    return Array.from({ length: 16 }).map((_, i) => ({
      id: i,
      left: `${8 + ((i * 29) % 84)}%`,
      top: `${10 + ((i * 23) % 75)}%`,
      size: `${2 + (i % 3)}px`,
      delay: `${((i * 0.4) % 4).toFixed(1)}s`,
      duration: `${(2.2 + ((i * 0.5) % 2.5)).toFixed(1)}s`,
    }));
  }, []);

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden z-0 rounded-3xl"
      aria-hidden="true"
      data-testid="weather-background-effect"
      data-weather-type={activeType}
    >
      {/* ── 1. AM-U (MÂY ĐEN U ÁM / NHIỀU MÂY / OVERCAST) ──────────────────── */}
      {activeType === 'am-u' && (
        <div className="absolute inset-0">
          {/* Ambient gloom overlay */}
          <div className="absolute inset-0 bg-slate-900/10 dark:bg-slate-950/25 mix-blend-multiply transition-opacity duration-1000" />

          {/* Cloud Layer 1 - Upper drift */}
          <div className="absolute -top-10 -left-16 w-[340px] h-[180px] animate-cloud-drift-1 opacity-40 dark:opacity-30">
            <svg viewBox="0 0 100 50" className="w-full h-full fill-white/50 dark:fill-slate-300/25 blur-md">
              <path d="M 15 40 A 15 15 0 0 1 42 30 A 22 22 0 0 1 78 32 A 16 16 0 0 1 90 42 L 10 42 Z" />
            </svg>
          </div>

          {/* Cloud Layer 2 - Middle-right counter drift */}
          <div className="absolute top-12 -right-12 w-[320px] h-[170px] animate-cloud-drift-2 opacity-45 dark:opacity-35">
            <svg viewBox="0 0 100 50" className="w-full h-full fill-white/40 dark:fill-slate-400/20 blur-lg">
              <path d="M 18 38 A 16 16 0 0 1 46 28 A 20 20 0 0 1 82 34 A 14 14 0 0 1 92 40 L 12 40 Z" />
            </svg>
          </div>

          {/* Cloud Layer 3 - Lower atmospheric mist */}
          <div className="absolute -bottom-8 left-1/4 w-[280px] h-[140px] animate-cloud-drift-1 opacity-35 dark:opacity-25" style={{ animationDuration: '40s' }}>
            <svg viewBox="0 0 100 50" className="w-full h-full fill-sky-100/40 dark:fill-slate-500/20 blur-md">
              <path d="M 12 36 A 14 14 0 0 1 40 26 A 18 18 0 0 1 76 30 A 15 15 0 0 1 88 38 L 10 38 Z" />
            </svg>
          </div>
        </div>
      )}

      {/* ── 2. MUA-NHO (MƯA NHỎ / MƯA PHÙN / LIGHT RAIN) ─────────────────── */}
      {activeType === 'mua-nho' && (
        <div className="absolute inset-0">
          {/* Subtle mist overcast */}
          <div className="absolute inset-0 bg-blue-950/10 dark:bg-slate-950/20" />
          
          {/* Gentle rain streaks */}
          {raindrops.map((r) => (
            <span
              key={r.id}
              className="weather-raindrop"
              style={{
                left: r.left,
                height: r.height,
                opacity: r.opacity,
                animationDelay: r.delay,
                animationDuration: r.duration,
              }}
            />
          ))}

          {/* Subtle water splash ripples at bottom */}
          <div className="absolute bottom-2 left-1/4 w-3 h-1.5 rounded-full border border-white/30 animate-ping opacity-30" style={{ animationDuration: '2.5s' }} />
          <div className="absolute bottom-3 right-1/3 w-3 h-1.5 rounded-full border border-white/30 animate-ping opacity-25" style={{ animationDuration: '3.2s', animationDelay: '1.2s' }} />
        </div>
      )}

      {/* ── 3. MUA-DONG (MƯA DÔNG / BÃO / THUNDERSTORM) ──────────────────── */}
      {activeType === 'mua-dong' && (
        <div className="absolute inset-0">
          {/* Dark storm sky tint */}
          <div className="absolute inset-0 bg-slate-950/30 mix-blend-multiply" />

          {/* Dark storm clouds at top */}
          <div className="absolute -top-14 -left-10 w-[360px] h-[190px] animate-cloud-drift-1 opacity-60">
            <svg viewBox="0 0 100 50" className="w-full h-full fill-slate-900/40 dark:fill-slate-900/60 blur-md">
              <path d="M 10 42 A 16 16 0 0 1 42 26 A 24 24 0 0 1 84 30 A 16 16 0 0 1 94 42 L 8 42 Z" />
            </svg>
          </div>

          {/* Heavy slanted rain streaks */}
          {heavyRaindrops.map((r) => (
            <span
              key={r.id}
              className="weather-raindrop"
              style={{
                left: r.left,
                height: r.height,
                opacity: r.opacity,
                animationDelay: r.delay,
                animationDuration: r.duration,
              }}
            />
          ))}

          {/* Atmospheric lightning flash overlay */}
          <div className="absolute inset-0 bg-blue-100/25 dark:bg-cyan-200/20 animate-lightning-flash pointer-events-none" />

          {/* Jagged lightning bolt in upper right */}
          <div className="absolute top-2 right-1/4 w-24 h-48 animate-lightning-bolt pointer-events-none opacity-0">
            <svg viewBox="0 0 100 200" className="w-full h-full fill-amber-100 dark:fill-cyan-100 drop-shadow-[0_0_12px_rgba(255,255,255,0.9)]">
              <path d="M 55 0 L 32 75 L 56 75 L 28 170 L 72 68 L 46 68 Z" />
            </svg>
          </div>
        </div>
      )}

      {/* ── 4. NANG (TRỜI NẮNG / NẮNG ĐẸP / SUNNY) ───────────────────────── */}
      {activeType === 'nang' && (
        <div className="absolute inset-0">
          {/* Solar disc in top right */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-300/25 dark:bg-amber-400/15 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '4s' }} />

          {/* Soft angled sunbeam rays */}
          <div className="absolute -top-16 right-0 w-64 h-64 bg-gradient-to-bl from-amber-200/15 via-transparent to-transparent rotate-12 blur-xl pointer-events-none" />

          {/* Floating sun sparkles / golden dust motes */}
          {sparkles.map((sp) => (
            <span
              key={sp.id}
              className="sun-sparkle absolute rounded-full bg-amber-200/70 dark:bg-amber-300/60 shadow-[0_0_8px_rgba(251,191,36,0.8)]"
              style={{
                width: sp.size,
                height: sp.size,
                left: sp.left,
                top: sp.top,
                animationDelay: sp.delay,
                animationDuration: sp.duration,
              }}
            />
          ))}
        </div>
      )}

      {/* ── 5. NANG-GAT (NẮNG GẮT / NẮNG NÓNG / EXTREME HEAT) ─────────────── */}
      {activeType === 'nang-gat' && (
        <div className="absolute inset-0">
          {/* Intense solar corona orb */}
          <div className="absolute -top-10 -right-10 w-52 h-52 bg-orange-400/30 dark:bg-orange-500/20 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '2.5s' }} />
          <div className="absolute -top-4 -right-4 w-32 h-32 bg-amber-300/40 dark:bg-amber-400/25 rounded-full blur-xl animate-pulse" style={{ animationDuration: '3.5s' }} />

          {/* Heat wave shimmer layer */}
          <div className="absolute inset-0 bg-gradient-to-t from-orange-500/10 via-transparent to-transparent animate-heat-shimmer" />

          {/* Rising thermal embers */}
          {heatEmbers.map((emb) => (
            <span
              key={emb.id}
              className="sun-sparkle absolute rounded-full bg-amber-300/80 dark:bg-orange-300/70 shadow-[0_0_10px_rgba(245,158,11,0.9)]"
              style={{
                width: emb.size,
                height: emb.size,
                left: emb.left,
                bottom: emb.bottom,
                animationDelay: emb.delay,
                animationDuration: emb.duration,
              }}
            />
          ))}
        </div>
      )}

      {/* ── 6. SUONG-MU (SƯƠNG MÙ / MIST / FOG) ───────────────────────────── */}
      {activeType === 'suong-mu' && (
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-slate-300/15 dark:bg-slate-400/10 backdrop-blur-[0.5px]" />
          <div className="absolute top-1/4 -left-10 w-[120%] h-20 bg-gradient-to-r from-transparent via-white/20 to-transparent blur-md animate-fog-flow" />
          <div className="absolute top-1/2 -right-10 w-[120%] h-24 bg-gradient-to-r from-transparent via-white/15 to-transparent blur-lg animate-fog-flow" style={{ animationDelay: '3s', animationDuration: '25s' }} />
          <div className="absolute bottom-6 -left-10 w-[120%] h-24 bg-gradient-to-r from-transparent via-white/20 to-transparent blur-md animate-fog-flow" style={{ animationDelay: '6s', animationDuration: '22s' }} />
        </div>
      )}

      {/* ── 7. BINH-THUONG (BÌNH THƯỜNG / CALM / NIGHT TWINKLE) ───────────── */}
      {activeType === 'binh-thuong' && (
        <div className="absolute inset-0">
          {/* Ethereal celestial glow */}
          <div className="absolute -top-10 -right-10 w-44 h-44 bg-blue-300/15 dark:bg-indigo-400/10 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '5s' }} />
          
          {/* Subtle twinkling stars / ambient celestial particles */}
          {stars.map((st) => (
            <span
              key={st.id}
              className="weather-star-twinkle absolute rounded-full bg-white/70 dark:bg-blue-100/70 shadow-[0_0_4px_rgba(255,255,255,0.7)]"
              style={{
                width: st.size,
                height: st.size,
                left: st.left,
                top: st.top,
                animationDelay: st.delay,
                animationDuration: st.duration,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
