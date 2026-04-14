const express = require('express');
const cors = require('cors');
const { solveOptimalAssignment, solveWorstCaseAssignment } = require('./utils/hungarian');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.post('/api/optimize', (req, res) => {
    try {
        const { workers, tasks, costMatrix, priorityWorkers = [], priorityTasks = [], urgentTasks = [] } = req.body;

        if (!workers || !tasks || !costMatrix) {
            return res.status(400).json({ error: 'Missing workers, tasks, or costMatrix' });
        }

        const result = solveOptimalAssignment(workers, tasks, costMatrix, priorityWorkers, priorityTasks, urgentTasks);
        const worstCaseCost = solveWorstCaseAssignment(workers, tasks, costMatrix, priorityWorkers, priorityTasks, urgentTasks);
        
        res.json({
            ...result,
            worstCaseCost,
            timeSaved: worstCaseCost - result.totalOptimalCost,
            metadata: {
                complexity: "O(n³)",
                operations: Math.pow(Math.max(workers.length, tasks.length), 3) * 2
            }
        });
    } catch (error) {
        console.error("Optimization Error:", error);
        res.status(500).json({ error: 'Internal Server Error during optimization' });
    }
});

app.listen(PORT, () => {
    console.log(`Backend Dispatcher API running natively on http://localhost:${PORT}`);
});
