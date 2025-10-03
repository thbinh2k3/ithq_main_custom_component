import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-ui font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // ITHQ Primary: Teal background
        default: "bg-ithq-teal text-white hover:bg-ithq-teal-300 hover:shadow-lg rounded-lg",
        // ITHQ Secondary: Orange background  
        secondary: "bg-ithq-orange text-white hover:bg-ithq-orange-300 hover:shadow-lg rounded-lg",
        // ITHQ Accent: Yellow background
        accent: "bg-ithq-yellow text-ithq-dark-teal hover:bg-ithq-yellow-300 hover:shadow-lg rounded-lg",
        // Outline variants
        outline: "border-2 border-ithq-teal text-ithq-teal bg-background hover:bg-ithq-teal hover:text-white rounded-lg",
        "outline-secondary": "border-2 border-ithq-orange text-ithq-orange bg-background hover:bg-ithq-orange hover:text-white rounded-lg",
        "outline-accent": "border-2 border-ithq-yellow text-ithq-yellow bg-background hover:bg-ithq-yellow hover:text-ithq-dark-teal rounded-lg",
        // Ghost variants
        ghost: "text-ithq-teal hover:bg-ithq-teal/10 hover:text-ithq-teal rounded-lg",
        "ghost-secondary": "text-ithq-orange hover:bg-ithq-orange/10 hover:text-ithq-orange rounded-lg",
        "ghost-accent": "text-ithq-yellow hover:bg-ithq-yellow/10 hover:text-ithq-yellow rounded-lg",
        // Destructive
        destructive: "bg-error text-error-foreground hover:bg-error/90 rounded-lg",
        // Link
        link: "text-ithq-teal underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 px-3 py-1 text-xs rounded-md",
        default: "h-10 px-4 py-2 text-sm rounded-lg", 
        lg: "h-12 px-6 py-3 text-base rounded-lg",
        xl: "h-14 px-8 py-4 text-lg rounded-xl",
        icon: "h-10 w-10 rounded-lg",
        "icon-sm": "h-8 w-8 rounded-md",
        "icon-lg": "h-12 w-12 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
