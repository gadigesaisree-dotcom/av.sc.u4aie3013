# Vehicle Maintenance Scheduling System

## Problem Statement
We need to efficiently schedule vehicle maintenance tasks across multiple depots. Each depot has a fixed amount of available mechanic hours. Each maintenance task requires a specific duration to complete and provides a certain operational impact (value) when finished. Since we cannot partially complete a maintenance task, we must decide either to fully schedule it or skip it entirely. Our objective is to select a subset of tasks for each depot such that we maximize the total operational impact without exceeding the depot's available mechanic hours.

## Tech Stack
| Component       | Technology        |
|-----------------|-------------------|
| Runtime         | Node.js           |
| Framework       | Express.js        |
| HTTP Client     | Axios             |
| Algorithm       | Dynamic Programming (0/1 Knapsack) |

## Algorithm Explanation
This problem is essentially a variation of the classic 0/1 Knapsack problem. 
- **Items**: Vehicle maintenance tasks
- **Weight**: Task duration (in mechanic hours)
- **Value**: Task impact score
- **Capacity**: Depot's total available mechanic hours

### DP Recurrence Relation
We create a 2D table `dp[i][w]`, where `i` represents considering the first `i` tasks, and `w` represents the capacity in minutes (we multiply hours by 60 to allow integer indexing for fractional hours).
The recurrence relation is:
- If we skip task `i`: `dp[i][w] = dp[i-1][w]`
- If we include task `i`: `dp[i][w] = Math.max(dp[i-1][w], dp[i-1][w - weight_i] + value_i)`

We take the maximum of these two choices whenever `weight_i <= w`.

### Backtracking
Once the `dp` table is filled, the maximum impact is at `dp[n][W]`. To figure out *which* tasks were chosen to achieve this value, we work backwards from `dp[n][W]`. If `dp[i][w] !== dp[i-1][w]`, it means task `i` was included in the optimal set. We then subtract its weight from `w` and continue checking `i-1`.

### Complexity
- **Time Complexity**: `O(n × W)`, where `n` is the number of tasks and `W` is the depot capacity in minutes.
- **Space Complexity**: `O(n × W)` due to the 2D DP table.

## Folder Structure
```
vehicle_scheduling/
├── logs/
│   └── app.log
├── middleware/
│   └── logger.js
├── routes/
│   └── scheduleRoutes.js
├── services/
│   └── schedulerService.js
├── utils/
│   └── knapsack.js
├── .env
├── .gitignore
├── index.js
├── package.json
└── README.md
```

## Setup Instructions
1. **Clone the repository**: Download the code to your local machine.
2. **Install dependencies**: Run `npm install`.
3. **Configure environment**: Create a `.env` file (or adjust the existing one) with the following values:
   ```env
   PORT=3000
   DEPOTS_API=http://20.207.122.201/evaluation-service/depots
   VEHICLES_API=http://20.207.122.201/evaluation-service/vehicles
   TOKEN=YOUR_TOKEN
   ```
4. **Start the server**: Run `npm start` (or `npm run dev` for nodemon).

## API Endpoint Documentation

### `GET /api/schedule`
Calculates and returns the optimal maintenance schedule per depot.

**Sample Request**:
```bash
curl http://localhost:3000/api/schedule
```

**Sample Response**:
```json
[
  {
    "depotId": "D1",
    "mechanicHours": 40,
    "usedHours": 39.5,
    "remainingHours": 0.5,
    "totalImpact": 1500,
    "selectedTasks": [
      {
        "id": "T10",
        "duration": 20,
        "impactScore": 800
      },
      {
        "id": "T12",
        "duration": 19.5,
        "impactScore": 700
      }
    ]
  }
]
```

## Logs & Debugging
All application logs are written to `logs/app.log`. `console.log` is strictly avoided in this codebase.
| Level | Purpose |
|-------|---------|
| INFO  | Normal operations (requests, API calls, process completions) |
| WARN  | Expected but unusual events (like 404 routes) |
| ERROR | Unexpected failures or missing environment configuration |
| DEBUG | Fine-grained data for deep debugging |

## Submission Tips
1. Double-check that your `.env` contains the correct `TOKEN` before running the API.
2. The server will exit immediately if required environment variables are missing; verify the logs in `logs/app.log` if the app won't start.
3. Review the internal hours-to-minutes conversion in `knapsack.js` if you introduce task durations with high-precision decimals.
4. When deploying, ensure the `logs/` directory has proper write permissions or let the app create it.
5. You can test connectivity without external APIs via the `GET /api/health` endpoint.
