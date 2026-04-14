/**
 * Hungarian Algorithm for Optimal Assignment (Min Cost)
 */

function solveOptimalAssignment(initialWorkers, initialTasks, initialCostMatrix, priorityWorkers = [], priorityTasks = [], urgentTasks = []) {
    if (initialWorkers.length === 0 || initialTasks.length === 0) {
        return { assignments: [], totalOptimalCost: 0, operations: 0 };
    }

    let workers = [...initialWorkers];
    let tasks = [...initialTasks];
    let costMatrix = initialCostMatrix.map(row => [...row]);

    let finalAssignments = [];
    let totalOptimalCost = 0;
    
    // ==========================================
    // 0. URGENCY HYBRID PRE-PROCESSOR (GREEDY)
    // ==========================================
    for (const urgentTask of urgentTasks) {
        const tIdx = tasks.indexOf(urgentTask);
        if (tIdx === -1) continue; // Already assigned or not found

        let minCost = Infinity;
        let bestWorkerIdx = -1;

        for (let w = 0; w < workers.length; w++) {
            let cellCost = parseInt(costMatrix[w][tIdx]);
            if (isNaN(cellCost)) cellCost = 0;
            if (cellCost < minCost) {
                minCost = cellCost;
                bestWorkerIdx = w;
            }
        }

        if (bestWorkerIdx !== -1) {
            // Lock Assignment
            finalAssignments.push({
                worker: workers[bestWorkerIdx],
                task: tasks[tIdx],
                cost: minCost
            });
            totalOptimalCost += minCost;

            // Delete specific worker and task
            workers.splice(bestWorkerIdx, 1);
            tasks.splice(tIdx, 1);
            costMatrix.splice(bestWorkerIdx, 1);
            for (let row of costMatrix) {
                row.splice(tIdx, 1);
            }
        }
    }

    // If all tasks or workers were handled greedily, return immediately
    if (workers.length === 0 || tasks.length === 0) {
        return { assignments: finalAssignments, totalOptimalCost };
    }

    const nWorkers = workers.length;
    const nTasks = tasks.length;
    let n = Math.max(nWorkers, nTasks);

    const HIGH_COST = 1e9;
    const SUPER_HIGH_COST = 1e11; // extreme punishment for defying priorites
    
    // 1. Pad matrix to make it square
    let matrix = [];
    for (let r = 0; r < n; r++) {
        matrix[r] = [];
        for (let c = 0; c < n; c++) {
            if (r < nWorkers && c < nTasks) {
                const cost = parseInt(costMatrix[r][c]);
                matrix[r][c] = isNaN(cost) ? 0 : cost;
            } else {
                let dynamicPaddingCost = HIGH_COST;
                // If this dummy padding removes a priority task (e.g. Worker is fake (r >= nWorkers) but matched to real priority task c)
                if (r >= nWorkers && c < nTasks && priorityTasks.includes(tasks[c])) {
                    dynamicPaddingCost = SUPER_HIGH_COST;
                }
                // If this dummy padding removes a priority worker (e.g. Task is fake (c >= nTasks) but matched to real priority worker r)
                if (c >= nTasks && r < nWorkers && priorityWorkers.includes(workers[r])) {
                    dynamicPaddingCost = SUPER_HIGH_COST;
                }
                matrix[r][c] = dynamicPaddingCost;
            }
        }
    }

    // Clone matrix to reference real costs later
    const originalMatrix = matrix.map(row => [...row]);

    // 2. Row reduction
    for (let r = 0; r < n; r++) {
        let minVal = Math.min(...matrix[r]);
        for (let c = 0; c < n; c++) {
            matrix[r][c] -= minVal;
        }
    }

    // 3. Column reduction
    for (let c = 0; c < n; c++) {
        let minVal = matrix[0][c];
        for (let r = 1; r < n; r++) {
            if (matrix[r][c] < minVal) minVal = matrix[r][c];
        }
        for (let r = 0; r < n; r++) {
            matrix[r][c] -= minVal;
        }
    }

    // Function to find maximum bipartite matching for zeros
    function getZeroMatching() {
        let matchR = new Array(n).fill(-1);
        let matchC = new Array(n).fill(-1);

        for (let r = 0; r < n; r++) {
            let visited = new Array(n).fill(false);
            function dfs(u) {
                for (let v = 0; v < n; v++) {
                    if (matrix[u][v] === 0 && !visited[v]) {
                        visited[v] = true;
                        if (matchC[v] < 0 || dfs(matchC[v])) {
                            matchC[v] = u;
                            matchR[u] = v;
                            return true;
                        }
                    }
                }
                return false;
            }
            dfs(r);
        }
        return { matchR, matchC };
    }

    let matching = getZeroMatching();
    let assignments = matching.matchR;

    while (true) {
        let matchedCount = 0;
        for (let r = 0; r < n; r++) {
            if (assignments[r] !== -1) matchedCount++;
        }

        // Output complete if all are matched
        if (matchedCount === n) {
            break;
        }

        // Min Vertex Cover to find the minimum number of lines
        // 1. Mark all unmatched rows
        let markedRows = new Set();
        let markedCols = new Set();
        let q = [];

        for (let r = 0; r < n; r++) {
            if (assignments[r] === -1) {
                markedRows.add(r);
                q.push({ type: 'row', idx: r });
            }
        }

        while (q.length > 0) {
            let curr = q.shift();
            if (curr.type === 'row') {
                let r = curr.idx;
                for (let c = 0; c < n; c++) {
                    if (matrix[r][c] === 0 && !markedCols.has(c)) {
                        markedCols.add(c);
                        q.push({ type: 'col', idx: c });
                    }
                }
            } else {
                let c = curr.idx;
                let r = matching.matchC[c];
                if (r !== -1 && !markedRows.has(r)) {
                    markedRows.add(r);
                    q.push({ type: 'row', idx: r });
                }
            }
        }

        // Lines: Unmarked rows + Marked columns
        let rowCover = new Array(n).fill(true);
        for (let r of markedRows) rowCover[r] = false;
        let colCover = new Array(n).fill(false);
        for (let c of markedCols) colCover[c] = true;

        // Find smallest uncovered number
        let minUncovered = Infinity;
        for (let r = 0; r < n; r++) {
            for (let c = 0; c < n; c++) {
                if (!rowCover[r] && !colCover[c]) {
                    if (matrix[r][c] < minUncovered) {
                        minUncovered = matrix[r][c];
                    }
                }
            }
        }

        // Step: adjust matrix
        for (let r = 0; r < n; r++) {
            for (let c = 0; c < n; c++) {
                if (!rowCover[r] && !colCover[c]) {
                    matrix[r][c] -= minUncovered; // Uncovered
                } else if (rowCover[r] && colCover[c]) {
                    matrix[r][c] += minUncovered; // Double covered
                }
            }
        }

        // Re-evaluate matching
        matching = getZeroMatching();
        assignments = matching.matchR;
    }

    // Construct Results
    for (let r = 0; r < n; r++) {
        let c = assignments[r];
        if (r < nWorkers && c < nTasks) {
            let cost = originalMatrix[r][c];
            finalAssignments.push({
                worker: workers[r],
                task: tasks[c],
                cost: cost
            });
            totalOptimalCost += cost;
        } else if (r < nWorkers && c >= nTasks) {
            // Worker assigned to dummy task
            finalAssignments.push({
                worker: workers[r],
                task: "Unassigned",
                cost: 0
            });
        } else if (r >= nWorkers && c < nTasks) {
            // Dummy worker assigned to real task -> Task is Unassigned
            finalAssignments.push({
                worker: "Unassigned",
                task: tasks[c],
                cost: 0
            });
        }
    }

    return { assignments: finalAssignments, totalOptimalCost };
}

function solveWorstCaseAssignment(workers, tasks, costMatrix, priorityWorkers = [], priorityTasks = [], urgentTasks = []) {
    if (workers.length === 0 || tasks.length === 0) {
        return 0;
    }

    const nWorkers = workers.length;
    const nTasks = tasks.length;
    let n = Math.max(nWorkers, nTasks);

    // Find the absolute maximum value in the matrix to invert it
    let maxVal = -Infinity;
    for (let r = 0; r < nWorkers; r++) {
        for (let c = 0; c < nTasks; c++) {
            const cost = parseInt(costMatrix[r][c]);
            if (!isNaN(cost) && cost > maxVal) {
                maxVal = cost;
            }
        }
    }
    
    // If matrix is empty or maxVal is invalid
    if (maxVal === -Infinity) maxVal = 0;

    // Create an inverted matrix for the max-cost bipartite matching
    let invertedMatrix = [];
    for (let r = 0; r < nWorkers; r++) {
        invertedMatrix[r] = [];
        for (let c = 0; c < nTasks; c++) {
            const cost = parseInt(costMatrix[r][c]);
            let parsedCost = isNaN(cost) ? 0 : cost;
            // Invert the cost
            invertedMatrix[r][c] = maxVal - parsedCost;
        }
    }

    // Call our existing minimum cost algorithm on the inverted matrix
    const invertedResult = solveOptimalAssignment(workers, tasks, invertedMatrix, priorityWorkers, priorityTasks, urgentTasks);

    // The maximum possible cost is derived by reversing the inversion arithmetic
    let totalWorstCost = 0;
    invertedResult.assignments.forEach(assignment => {
        let workerIndex = workers.indexOf(assignment.worker);
        let taskIndex = tasks.indexOf(assignment.task);
        if (workerIndex !== -1 && taskIndex !== -1) {
             // Retrieve original cost
             const originalCost = parseInt(costMatrix[workerIndex][taskIndex]);
             totalWorstCost += isNaN(originalCost) ? 0 : originalCost;
        }
    });

    return totalWorstCost;
}

module.exports = { solveOptimalAssignment, solveWorstCaseAssignment };
