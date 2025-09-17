export type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

import {
  Home,
  Users,
  UserPlus,
  CalendarDays,
  Settings,
  Stethoscope,
} from "lucide-react";

export const dashboardNav: NavItem[] = [
  { label: "Inicio", href: "/dashboard", icon: Home },
  { label: "Pacientes", href: "/patients", icon: Users },
  { label: "Médicos", href: "/doctors", icon: Stethoscope },
  { label: "Citas", href: "/appointments", icon: CalendarDays },
  { label: "Nuevo Paciente", href: "/patients/new", icon: UserPlus },
  { label: "Configuración", href: "/settings", icon: Settings },
];