import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  subtitle?: string;
}

export function Logo({
  className,
  size = "md",
  showText = true,
  subtitle,
}: LogoProps) {
  const sizeMap = {
    sm: { icon: "h-7 w-7", text: "text-base", sub: "text-[9px]" },
    md: { icon: "h-9 w-9", text: "text-lg", sub: "text-[10px]" },
    lg: { icon: "h-12 w-12", text: "text-2xl", sub: "text-xs" },
    xl: { icon: "h-16 w-16", text: "text-3xl", sub: "text-sm" },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={cn("inline-flex items-center space-x-3 select-none", className)}>
      {/* Premium Geometric AI-HCM Emblem */}
      <div className={cn("relative shrink-0 flex items-center justify-center", currentSize.icon)}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_4px_12px_rgba(79,70,229,0.28)]"
        >
          <defs>
            <linearGradient id="hcmGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>

            <filter id="coreGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background rounded squircle with subtle border */}
          <rect
            x="2"
            y="2"
            width="44"
            height="44"
            rx="12"
            fill="url(#hcmGrad1)"
          />

          {/* Inner glass overlay */}
          <rect
            x="3"
            y="3"
            width="42"
            height="42"
            rx="11"
            fill="white"
            fillOpacity="0.05"
            stroke="white"
            strokeOpacity="0.15"
            strokeWidth="1"
          />

          {/* Stylized Modern "H" & Human Core Emblem */}
          {/* Left Pillar */}
          <path
            d="M13 14C13 12.8954 13.8954 12 15 12H17C18.1046 12 19 12.8954 19 14V34C19 35.1046 18.1046 36 17 36H15C13.8954 36 13 35.1046 13 34V14Z"
            fill="white"
            fillOpacity="0.95"
          />

          {/* Right Pillar */}
          <path
            d="M29 14C29 12.8954 29.8954 12 31 12H33C34.1046 12 35 12.8954 35 14V34C35 35.1046 34.1046 36 33 36H31C29.8954 36 29 35.1046 29 34V14Z"
            fill="white"
            fillOpacity="0.95"
          />

          {/* Dynamic AI Bridge / Nexus Wave */}
          <path
            d="M19 22C21.5 22 22.5 26 24 26C25.5 26 26.5 22 29 22V26C26.5 26 25.5 22 24 22C22.5 22 21.5 26 19 26V22Z"
            fill="#94a3b8"
          />

          {/* Central Pulsing AI Diamond Core */}
          <polygon
            points="24,19 28,24 24,29 20,24"
            fill="#10b981"
            filter="url(#coreGlow)"
          />
          <circle cx="24" cy="24" r="1.5" fill="white" />

          {/* Top Human Talent Node Arc */}
          <circle cx="24" cy="13" r="2.5" fill="white" />
        </svg>
      </div>

      {/* Wordmark */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center space-x-1.5 leading-none">
            <span
              className={cn(
                "font-black tracking-tight text-slate-900 dark:text-white flex items-center",
                currentSize.text
              )}
            >
              HCM
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white font-extrabold text-[10px] tracking-wide uppercase shadow-xs">
              Lite
            </span>
          </div>
          {subtitle && (
            <span className={cn("text-slate-500 dark:text-slate-400 font-medium mt-0.5", currentSize.sub)}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function LogoIcon({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("drop-shadow-[0_4px_12px_rgba(15,23,42,0.18)]", className)}
    >
      <defs>
        <linearGradient id="hcmIconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#hcmIconGrad)" />
      <rect x="3" y="3" width="42" height="42" rx="11" fill="white" fillOpacity="0.05" stroke="white" strokeOpacity="0.15" strokeWidth="1" />
      <path d="M13 14C13 12.8954 13.8954 12 15 12H17C18.1046 12 19 12.8954 19 14V34C19 35.1046 18.1046 36 17 36H15C13.8954 36 13 35.1046 13 34V14Z" fill="white" fillOpacity="0.95" />
      <path d="M29 14C29 12.8954 29.8954 12 31 12H33C34.1046 12 35 12.8954 35 14V34C35 35.1046 34.1046 36 33 36H31C29.8954 36 29 35.1046 29 34V14Z" fill="white" fillOpacity="0.95" />
      <path d="M19 22C21.5 22 22.5 26 24 26C25.5 26 26.5 22 29 22V26C26.5 26 25.5 22 24 22C22.5 22 21.5 26 19 26V22Z" fill="#94a3b8" />
      <polygon points="24,19 28,24 24,29 20,24" fill="#10b981" />
      <circle cx="24" cy="24" r="1.5" fill="white" />
      <circle cx="24" cy="13" r="2.5" fill="white" />
    </svg>
  );
}
