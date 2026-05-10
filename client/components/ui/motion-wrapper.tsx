import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

interface MotionWrapperProps {
  children: React.ReactNode
  className?: string
  delay?: number
  animation?: "fade-up" | "fade-in" | "slide-up" | "scale-up"
}

export function MotionWrapper({ 
  children, 
  className, 
  delay = 0,
  animation = "fade-up" 
}: MotionWrapperProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  const animationClasses = {
    "fade-up": isVisible 
      ? "opacity-100 translate-y-0" 
      : "opacity-0 translate-y-4",
    "fade-in": isVisible 
      ? "opacity-100" 
      : "opacity-0",
    "slide-up": isVisible 
      ? "translate-y-0" 
      : "translate-y-8 opacity-0",
    "scale-up": isVisible 
      ? "scale-100 opacity-100" 
      : "scale-95 opacity-0"
  }

  return (
    <div 
      className={cn(
        "transition-all duration-700 ease-out",
        animationClasses[animation],
        className
      )}
    >
      {children}
    </div>
  )
}

export function StaggerChildren({ 
  children, 
  className, 
  staggerDelay = 100 
}: { 
  children: React.ReactNode[]
  className?: string
  staggerDelay?: number 
}) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <MotionWrapper 
          key={index} 
          delay={index * staggerDelay}
          animation="fade-up"
        >
          {child}
        </MotionWrapper>
      ))}
    </div>
  )
}
