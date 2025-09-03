
import React from 'react';
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const xmButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:-translate-y-0.5 active:translate-y-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-primary text-primary-foreground hover:shadow-trading hover:bg-primary-hover border border-primary/20",
        destructive: "bg-gradient-danger text-destructive-foreground hover:shadow-trading hover:bg-destructive/90 border border-destructive/20",
        outline: "border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground hover:shadow-trading",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-secondary/20",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        primary: "bg-gradient-primary text-primary-foreground hover:shadow-trading shadow-lg",
        danger: "bg-gradient-danger text-danger-foreground hover:shadow-trading shadow-lg"
      },
      size: {
        default: "h-11 px-6 py-3",
        sm: "h-9 rounded-md px-4 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface XMButtonProps extends Omit<ButtonProps, 'variant' | 'size'>, VariantProps<typeof xmButtonVariants> {
  hover?: boolean;
}

export const XMButton = React.forwardRef<HTMLButtonElement, XMButtonProps>(
  ({ className, variant, size, hover = false, ...props }, ref) => {
    return (
      <Button
        className={cn(
          xmButtonVariants({ variant, size, className }),
          hover && "transform hover:scale-105 transition-transform duration-200"
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

XMButton.displayName = "XMButton";
