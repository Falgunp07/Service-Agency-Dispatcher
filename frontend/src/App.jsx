import React, { useState } from 'react';
import MatrixInput from './components/MatrixInput';
import ResultsView from './components/ResultsView';
import { optimizeAssignments } from './services/api';
import { LayoutGrid, Layers } from 'lucide-react';

function App() {
    const [results, setResults] = useState(null);
    const [payloadBackup, setPayloadBackup] = useState(null);
    const [isCalculating, setIsCalculating] = useState(false);
    const [calcStage, setCalcStage] = useState('');
    const [error, setError] = useState(null);

    const handleCalculate = async (payload) => {
        setIsCalculating(true);
        setError(null);
        setResults(null);
        setPayloadBackup(payload);
        
        try {
            setCalcStage('Compiling Matrix Tensors...');
            const data = await optimizeAssignments(payload);
            
            // Introduce artificial delay to showcase simulation
            setTimeout(() => setCalcStage('Calculating Bipartite Mappings...'), 1000);
            setTimeout(() => setCalcStage(`Running ${data.metadata.operations.toLocaleString()} Operations...`), 2000);
            
            setTimeout(() => {
                setResults(data);
                setIsCalculating(false);
                setCalcStage('');
            }, 3500);

        } catch (err) {
            setError(err.response?.data?.error || err.message || "An error occurred while connecting to the backend.");
            setIsCalculating(false);
            setCalcStage('');
        }
    };

    return (
        <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-12 selection:bg-black selection:text-white">
            <div className="max-w-7xl mx-auto space-y-12">
                
                <header className="flex flex-col md:flex-row md:items-end justify-between border-b-[3px] border-black pb-8 mb-12">
                    <div>
                        <div className="inline-block bg-black text-white px-2 py-1 text-xs font-mono font-bold tracking-widest uppercase mb-4">
                            SYS.DISPATCH.OPTIMIZER
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-black tracking-tighter leading-none">
                            Optimal<br/>Assignment<span className="text-zinc-400">.</span>Engine
                        </h1>
                    </div>
                    <div className="mt-6 md:mt-0 max-w-xs text-right">
                        <p className="text-zinc-600 font-mono text-sm leading-relaxed">
                            Bipartite deterministic mapping matrices utilizing custom O(n³) Hungarian combinatorial architecture.
                        </p>
                    </div>
                </header>

                <main>
                    {error && (
                        <div className="mb-8 p-4 border-[2px] border-red-600 bg-red-50 text-red-700 font-mono text-sm font-bold uppercase">
                            [ERR] {error}
                        </div>
                    )}
                    
                    <MatrixInput onCalculate={handleCalculate} isCalculating={isCalculating} calcStage={calcStage} />
                    
                    {results && <ResultsView results={results} payload={payloadBackup} />}
                </main>
                
            </div>
        </div>
    );
}

export default App;
