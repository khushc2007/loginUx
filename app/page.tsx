"use client"

import LoginCard from "@/components/login-card"
import RotatingEarth from "@/components/rotating-earth"
import { useEffect, useState, useRef } from "react"

const QUOTES = [
  { text: "Water is the driving force of all nature.", author: "— Leonardo da Vinci" },
  { text: "The greatest threat to our planet is the belief that someone else will save it.", author: "— Robert Swan" },
  { text: "Every drop saved today secures tomorrow.", author: null },
]

function TypewriterQuotes() {
  const [quoteIndex, setQuoteIndex] = useState(0)
  const [displayed, setDisplayed] = useState("")
  const [phase, setPhase] = useState<"typing" | "pause" | "erasing">("typing")
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const full = QUOTES[quoteIndex].text
    if (phase === "typing") {
      if (displayed.length < full.length) {
        timeoutRef.current = setTimeout(() => {
          setDisplayed(full.slice(0, displayed.length + 1))
        }, 38)
      } else {
        timeoutRef.current = setTimeout(() => setPhase("pause"), 2200)
      }
    } else if (phase === "pause") {
      timeoutRef.current = setTimeout(() => setPhase("erasing"), 400)
    } else if (phase === "erasing") {
      if (displayed.length > 0) {
        timeoutRef.current = setTimeout(() => {
          setDisplayed(displayed.slice(0, -1))
        }, 18)
      } else {
        setQuoteIndex((i) => (i + 1) % QUOTES.length)
        setPhase("typing")
      }
    }
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }
  }, [displayed, phase, quoteIndex])

  const quote = QUOTES[quoteIndex]

  return (
    <div className="text-center px-4 max-w-xs mx-auto min-h-[56px]">
      <p className="text-white/70 text-xs sm:text-sm leading-relaxed font-light italic">
        &ldquo;{displayed}
        <span className="inline-block w-px h-[1em] bg-cyan-400/80 ml-0.5 align-middle animate-pulse" />
        &rdquo;
      </p>
      {phase === "pause" && quote.author && (
        <p className="text-white/35 text-[10px] sm:text-xs mt-1 tracking-wide">{quote.author}</p>
      )}
    </div>
  )
}

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020509]">

      {/* ── Aurora water background ── */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-br from-[#020509] via-[#030d18] to-[#020810]" />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(ellipse 120% 60% at 20% 80%, rgba(6,182,212,0.18) 0%, transparent 60%), " +
              "radial-gradient(ellipse 80% 50% at 80% 20%, rgba(14,116,144,0.12) 0%, transparent 55%)",
            animation: "auroraA 12s ease-in-out infinite alternate",
          }}
        />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(ellipse 100% 40% at 60% 90%, rgba(8,145,178,0.15) 0%, transparent 60%), " +
              "radial-gradient(ellipse 70% 60% at 10% 30%, rgba(6,182,212,0.08) 0%, transparent 55%)",
            animation: "auroraB 16s ease-in-out infinite alternate",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "repeating-linear-gradient(90deg, rgba(6,182,212,1) 0px, transparent 1px, transparent 60px)",
            animation: "streakDrift 20s linear infinite",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, rgba(6,182,212,1) 0px, transparent 1px, transparent 80px)",
            animation: "streakDriftY 28s linear infinite",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
            backgroundSize: "256px 256px",
          }}
        />
      </div>

      {/* ── Keyframes ── */}
      <style>{`
        @keyframes auroraA {
          0%   { transform: translate(0%, 0%) scale(1); }
          100% { transform: translate(4%, -6%) scale(1.08); }
        }
        @keyframes auroraB {
          0%   { transform: translate(0%, 0%) scale(1); }
          100% { transform: translate(-5%, 5%) scale(1.06); }
        }
        @keyframes streakDrift {
          0%   { background-position-x: 0px; }
          100% { background-position-x: 60px; }
        }
        @keyframes streakDriftY {
          0%   { background-position-y: 0px; }
          100% { background-position-y: 80px; }
        }
        input::placeholder {
          color: rgba(255,255,255,0.22);
        }
      `}</style>

      {/* ── Layout: single-column on mobile, two-column on desktop ── */}
      <div className="relative z-10 flex flex-col lg:flex-row min-h-screen min-h-[100dvh]">

        {/* ── TOP on mobile / LEFT on desktop: Globe + Quotes ── */}
        <div className="
          flex-none lg:flex-1 flex flex-col items-center justify-center
          px-4 pt-8 pb-2
          sm:px-6 sm:pt-10 sm:pb-4
          lg:px-10 lg:py-14
          order-1
        ">
          {/* Glow halo behind globe */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="w-[300px] h-[300px] sm:w-[420px] sm:h-[420px] rounded-full blur-[80px]"
              style={{ background: "rgba(6,182,212,0.07)" }}
            />
          </div>

          {/* Globe — smaller on mobile, full size on desktop */}
          <div className="relative z-10 w-full flex justify-center">
            <RotatingEarth
              width={560}
              height={460}
              className="w-full max-w-[220px] sm:max-w-[360px] lg:max-w-[560px]"
            />
          </div>

          {/* Typewriter quotes — shown on sm+ */}
          <div className="relative z-10 hidden sm:block mt-2">
            <TypewriterQuotes />
          </div>
        </div>

        {/* ── BOTTOM on mobile / RIGHT on desktop: Login card ── */}
        <div className="
          flex-1 flex items-center justify-center
          px-4 pb-8 pt-2
          sm:px-6 sm:pb-10 sm:pt-4
          lg:px-14 lg:py-14
          order-2
        ">
          <LoginCard />
        </div>

      </div>
    </main>
  )
}
