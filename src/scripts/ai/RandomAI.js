import AI from "./AI";

export default class RandomAI extends AI {
  constructor() {
    super("Random AI");
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
      const moves = board.getAvailableMoves(piece);
      availableMoves.push(...moves);
    }

    const movePick = Math.floor(Math.random() * availableMoves.length);
    const move = availableMoves[movePick];
    return { move, moves: [] };
  }
}
