import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-lg border px-3 py-1 text-xs font-ui font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        // ITHQ Primary: Teal
        default:
          "border-transparent bg-ithq-teal text-white hover:bg-ithq-teal-300 hover:shadow-sm",
        // ITHQ Secondary: Orange
        secondary:
          "border-transparent bg-ithq-orange text-white hover:bg-ithq-orange-300 hover:shadow-sm",
        // ITHQ Accent: Yellow
        accent:
          "border-transparent bg-ithq-yellow text-ithq-dark-teal hover:bg-ithq-yellow-300 hover:shadow-sm",
        // Success
        success:
          "border-transparent bg-success text-success-foreground hover:bg-success/80 hover:shadow-sm",
        // Warning
        warning:
          "border-transparent bg-warning text-warning-foreground hover:bg-warning/80 hover:shadow-sm",
        // Error/Destructive
        destructive:
          "border-transparent bg-error text-error-foreground hover:bg-error/80 hover:shadow-sm",
        // Outline variants
        outline: 
          "border-ithq-teal text-ithq-teal hover:bg-ithq-teal hover:text-white",
        "outline-secondary": 
          "border-ithq-orange text-ithq-orange hover:bg-ithq-orange hover:text-white",
        "outline-accent": 
          "border-ithq-yellow text-ithq-yellow hover:bg-ithq-yellow hover:text-ithq-dark-teal",
        // Muted
        muted:
          "border-transparent bg-muted text-muted-foreground hover:bg-muted/80",
      },
      size: {
        sm: "px-2 py-0.5 text-xs rounded-md",
        default: "px-3 py-1 text-xs rounded-lg",
        lg: "px-4 py-1.5 text-sm rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
