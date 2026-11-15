import { cva, type VariantProps } from "class-variance-authority"
import { forwardRef } from "react"
import { cn } from "@/lib/utils"

const button = cva(
  // Note: transitions are scoped to colour/filter/shadow — NOT `transition-all`.
  // `transform` is owned by GSAP here (magnetic hover, reveal tweens), and a CSS
  // transition on transform fights the tween: the browser eases toward each
  // GSAP frame, which reads as a rubber-banding lag behind the cursor.
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-[background-color,color,border-color,filter,box-shadow] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "bg-accent text-ink hover:brightness-110",
        outline: "border border-white/20 text-paper hover:bg-white/10",
        ghost: "text-paper/70 hover:text-paper hover:bg-white/5",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-sm",
        lg: "h-14 px-8 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(button({ variant, size }), className)} {...props} />
  )
)
Button.displayName = "Button"
