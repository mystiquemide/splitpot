import { cn } from "@/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-mono uppercase tracking-wider transition-none border-2 border-black disabled:opacity-40 disabled:cursor-not-allowed",
        variant === "primary" &&
          "bg-black text-white hover:bg-neutral-800 shadow-[3px_3px_0_0_#0a0a0a]",
        variant === "secondary" &&
          "bg-neutral-100 text-black hover:bg-neutral-200 shadow-[3px_3px_0_0_#0a0a0a]",
        variant === "outline" &&
          "bg-white text-black hover:bg-neutral-50 shadow-[3px_3px_0_0_#0a0a0a]",
        variant === "ghost" &&
          "border-transparent bg-transparent text-neutral-600 hover:text-black shadow-none tracking-normal normal-case font-sans",
        size === "sm" && "px-3 py-1.5 text-[10px]",
        size === "md" && "px-4 py-2 text-[11px]",
        size === "lg" && "px-6 py-3 text-xs",
        className
      )}
      {...props}
    />
  )
}
