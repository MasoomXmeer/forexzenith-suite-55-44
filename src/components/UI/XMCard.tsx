
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface XMCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "trading" | "glass" | "hero";
  hover?: boolean;
  title?: string;
  headerContent?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export const XMCard = ({ 
  children, 
  className,
  variant = "default",
  hover = true,
  title,
  headerContent,
  size = "md"
}: XMCardProps) => {
  const sizeClasses = {
    sm: "p-4",
    md: "p-6", 
    lg: "p-8"
  };

  const variantClasses = {
    default: "xm-card",
    trading: "xm-trading-panel",
    glass: "glass-card",
    hero: "xm-card bg-primary/5 border-primary/20"
  };

  return (
    <Card 
      className={cn(
        "border-0",
        variantClasses[variant],
        hover && "hover:shadow-xl transition-all duration-300 hover:-translate-y-1",
        className
      )}
    >
      {(title || headerContent) && (
        <CardHeader className={cn("pb-4", size === "sm" ? "p-4 pb-2" : "")}>
          {title && (
            <CardTitle className="text-foreground font-bold flex items-center gap-2">
              {title}
            </CardTitle>
          )}
          {headerContent}
        </CardHeader>
      )}
      <CardContent className={cn(
        title || headerContent ? "pt-0" : "",
        sizeClasses[size]
      )}>
        {children}
      </CardContent>
    </Card>
  );
};
