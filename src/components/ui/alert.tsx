import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground border-border [&>svg]:text-foreground",
        // Success variant
        success: 
          "bg-success/10 border-success/20 text-success-foreground [&>svg]:text-success",
        // Warning variant  
        warning:
          "bg-warning/10 border-warning/20 text-warning-foreground [&>svg]:text-warning",
        // Error/Destructive variant
        destructive:
          "bg-error/10 border-error/20 text-error-foreground [&>svg]:text-error",
        // Info variant
        info:
          "bg-info/10 border-info/20 text-info-foreground [&>svg]:text-info",
        // ITHQ branded variants
        "ithq-teal":
          "bg-ithq-teal/10 border-ithq-teal/20 text-ithq-teal [&>svg]:text-ithq-teal",
        "ithq-orange":
          "bg-ithq-orange/10 border-ithq-orange/20 text-ithq-orange [&>svg]:text-ithq-orange",
        "ithq-yellow":
          "bg-ithq-yellow/10 border-ithq-yellow/20 text-ithq-yellow [&>svg]:text-ithq-yellow",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-heading font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm font-sans [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
