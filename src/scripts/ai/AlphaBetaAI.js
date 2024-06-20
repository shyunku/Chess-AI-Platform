import { TeamType } from "scripts/chess/types";
import AI from "./AI";

// AlphaBetaAI 는 Alpha-Beta 가지치기 알고리즘을 사용하여 최적의 수를 계산하는 AI입니다.
export default class AlphaBetaAI extends AI {
  constructor(depth = 3) {
    super(`AlphaBetaAI (depth: ${depth})`);
    this.depth = depth;
    this.me = null;
  }

  /**
   *
   * @param {Board} board
   * @returns {Move} move
   */
  getMove(board, currentTeam) {
    this.me = currentTeam;
    this.breaked = {};
    const opponentTeam = currentTeam === TeamType.WHITE ? TeamType.BLACK : TeamType.WHITE;
    const availablePieces = board.getTeamPieces(currentTeam);
    const availableMoves = [];
    for (const piece of availablePieces) {
      const moves = board.getAvailableMoves(piece, true);
      availableMoves.push(...moves);
    }

    let idx = 0;
    for (const move of availableMoves) {
      const tempBoard = board.copy();
      tempBoard.movePiece(move);
      move.profit = -this.alphaBeta(tempBoard, this.depth - 1, -Infinity, Infinity, opponentTeam, currentTeam);
      console.log(`${idx++}/${availableMoves.length}`, move);
    }

    availableMoves.sort((a, b) => b.profit - a.profit);
    const bestMoves = availableMoves.filter((move) => move.profit === availableMoves[0].profit);
    const bestMovePick = Math.floor(Math.random() * bestMoves.length);

    console.log("breaked", this.breaked);
    return { move: bestMoves[bestMovePick], moves: availableMoves };
  }

  alphaBeta(board, depth, alpha, beta, currentTeam, opponentTeam) {
    if (depth === 0 || board.isGameOver()) {
      return this.getAdvantage(board, currentTeam);
    }

    const availablePieces = board.getTeamPieces(currentTeam);
    const availableMoves = [];
    for (const piece of availablePieces) {
      const moves = board.getAvailableMoves(piece, this.me === currentTeam);
      availableMoves.push(...moves);
    }

    availableMoves.sort((a, b) => this.getMoveValue(board, b) - this.getMoveValue(board, a)); // 이동을 정렬하여 가지치기를 더 효과적으로 만듭니다.

    let bestProfit = -Infinity;
    for (const move of availableMoves) {
      const tempBoard = board.copy();
      tempBoard.movePiece(move);
      const profit = -this.alphaBeta(tempBoard, depth - 1, -beta, -alpha, opponentTeam, currentTeam);
      bestProfit = Math.max(bestProfit, profit);
      alpha = Math.max(alpha, profit);
      if (alpha >= beta) {
        this.breaked[depth] = this.breaked[depth] ?? 0;
        this.breaked[depth]++;
        break;
      }
    }

    return bestProfit;
  }

  getMoveValue(board, move) {
    // 이동의 가치를 평가하는 함수로, 향후 가지치기를 최적화하기 위해 사용됩니다.
    const tempBoard = board.copy();
    tempBoard.movePiece(move);
    return this.getAdvantage(tempBoard, this.me);
  }
}
