"use client"

/**
 * auth-fuse.tsx
 * Reusable authentication input primitive for shadcn-compatible projects.
 * Used by login-1.tsx and login-card.tsx
 */

import * as React from "react"

export interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
  rightElement?: React.ReactNode
  label?: string
  error?: string
}

export const AuthInput = React.forwardRef<HTMLInputElement, AuthInputProps>(
  ({ icon, rightElement, label, error, className, style, onFocus, onBlur, ...props }, ref) => {
    const [focused, setFocused] = React.useState(false)

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(true)
      onFocus?.(e)
    }
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(false)
      onBlur?.(e)
    }

    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full ${icon ? "pl-9" : "pl-4"} ${rightElement ? "pr-10" : "pr-4"} py-2.5 rounded-xl text-sm outline-none transition-all duration-200 ${className ?? ""}`}
            style={{
              background: focused ? "rgba(6,182,212,0.06)" : "rgba(255,255,255,0.05)",
              border: focused ? "1px solid rgba(6,182,212,0.45)" : "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.85)",
              caretColor: "rgba(6,182,212,0.8)",
              boxShadow: focused ? "0 0 0 3px rgba(6,182,212,0.08)" : "none",
              ...style,
            }}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightElement}</div>
          )}
        </div>
        {error && <p className="mt-1 text-xs" style={{ color: "rgba(248,113,113,0.85)" }}>{error}</p>}
      </div>
    )
  }
)
AuthInput.displayName = "AuthInput"

export interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  variant?: "primary" | "ghost" | "outline"
}

export const AuthButton = React.forwardRef<HTMLButtonElement, AuthButtonProps>(
  ({ loading, variant = "primary", children, style, onMouseEnter, onMouseLeave, disabled, ...props }, ref) => {
    const [hovered, setHovered] = React.useState(false)

    const baseStyle: React.CSSProperties =
      variant === "primary"
        ? {
            background: disabled || loading
              ? "rgba(6,182,212,0.25)"
              : hovered
              ? "linear-gradient(135deg, rgba(6,182,212,0.95) 0%, rgba(14,116,144,1) 100%)"
              : "linear-gradient(135deg, rgba(6,182,212,0.85) 0%, rgba(14,116,144,0.95) 100%)",
            color: "rgba(255,255,255,0.92)",
            border: "1px solid rgba(6,182,212,0.4)",
            boxShadow: hovered && !disabled && !loading ? "0 6px 28px rgba(6,182,212,0.38)" : "0 4px 20px rgba(6,182,212,0.25)",
            transform: hovered && !disabled && !loading ? "translateY(-1px)" : "translateY(0)",
          }
        : variant === "ghost"
        ? {
            background: hovered ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.055)",
            color: "rgba(255,255,255,0.8)",
            border: hovered ? "1px solid rgba(255,255,255,0.18)" : "1px solid rgba(255,255,255,0.1)",
          }
        : {
            background: "transparent",
            color: "rgba(6,182,212,0.85)",
            border: "1px solid rgba(6,182,212,0.35)",
          }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
        style={{ cursor: disabled || loading ? "not-allowed" : "pointer", ...baseStyle, ...style }}
        onMouseEnter={(e) => { setHovered(true); onMouseEnter?.(e) }}
        onMouseLeave={(e) => { setHovered(false); onMouseLeave?.(e) }}
        {...props}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            Authenticating...
          </span>
        ) : children}
      </button>
    )
  }
)
AuthButton.displayName = "AuthButton"

export function AuthDivider({ label = "or continue with email" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
      <span className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>{label}</span>
      <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
    </div>
  )
}
