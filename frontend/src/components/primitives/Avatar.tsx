import type React from "react"
import { getInitials } from "@/src/utils/task.utils"

interface AvatarProps {
  name: string
  size?: "sm" | "md" | "lg"
  className?: string
}

const colorPalette = [
  "from-indigo-500 to-indigo-600",
  "from-emerald-500 to-emerald-600",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-500",
  "from-purple-500 to-indigo-500",
  "from-teal-500 to-cyan-500",
  "from-orange-500 to-red-500",
  "from-cyan-500 to-blue-500",
]

const getColorFromName = (name: string): string => {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colorPalette[Math.abs(hash) % colorPalette.length]
}

export const Avatar: React.FC<AvatarProps> = ({ name, size = "md", className = "" }) => {
  const sizes = {
    sm: "w-6 h-6 text-[10px]",
    md: "w-8 h-8 text-xs",
    lg: "w-10 h-10 text-sm",
  }

  return (
    <div
      className={`
        ${sizes[size]} 
        bg-gradient-to-br ${getColorFromName(name)} 
        rounded-full flex items-center justify-center 
        text-white font-semibold tracking-tight
        ring-2 ring-white shadow-sm
        ${className}
      `}
      title={name}
      aria-label={name}
    >
      {getInitials(name)}
    </div>
  )
}
