import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const tabsListVariants = cva(
  "inline-flex items-center justify-center text-muted-foreground transition-all duration-200",
  {
    variants: {
      variant: {
        default: "rounded-xl bg-gray-100 p-1.5",
        underline: "border-b border-gray-200 bg-transparent p-0",
        pills: "gap-2 bg-transparent p-0",
        card: "rounded-xl bg-white shadow-sm border border-gray-200 p-1.5",
      },
      size: {
        sm: "h-9",
        default: "h-11",
        lg: "h-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const tabsTriggerVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-lexend font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ithq-teal focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "rounded-lg px-4 py-2 text-sm data-[state=active]:bg-white data-[state=active]:text-ithq-teal data-[state=active]:shadow-sm data-[state=active]:font-semibold hover:text-ithq-teal/80 hover:bg-white/50",
        underline: "rounded-none border-b-2 border-transparent px-4 py-3 text-sm data-[state=active]:border-ithq-teal data-[state=active]:text-ithq-teal data-[state=active]:font-semibold hover:text-ithq-teal/80 hover:border-ithq-teal/30",
        pills: "rounded-full px-4 py-2 text-sm bg-gray-100 data-[state=active]:bg-ithq-teal data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-gray-200 data-[state=active]:hover:bg-ithq-teal-600",
        card: "rounded-lg px-4 py-2 text-sm data-[state=active]:bg-ithq-teal data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=active]:font-semibold hover:text-ithq-teal/80 hover:bg-ithq-teal/5",
      },
      size: {
        sm: "px-3 py-1.5 text-xs",
        default: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface TabsListProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>,
    VariantProps<typeof tabsListVariants> {}

interface TabsTriggerProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>,
    VariantProps<typeof tabsTriggerVariants> {}

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, variant, size, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(tabsListVariants({ variant, size }), className)}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, variant, size, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(tabsTriggerVariants({ variant, size }), className)}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ithq-teal focus-visible:ring-offset-2 animate-in fade-in-50 duration-200",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
export type { TabsListProps, TabsTriggerProps }
