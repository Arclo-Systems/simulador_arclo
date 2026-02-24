"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";

const NAV_ITEMS = [
  { href: "/modelo-ingresos", label: "Modelo de Ingresos" },
  { href: "/tarifas-publicitarias", label: "Tarifas Publicitarias" },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-card">
      <div className="flex items-center justify-between border-b px-4 py-4">
        <Link href="/" className="text-lg font-bold">
          Arclo Simulador
        </Link>
        <ThemeToggle />
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "block rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent",
              pathname === item.href
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground"
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="border-t p-4 text-xs text-muted-foreground">
        Arclo Systems © 2026
      </div>
    </aside>
  );
}
