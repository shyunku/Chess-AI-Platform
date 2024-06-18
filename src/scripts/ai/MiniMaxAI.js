import { TeamType } from "scripts/chess/types";
import AI from "./AI";

// MiniMaxAI 는 MinMax 알고리즘을 사용하여 최적의 수를 계산하는 AI입니다.
export default class MiniMaxAI extends AI {
  constructor(depth = 2) {
    super(`MiniMaxAI (depth: ${depth})`);
    this.depth = depth;
    this.me = null;
    this.debug = false;
  }

  /**
   *
   * @param {Board} board
   * @returns {Move} move
   */
  getMove(board, currentTeam) {
    this.me = currentTeam;
    this.map = {};

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
      this.map[move.toString()] = {};
      move.profit = -this.minMax(tempBoard, this.depth - 1, opponentTeam, currentTeam, this.map[move.toString()]);
      this.map[move.toString()].profit = move.profit;
    }

    if (this.debug) console.log(this.map);

    availableMoves.sort((a, b) => b.profit - a.profit);
    const bestMoves = availableMoves.filter((move) => move.profit === availableMoves[0].profit);
    const bestMovePick = Math.floor(Math.random() * bestMoves.length);
    return { move: bestMoves[bestMovePick], moves: availableMoves };
  }

  minMax(board, depth, currentTeam, opponentTeam, node) {
    if (depth === 0) {
      node.profit = board.getTeamPieceValue(currentTeam) - board.getTeamPieceValue(opponentTeam);
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
      node[move.toString()] = {};
      const profit = -this.minMax(tempBoard, depth - 1, opponentTeam, currentTeam, node[move.toString()]);
      node[move.toString()].profit = profit;
      bestProfit = Math.max(bestProfit, profit);
    }

    return bestProfit;
  }
}
