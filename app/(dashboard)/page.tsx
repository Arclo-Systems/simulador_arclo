import Link from "next/link";
import { TrendingUp, Megaphone } from "lucide-react";

const SIMULADORES = [
  {
    href: "/modelo-ingresos",
    title: "Modelo de Ingresos",
    description:
      "Proyección financiera basada en usuarios por plan, pack y período. Incluye cálculo de ISR, IVA, comisiones y dividendos.",
    icon: TrendingUp,
    gradient: "from-teal-500/20 to-emerald-500/20 dark:from-teal-500/10 dark:to-emerald-500/10",
    iconBg: "bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300",
  },
  {
    href: "/tarifas-publicitarias",
    title: "Tarifas Publicitarias",
    description:
      "Calculadora de precios de pauta publicitaria por tiempo, impresiones (CPM) y clics (CPC).",
    icon: Megaphone,
    gradient: "from-amber-500/20 to-orange-500/20 dark:from-amber-500/10 dark:to-orange-500/10",
    iconBg: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-3xl py-12">
      <div className="animate-fade-in-up mb-12">
        <p className="text-sm font-medium tracking-widest uppercase text-primary mb-2">
          Arclo Systems
        </p>
        <h1 className="text-4xl font-bold tracking-tight">
          Simulador Financiero
        </h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-xl">
          Herramientas de proyección financiera para startup tecnológica S.A. PYME Costa Rica.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {SIMULADORES.map((sim, i) => {
          const Icon = sim.icon;
          return (
            <Link
              key={sim.href}
              href={sim.href}
              className={`animate-fade-in-up stagger-${i + 1} group relative flex flex-col gap-4 rounded-xl border bg-card p-6 transition-all hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5`}
            >
              <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${sim.gradient} opacity-0 transition-opacity group-hover:opacity-100`} />
              <div className="relative flex items-start gap-4">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${sim.iconBg}`}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-base font-semibold">{sim.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                    {sim.description}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
