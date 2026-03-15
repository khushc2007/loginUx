"use client"

/**
 * login-1.tsx
 * Standalone glassmorphic login panel — drop-in variant using auth-fuse primitives.
 * Import this wherever you need a self-contained auth card without the full page layout.
 *
 * Usage:
 *   import { Login1 } from "@/components/ui/login-1"
 *   <Login1 onSignIn={(email, password) => { ... }} />
 */

import * as React from "react"
import { AuthInput, AuthButton, AuthDivider } from "./auth-fuse"

export interface Login1Props {
  onSignIn?: (email: string, password: string) => Promise<void> | void
  onSignUp?: (name: string, email: string, password: string) => Promise<void> | void
  onGoogleAuth?: () => Promise<void> | void
  onForgotPassword?: () => void
  className?: string
}

export function Login1({ onSignIn, onSignUp, onGoogleAuth, onForgotPassword, className }: Login1Props) {
  const cardRef = React.useRef<HTMLDivElement>(null)
  const [glowPos, setGlowPos] = React.useState({ x: 50, y: 50 })
  const [isHovered, setIsHovered] = React.useState(false)
  const [mode, setMode] = React.useState<"signin" | "signup">("signin")
  const [showPassword, setShowPassword] = React.useState(false)
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [name, setName] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)

  const handleMouseMove = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setGlowPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      if (mode === "signin") {
        await onSignIn?.(email, password)
      } else {
        await onSignUp?.(name, email, password)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const eyeIcon = (
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="transition-colors"
      style={{ color: "rgba(255,255,255,0.3)" }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(6,182,212,0.8)")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
    >
      {showPassword ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
        </svg>
      )}
    </button>
  )

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative w-full max-w-[420px] rounded-2xl overflow-hidden ${className ?? ""}`}
      style={{
        background: "rgba(8, 16, 28, 0.72)",
        border: "1px solid rgba(6, 182, 212, 0.18)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        boxShadow: "0 8px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(6,182,212,0.08) inset, 0 1px 0 rgba(255,255,255,0.07) inset",
      }}
    >
      {/* Cursor glow */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(320px 260px at ${glowPos.x}% ${glowPos.y}%, rgba(6,182,212,0.09) 0%, rgba(14,116,144,0.05) 40%, transparent 70%)`,
        }}
      />
      {/* Top edge */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent 0%, rgba(6,182,212,0.5) 30%, rgba(255,255,255,0.15) 50%, rgba(6,182,212,0.5) 70%, transparent 100%)" }}
      />

      <div className="relative z-10 p-8 md:p-10">
        {/* Brand */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, rgba(6,182,212,0.3) 0%, rgba(14,116,144,0.5) 100%)", border: "1px solid rgba(6,182,212,0.35)", boxShadow: "0 0 12px rgba(6,182,212,0.2)" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2C8 2 3 6.5 3 10a5 5 0 0010 0C13 6.5 8 2 8 2z" fill="rgba(6,182,212,0.9)" />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-widest uppercase" style={{ color: "rgba(6,182,212,0.85)", letterSpacing: "0.18em" }}>WATER-IQ</span>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-white mb-1.5 tracking-tight">
            {mode === "signin" ? "Welcome back" : "Create account"}
          </h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.42)" }}>
            {mode === "signin" ? "Sign in to your intelligent water dashboard" : "Start managing your water intelligence today"}
          </p>
        </div>

        {/* Mode toggle */}
        <div className="flex rounded-xl p-1 mb-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
          {(["signin", "signup"] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)}
              className="flex-1 py-2 text-xs font-medium rounded-lg transition-all duration-200"
              style={{
                background: mode === m ? "rgba(6,182,212,0.18)" : "transparent",
                color: mode === m ? "rgba(6,182,212,1)" : "rgba(255,255,255,0.38)",
                border: mode === m ? "1px solid rgba(6,182,212,0.28)" : "1px solid transparent",
              }}>
              {m === "signin" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        <AuthButton variant="ghost" onClick={() => onGoogleAuth?.()} className="mb-5 flex items-center justify-center gap-2.5">
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </AuthButton>

        <AuthDivider className="mb-5" />

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <AuthInput label="Full Name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name"
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(6,182,212,0.5)" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>}
            />
          )}

          <AuthInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com"
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(6,182,212,0.5)" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></svg>}
          />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>Password</label>
              {mode === "signin" && (
                <button type="button" onClick={onForgotPassword} className="text-xs" style={{ color: "rgba(6,182,212,0.7)" }}>Forgot password?</button>
              )}
            </div>
            <AuthInput type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(6,182,212,0.5)" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>}
              rightElement={eyeIcon}
            />
          </div>

          <AuthButton type="submit" loading={isLoading} className="mt-2">
            {mode === "signin" ? "Sign In" : "Create Account"}
          </AuthButton>
        </form>

        <p className="text-center text-xs mt-5" style={{ color: "rgba(255,255,255,0.28)" }}>
          {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="transition-colors" style={{ color: "rgba(6,182,212,0.75)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(6,182,212,1)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(6,182,212,0.75)")}>
            {mode === "signin" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  )
}

export default Login1
