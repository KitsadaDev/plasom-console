import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

/* ============================================================================
 * 1. AuroraBackground (21st.dev Aurora + Architectural Grid + Shooting Beams)
 * ============================================================================ */
interface AuroraBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  showBeams?: boolean;
  intensity?: 'subtle' | 'medium' | 'vivid';
}

export const AuroraBackground: React.FC<AuroraBackgroundProps> = ({
  children,
  className = '',
  showBeams = true,
  intensity = 'medium',
}) => {
  const opacityMap = {
    subtle: 'opacity-50',
    medium: 'opacity-80',
    vivid: 'opacity-100',
  };

  return (
    <div className={`relative overflow-hidden bg-[#070b14] ${className}`}>
      {/* Ambient Aurora Mesh Layers */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 overflow-hidden ${opacityMap[intensity]}`}
      >
        <div className="absolute -top-44 left-1/2 -translate-x-1/2 w-[52rem] h-[28rem] rounded-full bg-gradient-to-tr from-orange-600/22 via-amber-500/14 to-rose-500/10 blur-[120px] animate-aurora" />
        <div className="absolute top-1/4 -left-32 w-[28rem] h-[28rem] rounded-full bg-indigo-600/12 blur-[130px] animate-pulse-slow" />
        <div className="absolute bottom-0 -right-28 w-[30rem] h-[26rem] rounded-full bg-cyan-500/10 blur-[130px] animate-aurora" />

        {/* Architectural Grid with Radial Vignette Mask */}
        <div
          className="absolute inset-0 bg-grid-dark"
          style={{
            maskImage: 'radial-gradient(ellipse 80% 65% at 50% 25%, #000 35%, transparent 100%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 80% 65% at 50% 25%, #000 35%, transparent 100%)',
          }}
        />

        {/* Subtle SVG Light Beams (21st.dev BackgroundBeams) */}
        {showBeams && (
          <svg
            className="absolute inset-0 w-full h-full opacity-35"
            viewBox="0 0 1440 800"
            fill="none"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <linearGradient id="beam-orange" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0" />
                <stop offset="50%" stopColor="#fb923c" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="beam-cyan" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
                <stop offset="50%" stopColor="#818cf8" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M-100 120 C 320 260, 680 40, 1540 320"
              stroke="url(#beam-orange)"
              strokeWidth="1.5"
              strokeDasharray="180 620"
              className="animate-beam-flow"
            />
            <path
              d="M1540 80 C 980 280, 560 120, -120 420"
              stroke="url(#beam-cyan)"
              strokeWidth="1.2"
              strokeDasharray="150 680"
              style={{ animationDelay: '1.4s' }}
              className="animate-beam-flow"
            />
          </svg>
        )}
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  );
};

/* ============================================================================
 * 2. GlowingCard (21st.dev GlowingEffect Card - Mouse-Following Border & Halo)
 * ============================================================================ */
interface GlowingCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glowColor?: string;
  secondaryGlow?: string;
  innerClassName?: string;
  active?: boolean;
}

export const GlowingCard: React.FC<GlowingCardProps> = ({
  children,
  glowColor = 'rgba(249, 115, 22, 0.65)',
  secondaryGlow = 'rgba(249, 115, 22, 0.11)',
  className = '',
  innerClassName = '',
  active = false,
  ...props
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`group relative rounded-2xl p-[1px] transition-transform duration-300 ${className}`}
      style={{
        background: active
          ? `linear-gradient(135deg, ${glowColor}, rgba(56,189,248,0.35), rgba(30,41,59,0.8))`
          : 'rgba(30, 41, 59, 0.78)',
      }}
      {...props}
    >
      {/* Dynamic Glowing Border Layer */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300"
        style={{
          opacity: hovered ? 1 : 0,
          background: `radial-gradient(320px circle at ${coords.x}px ${coords.y}px, ${glowColor}, rgba(56, 189, 248, 0.25) 40%, transparent 70%)`,
        }}
      />

      {/* Inner Surface */}
      <div
        className={`relative h-full w-full rounded-[calc(1rem-1px)] bg-[#0e1424]/95 backdrop-blur-xl overflow-hidden ${innerClassName}`}
      >
        {/* Ambient Cursor Spotlight Inside Card */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 transition-opacity duration-500"
          style={{
            opacity: hovered ? 1 : 0,
            background: `radial-gradient(420px circle at ${coords.x}px ${coords.y}px, ${secondaryGlow}, transparent 55%)`,
          }}
        />
        <div className="relative z-10 h-full">{children}</div>
      </div>
    </div>
  );
};

/* ============================================================================
 * 3. BorderBeam (21st.dev / Magic UI Orbiting Light Comet Along Container Edge)
 * ============================================================================ */
interface BorderBeamProps {
  colorFrom?: string;
  colorTo?: string;
  duration?: number;
  className?: string;
}

export const BorderBeam: React.FC<BorderBeamProps> = ({
  colorFrom = '#f97316',
  colorTo = '#38bdf8',
  duration = 7,
  className = '',
}) => {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 rounded-[inherit] p-[1.5px] overflow-hidden ${className}`}
      style={{
        mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        maskComposite: 'exclude',
        WebkitMaskComposite: 'xor',
      }}
    >
      <div
        className="absolute inset-[-120%] animate-border-beam"
        style={{
          animationDuration: `${duration}s`,
          background: `conic-gradient(from 0deg, transparent 0deg 275deg, ${colorTo} 315deg, ${colorFrom} 350deg, transparent 360deg)`,
        }}
      />
    </div>
  );
};

/* ============================================================================
 * 4. ShimmerButton / ShimmerLink (21st.dev Shimmer CTA Button)
 * ============================================================================ */
interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'orange' | 'dark';
}

export const ShimmerButton: React.FC<ShimmerButtonProps> = ({
  children,
  variant = 'orange',
  className = '',
  ...props
}) => {
  const baseStyle =
    variant === 'orange'
      ? 'bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white shadow-[0_8px_28px_-6px_rgba(249,115,22,0.55),inset_0_1px_0_0_rgba(255,255,255,0.32)] hover:shadow-[0_12px_34px_-4px_rgba(249,115,22,0.72),inset_0_1px_0_0_rgba(255,255,255,0.4)]'
      : 'bg-slate-900/90 text-slate-100 border border-slate-700/80 hover:border-orange-500/50 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]';

  return (
    <button
      className={`group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl font-semibold transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.97] disabled:opacity-55 disabled:pointer-events-none cursor-pointer ${baseStyle} ${className}`}
      {...props}
    >
      {/* Sweeping Shimmer Highlight */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-full"
      />
      <span className="relative z-10 inline-flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
};

interface ShimmerLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const ShimmerLink: React.FC<ShimmerLinkProps> = ({
  to,
  children,
  className = '',
  onClick,
}) => {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white font-semibold shadow-[0_8px_28px_-6px_rgba(249,115,22,0.55),inset_0_1px_0_0_rgba(255,255,255,0.32)] hover:shadow-[0_12px_34px_-4px_rgba(249,115,22,0.72),inset_0_1px_0_0_rgba(255,255,255,0.4)] transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.97] ${className}`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-full"
      />
      <span className="relative z-10 inline-flex items-center justify-center gap-2">
        {children}
      </span>
    </Link>
  );
};

/* ============================================================================
 * 5. TubelightTabs (21st.dev Tubelight Pill Switcher with Fluorescent Glow)
 * ============================================================================ */
export interface TubelightTabItem<T extends string> {
  key: T;
  label: string;
  icon?: LucideIcon;
  badge?: string | number;
}

interface TubelightTabsProps<T extends string> {
  items: TubelightTabItem<T>[];
  activeKey: T;
  onChange: (key: T) => void;
  className?: string;
  fullWidth?: boolean;
}

export function TubelightTabs<T extends string>({
  items,
  activeKey,
  onChange,
  className = '',
  fullWidth = false,
}: TubelightTabsProps<T>) {
  return (
    <div
      className={`inline-flex items-center gap-1 p-1.5 rounded-2xl bg-[#070b14]/90 border border-slate-800/90 backdrop-blur-xl shadow-inner ${
        fullWidth ? 'w-full grid' : ''
      } ${className}`}
      style={fullWidth ? { gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` } : undefined}
    >
      {items.map((item) => {
        const isActive = item.key === activeKey;
        const Icon = item.icon;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onChange(item.key)}
            className={`relative flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer ${
              isActive
                ? 'bg-slate-800/95 text-white shadow-[0_2px_12px_rgba(0,0,0,0.4)] border border-slate-700/80'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent'
            }`}
          >
            {/* 21st.dev Signature Fluorescent Tubelight Lamp */}
            {isActive && (
              <>
                <span className="pointer-events-none absolute -top-[1px] left-1/2 -translate-x-1/2 w-9 h-[2.5px] rounded-full bg-orange-400 shadow-[0_0_12px_2px_rgba(251,146,60,0.95)]" />
                <span className="pointer-events-none absolute -top-1 left-1/2 -translate-x-1/2 w-14 h-3 rounded-full bg-orange-500/25 blur-md" />
              </>
            )}
            {Icon && (
              <Icon
                className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                  isActive ? 'text-orange-400' : 'text-slate-500'
                }`}
              />
            )}
            <span className="truncate">{item.label}</span>
            {item.badge !== undefined && (
              <span
                className={`px-1.5 py-0.5 text-[10px] font-mono rounded-full leading-none ${
                  isActive
                    ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ============================================================================
 * 6. InfiniteMarquee (21st.dev Smooth Infinite Ticker with Edge Fade)
 * ============================================================================ */
interface InfiniteMarqueeProps {
  children: React.ReactNode;
  className?: string;
}

export const InfiniteMarquee: React.FC<InfiniteMarqueeProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`relative flex overflow-hidden select-none ${className}`}
      style={{
        maskImage:
          'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
        WebkitMaskImage:
          'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
      }}
    >
      <div className="flex shrink-0 items-center gap-4 animate-marquee hover-pause pr-4">
        {children}
        {children}
      </div>
    </div>
  );
};
