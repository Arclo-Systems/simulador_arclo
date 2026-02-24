import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Simulador Financiero</h1>
        <p className="mt-2 text-muted-foreground">
          Arclo Systems — Herramientas de proyección financiera
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Link href="/modelo-ingresos">
          <Card className="cursor-pointer transition-shadow hover:shadow-lg">
            <CardHeader>
              <CardTitle>Modelo de Ingresos</CardTitle>
              <CardDescription>
                Proyección financiera basada en usuarios por plan, pack y período.
                Incluye cálculo de ISR, IVA, comisiones y dividendos.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/tarifas-publicitarias">
          <Card className="cursor-pointer transition-shadow hover:shadow-lg">
            <CardHeader>
              <CardTitle>Tarifas Publicitarias</CardTitle>
              <CardDescription>
                Calculadora de precios de pauta publicitaria por tiempo,
                impresiones (CPM) y clics (CPC).
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
