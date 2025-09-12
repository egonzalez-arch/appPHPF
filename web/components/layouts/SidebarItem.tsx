import Link from "next/link";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
  href: string;
  label: string;
  icon?: React.ReactNode;
  active?: boolean;
  collapsed?: boolean;
}

export function SidebarItem({ href, label, icon, active, collapsed }: SidebarItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-4 px-4 py-3 mx-2 rounded-lg transition-all duration-200 hover:bg-gray-800 focus:bg-gray-700 outline-none group",
        active && "bg-gray-800 text-white font-semibold",
        collapsed && "justify-center px-2"
      )}
      aria-current={active ? "page" : undefined}
    >
      <span className={cn(
        "text-gray-300 group-hover:text-white transition-colors",
        active && "text-white",
        collapsed ? "text-2xl" : "text-xl"
      )}>
        {icon}
      </span>
      {!collapsed && (
        <span className={cn(
          "truncate text-sm font-medium text-gray-300 group-hover:text-white transition-colors",
          active && "text-white"
        )}>
          {label}
        </span>
      )}
    </Link>
  );
}