"use client";

import { useState } from "react";
import { TarifasTable } from "@/components/tarifas/tarifas-table";
import { Calculadora } from "@/components/tarifas/calculadora";
import {
  TARIFAS_TIEMPO,
  TARIFAS_CPM,
  TARIFAS_CPC,
  DESCUENTO_TODOS_ESPACIOS,
} from "@/lib/constants";
import type { PlanPublicitario, TarifaBase } from "@/types";

export default function TarifasPublicitariasPage() {
  const [tarifasTiempo, setTarifasTiempo] = useState(() => structuredClone(TARIFAS_TIEMPO));
  const [tarifasCPM, setTarifasCPM] = useState(() => structuredClone(TARIFAS_CPM));
  const [tarifasCPC, setTarifasCPC] = useState(() => structuredClone(TARIFAS_CPC));
  const [tipoCambio, setTipoCambio] = useState(485);

  function handleTarifaChange(tipo: PlanPublicitario, audiencia: string, nuevoPrecio: number) {
    const setter = {
      tiempo: setTarifasTiempo,
      cpm: setTarifasCPM,
      cpc: setTarifasCPC,
    }[tipo] as React.Dispatch<React.SetStateAction<Record<string, TarifaBase>>>;

    setter((prev) => ({
      ...prev,
      [audiencia]: { ...prev[audiencia], precioBase: nuevoPrecio },
    }));
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Tarifas Publicitarias</h1>
        <p className="text-muted-foreground">
          Tarifas publicitarias de competencia — Quiziz
        </p>
      </div>

      <TarifasTable
        tarifasTiempo={tarifasTiempo}
        tarifasCPM={tarifasCPM}
        tarifasCPC={tarifasCPC}
        onTarifaChange={handleTarifaChange}
        descuento={DESCUENTO_TODOS_ESPACIOS}
      />

      <Calculadora
        tipoCambio={tipoCambio}
        onTipoCambioChange={setTipoCambio}
      />
    </div>
  );
}
