import React, { useState } from 'react';
import { PlusCircle, Trash2, Dices, Star, Zap } from 'lucide-react';

const MatrixInput = ({ onCalculate, isCalculating, calcStage }) => {
    // Initial dynamic state
    const [workers, setWorkers] = useState(['Alice', 'Bob', 'Charlie', 'Diana', 'Ethan', 'Fiona', 'George']);
    const [tasks, setTasks] = useState(['Backend', 'Frontend', 'Database', 'DevOps', 'Design', 'QA', 'Management']);
    const [priorityWorkers, setPriorityWorkers] = useState([]);
    const [priorityTasks, setPriorityTasks] = useState([]);
    const [urgentTasks, setUrgentTasks] = useState([]);
    
    // costMatrix[workerIndex][taskIndex]
    const [costMatrix, setCostMatrix] = useState([
        [17, 34, 49, 11, 63, 29, 41],
        [24, 19, 37, 58, 42, 13, 31],
        [43, 27, 14, 33, 21, 52, 19],
        [36, 47, 26, 23, 16, 39, 53],
        [13, 51, 34, 44, 27, 17, 59],
        [29, 16, 57, 39, 46, 24, 11],
        [52, 41, 21, 13, 37, 62, 26]
    ]);

    const addWorker = () => {
        setWorkers([...workers, `Worker ${workers.length + 1}`]);
        setCostMatrix([...costMatrix, new Array(tasks.length).fill(0)]);
    };

    const addTask = () => {
        setTasks([...tasks, `Task ${tasks.length + 1}`]);
        setCostMatrix(costMatrix.map(row => [...row, 0]));
    };

    const shuffleMatrix = () => {
        setCostMatrix(costMatrix.map(row => row.map(() => {
            let num;
            do {
                num = Math.floor(Math.random() * 89) + 11;
            } while (num % 5 === 0);
            return num;
        })));
    };

    const removeWorker = (wIndex) => {
        if (workers.length <= 1) return; // Prevent removing last worker
        setWorkers(workers.filter((_, i) => i !== wIndex));
        setCostMatrix(costMatrix.filter((_, i) => i !== wIndex));
    };

    const removeTask = (tIndex) => {
        if (tasks.length <= 1) return; // Prevent removing last task
        setTasks(tasks.filter((_, i) => i !== tIndex));
        setCostMatrix(costMatrix.map(row => row.filter((_, i) => i !== tIndex)));
    };

    const updateWorkerName = (wIndex, newName) => {
        const newWorkers = [...workers];
        newWorkers[wIndex] = newName;
        setWorkers(newWorkers);
    };

    const updateTaskName = (tIndex, newName) => {
        const newTasks = [...tasks];
        newTasks[tIndex] = newName;
        setTasks(newTasks);
    };

    const updateCost = (wIndex, tIndex, value) => {
        const parsed = parseInt(value, 10);
        const newMatrix = [...costMatrix];
        newMatrix[wIndex][tIndex] = isNaN(parsed) ? 0 : parsed;
        setCostMatrix(newMatrix);
    };

    const togglePriorityWorker = (workerName) => {
        setPriorityWorkers(prev => 
            prev.includes(workerName) ? prev.filter(n => n !== workerName) : [...prev, workerName]
        );
    };

    const togglePriorityTask = (taskName) => {
        setPriorityTasks(prev => 
            prev.includes(taskName) ? prev.filter(n => n !== taskName) : [...prev, taskName]
        );
    };

    const toggleUrgentTask = (taskName) => {
        setUrgentTasks(prev => 
            prev.includes(taskName) ? prev.filter(n => n !== taskName) : [...prev, taskName]
        );
    };

    const handleCalculate = () => {
        onCalculate({ workers, tasks, costMatrix, priorityWorkers, priorityTasks, urgentTasks });
    };

    return (
        <div className="bg-white border-[3px] border-black p-0 overscroll-contain shadow-[8px_8px_0px_#000]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b-[3px] border-black bg-zinc-50">
                <div>
                    <h2 className="text-2xl font-black text-black uppercase tracking-tight">Resource Matrix</h2>
                    <p className="text-sm font-mono text-zinc-600">DEFINE LEDGER BOUNDARIES</p>
                </div>
                <div className="flex space-x-3 mt-4 sm:mt-0 font-mono">
                    <button 
                        onClick={addWorker}
                        className="flex items-center space-x-1 px-4 py-2 bg-white border-[2px] border-black hover:bg-black hover:text-white text-black text-sm font-bold uppercase transition-all"
                    >
                        <PlusCircle size={14} />
                        <span>Worker</span>
                    </button>
                    <button 
                        onClick={addTask}
                        className="flex items-center space-x-1 px-4 py-2 bg-white border-[2px] border-black hover:bg-black hover:text-white text-black text-sm font-bold uppercase transition-all"
                    >
                        <PlusCircle size={14} />
                        <span>Task</span>
                    </button>
                    <button 
                        onClick={shuffleMatrix}
                        className="flex items-center space-x-1 px-4 py-2 bg-indigo-50 border-[2px] border-indigo-600 hover:bg-indigo-600 hover:text-white text-indigo-700 text-sm font-bold uppercase transition-all"
                    >
                        <Dices size={14} />
                        <span>Shuffle</span>
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto overflow-y-auto max-h-[500px]">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-white z-10 border-b-[3px] border-black shadow-sm">
                        <tr>
                            <th className="p-4 border-r-[2px] border-black bg-zinc-100 font-mono font-bold text-black uppercase text-xs tracking-widest min-w-[200px]">
                                Variables\Weights
                            </th>
                            {tasks.map((task, tIndex) => (
                                <th key={`header-t${tIndex}`} className="p-3 border-r-[2px] border-black bg-zinc-50 min-w-[150px]">
                                    <div className="flex items-center justify-between font-mono">
                                        <input 
                                            type="text" 
                                            value={task} 
                                            onChange={e => updateTaskName(tIndex, e.target.value)}
                                            className="w-full bg-transparent border-none focus:outline-none focus:bg-white focus:ring-2 ring-black px-2 py-1 text-black font-bold uppercase text-sm"
                                        />
                                        <div className="flex items-center space-x-2 ml-2">
                                            <button 
                                                onClick={() => togglePriorityTask(task)}
                                                className={`transition-colors ${priorityTasks.includes(task) ? 'text-yellow-500 fill-yellow-500' : 'text-zinc-300 hover:text-black'}`}
                                                title="Guarantee Priority"
                                            >
                                                <Star size={16} fill={priorityTasks.includes(task) ? "currentColor" : "none"} />
                                            </button>
                                            <button 
                                                onClick={() => toggleUrgentTask(task)}
                                                className={`transition-colors ${urgentTasks.includes(task) ? 'text-orange-500 fill-orange-500 drop-shadow-[0_0_2px_#f97316]' : 'text-zinc-300 hover:text-black'}`}
                                                title="Urgency Pre-Processor"
                                            >
                                                <Zap size={16} fill={urgentTasks.includes(task) ? "currentColor" : "none"} />
                                            </button>
                                            <button 
                                                onClick={() => removeTask(tIndex)}
                                                className="text-zinc-400 hover:text-red-600 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="font-mono text-sm">
                        {workers.map((worker, wIndex) => (
                            <tr key={`row-w${wIndex}`} className="bg-white hover:bg-black/5 transition-colors group">
                                <td className="p-3 border-b-[2px] border-r-[2px] border-zinc-200 font-bold text-black bg-zinc-50 group-hover:bg-zinc-100">
                                    <div className="flex items-center justify-between">
                                        <input 
                                            type="text" 
                                            value={worker} 
                                            onChange={e => updateWorkerName(wIndex, e.target.value)}
                                            className="w-full bg-transparent border-none focus:outline-none focus:bg-white focus:border-black px-2 py-1 font-bold uppercase text-sm"
                                        />
                                        <div className="flex items-center space-x-2 ml-2">
                                            <button 
                                                onClick={() => togglePriorityWorker(worker)}
                                                className={`transition-colors ${priorityWorkers.includes(worker) ? 'text-yellow-500 fill-yellow-500' : 'text-zinc-300 hover:text-black'}`}
                                            >
                                                <Star size={16} fill={priorityWorkers.includes(worker) ? "currentColor" : "none"} />
                                            </button>
                                            <button 
                                                onClick={() => removeWorker(wIndex)}
                                                className="text-zinc-400 hover:text-red-600 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </td>
                                {tasks.map((_, tIndex) => (
                                    <td key={`cell-${wIndex}-${tIndex}`} className="border-b-[2px] border-r-[2px] border-zinc-200 p-0">
                                        <div className="relative flex items-center w-full h-full bg-transparent focus-within:bg-black focus-within:text-white transition-colors px-3 py-4">
                                            <input 
                                                type="number" 
                                                value={costMatrix[wIndex][tIndex]}
                                                onChange={e => updateCost(wIndex, tIndex, e.target.value)}
                                                className="w-full text-right bg-transparent focus:outline-none font-bold text-lg"
                                            />
                                            <span className="text-[10px] text-zinc-400 font-black ml-2 uppercase tracking-widest pointer-events-none group-focus-within:text-zinc-500">
                                                HRS
                                            </span>
                                        </div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-6 bg-zinc-50 border-t-[3px] border-black flex justify-between items-center">
                <div className="font-mono text-xs font-bold text-zinc-500 tracking-widest hidden sm:block">
                    [SYSTEM_READY]
                </div>
                <button 
                    onClick={handleCalculate}
                    disabled={isCalculating}
                    className="px-8 py-4 bg-black hover:bg-zinc-800 text-white font-mono font-black text-sm uppercase tracking-widest transition-all flex items-center disabled:opacity-50 disabled:cursor-not-allowed border-[2px] border-black shadow-[4px_4px_0px_transparent] focus:shadow-[4px_4px_0px_#4f46e5]"
                >
                    {isCalculating ? (calcStage || 'CALCULATING...') : 'EXECUTE OPTIMIZATION'}
                </button>
            </div>
        </div>
    );
};

export default MatrixInput;
