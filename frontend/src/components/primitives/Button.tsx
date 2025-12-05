import type React from "react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger"
  size?: "sm" | "md" | "lg"
  children: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  children,
  className = "",
  disabled,
  ...props
}) => {
  const baseStyles = `
    inline-flex items-center justify-center font-medium rounded-xl
    transition-all duration-200 ease-out
    focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    active:scale-[0.98]
  `

  const variants = {
    primary: `
      bg-gradient-to-r from-indigo-600 to-indigo-500 text-white
      hover:from-indigo-500 hover:to-indigo-600 hover:shadow-lg hover:shadow-indigo-500/25
      focus-visible:ring-indigo-500
    `,
    secondary: `
      bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200
      hover:bg-slate-200 dark:hover:bg-slate-600
      focus-visible:ring-slate-500
    `,
    ghost: `
      bg-transparent text-slate-600 dark:text-slate-300
      hover:bg-slate-100 dark:hover:bg-slate-700
      focus-visible:ring-slate-500
    `,
    danger: `
      bg-gradient-to-r from-rose-600 to-rose-500 text-white
      hover:from-rose-500 hover:to-rose-600 hover:shadow-lg hover:shadow-rose-500/25
      focus-visible:ring-rose-500
    `,
  }

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  }

  return (
    <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} disabled={disabled} {...props}>
      {children}
    </button>
  )
}
