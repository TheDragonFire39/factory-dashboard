export interface Machine {
    id: string;
    name: string;
    status: "RUNNING" | "STOPPED" | "WARNING";
    temperature: number;
    productionRate: number;
    efficiency: number;
}

export const FactoryData = {
    kpis: {
        totalMachines: 12,
        activeMachines: 9,
        warningMachines: 2,
        stoppedMachines: 1,
        globalEfficiency: "88.4%",
        totalProductionToday: "4,580 unités",
    },
    machines: [
        { id: "M-01", name: "Ligne d'assemblage A", status: "RUNNING", temperature: 68, productionRate: 120, efficiency: 92 },
        { id: "M-02", name: "Four de cuisson B", status: "WARNING", temperature: 215, productionRate: 85, efficiency: 74 },
        { id: "M-03", name: "Presse hydraulique C", status: "RUNNING", temperature: 54, productionRate: 200, efficiency: 95 },
        { id: "M-04", name: "Robot de soudage D", status: "STOPPED", temperature: 25, productionRate: 0, efficiency: 0 },
        { id: "M-05", name: "Emballage automatique E", status: "RUNNING", temperature: 42, productionRate: 150, efficiency: 89 },
    ] as Machine[],
    productionHistory: [
        { time: "08:00", production: 400 },
        { time: "10:00", production: 650 },
        { time: "12:00", production: 590 },
        { time: "14:00", production: 810 },
        { time: "16:00", production: 760 },
    ]
};