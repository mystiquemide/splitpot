import { cn } from "@/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline"
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
        "inline-flex items-center justify-center font-mono uppercase tracking-wider transition-none border-2 border-[#0a0a0a] disabled:opacity-40 disabled:cursor-not-allowed",
        // Match landing ink/paper: pure black fill, paper text
        variant === "primary" &&
          "bg-[#0a0a0a] text-[#fafafa] hover:bg-neutral-800 shadow-[3px_3px_0_0_#0a0a0a]",
        variant === "secondary" &&
          "bg-[#fafafa] text-[#0a0a0a] hover:bg-neutral-200 shadow-[3px_3px_0_0_#0a0a0a]",
        variant === "outline" &&
          "bg-white text-[#0a0a0a] hover:bg-[#fafafa] shadow-[3px_3px_0_0_#0a0a0a]",
        size === "sm" && "px-3 py-1.5 text-[10px]",
        size === "md" && "px-4 py-2 text-[11px]",
        size === "lg" && "px-6 py-3 text-xs",
        className
      )}
      {...props}
    />
  )
}
