import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  className?: string
  size?: "sm" | "md" | "lg"
  fullScreen?: boolean
}

export function LoadingSpinner({ className, size = "md", fullScreen = false }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  }

  const containerClasses = {
    sm: "gap-1",
    md: "gap-2",
    lg: "gap-3",
  }

  const spinner = (
    <div className={cn("flex items-center justify-center", containerClasses[size], className)}>
      {/* First dot */}
      <div 
        className={cn(
          "rounded-full bg-sacco-blue animate-bounce",
          sizeClasses[size]
        )}
        style={{ animationDelay: "0ms" }}
      />
      {/* Second dot */}
      <div 
        className={cn(
          "rounded-full bg-sacco-green animate-bounce",
          sizeClasses[size]
        )}
        style={{ animationDelay: "150ms" }}
      />
      {/* Third dot */}
      <div 
        className={cn(
          "rounded-full bg-gradient-to-r from-sacco-blue to-sacco-green animate-bounce",
          sizeClasses[size]
        )}
        style={{ animationDelay: "300ms" }}
      />
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {spinner}
      </div>
    )
  }

  return spinner
} 