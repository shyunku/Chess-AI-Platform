import Board from "scripts/chess/board";
import { TeamType } from "scripts/chess/types";

export default class AI {
  constructor(name) {
    this.name = name;
    this.advantageCache = {};
  }

  /**
   *
   * @param {Board} board
   * @returns {Move} move
   */
  getMove(board, currentTeam) {
    return null;
  }

  /**
   *
   * @param {Board} board
   * @param {string} currentTeam
   */
  getAdvantage(board, currentTeam) {
    const key = currentTeam + "|" + board.export();
    if (this.advantageCache[key] != null) {
      return this.advantageCache[key];
    }
    const opponentTeam = currentTeam === TeamType.WHITE ? TeamType.BLACK : TeamType.WHITE;
    const advantage = board.getTeamPieceValue(currentTeam) - board.getTeamPieceValue(opponentTeam);
    this.advantageCache[key] = advantage;
    return advantage;
  }
}
