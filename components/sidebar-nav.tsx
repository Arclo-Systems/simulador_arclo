"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { TrendingUp, Megaphone, PanelLeftClose, PanelLeftOpen, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/modelo-ingresos", label: "Modelo de Ingresos", icon: TrendingUp },
  { href: "/tarifas-publicitarias", label: "Tarifas Publicitarias", icon: Megaphone },
];

export function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r bg-sidebar transition-[width] duration-200 ease-in-out",
        collapsed ? "w-14" : "w-64"
      )}
    >
      <div className={cn(
        "flex items-center border-b border-sidebar-border",
        collapsed ? "justify-center px-2 py-5" : "justify-between px-4 py-5"
      )}>
        {collapsed ? (
          <Link href="/" className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:scale-105 transition-transform">
            A
          </Link>
        ) : (
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold transition-transform group-hover:scale-105">
              A
            </div>
            <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">
              Arclo Simulador
            </span>
          </Link>
        )}
        {!collapsed && <ThemeToggle />}
      </div>

      <nav className={cn("flex-1 space-y-0.5 p-2", collapsed && "px-1.5")} aria-label="Navegación principal">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center rounded-lg text-sm font-medium transition-colors",
                collapsed ? "justify-center p-2.5" : "gap-2.5 px-3 py-2",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>

      <div className={cn("border-t border-sidebar-border space-y-1", collapsed ? "p-1.5" : "px-3 py-2")}>
        {collapsed && (
          <div className="flex justify-center mb-1.5">
            <ThemeToggle />
          </div>
        )}
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "sm"}
          className={cn(
            "text-muted-foreground hover:text-foreground",
            collapsed ? "h-8 w-8 mx-auto flex" : "w-full justify-start gap-2"
          )}
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
          ) : (
            <>
              <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
              <span className="text-xs">Colapsar</span>
            </>
          )}
        </Button>
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "sm"}
          className={cn(
            "text-muted-foreground hover:text-destructive",
            collapsed ? "h-8 w-8 mx-auto flex" : "w-full justify-start gap-2"
          )}
          onClick={handleLogout}
          aria-label="Cerrar sesión"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          {!collapsed && <span className="text-xs">Cerrar sesión</span>}
        </Button>
      </div>
    </aside>
  );
}
