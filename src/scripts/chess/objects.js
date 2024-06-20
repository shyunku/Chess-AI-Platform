export class Move {
  constructor(ox, oy, x, y) {
    this.ox = ox;
    this.oy = oy;
    this.x = x;
    this.y = y;
  }

  toString() {
    return `${this.ox},${this.oy} -> ${this.x},${this.y}`;
  }
}

export const normalizeMoves = (moves) => {
  let maxProfit = -Infinity;
  let minProfit = Infinity;

  for (const move of moves) {
    const profit = move.profit;
    if (profit > maxProfit) {
      maxProfit = profit;
    }
    if (profit < minProfit) {
      minProfit = profit;
    }
  }

  let sumProfit = 0;
  for (const move of moves) {
    if (maxProfit === minProfit) {
      move.nProfit = 1;
      continue;
    }
    move.optimal = maxProfit === move.profit;
    move.nProfit = (move.profit - minProfit) / (maxProfit - minProfit);
    sumProfit += move.nProfit;
  }

  for (const move of moves) {
    move.nProfit /= sumProfit;
  }

  return moves;
};
