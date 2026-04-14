import React, { useState, useEffect } from 'react';
import { ArrowRight, Clock, ShieldCheck, Activity, PieChart, Workflow, Edit3 } from 'lucide-react';

const ResultsView = ({ results, payload }) => {
    if (!results || !results.assignments || !payload) return null;

    const { worstCaseCost, metadata } = results;
    
    // Sandbox UI State
    const [localAssignments, setLocalAssignments] = useState(results.assignments || []);
    const [liveCost, setLiveCost] = useState(results.totalOptimalCost || 0);

    // Resync if results prop changes from a fresh API call calculation
    useEffect(() => {
        setLocalAssignments(results.assignments || []);
        setLiveCost(results.totalOptimalCost || 0);
    }, [results]);

    const handleTaskChange = (workerName, newTask) => {
        let updatedAssignments = [...localAssignments];

        // 1. If the selected new task is "Unassigned"
        if (newTask === "Unassigned") {
            const index = updatedAssignments.findIndex(a => a.worker === workerName);
            if (index !== -1) {
                updatedAssignments[index].task = "Unassigned";
                updatedAssignments[index].cost = 0;
            }
        } 
        // 2. If assigning a specific task, check for double bookings
        else {
            // Find if any other worker currently has this task and evict them
            const takenIndex = updatedAssignments.findIndex(a => a.task === newTask);
            if (takenIndex !== -1) {
                updatedAssignments[takenIndex].task = "Unassigned";
                updatedAssignments[takenIndex].cost = 0;
            }

            // Assign the task to the current worker
            const workerIndexAssignment = updatedAssignments.findIndex(a => a.worker === workerName);
            if (workerIndexAssignment !== -1) {
                updatedAssignments[workerIndexAssignment].task = newTask;
                
                // Lookup cost in payload baseline matrix
                const pWorkerIdx = payload.workers.indexOf(workerName);
                const pTaskIdx = payload.tasks.indexOf(newTask);
                
                let cost = 0;
                if (pWorkerIdx !== -1 && pTaskIdx !== -1) {
                     const cellCost = parseInt(payload.costMatrix[pWorkerIdx][pTaskIdx]);
                     cost = isNaN(cellCost) ? 0 : cellCost;
                }
                updatedAssignments[workerIndexAssignment].cost = cost;
            }
        }

        // Recalculate Total Live Cost
        let newTotalCost = 0;
        updatedAssignments.forEach(a => newTotalCost += (typeof a.cost === 'number' ? a.cost : 0));

        setLocalAssignments(updatedAssignments);
        setLiveCost(newTotalCost);
    };

    const timeSaved = worstCaseCost - liveCost;
    const efficiencyPercentage = worstCaseCost > 0 
        ? Math.round(((worstCaseCost - liveCost) / worstCaseCost) * 100) 
        : 0;

    return (
        <div className="mt-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Bento Grid Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 border-[3px] border-black col-span-1 md:col-span-2 flex flex-col justify-center relative shadow-[8px_8px_0px_#000]">
                    <h2 className="text-xs font-mono font-bold tracking-widest text-zinc-500 uppercase mb-2 flex items-center">
                        Total Custom Schedule <Edit3 size={14} className="ml-2 text-black" />
                    </h2>
                    <div className={`text-6xl font-black font-mono tracking-tighter flex items-baseline ${liveCost > results.totalOptimalCost ? 'text-red-600' : 'text-black'}`}>
                        {liveCost.toLocaleString()}
                        <span className="text-xl font-bold text-zinc-400 ml-2">HRS</span>
                    </div>
                    {liveCost > results.totalOptimalCost && (
                        <p className="text-xs text-red-600 font-mono font-bold mt-2 uppercase">
                            [WARNING] +{liveCost - results.totalOptimalCost} Hrs Worse Than Optimal Match
                        </p>
                    )}
                </div>

                <div className={`p-6 border-[3px] border-black flex flex-col justify-center shadow-[8px_8px_0px_transparent] transition-colors duration-500 ${timeSaved < 0 ? 'bg-red-600 text-white shadow-red-900' : 'bg-green-400 text-black shadow-green-900'} `}>
                    <h2 className="text-xs font-mono font-bold tracking-widest uppercase mb-2">Time Avoided</h2>
                    <div className="text-5xl font-black font-mono tracking-tighter flex items-baseline">
                        {timeSaved.toLocaleString()}
                        <span className="text-lg font-bold ml-2">HRS</span>
                    </div>
                </div>

                <div className="bg-black p-6 border-[3px] border-black text-white flex flex-col justify-center shadow-[8px_8px_0px_#d4d4d8]">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xs font-mono font-bold tracking-widest text-zinc-400 uppercase">System Stats</h2>
                        <Activity className="text-zinc-500" size={18} />
                    </div>
                    <div className="space-y-3 font-mono">
                        <div className="flex justify-between items-center text-sm border-b border-zinc-800 pb-2">
                            <span className="text-zinc-400 uppercase">Yield</span>
                            <span className={`font-bold ${efficiencyPercentage < 0 ? 'text-red-400' : 'text-green-400'} transition-colors`}>{efficiencyPercentage > 0 ? '+' : ''}{efficiencyPercentage}%</span>
                        </div>
                        <div className="flex justify-between items-center text-sm border-b border-zinc-800 pb-2">
                            <span className="text-zinc-400 uppercase">Engine</span>
                            <span className="text-zinc-300">{metadata?.complexity || 'O(n³)'}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-zinc-400 uppercase">Ops</span>
                            <span className="text-zinc-300">{metadata?.operations?.toLocaleString() || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Assignments Grid */}
            <div className="bg-zinc-50 border-[3px] border-black p-0 shadow-[8px_8px_0px_#000]">
                <div className="flex items-center justify-between p-6 border-b-[3px] border-black bg-white">
                    <div className="flex items-center space-x-3">
                        <Workflow className="text-black" size={24} />
                        <h3 className="text-2xl font-black text-black uppercase tracking-tight">Dispatch Map</h3>
                    </div>
                    <span className="text-xs font-mono font-bold text-zinc-500 bg-zinc-100 px-3 py-1 uppercase tracking-widest border border-zinc-300">
                        Interactive Sandbox
                    </span>
                </div>

                <div className="max-h-[600px] overflow-y-auto p-6 bg-zinc-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {localAssignments.map((assignment, index) => {
                            const isTaskUnassigned = assignment.task === "Unassigned";
                            const isWorkerUnassigned = assignment.worker === "Unassigned";
                            const isIdle = isTaskUnassigned || isWorkerUnassigned;

                            return (
                                <div 
                                    key={index} 
                                    className={`p-5 flex flex-col justify-between transition-all border-[2px] shadow-[4px_4px_0px_transparent] hover:shadow-[4px_4px_0px_#000] focus-within:shadow-[4px_4px_0px_#4f46e5] ${isIdle ? 'bg-red-50 border-red-600' : 'bg-white border-black'}`}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`font-mono font-bold text-lg uppercase ${isWorkerUnassigned ? 'text-red-600 line-through' : 'text-black'}`}>
                                            {assignment.worker}
                                        </div>
                                        {isIdle ? (
                                            <span className="bg-red-600 text-white text-[10px] uppercase font-bold px-2 py-1 tracking-widest font-mono">Unassigned</span>
                                        ) : (
                                            <span className="bg-black text-white text-[10px] uppercase font-bold px-2 py-1 tracking-widest font-mono">Active</span>
                                        )}
                                    </div>

                                    <div className={`flex items-center space-x-2 mb-6 pb-2 border-b-[2px] ${isIdle ? 'border-red-200' : 'border-zinc-200'}`}>
                                        <ArrowRight size={16} className={`${isIdle ? 'text-red-400' : 'text-zinc-400'}`} />
                                        
                                        <select 
                                            className={`w-full bg-transparent focus:outline-none font-mono font-bold text-sm cursor-pointer uppercase ${isTaskUnassigned ? 'text-red-600' : 'text-zinc-800'}`}
                                            value={assignment.task}
                                            onChange={(e) => handleTaskChange(assignment.worker, e.target.value)}
                                            disabled={isWorkerUnassigned}
                                        >
                                            <option value="Unassigned">-- UNASSIGNED --</option>
                                            {payload.tasks.map((t, i) => (
                                                <option key={i} value={t}>{t}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mt-auto flex items-center justify-between">
                                        <div className="flex items-center space-x-2 text-zinc-500">
                                            <Clock size={14} className={isIdle ? 'text-red-400' : 'text-zinc-400'} />
                                            <span className={`font-mono text-xs uppercase tracking-widest font-bold ${isIdle ? 'text-red-500' : 'text-zinc-500'}`}>Block</span>
                                        </div>
                                        <div className={`font-black font-mono tracking-tighter text-2xl ${isIdle ? 'text-red-500' : 'text-black'}`}>
                                            {isIdle ? '--' : assignment.cost} <span className={`text-[10px] tracking-widest align-top ${isIdle ? 'text-red-400' : 'text-zinc-400'}`}>HRS</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResultsView;
