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
  status: string;
  efficiency: number | null;
}

interface ProductionRecord {
  timestamp: string;
  machineId: number;
  quantity: number;
}

interface Incident {
  id: number;
  machineId: number | null;
  machine: string | null;
  severity: string;
  message: string;
  startedAt: string;
  resolved: boolean | null;
}

export default function Home() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [history, setHistory] = useState<ProductionRecord[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [isIncidentsModalOpen, setIsIncidentsModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("https://test-api.ad6.com/api/machines").then((res) => res.json()),
      fetch("https://test-api.ad6.com/api/production-history").then((res) => res.json()),
      fetch("https://test-api.ad6.com/api/incidents").then((res) => res.json()),
    ])
        .then(([machinesData, historyData, incidentsData]) => {
          setMachines(Array.isArray(machinesData) ? machinesData : machinesData.machines || []);
          setHistory(Array.isArray(historyData) ? historyData : historyData.history || []);
          setIncidents(Array.isArray(incidentsData) ? incidentsData : incidentsData.incidents || []);
          setLoading(false);
        })
        .catch(() => {
          setError("Erreur lors de la récupération des données de l'API");
          setLoading(false);
        });
  }, []);

  const machineHistory = selectedMachine
      ? history.filter((item) => item.machineId === selectedMachine.id)
      : [];

  const machineIncidents = selectedMachine
      ? incidents.filter((inc) => inc.machineId === selectedMachine.id)
      : [];

  const activeIncidentsCount = incidents.filter((i) => !i.resolved).length;

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

          {/* En-tête avec bouton d'accès direct aux incidents */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard Usine - Albert Deloin</h1>
              <p className="text-slate-400">Supervision en direct de la production et des équipements.</p>
            </div>

            <button
                onClick={() => setIsIncidentsModalOpen(true)}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-md"
            >
              <span>🚨 Journal des Incidents</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeIncidentsCount > 0 ? "bg-rose-500 text-white animate-pulse" : "bg-slate-700 text-slate-300"
              }`}>
              {activeIncidentsCount}
            </span>
            </button>
          </div>

          {/* BANNIÈRE D'ALERTE RAPIDE EN HAUT SI INCIDENTS ACTIFS */}
          {activeIncidentsCount > 0 && (
              <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              </span>
                  <div>
                    <p className="font-semibold text-rose-300">
                      ⚠️ {activeIncidentsCount} incident(s) actif(s) en cours
                    </p>
                    <p className="text-xs text-rose-400/80">Des pannes ou alertes nécessitent une intervention rapide.</p>
                  </div>
                </div>
                <button
                    onClick={() => setIsIncidentsModalOpen(true)}
                    className="text-xs bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 px-4 py-2 rounded-lg border border-rose-500/30 font-medium transition-colors"
                >
                  Ouvrir le journal ↗
                </button>
              </div>
          )}

          {/* Tableau principal des machines */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Parc Machines</h2>
              {loading && <span className="text-xs text-amber-400 animate-pulse">Chargement...</span>}
            </div>

            {error && (
                <div className="p-6 text-rose-400">Erreur : {error}.</div>
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
                {machines.map((machine) => {
                  const hasActiveIncident = incidents.some(
                      (i) => i.machineId === machine.id && !i.resolved
                  );

                  return (
                      <tr
                          key={machine.id}
                          onClick={() => setSelectedMachine(machine)}
                          className="hover:bg-slate-700/50 cursor-pointer transition-colors"
                      >
                        <td className="p-4 font-medium flex items-center gap-2">
                          {machine.name}
                          {hasActiveIncident && (
                              <span className="bg-rose-500/20 text-rose-400 text-[10px] px-2 py-0.5 rounded-full border border-rose-500/30 animate-pulse font-semibold">
                            ⚠️ Alerte
                          </span>
                          )}
                        </td>
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
                  );
                })}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* POPUP 1 : FICHE ET DÉTAILS D'UNE MACHINE */}
        {selectedMachine && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start border-b border-slate-700 pb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white">{selectedMachine.name}</h3>
                    <p className="text-sm text-slate-400">
                      {selectedMachine.type} • Atelier : {selectedMachine.workshop}
                    </p>
                  </div>
                  <button
                      onClick={() => setSelectedMachine(null)}
                      className="text-slate-400 hover:text-white bg-slate-700/50 hover:bg-slate-700 p-2 rounded-full transition-colors"
                  >
                    ✕
                  </button>
                </div>

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

                <div>
                  <h4 className="text-sm font-semibold text-slate-300 mb-3">Historique de production</h4>
                  <div className="h-56 bg-slate-900/40 p-4 rounded-xl border border-slate-700/50 flex items-center justify-center">
                    {machineHistory.length > 0 ? (
                        <Line data={modalChartData} options={chartOptions} />
                    ) : (
                        <p className="text-slate-400 text-sm">Aucun historique de production disponible pour cette machine.</p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-300 mb-3">Incidents associés</h4>
                  {machineIncidents.length > 0 ? (
                      <div className="space-y-2">
                        {machineIncidents.map((inc) => (
                            <div key={inc.id} className="bg-slate-900/50 p-3 rounded-xl border border-slate-700/50 flex justify-between items-center text-sm">
                              <div>
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold uppercase mr-2 ${
                            inc.severity === "critical" ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        }`}>
                          {inc.severity}
                        </span>
                                <span className="text-slate-200">{inc.message}</span>
                              </div>
                              <span className={`text-xs font-semibold ${inc.resolved ? "text-emerald-400" : "text-rose-400"}`}>
                        {inc.resolved ? "Résolu" : "En cours ⚠️"}
                      </span>
                            </div>
                        ))}
                      </div>
                  ) : (
                      <p className="text-slate-400 text-xs bg-slate-900/30 p-3 rounded-xl border border-slate-700/50">
                        Aucun incident pour cette machine.
                      </p>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                      onClick={() => setSelectedMachine(null)}
                      className="bg-slate-700 hover:bg-slate-600 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
        )}

        {/* POPUP 2 : POPUP DU JOURNAL DES INCIDENTS DE L'USINE */}
        {isIncidentsModalOpen && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">

                <div className="flex justify-between items-start border-b border-slate-700 pb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                      <span>🚨 Journal des Incidents</span>
                    </h3>
                    <p className="text-sm text-slate-400">
                      Aperçu complet des pannes, maintenances et alertes usine.
                    </p>
                  </div>
                  <button
                      onClick={() => setIsIncidentsModalOpen(false)}
                      className="text-slate-400 hover:text-white bg-slate-700/50 hover:bg-slate-700 p-2 rounded-full transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-700/60">
                  <table className="w-full text-left border-collapse">
                    <thead>
                    <tr className="bg-slate-900/80 text-slate-400 text-xs uppercase">
                      <th className="p-3">Sévérité</th>
                      <th className="p-3">Machine</th>
                      <th className="p-3">Message</th>
                      <th className="p-3">Heure</th>
                      <th className="p-3">État</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/60 text-sm">
                    {incidents.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-6 text-center text-slate-400">Aucun incident enregistré.</td>
                        </tr>
                    )}
                    {incidents.map((incident) => (
                        <tr key={incident.id} className={`hover:bg-slate-700/40 ${!incident.resolved ? "bg-rose-950/10" : ""}`}>
                          <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase ${
                            incident.severity === "critical"
                                ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                                : incident.severity === "warning"
                                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                    : "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                        }`}>
                          {incident.severity}
                        </span>
                          </td>
                          <td className="p-3 font-semibold text-white">{incident.machine || "Système Général"}</td>
                          <td className="p-3 text-slate-200">{incident.message}</td>
                          <td className="p-3 text-slate-400 text-xs">
                            {incident.startedAt ? incident.startedAt.replace("T", " ") : "N/A"}
                          </td>
                          <td className="p-3">
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                            incident.resolved === true
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse"
                        }`}>
                          {incident.resolved === true ? "Résolu" : "En cours ⚠️"}
                        </span>
                          </td>
                        </tr>
                    ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                      onClick={() => setIsIncidentsModalOpen(false)}
                      className="bg-slate-700 hover:bg-slate-600 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors">
                    Fermer
                  </button>
                </div>

              </div>
            </div>
        )}

      </main>
  );
}