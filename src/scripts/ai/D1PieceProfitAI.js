import { TeamType } from "scripts/chess/types";
import AI from "./AI";

// D1PieceProfitAI 는 상대와 나의 기물 가치를 모두 고려하여 최적의 수를 계산하는 AI (D1)입니다.
export class D1PieceProfitAI extends AI {
  constructor() {
    super("D1PieceProfitAI");
  }

  /**
   *
   * @param {Board} board
   * @returns {Move} move
   */
  getMove(board, currentTeam) {
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

      const d2Pieces = tempBoard.getTeamPieces(opponentTeam);
      const d2Moves = [];
      for (const piece of d2Pieces) {
        const moves = tempBoard.getAvailableMoves(piece);
        d2Moves.push(...moves);
      }

      for (const d2Move of d2Moves) {
        const d2TempBoard = tempBoard.copy();
        d2TempBoard.movePiece(d2Move);
        d2Move.profit = this.getAdvantage(d2TempBoard, opponentTeam);
      }

      // suppose the opponent will make the best move
      d2Moves.sort((a, b) => b.profit - a.profit);
      const oppBestMove = d2Moves[0];
      move.profit = -oppBestMove.profit;
      move.oppMoves = d2Moves;
      console.log(move, d2Moves);
    }

    availableMoves.sort((a, b) => b.profit - a.profit);
    const bestMoves = availableMoves.filter((move) => move.profit === availableMoves[0].profit);
    const bestMovePick = bestMoves[Math.floor(Math.random() * bestMoves.length)];
    console.log(bestMovePick, bestMovePick.oppMoves);
    return { move: bestMovePick, moves: availableMoves };
  }
}
