"use client"

import React, { useState } from "react"
import { getAvatarById, getDefaultAvatar } from "@/lib/avatars"

interface OpenPeepAvatarProps {
  avatarId?: string | null
  name?: string | null
  gender?: string | null
  role?: string
  dob?: string | null
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  className?: string
  showBorder?: boolean
}

const sizeClasses: Record<string, { container: string; px: number }> = {
  xs: { container: "w-7 h-7", px: 28 },
  sm: { container: "w-9 h-9", px: 36 },
  md: { container: "w-11 h-11", px: 44 },
  lg: { container: "w-14 h-14", px: 56 },
  xl: { container: "w-20 h-20", px: 80 },
}

export function OpenPeepAvatar({
  avatarId,
  name,
  gender,
  role,
  dob,
  size = "md",
  className = "",
  showBorder = true,
}: OpenPeepAvatarProps) {
  const [hasError, setHasError] = useState(false)

  // Resolve active avatar ID (fallback to auto-selection if not specified)
  const resolvedId = avatarId || getDefaultAvatar({ role, gender, dob, name })
  const avatar = getAvatarById(resolvedId)
  const sizeConfig = sizeClasses[size] || sizeClasses.md

  const initials = name
    ? name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0].toUpperCase())
        .join("")
    : "CF"

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full overflow-hidden select-none transition-transform duration-200 ${sizeConfig.container} ${
        showBorder ? "ring-2 ring-white/80 dark:ring-slate-800 shadow-sm" : ""
      } ${className}`}
    >
      {!hasError ? (
        <img
          src={avatar.path}
          alt={avatar.label}
          width={sizeConfig.px}
          height={sizeConfig.px}
          onError={() => setHasError(true)}
          className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-tr from-sky-500 to-emerald-400 text-white font-bold flex items-center justify-center text-xs">
          {initials}
        </div>
      )}
    </div>
  )
}
