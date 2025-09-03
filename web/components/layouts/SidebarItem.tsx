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
        "flex items-center gap-3 px-5 py-2 rounded transition-colors hover:bg-teal-800 focus:bg-teal-900 outline-none",
        active && "bg-teal-900 font-bold",
        collapsed && "justify-center px-2"
      )}
      aria-current={active ? "page" : undefined}
    >
      <span className="text-xl">{icon}</span>
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}