"use client";
import { ReactNode, useState } from "react";
import { Sidebar } from "@/components/navigation/Sidebar";
import { Topbar } from "@/components/navigation/Topbar";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
  withTopbar?: boolean;
  className?: string;
}

export function DashboardLayout({
  children,
  withTopbar = true,
  className,
}: DashboardLayoutProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="flex flex-1 flex-col min-w-0">
        {withTopbar && <Topbar onMenu={() => setOpen((o) => !o)} />}
        <main
          className={cn(
            "flex-1 w-full px-4 sm:px-6 lg:px-10 py-8 overflow-x-hidden",
            className
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}