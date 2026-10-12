"use client";

import { useEffect, useState } from "react";
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

interface Machine {
  id: number;
  name: string;
  type: string;
  workshop: string;
  status: string; // "running" | "stopped" | "maintenance" | "unknown"
  efficiency: number | null;
}

interface ProductionRecord {
  timestamp: string;
  machineId: number;
  quantity: number;
}

export default function Home() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [history, setHistory] = useState<ProductionRecord[]>([]);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Récupération simultanée des machines et de l'historique de production
  useEffect(() => {
    Promise.all([
      fetch("https://test-api.ad6.com/api/machines").then((res) => res.json()),
      fetch("https://test-api.ad6.com/api/production-history").then((res) => res.json()),
    ])
        .then(([machinesData, historyData]) => {
          setMachines(Array.isArray(machinesData) ? machinesData : machinesData.machines || []);
          setHistory(Array.isArray(historyData) ? historyData : historyData.history || []);
          setLoading(false);
        })
        .catch((err) => {
          setError("Erreur lors de la récupération des données de l'API");
          setLoading(false);
        });
  }, []);

  // Filtrer l'historique pour la machine sélectionnée
  const machineHistory = selectedMachine
      ? history.filter((item) => item.machineId === selectedMachine.id)
      : [];

  // Configuration du graphique de la modale
  const modalChartData = {
    labels: machineHistory.map((item) => {
      const timePart = item.timestamp.split("T")[1];
      return timePart ? timePart.substring(0, 5) : item.timestamp;
    }),
    datasets: [
      {
        fill: true,
        label: "Quantité produite",
        data: machineHistory.map((item) => item.quantity),
        borderColor: "rgb(56, 189, 248)",
        backgroundColor: "rgba(56, 189, 248, 0.1)",
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { grid: { color: "#334155" }, ticks: { color: "#94a3b8" } },
      y: { grid: { color: "#334155" }, ticks: { color: "#94a3b8" } },
    },
  };

  return (
      <main className="min-h-screen bg-slate-900 text-slate-100 p-8 relative">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* En-tête */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard Usine - Albert Deloin</h1>
            <p className="text-slate-400">Cliquez sur une "Voir stats" pour afficher son historique de production.</p>
          </div>

          {/* Tableau des machines connecté à l'API */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Parc Machines (API en direct)</h2>
              {loading && <span className="text-xs text-amber-400 animate-pulse">Chargement...</span>}
            </div>

            {error && (
                <div className="p-6 text-rose-400">
                  Erreur : {error}.
                </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                <tr className="bg-slate-900/50 text-slate-400 text-sm">
                  <th className="p-4">Nom</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Atelier</th>
                  <th className="p-4">Statut</th>
                  <th className="p-4">Efficacité</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-700 text-sm">
                {!loading && machines.length === 0 && !error && (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-400">Aucune machine trouvée.</td>
                    </tr>
                )}
                {machines.map((machine) => (
                    <tr
                        key={machine.id}
                        onClick={() => setSelectedMachine(machine)}
                        className="hover:bg-slate-700/50 cursor-pointer transition-colors"
                    >
                      <td className="p-4 font-medium">{machine.name}</td>
                      <td className="p-4 text-slate-300">{machine.type}</td>
                      <td className="p-4 text-slate-300">{machine.workshop}</td>
                      <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                          machine.status === "running"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : machine.status === "maintenance"
                                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                  : machine.status === "stopped"
                                      ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                      : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                      }`}>
                        {machine.status}
                      </span>
                      </td>
                      <td className="p-4">
                        {machine.efficiency !== null ? `${machine.efficiency}%` : "N/A"}
                      </td>
                      <td className="p-4 text-right">
                        <button className="text-xs bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 px-3 py-1.5 rounded transition-colors">
                          Voir stats
                        </button>
                      </td>
                    </tr>
                ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* POPUP / MODALE DE DÉTAIL DE LA MACHINE */}
        {selectedMachine && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative">

                {/* En-tête de la modale */}
                <div className="flex justify-between items-start border-b border-slate-700 pb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white">{selectedMachine.name}</h3>
                    <p className="text-sm text-slate-400">
                      {selectedMachine.type} • Atelier : {selectedMachine.workshop}
                    </p>
                  </div>
                </div>

                {/* Infos rapides */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                    <p className="text-xs text-slate-400">Statut actuel</p>
                    <p className="text-lg font-bold uppercase mt-1 text-sky-400">{selectedMachine.status}</p>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                    <p className="text-xs text-slate-400">Efficacité</p>
                    <p className="text-lg font-bold mt-1 text-emerald-400">
                      {selectedMachine.efficiency !== null ? `${selectedMachine.efficiency}%` : "N/A"}
                    </p>
                  </div>
                </div>

                {/* Graphique de la modale */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-300 mb-3">Historique de production</h4>
                  <div className="h-64 bg-slate-900/40 p-4 rounded-xl border border-slate-700/50 flex items-center justify-center">
                    {machineHistory.length > 0 ? (
                        <Line data={modalChartData} options={chartOptions} />
                    ) : (
                        <p className="text-slate-400 text-sm">Aucun historique de production disponible pour cette machine.</p>
                    )}
                  </div>
                </div>



              </div>
            </div>
        )}

      </main>
  );
}