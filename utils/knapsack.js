/**
 * 0/1 Knapsack dynamic programming implementation for vehicle scheduling.
 * @param {Array} tasks - List of vehicle tasks with duration (hours) and impactScore.
 * @param {number} capacityHours - Total available mechanic hours at a depot.
 * @returns {Object} The best selection of tasks and overall stats.
 */
const knapsack = (tasks, capacityHours) => {
  // Convert hours to minutes to allow fractional hours (e.g. 1.5h) and integer array indexing.
  const W = Math.round(capacityHours * 60);
  const n = tasks.length;

  // Initialize DP table with zeros
  // dp[i][w] represents the max impact using the first i tasks within w minutes of capacity.
  const dp = Array.from({ length: n + 1 }, () => Array(W + 1).fill(0));

  // Build the DP table
  for (let i = 1; i <= n; i++) {
    const task = tasks[i - 1];
    const taskMinutes = Math.round(task.duration * 60);
    const impact = task.impactScore;

    for (let w = 0; w <= W; w++) {
      if (taskMinutes <= w) {
        // Can include this task: max of including it vs excluding it
        dp[i][w] = Math.max(
          dp[i - 1][w],
          dp[i - 1][w - taskMinutes] + impact
        );
      } else {
        // Cannot include it, carry over previous best
        dp[i][w] = dp[i - 1][w];
      }
    }
  }

  // Backtracking to find which items were selected
  const selectedTasks = [];
  let w = W;
  let usedMinutes = 0;

  for (let i = n; i > 0 && w > 0; i--) {
    // If the value changed, we must have included the item
    if (dp[i][w] !== dp[i - 1][w]) {
      const task = tasks[i - 1];
      selectedTasks.push(task);
      const taskMinutes = Math.round(task.duration * 60);
      w -= taskMinutes;
      usedMinutes += taskMinutes;
    }
  }

  const totalImpact = dp[n][W];
  
  return {
    selectedTasks,
    totalImpact,
    usedHours: usedMinutes / 60,
    remainingHours: (W - usedMinutes) / 60
  };
};

module.exports = { knapsack };
