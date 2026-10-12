"use client";

import { useEffect, useState } from "react";

// Mise à jour de l'interface selon le format exact de l'API
interface Machine {
  id: number;
  name: string;
  type: string;
  workshop: string;
  status: string; // "running" | "stopped" | "maintenance" | "unknown"
  efficiency: number | null;
}

export default function Home() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("https://test-api.ad6.com/api/machines")
        .then((res) => {
          if (!res.ok) {
            throw new Error("Erreur lors de la récupération des machines");
          }
          return res.json();
        })
        .then((data) => {
          setMachines(Array.isArray(data) ? data : data.machines || []);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
  }, []);



  return (
      <main className="min-h-screen bg-slate-900 text-slate-100 p-8">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* En-tête */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard Usine - Albert Deloin</h1>
            <p className="text-slate-400">Connexion en direct à l'API AD6 (/api/machines).</p>
          </div>

          {/* Tableau des machines connecté à l'API */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
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
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-700 text-sm">
                {!loading && machines.length === 0 && !error && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-400">Aucune machine trouvée.</td>
                    </tr>
                )}
                {machines.map((machine) => (
                    <tr key={machine.id} className="hover:bg-slate-700/50">
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