"use client";
import { FactoryData } from "@/dataTest/FactoryData";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

// Enregistrement des composants Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function Home() {
  const { kpis, machines, productionHistory } = FactoryData;

  // <--- C'EST ICI QU'ON PLACE TON CODE DE CONFIGURATION DU GRAPHIQUE ! --->
  const chartData = {
    labels: productionHistory.map((item) => item.time),
    datasets: [
      {
        fill: true,
        label: "Production (unités)",
        data: productionHistory.map((item) => item.production),
        borderColor: "rgb(56, 189, 248)",
        backgroundColor: "rgba(56, 189, 248, 0.1)",
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "#94a3b8",
        },
      },
    },
    scales: {
      x: {
        grid: { color: "#334155" },
        ticks: { color: "#94a3b8" },
      },
      y: {
        grid: { color: "#334155" },
        ticks: { color: "#94a3b8" },
      },
    },
  };

  return (
      <main className="min-h-screen bg-slate-900 text-slate-100 p-8">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* En-tête */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard Usine - Albert Deloin</h1>
            <p className="text-slate-400">Suivi en temps réel de la production et des équipements.</p>
          </div>

          {/* Cartes KPI */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
              <p className="text-sm text-slate-400">Machines Actives</p>
              <p className="text-3xl font-bold text-emerald-400 mt-2">{kpis.activeMachines} / {kpis.totalMachines}</p>
            </div>
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
              <p className="text-sm text-slate-400">Rendement Global</p>
              <p className="text-3xl font-bold text-sky-400 mt-2">{kpis.globalEfficiency}</p>
            </div>
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
              <p className="text-sm text-slate-400">Production du jour</p>
              <p className="text-3xl font-bold text-purple-400 mt-2">{kpis.totalProductionToday}</p>
            </div>
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
              <p className="text-sm text-slate-400">Alertes en cours</p>
              <p className="text-3xl font-bold text-amber-400 mt-2">{kpis.warningMachines + kpis.stoppedMachines}</p>
            </div>
          </div>

          {/* Section Graphique */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-slate-800 p-6 rounded-xl border border-slate-700">
              <h2 className="text-xl font-semibold mb-4">Évolution de la Production</h2>
              <div className="h-72 flex items-center justify-center">
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>

            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">État Global</h2>
                <p className="text-sm text-slate-400 mb-4">Synthèse rapide de l'atelier principal.</p>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg">
                  <span className="text-slate-300">En fonctionnement</span>
                  <span className="font-bold text-emerald-400">{kpis.activeMachines}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg">
                  <span className="text-slate-300">En maintenance / Alerte</span>
                  <span className="font-bold text-amber-400">{kpis.warningMachines}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg">
                  <span className="text-slate-300">À l'arrêt</span>
                  <span className="font-bold text-rose-400">{kpis.stoppedMachines}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tableau des machines */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-xl font-semibold">État Détaillé des Machines</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                <tr className="bg-slate-900/50 text-slate-400 text-sm">
                  <th className="p-4">Nom</th>
                  <th className="p-4">Statut</th>
                  <th className="p-4">Température</th>
                  <th className="p-4">Cadence (pcs/h)</th>
                  <th className="p-4">Efficacité</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-700 text-sm">
                {machines.map((machine) => (
                    <tr key={machine.id} className="hover:bg-slate-700/50">
                      <td className="p-4 font-medium">{machine.name}</td>
                      <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          machine.status === "RUNNING" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                              machine.status === "WARNING" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                                  "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}>
                        {machine.status}
                      </span>
                      </td>
                      <td className="p-4">{machine.temperature} °C</td>
                      <td className="p-4">{machine.productionRate}</td>
                      <td className="p-4">{machine.efficiency}%</td>
                    </tr>
                ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
  );
}