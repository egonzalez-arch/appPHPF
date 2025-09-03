import * as React from "react";
import { cn } from "@/lib/utils";

export interface NavigationMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "vertical" | "horizontal";
  children: React.ReactNode;
}

export function NavigationMenu({
  className,
  orientation = "vertical",
  children,
  ...props
}: NavigationMenuProps) {
  return (
    <nav
      className={cn(
        orientation === "vertical"
          ? "flex flex-col gap-2"
          : "flex flex-row gap-4",
        className
      )}
      {...props}
    >
      {children}
    </nav>
  );
}