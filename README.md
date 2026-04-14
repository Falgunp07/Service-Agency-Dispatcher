# ⚡ Service Agency Dispatcher

**A high-performance algorithmic dispatch solver and interactive dashboard for optimal resource matrix management.**

This platform was built to solve the **Optimal Assignment Problem** via mathematical combinatorics. By leveraging the **Hungarian Algorithm O(n³)**, the backend calculates the absolute cheapest and most time-efficient pairings of Workers to Tasks.

---

## 🛠️ Tech Stack
* **Frontend:** React.js, Vite, Tailwind CSS (v4), Lucide Icons
* **Backend:** Node.js, Express.js
* **Logic:** Custom Implementation of Hungarian Algorithm (Bipartite Min-Cost Matching) 
* **Design:** Brutalist High-end Light Theme, Pure Monospace Data Rendering.

---

## 🔥 Key Features

### 1. The Interactive Dashboard
* Fully dynamic 7x7 input matrix (extendable infinitely).
* Interactive 'Sandbox' Results block: Manually swap assignments via dropdowns to immediately recalculate exact cost impact and see how much worse it performs against the optimal mathematical algorithm.

### 2. The Hybrid Execution Engine
We designed a dual-algorithmic system to handle complex constraints, featuring two different priority states:

* ⭐ **Guarantee Priority (Star)**: Forces the algorithm to assign this task or worker. If there are more tasks than workers mathematically available, it usually drops expensive tasks. Flagging this forces the algorithm to stomach the cost and keep it assigned!
* ⚡ **Urgent Priority (Lightning)**: Skips the Hungarian algorithm completely. The backend fires a greedy pre-processor loop to find the absolute physically fastest worker for this task, locks them immediately, deletes them from the matrix, and lets the Hungarian Algorithm clean up whatever is left.

---

## 🚀 How to Run Locally

This is a Monorepo design containing two independent servers running simultaneously. 

### Step 1: Start the Backend Layer
```bash
cd backend
npm install
npm run dev
```

### Step 2: Start the Frontend Interface
```bash
cd frontend
npm install
npm run dev
```

The UI will boot up securely at `http://localhost:5173`. Select your logic constraints and hit **Execute**.
