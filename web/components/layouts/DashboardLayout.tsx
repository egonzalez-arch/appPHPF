"use client";
import { ReactNode } from "react";
import { Sidebar } from "@/components/navigation/Sidebar";
import { Topbar } from "@/components/navigation/Topbar";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
  withTopbar?: boolean;
  className?: string;
}

export const DashboardLayout = ({
  children,
  withTopbar = true,
  className,
}: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Sidebar />
      <div className="lg:pl-60 flex flex-col min-h-screen">
        {withTopbar && <Topbar />}
        <main
            className={cn(
              "flex-1 p-5 md:p-8 w-full max-w-7xl mx-auto",
              className
            )}
        >
          {children}
        </main>
      </div>
    </div>
  );
};