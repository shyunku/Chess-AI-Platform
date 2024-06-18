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
    const opponentTeam = currentTeam === TeamType.WHITE ? TeamType.BLACK : TeamType.WHITE;
    const availablePieces = board.getTeamPieces(currentTeam);
    const availableMoves = [];
    for (const piece of availablePieces) {
      const moves = board.getAvailableMoves(piece, true);
      availableMoves.push(...moves);
    }

    for (const move of availableMoves) {
      const tempBoard = board.copy();
      tempBoard.movePiece(move);
      move.profit = -this.alphaBeta(tempBoard, this.depth - 1, -Infinity, Infinity, opponentTeam, currentTeam);
    }

    availableMoves.sort((a, b) => b.profit - a.profit);
    const bestMoves = availableMoves.filter((move) => move.profit === availableMoves[0].profit);
    const bestMovePick = Math.floor(Math.random() * bestMoves.length);
    return { move: bestMoves[bestMovePick], moves: availableMoves };
  }

  alphaBeta(board, depth, alpha, beta, currentTeam, opponentTeam) {
    if (depth === 0) {
      return board.getTeamPieceValue(currentTeam) - board.getTeamPieceValue(opponentTeam);
    }

    const availablePieces = board.getTeamPieces(currentTeam);
    const availableMoves = [];
    for (const piece of availablePieces) {
      const moves = board.getAvailableMoves(piece, this.me === currentTeam);
      availableMoves.push(...moves);
    }

    let bestProfit = -Infinity;
    for (const move of availableMoves) {
      const tempBoard = board.copy();
      tempBoard.movePiece(move);
      const profit = -this.alphaBeta(tempBoard, depth - 1, -beta, -alpha, opponentTeam, currentTeam);
      bestProfit = Math.max(bestProfit, profit);
      alpha = Math.max(alpha, profit);
      if (alpha >= beta) {
        break;
      }
    }

    return bestProfit;
  }
}
