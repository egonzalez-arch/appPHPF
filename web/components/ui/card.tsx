import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Card component for displaying content in a styled container.
 * Usa forwardRef para compatibilidad con librerías externas.
 */
export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border bg-card text-card-foreground shadow",
        className
      )}
      {...props}
    />
  )
);

Card.displayName = "Card";