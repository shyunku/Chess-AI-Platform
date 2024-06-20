import { TeamType } from "scripts/chess/types";
import AI from "./AI";

// D0PieceProfitAI 는 상대와 나의 기물 가치를 모두 고려하여 최적의 수를 계산하는 AI (D0)입니다.
export default class D0PieceProfitAI extends AI {
  constructor() {
    super("D0PieceProfitAI");
  }

  /**
   *
   * @param {Board} board
   * @returns {Move} move
   */
  getMove(board, currentTeam) {
    const availablePieces = board.getTeamPieces(currentTeam);
    const availableMoves = [];
    for (const piece of availablePieces) {
      const moves = board.getAvailableMoves(piece, true);
      availableMoves.push(...moves);
    }

    for (const move of availableMoves) {
      const tempBoard = board.copy();
      tempBoard.movePiece(move);
      move.profit = this.getAdvantage(tempBoard, currentTeam);
    }

    availableMoves.sort((a, b) => b.profit - a.profit);
    const bestMoves = availableMoves.filter((move) => move.profit === availableMoves[0].profit);
    const bestMovePick = Math.floor(Math.random() * bestMoves.length);
    return { move: bestMoves[bestMovePick], moves: availableMoves };
  }
}
